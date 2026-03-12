const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 500, height: 900 });

  const htmlPath = 'file:///' + path.resolve('./lockdown-deploy/index.html').replace(/\\/g, '/');
  await page.goto(htmlPath, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  // Dismiss splash
  await page.click('body');
  await new Promise(r => setTimeout(r, 2000));

  // Choose Fighter
  await page.evaluate(() => {
    document.querySelectorAll('button').forEach(b => {
      if (b.textContent.includes('Choose')) b.click();
    });
  });
  await new Promise(r => setTimeout(r, 1000));

  // Click on Adele's card to select her as player
  await page.evaluate(() => {
    const divs = [...document.querySelectorAll('div[class*="cursor-pointer"]')];
    // Find divs that contain "Adele" text
    for (const d of divs) {
      if (d.textContent.includes('Adele') && d.offsetHeight < 200) {
        d.click();
        return 'clicked adele card';
      }
    }
    return 'not found';
  });
  await new Promise(r => setTimeout(r, 500));

  // Click SELECT button
  await page.evaluate(() => {
    document.querySelectorAll('button').forEach(b => {
      if (b.textContent.includes('SELECT')) b.click();
    });
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: './test-screenshots/adele-difficulty.png' });
  console.log('Difficulty screen captured');

  // Start easy fight
  await page.evaluate(() => {
    document.querySelectorAll('button').forEach(b => {
      if (b.textContent.includes('White Belt')) b.click();
    });
  });
  await new Promise(r => setTimeout(r, 2000));

  // Mash for grip fight
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Space');
    await new Promise(r => setTimeout(r, 40));
  }
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: './test-screenshots/adele-fight.png' });
  console.log('Fight screen captured');

  // Check sprite info
  const spriteInfo = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')];
    return imgs.map(i => ({
      alt: i.alt,
      displayW: i.offsetWidth,
      displayH: i.offsetHeight,
      naturalW: i.naturalWidth,
      naturalH: i.naturalHeight,
      anim: getComputedStyle(i).animationName
    }));
  });
  console.log('Sprite info:', JSON.stringify(spriteInfo, null, 2));

  await browser.close();
})();
