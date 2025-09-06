/**
 * TEST AZURE CONFIGURATION
 * Simplified Azure OpenAI configuration for integration testing
 */

import { OpenAI } from 'openai';

// Test configuration using available environment variables
export const TEST_AZURE_CONFIG = {
  // Use the available API key for all models
  apiKey: process.env.VITE_AZURE_OPENAI_API_KEY || '',
  
  // Test endpoints - using the actual deployed endpoints
  endpoint: 'https://pathfinity-ai.openai.azure.com/',
  
  // Model deployments
  models: {
    gpt4o: 'gpt-4o',
    gpt4: 'gpt-4', 
    gpt35: 'gpt-35-turbo'
  },
  
  apiVersion: '2025-01-01-preview'
};

// Create a simplified Azure OpenAI client for testing
export const createTestAzureClient = (modelName: string = 'gpt-4') => {
  if (!TEST_AZURE_CONFIG.apiKey) {
    throw new Error('VITE_AZURE_OPENAI_API_KEY not found in environment variables');
  }

  const baseURL = `${TEST_AZURE_CONFIG.endpoint}openai/deployments/${modelName}`;
  
  console.log('🔧 Creating Azure OpenAI test client:', {
    model: modelName,
    endpoint: TEST_AZURE_CONFIG.endpoint,
    hasApiKey: !!TEST_AZURE_CONFIG.apiKey
  });

  return new OpenAI({
    apiKey: TEST_AZURE_CONFIG.apiKey,
    baseURL,
    defaultQuery: { 'api-version': TEST_AZURE_CONFIG.apiVersion },
    defaultHeaders: {
      'api-key': TEST_AZURE_CONFIG.apiKey,
    },
    dangerouslyAllowBrowser: true
  });
};

// Simple test service for integration testing
export class TestAzureOpenAIService {
  private client: OpenAI;

  constructor(modelName: string = 'gpt-4') {
    this.client = createTestAzureClient(modelName);
  }

  async testHealthCheck(): Promise<{ status: 'healthy' | 'error', message: string }> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4', // Use deployment name
        messages: [{ role: 'user', content: 'Say "healthy" if you can respond.' }],
        max_tokens: 10,
        temperature: 0
      });
      
      return {
        status: 'healthy',
        message: `Azure OpenAI test service is operational. Response: ${response.choices[0]?.message?.content}`
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: `Azure OpenAI test service error: ${error.message}`
      };
    }
  }

  async testContentGeneration(prompt: string): Promise<any> {
    try {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { 
            role: 'system', 
            content: 'You are an educational content creator. Generate safe, age-appropriate content for children. Respond in JSON format.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No content generated');

      return JSON.parse(content);
    } catch (error: any) {
      throw new Error(`Content generation failed: ${error.message}`);
    }
  }

  async testSafetyCheck(content: string, ageGroup: string): Promise<any> {
    try {
      const safetyPrompt = `Analyze this educational content for child safety.
      
Content: "${content}"
Target Age: ${ageGroup}

Return JSON with: {
  "isAppropriate": boolean,
  "ageRating": string,
  "concerns": array,
  "recommendations": array,
  "coppaCompliant": boolean
}`;

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: safetyPrompt }],
        temperature: 0.1,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      });

      const safetyResult = JSON.parse(response.choices[0]?.message?.content || '{}');
      return safetyResult;
    } catch (error: any) {
      // Fail safe
      return {
        isAppropriate: false,
        ageRating: 'Unknown',
        concerns: [`Safety check failed: ${error.message}`],
        recommendations: ['Manual review required'],
        coppaCompliant: false
      };
    }
  }
}