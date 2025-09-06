// ================================================================
// COMMUNITY HELPER INTERACTIVE - A.0 Social Studies Tool
// Interactive community helper identification for Social Studies Foundations (PreK-2)
// ================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Check, RotateCcw, HelpCircle, Volume2 } from 'lucide-react';

interface CommunityHelperInteractiveProps {
  onResult?: (result: string) => void;
  clearTrigger?: boolean;
  currentQuestion?: {
    question: string;
    answer: string;
    hint?: string;
    targetHelper?: string;
    questionType?: string;
  };
}

interface Helper {
  name: string;
  emoji: string;
  description: string;
  workplace: string;
  isTarget: boolean;
}

interface Problem {
  type: 'identify_helper' | 'match_workplace' | 'help_activity';
  question: string;
  correctAnswer: string;
  targetHelper: string;
  helpers: Helper[];
  options: string[];
}

export const CommunityHelperInteractive: React.FC<CommunityHelperInteractiveProps> = ({
  onResult,
  clearTrigger,
  currentQuestion
}) => {
  console.log('🏘️ CommunityHelperInteractive rendered with currentQuestion:', currentQuestion);
  
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [selectedHelper, setSelectedHelper] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hoveredHelper, setHoveredHelper] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Canvas layout constants - Single row with 3 large helpers
  const CANVAS_LAYOUT = {
    helpersPerRow: 3, // 3 helpers in one row
    helperSize: 90, // Larger icons since we only have 3
    spacing: 30, // More spacing between helpers
    getLayout: (canvasWidth: number, canvasHeight: number, totalHelpers: number) => {
      const rows = 1; // Always single row for 3 helpers
      const availableWidth = canvasWidth - 60; // Leave 30px margin on each side
      const totalSpacing = (totalHelpers - 1) * CANVAS_LAYOUT.spacing;
      const helperSize = Math.min(CANVAS_LAYOUT.helperSize, (availableWidth - totalSpacing) / totalHelpers);
      const totalWidth = totalHelpers * helperSize + totalSpacing;
      const totalHeight = helperSize + 20; // Add space for text below
      
      return {
        startX: (canvasWidth - totalWidth) / 2,
        startY: 10, // Move helpers closer to top
        totalWidth,
        totalHeight,
        actualHelperSize: helperSize,
        rows
      };
    }
  };

  // Available community helpers
  const helperDefinitions = {
    teacher: { name: 'teacher', emoji: '👩‍🏫', description: 'helps children learn', workplace: 'school' },
    doctor: { name: 'doctor', emoji: '👨‍⚕️', description: 'helps people feel better', workplace: 'hospital' },
    firefighter: { name: 'firefighter', emoji: '👨‍🚒', description: 'keeps us safe from fires', workplace: 'fire station' },
    police: { name: 'police', emoji: '👮‍♀️', description: 'keeps our community safe', workplace: 'police station' },
    chef: { name: 'chef', emoji: '👨‍🍳', description: 'makes delicious food', workplace: 'restaurant' },
    librarian: { name: 'librarian', emoji: '👩‍💼', description: 'helps us find books', workplace: 'library' }
  };

  const colors = ['#FFE4E1', '#E1F5FE', '#F3E5F5', '#E8F5E8', '#FFF3E0', '#FCE4EC'];

  // Update problem when currentQuestion changes
  useEffect(() => {
    console.log('🏘️ Community Helper: currentQuestion useEffect triggered, currentQuestion:', currentQuestion);
    
    try {
      if (currentQuestion) {
        console.log('🏘️ Community Helper received new question:', currentQuestion);
        const questionType = currentQuestion.questionType || 'community_helper';
        const mappedType = questionType === 'community_helper_workplace' ? 'match_workplace' : 'identify_helper';
        
        // For workplace questions, answer is now the helper name, not the workplace
        const isWorkplaceQuestion = mappedType === 'match_workplace';
        const targetHelper = currentQuestion.targetHelper?.toLowerCase() || 
                           (isWorkplaceQuestion ? currentQuestion.answer.toLowerCase() : currentQuestion.answer.toLowerCase());
        
        console.log('🏘️ Extracting target helper:', { 
          fromTargetHelper: currentQuestion.targetHelper, 
          fromAnswer: currentQuestion.answer, 
          finalTarget: targetHelper,
          isWorkplaceQuestion,
          targetWorkplace: currentQuestion.targetWorkplace
        });
        
        const externalProblem = {
          type: mappedType as any,
          question: currentQuestion.question,
          correctAnswer: currentQuestion.answer.toLowerCase(),
          targetHelper: targetHelper,
          targetWorkplace: currentQuestion.targetWorkplace,
          helpers: generateHelpers(targetHelper),
          options: generateOptions(targetHelper, false) // Always generate helper names now
        };
        console.log('🏘️ Community Helper: Setting external problem:', externalProblem);
        setCurrentProblem(externalProblem);
        setSelectedHelper(null);
        setIsCorrect(null);
        setAttempts(0);
        setShowHint(false);
        setHoveredHelper(null);
        console.log('🏘️ Community Helper: External problem set successfully');
      } else {
        console.log('🏘️ Community Helper: No external question provided, generating internal problem');
        generateNewProblem();
      }
    } catch (error) {
      console.error('🏘️ Community Helper: Error in useEffect:', error);
      // Fallback to internal problem generation
      console.log('🏘️ Community Helper: Falling back to internal problem generation');
      generateNewProblem();
    }
  }, [currentQuestion?.question, currentQuestion?.answer, currentQuestion?.targetHelper, currentQuestion?.questionType]);

  // Initialize with a problem on first render
  useEffect(() => {
    if (!currentProblem && !currentQuestion) {
      console.log('🏘️ Community Helper: Initializing with internal problem');
      generateNewProblem();
    }
  }, []);

  // Reset when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      if (!currentQuestion) {
        generateNewProblem();
      }
      setSelectedHelper(null);
      setIsCorrect(null);
      setAttempts(0);
      setShowHint(false);
      setHoveredHelper(null);
      console.log('🏘️ Community Helper Interactive cleared');
    }
  }, [clearTrigger]);

  // Generate helpers for the canvas
  const generateHelpers = (targetHelper: string): Helper[] => {
    console.log('🏘️ generateHelpers called with targetHelper:', targetHelper);
    const helpers: Helper[] = [];
    const helperNames = Object.keys(helperDefinitions);
    console.log('🏘️ Available helper names:', helperNames);
    
    // Add target helper
    const targetDef = helperDefinitions[targetHelper as keyof typeof helperDefinitions];
    console.log('🏘️ Target helper definition:', { targetHelper, targetDef });
    if (targetDef) {
      const newHelper = {
        name: targetHelper,
        emoji: targetDef.emoji,
        description: targetDef.description,
        workplace: targetDef.workplace,
        isTarget: true
      };
      console.log('🏘️ Adding target helper:', newHelper);
      helpers.push(newHelper);
    } else {
      console.warn('🏘️ Target helper definition not found for:', targetHelper);
    }
    
    // Add only 2 other helpers for a total of 3
    const otherHelpers = helperNames.filter(name => name !== targetHelper);
    console.log('🏘️ Other helpers to add:', otherHelpers);
    
    // Randomly select 2 other helpers
    const shuffledOthers = otherHelpers.sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(2, shuffledOthers.length); i++) {
      const helperName = shuffledOthers[i];
      const helperDef = helperDefinitions[helperName as keyof typeof helperDefinitions];
      const newHelper = {
        name: helperName,
        emoji: helperDef.emoji,
        description: helperDef.description,
        workplace: helperDef.workplace,
        isTarget: false
      };
      console.log('🏘️ Adding other helper:', newHelper);
      helpers.push(newHelper);
    }
    
    // Shuffle helpers
    const shuffledHelpers = helpers.sort(() => Math.random() - 0.5);
    console.log('🏘️ Final generated helpers:', shuffledHelpers);
    return shuffledHelpers;
  };

  // Generate options for multiple choice
  const generateOptions = (correctHelper: string, isWorkplace: boolean = false): string[] => {
    if (isWorkplace) {
      // For workplace questions, generate workplace options
      const workplaces = Object.values(helperDefinitions).map(def => def.workplace);
      const targetWorkplace = helperDefinitions[correctHelper as keyof typeof helperDefinitions]?.workplace;
      const options = [targetWorkplace];
      
      while (options.length < 3) {
        const randomWorkplace = workplaces[Math.floor(Math.random() * workplaces.length)];
        if (!options.includes(randomWorkplace)) {
          options.push(randomWorkplace);
        }
      }
      
      // Shuffle options
      return options.sort(() => Math.random() - 0.5);
    } else {
      // For helper identification questions, generate helper name options
      const helperNames = Object.keys(helperDefinitions);
      const options = [correctHelper];
      
      while (options.length < 3) {
        const randomHelper = helperNames[Math.floor(Math.random() * helperNames.length)];
        if (!options.includes(randomHelper)) {
          options.push(randomHelper);
        }
      }
      
      // Shuffle options
      return options.sort(() => Math.random() - 0.5);
    }
  };

  // Generate a new problem
  const generateNewProblem = () => {
    console.log('🏘️ generateNewProblem called');
    const helperNames = Object.keys(helperDefinitions);
    const targetHelper = helperNames[Math.floor(Math.random() * helperNames.length)];
    console.log('🏘️ Randomly selected target helper:', targetHelper, 'from', helperNames);
    
    const problemTypes: Problem['type'][] = ['identify_helper', 'match_workplace'];
    const problemType = problemTypes[Math.floor(Math.random() * problemTypes.length)];
    
    let problem: Problem;
    
    switch (problemType) {
      case 'identify_helper':
        problem = {
          type: 'identify_helper',
          question: `Who helps children learn?`,
          correctAnswer: 'teacher',
          targetHelper: 'teacher',
          helpers: generateHelpers('teacher'),
          options: generateOptions('teacher')
        };
        break;
        
      case 'match_workplace':
        const helperDef = helperDefinitions[targetHelper as keyof typeof helperDefinitions];
        problem = {
          type: 'match_workplace',
          question: `Who works at the ${helperDef.workplace}?`,
          correctAnswer: targetHelper,
          targetHelper: targetHelper,
          targetWorkplace: helperDef.workplace,
          helpers: generateHelpers(targetHelper),
          options: generateOptions(targetHelper, false) // Generate helper names, not workplaces
        };
        break;
        
      default:
        problem = {
          type: 'identify_helper',
          question: `Who helps children learn?`,
          correctAnswer: 'teacher',
          targetHelper: 'teacher',
          helpers: generateHelpers('teacher'),
          options: generateOptions('teacher')
        };
    }
    
    console.log('🏘️ generateNewProblem setting problem:', problem);
    setCurrentProblem(problem);
    setSelectedHelper(null);
    setIsCorrect(null);
    setAttempts(0);
    setShowHint(false);
    setHoveredHelper(null);
    console.log('🏘️ generateNewProblem completed, state should be updated');
  };

  // Draw helpers on canvas
  useEffect(() => {
    console.log('🎨 Canvas drawing effect triggered:', { 
      hasCanvas: !!canvasRef.current, 
      hasProblem: !!currentProblem,
      problemHelpers: currentProblem?.helpers?.length || 0
    });
    
    if (!canvasRef.current || !currentProblem) {
      console.log('🎨 Canvas drawing skipped - missing requirements');
      return;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('🎨 Canvas drawing skipped - no context');
      return;
    }

    console.log('🎨 Starting canvas drawing with helpers:', currentProblem.helpers);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#F9FAFB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    console.log('🎨 Canvas background drawn');
    
    // Draw helpers using shared layout constants
    const layout = CANVAS_LAYOUT.getLayout(canvas.width, canvas.height, currentProblem.helpers.length);
    const { startX, startY, actualHelperSize } = layout;
    const { helpersPerRow, spacing } = CANVAS_LAYOUT;
    const helperSize = actualHelperSize || CANVAS_LAYOUT.helperSize;
    
    console.log('🎨 Drawing helpers with layout:', { startX, startY, helperSize, spacing, actualHelperSize });
    
    currentProblem.helpers.forEach((helper, index) => {
      const row = Math.floor(index / helpersPerRow);
      const col = index % helpersPerRow;
      const x = startX + col * (helperSize + spacing);
      const y = startY + row * (helperSize + spacing);
      
      console.log(`🎨 Drawing helper ${index}: ${helper.name} at (${x}, ${y})`, helper);
      
      ctx.save();
      ctx.translate(x, y);
      
      // Add hover effect
      if (hoveredHelper === helper.name) {
        ctx.shadowColor = '#4F46E5';
        ctx.shadowBlur = 10;
      }
      
      // Add selected effect
      if (selectedHelper === helper.name) {
        ctx.shadowColor = isCorrect ? '#10B981' : '#EF4444';
        ctx.shadowBlur = 12;
      }
      
      // Highlight target helper for workplace questions
      if (helper.isTarget && currentProblem.type === 'match_workplace') {
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 20;
        ctx.lineWidth = 4;
      }
      
      // Draw helper background circle
      ctx.fillStyle = colors[index % colors.length];
      ctx.strokeStyle = '#2D3748';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(helperSize/2, helperSize/2, helperSize/2.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      
      // Draw helper emoji - scale font size with helper size
      const fontSize = Math.max(24, helperSize * 0.4); // Scale emoji with helper size
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = '#000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(helper.emoji, helperSize/2, helperSize/2);
      
      // Draw helper name below the emoji
      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = '#374151';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(helper.name, helperSize/2, helperSize + 5);
      
      // Add indicator for target helper in workplace questions
      if (helper.isTarget && currentProblem.type === 'match_workplace') {
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('👆', helperSize/2, -5);
      }
      
      ctx.restore();
    });
    
    // Add hint indicator if shown
    if (showHint && currentProblem.targetHelper) {
      const targetDef = helperDefinitions[currentProblem.targetHelper as keyof typeof helperDefinitions];
      if (targetDef) {
        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        if (currentProblem.type === 'match_workplace') {
          ctx.fillText(`💡 The ${currentProblem.targetHelper} works at the ${currentProblem.targetWorkplace}!`, 15, canvas.height - 15);
        } else {
          ctx.fillText(`💡 Look for the ${targetDef.description}!`, 15, canvas.height - 15);
        }
      }
    }
  }, [currentProblem, showHint, hoveredHelper, selectedHelper, isCorrect]);

  // Get helper at canvas coordinates
  const getHelperAtCoordinates = (x: number, y: number): string | null => {
    if (!currentProblem) return null;
    
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const layout = CANVAS_LAYOUT.getLayout(canvas.width, canvas.height, currentProblem.helpers.length);
    const { startX, startY, actualHelperSize } = layout;
    const { helpersPerRow, spacing } = CANVAS_LAYOUT;
    const helperSize = actualHelperSize || CANVAS_LAYOUT.helperSize;
    
    for (let i = 0; i < currentProblem.helpers.length; i++) {
      const row = Math.floor(i / helpersPerRow);
      const col = i % helpersPerRow;
      const helperX = startX + col * (helperSize + spacing);
      const helperY = startY + row * (helperSize + spacing);
      
      // Check if click is within helper bounds (circular)
      const centerX = helperX + helperSize/2;
      const centerY = helperY + helperSize/2;
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      
      if (distance <= helperSize/2.5) {
        return currentProblem.helpers[i].name;
      }
    }
    
    return null;
  };

  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('🖱️ Canvas clicked!', { event: event.type });
    
    const canvas = canvasRef.current;
    if (!canvas || isCorrect === true) {
      console.log('🖱️ Canvas click blocked:', { hasCanvas: !!canvas, isCorrect });
      return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    console.log('🖱️ Click coordinates:', { x, y, rect });
    
    const clickedHelper = getHelperAtCoordinates(x, y);
    console.log('🖱️ Detected helper:', clickedHelper);
    
    if (clickedHelper) {
      handleHelperClick(clickedHelper);
    } else {
      console.log('🖱️ No helper detected at coordinates');
    }
  };

  // Handle canvas mouse move for hover effects
  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const hoveredHelperName = getHelperAtCoordinates(x, y);
    setHoveredHelper(hoveredHelperName);
    
    // Change cursor style
    canvas.style.cursor = hoveredHelperName ? 'pointer' : 'default';
  };

  // Handle helper selection (now called from both canvas and buttons)
  const handleHelperClick = (helper: string) => {
    console.log('🏘️ CommunityHelper: Helper clicked:', helper, 'Current problem:', currentProblem);
    console.log('🔍 DEBUG: Function start - isCorrect state:', isCorrect);
    console.log('🔍 DEBUG: Current problem exists:', !!currentProblem);
    console.log('🔍 DEBUG: onResult callback exists:', !!onResult);
    
    if (isCorrect === true) {
      console.log('🚫 CommunityHelper: BLOCKED - already correct, returning early');
      return; // Don't allow changes after correct answer
    }
    
    console.log('✅ DEBUG: Passed isCorrect check, proceeding...');
    
    setSelectedHelper(helper);
    console.log('✅ DEBUG: Set selected helper to:', helper);
    
    setAttempts(prev => {
      console.log('✅ DEBUG: Incrementing attempts from', prev, 'to', prev + 1);
      return prev + 1;
    });
    
    console.log('🔍 DEBUG: About to check answer comparison...');
    console.log('🔍 DEBUG: helper =', helper, 'type:', typeof helper);
    console.log('🔍 DEBUG: correctAnswer =', currentProblem?.correctAnswer, 'type:', typeof currentProblem?.correctAnswer);
    console.log('🔍 DEBUG: Strict equality check:', helper === currentProblem?.correctAnswer);
    console.log('🔍 DEBUG: currentProblem exists for comparison:', !!currentProblem);
    
    if (currentProblem && helper === currentProblem.correctAnswer) {
      console.log('🎯 CommunityHelper: CORRECT ANSWER PATH');
      console.log('🎯 CommunityHelper: Correct answer! Calling onResult with:', helper);
      setIsCorrect(true);
      if (onResult) {
        console.log('✅ DEBUG: Calling onResult for correct answer...');
        onResult(helper);
        console.log('✅ DEBUG: onResult called successfully for correct answer');
      } else {
        console.log('⚠️ CommunityHelper: onResult callback is undefined!');
      }
    } else {
      console.log('❌ CommunityHelper: WRONG ANSWER PATH');
      console.log('❌ CommunityHelper: Wrong answer. Expected:', currentProblem?.correctAnswer, 'Got:', helper);
      setIsCorrect(false);
      console.log('✅ DEBUG: Set isCorrect to false');
      
      // Always call onResult for auto-submit, regardless of correctness
      console.log('🏘️ CommunityHelper: Answer selected, calling onResult with:', helper);
      if (onResult) {
        console.log('✅ DEBUG: Calling onResult for wrong answer...');
        onResult(helper);
        console.log('✅ DEBUG: onResult called successfully for wrong answer');
      } else {
        console.log('⚠️ CommunityHelper: onResult callback is undefined!');
      }
      
      console.log('🔍 DEBUG: Checking attempts for hint - current attempts:', attempts);
      if (attempts >= 2) {
        console.log('💡 DEBUG: Setting showHint to true');
        setShowHint(true);
      }
    }
    
    console.log('🏁 DEBUG: handleHelperClick function complete');
  };

  // Play helper sound (placeholder for future audio integration)
  const playHelperSound = (helper: string) => {
    console.log('🔊 Playing sound for helper:', helper);
    if ('speechSynthesis' in window && currentProblem) {
      const helperDef = helperDefinitions[helper as keyof typeof helperDefinitions];
      if (helperDef) {
        const utterance = new SpeechSynthesisUtterance(`${helper}. ${helperDef.description}`);
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        speechSynthesis.speak(utterance);
      }
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
    <div className="w-full h-full bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-2 flex flex-col max-h-[400px]">
      {/* Header */}
      <div className="text-center mb-1">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
          🏘️ Community Helper Adventure
        </h2>
        {currentProblem && (
          <div className="flex flex-col items-center space-y-1">
            <p className="text-base text-gray-600 dark:text-gray-300">
              {currentProblem.question}
            </p>
            <div className="flex items-center space-x-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click helpers on canvas
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Helper Canvas */}
      {currentProblem && (
        <div className="flex items-center justify-center mb-1">
          <canvas
            ref={canvasRef}
            width={400}
            height={140}
            className="border-2 border-orange-200 dark:border-orange-600 rounded-lg bg-white dark:bg-gray-800 cursor-pointer"
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={() => setHoveredHelper(null)}
          />
        </div>
      )}


      {/* Note: Feedback now handled by floating Finn chatbot in parent component */}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-2 mt-auto">
        <Button
          onClick={generateNewProblem}
          className="bg-orange-500 hover:bg-orange-600 text-white flex items-center space-x-1"
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
            onClick={() => playHelperSound(currentProblem.targetHelper)}
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