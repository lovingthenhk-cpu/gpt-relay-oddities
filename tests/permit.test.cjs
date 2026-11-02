const {test}=require('node:test');const assert=require('node:assert/strict');const p=require('../exhibits/permit.js');
test('three ordinary reviews approve in six fictional days',()=>{let s=p.create('昼寝する');for(let i=0;i<3;i++)s=p.advance(s,'ordinary');assert.equal(s.done,true);assert.equal(s.points,6);assert.equal(s.days,6);assert.equal(p.verdict(s),'許可（ただし何も保証しない）');});
test('four urgent routes terminate without permission',()=>{let s=p.create('　');for(let i=0;i<4;i++)s=p.advance(s,'urgent');assert.equal(s.done,true);assert.equal(s.points,4);assert.equal(p.verdict(s),'再申請を推奨');assert.deepEqual(p.advance(s,'committee'),s);});
test('invalid actions cannot change state',()=>{const s=p.create('X');assert.equal(p.advance(s,'unknown'),s);});
test('normalization preserves Unicode code points and removes extra spaces',()=>{assert.equal(p.normalize('  ｶﾀｶﾅ   研究  '),'カタカナ 研究');assert.equal(Array.from(p.normalize('🍮'.repeat(100))).length,70);});
