/**
 * ScenarioLayout Component
 * Grade-specific layout for scenario/question screens
 */

import React from 'react';
import { CompanionTile } from '../tiles/CompanionTile';
import { ScenarioTile } from '../tiles/ScenarioTile';
import { FeedbackTile } from '../tiles/FeedbackTile';
import { ProgressTile } from '../tiles/ProgressTile';
import { OptionTile } from '../tiles/OptionTile';
import { InteractiveCanvasTile } from '../tiles/InteractiveCanvasTile';
import { AchievementTile } from '../tiles/AchievementTile';
import { getGradeLayout, getLayoutPreset, getMinTouchTargetSize } from './gradeLayouts';
import styles from '../BentoExperienceCard.module.css';

interface ScenarioLayoutProps {
  gradeLevel: string;
  scenario: {
    description: string;
    question: string;
    options: string[];
    correct_choice: number;
    hint?: string;
    visual?: string;
    interactionType?: 'visual' | 'tap-select' | 'standard';
    careerContext?: string;
  };
  scenarioIndex: number;
  totalScenarios: number;
  companion: {
    id: 'finn' | 'sage' | 'spark' | 'harmony';
    name: string;
    personality: string;
  };
  career: {
    name: string;
    icon: string;
  };
  skill: {
    name: string;
    subject: string;
  };
  selectedOptionIndex: number | null;
  showFeedback: boolean;
  showHint: boolean;
  enableHints: boolean;
  xpEarned: number;
  showXPAnimation: boolean;
  onOptionSelect: (index: number) => void;
  onNextScenario: () => void;
  onHintRequest?: () => void;
  theme?: 'light' | 'dark';
}

export const ScenarioLayout: React.FC<ScenarioLayoutProps> = ({
  gradeLevel,
  scenario,
  scenarioIndex,
  totalScenarios,
  companion,
  career,
  skill,
  selectedOptionIndex,
  showFeedback,
  showHint,
  enableHints,
  xpEarned,
  showXPAnimation,
  onOptionSelect,
  onNextScenario,
  onHintRequest,
  theme = 'light'
}) => {
  const layout = getGradeLayout(gradeLevel);
  const preset = getLayoutPreset('scenario', gradeLevel);
  const minTouchTarget = getMinTouchTargetSize(gradeLevel);

  // Helper functions
  const needsInteractiveCanvas = (): boolean => {
    return ['K', '1', '2'].includes(gradeLevel) && 
           (scenario.interactionType === 'visual' || scenario.interactionType === 'tap-select');
  };

  const getOptionVisual = (index: number): string => {
    const visuals = ['🔵', '🟡', '🔴', '🟢'];
    return visuals[index] || '⭐';
  };

  const getCompanionHint = (): string => {
    if (!scenario.hint) return "Think about it...";
    
    const hintStyles = {
      'finn': `Psst! ${scenario.hint} 😉`,
      'sage': `Consider this: ${scenario.hint}`,
      'spark': `Quick tip: ${scenario.hint}! ⚡`,
      'harmony': `Gently... ${scenario.hint} 🌸`
    };
    return hintStyles[companion.id] || scenario.hint;
  };

  const getCompanionFeedback = (): string => {
    const isCorrect = selectedOptionIndex === scenario.correct_choice;
    
    if (isCorrect) {
      const celebrations = {
        'finn': "AWESOME! You totally nailed it! 🎉",
        'sage': "Excellent reasoning. Well done. 🦉",
        'spark': "AMAZING! You're on FIRE! ⚡",
        'harmony': "Beautiful work! 🌸"
      };
      return celebrations[companion.id] || "Great job!";
    } else {
      const encouragements = {
        'finn': "No worries! Let's try again! 💪",
        'sage': "A learning opportunity. Try once more. 🤔",
        'spark': "Close one! GO AGAIN! ⚡",
        'harmony': "It's okay. Try again. 🌸"
      };
      return encouragements[companion.id] || "Let's try again!";
    }
  };

  // K-2: Visual-first layout with large elements
  if (['K', '1', '2'].includes(gradeLevel)) {
    return (
      <div className={`${styles.scenarioLayout} ${styles.k2ScenarioLayout}`}>
        {/* Simple Progress Bar */}
        <div className={styles.topProgress}>
          <ProgressTile
            progress={{
              currentScenario: scenarioIndex + 1,
              totalScenarios: totalScenarios,
              completedScenarios: scenarioIndex
            }}
            display="dots"
            showMilestones={false}
            gradeLevel={gradeLevel}
          />
        </div>

        {/* Large Visual Question */}
        <div className={styles.visualQuestion}>
          <ScenarioTile
            scenario={{
              description: scenario.description,
              visual: scenario.visual || '❓',
              careerContext: `Like a ${career.name}!`
            }}
            scenarioNumber={scenarioIndex + 1}
            totalScenarios={totalScenarios}
            career={career}
            skill={skill}
            gradeLevel={gradeLevel}
            visualSize="large"
          />
        </div>

        {/* Interactive Options Area */}
        <div className={styles.k2OptionsArea}>
          {needsInteractiveCanvas() ? (
            <InteractiveCanvasTile
              type="selection"
              items={scenario.options.map((opt, idx) => ({
                id: `option-${idx}`,
                content: opt,
                visual: getOptionVisual(idx),
                isCorrect: idx === scenario.correct_choice
              }))}
              gradeLevel={gradeLevel}
              instructions="Tap your answer!"
              showFeedback={showFeedback}
              enableHints={enableHints}
              onComplete={(result) => {
                if (result.correct) onNextScenario();
              }}
              onInteraction={(itemId) => {
                const index = parseInt(itemId.split('-')[1]);
                onOptionSelect(index);
              }}
            />
          ) : (
            <div className={styles.visualOptions}>
              <OptionTile
                options={scenario.options.map((text, idx) => ({
                  text,
                  visual: getOptionVisual(idx)
                }))}
                correctIndex={scenario.correct_choice}
                gradeLevel={gradeLevel}
                enableHints={enableHints}
                onSelect={onOptionSelect}
                selectedIndex={selectedOptionIndex}
                showFeedback={showFeedback}
                disabled={showFeedback}
                format="visual"
              />
            </div>
          )}
        </div>

        {/* Floating Companion Helper */}
        {(enableHints || showFeedback) && (
          <div className={styles.floatingCompanion}>
            <CompanionTile
              companion={companion}
              message={showFeedback ? getCompanionFeedback() : (showHint ? getCompanionHint() : "Need help?")}
              emotion={showFeedback ? (selectedOptionIndex === scenario.correct_choice ? 'celebrating' : 'encouraging') : 'thinking'}
              size="medium"
              position="float"
            />
          </div>
        )}

        {/* XP Celebration */}
        {showXPAnimation && (
          <div className={styles.xpCelebration}>
            <AchievementTile
              type="xp"
              value={xpEarned}
              gradeLevel={gradeLevel}
              showAnimation={true}
              celebrationType="confetti"
            />
          </div>
        )}

        {/* Feedback Overlay */}
        {showFeedback && (
          <div className={styles.feedbackOverlay}>
            <FeedbackTile
              feedback={{
                type: selectedOptionIndex === scenario.correct_choice ? 'success' : 'error',
                message: selectedOptionIndex === scenario.correct_choice 
                  ? "Great job! 🌟" 
                  : "Try again! 💪",
                score: selectedOptionIndex === scenario.correct_choice ? 10 : 0,
                maxScore: 10
              }}
              showAnimation={true}
              gradeLevel={gradeLevel}
              onNext={onNextScenario}
            />
          </div>
        )}
      </div>
    );
  }

  // 3-5: Balanced layout with clear sections
  if (['3', '4', '5'].includes(gradeLevel)) {
    return (
      <div className={`${styles.scenarioLayout} ${styles.grade35ScenarioLayout}`}>
        {/* Progress Header */}
        <div className={styles.progressHeader}>
          <ProgressTile
            progress={{
              currentScenario: scenarioIndex + 1,
              totalScenarios: totalScenarios,
              completedScenarios: scenarioIndex,
              currentSkill: skill
            }}
            display="bar"
            showMilestones={true}
            gradeLevel={gradeLevel}
          />
        </div>

        {/* Question Section */}
        <div className={styles.questionSection}>
          <ScenarioTile
            scenario={{
              description: scenario.description,
              visual: scenario.visual,
              careerContext: scenario.careerContext || `${career.name} perspective`
            }}
            scenarioNumber={scenarioIndex + 1}
            totalScenarios={totalScenarios}
            career={career}
            skill={skill}
            gradeLevel={gradeLevel}
          />
        </div>

        {/* Options Grid */}
        <div className={styles.optionsGrid}>
          <OptionTile
            options={scenario.options.map((text) => ({ text }))}
            correctIndex={scenario.correct_choice}
            gradeLevel={gradeLevel}
            enableHints={enableHints}
            onSelect={onOptionSelect}
            selectedIndex={selectedOptionIndex}
            showFeedback={showFeedback}
            disabled={showFeedback}
            format="cards"
            questionFormat="standard"
          />
        </div>

        {/* Companion Corner */}
        {(enableHints && !showFeedback) && (
          <div className={styles.companionCorner}>
            <CompanionTile
              companion={companion}
              message={showHint ? getCompanionHint() : "Need a hint?"}
              emotion="thinking"
              size="small"
              position="corner"
              onInteraction={onHintRequest}
            />
          </div>
        )}

        {/* Feedback Section */}
        {showFeedback && (
          <div className={styles.feedbackSection}>
            <FeedbackTile
              feedback={{
                type: selectedOptionIndex === scenario.correct_choice ? 'success' : 'error',
                message: getCompanionFeedback(),
                score: selectedOptionIndex === scenario.correct_choice ? 15 : 0,
                maxScore: 15,
                companion: {
                  id: companion.id,
                  emotion: selectedOptionIndex === scenario.correct_choice ? 'celebrating' : 'encouraging'
                }
              }}
              showAnimation={true}
              gradeLevel={gradeLevel}
              onNext={onNextScenario}
            />
            {showXPAnimation && (
              <AchievementTile
                type="xp"
                value={xpEarned}
                gradeLevel={gradeLevel}
                showAnimation={true}
              />
            )}
          </div>
        )}
      </div>
    );
  }

  // 6-8: Structured layout with panels
  if (['6', '7', '8'].includes(gradeLevel)) {
    return (
      <div className={`${styles.scenarioLayout} ${styles.grade68ScenarioLayout}`}>
        {/* Compact Header */}
        <div className={styles.compactHeader}>
          <ProgressTile
            progress={{
              currentScenario: scenarioIndex + 1,
              totalScenarios: totalScenarios,
              completedScenarios: scenarioIndex,
              currentSkill: skill
            }}
            display="compact"
            showMilestones={false}
            gradeLevel={gradeLevel}
          />
        </div>

        {/* Main Content Area */}
        <div className={styles.contentPanels}>
          {/* Question Panel */}
          <div className={styles.questionPanel}>
            <ScenarioTile
              scenario={{
                description: scenario.description,
                careerContext: `Professional context: ${career.name}`
              }}
              scenarioNumber={scenarioIndex + 1}
              totalScenarios={totalScenarios}
              career={career}
              skill={skill}
              gradeLevel={gradeLevel}
              compact={true}
            />
          </div>

          {/* Options Panel */}
          <div className={styles.optionsPanel}>
            <OptionTile
              options={scenario.options.map((text) => ({ text }))}
              correctIndex={scenario.correct_choice}
              gradeLevel={gradeLevel}
              enableHints={enableHints}
              onSelect={onOptionSelect}
              selectedIndex={selectedOptionIndex}
              showFeedback={showFeedback}
              disabled={showFeedback}
              format="list"
              questionFormat="i-would"
            />
          </div>

          {/* Sidebar */}
          <div className={styles.sidebar}>
            {enableHints && !showFeedback && (
              <CompanionTile
                companion={companion}
                message={showHint ? getCompanionHint() : "Hint available"}
                emotion="neutral"
                size="small"
                position="minimized"
                onInteraction={onHintRequest}
              />
            )}
            
            {showFeedback && (
              <FeedbackTile
                feedback={{
                  type: selectedOptionIndex === scenario.correct_choice ? 'success' : 'error',
                  message: selectedOptionIndex === scenario.correct_choice ? "Correct!" : "Incorrect",
                  details: [scenario.correct_choice === selectedOptionIndex ? 
                    "Well reasoned." : 
                    `The correct answer was option ${scenario.correct_choice + 1}.`]
                }}
                showAnimation={false}
                gradeLevel={gradeLevel}
                compact={true}
              />
            )}
          </div>
        </div>

        {/* Action Bar */}
        {showFeedback && (
          <div className={styles.actionBar}>
            <button 
              className={styles.nextButton}
              onClick={onNextScenario}
              style={{ minHeight: '44px' }}
            >
              Next Question →
            </button>
            {showXPAnimation && (
              <span className={styles.xpIndicator}>+{xpEarned} XP</span>
            )}
          </div>
        )}
      </div>
    );
  }

  // 9-12: Professional layout
  return (
    <div className={`${styles.scenarioLayout} ${styles.grade912ScenarioLayout}`}>
      {/* Minimal Progress */}
      <div className={styles.minimalProgress}>
        <span className={styles.progressText}>
          Question {scenarioIndex + 1} of {totalScenarios}
        </span>
      </div>

      {/* Professional Content */}
      <div className={styles.professionalScenario}>
        <div className={styles.scenarioContent}>
          <h3 className={styles.scenarioTitle}>Scenario</h3>
          <p className={styles.scenarioText}>{scenario.description}</p>
          {scenario.careerContext && (
            <p className={styles.contextNote}>
              <em>Context: {career.name} - {scenario.careerContext}</em>
            </p>
          )}
        </div>

        <div className={styles.responseSection}>
          <h4 className={styles.responsePrompt}>Select your response:</h4>
          <OptionTile
            options={scenario.options.map((text) => ({ text }))}
            correctIndex={scenario.correct_choice}
            gradeLevel={gradeLevel}
            enableHints={false}
            onSelect={onOptionSelect}
            selectedIndex={selectedOptionIndex}
            showFeedback={showFeedback}
            disabled={showFeedback}
            format="professional"
            questionFormat="professional"
          />
        </div>

        {showFeedback && (
          <div className={styles.professionalFeedback}>
            <div className={styles.feedbackStatus}>
              {selectedOptionIndex === scenario.correct_choice ? (
                <span className={styles.correct}>✓ Correct</span>
              ) : (
                <span className={styles.incorrect}>✗ Incorrect</span>
              )}
            </div>
            <button 
              className={styles.continueButton}
              onClick={onNextScenario}
              style={{ minHeight: '40px' }}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenarioLayout;