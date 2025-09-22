/**
 * Companion Audio Service
 * Integrates audio cache with companion voiceover system
 * Plays pre-generated or cached audio for companion narration
 */

import { audioCacheService } from './cache/AudioCacheService';
import { MasterNarrative } from './narrative/MasterNarrativeGenerator';

interface AudioPlaybackOptions {
  volume?: number;
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

export class CompanionAudioService {
  private static instance: CompanionAudioService;
  private currentAudio: HTMLAudioElement | null = null;
  private audioQueue: Array<{ url: string; options?: AudioPlaybackOptions }> = [];
  private isPlaying: boolean = false;
  private currentCompanion: string = 'finn';
  private currentGradeLevel: string = '5';

  private constructor() {
    // Initialize service
  }

  static getInstance(): CompanionAudioService {
    if (!CompanionAudioService.instance) {
      CompanionAudioService.instance = new CompanionAudioService();
    }
    return CompanionAudioService.instance;
  }

  /**
   * Set current companion and grade level
   */
  setCompanionContext(companion: string, gradeLevel: string) {
    this.currentCompanion = companion.toLowerCase();
    this.currentGradeLevel = gradeLevel;
    console.log(`🎭 Companion audio context: ${companion} (Grade ${gradeLevel})`);
  }

  /**
   * Play Master Narrative audio sections
   */
  async playMasterNarrativeAudio(
    narrative: MasterNarrative,
    section: 'greeting' | 'introduction' | 'mission',
    options?: AudioPlaybackOptions
  ): Promise<void> {
    try {
      // Generate and cache audio if needed
      const audioUrls = await audioCacheService.generateNarrativeAudio(
        narrative,
        this.currentCompanion,
        this.currentGradeLevel
      );

      const audioUrl = audioUrls[section === 'mission' ? 'missionStatement' : section];

      if (audioUrl) {
        await this.playAudio(audioUrl, options);
      } else {
        console.warn(`No audio available for ${section}`);
        // Fallback to text-to-speech or visual display
        this.handleNoAudio(narrative, section, options);
      }

    } catch (error) {
      console.error(`Failed to play ${section} audio:`, error);
      options?.onError?.(error as Error);
    }
  }

  /**
   * Play cached audio by URL
   */
  private async playAudio(url: string, options?: AudioPlaybackOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Stop current audio if playing
        this.stopCurrent();

        // Create new audio element
        this.currentAudio = new Audio(url);
        this.currentAudio.volume = options?.volume ?? 0.8;
        this.currentAudio.playbackRate = options?.rate ?? 1.0;

        // Set up event handlers
        this.currentAudio.addEventListener('play', () => {
          this.isPlaying = true;
          options?.onStart?.();
          console.log('🔊 Audio playback started');
        });

        this.currentAudio.addEventListener('ended', () => {
          this.isPlaying = false;
          options?.onEnd?.();
          console.log('🔇 Audio playback ended');
          resolve();
          this.processQueue();
        });

        this.currentAudio.addEventListener('error', (e) => {
          this.isPlaying = false;
          const error = new Error(`Audio playback failed: ${e.type}`);
          console.error('❌ Audio error:', error);
          options?.onError?.(error);
          reject(error);
        });

        // Start playback
        this.currentAudio.play().catch(error => {
          console.error('Failed to start audio playback:', error);
          reject(error);
        });

      } catch (error) {
        console.error('Audio setup failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Queue audio for sequential playback
   */
  queueAudio(url: string, options?: AudioPlaybackOptions) {
    this.audioQueue.push({ url, options });

    if (!this.isPlaying) {
      this.processQueue();
    }
  }

  /**
   * Process audio queue
   */
  private async processQueue() {
    if (this.audioQueue.length === 0 || this.isPlaying) {
      return;
    }

    const next = this.audioQueue.shift();
    if (next) {
      await this.playAudio(next.url, next.options);
    }
  }

  /**
   * Stop current audio playback
   */
  stopCurrent() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      this.isPlaying = false;
    }
  }

  /**
   * Pause/resume playback
   */
  togglePlayback() {
    if (!this.currentAudio) return;

    if (this.currentAudio.paused) {
      this.currentAudio.play();
    } else {
      this.currentAudio.pause();
    }
  }

  /**
   * Clear audio queue
   */
  clearQueue() {
    this.audioQueue = [];
  }

  /**
   * Handle fallback when no audio available
   */
  private handleNoAudio(
    narrative: MasterNarrative,
    section: string,
    options?: AudioPlaybackOptions
  ) {
    // Get the text content
    let text = '';
    switch (section) {
      case 'greeting':
        text = narrative.greeting;
        break;
      case 'introduction':
        text = narrative.introduction;
        break;
      case 'mission':
        text = `As a future ${narrative.careerContext?.title}, you'll ${narrative.careerContext?.mission}`;
        break;
    }

    console.log(`📝 Text fallback for ${section}: "${text}"`);

    // Could integrate with browser's speech synthesis as fallback
    if ('speechSynthesis' in window && text) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options?.rate ?? 1.0;
      utterance.volume = options?.volume ?? 0.8;

      utterance.onstart = () => options?.onStart?.();
      utterance.onend = () => options?.onEnd?.();
      utterance.onerror = (e) => options?.onError?.(new Error(e.error));

      speechSynthesis.speak(utterance);
    }
  }

  /**
   * Preload audio for smoother playback
   */
  async preloadNarrativeAudio(narrative: MasterNarrative) {
    try {
      await audioCacheService.preloadAudio(
        narrative.narrativeId,
        this.currentCompanion
      );
      console.log('✅ Audio preloaded for narrative');
    } catch (error) {
      console.error('Failed to preload audio:', error);
    }
  }

  /**
   * Get audio cache statistics
   */
  getCacheStats() {
    return audioCacheService.getCacheStats();
  }

  /**
   * Clear audio cache
   */
  clearCache() {
    audioCacheService.clearCache();
    this.stopCurrent();
    this.clearQueue();
  }
}

// Export singleton instance
export const companionAudioService = CompanionAudioService.getInstance();