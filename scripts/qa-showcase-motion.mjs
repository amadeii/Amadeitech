import { chromium } from "file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const b = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const out = ".taste-skill/premium";
const checks = [],
  errors = [];
const jump = async (p, selector) => {
  await p
    .locator(selector)
    .evaluate((e) =>
      scrollTo({
        top: e.getBoundingClientRect().top + scrollY - innerHeight * 0.15,
        behavior: "instant",
      }),
    );
  await p.waitForTimeout(100);
};
const open = async (url, width, preference) => {
  const p = await b.newPage({
    viewport: { width, height: 1000 },
    reducedMotion: preference,
  });
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto(url, { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  return p;
};
try {
  for (const width of [1440, 390]) {
    const p = await open("http://127.0.0.1:5173/", width, "reduce");
    assert.equal(await p.locator("html").getAttribute("data-motion"), "full");
    for (const id of ["wandyfitt", "ares", "beaute", "alanna"]) {
      const selector = `#project-${id} .showcase`;
      await jump(p, selector);
      const entrance = p.locator(`${selector} .showcase-entrance`);
      await entrance.evaluate(async (e) => {
        await e.getAnimations()[0]?.ready;
        await new Promise((r) => requestAnimationFrame(r));
      });
      const sample1 = await entrance.evaluate((e) => ({
        t: getComputedStyle(e).transform,
        clip: getComputedStyle(e).clipPath,
        playing: e.getAnimations().length,
        start: e.getAnimations()[0]?.startTime,
      }));
      await p.waitForTimeout(150);
      const sample2 = await entrance.evaluate((e) => ({
        t: getComputedStyle(e).transform,
        clip: getComputedStyle(e).clipPath,
        start: e.getAnimations()[0]?.startTime,
      }));
      assert.ok(sample1.playing > 0, `${id} entry`);
      assert.notEqual(sample1.t, sample2.t, `${id} moves between frames`);
      await p.evaluate(() => scrollBy(0, 3));
      await p.waitForTimeout(60);
      assert.equal(
        await entrance.evaluate((e) => e.getAnimations()[0]?.startTime),
        sample2.start,
        "Small scroll does not replay",
      );
      await p.locator(`${selector} .showcase-screen-stage`).focus();
      await p.keyboard.press("ArrowRight");
      assert.equal(
        await p
          .locator(`${selector} .showcase-controls button`)
          .nth(1)
          .getAttribute("aria-pressed"),
        "true",
      );
      await jump(p, "#inicio");
      assert.equal(
        await p.locator(selector).getAttribute("data-visible"),
        "false",
      );
      await jump(p, selector);
      assert.ok(
        (await entrance.evaluate((e) => e.getAnimations().length)) > 0,
        "Replays after full exit",
      );
      assert.equal(
        await p
          .locator(`${selector} .showcase-controls button`)
          .nth(1)
          .getAttribute("aria-pressed"),
        "true",
        "Replay preserves exploration state",
      );
      await p.waitForTimeout(1400);
      if (width === 1440) {
        const stage = p.locator(`${selector} .showcase-screen-stage`),
          r = await stage.boundingBox();
        await p.mouse.move(r.x + r.width * 0.8, r.y + r.height * 0.3);
        await p.waitForTimeout(120);
        assert.notEqual(
          await p
            .locator(`${selector} .showcase-camera`)
            .evaluate((e) => getComputedStyle(e).transform),
          "none",
          "Cursor response",
        );
        await p.mouse.move(0, 0);
        await p.waitForTimeout(400);
      }
      await p.locator(`${selector} .showcase-controls button`).nth(2).click();
      await p.waitForTimeout(70);
      const a = await p
        .locator(`${selector} .showcase-screen.is-active`)
        .evaluate((e) => ({
          transform: getComputedStyle(e).transform,
          clip: getComputedStyle(e).clipPath,
          opacity: getComputedStyle(e).opacity,
        }));
      await p.waitForTimeout(160);
      const c = await p
        .locator(`${selector} .showcase-screen.is-active`)
        .evaluate((e) => ({
          transform: getComputedStyle(e).transform,
          clip: getComputedStyle(e).clipPath,
          opacity: getComputedStyle(e).opacity,
        }));
      assert.notDeepEqual(a, c, "Scene transition really changes frames");
      checks.push({
        mode: "local-full-under-native-reduce",
        width,
        id,
        entry: [sample1, sample2],
        sceneTransition: [a, c],
        replay: true,
        statePreserved: true,
      });
    }
    await jump(p, "#quem-cria");
    const first = await p
      .locator(".portrait-image")
      .evaluate((e) => getComputedStyle(e).clipPath);
    await p.waitForTimeout(250);
    assert.notEqual(
      await p
        .locator(".portrait-image")
        .evaluate((e) => getComputedStyle(e).clipPath),
      first,
      "Photo reveal moves",
    );
    const samples = await p.evaluate(async () => {
      const values = [];
      let last = performance.now();
      await new Promise((resolve) => {
        let i = 0;
        const tick = (now) => {
          values.push(now - last);
          last = now;
          scrollBy(0, i % 2 ? 12 : -8);
          if (++i < 80) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      });
      return values.slice(2).sort((a, b) => a - b);
    });
    checks.push({
      mode: "scroll-sampling",
      width,
      p95FrameMs: samples[Math.floor(samples.length * 0.95)],
      note: "Headless local observation, not a real-device benchmark",
    });
    await p.close();
    console.log(`Local motion/replay/gestures ${width}: OK`);
  }
  for (const reduce of [true, false]) {
    const p = await open(
      "http://127.0.0.1:4174/?motion=full",
      1440,
      reduce ? "reduce" : "no-preference",
    );
    assert.equal(
      await p.locator("html").getAttribute("data-motion"),
      reduce ? "reduce" : "full",
      "Production ignores demo parameters",
    );
    await jump(p, "#project-beaute .showcase");
    assert.equal(
      await p
        .locator("#project-beaute .showcase-entrance")
        .evaluate((e) => e.getAnimations().length > 0),
      !reduce,
    );
    await p.emulateMedia({
      reducedMotion: reduce ? "no-preference" : "reduce",
    });
    await p.waitForFunction(
      (expected) => document.documentElement.dataset.motion === expected,
      reduce ? "full" : "reduce",
    );
    assert.equal(
      await p.locator("html").getAttribute("data-motion"),
      reduce ? "full" : "reduce",
    );
    if (!reduce) {
      assert.equal(
        await p
          .locator("#project-beaute .showcase-entrance")
          .evaluate((e) => e.getAnimations().length),
        0,
      );
      assert.equal(
        await p
          .locator("#project-beaute .showcase-camera")
          .evaluate((e) => getComputedStyle(e).transform),
        "none",
      );
    }
    await jump(p, "#inicio");
    await jump(p, "#project-beaute .showcase");
    assert.equal(
      await p
        .locator("#project-beaute .showcase-entrance")
        .evaluate((e) => e.getAnimations().length > 0),
      reduce,
    );
    checks.push({
      mode: "production",
      nativeReduced: reduce,
      dynamicChange: true,
      queryIgnored: true,
    });
    await p.close();
  }
  // Explicit local alternatives remain available, independent of native full motion.
  for (const mode of ["reduce", "system"]) {
    const p = await open(
      `http://127.0.0.1:5173/?motion=${mode}`,
      390,
      "reduce",
    );
    assert.equal(await p.locator("html").getAttribute("data-motion"), "reduce");
    await jump(p, "#project-wandyfitt .showcase");
    assert.equal(
      await p
        .locator(".showcase-entrance")
        .first()
        .evaluate((e) => e.getAnimations().length),
      0,
    );
    await p.close();
  }
  const p = await open(
    "http://127.0.0.1:4174/?motion=reduce",
    390,
    "no-preference",
  );
  assert.equal(await p.locator("html").getAttribute("data-motion"), "full");
  await p.close();
  assert.deepEqual(errors, []);
  await fs.writeFile(
    `${out}/motion-checks.json`,
    JSON.stringify({ checks, errors }, null, 2),
  );
  console.log("Production native/dynamic reduce and local alternatives: OK");
} finally {
  await b.close();
}
