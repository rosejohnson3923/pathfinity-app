/**
 * Dual-Mode Content System
 * Provides both video and text modes from YouTube content
 * Part of the Narrative-First Architecture - Phase 1.3
 */

import { YouTubeVideo, YouTubeTranscript } from './types';

export interface VideoContent {
  mode: 'video';
  embedUrl: string;
  thumbnailUrl: string;
  duration: number;
  autoplay: boolean;
  startTime?: number;
  hasPathfinityIntro: boolean;
}

export interface TextContent {
  mode: 'text';
  originalTranscript: string;
  enhancedContent: string;
  readingTime: number; // estimated minutes
  keyPoints: string[];
  vocabulary?: string[];
}

export interface DualModeOptions {
  preferredMode?: 'video' | 'text';
  enhanceTranscript?: boolean;
  includeKeyPoints?: boolean;
  gradeLevel?: string;
}

export class DualModeContent {
  /**
   * Get video mode content with Pathfinity wrapper options
   */
  async getVideoMode(
    video: YouTubeVideo,
    includeIntro: boolean = true
  ): Promise<VideoContent> {
    return {
      mode: 'video',
      embedUrl: video.embedUrl,
      thumbnailUrl: video.thumbnailUrl || '',
      duration: video.duration,
      autoplay: !includeIntro, // Don't autoplay if we're showing intro
      startTime: includeIntro ? 10 : 0, // Skip 10 seconds if intro shown
      hasPathfinityIntro: includeIntro
    };
  }

  /**
   * Get text mode content from video transcript
   */
  async getTextMode(
    video: YouTubeVideo,
    transcript: YouTubeTranscript[],
    options?: DualModeOptions
  ): Promise<TextContent> {
    const originalTranscript = this.assembleTranscript(transcript);
    const enhancedContent = options?.enhanceTranscript
      ? await this.enhanceTranscript(originalTranscript, options.gradeLevel)
      : originalTranscript;

    const keyPoints = options?.includeKeyPoints
      ? this.extractKeyPoints(enhancedContent)
      : [];

    const readingTime = this.estimateReadingTime(enhancedContent, options?.gradeLevel);
    const vocabulary = this.extractKeyVocabulary(enhancedContent, options?.gradeLevel);

    return {
      mode: 'text',
      originalTranscript,
      enhancedContent,
      readingTime,
      keyPoints,
      vocabulary
    };
  }

  /**
   * Assemble transcript segments into readable text
   */
  private assembleTranscript(transcript: YouTubeTranscript[]): string {
    if (!transcript || transcript.length === 0) {
      return 'Transcript not available for this video.';
    }

    // Sort by start time to ensure correct order
    const sorted = [...transcript].sort((a, b) => a.start - b.start);

    // Combine text segments with basic formatting
    let assembledText = '';
    let currentParagraph = '';
    let lastEndTime = 0;

    for (const segment of sorted) {
      // If there's a gap > 2 seconds, start new paragraph
      if (segment.start - lastEndTime > 2 && currentParagraph) {
        assembledText += currentParagraph.trim() + '\n\n';
        currentParagraph = '';
      }

      currentParagraph += segment.text + ' ';
      lastEndTime = segment.start + segment.duration;
    }

    // Add final paragraph
    if (currentParagraph) {
      assembledText += currentParagraph.trim();
    }

    return assembledText;
  }

  /**
   * Enhance transcript for better readability
   * In production, this would use AI to improve formatting
   */
  private async enhanceTranscript(
    transcript: string,
    gradeLevel?: string
  ): Promise<string> {
    // For now, basic enhancements
    let enhanced = transcript;

    // Fix common transcript issues
    enhanced = enhanced
      .replace(/\bi\b/g, 'I') // Capitalize I
      .replace(/\. ([a-z])/g, (match, letter) => '. ' + letter.toUpperCase()) // Capitalize after periods
      .replace(/\s+/g, ' ') // Fix multiple spaces
      .replace(/(\d+)\s*\+\s*(\d+)/g, '$1 + $2') // Fix math expressions
      .trim();

    // Add section breaks for very long content
    if (enhanced.length > 1000) {
      const sentences = enhanced.split('. ');
      const sectioned = [];
      let currentSection = '';

      for (let i = 0; i < sentences.length; i++) {
        currentSection += sentences[i] + '. ';

        // Create section every ~5 sentences
        if ((i + 1) % 5 === 0 && i < sentences.length - 1) {
          sectioned.push(currentSection.trim());
          currentSection = '';
        }
      }

      if (currentSection) {
        sectioned.push(currentSection.trim());
      }

      enhanced = sectioned.join('\n\n');
    }

    // Grade-specific adjustments could go here
    if (gradeLevel === 'K' || gradeLevel === '1' || gradeLevel === '2') {
      // For young readers, we might simplify vocabulary
      // This would use AI in production
    }

    return enhanced;
  }

  /**
   * Extract key learning points from content
   */
  private extractKeyPoints(content: string): string[] {
    const keyPoints: string[] = [];

    // Look for numbered lists
    const numberedMatches = content.match(/\d+\.\s+[^.]+\./g);
    if (numberedMatches) {
      keyPoints.push(...numberedMatches.map(point => point.trim()));
    }

    // Look for important phrases
    const importantPhrases = [
      /remember that [^.]+\./gi,
      /it's important to [^.]+\./gi,
      /the key is [^.]+\./gi,
      /first, [^.]+\./gi,
      /next, [^.]+\./gi,
      /finally, [^.]+\./gi
    ];

    for (const pattern of importantPhrases) {
      const matches = content.match(pattern);
      if (matches) {
        keyPoints.push(...matches.map(point => point.trim()));
      }
    }

    // Limit to 5 most relevant points
    return keyPoints.slice(0, 5);
  }

  /**
   * Estimate reading time based on grade level
   */
  private estimateReadingTime(content: string, gradeLevel?: string): number {
    const wordCount = content.split(/\s+/).length;

    // Reading speeds by grade (words per minute)
    const readingSpeeds: { [key: string]: number } = {
      'K': 50,   // Kindergarten - very slow, often read aloud
      '1': 60,
      '2': 80,
      '3': 100,
      '4': 120,
      '5': 140,
      '6': 160,
      '7': 180,
      '8': 200,
      'default': 150
    };

    const speed = readingSpeeds[gradeLevel || 'default'] || readingSpeeds.default;
    return Math.ceil(wordCount / speed);
  }

  /**
   * Extract key vocabulary for the grade level
   */
  private extractKeyVocabulary(content: string, gradeLevel?: string): string[] {
    const words = content.toLowerCase().split(/\s+/);
    const vocabulary: Set<string> = new Set();

    // Grade-specific vocabulary patterns
    const mathTerms = [
      'count', 'counting', 'number', 'numbers',
      'add', 'plus', 'sum', 'total',
      'subtract', 'minus', 'difference',
      'equal', 'equals', 'same',
      'more', 'less', 'greater', 'smaller',
      'first', 'second', 'third', 'last',
      'pattern', 'sequence', 'order'
    ];

    // For K-2, focus on basic math vocabulary
    if (gradeLevel === 'K' || gradeLevel === '1' || gradeLevel === '2') {
      for (const word of words) {
        const cleaned = word.replace(/[^a-z]/g, '');
        if (mathTerms.includes(cleaned) && cleaned.length > 2) {
          vocabulary.add(cleaned);
        }
      }
    }

    return Array.from(vocabulary).slice(0, 10);
  }

  /**
   * Create a toggle-able dual mode experience
   */
  async createDualModeExperience(
    video: YouTubeVideo,
    transcript: YouTubeTranscript[],
    options?: DualModeOptions
  ): Promise<{
    video: VideoContent;
    text: TextContent;
    preferredMode: 'video' | 'text';
  }> {
    const [videoMode, textMode] = await Promise.all([
      this.getVideoMode(video, true),
      this.getTextMode(video, transcript, options)
    ]);

    return {
      video: videoMode,
      text: textMode,
      preferredMode: options?.preferredMode || 'video'
    };
  }

  /**
   * Get mode based on user preference or environment
   */
  determineOptimalMode(
    hasAudioCapability: boolean,
    userPreference?: 'video' | 'text',
    networkSpeed?: 'slow' | 'fast'
  ): 'video' | 'text' {
    // User preference takes priority
    if (userPreference) return userPreference;

    // No audio = text mode
    if (!hasAudioCapability) return 'text';

    // Slow network = text mode
    if (networkSpeed === 'slow') return 'text';

    // Default to video for engagement
    return 'video';
  }
}

// Export singleton instance
export const dualModeContent = new DualModeContent();