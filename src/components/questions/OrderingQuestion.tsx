/**
 * Ordering Question Component
 * Arrange items in the correct sequence
 */

import React, { useState, useEffect } from 'react';
import { OrderingQuestion as OQuestion } from '../../types/questions';
import { VisualRenderer } from '../ai-containers/VisualRenderer';
import './QuestionStyles.css';

// ============================================================================
// INTERFACES
// ============================================================================

interface OrderingQuestionProps {
  question: OQuestion;
  onAnswer: (answer: string[]) => void;
  disabled?: boolean;
  showFeedback?: boolean;
  userAnswer?: string[];
  isCorrect?: boolean;
  theme?: 'light' | 'dark';
  careerContext?: string;
  companionName?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const OrderingQuestion: React.FC<OrderingQuestionProps> = ({
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
  // Initialize with shuffled items
  const [orderedItems, setOrderedItems] = useState<string[]>(() => {
    if (userAnswer) return userAnswer;
    // Shuffle the items for initial display
    return [...question.items.map(item => item.id)].sort(() => Math.random() - 0.5);
  });
  const [hasAnswered, setHasAnswered] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (userAnswer) {
      setOrderedItems(userAnswer);
      setHasAnswered(true);
    }
  }, [userAnswer]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (disabled || hasAnswered) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (disabled || hasAnswered) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (disabled || hasAnswered || draggedIndex === null) return;
    
    const newOrder = [...orderedItems];
    const draggedItem = newOrder[draggedIndex];
    
    // Remove item from old position
    newOrder.splice(draggedIndex, 1);
    
    // Insert at new position
    newOrder.splice(dropIndex, 0, draggedItem);
    
    setOrderedItems(newOrder);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (disabled || hasAnswered) return;
    
    const newOrder = [...orderedItems];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newOrder.length) return;
    
    // Swap items
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    setOrderedItems(newOrder);
  };

  const handleSubmit = () => {
    if (disabled || hasAnswered) return;
    
    setHasAnswered(true);
    onAnswer(orderedItems);
  };

  const getItemById = (id: string) => {
    return question.items.find(item => item.id === id);
  };

  const getOrderTypeIcon = () => {
    switch (question.orderType) {
      case 'sequential': return '🔢';
      case 'chronological': return '🕐';
      case 'logical': return '🧩';
      case 'size': return '📏';
      default: return '📝';
    }
  };

  const getOrderTypeHint = () => {
    switch (question.orderType) {
      case 'sequential': return 'Arrange in numerical or alphabetical order';
      case 'chronological': return 'Arrange by time (earliest to latest)';
      case 'logical': return 'Arrange in logical sequence';
      case 'size': return 'Arrange by size (smallest to largest)';
      default: return 'Arrange in the correct order';
    }
  };

  const isItemCorrect = (itemId: string, index: number): boolean => {
    if (!showFeedback || !hasAnswered) return false;
    return question.correctOrder[index] === itemId;
  };

  return (
    <div className={`ordering-question theme-${theme}`}>
      {/* Question Header with Career Context */}
      {careerContext && (
        <div className="question-context">
          <span className="career-badge">{careerContext}</span>
        </div>
      )}

      {/* Question Text */}
      <div className="question-text">
        <h3>{question.question}</h3>
        <div className="order-type-hint">
          <span className="order-icon">{getOrderTypeIcon()}</span>
          <span className="order-hint">{getOrderTypeHint()}</span>
        </div>
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

      {/* Ordering List */}
      <div className="ordering-container">
        {orderedItems.map((itemId, index) => {
          const item = getItemById(itemId);
          if (!item) return null;
          
          const isCorrectPosition = isItemCorrect(itemId, index);
          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;
          
          return (
            <div
              key={itemId}
              className={`ordering-item ${isDragging ? 'dragging' : ''} ${
                isDragOver ? 'drag-over' : ''
              } ${showFeedback && hasAnswered ? (
                isCorrectPosition ? 'correct' : 'incorrect'
              ) : ''}`}
              draggable={!disabled && !hasAnswered}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className="item-content">
                <span className="item-number">{index + 1}</span>
                
                {item.visual && (
                  <div className="item-visual">
                    <VisualRenderer 
                      visual={item.visual.content}
                      type={item.visual.type}
                      alt={item.visual.alt}
                    />
                  </div>
                )}
                
                <span className="item-text">{item.text}</span>
              </div>
              
              {!hasAnswered && !disabled && (
                <div className="item-controls">
                  <button
                    className="move-button"
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    className="move-button"
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === orderedItems.length - 1}
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                </div>
              )}
              
              {showFeedback && hasAnswered && (
                <span className="position-feedback">
                  {isCorrectPosition ? '✓' : '✗'}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      {!hasAnswered && (
        <button 
          className="submit-button"
          onClick={handleSubmit}
          disabled={disabled}
        >
          Submit Order
        </button>
      )}

      {/* Feedback Section */}
      {showFeedback && hasAnswered && (
        <div className={`question-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-message">
            {isCorrect ? (
              <>
                <span className="feedback-icon-large">🎉</span>
                <span>Perfect! You got the correct order!</span>
              </>
            ) : (
              <>
                <span className="feedback-icon-large">💡</span>
                <span>Not quite right. Check the feedback marks above.</span>
              </>
            )}
          </div>
          {question.explanation && (
            <div className="feedback-explanation">
              <p>{question.explanation}</p>
              {!isCorrect && (
                <div className="correct-order-display">
                  <p className="correct-order-label">Correct order:</p>
                  <ol className="correct-order-list">
                    {question.correctOrder.map((itemId, index) => {
                      const item = getItemById(itemId);
                      return item ? (
                        <li key={itemId}>{item.text}</li>
                      ) : null;
                    })}
                  </ol>
                </div>
              )}
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