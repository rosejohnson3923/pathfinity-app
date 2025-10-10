/**
 * AI-FIRST DISCOVER CONTAINER V2-UNIFIED
 * Combines V2 Discovery Intelligence with V2-JIT Performance
 * Best of both worlds: Curiosity Tracking + Speed + Adaptive Journey
 * 
 * Features from V2:
 * - DiscoverAIRulesEngine for curiosity tracking
 * - Exploration patterns and rewards
 * - Self-directed learning paths
 * - Discovery achievement system
 * 
 * Features from V2-JIT:
 * - JIT discovery content (<500ms)
 * - Multi-layer caching
 * - Session tracking
 * - Performance metrics
 * 
 * New Unified Features:
 * - Adaptive journey integration
 * - Curiosity-driven progression
 * - All 15 question types
 * - Exploration milestones
 */

import React, { useState, useEffect, useRef } from 'react';

// Core Services
import { aiLearningJourneyService, AIDiscoverContent, StudentProfile, LearningSkill } from '../../services/AILearningJourneyService';
import { unifiedLearningAnalyticsService } from '../../services/unifiedLearningAnalyticsService';
import { voiceManagerService } from '../../services/voiceManagerService';

// Journey Tracking & Persistence
import { journeyTrackingService } from '../../services/tracking/JourneyTrackingService';
import { pathiqPersistenceService } from '../../services/persistence/PathIQPersistenceService';
import { journeySummaryService } from '../../services/persistence/JourneySummaryService';

// V2-JIT Features - Performance & Caching
import { Question, BaseQuestion } from '../../services/content/QuestionTypes';
import { questionValidator, ValidationResult } from '../../services/content/QuestionValidator';
import { getDailyLearningContext } from '../../services/content/DailyLearningContextManager';
import { getJustInTimeContentService } from '../../services/content/JustInTimeContentService';
import { getPerformanceTracker } from '../../services/content/PerformanceTracker';
import { getSessionStateManager } from '../../services/content/SessionStateManager';

// Adaptive Journey Integration
import { continuousJourneyIntegration } from '../../services/ContinuousJourneyIntegration';
import { adaptiveJourneyOrchestrator } from '../../services/AdaptiveJourneyOrchestrator';
import { companionReactionService } from '../../services/companionReactionService';
import { useAICharacter } from '../ai-characters/AICharacterProvider';
import { AICharacterAvatar } from '../ai-characters/AICharacterAvatar';
// import { ContainerNavigationHeader } from './ContainerNavigationHeader'; // Removed - causing width issues
// import { FloatingLearningDock } from '../learning-support/FloatingLearningDock'; // Removed - will be reimplemented
import { ProgressHeader } from '../navigation/ProgressHeader';
import { CompanionChatBox } from '../learning-support/CompanionChatBox';
import { EnhancedLoadingScreen } from './EnhancedLoadingScreen';
import { useTheme } from '../../hooks/useTheme';
import { BentoDiscoverCardV2 } from '../bento/BentoDiscoverCardV2'; // Discover-specific tile implementation
import { CareerContextCard } from '../career/CareerContextCard';

// Import CSS modules - UNIFIED approach
import '../../styles/containers/BaseContainer.css';
import '../../styles/containers/DiscoverContainer.css';
import styles from './AIDiscoverContainerV2.module.css';

// Temporary imports until full migration to unified module
import questionStyles from '../../styles/shared/components/QuestionCard.module.css';
import lessonStyles from '../../styles/shared/screens/LessonScreen.module.css';
import practiceStyles from '../../styles/shared/screens/PracticeScreen.module.css';
import completionStyles from '../../styles/shared/screens/CompletionScreen.module.css';
import feedbackStyles from '../../styles/shared/components/FeedbackMessages.module.css';
import buttonStyles from '../../styles/shared/components/NavigationButtons.module.css';
import gamificationStyles from '../../styles/shared/components/GamificationElements.module.css';

// RULES ENGINE INTEGRATION
import { 
  useDiscoverRules, 
  useCompanionRules, 
  useGamificationRules,
  useMasterOrchestration,
  useThemeRules 
} from '../../rules-engine/integration/ContainerIntegration';
import { DiscoverContext } from '../../rules-engine/containers/DiscoverAIRulesEngine';

// ================================================================
// COMPONENT INTERFACES  
// ================================================================

interface AIDiscoverContainerV2Props {
  student: StudentProfile;
  skill: LearningSkill;
  selectedCharacter?: string;
  selectedCareer?: any;
  onComplete: (xpEarned?: number) => void;
  onNext?: () => void;
  onBack?: () => void;
  userId?: string;
  onLoadingChange?: (loading: boolean) => void;
  // Rubric Session ID for rubric-based content generation
  rubricSessionId?: string;
  // Master Narrative for context
  masterNarrative?: any;
  narrativeLoading?: boolean;
  companionId?: string;
}

type DiscoverPhase = 'loading' | 'exploration_intro' | 'discovery_paths' | 'activities' | 'reflection' | 'complete';

// ================================================================
// AI DISCOVER CONTAINER V2 COMPONENT
// ================================================================

export const AIDiscoverContainerV2UNIFIED: React.FC<AIDiscoverContainerV2Props> = ({
  student,
  skill,
  selectedCharacter,
  selectedCareer,
  onComplete,
  onNext,
  onBack,
  userId,
  onLoadingChange,
  rubricSessionId,
  masterNarrative,
  narrativeLoading,
  companionId
}) => {
  const theme = useTheme();
  
  // Initialize JIT Services (V2-JIT)
  const jitService = getJustInTimeContentService();
  const dailyContextManager = getDailyLearningContext();
  const performanceTracker = getPerformanceTracker();
  const sessionStateManager = getSessionStateManager();
  
  // Rules Engine Hooks (V2)
  const discoverRules = useDiscoverRules();
  const companionRules = useCompanionRules();
  const gamificationRules = useGamificationRules();
  const masterOrchestration = useMasterOrchestration();
  const themeRules = useThemeRules();
  
  // AI Character Integration
  const { currentCharacter, generateCharacterResponse, speakMessage, selectCharacter } = useAICharacter();
  
  // Ensure the correct character is selected
  React.useEffect(() => {
    if (selectedCharacter) {
      const normalizedCharacter = selectedCharacter.toLowerCase();
      if (currentCharacter?.id !== normalizedCharacter) {
        selectCharacter(normalizedCharacter);
      }
    }
  }, [selectedCharacter]);
  
  // Wrapped navigation handlers that stop speech
  const handleNavNext = () => {
    voiceManagerService.stopSpeaking();
    if (onNext) onNext();
  };
  
  const handleNavBack = () => {
    if (onBack) {
      voiceManagerService.stopSpeaking();
      onBack();
    }
  };
  
  // ================================================================
  // STATE MANAGEMENT
  // ================================================================
  
  const [phase, setPhase] = useState<DiscoverPhase>('loading');
  const [content, setContent] = useState<AIDiscoverContent | null>(null);
  const [selectedPath, setSelectedPath] = useState<number | null>(null);
  const [currentActivity, setCurrentActivity] = useState(0);
  const [completedActivities, setCompletedActivities] = useState<Record<number, boolean>>({});
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<number, string>>({});
  const [allActivitiesComplete, setAllActivitiesComplete] = useState(false);
  const [sessionId] = useState(`discover-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Journey Tracking - Use rubric session ID if available, otherwise generate unique ID
  const [trackingSessionId] = useState(() =>
    rubricSessionId || `session-${student?.id || 'unknown'}-${Date.now()}`
  );

  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [companionMessage, setCompanionMessage] = useState<{ text: string; emotion: string } | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [showCareerContext, setShowCareerContext] = useState(false);
  
  // Rules Engine State
  const [curiosityLevel, setCuriosityLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [explorationStyle, setExplorationStyle] = useState<'guided' | 'semi-guided' | 'independent'>('guided');
  const [discoveries, setDiscoveries] = useState<string[]>([]);
  const [connections, setConnections] = useState<string[]>([]);
  const [questions, setQuestions] = useState<string[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [explorationPath, setExplorationPath] = useState<any>(null);
  const [scaffoldingLevel, setScaffoldingLevel] = useState<'minimal' | 'moderate' | 'extensive'>('moderate');
  
  // Refs for tracking
  const explorationStartTime = useRef<number>(Date.now());
  const topicsExplored = useRef<Set<string>>(new Set());
  const questionsAsked = useRef<number>(0);
  const isGenerating = useRef<boolean>(false);

  // Notify parent of loading state changes
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(phase === 'loading');
    }
  }, [phase, onLoadingChange]);
  
  // ================================================================
  // CONTENT GENERATION WITH RULES ENGINE
  // ================================================================

  // Track render count for debugging
  const renderCount = useRef(0);
  renderCount.current++;

  // Create stable identifiers to prevent unnecessary re-renders
  const skillKey = skill ? `${skill.id || skill.skill_number}-${skill.skill_name}` : null;
  const studentKey = student ? `${student.id}-${student.name}` : null;

  useEffect(() => {
    // Prevent duplicate calls
    if (!skill || !student || phase !== 'loading' || content || isGenerating.current) {
      return;
    }
    generateContent();
  }, [skillKey, studentKey]); // Use stable keys to prevent unnecessary re-renders

  const generateContent = async () => {
    // Prevent concurrent generation
    if (isGenerating.current) {
      return;
    }

    // Double-check to prevent race conditions
    if (phase !== 'loading' || content) {
      return;
    }

    // Set flag to prevent concurrent calls
    isGenerating.current = true;
    const startTime = performance.now();

    try {
      // STEP 1: Initialize Daily Context (V2-JIT)
      const dailyContext = dailyContextManager.getCurrentContext() || 
        await dailyContextManager.createDailyContext({
          studentProfile: student,
          selectedCareer: selectedCareer,
          selectedCompanion: selectedCharacter?.id
        });
      
      // STEP 2: Generate via JIT with proper context for AI generation
      const jitRequest = {
        userId: student.id,
        container: 'discover-container',
        containerType: 'discover' as const,
        subject: skill.subject || 'Science',
        context: {
          skill: {
            skill_number: skill.skill_number,
            skill_name: skill.skill_name,
            name: skill.skill_name
          },
          student: {
            id: student.id,
            name: student.name,
            display_name: student.display_name || student.name,
            grade_level: student.grade_level,
            interests: student.interests || [selectedCareer],
            learning_style: student.learning_style || 'visual'
          },
          career: selectedCareer,
          careerDescription: `${selectedCareer} professional`,
          // RUBRIC SESSION ID - Enables rubric-based content generation
          rubricSessionId: rubricSessionId,
          // ADD NARRATIVE CONTEXT for Discover Container (Challenge generation)
          narrativeContext: masterNarrative ? {
            // Discover-specific setting and narrative
            setting: masterNarrative.settingProgression?.discover?.location,
            context: masterNarrative.settingProgression?.discover?.context,
            narrative: masterNarrative.settingProgression?.discover?.narrative,

            // Overall story elements
            mission: masterNarrative.cohesiveStory?.mission,
            throughLine: masterNarrative.cohesiveStory?.throughLine,

            // Companion personality for consistent interactions
            companion: masterNarrative.companionIntegration,

            // Subject-specific context for this subject
            subjectContext: masterNarrative.subjectContextsAligned?.[skill.subject || 'Science']
          } : undefined
        },
        timeConstraint: 15 // minutes
      };

      // Try to get content from JIT cache first
      let generatedContent;
      try {
        const jitContent = await jitService.generateContainerContent(jitRequest);

        // DISCOVER container: Check for aiSourceContent (rubric-based content)
        if (jitContent && jitContent.aiSourceContent) {
          console.log('✅ [DISCOVER] Using rubric-based content from JIT aiSourceContent:', {
            hasUnifiedScenario: !!jitContent.aiSourceContent.unifiedScenario,
            hasDiscoveryStations: !!jitContent.aiSourceContent.discoveryStations,
            stationCount: jitContent.aiSourceContent.discoveryStations?.length
          });
          generatedContent = jitContent.aiSourceContent;
        }
        // Fallback: Use JIT content if available (legacy format)
        else if (jitContent && jitContent.content) {
          console.log('⚠️ [DISCOVER] Using legacy content from JIT content field');
          generatedContent = jitContent.content;
        }
      } catch (jitError) {
        console.error('❌ [DISCOVER] JIT error:', jitError);
        // JIT cache miss - will generate fresh content
      }

      // Only make AI call if JIT didn't provide content
      if (!generatedContent) {
        generatedContent = await aiLearningJourneyService.generateDiscoverContent(
          skill,
          student,
          selectedCareer
        );
      }

      // STEP 3: Create Rules Engine Context (V2)
      const discoverContext: DiscoverContext = {
        student: {
          id: student.id,
          grade: student.grade_level,
          interests: getStudentInterests(student),
          curiosityLevel,
          explorationStyle,
          priorKnowledge: new Map()
        },
        exploration: {
          type: 'research',
          topic: skill.skill_name,
          depth: getDepthForGrade(student.grade_level),
          resources: [],
          duration: 900 // 15 minutes default
        },
        career: selectedCareer ? {
          id: selectedCareer.id || selectedCareer.name?.toLowerCase(),
          name: selectedCareer.name
        } : undefined,
        companion: currentCharacter ? {
          id: currentCharacter.id,
          name: currentCharacter.name
        } : undefined,
        theme: theme === 'dark' ? 'dark' : 'light',
        discovery: {
          findings: discoveries,
          connections,
          questions,
          hypotheses: []
        },
        collaboration: {
          mode: 'solo',
          role: 'explorer'
        }
      };
      
      // Execute rules for exploration setup
      const explorationResults = await discoverRules.execute(discoverContext);
      
      // Process exploration results
      explorationResults.forEach(result => {
        if (result.ruleId === 'setup_exploration' && result.data) {
          setExplorationPath(result.data.pathway);
        }
        if (result.ruleId === 'configure_scaffolding' && result.data) {
          setScaffoldingLevel(result.data.level);
        }
      });
      
      // Track session start with analytics
      await unifiedLearningAnalyticsService.trackLearningEvent({
        studentId: student.id,
        sessionId,
        eventType: 'discovery_start',
        metadata: {
          grade: student.grade_level,
          subject: skill.subject,
          skill: skill.skill_name,
          container: 'discover_v2',
          rules_engine: true,
          curiosity_level: curiosityLevel,
          exploration_style: explorationStyle
        }
      });

      // Apply career-specific exploration themes from rules engine
      if (explorationPath && selectedCareer) {
        generatedContent.careerTheme = explorationPath.careerActivities;
      }

      // Normalize subject to match database constraint
      const normalizeSubject = (subject: string | undefined): 'Math' | 'ELA' | 'Science' | 'Social Studies' => {
        if (!subject) return 'Science'; // DISCOVER defaults to Science
        const normalized = subject.toLowerCase();
        if (normalized.includes('math')) return 'Math';
        if (normalized.includes('ela') || normalized.includes('english') || normalized.includes('reading')) return 'ELA';
        if (normalized.includes('science')) return 'Science';
        if (normalized.includes('social')) return 'Social Studies';
        return 'Science'; // fallback for DISCOVER
      };

      // Start journey tracking service for DISCOVER container
      journeyTrackingService.startSession({
        sessionId: trackingSessionId,
        container: 'DISCOVER',
        subject: normalizeSubject(skill?.subject as string),
        skillId: skill.skill_number || skill.id,
        skillName: skill.skill_name || skill.name || 'Unknown Skill',
        gradeLevel: student.grade_level || 'K',
        userId: student.id
      }).then(result => {
        if (result.success) {
          console.log('📊 Journey tracking started for DISCOVER container');
        } else {
          console.warn('⚠️ Failed to start journey tracking:', result.error);
        }
      }).catch(err => {
        console.error('❌ Journey tracking error:', err);
      });

      setContent(generatedContent);
      
      // Check if we should show career context card
      if (generatedContent.career_context && generatedContent.career_context.greeting) {
        setShowCareerContext(true);
      }
      
      setPhase('exploration_intro');
      
      // Get companion greeting from rules engine
      if (companionRules) {
        const greeting = await companionRules.getCompanionMessage(
          currentCharacter?.id || 'finn',
          selectedCareer?.name || 'Explorer',
          'discovery_start',
          { 
            skill: skill.skill_name,
            grade: student.grade_level
          }
        );
        setCompanionMessage({ 
          text: greeting.message, 
          emotion: greeting.emotion 
        });
      }

    } catch (error) {
      console.error('❌ [DISCOVER] Failed to generate content:', error);

      // Set error state to prevent re-render loop
      setPhase('complete');
      setContent({
        introduction: {
          hook: "Let's explore together!",
          connection: `We'll discover more about ${skill?.skill_name || 'this topic'}.`,
          objective: "Ready to learn?"
        },
        discovery_paths: [
          {
            title: "Exploration Path",
            description: "Let's explore this topic together",
            icon: "🔍",
            difficulty: "beginner",
            duration: 15,
            activities: []
          }
        ],
        reflection: {
          prompts: ["What did you learn?"],
          connections: []
        }
      } as any);

      isGenerating.current = false; // Reset flag on error
    } finally {
      isGenerating.current = false; // Always reset flag
    }
  };

  // ================================================================
  // CURIOSITY TRACKING WITH RULES ENGINE
  // ================================================================
  
  const trackCuriosity = async (action: string, data?: any) => {
    // Update curiosity metrics
    if (action === 'question_asked') {
      questionsAsked.current++;
      setQuestions(prev => [...prev, data.question]);
    } else if (action === 'topic_explored') {
      topicsExplored.current.add(data.topic);
    } else if (action === 'connection_made') {
      setConnections(prev => [...prev, data.connection]);
    } else if (action === 'discovery_made') {
      setDiscoveries(prev => [...prev, data.discovery]);
    }
    
    // Determine curiosity level based on interactions
    const totalInteractions = questionsAsked.current + topicsExplored.current.size + connections.length;
    if (totalInteractions > 15) {
      setCuriosityLevel('high');
    } else if (totalInteractions > 7) {
      setCuriosityLevel('medium');
    } else {
      setCuriosityLevel('low');
    }
    
    // Create context for rules engine
    const curiosityContext: DiscoverContext = {
      student: {
        id: student.id,
        grade: student.grade_level,
        curiosityLevel
      },
      exploration: {
        type: 'research',
        topic: skill.skill_name,
        depth: 'intermediate'
      },
      discovery: {
        findings: discoveries,
        connections,
        questions,
        hypotheses: []
      }
    };
    
    // Get curiosity rewards from rules engine
    const results = await discoverRules.execute(curiosityContext);
    
    // Process rewards
    results.forEach(result => {
      if (result.ruleId === 'reward_curiosity' && result.data) {
        const newRewards = result.data.rewards;
        setRewards(prev => [...prev, ...newRewards]);
        
        // Apply gamification rewards
        if (gamificationRules) {
          newRewards.forEach(async (reward: any) => {
            if (reward.type === 'points') {
              await gamificationRules.awardPoints(student.id, reward.value, 'discovery_curiosity');
            }
          });
        }
      }
    });
  };

  // ================================================================
  // SPEECH HELPERS
  // ================================================================
  
  const readTextAloud = async (text: string) => {
    if (!currentCharacter || !speakMessage) return;
    
    voiceManagerService.stopSpeaking();
    setIsSpeaking(true);
    
    try {
      await speakMessage(text);
    } finally {
      setIsSpeaking(false);
    }
  };
  
  // Greet on exploration intro phase
  useEffect(() => {
    if (phase === 'exploration_intro' && content && !hasGreeted && currentCharacter) {
      setHasGreeted(true);
      const greeting = `Welcome to your discovery journey, ${student.display_name}! Let's explore the amazing world of ${skill.skill_name} together!`;
      readTextAloud(greeting);
      
      // Track curiosity trigger
      trackCuriosity('exploration_started', { skill: skill.skill_name });
    }
  }, [phase, content, hasGreeted, currentCharacter]);
  
  // ================================================================
  // NAVIGATION HANDLERS WITH RULES ENGINE
  // ================================================================

  const handleExplorationIntroComplete = async () => {
    // Track phase completion
    await unifiedLearningAnalyticsService.trackLearningEvent({
      studentId: student.id,
      sessionId,
      eventType: 'exploration_intro_complete',
      metadata: {
        grade: student.grade_level,
        subject: skill.subject,
        skill: skill.skill_name,
        container: 'discover_v2',
        duration: (Date.now() - explorationStartTime.current) / 1000
      }
    });

    explorationStartTime.current = Date.now();
    setPhase('discovery_paths');
  };

  const handleDiscoveryPathsComplete = async () => {
    // Track discovery paths completion
    await unifiedLearningAnalyticsService.trackLearningEvent({
      studentId: student.id,
      sessionId,
      eventType: 'discovery_paths_complete',
      metadata: {
        grade: student.grade_level,
        subject: skill.subject,
        skill: skill.skill_name,
        container: 'discover_v2',
        duration: (Date.now() - explorationStartTime.current) / 1000
      }
    });

    // Complete and let MultiSubjectContainer show JourneyCelebrationScreen
    handleDiscoverComplete();
  };

  const handlePathSelection = async (pathIndex: number) => {
    setSelectedPath(pathIndex);
    
    // Track path selection as topic exploration
    if (content) {
      const path = content.discovery_paths[pathIndex];
      trackCuriosity('topic_explored', { topic: path.title });
    }
    
    // Create context for path-specific rules
    const pathContext: DiscoverContext = {
      student: {
        id: student.id,
        grade: student.grade_level,
        curiosityLevel,
        explorationStyle
      },
      exploration: {
        type: 'investigation',
        topic: content?.discovery_paths[pathIndex].title || skill.skill_name,
        depth: getDepthForGrade(student.grade_level)
      },
      career: selectedCareer ? {
        id: selectedCareer.id || selectedCareer.name?.toLowerCase(),
        name: selectedCareer.name
      } : undefined
    };
    
    // Get path-specific guidance from rules engine
    const pathResults = await discoverRules.execute(pathContext);
    
    // Process guidance
    pathResults.forEach(result => {
      if (result.ruleId === 'provide_guidance' && result.data) {
        const guidance = result.data.guidance;
        setCompanionMessage({
          text: guidance,
          emotion: 'excited'
        });
        readTextAloud(guidance);
      }
    });
    
    setPhase('activities');
  };

  const handleActivityComplete = async (activityIndex: number) => {
    setCompletedActivities(prev => ({ ...prev, [activityIndex]: true }));

    // Track discovery
    if (content && selectedPath !== null) {
      const activity = content.discovery_paths[selectedPath].activities[activityIndex];
      trackCuriosity('discovery_made', {
        discovery: `Completed ${activity.type}: ${activity.title}`
      });

      // Record activity completion in journey tracking
      journeyTrackingService.recordQuestionAttempt(
        trackingSessionId,
        'DISCOVER',
        {
          questionId: `activity-${activityIndex}`,
          questionText: activity.title || 'Discovery Activity',
          studentAnswer: 'completed',
          correctAnswer: 'completed',
          isCorrect: true, // Activities are exploration-based, so completion = success
          attemptNumber: 1,
          timeSpent: 60, // Approximate - DISCOVER tracks overall exploration time
          hintsUsed: 0
        }
      ).catch(err => console.error('Failed to record activity completion:', err));
    }
    
    // Check if all activities are complete
    if (content && selectedPath !== null) {
      const allComplete = content.discovery_paths[selectedPath].activities
        .every((_, index) => completedActivities[index] || index === activityIndex);
      
      if (allComplete) {
        setAllActivitiesComplete(true);
        
        // Create completion context for rules engine
        const completionContext: DiscoverContext = {
          student: {
            id: student.id,
            grade: student.grade_level,
            curiosityLevel
          },
          exploration: {
            type: 'research',
            topic: skill.skill_name,
            depth: 'deep'
          },
          discovery: {
            findings: discoveries,
            connections,
            questions,
            hypotheses: []
          }
        };
        
        // Get celebration and final rewards from rules engine
        const completionResults = await discoverRules.execute(completionContext);
        
        // Process final rewards
        completionResults.forEach(result => {
          if (result.ruleId === 'generate_portfolio' && result.data) {
            // Portfolio data available in result.data
          }
        });
        
        // Auto-advance to reflection after delay
        setTimeout(() => {
          setPhase('reflection');
        }, 3000);
      } else {
        // Move to next activity
        setCurrentActivity(activityIndex + 1);
      }
    }
    
    // Track activity completion
    await unifiedLearningAnalyticsService.trackLearningEvent({
      studentId: student.id,
      sessionId,
      eventType: 'discovery_activity_complete',
      metadata: {
        grade: student.grade_level,
        subject: skill.subject,
        skill: skill.skill_name,
        container: 'discover_v2',
        activity_number: activityIndex + 1,
        curiosity_level: curiosityLevel,
        discoveries: discoveries.length,
        questions_asked: questionsAsked.current
      }
    });
  };

  // Handle container completion with tracking
  const handleDiscoverComplete = async () => {
    let totalXPEarned = 0;

    try {
      console.log('💾 Completing DISCOVER session tracking...');
      const result = await journeyTrackingService.completeSession(
        trackingSessionId,
        'DISCOVER'
      );

      if (result.success) {
        console.log('✅ DISCOVER session completed and saved');

        // Get the completed session data to calculate XP
        const sessionData = journeyTrackingService.getActiveSession(trackingSessionId, 'DISCOVER');

        if (sessionData) {
          // Normalize subject to match database constraint
          const normalizeSubject = (subject: string | undefined): 'Math' | 'ELA' | 'Science' | 'Social Studies' => {
            if (!subject) return 'Science';
            const normalized = subject.toLowerCase();
            if (normalized.includes('math')) return 'Math';
            if (normalized.includes('ela') || normalized.includes('english') || normalized.includes('reading')) return 'ELA';
            if (normalized.includes('science')) return 'Science';
            if (normalized.includes('social')) return 'Social Studies';
            return 'Science'; // fallback
          };

          // Award XP to PathIQ profile
          const xpResult = await pathiqPersistenceService.awardXP({
            userId: student.id,
            amount: sessionData.xpEarned || 50, // Use tracked XP or fallback
            reason: `Completed ${skill?.skill_name || 'exploration'} in DISCOVER container`,
            category: 'learning',
            sessionId: trackingSessionId,
            container: 'DISCOVER',
            subject: normalizeSubject(skill?.subject as string),
            skillId: skill?.skill_number || skill?.id
          });

          if (xpResult.success) {
            totalXPEarned = xpResult.amountAwarded;
            console.log(`⭐ PathIQ XP awarded: +${totalXPEarned}`);

            if (xpResult.levelUps && xpResult.levelUps > 0) {
              console.log(`🎉 LEVEL UP! Now level ${xpResult.newLevel}!`);
              // TODO: Show level up animation
            }
          }

          // Update journey summary with DISCOVER progress
          try {
            const progress = await journeySummaryService.buildContainerProgress(
              trackingSessionId,
              'DISCOVER'
            );

            if (progress) {
              await journeySummaryService.updateContainerProgress(
                trackingSessionId,
                'DISCOVER',
                progress
              );
              console.log('✅ DISCOVER progress updated in journey summary');
            }
          } catch (summaryError) {
            console.error('Failed to update journey summary:', summaryError);
          }
        }
      } else {
        console.warn('⚠️ Failed to complete session:', result.error);
      }
    } catch (error) {
      console.error('❌ Error completing session:', error);
    }

    // Call the original onComplete callback with XP earned
    console.log(`🎯 Calling onComplete with XP: ${totalXPEarned}`);
    onComplete(totalXPEarned);
  };

  const handleReflectionAnswer = (questionIndex: number, answer: string) => {
    setReflectionAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    
    // Track reflection as connection making
    trackCuriosity('connection_made', { 
      connection: `Reflection: ${answer.substring(0, 50)}...` 
    });
    
    // Check if all reflections are complete
    if (content) {
      const allAnswered = content.reflection_questions
        .every((_, index) => reflectionAnswers[index] || index === questionIndex);
      
      if (allAnswered) {
        setTimeout(() => {
          // Complete and let MultiSubjectContainer show JourneyCelebrationScreen
          handleDiscoverComplete();
        }, 2000);
      }
    }
  };

  // ================================================================
  // HINT SYSTEM WITH RULES ENGINE
  // ================================================================
  
  const handleHintRequest = async (hintLevel: 'free' | 'basic' | 'detailed') => {
    let hint = '';
    
    // Get hints based on current phase and scaffolding level
    if (phase === 'activities' && content && selectedPath !== null) {
      const activity = content.discovery_paths[selectedPath].activities[currentActivity];
      
      if (scaffoldingLevel === 'extensive') {
        // More detailed hints for extensive scaffolding
        if (hintLevel === 'free') {
          hint = `Explore this ${activity.type} activity by ${activity.hint || 'thinking creatively'}`;
        } else if (hintLevel === 'basic') {
          hint = `Try approaching this from a ${selectedCareer?.name || 'professional'} perspective`;
        } else if (hintLevel === 'detailed') {
          hint = activity.learning_objective || 'Complete the activity to make a discovery!';
        }
      } else if (scaffoldingLevel === 'moderate') {
        // Balanced hints
        if (hintLevel === 'free') {
          hint = `Think about what you want to discover...`;
        } else if (hintLevel === 'basic') {
          hint = activity.hint || 'Explore and experiment!';
        } else if (hintLevel === 'detailed') {
          hint = activity.learning_objective || 'Make connections to what you know';
        }
      } else {
        // Minimal hints for independent exploration
        if (hintLevel === 'free') {
          hint = `Keep exploring...`;
        } else if (hintLevel === 'basic') {
          hint = `What interests you most?`;
        } else if (hintLevel === 'detailed') {
          hint = `Follow your curiosity!`;
        }
      }
    } else if (phase === 'discovery_paths') {
      hint = `Choose a path that interests you most about ${skill.skill_name}`;
    } else if (phase === 'reflection') {
      hint = `Think about what you discovered and how it connects to ${selectedCareer?.name || 'real life'}`;
    }
    
    setCurrentHint(hint);
    
    // Track hint request as question
    trackCuriosity('question_asked', { question: `Hint requested: ${hintLevel}` });
    
    // Auto-clear hint after 10 seconds
    setTimeout(() => setCurrentHint(null), 10000);
  };

  // ================================================================
  // HELPER FUNCTIONS
  // ================================================================
  
  const getStudentInterests = (student: StudentProfile): string[] => {
    // Could be enhanced with actual student interest data
    return ['exploration', 'creativity', 'problem-solving'];
  };
  
  const getDepthForGrade = (grade: string): 'surface' | 'intermediate' | 'deep' => {
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);
    if (gradeNum <= 2) return 'surface';
    if (gradeNum <= 5) return 'intermediate';
    return 'deep';
  };
  
  const getExplorationStyleForGrade = (grade: string): 'guided' | 'semi-guided' | 'independent' => {
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);
    if (gradeNum <= 2) return 'guided';
    if (gradeNum <= 5) return 'semi-guided';
    return 'independent';
  };

  // ================================================================
  // RENDER WRAPPER WITH SIDEBAR
  // ================================================================
  
  const renderWithDock = (mainContent: React.ReactNode) => {
    return (
      <>
        {mainContent}
        
        {/* AI Character Avatar */}
        {currentCharacter && (
          <AICharacterAvatar
            character={currentCharacter}
            position="bottom-right"
            size="medium"
            isAnimating={isSpeaking}
            emotion={companionMessage?.emotion || 'happy'}
          />
        )}
        
        {/* Companion Chat Box */}
        {companionMessage && (
          <CompanionChatBox
            message={companionMessage.text}
            companionName={currentCharacter?.name || 'Finn'}
            position="bottom-left"
            theme={theme}
            autoHide={true}
            duration={5000}
          />
        )}
        
        {/* FloatingLearningDock removed - will be reimplemented with proper styling */}
        
        {/* Display hint overlay if active */}
        {currentHint && (
          <div className={feedbackStyles.hintOverlay}>
            <div className={feedbackStyles.hintContent}>
              <span className={feedbackStyles.hintIcon}>💡</span>
              <p className={feedbackStyles.hintText}>{currentHint}</p>
            </div>
          </div>
        )}
        
        {/* Display curiosity tracker */}
        <div className={gamificationStyles.discoveryTracker}>
          <h4>🔍 Discovery Tracker</h4>
          <div className={gamificationStyles.trackerContent}>
            <div>📝 Questions: {questionsAsked.current}</div>
            <div>🗺️ Topics: {topicsExplored.current.size}</div>
            <div>💡 Discoveries: {discoveries.length}</div>
            <div>🔗 Connections: {connections.length}</div>
            <div className={`${gamificationStyles.curiosityStatus} ${gamificationStyles[curiosityLevel]}`}>
              Curiosity: {curiosityLevel.toUpperCase()}
            </div>
          </div>
        </div>
        
        {/* Display rewards if any */}
        {rewards.length > 0 && (
          <div className={gamificationStyles.discoveryRewards}>
            <h4>✨ Discovery Rewards!</h4>
            {rewards.slice(-3).map((reward, index) => (
              <div key={index} className={gamificationStyles.rewardItem}>
                {reward.type === 'unlock' && `🔓 ${reward.value}`}
                {reward.type === 'badge' && `🎖️ ${reward.value}`}
                {reward.type === 'resource' && `📚 ${reward.value}`}
                {reward.type === 'points' && `⭐ +${reward.value} XP`}
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  // ================================================================
  // LOADING STATE
  // ================================================================

  if (phase === 'loading' || !content) {
    return (
      <EnhancedLoadingScreen 
        phase="practice"
        skillName={skill?.skill_name || skill?.name || "Discovery Skills"}
        studentName={student?.display_name || student?.name || "Explorer"}
        customMessage="Preparing your discovery journey..."
        containerType="discover"
        currentCareer={selectedCareer?.name || "Exploring"}
        showGamification={true}
      />
    );
  }

  // ================================================================
  // EXPLORATION INTRODUCTION PHASE
  // ================================================================

  if (phase === 'exploration_intro') {
    // Show career context card if available
    if (showCareerContext && content) {
      return (
        <div className="ai-discover-container">
          <CareerContextCard
            title={content?.title || 'Welcome to Discovery'}
            greeting={content?.greeting || `Welcome, ${selectedCareer?.name || 'Explorer'} ${student.display_name}!`}
            concept={content?.concept || 'Discover new concepts through exploration!'}
            explorationTheme={content?.exploration_theme}
            studentName={student.display_name}
            careerName={selectedCareer?.name || 'Explorer'}
            gradeLevel={student.grade_level}
            subject={skill?.subject || 'Learning'}
            containerType="discover"
            companionName={currentCharacter?.name || 'Sage'}
            avatarUrl={currentCharacter?.avatar_url}
            onStart={() => setShowCareerContext(false)}
          />
        </div>
      );
    }
    
    // Feature flag for Bento UI
    const useBentoUI = true;
    
    if (useBentoUI) {
      // Map Discover content to proper structure with new fields
      const mappedContent = content ? {
        interactive_simulation: {
          setup: content.exploration_hook || content.greeting,
          challenges: content.practice?.map((item: any, index: number) => ({
            title: `Discovery ${index + 1}`,
            description: item.question,
            options: item.options || [],
            correct_choice: typeof item.correct_answer === 'number' ? item.correct_answer : 0,
            hint: item.hint,
            outcome: item.explanation,
            learning_point: item.discovery_moment || item.explanation
          })) || [],
          conclusion: content.conclusion || "Great discoveries today!"
        },
        career_introduction: content.career_connection || `Discover how ${selectedCareer?.name || 'professionals'} use ${skill?.skill_name}`,
        real_world_connections: content.real_world_examples || [],
        // New fields from updated AI generation
        curiosity_questions: content.curiosity_questions || [],
        discovery_paths: content.discovery_paths || [],
        exploration_theme: content.exploration_theme || `Discover ${skill?.skill_name} in action!`,
        reflection_questions: content.reflection_questions || []
      } : null;

      return (
        <div className="ai-discover-container">
          <BentoDiscoverCardV2
            screenType="intro"
            skill={{
              id: skill?.id || 'default',
              name: skill?.skill_name || skill?.name || 'Discovery',
              skill_number: skill?.skill_number || 1,
              category: skill?.category || 'discovery',
              subject: skill?.subject || 'general',
              grade: student.grade_level
            }}
            career={{
              name: selectedCareer?.name || 'Explorer',
              icon: '🔍',
              description: selectedCareer?.description || 'Discovering new knowledge'
            }}
            companion={{
              id: selectedCharacter?.toLowerCase() || sessionStorage.getItem('selectedCompanion') || 'pat',
              name: selectedCharacter || sessionStorage.getItem('selectedCompanion')?.charAt(0).toUpperCase() + (sessionStorage.getItem('selectedCompanion') || 'pat').slice(1) || 'Pat',
              trait: 'curious'
            }}
            aiContent={mappedContent}
            challengeData={{
              subject: skill?.subject || 'Discovery',
              skill: {
                id: skill?.id || 'default',
                name: skill?.skill_name || skill?.name || 'Discovery',
                description: skill?.description || 'Exploring new concepts'
              },
              introduction: {
                title: content?.unifiedScenario?.title || `Discover ${skill?.skill_name || 'New Skills'} in Action!`,
                welcome: content?.unifiedScenario?.narrativeSetup || content?.exploration_theme || 'Welcome to Discovery!',
                companionMessage: content?.unifiedScenario?.challenge || `Let's explore ${skill?.skill_name || 'new concepts'} together!`,
                howToUse: content?.unifiedScenario?.careerConnection || 'Click on options to discover new connections'
              },
              scenarios: (() => {
                console.log('🔍 [DEBUG] Raw content object:', content);
                console.log('🔍 [DEBUG] content.discoveryStations:', content?.discoveryStations);
                console.log('🔍 [DEBUG] content.unifiedScenario:', content?.unifiedScenario);
                console.log('🔍 [DEBUG] content.discovery_paths:', content?.discovery_paths);

                // FIRST: Handle discoveryStations (from RUBRIC content) - PHASE 1 MAPPING
                if (content?.discoveryStations && Array.isArray(content.discoveryStations)) {
                  console.log('🎯 [PHASE 1] ✅ Using RUBRIC discoveryStations:', content.discoveryStations);
                  console.log('🎯 [PHASE 1] Sample station fields:', Object.keys(content.discoveryStations[0] || {}));
                  return content.discoveryStations.map((station: any, index: number) => ({
                    subject: station.subject || SUBJECTS[index] || 'Discovery',
                    stationTitle: station.stationTitle || station.title,
                    description: station.question || station.description || station.challenge || 'Discovery challenge',
                    question: station.question,
                    visual: station.visual && station.visual.trim() !== '' ? station.visual : undefined,
                    careerContext: station.career_connection || station.careerContext,
                    context: station.context || station.scenario_context || station.setting,
                    options: station.options || [],
                    correct_choice: typeof station.correct_answer === 'number' ? station.correct_answer : 0,
                    outcome: station.outcome || station.explanation || station.learning_outcome,
                    explanation: station.explanation,
                    learning_point: station.learning_point || station.discovery_insight || station.key_learning,
                    hint: station.hint,
                    title: station.title || `${station.subject || SUBJECTS[index]} Discovery`,
                    // PHASE 1: Map ALL rubric fields
                    activity: station.activity,
                    deliverable: station.deliverable,
                    practiceSupport: station.practiceSupport
                  }));
                }

                // SECOND: Handle discovery_paths (from AI DISCOVER content)
                if (content?.discovery_paths && Array.isArray(content.discovery_paths)) {
                  const scenarios: any[] = [];
                  content.discovery_paths.forEach((path: any) => {
                    if (path.activities && Array.isArray(path.activities)) {
                      path.activities.forEach((activity: any) => {
                        scenarios.push({
                          subject: path.title || 'Discovery',
                          description: activity.description || activity.title,
                          question: activity.question,
                          context: activity.interactive_element,
                          options: activity.options || [],
                          correct_choice: typeof activity.correct_answer === 'number' ? activity.correct_answer : 0,
                          outcome: activity.explanation,
                          explanation: activity.explanation,
                          learning_point: activity.learning_objective,
                          hint: activity.hint,
                          title: activity.title
                        });
                      });
                    }
                  });
                  return scenarios;
                }

                // Fallback to practice format (from LEARN content)
                if (content?.practice && Array.isArray(content.practice)) {
                  return content.practice.map((item: any, index: number) => ({
                    subject: item.subject || skill?.subject || SUBJECTS[index] || 'Discovery',
                    description: item.question || item.description || 'Discovery challenge',
                    question: item.question,
                    visual: item.visual && item.visual.trim() !== '' ? item.visual : undefined,
                    careerContext: item.career_connection || item.careerContext || `Discover how ${selectedCareer?.name || 'professionals'} use ${skill?.skill_name}!`,
                    context: item.context || item.scenario_context || undefined,
                    options: item.options || [],
                    correct_choice: typeof item.correct_answer === 'number' ? item.correct_answer : 0,
                    outcome: item.outcome || item.explanation,
                    explanation: item.explanation,
                    learning_point: item.learning_point || item.discovery_insight || item.explanation,
                    hint: item.hint,
                    title: item.title || `Discovery ${index + 1}`
                  }));
                }

                return [];
              })()
            }}
            gradeLevel={student.grade_level}
            studentName={student.display_name}
            userId={student.id}
            onChallengeComplete={handleDiscoveryPathsComplete}
            onComplete={handleDiscoverComplete}
            onScenarioComplete={(index, wasCorrect) => {
              // Track completion
            }}
            onBack={onBack}
          />
        </div>
      );
    }
    
    return (
      <div className="ai-discover-container">
        {/* Comprehensive Progress Header */}
        <ProgressHeader
          containerType="DISCOVER"
          title="Discovery Journey"
          career={career}
          skill={skill?.skill_name}
          subject={skill?.subject}
          progress={20}
          currentPhase="Exploration Introduction"
          totalPhases={5}
          showBackButton={true}
          backPath="/app/dashboard"
          showThemeToggle={false}
          hideOnLoading={true}
          isLoading={loading}
        />
        <div className={`exploration-intro-phase ${onBack ? 'with-header' : ''}`}>
          <header className="phase-header">
            <h1>{content.title}</h1>
            <div className="discovery-badge">
              <span className="badge-icon">🔍</span>
              <span className="badge-text">Discovery Mode</span>
            </div>
          </header>

          <section className="big-idea-section">
            <h2>💡 The Big Discovery</h2>
            <div className="big-idea-content">
              <p className="big-idea-text">{content.big_idea}</p>
            </div>
          </section>

          <section className="exploration-hook-section">
            <h2>🚀 Your Exploration Mission</h2>
            <div className="exploration-hook">
              <p className="hook-text">{content.exploration_hook}</p>
            </div>
          </section>

          <section className={lessonStyles.lessonSection}>
            <h2>🤔 Wonder Questions</h2>
            <div className={lessonStyles.lessonContent}>
              {content.curiosity_questions.map((question, index) => (
                <div key={index} className="curiosity-question" onClick={() => {
                  trackCuriosity('question_asked', { question });
                }}>
                  <span className="question-icon">❓</span>
                  <span className="question-text">{question}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Display scaffolding indicator */}
          <div className={`${gamificationStyles.scaffoldingIndicator} ${gamificationStyles[scaffoldingLevel === 'minimal' ? 'low' : scaffoldingLevel === 'moderate' ? 'medium' : 'high']}`}>
            Guidance: {scaffoldingLevel}
          </div>

          <div className={lessonStyles.lessonActions}>
            <button
              onClick={handleExplorationIntroComplete}
              className={`${buttonStyles.primary} ${buttonStyles.discoverVariant}`}
            >
              Begin Discovery Journey 🗺️
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // DISCOVERY PATHS PHASE
  // ================================================================

  if (phase === 'discovery_paths') {
    return (
      <div className="ai-discover-container">
        {/* Comprehensive Progress Header */}
        <ProgressHeader
          containerType="DISCOVER"
          title="Choose Your Path"
          career={career}
          skill={skill?.skill_name}
          subject={skill?.subject}
          progress={40}
          currentPhase="Discovery Paths"
          totalPhases={5}
          showBackButton={true}
          backPath="/app/dashboard"
          showThemeToggle={false}
          hideOnLoading={true}
          isLoading={loading}
        />
        <div className={`${practiceStyles.practicePhase} ${onBack ? 'with-header' : ''}`}>
          <header className={practiceStyles.practiceHeader}>
            <h1>🗺️ Discovery Paths</h1>
            <p>Choose your exploration adventure for {skill.skill_name}!</p>
          </header>

          <div className={questionStyles.answerGrid}>
            {content.discovery_paths.map((path, index) => (
              <div 
                key={index} 
                className={`${questionStyles.questionCard} ${selectedPath === index ? questionStyles.selected : ''}`}
                onClick={() => handlePathSelection(index)}
              >
                <div className={questionStyles.questionIcon}>{path.icon}</div>
                <h3 className={questionStyles.questionTitle}>{path.title}</h3>
                <p className={questionStyles.questionText}>{path.description}</p>
                <div className={questionStyles.questionHint}>
                  <strong>You'll discover:</strong>
                  <p>{path.preview}</p>
                </div>
                <button className={`${buttonStyles.secondary} ${buttonStyles.small}`}>
                  Explore This Path →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // ACTIVITIES PHASE
  // ================================================================

  if (phase === 'activities' && selectedPath !== null) {
    const path = content.discovery_paths[selectedPath];
    const activity = path.activities[currentActivity];

    return renderWithDock(
      <div className="ai-discover-container">
        {/* Comprehensive Progress Header */}
        <ProgressHeader
          containerType="DISCOVER"
          title="Discovery Activities"
          career={career}
          skill={skill?.skill_name}
          subject={skill?.subject}
          progress={60 + (currentActivity / path.activities.length) * 20}
          currentPhase="Activities"
          totalPhases={5}
          showBackButton={true}
          backPath="/app/dashboard"
          showThemeToggle={false}
          hideOnLoading={true}
          isLoading={loading}
        />
        <div className={`${practiceStyles.practicePhase} ${onBack ? 'with-header' : ''}`}>
          <header className={practiceStyles.practiceHeader}>
            <h1>{path.title}</h1>
            <div className={practiceStyles.questionCounter}>
              Activity {currentActivity + 1} of {path.activities.length}
            </div>
          </header>

          <div className={questionStyles.questionCard}>
            <div className={questionStyles.questionHeader}>
              <span className={questionStyles.questionBadge}>{activity.type}</span>
              <h2>{activity.title}</h2>
            </div>

            <div className={questionStyles.questionContent}>
              <p className={questionStyles.questionText}>{activity.description}</p>
              
              {activity.interactive_element && (
                <div className={questionStyles.interactiveSection}>
                  <h3>🎮 Interactive Discovery</h3>
                  <p>{activity.interactive_element}</p>
                </div>
              )}

              {activity.exploration_prompt && (
                <div className={questionStyles.questionPrompt}>
                  <h3>🔍 Explore This</h3>
                  <p>{activity.exploration_prompt}</p>
                </div>
              )}

              {activity.creative_challenge && (
                <div className={questionStyles.challengeSection}>
                  <h3>🎨 Creative Challenge</h3>
                  <p>{activity.creative_challenge}</p>
                </div>
              )}

              <div className={feedbackStyles.info}>
                <strong>Discovery Goal:</strong> {activity.learning_objective}
              </div>
            </div>

            <div className={practiceStyles.practiceNavigation}>
              <button
                onClick={() => handleActivityComplete(currentActivity)}
                className={`${buttonStyles.primary} ${buttonStyles.discoverVariant}`}
              >
                {completedActivities[currentActivity] ? '✅ Completed' : 'Complete Discovery'}
              </button>
            </div>
          </div>

          {allActivitiesComplete && (
            <div className={completionStyles.completionCard}>
              <h2>🎉 Path Complete!</h2>
              <p>Amazing discoveries on this journey!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ================================================================
  // REFLECTION PHASE
  // ================================================================

  if (phase === 'reflection') {
    return (
      <div className="ai-discover-container">
        {/* Comprehensive Progress Header */}
        <ProgressHeader
          containerType="DISCOVER"
          title="Reflection Time"
          career={career}
          skill={skill?.skill_name}
          subject={skill?.subject}
          progress={90}
          currentPhase="Reflection"
          totalPhases={5}
          showBackButton={true}
          backPath="/app/dashboard"
          showThemeToggle={false}
          hideOnLoading={true}
          isLoading={loading}
        />
        <div className={`reflection-phase ${onBack ? 'with-header' : ''}`}>
          <header className="phase-header">
            <h1>🌟 Reflection Time</h1>
            <p>Think about your amazing discoveries!</p>
          </header>

          <div className={completionStyles.completionCard}>
            <h2 className={completionStyles.completionTitle}>Your Discovery Journey</h2>
            <div className={completionStyles.performanceStats}>
              <div className={completionStyles.statCard}>
                <span className={completionStyles.statIcon}>📝</span>
                <span className={completionStyles.statValue}>{questionsAsked.current}</span>
                <span className={completionStyles.statLabel}>Questions Asked</span>
              </div>
              <div className={completionStyles.statCard}>
                <span className={completionStyles.statIcon}>🗺️</span>
                <span className={completionStyles.statValue}>{topicsExplored.current.size}</span>
                <span className={completionStyles.statLabel}>Topics Explored</span>
              </div>
              <div className={completionStyles.statCard}>
                <span className={completionStyles.statIcon}>💡</span>
                <span className={completionStyles.statValue}>{discoveries.length}</span>
                <span className={completionStyles.statLabel}>Discoveries Made</span>
              </div>
              <div className={completionStyles.statCard}>
                <span className={completionStyles.statIcon}>🔗</span>
                <span className={completionStyles.statValue}>{connections.length}</span>
                <span className={completionStyles.statLabel}>Connections Found</span>
              </div>
            </div>
          </div>

          <div className="reflection-questions">
            {content.reflection_questions.map((question, index) => (
              <div key={index} className="reflection-question">
                <h3>{question}</h3>
                <textarea
                  placeholder="Share your thoughts..."
                  value={reflectionAnswers[index] || ''}
                  onChange={(e) => handleReflectionAnswer(index, e.target.value)}
                  className="reflection-input"
                />
              </div>
            ))}
          </div>

          {Object.keys(reflectionAnswers).length === content.reflection_questions.length && (
            <div className="reflection-complete">
              <h2>✨ Wonderful Reflections!</h2>
              <p>You've made amazing connections!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Note: Completion phase removed - MultiSubjectContainer now shows JourneyCelebrationScreen

  return null;
};

// ================================================================
// STYLES
// ================================================================

const inlineStyles = `
.ai-discover-container {
  /* Width now controlled by DiscoverContainer.css - matches ExperienceContainer */
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #8b5cf6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 2rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes slideUp {
  from {
    transform: translateX(-50%) translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateX(20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.loading-details {
  margin-top: 2rem;
  color: #666;
}

.loading-details p {
  margin: 0.5rem 0;
}

.phase-header {
  text-align: center;
  margin-bottom: 3rem;
}

.phase-header h1 {
  color: #1f2937;
  margin-bottom: 1rem;
}

.discovery-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  font-weight: 600;
}

.badge-icon {
  font-size: 1.2rem;
}

.big-idea-section, .exploration-hook-section, .curiosity-questions-section {
  background: #f3e8ff;
  border: 2px solid #8b5cf6;
  padding: 2rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
}

.big-idea-text, .hook-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #5b21b6;
}

.curiosity-questions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.curiosity-question {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.curiosity-question:hover {
  transform: translateX(10px);
  background: #faf5ff;
}

.question-icon {
  font-size: 1.5rem;
}

.question-text {
  flex: 1;
  color: #4c1d95;
}

.discovery-paths-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.discovery-path-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.discovery-path-card:hover {
  border-color: #8b5cf6;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.2);
}

.path-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.path-title {
  color: #1f2937;
  margin-bottom: 1rem;
}

.path-description {
  color: #6b7280;
  margin-bottom: 1.5rem;
}

.path-preview {
  background: #faf5ff;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.path-preview strong {
  color: #7c3aed;
  display: block;
  margin-bottom: 0.5rem;
}

.select-path-button {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.select-path-button:hover {
  transform: translateY(-2px);
}

.activity-container {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.activity-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.activity-type-badge {
  background: #8b5cf6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.activity-content {
  margin-bottom: 2rem;
}

.activity-description {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.interactive-element, .exploration-prompt, .creative-challenge {
  background: #faf5ff;
  border-left: 4px solid #8b5cf6;
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.interactive-element h3, .exploration-prompt h3, .creative-challenge h3 {
  color: #7c3aed;
  margin-bottom: 1rem;
}

.learning-objective {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-top: 1.5rem;
}

.complete-activity-button {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.complete-activity-button:hover {
  transform: translateY(-2px);
}

.path-complete {
  text-align: center;
  background: #ecfdf5;
  border: 2px solid #10b981;
  padding: 2rem;
  border-radius: 1rem;
  margin-top: 2rem;
}

.progress-indicator {
  background: #e5e7eb;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  display: inline-block;
  color: #6b7280;
  font-weight: 500;
}

.reflection-phase {
  padding: 2rem;
}

.discoveries-summary {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.stat {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #7c3aed;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.reflection-questions {
  margin: 2rem 0;
}

.reflection-question {
  background: white;
  padding: 1.5rem;
  border-radius: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.reflection-question h3 {
  color: #1f2937;
  margin-bottom: 1rem;
}

.reflection-input {
  width: 100%;
  min-height: 100px;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
}

.reflection-input:focus {
  outline: none;
  border-color: #8b5cf6;
}

.reflection-complete {
  text-align: center;
  background: #f3e8ff;
  border: 2px solid #8b5cf6;
  padding: 2rem;
  border-radius: 1rem;
  margin-top: 2rem;
}

.completion-phase {
  text-align: center;
  padding: 2rem;
}

.completion-summary {
  margin: 3rem 0;
}

.discovery-achievements, .rewards-showcase, .discovery-portfolio {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  margin: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.discovery-achievements ul, .discovery-portfolio ul {
  text-align: left;
  max-width: 500px;
  margin: 1rem auto 0;
  padding-left: 1.5rem;
}

.discovery-achievements li, .discovery-portfolio li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.rewards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.reward-item {
  background: #faf5ff;
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
  font-weight: 500;
}

.primary-button, .next-journey-button {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.primary-button:hover, .next-journey-button:hover {
  transform: translateY(-2px);
}

.phase-actions, .completion-actions, .activity-actions {
  text-align: center;
  margin-top: 3rem;
}

.scaffolding-indicator {
  transition: background 0.3s ease;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = inlineStyles;
  document.head.appendChild(styleElement);
}

// Export with alias for compatibility
export { AIDiscoverContainerV2UNIFIED as AIDiscoverContainerV2 };
export default AIDiscoverContainerV2UNIFIED;