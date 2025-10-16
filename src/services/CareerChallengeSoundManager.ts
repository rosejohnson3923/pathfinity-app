/**
 * Career Challenge Sound Manager
 * Handles all audio for the DLCC game including music and sound effects
 */

import { webAudioSynth } from './WebAudioSynthesizer';

export type SoundCategory = 'music' | 'sfx' | 'voice';
export type MusicTrack = 'menu' | 'lobby' | 'gameplay' | 'victory' | 'defeat';
export type SoundEffect =
  | 'buttonClick'
  | 'cardSelect'
  | 'cardPlace'
  | 'challengeSelect'
  | 'challengeSuccess'
  | 'challengeFail'
  | 'turnStart'
  | 'turnEnd'
  | 'timerWarning'
  | 'synergyActivate'
  | 'scoreIncrease'
  | 'playerJoin'
  | 'playerLeave'
  | 'gameStart'
  | 'victoryFanfare'
  | 'defeatSound'
  | 'notification'
  | 'achievement'
  | 'cardDraw'
  | 'cardFlip'
  | 'streakBonus'
  | 'perfectScore';

interface SoundConfig {
  url: string;
  volume: number;
  loop?: boolean;
  fadeIn?: number;
  fadeOut?: number;
}

interface AudioInstance {
  audio: HTMLAudioElement;
  category: SoundCategory;
  isPlaying: boolean;
  volume: number;
}

class CareerChallengeSoundManager {
  private static instance: CareerChallengeSoundManager;
  private audioContext: AudioContext | null = null;
  private masterVolume: number = 0.7;
  private musicVolume: number = 0.5;
  private sfxVolume: number = 0.8;
  private voiceVolume: number = 1.0;
  private isMuted: boolean = false;
  private currentMusic: AudioInstance | null = null;
  private soundPool: Map<string, AudioInstance[]> = new Map();
  private loadedSounds: Map<string, HTMLAudioElement> = new Map();
  private isInitialized: boolean = false;

  // Sound library configuration
  private readonly soundLibrary: Record<MusicTrack | SoundEffect, SoundConfig> = {
    // Music tracks
    menu: {
      url: '/sounds/music/menu-theme.mp3',
      volume: 0.6,
      loop: true,
      fadeIn: 2000,
      fadeOut: 1000
    },
    lobby: {
      url: '/sounds/music/lobby-ambient.mp3',
      volume: 0.5,
      loop: true,
      fadeIn: 1500,
      fadeOut: 1000
    },
    gameplay: {
      url: '/sounds/music/gameplay-energetic.mp3',
      volume: 0.4,
      loop: true,
      fadeIn: 1000,
      fadeOut: 500
    },
    victory: {
      url: '/sounds/music/victory-celebration.mp3',
      volume: 0.7,
      loop: false
    },
    defeat: {
      url: '/sounds/music/defeat-theme.mp3',
      volume: 0.5,
      loop: false
    },

    // Sound effects
    buttonClick: {
      url: '/sounds/sfx/button-click.wav',
      volume: 0.5
    },
    cardSelect: {
      url: '/sounds/sfx/card-select.wav',
      volume: 0.6
    },
    cardPlace: {
      url: '/sounds/sfx/card-place.wav',
      volume: 0.7
    },
    challengeSelect: {
      url: '/sounds/sfx/challenge-select.wav',
      volume: 0.6
    },
    challengeSuccess: {
      url: '/sounds/sfx/challenge-success.wav',
      volume: 0.8
    },
    challengeFail: {
      url: '/sounds/sfx/challenge-fail.wav',
      volume: 0.6
    },
    turnStart: {
      url: '/sounds/sfx/turn-start.wav',
      volume: 0.7
    },
    turnEnd: {
      url: '/sounds/sfx/turn-end.wav',
      volume: 0.5
    },
    timerWarning: {
      url: '/sounds/sfx/timer-warning.wav',
      volume: 0.8
    },
    synergyActivate: {
      url: '/sounds/sfx/synergy-activate.wav',
      volume: 0.9
    },
    scoreIncrease: {
      url: '/sounds/sfx/score-increase.wav',
      volume: 0.6
    },
    playerJoin: {
      url: '/sounds/sfx/player-join.wav',
      volume: 0.7
    },
    playerLeave: {
      url: '/sounds/sfx/player-leave.wav',
      volume: 0.5
    },
    gameStart: {
      url: '/sounds/sfx/game-start.wav',
      volume: 0.9
    },
    victoryFanfare: {
      url: '/sounds/sfx/victory-fanfare.wav',
      volume: 1.0
    },
    defeatSound: {
      url: '/sounds/sfx/defeat-sound.wav',
      volume: 0.6
    },
    notification: {
      url: '/sounds/sfx/notification.wav',
      volume: 0.4
    },
    achievement: {
      url: '/sounds/sfx/achievement.wav',
      volume: 0.8
    },
    cardDraw: {
      url: '/sounds/sfx/card-draw.wav',
      volume: 0.5
    },
    cardFlip: {
      url: '/sounds/sfx/card-flip.wav',
      volume: 0.4
    },
    streakBonus: {
      url: '/sounds/sfx/streak-bonus.wav',
      volume: 0.9
    },
    perfectScore: {
      url: '/sounds/sfx/perfect-score.wav',
      volume: 1.0
    }
  };

  private constructor() {
    // Don't initialize anything in constructor
    // Wait for explicit initialization
  }

  public static getInstance(): CareerChallengeSoundManager {
    if (!CareerChallengeSoundManager.instance) {
      CareerChallengeSoundManager.instance = new CareerChallengeSoundManager();
    }
    return CareerChallengeSoundManager.instance;
  }

  /**
   * Initialize the sound manager (should be called when entering the game)
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.initializeAudioContext();
    this.loadUserPreferences();
    // Skip preloading external files since we use Web Audio Synthesizer
    this.isInitialized = true;
  }

  /**
   * Initialize Web Audio API context
   */
  private initializeAudioContext(): void {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
    } catch (error) {
      console.warn('Web Audio API not supported, falling back to HTML5 Audio');
    }
  }

  /**
   * Load user preferences from localStorage
   */
  private loadUserPreferences(): void {
    const preferences = localStorage.getItem('dlcc_sound_preferences');
    if (preferences) {
      try {
        const prefs = JSON.parse(preferences);
        this.masterVolume = prefs.masterVolume ?? this.masterVolume;
        this.musicVolume = prefs.musicVolume ?? this.musicVolume;
        this.sfxVolume = prefs.sfxVolume ?? this.sfxVolume;
        this.voiceVolume = prefs.voiceVolume ?? this.voiceVolume;
        this.isMuted = prefs.isMuted ?? this.isMuted;
      } catch (error) {
        console.error('Failed to load sound preferences:', error);
      }
    }
  }

  /**
   * Save user preferences to localStorage
   */
  private saveUserPreferences(): void {
    const preferences = {
      masterVolume: this.masterVolume,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      voiceVolume: this.voiceVolume,
      isMuted: this.isMuted
    };
    localStorage.setItem('dlcc_sound_preferences', JSON.stringify(preferences));
  }

  /**
   * Preload critical sounds for instant playback
   * REMOVED: We use Web Audio Synthesizer instead of external files
   */
  private async preloadCriticalSounds(): Promise<void> {
    // No longer needed - using Web Audio Synthesizer
    return;
  }

  /**
   * Preload a specific sound
   * REMOVED: We use Web Audio Synthesizer instead of external files
   */
  private async preloadSound(soundId: MusicTrack | SoundEffect): Promise<void> {
    // No longer needed - using Web Audio Synthesizer
    return;
  }

  /**
   * Determine sound category
   */
  private getSoundCategory(soundId: MusicTrack | SoundEffect): SoundCategory {
    const musicTracks: MusicTrack[] = ['menu', 'lobby', 'gameplay', 'victory', 'defeat'];
    return musicTracks.includes(soundId as MusicTrack) ? 'music' : 'sfx';
  }

  /**
   * Get category-specific volume
   */
  private getCategoryVolume(category: SoundCategory): number {
    switch (category) {
      case 'music':
        return this.musicVolume;
      case 'sfx':
        return this.sfxVolume;
      case 'voice':
        return this.voiceVolume;
      default:
        return 1.0;
    }
  }

  /**
   * Calculate final volume
   */
  private calculateVolume(baseVolume: number, categoryVolume: number): number {
    return this.isMuted ? 0 : baseVolume * categoryVolume * this.masterVolume;
  }

  /**
   * Play a music track
   */
  public async playMusic(track: MusicTrack, crossfade: boolean = true): Promise<void> {
    // Ensure initialization
    if (!this.isInitialized) {
      await this.initialize();
    }

    // For now, we'll use the Web Audio Synthesizer for ambient music
    // In a real implementation, you'd want to create proper music loops
    try {
      if (this.currentMusic) {
        // Stop current music if any
        this.stopMusic(crossfade);
      }

      // Use Web Audio Synthesizer for ambient background
      if (track === 'menu' || track === 'lobby') {
        // Create ambient background sound
        const ambientMusic = webAudioSynth.playMenuAmbient(0.2);

        // Store reference (simplified for now)
        this.currentMusic = {
          audio: { stop: ambientMusic.stop } as any,
          category: 'music',
          isPlaying: true,
          volume: 0.2
        };
      }

      // For victory/defeat, just play the fanfare sounds
      if (track === 'victory') {
        webAudioSynth.playVictoryFanfare(0.8);
      } else if (track === 'defeat') {
        webAudioSynth.playChallengeFail(0.6);
      }
    } catch (error) {
      console.error(`Failed to play music: ${track}`, error);
    }
  }

  /**
   * Play a sound effect
   */
  public async playSFX(effect: SoundEffect, options?: { delay?: number; pitch?: number }): Promise<void> {
    if (this.isMuted) return;

    // Ensure initialization
    if (!this.isInitialized) {
      await this.initialize();
    }

    const playSound = async () => {
      try {
        // Use Web Audio Synthesizer to generate sounds dynamically
        const volume = this.calculateVolume(
          this.soundLibrary[effect]?.volume || 0.5,
          this.sfxVolume
        );

        switch (effect) {
          case 'buttonClick':
            webAudioSynth.playButtonClick(volume);
            break;
          case 'cardSelect':
          case 'cardFlip':
            webAudioSynth.playCardSelect(volume);
            break;
          case 'cardPlace':
          case 'cardDraw':
            webAudioSynth.playCardPlace(volume);
            break;
          case 'challengeSuccess':
          case 'perfectScore':
            webAudioSynth.playChallengeSuccess(volume);
            break;
          case 'challengeFail':
          case 'defeatSound':
            webAudioSynth.playChallengeFail(volume);
            break;
          case 'timerWarning':
            webAudioSynth.playTimerWarning(volume);
            break;
          case 'synergyActivate':
          case 'streakBonus':
            webAudioSynth.playSynergyActivate(volume);
            break;
          case 'scoreIncrease':
            webAudioSynth.playScoreIncrease(volume);
            break;
          case 'notification':
          case 'playerJoin':
          case 'playerLeave':
            webAudioSynth.playNotification(volume);
            break;
          case 'turnStart':
          case 'gameStart':
            webAudioSynth.playTurnStart(volume);
            break;
          case 'victoryFanfare':
            webAudioSynth.playVictoryFanfare(volume);
            break;
          case 'achievement':
            webAudioSynth.playSynergyActivate(volume * 1.2);
            break;
          default:
            // Fallback to button click for unmapped sounds
            webAudioSynth.playButtonClick(volume);
        }
      } catch (error) {
        console.warn(`Failed to play SFX: ${effect}`, error);
      }
    };

    if (options?.delay) {
      setTimeout(playSound, options.delay);
    } else {
      await playSound();
    }
  }

  /**
   * Play multiple sound effects in sequence
   */
  public async playSFXSequence(
    effects: Array<{ effect: SoundEffect; delay?: number; pitch?: number }>
  ): Promise<void> {
    for (const { effect, delay, pitch } of effects) {
      await this.playSFX(effect, { delay, pitch });
      if (delay) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Play a random sound from a pool
   */
  public async playRandomSFX(effects: SoundEffect[]): Promise<void> {
    if (effects.length === 0) return;
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    await this.playSFX(randomEffect);
  }

  /**
   * Stop current music
   */
  public stopMusic(fadeOut: boolean = true): void {
    if (!this.currentMusic) return;

    try {
      // For synthesizer-based music, call stop method
      if (this.currentMusic.audio && typeof this.currentMusic.audio.stop === 'function') {
        this.currentMusic.audio.stop();
      }
      this.currentMusic = null;
    } catch (error) {
      console.warn('Error stopping music:', error);
      this.currentMusic = null;
    }
  }

  /**
   * Fade in audio
   */
  private async fadeIn(audio: HTMLAudioElement, duration: number, targetVolume: number): Promise<void> {
    const steps = 30;
    const stepDuration = duration / steps;
    const volumeStep = targetVolume / steps;

    for (let i = 0; i <= steps; i++) {
      audio.volume = Math.min(volumeStep * i, 1);
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
  }

  /**
   * Fade out audio
   */
  private async fadeOut(audio: HTMLAudioElement, duration: number): Promise<void> {
    const steps = 30;
    const stepDuration = duration / steps;
    const startVolume = audio.volume;
    const volumeStep = startVolume / steps;

    for (let i = steps; i >= 0; i--) {
      audio.volume = Math.max(volumeStep * i, 0);
      await new Promise(resolve => setTimeout(resolve, stepDuration));
    }
  }

  /**
   * Set master volume
   */
  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
    this.saveUserPreferences();
  }

  /**
   * Set music volume
   */
  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) {
      this.currentMusic.audio.volume = this.calculateVolume(
        this.currentMusic.volume,
        this.musicVolume
      );
    }
    this.saveUserPreferences();
  }

  /**
   * Set SFX volume
   */
  public setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveUserPreferences();
  }

  /**
   * Toggle mute
   */
  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    this.updateAllVolumes();
    this.saveUserPreferences();
  }

  /**
   * Update all active audio volumes
   */
  private updateAllVolumes(): void {
    if (this.currentMusic) {
      this.currentMusic.audio.volume = this.calculateVolume(
        this.currentMusic.volume,
        this.musicVolume
      );
    }
  }

  /**
   * Get current volume settings
   */
  public getVolumeSettings() {
    return {
      masterVolume: this.masterVolume,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      voiceVolume: this.voiceVolume,
      isMuted: this.isMuted
    };
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    this.stopMusic(false);
    this.loadedSounds.clear();
    this.soundPool.clear();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Export a getter function instead of immediate instance
export const soundManager = CareerChallengeSoundManager.getInstance();

// Convenience functions for common operations (they'll auto-initialize when called)
export const playButtonClick = () => soundManager.playSFX('buttonClick');
export const playCardSelect = () => soundManager.playSFX('cardSelect');
export const playTurnStart = () => soundManager.playSFX('turnStart');
export const playVictory = () => {
  const manager = CareerChallengeSoundManager.getInstance();
  manager.playMusic('victory');
  manager.playSFX('victoryFanfare');
};
export const playDefeat = () => {
  const manager = CareerChallengeSoundManager.getInstance();
  manager.playMusic('defeat');
  manager.playSFX('defeatSound');
};