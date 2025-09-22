/**
 * Fallback Handler
 * Provides resilient content generation when primary services fail
 * Ensures students always receive educational content
 * Part of the Narrative-First Architecture - Phase 4
 */

import { StudentRequest } from './ContentOrchestrator';
import { MasterNarrative } from '../narrative/NarrativeSchema';

export type ErrorType =
  | 'YOUTUBE_UNAVAILABLE'
  | 'NARRATIVE_GENERATION_FAILED'
  | 'CACHE_MISS'
  | 'AI_SERVICE_DOWN'
  | 'RATE_LIMIT_EXCEEDED'
  | 'NETWORK_ERROR'
  | 'INVALID_REQUEST'
  | 'UNKNOWN';

export interface FallbackContent {
  content: any;
  source: 'static' | 'cached' | 'simplified' | 'alternative';
  quality: 'full' | 'degraded' | 'minimal';
  missingFeatures: string[];
  message: string;
}

export class FallbackHandler {
  // Pre-generated static content for emergencies
  private staticContent = new Map<string, any>();

  // Alternative service endpoints
  private alternativeServices = {
    video: ['vimeo', 'teachertube', 'static-library'],
    ai: ['backup-gpt', 'local-model', 'template-based'],
    cache: ['memory', 'disk', 'cdn']
  };

  constructor() {
    this.initializeStaticContent();
  }

  /**
   * Main fallback handling method
   */
  async handle(
    error: Error,
    request: StudentRequest,
    context?: any
  ): Promise<FallbackContent> {
    const errorType = this.classifyError(error);

    console.log(`Handling fallback for ${errorType}:`, error.message);

    switch (errorType) {
      case 'YOUTUBE_UNAVAILABLE':
        return this.handleYouTubeFailure(request);

      case 'NARRATIVE_GENERATION_FAILED':
        return this.handleNarrativeFailure(request);

      case 'CACHE_MISS':
        return this.handleCacheMiss(request);

      case 'AI_SERVICE_DOWN':
        return this.handleAIServiceDown(request);

      case 'RATE_LIMIT_EXCEEDED':
        return this.handleRateLimit(request);

      case 'NETWORK_ERROR':
        return this.handleNetworkError(request);

      case 'INVALID_REQUEST':
        return this.handleInvalidRequest(request);

      default:
        return this.handleUnknownError(request, error);
    }
  }

  /**
   * Classify error type for appropriate handling
   */
  private classifyError(error: Error): ErrorType {
    const message = error.message.toLowerCase();

    if (message.includes('youtube') || message.includes('video')) {
      return 'YOUTUBE_UNAVAILABLE';
    }

    if (message.includes('narrative') || message.includes('generation')) {
      return 'NARRATIVE_GENERATION_FAILED';
    }

    if (message.includes('cache')) {
      return 'CACHE_MISS';
    }

    if (message.includes('ai') || message.includes('gpt') || message.includes('openai')) {
      return 'AI_SERVICE_DOWN';
    }

    if (message.includes('rate') || message.includes('limit')) {
      return 'RATE_LIMIT_EXCEEDED';
    }

    if (message.includes('network') || message.includes('fetch')) {
      return 'NETWORK_ERROR';
    }

    if (message.includes('invalid') || message.includes('missing')) {
      return 'INVALID_REQUEST';
    }

    return 'UNKNOWN';
  }

  /**
   * Handle YouTube service failure
   */
  private async handleYouTubeFailure(request: StudentRequest): Promise<FallbackContent> {
    console.log('YouTube unavailable, using alternative content');

    // Try alternative video sources
    const alternativeVideo = await this.findAlternativeVideo(request);

    if (alternativeVideo) {
      return {
        content: alternativeVideo,
        source: 'alternative',
        quality: 'degraded',
        missingFeatures: ['youtube-specific-features'],
        message: 'Using alternative video source'
      };
    }

    // Fall back to text-only content
    return {
      content: this.generateTextOnlyLesson(request),
      source: 'simplified',
      quality: 'degraded',
      missingFeatures: ['video-content', 'visual-learning'],
      message: 'Video unavailable - using text-based lesson'
    };
  }

  /**
   * Handle narrative generation failure
   */
  private async handleNarrativeFailure(request: StudentRequest): Promise<FallbackContent> {
    console.log('Narrative generation failed, using templates');

    // Try to use a similar cached narrative
    const similarNarrative = await this.findSimilarNarrative(request);

    if (similarNarrative) {
      return {
        content: this.adaptNarrative(similarNarrative, request),
        source: 'cached',
        quality: 'degraded',
        missingFeatures: ['personalized-narrative'],
        message: 'Using adapted narrative from similar content'
      };
    }

    // Use template-based narrative
    return {
      content: this.generateTemplateNarrative(request),
      source: 'static',
      quality: 'minimal',
      missingFeatures: ['personalization', 'career-specific-details'],
      message: 'Using basic template narrative'
    };
  }

  /**
   * Handle cache miss
   */
  private async handleCacheMiss(request: StudentRequest): Promise<FallbackContent> {
    console.log('Cache miss, generating fresh content');

    // Generate simplified content that requires less resources
    return {
      content: await this.generateSimplifiedContent(request),
      source: 'simplified',
      quality: 'degraded',
      missingFeatures: ['rich-narrative', 'advanced-features'],
      message: 'Generated simplified content due to cache miss'
    };
  }

  /**
   * Handle AI service downtime
   */
  private async handleAIServiceDown(request: StudentRequest): Promise<FallbackContent> {
    console.log('AI service down, using static content');

    const staticKey = `${request.grade}_${request.subject}_${request.skill}`;
    const staticContent = this.staticContent.get(staticKey);

    if (staticContent) {
      return {
        content: staticContent,
        source: 'static',
        quality: 'minimal',
        missingFeatures: ['ai-generation', 'personalization', 'dynamic-content'],
        message: 'Using pre-generated static content'
      };
    }

    // Ultimate fallback - basic educational content
    return {
      content: this.getBasicEducationalContent(request),
      source: 'static',
      quality: 'minimal',
      missingFeatures: ['all-advanced-features'],
      message: 'Using basic educational content'
    };
  }

  /**
   * Handle rate limit exceeded
   */
  private async handleRateLimit(request: StudentRequest): Promise<FallbackContent> {
    console.log('Rate limit exceeded, queuing request');

    // Return cached or static content with retry info
    return {
      content: {
        ...this.getBasicEducationalContent(request),
        retryAfter: 60 // seconds
      },
      source: 'static',
      quality: 'minimal',
      missingFeatures: ['real-time-generation'],
      message: 'Rate limit exceeded - please try again in 1 minute'
    };
  }

  /**
   * Handle network errors
   */
  private async handleNetworkError(request: StudentRequest): Promise<FallbackContent> {
    console.log('Network error, using offline content');

    return {
      content: this.getOfflineContent(request),
      source: 'static',
      quality: 'minimal',
      missingFeatures: ['online-features', 'video-content', 'real-time-updates'],
      message: 'Network unavailable - using offline content'
    };
  }

  /**
   * Handle invalid request
   */
  private async handleInvalidRequest(request: StudentRequest): Promise<FallbackContent> {
    console.log('Invalid request, providing default content');

    // Provide default content for the grade level
    return {
      content: this.getDefaultContentForGrade(request.grade),
      source: 'static',
      quality: 'minimal',
      missingFeatures: ['requested-specific-content'],
      message: 'Invalid request - showing default content for your grade'
    };
  }

  /**
   * Handle unknown errors
   */
  private async handleUnknownError(
    request: StudentRequest,
    error: Error
  ): Promise<FallbackContent> {
    console.error('Unknown error in fallback handler:', error);

    return {
      content: this.getSafeDefaultContent(),
      source: 'static',
      quality: 'minimal',
      missingFeatures: ['most-features'],
      message: 'An unexpected error occurred - showing basic content'
    };
  }

  /**
   * Find alternative video from other sources
   */
  private async findAlternativeVideo(request: StudentRequest): Promise<any> {
    // In production, this would check alternative video platforms
    // For now, return null to trigger text fallback
    return null;
  }

  /**
   * Find similar narrative from cache
   */
  private async findSimilarNarrative(request: StudentRequest): Promise<MasterNarrative | null> {
    // In production, search for similar cached narratives
    // For now, return null
    return null;
  }

  /**
   * Adapt existing narrative to new request
   */
  private adaptNarrative(narrative: MasterNarrative, request: StudentRequest): any {
    // Simple adaptation - change names and basic details
    return {
      ...narrative,
      career: { ...narrative.career, title: request.career },
      skill: request.skill,
      grade: request.grade
    };
  }

  /**
   * Generate template-based narrative
   */
  private generateTemplateNarrative(request: StudentRequest): any {
    const templates = {
      'K': {
        intro: 'Welcome to learning time!',
        character: 'Friend',
        setting: 'Learning Place',
        challenge: `Let's practice ${request.skill}`
      },
      'default': {
        intro: 'Time to learn something new!',
        character: 'Helper',
        setting: 'Classroom',
        challenge: `Today we're learning ${request.skill}`
      }
    };

    const template = templates[request.grade] || templates.default;

    return {
      narrative: template,
      career: request.career,
      skill: request.skill
    };
  }

  /**
   * Generate simplified content
   */
  private async generateSimplifiedContent(request: StudentRequest): Promise<any> {
    return {
      experience: {
        hook: `Let's learn ${request.skill}!`,
        duration: '2 minutes'
      },
      discover: {
        prompt: `Explore ${request.skill} concepts`,
        duration: '3 minutes'
      },
      learn: {
        content: `Basic lesson on ${request.skill}`,
        duration: '5 minutes'
      },
      assessment: {
        questions: this.generateBasicQuestions(request),
        duration: '5 minutes'
      }
    };
  }

  /**
   * Generate text-only lesson
   */
  private generateTextOnlyLesson(request: StudentRequest): any {
    return {
      title: `Learning ${request.skill}`,
      introduction: `Today we'll learn about ${request.skill} for ${request.career}s.`,
      content: this.getSkillContent(request.skill),
      practice: `Practice ${request.skill} with these exercises.`,
      summary: `Great job learning ${request.skill}!`
    };
  }

  /**
   * Get basic educational content
   */
  private getBasicEducationalContent(request: StudentRequest): any {
    return {
      lesson: {
        title: request.skill,
        grade: request.grade,
        subject: request.subject,
        content: 'Basic educational content',
        exercises: []
      }
    };
  }

  /**
   * Get offline content
   */
  private getOfflineContent(request: StudentRequest): any {
    return {
      message: 'Offline Mode',
      content: this.staticContent.get(`${request.grade}_offline`) || {
        text: 'Please reconnect to access full content',
        basicLesson: `Practice ${request.skill} on your own`
      }
    };
  }

  /**
   * Get default content for grade
   */
  private getDefaultContentForGrade(grade: string): any {
    const defaults = {
      'K': { content: 'Kindergarten learning activities' },
      '1': { content: 'First grade learning activities' },
      '2': { content: 'Second grade learning activities' }
    };

    return defaults[grade] || { content: 'Grade-appropriate learning activities' };
  }

  /**
   * Get safe default content
   */
  private getSafeDefaultContent(): any {
    return {
      message: 'Learning is fun!',
      activities: [
        'Read a book',
        'Practice counting',
        'Draw a picture',
        'Write a story'
      ]
    };
  }

  /**
   * Get skill-specific content
   */
  private getSkillContent(skill: string): string {
    const content = {
      'Counting to 10': 'Let\'s count: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10!',
      'Addition': 'Adding numbers means putting them together.',
      'Subtraction': 'Subtracting means taking away.',
      'default': `Learning about ${skill}`
    };

    return content[skill] || content.default;
  }

  /**
   * Generate basic assessment questions
   */
  private generateBasicQuestions(request: StudentRequest): any[] {
    return [
      {
        question: `What is ${request.skill}?`,
        type: 'multiple-choice',
        choices: ['Answer A', 'Answer B', 'Answer C'],
        correct: 0
      },
      {
        question: `Practice ${request.skill}`,
        type: 'practice',
        instruction: 'Follow the instructions'
      }
    ];
  }

  /**
   * Initialize static content library
   */
  private initializeStaticContent(): void {
    // Pre-load essential static content
    this.staticContent.set('K_Math_Counting to 10', {
      lesson: 'Count from 1 to 10',
      practice: 'Count objects',
      assessment: 'How many do you see?'
    });

    this.staticContent.set('1_Math_Addition', {
      lesson: 'Adding numbers together',
      practice: '2 + 3 = ?',
      assessment: 'Solve addition problems'
    });

    // Add more static content as needed
    console.log('Static fallback content initialized');
  }

  /**
   * Check health of fallback systems
   */
  async healthCheck(): Promise<{
    staticContent: boolean;
    alternativeServices: { [key: string]: boolean };
  }> {
    return {
      staticContent: this.staticContent.size > 0,
      alternativeServices: {
        video: false, // Would check alternative video services
        ai: false,    // Would check backup AI services
        cache: true   // Memory cache always available
      }
    };
  }
}

// Export singleton instance
export const fallbackHandler = new FallbackHandler();