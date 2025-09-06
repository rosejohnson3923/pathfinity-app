/**
 * AI CHARACTER TYPES
 * Core type definitions for AI characters to avoid circular imports
 */

export interface AICharacter {
  id: string;
  name: string;
  displayName: string;
  description: string;
  personality: string[];
  ageRange: { min: number; max: number };
  gradeRange: string[];
  subjects: string[];
  avatar: {
    imageUrl?: string;
    emoji?: string; // Fallback only
    color: string;
    style: string;
  };
  voiceSettings: {
    tone: string;
    pace: string;
    formality: 'casual' | 'friendly' | 'professional';
  };
  learningStyle: string[];
  specialties: string[];
}

export interface CharacterResponse {
  message: string;
  character: AICharacter;
  emotion: string;
  educationalPoints: string[];
  safe: boolean;
  tokens: number;
  cost: number;
  responseTime: number;
}

export interface ChatContext {
  grade_level: string;
  subject: string;
  topic: string;
  previousMessages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>;
  learningObjective: string;
  sessionId: string;
}