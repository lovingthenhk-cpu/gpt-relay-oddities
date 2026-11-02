'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {startRound,resolveRound,simulate}=require('../exhibits/monty-core.js');
test('host always reveals an unchosen losing door',()=>{
 for(let prize=0;prize<3;prize++)for(let pick=0;pick<3;pick++){
  for(const value of [0,.9999]){
   const round=startRound(prize,pick,()=>value);
   assert.notEqual(round.opened,prize);
   assert.notEqual(round.opened,pick);
   assert.equal(new Set([round.opened,pick]).size,2);
  }
 }
});
test('enumerating all nine initial conditions yields 1/3 stay and 2/3 switch',()=>{
 let stay=0,change=0;
 for(let prize=0;prize<3;prize++)for(let pick=0;pick<3;pick++){
  const round=startRound(prize,pick,()=>0);
  stay+=Number(resolveRound(round,false).won);
  change+=Number(resolveRound(round,true).won);
 }
 assert.equal(stay,3);assert.equal(change,6);
});
test('switch and stay choose different unopened doors',()=>{
 const round=startRound(0,1,()=>0);
 const a=resolveRound(round,false),b=resolveRound(round,true);
 assert.equal(a.finalChoice,1);
 assert.equal(b.finalChoice,0);
 assert.notEqual(a.won,b.won);
});
test('seeded sample stays close to the theoretical rates',()=>{
 let state=123456789;
 const rng=()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296;};
 const sample=simulate(5000,rng);
 assert.ok(sample.stayWins>1450&&sample.stayWins<1900,sample.stayWins);
 assert.equal(sample.stayWins+sample.switchWins,5000);
});
test('invalid game inputs are rejected',()=>{
 assert.throws(()=>startRound(3,0),RangeError);
 assert.throws(()=>startRound(0,-1),RangeError);
 assert.throws(()=>startRound(0,0,()=>1),Error);
 assert.throws(()=>simulate(10001),RangeError);
 assert.throws(()=>resolveRound({prize:1,firstChoice:0,opened:1},true),RangeError);
});
