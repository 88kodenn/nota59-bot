(() => {
'use strict';
const artwork={
'catalog':'<rect x="5" y="23" width="10" height="18" rx="2"/><path d="M7 23v-5h6v5M8 30h4"/><rect x="19" y="16" width="12" height="25" rx="3"/><path d="M22 16V8h6v8M23 24h4M23 28h4"/><rect x="35" y="25" width="8" height="16" rx="2"/><path d="M37 25v-5h4v5M38 32h2"/>',
'n59-gift-sets':'<rect x="6" y="19" width="36" height="8" rx="2"/><path d="M9 27v14h30V27M24 19v22M24 19c-7 0-12-3-12-7a4 4 0 0 1 7-2l5 9Zm0 0c7 0 12-3 12-7a4 4 0 0 0-7-2l-5 9Z"/>',
'n59-special-order':'<rect x="8" y="18" width="22" height="24" rx="4"/><path d="M13 18V9h12v9M13 27h12M13 32h8M36 8v12M30 14h12"/>'
};
function mount(){
 const tabs=document.getElementById('n59-arrival-tabs');
 if(!tabs||tabs.dataset.n59Motion==='luxury')return;
 tabs.dataset.n59Motion='luxury';
 const buttons=Array.from(tabs.querySelectorAll('button[aria-controls]'));
 for(const button of buttons){
  const paths=artwork[button.getAttribute('aria-controls')];
  if(!paths||button.querySelector('.n59-section-icon'))continue;
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  for(const [key,value] of Object.entries({viewBox:'0 0 48 48',fill:'none',stroke:'currentColor','stroke-width':'1.8','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true',focusable:'false',class:'n59-section-icon'}))svg.setAttribute(key,value);
  svg.innerHTML=paths;
  const label=document.createElement('span');label.className='n59-section-label';
  label.append(...Array.from(button.childNodes));button.append(svg,label);
 }
 let style=document.getElementById('n59-section-icons-style');
 if(!style){style=document.createElement('style');style.id='n59-section-icons-style';document.head.append(style);}
 style.textContent=`
#n59-arrival-tabs{position:relative;isolation:isolate}
#n59-arrival-tabs button{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:7px;min-height:88px;padding:12px 4px;touch-action:manipulation;overflow:hidden;border-radius:12px 12px 0 0;background:transparent;border-bottom-color:transparent;transform:scale(1);transition:transform 140ms ease-out,color 220ms ease,background-color 180ms ease}
#n59-arrival-tabs button[aria-pressed=true]{background:transparent;border-bottom-color:transparent;color:var(--gold,#dfbb78)}
#n59-arrival-tabs .n59-section-icon{position:relative;z-index:1;display:block;flex:none;width:32px;height:32px;pointer-events:none;transform-origin:50% 75%;transition:transform 250ms cubic-bezier(.2,.8,.2,1)}
#n59-arrival-tabs button[aria-pressed=true] .n59-section-icon{transform:translateY(-2px) scale(1.07)}
#n59-arrival-tabs .n59-section-label{position:relative;z-index:1;display:block;max-width:100%;line-height:1.5;overflow-wrap:anywhere;pointer-events:none}
#n59-arrival-tabs .n59-section-marker{position:absolute;z-index:0;top:0;bottom:0;left:0;pointer-events:none;border-radius:12px 12px 0 0;background:linear-gradient(160deg,#dfbb7820,#dfbb7808 65%,transparent);box-shadow:inset 0 1px 0 #dfbb7824;transition:transform 360ms cubic-bezier(.22,.85,.25,1),width 360ms cubic-bezier(.22,.85,.25,1)}
#n59-arrival-tabs .n59-section-marker::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#ad813c,#f4d99b,#bf9450);box-shadow:0 -3px 12px #dfbb7830}
#n59-arrival-tabs .n59-press-wave{position:absolute;z-index:0;pointer-events:none;border-radius:50%;background:radial-gradient(circle,#f0d29555,transparent 70%);opacity:0}
#n59-arrival-tabs button:not(:disabled):active{transform:scale(.96);background-color:#dfbb7814}
#n59-arrival-tabs button:focus-visible{outline:2px solid var(--gold,#dfbb78);outline-offset:-3px}
@media(hover:hover) and (pointer:fine){#n59-arrival-tabs button:not(:disabled):hover{background-color:#dfbb780d}}
@media(prefers-reduced-motion:reduce){#n59-arrival-tabs button,#n59-arrival-tabs .n59-section-icon,#n59-arrival-tabs .n59-section-marker{transition:none!important}#n59-arrival-tabs button:not(:disabled):active,#n59-arrival-tabs button[aria-pressed=true] .n59-section-icon{transform:none}#n59-arrival-tabs .n59-press-wave{display:none}}
`;
 const marker=document.createElement('span');marker.className='n59-section-marker';marker.setAttribute('aria-hidden','true');marker.style.transition='none';tabs.prepend(marker);
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)'),animations=new Map(),waves=new Map();
 let frame=0;
 function sync(){
  const active=buttons.find(button=>button.getAttribute('aria-pressed')==='true');
  if(!active||!tabs.offsetWidth){marker.hidden=true;return;}
  marker.hidden=false;marker.style.width=active.offsetWidth+'px';marker.style.transform='translateX('+active.offsetLeft+'px)';
 }
 function schedule(){cancelAnimationFrame(frame);frame=requestAnimationFrame(sync);}
 function stop(){for(const animation of animations.values())animation.cancel();animations.clear();for(const {node,animation} of waves.values()){animation.cancel();node.remove();}waves.clear();}
 function feedback(button,event){
  if(reduced.matches||typeof button.animate!=='function')return;
  const icon=button.querySelector('.n59-section-icon');
  if(icon){
   animations.get(icon)?.cancel();
   const end='translateY(-2px) scale(1.07)';
   const frames=button.getAttribute('aria-controls')==='catalog'?['scale(.9) rotate(-5deg)','translateY(-4px) scale(1.14) rotate(4deg)','translateY(-2px) scale(1.05) rotate(-2deg)',end]:button.getAttribute('aria-controls')==='n59-gift-sets'?['scale(.88) rotate(-4deg)','translateY(-7px) scale(1.15) rotate(4deg)','translateY(0) scale(1.02) rotate(-2deg)',end]:['scale(.9)','translateY(-4px) scale(1.15) rotate(9deg)','translateY(-2px) scale(1.06) rotate(-3deg)',end];
   const animation=icon.animate(frames.map(transform=>({transform})),{duration:560,easing:'cubic-bezier(.2,.8,.2,1)'});animations.set(icon,animation);
   animation.finished.then(()=>{if(animations.get(icon)===animation)animations.delete(icon);},()=>{});
  }
  const old=waves.get(button);if(old){old.animation.cancel();old.node.remove();}
  const rect=button.getBoundingClientRect(),size=Math.max(rect.width,rect.height)*2;
  const x=event.detail?event.clientX-rect.left:rect.width/2,y=event.detail?event.clientY-rect.top:rect.height/2;
  const wave=document.createElement('span');wave.className='n59-press-wave';wave.setAttribute('aria-hidden','true');
  Object.assign(wave.style,{width:size+'px',height:size+'px',left:x-size/2+'px',top:y-size/2+'px'});button.append(wave);
  const animation=wave.animate([{transform:'scale(.05)',opacity:.8},{transform:'scale(1)',opacity:0}],{duration:520,easing:'ease-out'});waves.set(button,{node:wave,animation});
  const clean=()=>{wave.remove();if(waves.get(button)?.node===wave)waves.delete(button);};animation.finished.then(clean,clean);
 }
 tabs.addEventListener('click',event=>{const button=event.target instanceof Element?event.target.closest('button[aria-controls]'):null;if(!button||!buttons.includes(button)||button.disabled||event.defaultPrevented)return;sync();feedback(button,event);});
 new MutationObserver(schedule).observe(tabs,{subtree:true,attributes:true,attributeFilter:['aria-pressed']});
 if('ResizeObserver' in window)new ResizeObserver(schedule).observe(tabs);else window.addEventListener('resize',schedule,{passive:true});
 const preference=()=>{if(reduced.matches)stop();schedule();};
 if(reduced.addEventListener)reduced.addEventListener('change',preference);else reduced.addListener(preference);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else schedule();});
 sync();requestAnimationFrame(()=>marker.style.removeProperty('transition'));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
