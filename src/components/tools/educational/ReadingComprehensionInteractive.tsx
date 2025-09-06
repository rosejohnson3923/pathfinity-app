// ================================================================
// READING COMPREHENSION INTERACTIVE - 7th Grade ELA Tool
// Interactive reading comprehension and main idea practice
// ================================================================

import React, { useState, useEffect } from 'react';
import { Check, RotateCcw, HelpCircle, BookOpen, Eye } from 'lucide-react';

interface ReadingComprehensionInteractiveProps {
  onResult?: (result: string) => void;
  clearTrigger?: boolean;
  currentQuestion?: {
    question: string;
    answer: string;
    hint?: string;
    passage?: string;
    options?: string[];
    questionType?: string;
  };
}

interface ReadingProblem {
  type: 'main_idea' | 'supporting_details' | 'inference' | 'vocabulary';
  question: string;
  passage: string;
  correctAnswer: string;
  options: string[];
  hint: string;
  explanation?: string;
}

export const ReadingComprehensionInteractive: React.FC<ReadingComprehensionInteractiveProps> = ({
  onResult,
  clearTrigger,
  currentQuestion
}) => {
  console.log('📖 ReadingComprehensionInteractive rendered with currentQuestion:', currentQuestion);
  
  const [currentProblem, setCurrentProblem] = useState<ReadingProblem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Reading comprehension content for 7th grade
  const readingContent = {
    passages: [
      {
        text: "Scientists have discovered that dolphins use a complex system of clicks and whistles to communicate with each other. These sounds can travel long distances underwater and help dolphins coordinate hunting, warn of danger, and maintain social bonds within their pods. Researchers believe this communication system is one of the most sophisticated in the animal kingdom.",
        mainIdea: "Dolphins use sounds to communicate for various purposes",
        supporting: ["Dolphins use clicks and whistles", "Sounds help coordinate hunting", "Communication warns of danger"],
        wrongOptions: ["Dolphins are the smartest marine animals", "Scientists study underwater animals", "Dolphins live in groups called pods"]
      },
      {
        text: "The invention of the printing press in the 15th century revolutionized how information spread throughout Europe. Books became cheaper to produce, leading to increased literacy rates and the rapid spread of new ideas during the Renaissance period. This technological advancement changed society forever by making knowledge accessible to common people.",
        mainIdea: "The printing press changed how information spread in Europe",
        supporting: ["Books became cheaper to produce", "Literacy rates increased", "Ideas spread more rapidly"],
        wrongOptions: ["Books were expensive before the printing press", "The Renaissance happened in the 15th century", "Literacy rates were low in medieval times"]
      },
      {
        text: "Climate change is causing arctic ice to melt at an alarming rate. This affects polar bears, who depend on sea ice for hunting seals. As their habitat shrinks, polar bears must travel farther to find food, leading to malnutrition and declining populations. Conservation efforts are now focusing on protecting remaining ice habitats.",
        mainIdea: "Climate change threatens polar bears by destroying their habitat",
        supporting: ["Arctic ice is melting rapidly", "Polar bears depend on sea ice", "Bears must travel farther for food"],
        wrongOptions: ["Polar bears eat seals", "Arctic ice is melting quickly", "Conservation efforts are important"]
      }
    ]
  };

  // Update problem when currentQuestion changes
  useEffect(() => {
    console.log('📖 Reading: currentQuestion useEffect triggered');
    
    if (currentQuestion) {
      console.log('📖 Reading received external question:', currentQuestion);
      generateProblemFromQuestion(currentQuestion);
    } else {
      console.log('📖 Reading: No external question, generating internal problem');
      generateNewProblem();
    }
  }, [currentQuestion]);

  // Generate problem from external question
  const generateProblemFromQuestion = (question: any) => {
    const problem: ReadingProblem = {
      type: question.questionType || 'main_idea',
      question: question.question,
      passage: question.passage || question.sentence || "",
      correctAnswer: question.answer,
      options: question.options || generateOptions(question.answer),
      hint: question.hint || "Look for the most important idea that the passage is trying to communicate",
      explanation: `The main idea is: ${question.answer}`
    };
    
    setCurrentProblem(problem);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setAttempts(0);
    setShowHint(false);
    setShowExplanation(false);
  };

  // Generate options if not provided
  const generateOptions = (correctAnswer: string): string[] => {
    const defaultWrongOptions = [
      "A specific detail from the passage",
      "An example used to support the main point",
      "A conclusion not supported by the text",
      "Background information about the topic"
    ];
    
    return [correctAnswer, ...defaultWrongOptions.slice(0, 3)].sort(() => Math.random() - 0.5);
  };

  // Generate a new problem
  const generateNewProblem = () => {
    const passage = readingContent.passages[Math.floor(Math.random() * readingContent.passages.length)];
    
    const problem: ReadingProblem = {
      type: 'main_idea',
      question: "What is the main idea of this passage?",
      passage: passage.text,
      correctAnswer: passage.mainIdea,
      options: [passage.mainIdea, ...passage.wrongOptions].sort(() => Math.random() - 0.5),
      hint: "The main idea is the most important point the author is making",
      explanation: `The main idea summarizes what the entire passage is about: ${passage.mainIdea}`
    };
    
    setCurrentProblem(problem);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setAttempts(0);
    setShowHint(false);
    setShowExplanation(false);
  };

  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    if (isCorrect === true) return;
    
    setSelectedAnswer(answer);
    setAttempts(prev => prev + 1);
    
    const correct = answer === currentProblem?.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      console.log('🎯 Reading: Correct answer! Calling onResult with:', answer);
      setShowExplanation(true);
      if (onResult) {
        onResult(answer);
      }
    } else {
      console.log('❌ Reading: Wrong answer. Expected:', currentProblem?.correctAnswer, 'Got:', answer);
      if (attempts >= 1) {
        setShowHint(true);
      }
    }
  };

  // Reset when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      generateNewProblem();
      console.log('📖 Reading Comprehension Interactive cleared');
    }
  }, [clearTrigger]);

  const Button: React.FC<{ onClick: () => void; className?: string; children: React.ReactNode; disabled?: boolean }> = ({
    onClick,
    className = '',
    children,
    disabled = false
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1 rounded-lg font-medium transition-colors text-sm ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 flex flex-col max-h-[400px]">
      {/* Header */}
      <div className="text-center mb-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
          📖 Reading Comprehension
        </h2>
        {currentProblem && (
          <p className="text-xs text-gray-600 dark:text-gray-300">
            {currentProblem.question}
          </p>
        )}
      </div>

      {/* Passage Display */}
      {currentProblem && (
        <div className="mb-4 p-4 bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-600 rounded-lg max-h-32 overflow-y-auto">
          <div className="text-left">
            <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
              {currentProblem.passage}
            </p>
          </div>
        </div>
      )}

      {/* Answer Options */}
      <div className="flex flex-col space-y-2 mb-3">
        {currentProblem?.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 border-2 text-left ${
              selectedAnswer === option
                ? isCorrect === true
                  ? 'bg-green-500 text-white border-green-600'
                  : isCorrect === false
                  ? 'bg-red-500 text-white border-red-600'
                  : 'bg-blue-500 text-white border-blue-600'
                : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-blue-300 dark:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800'
            }`}
            disabled={isCorrect === true}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Hint */}
      {showHint && (
        <div className="mb-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            💡 Hint: {currentProblem?.hint}
          </p>
        </div>
      )}

      {/* Explanation */}
      {showExplanation && currentProblem?.explanation && (
        <div className="mb-2 p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✅ {currentProblem.explanation}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-2 mt-auto">
        <Button
          onClick={generateNewProblem}
          className="bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>New</span>
        </Button>
        
        <Button
          onClick={() => setShowHint(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center space-x-1"
          disabled={isCorrect === true || showHint}
        >
          <HelpCircle className="w-3 h-3" />
          <span>Hint</span>
        </Button>

        <Button
          onClick={() => setShowExplanation(true)}
          className="bg-green-500 hover:bg-green-600 text-white flex items-center space-x-1"
          disabled={!isCorrect || showExplanation}
        >
          <BookOpen className="w-3 h-3" />
          <span>Explain</span>
        </Button>
      </div>
    </div>
  );
};