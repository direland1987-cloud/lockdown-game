# LOCKDOWN: Next Steps — Sprite Revisions, Music, & SFX

This document contains actionable guides for fixing sprite character inconsistencies, generating soundtrack tracks via Suno, and creating UI sound effects with JSFXR.

---

## SECTION 1: ChatGPT Sprite Revision Prompts

**Context:** Several sprite pairs and solo animations incorrectly rendered Marcus "The Bull" Reyes with Yuki's messy medium-length hair instead of his proper short buzzed cut. The revision prompts below provide corrected specifications with explicit hair distinction rules.

### Character Locks

**Marcus "The Bull" Reyes:**
- Stocky, powerful heavyweight build (5'10", 220 lbs), wide shoulders, thick neck
- Latino, medium-brown skin tone
- **SHORT BUZZED dark hair**, squared jaw, intense focused expression
- Black fight shorts with red accent stripe down each side
- No shirt (no-gi), bare chest showing muscular build
- Short black fingerless MMA gloves
- Small bull tattoo on left shoulder

**Yuki "Spider" Tanaka:**
- Lean, wiry, flexible build (5'8", 155 lbs), long limbs relative to torso
- Japanese, light skin tone
- **Messy medium-length black hair**, sharp features, calm analytical expression
- Dark navy compression rash guard with subtle spider web pattern on sleeves
- Navy fight shorts with white side panels
- Short black fingerless MMA gloves
- Lean defined muscles, not bulky

---

### REVISION 1 — Standing Clinch (A8)

**Issue:** Marcus rendered with ponytail/topknot instead of buzz cut.

**Corrected Prompt:**

Two fighters in a standing clinch position, heads close, locked in control. Fighter A (Marcus "The Bull" Reyes, heavyweight, 5'10", 220 lbs, Latino, medium-brown skin) on the left with stocky powerful build, wide shoulders, thick neck, squared jaw. Fighter B (Yuki "Spider" Tanaka, 5'8", 155 lbs, Japanese, light skin tone) on the right with lean wiry build, sharp features. Both in fighting stance, arms interlocked, tension evident.

**CRITICAL HAIR DISTINCTION:** Fighter A (Marcus) has VERY SHORT BUZZED dark hair with NO ponytail, topknot, or length. His hair is cropped close to the scalp like a military buzz cut. Only Fighter B (Yuki) has messy medium-length black hair. These two hairstyles MUST be clearly different and distinguishable.

Marcus wears black fight shorts with red side stripe, no shirt, bare muscular chest, short black fingerless gloves, small bull tattoo on left shoulder. Yuki wears dark navy rash guard with spider web pattern sleeves, navy shorts with white panels, black fingerless gloves. 16-bit CPS2 arcade pixel art style, side-on fighting game perspective, dramatic lighting, detailed musculature.

---

### REVISION 2 — Back Mount (A6)

**Issue:** Marcus had slightly too much hair/incorrect hair length in back mount position.

**Corrected Prompt:**

Fighter A (Marcus "The Bull" Reyes) in back mount position, mounted on Fighter B (Yuki "Spider" Tanaka) from behind, applying control. Marcus is a heavyweight stocky fighter (5'10", 220 lbs) with a wide powerful build, Latino, medium-brown skin tone, his muscular back and shoulders prominent. Yuki is lean and wiry (5'8", 155 lbs), Japanese, light skin tone.

**CRITICAL HAIR DISTINCTION:** Marcus MUST have a VERY SHORT BUZZED dark hair cut with NO length, NO ponytail, NO bun, NO medium-length styling. His head shows close-cropped dark hair, simple and military-style. Only Yuki has the messy medium-length black hair visible in this angle. Make the hair difference unmistakably clear.

Marcus bare-chested, muscular, black fight shorts with red accent stripe, short black fingerless gloves, small bull tattoo visible on shoulder. Yuki in navy rash guard with spider pattern, navy shorts with white side panels, black fingerless gloves. Tension and control in the grapple position. 16-bit CPS2 arcade style, detailed musculature, dramatic grappling anatomy, fighting game perspective.

---

### REVISION 3 — Marcus Solo Submission Poses (B7/B8)

**Issue:** Marcus solo submission sprite showed longer/flowing hair instead of buzz cut.

**Corrected Prompt:**

Single fighter, Marcus "The Bull" Reyes, demonstrating two submission hold variations in sequence. Marcus is a heavyweight grappler (5'10", 220 lbs) with stocky powerful build, wide shoulders, thick neck, Latino heritage, medium-brown skin tone. Squared jaw with intense focused expression.

**CRITICAL HAIR SPECIFICATION:** Marcus MUST have a SHORT BUZZED dark hair cut. His hair is VERY SHORT, cropped close to the scalp in a military buzz cut style. NO ponytail, NO medium-length hair, NO flowing locks, NO top knot. His head should show simple close-cropped dark hair only.

Bare-chested showing defined muscular build, black fight shorts with red accent stripe down each side, short black fingerless MMA gloves, small bull tattoo on left shoulder. Pose 1: Arm-triangle choke grip from standing position. Pose 2: Rear-naked choke or submission control. Dramatic tension in the poses. 16-bit CPS2 arcade pixel art fighting game style, detailed grappling anatomy, intense expression, professional fighting game animation perspective.

---

## SECTION 2: Suno Music Generation — Ready-to-Use Prompts

All tracks follow CPS2/FM synthesis aesthetic, instrumental-only, arcade 16-bit fighting game style. Copy each prompt directly into Suno for generation.

---

### Track 1: Main Menu Theme

**Purpose:** Intro/main menu, confident hype energy, 120 BPM
**Duration:** 90 seconds (loopable)

**Main Prompt:**

```
CPS2 arcade fighting game main menu theme, 120 BPM, FM synthesis style,
bright and confident, hype energy. Punchy kick drum with arcade bass,
layered synth melodies in major key. Infectious rhythm perfect for menu
navigation. Sounds like a classic 90s arcade fighting game menu.
Uplifting, energetic, memorable hook. Ready for a fight.
```

**Style Tags:**

```
16-bit, arcade, retro, CPS2, FM synthesis, fighting game, chiptune,
upbeat, confident, menu theme, 90s video game
```

**Variation Prompt (if first doesn't work):**

```
Capcom CPS2 arcade fighting game main menu music, 120 BPM,
bright FM synth, punchy drums, funky bass line, catchy melodic hook,
energetic and fun, loopable 90-second track
```

**Expected Duration:** 90 seconds
**Loopable:** Yes

---

### Track 2: Character Select Screen

**Purpose:** Character selection, upbeat bouncy anticipation, 60 seconds
**Duration:** 60 seconds (loopable)

**Main Prompt:**

```
Character select screen theme, upbeat bouncy arcade style, 60 seconds,
CPS2 FM synth, playful energy building anticipation. Crisp snare,
syncopated bass line, bright arpeggiated lead melody. Sounds like
choosing your fighter in a 90s arcade game. Fun, engaging, rhythmic.
Loop seamlessly.
```

**Style Tags:**

```
16-bit, arcade, character select, playful, bouncy, anticipation,
chiptune, retro fighting game, FM synthesis, upbeat, funky
```

**Variation Prompt (if first doesn't work):**

```
Arcade character selection music, bouncy upbeat, short 60-second loop,
bright synth melody, funky drum pattern, energetic and fun,
CPS2 style, ready to choose your fighter
```

**Expected Duration:** 60 seconds
**Loopable:** Yes

---

### Track 3: In-Match Fight Theme

**Purpose:** Active fighting, high intensity driving rhythm, 140 BPM
**Duration:** 2 minutes (loopable)

**Main Prompt:**

```
In-match fighting theme, 140 BPM, CPS2 arcade FM synthesis style,
intense and driving. Powerful kick drum with syncopated hi-hat patterns,
heavy arcade bass line, layered synth melody lines in minor/major blend.
Tension building throughout. Sounds like a real Street Fighter or
Darkstalkers match. Loopable 2-minute track. High energy, focused,
relentless driving beat.
```

**Style Tags:**

```
16-bit, arcade, fighting game, battle theme, intense, driving,
CPS2, FM synthesis, 140 BPM, minor key, high energy, chiptune, retro
```

**Variation Prompt (if first doesn't work):**

```
Capcom fighting game battle music, 140 BPM, intense driving rhythm,
FM synth with power, heavy bass, urgent melody, 2-minute loopable track,
arcade style, match tension and action
```

**Expected Duration:** 2 minutes
**Loopable:** Yes

---

### Track 4: Low-Stamina Variant

**Purpose:** Emergency stamina warning, slower ominous minor key
**Duration:** 90 seconds (loopable)

**Main Prompt:**

```
Low stamina warning theme, 90-100 BPM (slower), CPS2 arcade FM synth,
ominous and tense atmosphere. Heartbeat-like bass pulse (boom-chick rhythm),
deep synth tones in minor key, sparse melody with rising tension.
Feels like danger, exhaustion, desperation. Loopable 90-second track.
Not aggressive—ominous warning, fighter in trouble. Classic arcade
alarm/danger tone with grappling game intensity.
```

**Style Tags:**

```
16-bit, arcade, ominous, minor key, warning, tension, FM synthesis,
low stamina, danger, slower, heartbeat, CPS2 style, retro game,
atmospheric, desperate
```

**Variation Prompt (if first doesn't work):**

```
Arcade game low health/stamina warning theme, ominous minor key,
slow heartbeat bass, tension building, 90 seconds loopable,
FM synth, danger atmosphere, fighting game SFX integration ready
```

**Expected Duration:** 90 seconds
**Loopable:** Yes

---

### Track 5: Submission Minigame Tension

**Purpose:** Submission minigame, rising urgency, accelerating tempo
**Duration:** 60 seconds (loopable)

**Main Prompt:**

```
Submission minigame tension theme, 60 seconds, CPS2 arcade style.
Rising intensity and accelerating tempo. Rapid arpeggiated synth patterns,
driving drum hits, escalating urgency. Heartbeat-like pulse underneath.
Feels like a time-pressure challenge, grappling battle of wills.
Minor key with tension. Loopable. Sounds like a bonus/minigame challenge
in a fighting game. Urgent, focused, technical.
```

**Style Tags:**

```
16-bit, arcade, minigame, tension, rising intensity, urgency,
FM synthesis, accelerating, arpeggios, chiptune, CPS2,
challenge theme, rapid, focused, loopable
```

**Variation Prompt (if first doesn't work):**

```
Arcade minigame rising tension theme, 60 seconds, accelerating tempo,
urgent arpeggiated synth, rapid drums, intensity building,
FM synthesis CPS2 style, grappling challenge, loopable
```

**Expected Duration:** 60 seconds
**Loopable:** Yes

---

### Track 6: Victory Fanfare

**Purpose:** Match won, triumphant celebratory
**Duration:** 20-30 seconds (non-looping, jingle)

**Main Prompt:**

```
Victory fanfare jingle, 20-30 seconds, CPS2 arcade FM synth,
bright triumphant major key. Celebratory brass/synth stabs,
ascending melody, confident victory rhythm. Quick punchy ending.
Sounds like winning in a classic 90s arcade fighting game.
Short sharp jingle, not looping. Champion moment.
```

**Style Tags:**

```
16-bit, arcade, victory, fanfare, triumphant, celebratory,
FM synthesis, major key, CPS2 style, jingle, upbeat,
winning theme, bright, confident
```

**Variation Prompt (if first doesn't work):**

```
Arcade victory jingle, 25 seconds, bright major key triumph,
celebratory synth, punchy ending, FM synthesis,
fighting game win theme, CPS2 style
```

**Expected Duration:** 20-30 seconds
**Loopable:** No (jingle only)

---

### Track 7: Defeat Theme

**Purpose:** Match lost, somber dignified
**Duration:** 20-30 seconds (non-looping, jingle)

**Main Prompt:**

```
Defeat theme jingle, 20-30 seconds, CPS2 arcade FM synth,
minor key somber and respectful. Descending melody line,
slow dignified rhythm, melancholic synth tones. Respectful,
not mocking—acknowledging good fight. Short ending.
Sounds like losing in a respectful arcade fighting game.
Not looping jingle. Graceful defeat.
```

**Style Tags:**

```
16-bit, arcade, defeat, somber, minor key, dignified,
FM synthesis, melancholic, respectful, CPS2 style,
descending melody, reflective, losing theme, jingle
```

**Variation Prompt (if first doesn't work):**

```
Arcade defeat theme jingle, 25 seconds, minor key melancholy,
descending melody, respectful somber tone, FM synthesis,
fighting game loss theme, CPS2 style, dignified
```

**Expected Duration:** 20-30 seconds
**Loopable:** No (jingle only)

---

## SECTION 3: JSFXR UI Sounds Checklist

Access **[JSFXR Web Editor](https://sfxr.me)** to generate all UI sounds. For each sound, select the recommended preset and apply the key slider tweaks listed.

| # | Filename | Purpose | Preset to Start From | Key Adjustments |
|---|----------|---------|----------------------|-----------------|
| 1 | `ui-select.wav` | Menu Select / Button Click | **Coin** | Reduce duration to 0.3s, increase pitch to 0.8, bright/crisp tone |
| 2 | `ui-navigate.wav` | Menu Navigate / Hover | **Pickup** | Medium pitch (0.6), quick 0.2s duration, soft/smooth |
| 3 | `ui-cancel.wav` | Menu Back / Cancel | **Explosion** | Lower pitch to 0.3, shorter 0.4s duration, descending slide |
| 4 | `timer-warning.wav` | Timer Warning Beep | **Laser** | Medium-high pitch (0.7), staccato 0.15s duration, sharp attack |
| 5 | `round-bell.wav` | Round Bell / Timer End | **Coin** | Low-mid pitch (0.4), 0.5s duration, resonant/bell-like tone |
| 6 | `stamina-warning.wav` | Stamina Depleted Warning | **Laser** | Low-mid pitch (0.35), urgent rhythm, 0.6s duration, pulsing |
| 7 | `move-confirm.wav` | Move Locked In / Confirm | **Pickup** | Higher pitch (0.75), punchy 0.25s, smooth envelope |
| 8 | `sub-attempt.wav` | Submission Attempt Start | **Powerup** | Medium pitch (0.5), 0.4s duration, tense build-up feel |
| 9 | `minigame-tick.wav` | Minigame Tick / Input Success | **Coin** | High pitch (0.85), ultra-short 0.15s, bright/successful |
| 10 | `minigame-fail.wav` | Minigame Fail / Miss | **Explosion** | Medium-low pitch (0.45), descending slide, 0.35s duration |
| 11 | `xp-gain.wav` | XP / Points Gained | **Powerup** | Medium-high pitch (0.65), ascending slide, 0.5s duration, positive feel |
| 12 | `challenge-complete.wav` | Daily Challenge Complete | **Coin** | Medium pitch (0.6), rising pitch pattern, 0.6s duration, triumphant |
| 13 | `character-unlock.wav` | Character Unlock | **Powerup** | High pitch (0.8), ascending melody feel, 0.7s duration, exciting/celebratory |

### Generation Workflow

1. Open **[https://sfxr.me](https://sfxr.me)** in browser
2. For each sound:
   - Select the recommended **Preset** dropdown
   - Adjust sliders per the **Key Adjustments** column
   - Click **Download** (or use browser's download button)
   - Save as the **Filename** listed
3. Store all `.wav` files in your audio assets folder
4. Import into game engine (ensure format compatibility: 16-bit PCM .wav recommended)

### Preset Quick Reference

- **Coin:** Short, bright, reward-like (perfect for UI selects/confirms)
- **Pickup:** Quick, smooth, non-threatening (great for hovers/navigation)
- **Explosion:** Descending, impact-heavy (useful for cancels/failures)
- **Laser:** Sharp attack, sci-fi tone (ideal for timer/warning sounds)
- **Powerup:** Ascending, positive energy (excellent for gains/unlocks)

### Tips

- Adjust **Duration** slider first to get time length right
- Adjust **Pitch** slider for tone (higher = brighter, lower = deeper)
- Use **Attack** slider to control how quickly sound starts
- Apply **Slide** for pitch changes over time (rising = ascending, falling = descending)
- Test in game to ensure sounds fit with music and don't conflict

---

## Summary

**Section 1** provides three corrected sprite prompts to fix Marcus's hair inconsistencies.
**Section 2** contains seven Suno prompts for complete soundtrack generation.
**Section 3** is a checklist for creating 13 UI sound effects in JSFXR.

All are ready for immediate use. Follow the formatting and specifications above for best results.
