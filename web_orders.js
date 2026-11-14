(() => {
'use strict';
if(window.n59OrdersV2)return;window.n59OrdersV2=true;
const $=id=>document.getElementById(id),make=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;},money=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₽',initData=()=>window.Telegram?.WebApp?.initData||'';
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
.hero .bottle{width:140px;height:238px;background:none!important;border:0!important;border-radius:0!important;box-shadow:none!important;transform:none!important;pointer-events:none;filter:drop-shadow(0 18px 18px #0009)}
.hero .bottle::before,.hero .bottle::after{display:none!important}.hero .bottle>svg{display:block;width:100%;height:100%;overflow:visible}
@media(min-width:700px){.hero .bottle{right:48px;top:64px;bottom:auto}}
@media(min-width:360px) and (max-width:699px){.hero .bottle{right:16px;top:60px;bottom:auto;width:72px;height:146px}.hero h1{box-sizing:border-box;padding-right:78px}}
@media(max-width:359px){.hero .bottle{display:none}}
`;document.head.append(style);
let watched=null;
const resize='ResizeObserver' in window?new ResizeObserver(()=>sync()):null;
function sync(){
const brand=document.getElementById('brand-open'),fav=document.querySelector('#n59-fav-launch button');
if(brand&&fav){const box=brand.getBoundingClientRect();if(box.width&&box.height){const css=getComputedStyle(brand);for(const prop of ['font','letter-spacing','color','background-color','border','border-radius','padding','box-shadow'])fav.style.setProperty(prop,css.getPropertyValue(prop));Object.assign(fav.style,{boxSizing:'border-box',width:box.width+'px',height:box.height+'px',minHeight:box.height+'px',display:'flex',alignItems:'center',justifyContent:'center',whiteSpace:'nowrap'});}if(watched!==brand){resize?.disconnect();resize?.observe(brand);watched=brand;}}
const bottle=document.querySelector('.hero .bottle');if(bottle&&!bottle.dataset.n59Faceted){bottle.dataset.n59Faceted='1';bottle.setAttribute('aria-hidden','true');bottle.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 238" fill="none"><defs><linearGradient id="n59-glass" x1="18" y1="70" x2="123" y2="211" gradientUnits="userSpaceOnUse"><stop stop-color="#41433c"/><stop offset=".25" stop-color="#121713"/><stop offset=".7" stop-color="#050706"/><stop offset="1" stop-color="#383126"/></linearGradient><linearGradient id="n59-metal"><stop stop-color="#77552b"/><stop offset=".45" stop-color="#f2d69a"/><stop offset="1" stop-color="#8c6738"/></linearGradient></defs><ellipse cx="70" cy="228" rx="56" ry="8" fill="#000" opacity=".4"/><path d="M39 10H101L110 20V51L101 59H39L30 51V20Z" fill="#141714" stroke="#77766a"/><path d="M39 10V48H101V10M30 20H110" stroke="#a7a593" opacity=".4"/><path d="M43 59H97V71H43Z" fill="url(#n59-metal)"/><path d="M43 71H97L124 96V207L111 222H29L16 207V96Z" fill="url(#n59-glass)" stroke="url(#n59-metal)" stroke-width="1.5"/><path d="M43 71L31 101V204L29 222M97 71L109 101V204L111 222M16 96L31 101H109L124 96M16 207L31 204H109L124 207" stroke="#c9ab6c" opacity=".48"/><path d="M35 106H105V196H35Z" fill="#090c0a" stroke="#8a703e"/><path d="M41 112H99V190H41Z" stroke="#443b27"/><text x="70" y="145" fill="#e3c17d" font-family="Georgia,serif" font-size="13" text-anchor="middle">НОТА</text><text x="70" y="173" fill="#e3c17d" font-family="Georgia,serif" font-size="25" text-anchor="middle">59</text><path d="M22 99V202M35 101V194" stroke="#e3dcc0" opacity=".17" stroke-width="2"/></svg>`;}
}
new MutationObserver(sync).observe(document.body,{childList:true,subtree:true});window.addEventListener('resize',sync,{passive:true});document.fonts?.ready.then(sync);sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
