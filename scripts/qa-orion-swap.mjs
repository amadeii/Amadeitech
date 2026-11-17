import { chromium } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir = '.taste-skill/orion-swap';
const baseline = JSON.parse(await fs.readFile(`${dir}/baseline.json`, 'utf8'));
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const errors = [], checks = [];
async function open(url,width=1440,motion='reduce') {
  const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:motion});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(url,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  return page;
}
async function jump(page,selector,wait=150) {
  await page.locator(selector).first().evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-80,behavior:'instant'}));
  await page.waitForTimeout(wait);
}
async function snapshot(page) {
  return page.evaluate(()=>{
    const props=['display','width','height','grid-template-columns','grid-column','grid-row','gap','padding','margin','font-size','font-family','line-height','object-fit','object-position'];
    return {sections:['#inicio','#experiencia','#project-wandyfitt','#project-ares','#project-alanna','#quem-cria','#contato','.site-footer'].map(selector=>{
      const root=document.querySelector(selector);
      return{selector,text:root.textContent,styles:[root,...root.querySelectorAll('h1,h2,h3,p,a,img,.project-title,.project-visual,.project-caption')].map(e=>props.map(k=>getComputedStyle(e).getPropertyValue(k)))};
    }),beaute:document.querySelector('#project-beaute').textContent,orion:document.querySelector('.system-feature').textContent,frameShadow:getComputedStyle(document.querySelector('.orion-capture-trigger')).boxShadow};
  });
}
async function screenshot(page,selector,path) {
  const el=page.locator(selector);
  await jump(page,selector,200);
  const box=await el.boundingBox(), viewport=page.viewportSize();
  await page.setViewportSize({width:viewport.width,height:Math.max(1000,Math.ceil(box.height)+120)});
  await jump(page,selector,150);
  await el.screenshot({path});
  await page.setViewportSize(viewport);
}
try {
  for (const width of [1920,1440,768,390,320]) {
    const page=await open('http://127.0.0.1:5173/?motion=reduce',width);
    const current=await snapshot(page);
    assert.deepEqual(current.sections,baseline[width].sections,`${width}: unrelated sections must keep text and computed geometry/type/image styles`);
    assert.equal(current.beaute,baseline[width].beaute,'Beauté text unchanged');
    assert.equal(current.orion,baseline[width].orion,'ORION text unchanged');
    assert.equal(current.frameShadow,baseline[width].frameShadow,'ORION frame shadow unchanged');
    const b=page.locator('#project-beaute');
    const image=await b.locator('.project-visual').boundingBox();
    const title=await b.locator('.project-title').boundingBox();
    const caption=await b.locator('.project-caption').boundingBox();
    if(width>700) {assert.ok(image.x+image.width<=title.x+1);assert.ok(image.x+image.width<=caption.x+1);}
    const orionImage=await page.locator('.system-visual').boundingBox();
    const orionCopy=await page.locator('.system-copy').boundingBox();
    const highlights=await page.locator('.system-capabilities').boundingBox();
    if(width>1000){assert.ok(orionImage.x+orionImage.width<=orionCopy.x+1);assert.ok(highlights.x>=orionCopy.x-1);}
    else assert.ok(orionImage.y<orionCopy.y,'Mobile ORION image precedes the copy');
    assert.equal(await page.locator('.system-status').innerText(),'EM BREVE');
    assert.equal(await page.locator('.orion-orbit').getAttribute('aria-hidden'),'true');
    for(const [name,s]of[['beaute','#project-beaute'],['orion','#sistemas']]) {
      await jump(page,s);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      await screenshot(page,s,`${dir}/final-${name}-${width}.png`);
    }
    await jump(page,'#project-beaute');
    await b.getByRole('button',{name:'Painel de comando',exact:true}).click();
    await b.locator('.project-image-link').click();
    assert.ok(await b.getByRole('dialog').isVisible());
    await page.keyboard.press('Escape');
    await b.getByRole('button',{name:'Site público',exact:true}).click();
    assert.equal(await b.locator('.project-link').getAttribute('href'),'https://29beaute.com.br/');
    const rail=b.locator('.marquee-viewport');
    await rail.scrollIntoViewIfNeeded();await rail.focus();await page.keyboard.press('ArrowRight');
    assert.ok(await rail.evaluate(el=>el.scrollLeft)>0);
    await page.getByRole('button',{name:'Ampliar captura real do ORION Empresarial',exact:true}).click();
    assert.ok(await page.locator('.orion-capture-dialog').isVisible());
    await page.keyboard.press('Escape');
    assert.ok(!await page.locator('.orion-capture-dialog').isVisible());
    assert.equal(await page.evaluate(()=>document.activeElement.className),'orion-capture-trigger');
    await jump(page,'.system-title',300);
    const still=await page.locator('.orion-orbit-spin').first().evaluate(el=>getComputedStyle(el).transform);
    await page.waitForTimeout(250);
    assert.equal(await page.locator('.orion-orbit-spin').first().evaluate(el=>getComputedStyle(el).transform),still);
    assert.equal(await page.locator('.orion-orbit').getAttribute('data-running'),'false');
    checks.push({width,unrelatedSectionsUnchanged:true,textsUnchanged:true,composition:'pass',dialogsAndCarousel:'pass',reducedOrbit:'static',overflow:false});
    console.log(`PASS layout ${width}`);await page.close();
  }
  for(const [url,label,motion]of[['http://127.0.0.1:5173/','local-demo','reduce'],['http://127.0.0.1:4173/','production-full','no-preference']]) {
    const page=await open(url,1440,motion);
    await jump(page,'.system-title',650);
    const spin=page.locator('.orion-orbit-spin').first();
    assert.equal(await page.locator('.orion-orbit').getAttribute('data-running'),'true');
    const a=await spin.evaluate(el=>getComputedStyle(el).transform);
    await page.waitForTimeout(450);
    assert.notEqual(await spin.evaluate(el=>getComputedStyle(el).transform),a,'Orbital movement measured between frames');
    await page.screenshot({path:`${dir}/${label}-orbit.png`});
    await jump(page,'#inicio',250);
    assert.equal(await spin.evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
    const paused=await spin.evaluate(el=>el.getAnimations()[0].currentTime);
    await page.waitForTimeout(250);
    assert.equal(await spin.evaluate(el=>el.getAnimations()[0].currentTime),paused,'Offscreen orbit stops');
    await jump(page,'.system-title',250);
    assert.ok(await spin.evaluate(el=>el.getAnimations()[0].currentTime)>paused,'Orbit resumes without resetting');
    await page.locator('.orion-capture-trigger').scrollIntoViewIfNeeded();
    const y=await page.locator('.system-visual').evaluate(el=>el.getBoundingClientRect().top);
    await page.evaluate(()=>scrollBy({top:120,behavior:'instant'}));await page.waitForTimeout(150);
    const stickyY=await page.locator('.system-visual').evaluate(el=>el.getBoundingClientRect().top);
    assert.ok(Math.abs(stickyY-Math.max(72,y-120))<1,'Capture follows native scroll until the 72px sticky boundary');
    if(label==='production-full') {
      await jump(page,'.system-title');
      await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);
      assert.equal(await page.locator('.orion-orbit').getAttribute('data-running'),'false');
      assert.equal(await spin.evaluate(el=>getComputedStyle(el).animationName),'none');
      await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(200);
      assert.equal(await page.locator('.orion-orbit').getAttribute('data-running'),'true');
    }
    checks.push({label,orbit:'measured',offscreen:'paused',return:'resumed',nativeSticky:'pass',dynamicPreference:label==='production-full'?'pass':'covered in production'});
    await page.close();
  }
  const reduced=await open('http://127.0.0.1:4173/?motion=full',390);
  await jump(reduced,'.system-title',400);
  assert.equal(await reduced.locator('html').getAttribute('data-motion'),'reduce');
  assert.equal(await reduced.locator('.orion-orbit-spin').first().evaluate(el=>getComputedStyle(el).animationName),'none');
  await reduced.close();
  assert.deepEqual(errors,[]);
  await fs.writeFile(`${dir}/results.json`,JSON.stringify({checks,errors},null,2));
  console.log(JSON.stringify({checks,errors},null,2));
}finally{await browser.close();}
