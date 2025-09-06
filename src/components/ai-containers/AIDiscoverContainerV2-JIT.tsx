/**
 * AI DISCOVER CONTAINER V2 - JIT INTEGRATION
 * Phase 3.2.3: Discovery Container with Just-In-Time Content Generation
 * 
 * This refactored version integrates with our JIT content generation system:
 * - Uses JustInTimeContentService for on-demand content generation
 * - Leverages DailyLearningContextManager for consistent career/skill focus
 * - Tracks performance with PerformanceTracker
 * - Manages session state with SessionStateManager
 * - Validates consistency with ConsistencyValidator
 */

import React, { useState, useEffect, useRef } from 'react';
import { StudentProfile, LearningSkill } from '../../services/AILearningJourneyService';
import { unifiedLearningAnalyticsService } from '../../services/unifiedLearningAnalyticsService';
import { voiceManagerService } from '../../services/voiceManagerService';
import { useAICharacter } from '../ai-characters/AICharacterProvider';
import { AICharacterAvatar } from '../ai-characters/AICharacterAvatar';
import { ContainerNavigationHeader } from './ContainerNavigationHeader';
import { FloatingLearningDock } from '../learning-support/FloatingLearningDock';
import { CompanionChatBox } from '../learning-support/CompanionChatBox';
import { useTheme } from '../../hooks/useTheme';

// JIT System Integration
import { DailyLearningContextManager } from '../../services/content/DailyLearningContextManager';
import { JustInTimeContentService } from '../../services/content/JustInTimeContentService';
import { PerformanceTracker } from '../../services/content/PerformanceTracker';
import { SessionStateManager } from '../../services/content/SessionStateManager';
import { ConsistencyValidator } from '../../services/content/ConsistencyValidator';
import { QuestionRenderer } from '../../services/content/QuestionRenderer';
import { BaseQuestion, Question } from '../../services/content/QuestionTypes';
import { questionValidator, ValidationResult } from '../../services/content/QuestionValidator';

// Import CSS modules
import '../../styles/containers/DiscoverContainer.css';
import questionStyles from '../../styles/shared/components/QuestionCard.module.css';
import lessonStyles from '../../styles/shared/screens/LessonScreen.module.css';
import practiceStyles from '../../styles/shared/screens/PracticeScreen.module.css';
import completionStyles from '../../styles/shared/screens/CompletionScreen.module.css';
import loadingStyles from '../../styles/shared/screens/LoadingScreen.module.css';
import feedbackStyles from '../../styles/shared/components/FeedbackMessages.module.css';
import buttonStyles from '../../styles/shared/components/NavigationButtons.module.css';
import gamificationStyles from '../../styles/shared/components/GamificationElements.module.css';

// ================================================================
// COMPONENT INTERFACES  
// ================================================================

interface AIDiscoverContainerV2Props {
  student: StudentProfile;
  skill: LearningSkill;
  selectedCharacter?: string;
  selectedCareer?: any;
  onComplete: (success: boolean) => void;
  onNext?: () => void;
  onBack?: () => void;
  userId?: string;
}

type DiscoverPhase = 'loading' | 'exploration_intro' | 'discovery_paths' | 'activities' | 'reflection' | 'complete';

interface DiscoveryPath {
  id: string;
  title: string;
  description: string;
  icon: string;
  preview: string;
  activities: DiscoveryActivity[];
  careerConnection?: string;
}

interface DiscoveryActivity {
  id: string;
  type: 'exploration' | 'investigation' | 'experiment' | 'creation';
  title: string;
  description: string;
  challenge: BaseQuestion;
  interactive_element?: string;
  exploration_prompt?: string;
  creative_challenge?: string;
  learning_objective: string;
  realWorldExample?: string;
}

interface DiscoveryMetrics {
  questionsAsked: number;
  topicsExplored: Set<string>;
  discoveriesMade: string[];
  connectionsMade: string[];
  curiosityLevel: 'low' | 'medium' | 'high';
  explorationTime: number;
}

// ================================================================
// JIT SERVICE INSTANCES (SINGLETONS)
// ================================================================

const dailyContextManager = DailyLearningContextManager.getInstance();
const jitService = JustInTimeContentService.getInstance();
const performanceTracker = PerformanceTracker.getInstance();
const sessionManager = SessionStateManager.getInstance();
const consistencyValidator = ConsistencyValidator.getInstance();
const questionRenderer = QuestionRenderer.getInstance();

// ================================================================
// AI DISCOVER CONTAINER V2 - JIT COMPONENT
// ================================================================

export const AIDiscoverContainerV2: React.FC<AIDiscoverContainerV2Props> = ({
  student,
  skill,
  selectedCharacter,
  selectedCareer,
  onComplete,
  onNext,
  onBack,
  userId
}) => {
  const theme = useTheme();
  
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
  
  // ================================================================
  // STATE MANAGEMENT
  // ================================================================
  
  const [phase, setPhase] = useState<DiscoverPhase>('loading');
  const [discoveryPaths, setDiscoveryPaths] = useState<DiscoveryPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<number | null>(null);
  const [currentActivity, setCurrentActivity] = useState(0);
  const [completedActivities, setCompletedActivities] = useState<Record<string, boolean>>({});
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<number, string>>({});
  const [allActivitiesComplete, setAllActivitiesComplete] = useState(false);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [companionMessage, setCompanionMessage] = useState<{ text: string; emotion: string } | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  
  // Discovery metrics for tracking curiosity
  const [metrics, setMetrics] = useState<DiscoveryMetrics>({
    questionsAsked: 0,
    topicsExplored: new Set(),
    discoveriesMade: [],
    connectionsMade: [],
    curiosityLevel: 'medium',
    explorationTime: 0
  });
  
  // Content generation state
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [reflectionQuestions, setReflectionQuestions] = useState<string[]>([]);
  
  // Refs for tracking
  const containerId = useRef(`discover-${Date.now()}`);
  const explorationStartTime = useRef<number>(Date.now());
  const activityStartTime = useRef<number>(Date.now());
  
  // ================================================================
  // JIT CONTENT GENERATION
  // ================================================================
  
  useEffect(() => {
    generateDiscoveryContent();
  }, [skill, student]);
  
  const generateDiscoveryContent = async () => {
    try {
      // Ensure daily context exists and is consistent
      let dailyContext = dailyContextManager.getCurrentContext();
      if (!dailyContext) {
        dailyContext = dailyContextManager.createDailyContext({
          id: student.id,
          grade: student.grade_level,
          currentSkill: skill,
          selectedCareer: selectedCareer,
          companion: currentCharacter
        });
      }
      
      // Track container start in session
      sessionManager.trackContainerProgression(
        student.id,
        containerId.current,
        'discover',
        skill.subject
      );
      
      // Get performance context for adaptive content
      const performanceContext = performanceTracker.getPerformanceContext(student.id);
      
      // Generate JIT content for discovery
      const content = await jitService.generateContainerContent({
        userId: student.id,
        container: containerId.current,
        containerType: 'discover',
        subject: skill.subject,
        grade: student.grade_level,
        performanceContext,
        timeConstraint: 15, // 15 minutes for discovery
        forceRegenerate: false
      });
      
      setGeneratedContent(content);
      
      // Transform questions into discovery paths
      const paths = createDiscoveryPaths(content.questions, dailyContext);
      setDiscoveryPaths(paths);
      
      // Generate reflection questions
      const reflections = generateReflectionQuestions(skill, dailyContext);
      setReflectionQuestions(reflections);
      
      // Validate consistency
      const consistencyReport = consistencyValidator.validateCrossSubjectCoherence(
        content.questions,
        dailyContext
      );
      
      if (!consistencyReport.isConsistent) {
        console.warn('Consistency issues detected, auto-correcting...');
        content.questions = content.questions.map(q => 
          consistencyValidator.enforceConsistency(q, dailyContext)
        );
      }
      
      // Track analytics
      await unifiedLearningAnalyticsService.trackLearningEvent({
        studentId: student.id,
        sessionId: containerId.current,
        eventType: 'discovery_start',
        metadata: {
          grade: student.grade_level,
          subject: skill.subject,
          skill: skill.skill_name,
          container: 'discover_v2_jit',
          career: dailyContext.selectedCareer?.name,
          companion: dailyContext.companion?.name
        }
      });
      
      setPhase('exploration_intro');
      
      // Preload next container content
      jitService.preloadNextContainer(student.id, 'discover');
      
    } catch (error) {
      console.error('❌ Failed to generate JIT discovery content:', error);
      // Fallback to basic content
      setDiscoveryPaths(createFallbackPaths(skill));
      setPhase('exploration_intro');
    }
  };
  
  // ================================================================
  // DISCOVERY PATH CREATION
  // ================================================================
  
  const createDiscoveryPaths = (questions: BaseQuestion[], context: any): DiscoveryPath[] => {
    const pathTypes = ['exploration', 'investigation', 'experiment'];
    const pathIcons = ['🔍', '🔬', '🧪'];
    const pathCount = Math.min(3, Math.ceil(questions.length / 3));
    
    const paths: DiscoveryPath[] = [];
    const questionsPerPath = Math.ceil(questions.length / pathCount);
    
    for (let i = 0; i < pathCount; i++) {
      const startIdx = i * questionsPerPath;
      const endIdx = Math.min(startIdx + questionsPerPath, questions.length);
      const pathQuestions = questions.slice(startIdx, endIdx);
      
      const path: DiscoveryPath = {
        id: `path-${i}`,
        title: `${context.selectedCareer?.name || 'Discovery'} ${pathTypes[i] || 'Path'} ${i + 1}`,
        description: `Explore ${skill.skill_name} through ${pathTypes[i] || 'discovery'} activities`,
        icon: pathIcons[i] || '🚀',
        preview: `${pathQuestions.length} exciting activities to discover!`,
        activities: pathQuestions.map((q, idx) => createDiscoveryActivity(q, idx, context)),
        careerConnection: context.selectedCareer?.name
      };
      
      paths.push(path);
    }
    
    return paths;
  };
  
  const createDiscoveryActivity = (question: BaseQuestion, index: number, context: any): DiscoveryActivity => {
    const activityTypes: Array<'exploration' | 'investigation' | 'experiment' | 'creation'> = 
      ['exploration', 'investigation', 'experiment', 'creation'];
    
    return {
      id: `activity-${index}`,
      type: activityTypes[index % 4],
      title: `Discovery ${index + 1}: ${question.topic || skill.skill_name}`,
      description: question.content,
      challenge: question,
      interactive_element: `Interact with this ${question.type} challenge`,
      exploration_prompt: `Explore how ${context.selectedCareer?.name || 'professionals'} use this concept`,
      creative_challenge: index % 2 === 0 ? 'Create your own example!' : undefined,
      learning_objective: `Master ${question.topic || skill.skill_name} through discovery`,
      realWorldExample: context.selectedCareer ? 
        `${context.selectedCareer.name} professionals use this daily` : undefined
    };
  };
  
  const createFallbackPaths = (skill: LearningSkill): DiscoveryPath[] => {
    return [{
      id: 'fallback-path',
      title: 'Discovery Journey',
      description: `Explore ${skill.skill_name}`,
      icon: '🔍',
      preview: 'Exciting discoveries await!',
      activities: [{
        id: 'fallback-activity',
        type: 'exploration',
        title: 'Discovery Activity',
        description: 'Explore and learn!',
        challenge: {
          id: 'fallback-q',
          type: 'open_ended',
          content: `What do you want to discover about ${skill.skill_name}?`,
          topic: skill.skill_name,
          difficulty: 'medium',
          points: 10
        } as BaseQuestion,
        learning_objective: `Learn about ${skill.skill_name}`
      }]
    }];
  };
  
  const generateReflectionQuestions = (skill: LearningSkill, context: any): string[] => {
    return [
      `What was the most exciting discovery you made about ${skill.skill_name}?`,
      `How might a ${context.selectedCareer?.name || 'professional'} use what you discovered?`,
      `What questions do you still have about ${skill.skill_name}?`,
      `What connections did you make to things you already knew?`
    ];
  };
  
  // ================================================================
  // CURIOSITY TRACKING
  // ================================================================
  
  const trackCuriosity = (action: string, data?: any) => {
    setMetrics(prev => {
      const updated = { ...prev };
      
      if (action === 'question_asked') {
        updated.questionsAsked++;
        if (data?.question) {
          updated.connectionsMade.push(data.question);
        }
      } else if (action === 'topic_explored') {
        updated.topicsExplored.add(data?.topic || 'unknown');
      } else if (action === 'discovery_made') {
        updated.discoveriesMade.push(data?.discovery || 'discovery');
      } else if (action === 'connection_made') {
        updated.connectionsMade.push(data?.connection || 'connection');
      }
      
      // Update curiosity level based on interactions
      const totalInteractions = updated.questionsAsked + 
        updated.topicsExplored.size + 
        updated.discoveriesMade.length;
      
      if (totalInteractions > 15) {
        updated.curiosityLevel = 'high';
      } else if (totalInteractions > 7) {
        updated.curiosityLevel = 'medium';
      } else {
        updated.curiosityLevel = 'low';
      }
      
      return updated;
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
    if (phase === 'exploration_intro' && !hasGreeted && currentCharacter) {
      setHasGreeted(true);
      const dailyContext = dailyContextManager.getCurrentContext();
      const greeting = `Welcome to your discovery journey, ${student.display_name}! Let's explore ${skill.skill_name} together and see how ${dailyContext?.selectedCareer?.name || 'professionals'} use it!`;
      setCompanionMessage({ text: greeting, emotion: 'excited' });
      readTextAloud(greeting);
      trackCuriosity('exploration_started', { skill: skill.skill_name });
    }
  }, [phase, hasGreeted, currentCharacter]);
  
  // ================================================================
  // NAVIGATION HANDLERS
  // ================================================================
  
  const handleExplorationIntroComplete = () => {
    const timeSpent = (Date.now() - explorationStartTime.current) / 1000;
    
    // Track phase completion
    unifiedLearningAnalyticsService.trackLearningEvent({
      studentId: student.id,
      sessionId: containerId.current,
      eventType: 'exploration_intro_complete',
      metadata: {
        grade: student.grade_level,
        subject: skill.subject,
        skill: skill.skill_name,
        container: 'discover_v2_jit',
        duration: timeSpent
      }
    });
    
    explorationStartTime.current = Date.now();
    setPhase('discovery_paths');
  };
  
  const handlePathSelection = (pathIndex: number) => {
    setSelectedPath(pathIndex);
    
    // Track path selection
    const path = discoveryPaths[pathIndex];
    trackCuriosity('topic_explored', { topic: path.title });
    
    // Update companion message
    const dailyContext = dailyContextManager.getCurrentContext();
    const message = `Great choice! Let's explore ${path.title} and see how ${dailyContext?.selectedCareer?.name || 'professionals'} use these concepts!`;
    setCompanionMessage({ text: message, emotion: 'excited' });
    readTextAloud(message);
    
    activityStartTime.current = Date.now();
    setPhase('activities');
  };
  
  const handleActivityComplete = async (activity: DiscoveryActivity, success: boolean) => {
    const timeSpent = (Date.now() - activityStartTime.current) / 1000;
    
    // Track performance
    performanceTracker.trackQuestionPerformance(
      student.id,
      activity.challenge,
      {
        correct: success,
        timeSpent,
        hintsUsed: 0,
        attempts: 1,
        containerType: 'discover',
        activityType: activity.type
      }
    );
    
    // Mark activity complete
    setCompletedActivities(prev => ({ ...prev, [activity.id]: true }));
    
    // Track discovery
    trackCuriosity('discovery_made', { 
      discovery: `Completed ${activity.type}: ${activity.title}` 
    });
    
    // Check if all activities in path are complete
    if (selectedPath !== null) {
      const path = discoveryPaths[selectedPath];
      const allComplete = path.activities.every(a => 
        completedActivities[a.id] || a.id === activity.id
      );
      
      if (allComplete) {
        setAllActivitiesComplete(true);
        
        // Auto-advance to reflection after delay
        setTimeout(() => {
          setPhase('reflection');
        }, 3000);
      } else {
        // Move to next activity
        setCurrentActivity(prev => prev + 1);
        activityStartTime.current = Date.now();
      }
    }
    
    // Track analytics
    await unifiedLearningAnalyticsService.trackLearningEvent({
      studentId: student.id,
      sessionId: containerId.current,
      eventType: 'discovery_activity_complete',
      metadata: {
        grade: student.grade_level,
        subject: skill.subject,
        skill: skill.skill_name,
        container: 'discover_v2_jit',
        activity_number: currentActivity + 1,
        activity_type: activity.type,
        success,
        time_spent: timeSpent,
        curiosity_level: metrics.curiosityLevel
      }
    });
  };
  
  const handleReflectionAnswer = (questionIndex: number, answer: string) => {
    setReflectionAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    
    // Track reflection as connection making
    trackCuriosity('connection_made', { 
      connection: `Reflection: ${answer.substring(0, 50)}...` 
    });
    
    // Check if all reflections are complete
    const allAnswered = reflectionQuestions.every((_, index) => 
      reflectionAnswers[index] || index === questionIndex
    );
    
    if (allAnswered) {
      // Complete the container
      sessionManager.completeContainer(student.id, containerId.current);
      
      // Get final performance summary
      const summary = performanceTracker.getPerformanceAnalytics(student.id);
      console.log('Discovery Performance Summary:', summary);
      
      setTimeout(() => {
        setPhase('complete');
        onComplete(true);
      }, 2000);
    }
  };
  
  // ================================================================
  // HINT SYSTEM
  // ================================================================
  
  const handleHintRequest = async (hintLevel: 'free' | 'basic' | 'detailed') => {
    let hint = '';
    const dailyContext = dailyContextManager.getCurrentContext();
    
    if (phase === 'activities' && selectedPath !== null) {
      const path = discoveryPaths[selectedPath];
      const activity = path.activities[currentActivity];
      
      if (hintLevel === 'free') {
        hint = `Think about how ${dailyContext?.selectedCareer?.name || 'professionals'} might approach this...`;
      } else if (hintLevel === 'basic') {
        hint = activity.exploration_prompt || 'Explore and experiment!';
      } else if (hintLevel === 'detailed') {
        hint = activity.learning_objective;
      }
    } else if (phase === 'discovery_paths') {
      hint = `Choose a path that interests you most about ${skill.skill_name}`;
    } else if (phase === 'reflection') {
      hint = `Think about what you discovered and how ${dailyContext?.selectedCareer?.name || 'professionals'} use it`;
    }
    
    setCurrentHint(hint);
    trackCuriosity('question_asked', { question: `Hint requested: ${hintLevel}` });
    
    // Auto-clear hint after 10 seconds
    setTimeout(() => setCurrentHint(null), 10000);
  };
  
  // ================================================================
  // WRAPPED NAVIGATION HANDLERS
  // ================================================================
  
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
        
        <FloatingLearningDock
          companionName={currentCharacter?.name || selectedCharacter?.charAt(0).toUpperCase() + selectedCharacter?.slice(1) || 'Finn'}
          companionId={currentCharacter?.id || selectedCharacter?.toLowerCase() || 'finn'}
          userId={userId || student?.id || 'default'}
          currentQuestion={phase === 'activities' ? 'Explore and discover!' : undefined}
          currentSkill={skill.skill_name}
          questionNumber={phase === 'activities' ? currentActivity + 1 : undefined}
          totalQuestions={phase === 'activities' && selectedPath !== null ? 
            discoveryPaths[selectedPath].activities.length : 0}
          onRequestHint={handleHintRequest}
          theme={theme}
        />
        
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
            <div>📝 Questions: {metrics.questionsAsked}</div>
            <div>🗺️ Topics: {metrics.topicsExplored.size}</div>
            <div>💡 Discoveries: {metrics.discoveriesMade.length}</div>
            <div>🔗 Connections: {metrics.connectionsMade.length}</div>
            <div className={`${gamificationStyles.curiosityStatus} ${gamificationStyles[metrics.curiosityLevel]}`}>
              Curiosity: {metrics.curiosityLevel.toUpperCase()}
            </div>
          </div>
        </div>
      </>
    );
  };
  
  // ================================================================
  // LOADING STATE
  // ================================================================
  
  if (phase === 'loading') {
    return (
      <div className="ai-discover-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h2>🔍 Preparing your discovery journey...</h2>
          <p>JIT Content Generation Active</p>
          <div className="loading-details">
            <p>🏢 Career: {selectedCareer?.name || 'Explorer'}</p>
            <p>📚 Skill: {skill.skill_name}</p>
            <p>🎯 Subject: {skill.subject}</p>
            <p>👤 Grade: {student.grade_level}</p>
            <p>⚡ Just-In-Time: Enabled</p>
            <p>🔬 Discovery Mode: Active</p>
          </div>
        </div>
      </div>
    );
  }
  
  // ================================================================
  // EXPLORATION INTRODUCTION PHASE
  // ================================================================
  
  if (phase === 'exploration_intro') {
    const dailyContext = dailyContextManager.getCurrentContext();
    
    return (
      <div className="ai-discover-container">
        {onBack && (
          <ContainerNavigationHeader 
            onBack={onBack} 
            title="Discovery Journey JIT" 
            theme={theme}
          />
        )}
        <div className={`exploration-intro-phase ${onBack ? 'with-header' : ''}`}>
          <header className="phase-header">
            <h1>Discover {skill.skill_name}</h1>
            <div className="discovery-badge">
              <span className="badge-icon">🔍</span>
              <span className="badge-text">JIT Discovery Mode</span>
            </div>
          </header>
          
          <section className="big-idea-section">
            <h2>💡 Today's Discovery Mission</h2>
            <div className="big-idea-content">
              <p className="big-idea-text">
                As a future {dailyContext?.selectedCareer?.name || 'professional'}, 
                you'll explore how {skill.skill_name} shapes our world!
              </p>
            </div>
          </section>
          
          <section className="exploration-hook-section">
            <h2>🚀 Your Exploration Quest</h2>
            <div className="exploration-hook">
              <p className="hook-text">
                Discover {discoveryPaths.length} unique pathways to understanding {skill.skill_name}. 
                Each path reveals how {dailyContext?.selectedCareer?.name || 'professionals'} 
                use these concepts every day!
              </p>
            </div>
          </section>
          
          <section className={lessonStyles.lessonSection}>
            <h2>🤔 Wonder Questions</h2>
            <div className={lessonStyles.lessonContent}>
              {reflectionQuestions.slice(0, 3).map((question, index) => (
                <div key={index} className="curiosity-question" onClick={() => {
                  trackCuriosity('question_asked', { question });
                }}>
                  <span className="question-icon">❓</span>
                  <span className="question-text">{question}</span>
                </div>
              ))}
            </div>
          </section>
          
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
        {onBack && (
          <ContainerNavigationHeader 
            onBack={onBack} 
            title="Choose Your Path" 
            theme={theme}
          />
        )}
        <div className={`${practiceStyles.practicePhase} ${onBack ? 'with-header' : ''}`}>
          <header className={practiceStyles.practiceHeader}>
            <h1>🗺️ Discovery Paths</h1>
            <p>Choose your exploration adventure for {skill.skill_name}!</p>
          </header>
          
          <div className={questionStyles.answerGrid}>
            {discoveryPaths.map((path, index) => (
              <div 
                key={path.id} 
                className={`${questionStyles.questionCard} ${selectedPath === index ? questionStyles.selected : ''}`}
                onClick={() => handlePathSelection(index)}
              >
                <div className={questionStyles.questionIcon}>{path.icon}</div>
                <h3 className={questionStyles.questionTitle}>{path.title}</h3>
                <p className={questionStyles.questionText}>{path.description}</p>
                <div className={questionStyles.questionHint}>
                  <strong>You'll discover:</strong>
                  <p>{path.preview}</p>
                  {path.careerConnection && (
                    <p className="career-connection">
                      🏢 {path.careerConnection} Connection
                    </p>
                  )}
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
    const path = discoveryPaths[selectedPath];
    const activity = path.activities[currentActivity];
    
    if (!activity) {
      // All activities complete, move to reflection
      setPhase('reflection');
      return null;
    }
    
    return renderWithDock(
      <div className="ai-discover-container">
        {onBack && (
          <ContainerNavigationHeader 
            onBack={onBack} 
            title={path.title} 
            theme={theme}
          />
        )}
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
              {/* Render the question using QuestionRenderer */}
              {questionRenderer.renderQuestion(
                activity.challenge,
                (answer) => {
                  // Validate the answer using QuestionValidator
                  const validationResult = questionValidator.validateAnswer(activity.challenge as Question, answer);
                  
                  // Show feedback
                  if (validationResult.feedback) {
                    setCompanionMessage({
                      text: validationResult.feedback,
                      emotion: validationResult.isCorrect ? 'excited' : 'encouraging'
                    });
                  }
                  
                  // Complete activity with validation result
                  handleActivityComplete(activity, validationResult.isCorrect || false);
                },
                theme
              )}
              
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
              
              {activity.realWorldExample && (
                <div className={feedbackStyles.info}>
                  <strong>Real World:</strong> {activity.realWorldExample}
                </div>
              )}
              
              <div className={feedbackStyles.info}>
                <strong>Discovery Goal:</strong> {activity.learning_objective}
              </div>
            </div>
            
            <div className={practiceStyles.practiceNavigation}>
              <button
                onClick={() => handleActivityComplete(activity, true)}
                className={`${buttonStyles.primary} ${buttonStyles.discoverVariant}`}
              >
                {completedActivities[activity.id] ? '✅ Completed' : 'Complete Discovery'}
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
        {onBack && (
          <ContainerNavigationHeader 
            onBack={onBack} 
            title="Discovery Reflection" 
            theme={theme}
          />
        )}
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
                <span className={completionStyles.statValue}>{metrics.questionsAsked}</span>
                <span className={completionStyles.statLabel}>Questions Asked</span>
              </div>
              <div className={completionStyles.statCard}>
                <span className={completionStyles.statIcon}>🗺️</span>
                <span className={completionStyles.statValue}>{metrics.topicsExplored.size}</span>
                <span className={completionStyles.statLabel}>Topics Explored</span>
              </div>
              <div className={completionStyles.statCard}>
                <span className={completionStyles.statIcon}>💡</span>
                <span className={completionStyles.statValue}>{metrics.discoveriesMade.length}</span>
                <span className={completionStyles.statLabel}>Discoveries Made</span>
              </div>
              <div className={completionStyles.statCard}>
                <span className={completionStyles.statIcon}>🔗</span>
                <span className={completionStyles.statValue}>{metrics.connectionsMade.length}</span>
                <span className={completionStyles.statLabel}>Connections Found</span>
              </div>
            </div>
          </div>
          
          <div className="reflection-questions">
            {reflectionQuestions.map((question, index) => (
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
          
          {Object.keys(reflectionAnswers).length === reflectionQuestions.length && (
            <div className="reflection-complete">
              <h2>✨ Wonderful Reflections!</h2>
              <p>You've made amazing connections!</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // ================================================================
  // COMPLETION PHASE
  // ================================================================
  
  if (phase === 'complete') {
    const dailyContext = dailyContextManager.getCurrentContext();
    const performanceSummary = performanceTracker.getPerformanceAnalytics(student.id);
    
    return (
      <div className="ai-discover-container">
        {onBack && (
          <ContainerNavigationHeader 
            onBack={onBack} 
            title="Discovery Complete" 
            theme={theme}
          />
        )}
        <div className={`completion-phase ${onBack ? 'with-header' : ''}`}>
          <header className="completion-header">
            <h1>🏆 Discovery Journey Complete!</h1>
            <p>You're an amazing explorer, {student.display_name}!</p>
          </header>
          
          <div className="completion-summary">
            <div className="discovery-achievements">
              <h2>🔍 Your Discovery Achievements:</h2>
              <ul>
                <li>Explored {skill.skill_name} as a future {dailyContext?.selectedCareer?.name}</li>
                <li>Asked {metrics.questionsAsked} curious questions</li>
                <li>Made {metrics.discoveriesMade.length} important discoveries</li>
                <li>Created {metrics.connectionsMade.length} meaningful connections</li>
                <li>Showed {metrics.curiosityLevel} level curiosity!</li>
                <li>Mastery Level: {Math.round(performanceSummary.currentMastery)}%</li>
              </ul>
            </div>
            
            <div className="discovery-portfolio">
              <h2>📂 Your Discovery Portfolio</h2>
              <p>All your discoveries have been saved to review anytime!</p>
              <ul>
                {metrics.discoveriesMade.slice(0, 3).map((discovery, index) => (
                  <li key={index}>{discovery}</li>
                ))}
                {metrics.discoveriesMade.length > 3 && (
                  <li>...and {metrics.discoveriesMade.length - 3} more discoveries!</li>
                )}
              </ul>
            </div>
            
            {performanceSummary.recommendations.length > 0 && (
              <div className="performance-insights">
                <h3>💡 Discovery Insights</h3>
                <ul>
                  {performanceSummary.recommendations.slice(0, 2).map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="completion-actions">
            {onNext && (
              <button
                onClick={handleNavNext}
                className="next-journey-button"
              >
                Continue Learning Journey 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return null;
};

// ================================================================
// STYLES (reuse existing styles from original component)
// ================================================================

const styles = `
.career-connection {
  margin-top: 0.5rem;
  color: #7c3aed;
  font-weight: 600;
}

.performance-insights {
  background: #f0f9ff;
  border: 2px solid #3b82f6;
  padding: 1.5rem;
  border-radius: 1rem;
  margin-top: 2rem;
}

.performance-insights h3 {
  color: #1e40af;
  margin-bottom: 1rem;
}

.performance-insights ul {
  list-style: none;
  padding: 0;
}

.performance-insights li {
  padding: 0.5rem 0;
  color: #3730a3;
}
`;

// Inject additional styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default AIDiscoverContainerV2;