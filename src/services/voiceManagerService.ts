/**
 * VOICE MANAGER SERVICE
 * Handles text-to-speech functionality for AI characters
 * Integrates with Azure Speech Services for character voices
 */

import { AICharacter } from '../types/AICharacterTypes';

interface VoiceSettings {
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
}

interface SpeechRequest {
  text: string;
  character: string;
  grade: string;
  voice?: string;
}

export class VoiceManagerService {
  private speechSynthesis: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isInitialized: boolean = false;
  private selectedVoiceCache: Map<string, SpeechSynthesisVoice> = new Map();

  constructor() {
    this.initializeSpeechSynthesis();
  }

  /**
   * Initialize speech synthesis
   */
  private initializeSpeechSynthesis(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
      this.loadVoices();
    }
  }

  /**
   * Load available voices
   */
  private loadVoices(): void {
    if (!this.speechSynthesis) return;

    const loadVoicesHandler = () => {
      this.voices = this.speechSynthesis!.getVoices();
      this.isInitialized = true;
      this.logAvailableVoices();
    };

    // Load voices immediately if available
    this.voices = this.speechSynthesis.getVoices();
    
    if (this.voices.length > 0) {
      this.isInitialized = true;
      this.logAvailableVoices();
    } else {
      // Wait for voices to load
      this.speechSynthesis.addEventListener('voiceschanged', loadVoicesHandler);
    }
  }
  
  /**
   * Log available voices for debugging
   */
  private logAvailableVoices(): void {
    console.group('🎤 Available Text-to-Speech Voices');
    console.log(`Total voices: ${this.voices.length}`);
    
    const englishVoices = this.voices.filter(v => v.lang.startsWith('en'));
    const femaleVoices = englishVoices.filter(v => 
      v.name.toLowerCase().includes('female') ||
      v.name.toLowerCase().includes('zira') ||
      v.name.toLowerCase().includes('hazel') ||
      v.name.toLowerCase().includes('samantha') ||
      v.name.toLowerCase().includes('victoria')
    );
    
    console.log('English voices:', englishVoices.map(v => ({
      name: v.name,
      lang: v.lang,
      default: v.default
    })));
    
    console.log('Detected female voices:', femaleVoices.map(v => v.name));
    console.groupEnd();
  }

  /**
   * Get voice settings for a character
   */
  private getVoiceForCharacter(characterId: string): VoiceSettings {
    // Define character personalities and their voice preferences
    const characterVoices: Record<string, VoiceSettings> = {
      finn: {
        // Finn: Young, enthusiastic boy - use default voice with higher pitch
        voice: 'default', // Will use system default
        rate: 0.95,
        pitch: 1.2, // Higher pitch for younger character
        volume: 1.0
      },
      sage: {
        // Sage: Wise, calm female mentor - use female voice if available
        voice: 'female', // Will search for female voice
        rate: 0.85,
        pitch: 0.95,
        volume: 0.95
      },
      spark: {
        // Spark: Energetic, upbeat character - faster speech (match audioService settings)
        voice: 'Google US English',  // Try Google voice first, will fallback if not available
        rate: 1.15,  // Match audioService rate
        pitch: 1.3,   // Match audioService pitch - higher for energetic sound
        volume: 1.0
      },
      harmony: {
        // Harmony: Gentle, supportive female - use female voice if available
        voice: 'female', // Will search for female voice
        rate: 0.9,
        pitch: 1.05, // Slightly higher for feminine voice
        volume: 0.95
      }
    };

    return characterVoices[characterId] || characterVoices.finn;
  }

  /**
   * Find the best matching voice
   */
  private findBestVoice(preferredVoiceName: string): SpeechSynthesisVoice | null {
    if (!this.voices.length) return null;

    // Handle simplified voice preferences
    if (preferredVoiceName === 'female') {
      // Look for female voices
      const femaleKeywords = ['female', 'woman', 'zira', 'hazel', 'susan', 'linda', 
                             'karen', 'samantha', 'victoria', 'kate', 'allison', 
                             'ava', 'nora', 'amy', 'emma', 'joanna', 'salli', 'kendra'];
      
      // Try to find a female voice
      for (const keyword of femaleKeywords) {
        const voice = this.voices.find(v => 
          v.name.toLowerCase().includes(keyword) && 
          v.lang.startsWith('en')
        );
        if (voice) return voice;
      }
    }
    
    if (preferredVoiceName === 'default') {
      // Use the default English voice
      const defaultVoice = this.voices.find(v => v.default && v.lang.startsWith('en'));
      if (defaultVoice) return defaultVoice;
      
      // Fallback to first English voice
      const englishVoice = this.voices.find(v => v.lang.startsWith('en'));
      if (englishVoice) return englishVoice;
    }

    // Try exact match for specific voice names
    let voice = this.voices.find(v => v.name === preferredVoiceName);
    if (voice) return voice;

    // Try partial match  
    voice = this.voices.find(v => v.name.toLowerCase().includes(preferredVoiceName.toLowerCase()));
    if (voice) return voice;
    
    // For Google voices that might not be available, try alternatives
    if (preferredVoiceName.includes('Google')) {
      // Try any Google voice first
      voice = this.voices.find(v => v.name.includes('Google') && v.lang.startsWith('en'));
      if (voice) return voice;
      
      // Try UK voices as alternative (often sound better than default)
      voice = this.voices.find(v => v.name.includes('UK') && v.lang.startsWith('en'));
      if (voice) return voice;
    }

    // Fallback to first English voice that's NOT Microsoft David if possible
    voice = this.voices.find(v => 
      v.lang.startsWith('en') && !v.name.includes('David')
    );
    if (voice) return voice;
    
    // Fallback to any English voice
    voice = this.voices.find(v => v.lang.startsWith('en'));
    if (voice) return voice;

    // Last resort - first available voice
    return this.voices[0] || null;
  }

  /**
   * Strip emojis and emoji descriptions from text for speech
   */
  private stripEmojisForSpeech(text: string): string {
    // First, normalize ALL smart quotes and curly apostrophes to regular ones
    // This includes various Unicode variants that might come from AI responses
    let cleaned = text
      // Remove markdown formatting first
      .replace(/\*\*([^*]+)\*\*/g, '$1')  // Remove bold **text**
      .replace(/\*([^*]+)\*/g, '$1')      // Remove italic *text*
      .replace(/__([^_]+)__/g, '$1')      // Remove bold __text__
      .replace(/_([^_]+)_/g, '$1')        // Remove italic _text_
      .replace(/~~([^~]+)~~/g, '$1')      // Remove strikethrough ~~text~~
      .replace(/`([^`]+)`/g, '$1')        // Remove inline code `text`
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Remove links [text](url)
      .replace(/^#+\s+/gm, '')            // Remove heading markers
      .replace(/^>\s+/gm, '')             // Remove blockquote markers
      .replace(/^[-*+]\s+/gm, '')         // Remove list markers
      .replace(/^\d+\.\s+/gm, '')         // Remove numbered list markers
      // Then normalize quotes
      .replace(/[''`´]/g, "'")  // Replace ALL smart/curly single quotes with regular apostrophe
      .replace(/[""„"]/g, '"')  // Replace ALL smart/curly double quotes with regular quote
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'")  // Unicode single quotes
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"')  // Unicode double quotes
      // Remove actual emoji characters
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Symbols & pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport & map symbols
      .replace(/[\u{1F700}-\u{1F77F}]/gu, '') // Alchemical symbols
      .replace(/[\u{1F780}-\u{1F7FF}]/gu, '') // Geometric shapes extended
      .replace(/[\u{1F800}-\u{1F8FF}]/gu, '') // Supplemental arrows-C
      .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Miscellaneous symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental symbols and pictographs
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess symbols
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and pictographs extended-A
      // Replace symbols with natural spoken equivalents
      .replace(/&/g, ' and ')
      .replace(/@/g, ' at ')
      .replace(/#/g, ' number ')
      .replace(/\$/g, ' dollars ')
      .replace(/%/g, ' percent ')
      .replace(/\+/g, ' plus ')
      .replace(/=/g, ' equals ')
      .replace(/</g, ' less than ')
      .replace(/>/g, ' greater than ')
      .replace(/\*/g, ' times ')
      .replace(/\//g, ' divided by ')
      // Remove special characters that shouldn't be spoken
      .replace(/[\^~`|\\]/g, ' ')
      .replace(/[★☆✓✗✔✘×÷±∞π]/g, ' ')
      .replace(/[←→↑↓↔↕⇐⇒⇑⇓⇔⇕]/g, ' ')
      .replace(/[♠♣♥♦♤♧♡♢]/g, ' ')
      .replace(/[©®™℗℠]/g, ' ')
      .replace(/[°¢£¤¥§¨ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿]/g, ' ')
      // Smart quotes already normalized above, so we can safely remove other special punctuation
      .replace(/[\u2000-\u2017]/gu, ' ') // General punctuation before quotes (already normalized)
      .replace(/[\u2020-\u206F]/gu, ' ') // General punctuation after quotes (already normalized)
      .replace(/[\u2100-\u214F]/gu, ' ') // Letterlike symbols
      .replace(/[\u2190-\u21FF]/gu, ' ') // Arrows
      .replace(/[\u2200-\u22FF]/gu, ' ') // Mathematical operators
      // Remove formatting characters
      .replace(/_{2,}/g, ' ')
      .replace(/\-{2,}/g, ' ')
      .replace(/\.{3,}/g, ' ')
      .replace(/\({2,}/g, '(')
      .replace(/\){2,}/g, ')')
      // Remove emoji descriptions that might be verbalized
      .replace(/\bparty popper\b/gi, '')
      .replace(/\bsparkles\b/gi, '')
      .replace(/\brocket\b/gi, '')
      .replace(/\bstar\b/gi, '')
      .replace(/\bheart\b/gi, '')
      .replace(/\bfire\b/gi, '')
      .replace(/\blight bulb\b/gi, '')
      .replace(/\bsmiling face\b/gi, '')
      .replace(/\bampersand\b/gi, 'and')
      .replace(/\bhashtag\b/gi, '')
      .replace(/\basterisk\b/gi, '')
      // Clean up extra spaces and punctuation
      .replace(/\s+/g, ' ')
      .replace(/\s+([.,!?;:])/g, '$1')
      .replace(/([.,!?;:])\s*([.,!?;:])/g, '$1')
      .trim();
    
    return cleaned;
  }

  /**
   * Generate and speak message with character voice
   */
  async generateAndSpeak(characterId: string, message: string, grade: string): Promise<void> {
    if (!this.speechSynthesis || !this.isInitialized) {
      console.log('🔊 Speech synthesis not available, skipping voice generation');
      return;
    }

    // DETAILED LOGGING: Speech generation process
    console.group(`🎤 Voice Manager Speech Generation - ${characterId}`);
    console.log('📝 Original Message:', message);
    console.log('📏 Original Length:', message.length, 'characters');
    console.log('🎓 Grade Level:', grade);

    try {
      // Strip emojis from the message for speech
      const speechText = this.stripEmojisForSpeech(message);
      
      console.log('🧹 Cleaned Text for Speech:', speechText);
      console.log('📏 Cleaned Length:', speechText.length, 'characters');
      console.log('🔍 Text Differences:', {
        original: message.substring(0, 100),
        cleaned: speechText.substring(0, 100),
        removedChars: message.length - speechText.length
      });
      
      if (!speechText || speechText.length === 0) {
        console.log('🔇 No speakable text after emoji removal, skipping');
        console.groupEnd();
        return;
      }

      // Get voice settings for character
      const voiceSettings = this.getVoiceForCharacter(characterId);
      console.log('🎛️ Voice Settings:', voiceSettings);
      
      // Create speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(speechText);
      console.log('📢 Created SpeechSynthesisUtterance');
      
      // Check if we have a cached voice for this character
      let voice = this.selectedVoiceCache.get(characterId);
      
      if (!voice) {
        // Find and cache the best matching voice for this character
        voice = this.findBestVoice(voiceSettings.voice);
        if (voice) {
          this.selectedVoiceCache.set(characterId, voice);
          console.log(`🎯 Cached voice for ${characterId}: ${voice.name}`);
        }
      } else {
        console.log(`📦 Using cached voice for ${characterId}: ${voice.name}`);
      }
      
      if (voice) {
        utterance.voice = voice;
      }

      // Apply character-specific voice settings
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;

      // Grade-based voice maturation adjustments
      // Each companion's voice matures with the student's grade level
      const gradeNum = grade === 'K' ? 0 : parseInt(grade) || 0;
      
      if (grade === 'Pre-K' || grade === 'K') {
        // Kindergarten: Slower, higher pitch, very friendly
        utterance.rate = Math.max(0.7, utterance.rate - 0.2);
        utterance.pitch = Math.min(1.3, utterance.pitch + 0.1);
      } else if (gradeNum >= 1 && gradeNum <= 2) {
        // Grades 1-2: Slightly slower, friendly pitch
        utterance.rate = Math.max(0.8, utterance.rate - 0.1);
        utterance.pitch = Math.min(1.2, utterance.pitch + 0.05);
      } else if (gradeNum >= 3 && gradeNum <= 5) {
        // Grades 3-5: Normal pace, natural pitch
        utterance.rate = utterance.rate;
        utterance.pitch = utterance.pitch;
      } else if (gradeNum >= 6 && gradeNum <= 8) {
        // Grades 6-8: Slightly faster, slightly lower pitch for maturity
        utterance.rate = Math.min(1.1, utterance.rate + 0.05);
        utterance.pitch = Math.max(0.9, utterance.pitch - 0.05);
      } else if (gradeNum >= 9) {
        // Grades 9-12: Professional pace, mature pitch
        utterance.rate = Math.min(1.15, utterance.rate + 0.1);
        utterance.pitch = Math.max(0.85, utterance.pitch - 0.1);
      }
      
      console.log(`🎓 Grade ${grade} voice adjustments - Rate: ${utterance.rate}, Pitch: ${utterance.pitch}`);

      // Speak the message
      console.log('🔊 Starting speech synthesis...');
      return new Promise((resolve, reject) => {
        utterance.onend = () => {
          console.log('✅ Speech completed successfully');
          console.groupEnd();
          resolve();
        };
        utterance.onerror = (error) => {
          console.error('❌ Speech synthesis error:', error);
          console.groupEnd();
          resolve(); // Don't reject, just resolve to continue
        };

        this.speechSynthesis!.speak(utterance);
        console.log('🎵 Speech in progress...');
      });

    } catch (error) {
      console.error('❌ Voice generation error:', error);
      console.groupEnd();
      // Don't throw error - voice is optional functionality
    }
  }

  /**
   * Stop current speech
   */
  stopSpeaking(): void {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }
  
  /**
   * Clear cached voice for a character (useful when changing companions)
   */
  clearVoiceCache(characterId?: string): void {
    if (characterId) {
      this.selectedVoiceCache.delete(characterId);
      console.log(`🗑️ Cleared voice cache for ${characterId}`);
    } else {
      this.selectedVoiceCache.clear();
      console.log('🗑️ Cleared all voice caches');
    }
  }

  /**
   * Check if speech synthesis is supported
   */
  isSupported(): boolean {
    return !!(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  /**
   * Test voice with sample text
   */
  async testVoice(characterId: string): Promise<void> {
    const testMessages = {
      finn: "Hi there! I'm Finn, and I'm excited to help you learn!",
      sage: "Hello! I'm Sage, and I'm here to guide your learning journey.",
      spark: "Hey! I'm Spark, ready to create something amazing with you!",
      harmony: "Hello! I'm Harmony, your learning companion for success."
    };

    const message = testMessages[characterId as keyof typeof testMessages] || testMessages.finn;
    await this.generateAndSpeak(characterId, message, 'K');
  }
}

// Export singleton instance
export const voiceManagerService = new VoiceManagerService();