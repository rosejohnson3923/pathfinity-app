/**
 * AZURE OPENAI SERVICE
 * Integrates with Azure AI Foundry for unlimited content generation
 * Microsoft Sponsorship API Access
 */

import { OpenAI } from 'openai';
import { azureKeyVaultConfig } from './azureKeyVaultConfig';
import { safeJSONParse } from '../utils/jsonSanitizer';

// Azure AI Foundry Configuration - Will be loaded from Key Vault
let AZURE_CONFIG = {
  // Model-specific configurations
  models: {
    gpt4o: {
      deployment: 'gpt-4o',
      apiKey: '',
      endpoint: 'https://pathfinity-ai.openai.azure.com/',
    },
    gpt4: {
      deployment: 'gpt-4',
      apiKey: '',
      endpoint: 'https://pathfinity-ai.openai.azure.com/',
    },
    gpt35: {
      deployment: 'gpt-35-turbo',
      apiKey: '',
      endpoint: 'https://pathfinity-ai.openai.azure.com/',
    }
  },
  
  // Legacy for backward compatibility
  openaiEndpoint: 'https://pathfinity-ai.openai.azure.com/',
  apiKey: '',
  
  // Speech Services
  speechEndpoints: {
    speechToText: 'https://eastus.stt.speech.microsoft.com',
    textToSpeech: 'https://eastus.tts.speech.microsoft.com',
    customVoice: 'https://pathfinity-ai.cognitiveservices.azure.com/'
  },
  
  // Translation Services
  translationEndpoints: {
    textTranslation: 'https://api.cognitive.microsofttranslator.com/',
    documentTranslation: 'https://pathfinity-ai.cognitiveservices.azure.com/'
  },
  
  // AI Services (Computer Vision, Content Safety, etc.)
  aiServicesEndpoint: 'https://pathfinity-ai.services.ai.azure.com/',
  
  apiVersion: '2025-01-01-preview'
};

// Initialize configuration from Key Vault
let configInitialized = false;
const initializeConfig = async () => {
  if (configInitialized) return;
  
  try {
    const openAIConfig = await azureKeyVaultConfig.getOpenAIConfig();
    
    // Update the configuration with Key Vault values
    AZURE_CONFIG.openaiEndpoint = openAIConfig.endpoint;
    AZURE_CONFIG.apiKey = openAIConfig.apiKey;
    
    // Update model configurations
    AZURE_CONFIG.models.gpt4o.apiKey = openAIConfig.apiKey;
    AZURE_CONFIG.models.gpt4o.endpoint = openAIConfig.endpoint;
    AZURE_CONFIG.models.gpt4o.deployment = openAIConfig.deployments.gpt4o;
    
    AZURE_CONFIG.models.gpt4.apiKey = openAIConfig.apiKey;
    AZURE_CONFIG.models.gpt4.endpoint = openAIConfig.endpoint;
    AZURE_CONFIG.models.gpt4.deployment = openAIConfig.deployments.gpt4;
    
    AZURE_CONFIG.models.gpt35.apiKey = openAIConfig.apiKey;
    AZURE_CONFIG.models.gpt35.deployment = openAIConfig.deployments.gpt35;
    
    configInitialized = true;
    console.log('✅ Azure OpenAI configuration loaded from Key Vault');
  } catch (error) {
    console.error('❌ Failed to load Azure OpenAI configuration from Key Vault:', error);
    // Fall back to environment variables if Key Vault fails
    AZURE_CONFIG.apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY || '';
    AZURE_CONFIG.models.gpt4o.apiKey = import.meta.env.VITE_AZURE_GPT4O_API_KEY || AZURE_CONFIG.apiKey;
    AZURE_CONFIG.models.gpt4.apiKey = import.meta.env.VITE_AZURE_GPT4_API_KEY || AZURE_CONFIG.apiKey;
    AZURE_CONFIG.models.gpt35.apiKey = import.meta.env.VITE_AZURE_GPT35_API_KEY || AZURE_CONFIG.apiKey;
    configInitialized = true;
  }
};

// Create model-specific clients
const createAzureClient = async (modelKey: 'gpt4o' | 'gpt4' | 'gpt35') => {
  await initializeConfig();
  
  const model = AZURE_CONFIG.models[modelKey];
  
  // Debug logging for production issues
  console.log(`🔍 Azure Client Config for ${modelKey}:`, {
    hasApiKey: !!model.apiKey,
    apiKeyLength: model.apiKey?.length || 0,
    apiKeyPrefix: model.apiKey ? model.apiKey.substring(0, 8) + '...' : 'MISSING',
    endpoint: model.endpoint,
    deployment: model.deployment,
    fullBaseURL: `${model.endpoint}openai/deployments/${model.deployment}`
  });
  
  // Check if API key is missing
  if (!model.apiKey) {
    console.error(`❌ No API key for ${modelKey}. Env vars:`, {
      VITE_AZURE_OPENAI_API_KEY: !!import.meta.env.VITE_AZURE_OPENAI_API_KEY,
      ALL_ENV_KEYS: Object.keys(import.meta.env).filter(k => k.startsWith('VITE_'))
    });
  }
  
  const baseURL = modelKey === 'gpt35' 
    ? `${model.endpoint}openai/deployments/${model.deployment}`
    : `${model.endpoint}openai/deployments/${model.deployment}`;
    
  return new OpenAI({
    apiKey: model.apiKey,
    baseURL,
    defaultQuery: { 'api-version': AZURE_CONFIG.apiVersion },
    defaultHeaders: {
      'api-key': model.apiKey,
    },
    dangerouslyAllowBrowser: true
  });
};

export interface AzureAIRequest {
  prompt: string;
  model?: 'gpt-4' | 'gpt-4o' | 'gpt-35-turbo';
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface ContentGenerationRequest {
  contentType: 'instruction' | 'practice' | 'assessment' | 'career_scenario' | 'narrative';
  grade: string;
  subject: string;
  skills: string[];
  learningContainer: 'learn' | 'experience' | 'discover';
  studentProfile?: any;
  quantity?: number;
}

export class AzureOpenAIService {
  
  /**
   * Generate educational content using Azure OpenAI
   */
  async generateEducationalContent(request: ContentGenerationRequest): Promise<any> {
    const { contentType, grade, subject, skills, learningContainer, studentProfile, quantity = 1 } = request;
    
    // Initialize configuration first
    await initializeConfig();
    
    // Check if Azure keys are properly configured
    const hasValidConfig = AZURE_CONFIG.models.gpt4o.apiKey && 
                          AZURE_CONFIG.models.gpt4o.apiKey.length > 10;
    
    if (!hasValidConfig) {
      console.log('🔄 Using mock AI content generation (Azure keys not configured)');
      return this.generateMockContent(request);
    }
    
    const systemPrompt = this.buildEducationalSystemPrompt(contentType, learningContainer);
    const userPrompt = this.buildEducationalPrompt(request);
    
    try {
      const client = await createAzureClient('gpt4o'); // Use GPT-4o for best quality
      const response = await client.chat.completions.create({
        model: AZURE_CONFIG.models.gpt4o.deployment,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No content generated');

      return JSON.parse(content);
      
    } catch (error) {
      console.error('Azure OpenAI generation error:', error);
      console.log('🔄 Falling back to mock content generation');
      return this.generateMockContent(request);
    }
  }

  /**
   * Generate mock educational content for demo purposes
   */
  private generateMockContent(request: ContentGenerationRequest): any {
    const { contentType, grade, subject, skills } = request;
    
    return {
      title: `${subject} ${contentType} for Grade ${grade}`,
      description: `Engaging ${subject} content designed for grade ${grade} students`,
      content: {
        introduction: `Welcome to your ${subject} learning adventure! Today we'll explore ${skills[0] || 'fundamental concepts'}.`,
        main_content: {
          lesson: `This ${contentType} covers important ${subject} skills appropriate for grade ${grade} students.`,
          activities: [
            `Interactive ${subject} exploration`,
            `Hands-on practice with ${skills[0] || 'key concepts'}`,
            `Creative problem-solving challenge`
          ],
          examples: [
            `Real-world ${subject} applications`,
            `Age-appropriate examples for grade ${grade}`,
            `Fun facts and discoveries`
          ]
        },
        conclusion: `Great work! You've learned valuable ${subject} skills that will help you succeed.`,
        assessment: {
          questions: [
            {
              question: `What did you learn about ${subject} today?`,
              type: 'open_ended'
            }
          ]
        }
      },
      metadata: {
        generated_by: 'mock_ai',
        grade,
        subject,
        skills,
        contentType,
        created_at: new Date().toISOString()
      }
    };
  }

  /**
   * Generate bulk content for testbed (unlimited with free Azure!)
   */
  async generateBulkTestbedContent(
    grades: string[], 
    subjects: string[], 
    containers: string[]
  ): Promise<any[]> {
    const generatedContent = [];
    
    // With free Azure AI, we can generate massive amounts without cost concern!
    for (const grade of grades) {
      for (const subject of subjects) {
        for (const container of containers) {
          try {
            const content = await this.generateEducationalContent({
              contentType: container === 'learn' ? 'instruction' : 
                          container === 'experience' ? 'career_scenario' : 'narrative',
              grade,
              subject,
              skills: this.getSkillsForGrade(grade, subject),
              learningContainer: container as 'learn' | 'experience' | 'discover',
              quantity: 3 // Generate 3 pieces per combination
            });
            
            generatedContent.push({
              grade,
              subject,
              container,
              content,
              generatedAt: new Date().toISOString(),
              provider: 'azure-openai'
            });
            
            // Small delay to avoid rate limits (though free tier is generous)
            await this.delay(500);
            
          } catch (error) {
            console.error(`Failed to generate ${container} content for ${grade} ${subject}:`, error);
          }
        }
      }
    }
    
    return generatedContent;
  }

  /**
   * Generate personalized content for individual students
   */
  async generatePersonalizedContent(
    studentProfile: any, 
    contentType: string, 
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<any> {
    const systemPrompt = `You are Finn, Pathfinity's AI learning companion. Generate highly personalized educational content.
    
PERSONALIZATION RULES:
- Adapt to student's learning style: ${studentProfile.learning_preferences?.learning_style}
- Attention span: ${studentProfile.learning_preferences?.attention_span}
- Grade level: ${studentProfile.grade_level}
- Previous performance patterns: Consider student's strengths and challenges
- Interest-based examples: Use topics that engage this age group

Create content that feels custom-made for this specific student.`;

    const userPrompt = `Create ${contentType} content for:
Student: ${studentProfile.display_name} (Grade ${studentProfile.grade_level})
Difficulty: ${difficulty}
Learning Style: ${studentProfile.learning_preferences?.learning_style}

Make this content feel personally crafted for this student's interests and learning needs.
Return valid JSON with the content structure.`;

    try {
      const client = await createAzureClient('gpt4o');
      const response = await client.chat.completions.create({
        model: AZURE_CONFIG.models.gpt4o.deployment,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8, // Higher creativity for personalization
        max_tokens: 3000,
        response_format: { type: 'json_object' }
      });

      return safeJSONParse(response.choices[0]?.message?.content || '{}', {});
      
    } catch (error) {
      console.error('Personalized content generation error:', error);
      throw error;
    }
  }

  /**
   * Generate assessment questions with unlimited quantity
   */
  async generateUnlimitedAssessments(
    grade: string, 
    subject: string, 
    skillCodes: string[], 
    quantity: number = 50
  ): Promise<any[]> {
    const questions = [];
    
    // Generate in batches of 10 (free Azure allows unlimited calls!)
    const batchSize = 10;
    const batches = Math.ceil(quantity / batchSize);
    
    for (let i = 0; i < batches; i++) {
      const batchQuantity = Math.min(batchSize, quantity - (i * batchSize));
      
      const prompt = `Generate ${batchQuantity} assessment questions for Grade ${grade} ${subject}.
Skills to test: ${skillCodes.join(', ')}

Create a mix of:
- Multiple choice (4 options)
- True/false
- Fill in the blank
- Short answer

Return JSON with questions array containing question_text, type, options, correct_answer, explanation.`;

      try {
        const client = await createAzureClient('gpt4');
        const response = await client.chat.completions.create({
          model: AZURE_CONFIG.models.gpt4.deployment,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.6,
          max_tokens: 3000,
          response_format: { type: 'json_object' }
        });

        const batch = safeJSONParse(response.choices[0]?.message?.content || '{"questions": []}', { questions: [] });
        questions.push(...(batch.questions || []));
        
        await this.delay(300); // Small delay between batches
        
      } catch (error) {
        console.error(`Assessment batch ${i + 1} failed:`, error);
      }
    }
    
    return questions;
  }

  /**
   * AI-Powered Analytics and Insights
   */
  async generateTeacherInsights(studentData: any[], performanceMetrics: any): Promise<any> {
    const prompt = `Analyze student performance data and generate actionable insights for teachers.

STUDENT DATA:
${JSON.stringify(studentData, null, 2)}

PERFORMANCE METRICS:
${JSON.stringify(performanceMetrics, null, 2)}

Generate insights covering:
1. Learning patterns and trends
2. Students who need intervention
3. Successful teaching strategies
4. Personalized recommendations for each student
5. Class-wide optimization suggestions

Return detailed JSON with actionable teacher recommendations.`;

    try {
      const client = await createAzureClient('gpt4');
      const response = await client.chat.completions.create({
        model: AZURE_CONFIG.models.gpt4.deployment,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3, // Lower temperature for analytical content
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      });

      return safeJSONParse(response.choices[0]?.message?.content || '{}', {});
      
    } catch (error) {
      console.error('Teacher insights generation error:', error);
      throw error;
    }
  }

  /**
   * Build system prompt for educational content
   */
  private buildEducationalSystemPrompt(contentType: string, container: string): string {
    return `You are an expert educational content creator working with Pathfinity's intelligent learning platform.

MISSION: Generate high-quality, age-appropriate educational content that adapts to different learning styles and abilities.

CONTENT TYPE: ${contentType}
LEARNING CONTAINER: ${container}

QUALITY STANDARDS:
- Pedagogically sound and research-based
- Engaging and interactive
- Inclusive and accessible
- Aligned with educational standards
- Optimized for digital learning

Always return valid JSON with the exact structure requested.`;
  }

  /**
   * Build educational content prompt
   */
  private buildEducationalPrompt(request: ContentGenerationRequest): string {
    const { contentType, grade, subject, skills, learningContainer, quantity } = request;
    
    return `Generate ${quantity} ${contentType} piece(s) for:

CONTEXT:
- Grade Level: ${grade}
- Subject: ${subject}
- Skills Focus: ${skills.join(', ')}
- Container: ${learningContainer}

REQUIREMENTS:
- Age-appropriate for grade ${grade}
- Engaging and interactive
- Clear learning objectives
- Multiple learning style support
- Realistic time estimates

Return JSON with content array containing all required fields for the ${contentType} type.`;
  }

  /**
   * Get skills for grade/subject combination
   */
  private getSkillsForGrade(grade: string, subject: string): string[] {
    // Simplified skill mapping - in production, this would come from your skills database
    const skillMap: Record<string, Record<string, string[]>> = {
      'K': {
        'Math': ['counting-1-10', 'basic-shapes', 'patterns'],
        'ELA': ['letter-recognition', 'phonics', 'vocabulary'],
        'Science': ['living-nonliving', 'weather', 'senses']
      },
      '1': {
        'Math': ['addition-basic', 'subtraction-basic', 'place-value'],
        'ELA': ['reading-fluency', 'writing-sentences', 'spelling'],
        'Science': ['animal-habitats', 'plants-needs', 'sound']
      }
      // Add more grades as needed
    };
    
    return skillMap[grade]?.[subject] || [`${subject.toLowerCase()}-skill-1`];
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Health check for Azure OpenAI service
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'error', message: string }> {
    try {
      await initializeConfig();
      const client = await createAzureClient('gpt35'); // Use smaller model for health check
      const response = await client.chat.completions.create({
        model: AZURE_CONFIG.models.gpt35.deployment,
        messages: [{ role: 'user', content: 'Say "healthy" if you can respond.' }],
        max_tokens: 10
      });
      
      return {
        status: 'healthy',
        message: `Azure OpenAI service is operational. Response: ${response.choices[0]?.message?.content}`
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Azure OpenAI service error: ${error.message}`
      };
    }
  }

  /**
   * Generate content using specific model (GPT-3.5 for bulk, GPT-4 for quality, GPT-4o for creativity)
   */
  async generateWithModel(
    modelKey: 'gpt4o' | 'gpt4' | 'gpt35',
    prompt: string,
    systemPrompt?: string,
    options: { temperature?: number; maxTokens?: number; jsonMode?: boolean } = {}
  ): Promise<string> {
    const { temperature = 0.7, maxTokens = 1000, jsonMode = false } = options;
    
    // DETAILED LOGGING: Azure OpenAI API call
    console.group(`🌐 Azure OpenAI API Call - ${modelKey}`);
    console.log('🔑 Model:', modelKey);
    console.log('📝 User Prompt:', prompt);
    console.log('📏 User Prompt Length:', prompt.length, 'characters');
    console.log('🤖 System Prompt:', systemPrompt?.substring(0, 200) || 'None');
    console.log('⚙️ Options:', { temperature, maxTokens, jsonMode });
    console.log('⏰ Request Time:', new Date().toISOString());
    
    try {
      // Check if API key is configured
      await initializeConfig();
      if (!AZURE_CONFIG.models[modelKey].apiKey) {
        console.error(`❌ No API key configured for ${modelKey}`);
        console.log('⚠️ Returning fallback content due to missing API key');
        console.groupEnd();
        
        // Return appropriate fallback content
        if (jsonMode) {
          return JSON.stringify({
            title: "Learning Adventure",
            greeting: "Hi! Let's learn together!",
            concept: "We'll explore amazing things today.",
            examples: [{ question: "Example", answer: "Answer", explanation: "This helps us learn" }],
            practice: [{ 
              question: "Practice question", 
              type: "multiple_choice", 
              options: ["A", "B", "C", "D"], 
              correct_answer: 0, 
              hint: "Think carefully", 
              explanation: "Great job!" 
            }],
            assessment: { 
              question: "What did we learn?", 
              options: ["Option 1", "Option 2", "Option 3", "Option 4"], 
              correct_answer: 0, 
              explanation: "Well done!", 
              success_message: "Excellent!" 
            }
          });
        }
        return "Hi! I'm here to help you learn. Let's explore this topic together!";
      }
      
      const client = await createAzureClient(modelKey);
      const messages = systemPrompt
        ? [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }]
        : [{ role: 'user', content: prompt }];
      
      console.log('📬 Message Count:', messages.length);
      console.log('📊 Total Input Length:', messages.reduce((acc, m) => acc + m.content.length, 0), 'characters');
      
      const startTime = Date.now();
      const response = await client.chat.completions.create({
        model: AZURE_CONFIG.models[modelKey].deployment,
        messages: messages as any,
        temperature,
        max_tokens: maxTokens,
        ...(jsonMode && { response_format: { type: 'json_object' } })
      });
      const endTime = Date.now();
      
      const responseContent = response.choices[0]?.message?.content || '';
      
      console.log('✅ Response Received');
      console.log('📝 Full Response:', responseContent);
      console.log('📏 Response Length:', responseContent.length, 'characters');
      console.log('⏱️ Response Time:', endTime - startTime, 'ms');
      console.log('💰 Usage:', response.usage);
      console.log('🔍 First 500 chars:', responseContent.substring(0, 500));
      console.groupEnd();

      return responseContent;
      
    } catch (error) {
      console.error(`❌ Azure OpenAI ${modelKey} generation error:`, error);
      console.groupEnd();
      throw new Error(`${modelKey} generation failed: ${error.message}`);
    }
  }

  /**
   * Get available AI characters for specific learning context
   */
  getCharactersForContext(context: any): string[] {
    const { grade, subject, learningContainer } = context;
    
    // Return all available characters - content service will select best one
    const availableCharacters = ['finn', 'sage', 'spark', 'harmony'];
    
    // Basic filtering based on context
    if (learningContainer === 'experience') {
      return ['finn', 'sage']; // Career-focused characters
    }
    
    if (['Math', 'Science'].includes(subject)) {
      return ['finn', 'spark']; // STEM-focused characters  
    }
    
    if (['ELA', 'Social Studies'].includes(subject)) {
      return ['sage', 'harmony']; // Humanities-focused characters
    }
    
    return availableCharacters;
  }

  /**
   * Perform content safety check on generated content
   */
  async performContentSafetyCheck(content: any): Promise<{ safe: boolean; concerns: string[] }> {
    try {
      // For demo purposes, perform basic safety checks
      const contentStr = JSON.stringify(content).toLowerCase();
      const concerns: string[] = [];
      
      // Check for inappropriate content (basic keyword filtering)
      const inappropriateKeywords = ['violence', 'inappropriate', 'harmful'];
      const hasInappropriate = inappropriateKeywords.some(keyword => 
        contentStr.includes(keyword)
      );
      
      if (hasInappropriate) {
        concerns.push('Contains potentially inappropriate content');
      }
      
      // Check content length for age appropriateness
      if (contentStr.length > 5000) {
        concerns.push('Content may be too long for target age group');
      }
      
      return {
        safe: concerns.length === 0,
        concerns
      };
      
    } catch (error) {
      console.error('Content safety check failed:', error);
      return {
        safe: true, // Default to safe if check fails
        concerns: ['Safety check unavailable']
      };
    }
  }
}

// Export singleton instance
export const azureOpenAIService = new AzureOpenAIService();

// Note: AICharacter, PATHFINITY_CHARACTERS, and aiCharacterProvider 
// are available from './aiCharacterProvider' to avoid circular imports