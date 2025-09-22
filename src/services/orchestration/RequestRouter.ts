/**
 * Request Router
 * Determines optimal generation strategy based on request characteristics
 * Routes to appropriate services and strategies
 * Part of the Narrative-First Architecture - Phase 4
 */

import { StudentRequest } from './ContentOrchestrator';

export type GenerationStrategy =
  | 'narrative-first'      // Full narrative approach (K-5)
  | 'hybrid'               // Mix of narrative and traditional (6-8)
  | 'traditional-enhanced' // Traditional with narrative touches (9-12)
  | 'fast-cache'          // Use cached content only
  | 'youtube-priority'    // Prioritize YouTube content
  | 'text-only'          // No video content
  | 'assessment-focus';  // Focus on practice/assessment

export interface RoutingDecision {
  strategy: GenerationStrategy;
  priority: 'speed' | 'quality' | 'cost';
  services: {
    useNarrative: boolean;
    useYouTube: boolean;
    useDualMode: boolean;
    generateAllContainers: boolean;
  };
  optimizations: {
    parallelFetch: boolean;
    cacheOnly: boolean;
    skipEnhancements: boolean;
  };
  reasoning: string;
}

export class RequestRouter {
  /**
   * Main routing decision based on request
   */
  route(request: StudentRequest): RoutingDecision {
    // Determine base strategy by grade
    const baseStrategy = this.determineBaseStrategy(request);

    // Check for special conditions
    if (this.shouldUseFastCache(request)) {
      return this.createFastCacheDecision(request);
    }

    if (this.shouldPrioritizeYouTube(request)) {
      return this.createYouTubePriorityDecision(request);
    }

    if (this.shouldUseTextOnly(request)) {
      return this.createTextOnlyDecision(request);
    }

    // Return standard routing for grade level
    return this.createStandardDecision(request, baseStrategy);
  }

  /**
   * Determine base strategy by grade
   */
  private determineBaseStrategy(request: StudentRequest): GenerationStrategy {
    const grade = request.grade.toUpperCase();
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);

    // K-2: Full narrative immersion
    if (gradeNum <= 2) {
      return 'narrative-first';
    }

    // 3-5: Still narrative-focused but can handle more
    if (gradeNum <= 5) {
      return 'narrative-first';
    }

    // 6-8: Hybrid approach
    if (gradeNum <= 8) {
      return 'hybrid';
    }

    // 9-12: Traditional with narrative enhancements
    return 'traditional-enhanced';
  }

  /**
   * Check if we should use fast cache-only approach
   */
  private shouldUseFastCache(request: StudentRequest): boolean {
    // Use fast cache for:
    // - Review sessions
    // - Time-constrained situations
    // - Popular skill/career combinations

    if (request.preferences?.timeAvailable && request.preferences.timeAvailable < 5) {
      return true; // Less than 5 minutes available
    }

    if (request.context?.previousLesson === request.skill) {
      return true; // Reviewing same skill
    }

    // Check if this is a highly popular combination
    const popularCombos = [
      'Marine Biologist-K-Math-Counting to 10',
      'Doctor-K-Math-Counting to 10',
      'Teacher-1-Reading-Sight Words'
    ];

    const combo = `${request.career}-${request.grade}-${request.subject}-${request.skill}`;
    return popularCombos.includes(combo);
  }

  /**
   * Check if we should prioritize YouTube
   */
  private shouldPrioritizeYouTube(request: StudentRequest): boolean {
    // Prioritize YouTube for:
    // - Visual learners
    // - Complex demonstrations
    // - When specifically requested

    if (request.preferences?.learningMode === 'video') {
      return true;
    }

    // Subjects that benefit from video
    const videoSubjects = ['Science', 'Art', 'Music', 'PE'];
    return videoSubjects.includes(request.subject);
  }

  /**
   * Check if we should use text-only
   */
  private shouldUseTextOnly(request: StudentRequest): boolean {
    // Text-only for:
    // - Accessibility needs
    // - No audio environments
    // - Reading-focused subjects

    if (request.preferences?.learningMode === 'text') {
      return true;
    }

    return request.subject === 'Reading' && !request.skill.includes('Phonics');
  }

  /**
   * Create fast cache decision
   */
  private createFastCacheDecision(request: StudentRequest): RoutingDecision {
    return {
      strategy: 'fast-cache',
      priority: 'speed',
      services: {
        useNarrative: true,
        useYouTube: false,
        useDualMode: false,
        generateAllContainers: true
      },
      optimizations: {
        parallelFetch: false,
        cacheOnly: true,
        skipEnhancements: true
      },
      reasoning: 'Using cached content for speed - time constrained or review session'
    };
  }

  /**
   * Create YouTube priority decision
   */
  private createYouTubePriorityDecision(request: StudentRequest): RoutingDecision {
    return {
      strategy: 'youtube-priority',
      priority: 'quality',
      services: {
        useNarrative: true,
        useYouTube: true,
        useDualMode: true,
        generateAllContainers: true
      },
      optimizations: {
        parallelFetch: true,
        cacheOnly: false,
        skipEnhancements: false
      },
      reasoning: `Prioritizing video content for ${request.subject} - visual learning optimal`
    };
  }

  /**
   * Create text-only decision
   */
  private createTextOnlyDecision(request: StudentRequest): RoutingDecision {
    return {
      strategy: 'text-only',
      priority: 'quality',
      services: {
        useNarrative: true,
        useYouTube: false,
        useDualMode: false,
        generateAllContainers: true
      },
      optimizations: {
        parallelFetch: false,
        cacheOnly: false,
        skipEnhancements: false
      },
      reasoning: 'Text-only mode for accessibility or reading focus'
    };
  }

  /**
   * Create standard routing decision
   */
  private createStandardDecision(
    request: StudentRequest,
    strategy: GenerationStrategy
  ): RoutingDecision {
    const decisions: { [key in GenerationStrategy]: RoutingDecision } = {
      'narrative-first': {
        strategy: 'narrative-first',
        priority: 'quality',
        services: {
          useNarrative: true,
          useYouTube: true,
          useDualMode: true,
          generateAllContainers: true
        },
        optimizations: {
          parallelFetch: true,
          cacheOnly: false,
          skipEnhancements: false
        },
        reasoning: `Full narrative approach for ${request.grade} grade - maximum engagement`
      },

      'hybrid': {
        strategy: 'hybrid',
        priority: 'cost',
        services: {
          useNarrative: true,
          useYouTube: true,
          useDualMode: false,
          generateAllContainers: true
        },
        optimizations: {
          parallelFetch: true,
          cacheOnly: false,
          skipEnhancements: true
        },
        reasoning: `Hybrid approach for ${request.grade} grade - balancing engagement and efficiency`
      },

      'traditional-enhanced': {
        strategy: 'traditional-enhanced',
        priority: 'cost',
        services: {
          useNarrative: false,
          useYouTube: true,
          useDualMode: false,
          generateAllContainers: false
        },
        optimizations: {
          parallelFetch: false,
          cacheOnly: false,
          skipEnhancements: true
        },
        reasoning: `Traditional with enhancements for ${request.grade} grade - focus on content`
      },

      'fast-cache': this.createFastCacheDecision(request),
      'youtube-priority': this.createYouTubePriorityDecision(request),
      'text-only': this.createTextOnlyDecision(request),
      'assessment-focus': this.createAssessmentFocusDecision(request)
    };

    return decisions[strategy];
  }

  /**
   * Create assessment-focused decision
   */
  private createAssessmentFocusDecision(request: StudentRequest): RoutingDecision {
    return {
      strategy: 'assessment-focus',
      priority: 'speed',
      services: {
        useNarrative: true,
        useYouTube: false,
        useDualMode: false,
        generateAllContainers: false // Only assessment
      },
      optimizations: {
        parallelFetch: false,
        cacheOnly: true,
        skipEnhancements: true
      },
      reasoning: 'Assessment focus - practice and evaluation priority'
    };
  }

  /**
   * Get recommendation for A/B testing
   */
  getABTestRecommendation(request: StudentRequest): {
    control: RoutingDecision;
    variant: RoutingDecision;
    testMetric: string;
  } {
    const control = this.route(request);

    // Create variant with different strategy
    const variantRequest = { ...request };
    const variant = control.strategy === 'narrative-first'
      ? this.createStandardDecision(request, 'hybrid')
      : this.createStandardDecision(request, 'narrative-first');

    return {
      control,
      variant,
      testMetric: 'engagement_duration' // What to measure
    };
  }

  /**
   * Route batch of requests optimally
   */
  routeBatch(requests: StudentRequest[]): Map<StudentRequest, RoutingDecision> {
    const decisions = new Map<StudentRequest, RoutingDecision>();

    // Group by similar characteristics for optimization
    const groups = this.groupRequests(requests);

    for (const [key, group] of groups) {
      // Pre-warm caches for group
      const groupDecision = this.route(group[0]);

      for (const request of group) {
        decisions.set(request, {
          ...groupDecision,
          reasoning: `Batch optimized: ${groupDecision.reasoning}`
        });
      }
    }

    return decisions;
  }

  /**
   * Group similar requests for batch optimization
   */
  private groupRequests(requests: StudentRequest[]): Map<string, StudentRequest[]> {
    const groups = new Map<string, StudentRequest[]>();

    for (const request of requests) {
      const key = `${request.grade}_${request.subject}_${request.skill}`;
      const group = groups.get(key) || [];
      group.push(request);
      groups.set(key, group);
    }

    return groups;
  }

  /**
   * Determine if request should be pre-cached
   */
  shouldPreCache(request: StudentRequest): boolean {
    // Pre-cache for common combinations
    const commonGrades = ['K', '1', '2', '3'];
    const commonSubjects = ['Math', 'Reading'];
    const commonCareers = ['Marine Biologist', 'Doctor', 'Teacher', 'Astronaut'];

    return (
      commonGrades.includes(request.grade) &&
      commonSubjects.includes(request.subject) &&
      commonCareers.includes(request.career)
    );
  }
}

// Export singleton instance
export const requestRouter = new RequestRouter();