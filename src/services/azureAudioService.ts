/**
 * Azure Audio Service
 * Uses Azure Cognitive Services TTS via API server
 * Falls back to browser TTS if Azure fails
 */

export class AzureAudioService {
  private static instance: AzureAudioService;
  private currentAudio: HTMLAudioElement | null = null;
  private isSpeaking: boolean = false;
  private apiUrl: string;

  // Map companions to Azure voices
  private voiceMap: Record<string, string> = {
    'pat': 'en-US-AriaNeural',         // Female, neutral narrator/guide voice
    'finn': 'en-US-DavisNeural',      // Male, friendly
    'sage': 'en-US-TonyNeural',        // Male, neutral/wise (matches the male image)
    'spark': 'en-US-JennyNeural',      // Female, energetic
    'harmony': 'en-US-SaraNeural'      // Female, calm
  };

  private constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
  }

  static getInstance(): AzureAudioService {
    if (!AzureAudioService.instance) {
      AzureAudioService.instance = new AzureAudioService();
    }
    return AzureAudioService.instance;
  }

  /**
   * Generate SSML for Azure TTS
   */
  private generateSSML(text: string, companion: string): string {
    const voice = this.voiceMap[companion.toLowerCase()] || 'en-US-DavisNeural';

    // First add pronunciation hints, then escape XML (but the phoneme tags should remain)
    const processedText = this.addPronunciationHints(text);

    // We need to escape the text parts but preserve the SSML phoneme tags
    const finalText = processedText
      .split(/(<phoneme[^>]*>.*?<\/phoneme>)/gi)
      .map((part, index) => {
        // Even indices are regular text, odd indices are phoneme tags
        if (index % 2 === 0) {
          return this.escapeXml(part);
        }
        return part; // Keep phoneme tags as-is
      })
      .join('');

    return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${voice}">
          <prosody rate="1.0" pitch="0%">
            ${finalText}
          </prosody>
        </voice>
      </speak>
    `;
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Add pronunciation hints for words that need special handling
   */
  private addPronunciationHints(text: string): string {
    // Replace Pathfinity with phoneme-tagged version
    // Pronunciation: "path" + ending of "infinity"
    // Path-FIN-ih-tee (path with "th" as in "think", fin with short i, i with short i, ty as "tee")
    // IPA: /pæθˈfɪnɪti/ - stress on FIN syllable like in "infinity"
    return text.replace(
      /Pathfinity/gi,
      '<phoneme alphabet="ipa" ph="pæθˈfɪnɪti">Pathfinity</phoneme>'
    );
  }

  /**
   * Play text using Azure TTS
   */
  async playText(text: string, companion: string = 'finn', options?: {
    volume?: number;
    rate?: number;
    scriptId?: string;
    variables?: Record<string, string>;
    onStart?: () => void;
    onEnd?: () => void;
  }): Promise<void> {
    console.warn('🔊 AZURE TTS: playText called with:', {
      text: text?.substring(0, 100),
      textLength: text?.length,
      companion,
      scriptId: options?.scriptId || 'unknown',
      apiUrl: this.apiUrl
    });

    if (!text) {
      console.error('🔊 AZURE TTS: No text provided');
      options?.onEnd?.();
      return;
    }

    // Stop any current speech
    this.stop();

    try {
      const ssml = this.generateSSML(text, companion);
      console.log('🔊 AZURE TTS: Generating audio with SSML');

      // Call API server to generate audio
      const response = await fetch(`${this.apiUrl}/tts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ssml,
          companion,
          gradeLevel: 'K', // Could be dynamic based on user
          scriptId: options?.scriptId || 'unknown',
          variables: options?.variables || {}
        })
      });

      if (!response.ok) {
        throw new Error(`TTS API failed: ${response.status}`);
      }

      // Get audio data as blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      console.log('🔊 AZURE TTS: Audio generated successfully!', {
        size: audioBlob.size,
        type: audioBlob.type,
        companion,
        voice: this.voiceMap[companion.toLowerCase()] || 'en-US-DavisNeural'
      });

      // Create and play audio element
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.volume = options?.volume ?? 0.8;

      this.currentAudio.onloadeddata = () => {
        console.log('🔊 AZURE TTS: Audio loaded, starting playback');
        this.isSpeaking = true;
        options?.onStart?.();
      };

      this.currentAudio.onended = () => {
        console.log('🔊 AZURE TTS: Audio playback ended');
        this.isSpeaking = false;
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        options?.onEnd?.();
      };

      this.currentAudio.onerror = (e) => {
        console.error('🔊 AZURE TTS: Audio playback error:', e);
        this.isSpeaking = false;
        URL.revokeObjectURL(audioUrl);
        this.currentAudio = null;
        // Fall back to browser TTS
        this.fallbackToBrowserTTS(text, companion, options);
      };

      // Start playback
      await this.currentAudio.play();

    } catch (error) {
      console.error('🔊 AZURE TTS: Failed to generate audio:', error);
      // Fall back to browser TTS
      this.fallbackToBrowserTTS(text, companion, options);
    }
  }

  /**
   * Fallback to browser TTS if Azure fails
   */
  private fallbackToBrowserTTS(text: string, companion: string, options?: {
    volume?: number;
    rate?: number;
    onStart?: () => void;
    onEnd?: () => void;
  }): void {
    console.warn('🔊 AZURE TTS: Falling back to browser TTS');

    if (!('speechSynthesis' in window)) {
      console.error('🔊 AZURE TTS: Browser TTS not available');
      options?.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = options?.volume ?? 0.8;
    utterance.rate = options?.rate ?? 1.0;

    utterance.onstart = () => {
      this.isSpeaking = true;
      options?.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      options?.onEnd?.();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      options?.onEnd?.();
    };

    speechSynthesis.speak(utterance);
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    this.isSpeaking = false;
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
  async playNarrativeSection(narrative: any, section: 'greeting' | 'introduction' | 'mission', companion: string = 'finn'): Promise<void> {
    console.warn('🔊 AZURE TTS: playNarrativeSection called:', {
      section,
      companion,
      hasNarrative: !!narrative,
      narrativeKeys: narrative ? Object.keys(narrative) : []
    });

    let text = '';

    // Use the actual narrative structure
    switch (section) {
      case 'greeting':
        if (narrative?.character?.name) {
          const role = narrative.character.role || 'helper';
          const workplace = narrative.character.workplace || 'Career Inc';
          text = `Hello! Welcome to ${workplace}! I'm helping you become a ${role} today. Let's start our adventure!`;
        } else {
          text = narrative?.journeyArc?.checkIn || '';
        }
        break;
      case 'introduction':
        text = narrative?.journeyArc?.learn ||
               narrative?.settingProgression?.learn?.narrative ||
               '';
        break;
      case 'mission':
        text = narrative?.cohesiveStory?.mission ||
               narrative?.cohesiveStory?.throughLine ||
               '';
        break;
    }

    // Better fallback with actual content
    if (!text && narrative) {
      console.warn('🔊 AZURE TTS: Using enhanced fallback');
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

    console.warn(`🔊 AZURE TTS: Text for ${section}:`, {
      text: text?.substring(0, 100),
      textLength: text?.length,
      hasText: !!text
    });

    if (text) {
      console.log(`🎵 Playing ${section} audio (Azure TTS):`, text.substring(0, 50) + '...');
      await this.playText(text, companion);
    } else {
      console.error(`⚠️ AZURE TTS: No text for ${section} in narrative`, narrative);
    }
  }
}

// Export singleton instance
export const azureAudioService = AzureAudioService.getInstance();