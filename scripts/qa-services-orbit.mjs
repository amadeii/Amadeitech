import { chromium } from "file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
const dir = ".taste-skill/fusion";
await fs.mkdir(dir, { recursive: true });
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const results = [],
  errors = [];
const digest = (data) => createHash("sha256").update(data).digest("hex");
const phase = (p) =>
  p.locator(".services-scene").getAttribute("data-phase").then(Number);
const transforms = (p) =>
  p
    .locator(".orbit-service")
    .evaluateAll((es) => es.map((e) => getComputedStyle(e).transform));
const globe = (p) =>
  p.locator(".orbital-globe canvas").evaluate((e) => e.toDataURL());
async function open(
  width,
  url = "http://127.0.0.1:4173/",
  reducedMotion = "no-preference",
) {
  const context = await browser.newContext({
    viewport: { width, height: width < 1000 ? 900 : 960 },
    reducedMotion,
    hasTouch: width < 1000,
  });
  const p = await context.newPage();
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await p.goto(url, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await p
    .locator("#experiencia")
    .evaluate((e) =>
      scrollTo({
        top: scrollY + e.getBoundingClientRect().top,
        behavior: "instant",
      }),
    );
  return { p, context };
}
try {
  for (const width of [320, 375, 393, 430, 768, 1024, 1440, 1920]) {
    const { p, context } = await open(width);
    await p.waitForTimeout(3000);
    const structure = await p
      .locator("#experiencia")
      .evaluate((e) => ({
        height: e.offsetHeight,
        overflow: document.documentElement.scrollWidth - innerWidth,
        next: e.nextElementSibling.id,
        photos: e.querySelectorAll("img[src*=portrait]").length,
        buttons: e.querySelectorAll("button").length,
        services: e.querySelectorAll(".orbit-service").length,
        globe: e.querySelectorAll(".orbital-globe canvas").length,
      }));
    assert.equal(structure.overflow, 0);
    assert.equal(structure.next, "quem-cria");
    assert.equal(structure.photos, 0);
    assert.equal(structure.buttons, 0);
    assert.equal(structure.services, 3);
    assert.equal(structure.globe, 1);
    assert.equal(await p.locator("#quem-cria").count(), 1);
    await p
      .locator("#experiencia")
      .screenshot({ path: `${dir}/final-${width}.png` });
    if (width < 1000) {
      const bounds = await p.locator(".orbit-service").evaluateAll((es) =>
        es.map((e) => {
          const r = e.getBoundingClientRect();
          return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
        }),
      );
      bounds.forEach((r, i) => {
        assert.ok(r.left >= 0 && r.right <= width);
        if (i && width >= 768)
          assert.ok(
            r.top > bounds[i - 1].bottom + 2,
            "tablet cards must remain readable",
          );
      });
      for (let i = 0; i < 3; i++) {
        const card = p.locator(".orbit-service").nth(i);
        if (width < 768) {
          await card.focus();
          await p.waitForTimeout(150);
        }
        await card.scrollIntoViewIfNeeded();
        let r = await card.boundingBox();
        await p.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2);
        if (width < 768) {
          await p.waitForTimeout(250);
          assert.equal(await card.getAttribute("data-selected"), "true");
          r = await card.boundingBox();
          await p.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2);
        }
        await p.waitForTimeout(1500);
        assert.equal(new URL(p.url()).hash, "#contato");
        await p
          .locator("#experiencia")
          .evaluate((e) =>
            scrollTo({
              top: scrollY + e.getBoundingClientRect().top,
              behavior: "instant",
            }),
          );
        await p.waitForTimeout(250);
      }
    }
    results.push({ width, ...structure, touch: width < 1000 });
    await context.close();
  }
  for (const [url, effective] of [
    ["http://127.0.0.1:5174/", "full"],
    ["http://127.0.0.1:5174/?motion=reduce", "reduce"],
    ["http://127.0.0.1:5174/?motion=system", "reduce"],
    ["http://127.0.0.1:4173/?motion=full", "reduce"],
  ]) {
    const { p, context } = await open(393, url, "reduce");
    await p.waitForTimeout(3000);
    assert.equal(
      await p.locator("html").getAttribute("data-motion"),
      effective,
    );
    const a = await transforms(p),
      ga = await globe(p);
    await p.waitForTimeout(500);
    assert.equal(
      JSON.stringify(a) === JSON.stringify(await transforms(p)),
      effective === "reduce",
    );
    assert.equal(ga === (await globe(p)), effective === "reduce");
    if (effective === "reduce")
      await p
        .locator("#experiencia")
        .screenshot({ path: `${dir}/reduced-393.png` });
    results.push({ url, effective });
    await context.close();
  }
  let { p, context } = await open(1440);
  await p.waitForTimeout(3000);
  const first = p.locator(".orbit-service").first();
  await first.focus();
  for (let i = 0; i < 3; i++) {
    const card = p.locator(".orbit-service").nth(i);
    assert.equal(
      await card.evaluate((e) => document.activeElement === e),
      true,
    );
    await p.waitForTimeout(100);
    const a = await phase(p),
      ga = await globe(p);
    await p.waitForTimeout(400);
    assert.equal(await phase(p), a);
    assert.notEqual(
      await globe(p),
      ga,
      "globe must rotate independently of focused orbit",
    );
    if (i < 2) await p.keyboard.press("Tab");
  }
  await p.keyboard.press("Enter");
  await p.waitForFunction(
    () => {
      const top = document.querySelector("#contato").getBoundingClientRect().top;
      return top >= -40 && top < 180;
    },
    {},
    { timeout: 6000 },
  );
  assert.equal(new URL(p.url()).hash, "#contato");
  await context.close();
  ({ p, context } = await open(1440));
  await p.waitForTimeout(3000);
  // Hover a visible front card using actual pointer coordinates, without waiting for a moving target to stop.
  const front = await p.locator(".orbit-service").evaluateAll((es) =>
    es.findIndex((e) => {
      const r = e.getBoundingClientRect();
      return (
        +e.dataset.depth > 0 &&
        e.contains(
          document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
        )
      );
    }),
  );
  assert.ok(front >= 0, "a front card must be hittable");
  const target = p.locator(".orbit-service").nth(front);
  const r = await target.boundingBox();
  await p.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
  await p.waitForFunction(
    () =>
      Number(document.querySelector(".services-scene").dataset.speed) < 0.15,
    {},
    { timeout: 3500 },
  );
  await p.mouse.move(5, 5);
  await p.waitForTimeout(1800);
  assert.ok(
    Number(await p.locator(".services-scene").getAttribute("data-speed")) >
      0.95,
  );
  // Native browser recording of real rendered frames; no external encoder is needed.
  const recorder = await browser.newPage();
  await recorder.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 1200;
    c.height = 800;
    window.ctx = c.getContext("2d");
    window.parts = [];
    window.rec = new MediaRecorder(c.captureStream(12), {
      mimeType: "video/webm;codecs=vp9",
      videoBitsPerSecond: 2000000,
    });
    window.rec.ondataavailable = (e) => window.parts.push(e.data);
    window.rec.start();
  });
  let recording = true;
  const capture = (async () => {
    while (recording) {
      const jpg = await p.screenshot({ type: "jpeg", quality: 83 });
      await recorder.evaluate(async (data) => {
        const im = new Image();
        im.src = "data:image/jpeg;base64," + data;
        await im.decode();
        window.ctx.drawImage(im, 0, 0, 1200, 800);
      }, jpg.toString("base64"));
      await p.waitForTimeout(100);
    }
  })();
  const samples = [];
  let travelled = 0;
  let previous = await phase(p);
  const started = Date.now();
  const seen = Array.from({ length: 3 }, () => ({
    front: false,
    back: false,
    occluded: false,
  }));
  while (travelled < Math.PI * 6 + 0.05) {
    await p.waitForTimeout(1500);
    const current = await phase(p);
    travelled += (current - previous + Math.PI * 2) % (Math.PI * 2);
    previous = current;
    const cards = await p.locator(".orbit-service").evaluateAll((es) =>
      es.map((e) => {
        const r = e.getBoundingClientRect();
        const top = document.elementFromPoint(
          r.x + r.width / 2,
          r.y + r.height / 2,
        );
        return {
          depth: +e.dataset.depth,
          left: r.left,
          right: r.right,
          hidden: !e.contains(top),
          transform: getComputedStyle(e).transform,
        };
      }),
    );
    cards.forEach((card, index) => {
      assert.ok(card.left >= 0 && card.right <= 1440, "orbital card clipped");
      if (card.depth > 0) seen[index].front = true;
      else {
        seen[index].back = true;
        if (card.hidden) seen[index].occluded = true;
      }
    });
    samples.push({ elapsed: Date.now() - started, phase: current, cards });
    if (samples.length % 8 === 0)
      await p
        .locator("#experiencia")
        .screenshot({ path: `${dir}/cycle-${samples.length}.png` });
    if (Date.now() - started > 180000)
      throw new Error(
        "Three real cycles did not complete within the time budget",
      );
  }
  recording = false;
  await capture;
  const bytes = await recorder.evaluate(
    () =>
      new Promise((resolve) => {
        window.rec.onstop = async () =>
          resolve(
            Array.from(
              new Uint8Array(
                await new Blob(window.parts, {
                  type: "video/webm",
                }).arrayBuffer(),
              ),
            ),
          );
        window.rec.stop();
      }),
  );
  await fs.writeFile(`${dir}/orbital-fusion.webm`, Buffer.from(bytes));
  await recorder.close();
  seen.forEach((item) =>
    assert.deepEqual(item, { front: true, back: true, occluded: true }),
  );
  // Rearm only on full exit; slow and reversed in-viewport movement cannot restart entrance animations.
  const active = await p
    .locator(".services-scene")
    .getAttribute("data-orbit-entry");
  assert.equal(active, "active");
  for (const delta of [90, -35, 40, -95]) {
    await p.mouse.wheel(0, delta);
    await p.waitForTimeout(250);
    assert.equal(
      await p.locator(".services-scene").getAttribute("data-orbit-entry"),
      "active",
    );
  }
  await p
    .locator("#experiencia")
    .evaluate((e) =>
      scrollTo({
        top: scrollY + e.getBoundingClientRect().bottom + 200,
        behavior: "instant",
      }),
    );
  await p.waitForTimeout(250);
  assert.equal(
    await p.locator(".services-scene").getAttribute("data-orbit-entry"),
    "pending",
  );
  const off = await phase(p);
  await p.waitForTimeout(400);
  assert.equal(await phase(p), off);
  await p
    .locator("#experiencia")
    .evaluate((e) =>
      scrollTo({
        top: scrollY + e.getBoundingClientRect().top,
        behavior: "instant",
      }),
    );
  await p.waitForTimeout(100);
  assert.equal(
    await p.locator(".services-scene").getAttribute("data-orbit-entry"),
    "active",
  );
  const early = await p
    .locator(".orbit-service")
    .evaluateAll((es) => es.map((e) => +getComputedStyle(e).opacity));
  early.forEach((opacity) => assert.ok(opacity < 0.05, "entry flash"));
  await p.waitForTimeout(3000);
  await p.locator("#experiencia").screenshot({ path: `${dir}/reentry.png` });
  const wallA = await p
    .locator(".text-reveal-wall")
    .evaluate((e) => e.toDataURL());
  await p.waitForTimeout(4000);
  assert.notEqual(
    await p.locator(".text-reveal-wall").evaluate((e) => e.toDataURL()),
    wallA,
    "original code wall must remain animated",
  );
  await p.emulateMedia({ reducedMotion: "reduce" });
  await p.waitForTimeout(500);
  const still = await transforms(p),
    stillGlobe = await globe(p);
  await p.waitForTimeout(500);
  assert.deepEqual(await transforms(p), still);
  assert.equal(await globe(p), stillGlobe);
  await p
    .locator("#experiencia")
    .screenshot({ path: `${dir}/reduced-1440.png` });
  await p.emulateMedia({ reducedMotion: "no-preference" });
  await p.waitForTimeout(600);
  assert.notDeepEqual(await transforms(p), still);
  await p.reload({ waitUntil: "networkidle" });
  await p
    .locator("#experiencia")
    .evaluate((e) =>
      scrollTo({
        top: scrollY + e.getBoundingClientRect().top,
        behavior: "instant",
      }),
    );
  await p.waitForTimeout(3000);
  assert.equal(await p.locator(".orbital-globe canvas").count(), 1);
  assert.equal(await p.locator(".services-pause").count(), 0);
  await p.locator("#quem-cria").scrollIntoViewIfNeeded();
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `${dir}/biography-transition.png` });
  results.push({
    cycles: travelled / (Math.PI * 2),
    realTimeMs: Date.now() - started,
    seen,
    hover: true,
    keyboard: true,
    replay: true,
    dynamicReduced: true,
    wallPreserved: true,
    samples,
  });
  assert.deepEqual(errors, []);
  await fs.writeFile(
    `${dir}/qa-results.json`,
    JSON.stringify({ results, errors }, null, 2),
  );
  console.log(
    JSON.stringify({
      checks: results.length,
      cycles: travelled / (Math.PI * 2),
      errors,
    }),
  );
  await context.close();
} finally {
  await browser.close();
}
