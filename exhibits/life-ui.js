'use strict';
(function(){
 const {WIDTH,HEIGHT,PATTERNS,countCells,nextCells,stamp}=window.LifeCore;
 const el=id=>document.getElementById(id), canvas=el('life-grid'),ctx=canvas.getContext('2d');
 if(!ctx){el('announcer').textContent='Canvasを利用できない環境です。';return;}
 let cells=new Uint8Array(WIDTH*HEIGHT),generation=0,running=false,last=0,elapsed=0,painting=false,paintValue=1;
 const cellW=canvas.width/WIDTH,cellH=canvas.height/HEIGHT;
 const say=s=>{el('announcer').textContent=s;};
 function render(){
  ctx.fillStyle='#102117';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle='#22392b';ctx.lineWidth=1;ctx.beginPath();
  for(let x=1;x<WIDTH;x++){ctx.moveTo(x*cellW+.5,0);ctx.lineTo(x*cellW+.5,canvas.height);}
  for(let y=1;y<HEIGHT;y++){ctx.moveTo(0,y*cellH+.5);ctx.lineTo(canvas.width,y*cellH+.5);}
  ctx.stroke();ctx.fillStyle='#caff68';
  for(let i=0;i<cells.length;i++)if(cells[i]){
   const x=i%WIDTH*cellW,y=Math.floor(i/WIDTH)*cellH;
   ctx.fillRect(x+2,y+2,cellW-4,cellH-4);
  }
  el('generation').textContent=String(generation).padStart(4,'0');
  el('population').textContent=String(countCells(cells)).padStart(4,'0');
  el('toggle').textContent=running?'Ⅱ　停止する':'▶　進化させる';
  el('toggle').setAttribute('aria-pressed',String(running));
  el('state-label').textContent=running?'進化中':'停止中';
  el('state-dot').classList.toggle('running',running);
 }
 function setRunning(value){
  if(value&&!countCells(cells)){say('まずセルを配置してください。');return;}
  running=!!value;last=0;elapsed=0;render();
 }
 function advance(){
  cells=nextCells(cells,WIDTH,HEIGHT);generation++;
  if(!countCells(cells)){running=false;say('生命がすべて消えました。新しい種を配置できます。');}
  render();
 }
 el('toggle').addEventListener('click',()=>setRunning(!running));
 el('step').addEventListener('click',()=>{setRunning(false);advance();});
 el('clear').addEventListener('click',()=>{setRunning(false);cells.fill(0);generation=0;render();say('盤面を消去しました。');});
 el('random').addEventListener('click',()=>{
  setRunning(false);generation=0;
  for(let i=0;i<cells.length;i++)cells[i]=Math.random()<.23?1:0;
  render();say('約23%の確率でセルを配置しました。');
 });
 document.querySelectorAll('[data-pattern]').forEach(button=>button.addEventListener('click',()=>{
  setRunning(false);const points=PATTERNS[button.dataset.pattern];if(!points)return;
  const maxX=Math.max(...points.map(p=>p[0])),maxY=Math.max(...points.map(p=>p[1]));
  cells=stamp(cells,WIDTH,HEIGHT,points,Math.floor((WIDTH-maxX-1)/2),Math.floor((HEIGHT-maxY-1)/2));
  generation=0;render();say(button.textContent+'を中央へ追加しました。');
 }));
 const speed=el('speed');
 speed.addEventListener('input',()=>{el('speed-output').textContent=speed.value;});
 function pointerCell(event){
  const rect=canvas.getBoundingClientRect();
  const x=Math.floor((event.clientX-rect.left)/rect.width*WIDTH);
  const y=Math.floor((event.clientY-rect.top)/rect.height*HEIGHT);
  return x<0||y<0||x>=WIDTH||y>=HEIGHT?-1:y*WIDTH+x;
 }
 canvas.addEventListener('pointerdown',event=>{
  if(event.button!==0)return;
  const i=pointerCell(event);if(i<0)return;
  setRunning(false);painting=true;paintValue=cells[i]?0:1;cells[i]=paintValue;generation=0;
  canvas.setPointerCapture(event.pointerId);render();
 });
 canvas.addEventListener('pointermove',event=>{
  if(!painting)return;const i=pointerCell(event);
  if(i>=0&&cells[i]!==paintValue){cells[i]=paintValue;render();}
 });
 for(const name of ['pointerup','pointercancel','lostpointercapture'])
  canvas.addEventListener(name,()=>{painting=false;});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&running){setRunning(false);say('タブの移動に伴い停止しました。');}});
 function loop(time){
  if(running){
   if(!last)last=time;
   elapsed+=Math.min(time-last,300);last=time;
   const interval=1000/Number(speed.value);
   for(let n=0;n<4&&elapsed>=interval&&running;n++){advance();elapsed-=interval;}
  }
  requestAnimationFrame(loop);
 }
 cells=stamp(cells,WIDTH,HEIGHT,PATTERNS.glider,23,14);
 render();requestAnimationFrame(loop);
})();
