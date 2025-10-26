/**
 * Master Sound System
 * Centralized sound orchestration service for all Discovered Live! games
 *
 * Architecture:
 * - Singleton pattern (like aiPlayerPoolService and leaderboardService)
 * - Wraps SoundEffectsService for game-level sound orchestration
 * - Plug-and-play: minimal integration required in game components
 * - Automatic sound management based on game lifecycle events
 *
 * Usage:
 * ```typescript
 * import { masterSoundSystem } from '../../services/MasterSoundSystem';
 *
 * // Start background music when game session begins
 * masterSoundSystem.startGameSession('career-bingo');
 *
 * // Play feedback sounds during gameplay
 * masterSoundSystem.playCorrectAnswer();
 * masterSoundSystem.playIncorrectAnswer();
 * masterSoundSystem.playBingoCelebration();
 *
 * // Stop background music when game session ends
 * masterSoundSystem.endGameSession();
 * ```
 *
 * Features:
 * - Background music management (start/stop with fade)
 * - Answer feedback sounds (correct/incorrect)
 * - Timer warning sounds
 * - Celebration sounds (bingo, game complete)
 * - UI sounds (join, leave, click)
 * - Volume controls (master, music, SFX)
 * - Mute/unmute
 */

import { soundEffectsService } from './SoundEffectsService';

export type GameType = 'career-bingo' | 'ceo-takeover' | 'decision-desk' | 'career-challenge' | 'career-match';

interface GameSessionConfig {
  gameType: GameType;
  enableBackgroundMusic?: boolean;
  enableSFX?: boolean;
  fadeInDuration?: number; // ms
  fadeOutDuration?: number; // ms
}

class MasterSoundSystem {
  private static instance: MasterSoundSystem;
  private currentGameSession: GameSessionConfig | null = null;
  private isBackgroundMusicPlaying: boolean = false;

  private constructor() {
    console.log('🔊 Master Sound System initialized');
  }

  static getInstance(): MasterSoundSystem {
    if (!MasterSoundSystem.instance) {
      MasterSoundSystem.instance = new MasterSoundSystem();
    }
    return MasterSoundSystem.instance;
  }

  /**
   * Start a game session with background music and sound effects
   * Call this when a game starts (e.g., when player enters game room)
   *
   * @param gameType - Type of game being played
   * @param config - Optional configuration for sound behavior
   */
  async startGameSession(
    gameType: GameType,
    config?: Partial<GameSessionConfig>
  ): Promise<void> {
    const sessionConfig: GameSessionConfig = {
      gameType,
      enableBackgroundMusic: config?.enableBackgroundMusic ?? true,
      enableSFX: config?.enableSFX ?? true,
      fadeInDuration: config?.fadeInDuration ?? 2000,
      fadeOutDuration: config?.fadeOutDuration ?? 1000,
    };

    console.log(`🎮 [MasterSoundSystem] Starting ${gameType} session...`, sessionConfig);

    // Initialize sounds if not already loaded
    await this.preloadSounds();

    this.currentGameSession = sessionConfig;

    // Start background music if enabled
    if (sessionConfig.enableBackgroundMusic) {
      this.startBackgroundMusic(sessionConfig.fadeInDuration);
    }

    // Play game start sound if SFX enabled
    if (sessionConfig.enableSFX) {
      soundEffectsService.playGameStart();
    }
  }

  /**
   * End the current game session
   * Call this when a game ends or player leaves the game room
   */
  endGameSession(): void {
    if (!this.currentGameSession) {
      console.log('⚠️ [MasterSoundSystem] No active game session to end');
      return;
    }

    console.log(`🏁 [MasterSoundSystem] Ending ${this.currentGameSession.gameType} session...`);

    // Stop background music with fade out
    if (this.isBackgroundMusicPlaying) {
      this.stopBackgroundMusic(this.currentGameSession.fadeOutDuration);
    }

    this.currentGameSession = null;
  }

  // ============================================================
  // BACKGROUND MUSIC CONTROLS
  // ============================================================

  /**
   * Start background music (automatically called by startGameSession)
   * Can also be called manually for custom control
   */
  startBackgroundMusic(fadeInMs: number = 2000): void {
    if (this.isBackgroundMusicPlaying) {
      console.log('ℹ️ Background music already playing');
      return;
    }

    console.log('🎵 Starting background music...');
    soundEffectsService.startBackgroundMusic();
    this.isBackgroundMusicPlaying = true;
  }

  /**
   * Stop background music (automatically called by endGameSession)
   * Can also be called manually for custom control
   */
  stopBackgroundMusic(fadeOutMs: number = 1000): void {
    if (!this.isBackgroundMusicPlaying) {
      console.log('ℹ️ Background music not playing');
      return;
    }

    console.log('🎵 Stopping background music...');
    soundEffectsService.stopBackgroundMusic(fadeOutMs);
    this.isBackgroundMusicPlaying = false;
  }

  /**
   * Pause background music (useful for temporary interruptions)
   */
  pauseBackgroundMusic(): void {
    soundEffectsService.pauseBackgroundMusic();
    this.isBackgroundMusicPlaying = false;
  }

  /**
   * Resume background music (after pause)
   */
  resumeBackgroundMusic(): void {
    soundEffectsService.resumeBackgroundMusic();
    this.isBackgroundMusicPlaying = true;
  }

  // ============================================================
  // GAMEPLAY SOUND EFFECTS
  // ============================================================

  /**
   * Play correct answer feedback sound
   */
  playCorrectAnswer(): void {
    if (this.isSFXEnabled()) {
      soundEffectsService.playAnswerFeedback(true);
    }
  }

  /**
   * Play incorrect answer feedback sound
   */
  playIncorrectAnswer(): void {
    if (this.isSFXEnabled()) {
      soundEffectsService.playAnswerFeedback(false);
    }
  }

  /**
   * Play bingo celebration sound (Career Bingo specific)
   */
  playBingoCelebration(): void {
    if (this.isSFXEnabled()) {
      soundEffectsService.playBingoCelebration(1);
    }
  }

  /**
   * Play game completion sound (all games)
   */
  playGameComplete(): void {
    if (this.isSFXEnabled()) {
      soundEffectsService.playGameComplete();
    }
  }

  /**
   * Play question start sound
   */
  playQuestionStart(): void {
    if (this.isSFXEnabled()) {
      soundEffectsService.playQuestionStart();
    }
  }

  /**
   * Play countdown sound (3-2-1)
   */
  playCountdown(): void {
    if (this.isSFXEnabled()) {
      soundEffectsService.playCountdown();
    }
  }

  // ============================================================
  // TIMER SOUNDS
  // ============================================================

  /**
   * Play timer tick sound (for every second)
   */
  playTimerTick(): void {
    if (this.isSFXEnabled()) {
      soundEffectsService.playTimerSound(8); // Normal tick
    }
  }

  /**
   * Play timer warning sound (when time is running low)
   */
  playTimerWarning(): void {
    if (this.isSFXEnabled()) {
      soundEffectsService.playTimerSound(4); // Warning (4-5 seconds)
    }
  }

  /**
   * Play timer urgent sound (when time is almost up)
   */
  playTimerUrgent(): void {
    if (this.isSFXEnabled()) {
      soundEffectsService.playTimerSound(2); // Urgent (1-3 seconds)
    }
  }

  // ============================================================
  // UI SOUNDS
  // ============================================================

  /**
   * Play join room sound
   */
  playJoinRoom(): void {
    if (this.isSFXEnabled()) {
      soundEffectsService.playJoinRoom();
    }
  }

  /**
   * Play leave room sound
   */
  playLeaveRoom(): void {
    if (this.isSFXEnabled()) {
      soundEffectsService.playLeaveRoom();
    }
  }

  /**
   * Play click sound (UI interactions)
   */
  playClick(): void {
    if (this.isSFXEnabled()) {
      soundEffectsService.playClick();
    }
  }

  /**
   * Play spectator mode sound
   */
  playSpectatorMode(): void {
    if (this.isSFXEnabled()) {
      soundEffectsService.playSpectatorMode();
    }
  }

  // ============================================================
  // CAREER MATCH GAME SOUNDS
  // ============================================================

  /**
   * Play card flip sound (Career Match)
   */
  playCardFlip(): void {
    if (this.isSFXEnabled()) {
      soundEffectsService.playClick(); // Use click sound for card flip
    }
  }

  /**
   * Play match success sound (Career Match)
   */
  playMatchSuccess(): void {
    if (this.isSFXEnabled()) {
      soundEffectsService.playAnswerFeedback(true); // Use correct answer sound
    }
  }

  /**
   * Play card mismatch sound (Career Match)
   */
  playCardMismatch(): void {
    if (this.isSFXEnabled()) {
      soundEffectsService.playAnswerFeedback(false); // Use incorrect answer sound
    }
  }

  /**
   * Play turn change sound (Career Match)
   */
  playTurnChange(): void {
    if (this.isSFXEnabled()) {
      soundEffectsService.playClick(); // Use click sound for turn change
    }
  }

  // ============================================================
  // VOLUME CONTROLS
  // ============================================================

  /**
   * Set master volume (0.0 to 1.0)
   */
  setMasterVolume(volume: number): void {
    soundEffectsService.setMasterVolume(volume);
  }

  /**
   * Set music volume (0.0 to 1.0)
   */
  setMusicVolume(volume: number): void {
    soundEffectsService.setMusicVolume(volume);
  }

  /**
   * Set SFX volume (0.0 to 1.0)
   */
  setSFXVolume(volume: number): void {
    soundEffectsService.setSFXVolume(volume);
  }

  /**
   * Get master volume
   */
  getMasterVolume(): number {
    return soundEffectsService.getMasterVolume();
  }

  /**
   * Get music volume
   */
  getMusicVolume(): number {
    return soundEffectsService.getMusicVolume();
  }

  /**
   * Get SFX volume
   */
  getSFXVolume(): number {
    return soundEffectsService.getSFXVolume();
  }

  /**
   * Mute all sounds
   */
  mute(): void {
    soundEffectsService.mute();
  }

  /**
   * Unmute all sounds
   */
  unmute(): void {
    soundEffectsService.unmute();
  }

  /**
   * Check if sounds are muted
   */
  isMuted(): boolean {
    return soundEffectsService.isMuted();
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================

  /**
   * Check if SFX is enabled for current session
   */
  private isSFXEnabled(): boolean {
    return this.currentGameSession?.enableSFX ?? true;
  }

  /**
   * Check if background music is enabled for current session
   */
  private isMusicEnabled(): boolean {
    return this.currentGameSession?.enableBackgroundMusic ?? true;
  }

  /**
   * Get current game session info
   */
  getCurrentSession(): GameSessionConfig | null {
    return this.currentGameSession;
  }

  /**
   * Check if a game session is active
   */
  isSessionActive(): boolean {
    return this.currentGameSession !== null;
  }

  /**
   * Preload all sound assets (call early in app lifecycle)
   */
  async preloadSounds(): Promise<void> {
    console.log('🔊 Preloading sound assets...');
    await soundEffectsService.initialize();
  }

  /**
   * Get sound system status (for debugging)
   */
  getStatus(): {
    sessionActive: boolean;
    gameType: GameType | null;
    backgroundMusicPlaying: boolean;
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    muted: boolean;
  } {
    return {
      sessionActive: this.isSessionActive(),
      gameType: this.currentGameSession?.gameType ?? null,
      backgroundMusicPlaying: this.isBackgroundMusicPlaying,
      masterVolume: this.getMasterVolume(),
      musicVolume: this.getMusicVolume(),
      sfxVolume: this.getSFXVolume(),
      muted: this.isMuted(),
    };
  }
}

// Export singleton instance (following aiPlayerPoolService pattern)
export const masterSoundSystem = MasterSoundSystem.getInstance();

// Export class for type access if needed
export { MasterSoundSystem };
