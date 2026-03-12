# LOCKDOWN — Project Status & Remaining Work

**Last Updated:** 24 Feb 2026
**Engine:** React JSX → Pre-compiled JS, single self-contained HTML file
**File:** `lockdown_game.html` (576 KB, opens in any browser)

---

## What's Built & Working

### Game Engine (lockdown_integrated.jsx → lockdown_game.html)
- React-based turn-by-turn BJJ grappling game
- 11 grappling positions: Standing, Clinch, Open Guard, Butterfly Guard, Closed Guard, Half Guard, Side Control, Turtle, Mount, Back Control, Scramble
- Move system with stamina costs, damage, position transitions
- 4 minigame types: Sequence, Power, Timing, Tap
- 4 characters: Marcus (unlocked), Yuki (unlocked), Darius (locked), Diego (locked)
- AI with 3 difficulty levels (White/Purple/Black Belt)
- Challenge system, XP, win/loss record
- CSS animations: CRT boot, position transitions, hit recoil, shake, celebrate
- Alt character palette swap via CSS filters

### Sprites (41 embedded as base64 WebP)
- Marcus: 20 sprites (idle, idle2, win, lose, hit, tired, effort, tapOut, clinch, guardTop, guardBtm, openGuardTop, halfGuardTop, mountTop, mountBtm, pressTop, pinned, turtleTop, backTop, backTaken)
- Yuki: 21 sprites (idle, win, lose, hit, tired, effort, tapOut, clinch, guardTop, guardBtm, openGuardBtm, halfGuardBtm, spiderGuard, mountTop, mountBtm, pressTop, pinned, turtleBtm, backTop, backTaken, triangle)
- Generated via K-means sprite separation from ChatGPT paired grappling art
- Reversed sprites available for when roles swap

### Audio (13 UI WAV sounds embedded as base64)
- ui_select, ui_navigate, ui_cancel
- timer_warning, round_bell, stamina_warning
- move_confirm, sub_attempt
- minigame_tick, minigame_fail
- xp_gain, challenge_complete, character_unlock
- Web Audio API synth engine for hit_light, hit_heavy, position_change, takedown, escape

### Music (3 of 9 tracks generated)
- menu-theme.mp3, fight-theme.mp3, low-stamina.mp3
- See SUNO_PROMPTS.md for remaining 6 tracks

### Supporting Assets
- 8 raw paired sprites (A1-A8) in raw_sprites/
- 82 separated sprite PNGs in separated/ (8 positions × ~10 files each)
- 32 reversed sprite PNGs for role-swapped positions
- Anchor manifest with contact point data for all positions
- 19 solo character sprites in sprites/solo/

---

## Known Issues (To Fix)

### 1. Sprite Backgrounds
**Problem:** Some sprites have transparent backgrounds (correct) while others have white backgrounds that look wrong against the dark arena.
**Fix needed:** Strip white backgrounds from all sprite PNGs, re-encode as base64 WebP with proper alpha channel. Need to audit all 41 embedded sprites.

### 2. Audio — Too Quiet/Dull
**Problem:** Current UI sounds are basic sine/square wave bleeps. Need much bigger impact sounds for major events.
**Fix needed:**
- Massive crash/slam SFX for tapouts, reversals, takedowns
- Layered synth impacts (not just single oscillator)
- Splash screen dramatic boot-up sound
- Crowd reactions for big moments
- Thud/mat impact for position changes

### 3. iPhone/Mobile Layout
**Problem:** Game is designed for desktop viewport. On iPhone there's scrolling and elements don't fit.
**Fix needed:**
- Full viewport lock (no scroll, 100vh/100vw)
- Touch-optimized button sizes (min 44px tap targets)
- Submenus or collapsible panels for move options
- Position map and move log moved to bottom
- Font size adjustments for small screens
- Safe area insets for notch phones
- Prevent zoom/pinch

### 4. Position Map Hard to Read
**Problem:** The position mindmap/diagram is cluttered and hard to understand on small screens.
**Fix needed:**
- Simplified visual — current position highlighted, adjacent positions shown
- Clearer arrows/connections
- Maybe a simple linear flow instead of a web
- Move to bottom of screen, collapsible

### 5. Move Log Position
**Problem:** Move log is in the middle of the screen, pushing content around.
**Fix needed:** Pin to bottom of screen, scrollable within fixed height, doesn't affect layout above.

### 6. Catchphrases Don't Stand Out
**Problem:** Character quotes/trash talk blend into the UI and are easy to miss.
**Fix needed:**
- Distinct font (maybe pixel/arcade style loaded from Google Fonts)
- Speech bubble or comic book style container
- Color coding per character
- Animated entrance (slide in, typewriter effect)
- Larger text with text shadow/glow

### 7. Difficulty Not Noticeable
**Problem:** White Belt, Purple Belt, and Black Belt feel similar.
**Fix needed:**
- White Belt: AI accuracy 0.30 (down from 0.40), slower reaction, more random moves
- Purple Belt: AI accuracy 0.55, balanced
- Black Belt: AI accuracy 0.90 (up from 0.82), always picks optimal move, punishes mistakes
- Visual indicator of AI difficulty during fight
- Different AI move selection strategy per difficulty (not just accuracy %)

### 8. D-Pad Minigame
**Problem:** Sequential button minigame uses text buttons that are hard to follow/tap.
**Fix needed:**
- Visual D-pad layout (up/down/left/right arranged as cross)
- Larger hit targets
- Arrow icons instead of text
- Visual feedback on correct/incorrect press
- Maybe haptic feedback on mobile

---

## Remaining Work (Priority Order)

### P0 — Must Fix
1. Fix sprite white backgrounds
2. iPhone-native layout (no scrolling)
3. D-pad minigame overhaul
4. Difficulty scaling fix

### P1 — Should Fix
5. Audio overhaul (bigger impacts, splash SFX)
6. Position map redesign
7. Move log to bottom
8. Catchphrase styling

### P2 — Music (User Generating via Suno)
9. Generate remaining 6 music tracks (see SUNO_PROMPTS.md)
10. Integrate music playback into game engine (per-screen tracks, crossfading)

### P3 — Polish
11. Character unlock system testing
12. Challenge system balancing
13. Animation smoothness pass
14. Performance optimization for mobile
15. Darius and Diego sprite generation

---

## File Structure

```
BJJ 16bit game/
├── lockdown_game.html          ← PLAY THIS (576 KB, self-contained)
├── lockdown_integrated.jsx     ← Source JSX (for editing)
├── lockdown (1).jsx            ← Original engine from dev
├── SUNO_PROMPTS.md             ← All 9 music prompts for Suno Pro
├── PROJECT_STATUS.md           ← This file
├── NEXT_STEPS.md               ← Original prompts doc
├── audio/
│   ├── music/                  ← Suno MP3 tracks (3 so far)
│   │   ├── fight-theme.mp3
│   │   ├── low-stamina.mp3
│   │   └── menu-theme.mp3
│   └── ui/                     ← 13 WAV UI sounds
├── raw_sprites/                ← 8 original ChatGPT paired images
├── separated/                  ← K-means separated sprites + anchors
│   ├── back_mount/
│   ├── closed_guard/
│   ├── half_guard/
│   ├── mount/
│   ├── open_guard/
│   ├── side_control/
│   ├── standing_clinch/
│   ├── turtle/
│   └── anchor_manifest.json
├── sprites/solo/               ← 19 individual character state sprites
└── scripts/                    ← Build tools
    ├── separate_sprites_v4.py
    ├── generate_reversed_sprites.py
    ├── audio-manager.js
    └── anchor_renderer.js
```

---

## How to Test on iPhone / Other Devices

The game is a single self-contained HTML file. To test on any device:

**Option A — Local Network (Recommended)**
1. On your computer, open a terminal in the game folder
2. Run: `python3 -m http.server 8080`
3. Find your computer's local IP (e.g., 192.168.1.x)
4. On iPhone Safari, go to: `http://192.168.1.x:8080/lockdown_game.html`
5. Both devices must be on the same WiFi network

**Option B — Upload to a Host**
1. Upload `lockdown_game.html` to any static host (GitHub Pages, Netlify, Vercel, etc.)
2. Open the URL on any device

**Option C — AirDrop / Transfer**
1. AirDrop `lockdown_game.html` to iPhone
2. Open in Safari from Files app
3. Note: Some CDN scripts need internet to load on first open

The game is 100% self-contained in one HTML file — no other files needed. All sprites and UI sounds are embedded as base64. Music tracks are the only external dependency (not yet integrated).
