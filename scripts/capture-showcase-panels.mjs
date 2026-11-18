import { chromium } from "file:///C:/Users/gabri/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
async function capture(page, element, path) {
  await element.evaluate((e) =>
    e.scrollIntoView({ block: "start", behavior: "instant" }),
  );
  await page.waitForTimeout(1800);

  await element.screenshot({ path });
}
try {
  for (const width of process.argv[2]
    ? process.argv[2].split(",").map(Number)
    : [320, 375, 393, 430, 1440, 1920]) {
    const page = await browser.newPage({
      viewport: { width, height: 2000 },
      isMobile: width < 768,
      hasTouch: width < 768,
    });
    await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
    for (const id of ["wandyfitt", "beaute", "ares", "alanna"]) {
      const el = page.locator("#project-" + id);
      await capture(
        page,
        el,
        `.taste-skill/panels/after-${id}-${width}-site.png`,
      );
      if (id === "wandyfitt" || id === "beaute") {
        await el
          .getByRole("button", { name: "Painel de Comando", exact: true })
          .click();
        await capture(
          page,
          el,
          `.taste-skill/panels/after-${id}-${width}-panel.png`,
        );
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
}
