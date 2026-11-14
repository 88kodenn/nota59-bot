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
.wrap .hero{position:relative;isolation:isolate;display:block!important;padding:0!important;overflow:hidden;background:#14120f!important;border-radius:16px}
.wrap .hero.n59-rules-hidden{display:none!important}
.wrap .hero::before,.wrap .hero .bottle{display:none!important}
.wrap .hero .n59-hero-art{position:relative;display:grid;grid-template-columns:minmax(0,1fr);isolation:isolate;min-width:0;aspect-ratio:3/2;background:#14120f}
.wrap .hero .n59-hero-photo{position:static;grid-area:1/1;z-index:0;display:block;width:100%;max-width:100%;height:auto!important;align-self:start;object-fit:contain;object-position:center}
.wrap .hero .n59-hero-art::before{content:'';position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(90deg,rgba(8,9,7,.48),transparent 62%)}
.wrap .hero .n59-hero-art h1{grid-area:1/1;position:relative;z-index:2;align-self:start;justify-self:start;box-sizing:border-box;width:48%;max-width:460px;min-height:0!important;margin:32px 0 24px 28px;padding:0!important;font:400 clamp(28px,4vw,48px)/1.1 var(--serif);letter-spacing:-.4px;color:var(--text);overflow-wrap:normal;text-shadow:0 2px 12px #0008}
.wrap .hero h1 em{font-style:normal;color:var(--gold)}
.wrap .hero .hero-copy{position:static;display:block!important;box-sizing:border-box;width:100%;max-width:100%;min-width:0;min-height:0;padding:22px 28px 24px}
.wrap .hero .hero-copy .eyebrow{display:none!important}
.wrap .hero .hero-copy>p{display:block!important;max-width:100%!important;margin:0;color:var(--muted);font:400 14px/1.7 var(--sans)}
.wrap .hero #n59-picker-open{box-sizing:border-box;width:100%;max-width:100%!important;min-height:48px;margin:16px 0 0!important;padding:13px 20px;border:1px solid #dfbb78;border-radius:8px;background:linear-gradient(110deg,#b58a46,#e1bf7c);color:#17130d;font:600 14px/1.4 var(--sans);white-space:normal;text-shadow:none}
.wrap .hero .n59-picker-skip{display:block!important;max-width:100%!important;margin-top:10px!important;color:var(--muted);font:400 12px/1.6 var(--sans)}
.wrap .hero #n59-picker-open:focus-visible{outline:2px solid #f3eade;outline-offset:4px}
@media(max-width:699px){.wrap .hero .n59-hero-art h1{width:49%;max-width:none;margin:22px 0 16px 20px;font-size:clamp(20px,5.5vw,28px);line-height:1.12}.wrap .hero .hero-copy{padding:18px 20px 20px}.wrap .hero .hero-copy>p{font-size:13px}.wrap .hero #n59-picker-open{font-size:13px}}
@media(max-width:359px){.wrap .hero .n59-hero-art h1{margin:16px 0 12px 16px;font-size:19px}.wrap .hero .hero-copy{padding:16px}}
`;document.head.append(style);
const hero=document.querySelector('.hero'),photo=hero?.querySelector('.n59-hero-photo'),heading=hero?.querySelector('h1');
if(hero&&photo&&heading&&!hero.querySelector('.n59-hero-art')){const art=document.createElement('div');art.className='n59-hero-art';hero.prepend(art);art.append(photo,heading);}
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
