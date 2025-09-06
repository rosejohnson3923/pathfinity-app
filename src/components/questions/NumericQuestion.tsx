/**
 * Numeric Question Component
 * Handles numeric input with optional units and ranges
 */

import React, { useState, useEffect } from 'react';
import { NumericQuestion as NQuestion } from '../../types/questions';
import { VisualRenderer } from '../ai-containers/VisualRenderer';
import './QuestionStyles.css';

// ============================================================================
// INTERFACES
// ============================================================================

interface NumericQuestionProps {
  question: NQuestion;
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

export const NumericQuestion: React.FC<NumericQuestionProps> = ({
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
  const [inputValue, setInputValue] = useState<string>(userAnswer?.toString() ?? '');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    if (userAnswer !== undefined) {
      setInputValue(userAnswer.toString());
      setHasAnswered(true);
    }
  }, [userAnswer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || hasAnswered) return;
    
    const value = e.target.value;
    // Allow negative numbers and decimals
    if (value === '' || value === '-' || /^-?\d*\.?\d*$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleSubmit = () => {
    if (disabled || hasAnswered || inputValue === '' || inputValue === '-') return;
    
    const numericValue = parseFloat(inputValue);
    if (!isNaN(numericValue)) {
      setHasAnswered(true);
      onAnswer(numericValue);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const isWithinRange = (value: number): boolean => {
    if (!question.acceptableRange) return value === question.correctAnswer;
    return value >= question.acceptableRange[0] && value <= question.acceptableRange[1];
  };

  const formatAnswer = (value: number): string => {
    if (question.decimalPlaces !== undefined) {
      return value.toFixed(question.decimalPlaces);
    }
    return value.toString();
  };

  const getPlaceholder = (): string => {
    if (question.minValue !== undefined && question.maxValue !== undefined) {
      return `${question.minValue} - ${question.maxValue}`;
    }
    if (question.decimalPlaces !== undefined) {
      return `0.${'0'.repeat(question.decimalPlaces)}`;
    }
    return 'Enter a number';
  };

  return (
    <div className={`numeric-question theme-${theme}`}>
      {/* Question Header with Career Context */}
      {careerContext && (
        <div className="question-context">
          <span className="career-badge">{careerContext}</span>
        </div>
      )}

      {/* Question Text */}
      <div className="question-text">
        <h3>{question.question}</h3>
        {question.instructions && (
          <p className="question-instructions">{question.instructions}</p>
        )}
      </div>

      {/* Visual if present */}
      {question.visual && (
        <div className="question-visual">
          <VisualRenderer 
            visual={question.visual.content}
            type={question.visual.type}
            alt={question.visual.alt}
          />
          {question.visual.caption && (
            <p className="visual-caption">{question.visual.caption}</p>
          )}
        </div>
      )}

      {/* Answer Input Section */}
      <div className="numeric-input-section">
        <div className="input-wrapper">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={disabled || hasAnswered}
            placeholder={getPlaceholder()}
            className={`numeric-input ${
              showFeedback && hasAnswered ? (isCorrect ? 'correct' : 'incorrect') : ''
            }`}
            aria-label="Numeric answer"
          />
          {question.unit && (
            <span className="unit-label">{question.unit}</span>
          )}
        </div>

        {!hasAnswered && inputValue && inputValue !== '-' && (
          <button 
            className="submit-button"
            onClick={handleSubmit}
            disabled={disabled}
          >
            Submit Answer
          </button>
        )}

        {/* Show range hint if available */}
        {!hasAnswered && question.minValue !== undefined && question.maxValue !== undefined && (
          <p className="range-hint">
            Answer should be between {question.minValue} and {question.maxValue}
          </p>
        )}
      </div>

      {/* Work Space Section */}
      {question.metadata.grade >= '3' && !hasAnswered && (
        <div className="work-space">
          <button 
            className="toggle-calculator"
            onClick={() => setShowCalculator(!showCalculator)}
          >
            {showCalculator ? '📝 Hide Work Space' : '📝 Show Work Space'}
          </button>
          {showCalculator && (
            <div className="calculator-area">
              <textarea 
                placeholder="Use this space for your calculations..."
                className="work-area"
                rows={4}
              />
            </div>
          )}
        </div>
      )}

      {/* Feedback Section */}
      {showFeedback && hasAnswered && (
        <div className={`question-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-message">
            {isCorrect ? (
              <>
                <span className="feedback-icon-large">🎉</span>
                <span>Excellent! Your answer is correct!</span>
              </>
            ) : (
              <>
                <span className="feedback-icon-large">💡</span>
                <span>
                  Not quite. The correct answer is {formatAnswer(question.correctAnswer)}
                  {question.unit && ` ${question.unit}`}.
                  {question.acceptableRange && ` (Acceptable range: ${question.acceptableRange[0]} - ${question.acceptableRange[1]})`}
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

      {/* Decimal Places Reminder */}
      {!hasAnswered && question.decimalPlaces !== undefined && (
        <p className="decimal-reminder">
          Round your answer to {question.decimalPlaces} decimal place{question.decimalPlaces !== 1 ? 's' : ''}.
        </p>
      )}
    </div>
  );
};