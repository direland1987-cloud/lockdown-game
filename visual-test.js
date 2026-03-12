// visual-test.js — Renders the game at various states and captures screenshots
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const HTML_PATH = path.resolve('./lockdown-deploy/index.html');
const SCREENSHOT_DIR = './test-screenshots';

async function clickText(page, text) {
  return page.evaluate((t) => {
    const els = [...document.querySelectorAll('button, div, span')];
    const el = els.find(e => e.textContent.includes(t) && (e.tagName === 'BUTTON' || e.onclick || e.style.cursor === 'pointer'));
    if (el) { el.click(); return true; }
    // Try just clicking anything with that text
    const any = els.find(e => e.textContent.trim() === t);
    if (any) { any.click(); return true; }
    return false;
  }, text);
}

async function clickButton(page, textMatch) {
  return page.evaluate((t) => {
    const buttons = [...document.querySelectorAll('button')];
    const btn = buttons.find(b => b.textContent.toLowerCase().includes(t.toLowerCase()));
    if (btn) { btn.click(); return btn.textContent.trim().substring(0, 40); }
    return null;
  }, textMatch);
}

async function main() {
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 500, height: 900 });

  console.log('Loading game...');
  await page.goto('file:///' + HTML_PATH.replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 30000 });
  await page.waitForSelector('#root', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 3000)); // Wait for splash animation

  // Screenshot: Splash
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-splash.png') });
  console.log('1. Splash captured');

  // Click anywhere to dismiss splash
  await page.click('body');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-title.png') });
  console.log('2. Title captured');

  // Click "Choose Fighter"
  let r = await clickButton(page, 'Choose Fighter');
  console.log('   Clicked:', r);
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-select.png') });
  console.log('3. Character select captured');

  // Click SELECT ADELE or any SELECT button
  r = await clickButton(page, 'SELECT');
  console.log('   Clicked:', r);
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-difficulty.png') });
  console.log('4. Difficulty screen captured');

  // Click Easy difficulty
  r = await page.evaluate(() => {
    const buttons = [...document.querySelectorAll('button')];
    const easy = buttons.find(b => b.textContent.includes('Easy') || b.textContent.includes('Beginner'));
    if (easy) { easy.click(); return easy.textContent.trim().substring(0, 40); }
    // Click first button with a difficulty color
    const diff = buttons.find(b => b.textContent.includes('Belt'));
    if (diff) { diff.click(); return diff.textContent.trim().substring(0, 40); }
    return null;
  });
  console.log('   Clicked:', r);
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-grip-fight.png') });
  console.log('5. Grip fight captured');

  // Mash keys to win grip fight
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press('Space');
    await new Promise(r => setTimeout(r, 50));
  }
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-standing.png') });
  console.log('6. Standing/fight screen captured');

  // Wait a few seconds to capture breathing/blinking
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-idle-after-wait.png') });
  console.log('7. Idle (after 4s wait) captured');

  // Check animation state on fighter sprites
  const animCheck = await page.evaluate(() => {
    const results = { elements: [] };
    // Check all img elements for animation
    document.querySelectorAll('img').forEach(img => {
      const cs = getComputedStyle(img);
      results.elements.push({
        alt: img.alt,
        src: img.src.substring(0, 50),
        animName: cs.animationName,
        animDur: cs.animationDuration,
        animState: cs.animationPlayState,
        width: img.offsetWidth,
        height: img.offsetHeight
      });
    });
    // Check divs with animation
    document.querySelectorAll('div').forEach(div => {
      const cs = getComputedStyle(div);
      if (cs.animationName && cs.animationName !== 'none') {
        const cls = div.className || '';
        if (cls.includes('anim-') || cls.includes('arena-')) {
          results.elements.push({
            tag: 'div',
            class: cls.substring(0, 60),
            animName: cs.animationName,
            animDur: cs.animationDuration
          });
        }
      }
    });
    return results;
  });
  console.log('\n=== Animation State ===');
  animCheck.elements.forEach(e => {
    if (e.animName && e.animName !== 'none') {
      console.log(`  ${e.alt||e.class||e.tag}: animation=${e.animName} duration=${e.animDur} ${e.width?`size=${e.width}x${e.height}`:''}`);
    }
  });
  if (animCheck.elements.filter(e => e.animName && e.animName !== 'none').length === 0) {
    console.log('  NO ANIMATIONS FOUND ON ANY ELEMENT');
  }

  // Also check the arena background
  const arenaCheck = await page.evaluate(() => {
    const arenaEl = document.querySelector('[class*="rounded-xl"][class*="relative"]');
    if (!arenaEl) return { found: false };
    const cs = getComputedStyle(arenaEl);
    return {
      found: true,
      background: cs.background?.substring(0, 100),
      borderColor: cs.borderColor,
      boxShadow: cs.boxShadow?.substring(0, 100)
    };
  });
  console.log('\n=== Arena Check ===');
  console.log(JSON.stringify(arenaCheck, null, 2));

  await browser.close();
  console.log(`\nScreenshots saved to ${SCREENSHOT_DIR}/`);
}

main().catch(e => { console.error(e); process.exit(1); });
