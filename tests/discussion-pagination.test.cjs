'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const code = fs.readFileSync('app.js', 'utf8');

class Element {
  constructor(name = '') {
    this.name = name;
    this.children = [];
    this.textContent = '';
    this.className = '';
    this.dataset = {};
    this.hidden = false;
    this.disabled = false;
    this.style = {};
    this.listeners = {};
  }
  addEventListener(type, handler) { this.listeners[type] = handler; }
  click() {
    if (!this.disabled) return this.listeners.click?.();
  }
  setAttribute() {}
  append(...items) { this.children.push(...items); }
  appendChild(item) { this.children.push(item); }
  replaceChildren(...items) { this.children = [...items]; }
  querySelector(selector) {
    return selector === '.empty-state'
      ? this.children.find(x => x.className === 'empty-state') ?? null : null;
  }
  remove() { this.removed = true; }
}
const issue = {body:'[GPT-A] agenda',created_at:'2026-11-02T14:00:00Z',user:{login:'author'}};
const comment = (id, speaker='GPT-C') =>
  ({body:`[${speaker}] comment ${id}`,created_at:'2026-11-02T14:00:00Z',user:{login:'author'}});

function harness(pages, opts = {}) {
  const elements = new Map();
  const ids = ['excuse-button','excuse-output','word-button','word-output',
    'clock-button','clock-output','clock-note','poll-result','meeting-state','messages',
    'refresh-discussion','load-more-discussion','clear-vote'];
  for (const id of ids) elements.set(id, new Element(id));
  const document = {
    getElementById: id => {
      assert.ok(elements.has(id), `unknown id ${id}`);
      return elements.get(id);
    },
    querySelectorAll: () => [],
    createElement: () => new Element()
  };
  const requests = [];
  let failPage = opts.failPage || 0;
  const fetch = async url => {
    requests.push(url);
    if (url.endsWith('/issues/1')) {
      return {ok:true,status:200,json:async () => issue};
    }
    const page = Number(new URL(url).searchParams.get('page'));
    if (page === failPage) {
      failPage = 0;
      return {ok:false,status:500,json:async()=>null};
    }
    const comments = pages[page] ?? [];
    return {
      ok:true,status:200,
      headers:{get: name => name === 'link' ? (pages[page+1]
        ? `<https://api.github.com/...&page=${page+1}>; rel="next"` : null) : null},
      json:async () => comments
    };
  };
  vm.runInNewContext(code,{
    document,fetch,Date,Intl,Math,setInterval(){},localStorage:{getItem(){return null;}},
  },{filename:'app.js'});
  return {elements,requests};
}
const settle = async () => {
  for (let i=0;i<6;i++) await new Promise(resolve=>setImmediate(resolve));
};

test('first load retrieves exactly one comments page and an issue',async ()=>{
  const p={1:Array.from({length:100},(_,i)=>comment(i)) ,2:[comment(100,'GPT-B')]};
  const h=harness(p);
  await settle();
  assert.equal(h.requests.length,2);
  assert.match(h.requests[1],/page=1/);
  assert.equal(h.elements.get('messages').children.length,101);
  assert.equal(h.elements.get('load-more-discussion').hidden,false);
  assert.match(h.elements.get('meeting-state').textContent,/100 件/);
  h.elements.get('load-more-discussion').click();
  await settle();
  assert.equal(h.elements.get('messages').children.length,102);
  assert.equal(h.elements.get('load-more-discussion').hidden,true);
  assert.match(h.elements.get('meeting-state').textContent,/101 件/);
});

test('a failed continuation can be retried without losing earlier comments',async ()=>{
  const p={1:Array.from({length:100},(_,i)=>comment(i)),2:[comment(100)]};
  const h=harness(p,{failPage:2});
  await settle();
  h.elements.get('load-more-discussion').click();
  await settle();
  assert.equal(h.elements.get('messages').children.length,101);
  assert.match(h.elements.get('meeting-state').textContent,/再試行/);
  assert.equal(h.elements.get('load-more-discussion').disabled,false);
  h.elements.get('load-more-discussion').click();
  await settle();
  assert.equal(h.elements.get('messages').children.length,102);
  assert.equal(h.elements.get('load-more-discussion').hidden,true);
});

test('refresh starts from the first page without duplicate messages',async ()=>{
  const h=harness({1:[comment(1,'GPT-B')]});
  await settle();
  assert.equal(h.elements.get('messages').children.length,2);
  assert.equal(h.elements.get('load-more-discussion').hidden,true);
  h.elements.get('refresh-discussion').click();
  await settle();
  assert.equal(h.elements.get('messages').children.length,2);
  assert.equal(h.requests.length,4);
  assert.match(h.elements.get('meeting-state').textContent,/1 件/);
});
