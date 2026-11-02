'use strict';
(function(root){
 const WIDTH=48, HEIGHT=32;
 const PATTERNS={
  glider:[[1,0],[2,1],[0,2],[1,2],[2,2]],
  'r-pentomino':[[1,0],[2,0],[0,1],[1,1],[1,2]],
  beacon:[[0,0],[1,0],[0,1],[1,1],[2,2],[3,2],[2,3],[3,3]],
  pulsar:[]
 };
 for(const x of [2,3,4,8,9,10])for(const y of [0,5,7,12])PATTERNS.pulsar.push([x,y]);
 for(const x of [0,5,7,12])for(const y of [2,3,4,8,9,10])PATTERNS.pulsar.push([x,y]);
 const at=(x,y,w,h)=>((y+h)%h)*w+(x+w)%w;
 function countCells(cells){return cells.reduce((a,b)=>a+b,0);}
 function nextCells(cells,w,h){
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<3||h<3||cells.length!==w*h)throw Error('invalid dimensions');
  const next=new Uint8Array(cells.length);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   let neighbors=0;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)
    if(dx!==0||dy!==0)neighbors+=cells[at(x+dx,y+dy,w,h)];
   const i=y*w+x;
   next[i]=neighbors===3||(neighbors===2&&cells[i])?1:0;
  }
  return next;
 }
 function stamp(cells,w,h,points,x,y){
  const out=new Uint8Array(cells);
  for(const [dx,dy]of points)out[at(x+dx,y+dy,w,h)]=1;
  return out;
 }
 const api={WIDTH,HEIGHT,PATTERNS,countCells,nextCells,stamp};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(root)root.LifeCore=api;
})(typeof window==='undefined'?null:window);
