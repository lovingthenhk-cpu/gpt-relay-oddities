'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {nextCells,stamp,countCells,PATTERNS}=require('../exhibits/life.js');
function evolve(cells,w,h,n){for(let i=0;i<n;i++)cells=nextCells(cells,w,h);return cells;}
test('block still life remains stable',()=>{
 const cells=stamp(new Uint8Array(100),10,10,[[0,0],[1,0],[0,1],[1,1]],4,4);
 assert.deepEqual(evolve(cells,10,10,5),cells);
});
test('blinker oscillates with period two',()=>{
 const initial=stamp(new Uint8Array(100),10,10,[[0,0],[1,0],[2,0]],4,5);
 const vertical=stamp(new Uint8Array(100),10,10,[[0,0],[0,1],[0,2]],5,4);
 assert.deepEqual(nextCells(initial,10,10),vertical);
 assert.deepEqual(evolve(initial,10,10,2),initial);
});
test('glider translates one diagonal cell in four generations',()=>{
 const world=new Uint8Array(20*20);
 const original=stamp(world,20,20,PATTERNS.glider,5,5);
 const moved=stamp(world,20,20,PATTERNS.glider,6,6);
 assert.deepEqual(evolve(original,20,20,4),moved);
});
test('toroidal grid wraps neighbors across edges',()=>{
 const w=10,h=10,world=new Uint8Array(w*h);
 const before=stamp(world,w,h,[[9,0],[0,0],[1,0]],0,0);
 const after=stamp(world,w,h,[[0,9],[0,0],[0,1]],0,0);
 assert.deepEqual(nextCells(before,w,h),after);
});
test('pulsar has 48 cells and oscillates in three generations',()=>{
 const initial=stamp(new Uint8Array(20*20),20,20,PATTERNS.pulsar,3,3);
 assert.equal(countCells(initial),48);
 assert.deepEqual(evolve(initial,20,20,3),initial);
});
test('input is not mutated and dimensions are validated',()=>{
 const before=stamp(new Uint8Array(100),10,10,PATTERNS.beacon,2,2);
 const copy=new Uint8Array(before);
 nextCells(before,10,10);
 assert.deepEqual(before,copy);
 assert.throws(()=>nextCells(before,0,10),/invalid/);
});
