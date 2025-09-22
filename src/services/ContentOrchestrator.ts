/**
 * Content Orchestrator
 * Central service that coordinates Master Narrative generation and all micro-generators
 * Implements the Narrative-First Architecture for 98.9% cost reduction
 */

import { masterNarrativeGenerator, MasterNarrative } from './narrative/MasterNarrativeGenerator';
import { learnMicroGenerator, LearnContainerContent } from './micro-generators/LearnMicroGenerator';
import { experienceMicroGenerator, ExperienceContent } from './micro-generators/ExperienceMicroGenerator';
import { discoverMicroGenerator, DiscoverContent } from './micro-generators/DiscoverMicroGenerator';

/**
 * Complete learning journey content
 */
export interface LearningJourneyContent {
  narrative: MasterNarrative;
  containers: {
    learn: {
      math: LearnContainerContent;
      ela: LearnContainerContent;
      science: LearnContainerContent;
      socialStudies: LearnContainerContent;
    };
    experience: {
      math: ExperienceContent;
      ela: ExperienceContent;
      science: ExperienceContent;
      socialStudies: ExperienceContent;
    };
    discover: {
      math: DiscoverContent;
      ela: DiscoverContent;
      science: DiscoverContent;
      socialStudies: DiscoverContent;
    };
  };
  metadata: {
    totalCost: number;
    generationTime: number;
    costSavings: number;
    timestamp: Date;
  };
}

/**
 * Generation options
 */
export interface GenerationOptions {
  studentName: string;
  gradeLevel: string;
  career: string;
  subjects?: string[];
  containers?: ('learn' | 'experience' | 'discover')[];
  useCache?: boolean;
}

/**
 * Content Orchestrator Service
 */
export class ContentOrchestrator {
  private narrativeCache: Map<string, MasterNarrative> = new Map();

  /**
   * Generate complete learning journey content
   */
  async generateLearningJourney(options: GenerationOptions): Promise<LearningJourneyContent> {
    const startTime = Date.now();
    console.log('🚀 Starting Learning Journey Generation', options);

    const subjects = options.subjects || ['math', 'ela', 'science', 'socialStudies'];
    const containers = options.containers || ['learn', 'experience', 'discover'];

    // Step 1: Generate or retrieve Master Narrative
    const narrativeCacheKey = `${options.studentName}-${options.career}-${options.gradeLevel}`;
    let narrative: MasterNarrative;

    if (options.useCache && this.narrativeCache.has(narrativeCacheKey)) {
      console.log('📦 Using cached Master Narrative');
      narrative = this.narrativeCache.get(narrativeCacheKey)!;
    } else {
      console.log('🎭 Generating Master Narrative ($0.60)');
      narrative = await masterNarrativeGenerator.generateMasterNarrative({
        studentName: options.studentName,
        gradeLevel: options.gradeLevel,
        career: options.career,
        subjects
      });

      if (options.useCache) {
        this.narrativeCache.set(narrativeCacheKey, narrative);
      }
    }

    // Step 2: Generate content for each container and subject
    const content: LearningJourneyContent = {
      narrative,
      containers: {
        learn: {} as any,
        experience: {} as any,
        discover: {} as any
      },
      metadata: {
        totalCost: narrative.generationCost,
        generationTime: 0,
        costSavings: 0,
        timestamp: new Date()
      }
    };

    // Get skills for each subject (mock data for demo)
    const skills = {
      math: { skillCode: 'K.CC.1', skillName: 'Count to 3', description: 'Count to 3 by ones' },
      ela: { skillCode: 'K.RF.1', skillName: 'Recognize Letters', description: 'Recognize uppercase letters A, B, C' },
      science: { skillCode: 'K.PS.1', skillName: 'Identify Shapes', description: 'Identify circles, squares, triangles' },
      socialStudies: { skillCode: 'K.SS.1', skillName: 'Community Helpers', description: 'Understand how people help each other' }
    };

    // Generate content for each subject and container
    for (const subject of subjects) {
      console.log(`📚 Generating content for ${subject}`);

      if (containers.includes('learn')) {
        content.containers.learn[subject as keyof typeof content.containers.learn] =
          await learnMicroGenerator.generateLearnContent(
            narrative,
            subject,
            skills[subject as keyof typeof skills],
            options.gradeLevel
          );
        content.metadata.totalCost += 0.0015;
      }

      if (containers.includes('experience')) {
        content.containers.experience[subject as keyof typeof content.containers.experience] =
          await experienceMicroGenerator.generateExperienceContent(
            narrative,
            subject,
            skills[subject as keyof typeof skills],
            options.gradeLevel
          );
        content.metadata.totalCost += 0.0005;
      }

      if (containers.includes('discover')) {
        content.containers.discover[subject as keyof typeof content.containers.discover] =
          await discoverMicroGenerator.generateDiscoverContent(
            narrative,
            subject,
            skills[subject as keyof typeof skills],
            options.gradeLevel
          );
        content.metadata.totalCost += 0.0005;
      }
    }

    // Calculate metrics
    const generationTime = Date.now() - startTime;
    content.metadata.generationTime = generationTime;

    // Calculate savings compared to traditional approach
    const traditionalCost = subjects.length * containers.length * 5.00; // $5 per full generation
    content.metadata.costSavings = traditionalCost - content.metadata.totalCost;

    console.log('✅ Learning Journey Generation Complete!');
    console.log(`💰 Total Cost: $${content.metadata.totalCost.toFixed(4)}`);
    console.log(`💵 Saved: $${content.metadata.costSavings.toFixed(2)} (${(content.metadata.costSavings / traditionalCost * 100).toFixed(1)}% reduction)`);
    console.log(`⏱️ Time: ${(generationTime / 1000).toFixed(2)}s`);

    return content;
  }

  /**
   * Generate content for a single container/subject
   */
  async generateSingleContent(
    narrative: MasterNarrative,
    container: 'learn' | 'experience' | 'discover',
    subject: string,
    skill: any,
    gradeLevel: string
  ): Promise<LearnContainerContent | ExperienceContent | DiscoverContent> {
    switch (container) {
      case 'learn':
        return learnMicroGenerator.generateLearnContent(narrative, subject, skill, gradeLevel);
      case 'experience':
        return experienceMicroGenerator.generateExperienceContent(narrative, subject, skill, gradeLevel);
      case 'discover':
        return discoverMicroGenerator.generateDiscoverContent(narrative, subject, skill, gradeLevel);
      default:
        throw new Error(`Unknown container: ${container}`);
    }
  }

  /**
   * Clear narrative cache
   */
  clearCache(): void {
    this.narrativeCache.clear();
    console.log('🗑️ Narrative cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.narrativeCache.size,
      keys: Array.from(this.narrativeCache.keys())
    };
  }

  /**
   * Estimate cost for a learning journey
   */
  estimateCost(options: {
    subjects: number;
    containers: number;
    useCache: boolean;
  }): { total: number; breakdown: any } {
    const masterNarrativeCost = options.useCache ? 0 : 0.60;
    const learnCost = options.subjects * 0.0015;
    const experienceCost = options.subjects * 0.0005;
    const discoverCost = options.subjects * 0.0005;

    const containerCosts = {
      learn: options.containers >= 1 ? learnCost : 0,
      experience: options.containers >= 2 ? experienceCost : 0,
      discover: options.containers >= 3 ? discoverCost : 0
    };

    return {
      total: masterNarrativeCost + Object.values(containerCosts).reduce((a, b) => a + b, 0),
      breakdown: {
        masterNarrative: masterNarrativeCost,
        ...containerCosts
      }
    };
  }
}

// Export singleton instance
export const contentOrchestrator = new ContentOrchestrator();