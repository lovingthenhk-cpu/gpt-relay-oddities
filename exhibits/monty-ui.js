'use strict';
(function(){
 const {startRound,resolveRound,simulate}=window.MontyCore;
 const el=id=>document.getElementById(id);
 const buttons=[...document.querySelectorAll('[data-door]')];
 const symbols=['A','B','C'];
 const stats={stay:{total:0,wins:0},switch:{total:0,wins:0}};
 let round=null,result=null;
 function updateStats(){
  for(const strategy of ['stay','switch']){
   const s=stats[strategy],rate=s.total?100*s.wins/s.total:0;
   el(strategy+'-rate').textContent=s.total?rate.toFixed(1)+'%':'—';
   el(strategy+'-count').textContent=s.wins+'勝 / '+s.total+'回';
   el(strategy+'-bar').style.width=rate+'%';
  }
 }
 function render(){
  buttons.forEach((button,i)=>{
   button.className='door';
   button.disabled=round!==null;
   button.setAttribute('aria-pressed',String(Boolean(round&&round.firstChoice===i)));
   const label=button.querySelector('.door-symbol');
   if(result){
    label.textContent=i===round.prize?'★':'×';
    if(i===round.prize)button.classList.add('win');else button.classList.add('lost');
    if(i===result.finalChoice)button.classList.add('selected');
    button.setAttribute('aria-label','扉'+symbols[i]+'：'+(i===round.prize?'景品':'ハズレ'));
   }else if(round){
    if(i===round.firstChoice)button.classList.add('selected');
    if(i===round.opened)button.classList.add('opened');
    label.textContent=i===round.opened?'×':'?';
    button.setAttribute('aria-label','扉'+symbols[i]+(i===round.opened?'：司会者が開いたハズレ':'：まだ閉じている'));
   }else{
    label.textContent='?';button.setAttribute('aria-label','扉'+symbols[i]+'を選択');
   }
  });
  el('decision-panel').hidden=!round||Boolean(result);
  el('next-round').hidden=!result;
  if(!round){
   el('phase').textContent='まず1つの扉を選択してください。';
   el('outcome').textContent='司会者は必ず、景品のない扉を1枚だけ開けます。';
  }else if(!result){
   el('phase').textContent='扉'+symbols[round.firstChoice]+'を選択中';
   el('outcome').textContent='司会者が扉'+symbols[round.opened]+'を開けました。そこには景品がありません。扉を変えますか？';
  }else{
   el('phase').textContent=result.won?'景品を獲得！':'今回はハズレ';
   el('outcome').textContent=(result.switched?'選択を変えました。':'最初の選択を維持しました。')+
    '最後に選んだのは扉'+symbols[result.finalChoice]+'。'+
    (result.won?'景品がありました！':'景品は扉'+symbols[result.prize]+'でした。');
  }
 }
 function chooseDoor(index){
  if(round)return;
  round=startRound(Math.floor(Math.random()*3),index);
  result=null;render();
 }
 buttons.forEach(button=>button.addEventListener('click',()=>chooseDoor(Number(button.dataset.door))));
 function finish(change){
  if(!round||result)return;
  result=resolveRound(round,change);
  const category=change?'switch':'stay';
  stats[category].total++;if(result.won)stats[category].wins++;
  updateStats();render();
 }
 el('stay').addEventListener('click',()=>finish(false));
 el('switch').addEventListener('click',()=>finish(true));
 el('next-round').addEventListener('click',()=>{round=null;result=null;render();buttons[0].focus();});
 el('reset-stats').addEventListener('click',()=>{
  for(const category of ['stay','switch']){stats[category].total=0;stats[category].wins=0;}
  updateStats();el('simulate-result').textContent='対戦記録を消去しました。大量試行の結果は別集計です。';
 });
 el('simulate').addEventListener('click',()=>{
  const sample=simulate(1000);
  el('simulate-result').textContent='1000回の同じ初期条件を比較：維持 '+sample.stayWins+'勝（'+(sample.stayWins/10).toFixed(1)+'%）／変更 '+sample.switchWins+'勝（'+(sample.switchWins/10).toFixed(1)+'%）。理論上の勝率はそれぞれ約33.3%と66.7%です。';
 });
 render();updateStats();
})();
