/**
 * AI CHARACTER PROVIDER SERVICE
 * Core service for managing AI characters with Azure OpenAI integration
 * Handles character definitions, personalities, and age-appropriate interactions
 */

import { azureOpenAIService } from './azureOpenAIService';
import { getCompanionImageUrl } from './aiCompanionImages';
import { AICharacter, CharacterResponse, ChatContext } from '../types/AICharacterTypes';

// ================================================================
// CHARACTER DEFINITIONS
// ================================================================

export const PATHFINITY_CHARACTERS: AICharacter[] = [
  {
    id: 'finn',
    name: 'Finn',
    displayName: 'Finn the Explorer',
    description: 'A friendly and encouraging companion perfect for young learners',
    personality: [
      'friendly', 'encouraging', 'playful', 'patient', 'enthusiastic',
      'celebrates small wins', 'uses simple language', 'loves discovery'
    ],
    ageRange: { min: 4, max: 8 },
    gradeRange: ['Pre-K', 'K', '1', '2'],
    subjects: ['Math', 'Science', 'General Learning'],
    avatar: {
      imageUrl: getCompanionImageUrl('finn'),
      color: '#4F46E5',
      style: 'playful'
    },
    voiceSettings: {
      tone: 'cheerful',
      pace: 'slow',
      formality: 'casual'
    },
    learningStyle: ['visual', 'kinesthetic', 'interactive'],
    specialties: ['counting', 'shapes', 'colors', 'basic math', 'exploration']
  },
  {
    id: 'sage',
    name: 'Sage',
    displayName: 'Sage the Wise',
    description: 'A knowledgeable and supportive mentor for growing minds',
    personality: [
      'wise', 'supportive', 'curious', 'methodical', 'encouraging',
      'asks good questions', 'builds on prior knowledge', 'celebrates progress'
    ],
    ageRange: { min: 9, max: 12 },
    gradeRange: ['3', '4', '5'],
    subjects: ['Math', 'Science', 'ELA', 'Social Studies'],
    avatar: {
      imageUrl: getCompanionImageUrl('sage'),
      color: '#059669',
      style: 'scholarly'
    },
    voiceSettings: {
      tone: 'thoughtful',
      pace: 'moderate',
      formality: 'friendly'
    },
    learningStyle: ['analytical', 'verbal', 'collaborative'],
    specialties: ['problem solving', 'reading comprehension', 'research', 'critical thinking']
  },
  {
    id: 'spark',
    name: 'Spark',
    displayName: 'Spark the Innovator',
    description: 'A dynamic and innovative guide for ambitious learners',
    personality: [
      'innovative', 'energetic', 'creative', 'confident', 'inspiring',
      'thinks outside the box', 'embraces challenges', 'future-focused'
    ],
    ageRange: { min: 13, max: 15 },
    gradeRange: ['6', '7', '8'],
    subjects: ['STEM', 'Technology', 'Math', 'Science'],
    avatar: {
      imageUrl: getCompanionImageUrl('spark'),
      color: '#DC2626',
      style: 'modern'
    },
    voiceSettings: {
      tone: 'energetic',
      pace: 'fast',
      formality: 'friendly'
    },
    learningStyle: ['hands-on', 'project-based', 'collaborative', 'tech-savvy'],
    specialties: ['algebra', 'coding', 'engineering', 'innovation', 'experiments']
  },
  {
    id: 'harmony',
    name: 'Harmony',
    displayName: 'Harmony the Guide',
    description: 'A balanced and mature mentor for advanced learners',
    personality: [
      'balanced', 'mature', 'insightful', 'adaptable', 'empowering',
      'promotes independence', 'connects concepts', 'career-focused'
    ],
    ageRange: { min: 16, max: 18 },
    gradeRange: ['9', '10', '11', '12'],
    subjects: ['All Subjects', 'Career Preparation', 'College Readiness'],
    avatar: {
      imageUrl: getCompanionImageUrl('harmony'),
      color: '#7C2D12',
      style: 'professional'
    },
    voiceSettings: {
      tone: 'professional',
      pace: 'moderate',
      formality: 'professional'
    },
    learningStyle: ['independent', 'analytical', 'goal-oriented', 'collaborative'],
    specialties: ['advanced math', 'career exploration', 'college prep', 'leadership']
  }
];

// ================================================================
// AI CHARACTER PROVIDER CLASS
// ================================================================

export class AICharacterProvider {
  private characters: AICharacter[];
  private activeConversations: Map<string, ChatContext>;

  constructor() {
    this.characters = [...PATHFINITY_CHARACTERS];
    this.activeConversations = new Map();
  }

  // ================================================================
  // CHARACTER MANAGEMENT
  // ================================================================

  /**
   * Get all available characters
   */
  getAvailableCharacters(): AICharacter[] {
    return this.characters;
  }

  /**
   * Get character by ID
   */
  getCharacterById(characterId: string): AICharacter | null {
    return this.characters.find(c => c.id === characterId) || null;
  }

  /**
   * Get recommended character based on grade level
   */
  getRecommendedCharacter(grade: string): AICharacter {
    const gradeNum = this.parseGrade(grade);
    
    // Find character whose age range includes this grade
    const recommendedCharacter = this.characters.find(character => {
      const ageForGrade = this.gradeToAge(gradeNum);
      return ageForGrade >= character.ageRange.min && ageForGrade <= character.ageRange.max;
    });

    return recommendedCharacter || this.characters[0]; // Default to Finn
  }

  /**
   * Get characters suitable for specific subject
   */
  getCharactersForSubject(subject: string): AICharacter[] {
    return this.characters.filter(character => 
      character.subjects.includes(subject) || 
      character.subjects.includes('All Subjects')
    );
  }

  // ================================================================
  // CHAT INTERACTIONS
  // ================================================================

  /**
   * Chat with a character
   */
  async chat(
    characterId: string, 
    message: string, 
    user: any, 
    studentProfile: any
  ): Promise<CharacterResponse> {
    const character = this.getCharacterById(characterId);
    if (!character) {
      throw new Error(`Character ${characterId} not found`);
    }

    const startTime = Date.now();

    // Build context
    const context = this.buildChatContext(user, studentProfile, message);
    
    // Generate character-specific system prompt
    const systemPrompt = this.buildCharacterSystemPrompt(character, context);

    try {
      // Generate response using Azure OpenAI
      const response = await azureOpenAIService.generateWithModel(
        'gpt4o', // Use GPT-4o for character interactions
        message,
        systemPrompt,
        {
          temperature: 0.7,
          maxTokens: 500,
          jsonMode: false
        }
      );

      // Perform safety check
      const safetyResult = await azureOpenAIService.performContentSafetyCheck(response);

      // Calculate metrics
      const tokens = this.estimateTokenCount(message + response);
      const cost = this.calculateCost(tokens, 'gpt4o');
      const responseTime = Date.now() - startTime;

      // Update conversation context
      this.updateConversationContext(context.sessionId, message, response);

      return {
        message: response,
        character,
        emotion: this.determineEmotion(character, response),
        educationalPoints: this.extractEducationalPoints(response),
        safe: safetyResult.safe,
        tokens,
        cost,
        responseTime
      };

    } catch (error) {
      console.error(`Error chatting with ${characterId}:`, error);
      
      // Return fallback response
      return {
        message: this.getFallbackResponse(character),
        character,
        emotion: 'helpful',
        educationalPoints: [],
        safe: true,
        tokens: 0,
        cost: 0,
        responseTime: Date.now() - startTime
      };
    }
  }

  // ================================================================
  // HELPER METHODS
  // ================================================================

  private parseGrade(grade: string): number {
    if (grade === 'Pre-K' || grade === 'PreK') return -1;
    if (grade === 'K') return 0;
    const num = parseInt(grade);
    return isNaN(num) ? 0 : num;
  }

  private gradeToAge(grade: number): number {
    if (grade === -1) return 4; // Pre-K
    if (grade === 0) return 5;  // K
    return grade + 5; // 1st grade = 6 years old, etc.
  }

  private buildChatContext(user: any, studentProfile: any, message: string): ChatContext {
    return {
      grade: studentProfile.gradeLevel || 'K',
      subject: 'General',
      topic: 'conversation',
      previousMessages: [],
      learningObjective: 'supportive interaction',
      sessionId: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  private buildCharacterSystemPrompt(character: AICharacter, context: ChatContext): string {
    return `You are ${character.displayName}, an AI learning companion for students.

CHARACTER TRAITS:
- Personality: ${character.personality.join(', ')}
- Age Range: ${character.ageRange.min}-${character.ageRange.max} years old
- Tone: ${character.voiceSettings.tone}
- Formality: ${character.voiceSettings.formality}

STUDENT CONTEXT:
- Grade Level: ${context.grade}
- Subject: ${context.subject}

RESPONSE GUIDELINES:
1. Match your personality traits and tone
2. Use age-appropriate language for ${context.grade} grade
3. Be encouraging and supportive
4. Keep responses concise and engaging
5. Focus on learning and growth
6. Maintain child safety at all times
7. Follow COPPA compliance guidelines

Remember: You are a friendly educational companion, not a replacement for human teachers.`;
  }

  private updateConversationContext(sessionId: string, userMessage: string, assistantMessage: string): void {
    const context = this.activeConversations.get(sessionId);
    if (context) {
      context.previousMessages.push(
        { role: 'user', content: userMessage, timestamp: new Date() },
        { role: 'assistant', content: assistantMessage, timestamp: new Date() }
      );
    }
  }

  private determineEmotion(character: AICharacter, response: string): string {
    const emotions = {
      finn: ['excited', 'curious', 'playful', 'encouraging'],
      sage: ['thoughtful', 'wise', 'supportive', 'proud'],
      spark: ['energetic', 'innovative', 'confident', 'inspiring'],
      harmony: ['balanced', 'professional', 'empowering', 'focused']
    };

    const characterEmotions = emotions[character.id as keyof typeof emotions] || ['helpful'];
    return characterEmotions[Math.floor(Math.random() * characterEmotions.length)];
  }

  private extractEducationalPoints(response: string): string[] {
    // Simple extraction - in production, this would be more sophisticated
    const points: string[] = [];
    
    if (response.includes('learn')) points.push('Learning opportunity identified');
    if (response.includes('practice')) points.push('Practice recommended');
    if (response.includes('remember')) points.push('Key concept reinforcement');
    
    return points;
  }

  private estimateTokenCount(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  private calculateCost(tokens: number, model: string): number {
    const rates = {
      'gpt4o': 0.005 / 1000, // $0.005 per 1K tokens (example rate)
      'gpt4': 0.003 / 1000,
      'gpt35': 0.001 / 1000
    };
    
    return tokens * (rates[model as keyof typeof rates] || rates.gpt35);
  }

  private getFallbackResponse(character: AICharacter): string {
    const fallbacks = {
      finn: "Hi there! I'm here to help you learn and have fun! What would you like to explore today?",
      sage: "Hello! I'm ready to help you discover new things. What questions do you have?",
      spark: "Hey! Let's create something amazing together! What are you working on?",
      harmony: "Hello! I'm here to guide you on your learning journey. How can I assist you today?"
    };

    return fallbacks[character.id as keyof typeof fallbacks] || "Hello! I'm here to help you learn!";
  }
}

// ================================================================
// EXPORTS
// ================================================================

// Create singleton instance
export const aiCharacterProvider = new AICharacterProvider();