# LOCKDOWN — Remaining Work

> Everything still to be done, grouped by category.

---

## ARTWORK

### Adele Individual Fighting Sprites (24 needed)
Adele currently uses a single portrait as placeholder for all 24 poses. Real per-pose sprites needed.

- [ ] **Tier 1 (9 sprites):** idle, idle2, win, lose, hit, tired, effort, tapOut, clinch — visible in ALL fights
- [ ] **Tier 2 (15 sprites):** grapple position-specific poses — visible in non-Marcus matchups only
- Target dimensions: ~150-170px wide x ~180px tall

### Submission Technique Shots (7 needed)
Close-up technical demo images (no characters), one per submission type. Generate once, reuse for all pairings. Use prompts from `lockdown-submissions.md` — PART 2.

- [ ] RNC Technique
- [ ] Guillotine Technique
- [ ] Armbar Technique
- [ ] Kimura Technique
- [ ] Leg Lock Technique
- [ ] Arm Triangle Technique
- [ ] Triangle Technique

### Character Face Shots (4 needed)
Darius and Diego faces. Marcus/Adele/Yuki are done. Use prompts from `lockdown-submissions.md` — PART 1.

- [ ] Darius Attack Face (requires character design first)
- [ ] Darius Defense Face
- [ ] Diego Attack Face (requires character design first)
- [ ] Diego Defense Face

### Goon Character Sprites (64 PNGs)
8 campaign goons currently use procedural canvas sprites (colored silhouettes). Each needs 6 fighting poses + 2 face expressions = 8 sprites per goon.

Goons: goon_nephew, goon_trt_dad, goon_yoga_mum, goon_enforcer, goon_triangle, goon_influencer, goon_mma_girl, goon_purple_belt

- [ ] All 8 goon sprite sets (64 total images)

### Side-Scroller Assets
5 scenarios currently use CSS gradients and colored rectangles.

- [ ] 4 tiling pixel art background strips
- [ ] 18-24 character run/jump/dodge frames
- [ ] Obstacle sprites

### Mini-Game Assets
6 comedy mini-games currently use colored shapes + emoji labels.

- [ ] ~30 game-specific sprites (mouthguards, gis, stains, belts, etc.)

### Position Art — Additional Character Pairings
Only Marcus vs Adele is complete. Each pair = ~19 images. Use prompts from `lockdown-positions.md`.

- [ ] Marcus vs Yuki (4 raw images exist in `Final Artwork/Marcus Yuki/` — need BG removal + 15 more)
- [ ] Adele vs Yuki (19 images)
- [ ] Marcus vs Darius (when designed)
- [ ] Marcus vs Diego (when designed)
- [ ] All other pair combinations

### Character Designs Still Needed
Written descriptions for art generation prompts. See `lockdown-characters.md` for format.

- [ ] Rusty Jones
- [ ] Luta Duarte
- [ ] Mahmedov

---

## CODE

- [ ] **Full code review** — ensure no broken references after v5 changes
- [ ] **Yuki Ashi Garami procedural sprites** — canvas-generated sprites for the new Ashi position
- [ ] **Process Marcus vs Yuki artwork** — BG removal on the 4 existing images, wire into game

---

## AUDIO

- [ ] **Heartbeat/breathing SFX** — 10-second loopable clip for splash screen (prompt in TASK_LIST.md, generate with Suno AI)
- [ ] **Review all audio triggers** — verify 9 existing audio files work correctly with v5 positions

---

## ANIMATION & VISUAL

- [ ] **Animated splash screen** — replace static title with looping video + heartbeat audio
  - Generate with Kling AI / Runway Gen-3 / Pika
  - Embed as base64 `<video>` element, under 2MB
  - Prompt provided in TASK_LIST.md
- [ ] **Animation review pass** — verify no leftover animations from old build

---

## DEPLOYMENT & INFRASTRUCTURE

- [ ] **Performance audit** — ~1,100KB HTML load time analysis
- [ ] **Custom domain** (if desired — currently Vercel auto-generated URL)
- [ ] **iOS Capacitor build** — requires macOS + Xcode + Apple Developer account
- [ ] **AdMob account + real ad unit IDs** — currently stubs returning `isAvailable: false`
- [ ] **IAP backend integration** — currently stubs returning `success: false`

---

## LOCKED CHARACTERS

Darius and Diego are defined in code but locked. Need character designs + artwork to become playable.

- [ ] **Darius "The Ghost" Okeke** — Counter Fighter (has procedural sprites, no real artwork)
- [ ] **"Loco" Diego Vega** — Wild Card Scrambler (has procedural sprites, no real artwork)

---

## EFFORT ESTIMATES

### Quick Wins (code-only, 1-2 hours)
- Audio trigger review for v5 positions
- Full code review for broken references
- Yuki Ashi Garami procedural sprites

### Medium (4-8 hours)
- Marcus vs Yuki art processing (4 images BG removal + wiring)
- Animated splash screen video generation + integration
- Heartbeat/breathing audio generation + integration
- Character design writing (Darius, Diego, remaining roster)

### Major (artwork generation, 16+ hours)
- Adele 24 individual fighting sprites
- 7 submission technique shots
- 64 goon character sprites
- Side-scroller art assets
- Mini-game art assets
- Additional position art pairings (Marcus/Yuki completion, Adele/Yuki, etc.)

### External Dependencies (require accounts/hardware)
- iOS Capacitor build — macOS + Xcode + Apple Developer account
- AdMob real integration — Google AdMob account
- IAP real integration — App Store / payment backend
