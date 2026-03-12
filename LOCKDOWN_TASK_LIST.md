# LOCKDOWN — Master Task List

> This is the live task list. Update status as tasks are completed.

---

## IMMEDIATE

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
- [x] Add randomized arena backgrounds (5 arenas: Dojo, Brick Wall, Warehouse, Outdoor, Underground)
- [x] Upgrade arenas to 5 elaborate animated arenas (Traditional Dojo, Neon Underground, Steel Cage, Rooftop Sunset, Jungle Temple) with CSS animations
- [x] Add anime-style impact effects between moves (burst, speed lines, radial, manga lines)
- [x] Upgrade anime impact effects — slower (0.8-1.2s), bigger, layered pseudo-elements, shockwave rings
- [x] Slow down AI move display — shows "Attempting [move]" with 1.8s delay
- [x] Add submission cutscene with face close-ups before minigame
- [x] Upgrade submission cutscene — bigger faces (w-48/h-48), rip/claw transition, scratch lines, SF-style text, 3.2s duration
- [x] Add subtle blink animation on idle/clinch/effort/tired poses
- [x] Standardize glow borders on all fight sprites (subtler, character-colored)
- [x] Fix Adele sprite size — added sizeBoost:1.3 to character config
- [x] Victory screen shows winner face artwork with zoom animation (replaces trophy emoji)
- [x] Result screen shows winner/loser face artwork (replaces trophy/skull emoji)

---

## ANIMATION & VISUAL

- [ ] **Animated splash screen redesign** — heartbeat, heavy breathing, dynamic graphics
  - Current: Static title with CSS animations, starts on click
  - Wanted: Moving graphics, sounds start immediately, heartbeat/breathing audio
  - See: [Splash Screen Prompts](#splash-screen-prompts) section below
- [x] **Character idle animations** — breathing and blinking for all characters
  - Breathing: Enhanced breatheA with 3px translateY + 1% scale pulse (visible chest movement)
  - Blinking: Fixed — moved to inner img, uses brightness filter instead of opacity (no glow artifacts)
- [ ] **Review all animations** — verify no leftover Marcus/Adele animations from old build
- [ ] **Submission display** — show attack face + defense face + technique shot during sub minigame
  - Currently: Shows procedural minigame UI only
  - Wanted: Artwork-based 3-image composite (per lockdown-submissions.md)

---

## ARTWORK NEEDED

### Adele Individual Fighting Sprites (24 needed — see `LOCKDOWN_ARTWORK_AUDIT.md` for full list)
- [ ] Tier 1 (9 sprites): idle, idle2, win, lose, hit, tired, effort, tapOut, clinch — visible in ALL fights
- [ ] Tier 2 (15 sprites): all grapple positions — visible in non-Marcus matchups only
- Target dimensions: ~150-170px wide x ~180px tall

### Turtle Position Artwork
- [x] Turtle artwork embedded in ARTWORK_DATA (BG removed versions)
- [ ] Re-add Turtle position to game code (currently removed)

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

- [x] Replace all ARTWORK_DATA with BG-removed versions from `Final Artwork/Backgrounds Removed/` (32 keys total)
- [ ] Add submission artwork display component (SubmissionDisplay) — sub attack/defend art now embedded
- [x] Add Adele sprites (portrait artwork used for all poses via initAdeleSprites)
- [ ] Add Yuki procedural sprites for Ashi Garami poses
- [ ] Wire Yuki face shots into submission cutscene UI (artwork embedded, code not updated)
- [ ] Wire Yuki portrait into character display (artwork embedded, code not updated)
- [ ] Add position-aware artwork for Marcus vs Yuki (process the 4 existing images)
- [ ] Audio: Add heartbeat/breathing SFX for splash screen
- [ ] Audio: Review all audio cue triggers work with v5 positions

---

## DEPLOYMENT

- [x] Vercel initial deploy (free tier, static site) — DONE, project: lockdown_bjj
- [ ] Custom domain setup (if desired)
- [ ] Performance audit (1MB+ HTML load time)

---

## Splash Screen Prompts

### Best AI Tools for Animated Splash Graphics
1. **Kling AI** (kling.ai) — Best for short animated video clips from a still image. Generate a 3-5 second looping animation of the title screen.
2. **Runway Gen-3** (runway.ml) — Image-to-video, can animate pixel art with motion
3. **Pika** (pika.art) — Good for subtle motion on still images (breathing, particles)

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
