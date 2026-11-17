import { chromium } from "file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";
const dir = ".taste-skill/mobile-pro";
const phase = process.argv.includes("--after") ? "after" : "before";
await fs.mkdir(`${dir}/${phase}`, { recursive: true });
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
try {
  for (const width of [393, 1440, 1920]) {
    const page = await browser.newPage({
      viewport: { width, height: width < 768 ? 852 : 1080 },
      reducedMotion: "reduce",
    });
    await page.goto("http://127.0.0.1:5173/?motion=reduce", {
      waitUntil: "networkidle",
    });
    await page.evaluate(() => document.fonts.ready);
    const geometry = {};
    for (const id of ["wandyfitt", "ares", "beaute", "alanna"]) {
      const el = page.locator(`#project-${id} .showcase`);
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
      await el.screenshot({ path: `${dir}/${phase}/${id}-${width}.png` });
      geometry[id] = await el.evaluate((e) =>
        [
          ...e.querySelectorAll(
            ".showcase-depth,.showcase-camera,.showcase-screen-stage,.showcase-navigation",
          ),
        ].map((n) => {
          const r = n.getBoundingClientRect(),
            s = getComputedStyle(n);
          return {
            class: n.className,
            width: r.width,
            height: r.height,
            x: r.x,
            transform: s.transform,
            borderRadius: s.borderRadius,
          };
        }),
      );
    }
    await fs.writeFile(
      `${dir}/${phase}/geometry-${width}.json`,
      JSON.stringify(geometry, null, 2),
    );
    await page.close();
  }
  const page = await browser.newPage({
    viewport: { width: 393, height: 852 },
    reducedMotion: "reduce",
  });
  await page.addInitScript(() => {
    window.reveals = [];
    const original = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      if (
        this.matches(
          ".showcase-entrance,.cinema-glyph,.cinema-line-body,.portrait-image",
        )
      ) {
        const r = this.getBoundingClientRect();
        window.reveals.push({
          class: this.className,
          project: this.closest("[data-project]")?.getAttribute("data-project"),
          top: r.top,
          visibleHeight: Math.min(innerHeight, r.bottom) - Math.max(0, r.top),
          opacity: getComputedStyle(this).opacity,
          prepared: !!this.closest('[data-mobile-entry="pending"]'),
          time: performance.now(),
        });
      }
      return original.apply(this, args);
    };
  });
  await page.goto("http://127.0.0.1:5173/?motion=full", {
    waitUntil: "networkidle",
  });
  const y = await page
    .locator("#project-wandyfitt .showcase")
    .evaluate((e) => e.getBoundingClientRect().top + scrollY);
  await page.evaluate((y) => scrollTo(0, y - innerHeight - 30), y);
  await page.waitForTimeout(200);
  const frames = [];
  for (let i = 0; i < 22; i++) {
    await page.evaluate(() => scrollBy(0, 10));
    await page.waitForTimeout(70);
    frames.push(
      await page
        .locator("#project-wandyfitt .showcase-entrance")
        .evaluate((e) => {
          const r = e.getBoundingClientRect();
          return {
            top: r.top,
            visible: Math.min(innerHeight, r.bottom) - Math.max(0, r.top),
            opacity: getComputedStyle(e).opacity,
            parentOpacity: getComputedStyle(e.closest(".showcase")).opacity,
            animations: e.getAnimations().length,
          };
        }),
    );
  }
  await fs.writeFile(
    `${dir}/${phase}/entrances.json`,
    JSON.stringify(
      { frames, events: await page.evaluate(() => window.reveals) },
      null,
      2,
    ),
  );
  console.log(phase, frames.filter((f) => f.visible > 0).slice(0, 12));
  await page.close();
} finally {
  await browser.close();
}
