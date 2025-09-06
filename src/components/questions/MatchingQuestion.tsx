/**
 * Matching Question Component
 * Match items from two columns
 */

import React, { useState, useEffect } from 'react';
import { MatchingQuestion as MQuestion } from '../../types/questions';
import { VisualRenderer } from '../ai-containers/VisualRenderer';
import './QuestionStyles.css';

// ============================================================================
// INTERFACES
// ============================================================================

interface MatchingQuestionProps {
  question: MQuestion;
  onAnswer: (answer: Array<[string, string]>) => void;
  disabled?: boolean;
  showFeedback?: boolean;
  userAnswer?: Array<[string, string]>;
  isCorrect?: boolean;
  theme?: 'light' | 'dark';
  careerContext?: string;
  companionName?: string;
}

interface MatchState {
  [leftId: string]: string | null; // leftId -> rightId or null
}

// ============================================================================
// COMPONENT
// ============================================================================

export const MatchingQuestion: React.FC<MatchingQuestionProps> = ({
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
  const [matches, setMatches] = useState<MatchState>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // Initialize matches from userAnswer
  useEffect(() => {
    if (userAnswer) {
      const newMatches: MatchState = {};
      userAnswer.forEach(([leftId, rightId]) => {
        newMatches[leftId] = rightId;
      });
      setMatches(newMatches);
      setHasAnswered(true);
    }
  }, [userAnswer]);

  const handleLeftClick = (leftId: string) => {
    if (disabled || hasAnswered) return;
    
    if (selectedLeft === leftId) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(leftId);
      if (selectedRight) {
        // Make a match
        makeMatch(leftId, selectedRight);
      }
    }
  };

  const handleRightClick = (rightId: string) => {
    if (disabled || hasAnswered) return;
    
    if (selectedRight === rightId) {
      setSelectedRight(null);
    } else {
      setSelectedRight(rightId);
      if (selectedLeft) {
        // Make a match
        makeMatch(selectedLeft, rightId);
      }
    }
  };

  const makeMatch = (leftId: string, rightId: string) => {
    const newMatches = { ...matches };
    
    // Remove any existing match for this right item
    Object.keys(newMatches).forEach(key => {
      if (newMatches[key] === rightId) {
        newMatches[key] = null;
      }
    });
    
    // Make the new match
    newMatches[leftId] = rightId;
    setMatches(newMatches);
    
    // Clear selections
    setSelectedLeft(null);
    setSelectedRight(null);
  };

  const removeMatch = (leftId: string) => {
    if (disabled || hasAnswered) return;
    
    const newMatches = { ...matches };
    newMatches[leftId] = null;
    setMatches(newMatches);
  };

  const handleSubmit = () => {
    if (disabled || hasAnswered) return;
    
    // Convert matches to array format
    const answerPairs: Array<[string, string]> = [];
    Object.entries(matches).forEach(([leftId, rightId]) => {
      if (rightId) {
        answerPairs.push([leftId, rightId]);
      }
    });
    
    if (answerPairs.length === question.leftColumn.length) {
      setHasAnswered(true);
      onAnswer(answerPairs);
    }
  };

  const isAllMatched = () => {
    return question.leftColumn.every(item => matches[item.id]);
  };

  const isCorrectMatch = (leftId: string, rightId: string): boolean => {
    if (!showFeedback || !hasAnswered) return false;
    return question.correctPairs.some(([l, r]) => l === leftId && r === rightId);
  };

  const isIncorrectMatch = (leftId: string, rightId: string): boolean => {
    if (!showFeedback || !hasAnswered) return false;
    return matches[leftId] === rightId && !isCorrectMatch(leftId, rightId);
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    if (disabled || hasAnswered) return;
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (disabled || hasAnswered || !draggedItem) return;
    
    // If dragged from left and dropped on right
    if (question.leftColumn.some(item => item.id === draggedItem) &&
        question.rightColumn.some(item => item.id === targetId)) {
      makeMatch(draggedItem, targetId);
    }
    
    setDraggedItem(null);
  };

  return (
    <div className={`matching-question theme-${theme}`}>
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

      {/* Matching Columns */}
      <div className="matching-container">
        <div className="matching-columns">
          {/* Left Column */}
          <div className="match-column left-column">
            <h4 className="column-header">Match From:</h4>
            {question.leftColumn.map(item => (
              <div
                key={item.id}
                className={`match-item ${
                  selectedLeft === item.id ? 'selected' : ''
                } ${matches[item.id] ? 'matched' : ''}`}
                onClick={() => handleLeftClick(item.id)}
                draggable={!disabled && !hasAnswered}
                onDragStart={(e) => handleDragStart(e, item.id)}
              >
                {item.visual && (
                  <VisualRenderer 
                    visual={item.visual.content}
                    type={item.visual.type}
                    alt={item.visual.alt}
                  />
                )}
                <span className="match-text">{item.text}</span>
                {matches[item.id] && (
                  <button
                    className="match-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMatch(item.id);
                    }}
                    disabled={disabled || hasAnswered}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Connection Lines */}
          <div className="match-connections">
            {Object.entries(matches).map(([leftId, rightId]) => {
              if (!rightId) return null;
              const isCorrectConnection = isCorrectMatch(leftId, rightId);
              const isIncorrectConnection = isIncorrectMatch(leftId, rightId);
              
              return (
                <div
                  key={`${leftId}-${rightId}`}
                  className={`connection-line ${
                    isCorrectConnection ? 'correct' : ''
                  } ${isIncorrectConnection ? 'incorrect' : ''}`}
                />
              );
            })}
          </div>

          {/* Right Column */}
          <div className="match-column right-column">
            <h4 className="column-header">Match To:</h4>
            {question.rightColumn.map(item => {
              const isMatched = Object.values(matches).includes(item.id);
              const matchedLeftId = Object.keys(matches).find(k => matches[k] === item.id);
              
              return (
                <div
                  key={item.id}
                  className={`match-item ${
                    selectedRight === item.id ? 'selected' : ''
                  } ${isMatched ? 'matched' : ''} ${
                    showFeedback && hasAnswered && matchedLeftId ? 
                      (isCorrectMatch(matchedLeftId, item.id) ? 'correct' : 'incorrect') : ''
                  }`}
                  onClick={() => handleRightClick(item.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, item.id)}
                >
                  {item.visual && (
                    <VisualRenderer 
                      visual={item.visual.content}
                      type={item.visual.type}
                      alt={item.visual.alt}
                    />
                  )}
                  <span className="match-text">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      {!hasAnswered && (
        <button 
          className="submit-button"
          onClick={handleSubmit}
          disabled={disabled || !isAllMatched()}
        >
          {isAllMatched() ? 'Submit Matches' : `Match all items (${Object.values(matches).filter(Boolean).length}/${question.leftColumn.length})`}
        </button>
      )}

      {/* Feedback Section */}
      {showFeedback && hasAnswered && (
        <div className={`question-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-message">
            {isCorrect ? (
              <>
                <span className="feedback-icon-large">🎉</span>
                <span>Perfect! All matches are correct!</span>
              </>
            ) : (
              <>
                <span className="feedback-icon-large">💡</span>
                <span>Not all matches are correct. Review the connections above.</span>
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