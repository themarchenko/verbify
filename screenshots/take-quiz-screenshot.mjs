import { chromium } from "playwright";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:3000";

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  // Login as owner
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', "owner@test.com");
  await page.fill('input[type="password"]', "test1234");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard**", { timeout: 15000 });
  await sleep(1000);

  // Navigate to courses -> first course -> first lesson (lesson builder)
  await page.goto(`${BASE}/dashboard/courses`, { waitUntil: "networkidle" });
  await sleep(500);

  const courseLink = page.locator('a[href*="/dashboard/courses/"]').first();
  if ((await courseLink.count()) > 0) {
    await courseLink.click();
    await page.waitForLoadState("networkidle");
    await sleep(500);

    const lessonLink = page.locator('a[href*="/lessons/"]').first();
    if ((await lessonLink.count()) > 0) {
      await lessonLink.click();
      await page.waitForLoadState("networkidle");
      await sleep(2000);

      // Full page screenshot
      await page.screenshot({
        path: join(__dirname, "quiz-fixed.png"),
        fullPage: true,
      });
      console.log("-> quiz-fixed.png");

      // Hover on a delete icon (option trash)
      const trashBtn = page.locator('button:has(svg)').filter({ has: page.locator('svg') });
      // Try hovering on the block wrapper delete
      const blockDeleteBtn = page.locator('.group > .absolute button').first();
      if ((await blockDeleteBtn.count()) > 0) {
        await blockDeleteBtn.hover();
        await sleep(300);
        await page.screenshot({
          path: join(__dirname, "quiz-delete-hover.png"),
          fullPage: false,
        });
        console.log("-> quiz-delete-hover.png (block delete hover)");
      }
    }
  }

  await browser.close();
  console.log("Done!");
})();
