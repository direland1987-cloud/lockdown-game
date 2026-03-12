# LOCKDOWN — Sprite Work Status Report
**Date:** 26 Feb 2026 (Updated v3 — Paired Scene System)

---

## LATEST UPDATE: Paired Scene Sprites (v3)

The geometric template compositor (v2) has been **replaced** as the primary ground position renderer. Ground positions now use the beautiful AI-generated paired grappling art directly.

### What Changed (v3)

1. **New sprite pipeline** (`scripts/process_sprites.js`) — Node.js + sharp
   - Removes white backgrounds + drop shadows
   - Trims, pads, and resizes to 320x220 game dimensions
   - Exports as base64 WebP data URLs
   - Generates `processed/grapple_scenes.js`

2. **GRAPPLE_SCENES data** — 8 paired scene sprites embedded in `lockdown_game.html`
   - `GRAPPLE_SCENES["guard"]["marcus_yuki"]` etc.
   - Each scene shows both fighters in the correct BJJ position
   - 255KB total, 88% WebP quality

3. **GrappleCompositor rewired** — checks for paired scenes FIRST
   - Priority: Paired Scene > Template Compositor > Individual Sprites
   - Template compositor remains as fallback for character combos without scenes
   - `hasTemplate()` returns true for all ground positions (scenes always available)

4. **GrappleView upgraded** — renders at 260px with proper drop shadows
   - `imageRendering: "auto"` (smooth, not pixelated) for the detailed art
   - Centered at 50%/55% in arena with breathing animation

### Current Coverage

| Position | Marcus on Top | Yuki on Top |
|---|---|---|
| Closed Guard | **Done** (A1) | NEEDS ART |
| Open Guard | **Done** (A2) | NEEDS ART |
| Half Guard | **Done** (A3) | NEEDS ART |
| Side Control | **Done** (A4) | NEEDS ART |
| Mount | **Done** (A5) | NEEDS ART |
| Back Control | **Done** (A6) | NEEDS ART |
| Turtle | **Done** (A7) | NEEDS ART |
| Standing Clinch | **Done** (A8) | NEEDS ART |

**When Yuki is on top**: Falls back to geometric template compositor (functional but lower quality).

### To Add Yuki-on-top Scenes

1. Generate 8 images using prompts in `CHATGPT_ART_PROMPTS.md`
2. Save as `R1_closed_guard_yuki_top.png` through `R8_...` in `raw_sprites/`
3. Run: `node scripts/process_sprites.js --mode ground`
4. Run: `node scripts/inject_scenes.js`
5. Done — game automatically uses correct art based on who's on top

### Adding New Characters (Darius, Diego)

Per new character, generate:
- 8 images: new char on top vs each existing character
- 8 images: each existing character on top vs new char
- Save with naming convention, run pipeline, inject

---

## Previous: Template Recoloring Pipeline (v2)

The flat zone-color approach (v1) was scrapped because it destroyed all AI art detail by force-mapping every pixel to 10 flat colors. The new v2 pipeline preserves the original AI-generated art quality:

1. **High-quality sprites** — Raw AI art (1024×1024) is now downscaled to 128×128 using LANCZOS interpolation instead of nearest-neighbor + flat zone cleanup. This preserves shading, antialiasing, and muscle definition.

2. **HSV-aware recoloring** — The recoloring engine now uses hue-aware best-match zone detection instead of simple RGB tolerance. Each pixel is matched to its closest zone color considering both RGB distance and hue similarity, then recolored with perceptual luminance preservation (BT.601 weights: 0.299R + 0.587G + 0.114B).

3. **All 4 characters supported** — Marcus (stocky, tan, red shorts), Yuki (light, pale, purple shorts), Darius (medium, dark skin, green shorts), Diego (lanky, brown, orange shorts) all recolor naturally with skin tone gradients and shading preserved.

4. **Head compositing** — Procedural canvas-drawn heads for all 4 characters, composited at zone centroids.

5. **Cached per character pair** — `initGrappleCompositor()` runs once at fight start, results cached in `_compositorCache`.

See `recolor_grid_final.png` for all 15 sprites recolored (Marcus vs Yuki).

---

## Original Plan (from LOCKDOWN_SPRITE_SYSTEM.md)

The plan was a 7-phase pipeline to create a scalable grapple sprite system:

### Phase 1: Data Architecture
Define character builds, palettes, and head objects in the CHARS array.
**STATUS: DONE** — All 4 characters (Marcus, Yuki, Darius, Diego) have build assignments, palette objects (`skin`, `hair`, `shorts`, `belt` hex colors), and head sprite definitions.

### Phase 2: Canvas Recoloring Engine
Build a `TemplateRecolorCache` class that takes a zone-colored template and replaces each zone color with the actual character's palette (skin tone, shorts color, belt color) while preserving luminance/shading.
**STATUS: DONE (v2)** — HSV-aware recoloring engine ported to `lockdown-deploy/index.html`. Uses hue-weighted best-match zone detection + perceptual luminance preservation. Works with detailed LANCZOS-downscaled art (not flat zone colors).

### Phase 3: Head Compositing
Generate small per-character head sprites (front, side, top, back) and composite them onto templates at anchor points marked by `topHead` and `btmHead` zone colors.
**STATUS: DONE** — All 4 characters (Marcus, Yuki, Darius, Diego) have procedural canvas-drawn heads. Composited at zone centroids in `_doRecolorWithHeads()`. Ported to deployed `lockdown-deploy/index.html`.

### Phase 4: Fighter Component Integration
Wire the template compositing pipeline into the React rendering flow so ground positions use the recolored+headed templates instead of static sprites.
**STATUS: DONE** — `startFight()` calls `initGrappleCompositor()`, `getGrappleSprite()` checks `_compositorCache` first. Fully wired in deployed version.

### Phase 5: Template Art Production
Generate 15 body template images for all 5 ground positions × 3 size variants.
**STATUS: DONE (v2)** — 15 sprites generated using ChatGPT (DALL-E) and Google Gemini. Now uses LANCZOS-downscaled art (preserves detail) instead of flat zone-cleaned sprites. Integrated into `lockdown-deploy/index.html` as base64 WebP data URLs.

### Phase 6: Standing Sprite Expansion
Create unique standing/clinch sprites for Darius and Diego (currently locked characters).
**STATUS: NOT STARTED** — Darius and Diego still use SVG fallback silhouettes.

### Phase 7: Head Sprite Generation
Generate 4 head sprites per character (front, side, top, back) for all 8 planned roster characters.
**STATUS: DONE (4 of 8 characters)** — All 4 current characters (Marcus, Yuki, Darius, Diego) have procedural canvas-drawn heads. Ported to deployed version. Remaining 4 expansion roster characters need heads when added.

---

## What Was Done This Session

1. **Generated 15 zone-colored grapple body templates** using ChatGPT (DALL-E) and Google Gemini:
   - Guard: similar, big-on-top, small-on-top
   - Mount: similar, big-on-top, small-on-top
   - Side Control: similar, big-on-top, small-on-top
   - Half Guard: similar, big-on-top, small-on-top
   - Back Control: similar, big-on-top, small-on-top

2. **Corrected back control sprites** — User rejected original back control (wrong BJJ position). Regenerated with reference photo showing proper hooks-in and seatbelt grip. Used Gemini for the approved small-on-top variant.

3. **Quality overhaul (v2)** — Scrapped the flat zone cleanup pipeline (which destroyed all detail). Now uses LANCZOS downscaling from 1024×1024 to 128×128, preserving all shading, antialiasing, and muscle definition from the original AI art. White backgrounds made transparent.

4. **Integrated into game HTML** — 15 improved sprites converted to high-quality WebP data URLs (quality=95) and embedded in `lockdown-deploy/index.html`. Keys: `grapple_guard`, `grapple_guard_big`, `grapple_guard_small`, etc.

5. **Updated sprite selection logic** — `getGrappleSprite()` now compares fighter strength stats to pick the correct size variant (strength difference ≥ 3 triggers big/small variant).

6. **Generated QA grid** — `sprite_qa_grid_v4.png` showing all 15 sprites in a 5×3 grid.

---

## What's Now Complete (This Session)

### A. Palette Swap Engine — DONE (v2: HSV-Aware)
Improved recoloring in deployed `index.html` using `_doRecolorWithHeads()`:
- HSV-aware best-match zone detection (hue distance + RGB distance scoring)
- Perceptual luminance preservation (BT.601: 0.299R + 0.587G + 0.114B)
- Higher tolerance (130 RGB distance, 110 combined score) for LANCZOS-blended pixels
- Skips outlines (dark pixels) and transparent pixels
- Works with detailed art instead of flat zone colors

### B. Head Compositing — DONE
All 4 characters have procedural canvas-drawn head sprites:
- Marcus: 4 heads (front, side, top, back) — stocky, tan skin, black buzz cut
- Yuki: 4 heads — light build, pale skin, dark navy ponytail
- Darius: 4 heads — medium build, dark skin, black short hair
- Diego: 4 heads — lanky build, brown skin, wild dark hair
- Heads are composited at the centroid of `topHead`/`btmHead` zone clusters

### C. Build System — DONE
Body archetype constants ported:
- `light` (Yuki): scale 0.88, headSize 18
- `stocky` (Marcus): scale 1.05, headSize 22
- `medium` (Darius): scale 1.0, headSize 20
- `lanky` (Diego): scale 1.12, headSize 19

### D. Character Data Updated — DONE
All 4 CHARS entries now have `build`, `palette`, and `heads` properties.

### E. Fight Initialization — DONE
`startFight()` calls `initGrappleCompositor()` which pre-recolors all templates for the current character pair. Cached in `_compositorCache` for instant lookup during gameplay.

---

## Remaining Work (Lower Priority)

### Phase 6: Standing Sprites for Locked Characters
- Darius and Diego need full standing/clinch sprite sets (currently locked with SVG fallback)
- Need AI generation of ~8 poses each

### Phase 7: Expansion Roster
- Adele, Rusty, Luta, Mahmedov need character data, head sprites, and standing sprites

### Other Items (from PROJECT_STATUS.md)
- Mobile layout fixes
- Audio overhaul
- Remaining music tracks (6 of 9)
- D-pad minigame overhaul
- Difficulty scaling improvements

---

## Zone Color Reference

| Zone | RGB | Purpose |
|------|-----|---------|
| topSkin | (255, 100, 100) | Top fighter's skin areas |
| topGear | (100, 255, 100) | Top fighter's shorts/gear |
| topBelt | (100, 100, 255) | Top fighter's belt |
| topHead | (255, 50, 50) | Top fighter's head anchor |
| btmSkin | (255, 255, 100) | Bottom fighter's skin areas |
| btmGear | (255, 100, 255) | Bottom fighter's shorts/gear |
| btmBelt | (100, 255, 255) | Bottom fighter's belt |
| btmHead | (255, 200, 50) | Bottom fighter's head anchor |
| outline | (0, 0, 0) | Black outlines |
| background | (255, 255, 255) | Transparent (removed at integration) |

---

## File Locations

| File | Purpose |
|------|---------|
| `lockdown-deploy/index.html` | **DEPLOYED GAME** (764KB) — has 15 improved sprites + full HSV-aware recoloring engine + head compositing |
| `lockdown_game.html` | **REFERENCE** (437KB) — original compositor system (superseded by v2 in deployed version) |
| `sprites_raw/` | 15 raw AI-generated template PNGs (1024×1024 or 2048×2048) |
| `sprites_improved/` | 15 LANCZOS-downscaled 128×128 PNGs (detail preserved) |
| `sprites_clean/` | 15 flat zone-cleaned 128×128 PNGs (DEPRECATED — v1, looks terrible) |
| `recolor_grid_final.png` | Visual QA grid: all 15 sprites recolored (Marcus vs Yuki) |
| `recolor_demo_v3.png` | Before/after comparison of improved recoloring |
| `quality_comparison.png` | Side-by-side: original AI art vs flat zone vs improved |
| `LOCKDOWN_SPRITE_SYSTEM.md` | Full architecture documentation |
| `LOCKDOWN_PLAN_v2.md` | Character roster and expansion plan |
