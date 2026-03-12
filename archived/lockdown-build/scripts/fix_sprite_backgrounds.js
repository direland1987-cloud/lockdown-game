#!/usr/bin/env node
/**
 * Extracts ALL sprites from SPRITE_DATA in lockdown_game.html,
 * removes white/near-white backgrounds and halos,
 * and re-embeds them with proper transparency.
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const HTML_PATH = path.resolve(__dirname, "..", "lockdown_game.html");
const PREVIEW_DIR = path.resolve(__dirname, "..", "processed", "cleaned");

// Background removal thresholds
const BG_WHITE_THRESH = 218;       // pixels with ALL channels above this → transparent
const HALO_PASS_RADIUS = 2;        // pixels within N of a transparent pixel get checked for halo
const HALO_LIGHTNESS_THRESH = 195; // light pixels near edges → fade out

async function cleanSprite(base64DataUrl) {
  // Decode the data URL
  const match = base64DataUrl.match(/^data:image\/(webp|png);base64,(.+)$/);
  if (!match) return base64DataUrl;

  const format = match[1];
  const buf = Buffer.from(match[2], "base64");

  // Convert to raw RGBA
  const image = sharp(buf).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const pixels = Buffer.from(data);

  // Pass 1: Remove white/near-white background
  const isTransparent = new Uint8Array(width * height);

  for (let i = 0; i < pixels.length; i += channels) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    if (r > BG_WHITE_THRESH && g > BG_WHITE_THRESH && b > BG_WHITE_THRESH) {
      pixels[i + 3] = 0;
      isTransparent[i / channels] = 1;
    }
  }

  // Pass 2: Remove halo — light pixels adjacent to newly-transparent pixels
  for (let pass = 0; pass < HALO_PASS_RADIUS; pass++) {
    const nextTransparent = new Uint8Array(isTransparent);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (isTransparent[idx]) continue; // already transparent

        // Check if any neighbor is transparent
        let nearTransparent = false;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              if (isTransparent[ny * width + nx]) {
                nearTransparent = true;
                break;
              }
            }
          }
          if (nearTransparent) break;
        }

        if (nearTransparent) {
          const pi = idx * channels;
          const r = pixels[pi], g = pixels[pi + 1], b = pixels[pi + 2];
          const lightness = (r + g + b) / 3;

          // Light pixels near transparent areas = halo
          if (lightness > HALO_LIGHTNESS_THRESH) {
            // Compute saturation to distinguish actual colors from gray halo
            const maxC = Math.max(r, g, b);
            const minC = Math.min(r, g, b);
            const saturation = maxC > 0 ? (maxC - minC) / maxC : 0;

            if (saturation < 0.18) {
              // Low saturation + high lightness + near edge = halo
              const fadeStrength = (lightness - HALO_LIGHTNESS_THRESH) / (255 - HALO_LIGHTNESS_THRESH);
              pixels[pi + 3] = Math.round(pixels[pi + 3] * (1 - fadeStrength * 0.9));

              if (pixels[pi + 3] < 20) {
                pixels[pi + 3] = 0;
                nextTransparent[idx] = 1;
              }
            }
          }
        }
      }
    }

    // Update transparent map for next pass
    for (let i = 0; i < nextTransparent.length; i++) {
      isTransparent[i] = nextTransparent[i];
    }
  }

  // Convert back to WebP
  const cleaned = sharp(pixels, { raw: { width, height, channels } });
  const outBuf = await cleaned.webp({ quality: 88, alphaQuality: 100 }).toBuffer();

  return `data:image/webp;base64,${outBuf.toString("base64")}`;
}

async function main() {
  console.log("=".repeat(60));
  console.log("  LOCKDOWN — Sprite Background Cleanup");
  console.log("=".repeat(60));

  let html = fs.readFileSync(HTML_PATH, "utf8");

  // Find all sprites in SPRITE_DATA
  const spriteRe = /"(\w+)"\s*:\s*"(data:image\/(?:webp|png);base64,[A-Za-z0-9+/=]+)"/g;
  let match;
  const sprites = [];

  // Only match within SPRITE_DATA block
  const sdStart = html.indexOf("const SPRITE_DATA = {");
  const sdEnd = html.indexOf("};", sdStart) + 2;
  const spriteBlock = html.substring(sdStart, sdEnd);

  while ((match = spriteRe.exec(spriteBlock)) !== null) {
    sprites.push({ key: match[1], dataUrl: match[2], offset: match.index });
  }

  console.log(`\n  Found ${sprites.length} sprites in SPRITE_DATA\n`);

  fs.mkdirSync(PREVIEW_DIR, { recursive: true });

  let cleanedCount = 0;
  let totalSavedKB = 0;

  for (const sprite of sprites) {
    process.stdout.write(`  Cleaning: ${sprite.key}...`);

    try {
      const cleaned = await cleanSprite(sprite.dataUrl);

      // Calculate size change
      const oldSize = sprite.dataUrl.length;
      const newSize = cleaned.length;
      const diff = oldSize - newSize;
      totalSavedKB += diff;

      // Replace in HTML
      html = html.replace(sprite.dataUrl, cleaned);

      // Save preview
      const b64 = cleaned.replace(/^data:image\/\w+;base64,/, "");
      const buf = Buffer.from(b64, "base64");
      await sharp(buf).png().toFile(path.join(PREVIEW_DIR, `${sprite.key}.png`));

      console.log(` OK (${diff > 0 ? "-" : "+"}${Math.abs(Math.round(diff / 1024))}KB)`);
      cleanedCount++;
    } catch (err) {
      console.log(` ERROR: ${err.message}`);
    }
  }

  // Write back
  fs.writeFileSync(HTML_PATH, html);

  console.log("\n" + "=".repeat(60));
  console.log(`  Done: ${cleanedCount}/${sprites.length} sprites cleaned`);
  console.log(`  Size change: ${totalSavedKB > 0 ? "-" : "+"}${Math.abs(Math.round(totalSavedKB / 1024))}KB`);
  console.log(`  Previews saved to: processed/cleaned/`);
  console.log("=".repeat(60));
}

main().catch(err => {
  console.error("Failed:", err);
  process.exit(1);
});
