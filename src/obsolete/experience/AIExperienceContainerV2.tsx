/**
 * AI-FIRST EXPERIENCE CONTAINER V2
 * Enhanced version using the ExperienceAIRulesEngine architecture
 * Provides engagement mechanics, interactive simulations, and hands-on activities
 */

import React, { useState, useEffect, useRef } from 'react';
import { aiLearningJourneyService, AIExperienceContent, StudentProfile, LearningSkill } from '../../services/AILearningJourneyService';
import { unifiedLearningAnalyticsService } from '../../services/unifiedLearningAnalyticsService';
import { voiceManagerService } from '../../services/voiceManagerService';
import { companionReactionService } from '../../services/companionReactionService';
import { useAICharacter } from '../ai-characters/AICharacterProvider';
import { AICharacterAvatar } from '../ai-characters/AICharacterAvatar';
import { ContainerNavigationHeader } from './ContainerNavigationHeader';
import { FloatingLearningDock } from '../learning-support/FloatingLearningDock';
import { CompanionChatBox } from '../learning-support/CompanionChatBox';
import { useTheme } from '../../hooks/useTheme';

// Import CSS modules
import '../../styles/containers/ExperienceContainer.css';
import questionStyles from '../../styles/shared/components/QuestionCard.module.css';
import lessonStyles from '../../styles/shared/screens/LessonScreen.module.css';
import practiceStyles from '../../styles/shared/screens/PracticeScreen.module.css';
import completionStyles from '../../styles/shared/screens/CompletionScreen.module.css';
import loadingStyles from '../../styles/shared/screens/LoadingScreen.module.css';
import feedbackStyles from '../../styles/shared/components/FeedbackMessages.module.css';
import buttonStyles from '../../styles/shared/components/NavigationButtons.module.css';
import gamificationStyles from '../../styles/shared/components/GamificationElements.module.css';

// RULES ENGINE INTEGRATION
import { 
  useExperienceRules, 
  useCompanionRules, 
  useGamificationRules,
  useMasterOrchestration,
  useThemeRules 
} from '../../rules-engine/integration/ContainerIntegration';
import { ExperienceContext } from '../../rules-engine/containers/ExperienceAIRulesEngine';

// ================================================================
// COMPONENT INTERFACES
// ================================================================

interface AIExperienceContainerV2Props {
  student: StudentProfile;
  skill: LearningSkill;
  selectedCharacter?: string;
  selectedCareer?: any;
  onComplete: (success: boolean) => void;
  onNext: () => void;
  onBack?: () => void;
  userId?: string;
}

type ExperiencePhase = 'loading' | 'career_intro' | 'real_world' | 'simulation' | 'complete';

// ================================================================
// AI EXPERIENCE CONTAINER V2 COMPONENT
// ================================================================

export const AIExperienceContainerV2: React.FC<AIExperienceContainerV2Props> = ({
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
  
  // Rules Engine Hooks
  const experienceRules = useExperienceRules();
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
    onNext();
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
  
  const [phase, setPhase] = useState<ExperiencePhase>('loading');
  const [content, setContent] = useState<AIExperienceContent | null>(null);
  const [currentConnection, setCurrentConnection] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [challengeAnswers, setChallengeAnswers] = useState<Record<number, number>>({});
  const [showChallengeFeedback, setShowChallengeFeedback] = useState<Record<number, boolean>>({});
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [sessionId] = useState(`experience-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [companionMessage, setCompanionMessage] = useState<{ text: string; emotion: string } | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  
  // Rules Engine State
  const [engagementLevel, setEngagementLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [interactionPreference, setInteractionPreference] = useState<'visual' | 'auditory' | 'kinesthetic'>('visual');
  const [activityDuration, setActivityDuration] = useState(0);
  const [rewards, setRewards] = useState<any[]>([]);
  const [adaptations, setAdaptations] = useState<any>({});
  
  // Refs for timing
  const phaseStartTime = useRef<number>(Date.now());
  const lastInteractionTime = useRef<number>(Date.now());
  
  // ================================================================
  // CONTENT GENERATION WITH RULES ENGINE
  // ================================================================

  useEffect(() => {
    generateContent();
  }, [skill, student]);

  const generateContent = async () => {
    try {
      // Create context for rules engine
      const experienceContext: ExperienceContext = {
        student: {
          id: student.id,
          grade: student.grade_level,
          engagementLevel,
          interactionPreference,
          attentionSpan: getAttentionSpanForGrade(student.grade_level)
        },
        activity: {
          type: 'simulation',
          subject: skill.subject,
          topic: skill.skill_name,
          duration: 600, // 10 minutes default
          complexity: getComplexityForGrade(student.grade_level)
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
        environment: {
          device: detectDevice(),
          inputMethod: detectInputMethod(),
          screenSize: detectScreenSize()
        }
      };
      
      // Execute rules for adaptations
      const adaptationResults = await experienceRules.execute(experienceContext);
      
      // Process adaptation results
      const adaptationsObj: any = {};
      adaptationResults.forEach(result => {
        if (result.success && result.data) {
          Object.assign(adaptationsObj, result.data);
        }
      });
      setAdaptations(adaptationsObj);
      
      // Track session start with analytics
      await unifiedLearningAnalyticsService.trackLearningEvent({
        studentId: student.id,
        sessionId,
        eventType: 'experience_start',
        metadata: {
          grade: student.grade_level,
          subject: skill.subject,
          skill: skill.skill_name,
          container: 'experience_v2',
          rules_engine: true,
          adaptations: adaptationsObj
        }
      });

      // Generate content with AI service
      const generatedContent = await aiLearningJourneyService.generateExperienceContent(
        skill, 
        student, 
        selectedCareer
      );
      
      // Apply career theming from rules engine
      if (adaptationsObj.career && adaptationsObj.theme) {
        generatedContent.theme = adaptationsObj.theme;
      }
      
      setContent(generatedContent);
      setPhase('career_intro');
      
      // Get companion greeting from rules engine
      if (companionRules) {
        const greeting = await companionRules.getCompanionMessage(
          currentCharacter?.id || 'finn',
          selectedCareer?.name || 'Explorer',
          'experience_start',
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
      console.error('❌ Failed to generate AI Experience content:', error);
    }
  };

  // ================================================================
  // ENGAGEMENT TRACKING WITH RULES ENGINE
  // ================================================================
  
  const trackEngagement = async () => {
    const timeSinceLastInteraction = Date.now() - lastInteractionTime.current;
    
    // Determine engagement level based on interaction patterns
    if (timeSinceLastInteraction > 30000) { // 30 seconds idle
      setEngagementLevel('low');
    } else if (timeSinceLastInteraction < 5000) { // Active within 5 seconds
      setEngagementLevel('high');
    } else {
      setEngagementLevel('medium');
    }
    
    // Get engagement adaptations from rules engine using the hook methods
    const currentEngagementLevel = engagementLevel || 'medium';
    const activityType = phase === 'simulation' ? 'simulation' : 'interactive';
    
    try {
      // Use the adaptExperience method from the hook
      const adaptations = await experienceRules.adaptExperience(
        currentEngagementLevel as 'low' | 'medium' | 'high',
        activityType,
        student.grade_level
      );
      
      // Apply adaptations if returned
      if (adaptations && adaptations.adaptations) {
        applyEngagementAdaptations(adaptations.adaptations);
      }
      
      // Also track metrics
      const metrics = experienceRules.getEngagementMetrics(student.id);
      console.log('📊 Experience engagement metrics:', metrics);
    } catch (error) {
      console.warn('Failed to track engagement:', error);
    }
  };
  
  // Track engagement every 10 seconds
  useEffect(() => {
    const interval = setInterval(trackEngagement, 10000);
    return () => clearInterval(interval);
  }, [engagementLevel, phase]);

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
  
  // Greet on career intro phase
  useEffect(() => {
    if (phase === 'career_intro' && content && !hasGreeted && currentCharacter) {
      setHasGreeted(true);
      const greeting = adaptations.feedback?.greeting || 
        `Welcome to your career experience, ${student.display_name}! Today you'll be a ${selectedCareer?.name || 'professional'} using ${skill.skill_name}!`;
      readTextAloud(greeting);
    }
  }, [phase, content, hasGreeted, currentCharacter]);
  
  // ================================================================
  // NAVIGATION HANDLERS WITH RULES ENGINE
  // ================================================================

  const handleCareerIntroComplete = async () => {
    // Track phase completion
    await unifiedLearningAnalyticsService.trackLearningEvent({
      studentId: student.id,
      sessionId,
      eventType: 'career_intro_complete',
      metadata: {
        grade: student.grade_level,
        subject: skill.subject,
        skill: skill.skill_name,
        container: 'experience_v2',
        duration: (Date.now() - phaseStartTime.current) / 1000
      }
    });

    phaseStartTime.current = Date.now();
    setPhase('real_world');
    
    // Update interaction time
    lastInteractionTime.current = Date.now();
  };

  const handleConnectionNext = () => {
    if (!content) return;
    
    lastInteractionTime.current = Date.now();
    
    if (currentConnection < content.real_world_connections.length - 1) {
      setCurrentConnection(currentConnection + 1);
    } else {
      phaseStartTime.current = Date.now();
      setPhase('simulation');
      
      // Apply simulation configuration from rules engine
      if (adaptations.simulation) {
        console.log('Applying simulation configuration:', adaptations.simulation);
      }
    }
  };

  const handleChallengeAnswer = async (challengeIndex: number, answerIndex: number) => {
    if (!content) return;

    lastInteractionTime.current = Date.now();
    
    setChallengeAnswers(prev => ({ ...prev, [challengeIndex]: answerIndex }));
    setShowChallengeFeedback(prev => ({ ...prev, [challengeIndex]: true }));

    const challenge = content.interactive_simulation.challenges[challengeIndex];
    const isCorrect = answerIndex === challenge.correct_choice;
    
    // Create interaction context for rules engine
    const interactionContext: ExperienceContext = {
      student: {
        id: student.id,
        grade: student.grade_level,
        engagementLevel
      },
      activity: {
        type: 'simulation',
        subject: skill.subject,
        topic: skill.skill_name,
        complexity: adaptations.simulation?.complexity || 'moderate'
      },
      interaction: {
        type: 'challenge_answer',
        userActions: ['answer_submitted'],
        feedback: isCorrect ? 'correct' : 'incorrect',
        score: isCorrect ? 100 : 0
      },
      career: selectedCareer ? {
        id: selectedCareer.id || selectedCareer.name?.toLowerCase(),
        name: selectedCareer.name
      } : undefined
    };
    
    // Get feedback and rewards from rules engine
    const feedbackResults = await experienceRules.execute(interactionContext);
    
    // Process feedback and rewards
    let feedbackMessage = '';
    let earnedRewards: any[] = [];
    
    feedbackResults.forEach(result => {
      if (result.ruleId === 'provide_feedback' && result.data) {
        feedbackMessage = result.data.feedback;
      }
      if (result.ruleId === 'generate_rewards' && result.data) {
        earnedRewards = result.data.rewards;
      }
    });
    
    // Update rewards state
    if (earnedRewards.length > 0) {
      setRewards(prev => [...prev, ...earnedRewards]);
      
      // Apply gamification rewards
      if (gamificationRules) {
        for (const reward of earnedRewards) {
          if (reward.type === 'points') {
            await gamificationRules.awardPoints(student.id, reward.value, 'experience_challenge');
          }
        }
      }
    }
    
    // Get companion reaction
    const reaction = companionReactionService.getCompanionReaction(
      isCorrect ? 'correct_answer' : 'incorrect_answer',
      currentCharacter?.id || 'finn',
      {
        skill: skill.skill_name,
        career: selectedCareer?.name,
        attempts: 1
      }
    );
    
    // Show companion message with rules engine feedback
    setCompanionMessage({ 
      text: feedbackMessage || reaction.message, 
      emotion: reaction.emotion 
    });
    
    // Speak feedback
    if (isCorrect) {
      readTextAloud(`${feedbackMessage || reaction.message} ${challenge.outcome}`);
    } else {
      readTextAloud(`${feedbackMessage || reaction.message} Let's think about this differently.`);
    }

    // Track challenge attempt
    await unifiedLearningAnalyticsService.trackLearningEvent({
      studentId: student.id,
      sessionId,
      eventType: 'simulation_challenge',
      metadata: {
        grade: student.grade_level,
        subject: skill.subject,
        skill: skill.skill_name,
        container: 'experience_v2',
        challenge_number: challengeIndex + 1,
        accuracy: isCorrect ? 100 : 0,
        rewards: earnedRewards
      }
    });

    // Auto-advance after feedback
    setTimeout(() => {
      if (challengeIndex < content.interactive_simulation.challenges.length - 1) {
        setCurrentChallenge(challengeIndex + 1);
        setShowChallengeFeedback(prev => ({ ...prev, [challengeIndex]: false }));
      } else {
        setSimulationComplete(true);
        setTimeout(() => {
          setPhase('complete');
          onComplete(true);
        }, 3000);
      }
    }, 4000);
  };

  // ================================================================
  // HINT SYSTEM WITH RULES ENGINE
  // ================================================================
  
  const handleHintRequest = async (hintLevel: 'free' | 'basic' | 'detailed') => {
    let hint = '';
    
    // Get hint from rules engine based on current context
    if (phase === 'simulation' && content?.interactive_simulation.challenges[currentChallenge]) {
      const hintContext: ExperienceContext = {
        student: {
          id: student.id,
          grade: student.grade_level,
          engagementLevel
        },
        activity: {
          type: 'simulation',
          subject: skill.subject,
          topic: skill.skill_name
        },
        interaction: {
          type: 'hint_request',
          userActions: [hintLevel],
          score: calculateCurrentScore()
        }
      };
      
      // Use engagement rules for hints
      const challenge = content.interactive_simulation.challenges[currentChallenge];
      
      if (hintLevel === 'free') {
        hint = adaptations.feedback?.hints?.[0] || 
               `Think about what a professional would do in this situation...`;
      } else if (hintLevel === 'basic') {
        hint = adaptations.feedback?.hints?.[1] || 
               `Consider the most practical approach for this career scenario.`;
      } else if (hintLevel === 'detailed') {
        hint = `The best choice is option ${challenge.correct_choice + 1}. ${challenge.learning_point}`;
      }
    } else if (phase === 'real_world') {
      if (hintLevel === 'free') {
        hint = `Notice how professionals use ${skill.skill_name} in real situations...`;
      } else if (hintLevel === 'basic') {
        hint = `Think about how the skills you learned apply to this career.`;
      } else if (hintLevel === 'detailed') {
        hint = `This shows how ${skill.skill_name} is essential in professional settings.`;
      }
    }
    
    setCurrentHint(hint);
    
    // Track hint usage
    lastInteractionTime.current = Date.now();
    
    // Auto-clear hint after 10 seconds
    setTimeout(() => setCurrentHint(null), 10000);
  };

  // ================================================================
  // HELPER FUNCTIONS
  // ================================================================
  
  const getAttentionSpanForGrade = (grade: string): number => {
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);
    if (gradeNum <= 2) return 5; // 5 minutes
    if (gradeNum <= 5) return 10; // 10 minutes
    return 15; // 15 minutes
  };
  
  const getComplexityForGrade = (grade: string): 'simple' | 'moderate' | 'complex' => {
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);
    if (gradeNum <= 2) return 'simple';
    if (gradeNum <= 5) return 'moderate';
    return 'complex';
  };
  
  const detectDevice = (): 'desktop' | 'tablet' | 'mobile' => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };
  
  const detectInputMethod = (): 'mouse' | 'touch' | 'keyboard' => {
    if ('ontouchstart' in window) return 'touch';
    return 'mouse';
  };
  
  const detectScreenSize = (): 'small' | 'medium' | 'large' => {
    const width = window.innerWidth;
    if (width < 768) return 'small';
    if (width < 1440) return 'medium';
    return 'large';
  };
  
  const calculateCurrentScore = (): number => {
    const totalAnswers = Object.keys(challengeAnswers).length;
    if (totalAnswers === 0) return 0;
    
    let correctAnswers = 0;
    Object.entries(challengeAnswers).forEach(([index, answer]) => {
      const challenge = content?.interactive_simulation.challenges[parseInt(index)];
      if (challenge && answer === challenge.correct_choice) {
        correctAnswers++;
      }
    });
    
    return Math.round((correctAnswers / totalAnswers) * 100);
  };
  
  const applyEngagementAdaptations = (adaptationData: any) => {
    // Apply visual enhancements for low engagement
    if (adaptationData.visuals === 'enhanced') {
      document.documentElement.style.setProperty('--animation-speed', '1.5s');
      document.documentElement.style.setProperty('--visual-emphasis', '1.2');
    }
    
    // Apply difficulty adjustments
    if (adaptationData.difficulty === 'reduced') {
      // Could modify challenge complexity here
      console.log('Reducing difficulty due to low engagement');
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
          currentQuestion={phase === 'simulation' ? content?.interactive_simulation.challenges[currentChallenge]?.description : undefined}
          currentSkill={skill.skill_name}
          questionNumber={phase === 'simulation' ? currentChallenge + 1 : undefined}
          totalQuestions={phase === 'simulation' ? content?.interactive_simulation.challenges?.length || 0 : 0}
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
        
        {/* Display rewards if any */}
        {rewards.length > 0 && (
          <div className={gamificationStyles.rewardsOverlay}>
            <h4>🏆 Rewards Earned!</h4>
            {rewards.map((reward, index) => (
              <div key={index} className={gamificationStyles.rewardItem}>
                {reward.type === 'points' && `+${reward.value} XP`}
                {reward.type === 'badge' && `🎖️ ${reward.value}`}
                {reward.type === 'visual' && `✨ ${reward.value}`}
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
      <div className="ai-experience-container">
        <div className={loadingStyles.loadingContainer}>
          <div className={loadingStyles.spinner}></div>
          <h2>🎯 Creating your career experience...</h2>
          <p>Powered by Experience Rules Engine v2</p>
          <div className={loadingStyles.loadingText}>
            <p>🏢 Career: {selectedCareer?.name || 'Exploring professions'}</p>
            <p>📚 Skill: {skill.skill_name}</p>
            <p>🎯 Subject: {skill.subject}</p>
            <p>👤 Grade: {student.grade_level}</p>
            <p>🤖 Rules Engine: Active</p>
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // CAREER INTRODUCTION PHASE
  // ================================================================

  if (phase === 'career_intro') {
    return (
      <div className="ai-experience-container">
        {onBack && (
          <ContainerNavigationHeader 
            onBack={onBack} 
            title="Career Experience v2" 
            theme={theme}
          />
        )}
        <div className={`${lessonStyles.lessonPhase} ${onBack ? lessonStyles.withHeader : ''}`}>
          <header className="phase-header">
            <h1>{content.title}</h1>
            <div className={lessonStyles.phaseBadge}>
              <span className={lessonStyles.badgeIcon}>🏢</span>
              <span className={lessonStyles.badgeText}>Career Experience</span>
            </div>
          </header>

          <section className={lessonStyles.lessonSection}>
            <h2>🌟 Welcome to Your Career Adventure!</h2>
            <div className={lessonStyles.lessonContent}>
              <p className={lessonStyles.lessonText}>{content.scenario}</p>
            </div>
          </section>

          <section className={lessonStyles.lessonSection}>
            <h2>👥 Meet Your Professional Guide</h2>
            <div className={lessonStyles.lessonContent}>
              <p className={lessonStyles.lessonText}>{content.character_context}</p>
            </div>
          </section>

          <section className={lessonStyles.lessonSection}>
            <h2>🔗 How This Career Uses {skill.skill_name}</h2>
            <div className={lessonStyles.lessonContent}>
              <p className={lessonStyles.lessonText}>{content.career_introduction}</p>
            </div>
          </section>

          {/* Display engagement level indicator */}
          <div className={`${gamificationStyles.engagementIndicator} ${gamificationStyles[engagementLevel]}`}>
            Engagement: {engagementLevel}
          </div>

          <div className={lessonStyles.lessonActions}>
            <button
              onClick={handleCareerIntroComplete}
              className={`${buttonStyles.primary} ${buttonStyles.experienceVariant} ${
                adaptations.interface === 'touch_optimized' ? buttonStyles.touchOptimized : ''
              }`}
            >
              Explore Real-World Applications 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // REAL WORLD CONNECTIONS PHASE
  // ================================================================

  if (phase === 'real_world') {
    const connection = content.real_world_connections[currentConnection];

    return (
      <div className="ai-experience-container">
        {onBack && (
          <ContainerNavigationHeader 
            onBack={onBack} 
            title="Real-World Applications" 
            theme={theme}
          />
        )}
        <div className={`${practiceStyles.practicePhase} ${onBack ? practiceStyles.withHeader : ''}`}>
          <header className="phase-header">
            <h1>🌍 Real-World Applications</h1>
            <div className={practiceStyles.questionCounter}>
              Connection {currentConnection + 1} of {content.real_world_connections.length}
            </div>
          </header>

          <div className={questionStyles.questionCard}>
            <div className="connection-situation">
              <h2>📋 Professional Situation</h2>
              <p>{connection.situation}</p>
            </div>

            <div className="connection-challenge">
              <h2>⚡ The Challenge</h2>
              <p>{connection.challenge}</p>
            </div>

            <div className="connection-solution">
              <h2>💡 Professional Solution</h2>
              <p>{connection.solution_approach}</p>
            </div>

            <div className="connection-learning">
              <h2>🎯 How {skill.skill_name} Helps</h2>
              <p className="learning-connection">{connection.learning_connection}</p>
            </div>
          </div>

          <div className="connection-navigation">
            <div className="connection-dots">
              {content.real_world_connections.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentConnection(index);
                    lastInteractionTime.current = Date.now();
                  }}
                  className={`connection-dot ${index === currentConnection ? 'active' : ''} ${index < currentConnection ? 'completed' : ''} ${adaptations.interface === 'touch_optimized' ? 'touch-optimized' : ''}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleConnectionNext}
              className={`${buttonStyles.primary} ${buttonStyles.experienceVariant} ${adaptations.interface === 'touch_optimized' ? buttonStyles.touchOptimized : ''}`}
            >
              {currentConnection < content.real_world_connections.length - 1 
                ? 'Next Connection →' 
                : 'Start Professional Simulation 🎮'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // INTERACTIVE SIMULATION PHASE
  // ================================================================

  if (phase === 'simulation') {
    const challenge = content.interactive_simulation.challenges[currentChallenge];
    const userAnswer = challengeAnswers[currentChallenge];
    const showFeedback = showChallengeFeedback[currentChallenge];

    return renderWithDock(
      <div className="ai-experience-container">
        {onBack && (
          <ContainerNavigationHeader 
            onBack={onBack} 
            title="Professional Simulation" 
            theme={theme}
          />
        )}
        <div className={`${practiceStyles.practicePhase} ${onBack ? practiceStyles.withHeader : ''}`}>
          <header className="phase-header">
            <h1>🎮 Professional Simulation</h1>
            <div className={lessonStyles.lessonSection}>
              <p>{content.interactive_simulation.setup}</p>
            </div>
            <div className={practiceStyles.questionCounter}>
              Challenge {currentChallenge + 1} of {content.interactive_simulation.challenges.length}
            </div>
          </header>

          <div className={questionStyles.questionCard}>
            <h2 className={questionStyles.questionTitle}>🎯 Your Professional Challenge</h2>
            <p className={questionStyles.questionText}>{challenge.description}</p>
            
            <div className="challenge-choices">
              <h3>What would you do as a professional?</h3>
              {challenge.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !showFeedback && handleChallengeAnswer(currentChallenge, index)}
                  className={`choice-button ${
                    userAnswer === index ? 'selected' : ''
                  } ${
                    showFeedback && index === challenge.correct_choice ? 'correct' : ''
                  } ${
                    showFeedback && userAnswer === index && index !== challenge.correct_choice ? 'incorrect' : ''
                  } ${
                    adaptations.interface === 'touch_optimized' ? buttonStyles.touchOptimized : ''
                  }`}
                  disabled={showFeedback}
                >
                  {option}
                </button>
              ))}
            </div>

            {showFeedback && (
              <div className={`challenge-feedback ${userAnswer === challenge.correct_choice ? 'correct' : 'learning'}`}>
                <div className="feedback-result">
                  {userAnswer === challenge.correct_choice 
                    ? '🎉 Excellent professional judgment!' 
                    : '💡 Great learning opportunity!'}
                </div>
                <div className="feedback-outcome">
                  <strong>What happens:</strong> {challenge.outcome}
                </div>
                <div className="feedback-learning">
                  <strong>Professional insight:</strong> {challenge.learning_point}
                </div>
              </div>
            )}
          </div>

          {simulationComplete && (
            <div className={completionStyles.completionCard}>
              <h2>🏆 Simulation Complete!</h2>
              <p>{content.interactive_simulation.conclusion}</p>
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
    return (
      <div className="ai-experience-container">
        {onBack && (
          <ContainerNavigationHeader 
            onBack={onBack} 
            title="Experience Complete" 
            theme={theme}
          />
        )}
        <div className={`${completionStyles.completionPhase} ${onBack ? completionStyles.withHeader : ''}`}>
          <header className="completion-header">
            <h1>🎉 Career Experience Complete!</h1>
            <p>You've successfully applied {skill.skill_name} like a professional, {student.display_name}!</p>
          </header>

          <div className="completion-summary">
            <div className="career-mastery">
              <h2>🏢 Professional Skills Developed:</h2>
              <ul>
                <li>Applied {skill.skill_name} in real-world scenarios</li>
                <li>Made professional decisions</li>
                <li>Solved workplace challenges</li>
                <li>Connected learning to career applications</li>
              </ul>
            </div>
            
            {/* Display earned rewards */}
            {rewards.length > 0 && (
              <div className="rewards-summary">
                <h2>🏆 Rewards Earned:</h2>
                <ul>
                  {rewards.map((reward, index) => (
                    <li key={index}>
                      {reward.type === 'points' && `${reward.value} Experience Points`}
                      {reward.type === 'badge' && `Badge: ${reward.value}`}
                      {reward.type === 'visual' && `Animation: ${reward.value}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="next-adventure">
              <h2>🔍 Ready for More Discovery?</h2>
              <p>Now let's explore the amazing world of {skill.skill_name} through discovery and creativity!</p>
            </div>
          </div>

          <div className="completion-actions">
            <button
              onClick={handleNavNext}
              className="next-container-button"
            >
              Continue to Discover 🔍
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// ================================================================
// STYLES
// ================================================================

const styles = `
.ai-experience-container {
  max-width: 900px;
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
  border-top: 3px solid #f59e0b;
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

@keyframes slideDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
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

.career-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  font-weight: 600;
}

.badge-icon {
  font-size: 1.2rem;
}

.scenario-section, .character-section, .career-connection-section {
  background: #fef3c7;
  border: 2px solid #f59e0b;
  padding: 2rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
}

.scenario-text, .character-text, .career-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #92400e;
}

.connection-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.connection-card > div {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.connection-card > div:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.connection-situation h2 {
  color: #6b7280;
  margin-bottom: 1rem;
}

.connection-challenge h2 {
  color: #dc2626;
  margin-bottom: 1rem;
}

.connection-solution h2 {
  color: #059669;
  margin-bottom: 1rem;
}

.connection-learning h2 {
  color: #7c3aed;
  margin-bottom: 1rem;
}

.learning-connection {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid #7c3aed;
  font-weight: 500;
}

.connection-navigation {
  text-align: center;
}

.connection-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.connection-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  background: white;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.connection-dot.active {
  background: #f59e0b;
  color: white;
  border-color: #f59e0b;
}

.connection-dot.completed {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.simulation-intro {
  background: #f0f9ff;
  border: 2px solid #0ea5e9;
  padding: 1.5rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
}

.challenge-scenario {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.challenge-description {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 0.5rem;
  border-left: 4px solid #0ea5e9;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.challenge-choices {
  margin: 2rem 0;
}

.challenge-choices h3 {
  margin-bottom: 1.5rem;
  color: #374151;
}

.choice-button {
  display: block;
  width: 100%;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  font-size: 1rem;
}

.choice-button:hover {
  border-color: #f59e0b;
  background: #fef3c7;
}

.choice-button.selected {
  border-color: #f59e0b;
  background: #fef3c7;
}

.choice-button.correct {
  border-color: #10b981;
  background: #ecfdf5;
}

.choice-button.incorrect {
  border-color: #ef4444;
  background: #fef2f2;
}

.challenge-feedback {
  margin-top: 2rem;
  padding: 2rem;
  border-radius: 1rem;
}

.challenge-feedback.correct {
  background: #ecfdf5;
  border: 2px solid #10b981;
}

.challenge-feedback.learning {
  background: #fef3c7;
  border: 2px solid #f59e0b;
}

.feedback-result {
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.feedback-outcome, .feedback-learning {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.simulation-complete {
  text-align: center;
  background: #ecfdf5;
  border: 2px solid #10b981;
  padding: 2rem;
  border-radius: 1rem;
  margin-top: 2rem;
}

.primary-button, .next-container-button {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.primary-button:hover, .next-container-button:hover {
  transform: translateY(-2px);
}

.phase-actions, .completion-actions {
  text-align: center;
  margin-top: 3rem;
}

.progress-indicator {
  background: #e5e7eb;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  display: inline-block;
  color: #6b7280;
  font-weight: 500;
}

.completion-phase {
  text-align: center;
  padding: 2rem;
}

.completion-summary {
  margin: 3rem 0;
}

.career-mastery, .next-adventure, .rewards-summary {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  margin: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.career-mastery ul, .rewards-summary ul {
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
  padding-left: 1.5rem;
}

.career-mastery li, .rewards-summary li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.engagement-indicator {
  transition: background 0.3s ease;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default AIExperienceContainerV2;