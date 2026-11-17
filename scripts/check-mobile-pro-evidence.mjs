import { chromium } from "file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import sharp from "file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs";
const dir = ".taste-skill/mobile-pro",
  ids = ["wandyfitt", "ares", "beaute", "alanna"],
  checks = [];
for (const width of [1440, 1920]) {
  const before = await fs.readFile(
    `${dir}/before/geometry-${width}.json`,
    "utf8",
  );
  const after = await fs.readFile(
    `${dir}/after/geometry-${width}.json`,
    "utf8",
  );
  assert.equal(before, after);
  for (const id of ids) {
    const a = await fs.readFile(`${dir}/before/${id}-${width}.png`),
      b = await fs.readFile(`${dir}/after/${id}-${width}.png`);
    const x = await sharp(a).raw().toBuffer(),
      y = await sharp(b).raw().toBuffer();
    assert.equal(x.length, y.length);
    let maxChannelDelta = 0,
      changedChannels = 0;
    for (let i = 0; i < x.length; i++) {
      maxChannelDelta = Math.max(maxChannelDelta, Math.abs(x[i] - y[i]));
      if (x[i] !== y[i]) changedChannels++;
    }
    assert.ok(maxChannelDelta <= 1, `${id} desktop visual regression`);
    checks.push({
      id,
      width,
      geometryIdentical: true,
      pngIdentical: a.equals(b),
      maxChannelDelta,
      changedChannels,
      sha256: createHash("sha256").update(b).digest("hex"),
    });
  }
}
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
try {
  const p = await browser.newPage({
    viewport: { width: 393, height: 852 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  await p.goto("http://127.0.0.1:5173/?motion=full", {
    waitUntil: "networkidle",
  });
  const cdp = await p.context().newCDPSession(p);
  for (const id of ids) {
    await p
      .locator(`#project-${id} .showcase`)
      .evaluate((e) =>
        scrollTo({
          top: e.getBoundingClientRect().top + scrollY - 100,
          behavior: "instant",
        }),
      );
    await p.waitForTimeout(1350);
    const box = await p
      .locator(`#project-${id} .showcase-screen-stage`)
      .boundingBox();
    for (const [from, to, expected] of [
      [0.75, 0.25, 1],
      [0.25, 0.75, 0],
    ]) {
      const y = box.y + box.height * 0.5,
        x = box.x + box.width * from;
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y }],
      });
      for (let step = 1; step <= 8; step++)
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: x + (box.width * (to - from) * step) / 8, y }],
        });
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
      assert.equal(
        await p
          .locator(`#project-${id} .showcase-controls button`)
          .nth(expected)
          .getAttribute("aria-pressed"),
        "true",
      );
      await p.waitForTimeout(120);
    }
    await p.waitForTimeout(1100);
    await p.screenshot({ path: `${dir}/after/viewport-${id}-393.png` });
    checks.push({
      id,
      width: 393,
      fullMotionTouchSwipe: true,
      reverseSwipe: true,
      viewportHeight: 852,
    });
  }
  const response = await p.goto(
    "http://127.0.0.1:5173/.taste-skill/mobile-pro/review.html",
    { waitUntil: "networkidle" },
  );
  assert.equal(response.status(), 200);
  await p.close();
} finally {
  await browser.close();
}
await fs.writeFile(
  `${dir}/evidence-checks.json`,
  JSON.stringify(checks, null, 2),
);
console.log(
  "8 desktop geometries identical, maximum pixel difference 1/255; four full-motion touch/reverse swipes and actual 393×852 captures OK",
);
