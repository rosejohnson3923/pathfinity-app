/**
 * Sound Effects Service
 * Manages game sounds for Discovered Live! multiplayer
 *
 * Features:
 * - Timer countdown sounds
 * - Answer feedback (correct/incorrect)
 * - Bingo celebration sounds
 * - Background music (optional)
 * - Volume control
 * - Mute/unmute
 * - Preloading for performance
 */

type SoundType =
  | 'timer_tick'
  | 'timer_warning'
  | 'timer_urgent'
  | 'answer_correct'
  | 'answer_incorrect'
  | 'bingo_achieved'
  | 'game_start'
  | 'game_complete'
  | 'question_start'
  | 'countdown_321'
  | 'click'
  | 'join_room'
  | 'leave_room'
  | 'spectator_mode'
  | 'background_music';

interface SoundConfig {
  volume: number; // 0.0 - 1.0
  loop: boolean;
  fadeIn?: number; // milliseconds
  fadeOut?: number; // milliseconds
}

interface SoundAsset {
  audio: HTMLAudioElement;
  config: SoundConfig;
  isLoaded: boolean;
}

class SoundEffectsService {
  private static instance: SoundEffectsService;
  private sounds: Map<SoundType, SoundAsset> = new Map();
  private masterVolume: number = 0.7;
  private isMuted: boolean = false;
  private musicVolume: number = 0.3;
  private sfxVolume: number = 0.7;
  private currentMusic: HTMLAudioElement | null = null;
  private fadeIntervals: Map<SoundType, NodeJS.Timeout> = new Map();

  // Sound URLs (can be replaced with actual asset paths)
  private soundUrls: Record<SoundType, string> = {
    timer_tick: '/sounds/timer-tick.mp3',
    timer_warning: '/sounds/timer-warning.mp3',
    timer_urgent: '/sounds/timer-urgent.mp3',
    answer_correct: '/sounds/correct.mp3',
    answer_incorrect: '/sounds/incorrect.mp3',
    bingo_achieved: '/sounds/bingo.mp3',
    game_start: '/sounds/game-start.mp3',
    game_complete: '/sounds/game-complete.mp3',
    question_start: '/sounds/question-start.mp3',
    countdown_321: '/sounds/countdown.mp3',
    click: '/sounds/click.mp3',
    join_room: '/sounds/join.mp3',
    leave_room: '/sounds/leave.mp3',
    spectator_mode: '/sounds/spectator.mp3',
    background_music: '/sounds/background-music.mp3',
  };

  private constructor() {
    this.loadUserPreferences();
  }

  static getInstance(): SoundEffectsService {
    if (!SoundEffectsService.instance) {
      SoundEffectsService.instance = new SoundEffectsService();
    }
    return SoundEffectsService.instance;
  }

  // ================================================================
  // INITIALIZATION
  // ================================================================

  /**
   * Initialize and preload all sound effects
   */
  async initialize(): Promise<void> {
    console.log('🔊 Initializing sound effects...');

    try {
      // Preload critical sounds first
      const criticalSounds: SoundType[] = [
        'timer_tick',
        'timer_warning',
        'timer_urgent',
        'answer_correct',
        'answer_incorrect',
      ];

      for (const soundType of criticalSounds) {
        await this.loadSound(soundType);
      }

      // Preload other sounds in background
      const otherSounds = Object.keys(this.soundUrls).filter(
        s => !criticalSounds.includes(s as SoundType)
      ) as SoundType[];

      Promise.all(otherSounds.map(s => this.loadSound(s)));

      console.log('✅ Sound effects initialized');
    } catch (error) {
      console.warn('⚠️ Failed to initialize some sounds:', error);
    }
  }

  /**
   * Load a single sound
   */
  private async loadSound(soundType: SoundType): Promise<void> {
    if (this.sounds.has(soundType)) {
      return; // Already loaded
    }

    try {
      const audio = new Audio(this.soundUrls[soundType]);
      audio.preload = 'auto';

      // Default configurations
      const config: SoundConfig = {
        volume: soundType === 'background_music' ? this.musicVolume : this.sfxVolume,
        loop: soundType === 'background_music',
      };

      await new Promise<void>((resolve, reject) => {
        audio.addEventListener('canplaythrough', () => resolve(), { once: true });
        audio.addEventListener('error', reject, { once: true });
        audio.load();
      });

      this.sounds.set(soundType, {
        audio,
        config,
        isLoaded: true,
      });

      console.log(`✅ Loaded sound: ${soundType}`);
    } catch (error) {
      console.warn(`⚠️ Failed to load sound: ${soundType}`, error);

      // Create silent fallback
      this.sounds.set(soundType, {
        audio: new Audio(),
        config: { volume: 0, loop: false },
        isLoaded: false,
      });
    }
  }

  // ================================================================
  // PLAYBACK
  // ================================================================

  /**
   * Play a sound effect
   */
  play(soundType: SoundType, options?: Partial<SoundConfig>): void {
    if (this.isMuted) return;

    const soundAsset = this.sounds.get(soundType);
    if (!soundAsset || !soundAsset.isLoaded) {
      console.warn(`Sound not loaded: ${soundType}`);
      return;
    }

    try {
      const audio = soundAsset.audio.cloneNode(true) as HTMLAudioElement;
      const config = { ...soundAsset.config, ...options };

      audio.volume = config.volume * this.masterVolume;
      audio.loop = config.loop;

      if (config.fadeIn) {
        this.fadeIn(audio, config.fadeIn);
      }

      audio.play().catch(err => {
        console.warn(`Failed to play sound: ${soundType}`, err);
      });

      // Auto cleanup for non-looping sounds
      if (!config.loop) {
        audio.addEventListener('ended', () => {
          audio.remove();
        });
      }
    } catch (error) {
      console.warn(`Error playing sound: ${soundType}`, error);
    }
  }

  /**
   * Stop a specific sound type
   */
  stop(soundType: SoundType): void {
    const soundAsset = this.sounds.get(soundType);
    if (soundAsset) {
      soundAsset.audio.pause();
      soundAsset.audio.currentTime = 0;
    }
  }

  /**
   * Stop all sounds
   */
  stopAll(): void {
    this.sounds.forEach(soundAsset => {
      soundAsset.audio.pause();
      soundAsset.audio.currentTime = 0;
    });
  }

  // ================================================================
  // GAME-SPECIFIC SOUNDS
  // ================================================================

  /**
   * Play timer tick (based on remaining time)
   */
  playTimerSound(timeRemaining: number): void {
    if (timeRemaining <= 3 && timeRemaining > 0) {
      this.play('timer_urgent', { volume: 0.8 });
    } else if (timeRemaining <= 5 && timeRemaining > 3) {
      this.play('timer_warning', { volume: 0.6 });
    } else if (timeRemaining <= 10) {
      this.play('timer_tick', { volume: 0.4 });
    }
  }

  /**
   * Play answer feedback sound
   */
  playAnswerFeedback(isCorrect: boolean, isFast: boolean = false): void {
    if (isCorrect) {
      this.play('answer_correct', {
        volume: isFast ? 0.9 : 0.7,
      });
    } else {
      this.play('answer_incorrect', { volume: 0.6 });
    }
  }

  /**
   * Play bingo celebration sound
   */
  playBingoCelebration(bingoNumber: number): void {
    // More excitement for first bingo
    const volume = bingoNumber === 1 ? 1.0 : 0.8;
    this.play('bingo_achieved', { volume });
  }

  /**
   * Play game start sound
   */
  playGameStart(): void {
    this.play('game_start', { volume: 0.7 });
  }

  /**
   * Play game complete sound
   */
  playGameComplete(): void {
    this.play('game_complete', { volume: 0.7 });
  }

  /**
   * Play question start sound
   */
  playQuestionStart(): void {
    this.play('question_start', { volume: 0.5 });
  }

  /**
   * Play countdown sound (3, 2, 1...)
   */
  playCountdown(): void {
    this.play('countdown_321', { volume: 0.7 });
  }

  /**
   * Play click sound
   */
  playClick(): void {
    this.play('click', { volume: 0.3 });
  }

  /**
   * Play room join sound
   */
  playJoinRoom(): void {
    this.play('join_room', { volume: 0.6 });
  }

  /**
   * Play room leave sound
   */
  playLeaveRoom(): void {
    this.play('leave_room', { volume: 0.6 });
  }

  /**
   * Play spectator mode sound
   */
  playSpectatorMode(): void {
    this.play('spectator_mode', { volume: 0.5 });
  }

  // ================================================================
  // BACKGROUND MUSIC
  // ================================================================

  /**
   * Start background music
   */
  startBackgroundMusic(): void {
    if (this.currentMusic) return;

    const musicAsset = this.sounds.get('background_music');
    if (!musicAsset || !musicAsset.isLoaded) return;

    try {
      const audio = musicAsset.audio;
      audio.volume = this.musicVolume * this.masterVolume;
      audio.loop = true;

      audio.play().catch(err => {
        console.warn('Failed to start background music:', err);
      });

      this.currentMusic = audio;
    } catch (error) {
      console.warn('Error starting background music:', error);
    }
  }

  /**
   * Stop background music
   */
  stopBackgroundMusic(fadeOutMs: number = 1000): void {
    if (!this.currentMusic) return;

    if (fadeOutMs > 0) {
      this.fadeOut(this.currentMusic, fadeOutMs, () => {
        if (this.currentMusic) {
          this.currentMusic.pause();
          this.currentMusic.currentTime = 0;
          this.currentMusic = null;
        }
      });
    } else {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
      this.currentMusic = null;
    }
  }

  // ================================================================
  // VOLUME CONTROL
  // ================================================================

  /**
   * Set master volume (0.0 - 1.0)
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.saveUserPreferences();

    // Update current music volume
    if (this.currentMusic) {
      this.currentMusic.volume = this.musicVolume * this.masterVolume;
    }
  }

  /**
   * Set music volume (0.0 - 1.0)
   */
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.saveUserPreferences();

    if (this.currentMusic) {
      this.currentMusic.volume = this.musicVolume * this.masterVolume;
    }
  }

  /**
   * Set SFX volume (0.0 - 1.0)
   */
  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveUserPreferences();
  }

  /**
   * Get current volumes
   */
  getVolumes(): { master: number; music: number; sfx: number } {
    return {
      master: this.masterVolume,
      music: this.musicVolume,
      sfx: this.sfxVolume,
    };
  }

  // ================================================================
  // MUTE/UNMUTE
  // ================================================================

  /**
   * Mute all sounds
   */
  mute(): void {
    this.isMuted = true;
    this.stopAll();
    this.saveUserPreferences();
  }

  /**
   * Unmute all sounds
   */
  unmute(): void {
    this.isMuted = false;
    this.saveUserPreferences();
  }

  /**
   * Toggle mute
   */
  toggleMute(): void {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  /**
   * Check if muted
   */
  isSoundMuted(): boolean {
    return this.isMuted;
  }

  // ================================================================
  // FADE EFFECTS
  // ================================================================

  /**
   * Fade in audio
   */
  private fadeIn(audio: HTMLAudioElement, durationMs: number): void {
    const targetVolume = audio.volume;
    audio.volume = 0;

    const steps = 20;
    const stepDuration = durationMs / steps;
    const volumeStep = targetVolume / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      audio.volume = Math.min(targetVolume, audio.volume + volumeStep);

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);
  }

  /**
   * Fade out audio
   */
  private fadeOut(
    audio: HTMLAudioElement,
    durationMs: number,
    onComplete?: () => void
  ): void {
    const startVolume = audio.volume;
    const steps = 20;
    const stepDuration = durationMs / steps;
    const volumeStep = startVolume / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      audio.volume = Math.max(0, audio.volume - volumeStep);

      if (currentStep >= steps) {
        clearInterval(interval);
        onComplete?.();
      }
    }, stepDuration);
  }

  // ================================================================
  // USER PREFERENCES
  // ================================================================

  /**
   * Save user preferences to localStorage
   */
  private saveUserPreferences(): void {
    try {
      localStorage.setItem(
        'discoveredLive_soundPreferences',
        JSON.stringify({
          masterVolume: this.masterVolume,
          musicVolume: this.musicVolume,
          sfxVolume: this.sfxVolume,
          isMuted: this.isMuted,
        })
      );
    } catch (error) {
      console.warn('Failed to save sound preferences:', error);
    }
  }

  /**
   * Load user preferences from localStorage
   */
  private loadUserPreferences(): void {
    try {
      const saved = localStorage.getItem('discoveredLive_soundPreferences');
      if (saved) {
        const prefs = JSON.parse(saved);
        this.masterVolume = prefs.masterVolume ?? 0.7;
        this.musicVolume = prefs.musicVolume ?? 0.3;
        this.sfxVolume = prefs.sfxVolume ?? 0.7;
        this.isMuted = prefs.isMuted ?? false;
      }
    } catch (error) {
      console.warn('Failed to load sound preferences:', error);
    }
  }

  // ================================================================
  // UTILITY
  // ================================================================

  /**
   * Check if sounds are supported
   */
  isSupported(): boolean {
    return typeof Audio !== 'undefined';
  }

  /**
   * Get loading status
   */
  getLoadingStatus(): {
    total: number;
    loaded: number;
    percentage: number;
  } {
    const total = this.sounds.size;
    const loaded = Array.from(this.sounds.values()).filter(s => s.isLoaded).length;
    return {
      total,
      loaded,
      percentage: total > 0 ? (loaded / total) * 100 : 0,
    };
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    this.stopAll();
    this.sounds.clear();
    this.fadeIntervals.clear();
  }
}

export const soundEffectsService = SoundEffectsService.getInstance();
