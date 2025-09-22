/**
 * QUESTION RENDERER - TYPE-SAFE RENDERING FOR ALL 15 QUESTION TYPES
 * 
 * Comprehensive renderer that uses type guards to render all question types
 * with proper TypeScript type safety and validation integration
 */

import React, { useState, useEffect, useRef } from 'react';
import questionStyles from '../../components/questions/QuestionStyles.module.css';
import styles from './QuestionRenderer.module.css';
import layoutStyles from '../../design-system/layouts/IntelligentQuestionLayout.module.css';
import { azureAudioService } from '../AzureAudioService';
import { Volume2 } from 'lucide-react';
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
  gradeLevel?: string;
  companionId?: string;
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
  companionName,
  gradeLevel,
  companionId = 'finn'
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
        gradeLevel={gradeLevel}
        companionId={companionId}
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
        gradeLevel={gradeLevel}
        companionId={companionId}
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
  gradeLevel?: string;
  companionId?: string;
}> = ({ question, onAnswer, disabled, showFeedback, validationResult, theme, gradeLevel, companionId = 'finn' }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const audioPlayedRef = useRef(false);
  const isKindergarten = gradeLevel?.toLowerCase() === 'k' || gradeLevel?.toLowerCase() === 'kindergarten';

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
    correctOption: question.options?.find(o => o.isCorrect)?.text,
    gradeLevel,
    isKindergarten
  });

  // Auto-narrate question for kindergarten students
  useEffect(() => {
    if (isKindergarten && question.content && !audioPlayedRef.current) {
      audioPlayedRef.current = true;

      // Build the narration text
      let narrationText = stripEmojis(question.content);

      // Add a pause, then read the options
      if (question.options && question.options.length > 0) {
        narrationText += " ... Your choices are: ";
        question.options.forEach((option, index) => {
          const letter = String.fromCharCode(65 + index); // A, B, C, D
          narrationText += `${letter}: ${stripEmojis(option.text)}. `;
        });
      }

      console.log('🔊 Auto-narrating kindergarten question:', narrationText);
      azureAudioService.playText(narrationText, companionId, {
        scriptId: 'question.multiple_choice',
        variables: {
          questionText: stripEmojis(question.content),
          options: question.options.map((opt, idx) =>
            `${String.fromCharCode(65 + idx)}: ${stripEmojis(opt.text)}`).join(', ')
        },
        emotion: 'friendly',
        style: 'cheerful'
      });
    }
  }, [isKindergarten, question.content, question.options, companionId]);

  const handleReplayAudio = () => {
    if (!question.content) return;

    let narrationText = stripEmojis(question.content);
    if (question.options && question.options.length > 0) {
      narrationText += " ... Your choices are: ";
      question.options.forEach((option, index) => {
        const letter = String.fromCharCode(65 + index);
        narrationText += `${letter}: ${stripEmojis(option.text)}. `;
      });
    }

    azureAudioService.playText(narrationText, companionId, {
      scriptId: 'question.replay',
      variables: {
        questionText: narrationText
      },
      emotion: 'friendly',
      style: 'cheerful'
    });
  };

  const handleOptionHover = (optionText: string, optionIndex: number) => {
    if (!isKindergarten) return;

    const letter = String.fromCharCode(65 + optionIndex);
    const hoverText = `Option ${letter}: ${stripEmojis(optionText)}`;

    azureAudioService.playText(hoverText, companionId, {
      scriptId: 'question.option_hover',
      variables: {
        letter: letter,
        optionText: stripEmojis(optionText)
      },
      emotion: 'friendly',
      style: 'cheerful',
      volume: 0.7
    });
  };

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

  // Intelligent layout detection with comprehensive content analysis
  const analyzeLayout = () => {
    if (!question.options || question.options.length === 0) return { type: 'vertical', contentType: 'text' };

    // Analyze answer options
    const optionTexts = question.options.map(opt => opt.text);
    const optionLengths = optionTexts.map(text => text.length);
    const longestOption = Math.max(...optionLengths);
    const shortestOption = Math.min(...optionLengths);
    const avgOptionLength = optionLengths.reduce((a, b) => a + b, 0) / optionLengths.length;

    // Word counts for each option
    const optionWordCounts = optionTexts.map(text => text.trim().split(/\s+/).filter(w => w.length > 0).length);
    const maxWords = Math.max(...optionWordCounts);

    // Content type detection
    const hasArrays = optionTexts.some(text => /^\[.*\]$/.test(text));
    const allNumeric = optionTexts.every(text => /^-?\d+(\.\d+)?$/.test(text.trim()));
    const hasEmojis = optionTexts.some(text => /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u.test(text));
    const hasSentences = maxWords > 3;

    // Determine content type
    let contentType = 'mixed';
    if (allNumeric) contentType = 'numeric';
    else if (hasEmojis && avgOptionLength <= 5) contentType = 'emoji';
    else if (hasArrays) contentType = 'array';
    else if (avgOptionLength > 20) contentType = 'longText';
    else contentType = 'text';

    // LAYOUT DECISION RULES
    // Rule 1: Arrays always vertical
    if (hasArrays) {
      console.log('📐 Layout: VERTICAL - Arrays need horizontal space');
      return { type: 'vertical', contentType: 'array' };
    }

    // Rule 2: Sentences or phrases (>3 words) vertical
    if (hasSentences) {
      console.log('📐 Layout: VERTICAL - Sentences/phrases need reading space');
      return { type: 'vertical', contentType: 'longText' };
    }

    // Rule 3: Very short numeric (<=3 chars) - grid
    if (allNumeric && longestOption <= 3) {
      const cols = Math.min(4, question.options.length);
      console.log(`📐 Layout: GRID-${cols} - Very short numbers`);
      return { type: `grid-${cols}`, contentType: 'numeric' };
    }

    // Rule 4: Long text (>20 chars avg) - vertical
    if (avgOptionLength > 20) {
      console.log('📐 Layout: VERTICAL - Long text needs width');
      return { type: 'vertical', contentType: 'longText' };
    }

    // Rule 5: High variance - vertical for consistency
    if (longestOption - shortestOption > 15) {
      console.log('📐 Layout: VERTICAL - Varied lengths need consistency');
      return { type: 'vertical', contentType };
    }

    // Rule 6: Short text (5-10 chars) - grid
    if (avgOptionLength <= 10) {
      const cols = question.options.length <= 2 ? 2 : Math.min(4, question.options.length);
      console.log(`📐 Layout: GRID-${cols} - Short text`);
      return { type: `grid-${cols}`, contentType };
    }

    // Default: Vertical for readability
    console.log('📐 Layout: VERTICAL - Default for readability');
    return { type: 'vertical', contentType };
  };

  const layoutAnalysis = analyzeLayout();
  const layoutType = layoutAnalysis.type;
  const contentType = layoutAnalysis.contentType;

  // Determine CSS classes based on layout analysis
  const getLayoutClasses = () => {
    const baseClass = layoutStyles.questionContainer;
    let layoutClass = layoutStyles.layoutVertical;
    let contentClass = '';

    // Layout type classes
    if (layoutType === 'vertical') {
      layoutClass = layoutStyles.layoutVertical;
    } else if (layoutType === 'wrapped-grid') {
      layoutClass = layoutStyles.layoutWrappedGrid;
    } else if (layoutType.startsWith('grid-')) {
      const cols = layoutType.split('-')[1];
      layoutClass = `${layoutStyles.layoutGrid} ${layoutStyles[`layoutGrid${cols}`] || ''}`;
    }

    // Content type classes
    switch(contentType) {
      case 'numeric': contentClass = layoutStyles.contentNumeric; break;
      case 'emoji': contentClass = layoutStyles.contentEmoji; break;
      case 'array': contentClass = layoutStyles.contentArray; break;
      case 'longText': contentClass = layoutStyles.contentLongText; break;
    }

    return `${baseClass} ${layoutClass} ${contentClass}`.trim();
  };

  const layoutClasses = getLayoutClasses();

  // Enhanced debug logging for layout decisions
  console.log('🎨 ============ INTELLIGENT LAYOUT ANALYSIS ============');
  console.log('📊 Question:', question.content?.substring(0, 50) + '...');
  console.log('📝 Options Analysis:', {
    count: question.options?.length,
    texts: question.options?.map((o, i) => `[${i}] "${o.text}" (${o.text.length} chars)`),
    lengths: optionLengths,
    avgLength: avgOptionLength.toFixed(1),
    longestOption,
    shortestOption,
    variance: longestOption - shortestOption,
    maxWords,
    wordCounts: optionWordCounts
  });
  console.log('🔍 Content Detection:', {
    hasArrays,
    allNumeric,
    hasEmojis,
    hasSentences: maxWords > 3,
    contentType
  });
  console.log('🎯 Layout Decision:', {
    layoutType,
    reasoning: layoutType === 'vertical' ?
      'VERTICAL - Text needs full width for readability' :
      layoutType.startsWith('grid-') ?
      `GRID (${layoutType.split('-')[1]} cols) - Short content fits in grid` :
      'WRAPPED - Medium content with flexible layout',
    cssClasses: layoutClasses.split(' ').filter(c => c)
  });
  console.log('🎨 ====================================================');

  return (
    <div className={`multiple-choice-question theme-${theme || 'light'}`}>
      {/* Reading Passage Section - Display before the question */}
      {question.passage && (
        <div className={`${layoutStyles.readingPassage} ${layoutStyles.passageContainer}`}>
          <div className={layoutStyles.passageHeader}>
            <span className={layoutStyles.passageLabel}>📖 Reading Passage</span>
          </div>
          <div className={layoutStyles.passageText}>
            {question.passage}
          </div>
        </div>
      )}
      <div className="question-text" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {question.content ? (
          <>
            <h3 style={{ flex: 1 }}>{stripEmojis(question.content)}</h3>
            {isKindergarten && (
              <button
                onClick={handleReplayAudio}
                className="audio-replay-button"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                aria-label="Replay question"
                title="Click to hear the question again"
              >
                <Volume2 size={24} color="white" />
              </button>
            )}
          </>
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
      <div className={layoutClasses}>
        {question.options.map(option => {
          const optionClasses = [
            layoutStyles.optionButton,
            selected.includes(option.id) ? layoutStyles.selected : '',
            showFeedback && option.isCorrect ? layoutStyles.correct : '',
            showFeedback && selected.includes(option.id) && !option.isCorrect ? layoutStyles.incorrect : '',
            disabled ? layoutStyles.disabled : ''
          ].filter(Boolean).join(' ');

          return (
          <button
            key={option.id}
            className={optionClasses}
            onClick={() => handleSelect(option.id)}
            onMouseEnter={() => handleOptionHover(option.text, question.options.indexOf(option))}
            disabled={disabled}
          >
            <span className={layoutStyles.optionLabel}>
              {String.fromCharCode(65 + question.options.indexOf(option))}
            </span>
            <span className={layoutStyles.optionText}>
              {option.text}
            </span>
          </button>
          );
        })}
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
  gradeLevel?: string;
  companionId?: string;
}> = ({ question, onAnswer, disabled, showFeedback, validationResult, theme, gradeLevel, companionId = 'finn' }) => {
  const [selected, setSelected] = useState<boolean | null>(null);
  const audioPlayedRef = useRef(false);
  const isKindergarten = gradeLevel?.toLowerCase() === 'k' || gradeLevel?.toLowerCase() === 'kindergarten';

  // Auto-narrate question for kindergarten students
  useEffect(() => {
    if (isKindergarten && question.content && !audioPlayedRef.current) {
      audioPlayedRef.current = true;

      const narrationText = `${stripEmojis(question.content)} ... Is this true or false?`;

      console.log('🔊 Auto-narrating kindergarten true/false question:', narrationText);
      azureAudioService.playText(narrationText, companionId, {
        scriptId: 'question.true_false',
        variables: {
          questionText: stripEmojis(question.content)
        },
        emotion: 'friendly',
        style: 'cheerful'
      });
    }
  }, [isKindergarten, question.content, companionId]);

  const handleReplayAudio = () => {
    if (!question.content) return;
    const narrationText = `${stripEmojis(question.content)} ... Is this true or false?`;
    azureAudioService.playText(narrationText, companionId, {
      scriptId: 'question.replay',
      variables: {
        questionText: narrationText
      },
      emotion: 'friendly',
      style: 'cheerful'
    });
  };

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
    correctAnswer: question.correctAnswer,
    gradeLevel,
    isKindergarten
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