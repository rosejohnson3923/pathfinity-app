// ================================================================
// SHAPE SORTING INTERACTIVE - A.1 Science Tool
// Interactive shape classification for Science Foundations (PreK-2)
// ================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Check, RotateCcw, HelpCircle, Volume2 } from 'lucide-react';

interface ShapeSortingInteractiveProps {
  onResult?: (result: string) => void;
  clearTrigger?: boolean;
  currentQuestion?: {
    question: string;
    answer: string;
    hint?: string;
    targetShape?: string;
    questionType?: string;
  };
}

interface Shape {
  name: string;
  color: string;
  points: number[][];
  isTarget: boolean;
}

interface Problem {
  type: 'identify_shape' | 'classify_shape' | 'match_shape';
  question: string;
  correctAnswer: string;
  targetShape: string;
  shapes: Shape[];
  options: string[];
}

export const ShapeSortingInteractive: React.FC<ShapeSortingInteractiveProps> = ({
  onResult,
  clearTrigger,
  currentQuestion
}) => {
  console.log('🔷 ShapeSortingInteractive rendered with currentQuestion:', currentQuestion);
  
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hoveredShape, setHoveredShape] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Canvas layout constants - Single row, full horizontal scale
  const CANVAS_LAYOUT = {
    shapesPerRow: 4, // Display all shapes in one row
    shapeSize: 80, // Larger icons
    spacing: 20, // More spacing between shapes
    getLayout: (canvasWidth: number, canvasHeight: number) => {
      const availableWidth = canvasWidth - 40; // Leave 20px margin on each side
      const totalSpacing = (CANVAS_LAYOUT.shapesPerRow - 1) * CANVAS_LAYOUT.spacing;
      const shapeSize = Math.min(CANVAS_LAYOUT.shapeSize, (availableWidth - totalSpacing) / CANVAS_LAYOUT.shapesPerRow);
      const totalWidth = CANVAS_LAYOUT.shapesPerRow * shapeSize + totalSpacing;
      
      return {
        startX: (canvasWidth - totalWidth) / 2,
        startY: (canvasHeight - shapeSize) / 2, // Center vertically
        totalWidth,
        totalHeight: shapeSize,
        actualShapeSize: shapeSize
      };
    }
  };

  // Available shapes (proportional points that scale with shapeSize)
  const getShapeDefinitions = (shapeSize: number) => ({
    circle: { name: 'circle', points: [] }, // Special case for circle
    square: { name: 'square', points: [[shapeSize*0.2, shapeSize*0.2], [shapeSize*0.8, shapeSize*0.2], [shapeSize*0.8, shapeSize*0.8], [shapeSize*0.2, shapeSize*0.8]] },
    triangle: { name: 'triangle', points: [[shapeSize*0.5, shapeSize*0.2], [shapeSize*0.8, shapeSize*0.8], [shapeSize*0.2, shapeSize*0.8]] },
    rectangle: { name: 'rectangle', points: [[shapeSize*0.15, shapeSize*0.3], [shapeSize*0.85, shapeSize*0.3], [shapeSize*0.85, shapeSize*0.7], [shapeSize*0.15, shapeSize*0.7]] },
    oval: { name: 'oval', points: [] }, // Special case for oval
    diamond: { name: 'diamond', points: [[shapeSize*0.5, shapeSize*0.2], [shapeSize*0.8, shapeSize*0.5], [shapeSize*0.5, shapeSize*0.8], [shapeSize*0.2, shapeSize*0.5]] }
  });

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];

  // Update problem when currentQuestion changes
  useEffect(() => {
    console.log('🔷 Shape Sorting: currentQuestion useEffect triggered, currentQuestion:', currentQuestion);
    
    try {
      if (currentQuestion) {
        console.log('🔷 Shape Sorting received new question:', currentQuestion);
        const questionType = currentQuestion.questionType || 'shape_classification';
        const mappedType = questionType === 'shape_classification' || questionType === 'shape_identify' ? 'identify_shape' : 'identify_shape';
        
        const externalProblem = {
          type: mappedType as any,
          question: currentQuestion.question,
          correctAnswer: currentQuestion.answer.toLowerCase(),
          targetShape: currentQuestion.targetShape?.toLowerCase() || currentQuestion.answer.toLowerCase(),
          shapes: generateShapes(currentQuestion.answer.toLowerCase()),
          options: generateOptions(currentQuestion.answer.toLowerCase())
        };
        console.log('🔷 Shape Sorting: Setting external problem:', externalProblem);
        setCurrentProblem(externalProblem);
        setSelectedShape(null);
        setIsCorrect(null);
        setAttempts(0);
        setShowHint(false);
        setHoveredShape(null);
        console.log('🔷 Shape Sorting: External problem set successfully');
      } else {
        console.log('🔷 Shape Sorting: No external question provided, generating internal problem');
        generateNewProblem();
      }
    } catch (error) {
      console.error('🔷 Shape Sorting: Error in useEffect:', error);
    }
  }, [currentQuestion]);

  // Initialize with a problem on first render
  useEffect(() => {
    if (!currentProblem && !currentQuestion) {
      console.log('🔷 Shape Sorting: Initializing with internal problem');
      generateNewProblem();
    }
  }, []);

  // Reset when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      if (!currentQuestion) {
        generateNewProblem();
      }
      setSelectedShape(null);
      setIsCorrect(null);
      setAttempts(0);
      setShowHint(false);
      setHoveredShape(null);
      console.log('🔷 Shape Sorting Interactive cleared');
    }
  }, [clearTrigger]);

  // Generate shapes for the canvas
  const generateShapes = (targetShape: string): Shape[] => {
    const shapes: Shape[] = [];
    const shapeDefinitions = getShapeDefinitions(CANVAS_LAYOUT.shapeSize);
    const shapeNames = Object.keys(shapeDefinitions);
    
    // Add target shape
    shapes.push({
      name: targetShape,
      color: colors[0],
      points: shapeDefinitions[targetShape as keyof typeof shapeDefinitions]?.points || [],
      isTarget: true
    });
    
    // Add 2-3 other shapes
    const otherShapes = shapeNames.filter(name => name !== targetShape);
    for (let i = 0; i < Math.min(3, otherShapes.length); i++) {
      const shapeName = otherShapes[i];
      shapes.push({
        name: shapeName,
        color: colors[i + 1],
        points: shapeDefinitions[shapeName as keyof typeof shapeDefinitions]?.points || [],
        isTarget: false
      });
    }
    
    // Shuffle shapes
    return shapes.sort(() => Math.random() - 0.5);
  };

  // Generate options for multiple choice
  const generateOptions = (correctShape: string): string[] => {
    const shapeDefinitions = getShapeDefinitions(CANVAS_LAYOUT.shapeSize);
    const shapeNames = Object.keys(shapeDefinitions);
    const options = [correctShape];
    
    while (options.length < 4) {
      const randomShape = shapeNames[Math.floor(Math.random() * shapeNames.length)];
      if (!options.includes(randomShape)) {
        options.push(randomShape);
      }
    }
    
    // Shuffle options
    return options.sort(() => Math.random() - 0.5);
  };

  // Generate a new problem
  const generateNewProblem = () => {
    const shapeDefinitions = getShapeDefinitions(CANVAS_LAYOUT.shapeSize);
    const shapeNames = Object.keys(shapeDefinitions);
    const targetShape = shapeNames[Math.floor(Math.random() * shapeNames.length)];
    
    const problemTypes: Problem['type'][] = ['identify_shape', 'classify_shape'];
    const problemType = problemTypes[Math.floor(Math.random() * problemTypes.length)];
    
    let problem: Problem;
    
    switch (problemType) {
      case 'identify_shape':
        problem = {
          type: 'identify_shape',
          question: `What shape is highlighted?`,
          correctAnswer: targetShape,
          targetShape: targetShape,
          shapes: generateShapes(targetShape),
          options: generateOptions(targetShape)
        };
        break;
        
      case 'classify_shape':
        problem = {
          type: 'classify_shape',
          question: `Click on the ${targetShape}`,
          correctAnswer: targetShape,
          targetShape: targetShape,
          shapes: generateShapes(targetShape),
          options: generateOptions(targetShape)
        };
        break;
        
      default:
        problem = {
          type: 'identify_shape',
          question: `What shape is highlighted?`,
          correctAnswer: targetShape,
          targetShape: targetShape,
          shapes: generateShapes(targetShape),
          options: generateOptions(targetShape)
        };
    }
    
    setCurrentProblem(problem);
    setSelectedShape(null);
    setIsCorrect(null);
    setAttempts(0);
    setShowHint(false);
    setHoveredShape(null);
  };

  // Draw shapes on canvas
  useEffect(() => {
    if (!canvasRef.current || !currentProblem) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background with better contrast for shape visibility
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw shapes using shared layout constants
    const layout = CANVAS_LAYOUT.getLayout(canvas.width, canvas.height);
    const { startX, startY, actualShapeSize } = layout;
    const { shapesPerRow, spacing } = CANVAS_LAYOUT;
    const shapeSize = actualShapeSize || CANVAS_LAYOUT.shapeSize;
    
    currentProblem.shapes.forEach((shape, index) => {
      const row = Math.floor(index / shapesPerRow);
      const col = index % shapesPerRow;
      const x = startX + col * (shapeSize + spacing);
      const y = startY + row * (shapeSize + spacing);
      
      ctx.save();
      ctx.translate(x, y);
      
      // Highlight target shape with glow effect
      if (shape.isTarget && currentProblem.question.toLowerCase().includes('highlighted')) {
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 15;
      }
      
      // Add hover effect
      if (hoveredShape === shape.name) {
        ctx.shadowColor = '#4F46E5';
        ctx.shadowBlur = 10;
      }
      
      // Add selected effect
      if (selectedShape === shape.name) {
        ctx.shadowColor = isCorrect ? '#10B981' : '#EF4444';
        ctx.shadowBlur = 12;
      }
      
      ctx.fillStyle = shape.color;
      ctx.strokeStyle = '#2D3748';
      ctx.lineWidth = 2;
      
      if (shape.name === 'circle') {
        ctx.beginPath();
        ctx.arc(shapeSize/2, shapeSize/2, shapeSize/2.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      } else if (shape.name === 'oval') {
        ctx.beginPath();
        ctx.ellipse(shapeSize/2, shapeSize/2, shapeSize/2.5, shapeSize/3.5, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      } else if (shape.points.length > 0) {
        // Scale shape points based on actual shape size
        const scaleRatio = shapeSize / CANVAS_LAYOUT.shapeSize;
        ctx.beginPath();
        ctx.moveTo(shape.points[0][0] * scaleRatio, shape.points[0][1] * scaleRatio);
        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i][0] * scaleRatio, shape.points[i][1] * scaleRatio);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      
      ctx.restore();
    });
    
    // Add hint indicator if shown
    if (showHint) {
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`💡 Look for the ${currentProblem.targetShape} shape!`, 15, canvas.height - 15);
    }
  }, [currentProblem, showHint, hoveredShape, selectedShape, isCorrect]);

  // Get shape at canvas coordinates
  const getShapeAtCoordinates = (x: number, y: number): string | null => {
    if (!currentProblem) return null;
    
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const layout = CANVAS_LAYOUT.getLayout(canvas.width, canvas.height);
    const { startX, startY, actualShapeSize } = layout;
    const { shapesPerRow, spacing } = CANVAS_LAYOUT;
    const shapeSize = actualShapeSize || CANVAS_LAYOUT.shapeSize;
    
    for (let i = 0; i < currentProblem.shapes.length; i++) {
      const row = Math.floor(i / shapesPerRow);
      const col = i % shapesPerRow;
      const shapeX = startX + col * (shapeSize + spacing);
      const shapeY = startY + row * (shapeSize + spacing);
      
      // Check if click is within shape bounds
      if (x >= shapeX && x <= shapeX + shapeSize && 
          y >= shapeY && y <= shapeY + shapeSize) {
        return currentProblem.shapes[i].name;
      }
    }
    
    return null;
  };

  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || isCorrect === true) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const clickedShape = getShapeAtCoordinates(x, y);
    if (clickedShape) {
      handleShapeClick(clickedShape);
    }
  };

  // Handle canvas mouse move for hover effects
  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const hoveredShapeName = getShapeAtCoordinates(x, y);
    setHoveredShape(hoveredShapeName);
    
    // Change cursor style
    canvas.style.cursor = hoveredShapeName ? 'pointer' : 'default';
  };

  // Handle shape selection (now called from both canvas and buttons)
  const handleShapeClick = (shape: string) => {
    console.log('🔷 ShapeSorting: Shape clicked:', shape, 'Current problem:', currentProblem);
    
    if (isCorrect === true) return; // Don't allow changes after correct answer
    
    setSelectedShape(shape);
    setAttempts(prev => prev + 1);
    
    // Always call onResult for auto-submit, regardless of correctness
    console.log('🔷 ShapeSorting: Answer selected, calling onResult with:', shape);
    if (onResult) {
      onResult(shape);
    } else {
      console.log('⚠️ ShapeSorting: onResult callback is undefined!');
    }
    
    if (currentProblem && shape === currentProblem.correctAnswer) {
      console.log('🎯 ShapeSorting: Correct answer!');
      setIsCorrect(true);
    } else {
      console.log('❌ ShapeSorting: Wrong answer. Expected:', currentProblem?.correctAnswer, 'Got:', shape);
      setIsCorrect(false);
      if (attempts >= 2) {
        setShowHint(true);
      }
    }
  };

  // Play shape sound (placeholder for future audio integration)
  const playShapeSound = (shape: string) => {
    console.log('🔊 Playing sound for shape:', shape);
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(shape);
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      speechSynthesis.speak(utterance);
    }
  };

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
          🔷 Shape Sorting Adventure
        </h2>
        {currentProblem && (
          <div className="flex flex-col items-center space-y-1">
            <p className="text-base text-gray-600 dark:text-gray-300">
              {currentProblem.question}
            </p>
            <div className="flex items-center space-x-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click shapes on canvas or use buttons below
              </p>
              <button
                onClick={() => playShapeSound(currentProblem.targetShape)}
                className="flex items-center space-x-1 px-2 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 rounded-lg text-blue-700 dark:text-blue-300 transition-colors"
              >
                <Volume2 className="w-3 h-3" />
                <span className="text-xs">Listen</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Shape Canvas */}
      {currentProblem && (
        <div className="flex items-center justify-center mb-2">
          <canvas
            ref={canvasRef}
            width={400}
            height={120}
            className="border-2 border-blue-200 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 cursor-pointer"
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={() => setHoveredShape(null)}
          />
        </div>
      )}

      {/* Shape Options */}
      <div className="flex flex-wrap justify-center gap-2 mb-3">
        {currentProblem?.options.map((shape, index) => (
          <button
            key={index}
            onClick={() => handleShapeClick(shape)}
            className={`px-3 py-2 rounded-lg font-bold text-sm transition-all duration-200 border-2 ${
              selectedShape === shape
                ? isCorrect === true
                  ? 'bg-green-500 text-white border-green-600 scale-110'
                  : isCorrect === false
                  ? 'bg-red-500 text-white border-red-600 scale-110'
                  : 'bg-blue-500 text-white border-blue-600 scale-110'
                : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-blue-300 dark:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800 hover:scale-105'
            }`}
            disabled={isCorrect === true}
          >
            {shape}
          </button>
        ))}
      </div>

      {/* Note: Feedback now handled by floating Finn chatbot in parent component */}

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
          disabled={isCorrect === true}
        >
          <HelpCircle className="w-3 h-3" />
          <span>Hint</span>
        </Button>

        {currentProblem && (
          <Button
            onClick={() => playShapeSound(currentProblem.targetShape)}
            className="bg-purple-500 hover:bg-purple-600 text-white flex items-center space-x-1"
          >
            <Volume2 className="w-3 h-3" />
            <span>Listen</span>
          </Button>
        )}
      </div>
    </div>
  );
};