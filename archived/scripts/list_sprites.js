const fs = require('fs');
const html = fs.readFileSync('lockdown_game.html', 'utf8');

// Extract SPRITE_DATA keys
const match = html.match(/const SPRITE_DATA = \{([\s\S]*?)\n\};/);
if (!match) { console.log('SPRITE_DATA not found'); process.exit(1); }

const block = match[1];
const keyRe = /"(\w+)"\s*:\s*"data:image/g;
const keys = [];
let m;
while ((m = keyRe.exec(block)) !== null) {
  keys.push(m[1]);
}

const marcusGround = keys.filter(k => k.startsWith('marcus_') && !['marcus_idle','marcus_idle2','marcus_win','marcus_lose','marcus_hit','marcus_tired','marcus_effort','marcus_tapOut'].includes(k));
const yukiGround = keys.filter(k => k.startsWith('yuki_') && !['yuki_idle','yuki_idle2','yuki_win','yuki_lose','yuki_hit','yuki_tired','yuki_effort','yuki_tapOut'].includes(k));
const marcusStanding = keys.filter(k => k.startsWith('marcus_') && !marcusGround.includes(k));
const yukiStanding = keys.filter(k => k.startsWith('yuki_') && !yukiGround.includes(k));

console.log('=== SPRITE_DATA Keys ===\n');
console.log('Marcus standing/state:', marcusStanding.join(', '));
console.log('Marcus ground:', marcusGround.join(', '));
console.log('');
console.log('Yuki standing/state:', yukiStanding.join(', '));
console.log('Yuki ground:', yukiGround.join(', '));
console.log('');
console.log('Total sprites:', keys.length);
console.log('Marcus ground count:', marcusGround.length);
console.log('Yuki ground count:', yukiGround.length);
