import {runtimeBrowser,instrument,startVideo,touchDrag,fs} from './three-d-evidence.mjs';
const dir='.taste-skill/3d-final/before';await fs.mkdir(dir,{recursive:true});const b=await runtimeBrowser(),results=[];
try{for(const width of [1440,393]){
 const p=await b.newPage({viewport:{width,height:900},isMobile:width<768,hasTouch:width<768,reducedMotion:'no-preference'});await instrument(p);await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});await p.waitForTimeout(2000);
 const stop=await startVideo(b,p,`${dir}/hero-${width}.webm`,width);await p.waitForTimeout(2000);
 const r=await p.locator('.hero-art').boundingBox();const y=Math.min(820,r.y+r.height*.55);
 if(width<768)await touchDrag(p,{x:width*.25,y},{x:width*.75,y});else{await p.mouse.move(r.x+r.width*.25,y);await p.mouse.move(r.x+r.width*.75,y,{steps:20});}
 await p.waitForTimeout(1500);await stop();const hero=await p.evaluate(()=>({data:window.__threeD,renderer:document.querySelector('[data-renderer]')?.dataset.renderer,select:getComputedStyle(document.querySelector('.hero-art')).userSelect,callout:getComputedStyle(document.querySelector('.hero-art')).webkitTouchCallout}));
 await p.locator('.services-scene').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.mouse.move(1,1);await p.waitForTimeout(1500);
 const stopOrbit=await startVideo(b,p,`${dir}/orbit-${width}.webm`,width);
 const orbit=await p.evaluate(()=>new Promise(resolve=>{const start=performance.now(),samples=[];let last=0;function sample(now){if(now-last>60){last=now;const globe=document.querySelector('.orbital-globe').getBoundingClientRect();samples.push({ms:now-start,phase:+document.querySelector('.services-scene').dataset.phase,preserve:getComputedStyle(document.querySelector('.services-orbit')).transformStyle,cards:[...document.querySelectorAll('.orbit-service')].map(e=>({z:+e.dataset.depth,zIndex:e.style.zIndex,rect:e.getBoundingClientRect().toJSON()})),globe:globe.toJSON()});}if(now-start<12000)requestAnimationFrame(sample);else resolve(samples);}requestAnimationFrame(sample);}));await stopOrbit();results.push({width,hero,orbit});console.log(`Baseline captured: ${width}px`);await p.close();}
}finally{await fs.writeFile(`${dir}/diagnosis.json`,JSON.stringify(results,null,2));await b.close();}
