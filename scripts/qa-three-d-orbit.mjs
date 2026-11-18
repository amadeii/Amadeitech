import {runtimeBrowser,startVideo,fs} from './three-d-evidence.mjs';
import assert from 'node:assert/strict';
const dir='.taste-skill/3d-final/after';await fs.mkdir(dir,{recursive:true});
const browser=await runtimeBrowser(),results=[],errors=[];
async function run(width){
 const p=await browser.newPage({viewport:{width,height:900},hasTouch:width<1000,isMobile:width<1000});
 p.on('pageerror',e=>errors.push(`${width}: ${e.message}`));p.on('console',m=>{if(m.type()==='error')errors.push(`${width}: ${m.text()}`);});
 await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});await p.mouse.move(1,1);
 const stopVideo=[393,1440].includes(width)?await startVideo(browser,p,`${dir}/orbit-${width}.webm`,width):null;
 await p.locator('.services-scene').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.waitForTimeout(1600);
 await p.evaluate(()=>{
  window.orbitAudit={samples:[],frames:[],travel:0,done:false};const audit=window.orbitAudit,scene=document.querySelector('.services-scene'),cards=[...scene.querySelectorAll('.orbit-service')];
  let previous=+scene.dataset.phase,last=0;const start=performance.now();
  function frame(now){const phase=+scene.dataset.phase,step=(phase-previous+Math.PI*2)%(Math.PI*2);audit.travel+=step;previous=phase;audit.frames.push({ms:now-start,phase,step});
   if(now-last>100){last=now;audit.samples.push({ms:now-start,phase,speed:+scene.dataset.speed,preserve:getComputedStyle(scene.querySelector('.services-orbit')).transformStyle,overflow:document.documentElement.scrollWidth-innerWidth,cards:cards.map(e=>{const rect=e.getBoundingClientRect();let exposed=0;for(const fx of [.1,.5,.9])for(const fy of [.1,.5,.9])if(e.contains(document.elementFromPoint(rect.x+rect.width*fx,rect.y+rect.height*fy)))exposed++;return {angle:+e.dataset.angle,depth:+e.dataset.depth,transform:e.style.transform,rect:rect.toJSON(),opacity:+getComputedStyle(e).opacity,z:getComputedStyle(e).zIndex,exposed};})});}
   if(audit.travel<6*Math.PI+.02&&now-start<145000)requestAnimationFrame(frame);else audit.done=true;
  }requestAnimationFrame(frame);
 });
 let quarter=0;
 while(!await p.evaluate(()=>window.orbitAudit.done)){
  await p.waitForTimeout(2500);const travel=await p.evaluate(()=>window.orbitAudit.travel);
  if(travel>quarter*Math.PI/2){await p.screenshot({path:`${dir}/orbit-${width}-quarter-${quarter}.png`});quarter++;}
  if(quarter%4===0)console.log(`Orbit ${width}px: ${(travel/(Math.PI*2)).toFixed(2)} turns`);
 }
 if(stopVideo)await stopVideo();
 const audit=await p.evaluate(()=>window.orbitAudit);const cycles=audit.travel/(Math.PI*2);
 const result={width,cycles,samples:audit.samples.length,frames:audit.frames.length,seen:[],maxFramePhaseStep:Math.max(...audit.frames.map(f=>f.step))};
 results.push(result);await fs.writeFile(`${dir}/orbit-${width}-measurements.json`,JSON.stringify(audit,null,2));
 assert.ok(cycles>=3,`three cycles at ${width}`);assert.ok(result.maxFramePhaseStep<.03,'no phase discontinuity');
 for(const sample of audit.samples){assert.equal(sample.preserve,'preserve-3d');assert.equal(sample.overflow,0);
  sample.cards.forEach((c,i)=>{assert.equal(c.opacity,1,'no orbital fades');assert.equal(c.z,'auto','no z-index switching');assert.ok(c.rect.left>=-2&&c.rect.right<=width+2,`horizontal clipping at ${width}: ${c.rect.left}..${c.rect.right}`);const gap=(sample.cards[(i+1)%3].angle-c.angle+2*Math.PI)%(2*Math.PI);assert.ok(Math.abs(gap-2*Math.PI/3)<.000003,'constant 120 degree spacing');});
 }
 for(let i=0;i<3;i++){const all=audit.samples.map(s=>s.cards[i]);const seen={front:all.some(c=>c.depth>100&&c.exposed>0),back:all.some(c=>c.depth<-100&&c.exposed<9),side:all.some(c=>Math.abs(c.depth)<30&&c.exposed>0)};result.seen.push(seen);assert.ok(seen.front&&seen.back&&seen.side,`all orbit sectors visible/occluded for ${i}`);}
 result.interactionValidation="qa-three-d-interactions.mjs";await p.close();console.log(`PASSED ${width}px: ${cycles.toFixed(4)} turns, no layer flips or orbital fades`);
}
const requested=process.argv[2]?.split(',').map(Number);
const groups=requested?Array.from({length:Math.ceil(requested.length/2)},(_,i)=>requested.slice(i*2,i*2+2)):[[320,375],[393,430],[1440,1920],[768]];
try{for(const pair of groups)await Promise.all(pair.map(run));assert.deepEqual(errors,[]);}
finally{await fs.writeFile(`${dir}/orbit-results${requested?'-'+requested.join('-'):''}.json`,JSON.stringify({results,errors},null,2));await browser.close();}
