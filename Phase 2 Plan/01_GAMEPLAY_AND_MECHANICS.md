# LOCKDOWN — Gameplay & Mechanics

> Execution doc for Claude Code. All section numbers referenced from Master Plan.

---

## §1 — Current Problems

The current fight system has three core issues:

1. **Too many moves.** Characters have 6–8 moves per position. On mobile this is a wall of buttons. Players don't know what to pick and the choice feels random rather than strategic.

2. **Stamina is invisible.** Stamina exists (starts at 100, costs 3–18 per move, recovers +1.5/turn, TKO at 0) but the bar is tiny, the numbers are meaningless to the player, and running low has almost no gameplay consequence until sudden TKO. There's no reason to manage it.

3. **Minigames are too hard.** The sequence minigame (memorize 4+ arrows and replay them), timing ring, and power meter all require too many precise inputs. Combined with the defense minigame triggering on top, a single turn can require 2–3 minigame completions. This is exhausting and feels punishing rather than fun.

---

## §2 — Stamina Overhaul

### 2.1 New Stamina Philosophy

Stamina is now THE strategic resource. It's not just "energy to do moves" — it's health, power, and the clock all in one. Think of it like a fighting game health bar that you can partially recover.

### 2.2 New Stamina Rules

| Rule | Current | New |
|------|---------|-----|
| Starting stamina | 100 | 100 |
| Move costs | 3–18 (mostly 8–14) | 5–25 (wider spread, more meaningful) |
| Damage to opponent | 0–16 (50 moves deal 0 dmg) | 0–20 (fewer zero-damage moves) |
| Recovery per turn | +1.5 flat | +3 base, modified by position (top = +4, bottom = +2) |
| Low stamina threshold | 25 (only visual — "tired" pose) | 30 (triggers gameplay penalties) |
| TKO threshold | 0 | 0 |

### 2.3 Stamina Effects at Low Levels

When a fighter drops below 30 stamina ("Danger Zone"):

- **Moves cost 50% more** stamina (rounded up). A 10-cost move now costs 15.
- **Minigames get harder** — speed increases 25%, target zones shrink 20%.
- **Submission defense is weaker** — difficulty modifier shifts +0.15 toward the attacker.
- **Visual cue:** Stamina bar pulses red, fighter sprite switches to "tired" pose, screen edges get a subtle red vignette, Low Stamina Danger Zone music track kicks in (already exists as `Low_Stamina_Danger_Zone.mp3`).
- **Audio cue:** `SoundEngine.stamina_warning()` plays every 3 turns while in danger zone.

### 2.4 Stamina Bar Visual Upgrade

The current stamina bar is a thin 12px strip with a small "STA" label. This needs to be prominent and animated:

- **Size:** Increase bar height to 20px on mobile, 16px on desktop.
- **Animated fill:** Smooth CSS transition on width change (already exists at 500ms, keep this).
- **Color ramp:** Green (>60) → Yellow (30–60) → Red (<30) — already implemented via `stCol()`.
- **Pulse animation:** When below 30, the bar pulses with a `@keyframes staminaPulse` animation (scale 1.0 → 1.05, opacity 1.0 → 0.8, repeating).
- **Damage flash:** When stamina decreases, briefly flash the lost portion white before it shrinks (200ms flash, then 400ms shrink).
- **Number display:** Show actual number prominently (font-size 14px, bold) next to the bar, not hidden in tiny text.

### 2.5 Move Categories by Stamina Impact

Every move now falls into one of these stamina profiles:

| Profile | Cost | Opponent Damage | Net Stamina Swing | Example Moves |
|---------|------|----------------|-------------------|---------------|
| **Light** | 5–8 | 0–4 | -5 to -4 | Frame & Recover, Hip Escape, Stand Up |
| **Medium** | 10–15 | 6–10 | -9 to -5 | Guard Pass, Sweep, Takedown |
| **Heavy** | 16–20 | 12–18 | -8 to -2 | Ground & Pound, Smash Pass, Smother |
| **Stamina Drain** | 8–12 | 10–15 | +2 to +3 (net positive!) | Smother, Pressure, Squeeze |
| **Recovery** | 3–5 | 0 | Recovers 8–12 extra | Breathe, Reset Position |
| **Submission** | 18–25 | 0 (instant finish) | Big gamble | All subs |

Key changes: "Stamina Drain" moves exist that cost you some stamina but drain MORE from the opponent. "Recovery" moves exist that sacrifice your turn to recover extra stamina. This creates real strategic choices.

### 2.6 New Move Properties

Add these fields to the MOVES data structure:

```javascript
{
  name: "Smother",
  type: "tap",
  stat: "strength",
  cost: 10,        // stamina cost to you
  dmg: 14,         // stamina damage to opponent
  selfHeal: 0,     // stamina you recover (on success)
  oppDrain: 0,     // additional opponent drain (on top of dmg)
  desc: "Heavy chest pressure, drain their gas tank",
  // ... existing fields
}
```

Moves like "Breathe" or "Reset":
```javascript
{
  name: "Breathe",
  type: "timing",
  stat: "stamina",
  cost: 3,
  dmg: 0,
  selfHeal: 12,    // recover 12 stamina on success
  desc: "Controlled breathing, recover stamina",
}
```

---

## §3 — Four-Move Limit

### 3.1 Core Rule

Each character has **4 equipped moves per position** at any time. The full move pool (6–8+ per position) exists but only 4 are active.

### 3.2 Default Loadouts

Each character starts with a sensible default loadout per position. Example for Marcus in Mount (top):

**Full pool (current):** Ground & Pound, Armbar, Americana, Smother, Transition to Back, Dismount
**Default equip (4):** Ground & Pound, Smother, Transition to Back, Armbar

### 3.3 Equip/Forget Flow

Between fights (from the main menu or pre-fight screen):
1. Player taps "Moves" → sees all positions
2. Taps a position → sees 4 equipped moves + greyed-out available moves
3. To equip a new move: tap it → prompted "Replace which move?" → tap the move to forget → swap happens
4. Forgotten moves go back to the library, never lost permanently

### 3.4 Campaign Unlock Progression

At campaign start, the player has only 2–3 moves per position. New moves unlock through:
- Chapter completion (primary)
- Beating specific opponents
- Mini-game achievements

By end of campaign, all moves are unlocked and the player has a full library to build custom loadouts.

---

## §4 — XP & Leveling

### 4.1 XP Sources

| Source | XP |
|--------|-----|
| Win a fight | 100 |
| Win by submission | +50 bonus |
| Win in under 8 turns | +30 bonus |
| Win with >50% stamina | +20 bonus |
| Lose a fight | 30 |
| Complete a mini-game | 15–25 |
| Daily challenge completion | 50 |

### 4.2 Skill Points (earned on level-up)

1 skill point per level. Spend on:

| Upgrade | Effect | Max Level |
|---------|--------|-----------|
| Stamina Pool | +5 max stamina per level | 5 (caps at 125) |
| Recovery Rate | +0.5 stamina per turn | 5 (caps at +5.5/turn) |
| Move Power | +5% success rate on minigames | 5 |
| Sub Defense | +0.05 defense modifier | 5 |

### 4.3 Level Curve

Roughly 3–4 fights per level. Level cap at 20 for launch (expandable with future content).

---

## §5 — Campaign Structure

### 5.1 Chapter Breakdown

| Ch | Title | Fights | Opponents | Difficulty | Unlocks |
|----|-------|--------|-----------|------------|---------|
| 1 | White Belt Basics | 3 | 15yo Green Belt, Yoga Mum, TRT Dad | Tutorial/Easy | 2–3 starter moves per position |
| 2 | Open Mat | 4 | Gym Enforcer, Influencer Girl, Tall Skinny Guy, MMA Fighter Girl | Easy-Med | 2 new moves + first submission |
| 3 | In-House Comp | 4 | Competition Purple Belt, + harder versions of Ch1 goons | Medium | 2 new moves + second submission |
| 4 | Local Tournament | 5 | Mixed goons at higher difficulty + first hero boss (Adele/Yuki) | Med-Hard | Character special move + third sub |
| 5 | Regional Open | 5 | Hard goons + second hero boss | Hard | Advanced position transitions |
| 6 | The Invitational | 3 | Boss rush — all 3 heroes at max difficulty | Very Hard | Prestige gi colour |

### 5.2 Hero Boss Fights

Chapters 4–6 feature the other two roster heroes as boss opponents. Boss fights use the full combined grapple artwork (Marcus vs Adele art already exists). These are the premium fight experiences where the art really shines.

### 5.3 Goon Fights

Chapters 1–3 (and filler fights in 4–5) use the 8 goon archetypes. Goons have:
- Individual standing sprites (idle, hit, win, lose, tired, effort) — NOT combined grapple art
- Face sprites for submission cutscenes
- Unique names and personality lines
- Simplified move pools (3–4 moves per position, no custom affinities)
- Difficulty controlled by AI parameters, not move quality

This means goon fights show individual sprites even during ground positions (like the current Yuki experience), while boss fights switch to the combined grapple artwork.

---

## §6 — Minigame Simplification

### 6.1 Current Problems

- **Sequence:** 4–6 arrows to memorize and replay. Too many steps, feels like a memory test not a fight.
- **Power meter:** Oscillating bar, hit the green zone. Okay but the zone is too small.
- **Timing ring:** Shrinking ring, tap when it overlaps. Good concept, too fast.
- **Rapid tap:** Mash to fill a bar. Boring and hard on mobile.

### 6.2 New Minigame Specs

**Sequence — Reduce to 2–3 inputs max:**
- Easy difficulty: 2 arrows
- Medium: 3 arrows
- Hard: 3 arrows, faster display
- Input window: 2 seconds per arrow (up from ~1.5s)

**Power Meter — Larger green zone:**
- Green zone width: 30% of bar (up from ~20%)
- Perfect zone (center): 10% of bar
- One oscillation, tap once. That's it.

**Timing Ring — Slower approach:**
- Ring shrinks over 1.5 seconds (up from ~1s)
- Success window: 300ms (up from ~200ms)
- Perfect window: 100ms

**Rapid Tap — Replace with "Hold & Release":**
- Hold the button. A bar fills. Release in the green zone.
- Much more mobile-friendly than mashing.
- Green zone: top 25–40% of the bar.

### 6.3 Defense Minigames

Defense minigames (triggered when opponent tries a position change) are currently identical to attack minigames. Simplify:

- **No defense minigame on Easy difficulty** — defense is auto-calculated from stats only
- **Medium:** Defense minigame is always the simplest type (single-tap timing)
- **Hard:** Full defense minigame, player choice

---

## §7 — AI Difficulty Scaling

5 dimensions scaled across campaign chapters:

| Dimension | Ch 1 | Ch 3 | Ch 6 |
|-----------|------|------|------|
| Move selection | Random | Position-aware | Reads player patterns |
| Minigame accuracy | 25% | 55% | 90% |
| Submission attempts | Never | When stamina advantage | Opportunistic |
| Stamina management | Wastes stamina | Basic conservation | Uses recovery moves strategically |
| Adaptation | None | Mild counter-play | Adjusts mid-fight |

---

## §8 — Side-Scroller Intermissions

Short action breaks between campaign fights. 30–60 seconds max. One-thumb controls. Always give a tangible reward.

| Scenario | Setting | Mechanic | Reward |
|----------|---------|----------|--------|
| Walk to the Gym | City street | Dodge obstacles, collect protein shakes | Stamina boost |
| Open Mat Gauntlet | Gym mat | Tap-to-grapple quick encounters | XP bonus |
| Tournament Hallway | Arena backstage | Navigate crowds, dodge cameras | First-turn advantage |
| Post-Fight Celebration | Podium / locker room | Collect items, fist-bump teammates | Bonus coins |
| Late Night Drill | Empty gym | Shadow-grapple timing game | Unlock new move |

**Design rules:** Max 60 seconds. One-thumb controls only. Skip button after first completion. Same pixel art style. Every one gives a reward.

---

## §9 — Comedy Mini-Games

6 BJJ gym humour mini-games. Appear between campaign chapters. Replayable from main menu.

### 1. Catch the Mouthguard
Your mouthguard flies out mid-roll. Tap to catch it as it bounces around. Others' mouthguards appear as distractions — catching the wrong one costs a life. 3 lives. Score = total catches.

### 2. Clean the Mats
Swipe to mop sweat stains before next class. Timer countdown. Some stains need multiple swipes. People keep walking across the clean area. 80% clean to pass.

### 3. Belt Whipping Gauntlet
Just got promoted — run the gauntlet. Belts swing from both sides on a rhythm. Tap left/right to dodge. Miss = whipped (slow down). Survive to earn the belt.

### 4. Wash Your Gi
Sorting game. Gis fly toward you on a conveyor. Sort into bins: whites, colours, "beyond saving." Speed ramps up. Bonus for catching the stray sock.

### 5. Don't Get Stacked
Balance game. Training partners pile on while you sit in guard. Tilt/tap to keep the stack balanced. Score = number of people stacked before collapse.

### 6. Tape Your Fingers
Precision dexterity game. Trace circular paths on screen to wrap tape around busted fingers. Too loose = falls off. Too tight = finger turns purple. Time limit per finger.

**Rewards:** Each mini-game gives a campaign reward (stamina boost, XP multiplier, cosmetic) and has an arcade mode with leaderboard scores.

---

## §10 — Daily Engagement & Retention

### 10.1 Daily Challenge
One fight challenge per day with specific conditions ("Win via submission in under 8 turns"). Streak counter at 3/7/14/30/60 days with escalating rewards.

### 10.2 Daily Mini-Game Rotation
One featured mini-game per day. Players compete for daily high score.

### 10.3 Quick Match
Pick any unlocked character, pick difficulty, fight. No campaign context. XP earned at 50% rate.

### 10.4 Training Mode
Free practice against configurable AI. No rewards, no stakes.

---

*This document is structured for direct Claude Code execution. Each section is a self-contained implementation task.*
