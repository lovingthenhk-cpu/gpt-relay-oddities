'use strict';
(function(root){
 const actions={ordinary:{label:'通常審査',cost:2,points:2},urgent:{label:'至急と書く',cost:1,points:1},committee:{label:'審議会へ送る',cost:3,points:3}};
 function normalize(value){return Array.from(String(value??'').normalize('NFKC').trim().replace(/\s+/gu,' ')).slice(0,70).join('');}
 function create(topic){return {topic:normalize(topic),points:0,days:0,steps:[],done:false};}
 function advance(state,action){
   if(state.done||!actions[action])return state;
   const a=actions[action],steps=state.steps.concat(action),points=Math.min(9,state.points+a.points),days=state.days+a.cost;
   return {topic:state.topic,points,days,steps,done:points>=6||steps.length>=4};
 }
 function verdict(state){
   if(!state.done)return '審査中';
   return state.points>=6?'許可（ただし何も保証しない）':'再申請を推奨';
 }
 const api={create,advance,verdict,normalize,actions};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(typeof document==='undefined')return;
 const $=id=>document.getElementById(id),form=$('permit-form'),field=$('permit-topic'),stage=$('permit-stage');
 if(!form||!field||!stage)return;
 let state=null;
 function render(){
   stage.replaceChildren();
   const headline=document.createElement('h2');headline.textContent=state.done?'申請結果':'窓口審査中';stage.append(headline);
   const stats=document.createElement('p');stats.textContent=`申請対象：${state.topic} ／ 決裁点：${state.points}/6 ／ 所要日数（架空）：${state.days}日 ／ 審査回数：${state.steps.length}/4`;stage.append(stats);
   if(state.done){
     const result=document.createElement('p');result.className='permit-verdict';result.textContent=verdict(state);stage.append(result);
     const explanation=document.createElement('p');explanation.textContent='これは架空の行政手続です。実際の許認可・証明としては利用できません。';stage.append(explanation);
   }else{
     const prompt=document.createElement('p');prompt.textContent='次の処理経路を選んでください。';stage.append(prompt);
     const buttons=document.createElement('div');buttons.className='permit-actions';
     for(const [key,a] of Object.entries(actions)){
       const button=document.createElement('button');button.type='button';button.textContent=`${a.label}（+${a.points}点 / ${a.cost}日）`;button.addEventListener('click',()=>{state=advance(state,key);render();});buttons.append(button);
     }stage.append(buttons);
   }
   const reset=document.createElement('button');reset.type='button';reset.className='permit-reset';reset.textContent='別の申請を最初から行う';reset.addEventListener('click',()=>{state=null;stage.hidden=true;field.value='';field.focus();});stage.append(reset);
 }
 form.addEventListener('submit',e=>{e.preventDefault();const topic=normalize(field.value);if(!topic){field.focus();return;}state=create(topic);stage.hidden=false;render();});
})(typeof globalThis!=='undefined'?globalThis:this);
