(() => {
'use strict';
if(window.n59OrdersV2)return;window.n59OrdersV2=true;
const $=id=>document.getElementById(id),make=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;},money=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₽',initData=()=>window.Telegram?.WebApp?.initData||'';
const style=make('style');style.textContent=`
#n59-panel #n59-checkout,#n59-panel #n59-message{display:none!important}
#n59-order-submit,#n59-order-history{display:block;width:100%;min-height:48px;margin:12px 0;padding:12px;border:1px solid var(--gold);border-radius:8px;background:#211b13;color:var(--gold);font:500 14px var(--sans)}
#n59-order-submit:disabled{opacity:.5}#n59-order-result{white-space:pre-wrap;overflow-wrap:anywhere;font:400 14px/1.7 var(--sans)}
#n59-order-history.is-loading{display:flex;align-items:center;justify-content:center;gap:10px;cursor:progress}
#n59-order-history.is-loading::before{content:'';width:16px;height:16px;flex-shrink:0;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:n59-orders-spin .8s linear infinite}
@keyframes n59-orders-spin{to{transform:rotate(360deg)}}
@media(prefers-reduced-motion:reduce){#n59-order-history.is-loading::before{animation:none}}
`;document.head.append(style);
let busy=false,uncertain=false;const saved=new Map();
async function request(url,options={}){
 const response=await fetch(url,{cache:'no-store',...options});let result;
 try{result=await response.json();}catch{throw new Error('Неожиданный ответ сервера. Проверьте историю заказов.');}
 if(!response.ok||!result.ok){const e=new Error(result.error||'Ошибка сервера');e.rejected=response.status>=400&&response.status<500;throw e;}return result;
}
function mount(){
 const panel=$('n59-panel'),form=$('n59-form');if(!panel||!form||!$('n59-checkout')||$('n59-order-submit'))return;
 const contact=$('n59-contact');
 if(contact){
  const prefill=()=>{if(!contact.value.trim())contact.value='+7';};
  prefill();
  contact.addEventListener('focus',()=>{prefill();if(contact.value==='+7')contact.setSelectionRange(2,2);});
  form.addEventListener('reset',()=>setTimeout(prefill,0));
 }
 const submit=make('button','Оформить заказ'),history=make('button','Мои заказы'),result=make('div');
 submit.id='n59-order-submit';history.id='n59-order-history';result.id='n59-order-result';submit.type=history.type='button';result.setAttribute('role','status');history.setAttribute('aria-controls',result.id);
 form.before(history,result);form.append(submit);const show=text=>{result.textContent=text;};
 function payload(){
  const all=typeof data!=='undefined'&&Array.isArray(data?.items)?data.items:[];
  const items=[...panel.querySelectorAll('.n59-row')].map(row=>{
   const title=row.querySelector('strong')?.textContent;
   const matches=all.filter(p=>(p.name.startsWith(p.brand+' ')?p.name:p.brand+' — '+p.name)===title);
   if(matches.length!==1)throw new Error('Не удалось определить товар. Закройте и откройте корзину.');
   const volume=parseInt(row.querySelector('p')?.textContent,10),qty=Number(row.querySelector('.n59-controls span')?.textContent);
   if(![5,10].includes(volume)||!Number.isInteger(qty)||qty<1||qty>99)throw new Error('Некорректная позиция корзины');
   return{name:matches[0].name,brand:matches[0].brand,volume,qty};
  });
  if(!items.length)throw new Error('Корзина пуста');const value=id=>$(id)?.value.trim()||'';
  return{items,customer:{name:value('n59-name'),contact:value('n59-contact'),receipt:value('n59-receipt'),carrier:value('n59-carrier'),address:value('n59-address'),comment:value('n59-comment')}};
 }
 async function send(){
  if(busy||uncertain)return;if(!initData()){show('Откройте каталог заново через Telegram.');return;}
  form.dispatchEvent(new Event('input',{bubbles:true}));if(!form.reportValidity())return;let body;
  try{body=payload();}catch(e){show(e.message);return;}const fingerprint=JSON.stringify(body);
  if(saved.has(fingerprint)){show('Этот заказ уже сохранён: '+saved.get(fingerprint)+'. Проверьте «Мои заказы».');return;}
  busy=true;submit.disabled=true;show('Сохраняем заказ…');
  try{
   const answer=await request('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,initData:initData()})});
   saved.set(fingerprint,answer.order_number);
   show('Заказ №'+answer.order_number+' сохранён.\nИтого за товары: '+money(answer.total)+'\nСтатус: '+answer.status_label+(answer.seller_notified?'\nУведомление продавцу отправлено.':'\nУведомление продавцу не доставлено. Свяжитесь с продавцом и укажите номер заказа.'));submit.textContent='Заказ сохранён';
  }catch(e){uncertain=!e.rejected;show(e.message+(uncertain?'\nНе отправляйте заказ повторно: сначала проверьте «Мои заказы». Повторная отправка заблокирована до перезагрузки.':''));}
  finally{busy=false;submit.disabled=uncertain||saved.has(fingerprint);}
 }
 submit.addEventListener('click',send);form.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();send();},true);
 const changed=()=>{if(!busy&&!uncertain){submit.disabled=false;submit.textContent='Оформить заказ';}};
 form.addEventListener('input',changed);form.addEventListener('change',changed);
 const list=$('n59-items');if(list)new MutationObserver(changed).observe(list,{childList:true,subtree:true});
 history.addEventListener('click',async()=>{
  if(history.disabled)return;if(!initData()){show('Откройте каталог заново через Telegram.');return;}
  history.disabled=true;history.classList.add('is-loading');history.setAttribute('aria-busy','true');history.textContent='Загружаем…';show('Загружаем заказы…');
  try{const answer=await request('/api/orders?init='+encodeURIComponent(initData()));show(answer.orders.length?answer.orders.map(order=>order.order_number+' — '+money(order.total)+' — '+order.status_label).join('\n'):'Заказов пока нет.');}
  catch(e){show(e.message);}finally{history.disabled=false;history.classList.remove('is-loading');history.removeAttribute('aria-busy');history.textContent='Мои заказы';}
 });
}
new MutationObserver(mount).observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});mount();
})();

// Catalog visual polish, isolated from order submission.
(() => {
'use strict';
function start(){
if(document.getElementById('n59-hero-polish'))return;
const style=document.createElement('style');style.id='n59-hero-polish';style.textContent=`
.wrap .hero{position:relative;isolation:isolate;display:block!important;padding:0!important;overflow:hidden;background:#100e0a!important;border-radius:16px}
.wrap .hero.n59-rules-hidden{display:none!important}
.wrap .hero::before,.wrap .hero .bottle{display:none!important}
.wrap .hero .n59-hero-art{position:relative;isolation:isolate;overflow:hidden;min-width:0;background:#100e0a}
.wrap .hero .n59-hero-art::before{content:'';position:absolute;inset:0;z-index:-2;background:linear-gradient(#100e0a70,#100e0ab8),url('/assets/nota59-banner.jpg?v=cd5b4d08') center bottom/cover;filter:blur(12px);transform:scale(1.08);pointer-events:none}
.wrap .hero .n59-hero-photo{position:absolute;top:0;left:0;z-index:-1;display:block;width:100%;max-width:100%;height:auto!important;object-fit:contain;object-position:top center;-webkit-mask-image:linear-gradient(#000 65%,transparent 100%);mask-image:linear-gradient(#000 65%,transparent 100%)}
.wrap .hero .n59-hero-art::after{content:'';position:absolute;inset:0;z-index:0;pointer-events:none;background:linear-gradient(90deg,#08090755,transparent 57%),linear-gradient(0deg,#08090780,transparent 55%)}
.wrap .hero .hero-copy{position:relative;z-index:1;display:flex!important;flex-direction:column;align-items:flex-start;box-sizing:border-box;width:100%;max-width:100%;min-width:0;min-height:500px;padding:32px;background:transparent}
.wrap .hero .hero-copy .eyebrow{display:none!important}
.wrap .hero .hero-copy h1{box-sizing:border-box;width:48%;max-width:460px;min-height:0!important;margin:0 0 24px;padding:0!important;font:400 clamp(28px,4vw,48px)/1.1 var(--serif);letter-spacing:-.4px;color:var(--text);overflow-wrap:normal;text-shadow:0 2px 12px #0008}
.wrap .hero h1 em{font-style:normal;color:var(--gold)}
.wrap .hero .hero-copy>p{display:block!important;max-width:100%!important;width:100%;margin:auto 0 0;color:#ded2c0;font:400 14px/1.65 var(--sans);text-shadow:0 1px 8px #000}
.wrap .hero #n59-picker-open{box-sizing:border-box;width:100%;max-width:100%!important;min-height:48px;margin:14px 0 0!important;padding:13px 20px;border:1px solid #dfbb78;border-radius:8px;background:linear-gradient(110deg,#b58a46,#e1bf7c);color:#17130d;font:600 14px/1.4 var(--sans);white-space:normal;text-shadow:none}
.wrap .hero .n59-picker-skip{display:block!important;max-width:100%!important;width:100%;margin:10px 0 0!important;color:#c9bba7;font:400 12px/1.6 var(--sans);text-shadow:0 1px 8px #000}
.wrap .hero #n59-picker-open:focus-visible{outline:2px solid #f3eade;outline-offset:4px}
@media(max-width:699px){.wrap .hero .hero-copy{min-height:430px;padding:22px 20px}.wrap .hero .hero-copy h1{width:49%;max-width:none;margin-bottom:clamp(56px,18vw,105px);font-size:clamp(20px,5.5vw,28px);line-height:1.12}.wrap .hero .hero-copy>p{font-size:13px}.wrap .hero #n59-picker-open{font-size:13px}}
@media(max-width:359px){.wrap .hero .hero-copy{min-height:410px;padding:18px 16px}.wrap .hero .hero-copy h1{font-size:19px;margin-bottom:56px}.wrap .hero .n59-picker-skip{font-size:11px}}
`;document.head.append(style);
const hero=document.querySelector('.hero'),photo=hero?.querySelector('.n59-hero-photo'),heading=hero?.querySelector('h1'),copy=hero?.querySelector('.hero-copy');
if(hero&&photo&&heading&&copy&&!hero.querySelector('.n59-hero-art')){const art=document.createElement('div');art.className='n59-hero-art';hero.prepend(art);art.append(photo,copy);}
let watched=null;
const resize='ResizeObserver' in window?new ResizeObserver(()=>sync()):null;
function sync(){
const brand=document.getElementById('brand-open'),fav=document.querySelector('#n59-fav-launch button');
if(brand&&fav){const box=brand.getBoundingClientRect();if(box.width&&box.height){const css=getComputedStyle(brand);for(const prop of ['font','letter-spacing','color','background-color','border','border-radius','padding','box-shadow'])fav.style.setProperty(prop,css.getPropertyValue(prop));Object.assign(fav.style,{boxSizing:'border-box',width:box.width+'px',height:box.height+'px',minHeight:box.height+'px',display:'flex',alignItems:'center',justifyContent:'center',whiteSpace:'nowrap'});}if(watched!==brand){resize?.disconnect();resize?.observe(brand);watched=brand;}}
}
new MutationObserver(sync).observe(document.body,{childList:true,subtree:true});window.addEventListener('resize',sync,{passive:true});document.fonts?.ready.then(sync);sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

(() => {
'use strict';
const oldTitle='Jump Up And Kiss Me Hedonistic (2021)',newTitle='Jump Up And Kiss Me Hedonistic';
function patch(){for(const title of document.querySelectorAll('#catalog .card .name,#dialog #title')){if(title.textContent===oldTitle)title.textContent=newTitle;}}
new MutationObserver(patch).observe(document.body,{childList:true,subtree:true});patch();
})();

(() => {
'use strict';
function start(){
const nav=document.getElementById('n59-navigation');if(!nav||document.getElementById('n59-nav-design'))return;
const style=document.createElement('style');style.id='n59-nav-design';style.textContent=`
body #n59-navigation{box-sizing:border-box;width:calc(100% - 20px);max-width:960px;bottom:8px;border:1px solid #b58a4659;border-radius:18px;padding:5px 8px max(5px,calc(env(safe-area-inset-bottom,0px) - 16px));gap:4px;background:linear-gradient(145deg,#211d16,#100f0c)!important;box-shadow:0 10px 36px #0009,inset 0 1px 0 #f3d59c13}
body #n59-navigation button,body #n59-navigation #n59-cart{min-width:0;min-height:64px;justify-content:flex-start;gap:2px;padding:4px 3px;border-radius:12px;font:500 10px/1.35 var(--sans);letter-spacing:.15px;text-transform:none;color:#b9ad99}
body #n59-navigation button::after{inset:0;border-radius:12px}
body #n59-navigation button[aria-current=page]::before{display:none}
body #n59-navigation button svg,body #n59-navigation #n59-cart svg{box-sizing:border-box;flex-shrink:0;width:32px;height:32px;padding:6px;border:1px solid #dfbb782e;border-radius:10px;background:linear-gradient(145deg,#3b3021,#1d1912);color:#dfbb78;stroke-width:1.7;box-shadow:inset 0 1px 0 #f3d59c10}
body #n59-navigation button[aria-current=page]{color:#f0d39a}
body #n59-navigation button[aria-current=page] svg{background:linear-gradient(135deg,#f0d49b,#bb8d44);border-color:#ecd29b;color:#20180e;filter:none;box-shadow:0 3px 14px #c49a4340,inset 0 1px 0 #fff5}
body #n59-navigation #n59-cart-count{max-width:100%;font:500 9px/1.4 var(--sans);letter-spacing:0;white-space:normal;overflow-wrap:anywhere;color:#e0bd7b}
@media(prefers-reduced-motion:no-preference){body #n59-navigation button svg{transition:background-color .25s ease,box-shadow .25s ease,color .25s ease,border-color .25s ease}}
@media(max-width:359px){body #n59-navigation{width:calc(100% - 12px);padding-inline:5px}body #n59-navigation button,body #n59-navigation #n59-cart{font-size:10px}body #n59-navigation #n59-cart-count{font-size:9px}}
`;document.head.append(style);
const icons=[['button[aria-controls="catalog"]','M5 3h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm11 0h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2ZM5 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Zm11 0h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Z'],['button[aria-controls="n59-rules"]','M7 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a2 2 0 0 1 2-2Zm7 0v5h5M8 12l1 1 2-2M13 12h3M8 17l1 1 2-2M13 17h3'],['#n59-cart','M5 7h14l1 13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1L5 7Zm3 1V6a4 4 0 0 1 8 0v2']];
for(const [selector,d] of icons){const svg=nav.querySelector(selector+' svg');if(!svg)continue;const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);svg.replaceChildren(path);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

(() => {
'use strict';
const catalog=document.getElementById('catalog');if(!catalog||document.getElementById('n59-details-feedback'))return;
const style=document.createElement('style');style.id='n59-details-feedback';style.textContent=`
#catalog .card .bottom .more{position:relative;isolation:isolate;overflow:hidden;touch-action:manipulation}
#catalog .card .bottom .more:active{border-color:var(--gold);background:#dfbb7826;color:var(--gold)}
@media(prefers-reduced-motion:no-preference){
#catalog .card .bottom .more{transition:transform .15s ease,border-color .2s ease,box-shadow .2s ease}
#catalog .card .bottom .more.n59-more-playing{animation:n59-details-press .24s ease-out}
@keyframes n59-details-press{0%{transform:scale(1)}35%{transform:scale(.95);border-color:#dfbb78;background:#dfbb7838;box-shadow:0 0 14px #dfbb7838}75%{transform:scale(1.015);border-color:#dfbb78;box-shadow:0 0 9px #dfbb7826}100%{transform:scale(1)}}
}
`;document.head.append(style);
const motion=matchMedia('(prefers-reduced-motion: reduce)');let pending=null;
function cancel(){if(!pending)return;clearTimeout(pending.timer);pending.button.classList.remove('n59-more-playing');if(pending.busy===null)pending.button.removeAttribute('aria-busy');else pending.button.setAttribute('aria-busy',pending.busy);pending=null;}
catalog.addEventListener('click',e=>{const button=e.target instanceof Element?e.target.closest('.more'):null;if(!button||button.disabled||motion.matches||typeof button.onclick!=='function')return;e.preventDefault();e.stopImmediatePropagation();if(pending)return;const handler=button.onclick,busy=button.getAttribute('aria-busy');button.classList.add('n59-more-playing');button.setAttribute('aria-busy','true');pending={button,busy,timer:setTimeout(()=>{const allowed=button.isConnected&&!catalog.classList.contains('n59-rules-hidden')&&!document.querySelector('dialog[open]');cancel();if(allowed)handler.call(button,e);},260)};},true);
document.addEventListener('pointerdown',e=>{if(pending&&!pending.button.contains(e.target))cancel();},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')cancel();});document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});
})();

(() => {
'use strict';
if(document.getElementById('n59-cart-motion'))return;
const selector='#v5,#v10,#n59-selected-plus,#n59-selected-minus,#n59-add,#n59-detail-cart,#n59-panel button[data-action="plus"],#n59-panel button[data-action="minus"]';
const style=document.createElement('style');style.id='n59-cart-motion';style.textContent=`
#n59-selected-qty,#n59-cart-count{display:inline-block}
@media(prefers-reduced-motion:no-preference){
#dialog .volumes button,#n59-selection .n59-controls button,#n59-panel .n59-controls button,#n59-add,#n59-detail-cart{transition:transform .14s ease,box-shadow .2s ease,border-color .2s ease}
#dialog .volumes button:not(:disabled):active,#n59-selection .n59-controls button:not(:disabled):active,#n59-panel .n59-controls button:not(:disabled):active,#n59-add:not(:disabled):active,#n59-detail-cart:not(:disabled):active{transform:scale(.94);box-shadow:0 0 12px #dfbb7830}
}
`;document.head.append(style);
const motion=matchMedia('(prefers-reduced-motion: reduce)'),animations=new WeakMap();
function pulse(node,success=false){if(!node?.isConnected||!node.animate||motion.matches)return;animations.get(node)?.cancel();const animation=node.animate([{transform:'scale(.96)',boxShadow:'0 0 0 0 #dfbb7800'},{transform:'scale(1.025)',boxShadow:success?'0 0 16px 2px #dfbb7850':'0 0 10px #dfbb7830',offset:.5},{transform:'scale(1)',boxShadow:'0 0 0 0 #dfbb7800'}],{duration:success?340:230,easing:'cubic-bezier(.2,.7,.3,1)'});animations.set(node,animation);}
document.addEventListener('click',e=>{const button=e.target instanceof Element?e.target.closest(selector):null;if(!button||button.disabled||button.getAttribute('aria-disabled')==='true')return;const badge=document.getElementById('n59-cart-count'),before=parseInt(badge?.textContent,10)||0,quantity=document.getElementById('n59-selected-qty')?.textContent;pulse(button);queueMicrotask(()=>{const after=parseInt(badge?.textContent,10)||0;if(document.getElementById('n59-selected-qty')?.textContent!==quantity)pulse(document.getElementById('n59-selected-qty'));if(after!==before)pulse(badge);if(after>before){pulse(document.getElementById('n59-detail-cart'),true);pulse(document.querySelector('#n59-navigation #n59-cart svg'),true);}});},true);
})();
