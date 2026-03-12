# LOCKDOWN — Endgame Build Spec
## Claude Code Implementation Prompt

> **Context:** LOCKDOWN is a single-file React JSX browser game (`lockdown.jsx`, ~2070 lines) deployed on Vercel. It's a turn-based Brazilian Jiu-Jitsu fighting game with CPS2/Street Fighter II pixel art aesthetics. The game currently has: title screen → character select → difficulty select → single fight → result screen. There is **no campaign mode, no side-scroller, no storyline, and no standalone minigames.** This document specifies four major features to build.

> **Authoritative source file:** `lockdown.jsx` — the entire game lives in this single React JSX file. All changes go here. Do not create additional files.

> **Deploy target:** Vercel (single HTML file with inline JSX, Babel transpilation). Must remain mobile-playable on iPhone SE and above.

---

## TABLE OF CONTENTS

1. [Feature 1 — Placeholder Character Art](#feature-1--placeholder-character-art)
2. [Feature 2 — Campaign Mode with Integrated Minigames](#feature-2--campaign-mode-with-integrated-minigames)
3. [Feature 3 — Side-Scroller Marquee Minigame](#feature-3--side-scroller-marquee-minigame)
4. [Feature 4 — Campaign Storyline](#feature-4--campaign-storyline)
5. [Implementation Order](#implementation-order)
6. [Technical Constraints](#technical-constraints)

---

## CURRENT STATE SNAPSHOT

### Screens
`title` → `select` → `difficulty` → `fight` → `result`

### Characters in CHARS Array
| ID | Name | Status | Sprites |
|----|------|--------|---------|
| `marcus` | Marcus "The Bull" Reyes | Unlocked | Full WebP sprite set (idle, idle2, win, lose, hit, tired, effort, tapOut, guardTop, guardBtm, mountTop, mountBtm, pressTop, pinned, backTop, backTaken) |
| `yuki` | Yuki "Spider" Tanaka | Unlocked | Partial WebP sprites (idle, tapOut, tired, effort, triangle, mountBtm) — many poses fall back to idle |
| `darius` | Darius "The Ghost" Okeke | Locked | No sprites — uses SVG fallback |
| `diego` | "Loco" Diego Vega | Locked | No sprites — uses SVG fallback |
| `marcus_alt` | Marcus recolor | AI only | Reuses Marcus sprites with CSS hue filter |

### Characters NOT in CHARS Array (Need Adding)
- **Adele Fiorevar** — Leg lock specialist, lanky build, blonde braid, black rashguard with lime green chevron
- **Rusty Jones** — Australian trickster (description TBD)
- **Luta Duarte** — Brazilian submission artist (description TBD)
- **Mahmedov** — Dagestani pressure tank (description TBD)

### Existing Minigames (In-Fight Only)
- `SequenceMinigame` — Tap a sequence of arrows in order
- `PowerMeterMinigame` — Stop a bouncing bar in the green zone
- `TimingRingMinigame` — Tap when a shrinking ring hits the target
- `RapidTapMinigame` — Mash a button for score
- `SubmissionMinigame` — 3-stage bar-stopping attack/defense
- `GripFightMinigame` — Tug-of-war grip battle

### SVG Fallback (Current Placeholder)
When `getSprite()` returns null (no WebP data), the `FighterSprite` component renders a basic SVG stick figure using the character's `skin`, `hair`, `shorts`, `color`, and `belt` properties. It's functional but looks like colored rectangles and circles — not recognisable as distinct characters.

### Positions
Standing, Clinch, Guard, Half Guard, Side Control, Mount, Back Control, Scramble (8 total in JSX — note: the deployed HTML also has Ashi Garami, Butterfly Guard, Open Guard, and Turtle, but these may not be in the JSX yet).

---

## FEATURE 1 — PLACEHOLDER CHARACTER ART

### Goal
Replace the basic SVG stick-figure fallback with richer, more character-specific SVG placeholder art. Every character — including locked characters and unnamed campaign opponents — should be visually distinguishable at a glance, even without real pixel art sprites.

### What To Build

#### 1A. Enhanced SVG Character Generator
Upgrade the existing fallback SVG in `FighterSprite` (lines ~534-548) from simple rectangles to a more detailed SVG figure system. Each character should be recognisable by:

- **Body proportions** that match their archetype (Marcus = massive/muscular build with wider torso and thicker limbs; Adele = tall/lean with longer limbs; Yuki = compact/wiry; Mahmedov = stocky/thick; etc.)
- **Distinctive clothing** rendered as SVG shapes (rashguard vs bare chest, shorts color/style, ankle wraps, gloves, knee pads)
- **Hair** that's recognisable (Marcus = short dark, Adele = long braid trailing down, Yuki = top knot, Rusty = shaggy)
- **Skin tone accuracy** using the character's `skin` property
- **Signature visual detail** per character (Marcus's bull tattoo as a simple SVG stamp on his arm, Adele's earring dots, etc.)

The SVG should still fit within the existing `viewBox="0 0 64 80"` canvas and scale via the `size` prop.

#### 1B. Pose-Aware SVG Fallback
The current fallback always renders the same standing pose. Extend it to respond to the `pose` parameter so that:

- **Standing/Idle:** Arms slightly raised in fighting stance
- **Guard positions (top):** Kneeling posture, arms forward
- **Guard positions (bottom):** On back, legs raised
- **Mount (top):** Sitting upright posture
- **Mount/Pinned (bottom):** Flat on back
- **Back Control (top):** Behind opponent shape
- **Win:** Arms raised celebration
- **Lose/TapOut:** Slumped posture
- **Effort:** Leaning forward, tension pose
- **Hit:** Recoiling

This doesn't need to be anatomically perfect — just enough visual variety that the game reads differently per position even without real sprites.

#### 1C. Campaign Opponent Generator
Create a function `generateOpponent(seed, tier)` that produces unique unnamed opponents for campaign mode. These should:

- Use a seeded random number generator (based on campaign level index) so opponents are consistent across sessions
- Generate randomised but plausible visual properties: skin tone (from a diverse palette), hair style/color, shorts color, body build (3-4 archetypes: stocky, lean, average, muscular)
- Generate a random name from a pool (e.g., "Iron Mike", "The Professor", "Scrappy", "Big Pete", "Tornado", "The Wall", common BJJ gym nicknames)
- Generate randomised but balanced stats (scaled to the campaign tier)
- Return a character object compatible with the existing `CHARS` schema

#### 1D. Add Missing Roster Characters
Add Adele, Rusty, Luta, and Mahmedov to the CHARS array with:

- Full stat blocks (balanced against existing roster)
- Visual properties (`skin`, `hair`, `shorts`, `color`, `belt`, `accent`) that work with the enhanced SVG generator
- Appropriate `locked` status (some locked, some unlocked — at minimum Adele should be unlocked)
- Signature moves
- Bio text
- Difficulty ratings

**Character profiles to use:**

**Adele Fiorevar:**
- Style: Leg Lock Specialist
- Difficulty: MEDIUM
- Build: Athletic/lanky, long limbs
- Skin: Very light/pale (`#F5E6D8`)
- Hair: Golden blonde (`#D4A843`), long braid
- Outfit: Black rashguard with lime green accents, black shorts with neon green stripe
- Color theme: Lime green (`#84cc16`)
- Stats: High guard, high submissions, high speed; low strength, low takedowns
- Sig: "The Mousetrap" — Ashi Garami to heel hook sequence

**Rusty Jones:**
- Style: Trickster / Unorthodox
- Difficulty: HARD
- Build: Average, scrappy
- Skin: Tan/sun-weathered (`#D4956A`)
- Hair: Shaggy ginger/red (`#B8451C`)
- Outfit: Loud Hawaiian-print rashguard (use bright multi-color for `shorts`), board shorts
- Color theme: Orange-gold (`#f59e0b`)
- Stats: High escapes, high speed; unpredictable spread on others
- Sig: "The Croc Roll" — Chaotic scramble inversion

**Luta Duarte:**
- Style: Pure Submission Artist
- Difficulty: MEDIUM
- Build: Lean muscular, classic BJJ build
- Skin: Medium brown (`#A0724A`)
- Hair: Dark curly (`#1a0f08`)
- Outfit: White gi top (rare — make him stand out), blue belt sash
- Color theme: Deep blue (`#2563eb`)
- Stats: Elite submissions, great guard; weaker takedowns and escapes
- Sig: "Mão de Ferro" (Iron Hand) — Unstoppable grip to submission

**Mahmedov:**
- Style: Smothering Pressure / Wrestling
- Difficulty: HARD
- Build: Short, extremely stocky and thick
- Skin: Light olive (`#C8A882`)
- Hair: Short dark, thick beard (`#2a1a0a`)
- Outfit: Dark singlet/compression top, plain dark shorts
- Color theme: Dark red/maroon (`#991b1b`)
- Stats: Elite takedowns, elite strength, great passing; weak guard, low submissions
- Sig: "The Anvil" — Crushing top pressure that drains stamina

### Technical Notes
- The enhanced SVG fallback must not break existing sprite rendering — if `getSprite()` returns a valid WebP data URL, that still takes priority
- All new characters need entries in the `getSprite()` fallback map (even if just mapping everything to their idle SVG for now)
- The `scaleX(-1)` facing convention must work with SVG fallbacks too
- Keep SVG complexity reasonable — these are placeholders, not final art. Target ~20-30 SVG elements per character max

---

## FEATURE 2 — CAMPAIGN MODE WITH INTEGRATED MINIGAMES

### Goal
Build a full campaign mode accessible from the title screen. The player progresses through a series of opponents across multiple tiers (belt levels), with a side-scroller minigame between each fight, story beats at key moments, and increasing difficulty.

### What To Build

#### 2A. Campaign Structure

```
CAMPAIGN STRUCTURE (5 Acts, ~20 fights total)

ACT 1 — WHITE BELT (Fights 1-4)
  Story Intro → [Side-Scroller] → Fight 1 → [Side-Scroller] → Fight 2 → 
  [Side-Scroller] → Fight 3 → [Side-Scroller] → Fight 4 (Act Boss) → Story Beat

ACT 2 — BLUE BELT (Fights 5-8)
  Story Beat → [Side-Scroller] → Fight 5 → [Side-Scroller] → Fight 6 → 
  [Side-Scroller] → Fight 7 → [Side-Scroller] → Fight 8 (Act Boss) → Story Beat

ACT 3 — PURPLE BELT (Fights 9-12)
  Story Beat → [Side-Scroller] → Fight 9 → [Side-Scroller] → Fight 10 → 
  [Side-Scroller] → Fight 11 → [Side-Scroller] → Fight 12 (Act Boss) → Story Beat

ACT 4 — BROWN BELT (Fights 13-16)
  Story Beat → [Side-Scroller] → Fight 13 → [Side-Scroller] → Fight 14 → 
  [Side-Scroller] → Fight 15 → [Side-Scroller] → Fight 16 (Act Boss) → Story Beat

ACT 5 — BLACK BELT (Fights 17-20)
  Story Beat → [Side-Scroller] → Fight 17 → [Side-Scroller] → Fight 18 → 
  [Side-Scroller] → Fight 19 → [Side-Scroller] → FINAL BOSS (Fight 20) → Ending
```

Each act has:
- 3 regular fights against generated opponents (using `generateOpponent`)
- 1 boss fight against a named roster character (escalating difficulty)
- Side-scroller segment between every fight (see Feature 3)
- Story dialogue before/after key fights (see Feature 4)

**Boss Assignments (suggested):**
- Act 1 Boss: Luta Duarte (the welcoming mentor figure who tests you)
- Act 2 Boss: Rusty Jones (the cocky rival who trash-talks)
- Act 3 Boss: Adele Fiorevar (the ice-cold technician — midpoint twist)
- Act 4 Boss: Mahmedov (the terrifying gatekeeper)
- Act 5 Final Boss: Darius "The Ghost" Okeke (the mysterious champion)

#### 2B. Campaign State Management

Add campaign state to the main component:
```javascript
const [campaignState, setCampaignState] = useState({
  active: false,
  act: 1,           // 1-5
  fightIndex: 0,    // 0-3 within act (0-2 = regular, 3 = boss)
  totalFights: 0,   // running total for overall progress
  playerChar: null,  // chosen at campaign start, locked for duration
  stamina: 100,     // carries over between fights (replenished by side-scroller pickups)
  momentum: 0,      // carries over
  wins: 0,
  losses: 0,        // campaign ends after 3 total losses
  maxLosses: 3,
  storyFlags: {},   // tracks which story beats have been seen
  scrollerScore: 0, // accumulated side-scroller score
  unlockedChars: [], // characters unlocked during campaign
});
```

#### 2C. Campaign Flow Screens

New screen states to add:
- `"campaign_select"` — Choose your campaign fighter (only unlocked chars)
- `"campaign_map"` — Visual progress map showing acts and current position
- `"campaign_story"` — Story dialogue display (see Feature 4)
- `"campaign_prefight"` — Opponent reveal with stats comparison
- `"campaign_scroller"` — Side-scroller minigame segment (see Feature 3)
- `"campaign_result"` — Post-fight result with campaign implications (lives remaining, story teaser)
- `"campaign_gameover"` — 3 losses = game over, offer restart
- `"campaign_victory"` — Campaign complete celebration

#### 2D. Campaign Map Screen
A visual representation of progress. Arcade-style with:
- 5 columns (one per act), each with 4 fight nodes and scroller segments between them
- Completed fights show a checkmark or character portrait
- Current fight pulses/glows
- Upcoming fights show silhouette/question mark
- Boss fights are visually larger/different
- Each act is labeled with its belt level
- Belt color theming (white → blue → purple → brown → black)

#### 2E. Difficulty Scaling
Campaign fights should get harder as you progress:

| Act | AI Accuracy | Defense Mod | Stamina Regen | Opponent Stat Range |
|-----|-------------|-------------|---------------|---------------------|
| 1 (White) | 0.45 | -0.1 | Full between fights | 3-6 per stat |
| 2 (Blue) | 0.55 | 0 | 80% carry-over | 5-7 per stat |
| 3 (Purple) | 0.62 | +0.05 | 70% carry-over | 6-8 per stat |
| 4 (Brown) | 0.70 | +0.1 | 60% carry-over | 7-9 per stat |
| 5 (Black) | 0.78 | +0.15 | 50% carry-over | 8-10 per stat |

Boss fights add +0.05 to AI accuracy and +0.05 to defense mod on top of their act level.

#### 2F. Title Screen Integration
Add a "CAMPAIGN" button to the title screen alongside the existing "Choose Fighter" button:
- The campaign button should be prominent and visually distinct (different color, maybe a shield/trophy icon)
- Below it, show campaign progress if a save exists ("Act 3 — Purple Belt • 11 wins")
- Include a "Continue" option if campaign is in progress and a "New Campaign" option

#### 2G. Between-Fight Mechanics
After each campaign fight:
- Stamina partially recovers (based on act scaling above)
- If the player won: momentum carries some residual bonus
- If the player lost: lose one life, stamina fully recovers (mercy mechanic), momentum resets
- Side-scroller performance affects stamina recovery (see Feature 3)
- Show a brief results card with stats before transitioning to the next side-scroller

---

## FEATURE 3 — SIDE-SCROLLER MARQUEE MINIGAME

### Goal
Build a fully-featured side-scrolling platformer/beat-em-up minigame that plays between every campaign fight. This is the **marquee minigame** — the other in-fight minigames are quick-time events, but this one is a real game-within-a-game. It should feel like a bonus stage from an arcade fighter (think Final Fight bonus rounds meets Temple Run meets the barrel-smashing stages from Street Fighter II).

### What To Build

#### 3A. Core Engine

A canvas-based (or DOM-based with absolute positioning) side-scroller that:
- Runs at 60fps on mobile
- Auto-scrolls left-to-right at increasing speed
- Uses the player's campaign character (rendered with their SVG/sprite)
- Has a ground plane, platforms at varying heights, and obstacles
- Touch controls: Tap left side to jump, tap right side to attack/interact. Swipe up = jump, swipe down = slide/duck
- Keyboard fallback: Space/Up = jump, X/Down = slide, Z = attack

#### 3B. Player Mechanics

- **Run:** Automatic, speed increases over time
- **Jump:** Single jump with variable height (hold longer = higher). Double jump unlocked in later acts
- **Slide/Duck:** Slides under low obstacles, brief invincibility window
- **Attack:** Punch forward — breaks destructible objects, defeats enemies on contact
- **Health:** 3 hits before knockout (hearts displayed top-left)
- **Stamina Bar:** Visual stamina meter that represents what you'll carry into the next fight

#### 3C. Collectibles & Campaign Integration

This is the key tie-in to the main game:

| Collectible | Visual | Effect |
|-------------|--------|--------|
| Acai Bowl | Purple bowl icon | Restores +10 stamina (carried to next fight) |
| Protein Shake | Shaker bottle | Restores +15 stamina |
| Belt Stripe | Small colored stripe | Score multiplier × 2 for 5 seconds |
| Gi Patch | Fabric square | +5 momentum bonus for next fight |
| Golden Pineapple | Pineapple (BJJ inside joke) | Rare — full stamina restore + bonus life in campaign |
| Tape Roll | Roll of finger tape | Restores 1 health heart |

Collectibles float with a gentle bob animation and sparkle effect. They're gathered by running through them.

#### 3D. Obstacles & Enemies

| Obstacle | Visual | Behavior |
|----------|--------|----------|
| Mat Stack | Stacked mats | Static — jump over |
| Hanging Gi | Gi on clothesline | Static at head height — slide under |
| Rolling Ball | Exercise ball | Bounces toward player — jump or slide |
| Foam Roller | Cylinder | Rolls along ground — jump over |
| Training Dummy | Standing dummy | Static — punch to destroy for bonus points, or jump over |
| Rival Fighter | Enemy character SVG | Walks toward player — must be punched (takes 1-2 hits). Deals 1 heart damage on contact |
| Professor | Authority figure | Appears as a roadblock — slide under (can't attack the professor! BJJ respect) |

In later acts, obstacles come faster, in tighter combinations, and enemy fighters appear more frequently and take more hits.

#### 3E. Environment Theming Per Act

| Act | Setting | Ground Color | Background |
|-----|---------|-------------|------------|
| 1 (White) | Local gym | Blue mat | Brick walls, motivational posters, mirrors |
| 2 (Blue) | Competition venue | Gray concrete | Bleachers, banners, crowd silhouettes |
| 3 (Purple) | Beach training | Sand/tan | Palm trees, ocean backdrop, sunset colors |
| 4 (Brown) | Mountain camp | Dark stone | Mountain silhouettes, training flags, fog |
| 5 (Black) | Grand arena | Black mat with gold trim | Spotlights, massive crowd, championship banners |

Backgrounds should use simple parallax scrolling (2-3 layers at different speeds) for depth. Keep it pixel-art styled — blocky shapes, limited color palette per layer.

#### 3F. Scoring & Results

At the end of each side-scroller segment:
- Display distance traveled, collectibles gathered, enemies defeated
- Calculate stamina bonus to carry into next fight
- Show brief results overlay before transitioning to pre-fight screen
- Total scroller score accumulates across the campaign for a final grade

#### 3G. Segment Length
Each side-scroller segment should last **20-40 seconds** — long enough to be engaging, short enough to not delay the main fighting game. Length increases slightly in later acts.

#### 3H. Fun Minigame Variants (Occasional)
Every 3-4 segments, mix in a variant to keep it fresh:
- **Dodge-only segment:** No attack, obstacles come rapid-fire (bonus stamina if no hits taken)
- **Destruction derby:** Tons of breakable objects, score attack
- **Boss chase:** A larger enemy chases you — pure speed, collect boost items to stay ahead
- **Downhill slide:** Gravity-assisted speed segment with ramps and gaps

#### 3I. Visual Style
- CPS2 pixel aesthetic to match the main game
- Character uses a simplified running sprite (can be a 2-3 frame SVG animation — arms/legs alternating)
- Parallax backgrounds with chunky pixel blocks
- Collectibles should be bright and pop against the background
- Screen shake on enemy defeats and when taking damage
- Dust particles when landing from jumps

---

## FEATURE 4 — CAMPAIGN STORYLINE

### Goal
Create a compelling, satirical BJJ culture storyline that progresses through the 5-act campaign. It starts light and funny with heavy pop culture humor, hooks the player with a mystery, gets progressively serious with twists and turns, and resolves with emotional weight.

### Story Structure

#### THE HOOK (Pre-Act 1)
The player's character arrives at **"Flow State BJJ"** — a trendy gym run by the legendary **Professor Cascão** (a revered old-school coral belt who everybody worships). During their first class, Professor Cascão demonstrates a technique, then suddenly collapses. In the chaos, his prized **"Livro Vermelho"** (Red Book) — a legendary notebook said to contain every secret technique in jiu-jitsu — goes missing from the gym's trophy case.

Cascão is rushed to hospital. He's stable but delirious, and keeps muttering: *"The book... the positions... it's all connected..."*

The gym's senior students immediately start pointing fingers at each other. Someone took the Red Book — and it happened right when all the competitors were gathered for the upcoming **LOCKDOWN Invitational** tournament.

**The player must fight their way through the tournament bracket to uncover who stole the Red Book and why.**

> *Mystery established: Who took the Red Book? Why? What's really in it?*

#### ACT 1 — WHITE BELT: "Welcome to the Mats" (Fights 1-4)

**Tone:** Light comedy, fish-out-of-water, BJJ culture jokes

**Story beats:**
- **Pre-Act:** You're the new white belt nobody takes seriously. The gym regulars are all suspicious of each other. Your training partner warns you: *"Just survive. Don't make eye contact with the purple belts."*
- **Between fights:** Characters comment on the drama. The gym's Instagram page is blowing up. Someone made a TikTok conspiracy theory video about the Red Book. A blue belt won't stop telling you about his "leg lock system" he learned from a YouTube instructional.
- **Mini-dialogues feature:** The obsessive acai bowl culture ("Bro, you HAVE to try the pitaya blend post-roll"), the guy who always wants to show you a "cool thing he saw on Instagram," the white belt who bought every Danaher DVD but can't do a basic shrimp escape.
- **Boss (Luta Duarte):** The gym's most respected upper belt. Warm but tests you hard. After the fight, win or lose, he says: *"You've got heart, kid. But heart doesn't find a book. Keep your eyes open — things at this gym aren't what they seem."*

> *Clue dropped: Luta hints that Professor Cascão's collapse wasn't natural. Someone may have tampered with his açaí bowl.*

#### ACT 2 — BLUE BELT: "Politics on the Mats" (Fights 5-8)

**Tone:** Sharper comedy, gym politics satire, rising stakes

**Story beats:**
- **Pre-Act:** You've earned some respect. The tournament bracket thickens. You start hearing whispers about gym alliances — **Team Flow** (the loyalists) vs **Team Grind** (a breakaway faction that wants to modernize). The stolen Red Book is becoming a symbol.
- **Between fights:** Gym politics escalate. Someone's been sandbagging at competitions. There's a debate about whether heel hooks should be allowed at white belt. A purple belt is running a cult-like "movement culture" program in the parking lot at 5am. Someone changed the Spotify playlist to nothing but Joe Rogan episodes and the whole gym is divided.
- **Rival introduction:** **Rusty Jones** appears — an obnoxious Australian who just transferred in. He claims he trained under a mysterious master in the outback. He's loud, he's flashy, and he keeps winning. He also seems suspiciously interested in the Red Book.
- **Boss (Rusty Jones):** Cocky pre-fight trash talk. After the fight, Rusty reveals he didn't steal the book but he knows who's looking for it: *"There's a buyer, mate. Someone outside the gym is offering serious coin for that book. I thought I'd find it first and sell it — but someone beat me to it."*

> *Twist: The book wasn't stolen by a student for personal use. There's an outside buyer. But who?*

#### ACT 3 — PURPLE BELT: "The Deep End" (Fights 9-12)

**Tone:** Transition from comedy to seriousness. Stakes are real now.

**Story beats:**
- **Pre-Act:** Professor Cascão is recovering but refusing visitors. The tournament is getting attention from big promotions — scouts are in the audience. The outside buyer is rumored to be **GrappleCorp**, a soulless MMA management company trying to monopolize technique instruction through an AI training app. If they get the Red Book, they'll digitize every secret and paywall it.
- **Between fights:** The comedy gets darker. A friend gets injured and nobody visits him. A promising student gets poached by GrappleCorp with a sponsorship deal. The gym's culture is fracturing. Your character starts to realize this isn't just about a book — it's about whether jiu-jitsu stays a community art or becomes a product.
- **Adele enters:** **Adele Fiorevar** has been quiet this whole time, training alone in the corner. She's ice-cold, says almost nothing, and is terrifyingly good. She seems to know more than she's letting on.
- **Boss (Adele Fiorevar):** The hardest fight so far. After the fight, Adele speaks for the first time: *"Cascão showed me the book once. It doesn't contain techniques. It contains names."*

> *Major reveal: The Red Book isn't a technique manual. It's a record — possibly of who Cascão trained, or something more dangerous. Names of what? Why does it matter?*

#### ACT 4 — BROWN BELT: "War" (Fights 13-16)

**Tone:** Serious. The comedy is gone. This is about loyalty and what jiu-jitsu means.

**Story beats:**
- **Pre-Act:** GrappleCorp makes their move. They try to buy out Flow State BJJ's lease. Several students defect for sponsorship money. The gym is half-empty. Your character is one of the few who stayed. Professor Cascão finally sends a message from recovery: *"The book names the lineage. Every student I ever promoted. Every person I trusted with my art. If they get the list, they'll buy them all out. Don't let them erase us."*
- **Between fights:** Former training partners are now on the other side. The atmosphere is tense. Fights feel personal. The remaining loyalists band together — Luta, the player, a few others. There's a scene where the old gym dog is still sleeping on the mats and someone says: *"At least Biscuit still believes in us."*
- **Mahmedov arrives:** **Mahmedov** is GrappleCorp's enforcer. He doesn't talk. He doesn't need to. He was brought in to eliminate the remaining competitors and secure the tournament.
- **Boss (Mahmedov):** The most physically punishing fight. Pure survival. After the fight, Mahmedov actually shows a sliver of respect: a nod. One of GrappleCorp's representatives drops a folder — inside is a partial photocopy of a page from the Red Book. The player recognizes a name on it: **Darius Okeke.**

> *Twist: Darius "The Ghost" Okeke, the mysterious champion nobody has ever seen train, is connected to the Red Book. Is he the one who stole it? Is he working for GrappleCorp? Or is he protecting it?*

#### ACT 5 — BLACK BELT: "The Lockdown" (Fights 17-20)

**Tone:** Climactic. Emotional. Resolution.

**Story beats:**
- **Pre-Act:** The LOCKDOWN Invitational final rounds. The gym is packed — everyone who left has come back to watch. GrappleCorp's CEO is in the front row. Professor Cascão arrives on crutches, sits mat-side. The energy is electric.
- **Between fights:** Cascão speaks to the player privately: *"I didn't collapse because someone poisoned me. I collapsed because I'm old, and I'm sick, and I was trying to hide it. The book... I gave it to someone for safekeeping. Someone I trusted to carry the lineage forward. I just couldn't remember who. The medicine clouded everything."*
- **Fight 19 (Semi-Final):** Against your toughest campaign opponent yet. The crowd is wild.
- **Pre-Final reveal:** Darius "The Ghost" Okeke appears. He's had the book the entire time. Cascão gave it to him years ago. Darius has been protecting it — moving gyms, staying anonymous, never competing publicly. He enters the tournament now because it's the only way to prove the lineage matters. He didn't steal it. He was its guardian.

> *Final twist: There was no theft. The "mystery" was a sick old man's fading memory and a community's paranoia. The real enemy was never a thief — it was the corporate attempt to commodify the art.*

- **FINAL BOSS (Darius "The Ghost" Okeke):** The best fight in the game. Darius is the complete fighter — every stat is high. The fight is respectful, not hostile. It's a test, not a war.
- **Ending:** Win or lose, Darius hands the Red Book back to Cascão. Cascão opens it, smiles, and writes one more name on the last page: **the player's name.** The gym erupts. GrappleCorp's CEO quietly leaves. The credits roll over a montage of the gym — people rolling, laughing, the dog sleeping on the mats, the player teaching a new white belt.

> *"Jiu-jitsu isn't in a book. It's in the hands that pass it on."*

### Story Delivery Format

Story beats are delivered through a simple **dialogue box system**:

```
┌─────────────────────────────────────────┐
│ [CHARACTER PORTRAIT]                     │
│                                          │
│ LUTA DUARTE                              │
│ "You've got heart, kid. But heart        │
│  doesn't find a book."                   │
│                                          │
│                          [TAP TO CONTINUE]│
└─────────────────────────────────────────┘
```

- Full-screen dark overlay with character name and SVG portrait on the left
- Text appears with a typewriter effect (character by character)
- Tap anywhere to advance (or speed up if mid-typewrite)
- Multiple dialogue boxes can chain together for conversations
- Occasionally include dialogue choices (2 options) that affect flavor text but not plot outcome

### Story Data Structure

```javascript
const CAMPAIGN_STORY = {
  "act1_intro": [
    { speaker: "narrator", text: "Flow State BJJ. The most respected gym in the city..." },
    { speaker: "partner", name: "Training Partner", text: "Just survive. Don't make eye contact with the purple belts." },
    // ...
  ],
  "act1_post_boss": [
    { speaker: "luta", name: "Luta Duarte", text: "You've got heart, kid..." },
    // ...
  ],
  // ... etc for each story beat
};
```

Each fight in the campaign has optional `preStory` and `postStory` keys pointing into this structure.

### Pop Culture & BJJ Culture References to Weave In

Use these naturally in dialogue and environmental details:
- The açaí obsession (mandatory post-training ritual)
- "Oss" used excessively and incorrectly
- The pineapple tradition (bringing a pineapple to your first class)
- The guy who's "been training for 6 months" and tries to teach white belts
- Heel hook debates and the Danaher Death Squad culture
- "Just stand up" as terrible advice
- Washing your belt superstition vs hygiene debates
- The purple belt who quit and came back 3 times
- Instagram highlight reels vs actual skill
- Gym creonte (traitor) culture around switching gyms
- "Flow rolling" that suspiciously looks like competition rolling
- The professor who always uses you for demonstrations and throws you extra hard
- Competitors who "don't care about winning" but clearly do
- Energy drink sponsors and supplement culture
- The open mat that's somehow more intense than competition

---

## IMPLEMENTATION ORDER

Build in this sequence to maintain a working game at each stage:

### Phase 1: Foundation (No visual dependencies)
1. Add the 4 missing characters to CHARS array (Adele, Rusty, Luta, Mahmedov)
2. Build the enhanced SVG character generator (Feature 1A)
3. Add pose-aware SVG fallback (Feature 1B)
4. Build the `generateOpponent()` function (Feature 1C)
5. Test: All 8 characters render distinctly, generated opponents look reasonable

### Phase 2: Campaign Shell
6. Add campaign state management (Feature 2B)
7. Add the title screen Campaign button (Feature 2F)
8. Build campaign_select screen
9. Build campaign_map screen
10. Build campaign_prefight screen
11. Wire up campaign fight → result → next fight loop
12. Build campaign_gameover and campaign_victory screens
13. Add difficulty scaling (Feature 2E)
14. Test: Full campaign is playable (without side-scroller or story, just fight sequences)

### Phase 3: Side-Scroller
15. Build the side-scroller engine core (Feature 3A, 3B)
16. Add collectibles and obstacles (Feature 3C, 3D)
17. Wire collectibles into campaign state (stamina carry-over)
18. Add environment theming per act (Feature 3E)
19. Add scoring/results overlay (Feature 3F)
20. Add minigame variants (Feature 3H)
21. Integrate side-scroller between campaign fights (Feature 2A flow)
22. Test: Full campaign loop with side-scroller segments working

### Phase 4: Story
23. Create the CAMPAIGN_STORY data structure with all dialogue (Feature 4)
24. Build the dialogue box UI component
25. Wire story beats into the campaign flow (pre/post fight triggers)
26. Add story flags and conditional dialogue
27. Polish typewriter effect and transitions
28. Test: Full campaign with story, side-scroller, and all fights

### Phase 5: Polish
29. Campaign progress save/load (localStorage)
30. Unlockable characters during campaign (beating bosses unlocks them for arcade mode)
31. Final balance pass on difficulty scaling
32. Mobile touch optimization pass
33. Performance check — ensure the file size stays manageable for Vercel

---

## TECHNICAL CONSTRAINTS

### Must Maintain
- **Single-file architecture** — everything in `lockdown.jsx`
- **React functional components with hooks** — no class components
- **Tailwind utility classes** for styling (already in use)
- **Howler.js** for audio (already loaded)
- **Mobile-first** — touch targets ≥ 44px, no hover-dependent interactions
- **`scaleX(-1)` facing convention** — all base sprites/SVGs face right
- **Existing screen flow** — the current title → select → fight → result flow for quick matches must remain fully functional alongside campaign mode

### Performance Budgets
- Side-scroller must maintain 60fps on iPhone SE (2020)
- Total JSX file should stay under 500KB if possible (currently ~215KB)
- No external image assets — all art is inline SVG, CSS, or base64 WebP
- Minimize DOM nodes in the side-scroller (prefer canvas or virtualized DOM)

### Things NOT To Touch
- The existing fight engine (minigames, submission system, position transitions, AI logic) — these work. Campaign just wraps around them.
- The existing SPRITE_DATA base64 WebP entries — these are real art assets, don't modify them
- The existing Howler.js audio setup — can add new sounds but don't restructure
- The `getSprite()` function's priority logic — WebP sprites always win over SVG fallback

### Save System
Use localStorage with a `ld-campaign-` prefix:
- `ld-campaign-state` — full campaign state object (JSON)
- `ld-campaign-progress` — lightweight progress for title screen display
- Existing `ld-streak` and `ld-record` should track campaign and arcade separately

---

*End of spec. Execute in phase order. Test at each phase boundary. Keep the game playable at every commit.*
