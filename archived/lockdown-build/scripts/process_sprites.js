#!/usr/bin/env node
/**
 * LOCKDOWN Sprite Processing Pipeline
 *
 * Takes raw AI-generated art and produces game-ready base64 sprites:
 * 1. Removes white/near-white backgrounds → transparent
 * 2. Removes drop shadows (light gray near edges)
 * 3. Trims to bounding box with padding
 * 4. Normalizes to standard game sizes
 * 5. Exports as base64 WebP data URLs
 * 6. Generates a JS file ready to embed in lockdown_game.html
 *
 * Usage:
 *   node scripts/process_sprites.js --mode ground   (process ground scenes)
 *   node scripts/process_sprites.js --mode standing  (process standing sprites)
 *   node scripts/process_sprites.js --mode all       (process everything)
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// ── Config ──────────────────────────────────────────────────────────────

const BASE_DIR = path.resolve(__dirname, "..");
const RAW_DIR = path.join(BASE_DIR, "raw_sprites");
const SOLO_DIR = path.join(BASE_DIR, "sprites", "solo");
const OUT_DIR = path.join(BASE_DIR, "processed");

// Ground scenes: paired grappling images (both fighters in one image)
// Target: fit within 320x220 while maintaining aspect ratio for game display at 200-240px
const GROUND_SCENE_MAX_W = 320;
const GROUND_SCENE_MAX_H = 220;

// Standing sprites: individual character poses
// Target: fit within 200x280 for in-game display at 120-160px
const STANDING_MAX_W = 200;
const STANDING_MAX_H = 280;

// Background removal threshold (pixels with ALL channels above this → transparent)
const BG_THRESH = 225;

// Shadow removal: light gray pixels near the bottom edge
const SHADOW_THRESH_MIN = 180; // min channel value to consider as shadow
const SHADOW_THRESH_MAX = 230; // max channel value
const SHADOW_ALPHA_THRESH = 200; // only affect semi-visible pixels

// ── Ground Scene Mapping ────────────────────────────────────────────────
// Maps raw_sprites filenames to game position keys
// "top" indicates who is on top in this image

const GROUND_SCENES = {
  "A1_closed_guard.png":    { position: "guard",        topChar: "marcus", btmChar: "yuki" },
  "A2_open_guard.png":      { position: "open_guard",   topChar: "marcus", btmChar: "yuki" },
  "A3_half_guard.png":      { position: "half_guard",   topChar: "marcus", btmChar: "yuki" },
  "A4_side_control.png":    { position: "side_control",  topChar: "marcus", btmChar: "yuki" },
  "A5_mount.png":           { position: "mount",        topChar: "marcus", btmChar: "yuki" },
  "A6_back_mount.png":      { position: "back_control", topChar: "marcus", btmChar: "yuki" },
  "A7_turtle.png":          { position: "turtle",       topChar: "marcus", btmChar: "yuki" },
  "A8_standing_clinch.png": { position: "clinch",       topChar: "marcus", btmChar: "yuki" },
};

// Reverse scenes (Yuki on top) — files named R1-R8, process when they exist
const REVERSE_SCENES = {
  "R1_closed_guard_yuki_top.png":    { position: "guard",        topChar: "yuki", btmChar: "marcus" },
  "R2_open_guard_yuki_top.png":      { position: "open_guard",   topChar: "yuki", btmChar: "marcus" },
  "R3_half_guard_yuki_top.png":      { position: "half_guard",   topChar: "yuki", btmChar: "marcus" },
  "R4_side_control_yuki_top.png":    { position: "side_control",  topChar: "yuki", btmChar: "marcus" },
  "R5_mount_yuki_top.png":           { position: "mount",        topChar: "yuki", btmChar: "marcus" },
  "R6_back_mount_yuki_top.png":      { position: "back_control", topChar: "yuki", btmChar: "marcus" },
  "R7_turtle_yuki_top.png":          { position: "turtle",       topChar: "yuki", btmChar: "marcus" },
  "R8_standing_clinch_yuki_top.png": { position: "clinch",       topChar: "yuki", btmChar: "marcus" },
};

// Standing sprite mapping
const STANDING_SPRITES = {
  "B1_marcus_idle.png":       { charId: "marcus", pose: "idle" },
  "B3_marcus_victory.png":    { charId: "marcus", pose: "win" },
  "B4_yuki_victory.png":      { charId: "yuki",   pose: "win" },
  "B10_yuki_sub_choke.png":   { charId: "yuki",   pose: "effort" },
  "B14_yuki_walkout.png":     { charId: "yuki",   pose: "idle" },
};

// ── Image Processing Functions ──────────────────────────────────────────

/**
 * Remove white/near-white background and light shadows.
 * Returns a sharp instance with alpha channel.
 */
async function removeBackground(inputPath) {
  const image = sharp(inputPath).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const pixels = Buffer.from(data);

  for (let i = 0; i < pixels.length; i += channels) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];

    // Pure/near-white background removal
    if (r > BG_THRESH && g > BG_THRESH && b > BG_THRESH) {
      pixels[i + 3] = 0; // fully transparent
      continue;
    }

    // Shadow removal: light gray pixels (low saturation, high value)
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    const saturation = maxC > 0 ? (maxC - minC) / maxC : 0;

    if (saturation < 0.12 && minC > SHADOW_THRESH_MIN && maxC < SHADOW_THRESH_MAX) {
      // Fade out gradually based on how "shadow-like" the pixel is
      const shadowness = 1 - saturation / 0.12;
      const currentAlpha = pixels[i + 3];
      pixels[i + 3] = Math.round(currentAlpha * (1 - shadowness * 0.85));
    }
  }

  return sharp(pixels, { raw: { width, height, channels } });
}

/**
 * Trim transparent pixels, add padding, and resize in one pipeline.
 * We go through PNG as an intermediate to preserve sharp's metadata correctly.
 */
async function trimPadResize(sharpInstance, maxW, maxH, padding = 4) {
  // Step 1: Convert to PNG buffer so trim works correctly
  const pngBuf = await sharpInstance.png().toBuffer();

  // Step 2: Trim transparent borders
  const trimmedBuf = await sharp(pngBuf).trim({ threshold: 5 }).png().toBuffer();

  // Step 3: Add padding + resize to fit within target
  return sharp(trimmedBuf)
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .resize(maxW, maxH, {
      fit: "inside",
      withoutEnlargement: false,  // DO downscale large images
      kernel: "lanczos3"
    });
}

/**
 * Convert to base64 WebP data URL.
 */
async function toBase64WebP(sharpInstance, quality = 85) {
  const buf = await sharpInstance.webp({ quality, alphaQuality: 100 }).toBuffer();
  return `data:image/webp;base64,${buf.toString("base64")}`;
}

/**
 * Convert to base64 PNG data URL (for maximum quality/compatibility).
 */
async function toBase64PNG(sharpInstance) {
  const buf = await sharpInstance.png({ compressionLevel: 9 }).toBuffer();
  return `data:image/png;base64,${buf.toString("base64")}`;
}

// ── Processing Pipelines ────────────────────────────────────────────────

/**
 * Process a single ground scene image.
 */
async function processGroundScene(filename, config) {
  const inputPath = path.join(RAW_DIR, filename);
  if (!fs.existsSync(inputPath)) {
    console.log(`  SKIP: ${filename} not found`);
    return null;
  }

  console.log(`  Processing: ${filename} → ${config.position} (${config.topChar} on top)`);

  // Step 1: Remove background
  const cleaned = await removeBackground(inputPath);

  // Step 2: Trim, pad, and resize to game dimensions
  const resized = await trimPadResize(cleaned, GROUND_SCENE_MAX_W, GROUND_SCENE_MAX_H, 2);

  // Step 3: Export as base64
  const dataUrl = await toBase64WebP(resized, 88);

  // Also save a preview PNG
  const previewDir = path.join(OUT_DIR, "preview");
  fs.mkdirSync(previewDir, { recursive: true });
  await resized.png().toFile(path.join(previewDir, `${config.position}_${config.topChar}_top.png`));

  // Get final dimensions
  const metadata = await resized.metadata();
  console.log(`    → ${metadata.width}x${metadata.height}, ${Math.round(dataUrl.length / 1024)}KB base64`);

  return {
    key: `grapple_${config.position}_${config.topChar}_top`,
    position: config.position,
    topChar: config.topChar,
    btmChar: config.btmChar,
    dataUrl,
    width: metadata.width,
    height: metadata.height,
  };
}

/**
 * Process a standing sprite.
 */
async function processStandingSprite(filename, config) {
  const inputPath = path.join(SOLO_DIR, filename);
  if (!fs.existsSync(inputPath)) {
    console.log(`  SKIP: ${filename} not found`);
    return null;
  }

  console.log(`  Processing: ${filename} → ${config.charId}_${config.pose}`);

  const cleaned = await removeBackground(inputPath);
  const resized = await trimPadResize(cleaned, STANDING_MAX_W, STANDING_MAX_H, 3);
  const dataUrl = await toBase64WebP(resized, 88);

  const previewDir = path.join(OUT_DIR, "preview");
  fs.mkdirSync(previewDir, { recursive: true });
  await resized.png().toFile(path.join(previewDir, `${config.charId}_${config.pose}.png`));

  const metadata = await resized.metadata();
  console.log(`    → ${metadata.width}x${metadata.height}, ${Math.round(dataUrl.length / 1024)}KB base64`);

  return {
    key: `${config.charId}_${config.pose}`,
    charId: config.charId,
    pose: config.pose,
    dataUrl,
    width: metadata.width,
    height: metadata.height,
  };
}

/**
 * Process loose ChatGPT images that match known content.
 */
async function processLooseImages() {
  const looseMap = {};
  const files = fs.readdirSync(BASE_DIR).filter(f => f.endsWith(".png") && f.startsWith("ChatGPT"));

  // We'll process them as potential additional scene images
  // For now, log what exists so the user knows what's available
  console.log(`\n  Found ${files.length} loose ChatGPT images in root directory.`);
  console.log("  These may contain Yuki-on-top variants or additional poses.");
  console.log("  To use them, rename matching the R1-R8 convention and place in raw_sprites/\n");

  return looseMap;
}

// ── Output Generation ───────────────────────────────────────────────────

/**
 * Generate the GRAPPLE_SCENES JS constant for embedding in the game.
 */
function generateGrappleScenesJS(scenes) {
  const lines = [];
  lines.push("// ── GRAPPLE SCENE SPRITES (AI-generated paired artwork) ──");
  lines.push("// Generated by scripts/process_sprites.js");
  lines.push("// Maps: GRAPPLE_SCENES[position][topCharId + '_' + btmCharId] = dataUrl");
  lines.push("const GRAPPLE_SCENES = {};");
  lines.push("");

  // Group by position
  const byPosition = {};
  for (const scene of scenes) {
    if (!byPosition[scene.position]) byPosition[scene.position] = [];
    byPosition[scene.position].push(scene);
  }

  for (const [pos, posScenes] of Object.entries(byPosition)) {
    lines.push(`GRAPPLE_SCENES["${pos}"] = {};`);
    for (const scene of posScenes) {
      const pairKey = `${scene.topChar}_${scene.btmChar}`;
      lines.push(`GRAPPLE_SCENES["${pos}"]["${pairKey}"] = "${scene.dataUrl}";`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Generate a summary manifest JSON.
 */
function generateManifest(groundScenes, standingSprites) {
  return {
    generated: new Date().toISOString(),
    groundScenes: groundScenes.map(s => ({
      key: s.key,
      position: s.position,
      topChar: s.topChar,
      btmChar: s.btmChar,
      dimensions: `${s.width}x${s.height}`,
      sizeKB: Math.round(s.dataUrl.length / 1024),
    })),
    standingSprites: standingSprites.map(s => ({
      key: s.key,
      charId: s.charId,
      pose: s.pose,
      dimensions: `${s.width}x${s.height}`,
      sizeKB: Math.round(s.dataUrl.length / 1024),
    })),
    summary: {
      totalGroundScenes: groundScenes.length,
      totalStandingSprites: standingSprites.length,
      positions: [...new Set(groundScenes.map(s => s.position))],
      characters: [...new Set([...groundScenes.flatMap(s => [s.topChar, s.btmChar]), ...standingSprites.map(s => s.charId)])],
    },
  };
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  const mode = process.argv.includes("--mode")
    ? process.argv[process.argv.indexOf("--mode") + 1]
    : "all";

  console.log("=".repeat(60));
  console.log("  LOCKDOWN Sprite Processing Pipeline");
  console.log(`  Mode: ${mode}`);
  console.log("=".repeat(60));

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const groundResults = [];
  const standingResults = [];

  // ── Process Ground Scenes ──
  if (mode === "ground" || mode === "all") {
    console.log("\n--- GROUND SCENES (Marcus on top) ---");
    for (const [file, config] of Object.entries(GROUND_SCENES)) {
      const result = await processGroundScene(file, config);
      if (result) groundResults.push(result);
    }

    console.log("\n--- GROUND SCENES (Yuki on top — reverse) ---");
    for (const [file, config] of Object.entries(REVERSE_SCENES)) {
      const result = await processGroundScene(file, config);
      if (result) groundResults.push(result);
    }

    // Check for loose ChatGPT images
    await processLooseImages();
  }

  // ── Process Standing Sprites ──
  if (mode === "standing" || mode === "all") {
    console.log("\n--- STANDING SPRITES ---");
    for (const [file, config] of Object.entries(STANDING_SPRITES)) {
      const result = await processStandingSprite(file, config);
      if (result) standingResults.push(result);
    }
  }

  // ── Generate Output Files ──
  console.log("\n--- GENERATING OUTPUT ---");

  if (groundResults.length > 0) {
    const jsContent = generateGrappleScenesJS(groundResults);
    const jsPath = path.join(OUT_DIR, "grapple_scenes.js");
    fs.writeFileSync(jsPath, jsContent);
    console.log(`  Wrote: ${jsPath} (${Math.round(jsContent.length / 1024)}KB)`);
  }

  const manifest = generateManifest(groundResults, standingResults);
  const manifestPath = path.join(OUT_DIR, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`  Wrote: ${manifestPath}`);

  // ── Summary ──
  console.log("\n" + "=".repeat(60));
  console.log("  DONE");
  console.log(`  Ground scenes: ${groundResults.length} processed`);
  console.log(`  Standing sprites: ${standingResults.length} processed`);

  if (groundResults.length > 0) {
    const totalKB = groundResults.reduce((sum, s) => sum + s.dataUrl.length, 0) / 1024;
    console.log(`  Total ground scene data: ${Math.round(totalKB)}KB`);
  }

  // Report what's missing
  const missingPositions = Object.values(GROUND_SCENES)
    .filter(cfg => !groundResults.find(r => r.position === cfg.position && r.topChar === cfg.topChar))
    .map(cfg => `${cfg.position} (${cfg.topChar} top)`);

  const missingReverse = Object.values(REVERSE_SCENES)
    .filter(cfg => !groundResults.find(r => r.position === cfg.position && r.topChar === cfg.topChar))
    .map(cfg => `${cfg.position} (${cfg.topChar} top)`);

  if (missingPositions.length > 0) {
    console.log(`\n  MISSING Marcus-on-top scenes: ${missingPositions.join(", ")}`);
  }
  if (missingReverse.length > 0) {
    console.log(`  MISSING Yuki-on-top scenes: ${missingReverse.join(", ")}`);
    console.log("  → Generate these using prompts in CHATGPT_ART_PROMPTS.md");
    console.log("  → Save as R1-R8 in raw_sprites/ and re-run this script");
  }

  console.log("=".repeat(60));
}

main().catch(err => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
