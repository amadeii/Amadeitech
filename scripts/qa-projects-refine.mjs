import { chromium } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
const dir = process.env.QA_OUTPUT_DIR ?? '.impeccable/review/projects-refine';
await fs.mkdir(dir, {recursive:true});
const browser = await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const errors=[],checks=[];
const hash = value => createHash('sha256').update(value).digest('hex');
async function jump(page, selector, progress=0) {
 await page.evaluate(({selector,progress})=>{const e=document.querySelector(selector),r=e.getBoundingClientRect();scrollTo({top:scrollY+r.top+Math.max(0,r.height-innerHeight)*progress,behavior:'instant'});},{selector,progress});
 await page.waitForTimeout(500);
}
try {
 for(const width of [1440,1920,768,390,320]) {
  const page=await browser.newPage({viewport:{width,height:width<650?844:1000},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push({width,error:e.message}));
  page.on('console',m=>{if(m.type()==='error')errors.push({width,error:m.text()});});
  await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('html').getAttribute('data-motion'),'full');
  assert.equal(await page.locator('.technology-marquee .technology-word > span').allTextContents().then(names=>names.some(name=>name.trim()==='HTML')),false);
  assert.equal(await page.locator('.technology-marquee small').count(),0,'No descriptive sublabels');
  assert.equal(await page.locator('.story-progress, .globe-pin, .globe-story').count(),0,'No three-phase narrative');
  await jump(page,'#experiencia');
  const flow=page.locator('.globe-flow');
  const layout=await flow.evaluate(el=>({height:el.getBoundingClientRect().height,position:getComputedStyle(el).position}));
  assert.ok(layout.height<1000,'No prolonged scroll stage');
  assert.notEqual(layout.position,'sticky');
  const top=await flow.evaluate(el=>el.getBoundingClientRect().top);
  await page.evaluate(()=>scrollBy({top:100,behavior:'instant'}));
  const nextTop=await flow.evaluate(el=>el.getBoundingClientRect().top);
  assert.ok(Math.abs((top-nextTop)-100)<2,'Globe composition follows normal document scrolling');
  await jump(page,'#experiencia');
  await page.screenshot({path:`${dir}/flow-${width}.png`});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${width}`);
  assert.equal(await page.locator('#projetos img[src*="mobile"], #projetos .is-mobile, #projetos .companion-screen').count(),0);
  assert.equal(await page.locator('#projetos button').filter({hasText:/^(Desktop|Mobile)$/i}).count(),0);
  assert.equal(await page.locator('#projetos').innerText().then(s=>s.includes('Supabase')),false);
  const rails=[];
  for(const id of ['beaute','wandyfitt','alanna','ares']) {
   const project=page.locator(`#project-${id}`);
   await jump(page,`#project-${id}`);
   const image=project.locator('.project-image-link');
   await page.mouse.move(0,0);
   assert.equal(await image.evaluate(el=>getComputedStyle(el).transform),'none');
   await page.evaluate(()=>scrollBy({top:100,behavior:'instant'}));
   await page.waitForTimeout(300);
   assert.equal(await image.evaluate(el=>getComputedStyle(el).transform),'none','No project distortion on scroll');
   const rail=project.locator('.technology-marquee');
   assert.equal(await rail.locator('.tech-symbol').first().evaluate(el=>getComputedStyle(el).width),'36px','Project logos increased 20%');
   if(id==='beaute'||id==='wandyfitt') assert.ok((await rail.locator('.marquee-group').first().innerText()).includes('Node.js'));
   await rail.scrollIntoViewIfNeeded();
   await page.waitForTimeout(200);
   const belt=rail.locator('.marquee-belt');
   const a=await belt.evaluate(el=>getComputedStyle(el).transform);
   await page.waitForTimeout(500);
   const z=await belt.evaluate(el=>getComputedStyle(el).transform);
   assert.notEqual(a,z,`Carousel ${id} animates at ${width}`);
   // Inspect several positions through the whole cycle, including its seam.
   // Then resume the native animation. No duplicate name may be visible twice.
   const duplicateCheck=await rail.evaluate(el=>{
    const viewport=el.querySelector('.marquee-viewport').getBoundingClientRect();
    const animation=el.querySelector('.marquee-belt').getAnimations()[0];
    const saved=animation.currentTime, duration=animation.effect.getTiming().duration;
    const samples=[];
    for(const phase of [0,.12,.33,.55,.8,.99]) {
     animation.currentTime=Number(duration)*phase;
     const counts={};
     for(const word of el.querySelectorAll('.technology-word')) {
      const span=word.querySelector('span'),r=span.getBoundingClientRect();
      if(r.right>viewport.left+4&&r.left<viewport.right-4) {
       const name=span.childNodes[0].textContent.trim();counts[name]=(counts[name]??0)+1;
      }
     }
     samples.push(counts);
    }
    animation.currentTime=saved;
    return {cycleWidth:el.querySelector('.marquee-group').getBoundingClientRect().width,viewportWidth:viewport.width,samples};
   });
   assert.ok(duplicateCheck.samples.every(s=>Object.values(s).every(n=>n===1)),`${id}: duplicate visible names ${JSON.stringify(duplicateCheck)}`);
   const unique=await rail.locator('.marquee-group').first().locator('.technology-word > span').allTextContents();
   assert.equal(new Set(unique).size,unique.length);
   if(id==='beaute'||id==='wandyfitt') {
    assert.ok(unique.some(x=>x.startsWith('PostgreSQL')));
    assert.ok(await project.locator('.project-panel-close').isVisible());
    await project.locator('.project-panel-close').click();
    assert.match(await image.locator('img:not([aria-hidden])').getAttribute('src'),/desktop/);
    await project.getByRole('button',{name:'Painel de comando',exact:true}).click();
    assert.match(await image.locator('img:not([aria-hidden])').getAttribute('src'),/panel/);
    await image.click();
    const dialog=project.getByRole('dialog');
    assert.equal(await dialog.isVisible(),true);
    assert.ok(await dialog.locator('.panel-dialog-image img').evaluate(el=>el.naturalWidth>=1200));
    await page.screenshot({path:`${dir}/${id}-expanded-${width}.png`});
    await dialog.getByRole('button',{name:`Fechar ampliação de ${id==='beaute'?'29 Beauté':'WandyFitt'}`}).click();
    assert.equal(await dialog.isVisible(),false);
    await project.getByRole('button',{name:'Ampliar painel',exact:true}).click();
    await page.keyboard.press('Escape');
    assert.equal(await dialog.isVisible(),false);
   } else assert.equal(await project.locator('.project-view-switch').count(),0,'Do not invent CPs');
   if(width>=1000) {
    const size=await project.locator('.project-visual').boundingBox(), row=await project.boundingBox();
    assert.ok(size.width/row.width>=.4&&size.width/row.width<=.5);
    assert.ok(size.height>=336&&size.height<=408);
   }
   rails.push({id,from:a,to:z,...duplicateCheck});
   await page.screenshot({path:`${dir}/${id}-${width}.png`});
  }
  checks.push({width,rails,noOverflow:true,stableImages:true,cpCloseAndExpand:true});
  await page.close();
  console.log(`Projects ${width}: passed`);
 }
 // The autonomous renderer must have no pointer/wheel/scroll input listeners.
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 await page.addInitScript(()=>{
  window.globeInputListeners=[];
  const add=EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener=function(type,...args){
   if(this instanceof HTMLCanvasElement&&this.closest('.globe-canvas')&&/pointer|wheel|mouse/.test(type))window.globeInputListeners.push(type);
   return add.call(this,type,...args);
  };
 });
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 await jump(page,'#experiencia',.2);
 const globe=page.locator('.globe-canvas canvas');
 const a=await globe.evaluate(el=>el.toDataURL());
 await page.waitForTimeout(700);
 const z=await globe.evaluate(el=>el.toDataURL());
 assert.notEqual(a,z,'Globe rotates without any mouse or scroll input');
 assert.deepEqual(await page.evaluate(()=>window.globeInputListeners),[]);
 assert.equal(await globe.evaluate(el=>getComputedStyle(el).pointerEvents),'none');
 await page.goto('http://127.0.0.1:5173/?motion=reduce',{waitUntil:'networkidle'});
 await jump(page,'#experiencia',.2);
 const fixed=await globe.evaluate(el=>el.toDataURL());
 await jump(page,'#experiencia',.6);
 await page.mouse.move(1100,450);
 await page.mouse.down();await page.mouse.move(900,500);await page.mouse.up();
 await page.mouse.wheel(0,80);
 await page.waitForTimeout(500);
 assert.equal(await globe.evaluate(el=>el.toDataURL()),fixed,'Scroll, mouse, drag and wheel do not modify autonomous globe');
 await page.screenshot({path:`dir/globe.png`.replace('dir',dir)});
 checks.push({autonomousGlobe:true,idleChanged:true,scrollMouseWheelIgnored:true,noGlobeInputListeners:true,beforeHash:hash(a),afterHash:hash(z)});
 await page.close();
 for(const reducedMotion of ['reduce','no-preference']) {
  const p=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion});
  await p.goto('http://127.0.0.1:4174/?motion=full',{waitUntil:'networkidle'});
  assert.equal(await p.locator('html').getAttribute('data-motion'),reducedMotion==='reduce'?'reduce':'full');
  await jump(p,'#experiencia',.2);
  const canvas=p.locator('.globe-canvas canvas');
  const before=await canvas.evaluate(el=>el.toDataURL());await p.waitForTimeout(600);
  const after=await canvas.evaluate(el=>el.toDataURL());
  assert.equal(before!==after,reducedMotion==='no-preference');
  checks.push({production:reducedMotion,globeMoving:before!==after,overrideIgnored:true});
  await p.close();
 }
 assert.deepEqual(errors,[]);
 await fs.writeFile(`${dir}/results.json`,JSON.stringify({checks,errors},null,2));
 console.log('All project/globe refinements passed');
} finally {await browser.close();}
