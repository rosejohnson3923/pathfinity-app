/**
 * Companion Voiceover Service
 * Manages AI companion voice narration throughout the learning experience
 */

import { audioService } from './audioService';

interface VoiceoverScript {
  screen: string;
  companion: string;
  context?: any;
  message: string;
}

class CompanionVoiceoverService {
  private static instance: CompanionVoiceoverService;
  private currentCompanion: string | null = null;
  private isEnabled: boolean = true;
  private autoPlayQueue: VoiceoverScript[] = [];
  private isPlaying: boolean = false;
  private pendingTimeouts: Set<NodeJS.Timeout> = new Set();
  private isStopped: boolean = false;

  private constructor() {
    // Load user preferences
    const savedPreference = localStorage.getItem('pathfinity-voiceover-enabled');
    this.isEnabled = savedPreference !== 'false';
  }

  static getInstance(): CompanionVoiceoverService {
    if (!CompanionVoiceoverService.instance) {
      CompanionVoiceoverService.instance = new CompanionVoiceoverService();
    }
    return CompanionVoiceoverService.instance;
  }

  /**
   * Set the current companion
   */
  setCompanion(companionId: string): void {
    this.currentCompanion = companionId;
  }

  /**
   * Enable or disable voiceover
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    localStorage.setItem('pathfinity-voiceover-enabled', enabled.toString());
    
    if (!enabled) {
      this.stopCurrent();
    }
  }

  /**
   * Get companion-specific scripts for different screens
   */
  private getCompanionScript(screen: string, companion: string, context?: any): string {
    const scripts: { [key: string]: { [companion: string]: string } } = {
      'dashboard-welcome': {
        finn: `Welcome back! I'm excited to learn with you today. Let's start by choosing your career adventure for the day!`,
        sage: `Welcome, young scholar. Today's journey awaits. Begin by selecting the career path that calls to your curiosity.`,
        spark: `Hey superstar! Ready for an awesome day of learning? Pick a super cool career to explore!`,
        harmony: `Hello dear friend. I'm here with you today. Let's begin gently by choosing a career that interests you.`
      },
      'career-selected': {
        finn: `Great choice! Being a ${context?.career || 'professional'} is amazing! Now let's pick your AI companion for today's adventure.`,
        sage: `An excellent selection. The path of ${context?.career || 'discovery'} holds many lessons. Choose your guide wisely.`,
        spark: `Wow, ${context?.career || 'that career'} is so cool! Now pick your learning buddy - who's going to join you today?`,
        harmony: `What a wonderful choice. ${context?.career || 'This path'} will bring many opportunities to grow. Select your companion for support.`
      },
      'companion-selected': {
        finn: `Thank you for choosing me! I'll be here every step of the way. Let's see what exciting things we'll learn today!`,
        sage: `I am honored to guide you. Together, we shall uncover the wisdom within today's lessons.`,
        spark: `Yes! This is going to be AMAZING! Let's make learning the best adventure ever!`,
        harmony: `Thank you for trusting me. We'll take this journey at your pace, celebrating every step forward.`
      },
      'lobby-welcome': {
        finn: `Welcome to Career, Inc.! Ready to begin your ${context?.career || 'professional'} workday? I'm here as your workplace buddy. Let's start with today's tasks - click the purple Start Learn button to begin!`,
        sage: `Welcome to Career, Inc. Your ${context?.career || 'professional'} workday awaits. As your mentor, I'll guide you through today's objectives. Begin when ready.`,
        spark: `Welcome to Career, Inc.! Time for an awesome ${context?.career || 'professional'} workday! I'm your energetic coworker - let's make work FUN! Hit that purple Start Learn button!`,
        harmony: `Welcome to Career, Inc. Let's begin your ${context?.career || 'professional'} workday together. I'm here to support you every step of the way. Start when you're comfortable.`
      },
      'activity-start': {
        finn: `Let's dive into ${context?.activity || 'this activity'}! Remember, we'll take it step by step.`,
        sage: `Begin with curiosity. ${context?.activity || 'This exercise'} will reveal its secrets through patient exploration.`,
        spark: `Here we go! ${context?.activity || 'This'} is going to be super fun! Let's do this!`,
        harmony: `Let's begin ${context?.activity || 'this activity'} together. Remember, there's no rush - we move at your comfort.`
      },
      'encouragement': {
        finn: `You're doing great! Keep going - I believe in you!`,
        sage: `Excellent progress. Each challenge conquered adds to your wisdom.`,
        spark: `You're a superstar! This is awesome - keep it up!`,
        harmony: `You're doing wonderfully. Every effort you make is valuable.`
      },
      'completion': {
        finn: `Fantastic job! You did it! I'm so proud of what you accomplished today!`,
        sage: `Well done. You've gained valuable knowledge that will serve you well.`,
        spark: `AMAZING! You totally rocked it! That was incredible!`,
        harmony: `Beautiful work. You should feel proud of all you've achieved today.`
      },
      'container-locked': {
        finn: `Oops! This container is locked. You need to complete ${context?.requiredContainer || 'the previous container'} first to unlock it!`,
        sage: `Patience, young scholar. Complete ${context?.requiredContainer || 'the prerequisite'} to reveal this knowledge.`,
        spark: `Not yet! First finish ${context?.requiredContainer || 'the other one'} - then this super cool stuff unlocks!`,
        harmony: `This will be available soon. Let's complete ${context?.requiredContainer || 'what comes before'} first, one step at a time.`
      },
      'next-container': {
        finn: `Awesome job on ${context?.completed}! Now let's tackle ${context?.next} - click the Start button to continue!`,
        sage: `Well done with ${context?.completed}. The path to ${context?.next} now lies open before you.`,
        spark: `You crushed ${context?.completed}! ${context?.next} is unlocked and ready - let's go!`,
        harmony: `Beautiful work on ${context?.completed}. When you're ready, ${context?.next} awaits your exploration.`
      },
      'all-complete': {
        finn: `Incredible! You've completed all three learning containers! You're officially a ${context?.career || 'professional'} superstar!`,
        sage: `Remarkable. You have traversed all three paths of knowledge. Your journey as a ${context?.career || 'scholar'} is complete.`,
        spark: `OH WOW! You did EVERYTHING! All three containers done - you're the ultimate ${context?.career || 'champion'}!`,
        harmony: `What an achievement! All three containers completed. You've grown so much as a ${context?.career || 'learner'} today.`
      }
    };

    return scripts[screen]?.[companion] || this.getDefaultMessage(companion);
  }

  /**
   * Get default message for companion
   */
  private getDefaultMessage(companion: string): string {
    const defaults: { [key: string]: string } = {
      finn: `Let's keep learning together!`,
      sage: `Continue your journey of discovery.`,
      spark: `This is so exciting! Let's go!`,
      harmony: `You're doing wonderfully. Keep going.`
    };
    return defaults[companion] || 'Let\'s continue learning!';
  }

  /**
   * Play voiceover for specific screen/context
   */
  async playVoiceover(
    screen: string, 
    context?: any,
    options?: {
      delay?: number;
      priority?: 'high' | 'normal' | 'low';
      onComplete?: () => void;
    }
  ): Promise<void> {
    if (!this.isEnabled || !this.currentCompanion) {
      options?.onComplete?.();
      return;
    }

    const message = this.getCompanionScript(screen, this.currentCompanion, context);
    
    // Reset stopped flag
    this.isStopped = false;
    
    // Add delay if specified
    if (options?.delay) {
      await new Promise<void>(resolve => {
        const timeoutId = setTimeout(() => {
          this.pendingTimeouts.delete(timeoutId);
          resolve();
        }, options.delay);
        this.pendingTimeouts.add(timeoutId);
      });
      
      // Check if stopped during delay
      if (this.isStopped) {
        options?.onComplete?.();
        return;
      }
    }

    // If high priority, stop current and play immediately
    if (options?.priority === 'high') {
      this.stopCurrent();
    }

    // Queue or play
    if (this.isPlaying && options?.priority !== 'high') {
      this.autoPlayQueue.push({
        screen,
        companion: this.currentCompanion,
        context,
        message
      });
    } else {
      await this.playMessage(message, options?.onComplete);
    }
  }

  /**
   * Play a specific message
   */
  private async playMessage(message: string, onComplete?: () => void): Promise<void> {
    this.isPlaying = true;

    // Import voiceManagerService for proper companion voice handling
    try {
      const { voiceManagerService } = await import('./voiceManagerService');
      
      // Use voiceManagerService which has proper voice mapping for companions
      // This ensures Harmony uses a female voice, Finn uses a young voice, etc.
      await voiceManagerService.generateAndSpeak(
        this.currentCompanion || 'finn',
        message,
        'K' // Default grade, should be passed in context ideally
      );
      
      this.isPlaying = false;
      onComplete?.();
      this.processQueue();
    } catch (error) {
      console.error('Failed to play companion voiceover via voiceManagerService:', error);
      
      // Fallback to basic speech synthesis if voiceManagerService fails
      if ('speechSynthesis' in window && this.currentCompanion) {
        // Cancel any ongoing speech first to prevent overlaps
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(message);
        
        // Apply companion-specific voice settings
        const voiceSettings = this.getCompanionVoiceSettings(this.currentCompanion);
        utterance.rate = voiceSettings.rate;
        utterance.pitch = voiceSettings.pitch;
        utterance.volume = voiceSettings.volume;

        utterance.onend = () => {
          this.isPlaying = false;
          onComplete?.();
          this.processQueue();
        };
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          this.isPlaying = false;
          onComplete?.();
          this.processQueue();
        };

        window.speechSynthesis.speak(utterance);
      } else {
        // Fallback if speech synthesis not available
        this.isPlaying = false;
        onComplete?.();
      }
    }
  }

  /**
   * Get companion voice settings
   */
  private getCompanionVoiceSettings(companion: string): any {
    const settings: { [key: string]: any } = {
      finn: { rate: 1.0, pitch: 1.1, volume: 0.9 },
      sage: { rate: 0.9, pitch: 0.9, volume: 0.85 },
      spark: { rate: 1.1, pitch: 1.2, volume: 0.95 },
      harmony: { rate: 0.85, pitch: 1.0, volume: 0.8 }
    };
    return settings[companion] || { rate: 1, pitch: 1, volume: 0.9 };
  }

  /**
   * Process queued messages
   */
  private processQueue(): void {
    if (this.autoPlayQueue.length > 0 && !this.isPlaying) {
      const next = this.autoPlayQueue.shift();
      if (next) {
        this.playMessage(next.message);
      }
    }
  }

  /**
   * Stop current voiceover
   */
  stopCurrent(): void {
    // Set stopped flag
    this.isStopped = true;
    
    // Clear all pending timeouts
    this.pendingTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.pendingTimeouts.clear();
    
    // Stop speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    audioService.stopAll();
    this.isPlaying = false;
    this.autoPlayQueue = [];
  }

  /**
   * Quick encouragement
   */
  encourage(): void {
    if (this.currentCompanion) {
      this.playVoiceover('encouragement', null, { priority: 'low' });
    }
  }

  /**
   * Check if voiceover is enabled
   */
  isVoiceoverEnabled(): boolean {
    return this.isEnabled;
  }
}

export const companionVoiceoverService = CompanionVoiceoverService.getInstance();