'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const wave = require('../exhibits/silent-wave-core.js');
const close = (a,b) => assert.ok(Math.abs(a-b)<1e-9, `${a} != ${b}`);

test('sine and triangle have correct quadrature and symmetry', () => {
  close(wave.waveValue('sine',0),0);
  close(wave.waveValue('sine',Math.PI/2),1);
  close(wave.waveValue('triangle',Math.PI/2),1);
  close(wave.waveValue('triangle',3*Math.PI/2),-1);
  close(wave.waveValue('triangle',-Math.PI/2),-1);
});
test('square wave is periodic and has exactly two levels',()=>{
  for (let i=-100;i<=100;i++) {
    const theta=i*Math.PI/13;
    const y=wave.waveValue('square',theta);
    assert.ok(y===1||y===-1);
    assert.equal(y,wave.waveValue('square',theta+2*Math.PI));
  }
});
test('all curves have finite points within the display at maximum amplitude',()=>{
  for(const kind of ['sine','square','triangle']) {
    const pts=wave.sampleWave(kind,12,1,180,401);
    assert.equal(pts.length,401);
    close(pts[0].x,0);close(pts.at(-1).x,800);
    for (const p of pts) {
      assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));
      assert.ok(p.y>=30-1e-8&&p.y<=270+1e-8,kind);
    }
    assert.equal(wave.toSvgPoints(pts).split(' ').length,401);
  }
});
test('zero amplitude always makes a horizontal line',()=>{
  for(const kind of ['sine','square','triangle']){
    for (const point of wave.sampleWave(kind,3,0,-90)) close(point.y,150);
  }
});
test('invalid parameters are rejected',()=>{
  assert.throws(()=>wave.sampleWave('noise',2,1,0),RangeError);
  assert.throws(()=>wave.sampleWave('sine',0,1,0),RangeError);
  assert.throws(()=>wave.sampleWave('sine',2,1.1,0),RangeError);
  assert.throws(()=>wave.sampleWave('sine',2,1,Infinity),RangeError);
  assert.throws(()=>wave.sampleWave('sine',2,1,0,1),RangeError);
});
