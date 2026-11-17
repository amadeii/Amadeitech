import { chromium } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const label=process.argv[2] || 'after';
const url=process.argv[3] || 'http://127.0.0.1:5173/';
const dir=`.taste-skill/orbit-entry/${label}`;
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const report=[];
try {for(const width of [1440,393]) {
 const p=await browser.newPage({viewport:{width,height:900},isMobile:width<768,hasTouch:width<768,reducedMotion:'reduce'});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto(url,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
 await p.locator('#experiencia').evaluate(e=>scrollTo({top:scrollY+e.getBoundingClientRect().top-innerHeight-16,behavior:'instant'}));
 await p.waitForTimeout(800);
 const recorder=await browser.newPage();
 await recorder.evaluate(({width})=>{const c=document.createElement('canvas');c.width=width;c.height=900;window.ctx=c.getContext('2d');window.parts=[];window.rec=new MediaRecorder(c.captureStream(20),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:3000000});window.rec.ondataavailable=e=>window.parts.push(e.data);window.rec.start();},{width});
 await p.evaluate(()=>{
  window.entrySamples=[];window.startEntry=performance.now();const start=window.startEntry;
  const section=document.querySelector('#experiencia'),scene=section.querySelector('.services-scene');
  const targets=[section.querySelector('.cinema-word'),section.querySelector('.orbital-globe'),...section.querySelectorAll('.orbit-service')];
  function sample(now){window.entrySamples.push({ms:now-start,section:section.getBoundingClientRect().top,scene:scene.getBoundingClientRect().top,phase:+scene.dataset.phase,speed:+scene.dataset.speed,entry:scene.dataset.orbitEntry,motion:document.documentElement.dataset.motion,targets:targets.map(e=>({opacity:+getComputedStyle(e).opacity,transform:getComputedStyle(e).transform,translate:getComputedStyle(e).translate,scale:getComputedStyle(e).scale,depth:e.dataset.depth,animations:e.getAnimations().map(a=>({current:a.currentTime,start:a.startTime,state:a.playState,timing:a.effect.getTiming()}))}))});if(now-start<4800)requestAnimationFrame(sample);}
  requestAnimationFrame(sample);
  const from=scrollY,to=scrollY+section.getBoundingClientRect().top-60;
  function scroll(now){const t=Math.min(1,(now-start)/650);scrollTo({top:from+(to-from)*t,behavior:'instant'});if(t<1)requestAnimationFrame(scroll);}requestAnimationFrame(scroll);
 });
 const shots=[];const begun=Date.now();
 while(Date.now()-begun<5000){const jpg=await p.screenshot({type:'jpeg',quality:85});await recorder.evaluate(async data=>{const im=new Image();im.src='data:image/jpeg;base64,'+data;await im.decode();window.ctx.drawImage(im,0,0);},jpg.toString('base64'));shots.push({ms:Date.now()-begun,jpg});await p.waitForTimeout(25);}
 const bytes=await recorder.evaluate(()=>new Promise(resolve=>{window.rec.onstop=async()=>resolve(Array.from(new Uint8Array(await new Blob(window.parts,{type:'video/webm'}).arrayBuffer())));window.rec.stop();}));
 await fs.writeFile(`${dir}/entry-${width}.webm`,Buffer.from(bytes));
 const samples=await p.evaluate(()=>window.entrySamples);
 const summary={width,errors,firstSection:samples.find(s=>s.section<900)?.ms,firstScene:samples.find(s=>s.scene<900)?.ms,targets:[0,1,2,3,4].map(i=>({firstAnimated:samples.find(s=>s.targets[i].animations.length)?.ms,firstVisible:samples.find(s=>s.targets[i].animations.some(a=>a.current>=a.timing.delay)&&s.targets[i].opacity>.05)?.ms,atStart:samples.find(s=>s.targets[i].animations.length)?.targets[i].animations[0]?.timing})),samples};
 for(const t of [0,250,500,750,1000,1500,2200]){const shot=shots.reduce((a,b)=>Math.abs(b.ms-t)<Math.abs(a.ms-t)?b:a);await fs.writeFile(`${dir}/frame-${width}-${t}.jpg`,shot.jpg);}
 report.push(summary);console.log(JSON.stringify({...summary,samples:samples.length}));
 if(label==='after'){
  const currentUrl=p.url();
  assert.equal(await p.locator('button.orbit-service').count(),3);
  assert.equal(await p.locator('.orbit-service[href]').count(),0);
  assert.equal(await p.getByText('Falar sobre este serviço',{exact:true}).count(),0);
  const cardTiming=summary.targets.slice(2).map(t=>t.atStart);
  cardTiming.forEach(t=>assert.ok(t&&t.duration>=500&&t.duration<=700));
  assert.equal(cardTiming[1].delay-cardTiming[0].delay,180);assert.equal(cardTiming[2].delay-cardTiming[1].delay,180);
  const phases=samples.filter(s=>s.entry==='active'&&s.phase).map(s=>s.phase);
  let travel=0;for(let i=1;i<phases.length;i++){const d=(phases[i]-phases[i-1]+2*Math.PI)%(2*Math.PI);assert.ok(d<.03,'no phase jump');travel+=d;}assert.ok(travel>.3,'orbit advances through entry');
  assert.deepEqual(errors,[]);
  const cardState=()=>p.locator('.orbit-service').evaluateAll(es=>es.map(e=>({slot:e.dataset.orbitSlot,transform:e.style.transform,z:getComputedStyle(e).zIndex,selected:e.dataset.selected})));
  async function pick(index){
   if(width>=768){await p.locator('.orbit-service').nth(index).focus();}
   else{
    const point=await p.locator('.orbit-service').nth(index).evaluate(e=>{const r=e.getBoundingClientRect();for(let y=Math.max(1,r.top+6);y<Math.min(innerHeight,r.bottom-6);y+=10)for(let x=Math.max(1,r.left+6);x<Math.min(innerWidth,r.right-6);x+=10)if(e.contains(document.elementFromPoint(x,y)))return {x,y};});
    if(!point)return false;await p.touchscreen.tap(point.x,point.y);
   }
   await p.waitForTimeout(120);return true;
  }
  const first=width>=768?0:(await p.locator('.orbit-service').evaluateAll(es=>es.findIndex(e=>+e.dataset.depth>0)));
  assert.ok(await pick(first));const beforeSwap=await cardState();
  let next=-1;for(let i=0;i<3;i++)if(i!==first&&await pick(i)){next=i;break;}
  assert.ok(next>=0,'a second card can be selected');
  const afterSwap=await cardState();
  assert.equal(afterSwap[first].slot,beforeSwap[next].slot,'outgoing takes incoming slot');
  assert.equal(afterSwap[next].slot,beforeSwap[first].slot,'incoming takes foreground slot');
  assert.equal(afterSwap[first].transform,beforeSwap[next].transform,'outgoing occupies incoming pose');
  assert.equal(afterSwap.filter(c=>c.z==='4').length,1,'exactly one promoted card');
  summary.swap={first,next,before:beforeSwap,after:afterSwap};
  await p.screenshot({path:`${dir}/selected-${width}.png`});
  if(width>=768)await p.locator('.orbit-service').nth(next).evaluate(e=>e.blur());
  else await p.waitForTimeout(5200);
  const resumed=+await p.locator('.services-scene').getAttribute('data-phase');await p.waitForTimeout(500);
  assert.notEqual(+await p.locator('.services-scene').getAttribute('data-phase'),resumed,'orbit resumes after reading');
  const oldAnimations=await p.locator('.orbital-globe').evaluate(e=>e.getAnimations().map(a=>a.startTime));
  await p.mouse.wheel(0,25);await p.waitForTimeout(100);await p.mouse.wheel(0,-25);await p.waitForTimeout(100);
  assert.deepEqual(await p.locator('.orbital-globe').evaluate(e=>e.getAnimations().map(a=>a.startTime)),oldAnimations,'small scroll does not restart entrance');
  await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.waitForTimeout(250);
  assert.equal(await p.locator('.services-scene').getAttribute('data-orbit-entry'),'pending');
  await p.locator('.services-scene').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.waitForTimeout(250);
  assert.equal(await p.locator('.services-scene').getAttribute('data-orbit-entry'),'active');
  await p.waitForTimeout(1500);
  assert.equal(await p.locator('.orbit-service').evaluateAll(es=>es.every(e=>+getComputedStyle(e).opacity===1&&getComputedStyle(e).scale==='none'&&getComputedStyle(e).translate==='none')),true,'entry leaves no transform residue');
  assert.equal(p.url(),currentUrl,'card interaction never navigates');
  await p.locator('.orbit-service').first().focus();await p.waitForTimeout(100);
  const scrollBefore=await p.evaluate(()=>scrollY);
  await p.keyboard.press('Enter');await p.keyboard.press('Space');
  assert.equal(p.url(),currentUrl,'keyboard activation never navigates');
  assert.equal(await p.evaluate(()=>scrollY),scrollBefore,'keyboard activation never scrolls');
 }
 await recorder.close();await p.close();
}}finally{await fs.writeFile(`${dir}/measurements.json`,JSON.stringify(report,null,2));await browser.close();}
