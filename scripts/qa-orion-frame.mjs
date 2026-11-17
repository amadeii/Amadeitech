import { chromium } from "file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const dir = ".impeccable/review/orion-frame";
const before = process.argv.includes("--before");
const browser = await chromium.launch({
  executablePath:
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  headless: true,
});
const errors = [],
  results = [];
try {
  for (const width of [1440, 1024, 768, 390, 320]) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      reducedMotion: "reduce",
    });
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto("http://127.0.0.1:5175/?motion=reduce#sistemas", {
      waitUntil: "networkidle",
    });
    await page.evaluate(() => document.fonts.ready);
    await page.locator(".system-visual").scrollIntoViewIfNeeded();
    const stage = before ? "before" : "after";
    await page
      .locator(".system-visual")
      .screenshot({ path: `${dir}/${stage}-${width}.png` });
    await page
      .locator("#sistemas")
      .screenshot({ path: `${dir}/${stage}-section-${width}.png` });
    const measurements = await page.locator(".system-visual").evaluate((el) => {
      const image = el.querySelector("img");
      const rect = image.getBoundingClientRect();
      const crop = el
        .querySelector(".orion-capture-crop")
        ?.getBoundingClientRect();
      return {
        imageWidth: rect.width,
        imageHeight: rect.height,
        cropHeight: crop?.height,
        scale: rect.width / image.naturalWidth,
      };
    });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    if (!before) {
      const trigger = page.getByRole("button", {
        name: "Ampliar captura real do ORION Empresarial",
      });
      const dialog = page.getByRole("dialog", {
        name: "Captura completa do ORION Empresarial",
      });
      const close = page.getByRole("button", {
        name: "Fechar captura ampliada do ORION",
      });
      await trigger.focus();
      const position = await page.evaluate(() => scrollY);
      await trigger.press("Enter");
      assert.ok(await dialog.isVisible());
      assert.ok(await close.evaluate((el) => el === document.activeElement));
      await page.keyboard.press("Tab");
      assert.ok(
        await dialog.evaluate((el) => el.contains(document.activeElement)),
      );
      await page.keyboard.press("Shift+Tab");
      assert.ok(
        await dialog.evaluate((el) => el.contains(document.activeElement)),
      );
      const image = dialog.locator("img");
      assert.ok(
        await image.evaluate(
          (img) =>
            img.complete &&
            img.naturalWidth === 1910 &&
            img.naturalHeight === 1000,
        ),
      );
      assert.equal(
        await image.evaluate((img) => getComputedStyle(img).objectFit),
        "fill",
      ); // intrinsic ratio, no crop in dialog
      await dialog.screenshot({ path: `${dir}/dialog-${width}.png` });
      const full = dialog.locator(".orion-capture-full");
      const complete = await full.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
        el.scrollLeft = el.scrollWidth;
        const img = el.querySelector("img").getBoundingClientRect();
        const frame = el.getBoundingClientRect();
        return {
          ratio: img.width / img.height,
          bottomVisible: img.bottom <= frame.bottom + 1,
          rightVisible: img.right <= frame.right + 1,
        };
      });
      assert.ok(Math.abs(complete.ratio - 1.91) < 0.001);
      assert.ok(
        complete.bottomVisible && complete.rightVisible,
        "Entire original can be reached by scrolling",
      );
      await page.keyboard.press("Escape");
      assert.equal(await dialog.isVisible(), false);
      assert.ok(await trigger.evaluate((el) => el === document.activeElement));
      assert.equal(await page.evaluate(() => scrollY), position);
      await trigger.click();
      await close.click();
      assert.equal(await dialog.isVisible(), false);
      assert.ok(await trigger.evaluate((el) => el === document.activeElement));
      await trigger.click();
      await image.click({ position: { x: 15, y: 15 } });
      assert.ok(await dialog.isVisible(), "Content clicks must not dismiss");
      await page.mouse.click(3, 3);
      assert.equal(await dialog.isVisible(), false);
      assert.ok(await trigger.evaluate((el) => el === document.activeElement));
      assert.equal(await page.evaluate(() => scrollY), position);
      assert.equal(
        await page.locator("#sistemas .system-status").innerText(),
        "EM BREVE",
      );
      assert.equal(await page.locator("#sistemas dt").count(), 4);
    }
    results.push({ width, ...measurements });
    await page.close();
  }
  assert.deepEqual(errors, []);
  await fs.writeFile(
    `${dir}/${before ? "before" : "after"}.json`,
    JSON.stringify({ results, errors }, null, 2),
  );
  console.log(
    JSON.stringify({
      stage: before ? "before" : "after",
      passed: true,
      results,
      errors,
    }),
  );
} finally {
  await browser.close();
}
