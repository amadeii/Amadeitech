import { chromium } from "file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
import crypto from "node:crypto";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const findings = [];
const errors = [];
for (const width of [1440, 1920, 768, 390]) {
  const context = await browser.newContext({
    viewport: { width, height: width === 390 ? 844 : 1000 },
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push({ width, error: e.message }));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push({ width, error: m.text() });
  });
  await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1100);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > innerWidth,
  );
  assert.equal(overflow, false, `Overflow ${width}`);
  const headings = await page.locator("h1,h2,h3").evaluateAll((els) =>
    els.map((el) => ({
      text: el.textContent,
      width: el.getBoundingClientRect().width,
      height: el.getBoundingClientRect().height,
      lineHeight: getComputedStyle(el).lineHeight,
    })),
  );
  await page.screenshot({ path: `.impeccable/review/hero-${width}.png` });
  // Visit every reveal and lazy scene before returning to the top for full-page captures.
  await page.locator("#experiencia").scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);
  if (width === 1440) {
    const canvas = page.locator(".globe-canvas canvas");
    assert.equal(await canvas.count(), 1);
    await canvas.screenshot({ path: ".impeccable/review/globe-before.png" });
    const before = crypto
      .createHash("sha256")
      .update(await canvas.screenshot())
      .digest("hex");
    await page.locator(".globe-control input").fill("90");
    await page.waitForTimeout(1200);
    const after = crypto
      .createHash("sha256")
      .update(await canvas.screenshot())
      .digest("hex");
    assert.notEqual(before, after, "Globe must respond to control");
    await canvas.screenshot({
      path: "public/textures/globe-poster.webp",
      type: "webp",
    });
    await page
      .locator("#experiencia")
      .screenshot({ path: ".impeccable/review/globe-desktop.png" });
    findings.push(
      "Globo renderizado e controle de orientação verificado por diferença de pixels",
    );
  }
  if (width === 390) {
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    assert.equal(await page.locator("#main-navigation").isVisible(), true);
    await page.getByRole("link", { name: "Serviços", exact: true }).click();
    assert.equal(await page.locator("#main-navigation").isVisible(), false);
    findings.push("Menu mobile abre, navega e fecha");
  }
  const preview = page.getByRole("group", {
    name: "Visualização de 29 Beauté",
  });
  await preview.getByRole("button", { name: "Mobile", exact: true }).click();
  assert.equal(
    await preview
      .getByRole("button", { name: "Mobile" })
      .getAttribute("aria-pressed"),
    "true",
  );
  assert.match(
    await page
      .locator(".project-0 .project-image-link img")
      .getAttribute("src"),
    /mobile/,
  );
  await preview.getByRole("button", { name: "Desktop", exact: true }).click();
  await page.locator("#contato").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Preparar meu pedido" }).click();
  assert.equal(
    await page.locator("input[name=name]").evaluate((el) => el.validity.valid),
    false,
  );
  await page.locator("input[name=name]").fill("Teste de interface");
  await page.locator("input[name=company]").fill("Avaliação local");
  await page
    .locator("select[name=type]")
    .selectOption({ label: "Sistema web ou painel" });
  await page
    .locator("textarea")
    .fill("Preciso organizar os pedidos da minha empresa.");
  await page.locator("input[name=contact]").fill("teste@example.com");
  await page.getByRole("button", { name: "Preparar meu pedido" }).click();
  const href = await page
    .getByRole("link", { name: "Continuar no WhatsApp" })
    .getAttribute("href");
  assert.match(href, /https:\/\/wa.me\/5541991543278\?text=/);
  assert.match(decodeURIComponent(href), /organizar os pedidos/);
  await page.locator("textarea").fill("Uma alteração na descrição do projeto.");
  assert.equal(
    await page.getByRole("link", { name: "Continuar no WhatsApp" }).count(),
    0,
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  for (const selector of [
    "#sobre",
    "#projetos",
    "#project-alanna",
    "#experiencia",
    "#servicos",
    "#contato",
  ]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(500);
  await page.screenshot({
    path: `.impeccable/review/page-${width}.png`,
    fullPage: true,
  });
  findings.push({ width, overflow, headings });
  await context.close();
}
const reduced = await browser.newContext({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
});
const page = await reduced.newPage();
await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
assert.equal(
  await page.locator("h1").evaluate((el) => getComputedStyle(el).animationName),
  "none",
);
await page.locator("#experiencia").scrollIntoViewIfNeeded();
await page.waitForTimeout(1800);
await page
  .locator('img[loading="lazy"]')
  .evaluateAll((images) =>
    images.forEach((image) => (image.loading = "eager")),
  );
await page.evaluate(() =>
  Promise.all(
    [...document.images].map((image) => image.decode().catch(() => {})),
  ),
);
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await page.screenshot({
  path: ".impeccable/review/reduced-motion.png",
  fullPage: true,
});
await reduced.close();
await fs.writeFile(
  ".impeccable/review/qa-results.json",
  JSON.stringify({ findings, errors }, null, 2),
);
console.log(
  JSON.stringify(
    {
      viewports: [1440, 1920, 768, 390],
      functionalChecks: findings.filter((x) => typeof x === "string"),
      errors,
    },
    null,
    2,
  ),
);
await browser.close();
assert.equal(errors.length, 0, "Browser runtime errors");
