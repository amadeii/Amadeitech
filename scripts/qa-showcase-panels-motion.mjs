import { chromium } from "file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const results = [];
try {
  for (const width of [393, 1440]) {
    for (const url of [
      "http://127.0.0.1:5173/",
      "http://127.0.0.1:5173/?motion=reduce",
      "http://127.0.0.1:4173/?motion=full",
    ]) {
      const p = await browser.newPage({
        viewport: { width, height: 1000 },
        isMobile: width < 768,
        hasTouch: width < 768,
        reducedMotion: "reduce",
      });
      await p.goto(url, { waitUntil: "networkidle" });
      const el = p.locator("#project-wandyfitt");
      await el.evaluate((e) =>
        e.scrollIntoView({ block: "start", behavior: "instant" }),
      );
      await p.waitForTimeout(1400);
      const localFull = url === "http://127.0.0.1:5173/";
      assert.equal(
        await p.locator("html").getAttribute("data-motion"),
        localFull ? "full" : "reduce",
      );
      const duration = await el
        .locator(".showcase-panel-layer")
        .evaluate((e) => getComputedStyle(e).transitionDuration);
      assert.equal(duration, localFull ? "0.28s, 0.28s" : "0s");
      await el.evaluate((e) => {
        window.__frames = [];
        const d = e.querySelector(".showcase-depth");
        let n = 0;
        function frame() {
          window.__frames.push({
            t: performance.now(),
            height: d.getBoundingClientRect().height,
            opacity: +getComputedStyle(e.querySelector(".showcase-panel-layer"))
              .opacity,
          });
          if (n++ < 50) requestAnimationFrame(frame);
        }
        frame();
      });
      await el
        .getByRole("button", { name: "Painel de Comando", exact: true })
        .click();
      await p.waitForTimeout(1000);
      const frames = await p.evaluate(() => window.__frames);
      const heights = frames.map((f) => f.height);
      if (localFull && width < 768)
        assert.ok(
          new Set(heights.map((h) => Math.round(h))).size > 8,
          "height changes continuously through intermediate frames",
        );
      const stage = el.locator(".showcase-panel-stage");
      await stage.focus();
      await stage.press("ArrowRight");
      assert.equal(
        await el.locator(".showcase-scene-copy > span").innerText(),
        "02 / 03",
      );
      if (new URL(url).port === "4173") {
        await p.emulateMedia({ reducedMotion: "no-preference" });
        await p.waitForFunction(
          () => document.documentElement.dataset.motion === "full",
        );
        assert.equal(
          await p.locator("html").getAttribute("data-motion"),
          "full",
        );
        assert.equal(
          await el
            .locator(".showcase-panel-layer")
            .evaluate((e) => getComputedStyle(e).transitionDuration),
          "0.28s, 0.28s",
        );
        await p.emulateMedia({ reducedMotion: "reduce" });
        await p.waitForFunction(
          () => document.documentElement.dataset.motion === "reduce",
        );
        assert.equal(
          await p.locator("html").getAttribute("data-motion"),
          "reduce",
        );
        assert.equal(
          await el
            .locator(".showcase-panel-layer")
            .evaluate((e) => getComputedStyle(e).transitionDuration),
          "0s",
        );
      }
      results.push({ width, url, duration, frames });
      await p.close();
    }
  }
  // Actual native touch pan remains vertical scrolling in either view.
  const p = await browser.newPage({
    viewport: { width: 393, height: 900 },
    isMobile: true,
    hasTouch: true,
  });
  await p.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
  const el = p.locator("#project-wandyfitt");
  const scroll = [];
  for (const view of ["site", "panel"]) {
    await el
      .getByRole("button", {
        name: view === "site" ? "Site" : "Painel de Comando",
        exact: true,
      })
      .click();
    await p.waitForTimeout(500);
    const stage = el.locator(
      view === "site"
        ? ".showcase-entrance .showcase-screen-stage"
        : ".showcase-panel-stage",
    );
    await stage.evaluate((e) =>
      e.scrollIntoView({ block: "center", behavior: "instant" }),
    );
    await p.waitForTimeout(400);
    const b = await stage.boundingBox();
    const x = b.x + b.width / 2,
      y = Math.min(650, b.y + b.height * 0.65);
    const before = await p.evaluate(() => scrollY);
    const c = await p.context().newCDPSession(p);
    await c.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    for (let i = 1; i <= 10; i++) {
      await c.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x, y: y - i * 15 }],
      });
      await p.waitForTimeout(25);
    }
    await c.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await p.waitForTimeout(250);
    const delta = (await p.evaluate(() => scrollY)) - before;
    assert.ok(delta > 70);
    scroll.push({ view, delta });
    await c.detach();
  }
  await p.close();
  await fs.writeFile(
    ".taste-skill/panels/motion-and-scroll.json",
    JSON.stringify({ results, scroll }, null, 2),
  );
  console.log(
    JSON.stringify({
      motionCases: results.length,
      scroll,
      productionDynamic: true,
    }),
  );
} finally {
  await browser.close();
}
