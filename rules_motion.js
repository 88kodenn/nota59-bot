(() => {
'use strict';
function start(){
 const section=document.getElementById('n59-rules');
 if(!section||section.dataset.n59EmojiMotion)return;
 const rows=Array.from(section.querySelectorAll('ol > li'));
 if(rows.length!==6)return;
 section.dataset.n59EmojiMotion='true';
 const symbols=['🌿','💳','📦','⏱️','🧴','🎁'];
 const motions=[
 ['rotate(0) scale(1)','rotate(-9deg) scale(1.12)','rotate(6deg) scale(1.06)','rotate(0) scale(1)'],
 ['rotate(0) scale(1)','translateY(-3px) rotate(-12deg) scale(1.1)','rotate(5deg) scale(1.04)','rotate(0) scale(1)'],
 ['translateX(0)','translateX(4px) rotate(5deg)','translateX(-2px) rotate(-3deg)','translateX(0)'],
 ['rotate(0)','rotate(18deg) scale(1.12)','rotate(-10deg) scale(1.05)','rotate(0)'],
 ['rotate(0)','translateY(-3px) rotate(-12deg) scale(1.08)','rotate(7deg)','rotate(0)'],
 ['scale(1)','translateY(-6px) scale(1.16) rotate(-5deg)','translateY(1px) scale(.97) rotate(3deg)','scale(1)']
 ];
 const style=document.createElement('style');style.id='n59-rules-emoji-motion';style.textContent=`
#n59-rules[data-n59-emoji-motion] li::before{display:none!important}
#n59-rules li>.n59-rule-emoji{grid-column:1!important;grid-row:1 / span 2;display:flex;align-items:center;justify-content:center;align-self:start;width:32px;height:36px;border:1px solid #dfbb7838;border-radius:10px;background:linear-gradient(145deg,#dfbb781c,#dfbb7805);font:normal 23px/1 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif;transform-origin:50% 70%;pointer-events:none;user-select:none}
#n59-rules[data-n59-emoji-motion] li{transition:border-color 180ms ease,box-shadow 180ms ease}
@media(hover:hover) and (pointer:fine){#n59-rules[data-n59-emoji-motion] li:hover{box-shadow:inset 0 1px 0 #dfbb7820,0 0 16px #dfbb780b}}
@media(prefers-reduced-motion:reduce){#n59-rules[data-n59-emoji-motion] li{transition:none}}
`;document.head.append(style);
 const icons=rows.map((row,index)=>{const icon=document.createElement('i');icon.className='n59-rule-emoji';icon.setAttribute('aria-hidden','true');icon.textContent=symbols[index];row.prepend(icon);return icon;});
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)'),running=new Map();
 let seen=new Set(),visible=false;
 function stop(){for(const animation of running.values())animation.cancel();running.clear();}
 function play(node,frames,options){
  if(reduced.matches||document.hidden||section.hidden||typeof node.animate!=='function')return;
  running.get(node)?.cancel();
  const animation=node.animate(frames,options);running.set(node,animation);
  const clean=()=>{if(running.get(node)===animation)running.delete(node);};animation.finished.then(clean,clean);
 }
 function emoji(index,delay=0){play(icons[index],motions[index].map(transform=>({transform})),{duration:560,delay,easing:'cubic-bezier(.22,.8,.3,1)'});}
 const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(!entry.isIntersecting||section.hidden||reduced.matches||seen.has(entry.target))continue;
   seen.add(entry.target);const index=rows.indexOf(entry.target),delay=Math.min(index,2)*55;
   play(entry.target,[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,delay,easing:'cubic-bezier(.22,.8,.3,1)'});
   emoji(index,delay+80);observer.unobserve(entry.target);
  }
 },{threshold:.12}):null;
 function sync(){
  const next=!section.hidden&&!document.hidden;
  if(!next){visible=false;observer?.disconnect();stop();return;}
  if(visible)return;
  visible=true;seen=new Set();
  if(!reduced.matches&&observer)for(const row of rows)observer.observe(row);
 }
 section.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!target||target.closest('a,button,input,select,textarea'))return;
  const row=target.closest('ol > li'),index=rows.indexOf(row);
  if(index<0||reduced.matches)return;
  emoji(index);play(row,[{transform:'scale(1)'},{transform:'scale(.99)'},{transform:'scale(1)'}],{duration:260,easing:'ease-out'});
 });
 new MutationObserver(sync).observe(section,{attributes:true,attributeFilter:['hidden']});
 document.addEventListener('visibilitychange',sync);
 const preference=()=>{stop();observer?.disconnect();visible=false;sync();};
 if(reduced.addEventListener)reduced.addEventListener('change',preference);else reduced.addListener(preference);
 sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
