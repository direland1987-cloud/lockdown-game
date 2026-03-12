# LOCKDOWN — Audio Production Guide

A complete step-by-step walkthrough for creating all music and sound effects for the game.

---

## PHASE 1: UI & SYSTEM SOUNDS (JSFXR)

These are quick wins — crisp retro sounds for menus, notifications, and game state changes.

### Tool: JSFXR (https://sfxr.me)

Open the tool in your browser. For each sound below, click the category preset that's closest, then tweak the sliders. Export each as `.wav`.

### Sound List & Settings

**1. Menu Select / Button Click**
- Click "Pick Up / Coin" preset
- Shorten the sustain to ~0.05s
- Frequency: ~0.4
- Keep it short and snappy
- Export as `ui-select.wav`

**2. Menu Navigate / Hover**
- Click "Pick Up / Coin" preset
- Lower the frequency to ~0.3
- Very short sustain (~0.02s)
- Reduce volume slightly
- Export as `ui-navigate.wav`

**3. Menu Back / Cancel**
- Click "Hit / Hurt" preset
- Lower frequency, short duration
- Add slight frequency slide down
- Export as `ui-cancel.wav`

**4. Timer Warning Beep**
- Click "Laser / Shoot" preset
- Set to square wave
- High frequency (~0.7)
- Very short, sharp attack
- Export as `timer-warning.wav`

**5. Round Bell / Timer End**
- Click "Pick Up / Coin" preset
- Sine wave, higher frequency
- Longer sustain (~0.3s) with decay
- Export as `round-bell.wav`

**6. Stamina Depleted Warning**
- Click "Hit / Hurt" preset
- Low frequency pulse (~0.2)
- Add vibrato for urgency
- Export as `stamina-warning.wav`

**7. Move Locked In / Confirm**
- Click "Power Up" preset
- Shorten to ~0.15s
- Slight upward frequency slide
- Export as `move-confirm.wav`

**8. Submission Attempt Start**
- Click "Laser / Shoot" preset
- Descending frequency sweep
- Medium duration (~0.3s)
- Add slight distortion
- Export as `sub-attempt.wav`

**9. Minigame Tick / Input Success**
- Click "Pick Up / Coin" preset
- Very short blip (~0.02s)
- Clean sine or square wave
- Export as `minigame-tick.wav`

**10. Minigame Fail / Miss**
- Click "Hit / Hurt" preset
- Quick descending tone
- Slight noise mix
- Export as `minigame-fail.wav`

**11. XP / Points Gained**
- Click "Power Up" preset
- Ascending arpeggio feel
- Medium length (~0.2s)
- Export as `xp-gain.wav`

**12. Daily Challenge Complete**
- Click "Power Up" preset
- Longer ascending sweep (~0.4s)
- Bright, rewarding tone
- Export as `challenge-complete.wav`

**13. Character Unlock**
- Click "Power Up" preset
- Longest version (~0.6s)
- Multi-stage ascending with sustain
- Export as `character-unlock.wav`

---

## PHASE 2: GAMEPLAY IMPACT SFX

These need more weight and realism. We'll combine AI-generated sounds with free samples.

### Step 2A: AI-Generated SFX via ElevenLabs

Go to **https://elevenlabs.io/sound-effects** (free tier available).

Use these exact prompts — one at a time. Download each result. Generate 3-4 variations of each and keep the best one.

**Body Impacts:**

```
Prompt: "dull heavy body impact on padded mat, close-up, no reverb, punchy, dry recording"
Save as: impact-heavy.wav

Prompt: "light body thud on wrestling mat, quick, muffled, close mic"
Save as: impact-light.wav

Prompt: "two bodies colliding and hitting gym mat, wrestling takedown, close-up"
Save as: impact-takedown.wav

Prompt: "body slam on padded floor, medium impact, athletic, dry"
Save as: impact-slam.wav
```

**Grappling / Transitions:**

```
Prompt: "fabric rustling and sliding quickly, athletic clothing movement, close-up, short"
Save as: transition-scramble.wav

Prompt: "quick body weight shift on padded mat, single movement, close-up"
Save as: transition-shift.wav

Prompt: "tight fabric stretching and gripping, athletic compression clothing, close-up"
Save as: grip-tighten.wav
```

**Submissions:**

```
Prompt: "joint cracking and popping sound, single crack, dry, close-up"
Save as: sub-crank.wav

Prompt: "hand slapping padded mat twice rapidly, tap out signal, close-up"
Save as: tap-out.wav

Prompt: "strained choking gasp, single short breath, male, athletic"
Save as: choke-gasp.wav

Prompt: "heavy strained exhale through clenched teeth, male, exertion, close-up"
Save as: strain-exhale.wav
```

**Breathing / Exertion:**

```
Prompt: "calm rhythmic breathing, male athlete at rest, slow, close-up mic, loopable"
Save as: breathing-idle.wav

Prompt: "heavy labored breathing, exhausted male athlete, close-up, no background"
Save as: breathing-tired.wav

Prompt: "sharp aggressive exhale grunt, male martial artist, single burst, close-up"
Save as: grunt-attack.wav

Prompt: "pained grunt, male athlete, short, strained, close-up"
Save as: grunt-pain.wav
```

**Crowd:**

```
Prompt: "small indoor crowd cheering and clapping, martial arts tournament, medium energy"
Save as: crowd-cheer.wav

Prompt: "small indoor crowd gasping in surprise, quick reaction, martial arts event"
Save as: crowd-gasp.wav

Prompt: "indoor crowd roaring and going wild, big finish moment, martial arts tournament"
Save as: crowd-roar.wav

Prompt: "small indoor crowd ambient murmur, martial arts event, background atmosphere"
Save as: crowd-ambient.wav
```

### Step 2B: Alternative — Freesound.org

If ElevenLabs results aren't right, search Freesound for these terms. Filter by Creative Commons 0 (CC0) for no-attribution-needed licenses:

- `"body fall mat"` — mat impacts
- `"wrestling slam"` — heavier impacts
- `"fabric rustle short"` — transitions
- `"crowd cheer indoor small"` — crowd reactions
- `"male grunt exertion"` — effort sounds
- `"hand slap"` — tap out sounds
- `"knuckle crack"` — joint sounds
- `"breathing male exercise"` — breathing loops

### Step 2C: Processing the Raw Sounds

Use **Audacity** (free, https://www.audacityteam.org) for all processing.

For EVERY gameplay sound, apply this chain:

1. **Trim** — cut silence from start/end, keep only the core sound
2. **Normalize** — Effect > Normalize to -1dB (consistent volume)
3. **EQ** — boost low-mids (200-500Hz) for weight, cut highs above 8kHz for retro feel
4. **Bitcrush (optional, for retro feel)**:
   - Effect > Nyquist Prompt, paste: `(quantize s 128)`
   - Or use the "Bit Crusher" plugin
   - Light application — you want gritty, not destroyed
5. **Export** as WAV (16-bit, 44100Hz) and also as **OGG** (Quality 5) for web

### Naming Convention

All processed files go in a folder structure:
```
/audio
  /ui        — all JSFXR system sounds
  /impacts   — body hits, slams, takedowns
  /grapple   — transitions, grips, scrambles
  /subs      — submission-specific sounds
  /vocal     — breathing, grunts, gasps
  /crowd     — audience reactions
  /music     — all music tracks
```

---

## PHASE 3: MUSIC TRACKS

You need 5-6 tracks minimum. We'll use **Suno** (https://suno.com) as primary and **Udio** (https://www.udio.com) as backup.

### Track 1: Main Menu Theme

**Suno Prompt:**
```
Style: CPS2 arcade fighting game, 16-bit retro, FM synthesis
Tempo: 120 BPM
Mood: confident, anticipation, hype

A retro arcade fighting game main menu theme with FM synthesis leads,
punchy electronic drums, and a memorable melodic hook. Inspired by
Street Fighter II character select screen. Bold brass-like synth stabs,
driving beat, builds energy. Loopable. 90 seconds.
```

**Style tags to add in Suno's style field:**
```
retro game, arcade, 16-bit, fighting game, FM synthesis, chiptune, instrumental
```

**Generate 4-5 versions**, pick the best one. If none are great, try these variations:

Variation A — more aggressive:
```
Aggressive retro arcade fighting game theme, CPS2 style, fast FM synthesis
arpeggios, heavy electronic kick drum, distorted bass, intense energy,
tournament hype. 16-bit era sound. Loopable instrumental.
```

Variation B — more melodic:
```
Melodic retro fighting game menu music, nostalgic CPS2 arcade feel,
soaring FM synth melody over punchy drums, heroic and bold,
slight jazz fusion influence like Street Fighter II. Loopable instrumental.
```

### Track 2: Character Select Screen

**Suno Prompt:**
```
Upbeat retro arcade character select screen music, CPS2 16-bit style,
bouncy FM synthesis bass line, crisp electronic hi-hats, short melodic
loop that builds anticipation. Playful but competitive energy.
Loopable 60-second instrumental.
```

**Style tags:**
```
retro game, arcade, 16-bit, character select, FM synthesis, instrumental, loopable
```

### Track 3: In-Match Music (Main Fight Theme)

**Suno Prompt:**
```
Intense retro arcade fighting game battle music, CPS2 16-bit style,
driving tempo at 140 BPM, aggressive FM synthesis leads, pounding
electronic drums, tension-building progressions. Mix of martial arts
intensity with arcade energy. Think Street Fighter II Ryu stage.
Loopable 2-minute instrumental.
```

**Style tags:**
```
retro game, arcade, 16-bit, battle, fighting game, intense, FM synthesis, instrumental
```

**ALSO generate a low-stamina variant:**
```
Tense retro arcade fighting game music, slower tempo, ominous,
depleted energy feel, minor key, sparse FM synthesis, heartbeat-like
bass pulse, danger zone atmosphere. CPS2 16-bit style.
Loopable 90-second instrumental.
```

### Track 4: Submission Minigame Tension

**Suno Prompt:**
```
Suspenseful retro arcade game tension music, rising intensity,
CPS2 16-bit style, rapid FM synthesis arpeggios that accelerate,
ticking clock urgency, building to climax, dramatic. Short loopable
60-second instrumental.
```

**Style tags:**
```
retro game, arcade, tension, suspense, 16-bit, FM synthesis, urgent, instrumental
```

### Track 5: Victory Screen

**Suno Prompt:**
```
Triumphant retro arcade fighting game victory fanfare, CPS2 16-bit style,
celebratory FM synthesis brass hits, ascending melodic phrase,
crowd energy, short and punchy. 20-30 second non-looping jingle.
```

**Style tags:**
```
retro game, victory, fanfare, arcade, 16-bit, triumphant, FM synthesis, instrumental
```

### Track 6: Defeat Screen

**Suno Prompt:**
```
Somber retro arcade fighting game defeat music, CPS2 16-bit style,
descending melody, minor key, slow tempo, melancholic FM synthesis,
brief and dignified. 20-30 second non-looping jingle.
```

**Style tags:**
```
retro game, defeat, game over, arcade, 16-bit, melancholic, FM synthesis, instrumental
```

### Music Post-Processing

After downloading your favorite generations from Suno:

1. **In Audacity**, trim to clean loop points (for loopable tracks)
   - Zoom in to find zero-crossings at start and end
   - The waveform should cross zero at both cut points for a seamless loop
2. **Normalize** to -3dB (music sits slightly below SFX in mix)
3. **Optional retro processing:**
   - Low-pass filter at 12kHz to soften modern highs
   - Slight compression (ratio 3:1, threshold -12dB)
4. **Export** as OGG (Quality 6) for web — good balance of quality and file size
5. **Also export a WAV master** for archival

---

## PHASE 4: INTEGRATION INTO THE GAME

### Step 4A: Install Howler.js

Add to your HTML:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js"></script>
```

### Step 4B: Audio Manager Module

Create this as your central audio system:

```javascript
// audio-manager.js
const AudioManager = {
  sounds: {},
  music: {},
  currentMusic: null,
  sfxVolume: 0.7,
  musicVolume: 0.4,
  masterVolume: 1.0,
  muted: false,

  init() {
    // === UI SOUNDS ===
    this.loadSound('uiSelect', '/audio/ui/ui-select.wav');
    this.loadSound('uiNavigate', '/audio/ui/ui-navigate.wav');
    this.loadSound('uiCancel', '/audio/ui/ui-cancel.wav');
    this.loadSound('moveConfirm', '/audio/ui/move-confirm.wav');
    this.loadSound('timerWarning', '/audio/ui/timer-warning.wav');
    this.loadSound('roundBell', '/audio/ui/round-bell.wav');
    this.loadSound('staminaWarning', '/audio/ui/stamina-warning.wav');
    this.loadSound('subAttempt', '/audio/ui/sub-attempt.wav');
    this.loadSound('minigameTick', '/audio/ui/minigame-tick.wav');
    this.loadSound('minigameFail', '/audio/ui/minigame-fail.wav');
    this.loadSound('xpGain', '/audio/ui/xp-gain.wav');
    this.loadSound('challengeComplete', '/audio/ui/challenge-complete.wav');
    this.loadSound('characterUnlock', '/audio/ui/character-unlock.wav');

    // === IMPACT SOUNDS ===
    this.loadSound('impactHeavy', '/audio/impacts/impact-heavy.wav');
    this.loadSound('impactLight', '/audio/impacts/impact-light.wav');
    this.loadSound('impactTakedown', '/audio/impacts/impact-takedown.wav');
    this.loadSound('impactSlam', '/audio/impacts/impact-slam.wav');

    // === GRAPPLING ===
    this.loadSound('scramble', '/audio/grapple/transition-scramble.wav');
    this.loadSound('shift', '/audio/grapple/transition-shift.wav');
    this.loadSound('gripTighten', '/audio/grapple/grip-tighten.wav');

    // === SUBMISSIONS ===
    this.loadSound('subCrank', '/audio/subs/sub-crank.wav');
    this.loadSound('tapOut', '/audio/subs/tap-out.wav');
    this.loadSound('chokeGasp', '/audio/subs/choke-gasp.wav');
    this.loadSound('strainExhale', '/audio/subs/strain-exhale.wav');

    // === VOCAL ===
    this.loadSound('breathIdle', '/audio/vocal/breathing-idle.wav');
    this.loadSound('breathTired', '/audio/vocal/breathing-tired.wav');
    this.loadSound('gruntAttack', '/audio/vocal/grunt-attack.wav');
    this.loadSound('gruntPain', '/audio/vocal/grunt-pain.wav');

    // === CROWD ===
    this.loadSound('crowdCheer', '/audio/crowd/crowd-cheer.wav');
    this.loadSound('crowdGasp', '/audio/crowd/crowd-gasp.wav');
    this.loadSound('crowdRoar', '/audio/crowd/crowd-roar.wav');
    this.loadSound('crowdAmbient', '/audio/crowd/crowd-ambient.wav', true); // loop

    // === MUSIC ===
    this.loadMusic('menuTheme', '/audio/music/menu-theme.ogg');
    this.loadMusic('charSelect', '/audio/music/char-select.ogg');
    this.loadMusic('fightTheme', '/audio/music/fight-theme.ogg');
    this.loadMusic('fightTense', '/audio/music/fight-tense.ogg');
    this.loadMusic('subTension', '/audio/music/sub-tension.ogg');
    this.loadMusic('victory', '/audio/music/victory.ogg', false); // don't loop
    this.loadMusic('defeat', '/audio/music/defeat.ogg', false);
  },

  loadSound(key, src, loop = false) {
    this.sounds[key] = new Howl({
      src: [src],
      volume: this.sfxVolume * this.masterVolume,
      loop: loop,
      preload: true
    });
  },

  loadMusic(key, src, loop = true) {
    this.music[key] = new Howl({
      src: [src],
      volume: this.musicVolume * this.masterVolume,
      loop: loop,
      preload: true
    });
  },

  // Play a sound effect
  play(key, volumeMultiplier = 1.0) {
    if (this.muted || !this.sounds[key]) return;
    const id = this.sounds[key].play();
    if (volumeMultiplier !== 1.0) {
      this.sounds[key].volume(
        this.sfxVolume * this.masterVolume * volumeMultiplier, id
      );
    }
    return id;
  },

  // Play with random pitch variation (great for impacts)
  playVaried(key, pitchRange = 0.1) {
    if (this.muted || !this.sounds[key]) return;
    const rate = 1.0 + (Math.random() * pitchRange * 2 - pitchRange);
    const id = this.sounds[key].play();
    this.sounds[key].rate(rate, id);
    return id;
  },

  // Start music track with crossfade
  playMusic(key, fadeIn = 1000) {
    if (this.currentMusic === key) return;

    // Fade out current music
    if (this.currentMusic && this.music[this.currentMusic]) {
      const old = this.currentMusic;
      this.music[old].fade(
        this.music[old].volume(), 0, fadeIn
      );
      setTimeout(() => this.music[old].stop(), fadeIn);
    }

    // Fade in new music
    if (this.music[key]) {
      this.music[key].volume(0);
      this.music[key].play();
      this.music[key].fade(0, this.musicVolume * this.masterVolume, fadeIn);
      this.currentMusic = key;
    }
  },

  stopMusic(fadeOut = 500) {
    if (this.currentMusic && this.music[this.currentMusic]) {
      const key = this.currentMusic;
      this.music[key].fade(this.music[key].volume(), 0, fadeOut);
      setTimeout(() => this.music[key].stop(), fadeOut);
      this.currentMusic = null;
    }
  },

  // Volume controls
  setSfxVolume(vol) {
    this.sfxVolume = vol;
    Object.values(this.sounds).forEach(s =>
      s.volume(vol * this.masterVolume)
    );
  },

  setMusicVolume(vol) {
    this.musicVolume = vol;
    if (this.currentMusic && this.music[this.currentMusic]) {
      this.music[this.currentMusic].volume(vol * this.masterVolume);
    }
  },

  toggleMute() {
    this.muted = !this.muted;
    Howler.mute(this.muted);
    return this.muted;
  }
};
```

### Step 4C: Hook Into Game Events

Map audio triggers to your existing game events:

```javascript
// Example integration points in your game code:

// When player selects a move
function onMoveSelected(move) {
  AudioManager.play('moveConfirm');
  // ... existing move logic
}

// When a position transition happens
function onPositionChange(from, to, isScramble) {
  if (isScramble) {
    AudioManager.playVaried('scramble');
    AudioManager.playVaried('impactLight');
  } else {
    AudioManager.play('shift');
  }
  AudioManager.play('crowdCheer', 0.5);
}

// When a submission is attempted
function onSubmissionAttempt() {
  AudioManager.play('subAttempt');
  AudioManager.play('gripTighten');
  AudioManager.playMusic('subTension', 500);
}

// During submission minigame
function onMinigameInput(success) {
  if (success) {
    AudioManager.play('minigameTick');
  } else {
    AudioManager.play('minigameFail');
  }
}

// When submission succeeds
function onSubmissionFinish(type) {
  if (type === 'choke') {
    AudioManager.play('chokeGasp');
  } else {
    AudioManager.play('subCrank');
  }
  AudioManager.play('crowdRoar');
  AudioManager.play('tapOut');
}

// Stamina check each turn
function onStaminaUpdate(stamina, maxStamina) {
  const ratio = stamina / maxStamina;
  if (ratio < 0.2) {
    AudioManager.play('staminaWarning', 0.6);
    // Switch to tense music if not already
    AudioManager.playMusic('fightTense', 2000);
  }
}

// Match start
function onMatchStart() {
  AudioManager.play('roundBell');
  AudioManager.playMusic('fightTheme');
  // Start ambient crowd loop
  AudioManager.play('crowdAmbient');
}

// Match end
function onMatchEnd(winner) {
  AudioManager.sounds.crowdAmbient?.stop();
  if (winner === 'player') {
    AudioManager.play('crowdRoar');
    AudioManager.playMusic('victory', 300);
  } else {
    AudioManager.playMusic('defeat', 300);
  }
}

// Screen navigation
function onScreenChange(screen) {
  const musicMap = {
    'menu': 'menuTheme',
    'characterSelect': 'charSelect',
    'fight': null, // handled by onMatchStart
    'results': null  // handled by onMatchEnd
  };
  if (musicMap[screen]) {
    AudioManager.playMusic(musicMap[screen]);
  }
}
```

---

## PHASE 5: POLISH & TESTING CHECKLIST

### Audio Balance Testing
- [ ] Play through a full match — no sound should be jarring or too quiet
- [ ] Music shouldn't overpower SFX during gameplay
- [ ] UI sounds should be crisp and instant-feeling
- [ ] Crowd sounds should feel atmospheric, not distracting
- [ ] Submission sequences should feel dramatic

### Loop Testing
- [ ] Menu music loops seamlessly (no click or gap)
- [ ] Fight music loops seamlessly
- [ ] Crowd ambient loops seamlessly
- [ ] Breathing loops don't have audible repeat points

### Edge Cases
- [ ] Rapid button presses don't cause audio stacking/distortion
- [ ] Music transitions smoothly between screens
- [ ] Mute toggle works for everything
- [ ] Volume sliders affect appropriate channels
- [ ] Mobile browsers play audio (requires user interaction first)

### Mobile Audio Fix
Browsers require user interaction before playing audio. Add this:
```javascript
document.addEventListener('click', () => {
  if (Howler.ctx && Howler.ctx.state === 'suspended') {
    Howler.ctx.resume();
  }
}, { once: true });
```

### File Size Budget
Target total audio under **5MB** for reasonable load times:
- UI sounds: ~200KB total (small WAV files)
- Gameplay SFX: ~800KB total (short, compressed)
- Music: ~3-4MB total (OGG at quality 5-6)

Use OGG for music, WAV for short SFX (faster decode, no artifacts).

---

## QUICK REFERENCE: PRODUCTION ORDER

| Step | Task | Tool | Time Est. |
|------|------|------|-----------|
| 1 | Generate all 13 UI sounds | JSFXR | 30 min |
| 2 | Generate impact & body SFX | ElevenLabs | 45 min |
| 3 | Generate grappling SFX | ElevenLabs | 30 min |
| 4 | Generate submission SFX | ElevenLabs | 30 min |
| 5 | Generate vocal SFX | ElevenLabs | 30 min |
| 6 | Generate crowd SFX | ElevenLabs | 20 min |
| 7 | Process all SFX in Audacity | Audacity | 1 hr |
| 8 | Generate menu + select music | Suno | 30 min |
| 9 | Generate fight music (2 tracks) | Suno | 45 min |
| 10 | Generate sub tension music | Suno | 20 min |
| 11 | Generate victory/defeat jingles | Suno | 20 min |
| 12 | Process & loop music | Audacity | 45 min |
| 13 | Integrate AudioManager | Code | 1 hr |
| 14 | Hook up game events | Code | 2 hrs |
| 15 | Balance & test | Testing | 1 hr |

**Total estimated time: ~10 hours spread across sessions**
