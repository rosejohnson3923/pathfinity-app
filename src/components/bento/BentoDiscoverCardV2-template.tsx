/**
 * ExperienceCard Component
 * Clean implementation with CSS modules only - NO INLINE STYLES
 * Handles OpenAI content injection with proper separation of concerns
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { getGradeCategory } from '../../utils/styles/gradeAdapter';
import styles from '../experience/ExperienceCard.module.css';
import cn from 'classnames';

// Import tile components
import { ProgressTile } from './tiles/ProgressTile';
import { ScenarioTile } from './tiles/ScenarioTile';
import { FeedbackTile } from './tiles/FeedbackTile';
import { OptionTile } from './tiles/OptionTile';
import { CompanionTile } from './tiles/CompanionTile';
import { AchievementTile } from './tiles/AchievementTile';

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

  // Helper function to create a summary from scenario text
  const getScenarioSummary = (text: string, maxLength: number = 30): string => {
    if (!text) return '';

    // Remove "Challenge X:" prefix if present
    let cleanText = text.replace(/^Challenge \d+:\s*/i, '');

    // Common patterns to extract the action:
    // "The kids are making name tags" -> "Make name tags"
    // "It's time to make team signs" -> "Create team signs"
    // "A kid's jersey is missing the letter 'R'" -> "Fix team jersey"

    // Pattern 1: "The X are/is [verb]ing Y" -> "[Verb] Y"
    const pattern1 = /^(?:The |A |An )?[\w\s']+ (?:are|is) (\w+)ing (.+)$/i;
    const match1 = cleanText.match(pattern1);
    if (match1) {
      const verb = match1[1].charAt(0).toUpperCase() + match1[1].slice(1);
      return `${verb} ${match1[2]}`.substring(0, maxLength);
    }

    // Pattern 2: "It's time to [verb] Y" -> "[Verb] Y"
    const pattern2 = /^It'?s time to (\w+) (.+)$/i;
    const match2 = cleanText.match(pattern2);
    if (match2) {
      const verb = match2[1].charAt(0).toUpperCase() + match2[1].slice(1);
      return `${verb} ${match2[2]}`.substring(0, maxLength);
    }

    // Pattern 3: "X is missing Y" -> "Fix X"
    const pattern3 = /^(?:The |A |An )?([\w\s']+) (?:is|are) missing/i;
    const match3 = cleanText.match(pattern3);
    if (match3) {
      return `Fix ${match3[1]}`.substring(0, maxLength);
    }

    // Pattern 4: "X needs Y" -> "Add/Fix X"
    const pattern4 = /^(?:The |A |An )?([\w\s']+) needs?/i;
    const match4 = cleanText.match(pattern4);
    if (match4) {
      return `Update ${match4[1]}`.substring(0, maxLength);
    }

    // Pattern 5: Extract verb phrase after "to" or "must"
    const pattern5 = /(?:to|must|should|need to|have to) (\w+)\s+(.+?)(?:[.,!?]|$)/i;
    const match5 = cleanText.match(pattern5);
    if (match5) {
      const verb = match5[1].charAt(0).toUpperCase() + match5[1].slice(1);
      return `${verb} ${match5[2]}`.substring(0, maxLength);
    }

    // If no pattern matches, try to find the main verb and object
    // Get first sentence
    const firstSentence = cleanText.split(/[.!?]/)[0];

    // If it starts with a verb (imperative), use as is
    const imperativePattern = /^(Make|Create|Fix|Update|Build|Design|Write|Draw|Help|Find|Solve|Add|Remove|Check|Test|Complete|Select|Choose|Apply|Use)/i;
    if (imperativePattern.test(firstSentence)) {
      return firstSentence.substring(0, maxLength);
    }

    // Otherwise, truncate smartly
    if (firstSentence.length > maxLength) {
      return firstSentence.substring(0, maxLength - 3) + '...';
    }

    return firstSentence;
  };

  // Extract challenge summaries for mission list
  const getChallengeSummaries = () => {
    // Get aiChallenges from aiContent
    const aiChallenges = aiContent?.interactive_simulation?.challenges;

    // If we have AI challenges, use challenge_summary or extract from description
    if (aiChallenges && aiChallenges.length > 0) {
      return aiChallenges.map((challenge: any, index: number) => {
        // First check if AI provided a challenge_summary
        if (challenge.challenge_summary) {
          return challenge.challenge_summary;
        }

        // Otherwise extract a short action from the challenge description
        const description = challenge.description || '';

        // Remove "Challenge X:" prefix
        let cleanDesc = description.replace(/^Challenge \d+:\s*/i, '');

        // Try to extract action-oriented summary from the description
        // Common patterns:
        // "You have X. Players need Y." -> Focus on the action
        // "Three players are waiting." -> Focus on what needs to be done

        // Look for key action verbs and create summaries
        const lowerDesc = cleanDesc.toLowerCase();

        // Equipment/item distribution
        if (lowerDesc.includes('give') || lowerDesc.includes('hand out') || lowerDesc.includes('distribute')) {
          if (lowerDesc.includes('ball')) return 'Distribute balls';
          if (lowerDesc.includes('jersey')) return 'Hand out jerseys';
          if (lowerDesc.includes('equipment')) return 'Distribute equipment';
          return 'Distribute items';
        }

        // Organization/arrangement
        if (lowerDesc.includes('organize') || lowerDesc.includes('arrange') || lowerDesc.includes('setup')) {
          if (lowerDesc.includes('player')) return 'Organize players';
          if (lowerDesc.includes('team')) return 'Organize team';
          return 'Organize activity';
        }

        // Selection/choosing
        if (lowerDesc.includes('pick') || lowerDesc.includes('select') || lowerDesc.includes('choose')) {
          if (lowerDesc.includes('player')) return 'Select players';
          if (lowerDesc.includes('team')) return 'Choose team members';
          return 'Make selection';
        }

        // Counting/identifying
        if (lowerDesc.includes('count') || lowerDesc.includes('identify')) {
          return 'Count and organize';
        }

        // Need-based actions
        if (lowerDesc.includes('need')) {
          if (lowerDesc.includes('ball')) return 'Provide equipment';
          if (lowerDesc.includes('player')) return 'Find players';
          if (lowerDesc.includes('jersey')) return 'Provide uniforms';
          if (lowerDesc.includes('more')) return 'Get resources';
        }

        // Try to get the "What do you do?" question focus
        const whatDoYouDo = cleanDesc.match(/what do you do\?/i);
        if (whatDoYouDo) {
          // Get the sentence before "What do you do?"
          const beforeQuestion = cleanDesc.split(/what do you do\?/i)[0].trim();
          const lastSentence = beforeQuestion.split('.').pop()?.trim();
          if (lastSentence && lastSentence.length < 30) {
            return lastSentence;
          }
        }

        // Extract first action phrase (up to first period or question)
        const firstPhrase = cleanDesc.split(/[.?!]/)[0].trim();
        if (firstPhrase.length < 25) {
          return firstPhrase;
        }

        // Shorten long phrases by taking key words
        const words = firstPhrase.split(' ');
        if (words.length > 4) {
          return words.slice(0, 4).join(' ') + '...';
        }

        return `Challenge ${index + 1}`;
      });
    }

    // Fallback to extracting from scenarios
    if (challengeData?.scenarios && challengeData.scenarios.length > 0) {
      return challengeData.scenarios.map((scenario, index) => {
        // Check for interactive simulation challenges
        const aiChallenge = scenario.interactiveSimulation?.challenges?.[0];

        // Try different sources for the description
        const description =
          aiChallenge?.description ||
          aiChallenge?.scenario ||
          scenario.description ||
          scenario.careerContext ||
          '';

        // Use the helper function to create a clean summary
        const summary = getScenarioSummary(description);

        // Return the summary or a fallback
        return summary || `Task ${index + 1}`;
      });
    }

    // Fallback if no scenarios
    return ['Task 1', 'Task 2', 'Task 3', 'Task 4'];
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
            {aiContent?.scenario_summary || 'Your Mission'}
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
    const subjectName = challengeData?.subject ?
      challengeData.subject.charAt(0).toUpperCase() + challengeData.subject.slice(1) :
      'Subject';
    const scenariosCompleted = challengeData?.scenarios?.length || 0;
    const isLastSubject = currentChallengeIndex >= totalChallenges - 1;

    return (
      <div className={styles.completionContainer}>
        {/* Achievement Badge */}
        <div className={styles.completionBadge}>
          <span className={styles.completionIcon}>🏆</span>
        </div>

        {/* Main Message */}
        <h1 className={styles.completionTitle}>
          {subjectName} Complete!
        </h1>

        {/* Skill Achievement */}
        <div className={styles.completionSkill}>
          <h2 className={styles.completionSkillTitle}>
            You've mastered: {challengeData?.skill?.name}
          </h2>
        </div>

        {/* Stats Card */}
        <div className={styles.completionStats}>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>✅</span>
            <span className={styles.statLabel}>Scenarios Completed</span>
            <span className={styles.statValue}>{scenariosCompleted}/{scenariosCompleted}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>📚</span>
            <span className={styles.statLabel}>Subject Progress</span>
            <span className={styles.statValue}>{currentChallengeIndex + 1}/{totalChallenges}</span>
          </div>
        </div>

        {/* Message */}
        <p className={styles.completionMessage}>
          {isLastSubject ?
            "🎉 Amazing! You've completed all subjects in this experience!" :
            "Great work! Ready for the next subject?"
          }
        </p>

        {/* Continue Button */}
        <button
          className={styles.completionButton}
          onClick={onChallengeComplete}
        >
          {isLastSubject ?
            "Complete Experience 🎯" :
            `Continue to Next Subject →`
          }
        </button>

        {/* Progress Indicator */}
        {!isLastSubject && (
          <div className={styles.completionProgress}>
            <span className={styles.completionProgressText}>
              Next up: Subject {currentChallengeIndex + 2} of {totalChallenges}
            </span>
          </div>
        )}
      </div>
    );
  };

  // Main render

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

// Export as both BentoExperienceCard and BentoExperienceCardV2
export default ExperienceCard;
export { ExperienceCard as BentoExperienceCard };
export { ExperienceCard as BentoExperienceCardV2 };