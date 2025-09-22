/**
 * Model Capabilities Registry
 * Defines the capabilities, costs, and characteristics of each AI model
 */

export interface ModelCapability {
  name: string;
  deploymentName: string;
  endpoint: string;
  apiKeySecret: string;
  costPerMilTokensInput: number;
  costPerMilTokensOutput: number;
  maxTokens: number;
  contextWindow: number;
  strengths: string[];
  weaknesses: string[];
  bestForGrades: string[];
  supportsVision: boolean;
  supportsJSON: boolean;
  responseFormat?: 'json_object' | 'text';
  temperature: number;
  requiresStructuredPrompt: boolean;
}

export const MODEL_CAPABILITIES: Record<string, ModelCapability> = {
  'phi-4': {
    name: 'Phi-4',
    deploymentName: 'Phi-4',
    endpoint: 'https://e4a-mdd7qx3v-swedencentral.cognitiveservices.azure.com/',
    apiKeySecret: 'azure-sweden-api-key',
    costPerMilTokensInput: 0.15,
    costPerMilTokensOutput: 0.60,
    maxTokens: 1000,  // Reduced from 2000
    contextWindow: 16000,
    strengths: ['simple instructions', 'counting', 'basic math', 'structured output'],
    weaknesses: ['complex reasoning', 'creative writing', 'long passages'],
    bestForGrades: ['K', '1', '2'],
    supportsVision: false,
    supportsJSON: true,
    responseFormat: undefined,  // Removed JSON mode temporarily
    temperature: 0.7,
    requiresStructuredPrompt: true
  },

  'llama-3.3-70b': {
    name: 'Llama-3.3-70B-Instruct',
    deploymentName: 'Llama-3.3-70B-Instruct',
    endpoint: 'https://e4a-9894-resource.cognitiveservices.azure.com/',
    apiKeySecret: 'azure-eastus2-9894-api-key',
    costPerMilTokensInput: 0.54,
    costPerMilTokensOutput: 0.68,
    maxTokens: 3000,
    contextWindow: 128000,
    strengths: ['instruction following', 'reasoning', 'cost-effective', 'large context'],
    weaknesses: ['vision tasks', 'complex creativity'],
    bestForGrades: ['3', '4', '5', '6', '7', '8'],
    supportsVision: false,
    supportsJSON: true,
    responseFormat: 'json_object',
    temperature: 0.7,
    requiresStructuredPrompt: true
  },

  'gpt-4o-mini': {
    name: 'gpt-4o-mini',
    deploymentName: 'gpt-4o-mini',
    endpoint: 'https://e4a-mdd7qx3v-swedencentral.cognitiveservices.azure.com/',
    apiKeySecret: 'azure-sweden-api-key',
    costPerMilTokensInput: 0.15,
    costPerMilTokensOutput: 0.60,
    maxTokens: 3000,
    contextWindow: 128000,
    strengths: ['vision support', 'balanced cost/quality', 'reliable JSON'],
    weaknesses: ['most complex tasks'],
    bestForGrades: ['6', '7', '8'],
    supportsVision: true,
    supportsJSON: true,
    responseFormat: 'json_object',
    temperature: 0.75,
    requiresStructuredPrompt: false
  },

  'gpt-4o': {
    name: 'gpt-4o',
    deploymentName: 'gpt-4o',
    endpoint: 'https://pathfinity-ai.openai.azure.com/',
    apiKeySecret: 'azure-eastus-api-key',
    costPerMilTokensInput: 2.50,
    costPerMilTokensOutput: 10.00,
    maxTokens: 4000,
    contextWindow: 128000,
    strengths: ['everything', 'complex reasoning', 'creativity', 'vision', 'reliability'],
    weaknesses: ['cost'],
    bestForGrades: ['9', '10', '11', '12'],
    supportsVision: true,
    supportsJSON: true,
    responseFormat: 'json_object',
    temperature: 0.8,
    requiresStructuredPrompt: false
  },

  'gpt-35-turbo': {
    name: 'gpt-35-turbo',
    deploymentName: 'gpt-35-turbo',
    endpoint: 'https://e4a-8781-resource.cognitiveservices.azure.com/',
    apiKeySecret: 'azure-eastus2-8781-api-key',
    costPerMilTokensInput: 0.50,
    costPerMilTokensOutput: 1.50,
    maxTokens: 3000,  // Increased for better completions
    contextWindow: 16000,
    strengths: ['reliable', 'fast', 'good fallback'],
    weaknesses: ['not cutting-edge', 'no vision'],
    bestForGrades: ['K', '1', '2', '3', '4', '5'],
    supportsVision: false,
    supportsJSON: true,
    responseFormat: undefined,  // Remove forced JSON mode
    temperature: 0.7,
    requiresStructuredPrompt: false
  },

  'deepseek-v3': {
    name: 'DeepSeek-V3',
    deploymentName: 'DeepSeek-V3-0324',
    endpoint: 'https://e4a-mdd7qx3v-swedencentral.cognitiveservices.azure.com/',
    apiKeySecret: 'azure-sweden-api-key',
    costPerMilTokensInput: 0.10,
    costPerMilTokensOutput: 0.20,
    maxTokens: 1000,
    contextWindow: 32000,
    strengths: ['validation', 'analysis', 'rule checking', 'cheap'],
    weaknesses: ['content generation', 'creativity'],
    bestForGrades: ['validation'],
    supportsVision: false,
    supportsJSON: true,
    responseFormat: 'json_object',
    temperature: 0.3,
    requiresStructuredPrompt: true
  }
};

// Grade to model mapping
export const GRADE_MODEL_MAP: Record<string, string> = {
  'K': 'gpt-35-turbo',  // Switched from phi-4 for reliability
  '1': 'gpt-35-turbo',  // Switched from phi-4 for reliability
  '2': 'gpt-35-turbo',  // Switched from phi-4 for reliability
  '3': 'llama-3.3-70b',
  '4': 'llama-3.3-70b',
  '5': 'llama-3.3-70b',
  '6': 'gpt-4o-mini',
  '7': 'gpt-4o-mini',
  '8': 'gpt-4o-mini',
  '9': 'gpt-4o',
  '10': 'gpt-4o',
  '11': 'gpt-4o',
  '12': 'gpt-4o'
};

// Fallback chain for each model
export const FALLBACK_CHAIN: Record<string, string[]> = {
  'phi-4': ['gpt-35-turbo', 'llama-3.3-70b', 'gpt-4o-mini'],
  'llama-3.3-70b': ['gpt-35-turbo', 'gpt-4o-mini', 'gpt-4o'],
  'gpt-4o-mini': ['llama-3.3-70b', 'gpt-4o'],
  'gpt-4o': ['gpt-4o-mini'], // Limited fallback for highest tier
  'gpt-35-turbo': ['llama-3.3-70b', 'gpt-4o-mini'],
  'deepseek-v3': ['llama-3.3-70b'] // Validation fallback
};

// Container overrides
export const CONTAINER_OVERRIDES: Record<string, string> = {
  'EXPERIENCE': 'gpt-4o', // Always use best for narrative
  'DISCOVER': 'gpt-4o',   // Always use best for exploration
  // LEARN and ASSESSMENT use grade-based selection
};

export function getModelForGrade(grade: string): ModelCapability {
  const modelName = GRADE_MODEL_MAP[grade] || 'gpt-4o';
  return MODEL_CAPABILITIES[modelName];
}

export function getModelByName(name: string): ModelCapability | undefined {
  return MODEL_CAPABILITIES[name];
}

export function getFallbackModels(modelName: string): ModelCapability[] {
  const fallbackNames = FALLBACK_CHAIN[modelName] || [];
  return fallbackNames.map(name => MODEL_CAPABILITIES[name]).filter(Boolean);
}

export function calculateCost(
  modelName: string,
  inputTokens: number,
  outputTokens: number
): number {
  const model = MODEL_CAPABILITIES[modelName];
  if (!model) return 0;

  const inputCost = (inputTokens / 1000) * model.costPerMilTokensInput;
  const outputCost = (outputTokens / 1000) * model.costPerMilTokensOutput;
  return inputCost + outputCost;
}