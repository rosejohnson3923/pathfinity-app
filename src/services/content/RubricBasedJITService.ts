/**
 * Rubric-Based JIT Service
 *
 * Integrates Data Rubrics with JIT content generation.
 * Uses rubric prompts for story-consistent content generation.
 *
 * Phase 3 Implementation
 */

import type {
  DataRubric
} from '../../types/RubricTypes';
import type {
  ContainerType,
  Subject
} from '../../types/MasterNarrativeTypes';
import { getRubricStorage } from '../storage/RubricStorageService';
import { storyConsistencyValidator } from '../rubric/StoryConsistencyValidator';
import { MultiModelService } from '../ai-models/MultiModelService';
import { getAdaptiveContentService } from '../adaptive/AdaptiveContentService';

/**
 * Rubric-based JIT content request
 */
export interface RubricJITRequest {
  sessionId: string;
  container: ContainerType;
  subject: Subject;
  userId: string;
  forceRegenerate?: boolean;
}

/**
 * Generated content from rubric
 */
export interface RubricGeneratedContent {
  rubric: DataRubric;
  content: any;
  validated: boolean;
  validationErrors: string[];
  generatedAt: string;
  generationTime: number;
}

/**
 * Rubric-Based JIT Service
 * Generates content using Data Rubric prompts
 */
export class RubricBasedJITService {
  private static instance: RubricBasedJITService;
  private rubricStorage = getRubricStorage();

  private constructor() {}

  public static getInstance(): RubricBasedJITService {
    if (!RubricBasedJITService.instance) {
      RubricBasedJITService.instance = new RubricBasedJITService();
    }
    return RubricBasedJITService.instance;
  }

  /**
   * Generate container content using Data Rubric
   * Main entry point for rubric-based content generation
   */
  async generateContentFromRubric(
    request: RubricJITRequest
  ): Promise<RubricGeneratedContent | null> {
    const startTime = Date.now();

    try {
      // Step 1: Fetch Data Rubric from storage
      const rubric = await this.rubricStorage.getDataRubric(
        request.sessionId,
        request.container,
        request.subject
      );

      if (!rubric) {
        console.error(`❌ [Rubric JIT] Data Rubric not found: ${request.container}-${request.subject}`);
        return null;
      }

      console.log(`📚 [Rubric JIT] Using rubric with skill: ${rubric.skill.name}`);

      // Step 2: Check if content already generated (unless forcing regeneration)
      if (!request.forceRegenerate && rubric.generatedContent) {
        return {
          rubric,
          content: rubric.generatedContent,
          validated: true,
          validationErrors: [],
          generatedAt: rubric.completedAt || new Date().toISOString(),
          generationTime: 0
        };
      }

      // Step 3: Generate content using rubric's JIT prompt
      const generatedContent = await this.generateUsingRubricPrompt(rubric);

      if (!generatedContent) {
        console.error(`❌ [Rubric JIT] Content generation failed`);
        return null;
      }

      // Step 4: Validate generated content against rubric requirements
      const validationResult = storyConsistencyValidator.validateGeneratedContent({
        ...rubric,
        generatedContent
      });

      // Step 5: Save generated content back to rubric
      const updatedRubric: DataRubric = {
        ...rubric,
        generatedContent,
        completedAt: new Date().toISOString(),
        performance: null // Will be populated after student completes
      };

      await this.rubricStorage.updateDataRubric(updatedRubric);

      const generationTime = Date.now() - startTime;

      return {
        rubric: updatedRubric,
        content: generatedContent,
        validated: validationResult.isValid,
        validationErrors: validationResult.errors,
        generatedAt: updatedRubric.completedAt!,
        generationTime
      };

    } catch (error) {
      console.error(`❌ [Rubric JIT] Error generating content:`, error);
      return null;
    }
  }

  /**
   * Generate content using rubric's JIT prompt
   * Calls AI service with rubric-defined prompt
   */
  private async generateUsingRubricPrompt(
    rubric: DataRubric
  ): Promise<any> {
    try {
      // Use MultiModelService for AI generation
      const multiModelService = MultiModelService.getInstance();

      // Build the full prompt from rubric
      const fullPrompt = this.buildFullPrompt(rubric);

      // Call AI service
      const result = await multiModelService.generateContent(
        `${rubric.jitPrompt.systemPrompt}\n\n${fullPrompt}`,
        {
          taskType: rubric.container, // 'LEARN', 'EXPERIENCE', or 'DISCOVER'
          responseFormat: 'json'
        } as any
      );

      // Parse JSON response from GenerationResult
      const responseText = typeof result.content === 'string'
        ? result.content
        : JSON.stringify(result.content);

      const generatedContent = this.parseAIResponse(responseText, rubric.container);

      return generatedContent;

    } catch (error) {
      console.error(`❌ [Rubric JIT] AI generation failed:`, error);
      throw error;
    }
  }

  /**
   * Build full prompt from rubric
   * Substitutes variables in user prompt
   */
  private buildFullPrompt(rubric: DataRubric): string {
    let prompt = rubric.jitPrompt.userPrompt;

    // Substitute variables
    Object.entries(rubric.jitPrompt.variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return prompt;
  }

  /**
   * Parse AI response into structured content
   * Validates response matches container requirements
   */
  private parseAIResponse(response: string, container: ContainerType): any {
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = response.trim();

      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```\n?/g, '').replace(/```\n?$/g, '');
      }

      const parsed = JSON.parse(jsonStr);

      // Validate structure matches container type
      this.validateContentStructure(parsed, container);

      return parsed;

    } catch (error) {
      console.error(`❌ [Rubric JIT] Failed to parse AI response:`, error);
      console.error(`Response was:`, response.substring(0, 500));
      throw new Error(`Invalid JSON response from AI: ${error.message}`);
    }
  }

  /**
   * Validate content structure matches container requirements
   */
  private validateContentStructure(content: any, container: ContainerType): void {
    switch (container) {
      case 'LEARN':
        // Validate practice questions (array of 3)
        if (!Array.isArray(content.practice) || content.practice.length !== 3) {
          throw new Error('LEARN content must have exactly 3 practice questions');
        }
        // Validate assessment (single object, not array)
        if (!content.assessment || typeof content.assessment !== 'object' || Array.isArray(content.assessment)) {
          throw new Error('LEARN content must have assessment as a single object');
        }
        // Validate assessment has required fields
        if (!content.assessment.question || !content.assessment.type) {
          throw new Error('LEARN assessment must have question and type fields');
        }
        break;

      case 'EXPERIENCE':
        if (!content.scenarios) {
          throw new Error('EXPERIENCE content missing scenarios');
        }
        if (!Array.isArray(content.scenarios.examples) || content.scenarios.examples.length !== 3) {
          throw new Error('EXPERIENCE content must have exactly 3 example scenarios');
        }
        if (!Array.isArray(content.scenarios.practice) || content.scenarios.practice.length !== 2) {
          throw new Error('EXPERIENCE content must have exactly 2 practice scenarios');
        }
        if (!Array.isArray(content.scenarios.assessment) || content.scenarios.assessment.length !== 1) {
          throw new Error('EXPERIENCE content must have exactly 1 assessment scenario');
        }
        break;

      case 'DISCOVER':
        if (!content.unifiedScenario) {
          throw new Error('DISCOVER content missing unifiedScenario');
        }
        if (!Array.isArray(content.discoveryStations) || content.discoveryStations.length !== 4) {
          throw new Error('DISCOVER content must have exactly 4 discovery stations');
        }
        break;

      default:
        throw new Error(`Unknown container type: ${container}`);
    }
  }

  /**
   * Update rubric with performance data after completion
   * Called when student completes a container
   */
  async recordContainerCompletion(
    sessionId: string,
    container: ContainerType,
    subject: Subject,
    performanceData: {
      score: number;
      attempts: number;
      timeSpent: number;
      struggledQuestions: string[];
    }
  ): Promise<void> {
    try {
      // Fetch rubric
      const rubric = await this.rubricStorage.getDataRubric(sessionId, container, subject);

      if (!rubric) {
        console.error(`❌ [Rubric JIT] Rubric not found for completion recording`);
        return;
      }

      // Update performance data
      const updatedRubric: DataRubric = {
        ...rubric,
        completedAt: new Date().toISOString(),
        performance: {
          ...performanceData,
          completedAt: new Date().toISOString()
        }
      };

      // Save updated rubric
      await this.rubricStorage.updateDataRubric(updatedRubric);

      // Update next container's rubric with adaptation data (Phase 5)
      await this.updateNextContainerAdaptation(sessionId, container, subject, updatedRubric);

    } catch (error) {
      console.error(`❌ [Rubric JIT] Error recording completion:`, error);
    }
  }

  /**
   * Update next container's rubric with adaptation data
   * Implements adaptive content flow (Phase 5)
   * Uses AdaptiveContentService for sophisticated adaptation
   */
  private async updateNextContainerAdaptation(
    sessionId: string,
    completedContainer: ContainerType,
    subject: Subject,
    completedRubric: DataRubric
  ): Promise<void> {
    try {
      // Determine next container
      const nextContainer = this.getNextContainer(completedContainer);

      if (!nextContainer) {
        return;
      }

      // Use AdaptiveContentService to generate sophisticated strategy
      const adaptiveService = getAdaptiveContentService();

      // Build performance metrics from completed rubric
      const performanceMetrics = {
        score: completedRubric.performance?.score || 0,
        attempts: completedRubric.performance?.attempts || 0,
        timeSpent: completedRubric.performance?.timeSpent || 0,
        struggledQuestions: completedRubric.performance?.struggledQuestions || [],
        completedAt: completedRubric.completedAt || new Date().toISOString(),
        container: completedContainer,
        subject
      };

      // Generate adaptation strategy
      const strategy = await adaptiveService.generateAdaptationStrategy(
        sessionId,
        performanceMetrics,
        nextContainer,
        subject
      );

      // Apply strategy to next container's rubric
      await adaptiveService.applyAdaptationToRubric(
        sessionId,
        nextContainer,
        subject,
        strategy
      );

    } catch (error) {
      console.error(`❌ [Rubric JIT] Error updating next container adaptation:`, error);
    }
  }

  /**
   * Get next container in progression
   */
  private getNextContainer(current: ContainerType): ContainerType | null {
    const progression: Record<ContainerType, ContainerType | null> = {
      'LEARN': 'EXPERIENCE',
      'EXPERIENCE': 'DISCOVER',
      'DISCOVER': null // No next container
    };

    return progression[current];
  }

  /**
   * Batch generate all content for a session
   * Useful for testing or pre-generation
   */
  async generateAllContentForSession(
    sessionId: string
  ): Promise<{
    generated: number;
    failed: number;
    results: RubricGeneratedContent[];
  }> {
    const containers: ContainerType[] = ['LEARN', 'EXPERIENCE', 'DISCOVER'];
    const subjects: Subject[] = ['Math', 'ELA', 'Science', 'Social Studies'];

    const results: RubricGeneratedContent[] = [];
    let generated = 0;
    let failed = 0;

    for (const container of containers) {
      for (const subject of subjects) {
        try {
          const result = await this.generateContentFromRubric({
            sessionId,
            container,
            subject,
            userId: sessionId, // Using sessionId as userId for batch generation
            forceRegenerate: false
          });

          if (result) {
            results.push(result);
            generated++;
          } else {
            failed++;
          }
        } catch (error) {
          console.error(`❌ [Rubric JIT] Failed to generate ${container}-${subject}:`, error);
          failed++;
        }
      }
    }

    return { generated, failed, results };
  }

  /**
   * Clear generated content from rubric
   * Useful for testing regeneration
   */
  async clearGeneratedContent(
    sessionId: string,
    container: ContainerType,
    subject: Subject
  ): Promise<void> {
    const rubric = await this.rubricStorage.getDataRubric(sessionId, container, subject);

    if (!rubric) {
      console.warn(`⚠️ [Rubric JIT] Rubric not found: ${container}-${subject}`);
      return;
    }

    const clearedRubric: DataRubric = {
      ...rubric,
      generatedContent: null,
      completedAt: null,
      performance: null
    };

    await this.rubricStorage.updateDataRubric(clearedRubric);
  }
}

// Export singleton instance getter
export const getRubricBasedJITService = () => RubricBasedJITService.getInstance();
