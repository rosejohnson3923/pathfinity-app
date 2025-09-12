/**
 * InteractiveCanvasTile Component
 * Provides drag-drop, tap-only, and other interactive modes
 * Critical for K-2 grade-appropriate interactions
 */

import React, { useState, useRef, useEffect } from 'react';
import { getInteractionConfig, getTouchTargetSize } from '../utils/interactionConfig';
import styles from './InteractiveCanvasTile.module.css';

export interface CanvasItem {
  id: string;
  content: string | React.ReactNode;
  visual?: string; // Emoji or image for K-2
  type: 'draggable' | 'target' | 'static';
  position?: { x: number; y: number };
  correctTarget?: string; // ID of correct drop target
}

export interface DropTarget {
  id: string;
  label: string;
  accepts: string[]; // IDs of items that can be dropped here
  currentItem?: string; // ID of currently placed item
}

export interface ValidationRule {
  type: 'match' | 'sequence' | 'group';
  validate: (items: CanvasItem[], targets: DropTarget[]) => boolean;
  message?: string;
}

export interface InteractionResult {
  correct: boolean;
  items: CanvasItem[];
  targets?: DropTarget[];
  score?: number;
}

export interface InteractiveCanvasTileProps {
  type: 'drag-drop' | 'sorting' | 'matching' | 'tap-select' | 'multi-select' | 'drawing' | 'selection' | 'professional';
  items: CanvasItem[];
  targets?: DropTarget[];
  validationRules?: ValidationRule[];
  gradeLevel: string;
  instructions?: string;
  showFeedback?: boolean;
  enableHints?: boolean;
  targetSize?: string;
  enableSnapping?: boolean;
  feedback?: 'immediate' | 'on-drop' | 'on-submit';
  onComplete: (result: InteractionResult) => void;
  onInteraction?: (itemId: string, action: string) => void;
}

export const InteractiveCanvasTile: React.FC<InteractiveCanvasTileProps> = ({
  type,
  items: initialItems,
  targets: initialTargets = [],
  validationRules = [],
  gradeLevel,
  instructions,
  showFeedback = false,
  enableHints = false,
  targetSize,
  enableSnapping = false,
  feedback = 'immediate',
  onComplete,
  onInteraction
}) => {
  const [items, setItems] = useState<CanvasItem[]>(initialItems);
  const [targets, setTargets] = useState<DropTarget[]>(initialTargets);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // For multi-select
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string[]>([]); // For sorting
  const [isValidating, setIsValidating] = useState(false);
  const [feedbackMessage, setFeedbackMessageMessage] = useState<string>('');
  const [showHint, setShowHint] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const config = getInteractionConfig(gradeLevel);
  const touchTargetSize = getTouchTargetSize(gradeLevel);
  
  // Auto-show hints for K-2 after delay
  useEffect(() => {
    if (config.hints === 'automatic' && enableHints) {
      const timer = setTimeout(() => {
        setShowHint(true);
      }, 5000); // Show after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [config.hints, enableHints]);
  
  // Handle tap-only interaction for K-2
  const handleTapInteraction = (itemId: string) => {
    if (config.mode !== 'tap-only') return;
    
    const item = items.find(i => i.id === itemId);
    if (!item || item.type !== 'draggable') return;
    
    // Toggle selection
    if (selectedItem === itemId) {
      setSelectedItem(null);
    } else {
      setSelectedItem(itemId);
      
      // Immediate feedback for K-2
      if (config.feedback === 'immediate') {
        validateSelection(itemId);
      }
    }
    
    if (onInteraction) {
      onInteraction(itemId, 'tap');
    }
  };
  
  // Handle drag start
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    if (config.mode === 'tap-only') return;
    
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
    
    if (onInteraction) {
      onInteraction(itemId, 'drag-start');
    }
  };
  
  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  // Handle drop on target
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    if (!draggedItem) return;
    
    const target = targets.find(t => t.id === targetId);
    if (!target || !target.accepts.includes(draggedItem)) {
      setFeedbackMessage('That doesn\'t go there. Try again!');
      setDraggedItem(null);
      return;
    }
    
    // Update target with dropped item
    setTargets(prev => prev.map(t => 
      t.id === targetId 
        ? { ...t, currentItem: draggedItem }
        : t
    ));
    
    // Update item position with snapping if enabled
    if (enableSnapping) {
      // Snap to target center
      const targetElement = e.currentTarget as HTMLElement;
      const rect = targetElement.getBoundingClientRect();
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      
      if (canvasRect) {
        const snapX = rect.left - canvasRect.left + rect.width / 2;
        const snapY = rect.top - canvasRect.top + rect.height / 2;
        
        setItems(prev => prev.map(item =>
          item.id === draggedItem
            ? { ...item, position: { x: snapX, y: snapY } }
            : item
        ));
      }
    } else {
      // Reset position without snapping
      setItems(prev => prev.map(item =>
        item.id === draggedItem
          ? { ...item, position: { x: 0, y: 0 } }
          : item
      ));
    }
    
    setDraggedItem(null);
    
    if (feedback === 'on-drop' || feedback === 'immediate') {
      validatePlacement(draggedItem, targetId);
    }
    
    if (onInteraction) {
      onInteraction(draggedItem, `drop-${targetId}`);
    }
  };
  
  // Validate selection (for tap-only mode)
  const validateSelection = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const isCorrect = validationRules.some(rule => 
      rule.validate([item], targets)
    );
    
    if (isCorrect) {
      setFeedbackMessage('Great job! 🎉');
      // Mark item as completed
      setItems(prev => prev.map(i =>
        i.id === itemId
          ? { ...i, type: 'static' as const }
          : i
      ));
    } else {
      setFeedbackMessage('Try again! 💪');
    }
  };
  
  // Handle multi-select for grades 6-8
  const handleMultiSelect = (itemId: string) => {
    if (type !== 'multi-select') return;
    
    setSelectedItems(prev => {
      const isSelected = prev.includes(itemId);
      if (isSelected) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
    
    if (onInteraction) {
      onInteraction(itemId, 'multi-select');
    }
    
    // Provide immediate feedback if configured
    if (feedback === 'immediate') {
      const newSelection = selectedItems.includes(itemId) 
        ? selectedItems.filter(id => id !== itemId)
        : [...selectedItems, itemId];
      
      if (newSelection.length > 0) {
        setFeedbackMessage(`Selected ${newSelection.length} item(s)`);
      }
    }
  };
  
  // Handle sorting for grades 6-8
  const handleSorting = (itemId: string) => {
    if (type !== 'sorting') return;
    
    setSortOrder(prev => {
      const index = prev.indexOf(itemId);
      if (index > -1) {
        // Remove from sort order
        return prev.filter(id => id !== itemId);
      } else {
        // Add to sort order
        return [...prev, itemId];
      }
    });
    
    if (onInteraction) {
      onInteraction(itemId, 'sort');
    }
  };
  
  // Validate multi-selection
  const validateMultiSelection = () => {
    const selectedItemObjects = items.filter(item => 
      selectedItems.includes(item.id)
    );
    
    const isCorrect = validationRules.some(rule =>
      rule.validate(selectedItemObjects, targets)
    );
    
    if (isCorrect) {
      setFeedbackMessage('Perfect selection! 🎉');
      onComplete({
        correct: true,
        items: selectedItemObjects,
        score: 100
      });
    } else {
      setFeedbackMessage('Not quite right. Review your selections.');
    }
  };
  
  // Validate sorting order
  const validateSorting = () => {
    const sortedItems = sortOrder.map(id => 
      items.find(item => item.id === id)
    ).filter(Boolean) as CanvasItem[];
    
    const isCorrect = validationRules.some(rule =>
      rule.validate(sortedItems, targets)
    );
    
    if (isCorrect) {
      setFeedbackMessage('Correctly sorted! 🎉');
      onComplete({
        correct: true,
        items: sortedItems,
        score: 100
      });
    } else {
      setFeedbackMessage('The order isn\'t quite right. Try again!');
    }
  };
  
  // Handle professional mode for grades 9-12
  const handleProfessionalSelection = (itemId: string) => {
    if (type !== 'professional') return;
    
    // Immediate single selection with no visual feedback
    setSelectedItem(itemId);
    
    // Validate immediately
    const item = items.find(i => i.id === itemId);
    if (item) {
      const isCorrect = validationRules.some(rule =>
        rule.validate([item], targets)
      );
      
      onComplete({
        correct: isCorrect,
        items: [item],
        score: isCorrect ? 100 : 0
      });
      
      // Minimal feedback
      if (feedback === 'immediate') {
        setFeedbackMessage(isCorrect ? '✓' : '✗');
      }
    }
    
    if (onInteraction) {
      onInteraction(itemId, 'professional-select');
    }
  };
  
  // Validate placement (for drag-drop mode)
  const validatePlacement = (itemId: string, targetId: string) => {
    const item = items.find(i => i.id === itemId);
    const target = targets.find(t => t.id === targetId);
    
    if (!item || !target) return;
    
    const isCorrect = item.correctTarget === targetId;
    
    if (isCorrect) {
      setFeedbackMessage('Perfect! 🌟');
    } else {
      setFeedbackMessage('Not quite right. Try another spot!');
    }
  };
  
  // Check if all items are placed correctly
  const checkCompletion = () => {
    setIsValidating(true);
    
    const allCorrect = validationRules.every(rule =>
      rule.validate(items, targets)
    );
    
    const result: InteractionResult = {
      correct: allCorrect,
      items,
      targets,
      score: allCorrect ? 100 : 0
    };
    
    onComplete(result);
    setIsValidating(false);
  };
  
  // Render draggable item
  const renderDraggableItem = (item: CanvasItem) => {
    const isDragging = draggedItem === item.id;
    const isSelected = selectedItem === item.id || selectedItems.includes(item.id);
    const isInSortOrder = sortOrder.includes(item.id);
    const sortPosition = sortOrder.indexOf(item.id) + 1;
    const isCompleted = item.type === 'static';
    
    return (
      <div
        key={item.id}
        className={`
          ${styles.draggableItem}
          ${isDragging ? styles.dragging : ''}
          ${isSelected ? styles.selected : ''}
          ${isCompleted ? styles.completed : ''}
          ${config.mode === 'tap-only' ? styles.tapOnly : ''}
        `}
        draggable={type === 'drag-drop' && !isCompleted}
        onDragStart={(e) => handleDragStart(e, item.id)}
        onClick={() => {
          if (type === 'tap-select' || config.mode === 'tap-only') {
            handleTapInteraction(item.id);
          } else if (type === 'multi-select') {
            handleMultiSelect(item.id);
          } else if (type === 'sorting') {
            handleSorting(item.id);
          } else if (type === 'professional') {
            handleProfessionalSelection(item.id);
          }
        }}
        style={{
          minWidth: touchTargetSize,
          minHeight: touchTargetSize,
          fontSize: `${config.fontSize}px`
        }}
        role="button"
        tabIndex={0}
        aria-label={`Draggable item: ${item.content}`}
      >
        {item.visual && (
          <div className={styles.itemVisual}>{item.visual}</div>
        )}
        <div className={styles.itemContent}>{item.content}</div>
        {isCompleted && (
          <div className={styles.completedMark}>✓</div>
        )}
        {isInSortOrder && type === 'sorting' && (
          <div className={styles.sortOrder}>{sortPosition}</div>
        )}
      </div>
    );
  };
  
  // Render drop target
  const renderDropTarget = (target: DropTarget) => {
    const hasItem = Boolean(target.currentItem);
    const placedItem = items.find(i => i.id === target.currentItem);
    
    return (
      <div
        key={target.id}
        className={`
          ${styles.dropTarget}
          ${hasItem ? styles.hasItem : ''}
        `}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, target.id)}
        style={{
          minWidth: touchTargetSize,
          minHeight: touchTargetSize,
          fontSize: `${config.fontSize}px`
        }}
        role="region"
        aria-label={`Drop target: ${target.label}`}
      >
        <div className={styles.targetLabel}>{target.label}</div>
        {placedItem && (
          <div className={styles.placedItem}>
            {placedItem.visual && <span>{placedItem.visual}</span>}
            <span>{placedItem.content}</span>
          </div>
        )}
      </div>
    );
  };
  
  // Render tap selection grid for K-2
  const renderTapGrid = () => {
    return (
      <div className={styles.tapGrid}>
        {items.map(item => (
          <button
            key={item.id}
            className={`
              ${styles.tapItem}
              ${selectedItem === item.id ? styles.selected : ''}
              ${item.type === 'static' ? styles.completed : ''}
            `}
            onClick={() => handleTapInteraction(item.id)}
            disabled={item.type === 'static'}
            style={{
              minWidth: touchTargetSize,
              minHeight: touchTargetSize,
              fontSize: `${config.fontSize}px`
            }}
          >
            {item.visual && (
              <div className={styles.tapItemVisual}>{item.visual}</div>
            )}
            <div className={styles.tapItemContent}>{item.content}</div>
          </button>
        ))}
      </div>
    );
  };
  
  return (
    <div className={`${styles.interactiveCanvas} ${styles[`grade${gradeLevel}`]}`} ref={canvasRef}>
      {/* Instructions */}
      {instructions && (
        <div className={styles.instructions}>
          <p>{instructions}</p>
          {enableHints && config.hints === 'on-request' && (
            <button
              className={styles.hintButton}
              onClick={() => setShowHint(!showHint)}
            >
              💡 {showHint ? 'Hide' : 'Show'} Hint
            </button>
          )}
        </div>
      )}
      
      {/* Hint display */}
      {showHint && (
        <div className={styles.hintBubble}>
          {config.mode === 'tap-only' 
            ? 'Tap the items to select them!'
            : 'Drag the items to the correct spots!'}
        </div>
      )}
      
      {/* Canvas area */}
      <div className={styles.canvasArea}>
        {config.mode === 'tap-only' ? (
          renderTapGrid()
        ) : (
          <>
            {/* Draggable items */}
            <div className={styles.itemsContainer}>
              {items.filter(item => item.type === 'draggable').map(renderDraggableItem)}
            </div>
            
            {/* Drop targets */}
            {targets.length > 0 && (
              <div className={styles.targetsContainer}>
                {targets.map(renderDropTarget)}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Feedback display */}
      {showFeedback && feedback && (
        <div className={styles.feedbackMessage}>
          {feedback}
        </div>
      )}
      
      {/* Check button for older grades */}
      {config.requireConfirmation && (
        <button
          className={styles.checkButton}
          onClick={checkCompletion}
          disabled={isValidating}
        >
          Check Answer
        </button>
      )}
    </div>
  );
};