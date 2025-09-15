/**
 * ExperienceCard Component
 * Clean implementation with CSS modules only - NO INLINE STYLES
 * Handles OpenAI content injection with proper separation of concerns
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { getGradeCategory } from '../../utils/styles/gradeAdapter';
import styles from './ExperienceCard.module.css';
import cn from 'classnames';

// Import tile components (to be created)
import { ProgressTile } from '../bento/tiles/ProgressTile';
import { ScenarioTile } from '../bento/tiles/ScenarioTile';
import { FeedbackTile } from '../bento/tiles/FeedbackTile';
import { OptionTile } from '../bento/tiles/OptionTile';
import { CompanionTile } from '../bento/tiles/CompanionTile';
import { AchievementTile } from '../bento/tiles/AchievementTile';

interface ExperienceCardProps {
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
    // OpenAI generated content
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
          hint?: string;
          outcome?: string;
          learning_point?: string;
        }>;
        conclusion?: string;
      };
    };
  };

  // User info
  gradeLevel: string;
  studentName: string;
  userId?: string;

  // Callbacks
  onScenarioComplete: (scenarioIndex: number, wasCorrect: boolean) => void;
  onChallengeComplete: () => void;
  onNext: () => void;

  // Progress tracking
  overallProgress?: number;
  challengeProgress?: number;
  achievements?: string[];

  // Optional features
  enableHints?: boolean;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
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
  onScenarioComplete,
  onChallengeComplete,
  onNext,
  overallProgress = 0,
  challengeProgress = 0,
  achievements = [],
  enableHints = false
}) => {
  const { theme } = useTheme();
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const gradeCategory = getGradeCategory(gradeLevel);
  const aiContent = challengeData?.aiGeneratedContent || {};
  const hasAIContent = !!(aiContent && (aiContent.title || aiContent.scenario));

  // Get companion-specific styles
  const getCompanionClass = () => {
    const companionId = companion.id?.toLowerCase() || 'finn';
    return styles[`welcomeHeader${companionId.charAt(0).toUpperCase() + companionId.slice(1)}`];
  };

  // Handle option selection
  const handleOptionSelect = (optionIndex: number) => {
    if (selectedOptionIndex !== null) return;

    setSelectedOptionIndex(optionIndex);
    const scenario = challengeData.scenarios[currentScenarioIndex];
    const isCorrect = optionIndex === scenario.correct_choice;

    setShowFeedback(true);

    setTimeout(() => {
      onScenarioComplete(currentScenarioIndex, isCorrect);
      setSelectedOptionIndex(null);
      setShowFeedback(false);
    }, 3000);
  };

  // Extract challenge summaries for mission list
  const getChallengeSummaries = () => {
    const aiChallenges = aiContent?.interactive_simulation?.challenges;

    if (aiChallenges && aiChallenges.length > 0) {
      return aiChallenges.map((challenge, index) => {
        const description = typeof challenge === 'string' ? challenge : challenge.description || '';
        return `Challenge ${index + 1}: ${description.split(':')[0] || 'Complete the task'}`;
      });
    }

    return challengeData.scenarios.slice(0, 3).map((scenario, index) =>
      scenario.title || `Challenge ${index + 1}: ${scenario.description?.split('.')[0] || 'Complete the task'}`
    );
  };

  // Render introduction screen
  const renderIntroduction = () => (
    <div className={styles.introContainer}>
      {/* Welcome Header */}
      <div className={cn(styles.welcomeHeader, getCompanionClass())}>
        <div className={styles.welcomeContent}>
          <div className={styles.companionAvatar}>
            <img
              src={`/images/companions/${companion?.id?.toLowerCase() || 'finn'}-${theme === 'dark' ? 'dark' : 'light'}.png`}
              alt={companion?.name || 'Companion'}
            />
          </div>
          <div className={styles.welcomeText}>
            <h1 className={styles.welcomeTitle}>
              {hasAIContent && aiContent.title ? aiContent.title : `${career?.icon || '💼'} Welcome to ${career?.name || 'Coach'}'s World!`}
            </h1>
            {hasAIContent && aiContent.career_introduction && (
              <p className={styles.welcomeSubtitle}>
                {aiContent.career_introduction}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content Tiles */}
      <div className={styles.tileGrid}>
        {/* Story Context Tile */}
        <div className={styles.storyTile}>
          <div className={styles.storyDecoration} />
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>📖</span>
            Your Story Begins...
          </h2>
          <div className={styles.storyContent}>
            {hasAIContent && aiContent.scenario ? (
              <>
                <p>{aiContent.scenario}</p>
                {aiContent.character_context && <p>{aiContent.character_context}</p>}
              </>
            ) : (
              <>
                <p>You are {career?.name || 'a Professional'} {studentName}, ready to take on today's challenges!</p>
                <p>Today, you're focusing on <strong>{challengeData?.skill?.name || 'important skills'}</strong> -
                  a crucial skill that every {career?.name || 'professional'} needs.</p>
              </>
            )}
          </div>
        </div>

        {/* Skills Tile */}
        <div className={styles.skillsTile}>
          <div className={styles.skillsPattern} />
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🎯</span>
            Real-World Skills
          </h2>
          <p className={styles.skillsContent}>
            {hasAIContent && aiContent.career_introduction ?
              aiContent.career_introduction :
              `${career?.name || 'Professional'}s use ${challengeData?.skill?.name || 'these skills'} every day! Master this skill to become a pro.`
            }
          </p>
        </div>
      </div>

      {/* Mission Tile */}
      <div className={styles.missionTile}>
        <div className={styles.missionPattern} />
        <div className={styles.missionContent}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🏆</span>
            Your Mission
          </h2>
          <div className={styles.missionList}>
            <ul className={styles.challengeList}>
              {getChallengeSummaries().map((summary, index) => (
                <li key={index}>{summary}</li>
              ))}
            </ul>
            <div className={styles.scenarioIndicator}>
              <div className={styles.scenarioDots}>
                {Array.from({ length: Math.min(challengeData.scenarios.length, 5) }).map((_, i) => (
                  <span key={i} className={styles.scenarioDot} />
                ))}
              </div>
              <span className={styles.scenarioLabel}>Ready!</span>
            </div>
          </div>
        </div>

        <button className={styles.startButton} onClick={onNext}>
          <span className={styles.startButtonIcon}>🚀</span>
          <span>Start Adventure</span>
          <span className={styles.startButtonArrow}>→</span>
        </button>
      </div>
    </div>
  );

  // Render scenario screen
  const renderScenario = () => {
    // Check for AI-generated challenges first
    const aiChallenges = aiContent?.interactive_simulation?.challenges;
    const aiChallenge = aiChallenges && aiChallenges[currentScenarioIndex];

    // Use AI challenge if available, otherwise fall back to regular scenario
    const scenario = aiChallenge ? {
      ...challengeData.scenarios[currentScenarioIndex],
      description: aiChallenge.description || challengeData.scenarios[currentScenarioIndex]?.description,
      options: aiChallenge.options || challengeData.scenarios[currentScenarioIndex]?.options,
      correct_choice: aiChallenge.correct_choice ?? challengeData.scenarios[currentScenarioIndex]?.correct_choice,
      hint: aiChallenge.hint || challengeData.scenarios[currentScenarioIndex]?.hint,
      outcome: aiChallenge.outcome || challengeData.scenarios[currentScenarioIndex]?.outcome,
      learning_point: aiChallenge.learning_point || challengeData.scenarios[currentScenarioIndex]?.learning_point,
      title: aiChallenge.title || challengeData.scenarios[currentScenarioIndex]?.title,
      careerContext: challengeData.scenarios[currentScenarioIndex]?.careerContext
    } : challengeData.scenarios[currentScenarioIndex];

    // Debug logging to see what options we have
    console.log('🎮 ExperienceCard scenario data:', {
      scenarioIndex: currentScenarioIndex,
      hasAIChallenge: !!aiChallenge,
      aiOptions: aiChallenge?.options,
      scenarioOptions: scenario?.options,
      optionsType: Array.isArray(scenario?.options) ? `array[${scenario.options.length}]` : typeof scenario?.options,
      firstOption: scenario?.options?.[0]
    });

    if (!scenario) return null;

    // Get companion messages
    const getCompanionMessage = () => {
      if (showFeedback) {
        return selectedOptionIndex === scenario.correct_choice
          ? "Excellent work! You got it right!"
          : "Not quite, but that's okay! Let's try again.";
      }
      return showHint ? scenario.hint || "Think about it..." : "Need a hint?";
    };

    return (
      <div className={cn(
        styles.scenarioContainer,
        styles[`container${gradeCategory.charAt(0).toUpperCase() + gradeCategory.slice(1)}`]
      )}>
        {/* Progress Bar with Setup Text */}
        <div className={styles.progressTile}>
          <div className={styles.progressContent}>
            <div className={styles.progressTopRow}>
              <span className={styles.progressLabel}>
                Scenario {currentScenarioIndex + 1} of {challengeData.scenarios.length}
              </span>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ '--width': `${((currentScenarioIndex + 1) / challengeData.scenarios.length) * 100}%` }}
                />
              </div>
            </div>
            {/* AI Setup text inside progress tile */}
            {aiContent?.interactive_simulation?.setup && (
              <div className={styles.progressSetupSection}>
                <div className={styles.setupHeader}>
                  <span className={styles.setupIcon}>📋</span>
                  <h3 className={styles.setupTitle}>Your Mission Today</h3>
                </div>
                <p className={styles.setupText}>
                  {aiContent.interactive_simulation.setup}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Scenario Content */}
        <div className={styles.scenarioMainTile}>
          <div className={styles.scenarioHeader}>
            <h2 className={styles.scenarioTitle}>
              Challenge {currentScenarioIndex + 1}
            </h2>
            <div className={styles.careerBadge}>
              <span className={styles.careerIcon}>{career.icon}</span>
              <span className={styles.careerName}>{career.name}</span>
            </div>
          </div>

          <div className={styles.scenarioDescription}>
            <p>{scenario.description.replace(/^Challenge \d+:\s*/i, '')}</p>
          </div>

          {/* Only show visual if explicitly provided */}
          {scenario.visual && scenario.visual.trim() !== '' && (
            <div className={styles.scenarioVisual}>
              {scenario.visual}
            </div>
          )}
        </div>

        {/* Options and Outcome Container */}
        <div className={styles.optionsOutcomeContainer}>
          {/* Options */}
          <div className={styles.optionsTile}>
            <h3 className={styles.optionsTitle}>What would you do?</h3>
            <div className={styles.optionsGrid}>
              {scenario.options && scenario.options.length > 0 ? (
                scenario.options.map((option, index) => {
                  // Convert number options to visual representations
                  const getVisualOption = (opt: string) => {
                    // Check if it's a simple number
                    if (opt === '1') return '🔺';
                    if (opt === '2') return '🔺🔺';
                    if (opt === '3') return '🔺🔺🔺';
                    if (opt === '4') return '🔺🔺🔺🔺';
                    if (opt === '5') return '🔺🔺🔺🔺🔺';

                    // Otherwise return the original option text
                    return opt;
                  };

                  const displayOption = getVisualOption(option);

                  // Debug what's being displayed
                  if (index === 0) {
                    console.log('🔍 First option rendering:', {
                      original: option,
                      afterGetVisualOption: displayOption,
                      shouldBeOriginal: option !== '1' && option !== '2' && option !== '3' && option !== '4' && option !== '5'
                    });
                  }

                  return (
                    <button
                      key={index}
                      className={cn(
                        styles.optionButton,
                        selectedOptionIndex === index && styles.optionSelected,
                        showFeedback && index === scenario.correct_choice && styles.optionCorrect,
                        showFeedback && selectedOptionIndex === index && index !== scenario.correct_choice && styles.optionIncorrect
                      )}
                      onClick={() => handleOptionSelect(index)}
                      disabled={showFeedback}
                    >
                      <span className={styles.optionNumber}>{index + 1}</span>
                      <span className={styles.optionText}>{displayOption}</span>
                    </button>
                  );
                })
              ) : (
                <div className={styles.noOptions}>Loading options...</div>
              )}
            </div>
          </div>

          {/* Outcome & Learning Point Tile */}
          {showFeedback && (
            <div className={cn(
              styles.outcomeTile,
              selectedOptionIndex === scenario.correct_choice ? styles.outcomeCorrect : styles.outcomeIncorrect
            )}>
              <div className={styles.outcomeHeader}>
                <span className={styles.outcomeIcon}>
                  {selectedOptionIndex === scenario.correct_choice ? '🎉' : '💡'}
                </span>
                <h3 className={styles.outcomeTitle}>
                  {selectedOptionIndex === scenario.correct_choice ? 'Excellent!' : 'Let\'s Learn!'}
                </h3>
              </div>

              <div className={styles.outcomeContent}>
                <div className={styles.outcomeSection}>
                  <h4 className={styles.outcomeSectionTitle}>What Happens:</h4>
                  <p className={styles.outcomeText}>{scenario.outcome}</p>
                </div>

                <div className={styles.learningSection}>
                  <h4 className={styles.learningSectionTitle}>Key Learning:</h4>
                  <p className={styles.learningText}>{scenario.learning_point}</p>
                </div>
              </div>

              <button
                className={styles.nextButton}
                onClick={() => {
                  if (currentScenarioIndex < challengeData.scenarios.length - 1) {
                    setSelectedOptionIndex(null);
                    setShowFeedback(false);
                    setShowHint(false);
                    onNext();
                  } else {
                    onChallengeComplete();
                  }
                }}
              >
                {currentScenarioIndex < challengeData.scenarios.length - 1 ? 'Next Challenge →' : 'Complete! 🏆'}
              </button>
            </div>
          )}
        </div>

        {/* Companion Helper */}
        {(enableHints || showFeedback) && (
          <div className={cn(
            styles.companionTile,
            showFeedback && styles.companionFeedback
          )}>
            <div className={styles.companionContent}>
              <img
                className={styles.companionSmallAvatar}
                src={`/images/companions/${companion?.id?.toLowerCase() || 'finn'}-${theme === 'dark' ? 'dark' : 'light'}.png`}
                alt={companion?.name}
              />
              <div className={styles.companionMessage}>
                <p>{getCompanionMessage()}</p>
                {!showHint && !showFeedback && enableHints && (
                  <button
                    className={styles.hintButton}
                    onClick={() => setShowHint(true)}
                  >
                    Show Hint
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    );
  };

  // Render completion screen
  const renderCompletion = () => {
    console.log('🟢 EXPERIENCECARD - RENDERING COMPLETION SCREEN:', {
      component: 'ExperienceCard',
      challengeData: {
        subject: challengeData?.subject,
        skillName: challengeData?.skill?.name,
        totalScenarios: challengeData?.scenarios?.length
      },
      currentChallengeIndex,
      totalChallenges,
      timestamp: new Date().toISOString(),
      message: 'This is the orphaned Continue button screen!'
    });

    return (
      <div className={cn(
        styles.container,
        styles[`container${gradeCategory.charAt(0).toUpperCase() + gradeCategory.slice(1)}`]
      )}>
        {/* DEBUG INFO */}
        <div style={{ padding: '20px', background: 'rgba(255,0,0,0.1)', border: '2px solid red' }}>
          <h2>🔍 DEBUG: ORPHANED COMPLETION SCREEN</h2>
          <p>Component: ExperienceCard</p>
          <p>Subject: {challengeData?.subject}</p>
          <p>Skill: {challengeData?.skill?.name}</p>
          <p>Challenge {currentChallengeIndex + 1} of {totalChallenges}</p>
          <p>This screen shows for 10 seconds</p>
        </div>

        {/* Original minimal content */}
        <h1>Challenge Complete!</h1>
        <button onClick={onChallengeComplete}>Continue</button>
      </div>
    );
  };

  // Main render
  console.log('📊 EXPERIENCECARD - SCREEN TYPE:', {
    screenType,
    component: 'ExperienceCard',
    timestamp: new Date().toISOString()
  });

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

export default ExperienceCard;