/**
 * Fill in the Blank Question Component
 * Complete sentences with the correct word or phrase
 */

import React, { useState, useEffect } from 'react';
import { FillBlankQuestion as FBQuestion } from '../../types/questions';
import { VisualRenderer } from '../ai-containers/VisualRenderer';
import './QuestionStyles.css';

// ============================================================================
// INTERFACES
// ============================================================================

interface FillBlankQuestionProps {
  question: FBQuestion;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
  showFeedback?: boolean;
  userAnswer?: string;
  isCorrect?: boolean;
  theme?: 'light' | 'dark';
  careerContext?: string;
  companionName?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const FillBlankQuestion: React.FC<FillBlankQuestionProps> = ({
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
  const [inputValue, setInputValue] = useState<string>(userAnswer ?? '');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (userAnswer !== undefined) {
      setInputValue(userAnswer);
      setHasAnswered(true);
    }
  }, [userAnswer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || hasAnswered) return;
    setInputValue(e.target.value);
  };

  const handleSubmit = () => {
    if (disabled || hasAnswered || !inputValue.trim()) return;
    
    setHasAnswered(true);
    onAnswer(inputValue.trim());
  };

  const handleOptionClick = (option: string) => {
    if (disabled || hasAnswered) return;
    
    setInputValue(option);
    setHasAnswered(true);
    onAnswer(option);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  // Parse the template to display with the blank
  const renderTemplate = () => {
    const parts = question.template.split('{{blank}}');
    
    if (hasAnswered && showFeedback) {
      // Show the answer in the blank
      return (
        <div className="fill-blank-template">
          {parts[0]}
          <span className={`filled-blank ${isCorrect ? 'correct' : 'incorrect'}`}>
            {inputValue}
          </span>
          {parts[1]}
        </div>
      );
    }
    
    return (
      <div className="fill-blank-template">
        {parts[0]}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={disabled || hasAnswered}
          placeholder="___________"
          className="inline-blank-input"
          aria-label="Fill in the blank"
        />
        {parts[1]}
      </div>
    );
  };

  // Generate word options if in easy mode (for younger grades)
  const generateWordOptions = (): string[] => {
    const options = [...question.correctAnswers];
    
    // Add some distractors if needed
    while (options.length < 4) {
      options.push(`option${options.length}`);
    }
    
    // Shuffle the options
    return options.sort(() => Math.random() - 0.5);
  };

  const isEasyMode = question.metadata.grade <= '3';
  const wordOptions = isEasyMode ? generateWordOptions() : [];

  return (
    <div className={`fill-blank-question theme-${theme}`}>
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

      {/* Template with Blank */}
      <div className="template-section">
        {renderTemplate()}
      </div>

      {/* Word Bank for younger grades */}
      {isEasyMode && !hasAnswered && (
        <div className="word-bank">
          <p className="word-bank-label">Choose a word:</p>
          <div className="word-options">
            {wordOptions.map((option, index) => (
              <button
                key={index}
                className="word-option"
                onClick={() => handleOptionClick(option)}
                disabled={disabled}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submit button for typed answers */}
      {!isEasyMode && !hasAnswered && inputValue.trim() && (
        <button 
          className="submit-button"
          onClick={handleSubmit}
          disabled={disabled}
        >
          Submit Answer
        </button>
      )}

      {/* Feedback Section */}
      {showFeedback && hasAnswered && (
        <div className={`question-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-message">
            {isCorrect ? (
              <>
                <span className="feedback-icon-large">🎉</span>
                <span>Perfect! That's the right word!</span>
              </>
            ) : (
              <>
                <span className="feedback-icon-large">💡</span>
                <span>
                  Not quite. Acceptable answers include: {question.correctAnswers.join(', ')}
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