import { azureKeyVaultConfig } from './azureKeyVaultConfig';

class PattyService {
  private openAIClient: any = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Get configuration from Key Vault
      const config = await azureKeyVaultConfig.getOpenAIConfig();
      
      // Initialize OpenAI client
      const { OpenAIClient, AzureKeyCredential } = await import('@azure/openai');
      this.openAIClient = new OpenAIClient(
        config.endpoint,
        new AzureKeyCredential(config.apiKey)
      );
      
      this.isInitialized = true;
      console.log('Patty service initialized with secure configuration');
    } catch (error) {
      console.error('Failed to initialize Patty service:', error);
      throw error;
    }
  }

  async generateResponse(prompt: string, context?: any) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const config = await azureKeyVaultConfig.getOpenAIConfig();
    
    try {
      const response = await this.openAIClient.getChatCompletions(
        config.deployments.gpt4o,
        [
          {
            role: 'system',
            content: 'You are Patty, a helpful AI assistant for the Pathfinity education platform.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        {
          temperature: 0.7,
          maxTokens: 500
        }
      );

      return response.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.';
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }

  async generateImage(prompt: string) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const dalleConfig = await azureKeyVaultConfig.getDalleConfig();
    
    try {
      const response = await this.openAIClient.getImages(
        dalleConfig.deployment,
        prompt,
        {
          n: 1,
          size: '1024x1024'
        }
      );

      return response.data[0]?.url;
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }
}

export const pattyService = new PattyService();