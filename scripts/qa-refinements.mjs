import { chromium } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { PNG } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/lib/utilsBundle.js';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const dir = '.taste-skill/refinements';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const errors = [], results = process.argv.includes('--final-only') ? JSON.parse(await fs.readFile(`${dir}/results.json`, 'utf8')) : [];
async function open(url, width, reducedMotion = 'reduce') {
  const p = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion });
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await p.addInitScript(() => {
    window.starts = []; window.openedURLs = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      window.starts.push({ target: this, project: this.closest('.project')?.dataset.project, time: performance.now() });
      return animate.apply(this, args);
    };
    window.open = url => { window.openedURLs.push(url); return null; };
  });
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  return p;
}
async function jump(p, selector, wait = 120) {
  await p.locator(selector).first().evaluate(el => scrollTo({ top: scrollY + el.getBoundingClientRect().top - 70, behavior: 'instant' }));
  await p.waitForTimeout(wait);
}
const transform = (p, selector) => p.locator(selector).first().evaluate(e => getComputedStyle(e).transform);
function pixelDelta(a, b) {
  const x = PNG.sync.read(a), y = PNG.sync.read(b);
  assert.equal(x.width, y.width); assert.ok(Math.abs(x.height-y.height)<=1);
  const height = Math.min(x.height,y.height);
  // Different preceding section heights shift the document's fractional pixel
  // origin. Register at most one raster row; don't mistake it for a redesign.
  let best = 1;
  for (const dy of [-1,0,1]) {
    let n = 0;
    for(let row=1;row<height-1;row++) for(let col=0;col<x.width;col++) {
      const i=(row*x.width+col)*4,j=((row+dy)*x.width+col)*4;
      n += [0,1,2].reduce((sum,c)=>sum+Math.abs(x.data[i+c]-y.data[j+c]),0)/(255*3);
    }
    best=Math.min(best,n/(x.width*(height-2)));
  }
  return best;
}
try {
  if (!process.argv.includes('--final-only')) for (const width of [1920,1440,768,390,320]) {
    const p = await open('http://127.0.0.1:5173/', width);
    assert.equal(await p.locator('html').getAttribute('data-motion'), 'full', 'Local demo survives system reduce');
    for (const id of ['wandyfitt','beaute']) {
      const selector = `#project-${id}`, project = p.locator(selector);
      await jump(p, '#inicio', 100);
      await jump(p, selector, 140);
      const a = await project.locator('.project-visual').evaluate(e => ({ clip: getComputedStyle(e).clipPath, transform: getComputedStyle(e).transform }));
      await p.waitForTimeout(160);
      const b = await project.locator('.project-visual').evaluate(e => ({ clip: getComputedStyle(e).clipPath, transform: getComputedStyle(e).transform }));
      assert.notDeepEqual(a,b, `${width} ${id}: real entrance movement`);
      await p.screenshot({ path: `${dir}/entry-${id}-${width}.png` });
      await p.waitForTimeout(1600);
      const titleA = await transform(p, `${selector} .project-title`);
      const imageA = await transform(p, `${selector} .project-image-link > img`);
      await p.evaluate(() => scrollBy({ top: 100, behavior: 'instant' }));
      await p.waitForTimeout(150);
      assert.notEqual(await transform(p, `${selector} .project-title`), titleA, 'Title follows scroll');
      assert.notEqual(await transform(p, `${selector} .project-image-link > img`), imageA, 'Preview follows scroll');
      const count = () => p.evaluate(id => window.starts.filter(s => s.project === id && s.target.classList.contains('project-visual')).length, id);
      const starts = await count();
      await p.evaluate(() => scrollBy({ top: 8, behavior: 'instant' }));
      await p.waitForTimeout(80);
      assert.equal(await count(), starts, 'Tiny shift does not restart');
      await jump(p, '#inicio'); await jump(p, selector);
      assert.ok(await count() > starts, 'Complete exit rearms');
      await p.waitForTimeout(1800);
      assert.equal(await project.locator('.project-mobile-print').count(),0);
      assert.equal(await project.locator('.project-image-link > img').count(),1, 'One real preview, no duplicate layer');
      await project.getByRole('button',{name:'Painel de comando',exact:true}).click();
      await p.waitForTimeout(80);
      assert.ok(await project.locator('.project-image-link').evaluate(e => e.getAnimations().length) > 0, 'Panel transition exists');
      await project.locator('.project-image-link').click();
      assert.ok(await project.getByRole('dialog').isVisible());
      await p.keyboard.press('Escape');
      assert.ok(!await project.getByRole('dialog').isVisible());
      await project.getByRole('button',{name:'Site público',exact:true}).click();
      const viewport = project.locator('.marquee-viewport');
      await viewport.scrollIntoViewIfNeeded();
      await viewport.focus(); await p.keyboard.press('ArrowRight');
      assert.ok(await viewport.evaluate(e=>e.scrollLeft)>0);
      const duplicateNames = await viewport.evaluate(e => {
        const r=e.getBoundingClientRect();
        const visible=[...e.querySelectorAll('.technology-word')].filter(x=>{const b=x.getBoundingClientRect();return b.right>r.left+24 && b.left<r.right-24;}).map(x=>x.textContent.trim());
        return visible.filter((n,i)=>visible.indexOf(n)!==i);
      });
      assert.deepEqual(duplicateNames, [], 'No repeated technology visible in a carousel');
    }
    // Both personal section and contact use readable, named semantic headings.
    assert.equal(await p.getByRole('heading',{name:'Por trás da AmadeiTech',exact:true}).count(),1);
    assert.equal(await p.getByRole('heading',{name:'Vamos conversar sobre sua ideia?',exact:true}).count(),1);
    assert.equal(await p.locator('.founder-github').getAttribute('href'),'https://github.com/amadeii');
    assert.equal(await p.locator('.developer-signature').innerText(),'Desenvolvido por AmadeiDev');
    assert.ok(await p.evaluate(()=>document.querySelector('#sistemas').compareDocumentPosition(document.querySelector('#quem-cria')) & Node.DOCUMENT_POSITION_FOLLOWING));
    assert.ok(await p.evaluate(()=>document.querySelector('#quem-cria').compareDocumentPosition(document.querySelector('#contato')) & Node.DOCUMENT_POSITION_FOLLOWING));
    for (const [name,selector] of [['founder','#quem-cria'],['contact','#contato']]) {
      await jump(p,selector,1900);
      const font=await p.locator(`${selector} h2`).evaluate(e=>parseFloat(getComputedStyle(e).fontSize));
      assert.ok(font<=80,'No oversized closing heading');
      await p.locator(selector).screenshot({path:`${dir}/final-${name}-${width}.png`});
      assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    }
    // Form error and valid submission stay entirely local: window.open is stubbed.
    await p.locator('[name=name]').fill('Teste local');
    await p.locator('[name=type]').selectOption({label:'Sistema web ou painel'});
    await p.locator('[name=need]').fill('Teste de interface sem envio real.');
    await p.locator('[name=contact]').fill('abc');
    await p.getByRole('button',{name:'Enviar pelo WhatsApp',exact:true}).click();
    assert.match(await p.locator('.form-feedback').innerText(),/número de WhatsApp válido/);
    await p.locator('[name=contact]').fill('(41) 99999-9999');
    await p.getByRole('button',{name:'Enviar pelo WhatsApp',exact:true}).click();
    assert.equal(await p.evaluate(()=>window.openedURLs.length),1);
    assert.match(await p.evaluate(()=>window.openedURLs[0]),/^https:\/\/wa.me\/5541991543278\?text=/);
    await jump(p,'#project-wandyfitt',1900);
    const samples=await p.evaluate(async()=>{
      const deltas=[];let prev=performance.now();
      for(let i=0;i<45;i++){await new Promise(requestAnimationFrame);const now=performance.now();deltas.push(now-prev);prev=now;scrollBy({top:3,behavior:'instant'});}
      return deltas.sort((a,b)=>a-b);
    });
    results.push({width,entrance:'measured',scroll:'measured',replay:'pass',panelsAndCarousels:'pass',form:'pass',frameMedianMs:samples[22],frameP95Ms:samples[42]});
    await fs.writeFile(`${dir}/results.json`,JSON.stringify(results,null,2));
    console.log(`PASS ${width}`);
    await p.close();
  }
  for (const width of [1440,390]) {
    const p=await open('http://127.0.0.1:5173/?motion=reduce',width);
    for(const id of ['ares','alanna']) {
      const el=p.locator(`#project-${id}`);await el.scrollIntoViewIfNeeded();await p.waitForTimeout(400);
      const current=await el.screenshot({path:`${dir}/preserved-${id}-${width}.png`});
      const old=await fs.readFile(`${dir}/baseline-${id}-${width}.png`);
      const changed=pixelDelta(old,current);
      // Raster error is diagnostic: element screenshots use fractional page
      // origins and different rounding. Exact computed styles below are the
      // regression gate, backed by visual inspection of both captures.
      const styles = () => el.evaluate(root => [root,...root.querySelectorAll('*')].map(e=>{
        const s=getComputedStyle(e);
        return ['display','width','height','grid-template-columns','grid-column','grid-row','gap','padding','margin','font-family','font-size','line-height','letter-spacing','object-fit','object-position','transform'].map(k=>s.getPropertyValue(k));
      }));
      const scoped = await styles();
      await p.evaluate(()=>document.querySelector('style[data-vite-dev-id$="/src/refinements.css"]').sheet.disabled=true);
      assert.deepEqual(await styles(),scoped,'Refinement stylesheet must not change any approved project layout/type/image style');
      await p.evaluate(()=>document.querySelector('style[data-vite-dev-id$="/src/refinements.css"]').sheet.disabled=false);
      // Enabling a stylesheet is artificial test activity: let inherited CSS
      // transitions settle before auditing the visitor's reduced-motion state.
      await p.waitForFunction(()=>document.getAnimations().every(a=>a.playState!=='running'));
      results.push({preserved:id,width,meanRasterError:changed,computedStylesUnchanged:true});
    }
    await jump(p,'#project-wandyfitt');
    assert.equal(await p.locator('.project-chapter').evaluateAll(els=>els.reduce((n,e)=>n+e.getAnimations({subtree:true}).filter(a=>a.playState==='running').length,0)),0);
    await p.close();
  }
  const prod=await open('http://127.0.0.1:4173/?motion=full',390);
  assert.equal(await prod.locator('html').getAttribute('data-motion'),'reduce');
  await jump(prod,'#project-beaute');
  const still=await transform(prod,'#project-beaute .project-title');
  await prod.evaluate(()=>scrollBy({top:80,behavior:'instant'}));await prod.waitForTimeout(100);
  assert.equal(await transform(prod,'#project-beaute .project-title'),still);
  await prod.emulateMedia({reducedMotion:'no-preference'});await prod.waitForTimeout(120);
  await jump(prod,'#inicio');await jump(prod,'#project-beaute',200);
  const a=await transform(prod,'#project-beaute .project-image-link > img');
  await prod.evaluate(()=>scrollBy({top:90,behavior:'instant'}));await prod.waitForTimeout(120);
  assert.notEqual(await transform(prod,'#project-beaute .project-image-link > img'),a);
  await prod.getByRole('button',{name:'Painel de comando',exact:true}).last().click();
  await prod.emulateMedia({reducedMotion:'reduce'});await prod.waitForTimeout(100);
  assert.equal(await prod.locator('#project-beaute .project-image-link').evaluate(e=>e.getAnimations().filter(a=>a.playState==='running').length),0);
  assert.equal(await transform(prod,'#project-beaute .project-title'),'none');
  await prod.close();
  assert.deepEqual(errors,[]);
  results.push({productionReduced:'pass',dynamicPreference:'pass',consoleErrors:errors});
  await fs.writeFile(`${dir}/results.json`,JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
} finally {await browser.close();}
