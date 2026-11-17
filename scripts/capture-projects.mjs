import { chromium } from "file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const projects = [
  ["wandyfitt", "https://wandyfitt.com.br/"],
  ["ares", "https://aresstudiopilates.com.br/"],
  ["beaute", "https://29beaute.com.br/"],
  ["alanna", "https://alannafotopet.com.br/"],
];
const results = await Promise.all(
  projects.map(async ([id, url]) => {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      deviceScaleFactor: 1,
      ignoreHTTPSErrors: false,
    });
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(2500);
      const close = page.locator("button.home-promo-close");
      if (id === "wandyfitt" && (await close.isVisible())) {
        await close.click();
        await page.waitForTimeout(500);
      }
      await page.screenshot({
        path: `public/projects/${id}-desktop.webp`,
        type: "webp",
        quality: 88,
      });
      const title = await page.title();
      const text = (await page.locator("body").innerText()).slice(0, 4500);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.reload({ waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(1800);
      if (id === "wandyfitt" && (await close.isVisible())) {
        await close.click();
        await page.waitForTimeout(500);
      }
      await page.screenshot({
        path: `public/projects/${id}-mobile.webp`,
        type: "webp",
        quality: 85,
      });
      return { id, url, title, text, captured: true };
    } catch (error) {
      return { id, url, error: String(error), captured: false };
    } finally {
      await context.close();
    }
  }),
);
await fs.writeFile(
  "scripts/project-evidence.json",
  JSON.stringify(results, null, 2),
);
console.log(JSON.stringify(results, null, 2));
await browser.close();
