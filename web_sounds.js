(() => {
'use strict';
if(window.n59SampleAudio)return;window.n59SampleAudio=true;
const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)return;
let ctx=null,active=null,ready=null,sequence=0,lastOrder='';
const buffers=new Map();
const sources={pour:'/assets/sounds/serving-wine.wav',cork:'/assets/sounds/champagne-cork.wav'};
function cut(input,seconds,kind){
 const rate=input.sampleRate,n=input.length,mono=new Float32Array(n);
 for(let c=0;c<input.numberOfChannels;c++){const a=input.getChannelData(c);for(let i=0;i<n;i++)mono[i]+=a[i]/input.numberOfChannels;}
 const hop=Math.max(1,Math.round(rate*.01)),energy=[];
 for(let i=0;i<n;i+=hop){let sum=0;for(let j=i;j<Math.min(n,i+hop);j++)sum+=mono[j]*mono[j];energy.push(sum);}
 const width=Math.max(1,Math.round(seconds*rate/hop));let start=0;
 if(kind==='pour'){let sum=0,best=-1;for(let i=0;i<energy.length;i++){sum+=energy[i];if(i>=width)sum-=energy[i-width];if(i>=width-1&&sum>best){best=sum;start=(i-width+1)*hop;}}}
 else{const peak=Math.max(...energy),index=energy.findIndex(e=>e>peak*.025);start=Math.max(0,(index-1)*hop);}
 const length=Math.min(Math.round(seconds*rate),n-start);if(length<1)throw new Error('Empty audio');
 const output=ctx.createBuffer(1,length,rate),a=output.getChannelData(0);let peak=0;
 for(let i=0;i<length;i++){a[i]=mono[start+i];peak=Math.max(peak,Math.abs(a[i]));}
 const gain=peak>0?Math.min(3,.6/peak):1,fade=Math.max(1,Math.round(rate*.012));
 for(let i=0;i<length;i++)a[i]*=gain*Math.min(1,i/fade,(length-1-i)/fade);
 return output;
}
function load(){
 if(ready)return ready;if(!ctx)ctx=new AudioCtx();
 ready=Promise.all(Object.entries(sources).map(async([kind,url])=>{
  try{const r=await fetch(url,{cache:'force-cache'});if(!r.ok)throw new Error('HTTP '+r.status);const b=await ctx.decodeAudioData(await r.arrayBuffer());buffers.set(kind,cut(b,kind==='pour'?.7:.85,kind));}
  catch(e){console.warn('Nota59 audio '+kind+':',e.message);}
 }));return ready;
}
function unlock(){try{if(!ctx)ctx=new AudioCtx();const p=ctx.resume();if(p?.catch)p.catch(()=>{});load();}catch(e){console.warn('Nota59 audio:',e.message);}}
async function play(kind,rate=1){
 const token=++sequence;unlock();await ready;
 if(token!==sequence||document.hidden||!buffers.has(kind)||ctx.state!=='running')return;
 if(active){try{active.stop();}catch(e){}active=null;}
 const s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=buffers.get(kind);s.playbackRate.value=rate;
 g.gain.value=.7;s.connect(g);g.connect(ctx.destination);active=s;
 s.onended=()=>{s.disconnect();g.disconnect();if(active===s)active=null;};s.start();
}
document.addEventListener('pointerdown',unlock,{once:true,capture:true,passive:true});
document.addEventListener('keydown',unlock,{once:true,capture:true});
document.addEventListener('click',e=>{
 const b=e.target instanceof Element?e.target.closest('#v5,#v10,#n59-order-submit'):null;
 if(!b||b.disabled||b.getAttribute('aria-disabled')==='true')return;
 if(b.id==='n59-order-submit'){unlock();return;}
 play('pour',b.id==='v5'?Math.pow(2,1/12):Math.pow(2,-1/12));
},true);
function observeOrder(){const result=document.getElementById('n59-order-result');if(!result||result.dataset.n59AudioObserved)return;result.dataset.n59AudioObserved='true';
 new MutationObserver(()=>{const match=result.textContent.match(/^Заказ №([^\n]+) сохранён\./);if(match&&match[1]!==lastOrder){lastOrder=match[1];play('cork');}}).observe(result,{childList:true,subtree:true,characterData:true});
}
new MutationObserver(observeOrder).observe(document.body,{childList:true,subtree:true});observeOrder();
document.addEventListener('visibilitychange',()=>{if(document.hidden){sequence++;if(active){try{active.stop();}catch(e){}active=null;}}});
try{load();}catch(e){console.warn('Nota59 audio preload:',e.message);}
})();

(() => {
'use strict';
const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx||window.n59RuleAudio)return;window.n59RuleAudio=true;
let ctx=null,enabled=true,serial=0;const voices=new Set();
try{enabled=localStorage.getItem('nota59-rule-audio-v1')!=='off';}catch(e){}
function stop(){serial++;for(const source of voices){try{source.stop();}catch(e){}}voices.clear();}
function env(gain,at,attack,decay,peak=.05){
 gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(peak,at+attack);gain.gain.exponentialRampToValueAtTime(.0001,at+attack+decay);
}
function noiseSource(at,length,filterType,freq,q,gainPeak,attack=.005,decay=.15){
 const buffer=ctx.createBuffer(2,Math.ceil(ctx.sampleRate*length),ctx.sampleRate);
 for(let channel=0;channel<2;channel++){const data=buffer.getChannelData(channel);let last=0;for(let i=0;i<data.length;i++){const white=Math.random()*2-1;last=.72*last+.28*white;data[i]=last;}}
 const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain(),pan=ctx.createStereoPanner();
 source.buffer=buffer;filter.type=filterType;filter.frequency.value=freq;filter.Q.value=q;pan.pan.value=(Math.random()*2-1)*.25;
 env(gain,at,attack,decay,gainPeak);source.connect(filter);filter.connect(gain);gain.connect(pan);pan.connect(ctx.destination);
 voices.add(source);source.onended=()=>{voices.delete(source);source.disconnect();filter.disconnect();gain.disconnect();pan.disconnect();};source.start(at);source.stop(at+length+.02);
}
function impact(at,freq,decay=.16,gainPeak=.06){
 const source=ctx.createOscillator(),gain=ctx.createGain(),pan=ctx.createStereoPanner();source.type='triangle';
 source.frequency.setValueAtTime(freq,at);source.frequency.exponentialRampToValueAtTime(Math.max(30,freq*.38),at+decay);
 env(gain,at,.003,decay,gainPeak);pan.pan.value=(Math.random()*2-1)*.18;
 source.connect(gain);gain.connect(pan);pan.connect(ctx.destination);voices.add(source);source.onended=()=>{voices.delete(source);source.disconnect();gain.disconnect();pan.disconnect();};source.start(at);source.stop(at+decay+.03);
}
function metallic(at,freq,decay=.35,gainPeak=.018){
 const source=ctx.createOscillator(),gain=ctx.createGain(),pan=ctx.createStereoPanner();source.type='sine';
 source.frequency.value=freq;env(gain,at,.004,decay,gainPeak);pan.pan.value=(Math.random()*2-1)*.3;
 source.connect(gain);gain.connect(pan);pan.connect(ctx.destination);voices.add(source);source.onended=()=>{voices.delete(source);source.disconnect();gain.disconnect();pan.disconnect();};source.start(at);source.stop(at+decay+.03);
}
function granular(at,length,base,density,filterFreq,gainPeak){
 const steps=Math.max(3,Math.round(length*density));
 for(let i=0;i<steps;i++){const moment=at+Math.random()*length;noiseSource(moment,.018+Math.random()*.022,'bandpass',base*(0.72+Math.random()*.65),1.4,gainPeak*(.55+Math.random()*.75),.002,.05);}
 noiseSource(at,length*.82,'bandpass',filterFreq,.75,gainPeak*.55,.02,length*.75);
}
async function play(index,section){
 stop();const token=serial;const started=performance.now();
 try{
  if(!ctx)ctx=new AudioCtx();if(ctx.state!=='running')await ctx.resume();
  if(token!==serial||!enabled||document.hidden||section.hidden||ctx.state!=='running'||performance.now()-started>300)return;
  const t=ctx.currentTime+.015;
  if(index===0){impact(t,145,.11,.07);noiseSource(t,.05,'bandpass',2400,2.2,.045,.002,.04);metallic(t+.08,1580,.5,.012);metallic(t+.08,2360,.32,.008);noiseSource(t+.3,.28,'bandpass',5200,.8,.012,.02,.22);}
  if(index===1){noiseSource(t,.2,'bandpass',2600,1.6,.022,.012,.16);impact(t+.16,180,.09,.028);metallic(t+.48,880,.22,.03);metallic(t+.48,1320,.3,.022);noiseSource(t+.48,.14,'highpass',5800,.7,.014,.004,.1);}
  if(index===2){noiseSource(t,.32,'bandpass',850,1.1,.055,.008,.26);impact(t+.05,135,.12,.05);noiseSource(t+.16,.2,'bandpass',1600,1.5,.03,.004,.14);impact(t+.22,110,.14,.04);noiseSource(t+.42,.34,'bandpass',1900,.9,.02,.02,.28);}
  if(index===3){granular(t,.95,3400,26,5200,.028);noiseSource(t+.1,.8,'bandpass',6400,.6,.014,.03,.72);}
  if(index===4){noiseSource(t+.15,.4,'bandpass',2100,1.8,.02,.006,.32);impact(t+.36,620,.09,.035);noiseSource(t+.36,.16,'bandpass',3800,2,.018,.003,.12);impact(t+.55,470,.11,.03);noiseSource(t+.5,.5,'bandpass',2800,.9,.018,.03,.42);noiseSource(t+.5,.5,'lowpass',420,.7,.012,.04,.42);}
  if(index===5){noiseSource(t,.36,'bandpass',2600,1.2,.04,.008,.3);noiseSource(t+.28,.36,'bandpass',3600,1.1,.03,.008,.3);noiseSource(t+.58,.2,'highpass',5200,.8,.012,.005,.16);metallic(t+.68,1760,.3,.012);metallic(t+.68,2640,.4,.008);}
 }catch(e){stop();}
}
function mount(){
 const section=document.getElementById('n59-rules');if(!section)return false;if(section.querySelector('#n59-rule-audio-toggle'))return true;
 const button=document.createElement('button');button.type='button';button.id='n59-rule-audio-toggle';
 button.style.cssText='display:block;margin:0 0 12px auto;min-height:44px;padding:9px 13px;border:1px solid var(--line,#dfbb7830);border-radius:10px;background:transparent;color:var(--gold,#dfbb78);font:inherit;font-size:12px;cursor:pointer';
 function label(){button.textContent='Звук миниатюр: '+(enabled?'вкл':'выкл');button.setAttribute('aria-pressed',String(enabled));}
 label();const list=section.querySelector('ol');if(list)list.before(button);else section.append(button);
 button.addEventListener('click',()=>{enabled=!enabled;stop();try{localStorage.setItem('nota59-rule-audio-v1',enabled?'on':'off');}catch(e){}label();});
 section.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;
  if(!event.isTrusted||!enabled||document.hidden||section.hidden||!target||target.closest('a,button,input,select,textarea'))return;
  const row=target.closest('ol > li');if(!row||!row.querySelector('.n59-rule-scene'))return;
  const index=Array.from(section.querySelectorAll('ol > li')).indexOf(row);if(index>=0&&index<6)void play(index,section);
 });
 new MutationObserver(()=>{if(section.hidden)stop();}).observe(section,{attributes:true,attributeFilter:['hidden']});return true;
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});window.addEventListener('pagehide',stop);
if(!mount()){const watcher=new MutationObserver(()=>{if(mount())watcher.disconnect();});watcher.observe(document.body,{childList:true,subtree:true});}
})();
