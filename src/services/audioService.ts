/**
 * Audio Service for AI Companion Voice Previews
 * Handles text-to-speech and audio playback
 */

interface VoiceSettings {
  rate: number;
  pitch: number;
  volume: number;
  voiceName?: string;
}

class AudioService {
  private static instance: AudioService;
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private availableVoices: SpeechSynthesisVoice[] = [];

  private constructor() {
    this.initializeVoices();
  }

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  private initializeVoices() {
    if ('speechSynthesis' in window) {
      // Load voices
      const loadVoices = () => {
        this.availableVoices = window.speechSynthesis.getVoices();
      };

      loadVoices();
      
      // Chrome needs this event
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }

  /**
   * Get voice settings for each companion
   */
  private getCompanionVoiceSettings(companionId: string): VoiceSettings {
    const settings: { [key: string]: VoiceSettings } = {
      finn: {
        rate: 1.0,
        pitch: 1.1,
        volume: 1.0,
        voiceName: 'Google US English' // Prefer friendly voice
      },
      sage: {
        rate: 0.85,
        pitch: 0.9,
        volume: 0.9,
        voiceName: 'Google UK English Male' // Prefer wise voice
      },
      spark: {
        rate: 1.15,
        pitch: 1.3,
        volume: 1.0,
        voiceName: 'Google US English' // Prefer energetic voice
      },
      harmony: {
        rate: 0.9,
        pitch: 1.05,
        volume: 0.85,
        voiceName: 'Google UK English Female' // Prefer calm voice
      }
    };

    return settings[companionId] || { rate: 1, pitch: 1, volume: 1 };
  }

  /**
   * Get companion-specific greeting messages
   */
  private getCompanionGreeting(companionId: string): string {
    const greetings: { [key: string]: string } = {
      finn: "Hoot hoot! I'm Finn the Owl! Ready for an epic learning adventure? I've got my gaming goggles on and I'm ready to help you level up your skills! Let's go!",
      sage: "Greetings, apprentice! I'm Sage the Wizard, master of knowledge magic! My spell books are ready, and together we'll unlock the secrets of learning. Ready to cast some wisdom spells?",
      spark: "ZOOM! Hey there, speedster! I'm Spark, the electric champion! Time to power up your brain with lightning-fast learning! Ready to dash through challenges at super speed?",
      harmony: "✨ Hello, magical friend! I'm Harmony, your flower guardian! With nature's power and petal magic, we'll make learning bloom beautifully! Let's create some learning magic together!"
    };

    return greetings[companionId] || "Hello! I'm your AI companion.";
  }

  /**
   * Play companion voice sample
   */
  async playCompanionVoice(
    companionId: string, 
    audioUrl?: string,
    onStart?: () => void,
    onEnd?: () => void
  ): Promise<void> {
    // Stop any current playback
    this.stopAll();

    if (audioUrl) {
      // Try to play audio file first
      try {
        const audio = new Audio(audioUrl);
        this.currentAudio = audio;
        
        audio.onplay = onStart || (() => {});
        audio.onended = () => {
          this.currentAudio = null;
          if (onEnd) onEnd();
        };
        
        audio.onerror = () => {
          // Fallback to text-to-speech
          this.playTextToSpeech(companionId, onStart, onEnd);
        };
        
        await audio.play();
      } catch (error) {
        // Fallback to text-to-speech
        this.playTextToSpeech(companionId, onStart, onEnd);
      }
    } else {
      // Use text-to-speech
      this.playTextToSpeech(companionId, onStart, onEnd);
    }
  }

  /**
   * Play text-to-speech for companion
   */
  private playTextToSpeech(
    companionId: string,
    onStart?: () => void,
    onEnd?: () => void
  ): void {
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-speech not supported');
      return;
    }

    const text = this.getCompanionGreeting(companionId);
    const settings = this.getCompanionVoiceSettings(companionId);
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply voice settings
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    
    // Try to find the preferred voice
    if (settings.voiceName && this.availableVoices.length > 0) {
      const preferredVoice = this.availableVoices.find(
        voice => voice.name.includes(settings.voiceName!)
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      } else {
        // Fallback to any English voice
        const englishVoice = this.availableVoices.find(
          voice => voice.lang.startsWith('en')
        );
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }
    }
    
    utterance.onstart = onStart || (() => {});
    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };
    
    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  /**
   * Stop all audio playback
   */
  stopAll(): void {
    // Stop audio file
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    
    // Stop text-to-speech
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
  }

  /**
   * Check if audio is currently playing
   */
  isPlaying(): boolean {
    return !!(this.currentAudio || this.currentUtterance);
  }
}

export const audioService = AudioService.getInstance();