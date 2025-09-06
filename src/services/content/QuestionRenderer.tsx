/**
 * QUESTION RENDERER - TYPE-SAFE RENDERING FOR ALL 15 QUESTION TYPES
 * 
 * Comprehensive renderer that uses type guards to render all question types
 * with proper TypeScript type safety and validation integration
 */

import React, { useState } from 'react';
import questionStyles from '../../components/questions/QuestionStyles.module.css';
import styles from './QuestionRenderer.module.css';
import {
  Question,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  FillBlankQuestion,
  NumericQuestion,
  ShortAnswerQuestion,
  LongAnswerQuestion,
  MatchingQuestion,
  OrderingQuestion,
  ClassificationQuestion,
  VisualIdentificationQuestion,
  CountingQuestion,
  PatternRecognitionQuestion,
  CodeCompletionQuestion,
  DiagramLabelingQuestion,
  OpenEndedQuestion,
  isMultipleChoice,
  isTrueFalse,
  isFillBlank,
  isNumeric,
  isShortAnswer,
  isLongAnswer,
  isMatching,
  isOrdering,
  isClassification,
  isVisualIdentification,
  isCounting,
  isPatternRecognition,
  isCodeCompletion,
  isDiagramLabeling,
  isOpenEnded
} from './QuestionTypes';
import { ValidationResult } from './QuestionValidator';

// ================================================================
// INTERFACES
// ================================================================

export interface QuestionRendererProps {
  question: Question;
  onAnswer: (answer: any) => void;
  disabled?: boolean;
  showFeedback?: boolean;
  validationResult?: ValidationResult;
  theme?: 'light' | 'dark';
  careerContext?: string;
  companionName?: string;
}

// ================================================================
// HELPER FUNCTIONS
// ================================================================

// Helper function to strip emojis from text
const stripEmojis = (text: string): string => {
  // Remove common emojis and unicode emoji ranges
  return text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F1FF}]|[\u{1F200}-\u{1F2FF}]|[\u{1F680}-\u{1F6FF}]/gu, '').trim();
};

// ================================================================
// MAIN QUESTION RENDERER
// ================================================================

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  onAnswer,
  disabled = false,
  showFeedback = false,
  validationResult,
  theme = 'light',
  careerContext,
  companionName
}) => {
  // Debug logging at the top level
  console.log('📍 QuestionRenderer - Incoming Question:', {
    type: question.type,
    content: question.content,
    hasContent: !!question.content,
    contentType: typeof question.content,
    fullQuestion: question
  });

  // Type-safe rendering using type guards
  if (isMultipleChoice(question)) {
    return (
      <MultipleChoiceRenderer
        question={question}
        onAnswer={onAnswer}
        disabled={disabled}
        showFeedback={showFeedback}
        validationResult={validationResult}
        theme={theme}
      />
    );
  }

  if (isTrueFalse(question)) {
    return (
      <TrueFalseRenderer
        question={question}
        onAnswer={onAnswer}
        disabled={disabled}
        showFeedback={showFeedback}
        validationResult={validationResult}
        theme={theme}
      />
    );
  }

  if (isFillBlank(question)) {
    return (
      <FillBlankRenderer
        question={question}
        onAnswer={onAnswer}
        disabled={disabled}
        showFeedback={showFeedback}
        validationResult={validationResult}
        theme={theme}
      />
    );
  }

  if (isNumeric(question)) {
    return (
      <NumericRenderer
        question={question}
        onAnswer={onAnswer}
        disabled={disabled}
        showFeedback={showFeedback}
        validationResult={validationResult}
        theme={theme}
      />
    );
  }

  if (isShortAnswer(question)) {
    return (
      <ShortAnswerRenderer
        question={question}
        onAnswer={onAnswer}
        disabled={disabled}
        showFeedback={showFeedback}
        validationResult={validationResult}
        theme={theme}
      />
    );
  }

  if (isLongAnswer(question)) {
    return (
      <LongAnswerRenderer
        question={question}
        onAnswer={onAnswer}
        disabled={disabled}
        showFeedback={showFeedback}
        theme={theme}
      />
    );
  }

  if (isMatching(question)) {
    return (
      <MatchingRenderer
        question={question}
        onAnswer={onAnswer}
        disabled={disabled}
        showFeedback={showFeedback}
        validationResult={validationResult}
        theme={theme}
      />
    );
  }

  if (isOrdering(question)) {
    return (
      <OrderingRenderer
        question={question}
        onAnswer={onAnswer}
        disabled={disabled}
        showFeedback={showFeedback}
        validationResult={validationResult}
        theme={theme}
      />
    );
  }

  if (isClassification(question)) {
    return (
      <ClassificationRenderer
        question={question}
        onAnswer={onAnswer}
        disabled={disabled}
        showFeedback={showFeedback}
        validationResult={validationResult}
        theme={theme}
      />
    );
  }

  if (isVisualIdentification(question)) {
    return (
      <VisualIdentificationRenderer
        question={question}
        onAnswer={onAnswer}
        disabled={disabled}
        showFeedback={showFeedback}
        validationResult={validationResult}
        theme={theme}
      />
    );
  }

  if (isCounting(question)) {
    return (
      <CountingRenderer
        question={question}
        onAnswer={onAnswer}
        disabled={disabled}
        showFeedback={showFeedback}
        validationResult={validationResult}
        theme={theme}
      />
    );
  }

  if (isPatternRecognition(question)) {
    return (
      <PatternRecognitionRenderer
        question={question}
        onAnswer={onAnswer}
        disabled={disabled}
        showFeedback={showFeedback}
        validationResult={validationResult}
        theme={theme}
      />
    );
  }

  if (isCodeCompletion(question)) {
    return (
      <CodeCompletionRenderer
        question={question}
        onAnswer={onAnswer}
        disabled={disabled}
        showFeedback={showFeedback}
        validationResult={validationResult}
        theme={theme}
      />
    );
  }

  if (isDiagramLabeling(question)) {
    return (
      <DiagramLabelingRenderer
        question={question}
        onAnswer={onAnswer}
        disabled={disabled}
        showFeedback={showFeedback}
        validationResult={validationResult}
        theme={theme}
      />
    );
  }

  if (isOpenEnded(question)) {
    return (
      <OpenEndedRenderer
        question={question}
        onAnswer={onAnswer}
        disabled={disabled}
        theme={theme}
      />
    );
  }

  // Fallback for unknown types
  return (
    <div className={`question-renderer fallback ${theme}`}>
      <p>Unsupported question type: {question.type}</p>
      <OpenEndedRenderer
        question={question as OpenEndedQuestion}
        onAnswer={onAnswer}
        disabled={disabled}
        theme={theme}
      />
    </div>
  );
};

// ================================================================
// INDIVIDUAL QUESTION RENDERERS
// ================================================================

// 1. Multiple Choice Renderer
const MultipleChoiceRenderer: React.FC<{
  question: MultipleChoiceQuestion;
  onAnswer: (answer: any) => void;
  disabled: boolean;
  showFeedback: boolean;
  validationResult?: ValidationResult;
  theme: string;
}> = ({ question, onAnswer, disabled, showFeedback, validationResult, theme }) => {
  const [selected, setSelected] = useState<string[]>([]);

  // Debug logging for question content
  console.log('🎯 MultipleChoiceRenderer - Question Data:', {
    content: question.content,
    hasContent: !!question.content,
    contentLength: question.content?.length,
    type: question.type,
    media: question.media,
    options: question.options?.map(o => o.text),
    optionObjects: question.options,
    optionsLength: question.options?.length,
    firstOptionText: question.options?.[0]?.text,
    correctOption: question.options?.find(o => o.isCorrect)?.text
  });

  const handleSelect = (optionId: string) => {
    if (disabled) return;

    if (question.allowMultiple) {
      const newSelected = selected.includes(optionId)
        ? selected.filter(id => id !== optionId)
        : [...selected, optionId];
      setSelected(newSelected);
      onAnswer(newSelected);
    } else {
      setSelected([optionId]);
      onAnswer(optionId);
    }
  };

  return (
    <div className={`multiple-choice-question theme-${theme || 'light'}`}>
      <div className="question-text">
        {question.content ? (
          <h3>{stripEmojis(question.content)}</h3>
        ) : (
          <h3 className={questionStyles.errorMessage}>⚠️ No question content</h3>
        )}
      </div>
      {question.media && question.media.url !== '❓' && (
        <div className="question-visual">
          {question.media.type === 'image' && (
            <div style={{ 
              fontSize: '3rem', 
              textAlign: 'center', 
              margin: '1.5rem 0',
              lineHeight: '1.2',
              letterSpacing: '0.5rem'
            }}>
              {question.media.url}
            </div>
          )}
        </div>
      )}
      <div className="mc-options-container">
        {question.options.map(option => (
          <button
            key={option.id}
            className={`mc-option ${selected.includes(option.id) ? 'selected' : ''} 
                       ${showFeedback && option.isCorrect ? 'correct' : ''}
                       ${showFeedback && selected.includes(option.id) && !option.isCorrect ? 'incorrect' : ''} 
                       ${disabled ? 'disabled' : ''}`}
            onClick={() => handleSelect(option.id)}
            disabled={disabled}
          >
            <span className="option-label">{String.fromCharCode(65 + question.options.indexOf(option))}</span>
            <span className="option-text">{option.text}</span>
          </button>
        ))}
      </div>
      {showFeedback && validationResult && (
        <div className={`question-feedback ${validationResult.isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-message">
            <span className="feedback-icon-large">{validationResult.isCorrect ? '✓' : '✗'}</span>
            <span>{validationResult.feedback}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 2. True/False Renderer
const TrueFalseRenderer: React.FC<{
  question: TrueFalseQuestion;
  onAnswer: (answer: any) => void;
  disabled: boolean;
  showFeedback: boolean;
  validationResult?: ValidationResult;
  theme: string;
}> = ({ question, onAnswer, disabled, showFeedback, validationResult, theme }) => {
  const [selected, setSelected] = useState<boolean | null>(null);

  const handleSelect = (value: boolean) => {
    if (disabled) return;
    setSelected(value);
    onAnswer(value);
  };

  // Debug logging for question content and media
  console.log('🎯 TrueFalseRenderer - Question Data:', {
    content: question.content,
    hasContent: !!question.content,
    contentLength: question.content?.length,
    statement: question.statement,
    media: question.media,
    correctAnswer: question.correctAnswer
  });


  return (
    <div className={`true-false-question theme-${theme || 'light'}`} data-theme={theme}>
      <div className="question-text">
        {question.content ? (
          <h3>{stripEmojis(question.content)}</h3>
        ) : (
          <h3 className={questionStyles.errorMessage}>⚠️ No question content</h3>
        )}
      </div>
      {question.media && question.media.url !== '❓' && (
        <div className="question-visual">
          {question.media.type === 'image' && (
            <div style={{ 
              fontSize: '3rem', 
              textAlign: 'center', 
              margin: '1.5rem 0',
              lineHeight: '1.2',
              letterSpacing: '0.5rem'
            }}>
              {question.media.url}
            </div>
          )}
        </div>
      )}
      {question.statement && question.statement !== question.content && (
        <p className="tf-statement">{question.statement}</p>
      )}
      <div className="tf-buttons-container">
        <button
          className={`tf-button true-button ${selected === true ? 'selected' : ''} 
                     ${showFeedback && question.correctAnswer === true ? 'correct' : ''}`}
          onClick={() => handleSelect(true)}
          disabled={disabled}
          style={theme === 'dark' ? {
            background: selected === true ? '#4a5568' : '#2d3748',
            borderColor: selected === true ? '#667eea' : '#4a5568',
            color: '#ffffff'
          } : undefined}
        >
          <span className="tf-icon">✓</span>
          <span className="tf-text">True</span>
        </button>
        <button
          className={`tf-button false-button ${selected === false ? 'selected' : ''} 
                      ${showFeedback && question.correctAnswer === false ? 'correct' : ''}`}
          onClick={() => handleSelect(false)}
          disabled={disabled}
          style={theme === 'dark' ? {
            background: selected === false ? '#4a5568' : '#2d3748',
            borderColor: selected === false ? '#667eea' : '#4a5568',
            color: '#ffffff'
          } : undefined}
        >
          <span className="tf-icon">✗</span>
          <span className="tf-text">False</span>
        </button>
      </div>
      {showFeedback && validationResult && (
        <div className={`question-feedback ${validationResult.isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-message">
            <span className="feedback-icon-large">{validationResult.isCorrect ? '✓' : '✗'}</span>
            <span>{validationResult.feedback}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 3. Fill in the Blank Renderer
const FillBlankRenderer: React.FC<{
  question: FillBlankQuestion;
  onAnswer: (answer: any) => void;
  disabled: boolean;
  showFeedback: boolean;
  validationResult?: ValidationResult;
  theme: string;
}> = ({ question, onAnswer, disabled, showFeedback, validationResult, theme }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleChange = (blankId: string, value: string) => {
    if (disabled) return;
    const newAnswers = { ...answers, [blankId]: value };
    setAnswers(newAnswers);
    onAnswer(newAnswers);
  };

  // Parse template and replace blanks with inputs
  const renderTemplate = () => {
    let template = question.template;
    return question.blanks.map((blank, index) => {
      const parts = template.split(`{{${blank.id}}}`);
      return (
        <span key={blank.id}>
          {parts[0]}
          <input
            type="text"
            value={answers[blank.id] || ''}
            onChange={(e) => handleChange(blank.id, e.target.value)}
            disabled={disabled}
            className={`blank-input ${showFeedback ? (validationResult?.partialCredit?.details[index]?.includes('Correct') ? 'correct' : 'incorrect') : ''}`}
            placeholder="___"
          />
          {parts[1]}
        </span>
      );
    });
  };

  return (
    <div className={`fill-blank-question theme-${theme || 'light'}`}>
      <h3>{stripEmojis(question.content)}</h3>
      <div className="template">
        {renderTemplate()}
      </div>
      {showFeedback && validationResult && (
        <div className={`feedback ${validationResult.isCorrect ? 'correct' : 'incorrect'}`}>
          {validationResult.feedback}
          {validationResult.partialCredit && (
            <div className="partial-credit">
              Score: {validationResult.score}/{validationResult.maxScore}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 4. Numeric Renderer
const NumericRenderer: React.FC<{
  question: NumericQuestion;
  onAnswer: (answer: any) => void;
  disabled: boolean;
  showFeedback: boolean;
  validationResult?: ValidationResult;
  theme: string;
}> = ({ question, onAnswer, disabled, showFeedback, validationResult, theme }) => {
  const [value, setValue] = useState<string>('');

  const handleChange = (newValue: string) => {
    if (disabled) return;
    setValue(newValue);
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue)) {
      onAnswer(numValue);
    }
  };

  return (
    <div className={`numeric-question theme-${theme || 'light'}`}>
      <h3>{stripEmojis(question.content)}</h3>
      <div className="numeric-input-section">
        <div className="input-wrapper">
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            min={question.minValue}
            max={question.maxValue}
            step="any"
            className={`numeric-input ${showFeedback ? (validationResult?.isCorrect ? 'correct' : 'incorrect') : ''}`}
          />
          {question.unit && <span className="unit-label">{question.unit}</span>}
        </div>
      </div>
      {showFeedback && validationResult && (
        <div className={`question-feedback ${validationResult.isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-message">
            <span className="feedback-icon-large">{validationResult.isCorrect ? '✓' : '✗'}</span>
            <span>{validationResult.feedback}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 5. Short Answer Renderer
const ShortAnswerRenderer: React.FC<{
  question: ShortAnswerQuestion;
  onAnswer: (answer: any) => void;
  disabled: boolean;
  showFeedback: boolean;
  validationResult?: ValidationResult;
  theme: string;
}> = ({ question, onAnswer, disabled, showFeedback, validationResult, theme }) => {
  const [value, setValue] = useState<string>('');

  const handleChange = (newValue: string) => {
    if (disabled) return;
    setValue(newValue);
    onAnswer(newValue);
  };

  return (
    <div className={`short-answer-question theme-${theme || 'light'}`}>
      <h3>{stripEmojis(question.content)}</h3>
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        maxLength={question.maxLength}
        className={showFeedback ? (validationResult?.isCorrect ? 'correct' : 'incorrect') : ''}
        placeholder="Type your answer..."
      />
      <div className="char-count">
        {value.length}/{question.maxLength || 100}
      </div>
      {showFeedback && validationResult && (
        <div className={`question-feedback ${validationResult.isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-message">
            <span className="feedback-icon-large">{validationResult.isCorrect ? '✓' : '✗'}</span>
            <span>{validationResult.feedback}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 6. Long Answer Renderer
const LongAnswerRenderer: React.FC<{
  question: LongAnswerQuestion;
  onAnswer: (answer: any) => void;
  disabled: boolean;
  showFeedback: boolean;
  theme: string;
}> = ({ question, onAnswer, disabled, theme }) => {
  const [value, setValue] = useState<string>('');
  const wordCount = value.split(/\s+/).filter(w => w.length > 0).length;

  const handleChange = (newValue: string) => {
    if (disabled) return;
    setValue(newValue);
    onAnswer(newValue);
  };

  return (
    <div className={`question-long-answer ${theme}`}>
      <h3>{stripEmojis(question.content)}</h3>
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        rows={8}
        placeholder="Write your answer here..."
      />
      <div className="word-count">
        Words: {wordCount}
        {question.minWords && ` (min: ${question.minWords})`}
        {question.maxWords && ` (max: ${question.maxWords})`}
      </div>
      {question.rubric && (
        <div className="rubric">
          <h4>Grading Criteria:</h4>
          {question.rubric.criteria.map(criterion => (
            <div key={criterion.name}>
              {criterion.name}: {criterion.description} ({criterion.points} points)
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 7. Matching Renderer (simplified)
const MatchingRenderer: React.FC<{
  question: MatchingQuestion;
  onAnswer: (answer: any) => void;
  disabled: boolean;
  showFeedback: boolean;
  validationResult?: ValidationResult;
  theme: string;
}> = ({ question, onAnswer, disabled, showFeedback, validationResult, theme }) => {
  const [matches, setMatches] = useState<Array<{ leftId: string; rightId: string }>>([]);

  // Simplified matching interface
  return (
    <div className={`question-matching ${theme}`}>
      <h3>{stripEmojis(question.content)}</h3>
      <div className="matching-container">
        <div className="left-column">
          {question.leftColumn.map(item => (
            <div key={item.id} className="match-item">
              {item.text}
            </div>
          ))}
        </div>
        <div className="right-column">
          {question.rightColumn.map(item => (
            <div key={item.id} className="match-item">
              {item.text}
            </div>
          ))}
        </div>
      </div>
      <p className="instruction">Draw lines to match items (functionality simplified for demo)</p>
      {showFeedback && validationResult && (
        <div className={`question-feedback ${validationResult.isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-message">
            <span className="feedback-icon-large">{validationResult.isCorrect ? '✓' : '✗'}</span>
            <span>{validationResult.feedback}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 8. Ordering Renderer (simplified)
const OrderingRenderer: React.FC<{
  question: OrderingQuestion;
  onAnswer: (answer: any) => void;
  disabled: boolean;
  showFeedback: boolean;
  validationResult?: ValidationResult;
  theme: string;
}> = ({ question, onAnswer, disabled, showFeedback, validationResult, theme }) => {
  const [order, setOrder] = useState<string[]>(question.items.map(i => i.id));

  return (
    <div className={`question-ordering ${theme}`}>
      <h3>{stripEmojis(question.content)}</h3>
      <div className="items-list">
        {order.map((itemId, index) => {
          const item = question.items.find(i => i.id === itemId);
          return (
            <div key={itemId} className="order-item">
              {index + 1}. {item?.text}
            </div>
          );
        })}
      </div>
      <p className="instruction">Drag to reorder (functionality simplified for demo)</p>
      {showFeedback && validationResult && (
        <div className={`question-feedback ${validationResult.isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-message">
            <span className="feedback-icon-large">{validationResult.isCorrect ? '✓' : '✗'}</span>
            <span>{validationResult.feedback}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 9. Classification Renderer (simplified)
const ClassificationRenderer: React.FC<{
  question: ClassificationQuestion;
  onAnswer: (answer: any) => void;
  disabled: boolean;
  showFeedback: boolean;
  validationResult?: ValidationResult;
  theme: string;
}> = ({ question, onAnswer, disabled, showFeedback, validationResult, theme }) => {
  return (
    <div className={`question-classification ${theme}`}>
      <h3>{stripEmojis(question.content)}</h3>
      <div className="categories">
        {question.categories.map(category => (
          <div key={category.id} className="category">
            <h4>{category.name}</h4>
            {category.description && <p>{category.description}</p>}
          </div>
        ))}
      </div>
      <div className="items">
        {question.items.map(item => (
          <div key={item.id} className="classify-item">
            {item.text}
          </div>
        ))}
      </div>
      <p className="instruction">Drag items to categories (functionality simplified for demo)</p>
      {showFeedback && validationResult && (
        <div className={`question-feedback ${validationResult.isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-message">
            <span className="feedback-icon-large">{validationResult.isCorrect ? '✓' : '✗'}</span>
            <span>{validationResult.feedback}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 10. Visual Identification Renderer
const VisualIdentificationRenderer: React.FC<{
  question: VisualIdentificationQuestion;
  onAnswer: (answer: any) => void;
  disabled: boolean;
  showFeedback: boolean;
  validationResult?: ValidationResult;
  theme: string;
}> = ({ question, onAnswer, disabled, showFeedback, validationResult, theme }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleAreaClick = (areaId: string) => {
    if (disabled) return;
    const newSelected = selected.includes(areaId)
      ? selected.filter(id => id !== areaId)
      : [...selected, areaId];
    setSelected(newSelected);
    onAnswer(newSelected);
  };

  return (
    <div className={`question-visual-identification ${theme}`}>
      <h3>{stripEmojis(question.content)}</h3>
      <p>{question.questionPrompt}</p>
      <div className="image-container">
        <img src={question.imageUrl} alt={question.imageAlt} />
        {question.targetAreas.map(area => (
          <div
            key={area.id}
            className={`target-area ${selected.includes(area.id) ? 'selected' : ''}`}
            style={{
              position: 'absolute',
              left: area.x,
              top: area.y,
              width: area.width,
              height: area.height
            }}
            onClick={() => handleAreaClick(area.id)}
            title={area.label}
          />
        ))}
      </div>
      {showFeedback && validationResult && (
        <div className={`question-feedback ${validationResult.isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-message">
            <span className="feedback-icon-large">{validationResult.isCorrect ? '✓' : '✗'}</span>
            <span>{validationResult.feedback}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 11. Counting Renderer
const CountingRenderer: React.FC<{
  question: CountingQuestion;
  onAnswer: (answer: any) => void;
  disabled: boolean;
  showFeedback: boolean;
  validationResult?: ValidationResult;
  theme: string;
}> = ({ question, onAnswer, disabled, showFeedback, validationResult, theme }) => {
  const [count, setCount] = useState<string>('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleChange = (value: string) => {
    if (disabled || hasSubmitted) return;
    setCount(value);
    
    // Immediately notify parent of answer change
    // Parent container will handle the Submit button
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onAnswer(numValue);
    } else if (value === '') {
      onAnswer(null);
    }
  };

  // handleSubmit no longer needed - parent handles submission

  return (
    <div className={`counting-question theme-${theme || 'light'}`}>
      <h3>{stripEmojis(question.content)}</h3>
      {(question.visualElements || question.visual) && (
        <div className="counting-visual">
          {question.visualElements?.imageUrl ? (
            <img src={question.visualElements.imageUrl} alt={question.visualElements.description} />
          ) : question.visual?.type === 'emoji' ? (
            <div className="visual-elements" style={{ fontSize: '2rem' }}>{question.visual.content}</div>
          ) : question.visualElements?.description ? (
            <div className="visual-elements" style={{ fontSize: '2rem' }}>{question.visualElements.description}</div>
          ) : question.visual ? (
            <div className="visual-elements" style={{ fontSize: '2rem' }}>{typeof question.visual === 'string' ? question.visual : question.visual.content}</div>
          ) : null}
        </div>
      )}
      <div className="counting-answer-section">
        <div className="number-input-container">
          <input
            type="number"
            value={count}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled || hasSubmitted}
            min={0}
            className={`number-input ${showFeedback ? (validationResult?.isCorrect ? 'correct' : 'incorrect') : ''}`}
            placeholder="Enter your count"
          />
          {/* Submit button removed - parent container handles submission */}
        </div>
      </div>
      {showFeedback && validationResult && (
        <div className={`question-feedback ${validationResult.isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-message">
            <span className="feedback-icon-large">{validationResult.isCorrect ? '✓' : '✗'}</span>
            <span>{validationResult.feedback}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 12. Pattern Recognition Renderer
const PatternRecognitionRenderer: React.FC<{
  question: PatternRecognitionQuestion;
  onAnswer: (answer: any) => void;
  disabled: boolean;
  showFeedback: boolean;
  validationResult?: ValidationResult;
  theme: string;
}> = ({ question, onAnswer, disabled, showFeedback, validationResult, theme }) => {
  const [selected, setSelected] = useState<string | number | null>(null);

  const handleSelect = (option: string | number) => {
    if (disabled) return;
    setSelected(option);
    onAnswer(option);
  };

  return (
    <div className={`question-pattern-recognition ${theme}`}>
      <h3>{stripEmojis(question.content)}</h3>
      <div className="sequence">
        {question.sequence.map((item, index) => (
          <span key={index} className={`sequence-item ${index === question.missingPosition ? 'missing' : ''}`}>
            {index === question.missingPosition ? '?' : item}
          </span>
        ))}
      </div>
      <div className="options">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={`option ${selected === option ? 'selected' : ''}`}
            onClick={() => handleSelect(option)}
            disabled={disabled}
          >
            {option}
          </button>
        ))}
      </div>
      {showFeedback && validationResult && (
        <div className={`question-feedback ${validationResult.isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-message">
            <span className="feedback-icon-large">{validationResult.isCorrect ? '✓' : '✗'}</span>
            <span>{validationResult.feedback}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 13. Code Completion Renderer
const CodeCompletionRenderer: React.FC<{
  question: CodeCompletionQuestion;
  onAnswer: (answer: any) => void;
  disabled: boolean;
  showFeedback: boolean;
  validationResult?: ValidationResult;
  theme: string;
}> = ({ question, onAnswer, disabled, showFeedback, validationResult, theme }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleChange = (blankId: string, value: string) => {
    if (disabled) return;
    const newAnswers = { ...answers, [blankId]: value };
    setAnswers(newAnswers);
    onAnswer(newAnswers);
  };

  return (
    <div className={`question-code-completion ${theme}`}>
      <h3>{stripEmojis(question.content)}</h3>
      <pre className="code-template">
        <code>
          {question.codeTemplate}
        </code>
      </pre>
      <div className="code-blanks">
        {question.blanks.map(blank => (
          <div key={blank.id} className="code-blank">
            <label>Line {blank.lineNumber}:</label>
            <input
              type="text"
              value={answers[blank.id] || ''}
              onChange={(e) => handleChange(blank.id, e.target.value)}
              disabled={disabled}
              placeholder="Enter code..."
            />
          </div>
        ))}
      </div>
      {showFeedback && validationResult && (
        <div className={`question-feedback ${validationResult.isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-message">
            <span className="feedback-icon-large">{validationResult.isCorrect ? '✓' : '✗'}</span>
            <span>{validationResult.feedback}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 14. Diagram Labeling Renderer
const DiagramLabelingRenderer: React.FC<{
  question: DiagramLabelingQuestion;
  onAnswer: (answer: any) => void;
  disabled: boolean;
  showFeedback: boolean;
  validationResult?: ValidationResult;
  theme: string;
}> = ({ question, onAnswer, disabled, showFeedback, validationResult, theme }) => {
  const [labels, setLabels] = useState<Array<{ pointId: string; label: string }>>([]);

  const handleLabelChange = (pointId: string, label: string) => {
    if (disabled) return;
    const newLabels = labels.filter(l => l.pointId !== pointId);
    newLabels.push({ pointId, label });
    setLabels(newLabels);
    onAnswer(newLabels);
  };

  return (
    <div className={`question-diagram-labeling ${theme}`}>
      <h3>{stripEmojis(question.content)}</h3>
      <div className="diagram-container">
        <img src={question.diagramUrl} alt={question.diagramAlt} />
        {question.labelPoints.map(point => (
          <div
            key={point.id}
            className="label-point"
            style={{
              position: 'absolute',
              left: point.x,
              top: point.y
            }}
          >
            <input
              type="text"
              onChange={(e) => handleLabelChange(point.id, e.target.value)}
              disabled={disabled}
              placeholder="Label..."
            />
          </div>
        ))}
      </div>
      {question.labelBank && (
        <div className="label-bank">
          <h4>Available Labels:</h4>
          {question.labelBank.map((label, index) => (
            <span key={index} className="label-option">{label}</span>
          ))}
        </div>
      )}
      {showFeedback && validationResult && (
        <div className={`question-feedback ${validationResult.isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-message">
            <span className="feedback-icon-large">{validationResult.isCorrect ? '✓' : '✗'}</span>
            <span>{validationResult.feedback}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// 15. Open-Ended Renderer
const OpenEndedRenderer: React.FC<{
  question: OpenEndedQuestion | Question;
  onAnswer: (answer: any) => void;
  disabled: boolean;
  theme: string;
}> = ({ question, onAnswer, disabled, theme }) => {
  const [value, setValue] = useState<string>('');

  const handleChange = (newValue: string) => {
    if (disabled) return;
    setValue(newValue);
    onAnswer(newValue);
  };

  const openEndedQuestion = question as OpenEndedQuestion;

  return (
    <div className={`question-open-ended ${theme}`}>
      <h3>{stripEmojis(question.content)}</h3>
      {openEndedQuestion.prompt && <p>{openEndedQuestion.prompt}</p>}
      <textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        rows={6}
        placeholder="Share your thoughts..."
      />
      {openEndedQuestion.suggestedTopics && (
        <div className="suggested-topics">
          <h4>Consider discussing:</h4>
          <ul>
            {openEndedQuestion.suggestedTopics.map((topic, index) => (
              <li key={index}>{topic}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ================================================================
// SINGLETON INSTANCE
// ================================================================

class QuestionRendererService {
  private static instance: QuestionRendererService;

  private constructor() {}

  public static getInstance(): QuestionRendererService {
    if (!QuestionRendererService.instance) {
      QuestionRendererService.instance = new QuestionRendererService();
    }
    return QuestionRendererService.instance;
  }

  public renderQuestion(
    question: Question,
    onAnswer: (answer: any) => void,
    options?: Partial<QuestionRendererProps>
  ): React.ReactElement {
    // Fixed: properly handle options without requiring theme as separate parameter
    return (
      <QuestionRenderer
        question={question}
        onAnswer={onAnswer}
        {...options}
      />
    );
  }
}

export const questionRenderer = QuestionRendererService.getInstance();

// ================================================================
// EXPORT
// ================================================================

export default QuestionRenderer;