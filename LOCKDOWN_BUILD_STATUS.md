# LOCKDOWN v5 — Build Status & Master Document

## Current Build
**Location:** `lockdown-deploy/index.html`
**Size:** ~1,057KB (single self-contained HTML file)
**Dependencies:** React 18.2 (CDN), ReactDOM 18.2 (CDN), Tailwind CSS (CDN)
**Audio:** 9 MP3 files in `lockdown-deploy/` (referenced relatively)

---

## What Was Done (v5 Redesign)

### 1. Positions System
| Position | POS_DOM | Status |
|----------|---------|--------|
| Standing | 0 | Existing |
| Clinch | 1 | Existing |
| Scramble | 0 | Existing |
| Open Guard | 0.5 | Existing |
| Butterfly Guard | 1 | Existing |
| Closed Guard | 1 | Existing |
| Half Guard | 2 | Existing |
| ~~Turtle~~ | ~~3~~ | **REMOVED** |
| Side Control | 3 | Existing |
| Mount | 4 | Existing |
| Back Control | 5 | Existing |
| **Ashi Garami** | **2** | **NEW** |

### 2. Moves Overhaul
- **Closed Guard top:** Removed all submissions (BJJ-correct — you can't submit from inside closed guard easily). Top now has: Open the Guard, Stack Pass, Stand Up in Guard, Posture & Pressure.
- **Closed Guard bottom:** Added Ashi Entry, Back Take. Kept Triangle, Armbar, sweeps, stand up.
- **Open Guard:** Added Ashi Entry, Back Take, Bodylock Pass, Knee Cut for top.
- **Butterfly Guard:** Added Ashi Entry for bottom.
- **Half Guard:** Added Ashi Entry and Back Take for bottom.
- **Side Control:** Added Ashi Entry and Back Take for bottom escapes.
- **Mount:** Added Americana and Smother for top. Added Ashi Entry for bottom. Added Ghost Escape (Darius).
- **Back Control:** Updated for no-gi: removed Bow & Arrow, added Reverse Triangle and Armbar from Back.
- **Ashi Garami (NEW):** 10+ moves including Outside Heel Hook, Inside Heel Hook, Double Trouble, Knee Bar, Straight Foot Lock, Leg Control, Counter Leg Lock, Kick Free, Recover Guard, Step Over.
- **Scramble:** Leg Entangle now goes to Ashi Garami.

### 3. Character Affinity System (NEW)
Each character has positional affinities (0.7x to 1.3x multiplier) that affect:
- AI move selection (weighted picks)
- AI accuracy/score
- Defense chance calculation

| Character | Best Positions | Worst Positions |
|-----------|---------------|-----------------|
| Marcus | Standing, Clinch, Side Control, Mount (top) | Guards (bottom), Ashi Garami |
| Adele | Closed Guard (btm), Open Guard (btm), Back Control (top), Ashi (top) | Standing, Clinch, Mount (top) |
| Yuki | Open Guard (btm), Back Control (both), all bottom positions | Standing, Mount (top) |
| Darius | All escape-heavy positions (bottom SC, Mount, Back Control, Turtle) | Ashi (top) |
| Diego | Scramble, Ashi (top), Butterfly (btm) | Side Control, Mount, clinch-heavy |

### 4. Characters

| ID | Name | Style | Difficulty | Locked | Status |
|----|------|-------|-----------|--------|--------|
| marcus | Marcus "The Bull" Reyes | Pressure Wrestler | EASY | No | Has procedural sprites + artwork |
| **adele** | **Adele "The Viper" Fiorevar** | **Guard & Leg Lock Specialist** | **MEDIUM** | **No** | **NEW — has artwork portrait as sprites + head sprites** |
| yuki | Yuki "Spider" Tanaka | Technical Guard Player | HARD | No | Has procedural sprites |
| darius | Darius "The Ghost" Okeke | Counter Fighter | MEDIUM | Yes | Has procedural sprites |
| diego | "Loco" Diego Vega | Wild Card Scrambler | MEDIUM | Yes | Has procedural sprites |

### 5. Final Artwork Integration
**32 artwork sprites embedded** (base64 WebP, ~3.4MB total, all from `Final Artwork/Backgrounds Removed/`):
- 17 position sprites for Marcus vs Adele (both directions, all positions + clinch)
- 2 turtle position sprites (Marcus top, Adele top) — embedded but Turtle position removed from game
- 6 character face portraits (Marcus/Adele/Yuki attack + defense)
- 3 full character portraits (Marcus, Adele, Yuki)
- 4 submission artwork (Marcus/Adele sub attack + sub defend) — embedded, display system not yet built

When Marcus fights Adele, the game shows the hand-drawn CPS2 pixel art instead of procedural sprites. The `getGrappleSprite()` function checks for artwork first.

---

## Artwork Audit
**Full audit:** See `LOCKDOWN_ARTWORK_AUDIT.md` for comprehensive sprite-by-sprite inventory.

**Updated 2026-03-12:** All artwork replaced with BG-removed versions from `Final Artwork/Backgrounds Removed/`.

**Remaining gaps:**
- **Adele:** Still 0 real individual fighting sprites — portrait used as placeholder for all 24 poses
- **Marcus/Yuki:** 8 individual fighting sprites each — still old origin (from `archived/`), no BG-removed replacements exist
- **Grapple templates:** 25 embedded (old origin) + 1 missing (`grapple_turtle`) — no BG-removed replacements exist
- **Yuki portrait + faces:** Now embedded in ARTWORK_DATA but not yet wired into game display code
- **Submission artwork:** Marcus/Adele sub attack/defend now embedded but SubmissionDisplay component not built
- **Turtle position art:** Embedded but Turtle position removed from game code

## Artwork Inventory

### Position Art — Marcus vs Adele (COMPLETE)
| Position | Marcus Top | Adele Top |
|----------|:----------:|:---------:|
| Closed Guard | Done | Done |
| Open Guard | Done | Done |
| Butterfly Guard | Done | Done |
| Half Guard | Done | Done |
| Side Control | Done | Done |
| Mount | Done | Done |
| Turtle | Done | Done |
| Back Control | Done | Done |
| Ashi Garami | Done | Done |
| Clinch | Done (neutral) | — |

### Character Face Shots (for submissions)
| Character | Attack Face | Defense Face |
|-----------|:-----------:|:------------:|
| Marcus | Done (BG removed) | Done (BG removed) |
| Adele | Done (BG removed) | Done (BG removed) |
| Yuki | Done (BG removed) | Done (BG removed) |

### Submission Artwork (sub attack/defend poses)
| Character | Sub Attack | Sub Defend |
|-----------|:----------:|:----------:|
| Marcus | Done (BG removed) | Done (BG removed) |
| Adele | Done (BG removed) | Done (BG removed) |
| Yuki | Missing | Missing |

### Technique Shots (per lockdown-submissions.md)
| Submission | Status |
|------------|:------:|
| RNC Technique | Missing |
| Guillotine Technique | Missing |
| Armbar Technique | Missing |
| Kimura Technique | Missing |
| Leg Lock Technique | Missing |
| Arm Triangle Technique | Missing |
| Triangle Technique | Missing |

### Position Art — Other Pairs
| Pair | Status |
|------|:------:|
| Marcus vs Yuki | 4 ChatGPT images (unprocessed, in Final Artwork/Marcus Yuki/) |
| All other pairs | Not started |

---

## Submission Display System

Per `lockdown-submissions.md`, submissions use a **3-image composite**:
1. **Attack Face** — character portrait (intense finishing expression)
2. **Defense Face** — character portrait (pain/strain expression)
3. **Technique Shot** — close-up of the submission mechanic (no characters, just grips/body parts)

Currently the game shows the procedural minigame UI. To add the artwork-based submission display, we need:
- All 7 technique shots generated
- All character face shots generated
- A new `SubmissionDisplay` React component that composites the 3 images

---

## File Structure
```
BJJ 16bit game/
├── lockdown-deploy/          # THE BUILD (deploy this)
│   ├── index.html            # Main game (1,057KB, self-contained)
│   ├── index_backup.html     # Pre-v5 backup
│   └── *.mp3                 # 9 audio files
├── Final Artwork/            # Source artwork (not deployed)
│   ├── Accepted/Marcus Adele/  # 19 position PNGs
│   ├── Accepted/Marcus Yuki/   # 4 WIP PNGs
│   └── Accepted/References/    # Reference images + char sheets
├── archived/                 # Old builds, scripts, docs
├── lockdown_v5_redesign.md   # v5 design doc
├── lockdown_v5_moves_update.js # v5 moves reference
├── lockdown-characters.md    # Character descriptions for art prompts
├── lockdown-positions.md     # Position art generation prompts
├── lockdown-submissions.md   # Submission art generation prompts
└── lockdown-animation-framework.md # Animation system reference
```

---

## Deployment

### Vercel (Recommended)
The `lockdown-deploy/` folder is ready to deploy as a static site.

```bash
cd lockdown-deploy
npx vercel --prod
```

**Requirements:**
- Vercel account (free tier works)
- First deploy will prompt for login and project setup
- All audio files must be in the same directory as index.html
- No build step needed — it's a static HTML file

### Current Production URL
**https://lockdown-6nozvdflg-dans-projects-f8c4cc46.vercel.app**
Project: `lockdown_bjj` on Vercel (dans-projects-f8c4cc46)

### Alternative: Direct file
Open `lockdown-deploy/index.html` directly in a browser. Audio may not work due to browser autoplay policies (needs a server).

---

## Bugfixes Applied (Post-v5)

1. **Adele sprite fix** — Adele had no sprites in SPRITE_DATA, causing SVG fallback on character select. Fixed by `initAdeleSprites()` which copies `artwork_adele_portrait` from ARTWORK_DATA into all 26 Adele pose keys.
2. **Adele head sprites** — Added 4 pixel art head sprites (front/side/top/back) to `generateHeadSprites()` using her palette (skin: #F5D6B8, hair: #D4A420).
3. **POS_MAP_DATA crash fix** — Open Guard, Butterfly Guard, and Turtle were missing from the position map data, causing the PositionMap component to crash when drawing link lines. Added all three entries.
4. **Turtle position removed** — Removed Turtle from all game code: POS, POS_DOM, POS_AFFINITY (all 5 chars), MOVES, POS_MAP_DATA, POS_LINKS, POS_LAYOUT, GRAPPLE_SPRITES, ARTWORK_DATA (2 artwork entries), SPRITE_DATA, getArtworkSprite, resolveSprite, initAdeleSprites, FB fallbacks, groundPoses, posEmojis. Now 10 positions total.
5. **Mobile layout fix** — Removed double overflow-hidden that made game unplayable on iPhone. Made page scrollable (overflow-y-auto), reduced arena/posmap/log sizes on mobile via CSS min(), added flex order (1=arena, 2=moves, 3=posmap+log) so move buttons appear mid-screen on mobile. Made header sticky.
6. **Responsive sprite sizing** — Fighter component now uses CSS min() for width/height to prevent overflow on small screens (40vw/35vh caps).
7. **White backgrounds removed** — All 23 ARTWORK_DATA images processed via sharp to make white/near-white pixels transparent (threshold 230).
8. **Randomized arena backgrounds** — 5 CSS-generated arena backgrounds randomly selected each fight. Duller than characters for contrast. (Superseded by bugfix #16 — now elaborate animated arenas.)
9. **Anime impact effects** — 4 new effect types (burst, speed lines, radial, manga lines) triggered during strike/heavy/takedown/sweep/submission/escape choreography.
10. **AI move display slowed** — AI thinking shows "Attempting..." with move name in the panel. Resolve delay increased from 1.1s to 1.8s (total ~3.1s per AI turn).
11. **Submission cutscene** — New "sub_cutscene" phase shows attacker face + defender face + submission name in dramatic split-screen before the minigame begins (2.5s duration).
12. **Blink animation** — Subtle CSS blink effect on idle, clinch, effort, and tired poses. Combined with existing breathe animation.
13. **Glow borders standardized** — Reduced white glow intensity on individual fighters, added character-colored glow to grapple sprites. More consistent, slightly subtler look.
14. **Artwork re-processed with flood-fill BG removal** — All 23 artwork images re-processed from original PNGs using improved flood-fill algorithm that cleanly removes both white backgrounds AND ground shadows (previous threshold approach left shadow artifacts).
15. **Adele sprite size fix** — Added `sizeBoost:1.3` to Adele's character config, applied when rendering individual fighters. Fixes Adele appearing too small relative to Marcus.
16. **Elaborate animated arenas** — Upgraded from 5 basic color-scheme backgrounds to 5 fully animated arenas: Traditional Dojo (light pulses), Neon Underground (neon flicker), Steel Cage (metallic sheen), Rooftop Sunset (sun rays), Jungle Temple (fireflies). Each arena uses CSS animations for atmospheric effects.
17. **Dramatic anime impact effects** — Increased impact effect durations from 0.4-0.5s to 0.8-1.2s, bigger visual scale, added layered pseudo-element effects and shockwave rings. Much more dramatic and readable.
18. **Submission cutscene upgrade** — Bigger face images (w-36/h-36 to w-48/h-48), added rip/claw screen transition with scratch lines, SF-style submission name text with heavy text shadows, increased duration from 2.5s to 3.2s.
19. **Victory screen face artwork** — Winner's face artwork now displayed instead of trophy emoji, with zoom animation effect.
20. **Result screen face artwork** — Winner and loser face artwork shown instead of trophy/skull emoji on the result screen.
21. **Sprite size consistency fix** — Removed double sizeBoost application (was applied both in Fighter component AND at the call site, causing Adele to render at 1.69x instead of 1.3x). Now applied only once inside Fighter.
22. **Character mirroring fix** — Added `nativeFacing` property to character definitions. Adele's portrait faces left natively, so the Fighter component now flips based on native vs desired facing direction, ensuring all characters face their opponent correctly.
23. **Artwork background removal v3** — All 23 ARTWORK_DATA images reprocessed with improved edge-based flood-fill algorithm. Uses BFS from all edge pixels, removes white/near-white backgrounds AND gray shadows (saturation-aware threshold). Includes anti-aliased soft edges for clean cutouts.
24. **Breathing animation enhanced** — Increased breatheA amplitude from 2px translateY to 3px translateY + subtle 1% scale pulse. Now visibly perceptible as chest breathing.
25. **Blink animation fixed** — Moved blink from outer Fighter div (was affecting glow/shadows causing "screen pulsing") to inner img element. Changed from opacity-based (0.15) to brightness-based filter (0.4) for natural dimming without glow artifacts. Longer visible blink window.
26. **Arena backgrounds brightened** — All 5 arena base gradients increased ~50% in RGB values. Overlay effects boosted from 0.03-0.08 opacity to 0.10-0.25. Animated layer CSS classes boosted (dojo glow, neon flicker, cage sheen, sunset rays, jungle fireflies now visible). Arenas are now clearly distinguishable.
