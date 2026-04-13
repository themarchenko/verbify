import { chromium } from "playwright";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = "http://localhost:3000";
const SCREENSHOT_DIR = __dirname;

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 375, height: 812 },
};

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function screenshot(page, name) {
  await sleep(500);
  await page.screenshot({
    path: join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: true,
  });
  console.log(`  -> ${name}.png`);
}

async function screenshotViewport(page, name) {
  await sleep(500);
  await page.screenshot({
    path: join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: false,
  });
  console.log(`  -> ${name}.png (viewport)`);
}

async function hoverAndScreenshot(page, selector, name, description) {
  try {
    const el = page.locator(selector).first();
    if ((await el.count()) > 0) {
      await el.scrollIntoViewIfNeeded();
      await el.hover();
      await sleep(400);
      await screenshotViewport(page, name);
      console.log(`  -> hover: ${description}`);
    } else {
      console.log(`  -- skip hover: ${description} (not found: ${selector})`);
    }
  } catch (e) {
    console.log(`  -- skip hover: ${description} (${e.message.slice(0, 80)})`);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // ===== DESKTOP SESSION =====
  console.log("\n=== DESKTOP (1440x900) ===\n");
  const desktopCtx = await browser.newContext({ viewport: VIEWPORTS.desktop });
  const dp = await desktopCtx.newPage();

  // 1. Login page
  console.log("1. Login page");
  await dp.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await screenshot(dp, "01-login-desktop");

  // Hover on login button
  await hoverAndScreenshot(
    dp,
    'button[type="submit"]',
    "01b-login-btn-hover",
    "login button hover"
  );

  // 2. Register page
  console.log("2. Register page");
  await dp.goto(`${BASE}/register`, { waitUntil: "networkidle" });
  await screenshot(dp, "02-register-desktop");

  // 3. Login as owner
  console.log("3. Logging in as owner...");
  await dp.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await dp.fill('input[name="email"], input[type="email"]', "owner@test.com");
  await dp.fill(
    'input[name="password"], input[type="password"]',
    "test1234"
  );
  await dp.click('button[type="submit"]');
  await dp.waitForURL("**/dashboard**", { timeout: 15000 });
  await sleep(1000);

  // 4. Dashboard
  console.log("4. Dashboard");
  await screenshot(dp, "03-dashboard-desktop");

  // Hover on sidebar nav items
  await hoverAndScreenshot(
    dp,
    'nav a, [data-sidebar] a',
    "03b-sidebar-hover",
    "sidebar nav item hover"
  );

  // 5. Courses page
  console.log("5. Courses page");
  await dp.goto(`${BASE}/dashboard/courses`, { waitUntil: "networkidle" });
  await sleep(1000);
  await screenshot(dp, "04-courses-desktop");

  // Hover on course card
  await hoverAndScreenshot(
    dp,
    '[class*="card"], [class*="Card"]',
    "04b-course-card-hover",
    "course card hover"
  );

  // Hover on create/add button
  await hoverAndScreenshot(
    dp,
    'button:has-text("Create"), button:has-text("Add"), button:has-text("Створити"), button:has-text("Додати")',
    "04c-create-btn-hover",
    "create button hover"
  );

  // 6. Try to open a course detail
  console.log("6. Course detail");
  const courseLink = dp
    .locator('a[href*="/dashboard/courses/"]')
    .first();
  if ((await courseLink.count()) > 0) {
    await courseLink.click();
    await dp.waitForLoadState("networkidle");
    await sleep(1000);
    await screenshot(dp, "05-course-detail-desktop");

    // Hover on delete button
    await hoverAndScreenshot(
      dp,
      'button:has-text("Delete"), button:has-text("Видалити"), button:has-text("Remove"), button:has-text("Вилучити")',
      "05b-delete-btn-hover",
      "delete button hover"
    );

    // Hover on edit button
    await hoverAndScreenshot(
      dp,
      'button:has-text("Edit"), button:has-text("Редагувати")',
      "05c-edit-btn-hover",
      "edit button hover"
    );

    // 7. Try to open lesson builder
    console.log("7. Lesson builder");
    const lessonLink = dp
      .locator('a[href*="/lessons/"]')
      .first();
    if ((await lessonLink.count()) > 0) {
      await lessonLink.click();
      await dp.waitForLoadState("networkidle");
      await sleep(1500);
      await screenshot(dp, "06-lesson-builder-desktop");

      // Hover on block add button / divider
      await hoverAndScreenshot(
        dp,
        'button:has-text("+"), [class*="divider"] button, [class*="Divider"] button, [class*="add-block"]',
        "06b-add-block-hover",
        "add block divider hover"
      );

      // Hover on block picker items
      await hoverAndScreenshot(
        dp,
        '[class*="block-picker"] button, [class*="BlockPicker"] button',
        "06c-block-picker-hover",
        "block picker item hover"
      );
    }
  }

  // 8. Students page
  console.log("8. Students page");
  await dp.goto(`${BASE}/dashboard/students`, { waitUntil: "networkidle" });
  await sleep(1000);
  await screenshot(dp, "07-students-desktop");

  // 9. Settings page
  console.log("9. Settings page");
  await dp.goto(`${BASE}/dashboard/settings`, { waitUntil: "networkidle" });
  await sleep(1000);
  await screenshot(dp, "08-settings-desktop");

  // 10. Billing page
  console.log("10. Billing / Pricing page");
  await dp.goto(`${BASE}/dashboard/settings/billing`, {
    waitUntil: "networkidle",
  });
  await sleep(1000);
  await screenshot(dp, "09-billing-desktop");

  // Hover on pricing plan buttons
  await hoverAndScreenshot(
    dp,
    'button:has-text("Subscribe"), button:has-text("Підписатися"), button:has-text("Choose"), button:has-text("Обрати")',
    "09b-pricing-btn-hover",
    "pricing plan button hover"
  );

  await desktopCtx.close();

  // ===== MOBILE SESSION =====
  console.log("\n=== MOBILE (375x812) ===\n");
  const mobileCtx = await browser.newContext({ viewport: VIEWPORTS.mobile });
  const mp = await mobileCtx.newPage();

  // Login
  console.log("Mobile: Login page");
  await mp.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await screenshot(mp, "10-login-mobile");

  // Log in
  console.log("Mobile: Logging in...");
  await mp.fill('input[name="email"], input[type="email"]', "owner@test.com");
  await mp.fill(
    'input[name="password"], input[type="password"]',
    "test1234"
  );
  await mp.click('button[type="submit"]');
  await mp.waitForURL("**/dashboard**", { timeout: 15000 });
  await sleep(1000);

  // Dashboard
  console.log("Mobile: Dashboard");
  await screenshot(mp, "11-dashboard-mobile");

  // Try to open mobile menu
  const menuBtn = mp.locator(
    'button[aria-label*="menu"], button[aria-label*="Menu"], button:has(svg[class*="menu"]), [data-sidebar-trigger], button:has-text("Menu"), button:has-text("Меню")'
  ).first();
  if ((await menuBtn.count()) > 0) {
    await menuBtn.click();
    await sleep(500);
    await screenshotViewport(mp, "11b-mobile-menu-open");
  }

  // Courses mobile
  console.log("Mobile: Courses");
  await mp.goto(`${BASE}/dashboard/courses`, { waitUntil: "networkidle" });
  await sleep(1000);
  await screenshot(mp, "12-courses-mobile");

  // ===== STUDENT VIEW =====
  console.log("\n=== STUDENT VIEW ===\n");
  const studentCtx = await browser.newContext({ viewport: VIEWPORTS.desktop });
  const sp = await studentCtx.newPage();

  console.log("Student: Login");
  await sp.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await sp.fill(
    'input[name="email"], input[type="email"]',
    "student@test.com"
  );
  await sp.fill(
    'input[name="password"], input[type="password"]',
    "test1234"
  );
  await sp.click('button[type="submit"]');
  await sp.waitForURL("**/learn**", { timeout: 15000 });
  await sleep(1000);

  console.log("Student: Learn page");
  await screenshot(sp, "13-learn-desktop");

  // Try to open a course
  const learnCourse = sp.locator('a[href*="/learn/"]').first();
  if ((await learnCourse.count()) > 0) {
    await learnCourse.click();
    await sp.waitForLoadState("networkidle");
    await sleep(1000);
    await screenshot(sp, "14-learn-course-desktop");

    // Try to open a lesson
    const learnLesson = sp.locator('a[href*="/learn/"][href*="/"]').first();
    if ((await learnLesson.count()) > 0) {
      await learnLesson.click();
      await sp.waitForLoadState("networkidle");
      await sleep(1000);
      await screenshot(sp, "15-learn-lesson-desktop");
    }
  }

  await studentCtx.close();
  await mobileCtx.close();
  await browser.close();

  console.log("\nDone! All screenshots saved to:", SCREENSHOT_DIR);
})();
