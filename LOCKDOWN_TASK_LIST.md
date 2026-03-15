# LOCKDOWN — Master Task List

> This is the live task list. Update status as tasks are completed.

---

## CAMPAIGN & SIDE-SCROLLER FIX (v3.1) — COMPLETE

- [x] Fix campaign stale closure — finishFight now includes gameMode in deps, routes to campaign_result correctly
- [x] Fix default loadouts — getMoves() falls back to DEFAULT_LOADOUTS when localStorage empty, limits to 4 moves
- [x] Fix side-scroller punch collision — obstacles damage player on contact (was never damaging due to o.hp check)
- [x] Fix side-scroller playerY init — consistent scaled position matching jump landing
- [x] Character-specific side-scroller player — palette-colored character with head, body, arms, running legs
- [x] Enhanced obstacle visuals — mat stacks, hanging gi, ball, foam roller, training dummy, rival fighter, professor
- [x] Damage feedback — red screen flash, player blink, heart shake animation
- [x] Campaign map redesign — vertical path with circle nodes, act badges, compact fight buttons
- [x] New tests: campaign-flow.spec.ts (4 tests across 3 viewports)
- [x] Update living documents

---

## ENDGAME BUILD (v3.0) — COMPLETE

- [x] Add 3 new characters (Rusty Jones, Luta Duarte, Mahmedov) with stats, POS_AFFINITY, DEFAULT_LOADOUTS
- [x] Enhanced SVG sprite system — pose-aware sprites per character with body proportions, hair, clothing
- [x] Head sprites for new characters in generateHeadSprites()
- [x] Campaign opponent generator — seeded RNG, tier-scaled stats, random visuals/names
- [x] 5-act campaign rework (was 6 chapters) — 20 fights total, boss fights unlock characters
- [x] Campaign story system — "Who stole the Red Book?" — typewriter dialogue, 5-act plot
- [x] Campaign screens: campaign_map, campaign_prefight, campaign_result, campaign_gameover, campaign_victory, campaign_story
- [x] Enhanced side-scroller — jump/slide/punch, 3 hearts, collectibles, obstacles, act-based themes, parallax
- [x] Side-scroller wired between EVERY campaign non-boss win
- [x] Boss defeats unlock characters for arcade mode
- [x] Campaign save/load in localStorage
- [x] Side-scroller passes campaignAct for act-based theming
- [x] Side-scroller stamina bonus carries into campaign state
- [x] Playwright test suite — 25 tests across 4 files (navigation, fight-gameplay, mobile, edge-cases)
- [x] Desktop + mobile test projects (Chromium-based)
- [x] Fix: React hooks violations (useState in conditional blocks)
- [x] Fix: Orphaned old SideScroller code causing syntax error
- [x] Fix: Character select respects campaign character unlocks
- [x] Update living documents

---

## PHASE 2 — COMPLETE

- [x] localStorage persistence (replace _memStore with localStorage + Safari fallback)
- [x] Stamina overhaul (position-aware recovery, danger zone, recovery moves, visual upgrade)
- [x] Minigame simplification (fewer arrows, wider sweet spots, HoldRelease replaces RapidTap)
- [x] 4-move equip/forget system + default loadouts per character
- [x] XP & leveling system + 4-path skill tree UI
- [x] Title screen overhaul (7-item menu: Campaign/Arcade/Training/Mini-Games/Moves/Skills/Daily)
- [x] 8 goon character definitions + procedural canvas sprites
- [x] Campaign mode (6 chapters, fight flow, progress tracking, hero lock)
- [x] AI difficulty scaling (5-dimension per-fight vectors)
- [x] Training mode (free practice sandbox)
- [x] Wire Yuki faces into submission cutscene + portrait display
- [x] SubmissionDisplay component (3-image composite with placeholder technique shots)
- [x] Side-scroller engine (5 scenarios, canvas-based, wired into campaign + mini-games menu)
- [x] 6 comedy mini-games (CatchMouthguard, CleanMats, BeltWhipping, WashGi, DontGetStacked, TapeFingers)
- [x] Mini-game select screen with game picker + side-scroller access
- [x] Daily challenge expansion (32 challenges, streak tracker, milestone rewards)
- [x] Ad/IAP stubs (RewardedAd + IAP objects, UI buttons hidden when unavailable)
- [x] iOS CSS prep (viewport-fit=cover, safe-area insets, Apple web app meta tags)
- [x] Update living documents (BUILD_STATUS.md + TASK_LIST.md)

---

## IMMEDIATE (Pre-Phase 2)

- [x] v5 moves redesign — replace entire MOVES object
- [x] Add Ashi Garami position (POS, POS_DOM, layout, links, sprites)
- [x] Add POS_AFFINITY system + integrate into AI/defense
- [x] Add Adele character to roster
- [x] Integrate Final Artwork for Marcus vs Adele (19 positions + 6 portraits)
- [x] Deploy to Vercel — live at https://lockdown-6nozvdflg-dans-projects-f8c4cc46.vercel.app
- [x] Fix Adele character select sprite — portrait artwork now used for all poses
- [x] Fix game crash — POS_MAP_DATA missing Open Guard, Butterfly Guard, Turtle entries
- [x] Add Adele head sprites to generateHeadSprites()
- [x] Artwork audit — comprehensive inventory in `LOCKDOWN_ARTWORK_AUDIT.md`
- [ ] Full code review — ensure no broken references after v5 changes
- [x] Remove Turtle position from all game code
- [x] Fix mobile layout — overflow-hidden making game unplayable on iPhone
- [x] Fix responsive sprite sizing — fighters capped to viewport-relative sizes
- [x] Remove white backgrounds from all artwork images (23 images processed)
- [x] Re-process all 23 artwork images with flood-fill BG removal (removes shadows too)
- [x] Add randomized arena backgrounds (5 arenas)
- [x] Upgrade arenas to 5 elaborate animated arenas with CSS animations
- [x] Add anime-style impact effects between moves
- [x] Upgrade anime impact effects — slower, bigger, layered pseudo-elements, shockwave rings
- [x] Slow down AI move display — shows "Attempting [move]" with 1.8s delay
- [x] Add submission cutscene with face close-ups before minigame
- [x] Upgrade submission cutscene — bigger faces, rip/claw transition, SF-style text
- [x] Add subtle blink animation on idle/clinch/effort/tired poses
- [x] Standardize glow borders on all fight sprites
- [x] Fix Adele sprite size — added sizeBoost:1.3 to character config
- [x] Victory screen shows winner face artwork with zoom animation
- [x] Result screen shows winner/loser face artwork

---

## ANIMATION & VISUAL

- [ ] **Animated splash screen redesign** — heartbeat, heavy breathing, dynamic graphics
  - Current: Static title with CSS animations, starts on click
  - Wanted: Moving graphics, sounds start immediately, heartbeat/breathing audio
  - See: [Splash Screen Prompts](#splash-screen-prompts) section below
- [x] **Character idle animations** — breathing and blinking for all characters
- [ ] **Review all animations** — verify no leftover Marcus/Adele animations from old build

---

## ARTWORK NEEDED

### Adele Individual Fighting Sprites (24 needed — see `LOCKDOWN_ARTWORK_AUDIT.md` for full list)
- [ ] Tier 1 (9 sprites): idle, idle2, win, lose, hit, tired, effort, tapOut, clinch — visible in ALL fights
- [ ] Tier 2 (15 sprites): all grapple positions — visible in non-Marcus matchups only
- Target dimensions: ~150-170px wide x ~180px tall

### Submission Technique Shots (generate once, reuse for all pairings)
Use prompts from `lockdown-submissions.md` — PART 2.

- [ ] RNC Technique — `RNC Technique.png`
- [ ] Guillotine Technique — `Guillotine Technique.png`
- [ ] Armbar Technique — `Armbar Technique.png`
- [ ] Kimura Technique — `Kimura Technique.png`
- [ ] Leg Lock Technique — `Leg Lock Technique.png`
- [ ] Arm Triangle Technique — `Arm Triangle Technique.png`
- [ ] Triangle Technique — `Triangle Technique.png`

### Character Face Shots (generate once per character)
Use prompts from `lockdown-submissions.md` — PART 1.

- [x] Marcus Attack Face (BG removed)
- [x] Marcus Defense Face (BG removed)
- [x] Adele Attack Face (BG removed)
- [x] Adele Defense Face (BG removed)
- [x] Yuki Attack Face (BG removed)
- [x] Yuki Defense Face (BG removed)
- [ ] Darius Attack Face (when character is designed)
- [ ] Darius Defense Face
- [ ] Diego Attack Face (when character is designed)
- [ ] Diego Defense Face

### Goon Character Sprites (8 goons — currently procedural canvas)
- [ ] 8 goon fighting sprite sets (6 fighting + 2 face per goon = 64 PNGs)

### Side-Scroller Assets
- [ ] 4 tiling pixel art background strips
- [ ] 18-24 character run/jump/dodge frames
- [ ] Obstacle sprites (currently colored rectangles)

### Mini-Game Assets
- [ ] ~30 game-specific sprites (mouthguards, gis, stains, belts, etc.)

### Position Art — Additional Pairs
Use prompts from `lockdown-positions.md`.

- [ ] Marcus vs Yuki (9 positions + clinch, both directions = ~19 images)
- [ ] Adele vs Yuki (19 images)
- [ ] Marcus vs Darius (when Darius is designed)
- [ ] Marcus vs Diego (when Diego is designed)
- [ ] All remaining pair combinations

### Character Designs Still Needed
Per `lockdown-characters.md`:

- [x] Marcus — designed, has face sheet + full body
- [x] Adele — designed, has face sheet + full body
- [x] Yuki — designed, has face sheet (in Characters/ folder)
- [ ] Rusty Jones — TO BE WRITTEN
- [ ] Luta Duarte — TO BE WRITTEN
- [ ] Mahmedov — TO BE WRITTEN

---

## CODE TASKS

- [x] Replace all ARTWORK_DATA with BG-removed versions from `Final Artwork/Backgrounds Removed/`
- [x] Add submission artwork display component (SubmissionDisplay)
- [x] Add Adele sprites (portrait artwork used for all poses via initAdeleSprites)
- [ ] Add Yuki procedural sprites for Ashi Garami poses
- [x] Wire Yuki face shots into submission cutscene UI
- [x] Wire Yuki portrait into character display
- [ ] Add position-aware artwork for Marcus vs Yuki (process the 4 existing images)
- [ ] Audio: Add heartbeat/breathing SFX for splash screen
- [ ] Audio: Review all audio cue triggers work with v5 positions

---

## DEPLOYMENT

- [x] Vercel initial deploy (free tier, static site)
- [ ] Custom domain setup (if desired)
- [ ] Performance audit (1MB+ HTML load time)
- [ ] iOS Capacitor build (requires macOS + Xcode + Apple Developer account)
- [ ] AdMob account + ad unit IDs (for real ad integration)

---

## Splash Screen Prompts

### Best AI Tools for Animated Splash Graphics
1. **Kling AI** (kling.ai) — Best for short animated video clips from a still image
2. **Runway Gen-3** (runway.ml) — Image-to-video, can animate pixel art with motion
3. **Pika** (pika.art) — Good for subtle motion on still images

### Prompt for Animated Splash (use with Kling/Runway):
```
A CPS2 16-bit pixel art fighting game title screen for "LOCKDOWN". Dark background with dramatic red and orange lighting. Two muscular BJJ fighters in a grappling clinch position, rendered in chunky pixel art style matching Street Fighter Alpha sprites. The camera slowly pushes in. Subtle particle effects and lens flares. The fighters breathe and shift weight. Retro arcade aesthetic with scanlines. Cinematic, dramatic, intense atmosphere. 3 second seamless loop.
```

### Prompt for Heartbeat/Breathing Audio (use with Suno AI):
```
Dramatic cinematic heartbeat sound design. Deep bass heartbeat pulse that builds tension. Layer in heavy controlled breathing, like a fighter about to compete. No music, just sound design. Dark, intense, anticipatory. 10 seconds, loopable.
```

### How to Integrate Animated Splash:
1. Generate a short looping video (WebM or MP4, under 2MB)
2. Convert to base64 and embed as a `<video>` element background
3. Or: Use the video as a poster frame and add CSS animation layers on top
4. Audio: Embed short heartbeat/breathing clip, trigger on page load (before user click)

---

## Notes
- All position art prompts are in `lockdown-positions.md`
- All submission art prompts are in `lockdown-submissions.md`
- Character descriptions for art prompts are in `lockdown-characters.md`
- Animation system reference is in `lockdown-animation-framework.md`
- v5 design rationale is in `lockdown_v5_redesign.md`
- Phase 2 plan docs are in `Phase 2 Plan/`
