/**
 * LOCKDOWN — Audio Manager Module
 *
 * Central audio system using Howler.js for all game audio.
 * Manages 40+ sounds across 7 categories: UI, impacts, grapple, subs, vocal, crowd, music.
 *
 * Features:
 * - Sound caching and preloading
 * - Volume controls (master, SFX, music)
 * - Music crossfading
 * - Pitch variation for impacts (prevents repetitive feel)
 * - Mobile audio context resume
 * - Event-driven sound triggers
 *
 * Integration:
 *   <script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js"></script>
 *   <script src="audio-manager.js"></script>
 *   AudioManager.init();
 *   AudioManager.play('uiSelect');
 *   AudioManager.playMusic('menuTheme');
 */

const AudioManager = {
  sounds: {},
  music: {},
  currentMusic: null,
  currentMusicKey: null,

  // Volume levels
  sfxVolume: 0.7,
  musicVolume: 0.4,
  masterVolume: 1.0,
  muted: false,

  // Base path for audio files (adjust to match your project structure)
  basePath: 'audio/',

  /**
   * Initialize all audio. Call once on game startup.
   * Audio files that don't exist yet will silently fail to load.
   */
  init(basePath) {
    if (basePath) this.basePath = basePath;

    // ─── UI Sounds (JSFXR) ─────────────────────────────────
    this.loadSound('uiSelect',         'ui/ui-select.wav');
    this.loadSound('uiNavigate',       'ui/ui-navigate.wav');
    this.loadSound('uiCancel',         'ui/ui-cancel.wav');
    this.loadSound('timerWarning',     'ui/timer-warning.wav');
    this.loadSound('roundBell',        'ui/round-bell.wav');
    this.loadSound('staminaWarning',   'ui/stamina-warning.wav');
    this.loadSound('moveConfirm',      'ui/move-confirm.wav');
    this.loadSound('subAttempt',       'ui/sub-attempt.wav');
    this.loadSound('minigameTick',     'ui/minigame-tick.wav');
    this.loadSound('minigameFail',     'ui/minigame-fail.wav');
    this.loadSound('xpGain',           'ui/xp-gain.wav');
    this.loadSound('challengeComplete','ui/challenge-complete.wav');
    this.loadSound('characterUnlock',  'ui/character-unlock.wav');

    // ─── Body Impacts (ElevenLabs) ─────────────────────────
    this.loadSound('impactHeavy',    'impacts/impact-heavy.mp3');
    this.loadSound('impactLight',    'impacts/impact-light.mp3');
    this.loadSound('impactTakedown', 'impacts/impact-takedown.mp3');
    this.loadSound('impactSlam',     'impacts/impact-slam.mp3');

    // ─── Grappling Transitions ─────────────────────────────
    this.loadSound('scramble',    'grapple/transition-scramble.mp3');
    this.loadSound('weightShift', 'grapple/transition-shift.mp3');
    this.loadSound('gripTighten', 'grapple/grip-tighten.mp3');

    // ─── Submission Sounds ─────────────────────────────────
    this.loadSound('subCrank',    'subs/sub-crank.mp3');
    this.loadSound('tapOut',      'subs/tap-out.mp3');
    this.loadSound('chokeGasp',   'subs/choke-gasp.mp3');
    this.loadSound('strainExhale','subs/strain-exhale.mp3');

    // ─── Breathing / Vocals ────────────────────────────────
    this.loadSound('breathingIdle',  'vocal/breathing-idle.mp3');
    this.loadSound('breathingTired', 'vocal/breathing-tired.mp3');
    this.loadSound('gruntAttack',    'vocal/grunt-attack.mp3');
    this.loadSound('gruntPain',      'vocal/grunt-pain.mp3');

    // ─── Crowd ─────────────────────────────────────────────
    this.loadSound('crowdCheer',   'crowd/crowd-cheer.mp3');
    this.loadSound('crowdGasp',    'crowd/crowd-gasp.mp3');
    this.loadSound('crowdRoar',    'crowd/crowd-roar.mp3');
    this.loadSound('crowdAmbient', 'crowd/crowd-ambient.mp3');

    // ─── Music Tracks (Suno — OGG format) ──────────────────
    this.loadMusic('menuTheme',        'music/menu-theme.ogg',       true);
    this.loadMusic('charSelect',       'music/char-select.ogg',      true);
    this.loadMusic('fightTheme',       'music/fight-theme.ogg',      true);
    this.loadMusic('lowStamina',       'music/low-stamina.ogg',      true);
    this.loadMusic('subTension',       'music/sub-tension.ogg',      true);
    this.loadMusic('victoryFanfare',   'music/victory-fanfare.ogg',  false);
    this.loadMusic('defeatTheme',      'music/defeat-theme.ogg',     false);

    // Mobile audio fix
    this._setupMobileAudio();

    console.log('[AudioManager] Initialized with',
      Object.keys(this.sounds).length, 'SFX and',
      Object.keys(this.music).length, 'music tracks');
  },

  // ─── Loading ───────────────────────────────────────────────

  loadSound(key, path) {
    const fullPath = this.basePath + path;
    try {
      this.sounds[key] = new Howl({
        src: [fullPath],
        volume: this.sfxVolume * this.masterVolume,
        preload: true,
        onloaderror: () => {
          // Silent fail — file may not exist yet
          console.warn(`[Audio] Could not load: ${fullPath}`);
        }
      });
    } catch (e) {
      console.warn(`[Audio] Error loading ${key}:`, e);
    }
  },

  loadMusic(key, path, loop = true) {
    const fullPath = this.basePath + path;
    try {
      this.music[key] = new Howl({
        src: [fullPath],
        volume: this.musicVolume * this.masterVolume,
        loop: loop,
        preload: true,
        onloaderror: () => {
          console.warn(`[Audio] Could not load music: ${fullPath}`);
        }
      });
    } catch (e) {
      console.warn(`[Audio] Error loading music ${key}:`, e);
    }
  },

  // ─── SFX Playback ─────────────────────────────────────────

  /**
   * Play a sound effect by key.
   * @param {string} key - Sound key (e.g., 'uiSelect', 'impactHeavy')
   * @param {object} opts - Optional: { volume, rate, pitchVariation }
   */
  play(key, opts = {}) {
    if (this.muted) return;
    const sound = this.sounds[key];
    if (!sound) {
      console.warn(`[Audio] Unknown sound: ${key}`);
      return;
    }

    const volume = (opts.volume || 1.0) * this.sfxVolume * this.masterVolume;
    sound.volume(volume);

    // Pitch variation (great for impacts — prevents repetitive feel)
    if (opts.pitchVariation) {
      const variation = opts.pitchVariation;
      const rate = 1.0 + (Math.random() * variation * 2 - variation);
      sound.rate(rate);
    } else if (opts.rate) {
      sound.rate(opts.rate);
    }

    return sound.play();
  },

  /**
   * Play a random impact sound with pitch variation.
   * @param {string} type - 'heavy', 'light', 'takedown', 'slam'
   */
  playImpact(type = 'heavy') {
    const key = 'impact' + type.charAt(0).toUpperCase() + type.slice(1);
    return this.play(key, { pitchVariation: 0.15 });
  },

  /**
   * Play a transition sound (scramble, weight shift, grip).
   */
  playTransition() {
    const keys = ['scramble', 'weightShift', 'gripTighten'];
    const key = keys[Math.floor(Math.random() * keys.length)];
    return this.play(key, { pitchVariation: 0.1 });
  },

  /**
   * Play a grunt with slight pitch variation.
   * @param {string} type - 'attack' or 'pain'
   */
  playGrunt(type = 'attack') {
    const key = type === 'pain' ? 'gruntPain' : 'gruntAttack';
    return this.play(key, { pitchVariation: 0.2 });
  },

  // ─── Music Playback ───────────────────────────────────────

  /**
   * Play a music track with optional crossfade from current track.
   * @param {string} key - Music key (e.g., 'menuTheme', 'fightTheme')
   * @param {number} fadeMs - Crossfade duration in ms (default: 1000)
   */
  playMusic(key, fadeMs = 1000) {
    if (this.currentMusicKey === key) return; // Already playing

    const newTrack = this.music[key];
    if (!newTrack) {
      console.warn(`[Audio] Unknown music: ${key}`);
      return;
    }

    // Fade out current
    if (this.currentMusic) {
      const old = this.currentMusic;
      old.fade(old.volume(), 0, fadeMs);
      setTimeout(() => old.stop(), fadeMs);
    }

    // Fade in new
    const targetVol = this.musicVolume * this.masterVolume;
    newTrack.volume(0);
    newTrack.play();
    newTrack.fade(0, targetVol, fadeMs);

    this.currentMusic = newTrack;
    this.currentMusicKey = key;
  },

  /**
   * Stop current music with fade.
   */
  stopMusic(fadeMs = 500) {
    if (this.currentMusic) {
      const track = this.currentMusic;
      track.fade(track.volume(), 0, fadeMs);
      setTimeout(() => track.stop(), fadeMs);
      this.currentMusic = null;
      this.currentMusicKey = null;
    }
  },

  // ─── Volume Controls ──────────────────────────────────────

  setMasterVolume(vol) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    Howler.volume(this.masterVolume);
  },

  setSfxVolume(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  },

  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.currentMusic) {
      this.currentMusic.volume(this.musicVolume * this.masterVolume);
    }
  },

  toggleMute() {
    this.muted = !this.muted;
    Howler.mute(this.muted);
    return this.muted;
  },

  // ─── Game Event Triggers ──────────────────────────────────

  /**
   * Convenience methods that map game events to audio.
   * Wire these up to your game state machine.
   */

  // Menu events
  onMenuSelect()   { this.play('uiSelect'); },
  onMenuNavigate() { this.play('uiNavigate'); },
  onMenuBack()     { this.play('uiCancel'); },

  // Match events
  onMatchStart() {
    this.playMusic('fightTheme');
    this.play('roundBell');
  },

  onPositionChange() {
    this.playTransition();
    this.playImpact('light');
  },

  onTakedown() {
    this.playImpact('takedown');
    this.playGrunt('pain');
  },

  onSlam() {
    this.playImpact('slam');
    this.play('crowdGasp');
  },

  onStaminaLow() {
    this.play('staminaWarning');
    this.playMusic('lowStamina', 2000);
  },

  onStaminaRecovered() {
    this.playMusic('fightTheme', 2000);
  },

  // Submission events
  onSubmissionAttempt() {
    this.play('subAttempt');
    this.playMusic('subTension', 500);
  },

  onSubmissionCrank() {
    this.play('subCrank');
    this.play('strainExhale');
  },

  onSubmissionSuccess() {
    this.play('tapOut');
    this.play('crowdRoar');
    this.stopMusic(200);
  },

  onSubmissionEscape() {
    this.play('minigameTick');
    this.playMusic('fightTheme', 500);
  },

  // Minigame events
  onMinigameTick() { this.play('minigameTick'); },
  onMinigameFail() { this.play('minigameFail'); },

  // Round events
  onTimerWarning() { this.play('timerWarning'); },
  onRoundEnd()     { this.play('roundBell'); },

  // Result events
  onVictory() {
    this.stopMusic(200);
    this.playMusic('victoryFanfare', 0);
    this.play('crowdCheer');
  },

  onDefeat() {
    this.stopMusic(200);
    this.playMusic('defeatTheme', 0);
  },

  // Progression events
  onXpGain()           { this.play('xpGain'); },
  onChallengeComplete(){ this.play('challengeComplete'); },
  onCharacterUnlock()  { this.play('characterUnlock'); },

  // ─── Mobile Audio Fix ─────────────────────────────────────

  _setupMobileAudio() {
    const resume = () => {
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume();
      }
      document.removeEventListener('touchstart', resume);
      document.removeEventListener('click', resume);
    };
    document.addEventListener('touchstart', resume, { once: true });
    document.addEventListener('click', resume, { once: true });
  },

  // ─── Ambient Loops ────────────────────────────────────────

  /**
   * Start crowd ambient loop at low volume.
   */
  startCrowdAmbient() {
    const ambient = this.sounds['crowdAmbient'];
    if (ambient) {
      ambient.loop(true);
      ambient.volume(0.15 * this.sfxVolume * this.masterVolume);
      ambient.play();
    }
  },

  stopCrowdAmbient() {
    const ambient = this.sounds['crowdAmbient'];
    if (ambient) {
      ambient.fade(ambient.volume(), 0, 500);
      setTimeout(() => { ambient.stop(); ambient.loop(false); }, 500);
    }
  },

  /**
   * Start breathing loop based on stamina level.
   * @param {string} type - 'idle' or 'tired'
   */
  startBreathing(type = 'idle') {
    this.stopBreathing();
    const key = type === 'tired' ? 'breathingTired' : 'breathingIdle';
    const sound = this.sounds[key];
    if (sound) {
      sound.loop(true);
      sound.volume(0.3 * this.sfxVolume * this.masterVolume);
      sound.play();
      this._currentBreathing = key;
    }
  },

  stopBreathing() {
    if (this._currentBreathing) {
      const sound = this.sounds[this._currentBreathing];
      if (sound) { sound.stop(); sound.loop(false); }
      this._currentBreathing = null;
    }
  }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioManager;
}
