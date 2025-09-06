// ================================================================
// GRAMMAR INTERACTIVE - 7th Grade ELA Tool
// Interactive grammar and sentence structure practice
// ================================================================

import React, { useState, useEffect } from 'react';
import { Check, RotateCcw, HelpCircle, BookOpen, Edit3, AlertCircle } from 'lucide-react';

interface GrammarInteractiveProps {
  onResult?: (result: string) => void;
  clearTrigger?: boolean;
  currentQuestion?: {
    question: string;
    answer: string;
    hint?: string;
    questionType?: string;
    sentenceParts?: string[];
  };
}

interface GrammarProblem {
  type: 'identify_parts' | 'fix_grammar' | 'sentence_combine' | 'punctuation';
  question: string;
  sentence: string;
  correctAnswer: string;
  options: string[];
  hint: string;
  explanation?: string;
}

export const GrammarInteractive: React.FC<GrammarInteractiveProps> = ({
  onResult,
  clearTrigger,
  currentQuestion
}) => {
  console.log('📝 GrammarInteractive rendered with currentQuestion:', currentQuestion);
  
  const [currentProblem, setCurrentProblem] = useState<GrammarProblem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // 7th Grade Grammar concepts
  const grammarConcepts = {
    subjectPredicate: {
      sentences: [
        { text: "The ancient library contains thousands of rare manuscripts.", subject: "The ancient library", predicate: "contains thousands of rare manuscripts" },
        { text: "Several students in the class completed their projects early.", subject: "Several students in the class", predicate: "completed their projects early" },
        { text: "The mysterious package arrived yesterday afternoon.", subject: "The mysterious package", predicate: "arrived yesterday afternoon" }
      ]
    },
    sentenceTypes: {
      compound: [
        { incorrect: "I wanted to go to the party I had too much homework.", correct: "I wanted to go to the party, but I had too much homework.", rule: "Use comma + coordinating conjunction" },
        { incorrect: "She studied hard she still failed the test.", correct: "She studied hard; however, she still failed the test.", rule: "Use semicolon + transitional word" }
      ],
      complex: [
        { incorrect: "Because it was raining the game was cancelled.", correct: "Because it was raining, the game was cancelled.", rule: "Use comma after introductory clause" },
        { incorrect: "The teacher who was new to the school was very kind.", correct: "The teacher, who was new to the school, was very kind.", rule: "Use commas for non-essential clauses" }
      ]
    },
    punctuation: {
      apostrophes: [
        { incorrect: "The dogs bone was buried in the yard.", correct: "The dog's bone was buried in the yard.", rule: "Use apostrophe for possession" },
        { incorrect: "Its going to rain tomorrow.", correct: "It's going to rain tomorrow.", rule: "It's = it is, its = possessive" }
      ],
      commas: [
        { incorrect: "Yes I would like some ice cream.", correct: "Yes, I would like some ice cream.", rule: "Use comma after introductory word" },
        { incorrect: "In the morning we will leave for vacation.", correct: "In the morning, we will leave for vacation.", rule: "Use comma after introductory phrase" }
      ]
    }
  };

  // Update problem when currentQuestion changes
  useEffect(() => {
    console.log('📝 Grammar: currentQuestion useEffect triggered');
    
    if (currentQuestion) {
      console.log('📝 Grammar received external question:', currentQuestion);
      generateProblemFromQuestion(currentQuestion);
    } else {
      console.log('📝 Grammar: No external question, generating internal problem');
      generateNewProblem();
    }
  }, [currentQuestion]);

  // Generate problem from external question
  const generateProblemFromQuestion = (question: any) => {
    const problemType = question.questionType || 'fix_grammar';
    
    const problem: GrammarProblem = {
      type: problemType as any,
      question: question.question,
      sentence: question.sentence || question.question,
      correctAnswer: question.answer,
      options: question.options || generateOptions(question.answer, problemType),
      hint: question.hint || "Think about the grammar rules you've learned",
      explanation: question.explanation
    };
    
    setCurrentProblem(problem);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setAttempts(0);
    setShowHint(false);
    setShowExplanation(false);
  };

  // Generate options for multiple choice
  const generateOptions = (correctAnswer: string, problemType: string): string[] => {
    const options = [correctAnswer];
    
    // Generate wrong options based on problem type
    if (problemType === 'identify_parts') {
      const wrongOptions = [
        "Only the subject part",
        "Only the predicate part", 
        "Neither subject nor predicate",
        "The entire sentence is both"
      ];
      while (options.length < 4 && wrongOptions.length > 0) {
        const randomIndex = Math.floor(Math.random() * wrongOptions.length);
        const wrong = wrongOptions.splice(randomIndex, 1)[0];
        if (!options.includes(wrong)) {
          options.push(wrong);
        }
      }
    } else {
      // For grammar fixes, create realistic wrong variations
      const baseWrongOptions = [
        correctAnswer.replace(',', ''), // Remove comma
        correctAnswer.replace("'", ''), // Remove apostrophe  
        correctAnswer.replace(/,/g, ';'), // Replace comma with semicolon
        correctAnswer.replace(/\./g, ','), // Replace period with comma
        correctAnswer + ' also', // Add unnecessary word
        correctAnswer.replace(/\b\w+\b/, 'that') // Replace random word
      ];
      
      // Filter out duplicates and identical to correct answer
      const validWrong = baseWrongOptions.filter(option => 
        option !== correctAnswer && !options.includes(option) && option.trim() !== ''
      );
      
      // Add up to 3 wrong options
      for (let i = 0; i < Math.min(3, validWrong.length); i++) {
        options.push(validWrong[i]);
      }
      
      // If we still need more options, add generic wrong ones
      const genericWrong = [
        "The sentence is correct as written",
        "No changes needed",
        "Add a period at the end"
      ];
      
      for (const generic of genericWrong) {
        if (options.length >= 4) break;
        if (!options.includes(generic)) {
          options.push(generic);
        }
      }
    }
    
    // Ensure we have exactly 4 options
    while (options.length < 4) {
      options.push(`Option ${options.length}`);
    }
    
    return options.slice(0, 4).sort(() => Math.random() - 0.5);
  };

  // Generate a new problem
  const generateNewProblem = () => {
    const problemTypes: GrammarProblem['type'][] = ['identify_parts', 'fix_grammar', 'punctuation'];
    const problemType = problemTypes[Math.floor(Math.random() * problemTypes.length)];
    
    let problem: GrammarProblem;
    
    switch (problemType) {
      case 'identify_parts': {
        const concept = grammarConcepts.subjectPredicate.sentences[
          Math.floor(Math.random() * grammarConcepts.subjectPredicate.sentences.length)
        ];
        problem = {
          type: 'identify_parts',
          question: "Identify the complete subject in this sentence:",
          sentence: concept.text,
          correctAnswer: concept.subject,
          options: generateOptions(concept.subject, 'identify_parts'),
          hint: "The complete subject includes all words that tell who or what the sentence is about"
        };
        break;
      }
      
      case 'fix_grammar': {
        const conceptType = Math.random() < 0.5 ? 'compound' : 'complex';
        const sentences = grammarConcepts.sentenceTypes[conceptType];
        const sentence = sentences[Math.floor(Math.random() * sentences.length)];
        
        problem = {
          type: 'fix_grammar',
          question: "Fix the grammar error in this sentence:",
          sentence: sentence.incorrect,
          correctAnswer: sentence.correct,
          options: generateOptions(sentence.correct, 'fix_grammar'),
          hint: sentence.rule,
          explanation: `This is a ${conceptType} sentence. ${sentence.rule}`
        };
        break;
      }
      
      case 'punctuation': {
        const punctType = Math.random() < 0.5 ? 'apostrophes' : 'commas';
        const examples = grammarConcepts.punctuation[punctType];
        const example = examples[Math.floor(Math.random() * examples.length)];
        
        problem = {
          type: 'punctuation',
          question: "Choose the correctly punctuated version:",
          sentence: example.incorrect,
          correctAnswer: example.correct,
          options: generateOptions(example.correct, 'punctuation'),
          hint: example.rule,
          explanation: `Punctuation rule: ${example.rule}`
        };
        break;
      }
      
      default:
        problem = {
          type: 'fix_grammar',
          question: "Fix the grammar error",
          sentence: "The students homework was late.",
          correctAnswer: "The student's homework was late.",
          options: ["The student's homework was late.", "The students homework was late.", "The students' homework was late.", "The student homework was late."],
          hint: "Use an apostrophe to show possession"
        };
    }
    
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
      console.log('🎯 Grammar: Correct answer! Calling onResult with:', answer);
      setShowExplanation(true);
      if (onResult) {
        onResult(answer);
      }
    } else {
      console.log('❌ Grammar: Wrong answer. Expected:', currentProblem?.correctAnswer, 'Got:', answer);
      if (attempts >= 1) {
        setShowHint(true);
      }
    }
  };

  // Reset when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      generateNewProblem();
      console.log('📝 Grammar Interactive cleared');
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
    <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 flex flex-col max-h-[400px]">
      {/* Header */}
      <div className="text-center mb-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
          📝 Grammar & Sentence Structure
        </h2>
        {currentProblem && (
          <p className="text-base text-gray-600 dark:text-gray-300">
            {currentProblem.question}
          </p>
        )}
      </div>

      {/* Sentence Display */}
      {currentProblem && (
        <div className="mb-4 p-4 bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-600 rounded-lg">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 dark:text-white leading-relaxed">
              "{currentProblem.sentence}"
            </p>
            {currentProblem.type === 'identify_parts' && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Read the sentence above and select your answer below.
              </p>
            )}
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
                  : 'bg-indigo-500 text-white border-indigo-600'
                : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-indigo-300 dark:border-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-800'
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
          className="bg-indigo-500 hover:bg-indigo-600 text-white flex items-center space-x-1"
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