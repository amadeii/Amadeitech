import { chromium } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const dir = '.impeccable/review/title-effects';
await fs.mkdir(dir, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const errors = [], checks = [];
async function open(url, width = 1440, reducedMotion = 'reduce', options = {}) {
  const page = await browser.newPage({ viewport: { width, height: width < 650 ? 844 : 1000 }, reducedMotion, ...options });
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  return page;
}
async function jump(page, selector) {
  await page.locator(selector).evaluate(el => scrollTo({ top: scrollY + el.getBoundingClientRect().top, behavior: 'instant' }));
}
const pixels = page => page.locator('.vaporize-canvas').evaluate(canvas => canvas.toDataURL());
async function phase(page, value) {
  await page.waitForFunction(value => document.querySelector('h1').dataset.vaporizePhase === value, value, { timeout: 18000 });
}
try {
  for (const width of [1440, 768, 390, 320]) {
    const page = await open('http://127.0.0.1:5174/', width);
    assert.equal(await page.locator('html').getAttribute('data-motion'), 'full');
    assert.equal(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), true);
    assert.equal((await page.locator('h1').innerText()).replace(/\s+/g, ' ').trim(), 'Criamos o que vem depois.');
    assert.equal(await page.locator('.brand-morph').count(), 0);
    assert.equal(await page.locator('.brand').innerText(), 'AmadeiTech');
    assert.equal(await page.locator('.hero-object').count(), 1);
    assert.equal(await page.locator('.stagger-flip').getAttribute('aria-label'), 'Ideias em outra dimensão.');
    assert.equal(await page.locator('h1').getAttribute('aria-hidden'), null);
    assert.equal(await page.locator('.vaporize-canvas').getAttribute('aria-hidden'), 'true');
    assert.equal(await page.locator('nav a').first().innerText(), 'Sites');
    assert.equal(await page.locator('nav a').first().getAttribute('href'), '#projetos');
    assert.match(await page.locator('#projetos h2').innerText(), /^Sites que/);
    await page.waitForFunction(() => document.querySelector('h1').dataset.vaporizeReady === 'true');
    await phase(page, 'hold');
    await page.waitForTimeout(600);
    const hold = await pixels(page);
    await page.evaluate(() => {
      const c = document.querySelector('.vaporize-canvas');
      window.vaporizeMask = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    });
    await page.screenshot({ path: `${dir}/hero-${width}.png` });
    await phase(page, 'out');
    await page.waitForTimeout(550);
    const out = await pixels(page);
    assert.notEqual(out, hold, 'Raster changes during dissolution');
    const movement = await page.locator('.vaporize-canvas').evaluate(c => {
      const current = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let outside = 0, changed = 0;
      for (let i = 3; i < current.length; i += 4) {
        if (current[i] > 20 && window.vaporizeMask[i] === 0) outside++;
        if (Math.abs(current[i] - window.vaporizeMask[i]) > 10) changed++;
      }
      return { outside, changed };
    });
    assert.ok(movement.outside > 20, 'Particles physically leave their original glyph pixels, beyond a fade');
    await page.screenshot({ path: `${dir}/vaporize-out-${width}.png` });
    await phase(page, 'in');
    await page.waitForTimeout(450);
    assert.notEqual(await pixels(page), out);
    await page.screenshot({ path: `${dir}/vaporize-in-${width}.png` });
    await phase(page, 'hold');
    await page.waitForTimeout(120);
    assert.equal(await pixels(page), hold, 'Original glyphs fully reconstructed');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await jump(page, '#servicos');
    await page.waitForFunction(() => document.querySelector('.stagger-flip').dataset.flip === 'playing');
    await page.waitForTimeout(180);
    const flip = await page.locator('.stagger-flip').evaluate(el => {
      const chars = [...el.querySelectorAll('.text-3d-flip-char')];
      const matrix = new DOMMatrix(getComputedStyle(chars[0]).transform);
      return { perspective: getComputedStyle(el).perspective, depth: matrix.m43, rotation: matrix.m23,
        first: getComputedStyle(chars[0]).transform, last: getComputedStyle(chars.at(-1)).transform,
        face: getComputedStyle(chars[0].querySelector('.flip-second')).transform,
        delays: chars.map(c => c.getAnimations()[0]?.effect.getTiming().delay) };
    });
    assert.equal(flip.perspective, '800px');
    assert.ok(Math.abs(flip.rotation) > .1 && Math.abs(flip.depth) > 10, 'True 3D rotation and Z depth');
    assert.notEqual(flip.first, flip.last, 'Sequential letters');
    assert.equal(flip.delays[1] - flip.delays[0], 50);
    await page.screenshot({ path: `${dir}/flip-${width}.png` });
    await page.waitForFunction(() => document.querySelector('.stagger-flip').dataset.flip === 'rest');
    await page.screenshot({ path: `${dir}/flip-rest-${width}.png` });
    if (width === 1440) {
      await page.mouse.move(0, 0);
      await page.locator('.stagger-flip').hover();
      await page.waitForFunction(() => document.querySelector('.stagger-flip').dataset.flip === 'playing');
      await page.mouse.move(0, 0);
    }
    // Existing internal anchors all remain resolvable.
    const missing = await page.locator('a[href^="#"]').evaluateAll(links => links.map(a => a.getAttribute('href')).filter(href => !document.getElementById(href.slice(1))));
    assert.deepEqual(missing, []);
    if (width < 650) {
      await jump(page, '#inicio');
      await page.getByRole('button', { name: 'Menu' }).click();
      await page.getByRole('link', { name: 'Sites', exact: true }).click();
      assert.equal(await page.evaluate(() => location.hash), '#projetos');
      assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
    }
    assert.equal(await page.locator('#sistemas .system-status').innerText(), 'EM BREVE');
    // Both admin viewers, public-site switches, native dialogs and carousels.
    for (const id of ['wandyfitt', 'beaute']) {
      const project = page.locator(`#project-${id}`);
      await jump(page, `#project-${id}`);
      await project.locator('.project-panel-close').click();
      await project.getByRole('button', { name: 'Painel de comando', exact: true }).click();
      await project.getByRole('button', { name: 'Ampliar painel', exact: true }).click();
      assert.ok(await project.getByRole('dialog').isVisible());
      await page.keyboard.press('Escape');
    }
    for (const id of ['wandyfitt', 'ares', 'beaute', 'alanna']) {
      await jump(page, `#project-${id}`);
      const project = page.locator(`#project-${id}`);
      const belt = project.locator('.marquee-belt');
      await page.mouse.move(0, 0);
      await project.locator('.technology-marquee').scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      const a = await belt.evaluate(el => getComputedStyle(el).transform);
      await page.waitForTimeout(400);
      assert.notEqual(await belt.evaluate(el => getComputedStyle(el).transform), a);
      assert.match(await project.locator('.marquee-group').first().innerText(), /TypeScript/);
    }
    await jump(page, '#experiencia');
    await page.waitForTimeout(700);
    const globe = page.locator('.globe-canvas canvas');
    const a = await globe.evaluate(c => c.toDataURL());
    await page.waitForTimeout(400);
    assert.notEqual(await globe.evaluate(c => c.toDataURL()), a);
    const frozen = await pixels(page);
    await page.waitForTimeout(450);
    assert.equal(await pixels(page), frozen, 'Vaporize stops outside viewport');
    checks.push({ width, fullMotionUnderNativeReduce: true, particles: movement, flip, preservedFeatures: true, noOverflow: true });
    console.log(`Title effects ${width}: passed`);
    await page.close();
  }
  // Reduced and system modes locally; production ignores demo override, including
  // both directions of dynamic preference changes. Native heading is readable.
  for (const url of ['http://127.0.0.1:5174/?motion=reduce', 'http://127.0.0.1:5174/?motion=system', 'http://127.0.0.1:4174/?motion=full']) {
    const page = await open(url);
    assert.equal(await page.locator('html').getAttribute('data-motion'), 'reduce');
    assert.equal(await page.locator('.vaporize-canvas').isVisible(), false);
    assert.notEqual(await page.locator('.vaporize-source').evaluate(el => getComputedStyle(el).color), 'rgba(0, 0, 0, 0)');
    await jump(page, '#servicos');
    await page.waitForTimeout(400);
    assert.equal(await page.locator('.text-3d-flip-char').first().evaluate(el => el.getAnimations().length), 0);
    if (url.includes('4174')) {
      await jump(page, '#inicio');
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await phase(page, 'out');
      const a = await pixels(page);
      await page.waitForTimeout(300);
      assert.notEqual(await pixels(page), a);
      await jump(page, '#servicos');
      await page.waitForFunction(() => document.querySelector('.stagger-flip').dataset.flip === 'playing');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(150);
      assert.equal(await page.locator('.text-3d-flip-char').first().evaluate(el => el.getAnimations().length), 0);
      assert.equal(await page.locator('.vaporize-canvas').isVisible(), false);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await jump(page, '#inicio');
      await phase(page, 'out');
      checks.push({ productionDynamic: true, nativeHeadingFallback: true, parametersIgnored: true });
    }
    await page.close();
  }
  // No Canvas 2D: text fallback stays present instead of a blank hero.
  const fallback = await browser.newPage();
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind, ...rest) {
      if (kind === '2d' && this.closest('.vaporize-heading')) return null;
      return original.call(this, kind, ...rest);
    };
  });
  await fallback.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle' });
  assert.equal(await fallback.locator('.vaporize-canvas').isVisible(), false);
  assert.notEqual(await fallback.locator('.vaporize-source').evaluate(el => getComputedStyle(el).color), 'rgba(0, 0, 0, 0)');
  await fallback.close();
  assert.deepEqual(errors, []);
  await fs.writeFile(`${dir}/results.json`, JSON.stringify({ checks, errors, canvasFallback: true }, null, 2));
  console.log('All typography, particle movement, 3D, responsive, accessibility and regression checks passed.');
} finally { await browser.close(); }
