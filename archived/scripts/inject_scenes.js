#!/usr/bin/env node
/**
 * Injects GRAPPLE_SCENES data into lockdown_game.html
 * Inserts right after the TEMPLATE_POSITIONS line.
 */

const fs = require("fs");
const path = require("path");

const BASE = path.resolve(__dirname, "..");
const HTML_PATH = path.join(BASE, "lockdown_game.html");
const SCENES_PATH = path.join(BASE, "processed", "grapple_scenes.js");

// Read files
let html = fs.readFileSync(HTML_PATH, "utf8");
const scenesCode = fs.readFileSync(SCENES_PATH, "utf8");

// Find the injection point — right after TEMPLATE_POSITIONS line
const marker = `const TEMPLATE_POSITIONS = [POS.GUARD, POS.HALF_GUARD, POS.SIDE_CONTROL, POS.MOUNT, POS.BACK_CONTROL, POS.OPEN_GUARD, POS.BUTTERFLY_GUARD, POS.TURTLE];`;

const idx = html.indexOf(marker);
if (idx === -1) {
  console.error("Could not find TEMPLATE_POSITIONS marker in HTML!");
  process.exit(1);
}

// Check if GRAPPLE_SCENES already injected
if (html.includes('GRAPPLE_SCENES["guard"]')) {
  console.log("GRAPPLE_SCENES already present — removing old version first...");
  // Remove old GRAPPLE_SCENES block (from "// ── GRAPPLE SCENE" to the empty line before next section)
  html = html.replace(/\/\/ ── GRAPPLE SCENE SPRITES[\s\S]*?GRAPPLE_SCENES\["clinch"\]\["marcus_yuki"\] = "[^"]*";\n\n/m, "");
}

// Build the injection block with position-to-scene mapping helper
const injection = `

${scenesCode}
// ── Position-to-scene key mapping ──
// Maps game POS values to GRAPPLE_SCENES keys (some positions share scenes)
function positionToSceneKey(pos) {
  const map = {
    [POS.GUARD]: "guard",
    [POS.OPEN_GUARD]: "open_guard",
    [POS.BUTTERFLY_GUARD]: "guard",     // reuse closed guard scene
    [POS.HALF_GUARD]: "half_guard",
    [POS.SIDE_CONTROL]: "side_control",
    [POS.MOUNT]: "mount",
    [POS.BACK_CONTROL]: "back_control",
    [POS.TURTLE]: "turtle",
    [POS.CLINCH]: "clinch",
  };
  return map[pos] || null;
}

// Look up a paired scene for the given position and character pair
function getGrappleScene(position, topCharId, btmCharId) {
  const sceneKey = positionToSceneKey(position);
  if (!sceneKey) return null;
  const scenes = GRAPPLE_SCENES[sceneKey];
  if (!scenes) return null;
  // Try exact pair
  const pairKey = topCharId + "_" + btmCharId;
  if (scenes[pairKey]) return scenes[pairKey];
  // No scene for this pair
  return null;
}

`;

// Insert after the marker line
const insertPos = idx + marker.length;
html = html.slice(0, insertPos) + injection + html.slice(insertPos);

// Write back
fs.writeFileSync(HTML_PATH, html);
console.log("Injected GRAPPLE_SCENES data into lockdown_game.html");
console.log(`  Insertion point: after TEMPLATE_POSITIONS (char ${insertPos})`);
console.log(`  Data size: ${Math.round(scenesCode.length / 1024)}KB`);
