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
function tone(at,freq,end,length,volume=.045,type='sine'){
 const source=ctx.createOscillator(),gain=ctx.createGain();source.type=type;
 source.frequency.setValueAtTime(freq,at);source.frequency.exponentialRampToValueAtTime(end,at+length);
 gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(volume,at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+length);
 source.connect(gain);gain.connect(ctx.destination);voices.add(source);source.onended=()=>{voices.delete(source);source.disconnect();gain.disconnect();};source.start(at);source.stop(at+length+.01);
}
function noise(at,length,freq,volume=.035){
 const buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*length),ctx.sampleRate),data=buffer.getChannelData(0);
 for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
 const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;filter.type='bandpass';filter.frequency.value=freq;filter.Q.value=.8;
 gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(volume,at+.015);gain.gain.exponentialRampToValueAtTime(.0001,at+length);
 source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);voices.add(source);source.onended=()=>{voices.delete(source);source.disconnect();filter.disconnect();gain.disconnect();};source.start(at);source.stop(at+length+.01);
}
async function play(index,section){
 stop();const token=serial;const started=performance.now();
 try{
  if(!ctx)ctx=new AudioCtx();if(ctx.state!=='running')await ctx.resume();
  if(token!==serial||!enabled||document.hidden||section.hidden||ctx.state!=='running'||performance.now()-started>300)return;
  const t=ctx.currentTime+.01;
  if(index===0){tone(t,170,70,.09,.055);noise(t,.06,1200,.035);tone(t+.35,1400,1100,.18,.018);}
  if(index===1){noise(t,.16,2300,.018);tone(t+.45,880,880,.12,.035);tone(t+.58,1320,1320,.18,.03);}
  if(index===2){noise(t,.28,900,.05);tone(t+.12,150,65,.09,.04);tone(t+.2,120,55,.1,.035);noise(t+.4,.3,1700,.018);}
  if(index===3){noise(t,.85,4200,.045);noise(t+.15,.55,6500,.018);}
  if(index===4){noise(t+.18,.35,1700,.018);tone(t+.38,950,330,.15,.045);tone(t+.58,760,270,.17,.035);noise(t+.48,.48,2400,.025);}
  if(index===5){noise(t,.32,2300,.035);noise(t+.3,.32,3300,.025);tone(t+.65,1760,1760,.22,.018);tone(t+.72,2640,2640,.28,.012);}
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
