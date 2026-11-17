import { chromium } from 'file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
const phase = process.argv[2] ?? 'after';
const dir = `.impeccable/review/projects-refine/${phase}`;
await fs.mkdir(dir, { recursive: true });
const browser = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true });
const measurements = [];
try {
 for (const width of [1440, 1920, 768, 390, 320]) {
  const page = await browser.newPage({ viewport: { width, height: width < 650 ? 844 : 1000 }, reducedMotion:'reduce' });
  await page.goto('http://127.0.0.1:5173/', { waitUntil:'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  for (const id of ['beaute','wandyfitt','alanna','ares']) {
   const project = page.locator(`#project-${id}`);
   await project.scrollIntoViewIfNeeded();
   await page.mouse.move(0,0);
   await page.waitForTimeout(700);
   await page.screenshot({ path:`${dir}/${id}-${width}.png` });
   measurements.push(await project.evaluate((el, width) => {
    const box = e => { const r=e.getBoundingClientRect();return {width:r.width,height:r.height}; };
    return {viewport:width,id:el.id,project:box(el),visual:box(el.querySelector('.project-visual')),capture:box(el.querySelector('.project-image-link')),section:box(document.querySelector('#projetos'))};
   }, width));
  }
  await page.close();
 }
 await fs.writeFile(`${dir}/measurements.json`, JSON.stringify(measurements,null,2));
 console.log(JSON.stringify(measurements.filter(x=>x.viewport===1440),null,2));
} finally { await browser.close(); }
