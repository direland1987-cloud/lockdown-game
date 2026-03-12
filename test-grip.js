const puppeteer = require('puppeteer');
const path = require('path');
(async () => {
  const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const p = await b.newPage();
  await p.setViewport({ width: 600, height: 800 });
  const u = 'file:///' + path.resolve('./lockdown-deploy/index.html').split('\\').join('/');
  await p.goto(u, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  await p.click('body');
  await new Promise(r => setTimeout(r, 2000));
  await p.evaluate(() => { document.querySelectorAll('button').forEach(b => { if (b.textContent.includes('Choose')) b.click(); }); });
  await new Promise(r => setTimeout(r, 1000));
  await p.evaluate(() => { [...document.querySelectorAll('div')].forEach(d => { if (d.textContent.includes('Adele') && d.offsetHeight < 200 && d.className && d.className.includes('cursor')) d.click(); }); });
  await new Promise(r => setTimeout(r, 500));
  await p.evaluate(() => { document.querySelectorAll('button').forEach(b => { if (b.textContent.includes('SELECT')) b.click(); }); });
  await new Promise(r => setTimeout(r, 1000));
  await p.evaluate(() => { document.querySelectorAll('button').forEach(b => { if (b.textContent.includes('White Belt')) b.click(); }); });
  await new Promise(r => setTimeout(r, 2000));
  await p.screenshot({ path: './test-screenshots/grip-fight-fixed.png' });
  console.log('Grip fight captured');
  // Mash to get through grip fight
  for (let i = 0; i < 40; i++) { await p.keyboard.press('Space'); await new Promise(r => setTimeout(r, 40)); }
  await new Promise(r => setTimeout(r, 3000));
  await p.screenshot({ path: './test-screenshots/standing-fixed.png' });
  console.log('Standing captured');
  await b.close();
})();
