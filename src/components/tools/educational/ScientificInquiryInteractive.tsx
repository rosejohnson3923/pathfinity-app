// ================================================================
// SCIENTIFIC INQUIRY INTERACTIVE - 7th Grade Science Tool (A.1)
// Interactive tool for understanding the process of scientific inquiry
// Assignment: The process of scientific inquiry
// ================================================================

import React, { useState, useEffect } from 'react';
import { Beaker, Microscope, RotateCcw, HelpCircle, BookOpen, FlaskConical } from 'lucide-react';

interface ScientificInquiryInteractiveProps {
  onResult?: (result: string) => void;
  clearTrigger?: boolean;
  currentQuestion?: {
    question: string;
    answer: string;
    hint?: string;
    questionType?: string;
    scenario?: string;
  };
}

interface ScientificInquiryProblem {
  scenario: string;
  question: string;
  correctAnswer: string;
  options: string[];
  hint: string;
  explanation: string;
  inquiryStep: 'observation' | 'question' | 'hypothesis' | 'experiment' | 'analysis' | 'conclusion';
}

export const ScientificInquiryInteractive: React.FC<ScientificInquiryInteractiveProps> = ({
  onResult,
  clearTrigger,
  currentQuestion
}) => {
  console.log('🔬 ScientificInquiryInteractive rendered with currentQuestion:', currentQuestion);
  
  const [currentProblem, setCurrentProblem] = useState<ScientificInquiryProblem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // 7th Grade Scientific Inquiry scenarios - understanding the scientific method
  const scenarios = [
    {
      scenario: "A student notices that plants near the window in her classroom are taller than plants on the bookshelf across the room. She wonders if sunlight affects plant growth.",
      inquiryStep: 'observation' as const,
      question: "What step of the scientific method is the student demonstrating?",
      correctAnswer: "Making an observation",
      options: [
        "Making an observation",
        "Forming a hypothesis",
        "Conducting an experiment"
      ],
      hint: "Think about what the student is doing when she notices something interesting.",
      explanation: "The student is making an observation - the first step in scientific inquiry where you notice something in the natural world that sparks curiosity."
    },
    {
      scenario: "After observing that window plants are taller, the student asks: 'Does the amount of sunlight affect how tall plants grow?'",
      inquiryStep: 'question' as const,
      question: "What scientific inquiry step is this?",
      correctAnswer: "Asking a scientific question",
      options: [
        "Asking a scientific question",
        "Making a prediction",
        "Drawing a conclusion"
      ],
      hint: "Consider what happens after you observe something interesting.",
      explanation: "After making an observation, scientists ask a testable question. This question can be investigated through experimentation."
    },
    {
      scenario: "The student predicts: 'If plants receive more sunlight, then they will grow taller because sunlight provides energy for growth.'",
      inquiryStep: 'hypothesis' as const,
      question: "What part of the scientific method is this statement?",
      correctAnswer: "Forming a hypothesis",
      options: [
        "Forming a hypothesis",
        "Stating a conclusion",
        "Recording data"
      ],
      hint: "Look for an 'if-then' statement that makes a testable prediction.",
      explanation: "A hypothesis is a testable prediction that includes both a prediction (if-then) and a reason (because). It's based on observations and prior knowledge."
    },
    {
      scenario: "To test her hypothesis, the student places 10 identical plants in different locations: 5 by the window (6 hours of sunlight) and 5 in a dark closet (0 hours of sunlight). She waters them equally and measures their height every week for a month.",
      inquiryStep: 'experiment' as const,
      question: "What makes this a good scientific experiment?",
      correctAnswer: "It has controlled variables and one variable being tested",
      options: [
        "It has controlled variables and one variable being tested",
        "It uses expensive equipment to measure results",
        "It takes a very long time to complete"
      ],
      hint: "Think about what makes an experiment fair and reliable.",
      explanation: "A good experiment controls all variables except one (the independent variable - sunlight). This ensures that any differences in results are due to the variable being tested."
    },
    {
      scenario: "After 4 weeks, the student records: Window plants averaged 15 cm tall, while closet plants averaged 3 cm tall. She creates a bar graph showing the difference.",
      inquiryStep: 'analysis' as const,
      question: "What is the student doing with her experimental results?",
      correctAnswer: "Analyzing and organizing data",
      options: [
        "Analyzing and organizing data",
        "Forming a new hypothesis",
        "Starting a new experiment"
      ],
      hint: "Consider what scientists do with the numbers and measurements they collect.",
      explanation: "Data analysis involves organizing results (like making graphs) and looking for patterns. This helps scientists understand what their results mean."
    },
    {
      scenario: "Based on her results, the student states: 'Plants that received 6 hours of sunlight daily grew 5 times taller than plants kept in darkness. This supports my hypothesis that sunlight affects plant growth.'",
      inquiryStep: 'conclusion' as const,
      question: "What step of scientific inquiry is this?",
      correctAnswer: "Drawing a conclusion",
      options: [
        "Drawing a conclusion",
        "Making an observation",
        "Asking a question"
      ],
      hint: "Think about what happens after you analyze your experimental data.",
      explanation: "A conclusion summarizes what was learned from the experiment and states whether the hypothesis was supported by the evidence."
    },
    {
      scenario: "A scientist studying bird behavior notices that robins always build nests 10-15 feet above ground. Before forming a hypothesis about why, what should she do?",
      inquiryStep: 'observation' as const,
      question: "What should the scientist do before forming a hypothesis?",
      correctAnswer: "Research existing knowledge about robin nesting behavior",
      options: [
        "Research existing knowledge about robin nesting behavior",
        "Immediately start experimenting with different nest heights",
        "Assume robins are afraid of ground predators"
      ],
      hint: "Good scientists build on what's already known before starting new research.",
      explanation: "Before forming a hypothesis, scientists research existing knowledge. This helps them ask better questions and design more effective experiments."
    },
    {
      scenario: "A student wants to know if music helps people concentrate. She designs an experiment where Group A studies in silence and Group B studies with classical music. What is the independent variable?",
      inquiryStep: 'experiment' as const,
      question: "What is the independent variable in this experiment?",
      correctAnswer: "The presence or absence of music",
      options: [
        "The presence or absence of music",
        "How well students concentrate",
        "The type of students in each group"
      ],
      hint: "The independent variable is what the experimenter changes or controls.",
      explanation: "The independent variable is what you change in an experiment (music vs. no music). The dependent variable is what you measure (concentration level)."
    }
  ];

  // Update problem when currentQuestion changes
  useEffect(() => {
    console.log('🔬 Scientific Inquiry: currentQuestion useEffect triggered');
    
    if (currentQuestion) {
      console.log('🔬 Scientific Inquiry received external question:', currentQuestion);
      generateProblemFromQuestion(currentQuestion);
    } else {
      console.log('🔬 Scientific Inquiry: No external question, generating internal problem');
      generateNewProblem();
    }
  }, [currentQuestion]);

  // Generate problem from external question
  const generateProblemFromQuestion = (question: any) => {
    console.log('🔬 Scientific Inquiry: Processing external question data:', question);
    
    // Use external question data directly (synchronized with Practice Questions)
    const problem: ScientificInquiryProblem = {
      scenario: question.scenario || 'Scientific scenario from Practice Questions',
      question: question.question || 'Question from Practice Questions',
      correctAnswer: question.answer || question.correctAnswer || 'Unknown',
      options: question.options || ['Option A', 'Option B', 'Option C'],
      hint: question.hint || 'Think about the scientific method steps',
      explanation: question.explanation || 'This helps understand scientific inquiry concepts',
      inquiryStep: 'observation' // Default inquiry step type
    };
    
    console.log('🔬 Scientific Inquiry: Generated problem from external data:', problem);
    
    setCurrentProblem(problem);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setAttempts(0);
    setShowHint(false);
    setShowExplanation(false);
  };

  // Generate a new problem
  const generateNewProblem = () => {
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    const problem: ScientificInquiryProblem = {
      scenario: randomScenario.scenario,
      question: randomScenario.question,
      correctAnswer: randomScenario.correctAnswer,
      options: randomScenario.options,
      hint: randomScenario.hint,
      explanation: randomScenario.explanation,
      inquiryStep: randomScenario.inquiryStep
    };
    
    setCurrentProblem(problem);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setAttempts(0);
    setShowHint(false);
    setShowExplanation(false);
  };

  // Handle answer selection
  const handleAnswerSelect = (selectedLetter: string) => {
    if (isCorrect === true) return;
    
    setSelectedAnswer(selectedLetter);
    setAttempts(prev => prev + 1);
    
    // Find the correct letter by finding the index of the correct answer in options
    const correctOptionIndex = currentProblem?.options.findIndex(option => option === currentProblem?.correctAnswer);
    const correctLetter = correctOptionIndex !== -1 ? String.fromCharCode(65 + correctOptionIndex) : 'A';
    
    const correct = selectedLetter === correctLetter;
    setIsCorrect(correct);
    
    if (correct) {
      console.log('🔬 Scientific Inquiry: Correct answer! Calling onResult with letter:', selectedLetter);
      setShowExplanation(true);
      if (onResult) {
        onResult(selectedLetter);
      }
    } else {
      console.log('❌ Scientific Inquiry: Wrong answer. Expected letter:', correctLetter, 'Got letter:', selectedLetter);
      if (attempts >= 1) {
        setShowHint(true);
      }
    }
  };

  // Reset when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      console.log('🔬 Scientific Inquiry Interactive cleared');
      // If we have an external question, use it; otherwise generate a new one
      if (currentQuestion) {
        generateProblemFromQuestion(currentQuestion);
      } else {
        generateNewProblem();
      }
    }
  }, [clearTrigger, currentQuestion]);

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

  // Get step icon based on inquiry step
  const getStepIcon = () => {
    switch (currentProblem?.inquiryStep) {
      case 'observation': return <Microscope className="w-5 h-5 text-green-600" />;
      case 'question': return <HelpCircle className="w-5 h-5 text-blue-600" />;
      case 'hypothesis': return <FlaskConical className="w-5 h-5 text-purple-600" />;
      case 'experiment': return <Beaker className="w-5 h-5 text-orange-600" />;
      case 'analysis': return <BookOpen className="w-5 h-5 text-indigo-600" />;
      case 'conclusion': return <Microscope className="w-5 h-5 text-teal-600" />;
      default: return <Beaker className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-2 flex flex-col max-h-[500px]">
      {/* Header */}
      <div className="text-center mb-1">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1 flex items-center justify-center gap-2">
          {getStepIcon()}
          Scientific Inquiry Process (A.1)
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Understanding the steps of scientific investigation
        </p>
      </div>

      {/* Question Display */}
      {currentProblem && (
        <div className="mb-2">
          <div className="flex items-center gap-1 mb-1">
            <HelpCircle className="w-3 h-3 text-blue-600" />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {currentProblem.question}
            </span>
          </div>
        </div>
      )}

      {/* Answer Options - 2x2 Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {currentProblem?.options.map((option, index) => {
          const letter = String.fromCharCode(65 + index); // A, B, C
          return (
            <button
              key={index}
              onClick={() => handleAnswerSelect(letter)}
              className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 border-2 text-left ${ 
                selectedAnswer === letter
                  ? isCorrect === true
                    ? 'bg-green-500 text-white border-green-600'
                    : isCorrect === false
                    ? 'bg-red-500 text-white border-red-600'
                    : 'bg-blue-500 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-green-300 dark:border-green-600 hover:bg-green-100 dark:hover:bg-green-800'
              }`}
              disabled={isCorrect === true}
            >
              <span className="font-bold text-green-600 dark:text-green-400 mr-2">{letter}.</span>
              {option}
            </button>
          );
        })}
      </div>

      {/* Hint */}
      {showHint && (
        <div className="mb-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg max-h-20 overflow-y-auto">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            💡 Hint: {currentProblem?.hint}
          </p>
        </div>
      )}

      {/* Explanation */}
      {showExplanation && currentProblem?.explanation && (
        <div className="mb-2 p-2 bg-green-100 dark:bg-green-900/30 rounded-lg max-h-20 overflow-y-auto">
          <p className="text-xs text-green-800 dark:text-green-200">
            ✅ {currentProblem.explanation}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-2 mt-auto">
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
          className="bg-purple-500 hover:bg-purple-600 text-white flex items-center space-x-1"
          disabled={!isCorrect || showExplanation}
        >
          <BookOpen className="w-3 h-3" />
          <span>Explain</span>
        </Button>
      </div>
    </div>
  );
};