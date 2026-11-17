import { chromium } from "file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
const base = process.env.QA_BASE || "http://127.0.0.1:5173";
const dir = process.env.QA_OUTPUT || ".taste-skill/premium";
const widths = (process.env.QA_WIDTHS || "320,375,390,430,768,1024,1440,1920")
  .split(",")
  .map(Number);
await fs.mkdir(`${dir}/after`, { recursive: true });
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const errors = [],
  checks = [];
const ids = ["wandyfitt", "ares", "beaute", "alanna"];
const urls = [
  "https://wandyfitt.com.br/",
  "https://aresstudiopilates.com.br/",
  "https://29beaute.com.br/",
  "https://alannafotopet.com.br/",
];
try {
  for (const width of widths) {
    const page = await browser.newPage({
      viewport: { width, height: Number(process.env.QA_HEIGHT) || (width < 768 ? 1000 : 1100) },
      isMobile: width < 768,
      reducedMotion: "reduce",
      hasTouch: width < 768,
    });
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("response", (r) => {
      if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
    });
    await page.goto(`${base}/?motion=reduce`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(
      await page
        .locator(
          ".project-view-switch,.project-panel-dialog,.project-panel-note",
        )
        .count(),
      0,
    );
    assert.equal(
      await page.locator("#sistemas").evaluate((e) => e.nextElementSibling?.id),
      "quem-cria",
    );
    assert.equal(
      await page.locator('#main-navigation a[href="#sobre"]').count(),
      0,
    );
    for (const [i, id] of ids.entries()) {
      const story = page.locator(`#project-${id}`),
        stage = story.locator(".showcase-screen-stage");
      await story.scrollIntoViewIfNeeded();
      await stage.scrollIntoViewIfNeeded();
      await stage
        .locator("img")
        .first()
        .evaluate((i) => i.decode());
      const metrics = await stage.evaluate((e, width) => {
        const r = e.getBoundingClientRect();
        const img = e.querySelector(".is-active img");
        return {
          width,
          centerError: Math.abs(r.x + r.width / 2 - innerWidth / 2),
          left: r.left,
          right: r.right,
          currentSrc: img.currentSrc,
          ratio: r.width / r.height,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      }, width);
      assert.equal(metrics.overflow, false, `${id} overflow at ${width}`);
      if (width < 768) {
        assert.ok(
          metrics.centerError < 1,
          `${id} offcenter ${JSON.stringify(metrics)}`,
        );
        assert.ok(metrics.currentSrc.endsWith("-mobile.webp"));
        assert.ok(Math.abs(metrics.ratio - 278 / 604) < 0.002);
      } else assert.ok(metrics.currentSrc.endsWith("-desktop.webp"));
      assert.equal(
        await story.locator(".project-link").getAttribute("href"),
        urls[i],
      );
      await stage.focus();
      await page.keyboard.press("ArrowRight");
      assert.equal(
        await story
          .locator(".showcase-controls button")
          .nth(1)
          .getAttribute("aria-pressed"),
        "true",
      );
      await page.keyboard.press("End");
      assert.equal(
        await story
          .locator(".showcase-controls button")
          .nth(2)
          .getAttribute("aria-pressed"),
        "true",
      );
      await page.keyboard.press("Home");
      const box = await stage.boundingBox();
      const x = box.x + box.width * 0.75,
        y = box.y + box.height * 0.5;
      if (width >= 768) {
        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.mouse.move(x - 120, y, { steps: 8 });
        await page.mouse.up();
      } else {
        const cdp = await page.context().newCDPSession(page);
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [{ x, y }],
        });
        for (let step = 1; step <= 6; step++)
          await cdp.send("Input.dispatchTouchEvent", {
            type: "touchMove",
            touchPoints: [{ x: x - step * 18, y }],
          });
        await cdp.send("Input.dispatchTouchEvent", {
          type: "touchEnd",
          touchPoints: [],
        });
        await cdp.detach();
      }
      assert.equal(
        await story
          .locator(".showcase-controls button")
          .nth(1)
          .getAttribute("aria-pressed"),
        "true",
        `gesture ${id} ${width}`,
      );
      assert.equal(
        page.context().pages().length,
        1,
        "Drag must never open an external site",
      );
      await story.locator(".showcase-controls button").nth(2).click();
      assert.equal(
        await story
          .locator(".showcase-controls button")
          .nth(2)
          .getAttribute("aria-pressed"),
        "true",
      );
      await story.locator(".showcase-controls button").first().click();
      await page.waitForTimeout(180);
      if ([320, 375, 390, 393, 430, 768, 1440, 1920].includes(width))
        await story.screenshot({ path: `${dir}/after/${id}-${width}.png` });
      if (width === 390 || width === 393) {
        await stage.scrollIntoViewIfNeeded();
        const verticalBox = await stage.boundingBox();
        const verticalX = verticalBox.x + verticalBox.width / 2;
        const verticalY = verticalBox.y + verticalBox.height / 2;
        const beforeScroll = await page.evaluate(() => scrollY);
        const touch = await page.context().newCDPSession(page);
        await touch.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [{ x: verticalX, y: verticalY }],
        });
        for (let step = 1; step <= 8; step++)
          await touch.send("Input.dispatchTouchEvent", {
            type: "touchMove",
            touchPoints: [{ x: verticalX, y: verticalY - step * 16 }],
          });
        await touch.send("Input.dispatchTouchEvent", {
          type: "touchEnd",
          touchPoints: [],
        });
        await page.waitForTimeout(160);
        assert.ok(
          (await page.evaluate(() => scrollY)) > beforeScroll + 20,
          "Vertical touch remains native page scroll",
        );
        assert.equal(
          await story
            .locator(".showcase-controls button")
            .first()
            .getAttribute("aria-pressed"),
          "true",
          "Vertical scroll does not change scenes",
        );
        await touch.detach();
      }
      checks.push({
        id,
        ...metrics,
        keyboard: true,
        gesture: true,
        controls: true,
      });
    }
    const orion = page.locator("#sistemas");
    await orion.scrollIntoViewIfNeeded();
    assert.equal(await orion.locator(".system-status").innerText(), "EM BREVE");
    await orion.locator(".orion-capture-trigger").click();
    assert.ok(
      await orion.locator(".orion-capture-dialog").evaluate((e) => e.open),
    );
    await page.keyboard.press("Escape");
    assert.equal(
      await orion.locator(".orion-capture-dialog").evaluate((e) => e.open),
      false,
    );
    assert.equal(
      await orion
        .locator(".orion-capture-trigger")
        .evaluate((e) => e === document.activeElement),
      true,
    );
    const portrait = page.locator(".portrait-editorial");
    await portrait.scrollIntoViewIfNeeded();
    if (width < 768) {
      const r = await portrait.boundingBox();
      assert.ok(Math.abs(r.x + r.width / 2 - width / 2) < 1);
    }
    if ([390, 1440].includes(width)) {
      await page
        .locator("#quem-cria")
        .screenshot({ path: `${dir}/after/founder-${width}.png` });
      await page
        .locator(".site-footer")
        .screenshot({ path: `${dir}/after/footer-${width}.png` });
    }
    assert.equal(await page.locator('[style*="position: fixed"]').count(), 0);
    if (width === 390) {
      await page.evaluate(() => scrollTo(0, 0));
      await page.locator(".menu-toggle").click();
      await page.locator('#main-navigation a[href="#sistemas"]').click();
      assert.equal(
        await page.locator(".menu-toggle").getAttribute("aria-expanded"),
        "false",
      );
    }
    await page.close();
    console.log(
      `layout, teclas, ${width < 768 ? "swipe" : "drag"}, controles, links: ${width}px OK`,
    );
  }
  const photo = await fs.readFile("public/brand/amadeidev-portrait.jpg"),
    original = await fs.readFile(
      "C:/Users/gabri/Downloads/Imagem do ChatGPT 16 de nov. de 2026, 16_49_20.jpg",
    );
  assert.equal(
    createHash("sha256").update(photo).digest("hex"),
    createHash("sha256").update(original).digest("hex"),
  );
  assert.deepEqual(errors, []);
  await fs.writeFile(
    `${dir}/layout-checks.json`,
    JSON.stringify({ checks, errors, originalPhotoUnchanged: true }, null, 2),
  );
  console.log(
    `${checks.length} vitrines verificadas; fotografia original intacta; console limpo`,
  );
} finally {
  await browser.close();
}
