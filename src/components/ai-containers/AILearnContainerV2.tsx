/**
 * AI-FIRST LEARN CONTAINER V2
 * Enhanced version using the AIRulesEngine architecture
 * Fixes all diagnostic practice bugs through centralized rules
 */

import React, { useState, useEffect, useRef } from 'react';
import { aiLearningJourneyService, AILearnContent, StudentProfile, LearningSkill } from '../../services/AILearningJourneyService';
import { unifiedLearningAnalyticsService } from '../../services/unifiedLearningAnalyticsService';
import { learningMetricsService } from '../../services/learningMetricsService';
import { companionReactionService } from '../../services/companionReactionService';
import { voiceManagerService } from '../../services/voiceManagerService';
import { companionVoiceoverService } from '../../services/companionVoiceoverService';
// Using LearnAIRulesEngine instead of old lightweightPracticeSupportService
import { learnAIRulesEngine } from '../../rules-engine/containers/LearnAIRulesEngine';
import { questionTypeValidator } from '../../services/questionTypeValidator';
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
import { contentCacheService } from '../../services/contentCacheService';
import { premiumDemoContentV2 } from '../../services/PremiumDemoContentServiceV2';
import { iconVisualService } from '../../services/iconVisualService';
import { preGenerationService } from '../../services/PreGenerationService';

// RULES ENGINE INTEGRATION
import { 
  useLearnRules, 
  useCompanionRules, 
  useGamificationRules,
  useMasterOrchestration 
} from '../../rules-engine/integration/ContainerIntegration';

// Import CSS modules for consistent styling
// Import CSS modules and container styles
import '../../styles/containers/LearnContainer.css';
import questionStyles from '../../styles/shared/components/QuestionCard.module.css';
import lessonStyles from '../../styles/shared/screens/LessonScreen.module.css';
import practiceStyles from '../../styles/shared/screens/PracticeScreen.module.css';
import assessmentStyles from '../../styles/shared/screens/AssessmentScreen.module.css';
import completionStyles from '../../styles/shared/screens/CompletionScreen.module.css';
import loadingStyles from '../../styles/shared/screens/LoadingScreen.module.css';
import feedbackStyles from '../../styles/shared/components/FeedbackMessages.module.css';
import buttonStyles from '../../styles/shared/components/NavigationButtons.module.css';
import './AILearnContainer.css'; // Keep for now, will phase out later

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

// ================================================================
// AI LEARN CONTAINER V2 COMPONENT
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
  // Debug props received
  console.log('🔍 AILearnContainerV2 Props:', {
    hasStudent: !!student,
    hasSkill: !!skill,
    studentGrade: student?.grade,
    skillName: skill?.name,
    selectedCharacter,
    selectedCareer
  });
  
  // Rules Engine Hooks
  const learnRules = useLearnRules();
  const companionRules = useCompanionRules();
  const gamificationRules = useGamificationRules();
  const masterOrchestration = useMasterOrchestration();
  
  // State Management
  const [phase, setPhase] = useState<LearningPhase>('loading');
  const [content, setContent] = useState<AILearnContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Debug phase changes
  useEffect(() => {
    console.log('📍 PHASE CHANGED TO:', phase, { 
      hasContent: !!content, 
      isLoading,
      timestamp: new Date().toISOString() 
    });
  }, [phase]);
  const [error, setError] = useState<string | null>(null);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, any>>({});
  const [practiceResults, setPracticeResults] = useState<Record<number, boolean>>({});
  const [assessmentAnswer, setAssessmentAnswer] = useState<any>(null);
  const [showAssessmentResult, setShowAssessmentResult] = useState(false);
  const [assessmentIsCorrect, setAssessmentIsCorrect] = useState(false);
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
  const { features, awardXP, profile } = usePathIQGamification(student?.id || 'default', student?.grade_level);
  const theme = useTheme();
  
  // Refs
  const practiceStartTime = useRef<number>(Date.now());
  const assessmentStartTime = useRef<number>(Date.now());
  const interactionCount = useRef<number>(0);
  
  // Character and Career
  // Fix: Convert selectedCharacter (name) to id for proper lookup
  const characterId = selectedCharacter ? selectedCharacter.toLowerCase() : (currentCharacter?.id || 'finn');
  const character = aiCharacterProvider.getCharacterById(characterId) || currentCharacter;
  const career = selectedCareer?.name || 'Explorer';
  
  // Debug logging to track career selection
  console.log('🎯 AILearnContainerV2 Career Debug:', {
    selectedCareer,
    careerName: selectedCareer?.name,
    extractedCareer: career,
    characterId,
    character: character ? { id: character.id, name: character.name } : null
  });
  
  // ================================================================
  // CONTENT GENERATION WITH RULES ENGINE
  // ================================================================
  
  // Use a ref to track if content has been generated
  const contentGeneratedRef = useRef(false);
  
  useEffect(() => {
    // Only generate content once
    if (contentGeneratedRef.current) {
      console.log('⏭️ SKIPPING CONTENT GENERATION - already generated');
      return;
    }
    
    const generateContent = async () => {
      console.log('🚀 GENERATING NEW CONTENT - first time');
      contentGeneratedRef.current = true;
      setIsLoading(true);
      setError(null);
      setPhase('loading'); // Ensure we're in loading phase
      
      try {
        // Orchestrate content generation through master rules engine
        const orchestrationContext = {
          student: {
            id: student.id,
            grade: student.grade_level,
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
        
        // Use master orchestration for coordinated content generation
        const orchestrationResult = await masterOrchestration.orchestrate(orchestrationContext);
        
        // Check cache first
        const cacheParams = {
          student_id: student.id,
          grade_level: student.grade_level,
          subject: skill.subject,
          skill_id: skill.id,
          container_type: 'learn',
          question_type: undefined // Auto-detect
        };
        
        let generatedContent = await preGenerationService.checkCache(cacheParams);
        
        if (!generatedContent) {
          // Not in cache, generate new content
          console.log('📤 Cache miss, generating new content');
          
          // Ensure career is in the correct format for the AI service
          const careerObject = typeof career === 'string' 
            ? { name: career } 
            : career;
          
          const startTime = Date.now();
          generatedContent = await aiLearningJourneyService.generateLearnContent(
            skill,
            student,
            careerObject
          );
          
          // Store in cache for future use
          await preGenerationService.storeInCache({
            ...cacheParams,
            content: generatedContent,
            generation_time_ms: Date.now() - startTime,
            ai_model: 'gpt-4o'
          });
          
          // Trigger predictive pre-loading for next content
          preGenerationService.predictivePreload({
            student_id: student.id,
            current_container: 'learn',
            current_skill: skill.id,
            subject: skill.subject,
            grade_level: student.grade
          });
        } else {
          console.log('✅ Cache hit, using pre-generated content');
        }
        
        // Apply career context to questions using rules engine
        if (generatedContent.practice) {
          for (let i = 0; i < generatedContent.practice.length; i++) {
            generatedContent.practice[i] = await learnRules.applyCareerContext(
              generatedContent.practice[i],
              career,
              skill.subject,
              student.grade
            );
          }
        }
        
        if (generatedContent.assessment) {
          generatedContent.assessment = await learnRules.applyCareerContext(
            generatedContent.assessment,
            career,
            skill.subject,
            student.grade
          );
        }
        
        // Validate question structures
        if (generatedContent.practice) {
          generatedContent.practice = generatedContent.practice.filter(q => 
            learnRules.validateQuestionStructure(q)
          );
        }
        
        setContent(generatedContent);
        setPhase('instruction');
        
        // Get initial companion message
        const companionResponse = await companionRules.getCompanionMessage(
          character?.id || characterId.toLowerCase(),
          career,
          'start_lesson',
          { grade: student.grade_level, skill: skill.name }
        );
        
        setCompanionMessage(companionResponse.message);
        setCompanionEmotion(companionResponse.emotion);
        
      } catch (err) {
        console.error('Content generation error:', err);
        setError('Failed to generate learning content. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    generateContent();
  }, [student?.id, skill?.id, character?.id, career]); // Use IDs to prevent re-renders from object changes
  
  // ================================================================
  // ANSWER VALIDATION WITH RULES ENGINE
  // ================================================================
  
  const handlePracticeAnswer = async (questionIndex: number, answer: any) => {
    console.log('🔴 handlePracticeAnswer called!', { questionIndex, answer });
    
    if (!content) return;
    
    const question = content.practice[questionIndex];
    
    console.log('🎯 Practice Question Validation:', {
      questionIndex,
      question: question.question,
      type: question.type,
      userAnswer: answer,
      correctAnswer: question.correct_answer,
      hasOptions: !!question.options,
      options: question.options
    });
    
    setPracticeAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    
    // Use rules engine for validation (FIXES CORRECT ANSWERS BUG)
    const validationResult = await learnRules.validateAnswer(
      question.type || 'numeric', // Default to numeric if type is missing
      answer,
      question.correct_answer,
      skill.subject,
      student.grade
    );
    
    setPracticeResults(prev => ({ 
      ...prev, 
      [questionIndex]: validationResult.isCorrect 
    }));
    
    // Get companion reaction based on result
    const triggerType = validationResult.isCorrect ? 'correct_answer' : 'incorrect_answer';
    const companionResponse = await companionRules.getCompanionMessage(
      character?.id || characterId.toLowerCase(),
      career,
      triggerType,
      { 
        grade: student.grade_level, 
        attempts: interactionCount.current,
        question: question.question
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
        console.log('Achievement unlocked:', achievement.name);
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
        questionType: question.type,
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
    if (!content || assessmentAnswer === null) return;
    
    // Determine the actual type based on the content structure
    let assessmentType = content.assessment.type;
    let correctAnswerToValidate = content.assessment.correct_answer;
    
    // If type is undefined, determine from structure
    if (!assessmentType) {
      if (content.assessment.options && Array.isArray(content.assessment.options)) {
        // Has options array - it's multiple choice
        assessmentType = 'multiple_choice';
        // If correct_answer is an index and user entered a number, get the option value
        if (typeof content.assessment.correct_answer === 'number' && 
            content.assessment.correct_answer < content.assessment.options.length) {
          // The correct answer is the option at the index
          const correctOption = content.assessment.options[content.assessment.correct_answer];
          // Extract the number from the option (e.g., "3" from "3 weights")
          const match = correctOption.match(/^(\d+)/);
          correctAnswerToValidate = match ? match[1] : correctOption;
        }
      } else if (content.assessment.visual) {
        // Has visual but no options - it's counting
        assessmentType = 'counting';
        // For counting, the answer should be the actual count
        // Count the emojis in the visual
        const emojiCount = (content.assessment.visual.match(/[\p{Emoji}]/gu) || []).length;
        correctAnswerToValidate = String(emojiCount);
      } else {
        // Default to numeric
        assessmentType = 'numeric';
      }
    }
    
    // CRITICAL FIX: For counting type questions, always use the emoji count as the correct answer
    // not the index from correct_answer field
    if (assessmentType === 'counting' && content.assessment.visual) {
      const emojiCount = (content.assessment.visual.match(/[\p{Emoji}]/gu) || []).length;
      correctAnswerToValidate = String(emojiCount);
      console.log(`🔢 Counting question detected: ${emojiCount} items in visual`);
    } else if (assessmentType === 'counting' && content.assessment.options && 
               typeof content.assessment.correct_answer === 'number') {
      // If it's marked as counting but has options, get the value from options array
      correctAnswerToValidate = content.assessment.options[content.assessment.correct_answer];
    }
    
    
    // Use rules engine for validation
    const validationResult = await learnRules.validateAnswer(
      assessmentType,
      assessmentAnswer,
      correctAnswerToValidate,
      skill.subject,
      student.grade
    );
    
    console.log('✅ Validation Result:', validationResult);
    
    const responseTime = Date.now() - questionStartTime;
    setShowAssessmentResult(true);
    setAssessmentIsCorrect(validationResult.isCorrect);
    
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
        grade: student.grade_level,
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
  
  const handleAssessmentContinue = () => {
    // Transition to complete phase when user clicks Continue after assessment
    setPhase('complete');
    onComplete(assessmentIsCorrect);
  };
  
  const handleStartPractice = () => {
    setPhase('practice');
    setCurrentPracticeQuestion(0); // Start with first question
    practiceStartTime.current = Date.now();
    setQuestionStartTime(Date.now());
    
    // Initialize practice support
    if (content?.practice) {
      const supportItems = content.practice.map(q => ({
        type: 'hint',
        content: `Think about ${q.question.substring(0, 30)}...`,
        available: true
      }));
      setDockItems(supportItems);
    }
  };
  
  const handleStartAssessment = () => {
    setPhase('assessment');
    assessmentStartTime.current = Date.now();
    setQuestionStartTime(Date.now());
  };
  
  const handleComplete = () => {
    const allPracticeCorrect = Object.values(practiceResults).every(r => r);
    onComplete(allPracticeCorrect && assessmentIsCorrect);
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
  
  return (
    <div className="ai-learn-container container-learn" data-theme={theme}>
      <ContainerNavigationHeader
        title={skill.name}
        phase={phase}
        onBack={onBack}
        showProgress={true}
        progress={phase === 'practice' ? 
          (Object.keys(practiceResults).length / content.practice.length) * 100 : 
          phase === 'assessment' ? 75 : 
          phase === 'complete' ? 100 : 25
        }
      />
      
      {/* XP Display removed - now shown in dock */}
      
      <div className="container-content">
        {/* Instruction Phase */}
        {phase === 'instruction' && (
          <div className={lessonStyles.instructionPhase}>
            <div className={lessonStyles.instructionCard}>
              <div className={lessonStyles.companionAvatarContainer}>
                <AICharacterAvatar 
                  character={character}
                  emotion={companionEmotion}
                  size="large"
                />
              </div>
              
              <div className={lessonStyles.instructionContent}>
                <h2 className={lessonStyles.instructionTitle}>Today's Learning Goal</h2>
                <p className={lessonStyles.learningGoal}>{content.learning_goal || content.title || "Learning Math Skills"}</p>
              
                <div className={lessonStyles.instructionMessages}>
                  {content.instruction && Array.isArray(content.instruction) ? 
                    content.instruction.map((msg, idx) => (
                      <div 
                        key={idx}
                        className={`${lessonStyles.instructionMessage} ${idx <= currentMessageIndex ? lessonStyles.visible : ''}`}
                      >
                        <p>{msg}</p>
                      </div>
                    )) : 
                    <div className={`${lessonStyles.instructionMessage} ${lessonStyles.visible}`}>
                      <p>{content.concept || "Let's learn together!"}</p>
                    </div>
                  }
                </div>
                
                <button 
                  className={`${buttonStyles.primary} ${buttonStyles.learnVariant}`}
                  onClick={handleStartPractice}
                >
                  Start Practice
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Practice Phase */}
        {phase === 'practice' && content && (
          <div className={practiceStyles.practicePhase}>
            <div className={questionStyles.questionCard}>
              <div className={questionStyles.questionHeader}>
                <span className={questionStyles.questionNumber}>
                  Question {currentPracticeQuestion + 1} of {content.practice.length}
                </span>
              </div>
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
                const question = content.practice[currentPracticeQuestion];
                const idx = currentPracticeQuestion;
                return (
                <>
                  <div className={questionStyles.questionContent}>
                    <p className={questionStyles.questionText}>{question.question}</p>
                    
                    {question.visual && (
                      <VisualRenderer visual={question.visual} />
                    )}
                    
                    {question.type === 'multiple_choice' && (
                      <div className={questionStyles.answerOptions}>
                        {question.options.map((option, optIdx) => (
                          <button
                            key={optIdx}
                            className={`${questionStyles.optionButton} ${
                              practiceAnswers[idx] === optIdx ? questionStyles.selected : ''
                            } ${
                              practiceResults[idx] !== undefined ?
                                (practiceResults[idx] && practiceAnswers[idx] === optIdx ? questionStyles.correct :
                                 !practiceResults[idx] && practiceAnswers[idx] === optIdx ? questionStyles.incorrect :
                                 optIdx === question.correct_answer ? questionStyles.showCorrect : '') : ''
                            }`}
                            onClick={() => handlePracticeAnswer(idx, optIdx)}
                            disabled={practiceResults[idx] !== undefined}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {(question.type === 'true_false' || question.type === 'true_false_w_image' || question.type === 'true_false_wo_image') && (
                      <div className={questionStyles.trueFalseOptions}>
                        <button
                          className={`${questionStyles.trueFalseButton} ${
                            practiceAnswers[idx] === 'true' ? questionStyles.selected : ''
                          } ${practiceResults[idx] === 'correct' && practiceAnswers[idx] === 'true' ? questionStyles.correct : ''}`}
                          onClick={() => handlePracticeAnswer(idx, 'true')}
                          disabled={practiceResults[idx] !== undefined}
                        >
                          {question.type === 'true_false_w_image' || question.visual ? 'True' : '✓ True'}
                        </button>
                        <button
                          className={`${questionStyles.trueFalseButton} ${
                            practiceAnswers[idx] === 'false' ? questionStyles.selected : ''
                          } ${practiceResults[idx] === 'correct' && practiceAnswers[idx] === 'false' ? questionStyles.correct : ''}`}
                          onClick={() => handlePracticeAnswer(idx, 'false')}
                          disabled={practiceResults[idx] !== undefined}
                        >
                          {question.type === 'true_false_w_image' || question.visual ? 'False' : '✗ False'}
                        </button>
                      </div>
                    )}
                    
                    {(question.type === 'counting' || question.type === 'numeric') && (
                      <div className={questionStyles.numericInput}>
                        <input
                          type="number"
                          className={questionStyles.answerInput}
                          placeholder="Enter your answer"
                          value={practiceAnswers[idx] || ''}
                          onChange={(e) => setPracticeAnswers(prev => ({
                            ...prev,
                            [idx]: e.target.value
                          }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handlePracticeAnswer(idx, practiceAnswers[idx]);
                            }
                          }}
                          disabled={practiceResults[idx] !== undefined}
                        />
                        <button
                          className={questionStyles.submitButton}
                          onClick={() => handlePracticeAnswer(idx, practiceAnswers[idx])}
                          disabled={!practiceAnswers[idx] || practiceResults[idx] !== undefined}
                        >
                          Submit
                        </button>
                      </div>
                    )}
                    
                  </div>
                  {practiceResults[idx] !== undefined && (
                    <div className={questionStyles.feedbackContainer}>
                      <div className={`${questionStyles.feedbackMessage} ${practiceResults[idx] ? questionStyles.correct : questionStyles.incorrect}`}>
                        <span className={questionStyles.feedbackIcon}>
                          {practiceResults[idx] ? '✓' : '✗'}
                        </span>
                        <span className={questionStyles.feedbackText}>
                          {practiceResults[idx] ? 'Correct!' : (() => {
                            // Handle different question types
                            if (question.type === 'true_false') {
                              // For True/False, use the correctAnswer field from converted question
                              const correctValue = question.correctAnswer !== undefined ? 
                                (question.correctAnswer ? 'True' : 'False') : 
                                (question.correct_answer === true || question.correct_answer === 'true' ? 'True' : 'False');
                              return `The correct answer is ${correctValue}`;
                            } else {
                              // For other types, use the original correct_answer
                              return `The correct answer is ${question.correct_answer}`;
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
            
            <div className="practice-navigation">
              {practiceResults[currentPracticeQuestion] !== undefined && 
               currentPracticeQuestion < content.practice.length - 1 && (
                <button 
                  className={`${buttonStyles.primary} ${buttonStyles.learnVariant}`}
                  onClick={() => {
                    setCurrentPracticeQuestion(currentPracticeQuestion + 1);
                    setQuestionStartTime(Date.now());
                  }}
                >
                  Next Question →
                </button>
              )}
              
              {Object.keys(practiceResults).length === content.practice.length && (
                <button 
                  className={`${buttonStyles.primary} ${buttonStyles.learnVariant}`}
                  onClick={handleStartAssessment}
                >
                  Continue to Assessment
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Assessment Phase */}
        {phase === 'assessment' && (
          <div className={assessmentStyles.assessmentPhase}>
            <h2 className={assessmentStyles.assessmentTitle}>Assessment Question</h2>
            
            <div className={assessmentStyles.assessmentQuestion}>
              <p className={assessmentStyles.questionText}>{content.assessment.question}</p>
              
              {content.assessment.visual && (
                <>
                  {console.log('📊 Assessment Content:', {
                    question: content.assessment.question,
                    visual: content.assessment.visual,
                    type: content.assessment.type,
                    correct_answer: content.assessment.correct_answer,
                    options: content.assessment.options,
                    optionValues: content.assessment.options ? 
                      content.assessment.options.map((opt, idx) => `[${idx}]: ${opt}`) : null,
                    expectedAnswer: content.assessment.options && typeof content.assessment.correct_answer === 'number' ?
                      `Index ${content.assessment.correct_answer} = "${content.assessment.options[content.assessment.correct_answer]}"` : 
                      content.assessment.correct_answer
                  })}
                  <VisualRenderer visual={content.assessment.visual} />
                </>
              )}
              
              {content.assessment.type === 'multiple_choice' && (
                <div className={questionStyles.answerOptions}>
                  {content.assessment.options.map((option, idx) => (
                    <button
                      key={idx}
                      className={`${buttonStyles.secondary} ${assessmentAnswer === idx ? buttonStyles.selected : ''}`}
                      onClick={() => setAssessmentAnswer(idx)}
                      disabled={showAssessmentResult}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
              
              {(content.assessment.type === 'true_false' || 
                content.assessment.type === 'true_false_w_image' || 
                content.assessment.type === 'true_false_wo_image') && (
                <div className={questionStyles.trueFalseOptions}>
                  <button
                    className={`${buttonStyles.secondary} ${assessmentAnswer === 'true' ? buttonStyles.selected : ''}`}
                    onClick={() => setAssessmentAnswer('true')}
                    disabled={showAssessmentResult}
                  >
                    ✓ True
                  </button>
                  <button
                    className={`${buttonStyles.secondary} ${assessmentAnswer === 'false' ? buttonStyles.selected : ''}`}
                    onClick={() => setAssessmentAnswer('false')}
                    disabled={showAssessmentResult}
                  >
                    ✗ False
                  </button>
                </div>
              )}
              
              {(content.assessment.type === 'counting' || content.assessment.type === 'numeric' || !content.assessment.type) && (
                <div className={questionStyles.numericInput}>
                  <input
                    type="number"
                    className={questionStyles.answerInput}
                    placeholder="Enter your answer"
                    value={assessmentAnswer !== null ? assessmentAnswer : ''}
                    onChange={(e) => {
                      // Keep as string for counting questions to match correct_answer format
                      const value = e.target.value;
                      // If type is undefined but has visual, treat as counting
                      const isCountingType = content.assessment.type === 'counting' || 
                                           (!content.assessment.type && content.assessment.visual);
                      
                      if (isCountingType) {
                        setAssessmentAnswer(value || null);
                      } else {
                        // For numeric type, convert to number
                        setAssessmentAnswer(value ? parseInt(value) : null);
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && assessmentAnswer !== null) {
                        handleAssessmentSubmit();
                      }
                    }}
                    disabled={showAssessmentResult}
                  />
                  <button
                    className={questionStyles.submitButton}
                    onClick={handleAssessmentSubmit}
                    disabled={assessmentAnswer === null || showAssessmentResult}
                  >
                    Submit
                  </button>
                </div>
              )}
              
              {!showAssessmentResult && assessmentAnswer !== null && content.assessment.type === 'multiple_choice' && (
                <button 
                  className={`${buttonStyles.primary} ${buttonStyles.learnVariant}`}
                  onClick={handleAssessmentSubmit}
                >
                  Submit Answer
                </button>
              )}
              
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
                        content.assessment.success_message || 'Excellent work!' : 
                        `The correct answer was: ${content.assessment.options ? content.assessment.options[content.assessment.correct_answer] : content.assessment.correct_answer}`
                      }
                      {content.assessment.explanation && (
                        <p className={feedbackStyles.explanation}>{content.assessment.explanation}</p>
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
            <p className={completionStyles.completionSubtitle}>You've completed the lesson on {skill.name}!</p>
            
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
      </div>
      
      {/* Companion Chat */}
      {companionMessage && (
        <CompanionChatBox
          companionName={character?.name || characterId}
          companionEmoji={character?.id === 'spark' ? '⚡' : character?.id === 'sage' ? '🧙' : character?.id === 'harmony' ? '🎵' : '🤖'}
          message={{ text: companionMessage, emotion: companionEmotion }}
        />
      )}
      
      {/* Learning Support Dock - Available in all phases */}
      <>
        {console.log('🚢 Passing to FloatingLearningDock:', {
          companionName: character?.name || 'Finn',
          companionId: character?.id || characterId || 'finn',
          character,
          characterId,
          selectedCharacter
        })}
        <FloatingLearningDock
          companionName={character?.name || 'Finn'}
          companionId={character?.id || characterId || 'finn'}
          userId={student?.id || 'default'}
          currentQuestion={phase === 'practice' && currentPracticeQuestion < content?.practice?.length ? content?.practice[currentPracticeQuestion]?.question : undefined}
          currentSkill={skill.skill_name}
          questionNumber={phase === 'practice' ? currentPracticeQuestion + 1 : undefined}
          totalQuestions={phase === 'practice' ? content?.practice?.length || 0 : 0}
          theme={theme}
        />
      </>
    </div>
  );
};

export default AILearnContainerV2;