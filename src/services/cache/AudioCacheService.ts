/**
 * Audio Cache Service
 * Generates and caches companion voice narration using Azure TTS
 * Integrates with existing companion voice system
 */

import { MasterNarrative } from '../narrative/MasterNarrativeGenerator';
import { cacheAPI } from '../api/cacheAPI';
import { azureAIFoundryService } from '../azureAIFoundryService';

interface AudioCacheEntry {
  key: string;
  companion: string;
  gradeLevel: string;
  audioUrl?: string;
  blobName?: string;
  duration?: number;
  createdAt: string;
}

interface CompanionVoiceConfig {
  name: string;
  azureVoice: string;
  rate: number;
  pitch: string;
  style?: string;
}

export class AudioCacheService {
  private audioCache = new Map<string, AudioCacheEntry>();

  // Companion voice configurations matching existing personalities
  private companionVoices: Record<string, CompanionVoiceConfig> = {
    finn: {
      name: 'Finn',
      azureVoice: 'en-US-DavisNeural',  // Young, enthusiastic boy voice (male robot superhero)
      rate: 1.0,
      pitch: 'medium',
      style: 'friendly'
    },
    sage: {
      name: 'Sage',
      azureVoice: 'en-US-AriaNeural',   // Wise, neutral voice (wise owl - gender neutral)
      rate: 0.9,
      pitch: 'medium',
      style: 'professional'
    },
    spark: {
      name: 'Spark',
      azureVoice: 'en-US-AshleyNeural', // Energetic, upbeat female voice (energetic character)
      rate: 1.1,
      pitch: 'high',
      style: 'cheerful'
    },
    harmony: {
      name: 'Harmony',
      azureVoice: 'en-US-SaraNeural',   // Gentle, supportive female voice (flower fairy)
      rate: 0.95,
      pitch: 'medium',
      style: 'empathetic'
    }
  };

  /**
   * Get grade-appropriate voice for companion
   */
  private getCompanionVoiceForGrade(companion: string, gradeLevel: string): string {
    const gradeNum = parseInt(gradeLevel) || 0;
    const baseConfig = this.companionVoices[companion.toLowerCase()];

    if (!baseConfig) {
      return 'en-US-AriaNeural'; // Default fallback
    }

    // Adjust voice based on grade level
    if (companion.toLowerCase() === 'finn') {
      if (gradeNum <= 2) return 'en-US-GuyNeural';     // Gentler male voice for young kids
      if (gradeNum <= 5) return 'en-US-DavisNeural';   // Friendly boy voice for elementary
      if (gradeNum <= 8) return 'en-US-JasonNeural';   // Teenage male voice for middle
      return 'en-US-BrianNeural';                      // Mature male voice for high
    }

    // Other companions keep consistent voices but adjust style
    return baseConfig.azureVoice;
  }

  /**
   * Generate audio cache key
   */
  private getAudioCacheKey(narrativeId: string, companion: string, section: string): string {
    return `audio_${narrativeId}_${companion}_${section}`;
  }

  /**
   * Generate SSML for companion narration
   */
  private generateSSML(text: string, companion: string, gradeLevel: string): string {
    const voice = this.getCompanionVoiceForGrade(companion, gradeLevel);
    const config = this.companionVoices[companion.toLowerCase()];

    // Add pauses and emphasis based on companion personality
    let enhancedText = text;

    if (companion.toLowerCase() === 'spark') {
      // Spark is energetic - add excitement
      enhancedText = text
        .replace(/!/g, '!<break time="200ms"/>')
        .replace(/\./g, '.<break time="300ms"/>');
    } else if (companion.toLowerCase() === 'sage') {
      // Sage is thoughtful - add pauses
      enhancedText = text
        .replace(/,/g, ',<break time="200ms"/>')
        .replace(/\./g, '.<break time="500ms"/>');
    } else if (companion.toLowerCase() === 'harmony') {
      // Harmony is gentle - softer delivery
      enhancedText = text
        .replace(/\./g, '.<break time="400ms"/>');
    }

    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${voice}">
          <prosody rate="${config?.rate || 1.0}" pitch="${config?.pitch || 'medium'}">
            ${enhancedText}
          </prosody>
        </voice>
      </speak>
    `;

    return ssml;
  }

  /**
   * Generate and cache audio for Master Narrative sections
   */
  async generateNarrativeAudio(
    narrative: MasterNarrative,
    companion: string,
    gradeLevel: string
  ): Promise<{
    greeting?: string;
    introduction?: string;
    missionStatement?: string;
  }> {
    const audioUrls: any = {};

    try {
      // Generate audio for greeting
      if (narrative.greeting) {
        const greetingKey = this.getAudioCacheKey(narrative.narrativeId, companion, 'greeting');
        audioUrls.greeting = await this.generateAndCacheAudio(
          narrative.greeting,
          greetingKey,
          companion,
          gradeLevel
        );
      }

      // Generate audio for introduction
      if (narrative.introduction) {
        const introKey = this.getAudioCacheKey(narrative.narrativeId, companion, 'introduction');
        audioUrls.introduction = await this.generateAndCacheAudio(
          narrative.introduction,
          introKey,
          companion,
          gradeLevel
        );
      }

      // Generate audio for mission statement
      if (narrative.careerContext?.mission) {
        const missionKey = this.getAudioCacheKey(narrative.narrativeId, companion, 'mission');
        const missionText = `As a future ${narrative.careerContext.title}, you'll ${narrative.careerContext.mission}`;
        audioUrls.missionStatement = await this.generateAndCacheAudio(
          missionText,
          missionKey,
          companion,
          gradeLevel
        );
      }

      console.log(`🎧 Generated audio for narrative ${narrative.narrativeId}:`, audioUrls);
      return audioUrls;

    } catch (error) {
      console.error('Failed to generate narrative audio:', error);
      return {};
    }
  }

  /**
   * Generate and cache a single audio segment
   */
  private async generateAndCacheAudio(
    text: string,
    cacheKey: string,
    companion: string,
    gradeLevel: string
  ): Promise<string | undefined> {
    // Check memory cache first
    const cached = this.audioCache.get(cacheKey);
    if (cached?.audioUrl) {
      console.log(`✅ Audio cache hit: ${cacheKey}`);
      return cached.audioUrl;
    }

    try {
      // Check Azure storage
      const existingAudio = await cacheAPI.getAudioFile(cacheKey);
      if (existingAudio) {
        console.log(`☁️ Audio retrieved from Azure: ${cacheKey}`);
        this.audioCache.set(cacheKey, {
          key: cacheKey,
          companion,
          gradeLevel,
          audioUrl: existingAudio.url,
          blobName: existingAudio.blobName,
          createdAt: new Date().toISOString()
        });
        return existingAudio.url;
      }

      // Generate new audio using Azure TTS
      console.log(`🎤 Generating audio for ${companion}: "${text.substring(0, 50)}..."`);

      const ssml = this.generateSSML(text, companion, gradeLevel);
      const audioBuffer = await this.generateAudioWithAzure(ssml, companion, gradeLevel);

      // Upload to Azure storage
      const uploadResult = await cacheAPI.saveAudioFile(
        cacheKey,
        audioBuffer,
        {
          companion,
          gradeLevel,
          text: text.substring(0, 100), // Save preview for reference
          duration: this.estimateDuration(text)
        }
      );

      if (uploadResult.success) {
        // Cache locally
        this.audioCache.set(cacheKey, {
          key: cacheKey,
          companion,
          gradeLevel,
          audioUrl: uploadResult.url,
          blobName: uploadResult.blobName,
          duration: this.estimateDuration(text),
          createdAt: new Date().toISOString()
        });

        console.log(`✅ Audio cached: ${cacheKey}`);
        return uploadResult.url;
      }

    } catch (error) {
      console.error(`Failed to generate audio for ${cacheKey}:`, error);
    }

    return undefined;
  }

  /**
   * Generate audio using Azure TTS
   */
  private async generateAudioWithAzure(ssml: string, companion: string, gradeLevel: string): Promise<ArrayBuffer> {
    // Use backend API for Azure TTS
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
    const response = await fetch(`${apiUrl}/tts/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ssml,
        companion,
        gradeLevel
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('TTS generation failed:', error);
      throw new Error('Failed to generate audio');
    }

    return await response.arrayBuffer();
  }

  /**
   * Estimate audio duration based on text length
   */
  private estimateDuration(text: string): number {
    // Rough estimate: 150 words per minute
    const words = text.split(' ').length;
    return Math.ceil((words / 150) * 60); // Duration in seconds
  }

  /**
   * Preload audio for upcoming content
   */
  async preloadAudio(narrativeId: string, companion: string): Promise<void> {
    const sections = ['greeting', 'introduction', 'mission'];

    for (const section of sections) {
      const cacheKey = this.getAudioCacheKey(narrativeId, companion, section);

      // Check if already cached
      if (!this.audioCache.has(cacheKey)) {
        // Trigger background load from Azure
        cacheAPI.getAudioFile(cacheKey).then(audio => {
          if (audio) {
            this.audioCache.set(cacheKey, {
              key: cacheKey,
              companion,
              gradeLevel: 'unknown',
              audioUrl: audio.url,
              blobName: audio.blobName,
              createdAt: new Date().toISOString()
            });
          }
        });
      }
    }
  }

  /**
   * Clear audio cache
   */
  clearCache(): void {
    this.audioCache.clear();
    console.log('🗑️ Audio cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalCached: number;
    companionBreakdown: Record<string, number>;
  } {
    const stats = {
      totalCached: this.audioCache.size,
      companionBreakdown: {} as Record<string, number>
    };

    for (const [_, entry] of this.audioCache) {
      stats.companionBreakdown[entry.companion] =
        (stats.companionBreakdown[entry.companion] || 0) + 1;
    }

    return stats;
  }
}

// Singleton instance
export const audioCacheService = new AudioCacheService();