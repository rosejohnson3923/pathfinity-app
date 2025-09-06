// Azure Secure Configuration Service
// This service provides a unified interface for accessing configuration
// Uses environment variables in development and Azure Key Vault in production

interface AzureConfig {
  openAIEndpoint: string;
  aiFoundryEndpoint: string;
  openAIKey: string;
  cognitiveServicesKey: string;
  speechKey: string;
  translatorKey: string;
  dalleKey: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  deployments: {
    gpt4o: string;
    gpt4: string;
    gpt35: string;
    dalle: string;
  };
}

class AzureSecureConfigService {
  private config: AzureConfig | null = null;
  private isProduction = import.meta.env.PROD;

  async getConfig(): Promise<AzureConfig> {
    if (this.config) {
      return this.config;
    }

    if (this.isProduction) {
      // In production, use Azure Key Vault
      this.config = await this.loadFromKeyVault();
    } else {
      // In development, use environment variables
      this.config = this.loadFromEnvironment();
    }

    return this.config;
  }

  private async loadFromEnvironment(): Promise<AzureConfig> {
    // Check if we should use Key Vault even in development
    const useKeyVault = import.meta.env.VITE_USE_KEY_VAULT === 'true';
    
    if (useKeyVault) {
      console.log('🔐 Loading configuration from Azure Key Vault (development mode)');
      return await this.loadFromKeyVault();
    }

    // Validate required environment variables
    const required = [
      'VITE_AZURE_OPENAI_ENDPOINT',
      'VITE_AZURE_AI_FOUNDRY_ENDPOINT',
      'VITE_SUPABASE_URL'
    ];

    const missing = required.filter(key => !import.meta.env[key]);
    if (missing.length > 0) {
      console.warn(`Missing environment variables: ${missing.join(', ')}`);
      console.warn('Please check your .env file or configure Azure Key Vault');
    }

    return {
      openAIEndpoint: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || '',
      aiFoundryEndpoint: import.meta.env.VITE_AZURE_AI_FOUNDRY_ENDPOINT || '',
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
      openAIKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY || '',
      cognitiveServicesKey: import.meta.env.VITE_AZURE_COGNITIVE_SERVICES_KEY || '',
      speechKey: import.meta.env.VITE_AZURE_SPEECH_KEY || '',
      translatorKey: import.meta.env.VITE_AZURE_TRANSLATOR_KEY || '',
      dalleKey: import.meta.env.VITE_AZURE_DALLE_API_KEY || '',
      supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      deployments: {
        gpt4o: import.meta.env.VITE_AZURE_GPT4O_DEPLOYMENT || 'gpt-4o',
        gpt4: import.meta.env.VITE_AZURE_GPT4_DEPLOYMENT || 'gpt-4',
        gpt35: import.meta.env.VITE_AZURE_GPT35_DEPLOYMENT || 'gpt-35-turbo',
        dalle: import.meta.env.VITE_AZURE_DALLE_DEPLOYMENT || 'dall-e-3'
      }
    };
  }

  private async loadFromKeyVault(): Promise<AzureConfig> {
    // Use the actual Azure Key Vault service
    const { azureKeyVaultConfig } = await import('./azureKeyVaultConfig');
    return await azureKeyVaultConfig.getConfig();
  }

  // Utility methods for specific services
  async getOpenAIConfig() {
    const config = await this.getConfig();
    return {
      endpoint: config.openAIEndpoint,
      apiKey: config.openAIKey,
      deployments: config.deployments
    };
  }

  async getCognitiveServicesConfig() {
    const config = await this.getConfig();
    return {
      endpoint: config.aiFoundryEndpoint,
      apiKey: config.cognitiveServicesKey,
      speechKey: config.speechKey,
      translatorKey: config.translatorKey
    };
  }

  async getDalleConfig() {
    const config = await this.getConfig();
    return {
      endpoint: config.openAIEndpoint,
      apiKey: config.dalleKey,
      deployment: config.deployments.dalle
    };
  }

  // Method to validate configuration
  async validateConfig(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const config = await this.getConfig();

    // Check endpoints
    if (!config.openAIEndpoint) {
      errors.push('OpenAI endpoint is not configured');
    }
    if (!config.aiFoundryEndpoint) {
      errors.push('AI Foundry endpoint is not configured');
    }

    // Check API keys (just check they exist, not the actual values)
    if (!config.openAIKey) {
      errors.push('OpenAI API key is not configured');
    }
    if (!config.cognitiveServicesKey) {
      errors.push('Cognitive Services key is not configured');
    }

    // Validate endpoint URLs
    try {
      new URL(config.openAIEndpoint);
    } catch {
      errors.push('Invalid OpenAI endpoint URL');
    }

    try {
      new URL(config.aiFoundryEndpoint);
    } catch {
      errors.push('Invalid AI Foundry endpoint URL');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const azureSecureConfig = new AzureSecureConfigService();

// Export the secure config as the main export (uses Key Vault)
export { azureKeyVaultConfig as getSecureConfig } from './azureKeyVaultConfig';

// Export validation function for use in app initialization
export async function validateAzureConfiguration(): Promise<boolean> {
  const { valid, errors } = await azureSecureConfig.validateConfig();
  
  if (!valid) {
    console.error('Azure configuration validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    
    if (import.meta.env.DEV) {
      console.warn('Running in development mode with invalid configuration');
      console.warn('Please check your .env file');
    }
  }
  
  return valid;
}