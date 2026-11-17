import { chromium } from "file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import { PNG } from "file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright-core/lib/utilsBundle.js";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const dir = ".impeccable/review/hero-fallback";
await fs.mkdir(dir, { recursive: true });
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const checks = [],
  errors = [];
function change(a, b) {
  const x = PNG.sync.read(a),
    y = PNG.sync.read(b);
  let n = 0;
  for (let i = 0; i < x.data.length; i += 4)
    if ([0, 1, 2].some((c) => Math.abs(x.data[i + c] - y.data[i + c]) > 4)) n++;
  return n / (x.width * x.height);
}
try {
  for (const width of [1440, 390]) {
    const p = await browser.newPage({
      viewport: { width, height: width < 650 ? 844 : 1000 },
      reducedMotion: "reduce",
    });
    p.on("pageerror", (e) => errors.push(e.message));
    await p.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
    await p.waitForTimeout(1800);
    const canvas = p.locator(".hero-object canvas");
    assert.equal(await p.locator(".hero-object-fallback").count(), 0);
    for (let cycle = 0; cycle < 2; cycle++) {
      await canvas.evaluate((c) => {
        window.heroContextLoss = c
          .getContext("webgl2")
          .getExtension("WEBGL_lose_context");
        if (!window.heroContextLoss)
          throw Error("Context-loss extension unavailable");
        window.heroContextLoss.loseContext();
      });
      await p.locator(".hero-object [data-renderer=svg]").waitFor();
      await p
        .locator(".hero-object svg path")
        .first()
        .waitFor({ state: "attached" });
      assert.equal(
        await canvas.count(),
        0,
        "Lost WebGL canvas is detached while the vector renderer is active",
      );
      assert.equal(await p.locator(".hero-object svg").isVisible(), true);
      assert.ok(
        (await p.locator(".hero-object svg path").count()) > 0,
        "The vector renderer draws the real model",
      );
      if (cycle === 0) await p.screenshot({ path: `${dir}/lost-${width}.png` });
      await p.waitForTimeout(400);
      await p.evaluate(() => window.heroContextLoss.restoreContext());
      await p.waitForFunction(() =>
        document.querySelector(".hero-object [data-renderer=webgl] canvas"),
      );
      assert.equal(
        await p.locator(".hero-object-fallback").count(),
        0,
        "Fallback removed after successful rendering",
      );
      assert.equal(await canvas.isVisible(), true);
    }
    await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await p.waitForTimeout(400);
    // The mobile canvas intentionally extends beyond x=0. Clip its intersection
    // with the viewport: locator screenshots mishandle that negative origin.
    const r = await canvas.boundingBox(),
      viewport = p.viewportSize();
    const clip = { x: Math.max(0, r.x), y: Math.max(0, r.y) };
    clip.width = Math.min(viewport.width, r.x + r.width) - clip.x;
    clip.height = Math.min(viewport.height, r.y + r.height) - clip.y;
    const a = await p.screenshot({
      clip,
      style: ".network-field{visibility:hidden!important}",
    });
    await p.waitForTimeout(700);
    const b = await p.screenshot({
      clip,
      style: ".network-field{visibility:hidden!important}",
    });
    await fs.writeFile(`${dir}/frame-before-${width}.png`, a);
    await fs.writeFile(`${dir}/frame-after-${width}.png`, b);
    const changed = change(a, b);
    console.log({
      width,
      changed,
      policy: await p.locator("html").getAttribute("data-motion"),
    });
    assert.ok(changed > 0.001, "Animation resumes after restoration");
    await p.screenshot({ path: `${dir}/restored-${width}.png` });
    checks.push({
      width,
      realContextLossRestorationCycles: 2,
      noSimultaneousFallbackAndCanvas: true,
      recoveredMotionChangedPixels: changed,
    });
    await p.close();
  }
  const fail = await browser.newPage();
  await fail.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === "webgl2") return null;
      return original.call(this, type, ...args);
    };
  });
  await fail.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
  await fail.locator(".hero-object [data-renderer=svg]").waitFor();
  await fail
    .locator(".hero-object svg path")
    .first()
    .waitFor({ state: "attached" });
  assert.equal(await fail.locator(".hero-object canvas").count(), 0);
  assert.equal(await fail.locator(".hero-object svg").isVisible(), true);
  await fail.close();
  assert.deepEqual(errors, []);
  await fs.writeFile(
    `${dir}/results.json`,
    JSON.stringify(
      { checks, unsupportedWebglFallbackOnly: true, errors },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify(
      { checks, unsupportedWebglFallbackOnly: true, errors },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
