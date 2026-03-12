// Re-process artwork from original PNGs with better background removal
// Uses flood-fill approach instead of global threshold
const fs = require('fs');
const sharp = require('sharp');

// Map of ARTWORK_DATA keys to source PNG files
const POSITION_MAP = {
  'artwork_closedguard_marcus_top': 'Closed guard_Marcus_Adele.png',
  'artwork_halfguard_marcus_top': 'Half Guard_Marcus_Adele.png',
  'artwork_openguard_marcus_top': 'Open Guard_Marcus_Adele.png',
  'artwork_sidecontrol_marcus_top': 'Side Control_Marcus_Adele.png',
  'artwork_mount_marcus_top': 'Mount_Marcus_Adele.png',
  'artwork_butterflyguard_marcus_top': 'Butterfly Guard_Marcus_Adele.png',
  'artwork_backcontrol_marcus_top': 'Back control_Marcus_Adele.png',
  'artwork_ashi_marcus_top': 'Ashi Garami_marcus_Adele.png',
  'artwork_closedguard_adele_top': 'Closed Guard_Adele_Marcus.png',
  'artwork_halfguard_adele_top': 'Half Guard_Adele_Marcus.png',
  'artwork_openguard_adele_top': 'Open Guard_Adele_Marcus.png',
  'artwork_sidecontrol_adele_top': 'Side Control_Adele_Marcus.png',
  'artwork_mount_adele_top': 'Mount_Adele_Marcus.png',
  'artwork_butterflyguard_adele_top': 'Butterfly Guard_Adele_Marcus.png',
  'artwork_backcontrol_adele_top': 'Back Control_Adele_Marcus.png',
  'artwork_ashi_adele_top': 'Ashi Garami_Adele_Marcus.png',
  'artwork_clinch_marcus_adele': 'Clinch_Adele_Marcus.png',
};

const PORTRAIT_MAP = {
  'artwork_marcus_portrait': 'References/Characaters/Marcus.png',
  'artwork_adele_portrait': 'References/Characaters/Adele.png',
  'artwork_marcus_attack_face': 'References/Characaters/Marcus Sub Attack.png',
  'artwork_marcus_defense_face': 'References/Characaters/Marcus Sub Defend.png',
  'artwork_adele_attack_face': 'References/Characaters/Adele Sub Attack.png',
  'artwork_adele_defense_face': 'References/Characaters/Adele Sub defend.png',
};

const ARTWORK_DIR = 'Final Artwork/Accepted/Marcus Adele/';
const ACCEPTED_DIR = 'Final Artwork/Accepted/';

// Flood fill from edges to find background
function floodFillBackground(data, width, height, threshold = 240, shadowThreshold = 180) {
  const visited = new Uint8Array(width * height);
  const isBg = new Uint8Array(width * height);
  const queue = [];

  function isWhiteish(idx) {
    const r = data[idx * 4], g = data[idx * 4 + 1], b = data[idx * 4 + 2];
    return r >= threshold && g >= threshold && b >= threshold;
  }

  function isGroundShadow(idx) {
    const r = data[idx * 4], g = data[idx * 4 + 1], b = data[idx * 4 + 2];
    // Ground shadows are grey-ish (low saturation, medium brightness)
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const sat = max > 0 ? (max - min) / max : 0;
    const bright = (r + g + b) / 3;
    return sat < 0.15 && bright >= shadowThreshold && bright <= 245;
  }

  // Seed from all edges
  for (let x = 0; x < width; x++) {
    queue.push(x); // top
    queue.push((height - 1) * width + x); // bottom
  }
  for (let y = 0; y < height; y++) {
    queue.push(y * width); // left
    queue.push(y * width + width - 1); // right
  }

  while (queue.length > 0) {
    const idx = queue.pop();
    if (idx < 0 || idx >= width * height) continue;
    if (visited[idx]) continue;
    visited[idx] = 1;

    if (isWhiteish(idx) || isGroundShadow(idx)) {
      isBg[idx] = 1;
      const x = idx % width, y = Math.floor(idx / width);
      if (x > 0) queue.push(idx - 1);
      if (x < width - 1) queue.push(idx + 1);
      if (y > 0) queue.push(idx - width);
      if (y < height - 1) queue.push(idx + width);
    }
  }

  return isBg;
}

async function processImage(inputPath, key) {
  if (!fs.existsSync(inputPath)) {
    console.log(`  SKIP ${key}: file not found (${inputPath})`);
    return null;
  }

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;

  // Flood-fill from edges to find background
  const isBg = floodFillBackground(data, width, height);

  let changed = 0;
  for (let i = 0; i < width * height; i++) {
    if (isBg[i]) {
      data[i * 4 + 3] = 0; // make transparent
      changed++;
    }
  }

  // Anti-alias: soften edges of remaining pixels next to transparent ones
  const result = Buffer.from(data);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (isBg[idx]) continue;
      // Count transparent neighbors
      let transN = 0;
      if (isBg[idx - 1]) transN++;
      if (isBg[idx + 1]) transN++;
      if (isBg[idx - width]) transN++;
      if (isBg[idx + width]) transN++;
      if (transN >= 2) {
        // Edge pixel - soften alpha
        result[idx * 4 + 3] = Math.round(result[idx * 4 + 3] * 0.7);
      } else if (transN === 1) {
        result[idx * 4 + 3] = Math.round(result[idx * 4 + 3] * 0.9);
      }
    }
  }

  const outputBuffer = await sharp(result, {
    raw: { width, height, channels: 4 }
  })
    .webp({ quality: 88, alphaQuality: 100 })
    .toBuffer();

  const newBase64 = 'data:image/webp;base64,' + outputBuffer.toString('base64');
  const pct = Math.round(changed / (width * height) * 100);
  console.log(`  ${key}: ${pct}% bg removed, ${Math.round(outputBuffer.length / 1024)}KB`);
  return newBase64;
}

async function main() {
  console.log('Reading HTML...');
  let html = fs.readFileSync('lockdown-deploy/index.html', 'utf8');

  // Process position artwork from PNGs
  console.log('\n--- Position Artwork ---');
  for (const [key, filename] of Object.entries(POSITION_MAP)) {
    const path = ARTWORK_DIR + filename;
    const newData = await processImage(path, key);
    if (newData) {
      // Replace in HTML using regex to find the data URI for this key
      const regex = new RegExp(`"${key}":"data:image/[^"]+"`);
      if (regex.test(html)) {
        html = html.replace(regex, `"${key}":"${newData}"`);
      } else {
        console.log(`  WARNING: key ${key} not found in HTML`);
      }
    }
  }

  // Process portraits/faces from PNGs
  console.log('\n--- Portraits & Faces ---');
  for (const [key, filename] of Object.entries(PORTRAIT_MAP)) {
    const path = ACCEPTED_DIR + filename;
    const newData = await processImage(path, key);
    if (newData) {
      const regex = new RegExp(`"${key}":"data:image/[^"]+"`);
      if (regex.test(html)) {
        html = html.replace(regex, `"${key}":"${newData}"`);
      } else {
        console.log(`  WARNING: key ${key} not found in HTML`);
      }
    }
  }

  fs.writeFileSync('lockdown-deploy/index.html', html, 'utf8');
  console.log('\nDone! All artwork re-processed from original PNGs.');
}

main().catch(console.error);
