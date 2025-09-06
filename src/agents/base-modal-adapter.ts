/**
 * Base Modal Adapter for Finn Agents
 * Common functionality for all Finn agents to use modal framework
 */

import { 
  AIContentResponseV2,
  ModalTypeEnum,
  ContainerType,
  ContentTypeEnum,
  GradeLevel
} from '../ai-engine/types';
import { contentPipelineOrchestrator } from '../ai-engine/content-pipeline-orchestrator';
import { modalAnalytics } from '../analytics/modalAnalytics';

export interface FinnAgentConfig {
  agentId: string;
  agentName: string;
  defaultContainer: ContainerType;
  supportedModalTypes: ModalTypeEnum[];
  personality: {
    tone: 'friendly' | 'professional' | 'playful' | 'encouraging';
    avatar: string;
    color: string;
  };
}

export interface FinnMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: any;
}

export interface FinnContext {
  userId: string;
  sessionId: string;
  gradeLevel: GradeLevel;
  subject?: string;
  career?: string;
  currentLesson?: string;
  conversationHistory: FinnMessage[];
  preferences?: any;
}

export abstract class BaseFinnModalAdapter {
  protected config: FinnAgentConfig;
  protected context: FinnContext;
  protected conversationHistory: FinnMessage[] = [];

  constructor(config: FinnAgentConfig) {
    this.config = config;
    this.context = this.initializeContext();
  }

  /**
   * Initialize agent context
   */
  protected initializeContext(): FinnContext {
    return {
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      gradeLevel: this.getGradeLevel(),
      conversationHistory: []
    };
  }

  /**
   * Process user input and generate modal response
   */
  public async processInput(input: string): Promise<AIContentResponseV2> {
    // Add to conversation history
    this.addToHistory('user', input);

    // Analyze input to determine intent
    const intent = await this.analyzeIntent(input);
    
    // Determine appropriate modal type
    const modalType = this.selectModalType(intent);
    
    // Generate content based on intent
    const content = await this.generateContent(intent, modalType);
    
    // Create AI response using pipeline
    const response = await this.createModalResponse(content, modalType);
    
    // Add assistant response to history
    this.addToHistory('assistant', this.extractResponseSummary(response));
    
    // Track agent interaction
    this.trackInteraction(intent, modalType);
    
    return response;
  }

  /**
   * Analyze user intent
   */
  protected async analyzeIntent(input: string): Promise<any> {
    // Base implementation - override in specific agents
    const lowerInput = input.toLowerCase();
    
    const intents = {
      question: /what|how|why|when|where|who|which|can you|could you/i.test(lowerInput),
      practice: /practice|exercise|try|attempt|work on/i.test(lowerInput),
      help: /help|assist|support|stuck|confused|don't understand/i.test(lowerInput),
      create: /create|make|build|design|write|compose/i.test(lowerInput),
      explore: /explore|discover|find|search|look for/i.test(lowerInput),
      review: /review|check|assess|evaluate|grade/i.test(lowerInput),
      collaborate: /collaborate|work together|team|group|share/i.test(lowerInput)
    };

    // Find matching intents
    const matchedIntents = Object.entries(intents)
      .filter(([key, matches]) => matches)
      .map(([key]) => key);

    return {
      primary: matchedIntents[0] || 'general',
      secondary: matchedIntents.slice(1),
      originalInput: input,
      sentiment: this.analyzeSentiment(input),
      complexity: this.analyzeComplexity(input)
    };
  }

  /**
   * Select appropriate modal type based on intent
   */
  protected selectModalType(intent: any): ModalTypeEnum {
    // Map intents to modal types
    const intentModalMap: Record<string, ModalTypeEnum> = {
      question: ModalTypeEnum.SHORT_ANSWER,
      practice: ModalTypeEnum.FILL_BLANK,
      help: ModalTypeEnum.HELP,
      create: ModalTypeEnum.DRAWING,
      explore: ModalTypeEnum.SCENARIO,
      review: ModalTypeEnum.PEER_REVIEW,
      collaborate: ModalTypeEnum.COLLAB_DOC,
      general: ModalTypeEnum.SINGLE_SELECT
    };

    const modalType = intentModalMap[intent.primary] || ModalTypeEnum.SHORT_ANSWER;
    
    // Check if agent supports this modal type
    if (!this.config.supportedModalTypes.includes(modalType)) {
      // Fallback to first supported type
      return this.config.supportedModalTypes[0];
    }
    
    return modalType;
  }

  /**
   * Generate content based on intent and modal type
   */
  protected abstract generateContent(intent: any, modalType: ModalTypeEnum): Promise<any>;

  /**
   * Create modal response using content pipeline
   */
  protected async createModalResponse(
    content: any,
    modalType: ModalTypeEnum
  ): Promise<AIContentResponseV2> {
    const request = {
      contentType: this.mapModalToContentType(modalType),
      studentId: this.context.userId,
      sessionId: this.context.sessionId,
      lessonId: this.context.currentLesson || 'general',
      career: this.context.career || 'general',
      gradeLevel: this.context.gradeLevel,
      subject: this.context.subject || 'general',
      difficulty: this.calculateDifficulty(),
      container: this.config.defaultContainer,
      agentId: this.config.agentId,
      suggestedModalType: modalType
    };

    // Use content pipeline orchestrator
    const response = await contentPipelineOrchestrator.generateContent(request);
    
    // Enhance with agent personality
    this.enhanceWithPersonality(response);
    
    // Add agent-specific metadata
    response.content.metadata = {
      ...response.content.metadata,
      agentId: this.config.agentId,
      agentName: this.config.agentName,
      conversationIndex: this.conversationHistory.length
    };
    
    return response;
  }

  /**
   * Enhance response with agent personality
   */
  protected enhanceWithPersonality(response: AIContentResponseV2): void {
    // Add agent avatar and color theme
    response.uiCompliance.branding = {
      ...response.uiCompliance.branding,
      agentColor: this.config.personality.color,
      agentAvatar: this.config.personality.avatar
    };

    // Adjust tone in content
    if (response.content.data.instruction) {
      response.content.data.instruction = this.adjustTone(
        response.content.data.instruction,
        this.config.personality.tone
      );
    }
  }

  /**
   * Adjust text tone based on agent personality
   */
  protected adjustTone(text: string, tone: string): string {
    const toneAdjustments = {
      friendly: {
        prefix: "Hey there! ",
        suffix: " Let me know if you need any help! 😊"
      },
      professional: {
        prefix: "",
        suffix: " Please proceed when ready."
      },
      playful: {
        prefix: "Awesome! ",
        suffix: " This is going to be fun! 🎉"
      },
      encouraging: {
        prefix: "You're doing great! ",
        suffix: " Keep up the excellent work! 💪"
      }
    };

    const adjustment = toneAdjustments[tone] || toneAdjustments.friendly;
    
    // Only add prefix/suffix if not already present
    if (!text.startsWith(adjustment.prefix)) {
      text = adjustment.prefix + text;
    }
    if (!text.endsWith(adjustment.suffix)) {
      text = text + adjustment.suffix;
    }
    
    return text;
  }

  /**
   * Add message to conversation history
   */
  protected addToHistory(role: 'user' | 'assistant' | 'system', content: string): void {
    const message: FinnMessage = {
      role,
      content,
      timestamp: new Date().toISOString()
    };
    
    this.conversationHistory.push(message);
    this.context.conversationHistory.push(message);
    
    // Keep history limited to last 20 messages
    if (this.conversationHistory.length > 20) {
      this.conversationHistory.shift();
      this.context.conversationHistory.shift();
    }
  }

  /**
   * Extract summary from response for history
   */
  protected extractResponseSummary(response: AIContentResponseV2): string {
    if (response.content.data.question) {
      return response.content.data.question;
    }
    if (response.content.data.instruction) {
      return response.content.data.instruction;
    }
    if (response.content.data.prompt) {
      return response.content.data.prompt;
    }
    return `Presented ${response.modalType} content`;
  }

  /**
   * Track agent interaction
   */
  protected trackInteraction(intent: any, modalType: ModalTypeEnum): void {
    modalAnalytics.trackModalInteraction(
      `agent-${this.config.agentId}`,
      'agent_interaction',
      {
        agentId: this.config.agentId,
        agentName: this.config.agentName,
        intent: intent.primary,
        modalType,
        gradeLevel: this.context.gradeLevel
      }
    );
  }

  /**
   * Analyze sentiment of input
   */
  protected analyzeSentiment(input: string): 'positive' | 'neutral' | 'negative' {
    const positive = /good|great|awesome|love|like|happy|excited|fun/i;
    const negative = /bad|hate|dislike|bored|confused|frustrated|angry|sad/i;
    
    if (positive.test(input)) return 'positive';
    if (negative.test(input)) return 'negative';
    return 'neutral';
  }

  /**
   * Analyze complexity of input
   */
  protected analyzeComplexity(input: string): 'simple' | 'moderate' | 'complex' {
    const words = input.split(/\s+/).length;
    const sentences = input.split(/[.!?]+/).length;
    
    if (words < 10 && sentences === 1) return 'simple';
    if (words > 30 || sentences > 3) return 'complex';
    return 'moderate';
  }

  /**
   * Calculate difficulty based on context
   */
  protected calculateDifficulty(): number {
    const gradeDifficulty = {
      'K-2': 1,
      '3-5': 2,
      '6-8': 3,
      '9-12': 4
    };
    
    return gradeDifficulty[this.context.gradeLevel] || 2;
  }

  /**
   * Map modal type to content type
   */
  protected mapModalToContentType(modalType: ModalTypeEnum): ContentTypeEnum | string {
    // Simple mapping - could be more sophisticated
    const typeMap: Record<string, string> = {
      [ModalTypeEnum.FILL_BLANK]: ContentTypeEnum.FILL_BLANK,
      [ModalTypeEnum.SINGLE_SELECT]: ContentTypeEnum.SINGLE_SELECT,
      [ModalTypeEnum.MULTI_SELECT]: ContentTypeEnum.MULTIPLE_SELECT,
      [ModalTypeEnum.SHORT_ANSWER]: ContentTypeEnum.SHORT_ANSWER,
      [ModalTypeEnum.ESSAY]: ContentTypeEnum.ESSAY,
      [ModalTypeEnum.CODE_EDITOR]: ContentTypeEnum.CODE_EDITOR,
      [ModalTypeEnum.DRAG_DROP]: ContentTypeEnum.DRAG_DROP
    };
    
    return typeMap[modalType] || 'general';
  }

  /**
   * Get user ID from context
   */
  protected getUserId(): string {
    return window.localStorage.getItem('user_id') || 'anonymous';
  }

  /**
   * Get session ID
   */
  protected getSessionId(): string {
    return window.sessionStorage.getItem('session_id') || 
           `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get grade level from user profile
   */
  protected getGradeLevel(): GradeLevel {
    const stored = window.localStorage.getItem('grade_level');
    return (stored as GradeLevel) || '6-8';
  }

  /**
   * Reset conversation
   */
  public resetConversation(): void {
    this.conversationHistory = [];
    this.context.conversationHistory = [];
    this.context = this.initializeContext();
  }

  /**
   * Get conversation history
   */
  public getHistory(): FinnMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Update context
   */
  public updateContext(updates: Partial<FinnContext>): void {
    this.context = {
      ...this.context,
      ...updates
    };
  }
}

// Add missing modal types to enum
declare module '../ai-engine/types' {
  export enum ModalTypeEnum {
    HELP = 'HelpModal'
  }
}