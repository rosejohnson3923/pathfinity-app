/**
 * AI Service Adapter
 * Integrates the multi-model system with the existing AILearningJourneyService
 */

import { MultiModelService, GenerationResult } from './MultiModelService';
import { PromptContext } from '../ai-prompts/PromptBuilder';
import { ModelCapability, getModelByName } from './ModelCapabilities';

export class AIServiceAdapter {
  private multiModelService: MultiModelService;
  private isMultiModelEnabled: boolean;

  constructor() {
    this.multiModelService = MultiModelService.getInstance();
    this.isMultiModelEnabled = process.env.ENABLE_MULTI_MODEL === 'true';
  }

  /**
   * Replace azureOpenAIService.generateWithModel calls
   * This is a drop-in replacement for the existing service
   */
  async generateWithModel(
    modelName: string,
    prompt: string,
    systemPrompt?: string,
    responseFormat?: any
  ): Promise<any> {
    // If multi-model is disabled, use the original model
    if (!this.isMultiModelEnabled) {
      return this.legacyGenerate(modelName, prompt, systemPrompt, responseFormat);
    }

    // Build context from the prompt
    const context = this.extractContext(prompt, modelName);

    // Generate using multi-model system
    const result = await this.multiModelService.generateContent(prompt, context);

    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`🤖 Multi-Model Route: ${result.routingDecision.modelName} (was ${modelName})`);
      console.log(`💰 Cost: $${result.cost.toFixed(4)}`);
      console.log(`⚡ Latency: ${result.latency}ms`);
      if (result.routingDecision.isFallback) {
        console.log(`🔄 Fallback used: ${result.routingDecision.fallbackReason}`);
      }
    }

    return result.content;
  }

  /**
   * Extract context from prompt for routing decisions
   */
  private extractContext(prompt: string, requestedModel: string): PromptContext {
    // Parse grade from prompt
    const gradeMatch = prompt.match(/grade[:\s]+([K\d]+)/i);
    const grade = gradeMatch ? gradeMatch[1] : undefined;

    // Parse subject from prompt
    const subjectMatch = prompt.match(/subject[:\s]+(MATH|ELA|SCIENCE|SOCIAL_STUDIES)/i);
    const subject = (subjectMatch ? subjectMatch[1] : 'GENERAL') as any;

    // Parse container from prompt
    const containerMatch = prompt.match(/container[:\s]+(EXPERIENCE|LEARN|ASSESSMENT|DISCOVER)/i);
    const container = (containerMatch ? containerMatch[1] : 'LEARN') as any;

    // Check for images
    const hasImages = prompt.includes('image') || prompt.includes('visual') || prompt.includes('picture');

    // Check for validation task
    const isValidation = prompt.includes('validate') || prompt.includes('check') || prompt.includes('verify');

    // Parse career from prompt
    const careerMatch = prompt.match(/career[:\s]+([A-Za-z\s]+?)(?:\n|$|,)/i);
    const career = careerMatch ? careerMatch[1].trim() : undefined;

    return {
      studentProfile: grade ? { grade, id: '', display_name: '' } : undefined,
      subject,
      container,
      hasImages,
      isValidation,
      career: career ? { name: career, id: '', description: '' } : undefined
    };
  }

  /**
   * Legacy generation for when multi-model is disabled
   */
  private async legacyGenerate(
    modelName: string,
    prompt: string,
    systemPrompt?: string,
    responseFormat?: any
  ): Promise<any> {
    // Use the forced model if specified
    const forceModel = process.env.FORCE_MODEL;
    const actualModel = forceModel || this.mapLegacyModel(modelName);

    // Get model config
    const model = getModelByName(actualModel);
    if (!model) {
      throw new Error(`Model ${actualModel} not found`);
    }

    // Create a simple context for legacy mode
    const context = this.extractContext(prompt, modelName);

    // Generate using the specified model directly
    const result = await this.multiModelService.generateContent(prompt, {
      ...context,
      // Force specific model in legacy mode
      forceModel: actualModel
    } as any);

    return result.content;
  }

  /**
   * Map legacy model names to new model names
   */
  private mapLegacyModel(legacyName: string): string {
    const mapping: Record<string, string> = {
      'gpt4o': 'gpt-4o',
      'gpt-4o': 'gpt-4o',
      'gpt4': 'gpt-4o',
      'gpt-4': 'gpt-4o',
      'gpt35': 'gpt-35-turbo',
      'gpt-35': 'gpt-35-turbo'
    };

    return mapping[legacyName] || 'gpt-4o';
  }

  /**
   * Get metrics from the multi-model system
   */
  async getMetrics(): Promise<any> {
    return this.multiModelService.getMetrics();
  }

  /**
   * Update configuration
   */
  updateConfig(config: any): void {
    this.multiModelService.updateConfig(config);
  }

  /**
   * Check if multi-model is enabled
   */
  isEnabled(): boolean {
    return this.isMultiModelEnabled;
  }

  /**
   * Enable/disable multi-model system
   */
  setEnabled(enabled: boolean): void {
    this.isMultiModelEnabled = enabled;
    this.multiModelService.updateConfig({ enableMultiModel: enabled });
  }
}

// Export singleton instance
export const aiServiceAdapter = new AIServiceAdapter();