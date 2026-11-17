import { chromium } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const dir = '.taste-skill/cinematic';
await fs.mkdir(dir, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const results = [], errors = [];
async function open(url, width = 1440, reducedMotion = 'reduce', options = {}) {
  const page = await browser.newPage({ viewport: { width, height: width === 768 ? 1024 : width < 700 ? 844 : 1080 }, reducedMotion, ...options });
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(() => {
    window.cinemaStarts = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      if (this.closest('.cinematic-text')) window.cinemaStarts.push({ text: this.closest('.cinematic-text').textContent, time: performance.now() });
      return animate.apply(this, args);
    };
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  return page;
}
async function jump(page, selector, wait = 100) {
  await page.locator(selector).first().evaluate(el => scrollTo({ top: scrollY + el.getBoundingClientRect().top - 64, behavior: 'instant' }));
  await page.waitForTimeout(wait);
}
const transform = (page, selector) => page.locator(selector).first().evaluate(el => getComputedStyle(el).transform);
try {
  for (const width of [1920, 1440, 768, 390, 320]) {
    const page = await open('http://127.0.0.1:5173/', width);
    assert.equal(await page.locator('html').getAttribute('data-motion'), 'full');
    assert.equal(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), true);
    await page.waitForTimeout(1700);
    await page.screenshot({ path: `${dir}/hero-${width}.png` });
    for (const [name, selector] of [['intro', '#sobre'], ['work', '#projetos'], ['wandyfitt', '#project-wandyfitt'], ['ares', '#project-ares'], ['beaute', '#project-beaute'], ['alanna', '#project-alanna'], ['contact', '#contato']]) {
      await jump(page, '#inicio', 80);
      await jump(page, selector, 90);
      const animated = name === 'intro' ? '.intro-section .cinema-line-body' : name === 'contact' ? '.contact-intro .cinema-line-body' : `#project-${name} .cinema-glyph`;
      if (name === 'intro' || name === 'contact' || name === 'wandyfitt' || name === 'alanna') {
        const a = await transform(page, animated);
        await page.waitForTimeout(140);
        assert.notEqual(await transform(page, animated), a, `${width}: ${name} must physically move between frames`);
        await page.screenshot({ path: `${dir}/${name}-entry-${width}.png` });
      }
      await page.waitForTimeout(1950);
      if (name === 'work') await page.screenshot({ path: `${dir}/${name}-${width}.png` });
      else await page.locator(selector).screenshot({ path: `${dir}/${name}-${width}.png` });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert.ok(overflow <= 1, `${width}: overflow ${overflow} at ${name}`);
      const clipped = await page.locator(`${selector} .cinema-line`).evaluateAll(lines => lines.flatMap(line => {
        const box = line.getBoundingClientRect();
        return [...line.querySelectorAll('.cinema-word')].filter(word => {
          const r = word.getBoundingClientRect();
          return r.right > box.right + 2 || r.left < box.left - 2;
        }).map(word => word.textContent);
      }));
      assert.deepEqual(clipped, [], `${width}: clipped heading words at ${name}`);
    }
    // Replay only after a complete exit, including fast jumps and slow approach.
    await jump(page, '#sobre', 2100);
    const count = () => page.evaluate(() => window.cinemaStarts.filter(x => x.text.includes('Seu negócio')).length);
    const before = await count();
    for (const delta of [18, -12, 20, -26]) { await page.evaluate(d => scrollBy({ top: d, behavior: 'instant' }), delta); await page.waitForTimeout(60); }
    assert.equal(await count(), before, 'Small shifts must not restart');
    await jump(page, '#contato', 100);
    await jump(page, '#sobre', 150);
    assert.ok(await count() > before, 'A complete exit must rearm');
    await jump(page, '#projetos', 2100);
    await page.locator('.project-index a').last().click();
    await page.waitForTimeout(2100);
    assert.equal(await page.evaluate(() => location.hash), '#project-alanna');
    // Preserve real links, both admin switches, native dialogs, and marquee keyboard control.
    for (const id of ['wandyfitt', 'beaute']) {
      const project = page.locator(`#project-${id}`);
      await jump(page, `#project-${id}`, 2000);
      await project.getByRole('button', { name: 'Painel de comando', exact: true }).click();
      assert.equal(await project.locator('.project-image-link').getAttribute('class'), 'project-image-link is-panel');
      await project.getByRole('button', { name: 'Ampliar painel', exact: true }).click();
      assert.ok(await project.getByRole('dialog').isVisible());
      await page.keyboard.press('Escape');
      assert.equal(await project.getByRole('dialog').isVisible(), false);
      await project.getByRole('button', { name: 'Site público', exact: true }).click();
    }
    for (const id of ['wandyfitt', 'ares', 'beaute', 'alanna']) {
      const project = page.locator(`#project-${id}`);
      const viewport = project.locator('.marquee-viewport');
      await viewport.scrollIntoViewIfNeeded();
      await viewport.focus();
      await page.keyboard.press('ArrowRight');
      assert.ok(await viewport.evaluate(el => el.scrollLeft) > 0);
      assert.match(await project.locator('.project-link').getAttribute('href'), /^https:\/\//);
    }
    const broken = await page.locator('a[href^="#"]').evaluateAll(links => links.map(a => a.getAttribute('href')).filter(h => !document.getElementById(h.slice(1))));
    assert.deepEqual(broken, []);
    if (width < 650) {
      await jump(page, '#inicio', 300);
      await page.getByRole('button', { name: 'Menu', exact: true }).click();
      await page.getByRole('link', { name: 'Sites', exact: true }).click();
      assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
    }
    // Actual slow wheel input, then a rapid trip through the document.
    await jump(page, '#sobre', 200);
    for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, 150); await page.waitForTimeout(65); }
    for (const selector of ['#contato', '#project-ares', '#inicio', '#project-alanna']) await jump(page, selector, 60);
    await page.waitForTimeout(2100);
    assert.equal(await page.locator('.cinematic-text[data-cinematic="playing"]').count(), 0);
    results.push({ width, layout: 'pass', textMotion: 'measured', replay: 'pass', linksDialogsMarquees: 'pass' });
    console.log(`PASS ${width}`);
    await page.close();
  }
  // Resolved local policy and real reduced mode.
  for (const [path, expected] of [['?motion=reduce', 'reduce'], ['?motion=system', 'reduce']]) {
    const page = await open(`http://127.0.0.1:5173/${path}`, 390);
    assert.equal(await page.locator('html').getAttribute('data-motion'), expected);
    await jump(page, '#sobre');
    assert.equal(await page.locator('.intro-section .cinematic-text').evaluate(el => el.getAnimations({ subtree: true }).length), 0);
    await page.locator('#sobre').screenshot({ path: `${dir}/reduced-local${path.includes('system') ? '-system' : ''}.png` });
    await page.close();
  }
  // Build must ignore demo parameters and react to native changes both ways.
  const prod = await open('http://127.0.0.1:4173/?motion=full', 1440);
  assert.equal(await prod.locator('html').getAttribute('data-motion'), 'reduce');
  await jump(prod, '#sobre');
  assert.equal(await prod.locator('.intro-section .cinematic-text').evaluate(el => el.getAnimations({ subtree: true }).length), 0);
  await prod.emulateMedia({ reducedMotion: 'no-preference' });
  await prod.waitForTimeout(130);
  assert.equal(await prod.locator('html').getAttribute('data-motion'), 'full');
  const a = await transform(prod, '.intro-section .cinema-line-body');
  await prod.waitForTimeout(140);
  assert.notEqual(await transform(prod, '.intro-section .cinema-line-body'), a);
  await prod.emulateMedia({ reducedMotion: 'reduce' });
  await prod.waitForTimeout(100);
  assert.equal(await prod.locator('html').getAttribute('data-motion'), 'reduce');
  assert.equal(await prod.locator('.intro-section .cinematic-text').evaluate(el => el.getAnimations({ subtree: true }).length), 0);
  await prod.locator('#sobre').screenshot({ path: `${dir}/production-reduced.png` });
  await prod.close();
  const plain = await open('http://127.0.0.1:4173/?motion=reduce', 390, 'no-preference');
  assert.equal(await plain.locator('html').getAttribute('data-motion'), 'full');
  await jump(plain, '#contato', 2100);
  await plain.locator('#contato').screenshot({ path: `${dir}/production-full-mobile.png` });
  await plain.close();
  const nojs = await open('http://127.0.0.1:4173/', 390, 'reduce', { javaScriptEnabled: false });
  assert.ok(await nojs.getByRole('heading', { name: 'AmadeiTech — Sites e sistemas sob medida' }).isVisible());
  assert.equal(await nojs.locator('noscript a').count(), 5);
  await nojs.screenshot({ path: `${dir}/no-js.png`, fullPage: true });
  await nojs.close();
  assert.deepEqual(errors, [], 'No browser errors');
  results.push({ localPolicy: 'pass', productionDynamicPreference: 'pass', noJS: 'pass', consoleErrors: errors });
  await fs.writeFile(`${dir}/results.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally { await browser.close(); }
