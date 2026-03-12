# LOCKDOWN - 16-Bit BJJ Fighting Game

A comprehensive turn-based Brazilian Jiu-Jitsu fighting game built as a single HTML file with arcade-style aesthetics and gameplay.

## Quick Start

1. Open `index.html` in any modern web browser
2. Press **Z** to start from the title screen
3. Select your character (Marcus or Yuki) using arrow keys
4. Battle using keyboard actions: A (Advance), S (Submit), D (Defend), F (Escape)

## Game Features

### Complete Implementation

- **Single-File Architecture**: All game code, CSS, and HTML in one file (938 lines, 36KB)
- **Two Characters**: Marcus "The Bull" Reyes (power) vs Yuki "Spider" Tanaka (technique)
- **8 Grappling Positions**: Full positional graph with realistic BJJ transitions
- **Turn-Based Combat**: Strategic stamina-based action system
- **Submission Minigame**: Interactive mashing mechanics for submissions
- **Health & Stamina System**: Resource management for player decisions
- **AI Opponent**: Basic but functional AI with move variety
- **Full Audio Integration**: Howler.js integration for SFX and music (graceful degradation if files missing)

### Game States

```
TITLE_SCREEN → CHARACTER_SELECT → MATCH → MATCH_SUBMITTING/DEFENDING → RESULT → TITLE_SCREEN
```

### Grappling Positions (Full Graph)

```
Standing Clinch (starting)
├── Advance to: Closed Guard, Half Guard, Side Control
└── Escape to: (none)

Closed Guard
├── Advance to: Mount, Side Control
└── Escape to: Standing Clinch, Open Guard

Open Guard
├── Advance to: Closed Guard, Side Control
└── Escape to: Standing Clinch, Turtle

Half Guard
├── Advance to: Side Control, Mount
└── Escape to: Standing Clinch, Open Guard

Side Control
├── Advance to: Mount, Back Mount
└── Escape to: Half Guard, Closed Guard, Turtle

Mount
├── Advance to: Back Mount
└── Escape to: Side Control, Closed Guard

Back Mount
├── Advance to: (none)
└── Escape to: Mount, Turtle

Turtle
├── Advance to: Back Mount
└── Escape to: Open Guard, Half Guard
```

## Game Mechanics

### Stamina System
- **Starting**: 100 stamina points
- **Recovery**: +5 per turn naturally
- **Action Costs**:
  - Advance Position: 25 stamina
  - Attempt Submission: 30 stamina
  - Defend: 15 stamina
  - Escape Position: 20 stamina
- **Low Stamina Warning**: Below 20 points

### Health System
- **Starting**: 100 health points
- **Position Advance**: -5 damage
- **Submission Complete**: -30 damage
- **Win Condition**: Reduce opponent to 0 health

### Submission Minigame
When a submission is attempted:
- **Attacker**: Mash Z to fill progress bar (complete submission for 30 damage)
- **Defender**: Mash Z to drain progress bar (escape the submission)
- Both players see the same progress bar
- Can cancel with X key

## Controls

```
TITLE SCREEN:
  Z  → Start Game

CHARACTER SELECT:
  ← / → → Select character
  Z    → Confirm selection

MATCH:
  A → Advance Position
  S → Attempt Submission
  D → Defend
  F → Escape Position

SUBMISSION MINIGAME:
  Z → Mash to progress
  X → Cancel submission
```

## Visual Design

- **Resolution**: 960x640 pixels (16-bit arcade standard)
- **Font**: Press Start 2P (arcade-authentic)
- **Colors**: CPS2 arcade palette (gold #FFD700, red #FF4444, blue #4488FF)
- **Effects**:
  - CRT scanline overlay
  - Screen shake on impacts
  - Flash effects on transitions
  - Golden arcade cabinet border
- **Rendering**: Canvas-based, pixel-perfect (no smoothing)

## Audio System

### Integration
- Uses Howler.js library (CDN-loaded)
- Includes audio-manager.js for centralized audio control
- **Graceful Degradation**: Game remains fully playable if audio files are missing

### Sound Categories
- **UI Sounds**: Menu navigation, confirmations, warnings
- **Body Impacts**: Heavy/light hits, takedowns, slams
- **Grappling**: Transitions, scrambles, weight shifts
- **Submissions**: Cranks, taps, chokes, strain
- **Vocals**: Breathing, grunts, character expressions
- **Crowd**: Cheers, gasps, roars, ambient
- **Music**: Menu theme, character select, fight theme, victory/defeat

### Audio Calls
```javascript
AudioManager.play('uiSelect');           // UI action
AudioManager.playImpact('heavy');        // Position advance
AudioManager.playTransition();           // Position change
AudioManager.playGrunt('attack');        // Character action
AudioManager.playMusic('fightTheme');    // Background music
```

## File Structure

```
BJJ 16bit game/
├── index.html                 (Main game file - single HTML game)
├── GAME_GUIDE.txt            (User documentation)
├── README.md                 (This file)
├── scripts/
│   ├── audio-manager.js      (Audio system - loaded by index.html)
│   └── anchor_renderer.js    (Sprite alignment - not used directly)
├── separated/                (Grappling position sprites)
│   ├── standing_clinch/
│   ├── closed_guard/
│   ├── open_guard/
│   ├── half_guard/
│   ├── side_control/
│   ├── mount/
│   ├── back_mount/
│   └── turtle/
├── sprites/solo/             (Character menu/result sprites)
│   ├── B1_marcus_idle.png
│   ├── B2_yuki_idle.png
│   ├── B3_marcus_victory.png
│   ├── B4_yuki_victory.png
│   ├── B5_marcus_defeat.png
│   └── B6_yuki_defeat.png
└── audio/                    (Sound effects and music)
    ├── impacts/
    ├── grapple/
    ├── subs/
    ├── vocal/
    ├── crowd/
    ├── music/
    └── ui/
```

## Technical Implementation

### Canvas Rendering
```javascript
// 960x640 canvas, pixel-perfect scaling
ctx.imageSmoothingEnabled = false;  // Crisp pixel art
```

### Game Loop
```javascript
function gameLoop() {
    applyScreenShake();
    
    switch(gameState) {
        case GAME_STATES.TITLE_SCREEN:    drawTitleScreen();
        case GAME_STATES.CHARACTER_SELECT: drawCharacterSelect();
        case GAME_STATES.MATCH:           drawMatch();
        case GAME_STATES.MATCH_SUBMITTING: drawSubmissionMinigame();
        case GAME_STATES.RESULT:          drawResultScreen();
    }
    
    requestAnimationFrame(gameLoop);
}
```

### Sprite Loading
```javascript
async function loadSprites() {
    // Load solo sprites for menus/results
    spriteCache.marcus_idle = await loadImage('sprites/solo/B1_marcus_idle.png');
    spriteCache.yuki_idle = await loadImage('sprites/solo/B2_yuki_idle.png');
    // ... etc
    
    // Load position sprites (all 8 positions × 2 characters)
    for (const pos of Object.keys(POSITIONS)) {
        spriteCache[`${pos}_marcus`] = await loadImage(`separated/${pos}/${pos}_marcus.png`);
        spriteCache[`${pos}_yuki`] = await loadImage(`separated/${pos}/${pos}_yuki.png`);
    }
}
```

## Game Strategy

1. **Manage Stamina**: High-cost moves (Advance 25, Submit 30) require planning
2. **Position Matters**: Control positions are stronger but harder to achieve
3. **Submission Timing**: Submissions need both stamina AND successful minigame
4. **Mix Offense/Defense**: Variety prevents predictable opponent responses
5. **Health Awareness**: Monitor both your health and opponent's remaining health
6. **Recovery**: Don't spam moves - take defensive turns to recover stamina

## Browser Compatibility

- **Recommended**: Chrome 90+, Firefox 88+, Edge 90+
- **Minimum Requirements**: 
  - HTML5 Canvas support
  - ES6 JavaScript (arrow functions, template literals)
  - Howler.js compatible browser
  - Modern CSS Grid/Flexbox support

## Performance

- Single HTML file (36KB uncompressed)
- Efficient canvas rendering with requestAnimationFrame
- Sprite caching to avoid redundant loads
- Graceful audio loading with error handling
- No external dependencies except Howler.js (CDN)

## Known Limitations

- Audio files are optional (graceful fallback if missing)
- Music system ready but music files (.ogg) not included
- UI sounds optional (game fully playable without them)
- AI opponent uses basic random selection (not optimized)

## Future Enhancements

- Additional fighters (more character matchups)
- Career mode with progression
- Combo system and special moves
- Difficulty levels with smarter AI
- Online multiplayer support
- Achievements/unlockables system
- More detailed animation sequences

## Credits

- **Audio Library**: Howler.js (2.2.4)
- **Font**: Press Start 2P (Google Fonts)
- **Art Style**: 16-bit CPS2 Arcade inspired
- **Game Design**: Turn-based BJJ mechanics

## License

This is a fan-created game project. Use for educational and entertainment purposes.

---

**LOCKDOWN - Because the mat never lies.**
