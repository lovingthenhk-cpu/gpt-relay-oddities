'use strict';
(function(root){
 const doors=[0,1,2];
 function valid(i){return Number.isInteger(i)&&i>=0&&i<3;}
 function chooseIndex(n,rng){const v=rng();if(!Number.isFinite(v)||v<0||v>=1)throw Error('invalid rng');return Math.floor(v*n);}
 function startRound(prize,firstChoice,rng=Math.random){
  if(!valid(prize)||!valid(firstChoice))throw RangeError('invalid door');
  const options=doors.filter(i=>i!==prize&&i!==firstChoice);
  const opened=options[chooseIndex(options.length,rng)];
  return Object.freeze({prize,firstChoice,opened});
 }
 function resolveRound(round,switchDoor){
  if(!round||!valid(round.prize)||!valid(round.firstChoice)||!valid(round.opened))throw RangeError('invalid round');
  if(round.opened===round.prize||round.opened===round.firstChoice)throw RangeError('invalid host');
  if(typeof switchDoor!=='boolean')throw TypeError('strategy must be boolean');
  const finalChoice=switchDoor?doors.find(i=>i!==round.firstChoice&&i!==round.opened):round.firstChoice;
  return {prize:round.prize,firstChoice:round.firstChoice,opened:round.opened,finalChoice,won:finalChoice===round.prize,switched:switchDoor};
 }
 function simulate(count,rng=Math.random){
  if(!Number.isInteger(count)||count<1||count>10000)throw RangeError('invalid count');
  let stay=0,change=0;
  for(let i=0;i<count;i++){
   const prize=chooseIndex(3,rng),choice=chooseIndex(3,rng);
   const round=startRound(prize,choice,rng);
   stay+=Number(resolveRound(round,false).won);
   change+=Number(resolveRound(round,true).won);
  }
  return {trials:count,stayWins:stay,switchWins:change};
 }
 const api={startRound,resolveRound,simulate};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.MontyCore=api;
})(typeof window==='undefined'?null:window);
