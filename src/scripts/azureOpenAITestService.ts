/**
 * Azure OpenAI Test Service
 * A Node.js compatible version of azureOpenAIService for testing
 */

import { OpenAI } from 'openai';

class AzureOpenAITestService {
  private clients: Map<string, OpenAI> = new Map();
  private config: any = null;
  
  constructor() {
    // Don't load config in constructor - will be done lazily
  }
  
  /**
   * Get configuration lazily to ensure env vars are loaded
   */
  private getConfig() {
    if (!this.config) {
      this.config = {
        endpoint: process.env.VITE_AZURE_OPENAI_ENDPOINT || 'https://pathfinity-ai-foundry.openai.azure.com/',
        apiKey: process.env.VITE_AZURE_OPENAI_API_KEY || process.env.AZURE_OPENAI_API_KEY || '',
        deployments: {
          gpt4o: process.env.VITE_AZURE_GPT4O_DEPLOYMENT || 'gpt-4o',
          gpt4: process.env.VITE_AZURE_GPT4_DEPLOYMENT || 'gpt-4o',  // Use gpt-4o for gpt4 calls
          gpt35: process.env.VITE_AZURE_GPT35_DEPLOYMENT || 'gpt-35-turbo'
        },
        apiVersion: '2024-08-01-preview'
      };
      
      console.log('🔧 Azure OpenAI Config loaded:', {
        endpoint: this.config.endpoint,
        hasApiKey: !!this.config.apiKey,
        apiKeyLength: this.config.apiKey?.length || 0,
        deployments: this.config.deployments
      });
    }
    return this.config;
  }
  
  /**
   * Get or create client for a specific model
   */
  private getClient(modelKey: 'gpt4o' | 'gpt4' | 'gpt35'): OpenAI {
    const config = this.getConfig();
    
    if (!this.clients.has(modelKey)) {
      const deployment = config.deployments[modelKey];
      const client = new OpenAI({
        apiKey: config.apiKey,
        baseURL: `${config.endpoint}openai/deployments/${deployment}`,
        defaultQuery: { 'api-version': config.apiVersion },
        defaultHeaders: {
          'api-key': config.apiKey,
          'Content-Type': 'application/json'
        }
      });
      this.clients.set(modelKey, client);
    }
    return this.clients.get(modelKey)!;
  }
  
  /**
   * Generate content with specified model
   */
  async generateWithModel(
    model: 'gpt4o' | 'gpt4' | 'gpt35' | string,
    prompt: string,
    systemPrompt: string = 'You are a helpful assistant.',
    options: {
      temperature?: number;
      maxTokens?: number;
      jsonMode?: boolean;
    } = {}
  ): Promise<string> {
    try {
      // Map model string to our model keys
      let modelKey: 'gpt4o' | 'gpt4' | 'gpt35';
      if (model === 'gpt-4o' || model === 'gpt4o') {
        modelKey = 'gpt4o';
      } else if (model === 'gpt-4' || model === 'gpt4') {
        modelKey = 'gpt4';
      } else {
        modelKey = 'gpt35';
      }
      
      const client = this.getClient(modelKey);
      
      console.log(`📤 Calling Azure OpenAI ${modelKey} with prompt length: ${prompt.length}`);
      
      const messages: any[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ];
      
      const config = this.getConfig();
      const requestOptions: any = {
        model: config.deployments[modelKey],
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000
      };
      
      // Add response format for JSON mode
      if (options.jsonMode) {
        requestOptions.response_format = { type: 'json_object' };
      }
      
      const response = await client.chat.completions.create(requestOptions);
      
      const content = response.choices[0]?.message?.content || '';
      console.log(`📥 Received response with length: ${content.length}`);
      
      return content;
    } catch (error: any) {
      console.error('❌ Azure OpenAI call failed:', error?.message || error);
      if (error?.status === 401) {
        console.error('Authentication failed. Check your API key.');
      }
      throw error;
    }
  }
}

// Export singleton instance
export const azureOpenAITestService = new AzureOpenAITestService();