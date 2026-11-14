(() => {
'use strict';
function mount(){
 const panel=document.getElementById('n59-special-order');if(!panel||document.getElementById('n59-special-form'))return;
 const make=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
 const style=make('style');style.textContent=`#n59-special-form{margin-top:24px;padding-top:18px;border-top:1px solid var(--line)}#n59-special-form h3{margin:0 0 16px;padding:0;border:0;font:400 25px/1.4 var(--serif);color:var(--gold)}#n59-special-form label{display:grid;gap:7px;margin:14px 0;color:var(--gold);font:400 14px/1.5 var(--sans)}#n59-special-form input,#n59-special-form textarea{box-sizing:border-box;width:100%;min-width:0;min-height:48px;padding:12px;border:1px solid var(--line);border-radius:8px;background:#211b13;color:var(--text);font:400 16px/1.5 var(--sans)}#n59-special-form textarea{resize:vertical}#n59-special-form button{width:100%;min-height:48px;padding:14px;margin-top:14px;border:1px solid var(--gold);border-radius:8px;background:linear-gradient(110deg,#b68b46,#edcf8d,#b88d4c);color:#20170d;font:600 14px/1.5 var(--sans)}#n59-special-form button:disabled{opacity:.5}#n59-special-result{margin-top:14px!important;white-space:pre-wrap;overflow-wrap:anywhere}#n59-special-form .n59-special-note{font-size:12px;line-height:1.7}`;document.head.append(style);
 const form=make('form');form.id='n59-special-form';form.append(make('h3','Заявка на парфюмерию под заказ'));
 const fields={};
 function field(key,title,type,max,required=true){const label=make('label',title),input=make(type==='textarea'?'textarea':'input');input.id='n59-special-'+key;input.name=key;input.required=required;if(type!=='textarea')input.type=type;else input.rows=3;if(max)input.maxLength=max;label.htmlFor=input.id;label.append(input);fields[key]=input;form.append(label);return input;}
 field('fragrance','Бренд и название аромата *','text',200);
 const volume=field('volume','Объём флакона, мл *','number');volume.min='1';volume.max='1000';volume.step='1';volume.placeholder='Например, 50 или 100';
 const qty=field('qty','Количество *','number');qty.min='1';qty.max='99';qty.step='1';qty.value='1';
 const name=field('name','Имя *','text',100);name.autocomplete='name';
 const contact=field('contact','Телефон *','tel',100);contact.inputMode='tel';contact.autocomplete='tel';contact.placeholder='+7 999 123-45-67';
 field('comment','Комментарий: концентрация, упаковка и пожелания','textarea',500,false);
 const note=make('p','Стоимость и наличие подтверждаются перед оплатой. Минимальный заказ — 5 000 рублей. После согласования — предоплата 100%, срок поставки от 2 до 4 недель.');note.className='n59-special-note';
 const submit=make('button','Отправить заявку');submit.type='submit';
 const result=make('p');result.id='n59-special-result';result.setAttribute('role','status');result.setAttribute('aria-live','polite');form.append(note,submit,result);panel.append(form);
 const records=new Map();let busy=false;
 function payload(){return{fragrance:fields.fragrance.value.trim(),volume:Number(volume.value),qty:Number(qty.value),name:name.value.trim(),contact:contact.value.trim(),comment:fields.comment.value.trim()};}
 function validity(){for(const key of ['fragrance','name'])fields[key].setCustomValidity(fields[key].value.trim()?'':'Заполните это поле');const phone=contact.value.trim();contact.setCustomValidity(/^[+0-9\s().-]+$/.test(phone)&&phone.replace(/\D/g,'').length>=7&&phone.replace(/\D/g,'').length<=15?'':'Введите телефон с кодом страны');}
 form.addEventListener('input',()=>{validity();if(!busy){submit.disabled=false;submit.textContent='Отправить заявку';}});
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(busy)return;validity();if(!form.reportValidity())return;
  const initData=window.Telegram?.WebApp?.initData||'';if(!initData){result.textContent='Откройте Mini App заново через Telegram.';return;}
  const body=payload(),fingerprint=JSON.stringify(body);let record=records.get(fingerprint);
  if(record?.number){result.textContent='Эта заявка уже сохранена: '+record.number+'. Она доступна в «Моих заказах».';return;}
  if(!record){const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);record={key:Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')};records.set(fingerprint,record);}
  busy=true;submit.disabled=true;const inputs=Object.values(fields);inputs.forEach(input=>input.disabled=true);result.textContent='Сохраняем заявку…';
  try{
   const response=await fetch('/api/special-orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...body,requestKey:record.key,initData})});
   const answer=await response.json();if(!response.ok||!answer.ok)throw new Error(answer.error||'Не удалось подтвердить сохранение заявки');
   record.number=answer.order_number;result.textContent='Заявка №'+answer.order_number+' сохранена.\nСтатус: '+answer.status_label+'.\nСтоимость уточняется. Заявка доступна в «Моих заказах».'+(answer.seller_notified===false?'\nУведомление продавцу не доставлено. Свяжитесь с продавцом и укажите номер заявки.':'');submit.textContent='Заявка сохранена';
  }catch(error){result.textContent=error.message+'\nНажмите «Повторить проверку»: та же заявка не будет сохранена дважды.';submit.textContent='Повторить проверку';}
  finally{busy=false;inputs.forEach(input=>input.disabled=false);submit.disabled=!!record.number;}
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();

// Standalone order history on the home screen; checkout result stays in the cart.
(() => {
'use strict';
function mount(){
 const top=document.querySelector('.wrap > .top');if(!top||document.getElementById('n59-home-orders'))return;
 const make=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
 const launch=make('div'),open=make('button','Мои заказы');launch.id='n59-home-orders';open.type='button';open.setAttribute('aria-haspopup','dialog');open.setAttribute('aria-controls','n59-history-dialog');launch.append(open);top.append(launch);
 const tagline=top.querySelector('.micro'),logo=top.querySelector('.logo');
 if(tagline&&logo){const brand=make('div');brand.className='n59-brand-heading';logo.before(brand);tagline.className='n59-brand-tagline';tagline.replaceChildren(make('span','Люксовая и нишевая'),make('span','парфюмерия в распив'));brand.append(logo,tagline);}
 const dialog=make('dialog');dialog.id='n59-history-dialog';dialog.setAttribute('aria-labelledby','n59-history-title');
 const head=make('div'),title=make('h2','Мои заказы'),close=make('button','×'),refresh=make('button','Обновить'),content=make('div');head.className='n59-history-head';title.id='n59-history-title';close.type=refresh.type='button';close.className='close';close.setAttribute('aria-label','Закрыть историю заказов');content.id='n59-history-content';content.setAttribute('role','status');content.setAttribute('aria-live','polite');head.append(title,close);dialog.append(head,refresh,content);document.body.append(dialog);
 const style=make('style');style.textContent=`#n59-order-history{display:none!important}#n59-home-orders{display:flex;justify-content:flex-end;flex-shrink:0;margin:0 0 0 auto}.top .n59-brand-heading{display:flex;flex-direction:column;align-items:flex-start;gap:6px;min-width:0}.top .n59-brand-tagline{display:block;margin:0;color:var(--muted);font:500 10px/1.6 var(--sans);letter-spacing:.25px;text-transform:none}.top .n59-brand-tagline>span{display:block;white-space:nowrap}#n59-home-orders button,#n59-history-dialog>button{min-height:44px;padding:10px 14px;border:1px solid var(--line);border-radius:8px;background:#211b13;color:var(--gold);font:500 13px/1.5 var(--sans)}#n59-history-dialog{box-sizing:border-box;padding:0 16px 20px;width:calc(100% - 20px);max-width:550px;max-height:calc(100dvh - 24px);overscroll-behavior:contain}#n59-history-dialog .n59-history-head{position:sticky;top:0;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 -16px 14px;padding:14px 16px;background:#14120f;border-bottom:1px solid var(--line)}#n59-history-dialog h2{margin:0;font:400 30px/1.3 var(--serif);color:var(--gold)}#n59-history-content{margin-top:14px}#n59-history-content article{padding:16px 0;border-bottom:1px solid var(--line)}#n59-history-content h3{margin:0 0 8px;padding:0;border:0;font:500 16px/1.5 var(--sans);color:var(--gold)}#n59-history-content p{margin:6px 0;color:var(--muted);font:400 14px/1.7 var(--sans);overflow-wrap:anywhere}`;document.head.append(style);
 let controller=null,generation=0;
 const money=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₽';
 async function load(){
  controller?.abort();controller=new AbortController();const token=++generation;refresh.disabled=true;content.setAttribute('aria-busy','true');content.replaceChildren(make('p','Загружаем заказы…'));
  try{
   const init=window.Telegram?.WebApp?.initData||'';if(!init)throw new Error('Откройте Mini App заново через Telegram.');
   const response=await fetch('/api/orders?init='+encodeURIComponent(init),{cache:'no-store',signal:controller.signal});const answer=await response.json();if(!response.ok||!answer.ok||!Array.isArray(answer.orders))throw new Error(answer.error||'Не удалось загрузить историю. Нажмите «Обновить».');if(token!==generation||!dialog.open)return;
   content.replaceChildren();if(!answer.orders.length)content.append(make('p','Заказов и заявок пока нет.'));
   for(const order of answer.orders){const card=make('article'),special=order.order_type==='special';card.append(make('h3',(special?'Заявка №':'Заказ №')+order.order_number),make('p',special?'Парфюмерия под заказ':'Ароматы из каталога'));for(const item of order.items||[])card.append(make('p',item.name+' · '+item.volume+' мл × '+item.qty));card.append(make('p',special||typeof order.total!=='number'?'Цена уточняется':'Итого за товары: '+money(order.total)),make('p','Статус: '+order.status_label));content.append(card);}
  }catch(error){if(error.name!=='AbortError'&&token===generation)content.replaceChildren(make('p',error.message));}
  finally{if(token===generation){refresh.disabled=false;content.removeAttribute('aria-busy');}}
 }
 open.addEventListener('click',()=>{if(!dialog.open)dialog.showModal();close.focus({preventScroll:true});load();});close.addEventListener('click',()=>dialog.close());refresh.addEventListener('click',load);
 dialog.addEventListener('close',()=>{generation++;controller?.abort();refresh.disabled=false;content.removeAttribute('aria-busy');open.focus({preventScroll:true});});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
