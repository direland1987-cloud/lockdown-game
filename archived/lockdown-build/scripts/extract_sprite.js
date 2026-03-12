// Extracts a specific sprite from SPRITE_DATA and saves as PNG for inspection
const fs = require('fs');
const sharp = require('sharp');

const html = fs.readFileSync('lockdown_game.html', 'utf8');
const key = process.argv[2] || 'marcus_guardTop';

const re = new RegExp(`"${key}"\\s*:\\s*"(data:image/webp;base64,[^"]+)"`);
const m = html.match(re);
if (!m) { console.log('Sprite not found:', key); process.exit(1); }

const base64 = m[1].replace('data:image/webp;base64,', '');
const buf = Buffer.from(base64, 'base64');

fs.mkdirSync('processed/individual', { recursive: true });
sharp(buf).png().toFile(`processed/individual/${key}.png`).then(info => {
  console.log(`${key}: ${info.width}x${info.height}`);
});
