/**
 * OptionTile Component
 * Flexible option selection with grade-appropriate display
 * Supports visual options for K-2, text for older grades
 */

import React, { useState } from 'react';
import styles from './OptionTile.module.css';

export interface OptionTileProps {
  options: Array<{
    text: string;
    visual?: string; // Emoji or icon for K-2
    id?: string | number;
  }>;
  correctIndex: number;
  format?: 'buttons' | 'cards' | 'visual' | 'professional';
  gradeLevel: string;
  enableHints?: boolean;
  onSelect: (index: number) => void;
  selectedIndex?: number | null;
  showFeedback?: boolean;
  disabled?: boolean;
  questionFormat?: 'standard' | 'i-would' | 'what-if';
}

export const OptionTile: React.FC<OptionTileProps> = ({
  options,
  correctIndex,
  format,
  gradeLevel,
  enableHints = false,
  onSelect,
  selectedIndex = null,
  showFeedback = false,
  disabled = false,
  questionFormat = 'standard'
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  
  // Determine format based on grade if not specified
  const getFormat = () => {
    if (format) return format;
    
    if (['K', '1', '2'].includes(gradeLevel)) return 'visual';
    if (['3', '4', '5'].includes(gradeLevel)) return 'cards';
    if (['6', '7', '8'].includes(gradeLevel)) return 'buttons';
    return 'professional';
  };
  
  const displayFormat = getFormat();
  
  // Get grade-specific styling
  const getGradeStyles = () => {
    if (['K', '1', '2'].includes(gradeLevel)) return styles.gradeK2;
    if (['3', '4', '5'].includes(gradeLevel)) return styles.grade35;
    if (['6', '7', '8'].includes(gradeLevel)) return styles.grade68;
    return styles.grade912;
  };
  
  // Format option text based on question format
  const formatOptionText = (text: string, index: number) => {
    switch (questionFormat) {
      case 'i-would':
        return `I would ${text.toLowerCase()}`;
      case 'what-if':
        return `What if ${text}?`;
      default:
        return text;
    }
  };
  
  // Get option label (A, B, C, D for younger grades)
  const getOptionLabel = (index: number) => {
    if (['K', '1', '2', '3', '4', '5'].includes(gradeLevel)) {
      return String.fromCharCode(65 + index); // A, B, C, D
    }
    return `${index + 1}`;
  };
  
  // Handle option click
  const handleOptionClick = (index: number) => {
    if (disabled || selectedIndex !== null) return;
    onSelect(index);
  };
  
  // Render visual option for K-2
  const renderVisualOption = (option: typeof options[0], index: number) => {
    const isSelected = selectedIndex === index;
    const isCorrect = showFeedback && index === correctIndex;
    const isIncorrect = showFeedback && isSelected && index !== correctIndex;
    
    return (
      <button
        key={index}
        className={`
          ${styles.optionTile}
          ${styles.visualOption}
          ${isSelected ? styles.selected : ''}
          ${isCorrect ? styles.correct : ''}
          ${isIncorrect ? styles.incorrect : ''}
          ${disabled ? styles.disabled : ''}
        `}
        onClick={() => handleOptionClick(index)}
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(null)}
        disabled={disabled || selectedIndex !== null}
        aria-label={`Option ${getOptionLabel(index)}: ${option.text}`}
      >
        <div className={styles.visualContent}>
          {option.visual && (
            <div className={styles.optionVisual}>{option.visual}</div>
          )}
          <div className={styles.optionLabel}>{getOptionLabel(index)}</div>
        </div>
        <div className={styles.optionText}>
          {formatOptionText(option.text, index)}
        </div>
        {showFeedback && isCorrect && (
          <div className={styles.feedbackIcon}>✓</div>
        )}
        {showFeedback && isIncorrect && (
          <div className={styles.feedbackIcon}>✗</div>
        )}
      </button>
    );
  };
  
  // Render card option for grades 3-5
  const renderCardOption = (option: typeof options[0], index: number) => {
    const isSelected = selectedIndex === index;
    const isCorrect = showFeedback && index === correctIndex;
    const isIncorrect = showFeedback && isSelected && index !== correctIndex;
    
    return (
      <div
        key={index}
        className={`
          ${styles.optionTile}
          ${styles.cardOption}
          ${isSelected ? styles.selected : ''}
          ${isCorrect ? styles.correct : ''}
          ${isIncorrect ? styles.incorrect : ''}
          ${disabled ? styles.disabled : ''}
          ${hoveredIndex === index ? styles.hovered : ''}
        `}
        onClick={() => handleOptionClick(index)}
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(null)}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`Option ${getOptionLabel(index)}: ${option.text}`}
      >
        <div className={styles.cardHeader}>
          <span className={styles.cardLabel}>{getOptionLabel(index)}</span>
          {option.visual && <span className={styles.cardVisual}>{option.visual}</span>}
        </div>
        <div className={styles.cardContent}>
          {formatOptionText(option.text, index)}
        </div>
        {showFeedback && (isCorrect || isIncorrect) && (
          <div className={styles.cardFeedback}>
            {isCorrect ? '✓ Correct!' : '✗ Try Again'}
          </div>
        )}
      </div>
    );
  };
  
  // Render button option for grades 6-8
  const renderButtonOption = (option: typeof options[0], index: number) => {
    const isSelected = selectedIndex === index;
    const isCorrect = showFeedback && index === correctIndex;
    const isIncorrect = showFeedback && isSelected && index !== correctIndex;
    
    return (
      <button
        key={index}
        className={`
          ${styles.optionTile}
          ${styles.buttonOption}
          ${isSelected ? styles.selected : ''}
          ${isCorrect ? styles.correct : ''}
          ${isIncorrect ? styles.incorrect : ''}
          ${disabled ? styles.disabled : ''}
        `}
        onClick={() => handleOptionClick(index)}
        disabled={disabled || selectedIndex !== null}
      >
        <span className={styles.buttonLabel}>{getOptionLabel(index)}.</span>
        <span className={styles.buttonText}>
          {formatOptionText(option.text, index)}
        </span>
        {showFeedback && (isCorrect || isIncorrect) && (
          <span className={styles.buttonFeedback}>
            {isCorrect ? '✓' : '✗'}
          </span>
        )}
      </button>
    );
  };
  
  // Render professional option for grades 9-12
  const renderProfessionalOption = (option: typeof options[0], index: number) => {
    const isSelected = selectedIndex === index;
    const isCorrect = showFeedback && index === correctIndex;
    const isIncorrect = showFeedback && isSelected && index !== correctIndex;
    
    return (
      <div
        key={index}
        className={`
          ${styles.optionTile}
          ${styles.professionalOption}
          ${isSelected ? styles.selected : ''}
          ${isCorrect ? styles.correct : ''}
          ${isIncorrect ? styles.incorrect : ''}
          ${disabled ? styles.disabled : ''}
        `}
        onClick={() => handleOptionClick(index)}
        role="button"
        tabIndex={disabled ? -1 : 0}
      >
        <div className={styles.professionalContent}>
          <span className={styles.professionalLabel}>Option {getOptionLabel(index)}</span>
          <p className={styles.professionalText}>
            {formatOptionText(option.text, index)}
          </p>
        </div>
        {showFeedback && (isCorrect || isIncorrect) && (
          <div className={styles.professionalFeedback}>
            {isCorrect ? (
              <span className={styles.correctMark}>✓ Correct</span>
            ) : (
              <span className={styles.incorrectMark}>✗ Incorrect</span>
            )}
          </div>
        )}
      </div>
    );
  };
  
  // Render option based on format
  const renderOption = (option: typeof options[0], index: number) => {
    switch (displayFormat) {
      case 'visual':
        return renderVisualOption(option, index);
      case 'cards':
        return renderCardOption(option, index);
      case 'buttons':
        return renderButtonOption(option, index);
      case 'professional':
        return renderProfessionalOption(option, index);
      default:
        return renderButtonOption(option, index);
    }
  };
  
  return (
    <div className={`${styles.optionTileContainer} ${getGradeStyles()}`}>
      {enableHints && !showFeedback && (
        <div className={styles.hintSection}>
          <button
            className={styles.hintButton}
            onClick={() => setShowHint(!showHint)}
            aria-label="Show hint"
          >
            💡 {showHint ? 'Hide' : 'Show'} Hint
          </button>
          {showHint && (
            <div className={styles.hintContent}>
              Think about which option makes the most sense for this scenario.
            </div>
          )}
        </div>
      )}
      
      <div className={`${styles.optionsGrid} ${styles[`grid${displayFormat.charAt(0).toUpperCase() + displayFormat.slice(1)}`]}`}>
        {options.map((option, index) => renderOption(option, index))}
      </div>
    </div>
  );
};