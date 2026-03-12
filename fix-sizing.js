// fix-sizing.js — Fix Adele portrait framing + Marcus ground shadow
const fs = require('fs');
const sharp = require('sharp');

const HTML_PATH = './lockdown-deploy/index.html';

async function main() {
  let html = fs.readFileSync(HTML_PATH, 'utf8');

  // === Fix 1: Crop Adele's portrait to upper 60% (head to thighs, matching Marcus framing) ===
  console.log('=== Cropping Adele portrait ===');
  const adeleRegex = /"artwork_adele_portrait":"data:image\/webp;base64,([^"]+)"/;
  const adeleMatch = html.match(adeleRegex);
  if (adeleMatch) {
    const buf = Buffer.from(adeleMatch[1], 'base64');
    const meta = await sharp(buf).metadata();
    console.log(`  Original: ${meta.width}x${meta.height}`);

    // Crop: keep top 62% (head to mid-thigh)
    const cropH = Math.round(meta.height * 0.62);
    const cropped = await sharp(buf)
      .extract({ left: 0, top: 0, width: meta.width, height: cropH })
      .webp({ quality: 85, alphaQuality: 100 })
      .toBuffer();
    const meta2 = await sharp(cropped).metadata();
    console.log(`  Cropped: ${meta2.width}x${meta2.height} (ratio: ${(meta2.width/meta2.height).toFixed(2)})`);
    console.log(`  At 200px height: ${Math.round(meta2.width * 200 / meta2.height)}px wide`);

    const newB64 = cropped.toString('base64');
    html = html.replace(adeleRegex, `"artwork_adele_portrait":"data:image/webp;base64,${newB64}"`);
  }

  // === Fix 2: Remove ground shadow from Marcus sprites more aggressively ===
  console.log('\n=== Removing Marcus ground shadows ===');
  const marcusKeys = ['marcus_idle', 'marcus_idle2', 'marcus_effort', 'marcus_tired', 'marcus_hit', 'marcus_win', 'marcus_lose', 'marcus_tapOut'];

  for (const key of marcusKeys) {
    const regex = new RegExp(`"${key}":"data:image/webp;base64,([^"]+)"`);
    const m = html.match(regex);
    if (!m) continue;

    const buf = Buffer.from(m[1], 'base64');
    const meta = await sharp(buf).metadata();
    const { width: w, height: h } = meta;
    const raw = await sharp(buf).ensureAlpha().raw().toBuffer();
    const pixels = new Uint8Array(raw);

    // Scan bottom 25% for gray/shadow pixels and remove them
    let removed = 0;
    const startY = Math.floor(h * 0.75);
    for (let y = startY; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        if (pixels[idx + 3] === 0) continue;
        const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2];
        // Remove gray shadow pixels (low saturation, medium brightness)
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const sat = max === 0 ? 0 : (max - min) / max;
        const brightness = (r + g + b) / 3;
        // Shadow: grayish (low sat), medium brightness
        if (sat < 0.3 && brightness > 80 && brightness < 220) {
          // Check if this pixel is isolated (many transparent neighbors)
          let tCount = 0, total = 0;
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              const ny = y + dy, nx = x + dx;
              if (ny < 0 || ny >= h || nx < 0 || nx >= w) continue;
              total++;
              if (pixels[(ny * w + nx) * 4 + 3] === 0) tCount++;
            }
          }
          // If more than 30% of neighbors are transparent, it's likely shadow not body
          if (tCount / total > 0.3) {
            pixels[idx + 3] = 0;
            removed++;
          }
        }
      }
    }

    if (removed > 0) {
      const out = await sharp(Buffer.from(pixels.buffer), { raw: { width: w, height: h, channels: 4 } })
        .trim()
        .webp({ quality: 85, alphaQuality: 100 })
        .toBuffer();
      const meta2 = await sharp(out).metadata();
      const newB64 = out.toString('base64');
      html = html.replace(regex, `"${key}":"data:image/webp;base64,${newB64}"`);
      console.log(`  ${key}: removed ${removed} shadow px, ${w}x${h} -> ${meta2.width}x${meta2.height}`);
    } else {
      console.log(`  ${key}: no shadow pixels found`);
    }
  }

  // === Fix 3: Do same for Yuki sprites ===
  console.log('\n=== Removing Yuki ground shadows ===');
  const yukiKeys = ['yuki_idle', 'yuki_idle2', 'yuki_effort', 'yuki_tired', 'yuki_hit', 'yuki_win', 'yuki_lose', 'yuki_tapOut'];
  for (const key of yukiKeys) {
    const regex = new RegExp(`"${key}":"data:image/webp;base64,([^"]+)"`);
    const m = html.match(regex);
    if (!m) continue;
    const buf = Buffer.from(m[1], 'base64');
    const meta = await sharp(buf).metadata();
    const { width: w, height: h } = meta;
    const raw = await sharp(buf).ensureAlpha().raw().toBuffer();
    const pixels = new Uint8Array(raw);
    let removed = 0;
    const startY = Math.floor(h * 0.75);
    for (let y = startY; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        if (pixels[idx + 3] === 0) continue;
        const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2];
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const sat = max === 0 ? 0 : (max - min) / max;
        const brightness = (r + g + b) / 3;
        if (sat < 0.3 && brightness > 80 && brightness < 220) {
          let tCount = 0, total = 0;
          for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
              const ny = y + dy, nx = x + dx;
              if (ny < 0 || ny >= h || nx < 0 || nx >= w) continue;
              total++;
              if (pixels[(ny * w + nx) * 4 + 3] === 0) tCount++;
            }
          }
          if (tCount / total > 0.3) {
            pixels[idx + 3] = 0;
            removed++;
          }
        }
      }
    }
    if (removed > 0) {
      const out = await sharp(Buffer.from(pixels.buffer), { raw: { width: w, height: h, channels: 4 } })
        .trim()
        .webp({ quality: 85, alphaQuality: 100 })
        .toBuffer();
      const meta2 = await sharp(out).metadata();
      const newB64 = out.toString('base64');
      html = html.replace(regex, `"${key}":"data:image/webp;base64,${newB64}"`);
      console.log(`  ${key}: removed ${removed} shadow px, ${w}x${h} -> ${meta2.width}x${meta2.height}`);
    }
  }

  fs.writeFileSync(HTML_PATH, html, 'utf8');
  console.log('\nDone!');
}

main().catch(console.error);
