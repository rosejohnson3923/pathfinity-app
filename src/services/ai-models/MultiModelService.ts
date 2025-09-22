/**
 * Multi-Model Service
 * Main orchestrator for the multi-model AI system
 */

import { ModelRouter, RoutingDecision } from './ModelRouter';
import { PromptAdapter } from './PromptAdapter';
import { ModelCapability, calculateCost } from './ModelCapabilities';
import { PromptContext } from '../ai-prompts/PromptBuilder';
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';

export interface MultiModelConfig {
  enableMultiModel: boolean;
  enableValidation: boolean;
  enableCostTracking: boolean;
  forceModel?: string;
  validationStrictness: 'low' | 'medium' | 'high';
  maxRetries: number;
}

export interface GenerationResult {
  content: any;
  modelUsed: string;
  routingDecision: RoutingDecision;
  validationResult?: ValidationResult;
  cost: number;
  latency: number;
  tokens: {
    input: number;
    output: number;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions: string[];
  fixedContent?: any;
}

export class MultiModelService {
  private static instance: MultiModelService;
  private config: MultiModelConfig;
  private secretClient: SecretClient;
  private apiKeyCache: Map<string, string> = new Map();
  private metricsCollector: MetricsCollector;

  private constructor(config?: Partial<MultiModelConfig>) {
    // Handle browser vs Node environment
    const isBrowser = typeof window !== 'undefined';
    const getEnvVar = (key: string, defaultValue?: string): string | undefined => {
      if (isBrowser) {
        return (import.meta as any).env?.[`VITE_${key}`] || defaultValue;
      } else {
        return process?.env?.[key] || defaultValue;
      }
    };

    this.config = {
      enableMultiModel: getEnvVar('ENABLE_MULTI_MODEL') === 'true',
      enableValidation: getEnvVar('ENABLE_VALIDATION', 'true') === 'true',
      enableCostTracking: getEnvVar('ENABLE_COST_TRACKING', 'true') === 'true',
      forceModel: getEnvVar('FORCE_MODEL'),
      validationStrictness: (getEnvVar('VALIDATION_STRICTNESS', 'medium') as any),
      maxRetries: parseInt(getEnvVar('MAX_RETRIES', '3') || '3'),
      ...config
    };

    // Initialize Azure Key Vault client
    const vaultUrl = getEnvVar('AZURE_KEY_VAULT_URL', 'https://pathfinity-kv-2823.vault.azure.net/');
    const credential = new DefaultAzureCredential();
    this.secretClient = new SecretClient(vaultUrl, credential);

    // Initialize metrics collector
    this.metricsCollector = new MetricsCollector();
  }

  static getInstance(config?: Partial<MultiModelConfig>): MultiModelService {
    if (!this.instance) {
      this.instance = new MultiModelService(config);
    }
    return this.instance;
  }

  /**
   * Generate content using the multi-model system
   */
  async generateContent(
    prompt: string,
    context: PromptContext
  ): Promise<GenerationResult> {
    const startTime = Date.now();

    // Check if multi-model is enabled
    if (!this.config.enableMultiModel) {
      return this.fallbackToSingleModel(prompt, context, startTime);
    }

    // Route and execute request
    const { result, decision } = await ModelRouter.routeRequest(
      context,
      async (model) => await this.executeModelRequest(prompt, context, model)
    );

    // Validate if enabled
    let validationResult: ValidationResult | undefined;
    if (this.config.enableValidation && !context.isValidation) {
      validationResult = await this.validateContent(result, context, decision.model);
    }

    // Calculate metrics
    const latency = Date.now() - startTime;
    const tokens = this.estimateTokens(prompt, result);
    const cost = calculateCost(decision.modelName, tokens.input, tokens.output);

    // Track metrics
    if (this.config.enableCostTracking) {
      await this.metricsCollector.trackGeneration({
        modelName: decision.modelName,
        cost,
        latency,
        tokens,
        success: true,
        isFallback: decision.isFallback
      });
    }

    return {
      content: validationResult?.fixedContent || result,
      modelUsed: decision.modelName,
      routingDecision: decision,
      validationResult,
      cost,
      latency,
      tokens
    };
  }

  /**
   * Execute a request to a specific model
   */
  private async executeModelRequest(
    prompt: string,
    context: PromptContext,
    model: ModelCapability
  ): Promise<any> {
    // Get API key from Key Vault
    const apiKey = await this.getApiKey(model.apiKeySecret);

    // Adapt prompt for model
    const adaptedPrompt = PromptAdapter.adaptPrompt(prompt, context, model);
    const systemMessage = PromptAdapter.getSystemMessage(model);

    // Truncate if needed
    const finalPrompt = PromptAdapter.truncateToContext(adaptedPrompt, model);

    // Build request
    const requestBody = {
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: finalPrompt }
      ],
      temperature: model.temperature,
      max_tokens: model.maxTokens,
      ...(model.responseFormat && { response_format: { type: model.responseFormat } })
    };

    // Make API call with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      console.warn(`⏱️ Request to ${model.name} timed out after 30 seconds`);
      controller.abort();
    }, 30000); // 30 second timeout

    console.log(`📡 Calling ${model.name} at ${model.endpoint}`);
    console.log(`   Deployment: ${model.deploymentName}`);
    console.log(`   Max tokens: ${requestBody.max_tokens}`);

    let response;
    try {
      response = await fetch(
        `${model.endpoint}openai/deployments/${model.deploymentName}/chat/completions?api-version=2024-08-01-preview`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': apiKey
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        }
      );
    } catch (error: any) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        throw new Error(`${model.name} request timed out after 30 seconds`);
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Model ${model.name} failed: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON if expected
    if (model.supportsJSON) {
      try {
        // Clean up markdown-wrapped JSON (common with some models)
        let cleanContent = content;
        if (typeof content === 'string') {
          // Remove markdown code blocks if present
          cleanContent = content.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
          // Also try without the json label
          cleanContent = cleanContent.replace(/^```\s*/i, '').replace(/\s*```$/i, '');
        }
        return JSON.parse(cleanContent);
      } catch (e) {
        console.warn(`Failed to parse JSON from ${model.name}, attempting fallback parsing`);
        // Try to extract JSON from the content
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (e2) {
            console.warn(`Fallback JSON parsing also failed for ${model.name}`);
          }
        }
        return content;
      }
    }

    return content;
  }

  /**
   * Validate content using DeepSeek or another validation model
   */
  private async validateContent(
    content: any,
    context: PromptContext,
    generationModel: ModelCapability
  ): Promise<ValidationResult> {
    const validationContext: PromptContext = {
      ...context,
      isValidation: true
    };

    const validationPrompt = this.buildValidationPrompt(content, context);

    try {
      const result = await this.generateContent(validationPrompt, validationContext);

      // Parse validation result
      const validation = typeof result.content === 'string'
        ? JSON.parse(result.content)
        : result.content;

      // If invalid and strictness is high, attempt to fix
      if (!validation.isValid && this.config.validationStrictness === 'high') {
        const fixedContent = await this.attemptAutoFix(content, validation, context);
        if (fixedContent) {
          validation.fixedContent = fixedContent;
        }
      }

      return validation;
    } catch (error) {
      console.error('Validation failed:', error);
      // Return as valid if validation itself fails
      return {
        isValid: true,
        errors: [],
        suggestions: ['Validation service unavailable']
      };
    }
  }

  /**
   * Build validation prompt
   */
  private buildValidationPrompt(content: any, context: PromptContext): string {
    return `
Validate the following educational content for quality and correctness:

Content: ${JSON.stringify(content, null, 2)}

Context:
- Grade: ${context.studentProfile?.grade}
- Subject: ${context.subject}
- Container: ${context.container}

Check for:
1. Subject isolation (no cross-contamination)
2. Grade-appropriate difficulty
3. Correct answers
4. Proper formatting
5. Career context preservation

Return JSON:
{
  "isValid": boolean,
  "errors": ["list of errors"],
  "suggestions": ["list of improvements"]
}`;
  }

  /**
   * Attempt to automatically fix content issues
   */
  private async attemptAutoFix(
    content: any,
    validation: ValidationResult,
    context: PromptContext
  ): Promise<any> {
    const fixPrompt = `
Fix the following issues in this educational content:

Original Content: ${JSON.stringify(content, null, 2)}

Issues to fix:
${validation.errors.join('\n')}

Suggestions:
${validation.suggestions.join('\n')}

Return the corrected content in the same JSON format.`;

    try {
      const fixContext = { ...context, isValidation: false };
      const result = await this.generateContent(fixPrompt, fixContext);
      return result.content;
    } catch (error) {
      console.error('Auto-fix failed:', error);
      return null;
    }
  }

  /**
   * Fallback to single model (GPT-4o) when multi-model is disabled
   */
  private async fallbackToSingleModel(
    prompt: string,
    context: PromptContext,
    startTime: number
  ): Promise<GenerationResult> {
    const model = this.config.forceModel
      ? ModelRouter.forceModel(this.config.forceModel)!
      : ModelRouter.forceModel('gpt-4o')!;

    const result = await this.executeModelRequest(prompt, context, model);

    const latency = Date.now() - startTime;
    const tokens = this.estimateTokens(prompt, result);
    const cost = calculateCost(model.name, tokens.input, tokens.output);

    return {
      content: result,
      modelUsed: model.name,
      routingDecision: {
        modelName: model.name,
        model,
        isOverride: false,
        isFallback: false,
        attemptNumber: 1
      },
      cost,
      latency,
      tokens
    };
  }

  /**
   * Get API key from Key Vault (with caching)
   */
  private async getApiKey(secretName: string): Promise<string> {
    if (this.apiKeyCache.has(secretName)) {
      return this.apiKeyCache.get(secretName)!;
    }

    // First try environment variables (for local development)
    const isBrowser = typeof window !== 'undefined';
    const envKey = secretName.toUpperCase().replace(/-/g, '_');
    const apiKey = isBrowser ? (import.meta as any).env?.[`VITE_${envKey}`] : process?.env?.[envKey];

    if (apiKey) {
      console.log(`✅ Using API key from environment: VITE_${envKey}`);
      this.apiKeyCache.set(secretName, apiKey);
      return apiKey;
    }

    // Only try Key Vault if env variable not found and not in browser
    if (!isBrowser && this.secretClient) {
      try {
        const secret = await this.secretClient.getSecret(secretName);
        const vaultKey = secret.value!;
        console.log(`✅ Using API key from Key Vault: ${secretName}`);
        this.apiKeyCache.set(secretName, vaultKey);
        return vaultKey;
      } catch (error) {
        console.warn(`Failed to get key from Key Vault: ${secretName}`, error);
      }
    }

    throw new Error(`No API key found for ${secretName}. Looked for env var: VITE_${envKey}`);
  }

  /**
   * Estimate token counts (rough approximation)
   */
  private estimateTokens(prompt: string, response: any): { input: number; output: number } {
    const responseStr = typeof response === 'string' ? response : JSON.stringify(response);
    return {
      input: Math.ceil(prompt.length / 4),
      output: Math.ceil(responseStr.length / 4)
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): MultiModelConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MultiModelConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get metrics
   */
  async getMetrics(): Promise<any> {
    return this.metricsCollector.getMetrics();
  }
}

/**
 * Metrics Collector
 */
class MetricsCollector {
  private metrics: any[] = [];
  private costByModel: Map<string, number> = new Map();
  private requestsByModel: Map<string, number> = new Map();

  async trackGeneration(data: any): Promise<void> {
    this.metrics.push({
      ...data,
      timestamp: new Date().toISOString()
    });

    // Update aggregates
    const currentCost = this.costByModel.get(data.modelName) || 0;
    const currentRequests = this.requestsByModel.get(data.modelName) || 0;

    this.costByModel.set(data.modelName, currentCost + data.cost);
    this.requestsByModel.set(data.modelName, currentRequests + 1);

    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  getMetrics(): any {
    const totalCost = Array.from(this.costByModel.values()).reduce((a, b) => a + b, 0);
    const totalRequests = Array.from(this.requestsByModel.values()).reduce((a, b) => a + b, 0);

    return {
      totalCost,
      totalRequests,
      costByModel: Object.fromEntries(this.costByModel),
      requestsByModel: Object.fromEntries(this.requestsByModel),
      averageCostPerRequest: totalRequests > 0 ? totalCost / totalRequests : 0,
      recentMetrics: this.metrics.slice(-10),
      modelHealth: ModelRouter.getModelHealth()
    };
  }
}