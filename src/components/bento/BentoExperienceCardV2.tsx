/**
 * BentoExperienceCard V2 - Multi-Challenge Implementation
 * Supports multiple challenges with scenarios for each subject
 * Integrates all 4 AI Companions: Finn, Sage, Spark, Harmony
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { usePageCategory } from '../../hooks/usePageCategory';
import { VisualHierarchy } from '../../styles/visualHierarchy';
import { CareerContextScreen } from '../career/CareerContextScreen';
import { pathIQGamification } from '../../services/pathIQGamificationService';
import { chatbotService } from '../../services/chatbotService';
import { getCompanionDisplayName } from '../../utils/companionUtils';
import styles from './BentoExperienceCard.module.css';

// Import tile components
import { CompanionTile } from './tiles/CompanionTile';
import { ScenarioTile } from './tiles/ScenarioTile';
import { FeedbackTile } from './tiles/FeedbackTile';
import { ProgressTile } from './tiles/ProgressTile';
import { OptionTile } from './tiles/OptionTile';
import { AchievementTile } from './tiles/AchievementTile';
import { InteractiveCanvasTile } from './tiles/InteractiveCanvasTile';

// Import layout configurations
import { 
  getGradeLayout, 
  getMinTouchTargetSize,
  getAnimationDuration,
  needsLargeTouchTargets 
} from './layouts/gradeLayouts';

// Import layout components
import { IntroductionLayout } from './layouts/IntroductionLayout';
import { ScenarioLayout } from './layouts/ScenarioLayout';
import { CompletionLayout } from './layouts/CompletionLayout';

// Import interaction configuration
import { getInteractionConfig } from './utils/interactionConfig';

// Import responsive handler
import { useResponsiveConfig } from './utils/responsiveHandler';

// Import animation system
import { getAnimationSet, transitionScreen, celebrateAchievement } from './utils/animations';

// Import shared tile styles
import tileStyles from './styles/tiles.module.css';

// Import progress persistence hook
import { useExperienceProgress } from '../../hooks/useExperienceProgress';

// Import design system tokens
import '../../design-system/tokens/colors.css';
import '../../design-system/tokens/spacing.css';
import '../../design-system/tokens/layout.css';
import '../../design-system/tokens/typography.css';
import '../../design-system/tokens/effects.css';

// Multi-challenge props interface
interface BentoExperienceCardProps {
  // Challenge navigation
  totalChallenges: number;
  currentChallengeIndex: number;
  screenType: 'intro' | 'scenario' | 'completion';
  currentScenarioIndex?: number;
  
  // Core data
  career: {
    id: string;
    name: string;
    icon: string;
  };
  companion: {
    id: string;
    name: string;
    personality: string;
  };
  challengeData: {
    subject: string;
    skill: {
      id: string;
      name: string;
      description: string;
    };
    introduction: {
      welcome: string;
      companionMessage: string;
      howToUse: string;
    };
    scenarios: Array<{
      description: string;
      visual?: string;
      careerContext: string;
      options: string[];
      correct_choice: number;
      outcome: string;
      learning_point: string;
      hint?: string;
      title?: string;
      context?: string;
    }>;
    // OpenAI generated content structure
    aiGeneratedContent?: {
      title: string;
      scenario: string;
      character_context: string;
      career_introduction: string;
      real_world_connections?: Array<string>;
      interactive_simulation?: {
        setup?: string;
        challenges?: Array<{
          title?: string;
          description?: string;
          options?: string[];
          correct_choice?: number;
          outcome?: string;
          learning_point?: string;
        }>;
        conclusion?: string;
      };
      challenges?: Array<{
        title?: string;
        description?: string;
        options?: string[];
        correct_choice?: number;
        outcome?: string;
        learning_point?: string;
      } | string>;
    };
  };
  
  // User info
  gradeLevel: string;
  studentName: string;
  userId?: string;
  avatarUrl?: string;
  
  // Callbacks
  onScenarioComplete: (scenarioIndex: number, wasCorrect: boolean) => void;
  onChallengeComplete: () => void;
  onNext: () => void;
  
  // Progress tracking
  overallProgress?: number;
  challengeProgress?: number;
  achievements?: string[];
  
  // Optional features
  showCareerContext?: boolean;
  enableHints?: boolean;
  enableAudio?: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'professional';
  content: string;
  timestamp: Date;
}

export const BentoExperienceCard: React.FC<BentoExperienceCardProps> = ({
  totalChallenges,
  currentChallengeIndex,
  screenType,
  currentScenarioIndex = 0,
  career,
  companion,
  challengeData,
  gradeLevel,
  studentName,
  userId,
  avatarUrl,
  onScenarioComplete,
  onChallengeComplete,
  onNext,
  overallProgress = 0,
  challengeProgress = 0,
  achievements = [],
  showCareerContext = true,
  enableHints = false,
  enableAudio = false
}) => {
  // Log props immediately to debug
  console.log('🚀 BentoExperienceCardV2 Props received:', {
    companion,
    career,
    studentName,
    screenType,
    hasCompanion: !!companion,
    companionDetails: companion ? { id: companion.id, name: companion.name } : 'no companion'
  });
  
  // Apply width management category for content containers
  usePageCategory('content');
  
  const { theme } = useTheme();
  
  // Get initial theme from DOM since useTheme() returns undefined
  const getInitialTheme = (): 'light' | 'dark' => {
    const domTheme = document.documentElement.getAttribute('data-theme');
    return domTheme === 'dark' ? 'dark' : 'light';
  };
  
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>(theme || getInitialTheme());
  
  // Debug theme
  console.log('🎨 Theme Detection:', { themeFromHook: theme, actualTheme, domTheme: document.documentElement.getAttribute('data-theme') });
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  
  // Progress persistence
  const {
    progress,
    updateScenarioProgress,
    completeScenario,
    completeSubject,
    recordInteraction,
    getResumeData,
    getCompletionPercentage
  } = useExperienceProgress(userId || '', challengeData.subject, challengeData.skill);
  
  // Chat state for professional interaction
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Update progress when scenario changes
  useEffect(() => {
    if (challengeData.scenarios && challengeData.scenarios.length > 0) {
      updateScenarioProgress(currentScenarioIndex, challengeData.scenarios.length);
    }
  }, [currentScenarioIndex]); // Only depend on currentScenarioIndex to avoid loops
  
  // Check for resume on mount
  useEffect(() => {
    const resumeData = getResumeData();
    if (resumeData?.canResume && resumeData.scenarioIndex > 0) {
      // Ask user if they want to resume
      const shouldResume = window.confirm(`Would you like to resume from scenario ${resumeData.scenarioIndex + 1}?`);
      if (shouldResume) {
        setCurrentScenarioIndex(resumeData.scenarioIndex);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount - getResumeData is stable and doesn't need to be a dependency
  
  // Theme detection - sync with theme hook
  useEffect(() => {
    // Use theme from hook as primary source
    if (theme) {
      setActualTheme(theme);
    } else {
      // Fallback to DOM check
      const getActualTheme = () => {
        const domTheme = document.documentElement.getAttribute('data-theme');
        return (domTheme === 'dark' ? 'dark' : 'light') as 'light' | 'dark';
      };
      
      setActualTheme(getActualTheme());
      
      const observer = new MutationObserver(() => {
        setActualTheme(getActualTheme());
      });
      
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
      });
      
      return () => observer.disconnect();
    }
  }, [theme]);
  
  // Helper functions
  const getCompanionImage = (companionId: string, theme: 'light' | 'dark' = 'light') => {
    return `/images/companions/${companionId}-${theme}.png`;
  };
  
  const getGradeCategory = (grade: string): 'elementary' | 'middle' | 'high' => {
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);
    if (gradeNum <= 5) return 'elementary';
    if (gradeNum <= 8) return 'middle';
    return 'high';
  };
  
  const gradeCategory = getGradeCategory(gradeLevel);
  const interactionConfig = getInteractionConfig(gradeLevel);
  const responsiveConfig = useResponsiveConfig(gradeLevel);
  const animationSet = getAnimationSet(gradeLevel);
  
  // Helper functions for visual options
  const getOptionVisual = (index: number): string => {
    const visuals = ['🔵', '🟡', '🔴', '🟢'];
    return visuals[index] || '⭐';
  };
  
  const needsVisualOptions = (): boolean => {
    return ['K', '1', '2'].includes(gradeLevel);
  };
  
  const needsInteractiveCanvas = (scenario: any): boolean => {
    // Use interactive canvas based on grade-specific interaction config
    if (interactionConfig.mode === 'tap-only') {
      return scenario.interactionType === 'visual' || scenario.interactionType === 'tap-select';
    }
    if (interactionConfig.mode === 'drag-drop' && scenario.interactionType === 'sorting') {
      return true;
    }
    if (interactionConfig.mode === 'multi-select' && scenario.interactionType === 'multiple') {
      return true;
    }
    return false;
  };
  
  // Get grade-specific layout styles
  const getLayoutStyles = () => {
    const layout = getGradeLayout(gradeLevel);
    return {
      '--min-touch-target': `${getMinTouchTargetSize(gradeLevel)}px`,
      '--base-font-size': `${layout.fontSize}px`,
      '--animation-duration': `${getAnimationDuration(gradeLevel)}ms`,
      '--container-padding': layout.containerPadding,
      '--tile-min-height': layout.minTileHeight
    } as React.CSSProperties;
  };
  
  // Companion personality messages
  const getCompanionGreeting = () => {
    const greetings = {
      'finn': `Hey ${studentName}! 🎉 Ready for an awesome ${challengeData.subject} adventure?`,
      'sage': `Greetings, ${studentName}. Let us explore ${challengeData.subject} with wisdom and patience.`,
      'spark': `WOW ${studentName}! ⚡ Let's ENERGIZE this ${challengeData.subject} challenge!`,
      'harmony': `Welcome, dear ${studentName}. 🌸 Let's flow through ${challengeData.subject} together.`
    };
    // Ensure companion.id is lowercase for matching
    const companionId = companion.id?.toLowerCase() || 'finn';
    return greetings[companionId] || challengeData.introduction.companionMessage;
  };
  
  const getCompanionHint = () => {
    const currentScenario = challengeData.scenarios[currentScenarioIndex];
    if (!currentScenario?.hint) return null;
    
    const hintStyles = {
      'finn': `Psst! ${currentScenario.hint} 😉`,
      'sage': `Consider this: ${currentScenario.hint}`,
      'spark': `Ooh! Quick tip: ${currentScenario.hint}! ⚡`,
      'harmony': `Gently... ${currentScenario.hint} 🌸`
    };
    return hintStyles[companion.id] || currentScenario.hint;
  };
  
  const getCompanionCelebration = () => {
    const celebrations = {
      'finn': "AWESOME! You totally nailed it! 🎉",
      'sage': "Excellent reasoning. You've shown true understanding. 🦉",
      'spark': "AMAZING ENERGY! You're on FIRE! ⚡⚡⚡",
      'harmony': "Beautiful work! You approached that with such grace. 🌸"
    };
    return celebrations[companion.id] || "Great job!";
  };
  
  const getCompanionEncouragement = () => {
    const encouragements = {
      'finn': "No worries! Let's try again - you've got this! 💪",
      'sage': "A learning opportunity. Reflect and try once more. 🤔",
      'spark': "Whoa! Close one! Channel that energy and GO AGAIN! ⚡",
      'harmony': "It's okay, dear. Take a breath and try again. 🌸"
    };
    return encouragements[companion.id] || "Let's try again!";
  };
  
  // Handle option selection in scenarios
  const handleOptionSelect = (optionIndex: number) => {
    if (selectedOptionIndex !== null) return; // Already answered
    
    const startTime = Date.now();
    setSelectedOptionIndex(optionIndex);
    const scenario = challengeData.scenarios[currentScenarioIndex];
    const isCorrect = optionIndex === scenario.correct_choice;
    
    setShowFeedback(true);
    
    // Record the interaction
    const timeToComplete = Date.now() - startTime;
    recordInteraction(
      `${challengeData.subject}_${currentScenarioIndex}`,
      'answer_selected',
      isCorrect ? 'correct' : 'incorrect',
      timeToComplete
    );
    
    // Award XP for correct answers
    if (isCorrect && userId) {
      const xp = gradeCategory === 'elementary' ? 10 : 15;
      pathIQGamification.awardPoints(userId, xp, 'Scenario completed', 'experience');
      setXpEarned(xp);
      setShowXPAnimation(true);
      setTimeout(() => setShowXPAnimation(false), 2000);
      
      // Mark scenario as completed
      completeScenario(`${challengeData.subject}_${currentScenarioIndex}`, xp);
    }
    
    // Auto-advance after feedback
    setTimeout(() => {
      onScenarioComplete(currentScenarioIndex, isCorrect);
      setSelectedOptionIndex(null);
      setShowFeedback(false);
    }, 3000);
  };
  
  // Handle chat with professional
  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);
    
    try {
      const context = `You are a ${career.name} helping a grade ${gradeLevel} student understand ${challengeData.skill.name}. 
                      Be professional but friendly, and use real-world examples.`;
      
      const response = await chatbotService.sendMessage(chatInput, context);
      
      const professionalMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'professional',
        content: response.message,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, professionalMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsTyping(false);
    }
  };
  
  // Handle start button from introduction
  const handleStart = () => {
    setScreenType('scenario');
    setCurrentScenarioIndex(0);
  };
  
  // Handle moving to next scenario
  const handleNextScenario = () => {
    if (currentScenarioIndex < challengeData.scenarios.length - 1) {
      setCurrentScenarioIndex(currentScenarioIndex + 1);
      setSelectedOptionIndex(null);
      setShowFeedback(false);
      setShowHint(false);
      setShowXPAnimation(false);
    } else {
      setScreenType('completion');
      // Celebration animation for K-2
      if (['K', '1', '2'].includes(gradeLevel)) {
        setTimeout(() => {
          const container = document.querySelector(`.${tileStyles.tile}`);
          if (container) {
            celebrateAchievement(container as HTMLElement, gradeLevel, 'confetti');
          }
        }, 100);
      }
    }
  };
  
  // Render introduction screen with storytelling narrative
  const renderIntroduction = () => {
    // Parse OpenAI content if it has the new structure
    const aiContent = challengeData?.aiGeneratedContent || {};
    const hasAIContent = !!(aiContent && (aiContent.title || aiContent.scenario || aiContent.character_context || aiContent.career_introduction));
    
    // Debug logging
    console.log('🎭 BentoExperienceCardV2 - renderIntroduction:', {
      companion: companion,
      companionId: companion?.id,
      companionName: companion?.name,
      career: career,
      studentName: studentName,
      screenType: screenType,
      hasCompanion: !!companion,
      challengeData: challengeData,
      aiContent: aiContent,
      hasAIContent: hasAIContent
    });
    
    // Test with a simple visible div first
    return (
    <div style={{
      width: '100%',
      background: actualTheme === 'dark' ? '#1a1a1a' : 'white',
      borderRadius: '20px',
      padding: '40px'
    }}>
      {/* Simple Welcome Header - Testing visibility */}
      <div style={{
        background: companion?.id?.toLowerCase() === 'harmony' 
          ? 'linear-gradient(135deg, #ec4899, #f472b6)' 
          : companion?.id?.toLowerCase() === 'sage'
          ? 'linear-gradient(135deg, #065f46, #10b981)'
          : companion?.id?.toLowerCase() === 'spark'
          ? 'linear-gradient(135deg, #dc2626, #f59e0b)'
          : 'linear-gradient(135deg, #6366f1, #a855f7)',
        color: 'white',
        padding: '30px',
        borderRadius: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Companion Avatar */}
          <div style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid white',
            overflow: 'hidden'
          }}>
            <img 
              src={`/images/companions/${companion?.id?.toLowerCase() || 'finn'}-${theme === 'dark' ? 'dark' : 'light'}.png`}
              alt={companion?.name || 'Companion'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          
          {/* Text Content */}
          <div style={{ flex: 1 }}>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              margin: 0
            }}>
              {hasAIContent && aiContent.title ? aiContent.title : `${career?.icon || '💼'} Welcome to ${career?.name || 'Coach'}'s World!`}
            </h1>
            {hasAIContent && aiContent.career_introduction && (
              <p style={{
                fontSize: '18px',
                opacity: 0.95,
                margin: 0,
                marginTop: '8px',
                lineHeight: '1.5'
              }}>
                {aiContent.career_introduction}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Side-by-side layout: Character Context & How To Tile */}
      <div style={{ 
        gridColumn: 'span 4', 
        display: 'grid', 
        gridTemplateColumns: '3fr 2fr', 
        gap: '20px'
      }}>
        {/* Character Context & Story Setup Tile - LARGER */}
        <div className={`${styles.bentoTile} ${styles.storyContextTile}`} style={{
        background: actualTheme === 'dark'
          ? 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.2) 100%)'
          : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        backgroundColor: actualTheme === 'dark' ? '#1a1a1a' : 'white',
        border: actualTheme === 'dark' ? '1px solid rgba(16,185,129,0.4)' : 'none',
        borderRadius: '20px',
        padding: '28px',
        boxShadow: actualTheme === 'dark' 
          ? '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
          : '0 20px 40px rgba(16,185,129,0.25), inset 0 1px 0 rgba(255,255,255,0.3)',
        minHeight: '240px',
        position: 'relative',
        overflow: 'hidden',
        color: actualTheme === 'dark' ? 'rgba(255,255,255,0.95)' : 'white'
      }}>
        {/* Decorative element */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          pointerEvents: 'none'
        }} />
        
        <h2 className={styles.sectionTitle} style={{ 
          fontSize: '24px', 
          fontWeight: '700', 
          marginBottom: '20px', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '28px' }}>📖</span>
          Your Story Begins...
        </h2>
        <div className={styles.storyContent} style={{ 
          fontSize: '17px', 
          lineHeight: '1.7', 
          color: 'rgba(255,255,255,0.95)',
          position: 'relative',
          zIndex: 1
        }}>
          {hasAIContent && aiContent.scenario ? (
            <>
              <p style={{ marginBottom: '16px' }}>{aiContent.scenario}</p>
              {aiContent.character_context && (
                <p>{aiContent.character_context}</p>
              )}
            </>
          ) : (
            <>
              <p style={{ marginBottom: '16px' }}>
                You are {career?.name || 'a Professional'} {studentName}, ready to take on today's challenges!
              </p>
              <p>
                Today, you're focusing on <strong style={{ color: '#fbbf24' }}>{challengeData?.skill?.name || 'Identify numbers - up to 3'}</strong> - 
                a crucial skill that every {career?.name || 'professional'} needs. Your mission is to {challengeData?.skill?.description || 'master important skills for your career'}!
              </p>
            </>
          )}
        </div>
      </div>
        
        {/* How Careers Use Skills Tile */}
        <div className={`${styles.bentoTile} ${styles.howToTile}`} style={{
        background: actualTheme === 'dark'
          ? 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(37,99,235,0.2) 100%)'
          : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        backgroundColor: actualTheme === 'dark' ? '#1a1a1a' : 'white',
        border: actualTheme === 'dark' ? '1px solid rgba(59,130,246,0.4)' : 'none',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: actualTheme === 'dark' 
          ? '0 10px 25px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
          : '0 15px 30px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
        position: 'relative',
        overflow: 'hidden',
        color: actualTheme === 'dark' ? 'rgba(255,255,255,0.95)' : 'white'
      }}>
        {/* Pattern overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          pointerEvents: 'none'
        }} />
        
        <h2 className={styles.sectionTitle} style={{ 
          fontSize: '20px', 
          fontWeight: '700', 
          marginBottom: '14px', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          position: 'relative',
          zIndex: 1
        }}>
          <span style={{ fontSize: '24px' }}>🎯</span>
          Real-World Skills
        </h2>
        <p style={{ 
          fontSize: '15px', 
          lineHeight: '1.6', 
          color: 'rgba(255,255,255,0.95)',
          position: 'relative',
          zIndex: 1
        }}>
          {hasAIContent && aiContent.career_introduction ? 
            aiContent.career_introduction :
            `${career?.name || 'Professional'}s use ${challengeData?.skill?.name || 'math skills'} every day! Master this skill to become a pro.`
          }
        </p>
      </div>
    </div>
    
    {/* Your Mission & Start Adventure Tile - Enhanced visual design */}
    <div className={`${styles.bentoTile} ${styles.missionTile}`} style={{
      gridColumn: 'span 4',
      background: actualTheme === 'dark'
        ? 'linear-gradient(135deg, rgba(251,146,60,0.25) 0%, rgba(245,158,11,0.25) 100%)'
        : 'linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)',
      backgroundColor: actualTheme === 'dark' ? '#1a1a1a' : 'white',
      border: actualTheme === 'dark' ? '1px solid rgba(251,146,60,0.4)' : 'none',
      borderRadius: '20px',
      padding: '24px 28px',
      boxShadow: actualTheme === 'dark' 
        ? '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
        : '0 15px 35px rgba(251,146,60,0.25), inset 0 1px 0 rgba(255,255,255,0.3)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '32px',
      position: 'relative',
      color: actualTheme === 'dark' ? 'rgba(255,255,255,0.95)' : 'white'
    }}>
      {/* Animated background pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '-100%',
        right: '-100%',
        bottom: 0,
        background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)',
        animation: 'slide 20s linear infinite',
        pointerEvents: 'none'
      }} />
      
      {/* Mission Content - Enhanced */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <h2 className={styles.sectionTitle} style={{ 
          fontSize: '22px', 
          fontWeight: '700', 
          marginBottom: '16px', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '26px' }}>🏆</span>
          Your Mission
        </h2>
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <ul style={{ 
            fontSize: '16px', 
            paddingLeft: '24px', 
            margin: 0, 
            color: 'rgba(255,255,255,0.95)', 
            lineHeight: '1.8',
            fontWeight: '500'
          }}>
            {(() => {
              const aiChallenges = aiContent?.interactive_simulation?.challenges;
              
              // Function to extract a brief summary from challenge description
              const getChallengeSummary = (challenge: any, index: number) => {
                if (typeof challenge === 'string') return challenge;
                
                const description = challenge.description || '';
                
                // Extract key action from the description
                // Look for patterns like "count how many", "set up cones", "form a team", etc.
                if (description.includes('count')) {
                  return `Count players and equipment`;
                } else if (description.includes('set up') || description.includes('cones')) {
                  return `Set up practice equipment`;
                } else if (description.includes('team') || description.includes('form')) {
                  return `Organize team activities`;
                } else if (description.includes('snack') || description.includes('juice')) {
                  return `Manage snack distribution`;
                } else if (description.includes('relay') || description.includes('race')) {
                  return `Prepare for relay races`;
                } else if (description.includes('catch') || description.includes('ball')) {
                  return `Track balls and players`;
                }
                
                // Fallback: extract first key verb/action after the colon
                const colonIndex = description.indexOf(':');
                if (colonIndex > -1) {
                  const afterColon = description.substring(colonIndex + 1, colonIndex + 50);
                  const cleaned = afterColon.replace(/[.!?].*/, '').trim();
                  if (cleaned.length < 40) {
                    return cleaned;
                  }
                }
                
                // Final fallback
                return `Challenge ${index + 1}: Apply counting skills`;
              };
              
              console.log('📋 Your Mission - Challenges Debug:', {
                aiContent: aiContent,
                aiChallenges: aiChallenges,
                hasChallenges: aiChallenges && aiChallenges.length > 0,
                scenarios: challengeData?.scenarios
              });
              
              if (aiChallenges && aiChallenges.length > 0) {
                return aiChallenges.map((challenge, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>
                    Challenge {index + 1}: {getChallengeSummary(challenge, index)}
                  </li>
                ));
              } else if (challengeData?.scenarios && challengeData.scenarios.length > 0) {
                return challengeData.scenarios.slice(0, 3).map((scenario, index) => (
                <li key={index} style={{ marginBottom: '4px' }}>
                  {scenario.title || `Challenge ${index + 1}: ${scenario.description?.split('.')[0] || 'Complete the task'}`}
                </li>
              ));
              } else {
                return (
                  <>
                    <li style={{ marginBottom: '4px' }}>Learn to identify numbers up to 3</li>
                    <li style={{ marginBottom: '4px' }}>Practice counting with real-world examples</li>
                    <li style={{ marginBottom: '4px' }}>Apply your skills in fun challenges</li>
                  </>
                );
              }
            })()}
          </ul>
          <div className={styles.scenarioCount} style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '8px', 
            alignItems: 'center',
            padding: '12px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: Math.min(challengeData.scenarios.length, 5) }).map((_, i) => (
                <span key={i} style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  background: 'rgba(255,255,255,0.8)',
                  display: 'inline-block',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}></span>
              ))}
            </div>
            <span style={{ fontSize: '12px', opacity: 0.9, fontWeight: '600' }}>Ready!</span>
          </div>
        </div>
      </div>
      
      {/* Start Adventure Button - Enhanced */}
      <button 
        className={styles.startButton}
        onClick={onNext}
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '16px',
          padding: '18px 36px',
          fontSize: '20px',
          fontWeight: '700',
          cursor: 'pointer',
          boxShadow: '0 10px 25px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          whiteSpace: 'nowrap',
          minWidth: '200px',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
          e.currentTarget.style.boxShadow = '0 15px 35px rgba(16,185,129,0.5), inset 0 1px 0 rgba(255,255,255,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 10px 25px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.2)';
        }}
      >
        <span style={{ fontSize: '24px' }}>🚀</span>
        <span>Start Adventure</span>
        <span style={{ fontSize: '18px' }}>→</span>
      </button>
    </div>
    
    {/* Add keyframe animation for sliding pattern */}
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes slide {
        0% { transform: translateX(0); }
        100% { transform: translateX(100%); }
      }
    `}} />
  </div>
  );
  };
  
  // Render scenario screen
  const renderScenario = () => {
    const scenario = challengeData.scenarios[currentScenarioIndex];
    if (!scenario) return null;
    
    return (
      <div className={`${styles.bentoContainer} ${styles[`grade-${gradeCategory}`]} ${actualTheme === 'dark' ? styles.darkTheme : styles.lightTheme} bento-v2-container`} style={{...getLayoutStyles(), paddingTop: '80px'}}>
        {/* Progress Tile - Enhanced */}
        <div className={`${styles.bentoTile} ${styles.wideTile} ${styles.progressTile}`} style={{
          gridColumn: 'span 4',
          background: actualTheme === 'dark' 
            ? 'linear-gradient(90deg, rgba(99,102,241,0.15) 0%, rgba(16,185,129,0.15) 50%, rgba(251,146,60,0.15) 100%)'
            : 'linear-gradient(90deg, #6366f1 0%, #10b981 50%, #fb923c 100%)',
          border: actualTheme === 'dark' ? '1px solid rgba(99,102,241,0.3)' : 'none',
          borderRadius: '16px',
          padding: '12px 20px',
          boxShadow: actualTheme === 'dark' 
            ? '0 8px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 8px 16px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
          color: 'white',
          maxHeight: '80px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <ProgressTile
            progress={{
              currentScenario: currentScenarioIndex + 1,
              totalScenarios: challengeData.scenarios.length,
              completedScenarios: currentScenarioIndex,
              completionPercentage: getCompletionPercentage(),
              currentSkill: {
                name: challengeData.skill.name,
                subject: challengeData.subject,
                progress: challengeProgress
              }
            }}
            display="minimal"
            showMilestones={false}
            gradeLevel={gradeLevel}
          />
        </div>
        
        {/* Scenario Tile - Enhanced visual */}
        <div className={`${styles.bentoTile} ${styles.largeTile} ${styles.scenarioMainTile}`} style={{
          gridColumn: 'span 2',
          gridRow: 'span 2',
          background: actualTheme === 'dark'
            ? 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(37,99,235,0.12) 100%)'
            : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          border: actualTheme === 'dark' ? '1px solid rgba(59,130,246,0.3)' : '2px solid #3b82f6',
          borderRadius: '20px',
          padding: '24px',
          boxShadow: actualTheme === 'dark' 
            ? '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 20px 40px rgba(59,130,246,0.15)',
          color: actualTheme === 'dark' ? '#e5e7eb' : '#1e293b',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <ScenarioTile
            scenario={{
              description: scenario.description,
              visual: scenario.visual,
              careerContext: scenario.careerContext,
              hint: scenario.hint
            }}
            scenarioNumber={currentScenarioIndex + 1}
            totalScenarios={challengeData.scenarios.length}
            career={{ name: career.name, icon: career.icon }}
            skill={{ name: challengeData.skill.name }}
            gradeLevel={gradeLevel}
          />
        </div>
        
        {/* Options - Use InteractiveCanvas based on interaction config */}
        {needsInteractiveCanvas(scenario) ? (
          <div className={`${styles.bentoTile} ${styles.largeTile} ${styles.interactiveTile}`} style={{
            gridColumn: 'span 2',
            gridRow: 'span 2',
            background: actualTheme === 'dark'
              ? 'linear-gradient(135deg, rgba(240,253,244,0.1) 0%, rgba(220,252,231,0.1) 100%)'
              : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: actualTheme === 'dark' ? '2px solid rgba(34,197,94,0.4)' : '3px solid #22c55e',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: actualTheme === 'dark' ? '0 10px 25px rgba(0,0,0,0.4)' : '0 10px 25px rgba(34,197,94,0.3)',
            color: actualTheme === 'dark' ? '#e5e7eb' : 'inherit'
          }}>
            <InteractiveCanvasTile
              type={
                interactionConfig.mode === 'tap-only' ? 'tap-select' :
                interactionConfig.mode === 'drag-drop' ? 'drag-drop' :
                interactionConfig.mode === 'multi-select' ? 'multi-select' :
                'selection'
              }
              items={scenario.options.map((option, index) => ({
                id: `option-${index}`,
                content: option,
                visual: interactionConfig.showVisuals ? getOptionVisual(index) : undefined,
                type: interactionConfig.mode === 'drag-drop' ? 'draggable' as const : 'static' as const,
                correctTarget: index === scenario.correct_choice ? 'correct' : undefined
              }))}
              gradeLevel={gradeLevel}
              instructions={interactionConfig.instructions || "Select your answer"}
              showFeedback={showFeedback}
              enableHints={enableHints}
              targetSize={interactionConfig.targetSize}
              enableSnapping={interactionConfig.mode === 'drag-drop'}
              feedback={interactionConfig.feedback}
              onComplete={(result) => {
                // Handle completion
                if (result.correct) {
                  onScenarioComplete(currentScenarioIndex, true);
                }
              }}
              onInteraction={(itemId, action) => {
                const index = parseInt(itemId.split('-')[1]);
                handleOptionSelect(index);
              }}
            />
          </div>
        ) : (
          <div className={`${styles.bentoTile} ${styles.mediumTile} ${styles.optionsTile}`} style={{
            gridColumn: 'span 2',
            background: actualTheme === 'dark'
              ? 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.12) 100%)'
              : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
            border: actualTheme === 'dark' ? '1px solid rgba(16,185,129,0.3)' : '2px solid #10b981',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: actualTheme === 'dark'
              ? '0 15px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 15px 30px rgba(16,185,129,0.15)',
            color: actualTheme === 'dark' ? '#e5e7eb' : '#1e293b'
          }}>
            <OptionTile
              options={scenario.options.map((text, index) => ({
                text,
                visual: needsVisualOptions() ? getOptionVisual(index) : undefined
              }))}
              correctIndex={scenario.correct_choice}
              gradeLevel={gradeLevel}
              enableHints={enableHints}
              onSelect={handleOptionSelect}
              selectedIndex={selectedOptionIndex}
              showFeedback={showFeedback}
              disabled={showFeedback}
              questionFormat={gradeCategory === 'elementary' ? 'standard' : 'i-would'}
            />
          </div>
        )}
        
        {/* Companion Helper Tile - Theme aware */}
        {enableHints && !showFeedback && (
          <div className={`${styles.bentoTile} ${styles.smallTile} ${styles.helperTile}`} style={{
            gridColumn: 'span 1',
            background: actualTheme === 'dark'
              ? 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(245,158,11,0.12) 100%)'
              : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: actualTheme === 'dark' ? '1px solid rgba(251,191,36,0.3)' : '2px solid #f59e0b',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: actualTheme === 'dark'
              ? '0 10px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 10px 20px rgba(245,158,11,0.15)',
            color: actualTheme === 'dark' ? '#e5e7eb' : '#1e293b'
          }}>
            <CompanionTile
              companion={{
                id: companion.id as 'finn' | 'sage' | 'spark' | 'harmony',
                name: companion.name,
                personality: companion.personality
              }}
              message={showHint ? getCompanionHint() || "Think about it..." : "Need a hint?"}
              emotion={showHint ? "thinking" : "curious"}
              size="small"
              position="corner"
            />
            {!showHint && (
              <button 
                className={styles.hintButton}
                onClick={() => setShowHint(true)}
              >
                Show Hint
              </button>
            )}
          </div>
        )}
        
        {/* Feedback Tile - Enhanced theme support */}
        {showFeedback && (
          <div className={`${styles.bentoTile} ${styles.largeTile} ${styles.feedbackTile}`} style={{
            gridColumn: 'span 2',
            gridRow: 'span 2',
            background: selectedOptionIndex === scenario.correct_choice
              ? (actualTheme === 'dark' 
                  ? 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(16,185,129,0.15) 100%)'
                  : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)')
              : (actualTheme === 'dark'
                  ? 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.15) 100%)'
                  : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'),
            border: selectedOptionIndex === scenario.correct_choice
              ? (actualTheme === 'dark' ? '1px solid rgba(34,197,94,0.3)' : '2px solid #22c55e')
              : (actualTheme === 'dark' ? '1px solid rgba(239,68,68,0.3)' : '2px solid #ef4444'),
            borderRadius: '20px',
            padding: '24px',
            boxShadow: actualTheme === 'dark'
              ? '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 20px 40px rgba(0,0,0,0.1)',
            color: actualTheme === 'dark' ? '#e5e7eb' : '#1e293b',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <FeedbackTile
              feedback={{
                type: selectedOptionIndex === scenario.correct_choice ? 'success' : 'incorrect',
                message: selectedOptionIndex === scenario.correct_choice 
                  ? "Excellent choice! You understood the scenario perfectly."
                  : "Not quite right, but that's okay! Learning is all about trying.",
                score: selectedOptionIndex === scenario.correct_choice ? 10 : 0,
                maxScore: 10,
                details: [
                  scenario.outcome,
                  scenario.learning_point
                ]
              }}
              companion={{
                message: selectedOptionIndex === scenario.correct_choice 
                  ? getCompanionCelebration() 
                  : getCompanionEncouragement(),
                emotion: selectedOptionIndex === scenario.correct_choice ? 'celebrating' : 'encouraging'
              }}
              showAnimation={true}
              gradeLevel={gradeLevel}
            />
            {showXPAnimation && (
              <AchievementTile
                type="xp"
                value={xpEarned}
                gradeLevel={gradeLevel}
                showAnimation={true}
                onAnimationComplete={() => setShowXPAnimation(false)}
              />
            )}
          </div>
        )}
      </div>
    );
  };
  
  // Render completion screen
  const renderCompletion = () => (
    <div className={`${styles.bentoContainer} ${styles[`grade-${gradeCategory}`]} ${actualTheme === 'dark' ? styles.darkTheme : styles.lightTheme}`} style={{...getLayoutStyles(), paddingTop: '80px'}}>
      {/* Progress Summary Tile - Enhanced */}
      <div className={`${styles.bentoTile} ${styles.wideTile} ${styles.completionProgressTile}`} style={{
        gridColumn: 'span 4',
        background: actualTheme === 'dark'
          ? 'linear-gradient(90deg, rgba(34,197,94,0.15) 0%, rgba(16,185,129,0.15) 50%, rgba(5,150,105,0.15) 100%)'
          : 'linear-gradient(90deg, #22c55e 0%, #10b981 50%, #059669 100%)',
        border: actualTheme === 'dark' ? '1px solid rgba(34,197,94,0.3)' : 'none',
        borderRadius: '20px',
        padding: '16px 24px',
        boxShadow: actualTheme === 'dark'
          ? '0 10px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
          : '0 10px 25px rgba(34,197,94,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
        color: 'white'
      }}>
        <ProgressTile
          progress={{
            currentScenario: challengeData.scenarios.length,
            totalScenarios: challengeData.scenarios.length,
            completedScenarios: challengeData.scenarios.length,
            completionPercentage: 100,
            currentSkill: {
              name: challengeData.skill.name,
              subject: challengeData.subject,
              progress: 100
            },
            overallProgress: {
              completedSkills: currentChallengeIndex + 1,
              totalSkills: totalChallenges,
              badges: achievements
            }
          }}
          display="full"
          showMilestones={true}
          gradeLevel={gradeLevel}
        />
      </div>
      
      {/* Celebration HERO Tile - Vibrant and engaging */}
      <div className={`${styles.bentoTile} ${styles.heroTile} ${styles.celebrationTile}`} style={{
        gridColumn: 'span 4',
        background: actualTheme === 'dark'
          ? 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(236,72,153,0.2) 100%)'
          : 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
        border: actualTheme === 'dark' ? '1px solid rgba(168,85,247,0.3)' : 'none',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: actualTheme === 'dark'
          ? '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
          : '0 25px 50px rgba(168,85,247,0.3), inset 0 1px 0 rgba(255,255,255,0.3)',
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Confetti overlay effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.2) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
          pointerEvents: 'none'
        }} />
        
        <h1 className={styles.celebrationTitle} style={{
          fontSize: '36px',
          fontWeight: '800',
          marginBottom: '16px',
          textShadow: '0 4px 8px rgba(0,0,0,0.2)',
          position: 'relative',
          zIndex: 1
        }}>
          🎉 {challengeData.subject} Challenge Complete! 🎉
        </h1>
        <p className={styles.celebrationMessage} style={{
          fontSize: '20px',
          opacity: 0.95,
          position: 'relative',
          zIndex: 1
        }}>
          You've mastered all {challengeData.scenarios.length} scenarios like a true champion!
        </p>
      </div>
      
      {/* Companion Celebration */}
      <div className={styles.companionCelebrationSection}>
        <CompanionTile
          companion={{
            id: companion.id as 'finn' | 'sage' | 'spark' | 'harmony',
            name: companion.name,
            personality: companion.personality
          }}
          message={`${getCompanionCelebration()} You've mastered ${challengeData.skill.name} like a true ${career.name}!`}
          emotion="celebrating"
          size="large"
          position="inline"
        />
      </div>
      
      {/* Success Feedback */}
      <div className={styles.completionFeedbackSection}>
        <FeedbackTile
          feedback={{
            type: 'success',
            message: `Outstanding work on your ${challengeData.subject} challenge!`,
            score: challengeData.scenarios.length * 10,
            maxScore: challengeData.scenarios.length * 10,
            details: [
              `Completed ${challengeData.scenarios.length} scenarios`,
              `Mastered ${challengeData.skill.name}`,
              `Learned how ${career.name}s apply this skill`
            ]
          }}
          showAnimation={true}
          gradeLevel={gradeLevel}
        />
      </div>
      
      {/* Achievement Display */}
      <div className={styles.achievementSection}>
        <AchievementTile
          type="badge"
          value={`${challengeData.skill.name} Master`}
          gradeLevel={gradeLevel}
          showAnimation={true}
          additionalInfo={{
            totalXP: challengeData.scenarios.length * 10,
            streak: challengeData.scenarios.length,
            milestone: `${challengeData.subject} Champion`
          }}
        />
      </div>
      
      {/* Next Action Tile - Prominent CTA */}
      <div className={`${styles.bentoTile} ${styles.actionTile}`} style={{
        gridColumn: 'span 4',
        background: actualTheme === 'dark'
          ? 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(79,70,229,0.15) 100%)'
          : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        border: actualTheme === 'dark' ? '1px solid rgba(99,102,241,0.3)' : 'none',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: actualTheme === 'dark'
          ? '0 15px 35px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
          : '0 15px 35px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.3)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <button 
          className={styles.continueButton}
          onClick={onChallengeComplete}
          style={{
            background: 'rgba(255,255,255,0.95)',
            color: actualTheme === 'dark' ? '#4f46e5' : '#6366f1',
            border: 'none',
            borderRadius: '16px',
            padding: '20px 48px',
            fontSize: '22px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
          }}
        >
          {currentChallengeIndex < totalChallenges - 1 
            ? <><span>Next Challenge</span> <span style={{ fontSize: '20px' }}>→</span></> 
            : <><span>Complete Experience</span> <span style={{ fontSize: '24px' }}>🏆</span></>}
        </button>
      </div>
    </div>
  );
  
  // Main render logic based on screenType - using inline render functions with visible styles
  console.log('🎯 BentoExperienceCardV2 - Main render:', {
    screenType: screenType,
    companion: companion,
    companionId: companion?.id,
    career: career?.name,
    studentName: studentName
  });
  
  switch (screenType) {
    case 'intro':
      return renderIntroduction();
    case 'scenario':
      return renderScenario();
    case 'completion':
      return renderCompletion();
    default:
      return renderIntroduction(); // Default to intro screen
  }
};

export default BentoExperienceCard;
export { BentoExperienceCard as BentoExperienceCardV2 };