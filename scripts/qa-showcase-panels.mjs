import { chromium } from "file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
const out = ".taste-skill/panels";
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const results = [],
  errors = [];
async function touchSwipe(p, stage) {
  await stage.scrollIntoViewIfNeeded();
  const b = await stage.boundingBox();
  const c = await p.context().newCDPSession(p);
  const x = b.x + b.width * 0.72,
    y = Math.max(100, Math.min(780, b.y + b.height * 0.5));
  await c.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y }],
  });
  for (let i = 1; i <= 8; i++) {
    await c.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: x - i * 12, y }],
    });
    await p.waitForTimeout(20);
  }
  await c.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await c.detach();
}
try {
  for (const width of [320, 375, 393, 430, 1440, 1920]) {
    const context = await browser.newContext({
      viewport: { width, height: 1000 },
      isMobile: width < 768,
      hasTouch: width < 768,
    });
    const p = await context.newPage();
    p.on("pageerror", (e) => errors.push({ width, error: e.message }));
    p.on("console", (m) => {
      if (m.type() === "error") errors.push({ width, error: m.text() });
    });
    await p.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
    for (const id of ["wandyfitt", "beaute"]) {
      const el = p.locator("#project-" + id),
        show = el.locator(".showcase"),
        site = el.getByRole("button", { name: "Site", exact: true }),
        panel = el.getByRole("button", {
          name: "Painel de Comando",
          exact: true,
        });
      await el.evaluate((e) =>
        e.scrollIntoView({ block: "start", behavior: "instant" }),
      );
      await p.waitForTimeout(1450);
      const geometry = await el
        .locator(".showcase-camera")
        .evaluate((e) => ({
          width: e.offsetWidth,
          height: e.offsetHeight,
          html: e.querySelector(".iphone-hardware").outerHTML,
          src: Array.from(e.querySelectorAll("picture img")).map(
            (i) => i.currentSrc,
          ),
        }));
      assert.equal(await site.getAttribute("aria-pressed"), "true");
      assert.equal(
        await el.locator(".showcase-entrance").getAttribute("inert"),
        null,
      );
      assert.equal(
        await el.locator(".showcase-panel-layer").getAttribute("inert"),
        "",
      );
      const hit = await site.boundingBox();
      assert.ok(hit.height >= 44);
      await el.screenshot({ path: `${out}/after-${id}-${width}-site.png` });
      const siteStage = el.locator(".showcase-entrance .showcase-screen-stage");
      await siteStage.focus();
      await siteStage.press("ArrowRight");
      assert.equal(
        await el.locator(".showcase-scene-copy > span").innerText(),
        "02 / 03",
      );
      await p.evaluate(() => {
        window.__panelTransition = [];
        const el = document.querySelector(
          '.showcase[data-visible="true"] .showcase-depth',
        );
        let n = 0;
        function sample() {
          window.__panelTransition.push({
            t: performance.now(),
            height: el.getBoundingClientRect().height,
          });
          if (n++ < 55) requestAnimationFrame(sample);
        }
        sample();
      });
      await panel.click();
      await p.waitForTimeout(600);
      assert.equal(await show.getAttribute("data-view"), "panel");
      assert.equal(
        await el.locator(".showcase-entrance").getAttribute("inert"),
        "",
      );
      assert.equal(
        await el.locator(".showcase-scene-copy > span").innerText(),
        "01 / 03",
      );
      const stage = el.locator(".showcase-panel-stage");
      const sizes = await stage.evaluate((e) => {
        const i = e.querySelector(".is-active img");
        return {
          w: e.clientWidth,
          h: e.clientHeight,
          loaded: i.complete && i.naturalWidth > 0,
          fit: getComputedStyle(i).objectFit,
        };
      });
      assert.ok(sizes.loaded);
      assert.equal(sizes.fit, "contain");
      assert.ok(width >= 768 || Math.abs(sizes.w / sizes.h - 1.6) < 0.02);
      await el.screenshot({ path: `${out}/after-${id}-${width}-panel.png` });
      for (let i = 1; i < 3; i++) {
        await el.locator(".showcase-controls button").nth(i).click();
        await p.waitForTimeout(380);
        assert.equal(
          await el.locator(".showcase-scene-copy > span").innerText(),
          `0${i + 1} / 03`,
        );
        assert.equal(
          await el
            .locator(".showcase-panel-stage .is-active img")
            .evaluate((i) => i.complete && i.naturalWidth > 0),
          true,
        );
        assert.ok(
          (
            await el
              .locator(".story-view-description > span")
              .nth(1)
              .innerText()
          ).length > 40,
        );
      }
      if (width >= 768) {
        await el.locator(".showcase-filmstrip button").first().click();
        assert.equal(
          await el.locator(".showcase-scene-copy > span").innerText(),
          "01 / 03",
        );
      } else {
        await touchSwipe(p, stage);
        assert.equal(
          await el.locator(".showcase-scene-copy > span").innerText(),
          "01 / 03",
        );
      }
      await stage.focus();
      await stage.press("End");
      assert.equal(
        await el.locator(".showcase-scene-copy > span").innerText(),
        "03 / 03",
      );
      await stage.press("Home");
      assert.equal(
        await el.locator(".showcase-scene-copy > span").innerText(),
        "01 / 03",
      );
      const enlarge = el.getByRole("button", {
        name: `Ampliar painel de ${id === "wandyfitt" ? "WandyFitt" : "29 Beauté"}`,
        exact: true,
      });
      await enlarge.click();
      const dialog = el.locator("dialog");
      assert.equal(await dialog.evaluate((e) => e.open), true);
      const readable = await dialog
        .locator(".showcase-panel-dialog-image")
        .evaluate((e) => {
          e.scrollLeft = 400;
          return {
            width: e.clientWidth,
            image: e.querySelector("img").clientWidth,
            scroll: e.scrollLeft,
          };
        });
      assert.ok(readable.image >= 1000);
      if (width < 768) assert.ok(readable.scroll > 0);
      await p.screenshot({ path: `${out}/enlarged-${id}-${width}.png` });
      await p.keyboard.press("Escape");
      assert.equal(await dialog.evaluate((e) => e.open), false);
      assert.equal(
        await enlarge.evaluate((e) => e === document.activeElement),
        true,
      );
      await enlarge.click();
      await dialog.getByRole("button", { name: "Fechar", exact: true }).click();
      assert.equal(await dialog.evaluate((e) => e.open), false);
      await site.focus();
      await site.press("Space");
      await p.waitForTimeout(550);
      assert.equal(
        await el.locator(".showcase-scene-copy > span").innerText(),
        "02 / 03",
      );
      if (width < 768) {
        await touchSwipe(p, siteStage);
        assert.equal(
          await el.locator(".showcase-scene-copy > span").innerText(),
          "03 / 03",
        );
      }
      const restored = await el
        .locator(".showcase-camera")
        .evaluate((e) => ({
          width: e.offsetWidth,
          height: e.offsetHeight,
          html: e.querySelector(".iphone-hardware").outerHTML,
          src: Array.from(e.querySelectorAll("picture img")).map(
            (i) => i.currentSrc,
          ),
        }));
      assert.deepEqual(
        restored,
        geometry,
        "iPhone and site image tree remains unchanged across modes",
      );
      await panel.click();
      await site.click();
      await panel.click();
      await p.waitForTimeout(600);
      assert.equal(await show.getAttribute("data-view"), "panel");
      const overflow = await p.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      );
      assert.equal(overflow, false);
      const height = await el
        .locator(".showcase-depth")
        .evaluate((e) => e.offsetHeight);
      results.push({
        width,
        id,
        geometry: { width: geometry.width, height: geometry.height },
        panelStage: sizes,
        readable,
        panelHeight: height,
        overflow,
        checks:
          "switch, thumbnails/dots, swipe, keyboard, modal close/Escape, focus restore, rapid reversal, image load and original iPhone retained",
      });
      await site.click();
    }
    for (const id of ["ares", "alanna"]) {
      const el = p.locator("#project-" + id);
      await el.evaluate((e) =>
        e.scrollIntoView({ block: "start", behavior: "instant" }),
      );
      await p.waitForTimeout(1400);
      assert.equal(await el.locator(".showcase-view-switch").count(), 0);
      await el.screenshot({ path: `${out}/after-${id}-${width}-site.png` });
    }
    await context.close();
  }
  assert.deepEqual(errors, []);
  await fs.writeFile(
    out + "/results.json",
    JSON.stringify(
      {
        results,
        errors,
        limitation:
          "Chromium on Windows, mobile touch emulation; no physical iOS/Android or Safari.",
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify({
      passed: results.length,
      errors,
      viewports: [320, 375, 393, 430, 1440, 1920],
    }),
  );
} finally {
  await browser.close();
}
