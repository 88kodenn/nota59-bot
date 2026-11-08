(() => {
'use strict';
const s=document.getElementById('brand');if(!s||document.getElementById('brand-open'))return;
const logos=window.n59BrandLogos||{};
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const style=el('style');style.textContent=`
#brand-open{min-width:0;width:100%;min-height:48px;padding:10px;background:#191610;color:var(--gold);border:1px solid var(--line);border-radius:9px;font:12px var(--sans);text-overflow:ellipsis;overflow:hidden;white-space:nowrap}
#brand-panel{width:calc(100% - 24px);max-width:480px;max-height:85dvh;background:linear-gradient(140deg,#241e15,#100f0c);border:1px solid #b7935266;border-radius:20px;overflow:hidden;color:var(--text)}
#brand-panel::backdrop{background:#000b;backdrop-filter:blur(6px)}
.bp-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px}
#brand-panel h2{font:600 28px var(--serif);color:var(--gold);margin:0}
.bp-search{display:block;width:calc(100% - 36px);margin:0 18px 14px;padding:13px;border:1px solid var(--line);background:#100e0b;color:var(--text);border-radius:10px;font:16px var(--sans)}
.bp-list{overflow-y:auto;max-height:48dvh;overscroll-behavior:contain;padding:0 12px 18px}
.bp-row{display:flex;align-items:center;gap:12px;width:100%;min-height:68px;padding:10px 8px;border:0;border-bottom:1px solid var(--line);border-radius:8px;background:transparent;color:var(--text);text-align:left;font:14px var(--sans)}
.bp-row[aria-pressed=true]{background:#d5b37518;box-shadow:inset 0 0 0 1px #d5b37566}
.bp-logo{width:68px;height:44px;flex-shrink:0;display:grid;place-items:center;border:1px solid #d1bf9c55;background:#f5f0e6;border-radius:7px;padding:5px;overflow:hidden}
.bp-logo img{width:100%;height:100%;object-fit:contain;display:block}.bp-logo:has(.bp-white){background:#17140f}
.bp-logo img.bp-white{filter:none}.bp-copy{flex:1;min-width:0}.bp-copy small{display:block;color:var(--muted);font:11px var(--sans);margin-top:5px}
.brand .bp-logo{display:inline-flex;width:48px;height:30px;margin-right:8px;vertical-align:middle}
.bp-empty{padding:16px;color:var(--muted)}
@media(prefers-reduced-motion:reduce){#brand-panel[open]{animation:none}}
`;document.head.append(style);
function image(brand){const a=logos[brand];if(!a)return null;const box=el('span',undefined,'bp-logo'),img=el('img');img.src=a.data;img.alt='';img.loading='lazy';img.onerror=()=>box.remove();if(a.white)img.className='bp-white';box.append(img);return box;}
const trigger=el('button','Все бренды ⌄');trigger.id='brand-open';trigger.type='button';trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls','brand-panel');trigger.setAttribute('aria-expanded','false');s.after(trigger);s.hidden=true;
const panel=el('dialog');panel.id='brand-panel';panel.setAttribute('aria-labelledby','bp-heading');const head=el('div',undefined,'bp-head'),title=el('h2','Парфюмерные дома'),close=el('button','×','close');title.id='bp-heading';close.type='button';close.setAttribute('aria-label','Закрыть выбор бренда');head.append(title,close);
const search=el('input',undefined,'bp-search');search.type='search';search.placeholder='Найти бренд';search.setAttribute('aria-label','Поиск бренда');const list=el('div',undefined,'bp-list');panel.append(head,search,list);document.body.append(panel);
function draw(){trigger.textContent=(s.selectedOptions[0]?.textContent||'Все бренды')+' ⌄';list.replaceChildren();const q=search.value.trim().toLowerCase();let found=0;for(const o of s.options){if(o.value&&!o.textContent.toLowerCase().includes(q))continue;found++;const row=el('button',undefined,'bp-row');row.type='button';row.setAttribute('aria-pressed',String(o.value===s.value));const logo=image(o.value);if(logo)row.append(logo);const copy=el('span',o.textContent,'bp-copy');if(typeof data!=='undefined'&&data?.items)copy.append(el('small','Ароматов: '+data.items.filter(p=>!o.value||p.brand===o.value).length));row.append(copy);if(o.value===s.value){const tick=el('span','✓');tick.setAttribute('aria-hidden','true');row.append(tick);}row.onclick=()=>{s.value=o.value;s.dispatchEvent(new Event('change',{bubbles:true}));panel.close();draw();};list.append(row);}if(!found)list.append(el('p','Бренд не найден','bp-empty'));}
trigger.onclick=()=>{search.value='';draw();panel.showModal();trigger.setAttribute('aria-expanded','true');close.focus();};close.onclick=()=>panel.close();panel.addEventListener('close',()=>{trigger.setAttribute('aria-expanded','false');trigger.focus();});search.oninput=draw;s.addEventListener('change',draw);new MutationObserver(draw).observe(s,{childList:true,subtree:true});
function decorate(){for(const n of document.querySelectorAll('#catalog .brand,#maker')){if(n.querySelector('img'))continue;const brand=n.textContent.trim(),logo=image(brand);if(logo)n.prepend(logo);}}
new MutationObserver(decorate).observe(document.getElementById('catalog'),{childList:true,subtree:true});new MutationObserver(decorate).observe(document.getElementById('maker'),{childList:true});decorate();draw();
})();
