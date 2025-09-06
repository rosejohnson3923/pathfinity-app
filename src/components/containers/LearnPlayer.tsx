// ================================================================
// LEARN CONTAINER PLAYER
// Optimized player that only generates instruction content
// ================================================================

import React, { useState, useEffect } from 'react';
import { BookOpen, ArrowRight, ArrowLeft, Star } from 'lucide-react';
import { ContainerContentGenerator, LearnContent } from '../../utils/ContainerContentGenerators';
import { AssessmentResults } from '../../types/LearningTypes';

interface LearnPlayerProps {
  skill: {
    skillCode: string;
    skillName: string;
    subject: string;
  };
  studentName: string;
  gradeLevel: string;
  contentGenerator: ContainerContentGenerator;
  onComplete: (results: AssessmentResults) => void;
  onExit: () => void;
  skipLoadingScreen?: boolean;
}

export const LearnPlayer: React.FC<LearnPlayerProps> = ({
  skill,
  studentName,
  gradeLevel,
  contentGenerator,
  onComplete,
  onExit,
  skipLoadingScreen = false
}) => {
  const [content, setContent] = useState<LearnContent | null>(null);
  const [isLoading, setIsLoading] = useState(!skipLoadingScreen);
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [showKeyPoints, setShowKeyPoints] = useState(false);
  const [startTime] = useState(new Date());

  useEffect(() => {
    generateContent();
  }, [skill, studentName, gradeLevel]);

  const generateContent = async () => {
    if (!skipLoadingScreen) {
      setIsLoading(true);
    }
    
    try {
      console.log(`📚 Generating LEARN content for ${skill.skillCode}...`);
      const learnContent = await contentGenerator.generateLearnContent(
        skill,
        studentName,
        gradeLevel
      );
      setContent(learnContent);
    } catch (error) {
      console.error('Error generating learn content:', error);
      // Fallback content
      setContent(getFallbackContent());
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackContent = (): LearnContent => {
    return {
      metadata: {
        title: `Learning ${skill.skillName}`,
        subject: skill.subject,
        gradeLevel: gradeLevel,
        skillCode: skill.skillCode,
        duration: '15 min',
        studentName: studentName
      },
      instruction: {
        title: `Let's Learn ${skill.skillName}!`,
        content: `Hi ${studentName}! Today we're going to learn about ${skill.skillName}. This is going to be fun!`,
        concept: `${skill.skillName} is an important skill that helps us understand ${skill.subject} better.`,
        examples: [
          {
            question: `Here's how we use ${skill.skillName}`,
            answer: 'We can apply this concept step by step',
            explanation: 'This helps us solve problems more easily'
          }
        ],
        keyPoints: [
          'Remember the main concept',
          'Practice makes perfect',
          'Ask questions when you need help'
        ]
      }
    };
  };

  const handleComplete = () => {
    const endTime = new Date();
    const timeSpent = endTime.getTime() - startTime.getTime();
    
    const results: AssessmentResults = {
      skillCode: skill.skillCode,
      completed: true,
      correct: true, // Learn phase is always "correct" - it's instruction
      score: 100,
      attempts: 1,
      timeSpent: timeSpent,
      selectedAnswer: 'completed',
      correctAnswer: 'completed',
      timestamp: endTime,
      context: 'learn'
    };
    
    onComplete(results);
  };

  if (isLoading || !content) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading...</p>
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
            <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
              <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Learn Phase</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-h-[70vh] overflow-y-auto">
          
          {/* Instruction Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{content.instruction.title}</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">{content.instruction.content}</p>
          </div>

          {/* Main Concept */}
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Key Concept:</h3>
            <p className="text-blue-700 dark:text-blue-200">{content.instruction.concept}</p>
          </div>

          {/* Examples Section */}
          {content.instruction.examples && content.instruction.examples.length > 0 && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Examples:</h3>
              <div className="space-y-4">
                {content.instruction.examples.map((example, index) => (
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
            </div>
          )}

          {/* Key Points */}
          {content.instruction.keyPoints && content.instruction.keyPoints.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-6">
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">Key Points to Remember:</h3>
              <ul className="space-y-2">
                {content.instruction.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Star className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-green-700 dark:text-green-300">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-end items-center mt-6">
          <button
            onClick={handleComplete}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <span>Continue to Experience</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearnPlayer;