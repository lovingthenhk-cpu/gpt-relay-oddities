'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');

const source = fs.readFileSync('exhibits/meeting-escape.js', 'utf8');

function newGame() {
  class Element {
    constructor() {
      this.textContent = '';
      this.value = '';
      this.disabled = false;
      this.style = {};
      this.dataset = {};
      this.children = [];
      this.listeners = {};
      this.attributes = {};
    }
    addEventListener(name, fn) { this.listeners[name] = fn; }
    click() { if (!this.disabled && this.listeners.click) this.listeners.click(); }
    focus() { this.focused = true; }
    setAttribute(name, value) { this.attributes[name] = value; }
    appendChild(node) { this.children.push(node); }
    replaceChildren(...nodes) {
      this.children = nodes;
      this.textContent = nodes.map(node => node.textContent ?? '').join('');
    }
  }
  const ids = Object.fromEntries([
    'agenda', 'start', 'reset', 'phase', 'clarity-text', 'clarity-meter',
    'clarity-bar', 'debt', 'minutes', 'turn', 'outcome', 'log'
  ].map(id => [id, new Element()]));
  const moves = ['focus', 'research', 'reschedule'].map(action => {
    const button = new Element();
    button.dataset.move = action;
    return button;
  });
  const document = {
    getElementById: id => ids[id],
    querySelectorAll: selector => {
      assert.equal(selector, '[data-move]');
      return moves;
    },
    createElement: () => new Element(),
    createTextNode: str => ({textContent: str})
  };
  vm.runInNewContext(source, {document}, {filename: 'meeting-escape.js'});
  return {ids, moves, doMove: action => moves.find(x => x.dataset.move === action).click()};
}

test('the shortest focused route escapes in three meetings', () => {
  const g = newGame();
  g.ids.agenda.value = '議題テスト';
  g.ids.start.click();
  for (let i = 0; i < 3; i++) g.doMove('focus');
  assert.match(g.ids.outcome.textContent, /脱出成功/);
  assert.equal(g.ids['clarity-text'].textContent, '6 / 6');
  assert.equal(g.ids.debt.textContent, '0 件');
  assert.equal(g.ids.minutes.textContent, '45 分');
  assert.equal(g.ids['clarity-meter'].attributes['aria-valuenow'], '6');
  assert.ok(g.moves.every(b => b.disabled));
});

test('three reschedules always end the meeting without negative score', () => {
  const g = newGame();
  g.ids.start.click();
  for (let i = 0; i < 3; i++) g.doMove('reschedule');
  assert.match(g.ids.outcome.textContent, /期限切れ/);
  assert.equal(g.ids['clarity-text'].textContent, '0 / 6');
  assert.equal(g.ids.debt.textContent, '6 件');
  assert.equal(g.ids.minutes.textContent, '180 分');
  assert.ok(g.moves.every(b => b.disabled));
});

test('reset restores the initial state and the input is never inserted as HTML', () => {
  const g = newGame();
  g.ids.agenda.value = '<img src=x onerror=alert(1)>';
  g.ids.start.click();
  assert.match(g.ids.outcome.textContent, /<img src=x onerror=alert\(1\)>/);
  g.doMove('research');
  assert.equal(g.ids['clarity-text'].textContent, '1 / 6');
  assert.equal(g.ids.debt.textContent, '4 件');
  g.ids.reset.click();
  assert.equal(g.ids['clarity-text'].textContent, '0 / 6');
  assert.equal(g.ids.debt.textContent, '3 件');
  assert.equal(g.ids.agenda.value, '');
  assert.equal(g.ids.agenda.disabled, false);
  assert.ok(g.moves.every(b => b.disabled));
  assert.equal(g.ids.agenda.focused, true);
});

test('eight indecisive rounds force a terminal state', () => {
  const g = newGame();
  g.ids.start.click();
  for (let i = 0; i < 8; i++) g.doMove('research');
  assert.match(g.ids.outcome.textContent, /期限切れ/);
  assert.equal(g.ids.turn.textContent, '8 回');
  assert.ok(g.moves.every(b => b.disabled));
});
