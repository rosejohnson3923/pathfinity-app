/**
 * Multiple Choice Question Component
 * Renders a question with multiple answer options
 */

import React, { useState, useEffect } from 'react';
import { MultipleChoiceQuestion as MCQuestion } from '../../types/questions';
import { VisualRenderer } from '../ai-containers/VisualRenderer';
import './QuestionStyles.css';

// ============================================================================
// INTERFACES
// ============================================================================

interface MultipleChoiceQuestionProps {
  question: MCQuestion;
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

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
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
  const [selectedOption, setSelectedOption] = useState<number | null>(userAnswer ?? null);
  const [hasAnswered, setHasAnswered] = useState(false);

  useEffect(() => {
    if (userAnswer !== undefined) {
      setSelectedOption(userAnswer);
      setHasAnswered(true);
    }
  }, [userAnswer]);

  const handleOptionClick = (index: number) => {
    if (disabled || hasAnswered) return;
    
    setSelectedOption(index);
    setHasAnswered(true);
    onAnswer(index);
  };

  const getOptionClassName = (index: number): string => {
    const classes = ['mc-option'];
    
    if (selectedOption === index) {
      classes.push('selected');
    }
    
    if (showFeedback && hasAnswered) {
      if (index === question.correctAnswer) {
        classes.push('correct');
      } else if (selectedOption === index && !isCorrect) {
        classes.push('incorrect');
      }
    }
    
    if (disabled || hasAnswered) {
      classes.push('disabled');
    }
    
    return classes.join(' ');
  };

  const getOptionLabel = (index: number): string => {
    // Convert index to letter (A, B, C, D, etc.)
    return String.fromCharCode(65 + index);
  };

  return (
    <div className={`multiple-choice-question theme-${theme}`}>
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
        </div>
      )}

      {/* Answer Options */}
      <div className="mc-options-container">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={getOptionClassName(index)}
            onClick={() => handleOptionClick(index)}
            disabled={disabled || hasAnswered}
            aria-label={`Option ${getOptionLabel(index)}: ${option}`}
          >
            <span className="option-label">{getOptionLabel(index)}</span>
            <span className="option-text">{option}</span>
            {showFeedback && hasAnswered && index === question.correctAnswer && (
              <span className="feedback-icon">✓</span>
            )}
            {showFeedback && hasAnswered && selectedOption === index && !isCorrect && (
              <span className="feedback-icon">✗</span>
            )}
          </button>
        ))}
      </div>

      {/* Feedback Section */}
      {showFeedback && hasAnswered && (
        <div className={`question-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-message">
            {isCorrect ? (
              <>
                <span className="feedback-icon-large">🎉</span>
                <span>Correct! Well done!</span>
              </>
            ) : (
              <>
                <span className="feedback-icon-large">💡</span>
                <span>Not quite. The correct answer is {getOptionLabel(question.correctAnswer)}: {question.options[question.correctAnswer]}</span>
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
    </div>
  );
};