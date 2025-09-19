/**
 * AI Service Selector
 * Conditionally uses multi-model system or standard Azure OpenAI based on configuration
 */

import { azureOpenAIService } from '../azureOpenAIService';
import { MultiModelService } from './MultiModelService';
import { ModelRouter } from './ModelRouter';
import { getModelForGrade } from './ModelCapabilities';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load multi-model configuration if available
if (typeof window === 'undefined' && fs.existsSync && fs.existsSync('.env.multimodel')) {
  dotenv.config({ path: '.env.multimodel' });
}

export interface AIServiceInterface {
  generateContent(params: ContentGenerationParams): Promise<any>;
  generateAssessmentContent?(params: ContentGenerationParams): Promise<any>;
}

export interface ContentGenerationParams {
  prompt: string;
  context?: {
    grade?: string;
    subject?: string;
    skill?: string;
    studentProfile?: any;
  };
  maxTokens?: number;
  temperature?: number;
}

class AIServiceSelector implements AIServiceInterface {
  private multiModelService: MultiModelService | null = null;
  private useMultiModel: boolean = false;
  private targetGrades: string[] = [];
  private debugMode: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Check if multi-model is enabled
    this.useMultiModel = process.env.ENABLE_MULTI_MODEL === 'true';

    // Get target grades for rollout
    if (process.env.MULTI_MODEL_TARGET_GRADES) {
      this.targetGrades = process.env.MULTI_MODEL_TARGET_GRADES.split(',').map(g => g.trim());
    }

    // Debug mode
    this.debugMode = process.env.MULTI_MODEL_DEBUG === 'true';

    // Initialize multi-model service if enabled
    if (this.useMultiModel) {
      try {
        this.multiModelService = new MultiModelService();
        if (this.debugMode) {
          console.log('🚀 Multi-Model System Initialized');
          console.log('Target Grades:', this.targetGrades);
        }
      } catch (error) {
        console.error('Failed to initialize multi-model service:', error);
        this.useMultiModel = false;
      }
    }
  }

  /**
   * Determines if we should use multi-model for this request
   */
  private shouldUseMultiModel(params: ContentGenerationParams): boolean {
    if (!this.useMultiModel || !this.multiModelService) {
      return false;
    }

    // Check if grade is in target grades for rollout
    const grade = params.context?.grade;
    if (grade && this.targetGrades.length > 0) {
      const shouldUse = this.targetGrades.includes(grade);

      if (this.debugMode) {
        console.log(`Grade ${grade}: ${shouldUse ? '✅ Using Multi-Model' : '⏭️ Using Standard'}`);
      }

      return shouldUse;
    }

    // Check rollout percentage
    const rolloutPercentage = parseInt(process.env.MULTI_MODEL_ROLLOUT_PERCENTAGE || '0');
    if (rolloutPercentage > 0 && rolloutPercentage < 100) {
      const random = Math.random() * 100;
      return random < rolloutPercentage;
    }

    return this.useMultiModel;
  }

  /**
   * Main content generation method
   */
  async generateContent(params: ContentGenerationParams): Promise<any> {
    const startTime = Date.now();

    try {
      // Determine which service to use
      if (this.shouldUseMultiModel(params)) {
        // Use multi-model system
        const result = await this.generateWithMultiModel(params);

        if (this.debugMode) {
          const latency = Date.now() - startTime;
          console.log(`✅ Multi-Model Response in ${latency}ms`);
          console.log(`Model Used: ${result.modelUsed}`);
          console.log(`Cost: $${result.cost?.toFixed(6) || 'N/A'}`);
        }

        return result.content;
      } else {
        // Use standard Azure OpenAI service
        const result = await azureOpenAIService.generateContent(
          params.prompt,
          params.maxTokens || 2000,
          params.temperature || 0.7
        );

        if (this.debugMode) {
          const latency = Date.now() - startTime;
          console.log(`⏭️ Standard GPT-4o Response in ${latency}ms`);
        }

        return result;
      }
    } catch (error) {
      console.error('AI Service Error:', error);

      // Fallback to standard service on error
      if (this.shouldUseMultiModel(params)) {
        console.log('Falling back to standard Azure OpenAI service');
        return azureOpenAIService.generateContent(
          params.prompt,
          params.maxTokens || 2000,
          params.temperature || 0.7
        );
      }

      throw error;
    }
  }

  /**
   * Generate content using multi-model system
   */
  private async generateWithMultiModel(params: ContentGenerationParams): Promise<any> {
    if (!this.multiModelService) {
      throw new Error('Multi-model service not initialized');
    }

    // Route the request to appropriate model
    const routingContext = {
      studentProfile: {
        grade: params.context?.grade,
        subject: params.context?.subject
      },
      promptType: 'content_generation' as const,
      content: params.prompt
    };

    const selectedModel = ModelRouter.routeRequest(routingContext);

    if (this.debugMode) {
      console.log(`📊 Selected Model: ${selectedModel.name}`);
    }

    // Generate content with selected model
    const result = await this.multiModelService.generateContent({
      grade: params.context?.grade || '5',
      subject: params.context?.subject || 'General',
      skill: params.context?.skill || '',
      contentType: 'learning_content',
      prompt: params.prompt
    });

    return result;
  }

  /**
   * Generate assessment content (specialized method)
   */
  async generateAssessmentContent(params: ContentGenerationParams): Promise<any> {
    // For assessments, we might want to use a more capable model
    // even for lower grades to ensure accuracy
    if (this.shouldUseMultiModel(params)) {
      const grade = params.context?.grade;
      const gradeNum = grade === 'K' ? 0 : parseInt(grade || '5');

      // For assessments, use a step up in model quality
      if (gradeNum <= 2) {
        // Use Llama instead of Phi-4 for assessments
        params.context = {
          ...params.context,
          grade: '3' // This will trigger Llama selection
        };
      }
    }

    return this.generateContent(params);
  }

  /**
   * Get cost estimate for a request
   */
  getCostEstimate(params: ContentGenerationParams): number {
    if (!this.shouldUseMultiModel(params)) {
      // GPT-4o estimate
      return 0.005; // Rough estimate
    }

    const grade = params.context?.grade || '5';
    const model = getModelForGrade(grade);

    if (!model) {
      return 0.005;
    }

    // Estimate: 500 input tokens, 200 output tokens
    const cost = (model.costPerMilTokensInput * 0.5 / 1000) +
                 (model.costPerMilTokensOutput * 0.2 / 1000);

    return cost;
  }

  /**
   * Get statistics about model usage
   */
  getStatistics() {
    return {
      multiModelEnabled: this.useMultiModel,
      targetGrades: this.targetGrades,
      rolloutPercentage: process.env.MULTI_MODEL_ROLLOUT_PERCENTAGE || '0',
      debugMode: this.debugMode
    };
  }
}

// Export singleton instance
export const aiServiceSelector = new AIServiceSelector();

// Export for backwards compatibility
export const generateAIContent = (params: ContentGenerationParams) => {
  return aiServiceSelector.generateContent(params);
};