'use strict';
(function(){
 const search=document.getElementById('gallery-search');
 const count=document.getElementById('gallery-result-count');
 const empty=document.getElementById('gallery-empty');
 if(!search || !count || !empty)return;
 const cards=Array.from(document.querySelectorAll('.exhibit[data-category]'));
 const buttons=Array.from(document.querySelectorAll('[data-filter]'));
 let category='all';
 const normal=value=>String(value).normalize('NFKC').toLocaleLowerCase('ja-JP').replace(/\s+/gu,' ').trim();
 function update(){
  const query=normal(search.value);
  let visible=0;
  cards.forEach(card=>{
   const matchCategory=category==='all'||card.dataset.category===category;
   const matchText=!query||normal(card.textContent).includes(query);
   card.hidden=!(matchCategory&&matchText);
   if(!card.hidden)visible++;
  });
  count.textContent=visible+' / '+cards.length+' 展示';
  empty.hidden=visible!==0;
  buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===category)));
 }
 buttons.forEach(button=>button.addEventListener('click',()=>{
  category=button.dataset.filter;
  update();
 }));
 search.addEventListener('input',update);
 search.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&search.value){search.value='';update();}
 });
 update();
})();
