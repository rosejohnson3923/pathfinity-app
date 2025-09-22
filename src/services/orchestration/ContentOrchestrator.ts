/**
 * Content Orchestrator
 * Coordinates all services to generate complete learning experiences
 * This is the main entry point that ties everything together
 * Part of the Narrative-First Architecture - Phase 4
 */

import { narrativeCache } from '../narrative/NarrativeCache';
import { youTubeService } from '../content-providers/YouTubeService';
import { videoSelector } from '../content-providers/VideoSelector';
import { dualModeContent } from '../content-providers/DualModeContent';

import { experienceMicroGenerator } from '../micro-generators/ExperienceMicroGenerator';
import { discoverMicroGenerator } from '../micro-generators/DiscoverMicroGenerator';
import { learnMicroGenerator } from '../micro-generators/LearnMicroGenerator';
import { assessmentMicroGenerator } from '../micro-generators/AssessmentMicroGenerator';

import { MasterNarrative, NarrativeGenerationParams } from '../narrative/NarrativeSchema';
import { YouTubeVideo } from '../content-providers/types';

export interface StudentRequest {
  studentId: string;
  studentName?: string;
  grade: string;                 // K, 1, 2, etc.
  career: string;                // Marine Biologist, Doctor, etc.
  subject: string;               // Math, Science, Reading
  skill: string;                 // Counting to 10, Addition, etc.
  preferences?: {
    learningMode?: 'video' | 'text' | 'dual';
    difficulty?: 'easy' | 'medium' | 'hard';
    timeAvailable?: number;      // minutes
  };
  context?: {
    previousLesson?: string;
    strugglingAreas?: string[];
    strongAreas?: string[];
  };
}

export interface AllContainers {
  experience: any;               // Experience container content
  discover: any;                 // Discover container content
  learn: any;                    // Learn container content
  assessment: any;               // Assessment container content
  metadata: {
    generationTime: number;      // milliseconds
    strategy: string;            // narrative-first, hybrid, etc.
    cacheHit: boolean;
    youtubeUsed: boolean;
    totalCost: number;
    debugInfo?: any;
  };
}

export interface OrchestrationMetrics {
  totalRequests: number;
  averageLatency: number;
  cacheHitRate: number;
  youtubeSuccessRate: number;
  costPerRequest: number;
  errorRate: number;
  popularCareers: { career: string; count: number }[];
  gradeDistribution: { grade: string; count: number }[];
}

export class ContentOrchestrator {
  private metrics: OrchestrationMetrics = {
    totalRequests: 0,
    averageLatency: 0,
    cacheHitRate: 0,
    youtubeSuccessRate: 0,
    costPerRequest: 0,
    errorRate: 0,
    popularCareers: [],
    gradeDistribution: []
  };

  private requestCounts = new Map<string, number>();
  private gradeCounts = new Map<string, number>();
  private totalLatency = 0;
  private cacheHits = 0;
  private youtubeSuccess = 0;
  private youtubeFails = 0;
  private errors = 0;

  /**
   * Main entry point - generates all containers for a student request
   */
  async generateFullExperience(request: StudentRequest): Promise<AllContainers> {
    const startTime = Date.now();
    let cacheHit = false;
    let youtubeUsed = false;
    let totalCost = 0;

    try {
      console.log(`Orchestrating content for ${request.studentName || request.studentId}:`,
        `${request.grade} grade, ${request.career}, ${request.subject} - ${request.skill}`);

      // Step 1: Get or generate master narrative
      const narrativeParams: NarrativeGenerationParams = {
        career: request.career,
        grade: request.grade,
        subject: request.subject,
        skill: request.skill,
        additionalContext: {
          studentName: request.studentName,
          difficulty: request.preferences?.difficulty
        }
      };

      const narrative = await narrativeCache.getNarrative(narrativeParams);
      cacheHit = this.wasaCacheHit(narrative);

      if (!cacheHit) {
        totalCost += 0.00125; // Master narrative generation cost
        console.log('Generated new narrative');
      } else {
        this.cacheHits++;
        console.log('Using cached narrative');
      }

      // Step 2: Fetch YouTube content in parallel with narrative
      let youtubeVideo: YouTubeVideo | null = null;
      let transcript: any[] = [];

      try {
        const [searchResults, _] = await Promise.all([
          youTubeService.searchEducationalVideos(
            request.grade,
            request.subject,
            request.skill
          ),
          // Can add other parallel operations here
          Promise.resolve()
        ]);

        if (searchResults && searchResults.videos.length > 0) {
          youtubeVideo = await youTubeService.selectOptimalVideo(
            searchResults.videos,
            request.grade
          );

          if (youtubeVideo) {
            youtubeUsed = true;
            this.youtubeSuccess++;
            transcript = await youTubeService.getTranscript(youtubeVideo.id);
            console.log(`Selected YouTube video: ${youtubeVideo.title}`);
          }
        }
      } catch (error) {
        console.warn('YouTube fetch failed, continuing without video:', error);
        this.youtubeFails++;
      }

      // Step 3: Generate all containers in parallel
      const [experience, discover, learn, assessment] = await Promise.all([
        this.generateExperience(narrative),
        this.generateDiscover(narrative),
        this.generateLearn(narrative, youtubeVideo, request.preferences?.learningMode),
        this.generateAssessment(narrative, youtubeVideo, transcript)
      ]);

      // Add micro-generator costs (very small)
      totalCost += 0.00006; // 4 micro-generators

      // Step 4: Record metrics
      const generationTime = Date.now() - startTime;
      this.updateMetrics(request, generationTime, totalCost, false);

      return {
        experience,
        discover,
        learn,
        assessment,
        metadata: {
          generationTime,
          strategy: this.determineStrategy(request.grade),
          cacheHit,
          youtubeUsed,
          totalCost,
          debugInfo: {
            narrativeId: narrative.id,
            videoId: youtubeVideo?.id,
            grade: request.grade,
            career: request.career
          }
        }
      };

    } catch (error) {
      this.errors++;
      console.error('Orchestration failed:', error);

      // Fallback to basic content
      return this.generateFallbackContent(request, error as Error);
    }
  }

  /**
   * Generate EXPERIENCE container
   */
  private async generateExperience(narrative: MasterNarrative): Promise<any> {
    return experienceMicroGenerator.generate(narrative);
  }

  /**
   * Generate DISCOVER container
   */
  private async generateDiscover(narrative: MasterNarrative): Promise<any> {
    return discoverMicroGenerator.generate(narrative);
  }

  /**
   * Generate LEARN container with YouTube integration
   */
  private async generateLearn(
    narrative: MasterNarrative,
    youtubeVideo: YouTubeVideo | null,
    preferredMode?: 'video' | 'text' | 'dual'
  ): Promise<any> {
    return learnMicroGenerator.generate(
      narrative,
      youtubeVideo || undefined,
      preferredMode || 'dual'
    );
  }

  /**
   * Generate ASSESSMENT container
   */
  private async generateAssessment(
    narrative: MasterNarrative,
    youtubeVideo: YouTubeVideo | null,
    transcript: any[]
  ): Promise<any> {
    return assessmentMicroGenerator.generate(
      narrative,
      youtubeVideo || undefined,
      transcript.length > 0 ? transcript : undefined,
      5 // Generate 5 questions
    );
  }

  /**
   * Determine generation strategy based on grade
   */
  private determineStrategy(grade: string): string {
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);

    if (gradeNum <= 5) {
      return 'narrative-first'; // Full narrative approach
    } else if (gradeNum <= 8) {
      return 'hybrid'; // Mix of narrative and traditional
    } else {
      return 'traditional-enhanced'; // Traditional with narrative touches
    }
  }

  /**
   * Check if narrative came from cache
   */
  private wasaCacheHit(narrative: MasterNarrative): boolean {
    // Check if narrative was generated recently (within last second)
    const generatedTime = new Date(narrative.generatedAt).getTime();
    const now = Date.now();
    return (now - generatedTime) > 1000; // If older than 1 second, it was cached
  }

  /**
   * Update metrics
   */
  private updateMetrics(
    request: StudentRequest,
    latency: number,
    cost: number,
    isError: boolean
  ): void {
    this.metrics.totalRequests++;

    // Update latency
    this.totalLatency += latency;
    this.metrics.averageLatency = this.totalLatency / this.metrics.totalRequests;

    // Update cache hit rate
    this.metrics.cacheHitRate = this.cacheHits / this.metrics.totalRequests;

    // Update YouTube success rate
    const youtubeAttempts = this.youtubeSuccess + this.youtubeFails;
    this.metrics.youtubeSuccessRate = youtubeAttempts > 0
      ? this.youtubeSuccess / youtubeAttempts
      : 0;

    // Update cost
    this.metrics.costPerRequest =
      ((this.metrics.costPerRequest * (this.metrics.totalRequests - 1)) + cost) /
      this.metrics.totalRequests;

    // Update error rate
    if (isError) this.errors++;
    this.metrics.errorRate = this.errors / this.metrics.totalRequests;

    // Track popular careers
    const careerCount = this.requestCounts.get(request.career) || 0;
    this.requestCounts.set(request.career, careerCount + 1);

    // Track grade distribution
    const gradeCount = this.gradeCounts.get(request.grade) || 0;
    this.gradeCounts.set(request.grade, gradeCount + 1);

    // Update popular careers list
    this.metrics.popularCareers = Array.from(this.requestCounts.entries())
      .map(([career, count]) => ({ career, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Update grade distribution
    this.metrics.gradeDistribution = Array.from(this.gradeCounts.entries())
      .map(([grade, count]) => ({ grade, count }))
      .sort((a, b) => a.grade.localeCompare(b.grade));
  }

  /**
   * Generate fallback content when main generation fails
   */
  private async generateFallbackContent(
    request: StudentRequest,
    error: Error
  ): Promise<AllContainers> {
    console.log('Generating fallback content due to error:', error.message);

    // Create minimal content without external dependencies
    const fallbackNarrative = this.createFallbackNarrative(request);

    const [experience, discover, learn, assessment] = await Promise.all([
      this.generateExperience(fallbackNarrative),
      this.generateDiscover(fallbackNarrative),
      this.generateLearn(fallbackNarrative, null),
      this.generateAssessment(fallbackNarrative, null, [])
    ]);

    return {
      experience,
      discover,
      learn,
      assessment,
      metadata: {
        generationTime: 100,
        strategy: 'fallback',
        cacheHit: false,
        youtubeUsed: false,
        totalCost: 0.00001,
        debugInfo: {
          error: error.message,
          fallback: true
        }
      }
    };
  }

  /**
   * Create a basic fallback narrative
   */
  private createFallbackNarrative(request: StudentRequest): MasterNarrative {
    // Return a basic narrative structure
    // In production, this would be more sophisticated
    return {
      id: `fallback_${Date.now()}`,
      career: {
        title: request.career,
        field: 'General',
        setting: 'Workplace',
        tools: ['Tool 1', 'Tool 2'],
        dailyActivities: ['Working', 'Learning'],
        impactStatement: 'Making a difference',
        funFact: 'This career is important'
      },
      grade: request.grade,
      subject: request.subject,
      skill: request.skill,
      generatedAt: new Date(),
      version: 1,
      protagonist: {
        name: 'Alex',
        age: '25',
        role: `Junior ${request.career}`,
        personality: ['curious', 'helpful'],
        motivation: 'Loves learning'
      },
      setting: {
        location: 'Learning Center',
        environment: 'A place of discovery',
        timeOfDay: 'Morning',
        atmosphere: 'Exciting',
        sensoryDetails: {
          sights: ['books', 'computers'],
          sounds: ['learning', 'discovery']
        }
      },
      journey: {
        hook: 'Let\'s learn something new!',
        incitingIncident: 'A challenge appears',
        risingAction: ['Step 1', 'Step 2'],
        climax: 'The learning moment',
        resolution: 'Success!',
        conclusion: 'You learned it!'
      },
      challenges: [{
        description: 'Learn the skill',
        careerRelevance: 'Important for work',
        requiredSkill: request.skill,
        stakes: 'Need to learn',
        successOutcome: 'Mastery achieved'
      }],
      skillsMap: {
        [request.skill]: {
          careerApplication: 'Used daily',
          realWorldExample: 'In practice',
          whyItMatters: 'Essential skill'
        }
      },
      vocabulary: {
        academic: {},
        career: {}
      },
      visuals: {
        colorPalette: ['blue', 'green'],
        iconography: ['book', 'star'],
        backgroundElements: ['classroom'],
        characterAppearance: {
          outfit: 'Professional',
          accessories: ['notebook']
        }
      },
      snippets: {
        introductions: ['Welcome!'],
        transitions: ['Next...'],
        encouragements: ['Great job!'],
        conclusions: ['Well done!'],
        careerConnections: ['Just like pros!']
      },
      adaptations: {
        forVideoIntro: 'Let\'s learn!',
        forAssessment: 'Test time!',
        forPractice: 'Practice makes perfect!',
        forExploration: 'Explore and discover!'
      }
    } as MasterNarrative;
  }

  /**
   * Get current metrics
   */
  getMetrics(): OrchestrationMetrics {
    return { ...this.metrics };
  }

  /**
   * Warm up system for a classroom
   */
  async warmupForClassroom(
    grade: string,
    careers: string[],
    subjects: string[] = ['Math', 'Science', 'Reading']
  ): Promise<void> {
    console.log(`Warming up system for grade ${grade} with careers:`, careers);

    // Pre-generate narratives
    await narrativeCache.warmupForClassroom(grade, careers);

    // Pre-fetch popular YouTube videos
    for (const subject of subjects) {
      for (const career of careers.slice(0, 3)) {
        try {
          await youTubeService.searchEducationalVideos(
            grade,
            subject,
            this.getCommonSkillForGrade(grade, subject)
          );
        } catch (error) {
          console.warn(`Warmup fetch failed for ${grade}-${subject}:`, error);
        }
      }
    }

    console.log('System warmup complete');
  }

  /**
   * Get common skill for grade/subject
   */
  private getCommonSkillForGrade(grade: string, subject: string): string {
    const skills: { [key: string]: { [key: string]: string } } = {
      'K': {
        'Math': 'Counting to 10',
        'Science': 'Living Things',
        'Reading': 'Letter Recognition'
      },
      '1': {
        'Math': 'Addition to 20',
        'Science': 'Weather',
        'Reading': 'Sight Words'
      },
      '2': {
        'Math': 'Subtraction',
        'Science': 'Animals',
        'Reading': 'Reading Comprehension'
      }
    };

    return skills[grade]?.[subject] || 'Basic Skills';
  }
}

// Export singleton instance
export const contentOrchestrator = new ContentOrchestrator();