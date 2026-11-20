(() => {
'use strict';
if(window.Nota59PickerV2)return;
const profiles=[
[['Amouage Interlude Man'],['Дымный','Древесный'],['Пряный','Кожаный'],1,2],
[['Amouage Interlude Black Iris Man'],['Дымный','Древесный'],['Пряный','Кожаный'],1,2],
[['Clive Christian Jump Up And Kiss Me Hedonistic (2021)'],['Древесный','Сладкий'],['Кожаный','Пряный','Табачный'],1,2],
[['Creed Aventus'],['Свежий','Древесный'],['Фруктовый'],2,2],
[['Creed Absolu Aventus 2025'],['Древесный','Пряный'],['Свежий','Фруктовый'],2,2],
[['Essential Parfums Bois Imperial'],['Древесный'],['Свежий','Пряный'],2,1],
[['Ex Nihilo Blue Talisman'],['Свежий'],['Сладкий','Древесный','Фруктовый'],2,2],
[['Ex Nihilo The Hedonist'],['Древесный'],['Свежий','Пряный'],2,2],
[['Ex Nihilo The Hedonist Extrait'],['Древесный'],['Пряный','Фруктовый'],1,2],
[['Jean Paul Gaultier Le Male Le Parfum'],['Сладкий','Пряный'],['Древесный','Цветочный'],1,2],
[['Jean Paul Gaultier Le Male Elixir'],['Сладкий','Гурманский'],['Табачный'],1,2],
[['Kilian Angels Share'],['Гурманский','Сладкий'],['Пряный','Древесный'],1,2],
[['Louis Vuitton Pacific Chill'],['Свежий','Фруктовый'],['Сладкий'],2,1],
[['Maison Crivelli Oud Maracuja'],['Фруктовый','Древесный','Кожаный'],['Сладкий'],1,2],
[['Parfums de Marly Althair'],['Сладкий','Гурманский'],['Пряный','Древесный'],1,2],
[['Parfums de Marly Herod'],['Табачный','Сладкий'],['Пряный','Древесный'],1,2],
[['Tom Ford Grey Vetiver EDP'],['Древесный','Свежий'],['Пряный'],2,2],
[['Tom Ford Noir Extreme EDP'],['Гурманский','Пряный'],['Сладкий','Древесный'],1,2],
[['Tom Ford Soleil Blanc EDP'],['Цветочный'],['Сладкий'],2,2],
[['Viktor & Rolf Spicebomb'],['Пряный'],['Табачный','Кожаный','Древесный'],1,2],
[['Tom Ford Costa Azzurra EDP'],['Свежий','Древесный'],[],2,2],
[['Tom Ford Ombré Leather EDP'],['Кожаный'],['Пряный','Древесный'],1,2],
[['Tom Ford Neroli Portofino EDP'],['Свежий','Цветочный'],[],2,1],
[['Xerjoff Naxos'],['Пряный','Табачный'],['Сладкий','Гурманский'],1,2],
[['Maison Margiela By the Fireplace','Maison Margiela By the Fireplace EDT','Maison Margiela Replica By the Fireplace','Maison Margiela Replica By the Fireplace EDT','Replica By the Fireplace','Replica By the Fireplace EDT','By the Fireplace','By the Fireplace EDT'],['Дымный','Древесный'],['Сладкий','Гурманский'],1,2],
[['Giorgio Armani Stronger With You Intensely','Giorgio Armani Stronger With You Intensely EDP','Emporio Armani Stronger With You Intensely','Emporio Armani Stronger With You Intensely EDP','Armani Stronger With You Intensely','Armani Stronger With You Intensely EDP','Stronger With You Intensely','Stronger With You Intensely EDP'],['Сладкий','Гурманский'],['Пряный','Древесный'],1,2],
[['Mancera Tonka Cola','Mancera Tonka Cola EDP','Tonka Cola','Tonka Cola EDP'],['Сладкий','Гурманский'],['Пряный','Фруктовый'],1,2],
[['Dior Sauvage EDT','Dior Sauvage'],['Свежий','Пряный'],['Древесный'],2,2],
[['Initio Wild Rush'],['Свежий','Сладкий'],['Гурманский','Древесный'],1,2],
[['Amouage Purpose 50'],['Древесный','Пряный'],['Дымный','Кожаный'],1,2],
[['Ex Nihilo Blue Talisman Extrait','Ex Nihilo Blue Talisman Extrait de Parfum'],['Древесный','Цветочный'],['Сладкий','Свежий'],2,2]
];
const notes={
'Initio Wild Rush':'Лавандово-травянистая свежесть и ягодно-карамельная сладость ощущаются наравне. Не только свежий и не только десертный характер.',
'Clive Christian Jump Up And Kiss Me Hedonistic (2021)':'Фруктовая сладость уравновешена табачно-древесной и кожаной стороной.',
'Ex Nihilo Blue Talisman Extrait':'В центре — сандаловая древесная база и цветочная сторона. Оценка относится именно к Extrait.',
'Ex Nihilo Blue Talisman Extrait de Parfum':'В центре — сандаловая древесная база и цветочная сторона. Оценка относится именно к Extrait.',
'Tom Ford Soleil Blanc EDP':'Ведущая сторона — цветочная с кокосовым оттенком. Не предлагаем как гурманское совпадение.',
'Xerjoff Naxos':'На первом плане — лавандово-табачная и пряная сторона. Медово-ванильная сладость дополнительная.',
'Amouage Purpose 50':'На первом плане — древесина и пряности. Дымные и замшевые оттенки не считаем ведущими.',
'Maison Crivelli Oud Maracuja':'Маракуйя сохраняется на протяжении звучания; слышны уд и кожа. На старте фруктовость ассоциируется с переспелой, чуть забродившей маракуйей. Это ассоциация, не заявленная нота.',
'Parfums de Marly Herod':'Мягкий табачный характер с сиропной сладостью, напоминающий вишнёвый трубочный табак. Немного ванили и пряностей. Вишня здесь — ассоциация, не заявленная нота.',
'Parfums de Marly Althair':'Сухая стручковая бурбонская ваниль с умеренной сладостью и гурманским характером.'
};
const normalize=value=>String(value||'').normalize('NFC').toLocaleLowerCase('ru-RU').replace(/\s+/g,' ').trim();
const byName=new Map();for(const profile of profiles)for(const name of profile[0]){const key=normalize(name);if(byName.has(key))throw new Error('Duplicate picker profile: '+name);byName.set(key,profile);}
const reservedNames=new Set([normalize('Ex Nihilo Blue Talisman')]);
const noteByName=new Map(Object.entries(notes).map(([name,text])=>[normalize(name),text]));
const directions=['Свежий','Сладкий','Древесный','Пряный','Гурманский','Дымный','Кожаный','Цветочный','Фруктовый','Табачный'];
const occasions=['На каждый день','На вечер',''];
const validPrice=value=>typeof value==='number'&&Number.isFinite(value)&&value>0;
function recommend(payload,occasion='',direction=''){
 if(!occasions.includes(occasion)||direction&&!directions.includes(direction))throw new Error('Invalid picker answer');
 if(!payload||!Array.isArray(payload.items))return {loading:true,items:[],unprofiled:0};
 const ranked=[],seen=new Set();let unprofiled=0;
 for(const product of payload.items){
  if(!product||typeof product.name!=='string'||product.available===false||!validPrice(product.price5)&&!validPrice(product.price10))continue;
  const key=normalize(product.name);if(seen.has(key)||reservedNames.has(key))continue;seen.add(key);
  const profile=byName.get(key);if(!profile){unprofiled++;continue;}
  const strength=direction?(profile[1].includes(direction)?2:profile[2].includes(direction)?1:0):0;
  if(direction&&!strength)continue;
  const occasionFit=occasion?profile[occasion==='На каждый день'?3:4]:0;
  ranked.push({product,primary:profile[1],strength,occasionFit,score:strength*10+occasionFit*3,note:noteByName.get(key)||''});
 }
 ranked.sort((a,b)=>b.score-a.score||normalize(a.product.name).localeCompare(normalize(b.product.name),'ru'));
 return {loading:false,items:ranked,unprofiled};
}
window.Nota59PickerV2=Object.freeze({recommend,directions:Object.freeze(directions),profileCount:profiles.length,version:'2.1-calibrated'});
function mount(){
 const panel=document.getElementById('n59-picker'),trigger=document.getElementById('n59-picker-open');
 if(!panel||!trigger||panel.dataset.pickerV2)return;panel.dataset.pickerV2='true';
 const body=panel.querySelector('.qp-body');if(!body)return;
 const make=(tag,text,cls)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node;};
 const button=(text,fn,cls)=>{const node=make('button',text,cls);node.type='button';node.onclick=fn;return node;};
 const current=()=>typeof data!=='undefined'&&data&&Array.isArray(data.items)?data:null;
 let step=0,occasion='',direction='';
 function focus(){panel.scrollTop=0;const title=body.querySelector('h3');if(title&&panel.open){title.tabIndex=-1;title.focus({preventScroll:true});}}
 function leave(){panel.close();document.getElementById('catalog')?.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
 function navigation(result=false){const nav=make('div',undefined,'qp-nav');if(result)nav.append(button('Изменить ответы',()=>{step=0;render();}));else if(step===1)nav.append(button('Назад',()=>{step=0;render();}));nav.append(button(result?'В каталог':'Вернуться в каталог',leave));body.append(nav);}
 function render(){
  body.replaceChildren();
  if(step===2){results();focus();return;}
  body.append(make('p','Шаг '+(step+1)+' из 2','qp-step'));const progress=make('progress',undefined,'qp-progress');progress.max=2;progress.value=step+1;progress.setAttribute('aria-label','Шаг '+(step+1)+' из 2');body.append(progress);
  body.append(make('h3',step===0?'Когда будете носить?':'Какое звучание ближе?'),make('p',step===0?'Ситуация поможет расставить варианты по приоритету.':'Выберите одно направление. Можно пропустить, если пока не определились.','qp-help'));
  const options=make('div',undefined,'qp-options');
  const entries=step===0?[['На каждый день','На каждый день'],['На вечер','Для вечера'],['','Без привязки / пока не знаю']]:[...directions.map(value=>[value,value]),['','Пока не знаю']];
  for(const [value,label] of entries){const node=button(label,()=>{if(step===0)occasion=value;else direction=value;step++;render();},'qp-option'+(!value?' qp-skip':''));node.setAttribute('aria-pressed',String((step===0?occasion:direction)===value));options.append(node);}
  body.append(options);navigation();focus();
 }
 function results(){
  const payload=current(),result=recommend(payload,occasion,direction);
  body.append(make('p','Подбор завершён','qp-step'),make('h3','Ваши варианты'));
  if(result.loading){body.append(make('p','Каталог ещё загружается. Повторите подбор после загрузки.','qp-note'),button('Повторить',()=>{resultsAgain();},'qp-detail'));navigation(true);return;}
  if(!occasion&&!direction){body.append(make('p','Чтобы сузить выбор, укажите хотя бы одно пожелание. Дополнительных вопросов не нужно.','qp-note'));navigation(true);return;}
  if(!result.items.length){body.append(make('p','Сейчас нет доступных размеченных ароматов этого направления. Попробуйте изменить ответ или посмотреть каталог. Другие направления не подставляем вместо выбранного.','qp-note'));}
  else{
   body.append(make('p',[occasion,direction].filter(Boolean).join(' · '),'qp-help'),make('p','Доступных вариантов: '+result.items.length+'. Сначала — более близкие к выбранным пожеланиям.','qp-note'));
   const resultsList=make('div');body.append(resultsList);let shown=0;
   const more=button('Показать ещё',draw,'qp-detail');
   function draw(){const until=Math.min(shown+5,result.items.length);for(;shown<until;shown++){
    const match=result.items[shown],p=match.product,card=make('section',undefined,'qp-result');
    card.append(make('span',typeof p.brand==='string'?p.brand:'','qp-brand'),make('h4',p.name));
    const explanations=[];if(direction)explanations.push(match.strength===2?'Основное направление: '+direction.toLocaleLowerCase('ru-RU')+'.':'Выбранное направление присутствует как дополнительный оттенок: '+direction.toLocaleLowerCase('ru-RU')+'.');else explanations.push('Основные направления: '+match.primary.join(', ')+'.');
    if(occasion)explanations.push(match.occasionFit===2?'Приоритетный вариант для выбранной ситуации в редакционной подборке магазина.':'Для выбранной ситуации — менее приоритетный вариант; оцените комфортную дозировку на себе.');
    card.append(make('p',explanations.join(' ')));
    if(match.note)card.append(make('p','Оценка магазина: '+match.note));
    const prices=[];if(validPrice(p.price5))prices.push('5 мл — '+new Intl.NumberFormat('ru-RU').format(p.price5)+' ₽');if(validPrice(p.price10))prices.push('10 мл — '+new Intl.NumberFormat('ru-RU').format(p.price10)+' ₽');card.append(make('p',prices.join(' · ')));
    card.append(button('Посмотреть аромат',()=>{const latest=current()?.items.find(item=>normalize(item.name)===normalize(p.name)&&item.brand===p.brand);if(!latest||latest.available===false){resultsAgain();return;}panel.close();openProduct(latest);},'qp-detail'));resultsList.append(card);
   }more.hidden=shown>=result.items.length;}
   body.append(more);draw();
  }
  if(result.unprofiled)body.append(make('p','Некоторые позиции пока не включены: для них требуется отдельная разметка.','qp-note'));
  const about=make('details',undefined,'qp-about');about.append(make('summary','Как работает подбор'),make('p','Подборка магазина по двум ответам, не гарантия личной симпатии. Основные направления отделены от дополнительных. Часть профилей уточнена по личной оценке владельца магазина, остальные размечены редакционно; это не означает личное тестирование всех флаконов. Ситуация влияет на порядок, но не служит запретом. Отсутствующие товары исключены. Версии не подменяются похожими названиями; обычный Blue Talisman оставлен резервным профилем и не участвует в подборе. Проценты совпадения и обещания стойкости не используются. Ответы не сохраняются и не отправляются.'));body.append(about);navigation(true);
 }
 function resultsAgain(){body.replaceChildren();results();focus();}
 trigger.onclick=()=>{step=0;occasion='';direction='';panel.showModal();render();};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
