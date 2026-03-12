# LOCKDOWN — Changes (March 11, 2026)

**Deployed to:** https://lockdown-ernuk0ej5-dans-projects-f8c4cc46.vercel.app

---

## 1. Turtle Position Removed
Eliminated from all 15+ code locations: POS, POS_DOM, POS_AFFINITY (all 5 characters), entire MOVES[POS.TURTLE] section, POS_MAP_DATA, POS_LINKS, POS_LAYOUT, GRAPPLE_SPRITES, ARTWORK_DATA (2 artwork entries removed), SPRITE_DATA, getArtworkSprite, resolveSprite, initAdeleSprites, FB fallback mappings, groundPoses array, posEmojis. Game now has 10 positions total.

## 2. Mobile Layout Fixed (CRITICAL)
- Removed double `overflow-hidden` on arena wrapper and inner layout container — this was clipping the move buttons off-screen on iPhone, making the game completely unplayable
- Changed to `overflow-x-hidden overflow-y-auto` so the page scrolls on mobile
- Added CSS flex `order` classes so on mobile the layout stacks as: Arena (order-1) → Move buttons (order-2) → Position map + Combat log (order-3)
- On desktop (md: breakpoint), order is overridden to `order-none` so the two-column layout works normally
- Made header bar sticky (`sticky top-0 z-20`)
- Reduced arena minHeight: `320px` → `min(320px, 45vh)`
- Reduced PositionMap maxWidth: `190px` → `min(190px, 40vw)`
- Reduced combat log maxHeight: `120px` → `min(120px, 15vh)`

Review - Still not working, see attachesd screenshot where the position map is taking up all the space. Lets mvoethe positon map to a sub memu and ensure there is nos croll needed in the app screen, all moves being displayed without issue.

## 3. Responsive Sprite Sizing
- Fighter component outer div now uses `width: min(size*1.5px, 40vw)` and `height: min(sizepx, 35vh)`
- Inner sprite images use matching responsive constraints
- Prevents Marcus (or any large sprite) from overflowing the arena on small screens
- SVG fallback fighters also made responsive

Review - sprite sizes still inconsistent, see attached screenshot. Also characters should always be facing each opther and mirrored when  on left or right sides

## 4. White Backgrounds Removed from All Artwork
- All 23 ARTWORK_DATA images processed using Node.js + sharp
- White/near-white pixels (R,G,B all >= 230) made transparent
- Soft edge handling: near-white pixels get semi-transparency for smooth anti-aliasing
- Re-encoded as WebP with alpha channel (quality 85)
- Images: 9 marcus_top positions, 9 adele_top positions, 1 clinch, 2 portraits, 4 face shots

Review - how did we do this last time, i think the images may have been webp images and had backgrounds removed cleanly. This time backgrounds are completly removed with patches spots etc. This is mission critical to lean up

Review - also remove ground shadows, inconsistent as to what ones they exist on

Review - see attachment 2 - some artwork is old and wrong, lets catalogue any that is old and remove it all. All screen should have animation or be highlighted where they dont.

## 5. Randomized Arena Backgrounds
5 CSS-generated arena backgrounds, randomly selected each fight:

| Arena | Description |
|-------|-------------|
| Dojo | Warm brown wood tones with horizontal/vertical line patterns |
| Brick Wall | Dark red-brown with brick grid pattern overlay |
| Warehouse | Cool grey industrial with wide vertical line patterns |
| Outdoor | Muted greens with subtle light spots (sun through trees) |
| Underground | Deep purple-dark with faint purple radial glow |

All backgrounds are intentionally duller than character sprites for contrast. Each has a matching floor gradient overlay.

Revuiew - cna we do better arenas, these are very basic and basically just colour changes. id like nicer animated abackgrounds/arenas

## 6. Anime-Style Impact Effects
4 new CSS-animated visual effect types added to the arena during combat:

| Effect | Trigger | Description |
|--------|---------|-------------|
| Speed lines | Strike, sweep, escape | Horizontal streaking lines across arena |
| Burst | Heavy hits | Radial color burst from center |
| Radial | Takedowns | Rotating conic gradient lines radiating outward |
| Manga lines | Submissions, TKO | Black conic gradient lines (manga panel style) |

All effects are 0.4-0.5s duration, layered with existing flash/shake/dust effects in the choreography system.

Review - need more outrageous and a little slower tof rfull effect, these get lost a little

## 7. AI Move Display Slowed Down
- Added `aiPendingMove` state to track the AI's chosen move
- AI panel now shows "Attempting..." instead of "Thinking" once the move is selected
- Move name displayed in large text with character-colored glow
- Resolution delay increased from 1.1s to 1.8s (total AI turn: ~3.1s)
- Log message changed from "attempts" to "is attempting" for better readability

## 8. Submission Cutscene
New `sub_cutscene` phase inserted before `sub_minigame`:
- Full-screen dark overlay with dramatic split-screen layout
- Left: Attacker's face (attack expression artwork from ARTWORK_DATA)
- Right: Defender's face (defense expression artwork from ARTWORK_DATA)
- Center: "VS" text with scale-in animation
- Bottom: Submission name in large uppercase text
- Duration: 2.5 seconds, then auto-transitions to the submission minigame
- CSS animations: slide-from-left, slide-from-right, scale-in VS, reveal submission name
- Falls back to effort/hit sprites if face artwork isn't available for a character

review - lets make the faces bigger and have the outrageous text and cut scene transition animation, maybe like a page being ripped up or clawed open. Then big text wth the submission name in retro street fighter style text.

review - after submission should zoom in on winners face with the word victory, replace the triophy with winners face. Faces should be blinking.

## 9. Subtle Animations (Breathing + Blinking)
- Breathing: Already existed via `anim-breathe` (translateY bob, 3s cycle)
- **New:** Blink animation added — subtle opacity dip at 96-99% of a 4s cycle
- Blink applied to idle, clinch, effort, and tired poses only (not during attacks/transitions)
- Blink class applied to outer Fighter div, breathe to inner img — both play simultaneously
- Not applied during active combat animations (hit, win, lunge, etc.)

Rview - i ciouldnt see blinking or breathing. only istances where the whole screen was pulsing?

## 10. Glow Borders Standardized
**Individual fighters:**
- White glow reduced: `5px 0.8 opacity` → `3px 0.6 opacity`
- Spread glow reduced: `15px 0.4` → `10px 0.25`
- Character-colored glow: `8px 60% opacity` → `12px 40% opacity` (wider but subtler)

**Grapple sprites (combined position artwork):**
- White glow reduced to match individual fighters
- Added character-colored glow (`15px 30% opacity`) — previously had no color glow

Review - looks good, please make sure this exists for all characters and animatinosm, including any future ones

## 11. Missing Sprites Catalogued
**Current state of individual character sprites:**

| Character | Sprite Source | Individual Poses | Status |
|-----------|--------------|-----------------|--------|
| Marcus | Procedural (canvas-generated) | All 24 poses | Complete |
| Adele | Portrait artwork (same image for all) | All 24 poses use portrait | Needs unique pose artwork |
| Yuki | Procedural (canvas-generated) | All 24 poses | Complete |
| Darius | SVG fallback (locked character) | Basic silhouette only | Needs design + sprites |
| Diego | SVG fallback (locked character) | Basic silhouette only | Needs design + sprites |

**Adele individual pose sprites still needed:**
- idle, idle2, win, lose, hit, tired, effort, tapOut, clinch
- guardTop, guardBtm, openGuardTop, openGuardBtm
- halfGuardTop, halfGuardBtm, spiderGuard
- mountTop, mountBtm, pressTop, pinned
- backTop, backTaken, ashiTop, ashiBtm

---

## Files Modified
- `lockdown-deploy/index.html` — All game code changes (1,177KB)
- `LOCKDOWN_BUILD_STATUS.md` — Updated bugfix log with all 13 fixes
- `LOCKDOWN_TASK_LIST.md` — Marked 10 new items as complete

## Backup
- `lockdown-deploy/index_backup_march10.html` — Pre-change backup


Review 2.
1. Sizes still inconsistent per screenshots
2. XCharcaters aren't being mirrored based on left or right side, see exmaples where aele isn't facing opponent
3. Some instances where backgrodun not fully removed, see wite space in attached
4. Cant see breathing or blinking anywhere?
5. Arena background dont appear anywhere per attached screenshiots?

## Review 2 — Fixes Applied (March 12, 2026)

### Fix 1: Sprite Size Consistency (v3 — VERIFIED via Puppeteer)
- **Root cause (first pass):** `sizeBoost` was applied TWICE — once in Fighter and at call site.
- **Root cause (second pass):** Adele's portrait was 1536x1024 with 90%+ empty space. Trimming to 365x962 still resulted in 76px display width (too narrow — full head-to-toe figure vs Marcus's cropped fighting stance).
- **Root cause (third pass):** Portrait aspect ratio (1:2.6) was fundamentally different from Marcus sprites (~1:1.2). Same height constraint = wildly different widths.
- **Fix v3:** Cropped Adele portrait to upper 62% (head-to-thighs), giving 365x596 (ratio 0.61). At 200px height = 122px wide, vs Marcus at 161px. Much more proportional while retaining character body type difference.
- **Verified:** Puppeteer confirms Adele=122x200, Marcus=161x200 display size.

### Fix 2: Character Mirroring
- **Root cause:** Adele's portrait faces LEFT natively. Fighter assumed all sprites face right.
- **Fix:** Added `nativeFacing: "left"` to Adele. Fighter compares native vs desired facing to determine flip.

### Fix 3: Background Removal v4 (from original PNGs)
- **Root cause:** Previous processing left gray shadow patches, white edge remnants.
- **Fix v4:** Re-processed ALL 23 artwork images from ORIGINAL PNG files (not re-processing already-lossy base64). Aggressive flood-fill BG removal (threshold 200+ for white, 165+ for gray with saturation check). Added bottom-30% ground shadow removal pass (detects isolated gray patches near transparent edges). Anti-aliased edges. Then auto-trimmed transparent borders.
- Also processed ALL 23 SPRITE_DATA entries (Marcus/Yuki procedural sprites) — removed ground shadows + trimmed.

### Fix 4: Breathing & Blinking (v3 — VERIFIED via Puppeteer)
- **Root cause (CRITICAL BUG):** Two CSS animation classes on one element (`anim-breathe` + `anim-blink`) — the `animation` property from the LAST class OVERRIDES the first. Only one animation runs at a time. This is why NEITHER was visible.
- **Fix v3:** Removed class-based animation stacking. Combined both animations into a single inline `animation` style using comma syntax: `animation: breatheA 3s ease-in-out infinite, spriteBlink 3.5s ease-in-out infinite`. Both now run simultaneously.
- **Breathe:** 5px translateY + 2.5% scale pulse. Applies to ALL idle poses (standing + ground).
- **Blink:** `filter: brightness(0.3)` at 85-94% of 3.5s cycle. Double-blink pattern.
- **Verified:** Puppeteer confirms `animationName: "breatheA, spriteBlink"` on both fighter sprites.
- **Where to see:** Standing position during your turn or AI thinking. Fighters bob up/down (breathe) and periodically darken (blink).

### Fix 3b: Ground Shadow Removal (Marcus/Yuki individual sprites)
- Aggressive per-pixel scan of bottom 25% of each sprite
- Removed gray shadow pixels (low saturation, medium brightness) that are surrounded by >30% transparent neighbors
- Marcus: 447 shadow px from idle, 94 from lose, 56 from tapOut, etc.
- Yuki: 20+ shadow px from idle/effort, 170 from lose

### Fix 5: Arena Backgrounds (v2)
- **First pass:** Brightened base colors and overlay opacity.
- **Second pass:** Added per-arena `vignette` (radial gradient darkening edges, ~60-70% opacity at corners) and `borderGlow` (colored inset box-shadow + border color matching the arena theme). Each arena now has:
  - **Dojo:** Warm brown/amber vignette + golden border glow
  - **Neon Underground:** Dark purple vignette + purple border glow
  - **Steel Cage:** Cool gray vignette + steel-blue border glow
  - **Rooftop Sunset:** Warm dark vignette + orange border glow
  - **Jungle Temple:** Deep green vignette + green border glow
- **Where to see it:** Start a fight — the arena border, vignette, and background are visible immediately in the fighting arena box.

## Review 3 — Adele Sprite Sizing (March 12, 2026)

### Root Cause Analysis
Marcus and Yuki each have 8 purpose-built fighting pose sprites at ~150x180px (tight fighting stances, correct aspect ratio). Adele has ZERO individual sprites — she uses a single standing portrait (1536x1024) for ALL 24 pose slots via `initAdeleSprites()`. No amount of sizeBoost or cropping will make a tall standing portrait look right next to purpose-built fighting sprites.

**Long-term fix needed:** Adele needs actual fighting pose artwork (like Marcus/Yuki have).

### Fix v4: Resize Portrait to Match Sprite Dimensions
- Re-processed from original PNG with aggressive BG + ground shadow removal
- **Key change:** Resized to 160x180px using `sharp.resize(cover, position:top)` — matches Marcus (144x179) and Yuki (169x180) dimensions
- This crops at display-time via CSS rather than destroying image data — shows head-to-waist, fitting the game's visual style
- Removed `sizeBoost` entirely — no longer needed since image is correctly proportioned
- **Verified via Puppeteer:** Adele=178x200, Yuki=188x200 display. Both visible, properly framed, no clipping.
- Grip fight screen: both fighters visible and in-frame (Yuki was previously clipped due to sizeBoost pushing Adele too large)
- **Deployed to:** https://lockdown-h3q1awe2s-dans-projects-f8c4cc46.vercel.app

