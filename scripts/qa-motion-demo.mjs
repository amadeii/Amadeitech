import { chromium } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { PNG } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/lib/utilsBundle.js';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';

const dir = '.impeccable/review/motion-demo';
await fs.mkdir(dir, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const checks = [], errors = [];
const hash = data => createHash('sha256').update(data).digest('hex');
const difference = (a, b) => {
  const x = PNG.sync.read(a), y = PNG.sync.read(b);
  assert.equal(x.data.length, y.data.length);
  let changed = 0;
  for (let i = 0; i < x.data.length; i += 4)
    if ([0, 1, 2].some(c => Math.abs(x.data[i + c] - y.data[i + c]) > 4)) changed++;
  return changed / (x.width * x.height);
};
async function open(url, reducedMotion = 'reduce', width = 1440) {
  const page = await browser.newPage({ viewport: { width, height: width < 650 ? 844 : 1000 }, reducedMotion });
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(() => {
    // Capture inside the draw call, before WebGL's non-preserved buffer clears.
    window.networkFrames = { count: 0, last: null };
    const draw = WebGLRenderingContext.prototype.drawArrays;
    WebGLRenderingContext.prototype.drawArrays = function (...args) {
      const result = draw.apply(this, args);
      if (args[0] === this.POINTS && this.canvas.closest('.network-field')) {
        window.networkFrames.count++;
        if (window.captureNetwork) {
          window.networkFrames.last = this.canvas.toDataURL();
          window.captureNetwork = false;
        }
      }
      return result;
    };
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);
  return page;
}
const policy = p => p.evaluate(() => ({ system: matchMedia('(prefers-reduced-motion: reduce)').matches, effective: document.documentElement.dataset.motion, demo: document.documentElement.dataset.motionPreview ?? null }));
async function jump(p, selector, progress = 0) {
  await p.evaluate(({selector, progress}) => {
    const el = document.querySelector(selector), r = el.getBoundingClientRect();
    scrollTo({ top: scrollY + r.top + Math.max(0, r.height - innerHeight) * progress, behavior: 'instant' });
  }, { selector, progress });
  await p.waitForTimeout(800);
}
async function networkFrame(p) {
  const count = await p.evaluate(() => { window.captureNetwork = true; return window.networkFrames.count; });
  await p.waitForFunction(count => !window.captureNetwork && window.networkFrames.count > count, count);
  return Buffer.from((await p.evaluate(() => window.networkFrames.last)).split(',')[1], 'base64');
}
async function verifyFull(p, label) {
  const hero = p.locator('.hero-object canvas');
  const a = await hero.screenshot({ style: '.network-field { visibility:hidden !important }' });
  const netA = await networkFrame(p);
  await p.waitForTimeout(900);
  const b = await hero.screenshot({ style: '.network-field { visibility:hidden !important }' });
  const netB = await networkFrame(p);
  const orbitPixels = difference(a, b), networkPixels = difference(netA, netB);
  assert.ok(orbitPixels > .001, `Orbit pixels: ${orbitPixels}`);
  assert.ok(networkPixels > .0001, `Network pixels: ${networkPixels}`);
  await fs.writeFile(`${dir}/${label}-orbit-before.png`, a);
  await fs.writeFile(`${dir}/${label}-orbit-after.png`, b);
  await fs.writeFile(`${dir}/${label}-network-before.png`, netA);
  await fs.writeFile(`${dir}/${label}-network-after.png`, netB);

  assert.equal(await p.locator('.motion-toggle,.preview-notice,.globe-controls').count(),0);
  const morph = await p.evaluate(async () => {
    const spans = [...document.querySelectorAll('.brand-morph span')];
    const samples = [];
    const end = performance.now() + 8200;
    while (performance.now() < end) {
      samples.push(spans.map(el => +getComputedStyle(el).opacity));
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    return samples;
  });
  assert.ok(morph.some(v => v[0] > .95 && v[1] < .05), 'Amadei visible');
  assert.ok(morph.some(v => v[1] > .95 && v[0] < .05), 'Tech visible');

  const rails = [];
  for (let i = 0; i < await p.locator('.technology-marquee').count(); i++) {
    const rail = p.locator('.technology-marquee').nth(i);
    await rail.scrollIntoViewIfNeeded();
    await p.mouse.move(0, 0);
    await p.waitForTimeout(600);
    const belt = rail.locator('.marquee-belt');
    const before = await belt.evaluate(el => getComputedStyle(el).transform);
    await p.waitForTimeout(600);
    const after = await belt.evaluate(el => getComputedStyle(el).transform);
    assert.notEqual(before, after, `Carousel ${i} moves`);
    rails.push({ before, after });
  }
  await jump(p, '#experiencia', 0);
  const globe = p.locator('.globe-canvas canvas');
  const globeA = await globe.evaluate(el => el.toDataURL());
  await p.waitForTimeout(700);
  const globeB = await globe.evaluate(el => el.toDataURL());
  assert.notEqual(globeA, globeB, 'Globe idle motion');
  assert.equal(await globe.evaluate(el => getComputedStyle(el).pointerEvents), 'none');
  assert.equal(await p.locator('.globe-flow-copy').isVisible(), true);
  await p.screenshot({ path: `${dir}/${label}-globe.png` });
  await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await p.waitForTimeout(500);
  await p.screenshot({ path: `${dir}/${label}-hero.png` });
  checks.push({ label, policy: await policy(p), orbitChangedPixelRatio: orbitPixels, networkChangedPixelRatio: networkPixels, morphSamples: morph, rails, globeIdleChanged: hash(globeA) !== hash(globeB), manualMotionControlsRemoved: true });
  console.log(`${label}: full motion verified`);
}
async function verifyReduced(p, label) {
  assert.equal((await policy(p)).effective, 'reduce');
  assert.equal(await p.locator('.brand-morph span').first().evaluate(el => getComputedStyle(el).animationName), 'none');
  const frames = await p.evaluate(() => window.networkFrames.count);
  await p.waitForTimeout(600);
  assert.equal(await p.evaluate(() => window.networkFrames.count), frames, 'Network stopped');
  const hero = p.locator('.hero-object canvas');
  await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await p.mouse.move(0, 0);
  await p.waitForTimeout(500);
  const orbit = await hero.screenshot({ style: '.network-field { visibility:hidden !important }' });
  await p.waitForTimeout(500);
  assert.ok(difference(orbit, await hero.screenshot({ style: '.network-field { visibility:hidden !important }' })) < .0001, 'Reduced orbit stopped');
  await jump(p, '#experiencia');
  const canvas = p.locator('.globe-canvas canvas');
  const a = await canvas.evaluate(el => el.toDataURL());
  await p.waitForTimeout(600);
  assert.equal(await canvas.evaluate(el => el.toDataURL()), a, 'Reduced globe stopped');
  await p.evaluate(() => scrollBy({ top: 140, behavior: 'instant' }));
  await p.waitForTimeout(500);
  assert.equal(await canvas.evaluate(el => el.toDataURL()), a, 'Reduced globe static on scroll');
  for (const story of await p.locator('.globe-story').all()) assert.equal(await story.isVisible(), true);
  assert.equal(await p.locator('.globe-control input').count(), 0, 'Autonomous globe has no manual rotation input');
  await jump(p, '.tech-section');
  assert.equal(await p.locator('.tech-section .marquee-belt').evaluate(el => getComputedStyle(el).transform), 'none');
  await p.screenshot({ path: `${dir}/${label}.png` });
  checks.push({ label, policy: await policy(p), stoppedNetwork: true, stoppedGlobe: true, stoppedCarousel: true, readableStories: true, autonomousGlobe: true });
  console.log(`${label}: reduced motion verified`);
}
try {
  const demo = await open('http://127.0.0.1:5173/');
  assert.deepEqual(await policy(demo), { system: true, effective: 'full', demo: 'true' });
  await verifyFull(demo, 'dev-system-reduce');
  await demo.emulateMedia({ reducedMotion: 'no-preference' });
  await demo.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal((await policy(demo)).effective, 'full');
  await demo.close();

  for (const [url, system, label] of [
    ['http://127.0.0.1:5173/?motion=system', 'reduce', 'dev-system'],
    ['http://127.0.0.1:5173/?motion=reduce', 'no-preference', 'dev-forced-reduce'],
    ['http://127.0.0.1:4174/?motion=preview', 'reduce', 'production-reduce'],
  ]) {
    const p = await open(url, system);
    assert.equal((await policy(p)).demo, null);
    await verifyReduced(p, label);
    await p.close();
  }
  const prod = await open('http://127.0.0.1:4174/?motion=full', 'no-preference');
  assert.deepEqual(await policy(prod), { system: false, effective: 'full', demo: null });
  assert.equal(await prod.locator('.preview-notice').count(), 0);
  await verifyFull(prod, 'production-no-preference');
  await prod.emulateMedia({ reducedMotion: 'reduce' });
  await prod.waitForTimeout(600);
  await verifyReduced(prod, 'production-dynamic-reduce');
  await prod.emulateMedia({ reducedMotion: 'no-preference' });
  await prod.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await prod.waitForTimeout(600);
  assert.equal((await policy(prod)).effective, 'full');
  const count = await prod.evaluate(() => window.networkFrames.count);
  await prod.waitForTimeout(600);
  assert.ok(await prod.evaluate(() => window.networkFrames.count) > count, 'Dynamic preference resumes loops');
  await prod.close();
  for (const width of [390, 320]) {
    const p = await open('http://127.0.0.1:5173/', 'reduce', width);
    assert.equal((await policy(p)).effective, 'full');
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await p.screenshot({ path: `${dir}/mobile-${width}.png` });
    const a = await networkFrame(p);
    await p.waitForTimeout(600);
    assert.notEqual(hash(a), hash(await networkFrame(p)), 'Mobile network changes');
    await jump(p, '#experiencia', .5);
    await p.screenshot({ path: `${dir}/mobile-globe-${width}.png` });
    checks.push({ label: `mobile-${width}`, policy: await policy(p), overflow: false, networkChanged: true });
    await p.close();
  }
  assert.deepEqual(errors, []);
  await fs.writeFile(`${dir}/results.json`, JSON.stringify({ checkedAt: new Date().toISOString(), checks, errors }, null, 2));
  console.log(JSON.stringify({ checks: checks.map(({morphSamples, ...c}) => c), errors }, null, 2));
} finally {
  await browser.close();
}
