// ================================================================
// NUMBER LINE INTERACTIVE - A.0 Basic Math Tool
// Interactive number line for basic counting and sequencing (PreK-2)
// ================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Check, RotateCcw, HelpCircle } from 'lucide-react';

interface NumberLineInteractiveProps {
  onResult?: (result: string) => void;
  clearTrigger?: boolean;
  maxNumber?: number;
  showNumbers?: boolean;
  problemType?: 'sequence' | 'addition' | 'subtraction' | 'counting' | 'number_identification';
  currentQuestion?: {
    question: string;
    answer: number;
    hint?: string;
    displayNumber?: number;
    questionType?: string;
  };
}

interface Problem {
  type: 'sequence' | 'addition' | 'subtraction' | 'counting';
  question: string;
  correctAnswer: number;
  startNumber?: number;
  endNumber?: number;
  missingPosition?: number;
}

export const NumberLineInteractive: React.FC<NumberLineInteractiveProps> = ({
  onResult,
  clearTrigger,
  maxNumber = 10,
  showNumbers = true,
  problemType = 'sequence',
  currentQuestion
}) => {
  console.log('🔢 NumberLineInteractive rendered with currentQuestion:', currentQuestion);
  
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  console.log('🔢 NumberLineInteractive current state - currentProblem:', currentProblem);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Update problem when currentQuestion changes
  useEffect(() => {
    console.log('🔢 Number Line: currentQuestion useEffect triggered, currentQuestion:', currentQuestion);
    console.log('🔢 Number Line: About to check if currentQuestion exists...');
    
    try {
      if (currentQuestion) {
        console.log('🔢 Number Line received new question:', currentQuestion);
        const externalProblem = {
          type: currentQuestion.questionType as any || 'sequence',
          question: currentQuestion.question,
          correctAnswer: currentQuestion.answer,
          startNumber: currentQuestion.displayNumber,
          endNumber: currentQuestion.displayNumber,
          displayNumber: currentQuestion.displayNumber
        };
        console.log('🔢 Number Line: Setting external problem:', externalProblem);
        setCurrentProblem(externalProblem);
        setSelectedNumber(null);
        setIsCorrect(null);
        setAttempts(0);
        setShowHint(false);
        console.log('🔢 Number Line: External problem set successfully');
      } else {
        console.log('🔢 Number Line: No external question provided, generating internal problem');
        generateNewProblem();
      }
    } catch (error) {
      console.error('🔢 Number Line: Error in useEffect:', error);
    }
  }, [currentQuestion]);

  // Initialize with a problem on first render
  useEffect(() => {
    if (!currentProblem && !currentQuestion) {
      console.log('🔢 Number Line: Initializing with internal problem');
      generateNewProblem();
    }
  }, []);

  // Reset when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      if (!currentQuestion) {
        generateNewProblem();
      }
      setSelectedNumber(null);
      setIsCorrect(null);
      setAttempts(0);
      setShowHint(false);
      console.log('🔢 Number Line Interactive cleared');
    }
  }, [clearTrigger]);

  // Generate a new problem
  const generateNewProblem = () => {
    const problems: Problem[] = [];
    
    switch (problemType) {
      case 'sequence':
        // Missing number in sequence
        const start = Math.floor(Math.random() * (maxNumber - 5)) + 1;
        const missing = start + Math.floor(Math.random() * 3) + 1;
        problems.push({
          type: 'sequence',
          question: `What number is missing in the sequence?`,
          correctAnswer: missing,
          startNumber: start,
          endNumber: start + 4,
          missingPosition: missing
        });
        break;
        
      case 'addition':
        // Simple addition on number line
        const addend1 = Math.floor(Math.random() * (maxNumber / 2)) + 1;
        const addend2 = Math.floor(Math.random() * (maxNumber - addend1)) + 1;
        problems.push({
          type: 'addition',
          question: `${addend1} + ${addend2} = ?`,
          correctAnswer: addend1 + addend2,
          startNumber: addend1
        });
        break;
        
      case 'subtraction':
        // Simple subtraction on number line
        const minuend = Math.floor(Math.random() * maxNumber) + 3;
        const subtrahend = Math.floor(Math.random() * minuend) + 1;
        problems.push({
          type: 'subtraction',
          question: `${minuend} - ${subtrahend} = ?`,
          correctAnswer: minuend - subtrahend,
          startNumber: minuend
        });
        break;
        
      case 'counting':
        // Count objects and find position
        const countTo = Math.floor(Math.random() * maxNumber) + 3;
        problems.push({
          type: 'counting',
          question: `Count the objects and find the number on the line`,
          correctAnswer: countTo
        });
        break;
    }
    
    const problem = problems[Math.floor(Math.random() * problems.length)];
    setCurrentProblem(problem);
    setSelectedNumber(null);
    setIsCorrect(null);
    setAttempts(0);
    setShowHint(false);
  };

  // Initialize with first problem only if no external question is provided
  useEffect(() => {
    if (!currentQuestion) {
      generateNewProblem();
    }
  }, [problemType, maxNumber, currentQuestion]);

  // Draw number line on canvas
  useEffect(() => {
    if (!canvasRef.current || !currentProblem) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up canvas
    const width = canvas.width;
    const height = canvas.height;
    const lineY = height / 2;
    const startX = 50;
    const endX = width - 50;
    const segmentWidth = (endX - startX) / maxNumber;
    
    // Draw main line
    ctx.beginPath();
    ctx.moveTo(startX, lineY);
    ctx.lineTo(endX, lineY);
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw tick marks and numbers
    for (let i = 0; i <= maxNumber; i++) {
      const x = startX + (i * segmentWidth);
      
      // Draw tick mark
      ctx.beginPath();
      ctx.moveTo(x, lineY - 15);
      ctx.lineTo(x, lineY + 15);
      ctx.strokeStyle = '#6B7280';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw number
      if (showNumbers) {
        ctx.fillStyle = '#1F2937';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(i.toString(), x, lineY + 30);
      }
    }
    
    // For "number identification" questions, highlight the number to identify
    if (currentProblem && currentProblem.type === 'number_identification' && currentProblem.displayNumber !== undefined) {
      const targetNumber = currentProblem.displayNumber || currentProblem.correctAnswer;
      const targetX = startX + (targetNumber * segmentWidth);
      
      // Draw a star or indicator above the number to identify
      ctx.save();
      
      // Draw pointing arrow
      ctx.beginPath();
      ctx.moveTo(targetX, lineY - 50);
      ctx.lineTo(targetX - 10, lineY - 35);
      ctx.lineTo(targetX + 10, lineY - 35);
      ctx.closePath();
      ctx.fillStyle = '#9333EA'; // Purple color
      ctx.fill();
      
      // Draw question mark bubble
      ctx.beginPath();
      ctx.arc(targetX, lineY - 60, 15, 0, 2 * Math.PI);
      ctx.fillStyle = '#9333EA';
      ctx.fill();
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('?', targetX, lineY - 55);
      
      // Highlight the number tick mark
      ctx.strokeStyle = '#9333EA';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(targetX, lineY - 20);
      ctx.lineTo(targetX, lineY + 20);
      ctx.stroke();
      
      ctx.restore();
    }
    
    // Highlight selected number
    if (selectedNumber !== null) {
      const x = startX + (selectedNumber * segmentWidth);
      ctx.beginPath();
      ctx.arc(x, lineY, 20, 0, 2 * Math.PI);
      ctx.fillStyle = isCorrect === true ? '#10B981' : isCorrect === false ? '#EF4444' : '#3B82F6';
      ctx.fill();
      
      // Draw number in circle
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(selectedNumber.toString(), x, lineY + 5);
    }
    
    // Draw hint if shown
    if (showHint && currentProblem) {
      const hintX = startX + (currentProblem.correctAnswer * segmentWidth);
      ctx.beginPath();
      ctx.arc(hintX, lineY - 40, 8, 0, 2 * Math.PI);
      ctx.fillStyle = '#F59E0B';
      ctx.fill();
      
      // Draw arrow pointing to hint
      ctx.beginPath();
      ctx.moveTo(hintX, lineY - 30);
      ctx.lineTo(hintX, lineY - 20);
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }, [currentProblem, selectedNumber, isCorrect, showHint, maxNumber, showNumbers]);

  // Handle number selection
  const handleNumberClick = (number: number) => {
    console.log('🔢 NumberLine: Number clicked:', number, 'Current problem:', currentProblem);
    
    if (isCorrect === true) return; // Don't allow changes after correct answer
    
    setSelectedNumber(number);
    setAttempts(prev => prev + 1);
    
    // Always call onResult for auto-submit, regardless of correctness
    console.log('🔢 NumberLine: Answer selected, calling onResult with:', number.toString());
    if (onResult) {
      onResult(number.toString());
    } else {
      console.log('⚠️ NumberLine: onResult callback is undefined!');
    }
    
    if (currentProblem && number === currentProblem.correctAnswer) {
      console.log('🎯 NumberLine: Correct answer!');
      setIsCorrect(true);
    } else {
      console.log('❌ NumberLine: Wrong answer. Expected:', currentProblem?.correctAnswer, 'Got:', number);
      setIsCorrect(false);
      if (attempts >= 2) {
        setShowHint(true);
      }
    }
  };

  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    
    const startX = 50;
    const endX = canvas.width - 50;
    const segmentWidth = (endX - startX) / maxNumber;
    
    // Find clicked number
    for (let i = 0; i <= maxNumber; i++) {
      const numberX = startX + (i * segmentWidth);
      if (Math.abs(x - numberX) < segmentWidth / 2) {
        handleNumberClick(i);
        break;
      }
    }
  };

  const renderObjects = () => {
    if (!currentProblem || currentProblem.type !== 'counting') return null;
    
    const objects = [];
    for (let i = 0; i < currentProblem.correctAnswer; i++) {
      objects.push(
        <div
          key={i}
          className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm"
        >
          {i + 1}
        </div>
      );
    }
    
    return (
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {objects}
      </div>
    );
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
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-3 flex flex-col">
      {/* Compact Header */}
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Number Line Adventure
        </h2>
      </div>

      {/* Objects for counting problems */}
      {renderObjects()}

      {/* Number Line Canvas with integrated buttons */}
      <div className="flex-1 flex flex-col items-center justify-center mb-2">
        <canvas
          ref={canvasRef}
          width={600}
          height={150}
          className="border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 cursor-pointer mb-2"
          onClick={handleCanvasClick}
        />
        {/* Number Buttons inside the same container */}
        <div className="flex flex-wrap justify-center gap-2">
          {Array.from({ length: maxNumber + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => handleNumberClick(i)}
              className={`w-10 h-10 rounded-lg font-bold text-lg transition-colors ${
                selectedNumber === i
                  ? isCorrect === true
                    ? 'bg-green-500 text-white'
                    : isCorrect === false
                    ? 'bg-red-500 text-white'
                    : 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              disabled={isCorrect === true}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {isCorrect === true && (
        <div className="text-center mb-4">
          <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg">
            <Check className="w-5 h-5" />
            <span className="font-medium">Excellent! That's correct!</span>
          </div>
        </div>
      )}

      {isCorrect === false && (
        <div className="text-center mb-4">
          <div className="inline-flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-lg">
            <span className="font-medium">Try again! {attempts >= 2 ? 'Look for the hint!' : ''}</span>
          </div>
        </div>
      )}

    </div>
  );
};