// 3-Phase Assignment Player - Instruction → Practice → Assessment
// Integrates with Alex's dashboard to show complete learning experiences

import React, { useState, useEffect } from 'react';
import { BookOpen, Target, CheckCircle, Play, ArrowRight, ArrowLeft, Clock, Star, Wrench } from 'lucide-react';
import { UpdatedAIContentGenerator, ThreePhaseContent } from '../utils/ThreePhaseContentGenerator';
import { AssessmentResults, Skill } from '../types/LearningTypes';
import { MasterToolInterface, AssignmentContext, ToolConfiguration } from './tools/MasterToolInterface';
// Agent system imports removed - to be replaced with live chat

interface ThreePhaseAssignmentPlayerProps {
  skill: {
    skillCode: string;
    skillName: string;
    subject: string;
  };
  studentName: string;
  gradeLevel: string;
  contentGenerator?: UpdatedAIContentGenerator;     // Optional for backward compatibility
  onComplete: (results: AssessmentResults) => void;  // Changed from boolean to detailed results
  onExit: () => void;
  context?: 'learn' | 'experience' | 'discover';    // Track which container we're in
  skipLoadingScreen?: boolean;                       // Skip loading screen if just showed personalization
}

type LearningPhase = 'instruction' | 'practice' | 'assessment' | 'complete';

export const ThreePhaseAssignmentPlayer: React.FC<ThreePhaseAssignmentPlayerProps> = ({
  skill,
  studentName,
  gradeLevel,
  contentGenerator,
  onComplete,
  onExit,
  context = 'learn',
  skipLoadingScreen = false
}) => {
  const [currentPhase, setCurrentPhase] = useState<LearningPhase>('instruction');
  const [content, setContent] = useState<ThreePhaseContent | null>(null);
  const [isLoading, setIsLoading] = useState(!skipLoadingScreen);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [assessmentResult, setAssessmentResult] = useState<boolean | null>(null);
  
  // New detailed tracking
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [assessmentAttempts, setAssessmentAttempts] = useState<number>(0);
  const [struggledWith, setStruggledWith] = useState<string[]>([]);
  
  // Agent system removed - to be replaced with live chat
  const agentSystem = null;

  // Master Tool placeholder - to be replaced with live chat
  const masterTool = {
    isToolVisible: false,
    currentTool: null,
    assignment: null,
    closeTool: () => {},
    handleToolComplete: () => {},
    handleToolProgress: () => {},
    agentSystem: null
    onToolComplete: async (results) => {
      console.log('🎯 Tool completed in ThreePhaseAssignmentPlayer:', results);
      
      // Use appropriate agent based on context
      if (agentSystem) {
        try {
          const agentType = context === 'experience' ? 'speak' : 
                           context === 'discover' ? 'speak' : 'think';
          
          await agentSystem.requestAgentAction(agentType, 'provide_guidance', {
            type: 'tool_completion_feedback',
            results,
            context: `three_phase_${context}`,
            phase: currentPhase
          });
        } catch (error) {
          console.warn('⚠️ Failed to get completion feedback:', error);
        }
      }
    },
    onToolProgress: async (progress) => {
      console.log('📊 Tool progress in ThreePhaseAssignmentPlayer:', progress);
    }
  });

  // Ensure body can scroll
  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    
    return () => {
      // Reset on cleanup
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
    };
  }, []);

  useEffect(() => {
    generateContent();
  }, [skill, studentName, gradeLevel]);

  const generateContent = async () => {
    // If we just finished personalization, skip the loading state
    if (!skipLoadingScreen) {
      setIsLoading(true);
    }
    try {
      // Use intelligent testbed data via content generator
      if (contentGenerator) {
        console.log(`⚡ Checking cache for ${skill.skillCode}...`);
        
        // Try to get cached content first
        const cachedContent = contentGenerator.getCachedContent(skill, studentName, gradeLevel);
        if (cachedContent) {
          console.log(`🎯 Using cached content for ${skill.skillCode}`);
          setContent(cachedContent);
          setIsLoading(false);
          return;
        }
        
        // If not cached, generate new content
        console.log(`📝 Generating fresh content for ${skill.skillCode}...`);
        const generatedContent = await contentGenerator.generateThreePhaseContent(
          skill,
          studentName,
          gradeLevel
        );
        setContent(generatedContent);
        setIsLoading(false);
        return;
      }

      // Fallback to original method if no contentGenerator provided
      const apiKey = import.meta.env.VITE_AZURE_GPT4_API_KEY || import.meta.env.VITE_OPENAI_API_KEY || 'demo-key';
      
      if (apiKey === 'demo-key') {
        // Use demo content for testing
        setContent(getDemoContent());
      } else {
        const generator = new UpdatedAIContentGenerator(apiKey);
        const generatedContent = await generator.generateThreePhaseContent(
          skill,
          studentName,
          gradeLevel
        );
        setContent(generatedContent);
      }
    } catch (error) {
      console.error('Error generating content:', error);
      // Fallback to demo content
      setContent(getDemoContent());
    } finally {
      setIsLoading(false);
    }
  };

  const getDemoContent = (): ThreePhaseContent => {
    return {
      metadata: {
        title: `Learning ${skill.skillName}`,
        subject: skill.subject,
        gradeLevel,
        skillCode: skill.skillCode,
        duration: '20 min',
        difficulty: 'easy',
        studentName
      },
      instruction: {
        title: 'Let\'s Learn Together!',
        content: `Hi ${studentName}! Today we're going to learn about ${skill.skillName}. This is going to be fun!`,
        concept: `${skill.skillName} is an important skill that helps us understand the world around us.`,
        examples: [
          {
            type: 'Example',
            text: 'Here\'s how we use this skill in everyday life',
            explanation: 'This shows us the practical application'
          },
          {
            type: 'Counter-example',
            text: 'Here\'s what it looks like when we don\'t use this skill',
            explanation: 'This helps us understand the difference'
          }
        ],
        keyPoints: [
          'Remember the main concept',
          'Practice makes perfect',
          'Ask questions if you need help'
        ]
      },
      practice: {
        title: 'Let\'s Practice!',
        description: `Now ${studentName}, let's practice what we just learned!`,
        examples: [
          {
            scenario: 'Practice example 1',
            answer: 'Correct response',
            feedback: 'Great job understanding this!'
          },
          {
            scenario: 'Practice example 2',
            answer: 'Another correct response',
            feedback: 'You\'re getting the hang of this!'
          }
        ]
      },
      assessment: {
        title: 'Show What You Know!',
        question: `Which example best shows ${skill.skillName}?`,
        options: [
          'Option A - Correct example',
          'Option B - Incorrect example',
          'Option C - Another incorrect example',
          'Option D - Also incorrect'
        ],
        correctAnswer: 'Option A - Correct example',
        explanation: 'That\'s right! This example perfectly demonstrates the concept we learned.',
        encouragement: `Excellent work, ${studentName}! You\'re doing amazing!`
      }
    };
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAssessment = () => {
    if (!content) return;
    
    const isCorrect = selectedAnswer === content.assessment.correctAnswer;
    const endTime = new Date();
    const timeSpent = endTime.getTime() - startTime.getTime();
    const attempts = assessmentAttempts + 1;
    
    setAssessmentAttempts(attempts);
    setAssessmentResult(isCorrect);
    setShowFeedback(true);
    
    // If incorrect, add to struggled areas
    if (!isCorrect && !struggledWith.includes(skill.skillName)) {
      setStruggledWith(prev => [...prev, skill.skillName]);
    }
    
    // Calculate score (can be enhanced with more sophisticated scoring)
    const score = isCorrect ? 100 : Math.max(0, 100 - (attempts - 1) * 25);
    
    // Create detailed assessment results
    const assessmentResults: AssessmentResults = {
      skillCode: skill.skillCode,
      completed: true,  // Always true - student attempted
      correct: isCorrect,
      score: score,
      attempts: attempts,
      timeSpent: timeSpent,
      selectedAnswer: selectedAnswer,
      correctAnswer: content.assessment.correctAnswer,
      struggledWith: struggledWith.length > 0 ? struggledWith : undefined,
      timestamp: endTime,
      context: context
    };
    
    // Scroll to feedback section so student can see results
    setTimeout(() => {
      const feedbackElement = document.querySelector('[data-feedback-section]');
      console.log('🚀 Feedback scrolling - element found:', feedbackElement);
      if (feedbackElement) {
        // First ensure the container is scrollable
        const container = feedbackElement.closest('.overflow-y-auto');
        console.log('🚀 Scrollable container found:', container);
        if (container) {
          // Calculate position and scroll
          const containerRect = container.getBoundingClientRect();
          const elementRect = feedbackElement.getBoundingClientRect();
          const scrollTop = elementRect.top - containerRect.top + container.scrollTop - 100;
          console.log('🚀 Scrolling to position:', scrollTop);
          container.scrollTo({ top: scrollTop, behavior: 'smooth' });
        } else {
          // Fallback to window scroll
          console.log('🚀 Using fallback scroll');
          feedbackElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 100);

    setTimeout(() => {
      setCurrentPhase('complete');
      onComplete(assessmentResults);  // Pass detailed results instead of boolean
    }, 4000); // 4 seconds to read feedback before progressing
  };

  const nextPhase = () => {
    if (currentPhase === 'instruction') {
      setCurrentPhase('practice');
    } else if (currentPhase === 'practice') {
      setCurrentPhase('assessment');
    }
  };

  const prevPhase = () => {
    if (currentPhase === 'practice') {
      setCurrentPhase('instruction');
    } else if (currentPhase === 'assessment') {
      setCurrentPhase('practice');
    }
  };

  if (isLoading || !content) {
    // Always show simple loading - no Finn messages here since personalization handles that
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center">
          <p className="text-lg text-red-600">Unable to load content. Please try again.</p>
          <button 
            onClick={onExit}
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20 pt-16" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onExit}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
              <div className="border-l border-gray-300 dark:border-gray-600 pl-4">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">{content.metadata.title}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {content.metadata.subject} • {content.metadata.duration} • {content.metadata.skillCode}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{content.metadata.duration}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <div className={`flex items-center space-x-2 ${currentPhase === 'instruction' ? 'text-blue-600' : currentPhase === 'practice' || currentPhase === 'assessment' || currentPhase === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <BookOpen className="h-5 w-5" />
            <span className="font-medium">Instruction</span>
          </div>
          <div className={`flex-1 h-2 mx-4 rounded-full ${currentPhase === 'practice' || currentPhase === 'assessment' || currentPhase === 'complete' ? 'bg-green-200' : 'bg-gray-200'}`}>
            <div className={`h-full rounded-full transition-all duration-500 ${currentPhase === 'instruction' ? 'w-1/3 bg-blue-500' : currentPhase === 'practice' || currentPhase === 'assessment' || currentPhase === 'complete' ? 'w-full bg-green-500' : 'w-0'}`}></div>
          </div>
          
          <div className={`flex items-center space-x-2 ${currentPhase === 'practice' ? 'text-blue-600' : currentPhase === 'assessment' || currentPhase === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <Target className="h-5 w-5" />
            <span className="font-medium">Practice</span>
          </div>
          <div className={`flex-1 h-2 mx-4 rounded-full ${currentPhase === 'assessment' || currentPhase === 'complete' ? 'bg-green-200' : 'bg-gray-200'}`}>
            <div className={`h-full rounded-full transition-all duration-500 ${currentPhase === 'practice' ? 'w-1/3 bg-blue-500' : currentPhase === 'assessment' || currentPhase === 'complete' ? 'w-full bg-green-500' : 'w-0'}`}></div>
          </div>
          
          <div className={`flex items-center space-x-2 ${currentPhase === 'assessment' ? 'text-blue-600' : currentPhase === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Assessment</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-h-[70vh] overflow-y-auto">
          
          {/* Instruction Phase */}
          {currentPhase === 'instruction' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{content.instruction.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2">{content.instruction.content}</p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Key Concept:</h3>
                <p className="text-blue-700 dark:text-blue-200">{content.instruction.concept}</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 dark:text-white">Examples:</h3>
                {content.instruction.examples?.map((example, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm font-medium rounded-full">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{example.question}</p>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">{example.answer}</p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{example.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-6">
                <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">Key Points to Remember:</h3>
                <ul className="space-y-2">
                  {content.instruction.keyPoints?.map((point, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Star className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-green-700 dark:text-green-300">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Practice Phase */}
          {currentPhase === 'practice' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full mb-4">
                  <Target className="h-8 w-8 text-orange-600 dark:text-orange-300" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{content.practice.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2">{content.practice.description}</p>
              </div>

              {/* Tool Launch Section */}
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
                      Practice with Interactive Tool
                    </h3>
                    <p className="text-blue-700 dark:text-blue-200 text-sm mb-4">
                      Use the specialized tool to practice {skill.skillName}
                    </p>
                  </div>
                  <div className="ml-4">
                    <Wrench className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <button
                  onClick={() => {
                    const assignmentContext: AssignmentContext = {
                      skillCode: skill.skillCode,
                      skillName: skill.skillName,
                      subject: skill.subject,
                      gradeLevel: gradeLevel,
                      difficulty: 5,
                      topic: skill.skillName,
                      learningObjective: `Master ${skill.skillName} concepts`,
                      studentId: studentName.toLowerCase().replace(/\s+/g, '-'),
                      sessionId: `three-phase-${context}-${Date.now()}`
                    };
                    
                    console.log('🔧 Launching tool with context:', assignmentContext);
                    masterTool.openTool(assignmentContext);
                  }}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Play className="h-5 w-5 mr-2" />
                  Launch Practice Tool
                </button>
              </div>

              <div className="space-y-6">
                {content.practice.examples?.map((example, index) => (
                  <div key={index} className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 font-bold rounded-full">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 dark:text-white mb-2">Practice Example:</h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-3">{example.scenario}</p>
                        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-orange-200 dark:border-orange-700">
                          <p className="font-medium text-orange-800 dark:text-orange-300">Answer: {example.answer}</p>
                          <p className="text-orange-700 dark:text-orange-400 text-sm mt-1">{example.feedback}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assessment Phase */}
          {currentPhase === 'assessment' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-300" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{content.assessment.title}</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Now let's see what you've learned!</p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">{content.assessment.question}</h3>
                <div className="space-y-3">
                  {content.assessment.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedAnswer === option
                          ? 'border-green-500 bg-green-100 dark:bg-green-900/50 dark:border-green-400'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-green-300 dark:hover:border-green-500 text-gray-900 dark:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-medium">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span>{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {showFeedback && (
                <div 
                  data-feedback-section
                  className={`rounded-lg p-6 ${assessmentResult ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${assessmentResult ? 'bg-green-100' : 'bg-yellow-100'}`}>
                      {assessmentResult ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Star className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${assessmentResult ? 'text-green-800' : 'text-yellow-800'}`}>
                        {assessmentResult ? 'Correct!' : 'Keep Learning!'}
                      </p>
                      <p className={`text-sm mt-1 ${assessmentResult ? 'text-green-700' : 'text-yellow-700'}`}>
                        {content.assessment.explanation}
                      </p>
                      <p className={`text-sm mt-2 font-medium ${assessmentResult ? 'text-green-700' : 'text-yellow-700'}`}>
                        {content.assessment.encouragement}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Complete Phase */}
          {currentPhase === 'complete' && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <Star className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Great Job, {studentName}!</h2>
              <p className="text-lg text-gray-600">
                You've completed your {content.metadata.subject} lesson on {content.metadata.skillCode}!
              </p>
              <div className="bg-green-50 rounded-lg p-6">
                <p className="text-green-700">
                  {assessmentResult 
                    ? "You understood the concept perfectly! Ready for the next challenge?"
                    : "You're learning and growing! Every step forward counts!"
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={prevPhase}
            disabled={currentPhase === 'instruction' || currentPhase === 'complete'}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <div className="flex space-x-4">
            {currentPhase === 'assessment' && !showFeedback && (
              <button
                onClick={handleSubmitAssessment}
                disabled={!selectedAnswer}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            )}

            {currentPhase === 'complete' ? (
              <button
                onClick={onExit}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Back to Dashboard
              </button>
            ) : currentPhase !== 'assessment' && (
              <button
                onClick={nextPhase}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Master Tool Interface */}
      {masterTool.isToolVisible && masterTool.currentTool && masterTool.assignment && (
        <MasterToolInterface
          assignment={masterTool.assignment}
          configuration={masterTool.currentTool}
          isVisible={masterTool.isToolVisible}
          onClose={masterTool.closeTool}
          onComplete={masterTool.handleToolComplete}
          onProgress={masterTool.handleToolProgress}
        />
      )}
    </div>
  );
};

export default ThreePhaseAssignmentPlayer;