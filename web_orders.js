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
