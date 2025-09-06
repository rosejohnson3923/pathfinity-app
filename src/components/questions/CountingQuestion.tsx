/**
 * Counting Question Component
 * Visual counting exercises for early learners (PreK-2)
 */

import React, { useState, useEffect } from 'react';
import { CountingQuestion as CQuestion } from '../../types/questions';
import { VisualRenderer } from '../ai-containers/VisualRenderer';
import './QuestionStyles.css';

// ============================================================================
// INTERFACES
// ============================================================================

interface CountingQuestionProps {
  question: CQuestion;
  onAnswer: (answer: number) => void;
  disabled?: boolean;
  showFeedback?: boolean;
  userAnswer?: number;
  isCorrect?: boolean;
  theme?: 'light' | 'dark';
  careerContext?: string;
  companionName?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CountingQuestion: React.FC<CountingQuestionProps> = ({
  question,
  onAnswer,
  disabled = false,
  showFeedback = false,
  userAnswer,
  isCorrect,
  theme = 'light',
  careerContext,
  companionName
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(userAnswer ?? null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showNumberPad, setShowNumberPad] = useState(false);

  useEffect(() => {
    if (userAnswer !== undefined) {
      setSelectedAnswer(userAnswer);
      setHasAnswered(true);
    }
  }, [userAnswer]);

  const handleNumberClick = (num: number) => {
    if (disabled || hasAnswered) return;
    
    setSelectedAnswer(num);
    setHasAnswered(true);
    onAnswer(num);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || hasAnswered) return;
    
    const value = e.target.value;
    if (value === '') {
      setSelectedAnswer(null);
      // Notify parent that answer was cleared
      onAnswer(null);
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 0) {
        setSelectedAnswer(numValue);
        // Immediately notify parent of the answer
        // Parent will handle the Submit button
        onAnswer(numValue);
      }
    }
  };

  // Remove the internal submit handler - let parent handle submission
  // This prevents duplicate Submit buttons

  // Generate number options based on min/max values
  const generateNumberOptions = (): number[] => {
    const min = question.minValue ?? 0;
    const max = question.maxValue ?? 20;
    const options: number[] = [];
    
    for (let i = min; i <= max; i++) {
      options.push(i);
    }
    
    return options;
  };

  const numberOptions = generateNumberOptions();
  const useGrid = numberOptions.length <= 20;

  return (
    <div className={`counting-question theme-${theme}`}>
      {/* Question Header with Career Context */}
      {careerContext && (
        <div className="question-context">
          <span className="career-badge">{careerContext}</span>
        </div>
      )}

      {/* Question Text */}
      <div className="question-text">
        <h3>{question.question}</h3>
        {question.countableItems && (
          <p className="counting-prompt">
            Count the <strong>{question.countableItems}</strong>
          </p>
        )}
        {question.instructions && (
          <p className="question-instructions">{question.instructions}</p>
        )}
      </div>

      {/* Required Visual */}
      <div className="counting-visual">
        <VisualRenderer 
          visual={question.visual.content}
          type={question.visual.type}
          alt={question.visual.alt || `Items to count: ${question.countableItems}`}
        />
        {question.visual.caption && (
          <p className="visual-caption">{question.visual.caption}</p>
        )}
      </div>

      {/* Answer Input Section */}
      <div className="counting-answer-section">
        {useGrid ? (
          // Number Grid for small ranges (0-20)
          <div className="number-grid">
            {numberOptions.map(num => (
              <button
                key={num}
                className={`number-button ${selectedAnswer === num ? 'selected' : ''} ${
                  showFeedback && hasAnswered && num === question.correctAnswer ? 'correct' : ''
                } ${
                  showFeedback && hasAnswered && selectedAnswer === num && !isCorrect ? 'incorrect' : ''
                }`}
                onClick={() => handleNumberClick(num)}
                disabled={disabled || hasAnswered}
                aria-label={`Number ${num}`}
              >
                {num}
              </button>
            ))}
          </div>
        ) : (
          // Number Input for larger ranges
          <div className="number-input-container">
            <label htmlFor="counting-answer">Your Answer:</label>
            <input
              id="counting-answer"
              type="number"
              min={question.minValue ?? 0}
              max={question.maxValue ?? 100}
              value={selectedAnswer ?? ''}
              onChange={handleInputChange}
              disabled={disabled || hasAnswered}
              placeholder="Enter a number"
              className={`number-input ${
                showFeedback && hasAnswered ? (isCorrect ? 'correct' : 'incorrect') : ''
              }`}
            />
            {/* Submit button removed - parent container handles submission */}
          </div>
        )}
      </div>

      {/* Feedback Section */}
      {showFeedback && hasAnswered && (
        <div className={`question-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-message">
            {isCorrect ? (
              <>
                <span className="feedback-icon-large">🎉</span>
                <span>Great counting! You got it right!</span>
              </>
            ) : (
              <>
                <span className="feedback-icon-large">💡</span>
                <span>
                  Not quite. There are {question.correctAnswer} {question.countableItems}.
                </span>
              </>
            )}
          </div>
          {question.explanation && (
            <div className="feedback-explanation">
              <p>{question.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* Hint Section */}
      {!hasAnswered && question.hint && (
        <div className="question-hint">
          <button className="hint-toggle">
            💡 Need a hint?
          </button>
        </div>
      )}

      {/* Companion Helper for Young Learners */}
      {companionName && !hasAnswered && (
        <div className="companion-helper">
          <p className="companion-tip">
            {companionName === 'Spark' && "⚡ Touch each item as you count!"}
            {companionName === 'Finn' && "🐟 Point to each one and count out loud!"}
            {companionName === 'Sage' && "🦉 Remember to count each item only once!"}
            {companionName === 'Harmony' && "🎵 Try counting with a rhythm!"}
          </p>
        </div>
      )}
    </div>
  );
};