/**
 * AI-FIRST LEARN CONTAINER
 * Built from scratch to work natively with AI-generated content
 */

import React, { useState, useEffect, useRef } from 'react';
import { aiLearningJourneyService, AILearnContent, StudentProfile, LearningSkill } from '../../services/AILearningJourneyService';
import { unifiedLearningAnalyticsService } from '../../services/unifiedLearningAnalyticsService';
import { learningMetricsService } from '../../services/learningMetricsService';
import { companionReactionService } from '../../services/companionReactionService';
import { voiceManagerService } from '../../services/voiceManagerService';
import { companionVoiceoverService } from '../../services/companionVoiceoverService';
import { lightweightPracticeSupportService } from '../../services/lightweightPracticeSupportService';
// import { PracticeQuestionSupport } from '../../types/practiceSupport'; // Not needed with lightweight service
import { questionTypeValidator } from '../../services/questionTypeValidator';
import { usePathIQGamification, getXPRewardForAction } from '../../hooks/usePathIQGamification';
import { useModeContext } from '../../contexts/ModeContext';
import { useAICharacter } from '../ai-characters/AICharacterProvider';
import { AICharacterAvatar } from '../ai-characters/AICharacterAvatar';
import { ContainerNavigationHeader } from './ContainerNavigationHeader';
import { FloatingLearningDock } from '../learning-support/FloatingLearningDock';
import { CompanionChatBox } from '../learning-support/CompanionChatBox';
import { VisualRenderer } from './VisualRenderer';
import { EnhancedLoadingScreen } from './EnhancedLoadingScreen';
import { XPDisplay } from '../gamification/XPDisplay';
import { useTheme } from '../../hooks/useTheme';
import { contentCacheService } from '../../services/contentCacheService';
import { premiumDemoContentV2 } from '../../services/PremiumDemoContentServiceV2';
import { iconVisualService } from '../../services/iconVisualService';
import { learnAIRulesEngine } from '../../rules-engine/containers/LearnAIRulesEngine';
import './AILearnContainer.css';

// ================================================================
// COMPONENT INTERFACES
// ================================================================

interface AILearnContainerProps {
  student: StudentProfile;
  skill: LearningSkill;
  selectedCharacter?: string;
  selectedCareer?: any;
  onComplete: (success: boolean) => void;
  onNext: () => void;
  onBack?: () => void;
}

type LearningPhase = 'loading' | 'instruction' | 'practice' | 'assessment' | 'complete';

// ================================================================
// AI LEARN CONTAINER COMPONENT
// ================================================================

export const AILearnContainer: React.FC<AILearnContainerProps> = ({
  student,
  skill,
  selectedCharacter,
  selectedCareer,
  onComplete,
  onNext,
  onBack
}) => {
  const theme = useTheme();
  
  // AI Character Integration
  const { currentCharacter, generateCharacterResponse, speakMessage, selectCharacter } = useAICharacter();
  
  // Ensure the correct character is selected - normalize to lowercase
  React.useEffect(() => {
    if (selectedCharacter) {
      // Normalize character name to lowercase for matching (Harmony -> harmony)
      const normalizedCharacter = selectedCharacter.toLowerCase();
      if (currentCharacter?.id !== normalizedCharacter) {
        selectCharacter(normalizedCharacter);
      }
    }
  }, [selectedCharacter]); // Removed currentCharacter from deps to prevent re-trigger loop
  
  
  // Wrapped navigation handlers that stop speech
  const handleNavNext = () => {
    voiceManagerService.stopSpeaking();
    onNext();
  };
  
  const handleNavBack = () => {
    if (onBack) {
      voiceManagerService.stopSpeaking();
      onBack();
    }
  };
  // ================================================================
  // DEBUG MOUNT/UNMOUNT
  // ================================================================
  
  useEffect(() => {
    const mountId = Math.random().toString(36).substr(2, 9);
    console.log(`[MOUNT-${mountId}] s:${skill?.id}`);
    
    return () => {
      console.log(`[UNMOUNT-${mountId}]`);
    };
  }, []); // Empty dependency array - only runs on mount/unmount
  
  // ================================================================
  // STATE MANAGEMENT
  // ================================================================
  
  const [phase, setPhase] = useState<LearningPhase>('loading');
  const [content, setContent] = useState<AILearnContent | null>(null);
  const [currentExample, setCurrentExample] = useState(0);
  const [currentPractice, setCurrentPractice] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, string | number>>({});
  const [showPracticeFeedback, setShowPracticeFeedback] = useState<Record<number, boolean>>({});
  const [practicePerformance, setPracticePerformance] = useState<{
    correct: number;
    total: number;
    struggles: string[];
  }>({ correct: 0, total: 0, struggles: [] });
  const [assessmentAnswer, setAssessmentAnswer] = useState<number | null>(null);
  const [showAssessmentResult, setShowAssessmentResult] = useState(false);
  const [assessmentIsCorrect, setAssessmentIsCorrect] = useState(false);
  const [sessionId] = useState(`learn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  // Floating dock is always visible, no toggle needed
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [isGreeting, setIsGreeting] = useState(false);
  const [companionMessage, setCompanionMessage] = useState<{ text: string; emotion: string } | null>(null);
  const companionChatRef = useRef<any>(null);
  const [hasReadExample, setHasReadExample] = useState<Record<number, boolean>>({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasReadPracticeQuestion, setHasReadPracticeQuestion] = useState<Record<number, boolean>>({});
  const [isPracticeSupportActive, setIsPracticeSupportActive] = useState(false);
  const [currentPracticeSupport, setCurrentPracticeSupport] = useState<PracticeQuestionSupport | null>(null);
  const [hasReadAssessment, setHasReadAssessment] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true); // Default to audio ON for all grades

  // XP Gamification Integration
  const { 
    profile, 
    awardXP, 
    features,
    availableHints: xpHints,
    useHint: useXPHint
  } = usePathIQGamification(student.id, student.grade_level);
  const [xpAwarded, setXPAwarded] = useState<Record<string, boolean>>({});
  
  // Cache parameters (used across multiple functions)
  const cacheParams = {
    type: 'learn' as const,
    skillId: skill?.id || 'unknown',
    studentId: student?.id || 'unknown',
    careerId: selectedCareer?.id || 'general'
  };

  // ================================================================
  // PRACTICE SUPPORT EFFECTS
  // ================================================================
  
  // Cleanup practice support on unmount or phase change
  useEffect(() => {
    return () => {
      if (isPracticeSupportActive) {
        lightweightPracticeSupportService.cleanup();
      }
    };
  }, []);
  
  // Log when companion message changes
  // CompanionChatBox ref disabled - using toast notification instead
  /* useEffect(() => {
    if (companionMessage) {
      // If we have a ref, ensure the message is shown
      if (companionChatRef.current && companionChatRef.current.showMessage) {
        companionChatRef.current.showMessage(companionMessage.text);
      }
    }
  }, [companionMessage]); */

  // Initialize lightweight practice support when starting a new practice question
  useEffect(() => {
    if (phase === 'practice' && content && isPracticeSupportActive) {
      // Start tracking the current question (lightweight, no state updates)
      lightweightPracticeSupportService.startQuestion(currentPractice);
      
      const question = content.practice[currentPractice];
      if (question && question.practiceSupport) {
        // Create PracticeQuestionSupport object
        const practiceSupport: PracticeQuestionSupport = {
          questionId: currentPractice,
          question: question.question,
          type: question.type,
          companionSupport: {
            preQuestion: {
              contextSetup: question.practiceSupport.preQuestionContext || '',
              connectionToLearn: question.practiceSupport.connectionToLearn || '',
              confidenceBuilder: question.practiceSupport.confidenceBuilder || '',
              readQuestion: student.grade_level === 'K' || student.grade_level === '1' || student.grade_level === '2',
              visualHighlight: question.visual
            },
            hints: question.practiceSupport.hints?.map(h => ({
              level: h.level,
              trigger: { type: 'time' as const, value: h.level * 10 },
              hint: h.hint,
              visualCue: h.visualCue,
              example: h.example
            })) || [],
            feedback: {
              correct: {
                immediate: question.practiceSupport.correctFeedback?.immediate || 'Great job!',
                explanation: question.explanation,
                careerConnection: question.practiceSupport.correctFeedback?.careerConnection || '',
                skillReinforcement: question.practiceSupport.correctFeedback?.skillReinforcement || ''
              },
              incorrect: {
                immediate: question.practiceSupport.incorrectFeedback?.immediate || 'Let\'s try again!',
                explanation: question.practiceSupport.incorrectFeedback?.explanation || question.explanation,
                reteach: question.practiceSupport.incorrectFeedback?.reteach || '',
                tryAgainPrompt: question.practiceSupport.incorrectFeedback?.tryAgainPrompt,
                showCorrectAnswer: true
              }
            },
            duringQuestion: {
              monitoringInterval: 1,
              encouragementTriggers: [
                { afterSeconds: 30, message: 'Take your time!' },
                { afterSeconds: 60, message: 'You\'re doing great!' }
              ],
              visualSupport: {
                highlightKey: true,
                showCareerContext: !!selectedCareer,
                animateHints: true
              }
            },
            postQuestion: {
              transitionMessage: `Moving to question ${currentPractice + 2}...`,
              skillSummary: `You're learning ${skill.skill_name}!`,
              nextQuestionPrep: currentPractice < content.practice.length - 1 ? 'Ready for the next one?' : undefined
            }
          },
          teachingMoments: {
            conceptExplanation: question.practiceSupport.teachingMoment?.conceptExplanation || question.explanation,
            realWorldExample: question.practiceSupport.teachingMoment?.realWorldExample || '',
            commonMistakes: question.practiceSupport.teachingMoment?.commonMistakes
          },
          masteryIndicators: {
            quickCorrect: false,
            usedHintSucceeded: false,
            multipleAttempts: 1,
            timeToAnswer: 0,
            confidenceLevel: 'medium'
          }
        };
        
        setCurrentPracticeSupport(practiceSupport);
        
        // Practice support is now handled by lightweight service
        // The lightweight service is already initialized and tracking questions
      }
    }
  }, [phase, currentPractice, content, isPracticeSupportActive]);

  // ================================================================
  // CONTENT GENERATION
  // ================================================================

  useEffect(() => {
    // Only regenerate if skill ID or student ID actually changes
    // AND we don't already have content for this skill
    // AND we're not already generating
    if (skill?.id && student?.id && !isGenerating) {
      if (!content || content.skill_id !== skill.id) {
        generateContent();
      }
    }
  }, [skill?.id, student?.id]); // Keep dependencies minimal to prevent re-renders

  // Helper function to validate and fix question types
  const validateAndFixQuestionTypes = (content: AILearnContent): AILearnContent => {
    const validatedContent = { ...content };
    
    // Validate and fix practice question types
    if (validatedContent.practice) {
      validatedContent.practice = validatedContent.practice.map(question => {
        const detectedType = questionTypeValidator.detectType(question);
        return {
          ...question,
          type: detectedType as any // Use the validated type
        };
      });
    }
    
    // Also validate assessment question type
    if (validatedContent.assessment) {
      const assessmentType = questionTypeValidator.detectType(validatedContent.assessment);
      validatedContent.assessment.type = assessmentType as any;
    }
    
    return validatedContent;
  };

  const generateContent = async () => {
    console.log('🔄 generateContent called with:', { 
      skill: skill, 
      student: student,
      hasContent: !!content,
      isGenerating 
    });
    
    if (!skill || !student) {
      console.error('❌ Missing required props:', { skill, student });
      setLoadingError('Missing required data to generate content');
      return;
    }

    // Prevent duplicate content generation
    if (content && content.skill_id === skill.id) {
      console.log('✅ Content already exists for this skill, skipping generation');
      setPhase('practice'); // Start with practice phase for diagnostic
      return;
    }

    // Prevent concurrent generation calls
    if (isGenerating) {
      console.log('⏳ Content generation already in progress, skipping');
      return;
    }

    // Check for cached content using improved cache service
    const cachedContent = contentCacheService.get<AILearnContent>(cacheParams);
    
    if (cachedContent) {
      try {
        // Validate and fix question types even for cached content
        const validatedContent = validateAndFixQuestionTypes(cachedContent);
        setContent(validatedContent);
        setPhase('practice'); // Start with practice phase for diagnostic
        console.log('✅ Using cached content - bypassing AI generation');
        return;
      } catch (error) {
        console.warn('Invalid cached content, regenerating...');
        contentCacheService.clear(cacheParams);
      }
    }

    // Set loading state to prevent multiple concurrent generations
    setIsGenerating(true);
    setPhase('loading');
    setLoadingError(null);
    
    try {
      // Start learning metrics session
      learningMetricsService.startSession(
        student.id,
        selectedCareer?.name,
        selectedCharacter || currentCharacter?.id
      );
      
      // Track session start with character
      await unifiedLearningAnalyticsService.trackLearningEvent({
        studentId: student.id,
        sessionId,
        eventType: 'lesson_start',
        metadata: {
          grade: student.grade_level,
          subject: skill.subject,
          skill: skill.skill_name,
          container: 'learn',
          characterId: selectedCharacter || currentCharacter?.id,
          careerId: selectedCareer?.id
        }
      });

      // DON'T speak during content generation - wait until instruction phase
      // This prevents speaking while still on loading screen

      // Debug: log student info to verify detection
      console.log('🔍 Student info for demo detection:', {
        id: student.id,
        display_name: student.display_name,
        grade_level: student.grade_level
      });

      // ALL users use AI content generation for consistency and proper question types
      // This ensures we can fine-tune the system during testing
      let practiceQuestions = await aiLearningJourneyService.generateDiagnosticPractice(skill, student, selectedCareer);
      
      // Validate practice questions
      if (!practiceQuestions || practiceQuestions.length === 0) {
        console.error('⚠️ No practice questions generated, using fallback');
        // Create fallback practice questions
        practiceQuestions = [
          {
            question: `Let's practice ${skill.skill_name}! What comes next in this pattern: 1, 2, 3, ?`,
            type: 'multiple_choice' as const,
            options: ['4', '5', '6', '7'],
            correct_answer: 0,
            hint: 'Think about counting up by 1',
            explanation: 'The pattern increases by 1 each time, so 4 comes next.'
          },
          {
            question: `Can you solve this ${skill.subject} problem?`,
            type: 'multiple_choice' as const,
            options: ['Answer A', 'Answer B', 'Answer C', 'Answer D'],
            correct_answer: 1,
            hint: 'Take your time and think through it',
            explanation: 'Good try! Let me explain the concept.'
          }
        ];
      }
      
      console.log('📋 Practice questions ready:', {
        count: practiceQuestions.length,
        firstQuestion: practiceQuestions[0]
      });
      
      const initialContent: AILearnContent = {
        title: `Learning ${skill.skill_name}`,
        greeting: '',
        concept: '',
        examples: [],
        practice: practiceQuestions,
        assessment: {
          question: '',
          options: [],
          correct_answer: 0,
          explanation: '',
          success_message: ''
        }
      };
      
      // Cache the practice questions for quick reload
      contentCacheService.set(
        { ...cacheParams, phase: 'practice' },
        practiceQuestions,
        15 * 60 * 1000 // 15 minutes TTL for practice questions
      );
      
      // Validate and fix question types
      const validatedContent = validateAndFixQuestionTypes(initialContent);
      
      console.log('📝 Setting content and transitioning to practice:', {
        hasContent: !!validatedContent,
        practiceLength: validatedContent.practice?.length,
        firstQuestion: validatedContent.practice?.[0]
      });
      
      setContent(validatedContent);
      setPhase('practice'); // Start with practice phase for diagnostic
      
      
    } catch (error) {
      console.error('❌ Failed to generate AI Learn content');
      setLoadingError(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // The fallback content should be returned by the service
      setPhase('practice'); // Start with practice even with fallback content
    } finally {
      // Always reset generation flag
      setIsGenerating(false);
    }
  };

  // ================================================================
  // SPEECH HELPERS
  // ================================================================
  
  const readTextAloud = async (text: string) => {
    if (!currentCharacter || !speakMessage) return;
    
    // Stop any current speech
    voiceManagerService.stopSpeaking();
    setIsSpeaking(true);
    
    try {
      await speakMessage(text);
    } finally {
      setIsSpeaking(false);
    }
  };
  
  const handleReplayQuestion = () => {
    if (phase === 'practice' && content) {
      const question = content.practice[currentPractice];
      if (question) {
        readTextAloud(question.question);
      }
    } else if (phase === 'assessment' && content) {
      readTextAloud(content.assessment.question);
    }
  };

  // ================================================================
  // STOP SPEECH ON UNMOUNT OR NAVIGATION
  // ================================================================

  useEffect(() => {
    // Stop any ongoing speech when component unmounts or user navigates away
    return () => {
      voiceManagerService.stopSpeaking();
      companionVoiceoverService.stopCurrent();
    };
  }, []);

  // ================================================================
  // READ INSTRUCTION EXAMPLES OUT LOUD
  // ================================================================
  
  useEffect(() => {
    // Read instruction examples when they change (if audio is enabled)
    console.log('🎤 Instruction audio check:', {
      phase,
      hasContent: !!content,
      currentCharacter,
      hasSpeakMessage: !!speakMessage,
      isAudioEnabled,
      currentExample,
      hasReadExample: hasReadExample[currentExample]
    });
    
    if (phase === 'instruction' && content && currentCharacter && speakMessage && isAudioEnabled) {
      const example = content.examples[currentExample];
      
      if (example && !hasReadExample[currentExample]) {
        console.log('🔊 Reading instruction example:', currentExample + 1);
        // Stop any previous speech first
        voiceManagerService.stopSpeaking();
        
        // Mark as read to prevent re-reading
        setHasReadExample(prev => ({ ...prev, [currentExample]: true }));
        
        // Small delay to ensure UI is rendered
        const timer = setTimeout(() => {
          // Read the full teaching content for better learning
          const textToRead = `Teaching Example ${currentExample + 1}. ${example.question}. 
            The solution is: ${example.answer}. 
            Let me explain: ${example.explanation}`;
          console.log('📢 Speaking text:', textToRead);
          readTextAloud(textToRead);
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
  }, [phase, currentExample, content, currentCharacter, speakMessage, hasReadExample, isAudioEnabled]);

  // ================================================================
  // READ QUESTIONS OUT LOUD
  // ================================================================

  useEffect(() => {
    // Read practice questions when they appear (only once per question, if audio is enabled)
    if (phase === 'practice' && content && currentCharacter && speakMessage && isAudioEnabled) {
      const question = content.practice[currentPractice];
      const showFeedback = showPracticeFeedback[currentPractice];
      const hasRead = hasReadPracticeQuestion[currentPractice];
      
      if (question && !showFeedback && !hasRead) {
        // Mark as read immediately to prevent multiple reads
        setHasReadPracticeQuestion(prev => ({ ...prev, [currentPractice]: true }));
        
        // Stop any previous speech first
        voiceManagerService.stopSpeaking();
        
        // Small delay to ensure UI is rendered
        const timer = setTimeout(() => {
          readTextAloud(question.question);
        }, 500);
        
        return () => clearTimeout(timer);
      }
    }
    
    // Read assessment question when it appears (only once, if audio is enabled)
    if (phase === 'assessment' && content && currentCharacter && speakMessage && isAudioEnabled && !showAssessmentResult && !hasReadAssessment) {
      // Mark as read immediately to prevent multiple reads
      setHasReadAssessment(true);
      
      // Stop any previous speech first
      voiceManagerService.stopSpeaking();
      
      // Small delay to ensure UI is rendered
      const timer = setTimeout(() => {
        readTextAloud(content.assessment.question);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [phase, currentPractice, content, currentCharacter, speakMessage, showPracticeFeedback, showAssessmentResult, hasReadPracticeQuestion, hasReadAssessment, isAudioEnabled]);

  // ================================================================
  // CLEANUP ON UNMOUNT
  // ================================================================
  
  useEffect(() => {
    return () => {
      // Stop any ongoing speech when component unmounts
      voiceManagerService.stopSpeaking();
    };
  }, []);

  // ================================================================
  // RESET GREETING FLAG WHEN SKILL CHANGES
  // ================================================================
  
  useEffect(() => {
    // Reset greeting flag when skill changes (new subject)
    setHasGreeted(false);
    setIsGreeting(false);
  }, [skill.id, skill.skill_name]);

  // ================================================================
  // CHARACTER GREETING (ONCE CONTENT IS READY)
  // ================================================================

  useEffect(() => {
    // Only speak greeting ONCE when we first enter instruction phase
    if (phase === 'instruction' && content && !hasGreeted && !isGreeting && (selectedCharacter || currentCharacter)) {
      const greetStudent = async () => {
        // Double-check to prevent race conditions
        if (isGreeting || hasGreeted) return;
        
        setIsGreeting(true);
        setHasGreeted(true); // Mark immediately to prevent duplicate calls
        
        try {
          // DETAILED LOGGING: Start building greeting
          
          // Build a comprehensive greeting that includes the career context from the lesson
          let greetingPrompt = '';
          
          // Include the personalized greeting if available
          if (content.greeting) {
            greetingPrompt = content.greeting;
          }
          
          // Add the learning concept with career context
          if (content.concept) {
            greetingPrompt += ` ${content.concept}`;
          }
          
          // Fallback if no content is available
          if (!greetingPrompt) {
            greetingPrompt = `Hello! I'm here to help you learn about ${skill.skill_name}. Let's make this fun!`;
          }
          
          
          // Construct the full prompt for AI
          const fullPrompt = `Please greet the student and explain this lesson in your own words: "${greetingPrompt}". Keep it friendly, encouraging, and age-appropriate for grade ${student.grade_level}.`;
          
          // Have the AI Companion paraphrase in their personality
          const response = await generateCharacterResponse(
            fullPrompt,
            { grade: student.grade_level }
          );
          
          
          if (response?.message) {
            // Speak the greeting only when instruction phase is visible
            await speakMessage(response.message);
          } else {
          }
          
        } catch (error) {
          // Only log if it's not a duplicate error
          if (!error.message?.includes('already in progress')) {
            console.error('Failed to generate character greeting:', error);
          }
        } finally {
          setIsGreeting(false);
        }
      };
      
      // Small delay to ensure the instruction UI is fully rendered
      const timer = setTimeout(greetStudent, 500);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [phase, content, hasGreeted, isGreeting]);

  // ================================================================
  // NAVIGATION HANDLERS
  // ================================================================

  const handlePracticeComplete = async () => {
    // Practice (diagnostic) complete, calculate performance
    const score = calculatePracticeScore();
    const struggles: string[] = [];
    
    if (content) {
      content.practice.forEach((question, index) => {
        const answer = practiceAnswers[index];
        const isCorrect = answer === question.correct_answer || 
                         String(answer).toLowerCase() === String(question.correct_answer).toLowerCase();
        if (!isCorrect) {
          struggles.push(question.question.substring(0, 50));
        }
      });
    }
    
    const performance = {
      correct: Math.round((score / 100) * (content?.practice.length || 5)),
      total: content?.practice.length || 5,
      struggles
    };
    
    setPracticePerformance(performance);
    
    await unifiedLearningAnalyticsService.trackLearningEvent({
      studentId: student.id,
      sessionId,
      eventType: 'practice_complete',
      metadata: {
        grade: student.grade_level,
        subject: skill.subject,
        skill: skill.skill_name,
        container: 'learn',
        practiceScore: score,
        struggledAreas: struggles
      }
    });

    // Initialize support for instruction phase
    lightweightPracticeSupportService.initialize(student.id, student.grade_level, skill.skill_number);
    setIsPracticeSupportActive(true);
    
    // Generate adaptive instruction based on practice performance
    console.log('🎯 Practice complete, generating instruction phase');
    setPhase('loading'); // Show loading while generating adaptive content
    
    try {
      // For now, always use AI generation for instruction phase
      // SVG visuals are primarily for practice questions where counting is needed
      const instruction = await aiLearningJourneyService.generateAdaptiveInstruction(
        skill,
        student,
        performance,
        selectedCareer
      );
      
      // Update content with instruction
      const updatedContent = { ...content, ...instruction };
      
      console.log('📚 Instruction generated, transitioning to instruction phase');
      setContent(updatedContent);
      
      // Cache the updated content with instruction
      contentCacheService.set(
        cacheParams,
        updatedContent,
        30 * 60 * 1000 // 30 minutes TTL for complete content
      );
      
      setPhase('instruction');
    } catch (error) {
      console.error('Failed to generate adaptive instruction:', error);
      // Still transition to instruction with existing content
      setPhase('instruction');
    }
  };

  const calculatePracticeScore = () => {
    if (!content) return 0;
    const correct = Object.keys(practiceAnswers).filter(
      (index) => practiceAnswers[parseInt(index)] === content.practice[parseInt(index)]?.correct
    ).length;
    return Math.round((correct / content.practice.length) * 100);
  };

  const handleInstructionComplete = async () => {
    // Stop any ongoing speech when moving to next phase
    voiceManagerService.stopSpeaking();
    
    await unifiedLearningAnalyticsService.trackLearningEvent({
      studentId: student.id,
      sessionId,
      eventType: 'lesson_complete',
      metadata: {
        grade: student.grade_level,
        subject: skill.subject,
        skill: skill.skill_name,
        container: 'learn'
      }
    });

    // Generate final assessment (different from practice questions)
    setPhase('loading'); // Show loading while generating assessment
    try {
      // For assessment, also use AI generation but could add SVG visuals if needed
      const assessment = await aiLearningJourneyService.generateFinalAssessment(
        skill,
        student,
        selectedCareer
      );
      
      // Update content with assessment
      setContent(prev => prev ? { ...prev, assessment } : null);
      setPhase('assessment');
    } catch (error) {
      console.error('Failed to generate assessment:', error);
      setPhase('assessment'); // Continue anyway with default assessment
    }
  };

  const handlePracticeAnswer = async (questionIndex: number, answer: string | number) => {
    if (!content) return;

    setPracticeAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    setShowPracticeFeedback(prev => ({ ...prev, [questionIndex]: true }));

    const question = content.practice[questionIndex];
    
    if (!question) {
      console.error(`❌ No question found at index ${questionIndex}`);
      return;
    }
    
    if (question.correct_answer === undefined || question.correct_answer === null) {
      console.error(`❌ No correct_answer found for question:`, question);
      return;
    }

    // Handle different question types with proper type conversion
    let isCorrect = false;
    
    if (question.type === 'true_false') {
      // Normalize true/false to strings for comparison
      const normalizedAnswer = String(answer).toLowerCase();
      const normalizedCorrect = String(question.correct_answer).toLowerCase();
      isCorrect = normalizedAnswer === normalizedCorrect;
    } else if (question.type === 'multiple_choice') {
      // For multiple choice, convert both to strings and compare
      // This handles cases where answer might be number 3 but correct_answer is string "3"
      const stringAnswer = String(answer).trim();
      const stringCorrect = String(question.correct_answer).trim();
      isCorrect = stringAnswer === stringCorrect;
    } else if (question.type === 'numeric' || question.type === 'counting') {
      // Convert both to numbers for numeric comparison
      const numericAnswer = Number(answer);
      const numericCorrect = Number(question.correct_answer);
      
      // VALIDATION: Ensure we can properly compare counting answers
      if (question.type === 'counting' && typeof question.correct_answer === 'string') {
        console.warn(`⚠️ Counting question has string correct_answer, converting...`);
      }
      
      isCorrect = !isNaN(numericAnswer) && !isNaN(numericCorrect) && numericAnswer === numericCorrect;
      
      // Debug only if answer is wrong (to reduce console noise)
      if (!isCorrect && question.type === 'counting') {
        console.log(`❌ Counting answer marked incorrect:`);
        console.log(`   User: ${answer} (${typeof answer}) -> ${numericAnswer}`);
        console.log(`   Correct: ${question.correct_answer} (${typeof question.correct_answer}) -> ${numericCorrect}`);
      }
    } else if (question.type === 'fill_blank') {
      // Case-insensitive string comparison for fill in the blank
      const normalizedAnswer = String(answer).trim().toLowerCase();
      const normalizedCorrect = String(question.correct_answer).trim().toLowerCase();
      isCorrect = normalizedAnswer === normalizedCorrect;
    } else {
      // Fallback to string comparison
      const stringAnswer = String(answer).trim();
      const stringCorrect = String(question.correct_answer).trim();
      isCorrect = stringAnswer === stringCorrect;
    }
    
    // STEP 1: Re-enabling Learning Metrics Service
    
    const responseTime = Date.now() - questionStartTime;
    const companionId = selectedCharacter || currentCharacter?.id || 'finn-expert';

    // Track with learning metrics service (Phase 1)
    learningMetricsService.trackInteraction({
      studentId: student.id,
      questionId: `practice_${skill.skill_number}_${questionIndex}`,
      skillArea: skill.subject,
      responseTimeMs: responseTime,
      isCorrect,
      hintsUsed: hintsUsed,
      attemptsCount: attempts + 1,
      career: selectedCareer?.name,
      companion: companionId
    });
    
    // STEP 2: Re-enabling Analytics tracking
    // Track practice attempt (existing analytics)
    await unifiedLearningAnalyticsService.trackLearningEvent({
      studentId: student.id,
      sessionId,
      eventType: 'skill_progress',
      metadata: {
        grade: student.grade_level,
        subject: skill.subject,
        skill: skill.skill_name,
        container: 'learn',
        accuracy: isCorrect ? 100 : 0
      }
    });
    
    // STEP 3: Re-enabling Companion Reaction Service (without speech)
    // Get companion reaction based on result - normalize companion ID to lowercase
    const normalizedCompanionId = companionId?.toLowerCase() || 'finn';
    
    const reaction = companionReactionService.getCompanionReaction(
      isCorrect ? 'correct_answer' : 'incorrect_answer',
      normalizedCompanionId,
      {
        skill: skill.skill_name,
        career: selectedCareer?.name,
        attempts: attempts + 1
      }
    );


    // Show companion reaction
    let messageObj = { text: reaction.message, emotion: reaction.emotion };
    
    // Award XP for correct answers if gamification is enabled
    if (isCorrect && features.showXP && !xpAwarded[`practice_${questionIndex}`]) {
      const xpAmount = attempts === 0 ? 10 : attempts === 1 ? 5 : 2; // First try=10, second=5, third+=2
      const xpReason = attempts === 0 ? 'Correct on first try!' : 
                       attempts === 1 ? 'Correct on second try!' : 
                       'Persistent problem solving!';
      awardXP(xpAmount, xpReason, 'learning');
      setXPAwarded(prev => ({ ...prev, [`practice_${questionIndex}`]: true }));
      
      // Add XP message to companion response
      messageObj = { 
        text: `${reaction.message} You earned ${xpAmount} XP! 🎉`, 
        emotion: reaction.emotion 
      };
    }
    
    setCompanionMessage(messageObj);
    
    // Also use ref to directly show message after a small delay to ensure component is mounted
    setTimeout(() => {
      if (companionChatRef.current && companionChatRef.current.showMessage) {
        companionChatRef.current.showMessage(messageObj.text);
      }
    }, 500); // Increased delay to ensure component is fully mounted
    
    // Don't clear the message - let CompanionChatBox handle auto-hide
    // The CompanionChatBox component already has autoHide functionality
    
    // Handle with lightweight practice support service
    if (isPracticeSupportActive) {
      lightweightPracticeSupportService.handleAnswer(
        questionIndex,
        isCorrect,
        selectedCareer?.name || 'learner',
        selectedCharacter || 'finn'
      );
      
      // Check if we should provide encouragement (passive check, no state updates)
      const encouragement = lightweightPracticeSupportService.getEncouragement(
        questionIndex,
        attempts + 1,
        selectedCareer?.name || 'learner'
      );
      
      if (encouragement && !isCorrect) {
        // Add encouragement to companion message after a short delay
        setTimeout(() => {
          setCompanionMessage({ text: encouragement, emotion: 'encouraging' });
          if (companionChatRef.current && companionChatRef.current.showMessage) {
            companionChatRef.current.showMessage(encouragement);
          }
        }, 2000); // Show encouragement 2 seconds after the initial feedback
      }
    }
    
    // STEP 4: Re-enabling Speech synthesis for companion reactions
    // Have companion speak the reaction (non-blocking for faster progression)
    if (currentCharacter && speakMessage) {
      // Don't await - let speech happen in background
      speakMessage(reaction.message, {
        emotion: reaction.emotion,
        speed: reaction.voiceSpeed
      });
    }
    
    // Keep these simple state resets
    // Reset for next question
    setQuestionStartTime(Date.now());
    setHintsUsed(0);
    setAttempts(0);

    // Don't auto-advance - wait for user to click Next or press Enter
    // This gives users control over pacing and prevents delays
  };

  const handleAssessmentSubmit = async () => {
    if (!content || assessmentAnswer === null) return;

    // Use rules engine for validation
    const learnRules = learnAIRulesEngine.getEngineById('learn_rules');
    const validationResult = await learnRules.validateAnswer(
      content.assessment.type || 'numeric',
      assessmentAnswer,
      content.assessment.correct_answer,
      skill.subject,
      student.grade_level
    );
    
    const isCorrect = validationResult.isCorrect;
    const responseTime = Date.now() - questionStartTime;
    setShowAssessmentResult(true);
    setAssessmentIsCorrect(isCorrect);

    // Award XP for assessment completion if gamification is enabled
    if (features.showXP) {
      if (isCorrect && !xpAwarded['assessment']) {
        awardXP(20, 'Assessment completed successfully!', 'learning');
        setXPAwarded(prev => ({ ...prev, 'assessment': true }));
        console.log('🏆 XP Awarded: 20 for assessment completion');
      }
      
      // Check for perfect score (all practice questions correct + assessment correct)
      if (isCorrect && content && !xpAwarded['perfect_score']) {
        const allPracticeCorrect = content.practice.every((_, idx) => 
          showPracticeFeedback[idx] && practiceAnswers[idx] !== undefined
        );
        
        if (allPracticeCorrect) {
          awardXP(50, 'Perfect score! All answers correct!', 'achievement');
          setXPAwarded(prev => ({ ...prev, 'perfect_score': true }));
          console.log('🏆 XP Awarded: 50 for perfect score');
        }
      }
    }

    // Track with learning metrics service (Phase 1)
    learningMetricsService.trackInteraction({
      studentId: student.id,
      questionId: `assessment_${skill.skill_number}`,
      skillArea: skill.subject,
      responseTimeMs: responseTime,
      isCorrect,
      hintsUsed: 0,
      attemptsCount: 1,
      career: selectedCareer?.name,
      companion: selectedCharacter || currentCharacter?.id
    });

    // Track assessment completion
    await unifiedLearningAnalyticsService.trackLearningEvent({
      studentId: student.id,
      sessionId,
      eventType: 'assessment_submit',
      metadata: {
        grade: student.grade_level,
        subject: skill.subject,
        skill: skill.skill_name,
        container: 'learn',
        accuracy: isCorrect ? 100 : 0
      }
    });

    // Complete after showing result
    setTimeout(() => {
      setPhase('complete');
      onComplete(isCorrect);
    }, 4000);
  };

  // ================================================================
  // HINT SYSTEM
  // ================================================================
  
  const handleHintRequest = (hintLevel: 'free' | 'basic' | 'detailed') => {
    let hint = '';
    
    // Map hint levels to XP hint types if gamification is enabled
    if (features.showXP && features.showHintCosts && hintLevel !== 'free') {
      const xpHintType = hintLevel === 'basic' ? 'subtle' : 'clear';
      const success = useXPHint(xpHintType as any);
      
      if (!success) {
        setCurrentHint('Not enough XP for this hint. Try the free hint or keep practicing!');
        setTimeout(() => setCurrentHint(null), 5000);
        return;
      }
      
    }
    
    if (phase === 'practice' && content?.practice[currentPractice]) {
      const question = content.practice[currentPractice];
      if (hintLevel === 'free') {
        hint = `Think about what the question is asking...`;
      } else if (hintLevel === 'basic') {
        hint = question.hint || `Look at the problem step by step.`;
      } else if (hintLevel === 'detailed') {
        hint = `The answer is ${question.correct_answer}. ${question.explanation || ''}`;
      }
    } else if (phase === 'assessment' && content?.assessment) {
      if (hintLevel === 'free') {
        hint = `Remember what you learned about ${skill.skill_name}...`;
      } else if (hintLevel === 'basic') {
        hint = `Look for the option that best matches what we practiced.`;
      } else if (hintLevel === 'detailed') {
        hint = `The correct answer is option ${content.assessment.correct_answer}.`;
      }
    }
    
    setCurrentHint(hint);
    setHintsUsed(prev => prev + 1);
    
    // Auto-clear hint after 10 seconds
    setTimeout(() => setCurrentHint(null), 10000);
  };
  
  // ================================================================
  // RENDER WRAPPER WITH SIDEBAR
  // ================================================================
  
  const renderWithDock = (mainContent: React.ReactNode) => {
    return (
      <>
        {mainContent}
        {/* CompanionChatBox disabled - using toast notification instead */}
        {/* <CompanionChatBox
          ref={companionChatRef}
          companionName={currentCharacter?.name || 'Finn'}
          companionEmoji={currentCharacter?.emoji || '🤖'}
          message={companionMessage}
          position="bottom-right"
          autoHide={true}
          autoHideDelay={8000}
        /> */}
        <FloatingLearningDock
          companionName={currentCharacter?.name || selectedCharacter || 'Finn'}
          companionId={currentCharacter?.id || selectedCharacter?.toLowerCase() || 'finn'}
          userId={student?.id || 'default'}
          currentQuestion={phase === 'practice' ? content?.practice[currentPractice]?.question : 
                         phase === 'assessment' ? content?.assessment?.question : undefined}
          currentSkill={skill.skill_name}
          questionNumber={phase === 'practice' ? currentPractice + 1 : 
                        phase === 'assessment' ? 1 : undefined}
          totalQuestions={phase === 'practice' ? content?.practice?.length || 0 : 
                        phase === 'assessment' ? 1 : 0}
          companionFeedback={companionMessage}
          onRequestHint={handleHintRequest}
          theme={theme}
        />
        
        {/* Display hint overlay if active */}
        {currentHint && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
            color: 'white',
            padding: '15px 25px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
            maxWidth: '500px',
            zIndex: 1000,
            animation: 'slideUp 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>💡</span>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{currentHint}</p>
            </div>
          </div>
        )}
      </>
    );
  };

  // ================================================================
  // RENDER PHASES  
  // ================================================================

  // Special case: If we're in loading phase but already have practice content,
  // we're generating instruction - show different message
  if (phase === 'loading' && content && content.practice.length > 0) {
    return (
      <div className="ai-learn-container min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4"
           data-theme={theme}>
        <div className="max-w-2xl w-full">
          <EnhancedLoadingScreen 
            phase="instruction"
            skillName={skill.skill_name}
            studentName={student.display_name}
            theme={theme}
            customMessage="Preparing your personalized lesson based on your practice results..."
          />
        </div>
      </div>
    );
  }

  if (phase === 'loading' || !content) {
    if (loadingError) {
      return (
        <div className="ai-learn-container min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4"
             data-theme={theme}>
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Content Generation Issue
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                {loadingError}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                Using fallback content to continue your learning journey...
              </p>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-500">
                <p>📚 Skill: {skill.skill_name}</p>
                <p>🎯 Subject: {skill.subject}</p>
                <p>👤 Grade: {student.grade_level}</p>
              </div>
            </div>
          </div>
        );
      } else {
      // Use enhanced loading screen
      return (
        <EnhancedLoadingScreen 
          phase="practice"
          skillName={skill.skill_name}
          studentName={student.display_name}
          theme={theme}
        />
      );
    }
  }

  // ================================================================
  // INSTRUCTION PHASE
  // ================================================================

  if (phase === 'instruction') {
    return renderWithDock(
      <div className="ai-learn-container min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4"
           data-theme={theme}>
        {onBack && (
          <ContainerNavigationHeader 
            onBack={handleNavBack} 
            title="Learn Foundations" 
            theme={theme}
          />
        )}
        <div className="max-w-4xl mx-auto" style={{ paddingTop: onBack ? '5rem' : '0' }}>
          <header className="text-center mb-8">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">📚 Lesson Time!</h1>
              </div>
              <button
                onClick={() => {
                  if (isAudioEnabled) {
                    voiceManagerService.stopSpeaking();
                  }
                  setIsAudioEnabled(!isAudioEnabled);
                  // Reset read status when toggling audio back on
                  if (!isAudioEnabled) {
                    setHasReadExample({});
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all"
                title={isAudioEnabled ? "Turn off companion voice" : "Turn on companion voice"}
              >
                {isAudioEnabled ? (
                  <>
                    <span className="text-2xl">🔊</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Audio On</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">🔇</span>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Audio Off</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">Based on your practice, let's learn more about {skill.skill_name}</p>
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl p-6 shadow-lg">
              <p className="text-lg">{content.greeting}</p>
            </div>
          </header>

          <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🎯 What We're Learning</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">{content.concept}</p>
          </section>

          <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">📖 Let Me Teach You With Examples</h2>
            <div className="relative min-h-[300px]">
              {content.examples.map((example, index) => (
                <div 
                  key={index} 
                  className={`${index === currentExample ? 'block' : 'hidden'} bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border-2 ${index === currentExample ? 'border-purple-500 dark:border-purple-400' : 'border-gray-200 dark:border-gray-600'} transition-all duration-300`}
                >
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                        📚 Teaching Example {index + 1}
                      </h3>
                      {isAudioEnabled && (
                        <button
                          onClick={() => {
                            const textToRead = `Teaching Example ${index + 1}. ${example.question}. 
                              The solution is: ${example.answer}. 
                              Let me explain: ${example.explanation}`;
                            readTextAloud(textToRead);
                          }}
                          className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-all"
                          title="Read this example aloud"
                        >
                          <span className="text-sm">🔊</span>
                          <span className="text-sm font-medium">Read Aloud</span>
                        </button>
                      )}
                    </div>
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 mb-4">
                      <p className="text-gray-800 dark:text-gray-200 text-lg font-medium">{example.question}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                    <strong className="text-green-800 dark:text-green-400 block mb-2">✨ Solution:</strong>
                    <div className="text-gray-800 dark:text-gray-200">
                      {example.visual && example.visual.includes('🍎') || example.visual?.includes('🍪') || example.visual?.includes('⚽') ? (
                        <VisualRenderer visual={example.visual} theme={theme} />
                      ) : (
                        <span>{example.answer}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                    <strong className="text-blue-800 dark:text-blue-400 block mb-2">🎯 Step-by-Step Explanation:</strong>
                    <span className="text-gray-800 dark:text-gray-200">{example.explanation}</span>
                  </div>
                  
                  {example.visual && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
                      <strong className="text-yellow-800 dark:text-yellow-400 block mb-2">👁️ Visualize It:</strong>
                      <div className="text-gray-800 dark:text-gray-200">
                        <VisualRenderer visual={example.visual} theme={theme} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => {
                  const newExample = Math.max(0, currentExample - 1);
                  setCurrentExample(newExample);
                  // Reset read status for new example to trigger audio
                  setHasReadExample(prev => ({ ...prev, [newExample]: false }));
                }}
                disabled={currentExample === 0}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentExample === 0 
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
                    : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800'
                }`}
              >
                ← Previous
              </button>
              
              <div className="flex gap-2">
                {content.examples.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentExample(index);
                      // Reset read status for new example to trigger audio
                      setHasReadExample(prev => ({ ...prev, [index]: false }));
                    }}
                    className={`w-12 h-12 rounded-full font-bold transition-all duration-200 ${
                      index === currentExample 
                        ? 'bg-purple-600 text-white shadow-lg' 
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => {
                  const newExample = Math.min(content.examples.length - 1, currentExample + 1);
                  setCurrentExample(newExample);
                  // Reset read status for new example to trigger audio
                  setHasReadExample(prev => ({ ...prev, [newExample]: false }));
                }}
                disabled={currentExample === content.examples.length - 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentExample === content.examples.length - 1
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
                    : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800'
                }`}
              >
                Next →
              </button>
            </div>
          </section>

          <div className="text-center mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {currentExample === content.examples.length - 1 
                ? "✨ You've reviewed all the teaching examples! Ready to test your understanding?" 
                : `📚 Teaching Example ${currentExample + 1} of ${content.examples.length} - Take your time to understand each step`}
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={handleInstructionComplete}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              I Understand! Continue to Assessment 🎯
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // PRACTICE PHASE
  // ================================================================

  if (phase === 'practice') {
    // Safety check for content
    if (!content || !content.practice || content.practice.length === 0) {
      console.error('⚠️ No practice questions available:', { content, phase });
      return (
        <div className="ai-learn-container min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4"
             data-theme={theme}>
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No Practice Questions Available
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              We couldn't load practice questions for this skill.
            </p>
            <button
              onClick={() => {
                console.log('Retrying content generation...');
                generateContent();
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    
    const question = content.practice[currentPractice];
    const userAnswer = practiceAnswers[currentPractice];
    const showFeedback = showPracticeFeedback[currentPractice];
    
    // Safety check for individual question
    if (!question) {
      console.error('⚠️ Question not found at index:', currentPractice, { 
        totalQuestions: content.practice.length,
        practice: content.practice 
      });
      return (
        <div className="ai-learn-container min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4"
             data-theme={theme}>
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Question Loading Error
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Unable to load question {currentPractice + 1}
            </p>
            <button
              onClick={() => setCurrentPractice(0)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg"
            >
              Start Over
            </button>
          </div>
        </div>
      );
    }
    
    return renderWithDock(
      <div className="ai-learn-container min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4"
           data-theme={theme}>
        {onBack && (
          <ContainerNavigationHeader 
            onBack={handleNavBack} 
            title="Practice Time" 
            theme={theme}
          />
        )}
        <div className="practice-phase" style={{ paddingTop: onBack ? '5rem' : '0' }}>
          <header className="phase-header">
            <h1 style={{ color: theme === 'dark' ? '#e2e8f0' : '#1a202c' }}>🔍 Diagnostic Practice</h1>
            <p style={{ color: theme === 'dark' ? '#cbd5e1' : '#4a5568' }}>Let's see what you already know about {skill.skill_name}!</p>
            <div className="progress-indicator">
              Question {currentPractice + 1} of {content.practice.length}
              {isPracticeSupportActive && (
                <span style={{ 
                  marginLeft: '1rem', 
                  fontSize: '0.9em', 
                  color: '#10b981',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <span style={{ animation: 'pulse 2s infinite' }}>🤖</span>
                  AI Support Active
                </span>
              )}
            </div>
            
            {/* Audio Controls */}
            <div style={{
              marginTop: '1rem',
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              alignItems: 'center'
            }}>
              <button
                onClick={handleReplayQuestion}
                disabled={isSpeaking}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '2rem',
                  border: 'none',
                  background: isSpeaking ? '#e2e8f0' : 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: isSpeaking ? '#718096' : 'white',
                  cursor: isSpeaking ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                {isSpeaking ? (
                  <>
                    <span style={{ animation: 'pulse 1.5s infinite' }}>🔊</span>
                    Speaking...
                  </>
                ) : (
                  <>
                    <span>🔊</span>
                    Read Question
                  </>
                )}
              </button>
              
              {currentCharacter && (
                <div style={{
                  fontSize: '12px',
                  color: '#718096',
                  fontStyle: 'italic'
                }}>
                  {currentCharacter.name} will read the question for you
                </div>
              )}
            </div>
          </header>

          <div className="practice-question">
            <h2>{question.question}</h2>
            
            {/* Display visual content if available (for counting, patterns, etc.) */}
            {question.visual && (
              <VisualRenderer 
                visual={question.visual} 
                theme={theme}
                size="large"
              />
            )}
            
            {(question.type === 'multiple_choice' || question.type === 'interactive') && (
              <>
                <div className="multiple-choice">
                  {question.options?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => !showFeedback && setPracticeAnswers(prev => ({ ...prev, [currentPractice]: index }))}
                      className={`choice-button ${
                        userAnswer === index ? 'selected' : ''
                      } ${
                        showFeedback && index === question.correct_answer ? 'correct' : ''
                      } ${
                        showFeedback && userAnswer === index && index !== question.correct_answer ? 'incorrect' : ''
                      }`}
                      disabled={showFeedback}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {/* Submit button for multiple choice */}
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <button
                    onClick={() => {
                      const currentAnswer = practiceAnswers[currentPractice];
                      if (showFeedback) {
                        // Next question functionality - reset feedback state  
                        setShowPracticeFeedback(prev => ({ ...prev, [currentPractice]: false }));
                        if (currentPractice < content.practice.length - 1) {
                          setCurrentPractice(currentPractice + 1);
                        } else {
                          // After practice (diagnostic), move to instruction/lesson
                          handlePracticeComplete();
                        }
                      } else if (currentAnswer !== undefined) {
                        // Submit answer functionality
                        handlePracticeAnswer(currentPractice, currentAnswer);
                      }
                    }}
                    disabled={!showFeedback && userAnswer === undefined}
                    style={{
                      padding: '1.5rem 2rem',
                      fontSize: '1.5rem',
                      background: !showFeedback && userAnswer === undefined 
                        ? '#9ca3af'
                        : showFeedback 
                          ? 'linear-gradient(135deg, #10b981, #059669)'
                          : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.75rem',
                      cursor: !showFeedback && userAnswer === undefined ? 'not-allowed' : 'pointer',
                      fontWeight: '700',
                      boxShadow: showFeedback 
                        ? '0 4px 12px rgba(16, 185, 129, 0.25)'
                        : '0 4px 12px rgba(79, 70, 229, 0.25)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (userAnswer !== undefined) {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {showFeedback ? 'Next Question →' : 'Submit'}
                  </button>
                </div>
              </>
            )}

            {question.type === 'true_false' && (
              <>
                <div className="true-false">
                  <button
                    onClick={() => !showFeedback && setPracticeAnswers(prev => ({ ...prev, [currentPractice]: 'true' }))}
                    className={`tf-button ${String(userAnswer).toLowerCase() === 'true' ? 'selected' : ''} ${
                      showFeedback && String(question.correct_answer).toLowerCase() === 'true' ? 'correct' : ''
                    } ${
                      showFeedback && String(userAnswer).toLowerCase() === 'true' && String(question.correct_answer).toLowerCase() !== 'true' ? 'incorrect' : ''
                    }`}
                    disabled={showFeedback}
                    style={{
                      margin: '0.5rem',
                      padding: '1rem 2rem',
                      fontSize: '1.2rem',
                      border: '2px solid #10b981',
                      borderRadius: '0.5rem',
                      background: String(userAnswer).toLowerCase() === 'true' 
                        ? (showFeedback 
                          ? (String(question.correct_answer).toLowerCase() === 'true' ? '#10b981' : '#ef4444')
                          : '#10b981')
                        : 'transparent',
                      color: String(userAnswer).toLowerCase() === 'true' ? 'white' : (theme === 'dark' ? '#f3f4f6' : '#111827'),
                      cursor: showFeedback ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    True
                  </button>
                  <button
                    onClick={() => !showFeedback && setPracticeAnswers(prev => ({ ...prev, [currentPractice]: 'false' }))}
                    className={`tf-button ${String(userAnswer).toLowerCase() === 'false' ? 'selected' : ''} ${
                      showFeedback && String(question.correct_answer).toLowerCase() === 'false' ? 'correct' : ''
                    } ${
                      showFeedback && String(userAnswer).toLowerCase() === 'false' && String(question.correct_answer).toLowerCase() !== 'false' ? 'incorrect' : ''
                    }`}
                    disabled={showFeedback}
                    style={{
                      margin: '0.5rem',
                      padding: '1rem 2rem',
                      fontSize: '1.2rem',
                      border: '2px solid #ef4444',
                      borderRadius: '0.5rem',
                      background: String(userAnswer).toLowerCase() === 'false' 
                        ? (showFeedback 
                          ? (String(question.correct_answer).toLowerCase() === 'false' ? '#10b981' : '#ef4444')
                          : '#ef4444')
                        : 'transparent',
                      color: String(userAnswer).toLowerCase() === 'false' ? 'white' : (theme === 'dark' ? '#f3f4f6' : '#111827'),
                      cursor: showFeedback ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    False
                  </button>
                </div>
                {/* Submit button for true/false */}
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <button
                    onClick={() => {
                      const currentAnswer = practiceAnswers[currentPractice];
                      if (showFeedback) {
                        // Next question functionality - reset feedback state  
                        setShowPracticeFeedback(prev => ({ ...prev, [currentPractice]: false }));
                        if (currentPractice < content.practice.length - 1) {
                          setCurrentPractice(currentPractice + 1);
                        } else {
                          // After practice (diagnostic), move to instruction/lesson
                          handlePracticeComplete();
                        }
                      } else if (currentAnswer !== undefined) {
                        // Submit answer functionality
                        handlePracticeAnswer(currentPractice, currentAnswer);
                      }
                    }}
                    disabled={!showFeedback && (userAnswer === undefined || userAnswer === '')}
                    style={{
                      padding: '1.5rem 2rem',
                      fontSize: '1.5rem',
                      background: !showFeedback && (userAnswer === undefined || userAnswer === '') 
                        ? '#9ca3af'
                        : showFeedback 
                          ? 'linear-gradient(135deg, #10b981, #059669)'
                          : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.75rem',
                      cursor: !showFeedback && (userAnswer === undefined || userAnswer === '') ? 'not-allowed' : 'pointer',
                      fontWeight: '700',
                      boxShadow: showFeedback 
                        ? '0 4px 12px rgba(16, 185, 129, 0.25)'
                        : '0 4px 12px rgba(79, 70, 229, 0.25)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!(userAnswer === undefined || userAnswer === '')) {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {showFeedback ? 'Next Question →' : 'Submit'}
                  </button>
                </div>
              </>
            )}

            {(question.type === 'counting' || question.type === 'number' || question.type === 'numeric') && (
              <div className="counting-answer" style={{ margin: '2rem 0', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                  <input
                    type="number"
                    value={userAnswer !== undefined ? userAnswer : ''}
                    placeholder="Enter your answer..."
                    onChange={(e) => {
                      if (!showFeedback) {
                        setPracticeAnswers(prev => ({ ...prev, [currentPractice]: e.target.value }));
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !showFeedback) {
                        handlePracticeAnswer(currentPractice, (e.currentTarget as HTMLInputElement).value);
                      }
                    }}
                    disabled={showFeedback}
                    className="counting-input"
                    style={{
                      width: '200px',
                      padding: '1.5rem',
                      fontSize: '2rem',
                      border: '3px solid #10b981',
                      borderRadius: '0.75rem',
                      textAlign: 'center',
                      backgroundColor: theme === 'dark' ? '#374151' : 'white',
                      color: theme === 'dark' ? '#f3f4f6' : '#111827',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
                      fontWeight: '700'
                    }}
                  />
                  <button
                    onClick={() => {
                      const currentAnswer = practiceAnswers[currentPractice];
                      if (showFeedback) {
                        // Next question functionality - reset feedback state  
                        setShowPracticeFeedback(prev => ({ ...prev, [currentPractice]: false }));
                        if (currentPractice < content.practice.length - 1) {
                          setCurrentPractice(currentPractice + 1);
                        } else {
                          // After practice (diagnostic), move to instruction/lesson
                          handlePracticeComplete();
                        }
                      } else if (currentAnswer !== undefined) {
                        // Submit answer functionality
                        handlePracticeAnswer(currentPractice, currentAnswer);
                      }
                    }}
                    disabled={!showFeedback && (userAnswer === undefined || userAnswer === '')}
                    style={{
                      padding: '1.5rem 2rem',
                      fontSize: '1.5rem',
                      background: !showFeedback && (userAnswer === undefined || userAnswer === '') 
                        ? '#9ca3af'
                        : showFeedback 
                          ? 'linear-gradient(135deg, #10b981, #059669)'
                          : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.75rem',
                      cursor: !showFeedback && (userAnswer === undefined || userAnswer === '') ? 'not-allowed' : 'pointer',
                      fontWeight: '700',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                      transition: 'all 0.3s ease',
                      transform: showFeedback || userAnswer === undefined || userAnswer === '' ? 'scale(1)' : 'scale(1)',
                    }}
                    onMouseEnter={(e) => {
                      if (!showFeedback && userAnswer !== undefined && userAnswer !== '') {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {showFeedback ? 'Next Question →' : 'Submit'}
                  </button>
                </div>
                <div style={{ marginTop: '1rem', fontSize: '1rem', color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  💡 Count carefully! Press Enter or click Submit
                </div>
              </div>
            )}

            {(question.type === 'fill_blank' || question.type === 'fill_in_the_blank' || question.type === 'fill_in_blank') && (
              <div className="fill-blank" style={{ margin: '2rem 0', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                  <input
                    type="text"
                    value={userAnswer !== undefined ? userAnswer : ''}
                    placeholder="Type your answer..."
                    aria-label="Fill in the blank answer input"
                    onChange={(e) => {
                      if (!showFeedback) {
                        setPracticeAnswers(prev => ({ ...prev, [currentPractice]: e.target.value }));
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !showFeedback) {
                        handlePracticeAnswer(currentPractice, (e.currentTarget as HTMLInputElement).value);
                      }
                    }}
                    disabled={showFeedback}
                    className="fill-blank-input"
                    style={{
                      width: '300px',
                      padding: '1.5rem',
                      fontSize: '1.5rem',
                      border: '3px solid #4f46e5',
                      borderRadius: '0.75rem',
                      textAlign: 'center',
                      backgroundColor: theme === 'dark' ? '#374151' : 'white',
                      color: theme === 'dark' ? '#f3f4f6' : '#111827',
                      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.15)',
                      fontWeight: '600'
                    }}
                  />
                  <button
                    onClick={() => {
                      const currentAnswer = practiceAnswers[currentPractice];
                      if (showFeedback) {
                        // Next question functionality - reset feedback state  
                        setShowPracticeFeedback(prev => ({ ...prev, [currentPractice]: false }));
                        if (currentPractice < content.practice.length - 1) {
                          setCurrentPractice(currentPractice + 1);
                        } else {
                          // After practice (diagnostic), move to instruction/lesson
                          handlePracticeComplete();
                        }
                      } else if (currentAnswer !== undefined) {
                        // Submit answer functionality
                        handlePracticeAnswer(currentPractice, currentAnswer);
                      }
                    }}
                    disabled={!showFeedback && (userAnswer === undefined || userAnswer === '')}
                    style={{
                      padding: '1.5rem 2rem',
                      fontSize: '1.5rem',
                      background: !showFeedback && (userAnswer === undefined || userAnswer === '') 
                        ? '#9ca3af'
                        : showFeedback 
                          ? 'linear-gradient(135deg, #10b981, #059669)'
                          : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.75rem',
                      cursor: !showFeedback && (userAnswer === undefined || userAnswer === '') ? 'not-allowed' : 'pointer',
                      fontWeight: '700',
                      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                      transition: 'all 0.3s ease',
                      transform: showFeedback || userAnswer === undefined || userAnswer === '' ? 'scale(1)' : 'scale(1)',
                    }}
                    onMouseEnter={(e) => {
                      if (!showFeedback && userAnswer !== undefined && userAnswer !== '') {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {showFeedback ? 'Next Question →' : 'Submit'}
                  </button>
                </div>
                <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                  💡 Hint: {question.hint || 'Think about the pattern!'} | Press Enter or click Submit
                </div>
              </div>
            )}
            
            {/* Fallback for unrecognized question types */}
            {!['multiple_choice', 'interactive', 'true_false', 'counting', 'number', 'numeric', 'fill_blank', 'fill_in_the_blank', 'fill_in_blank'].includes(question.type) && (
              <div className="fallback-answer" style={{ margin: '2rem 0', textAlign: 'center' }}>
                <div style={{ 
                  marginBottom: '1rem', 
                  padding: '1rem', 
                  backgroundColor: theme === 'dark' ? '#4b5563' : '#fef3c7',
                  borderRadius: '0.5rem',
                  color: theme === 'dark' ? '#fbbf24' : '#92400e'
                }}>
                  ⚠️ Question type "{question.type}" needs UI component mapping
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                  <input
                    type="text"
                    value={userAnswer !== undefined ? userAnswer : ''}
                    placeholder="Enter your answer..."
                    aria-label="Question answer input"
                    onChange={(e) => {
                      if (!showFeedback) {
                        setPracticeAnswers(prev => ({ ...prev, [currentPractice]: e.target.value }));
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !showFeedback) {
                        handlePracticeAnswer(currentPractice, (e.currentTarget as HTMLInputElement).value);
                      }
                    }}
                    disabled={showFeedback}
                    className="fallback-input"
                    style={{
                      width: '300px',
                      padding: '1rem 1.5rem',
                      fontSize: '1.5rem',
                      border: '3px solid #fbbf24',
                      borderRadius: '0.75rem',
                      textAlign: 'center',
                      backgroundColor: theme === 'dark' ? '#374151' : 'white',
                      color: theme === 'dark' ? '#f3f4f6' : '#111827',
                      fontWeight: '600'
                    }}
                  />
                  <button
                    onClick={() => {
                      const currentAnswer = practiceAnswers[currentPractice];
                      if (showFeedback) {
                        // Next question functionality - reset feedback state  
                        setShowPracticeFeedback(prev => ({ ...prev, [currentPractice]: false }));
                        if (currentPractice < content.practice.length - 1) {
                          setCurrentPractice(currentPractice + 1);
                        } else {
                          // After practice (diagnostic), move to instruction/lesson
                          handlePracticeComplete();
                        }
                      } else if (currentAnswer !== undefined) {
                        // Submit answer functionality
                        handlePracticeAnswer(currentPractice, currentAnswer);
                      }
                    }}
                    disabled={!showFeedback && (userAnswer === undefined || userAnswer === '')}
                    style={{
                      padding: '1rem 1.5rem',
                      fontSize: '1.5rem',
                      background: !showFeedback && (userAnswer === undefined || userAnswer === '') 
                        ? '#9ca3af'
                        : showFeedback 
                          ? 'linear-gradient(135deg, #10b981, #059669)'
                          : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.75rem',
                      cursor: !showFeedback && (userAnswer === undefined || userAnswer === '') ? 'not-allowed' : 'pointer',
                      fontWeight: '700',
                      boxShadow: '0 4px 12px rgba(251, 191, 36, 0.25)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {showFeedback ? 'Next Question →' : 'Submit'}
                  </button>
                </div>
              </div>
            )}

            {/* Debug section removed - was causing the oversized light box */}

            {showFeedback && (
              <div className={`feedback ${
                question.type === 'true_false' 
                  ? (String(userAnswer).toLowerCase() === String(question.correct_answer).toLowerCase() ? 'correct' : 'incorrect')
                  : (String(userAnswer) === String(question.correct_answer) ? 'correct' : 'incorrect')
              }`}>
                <div className="feedback-result">
                  {question.type === 'true_false' 
                    ? (String(userAnswer).toLowerCase() === String(question.correct_answer).toLowerCase() ? '✅ Correct!' : '❌ Not quite right')
                    : (String(userAnswer) === String(question.correct_answer) ? '✅ Correct!' : '❌ Not quite right')
                  }
                </div>
                <div className="feedback-explanation">
                  {question.explanation}
                </div>
                {((question.type === 'true_false' && String(userAnswer).toLowerCase() !== String(question.correct_answer).toLowerCase()) ||
                  (question.type !== 'true_false' && String(userAnswer) !== String(question.correct_answer))) && (
                  <div className="feedback-hint">
                    💡 Hint: {question.hint}
                  </div>
                )}
              </div>
            )}
            
            {/* Companion Motivation Chat Bubble */}
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // ASSESSMENT PHASE
  // ================================================================

  if (phase === 'assessment') {
    return renderWithDock(
      <div className="ai-learn-container min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4"
           data-theme={theme}>
        {onBack && (
          <ContainerNavigationHeader 
            onBack={handleNavBack} 
            title="Final Assessment" 
            theme={theme}
          />
        )}
        <div className="assessment-phase" style={{ paddingTop: onBack ? '5rem' : '0' }}>
          <header className="phase-header">
            <h1>🏆 Final Assessment</h1>
            <p>Show what you've learned, {student.display_name}!</p>
          </header>

          <div className="assessment-question">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>{content.assessment.question}</h2>
              <button
                onClick={() => readTextAloud(content.assessment.question)}
                className="audio-button"
                style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.3s ease',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                }}
                title="Read question aloud"
                aria-label="Read question aloud"
              >
                🔊
              </button>
            </div>
            
            {/* Display visual if present in assessment */}
            {content.assessment.visual && (
              <VisualRenderer 
                visual={content.assessment.visual} 
                theme={theme}
                size="large"
              />
            )}
            
            <div className="assessment-choices">
              {content.assessment.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !showAssessmentResult && setAssessmentAnswer(index)}
                  className={`assessment-choice ${
                    assessmentAnswer === index ? 'selected' : ''
                  } ${
                    showAssessmentResult && index === content.assessment.correct_answer ? 'correct' : ''
                  } ${
                    showAssessmentResult && assessmentAnswer === index && index !== content.assessment.correct_answer ? 'incorrect' : ''
                  }`}
                  disabled={showAssessmentResult}
                >
                  {option}
                </button>
              ))}
            </div>

            {assessmentAnswer !== null && !showAssessmentResult && (
              <div className="assessment-actions">
                <button
                  onClick={handleAssessmentSubmit}
                  className="submit-button"
                >
                  Submit Answer
                </button>
              </div>
            )}

            {showAssessmentResult && (
              <div className={`assessment-result ${
                assessmentIsCorrect ? 'success' : 'retry'
              }`}>
                <div className="result-message">
                  {assessmentIsCorrect 
                    ? content.assessment.success_message 
                    : "Good try! Let's review this concept."}
                </div>
                <div className="result-explanation">
                  {content.assessment.explanation}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // COMPLETION PHASE
  // ================================================================

  if (phase === 'complete') {
    return (
      <div className="ai-learn-container min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4"
           data-theme={theme}>
        {onBack && (
          <ContainerNavigationHeader 
            onBack={handleNavBack} 
            title="Lesson Complete" 
            theme={theme}
          />
        )}
        <div className="completion-phase" style={{ paddingTop: onBack ? '5rem' : '0' }}>
          <header className="completion-header">
            <h1>🎉 Amazing Work!</h1>
            <p>You've mastered {skill.skill_name}, {student.display_name}!</p>
          </header>

          <div className="completion-summary">
            <div className="skill-mastery">
              <h2>✅ You've Learned:</h2>
              <p>{skill.skill_name}</p>
            </div>
            
            <div className="next-steps">
              <h2>🚀 What's Next?</h2>
              <p>Ready to see how professionals use {skill.skill_name} in their careers?</p>
            </div>
          </div>

          <div className="completion-actions">
            <button
              onClick={handleNavNext}
              className="next-container-button"
            >
              Continue to Experience 🎯
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// All styling now uses Tailwind CSS classes with dark mode support

export default AILearnContainer;