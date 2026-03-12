// Remove white backgrounds from all ARTWORK_DATA images
// Uses sharp to make white/near-white pixels transparent
const fs = require('fs');
const sharp = require('sharp');

async function main() {
  console.log('Reading HTML...');
  let html = fs.readFileSync('lockdown-deploy/index.html', 'utf8');

  const THRESHOLD = 230; // pixels with R,G,B all above this become transparent

  // Find all base64 image data URIs in ARTWORK_DATA section
  const artStart = html.indexOf('ARTWORK_DATA=');
  if (artStart === -1) { console.error('ARTWORK_DATA not found'); process.exit(1); }

  // Find the end of ARTWORK_DATA (next semicolon after matching braces)
  let braceCount = 0;
  let artEnd = artStart;
  let foundOpen = false;
  for (let i = artStart; i < html.length; i++) {
    if (html[i] === '{') { braceCount++; foundOpen = true; }
    if (html[i] === '}') { braceCount--; if (foundOpen && braceCount === 0) { artEnd = i + 1; break; } }
  }

  const artSection = html.substring(artStart, artEnd);
  console.log(`ARTWORK_DATA section: ${artStart} to ${artEnd} (${Math.round(artSection.length/1024)}KB)`);

  // Find all base64 data URIs in this section
  const regex = /data:image\/webp;base64,[A-Za-z0-9+\/=]+/g;
  let match;
  const replacements = [];
  let count = 0;

  while ((match = regex.exec(artSection)) !== null) {
    count++;
    const oldDataUrl = match[0];
    const base64Part = oldDataUrl.split(',')[1];
    const inputBuffer = Buffer.from(base64Part, 'base64');

    try {
      // Decode image to raw RGBA
      const { data, info } = await sharp(inputBuffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Process pixels - make white/near-white transparent
      let changed = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i+1], b = data[i+2];
        if (r >= THRESHOLD && g >= THRESHOLD && b >= THRESHOLD) {
          const whiteness = Math.min(r, g, b);
          if (whiteness >= 250) {
            data[i+3] = 0; // fully transparent for pure white
          } else {
            // Semi-transparent for near-white (anti-aliasing edges)
            const alpha = Math.round((255 - whiteness) / (255 - THRESHOLD) * 255);
            data[i+3] = Math.min(data[i+3], alpha);
          }
          changed++;
        }
      }

      // Re-encode as WebP with transparency
      const outputBuffer = await sharp(data, {
        raw: { width: info.width, height: info.height, channels: 4 }
      })
        .webp({ quality: 85, alphaQuality: 100 })
        .toBuffer();

      const newDataUrl = 'data:image/webp;base64,' + outputBuffer.toString('base64');
      replacements.push({ old: oldDataUrl, new: newDataUrl });

      const oldKB = Math.round(base64Part.length / 1024);
      const newKB = Math.round(outputBuffer.toString('base64').length / 1024);
      console.log(`  Image ${count}: ${changed} white px removed, ${oldKB}KB -> ${newKB}KB`);
    } catch (err) {
      console.error(`  ERROR on image ${count}: ${err.message}`);
    }
  }

  console.log(`\nApplying ${replacements.length} replacements...`);

  // Apply replacements (largest first to avoid offset issues)
  for (const r of replacements) {
    html = html.replace(r.old, r.new);
  }

  fs.writeFileSync('lockdown-deploy/index.html', html, 'utf8');
  console.log(`Done! Processed ${replacements.length} artwork images.`);
}

main().catch(console.error);
