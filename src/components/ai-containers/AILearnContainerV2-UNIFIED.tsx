/**
 * AI-FIRST LEARN CONTAINER V2-UNIFIED
 * Combines V2 Rules Engine with V2-JIT Performance
 * Best of both worlds: Intelligence + Speed + Adaptive Journey
 * 
 * Features from V2:
 * - LearnAIRulesEngine for intelligent content
 * - Career context application
 * - Companion intelligence
 * - Gamification rules
 * - Premium content service
 * 
 * Features from V2-JIT:
 * - JIT content generation (<500ms)
 * - Multi-layer caching
 * - Performance tracking
 * - Session persistence
 * - Daily learning context
 * 
 * New Unified Features:
 * - Adaptive journey integration
 * - Skill cluster progression
 * - All 15 question types
 * - Continuous learning model
 */

import React, { useState, useEffect, useRef } from 'react';

// Core Services
import { aiLearningJourneyService, AILearnContent, StudentProfile, LearningSkill } from '../../services/AILearningJourneyService';
import { unifiedLearningAnalyticsService } from '../../services/unifiedLearningAnalyticsService';
import { learningMetricsService } from '../../services/learningMetricsService';
import { companionReactionService } from '../../services/companionReactionService';
import { voiceManagerService } from '../../services/voiceManagerService';
import { companionVoiceoverService } from '../../services/companionVoiceoverService';
import { azureAudioService } from '../../services/azureAudioService';
import { TestAudioButton } from '../audio/TestAudioButton';

// V2 Features - Rules Engine & Intelligence
import { learnAIRulesEngine } from '../../rules-engine/containers/LearnAIRulesEngine';
import { questionTypeValidator } from '../../services/questionTypeValidator';
import { contentCacheService } from '../../services/contentCacheService';
import { premiumDemoContentV2 } from '../../services/PremiumDemoContentServiceV2';
import { iconVisualService } from '../../services/iconVisualService';

// V2-JIT Features - Performance & Caching
import { Question, BaseQuestion } from '../../services/content/QuestionTypes';
import { questionValidator, ValidationResult } from '../../services/content/QuestionValidator';
import QuestionRenderer, { questionRenderer } from '../../services/content/QuestionRenderer';
import { BentoLearnCardV2 } from '../bento/BentoLearnCardV2';
import BentoLearnCardV2Enhanced from '../bento/BentoLearnCardV2Enhanced';
import { CareerContextScreen } from '../career/CareerContextScreen';
import InstructionalVideoComponent from '../containers/InstructionalVideoComponent';
import { contentOrchestratorWithCache } from '../../services/ContentOrchestratorWithCache';
import { NarrativeToBentoAdapter } from '../../services/adapters/NarrativeToBentoAdapter';
import { aiContentConverter } from '../../services/content/AIContentConverter';
import { getDailyLearningContext } from '../../services/content/DailyLearningContextManager';
import { getJustInTimeContentService } from '../../services/content/JustInTimeContentService';
import { preGenerationService } from '../../services/PreGenerationService';
import { getPerformanceTracker } from '../../services/content/PerformanceTracker';
import { getSessionStateManager } from '../../services/content/SessionStateManager';
import { getConsistencyValidator } from '../../services/content/ConsistencyValidator';

// Adaptive Journey Integration
import { continuousJourneyIntegration } from '../../services/ContinuousJourneyIntegration';
import { adaptiveJourneyOrchestrator } from '../../services/AdaptiveJourneyOrchestrator';

// UI Components
import { usePathIQGamification, getXPRewardForAction } from '../../hooks/usePathIQGamification';
import { useModeContext } from '../../contexts/ModeContext';
import { useAICharacter } from '../ai-characters/AICharacterProvider';
import { aiCharacterProvider } from '../../services/aiCharacterProvider';
import { AICharacterAvatar } from '../ai-characters/AICharacterAvatar';
// import { ContainerNavigationHeader } from './ContainerNavigationHeader'; // Removed - causing width issues
// import { FloatingLearningDock } from '../learning-support/FloatingLearningDock'; // Removed - will be reimplemented
import { ProgressHeader } from '../navigation/ProgressHeader';
import { CompanionChatBox } from '../learning-support/CompanionChatBox';
import { VisualRenderer } from './VisualRenderer';
import { EnhancedLoadingScreen } from './EnhancedLoadingScreen';
import { NarrativeIntroductionModal } from '../../screens/modal-first/NarrativeIntroductionModal';
// import { XPDisplay } from '../gamification/XPDisplay'; // Removed - XP now shown in dock
import { useTheme } from '../../hooks/useTheme';
import { SettingsModal } from '../../screens/modal-first/sub-modals/SettingsModal';

// RULES ENGINE INTEGRATION
import { 
  useLearnRules, 
  useCompanionRules, 
  useGamificationRules,
  useMasterOrchestration 
} from '../../rules-engine/integration/ContainerIntegration';

// Import CSS modules for consistent styling
// Import CSS modules and container styles - UNIFIED approach
import '../../styles/containers/BaseContainer.css';
import '../../styles/containers/LearnContainer.css';
import styles from './AILearnContainerV2.module.css';

// Temporary imports until full migration to unified module
import questionStyles from '../../styles/shared/components/QuestionCard.module.css';
import lessonStyles from '../../styles/shared/screens/LessonScreen.module.css';
import practiceStyles from '../../styles/shared/screens/PracticeScreen.module.css';
import assessmentStyles from '../../styles/shared/screens/AssessmentScreen.module.css';
import completionStyles from '../../styles/shared/screens/CompletionScreen.module.css';
import feedbackStyles from '../../styles/shared/components/FeedbackMessages.module.css';
import buttonStyles from '../../styles/shared/components/NavigationButtons.module.css';

// ================================================================
// COMPONENT INTERFACES
// ================================================================

interface AILearnContainerV2Props {
  student: StudentProfile;
  skill: LearningSkill;
  selectedCharacter?: string;
  selectedCareer?: any;
  onComplete: (success: boolean) => void;
  onNext: () => void;
  onBack?: () => void;
  onLoadingChange?: (loading: boolean) => void;
  // CACHED MASTER NARRATIVE - Passed from parent to prevent regeneration
  masterNarrative?: any;
  narrativeLoading?: boolean;
  // Companion ID for audio narration
  companionId?: string;
  // Rubric Session ID for rubric-based content generation
  rubricSessionId?: string;
  // True if rubrics are still initializing (wait before generating content)
  waitingForRubrics?: boolean;
}

type LearningPhase = 'loading' | 'narrative' | 'instruction' | 'practice' | 'assessment' | 'complete';

// ================================================================
// AI LEARN CONTAINER V2-UNIFIED COMPONENT
// ================================================================

export const AILearnContainerV2UNIFIED: React.FC<AILearnContainerV2Props> = ({
  student,
  skill,
  selectedCharacter,
  selectedCareer,
  onComplete,
  onNext,
  onBack,
  rubricSessionId,
  waitingForRubrics = false,
  onLoadingChange,
  masterNarrative,
  narrativeLoading,
  companionId = sessionStorage.getItem('selectedCompanion') || 'pat'
}) => {
  // FEATURE FLAG: Enable Narrative-First Architecture with video instruction
  const USE_NARRATIVE_ENHANCED = localStorage.getItem('pathfinity_use_narrative_enhanced') === 'true' ||
                                 import.meta.env.VITE_USE_NARRATIVE_ENHANCED === 'true';

  // Initialize JIT Services
  const jitService = getJustInTimeContentService();
  const dailyContextManager = getDailyLearningContext();
  const performanceTracker = getPerformanceTracker();
  const sessionStateManager = getSessionStateManager();
  const consistencyValidator = getConsistencyValidator();
  
  // Rules Engine Hooks (from V2)
  const learnRules = useLearnRules();
  const companionRules = useCompanionRules();
  const gamificationRules = useGamificationRules();
  const masterOrchestration = useMasterOrchestration();
  
  // State Management
  const [phase, setPhase] = useState<LearningPhase>('loading');
  const [content, setContent] = useState<AILearnContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, any>>({});
  const [practiceResults, setPracticeResults] = useState<Record<number, boolean>>({});
  const [convertedPracticeQuestions, setConvertedPracticeQuestions] = useState<Question[]>([]);
  const [convertedAssessment, setConvertedAssessment] = useState<Question | null>(null);
  const [assessmentAnswer, setAssessmentAnswer] = useState<any>(undefined);
  const [assessmentAnswerSet, setAssessmentAnswerSet] = useState(false);
  const [showAssessmentResult, setShowAssessmentResult] = useState(false);
  const [assessmentIsCorrect, setAssessmentIsCorrect] = useState(false);

  // Narrative-First Architecture state
  const [narrativeContent, setNarrativeContent] = useState<any>(null);
  const [learnMicroContent, setLearnMicroContent] = useState<any>(null);

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentPracticeQuestion, setCurrentPracticeQuestion] = useState(0); // Track current question
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [dockItems, setDockItems] = useState<any[]>([]);
  const [companionMessage, setCompanionMessage] = useState('');
  const [companionEmotion, setCompanionEmotion] = useState('happy');
  const [hintUsed, setHintUsed] = useState<Record<number, boolean>>({});
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [xpAwarded, setXpAwarded] = useState<Record<string, boolean>>({});
  
  // Context Hooks
  const { currentMode } = useModeContext();
  const { currentCharacter } = useAICharacter();

  // Pause background updates when actively in any learning phase (instruction, practice, or assessment)
  // This prevents the 10-second re-renders that were causing videos to restart
  const pauseBackgroundUpdates = phase === 'instruction' || phase === 'practice' || phase === 'assessment';

  const { features, awardXP, profile } = usePathIQGamification(
    student?.id || 'default',
    student?.grade_level,
    pauseBackgroundUpdates
  );
  const theme = useTheme();
  
  // Refs
  const practiceStartTime = useRef<number>(Date.now());
  const assessmentStartTime = useRef<number>(Date.now());
  const interactionCount = useRef<number>(0);

  // Track which subjects have been introduced via NarrativeIntroductionModal
  const [completedSubjectIntros, setCompletedSubjectIntros] = useState<Set<string>>(new Set());

  // Reset completedSubjectIntros when subject changes so each subject shows full intro
  useEffect(() => {
    setCompletedSubjectIntros(new Set());
    console.log(`🔄 Subject changed to ${skill?.subject}, resetting completed intros`);
  }, [skill?.subject]);

  // Character and Career
  // Fix: Convert selectedCharacter (name) to id for proper lookup
  // Handle both string names and undefined values
  const characterId = selectedCharacter ?
    (typeof selectedCharacter === 'string' ? selectedCharacter.toLowerCase() : selectedCharacter.id) :
    (currentCharacter?.id || 'finn');
  const character = aiCharacterProvider.getCharacterById(characterId) || currentCharacter;
  const career = selectedCareer?.name || 'Explorer';

  // ================================================================
  // AUDIO NARRATION INTEGRATION
  // ================================================================

  // Initialize companion audio service
  useEffect(() => {
    // Removed redundant companionAudioService preloading - we use azureAudioService now
    // companionAudioService is no longer needed since we switched to azureAudioService

    return () => {
      // Clean up audio on unmount
      azureAudioService.stop();
    };
  }, [companionId, student.grade_level]);

  // Play audio based on phase changes
  useEffect(() => {
    if (!masterNarrative || narrativeLoading) return;

    const playPhaseAudio = async () => {
      // Use Azure audio service for better quality TTS
      switch (phase) {
        case 'instruction':
          // Skip playing audio for instruction phase - the video component handles its own intro
          console.log('🎵 AUDIO: Skipping introduction audio for instruction phase - video component active');
          return; // Exit early, don't play any audio

        case 'practice':
          console.log('🎵 Playing mission audio for practice phase with Azure TTS');
          await azureAudioService.playNarrativeSection(masterNarrative, 'mission', companionId);
          break;

        case 'complete':
          // Play celebration audio or use greeting for completion
          console.log('🎵 Playing completion audio with Azure TTS');
          await azureAudioService.playNarrativeSection(masterNarrative, 'greeting', companionId);
          break;
      }
    };

    playPhaseAudio();
  }, [phase, masterNarrative, narrativeLoading]);
  
  
  
  // ================================================================
  // CONTENT GENERATION WITH RULES ENGINE
  // ================================================================
  
  // Use a ref and session storage to track if content has been generated
  // This prevents double-generation in React.StrictMode
  const sessionKey = `learn-content-${student?.id}-${skill?.id}-${characterId}`;
  const contentGeneratedRef = useRef(false);
  const [hasGeneratedContent, setHasGeneratedContent] = useState(() => {
    // Check if content was generated in this session
    return sessionStorage.getItem(sessionKey) === 'true';
  });
  
  // Notify parent of loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);
  
  useEffect(() => {
    // Reset the ref and session storage when dependencies change
    return () => {
      sessionStorage.removeItem(sessionKey);
      contentGeneratedRef.current = false;
      setHasGeneratedContent(false);
    };
  }, [sessionKey]);
  
  useEffect(() => {
    // Only generate content once per session
    if (contentGeneratedRef.current || hasGeneratedContent) {
      return;
    }

    // Initialize session container tracking
    if (student?.id && skill?.id) {
      sessionStateManager.trackContainerProgression(
        student.id,
        `learn-${skill?.id || 'default'}-${Date.now()}`,
        'learn',
        skill?.subject || 'math'
      );
    }
    
    // Initialize PreGeneration cache warming when entering Learn container
    if (student?.id && student?.grade_level) {
      // Debug: Initiating cache warming
      preGenerationService.warmCacheForStudent(student.id, student.grade_level).catch(err => {
        console.error('Cache warming failed:', err);
      });
      
      // Start background processing for queue items
      // Disabled: generation_workers table not available
      // preGenerationService.startBackgroundProcessing();
    }
    
    const generateContent = async () => {

      // Check if this container has already been completed
      const completionKey = `learn-${skill?.id}-${student?.id}`;
      const isCompleted = sessionStateManager.isContainerCompleted(student?.id, completionKey);

      if (isCompleted) {
        console.log('⚠️ Learn container already completed, skipping content generation:', completionKey);
        return;
      }

      // TEMPORARY: Force clear cache to fix career mismatch issue
      getJustInTimeContentService().clearCache();

      setIsLoading(true);
      setError(null);
      setPhase('loading');
      
      const startTime = performance.now();
      
      try {
        // STEP 1: Initialize Daily Context (from V2-JIT)
        const dailyContext = dailyContextManager.getCurrentContext() || 
          await dailyContextManager.createDailyContext({
            studentProfile: student,
            selectedCareer: career,
            selectedCompanion: character?.id || characterId
          });
        
        // STEP 2: Prepare JIT Request with proper context for AI generation
        const jitRequest = {
          userId: student.id,
          container: 'learn-container',
          containerType: 'learn' as const,
          subject: skill.subject || 'Math',
          context: {
            skill: {
              skill_number: skill.skill_number,
              skill_name: skill.skill_name || skill.name,
              name: skill.name
            },
            student: {
              id: student.id,
              name: student.name,
              display_name: student.display_name || student.name,
              grade_level: student.grade_level || 'K',
              interests: student.interests || [career],
              learning_style: student.learning_style || 'visual'
            },
            career: selectedCareer || { name: career },
            careerDescription: `${career} professional`,
            // RUBRIC SESSION ID - Enables rubric-based content generation
            rubricSessionId: rubricSessionId,
            // NARRATIVE CONTEXT for Learn Container
            // Instruction/Video: Uses subject|skill combo (e.g., "Math|Count to 3") - NO narrative
            // Practice/Assessment: Uses narrative context for career-integrated questions
            narrativeContext: masterNarrative ? {
              // Learn-specific setting and narrative (for Practice/Assessment ONLY)
              setting: masterNarrative.settingProgression?.learn?.location,
              context: masterNarrative.settingProgression?.learn?.context,
              narrative: masterNarrative.settingProgression?.learn?.narrative,

              // Overall story elements
              mission: masterNarrative.cohesiveStory?.mission,
              throughLine: masterNarrative.cohesiveStory?.throughLine,

              // Companion personality for consistent interactions
              companion: masterNarrative.companionIntegration,

              // Subject-specific context for Practice/Assessment questions
              subjectContext: masterNarrative.subjectContextsAligned?.[skill.subject || 'Math']
            } : undefined
          },
          timeConstraint: 15 // minutes
        };
        
        // STEP 3: Generate Content via JIT (Fast Performance)
        const jitContent = await jitService.generateContainerContent(jitRequest);

        // STEP 3.5: Use CACHED Master Narrative or generate Micro Content only
        try {
          // Check if Master Narrative was passed from parent
          if (masterNarrative && !narrativeLoading) {
            console.log('✅ Using cached Master Narrative from parent container');
            setNarrativeContent(masterNarrative);

            // Only generate micro content for this specific skill
            console.log('🔨 Generating micro content for current skill only');
            const journeyContent = await contentOrchestratorWithCache.generateLearningJourney({
              studentName: student?.display_name || student?.name || 'Sam',
              studentId: student?.id || 'default',
              gradeLevel: student?.grade_level || 'K',
              career: selectedCareer?.name || career?.name || 'Professional',
              careerId: selectedCareer?.id || career?.id || 'default',
              selectedCharacter: selectedCharacter || 'harmony',
              currentSubject: skill?.subject || 'math',
              currentContainer: 'learn',
              skillId: skill?.id || 'default',
              subjects: [skill?.subject || 'Learning'],
              containers: ['learn'],
              useCache: true,  // Enable caching!
              forceRegenerate: false
            });

            setLearnMicroContent(journeyContent.containers.learn[skill?.subject?.toLowerCase() || 'math']);
          } else {
            // Fallback: Generate everything if no Master Narrative passed
            console.log('⚠️ No Master Narrative from parent, generating new one');
            const journeyContent = await contentOrchestratorWithCache.generateLearningJourney({
              studentName: student?.display_name || student?.name || 'Sam',
              studentId: student?.id || 'default',
              gradeLevel: student?.grade_level || 'K',
              career: selectedCareer?.name || career?.name || 'Professional',
              careerId: selectedCareer?.id || career?.id || 'default',
              selectedCharacter: selectedCharacter || 'harmony',
              currentSubject: skill?.subject || 'math',
              currentContainer: 'learn',
              skillId: skill?.id || 'default',
              subjects: [skill?.subject || 'Learning'],
              containers: ['learn'],
              useCache: true,
              forceRegenerate: false
            });

            setNarrativeContent(journeyContent.narrative);
            setLearnMicroContent(journeyContent.containers.learn[skill?.subject?.toLowerCase() || 'math']);
          }

          console.log('✅ Narrative content ready');
        } catch (narrativeError) {
          console.warn('⚠️ Narrative generation failed, using fallback:', narrativeError);
          // Continue with regular JIT content
        }

        // STEP 4: Transform JIT content to AILearnContent format
        let generatedContent: AILearnContent = {
          instruction: jitContent.instruction || jitContent.instructions || {
            text: jitContent.introContext || '',
            visual: jitContent.visual || null,
            companionMessage: ''
          },
          // CRITICAL FIX: Use proper practice questions - check if JIT returns them separately
          practice: jitContent.practice ||
                   (jitContent.questions && jitContent.assessment ? jitContent.questions :
                    jitContent.questions?.slice(0, -1)) || [], // If questions includes assessment, take all but last
          assessment: jitContent.assessment ||
                     jitContent.questions?.slice(-1)[0] || null,
          summary: jitContent.summary || '',
          hints: jitContent.hints || []
        };
        
        
        // STEP 5: Apply Rules Engine Enhancements (from V2)
        const orchestrationContext = {
          student: {
            id: student.id,
            grade: student.grade_level || 'K',
            age: student.age,
            skillLevel: student.skill_level
          },
          skill: {
            id: skill.id,
            name: skill.name,
            category: skill.category,
            subject: skill.subject
          },
          career: {
            id: career.toLowerCase(),
            name: career
          },
          companion: {
            id: character?.id || characterId.toLowerCase(),
            name: character?.name || characterId
          },
          mode: currentMode?.name || 'diagnostic',
          theme: theme === 'dark' ? 'dark' : 'light'
        };
        
        // Apply master orchestration
        const orchestrationResult = await masterOrchestration.orchestrate(orchestrationContext);
        
        // Apply career context to questions using rules engine
        if (generatedContent.practice) {
          for (let i = 0; i < generatedContent.practice.length; i++) {
            generatedContent.practice[i] = await learnRules.applyCareerContext(
              generatedContent.practice[i],
              career,
              skill.subject,
              student.grade_level
            );
          }
        }
        
        if (generatedContent.assessment) {
          generatedContent.assessment = await learnRules.applyCareerContext(
            generatedContent.assessment,
            career,
            skill.subject,
            student.grade_level
          );
        }
        
        // Validate question structures - TEMPORARILY DISABLED TO TEST QUESTIONRENDERER
        if (generatedContent.practice) {
          // TEMPORARILY SKIP VALIDATION to allow questions through
          const validQuestions = generatedContent.practice; // Keep all questions for now
          /* const validQuestions = generatedContent.practice.filter(q => {
            const isValid = learnRules.validateQuestionStructure(q);
            if (!isValid) {
            }
            return isValid;
          }); */
          generatedContent.practice = validQuestions;
        }
        
        console.log('🌟 CONTENT GENERATED:', {
          hasInstruction: !!generatedContent.instruction,
          practiceQuestionsCount: generatedContent.practice_questions?.length,
          hasAssessment: !!generatedContent.assessment,
          assessmentType: generatedContent.assessment?.type,
          timestamp: new Date().toISOString()
        });

        setContent(generatedContent);
        contentGeneratedRef.current = true; // Mark as generated AFTER content is set
        setHasGeneratedContent(true);
        sessionStorage.setItem(sessionKey, 'true');
        
        // Check if we have career context in the response
        // Debug: Content Set Successfully - ACTUAL STRUCTURE
        // allKeys: Object.keys(generatedContent),
        // title: generatedContent.title,
        // greeting: generatedContent.greeting, 
        // concept: generatedContent.concept,
        // learning_goal: generatedContent.learning_goal,
        // introduction: generatedContent.introduction,
        // career_connection: generatedContent.career_connection,
        // hasCareerContext: !!generatedContent.career_context,
        // careerContext: generatedContent.career_context,
        // career: career,
        // fullGeneratedContent: JSON.stringify(generatedContent, null, 2)
        
        // For testing: Clear session storage if URL has ?clearCareerContext=true
        if (window.location.search.includes('clearCareerContext=true')) {
          const sessionKey = `career_context_learn_${skill.subject}_${career?.name || 'default'}`;
          sessionStorage.removeItem(sessionKey);
          console.log('🎯 Cleared career context session for testing');
        }
        
        // Convert practice questions once when content is set
        if (generatedContent?.practice && generatedContent.practice.length > 0) {
          
          const converted = aiContentConverter.convertPracticeQuestions(
            generatedContent.practice,
            {
              subject: skill.subject,
              grade: student.grade_level || 'K',
              skill_name: skill.name,
              skill_number: skill.id
            }
          );
          setConvertedPracticeQuestions(converted);
        }
        
        // Convert assessment question once when content is set
        if (generatedContent?.assessment) {
          const convertedAssess = aiContentConverter.convertAssessment(
            generatedContent.assessment,
            {
              subject: skill.subject,
              grade: student.grade_level || 'K',
              skill_name: skill.name,
              skill_number: skill.id
            }
          );
          setConvertedAssessment(convertedAssess);
          console.log('🎯 CONVERTED ASSESSMENT SET:', {
            type: convertedAssess?.type,
            hasOptions: !!convertedAssess?.options,
            optionsCount: convertedAssess?.options?.length,
            correctAnswer: convertedAssess?.correctAnswer,
            timestamp: new Date().toISOString()
          });
        }

        console.log('🎉 Content ready - will transition to narrative phase after loading screen');

        // Add a minimum display time for loading screen to allow fun facts to play
        // This ensures users can hear the fun fact narration
        setTimeout(() => {
          console.log('🎉 SETTING INITIAL PHASE TO NARRATIVE');
          setPhase('narrative');
        }, 5000); // Give 5 seconds for fun fact narration
        
        // Get initial companion message
        const companionResponse = await companionRules.getCompanionMessage(
          character?.id || characterId.toLowerCase(),
          career,
          'start_lesson',
          { grade: student.grade_level || 'K', skill: skill.name }
        );
        
        setCompanionMessage(companionResponse.message);
        setCompanionEmotion(companionResponse.emotion);
        
        // STEP 6: Track Performance Metrics (from V2-JIT)
        const endTime = performance.now();
        const generationTime = endTime - startTime;
        
        // Track in performance service - method doesn't exist yet
        // performanceTracker.trackMetric('content_generation', generationTime);
        
        // Update session state - method doesn't exist yet
        // sessionStateManager.updateProgress(student.id, {
        //   currentSkill: skill.id,
        //   currentContainer: 'learn',
        //   questionsCompleted: 0,
        //   totalQuestions: (generatedContent.practice?.length || 0) + 1
        // });
        
        // Log cache stats
        const cacheStats = jitService.getCacheStats();
        
      } catch (err) {
        console.error('Content generation error:', err);
        setError('Failed to generate learning content. Please try again.');

        // Even if there's an error, transition to instruction phase with fallback content
        // This prevents the user from being stuck on a blank loading screen
        setPhase('instruction');

        // Track error - performanceTracker doesn't have trackError method
        // Could track as failed performance data if needed
      } finally {
        // Smart loading timing:
        // 1. Minimum 3 seconds for users to read loading messages
        // 2. Wait for audio narration to complete if playing
        // 3. Complete when both conditions are met

        const minLoadingTime = 3000; // 3 seconds minimum for reading messages
        const startTime = Date.now();

        const checkLoadingComplete = () => {
          const elapsedTime = Date.now() - startTime;
          const minTimeReached = elapsedTime >= minLoadingTime;
          const audioPlaying = azureAudioService.speaking;

          if (minTimeReached && !audioPlaying) {
            // Both conditions met: minimum time passed and audio finished
            console.log('✅ Loading complete:', {
              elapsedTime,
              minTimeReached,
              audioPlaying
            });
            setIsLoading(false);
          } else if (!minTimeReached) {
            // Still need to wait for minimum time
            setTimeout(checkLoadingComplete, Math.min(100, minLoadingTime - elapsedTime));
          } else {
            // Minimum time passed, but audio still playing - check again soon
            setTimeout(checkLoadingComplete, 100);
          }
        };

        // Start checking for completion
        checkLoadingComplete();

        // Mark content as generated to prevent re-generation
        contentGeneratedRef.current = true;
      }
    };
    
    generateContent();
  }, [student?.id, skill?.id, characterId, selectedCareer?.id, sessionKey, hasGeneratedContent]); // Use IDs to prevent re-renders from object changes
  
  // Auto-submit effect for true_false and multiple_choice questions
  useEffect(() => {
    // Only auto-submit if:
    // 1. We have an answer (use flag to handle false values properly)
    // 2. We haven't shown results yet
    // 3. We have content
    // 4. The question type supports auto-submit
    if (assessmentAnswerSet && !showAssessmentResult && content?.assessment) {
      // Convert the assessment to get the question type
      const questionObj = aiContentConverter.convertAssessment(
        content.assessment,
        {
          subject: skill.subject,
          grade: student.grade_level || 'K',
          skill_name: skill.name,
          skill_number: skill.id
        }
      );

      if (questionObj && (questionObj.type === 'multiple_choice' || questionObj.type === 'true_false')) {
        
        // Use a small delay to ensure state is fully updated
        const timer = setTimeout(() => {
          handleAssessmentSubmit();
        }, 50);
        
        return () => clearTimeout(timer);
      }
    }
  }, [assessmentAnswerSet, assessmentAnswer]); // Depend on both flag and answer
  
  // ================================================================
  // UNIFIED ANSWER VALIDATION - RULES ENGINE + JIT VALIDATOR
  // ================================================================
  
  const handlePracticeAnswer = async (questionIndex: number, answer: any) => {
    
    if (!content) return;
    
    // Use ONLY the converted question - no raw data access
    const convertedQuestion = convertedPracticeQuestions[questionIndex];
    
    if (!convertedQuestion) {
      console.error('❌ No converted question found for index:', questionIndex);
      return;
    }
    
    
    setPracticeAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    
    // SINGLE VALIDATION PATH - Use ONLY the QuestionValidator
    let validationResult: ValidationResult;
    
    try {
      // Use the QuestionValidator - it handles ALL 15 question types
      validationResult = questionValidator.validateAnswer(convertedQuestion, answer);
    } catch (validationError) {
      // If validation fails, it's a real problem we need to know about
      console.error('❌ QuestionValidator failed:', {
        error: validationError,
        questionType: convertedQuestion.type,
        question: convertedQuestion,
        answer: answer
      });
      
      // Return a basic result to prevent crashes, but log the issue
      validationResult = {
        isCorrect: false,
        score: 0,
        feedback: 'Validation error occurred. Please report this issue.',
        partialCredit: 0
      };
    }
    
    // Step 3: Apply Rules Engine enhancements (career context, etc.)
    // Note: enhanceValidationResult doesn't exist in the rules engine
    // Using the basic validation result directly
    const enhancedResult = validationResult;
    
    setPracticeResults(prev => ({ 
      ...prev, 
      [questionIndex]: enhancedResult.isCorrect 
    }));
    
    // Track performance (from V2-JIT) - only if skill exists
    if (skill && skill.id) {
      performanceTracker.trackQuestionPerformance(
        student.id,
        skill.id,
        convertedQuestion.id || `practice-${questionIndex}`,
        enhancedResult.isCorrect,
        enhancedResult.score
      );
    } else {
      console.warn('⚠️ Cannot track performance - skill or skill.id is missing');
    }
    
    // Get companion reaction based on result
    const triggerType = validationResult.isCorrect ? 'correct_answer' : 'incorrect_answer';
    const companionResponse = await companionRules.getCompanionMessage(
      character?.id || characterId.toLowerCase(),
      career,
      triggerType,
      { 
        grade: student.grade_level || 'K', 
        attempts: interactionCount.current,
        question: convertedQuestion.question || convertedQuestion.content
      }
    );
    
    setCompanionMessage(companionResponse.message);
    setCompanionEmotion(companionResponse.emotion);
    
    // Award XP if correct and gamification enabled
    if (validationResult.isCorrect && features.showXP && !xpAwarded[`practice_${questionIndex}`]) {
      const xpAmount = await gamificationRules.calculateXP('practice_correct', {
        studentId: student.id,
        level: profile?.level || 1,
        streak: profile?.streakDays || 0,
        firstTry: interactionCount.current === 0
      });
      
      awardXP(xpAmount, 'Practice question answered correctly');
      setXpAwarded(prev => ({ ...prev, [`practice_${questionIndex}`]: true }));
    }
    
    // Check for achievements
    const achievements = await gamificationRules.checkAchievements(
      student.id,
      'practice_answer',
      {
        level: profile?.level || 1,
        correct: validationResult.isCorrect,
        subject: skill.subject
      }
    );
    
    if (achievements.length > 0) {
      // Handle achievement notifications (XP animation will show automatically)
      achievements.forEach(achievement => {
      });
    }
    
    interactionCount.current++;
    
    // Track analytics
    unifiedLearningAnalyticsService.trackLearningEvent({
      eventType: 'practice_answer',
      studentId: student.id,
      sessionId: `learn-${Date.now()}`,
      metadata: {
        skillId: skill.id,
        questionIndex,
        correct: validationResult.isCorrect,
        questionType: convertedQuestion.type,
        rulesApplied: validationResult.rulesApplied
      }
    });
    
    // Don't auto-advance - let user click Next Question button
    // This was causing the button to disappear after 2 seconds
    // if (content && questionIndex < content.practice.length - 1) {
    //   setTimeout(() => {
    //     setCurrentPracticeQuestion(questionIndex + 1);
    //     setQuestionStartTime(Date.now());
    //   }, 2000); // 2 second delay to show feedback
    // }
  };
  
  const handleAssessmentSubmit = async () => {
    console.error('🎲🎲 handleAssessmentSubmit CALLED:', {
      hasContent: !!content,
      assessmentAnswerSet,
      assessmentAnswer,
      caller: new Error().stack?.split('\n')[2], // Track who called this
      timestamp: new Date().toISOString()
    });

    if (!content || !assessmentAnswerSet) {
      console.log('❌ handleAssessmentSubmit ABORTED - missing requirements');
      return;
    }
    
    // Convert to Question object for proper validation
    const questionObj = aiContentConverter.convertAssessment(
      content.assessment,
      {
        subject: skill.subject,
        grade: student.grade_level || 'K',
        skill_name: skill.name,
        skill_number: skill.id
      }
    );
    
    
    // Use QuestionValidator for proper type-specific validation
    const validationResult = questionValidator.validateAnswer(
      questionObj,
      assessmentAnswer
    );
    
    // For backwards compatibility with rules engine format
    const isCorrect = validationResult.isCorrect;
    
    
    const responseTime = Date.now() - questionStartTime;
    setShowAssessmentResult(true);
    setAssessmentIsCorrect(isCorrect);
    
    // Award XP for assessment
    if (features.showXP) {
      const xpAmount = await gamificationRules.calculateXP(
        validationResult.isCorrect ? 'assessment_correct' : 'assessment_attempt',
        {
          studentId: student.id,
          level: profile?.level || 1,
          responseTime
        }
      );
      
      awardXP(xpAmount, 'Assessment completed');
    }
    
    // Get companion reaction
    const companionResponse = await companionRules.getCompanionMessage(
      character?.id || characterId.toLowerCase(),
      career,
      validationResult.isCorrect ? 'assessment_success' : 'assessment_retry',
      { 
        grade: student.grade_level || 'K',
        skill: skill.name
      }
    );
    
    setCompanionMessage(companionResponse.message);
    setCompanionEmotion(companionResponse.emotion);
    
    // Track completion
    const practiceAccuracy = Object.keys(practiceResults).length > 0 ?
      Object.values(practiceResults).filter(r => r).length / Object.keys(practiceResults).length : 0;
    
    // Mark skill as mastered if assessment passed
    if (validationResult.isCorrect && practiceAccuracy >= 0.8) {
      learningMetricsService.markSkillMastered(
        student.id,
        `learn-${Date.now()}`,
        skill.id
      );
    }
    
    // Don't auto-advance - let user click Continue button
    // The Continue button will call handleAssessmentContinue which transitions to complete phase
  };
  
  // ================================================================
  // PHASE NAVIGATION
  // ================================================================
  
  const handleAssessmentContinue = async () => {
    // Transition to complete phase when user clicks Continue after assessment
    setPhase('complete');
    
    // UNIFIED: Update Adaptive Journey (NEW)
    await updateJourneyProgress();
    
    onComplete(assessmentIsCorrect);
  };
  
  const handleStartPractice = () => {
    console.error('🎮🎮 STARTING PRACTICE PHASE');
    setPhase('practice');
    setCurrentPracticeQuestion(0); // Start with first question
    practiceStartTime.current = Date.now();
    setQuestionStartTime(Date.now());
    
    // Initialize practice support
    if (content?.practice) {
      const supportItems = content.practice.map(q => ({
        type: 'hint',
        // Handle nested question structure
        content: `Think about ${String(q.question?.question || q.question || '').substring(0, 30)}...`,
        available: true
      }));
      setDockItems(supportItems);
    }
  };
  
  const handlePhaseTransition = () => {
    // Transition to the next logical phase
    if (phase === 'instruction') {
      handleStartPractice();
    } else if (phase === 'practice') {
      handleStartAssessment();
    } else if (phase === 'assessment') {
      setPhase('complete');
    }
  };

  const handleStartAssessment = () => {
    console.error('🎯🎯 STARTING ASSESSMENT PHASE');
    setPhase('assessment');
    setAssessmentAnswer(undefined);
    setAssessmentAnswerSet(false);
    setShowAssessmentResult(false);
    assessmentStartTime.current = Date.now();
    setQuestionStartTime(Date.now());
  };
  
  const handleComplete = async () => {
    const allPracticeCorrect = Object.values(practiceResults).every(r => r);
    const overallSuccess = allPracticeCorrect && assessmentIsCorrect;
    
    // UNIFIED: Process skill completion in adaptive journey
    await processSkillCompletion(overallSuccess);
    
    onComplete(overallSuccess);
  };
  
  // Testing shortcut - skip directly to Experience container
  const handleSkipToExperience = () => {
    onComplete(true); // Pass true to move to next container
  };
  
  // ================================================================
  // ADAPTIVE JOURNEY INTEGRATION (NEW)
  // ================================================================
  
  const updateJourneyProgress = async () => {
    if (!student?.id || !skill?.id) return;
    
    try {
      // Calculate performance metrics
      const practiceCorrect = Object.values(practiceResults).filter(r => r).length;
      const practiceTotal = Object.values(practiceResults).length;
      const totalCorrect = practiceCorrect + (assessmentIsCorrect ? 1 : 0);
      const totalQuestions = practiceTotal + 1;
      
      // Update session state
      // Track the question performance
      for (let i = 0; i < totalQuestions; i++) {
        const isCorrect = i < totalCorrect;
        sessionStateManager.updateQuestionPerformance(
          student.id,
          skill.id,
          isCorrect,
          30 // average time per question in seconds
        );
      }
      
      // Update skill progress based on performance
      const progressDelta = ((totalCorrect / totalQuestions) * 10); // 10% max progress per session
      sessionStateManager.updateSkillProgress(student.id, skill.id, progressDelta);
      
    } catch (error) {
      console.error('Failed to update journey progress:', error);
    }
  };
  
  const processSkillCompletion = async (success: boolean) => {
    if (!student?.id || !skill?.id) return;
    
    try {
      // Calculate time spent
      const timeSpent = Date.now() - (practiceStartTime.current || Date.now());
      
      // Process completion in journey system
      await continuousJourneyIntegration.processSkillCompletion(
        student.id,
        skill.id,
        skill.subject || 'Math',
        {
          correct: success,
          timeSpent: timeSpent,
          hintsUsed: hintsUsed,
          attempts: 1
        }
      );
      
      
      // Get updated journey stats
      const stats = continuousJourneyIntegration.getJourneyStats(student.id);
      if (stats) {
      }
    } catch (error) {
      console.error('Failed to process skill completion:', error);
    }
  };
  
  // ================================================================
  // RENDERING
  // ================================================================
  
  if (isLoading) {
    return (
      <EnhancedLoadingScreen
        phase="practice"
        skillName={skill?.name || "Learning Skills"}
        studentName={student?.display_name || "Student"}
        customMessage="Preparing your personalized learning journey..."
        containerType="learn"
        currentCareer={selectedCareer?.name || "Exploring"}
        showGamification={true}
        masterNarrative={masterNarrative || narrativeContent}  // Use narrativeContent as fallback
        currentSubject={(skill?.subject?.toLowerCase() || 'math') as 'math' | 'ela' | 'science' | 'socialStudies'}
        companionId={companionId}
        enableNarration={true}
        isFirstLoad={true}  // Always true for initial loading
      />
    );
  }
  
  if (error || !content) {
    return (
      <div className="ai-learn-container error-state">
        <div className="error-message">
          <h2>Oops! Something went wrong</h2>
          <p>{error || 'Unable to load content'}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }
  
  // Construct title with career and skill
  const title = selectedCareer?.name 
    ? `Exploring ${selectedCareer.name} through ${skill?.skill_name || skill?.name || 'Learning'}`
    : skill?.skill_name 
      ? `Learning ${skill.skill_name}`
      : 'Learning Activity';
  
  // Helper functions for question rendering
  const getOptionsForQuestionType = (q: any) => {
    switch(q.type) {
      case 'multiple_choice':
        return q.options?.map((opt: any) => 
          typeof opt === 'string' ? opt : (opt.text || opt.label)
        ) || ['Option A', 'Option B', 'Option C', 'Option D'];
      
      case 'true_false':
        return ['True', 'False'];
      
      case 'counting':
        // Use the options already generated by AIContentConverter
        return q.options || [];
      
      case 'numeric':
        // Generate options around the correct answer
        const correct = q.correctAnswer || 0;
        return [
          String(correct - 2),
          String(correct - 1),
          String(correct),
          String(correct + 1),
          String(correct + 2)
        ].filter(n => parseInt(n) >= 0);
      
      case 'fill_blank':
        return q.options || q.blanks?.map((b: any) => b.correctAnswers[0]) || [];
      
      default:
        return q.options || [];
    }
  };

  const getCorrectAnswerForQuestionType = (q: any) => {
    if (q.type === 'multiple_choice' && typeof q.correct_answer === 'number') {
      return q.options?.[q.correct_answer];
    }
    if (q.type === 'true_false') {
      return typeof q.correct_answer === 'boolean' ? 
        (q.correct_answer ? 'True' : 'False') : q.correct_answer;
    }
    return q.correct_answer;
  };

  // Debug logging for render (disabled to reduce console noise)

  return (
    <div className={`ai-learn-container container-learn phase-${phase}`} data-theme={theme}>
      {/* Test Audio Button for debugging */}
      <TestAudioButton />

      {/* Comprehensive Progress Header - Hidden during narrative phase */}
      {phase !== 'narrative' && phase !== 'loading' && (
        <ProgressHeader
          containerType="LEARN"
          skill={skill?.skill_name}
          subject={skill?.subject}
          progress={
            phase === 'instruction' ? 33 :
            phase === 'practice' ? 66 :
            phase === 'assessment' ? 90 :
            phase === 'complete' ? 100 : 0
          }
          currentPhase={
            phase === 'instruction' ? 'Learning' :
            phase === 'practice' ? 'Practice' :
            phase === 'assessment' ? 'Assessment' :
            'Complete'
          }
          totalPhases={3}
          showBackButton={true}
          onBack={onBack}
          showThemeToggle={false}
          showSkipButton={import.meta.env.DEV}
          onSkip={() => handlePhaseTransition()}
          hideOnLoading={false}
          onSettingsClick={() => setShowSettings(true)}
        />
      )}

      {/* DEV ONLY: Skip to Experience button */}
      {import.meta.env.DEV && (
        <button
          onClick={handleSkipToExperience}
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            padding: '10px 20px',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}
        >
          🚀 Skip to Experience
        </button>
      )}

      {/* Companion Audio Controls - Removed as we use azureAudioService now */}

      {/* XP Display removed - now shown in dock */}

      <div className="container-content">
        {/* Debug instruction phase (disabled to reduce console noise) */}
        
        {/* Loading Phase */}
        {phase === 'loading' && (
          <EnhancedLoadingScreen
            phase="practice"  // Change to 'practice' so fun facts will be selected
            skillName={skill?.skill_name || 'Essential Skills'}
            studentName={student?.display_name || 'Student'}
            containerType="learn"
            currentCareer={career}
            customMessage="Preparing your personalized learning journey..."
            masterNarrative={masterNarrative || narrativeContent}  // Use narrativeContent as fallback
            currentSubject={(skill?.subject?.toLowerCase() || 'math') as 'math' | 'ela' | 'science' | 'socialStudies'}
            companionId={companionId}
            enableNarration={true}
            isFirstLoad={!content}  // Simplified - true when content hasn't loaded yet
          />
        )}

        {/* Narrative Phase - "Begin Your Adventure" Screen */}
        {phase === 'narrative' && (
          <NarrativeIntroductionModal
            studentName={student?.display_name || student?.name || 'Student'}
            gradeLevel={student?.grade_level || 'K'}
            career={selectedCareer?.name || 'Professional'}
            companion={companionId}
            container="LEARN"
            completedContainers={completedSubjectIntros}
            skill={skill}
            theme={theme}
            onContinue={() => {
              console.log('🎉 User clicked "Begin Your Adventure" - transitioning to instruction');

              // Mark this subject as introduced
              if (skill?.subject) {
                setCompletedSubjectIntros(prev => new Set([...prev, skill.subject]));
                console.log(`✅ Marked ${skill.subject} intro as completed`);
              }

              setPhase('instruction');
            }}
          />
        )}

        {/* Instruction Phase - Using InstructionalVideoComponent */}
        {phase === 'instruction' && (
          <InstructionalVideoComponent
            content={learnMicroContent || {
              instructional: {
                introduction: `Hi ${student?.display_name || 'Sam'}! Let's learn ${skill?.skill_name || 'something amazing'}!`,
                videoIntro: {
                  hook: `Discover how ${selectedCareer?.name || 'professionals'} use ${skill?.skill_name}`,
                  careerContext: `This skill is essential for your future career!`
                },
                keyLearningPoints: [
                  `Understanding ${skill?.skill_name}`,
                  'Practicing with real examples',
                  'Applying what you learn'
                ],
                keyExpert: {
                  title: 'Expert Guide',
                  funFact: 'Professionals use this skill every day!'
                }
              },
              metadata: {
                subject: skill?.subject || 'Learning',
                skill: skill?.skill_code || 'SKILL001'
              }
            }}
            narrative={narrativeContent || {
              character: {
                name: student?.display_name || student?.name || 'Sam',
                role: selectedCareer?.name || career?.name || 'Professional',
                greeting: 'Ready to learn something amazing?',
                encouragement: 'You can do this!',
                tone: 'friendly'
              },
              cohesiveStory: {
                mission: `help people as a ${selectedCareer?.name || career?.name || 'Professional'}`
              },
              narrativeId: 'default',
              subjectContextsAligned: {}
            }}
            studentName={student?.display_name || student?.name || 'Sam'}
            gradeLevel={student?.grade_level || 'K'}
            subject={skill?.subject || 'Learning'}
            skill={{
              skillCode: skill?.skill_code || skill?.id || 'SKILL001',
              skillName: skill?.skill_name || skill?.name || 'Essential Skills',
              description: skill?.description || ''
            }}
            onComplete={() => {
              handleStartPractice();
              const sessionKey = `career_context_learn_${skill?.subject}_${career?.name || 'default'}`;
              sessionStorage.setItem(sessionKey, 'shown');
            }}
            onSkipToQuestions={() => {
              handleStartPractice();
            }}
          />
        )}
        
        {/* Practice Phase */}
        {phase === 'practice' && content && (
          console.error('🎲🎲 RENDERING PRACTICE PHASE:', {
            currentPracticeQuestion,
            totalQuestions: content.practice?.length,
            convertedQuestionsReady: convertedPracticeQuestions.length,
            timestamp: new Date().toISOString()
          }),
          <div className={practiceStyles.practicePhase}>
            <div className={questionStyles.questionCard}>
              <div className={questionStyles.progressDots}>
                {content.practice.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`${questionStyles.progressDot} ${
                      idx === currentPracticeQuestion ? questionStyles.active : ''
                    } ${practiceResults[idx] !== undefined ? 
                      (practiceResults[idx] ? questionStyles.completed : questionStyles.incorrect) : ''}`}
                  />
                ))}
              </div>
            
              {(() => {
                const idx = currentPracticeQuestion;

                console.error('📋📋 RENDERING PRACTICE QUESTION:', {
                  index: idx,
                  convertedQuestionsLength: convertedPracticeQuestions.length,
                  hasQuestion: !!convertedPracticeQuestions[idx],
                  timestamp: new Date().toISOString()
                });

                // Use ONLY pre-converted questions from state - no raw data access
                const questionObj = convertedPracticeQuestions[currentPracticeQuestion];
                
                // Safety check for undefined question
                if (!questionObj) {
                  console.error('❌ Practice question is undefined:', {
                    index: currentPracticeQuestion,
                    totalQuestions: convertedPracticeQuestions.length,
                    convertedQuestions: convertedPracticeQuestions
                  });
                  return <div>Error: Question not found</div>;
                }
                
                // Debug: Log question text (disabled)
                // console.log('📝 Question text debug:', {
                //   content: questionObj.content,
                //   question: questionObj.question,
                //   statement: questionObj.statement,
                //   type: questionObj.type,
                //   visual: questionObj.visual
                // });
                
                // Feature flags for UI versions
                const useBentoUI = true;
                const useBentoV2 = true; // New floating dock version
                
                if (useBentoUI && useBentoV2) {
                  // Use the new V2 with FloatingDock and Display Modal
                  console.error('🎴🎴 RENDERING BentoLearnCardV2 for Practice:', {
                    questionType: questionObj.type,
                    questionId: questionObj.id,
                    hasOptions: !!getOptionsForQuestionType(questionObj),
                    timestamp: new Date().toISOString()
                  });

                  return (
                    <BentoLearnCardV2
                      question={{
                        id: questionObj.id || `practice-${idx}`,
                        number: idx + 1,
                        type: questionObj.type,
                        text: questionObj.content || questionObj.question || questionObj.statement || 'Question text missing',
                        image: questionObj.media?.url || questionObj.image || questionObj.visual?.content || questionObj.visual || questionObj.visualElements?.description,
                        options: getOptionsForQuestionType(questionObj),
                        correctAnswer: getCorrectAnswerForQuestionType(questionObj),
                        hint: questionObj.hint || questionObj.hints?.[0] || "Think about the problem carefully",
                        xpReward: 10
                      }}
                      onAnswerSubmit={(answer) => {
                        setPracticeAnswers(prev => ({ ...prev, [idx]: answer }));
                        handlePracticeAnswer(idx, answer);
                      }}
                      onNextQuestion={() => {
                        if (idx < content.practice.length - 1) {
                          setCurrentPracticeQuestion(prev => prev + 1);
                        } else {
                          // Move to assessment phase after practice
                          handleStartAssessment();
                        }
                      }}
                      progress={{
                        current: idx + 1,
                        total: content.practice.length,
                        score: Math.round((Object.values(practiceResults).filter(r => r === true).length / content.practice.length) * 100)
                      }}
                      feedback={practiceResults[idx] !== undefined ? {
                        isCorrect: practiceResults[idx],
                        message: practiceResults[idx] ? 'Correct!' : (() => {
                          // For multiple choice, show the actual answer text, not the index
                          if (questionObj.type === 'multiple_choice' && questionObj.options) {
                            const correctIndex = typeof questionObj.correct_answer === 'number'
                              ? questionObj.correct_answer
                              : parseInt(questionObj.correct_answer);
                            if (!isNaN(correctIndex) && correctIndex >= 0 && correctIndex < questionObj.options.length) {
                              return `The correct answer is: ${questionObj.options[correctIndex]}`;
                            }
                          }
                          // For other types, use the explanation or a generic message
                          return questionObj.explanation || 'Let\'s try again!';
                        })()
                      } : undefined}
                      gradeLevel={student.grade_level}
                      subject={skill?.subject || 'Learning'}
                      skill={skill?.name || 'Practice'}
                      userId={student.id}
                      companionId={selectedCharacter?.toLowerCase() || 'finn'}
                      totalXP={profile?.xp || 0}
                    />
                  );
                }

                return (
                <>
                  <div className={questionStyles.questionContent}>
                    {/* Use QuestionRenderer for proper rendering */}
                    <QuestionRenderer
                      question={questionObj}
                      onAnswer={(answer) => {
                        // Store the answer but don't validate yet
                        setPracticeAnswers(prev => ({ ...prev, [idx]: answer }));
                      }}
                      disabled={practiceResults[idx] !== undefined}
                      showFeedback={practiceResults[idx] !== undefined}
                      theme={theme}
                      gradeLevel={student.grade_level}
                      companionId={companionId}
                    />
                    
                  </div>
                  
                  
                  {/* Submit button for practice questions - show for input-based types even if answer is undefined */}
                  {(practiceAnswers[idx] !== undefined || 
                    ['counting', 'numeric', 'short_answer', 'fill_blank', 'long_answer', 'open_ended', 'code_completion'].includes(questionObj.type)) && 
                   practiceResults[idx] === undefined && (
                    <div className={practiceStyles.practiceSubmit}>
                      <button 
                        className={`${buttonStyles.primary} ${buttonStyles.small}`}
                        onClick={() => handlePracticeAnswer(idx, practiceAnswers[idx] ?? 0)}
                      >
                        Submit Answer
                      </button>
                    </div>
                  )}
                  
                  {practiceResults[idx] !== undefined && (
                    <div className={questionStyles.feedbackContainer}>
                      <div className={`${questionStyles.feedbackMessage} ${practiceResults[idx] ? questionStyles.correct : questionStyles.incorrect}`}>
                        <span className={questionStyles.feedbackIcon}>
                          {practiceResults[idx] ? '✓' : '✗'}
                        </span>
                        <span className={questionStyles.feedbackText}>
                          {practiceResults[idx] ? 'Correct!' : (() => {
                            // Get the original practice question for the correct answer
                            const originalQuestion = content.practice?.[idx];
                            
                            if (questionObj.type === 'true_false') {
                              // For True/False questions, check both sources
                              const correctValue = originalQuestion?.correct_answer || 
                                                 (questionObj as any).correctAnswer;
                              if (correctValue !== undefined) {
                                const displayValue = typeof correctValue === 'boolean' ? 
                                  (correctValue ? 'True' : 'False') : correctValue;
                                return `The correct answer is ${displayValue}`;
                              }
                              return 'The correct answer is True';
                            } else if (questionObj.type === 'multiple_choice') {
                              // For multiple choice, find the correct option
                              const correctOption = (questionObj as any).options?.find((opt: any) => opt.isCorrect);
                              return `The correct answer is ${correctOption?.text || 'not available'}`;
                            } else if (questionObj.type === 'numeric') {
                              // For numeric questions, check both sources
                              const correctAnswer = originalQuestion?.correct_answer || 
                                                  (questionObj as any).correctAnswer;
                              return `The correct answer is ${correctAnswer !== undefined ? correctAnswer : '1'}`;
                            } else if (questionObj.type === 'counting') {
                              // For counting questions, check both sources
                              const correctAnswer = originalQuestion?.correct_answer || 
                                                  (questionObj as any).correctAnswer;
                              return `The correct answer is ${correctAnswer !== undefined ? correctAnswer : '1'}`;
                            } else if (questionObj.type === 'fill_blank') {
                              // For fill in the blank
                              const blanks = (questionObj as any).blanks;
                              if (blanks && blanks.length > 0) {
                                // Each blank has correctAnswers array, get the first one from each
                                const answers = blanks.map((b: any) => {
                                  if (b.correctAnswers && b.correctAnswers.length > 0) {
                                    return b.correctAnswers[0];
                                  }
                                  return '___';
                                }).join(', ');
                                return `The correct answer is: ${answers}`;
                              }
                              return 'The correct answer is not available';
                            } else if (questionObj.type === 'short_answer') {
                              // For short answer questions
                              const acceptable = (questionObj as any).acceptableAnswers;
                              if (acceptable && acceptable.length > 0) {
                                return `The correct answer is: ${acceptable[0]}`;
                              }
                              return 'The correct answer is not available';
                            } else {
                              // Fallback - this should not happen if all types are handled
                              console.warn('Unhandled question type for feedback:', questionObj.type);
                              return 'The correct answer is not available';
                            }
                          })()}
                        </span>
                      </div>
                    </div>
                  )}
                </>
                );
              })()}
            </div>

            {/* Practice navigation removed - buttons are now integrated into question cards to avoid duplication */}
          </div>
        )}
        
        {/* Assessment Phase */}
        {phase === 'assessment' && (
          <div className={assessmentStyles.assessmentPhase}>
            <h2 className={assessmentStyles.assessmentTitle}>Assessment Question</h2>
            
            <div className={assessmentStyles.assessmentQuestion}>
              {(() => {
                // Use pre-converted assessment from state
                const questionObj = convertedAssessment;
                
                if (!questionObj) {
                  console.error('❌ Assessment question is undefined');
                  return <div>Error: Assessment not found</div>;
                }
                
                // console.log('📊 Using Converted Assessment:', {
                //   converted: questionObj,
                //   type: questionObj.type
                // });
                
                // Use BentoLearnCardV2 for consistent styling with practice
                return (
                  <BentoLearnCardV2
                    question={{
                      id: questionObj.id || 'assessment',
                      number: 1,
                      text: questionObj.content || questionObj.question || '',
                      type: questionObj.type,
                      options: questionObj.options || [],
                      correctAnswer: questionObj.correct_answer || questionObj.correctAnswer || '',
                      image: questionObj.media?.url || questionObj.visual || questionObj.visualElements?.description,
                      hint: questionObj.hint,
                      xpReward: 20
                    }}
                    onAnswerSubmit={(answer) => {
                      console.log('📝 USER SUBMITTED ANSWER:', {
                        answer,
                        answerType: typeof answer,
                        currentAssessmentAnswer: assessmentAnswer,
                        currentAssessmentAnswerSet: assessmentAnswerSet,
                        timestamp: new Date().toISOString()
                      });
                      setAssessmentAnswer(answer);
                      setAssessmentAnswerSet(true);
                      handleAssessmentSubmit();
                    }}
                    onNextQuestion={() => {
                      setPhase('complete');
                    }}
                    progress={{
                      current: 1,
                      total: 1,
                      score: 0
                    }}
                    feedback={showAssessmentResult ? {
                      isCorrect: assessmentIsCorrect,
                      message: assessmentIsCorrect ? 'Excellent work!' : (() => {
                        // For multiple choice, show the actual answer text, not the index
                        if (questionObj.type === 'multiple_choice' && questionObj.options) {
                          const correctAnswer = questionObj.correct_answer ?? questionObj.correctAnswer;
                          const correctIndex = typeof correctAnswer === 'number'
                            ? correctAnswer
                            : parseInt(correctAnswer);
                          if (!isNaN(correctIndex) && correctIndex >= 0 && correctIndex < questionObj.options.length) {
                            return `The correct answer is: ${questionObj.options[correctIndex]}`;
                          }
                        }
                        // For other types, use the explanation or a generic message
                        return questionObj.explanation || 'Let\'s review this concept!';
                      })()
                    } : undefined}
                    gradeLevel={student.grade_level}
                    subject={skill?.subject || 'Learning'}
                    skill={skill?.name || 'Assessment'}
                    userId={student.id}
                    companionId={selectedCharacter}
                    totalXP={profile?.xp || 0}
                  />
                );
              })()}
              
              {showAssessmentResult && (
                <>
                  <div className={`${feedbackStyles.feedbackMessage} ${
                    assessmentIsCorrect ? feedbackStyles.correct : feedbackStyles.incorrect
                  }`}>
                    <span className={feedbackStyles.feedbackIcon}>
                      {assessmentIsCorrect ? '🎉' : '💡'}
                    </span>
                    <div className={feedbackStyles.feedbackText}>
                      {assessmentIsCorrect ? 
                        'Excellent work!' : 
                        (() => {
                          // Use the converted assessment for correct answer display
                          if (convertedAssessment?.type === 'true_false') {
                            const correctValue = (convertedAssessment as any).correctAnswer ? 'True' : 'False';
                            return `The correct answer was: ${correctValue}`;
                          } else if (convertedAssessment?.type === 'multiple_choice') {
                            const correctOption = (convertedAssessment as any).options?.find((opt: any) => opt.isCorrect);
                            return `The correct answer was: ${correctOption?.text || 'not available'}`;
                          } else if (convertedAssessment?.type === 'numeric' || convertedAssessment?.type === 'counting') {
                            return `The correct answer was: ${(convertedAssessment as any).correctAnswer}`;
                          } else {
                            return 'Please review the correct answer above';
                          }
                        })()
                      }
                      {convertedAssessment?.explanation && (
                        <p className={feedbackStyles.explanation}>{convertedAssessment.explanation}</p>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    className={`${questionStyles.submitButton} ${questionStyles.continueButton}`}
                    onClick={handleAssessmentContinue}
                  >
                    Continue to Results →
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Complete Phase */}
        {phase === 'complete' && (
          <div className={completionStyles.completionPhase}>
            <AICharacterAvatar 
              character={character}
              emotion="celebrating"
              size="large"
            />
            
            <h2 className={completionStyles.completionTitle}>Great Job!</h2>
            <p className={completionStyles.completionSubtitle}>You've completed the lesson on {skill?.skill_name || skill?.name || 'Identify numbers - up to 3'}!</p>
            
            <div className={completionStyles.performanceStats}>
              <div className={completionStyles.statCard}>
                <span className={completionStyles.statLabel}>Practice Score</span>
                <span className={completionStyles.statValue}>
                  {Object.values(practiceResults).filter(r => r).length} / {content.practice.length}
                </span>
              </div>
              <div className={completionStyles.statCard}>
                <span className={completionStyles.statLabel}>Assessment</span>
                <span className={completionStyles.statValue}>
                  {showAssessmentResult && assessmentIsCorrect ? 
                    '✓ Passed' : '⟲ Review Needed'}
                </span>
              </div>
            </div>
            
            <button 
              className={`${buttonStyles.primary} ${buttonStyles.learnVariant}`}
              onClick={onNext}
            >
              Continue Learning
            </button>
          </div>
        )}
        
        {/* Debug: Show current phase if no content rendered */}
        {phase !== 'instruction' && phase !== 'practice' && phase !== 'assessment' && phase !== 'complete' && (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h3>Debug: Current Phase = "{phase}"</h3>
            <p>isLoading: {isLoading.toString()}</p>
            <p>hasContent: {(!!content).toString()}</p>
            <p>error: {error || 'none'}</p>
          </div>
        )}
      </div>
      
      {/* Companion Chat */}
      {companionMessage && (
        <CompanionChatBox
          companionName={character?.name || characterId}
          companionEmoji={character?.id === 'spark' ? '⚡' : character?.id === 'sage' ? '🧙' : character?.id === 'harmony' ? '🎵' : '🤖'}
          message={{ text: companionMessage, emotion: companionEmotion }}
        />
      )}
      
      {/* FloatingLearningDock removed - will be reimplemented with proper styling */}
      
      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};

// Export with alias for compatibility
const MemoizedAILearnContainerV2UNIFIED = React.memo(AILearnContainerV2UNIFIED);
export { MemoizedAILearnContainerV2UNIFIED as AILearnContainerV2 }; // Alias for easy migration
export default MemoizedAILearnContainerV2UNIFIED;