// ================================================================
// RULES AND LAWS INTERACTIVE - A.1 Social Studies Tool
// Interactive tool for understanding basic rules and safety
// Assignment: Rules and laws
// ================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Check, RotateCcw, HelpCircle, Shield, AlertTriangle } from 'lucide-react';

interface RulesAndLawsInteractiveProps {
  onResult?: (result: string) => void;
  clearTrigger?: boolean;
  currentQuestion?: {
    question: string;
    answer: string;
    hint?: string;
    questionType?: string;
    targetRule?: string;
  };
}

interface Problem {
  question: string;
  correctAnswer: string;
  options: RuleOption[];
  hint: string;
  explanation: string;
  ruleType: 'traffic' | 'social' | 'safety' | 'manners';
}

interface RuleOption {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: 'traffic' | 'social' | 'safety' | 'manners';
}

export const RulesAndLawsInteractive: React.FC<RulesAndLawsInteractiveProps> = ({
  onResult,
  clearTrigger,
  currentQuestion
}) => {
  console.log('🏛️ RulesAndLawsInteractive rendered with currentQuestion:', currentQuestion);
  
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hoveredRule, setHoveredRule] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Rules and Laws scenarios with visual elements
  const ruleOptions: RuleOption[] = [
    // Traffic Safety
    { id: 'stop', name: 'stop', emoji: '🛑', description: 'red traffic light', category: 'traffic' },
    { id: 'crosswalk', name: 'crosswalk', emoji: '🚸', description: 'zebra crossing', category: 'traffic' },
    { id: 'look both ways', name: 'look both ways', emoji: '👀', description: 'check for cars', category: 'safety' },
    { id: 'seat', name: 'seat', emoji: '💺', description: 'school bus seat', category: 'safety' },
    
    // Social Rules & Manners
    { id: 'trash can', name: 'trash can', emoji: '🗑️', description: 'place for garbage', category: 'social' },
    { id: 'listen', name: 'listen', emoji: '👂', description: 'pay attention', category: 'manners' },
    { id: 'kindly', name: 'kindly', emoji: '💝', description: 'be nice to others', category: 'manners' },
    { id: 'thank you', name: 'thank you', emoji: '🙏', description: 'show gratitude', category: 'manners' },
    
    // Additional common rules
    { id: 'raise hand', name: 'raise hand', emoji: '✋', description: 'ask permission', category: 'manners' },
    { id: 'walk', name: 'walk', emoji: '🚶', description: 'don\'t run in halls', category: 'safety' },
    { id: 'quiet', name: 'quiet', emoji: '🤫', description: 'use inside voice', category: 'social' },
    { id: 'share', name: 'share', emoji: '🤝', description: 'take turns', category: 'manners' },
    
    // Community Helpers (for Social Studies scenarios)
    { id: 'firefighter', name: 'firefighter', emoji: '🚒', description: 'puts out fires', category: 'social' },
    { id: 'doctor', name: 'doctor', emoji: '👨‍⚕️', description: 'helps sick people', category: 'social' },
    { id: 'police officer', name: 'police officer', emoji: '👮', description: 'keeps people safe', category: 'social' },
    { id: 'teacher', name: 'teacher', emoji: '👨‍🏫', description: 'helps kids learn', category: 'social' },
    { id: 'chef', name: 'chef', emoji: '👨‍🍳', description: 'cooks food', category: 'social' },
    { id: 'construction worker', name: 'construction worker', emoji: '👷', description: 'builds things', category: 'social' }
  ];

  // Update problem when currentQuestion changes
  useEffect(() => {
    console.log('🏛️ Rules and Laws: currentQuestion useEffect triggered');
    
    if (currentQuestion) {
      console.log('🏛️ Rules and Laws received external question:', currentQuestion);
      generateProblemFromQuestion(currentQuestion);
    } else {
      console.log('🏛️ Rules and Laws: No external question, generating internal problem');
      generateNewProblem();
    }
  }, [currentQuestion]);

  // Generate problem from external question
  const generateProblemFromQuestion = (question: any) => {
    console.log('🏛️ Rules and Laws: Processing external question data:', question);
    
    const correctAnswer = question.answer || question.targetRule || 'stop';
    
    // Find matching rule options
    const correctOption = ruleOptions.find(opt => 
      opt.name.toLowerCase() === correctAnswer.toLowerCase() || 
      opt.id.toLowerCase() === correctAnswer.toLowerCase()
    );
    
    // Generate 3-4 options including the correct one
    const options: RuleOption[] = [correctOption].filter(Boolean) as RuleOption[];
    
    // Add 2-3 random incorrect options
    const remainingOptions = ruleOptions.filter(opt => 
      opt.id !== correctOption?.id && opt.name !== correctOption?.name
    );
    
    while (options.length < 4 && remainingOptions.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingOptions.length);
      const randomOption = remainingOptions.splice(randomIndex, 1)[0];
      options.push(randomOption);
    }
    
    // Shuffle options
    const shuffledOptions = options.sort(() => Math.random() - 0.5);
    
    const problem: Problem = {
      question: question.question || 'What should you do?',
      correctAnswer: correctAnswer,
      options: shuffledOptions,
      hint: question.hint || 'Think about what is safe and right',
      explanation: `Great! ${correctAnswer} is the right choice for following rules and staying safe.`,
      ruleType: correctOption?.category || 'safety'
    };
    
    console.log('🏛️ Rules and Laws: Generated problem from external data:', problem);
    
    setCurrentProblem(problem);
    setSelectedRule(null);
    setIsCorrect(null);
    setAttempts(0);
    setShowHint(false);
  };

  // Generate a new problem
  const generateNewProblem = () => {
    const scenarios = [
      { question: 'What should you do at a red traffic light?', answer: 'stop', type: 'traffic' },
      { question: 'Where should you walk when crossing the street?', answer: 'crosswalk', type: 'traffic' },
      { question: 'Where do you put trash?', answer: 'trash can', type: 'social' },
      { question: 'What should you do when someone is talking?', answer: 'listen', type: 'manners' },
      { question: 'How should you treat your classmates?', answer: 'kindly', type: 'manners' },
      { question: 'Where should you sit on the school bus?', answer: 'seat', type: 'safety' }
    ];
    
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    const correctOption = ruleOptions.find(opt => opt.name === scenario.answer);
    
    // Generate options
    const options: RuleOption[] = [correctOption].filter(Boolean) as RuleOption[];
    const remainingOptions = ruleOptions.filter(opt => opt.id !== correctOption?.id);
    
    while (options.length < 4) {
      const randomIndex = Math.floor(Math.random() * remainingOptions.length);
      options.push(remainingOptions.splice(randomIndex, 1)[0]);
    }
    
    const problem: Problem = {
      question: scenario.question,
      correctAnswer: scenario.answer,
      options: options.sort(() => Math.random() - 0.5),
      hint: `Think about what keeps everyone safe and happy`,
      explanation: `Perfect! ${scenario.answer} is the right choice.`,
      ruleType: scenario.type as any
    };
    
    setCurrentProblem(problem);
    setSelectedRule(null);
    setIsCorrect(null);
    setAttempts(0);
    setShowHint(false);
  };

  // Handle rule selection
  const handleRuleClick = (ruleName: string) => {
    console.log('🏛️ Rules and Laws: Rule clicked:', ruleName, 'Current problem:', currentProblem);
    
    if (isCorrect === true) return; // Don't allow changes after correct answer
    
    setSelectedRule(ruleName);
    setAttempts(prev => prev + 1);
    
    // Always call onResult for auto-submit, regardless of correctness
    console.log('🏛️ Rules and Laws: Answer selected, calling onResult with:', ruleName);
    if (onResult) {
      onResult(ruleName);
    } else {
      console.log('⚠️ Rules and Laws: onResult callback is undefined!');
    }
    
    if (currentProblem && ruleName === currentProblem.correctAnswer) {
      console.log('🎯 Rules and Laws: Correct answer!');
      setIsCorrect(true);
    } else {
      console.log('❌ Rules and Laws: Wrong answer. Expected:', currentProblem?.correctAnswer, 'Got:', ruleName);
      setIsCorrect(false);
      if (attempts >= 2) {
        setShowHint(true);
      }
    }
  };

  // Reset when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      if (!currentQuestion) {
        generateNewProblem();
      }
      setSelectedRule(null);
      setIsCorrect(null);
      setAttempts(0);
      setShowHint(false);
      console.log('🏛️ Rules and Laws Interactive cleared');
    }
  }, [clearTrigger]);

  // Draw rules canvas
  useEffect(() => {
    console.log('🎨 Canvas drawing effect triggered:', {
      hasCanvas: !!canvasRef.current,
      hasProblem: !!currentProblem,
      problemOptions: currentProblem?.options.length
    });
    
    // iOS Safari canvas fix - force redraw on layout changes
    if (canvasRef.current && /iPad|iPhone|iPod/.test(navigator.userAgent)) {
      const canvas = canvasRef.current;
      // Force Safari to recalculate canvas dimensions
      const originalDisplay = canvas.style.display;
      canvas.style.display = 'none';
      canvas.offsetHeight; // Trigger reflow
      canvas.style.display = originalDisplay || 'block';
    }
    
    const drawRules = () => {
      if (!canvasRef.current || !currentProblem) {
        console.log('🎨 Canvas drawing skipped: missing canvas or problem');
        return;
      }
    
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      console.log('🎨 Starting canvas drawing with rules:', currentProblem.options.map(r => r.name));

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background with darker color for better emoji visibility
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      console.log('🎨 Canvas background drawn with darker shade');

      // Calculate layout for rules
      const rules = currentProblem.options;
      const rulesPerRow = Math.min(4, rules.length);
      const ruleSize = 80;
      const spacing = 30;
      const totalWidth = (rulesPerRow * ruleSize) + ((rulesPerRow - 1) * spacing);
      const startX = (canvas.width - totalWidth) / 2;
      const startY = 10;

      console.log('🎨 Drawing rules with layout:', { startX, startY, ruleSize, spacing, totalWidth });

      // Draw rules
      rules.forEach((rule, index) => {
        const col = index % rulesPerRow;
        const row = Math.floor(index / rulesPerRow);
        const x = startX + (col * (ruleSize + spacing));
        const y = startY + (row * (ruleSize + spacing + 15));

        console.log(`🎨 Drawing rule ${index}: ${rule.name} at (${x}, ${y})`, rule);

        // Draw rule background with better contrast for emoji visibility
        ctx.fillStyle = selectedRule === rule.name ? '#3B82F6' : 
                       hoveredRule === rule.name ? '#F1F5F9' : '#F8FAFC';
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 2;
        
        // Draw rounded rectangle
        ctx.beginPath();
        ctx.roundRect(x, y, ruleSize, ruleSize, 10);
        ctx.fill();
        ctx.stroke();

        // Draw emoji
        ctx.font = '32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#1F2937';
        ctx.fillText(rule.emoji, x + ruleSize/2, y + ruleSize/2 - 5);

        // Draw label
        ctx.font = 'bold 11px Arial';
        ctx.fillStyle = '#374151';
        ctx.textAlign = 'center';
        ctx.fillText(rule.name, x + ruleSize/2, y + ruleSize + 15);
      });

      console.log('🎨 Canvas drawing completed');
    };
    
    const timeoutId = setTimeout(drawRules, 50);
    return () => clearTimeout(timeoutId);
  }, [currentProblem, selectedRule, hoveredRule]);

  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentProblem || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Calculate which rule was clicked
    const rules = currentProblem.options;
    const rulesPerRow = Math.min(4, rules.length);
    const ruleSize = 80;
    const spacing = 20;
    const totalWidth = (rulesPerRow * ruleSize) + ((rulesPerRow - 1) * spacing);
    const startX = (canvas.width - totalWidth) / 2;
    const startY = 20;

    rules.forEach((rule, index) => {
      const col = index % rulesPerRow;
      const row = Math.floor(index / rulesPerRow);
      const ruleX = startX + (col * (ruleSize + spacing));
      const ruleY = startY + (row * (ruleSize + spacing + 30));

      if (x >= ruleX && x <= ruleX + ruleSize && y >= ruleY && y <= ruleY + ruleSize) {
        handleRuleClick(rule.name);
      }
    });
  };

  // Handle canvas hover
  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentProblem || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Calculate which rule is being hovered
    const rules = currentProblem.options;
    const rulesPerRow = Math.min(4, rules.length);
    const ruleSize = 80;
    const spacing = 20;
    const totalWidth = (rulesPerRow * ruleSize) + ((rulesPerRow - 1) * spacing);
    const startX = (canvas.width - totalWidth) / 2;
    const startY = 20;

    let hoveredRuleName = null;
    rules.forEach((rule, index) => {
      const col = index % rulesPerRow;
      const row = Math.floor(index / rulesPerRow);
      const ruleX = startX + (col * (ruleSize + spacing));
      const ruleY = startY + (row * (ruleSize + spacing + 30));

      if (x >= ruleX && x <= ruleX + ruleSize && y >= ruleY && y <= ruleY + ruleSize) {
        hoveredRuleName = rule.name;
      }
    });

    setHoveredRule(hoveredRuleName);
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
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-2 flex flex-col max-h-[400px]">
      {/* Header */}
      <div className="text-center mb-1">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1 flex items-center justify-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Rules and Laws (A.1)
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Learning about safety and good behavior
        </p>
      </div>

      {/* Question Display */}
      {currentProblem && (
        <div className="text-center mb-1">
          <p className="text-base font-medium text-gray-800 dark:text-white">
            {currentProblem.question}
          </p>
        </div>
      )}

      {/* Rules Canvas */}
      {currentProblem && (
        <div className="flex items-center justify-center mb-1">
          <canvas
            ref={canvasRef}
            width={450}
            height={140}
            className="border-2 border-blue-200 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-800 cursor-pointer transform-gpu"
            style={{ transform: 'translateZ(0)' }}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={() => setHoveredRule(null)}
          />
        </div>
      )}

      {/* Feedback */}
      {isCorrect === true && (
        <div className="text-center mb-2">
          <div className="inline-flex items-center space-x-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-lg">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Excellent! That's the right rule to follow!</span>
          </div>
        </div>
      )}

      {isCorrect === false && (
        <div className="text-center mb-2">
          <div className="inline-flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">Try again! {attempts >= 2 ? 'Look for the hint!' : ''}</span>
          </div>
        </div>
      )}

      {/* Hint */}
      {showHint && (
        <div className="text-center mb-2">
          <div className="inline-flex items-center space-x-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-lg">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm">💡 {currentProblem?.hint}</span>
          </div>
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
      </div>
    </div>
  );
};