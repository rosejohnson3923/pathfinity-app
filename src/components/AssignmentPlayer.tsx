// Assignment Integration with Adaptive Dashboard
// Connects assignments to the adaptive learning system

import React, { useState, useEffect } from 'react';
import { useAdaptiveData } from './AdaptiveDataProvider';
import { AssignmentGenerator, SkillAssignment } from '../data/assignmentSystem';

// Assignment Player Component
export const AssignmentPlayer: React.FC<{ 
  assignment: SkillAssignment;
  onComplete: (score: number) => void;
  onExit: () => void;
}> = ({ assignment, onComplete, onExit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [score, setScore] = useState(0);
  const { currentProfile, currentTheme } = useAdaptiveData();

  const handleSubmitAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    
    // Auto-advance for simple assignments
    if (assignment.grade === 'Kindergarten' || assignment.grade === 'Grade 3') {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1500);
    }
  };

  const calculateFinalScore = () => {
    const assessment = assignment.assessments[0];
    let correct = 0;
    
    assessment.questions.forEach(question => {
      if (answers[question.id] === question.correct_answer) {
        correct++;
      }
    });
    
    return Math.round((correct / assessment.questions.length) * 100);
  };

  const handleComplete = () => {
    const finalScore = calculateFinalScore();
    setScore(finalScore);
    onComplete(finalScore);
  };

  return (
    <div className="assignment-player min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Assignment Header */}
      <div 
        className="assignment-header p-6 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.gradientFrom}, ${currentTheme.gradientTo})`
        }}
      >
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{assignment.title}</h1>
              <p className="text-white/80">{assignment.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm">
                <span>⏱️ {assignment.estimatedDuration} min</span>
                <span>📊 {assignment.difficulty}</span>
                <span>🎯 {assignment.subject}</span>
              </div>
            </div>
            <button
              onClick={onExit}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              Exit Assignment
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-white/80 mb-2">
              <span>Progress</span>
              <span>{currentStep + 1} / {assignment.assessments[0]?.questions.length || 1}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((currentStep + 1) / (assignment.assessments[0]?.questions.length || 1)) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Content */}
      <div className="assignment-content max-w-4xl mx-auto p-6">
        {assignment.assessments[0] && currentStep < assignment.assessments[0].questions.length ? (
          <QuestionRenderer 
            question={assignment.assessments[0].questions[currentStep]}
            assignment={assignment}
            onAnswer={handleSubmitAnswer}
            userProfile={currentProfile}
          />
        ) : (
          <AssignmentComplete 
            assignment={assignment}
            score={score}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
};

// Question Renderer Component
const QuestionRenderer: React.FC<{
  question: any;
  assignment: SkillAssignment;
  onAnswer: (questionId: string, answer: any) => void;
  userProfile: any;
}> = ({ question, assignment, onAnswer, userProfile }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const { currentTheme } = useAdaptiveData();

  const handleAnswer = (answer: any) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    setTimeout(() => {
      onAnswer(question.id, answer);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }, 2000);
  };

  const getGradeAppropriateRendering = () => {
    if (assignment.grade === 'Kindergarten') {
      return (
        <div className="kindergarten-question text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold mb-6 text-gray-800">{question.question}</h2>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {question.options?.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="p-6 text-lg font-medium bg-white border-4 border-gray-200 rounded-xl hover:border-blue-400 transition-all transform hover:scale-105"
                style={{ 
                  borderColor: selectedAnswer === index ? currentTheme.primaryColor : undefined,
                  backgroundColor: selectedAnswer === index ? currentTheme.primaryColor + '20' : undefined
                }}
              >
                <div className="text-3xl mb-2">
                  {index === 0 ? '🅰️' : index === 1 ? '🅱️' : index === 2 ? '🅲️' : '🅳️'}
                </div>
                {option}
              </button>
            ))}
          </div>
        </div>
      );
    } else if (assignment.grade === 'Grade 3') {
      return (
        <div className="grade3-question">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{question.question}</h2>
          <div className="space-y-3">
            {question.options?.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="w-full p-4 text-left bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 transition-all"
                style={{ 
                  borderColor: selectedAnswer === index ? currentTheme.primaryColor : undefined,
                  backgroundColor: selectedAnswer === index ? currentTheme.primaryColor + '10' : undefined
                }}
              >
                <span className="font-medium mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </button>
            ))}
          </div>
        </div>
      );
    } else {
      return (
        <div className="advanced-question">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">{question.question}</h2>
          <div className="space-y-2">
            {question.options?.map((option: string, index: number) => (
              <label key={index} className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="answer"
                  value={index}
                  onChange={() => handleAnswer(index)}
                  className="mr-3"
                  style={{ accentColor: currentTheme.primaryColor }}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="question-container">
      {getGradeAppropriateRendering()}
      
      {/* Feedback */}
      {showFeedback && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">
              {selectedAnswer === question.correct_answer ? '✅' : '❌'}
            </span>
            <span className="font-medium">
              {selectedAnswer === question.correct_answer ? 'Correct!' : 'Not quite right.'}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};

// Assignment Complete Component
const AssignmentComplete: React.FC<{
  assignment: SkillAssignment;
  score: number;
  onComplete: () => void;
}> = ({ assignment, score, onComplete }) => {
  const { currentTheme } = useAdaptiveData();

  const getEncouragementMessage = () => {
    if (score >= 90) return "Outstanding work! 🌟";
    if (score >= 80) return "Great job! 🎉";
    if (score >= 70) return "Good effort! 👍";
    return "Keep practicing! 💪";
  };

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="assignment-complete text-center py-12">
      <div className="text-6xl mb-4">
        {score >= 80 ? '🎉' : score >= 70 ? '👍' : '📚'}
      </div>
      
      <h2 className="text-3xl font-bold mb-2" style={{ color: currentTheme.primaryColor }}>
        Assignment Complete!
      </h2>
      
      <p className="text-xl mb-6 text-gray-600">{getEncouragementMessage()}</p>
      
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto mb-8">
        <div className="text-4xl font-bold mb-2" style={{ color: currentTheme.primaryColor }}>
          {score}%
        </div>
        <p className="text-gray-600">Your Score</p>
        
        <div className="mt-6 space-y-2 text-sm text-gray-500">
          <div>Time Spent: {assignment.estimatedDuration} minutes</div>
          <div>Difficulty: {assignment.difficulty}</div>
          <div>Subject: {assignment.subject}</div>
        </div>
      </div>
      
      <button
        onClick={onComplete}
        className="px-8 py-3 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
        style={{ backgroundColor: currentTheme.primaryColor }}
      >
        Continue Learning
      </button>
    </div>
  );
};

export default AssignmentPlayer;