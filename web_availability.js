(() => {
'use strict';
function start(){
if(document.getElementById('n59-availability-style'))return;
const name='Kilian Angels Share',label='Временно нет в наличии',$=id=>document.getElementById(id);
const style=document.createElement('style');style.id='n59-availability-style';style.textContent=`
.n59-stock-status{display:block;width:fit-content;max-width:100%;margin:0 0 12px;padding:6px 9px;border:1px solid #dfbb7845;border-radius:7px;background:#302616;color:var(--gold);font:500 11px/1.5 var(--sans);overflow-wrap:anywhere}
#dialog .n59-stock-status{margin:12px 0 16px;font-size:13px}
#dialog button[data-n59-stock-disabled]{opacity:.4;cursor:not-allowed}
#n59-items .n59-stock-status{margin:9px 0;font-size:12px}
`;
document.head.append(style);
function badge(parent,before=null){if(!parent||parent.querySelector('.n59-stock-status'))return;const node=document.createElement('p');node.className='n59-stock-status';node.textContent=label;if(before)parent.insertBefore(node,before);else parent.append(node);}
function unavailableSelected(){return typeof selected!=='undefined'&&selected?.name===name;}
function unavailableRows(){return [...document.querySelectorAll('#n59-items .n59-row')].filter(row=>row.querySelector('strong')?.textContent===name);}
function sync(){
for(const card of document.querySelectorAll('#catalog .card'))if(card.querySelector('.more')?.getAttribute('aria-label')==='Открыть аромат '+name){const info=card.querySelector('.info');badge(info,info?.querySelector('.name'));}
const unavailable=unavailableSelected(),detail=document.querySelector('#dialog .detail');
if(unavailable)badge(detail,detail?.querySelector('.volumes'));else detail?.querySelector('.n59-stock-status')?.remove();
for(const id of ['v5','v10','n59-selected-plus','n59-add']){const button=$(id);if(!button)continue;if(unavailable){if(!button.hasAttribute('data-n59-stock-disabled'))button.dataset.n59StockDisabled=String(button.disabled);button.disabled=true;}else if(button.hasAttribute('data-n59-stock-disabled')){button.disabled=button.dataset.n59StockDisabled==='true';delete button.dataset.n59StockDisabled;}}
for(const row of unavailableRows()){badge(row);const plus=row.querySelector('button[data-action="plus"]');if(plus)plus.disabled=true;}
}
function warn(){const result=$('n59-order-result');if(result){result.textContent=name+' — временно нет в наличии. Удалите аромат из корзины перед оформлением.';result.scrollIntoView({block:'nearest'});}}
document.addEventListener('click',event=>{const target=event.target instanceof Element?event.target:null;if(!target)return;const add=target.closest('#n59-selected-plus,#n59-add');const plus=target.closest('#n59-items button[data-action="plus"]');const checkout=target.closest('#n59-order-submit,#n59-checkout');if((add&&unavailableSelected())||(plus&&plus.closest('.n59-row')?.querySelector('strong')?.textContent===name)||(checkout&&unavailableRows().length)){event.preventDefault();event.stopImmediatePropagation();if(checkout)warn();}},true);
document.addEventListener('submit',event=>{if(event.target?.id==='n59-form'&&unavailableRows().length){event.preventDefault();event.stopImmediatePropagation();warn();}},true);
new MutationObserver(sync).observe(document.body,{childList:true,subtree:true});sync();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
