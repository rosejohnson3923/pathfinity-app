/**
 * Simplified Audio Service
 * Uses browser's built-in speech synthesis as primary method
 * Falls back to Azure TTS when available
 */

export class SimplifiedAudioService {
  private static instance: SimplifiedAudioService;
  private isSpeaking: boolean = false;

  private constructor() {}

  static getInstance(): SimplifiedAudioService {
    if (!SimplifiedAudioService.instance) {
      SimplifiedAudioService.instance = new SimplifiedAudioService();
    }
    return SimplifiedAudioService.instance;
  }

  /**
   * Play text using browser's speech synthesis
   */
  playText(text: string, companion: string = 'finn', options?: {
    volume?: number;
    rate?: number;
    onStart?: () => void;
    onEnd?: () => void;
  }): void {
    console.warn('🔊 VOICE: playText called with:', {
      text: text?.substring(0, 100),
      textLength: text?.length,
      companion,
      hasSpeechSynthesis: 'speechSynthesis' in window
    });

    if (!text || !('speechSynthesis' in window)) {
      console.error('🔊 VOICE: Cannot play - no text or speech synthesis not available');
      options?.onEnd?.();
      return;
    }

    // Stop any current speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);

    // Set voice based on companion
    const voices = speechSynthesis.getVoices();
    const voiceMap: Record<string, string> = {
      'finn': 'Microsoft David', // Male voice
      'sage': 'Microsoft Zira',  // Female voice (neutral character)
      'spark': 'Microsoft Zira', // Female voice
      'harmony': 'Microsoft Zira' // Female voice
    };

    const preferredVoice = voiceMap[companion.toLowerCase()] || 'Microsoft David';
    const selectedVoice = voices.find(v => v.name.includes(preferredVoice)) || voices[0];

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Set speech parameters
    utterance.volume = options?.volume ?? 0.8;
    utterance.rate = options?.rate ?? 1.0;
    utterance.pitch = 1.0;

    // Event handlers
    utterance.onstart = () => {
      this.isSpeaking = true;
      console.log('🔊 Speech started:', text.substring(0, 50) + '...');
      options?.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      console.log('🔇 Speech ended');
      options?.onEnd?.();
    };

    utterance.onerror = (event) => {
      this.isSpeaking = false;
      console.error('Speech error:', event.error);
      options?.onEnd?.();
    };

    // Start speaking
    speechSynthesis.speak(utterance);
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  /**
   * Check if currently speaking
   */
  get speaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Play Master Narrative section
   */
  playNarrativeSection(narrative: any, section: 'greeting' | 'introduction' | 'mission', companion: string = 'finn'): void {
    console.warn('🔊 VOICE: playNarrativeSection called:', {
      section,
      companion,
      hasNarrative: !!narrative,
      narrativeKeys: narrative ? Object.keys(narrative) : [],
      cohesiveStory: narrative?.cohesiveStory ? Object.keys(narrative.cohesiveStory) : [],
      journeyArc: narrative?.journeyArc ? Object.keys(narrative.journeyArc) : [],
      character: narrative?.character
    });

    let text = '';

    // Use the actual narrative structure from the logs
    switch (section) {
      case 'greeting':
        // Create a greeting using character info
        if (narrative?.character?.name) {
          const role = narrative.character.role || 'helper';
          const workplace = narrative.character.workplace || 'Career Inc';
          text = `Hello! Welcome to ${workplace}! I'm helping you become a ${role} today. Let's start our adventure!`;
        } else {
          text = narrative?.journeyArc?.checkIn || '';
        }
        break;
      case 'introduction':
        // Use the learn journey arc for introduction
        text = narrative?.journeyArc?.learn ||
               narrative?.settingProgression?.learn?.narrative ||
               '';
        break;
      case 'mission':
        // Use the cohesiveStory mission
        text = narrative?.cohesiveStory?.mission ||
               narrative?.cohesiveStory?.throughLine ||
               '';
        break;
    }

    // Better fallback with actual content
    if (!text && narrative) {
      console.warn('🔊 VOICE: Using enhanced fallback');
      const characterName = narrative?.character?.name || 'your companion';
      const role = narrative?.character?.role || 'helper';

      switch (section) {
        case 'greeting':
          text = `Hello! Welcome to your learning journey with ${characterName}!`;
          break;
        case 'introduction':
          text = `Today as a ${role}, we'll explore amazing things together. ${narrative?.cohesiveStory?.focusType || ''}`;
          break;
        case 'mission':
          text = narrative?.cohesiveStory?.mission || `Let's learn and grow together!`;
          break;
      }
    }

    console.warn(`🔊 VOICE: Text for ${section}:`, {
      text: text?.substring(0, 100),
      textLength: text?.length,
      hasText: !!text
    });

    if (text) {
      console.log(`🎵 Playing ${section} audio (browser TTS):`, text.substring(0, 50) + '...');
      this.playText(text, companion);
    } else {
      console.error(`⚠️ VOICE: No text for ${section} in narrative`, narrative);
    }
  }
}

// Export singleton instance
export const simplifiedAudioService = SimplifiedAudioService.getInstance();