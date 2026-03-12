# LOCKDOWN v5 — Position & Move Redesign

## Source File Confirmation
Working from **lockdown_game.html** (uploaded Vercel build), NOT the older `lockdown.jsx` in the project. The uploaded build is significantly ahead — it already has Open Guard, Butterfly Guard, Turtle, special character moves, a defensive/defendable system, grapple combo sprites, and flavor text.

**Adele is not in the current build** (roster: Marcus, Yuki, Darius, Diego). Her affinity profile is included for when she's added.

---

## Changes Summary

### New Position: Ashi Garami
Leg entanglement. The entangler is "top" (they have positional control). Dominance level 2 (same as Half Guard — moderate advantage for attacker).

**Attacks (top/entangler):** Outside Heel Hook (sequence), Double Trouble → Inside Heel Hook (sequence), Inside Heel Hook (timing), Knee Bar (power), Straight Foot Lock (timing), Leg Control (tap — maintenance).

**Defenses (bottom/defending):** Kick Free to Standing (power), Recover Guard (timing), Step Over to Top (sequence), Counter Leg Lock (timing — submit counter!).

### Closed Guard Top — No Submissions
Top player in closed guard can only: Open the Guard (→ Open Guard), Stack Pass (sequence → Side Control, high risk/reward), Stand Up in Guard (→ Open Guard), Posture & Pressure (tap — maintenance). This is BJJ-correct — you can't submit from inside someone's closed guard.

### Open Guard Top — Pass Variety
Now has: Torreando (sequence), Bodylock (power), Knee Cut (timing), Leg Drag (power), Step Into Half Guard (timing). Five distinct passing styles matching real BJJ.

### Back Control — No-Gi Correct
Removed Bow & Arrow (gi choke). Added: Reverse Triangle (sequence — hardest minigame), Armbar from Back (timing). Kept: RNC (sequence), Short Choke (power), Back Pressure (tap).

### Side Control — Added Arm Triangle
Arm Triangle (sequence) added to top attacks. Also added bottom Ashi Entry and Back Take (both sequence — high risk/reward).

### Mount — No-Gi Correct
Cross Collar removed (already done). Added: Americana (power), Smother (tap — cheapest pressure option). Now has: Arm Triangle, Mounted Armbar, Americana, Smother, Heavy Pressure, Take the Back.

### All Bottom Positions → Ashi Garami
Every bottom position now has an "Ashi Entry" move (sequence type in most cases, timing from Open Guard). This is always higher risk (sequence = hardest minigame) but gives bottom players an escape route into leg lock territory.

### Guard & Side Control Bottom → Back Control
Guard bottom and side control bottom now have "Back Take" options (sequence type, defendable). Very high risk/high reward — hardest minigame type for the biggest positional jump.

### Sequential = Highest Risk/Reward (Enforced)
All sequence-type moves are the most expensive, most rewarding, and hardest to execute. This maps perfectly to the button sequence minigame being the hardest by far.

---

## Character Positional Affinity System

### Mechanic
Each character has a `posAffinity` table mapping every position+role to a multiplier (0.7–1.3). Applied to:
1. **Minigame stat bonus** — stronger in their positions
2. **AI move weighting** — AI plays to character strengths
3. **Defense rolls** — better defense in comfortable positions

### Marcus "The Bull" Reyes — Pressure Wrestler

| Area | Rating | Notes |
|------|--------|-------|
| Standing/Clinch | ★★★ (1.3) | Elite wrestler, takedowns are his entry |
| Guard/Open Guard Top | ★★ (1.15) | Good passer, smash style |
| Guard Bottom (any) | ✗ (0.7) | Hates bottom, no guard game |
| Side Control Top | ★★★ (1.3) | King of pressure, arm triangle country |
| Mount Top | ★★★ (1.3) | Smother city, heavy hips |
| Back Control Top | ★ (1.0) | Can maintain but not specialist |
| Ashi Garami (attacking) | ✗ (0.7) | Not a leg locker |
| Scramble | ★★ (1.15) | Power scrambles, ends up on top |

### Adele Fiorevar — Guard / Leg Lock Specialist (future)

| Area | Rating | Notes |
|------|--------|-------|
| Standing/Clinch | ✗ (0.85) | Wants to pull guard ASAP |
| Guard Bottom (any) | ★★★ (1.3) | Her world — triangles, sweeps, entries |
| Guard/Open Guard Top | ✗ (0.85) | Doesn't want to be passing |
| Side Control Top | ✗ (0.85) | Not a pressure player |
| Mount Top | ✗✗ (0.7) | Never plays mount |
| Back Control Top | ★★★ (1.3) | Elite back taker, RNC specialist |
| Ashi Garami (attacking) | ★★★ (1.3) | Leg lock queen |
| Scramble | ★ (1.0) | Can scramble to legs or guard |

### Yuki "Spider" Tanaka — Technical Guard / Hybrid

| Area | Rating | Notes |
|------|--------|-------|
| Standing/Clinch | ✗ (0.85) | Prefers to pull guard |
| Open Guard Bottom | ★★★ (1.3) | Spider guard specialist |
| Guard Bottom (closed) | ★★ (1.15) | Strong guard, The Web |
| Guard Top (any) | ★ (1.0) | Technical passer |
| Side Control Bottom | ★★ (1.15) | Great escapes, reguard |
| Mount Top | ✗ (0.85) | Not a mount player |
| Back Control | ★★ (1.15 both) | Good back attacks + escapes |
| Ashi Garami | ★ (1.0) | Knows legs but not specialist |
| Scramble | ★★ (1.15) | Fast, good scrambles |

### Darius "The Ghost" Okeke — Counter Fighter

| Area | Rating | Notes |
|------|--------|-------|
| Everything Top | ★ (1.0) | Decent everywhere, nothing elite |
| Side Control/Mount/Back Bottom | ★★★ (1.3) | ELITE escapes — signature trait |
| Scramble | ★★ (1.15) | Good at winning chaos |
| Ashi Garami (defending) | ★★ (1.15) | Good at escaping legs too |

### Diego "Loco" Vega — Wild Card

| Area | Rating | Notes |
|------|--------|-------|
| Ashi Garami (attacking) | ★★★ (1.3) | Heel hook specialist |
| Scramble | ★★★ (1.3) | Chaos is home |
| Clinch | ✗ (0.85) | Doesn't like structured grappling |
| Side Control/Mount Top | ✗ (0.85) | Boring positions, wants chaos |
| Open Guard/Butterfly Bottom | ★★ (1.15) | Inversions and entries |

### Balance Verification
Average affinity across all positions per character:
- Marcus: 0.99 (top-heavy distribution)
- Adele: 0.97 (bottom-heavy)
- Yuki: 1.05 (slight bottom bias)
- Darius: 1.07 (escape-heavy)
- Diego: 0.99 (scramble-heavy)

All within ±8% of 1.0 — balanced globally, distinctive locally.

---

## Position Flow Map (Updated)

```
                     STANDING
                    /    |    \
                CLINCH   |   SCRAMBLE
               /    \    |    /    \
          GUARD ← → OPEN GUARD ← → BUTTERFLY
            |    \      |     /       |
            |     → HALF GUARD ←      |
            |         |    \          |
            |    SIDE CONTROL ← ─ ─ ─┘
            |       /    \
            |    MOUNT    TURTLE
            |      \       /
            └──→ BACK CONTROL
            
     ── Any bottom position ──→ ASHI GARAMI
     ── Guard/SC bottom ──→ BACK CONTROL (high risk)
```

---

## Implementation Notes

The code file `lockdown_v5_moves_update.js` contains:
1. Updated POS constants
2. Updated POS_DOM with Ashi Garami
3. Complete POS_AFFINITY data for all 5 characters
4. `getAffinity()` helper function
5. Complete MOVES object with all changes
6. Integration instructions for resolveMove, AI selection, and defense
7. Sprite/UI mapping additions needed
