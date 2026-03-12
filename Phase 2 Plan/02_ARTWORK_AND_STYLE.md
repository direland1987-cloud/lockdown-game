# LOCKDOWN — Artwork & Style Guide

> Complete artwork inventory: what's done, what's needed, and the goon character system.
> Cross-references: `LOCKDOWN_ARTWORK_AUDIT.md` for raw sprite-by-sprite status.

---

## §1 — Art Style Reference

All art follows the CPS2 pixel art aesthetic:
- **Canvas:** 128×128px per sprite, 5–6x nearest-neighbour upscale for phone display
- **Palette:** ~32 colours per character (CPS2-inspired, not CPS2-limited)
- **Style pillars:** Bold 1–2px dark outlines, exaggerated proportions, high-contrast cel shading, 3/4 arcade perspective
- **References:** Street Fighter Alpha 2, Darkstalkers, Marvel vs Capcom era
- **Facing convention:** All base sprites face RIGHT. Engine uses CSS `scaleX(-1)` to mirror.

---

## §2 — Hero Character Artwork Status

### 2.1 Marcus "The Bull" Reyes — MOSTLY COMPLETE

| Asset Type | Status | Count | Notes |
|------------|--------|-------|-------|
| Individual fighting sprites | ✅ Done | 8 | idle, idle2, win, lose, hit, tired, effort, tapOut. Old origin but working well. |
| Attack face | ✅ Done | 1 | BG removed, embedded in ARTWORK_DATA |
| Defense face | ✅ Done | 1 | BG removed, embedded in ARTWORK_DATA |
| Full portrait | ✅ Done | 1 | `artwork_marcus_portrait` |
| Head sprites (procedural) | ✅ Done | 4 | front, side, top, back |
| Clinch sprite | ❌ Missing | 0 | Uses idle sprite for clinch |
| Sub attack pose | ✅ Done | 1 | Embedded but display system not built |
| Sub defend pose | ✅ Done | 1 | Embedded but display system not built |

### 2.2 Adele "The Viper" Fiorevar — CRITICAL GAPS

| Asset Type | Status | Count | Notes |
|------------|--------|-------|-------|
| Individual fighting sprites | ❌ ALL PLACEHOLDER | 0/24 | Portrait used for every pose |
| Attack face | ✅ Done | 1 | BG removed |
| Defense face | ✅ Done | 1 | BG removed |
| Full portrait | ✅ Done | 1 | `artwork_adele_portrait` — used as ALL sprite fallback |
| Head sprites (procedural) | ✅ Done | 4 | front, side, top, back |
| Sub attack pose | ✅ Done | 1 | Embedded |
| Sub defend pose | ✅ Done | 1 | Embedded |

**Adele Tier 1 sprites needed (9 — visible in ALL fights):**
`adele_idle`, `adele_idle2`, `adele_win`, `adele_lose`, `adele_hit`, `adele_tired`, `adele_effort`, `adele_tapOut`, `adele_clinch`

**Adele Tier 2 sprites needed (15 — visible only in non-Marcus matchups):**
`adele_guardTop`, `adele_guardBtm`, `adele_mountTop`, `adele_mountBtm`, `adele_pressTop`, `adele_pinned`, `adele_backTop`, `adele_backTaken`, `adele_openGuardTop`, `adele_openGuardBtm`, `adele_halfGuardTop`, `adele_halfGuardBtm`, `adele_spiderGuard`, `adele_ashiTop`, `adele_ashiBtm`

### 2.3 Yuki "Spider" Tanaka — FUNCTIONAL BUT INCOMPLETE

| Asset Type | Status | Count | Notes |
|------------|--------|-------|-------|
| Individual fighting sprites | ✅ Done | 8 | Old origin but working |
| Attack face | ✅ Done | 1 | BG removed, embedded but NOT wired into game code |
| Defense face | ✅ Done | 1 | BG removed, embedded but NOT wired into game code |
| Full portrait | ✅ Done | 1 | Embedded but NOT wired into character display |
| Head sprites (procedural) | ✅ Done | 4 | front, side, top, back |
| Sub attack pose | ❌ Missing | 0 | |
| Sub defend pose | ❌ Missing | 0 | |

---

## §3 — Goon Character System (NEW)

### 3.1 Concept

8 campaign opponents based on BJJ gym archetypes. Each goon needs:
- **Standing sprites only** (6 per goon): idle, hit, win, lose, tired, effort
- **Face sprites** (2 per goon): attack face, defense face (for submission cutscenes)
- **NO combined grapple art** — goon fights use individual sprites even during ground positions

This means 8 × (6 + 2) = **64 sprites total** for the goon system. Compare to hero grapple art which requires 19 images per character pair — goons are dramatically cheaper to produce.

### 3.2 The 8 Goons

| # | Name | Archetype | Build | Visual Description | Personality |
|---|------|-----------|-------|--------------------|-------------|
| 1 | **Coach's Nephew** | 15-year-old green belt | Small, wiry | Young teen in oversized white gi. Green belt. Messy hair. Headgear. Looks nervous but surprisingly technical. | "My uncle says I'm ready for adult class" |
| 2 | **TRT Dad** | Testosterone replacement therapy dad | Stocky, veiny | 45-year-old with suspiciously jacked physique. Receding hairline. Too-tight rashguard. Red face. | "I'm just on vitamins, bro" |
| 3 | **Yoga Mum** | Flexible beginner | Lean, flexible | Athletic woman in pastel rashguard and yoga pants. Headband. Perfect posture. Unnervingly flexible. | "My instructor says my flexibility is my superpower" |
| 4 | **Gym Enforcer** | The big senior student | Massive, imposing | Huge dude. Faded black gi. Brown belt. Cauliflower ears. Permanent scowl. Taped fingers. | "Professor told me to go easy. I won't." |
| 5 | **Triangle Guy** | Tall lanky specialist | Very tall, skinny | 6'4" beanpole in navy rashguard. Long legs. Small head. All limbs. Looks awkward standing, deadly on the ground. | "My legs are longer than your whole body" |
| 6 | **Influencer Girl** | Films everything | Athletic, styled | Competition rashguard with too many sponsor logos. Perfect hair somehow. Phone mounted on wall filming. | "Make sure you get my good angle" |
| 7 | **MMA Fighter Girl** | Crossover athlete | Muscular, intense | Short hair. MMA gloves (even in BJJ class). Cauliflower ears starting. Vale tudo shorts. Mean expression. | "I don't pull guard. I take you down." |
| 8 | **Comp Purple Belt** | Tournament veteran | Medium, sharp | Clean purple belt, competition rash guard. Knee braces on both legs. Focused, no-nonsense expression. Tape on every finger. | "No advantages. Submissions only." |

### 3.3 Goon Sprite Specifications

**Per goon (8 sprites total):**

| Sprite | Key Pattern | Purpose | Dimensions |
|--------|-------------|---------|------------|
| `[goon]_idle` | Standing neutral | Default pose | 128×128px |
| `[goon]_hit` | Recoiling from impact | Taking damage | 128×128px |
| `[goon]_win` | Victory celebration | Fight won | 128×128px |
| `[goon]_lose` | Dejected / collapsed | Fight lost | 128×128px |
| `[goon]_tired` | Hunched, hands on knees | Low stamina | 128×128px |
| `[goon]_effort` | Straining, intense | Attempting move / minigame | 128×128px |
| `[goon]_attack_face` | Close-up, aggressive expression | Submission cutscene | 128×128px |
| `[goon]_defense_face` | Close-up, pain/strain expression | Submission cutscene | 128×128px |

**Art generation approach:** Use ChatGPT/DALL-E with the same CPS2 prompt structure from `lockdown-characters.md`. Each goon gets one character sheet prompt (full body) and one face sheet prompt. Then extract individual poses.

### 3.4 Goon Game Data

Each goon gets a simplified character definition:

```javascript
{
  id: "goon_trt_dad",
  name: "TRT Dad",
  short: "TRT Dad",
  style: "Pressure",
  color: "#e63946",
  isGoon: true,
  // Simplified stats — no full affinity system
  stats: { takedowns: 7, guard: 3, passing: 6, submissions: 4, escapes: 4, strength: 9, speed: 5, stamina: 7 },
  // Use subset of default moves (3-4 per position)
  moveOverrides: null, // uses default move pool, limited by AI difficulty
}
```

### 3.5 Goon vs Hero Rendering

The engine already has the rendering split:
- **Hero vs Hero:** `getArtworkSprite()` checks ARTWORK_DATA for combined grapple art → shows beautiful hand-drawn position sprites
- **Any fight involving a goon:** Falls through to individual sprite rendering → shows standing sprites for both fighters even during ground positions

This is acceptable because goon fights are early campaign (players haven't seen the grapple art yet) and move fast. By the time players reach hero boss fights in Ch 4–6, the art upgrade is dramatic and rewarding.

---

## §4 — Combined Grapple Art Status (Hero Pairs)

### 4.1 Marcus vs Adele — COMPLETE (19 images)

| Position | Marcus Top | Adele Top | Key Pattern |
|----------|:---------:|:---------:|-------------|
| Closed Guard | ✅ | ✅ | `artwork_closedguard_[who]_top` |
| Open Guard | ✅ | ✅ | `artwork_openguard_[who]_top` |
| Butterfly Guard | ✅ | ✅ | `artwork_butterflyguard_[who]_top` |
| Half Guard | ✅ | ✅ | `artwork_halfguard_[who]_top` |
| Side Control | ✅ | ✅ | `artwork_sidecontrol_[who]_top` |
| Mount | ✅ | ✅ | `artwork_mount_[who]_top` |
| Back Control | ✅ | ✅ | `artwork_backcontrol_[who]_top` |
| Ashi Garami | ✅ | ✅ | `artwork_ashi_[who]_top` |
| Clinch | ✅ (neutral) | — | `artwork_clinch` |
| **Total** | **9** | **8** | **17 position + 1 clinch = 18** |

Plus 2 Turtle sprites embedded but position removed from game = 19 total files.

### 4.2 Marcus vs Yuki — NOT STARTED (4 test images exist)

4 ChatGPT test images in `Final Artwork/Accepted/Marcus Yuki/` — unprocessed, not embedded, not usable yet. Need full 19-image set generated.

### 4.3 Adele vs Yuki — NOT STARTED

Need full 19-image set.

### 4.4 Priority

1. Marcus vs Adele: ✅ Done
2. Marcus vs Yuki: Next (needed for Chapter 4+ boss fights)
3. Adele vs Yuki: After that (needed for Chapter 5+ boss fights)

---

## §5 — Submission Artwork Status

### 5.1 Character Face Shots

| Character | Attack Face | Defense Face |
|-----------|:-----------:|:------------:|
| Marcus | ✅ BG removed, embedded | ✅ BG removed, embedded |
| Adele | ✅ BG removed, embedded | ✅ BG removed, embedded |
| Yuki | ✅ BG removed, embedded (NOT wired into code) | ✅ BG removed, embedded (NOT wired into code) |
| 8 Goons | ❌ Need 8 attack + 8 defense = 16 | ❌ |

### 5.2 Submission Technique Shots (7 needed, 0 done)

These are generic close-up shots of the submission mechanic (no specific characters, just grips/body parts). Generated once, reused for all matchups.

| Submission | Filename | Status |
|------------|----------|--------|
| RNC | `RNC Technique.png` | ❌ Missing |
| Guillotine | `Guillotine Technique.png` | ❌ Missing |
| Armbar | `Armbar Technique.png` | ❌ Missing |
| Kimura | `Kimura Technique.png` | ❌ Missing |
| Leg Lock / Heel Hook | `Leg Lock Technique.png` | ❌ Missing |
| Arm Triangle | `Arm Triangle Technique.png` | ❌ Missing |
| Triangle Choke | `Triangle Technique.png` | ❌ Missing |

### 5.3 Sub Attack/Defend Poses

| Character | Sub Attack | Sub Defend |
|-----------|:---------:|:----------:|
| Marcus | ✅ Embedded (display not built) | ✅ Embedded (display not built) |
| Adele | ✅ Embedded (display not built) | ✅ Embedded (display not built) |
| Yuki | ❌ Missing | ❌ Missing |

---

## §6 — Campaign Environment Art (NEW — all needed)

### 6.1 Side-Scroller Backgrounds

Horizontally tiling pixel art strips at 128px tall:

| Asset | Dimensions | Notes |
|-------|-----------|-------|
| City street tile | 256×128px | Buildings, sidewalk, street. For "Walk to Gym" scroller. |
| Gym interior tile | 256×128px | Mats, wall logos, bags. For "Open Mat Gauntlet." |
| Arena backstage tile | 256×128px | Hallways, crowds. For "Tournament Hallway." |
| Podium / celebration | 256×128px static | End-of-chapter reward screen. |

### 6.2 Side-Scroller Character Frames (per hero)

| Frame | Per Character | Total (3 heroes) |
|-------|:------------:|:----------------:|
| Running animation | 4–6 frames | 12–18 |
| Jump apex | 1 frame | 3 |
| Dodge/duck | 1 frame | 3 |
| **Subtotal** | **6–8** | **18–24** |

### 6.3 Mini-Game Assets

| Mini-Game | New Art Needed |
|-----------|----------------|
| Catch the Mouthguard | Mouthguard sprite (3 colours), gym floor tile |
| Clean the Mats | Stain sprites (5–6 types), mop sprite |
| Belt Whipping Gauntlet | Belt swing animation (3 frames), gauntlet corridor bg |
| Wash Your Gi | Gi sprites (5–6 types/colours), conveyor belt bg, bin sprites |
| Don't Get Stacked | Stack of people sprites (6–8 variants), wobble animation |
| Tape Your Fingers | Hand close-up sprite, tape wrap sprite, finger variants |

---

## §7 — Complete Artwork Production Checklist

### Tier 0 — Code-Only (no new art)
- [ ] Wire Yuki face shots into submission cutscene code
- [ ] Wire Yuki portrait into character select display
- [ ] Build SubmissionDisplay component for existing Marcus/Adele sub art
- [ ] Wire existing Marcus/Adele sub attack/defend poses into game

### Tier 1 — Critical (blocks campaign launch)
- [ ] Adele 9 individual fighting sprites (idle, idle2, win, lose, hit, tired, effort, tapOut, clinch)
- [ ] 8 goon character sprites (6 fighting + 2 face per goon = 64 total sprites)

### Tier 2 — Important (blocks full campaign experience)
- [ ] 7 submission technique shots
- [ ] Yuki sub attack + sub defend poses (2 sprites)
- [ ] Marcus vs Yuki combined grapple art (19 images)

### Tier 3 — Polish (enhances experience)
- [ ] Adele 15 grapple position sprites (Tier 2 poses)
- [ ] Adele vs Yuki combined grapple art (19 images)
- [ ] Side-scroller background tiles (4 environments)
- [ ] Side-scroller character running/jumping frames (18–24 total)
- [ ] Mini-game specific assets

### Tier 4 — Future
- [ ] New hero characters (Rusty, Luta, Mahmedov, Darius, Diego)
- [ ] Cosmetic gi colour palette swaps
- [ ] Additional grapple pair art for all hero combinations

---

### Total New Art Count Summary

| Category | Sprite Count |
|----------|:------------:|
| Adele Tier 1 fighting sprites | 9 |
| 8 Goons (6 fighting + 2 face each) | 64 |
| Submission technique shots | 7 |
| Yuki sub poses | 2 |
| Marcus vs Yuki grapple art | 19 |
| **Tier 1+2 Total (blocks campaign)** | **101** |
| Adele Tier 2 grapple sprites | 15 |
| Adele vs Yuki grapple art | 19 |
| Side-scroller backgrounds | 4 |
| Side-scroller character frames | 18–24 |
| Mini-game assets | ~30 |
| **Grand Total (everything)** | **~190** |

---

*Art generation prompts for each asset type are in `lockdown-positions.md`, `lockdown-characters.md`, and `lockdown-submissions.md`. Goon prompts to be written following the same template structure.*
