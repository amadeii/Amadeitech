import { chromium } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir = '.taste-skill/orbit-mobile-investigation';
await fs.mkdir(dir, {recursive:true});
const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const errors=[];
async function open(width=393,url='http://127.0.0.1:4173/',reducedMotion='no-preference') {
  const page=await browser.newPage({viewport:{width,height:851},isMobile:width<768,hasTouch:width<768,reducedMotion});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(url,{waitUntil:'networkidle'});
  await page.locator('.services-scene').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));
  await page.waitForTimeout(3000);
  return page;
}
const phase=p=>p.locator('.services-scene').getAttribute('data-phase').then(Number);
async function moving(p,label) {
  const a=await phase(p); await p.waitForTimeout(900);
  assert.ok(((await phase(p)-a+2*Math.PI)%(2*Math.PI))>.08,label);
}
const report={errors,checks:[],samples:[]};
try {
 const p=await open();
 const recorder=await browser.newPage();
 await recorder.evaluate(()=>{
   const c=document.createElement('canvas');c.width=393;c.height=851;
   window.ctx=c.getContext('2d');window.parts=[];
   window.rec=new MediaRecorder(c.captureStream(15),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:1800000});
   window.rec.ondataavailable=e=>window.parts.push(e.data);window.rec.start();
 });
 await p.evaluate(()=>{
   window.orbitSamples=[];window.orbitFrameCount=0;
   const start=performance.now();let previous=-Infinity;
   function sample(now){
    window.orbitFrameCount++;
    if(now-previous>=100){previous=now;window.orbitSamples.push({ms:now-start,phase:+document.querySelector('.services-scene').dataset.phase,cards:[...document.querySelectorAll('.orbit-service')].map(e=>({name:e.querySelector('h3').textContent,depth:+e.dataset.depth,zIndex:getComputedStyle(e).zIndex,transform:getComputedStyle(e).transform,inline:e.style.transform,rect:e.getBoundingClientRect().toJSON()}))});}
    if(now-start<26500)requestAnimationFrame(sample);
   }requestAnimationFrame(sample);
 });
 const started=Date.now();let shot=0;
 while(Date.now()-started<27000){
  const jpg=await p.screenshot({type:'jpeg',quality:87});
  await recorder.evaluate(async data=>{const im=new Image();im.src='data:image/jpeg;base64,'+data;await im.decode();window.ctx.drawImage(im,0,0);},jpg.toString('base64'));
  if(Date.now()-started>shot*4000){await fs.writeFile(`${dir}/frame-${shot++}.jpg`,jpg);}
  await p.waitForTimeout(70);
 }
 const bytes=await recorder.evaluate(()=>new Promise(resolve=>{window.rec.onstop=async()=>resolve(Array.from(new Uint8Array(await new Blob(window.parts,{type:'video/webm'}).arrayBuffer())));window.rec.stop();}));
 await fs.writeFile(`${dir}/mobile-full-orbit.webm`,Buffer.from(bytes));
 report.samples=await p.evaluate(()=>window.orbitSamples);
 let radians=0;
 for(let i=1;i<report.samples.length;i++)radians+=(report.samples[i].phase-report.samples[i-1].phase+2*Math.PI)%(2*Math.PI);
 report.cycles=radians/(2*Math.PI);report.frameCount=await p.evaluate(()=>window.orbitFrameCount);
 assert.ok(report.cycles>=1,'one real full revolution');
 report.cards=report.samples[0].cards.map((card,i)=>{
  const all=report.samples.map(s=>s.cards[i]);const depths=all.map(c=>c.depth);
  assert.ok(Math.min(...depths)<-140&&Math.max(...depths)>140);
  assert.ok(new Set(all.map(c=>c.transform)).size>150);
  assert.ok(all.some(c=>c.zIndex==='1')&&all.some(c=>c.zIndex==='3'));
  all.forEach(c=>assert.ok(c.rect.left>=-1&&c.rect.right<=394,'card remains in viewport'));
  return {name:card.name,minDepth:Math.min(...depths),maxDepth:Math.max(...depths),distinctTransforms:new Set(all.map(c=>c.transform)).size};
 });
 // A real touch on the frontmost hittable card.
 const point=await p.locator('.orbit-service').evaluateAll(es=>{for(const e of es){const r=e.getBoundingClientRect();if(+e.dataset.depth>0&&e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)))return {x:r.x+r.width/2,y:r.y+r.height/2};}});
 assert.ok(point);await p.touchscreen.tap(point.x,point.y);await p.waitForTimeout(500);
 assert.equal(await p.locator('.services-scene').getAttribute('data-speed'),'0.000');
 await p.waitForTimeout(5200);await moving(p,'resumes automatically after touch');report.checks.push('touch reading pause expires');
 await p.screenshot({path:`${dir}/after-touch.png`});
 await p.touchscreen.tap(point.x,point.y);
 await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.waitForTimeout(400);
 await p.locator('.services-scene').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.waitForTimeout(3000);
 await moving(p,'resumes after scroll out and return');report.checks.push('scroll return');
 await p.screenshot({path:`${dir}/after-return.png`});
 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(500);
 const still=await phase(p);await p.waitForTimeout(500);assert.equal(await phase(p),still);
 assert.equal(await p.locator('html').getAttribute('data-motion'),'reduce');
 await p.screenshot({path:`${dir}/production-reduce.png`});
 await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForTimeout(500);await moving(p,'dynamic preference resumes');report.checks.push('production dynamic reduced motion');
 await recorder.close();await p.close();
 for(const [url,effective] of [['http://127.0.0.1:5174/','full'],['http://127.0.0.1:5174/?motion=reduce','reduce'],['http://127.0.0.1:5174/?motion=system','reduce'],['http://127.0.0.1:4173/?motion=full','reduce']]){
  const q=await open(393,url,'reduce');assert.equal(await q.locator('html').getAttribute('data-motion'),effective);
  if(effective==='full')await moving(q,'local demo overrides native reduce');
  else{const a=await phase(q);await q.waitForTimeout(400);assert.equal(await phase(q),a);}
  report.checks.push({url,effective});await q.close();
 }
 for(const width of [320,375,430,768,1440]){
  const q=await open(width);await moving(q,`motion ${width}`);
  assert.equal(await q.evaluate(()=>document.documentElement.scrollWidth-innerWidth),0);
  if(width===1440){const a=q.locator('.orbit-service').first();await a.focus();await q.waitForTimeout(200);const stopped=await phase(q);await q.waitForTimeout(400);assert.equal(await phase(q),stopped);await a.evaluate(e=>e.blur());await moving(q,'desktop blur resumes');}
  await q.screenshot({path:`${dir}/viewport-${width}.png`});report.checks.push({width});await q.close();
 }
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({...report,samples:report.samples.length},null,2));
} finally {
 await fs.writeFile(`${dir}/after.json`,JSON.stringify(report,null,2));await browser.close();
}
