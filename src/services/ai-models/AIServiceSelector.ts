/**
 * AI Service Selector
 * Conditionally uses multi-model system or standard Azure OpenAI based on configuration
 */

import { azureOpenAIService } from '../azureOpenAIService';
import { MultiModelService } from './MultiModelService';
import { ModelRouter } from './ModelRouter';
import { getModelForGrade } from './ModelCapabilities';

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
    // Check if we're in a browser or Node environment
    const isBrowser = typeof window !== 'undefined';

    // Use Vite env variables in browser, process.env in Node
    const getEnvVar = (key: string): string | undefined => {
      if (isBrowser) {
        // In browser, use Vite's import.meta.env
        return (import.meta as any).env?.[`VITE_${key}`];
      } else {
        // In Node.js, use process.env
        return process?.env?.[key];
      }
    };

    // Check if multi-model is enabled
    this.useMultiModel = getEnvVar('ENABLE_MULTI_MODEL') === 'true';

    // Get target grades for rollout
    const targetGrades = getEnvVar('MULTI_MODEL_TARGET_GRADES');
    if (targetGrades) {
      this.targetGrades = targetGrades.split(',').map(g => g.trim());
    }

    // Debug mode
    this.debugMode = getEnvVar('MULTI_MODEL_DEBUG') === 'true';

    // Initialize multi-model service if enabled
    if (this.useMultiModel) {
      try {
        this.multiModelService = new MultiModelService();
        console.log('');
        console.log('╔═══════════════════════════════════════════════════════════╗');
        console.log('║        🚀 MULTI-MODEL AI SYSTEM INITIALIZED 🚀            ║');
        console.log('╠═══════════════════════════════════════════════════════════╣');
        console.log('║ Status: ACTIVE                                            ║');
        console.log(`║ Target Grades: ${this.targetGrades.join(', ').padEnd(43)}║`);
        console.log(`║ Debug Mode: ${this.debugMode ? 'ON' : 'OFF'}                                          ║`);
        console.log('║ Cost Savings: 88% (K-2) to 94% (6-8) vs GPT-4o          ║');
        console.log('╚═══════════════════════════════════════════════════════════╝');
        console.log('');
      } catch (error) {
        console.error('❌ Failed to initialize multi-model service:', error);
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

      console.log('');
      console.log('┌─────────────────────────────────────────┐');
      console.log('│      🎯 MODEL SELECTION DECISION        │');
      console.log('├─────────────────────────────────────────┤');
      console.log(`│ Grade: ${grade.padEnd(33)}│`);
      console.log(`│ Subject: ${(params.context?.subject || 'N/A').padEnd(31)}│`);
      console.log(`│ Skill: ${(params.context?.skill || 'N/A').substring(0, 31).padEnd(33)}│`);
      console.log('├─────────────────────────────────────────┤');
      console.log(`│ Decision: ${shouldUse ? '✅ MULTI-MODEL' : '⏭️  STANDARD GPT-4o'}          │`);
      console.log('└─────────────────────────────────────────┘');

      return shouldUse;
    }

    // Check rollout percentage
    const isBrowser = typeof window !== 'undefined';
    const rolloutStr = isBrowser
      ? (import.meta as any).env?.VITE_MULTI_MODEL_ROLLOUT_PERCENTAGE
      : process?.env?.MULTI_MODEL_ROLLOUT_PERCENTAGE;
    const rolloutPercentage = parseInt(rolloutStr || '0');

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

        const latency = Date.now() - startTime;
        console.log('');
        console.log('╔═══════════════════════════════════════════╗');
        console.log('║     ✅ MULTI-MODEL RESPONSE COMPLETE      ║');
        console.log('╠═══════════════════════════════════════════╣');
        console.log(`║ Model Used: ${(result.modelUsed || 'Unknown').padEnd(30)}║`);
        console.log(`║ Latency: ${(latency + 'ms').padEnd(33)}║`);
        console.log(`║ Cost: $${(result.cost?.toFixed(6) || '0.000000').padEnd(35)}║`);
        console.log(`║ Tokens: ${((result.tokens || 0) + ' total').padEnd(34)}║`);
        console.log('╚═══════════════════════════════════════════╝');

        return result.content;
      } else {
        // Use standard Azure OpenAI service
        const result = await azureOpenAIService.generateWithModel(
          'gpt-4o',
          params.prompt,
          undefined,
          { type: 'json_object' }
        );

        const latency = Date.now() - startTime;
        console.log('');
        console.log('┌─────────────────────────────────────────┐');
        console.log('│   ⏭️  STANDARD GPT-4o RESPONSE          │');
        console.log('├─────────────────────────────────────────┤');
        console.log(`│ Latency: ${(latency + 'ms').padEnd(31)}│`);
        console.log(`│ Est. Cost: $0.005000                   │`);
        console.log('└─────────────────────────────────────────┘');

        return result;
      }
    } catch (error) {
      console.error('AI Service Error:', error);

      // Fallback to standard service on error
      if (this.shouldUseMultiModel(params)) {
        console.log('Falling back to standard Azure OpenAI service');
        return azureOpenAIService.generateWithModel(
          'gpt-4o',
          params.prompt,
          undefined,
          { type: 'json_object' }
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
      } as any,
      subject: params.context?.subject as any,
      container: 'LEARN' as any,
      hasImages: false,
      isValidation: false
    };

    const selection = ModelRouter.selectModel(routingContext);
    const selectedModel = selection.primary;

    console.log('');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│       📊 MODEL ROUTING RESULT           │');
    console.log('├─────────────────────────────────────────┤');
    console.log(`│ Selected: ${selectedModel.name.padEnd(30)}│`);
    console.log(`│ Endpoint: ${selectedModel.endpoint?.substring(8, 30).padEnd(30)}│`);
    console.log(`│ Cost/1K: $${((selectedModel.costPerMilTokensInput || 0) / 1000).toFixed(6).padEnd(29)}│`);
    console.log('└─────────────────────────────────────────┘');

    // Generate content with selected model
    const result = await this.multiModelService.generateContent(
      params.prompt,
      routingContext
    );

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
    const isBrowser = typeof window !== 'undefined';
    const rolloutStr = isBrowser
      ? (import.meta as any).env?.VITE_MULTI_MODEL_ROLLOUT_PERCENTAGE
      : process?.env?.MULTI_MODEL_ROLLOUT_PERCENTAGE;

    return {
      multiModelEnabled: this.useMultiModel,
      targetGrades: this.targetGrades,
      rolloutPercentage: rolloutStr || '0',
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