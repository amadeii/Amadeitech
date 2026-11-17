import { chromium } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { PNG } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/lib/utilsBundle.js';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const dir = '.taste-skill/cinematic';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const errors = [], results = [];
const delta = (a, b) => {
  const x = PNG.sync.read(a), y = PNG.sync.read(b); let changed = 0;
  for (let i = 0; i < x.data.length; i += 4) if ([0, 1, 2].some(c => Math.abs(x.data[i+c] - y.data[i+c]) > 5)) changed++;
  return changed / (x.width * x.height);
};
async function open(url, motion = 'reduce') {
  const p = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: motion });
  p.on('pageerror', e => errors.push(e.message));
  await p.addInitScript(() => {
    window.networkCount = 0;
    const draw = WebGLRenderingContext.prototype.drawArrays;
    WebGLRenderingContext.prototype.drawArrays = function(...args) {
      const r = draw.apply(this, args);
      if (args[0] === this.POINTS && this.canvas.closest('.network-field')) {
        window.networkCount++;
        if (window.captureNetwork) { window.networkRaster = this.canvas.toDataURL(); window.captureNetwork = false; }
      }
      return r;
    };
  });
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1800); return p;
}
async function jump(p, s, wait = 300) {
  await p.locator(s).first().evaluate(e => scrollTo({ top: scrollY + e.getBoundingClientRect().top - 80, behavior: 'instant' }));
  await p.waitForTimeout(wait);
}
async function network(p) {
  await p.evaluate(() => window.captureNetwork = true);
  await p.waitForFunction(() => !window.captureNetwork);
  return p.evaluate(() => window.networkRaster);
}
try {
  for (const [url, label] of [['http://127.0.0.1:5173/', 'local-system-reduce'], ['http://127.0.0.1:4173/', 'production-full']]) {
    const p = await open(url, label.includes('local') ? 'reduce' : 'no-preference');
    const hero = p.locator('.hero-object canvas');
    const a = await hero.screenshot({ style: '.network-field { visibility: hidden !important; }' });
    const n = await network(p);
    await p.waitForTimeout(400);
    const b = await hero.screenshot({ style: '.network-field { visibility: hidden !important; }' });
    const ratio = delta(a,b);
    assert.ok(ratio > .001);
    assert.notEqual(await network(p), n);
    await p.waitForFunction(() => document.querySelector('h1').dataset.vaporizePhase === 'out', null, { timeout: 15000 });
    const vapor = await p.locator('.vaporize-canvas').evaluate(c => c.toDataURL());
    await p.waitForTimeout(160);
    assert.notEqual(await p.locator('.vaporize-canvas').evaluate(c => c.toDataURL()), vapor);
    await jump(p, '#experiencia', 800);
    const globe = p.locator('.globe-canvas canvas');
    const g = await globe.evaluate(c => c.toDataURL());
    const wall = await p.locator('.text-reveal-wall').evaluate(c => c.toDataURL());
    await p.waitForTimeout(350);
    assert.notEqual(await globe.evaluate(c => c.toDataURL()), g);
    assert.notEqual(await p.locator('.text-reveal-wall').evaluate(c => c.toDataURL()), wall);
    await jump(p, '#project-wandyfitt', 2000);
    const image = p.locator('#project-wandyfitt .project-image-link > img').first();
    const before = await image.evaluate(e => getComputedStyle(e).transform);
    await p.evaluate(() => scrollBy({ top: 110, behavior: 'instant' }));
    await p.waitForTimeout(150);
    assert.notEqual(await image.evaluate(e => getComputedStyle(e).transform), before);
    await jump(p, '#servicos', 200);
    const flip = await p.locator('.text-3d-flip-char').first().evaluate(e => getComputedStyle(e).transform);
    await p.waitForTimeout(140);
    assert.notEqual(await p.locator('.text-3d-flip-char').first().evaluate(e => getComputedStyle(e).transform), flip);
    // Native preference switching must stop all existing drawing loops too.
    if (label === 'production-full') {
      await p.emulateMedia({ reducedMotion: 'reduce' });
      await jump(p, '#experiencia', 700);
      const still = await globe.evaluate(c => c.toDataURL());
      await p.waitForTimeout(300);
      assert.equal(await globe.evaluate(c => c.toDataURL()), still);
      await p.evaluate(() => scrollBy({ top: 100, behavior: 'instant' }));
      await p.waitForTimeout(200);
      assert.equal(await globe.evaluate(c => c.toDataURL()), still);
      await jump(p, '#inicio', 700);
      const count = await p.evaluate(() => window.networkCount);
      const stillHero = await hero.screenshot({ style: '.network-field { visibility: hidden !important; }' });
      await p.waitForTimeout(300);
      assert.equal(await p.evaluate(() => window.networkCount), count);
      assert.ok(delta(stillHero, await hero.screenshot({ style: '.network-field { visibility: hidden !important; }' })) < .0001);
      await p.emulateMedia({ reducedMotion: 'no-preference' });
      await p.waitForTimeout(300);
      assert.ok(await p.evaluate(() => window.networkCount) > count);
    }
    results.push({ label, orbitChangedPixelRatio: ratio, network: 'moving', vaporize: 'moving', globe: 'moving', wall: 'moving', flip3D: 'moving', scrollParallax: 'measured', dynamicReduced: label === 'production-full' ? 'pass' : 'covered separately' });
    await p.close();
  }
  // Final captures after the responsive source refinement. These run on the build.
  for (const width of [1920,1440,768,390,320]) {
    const p = await browser.newPage({ viewport: { width, height: width < 700 ? 844 : 1000 }, reducedMotion: 'reduce' });
    await p.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
    await p.evaluate(() => document.fonts.ready);
    for (const [name,s] of [['hero','#inicio'],['intro','#sobre'],['wandyfitt','#project-wandyfitt'],['ares','#project-ares'],['beaute','#project-beaute'],['alanna','#project-alanna'],['contact','#contato']]) {
      await jump(p,s,120);
      await p.locator(s).screenshot({ path: `${dir}/final-${name}-${width}.png` });
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.equal(await p.locator(`${s} img:not([aria-hidden])`).evaluateAll(images => images.filter(i => getComputedStyle(i).display !== 'none' && (!i.complete || i.naturalWidth === 0)).length), 0, `${width} ${name}: visible images loaded`);
    }
    results.push({ finalWidth: width, overflow: false, imagesLoaded: true });
    await p.close();
  }
  assert.deepEqual(errors, []);
  await fs.writeFile(`${dir}/effects-results.json`, JSON.stringify({ results, errors }, null, 2));
  console.log(JSON.stringify(results,null,2));
} finally { await browser.close(); }
