import { test, expect, Page } from '@playwright/test';

/**
 * Deep campaign testing — simulates EXISTING campaign data in localStorage
 * to catch bugs that only appear when resuming a campaign.
 */

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

test.describe('Campaign Deep Tests', () => {

  test('fresh campaign: char select → story → map (no existing data)', async ({ page }) => {
    test.setTimeout(60000);
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await goToTitle(page);

    // Clear any campaign data
    await page.evaluate(() => localStorage.removeItem('ld-campaign'));
    await page.reload();
    await waitForGame(page);
    await page.click('body');
    await page.waitForTimeout(800);

    // Click Campaign
    await page.locator('text=Campaign').first().click();
    await page.waitForTimeout(1000);

    // Should be on char select
    const charSelect = await page.locator('text=FIGHTER').first().isVisible({ timeout: 3000 }).catch(() => false);
    expect(charSelect).toBeTruthy();
    console.log('PASS: Campaign char select loaded (fresh)');

    // Click Marcus
    await page.locator('text=Marcus').first().click();
    await page.waitForTimeout(2000);

    // Should be on story or map
    const onStoryOrMap = await page.locator('text=Act 1').first().isVisible({ timeout: 5000 }).catch(() => false)
      || await page.locator('text=Campaign').first().isVisible({ timeout: 2000 }).catch(() => false);
    console.log('On story/map:', onStoryOrMap);

    // Tap through story
    for (let i = 0; i < 15; i++) {
      await page.click('body');
      await page.waitForTimeout(400);
      const mapVisible = await page.locator('button').filter({ hasText: /Fight|Challenge/ }).first().isVisible().catch(() => false);
      if (mapVisible) break;
    }
    await page.waitForTimeout(1000);

    // Check for fight button on map
    const fightBtn = await page.locator('button').filter({ hasText: /Fight|Challenge/ }).first().isVisible({ timeout: 5000 }).catch(() => false);
    console.log('Fight button visible:', fightBtn);

    const criticalErrors = errors.filter(e =>
      !e.includes('play()') && !e.includes('Audio') && !e.includes('NotAllowedError') && !e.includes('favicon')
    );
    console.log('Errors:', criticalErrors);
    expect(criticalErrors).toEqual([]);
  });

  test('resume campaign: existing data → campaign_map (with saved progress)', async ({ page }) => {
    test.setTimeout(60000);
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await goToTitle(page);

    // Inject existing campaign save data
    await page.evaluate(() => {
      localStorage.setItem('ld-campaign', JSON.stringify({
        heroId: 'marcus',
        act: 1,
        fightIndex: 1,
        totalFights: 1,
        stamina: 80,
        momentum: 0,
        wins: 1,
        losses: 0,
        maxLosses: 3,
        storyFlags: { act1_intro_seen: true },
        unlockedChars: [],
        completed: false
      }));
    });

    // Reload to pick up localStorage
    await page.reload();
    await waitForGame(page);
    await page.click('body');
    await page.waitForTimeout(800);

    // Click Campaign — should go directly to campaign_map
    await page.locator('text=Campaign').first().click();
    await page.waitForTimeout(3000);

    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/campaign-resume.png' });

    // Should see campaign map with Act 1 info
    const bodyText = await page.locator('body').innerText().catch(() => '');
    console.log('Screen text (first 500):', bodyText.substring(0, 500));

    // Check for fight button
    const fightBtn = await page.locator('button').filter({ hasText: /Fight|Challenge/ }).first().isVisible({ timeout: 5000 }).catch(() => false);
    console.log('Fight button visible:', fightBtn);

    if (fightBtn) {
      await page.locator('button').filter({ hasText: /Fight|Challenge/ }).first().click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'test-results/campaign-prefight.png' });
      console.log('Clicked fight, checking prefight screen...');

      // Try to start the fight
      const startBtn = await page.locator('button:has-text("START FIGHT")').isVisible({ timeout: 3000 }).catch(() => false);
      if (startBtn) {
        await page.locator('button:has-text("START FIGHT")').click();
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'test-results/campaign-fight.png' });
        console.log('Fight started');
      }
    }

    const criticalErrors = errors.filter(e =>
      !e.includes('play()') && !e.includes('Audio') && !e.includes('NotAllowedError') && !e.includes('favicon')
    );
    console.log('All errors:', criticalErrors);
    expect(criticalErrors).toEqual([]);
  });

  test('campaign with act 2+ data (boss beaten)', async ({ page }) => {
    test.setTimeout(60000);
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await goToTitle(page);

    await page.evaluate(() => {
      localStorage.setItem('ld-campaign', JSON.stringify({
        heroId: 'adele',
        act: 2,
        fightIndex: 0,
        totalFights: 4,
        stamina: 100,
        momentum: 0,
        wins: 4,
        losses: 0,
        maxLosses: 3,
        storyFlags: { act1_intro_seen: true },
        unlockedChars: ['luta'],
        completed: false
      }));
    });

    await page.reload();
    await waitForGame(page);
    await page.click('body');
    await page.waitForTimeout(800);

    await page.locator('text=Campaign').first().click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/campaign-act2.png' });

    const bodyText = await page.locator('body').innerText().catch(() => '');
    console.log('Act 2 screen (first 500):', bodyText.substring(0, 500));

    const criticalErrors = errors.filter(e =>
      !e.includes('play()') && !e.includes('Audio') && !e.includes('NotAllowedError') && !e.includes('favicon')
    );
    console.log('Act 2 errors:', criticalErrors);
    expect(criticalErrors).toEqual([]);
  });

  test('campaign story screen with stale storyIdx', async ({ page }) => {
    test.setTimeout(60000);
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await goToTitle(page);

    // Simulate going through campaign: fresh start
    await page.evaluate(() => localStorage.removeItem('ld-campaign'));
    await page.reload();
    await waitForGame(page);
    await page.click('body');
    await page.waitForTimeout(800);

    await page.locator('text=Campaign').first().click();
    await page.waitForTimeout(1000);

    // Pick Marcus
    await page.locator('text=Marcus').first().click();
    await page.waitForTimeout(1500);

    // We should be on campaign_story. Tap through ALL story lines rapidly
    for (let i = 0; i < 30; i++) {
      await page.click('body');
      await page.waitForTimeout(200);
    }
    await page.waitForTimeout(2000);

    // Should have reached campaign_map
    await page.screenshot({ path: 'test-results/campaign-after-story.png' });

    const criticalErrors = errors.filter(e =>
      !e.includes('play()') && !e.includes('Audio') && !e.includes('NotAllowedError') && !e.includes('favicon')
    );
    console.log('Story traverse errors:', criticalErrors);
    expect(criticalErrors).toEqual([]);
  });

  test('full campaign fight flow: map → prefight → fight → result', async ({ page }) => {
    test.setTimeout(120000);
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await goToTitle(page);

    // Set up campaign at act 1, fight 0 with story already seen
    await page.evaluate(() => {
      localStorage.setItem('ld-campaign', JSON.stringify({
        heroId: 'marcus',
        act: 1,
        fightIndex: 0,
        totalFights: 0,
        stamina: 100,
        momentum: 0,
        wins: 0,
        losses: 0,
        maxLosses: 3,
        storyFlags: { act1_intro_seen: true },
        unlockedChars: [],
        completed: false
      }));
    });

    await page.reload();
    await waitForGame(page);
    await page.click('body');
    await page.waitForTimeout(800);

    // Click Campaign → should go to story or map
    await page.locator('text=Campaign').first().click();
    await page.waitForTimeout(2000);

    // Tap through story if visible
    for (let i = 0; i < 20; i++) {
      const mapBtn = await page.locator('button').filter({ hasText: /Fight|Challenge/ }).first().isVisible().catch(() => false);
      if (mapBtn) break;
      await page.click('body');
      await page.waitForTimeout(300);
    }
    await page.waitForTimeout(1000);

    // Click Fight button
    const fightBtn = page.locator('button').filter({ hasText: /Fight|Challenge/ }).first();
    if (await fightBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await fightBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/campaign-full-prefight.png' });

      // Click START FIGHT
      const startBtn = page.locator('button:has-text("START FIGHT")');
      if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await startBtn.click();
        await page.waitForTimeout(3000);

        // Complete grip fight
        const gripBtn = page.locator('button:has-text("FIGHT FOR GRIP")');
        for (let i = 0; i < 30; i++) {
          if (!await gripBtn.isVisible().catch(() => false)) break;
          await gripBtn.click({ force: true }).catch(() => {});
          await page.waitForTimeout(300);
        }
        await page.waitForTimeout(3000);
        await page.screenshot({ path: 'test-results/campaign-full-fight.png' });

        // Play a few turns
        for (let turn = 0; turn < 3; turn++) {
          const moveBtn = page.locator('button').filter({ hasText: /Takedown|Snap|Pull|Breathe|Arm Drag|Guard|Clinch/ }).first();
          if (await moveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await moveBtn.click().catch(() => {});
            await page.waitForTimeout(3000);
            await page.keyboard.press('Space').catch(() => {});
            await page.waitForTimeout(2000);
          }
        }
      }
    }

    await page.screenshot({ path: 'test-results/campaign-full-final.png' });
    const criticalErrors = errors.filter(e =>
      !e.includes('play()') && !e.includes('Audio') && !e.includes('NotAllowedError') && !e.includes('favicon')
    );
    console.log('Full flow errors:', criticalErrors);
    expect(criticalErrors).toEqual([]);
  });
});
