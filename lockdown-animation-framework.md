# LOCKDOWN Animation Framework Reference

> Use this document when prompting Claude Code to modify, extend, or debug animations in LOCKDOWN. Every animation system, timing value, and visual effect is documented here.

---

## Architecture Summary

LOCKDOWN uses **zero-canvas, CSS-only animations** on sprite `<img>` elements. There is no `<canvas>`, no requestAnimationFrame loop, no sprite sheets. All motion comes from:

1. **CSS keyframe animations** — applied via className toggling
2. **CSS transitions** — `transition-all duration-700` on fighter container divs
3. **setTimeout chains** — sequencing multiple effects (the "choreography" system)
4. **React state** — toggling overlay components on/off (flash, dust, slam text)

The style block is a template literal injected into `<style>` on mount (lines 14-135 of lockdown.jsx).

---

## 1. Idle / State Animations

These run continuously while a fighter is in a given state. Applied as className on the sprite `<img>`.

### breatheA (idle standing)
```css
@keyframes breatheA {
  0%, 100% { transform: translateY(0) scale(1) }
  30%      { transform: translateY(-3px) scale(1.01) }
  70%      { transform: translateY(-1px) scale(1.005) }
}
.anim-breathe { animation: breatheA 3s ease-in-out infinite }
```
- **When:** Default idle state for all standing poses
- **Feel:** Subtle chest-rise breathing. 3s cycle is slow enough to feel natural, fast enough to show life
- **Notes:** Only ONE idle animation runs — no sprite-swapping between idle/idle2 frames. The `idle2` sprite exists in SPRITE_DATA but is not used in animation cycling (removed to prevent jarring two-frame flicker)

### breatheB (offset breathing)
```css
@keyframes breatheB {
  0%, 100% { transform: translateY(-1px) scale(1.01) }
  50%      { transform: translateY(1px) scale(1) }
}
.anim-breatheB { animation: breatheB 2.5s ease-in-out infinite }
```
- **When:** Available but currently unused (was for idle2 frame alternation)

### struggle (pinned/trapped)
```css
@keyframes struggle {
  0%, 100% { transform: rotate(0deg) scale(1) }
  25%      { transform: rotate(-3deg) scale(0.98) }
  75%      { transform: rotate(3deg) scale(1.02) }
}
.anim-struggle { animation: struggle 0.3s ease-in-out infinite }
```
- **When:** Fighter is in `backTaken` or `pinned` pose (bottom of back control, side control)
- **Feel:** Rapid jittery rotation — communicates being trapped and fighting to escape

### effortPulse (minigame active)
```css
@keyframes effortPulse {
  0%, 100% { transform: scale(1); filter: brightness(1) }
  50%      { transform: scale(1.04); filter: brightness(1.15) drop-shadow(0 0 8px var(--char-color, #fff)) }
}
.anim-effort { animation: effortPulse 1s ease-in-out infinite }
```
- **When:** Fighter is performing a minigame (uses `effort` sprite)
- **Feel:** Glowing pulse showing exertion. Uses `--char-color` CSS variable for character-specific glow color

### tiredSag (exhausted/defeated)
```css
@keyframes tiredSag {
  0%, 100% { transform: translateY(0) rotate(0deg) }
  50%      { transform: translateY(3px) rotate(-1deg) }
}
.anim-tired { animation: tiredSag 3s ease-in-out infinite }
```
- **When:** Fighter stamina < 25 (`tired` sprite), or in `tapOut`/`lose` pose
- **Feel:** Slow droop — weight sinking, head tilting. Communicates vulnerability

### hitRecoil (taking damage)
```css
@keyframes hitRecoil {
  0%   { transform: translateX(0) scale(1); filter: brightness(1) }
  15%  { transform: translateX(-16px) rotate(-4deg) scale(0.95); filter: brightness(2.5) }
  30%  { transform: translateX(10px) rotate(2deg); filter: brightness(1) }
  50%  { transform: translateX(-6px) rotate(-1deg); filter: brightness(1.3) }
  100% { transform: translateX(0) scale(1); filter: brightness(1) }
}
.anim-hit { animation: hitRecoil 0.5s cubic-bezier(.25,.46,.45,.94) }
```
- **When:** Fighter takes damage (hit reaction, `hit` sprite shown for 1200ms)
- **Feel:** Flash white (brightness 2.5) → recoil left → bounce right → settle. The brightness flash is key — it reads as impact even at small sprite sizes

### winCelebrate (victory)
```css
@keyframes winCelebrate {
  0%   { transform: translateY(0) scale(1) }
  20%  { transform: translateY(-16px) scale(1.1) }
  40%  { transform: translateY(-8px) scale(1.05) }
  60%  { transform: translateY(-12px) scale(1.08) }
  100% { transform: translateY(0) scale(1) }
}
.anim-celebrate { animation: winCelebrate 0.7s cubic-bezier(.34,1.56,.64,1) }
```
- **When:** Fighter wins (`win` sprite)
- **Feel:** Bouncy celebration — jumps up, settles, bounces again. The overshoot cubic-bezier gives it personality

### State → Animation Mapping (in Fighter component)
```
win       → anim-celebrate
hit       → anim-hit
tapOut    → anim-tired
lose      → anim-tired
backTaken → anim-struggle
pinned    → anim-struggle
effort    → anim-effort
tired     → anim-tired
attacking → anim-lunge / anim-lungeLeft (based on facing)
default   → anim-breathe
```

---

## 2. Pose Transition System

When a fighter changes pose (e.g., idle → mountTop after a takedown), the Fighter component detects the change and plays a dual-sprite crossfade: the outgoing sprite fades out while the incoming sprite fades in. The transition type is auto-classified.

### Transition Classification Logic
```
if defeat (tapOut/lose)         → "impact"   (instant dramatic)
if win                          → "victory"  (bouncy entrance)  
if standing → ground            → "drop"     (takedown slam down)
if ground → standing            → "rise"     (stand-up rising)
if ground → ground              → "scramble" (position change)
if hit                          → "impact"   (quick snap)
else                            → "snap"     (default quick swap)
```

### Transition Keyframes & Timings

#### Snap (standing ↔ standing) — 300ms
```css
@keyframes transOutSnap { 0% { opacity:1; transform:scale(1) } 100% { opacity:0; transform:scale(0.9) } }
@keyframes transInSnap  { 0% { opacity:0; transform:scale(1.1) } 100% { opacity:1; transform:scale(1) } }
.trans-out-snap { animation: transOutSnap 0.3s ease-out both }
.trans-in-snap  { animation: transInSnap 0.3s ease-out both }
```

#### Drop (standing → ground: takedown) — 600ms
```css
@keyframes transOutDrop { 
  0%   { opacity:1; transform:translateY(0) scale(1) } 
  100% { opacity:0; transform:translateY(30px) scale(0.7) rotate(8deg) } 
}
@keyframes transInDrop { 
  0%   { opacity:0; transform:translateY(-20px) scale(1.15) } 
  40%  { opacity:1; transform:translateY(4px) scale(1.02) } 
  100% { opacity:1; transform:translateY(0) scale(1) } 
}
.trans-out-drop { animation: transOutDrop 0.5s cubic-bezier(.55,.06,.68,.19) both }
.trans-in-drop  { animation: transInDrop 0.6s cubic-bezier(.22,1,.36,1) both }
```
- Out: drops down and shrinks (body falling). In: drops from above and bounces into place (slam landing)

#### Rise (ground → standing: stand up) — 500ms
```css
@keyframes transOutRise { 
  0%   { opacity:1; transform:translateY(0) scale(1) } 
  100% { opacity:0; transform:translateY(-15px) scale(0.85) } 
}
@keyframes transInRise { 
  0%   { opacity:0; transform:translateY(20px) scale(0.85) } 
  50%  { opacity:1; transform:translateY(-4px) scale(1.03) } 
  100% { transform:translateY(0) scale(1) } 
}
.trans-out-rise { animation: transOutRise 0.45s ease-in both }
.trans-in-rise  { animation: transInRise 0.5s cubic-bezier(.22,1,.36,1) both }
```
- Out: lifts up and fades. In: rises from low position with slight overshoot

#### Scramble (ground ↔ ground: position change) — 450ms
```css
@keyframes transOutScramble { 
  0%   { opacity:1; transform:translate(0,0) rotate(0) } 
  100% { opacity:0; transform:translate(8px,4px) rotate(5deg) scale(0.9) } 
}
@keyframes transInScramble { 
  0%   { opacity:0; transform:translate(-8px,4px) rotate(-5deg) scale(0.9) } 
  60%  { opacity:1; transform:translate(1px,-1px) rotate(0.5deg) scale(1.02) } 
  100% { opacity:1; transform:translate(0,0) rotate(0) scale(1) } 
}
.trans-out-scramble { animation: transOutScramble 0.4s ease-in both }
.trans-in-scramble  { animation: transInScramble 0.45s cubic-bezier(.22,1,.36,1) both }
```
- Both sprites shift laterally with rotation — sells the chaos of ground position changes

#### Impact (hit reaction / defeat) — 150ms in, no out
```css
@keyframes transInImpact { 
  0%   { transform:translateX(-10px) scale(0.93); filter:brightness(3) } 
  20%  { filter:brightness(1.5) } 
  50%  { transform:translateX(5px) scale(1.03) } 
  100% { transform:translateX(0) scale(1); filter:brightness(1) } 
}
.trans-in-impact { animation: transInImpact 0.5s cubic-bezier(.25,.46,.45,.94) both }
```
- No outgoing animation (instant cut). Incoming flashes white and recoils — immediate impact feel

#### Victory — 600ms
```css
@keyframes transInVictory { 
  0%   { opacity:0; transform:scale(0.5) translateY(10px) } 
  40%  { opacity:1; transform:scale(1.12) translateY(-8px) } 
  70%  { transform:scale(0.97) translateY(2px) } 
  100% { transform:scale(1) translateY(0) } 
}
.trans-in-victory { animation: transInVictory 0.7s cubic-bezier(.34,1.56,.64,1) both }
```
- Dramatic pop-in with scale overshoot

### Crossfade Timing
The incoming sprite delays by `duration * 0.3` (except impact which is instant). During this overlap both sprites are rendered simultaneously — the outgoing fading/shrinking while incoming fades/grows in. This creates smooth visual continuity.

---

## 3. Attack / Lunge Animations

```css
@keyframes attackLunge {
  0%   { transform: translateX(0) scale(1) }
  40%  { transform: translateX(30px) scale(1.08) }
  100% { transform: translateX(0) scale(1) }
}
@keyframes attackLungeLeft {
  0%   { transform: translateX(0) scale(1) }
  40%  { transform: translateX(-30px) scale(1.08) }
  100% { transform: translateX(0) scale(1) }
}
.anim-lunge     { animation: attackLunge 0.6s cubic-bezier(.25,.46,.45,.94) }
.anim-lungeLeft { animation: attackLungeLeft 0.6s cubic-bezier(.25,.46,.45,.94) }
```
- **When:** `isAttacking` flag is true (set for 600ms during `triggerAttack`)
- **Direction:** Right-facing fighters lunge right, left-facing lunge left (toward opponent)
- **Applied via:** Fighter component checks `isAttacking` → overrides idle animation class

---

## 4. Screen Effects (Overlay Components)

### ImpactFlash
```jsx
function ImpactFlash({color="#fff", active}) {
  if(!active) return null;
  return <div className="impact-flash" style={{background:color}} key={Date.now()}/>;
}
```
```css
@keyframes impactFlash { 0% { opacity:0.7 } 100% { opacity:0 } }
.impact-flash { position:absolute; inset:0; pointer-events:none; z-index:50; animation:impactFlash 0.22s ease-out both }
```
- **Duration:** 220ms (controlled by setTimeout in triggerFlash)
- **Colors used:** `"#fff"` (generic), character color (strikes), `"#eab308"` (submissions), `"#06d6a0"` (player TKO), `"#e63946"` (AI TKO)
- **Purpose:** Full-screen color flash that covers the entire arena. Hides sprite transition seams and sells impact

### SlamText
```jsx
function SlamText({text, color="#eab308", active}) {
  // Renders centered text with slam animation
}
```
```css
@keyframes slamText {
  0%   { opacity:0; transform:scale(3) rotate(-5deg) }
  30%  { opacity:1; transform:scale(1.1) rotate(1deg) }
  50%  { transform:scale(0.95) rotate(-0.5deg) }
  70%  { transform:scale(1.02) rotate(0) }
  100% { opacity:1; transform:scale(1) rotate(0deg) }
}
.anim-slamText { animation: slamText 0.7s cubic-bezier(.22,1,.36,1) both }
```
- **Duration:** 1800ms (controlled by setTimeout in triggerSlam)
- **Texts used:** "TAKEDOWN!" (green), "LOCKED IN!" / "DEFEND!" (yellow), "TKO!" (color varies)
- **Styling:** Uppercase, bold, text-shadow with color glow, centered at 30% from top

### DustBurst
```jsx
function DustBurst({active, x="50%", y="80%"}) {
  // Renders 6 randomized dust particles
}
```
```css
@keyframes dustFloat {
  0%   { transform:translate(0,0) scale(1); opacity:0.7 }
  100% { transform:translate(var(--dx,10px), var(--dy,-25px)) scale(0.2); opacity:0 }
}
.dust-particle { animation: dustFloat 0.5s ease-out both }
```
- **Duration:** 800ms (controlled by setTimeout in triggerDust)
- **Particles:** 6 circles, randomized size (4-10px), position, direction (CSS custom properties `--dx`, `--dy`), delay, and duration
- **Purpose:** Ground impact effects for takedowns, sweeps, escapes. Positioned at 80% Y (near arena floor)

---

## 5. Choreography System

The `choreograph(type, isPlayer, extra)` function sequences multiple effects with precise setTimeout offsets. This is how complex multi-effect moments are built.

### Effect Primitives
| Function | What it does | Duration |
|----------|-------------|----------|
| `triggerFlash(color)` | Full-screen color flash | 220ms |
| `triggerShake(heavy)` | Arena shake (light=0.35s, heavy=0.65s) | 700ms |
| `triggerSlam(text, color)` | Floating impact text | 1800ms |
| `triggerDust()` | 6 dust particles at arena floor | 800ms |
| `triggerAttack(isPlayer)` | Lunge animation on attacker | 600ms |

### Sequence Definitions

#### "strike" — Normal positional move
```
  0ms  → triggerAttack (lunge toward opponent)
150ms  → triggerFlash (character color)
250ms  → triggerShake (light)
```

#### "heavy" — High-damage move (dmg > 7)
```
  0ms  → triggerAttack (lunge)
120ms  → triggerFlash (white)
200ms  → triggerShake (HEAVY)
250ms  → triggerDust
```

#### "takedown" — Standing to ground transition
```
  0ms  → triggerAttack (lunge)
150ms  → triggerFlash (white)
200ms  → triggerSlam ("TAKEDOWN!", green)
250ms  → triggerShake (HEAVY)
300ms  → triggerDust
```

#### "sweep" — Ground position reversal
```
 80ms  → triggerShake (light)
150ms  → triggerDust
```
- No flash or slam — sweeps are quick and scrappy

#### "submission" — Sub locked in
```
  0ms  → triggerFlash (yellow #eab308)
150ms  → triggerShake (HEAVY)
200ms  → triggerSlam (extra.text — "LOCKED IN!" or "DEFEND!")
```

#### "tko" — Stamina exhaustion finish
```
  0ms  → triggerFlash (green if player wins, red if AI wins)
100ms  → triggerShake (HEAVY)
150ms  → triggerSlam ("TKO!", same color as flash)
```

#### "escape" — Submission escape
```
 80ms  → triggerDust
```
- Minimal — just dust to show scrambling free

---

## 6. Position-Aware Fighter Layout

Fighters are absolutely positioned inside the arena container. Each position defines layout parameters for top and bottom fighters.

### Arena Container
```
min-height: 250px
position: relative, overflow: hidden
```

### Fighter Containers
```css
position: absolute;
transition: all 700ms ease-out;   /* smooth repositioning */
transform: translate(-50%, -50%); /* center on x,y point */
```

### Layout Config (POS_LAYOUT)
Each position defines `{x, y, z, sz, rot}` for both top and bottom fighters:

| Position | Top x,y | Top sz | Top rot | Btm x,y | Btm sz | Btm rot |
|----------|---------|--------|---------|---------|--------|---------|
| Standing | 63,72 | 140 | 0° | 37,72 | 140 | 0° |
| Clinch | 55,72 | 140 | 0° | 45,72 | 140 | 0° |
| Scramble | 56,74 | 130 | 10° | 44,74 | 130 | -10° |
| Guard | 50,48 | 150 | 14° | 50,60 | 140 | -5° |
| Half Guard | 50,48 | 148 | 12° | 50,60 | 135 | -10° |
| Side Control | 50,44 | 155 | 22° | 50,62 | 130 | -14° |
| Mount | 50,40 | 160 | 6° | 50,62 | 130 | 0° |
| Back Control | 48,42 | 160 | -6° | 52,60 | 130 | 10° |

### How Fighter Assignment Works
```
Player on top + ground position → player gets layout.top, AI gets layout.btm
Player on bottom + ground        → player gets layout.btm, AI gets layout.top
Neutral position (standing/clinch/scramble) → player always left (x mirrored), AI always right
```

### Visual Cues Communicated by Layout
- **z-index:** Top fighter always z:2 (renders in front), bottom z:1
- **Size difference:** Top fighter 150-160px vs bottom 125-130px → dominance is visible
- **Rotation:** Top fighter tilts toward bottom (pressing down), bottom tilts away (defensive)
- **Vertical overlap:** At Mount, top is at y=40 and bottom at y=62 — with 160px and 130px sizes, the sprites physically overlap
- **700ms transition:** Position changes animate smoothly as fighters slide/resize into new positions

### Mirroring
- Player always `scaleX(1)` facing right
- AI always `scaleX(-1)` facing left
- For neutral positions, player X is mirrored: `100 - layout.top.x`

---

## 7. Alt Character Recoloring

When `char.isAlt === true`, the Fighter component applies a CSS filter chain:
```css
filter: sepia(0.8) hue-rotate(180deg) saturate(2.5) brightness(1.1)
```

### Why This Specific Chain
Marcus sprites are 93% warm tones (skin, brown). A simple `hue-rotate` barely changes warm browns. The sepia-first approach:
1. `sepia(0.8)` — normalizes all colors to a uniform warm base
2. `hue-rotate(180deg)` — shifts the uniform base to blue/teal
3. `saturate(2.5)` — pumps the shifted color to be vivid and unmistakeable
4. `brightness(1.1)` — compensates for saturation darkening

This produces the classic CPS2 palette-swap look (red gi → blue gi).

---

## 8. UI Animations

### Banner (full-screen announcements)
```css
@keyframes bannerIn {
  0%   { opacity:0; transform:scale(0.3) rotate(-3deg) }
  50%  { transform:scale(1.08) rotate(0.5deg) }
  100% { opacity:1; transform:scale(1) rotate(0deg) }
}
.anim-bannerIn { animation: bannerIn 0.5s cubic-bezier(.34,1.56,.64,1) both }
```
- **Default duration:** 2200ms (time banner stays on screen before auto-dismiss)
- **Background:** Semi-transparent dark overlay (rgba(0,0,0,0.55))
- **Content:** Colored card with icon, title text, subtitle text

### General UI Animations
```css
.anim-fadeUp   { animation: fadeUp 0.4s ease-out both }    /* Content sliding up into view */
.anim-fadeIn   { animation: fadeIn 0.3s ease-out both }    /* Simple opacity fade */
.anim-slideDown{ animation: slideDown 0.4s bounce both }   /* Minigame overlays dropping in */
.anim-popIn    { animation: popIn 0.5s bounce both }       /* VS text, result icons */
```

### Character Select Animations
```css
@keyframes selectIdle { 0%,100% { translateY(0) } 50% { translateY(-4px) } }
@keyframes selectGlow { 0%,100% { drop-shadow(0 0 8px var(--glow-color)) } 50% { drop-shadow(0 0 20px var(--glow-color)) } }
.char-select-sprite { animation: selectIdle 2s infinite, selectGlow 3s infinite }
```

### Grip Fight Pulse
```css
@keyframes gripPulse { 0%,100% { box-shadow:0 0 10px rgba(234,179,8,0.3) } 50% { box-shadow:0 0 30px rgba(234,179,8,0.6) } }
.anim-gripPulse { animation: gripPulse 1s ease-in-out infinite }
```

---

## 9. Timing Reference (all setTimeout values)

| Effect | Duration | Controlled By |
|--------|----------|---------------|
| Impact flash | 220ms | triggerFlash |
| Arena shake | 700ms | triggerShake |
| Slam text | 1800ms | triggerSlam |
| Dust burst | 800ms | triggerDust |
| Attack lunge | 600ms | triggerAttack |
| Hit reaction sprite | 1200ms | resolveMove |
| Banner display | 2200ms | showBanner (default) |
| AI think delay | 1300ms | ai_think useEffect |
| AI resolve delay | 1100ms | ai_think useEffect |
| Sub minigame entry | 800ms | resolveSubmission |
| Position transition | 700ms | CSS transition-all on fighter container |
| Done → result screen | 2200ms | finishFight |

---

## 10. Adding New Animations — Checklist

When adding a new animation:

1. **Define the @keyframes** in the style template literal (lines 14-135)
2. **Create an animation class** (`.anim-yourName`) with appropriate duration, easing, and fill mode
3. **If it's a fighter state:** Add mapping in Fighter component's idle animation logic (line ~504)
4. **If it's a screen effect:** Create a trigger function (`triggerYourEffect`) with state + setTimeout
5. **If it's a choreography sequence:** Add a case to the `choreograph` switch statement
6. **If it's a pose transition:** Add keyframes for out/in variants and add to `transClasses` object in Fighter

### Easing Reference
- `ease-in-out` — Smooth, natural motion (idle loops, breathing)
- `ease-out` — Quick start, gentle end (fades, entrances)
- `cubic-bezier(.34,1.56,.64,1)` — Overshoot/bounce (celebrations, pop-ins, UI elements)
- `cubic-bezier(.22,1,.36,1)` — Smooth overshoot (slam text, transitions)
- `cubic-bezier(.25,.46,.45,.94)` — Controlled deceleration (hit reactions, lunges)
- `cubic-bezier(.55,.06,.68,.19)` — Accelerating out (takedown falls)

### Duration Guidelines
- **Instant feedback:** 100-220ms (flashes, impact transitions)
- **Quick actions:** 300-500ms (snaps, lunges, hit reactions)
- **Medium actions:** 500-700ms (transitions, celebrations, slams)
- **Sustained states:** 1-3s (breathing, struggling, effort pulse)
- **UI persistence:** 1600-2200ms (banners, slam text readability)

---

## 11. Sprite Pose Reference

Each character needs these 16 poses for full animation coverage:

| Pose Key | Used In | Animation Class | Description |
|----------|---------|----------------|-------------|
| idle | Standing neutral | anim-breathe | Default state, breathing bob |
| idle2 | (Reserved) | — | Not currently cycled |
| win | Victory | anim-celebrate | Arms raised / celebrating |
| hit | Taking damage | anim-hit | Recoiling from impact |
| tired | Low stamina (<25) | anim-tired | Exhausted, drooping |
| lose | TKO loss | anim-tired | Collapsed on ground |
| effort | Minigame active | anim-effort | Exerting force, glowing pulse |
| tapOut | Submission loss | anim-tired | Tapping hand on mat |
| guardTop | Guard/Half-Guard top | anim-breathe | Pressing down into guard |
| guardBtm | Guard bottom | anim-breathe | On back, legs controlling |
| mountTop | Mount top | anim-breathe | Sitting on top, dominant |
| mountBtm | Mount bottom | anim-struggle | Trapped under mount |
| pressTop | Side Control top | anim-breathe | Laying across opponent |
| pinned | SC bottom / HG bottom | anim-struggle | Pinned flat, fighting |
| backTop | Back Control top | anim-breathe | Behind opponent, hooks in |
| backTaken | Back Control bottom | anim-struggle | Opponent on your back |

### Sprite Generation Rules (for prompt consistency)
- ONE character per image, transparent background
- Standing poses: 3/4 front view, consistent proportions
- Ground poses: side view, showing body position clearly
- CPS2 pixel art style, ~140px rendered size
- No text, labels, UI elements, or opponents visible
