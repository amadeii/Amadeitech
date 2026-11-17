import { chromium } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
const dir = '.impeccable/review/viewport-replay';
await fs.mkdir(dir, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const errors = [], checks = [];
const hash = data => createHash('sha256').update(data).digest('hex');
async function open(url, width = 1440, reducedMotion = 'reduce', args = {}) {
  const page = await browser.newPage({ viewport: { width, height: width < 650 ? 844 : 1000 }, reducedMotion, ...args });
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(() => {
    window.replayStarts = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      window.replayStarts.push({ target: this, time: performance.now(), timing: args[1] });
      return animate.apply(this, args);
    };
    window.networkEdges = [];
    const draw = WebGLRenderingContext.prototype.drawArrays;
    WebGLRenderingContext.prototype.drawArrays = function (...args) {
      const result = draw.apply(this, args);
      if (this.canvas.closest('.network-field') && args[0] === this.TRIANGLES) {
        window.networkEdges.push(args[2] / 6);
        if (window.captureNetwork) {
          window.networkRaster = this.canvas.toDataURL();
          window.captureNetwork = false;
        }
      }
      return result;
    };
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  return page;
}
async function visit(page, selector, wait = 110) {
  await page.locator(selector).first().evaluate(el => {
    const rect = el.getBoundingClientRect();
    scrollTo({ top: scrollY + rect.top - Math.max(80, (innerHeight - Math.min(rect.height, innerHeight * .8)) / 2), behavior: 'instant' });
  });
  await page.waitForTimeout(wait);
}
const starts = (page, selector) => page.evaluate(selector => window.replayStarts.filter(a => a.target === document.querySelector(selector)).length, selector);
const fullyOut = (page, selector) => page.locator(selector).first().evaluate(el => { const r = el.getBoundingClientRect(); return r.bottom <= 0 || r.top >= innerHeight; });
const raster = (page, selector) => page.locator(selector).evaluate(c => c.toDataURL());
async function networkFrame(page) {
  await page.evaluate(() => { window.captureNetwork = true; });
  await page.waitForFunction(() => window.captureNetwork === false);
  return Buffer.from((await page.evaluate(() => window.networkRaster)).split(',')[1], 'base64');
}
const lit = (page, selector) => page.locator(selector).evaluate(c => {
  const data = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  let pixels = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] > 20) pixels++;
  return pixels;
});
async function replayTarget(page, selector) {
  await page.mouse.move(0, 0);
  await visit(page, '#inicio');
  await visit(page, selector);
  const initial = await starts(page, selector);
  assert.ok(initial > 0, `${selector}: initial entry`);
  await page.waitForTimeout(550);
  const size = await page.locator(selector).first().evaluate(el => ({ height: el.offsetHeight, width: el.offsetWidth }));
  // Partial edge motion must never rearm or restart the entrance.
  for (const dy of [3, -5, 4, -2]) {
    await page.evaluate(dy => scrollBy({ top: dy, behavior: 'instant' }), dy);
    await page.waitForTimeout(35);
  }
  assert.equal(await starts(page, selector), initial, `${selector}: no jitter replay`);
  await visit(page, '#inicio');
  assert.equal(await fullyOut(page, selector), true);
  await visit(page, selector);
  assert.equal(await starts(page, selector), initial + 1, `${selector}: replay after full exit`);
  // Exit during the running entrance, then return quickly.
  await visit(page, '#inicio', 60);
  await visit(page, selector, 100);
  assert.equal(await starts(page, selector), initial + 2, `${selector}: fast return`);
  await page.waitForTimeout(550);
  assert.deepEqual(await page.locator(selector).first().evaluate(el => ({ height: el.offsetHeight, width: el.offsetWidth })), size, 'No layout change');
  return { selector, runs: initial + 2, jitterStable: true, fastReturn: true, unchangedSize: true };
}
try {
  for (const width of [1440, 768, 390, 320]) {
    const page = await open('http://127.0.0.1:5173/', width);
    assert.equal(await page.locator('html').getAttribute('data-motion'), 'full');
    assert.equal(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), true);
    await page.waitForTimeout(1700);
    // Read in the draw call, before WebGL's non-preserved buffer is cleared.
    // A masked, clipped element screenshot is unreliable on mobile Chrome.
    const a = await networkFrame(page);
    await page.waitForTimeout(450);
    const b = await networkFrame(page);
    assert.notEqual(hash(a), hash(b), 'Network particles and links move');
    const edges = await page.evaluate(() => window.networkEdges);
    assert.ok(edges.length > 5 && Math.max(...edges) > 0, 'Actual WebGL line draws');
    assert.ok(new Set(edges).size > 1, 'Connections appear and disappear between frames');
    await fs.writeFile(`${dir}/network-a-${width}.png`, a);
    await fs.writeFile(`${dir}/network-b-${width}.png`, b);
    // Screenshotting a partially clipped element can scroll its overflow:hidden
    // ancestor. Restore that test-induced scroll before photographing the page.
    await page.locator('.hero').evaluate(el => { el.scrollLeft = 0; });
    await page.screenshot({ path: `${dir}/hero-network-${width}.png` });
    assert.equal(await page.locator('.contact-orbit,.hero-light,.tech-section').count(), 0);

    await page.waitForFunction(() => document.querySelector('h1').dataset.vaporizePhase === 'out');
    await visit(page, '#contato');
    assert.ok(await fullyOut(page, 'h1'));
    await page.waitForTimeout(200);
    const stoppedEdges = await page.evaluate(() => window.networkEdges.length);
    await page.waitForTimeout(250);
    assert.equal(await page.evaluate(() => window.networkEdges.length), stoppedEdges, 'Network suspends outside viewport');
    const heroStarts = await starts(page, '.hero-actions');
    await visit(page, '#inicio', 100);
    assert.equal(await page.locator('h1').getAttribute('data-vaporize-phase'), 'in', 'Vaporize restarts with reconstruction, not its old phase');
    assert.equal(await starts(page, '.hero-actions'), heroStarts + 1);
    const entry = await raster(page, '.vaporize-canvas');
    await page.waitForTimeout(380);
    assert.notEqual(await raster(page, '.vaporize-canvas'), entry);
    await page.screenshot({ path: `${dir}/hero-reentry-${width}.png` });

    // Same React elements survive; no remount is used to replay animation.
    const identities = await page.locator('.hero-object, #project-wandyfitt, .stagger-flip').elementHandles();
    const targetResults = [];
    for (const selector of ['#sobre > h2', '#projetos .section-heading h2', '#project-wandyfitt', '#project-ares', '#sistemas .system-copy', '#sistemas .system-visual', '#servicos .service', '#contato h2', '.brief-form']) {
      targetResults.push(await replayTarget(page, selector));
    }
    await visit(page, '#inicio');
    const flipSelector = '.text-3d-flip-char';
    await visit(page, '.stagger-flip', 160);
    const firstFlip = await starts(page, flipSelector);
    assert.equal(await page.locator('.stagger-flip').getAttribute('data-flip'), 'playing');
    await page.screenshot({ path: `${dir}/flip-first-${width}.png` });
    // Leave below, return upwards; then leave above, return downwards.
    await visit(page, '.site-footer', 80);
    assert.ok(await fullyOut(page, '.stagger-flip'));
    await visit(page, '.stagger-flip', 160);
    assert.equal(await starts(page, flipSelector), firstFlip + 1);
    const matrix = await page.locator(flipSelector).first().evaluate(el => getComputedStyle(el).transform);
    await page.waitForTimeout(120);
    assert.notEqual(await page.locator(flipSelector).first().evaluate(el => getComputedStyle(el).transform), matrix);
    await page.screenshot({ path: `${dir}/flip-return-up-${width}.png` });
    await visit(page, '#inicio', 65);
    await visit(page, '.stagger-flip', 100);
    assert.equal(await starts(page, flipSelector), firstFlip + 2);
    for (const dy of [3, -3, 4, -4]) { await page.evaluate(dy => scrollBy({ top: dy, behavior: 'instant' }), dy); await page.waitForTimeout(35); }
    assert.equal(await starts(page, flipSelector), firstFlip + 2, 'Flip does not repeat on small scrolls');
    await page.waitForFunction(() => document.querySelector('.stagger-flip').dataset.flip === 'rest');
    if (width === 1440) {
      await page.locator('.stagger-flip').hover();
      await page.waitForFunction(() => document.querySelector('.stagger-flip').dataset.flip === 'playing');
      assert.equal(await starts(page, flipSelector), firstFlip + 3, 'Hover remains independent');
      await page.mouse.move(0, 0);
    }

    await visit(page, '.text-reveal-wall', 2100);
    const settled = await lit(page, '.text-reveal-wall');
    await visit(page, '#inicio', 90);
    assert.ok(await fullyOut(page, '.text-reveal-wall'));
    await visit(page, '.text-reveal-wall', 80);
    const wallEarly = await lit(page, '.text-reveal-wall');
    assert.ok(wallEarly < settled * .45, `Wall replays from start: ${wallEarly}/${settled}`);
    const wallA = await raster(page, '.text-reveal-wall');
    await page.screenshot({ path: `${dir}/wall-reentry-early-${width}.png` });
    await page.waitForTimeout(900);
    const wallB = await raster(page, '.text-reveal-wall');
    assert.notEqual(wallB, wallA);
    await page.screenshot({ path: `${dir}/wall-reentry-later-${width}.png` });
    // Project state persists across viewport replays.
    const project = page.locator('#project-wandyfitt');
    await visit(page, '#project-wandyfitt', 350);
    await project.locator('.project-panel-close').click();
    await visit(page, '#inicio', 80);
    await visit(page, '#project-wandyfitt', 350);
    assert.equal(await project.getByRole('button', { name: 'Site público', exact: true }).getAttribute('aria-pressed'), 'true');
    await project.getByRole('button', { name: 'Painel de comando', exact: true }).click();
    await project.getByRole('button', { name: 'Ampliar painel', exact: true }).click();
    assert.ok(await project.getByRole('dialog').isVisible());
    await page.keyboard.press('Escape');
    assert.equal(await project.getByRole('dialog').isVisible(), false);
    for (const handle of identities) assert.ok(await handle.evaluate(el => el.isConnected), 'No component remount');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `${dir}/project-${width}.png` });
    checks.push({ width, edges: { frames: edges.length, min: Math.min(...edges), max: Math.max(...edges), variants: new Set(edges).size }, targetResults, flipReplayBothDirections: true, vaporizeReconstructionReplayed: true, wall: { early: wallEarly, settled, moving: wallA !== wallB }, persistedProjectState: true, noOverflow: true });
    console.log(`Replay ${width}: network, entrances, both directions, fast returns, wall and state persistence passed`);
    await page.close();
  }
  // Build of production follows native preferences and responds dynamically.
  for (const pref of ['reduce', 'no-preference']) {
    const page = await open('http://127.0.0.1:4174/?motion=full', 1440, pref);
    assert.equal(await page.locator('html').getAttribute('data-motion'), pref === 'reduce' ? 'reduce' : 'full');
    if (pref === 'reduce') {
      assert.equal(await page.locator('.vaporize-canvas').isVisible(), false);
      await visit(page, '.stagger-flip');
      assert.equal(await starts(page, '.text-3d-flip-char'), 0);
      await visit(page, '#inicio');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.waitForFunction(() => document.documentElement.dataset.motion === 'full');
    }
    await visit(page, '#contato', 80);
    await visit(page, '#inicio', 150);
    assert.equal(await page.locator('h1').getAttribute('data-vaporize-phase'), 'in');
    await visit(page, '.stagger-flip', 150);
    const first = await starts(page, '.text-3d-flip-char');
    await visit(page, '#inicio', 80);
    await visit(page, '.stagger-flip', 150);
    assert.equal(await starts(page, '.text-3d-flip-char'), first + 1);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.documentElement.dataset.motion === 'reduce');
    assert.equal(await page.locator('.text-3d-flip-char').first().evaluate(el => el.getAnimations().length), 0);
    assert.equal(await page.locator('.vaporize-canvas').isVisible(), false);
    checks.push({ productionInitial: pref, replayVerified: true, dynamicReduce: true, demoIgnored: true });
    await page.close();
  }
  assert.deepEqual(errors, []);
  await fs.writeFile(`${dir}/results.json`, JSON.stringify({ checks, errors }, null, 2));
  console.log('All viewport replay and restored Network Lines checks passed');
} finally { await browser.close(); }
