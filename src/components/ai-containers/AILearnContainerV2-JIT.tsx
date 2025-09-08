/**
 * AI-FIRST LEARN CONTAINER V2 - JIT INTEGRATION
 * Refactored to use Just-In-Time Content Service with performance tracking
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StudentProfile, LearningSkill } from '../../services/AILearningJourneyService';
import { unifiedLearningAnalyticsService } from '../../services/unifiedLearningAnalyticsService';
import { learningMetricsService } from '../../services/learningMetricsService';
import { companionReactionService } from '../../services/companionReactionService';
import { voiceManagerService } from '../../services/voiceManagerService';
import { companionVoiceoverService } from '../../services/companionVoiceoverService';
import { usePathIQGamification, getXPRewardForAction } from '../../hooks/usePathIQGamification';
import { useModeContext } from '../../contexts/ModeContext';
import { useAICharacter } from '../ai-characters/AICharacterProvider';
import { aiCharacterProvider } from '../../services/aiCharacterProvider';
import { AICharacterAvatar } from '../ai-characters/AICharacterAvatar';
import { ContainerNavigationHeader } from './ContainerNavigationHeader';
import { FloatingLearningDock } from '../learning-support/FloatingLearningDock';
import { CompanionChatBox } from '../learning-support/CompanionChatBox';
import { VisualRenderer } from './VisualRenderer';
import { EnhancedLoadingScreen } from './EnhancedLoadingScreen';
import { XPDisplay } from '../gamification/XPDisplay';
import { useTheme } from '../../hooks/useTheme';

// NEW JIT IMPORTS
import { Question } from '../../services/content/QuestionTypes';
import { questionValidator, ValidationResult } from '../../services/content/QuestionValidator';
import { getDailyLearningContext } from '../../services/content/DailyLearningContextManager';
import { getJustInTimeContentService } from '../../services/content/JustInTimeContentService';
import { getPerformanceTracker } from '../../services/content/PerformanceTracker';
import { getSessionStateManager } from '../../services/content/SessionStateManager';
import { getConsistencyValidator } from '../../services/content/ConsistencyValidator';
import { QuestionRenderer } from '../../services/content/QuestionRenderer';

// Import styles
import '../../styles/containers/LearnContainer.css';
import './AILearnContainer.css';

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
}

type LearningPhase = 'loading' | 'instruction' | 'practice' | 'assessment' | 'complete';

interface QuestionResult {
  correct: boolean;
  timeSpent: number;
  hintsUsed: number;
  attempts: number;
}

// ================================================================
// AI LEARN CONTAINER V2 WITH JIT INTEGRATION
// ================================================================

export const AILearnContainerV2: React.FC<AILearnContainerV2Props> = ({
  student,
  skill,
  selectedCharacter,
  selectedCareer,
  onComplete,
  onNext,
  onBack
}) => {
  // ================================================================
  // STATE MANAGEMENT
  // ================================================================
  
  const [phase, setPhase] = useState<LearningPhase>('loading');
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, any>>({});
  const [practiceResults, setPracticeResults] = useState<Record<number, boolean>>({});
  const [assessmentAnswer, setAssessmentAnswer] = useState<any>(null);
  const [showAssessmentResult, setShowAssessmentResult] = useState(false);
  const [assessmentIsCorrect, setAssessmentIsCorrect] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [companionMessage, setCompanionMessage] = useState('');
  const [companionEmotion, setCompanionEmotion] = useState('happy');
  const [hintUsed, setHintUsed] = useState<Record<number, boolean>>({});
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionAttempts, setQuestionAttempts] = useState<Record<number, number>>({});
  
  // ================================================================
  // CONTEXT & HOOKS
  // ================================================================
  
  const { currentMode } = useModeContext();
  const { currentCharacter } = useAICharacter();
  const { features, awardXP, profile } = usePathIQGamification(student?.id || 'default', student?.grade_level);
  const theme = useTheme();
  
  // JIT Services
  const dailyContextManager = getDailyLearningContext();
  const jitService = getJustInTimeContentService();
  const performanceTracker = getPerformanceTracker();
  const sessionManager = getSessionStateManager();
  const consistencyValidator = getConsistencyValidator();
  
  // Refs for tracking
  const containerStartTime = useRef<number>(Date.now());
  const contentGeneratedRef = useRef(false);
  const containerId = useRef(`learn-${skill?.subject?.toLowerCase() || 'general'}-${Date.now()}`);
  
  // Character and Career setup
  const characterId = selectedCharacter ? selectedCharacter.toLowerCase() : (currentCharacter?.id || 'finn');
  const character = aiCharacterProvider.getCharacterById(characterId) || currentCharacter;
  const career = selectedCareer?.name || 'Explorer';
  
  // ================================================================
  // JIT CONTENT GENERATION
  // ================================================================
  
  useEffect(() => {
    if (contentGeneratedRef.current) {
      console.log('[JIT] Content already generated, skipping');
      return;
    }
    
    const generateJITContent = async () => {
      console.log('[JIT] Starting content generation for Learn container');
      contentGeneratedRef.current = true;
      setIsLoading(true);
      setError(null);
      
      try {
        // Initialize or get daily context
        let dailyContext = dailyContextManager.getCurrentContext();
        if (!dailyContext) {
          console.log('[JIT] Creating new daily context');
          dailyContext = dailyContextManager.createDailyContext({
            id: student.id,
            grade: student.grade_level,
            currentSkill: skill,
            selectedCareer: { 
              id: career.toLowerCase(), 
              title: career,
              description: `Working as a ${career}`,
              skills: [],
              education: '',
              salary: ''
            },
            companion: character,
            enrolledSubjects: ['Math', 'ELA', 'Science', 'Social Studies']
          } as any);
        }
        
        // Track container progression
        sessionManager.trackContainerProgression(
          student.id,
          containerId.current,
          'learn',
          skill.subject || 'General'
        );
        
        // Get performance context
        const sessionState = sessionManager.getCurrentState(student.id);
        const performanceContext = sessionState ? {
          recentAccuracy: sessionState.performance.overallAccuracy,
          averageTimePerQuestion: sessionState.performance.averageTimePerQuestion,
          hintsUsedRate: sessionState.performance.totalHintsUsed / Math.max(1, sessionState.performance.totalQuestionsAnswered),
          streakCount: sessionState.performance.streakCount,
          adaptationLevel: sessionState.adaptationLevel
        } : undefined;
        
        // Generate content using JIT service
        console.log('[JIT] Requesting content generation');
        const startTime = performance.now();
        
        const generatedContent = await jitService.generateContainerContent({
          userId: student.id,
          container: containerId.current,
          containerType: 'learn',
          subject: skill.subject || 'General',
          performanceContext,
          timeConstraint: currentMode?.name === 'demo' ? 2 : 15, // 2 min for demo, 15 for standard
          forceRegenerate: false
        });
        
        const generationTime = performance.now() - startTime;
        console.log(`[JIT] Content generated in ${generationTime.toFixed(0)}ms`);
        
        // Validate consistency
        const consistencyReport = consistencyValidator.validateCrossSubjectCoherence(
          generatedContent.questions.map(q => ({
            type: 'question',
            subject: skill.subject || 'General',
            text: JSON.stringify(q)
          })),
          dailyContext
        );
        
        console.log('[JIT] Consistency score:', consistencyReport.overallScore.toFixed(0) + '%');
        
        // Auto-correct if needed
        if (!consistencyReport.isConsistent) {
          console.log('[JIT] Applying consistency corrections');
          generatedContent.questions = generatedContent.questions.map(q => 
            consistencyValidator.enforceConsistency(
              { type: 'question', subject: skill.subject || 'General', text: JSON.stringify(q) },
              dailyContext
            )
          );
        }
        
        // Structure content for container
        const structuredContent = {
          instructions: generatedContent.instructions,
          practice: generatedContent.questions.slice(0, -1), // All but last
          assessment: generatedContent.questions[generatedContent.questions.length - 1], // Last question
          companion_messages: generateCompanionMessages(character, dailyContext),
          visuals: generatedContent.questions.map(q => q.visual).filter(Boolean),
          metadata: {
            ...generatedContent.metadata,
            careerContext: generatedContent.careerContext,
            skillFocus: generatedContent.skillFocus,
            estimatedTime: generatedContent.estimatedTime,
            difficulty: generatedContent.difficulty
          }
        };
        
        setContent(structuredContent);
        setPhase('instruction');
        
        // Log performance metrics
        const cacheStats = jitService.getCacheStats();
        console.log('[JIT] Cache stats:', {
          hitRate: cacheStats.hitRate.toFixed(1) + '%',
          entries: cacheStats.totalEntries,
          avgGenTime: cacheStats.avgGenerationTime.toFixed(0) + 'ms'
        });
        
      } catch (err) {
        console.error('[JIT] Content generation failed:', err);
        setError('Failed to generate learning content. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    generateJITContent();
  }, [skill?.id, student?.id]); // Only regenerate if skill or student changes
  
  // ================================================================
  // PERFORMANCE TRACKING
  // ================================================================
  
  const trackQuestionPerformance = useCallback((questionIndex: number, result: QuestionResult) => {
    const question = phase === 'practice' 
      ? content?.practice[questionIndex]
      : content?.assessment;
    
    if (!question) return;
    
    // Track with performance tracker
    performanceTracker.trackQuestionPerformance(
      student.id,
      {
        ...question,
        id: `${containerId.current}-q${questionIndex}`,
        subject: skill.subject || 'General',
        skill: skill,
        containerId: containerId.current
      },
      result
    );
    
    // Update session state
    sessionManager.updateQuestionPerformance(
      student.id,
      `${containerId.current}-q${questionIndex}`,
      result.correct,
      result.timeSpent,
      result.hintsUsed,
      result.correct ? (question.difficulty === 'hard' ? 30 : 20) : 5
    );
    
    // Get real-time insights
    const analytics = performanceTracker.getPerformanceAnalytics(student.id);
    
    // Update companion message based on performance
    if (analytics.insights.length > 0) {
      const topInsight = analytics.insights[0];
      setCompanionMessage(topInsight.message);
      setCompanionEmotion(topInsight.type === 'achievement' ? 'excited' : 'encouraging');
    }
    
    // Award XP if correct
    if (result.correct && features.xpEnabled) {
      const xpAmount = question.difficulty === 'hard' ? 30 : 
                      question.difficulty === 'easy' ? 10 : 20;
      awardXP(xpAmount, 'question_correct');
    }
  }, [content, phase, student.id, skill, features, awardXP]);
  
  // ================================================================
  // PHASE HANDLERS
  // ================================================================
  
  const handleInstructionComplete = () => {
    setPhase('practice');
    setCurrentQuestionIndex(0);
    setQuestionStartTime(Date.now());
  };
  
  const handlePracticeAnswer = (answer: any) => {
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    const attempts = (questionAttempts[currentQuestionIndex] || 0) + 1;
    
    setPracticeAnswers({ ...practiceAnswers, [currentQuestionIndex]: answer });
    setQuestionAttempts({ ...questionAttempts, [currentQuestionIndex]: attempts });
    
    // Validate answer
    const question = content?.practice[currentQuestionIndex];
    const validationResult = validateAnswer(question, answer);
    const isCorrect = validationResult.correct;
    
    // Store feedback if available
    if (validationResult.feedback) {
      setCompanionMessage({
        text: validationResult.feedback,
        emotion: isCorrect ? 'happy' : 'encouraging'
      });
    }
    
    setPracticeResults({ ...practiceResults, [currentQuestionIndex]: isCorrect });
    
    // Track performance
    trackQuestionPerformance(currentQuestionIndex, {
      correct: isCorrect,
      timeSpent,
      hintsUsed: hintUsed[currentQuestionIndex] ? 1 : 0,
      attempts
    });
    
    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestionIndex < content.practice.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setQuestionStartTime(Date.now());
      } else {
        // All practice complete, move to assessment
        setPhase('assessment');
        setQuestionStartTime(Date.now());
      }
    }, isCorrect ? 1500 : 2500); // Shorter delay if correct
  };
  
  const handleAssessmentAnswer = (answer: any) => {
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    setAssessmentAnswer(answer);
    
    // Validate answer
    const validationResult = validateAnswer(content?.assessment, answer);
    const isCorrect = validationResult.correct;
    setAssessmentIsCorrect(isCorrect);
    setShowAssessmentResult(true);
    
    // Store feedback
    if (validationResult.feedback) {
      setCompanionMessage({
        text: validationResult.feedback,
        emotion: isCorrect ? 'excited' : 'supportive'
      });
    }
    
    // Track performance
    trackQuestionPerformance(content.practice.length, {
      correct: isCorrect,
      timeSpent,
      hintsUsed: 0, // No hints in assessment
      attempts: 1
    });
    
    // Complete container after delay
    setTimeout(() => {
      handleComplete(isCorrect);
    }, 2000);
  };
  
  const handleComplete = (assessmentCorrect: boolean) => {
    // Complete container tracking
    sessionManager.completeContainer(student.id, containerId.current);
    
    // Get final analytics
    const analytics = performanceTracker.getPerformanceAnalytics(student.id);
    const recommendations = performanceTracker.getAdaptationRecommendations(student.id);
    
    console.log('[JIT] Container complete:', {
      accuracy: analytics.strengths.length > 0 ? 'Strong' : 'Needs practice',
      recommendations: recommendations.map(r => r.reason),
      nextDifficulty: analytics.predictedDifficulty
    });
    
    // Preload next likely content
    jitService.preloadNextContent(student.id, containerId.current);
    
    setPhase('complete');
    
    // Calculate overall success
    const practiceCorrect = Object.values(practiceResults).filter(r => r).length;
    const totalQuestions = Object.keys(practiceResults).length + 1; // +1 for assessment
    const overallSuccess = (practiceCorrect + (assessmentCorrect ? 1 : 0)) / totalQuestions > 0.7;
    
    // Update skill progress
    if (overallSuccess) {
      sessionManager.updateSkillProgress(student.id, skill.id, 10);
    }
    
    // Notify parent
    setTimeout(() => {
      onComplete(overallSuccess);
    }, 3000);
  };
  
  const handleUseHint = () => {
    setHintUsed({ ...hintUsed, [currentQuestionIndex]: true });
    
    // Deduct XP for hint if enabled
    if (features.hintsEnabled && features.xpEnabled) {
      awardXP(-5, 'hint_used');
    }
  };
  
  // ================================================================
  // HELPER FUNCTIONS
  // ================================================================
  
  const validateAnswer = (question: Question, answer: any): { 
    correct: boolean; 
    feedback?: string; 
    score: number;
    partialCredit?: any;
  } => {
    if (!question || answer === null || answer === undefined) {
      return { correct: false, score: 0, feedback: 'No answer provided' };
    }
    
    // Use the comprehensive QuestionValidator
    const result: ValidationResult = questionValidator.validateAnswer(question, answer);
    
    // Log for debugging
    console.log(`Answer validation:`, {
      questionType: question.type,
      correct: result.isCorrect,
      score: result.score,
      maxScore: result.maxScore,
      feedback: result.feedback
    });
    
    // Track partial credit if applicable
    if (result.partialCredit) {
      console.log(`Partial credit: ${result.partialCredit.earned}/${result.partialCredit.possible}`);
    }
    
    return {
      correct: result.isCorrect || false,
      feedback: result.feedback,
      score: result.score,
      partialCredit: result.partialCredit
    };
  };
  
  const generateCompanionMessages = (character: any, context: any) => {
    return [
      `Hi! I'm ${character?.name || 'your companion'}! Let's learn about ${context.primarySkill.name} today!`,
      `Great job! You're becoming a real ${context.career.title}!`,
      `Remember, ${context.career.title}s use these skills every day!`,
      `You're doing amazing! Keep practicing!`
    ];
  };
  
  // ================================================================
  // RENDER
  // ================================================================
  
  if (isLoading || phase === 'loading') {
    return (
      <EnhancedLoadingScreen
        message="Preparing your personalized learning journey..."
        companion={character}
        skill={skill}
        career={career}
      />
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }
  
  return (
    <div className={`ai-learn-container-v2 theme-${theme}`}>
      <ContainerNavigationHeader
        title={`Learn: ${skill?.name || 'Loading...'}`}
        onBack={onBack}
        showProgress={true}
        currentStep={
          phase === 'instruction' ? 1 :
          phase === 'practice' ? 2 + currentQuestionIndex :
          phase === 'assessment' ? 2 + content?.practice?.length :
          3 + content?.practice?.length
        }
        totalSteps={3 + (content?.practice?.length || 0)}
      />
      
      <div className="container-content">
        {/* Instruction Phase */}
        {phase === 'instruction' && content && (
          <div className="instruction-phase">
            <AICharacterAvatar
              character={character}
              emotion="happy"
              size="large"
            />
            <div className="instruction-content">
              <h2>Today's Learning Adventure</h2>
              <p>{content.instructions}</p>
              <div className="skill-context">
                <p><strong>Career Focus:</strong> {content.metadata?.careerContext}</p>
                <p><strong>Skill Focus:</strong> {content.metadata?.skillFocus}</p>
                <p><strong>Estimated Time:</strong> {content.metadata?.estimatedTime} minutes</p>
              </div>
              <button 
                className="btn-primary"
                onClick={handleInstructionComplete}
              >
                Start Practice
              </button>
            </div>
          </div>
        )}
        
        {/* Practice Phase */}
        {phase === 'practice' && content && content.practice[currentQuestionIndex] && (
          <div className="practice-phase">
            <div className="question-header">
              <span>Practice Question {currentQuestionIndex + 1} of {content.practice.length}</span>
              {/* XP Display removed - now shown in dock */}
            </div>
            
            <QuestionRenderer
              question={content.practice[currentQuestionIndex]}
              onAnswer={handlePracticeAnswer}
              onHint={handleUseHint}
              showResult={practiceResults[currentQuestionIndex] !== undefined}
              isCorrect={practiceResults[currentQuestionIndex]}
              disabled={practiceResults[currentQuestionIndex] !== undefined}
            />
            
            {practiceResults[currentQuestionIndex] !== undefined && (
              <div className={`feedback ${practiceResults[currentQuestionIndex] ? 'correct' : 'incorrect'}`}>
                {practiceResults[currentQuestionIndex] ? 
                  '✅ Excellent work!' : 
                  '❌ Not quite right, but keep trying!'}
              </div>
            )}
          </div>
        )}
        
        {/* Assessment Phase */}
        {phase === 'assessment' && content && content.assessment && (
          <div className="assessment-phase">
            <div className="question-header">
              <span>Assessment Question</span>
              {/* XP Display removed - now shown in dock */}
            </div>
            
            <QuestionRenderer
              question={content.assessment}
              onAnswer={handleAssessmentAnswer}
              showResult={showAssessmentResult}
              isCorrect={assessmentIsCorrect}
              disabled={showAssessmentResult}
            />
            
            {showAssessmentResult && (
              <div className={`feedback ${assessmentIsCorrect ? 'correct' : 'incorrect'}`}>
                {assessmentIsCorrect ? 
                  '🌟 Outstanding! You\'ve mastered this concept!' : 
                  '💪 Good effort! Let\'s practice more next time.'}
              </div>
            )}
          </div>
        )}
        
        {/* Complete Phase */}
        {phase === 'complete' && (
          <div className="complete-phase">
            <AICharacterAvatar
              character={character}
              emotion="excited"
              size="large"
            />
            <div className="completion-content">
              <h2>Great Job!</h2>
              <p>You've completed the learning session!</p>
              <div className="results-summary">
                <p>Practice: {Object.values(practiceResults).filter(r => r).length}/{content?.practice?.length || 0} correct</p>
                <p>Assessment: {assessmentIsCorrect ? 'Passed ✅' : 'Needs more practice 📚'}</p>
              </div>
              <button 
                className="btn-primary"
                onClick={onNext}
              >
                Continue Journey
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Floating Dock */}
      <FloatingLearningDock
        isOpen={true}
        onToggle={() => {}}
        character={character}
        onOpenChat={() => setIsChatOpen(true)}
        showHint={phase === 'practice' && features.hintsEnabled}
        onHint={handleUseHint}
        hintUsed={hintUsed[currentQuestionIndex]}
      />
      
      {/* Chat Box */}
      {isChatOpen && (
        <CompanionChatBox
          character={character}
          onClose={() => setIsChatOpen(false)}
          initialMessage={companionMessage || content?.companion_messages?.[0]}
        />
      )}
    </div>
  );
};

export default AILearnContainerV2;