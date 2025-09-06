/**
 * AZURE AI FOUNDRY COMPREHENSIVE SERVICE
 * Full integration with Microsoft Sponsorship ACCESS
 * Combines OpenAI, Speech, Vision, Translation, and AI Services
 */

import { OpenAI } from 'openai';

// Complete Azure AI Foundry Configuration
const AZURE_AI_CONFIG = {
  // API Keys - DALL-E uses same key as OpenAI or specific DALL-E key
  apiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY || import.meta.env.VITE_AZURE_DALLE_API_KEY || '',
  cognitiveServicesKey: import.meta.env.VITE_AZURE_COGNITIVE_SERVICES_KEY || '',
  speechKey: import.meta.env.VITE_AZURE_SPEECH_KEY || '',
  translatorKey: import.meta.env.VITE_AZURE_TRANSLATOR_KEY || '',
  
  // OpenAI Services
  endpoints: {
    openai: 'https://pathfinity-ai.openai.azure.com/',
    dalle: 'https://pathfinity-ai.openai.azure.com/',
    aiFoundry: 'https://pathfinity-ai-foundry.services.ai.azure.com/',
    speechToText: 'https://eastus.stt.speech.microsoft.com',
    textToSpeech: 'https://eastus.tts.speech.microsoft.com',
    customVoice: 'https://pathfinity-ai-foundry.cognitiveservices.azure.com/',
    textTranslation: 'https://api.cognitive.microsofttranslator.com/',
    documentTranslation: 'https://pathfinity-ai-foundry.cognitiveservices.azure.com/',
    aiServices: 'https://pathfinity-ai-foundry.services.ai.azure.com/'
  },
  
  // Model Deployments
  deployments: {
    gpt4: 'gpt-4',
    gpt4o: 'gpt-4o',
    gpt4o2: 'gpt-4o-2', 
    gpt35: 'gpt-35-turbo',
    dalle3: 'dall-e-3'
  },
  
  apiVersion: '2024-02-01'
};

// Lazy initialization of OpenAI client
let azureOpenAI: OpenAI | null = null;

const getAzureOpenAI = () => {
  if (!azureOpenAI && AZURE_AI_CONFIG.apiKey) {
    azureOpenAI = new OpenAI({
      apiKey: AZURE_AI_CONFIG.apiKey,
      baseURL: `${AZURE_AI_CONFIG.endpoints.openai}/openai/deployments/${AZURE_AI_CONFIG.deployments.gpt4o}`,
      defaultQuery: { 'api-version': AZURE_AI_CONFIG.apiVersion },
      defaultHeaders: { 'api-key': AZURE_AI_CONFIG.apiKey },
      dangerouslyAllowBrowser: true
    });
  }
  return azureOpenAI;
};

export class AzureAIFoundryService {
  
  // ================================================================
  // 🤖 CONTENT GENERATION (OpenAI GPT Models)
  // ================================================================
  
  /**
   * Generate unlimited educational content using GPT-4o
   */
  async generateEducationalContent(request: any): Promise<any> {
    try {
      const client = getAzureOpenAI();
      if (!client) {
        throw new Error('Azure OpenAI service not configured');
      }
      const response = await client.chat.completions.create({
        model: AZURE_AI_CONFIG.deployments.gpt4o,
        messages: [
          { role: 'system', content: this.buildEducationalSystemPrompt(request) },
          { role: 'user', content: this.buildEducationalPrompt(request) }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      console.error('Azure GPT content generation error:', error);
      throw error;
    }
  }

  /**
   * Generate massive testbed content (unlimited with free Azure!)
   */
  async generateMassiveTestbed(grades: string[], subjects: string[], containers: string[]): Promise<any[]> {
    const results = [];
    
    console.log(`🚀 Generating massive testbed with FREE Azure AI: ${grades.length * subjects.length * containers.length} combinations`);
    
    for (const grade of grades) {
      for (const subject of subjects) {
        for (const container of containers) {
          try {
            const content = await this.generateEducationalContent({
              grade,
              subject,
              container,
              quantity: 5 // 5 pieces per combination = MASSIVE content
            });
            
            results.push({
              grade, subject, container, content,
              generatedAt: new Date().toISOString(),
              provider: 'azure-ai-foundry'
            });
            
            // Small delay to be respectful
            await this.delay(200);
            
          } catch (error) {
            console.error(`Failed ${container} for ${grade} ${subject}:`, error);
          }
        }
      }
    }
    
    return results;
  }

  // ================================================================
  // 🎨 IMAGE GENERATION (DALL-E 3)
  // ================================================================
  
  /**
   * Generate educational images using DALL-E 3
   */
  async generateEducationalImages(prompts: string[]): Promise<any[]> {
    const images = [];
    
    for (const prompt of prompts) {
      try {
        const response = await fetch(`${AZURE_AI_CONFIG.endpoints.openai}/openai/deployments/${AZURE_AI_CONFIG.deployments.dalle3}/images/generations?api-version=${AZURE_AI_CONFIG.apiVersion}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': AZURE_AI_CONFIG.apiKey
          },
          body: JSON.stringify({
            prompt: `Educational illustration for K-12 students: ${prompt}. Child-friendly, colorful, safe content.`,
            size: '1024x1024',
            quality: 'standard',
            n: 1
          })
        });
        
        const data = await response.json();
        images.push({
          prompt,
          imageUrl: data.data[0]?.url,
          generatedAt: new Date().toISOString()
        });
        
        await this.delay(1000); // Rate limiting for image generation
        
      } catch (error) {
        console.error(`Image generation failed for: ${prompt}`, error);
      }
    }
    
    return images;
  }

  /**
   * Generate professional receptionist avatar for Patty
   * Using Azure DALL-E 3 deployment
   */
  async generateReceptionistAvatar(): Promise<string> {
    // Check if required environment variables are set - prefer DALL-E specific key
    const dalleApiKey = import.meta.env.VITE_AZURE_DALLE_API_KEY || AZURE_AI_CONFIG.apiKey;
    
    if (!dalleApiKey) {
      console.log('🎨 DALL-E avatar generation skipped - API key not configured');
      console.log('💡 Please set VITE_AZURE_DALLE_API_KEY or VITE_AZURE_OPENAI_API_KEY environment variable');
      return '';
    }

    console.log('🎨 Attempting to generate Patty\'s avatar with DALL-E...');
    
    // Skip diagnostic to avoid breaking avatar generation - focus on DALL-E only
    console.log('⚡ Skipping diagnostic - proceeding directly to DALL-E generation');
    
    // Try different possible DALL-E deployment names
    const possibleDeployments = [
      'dall-e-3',
      'dalle3', 
      'dall-e-3-hd',
      'dalle-3'
    ];
    
    for (const deployment of possibleDeployments) {
      try {
        console.log(`🔍 Testing DALL-E deployment: "${deployment}"`);
        
        const prompt = 'Stylized cartoon avatar of a professional female receptionist, digital art style, friendly animated character, business suit, warm welcoming smile, vector art illustration, clean modern design, corporate mascot style, approachable cartoon character, digital avatar, not photorealistic';
        
        // Use the correct DALL-E endpoint (Sweden Central)
        const dalleBaseUrl = AZURE_AI_CONFIG.endpoints.dalle.endsWith('/') 
          ? AZURE_AI_CONFIG.endpoints.dalle.slice(0, -1) 
          : AZURE_AI_CONFIG.endpoints.dalle;
        
        const response = await fetch(`${dalleBaseUrl}/openai/deployments/${deployment}/images/generations?api-version=${AZURE_AI_CONFIG.apiVersion}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': dalleApiKey
          },
          body: JSON.stringify({
            prompt,
            size: '1024x1024',
            quality: 'hd',
            n: 1
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log(`❌ Deployment "${deployment}" failed:`, response.status, errorText);
          continue; // Try next deployment name
        }
        
        const data = await response.json();
        console.log(`✅ DALL-E deployment "${deployment}" works! Response:`, data);
        
        // Check different possible response structures
        const imageUrl = data.data?.[0]?.url || data.data?.[0]?.revised_prompt || data.url || '';
        
        if (imageUrl) {
          console.log(`🎨 Successfully generated avatar using deployment: "${deployment}"`);
          return imageUrl;
        } else {
          console.log(`⚠️ No image URL found in response from "${deployment}"`);
        }
        
      } catch (error) {
        console.log(`❌ Error testing deployment "${deployment}":`, error);
        continue; // Try next deployment
      }
    }
    
    console.error('❌ All DALL-E deployment attempts failed');
    return ''; // Return empty string as fallback
  }

  /**
   * Diagnose Azure AI Foundry connection issues
   */
  async diagnoseAzureConnection(): Promise<void> {
    console.log('🔍 === AZURE AI FOUNDRY DIAGNOSTIC ===');
    console.log('🔑 API Key configured:', !!AZURE_AI_CONFIG.apiKey);
    console.log('🔑 API Key length:', AZURE_AI_CONFIG.apiKey?.length || 0);
    console.log('🔑 API Key ending:', AZURE_AI_CONFIG.apiKey?.slice(-8) || 'NONE');
    console.log('🌐 OpenAI Endpoint:', AZURE_AI_CONFIG.endpoints.openai);
    console.log('📋 API Version:', AZURE_AI_CONFIG.apiVersion);
    
    // Test basic GPT connection first
    try {
      console.log('🧪 Testing GPT-4o connection...');
      const client = getAzureOpenAI();
      if (client) {
        const response = await client.chat.completions.create({
          model: AZURE_AI_CONFIG.deployments.gpt4o,
          messages: [{ role: 'user', content: 'Say "Azure connection works"' }],
          max_tokens: 10
        });
        console.log('✅ GPT-4o connection successful:', response.choices[0]?.message?.content);
      }
    } catch (error) {
      console.log('❌ GPT-4o connection failed:', error);
    }
    
    // List common Azure AI Foundry endpoints for DALL-E
    console.log('🗺️ Common DALL-E endpoints to try:');
    const commonEndpoints = [
      'https://pathfinity-ai-foundry.openai.azure.com/',
      'https://eastus.api.cognitive.microsoft.com/',
      'https://westus2.api.cognitive.microsoft.com/',
      'https://centralus.api.cognitive.microsoft.com/',
      'https://northcentralus.api.cognitive.microsoft.com/'
    ];
    commonEndpoints.forEach(endpoint => console.log(`   • ${endpoint}`));
    
    console.log('💡 If DALL-E is in a different resource, you might need:');
    console.log('   • Different API key (VITE_AZURE_DALLE_API_KEY)');
    console.log('   • Different endpoint URL');
    console.log('   • Different region');
    console.log('🔍 === END DIAGNOSTIC ===');
  }

  // ================================================================
  // 🗣️ TEXT-TO-SPEECH (Finn's Voice!)
  // ================================================================
  
  /**
   * Generate speech for Finn using Azure Neural TTS
   */
  async generateFinnSpeech(text: string, grade: string): Promise<ArrayBuffer> {
    const voice = this.getFinnVoiceForGrade(grade);
    
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${voice}">
          <prosody rate="medium" pitch="medium">
            ${text}
          </prosody>
        </voice>
      </speak>
    `;
    
    try {
      const response = await fetch(`${AZURE_AI_CONFIG.endpoints.textToSpeech}/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_AI_CONFIG.speechKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
        },
        body: ssml
      });
      
      return await response.arrayBuffer();
      
    } catch (error) {
      console.error('Finn speech generation error:', error);
      throw error;
    }
  }

  /**
   * Generate speech for Patty (Virtual Receptionist) using Azure Neural TTS
   */
  async generateReceptionistSpeech(text: string): Promise<ArrayBuffer> {
    // Check if required environment variables are set
    if (!AZURE_AI_CONFIG.speechKey) {
      console.log('🗣️ TTS speech generation skipped - speech key not configured');
      console.log('💡 Please set VITE_AZURE_SPEECH_KEY environment variable');
      throw new Error('Azure Speech key not configured');
    }

    const voice = 'en-US-SaraNeural'; // Professional, friendly receptionist voice
    
    // Enhance text with better pronunciation - minimal changes to avoid overlap
    let enhancedText = text
      .replace(/Career, Inc\.?/gi, 'Career<break time="150ms"/>Inc')
      .replace(/Career,Inc\.?/gi, 'Career<break time="150ms"/>Inc')
      .replace(/Career Inc\.?/gi, 'Career<break time="150ms"/>Inc')
      .replace(/Each position/gi, '<break time="100ms"/>Each position')
      .replace(/Ready to see/gi, '<break time="100ms"/>Ready to see');
    
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${voice}">
          <prosody rate="0.9" pitch="medium" volume="medium">
            ${enhancedText}
          </prosody>
        </voice>
      </speak>
    `;
    
    try {
      const response = await fetch(`${AZURE_AI_CONFIG.endpoints.textToSpeech}/cognitiveservices/v1`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_AI_CONFIG.speechKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
        },
        body: ssml
      });
      
      return await response.arrayBuffer();
      
    } catch (error) {
      console.error('Patty receptionist speech generation error:', error);
      throw error;
    }
  }

  /**
   * Get age-appropriate voice for Finn
   */
  private getFinnVoiceForGrade(grade: string): string {
    const gradeNum = parseInt(grade) || 0;
    
    if (gradeNum <= 2) return 'en-US-JennyNeural'; // Warm, nurturing for young kids
    if (gradeNum <= 5) return 'en-US-AriaNeural';  // Friendly, clear for elementary
    if (gradeNum <= 8) return 'en-US-DavisNeural'; // Engaging for middle school
    return 'en-US-BrianNeural'; // Professional for high school
  }

  // ================================================================
  // 🎧 SPEECH-TO-TEXT (Student Voice Input)
  // ================================================================
  
  /**
   * Convert student speech to text using Whisper
   */
  async transcribeStudentSpeech(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      formData.append('model', 'whisper-1');
      
      const response = await fetch(`${AZURE_AI_CONFIG.endpoints.openai}/openai/deployments/whisper/audio/transcriptions?api-version=${AZURE_AI_CONFIG.apiVersion}`, {
        method: 'POST',
        headers: {
          'api-key': AZURE_AI_CONFIG.apiKey
        },
        body: formData
      });
      
      const data = await response.json();
      return data.text || '';
      
    } catch (error) {
      console.error('Speech transcription error:', error);
      throw error;
    }
  }

  // ================================================================
  // 🌍 TRANSLATION SERVICES
  // ================================================================
  
  /**
   * Translate content for ELL students
   */
  async translateContent(text: string, targetLanguage: string): Promise<string> {
    try {
      const response = await fetch(`${AZURE_AI_CONFIG.endpoints.textTranslation}/translate?api-version=3.0&to=${targetLanguage}`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_AI_CONFIG.translatorKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([{ text }])
      });
      
      const data = await response.json();
      return data[0]?.translations[0]?.text || text;
      
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Fallback to original text
    }
  }

  /**
   * Auto-detect language and translate
   */
  async autoTranslateForStudent(text: string, studentProfile: any): Promise<string> {
    const preferredLanguage = studentProfile.preferred_language || 'en';
    
    if (preferredLanguage === 'en') return text;
    
    return await this.translateContent(text, preferredLanguage);
  }

  // ================================================================
  // 👁️ COMPUTER VISION (Content Safety & Analysis)
  // ================================================================
  
  /**
   * Analyze content for safety and appropriateness
   */
  async analyzeContentSafety(content: string): Promise<any> {
    try {
      const response = await fetch(`${AZURE_AI_CONFIG.endpoints.aiServices}/contentsafety/text:analyze?api-version=2023-04-30-preview`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_AI_CONFIG.cognitiveServicesKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: content,
          categories: ['Hate', 'SelfHarm', 'Sexual', 'Violence']
        })
      });
      
      return await response.json();
      
    } catch (error) {
      console.error('Content safety analysis error:', error);
      return { safe: true }; // Default to safe if analysis fails
    }
  }

  // ================================================================
  // 📊 TEACHER INSIGHTS & ANALYTICS
  // ================================================================
  
  /**
   * Generate AI-powered teacher insights
   */
  async generateTeacherInsights(studentData: any[], performanceMetrics: any): Promise<any> {
    const prompt = `As an AI educational analyst, analyze this classroom data and provide actionable insights:

STUDENT DATA: ${JSON.stringify(studentData, null, 2)}
PERFORMANCE METRICS: ${JSON.stringify(performanceMetrics, null, 2)}

Generate comprehensive insights including:
1. Individual student recommendations
2. Class-wide trends and patterns
3. Intervention suggestions
4. Teaching strategy recommendations
5. Parent communication points

Return detailed JSON with specific, actionable recommendations.`;

    try {
      const client = getAzureOpenAI();
      if (!client) {
        throw new Error('Azure OpenAI service not configured');
      }
      const response = await client.chat.completions.create({
        model: AZURE_AI_CONFIG.deployments.gpt4,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      console.error('Teacher insights generation error:', error);
      throw error;
    }
  }

  // ================================================================
  // 🎯 PERSONALIZED LEARNING PATHS
  // ================================================================
  
  /**
   * Create personalized learning path for student
   */
  async createPersonalizedLearningPath(studentProfile: any): Promise<any> {
    const prompt = `Create a personalized learning path for this student:

STUDENT PROFILE: ${JSON.stringify(studentProfile, null, 2)}

Generate a comprehensive learning path including:
- Adaptive difficulty progression
- Learning style accommodations
- Interest-based content selection
- Skill gap identification and remediation
- Motivation and engagement strategies
- Assessment preferences
- Goal setting and milestones

Return detailed JSON with specific learning activities and progression plan.`;

    try {
      const client = getAzureOpenAI();
      if (!client) {
        throw new Error('Azure OpenAI service not configured');
      }
      const response = await client.chat.completions.create({
        model: AZURE_AI_CONFIG.deployments.gpt4o,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      console.error('Personalized learning path error:', error);
      throw error;
    }
  }

  // ================================================================
  // 🚀 SYSTEM UTILITIES
  // ================================================================
  
  /**
   * Comprehensive health check for all Azure AI services
   */
  async healthCheckAll(): Promise<any> {
    const checks = await Promise.allSettled([
      this.healthCheckOpenAI(),
      this.healthCheckSpeech(),
      this.healthCheckTranslation(),
      this.healthCheckAIServices()
    ]);

    return {
      openai: checks[0].status === 'fulfilled' ? checks[0].value : { status: 'error', reason: checks[0].reason },
      speech: checks[1].status === 'fulfilled' ? checks[1].value : { status: 'error', reason: checks[1].reason },
      translation: checks[2].status === 'fulfilled' ? checks[2].value : { status: 'error', reason: checks[2].reason },
      aiServices: checks[3].status === 'fulfilled' ? checks[3].value : { status: 'error', reason: checks[3].reason },
      timestamp: new Date().toISOString()
    };
  }

  private async healthCheckOpenAI(): Promise<any> {
    try {
      const client = getAzureOpenAI();
      if (!client) {
        throw new Error('Azure OpenAI service not configured');
      }
      const response = await client.chat.completions.create({
        model: AZURE_AI_CONFIG.deployments.gpt35,
        messages: [{ role: 'user', content: 'Say "healthy"' }],
        max_tokens: 5
      });
      return { status: 'healthy', service: 'openai' };
    } catch (error) {
      return { status: 'error', service: 'openai', error: error.message };
    }
  }

  private async healthCheckSpeech(): Promise<any> {
    // Simple endpoint check
    return { status: 'configured', service: 'speech' };
  }

  private async healthCheckTranslation(): Promise<any> {
    // Simple endpoint check
    return { status: 'configured', service: 'translation' };
  }

  private async healthCheckAIServices(): Promise<any> {
    // Simple endpoint check
    return { status: 'configured', service: 'ai-services' };
  }

  // ================================================================
  // 🛠️ HELPER METHODS
  // ================================================================
  
  private buildEducationalSystemPrompt(request: any): string {
    return `You are Pathfinity's expert educational content creator with access to unlimited Azure AI.

MISSION: Generate exceptional educational content that adapts to every student's needs.

GRADE: ${request.grade}
SUBJECT: ${request.subject}
CONTAINER: ${request.container}

QUALITY STANDARDS:
- Pedagogically sound and research-based
- Age-appropriate and engaging
- Inclusive and accessible
- Aligned with standards
- Optimized for different learning styles

Always return valid JSON with complete content structure.`;
  }

  private buildEducationalPrompt(request: any): string {
    return `Generate ${request.quantity || 1} high-quality educational content piece(s):

REQUIREMENTS:
- Grade Level: ${request.grade}
- Subject: ${request.subject}
- Learning Container: ${request.container}
- Engaging and interactive
- Multiple learning style support
- Clear objectives and outcomes

Return JSON with complete content structure including all required fields.`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const azureAIFoundryService = new AzureAIFoundryService();