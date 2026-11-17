import { chromium } from "file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";

const dir = ".impeccable/review/orion-real";
await fs.mkdir(dir, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});
const errors = [],
  checks = [];
async function open(url, width = 1440, preference = "reduce") {
  const page = await browser.newPage({
    viewport: { width, height: 1000 },
    reducedMotion: preference,
  });
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  return page;
}
async function jump(page, selector) {
  await page.locator(selector).evaluate((el) =>
    scrollTo({
      top: scrollY + el.getBoundingClientRect().top - 80,
      behavior: "instant",
    }),
  );
}
async function entry(page, moving) {
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(180);
  await jump(page, ".system-visual");
  await page.waitForTimeout(70);
  const first = await page.locator(".system-visual").evaluate((el) => ({
    transform: getComputedStyle(el).transform,
    opacity: getComputedStyle(el).opacity,
    animations: el.getAnimations().length,
  }));
  await page.waitForTimeout(160);
  const second = await page
    .locator(".system-visual")
    .evaluate((el) => getComputedStyle(el).transform);
  assert.equal(
    first.transform !== second,
    moving,
    JSON.stringify({ first, second, moving }),
  );
  if (!moving) assert.equal(first.animations, 0);
  await page.waitForTimeout(500);
  return { first, second, moving };
}
try {
  const source = await fs.readFile(
    "C:/Users/gabri/AppData/Local/Temp/codex-clipboard-c91b6b76-33e9-472b-a3e7-60f07235811d.png",
  );
  const asset = await fs.readFile("public/projects/orion-real.png");
  assert.deepEqual(source, asset, "Supplied capture must remain unmodified");
  for (const width of [1440, 1024, 768, 390, 320]) {
    const page = await open("http://127.0.0.1:5175/", width);
    assert.equal(
      await page.locator("html").getAttribute("data-motion"),
      "full",
    );
    const section = page.locator("#sistemas");
    assert.equal(await section.locator("h3").innerText(), "ORION\nEmpresarial");
    assert.equal(
      await section.locator(".system-status").innerText(),
      "EM BREVE",
    );
    assert.match(
      await section.innerText(),
      /Gestão inteligente de compras, do pedido ao recebimento\./,
    );
    assert.equal(await section.locator("dt").count(), 4);
    assert.equal(await section.locator("a").count(), 0);
    assert.equal(await section.locator("button").count(), 2); // Capture zoom and close; no product access.
    assert.equal(
      await page.locator('img[src="/projects/orion-preview.svg"]').count(),
      0,
    );
    await jump(page, "#sistemas");
    await page.waitForTimeout(650);
    assert.ok(
      await section
        .locator(".orion-capture-crop img")
        .evaluate((img) => img.complete && img.naturalWidth === 1910),
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await section.screenshot({ path: `${dir}/section-${width}.png` });
    // Existing four project presentations and their local image assets remain usable.
    assert.equal(await page.locator("[data-project]").count(), 4);
    for (const image of await page.locator("[data-project] img").all()) {
      if (!(await image.isVisible())) continue; // Closed screenshot dialogs have no rendered image.
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((img) => img.decode());
    }
    if (width === 390) {
      await jump(page, "#inicio");
      await page.getByRole("button", { name: "Menu", exact: false }).click();
      await page.getByRole("link", { name: "Sistemas", exact: true }).click();
      assert.equal(
        await page.locator(".menu-toggle").getAttribute("aria-expanded"),
        "false",
      );
      assert.equal(await page.evaluate(() => location.hash), "#sistemas");
    }
    checks.push({
      width,
      realCapture: true,
      fourFeatures: true,
      comingSoon: true,
      noOverflow: true,
      existingProjects: true,
    });
    await page.close();
  }
  const dev = await open("http://127.0.0.1:5175/");
  checks.push({
    localNativeReduce: await entry(dev, true),
    replayAfterCompleteExit: await entry(dev, true),
  });
  await dev.close();
  for (const mode of ["reduce", "system"]) {
    const page = await open(`http://127.0.0.1:5175/?motion=${mode}`);
    checks.push({ localMode: mode, entry: await entry(page, false) });
    await page.close();
  }
  for (const initial of ["reduce", "no-preference"]) {
    const page = await open(
      "http://127.0.0.1:4178/?motion=full",
      1440,
      initial,
    );
    for (const preference of [
      initial,
      initial === "reduce" ? "no-preference" : "reduce",
    ]) {
      await page.emulateMedia({ reducedMotion: preference });
      await page.waitForTimeout(100);
      assert.equal(
        await page.locator("html").getAttribute("data-motion"),
        preference === "reduce" ? "reduce" : "full",
      );
      checks.push({
        production: preference,
        entry: await entry(page, preference !== "reduce"),
      });
    }
    await page.close();
  }
  assert.deepEqual(errors, []);
  await fs.writeFile(
    `${dir}/results.json`,
    JSON.stringify(
      {
        checks,
        errors,
        screenshotSha256: createHash("sha256").update(asset).digest("hex"),
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ passed: true, checks: checks.length, errors }));
} finally {
  await browser.close();
}
