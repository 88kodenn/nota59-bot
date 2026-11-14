(() => {
'use strict';
const hero=document.querySelector('.hero-copy');
if(!hero||document.getElementById('n59-picker'))return;
const make=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
const btn=(text,fn,cls)=>{const b=make('button',text,cls);b.type='button';b.onclick=fn;return b;};
const current=()=>typeof data!=='undefined'&&Array.isArray(data?.items)?data.items:null;
const clean=s=>String(s).toLowerCase().replaceAll('ё','е').trim();
const style=make('style');style.textContent=`
#n59-picker-open{position:relative;z-index:2;display:block;margin-top:16px;padding:13px 16px;min-height:48px;border:1px solid var(--gold);border-radius:10px;background:linear-gradient(110deg,#b68b46,#edcf8d,#b88d4c);color:#20170d;font:600 14px var(--sans);max-width:100%}
.hero-copy .n59-picker-intro{max-width:250px;font-size:12px}.hero-copy .n59-picker-skip{display:block;font-size:11px;margin-top:9px;color:var(--muted)}
#n59-picker{box-sizing:border-box;width:calc(100% - 28px);max-width:460px;max-height:calc(100dvh - 48px);padding:0;overflow:auto;overscroll-behavior:contain;border:1px solid #dfbb7838;border-radius:22px;background:linear-gradient(155deg,#211b13,#13110e 65%);color:var(--text);box-shadow:0 24px 70px #0008}
#n59-picker::backdrop{background:#0009;backdrop-filter:blur(8px)}
#n59-picker .qp-head{position:sticky;top:0;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 20px;background:#19150ff5;border-bottom:1px solid #dfbb781c}
#n59-picker h2{font:600 25px/1.15 var(--serif);margin:0;color:var(--gold)}
#n59-picker .qp-close{display:grid;place-items:center;width:44px;height:44px;flex-shrink:0;padding:0;border:1px solid #dfbb7828;border-radius:50%;background:#ffffff04;color:#d2bd99;font:400 25px/1 var(--sans)}
#n59-picker .qp-body{padding:20px}#n59-picker .qp-step{font:500 10px/1.5 var(--sans);letter-spacing:1.1px;text-transform:uppercase;color:#b8a789;margin:0 0 9px}
#n59-picker .qp-progress{display:block;width:100%;height:3px;margin:0 0 22px;border:0;border-radius:4px;overflow:hidden;appearance:none;background:#dfbb7818;color:var(--gold)}
#n59-picker .qp-progress::-webkit-progress-bar{background:#dfbb7818;border-radius:4px}#n59-picker .qp-progress::-webkit-progress-value{background:#dfbb78;border-radius:4px}#n59-picker .qp-progress::-moz-progress-bar{background:#dfbb78;border-radius:4px}
#n59-picker h3{margin:0 0 8px;padding:0;border:0;color:#f2e7d5;font:500 29px/1.12 var(--serif);overflow-wrap:anywhere}#n59-picker h3:focus{outline:none}
#n59-picker .qp-help{font:400 12px/1.6 var(--sans);color:#b8aa94;margin:0 0 20px}
#n59-picker .qp-options{display:grid;gap:10px}#n59-picker .qp-option{position:relative;width:100%;min-height:66px;text-align:left;padding:14px 40px 14px 15px;border:1px solid #dfbb7826;border-radius:13px;background:#ffffff03;color:#f0e6d7;font:500 14px/1.4 var(--sans);touch-action:manipulation}
#n59-picker .qp-option::after{content:'›';position:absolute;right:16px;top:50%;transform:translateY(-50%);font:400 23px/1 var(--sans);color:#c7ab75}
#n59-picker .qp-option small{display:block;margin-top:5px;color:#b5a58d;font:400 11px/1.5 var(--sans)}
#n59-picker .qp-option[aria-pressed=true]{border-color:#dfbb7899;background:#dfbb7810}#n59-picker .qp-option:active{background:#dfbb7816}
#n59-picker .qp-skip{min-height:48px;border-color:transparent;background:transparent;color:#c2b49f}#n59-picker .qp-skip small{display:none}
#n59-picker button:focus-visible{outline:2px solid var(--gold);outline-offset:3px}
#n59-picker .qp-nav{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;margin-top:18px;padding-top:14px;border-top:1px solid #dfbb7818}
#n59-picker .qp-nav button{min-height:44px;padding:10px 4px;border:0;border-radius:7px;background:transparent;color:#c8b696;font:500 12px var(--sans)}
#n59-picker .qp-detail{min-height:44px;padding:11px 16px;border:1px solid #dfbb7866;border-radius:9px;background:#dfbb780b;color:var(--gold);font:500 12px var(--sans)}
#n59-picker .qp-result{border:1px solid #dfbb7829;border-radius:14px;padding:16px;margin:12px 0;background:#ffffff02}#n59-picker .qp-result h4{font:600 25px/1.15 var(--serif);margin:7px 0 10px;color:#f2e7d5}
#n59-picker .qp-result p,#n59-picker .qp-note{font:400 12px/1.7 var(--sans);color:#bcae98;margin:9px 0}#n59-picker .qp-brand{font:500 10px/1.5 var(--sans);letter-spacing:.9px;color:var(--gold);text-transform:uppercase}
#n59-picker .qp-about{margin-top:18px;color:#bcae98;font:400 11px/1.7 var(--sans)}#n59-picker .qp-about summary{cursor:pointer;min-height:44px;display:flex;align-items:center;list-style:none;color:#c8b696}#n59-picker .qp-about summary::after{content:'+';margin-left:auto}#n59-picker .qp-about[open] summary::after{content:'−'}#n59-picker .qp-about summary:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
@media(max-width:360px){#n59-picker .qp-head,#n59-picker .qp-body{padding:16px}#n59-picker h2{font-size:23px}#n59-picker h3{font-size:27px}}
@media(prefers-reduced-motion:reduce){#n59-picker[open]{animation:none}}
`;document.head.append(style);
const intro=hero.querySelector('p');if(intro){intro.classList.add('n59-picker-intro');intro.textContent='Не знаете, что выбрать? Ответьте на два простых вопроса — поможем сузить выбор.';}
const panel=make('dialog');panel.id='n59-picker';panel.setAttribute('aria-labelledby','n59-picker-title');
const head=make('div',undefined,'qp-head'),title=make('h2','Ваш аромат');title.id='n59-picker-title';
const close=btn('×',()=>panel.close(),'qp-close');close.setAttribute('aria-label','Закрыть подбор');head.append(title,close);
const body=make('div',undefined,'qp-body');panel.append(head,body);document.body.append(panel);
let step=0,answers=[null,null];
const questions=[
 {title:'Когда будете носить?',hint:'Выберите один вариант. Если не уверены — пропустите.',options:[['На каждый день','На каждый день','Для повседневных моментов'],['На вечер','Для вечера','Для выходов и особого настроения'],['','Пока не знаю','']]},
 {title:'Какое звучание ближе?',hint:'Выберите характер, с которого хотите начать.',options:[['Свежий','Свежий','Цитрусы и зелёные оттенки'],['Сладкий','Сладкий','Выраженные сладкие оттенки'],['Древесный','Древесный','Древесина и тёплые оттенки'],['Пряный','Пряный','Специи и пряные акценты'],['Гурманский','Гурманский','Ассоциации с десертами'],['Дымный','Дымный','Дымные оттенки'],['','Пока не знаю','']]}
];
function categories(){const raw=current()?.pickerCategories;return raw&&typeof raw==='object'&&!Array.isArray(raw)?Object.entries(raw).map(([label,names])=>[clean(label).replace(/[^\p{L}\p{N} ]/gu,'').trim(),new Set(Array.isArray(names)?names:[])]):[];}
function belongs(name,label,groups){return groups.some(([key,names])=>key===clean(label)&&names.has(name));}
function leave(){panel.close();const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;document.getElementById('catalog')?.scrollIntoView({block:'start',behavior:reduce?'instant':'smooth'});}
function focusHeading(){panel.scrollTop=0;const h=body.querySelector('h3');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}}
function render(){body.replaceChildren();if(step===questions.length){results();focusHeading();return;}
 body.append(make('p','Шаг '+(step+1)+' из '+questions.length,'qp-step'));const progress=make('progress',undefined,'qp-progress');progress.max=questions.length;progress.value=step+1;progress.setAttribute('aria-label','Шаг '+(step+1)+' из '+questions.length);body.append(progress);
 const q=questions[step];body.append(make('h3',q.title),make('p',q.hint,'qp-help'));const options=make('div',undefined,'qp-options');
 for(const [value,label,hint] of q.options){const b=btn(label,()=>{answers[step]=value;step++;render();},'qp-option'+(value===''?' qp-skip':''));b.setAttribute('aria-pressed',String(answers[step]===value));if(hint)b.append(make('small',hint));options.append(b);}body.append(options);
 const nav=make('div',undefined,'qp-nav');if(step)nav.append(btn('Назад',()=>{step--;render();}));nav.append(btn('Вернуться в каталог',leave));body.append(nav);focusHeading();}
function results(){
 body.append(make('p','Подбор завершён','qp-step'),make('h3','Ваши варианты'));
 const catalog=current(),labels=answers.filter(Boolean),groups=categories();
 if(!catalog){body.append(make('p','Каталог ещё загружается. Попробуйте снова.','qp-note'));}
 else if(!labels.length){body.append(make('p','Выберите хотя бы одно пожелание — случай или характер. Так мы сможем сузить выбор.','qp-note'));}
 else if(!groups.length){body.append(make('p','Подбор временно недоступен. Каталог можно посмотреть самостоятельно.','qp-note'));}
 else {
 const chosen=catalog.items.filter(p=>labels.every(label=>belongs(p.name,label,groups)));
 body.append(make('p',labels.join(' · '),'qp-help'));
 body.append(make('p',chosen.length?'Найдено: '+chosen.length+'. Все варианты соответствуют выбранным категориям в подборках магазина.':'Совпадений по всем условиям пока нет. Попробуйте изменить один из ответов.','qp-note'));
 for(const p of chosen){const card=make('section',undefined,'qp-result');card.append(make('span',p.brand,'qp-brand'),make('h4',p.name.startsWith(p.brand+' ')?p.name.slice(p.brand.length+1):p.name));card.append(make('p',labels.join(' · ')));card.append(btn('Посмотреть аромат',()=>{panel.close();openProduct(p);},'qp-detail'));body.append(card);}
 }
 const about=make('details',undefined,'qp-about');about.append(make('summary','Как работает подбор'),make('p','Используем существующие подборки магазина и показываем только совпадения по всем выбранным условиям, в порядке каталога. Ароматы без разметки пока не участвуют. Категории не описывают все нюансы звучания; восприятие индивидуально. Ответы не сохраняются и не отправляются.'));body.append(about);
 const nav=make('div',undefined,'qp-nav');nav.append(btn('Изменить ответы',()=>{step=0;render();}),btn('В каталог',leave));body.append(nav);
}
const trigger=btn('Подобрать аромат',()=>{step=0;answers=[null,null];render();panel.showModal();focusHeading();});trigger.id='n59-picker-open';trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls','n59-picker');hero.append(trigger,make('span','Или выберите самостоятельно в каталоге ниже','n59-picker-skip'));
panel.addEventListener('close',()=>trigger.focus({preventScroll:true}));
})();

// Shared sound feedback: volume bubble and a neutral checkout press tone.
(() => {
'use strict';
function start(){
const dialog=document.getElementById('dialog'),head=dialog?.querySelector('.detail-top');if(!head||document.getElementById('n59-volume-sound'))return;
const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
let enabled=true,context=null,voice=null,sequence=0;
try{enabled=localStorage.getItem('nota59-volume-sound-v1')!=='off';}catch(e){}
const toggle=document.createElement('button');toggle.id='n59-volume-sound';toggle.type='button';
Object.assign(toggle.style,{minHeight:'44px',flexShrink:'0',padding:'6px 8px',border:'1px solid var(--line)',borderRadius:'8px',background:'transparent',color:'var(--gold)',font:'500 10px/1.4 var(--sans)'});
function label(){toggle.textContent=enabled?'Звук: вкл':'Звук: выкл';toggle.setAttribute('aria-pressed',String(enabled));toggle.setAttribute('aria-label',enabled?'Выключить звуки кнопок':'Включить звуки кнопок');}
function stop(){sequence++;if(voice){try{voice.stop();}catch(e){}voice=null;}}
toggle.addEventListener('click',()=>{enabled=!enabled;stop();label();try{localStorage.setItem('nota59-volume-sound-v1',enabled?'on':'off');}catch(e){}});
const close=head.querySelector('#close');if(close)close.before(toggle);else head.append(toggle);label();
function playSound(kind){const host=kind==='order'?document.getElementById('n59-panel'):dialog;if(!enabled||document.hidden||!host?.open)return;stop();const token=sequence,started=performance.now();
try{if(!context||context.state==='closed')context=new Audio();
const play=()=>{if(token!==sequence||!enabled||document.hidden||!host.open||performance.now()-started>500||context.state!=='running')return;
const oscillator=context.createOscillator(),gain=context.createGain(),now=context.currentTime;voice=oscillator;oscillator.type='sine';gain.gain.setValueAtTime(.0001,now);
if(kind==='order'){oscillator.frequency.setValueAtTime(440,now);oscillator.frequency.setValueAtTime(660,now+.09);gain.gain.exponentialRampToValueAtTime(.05,now+.008);gain.gain.exponentialRampToValueAtTime(.0001,now+.08);gain.gain.exponentialRampToValueAtTime(.05,now+.10);gain.gain.exponentialRampToValueAtTime(.0001,now+.23);}
else{oscillator.frequency.setValueAtTime(220,now);oscillator.frequency.exponentialRampToValueAtTime(660,now+.035);oscillator.frequency.exponentialRampToValueAtTime(150,now+.16);gain.gain.exponentialRampToValueAtTime(.065,now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+.17);}
oscillator.connect(gain);gain.connect(context.destination);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();if(voice===oscillator)voice=null;};oscillator.start(now);oscillator.stop(now+(kind==='order'?.24:.18));};
if(context.state==='running')play();else context.resume().then(play).catch(()=>{});
}catch(e){}
}
document.addEventListener('click',e=>{const button=e.target instanceof Element?e.target.closest('#dialog #v5,#dialog #v10,#n59-order-submit'):null;if(button&&!button.disabled&&button.getAttribute('aria-disabled')!=='true'&&e.isTrusted)playSound(button.id==='n59-order-submit'?'order':'volume');},true);
dialog.addEventListener('close',stop);document.getElementById('n59-panel')?.addEventListener('close',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();if(context?.state==='running')context.suspend().catch(()=>{});}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();

// One shared handler: independent of sound, no duplicate volume haptics.
(() => {
'use strict';
if(window.n59ButtonHaptics)return;window.n59ButtonHaptics=true;
let last=-Infinity;
const selector='button,input[type="button"],input[type="submit"],input[type="reset"],[role="button"],a.order,summary';
document.addEventListener('click',e=>{
if(!e.isTrusted||document.hidden)return;
const button=e.target instanceof Element?e.target.closest(selector):null;
if(!button||button.matches(':disabled')||button.closest('[inert],[aria-disabled="true"]'))return;
const now=performance.now();if(now-last<80)return;
try{const app=window.Telegram?.WebApp;if(!app||typeof app.isVersionAtLeast!=='function'||!app.isVersionAtLeast('6.1')||typeof app.HapticFeedback?.impactOccurred!=='function')return;last=now;app.HapticFeedback.impactOccurred('light');}catch(e){}
},true);
})();
