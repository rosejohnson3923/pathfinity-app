/**
 * REAL-TIME PERSONALIZATION ENGINE
 * AI-Powered adaptive learning using Azure GPT-4o
 * Creates individualized educational experiences for every student
 */

import { OpenAI } from 'openai';
import { supabase } from '../lib/supabase';

// Azure GPT-4o Configuration for Personalization
const createPersonalizationClient = () => {
  const apiKey = import.meta.env.VITE_AZURE_GPT4O_API_KEY;
  const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
  const deployment = import.meta.env.VITE_AZURE_GPT4O_DEPLOYMENT;
  
  if (!apiKey || !endpoint || !deployment) {
    throw new Error('Azure OpenAI configuration missing for personalization service');
  }
  
  return new OpenAI({
    apiKey: apiKey,
    baseURL: `${endpoint}openai/deployments/${deployment}`,
    defaultQuery: { 'api-version': '2024-02-01' },
    defaultHeaders: {
      'api-key': apiKey,
    },
    dangerouslyAllowBrowser: true
  });
};

export interface StudentLearningProfile {
  student_id: string;
  learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing' | 'mixed';
  difficulty_preference: 'easy' | 'moderate' | 'challenging' | 'adaptive';
  interests: string[];
  motivation_triggers: string[];
  attention_span: number; // minutes
  optimal_session_length: number; // minutes
  preferred_time_of_day: 'morning' | 'afternoon' | 'evening' | 'flexible';
  current_mood_state: 'excited' | 'focused' | 'tired' | 'frustrated' | 'neutral';
  performance_patterns: {
    strengths: string[];
    challenges: string[];
    recent_accuracy: number;
    learning_velocity: number;
    engagement_level: number;
  };
  social_preferences: {
    likes_competition: boolean;
    prefers_collaboration: boolean;
    responds_to_praise: boolean;
    needs_encouragement: boolean;
  };
  accessibility_needs: {
    text_to_speech: boolean;
    larger_text: boolean;
    high_contrast: boolean;
    simplified_interface: boolean;
  };
}

export interface PersonalizationRequest {
  student_id: string;
  content_type: 'instruction' | 'practice' | 'assessment' | 'story' | 'game';
  subject: string;
  skill: string;
  current_difficulty: number; // 1-10 scale
  session_context: {
    current_accuracy: number;
    time_spent: number;
    attempts_made: number;
    help_requests: number;
    emotional_indicators: string[];
  };
  base_content?: any; // Optional base content to personalize
}

export interface PersonalizedContent {
  content: any;
  personalization_applied: {
    difficulty_adjustment: string;
    style_adaptation: string;
    interest_integration: string;
    emotional_support: string;
    accessibility_features: string[];
  };
  finn_interaction: {
    greeting: string;
    encouragement: string;
    hints: string[];
    celebration: string;
  };
  estimated_engagement: number;
  suggested_next_action: string;
}

export interface AdaptiveHint {
  type: 'conceptual' | 'procedural' | 'strategic' | 'motivational';
  content: string;
  delivery_method: 'text' | 'audio' | 'visual' | 'interactive';
  timing: 'immediate' | 'after_attempt' | 'on_request';
}

export class PersonalizationEngine {
  private personalizationClient: OpenAI;
  private profileCache: Map<string, StudentLearningProfile> = new Map();

  constructor() {
    this.personalizationClient = createPersonalizationClient();
  }

  /**
   * Get or build comprehensive student learning profile
   */
  async getStudentProfile(studentId: string): Promise<StudentLearningProfile> {
    // Check cache first
    if (this.profileCache.has(studentId)) {
      return this.profileCache.get(studentId)!;
    }

    try {
      // Fetch student data and performance history
      const { data: student } = await supabase
        .from('users')
        .select(`
          *,
          learning_preferences,
          user_progress (*),
          learning_sessions (*),
          help_requests (*)
        `)
        .eq('id', studentId)
        .single();

      if (!student) {
        throw new Error('Student not found');
      }

      // Build comprehensive profile using AI analysis
      const profile = await this.buildLearningProfile(student);
      
      // Cache the profile
      this.profileCache.set(studentId, profile);
      
      return profile;
    } catch (error) {
      console.error('Error getting student profile:', error);
      throw error;
    }
  }

  /**
   * Generate personalized content in real-time
   */
  async personalizeContent(request: PersonalizationRequest): Promise<PersonalizedContent> {
    try {
      const profile = await this.getStudentProfile(request.student_id);
      
      const prompt = this.buildPersonalizationPrompt(request, profile);
      
      const response = await this.personalizationClient.chat.completions.create({
        model: import.meta.env.VITE_AZURE_GPT4O_DEPLOYMENT || 'gpt-4o',
        messages: [
          { role: 'system', content: this.getPersonalizationSystemPrompt() },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8, // Higher creativity for personalization
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      const personalizedContent = JSON.parse(response.choices[0]?.message?.content || '{}');
      
      // Track personalization usage for analytics
      await this.trackPersonalizationEvent(request.student_id, request, personalizedContent);
      
      return personalizedContent;
    } catch (error) {
      console.error('Personalization error:', error);
      throw error;
    }
  }

  /**
   * Adapt difficulty in real-time based on performance
   */
  async adaptDifficulty(
    studentId: string, 
    currentDifficulty: number, 
    sessionData: any
  ): Promise<{ newDifficulty: number; reasoning: string; recommendations: string[] }> {
    
    const profile = await this.getStudentProfile(studentId);
    
    const prompt = `Analyze this student's real-time performance and adapt the difficulty level:

STUDENT PROFILE:
${JSON.stringify(profile, null, 2)}

CURRENT SESSION DATA:
- Current Difficulty: ${currentDifficulty}/10
- Accuracy: ${sessionData.accuracy}%
- Time Spent: ${sessionData.time_spent} minutes
- Attempts: ${sessionData.attempts}
- Help Requests: ${sessionData.help_requests}
- Emotional State: ${sessionData.emotional_state || 'neutral'}

ADAPTATION RULES:
- Keep students in "flow state" (70-85% success rate)
- Increase difficulty if accuracy > 90% for 3+ problems
- Decrease difficulty if accuracy < 60% for 2+ problems
- Consider emotional state and engagement
- Respect student's preferred challenge level

Return JSON with:
{
  "new_difficulty": number (1-10),
  "reasoning": "explanation of adjustment",
  "recommendations": ["specific suggestions for teacher/system"],
  "finn_message": "encouraging message from Finn about the adjustment"
}`;

    const response = await this.personalizationClient.chat.completions.create({
      model: import.meta.env.VITE_AZURE_GPT4O_DEPLOYMENT || 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert adaptive learning specialist optimizing difficulty for individual students.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0]?.message?.content || '{}');
  }

  /**
   * Generate real-time hints and scaffolding
   */
  async generateAdaptiveHint(
    studentId: string,
    problem: any,
    attemptHistory: any[]
  ): Promise<AdaptiveHint> {
    
    const profile = await this.getStudentProfile(studentId);
    
    const prompt = `Generate a personalized hint for this struggling student:

STUDENT PROFILE:
- Learning Style: ${profile.learning_style}
- Interests: ${profile.interests.join(', ')}
- Strengths: ${profile.performance_patterns.strengths.join(', ')}
- Challenges: ${profile.performance_patterns.challenges.join(', ')}

PROBLEM:
${JSON.stringify(problem, null, 2)}

ATTEMPT HISTORY:
${JSON.stringify(attemptHistory, null, 2)}

Generate a hint that:
1. Matches their learning style
2. Uses their interests for examples
3. Builds on their strengths
4. Addresses their specific challenge
5. Maintains their confidence and motivation

Return JSON with hint structure.`;

    const response = await this.personalizationClient.chat.completions.create({
      model: import.meta.env.VITE_AZURE_GPT4O_DEPLOYMENT || 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are Finn, Pathfinity\'s encouraging AI companion providing personalized learning support.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 600,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0]?.message?.content || '{}');
  }

  /**
   * Optimize learning path based on progress and preferences
   */
  async optimizeLearningPath(
    studentId: string,
    currentSkill: string,
    masteryLevel: number
  ): Promise<{ nextSkills: string[]; reasoning: string; timeline: string }> {
    
    const profile = await this.getStudentProfile(studentId);
    
    const prompt = `Optimize the learning path for this student:

STUDENT PROFILE:
${JSON.stringify(profile, null, 2)}

CURRENT STATUS:
- Skill: ${currentSkill}
- Mastery Level: ${masteryLevel}/100
- Learning Velocity: ${profile.performance_patterns.learning_velocity}

Recommend the next 3-5 skills to learn based on:
1. Prerequisites and logical progression
2. Student's strengths and interests
3. Optimal challenge level
4. Learning velocity and patterns

Return JSON with next skills, reasoning, and suggested timeline.`;

    const response = await this.personalizationClient.chat.completions.create({
      model: import.meta.env.VITE_AZURE_GPT4O_DEPLOYMENT || 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert learning path optimizer creating personalized educational journeys.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0]?.message?.content || '{}');
  }

  /**
   * Recognize emotional state and adapt response
   */
  async recognizeEmotionalState(
    studentId: string,
    sessionData: any,
    behaviorIndicators: string[]
  ): Promise<{ emotional_state: string; finn_response: string; adaptations: string[] }> {
    
    const profile = await this.getStudentProfile(studentId);
    
    const prompt = `Analyze this student's emotional state and provide appropriate support:

STUDENT PROFILE:
- Grade Level: ${profile.student_id} // We'll need to get this from student data
- Social Preferences: ${JSON.stringify(profile.social_preferences)}
- Current Mood: ${profile.current_mood_state}

SESSION INDICATORS:
- Time on Task: ${sessionData.time_on_task}
- Response Speed: ${sessionData.response_speed}
- Help Requests: ${sessionData.help_requests}
- Accuracy Trend: ${sessionData.accuracy_trend}

BEHAVIOR INDICATORS:
${behaviorIndicators.join(', ')}

Determine emotional state and provide:
1. Emotional state assessment
2. Age-appropriate Finn response
3. Specific adaptations to make
4. Whether to alert teacher

Return JSON with emotional analysis and response plan.`;

    const response = await this.personalizationClient.chat.completions.create({
      model: import.meta.env.VITE_AZURE_GPT4O_DEPLOYMENT || 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an empathetic AI companion specializing in student emotional support and motivation.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0]?.message?.content || '{}');
  }

  /**
   * Build comprehensive learning profile using AI analysis
   */
  private async buildLearningProfile(studentData: any): Promise<StudentLearningProfile> {
    const prompt = `Analyze this student's data and create a comprehensive learning profile:

STUDENT DATA:
${JSON.stringify(studentData, null, 2)}

Analyze patterns in:
- Performance across subjects and skills
- Time spent on different activities
- Help-seeking behavior
- Session timing preferences
- Progress rates and learning velocity

Create a detailed learning profile including learning style, interests, motivation triggers, and personalized recommendations.

Return complete StudentLearningProfile JSON.`;

    const response = await this.personalizationClient.chat.completions.create({
      model: import.meta.env.VITE_AZURE_GPT4O_DEPLOYMENT || 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert learning psychologist creating detailed student profiles for personalized education.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const profile = JSON.parse(response.choices[0]?.message?.content || '{}');
    
    // Ensure required fields with defaults
    return {
      student_id: studentData.id,
      learning_style: profile.learning_style || 'mixed',
      difficulty_preference: profile.difficulty_preference || 'adaptive',
      interests: profile.interests || [],
      motivation_triggers: profile.motivation_triggers || ['progress', 'achievement'],
      attention_span: profile.attention_span || 20,
      optimal_session_length: profile.optimal_session_length || 25,
      preferred_time_of_day: profile.preferred_time_of_day || 'flexible',
      current_mood_state: profile.current_mood_state || 'neutral',
      performance_patterns: {
        strengths: profile.performance_patterns?.strengths || [],
        challenges: profile.performance_patterns?.challenges || [],
        recent_accuracy: profile.performance_patterns?.recent_accuracy || 0.75,
        learning_velocity: profile.performance_patterns?.learning_velocity || 1.0,
        engagement_level: profile.performance_patterns?.engagement_level || 0.8
      },
      social_preferences: {
        likes_competition: profile.social_preferences?.likes_competition || false,
        prefers_collaboration: profile.social_preferences?.prefers_collaboration || false,
        responds_to_praise: profile.social_preferences?.responds_to_praise || true,
        needs_encouragement: profile.social_preferences?.needs_encouragement || true
      },
      accessibility_needs: {
        text_to_speech: profile.accessibility_needs?.text_to_speech || false,
        larger_text: profile.accessibility_needs?.larger_text || false,
        high_contrast: profile.accessibility_needs?.high_contrast || false,
        simplified_interface: profile.accessibility_needs?.simplified_interface || false
      }
    };
  }

  /**
   * Build personalization prompt
   */
  private buildPersonalizationPrompt(request: PersonalizationRequest, profile: StudentLearningProfile): string {
    return `Personalize this educational content for a specific student:

STUDENT PROFILE:
${JSON.stringify(profile, null, 2)}

CONTENT REQUEST:
${JSON.stringify(request, null, 2)}

PERSONALIZATION REQUIREMENTS:
1. Adapt difficulty based on current performance and preferences
2. Modify presentation style for their learning style
3. Integrate their interests into examples and scenarios
4. Provide appropriate emotional support and motivation
5. Include Finn interactions tailored to their personality
6. Ensure accessibility needs are met

Return JSON with personalized content and metadata about adaptations made.`;
  }

  /**
   * System prompt for personalization
   */
  private getPersonalizationSystemPrompt(): string {
    return `You are Pathfinity's Real-time Personalization Engine, powered by advanced AI to create individualized learning experiences.

CORE PRINCIPLES:
- Every student is unique and learns differently
- Adaptation should be subtle and natural, not obvious
- Maintain optimal challenge level (flow state)
- Provide emotional support and encouragement
- Use interests to increase engagement
- Respect learning preferences and accessibility needs

PERSONALIZATION DIMENSIONS:
- Difficulty and pacing
- Learning style adaptation
- Interest integration
- Emotional support
- Social learning preferences
- Accessibility accommodations

Always create content that feels personally crafted for the individual student while maintaining educational quality and standards alignment.`;
  }

  /**
   * Track personalization events for analytics
   */
  private async trackPersonalizationEvent(
    studentId: string,
    request: PersonalizationRequest,
    result: PersonalizedContent
  ): Promise<void> {
    try {
      await supabase
        .from('personalization_events')
        .insert({
          student_id: studentId,
          content_type: request.content_type,
          adaptations_applied: result.personalization_applied,
          estimated_engagement: result.estimated_engagement,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error tracking personalization event:', error);
      // Don't throw - tracking shouldn't break personalization
    }
  }

  /**
   * Health check for personalization service
   */
  async healthCheck(): Promise<{ status: 'healthy' | 'error', message: string }> {
    try {
      const response = await this.personalizationClient.chat.completions.create({
        model: import.meta.env.VITE_AZURE_GPT4O_DEPLOYMENT || 'gpt-4o',
        messages: [{ role: 'user', content: 'Say "Personalization engine healthy" if you can respond.' }],
        max_tokens: 10
      });
      
      return {
        status: 'healthy',
        message: `Personalization engine operational: ${response.choices[0]?.message?.content}`
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Personalization engine error: ${error.message}`
      };
    }
  }
}

// Export singleton instance
export const personalizationEngine = new PersonalizationEngine();