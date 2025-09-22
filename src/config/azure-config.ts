/**
 * Azure Configuration
 * Handles secure access to Azure services using Key Vault in production
 * and environment variables in development
 */

import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';

class AzureConfig {
  private secretClient: SecretClient | null = null;
  private cache: Map<string, string> = new Map();
  private isProduction = process.env.NODE_ENV === 'production';

  constructor() {
    if (this.isProduction) {
      // In production, use Key Vault
      const keyVaultName = process.env.KEY_VAULT_NAME || 'pathfinity-kv-2823';
      const keyVaultUrl = `https://${keyVaultName}.vault.azure.net`;

      // Uses Managed Identity in production
      const credential = new DefaultAzureCredential();
      this.secretClient = new SecretClient(keyVaultUrl, credential);
    }
  }

  /**
   * Get secret from Key Vault (production) or env variables (development)
   */
  async getSecret(secretName: string): Promise<string> {
    // Check cache first
    if (this.cache.has(secretName)) {
      return this.cache.get(secretName)!;
    }

    let secretValue: string;

    if (this.isProduction && this.secretClient) {
      try {
        // Get from Key Vault
        const secret = await this.secretClient.getSecret(secretName);
        secretValue = secret.value || '';
      } catch (error) {
        console.error(`Failed to get secret ${secretName} from Key Vault:`, error);
        throw new Error(`Secret ${secretName} not found`);
      }
    } else {
      // Get from environment variables in development
      const envMap: Record<string, string> = {
        'AzureStorageConnectionString': 'AZURE_STORAGE_CONNECTION_STRING',
        'OpenAIApiKey': 'OPENAI_API_KEY',
        'AnthropicApiKey': 'ANTHROPIC_API_KEY',
        'AzureSpeechKey': 'AZURE_SPEECH_KEY',
        'GoogleApiKey': 'GOOGLE_API_KEY'
      };

      const envVar = envMap[secretName] || secretName;
      secretValue = process.env[envVar] || '';

      if (!secretValue) {
        throw new Error(`Environment variable ${envVar} not found`);
      }
    }

    // Cache the value
    this.cache.set(secretName, secretValue);
    return secretValue;
  }

  /**
   * Get storage connection string
   */
  async getStorageConnectionString(): Promise<string> {
    return this.getSecret('AzureStorageConnectionString');
  }

  /**
   * Get AI service keys
   */
  async getOpenAIKey(): Promise<string> {
    return this.getSecret('OpenAIApiKey');
  }

  async getAnthropicKey(): Promise<string> {
    return this.getSecret('AnthropicApiKey');
  }

  async getAzureSpeechKey(): Promise<string> {
    return this.getSecret('AzureSpeechKey');
  }

  async getGoogleApiKey(): Promise<string> {
    return this.getSecret('GoogleApiKey');
  }
}

// Singleton instance
const azureConfig = new AzureConfig();
export default azureConfig;