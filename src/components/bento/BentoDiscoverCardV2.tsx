// ================================================================
// BENTO DISCOVER CARD V2 - Discovery Through Career Events
// Field trips to real-world career events (vs Career Inc headquarters)
// ================================================================

import React, { useState, useEffect } from 'react';
import { Book, Star, Trophy, Sparkles, ArrowRight, ChevronLeft, Award, CheckCircle, Target, MapPin, Calendar } from 'lucide-react';
import styles from './DiscoverCard.module.css';
import completionStyles from '../../styles/shared/screens/CompletionScreen.module.css';

// Career Event Mapping - Where professionals showcase their skills
const CAREER_EVENTS: Record<string, { event: string; emoji: string }> = {
  'chef': { event: 'Cooking Competition', emoji: '👨‍🍳' },
  'police-officer': { event: 'County Fair', emoji: '👮' },
  'firefighter': { event: 'Charity Event', emoji: '🚒' },
  'teacher': { event: 'Parent Conference', emoji: '👩‍🏫' },
  'doctor': { event: 'Health Screening', emoji: '👨‍⚕️' },
  'nurse': { event: 'Wellness Fair', emoji: '👩‍⚕️' },
  'dentist': { event: 'Oral Health Fair', emoji: '🦷' },
  'veterinarian': { event: 'Pet Adoption Event', emoji: '🐾' },
  'coach': { event: 'Championship Game', emoji: '🏃' },
  'artist': { event: 'Art Exhibition', emoji: '🎨' },
  'musician': { event: 'Concert Performance', emoji: '🎵' },
  'scientist': { event: 'Science Fair', emoji: '🔬' },
  'engineer': { event: 'STEM Showcase', emoji: '⚙️' },
  'programmer': { event: 'Hackathon', emoji: '💻' },
  'architect': { event: 'Building Tour', emoji: '🏗️' },
  'park-ranger': { event: 'Nature Festival', emoji: '🌲' },
  'farmer': { event: 'Harvest Festival', emoji: '🌾' },
  'pilot': { event: 'Air Show', emoji: '✈️' },
  'astronaut': { event: 'Space Camp', emoji: '🚀' },
  'default': { event: 'Career Day', emoji: '⭐' }
};

interface BentoDiscoverCardProps {
  screenType: 'intro' | 'scenario' | 'completion';
  skill: any;
  career: {
    id?: string;
    name: string;
    icon: string;
    description: string;
  };
  companion: {
    id: string;
    name: string;
    trait: string;
  };
  aiContent?: any;
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
      subject?: string;
      description: string;
      question?: string;
      context?: string;
      options: string[];
      correct_choice: number;
      outcome?: string;
      explanation?: string;
    }>;
  };
  gradeLevel: string;
  studentName: string;
  currentChallengeIndex?: number;
  totalChallenges?: number;
  currentScenarioIndex?: number;
  isLoading?: boolean;
  onComplete?: (success: boolean) => void;
  onNavNext?: () => void;
  onNavPrev?: () => void;
  onBack?: () => void;
  totalSubjects?: number;
  currentSubjectIndex?: number;
  student?: any;
  selectedCareer?: any;
}

export const BentoDiscoverCardV2: React.FC<BentoDiscoverCardProps> = ({
  screenType: initialScreenType,
  skill,
  career,
  companion,
  aiContent,
  challengeData,
  gradeLevel,
  studentName,
  currentChallengeIndex = 0,
  totalChallenges = 1,
  currentScenarioIndex = 0,
  isLoading = false,
  onComplete,
  onNavNext,
  onNavPrev,
  onBack,
  totalSubjects = 4,
  currentSubjectIndex = 0,
  student,
  selectedCareer
}) => {
  const [screenType, setScreenType] = useState<'intro' | 'scenario' | 'completion'>(initialScreenType || 'intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  // Get career event for this career
  const careerId = career?.id || career?.name?.toLowerCase().replace(/\s+/g, '-') || 'default';
  const careerEvent = CAREER_EVENTS[careerId] || CAREER_EVENTS['default'];

  // Subject order for discovery scenarios
  const SUBJECTS = ['Math', 'ELA', 'Science', 'Social Studies'];

  // Get scenarios with subject labels if not provided
  const scenarios = challengeData?.scenarios || [];
  const enhancedScenarios = scenarios.map((scenario, index) => ({
    ...scenario,
    subject: scenario.subject || SUBJECTS[index] || 'Discovery'
  }));

  // Handle screen transitions
  useEffect(() => {
    setScreenType(initialScreenType || 'intro');
  }, [initialScreenType]);

  // Calculate progress
  const calculateProgress = () => {
    if (enhancedScenarios.length === 0) return 0;
    return ((currentQuestionIndex + 1) / enhancedScenarios.length) * 100;
  };

  // Handle answer selection
  const handleAnswerSelect = (index: number) => {
    if (showFeedback) return;
    setSelectedAnswerIndex(index);
  };

  // Submit answer
  const submitAnswer = () => {
    if (selectedAnswerIndex === null) return;

    const currentScenario = enhancedScenarios[currentQuestionIndex];
    const isCorrect = selectedAnswerIndex === (currentScenario.correct_choice || 0);

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setXpEarned(prev => prev + 15);
    }

    setTotalQuestions(prev => prev + 1);
    setShowFeedback(true);

    console.log('🔍 BentoDiscoverCardV2 - Answer submitted:', {
      question: currentQuestionIndex + 1,
      subject: currentScenario.subject,
      correct: isCorrect,
      xpEarned: isCorrect ? 15 : 0
    });
  };

  // Continue to next question
  const continueToNext = () => {
    setShowFeedback(false);
    setSelectedAnswerIndex(null);

    if (currentQuestionIndex < enhancedScenarios.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Move to completion
      setScreenType('completion');
      console.log('🎉 BentoDiscoverCardV2 - Discovery complete!', {
        correctAnswers,
        totalQuestions: enhancedScenarios.length,
        xpEarned
      });
    }
  };

  // Render introduction screen with Bento tiles
  const renderIntroduction = () => (
    <div className={styles.introContainer}>
      {/* Welcome Header Tile */}
      <div className={styles.welcomeHeader}>
        <div className={styles.welcomeTile}>
          <div className={styles.tilePattern} />
          <div className={styles.companionAvatar}>
            <img
              src={`/images/companions/${companion?.id || 'finn'}-light.png`}
              alt={companion?.name || 'Companion'}
              className={styles.companionImage}
            />
          </div>
          <div className={styles.welcomeContent}>
            <h1 className={styles.welcomeTitle}>
              {career?.name} {studentName} - Field Trip Time! {careerEvent.emoji}
            </h1>
            <p className={styles.welcomeMessage}>
              Did you know that you can use your NEW skills in surprising ways?
              Today, {companion?.name} is taking you on a special field trip!
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Event and Discovery */}
      <div className={styles.tilesRow}>
        {/* Career Event Tile */}
        <div className={styles.storyTile}>
          <div className={styles.storyPattern} />
          <div className={styles.storyContent}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}><MapPin className="w-5 h-5 inline" /></span>
              Today's Event: {careerEvent.event}
            </h2>
            <p className={styles.storyDescription}>
              Let's explore how {career?.name} {studentName} uses skills at the {careerEvent.event}!
              You'll discover amazing connections between what you're learning and real-world events.
            </p>
          </div>
        </div>

        {/* Discovery Subjects Tile */}
        <div className={styles.skillsTile}>
          <div className={styles.skillsPattern} />
          <div className={styles.skillsContent}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>🌟</span>
              4 Amazing Discoveries
            </h2>
            <div className={styles.subjectsList}>
              {SUBJECTS.map((subject, index) => (
                <div key={subject} className={styles.subjectItem}>
                  <span className={styles.subjectNumber}>{index + 1}</span>
                  <span className={styles.subjectName}>{subject} Discovery</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mission Tile */}
      <div className={styles.missionTile}>
        <div className={styles.missionPattern} />
        <div className={styles.missionContent}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🔍</span>
            Your Discovery Mission
          </h2>
          <div className={styles.missionList}>
            <ul className={styles.challengeList}>
              <li>Join {career?.name} {studentName} at the {careerEvent.event}</li>
              <li>Discover how {skill?.name} appears in Math, ELA, Science & Social Studies</li>
              <li>Answer questions to unlock new insights</li>
              <li>Earn XP for each discovery you make!</li>
            </ul>
            <div className={styles.scenarioIndicator}>
              <div className={styles.scenarioDots}>
                {SUBJECTS.map((_, i) => (
                  <span key={i} className={styles.scenarioDot} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            console.log('🔍 BentoDiscoverCardV2 - Starting discovery at', careerEvent.event);
            setScreenType('scenario');
          }}
          className={styles.startButton}
        >
          <span>Start Field Trip</span>
          <span className={styles.startButtonArrow}>→</span>
        </button>
      </div>
    </div>
  );

  // Render scenario/question screen
  const renderScenario = () => {
    const currentScenario = enhancedScenarios[currentQuestionIndex];
    if (!currentScenario) {
      console.error('🔍 BentoDiscoverCardV2 - No scenario found!');
      return null;
    }

    // Determine scenario type for styling
    const scenarioType = currentQuestionIndex < 3 ? 'explore' :
                        currentQuestionIndex < 5 ? 'practice' : 'challenge';

    return (
      <div className={styles.scenarioContainer}>
        {/* Progress Header */}
        <div className={styles.progressHeader}>
          <div className={styles.progressInfo}>
            <span className={styles.progressLabel}>
              {careerEvent.event} - {currentScenario.subject} Discovery
            </span>
            <span className={styles.progressCount}>
              Discovery {currentQuestionIndex + 1} of {enhancedScenarios.length}
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>

        {/* Horizontal Tiles Row */}
        <div className={styles.scenarioTilesRow}>
          {/* Field Trip Event Context */}
          <div className={styles.eventContextTile}>
            <div className={styles.eventHeader}>
              <span className={styles.eventIcon}>{careerEvent.emoji}</span>
              <h3 className={styles.eventTitle}>Field Trip: {careerEvent.event}</h3>
            </div>
            <p className={styles.eventDescription}>
              {currentScenario.context ||
               `You're at the ${careerEvent.event} discovering how ${career?.name}s use ${currentScenario.subject || skill?.name} in amazing ways!`}
            </p>
          </div>

          {/* Discovery Question */}
          <div className={styles.questionTile}>
            <div className={styles.questionHeader}>
              <span className={`${styles.scenarioBadge} ${styles[scenarioType]}`}>
                {scenarioType === 'explore' ? '🔍 Explore' :
                 scenarioType === 'practice' ? '✨ Practice' : '🏆 Challenge'}
              </span>
              {currentScenario.title && (
                <span className={styles.questionTitle}>{currentScenario.title}</span>
              )}
            </div>
            <h3 className={styles.questionText}>
              {currentScenario.description || currentScenario.question || 'Discovery Challenge'}
            </h3>
          </div>
        </div>

        {/* Options */}
        <div className={styles.optionsGrid}>
          {(currentScenario.options || []).map((option: string, index: number) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(index)}
              className={`${styles.optionButton} ${
                selectedAnswerIndex === index ? styles.optionSelected : ''
              } ${
                showFeedback && index === currentScenario.correct_choice ? styles.optionCorrect : ''
              } ${
                showFeedback && selectedAnswerIndex === index && index !== currentScenario.correct_choice
                  ? styles.optionIncorrect : ''
              }`}
              disabled={showFeedback}
            >
              <span className={styles.optionNumber}>{index + 1}</span>
              <span className={styles.optionText}>{option}</span>
            </button>
          ))}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={styles.feedbackSection}>
            <div className={`${styles.feedbackCard} ${
              selectedAnswerIndex === currentScenario.correct_choice
                ? styles.feedbackCorrect
                : styles.feedbackIncorrect
            }`}>
              <div className={styles.feedbackIcon}>
                {selectedAnswerIndex === currentScenario.correct_choice ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <Target className="w-6 h-6" />
                )}
              </div>
              <div className={styles.feedbackContent}>
                <h4 className={styles.feedbackTitle}>
                  {selectedAnswerIndex === currentScenario.correct_choice
                    ? `Amazing Discovery at the ${careerEvent.event}!`
                    : 'Let\'s explore that further...'}
                </h4>
                <p className={styles.feedbackText}>
                  {currentScenario.outcome || currentScenario.explanation ||
                   'Keep discovering new connections!'}
                </p>
                {currentScenario.learning_point && (
                  <div className={styles.learningPoint}>
                    <strong>💡 {career?.name} Insight:</strong>
                    <p>{currentScenario.learning_point}</p>
                  </div>
                )}
                {selectedAnswerIndex === currentScenario.correct_choice && (
                  <>
                    <p className={styles.xpEarned}>+15 XP</p>
                    <p className={styles.careerConnection}>
                      {careerEvent.emoji} You're thinking like a real {career?.name}!
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          {!showFeedback ? (
            <button
              onClick={submitAnswer}
              disabled={selectedAnswerIndex === null}
              className={`${styles.submitButton} ${
                selectedAnswerIndex === null ? styles.submitDisabled : ''
              }`}
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={continueToNext}
              className={styles.continueButton}
            >
              {currentQuestionIndex < enhancedScenarios.length - 1 ? 'Next Discovery' : 'Complete Field Trip'}
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render completion screen
  const renderCompletion = () => (
    <div className={`${completionStyles.completionPhase} ${onBack ? completionStyles.withHeader : ''}`}>
      <div className={completionStyles.completionCard}>
        <div className={completionStyles.trophyIcon}>🎉</div>
        <h1 className={completionStyles.completionTitle}>Field Trip Complete!</h1>
        <p className={completionStyles.completionSubtitle}>
          Amazing discoveries at the {careerEvent.event}, {studentName}!
        </p>

        <div className={completionStyles.achievementSection}>
          <h2 className={completionStyles.achievementTitle}>🌟 Discovery Achievements</h2>
          <div className={completionStyles.achievementGrid}>
            <div className={completionStyles.achievementBadge}>
              Explored {enhancedScenarios.length} discoveries
            </div>
            <div className={completionStyles.achievementBadge}>
              Found {correctAnswers} insights
            </div>
            <div className={completionStyles.achievementBadge}>
              Earned {xpEarned} XP
            </div>
            <div className={completionStyles.achievementBadge}>
              Attended the {careerEvent.event}
            </div>
          </div>
        </div>

        <div className={completionStyles.achievementSection}>
          <h2 className={completionStyles.achievementTitle}>
            {careerEvent.emoji} What You Discovered
          </h2>
          <p className={completionStyles.achievementDescription}>
            You discovered how {career?.name}s use {skill?.name} in Math, ELA, Science, and Social Studies
            at real-world events like the {careerEvent.event}!
          </p>
        </div>

        <button
          onClick={() => {
            if (onNavNext) onNavNext();
            if (onComplete) onComplete(true);
          }}
          className={completionStyles.continueButton}
        >
          Continue Journey →
        </button>
      </div>
    </div>
  );

  // Main render logic
  console.log('🔍 BentoDiscoverCardV2 - Rendering:', {
    screenType,
    careerEvent: careerEvent.event,
    career: career?.name,
    isLoading
  });

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>Loading Field Trip...</div>
      </div>
    );
  }

  switch (screenType) {
    case 'intro':
      return renderIntroduction();
    case 'scenario':
      return renderScenario();
    case 'completion':
      return renderCompletion();
    default:
      return renderIntroduction();
  }
};

export default BentoDiscoverCardV2;