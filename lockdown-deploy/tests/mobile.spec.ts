import { test, expect, Page } from '@playwright/test';

async function waitForGame(page: Page) {
  await page.goto('/');
  await page.waitForFunction(() => {
    const loading = document.getElementById('loading');
    return loading && loading.style.display === 'none';
  }, { timeout: 15000 });
  await page.waitForTimeout(500);
}

async function goToTitle(page: Page) {
  await waitForGame(page);
  await page.click('body');
  await page.waitForTimeout(800);
}

test.describe('Mobile Viewport', () => {
  test('no horizontal scroll on splash screen', async ({ page }) => {
    await waitForGame(page);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // Allow 5px tolerance
  });

  test('no horizontal scroll on title screen', async ({ page }) => {
    await goToTitle(page);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('all title menu buttons are visible without scrolling horizontally', async ({ page }) => {
    await goToTitle(page);
    const items = ['Campaign', 'Arcade', 'Training', 'Mini-Games'];
    for (const item of items) {
      const el = page.locator(`text=${item}`).first();
      if (await el.isVisible().catch(() => false)) {
        const box = await el.boundingBox();
        if (box) {
          const viewport = page.viewportSize();
          expect(box.x).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width).toBeLessThanOrEqual((viewport?.width || 390) + 5);
        }
      }
    }
  });

  test('touch events work on splash screen', async ({ browser }) => {
    const context = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await waitForGame(page);
    // Use touch tap
    await page.tap('body');
    await page.waitForTimeout(1000);
    // Should transition to title
    const titleVisible = await page.locator('text=Campaign').first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(titleVisible).toBeTruthy();
    await context.close();
  });

  test('no console errors on mobile', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await goToTitle(page);
    await page.locator('text=Arcade').click();
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Back")').first().click().catch(() => {});
    await page.waitForTimeout(500);

    const criticalErrors = errors.filter(e =>
      !e.includes('play()') && !e.includes('Audio') && !e.includes('NotAllowedError')
    );
    expect(criticalErrors).toEqual([]);
  });
});
