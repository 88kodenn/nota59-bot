(() => {
'use strict';
const scenes=[
`<rect x="28" y="10" width="24" height="13" rx="2"/><rect x="21" y="23" width="38" height="47" rx="7" fill="#dfbb780a"/><path d="M27 30v31" opacity=".3"/><path data-draw="seal" d="M40 34l12 5v12c0 8-12 14-12 14s-12-6-12-14V39Z"/><path data-draw="check" d="m33 49 5 5 10-12" stroke-width="2.5"/>`,
`<rect x="7" y="18" width="66" height="46" rx="9" opacity=".25"/><g data-part="card"><rect x="13" y="25" width="54" height="32" rx="5" fill="#211b13"/><path d="M14 35h52" stroke-width="4" opacity=".4"/><rect x="21" y="43" width="10" height="7" rx="1"/><path d="M38 47h9"/><path data-part="shine" d="m29 28 14 26m-9-26 14 26" opacity="0" stroke="#fff0ca" stroke-width="3"/></g><path data-draw="check" d="m54 63 5 5 11-12" stroke-width="2.5"/>`,
`<rect x="19" y="34" width="42" height="29" rx="2" fill="#dfbb780a"/><path d="M40 35v27" opacity=".6"/><path data-part="left" d="m19 34 21-9v10Z" fill="#211b13" style="transform-origin:40px 34px"/><path data-part="right" d="m61 34-21-9v10Z" fill="#211b13" style="transform-origin:40px 34px"/><path data-draw="route" d="M12 71h45q9 0 9-9v-7" stroke-dasharray="2 4"/><circle cx="66" cy="52" r="3" fill="currentColor"/>`,
`<path d="M23 12h34M23 58h34M27 13c0 15 4 17 13 22-9 5-13 7-13 22m26-44c0 15-4 17-13 22 9 5 13 7 13 22"/><path data-part="upper" d="m31 22 9 10 9-10Z" fill="currentColor" opacity=".2" stroke="none"/><path data-part="lower" d="m31 54 9-13 9 13Z" fill="currentColor" stroke="none" style="transform-origin:40px 54px"/><path data-part="stream" d="M40 34v14" stroke-dasharray="1 4" opacity="0"/><text x="40" y="73" text-anchor="middle" fill="currentColor" stroke="none" font-size="10" font-family="system-ui,sans-serif">1–2 дня</text>`,
`<g data-part="bottle" style="transform-origin:23px 42px"><rect x="10" y="25" width="25" height="41" rx="5" fill="#dfbb780a"/><path d="M17 25V14h11v11M16 37h13M16 42h8"/></g><rect x="51" y="42" width="18" height="28" rx="4"/><path d="M56 42v-8h9v8M58 34v-4h10"/><rect data-part="liquid" x="54" y="54" width="12" height="13" rx="2" fill="currentColor" stroke="none" opacity=".5" style="transform-origin:60px 67px"/><path data-part="drop" d="M43 22c-2 4-4 6-4 9a4 4 0 0 0 8 0c0-3-2-5-4-9Z" fill="currentColor" stroke="none" opacity="0"/>`,
`<rect x="15" y="35" width="50" height="32" rx="3" fill="#dfbb780a"/><rect x="12" y="28" width="56" height="10" rx="3"/><path data-draw="ribbon" d="M40 29v38M16 49h48"/><path data-draw="bow" d="M40 28c-12 0-18-5-18-11 0-5 6-7 10-2l8 13Zm0 0c12 0 18-5 18-11 0-5-6-7-10-2l-8 13Z"/><path data-part="spark" d="M66 9v12m-6-6h12" opacity="0" style="transform-origin:66px 15px"/>`
];
function start(){
 const section=document.getElementById('n59-rules');if(!section||section.dataset.n59EmojiMotion==='svg-v2')return;
 const rows=Array.from(section.querySelectorAll('ol > li'));if(rows.length!==6)return;
 section.dataset.n59EmojiMotion='svg-v2';
 document.getElementById('n59-rules-emoji-motion')?.remove();
 const style=document.createElement('style');style.id='n59-rules-emoji-motion';style.textContent=`
#n59-rules[data-n59-emoji-motion=svg-v2] li{grid-template-columns:76px minmax(0,1fr)!important;gap:5px 14px!important}
#n59-rules[data-n59-emoji-motion=svg-v2] li::before{display:none!important}
#n59-rules li>.n59-rule-scene{grid-column:1;grid-row:1 / span 2;align-self:start;display:block;width:76px;height:80px;border:1px solid #dfbb7830;border-radius:16px;background:radial-gradient(ellipse at 30% 10%,#dfbb781a,transparent 80%),#17130e;color:var(--gold,#dfbb78);pointer-events:none}
#n59-rules .n59-rule-scene svg{display:block;width:100%;height:100%}
@media(max-width:359px){#n59-rules[data-n59-emoji-motion=svg-v2] li{grid-template-columns:60px minmax(0,1fr)!important;gap:5px 10px!important}#n59-rules li>.n59-rule-scene{width:60px;height:66px}}
`;document.head.append(style);
 const icons=rows.map((row,index)=>{
  row.querySelector('.n59-rule-emoji')?.remove();
  const holder=document.createElement('div');holder.className='n59-rule-scene';holder.setAttribute('aria-hidden','true');
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  for(const [key,value] of Object.entries({viewBox:'0 0 80 80',fill:'none',stroke:'currentColor','stroke-width':'1.6','stroke-linecap':'round','stroke-linejoin':'round',focusable:'false'}))svg.setAttribute(key,value);
  svg.innerHTML=scenes[index];holder.append(svg);row.prepend(holder);return svg;
 });
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)'),running=new Map();let seen=new Set(),visible=false;
 function stop(){for(const animation of running.values())animation.cancel();running.clear();}
 function animate(node,frames,duration=650,delay=0){
  if(!node||reduced.matches||document.hidden||section.hidden||typeof node.animate!=='function')return;
  running.get(node)?.cancel();
  const animation=node.animate(frames,{duration,delay,fill:'backwards',easing:'cubic-bezier(.22,.75,.25,1)'});running.set(node,animation);
  const clean=()=>{if(running.get(node)===animation)running.delete(node);};animation.finished.then(clean,clean);
 }
 function play(index){
  const svg=icons[index];if(!svg)return;
  for(const node of svg.querySelectorAll('*')){running.get(node)?.cancel();running.delete(node);}
  const part=name=>svg.querySelector('[data-part="'+name+'"]');
  const draw=(name,delay=0)=>{const path=svg.querySelector('[data-draw="'+name+'"]');if(!path)return;const length=path.getTotalLength();animate(path,[{strokeDasharray:String(length),strokeDashoffset:length},{strokeDasharray:String(length),strokeDashoffset:0}],650,delay);};
  if(index===0){draw('seal');draw('check',350);}
  if(index===1){animate(part('card'),[{transform:'translateX(-8px)',opacity:.3},{transform:'translateX(0)',opacity:1}],450);animate(part('shine'),[{transform:'translateX(-8px)',opacity:0},{transform:'translateX(0)',opacity:.7},{transform:'translateX(10px)',opacity:0}],600,200);draw('check',450);}
  if(index===2){animate(part('left'),[{transform:'rotate(-40deg)'},{transform:'rotate(0)'}],500);animate(part('right'),[{transform:'rotate(40deg)'},{transform:'rotate(0)'}],500,80);draw('route',350);}
  if(index===3){animate(part('upper'),[{opacity:.9},{opacity:.2}],950);animate(part('lower'),[{transform:'scaleY(.1)'},{transform:'scaleY(1)'}],950);animate(part('stream'),[{opacity:0},{opacity:1,offset:.2},{opacity:1,offset:.8},{opacity:0}],950);}
  if(index===4){animate(part('bottle'),[{transform:'rotate(0)'},{transform:'rotate(16deg)',offset:.35},{transform:'rotate(0)'}],1000);animate(part('drop'),[{transform:'translate(-9px,-3px)',opacity:0},{transform:'translate(-5px,0)',opacity:1,offset:.25},{transform:'translate(17px,32px)',opacity:0}],750,180);animate(part('liquid'),[{transform:'scaleY(.05)'},{transform:'scaleY(1)'}],650,450);}
  if(index===5){draw('ribbon');draw('bow',300);animate(part('spark'),[{transform:'scale(.3)',opacity:0},{transform:'scale(1.2)',opacity:1,offset:.5},{transform:'scale(.8)',opacity:0}],500,650);}
 }
 const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{
  for(const entry of entries){if(!entry.isIntersecting||section.hidden||reduced.matches||seen.has(entry.target))continue;seen.add(entry.target);animate(entry.target,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],400);play(rows.indexOf(entry.target));observer.unobserve(entry.target);}
 },{threshold:.12}):null;
 function sync(){const next=!section.hidden&&!document.hidden;if(!next){visible=false;observer?.disconnect();stop();return;}if(visible)return;visible=true;seen=new Set();if(!reduced.matches&&observer)for(const row of rows)observer.observe(row);}
 section.addEventListener('click',event=>{const target=event.target instanceof Element?event.target:null;if(!target||target.closest('a,button,input,select,textarea')||reduced.matches)return;const index=rows.indexOf(target.closest('ol > li'));if(index>=0)play(index);});
 new MutationObserver(sync).observe(section,{attributes:true,attributeFilter:['hidden']});document.addEventListener('visibilitychange',sync);
 const preference=()=>{stop();observer?.disconnect();visible=false;sync();};if(reduced.addEventListener)reduced.addEventListener('change',preference);else reduced.addListener(preference);sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
