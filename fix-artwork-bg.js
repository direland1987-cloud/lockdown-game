// fix-artwork-bg.js — Reprocess ARTWORK_DATA images with edge-based flood-fill BG removal
// Removes white/near-white backgrounds AND ground shadows from edges inward.

const fs = require('fs');
const sharp = require('sharp');

const HTML_PATH = './lockdown-deploy/index.html';

async function main() {
  let html = fs.readFileSync(HTML_PATH, 'utf8');

  // Extract all artwork keys and their base64 data
  const artworkRegex = /"(artwork_[a-z_]+)":"data:image\/webp;base64,([^"]+)"/g;
  const entries = [];
  let match;
  while ((match = artworkRegex.exec(html)) !== null) {
    entries.push({
      key: match[1],
      base64: match[2],
      fullMatch: match[0]
    });
  }

  console.log(`Found ${entries.length} artwork entries to process`);

  for (const entry of entries) {
    console.log(`Processing: ${entry.key}`);
    try {
      const inputBuf = Buffer.from(entry.base64, 'base64');
      const image = sharp(inputBuf);
      const meta = await image.metadata();
      const { width, height, channels } = meta;

      // Get raw RGBA pixels
      const raw = await image.ensureAlpha().raw().toBuffer();
      const pixels = new Uint8Array(raw);

      // Flood fill from edges to remove background
      // A pixel is "background" if it's near-white (R,G,B all >= 215) or near-gray shadow (all >= 180, low saturation)
      const w = width;
      const h = height;
      const visited = new Uint8Array(w * h);
      const isBackground = (idx) => {
        const r = pixels[idx], g = pixels[idx+1], b = pixels[idx+2], a = pixels[idx+3];
        if (a < 10) return true; // already transparent
        // White/near-white
        if (r >= 210 && g >= 210 && b >= 210) return true;
        // Light gray (potential shadow on white bg)
        if (r >= 185 && g >= 185 && b >= 185) {
          const max = Math.max(r,g,b), min = Math.min(r,g,b);
          if (max - min < 30) return true; // low saturation = gray
        }
        return false;
      };

      // BFS flood fill from all edge pixels
      const queue = [];
      const addEdge = (x, y) => {
        const pi = y * w + x;
        const idx = pi * 4;
        if (!visited[pi] && isBackground(idx)) {
          visited[pi] = 1;
          queue.push([x, y]);
        }
      };

      // Seed from all edges
      for (let x = 0; x < w; x++) { addEdge(x, 0); addEdge(x, h-1); }
      for (let y = 0; y < h; y++) { addEdge(0, y); addEdge(w-1, y); }

      // Process queue
      let processed = 0;
      while (queue.length > 0) {
        const [x, y] = queue.shift();
        processed++;
        // Make transparent
        const idx = (y * w + x) * 4;
        pixels[idx + 3] = 0; // alpha = 0

        // Check 4 neighbors
        const neighbors = [[x-1,y],[x+1,y],[x,y-1],[x,y+1]];
        for (const [nx, ny] of neighbors) {
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          const npi = ny * w + nx;
          if (visited[npi]) continue;
          const nidx = npi * 4;
          if (isBackground(nidx)) {
            visited[npi] = 1;
            queue.push([nx, ny]);
          }
        }
      }

      // Anti-alias: soften edges of remaining opaque pixels adjacent to transparent
      const edgePixels = [];
      for (let y = 1; y < h-1; y++) {
        for (let x = 1; x < w-1; x++) {
          const pi = y * w + x;
          const idx = pi * 4;
          if (pixels[idx+3] === 0) continue;
          // Check if any neighbor is transparent
          const neighbors = [[x-1,y],[x+1,y],[x,y-1],[x,y+1]];
          let transparentNeighbors = 0;
          for (const [nx, ny] of neighbors) {
            const nidx = (ny * w + nx) * 4;
            if (pixels[nidx+3] === 0) transparentNeighbors++;
          }
          if (transparentNeighbors > 0) {
            edgePixels.push({ idx, transparentNeighbors });
          }
        }
      }

      // Apply soft edge
      for (const { idx, transparentNeighbors } of edgePixels) {
        const r = pixels[idx], g = pixels[idx+1], b = pixels[idx+2];
        // If this edge pixel is near-white, make semi-transparent
        if (r >= 200 && g >= 200 && b >= 200) {
          pixels[idx+3] = Math.round(pixels[idx+3] * 0.3);
        } else if (transparentNeighbors >= 2) {
          // Soften edges slightly
          pixels[idx+3] = Math.round(pixels[idx+3] * 0.7);
        }
      }

      console.log(`  Removed ${processed} background pixels from ${w}x${h} image`);

      // Re-encode as WebP
      const outputBuf = await sharp(Buffer.from(pixels.buffer), {
        raw: { width: w, height: h, channels: 4 }
      }).webp({ quality: 85, alphaQuality: 100 }).toBuffer();

      const newBase64 = outputBuf.toString('base64');
      const newEntry = `"${entry.key}":"data:image/webp;base64,${newBase64}"`;

      html = html.replace(entry.fullMatch, newEntry);
      console.log(`  Done: ${Math.round(entry.base64.length/1024)}KB -> ${Math.round(newBase64.length/1024)}KB`);

    } catch (err) {
      console.error(`  ERROR processing ${entry.key}:`, err.message);
    }
  }

  fs.writeFileSync(HTML_PATH, html, 'utf8');
  console.log('\nAll artwork reprocessed and saved to index.html');
}

main().catch(console.error);
