import { chromium } from "file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const dir = ".taste-skill/mobile-pro",
  checks = [],
  errors = [];
const jump = async (p, s, offset = 0.12) => {
  await p
    .locator(s)
    .evaluate(
      (e, o) =>
        scrollTo({
          top: e.getBoundingClientRect().top + scrollY - innerHeight * o,
          behavior: "instant",
        }),
      offset,
    );
  await p.waitForTimeout(90);
};
try {
  for (const width of [320, 375, 393, 430]) {
    const p = await browser.newPage({
      viewport: { width, height: 852 },
      hasTouch: true,
      isMobile: true,
      reducedMotion: "reduce",
    });
    p.on("pageerror", (e) => errors.push(e.message));
    await p.addInitScript(() => {
      window.entryLog = [];
      window.cls = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries())
          if (!e.hadRecentInput) window.cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
      const animate = Element.prototype.animate;
      Element.prototype.animate = function (...args) {
        if (
          this.matches(
            ".showcase-entrance,.cinema-glyph,.cinema-word,.cinema-line-body",
          )
        )
          window.entryLog.push({
            project:
              this.closest("[data-project]")?.getAttribute("data-project"),
            class: this.className,
            time: performance.now(),
          });
        return animate.apply(this, args);
      };
    });
    await p.goto("http://127.0.0.1:5173/?motion=full", {
      waitUntil: "networkidle",
    });
    for (const id of ["wandyfitt", "ares", "beaute", "alanna"]) {
      const selector = `#project-${id} .showcase`,
        entry = p.locator(`${selector} .showcase-entrance`);
      await jump(p, "#inicio");
      await p
        .locator(selector)
        .evaluate((e) =>
          scrollTo({
            top: e.getBoundingClientRect().top + scrollY - innerHeight - 15,
            behavior: "instant",
          }),
        );
      await p.waitForTimeout(60);
      assert.equal(
        await p.locator(selector).getAttribute("data-mobile-entry"),
        "pending",
        "entrance prepared before first visible pixel",
      );
      for (let step = 0; step < 4; step++) {
        await p.evaluate(() => scrollBy(0, 25));
        await p.waitForTimeout(40);
        const sample = await entry.evaluate((e) => ({
          playing: e.getAnimations().length,
          prepared: !!e.closest('[data-mobile-entry="pending"]'),
        }));
        assert.ok(
          sample.playing > 0 || sample.prepared,
          "never show final state before starting entrance",
        );
      }
      await jump(p, selector);
      const start = await entry.evaluate((e) => {
        window.qaEntranceAnimation = e.getAnimations()[0];
        return window.qaEntranceAnimation?.startTime;
      });
      assert.ok(typeof start === "number", `${width} ${id} real entry`);
      await p.setViewportSize({ width, height: 820 });
      await p.waitForTimeout(40);
      assert.notEqual(
        await p.evaluate(() => window.qaEntranceAnimation.playState),
        "idle",
        "height resize must not cancel entrance",
      );
      if (await entry.evaluate((e) => e.getAnimations().length))
        assert.equal(
          await entry.evaluate((e) => e.getAnimations()[0]?.startTime),
          start,
          "height resize preserves entrance",
        );
      await p.setViewportSize({ width, height: 852 });
      for (const delta of [2, -3, 4, -2]) {
        await p.evaluate((d) => scrollBy(0, d), delta);
        await p.waitForTimeout(30);
      }
      assert.notEqual(
        await p.evaluate(() => window.qaEntranceAnimation.playState),
        "idle",
        "scroll jitter must not cancel entrance",
      );
      if (await entry.evaluate((e) => e.getAnimations().length))
        assert.equal(
          await entry.evaluate((e) => e.getAnimations()[0]?.startTime),
          start,
          "scroll jitter preserves entrance",
        );
      await p.waitForTimeout(1350);
      const count = await p.evaluate(
        (id) => window.entryLog.filter((e) => e.project === id).length,
        id,
      );
      await p.evaluate(() =>
        document.dispatchEvent(new Event("visibilitychange")),
      );
      await p.waitForTimeout(80);
      assert.equal(
        await p.evaluate(
          (id) => window.entryLog.filter((e) => e.project === id).length,
          id,
        ),
        count,
        "tab visibility event must not replay visible mobile text",
      );
      await p.locator(`${selector} .showcase-controls button`).nth(1).tap();
      await p.waitForTimeout(1100);
      assert.equal(
        await p
          .locator(`${selector} .showcase-controls button`)
          .nth(1)
          .getAttribute("aria-pressed"),
        "true",
      );
      await jump(p, "#inicio");
      await jump(p, selector);
      assert.ok(
        (await entry.evaluate((e) => e.getAnimations().length)) > 0,
        "replay after complete exit",
      );
      assert.equal(
        await p
          .locator(`${selector} .showcase-controls button`)
          .nth(1)
          .getAttribute("aria-pressed"),
        "true",
        "replay preserves selected scene",
      );
      await p.waitForTimeout(1300);
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      checks.push({
        width,
        id,
        slowEntryNoFlash: true,
        jitter: true,
        heightResize: true,
        visibilityNoReplay: true,
        tap: true,
        replay: true,
        selectionPreserved: true,
      });
    }
    // Repeated rapid forward/reverse traversal: never lose content or leave
    // pending content in the viewport after its observer has run.
    for (const ids of [
      ["wandyfitt", "ares", "beaute", "alanna"],
      ["alanna", "beaute", "ares", "wandyfitt"],
    ]) {
      for (const id of ids) {
        await jump(p, `#project-${id} .showcase`);
        assert.equal(
          await p
            .locator(`#project-${id} .showcase`)
            .getAttribute("data-mobile-entry"),
          null,
        );
      }
    }
    // Reload from actual scroll positions. Direct fragment resolution before
    // this client-rendered app mounts is not browser scroll restoration.
    for (const id of ["wandyfitt", "alanna"]) {
      await jump(p, `#project-${id}`);
      await p.waitForTimeout(1300);
      await p.reload({ waitUntil: "networkidle" });
      await p.waitForTimeout(1500);
      const r = await p.locator(`#project-${id}`).boundingBox();
      assert.ok(r.y < 852 && r.y + r.height > 0, "restored section visible");
      assert.equal(
        await p
          .locator(`#project-${id} .cinematic-text`)
          .getAttribute("data-mobile-entry"),
        null,
      );
    }
    checks.push({
      width,
      repeatedTraversal: true,
      scrollPositionReload: true,
      cls: await p.evaluate(() => window.cls),
    });
    console.log(
      `Full motion ${width}: entradas, resize, jitter, replay, toque e reload OK`,
    );
    await p.close();
  }
  // Production is served from the freshly built dist, not the Vite dev graph.
  for (const native of ["reduce", "no-preference"]) {
    const p = await browser.newPage({
      viewport: { width: 393, height: 852 },
      reducedMotion: native,
    });
    await p.goto("http://127.0.0.1:4174/?motion=full", {
      waitUntil: "networkidle",
    });
    assert.equal(
      await p.locator("html").getAttribute("data-motion"),
      native === "reduce" ? "reduce" : "full",
    );
    await jump(p, "#project-wandyfitt .showcase");
    assert.equal(
      await p
        .locator(".showcase-entrance")
        .first()
        .evaluate((e) => e.getAnimations().length > 0),
      native !== "reduce",
    );
    await p.emulateMedia({
      reducedMotion: native === "reduce" ? "no-preference" : "reduce",
    });
    await p.waitForTimeout(100);
    if (native !== "reduce")
      assert.equal(
        await p
          .locator(".showcase-entrance")
          .first()
          .evaluate((e) => e.getAnimations().length),
        0,
      );
    await jump(p, "#inicio");
    await jump(p, "#project-wandyfitt .showcase");
    assert.equal(
      await p
        .locator(".showcase-entrance")
        .first()
        .evaluate((e) => e.getAnimations().length > 0),
      native === "reduce",
    );
    checks.push({
      production: true,
      native,
      dynamicChange: true,
      queryIgnored: true,
    });
    await p.close();
  }
  const p = await browser.newPage({
    viewport: { width: 393, height: 852 },
    reducedMotion: "reduce",
  });
  await p.goto("http://127.0.0.1:5173/?motion=full", {
    waitUntil: "networkidle",
  });
  await jump(p, "#project-wandyfitt .showcase");
  const cdp = await p.context().newCDPSession(p);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const frames = await p.evaluate(async () => {
    const samples = [];
    let last = performance.now();
    await new Promise((resolve) => {
      let i = 0;
      const tick = (t) => {
        samples.push(t - last);
        last = t;
        scrollBy(0, i % 2 ? 8 : -6);
        if (++i < 120) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    return samples.slice(3).sort((a, b) => a - b);
  });
  checks.push({
    performance: "Chrome emulation, CPU 4x; not physical iOS",
    p95FrameMs: frames[Math.floor(frames.length * 0.95)],
    maxFrameMs: Math.max(...frames),
  });
  await p.close();
  assert.deepEqual(errors, []);
  await fs.writeFile(
    `${dir}/motion-checks.json`,
    JSON.stringify({ checks, errors }, null, 2),
  );
  console.log(
    "Production mobile/native/dynamic reduce OK; performance",
    checks.at(-1),
  );
} finally {
  await browser.close();
}
