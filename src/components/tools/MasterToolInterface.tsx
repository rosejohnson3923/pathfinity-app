// ================================================================
// MASTER TOOL INTERFACE
// Unified interface for all educational tools with picture-in-picture framework
// Replaces individual tool implementations with standardized system
// ================================================================

import React, { useState, useEffect } from 'react';
import { X, Minimize2, Maximize2, Volume2, VolumeX, Settings, HelpCircle } from 'lucide-react';
import { LetterIdentificationInteractive } from './educational/LetterIdentificationInteractive';
import { ShapeSortingInteractive } from './educational/ShapeSortingInteractive';
import { RulesAndLawsInteractive } from './educational/RulesAndLawsInteractive';
import { CommunityHelperInteractive } from './educational/CommunityHelperInteractive';
import { ReadingComprehensionInteractive } from './educational/ReadingComprehensionInteractive';
// No longer using react-leaflet due to compatibility issues

// Tool types that can be manifested
export type ToolType = 'algebra-tiles' | 'graphing-calculator' | 'basic-calculator' | 'virtual-lab' | 'writing-studio' | 'interactive-video' | 'counting-interactive' | 'letter-identification' | 'click-sorting' | 'click-matching' | 'community-helper' | 'reading-comprehension' | 'generic';

// Assignment context for tool manifestation
export interface AssignmentContext {
  skillCode: string;
  skillName: string;
  subject: string;
  gradeLevel: string;
  difficulty: number;
  topic: string;
  learningObjective: string;
  studentId: string;
  sessionId: string;
  practiceContent?: any;
  problemData?: {
    equation: string;
    correctAnswer: string;
    problemType: string;
    hints: string[];
  };
}

// Tool configuration from Finn Orchestrator
export interface ToolConfiguration {
  toolType: ToolType;
  toolName: string;
  description: string;
  instructions: string;
  parameters: Record<string, any>;
  appearance: {
    width: number;
    height: number;
    position: 'center' | 'top-right' | 'bottom-right';
    theme: 'light' | 'dark' | 'auto';
  };
  interactions: {
    allowMinimize: boolean;
    allowFullscreen: boolean;
    allowSettings: boolean;
    autoFocus: boolean;
  };
}

// Props for the Master Tool Interface
interface MasterToolInterfaceProps {
  assignment: AssignmentContext;
  configuration: ToolConfiguration;
  isVisible: boolean;
  onClose: () => void;
  onComplete?: (results: any) => void;
  onProgress?: (progress: any) => void;
}

// ================================================================
// Reading Comprehension Wrapper Component
// Converts template questions to ReadingComprehensionInteractive format
// ================================================================
const ReadingComprehensionWrapper: React.FC<ToolComponentProps> = ({ 
  assignment, 
  configuration, 
  onInteraction, 
  onComplete, 
  toolState 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Get template questions from practiceContent
  const templateQuestions = assignment.practiceContent?.questions || [];
  
  console.log('📖 ReadingComprehensionWrapper - Assignment:', assignment);
  console.log('📖 ReadingComprehensionWrapper - Practice Content:', assignment.practiceContent);
  console.log('📖 ReadingComprehensionWrapper - Template Questions:', templateQuestions);
  
  if (templateQuestions.length === 0) {
    return (
      <div className="h-full p-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📖</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">No Reading Questions Available</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            No reading comprehension questions found in template.
          </p>
          <button 
            onClick={() => onComplete({ score: 0, attempts: 0, toolCompleted: true })}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }
  
  const currentQuestion = templateQuestions[currentQuestionIndex];
  
  // Convert template question to ReadingComprehensionInteractive format
  const convertedQuestion = {
    question: currentQuestion.question,
    answer: currentQuestion.correctAnswer,
    passage: currentQuestion.passage || currentQuestion.visual || "",
    options: currentQuestion.options || [],
    questionType: 'main_idea',
    hint: currentQuestion.hint
  };

  const handleResult = (result: string) => {
    console.log('📖 Reading comprehension result:', result);
    
    const newAnswers = [...selectedAnswers, result];
    setSelectedAnswers(newAnswers);
    setIsCorrect(result === currentQuestion.correctAnswer);
    
    if (onInteraction) {
      onInteraction({
        type: 'answer_submitted',
        questionId: currentQuestion.id,
        answer: result,
        correct: result === currentQuestion.correctAnswer,
        timestamp: new Date().toISOString()
      });
    }
    
    // Auto-advance after a delay
    setTimeout(() => {
      if (currentQuestionIndex < templateQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setIsCorrect(null);
      } else {
        // All questions completed
        const score = newAnswers.filter((ans, idx) => 
          ans === templateQuestions[idx].correctAnswer
        ).length;
        
        if (onComplete) {
          onComplete({
            score: score,
            totalQuestions: templateQuestions.length,
            percentage: Math.round((score / templateQuestions.length) * 100),
            attempts: newAnswers.length,
            toolCompleted: true,
            timestamp: new Date().toISOString()
          });
        }
      }
    }, 2000);
  };
  
  return (
    <div className="h-full p-4 bg-gray-50 dark:bg-gray-900">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {currentQuestion.customerInfo?.name || 'Reading Practice'} {currentQuestion.customerInfo?.emoji || '📖'}
        </h2>
        <span className="text-sm text-gray-600 dark:text-gray-300">
          Question {currentQuestionIndex + 1} of {templateQuestions.length}
        </span>
      </div>
      
      {currentQuestion.order && (
        <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <p className="text-blue-800 dark:text-blue-200">
            {currentQuestion.order}
          </p>
        </div>
      )}
      
      <ReadingComprehensionInteractive
        currentQuestion={convertedQuestion}
        onResult={handleResult}
        clearTrigger={false}
      />
      
      {isCorrect !== null && (
        <div className={`mt-4 p-3 rounded-lg ${
          isCorrect 
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
        }`}>
          <p className="font-semibold">
            {isCorrect 
              ? currentQuestion.feedback?.correct || 'Correct! Great reading!' 
              : currentQuestion.feedback?.incorrect || 'Not quite. Try again!'}
          </p>
        </div>
      )}
    </div>
  );
};

// ================================================================
// Algebra Tiles Wrapper Component
// Converts template questions to AlgebraTiles format
// ================================================================
const AlgebraTilesWrapper: React.FC<ToolComponentProps> = ({ 
  assignment, 
  configuration, 
  onInteraction, 
  onComplete, 
  toolState 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Get template questions from practiceContent
  const templateQuestions = assignment.practiceContent?.questions || [];
  
  console.log('🧮 AlgebraTilesWrapper - Assignment:', assignment);
  console.log('🧮 AlgebraTilesWrapper - Practice Content:', assignment.practiceContent);
  console.log('🧮 AlgebraTilesWrapper - Template Questions:', templateQuestions);
  
  if (templateQuestions.length === 0) {
    return (
      <div className="h-full p-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🧮</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">No Algebra Questions Available</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            No algebra questions found in template.
          </p>
          <button 
            onClick={() => onComplete({ score: 0, attempts: 0, toolCompleted: true })}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }
  
  const currentQuestion = templateQuestions[currentQuestionIndex];
  
  // Convert template question to AlgebraTiles format with problemData
  const convertedAssignment = {
    ...assignment,
    problemData: {
      equation: currentQuestion.expression,
      correctAnswer: currentQuestion.correctAnswer,
      problemType: currentQuestion.operationType || 'linear',
      hints: currentQuestion.steps || []
    }
  };

  const handleResult = (isCorrect: boolean, result: string) => {
    console.log('🧮 Algebra tiles result:', { isCorrect, result });
    
    const newAnswers = [...selectedAnswers, result];
    setSelectedAnswers(newAnswers);
    setIsCorrect(isCorrect);
    
    if (onInteraction) {
      onInteraction({
        type: 'answer_submitted',
        questionId: currentQuestion.id,
        answer: result,
        correct: isCorrect,
        timestamp: new Date().toISOString()
      });
    }
    
    // Auto-advance after a delay or show complete button
    setTimeout(() => {
      if (currentQuestionIndex < templateQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setIsCorrect(null);
      } else {
        // All questions completed
        const score = newAnswers.filter((ans, idx) => 
          ans === templateQuestions[idx].correctAnswer
        ).length;
        
        if (onComplete) {
          onComplete({
            score: score,
            totalQuestions: templateQuestions.length,
            percentage: Math.round((score / templateQuestions.length) * 100),
            attempts: newAnswers.length,
            toolCompleted: true,
            timestamp: new Date().toISOString()
          });
        }
      }
    }, 2000);
  };
  
  return (
    <div className="h-full p-4 bg-gray-50 dark:bg-gray-900">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {currentQuestion.customerInfo?.name || 'Algebra Practice'} {currentQuestion.customerInfo?.emoji || '🧮'}
        </h2>
        <span className="text-sm text-gray-600 dark:text-gray-300">
          Question {currentQuestionIndex + 1} of {templateQuestions.length}
        </span>
      </div>
      
      {currentQuestion.order && (
        <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <p className="text-blue-800 dark:text-blue-200">
            {currentQuestion.order}
          </p>
        </div>
      )}
      
      <AlgebraTiles
        assignment={convertedAssignment}
        configuration={configuration}
        onInteraction={onInteraction}
        onComplete={(results) => handleResult(results.isCorrect || false, results.solution || '')}
        toolState={toolState}
      />
      
      {isCorrect !== null && (
        <div className={`mt-4 p-3 rounded-lg ${
          isCorrect 
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
        }`}>
          <p className="font-semibold">
            {isCorrect 
              ? currentQuestion.feedback?.correct || 'Correct! Great algebra work!' 
              : currentQuestion.feedback?.incorrect || 'Not quite. Try again!'}
          </p>
        </div>
      )}
      
      {/* Show completion button when all questions are done */}
      {isCorrect && currentQuestionIndex === templateQuestions.length - 1 && (
        <div className="mt-4 text-center">
          <button 
            onClick={() => {
              const score = selectedAnswers.filter((ans, idx) => 
                ans === templateQuestions[idx].correctAnswer
              ).length;
              
              onComplete({
                score: score,
                totalQuestions: templateQuestions.length,
                percentage: Math.round((score / templateQuestions.length) * 100),
                attempts: selectedAnswers.length,
                toolCompleted: true,
                timestamp: new Date().toISOString()
              });
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Complete Activity ✓
          </button>
        </div>
      )}
    </div>
  );
};

export const MasterToolInterface: React.FC<MasterToolInterfaceProps> = ({
  assignment,
  configuration,
  isVisible,
  onClose,
  onComplete,
  onProgress
}) => {
  console.log('🎨 MasterToolInterface - Assignment received:', assignment);
  console.log('🎨 MasterToolInterface - Practice Content:', assignment.practiceContent);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [toolState, setToolState] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  // Initialize tool when configuration changes
  useEffect(() => {
    if (isVisible && configuration) {
      setIsLoading(true);
      // Simulate tool initialization
      setTimeout(() => {
        setIsLoading(false);
        console.log('🔧 Tool initialized:', configuration.toolType);
      }, 1000);
    }
  }, [isVisible, configuration]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [isVisible, onClose]);

  // Handle tool interactions
  const handleToolInteraction = (action: string, data?: any) => {
    console.log('🎯 Tool interaction:', action, data);
    
    // Update tool state
    setToolState(prev => ({
      ...prev,
      lastAction: action,
      lastData: data,
      timestamp: new Date()
    }));

    // Report progress to parent
    if (onProgress) {
      onProgress({
        action,
        data,
        toolState,
        assignment: assignment.skillCode
      });
    }
  };

  // Handle tool completion
  const handleComplete = (results: any) => {
    console.log('✅ Tool completed:', results);
    if (onComplete) {
      onComplete({
        ...results,
        assignment: assignment.skillCode,
        toolType: configuration.toolType,
        completedAt: new Date()
      });
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={(e) => {
        // Close when clicking on overlay background
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600 overflow-hidden transition-all duration-300 transform hover:scale-105 ${
          isFullscreen 
            ? 'w-full h-full animate-slideInUp' 
            : isMinimized 
              ? 'w-80 h-12 animate-slideInDown' 
              : 'w-full max-w-6xl h-full max-h-[95vh] animate-slideInUp'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tool Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold">🔧</span>
            </div>
            <div>
              <h3 className="font-semibold text-sm">{configuration.toolName}</h3>
              {!isMinimized && (
                <p className="text-xs opacity-90">{assignment.skillName}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            
            {configuration.interactions.allowSettings && (
              <button
                onClick={() => handleToolInteraction('settings')}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={() => handleToolInteraction('help')}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
              title="Help"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            
            {configuration.interactions.allowMinimize && (
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                title={isMinimized ? 'Restore' : 'Minimize'}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            )}
            
            {configuration.interactions.allowFullscreen && (
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tool Content */}
        {!isMinimized && (
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="h-96 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
                <div className="text-center">
                  {/* Enhanced Loading Animation */}
                  <div className="relative mb-6">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-gray-600 mx-auto"></div>
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                  </div>
                  
                  {/* Tool Icon */}
                  <div className="text-4xl mb-4 animate-pulse">
                    {configuration.toolType === 'algebra-tiles' && '🧮'}
                    {configuration.toolType === 'graphing-calculator' && '📊'}
                    {configuration.toolType === 'basic-calculator' && '🔢'}
                    {configuration.toolType === 'virtual-lab' && '🧪'}
                    {configuration.toolType === 'writing-studio' && '✍️'}
                    {configuration.toolType === 'interactive-video' && '🎥'}
                    {configuration.toolType === 'counting-interactive' && '🔢'}
                    {configuration.toolType === 'generic' && '🔧'}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
                    Loading {configuration.toolName}...
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Preparing your learning experience
                  </p>
                  
                  {/* Progress Dots */}
                  <div className="flex justify-center space-x-1 mt-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="min-h-[400px] animate-fadeIn">
                <ToolRenderer
                  toolType={configuration.toolType}
                  assignment={assignment}
                  configuration={configuration}
                  onInteraction={handleToolInteraction}
                  onComplete={handleComplete}
                  toolState={toolState}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ================================================================
// TOOL RENDERER
// Renders the appropriate tool based on type
// ================================================================

interface ToolRendererProps {
  toolType: ToolType;
  assignment: AssignmentContext;
  configuration: ToolConfiguration;
  onInteraction: (action: string, data?: any) => void;
  onComplete: (results: any) => void;
  toolState: any;
}

export const ToolRenderer: React.FC<ToolRendererProps> = ({
  toolType,
  assignment,
  configuration,
  onInteraction,
  onComplete,
  toolState
}) => {
  // Check if this is an MCP-discovered tool with iframe configuration
  // BUT respect template-specified tool types (like counting-interactive)
  const isMCPTool = configuration.parameters?.launchUrl && configuration.parameters?.integrationMethod === 'iframe';
  const hasTemplateToolType = ['counting-interactive', 'algebra-tiles', 'graphing-calculator', 'virtual-lab', 'writing-studio'].includes(toolType);
  
  if (isMCPTool && !hasTemplateToolType) {
    return (
      <MCPIframeTool
        assignment={assignment}
        configuration={configuration}
        onInteraction={onInteraction}
        onComplete={onComplete}
        toolState={toolState}
      />
    );
  }
  
  switch (toolType) {
    case 'algebra-tiles':
      return (
        <AlgebraTilesWrapper
          assignment={assignment}
          configuration={configuration}
          onInteraction={onInteraction}
          onComplete={onComplete}
          toolState={toolState}
        />
      );
    
    case 'graphing-calculator':
      return (
        <GraphingCalculator
          assignment={assignment}
          configuration={configuration}
          onInteraction={onInteraction}
          onComplete={onComplete}
          toolState={toolState}
        />
      );
    
    case 'virtual-lab':
      return (
        <VirtualLab
          assignment={assignment}
          configuration={configuration}
          onInteraction={onInteraction}
          onComplete={onComplete}
          toolState={toolState}
        />
      );
    
    case 'writing-studio':
      return (
        <WritingStudio
          assignment={assignment}
          configuration={configuration}
          onInteraction={onInteraction}
          onComplete={onComplete}
          toolState={toolState}
        />
      );
    
    case 'basic-calculator':
      return (
        <BasicCalculator
          assignment={assignment}
          configuration={configuration}
          onInteraction={onInteraction}
          onComplete={onComplete}
          toolState={toolState}
        />
      );
    
    case 'interactive-video':
      return (
        <InteractiveVideo
          assignment={assignment}
          configuration={configuration}
          onInteraction={onInteraction}
          onComplete={onComplete}
          toolState={toolState}
        />
      );
    
    case 'counting-interactive':
      return (
        <CountingInteractive
          assignment={assignment}
          configuration={configuration}
          onInteraction={onInteraction}
          onComplete={onComplete}
          toolState={toolState}
        />
      );
    
    case 'letter-identification':
      return (
        <LetterIdentificationWrapper
          assignment={assignment}
          configuration={configuration}
          onInteraction={onInteraction}
          onComplete={onComplete}
          toolState={toolState}
        />
      );
    
    case 'click-sorting':
      return (
        <ShapeSortingWrapper
          assignment={assignment}
          configuration={configuration}
          onInteraction={onInteraction}
          onComplete={onComplete}
          toolState={toolState}
        />
      );
    
    case 'click-matching':
      return (
        <RulesAndLawsWrapper
          assignment={assignment}
          configuration={configuration}
          onInteraction={onInteraction}
          onComplete={onComplete}
          toolState={toolState}
        />
      );
    
    case 'community-helper':
      return (
        <CommunityHelperWrapper
          assignment={assignment}
          configuration={configuration}
          onInteraction={onInteraction}
          onComplete={onComplete}
          toolState={toolState}
        />
      );
    
    case 'reading-comprehension':
      return (
        <ReadingComprehensionWrapper
          assignment={assignment}
          configuration={configuration}
          onInteraction={onInteraction}
          onComplete={onComplete}
          toolState={toolState}
        />
      );
    
    default:
      return (
        <GenericTool
          assignment={assignment}
          configuration={configuration}
          onInteraction={onInteraction}
          onComplete={onComplete}
          toolState={toolState}
        />
      );
  }
};

// ================================================================
// ALGEBRA TILES IMPLEMENTATION
// Primary tool for mathematical concepts
// ================================================================

interface ToolComponentProps {
  assignment: AssignmentContext;
  configuration: ToolConfiguration;
  onInteraction: (action: string, data?: any) => void;
  onComplete: (results: any) => void;
  toolState: any;
}

const AlgebraTiles: React.FC<ToolComponentProps> = ({
  assignment,
  configuration,
  onInteraction,
  onComplete,
  toolState
}) => {
  const [tiles, setTiles] = useState<any[]>([]);
  const [workspace, setWorkspace] = useState<any[]>([]);
  const [currentProblem, setCurrentProblem] = useState<string>('');
  const [feedback, setFeedback] = useState<{
    message: string;
    isCorrect: boolean;
    solution?: string;
  } | null>(null);
  const [attempts, setAttempts] = useState<number>(0);
  const [completedProblems, setCompletedProblems] = useState<string[]>([]);
  const [problemSet, setProblemSet] = useState<string[]>([]);

  useEffect(() => {
    // Initialize algebra tiles based on assignment
    const problemType = assignment.topic?.toLowerCase() || '';
    
    // If problemData has an equation, use only that (single problem mode for wrapper)
    if (assignment.problemData?.equation) {
      const singleProblem = assignment.problemData.equation;
      console.log('🧮 AlgebraTiles: Using single problem from wrapper:', singleProblem);
      setProblemSet([singleProblem]);
      setCurrentProblem(singleProblem);
      initializeLinearEquationTiles();
    } else if (problemType.includes('linear') || problemType.includes('equation')) {
      // Default multi-problem mode
      const problems = ['2x + 3 = 7', 'x + 4 = 9', '3x - 2 = 10'];
      setProblemSet(problems);
      setCurrentProblem(problems[0]);
      initializeLinearEquationTiles();
    } else if (problemType.includes('quadratic')) {
      const problems = ['x² + 2x + 1 = 0', 'x² - 4 = 0', 'x² + 3x + 2 = 0'];
      setProblemSet(problems);
      setCurrentProblem(problems[0]);
      initializeQuadraticTiles();
    } else {
      const problems = ['x + 2 = 5', 'x - 1 = 3', '2x = 8'];
      setProblemSet(problems);
      setCurrentProblem(problems[0]);
      initializeBasicTiles();
    }
  }, [assignment]);

  // Reset workspace when problem changes (for wrapper mode)
  useEffect(() => {
    if (assignment.problemData?.equation) {
      console.log('🧮 AlgebraTiles: Problem changed, clearing workspace');
      setWorkspace([]);
      setFeedback(null);
      setAttempts(0);
      setCompletedProblems([]);
      // Reset tiles to initial state
      initializeLinearEquationTiles();
    }
  }, [assignment.problemData?.equation]);

  const initializeLinearEquationTiles = () => {
    setTiles([
      { id: 'x-pos', type: 'variable', value: 'x', color: 'blue', count: 5 },
      { id: 'unit-pos', type: 'unit', value: '1', color: 'green', count: 10 },
      { id: 'x-neg', type: 'variable', value: '-x', color: 'red', count: 5 },
      { id: 'unit-neg', type: 'unit', value: '-1', color: 'orange', count: 10 }
    ]);
  };

  const initializeQuadraticTiles = () => {
    setTiles([
      { id: 'x2-pos', type: 'quadratic', value: 'x²', color: 'purple', count: 3 },
      { id: 'x-pos', type: 'variable', value: 'x', color: 'blue', count: 8 },
      { id: 'unit-pos', type: 'unit', value: '1', color: 'green', count: 15 },
      { id: 'x2-neg', type: 'quadratic', value: '-x²', color: 'pink', count: 3 },
      { id: 'x-neg', type: 'variable', value: '-x', color: 'red', count: 8 },
      { id: 'unit-neg', type: 'unit', value: '-1', color: 'orange', count: 15 }
    ]);
  };

  const initializeBasicTiles = () => {
    setTiles([
      { id: 'x-pos', type: 'variable', value: 'x', color: 'blue', count: 3 },
      { id: 'unit-pos', type: 'unit', value: '1', color: 'green', count: 8 },
      { id: 'x-neg', type: 'variable', value: '-x', color: 'red', count: 3 },
      { id: 'unit-neg', type: 'unit', value: '-1', color: 'orange', count: 8 }
    ]);
  };

  const handleTileClick = (tile: any) => {
    if (tile.count > 0) {
      // Add tile to workspace
      setWorkspace(prev => [...prev, { ...tile, id: Date.now() }]);
      
      // Decrease available count
      setTiles(prev => prev.map(t => 
        t.id === tile.id ? { ...t, count: t.count - 1 } : t
      ));
      
      onInteraction('tile-placed', { tile: tile.value, workspace: workspace.length + 1 });
    }
  };

  const handleWorkspaceClick = (index: number) => {
    const removedTile = workspace[index];
    
    // Remove from workspace
    setWorkspace(prev => prev.filter((_, i) => i !== index));
    
    // Return to available tiles
    setTiles(prev => prev.map(t => 
      t.id === removedTile.id ? { ...t, count: t.count + 1 } : t
    ));
    
    onInteraction('tile-removed', { tile: removedTile.value, workspace: workspace.length - 1 });
  };

  const checkSolution = () => {
    // Algebra tiles solution checking logic
    const xTiles = workspace.filter(t => t.value === 'x').length;
    const unitTiles = workspace.filter(t => t.value === '1').length;
    const negXTiles = workspace.filter(t => t.value === '-x').length;
    const negUnitTiles = workspace.filter(t => t.value === '-1').length;
    
    const netX = xTiles - negXTiles;
    const netUnits = unitTiles - negUnitTiles;
    
    const currentAttempts = attempts + 1;
    setAttempts(currentAttempts);
    
    // Check if solution is correct based on modeling the final isolated form
    let isCorrect = false;
    let expectedSolution = '';
    let expectedTiles = { x: 0, units: 0 };
    
    if (currentProblem === 'x + 2 = 5') {
      // Use correct answer from assignment context
      expectedSolution = assignment.problemData?.correctAnswer || 'x = 3';
      expectedTiles = { x: 1, units: 3 };
      isCorrect = netX === 1 && netUnits === 3;
      console.log('🔍 Problem validation:', { 
        currentProblem, 
        expectedSolution, 
        assignmentProblemData: assignment.problemData,
        studentAnswer: `x = ${netUnits}`,
        netX, 
        netUnits,
        isCorrect 
      });
    } else if (currentProblem === 'x - 1 = 3') {
      // Solution: x = 4, so student should have 1 x-tile and 4 unit tiles (representing x = 4)
      expectedTiles = { x: 1, units: 4 };
      expectedSolution = 'x = 4';
      isCorrect = netX === 1 && netUnits === 4;
    } else if (currentProblem === '2x + 3 = 7') {
      // Solution: x = 2, so student should have 1 x-tile and 2 unit tiles (representing x = 2)
      expectedTiles = { x: 1, units: 2 };
      expectedSolution = 'x = 2';
      isCorrect = netX === 1 && netUnits === 2;
    } else if (currentProblem === 'x + 4 = 9') {
      // Solution: x = 5, so student should have 1 x-tile and 5 unit tiles (representing x = 5)
      expectedTiles = { x: 1, units: 5 };
      expectedSolution = 'x = 5';
      isCorrect = netX === 1 && netUnits === 5;
    } else if (currentProblem === '3x - 2 = 10') {
      // Solution: x = 4, so student should have 1 x-tile and 4 unit tiles (representing x = 4)
      expectedTiles = { x: 1, units: 4 };
      expectedSolution = 'x = 4';
      isCorrect = netX === 1 && netUnits === 4;
    } else if (currentProblem === '2x = 8') {
      // Solution: x = 4, so student should have 1 x-tile and 4 unit tiles (representing x = 4)
      expectedTiles = { x: 1, units: 4 };
      expectedSolution = 'x = 4';
      isCorrect = netX === 1 && netUnits === 4;
    } else if (currentProblem === 'x + 3 = 7') {
      // Solution: x = 4, so student should have 1 x-tile and 4 unit tiles (representing x = 4)
      expectedTiles = { x: 1, units: 4 };
      expectedSolution = 'x = 4';
      isCorrect = netX === 1 && netUnits === 4;
    } else if (currentProblem === '2x - 5 = 9') {
      // Solution: x = 7, so student should have 1 x-tile and 7 unit tiles (representing x = 7)
      expectedTiles = { x: 1, units: 7 };
      expectedSolution = 'x = 7';
      isCorrect = netX === 1 && netUnits === 7;
    } else if (currentProblem === '3x + 4 = 19') {
      // Solution: x = 5, so student should have 1 x-tile and 5 unit tiles (representing x = 5)
      expectedTiles = { x: 1, units: 5 };
      expectedSolution = 'x = 5';
      isCorrect = netX === 1 && netUnits === 5;
    } else if (currentProblem === '4x - 7 = 5') {
      // Solution: x = 3, so student should have 1 x-tile and 3 unit tiles (representing x = 3)
      expectedTiles = { x: 1, units: 3 };
      expectedSolution = 'x = 3';
      isCorrect = netX === 1 && netUnits === 3;
    } else if (currentProblem === 's + 4 = 9') {
      // Solution: s = 5, so student should have 1 x-tile and 5 unit tiles (representing s = 5)
      expectedTiles = { x: 1, units: 5 };
      expectedSolution = 's = 5';
      isCorrect = netX === 1 && netUnits === 5;
    } else if (currentProblem === '2r - 3 = 11') {
      // Solution: r = 7, so student should have 1 x-tile and 7 unit tiles (representing r = 7)
      expectedTiles = { x: 1, units: 7 };
      expectedSolution = 'r = 7';
      isCorrect = netX === 1 && netUnits === 7;
    } else if (currentProblem === 'c + 8 = 15') {
      // Solution: c = 7, so student should have 1 x-tile and 7 unit tiles (representing c = 7)
      expectedTiles = { x: 1, units: 7 };
      expectedSolution = 'c = 7';
      isCorrect = netX === 1 && netUnits === 7;
    } else if (currentProblem === '3t - 6 = 12') {
      // Solution: t = 6, so student should have 1 x-tile and 6 unit tiles (representing t = 6)
      expectedTiles = { x: 1, units: 6 };
      expectedSolution = 't = 6';
      isCorrect = netX === 1 && netUnits === 6;
    }
    
    if (isCorrect) {
      setFeedback({
        message: `🎉 Correct! ${expectedSolution}`,
        isCorrect: true,
        solution: expectedSolution
      });
      
      // Mark problem as completed
      setCompletedProblems(prev => {
        const newCompleted = [...prev, currentProblem];
        
        // Check if all problems are completed OR if in single problem mode (wrapper)
        if (newCompleted.length === problemSet.length || (problemSet.length === 1 && assignment.problemData?.equation)) {
          // All problems completed or single problem mode - call onComplete after a delay
          setTimeout(() => {
            onComplete({
              score: newCompleted.length,
              totalQuestions: problemSet.length,
              percentage: 100,
              attempts: currentAttempts,
              toolCompleted: true,
              isCorrect: true,
              solution: expectedSolution,
              timestamp: new Date().toISOString()
            });
          }, 2000);
        }
        
        return newCompleted;
      });
      
      onInteraction('solution-correct', { 
        problem: currentProblem, 
        attempts: currentAttempts,
        tilesUsed: workspace.length 
      });
    } else {
      const studentSolution = netX !== 0 ? `x = ${netUnits / (netX || 1)}` : 'Invalid equation';
      setFeedback({
        message: `❌ Not quite right. You got ${studentSolution}, but the answer is ${expectedSolution}. Try to isolate x by having ${expectedTiles.x} x-tile and ${expectedTiles.units} unit tiles.`,
        isCorrect: false,
        solution: expectedSolution
      });
      
      onInteraction('solution-incorrect', { 
        problem: currentProblem, 
        attempts: currentAttempts,
        studentAnswer: studentSolution,
        correctAnswer: expectedSolution
      });
    }
  };

  const nextProblem = () => {
    const currentIndex = problemSet.indexOf(currentProblem);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < problemSet.length) {
      setCurrentProblem(problemSet[nextIndex]);
      setWorkspace([]);
      setFeedback(null);
      setAttempts(0);
      // Reset tile counts
      setTiles(prev => prev.map(t => ({ 
        ...t, 
        count: t.type === 'quadratic' ? 3 : t.type === 'variable' ? 5 : 10 
      })));
    } else {
      // All problems completed
      onComplete({
        isCorrect: true,
        completedProblems: completedProblems.length + 1,
        totalProblems: problemSet.length,
        totalAttempts: attempts,
        allProblemsComplete: true
      });
    }
  };

  const tryAgain = () => {
    setFeedback(null);
    setWorkspace([]);
    // Reset tile counts
    setTiles(prev => prev.map(t => ({ 
      ...t, 
      count: t.type === 'quadratic' ? 3 : t.type === 'variable' ? 5 : 10 
    })));
  };

  return (
    <div className="h-full p-4 bg-gray-50 dark:bg-gray-900">
      {/* Problem Statement */}
      <div className="mb-4 text-center">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Solve using Algebra Tiles
        </h4>
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 rounded-lg py-2 px-4 inline-block">
          {currentProblem}
        </div>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Problem {problemSet.indexOf(currentProblem) + 1} of {problemSet.length} | Attempts: {attempts}
        </div>
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 italic">
          Isolate x by placing tiles to show the final solution (e.g., x = 2 means 1 x-tile and 2 unit tiles)
        </div>
      </div>

      {/* Feedback Display */}
      {feedback && (
        <div className={`mb-4 p-4 rounded-lg ${
          feedback.isCorrect 
            ? 'bg-green-100 border border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-200' 
            : 'bg-red-100 border border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <p className="font-medium">{feedback.message}</p>
            <div className="flex space-x-2">
              {feedback.isCorrect && problemSet.indexOf(currentProblem) < problemSet.length - 1 && (
                <button
                  onClick={nextProblem}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                >
                  Next Problem
                </button>
              )}
              {!feedback.isCorrect && (
                <button
                  onClick={tryAgain}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        {/* Tile Palette */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Available Tiles</h5>
          <div className="grid grid-cols-2 gap-2">
            {tiles.map((tile) => (
              <button
                key={tile.id}
                onClick={() => handleTileClick(tile)}
                disabled={tile.count === 0}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  tile.count > 0 
                    ? `bg-${tile.color}-100 border-${tile.color}-300 hover:bg-${tile.color}-200 text-${tile.color}-800 cursor-pointer` 
                    : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="text-lg font-bold">{tile.value}</div>
                <div className="text-sm">x{tile.count}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Workspace */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Workspace</h5>
          <div className="min-h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4">
            {workspace.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                Place tiles here to show your solution (e.g., for x = 2, place 1 x-tile and 2 unit tiles)
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {workspace.map((tile, index) => (
                  <button
                    key={`workspace-${index}`}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', index.toString());
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
                      const dropIndex = index;
                      
                      if (draggedIndex !== dropIndex) {
                        const newWorkspace = [...workspace];
                        const [draggedTile] = newWorkspace.splice(draggedIndex, 1);
                        newWorkspace.splice(dropIndex, 0, draggedTile);
                        setWorkspace(newWorkspace);
                        
                        onInteraction('tile-moved', {
                          from: draggedIndex,
                          to: dropIndex,
                          tile: draggedTile.value
                        });
                      }
                    }}
                    onClick={() => handleWorkspaceClick(index)}
                    className={`p-2 rounded border-2 bg-${tile.color}-100 border-${tile.color}-300 text-${tile.color}-800 text-sm font-bold hover:bg-${tile.color}-200 transition-colors cursor-move`}
                    title="Click to remove, drag to move"
                  >
                    {tile.value}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                setWorkspace([]);
                setTiles(prev => prev.map(t => ({ ...t, count: t.type === 'quadratic' ? 3 : t.type === 'variable' ? (currentProblem.includes('quadratic') ? 8 : 5) : (currentProblem.includes('quadratic') ? 15 : 10) })));
                onInteraction('workspace-cleared');
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
            
            <button
              onClick={checkSolution}
              disabled={workspace.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Check Solution
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================================================================
// TOOL IMPLEMENTATIONS
// ================================================================

const BasicCalculator: React.FC<ToolComponentProps> = ({
  assignment,
  configuration,
  onInteraction,
  onComplete,
  toolState
}) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showSteps, setShowSteps] = useState(false);
  const [currentStep, setCurrentStep] = useState('');

  const inputNumber = (num: string) => {
    onInteraction(`number-input-${num}`);
    
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    onInteraction('decimal-input');
    
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    onInteraction('clear');
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setCurrentStep('');
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);
    const operationSymbol = operation || nextOperation;
    
    if (previousValue === null) {
      setPreviousValue(inputValue);
      setCurrentStep(`${inputValue} ${operationSymbol}`);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);
      
      const calculation = `${currentValue} ${operation} ${inputValue} = ${newValue}`;
      setHistory([...history, calculation]);
      setCurrentStep(calculation);
      
      setDisplay(String(newValue));
      setPreviousValue(newValue);
      
      onInteraction(`operation-${operation}-result-${newValue}`);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
    
    // Check if this completes the assignment
    if (nextOperation === '=' && assignment.problemData?.correctAnswer) {
      const result = String(previousValue || inputValue);
      if (result === assignment.problemData.correctAnswer) {
        onComplete({
          success: true,
          result: result,
          steps: history,
          timeSpent: Date.now() - startTime
        });
      }
    }
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '%':
        return firstValue % secondValue;
      default:
        return secondValue;
    }
  };

  const [startTime] = useState(Date.now());

  return (
    <div className="basic-calculator-container max-w-md mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
      <div className="calculator-header mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Basic Calculator
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {assignment.skillName}
        </p>
      </div>

      {/* Problem Display */}
      {assignment.problemData?.equation && (
        <div className="problem-display mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Solve: {assignment.problemData.equation}
          </p>
        </div>
      )}

      {/* Calculator Display */}
      <div className="calculator-display mb-4">
        <div className="display-main bg-gray-900 text-white p-4 rounded text-right text-2xl font-mono min-h-[60px] flex items-center justify-end">
          {display}
        </div>
        {currentStep && (
          <div className="display-step text-sm text-gray-600 dark:text-gray-400 mt-1 text-right">
            {currentStep}
          </div>
        )}
      </div>

      {/* Calculator Buttons */}
      <div className="calculator-buttons grid grid-cols-4 gap-2">
        {/* Row 1 */}
        <button
          onClick={clear}
          className="btn-calculator bg-red-500 hover:bg-red-600 text-white p-3 rounded font-semibold col-span-2"
        >
          Clear
        </button>
        <button
          onClick={() => performOperation('%')}
          className="btn-calculator bg-gray-500 hover:bg-gray-600 text-white p-3 rounded font-semibold"
        >
          %
        </button>
        <button
          onClick={() => performOperation('÷')}
          className="btn-calculator bg-orange-500 hover:bg-orange-600 text-white p-3 rounded font-semibold"
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          onClick={() => inputNumber('7')}
          className="btn-calculator bg-gray-700 hover:bg-gray-600 text-white p-3 rounded font-semibold"
        >
          7
        </button>
        <button
          onClick={() => inputNumber('8')}
          className="btn-calculator bg-gray-700 hover:bg-gray-600 text-white p-3 rounded font-semibold"
        >
          8
        </button>
        <button
          onClick={() => inputNumber('9')}
          className="btn-calculator bg-gray-700 hover:bg-gray-600 text-white p-3 rounded font-semibold"
        >
          9
        </button>
        <button
          onClick={() => performOperation('×')}
          className="btn-calculator bg-orange-500 hover:bg-orange-600 text-white p-3 rounded font-semibold"
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          onClick={() => inputNumber('4')}
          className="btn-calculator bg-gray-700 hover:bg-gray-600 text-white p-3 rounded font-semibold"
        >
          4
        </button>
        <button
          onClick={() => inputNumber('5')}
          className="btn-calculator bg-gray-700 hover:bg-gray-600 text-white p-3 rounded font-semibold"
        >
          5
        </button>
        <button
          onClick={() => inputNumber('6')}
          className="btn-calculator bg-gray-700 hover:bg-gray-600 text-white p-3 rounded font-semibold"
        >
          6
        </button>
        <button
          onClick={() => performOperation('-')}
          className="btn-calculator bg-orange-500 hover:bg-orange-600 text-white p-3 rounded font-semibold"
        >
          -
        </button>

        {/* Row 4 */}
        <button
          onClick={() => inputNumber('1')}
          className="btn-calculator bg-gray-700 hover:bg-gray-600 text-white p-3 rounded font-semibold"
        >
          1
        </button>
        <button
          onClick={() => inputNumber('2')}
          className="btn-calculator bg-gray-700 hover:bg-gray-600 text-white p-3 rounded font-semibold"
        >
          2
        </button>
        <button
          onClick={() => inputNumber('3')}
          className="btn-calculator bg-gray-700 hover:bg-gray-600 text-white p-3 rounded font-semibold"
        >
          3
        </button>
        <button
          onClick={() => performOperation('+')}
          className="btn-calculator bg-orange-500 hover:bg-orange-600 text-white p-3 rounded font-semibold"
        >
          +
        </button>

        {/* Row 5 */}
        <button
          onClick={() => inputNumber('0')}
          className="btn-calculator bg-gray-700 hover:bg-gray-600 text-white p-3 rounded font-semibold col-span-2"
        >
          0
        </button>
        <button
          onClick={inputDecimal}
          className="btn-calculator bg-gray-700 hover:bg-gray-600 text-white p-3 rounded font-semibold"
        >
          .
        </button>
        <button
          onClick={() => performOperation('=')}
          className="btn-calculator bg-green-500 hover:bg-green-600 text-white p-3 rounded font-semibold"
        >
          =
        </button>
      </div>

      {/* History Toggle */}
      {history.length > 0 && (
        <div className="calculator-history mt-4">
          <button
            onClick={() => setShowSteps(!showSteps)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showSteps ? 'Hide' : 'Show'} Calculation Steps
          </button>
          
          {showSteps && (
            <div className="history-display mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded max-h-24 overflow-y-auto">
              {history.map((calc, index) => (
                <div key={index} className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                  {calc}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hints for 7th-8th Grade */}
      {assignment.problemData?.hints && (
        <div className="calculator-hints mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 rounded">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-semibold mb-2">
            💡 Hints:
          </p>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside">
            {assignment.problemData.hints.map((hint, index) => (
              <li key={index}>{hint}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const GraphingCalculator: React.FC<ToolComponentProps> = ({
  assignment,
  configuration,
  onInteraction,
  onComplete,
  toolState
}) => {
  const [functions, setFunctions] = useState<string[]>(['']);
  const [activeFunction, setActiveFunction] = useState<number>(0);
  const [currentExpression, setCurrentExpression] = useState<string>('');
  const [plotData, setPlotData] = useState<any[]>([]);
  const [viewWindow, setViewWindow] = useState({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 });
  const [calculatorMode, setCalculatorMode] = useState<'function' | 'equation' | 'intersection'>('function');
  const [feedback, setFeedback] = useState<{
    message: string;
    isCorrect: boolean;
    analysis?: string;
  } | null>(null);

  // Initialize based on assignment
  useEffect(() => {
    const topic = assignment.topic.toLowerCase();
    if (topic.includes('quadratic')) {
      setFunctions(['x^2', 'x^2 + 2*x + 1']);
      setCalculatorMode('function');
    } else if (topic.includes('linear')) {
      setFunctions(['2*x + 1', 'x - 3']);
      setCalculatorMode('function');
    } else if (topic.includes('exponential')) {
      setFunctions(['2^x', '3^x']);
      setCalculatorMode('function');
    } else {
      setFunctions(['x^2']);
      setCalculatorMode('function');
    }
  }, [assignment]);

  // Generate plot data for a function
  const generatePlotData = (functionStr: string) => {
    const data = [];
    const step = (viewWindow.xMax - viewWindow.xMin) / 200;
    
    for (let x = viewWindow.xMin; x <= viewWindow.xMax; x += step) {
      try {
        // Simple function evaluation (this would use a proper math parser in production)
        let y = evaluateFunction(functionStr, x);
        if (isFinite(y) && y >= viewWindow.yMin && y <= viewWindow.yMax) {
          data.push({ x, y });
        }
      } catch (error) {
        // Skip invalid points
      }
    }
    return data;
  };

  // Simple function evaluator (placeholder - would use proper math library)
  const evaluateFunction = (expr: string, x: number): number => {
    // Replace x with the numeric value
    let evaluation = expr.replace(/x/g, x.toString());
    
    // Handle basic functions
    evaluation = evaluation.replace(/\^/g, '**');
    evaluation = evaluation.replace(/sin/g, 'Math.sin');
    evaluation = evaluation.replace(/cos/g, 'Math.cos');
    evaluation = evaluation.replace(/tan/g, 'Math.tan');
    evaluation = evaluation.replace(/log/g, 'Math.log10');
    evaluation = evaluation.replace(/ln/g, 'Math.log');
    
    try {
      return eval(evaluation);
    } catch {
      return NaN;
    }
  };

  const handleFunctionChange = (index: number, value: string) => {
    const newFunctions = [...functions];
    newFunctions[index] = value;
    setFunctions(newFunctions);
    
    // Update plot data
    const newPlotData = generatePlotData(value);
    setPlotData(newPlotData);
    
    onInteraction('function-changed', { function: value, index });
  };

  const addFunction = () => {
    setFunctions([...functions, '']);
    onInteraction('function-added', { totalFunctions: functions.length + 1 });
  };

  const removeFunction = (index: number) => {
    const newFunctions = functions.filter((_, i) => i !== index);
    setFunctions(newFunctions);
    onInteraction('function-removed', { index });
  };

  const analyzeFunction = () => {
    const currentFunc = functions[activeFunction];
    if (!currentFunc) return;

    let analysis = '';
    let isCorrect = false;

    // Basic analysis based on assignment
    if (assignment.topic.toLowerCase().includes('quadratic')) {
      if (currentFunc.includes('x^2') || currentFunc.includes('x**2')) {
        analysis = '✅ Quadratic function detected. This is a parabola.';
        isCorrect = true;
      } else {
        analysis = '❌ This doesn\'t appear to be a quadratic function. Try using x^2.';
      }
    } else if (assignment.topic.toLowerCase().includes('linear')) {
      if (currentFunc.includes('x') && !currentFunc.includes('x^2')) {
        analysis = '✅ Linear function detected. This creates a straight line.';
        isCorrect = true;
      } else {
        analysis = '❌ This doesn\'t appear to be a linear function. Try using mx + b form.';
      }
    } else {
      analysis = `Function "${currentFunc}" has been plotted successfully.`;
      isCorrect = true;
    }

    setFeedback({ message: analysis, isCorrect, analysis });
    
    onInteraction('function-analyzed', { 
      function: currentFunc, 
      analysis,
      isCorrect 
    });
  };

  const completeAssignment = () => {
    onComplete({
      isCorrect: true,
      functionsExplored: functions.length,
      finalFunction: functions[activeFunction],
      analysis: feedback?.analysis || 'Function exploration completed'
    });
  };

  return (
    <div className="h-full p-4 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Graphing Calculator
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Assignment: {assignment.skillName}
        </p>
      </div>

      {/* Feedback Display */}
      {feedback && (
        <div className={`mb-4 p-3 rounded-lg ${
          feedback.isCorrect 
            ? 'bg-green-100 border border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-200' 
            : 'bg-yellow-100 border border-yellow-300 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-200'
        }`}>
          <p className="font-medium">{feedback.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        {/* Function Input Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Function Input</h5>
          
          {functions.map((func, index) => (
            <div key={index} className="mb-3 flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                f{index + 1}(x) =
              </span>
              <input
                type="text"
                value={func}
                onChange={(e) => handleFunctionChange(index, e.target.value)}
                onFocus={() => setActiveFunction(index)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter function (e.g., x^2 + 2*x + 1)"
              />
              {functions.length > 1 && (
                <button
                  onClick={() => removeFunction(index)}
                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          
          <div className="flex space-x-2 mt-4">
            <button
              onClick={addFunction}
              className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
            >
              Add Function
            </button>
            <button
              onClick={analyzeFunction}
              className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
            >
              Analyze
            </button>
          </div>
        </div>

        {/* Graph Display */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Graph</h5>
          
          {/* Simple coordinate system visualization */}
          <div className="relative w-full h-64 bg-gray-100 dark:bg-gray-700 rounded border">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Function: {functions[activeFunction] || 'No function'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Interactive plotting coming soon
                </p>
              </div>
            </div>
            
            {/* Coordinate axes */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-px bg-gray-400 dark:bg-gray-500"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-px h-full bg-gray-400 dark:bg-gray-500"></div>
            </div>
          </div>

          {/* Window Controls */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">X Range:</label>
              <div className="flex space-x-1">
                <input
                  type="number"
                  value={viewWindow.xMin}
                  onChange={(e) => setViewWindow(prev => ({ ...prev, xMin: Number(e.target.value) }))}
                  className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  value={viewWindow.xMax}
                  onChange={(e) => setViewWindow(prev => ({ ...prev, xMax: Number(e.target.value) }))}
                  className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Y Range:</label>
              <div className="flex space-x-1">
                <input
                  type="number"
                  value={viewWindow.yMin}
                  onChange={(e) => setViewWindow(prev => ({ ...prev, yMin: Number(e.target.value) }))}
                  className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  value={viewWindow.yMax}
                  onChange={(e) => setViewWindow(prev => ({ ...prev, yMax: Number(e.target.value) }))}
                  className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => {
            setFunctions(['']);
            setFeedback(null);
            onInteraction('calculator-cleared');
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Clear All
        </button>
        
        <button
          onClick={completeAssignment}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Complete Assignment
        </button>
      </div>
    </div>
  );
};

const VirtualLab: React.FC<ToolComponentProps> = ({
  assignment,
  configuration,
  onInteraction,
  onComplete,
  toolState
}) => {
  const [selectedChemicals, setSelectedChemicals] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<{ [key: string]: boolean }>({
    'beaker': false,
    'test-tube': false,
    'bunsen-burner': false,
    'thermometer': false,
    'pH-strips': false
  });
  const [experimentStep, setExperimentStep] = useState<number>(0);
  const [observations, setObservations] = useState<string>('');
  const [results, setResults] = useState<{
    reaction: string;
    color: string;
    temperature: number;
    pH: number;
    safety: boolean;
  } | null>(null);
  const [feedback, setFeedback] = useState<{
    message: string;
    isCorrect: boolean;
    safety?: string;
  } | null>(null);

  const availableChemicals = [
    { id: 'hcl', name: 'Hydrochloric Acid (HCl)', danger: 'high', color: 'clear' },
    { id: 'naoh', name: 'Sodium Hydroxide (NaOH)', danger: 'high', color: 'clear' },
    { id: 'h2o', name: 'Water (H₂O)', danger: 'none', color: 'clear' },
    { id: 'phenol', name: 'Phenolphthalein Indicator', danger: 'low', color: 'clear' },
    { id: 'nacl', name: 'Sodium Chloride (NaCl)', danger: 'none', color: 'white' },
    { id: 'cuso4', name: 'Copper Sulfate (CuSO₄)', danger: 'medium', color: 'blue' }
  ];

  const experimentSteps = [
    'Put on safety equipment',
    'Select appropriate glassware',
    'Measure chemicals carefully',
    'Combine reactants slowly',
    'Observe reaction',
    'Record observations',
    'Clean up safely'
  ];

  useEffect(() => {
    // Initialize based on assignment type
    const topic = assignment.topic.toLowerCase();
    if (topic.includes('acid') || topic.includes('base')) {
      setSelectedChemicals(['hcl', 'naoh', 'phenol']);
    } else if (topic.includes('reaction')) {
      setSelectedChemicals(['cuso4', 'h2o']);
    }
  }, [assignment]);

  const handleChemicalSelect = (chemicalId: string) => {
    if (selectedChemicals.includes(chemicalId)) {
      setSelectedChemicals(prev => prev.filter(id => id !== chemicalId));
    } else {
      setSelectedChemicals(prev => [...prev, chemicalId]);
    }
    onInteraction('chemical-selected', { chemical: chemicalId, selected: !selectedChemicals.includes(chemicalId) });
  };

  const handleEquipmentSelect = (equipmentId: string) => {
    setEquipment(prev => ({
      ...prev,
      [equipmentId]: !prev[equipmentId]
    }));
    onInteraction('equipment-selected', { equipment: equipmentId, selected: !equipment[equipmentId] });
  };

  const runExperiment = () => {
    // Safety check
    const hasProtection = equipment['beaker'] || equipment['test-tube'];
    if (!hasProtection) {
      setFeedback({
        message: '⚠️ Safety Alert: Please select appropriate glassware before starting the experiment.',
        isCorrect: false,
        safety: 'Always use proper glassware for chemical reactions.'
      });
      return;
    }

    // Simulate chemical reaction
    let reaction = '';
    let color = 'clear';
    let temperature = 25;
    let pH = 7;
    let isCorrect = false;

    if (selectedChemicals.includes('hcl') && selectedChemicals.includes('naoh')) {
      reaction = 'Acid-base neutralization: HCl + NaOH → NaCl + H₂O';
      color = selectedChemicals.includes('phenol') ? 'pink' : 'clear';
      temperature = 35; // Exothermic reaction
      pH = 7; // Neutral
      isCorrect = true;
    } else if (selectedChemicals.includes('cuso4') && selectedChemicals.includes('h2o')) {
      reaction = 'Dissolution: CuSO₄ + H₂O → Cu²⁺ + SO₄²⁻';
      color = 'blue';
      temperature = 22; // Slight cooling
      pH = 5; // Slightly acidic
      isCorrect = true;
    } else {
      reaction = 'No significant reaction observed';
      color = 'clear';
      temperature = 25;
      pH = 7;
    }

    setResults({ reaction, color, temperature, pH, safety: hasProtection });

    if (isCorrect) {
      setFeedback({
        message: `✅ Excellent! You've successfully demonstrated ${reaction.split(':')[0]}. The solution turned ${color} and the temperature changed to ${temperature}°C.`,
        isCorrect: true
      });
    } else {
      setFeedback({
        message: '❌ This combination doesn\'t produce a significant reaction. Try selecting different chemicals.',
        isCorrect: false
      });
    }

    onInteraction('experiment-run', { 
      chemicals: selectedChemicals, 
      equipment,
      results: { reaction, color, temperature, pH },
      isCorrect 
    });
  };

  const recordObservation = () => {
    if (!observations.trim()) {
      setFeedback({
        message: '📝 Please write your observations in the text area before recording.',
        isCorrect: false
      });
      return;
    }

    onInteraction('observation-recorded', { observation: observations });
    setFeedback({
      message: '📋 Observation recorded successfully!',
      isCorrect: true
    });
  };

  const completeExperiment = () => {
    onComplete({
      isCorrect: true,
      chemicalsUsed: selectedChemicals.length,
      equipmentUsed: Object.values(equipment).filter(Boolean).length,
      observations,
      results,
      safetyCompliance: results?.safety || false
    });
  };

  return (
    <div className="h-full p-4 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Virtual Chemistry Lab
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Assignment: {assignment.skillName}
        </p>
        <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded">
          ⚠️ Safety First: Always follow proper lab procedures
        </div>
      </div>

      {/* Feedback Display */}
      {feedback && (
        <div className={`mb-4 p-3 rounded-lg ${
          feedback.isCorrect 
            ? 'bg-green-100 border border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-200' 
            : 'bg-red-100 border border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200'
        }`}>
          <p className="font-medium">{feedback.message}</p>
          {feedback.safety && (
            <p className="text-sm mt-1 italic">{feedback.safety}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        {/* Lab Setup Panel */}
        <div className="space-y-4">
          {/* Chemical Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Available Chemicals</h5>
            <div className="space-y-2">
              {availableChemicals.map((chemical) => (
                <div key={chemical.id} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={chemical.id}
                    checked={selectedChemicals.includes(chemical.id)}
                    onChange={() => handleChemicalSelect(chemical.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={chemical.id} className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                    {chemical.name}
                  </label>
                  <span className={`text-xs px-2 py-1 rounded ${
                    chemical.danger === 'high' ? 'bg-red-100 text-red-800' :
                    chemical.danger === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    chemical.danger === 'low' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {chemical.danger === 'none' ? 'Safe' : chemical.danger}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Equipment Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Lab Equipment</h5>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(equipment).map(([item, selected]) => (
                <button
                  key={item}
                  onClick={() => handleEquipmentSelect(item)}
                  className={`p-2 rounded text-sm transition-colors ${
                    selected 
                      ? 'bg-blue-100 border-2 border-blue-500 text-blue-800 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-200' 
                      : 'bg-gray-100 border-2 border-gray-300 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                  }`}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Experiment Panel */}
        <div className="space-y-4">
          {/* Reaction Chamber */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Reaction Chamber</h5>
            <div className="relative w-full h-32 bg-gray-100 dark:bg-gray-700 rounded border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="absolute inset-0 flex items-center justify-center">
                {results ? (
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full border-4 border-gray-400 mx-auto mb-2 ${
                      results.color === 'blue' ? 'bg-blue-400' :
                      results.color === 'pink' ? 'bg-pink-400' :
                      results.color === 'clear' ? 'bg-gray-200' :
                      'bg-gray-200'
                    }`}></div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {results.temperature}°C | pH: {results.pH}
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <div className="text-2xl mb-1">🧪</div>
                    <p className="text-sm">Ready for experiment</p>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={runExperiment}
              disabled={selectedChemicals.length === 0}
              className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Run Experiment
            </button>
          </div>

          {/* Observations */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Lab Notes</h5>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Record your observations here..."
              className="w-full h-20 p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
            <button
              onClick={recordObservation}
              className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
            >
              Record Observation
            </button>
          </div>
        </div>
      </div>

      {/* Results Display */}
      {results && (
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4">
          <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Experiment Results</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">Reaction:</p>
              <p className="text-gray-600 dark:text-gray-400">{results.reaction}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">Color Change:</p>
              <p className="text-gray-600 dark:text-gray-400">{results.color}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">Temperature:</p>
              <p className="text-gray-600 dark:text-gray-400">{results.temperature}°C</p>
            </div>
            <div>
              <p className="font-medium text-gray-700 dark:text-gray-300">pH Level:</p>
              <p className="text-gray-600 dark:text-gray-400">{results.pH}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => {
            setSelectedChemicals([]);
            setEquipment({ 'beaker': false, 'test-tube': false, 'bunsen-burner': false, 'thermometer': false, 'pH-strips': false });
            setResults(null);
            setObservations('');
            setFeedback(null);
            onInteraction('lab-reset');
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Reset Lab
        </button>
        
        <button
          onClick={completeExperiment}
          disabled={!results}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Complete Experiment
        </button>
      </div>
    </div>
  );
};

const WritingStudio: React.FC<ToolComponentProps> = ({
  assignment,
  configuration,
  onInteraction,
  onComplete,
  toolState
}) => {
  const [writingStage, setWritingStage] = useState<'planning' | 'drafting' | 'revising' | 'editing'>('planning');
  const [outline, setOutline] = useState({
    thesis: '',
    mainPoints: ['', '', ''],
    conclusion: ''
  });
  const [essay, setEssay] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [feedback, setFeedback] = useState<{
    message: string;
    suggestions: string[];
    score: number;
  } | null>(null);
  const [aiAssistance, setAiAssistance] = useState<{
    prompt: string;
    response: string;
  } | null>(null);

  const essayTypes = {
    'persuasive': {
      structure: ['Introduction with hook', 'Thesis statement', 'Body paragraph 1', 'Body paragraph 2', 'Body paragraph 3', 'Conclusion'],
      prompts: ['What is your main argument?', 'What evidence supports your position?', 'What counterarguments exist?']
    },
    'narrative': {
      structure: ['Setting', 'Characters', 'Rising action', 'Climax', 'Falling action', 'Resolution'],
      prompts: ['What is the main conflict?', 'Who are the key characters?', 'What is the turning point?']
    },
    'expository': {
      structure: ['Introduction', 'Main idea 1', 'Main idea 2', 'Main idea 3', 'Conclusion'],
      prompts: ['What are you explaining?', 'What are the key points?', 'What examples support your explanation?']
    }
  };

  const currentEssayType = assignment.topic.toLowerCase().includes('persuasive') ? 'persuasive' : 
                          assignment.topic.toLowerCase().includes('narrative') ? 'narrative' : 'expository';

  useEffect(() => {
    const words = essay.split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [essay]);

  const handleOutlineChange = (field: string, value: string, index?: number) => {
    if (field === 'mainPoints' && index !== undefined) {
      const newMainPoints = [...outline.mainPoints];
      newMainPoints[index] = value;
      setOutline(prev => ({ ...prev, mainPoints: newMainPoints }));
    } else {
      setOutline(prev => ({ ...prev, [field]: value }));
    }
    onInteraction('outline-updated', { field, value, index });
  };

  const generateAIAssistance = (prompt: string) => {
    // Simulate AI assistance (in production, this would call an AI service)
    const responses = {
      'help with thesis': 'A strong thesis statement should clearly state your main argument and preview your supporting points. Try to be specific and take a clear position.',
      'improve introduction': 'Start with a compelling hook - a statistic, question, or anecdote. Then provide background information and end with your thesis statement.',
      'strengthen conclusion': 'Restate your thesis in new words, summarize your main points, and end with a call to action or thought-provoking statement.',
      'fix grammar': 'Check for common errors: subject-verb agreement, comma usage, and sentence fragments. Read your work aloud to catch awkward phrasing.',
      'word choice': 'Use specific, concrete words instead of vague terms. Consider the connotation of words and choose ones that support your tone and purpose.'
    };

    const response = responses[prompt.toLowerCase()] || 'I can help you with thesis statements, introductions, conclusions, grammar, and word choice. What specific area would you like assistance with?';
    
    setAiAssistance({ prompt, response });
    onInteraction('ai-assistance-requested', { prompt, response });
  };

  const analyzeWriting = () => {
    if (!essay.trim()) {
      setFeedback({
        message: 'Please write your essay before requesting analysis.',
        suggestions: ['Start with your outline', 'Write a strong introduction', 'Develop your main points'],
        score: 0
      });
      return;
    }

    // Simple analysis (in production, this would use advanced NLP)
    const sentences = essay.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = essay.split(/\s+/).length / sentences.length;
    const hasIntroduction = essay.toLowerCase().includes('introduction') || essay.length > 100;
    const hasConclusion = essay.toLowerCase().includes('conclusion') || essay.split('\n').length > 3;
    
    let score = 0;
    const suggestions = [];

    if (wordCount >= 100) score += 20;
    else suggestions.push('Develop your ideas more fully - aim for at least 100 words');

    if (avgSentenceLength >= 10 && avgSentenceLength <= 25) score += 20;
    else suggestions.push('Vary your sentence length for better flow');

    if (hasIntroduction) score += 20;
    else suggestions.push('Add a clear introduction with a thesis statement');

    if (hasConclusion) score += 20;
    else suggestions.push('Include a strong conclusion that wraps up your argument');

    if (outline.thesis.trim()) score += 20;
    else suggestions.push('Complete your thesis statement in the outline');

    const message = score >= 80 ? '🎉 Excellent work! Your essay is well-structured and engaging.' :
                   score >= 60 ? '👍 Good effort! A few improvements will make this even stronger.' :
                   score >= 40 ? '📝 You\'re on the right track. Focus on the suggested improvements.' :
                   '💪 Keep working! Use the outline and suggestions to strengthen your essay.';

    setFeedback({ message, suggestions, score });
    onInteraction('writing-analyzed', { score, suggestions: suggestions.length, wordCount });
  };

  const generateOutlineFromEssay = () => {
    if (!essay.trim()) return;

    // Extract potential thesis from first paragraph
    const firstParagraph = essay.split('\n')[0] || '';
    const potentialThesis = firstParagraph.split('.')[0] || '';
    
    // Extract main points from paragraph starts
    const paragraphs = essay.split('\n').filter(p => p.trim().length > 0);
    const mainPoints = paragraphs.slice(1, 4).map(p => p.split('.')[0].substring(0, 100)) || ['', '', ''];
    
    setOutline({
      thesis: potentialThesis.substring(0, 200),
      mainPoints: mainPoints.slice(0, 3),
      conclusion: 'Restate thesis and summarize main points'
    });

    onInteraction('outline-generated', { source: 'essay' });
  };

  const completeWriting = () => {
    onComplete({
      isCorrect: true,
      wordCount,
      outline,
      essay,
      writingStage,
      feedback: feedback?.score || 0,
      aiAssistanceUsed: aiAssistance !== null
    });
  };

  return (
    <div className="h-full p-4 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Writing Studio
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Assignment: {assignment.skillName} | Type: {currentEssayType} | Words: {wordCount}
        </p>
      </div>

      {/* Writing Stage Tabs */}
      <div className="mb-4 flex space-x-2">
        {(['planning', 'drafting', 'revising', 'editing'] as const).map((stage) => (
          <button
            key={stage}
            onClick={() => setWritingStage(stage)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              writingStage === stage
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {stage.charAt(0).toUpperCase() + stage.slice(1)}
          </button>
        ))}
      </div>

      {/* Feedback Display */}
      {feedback && (
        <div className={`mb-4 p-3 rounded-lg ${
          feedback.score >= 80
            ? 'bg-green-100 border border-green-300 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-200'
            : feedback.score >= 60
            ? 'bg-yellow-100 border border-yellow-300 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-200'
            : 'bg-red-100 border border-red-300 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200'
        }`}>
          <p className="font-medium">{feedback.message}</p>
          <p className="text-sm mt-1">Score: {feedback.score}/100</p>
          {feedback.suggestions.length > 0 && (
            <ul className="text-sm mt-2 list-disc list-inside">
              {feedback.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        {/* Left Panel - Stage Content */}
        <div className="space-y-4">
          {writingStage === 'planning' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Essay Outline</h5>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Thesis Statement
                  </label>
                  <textarea
                    value={outline.thesis}
                    onChange={(e) => handleOutlineChange('thesis', e.target.value)}
                    placeholder="What is your main argument or point?"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-20 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Main Points
                  </label>
                  {outline.mainPoints.map((point, index) => (
                    <textarea
                      key={index}
                      value={point}
                      onChange={(e) => handleOutlineChange('mainPoints', e.target.value, index)}
                      placeholder={`Main point ${index + 1}`}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-16 resize-none mb-2"
                    />
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Conclusion
                  </label>
                  <textarea
                    value={outline.conclusion}
                    onChange={(e) => handleOutlineChange('conclusion', e.target.value)}
                    placeholder="How will you wrap up your argument?"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-16 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {writingStage === 'drafting' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Essay Draft</h5>
              <textarea
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder="Write your essay here..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-80 resize-none"
              />
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-gray-500">Words: {wordCount}</span>
                <button
                  onClick={generateOutlineFromEssay}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  Generate Outline
                </button>
              </div>
            </div>
          )}

          {(writingStage === 'revising' || writingStage === 'editing') && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
                {writingStage === 'revising' ? 'Review & Revise' : 'Final Edit'}
              </h5>
              <textarea
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-64 resize-none"
              />
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={analyzeWriting}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                >
                  Analyze Writing
                </button>
                <button
                  onClick={() => generateAIAssistance('improve introduction')}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                >
                  Get AI Help
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - AI Assistant & Tools */}
        <div className="space-y-4">
          {/* AI Assistant */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-3">AI Writing Assistant</h5>
            
            {aiAssistance ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">You asked:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{aiAssistance.prompt}"</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">AI suggests:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{aiAssistance.response}</p>
                </div>
                <button
                  onClick={() => setAiAssistance(null)}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Clear response
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get help with specific aspects of your writing:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {['Help with thesis', 'Improve introduction', 'Strengthen conclusion', 'Fix grammar', 'Word choice'].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => generateAIAssistance(prompt)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm text-left dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Writing Guidelines */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
              {currentEssayType.charAt(0).toUpperCase() + currentEssayType.slice(1)} Essay Structure
            </h5>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {essayTypes[currentEssayType].structure.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="font-medium text-blue-600 dark:text-blue-400 mr-2">{index + 1}.</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>

          {/* Writing Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Progress</h5>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Word Count</span>
                <span>{wordCount}/500</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((wordCount / 500) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p>✓ Outline: {outline.thesis ? 'Complete' : 'In progress'}</p>
                <p>✓ Draft: {essay.length > 100 ? 'Complete' : 'In progress'}</p>
                <p>✓ Review: {feedback ? 'Complete' : 'Pending'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => {
            setEssay('');
            setOutline({ thesis: '', mainPoints: ['', '', ''], conclusion: '' });
            setFeedback(null);
            setAiAssistance(null);
            setWritingStage('planning');
            onInteraction('writing-reset');
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Start Over
        </button>
        
        <button
          onClick={completeWriting}
          disabled={!essay.trim() || wordCount < 50}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Submit Essay
        </button>
      </div>
    </div>
  );
};


const InteractiveVideo: React.FC<ToolComponentProps> = ({ assignment, onInteraction, onComplete }) => {
  const [currentPhase, setCurrentPhase] = useState<'video' | 'practice' | 'assessment'>('video');
  const [videoProgress, setVideoProgress] = useState(0);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const challenges = [
    {
      question: "What are the coordinates for New York City?",
      target: { lat: 40.7, lng: -74.0 },
      tolerance: 2,
      hint: "Remember: NYC is about 40°N, 74°W"
    },
    {
      question: "Find the coordinates for Los Angeles",
      target: { lat: 34.0, lng: -118.2 },
      tolerance: 2,
      hint: "LA is on the west coast, about 34°N, 118°W"
    },
    {
      question: "Locate Chicago using latitude and longitude",
      target: { lat: 41.9, lng: -87.6 },
      tolerance: 2,
      hint: "Chicago is in the Midwest, about 42°N, 88°W"
    }
  ];

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedCoords({ lat: Math.round(lat * 10) / 10, lng: Math.round(lng * 10) / 10 });
    setAttempts(attempts + 1);
    
    const challenge = challenges[currentChallenge];
    const distance = Math.sqrt(
      Math.pow(lat - challenge.target.lat, 2) + 
      Math.pow(lng - challenge.target.lng, 2)
    );
    
    if (distance <= challenge.tolerance) {
      setScore(score + 1);
      onInteraction('coordinate-correct', { 
        challenge: currentChallenge, 
        attempts: attempts + 1,
        coordinates: { lat, lng }
      });
      
      if (currentChallenge < challenges.length - 1) {
        setTimeout(() => setCurrentChallenge(currentChallenge + 1), 1000);
      } else {
        setTimeout(() => {
          onComplete({
            score: Math.round((score + 1) / challenges.length * 100),
            attempts: attempts + 1,
            challengesCompleted: challenges.length
          });
        }, 1000);
      }
    } else {
      onInteraction('coordinate-incorrect', { 
        challenge: currentChallenge, 
        attempts: attempts + 1,
        coordinates: { lat, lng },
        target: challenge.target
      });
    }
  };

  return (
    <div className="h-full p-4 bg-blue-50 dark:bg-blue-900">
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
          🌍 Latitude & Longitude Learning Tool
        </h4>
        <p className="text-blue-700 dark:text-blue-300 text-sm">
          {assignment.skillName} - Learn about coordinates with video and practice
        </p>
      </div>

      {/* Phase Navigation */}
      <div className="mb-6">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setCurrentPhase('video')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentPhase === 'video' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📹 Watch & Learn
          </button>
          <button
            onClick={() => setCurrentPhase('practice')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentPhase === 'practice' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🎯 Practice
          </button>
          <button
            onClick={() => setCurrentPhase('assessment')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentPhase === 'assessment' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            ✅ Assessment
          </button>
        </div>
      </div>

      {/* Video Learning Phase */}
      {currentPhase === 'video' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h5 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Learn About Latitude & Longitude
          </h5>
          
          <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg mb-4">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/FEKFRV29Sk4"
              title="Latitude and Longitude | Using Coordinates to Find Places on a Map"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            ></iframe>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <h6 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Key Concepts to Remember:</h6>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• <strong>Latitude:</strong> Horizontal lines that measure north-south position (0° to 90°)</li>
                <li>• <strong>Longitude:</strong> Vertical lines that measure east-west position (0° to 180°)</li>
                <li>• <strong>Coordinates:</strong> Written as (Latitude, Longitude) - e.g., (40.7°N, 74.0°W)</li>
                <li>• <strong>Prime Meridian:</strong> 0° longitude line passing through Greenwich, England</li>
                <li>• <strong>Equator:</strong> 0° latitude line dividing Earth into Northern and Southern hemispheres</li>
              </ul>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={() => setCurrentPhase('practice')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Ready to Practice! 🎯
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Practice Phase */}
      {currentPhase === 'practice' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Practice Area */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6">
            <h5 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Practice with Coordinates
            </h5>
            
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                  Challenge {currentChallenge + 1} of {challenges.length}
                </p>
                <p className="text-yellow-700 dark:text-yellow-300 mt-2">
                  {challenges[currentChallenge].question}
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  💡 Hint: {challenges[currentChallenge].hint}
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Latitude (°N)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="25"
                      max="50"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., 40.7"
                      value={selectedCoords?.lat || ''}
                      onChange={(e) => setSelectedCoords({
                        lat: parseFloat(e.target.value) || 0,
                        lng: selectedCoords?.lng || 0
                      })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Longitude (°W)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="-125"
                      max="-65"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., -74.0"
                      value={selectedCoords?.lng || ''}
                      onChange={(e) => setSelectedCoords({
                        lat: selectedCoords?.lat || 0,
                        lng: parseFloat(e.target.value) || 0
                      })}
                    />
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    if (selectedCoords) {
                      handleMapClick(selectedCoords.lat, selectedCoords.lng);
                    }
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  disabled={!selectedCoords}
                >
                  Submit Answer
                </button>
              </div>
            </div>
          </div>
          
          {/* Progress Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
            <h6 className="font-semibold text-gray-900 dark:text-white mb-4">Progress</h6>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 dark:bg-green-900 rounded">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✅ Correct: {score}/{challenges.length}
                </p>
              </div>
              
              <div className="p-3 bg-orange-50 dark:bg-orange-900 rounded">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  🎯 Attempts: {attempts}
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  📍 Remember: Use the format (Latitude°N, Longitude°W)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assessment Phase */}
      {currentPhase === 'assessment' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <h5 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Assessment: Test Your Knowledge
          </h5>
          
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
              Great job learning about latitude and longitude!
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You scored {score} out of {challenges.length} in the practice section.
            </p>
            
            <button
              onClick={() => {
                onComplete({
                  score: Math.round((score / challenges.length) * 100),
                  attempts: attempts,
                  challengesCompleted: challenges.length,
                  videoWatched: true,
                  practiceCompleted: true
                });
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Complete Activity ✅
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const MCPIframeTool: React.FC<ToolComponentProps> = ({ assignment, configuration, onComplete, onInteraction }) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [toolData, setToolData] = useState<any>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(true);
  
  const launchUrl = configuration.parameters?.launchUrl || 'https://tools.pathfinity.com/launch/A.0';
  
  // Use working demo tool as fallback since external URL is down
  const fallbackUrl = 'https://www.geogebra.org/scientific?embed=true&showToolBar=false&showAlgebraInput=false&showMenuBar=false&borderColor=transparent&enableRightClick=false&showFullscreenButton=false&showResetIcon=false&showZoomButtons=false';
  
  // Build iframe URL - use embedded version directly for cleaner interface
  const iframeUrl = fallbackUrl;
  
  useEffect(() => {
    // Extract tool data from configuration for debugging
    setToolData({
      discoveredTool: {
        id: configuration.parameters?.id || 'unknown',
        name: configuration.parameters?.name || configuration.toolName,
        description: configuration.parameters?.description || configuration.description,
        launchUrl: launchUrl,
        integrationMethod: configuration.parameters?.integrationMethod || 'iframe',
        capabilities: configuration.parameters?.capabilities || {},
        metrics: configuration.parameters?.metrics || {},
        safety: configuration.parameters?.safety || {}
      },
      assignment: {
        skillCode: assignment.skillCode,
        skillName: assignment.skillName,
        subject: assignment.subject,
        gradeLevel: assignment.gradeLevel
      }
    });
  }, [configuration, assignment]);
  
  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      {/* MCP Tool Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🌐</div>
          <div>
            <h4 className="text-lg font-semibold">MCP-Discovered Tool</h4>
            <p className="text-sm opacity-90">
              {configuration.toolName} • Discovered via Model Context Protocol
            </p>
          </div>
        </div>
      </div>
      
      {/* Tool Content */}
      <div className="flex flex-col h-full p-4">
        {/* Debug Info Panel - Collapsible */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg mb-4">
          <div className="flex items-center justify-between p-3">
            <h5 className="font-semibold text-blue-900 dark:text-blue-200">🔍 MCP Discovery Success (Demo Mode)</h5>
            <button 
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
            >
              {showDebugInfo ? 'Hide' : 'Show'} Details
            </button>
          </div>
          {showDebugInfo && (
            <div className="px-3 pb-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-700 dark:text-gray-300">
              <div>
                <p><span className="font-semibold text-blue-800 dark:text-blue-300">Tool ID:</span> {toolData?.discoveredTool?.id}</p>
                <p><span className="font-semibold text-blue-800 dark:text-blue-300">Source:</span> MCP Discovery</p>
                <p><span className="font-semibold text-orange-600 dark:text-orange-400">Demo URL:</span> GeoGebra Calculator</p>
              </div>
              <div>
                <p><span className="font-semibold text-blue-800 dark:text-blue-300">Assignment:</span> {toolData?.assignment?.skillName}</p>
                <p><span className="font-semibold text-blue-800 dark:text-blue-300">Grade Level:</span> {toolData?.assignment?.gradeLevel}</p>
                <p><span className="font-semibold text-blue-800 dark:text-blue-300">Subject:</span> {toolData?.assignment?.subject}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Iframe Container - Balanced sizing */}
        <div className="flex-1 h-[600px] rounded-lg overflow-hidden relative">
          {!iframeLoaded && !iframeError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading MCP tool...</p>
              </div>
            </div>
          )}
          
          {iframeError && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20">
              <div className="text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <p className="text-red-600 dark:text-red-400 mb-4">
                  Unable to load the MCP-discovered tool
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  URL: {iframeUrl}
                </p>
                <button
                  onClick={() => {
                    setIframeError(false);
                    setIframeLoaded(false);
                  }}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
          
          <iframe
            src={iframeUrl}
            className="w-full h-full border-0"
            title={`MCP Tool: ${configuration.toolName}`}
            onLoad={() => {
              setIframeLoaded(true);
              onInteraction?.('mcp-tool-loaded', { url: iframeUrl });
            }}
            onError={() => {
              setIframeError(true);
              onInteraction?.('mcp-tool-error', { url: iframeUrl });
            }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            allow="fullscreen; microphone; camera"
            style={{ 
              width: '100%',
              height: '600px',
              border: 'none',
              background: 'transparent'
            }}
          />
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-4">
          <button
            onClick={() => {
              console.log('🔧 Full MCP Tool Data:', toolData);
              onInteraction?.('mcp-debug-logged', toolData);
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            🔍 Debug Info
          </button>
          <button
            onClick={() => {
              onComplete({
                status: 'completed',
                method: 'mcp_discovery',
                toolId: toolData?.discoveredTool?.id,
                launchUrl: launchUrl,
                results: { message: 'MCP tool session completed', toolUsed: configuration.toolName }
              });
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            ✅ Complete Session
          </button>
        </div>
      </div>
    </div>
  );
};

// ================================================================
// COUNTING INTERACTIVE COMPONENT
// Displays emoji-based counting scenarios from Experience templates
// ================================================================

const CountingInteractive: React.FC<ToolComponentProps> = ({ 
  assignment, 
  configuration, 
  onInteraction, 
  onComplete, 
  toolState 
}) => {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Get template questions from practiceContent
  const templateQuestions = assignment.practiceContent?.questions || [];
  
  console.log('🔢 CountingInteractive - Assignment:', assignment);
  console.log('🔢 CountingInteractive - Practice Content:', assignment.practiceContent);
  console.log('🔢 CountingInteractive - Template Questions:', templateQuestions);
  
  if (templateQuestions.length === 0) {
    return (
      <div className="h-full p-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔢</div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Counting Practice</h4>
          <p className="text-gray-600 dark:text-gray-400">No counting scenarios available</p>
        </div>
      </div>
    );
  }

  const currentScenario = templateQuestions[currentScenarioIndex];
  
  const handleItemClick = (itemIndex: number) => {
    if (showFeedback) return; // Don't allow clicks during feedback
    
    setSelectedItems(prev => {
      if (prev.includes(itemIndex)) {
        // Deselect item
        return prev.filter(i => i !== itemIndex);
      } else {
        // Select item
        return [...prev, itemIndex];
      }
    });
  };

  const handleSubmit = () => {
    const selectedCount = selectedItems.length;
    const correct = selectedCount === currentScenario.correctAnswer;
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // Report interaction
    onInteraction?.({
      action: 'counting-attempt',
      data: {
        scenario: currentScenario.id,
        selected: selectedCount,
        correct: currentScenario.correctAnswer,
        isCorrect: correct
      },
      timestamp: new Date()
    });

    // Auto-advance after feedback
    setTimeout(() => {
      if (correct && currentScenarioIndex < templateQuestions.length - 1) {
        // Move to next scenario
        setCurrentScenarioIndex(prev => prev + 1);
        setSelectedItems([]);
        setShowFeedback(false);
        setIsCorrect(null);
      } else if (correct && currentScenarioIndex === templateQuestions.length - 1) {
        // All scenarios completed
        onComplete?.({
          action: 'counting-completed',
          results: { scenariosCompleted: templateQuestions.length },
          timestamp: new Date()
        });
      } else {
        // Try again
        setShowFeedback(false);
        setSelectedItems([]);
        setIsCorrect(null);
      }
    }, 2000);
  };

  return (
    <div className="h-full p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Scenario {currentScenarioIndex + 1} of {templateQuestions.length}
          </p>
        </div>

        {/* Request & Career Context Box */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-start space-x-4">
            <span className="text-3xl">{currentScenario.customerInfo?.emoji || '👤'}</span>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {currentScenario.customerInfo?.name || 'Customer'}
                </span>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg p-4">
                <div className="mb-3">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Request</span>
                  <p className="text-blue-700 dark:text-blue-300 font-medium mt-1">
                    {currentScenario.question}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Career Context</span>
                  <p className="text-purple-700 dark:text-purple-300 font-medium mt-1">
                    {(() => {
                      // Extract career context (first part before "Find")
                      const parts = currentScenario.instruction.split('!');
                      return parts[0] + '!';
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Action Box - Prominent */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-2xl p-6 mb-6 shadow-lg border-2 border-green-300 dark:border-green-700">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {(() => {
                // Extract user action (part with "Find")
                const parts = currentScenario.instruction.split('!');
                const findPart = parts.find(p => p.includes('Find')) || parts[parts.length - 1];
                return findPart.trim() + '!';
              })()}
            </p>
          </div>
        </div>

        {/* Interactive Items */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
            {currentScenario.visual?.map((item: string, index: number) => (
              <button
                key={index}
                onClick={() => handleItemClick(index)}
                className={`
                  text-4xl p-4 rounded-xl transition-all duration-200 transform hover:scale-110
                  ${selectedItems.includes(index) 
                    ? 'bg-blue-200 dark:bg-blue-700 scale-110 shadow-lg' 
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                  ${showFeedback ? 'pointer-events-none' : 'cursor-pointer'}
                `}
                disabled={showFeedback}
              >
                {item}
              </button>
            ))}
          </div>
          
          <div className="text-center mt-6">
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
              Selected: {selectedItems.length}
            </p>
            
            {!showFeedback && (
              <button
                onClick={handleSubmit}
                disabled={selectedItems.length === 0}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            )}
          </div>
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`rounded-2xl p-6 text-center shadow-lg ${
            isCorrect 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
          }`}>
            <div className="text-3xl mb-2">
              {isCorrect ? '🎉' : '🤔'}
            </div>
            <p className="text-lg font-semibold mb-2">
              {isCorrect ? currentScenario.feedback?.correct : currentScenario.feedback?.incorrect}
            </p>
            {!isCorrect && currentScenario.hint && (
              <p className="text-sm">
                💡 Hint: {currentScenario.hint}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ================================================================
// LETTER IDENTIFICATION WRAPPER COMPONENT
// Displays letter identification scenarios from Experience templates
// ================================================================
const LetterIdentificationWrapper: React.FC<ToolComponentProps> = ({ 
  assignment, 
  configuration, 
  onInteraction, 
  onComplete, 
  toolState 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Get template questions from practiceContent
  const templateQuestions = assignment.practiceContent?.questions || [];
  
  console.log('🔤 LetterIdentificationWrapper - Assignment:', assignment);
  console.log('🔤 LetterIdentificationWrapper - Practice Content:', assignment.practiceContent);
  console.log('🔤 LetterIdentificationWrapper - Template Questions:', templateQuestions);
  
  if (templateQuestions.length === 0) {
    return (
      <div className="h-full p-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔤</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">No Letter Questions Available</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            No letter identification questions found in template.
          </p>
          <button 
            onClick={() => onComplete({ score: 0, attempts: 0, toolCompleted: true })}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }
  
  const currentQuestion = templateQuestions[currentQuestionIndex];
  
  // Convert template question to LetterIdentificationInteractive format
  const convertedQuestion = {
    question: currentQuestion.instruction || currentQuestion.question,
    answer: currentQuestion.correctAnswer,
    targetLetter: currentQuestion.correctAnswer,
    questionType: 'letter_identification',
    hint: currentQuestion.hint
  };

  const handleResult = (result: string) => {
    console.log('🔤 Letter identification result:', result);
    
    // Track the selected answer
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = result;
    setSelectedAnswers(newAnswers);
    
    const correct = result === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    
    if (onInteraction) {
      onInteraction({ 
        type: 'answer', 
        data: { 
          questionIndex: currentQuestionIndex,
          answer: result, 
          correct,
          question: currentQuestion
        } 
      });
    }

    // Auto-advance after short delay
    setTimeout(() => {
      if (currentQuestionIndex < templateQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setIsCorrect(null);
      } else {
        // All questions completed
        const correctCount = newAnswers.reduce((count, answer, index) => 
          answer === templateQuestions[index].correctAnswer ? count + 1 : count, 0
        );
        const score = Math.round((correctCount / templateQuestions.length) * 100);
        
        console.log('🔤 All questions completed. Score:', score);
        onComplete({ 
          score, 
          attempts: newAnswers.length, 
          correctAnswers: correctCount,
          totalQuestions: templateQuestions.length,
          toolCompleted: true 
        });
      }
    }, 1500);
  };

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden flex flex-col">
      {/* Header with progress */}
      <div className="bg-purple-100 dark:bg-purple-900 p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-purple-800 dark:text-purple-200">
            🔤 Letter Identification
          </h2>
          <div className="text-sm text-purple-600 dark:text-purple-300">
            Question {currentQuestionIndex + 1} of {templateQuestions.length}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-purple-200 dark:bg-purple-700 rounded-full h-2">
          <div 
            className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / templateQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Career Context Box */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-lg mx-4 mt-4">
        <div className="flex items-start space-x-4">
          <span className="text-3xl">{currentQuestion.customerInfo?.emoji || '👤'}</span>
          <div className="flex-1">
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-4">
              <p className="text-lg text-blue-800 dark:text-blue-200 font-semibold">
                "{currentQuestion.question}"
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
              <p className="text-lg text-green-800 dark:text-green-200 font-semibold">
                Career Action: {currentQuestion.instruction}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Action Box - Prominent */}
      <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-2xl p-6 mx-4 mb-6 border-2 border-green-300 dark:border-green-600 shadow-lg">
        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Find the Letter: {currentQuestion.correctAnswer}
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Look at the options below and click the correct letter!
        </p>
      </div>

      {/* Letter Identification Tool */}
      <div className="flex-1 p-4">
        <LetterIdentificationInteractive
          onResult={handleResult}
          clearTrigger={false}
          showCase="uppercase"
          currentQuestion={convertedQuestion}
        />
      </div>
    </div>
  );
};

// ================================================================
// SHAPE SORTING WRAPPER COMPONENT
// Displays shape classification scenarios from Experience templates
// ================================================================
const ShapeSortingWrapper: React.FC<ToolComponentProps> = ({ 
  assignment, 
  configuration, 
  onInteraction, 
  onComplete, 
  toolState 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Get template questions from practiceContent
  const templateQuestions = assignment.practiceContent?.questions || [];
  
  console.log('🔷 ShapeSortingWrapper - Assignment:', assignment);
  console.log('🔷 ShapeSortingWrapper - Practice Content:', assignment.practiceContent);
  console.log('🔷 ShapeSortingWrapper - Template Questions:', templateQuestions);
  
  if (templateQuestions.length === 0) {
    return (
      <div className="h-full p-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔷</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">No Shape Questions Available</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            No shape sorting questions found in template.
          </p>
          <button 
            onClick={() => onComplete({ score: 0, attempts: 0, toolCompleted: true })}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }
  
  const currentQuestion = templateQuestions[currentQuestionIndex];
  
  // Convert template question to ShapeSortingInteractive format
  // The template can have shapes OR community helpers, so we need to extract the target
  const extractTargetFromQuestion = (question: any): string => {
    const instruction = (question.instruction || question.question || '').toLowerCase();
    const correctAnswer = question.correctAnswer;
    
    // Handle community helper scenarios (Social Studies)
    if (correctAnswer && typeof correctAnswer === 'string') {
      if (correctAnswer.includes('👨‍⚕️')) return 'doctor';
      if (correctAnswer.includes('🚒') || correctAnswer === '🚒') return 'firefighter'; 
      if (correctAnswer.includes('👮')) return 'police';
      if (correctAnswer.includes('👨‍🏫')) return 'teacher';
      if (correctAnswer.includes('👨‍🍳')) return 'chef';
      if (correctAnswer.includes('👷')) return 'construction';
    }
    
    // Handle shape scenarios (Science)
    if (instruction.includes('triangle') || instruction.includes('three sides')) return 'triangle';
    if (instruction.includes('square')) return 'square';
    if (instruction.includes('circle')) return 'circle';
    if (instruction.includes('rectangle')) return 'rectangle';
    if (instruction.includes('oval')) return 'oval';
    if (instruction.includes('diamond')) return 'diamond';
    
    // Fallback: try to extract from correctAnswer directly
    if (typeof correctAnswer === 'string') {
      if (correctAnswer.includes('🚒')) return 'firefighter';
      if (correctAnswer.includes('👨‍⚕️')) return 'doctor';
      if (correctAnswer.includes('triangle')) return 'triangle';
    }
    
    // Default fallback
    return 'triangle';
  };
  
  const target = extractTargetFromQuestion(currentQuestion);
  
  const convertedQuestion = {
    question: currentQuestion.instruction || currentQuestion.order || 'What is this?',
    answer: target,
    targetShape: target,
    questionType: assignment.subject === 'Social Studies' ? 'community_helper' : 'shape_classification',
    hint: currentQuestion.hint
  };

  const handleResult = (result: string) => {
    console.log('🔷 Shape sorting result:', result);
    
    // Track the selected answer
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = result;
    setSelectedAnswers(newAnswers);
    
    const correct = result === target;
    setIsCorrect(correct);
    
    if (onInteraction) {
      onInteraction({ 
        type: 'answer', 
        data: { 
          questionIndex: currentQuestionIndex,
          answer: result, 
          correct,
          question: currentQuestion
        } 
      });
    }

    // Auto-advance after short delay
    setTimeout(() => {
      if (currentQuestionIndex < templateQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setIsCorrect(null);
      } else {
        // All questions completed
        const correctCount = newAnswers.reduce((count, answer, index) => 
          answer === extractTargetFromQuestion(templateQuestions[index]) ? count + 1 : count, 0
        );
        const score = Math.round((correctCount / templateQuestions.length) * 100);
        
        console.log('🔷 All questions completed. Score:', score);
        onComplete({ 
          score, 
          attempts: newAnswers.length, 
          correctAnswers: correctCount,
          totalQuestions: templateQuestions.length,
          toolCompleted: true 
        });
      }
    }, 1500);
  };

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden flex flex-col">
      {/* Header with progress */}
      <div className="bg-blue-100 dark:bg-blue-900 p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-blue-800 dark:text-blue-200">
            🔷 Shape Classification
          </h2>
          <div className="text-sm text-blue-600 dark:text-blue-300">
            Question {currentQuestionIndex + 1} of {templateQuestions.length}
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-blue-200 dark:bg-blue-700 rounded-full h-2">
          <div 
            className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / templateQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Career Context Box */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-lg mx-4 mt-4">
        <div className="flex items-start space-x-4">
          <span className="text-3xl">{currentQuestion.customerInfo?.emoji || '🔬'}</span>
          <div className="flex-1">
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-4">
              <p className="text-lg text-blue-800 dark:text-blue-200 font-semibold">
                "{currentQuestion.question}"
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
              <p className="text-lg text-green-800 dark:text-green-200 font-semibold">
                Career Action: {currentQuestion.instruction}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Action Box - Prominent */}
      <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-2xl p-6 mx-4 mb-6 border-2 border-green-300 dark:border-green-600 shadow-lg">
        <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Find the Shape: {target}
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Look at the shapes and click the correct one!
        </p>
      </div>

      {/* Shape Sorting Tool */}
      <div className="flex-1 p-4">
        <ShapeSortingInteractive
          onResult={handleResult}
          clearTrigger={false}
          currentQuestion={convertedQuestion}
        />
      </div>
    </div>
  );
};

const RulesAndLawsWrapper: React.FC<ToolComponentProps> = ({ 
  assignment, 
  configuration, 
  onInteraction, 
  onComplete, 
  toolState 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Get template questions from practiceContent
  const templateQuestions = assignment.practiceContent?.questions || [];
  
  console.log('🏛️ RulesAndLawsWrapper - Assignment:', assignment);
  console.log('🏛️ RulesAndLawsWrapper - Practice Content:', assignment.practiceContent);
  console.log('🏛️ RulesAndLawsWrapper - Template Questions:', templateQuestions);
  
  if (templateQuestions.length === 0) {
    return (
      <div className="h-full p-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🏛️</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">No Rules Questions Available</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            No rules and laws questions found in template.
          </p>
          <button 
            onClick={() => onComplete({ score: 0, attempts: 0, toolCompleted: true })}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }
  
  const currentQuestion = templateQuestions[currentQuestionIndex];
  
  // Convert template question to RulesAndLawsInteractive format
  // The template uses community helper scenarios, but we need to extract the target rule
  const extractRuleFromQuestion = (question: any): string => {
    // Look for specific rule types in the instruction or question
    const instruction = (question.instruction || question.question || '').toLowerCase();
    
    if (instruction.includes('rule') || instruction.includes('safety')) return 'safety';
    if (instruction.includes('helper') || instruction.includes('community')) return 'social';
    if (instruction.includes('traffic') || instruction.includes('road')) return 'traffic';
    if (instruction.includes('manners') || instruction.includes('polite')) return 'manners';
    
    // Default to social rules
    return 'social';
  };
  
  // Convert emoji answers to helper names for rule matching
  const convertEmojiToRule = (answer: any): string => {
    if (typeof answer === 'string') {
      if (answer === '🚒' || answer.includes('🚒')) return 'firefighter';
      if (answer === '👨‍⚕️' || answer.includes('👨‍⚕️')) return 'doctor';
      if (answer === '👮' || answer.includes('👮')) return 'police officer';
      if (answer === '👨‍🏫' || answer.includes('👨‍🏫')) return 'teacher';
      if (answer === '👨‍🍳' || answer.includes('👨‍🍳')) return 'chef';
      if (answer === '👷' || answer.includes('👷')) return 'construction worker';
    }
    return 'community helper';
  };
  
  const convertedQuestion = {
    question: currentQuestion.instruction || currentQuestion.order || 'What is the right rule to follow?',
    answer: convertEmojiToRule(currentQuestion.correctAnswer),
    targetRule: extractRuleFromQuestion(currentQuestion),
    questionType: 'rule_matching',
    hint: currentQuestion.hint
  };
  
  const handleResult = (result: string) => {
    console.log('🏛️ RulesAndLawsWrapper - Result received:', result, 'Expected:', convertedQuestion.answer);
    
    const correct = result === convertedQuestion.answer;
    setIsCorrect(correct);
    setSelectedAnswers([result]);
    
    // Always notify parent of interaction
    onInteraction('answer-selected', {
      questionIndex: currentQuestionIndex,
      selectedAnswer: result,
      correctAnswer: convertedQuestion.answer,
      isCorrect: correct
    });
    
    // Auto-advance after a short delay
    setTimeout(() => {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < templateQuestions.length) {
        setCurrentQuestionIndex(nextIndex);
        setSelectedAnswers([]);
        setIsCorrect(null);
      } else {
        // All questions completed
        onComplete({
          score: 85, // Base score for completion
          attempts: templateQuestions.length,
          toolCompleted: true,
          allQuestionsAnswered: true
        });
      }
    }, 1500);
  };
  
  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900">
      <div className="flex-1 p-4">
        <RulesAndLawsInteractive
          onResult={handleResult}
          clearTrigger={false}
          currentQuestion={convertedQuestion}
        />
      </div>
    </div>
  );
};

const CommunityHelperWrapper: React.FC<ToolComponentProps> = ({ 
  assignment, 
  configuration, 
  onInteraction, 
  onComplete, 
  toolState 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Get template questions from practiceContent
  const templateQuestions = assignment.practiceContent?.questions || [];
  
  console.log('🏘️ CommunityHelperWrapper - Assignment:', assignment);
  console.log('🏘️ CommunityHelperWrapper - Practice Content:', assignment.practiceContent);
  console.log('🏘️ CommunityHelperWrapper - Template Questions:', templateQuestions);
  
  if (templateQuestions.length === 0) {
    return (
      <div className="h-full p-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🏘️</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">No Community Helper Questions Available</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            No community helper questions found in template.
          </p>
          <button 
            onClick={() => onComplete({ score: 0, attempts: 0, toolCompleted: true })}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }
  
  const currentQuestion = templateQuestions[currentQuestionIndex];
  
  // Convert emoji answers to helper names
  const emojiToHelper: { [key: string]: string } = {
    '🚒': 'firefighter',
    '👨‍⚕️': 'doctor',
    '👮': 'police',
    '👨‍🏫': 'teacher',
    '👨‍🍳': 'chef',
    '👷': 'construction',
    '📮': 'mail carrier',
    '👨‍🎨': 'artist',
    '🧑‍🌾': 'farmer',
    '👨‍🔧': 'mechanic'
  };
  
  // Convert emoji answer to helper name
  let targetHelper = currentQuestion.correctAnswer;
  if (emojiToHelper[currentQuestion.correctAnswer]) {
    targetHelper = emojiToHelper[currentQuestion.correctAnswer];
  }
  
  const convertedQuestion = {
    question: currentQuestion.instruction || currentQuestion.order || 'Who helps in our community?',
    answer: targetHelper,
    targetHelper: targetHelper,
    questionType: 'identify_helper',
    hint: currentQuestion.hint
  };
  
  const handleResult = (result: string) => {
    console.log('🏘️ CommunityHelperWrapper - Result received:', result, 'Expected:', convertedQuestion.answer);
    
    const correct = result === convertedQuestion.answer;
    setIsCorrect(correct);
    setSelectedAnswers([result]);
    
    // Always notify parent of interaction
    onInteraction('answer-selected', {
      questionIndex: currentQuestionIndex,
      selectedAnswer: result,
      correctAnswer: convertedQuestion.answer,
      isCorrect: correct
    });
    
    // Auto-advance after a short delay
    setTimeout(() => {
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < templateQuestions.length) {
        setCurrentQuestionIndex(nextIndex);
        setSelectedAnswers([]);
        setIsCorrect(null);
      } else {
        // All questions completed
        onComplete({
          score: 85, // Base score for completion
          attempts: templateQuestions.length,
          toolCompleted: true,
          allQuestionsAnswered: true
        });
      }
    }, 1500);
  };
  
  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900">
      <div className="flex-1 p-4">
        <CommunityHelperInteractive
          onResult={handleResult}
          clearTrigger={false}
          currentQuestion={convertedQuestion}
        />
      </div>
    </div>
  );
};

const GenericTool: React.FC<ToolComponentProps> = ({ assignment, onComplete }) => (
  <div className="h-full p-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="text-4xl mb-4">🔧</div>
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Interactive Tool</h4>
      <p className="text-gray-600 dark:text-gray-400 mb-4">Tool interface ready</p>
      <p className="text-sm text-gray-500">Assignment: {assignment.skillName}</p>
    </div>
  </div>
);

export default MasterToolInterface;