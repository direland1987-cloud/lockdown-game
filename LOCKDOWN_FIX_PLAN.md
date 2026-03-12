# LOCKDOWN — Fix Plan (March 2026)

## Summary of Issues

Game is broken on iPhone. Move buttons can't be clicked, position grid is mangled, Adele artwork is incomplete (just her portrait reused for everything), Marcus overflows off-screen, and Turtle position artwork is missing entirely.

---

## BUG 1: Can't Click Moves on iPhone (CRITICAL — Game Unplayable)

**Root Cause:** The layout uses `flex-col` on mobile with `overflow-hidden` on the parent container. The left column (sprite area `minHeight:320px` + PositionMap ~190px + Combat Log ~120px = ~630px) fills the entire iPhone viewport. The move buttons are in the **right column**, which on mobile stacks below the left column and gets **clipped by `overflow-hidden`** — they exist in the DOM but are invisible and unreachable.

**Fix:**
1. Change `overflow-hidden` to `overflow-y-auto` on the main arena container (line ~895)
2. On mobile, restructure the layout so the move panel appears **between** the sprite area and the position map (not after everything)
3. Reduce `minHeight:320` on sprite area to ~220px on mobile (use responsive value)
4. Consider making the position map collapsible or smaller on mobile

**Key code locations:**
- Line ~895: `className="ld-body min-h-screen flex flex-col relative overflow-hidden"` — the outer wrapper
- Line ~896: `className="relative z-10 flex flex-col md:flex-row...overflow-hidden"` — the inner layout container (DOUBLE overflow-hidden!)
- Line ~896: `style={{minHeight:320}}` — sprite container forcing too much height
- Line ~905+: Move buttons rendered inside `phase==="player_pick"` conditional

---

## BUG 2: Position Grid Broken on iPhone

**Root Cause:** Same overflow issue as Bug 1. The PositionMap (190x190px SVG with `aspectRatio: 1/1`, `maxWidth: 190`) is in the left column which overflows. Position node labels overlap at small sizes because the SVG viewBox is 100x100 with 12 nodes plus text labels all crammed in.

**Fix:**
1. Fixing Bug 1 (scroll/layout) will make it visible and reachable
2. Reduce PositionMap max-width on mobile or make it horizontally scrollable
3. Consider simplifying labels on mobile (emoji only, no text)

**Key code locations:**
- Line ~759: PositionMap component
- Line ~443: POS_MAP_DATA with x/y coordinates for all 12 positions

---

## BUG 3: Adele Artwork Incomplete

**Current state:** Adele has ONE portrait image reused for all 26 pose sprites via `initAdeleSprites()` (lines 691-698). In the screenshot she's just standing as a flat portrait while Marcus has a proper fighting stance.

**What exists as files in `Final Artwork/Accepted/Marcus Adele/`:**

| Position | Adele Top (File) | Marcus Top (File) |
|----------|:---:|:---:|
| Half Guard | `Half Guard_Adele_Marcus.png` | `Half Guard_Marcus_Adele.png` |
| Closed Guard | `Closed Guard_Adele_Marcus.png` | `Closed guard_Marcus_Adele.png` |
| Open Guard | `Open Guard_Adele_Marcus.png` | `Open Guard_Marcus_Adele.png` |
| Butterfly Guard | `Butterfly Guard_Adele_Marcus.png` | `Butterfly Guard_Marcus_Adele.png` |
| Side Control | `Side Control_Adele_Marcus.png` | `Side Control_Marcus_Adele.png` |
| Mount | `Mount_Adele_Marcus.png` | `Mount_Marcus_Adele.png` |
| Back Control | `Back Control_Adele_Marcus.png` | `Back control_Marcus_Adele.png` |
| Clinch | `Clinch_Adele_Marcus.png` | — (clinch is neutral) |
| Ashi Garami | `Ashi Garami_Adele_Marcus.png` | `Ashi Garami_marcus_Adele.png` |
| **Turtle** | **MISSING** | **MISSING** |

**Note:** Files exist on disk but may or may not all be embedded as base64 in the HTML. The build status doc says 19 position sprites are embedded — verify which ones are actually in ARTWORK_DATA.

**Adele also needs proper individual pose sprites** (idle, win, lose, hit, tired, effort, tapOut, etc.) — currently ALL reuse her portrait via `initAdeleSprites()`.

---

## BUG 4: Sizing Wrong / Marcus Off-Screen

**Root Cause:** The Fighter component uses `width: size*1.5` and `height: size` with `maxWidth: size*2` (line ~752-753). On mobile the arena is ~375px wide, but two characters at 120-160px each plus margins can exceed the container width. Marcus's bulky sprite overflows.

**Fix:**
1. Make sprite size responsive based on container width
2. Cap max sprite dimensions so Marcus never overflows the arena
3. Ensure both characters fit within the arena bounds at all screen sizes

**Key code locations:**
- Line ~752-753: Fighter component sprite sizing
- Line ~896: Arena display area with `minHeight:320`
- Grapple sprite display: `maxWidth: 95%, maxHeight: 82%`

---

## BUG 5: Characters Not Facing Each Other

**Current state:** Code uses `scaleX(-1)` to flip characters — player faces right, AI faces left (line ~754). But the **artwork images** themselves may have a fixed orientation. If artwork was drawn with a specific left/right orientation, the CSS flip may produce incorrect results for some images.

**Fix:**
1. Verify each artwork image orientation
2. Ensure mirroring logic works correctly for both individual sprites AND grapple artwork
3. Test both player-as-left and player-as-right scenarios

**Key code locations:**
- Line ~754: `transform: scaleX(${f})` in Fighter component
- Line ~896: Player gets `facing="right"`, AI gets `facing="left"`

---

## MISSING ARTWORK — Turtle Position Prompts - lets remove turtle as a position all together from the game

### Prompt 1: Adele on Top (Turtle — Adele attacking, Marcus turtled)

**Save as:** `Turtle_Adele_Marcus.png`
**Upload:** `Adele.png`, `Adele Face Sheet.png`, `Marcus.png`, `Marcus Face Sheet.png`, + 3 Google Image results for `BJJ turtle position grappling reference photo`

```
You are generating a CPS2 16-bit pixel art image for a BJJ fighting game called Lockdown. Follow all instructions precisely.

REFERENCE IMAGES UPLOADED:
- Adele.png and Adele Face Sheet.png — use these to match Adele's appearance exactly: proportions, outfit, face, and hair
- Marcus.png and Marcus Face Sheet.png — use these to match Marcus's appearance exactly: proportions, outfit, face, and skin tone
- 3 position reference photos — use these to match the BJJ body positions exactly

ART STYLE:
CPS2 16-bit pixel art. Chunky visible pixels. Bold black outlines on all characters. Rich colour with detailed pixel-level shading — NOT flat, NOT gradient, NOT airbrushed. Thick linework with muscle definition and fabric texture visible. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI elements, no watermarks.

THE IMAGE:
Two BJJ fighters in turtle position.

ADELE (top fighter, attacking) is sprawled on top of Marcus's back, chest pressed against his upper back, arms reaching around to hook under his armpits or chin, working to break down his turtle and take the back. One knee driven into his hip.
CHARACTER: Athletic and lanky build, long limbs. Light skin, blue eyes. Golden blonde hair in a long braid. Black short-sleeve rashguard with bright lime green chevron stripe accents on the shoulders. Black compression shorts with lime green trim. Single black ankle wrap on one ankle. Bare feet. Match the Adele.png and Adele Face Sheet.png reference images exactly.

MARCUS (bottom fighter, turtled) is on all fours in defensive turtle position — knees and elbows tight to the ground, head tucked, elbows clamped to his sides to protect his neck. Compact defensive posture.
CHARACTER: Massively muscular build. Deep dark orange-brown skin — do NOT lighten. Short black hair. Bare chest. Dark grey MMA shorts with a bold red side panel. Black knee pads. Black ankle wraps. Black fingerless MMA gloves. Match the Marcus.png and Marcus Face Sheet.png reference images exactly.

COMPOSITION: Both fighters fill the frame. Anatomically correct BJJ turtle position — match the position reference photos uploaded. Ground position, both fighters on the mat.
```

---

### Prompt 2: Marcus on Top (Turtle — Marcus attacking, Adele turtled)

**Save as:** `Turtle_Marcus_Adele.png`
**Upload:** same images as above

```
You are generating a CPS2 16-bit pixel art image for a BJJ fighting game called Lockdown. Follow all instructions precisely.

REFERENCE IMAGES UPLOADED:
- Adele.png and Adele Face Sheet.png — use these to match Adele's appearance exactly: proportions, outfit, face, and hair
- Marcus.png and Marcus Face Sheet.png — use these to match Marcus's appearance exactly: proportions, outfit, face, and skin tone
- 3 position reference photos — use these to match the BJJ body positions exactly

ART STYLE:
CPS2 16-bit pixel art. Chunky visible pixels. Bold black outlines on all characters. Rich colour with detailed pixel-level shading — NOT flat, NOT gradient, NOT airbrushed. Thick linework with muscle definition and fabric texture visible. Retro fighting game aesthetic matching Street Fighter Alpha / Capcom vs SNK sprite quality. White background with subtle blue-grey drop shadow on the floor. No text, no UI elements, no watermarks.

THE IMAGE:
Two BJJ fighters in turtle position.

MARCUS (top fighter, attacking) is sprawled on top of Adele's back, chest pressed against her upper back, arms reaching around to hook under her armpits or chin, working to break down her turtle and take the back. One knee driven into her hip.
CHARACTER: Massively muscular build. Deep dark orange-brown skin — do NOT lighten. Short black hair. Bare chest. Dark grey MMA shorts with a bold red side panel. Black knee pads. Black ankle wraps. Black fingerless MMA gloves. Match the Marcus.png and Marcus Face Sheet.png reference images exactly.

ADELE (bottom fighter, turtled) is on all fours in defensive turtle position — knees and elbows tight to the ground, head tucked, elbows clamped to her sides to protect her neck. Compact defensive posture.
CHARACTER: Athletic and lanky build, long limbs. Light skin, blue eyes. Golden blonde hair in a long braid. Black short-sleeve rashguard with bright lime green chevron stripe accents on the shoulders. Black compression shorts with lime green trim. Single black ankle wrap on one ankle. Bare feet. Match the Adele.png and Adele Face Sheet.png reference images exactly.

COMPOSITION: Both fighters fill the frame. Anatomically correct BJJ turtle position — match the position reference photos uploaded. Ground position, both fighters on the mat.
```

---

## CODE FIX EXECUTION PLAN

### Phase 1: Fix Mobile Layout (CRITICAL — game is unplayable without this)
1. Remove `overflow-hidden` from the main arena wrapper, replace with `overflow-y-auto`
2. Remove the SECOND `overflow-hidden` on the inner layout container
3. On mobile (`flex-col`), restructure so the move panel appears **between** the sprite area and the position map — not stacked after all left-column content
4. Reduce `minHeight:320` on sprite area to ~220px on mobile
5. Shrink PositionMap on mobile — reduce maxWidth from 190 to ~140, or hide text labels
6. Add `min-h-0` to flex children to prevent flex overflow

### Phase 2: Fix Sprite Sizing
7. Make character sizes responsive — scale based on container width, not fixed pixel values
8. Cap max sprite dimensions so Marcus never overflows the arena
9. Ensure both characters always fit within the arena bounds at all screen sizes

### Phase 3: Artwork Integration
10. Generate Turtle position artwork (2 prompts above) - no as a above lets remoe this positon from game and all game code
11. Convert any existing PNG artwork from `Final Artwork/Accepted/Marcus Adele/` to base64 WebP and embed in ARTWORK_DATA (verify which are already embedded vs missing)
12. Generate proper Adele individual pose sprites (idle, win, lose, hit, etc.) — or at minimum create a proper standing/idle sprite so the Standing position doesn't show her flat portrait

### Phase 4: Facing/Mirroring Verification
13. Verify each artwork image orientation and that `scaleX(-1)` mirroring produces correct facing
14. Test both player-as-left and player-as-right scenarios
15. For grapple artwork (2-player scenes), ensure the top/bottom fighter orientation is correct regardless of which side the player is on

---

## Key Code Locations Reference

| What | Approx Line | Description |
|------|------------|-------------|
| POS object | 244-254 | All 12 position names |
| MOVES | 276-283+ | Move definitions per position |
| POS_MAP_DATA | 443-447 | Position map node coordinates |
| SPRITE_DATA | 452 | All base64 sprite data |
| ARTWORK_DATA | 689 | Hand-drawn artwork base64 data |
| initAdeleSprites | 691-698 | Copies portrait to all Adele poses |
| getArtworkSprite | 700-712 | Maps positions to artwork keys |
| getGrappleSprite | 713-731 | Artwork-first, then fallback sprites |
| Fighter component | 752-754 | Sprite sizing and mirroring |
| PositionMap | 759 | SVG position graph |
| getMoves | 807-815 | Move filtering logic |
| onGripFightDone | 816 | Phase transition after grip fight |
| Arena layout | 895-905+ | Main layout structure with overflow-hidden |

---

## Reference Files

- `lockdown-deploy/index.html` — THE GAME (all code is here)
- `lockdown-characters.md` — Character descriptions for art prompt placeholders
- `lockdown-positions.md` — Generic position prompt templates
- `Final Artwork/Accepted/lockdown-prompts-by-position.md` — Yuki/Marcus specific prompts (use as reference for style)
- `Final Artwork/Accepted/Marcus Adele/` — Existing artwork PNGs
- `Final Artwork/Accepted/References/Characters/` — Character reference PNGs + face sheets
- `LOCKDOWN_BUILD_STATUS.md` — Master build state document
- `LOCKDOWN_TASK_LIST.md` — Task checklist



Other udates from Dans manualy check:

1we need to remove backgrounds in all iages, no more white backgrounds - should all be transparent
2catalogue all single positinos rthat wedont have for adele, yuki and marcus - use placeholders in game for now
. e.g. standing, celebratings, tired etc. 
3In the submission we never had the animation with their faces and then the submission in big graphics - this shouldbe impletented. This shoudl go to a quickcut scene before the sumbission attack and defense mini game. PLease plan and execute all of this 
4 lets add small animations, breathing , blinking etc in all images - make them very subtle
5 some mages have a glow type boarder - lets keep and add these to others aswell - make it a little subtler
6 add different backgrounds to fight arena, its black, lets add a simple brick wall, japanese dojo, outside area, warehouse etc - make sure colours contrast and work well - background should be duller than charactaers and randomly change arenas
7 flashes and blinks between moves - these should be outrageous and anime style crossed with street fighter - make them loud and in your face
8 opponent moves sometimes happen too quick, slow the move down to say for example. Marcus is attempting a 'insert move', then whether is works or not aor whether its being defended.

