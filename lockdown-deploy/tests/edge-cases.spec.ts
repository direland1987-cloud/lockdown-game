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

test.describe('Edge Cases', () => {
  test('game loads with cleared localStorage', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForFunction(() => {
      const loading = document.getElementById('loading');
      return loading && loading.style.display === 'none';
    }, { timeout: 15000 });
    await page.waitForTimeout(500);
    // Should still show splash
    const splashVisible = await page.locator('text=TAP TO FIGHT').first().isVisible({ timeout: 5000 }).catch(() => false)
      || await page.locator('text=GRAPPLE').first().isVisible({ timeout: 1000 }).catch(() => false);
    expect(splashVisible).toBeTruthy();
  });

  test('rapid clicking during transitions does not crash', async ({ page }) => {
    test.setTimeout(90000);
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await goToTitle(page);
    // Rapidly click multiple menu items
    for (let i = 0; i < 3; i++) {
      await page.locator('text=Arcade').first().click({ force: true }).catch(() => {});
      await page.waitForTimeout(100);
      await page.locator('button:has-text("Back")').first().click({ force: true }).catch(() => {});
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(1000);

    const criticalErrors = errors.filter(e =>
      !e.includes('play()') && !e.includes('Audio') && !e.includes('NotAllowedError')
    );
    expect(criticalErrors).toEqual([]);
  });

  test('game handles missing audio gracefully', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await goToTitle(page);
    await page.waitForTimeout(2000);

    // Audio errors should not crash the game
    const criticalErrors = errors.filter(e =>
      !e.includes('play()') && !e.includes('Audio') && !e.includes('NotAllowedError') &&
      !e.includes('ERR_FILE_NOT_FOUND') && !e.includes('net::')
    );
    expect(criticalErrors).toEqual([]);
  });

  test('error box is hidden on successful load', async ({ page }) => {
    await waitForGame(page);
    const errorBox = page.locator('#error-box');
    const display = await errorBox.evaluate(el => window.getComputedStyle(el).display);
    expect(display).toBe('none');
  });
});
