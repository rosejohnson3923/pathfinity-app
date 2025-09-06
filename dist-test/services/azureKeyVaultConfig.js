"use strict";
// Azure Key Vault Configuration Service
// Works in both development and production
Object.defineProperty(exports, "__esModule", { value: true });
exports.azureKeyVaultConfig = void 0;
const keyvault_secrets_1 = require("@azure/keyvault-secrets");
const identity_1 = require("@azure/identity");
class AzureKeyVaultConfigService {
    constructor() {
        this.secretClient = null;
        this.config = null;
        this.cache = new Map();
        // Use environment variable to determine if we should use Key Vault
        this.useKeyVault = import.meta.env.VITE_USE_KEY_VAULT === 'true';
        this.keyVaultName = import.meta.env.VITE_AZURE_KEY_VAULT_NAME || 'pathfinity-dev-kv';
        // Key Vault SDK cannot run in browser environment
        // In production, we must use environment variables set during build
        if (this.useKeyVault && typeof window === 'undefined') {
            const keyVaultUrl = `https://${this.keyVaultName}.vault.azure.net`;
            try {
                // DefaultAzureCredential works with:
                // - Azure CLI (az login) for local development
                // - Managed Identity in Azure
                // - Service Principal for CI/CD
                const credential = new identity_1.DefaultAzureCredential();
                this.secretClient = new keyvault_secrets_1.SecretClient(keyVaultUrl, credential);
                console.log('Azure Key Vault initialized successfully');
            }
            catch (error) {
                console.error('Failed to initialize Key Vault client:', error);
                console.warn('Falling back to environment variables');
                this.useKeyVault = false;
            }
        }
        else if (this.useKeyVault) {
            console.log('Key Vault cannot be used in browser environment, using environment variables');
            this.useKeyVault = false;
        }
    }
    async getConfig() {
        if (this.config) {
            return this.config;
        }
        if (this.useKeyVault && this.secretClient) {
            try {
                this.config = await this.loadFromKeyVault();
            }
            catch (error) {
                console.error('Failed to load from Key Vault:', error);
                console.warn('Falling back to environment variables');
                this.config = this.loadFromEnvironment();
            }
        }
        else {
            this.config = this.loadFromEnvironment();
        }
        // Validate that we have required configuration
        if (!this.config.openAIEndpoint) {
            console.warn('No Azure OpenAI endpoint configured, using default');
            this.config.openAIEndpoint = 'https://pathfinity-ai.openai.azure.com/';
        }
        return this.config;
    }
    async getSecret(secretName) {
        // Check cache first
        if (this.cache.has(secretName)) {
            return this.cache.get(secretName);
        }
        if (!this.secretClient) {
            throw new Error('Key Vault client not initialized');
        }
        try {
            const secret = await this.secretClient.getSecret(secretName);
            const value = secret.value || '';
            this.cache.set(secretName, value);
            return value;
        }
        catch (error) {
            console.error(`Failed to retrieve secret ${secretName}:`, error);
            throw error;
        }
    }
    async loadFromKeyVault() {
        console.log('Loading configuration from Azure Key Vault...');
        // Fetch all secrets in parallel for better performance
        const [openAIKey, cognitiveServicesKey, cognitiveServicesKeySecondary, speechKey, translatorKey, dalleKey, supabaseAnonKey, supabaseServiceRoleKey, communicationServicesConnectionString, endpoints] = await Promise.all([
            this.getSecret('azure-openai-key'),
            this.getSecret('azure-cognitive-services-key').catch(() => ''),
            this.getSecret('azure-cognitive-services-key-secondary').catch(() => ''),
            this.getSecret('azure-speech-key').catch(() => ''),
            this.getSecret('azure-translator-key').catch(() => ''),
            this.getSecret('azure-dalle-key'),
            this.getSecret('supabase-anon-key'),
            this.getSecret('supabase-service-role-key'),
            this.getSecret('azure-communication-services-connection-string'),
            this.getSecret('azure-endpoints-config').catch(() => '{}')
        ]);
        // Parse endpoints config or use defaults
        let endpointConfig;
        try {
            endpointConfig = JSON.parse(endpoints);
        }
        catch {
            endpointConfig = {};
        }
        return {
            openAIEndpoint: endpointConfig.openAI || import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || 'https://pathfinity-ai.openai.azure.com/',
            aiFoundryEndpoint: endpointConfig.aiFoundry || import.meta.env.VITE_AZURE_AI_FOUNDRY_ENDPOINT || 'https://pathfinity-ai.services.ai.azure.com/',
            supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://zohdmprtfyijneqnwjsu.supabase.co',
            openAIKey,
            cognitiveServicesKey,
            cognitiveServicesKeySecondary,
            speechKey,
            translatorKey,
            dalleKey,
            supabaseAnonKey,
            supabaseServiceRoleKey,
            communicationServicesConnectionString,
            deployments: {
                gpt4o: endpointConfig.deployments?.gpt4o || 'gpt-4o',
                gpt4: endpointConfig.deployments?.gpt4 || 'gpt-4',
                gpt35: endpointConfig.deployments?.gpt35 || 'gpt-35-turbo',
                dalle: endpointConfig.deployments?.dalle || 'dall-e-3'
            }
        };
    }
    loadFromEnvironment() {
        console.log('Loading configuration from environment variables...');
        // Log which env vars are available (without showing values)
        console.log('Environment variables available:', {
            hasOpenAIKey: !!import.meta.env.VITE_AZURE_OPENAI_API_KEY,
            hasEndpoint: !!import.meta.env.VITE_AZURE_OPENAI_ENDPOINT,
            hasDalleKey: !!import.meta.env.VITE_AZURE_DALLE_API_KEY,
            hasSpeechKey: !!import.meta.env.VITE_AZURE_SPEECH_KEY,
            environment: import.meta.env.MODE
        });
        // Provide default endpoints if not configured
        return {
            openAIEndpoint: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || 'https://pathfinity-ai.openai.azure.com/',
            aiFoundryEndpoint: import.meta.env.VITE_AZURE_AI_FOUNDRY_ENDPOINT || 'https://pathfinity-ai.services.ai.azure.com/',
            supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://zohdmprtfyijneqnwjsu.supabase.co',
            openAIKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY || '',
            cognitiveServicesKey: import.meta.env.VITE_AZURE_COGNITIVE_SERVICES_KEY || '',
            cognitiveServicesKeySecondary: import.meta.env.VITE_AZURE_COGNITIVE_SERVICES_KEY_SECONDARY || '',
            speechKey: import.meta.env.VITE_AZURE_SPEECH_KEY || '',
            translatorKey: import.meta.env.VITE_AZURE_TRANSLATOR_KEY || '',
            dalleKey: import.meta.env.VITE_AZURE_DALLE_API_KEY || import.meta.env.VITE_AZURE_OPENAI_API_KEY || '',
            supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
            supabaseServiceRoleKey: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '',
            communicationServicesConnectionString: import.meta.env.VITE_AZURE_COMMUNICATION_SERVICES_CONNECTION_STRING || '',
            deployments: {
                gpt4o: import.meta.env.VITE_AZURE_GPT4O_DEPLOYMENT || 'gpt-4o',
                gpt4: import.meta.env.VITE_AZURE_GPT4_DEPLOYMENT || 'gpt-4',
                gpt35: import.meta.env.VITE_AZURE_GPT35_DEPLOYMENT || 'gpt-35-turbo',
                dalle: import.meta.env.VITE_AZURE_DALLE_DEPLOYMENT || 'dall-e-3'
            }
        };
    }
    // Helper methods for specific services
    async getOpenAIConfig() {
        const config = await this.getConfig();
        // Ensure endpoint always has a value
        const endpoint = config.openAIEndpoint || 'https://pathfinity-ai.openai.azure.com/';
        // Log the configuration status (without revealing secrets)
        console.log('OpenAI Config Status:', {
            hasApiKey: !!config.openAIKey,
            apiKeyLength: config.openAIKey?.length || 0,
            endpoint: endpoint,
            deployments: config.deployments
        });
        if (!config.openAIKey) {
            console.error('⚠️ Azure OpenAI API key is not configured!');
            console.log('Please ensure VITE_AZURE_OPENAI_API_KEY is set in Netlify environment variables');
        }
        return {
            endpoint,
            apiKey: config.openAIKey,
            deployments: config.deployments
        };
    }
    async getCognitiveServicesConfig() {
        const config = await this.getConfig();
        return {
            endpoint: config.aiFoundryEndpoint,
            apiKey: config.cognitiveServicesKey,
            apiKeySecondary: config.cognitiveServicesKeySecondary,
            speechKey: config.speechKey,
            translatorKey: config.translatorKey
        };
    }
    async getDalleConfig() {
        const config = await this.getConfig();
        // If no specific DALL-E key, use OpenAI key
        const apiKey = config.dalleKey || config.openAIKey;
        console.log('🔐 DALL-E Config Debug:', {
            hasDalleKey: !!config.dalleKey,
            hasOpenAIKey: !!config.openAIKey,
            dalleKeyLength: config.dalleKey?.length || 0,
            openAIKeyLength: config.openAIKey?.length || 0,
            endpoint: config.openAIEndpoint,
            deployment: config.deployments.dalle,
            usingKey: apiKey ? (config.dalleKey ? 'DALL-E Key' : 'OpenAI Key') : 'No Key'
        });
        return {
            endpoint: config.openAIEndpoint,
            apiKey: apiKey,
            deployment: config.deployments.dalle
        };
    }
    async getSupabaseConfig() {
        const config = await this.getConfig();
        return {
            url: config.supabaseUrl,
            anonKey: config.supabaseAnonKey,
            serviceRoleKey: config.supabaseServiceRoleKey
        };
    }
    async getCommunicationServicesConfig() {
        const config = await this.getConfig();
        return {
            connectionString: config.communicationServicesConnectionString
        };
    }
    // Clear cache (useful for key rotation)
    clearCache() {
        this.cache.clear();
        this.config = null;
    }
}
// Export singleton instance
exports.azureKeyVaultConfig = new AzureKeyVaultConfigService();
// Example usage in your app:
/*
import { azureKeyVaultConfig } from './services/azureKeyVaultConfig';

// In your OpenAI service
const openAIConfig = await azureKeyVaultConfig.getOpenAIConfig();
const client = new OpenAIClient(
  openAIConfig.endpoint,
  new AzureKeyCredential(openAIConfig.apiKey)
);
*/ 
