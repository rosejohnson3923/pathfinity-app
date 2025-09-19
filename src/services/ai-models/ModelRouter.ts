/**
 * Smart Model Router
 * Intelligently selects the best model based on context and handles fallbacks
 */

import {
  ModelCapability,
  MODEL_CAPABILITIES,
  GRADE_MODEL_MAP,
  CONTAINER_OVERRIDES,
  getFallbackModels,
  getModelByName,
  getModelForGrade
} from './ModelCapabilities';
import { PromptContext } from '../ai-prompts/PromptBuilder';

export interface ModelSelection {
  primary: ModelCapability;
  fallbacks: ModelCapability[];
  reason: string;
  estimatedCost: number;
}

export interface RoutingDecision {
  modelName: string;
  model: ModelCapability;
  isOverride: boolean;
  overrideReason?: string;
  isFallback: boolean;
  fallbackReason?: string;
  attemptNumber: number;
}

export class ModelRouter {
  private static failureHistory: Map<string, number> = new Map();
  private static readonly FAILURE_THRESHOLD = 3;
  private static readonly FAILURE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Select the best model for a given context
   */
  static selectModel(context: PromptContext): ModelSelection {
    let primaryModel: ModelCapability;
    let reason: string;

    // Check for container overrides first
    const containerOverride = this.checkContainerOverride(context);
    if (containerOverride) {
      primaryModel = containerOverride.model;
      reason = containerOverride.reason;
    }
    // Check for vision requirements
    else if (context.hasImages) {
      primaryModel = this.selectVisionCapableModel(context);
      reason = 'Vision-capable model required for image processing';
    }
    // Check for validation tasks
    else if (context.isValidation) {
      primaryModel = MODEL_CAPABILITIES['deepseek-v3'];
      reason = 'DeepSeek-V3 selected for validation task';
    }
    // Standard grade-based selection
    else {
      primaryModel = this.selectByGrade(context);
      reason = `Grade ${context.studentProfile?.grade} mapped to ${primaryModel.name}`;
    }

    // Get fallback chain
    const fallbacks = getFallbackModels(primaryModel.name);

    // Estimate cost
    const estimatedCost = this.estimateCost(primaryModel, context);

    return {
      primary: primaryModel,
      fallbacks,
      reason,
      estimatedCost
    };
  }

  /**
   * Route request with fallback handling
   */
  static async routeRequest(
    context: PromptContext,
    executeRequest: (model: ModelCapability) => Promise<any>
  ): Promise<{ result: any; decision: RoutingDecision }> {
    const selection = this.selectModel(context);
    let currentModel = selection.primary;
    let attemptNumber = 1;
    let lastError: Error | null = null;

    // Try primary model
    try {
      const result = await executeRequest(currentModel);
      this.recordSuccess(currentModel.name);

      return {
        result,
        decision: {
          modelName: currentModel.name,
          model: currentModel,
          isOverride: !!CONTAINER_OVERRIDES[context.container],
          overrideReason: selection.reason,
          isFallback: false,
          attemptNumber
        }
      };
    } catch (error) {
      lastError = error as Error;
      this.recordFailure(currentModel.name);
      console.error(`Primary model ${currentModel.name} failed:`, error);
    }

    // Try fallback models
    for (const fallbackModel of selection.fallbacks) {
      attemptNumber++;

      // Skip if this model has too many recent failures
      if (this.isModelUnhealthy(fallbackModel.name)) {
        console.warn(`Skipping unhealthy model ${fallbackModel.name}`);
        continue;
      }

      try {
        const result = await executeRequest(fallbackModel);
        this.recordSuccess(fallbackModel.name);

        return {
          result,
          decision: {
            modelName: fallbackModel.name,
            model: fallbackModel,
            isOverride: false,
            isFallback: true,
            fallbackReason: `Fallback from ${currentModel.name}: ${lastError?.message}`,
            attemptNumber
          }
        };
      } catch (error) {
        lastError = error as Error;
        this.recordFailure(fallbackModel.name);
        console.error(`Fallback model ${fallbackModel.name} failed:`, error);
      }
    }

    // All models failed
    throw new Error(
      `All models failed. Last error: ${lastError?.message}. ` +
      `Tried: ${selection.primary.name} + ${selection.fallbacks.length} fallbacks`
    );
  }

  /**
   * Check for container-based overrides
   */
  private static checkContainerOverride(
    context: PromptContext
  ): { model: ModelCapability; reason: string } | null {
    const override = CONTAINER_OVERRIDES[context.container];

    if (override) {
      const model = getModelByName(override);
      if (model) {
        return {
          model,
          reason: `Container ${context.container} requires ${override} for optimal quality`
        };
      }
    }

    return null;
  }

  /**
   * Select a vision-capable model
   */
  private static selectVisionCapableModel(context: PromptContext): ModelCapability {
    const grade = context.studentProfile?.grade;
    const gradeNum = grade === 'K' ? 0 : parseInt(grade || '12');

    // For lower grades with images, use gpt-4o-mini
    if (gradeNum <= 8) {
      return MODEL_CAPABILITIES['gpt-4o-mini'];
    }

    // For higher grades, use full gpt-4o
    return MODEL_CAPABILITIES['gpt-4o'];
  }

  /**
   * Select model based on grade
   */
  private static selectByGrade(context: PromptContext): ModelCapability {
    const grade = context.studentProfile?.grade || '9';
    return getModelForGrade(grade);
  }

  /**
   * Estimate cost for a request
   */
  private static estimateCost(model: ModelCapability, context: PromptContext): number {
    // Rough estimates based on typical content generation
    const estimatedInputTokens = 500; // Prompt
    const estimatedOutputTokens = context.container === 'EXPERIENCE' ? 1000 : 600;

    const inputCost = (estimatedInputTokens / 1000) * model.costPerMilTokensInput;
    const outputCost = (estimatedOutputTokens / 1000) * model.costPerMilTokensOutput;

    return inputCost + outputCost;
  }

  /**
   * Record model failure
   */
  private static recordFailure(modelName: string): void {
    const key = `${modelName}_${Date.now()}`;
    this.failureHistory.set(key, Date.now());

    // Clean old entries
    this.cleanFailureHistory();
  }

  /**
   * Record model success
   */
  private static recordSuccess(modelName: string): void {
    // Clear recent failures for this model on success
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.failureHistory.forEach((timestamp, key) => {
      if (key.startsWith(modelName)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.failureHistory.delete(key));
  }

  /**
   * Check if model has too many recent failures
   */
  private static isModelUnhealthy(modelName: string): boolean {
    this.cleanFailureHistory();

    let recentFailures = 0;
    const now = Date.now();

    this.failureHistory.forEach((timestamp, key) => {
      if (key.startsWith(modelName) && (now - timestamp) < this.FAILURE_WINDOW_MS) {
        recentFailures++;
      }
    });

    return recentFailures >= this.FAILURE_THRESHOLD;
  }

  /**
   * Clean old failure history entries
   */
  private static cleanFailureHistory(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.failureHistory.forEach((timestamp, key) => {
      if (now - timestamp > this.FAILURE_WINDOW_MS) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.failureHistory.delete(key));
  }

  /**
   * Get model health status
   */
  static getModelHealth(): Record<string, { healthy: boolean; recentFailures: number }> {
    this.cleanFailureHistory();
    const health: Record<string, { healthy: boolean; recentFailures: number }> = {};

    Object.keys(MODEL_CAPABILITIES).forEach(modelName => {
      let recentFailures = 0;
      const now = Date.now();

      this.failureHistory.forEach((timestamp, key) => {
        if (key.startsWith(modelName) && (now - timestamp) < this.FAILURE_WINDOW_MS) {
          recentFailures++;
        }
      });

      health[modelName] = {
        healthy: recentFailures < this.FAILURE_THRESHOLD,
        recentFailures
      };
    });

    return health;
  }

  /**
   * Override model selection (for testing)
   */
  static forceModel(modelName: string): ModelCapability | null {
    return getModelByName(modelName) || null;
  }
}