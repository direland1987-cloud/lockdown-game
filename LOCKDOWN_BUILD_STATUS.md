# LOCKDOWN v5 — Build Status & Master Document

## Current Build
**Location:** `lockdown-deploy/index.html`
**Version:** 2.0 (Phase 2)
**Size:** ~1,100KB+ (single self-contained HTML file)
**Dependencies:** React 18.2 (CDN), ReactDOM 18.2 (CDN), Tailwind CSS (CDN)
**Audio:** 9 MP3 files in `lockdown-deploy/` (referenced relatively)

---

## Phase 2 — What Was Added

### 1. Persistence & Foundation
- **localStorage persistence** — Replaced in-memory store with localStorage (with Safari private browsing fallback)
- **Version key** (`ld-version: "2.0"`) for future migration support
- **Storage keys:** `ld-profile`, `ld-loadouts`, `ld-campaign`, `ld-daily`, `ld-streak`, `ld-record`, `ld-eggs`

### 2. Stamina Overhaul
- **Position-aware recovery:** +4 top, +2 bottom, +3 neutral (was flat +1.5)
- **Danger zone:** <30 stamina = 1.5x move costs, harder minigames
- **Recovery moves:** "Breathe" (selfHeal: 4-8) added to Standing, Guard, Half Guard, Side Control, Mount; "Reset" added to Clinch
- **Visual upgrade:** Stamina bar h-5 with embedded number, pulse animation at <30, DANGER label, gradient on low stamina
- **CSS animations:** staminaPulse, staminaFlash, stamina-danger, danger-vignette

### 3. Minigame Simplification
- **Sequence:** 2-3 arrows (was 4-7)
- **PowerMeter:** Sweet spot widened from 60-82% to 45-78%
- **TimingRing:** Shrink rate slowed from 2.0 to 1.3
- **HoldRelease:** New minigame replacing RapidTap — hold button, release in green zone

### 4. 4-Move Equip System
- **DEFAULT_LOADOUTS** per character (marcus, adele, yuki) per position
- **Loadout screen** (`screen === "loadout"`): Position tabs, equipped/available moves, tap to swap
- **getMoves() filter:** When loadout exists, limits to 4 equipped moves per position

### 5. XP & Leveling
- **Profile state:** `{xp, upgrades}` in localStorage (`ld-profile`)
- **XP awards:** On fight finish via `calcXpReward()` — win bonus, sub finish bonus, streak bonus
- **Level calculation:** `getLevel(xp)` — sqrt-based curve
- **Skill tree** (`screen === "skills"`): 4 paths (Stamina Pool, Recovery Rate, Move Power, Sub Defense), 5 levels each
- **applyUpgrades():** Modifies fight calculations based on purchased upgrades

### 6. Title Screen Overhaul
- **7-item menu grid:** Campaign, Arcade, Training, Mini-Games, Moves, Skills, Daily
- **Player stats display:** Level, wins, streak

### 7. Campaign Mode
- **8 goon characters** with procedural canvas sprites:
  - goon_nephew, goon_trt_dad, goon_yoga_mum, goon_enforcer
  - goon_triangle, goon_influencer, goon_mma_girl, goon_purple_belt
- **6 chapters** (`CAMPAIGN_CHAPTERS`): Day One, The Grinders, Specialist Bracket, Open Mat Wars, Tournament Prep, The Black Belt Gauntlet
- **Campaign flow:** Character select (locked for duration) → Chapter map → Pre-fight intro → Fight → Result → Side-scroller (between some fights) → Next fight
- **Per-fight difficulty vectors:** `{acc, defMod}` objects instead of string keys
- **Campaign state** in localStorage: `{heroId, chapter, fight, completed}`

### 8. Training Mode
- "Training" option from title menu → enters fight with easy AI, no records

### 9. Side-Scroller Engine
- **Canvas-based** `SideScroller` component with jump physics
- **5 scenarios:** Run to the Gym, Parking Lot Escape, Mat Dash, Belt Promotion Run, Post-Training Limp
- **Wired into campaign** between fights (every other fight triggers a side-scroller)
- **Accessible from Mini-Games** menu for free play

### 10. Comedy Mini-Games (6)
- **CatchMouthguard** — Tap falling items, 3 lives
- **CleanMats** — Click spots on mat, 80% threshold timer
- **BeltWhipping** — Dodge left/right, rhythm-based
- **WashGi** — Sort whites/colors conveyor
- **DontGetStacked** — Balance tapping, progressive weight
- **TapeFingers** — Circular trace finger wrap
- **Mini-game select screen** with game picker + XP rewards on completion

### 11. Daily Challenge Expansion
- **32 challenges** (was 6) — rotating daily based on day-of-year
- **Daily streak tracker** in localStorage (`ld-daily`)
- **Milestone rewards:** 3/7/14/30/60-day streaks grant bonus XP
- **Title screen** shows streak count

### 12. SubmissionDisplay Component
- **3-image composite:** Attacker face + technique gradient placeholder + defender face
- **Type-aware gradients:** Choke (red), armbar (orange), leglock (green), default (purple)
- **Shown during** `sub_minigame` phase

### 13. Yuki Artwork Wiring
- Yuki's face artwork keys (`artwork_yuki_attack_face`, `artwork_yuki_defense_face`) already exist in ARTWORK_DATA
- Dynamic lookup `ARTWORK_DATA[artwork_${id}_attack_face]` handles Yuki automatically in cutscene + result screens

### 14. Ad/IAP Stubs
- **RewardedAd stub:** `isAvailable()` returns false, `show(callback)` calls back with `{rewarded: false}`
- **IAP stub:** 3 products defined (Remove Ads, XP Boost, Unlock All Characters), `purchase()` returns `{success: false}`
- **UI buttons** on result screen (2x XP, Stamina Boost) — hidden when `RewardedAd.isAvailable()` returns false

### 15. iOS CSS Prep
- **viewport-fit=cover** meta tag added
- **Apple mobile web app** meta tags (capable, black-translucent status bar)
- **Safe area CSS:** `.ld-body` uses `env(safe-area-inset-*)` padding

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
- **Closed Guard top:** Removed all submissions (BJJ-correct). Top now has: Open the Guard, Stack Pass, Stand Up in Guard, Posture & Pressure.
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
| **8 goons** | Campaign opponents | Various | Scaled | N/A | **Procedural canvas sprites** |

### 5. Final Artwork Integration
**32 artwork sprites embedded** (base64 WebP, ~3.4MB total, all from `Final Artwork/Backgrounds Removed/`):
- 17 position sprites for Marcus vs Adele (both directions, all positions + clinch)
- 2 turtle position sprites (Marcus top, Adele top) — embedded but Turtle position removed from game
- 6 character face portraits (Marcus/Adele/Yuki attack + defense)
- 3 full character portraits (Marcus, Adele, Yuki)
- 4 submission artwork (Marcus/Adele sub attack + sub defend) — embedded, SubmissionDisplay component built

When Marcus fights Adele, the game shows the hand-drawn CPS2 pixel art instead of procedural sprites. The `getGrappleSprite()` function checks for artwork first.

---

## Artwork Audit
**Full audit:** See `LOCKDOWN_ARTWORK_AUDIT.md` for comprehensive sprite-by-sprite inventory.

**Updated 2026-03-12:** All artwork replaced with BG-removed versions from `Final Artwork/Backgrounds Removed/`.

**Remaining gaps:**
- **Adele:** Still 0 real individual fighting sprites — portrait used as placeholder for all 24 poses
- **Marcus/Yuki:** 8 individual fighting sprites each — still old origin (from `archived/`), no BG-removed replacements exist
- **Grapple templates:** 25 embedded (old origin) + 1 missing (`grapple_turtle`) — no BG-removed replacements exist
- **Yuki portrait + faces:** Now embedded and wired into game display code
- **Submission artwork:** Marcus/Adele sub attack/defend embedded, SubmissionDisplay component built with placeholder technique shots
- **Turtle position art:** Embedded but Turtle position removed from game code
- **Goon sprites:** Procedural canvas-drawn (colored silhouettes) — need real artwork
- **Side-scroller art:** CSS gradient backgrounds, colored rectangle obstacles — need real artwork
- **Mini-game art:** Colored shapes with emoji labels — need real artwork

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
| RNC Technique | Missing (CSS gradient placeholder) |
| Guillotine Technique | Missing (CSS gradient placeholder) |
| Armbar Technique | Missing (CSS gradient placeholder) |
| Kimura Technique | Missing (CSS gradient placeholder) |
| Leg Lock Technique | Missing (CSS gradient placeholder) |
| Arm Triangle Technique | Missing (CSS gradient placeholder) |
| Triangle Technique | Missing (CSS gradient placeholder) |

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

**Status:** SubmissionDisplay component is built and renders during `sub_minigame` phase. Uses CSS gradient placeholders with submission name text for technique shots until real artwork is provided.

---

## Game Modes

| Mode | Description | Status |
|------|-------------|--------|
| **Arcade** | Quick fight — pick character, difficulty, opponent | Complete |
| **Campaign** | 6-chapter story mode with 8 goon opponents, progressive difficulty | Complete |
| **Training** | Practice sandbox with easy AI, no records | Complete |
| **Mini-Games** | 6 comedy mini-games + 5 side-scrollers | Complete |
| **Daily Challenge** | 32 rotating challenges with streak rewards | Complete |

---

## File Structure
```
BJJ 16bit game/
├── lockdown-deploy/          # THE BUILD (deploy this)
│   ├── index.html            # Main game (~1,100KB, self-contained)
│   ├── index_backup.html     # Pre-v5 backup
│   └── *.mp3                 # 9 audio files
├── Phase 2 Plan/             # Phase 2 design docs
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
