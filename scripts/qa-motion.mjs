import { chromium } from "file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const hash = (buffer) => createHash("sha256").update(buffer).digest("hex");
const results = [];
for (const reducedMotion of ["no-preference", "reduce"]) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion,
  });
  const page = await context.newPage();
  const requests = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
  assert.equal(
    requests.some((url) => /\/assets\/Globe-/.test(url)),
    false,
    "3D chunk must be lazy",
  );
  await page.locator("#experiencia").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1800);
  const canvas = page.locator(".globe-canvas canvas");
  assert.equal(await canvas.count(), 1);
  const before = hash(await canvas.screenshot());
  await page.evaluate(() => scrollBy({ top: 170, behavior: "instant" }));
  await page.waitForTimeout(1300);
  const after = hash(await canvas.screenshot());
  if (reducedMotion === "reduce")
    assert.equal(
      before,
      after,
      "Reduced motion globe must remain static on scroll",
    );
  else assert.notEqual(before, after, "Scroll must change globe orientation");
  await page.locator(".globe-control input").focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(await page.locator(".globe-control input").inputValue(), "1");
  await page.getByRole("button", { name: "Usar versão leve" }).click();
  assert.equal(await canvas.count(), 0);
  await page.waitForFunction(
    () => document.querySelector(".globe-fallback img")?.naturalWidth > 0,
  );
  assert.equal(
    await page
      .locator(".globe-fallback img")
      .evaluate((el) => el.complete && el.naturalWidth > 0),
    true,
  );
  results.push({
    reducedMotion,
    lazyChunk: true,
    scrollRotation: before !== after,
    keyboardRange: true,
    lightFallback: true,
  });
  await context.close();
}
const context = await browser.newContext({
  viewport: { width: 320, height: 780 },
  hasTouch: true,
  isMobile: true,
});
const page = await context.newPage();
await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
assert.equal(
  await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
  false,
);
await page.getByRole("button", { name: "Menu", exact: true }).tap();
await page.keyboard.press("Escape");
assert.equal(
  await page
    .getByRole("button", { name: "Menu", exact: true })
    .getAttribute("aria-expanded"),
  "false",
);
await context.close();
await fs.writeFile(
  ".impeccable/review/motion-results.json",
  JSON.stringify(results, null, 2),
);
console.log(JSON.stringify({ motion: results, touch320: true }, null, 2));
await browser.close();
