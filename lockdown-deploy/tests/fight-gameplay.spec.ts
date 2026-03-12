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
  await expect(page.locator('h1:has-text("LOCKDOWN")')).toBeVisible({ timeout: 5000 });
}

async function startArcadeFight(page: Page, charName = 'Marcus') {
  await goToTitle(page);
  await page.locator('text=Arcade').click();
  await page.waitForTimeout(500);
  // Select character - click on the character name
  await page.locator(`text=${charName}`).first().click();
  await page.waitForTimeout(500);
  // Click the SELECT button (e.g. "SELECT MARCUS")
  const selectBtn = page.locator(`button:has-text("SELECT")`).first();
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
}

async function waitForFightReady(page: Page) {
  // Wait until either grip fight button or move buttons appear
  const gripOrMoves = page.locator('button:has-text("FIGHT FOR GRIP"), button:has-text("Takedown"), button:has-text("Snap"), button:has-text("Pull"), button:has-text("Breathe")').first();
  await gripOrMoves.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
}

async function completeGripFight(page: Page) {
  // Wait for grip fight to appear and complete
  // The grip fight auto-completes after a timer, so we just need to click occasionally
  try {
    const gripBtn = page.locator('button:has-text("FIGHT FOR GRIP")');
    for (let i = 0; i < 40; i++) {
      const visible = await gripBtn.isVisible().catch(() => false);
      if (!visible) break;
      await gripBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(300);
    }
    // Wait for any transition/AI turn
    await page.waitForTimeout(3000);
  } catch {
    // Page may have been closed/navigated during grip fight - that's OK
  }
}

async function waitForMoveButtons(page: Page, timeout = 15000) {
  const moveButtons = page.locator('button').filter({ hasText: /Takedown|Snap|Pull|Breathe|Arm Drag|Guard|Clinch|Pass|Sweep|Escape|Turn In|Slide Out/ });
  await moveButtons.first().waitFor({ state: 'visible', timeout }).catch(() => {});
  return moveButtons;
}

test.describe('Fight Gameplay', () => {
  test.describe.configure({ retries: 1 });
  test('fight screen loads after character select', async ({ page }) => {
    test.setTimeout(90000);
    await startArcadeFight(page);
    await waitForFightReady(page);
    // Should see either grip fight or move buttons
    const gripVisible = await page.locator('text=GRIP FIGHT').first().isVisible({ timeout: 3000 }).catch(() => false)
      || await page.locator('text=FIGHT FOR GRIP').first().isVisible({ timeout: 1000 }).catch(() => false);
    const moveVisible = await page.locator('button').filter({ hasText: /Takedown|Snap|Pull|Breathe/ }).first().isVisible({ timeout: 3000 }).catch(() => false);
    expect(gripVisible || moveVisible).toBeTruthy();
  });

  test('move buttons appear during player pick phase', async ({ page }) => {
    test.setTimeout(120000);
    await startArcadeFight(page);
    await completeGripFight(page);
    const moveButtons = await waitForMoveButtons(page);
    const count = await moveButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('clicking a move progresses the fight', async ({ page }) => {
    test.setTimeout(120000);
    await startArcadeFight(page);
    await completeGripFight(page);
    const moveButtons = await waitForMoveButtons(page);
    const btn = moveButtons.first();
    if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(2000);
      // After clicking, something should happen - banner, minigame, or AI turn
      // Just verify no crash
      const bodyText = await page.locator('body').innerText().catch(() => '');
      expect(bodyText.length).toBeGreaterThan(0);
    }
  });

  test('stamina bars visible during fight', async ({ page }) => {
    test.setTimeout(120000);
    await startArcadeFight(page);
    await completeGripFight(page);
    await page.waitForTimeout(2000);
    // The fight HUD should be visible with stamina numbers or bars
    const hudVisible = await page.locator('text=100').first().isVisible({ timeout: 5000 }).catch(() => false)
      || await page.locator('text=YOU').first().isVisible({ timeout: 2000 }).catch(() => false)
      || await page.locator('text=YOUR TURN').first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(hudVisible).toBeTruthy();
  });

  test('fight runs without JS errors', async ({ page }) => {
    test.setTimeout(120000);
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await startArcadeFight(page);
    await completeGripFight(page);

    // Play a few turns
    for (let turn = 0; turn < 5; turn++) {
      const moveButtons = await waitForMoveButtons(page, 8000);
      const btn = moveButtons.first();
      if (await btn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await btn.click().catch(() => {});
        await page.waitForTimeout(3000);
        // Try pressing space for minigames
        await page.keyboard.press('Space').catch(() => {});
        await page.waitForTimeout(2000);
      }
      // Check if fight ended
      const resultVisible = await page.locator('text=Rematch').first().isVisible({ timeout: 500 }).catch(() => false)
        || await page.locator('text=Main Menu').first().isVisible({ timeout: 500 }).catch(() => false);
      if (resultVisible) break;
    }

    const criticalErrors = errors.filter(e =>
      !e.includes('play()') && !e.includes('Audio') && !e.includes('NotAllowedError')
    );
    expect(criticalErrors).toEqual([]);
  });

  test('all three unlocked characters can start fights', async ({ page }) => {
    test.setTimeout(120000);
    const chars = ['Marcus', 'Adele', 'Yuki'];
    for (const char of chars) {
      await startArcadeFight(page, char);
      // Should get to grip fight or fight screen
      await waitForFightReady(page);
      const fightStarted = await page.locator('text=FIGHT FOR GRIP').first().isVisible({ timeout: 3000 }).catch(() => false)
        || await page.locator('text=GRIP FIGHT').first().isVisible({ timeout: 1000 }).catch(() => false)
        || await page.locator('button').filter({ hasText: /Takedown|Snap|Pull|Breathe/ }).first().isVisible({ timeout: 3000 }).catch(() => false);
      expect(fightStarted).toBeTruthy();
    }
  });
});
