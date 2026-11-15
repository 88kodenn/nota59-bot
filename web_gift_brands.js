(() => {
'use strict';
function mount(){
const owner=document.getElementById('n59-gift-builder'),source=document.getElementById('brand-panel');
const select=owner?.querySelector('.gift-filters select');
if(!select||!source)return false;if(document.getElementById('n59-gift-brand-open'))return true;
const make=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
const baseStyle=Array.from(document.querySelectorAll('style')).find(s=>s.textContent.includes('#brand-open{')&&s.textContent.includes('.bp-list{'));
const style=make('style');style.textContent=(baseStyle?.textContent||'').replaceAll('#brand-panel','#n59-gift-brand-panel').replaceAll('#brand-open','#n59-gift-brand-open')+`
#n59-gift-builder select[data-gift-brand-native]{display:none!important}
#n59-gift-builder #n59-gift-brand-open{display:block;box-sizing:border-box;width:100%;min-width:0;min-height:48px;margin:6px 0 12px;padding:10px;background:#191610;color:var(--gold);border:1px solid var(--line);border-radius:9px;font:12px var(--sans);text-align:left;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}
#n59-gift-brand-panel{box-sizing:border-box;width:calc(100% - 24px);max-width:480px;max-height:calc(var(--n59-visible-height,100dvh) - 24px);padding:0;overscroll-behavior:contain}
#n59-gift-brand-panel h2{font:400 24px/1.35 var(--serif);margin:0;color:var(--gold)}
#n59-gift-brand-panel .bp-list{max-height:48dvh;max-height:min(48dvh,calc(var(--n59-visible-height,100dvh) - 180px));overflow-y:auto}
#n59-gift-brand-panel button:focus-visible,#n59-gift-brand-panel input:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
`;document.head.append(style);
const trigger=make('button','Все бренды ⌄');trigger.id='n59-gift-brand-open';trigger.type='button';trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls','n59-gift-brand-panel');trigger.setAttribute('aria-expanded','false');select.hidden=true;select.setAttribute('data-gift-brand-native','');select.after(trigger);
const panel=make('dialog');panel.id='n59-gift-brand-panel';panel.setAttribute('aria-labelledby','n59-gift-brand-heading');
const head=make('div',undefined,'bp-head'),title=make('h2','Парфюмерные дома'),close=make('button','×','close');title.id='n59-gift-brand-heading';close.type='button';close.setAttribute('aria-label','Закрыть выбор бренда');head.append(title,close);
const search=make('input',undefined,'bp-search');search.type='search';search.placeholder='Найти бренд';search.setAttribute('aria-label','Поиск бренда в подарочном наборе');
const list=make('div',undefined,'bp-list');panel.append(head,search,list);document.body.append(panel);
const templates=new Map(),key=s=>String(s).toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
function remember(){for(const name of source.querySelectorAll('.bp-name'))templates.set(key(name.textContent),name.cloneNode(true));}
function sync(){trigger.textContent=(select.selectedOptions[0]?.textContent||'Все бренды')+' ⌄';}
function draw(){
remember();sync();list.replaceChildren();const q=search.value.trim().toLowerCase();
const volume=Number(owner.querySelector('.gift-body>p')?.textContent.match(/по\s+(5|10)\s+мл/)?.[1])||5;
const items=typeof data!=='undefined'&&Array.isArray(data?.items)?data.items:[];
let found=0;
for(const option of select.options){
if(option.disabled||option.value&&!option.textContent.toLowerCase().includes(q))continue;
const count=items.filter(p=>p.available!==false&&Number.isInteger(p['price'+volume])&&p['price'+volume]>0&&(!option.value||p.brand===option.value)).length;
if(option.value&&!count&&option.value!==select.value)continue;
found++;const row=make('button',undefined,'bp-row');row.type='button';row.setAttribute('aria-pressed',String(option.value===select.value));
const copy=make('span',undefined,'bp-copy'),template=templates.get(key(option.textContent));copy.append(template?template.cloneNode(true):make('span',option.textContent,'bp-name'),make('small','Ароматов: '+count));row.append(copy);
if(option.value===select.value){const tick=make('span','✓');tick.setAttribute('aria-hidden','true');row.append(tick);}
row.addEventListener('click',()=>{select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));panel.close();sync();});list.append(row);
}
if(!found){const empty=make('p','Бренд не найден','bp-empty');empty.setAttribute('role','status');list.append(empty);}
}
trigger.addEventListener('click',()=>{search.value='';draw();if(!panel.open)panel.showModal();list.scrollTop=0;trigger.setAttribute('aria-expanded','true');close.focus({preventScroll:true});});
close.addEventListener('click',()=>panel.close());search.addEventListener('input',draw);select.addEventListener('change',sync);
panel.addEventListener('close',()=>{trigger.setAttribute('aria-expanded','false');if(owner.open&&trigger.isConnected)trigger.focus({preventScroll:true});});
owner.addEventListener('close',()=>{if(panel.open)panel.close();});
new MutationObserver(()=>{sync();if(panel.open)draw();}).observe(select,{childList:true,subtree:true});
new MutationObserver(()=>{remember();if(panel.open)draw();}).observe(source.querySelector('.bp-list')||source,{childList:true,subtree:true});
remember();sync();return true;
}
function start(){if(mount())return;const observer=new MutationObserver(()=>{if(mount())observer.disconnect();});observer.observe(document.body,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
