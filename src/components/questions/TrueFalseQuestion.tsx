/**
 * True/False Question Component
 * Renders a statement that students evaluate as true or false
 */

import React, { useState, useEffect } from 'react';
import { TrueFalseQuestion as TFQuestion } from '../../types/questions';
import { VisualRenderer } from '../ai-containers/VisualRenderer';
import './QuestionStyles.css';

// ============================================================================
// INTERFACES
// ============================================================================

interface TrueFalseQuestionProps {
  question: TFQuestion;
  onAnswer: (answer: boolean) => void;
  disabled?: boolean;
  showFeedback?: boolean;
  userAnswer?: boolean;
  isCorrect?: boolean;
  theme?: 'light' | 'dark';
  careerContext?: string;
  companionName?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const TrueFalseQuestion: React.FC<TrueFalseQuestionProps> = ({
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
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(userAnswer ?? null);
  const [hasAnswered, setHasAnswered] = useState(false);

  useEffect(() => {
    if (userAnswer !== undefined) {
      setSelectedAnswer(userAnswer);
      setHasAnswered(true);
    }
  }, [userAnswer]);

  const handleAnswerClick = (answer: boolean) => {
    if (disabled || hasAnswered) return;
    
    setSelectedAnswer(answer);
    setHasAnswered(true);
    onAnswer(answer);
  };

  const getButtonClassName = (answer: boolean): string => {
    const classes = ['tf-button'];
    
    if (selectedAnswer === answer) {
      classes.push('selected');
    }
    
    if (showFeedback && hasAnswered) {
      if (answer === question.correctAnswer) {
        classes.push('correct');
      } else if (selectedAnswer === answer && !isCorrect) {
        classes.push('incorrect');
      }
    }
    
    if (disabled || hasAnswered) {
      classes.push('disabled');
    }
    
    classes.push(answer ? 'true-button' : 'false-button');
    
    return classes.join(' ');
  };

  return (
    <div className={`true-false-question theme-${theme}`}>
      {/* Question Header with Career Context */}
      {careerContext && (
        <div className="question-context">
          <span className="career-badge">{careerContext}</span>
        </div>
      )}

      {/* Question Text */}
      <div className="question-text">
        <h3>True or False:</h3>
        <p className="tf-statement">
          {question.statement || question.question}
        </p>
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

      {/* True/False Buttons */}
      <div className="tf-buttons-container">
        <button
          className={getButtonClassName(true)}
          onClick={() => handleAnswerClick(true)}
          disabled={disabled || hasAnswered}
          aria-label="True"
        >
          <span className="tf-icon">✓</span>
          <span className="tf-text">True</span>
        </button>
        
        <button
          className={getButtonClassName(false)}
          onClick={() => handleAnswerClick(false)}
          disabled={disabled || hasAnswered}
          aria-label="False"
        >
          <span className="tf-icon">✗</span>
          <span className="tf-text">False</span>
        </button>
      </div>

      {/* Feedback Section */}
      {showFeedback && hasAnswered && (
        <div className={`question-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-message">
            {isCorrect ? (
              <>
                <span className="feedback-icon-large">🎉</span>
                <span>Correct! You got it right!</span>
              </>
            ) : (
              <>
                <span className="feedback-icon-large">💡</span>
                <span>
                  Not quite. The statement is actually {question.correctAnswer ? 'TRUE' : 'FALSE'}.
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
    </div>
  );
};