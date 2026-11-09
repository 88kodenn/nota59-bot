(() => {
'use strict';
const $=id=>document.getElementById(id);
if(!$('order')||$('n59-cart'))return;
const make=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const button=(text,fn,label)=>{const b=make('button',text);b.type='button';b.onclick=fn;if(label)b.setAttribute('aria-label',label);return b;};
const key='nota59-cart-v2',fmt=n=>new Intl.NumberFormat('ru-RU').format(n)+' ₽';
let rows=[],storageOK=true;
try{const saved=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(saved))rows=saved.filter(r=>r&&typeof r.name==='string'&&typeof r.brand==='string'&&[5,10].includes(r.volume)&&Number.isInteger(r.qty)&&r.qty>0&&r.qty<=99).slice(0,20);}catch(e){storageOK=false;}
const catalog=()=>typeof data!=='undefined'&&Array.isArray(data?.items)?data.items:[];
function product(r){return catalog().find(p=>p.name===r.name&&p.brand===r.brand);}
function price(r){const p=product(r),v=p?.[r.volume===5?'price5':'price10'];return typeof v==='number'&&Number.isFinite(v)&&v>0?v:null;}
const style=make('style');style.textContent=`
#n59-cart{position:static;min-height:44px;border:1px solid var(--gold);border-radius:9px;padding:10px 14px;background:#211b13;color:var(--gold);font:600 13px var(--sans);box-shadow:none;white-space:normal}
.top{flex-wrap:wrap}#n59-navigation.n59-with-cart{grid-template-columns:repeat(3,minmax(0,1fr))}#n59-navigation #n59-cart{position:relative;min-width:0;width:100%;border:0;border-radius:0;letter-spacing:0;gap:4px;padding:10px 3px;background:none;color:var(--gold);white-space:normal;font:500 11px/1.4 var(--sans)}#n59-navigation #n59-cart svg{width:24px;height:24px}#n59-cart-count{font-size:11px;font-weight:600;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
#n59-add,#n59-detail-cart{border:1px solid var(--gold);background:#211b13;color:var(--gold);padding:12px;border-radius:7px;min-height:44px;width:100%;font-size:14px}.purchase{flex-wrap:wrap;background:#14120f!important}#n59-panel{padding:18px}#n59-panel h2{font:600 32px var(--serif);margin:0;color:var(--gold)}.n59-head{display:flex;justify-content:space-between;align-items:center;gap:10px}.n59-head button{width:44px;height:44px;background:#211b13;color:var(--gold);border:1px solid var(--line);border-radius:50%;font-size:24px}.n59-row{border-bottom:1px solid var(--line);padding:16px 0;overflow-wrap:anywhere}.n59-row p{margin:5px 0;font-size:14px}.n59-controls{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:10px}.n59-controls button{min-width:44px;min-height:44px;border:1px solid var(--line);background:#211b13;color:var(--gold);border-radius:7px}.n59-controls span{min-width:24px;text-align:center}#n59-checkout{display:block;margin:16px 0}#n59-total{font-size:20px;color:var(--gold)}#n59-message{font-size:13px;line-height:1.6;color:var(--muted)}#n59-notice{display:block;font-size:12px;color:var(--gold);flex-basis:100%;overflow-wrap:anywhere}#n59-notice:empty{display:none}#n59-selection{font-size:13px;line-height:1.6;color:var(--gold);margin:12px 0;padding:12px;border:1px solid var(--line);border-radius:8px}#n59-checkout[aria-disabled=true]{opacity:.5;pointer-events:none}
`;document.head.append(style);
const panel=make('dialog');panel.id='n59-panel';panel.setAttribute('aria-labelledby','n59-title');const head=make('div',undefined,'n59-head'),title=make('h2','Корзина');title.id='n59-title';head.append(title,button('×',()=>panel.close(),'Закрыть корзину'));
const list=make('div'),total=make('p'),message=make('p'),checkout=make('a','Обсудить весь заказ ↗','order');list.id='n59-items';total.id='n59-total';message.id='n59-message';message.setAttribute('role','status');checkout.id='n59-checkout';checkout.target='_blank';checkout.rel='noopener noreferrer';checkout.onclick=e=>{if(checkout.getAttribute('aria-disabled')==='true')e.preventDefault();};panel.append(head,list,total,checkout,message);document.body.append(panel);
function openCart(){draw();if($('dialog').open)$('dialog').close();if(!panel.open)panel.showModal();}
const fab=button('',openCart);fab.id='n59-cart';fab.setAttribute('aria-haspopup','dialog');fab.setAttribute('aria-controls','n59-panel');
const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');icon.innerHTML='<path d="M3 3h2l2 12h11l3-9H6M9 20h.01M18 20h.01"/>';const caption=make('span','Корзина'),badge=make('span');badge.id='n59-cart-count';fab.append(icon,caption,badge);
const fallback=document.querySelector('.top')||document.body;fallback.append(fab);
function placeCart(){const nav=$('n59-navigation');if(nav&&fab.parentNode!==nav){nav.classList.add('n59-with-cart');nav.append(fab);}}
new MutationObserver(placeCart).observe(document.body,{childList:true});placeCart();
const notice=make('span');notice.id='n59-notice';notice.setAttribute('role','status');const selection=make('p');selection.id='n59-selection';selection.setAttribute('aria-live','polite');document.querySelector('#dialog .volumes').after(selection);
const detailCart=button('Открыть корзину',openCart);detailCart.id='n59-detail-cart';
function selectedCount(){if(typeof selected==='undefined'||!selected)return;const v=$('v10').getAttribute('aria-pressed')==='true'?10:5;const matches=rows.filter(r=>r.name===selected.name&&r.brand===selected.brand);const qty=matches.filter(r=>r.volume===v).reduce((s,r)=>s+r.qty,0),ml=matches.reduce((s,r)=>s+r.qty*r.volume,0);selection.textContent='В корзине: '+qty+' шт. по '+v+' мл. Всего этого аромата: '+ml+' мл.';}
function persist(){try{localStorage.setItem(key,JSON.stringify(rows));storageOK=true;}catch(e){storageOK=false;}draw();}
function draw(){
list.replaceChildren();let sum=0,invalid=false;
if(!rows.length)list.append(make('p','Корзина пуста. Выберите аромат и объём, затем нажмите «В корзину».'));
rows.forEach((r,i)=>{const cost=price(r);if(cost===null)invalid=true;else sum+=cost*r.qty;const line=make('section',undefined,'n59-row'),name=make('strong',r.name.startsWith(r.brand+' ')?r.name:r.brand+' — '+r.name),details=make('p',r.volume+' мл · '+(cost===null?'Нет актуальной цены — удалите позицию':fmt(cost)+' за шт. · '+fmt(cost*r.qty))),controls=make('div',undefined,'n59-controls');const minus=button('−',()=>{if(r.qty===1)rows.splice(i,1);else r.qty--;persist();},'Уменьшить количество');minus.dataset.action='minus';const plus=button('+',()=>{if(r.qty<99){r.qty++;persist();}},'Увеличить количество');plus.dataset.action='plus';plus.disabled=r.qty>=99;const remove=button('Удалить',()=>{rows.splice(i,1);persist();},'Удалить '+r.name);remove.dataset.action='remove';controls.append(minus,make('span',String(r.qty)),plus,remove);line.append(name,details,controls);list.append(line);});
const count=rows.reduce((s,r)=>s+r.qty,0);badge.textContent=count+' шт. · '+fmt(sum);fab.setAttribute('aria-label','Корзина: '+count+' шт., '+fmt(sum));detailCart.textContent='Открыть корзину · '+count+' шт. · '+fmt(sum);selectedCount();total.textContent=(invalid?'Сумма доступных позиций: ':'Итого: ')+fmt(sum);
const text='Здравствуйте! Хочу заказать:\n\n'+rows.map((r,i)=>(i+1)+'. '+r.name+' — '+r.volume+' мл × '+r.qty+' = '+fmt((price(r)||0)*r.qty)).join('\n')+'\n\nИтого: '+fmt(sum)+'\nПодскажите наличие и условия покупки.';
const seller=typeof data!=='undefined'?String(data?.seller||'').replace(/^@/,''):'';
const enabled=rows.length>0&&!invalid&&text.length<=3500&&/^[A-Za-z0-9_]+$/.test(seller);
checkout.setAttribute('aria-disabled',String(!enabled));if(enabled)checkout.href='https://t.me/'+encodeURIComponent(seller)+'?text='+encodeURIComponent(text);else checkout.removeAttribute('href');
message.textContent=(storageOK?'':'Сохранение недоступно: выбор действует только до закрытия страницы. ')+(invalid?'Часть позиций недоступна. Удалите их перед заказом.':text.length>3500?'Слишком длинный заказ. Уменьшите число позиций.':'Откроется черновик сообщения продавцу. Проверьте его и нажмите «Отправить» в Telegram. Наличие и доставка уточняются отдельно.');
}
const add=button('В корзину',()=>{if(typeof selected==='undefined'||!selected)return;const v=$('v10').getAttribute('aria-pressed')==='true'?10:5;const r={name:selected.name,brand:selected.brand,volume:v,qty:1};if(price(r)===null){notice.textContent='Для этого объёма нет актуальной цены.';return;}const found=rows.find(x=>x.name===r.name&&x.brand===r.brand&&x.volume===v);if(found){if(found.qty>=99){notice.textContent='Максимум 99 штук на позицию.';return;}found.qty++;}else{if(rows.length>=20){notice.textContent='Максимум 20 разных позиций в одном заказе.';return;}rows.push(r);}persist();notice.textContent='Добавлена 1 шт. по '+v+' мл. Количество указано под выбором объёма.';});add.id='n59-add';$('order').after(add,detailCart,notice);
new MutationObserver(()=>{notice.textContent='';selectedCount();}).observe($('title'),{childList:true});
new MutationObserver(selectedCount).observe(document.querySelector('#dialog .volumes'),{attributes:true,subtree:true,attributeFilter:['aria-pressed']});
new MutationObserver(draw).observe($('catalog'),{childList:true});
panel.addEventListener('close',()=>fab.focus());draw();
})();
