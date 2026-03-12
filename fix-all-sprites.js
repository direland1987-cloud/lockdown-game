// fix-all-sprites.js — Comprehensive sprite fix:
// 1. Re-process artwork from ORIGINAL PNGs with aggressive BG removal
// 2. Auto-trim all transparent borders from all images
// 3. Remove ground shadows from individual sprites
// 4. Process SPRITE_DATA entries too (Marcus/Yuki ground shadows)

const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

const HTML_PATH = './lockdown-deploy/index.html';
const ARTWORK_DIR = './Final Artwork/Accepted/Marcus Adele';

async function floodFillRemoveBG(inputBuf, aggressive = false) {
  const image = sharp(inputBuf);
  const meta = await image.metadata();
  const { width: w, height: h } = meta;
  const raw = await image.ensureAlpha().raw().toBuffer();
  const pixels = new Uint8Array(raw);

  const visited = new Uint8Array(w * h);

  // Thresholds - more aggressive for artwork
  const WHITE_THRESH = aggressive ? 200 : 210;
  const GRAY_THRESH = aggressive ? 165 : 185;
  const GRAY_SAT = aggressive ? 40 : 30;

  const isBackground = (idx) => {
    const r = pixels[idx], g = pixels[idx+1], b = pixels[idx+2], a = pixels[idx+3];
    if (a < 10) return true;
    if (r >= WHITE_THRESH && g >= WHITE_THRESH && b >= WHITE_THRESH) return true;
    if (r >= GRAY_THRESH && g >= GRAY_THRESH && b >= GRAY_THRESH) {
      const max = Math.max(r,g,b), min = Math.min(r,g,b);
      if (max - min < GRAY_SAT) return true;
    }
    return false;
  };

  // BFS flood fill from all edges
  const queue = [];
  const seed = (x, y) => {
    const pi = y * w + x;
    if (!visited[pi] && isBackground(pi * 4)) {
      visited[pi] = 1;
      queue.push(pi);
    }
  };

  for (let x = 0; x < w; x++) { seed(x, 0); seed(x, h-1); }
  for (let y = 0; y < h; y++) { seed(0, y); seed(w-1, y); }

  let removed = 0;
  while (queue.length > 0) {
    const pi = queue.shift();
    const idx = pi * 4;
    pixels[idx + 3] = 0;
    removed++;
    const x = pi % w, y = Math.floor(pi / w);
    if (x > 0) seed(x-1, y);
    if (x < w-1) seed(x+1, y);
    if (y > 0) seed(x, y-1);
    if (y < h-1) seed(x, y+1);
  }

  // Second pass: remove isolated light patches (ground shadows not connected to edges)
  // Scan bottom 30% of image for remaining light gray pixels
  const bottomStart = Math.floor(h * 0.65);
  for (let y = bottomStart; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const pi = y * w + x;
      const idx = pi * 4;
      if (pixels[idx+3] === 0) continue;
      const r = pixels[idx], g = pixels[idx+1], b = pixels[idx+2];
      // Check if this pixel is a gray shadow (not saturated, medium-light)
      if (r >= 140 && g >= 140 && b >= 140) {
        const max = Math.max(r,g,b), min = Math.min(r,g,b);
        if (max - min < 50) {
          // Check if surrounded mostly by transparent pixels
          let transparentCount = 0, totalNeighbors = 0;
          for (let dy = -3; dy <= 3; dy++) {
            for (let dx = -3; dx <= 3; dx++) {
              const nx = x + dx, ny = y + dy;
              if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
              totalNeighbors++;
              if (pixels[(ny * w + nx) * 4 + 3] === 0) transparentCount++;
            }
          }
          if (transparentCount / totalNeighbors > 0.4) {
            pixels[idx+3] = 0;
            removed++;
          }
        }
      }
    }
  }

  // Anti-alias edges
  for (let y = 1; y < h-1; y++) {
    for (let x = 1; x < w-1; x++) {
      const pi = y * w + x;
      const idx = pi * 4;
      if (pixels[idx+3] === 0) continue;
      let tCount = 0;
      const ns = [[x-1,y],[x+1,y],[x,y-1],[x,y+1]];
      for (const [nx,ny] of ns) {
        if (pixels[(ny*w+nx)*4+3] === 0) tCount++;
      }
      if (tCount > 0) {
        const r = pixels[idx], g = pixels[idx+1], b = pixels[idx+2];
        if (r >= 190 && g >= 190 && b >= 190) {
          pixels[idx+3] = Math.round(pixels[idx+3] * 0.2);
        } else if (tCount >= 2) {
          pixels[idx+3] = Math.round(pixels[idx+3] * 0.65);
        }
      }
    }
  }

  return { pixels: Buffer.from(pixels.buffer), width: w, height: h, removed };
}

async function trimAndEncode(pixelBuf, w, h) {
  // Use sharp to trim transparent borders and encode as WebP
  const trimmed = await sharp(pixelBuf, { raw: { width: w, height: h, channels: 4 } })
    .trim() // removes transparent borders
    .webp({ quality: 85, alphaQuality: 100 })
    .toBuffer();
  return trimmed;
}

async function main() {
  let html = fs.readFileSync(HTML_PATH, 'utf8');
  let changes = 0;

  // === STEP 1: Re-process ARTWORK_DATA from original PNGs ===
  console.log('\n=== STEP 1: Processing ARTWORK_DATA from original PNGs ===');

  // Map artwork keys to source PNG files
  const artworkPngMap = {
    'artwork_closedguard_marcus_top': 'Closed guard_Marcus_Adele.png',
    'artwork_closedguard_adele_top': 'Closed Guard_Adele_Marcus.png',
    'artwork_halfguard_marcus_top': 'Half Guard_Marcus_Adele.png',
    'artwork_halfguard_adele_top': 'Half Guard_Adele_Marcus.png',
    'artwork_openguard_marcus_top': 'Open Guard_Marcus_Adele.png',
    'artwork_openguard_adele_top': 'Open Guard_Adele_Marcus.png',
    'artwork_sidecontrol_marcus_top': 'Side Control_Marcus_Adele.png',
    'artwork_sidecontrol_adele_top': 'Side Control_Adele_Marcus.png',
    'artwork_mount_marcus_top': 'Mount_Marcus_Adele.png',
    'artwork_mount_adele_top': 'Mount_Adele_Marcus.png',
    'artwork_butterflyguard_marcus_top': 'Butterfly Guard_Marcus_Adele.png',
    'artwork_butterflyguard_adele_top': 'Butterfly Guard_Adele_Marcus.png',
    'artwork_backcontrol_marcus_top': 'Back control_Marcus_Adele.png',
    'artwork_backcontrol_adele_top': 'Back Control_Adele_Marcus.png',
    'artwork_ashi_marcus_top': 'Ashi Garami_marcus_Adele.png',
    'artwork_ashi_adele_top': 'Ashi Garami_Adele_Marcus.png',
    'artwork_clinch_marcus_adele': 'Clinch_Adele_Marcus.png',
  };

  // Portraits and faces - check in various locations
  const portraitMap = {
    'artwork_marcus_portrait': ['./Final Artwork/Marcus.png', './Final Artwork/Accepted/References/Characaters/Marcus.png'],
    'artwork_adele_portrait': ['./Final Artwork/Adele.png', './Final Artwork/Accepted/References/Characaters/Adele.png'],
  };

  // Process position artwork from original PNGs
  for (const [key, filename] of Object.entries(artworkPngMap)) {
    const pngPath = path.join(ARTWORK_DIR, filename);
    if (!fs.existsSync(pngPath)) {
      console.log(`  SKIP ${key}: ${filename} not found`);
      continue;
    }
    console.log(`  Processing ${key} from ${filename}`);
    try {
      const inputBuf = fs.readFileSync(pngPath);
      const { pixels, width, height, removed } = await floodFillRemoveBG(inputBuf, true);
      const webpBuf = await trimAndEncode(pixels, width, height);
      const meta2 = await sharp(webpBuf).metadata();
      const newBase64 = webpBuf.toString('base64');
      const newEntry = `"${key}":"data:image/webp;base64,${newBase64}"`;
      const regex = new RegExp(`"${key}":"data:image/webp;base64,[^"]+"`);
      if (regex.test(html)) {
        html = html.replace(regex, newEntry);
        console.log(`    ${width}x${height} -> ${meta2.width}x${meta2.height} trimmed, removed ${removed} bg px, ${Math.round(newBase64.length/1024)}KB`);
        changes++;
      }
    } catch (err) {
      console.error(`    ERROR: ${err.message}`);
    }
  }

  // Process portraits from original PNGs
  for (const [key, paths] of Object.entries(portraitMap)) {
    let pngPath = null;
    for (const p of paths) {
      if (fs.existsSync(p)) { pngPath = p; break; }
    }
    if (!pngPath) {
      console.log(`  SKIP ${key}: no source PNG found`);
      continue;
    }
    console.log(`  Processing ${key} from ${pngPath}`);
    try {
      const inputBuf = fs.readFileSync(pngPath);
      const { pixels, width, height, removed } = await floodFillRemoveBG(inputBuf, true);
      const webpBuf = await trimAndEncode(pixels, width, height);
      const meta2 = await sharp(webpBuf).metadata();
      const newBase64 = webpBuf.toString('base64');
      const newEntry = `"${key}":"data:image/webp;base64,${newBase64}"`;
      const regex = new RegExp(`"${key}":"data:image/webp;base64,[^"]+"`);
      if (regex.test(html)) {
        html = html.replace(regex, newEntry);
        console.log(`    ${width}x${height} -> ${meta2.width}x${meta2.height} trimmed, removed ${removed} bg px, ${Math.round(newBase64.length/1024)}KB`);
        changes++;
      }
    } catch (err) {
      console.error(`    ERROR: ${err.message}`);
    }
  }

  // === STEP 2: Process face artwork (already base64, just trim + re-remove BG) ===
  console.log('\n=== STEP 2: Processing face artwork from existing base64 ===');
  const faceKeys = ['artwork_marcus_attack_face','artwork_marcus_defense_face','artwork_adele_attack_face','artwork_adele_defense_face'];
  for (const key of faceKeys) {
    const regex = new RegExp(`"${key}":"data:image/webp;base64,([^"]+)"`);
    const m = html.match(regex);
    if (!m) { console.log(`  SKIP ${key}: not found`); continue; }
    console.log(`  Processing ${key}`);
    try {
      const inputBuf = Buffer.from(m[1], 'base64');
      const { pixels, width, height, removed } = await floodFillRemoveBG(inputBuf, true);
      const webpBuf = await trimAndEncode(pixels, width, height);
      const meta2 = await sharp(webpBuf).metadata();
      const newBase64 = webpBuf.toString('base64');
      html = html.replace(regex, `"${key}":"data:image/webp;base64,${newBase64}"`);
      console.log(`    ${width}x${height} -> ${meta2.width}x${meta2.height} trimmed, ${Math.round(newBase64.length/1024)}KB`);
      changes++;
    } catch (err) {
      console.error(`    ERROR: ${err.message}`);
    }
  }

  // === STEP 3: Process SPRITE_DATA individual sprites (remove ground shadows + trim) ===
  console.log('\n=== STEP 3: Processing SPRITE_DATA sprites ===');
  const spriteRegex = /"([a-z]+_[a-zA-Z0-9]+)":"data:image\/webp;base64,([^"]+)"/g;
  const spriteEntries = [];
  let sm;
  while ((sm = spriteRegex.exec(html)) !== null) {
    // Only process individual character sprites, not artwork or grapple
    if (sm[1].startsWith('artwork_')) continue;
    spriteEntries.push({ key: sm[1], base64: sm[2], fullMatch: sm[0] });
  }
  console.log(`  Found ${spriteEntries.length} sprite entries`);

  for (const entry of spriteEntries) {
    try {
      const inputBuf = Buffer.from(entry.base64, 'base64');
      const { pixels, width, height, removed } = await floodFillRemoveBG(inputBuf, false);
      const webpBuf = await trimAndEncode(pixels, width, height);
      const meta2 = await sharp(webpBuf).metadata();
      const newBase64 = webpBuf.toString('base64');
      const newEntry = `"${entry.key}":"data:image/webp;base64,${newBase64}"`;
      html = html.replace(entry.fullMatch, newEntry);
      if (removed > 100 || meta2.width !== width || meta2.height !== height) {
        console.log(`    ${entry.key}: ${width}x${height} -> ${meta2.width}x${meta2.height}, removed ${removed} px`);
      }
      changes++;
    } catch (err) {
      console.error(`    ERROR ${entry.key}: ${err.message}`);
    }
  }

  fs.writeFileSync(HTML_PATH, html, 'utf8');
  console.log(`\nDone! ${changes} images processed. File saved.`);
}

main().catch(console.error);
