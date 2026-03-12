# LOCKDOWN BJJ - Quick Start Guide

## Launch the Game (30 seconds)

1. **Open Browser**: Use Chrome, Firefox, or Edge
2. **Navigate to File**: Open the file `/BJJ 16bit game/index.html`
3. **Start Playing**: Press **Z** key on the title screen

## Game Controls Cheat Sheet

```
MENUS:
  ← → Keys   = Navigate left/right
  Z Key      = Confirm selection
  X Key      = Cancel

DURING MATCH:
  A Key      = Advance Position (move to better position)
  S Key      = Attempt Submission (mash Z to complete)
  D Key      = Defend (rest and reduce damage)
  F Key      = Escape Position (move away)

SUBMISSION MINIGAME:
  Z Key      = Mash rapidly to fill/drain progress bar
  X Key      = Cancel the submission
```

## Game Flow

1. **Title Screen** - Press Z to start
2. **Character Select** - Arrow keys to choose Marcus or Yuki, Z to confirm
3. **Match Screen** - Use A/S/D/F to select moves, manage stamina wisely
4. **Submission Minigame** (if triggered) - Mash Z to win the minigame
5. **Result Screen** - See who won, press Z to return to title

## What's on the Screen

```
┌─────────────────────────────────────────────────────────┐
│  [Your Name]        HP [====] ST [====]                 │
│                                                           │
│           POSITION: Closed Guard    Round 5             │
│                                                           │
│              [Sprite 1]  [Sprite 2]                      │
│              (top player) (bottom)                       │
│                                                           │
│  [A] Advance [S] Submit [D] Defend [F] Escape           │
└─────────────────────────────────────────────────────────┘
```

- **HP Bar** (green): Your health points
- **ST Bar** (yellow): Your stamina/energy
- **Position**: Current grappling position
- **Round**: Turn counter
- **Sprites**: Current position display

## Strategy Tips

1. **Manage Stamina**: You start with 100 stamina
   - Advance costs 25
   - Submit costs 30
   - Defend costs 15
   - Escape costs 20

2. **Watch Your Resources**: 
   - Stamina recovers +5 per turn naturally
   - Low stamina (below 20) limits your options

3. **Understand Positions**:
   - Top position = powerful offense
   - Bottom position = defensive escapes
   - Each has unique available moves

4. **Submission Strategy**:
   - When submitting: Mash Z to fill progress bar
   - When defending: Mash Z to drain progress bar
   - Winner takes 30 damage to loser

5. **Win Condition**: Reduce opponent to 0 health

## Example Match

**Turn 1**: You're in Standing Clinch
- Opponent is on top
- You have 100 HP, 100 ST
- Press A to Advance to Closed Guard (-25 ST)
- Opponent takes 5 damage

**Turn 2**: Now in Closed Guard, you're on top
- You have 100 HP, 80 ST (recovered +5)
- Opponent has 95 HP
- Press S to Attempt Submission (-30 ST)
- Minigame starts - mash Z to fill bar
- If successful: Opponent takes 30 damage (now 65 HP)

**Continue matching**: Take turns advancing, submitting, defending, and escaping until someone reaches 0 HP.

## Frequently Asked Questions

**Q: Where are the sound effects?**
A: Audio files are optional. The game plays perfectly fine without them. If you want sound, place .mp3 and .ogg files in the `audio/` folder.

**Q: Can I change the difficulty?**
A: Currently the AI uses basic random selection. The game difficulty is fixed at moderate level.

**Q: What if sprites don't load?**
A: The game will still run but won't display character images. Make sure the `separated/` and `sprites/solo/` folders exist with the PNG files.

**Q: How long is a match?**
A: Typically 5-15 turns depending on how aggressively both players fight.

**Q: Can I play multiplayer?**
A: Currently only single-player vs AI. You play as Player 1, the computer is Player 2.

## Technical Requirements

- Modern web browser (Chrome 90+, Firefox 88+, Edge 90+)
- HTML5 Canvas support
- JavaScript enabled
- Internet connection (to load Howler.js library from CDN)

## File Locations

All assets should be in the same folder as `index.html`:

```
/BJJ 16bit game/
├── index.html                    ← Open this file
├── scripts/
│   └── audio-manager.js          (auto-loaded)
├── separated/                    (position sprites)
│   ├── standing_clinch/
│   ├── closed_guard/
│   ├── open_guard/
│   ├── half_guard/
│   ├── side_control/
│   ├── mount/
│   ├── back_mount/
│   └── turtle/
├── sprites/solo/                 (menu/result sprites)
└── audio/                        (optional sounds)
```

## Troubleshooting

**Problem**: Game won't start
- Solution: Make sure you're opening `index.html` from the correct folder
- Solution: Try a different browser
- Solution: Clear browser cache (Ctrl+Shift+Del)

**Problem**: Sprites don't appear
- Solution: Check file paths are correct relative to index.html
- Solution: Make sure image files exist in the separated/ folder

**Problem**: Game is very slow
- Solution: Close other browser tabs
- Solution: Update your browser to latest version
- Solution: Disable browser extensions

**Problem**: Audio won't play
- Solution: Check audio files exist in the audio/ folder
- Solution: Check browser volume settings
- Solution: Try a different browser (some have audio restrictions)

## For More Details

- Read `README.md` for technical documentation
- Read `GAME_GUIDE.txt` for full game mechanics explanation
- Check code comments in `index.html` for implementation details

---

**Enjoy LOCKDOWN! Roll on the mat, master the positions, and claim victory!**
