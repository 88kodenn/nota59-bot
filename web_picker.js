(() => {
'use strict';
const hero=document.querySelector('.hero-copy');
if(!hero||document.getElementById('n59-picker'))return;
const make=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const btn=(text,fn,cls)=>{const b=make('button',text,cls);b.type='button';b.onclick=fn;return b;};
const current=()=>typeof data!=='undefined'&&Array.isArray(data?.items)?data:null;
const clean=s=>String(s).toLowerCase().replaceAll('ё','е').trim();
const style=make('style');style.textContent=`
#n59-picker-open{position:relative;z-index:2;display:block;margin-top:16px;padding:13px 16px;min-height:48px;border:1px solid var(--gold);border-radius:8px;background:linear-gradient(110deg,#b68b46,#edcf8d,#b88d4c);color:#20170d;font:600 14px var(--sans);max-width:100%}
.hero-copy .n59-picker-intro{max-width:250px;font-size:12px}.hero-copy .n59-picker-skip{display:block;font-size:11px;margin-top:9px;color:var(--muted)}
#n59-picker{padding:0;max-width:520px;max-height:85dvh;overflow:auto;background:#14120f;color:var(--text)}
#n59-picker .qp-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px;border-bottom:1px solid var(--line)}
#n59-picker h2{font:600 30px/1.1 var(--serif);margin:0;color:var(--gold)}
#n59-picker .qp-close{width:44px;height:44px;flex-shrink:0;border:1px solid var(--line);border-radius:50%;background:#211b13;color:var(--gold);font-size:24px}
#n59-picker .qp-body{padding:18px}#n59-picker .qp-step{font-size:12px;color:var(--muted);margin:0 0 12px}
#n59-picker h3{margin:0 0 16px;padding:0;border:0;font:600 26px/1.2 var(--serif)}
#n59-picker .qp-options{display:grid;gap:9px}#n59-picker .qp-option{width:100%;min-height:52px;text-align:left;padding:12px;border:1px solid var(--line);border-radius:10px;background:#1e1912;color:var(--text);font:500 14px/1.5 var(--sans)}
#n59-picker .qp-option small{display:block;margin-top:4px;color:var(--muted);font-size:12px}#n59-picker .qp-option[aria-pressed=true]{border-color:var(--gold);background:#322819}
#n59-picker .qp-nav{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}#n59-picker .qp-nav button,#n59-picker .qp-detail{min-height:44px;padding:10px 14px;border:1px solid var(--gold);border-radius:8px;background:#211b13;color:var(--gold);font:500 13px var(--sans)}
#n59-picker .qp-result{border:1px solid var(--line);border-radius:12px;padding:14px;margin:12px 0}#n59-picker .qp-result h4{font:600 25px/1.2 var(--serif);margin:5px 0 10px}#n59-picker .qp-result p,#n59-picker .qp-note{font-size:13px;line-height:1.7;color:var(--muted);margin:8px 0}#n59-picker .qp-brand{font-size:11px;color:var(--gold);text-transform:uppercase}
@media(max-width:360px){#n59-picker .qp-body,#n59-picker .qp-head{padding:14px}#n59-picker h2{font-size:26px}}
`;document.head.append(style);
const intro=hero.querySelector('p');if(intro){intro.classList.add('n59-picker-intro');intro.textContent='Не знаете, что выбрать? Ответьте на два простых вопроса — поможем сузить выбор.';}
const panel=make('dialog');panel.id='n59-picker';panel.setAttribute('aria-labelledby','n59-picker-title');
const head=make('div',undefined,'qp-head'),title=make('h2','Подобрать аромат');title.id='n59-picker-title';
const close=btn('×',()=>panel.close(),'qp-close');close.setAttribute('aria-label','Закрыть подбор');head.append(title,close);
const body=make('div',undefined,'qp-body');panel.append(head,body);document.body.append(panel);
let step=0,answers=['',''];
const questions=[
 {title:'Для какого случая ищете аромат?',options:[['На каждый день','На каждый день','Искать в повседневной подборке магазина'],['На вечер','На вечер','Искать в вечерней подборке магазина'],['','Пока не знаю','Не учитывать случай']]},
 {title:'Какой характер аромата вам ближе?',options:[['Свежий','Свежий','Ощущение свежести, цитрусовые и зелёные оттенки'],['Сладкий','Сладкий','Ароматы со сладкими оттенками'],['Древесный','Древесный','Акцент на древесном характере'],['Пряный','Пряный','Специи и пряные оттенки'],['Гурманский','Гурманский','Ассоциации с десертами'],['Дымный','Дымный','Дымные оттенки'],['','Пока не знаю','Не учитывать характер']]}
];
function categories(){const raw=current()?.pickerCategories;return raw&&typeof raw==='object'&&!Array.isArray(raw)?Object.entries(raw).map(([label,names])=>[clean(label).replace(/[^\p{L}\p{N} ]/gu,'').trim(),new Set(Array.isArray(names)?names:[])]):[];}
function belongs(name,label,groups){return groups.some(([key,names])=>key===clean(label)&&names.has(name));}
function leave(){panel.close();document.getElementById('catalog')?.scrollIntoView({block:'start',behavior:'smooth'});}
function focusHeading(){panel.scrollTop=0;const h=body.querySelector('h3');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}}
function render(){body.replaceChildren();if(step===questions.length){results();focusHeading();return;}
 body.append(make('p','Шаг '+(step+1)+' из '+questions.length,'qp-step'));
 const q=questions[step];body.append(make('h3',q.title));const options=make('div',undefined,'qp-options');
 for(const [value,label,hint] of q.options){const b=btn(label,()=>{answers[step]=value;step++;render();},'qp-option');b.setAttribute('aria-pressed',String(answers[step]===value));b.append(make('small',hint));options.append(b);}body.append(options);
 const nav=make('div',undefined,'qp-nav');if(step)nav.append(btn('Назад',()=>{step--;render();}));nav.append(btn('Закрыть подбор',()=>panel.close()));body.append(nav);focusHeading();}
function results(){
 body.append(make('h3','Результаты подбора'));
 const catalog=current(),labels=answers.filter(Boolean),groups=categories();
 if(!catalog){body.append(make('p','Каталог ещё загружается. Попробуйте снова.','qp-note'));}
 else if(!labels.length){body.append(make('p','Вы пока не указали пожелания. Выберите случай или характер аромата — без этого мы не будем предлагать случайные варианты.','qp-note'));}
 else if(!groups.length){body.append(make('p','Подборки временно недоступны. Можно посмотреть каталог самостоятельно.','qp-note'));}
 else {
 const chosen=catalog.items.filter(p=>labels.every(label=>belongs(p.name,label,groups)));
 body.append(make('p','Вы выбрали: '+labels.join(' · ')+'.','qp-note'));
 body.append(make('p',chosen.length?'Совпадений в подборках: '+chosen.length+'. Показаны все совпадения в порядке каталога, без ранжирования.':'В текущей разметке нет ароматов, соответствующих всем выбранным условиям. Мы не подставляем варианты, подходящие только частично. Измените один из ответов.','qp-note'));
 for(const p of chosen){const card=make('section',undefined,'qp-result');card.append(make('span',p.brand,'qp-brand'),make('h4',p.name.startsWith(p.brand+' ')?p.name.slice(p.brand.length+1):p.name));card.append(make('p','Совпало по подборкам магазина: '+labels.join(' · ')+'.'));card.append(btn('Подробнее',()=>{panel.close();openProduct(p);},'qp-detail'));body.append(card);}
 }
 body.append(make('p','Подбор основан на существующей разметке магазина. Ароматы без разметки пока не участвуют; категории не описывают все нюансы звучания. Восприятие индивидуально. Ответы не сохраняются и не отправляются.','qp-note'));
 const nav=make('div',undefined,'qp-nav');nav.append(btn('Изменить ответы',()=>{step=0;render();}),btn('Вернуться в каталог',leave));body.append(nav);
}
const trigger=btn('Подобрать аромат',()=>{step=0;answers=['',''];render();panel.showModal();focusHeading();});trigger.id='n59-picker-open';trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls','n59-picker');hero.append(trigger,make('span','Или выберите самостоятельно в каталоге ниже','n59-picker-skip'));
panel.addEventListener('close',()=>trigger.focus({preventScroll:true}));
})();
