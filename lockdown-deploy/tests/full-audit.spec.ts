import { test, expect, Page } from '@playwright/test';

/**
 * FULL GAME AUDIT — explores every screen, every mini-game, campaign flow,
 * arcade flow, and reports all JS errors, missing elements, and broken interactions.
 */

const results: {
  screen: string;
  status: 'pass' | 'fail' | 'warn';
  detail: string;
}[] = [];

function log(screen: string, status: 'pass' | 'fail' | 'warn', detail: string) {
  results.push({ screen, status, detail });
  console.log(`[${status.toUpperCase()}] ${screen}: ${detail}`);
}

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
  await page.waitForTimeout(1000);
}

async function collectErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('ERR_FILE_NOT_FOUND') && !msg.text().includes('[Music]')) {
      errors.push('CONSOLE: ' + msg.text());
    }
  });
  return errors;
}

function filterCritical(errors: string[]): string[] {
  return errors.filter(e =>
    !e.includes('play()') && !e.includes('Audio') && !e.includes('NotAllowedError') &&
    !e.includes('ERR_FILE_NOT_FOUND') && !e.includes('net::')
  );
}

// ══════════════════════════════════════════════
// AUDIT TESTS
// ══════════════════════════════════════════════

test.describe('Full Game Audit', () => {
  test.setTimeout(300000); // 5 min per test

  test('A1 — Splash screen loads and transitions', async ({ page }) => {
    const errors = await collectErrors(page);
    await waitForGame(page);

    // Check splash text
    const tapText = await page.locator('text=TAP TO FIGHT').first().isVisible({ timeout: 5000 }).catch(() => false);
    if (tapText) log('splash', 'pass', 'TAP TO FIGHT text visible');
    else log('splash', 'warn', 'TAP TO FIGHT text not found');

    // Click to dismiss
    await page.click('body');
    await page.waitForTimeout(1000);

    // Should see title
    const title = await page.locator('h1:has-text("LOCKDOWN")').isVisible({ timeout: 5000 }).catch(() => false);
    if (title) log('splash→title', 'pass', 'Title screen loaded after splash dismiss');
    else log('splash→title', 'fail', 'Title screen did NOT load after splash dismiss');

    const critical = filterCritical(errors);
    if (critical.length > 0) log('splash', 'fail', `JS errors: ${critical.join(' | ')}`);
    else log('splash', 'pass', 'No JS errors on splash→title transition');
  });

  test('A2 — Title screen menu items all visible', async ({ page }) => {
    const errors = await collectErrors(page);
    await goToTitle(page);

    const items = ['Campaign', 'Arcade', 'Training', 'Mini-Games', 'Moves', 'Skills', 'Daily'];
    for (const item of items) {
      const visible = await page.locator(`text=${item}`).first().isVisible({ timeout: 3000 }).catch(() => false);
      if (visible) log('title', 'pass', `Menu item "${item}" visible`);
      else log('title', 'fail', `Menu item "${item}" NOT visible`);
    }

    const critical = filterCritical(errors);
    if (critical.length > 0) log('title', 'fail', `JS errors: ${critical.join(' | ')}`);
    else log('title', 'pass', 'No JS errors on title screen');
  });

  test('A3 — Arcade: character select → difficulty → fight', async ({ page }) => {
    const errors = await collectErrors(page);
    await goToTitle(page);
    await page.locator('text=Arcade').click();
    await page.waitForTimeout(500);

    // Character select should show FIGHTER heading
    const fighter = await page.locator('text=FIGHTER').first().isVisible({ timeout: 3000 }).catch(() => false);
    if (fighter) log('arcade_select', 'pass', 'Character select screen loaded');
    else log('arcade_select', 'fail', 'Character select heading not found');

    // Check all characters visible
    const chars = ['Marcus', 'Adele', 'Yuki'];
    for (const c of chars) {
      const vis = await page.locator(`text=${c}`).first().isVisible({ timeout: 2000 }).catch(() => false);
      if (vis) log('arcade_select', 'pass', `Character "${c}" visible`);
      else log('arcade_select', 'fail', `Character "${c}" NOT visible`);
    }

    // Check locked characters shown
    const locked = ['Darius', 'Diego', 'Rusty', 'Luta', 'Mahmedov'];
    for (const c of locked) {
      const vis = await page.locator(`text=${c}`).first().isVisible({ timeout: 1000 }).catch(() => false);
      if (vis) log('arcade_select', 'pass', `Locked char "${c}" shown`);
      else log('arcade_select', 'warn', `Locked char "${c}" not shown`);
    }

    // Select Marcus
    await page.locator('text=Marcus').first().click();
    await page.waitForTimeout(500);

    // Click SELECT button
    const selectBtn = page.locator('button:has-text("SELECT")').first();
    if (await selectBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await selectBtn.click();
      await page.waitForTimeout(500);
      log('arcade_select', 'pass', 'SELECT button clicked');
    } else {
      log('arcade_select', 'fail', 'SELECT button not found');
    }

    // Difficulty screen
    const diffBtns = page.locator('button').filter({ hasText: /White Belt|Blue Belt|Purple Belt|Brown Belt|Black Belt/ });
    const diffCount = await diffBtns.count().catch(() => 0);
    if (diffCount > 0) {
      log('difficulty', 'pass', `${diffCount} difficulty options found`);
      await diffBtns.first().click();
      await page.waitForTimeout(1000);
    } else {
      log('difficulty', 'warn', 'No difficulty buttons found — may go direct to fight');
    }

    // Fight should start
    const fightStarted = await page.locator('text=FIGHT FOR GRIP').first().isVisible({ timeout: 5000 }).catch(() => false)
      || await page.locator('text=GRIP FIGHT').first().isVisible({ timeout: 1000 }).catch(() => false)
      || await page.locator('button').filter({ hasText: /Takedown|Snap|Pull|Breathe/ }).first().isVisible({ timeout: 3000 }).catch(() => false);
    if (fightStarted) log('arcade_fight', 'pass', 'Fight started successfully');
    else log('arcade_fight', 'fail', 'Fight did NOT start');

    const critical = filterCritical(errors);
    if (critical.length > 0) log('arcade', 'fail', `JS errors: ${critical.join(' | ')}`);
    else log('arcade', 'pass', 'No JS errors in arcade flow');
  });

  test('A4 — Campaign: character select → story → map → fight', async ({ page }) => {
    const errors = await collectErrors(page);
    await goToTitle(page);

    // Clear any existing campaign
    await page.evaluate(() => localStorage.removeItem('ld-campaign'));

    await page.locator('text=Campaign').click();
    await page.waitForTimeout(1000);

    // Should see campaign char select
    const charSelect = await page.locator('text=Choose Your Fighter').first().isVisible({ timeout: 3000 }).catch(() => false)
      || await page.locator('text=FIGHTER').first().isVisible({ timeout: 2000 }).catch(() => false);
    if (charSelect) log('campaign_charselect', 'pass', 'Campaign char select loaded');
    else log('campaign_charselect', 'fail', 'Campaign char select NOT loaded');

    // Take screenshot for visual check
    await page.screenshot({ path: 'test-results/audit-campaign-charselect.png' });

    // Select Marcus
    const marcusBtn = page.locator('text=Marcus').first();
    if (await marcusBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await marcusBtn.click();
      await page.waitForTimeout(1000);
      log('campaign_charselect', 'pass', 'Marcus clicked');
    } else {
      log('campaign_charselect', 'fail', 'Marcus not visible in campaign char select');
      return;
    }

    // Should go to campaign_story
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/audit-campaign-story.png' });

    const storyVisible = await page.locator('text=Continue').first().isVisible({ timeout: 5000 }).catch(() => false)
      || await page.locator('text=Skip').first().isVisible({ timeout: 2000 }).catch(() => false)
      || await page.locator('[class*="story"]').first().isVisible({ timeout: 2000 }).catch(() => false);

    // Try clicking through story
    for (let i = 0; i < 15; i++) {
      await page.click('body').catch(() => {});
      await page.waitForTimeout(500);
      // Check if we've reached campaign map
      const mapVisible = await page.locator('text=Act 1').first().isVisible().catch(() => false)
        || await page.locator('text=White Belt').first().isVisible().catch(() => false)
        || await page.locator('text=FIGHT').first().isVisible().catch(() => false);
      if (mapVisible) {
        log('campaign_story', 'pass', 'Story completed, reached map/next screen');
        break;
      }
    }

    await page.screenshot({ path: 'test-results/audit-campaign-map.png' });

    // Check for campaign map
    const mapEl = await page.locator('text=Act 1').first().isVisible({ timeout: 3000 }).catch(() => false)
      || await page.locator('text=White Belt').first().isVisible({ timeout: 2000 }).catch(() => false);
    if (mapEl) log('campaign_map', 'pass', 'Campaign map visible');
    else log('campaign_map', 'warn', 'Campaign map not clearly visible');

    // Try to start a fight
    const fightBtn = page.locator('button:has-text("FIGHT")').first();
    if (await fightBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await fightBtn.click();
      await page.waitForTimeout(2000);
      log('campaign_fight', 'pass', 'Fight button clicked');
    } else {
      // Try clicking any numbered fight node
      const anyBtn = page.locator('button').filter({ hasText: /1|Fight|Start/ }).first();
      if (await anyBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await anyBtn.click();
        await page.waitForTimeout(2000);
      }
    }

    await page.screenshot({ path: 'test-results/audit-campaign-fight.png' });

    const critical = filterCritical(errors);
    if (critical.length > 0) log('campaign', 'fail', `JS errors: ${critical.join(' | ')}`);
    else log('campaign', 'pass', 'No JS errors in campaign flow');
  });

  test('A5 — Training mode', async ({ page }) => {
    const errors = await collectErrors(page);
    await goToTitle(page);
    await page.locator('text=Training').click();
    await page.waitForTimeout(500);

    const selectVisible = await page.locator('text=FIGHTER').first().isVisible({ timeout: 3000 }).catch(() => false);
    if (selectVisible) log('training', 'pass', 'Training char select loaded');
    else log('training', 'fail', 'Training char select NOT loaded');

    const critical = filterCritical(errors);
    if (critical.length > 0) log('training', 'fail', `JS errors: ${critical.join(' | ')}`);
    else log('training', 'pass', 'No JS errors');
  });

  test('A6 — Mini-Games screen and each mini-game', async ({ page }) => {
    const errors = await collectErrors(page);
    await goToTitle(page);
    await page.locator('text=Mini-Games').click();
    await page.waitForTimeout(500);

    const heading = await page.locator('text=Mini-Games').first().isVisible({ timeout: 3000 }).catch(() => false);
    if (heading) log('mini_games', 'pass', 'Mini-Games screen loaded');
    else log('mini_games', 'fail', 'Mini-Games screen NOT loaded');

    await page.screenshot({ path: 'test-results/audit-minigames.png' });

    // Test each mini-game
    const games = [
      'Catch the Mouthguard', 'Clean the Mats', 'Belt Whipping Gauntlet',
      'Wash Your Gi', "Don't Get Stacked", 'Tape Your Fingers'
    ];

    for (const game of games) {
      // Navigate to mini-games screen
      await goToTitle(page);
      await page.locator('text=Mini-Games').click();
      await page.waitForTimeout(500);

      const gameBtn = page.locator(`text=${game}`).first();
      if (await gameBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Clear errors before each game
        const gameErrors: string[] = [];
        const handler = (err: Error) => gameErrors.push(err.message);
        page.on('pageerror', handler);

        await gameBtn.click();
        await page.waitForTimeout(2000);

        await page.screenshot({ path: `test-results/audit-minigame-${game.replace(/[^a-z]/gi, '_').toLowerCase()}.png` });

        // Check if game loaded (no error box visible)
        const errorBox = await page.locator('#error-box').evaluate(el => window.getComputedStyle(el).display).catch(() => 'unknown');
        const hasBodyContent = await page.locator('body').innerText().catch(() => '');

        const criticalGameErrors = filterCritical(gameErrors);
        if (criticalGameErrors.length > 0) {
          log(`minigame_${game}`, 'fail', `JS errors: ${criticalGameErrors.join(' | ')}`);
        } else if (errorBox === 'block') {
          log(`minigame_${game}`, 'fail', 'Error box visible — game crashed');
        } else {
          log(`minigame_${game}`, 'pass', 'Mini-game loaded without errors');
        }

        // Try to go back
        const backBtn = page.locator('button:has-text("Back")').first();
        if (await backBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await backBtn.click();
          await page.waitForTimeout(300);
        }

        page.removeListener('pageerror', handler);
      } else {
        log(`minigame_${game}`, 'fail', 'Mini-game button not found');
      }
    }

    // Test side-scrollers
    await goToTitle(page);
    await page.locator('text=Mini-Games').click();
    await page.waitForTimeout(500);

    const sideScrollers = ['Run to the Gym', 'Parking Lot Escape', 'Mat Dash', 'Belt Promotion Run', 'Post-Training Limp'];
    for (const ss of sideScrollers) {
      const ssBtn = page.locator(`text=${ss}`).first();
      if (await ssBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        const ssErrors: string[] = [];
        const handler2 = (err: Error) => ssErrors.push(err.message);
        page.on('pageerror', handler2);

        await ssBtn.click();
        await page.waitForTimeout(2000);

        await page.screenshot({ path: `test-results/audit-sidescroller-${ss.replace(/[^a-z]/gi, '_').toLowerCase()}.png` });

        // Try interacting — click/tap
        await page.keyboard.press('Space').catch(() => {});
        await page.waitForTimeout(500);
        await page.keyboard.press('ArrowDown').catch(() => {});
        await page.waitForTimeout(500);

        const criticalSSErrors = filterCritical(ssErrors);
        if (criticalSSErrors.length > 0) {
          log(`sidescroller_${ss}`, 'fail', `JS errors: ${criticalSSErrors.join(' | ')}`);
        } else {
          log(`sidescroller_${ss}`, 'pass', 'Side-scroller loaded and interactive');
        }

        // Go back — skip button
        const skipBtn = page.locator('button:has-text("Skip")').first();
        if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await skipBtn.click();
          await page.waitForTimeout(500);
        }

        // Navigate back to mini-games
        await goToTitle(page);
        await page.locator('text=Mini-Games').click();
        await page.waitForTimeout(500);

        page.removeListener('pageerror', handler2);
      } else {
        log(`sidescroller_${ss}`, 'warn', 'Side-scroller button not found on screen');
      }
    }
  });

  test('A7 — Moves/Loadout screen', async ({ page }) => {
    const errors = await collectErrors(page);
    await goToTitle(page);
    await page.locator('text=Moves').click();
    await page.waitForTimeout(500);

    const heading = await page.locator('text=Move Loadout').first().isVisible({ timeout: 3000 }).catch(() => false);
    if (heading) log('loadout', 'pass', 'Loadout screen loaded');
    else log('loadout', 'fail', 'Loadout screen NOT loaded');

    await page.screenshot({ path: 'test-results/audit-loadout.png' });

    // Try clicking position tabs
    const positions = ['Standing', 'Clinch', 'Open Guard', 'Closed Guard', 'Half Guard', 'Mount', 'Back Control'];
    for (const pos of positions) {
      const posBtn = page.locator(`button:has-text("${pos}")`).first();
      if (await posBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await posBtn.click();
        await page.waitForTimeout(300);
        log('loadout', 'pass', `Position tab "${pos}" clickable`);
      }
    }

    const critical = filterCritical(errors);
    if (critical.length > 0) log('loadout', 'fail', `JS errors: ${critical.join(' | ')}`);
    else log('loadout', 'pass', 'No JS errors on loadout screen');
  });

  test('A8 — Skills screen', async ({ page }) => {
    const errors = await collectErrors(page);
    await goToTitle(page);
    await page.locator('text=Skills').click();
    await page.waitForTimeout(500);

    const heading = await page.locator('text=Skill Tree').first().isVisible({ timeout: 3000 }).catch(() => false);
    if (heading) log('skills', 'pass', 'Skills screen loaded');
    else log('skills', 'fail', 'Skills screen NOT loaded');

    await page.screenshot({ path: 'test-results/audit-skills.png' });

    const critical = filterCritical(errors);
    if (critical.length > 0) log('skills', 'fail', `JS errors: ${critical.join(' | ')}`);
    else log('skills', 'pass', 'No JS errors on skills screen');
  });

  test('A9 — Fight gameplay deep test', async ({ page }) => {
    const errors = await collectErrors(page);
    await goToTitle(page);
    await page.locator('text=Arcade').click();
    await page.waitForTimeout(500);
    await page.locator('text=Marcus').first().click();
    await page.waitForTimeout(500);
    const selectBtn = page.locator('button:has-text("SELECT")').first();
    if (await selectBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await selectBtn.click();
      await page.waitForTimeout(500);
    }
    // Pick easiest difficulty
    const diffBtn = page.locator('button').filter({ hasText: /White Belt|Easy/ }).first();
    if (await diffBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await diffBtn.click();
    }
    await page.waitForTimeout(2000);

    // Complete grip fight
    const gripBtn = page.locator('button:has-text("FIGHT FOR GRIP")');
    for (let i = 0; i < 30; i++) {
      if (!await gripBtn.isVisible().catch(() => false)) break;
      await gripBtn.click({ force: true }).catch(() => {});
      await page.waitForTimeout(200);
    }
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'test-results/audit-fight-gameplay.png' });

    // Play 5 turns
    for (let turn = 0; turn < 5; turn++) {
      const moveButtons = page.locator('button').filter({ hasText: /Takedown|Snap|Pull|Breathe|Arm Drag|Pass|Sweep|Escape|Turn In|Slide Out|Choke|Triangle|Armbar/ });
      const btn = moveButtons.first();
      if (await btn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await btn.click().catch(() => {});
        await page.waitForTimeout(2000);
        // Try completing minigame
        await page.keyboard.press('Space').catch(() => {});
        await page.waitForTimeout(1000);
        const tapBtn = page.locator('button:has-text("TAP")').first();
        if (await tapBtn.isVisible({ timeout: 500 }).catch(() => false)) {
          for (let t = 0; t < 10; t++) {
            await tapBtn.click().catch(() => {});
            await page.waitForTimeout(100);
          }
        }
        await page.waitForTimeout(2000);
        log('fight', 'pass', `Turn ${turn + 1} played`);
      }

      // Check if fight ended
      const ended = await page.locator('text=Rematch').first().isVisible({ timeout: 500 }).catch(() => false);
      if (ended) {
        log('fight', 'pass', 'Fight completed (result screen reached)');
        await page.screenshot({ path: 'test-results/audit-fight-result.png' });
        break;
      }
    }

    const critical = filterCritical(errors);
    if (critical.length > 0) log('fight', 'fail', `JS errors during fight: ${critical.join(' | ')}`);
    else log('fight', 'pass', 'No JS errors during fight gameplay');
  });

  test('A10 — Mobile viewport audit', async ({ browser }) => {
    const context = await browser.newContext({ hasTouch: true, viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const errors = await collectErrors(page);

    await waitForGame(page);
    await page.screenshot({ path: 'test-results/audit-mobile-splash.png' });

    // Tap to dismiss splash
    await page.tap('body');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/audit-mobile-title.png' });

    const title = await page.locator('h1:has-text("LOCKDOWN")').isVisible({ timeout: 5000 }).catch(() => false);
    if (title) log('mobile_title', 'pass', 'Title screen loads on mobile');
    else log('mobile_title', 'fail', 'Title screen NOT loading on mobile');

    // Check no horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    if (scrollWidth <= clientWidth + 5) log('mobile_scroll', 'pass', 'No horizontal scroll');
    else log('mobile_scroll', 'fail', `Horizontal scroll detected: ${scrollWidth} > ${clientWidth}`);

    // Navigate to arcade
    await page.locator('text=Arcade').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/audit-mobile-arcade.png' });

    // Navigate to campaign
    const backBtn = page.locator('button:has-text("Back")').first();
    if (await backBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await backBtn.click();
      await page.waitForTimeout(500);
    }
    await page.locator('text=Campaign').click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/audit-mobile-campaign.png' });

    // Mini-games
    await goToTitle(page);
    await page.locator('text=Mini-Games').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/audit-mobile-minigames.png' });

    const critical = filterCritical(errors);
    if (critical.length > 0) log('mobile', 'fail', `JS errors on mobile: ${critical.join(' | ')}`);
    else log('mobile', 'pass', 'No JS errors on mobile viewport');

    await context.close();
  });

  test('A11 — Back navigation from all screens', async ({ page }) => {
    const errors = await collectErrors(page);
    const screens = [
      { name: 'Skills', click: 'text=Skills', expect: 'Skill Tree' },
      { name: 'Moves', click: 'text=Moves', expect: 'Move Loadout' },
      { name: 'Mini-Games', click: 'text=Mini-Games', expect: 'Mini-Games' },
      { name: 'Arcade', click: 'text=Arcade', expect: 'FIGHTER' },
      { name: 'Training', click: 'text=Training', expect: 'FIGHTER' },
    ];

    for (const s of screens) {
      await goToTitle(page);
      await page.locator(s.click).click();
      await page.waitForTimeout(500);
      const loaded = await page.locator(`text=${s.expect}`).first().isVisible({ timeout: 3000 }).catch(() => false);
      if (loaded) log(`nav_${s.name}`, 'pass', `${s.name} screen loaded`);
      else log(`nav_${s.name}`, 'fail', `${s.name} screen NOT loaded (expected "${s.expect}")`);

      // Click back
      const backBtn = page.locator('button:has-text("Back")').first();
      if (await backBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await backBtn.click();
        await page.waitForTimeout(500);
        const backToTitle = await page.locator('text=Campaign').first().isVisible({ timeout: 3000 }).catch(() => false);
        if (backToTitle) log(`nav_${s.name}_back`, 'pass', 'Back to title works');
        else log(`nav_${s.name}_back`, 'fail', 'Back button did NOT return to title');
      } else {
        log(`nav_${s.name}_back`, 'warn', 'No Back button found');
      }
    }

    const critical = filterCritical(errors);
    if (critical.length > 0) log('navigation', 'fail', `JS errors: ${critical.join(' | ')}`);
  });

  // After all tests, write report (in the last test)
  test.afterAll(async () => {
    const fs = require('fs');
    const path = require('path');

    let md = '# LOCKDOWN — Full Game Audit Report\n\n';
    md += `**Date:** ${new Date().toISOString().split('T')[0]}\n`;
    md += `**Tests run:** ${results.length} checks\n\n`;

    const passes = results.filter(r => r.status === 'pass').length;
    const fails = results.filter(r => r.status === 'fail').length;
    const warns = results.filter(r => r.status === 'warn').length;

    md += `## Summary\n\n`;
    md += `| Status | Count |\n|--------|-------|\n`;
    md += `| PASS | ${passes} |\n`;
    md += `| FAIL | ${fails} |\n`;
    md += `| WARN | ${warns} |\n\n`;

    if (fails > 0) {
      md += `## Failures\n\n`;
      for (const r of results.filter(r => r.status === 'fail')) {
        md += `- **${r.screen}:** ${r.detail}\n`;
      }
      md += '\n';
    }

    if (warns > 0) {
      md += `## Warnings\n\n`;
      for (const r of results.filter(r => r.status === 'warn')) {
        md += `- **${r.screen}:** ${r.detail}\n`;
      }
      md += '\n';
    }

    md += `## All Results\n\n`;
    md += `| Screen | Status | Detail |\n|--------|--------|--------|\n`;
    for (const r of results) {
      md += `| ${r.screen} | ${r.status.toUpperCase()} | ${r.detail} |\n`;
    }

    const reportPath = path.join(__dirname, '..', 'LOCKDOWN_AUDIT_REPORT.md');
    fs.writeFileSync(reportPath, md);
    console.log(`\nAudit report written to: ${reportPath}`);
  });
});
