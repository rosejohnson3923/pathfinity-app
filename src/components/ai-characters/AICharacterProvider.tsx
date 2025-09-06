/**
 * AI CHARACTER PROVIDER
 * Provides AI character context and Azure OpenAI integration for educational components
 * Supports age-progressive character selection and COPPA-compliant interactions
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { azureOpenAIService } from '../../services/azureOpenAIService';
import { AICharacter, CharacterResponse, ChatContext } from '../../types/AICharacterTypes';
import { PATHFINITY_CHARACTERS, aiCharacterProvider } from '../../services/aiCharacterProvider';
import { voiceManagerService } from '../../services/voiceManagerService';
import { getCompanionImageUrl } from '../../services/aiCompanionImages';

interface AICharacterContextType {
  // Current character state
  currentCharacter: AICharacter | null;
  availableCharacters: AICharacter[];
  
  // Character selection
  selectCharacter: (characterId: string) => void;
  getRecommendedCharacter: (grade: string, subject: string) => AICharacter | null;
  
  // AI interactions
  generateCharacterResponse: (prompt: string, options?: CharacterResponseOptions) => Promise<CharacterResponse>;
  speakMessage: (message: string, characterId?: string) => Promise<void>;
  
  // Safety and compliance
  isContentSafe: (content: string, grade: string) => Promise<boolean>;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

interface CharacterResponseOptions {
  requiresSafetyCheck?: boolean;
  includeVoiceMetadata?: boolean;
  grade?: string;
}

interface CharacterResponse {
  message: string;
  emotion: string;
  educationalPoints: string[];
  voiceSettings?: {
    rate: number;
    pitch: number;
    emotion: string;
  };
  character: AICharacter;
  safety?: {
    isAppropriate: boolean;
    coppaCompliant: boolean;
    concerns: string[];
  };
}

const AICharacterContext = createContext<AICharacterContextType | null>(null);

interface AICharacterProviderProps {
  children: ReactNode;
  defaultCharacterId?: string;
  studentGrade?: string;
  studentSubject?: string;
}

const AICharacterProviderBase: React.FC<AICharacterProviderProps> = ({
  children,
  defaultCharacterId,
  studentGrade = 'K',
  studentSubject = 'Math'
}) => {
  console.log('🚀 AICharacterProvider initialized with grade:', studentGrade, 'subject:', studentSubject);
  
  const [currentCharacter, setCurrentCharacter] = useState<AICharacter | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [availableCharacters, setAvailableCharacters] = useState<AICharacter[]>([
    // Provide immediate fallback characters to prevent undefined errors
    {
      id: 'finn',
      name: 'Finn',
      displayName: 'Finn the Explorer',
      description: 'A friendly and encouraging companion',
      personality: ['friendly', 'encouraging', 'playful'],
      ageRange: { min: 4, max: 8 },
      gradeRange: ['Pre-K', 'K', '1', '2'],
      subjects: ['Math', 'Science'],
      avatar: { imageUrl: getCompanionImageUrl('finn'), color: '#4F46E5', style: 'playful' },
      voiceSettings: { tone: 'cheerful', pace: 'slow', formality: 'casual' as const },
      learningStyle: ['visual'],
      specialties: ['counting']
    },
    {
      id: 'sage',
      name: 'Sage',
      displayName: 'Sage the Wise',
      description: 'A knowledgeable and supportive mentor',
      personality: ['wise', 'supportive', 'methodical'],
      ageRange: { min: 9, max: 12 },
      gradeRange: ['3', '4', '5'],
      subjects: ['Math', 'Science', 'ELA'],
      avatar: { imageUrl: getCompanionImageUrl('sage'), color: '#059669', style: 'scholarly' },
      voiceSettings: { tone: 'thoughtful', pace: 'moderate', formality: 'friendly' as const },
      learningStyle: ['analytical'],
      specialties: ['problem solving']
    },
    {
      id: 'spark',
      name: 'Spark',
      displayName: 'Spark the Innovator',
      description: 'A dynamic and innovative guide',
      personality: ['innovative', 'energetic', 'creative'],
      ageRange: { min: 13, max: 15 },
      gradeRange: ['6', '7', '8'],
      subjects: ['STEM', 'Technology'],
      avatar: { imageUrl: getCompanionImageUrl('spark'), color: '#DC2626', style: 'modern' },
      voiceSettings: { tone: 'energetic', pace: 'fast', formality: 'friendly' as const },
      learningStyle: ['hands-on'],
      specialties: ['innovation']
    },
    {
      id: 'harmony',
      name: 'Harmony',
      displayName: 'Harmony the Guide',
      description: 'A balanced and mature mentor',
      personality: ['balanced', 'mature', 'empowering'],
      ageRange: { min: 16, max: 18 },
      gradeRange: ['9', '10', '11', '12'],
      subjects: ['All Subjects'],
      avatar: { imageUrl: getCompanionImageUrl('harmony'), color: '#7C2D12', style: 'professional' },
      voiceSettings: { tone: 'professional', pace: 'moderate', formality: 'professional' as const },
      learningStyle: ['independent'],
      specialties: ['leadership']
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize characters on mount
  useEffect(() => {
    console.log('🔄 AICharacterProvider useEffect triggered');
    const initializeCharacters = async () => {
      try {
        console.log('⚡ Starting character initialization...');
        setIsLoading(true);
        setError(null);

        // Get all characters from PATHFINITY_CHARACTERS
        // Temporarily hardcode characters to test
        const characters = PATHFINITY_CHARACTERS || [
          {
            id: 'finn',
            name: 'Finn',
            displayName: 'Finn the Explorer',
            description: 'A friendly and encouraging companion perfect for young learners',
            personality: ['friendly', 'encouraging', 'playful'],
            ageRange: { min: 4, max: 8 },
            gradeRange: ['Pre-K', 'K', '1', '2'],
            subjects: ['Math', 'Science', 'General Learning'],
            avatar: { imageUrl: getCompanionImageUrl('finn'), color: '#4F46E5', style: 'playful' },
            voiceSettings: { tone: 'cheerful', pace: 'slow', formality: 'casual' as const },
            learningStyle: ['visual', 'kinesthetic'],
            specialties: ['counting', 'shapes']
          }
        ];
        console.log('🔍 Loading characters from PATHFINITY_CHARACTERS:', characters);
        console.log('🔍 Characters count:', characters?.length || 0);
        console.log('🔍 First character:', characters?.[0]);
        
        // Fallback if characters are undefined
        if (!characters || characters.length === 0) {
          console.error('❌ PATHFINITY_CHARACTERS is undefined or empty!');
          throw new Error('Characters not loaded');
        }
        
        setAvailableCharacters(characters);

        // Set default or recommended character
        let selectedCharacter: AICharacter | null = null;

        if (defaultCharacterId) {
          selectedCharacter = characters.find(c => c.id === defaultCharacterId) || null;
        }

        if (!selectedCharacter) {
          // Get recommended character for grade/subject
          selectedCharacter = getRecommendedCharacterForGrade(characters, studentGrade);
        }

        setCurrentCharacter(selectedCharacter);

        console.log(`🤖 AI Character Provider initialized with ${selectedCharacter?.name} for Grade ${studentGrade} ${studentSubject}`);
        
      } catch (error) {
        console.error('❌ Failed to initialize AI characters:', error);
        setError('Failed to initialize AI characters');
      } finally {
        setIsLoading(false);
      }
    };

    initializeCharacters();
  }, [defaultCharacterId, studentGrade, studentSubject]);

  // Helper function to get recommended character for grade
  const getRecommendedCharacterForGrade = (characters: AICharacter[], grade: string): AICharacter | null => {
    const gradeNum = grade === 'K' ? 0 : parseInt(grade) || 0;
    const ageForGrade = gradeNum <= 0 ? 5 : gradeNum + 5; // K=5, 1st=6, etc.
    
    // Find character whose age range includes this grade
    const recommendedCharacter = characters.find(character => {
      return ageForGrade >= character.ageRange.min && ageForGrade <= character.ageRange.max;
    });

    return recommendedCharacter || characters[0]; // Default to Finn
  };

  const selectCharacter = (characterId: string) => {
    const character = availableCharacters.find(c => c.id === characterId);
    if (character) {
      setCurrentCharacter(character);
      console.log(`🎭 Switched to character: ${character.name}`);
      // Note: Removed voice cache clearing as it was causing re-render issues
    } else {
      console.warn(`⚠️ Character not found: ${characterId}`);
    }
  };

  const getRecommendedCharacter = (grade: string, subject: string): AICharacter | null => {
    return getRecommendedCharacterForGrade(availableCharacters, grade);
  };

  const generateCharacterResponse = async (
    prompt: string, 
    options: CharacterResponseOptions = {}
  ): Promise<CharacterResponse> => {
    if (!currentCharacter) {
      throw new Error('No character selected');
    }

    // Prevent concurrent response generation
    if (isGeneratingResponse) {
      console.log('🚧 Character response generation already in progress, skipping duplicate call');
      throw new Error('Response generation already in progress');
    }

    const {
      requiresSafetyCheck = true,
      includeVoiceMetadata = true,
      grade = studentGrade
    } = options;

    setIsGeneratingResponse(true);
    setIsLoading(true);
    setError(null);

    // DETAILED LOGGING: Start of generation
    console.group(`🤖 AI Character Response Generation - ${currentCharacter.name}`);
    console.log('📝 Input Prompt:', prompt);
    console.log('🎯 Options:', options);
    console.log('📚 Grade Level:', grade);
    console.log('🎭 Current Character:', currentCharacter);
    console.log('⏰ Timestamp:', new Date().toISOString());

    try {
      // Determine language complexity based on grade
      const gradeNum = grade === 'K' ? 0 : parseInt(grade) || 0;
      let languageGuidelines = '';
      
      if (gradeNum <= 0) {
        languageGuidelines = 'Use very simple words, short sentences (5-7 words), lots of encouragement, and repeat key concepts';
      } else if (gradeNum <= 2) {
        languageGuidelines = 'Use simple vocabulary, short sentences (7-10 words), clear explanations, and positive reinforcement';
      } else if (gradeNum <= 5) {
        languageGuidelines = 'Use grade-appropriate vocabulary, medium sentences (10-15 words), introduce new concepts clearly';
      } else if (gradeNum <= 8) {
        languageGuidelines = 'Use more advanced vocabulary, complex sentences, encourage critical thinking, relate to real-world';
      } else {
        languageGuidelines = 'Use sophisticated vocabulary, complex ideas, professional tone, career and college connections';
      }

      const systemPrompt = `You are ${currentCharacter.displayName}, an AI learning companion for students.

CHARACTER TRAITS:
- Personality: ${currentCharacter.personality.join(', ')}
- Age Range: ${currentCharacter.ageRange.min}-${currentCharacter.ageRange.max} years old
- Tone: ${currentCharacter.voiceSettings.tone}
- Formality: ${currentCharacter.voiceSettings.formality}

GRADE-SPECIFIC LANGUAGE (Grade ${grade}):
${languageGuidelines}

RESPONSE GUIDELINES:
1. Match your personality traits and tone
2. Adapt language complexity to grade ${grade} level
3. Be encouraging and supportive
4. Keep responses concise and engaging
5. Focus on learning and growth
6. Maintain child safety at all times

Respond as ${currentCharacter.name} would, but adjust your language maturity for a grade ${grade} student.`;

      // DETAILED LOGGING: System prompt
      console.log('🔧 System Prompt:', systemPrompt);
      console.log('📊 Request Parameters:', { temperature: 0.7, maxTokens: 200 });

      const responseText = await azureOpenAIService.generateWithModel(
        'gpt4o',
        prompt,
        systemPrompt,
        { temperature: 0.7, maxTokens: 200 }
      );

      // DETAILED LOGGING: Full response
      console.log('✅ Full AI Response:', responseText);
      console.log('📏 Response Length:', responseText.length, 'characters');
      console.log('🔤 Response Preview (first 200 chars):', responseText.substring(0, 200));
      
      // Create CharacterResponse object
      const response: CharacterResponse = {
        message: responseText,
        character: currentCharacter,
        emotion: 'helpful',
        educationalPoints: [],
        safe: true,
        tokens: Math.ceil(responseText.length / 4), // Rough estimate
        cost: 0.001, // Rough estimate
        responseTime: 0
      };
      
      console.log('📦 Final Response Object:', response);
      console.groupEnd();
      
      return response;

    } catch (error: any) {
      console.error(`❌ Character response error:`, error);
      setError(`${currentCharacter.name} couldn't respond: ${error.message}`);
      throw error;
    } finally {
      setIsGeneratingResponse(false);
      setIsLoading(false);
    }
  };

  const speakMessage = async (message: string, characterId?: string): Promise<void> => {
    // Prevent concurrent speech activations
    if (isSpeaking) {
      console.log('🔇 Speech already in progress, skipping duplicate call');
      return;
    }

    const character = characterId ? 
      aiCharacterProvider.getCharacterById(characterId) : 
      currentCharacter;

    if (!character) {
      console.warn('⚠️ No character available for speech');
      return;
    }

    // DETAILED LOGGING: Speech generation
    console.group(`🔊 Speech Generation - ${character.name}`);
    console.log('📝 Original Message:', message);
    console.log('📏 Message Length:', message.length, 'characters');
    console.log('🎭 Character:', character);
    console.log('📚 Grade Level:', studentGrade);

    setIsSpeaking(true);
    try {
      await voiceManagerService.generateAndSpeak(character.id, message, studentGrade);
      console.log('✅ Speech completed successfully');
      console.log('🔤 Full message spoken:', message);
    } catch (error: any) {
      console.error(`❌ Speech error for ${character.name}:`, error);
      // Fail gracefully - don't throw error for speech issues
    } finally {
      setIsSpeaking(false);
      console.groupEnd();
    }
  };

  const isContentSafe = async (content: string, grade: string): Promise<boolean> => {
    try {
      const safetyCheck = await azureOpenAIService.performContentSafetyCheck(content, grade);
      return safetyCheck.isAppropriate && safetyCheck.coppaCompliant;
    } catch (error) {
      console.error('❌ Content safety check failed:', error);
      // Fail safe - assume unsafe if check fails
      return false;
    }
  };

  const contextValue: AICharacterContextType = {
    currentCharacter,
    availableCharacters,
    selectCharacter,
    getRecommendedCharacter,
    generateCharacterResponse,
    speakMessage,
    isContentSafe,
    isLoading,
    error
  };

  return (
    <AICharacterContext.Provider value={contextValue}>
      {children}
    </AICharacterContext.Provider>
  );
};

// Export with React.memo to prevent unnecessary re-renders
export const AICharacterProvider = React.memo(AICharacterProviderBase);

export const useAICharacter = (): AICharacterContextType => {
  const context = useContext(AICharacterContext);
  if (!context) {
    throw new Error('useAICharacter must be used within AICharacterProvider');
  }
  return context;
};

export type { AICharacterContextType, CharacterResponse, CharacterResponseOptions };