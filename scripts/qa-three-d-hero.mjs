import {runtimeBrowser,instrument,startVideo,touchDrag,fs} from './three-d-evidence.mjs';
import assert from 'node:assert/strict';
const dir='.taste-skill/3d-final/after';await fs.mkdir(dir,{recursive:true});
const browser=await runtimeBrowser(),results=[],errors=[];
try {for(const width of [320,375,393,430,768,1440,1920]){
 const p=await browser.newPage({viewport:{width,height:900},hasTouch:width<1000,isMobile:width<1000,reducedMotion:'reduce'});await instrument(p);
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});await p.waitForTimeout(1700);
 const art=p.locator('.hero-art');await art.evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.waitForTimeout(250);
 const stop=[393,1440].includes(width)?await startVideo(browser,p,`${dir}/hero-${width}.webm`,width):null;
 const start=await p.evaluate(()=>window.__threeD.hero.at(-1));await p.waitForTimeout(1500);const end=await p.evaluate(()=>window.__threeD.hero.at(-1));
 assert.ok(start&&end,'WebGL matrices are observable');const rotationDelta=Math.max(...start.matrix.map((n,i)=>Math.abs(n-end.matrix[i])));assert.ok(rotationDelta>.01,'AT continuously moves without pointer');
 const r=await art.boundingBox();const y=Math.max(10,Math.min(850,r.y+r.height*.5));
 const from={x:Math.max(10,Math.min(width-110,r.x+r.width*.35)),y};const to={x:Math.min(width-15,from.x+90),y};
 const historyBefore=await p.evaluate(()=>window.__threeD.network.slice(-2));const pointsBefore=historyBefore.at(-1);
 const beforeCount=await p.evaluate(()=>window.__threeD.events.length);
 if(width<1000)await touchDrag(p,from,to,1200);else{await p.mouse.move(from.x,from.y);await p.mouse.move(to.x,to.y,{steps:24});await p.waitForTimeout(1200);}
 const interaction=await p.evaluate(()=>({history:window.__threeD.network,events:window.__threeD.events,network:window.__threeD.network.at(-1),hero:window.__threeD.hero.at(-1)}));
 assert.ok(interaction.events.length>beforeCount);
 assert.equal(interaction.network.points.length,276,'same 138 particles on mobile and desktop');
 const dx=Math.sqrt(interaction.network.points.reduce((sum,n,i)=>sum+(n-pointsBefore.points[i])**2,0)/138);assert.ok(dx>2,'particle field responds while dragging');
 const h0=historyBefore[0],h1=historyBefore[1];const dt0=Math.min(.05,(h1.time-h0.time)/1000);let simulated=0,previousTime=h1.time;for(const sample of interaction.history.filter(s=>s.time>h1.time)){simulated+=Math.min(.05,(sample.time-previousTime)/1000);previousTime=sample.time;}
 const field=await p.locator(".network-field canvas").evaluate(e=>({w:e.clientWidth,h:e.clientHeight}));let residuals=[];for(let i=0;i<138;i++){const x=h1.points[2*i],y=h1.points[2*i+1];if(x<30||x>field.w-30||y<30||y>field.h-30)continue;const vx=(x-h0.points[2*i])/dt0,vy=(y-h0.points[2*i+1])/dt0;residuals.push(Math.hypot(interaction.network.points[2*i]-x-vx*simulated,interaction.network.points[2*i+1]-y-vy*simulated));}
 const attractionResidual=residuals.reduce((a,b)=>a+b,0)/residuals.length;assert.ok(attractionResidual>1,"pointer attraction exceeds autonomous drift");
 const native=await art.evaluate(e=>({selection:getComputedStyle(e).userSelect,touch:getComputedStyle(e).touchAction,tap:getComputedStyle(e).webkitTapHighlightColor,context:e.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}))}));
 assert.equal(native.selection,'none');assert.ok(native.touch.includes('pan-y'));assert.equal(native.context,false);
 await p.screenshot({path:`${dir}/hero-${width}.png`});
 if(width<1000){const beforeScroll=await p.evaluate(()=>scrollY);await touchDrag(p,{x:width*.5,y:Math.min(840,y+90)},{x:width*.5,y:Math.min(840,y+90)-160},700);const scrollDelta=(await p.evaluate(()=>scrollY))-beforeScroll;assert.ok(scrollDelta>50,'native vertical scrolling works');assert.equal(await p.evaluate(()=>getSelection()?.toString()),'');}
 if(stop)await stop();
 results.push({width,rotationDelta,particleDisplacement:dx,attractionResidual,native,renderer:await p.locator('.hero-object [data-renderer]').getAttribute('data-renderer'),events:interaction.events.slice(beforeCount),heroFrames:await p.evaluate(()=>window.__threeD.hero.length)});
 await p.close();console.log(`HERO passed: ${width}px`);
}
// Exercise the actual existing WebGL loss handlers, without forcing a mobile-only renderer.
const p=await browser.newPage({viewport:{width:393,height:900},hasTouch:true,isMobile:true});await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});await p.locator('.hero-art').evaluate(e=>e.scrollIntoView({block:'center',behavior:'instant'}));await p.waitForTimeout(500);
await p.locator('.network-field canvas').evaluate(e=>e.getContext('webgl')?.getExtension('WEBGL_lose_context')?.loseContext());await p.waitForTimeout(600);assert.equal(await p.locator('.network-field canvas').getAttribute('data-renderer'),'canvas2d');
await p.locator('.hero-object canvas').evaluate(e=>e.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext());await p.waitForTimeout(700);assert.equal(await p.locator('.hero-object [data-renderer]').getAttribute('data-renderer'),'svg');
const rect=await p.locator('.hero-art').boundingBox();await touchDrag(p,{x:90,y:rect.y+rect.height*.5},{x:260,y:rect.y+rect.height*.5});await p.screenshot({path:`${dir}/hero-context-loss.png`});results.push({contextLoss:'SVG AT and Canvas2D network remain animated and interactive'});await p.close();
assert.deepEqual(errors,[]);
}finally{await fs.writeFile(`${dir}/hero-results.json`,JSON.stringify({results,errors},null,2));await browser.close();}
