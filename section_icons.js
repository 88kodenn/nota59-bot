(() => {
'use strict';
const artwork={
'catalog':'<rect x="5" y="23" width="10" height="18" rx="2"/><path d="M7 23v-5h6v5M8 30h4"/><rect x="19" y="16" width="12" height="25" rx="3"/><path d="M22 16V8h6v8M23 24h4M23 28h4"/><rect x="35" y="25" width="8" height="16" rx="2"/><path d="M37 25v-5h4v5M38 32h2"/>',
'n59-gift-sets':'<rect x="6" y="19" width="36" height="8" rx="2"/><path d="M9 27v14h30V27M24 19v22M24 19c-7 0-12-3-12-7a4 4 0 0 1 7-2l5 9Zm0 0c7 0 12-3 12-7a4 4 0 0 0-7-2l-5 9Z"/>',
'n59-special-order':'<rect x="8" y="18" width="22" height="24" rx="4"/><path d="M13 18V9h12v9M13 27h12M13 32h8M36 8v12M30 14h12"/>'
};
function mount(){
 const tabs=document.getElementById('n59-arrival-tabs');if(!tabs)return;
 for(const button of tabs.querySelectorAll('button[aria-controls]')){
  const paths=artwork[button.getAttribute('aria-controls')];
  if(!paths||button.querySelector('.n59-section-icon'))continue;
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  for(const [key,value] of Object.entries({viewBox:'0 0 48 48',fill:'none',stroke:'currentColor','stroke-width':'1.8','stroke-linecap':'round','stroke-linejoin':'round','aria-hidden':'true',focusable:'false',class:'n59-section-icon'}))svg.setAttribute(key,value);
  svg.innerHTML=paths;
  const label=document.createElement('span');label.className='n59-section-label';
  label.append(...Array.from(button.childNodes));button.append(svg,label);
 }
 if(document.getElementById('n59-section-icons-style'))return;
 const style=document.createElement('style');style.id='n59-section-icons-style';style.textContent=`
#n59-arrival-tabs button{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:7px;min-height:88px;padding:12px 4px;touch-action:manipulation;border-radius:9px 9px 0 0;transform:scale(1);transition:transform 160ms ease-out,color 180ms ease,background-color 180ms ease,border-color 180ms ease}
#n59-arrival-tabs .n59-section-icon{display:block;flex:none;width:32px;height:32px;pointer-events:none;transform-origin:center;transition:transform 220ms cubic-bezier(.2,.8,.3,1)}
#n59-arrival-tabs .n59-section-label{display:block;max-width:100%;line-height:1.5;overflow-wrap:anywhere;pointer-events:none}
#n59-arrival-tabs button[aria-pressed=true]{background-color:#dfbb780d}
#n59-arrival-tabs button[aria-pressed=true] .n59-section-icon{transform:translateY(-2px) scale(1.08)}
#n59-arrival-tabs button:not(:disabled):active{transform:scale(.96);background-color:#dfbb7826}
#n59-arrival-tabs button:focus-visible{outline:2px solid var(--gold,#dfbb78);outline-offset:-3px;border-radius:7px}
@media(hover:hover) and (pointer:fine){#n59-arrival-tabs button:not(:disabled):hover{background-color:#dfbb7814}}
@media(prefers-reduced-motion:reduce){#n59-arrival-tabs button,#n59-arrival-tabs .n59-section-icon{transition:none}#n59-arrival-tabs button:not(:disabled):active,#n59-arrival-tabs button[aria-pressed=true] .n59-section-icon{transform:none}}
`;document.head.append(style);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
