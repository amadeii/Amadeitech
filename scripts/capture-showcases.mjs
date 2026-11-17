import { chromium } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';

const projects = [
  { id: 'wandyfitt', url: 'https://wandyfitt.com.br/', scenes: ['Comida saudável pronta todos os dias', 'Mais praticidade, sabor e cuidado na sua rotina', 'NOSSA PROPOSTA'] },
  { id: 'ares', url: 'https://aresstudiopilates.com.br/', scenes: ['Movimento, equilíbrio e bem-estar', 'Sobre o Ares Studio', 'Nossas aulas'] },
  { id: 'beaute', url: 'https://29beaute.com.br/', scenes: ['Beleza em sua forma essencial', 'O extraordinário mora nos detalhes.', 'Além do que se vê.'] },
  { id: 'alanna', url: 'https://alannafotopet.com.br/', scenes: ['Memórias Natalinas', 'Muito prazer, eu sou a Alanna!', 'Você merece viver isso!'] },
];
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const sourceDir = '.taste-skill/premium/sources';
await fs.mkdir(sourceDir, { recursive: true });
await fs.mkdir('public/projects/showcase', { recursive: true });
const mobileOnly = process.argv.includes('--mobile');
const projectFilter = process.argv.find(arg => arg.startsWith('--project='))?.split('=')[1];
const previous = mobileOnly || projectFilter ? JSON.parse(await fs.readFile(`${sourceDir}/evidence.json`, 'utf8')) : [];
const records = previous.filter(record => !((!projectFilter || record.id === projectFilter) && (!mobileOnly || record.device === 'mobile')));
try {
  for (const project of projects) {
    if (projectFilter && project.id !== projectFilter) continue;
    for (const device of mobileOnly ? ['mobile'] : ['desktop', 'mobile']) {
      const viewport = device === 'desktop' ? { width: 1440, height: 960 } : { width: 390, height: 844 };
      const page = await browser.newPage({ viewport, reducedMotion: 'reduce', deviceScaleFactor: 1, ignoreHTTPSErrors: false });
      await page.goto(project.url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.evaluate(() => document.fonts.ready);
      const close = page.locator('button.home-promo-close');
      if (project.id === 'wandyfitt' && await close.isVisible()) await close.click();
      await page.waitForTimeout(1800);
      const headings = await page.locator('h1,h2,h3').evaluateAll(elements => elements.filter(el => el.getBoundingClientRect().height > 0).map(el => ({ text: el.textContent.trim().replace(/\s+/g, ' '), y: Math.round(el.getBoundingClientRect().top + scrollY) })));
      const targets = project.scenes.map((scene, index) => {
        if (index === 0) return 0;
        const clean = value => value.toLowerCase().replace(/\s/g, '');
        const found = headings.find(heading => clean(heading.text) === clean(scene));
        if (!found) throw new Error(`Scene not found: ${project.id} ${scene}`);
        const mobileOffsets = { wandyfitt: [0, 220, 130], ares: [0, 420, -130], beaute: [0, 500, 420], alanna: [0, -350, 80] };
        return Math.max(0, found.y - (device === 'mobile' ? mobileOffsets[project.id][index] : 130));
      });
      const cdp = await page.context().newCDPSession(page);
      for (let index = 0; index < targets.length; index++) {
        const target = targets[index];
        const start = await page.evaluate(() => scrollY);
        const steps = Math.max(1, Math.ceil(Math.abs(target - start) / 420));
        for (let step = 1; step <= steps; step++) {
          await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), start + (target - start) * step / steps);
          await page.waitForTimeout(160);
        }
        await page.waitForTimeout(1500);
        await page.evaluate(async () => {
          const visible = [...document.images].filter(img => { const rect = img.getBoundingClientRect(); return rect.bottom > 0 && rect.top < innerHeight; });
          await Promise.race([Promise.all(visible.map(img => img.decode().catch(() => undefined))), new Promise(resolve => setTimeout(resolve, 8000))]);
        });
        const base = `${project.id}-${index}-${device}`;
        const originalPath = `${sourceDir}/${base}.png`;
        const webpPath = `public/projects/showcase/${base}.webp`;
        const original = await page.screenshot({ path: originalPath, animations: 'disabled' });
        const { data } = await cdp.send('Page.captureScreenshot', { format: 'webp', quality: 86, fromSurface: true });
        const webp = Buffer.from(data, 'base64');
        await fs.writeFile(webpPath, webp);
        records.push({ id: project.id, scene: index, label: project.scenes[index], device, viewport, url: page.url(), title: await page.title(), scrollY: await page.evaluate(() => scrollY), bounds: await page.evaluate(() => ({ x: 0, y: scrollY, width: innerWidth, height: innerHeight, documentHeight: document.documentElement.scrollHeight })), capturedAt: new Date().toISOString(), originalPath, webpPath, originalSha256: createHash('sha256').update(original).digest('hex'), webpSha256: createHash('sha256').update(webp).digest('hex'), bytes: webp.length });
        console.log(`Captured ${base} ${webp.length} bytes`);
      }
      await page.close();
    }
  }
  await fs.writeFile(`${sourceDir}/evidence.json`, JSON.stringify(records, null, 2));
  const screens = Object.fromEntries(projects.map(project => [project.id, project.scenes.map((label, index) => ({ label, desktop: `/projects/showcase/${project.id}-${index}-desktop.webp`, mobile: `/projects/showcase/${project.id}-${index}-mobile.webp`, alt: `${label} — captura real do site ${project.id === 'beaute' ? '29 Beauté' : project.id === 'ares' ? 'Ares Studio Pilates' : project.id === 'alanna' ? 'Alanna Foto Pet' : 'WandyFitt'}` }))]));
  await fs.writeFile('src/showcaseScreens.ts', `// Capturas públicas reais. Proveniência: .taste-skill/premium/sources/evidence.json\nexport type ShowcaseScreen = { label: string; desktop: string; mobile: string; alt: string };\n\nexport const showcaseScreens: Record<string, ShowcaseScreen[]> = ${JSON.stringify(screens, null, 2)};\n`);
} finally { await browser.close(); }
