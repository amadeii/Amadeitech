import { chromium } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const dir = '.impeccable/review/orion';
await fs.mkdir(dir, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const errors = [], checks = [];
async function open(url, width = 1440, reducedMotion = 'reduce') {
  const page = await browser.newPage({ viewport: { width, height: width < 650 ? 844 : 1000 }, reducedMotion });
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(() => {
    window.networkTriangles = 0;
    const original = WebGLRenderingContext.prototype.drawArrays;
    WebGLRenderingContext.prototype.drawArrays = function (...args) {
      if (this.canvas.closest('.network-field') && args[0] === this.TRIANGLES) window.networkTriangles++;
      return original.apply(this, args);
    };
    window.networkStrokes = 0;
    const stroke = CanvasRenderingContext2D.prototype.stroke;
    CanvasRenderingContext2D.prototype.stroke = function (...args) {
      if (this.canvas.closest('.network-field')) window.networkStrokes++;
      return stroke.apply(this, args);
    };
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  return page;
}
async function jump(page, selector) {
  await page.locator(selector).evaluate(el => scrollTo({ top: scrollY + el.getBoundingClientRect().top, behavior: 'instant' }));
  await page.waitForTimeout(700);
}
async function changedGlobe(page) {
  await jump(page, '#experiencia');
  const canvas = page.locator('.globe-canvas canvas');
  const a = await canvas.evaluate(el => el.toDataURL());
  await page.waitForTimeout(650);
  return a !== await canvas.evaluate(el => el.toDataURL());
}
try {
  for (const width of [1440, 768, 390, 320]) {
    const page = await open('http://127.0.0.1:5174/', width);
    assert.equal(await page.locator('html').getAttribute('data-motion'), 'full');
    assert.equal(await page.locator('.hero-light, .contact-orbit, .tech-section').count(), 0);
    assert.doesNotMatch(await page.locator('main').innerText(), /Matéria-prima|As tecnologias que dão vida/);
    for (const id of ['wandyfitt', 'ares', 'beaute', 'alanna']) {
      await jump(page, `#project-${id}`);
      const project = page.locator(`#project-${id}`);
      const names = await page.locator(`#project-${id} .marquee-group`).first().locator('.technology-word > span').allTextContents();
      assert.equal(names.filter(n => n === 'TypeScript').length, 1);
      const belt = project.locator('.marquee-belt');
      await page.mouse.move(0, 0);
      await project.locator('.technology-marquee').scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      const first = await belt.evaluate(el => getComputedStyle(el).transform);
      await page.waitForTimeout(500);
      assert.notEqual(await belt.evaluate(el => getComputedStyle(el).transform), first, `${id} carousel moves at ${width}`);
      const cycles = await project.locator('.technology-marquee').evaluate(el => {
        const viewport = el.querySelector('.marquee-viewport').getBoundingClientRect();
        const animation = el.querySelector('.marquee-belt').getAnimations()[0];
        const saved = animation.currentTime, duration = animation.effect.getTiming().duration;
        const samples = [];
        for (const phase of [0, .12, .33, .55, .8, .99]) {
          animation.currentTime = Number(duration) * phase;
          const counts = {};
          for (const span of el.querySelectorAll('.technology-word > span')) {
            const r = span.getBoundingClientRect();
            if (r.right > viewport.left + 4 && r.left < viewport.right - 4) counts[span.textContent] = (counts[span.textContent] ?? 0) + 1;
          }
          samples.push(counts);
        }
        animation.currentTime = saved;
        return samples;
      });
      assert.ok(cycles.every(sample => Object.values(sample).every(count => count === 1)), 'No repeated visible technology');
      if (id === 'wandyfitt' || id === 'beaute') {
        await project.locator('.project-panel-close').click();
        assert.match(await project.locator('.project-image-link img').first().getAttribute('src'), /desktop/);
        await project.getByRole('button', { name: 'Painel de comando', exact: true }).click();
        await project.getByRole('button', { name: 'Ampliar painel', exact: true }).click();
        assert.ok(await project.getByRole('dialog').isVisible());
        assert.ok(await project.locator('.panel-dialog-image img').evaluate(img => img.complete && img.naturalWidth >= 1200));
        await page.keyboard.press('Escape');
        assert.equal(await project.getByRole('dialog').isVisible(), false);
      }
    }
    assert.equal(await page.locator('#sistemas .system-status').innerText(), 'EM BREVE');
    assert.match(await page.locator('#sistemas').innerText(), /ainda não disponível/);
    assert.equal(await page.locator('#sistemas a, #sistemas button').count(), 0, 'No fake launch or demo action');
    await jump(page, '#sistemas');
    assert.ok(await page.locator('#sistemas img').evaluate(img => img.complete && img.naturalWidth > 0));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `${dir}/systems-${width}.png` });
    await page.locator('#sistemas').screenshot({ path: `${dir}/systems-section-${width}.png` });
    if (width === 1440) {
      assert.ok(await changedGlobe(page), 'Globe moves under native reduce in local demo');
      await jump(page, '#inicio');
      await page.waitForTimeout(1800);
      const hero = page.locator('.hero-object');
      const first = await hero.screenshot();
      await page.waitForTimeout(700);
      assert.notDeepEqual(await hero.screenshot(), first, 'AT still moves after orbit removal');
      const network = page.locator('.network-field');
      const firstNetwork = await network.screenshot();
      await page.waitForTimeout(650);
      assert.notDeepEqual(await network.screenshot(), firstNetwork, 'Particles still move');
      assert.equal(await page.evaluate(() => window.networkTriangles), 0, 'No WebGL network connector draws');
      assert.equal(await page.evaluate(() => window.networkStrokes), 0, 'No Canvas network connector strokes');
      // Element screenshots may scroll the clipped hero horizontally to expose
      // their target. Reset that test-induced scroll before the viewport shot.
      await page.locator('.hero').evaluate(el => { el.scrollLeft = 0; });
      await page.screenshot({ path: `${dir}/hero-${width}.png` });
    }
    if (width < 650) {
      await jump(page, '#inicio');
      await page.getByRole('button', { name: 'Menu' }).click();
      await page.getByRole('link', { name: 'Sistemas', exact: true }).click();
      assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
      assert.equal(await page.evaluate(() => location.hash), '#sistemas');
    }
    checks.push({ width, removedOrnaments: true, fourTypeScriptStacks: true, orionComingSoon: true, noOverflow: true });
    await page.close();
  }
  for (const query of ['reduce', 'system']) {
    const page = await open(`http://127.0.0.1:5174/?motion=${query}`);
    assert.equal(await page.locator('html').getAttribute('data-motion'), 'reduce');
    assert.equal(await changedGlobe(page), false);
    await page.close();
  }
  for (const initial of ['reduce', 'no-preference']) {
    const page = await open('http://127.0.0.1:4174/?motion=full', 1440, initial);
    for (const pref of [initial, initial === 'reduce' ? 'no-preference' : 'reduce']) {
      await page.emulateMedia({ reducedMotion: pref });
      await page.waitForTimeout(200);
      assert.equal(await page.locator('html').getAttribute('data-motion'), pref === 'reduce' ? 'reduce' : 'full');
      assert.equal(await changedGlobe(page), pref === 'no-preference');
      await jump(page, '#project-wandyfitt');
      const belt = page.locator('#project-wandyfitt .marquee-belt');
      const first = await belt.evaluate(el => getComputedStyle(el).transform);
      await page.waitForTimeout(500);
      assert.equal(first !== await belt.evaluate(el => getComputedStyle(el).transform), pref === 'no-preference');
      checks.push({ production: pref, dynamicFrom: initial, motionMeasured: true, demoParameterIgnored: true });
    }
    await page.close();
  }
  assert.deepEqual(errors, []);
  await fs.writeFile(`${dir}/results.json`, JSON.stringify({ checks, errors }, null, 2));
  console.log('ORION: content, navigation, responsive layout, actual motion and dynamic production preferences passed.');
} finally { await browser.close(); }
