/**
 * Short Answer Question Component
 * Open-ended text responses with keyword validation
 */

import React, { useState, useEffect } from 'react';
import { ShortAnswerQuestion as SAQuestion } from '../../types/questions';
import { VisualRenderer } from '../ai-containers/VisualRenderer';
import './QuestionStyles.css';

// ============================================================================
// INTERFACES
// ============================================================================

interface ShortAnswerQuestionProps {
  question: SAQuestion;
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

export const ShortAnswerQuestion: React.FC<ShortAnswerQuestionProps> = ({
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
  const [textValue, setTextValue] = useState<string>(userAnswer ?? '');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [showRubric, setShowRubric] = useState(false);
  const [highlightedKeywords, setHighlightedKeywords] = useState<string[]>([]);

  useEffect(() => {
    if (userAnswer !== undefined) {
      setTextValue(userAnswer);
      setHasAnswered(true);
      updateWordCount(userAnswer);
      checkKeywords(userAnswer);
    }
  }, [userAnswer]);

  const updateWordCount = (text: string) => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (disabled || hasAnswered) return;
    
    const newText = e.target.value;
    
    // Check max length if specified
    if (question.maxLength && newText.length > question.maxLength) {
      return;
    }
    
    setTextValue(newText);
    updateWordCount(newText);
  };

  const checkKeywords = (text: string) => {
    const foundKeywords = question.keyWords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
    setHighlightedKeywords(foundKeywords);
  };

  const handleSubmit = () => {
    if (disabled || hasAnswered) return;
    
    const trimmedText = textValue.trim();
    
    // Check minimum length
    if (question.minLength && trimmedText.length < question.minLength) {
      return;
    }
    
    setHasAnswered(true);
    checkKeywords(trimmedText);
    onAnswer(trimmedText);
  };

  const isValidLength = () => {
    const length = textValue.trim().length;
    if (question.minLength && length < question.minLength) return false;
    if (question.maxLength && length > question.maxLength) return false;
    return true;
  };

  const getCharacterCount = () => {
    const current = textValue.length;
    if (question.maxLength) {
      return `${current} / ${question.maxLength} characters`;
    }
    return `${current} characters`;
  };

  const getWordCountDisplay = () => {
    const minWords = question.minLength ? Math.ceil(question.minLength / 5) : 0;
    const maxWords = question.maxLength ? Math.floor(question.maxLength / 5) : 0;
    
    if (minWords && maxWords) {
      return `${wordCount} words (${minWords}-${maxWords} recommended)`;
    } else if (minWords) {
      return `${wordCount} words (minimum ${minWords})`;
    }
    return `${wordCount} words`;
  };

  const renderHighlightedAnswer = () => {
    if (!showFeedback || !hasAnswered) return null;
    
    let highlightedText = textValue;
    highlightedKeywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });
    
    return (
      <div 
        className="highlighted-answer"
        dangerouslySetInnerHTML={{ __html: highlightedText }}
      />
    );
  };

  return (
    <div className={`short-answer-question theme-${theme}`}>
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

      {/* Rubric Toggle */}
      {question.rubric && !hasAnswered && (
        <div className="rubric-section">
          <button 
            className="rubric-toggle"
            onClick={() => setShowRubric(!showRubric)}
          >
            📋 {showRubric ? 'Hide' : 'Show'} Grading Criteria
          </button>
          {showRubric && (
            <ul className="rubric-list">
              {question.rubric.map((criteria, index) => (
                <li key={index} className="rubric-item">
                  {criteria}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Text Input Area */}
      <div className="answer-input-section">
        {!hasAnswered ? (
          <textarea
            value={textValue}
            onChange={handleTextChange}
            disabled={disabled || hasAnswered}
            placeholder="Type your answer here..."
            className="answer-textarea"
            rows={8}
            aria-label="Short answer response"
          />
        ) : (
          renderHighlightedAnswer()
        )}
        
        {/* Character/Word Count */}
        <div className="text-metrics">
          <span className="character-count">{getCharacterCount()}</span>
          <span className="word-count">{getWordCountDisplay()}</span>
        </div>
      </div>

      {/* Writing Tips */}
      {!hasAnswered && companionName && (
        <div className="companion-writing-tips">
          <p className="writing-tip">
            {companionName === 'Sage' && "🦉 Remember to include specific examples and explain your reasoning."}
            {companionName === 'Spark' && "⚡ Start with your main idea, then add supporting details!"}
            {companionName === 'Finn' && "🐟 Organize your thoughts before writing - beginning, middle, end!"}
            {companionName === 'Harmony' && "🎵 Write with a clear voice and smooth flow between ideas!"}
          </p>
        </div>
      )}

      {/* Submit Button */}
      {!hasAnswered && (
        <button 
          className="submit-button"
          onClick={handleSubmit}
          disabled={disabled || !isValidLength() || textValue.trim().length === 0}
        >
          Submit Answer
        </button>
      )}

      {/* Feedback Section */}
      {showFeedback && hasAnswered && (
        <div className={`question-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-message">
            {highlightedKeywords.length > 0 ? (
              <>
                <span className="feedback-icon-large">✅</span>
                <span>
                  Good work! You included {highlightedKeywords.length} of {question.keyWords.length} key concepts.
                </span>
              </>
            ) : (
              <>
                <span className="feedback-icon-large">💡</span>
                <span>
                  Consider including these key concepts: {question.keyWords.join(', ')}
                </span>
              </>
            )}
          </div>
          
          {/* Sample Answer */}
          <div className="sample-answer-section">
            <h4 className="sample-answer-label">Sample Answer:</h4>
            <div className="sample-answer-text">
              {question.sampleAnswer}
            </div>
          </div>
          
          {/* Keywords Found */}
          {highlightedKeywords.length > 0 && (
            <div className="keywords-found">
              <p className="keywords-label">Keywords you included:</p>
              <div className="keyword-tags">
                {highlightedKeywords.map((keyword, index) => (
                  <span key={index} className="keyword-tag">
                    ✓ {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
          
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