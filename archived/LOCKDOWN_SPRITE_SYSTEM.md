# LOCKDOWN — Scalable Sprite & Animation System
## Implementation Guide for Claude Code

> **Context**: LOCKDOWN is a browser-based BJJ fighting game (single-file React JSX) with CPS2/Street Fighter II pixel art aesthetics. The game currently has 2 playable characters (Marcus, Yuki) with hand-drawn AI-generated sprites embedded as base64 data URIs. This document defines the architecture and step-by-step implementation plan for a scalable sprite system that supports 10+ characters without combinatorial art explosion.

---

## 1. THE PROBLEM

BJJ grappling games have a unique visual challenge: unlike striking games where fighters animate independently, grappling requires **two bodies physically intertwined**. Every ground position (Guard, Mount, Side Control, Back Control, Half Guard) shows tangled limbs, weight distribution, and body contact that makes misalignment immediately obvious.

**Current state**: Each character has ~16 hand-drawn sprites (idle, win, lose, positional poses). Adding a new character means creating all positional sprites from scratch. With 4 characters across 8 positions × top/bottom orientations, that's a combinatorial nightmare.

**Target state**: A system where adding a new character requires only:
- 2–3 full standing/clinch sprites (AI-generated, unique per character)
- 4–5 small head sprites (front, side, top-down, back-of-head)
- A color palette definition (JSON)
- A body archetype assignment (one string)

All ground grapple positions are handled by **shared body templates** + **programmatic color swapping** + **head compositing**.

---

## 2. ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                     SPRITE RESOLUTION FLOW                       │
│                                                                   │
│  resolveSprite(char, position, isOnTop, ...)                     │
│       │                                                           │
│       ├─── Standing/Clinch? ──→ Full character sprite (AI art)   │
│       │                         Unique per character              │
│       │                         Stored as base64 data URIs        │
│       │                                                           │
│       └─── Ground position? ──→ Template Compositing Pipeline    │
│               │                                                   │
│               ├─ 1. Resolve body template (position + size pair) │
│               ├─ 2. Recolor template zones → character palettes  │
│               ├─ 3. Composite head sprites at anchor points      │
│               ├─ 4. Apply build-specific scale modifiers         │
│               └─ 5. Cache result as data URL                     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Standing vs Ground Split

| Position | Rendering Method | Art Source |
|----------|-----------------|------------|
| Standing | Full unique character sprite | AI-generated per character |
| Clinch | Full unique character sprite | AI-generated per character |
| Scramble | Full unique character sprite | AI-generated per character |
| Guard | Template compositing | Shared body template + recolor + heads |
| Half Guard | Template compositing | Shared body template + recolor + heads |
| Side Control | Template compositing | Shared body template + recolor + heads |
| Mount | Template compositing | Shared body template + recolor + heads |
| Back Control | Template compositing | Shared body template + recolor + heads |

**Rationale**: Standing/Clinch/Scramble positions show characters upright and mostly separate — this is where character identity is strongest and unique silhouettes matter most. Ground positions involve intertwined bodies where shared templates with color/head differentiation are both sufficient and dramatically more scalable.

---

## 3. BODY ARCHETYPES

Four body types that cover the range of BJJ competition physiques:

```javascript
const BUILDS = {
  light: {
    label: "Light",
    desc: "Lean, compact, flexible. Narrower shoulders, longer limbs relative to torso.",
    scale: 0.88,       // Overall size multiplier
    widthMod: 0.90,    // Horizontal stretch (narrower)
    heightMod: 0.95,   // Vertical stretch
    headSize: 18,       // Head sprite render size in px
    example: "Featherweight guard players"
  },
  medium: {
    label: "Medium",
    desc: "Balanced, athletic build. Proportional limbs and torso.",
    scale: 1.0,
    widthMod: 1.0,
    heightMod: 1.0,
    headSize: 20,
    example: "Classic middleweight"
  },
  stocky: {
    label: "Stocky",
    desc: "Thick, wide, powerful. Broad shoulders, shorter neck, dense limbs.",
    scale: 1.05,
    widthMod: 1.15,    // Wider frame
    heightMod: 0.97,   // Slightly compressed
    headSize: 22,
    example: "Pressure wrestlers, heavyweights"
  },
  lanky: {
    label: "Lanky",
    desc: "Tall, long-limbed, narrow. Exaggerated reach, visible height advantage.",
    scale: 1.12,
    widthMod: 0.92,    // Narrow but tall
    heightMod: 1.10,   // Taller
    headSize: 19,
    example: "Spider guard, rubber guard players"
  },
};
```

### Current Roster Assignments

| Character | Build | Rationale |
|-----------|-------|-----------|
| Marcus "The Bull" Reyes | `stocky` | Pressure wrestler, Strength 10, wide powerful frame |
| Yuki "Spider" Tanaka | `light` | Technical guard player, Strength 4, compact flexible |
| Darius "The Ghost" Okeke | `medium` | Counter fighter, balanced stats, athletic build |
| "Loco" Diego Vega | `lanky` | Wild card scrambler, Speed 10, long limbs for leg entanglement |

---

## 4. CHARACTER DATA SCHEMA

### Updated Character Definition

Each character in the `CHARS` array gains these new properties:

```javascript
{
  id: "marcus",
  name: 'Marcus "The Bull" Reyes',
  // ... existing fields (stats, sig, bio, etc.) ...

  // NEW — Build & Visual System
  build: "stocky",                    // Body archetype key

  palette: {
    skin:   "#D4956A",               // Skin tone (hex)
    hair:   "#1a1a1a",               // Hair color
    shorts: "#e63946",               // Shorts/gear primary
    belt:   "#8B4513",               // Belt/waistband
    accent: "#ff6b6b",              // Tape, trim, secondary detail
    // These map to template color zones during recoloring
  },

  heads: {
    front:    "marcus_head_front",    // Key into HEAD_SPRITES data
    side:     "marcus_head_side",
    topDown:  "marcus_head_top",
    back:     "marcus_head_back",
  },

  // Standing sprites remain per-character (AI-generated, full body)
  sprites: {
    idle:    "marcus_idle",           // Keys into SPRITE_DATA
    idle2:   "marcus_idle2",
    win:     "marcus_win",
    lose:    "marcus_lose",
    hit:     "marcus_hit",
    tired:   "marcus_tired",
    effort:  "marcus_effort",
    tapOut:  "marcus_tapOut",
    clinch:  "marcus_clinch",         // NEW — clinch-specific
    scramble:"marcus_scramble",       // NEW — scramble-specific
  },
}
```

### Head Sprite Data Store

```javascript
const HEAD_SPRITES = {
  // Each is a small (20x20 to 24x24) pixel art head, base64 encoded
  "marcus_head_front":  "data:image/webp;base64,...",
  "marcus_head_side":   "data:image/webp;base64,...",
  "marcus_head_top":    "data:image/webp;base64,...",
  "marcus_head_back":   "data:image/webp;base64,...",
  "yuki_head_front":    "data:image/webp;base64,...",
  // ... etc
};
```

---

## 5. GRAPPLE BODY TEMPLATES

### Template Design Principles

1. **Templates are drawn with flat, easily-replaceable zone colors** — not realistic skin tones
2. **Two fighters are shown intertwined** in the correct BJJ position
3. **No heads** — bodies end at the neck with a solid-color circle (anchor target)
4. **Two size variants per position**: "similar" (both fighters same-ish build) and "mismatch" (visible size difference)
5. **Template resolution is ~128×128 pixels**, CPS2 pixel art style

### Template Color Zones

When creating template art, use these EXACT colors for each zone. The recoloring system will find and replace them:

```javascript
const TEMPLATE_ZONES = {
  // Top fighter (on-top / dominant position) zones
  topSkin:   { r: 255, g: 100, b: 100, label: "Salmon Red" },
  topGear:   { r: 100, g: 255, b: 100, label: "Lime Green" },
  topBelt:   { r: 100, g: 100, b: 255, label: "Blue" },
  topHead:   { r: 255, g: 50,  b: 50,  label: "Bright Red (head anchor)" },

  // Bottom fighter (underneath / controlled) zones
  btmSkin:   { r: 255, g: 255, b: 100, label: "Yellow" },
  btmGear:   { r: 255, g: 100, b: 255, label: "Magenta" },
  btmBelt:   { r: 100, g: 255, b: 255, label: "Cyan" },
  btmHead:   { r: 255, g: 200, b: 50,  label: "Gold (head anchor)" },
};
```

**Important**: Zone colors must be distinct enough that no anti-aliasing or compression creates ambiguous pixels. Use flat fills with hard edges — no gradients within zones.

### Template File Naming Convention

```
grapple_{position}_{sizeVariant}.png

Examples:
  grapple_guard_similar.png        — Guard, similar-sized fighters
  grapple_guard_mismatch.png       — Guard, visibly different sizes
  grapple_mount_similar.png        — Mount, similar-sized
  grapple_mount_mismatch.png       — Mount, size mismatch
  grapple_sidecontrol_similar.png
  grapple_sidecontrol_mismatch.png
  grapple_halfguard_similar.png
  grapple_halfguard_mismatch.png
  grapple_backcontrol_similar.png
  grapple_backcontrol_mismatch.png
```

**Total template images needed: 10** (5 ground positions × 2 size variants)

### Template Resolution Logic

```javascript
function getGrappleTemplate(position, topBuild, btmBuild) {
  const topScale = BUILDS[topBuild].scale;
  const btmScale = BUILDS[btmBuild].scale;
  const sizeDiff = Math.abs(topScale - btmScale);

  // Threshold: if scale difference > 0.12, use mismatch variant
  const variant = sizeDiff > 0.12 ? "mismatch" : "similar";

  // Map position enum to template name
  const posKey = {
    [POS.GUARD]: "guard",
    [POS.HALF_GUARD]: "halfguard",
    [POS.SIDE_CONTROL]: "sidecontrol",
    [POS.MOUNT]: "mount",
    [POS.BACK_CONTROL]: "backcontrol",
  }[position];

  return `grapple_${posKey}_${variant}`;
}
```

### When Top Fighter Is Smaller

If the top fighter has a smaller build than the bottom fighter (e.g., Yuki mounting Marcus), apply a CSS/canvas transform to the template:
- Slightly reduce the top body zone scale
- Slightly increase the bottom body zone scale
- This is handled via the `widthMod` and `heightMod` values, not via separate art

---

## 6. PALETTE SWAP SYSTEM (Canvas-Based Recoloring)

### Why Canvas Instead of CSS Filters

CSS filter chains (`hue-rotate`, `sepia`, `saturate`) can only shift the entire image's palette globally. Since grapple templates contain **two different fighters' bodies**, we need to recolor each fighter's zones independently. Canvas pixel manipulation gives us this per-zone control.

### Implementation

```javascript
class TemplateRecolorCache {
  constructor() {
    this.cache = new Map(); // key: "templateName_topCharId_btmCharId" → data URL
    this.templateImages = new Map(); // loaded Image objects
  }

  // Pre-load all template images
  async loadTemplates(templateData) {
    for (const [name, dataUrl] of Object.entries(templateData)) {
      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => { img.onload = resolve; });
      this.templateImages.set(name, img);
    }
  }

  // Get (or create) a recolored template for a specific character pairing
  getRecolored(templateName, topChar, btmChar) {
    const cacheKey = `${templateName}_${topChar.id}_${btmChar.id}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    const img = this.templateImages.get(templateName);
    if (!img) return null;

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Define replacement mapping
    const replacements = [
      { zone: TEMPLATE_ZONES.topSkin, target: hexToRgb(topChar.palette.skin) },
      { zone: TEMPLATE_ZONES.topGear, target: hexToRgb(topChar.palette.shorts) },
      { zone: TEMPLATE_ZONES.topBelt, target: hexToRgb(topChar.palette.belt) },
      { zone: TEMPLATE_ZONES.btmSkin, target: hexToRgb(btmChar.palette.skin) },
      { zone: TEMPLATE_ZONES.btmGear, target: hexToRgb(btmChar.palette.shorts) },
      { zone: TEMPLATE_ZONES.btmBelt, target: hexToRgb(btmChar.palette.belt) },
    ];

    // Pixel-by-pixel color replacement with tolerance for compression artifacts
    const TOLERANCE = 30; // Allow ±30 per channel for anti-aliasing
    for (let i = 0; i < data.length; i += 4) {
      for (const { zone, target } of replacements) {
        if (
          Math.abs(data[i]   - zone.r) < TOLERANCE &&
          Math.abs(data[i+1] - zone.g) < TOLERANCE &&
          Math.abs(data[i+2] - zone.b) < TOLERANCE
        ) {
          // Preserve luminance variation for shading
          const lumOrig = (data[i] + data[i+1] + data[i+2]) / 3;
          const lumZone = (zone.r + zone.g + zone.b) / 3;
          const lumRatio = lumOrig / (lumZone || 1);

          data[i]   = Math.min(255, Math.round(target.r * lumRatio));
          data[i+1] = Math.min(255, Math.round(target.g * lumRatio));
          data[i+2] = Math.min(255, Math.round(target.b * lumRatio));
          break;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    const resultUrl = canvas.toDataURL("image/png");
    this.cache.set(cacheKey, resultUrl);
    return resultUrl;
  }
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 128, g: 128, b: 128 };
}
```

### Luminance Preservation

The recoloring system preserves the **shading and volume** of the original template by calculating each pixel's luminance ratio relative to the zone's base color, then applying that ratio to the target color. This means if the template artist paints highlights and shadows within a zone, they carry over to any character's palette.

---

## 7. HEAD COMPOSITING SYSTEM

### Head Anchor Points

Each grapple position defines where each fighter's head should be placed, varying by body archetype:

```javascript
const HEAD_ANCHORS = {
  [POS.GUARD]: {
    top: {
      // Fighter on top in guard: leaning forward over bottom fighter
      view: "front",      // Which head sprite angle to use
      light:  { x: 50, y: 24, angle: -10, scale: 1.0 },
      medium: { x: 50, y: 22, angle: -10, scale: 1.0 },
      stocky: { x: 50, y: 20, angle: -12, scale: 1.05 },
      lanky:  { x: 50, y: 18, angle: -8,  scale: 1.0 },
    },
    btm: {
      // Fighter on bottom in guard: flat on back, face up
      view: "front",
      light:  { x: 50, y: 72, angle: 0, scale: 1.0 },
      medium: { x: 50, y: 70, angle: 0, scale: 1.0 },
      stocky: { x: 50, y: 68, angle: 0, scale: 1.05 },
      lanky:  { x: 50, y: 66, angle: 0, scale: 1.0 },
    },
  },

  [POS.MOUNT]: {
    top: {
      view: "front",
      light:  { x: 50, y: 22, angle: -5, scale: 1.0 },
      medium: { x: 50, y: 20, angle: -5, scale: 1.0 },
      stocky: { x: 50, y: 18, angle: -8, scale: 1.05 },
      lanky:  { x: 50, y: 16, angle: -5, scale: 1.0 },
    },
    btm: {
      view: "topDown",    // Mounted fighter seen from above
      light:  { x: 50, y: 64, angle: 0, scale: 1.0 },
      medium: { x: 50, y: 62, angle: 0, scale: 1.0 },
      stocky: { x: 50, y: 60, angle: 0, scale: 1.05 },
      lanky:  { x: 50, y: 58, angle: 0, scale: 1.0 },
    },
  },

  [POS.SIDE_CONTROL]: {
    top: {
      view: "side",       // Top fighter viewed from side, pressing down
      light:  { x: 46, y: 26, angle: -20, scale: 1.0 },
      medium: { x: 46, y: 24, angle: -20, scale: 1.0 },
      stocky: { x: 46, y: 22, angle: -22, scale: 1.05 },
      lanky:  { x: 46, y: 20, angle: -18, scale: 1.0 },
    },
    btm: {
      view: "side",       // Bottom fighter on side, face turned
      light:  { x: 54, y: 66, angle: 10, scale: 1.0 },
      medium: { x: 54, y: 64, angle: 10, scale: 1.0 },
      stocky: { x: 54, y: 62, angle: 8,  scale: 1.05 },
      lanky:  { x: 54, y: 60, angle: 12, scale: 1.0 },
    },
  },

  [POS.HALF_GUARD]: {
    top: {
      view: "side",
      light:  { x: 48, y: 26, angle: -15, scale: 1.0 },
      medium: { x: 48, y: 24, angle: -15, scale: 1.0 },
      stocky: { x: 48, y: 22, angle: -18, scale: 1.05 },
      lanky:  { x: 48, y: 20, angle: -12, scale: 1.0 },
    },
    btm: {
      view: "side",
      light:  { x: 52, y: 66, angle: 5, scale: 1.0 },
      medium: { x: 52, y: 64, angle: 5, scale: 1.0 },
      stocky: { x: 52, y: 62, angle: 3, scale: 1.05 },
      lanky:  { x: 52, y: 60, angle: 7, scale: 1.0 },
    },
  },

  [POS.BACK_CONTROL]: {
    top: {
      view: "front",      // Back-taker faces viewer, behind opponent
      light:  { x: 48, y: 22, angle: -5, scale: 1.0 },
      medium: { x: 48, y: 20, angle: -5, scale: 1.0 },
      stocky: { x: 48, y: 18, angle: -6, scale: 1.05 },
      lanky:  { x: 48, y: 16, angle: -4, scale: 1.0 },
    },
    btm: {
      view: "back",       // Person whose back is taken faces away
      light:  { x: 52, y: 58, angle: 8, scale: 1.0 },
      medium: { x: 52, y: 56, angle: 8, scale: 1.0 },
      stocky: { x: 52, y: 54, angle: 6, scale: 1.05 },
      lanky:  { x: 52, y: 52, angle: 10, scale: 1.0 },
    },
  },
};
```

> **Note**: x/y values are percentages of the template image dimensions. These will need tuning once actual template art is created. The values above are starting estimates based on typical BJJ position geometry.

### Head Rendering

```javascript
function compositeHeads(canvas, ctx, position, topChar, btmChar) {
  const anchors = HEAD_ANCHORS[position];
  if (!anchors) return;

  // Top fighter head
  const topAnchor = anchors.top[topChar.build];
  const topHeadKey = topChar.heads[anchors.top.view];
  const topHeadImg = HEAD_SPRITES[topHeadKey];
  if (topHeadImg && topAnchor) {
    drawHead(ctx, topHeadImg, topAnchor, BUILDS[topChar.build].headSize, canvas);
  }

  // Bottom fighter head
  const btmAnchor = anchors.btm[btmChar.build];
  const btmHeadKey = btmChar.heads[anchors.btm.view];
  const btmHeadImg = HEAD_SPRITES[btmHeadKey];
  if (btmHeadImg && btmAnchor) {
    drawHead(ctx, btmHeadImg, btmAnchor, BUILDS[btmChar.build].headSize, canvas);
  }
}

function drawHead(ctx, headSrc, anchor, size, canvas) {
  const img = new Image();
  img.src = headSrc;
  const px = (anchor.x / 100) * canvas.width;
  const py = (anchor.y / 100) * canvas.height;
  const renderSize = size * (anchor.scale || 1.0);

  ctx.save();
  ctx.translate(px, py);
  ctx.rotate((anchor.angle || 0) * Math.PI / 180);
  ctx.drawImage(img, -renderSize/2, -renderSize/2, renderSize, renderSize);
  ctx.restore();
}
```

---

## 8. UPDATED SPRITE RESOLUTION FLOW

### Modified `resolveSprite` Function

The existing `resolveSprite` function determines **which pose to show**. We modify it to also signal whether to use the template pipeline:

```javascript
function resolveSprite(char, { position, isOnTop, stamina, isMinigame, animState }) {
  // Emotional/state overrides (unchanged)
  if (animState === "win") return { pose: "win", method: "sprite" };
  if (animState === "hit") return { pose: "hit", method: "sprite" };
  if (stamina < 25 && animState !== "win") return { pose: "tired", method: "sprite" };
  if (isMinigame) return { pose: "effort", method: "sprite" };

  // Standing positions → full character sprites
  if (isNeutralPos(position)) return { pose: "idle", method: "sprite" };

  // Ground positions → template compositing pipeline
  return {
    pose: isOnTop ? "grappleTop" : "grappleBtm",
    method: "template",
    position: position,
    isOnTop: isOnTop,
  };
}
```

### Modified `Fighter` Component

The `Fighter` component gains a third rendering path (alongside existing `<img>` and fallback `<svg>`):

```javascript
function Fighter({ char, opponentChar, facing="right", pose="idle", method="sprite",
                   grapplePos=null, isOnTop=false, size=120, isAttacking=false }) {

  // ... existing transition logic ...

  if (method === "template" && grapplePos && opponentChar) {
    // TEMPLATE COMPOSITING PATH
    const topChar = isOnTop ? char : opponentChar;
    const btmChar = isOnTop ? opponentChar : char;
    const templateName = getGrappleTemplate(grapplePos, topChar.build, btmChar.build);
    const composited = templateCache.getComposited(templateName, topChar, btmChar, grapplePos);

    if (composited) {
      return (
        <div style={{ width: size, height: size, position: "relative" }}>
          <img src={composited} alt={grapplePos}
            style={{ width: size, height: size, objectFit: "contain", imageRendering: "pixelated" }}
            draggable={false} />
        </div>
      );
    }
  }

  if (method === "sprite") {
    // EXISTING CHARACTER SPRITE PATH (standing/clinch/scramble)
    const spriteUrl = getSprite(char.id, actualPose);
    // ... existing sprite rendering code ...
  }

  // FALLBACK SVG PATH (unchanged)
  // ... existing SVG rendering code ...
}
```

---

## 9. FULL COMPOSITING PIPELINE

This is the end-to-end function that produces a final composited grapple image:

```javascript
class GrappleCompositor {
  constructor() {
    this.recolorCache = new TemplateRecolorCache();
    this.compositedCache = new Map();
  }

  async init(templateData) {
    await this.recolorCache.loadTemplates(templateData);
  }

  getComposited(templateName, topChar, btmChar, position) {
    const key = `${templateName}_${topChar.id}_${btmChar.id}_${position}`;
    if (this.compositedCache.has(key)) return this.compositedCache.get(key);

    // Step 1: Get recolored template
    const recolored = this.recolorCache.getRecolored(templateName, topChar, btmChar);
    if (!recolored) return null;

    // Step 2: Draw recolored template onto canvas
    const img = new Image();
    img.src = recolored;

    const canvas = document.createElement("canvas");
    canvas.width = 128;  // Template standard size
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false; // Pixel art — no anti-aliasing
    ctx.drawImage(img, 0, 0, 128, 128);

    // Step 3: Composite head sprites
    compositeHeads(canvas, ctx, position, topChar, btmChar);

    // Step 4: Apply build-specific scaling (subtle stretch/compress)
    // This is applied at render time via CSS transform, not baked in

    // Step 5: Export and cache
    const result = canvas.toDataURL("image/png");
    this.compositedCache.set(key, result);
    return result;
  }
}
```

---

## 10. IMPLEMENTATION PHASES

### Phase 1: Data Architecture (No Art Needed)
**Goal**: Add build system, palette schema, and template resolution logic to codebase.

Tasks:
- [ ] Add `build` property to all 4 characters in `CHARS` array
- [ ] Add `palette` object to each character (migrate existing `skin`/`hair`/`shorts`/`belt` into it)
- [ ] Add `heads` object to each character (empty/placeholder initially)
- [ ] Create `BUILDS` constant with all 4 archetype definitions
- [ ] Create `TEMPLATE_ZONES` constant
- [ ] Create `getGrappleTemplate()` resolution function
- [ ] Create `HEAD_ANCHORS` data structure (with estimated values)
- [ ] Update `resolveSprite()` to return `{ pose, method }` object
- [ ] Ensure all call sites of `resolveSprite()` handle the new return format
- [ ] **Tests**: Game still plays normally using existing sprites (no visual changes yet)

### Phase 2: Canvas Recoloring Engine
**Goal**: Build and test the pixel-level palette swap system.

Tasks:
- [ ] Implement `hexToRgb()` utility
- [ ] Implement `TemplateRecolorCache` class with `loadTemplates()` and `getRecolored()` methods
- [ ] Implement luminance-preserving color replacement algorithm
- [ ] Create a simple test: load a test template image, recolor it with Marcus vs Yuki palettes, verify output
- [ ] Handle edge cases: transparent pixels (skip), anti-aliased edges (tolerance matching)
- [ ] **Tests**: Given a template with known zone colors, recoloring produces correct character colors with shading preserved

### Phase 3: Head Compositing
**Goal**: Overlay head sprites onto recolored templates.

Tasks:
- [ ] Implement `compositeHeads()` function
- [ ] Implement `drawHead()` with rotation and scaling
- [ ] Create placeholder head sprites (can be simple colored circles initially)
- [ ] Verify head positioning against template anchor points
- [ ] **Tests**: Composited output shows heads at correct positions and angles

### Phase 4: Fighter Component Integration
**Goal**: Connect the template pipeline into the actual game renderer.

Tasks:
- [ ] Create `GrappleCompositor` singleton, initialize on app load
- [ ] Modify `Fighter` component to accept `method`, `opponentChar`, `grapplePos` props
- [ ] Add template rendering path to `Fighter` (the `method === "template"` branch)
- [ ] Update all `<Fighter>` call sites to pass opponent character and position data
- [ ] Maintain existing transition animations for ground position changes
- [ ] **Tests**: Game renders ground positions using template pipeline, standing positions still use character sprites

### Phase 5: Template Art Production
**Goal**: Create the 10 base template images.

Tasks:
- [ ] Generate template art using AI (ChatGPT/DALL-E) with detailed prompts
- [ ] Each template must use EXACT zone colors defined in `TEMPLATE_ZONES`
- [ ] Create "similar" and "mismatch" variants for each ground position:
  - [ ] Guard (similar + mismatch)
  - [ ] Half Guard (similar + mismatch)
  - [ ] Side Control (similar + mismatch)
  - [ ] Mount (similar + mismatch)
  - [ ] Back Control (similar + mismatch)
- [ ] Clean up template art: ensure zone colors are flat, no gradient bleed between zones
- [ ] Convert to base64 data URIs and add to `GRAPPLE_TEMPLATES` data store
- [ ] Tune `HEAD_ANCHORS` values to match actual template art
- [ ] **Tests**: Full composited renders for all position × character combinations look correct

### Phase 6: Per-Character Head Sprites
**Goal**: Create unique head art for each character.

Tasks:
- [ ] For each character, generate 4 head sprites (front, side, topDown, back)
- [ ] Ensure consistent pixel art style matching game aesthetic
- [ ] Size: approximately 20×20 pixels (varies by build archetype)
- [ ] Convert to base64 and add to `HEAD_SPRITES` data store
- [ ] Update character `heads` objects with correct keys
- [ ] Fine-tune anchor positions per character/position
- [ ] **Tests**: Each character's head is recognizable and correctly positioned in all ground positions

### Phase 7: Standing/Clinch Sprite Expansion
**Goal**: Generate unique standing sprites for Darius and Diego.

Tasks:
- [ ] AI-generate standing sprites for Darius (medium build): idle, idle2, win, lose, hit, tired, effort, tapOut
- [ ] AI-generate standing sprites for Diego (lanky build): same set
- [ ] AI-generate clinch sprites for all 4 characters
- [ ] AI-generate scramble sprites for all 4 characters (or reuse standing with transforms)
- [ ] Convert all to base64 and add to `SPRITE_DATA`
- [ ] Update character `sprites` objects
- [ ] Unlock Darius and Diego in game
- [ ] **Tests**: All 4 characters fully playable with correct visuals in all positions

---

## 11. AI ART PROMPT TEMPLATES

### Template Body Art Prompt (for Phase 5)

```
Create a 128x128 pixel art sprite in CPS2/Street Fighter II 16-bit arcade style.

Show two no-gi BJJ fighters in [POSITION NAME] position:
- [DESCRIBE EXACT BODY POSITIONS, WHO IS ON TOP, LIMB PLACEMENT]
- Top fighter body is colored: salmon red skin (#FF6464), lime green shorts (#64FF64), blue belt (#6464FF)
- Bottom fighter body is colored: yellow skin (#FFFF64), magenta shorts (#FF64FF), cyan belt (#64FFFF)
- NO HEADS — each body ends at the neck with a flat colored circle:
  top fighter = bright red circle (#FF3232), bottom fighter = gold circle (#FFC832)
- [SIZE VARIANT]: Both fighters are [similar size / visibly different sizes — top larger than bottom]

Style requirements:
- Clean pixel art with hard edges, no anti-aliasing on color zone boundaries
- Black outline (1-2px) around both bodies
- Transparent background
- Dynamic pose showing weight distribution and grappling contact
- Viewed from slight 3/4 angle (classic fighting game perspective)
```

### Character Standing Sprite Prompt (for Phase 7)

```
Create a [WIDTH]x[HEIGHT] pixel art character sprite in CPS2/Street Fighter II 16-bit arcade style.

Character: [NAME] — [DESCRIPTION]
Build: [ARCHETYPE DESCRIPTION]
Pose: [idle fighting stance / victory celebration / hit reaction / exhausted]

Visual details:
- Skin tone: [HEX]
- Hair: [COLOR, STYLE]
- No-gi attire: [COLOR] compression shorts, [COLOR] belt/waistband
- [CHARACTER-SPECIFIC DETAILS: tattoos, tape, accessories]

Style: Clean pixel art, black outlines, transparent background, dynamic pose,
slight 3/4 angle. Should match CPS2-era Capcom fighting game aesthetic.
```

### Character Head Sprite Prompt (for Phase 6)

```
Create a set of 4 tiny pixel art head sprites (20x20 pixels each) in CPS2 style,
arranged in a 2x2 grid on transparent background:

Character: [NAME]
- Top-left: FRONT view (facing viewer)
- Top-right: SIDE view (profile, facing right)
- Bottom-left: TOP-DOWN view (looking down at top of head)
- Bottom-right: BACK view (back of head)

Details: [SKIN TONE], [HAIR COLOR/STYLE], [DISTINGUISHING FEATURES]
Style: Clean pixel art, 1px black outline, expressive despite tiny size.
```

---

## 12. MIGRATION STRATEGY

The system is designed for **incremental adoption** — no big-bang rewrite required.

### Backward Compatibility

During the transition period:
1. `resolveSprite()` returns `{ method: "template" }` for ground positions
2. If no template art exists yet for that position, **fall through to existing character-specific sprites** (Marcus/Yuki's current hand-drawn poses)
3. As templates are created, they automatically take over

```javascript
// In Fighter component, graceful fallback:
if (method === "template") {
  const composited = compositor.getComposited(templateName, topChar, btmChar, position);
  if (composited) {
    // Use composited template
    return <img src={composited} ... />;
  }
  // FALLBACK: try character-specific sprite (pre-template system)
  const fallbackPose = isOnTop ? posToTopPose(position) : posToBtmPose(position);
  const fallbackSprite = getSprite(char.id, fallbackPose);
  if (fallbackSprite) {
    return <img src={fallbackSprite} ... />;
  }
  // LAST RESORT: SVG placeholder
  return <FallbackSVG char={char} ... />;
}
```

### Character-Specific Overrides

Even after the template system is live, specific characters can have **override sprites** for specific positions. For example, Yuki's triangle choke is iconic — you might keep a hand-drawn `yuki_triangle` sprite that overrides the template when she's in Guard Bottom specifically:

```javascript
// Optional per-character position overrides
const SPRITE_OVERRIDES = {
  yuki: {
    [POS.GUARD + "_btm"]: "yuki_triangle",  // Keep her signature art
  },
};
```

---

## 13. PERFORMANCE CONSIDERATIONS

### Caching Strategy
- Template recoloring happens **once per character pairing** and is cached as a data URL
- Head compositing is cached per `(template + topChar + btmChar + position)` tuple
- For 4 characters across 5 ground positions, the maximum cache size is 4×4×5 = 80 composited images
- At ~128×128 PNG, each is roughly 5-15KB — total cache is well under 1MB

### Loading Strategy
- Template images and head sprites load on app startup (or lazy-load on first ground position)
- Compositing is triggered on first encounter of each character pairing in a position
- Subsequent renders of the same pairing are instant (cached data URL)
- Cache persists for the session; no disk persistence needed

### Mobile Optimization
- Canvas operations are fast at 128×128 resolution
- `imageSmoothingEnabled = false` ensures pixel art crispness
- Consider a maximum cache size with LRU eviction if roster grows beyond 10 characters

---

## 14. FILE STRUCTURE (Embedded in Single JSX)

Since LOCKDOWN is a single-file React JSX application, all new code is added as additional constants and functions within the same file:

```
lockdown.jsx
├── // ... existing code ...
├── BUILDS                        // Body archetype definitions
├── TEMPLATE_ZONES                // Color zone mapping for templates
├── GRAPPLE_TEMPLATES             // Base64 template images (added in Phase 5)
├── HEAD_SPRITES                  // Base64 head sprites (added in Phase 6)
├── HEAD_ANCHORS                  // Per-position, per-build anchor points
├── TemplateRecolorCache (class)  // Palette swap engine
├── GrappleCompositor (class)     // Full compositing pipeline
├── hexToRgb()                    // Utility
├── getGrappleTemplate()          // Template resolution
├── compositeHeads()              // Head overlay
├── drawHead()                    // Single head render
├── // ... modified resolveSprite() ...
├── // ... modified Fighter component ...
└── // ... rest of existing game code ...
```

---

## 15. QUICK REFERENCE: ADDING A NEW CHARACTER

Once the system is built, here's the complete checklist for adding character #5, #6, etc.:

```
□ 1. Choose body archetype: light | medium | stocky | lanky
□ 2. Define color palette: skin, hair, shorts, belt, accent (5 hex values)
□ 3. Generate 4 head sprites: front, side, topDown, back (~20x20px each)
□ 4. Generate 2-3 standing sprites: idle, win, lose (full-body, unique)
□ 5. Generate clinch/scramble sprite (full-body, unique)
□ 6. Add character to CHARS array with build, palette, heads, sprites
□ 7. Convert all art to base64 data URIs
□ 8. Test in all positions — ground positions auto-work via templates
□ 9. (Optional) Add sprite overrides for signature positions
```

**Estimated time per new character: 2-4 hours** (mostly art generation)
vs. current system: **2-4 days** (hand-drawing every position sprite)

---

## APPENDIX A: CURRENT CHARACTER DATA (for reference)

```javascript
// Marcus — to be updated with new schema
{ id:"marcus", name:'Marcus "The Bull" Reyes',
  style:"Pressure Wrestler", difficulty:"EASY",
  color:"#e63946", accent:"#ff6b6b",
  stats:{takedowns:9,guard:4,passing:8,submissions:7,escapes:5,strength:10,speed:8,stamina:9},
  skin:"#D4956A", hair:"#1a1a1a", shorts:"#e63946", belt:"#8B4513"
}

// Yuki — to be updated with new schema
{ id:"yuki", name:'Yuki "Spider" Tanaka',
  style:"Technical Guard Player", difficulty:"HARD",
  color:"#7b2ff7", accent:"#b57bff",
  stats:{takedowns:3,guard:10,passing:5,submissions:10,escapes:8,strength:4,speed:9,stamina:8},
  skin:"#F5D6B8", hair:"#0a0a2e", shorts:"#7b2ff7", belt:"#6B3FA0"
}

// Darius — locked, needs standing sprites
{ id:"darius", name:'Darius "The Ghost" Okeke',
  style:"Counter Fighter", difficulty:"MEDIUM",
  color:"#06d6a0", accent:"#64ffda",
  stats:{takedowns:6,guard:7,passing:6,submissions:7,escapes:10,strength:6,speed:9,stamina:9},
  skin:"#8B6914", hair:"#0a0a0a", shorts:"#06d6a0", belt:"#2D7A5F"
}

// Diego — locked, needs standing sprites
{ id:"diego", name:'"Loco" Diego Vega',
  style:"Wild Card Scrambler", difficulty:"MEDIUM",
  color:"#f77f00", accent:"#fca311",
  stats:{takedowns:7,guard:7,passing:5,submissions:8,escapes:5,strength:6,speed:10,stamina:8},
  skin:"#C68642", hair:"#2a1506", shorts:"#f77f00", belt:"#A85E00"
}
```

## APPENDIX B: POSITIONS REQUIRING TEMPLATES

| Position | Top Fighter Doing | Bottom Fighter Doing | Key Visual |
|----------|-------------------|---------------------|------------|
| Guard | Kneeling inside opponent's legs | On back, legs wrapped around top | Legs enveloping torso |
| Half Guard | Partially past legs, pressing down | On back, one leg entangled | Half-trapped, asymmetric |
| Side Control | Chest-to-chest, perpendicular | Flat on back, pinned | Cross-body weight |
| Mount | Sitting on opponent's torso | Flat on back, trapped | Straddling, dominant |
| Back Control | Behind opponent, hooks in | Seated/turtle, back exposed | Seatbelt grip, hooks visible |
