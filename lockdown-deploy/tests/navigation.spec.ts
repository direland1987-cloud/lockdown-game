import { test, expect, Page } from '@playwright/test';

// Helper: wait for game to fully load
async function waitForGame(page: Page) {
  await page.goto('/');
  // Wait for React to render - the loading div should be hidden
  await page.waitForFunction(() => {
    const loading = document.getElementById('loading');
    return loading && loading.style.display === 'none';
  }, { timeout: 15000 });
  // Wait a bit more for React to finish rendering
  await page.waitForTimeout(500);
}

// Helper: dismiss splash screen
async function dismissSplash(page: Page) {
  await waitForGame(page);
  // Click to dismiss splash
  await page.click('body');
  await page.waitForTimeout(800);
}

// Helper: get to title screen
async function goToTitle(page: Page) {
  await dismissSplash(page);
  // Should now see the title menu with "LOCKDOWN" text
  await expect(page.locator('h1:has-text("LOCKDOWN")')).toBeVisible({ timeout: 5000 });
}

test.describe('Screen Navigation', () => {
  test('splash screen loads and is dismissible', async ({ page }) => {
    await waitForGame(page);
    // Splash should have "TAP TO FIGHT" text
    await expect(page.locator('text=TAP TO FIGHT')).toBeVisible({ timeout: 10000 });
    // Click to dismiss
    await page.click('body');
    await page.waitForTimeout(1000);
    // Should transition to title screen with menu items
    await expect(page.locator('text=Campaign')).toBeVisible({ timeout: 5000 });
  });

  test('title screen shows all menu items', async ({ page }) => {
    await goToTitle(page);
    const menuItems = ['Campaign', 'Arcade', 'Training', 'Mini-Games', 'Moves', 'Skills', 'Daily'];
    for (const item of menuItems) {
      await expect(page.locator(`text=${item}`).first()).toBeVisible();
    }
  });

  test('Arcade flow: title → select → difficulty → fight', async ({ page }) => {
    await goToTitle(page);
    // Click Arcade
    await page.locator('text=Arcade').click();
    await page.waitForTimeout(500);
    // Should see character select
    await expect(page.locator('text=FIGHTER').first()).toBeVisible({ timeout: 3000 });
    // Pick Marcus (first unlocked character)
    await page.locator('text=Marcus').first().click();
    await page.waitForTimeout(500);
    // Click SELECT button
    const selectBtn = page.locator('button:has-text("SELECT")').first();
    if (await selectBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await selectBtn.click();
      await page.waitForTimeout(500);
    }
    // May need difficulty selection
    const diffBtn = page.locator('button').filter({ hasText: /White Belt|Easy|Medium|Fight/ }).first();
    if (await diffBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await diffBtn.click();
    }
    await page.waitForTimeout(1000);
    // Should be on fight screen with grip fight or pick phase
    const fightVisible = await page.locator('text=GRIP FIGHT').first().isVisible({ timeout: 5000 }).catch(() => false)
      || await page.locator('text=FIGHT FOR GRIP').first().isVisible({ timeout: 1000 }).catch(() => false)
      || await page.locator('button').filter({ hasText: /Takedown|Snap|Pull/ }).first().isVisible({ timeout: 3000 }).catch(() => false);
    expect(fightVisible).toBeTruthy();
  });

  test('Campaign flow: title → campaign char select', async ({ page }) => {
    await goToTitle(page);
    await page.locator('text=Campaign').click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=FIGHTER').first()).toBeVisible({ timeout: 3000 });
  });

  test('Training flow: title → select', async ({ page }) => {
    await goToTitle(page);
    await page.locator('text=Training').click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=FIGHTER').first()).toBeVisible({ timeout: 3000 });
  });

  test('Mini-Games screen accessible', async ({ page }) => {
    await goToTitle(page);
    await page.locator('text=Mini-Games').click();
    await page.waitForTimeout(500);
    await expect(page.locator('h2:has-text("Mini-Games")').first()).toBeVisible({ timeout: 3000 });
  });

  test('Moves/Loadout screen accessible', async ({ page }) => {
    await goToTitle(page);
    await page.locator('text=Moves').click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=Move Loadout').first()).toBeVisible({ timeout: 3000 });
  });

  test('Skills screen accessible', async ({ page }) => {
    await goToTitle(page);
    await page.locator('text=Skills').click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=Skill Tree').first()).toBeVisible({ timeout: 3000 });
  });

  test('Back buttons return to previous screens', async ({ page }) => {
    await goToTitle(page);
    // Go to Skills
    await page.locator('text=Skills').click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=Skill Tree')).toBeVisible();
    // Click back
    await page.locator('button:has-text("Back")').first().click();
    await page.waitForTimeout(500);
    // Should be back at title
    await expect(page.locator('text=Campaign')).toBeVisible({ timeout: 3000 });
  });

  test('no console errors on basic navigation', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('[Music]') && !msg.text().includes('ERR_FILE_NOT_FOUND')) {
        errors.push(msg.text());
      }
    });
    page.on('pageerror', err => errors.push(err.message));

    await goToTitle(page);
    // Navigate through several screens
    await page.locator('text=Skills').click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Back")').first().click();
    await page.waitForTimeout(300);
    await page.locator('text=Mini-Games').click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("Back")').first().click();
    await page.waitForTimeout(300);

    expect(errors).toEqual([]);
  });
});
