import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { chromium } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const dir = '.impeccable/review/motion-demo';
await fs.mkdir(dir, { recursive: true });
const files = await fs.readdir('dist/assets');
const code = (await Promise.all(files.filter(f => f.endsWith('.js')).map(f => fs.readFile(`dist/assets/${f}`, 'utf8')))).join('\n');
assert.ok(!code.includes('get("motion")'), 'Production must not read demonstration query');
assert.ok(!code.includes('[::1]'), 'Development host gate eliminated from build');
const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const errors = [], checks = [];
try {
 const p = await b.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
 p.on('pageerror', e => errors.push(e.message));
 await p.addInitScript(() => {
   window.reveals = [];
   const animate = Element.prototype.animate;
   Element.prototype.animate = function (...args) {
     const a = animate.apply(this, args);
     window.reveals.push({ element: this, animation: a });
     return a;
   };
   // Read matrices sent to the real renderer, without changing rendering.
   window.heroMatrices = [];
   for (const proto of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
     const names = new WeakMap();
     const uniform = proto.getUniformLocation, matrix = proto.uniformMatrix4fv;
     proto.getUniformLocation = function (...args) {
       const result = uniform.apply(this, args);
       if (result) names.set(result, args[1]);
       return result;
     };
     proto.uniformMatrix4fv = function (...args) {
       if (names.get(args[0]) === 'modelViewMatrix' && this.canvas.closest('.hero-object') && Math.abs(args[2][12] + .12) < .001 && Math.abs(args[2][14] + 7.8) < .001) {
         window.heroMatrices.push([...args[2]]);
         if (window.heroMatrices.length > 30) window.heroMatrices.shift();
       }
       return matrix.apply(this, args);
     };
   }
 });
 await p.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
 await p.waitForTimeout(2000);
 const art = await p.locator('.hero-object').boundingBox();
 await p.mouse.move(art.x + art.width * .25, art.y + art.height * .35);
 await p.waitForTimeout(700);
 const matricesA = await p.evaluate(() => window.heroMatrices.slice(-4));
 await p.waitForTimeout(700);
 const matricesIdle = await p.evaluate(() => window.heroMatrices.slice(-4));
 await p.mouse.move(art.x + art.width * .75, art.y + art.height * .65);
 await p.waitForTimeout(700);
 const matricesB = await p.evaluate(() => window.heroMatrices.slice(-4));
 assert.ok(matricesA.length && matricesB.length, 'Real hero shader matrices captured');
 // The model matrices carry the pointer-driven tilt, alongside orbit motion.
 const average = (matrices, i) => matrices.reduce((n, m) => n + m[i], 0) / matrices.length;
 const pointerMatrixDelta = Math.abs(average(matricesIdle, 2) - average(matricesB, 2));
 const idleMatrixDelta = Math.abs(average(matricesA, 2) - average(matricesIdle, 2));
 console.log({ pointerMatrixDelta, idleMatrixDelta });
 assert.ok(pointerMatrixDelta > .003 && pointerMatrixDelta > idleMatrixDelta * 2, `Pointer changes renderer orientation beyond idle: ${pointerMatrixDelta}, idle ${idleMatrixDelta}`);
 checks.push({ pointerMatrixDelta, idleMatrixDelta });
 const button = p.locator('.hero-actions .button');
 await p.mouse.move(0, 0);
 const before = await button.evaluate(el => getComputedStyle(el).transform);
 await button.hover();
 await p.waitForTimeout(400);
 const after = await button.evaluate(el => getComputedStyle(el).transform);
 assert.notEqual(before, after, 'Hover moves CTA');
 checks.push({ hover: { before, after } });
 await p.mouse.move(0, 0);
 await p.evaluate(() => {
   const el = document.querySelector('.intro-section h2');
   scrollTo({ top: scrollY + el.getBoundingClientRect().top - innerHeight * .6, behavior: 'instant' });
 });
 await p.waitForFunction(() => window.reveals.some(({element, animation}) => element.matches('.intro-section h2') && animation.playState === 'running'));
 const revealA = await p.locator('.intro-section h2').evaluate(el => ({ transform: getComputedStyle(el).transform, opacity: getComputedStyle(el).opacity }));
 await p.waitForTimeout(150);
 const revealB = await p.locator('.intro-section h2').evaluate(el => ({ transform: getComputedStyle(el).transform, opacity: getComputedStyle(el).opacity }));
 assert.notDeepEqual(revealA, revealB, 'Section reveal changes actual computed frames');
 checks.push({ reveal: { before: revealA, after: revealB } });
 await p.evaluate(() => { const e = document.querySelector('#experiencia'); scrollTo({ top: scrollY + e.getBoundingClientRect().top, behavior: 'instant' }); });
 await p.waitForTimeout(500);
 const flowTop = await p.locator('.globe-flow').evaluate(el => el.getBoundingClientRect().top);
 await p.evaluate(() => scrollBy({top:100,behavior:'instant'}));
 const flowAfter = await p.locator('.globe-flow').evaluate(el => el.getBoundingClientRect().top);
 assert.ok(Math.abs(flowTop-flowAfter-100)<2, 'Globe section scrolls in normal document flow');
 assert.equal(await p.locator('.story-progress, .globe-story, .globe-pin').count(),0);
 checks.push({ continuousFlow: true, threePhasesRemoved: true });
 await p.close();
 for (const query of ['full', 'preview', 'reduce']) {
   const page = await b.newPage({ reducedMotion: 'no-preference' });
   await page.goto(`http://127.0.0.1:4174/?motion=${query}`, { waitUntil: 'networkidle' });
   assert.equal(await page.locator('html').getAttribute('data-motion'), 'full');
   await page.emulateMedia({ reducedMotion: 'reduce' });
   await page.waitForFunction(() => document.documentElement.dataset.motion === 'reduce');
   assert.equal(await page.locator('html').getAttribute('data-motion-preview'), null);
   checks.push({ productionIgnoresQuery: query, dynamicReduce: true });
   await page.close();
 }
 assert.deepEqual(errors, []);
 await fs.writeFile(`${dir}/interactions.json`, JSON.stringify({ checks, errors, productionQueryCodeRemoved: true }, null, 2));
 console.log(JSON.stringify({ checks, errors, productionQueryCodeRemoved: true }, null, 2));
} finally { await b.close(); }
