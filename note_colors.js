(() => {
'use strict';
const palettes=Object.create(null);
const groups=[
['#99c96b','#466a35','орегано|пачули|индонезийские пачули|базилик|мята|розмарин|шалфей|мускатный шалфей|мате|лист фиалки'],
['#b5ca75','#586e39','кедр|ветивер|мох|дубовый мох|нагармота|кориандр|семена моркови|мастиковое дерево'],
['#e5d775','#8c9f41','бергамот|цитрон|груша|яблоко|фисташки'],
['#fff089','#dbad36','лимон|ананас|иланг-иланг'],
['#ffc176','#d97b35','апельсин|мандарин|абрикос|фруктовые ноты'],
['#ffbd9d','#d46c65','грейпфрут'],
['#d294b9','#752e53','черная вишня'],
['#c4a5e3','#56416e','черная смородина|инжир|маракуйя'],
['#ffb2be','#b24f70','роза|майская роза|турецкая роза|розовый перец'],
['#d6b4ff','#8260ba','лаванда|ирис'],
['#fff7df','#cfbf9b','жасмин|марокканский жасмин|нероли|цветок апельсина|тубероза|османтус'],
['#ffe3a3','#b58b52','корень ириса|имбирь|кульфи|амбретта|папирус|береза'],
['#dfb385','#785037','табак|лист табака|уд|кожа|древесные ноты|кашемировое дерево|гваяк|финики|мускатный орех|кардамон|перец|перец тимут|пеппервуд'],
['#f0ca8a','#ad7740','ладан|олибанум|мирра|опопонакс|лабданум|бензоин|элеми|амбра|восточные ноты'],
['#ffca60','#c18527','мед'],
['#ff9879','#ba4239','красный перец|паприка|шафран'],
['#efe6d4','#b8a892','мускус'],
['#a8e5ef','#558eae','ambroxan|амброксан'],
['#a5d0b2','#538573','akigalawood'],
['#dac0ed','#9977af','джордживуд'],
['#f1c7a0','#be8b61','амброфикс|ambrofix'],
['#afc9f3','#6c8fbd','iso e super'],
['#c8f0df','#78b69f','гедион'],
['#e9c4d4','#b58ba3','кашмеран']
];
for(const [light,dark,names] of groups)for(const name of names.split('|'))palettes[name]=[light,dark];
const existingColors=new Set(['коньяк','корица','бобы тонка','дуб','ваниль','пралине','сандал','засахаренный миндаль']);
const ns='http://www.w3.org/2000/svg';let serial=0;
const make=(tag,attrs)=>{const node=document.createElementNS(ns,tag);for(const [key,value] of Object.entries(attrs))node.setAttribute(key,value);return node;};
const original=window.renderPyramid;
window.renderPyramid=function(p){
 original(p);
 for(const item of document.querySelectorAll('#pyramid .ingredient')){
  const svg=item.querySelector('svg');if(!svg)continue;
  const key=norm(item.querySelector('span')?.textContent||'').trim();
  if(existingColors.has(key))continue;
  const palette=palettes[key];if(!palette)continue;
  const [light,dark]=palette,id='n59-note-color-'+(++serial);
  const defs=make('defs',{}),gradient=make('linearGradient',{id,x1:'0',y1:'0',x2:'1',y2:'1'});
  gradient.append(make('stop',{offset:'0%','stop-color':light}),make('stop',{offset:'100%','stop-color':dark}));
  defs.append(gradient);svg.prepend(defs);
  svg.setAttribute('stroke',light);
  svg.style.background='radial-gradient(circle,'+dark+'40,transparent 75%)';
  svg.style.borderColor=light+'55';
  for(const shape of svg.querySelectorAll('path,circle,ellipse,rect,polygon,polyline,g')){
   const fill=shape.getAttribute('fill');
   if(fill&&fill!=='none')shape.setAttribute('fill','url(#'+id+')');
   const stroke=shape.getAttribute('stroke');
   if(stroke&&stroke!=='none')shape.setAttribute('stroke',light);
  }
 }
};
})();
