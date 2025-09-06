// ================================================================
// LETTER IDENTIFICATION INTERACTIVE - A.1 ELA Tool
// Interactive letter identification for uppercase alphabet recognition (PreK-2)
// ================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Check, RotateCcw, HelpCircle, Volume2 } from 'lucide-react';

interface LetterIdentificationInteractiveProps {
  onResult?: (result: string) => void;
  clearTrigger?: boolean;
  showCase?: 'uppercase' | 'lowercase' | 'both';
  currentQuestion?: {
    question: string;
    answer: string;
    hint?: string;
    targetLetter?: string;
    questionType?: string;
  };
}

interface Problem {
  type: 'identify_letter' | 'find_letter' | 'match_letter' | 'consonant_vowel_sort';
  question: string;
  correctAnswer: string;
  targetLetter: string;
  options: string[];
  letterType?: 'vowel' | 'consonant';
}

export const LetterIdentificationInteractive: React.FC<LetterIdentificationInteractiveProps> = ({
  onResult,
  clearTrigger,
  showCase = 'uppercase',
  currentQuestion
}) => {
  console.log('🔤 LetterIdentificationInteractive rendered with currentQuestion:', currentQuestion);
  
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Alphabet arrays
  const uppercaseAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const lowercaseAlphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  
  const getAlphabet = () => {
    switch (showCase) {
      case 'lowercase': return lowercaseAlphabet;
      case 'both': return [...uppercaseAlphabet, ...lowercaseAlphabet];
      default: return uppercaseAlphabet;
    }
  };

  // Update problem when currentQuestion changes
  useEffect(() => {
    console.log('🔤 Letter Identification: currentQuestion useEffect triggered, currentQuestion:', currentQuestion);
    
    try {
      if (currentQuestion) {
        console.log('🔤 Letter Identification received new question:', currentQuestion);
        const questionType = currentQuestion.questionType || 'letter_identification';
        let mappedType: Problem['type'];
        
        if (questionType === 'consonant_vowel_sort') {
          mappedType = 'consonant_vowel_sort';
        } else if (questionType === 'letter_find') {
          mappedType = 'find_letter';
        } else {
          mappedType = 'identify_letter';
        }
        
        const externalProblem: Problem = {
          type: mappedType,
          question: currentQuestion.question,
          correctAnswer: questionType === 'consonant_vowel_sort' ? currentQuestion.answer : currentQuestion.answer.toUpperCase(),
          targetLetter: currentQuestion.targetLetter?.toUpperCase() || currentQuestion.answer.toUpperCase(),
          options: questionType === 'consonant_vowel_sort' ? 
            (currentQuestion as any).options || ['vowel', 'consonant'] : 
            generateOptions(currentQuestion.answer.toUpperCase()),
          letterType: questionType === 'consonant_vowel_sort' ? (currentQuestion as any).letterType : undefined
        };
        console.log('🔤 Letter Identification: Mapped question type', questionType, '→', mappedType);
        console.log('🔤 Letter Identification: Setting external problem:', externalProblem);
        setCurrentProblem(externalProblem);
        setSelectedLetter(null);
        setIsCorrect(null);
        setAttempts(0);
        setShowHint(false);
        console.log('🔤 Letter Identification: External problem set successfully');
      } else {
        console.log('🔤 Letter Identification: No external question provided, generating internal problem');
        generateNewProblem();
      }
    } catch (error) {
      console.error('🔤 Letter Identification: Error in useEffect:', error);
    }
  }, [currentQuestion]);

  // Initialize with a problem on first render
  useEffect(() => {
    if (!currentProblem && !currentQuestion) {
      console.log('🔤 Letter Identification: Initializing with internal problem');
      generateNewProblem();
    }
  }, []);

  // Reset when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      if (!currentQuestion) {
        generateNewProblem();
      }
      setSelectedLetter(null);
      setIsCorrect(null);
      setAttempts(0);
      setShowHint(false);
      console.log('🔤 Letter Identification Interactive cleared');
    }
  }, [clearTrigger]);

  // Generate options for multiple choice
  const generateOptions = (correctLetter: string): string[] => {
    const alphabet = getAlphabet();
    const options = [correctLetter];
    
    while (options.length < 4) {
      const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
      if (!options.includes(randomLetter)) {
        options.push(randomLetter);
      }
    }
    
    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
  };

  // Generate a new problem
  const generateNewProblem = () => {
    const alphabet = getAlphabet();
    const targetLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
    
    const problemTypes: Problem['type'][] = ['identify_letter', 'find_letter'];
    const problemType = problemTypes[Math.floor(Math.random() * problemTypes.length)];
    
    let problem: Problem;
    
    switch (problemType) {
      case 'identify_letter':
        problem = {
          type: 'identify_letter',
          question: `What letter is this?`,
          correctAnswer: targetLetter,
          targetLetter: targetLetter,
          options: generateOptions(targetLetter)
        };
        break;
        
      case 'find_letter':
        problem = {
          type: 'find_letter',
          question: `Find the letter ${targetLetter}`,
          correctAnswer: targetLetter,
          targetLetter: targetLetter,
          options: generateOptions(targetLetter)
        };
        break;
        
      default:
        problem = {
          type: 'identify_letter',
          question: `What letter is this?`,
          correctAnswer: targetLetter,
          targetLetter: targetLetter,
          options: generateOptions(targetLetter)
        };
    }
    
    setCurrentProblem(problem);
    setSelectedLetter(null);
    setIsCorrect(null);
    setAttempts(0);
    setShowHint(false);
  };

  // Draw letter on canvas
  useEffect(() => {
    console.log('🔤 Canvas useEffect triggered with:', {
      hasCanvas: !!canvasRef.current,
      currentProblem,
      showHint,
      currentQuestion
    });
    
    // Add a small delay to ensure canvas is properly mounted
    const drawLetter = () => {
      if (!canvasRef.current || !currentProblem) {
        console.log('🔤 Canvas useEffect: Missing canvas or currentProblem', {
          hasCanvas: !!canvasRef.current,
          hasProblem: !!currentProblem
        });
        return;
      }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('🔤 Canvas useEffect: Failed to get 2D context');
      return;
    }

    console.log('🔤 Canvas dimensions:', { width: canvas.width, height: canvas.height });

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw a test background to verify canvas is working
    ctx.fillStyle = '#F3F4F6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (currentProblem.type === 'identify_letter' || currentProblem.type === 'find_letter') {
      console.log('🔤 Canvas: Processing letter identification, question:', currentProblem.question);
      console.log('🔤 Canvas: Target letter:', currentProblem.targetLetter);
      
      // Always draw just the single target letter for all question types
      console.log('🔤 Canvas: Drawing single target letter');
      
      ctx.font = 'bold 50px Arial';
      ctx.fillStyle = '#1F2937';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      console.log('🔤 Canvas: Drawing letter at position:', { centerX, centerY, letter: currentProblem.targetLetter });
      ctx.fillText(currentProblem.targetLetter, centerX, centerY);
      
      // Add a border around the canvas
      ctx.strokeStyle = '#6B7280';
      ctx.lineWidth = 2;
      try {
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 10);
        } else {
          ctx.rect(10, 10, canvas.width - 20, canvas.height - 20);
        }
        ctx.stroke();
      } catch (error) {
        console.log('🔤 Canvas: Using fallback rectangle due to roundRect error:', error);
        ctx.rect(10, 10, canvas.width - 20, canvas.height - 20);
        ctx.stroke();
      }
      
      console.log('🔤 Canvas: Successfully drew letter', currentProblem.targetLetter, 'on canvas');
    }
    
    // Add hint indicator if shown
    if (showHint) {
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`💡 This letter comes ${getPositionHint(currentProblem.targetLetter)} in the alphabet`, 15, 25);
    }
    };
    
    // Use setTimeout to ensure canvas is mounted
    const timeoutId = setTimeout(drawLetter, 50);
    
    return () => clearTimeout(timeoutId);
  }, [currentProblem, showHint, currentQuestion]);

  // Get position hint for the letter
  const getPositionHint = (letter: string): string => {
    const position = letter.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
    if (position <= 5) return 'near the beginning';
    if (position <= 13) return 'in the first half';
    if (position <= 20) return 'in the second half';
    return 'near the end';
  };

  // Handle letter selection
  const handleLetterClick = (letter: string) => {
    console.log('🔤 LetterIdentification: Letter clicked:', letter, 'Current problem:', currentProblem);
    
    if (isCorrect === true) return; // Don't allow changes after correct answer
    
    setSelectedLetter(letter);
    setAttempts(prev => prev + 1);
    
    // Always call onResult for auto-submit, regardless of correctness
    console.log('🔤 LetterIdentification: Answer selected, calling onResult with:', letter);
    if (onResult) {
      onResult(letter);
    } else {
      console.log('⚠️ LetterIdentification: onResult callback is undefined!');
    }
    
    if (currentProblem && letter === currentProblem.correctAnswer) {
      console.log('🎯 LetterIdentification: Correct answer!');
      setIsCorrect(true);
    } else {
      console.log('❌ LetterIdentification: Wrong answer. Expected:', currentProblem?.correctAnswer, 'Got:', letter);
      setIsCorrect(false);
      if (attempts >= 2) {
        setShowHint(true);
      }
    }
  };

  // Play letter sound (placeholder for future audio integration)
  const playLetterSound = (letter: string) => {
    console.log('🔊 Playing sound for letter:', letter);
    // Future: integrate with text-to-speech or audio files
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(letter);
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      speechSynthesis.speak(utterance);
    }
  };

  const Button: React.FC<{ onClick: () => void; className?: string; children: React.ReactNode }> = ({
    onClick,
    className = '',
    children
  }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-2 flex flex-col max-h-[400px]">
      {/* Header */}
      <div className="text-center mb-1">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
          🔤 Letter Recognition Adventure
        </h2>
        {currentProblem && (
          <div className="flex items-center justify-center space-x-3">
            <p className="text-base text-gray-600 dark:text-gray-300">
              {currentProblem.question}
            </p>
            {(currentProblem.type === 'identify_letter' || currentProblem.type === 'find_letter') && (
              <button
                onClick={() => playLetterSound(currentProblem.targetLetter)}
                className="flex items-center space-x-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-lg text-blue-700 dark:text-blue-300 transition-colors"
              >
                <Volume2 className="w-3 h-3" />
                <span className="text-xs">Listen</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Letter Canvas - Show for letter identification, big letter display for consonant/vowel sorting */}
      {currentProblem && (
        <div className="flex items-center justify-center mb-1">
          {currentProblem.type === 'consonant_vowel_sort' ? (
            <div className="w-24 h-20 flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-xl border-2 border-purple-300 dark:border-purple-600">
              <span className="text-4xl font-bold text-purple-700 dark:text-purple-300">
                {currentProblem.targetLetter}
              </span>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              width={250}
              height={80}
              className="border-2 border-purple-200 dark:border-purple-600 rounded-lg bg-white dark:bg-gray-800"
            />
          )}
        </div>
      )}

      {/* Letter Options */}
      <div className="flex flex-wrap justify-center gap-2 mb-3">
        {currentProblem?.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleLetterClick(option)}
            className={`${
              currentProblem.type === 'consonant_vowel_sort' 
                ? 'px-4 py-2 min-w-[80px] text-base' 
                : 'w-12 h-12 text-xl'
            } rounded-lg font-bold transition-all duration-200 border-2 ${
              selectedLetter === option
                ? isCorrect === true
                  ? 'bg-green-500 text-white border-green-600 scale-110'
                  : isCorrect === false
                  ? 'bg-red-500 text-white border-red-600 scale-110'
                  : 'bg-purple-500 text-white border-purple-600 scale-110'
                : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-purple-300 dark:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-800 hover:scale-105'
            }`}
            disabled={isCorrect === true}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {isCorrect === true && (
        <div className="text-center mb-2">
          <div className="inline-flex items-center space-x-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-lg">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Excellent! That's the letter {currentProblem?.targetLetter}!</span>
          </div>
        </div>
      )}

      {isCorrect === false && (
        <div className="text-center mb-2">
          <div className="inline-flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-lg">
            <span className="text-sm font-medium">Try again! {attempts >= 2 ? 'Look for the hint!' : ''}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-2 mt-auto">
        <Button
          onClick={generateNewProblem}
          className="bg-purple-500 hover:bg-purple-600 text-white flex items-center space-x-1 px-3 py-1 text-sm"
        >
          <RotateCcw className="w-3 h-3" />
          <span>New</span>
        </Button>
        
        <Button
          onClick={() => setShowHint(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center space-x-1 px-3 py-1 text-sm"
          disabled={isCorrect === true}
        >
          <HelpCircle className="w-3 h-3" />
          <span>Hint</span>
        </Button>

        {currentProblem && (
          <Button
            onClick={() => playLetterSound(currentProblem.targetLetter)}
            className="bg-blue-500 hover:bg-blue-600 text-white flex items-center space-x-1 px-3 py-1 text-sm"
          >
            <Volume2 className="w-3 h-3" />
            <span>Listen</span>
          </Button>
        )}
      </div>
    </div>
  );
};