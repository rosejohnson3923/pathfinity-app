/**
 * Chatbot Service
 * AI-powered chat service integrated with CompanionRulesEngine
 * Provides career-contextualized conversations and learning support
 */

import { companionRulesEngine, CompanionContext } from '../rules-engine/companions/CompanionRulesEngine';
import { careerAIRulesEngine } from '../rules-engine/career/CareerAIRulesEngine';
import { learnAIRulesEngine } from '../rules-engine/containers/LearnAIRulesEngine';
import { gamificationRulesEngine } from '../rules-engine/gamification/GamificationRulesEngine';
import { careerProgressionSystem } from '../rules-engine/career/CareerProgressionSystem';

// ============================================================================
// CHATBOT TYPES AND INTERFACES
// ============================================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  companionId?: string;
  companionEmotion?: string;
  careerId?: string;
  timestamp: Date;
  metadata?: {
    subject?: string;
    topic?: string;
    questionType?: string;
    hints?: string[];
    resources?: string[];
    achievement?: string;
  };
  actions?: ChatAction[];
}

export interface ChatAction {
  type: 'hint' | 'resource' | 'practice' | 'quiz' | 'celebrate';
  label: string;
  data: any;
}

export interface ChatSession {
  id: string;
  studentId: string;
  companionId: string;
  careerId: string;
  grade: string;
  messages: ChatMessage[];
  context: ChatContext;
  startTime: Date;
  lastActivity: Date;
  sessionGoal?: string;
}

export interface ChatContext {
  studentProfile: {
    id: string;
    name: string;
    grade: string;
    age?: number;
    interests?: string[];
    strengths?: string[];
    challenges?: string[];
  };
  learningContext: {
    subject?: string;
    topic?: string;
    skill?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    recentPerformance?: number;
  };
  companionState: {
    relationship: number; // 0-100
    mood: string;
    recentInteractions: number;
    personalizedTraits?: string[];
  };
  careerContext: {
    careerId: string;
    careerLabel: string; // e.g., "Junior Doctor"
    exposureLevel: string;
    recentActivities?: string[];
  };
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  context?: Partial<ChatContext>;
  type?: 'question' | 'help' | 'conversation' | 'celebration';
}

export interface ChatResponse {
  message: ChatMessage;
  suggestions?: string[];
  actions?: ChatAction[];
  emotionalTone?: string;
  learningInsight?: string;
}

// ============================================================================
// CHATBOT SERVICE
// ============================================================================

class ChatbotService {
  private static instance: ChatbotService;
  private sessions: Map<string, ChatSession> = new Map();
  private activeSessionId: string | null = null;
  private messageHistory: ChatMessage[] = [];
  private responseTemplates: Map<string, string[]> = new Map();
  private maxHistorySize = 100;
  
  private constructor() {
    this.initializeResponseTemplates();
  }
  
  public static getInstance(): ChatbotService {
    if (!ChatbotService.instance) {
      ChatbotService.instance = new ChatbotService();
    }
    return ChatbotService.instance;
  }
  
  /**
   * Initialize response templates
   */
  private initializeResponseTemplates(): void {
    // Help responses
    this.responseTemplates.set('help_math', [
      "Let's work through this step by step!",
      "I see you're working on math. What part is tricky?",
      "Math can be challenging! Let me help you understand."
    ]);
    
    this.responseTemplates.set('help_reading', [
      "Let's read this together!",
      "Reading is an adventure! What would you like help with?",
      "I'm here to help you understand the story better."
    ]);
    
    // Encouragement
    this.responseTemplates.set('encouragement', [
      "You're doing great! Keep going!",
      "I believe in you!",
      "Every expert was once a beginner. You've got this!"
    ]);
    
    // Celebration
    this.responseTemplates.set('celebration', [
      "Fantastic work! 🎉",
      "You did it! I'm so proud of you!",
      "Amazing job! You're learning so fast!"
    ]);
  }
  
  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================
  
  /**
   * Create a new chat session
   */
  public async createSession(
    studentId: string,
    companionId: string,
    careerId: string,
    grade: string
  ): Promise<ChatSession> {
    // Get career label for grade
    const careerLabel = careerProgressionSystem.getCareerLabel(careerId.toLowerCase(), grade);
    
    const session: ChatSession = {
      id: this.generateSessionId(),
      studentId,
      companionId,
      careerId,
      grade,
      messages: [],
      context: {
        studentProfile: {
          id: studentId,
          name: '',
          grade
        },
        learningContext: {},
        companionState: {
          relationship: 50,
          mood: 'friendly',
          recentInteractions: 0
        },
        careerContext: {
          careerId,
          careerLabel,
          exposureLevel: careerProgressionSystem.getExposureLevelForGrade(grade)
        }
      },
      startTime: new Date(),
      lastActivity: new Date()
    };
    
    // Add welcome message
    const welcomeMessage = await this.generateWelcomeMessage(session);
    session.messages.push(welcomeMessage);
    
    this.sessions.set(session.id, session);
    this.activeSessionId = session.id;
    
    return session;
  }
  
  /**
   * Get or create session
   */
  public async getOrCreateSession(
    studentId: string,
    companionId: string,
    careerId: string,
    grade: string
  ): Promise<ChatSession> {
    // Look for existing session
    const existingSession = Array.from(this.sessions.values()).find(
      s => s.studentId === studentId && 
           s.companionId === companionId &&
           s.careerId === careerId
    );
    
    if (existingSession) {
      this.activeSessionId = existingSession.id;
      return existingSession;
    }
    
    return this.createSession(studentId, companionId, careerId, grade);
  }
  
  /**
   * Get active session
   */
  public getActiveSession(): ChatSession | null {
    if (!this.activeSessionId) return null;
    return this.sessions.get(this.activeSessionId) || null;
  }
  
  // ============================================================================
  // MESSAGE HANDLING
  // ============================================================================
  
  /**
   * Send a message and get AI response
   */
  public async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const session = request.sessionId ? 
      this.sessions.get(request.sessionId) : 
      this.getActiveSession();
    
    if (!session) {
      throw new Error('No active chat session');
    }
    
    // Add user message
    const userMessage: ChatMessage = {
      id: this.generateMessageId(),
      role: 'user',
      content: request.message,
      timestamp: new Date()
    };
    session.messages.push(userMessage);
    
    // Detect message type and intent
    const intent = this.detectIntent(request.message, request.type);
    
    // Generate AI response using rules engines
    const response = await this.generateAIResponse(session, userMessage, intent);
    
    // Add assistant message
    session.messages.push(response.message);
    
    // Update session
    session.lastActivity = new Date();
    session.context.companionState.recentInteractions++;
    
    // Trim message history if needed
    if (session.messages.length > this.maxHistorySize) {
      session.messages = session.messages.slice(-this.maxHistorySize);
    }
    
    return response;
  }
  
  /**
   * Generate AI response using rules engines
   */
  private async generateAIResponse(
    session: ChatSession,
    userMessage: ChatMessage,
    intent: string
  ): Promise<ChatResponse> {
    // Build companion context
    const companionContext: CompanionContext = {
      userId: session.studentId,
      timestamp: new Date(),
      metadata: {},
      companionId: session.companionId,
      career: {
        id: session.careerId.toLowerCase(),
        name: session.careerId as any
      },
      trigger: {
        type: intent,
        context: {
          message: userMessage.content,
          subject: session.context.learningContext.subject,
          topic: session.context.learningContext.topic
        }
      },
      student: {
        grade: session.grade,
        level: 1,
        relationship: session.context.companionState.relationship
      }
    };
    
    // Get response from companion rules engine
    const companionResults = await companionRulesEngine.execute(companionContext);
    const companionResponse = companionResults.find(r => r.data?.message);
    
    let messageContent = '';
    let emotion = 'friendly';
    let suggestions: string[] = [];
    let actions: ChatAction[] = [];
    
    if (companionResponse?.data) {
      messageContent = companionResponse.data.message;
      emotion = companionResponse.data.emotion || 'friendly';
    } else {
      // Fallback response
      messageContent = this.getFallbackResponse(intent, session);
    }
    
    // Add career context to response
    messageContent = await this.addCareerContext(messageContent, session);
    
    // Generate suggestions based on intent
    suggestions = this.generateSuggestions(intent, session);
    
    // Generate actions based on context
    actions = await this.generateActions(intent, session);
    
    // Check for achievements
    const achievements = await this.checkAchievements(session);
    if (achievements.length > 0) {
      actions.push({
        type: 'celebrate',
        label: 'View Achievement',
        data: achievements[0]
      });
    }
    
    const response: ChatResponse = {
      message: {
        id: this.generateMessageId(),
        role: 'assistant',
        content: messageContent,
        companionId: session.companionId,
        companionEmotion: emotion,
        careerId: session.careerId,
        timestamp: new Date(),
        metadata: {
          subject: session.context.learningContext.subject,
          topic: session.context.learningContext.topic
        },
        actions
      },
      suggestions,
      actions,
      emotionalTone: emotion,
      learningInsight: this.generateLearningInsight(session)
    };
    
    return response;
  }
  
  /**
   * Detect user intent
   */
  private detectIntent(message: string, type?: string): string {
    if (type) return type;
    
    const lowerMessage = message.toLowerCase();
    
    // Help intents
    if (lowerMessage.includes('help') || lowerMessage.includes("don't understand") || 
        lowerMessage.includes('confused') || lowerMessage.includes('stuck')) {
      return 'help_request';
    }
    
    // Question intents
    if (lowerMessage.includes('what') || lowerMessage.includes('how') || 
        lowerMessage.includes('why') || lowerMessage.includes('when')) {
      return 'question';
    }
    
    // Celebration intents
    if (lowerMessage.includes('got it') || lowerMessage.includes('correct') || 
        lowerMessage.includes('yes!') || lowerMessage.includes('finished')) {
      return 'celebration';
    }
    
    // Greeting intents
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || 
        lowerMessage.includes('hey')) {
      return 'greeting';
    }
    
    return 'conversation';
  }
  
  /**
   * Get fallback response
   */
  private getFallbackResponse(intent: string, session: ChatSession): string {
    const templates = this.responseTemplates.get(intent) || 
                     this.responseTemplates.get('encouragement') || [];
    
    if (templates.length > 0) {
      return templates[Math.floor(Math.random() * templates.length)];
    }
    
    return `I'm here to help you learn! What would you like to know about?`;
  }
  
  /**
   * Add career context to message
   */
  private async addCareerContext(message: string, session: ChatSession): Promise<string> {
    const careerLabel = session.context.careerContext.careerLabel;
    
    // Add career-specific flavor
    const careerPhrases: Record<string, string[]> = {
      'Doctor': ['Just like a doctor examines patients...', 'In medicine, we call this...'],
      'Teacher': ['As a teacher would explain...', 'Let me teach you...'],
      'Scientist': ['Let\'s experiment to find out!', 'Scientists discover that...'],
      'Engineer': ['Let\'s build the solution!', 'Engineers solve this by...'],
      'Artist': ['Let\'s create something beautiful!', 'Artists express this...']
    };
    
    const phrases = careerPhrases[session.careerId] || [];
    if (phrases.length > 0 && Math.random() > 0.5) {
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      message = `${phrase} ${message}`;
    }
    
    // Add career label occasionally
    if (Math.random() > 0.7) {
      message = message.replace('I', `I, as your ${careerLabel},`);
    }
    
    return message;
  }
  
  /**
   * Generate suggestions
   */
  private generateSuggestions(intent: string, session: ChatSession): string[] {
    const suggestions: string[] = [];
    
    switch (intent) {
      case 'help_request':
        suggestions.push('Show me an example');
        suggestions.push('Break it down step by step');
        suggestions.push('Give me a hint');
        break;
      
      case 'question':
        suggestions.push('Tell me more');
        suggestions.push('Why is that?');
        suggestions.push('Can you explain differently?');
        break;
      
      case 'celebration':
        suggestions.push('What\'s next?');
        suggestions.push('Try a harder one');
        suggestions.push('Practice more');
        break;
      
      default:
        suggestions.push('Ask a question');
        suggestions.push('Get help');
        suggestions.push('Practice');
    }
    
    return suggestions;
  }
  
  /**
   * Generate actions
   */
  private async generateActions(intent: string, session: ChatSession): Promise<ChatAction[]> {
    const actions: ChatAction[] = [];
    
    if (intent === 'help_request' && session.context.learningContext.topic) {
      actions.push({
        type: 'hint',
        label: 'Get a hint',
        data: {
          topic: session.context.learningContext.topic,
          level: 1
        }
      });
      
      actions.push({
        type: 'resource',
        label: 'View resources',
        data: {
          topic: session.context.learningContext.topic,
          type: 'video'
        }
      });
    }
    
    if (intent === 'celebration') {
      actions.push({
        type: 'practice',
        label: 'Practice more',
        data: {
          subject: session.context.learningContext.subject,
          difficulty: 'medium'
        }
      });
    }
    
    return actions;
  }
  
  /**
   * Check for achievements
   */
  private async checkAchievements(session: ChatSession): Promise<any[]> {
    // Check with gamification rules engine
    const results = await gamificationRulesEngine.execute({
      userId: session.studentId,
      timestamp: new Date(),
      metadata: {},
      action: {
        type: 'chat_interaction',
        context: {
          messages: session.messages.length,
          companion: session.companionId,
          career: session.careerId
        }
      }
    });
    
    const achievementResult = results.find(r => r.data?.achievement);
    return achievementResult?.data?.achievement ? [achievementResult.data.achievement] : [];
  }
  
  /**
   * Generate learning insight
   */
  private generateLearningInsight(session: ChatSession): string {
    const messageCount = session.messages.length;
    const interactions = session.context.companionState.recentInteractions;
    
    if (interactions > 10) {
      return 'Great engagement! The student is actively participating.';
    } else if (interactions > 5) {
      return 'Good progress. Continue encouraging interaction.';
    } else {
      return 'Just getting started. Build rapport through encouragement.';
    }
  }
  
  /**
   * Generate welcome message
   */
  private async generateWelcomeMessage(session: ChatSession): Promise<ChatMessage> {
    const careerLabel = session.context.careerContext.careerLabel;
    const companion = session.companionId;
    
    const welcomeTemplates: Record<string, string[]> = {
      'finn': [
        `Hi! I'm Finn, your ${careerLabel} learning buddy! Ready to explore together?`,
        `Hello! Finn here, excited to be your ${careerLabel} guide today!`
      ],
      'spark': [
        `Hey there! Spark here as your ${careerLabel} companion! Let's create something amazing!`,
        `Hi! I'm Spark, your creative ${careerLabel} friend! What shall we discover?`
      ],
      'harmony': [
        `Hello! I'm Harmony, here as your ${careerLabel} support! How can I help you today?`,
        `Hi friend! Harmony here as your ${careerLabel} companion. Let's learn together!`
      ],
      'sage': [
        `Greetings! I'm Sage, your wise ${careerLabel} mentor. What wisdom shall we seek today?`,
        `Welcome! Sage here as your ${careerLabel} guide. Let's explore knowledge together!`
      ]
    };
    
    const templates = welcomeTemplates[companion.toLowerCase()] || welcomeTemplates['finn'];
    const message = templates[Math.floor(Math.random() * templates.length)];
    
    return {
      id: this.generateMessageId(),
      role: 'assistant',
      content: message,
      companionId: session.companionId,
      companionEmotion: 'happy',
      careerId: session.careerId,
      timestamp: new Date()
    };
  }
  
  // ============================================================================
  // SPECIALIZED METHODS
  // ============================================================================
  
  /**
   * Provide hint for a problem
   */
  public async provideHint(
    sessionId: string,
    problemContext: any
  ): Promise<ChatMessage> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    
    // Get hint from learn rules engine
    const results = await learnAIRulesEngine.execute({
      userId: session.studentId,
      timestamp: new Date(),
      metadata: {},
      student: {
        id: session.studentId,
        grade: session.grade
      },
      subject: problemContext.subject as any,
      questionContext: {
        type: problemContext.type,
        targetDifficulty: 'easy'
      }
    });
    
    const hintContent = results[0]?.data?.hint || 'Try breaking the problem into smaller parts!';
    
    const hintMessage: ChatMessage = {
      id: this.generateMessageId(),
      role: 'assistant',
      content: `Here's a hint: ${hintContent}`,
      companionId: session.companionId,
      companionEmotion: 'helpful',
      careerId: session.careerId,
      timestamp: new Date(),
      metadata: {
        questionType: problemContext.type,
        hints: [hintContent]
      }
    };
    
    session.messages.push(hintMessage);
    return hintMessage;
  }
  
  /**
   * Celebrate achievement
   */
  public async celebrateAchievement(
    sessionId: string,
    achievement: string
  ): Promise<ChatMessage> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    
    const celebrationMessages: string[] = [
      `🎉 Amazing! You earned the ${achievement} achievement!`,
      `🏆 Incredible work! ${achievement} is yours!`,
      `⭐ Fantastic! You've unlocked ${achievement}!`
    ];
    
    const message = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
    
    const celebrationMessage: ChatMessage = {
      id: this.generateMessageId(),
      role: 'assistant',
      content: message,
      companionId: session.companionId,
      companionEmotion: 'celebrating',
      careerId: session.careerId,
      timestamp: new Date(),
      metadata: {
        achievement
      }
    };
    
    session.messages.push(celebrationMessage);
    return celebrationMessage;
  }
  
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  
  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Generate message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Clear old sessions
   */
  public clearOldSessions(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    const sessionsToDelete: string[] = [];
    
    this.sessions.forEach((session, id) => {
      if (now - session.lastActivity.getTime() > maxAge) {
        sessionsToDelete.push(id);
      }
    });
    
    sessionsToDelete.forEach(id => this.sessions.delete(id));
  }
  
  /**
   * Get session history
   */
  public getSessionHistory(sessionId: string): ChatMessage[] {
    const session = this.sessions.get(sessionId);
    return session ? session.messages : [];
  }
  
  /**
   * Export session
   */
  public exportSession(sessionId: string): string | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    return JSON.stringify(session, null, 2);
  }
}

// ============================================================================
// REACT INTEGRATION
// ============================================================================

/**
 * React hook for using chatbot service
 */
export function useChatbot(
  studentId: string,
  companionId: string,
  careerId: string,
  grade: string
) {
  const service = ChatbotService.getInstance();
  const [session, setSession] = React.useState<ChatSession | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  
  React.useEffect(() => {
    const initSession = async () => {
      const chatSession = await service.getOrCreateSession(
        studentId,
        companionId,
        careerId,
        grade
      );
      setSession(chatSession);
      setMessages(chatSession.messages);
    };
    
    initSession();
  }, [studentId, companionId, careerId, grade]);
  
  const sendMessage = async (message: string, type?: ChatRequest['type']) => {
    if (!session) return;
    
    setIsLoading(true);
    try {
      const response = await service.sendMessage({
        message,
        sessionId: session.id,
        type
      });
      
      setMessages([...session.messages]);
      return response;
    } finally {
      setIsLoading(false);
    }
  };
  
  const provideHint = async (problemContext: any) => {
    if (!session) return;
    
    const hintMessage = await service.provideHint(session.id, problemContext);
    setMessages([...session.messages]);
    return hintMessage;
  };
  
  const celebrate = async (achievement: string) => {
    if (!session) return;
    
    const celebrationMessage = await service.celebrateAchievement(session.id, achievement);
    setMessages([...session.messages]);
    return celebrationMessage;
  };
  
  return {
    session,
    messages,
    isLoading,
    sendMessage,
    provideHint,
    celebrate
  };
}

// Export singleton
export const chatbotService = ChatbotService.getInstance();

// For React
import React from 'react';