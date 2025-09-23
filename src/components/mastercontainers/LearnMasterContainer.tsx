// ================================================================
// LEARN MASTER CONTAINER
// Subject Cards → Assignment Cards → 3 Steps (Instruction, Practice, Assessment)
// ================================================================

import React, { useState, useEffect } from 'react';
import { BookOpen, Target, CheckCircle, Clock, ArrowRight, ChevronLeft, Star, Wrench, Play } from 'lucide-react';
import { ExpandableReadingPanel } from '../ui/ExpandableReadingPanel';
import { GamificationService } from '../../services/gamificationService';
import SimpleParticlesBackground from '../SimpleParticlesBackground';
import { MasterContainerData, SubjectCard, AssignmentCard } from '../../utils/JourneyCacheManager';
import { AssessmentResults, ContainerHandoff } from '../../types/LearningTypes';
import { MasterToolInterface, AssignmentContext, ToolConfiguration } from '../tools/MasterToolInterface';
// Agent system imports removed - to be replaced with live chat
import EmbeddedToolRenderer from '../tools/EmbeddedToolRenderer';
import { FinnChatbot } from '../chatbot/FinnChatbot';

interface LearnMasterContainerProps {
  masterContainerData: MasterContainerData;
  onComplete: (handoff: ContainerHandoff) => void;
  onExit: () => void;
  skipLoadingScreen?: boolean;
}

type LearningStep = 'instruction' | 'practice' | 'assessment' | 'completion';

export const LearnMasterContainer: React.FC<LearnMasterContainerProps> = ({
  masterContainerData,
  onComplete,
  onExit,
  skipLoadingScreen = false
}) => {
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [currentAssignmentIndex, setCurrentAssignmentIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState<LearningStep>('instruction');
  const [completedResults, setCompletedResults] = useState<AssessmentResults[]>([]);
  const [showLoadingScreen, setShowLoadingScreen] = useState(!skipLoadingScreen);
  const [startTime] = useState(new Date());
  
  // XP and gamification state
  const [studentXP, setStudentXP] = useState(0);
  const [showXPGain, setShowXPGain] = useState(false);
  const [lastXPGain, setLastXPGain] = useState(0);
  
  // FinnSpeak feedback state (moved from PracticeStep)
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'neutral' | 'correct' | 'incorrect' | 'hint'>('neutral');
  
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
      console.log('🎯 Tool completed in Learn Container:', results);
      
      // Agent celebration removed - to be replaced with live chat
      if (false) {
        try {
          await agentSystem.requestAgentAction('speak', 'provide_guidance', {
            type: 'completion_celebration',
            results,
            context: 'learn_container'
          });
        } catch (error) {
          console.warn('⚠️ Failed to get completion celebration:', error);
        }
      }
    },
    onToolProgress: async (progress) => {
      console.log('📊 Tool progress in Learn Container:', progress);
      
      // Use FinnSee for visual progress feedback
      if (agentSystem && progress.needsVisualSupport) {
        try {
          await agentSystem.requestAgentAction('see', 'create_visual_content', {
            type: 'progress_visual',
            progress,
            context: 'learn_container'
          });
        } catch (error) {
          console.warn('⚠️ Failed to get visual progress support:', error);
        }
      }
    }
  });

  const currentSubject = masterContainerData.subjectCards[currentSubjectIndex];
  const currentAssignment = currentSubject?.assignments[currentAssignmentIndex];
  const isLastSubject = currentSubjectIndex === masterContainerData.subjectCards.length - 1;
  const isLastAssignment = currentAssignmentIndex === currentSubject?.assignments.length - 1;

  // Debug logging
  console.log('🔍 Learn Master Container State:', {
    currentStep,
    currentSubjectIndex,
    currentAssignmentIndex,
    subjectCount: masterContainerData.subjectCards.length,
    assignmentCount: currentSubject?.assignments.length || 0,
    currentSubjectName: currentSubject?.subject,
    currentAssignmentTitle: currentAssignment?.title,
    isLastSubject,
    isLastAssignment
  });

  // Handle loading screen
  useEffect(() => {
    if (!skipLoadingScreen) {
      const timer = setTimeout(() => {
        setShowLoadingScreen(false);
      }, 5000); // 5-second Finn personalization
      return () => clearTimeout(timer);
    }
  }, [skipLoadingScreen]);

  // Handle step completion
  const handleStepComplete = (stepResults: any) => {
    console.log(`📚 Completed ${currentStep} for ${currentAssignment.skill.skill_number}`, stepResults);
    console.log(`📚 Current assignment:`, currentAssignment.title);
    console.log(`📚 Current subject assignments length:`, currentSubject.assignments.length);
    console.log(`📚 Current assignment index:`, currentAssignmentIndex);
    console.log(`📚 Current subject index:`, currentSubjectIndex);

    // Calculate XP reward based on step type
    let xpGain = 0;
    if (currentStep === 'instruction') {
      xpGain = 10; // Base XP for instruction
      console.log(`📚 Moving from instruction to practice`);
      setCurrentStep('practice');
    } else if (currentStep === 'practice') {
      xpGain = 15; // Base XP for practice
      console.log(`📚 Moving from practice to assessment`);
      
      // Clear Finn feedback when leaving practice step
      setShowFeedback(false);
      setFeedbackMessage('');
      setFeedbackType('neutral');
      console.log('🦉 Cleared Finn feedback on practice completion');
      
      setCurrentStep('assessment');
    } else if (currentStep === 'assessment') {
      // XP for assessment based on score
      const score = stepResults.score || 85;
      if (score >= 90) {
        xpGain = 50;
      } else if (score >= 80) {
        xpGain = 40;
      } else if (score >= 70) {
        xpGain = 30;
      } else {
        xpGain = 20;
      }
      
      // Record assessment results
      const results: AssessmentResults = {
        skill_number: currentAssignment.skill.skill_number,
        completed: true,
        correct: (stepResults.score || 85) >= 75,
        score: stepResults.score || 85,
        attempts: stepResults.attempts || 1,
        timeSpent: stepResults.timeSpent || 300000,
        selectedAnswer: stepResults.selectedAnswer,
        correctAnswer: stepResults.correctAnswer || 'Correct approach',
        struggledWith: stepResults.struggledWith || [],
        timestamp: new Date(),
        context: 'learn'
      };

      const updatedResults = [...completedResults, results];
      setCompletedResults(updatedResults);

      // Move to next assignment or subject
      if (currentAssignmentIndex < currentSubject.assignments.length - 1) {
        // Next assignment in same subject
        console.log(`📚 Moving to next assignment: ${currentAssignmentIndex + 1}`);
        setCurrentAssignmentIndex(currentAssignmentIndex + 1);
        setCurrentStep('instruction');
      } else if (currentSubjectIndex < masterContainerData.subjectCards.length - 1) {
        // Next subject
        console.log(`📚 Moving to next subject: ${currentSubjectIndex + 1}`);
        setCurrentSubjectIndex(currentSubjectIndex + 1);
        setCurrentAssignmentIndex(0);
        setCurrentStep('instruction');
      } else {
        // Show completion recap page
        console.log(`📚 Showing Learn Master Container completion recap with ${updatedResults.length} results`);
        setCurrentStep('completion');
      }
    }
    
    // Award XP and show animation
    if (xpGain > 0) {
      setStudentXP(prev => prev + xpGain);
      setLastXPGain(xpGain);
      setShowXPGain(true);
      console.log(`🎮 Awarded ${xpGain} XP for ${currentStep} completion`);
      
      // Hide XP animation after 3 seconds
      setTimeout(() => setShowXPGain(false), 3000);
    }
  };

  const handleMasterContainerComplete = (results: AssessmentResults[]) => {
    console.log('🎯 Learn Master Container completed with results:', results);
    console.log('🎯 Calling onComplete with handoff...');

    // Analyze results for handoff to Experience Master Container
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const avgAttempts = results.reduce((sum, r) => sum + r.attempts, 0) / results.length;
    const allStrengths = results.flatMap(r => r.strengths);
    const allStruggles = results.flatMap(r => r.struggledWith);

    const skillsNeedingMastery = results
      .filter(r => r.score < 80 || r.attempts > 2)
      .map(r => r.skill_number);

    const studentStrengths = [...new Set(allStrengths)];
    const recommendedApproach = avgScore >= 80 ? 'hands-on' : 'visual';

    const handoff: ContainerHandoff = {
      assignmentId: `learn-${masterContainerData.metadata.studentName}`,
      studentId: masterContainerData.metadata.studentName,
      completedSkills: results,
      skillsNeedingMastery,
      studentStrengths,
      recommendedApproach,
      timeSpent: new Date().getTime() - startTime.getTime(),
      containerSource: 'learn',
      timestamp: new Date()
    };

    onComplete(handoff);
  };

  // Show 5-second loading screen
  if (showLoadingScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center relative">
        <SimpleParticlesBackground theme="learning" particleCount={60} />
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 text-center relative z-10">
          <div className="mb-6">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Finn is personalizing your learning journey...
            </h2>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentSubject || !currentAssignment) {
    console.log('❌ Learn Master Container - Missing data:', {
      currentSubject: !!currentSubject,
      currentAssignment: !!currentAssignment,
      subjectCards: masterContainerData.subjectCards.length,
      currentSubjectIndex,
      currentAssignmentIndex
    });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No content available</h2>
          <button onClick={onExit} className="px-4 py-2 bg-gray-500 text-white rounded">
            Exit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <SimpleParticlesBackground theme="learning" particleCount={60} />
      
      {/* Header */}
      <div className="relative z-10 pt-12 pb-12">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <button
            onClick={onExit}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              📚 Learn Master Container
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {currentSubject.subject} • {currentAssignment.title}
            </p>
          </div>

          {/* Skip Button for Testing */}
          <button
            onClick={() => {
              const nextSubjectIndex = (currentSubjectIndex + 1) % masterContainerData.subjectCards.length;
              setCurrentSubjectIndex(nextSubjectIndex);
              setCurrentAssignmentIndex(0);
              setCurrentStep('instruction');
              console.log(`🚀 Skip: Moving to subject ${nextSubjectIndex} (${masterContainerData.subjectCards[nextSubjectIndex]?.subject})`);
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
            title="Skip to next subject for testing"
          >
            <span>Skip</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Indicator - Hide on completion */}
      {currentStep !== 'completion' && (
        <div className="relative z-10 mb-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Subject {currentSubjectIndex + 1} of {masterContainerData.subjectCards.length}
              </span>
              
              {/* XP Display */}
              <div className="flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-bold text-yellow-800 dark:text-yellow-200">
                  {studentXP} XP
                </span>
              </div>
              
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Assignment {currentAssignmentIndex + 1} of {currentSubject.assignments.length}
              </span>
            </div>
            
            {/* Step Progress */}
            <div className="flex items-center justify-center space-x-4 mb-3">
              <div className={`flex items-center space-x-2 ${currentStep === 'instruction' ? 'text-purple-600' : currentStep === 'practice' || currentStep === 'assessment' ? 'text-green-600' : 'text-gray-400'}`}>
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">Instruction</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center space-x-2 ${currentStep === 'practice' ? 'text-purple-600' : currentStep === 'assessment' ? 'text-green-600' : 'text-gray-400'}`}>
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">Practice</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center space-x-2 ${currentStep === 'assessment' ? 'text-purple-600' : 'text-gray-400'}`}>
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Assessment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Content Area */}
      <div className="relative z-10 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            {currentStep === 'instruction' && (
              <InstructionStep
                content={currentAssignment.steps.instruction}
                assignment={currentAssignment}
                onComplete={handleStepComplete}
              />
            )}
            
            {currentStep === 'practice' && (
              <PracticeStep
                content={currentAssignment.steps.practice}
                assignment={currentAssignment}
                onComplete={handleStepComplete}
                masterTool={masterTool}
                masterContainerData={masterContainerData}
                feedbackState={{
                  showFeedback,
                  setShowFeedback,
                  feedbackMessage,
                  setFeedbackMessage,
                  feedbackType,
                  setFeedbackType
                }}
              />
            )}
            
            {currentStep === 'assessment' && (
              <AssessmentStep
                content={currentAssignment.steps.assessment}
                assignment={currentAssignment}
                onComplete={handleStepComplete}
              />
            )}
            
            {currentStep === 'completion' && (
              <CompletionStep
                completedResults={completedResults}
                masterContainerData={masterContainerData}
                studentXP={studentXP}
                onContinueToExperience={() => handleMasterContainerComplete(completedResults)}
                onExit={onExit}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* XP Gain Animation Overlay */}
      {showXPGain && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2">
            <Star className="w-5 h-5" />
            <span className="font-bold">+{lastXPGain} XP</span>
          </div>
        </div>
      )}
      
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
      
      {/* Hovering Finn Chatbot */}
      <FinnChatbot
        isVisible={showFeedback}
        message={feedbackMessage}
        feedbackType={feedbackType}
        onClose={() => setShowFeedback(false)}
      />
    </div>
  );
};

// ================================================================
// STEP COMPONENTS
// ================================================================

const InstructionStep: React.FC<{
  content: any;
  assignment: AssignmentCard;
  onComplete: (results: any) => void;
}> = ({ content, assignment, onComplete }) => {
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {content.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Let's learn about {assignment.skill.skillName}
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Concept:</h3>
        <p className="text-gray-700 dark:text-gray-300">{content.concept}</p>
      </div>

      {content.examples && content.examples.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Example {currentExampleIndex + 1} of {content.examples.length}:
          </h3>
          <div className="space-y-3">
            <p className="text-gray-900 dark:text-white"><strong>Question:</strong> {content.examples[currentExampleIndex].question}</p>
            <p className="text-gray-900 dark:text-white"><strong>Answer:</strong> {content.examples[currentExampleIndex].answer}</p>
            <p className="text-gray-900 dark:text-white"><strong>Explanation:</strong> {content.examples[currentExampleIndex].explanation}</p>
          </div>
          
          {content.examples.length > 1 && (
            <div className="flex justify-center mt-4 space-x-2">
              {content.examples.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentExampleIndex(index)}
                  className={`w-3 h-3 rounded-full ${
                    index === currentExampleIndex ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {content.keyPoints && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Key Points:</h3>
          <ul className="space-y-2">
            {content.keyPoints.map((point: string, index: number) => (
              <li key={index} className="flex items-start space-x-2">
                <Star className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={() => onComplete({ completed: true })}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          Continue to Practice
        </button>
      </div>
    </div>
  );
};

const PracticeStep: React.FC<{
  content: any;
  assignment: AssignmentCard;
  onComplete: (results: any) => void;
  masterTool: ReturnType<typeof useMasterTool>;
  masterContainerData: MasterContainerData;
  feedbackState: {
    showFeedback: boolean;
    setShowFeedback: (show: boolean) => void;
    feedbackMessage: string;
    setFeedbackMessage: (message: string) => void;
    feedbackType: 'neutral' | 'correct' | 'incorrect' | 'hint';
    setFeedbackType: (type: 'neutral' | 'correct' | 'incorrect' | 'hint') => void;
  };
}> = ({ content, assignment, onComplete, masterTool, masterContainerData, feedbackState }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [toolLoaded, setToolLoaded] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // FinnSpeak integration state
  const [calculatorResult, setCalculatorResult] = useState<string>('');
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [hintCount, setHintCount] = useState(0);
  const [clearCalculatorTrigger, setClearCalculatorTrigger] = useState(false);
  
  // Destructure feedback state
  const { showFeedback, setShowFeedback, feedbackMessage, setFeedbackMessage, feedbackType, setFeedbackType } = feedbackState;
  
  // Generate 10 practice questions based on the assignment skill
  const generatePracticeQuestions = () => {
    console.log('🚨 QUESTION GENERATOR RUNNING - assignment object:', assignment);
    
    const skillName = assignment.skill.skillName || assignment.skill.skill_name || 'Unknown Skill';
    const skillCode = assignment.skill.skillCode || assignment.skill.skill_code || assignment.skill.skill_number || '';
    const rawGradeLevel = masterContainerData.metadata.gradeLevel || 'K';
    // Extract numeric grade from strings like "7th Grade", "Grade 7", "7", etc.
    const gradeLevel = parseInt(rawGradeLevel.toString().replace(/[^0-9]/g, '')) || 0;
    const questions = [];
    
    console.log('🎯 SKILL DATA:', { 
      fullSkillObject: assignment.skill,
      extractedSkillName: skillName, 
      extractedSkillCode: skillCode, 
      rawGradeLevel: rawGradeLevel,
      parsedGradeLevel: gradeLevel,
      subject: assignment.skill.subject 
    });
    
    console.log('🔍 A.1 CONDITION CHECK:', {
      skillCodeMatch: skillCode === 'A.1',
      skillNameMatch: skillName.toLowerCase().includes('identify numbers'),
      skillNameIncludes: skillName.toLowerCase().includes('identify'),
      integerMatch: skillName.toLowerCase().includes('integer'),
      domainRangeMatch: skillName.toLowerCase().includes('domain') && skillName.toLowerCase().includes('range'),
      letterMatch: skillName.toLowerCase().includes('letter') && skillName.toLowerCase().includes('alphabet'),
      letterCheck: skillName.toLowerCase().includes('letter'),
      alphabetCheck: skillName.toLowerCase().includes('alphabet'),
      communityHelperMatch: skillName.toLowerCase().includes('community') || skillName.toLowerCase().includes('helper'),
      socialStudiesMatch: skillName.toLowerCase().includes('social studies') || skillName.toLowerCase().includes('community helper'),
      JORDAN_7TH_SOCIAL_CHECK: {
        isA1: skillCode === 'A.1',
        hasIdentify: skillName.toLowerCase().includes('identify'),
        isSocialStudies: assignment.skill.subject === 'SocialStudies',
        isGrade6Plus: gradeLevel >= 6,
        gradeLevel: gradeLevel,
        shouldMatch: skillCode === 'A.1' && skillName.toLowerCase().includes('identify') && assignment.skill.subject === 'SocialStudies' && gradeLevel >= 6
      },
      actualSkillCode: skillCode,
      actualSkillName: skillName,
      lowercaseSkillName: skillName.toLowerCase(),
      subject: assignment.skill.subject || 'Unknown'
    });
    
    // Generate skill-appropriate questions based on skill code and name
    // A.0 Civics for Social Studies (PreK-2)
    if (skillCode === 'A.0' && assignment.skill.subject === 'SocialStudies' && skillName.toLowerCase().includes('civics')) {
      // A.0 Civics: Basic community and citizenship concepts (PreK-2)
      const civicsScenarios = [
        { question: 'Who helps keep our community safe?', answer: 'police', hint: 'They wear uniforms and help when people need assistance' },
        { question: 'Where do children go to learn?', answer: 'school', hint: 'This is a place with classrooms and teachers' },
        { question: 'Who helps sick people feel better?', answer: 'doctor', hint: 'They work in hospitals and clinics' },
        { question: 'Who puts out fires?', answer: 'firefighter', hint: 'They use water hoses and drive red trucks' },
        { question: 'Where do we borrow books?', answer: 'library', hint: 'This quiet place has many books to read' },
        { question: 'Who brings mail to our house?', answer: 'mail carrier', hint: 'They deliver letters and packages every day' },
        { question: 'Where do we buy food?', answer: 'store', hint: 'People go here to get groceries and supplies' },
        { question: 'Who teaches children at school?', answer: 'teacher', hint: 'They help students learn new things' }
      ];
      
      for (let i = 0; i < 10; i++) {
        const scenario = civicsScenarios[Math.floor(Math.random() * civicsScenarios.length)];
        questions.push({
          question: scenario.question,
          answer: scenario.answer,
          hint: scenario.hint,
          targetHelper: scenario.answer,
          questionType: 'community_helper'
        });
      }
    } else if (skillCode === 'A.1' && assignment.skill.subject === 'SocialStudies' && skillName.toLowerCase().includes('rules')) {
      // A.1 Rules and laws: Understanding basic rules (PreK-2)
      const rulesScenarios = [
        { question: 'What should you do at a red traffic light?', answer: 'stop', hint: 'Red means danger - vehicles must wait' },
        { question: 'Where should you walk when crossing the street?', answer: 'crosswalk', hint: 'Look for the white striped area' },
        { question: 'What do you say when someone helps you?', answer: 'thank you', hint: 'This shows good manners and respect' },
        { question: 'Where do you put trash?', answer: 'trash can', hint: 'This keeps our community clean' },
        { question: 'What should you do when someone is talking?', answer: 'listen', hint: 'Good listeners show respect to others' },
        { question: 'How should you treat your classmates?', answer: 'kindly', hint: 'Being nice makes everyone feel good' },
        { question: 'What should you do before crossing the street?', answer: 'look both ways', hint: 'Safety first - check for cars' },
        { question: 'Where should you sit on the school bus?', answer: 'seat', hint: 'Stay seated to be safe while riding' }
      ];
      
      for (let i = 0; i < 10; i++) {
        const scenario = rulesScenarios[Math.floor(Math.random() * rulesScenarios.length)];
        questions.push({
          question: scenario.question,
          answer: scenario.answer,
          hint: scenario.hint,
          targetRule: scenario.answer,
          questionType: 'rules_and_laws'
        });
      }
    } else if (skillCode === 'A.1' && (skillName.toLowerCase().includes('community') || skillName.toLowerCase().includes('helper') || (assignment.skill.subject && assignment.skill.subject.toLowerCase() === 'social studies'))) {
      // A.1 Community Helper Identification (PreK-2): Social Studies foundations
      const communityHelpers = [
        { name: 'teacher', question: 'Who helps children learn at school?', workplace: 'school' },
        { name: 'doctor', question: 'Who helps people feel better when they are sick?', workplace: 'hospital' },
        { name: 'firefighter', question: 'Who keeps us safe from fires?', workplace: 'fire station' },
        { name: 'police', question: 'Who keeps our community safe?', workplace: 'police station' },
        { name: 'chef', question: 'Who makes delicious food at restaurants?', workplace: 'restaurant' },
        { name: 'librarian', question: 'Who helps us find books at the library?', workplace: 'library' }
      ];
      
      for (let i = 0; i < 10; i++) {
        const helper = communityHelpers[Math.floor(Math.random() * communityHelpers.length)];
        const questionType = Math.random() < 0.7 ? 'identify' : 'workplace';
        
        if (questionType === 'identify') {
          questions.push({
            question: helper.question,
            answer: helper.name,
            hint: `Look for the person who ${helper.question.toLowerCase().replace('who ', '').replace('?', '')}`,
            targetHelper: helper.name,
            questionType: 'community_helper'
          });
        } else {
          // For workplace questions, change to asking which helper works at a specific place
          questions.push({
            question: `Who works at the ${helper.workplace}?`,
            answer: helper.name,
            hint: `Look for the ${helper.name} - they work at the ${helper.workplace}`,
            targetHelper: helper.name,
            targetWorkplace: helper.workplace,
            questionType: 'community_helper_workplace'
          });
        }
      }
    } else if (skillCode === 'A.1' && skillName.toLowerCase().includes('identify') && gradeLevel <= 2 && (assignment.skill.subject === 'Math' || skillName.toLowerCase().includes('number'))) {
      // A.1 Number Identification (PreK-2): "What number is this?" - ONLY for early elementary Math
      const targetNumbers = skillName.includes('up to 3') ? [1, 2, 3] : [1, 2, 3, 4, 5];
      
      for (let i = 0; i < 10; i++) {
        const number = targetNumbers[Math.floor(Math.random() * targetNumbers.length)];
        questions.push({
          question: `What number is this?`,
          answer: number,
          hint: `Look at the number line and find ${number}`,
          displayNumber: number, // For the number line tool to highlight
          questionType: 'number_identification'
        });
      }
    } else if (skillCode === 'A.1' && skillName.toLowerCase().includes('consonants') && skillName.toLowerCase().includes('vowels')) {
      // A.1 Sort consonants and vowels (1st Grade ELA): "Sort consonants and vowels"
      console.log('📝 A.1 ELA: Generating consonants and vowels sorting questions');
      const vowelConsonantScenarios = [
        { letter: 'A', type: 'vowel', question: 'Is the letter A a vowel or consonant?', answer: 'vowel' },
        { letter: 'E', type: 'vowel', question: 'Is the letter E a vowel or consonant?', answer: 'vowel' },
        { letter: 'I', type: 'vowel', question: 'Is the letter I a vowel or consonant?', answer: 'vowel' },
        { letter: 'O', type: 'vowel', question: 'Is the letter O a vowel or consonant?', answer: 'vowel' },
        { letter: 'U', type: 'vowel', question: 'Is the letter U a vowel or consonant?', answer: 'vowel' },
        { letter: 'B', type: 'consonant', question: 'Is the letter B a vowel or consonant?', answer: 'consonant' },
        { letter: 'C', type: 'consonant', question: 'Is the letter C a vowel or consonant?', answer: 'consonant' },
        { letter: 'D', type: 'consonant', question: 'Is the letter D a vowel or consonant?', answer: 'consonant' },
        { letter: 'F', type: 'consonant', question: 'Is the letter F a vowel or consonant?', answer: 'consonant' },
        { letter: 'G', type: 'consonant', question: 'Is the letter G a vowel or consonant?', answer: 'consonant' }
      ];
      
      // Select 5 unique scenarios for diverse questions
      const shuffledScenarios = [...vowelConsonantScenarios].sort(() => Math.random() - 0.5);
      
      shuffledScenarios.slice(0, 5).forEach((scenario, index) => {
        questions.push({
          question: scenario.question,
          answer: scenario.answer,
          hint: scenario.type === 'vowel' ? 
            `Remember: A, E, I, O, U are vowels. The letter ${scenario.letter} is one of them!` :
            `Remember: Letters that are not A, E, I, O, U are consonants. The letter ${scenario.letter} is not a vowel.`,
          targetLetter: scenario.letter,
          letterType: scenario.type,
          questionType: 'consonant_vowel_sort',
          options: ['vowel', 'consonant']
        });
      });
    } else if (skillCode === 'A.1' && (skillName.toLowerCase().includes('letter') && skillName.toLowerCase().includes('alphabet'))) {
      // A.1 Letter Identification (PreK-2): "Find the letter in the alphabet: uppercase"
      const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const commonLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']; // Start with first 10 letters for K
      
      for (let i = 0; i < 10; i++) {
        const targetLetter = commonLetters[Math.floor(Math.random() * commonLetters.length)];
        const questionType = Math.random() < 0.6 ? 'identify' : 'find';
        
        if (questionType === 'identify') {
          questions.push({
            question: `What letter is this?`,
            answer: targetLetter,
            hint: `This letter comes ${getLetterPositionHint(targetLetter)} in the alphabet`,
            targetLetter: targetLetter,
            questionType: 'letter_identification'
          });
        } else {
          questions.push({
            question: `Find the letter ${targetLetter}`,
            answer: targetLetter,
            hint: `Look for the letter ${targetLetter}`,
            targetLetter: targetLetter,
            questionType: 'letter_find'
          });
        }
      }
    } else if (skillCode === 'A.1' && (skillName.toLowerCase().includes('classify objects') || skillName.toLowerCase().includes('shape') || skillName.toLowerCase().includes('two-dimensional'))) {
      // A.1 Shape Classification (PreK-2): "Classify objects by two-dimensional shape"
      const basicShapes = ['circle', 'square', 'triangle', 'rectangle', 'oval', 'diamond'];
      
      for (let i = 0; i < 10; i++) {
        const targetShape = basicShapes[Math.floor(Math.random() * basicShapes.length)];
        const questionType = Math.random() < 0.6 ? 'identify' : 'classify';
        
        if (questionType === 'identify') {
          questions.push({
            question: `What shape is highlighted?`,
            answer: targetShape,
            hint: `Look at the number of sides and corners`,
            targetShape: targetShape,
            questionType: 'shape_identification'
          });
        } else {
          questions.push({
            question: `Find the ${targetShape}`,
            answer: targetShape,
            hint: `Look for the shape with ${getShapeHint(targetShape)}`,
            targetShape: targetShape,
            questionType: 'shape_classification'
          });
        }
      }
    } else if (skillCode === 'A.1' && (skillName.toLowerCase().includes('integer') || skillName.toLowerCase().includes('understand'))) {
      // A.1 Integer Understanding (Grades 3+): Integer operations and properties
      const gradeNum = typeof gradeLevel === 'number' ? gradeLevel : parseInt(gradeLevel.toString().replace(/[^0-9]/g, '')) || 1;
      const range = gradeNum >= 7 ? 50 : (gradeNum >= 5 ? 20 : 10);
      
      for (let i = 0; i < 10; i++) {
        const operation = Math.random() < 0.6 ? 'addition' : 'subtraction';
        if (operation === 'addition') {
          const a = Math.floor(Math.random() * range) + 1;
          const b = Math.floor(Math.random() * range) + 1;
          questions.push({
            question: `${a} + ${b} = ?`,
            answer: a + b,
            hint: `Add ${a} and ${b} together`,
            questionType: 'addition'
          });
        } else {
          const a = Math.floor(Math.random() * range) + range; // Ensure positive result
          const b = Math.floor(Math.random() * range) + 1;
          questions.push({
            question: `${a} - ${b} = ?`,
            answer: a - b,
            hint: `Subtract ${b} from ${a}`,
            questionType: 'subtraction'
          });
        }
      }
    } else if (skillCode === 'A.1' && (skillName.toLowerCase().includes('domain') && skillName.toLowerCase().includes('range'))) {
      // A.1 Domain and Range (Precalculus): Function domain and range problems
      const functionTypes = [
        { 
          func: 'f(x) = x²', 
          domain: 'All real numbers', 
          range: 'y ≥ 0',
          question: 'What is the domain of f(x) = x²?',
          answer: 'All real numbers'
        },
        { 
          func: 'f(x) = √x', 
          domain: 'x ≥ 0', 
          range: 'y ≥ 0',
          question: 'What is the domain of f(x) = √x?',
          answer: 'x ≥ 0'
        },
        { 
          func: 'f(x) = 1/x', 
          domain: 'x ≠ 0', 
          range: 'y ≠ 0',
          question: 'What is the domain of f(x) = 1/x?',
          answer: 'x ≠ 0'
        },
        { 
          func: 'f(x) = |x|', 
          domain: 'All real numbers', 
          range: 'y ≥ 0',
          question: 'What is the range of f(x) = |x|?',
          answer: 'y ≥ 0'
        }
      ];
      
      for (let i = 0; i < 10; i++) {
        const funcData = functionTypes[Math.floor(Math.random() * functionTypes.length)];
        const questionType = Math.random() < 0.5 ? 'domain' : 'range';
        
        if (questionType === 'domain') {
          questions.push({
            question: `What is the domain of ${funcData.func}?`,
            answer: funcData.domain,
            hint: `Think about which x-values make the function defined`,
            questionType: 'domain_range',
            functionType: 'domain'
          });
        } else {
          questions.push({
            question: `What is the range of ${funcData.func}?`,
            answer: funcData.range,
            hint: `Think about which y-values the function can output`,
            questionType: 'domain_range',
            functionType: 'range'
          });
        }
      }
    } else if (skillCode === 'A.1' && (skillName.toLowerCase().includes('main idea') || skillName.toLowerCase().includes('determine the main idea'))) {
      // A.1 Main Idea (7th Grade ELA): "Determine the main idea of a passage"
      const passages = [
        {
          text: "Social media has fundamentally changed how teenagers communicate and form relationships. Unlike previous generations who primarily interacted face-to-face or through phone calls, today's teens maintain friendships through constant digital connections. Platforms like Instagram, Snapchat, and TikTok allow them to share experiences instantly, creating a sense of continuous social presence. However, this digital communication often lacks the emotional depth of in-person conversations. While social media helps teens stay connected with distant friends and find communities with shared interests, it can also lead to anxiety about online image and fear of missing out. Research shows that balanced use of social media, combined with regular face-to-face interaction, leads to healthier social development.",
          mainIdea: "Social media has transformed teenage communication with both positive and negative effects.",
          wrongOptions: [
            "Teenagers prefer social media over face-to-face communication.",
            "Instagram and TikTok are the most popular social media platforms among teens."
          ]
        },
        {
          text: "Climate change is affecting ecosystems around the world in dramatic ways. Rising temperatures are causing ice caps to melt, leading to higher sea levels that threaten coastal communities. In tropical regions, coral reefs are experiencing bleaching events due to warmer ocean temperatures, destroying habitats for countless marine species. Meanwhile, changing precipitation patterns are creating droughts in some areas while causing floods in others. These environmental changes force animals to migrate to new territories, often disrupting food chains and breeding cycles. Scientists emphasize that immediate action is needed to reduce greenhouse gas emissions and implement conservation strategies to protect vulnerable ecosystems before irreversible damage occurs.",
          mainIdea: "Climate change is causing widespread environmental damage requiring immediate action.",
          wrongOptions: [
            "Rising sea levels are the most serious effect of climate change.",
            "Animals are adapting to climate change by migrating to new areas."
          ]
        },
        {
          text: "Learning a musical instrument offers numerous benefits beyond simply creating music. Studies have shown that music education improves cognitive abilities, including memory, attention span, and problem-solving skills. Students who play instruments often perform better in mathematics and language arts, as music training strengthens neural pathways used in these subjects. Additionally, playing an instrument builds discipline and patience, as mastering musical pieces requires consistent practice and dedication. Music also provides emotional benefits, offering a healthy outlet for stress and self-expression. Many successful adults credit their musical training with teaching them perseverance and time management skills that benefited them throughout their careers.",
          mainIdea: "Playing musical instruments provides cognitive, academic, and personal development benefits.",
          wrongOptions: [
            "Students who play instruments always perform better in mathematics.",
            "Music education primarily helps students become professional musicians."
          ]
        }
      ];
      
      // Simple and focused: 5 distinct passages, one main idea question each
      const shuffledPassages = [...passages].sort(() => Math.random() - 0.5);
      const selectedPassages = shuffledPassages.slice(0, 5); // Take first 5 passages
      
      selectedPassages.forEach((passage, index) => {
        const passageNum = index + 1;
        
        questions.push({
          question: `What is the main idea of this passage?`,
          passage: passage.text,
          passageNumber: passageNum,
          answer: passage.mainIdea,
          hint: "Look for the overall message about the topic, not just specific details.",
          options: [passage.mainIdea, ...passage.wrongOptions].sort(() => Math.random() - 0.5),
          questionType: 'main_idea'
        });
      });
    } else if (skillCode === 'A.2' && (skillName.toLowerCase().includes('latitude') || skillName.toLowerCase().includes('longitude') || skillName.toLowerCase().includes('use lines of latitude and longitude'))) {
      // A.2 Latitude/Longitude (7th Grade Social Studies): "Use lines of latitude and longitude"
      const coordinateScenarios = [
        {
          coordinateContext: "You are planning a trip to Paris, France. Your travel app shows that Paris is located at 48.8566°N, 2.3522°E. You need to find another city at a similar latitude for comparison.",
          question: "Which city would be at approximately the same latitude as Paris?",
          correctAnswer: "Seattle, USA (47.6°N)",
          options: [
            "Seattle, USA (47.6°N)",
            "Cairo, Egypt (30.0°N)",
            "Sydney, Australia (33.9°S)"
          ],
          hint: "Look for cities with latitude close to 48.8°N in the Northern Hemisphere.",
          explanation: "Cities at similar latitudes share similar distances from the equator."
        },
        {
          coordinateContext: "A ship's GPS shows its current position as 25.7617°N, 80.1918°W. The captain needs to identify which major city this coordinate represents for navigation purposes.",
          question: "What major city is located at these coordinates?",
          correctAnswer: "Miami, Florida",
          options: [
            "Miami, Florida",
            "New Orleans, Louisiana", 
            "Tampa, Florida"
          ],
          hint: "These coordinates are in southeastern Florida, near the coast.",
          explanation: "The coordinates 25.7617°N, 80.1918°W specifically locate Miami, Florida."
        },
        {
          coordinateContext: "An earthquake occurred at coordinates 35.6762°N, 139.6503°E. Scientists need to determine which hemisphere this location is in for their global monitoring system.",
          question: "In which hemispheres is this earthquake location?",
          correctAnswer: "Northern and Eastern hemispheres",
          options: [
            "Northern and Eastern hemispheres",
            "Southern and Western hemispheres",
            "Northern and Western hemispheres"
          ],
          hint: "Look at the N/S and E/W indicators in the coordinates.",
          explanation: "The 'N' indicates Northern Hemisphere and 'E' indicates Eastern Hemisphere."
        },
        {
          coordinateContext: "A GPS treasure hunt gives you coordinates 34.0522°N, 118.2437°W. You need to identify this famous city to find the next clue.",
          question: "What major city do these coordinates locate?",
          correctAnswer: "Los Angeles, California",
          options: [
            "Los Angeles, California",
            "San Diego, California",
            "Las Vegas, Nevada"
          ],
          hint: "These coordinates are in Southern California, near the Pacific coast.",
          explanation: "The coordinates 34.0522°N, 118.2437°W pinpoint Los Angeles, California."
        },
        {
          coordinateContext: "A pilot is flying from New York City (40.7128°N, 74.0060°W) to London (51.5074°N, 0.1278°W). She needs to understand the coordinate differences for her flight plan.",
          question: "What direction will the pilot primarily travel?",
          correctAnswer: "Northeast",
          options: [
            "Northeast",
            "Southeast", 
            "Northwest"
          ],
          hint: "Compare the latitude and longitude values to determine the direction.",
          explanation: "London has higher latitude and less negative longitude, so the direction is northeast."
        }
      ];
      
      // Select 5 unique scenarios for the 5 questions
      const shuffledScenarios = [...coordinateScenarios].sort(() => Math.random() - 0.5);
      const selectedScenarios = shuffledScenarios.slice(0, 5);
      
      selectedScenarios.forEach((scenario, index) => {
        const scenarioNum = index + 1;
        
        questions.push({
          question: `Coordinate Challenge ${scenarioNum}: ${scenario.question}`,
          coordinateContext: scenario.coordinateContext,
          passageNumber: scenarioNum,
          answer: scenario.correctAnswer,
          hint: scenario.hint,
          options: scenario.options.sort(() => Math.random() - 0.5),
          questionType: 'latitude_longitude',
          explanation: scenario.explanation
        });
      });
    } else if (skillCode === 'A.1' && skillName.toLowerCase().includes('identify') && assignment.skill.subject === 'SocialStudies' && gradeLevel >= 6) {
      // A.1 Social Studies (7th Grade): "Identify lines of latitude and longitude" - use diverse map reading scenarios
      console.log('🗺️ A.1 Social Studies: Generating diverse map reading questions');
      const mapScenarios = [
        {
          mapContext: "You're looking at a US map with latitude and longitude lines marked. You need to identify which type of line runs east-west across the United States.",
          question: "Which lines run east-west (horizontally) on a map?",
          correctAnswer: "Lines of latitude",
          options: [
            "Lines of latitude",
            "Lines of longitude", 
            "Lines of elevation"
          ],
          hint: "Think about which direction latitude lines go across the US.",
          explanation: "Latitude lines run east-west (horizontally) and measure distance north or south. On a US map, they run from the Atlantic to Pacific coasts."
        },
        {
          mapContext: "You're studying a US map that shows both latitude and longitude grid lines. You need to identify which type of line runs north-south through the United States.",
          question: "Which lines run north-south (vertically) on a map?",
          correctAnswer: "Lines of longitude",
          options: [
            "Lines of longitude",
            "Lines of latitude", 
            "Lines of elevation"
          ],
          hint: "Think about which direction longitude lines go through the US.",
          explanation: "Longitude lines run north-south (vertically) and measure distance east or west. On a US map, they run from Canada to Mexico."
        },
        {
          mapContext: "On a US map, you see that Florida is located at approximately 25°N latitude while Alaska's northern border is at about 70°N latitude.",
          question: "Which US state is farther north: Alaska or Florida?",
          correctAnswer: "Alaska",
          options: [
            "Alaska",
            "Florida", 
            "They are at the same latitude"
          ],
          hint: "Higher latitude numbers mean farther north.",
          explanation: "Alaska at 70°N is much farther north than Florida at 25°N. Higher latitude numbers indicate locations closer to the North Pole."
        },
        {
          mapContext: "You're looking at a US map showing that California's western coast is at approximately 125°W longitude while Maine's eastern coast is at about 67°W longitude.",
          question: "Which US state is farther west: California or Maine?",
          correctAnswer: "California",
          options: [
            "California",
            "Maine", 
            "They are at the same longitude"
          ],
          hint: "Higher longitude numbers (with W) mean farther west in the US.",
          explanation: "California at 125°W is farther west than Maine at 67°W. In the US, higher W longitude numbers indicate locations farther from the Prime Meridian."
        },
        {
          mapContext: "You're using a US map with coordinate grids to locate cities. You need to find a city at approximately 40°N latitude and 74°W longitude.",
          question: "What coordinate system helps us locate places on a US map?",
          correctAnswer: "Latitude and longitude",
          options: [
            "Latitude and longitude",
            "North and south directions", 
            "State borders and cities"
          ],
          hint: "Think about the grid system that uses degrees (°) to mark locations.",
          explanation: "Latitude and longitude form a coordinate grid system using degrees that allows us to locate any place precisely, including US cities like New York (40°N, 74°W)."
        }
      ];
      
      // Select 5 unique scenarios for the 5 questions
      const shuffledScenarios = [...mapScenarios].sort(() => Math.random() - 0.5);
      
      shuffledScenarios.slice(0, 5).forEach((scenario, index) => {
        const shuffledOptions = [...scenario.options].sort(() => Math.random() - 0.5);
        
        questions.push({
          question: `Map Reading ${index + 1}: ${scenario.question}`,
          mapContext: scenario.mapContext,
          passageNumber: index + 1,
          answer: scenario.correctAnswer,
          hint: scenario.hint,
          options: shuffledOptions,
          questionType: 'map_reading',
          explanation: scenario.explanation
        });
      });
    } else if (skillCode === 'A.1' && (skillName.toLowerCase().includes('scientific inquiry') || skillName.toLowerCase().includes('process of scientific inquiry'))) {
      // A.1 Scientific Inquiry (7th Grade Science): "The process of scientific inquiry"
      const scenarios = [
        {
          scenario: "A student notices that plants near the window in her classroom are taller than plants on the bookshelf across the room. She wonders if sunlight affects plant growth.",
          question: "What step of the scientific method is the student demonstrating?",
          correctAnswer: "Making an observation",
          options: [
            "Making an observation",
            "Forming a hypothesis",
            "Conducting an experiment",
            "Analyzing results"
          ],
          hint: "Think about what the student is doing when she notices something interesting.",
          explanation: "The student is making an observation - the first step in scientific inquiry."
        },
        {
          scenario: "After observing that window plants are taller, the student asks: 'Does the amount of sunlight affect how tall plants grow?'",
          question: "What scientific inquiry step is this?",
          correctAnswer: "Asking a scientific question",
          options: [
            "Asking a scientific question",
            "Making a prediction",
            "Drawing a conclusion",
            "Collecting data"
          ],
          hint: "Consider what happens after you observe something interesting.",
          explanation: "After making an observation, scientists ask a testable question."
        },
        {
          scenario: "The student predicts: 'If plants receive more sunlight, then they will grow taller because sunlight provides energy for growth.'",
          question: "What part of the scientific method is this statement?",
          correctAnswer: "Forming a hypothesis",
          options: [
            "Forming a hypothesis",
            "Stating a conclusion",
            "Recording data",
            "Identifying variables"
          ],
          hint: "Look for an 'if-then' statement that makes a testable prediction.",
          explanation: "A hypothesis is a testable prediction with an if-then statement."
        }
      ];
      
      // Use exactly 3 scenarios - one question from each unique scenario
      scenarios.forEach((scenario, index) => {
        const scenarioNum = index + 1;
        
        // Randomize the answer options so correct answer isn't always A
        const shuffledOptions = [...scenario.options].sort(() => Math.random() - 0.5);
        
        questions.push({
          question: scenario.question,
          scenario: scenario.scenario,
          passageNumber: scenarioNum,
          answer: scenario.correctAnswer,
          hint: scenario.hint,
          options: shuffledOptions, // Use randomized options
          questionType: 'scientific_inquiry',
          explanation: scenario.explanation
        });
      });
    } else if (skillCode === 'A.1' && (skillName.toLowerCase().includes('read maps') || skillName.toLowerCase().includes('map reading'))) {
      // A.1 Map Reading (7th Grade Social Studies): "Read maps"
      const mapScenarios = [
        {
          mapContext: "You're looking at a topographic map of Mount Rainier National Park. The map scale shows 1 inch = 1 mile. You measure the distance between the visitor center and Paradise Lodge as 3.5 inches on the map.",
          question: "What is the actual distance between these two locations?",
          correctAnswer: "3.5 miles",
          options: [
            "3.5 miles",
            "35 miles", 
            "0.35 miles"
          ],
          hint: "Use the map scale to convert map distance to real distance.",
          explanation: "With a scale of 1 inch = 1 mile, a 3.5-inch distance on the map equals 3.5 miles in reality."
        },
        {
          mapContext: "On a political map of Europe, you see a small star symbol next to the city of Paris. The map legend shows that a star symbol represents a national capital.",
          question: "What does the star symbol tell you about Paris?",
          correctAnswer: "Paris is the capital city of France",
          options: [
            "Paris is the capital city of France",
            "Paris is a major tourist destination",
            "Paris has an international airport"
          ],
          hint: "Check what the map legend says about star symbols.",
          explanation: "Map legends explain what symbols mean. Since stars represent national capitals and Paris has a star, we know Paris is France's capital city."
        },
        {
          mapContext: "You're using a street map that shows a compass rose in the corner. The compass indicates that north points toward the top of the map. You need to travel from the library to the museum, which is directly to the right of the library on the map.",
          question: "In which cardinal direction will you travel?",
          correctAnswer: "East",
          options: [
            "East",
            "West",
            "North"
          ],
          hint: "If north is at the top of the map, which direction is to the right?",
          explanation: "On maps with north at the top, east is to the right, west is to the left, and south is at the bottom."
        }
      ];
      
      for (let i = 0; i < 10; i++) {
        const scenario = mapScenarios[Math.floor(Math.random() * mapScenarios.length)];
        questions.push({
          question: scenario.question,
          mapContext: scenario.mapContext,
          answer: scenario.correctAnswer,
          hint: scenario.hint,
          options: scenario.options,
          questionType: 'map_reading',
          explanation: scenario.explanation
        });
      }
    } else if (skillCode === 'A.0' && skillName.toLowerCase().includes('count')) {
      // A.0 Basic Counting: "How many objects?"
      for (let i = 0; i < 10; i++) {
        const count = Math.floor(Math.random() * 5) + 1; // 1-5 objects
        questions.push({
          question: `How many dots do you see?`,
          answer: count,
          hint: `Count each dot: 1, 2, 3...`,
          objectCount: count,
          questionType: 'counting'
        });
      }
    } else if (skillName.toLowerCase().includes('main idea') || skillName.toLowerCase().includes('passage') || skillName.toLowerCase().includes('reading comprehension')) {
      // ELA Reading Comprehension - Main Idea questions for middle school
      const passages = [
        {
          text: "Scientists have discovered that dolphins use a complex system of clicks and whistles to communicate with each other. These sounds can travel long distances underwater and help dolphins coordinate hunting, warn of danger, and maintain social bonds within their pods.",
          mainIdea: "Dolphins use sounds to communicate for various purposes",
          wrongOptions: ["Dolphins are the smartest marine animals", "Scientists study underwater animals", "Dolphins live in groups called pods"]
        },
        {
          text: "The invention of the printing press in the 15th century revolutionized how information spread throughout Europe. Books became cheaper to produce, leading to increased literacy rates and the rapid spread of new ideas during the Renaissance period.",
          mainIdea: "The printing press changed how information spread in Europe",
          wrongOptions: ["Books were expensive before the printing press", "The Renaissance happened in the 15th century", "Literacy rates were low in medieval times"]
        },
        {
          text: "Climate change is causing arctic ice to melt at an alarming rate. This affects polar bears, who depend on sea ice for hunting seals. As their habitat shrinks, polar bears must travel farther to find food, leading to malnutrition and declining populations.",
          mainIdea: "Climate change threatens polar bears by destroying their habitat",
          wrongOptions: ["Polar bears eat seals", "Arctic ice is melting quickly", "Polar bears are becoming endangered"]
        }
      ];
      
      for (let i = 0; i < 10; i++) {
        const passage = passages[Math.floor(Math.random() * passages.length)];
        questions.push({
          question: `Read this passage and determine the main idea:`,
          passage: passage.text,
          answer: passage.mainIdea,
          hint: "The main idea is the most important point the author is making",
          options: [passage.mainIdea, ...passage.wrongOptions].sort(() => Math.random() - 0.5),
          questionType: 'main_idea'
        });
      }
    } else if ((assignment.skill.subject && assignment.skill.subject.toLowerCase() === 'ela') || skillName.toLowerCase().includes('grammar') || skillName.toLowerCase().includes('sentence')) {
      // ELA Grammar questions for middle school (grades 6-8)
      const grammarTopics = [
        {
          type: 'fix_grammar',
          problems: [
            { sentence: "The students homework was completed on time.", correct: "The student's homework was completed on time.", hint: "Use apostrophe for possession" },
            { sentence: "Its going to rain tomorrow.", correct: "It's going to rain tomorrow.", hint: "It's = it is, its = possessive" },
            { sentence: "I wanted to go to the party I had too much homework.", correct: "I wanted to go to the party, but I had too much homework.", hint: "Use comma + coordinating conjunction for compound sentences" },
            { sentence: "Because it was raining the game was cancelled.", correct: "Because it was raining, the game was cancelled.", hint: "Use comma after introductory clause" }
          ]
        },
        {
          type: 'identify_parts',
          problems: [
            { sentence: "The ancient library contains thousands of rare manuscripts.", subject: "The ancient library", predicate: "contains thousands of rare manuscripts" },
            { sentence: "Several students in the class completed their projects early.", subject: "Several students in the class", predicate: "completed their projects early" }
          ]
        }
      ];
      
      for (let i = 0; i < 10; i++) {
        const topic = grammarTopics[Math.floor(Math.random() * grammarTopics.length)];
        
        if (topic.type === 'fix_grammar') {
          const problem = topic.problems[Math.floor(Math.random() * topic.problems.length)];
          questions.push({
            question: `Fix the grammar error in this sentence: "${problem.sentence}"`,
            answer: problem.correct,
            hint: problem.hint,
            sentence: problem.sentence,
            questionType: 'fix_grammar'
          });
        } else if (topic.type === 'identify_parts') {
          const problem = topic.problems[Math.floor(Math.random() * topic.problems.length)];
          const askSubject = Math.random() < 0.5;
          questions.push({
            question: askSubject 
              ? `Identify the complete subject: "${problem.sentence}"`
              : `Identify the complete predicate: "${problem.sentence}"`,
            answer: askSubject ? problem.subject : problem.predicate,
            hint: askSubject 
              ? "The complete subject includes all words that tell who or what the sentence is about"
              : "The complete predicate includes the verb and all words that tell what the subject does",
            sentence: problem.sentence,
            questionType: 'identify_parts'
          });
        }
      }
    } else if (skillName.toLowerCase().includes('addition') || skillCode.includes('B.')) {
      // Basic Addition for B-level skills
      const maxNumber = gradeLevel === 'K' ? 5 : (gradeLevel === '1' ? 10 : 20);
      for (let i = 0; i < 10; i++) {
        const a = Math.floor(Math.random() * maxNumber) + 1;
        const b = Math.floor(Math.random() * maxNumber) + 1;
        questions.push({
          question: `${a} + ${b} = ?`,
          answer: a + b,
          hint: `Start with ${a} and count up ${b} more`,
          questionType: 'addition'
        });
      }
    } else if (skillName.toLowerCase().includes('subtraction')) {
      // Basic Subtraction
      const maxNumber = gradeLevel === 'K' ? 5 : (gradeLevel === '1' ? 10 : 20);
      for (let i = 0; i < 10; i++) {
        const a = Math.floor(Math.random() * maxNumber) + 5; // Ensure positive result
        const b = Math.floor(Math.random() * a) + 1;
        questions.push({
          question: `${a} - ${b} = ?`,
          answer: a - b,
          hint: `Start with ${a} and take away ${b}`,
          questionType: 'subtraction'
        });
      }
    } else {
      // Diverse number sequence scenarios for early elementary (PreK-2)
      console.log('🔢 Generating diverse number line sequence questions for early elementary');
      const numberScenarios = [
        { start: 1, question: "What number comes next after 1?", answer: 2, hint: "Think: 1, and then what comes next?" },
        { start: 2, question: "What number comes next after 2?", answer: 3, hint: "Count: 1, 2, and then..." },
        { start: 3, question: "What number comes next after 3?", answer: 4, hint: "Keep counting: 1, 2, 3, and then..." },
        { start: 4, question: "What number comes next after 4?", answer: 5, hint: "Continue: 1, 2, 3, 4, and then..." },
        { start: 5, question: "What number comes next after 5?", answer: 6, hint: "Count on: 1, 2, 3, 4, 5, and then..." },
        { start: 0, question: "What number comes after 0?", answer: 1, hint: "Start counting: 0, and then..." },
        { start: 6, question: "What number comes next after 6?", answer: 7, hint: "Keep going: ...5, 6, and then..." },
        { start: 7, question: "What number comes next after 7?", answer: 8, hint: "Continue counting: ...6, 7, and then..." },
        { start: 8, question: "What number comes next after 8?", answer: 9, hint: "Almost to 10: ...7, 8, and then..." },
        { start: 9, question: "What number comes next after 9?", answer: 10, hint: "The big number: ...8, 9, and then..." }
      ];
      
      // Select 5 unique scenarios for diverse questions
      const shuffledScenarios = [...numberScenarios].sort(() => Math.random() - 0.5);
      
      shuffledScenarios.slice(0, 5).forEach((scenario, index) => {
        questions.push({
          question: scenario.question,
          answer: scenario.answer,
          hint: scenario.hint,
          startNumber: scenario.start,
          questionType: 'sequence'
        });
      });
    }
    
    console.log('🎯 Generated questions:', questions.slice(0, 2)); // Log first 2 questions
    return questions;
  };

  // Helper function for shape hints
  const getShapeHint = (shape: string): string => {
    switch (shape.toLowerCase()) {
      case 'circle': return 'curved lines and no corners';
      case 'square': return 'four equal sides and four corners';
      case 'triangle': return 'three sides and three corners';
      case 'rectangle': return 'four sides with opposite sides equal';
      case 'oval': return 'curved lines like a stretched circle';
      case 'diamond': return 'four sides that come to points';
      default: return 'its unique characteristics';
    }
  };

  // Helper function for letter position hints
  const getLetterPositionHint = (letter: string): string => {
    const position = letter.charCodeAt(0) - 'A'.charCodeAt(0) + 1;
    if (position <= 5) return 'very early';
    if (position <= 10) return 'early';
    if (position <= 15) return 'in the middle';
    if (position <= 20) return 'later';
    return 'very late';
  };
  
  const [practiceQuestions] = useState(generatePracticeQuestions());
  
  // ================================================================
  // FINNSPEAK INTEGRATION - Answer Validation & Tutoring System
  // ================================================================
  
  // Generate FinnSpeak feedback based on answer correctness and student context
  const generateFinnSpeakFeedback = (isCorrect: boolean, currentAttempt: number, studentAnswer: string, correctAnswer: string | number): string => {
    const gradeLevel = masterContainerData.metadata.gradeLevel || 'K';
    const studentName = masterContainerData.metadata.studentName || 'there';
    const skillName = assignment.skill.skillName || assignment.skill.skill_name || 'this skill';
    const subject = assignment.skill.subject || 'Math';
    
    // Detect tool type for context-appropriate feedback
    const isElementaryGrade = gradeLevel === 'PreK' || gradeLevel === 'K' || gradeLevel === 'Kindergarten' || gradeLevel === '1' || gradeLevel === '1st Grade' || gradeLevel === '2' || gradeLevel === '2nd Grade';
    const isConsonantVowelTool = skillName.toLowerCase().includes('consonants') && skillName.toLowerCase().includes('vowels');
    const isLetterTool = isElementaryGrade && (subject.toLowerCase() === 'ela' || skillName.toLowerCase().includes('letter')) && !isConsonantVowelTool;
    const isShapeTool = isElementaryGrade && (subject.toLowerCase() === 'science' || skillName.toLowerCase().includes('shape') || skillName.toLowerCase().includes('classify objects'));
    const isNumberLineTool = (gradeLevel === 'PreK' || gradeLevel === 'K' || gradeLevel === 'Kindergarten' || gradeLevel === '1' || gradeLevel === '2') && subject.toLowerCase() === 'math';
    const isCalculatorTool = !isLetterTool && !isShapeTool && !isNumberLineTool && !isConsonantVowelTool;
    
    if (isCorrect) {
      let correctMessages;
      if (isConsonantVowelTool) {
        const currentQ = practiceQuestions[currentQuestion];
        const letter = currentQ?.targetLetter || 'that letter';
        correctMessages = [
          `🎉 Excellent work, ${studentName}! You correctly identified that ${letter} is a ${correctAnswer}!`,
          `✨ Perfect! ${letter} is indeed a ${correctAnswer}!`,
          `🌟 Outstanding! ${letter} is exactly right - it's a ${correctAnswer}!`,
          `🎯 Fantastic! You sorted that ${correctAnswer} beautifully!`,
          `💫 Brilliant work! You're becoming a vowel and consonant expert!`
        ];
      } else if (isLetterTool) {
        correctMessages = [
          `🎉 Excellent work, ${studentName}! You found the letter ${correctAnswer} perfectly!`,
          `✨ Perfect! You're really mastering ${skillName}!`,
          `🌟 Outstanding! The letter ${correctAnswer} is exactly right!`,
          `🎯 Fantastic! You identified that letter beautifully!`,
          `💫 Brilliant work! You're becoming a letter expert!`
        ];
      } else if (isShapeTool) {
        correctMessages = [
          `🎉 Excellent work, ${studentName}! You identified the ${correctAnswer} perfectly!`,
          `✨ Perfect! You're really mastering ${skillName}!`,
          `🌟 Outstanding! The ${correctAnswer} is exactly right!`,
          `🎯 Fantastic! You recognized that shape beautifully!`,
          `💫 Brilliant work! You're becoming a shape expert!`
        ];
      } else if (isNumberLineTool) {
        correctMessages = [
          `🎉 Excellent work, ${studentName}! You found ${correctAnswer} on the number line!`,
          `✨ Perfect! You're really mastering ${skillName}!`,
          `🌟 Outstanding! ${correctAnswer} is absolutely correct!`,
          `🎯 Fantastic! You spotted that number perfectly!`,
          `💫 Brilliant work! You're a number line champion!`
        ];
      } else {
        correctMessages = [
          `🎉 Excellent work, ${studentName}! You got ${correctAnswer} exactly right!`,
          `✨ Perfect! You're really mastering ${skillName}!`,
          `🌟 Outstanding! ${correctAnswer} is absolutely correct!`,
          `🎯 Fantastic! You solved that beautifully!`,
          `💫 Brilliant work! You're on fire today!`
        ];
      }
      
      // Add encouragement for consecutive correct answers
      if (consecutiveCorrect >= 2) {
        const streakMessage = `🔥 Amazing streak! That's ${consecutiveCorrect + 1} in a row!`;
        let celebrationMessage;
        if (isConsonantVowelTool) {
          const currentQ = practiceQuestions[currentQuestion];
          const letter = currentQ?.targetLetter || 'that letter';
          celebrationMessage = `🎉 Excellent work, ${studentName}! You correctly identified that ${letter} is a ${correctAnswer}!`;
        } else if (isLetterTool) {
          celebrationMessage = `🎉 Excellent work, ${studentName}! You found the letter ${correctAnswer} perfectly!`;
        } else if (isShapeTool) {
          celebrationMessage = `🎉 Excellent work, ${studentName}! You identified the ${correctAnswer} perfectly!`;
        } else if (isNumberLineTool) {
          celebrationMessage = `🎉 Excellent work, ${studentName}! You found ${correctAnswer} on the number line!`;
        } else {
          celebrationMessage = `🎉 Excellent work, ${studentName}! You got ${correctAnswer} exactly right!`;
        }
        return `${streakMessage} ${celebrationMessage}`;
      }
      
      return correctMessages[Math.floor(Math.random() * correctMessages.length)];
    } else {
      // Provide age-appropriate encouragement and hints
      const encouragingMessages = [
        `💪 Great effort, ${studentName}! Let's try again together.`,
        `🤔 That's not quite right, but you're thinking well!`,
        `🎯 Close! Let me help you get there.`,
        `💭 Good try! Let's work through this step by step.`,
        `🌟 You're learning! That's what matters most.`
      ];
      
      // Progressive hints based on attempt number - tool-specific
      if (currentAttempt === 1) {
        if (isConsonantVowelTool) {
          return `${encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]} 💡 Hint: ${practiceQuestions[currentQuestion]?.hint}. Think about whether this letter is A, E, I, O, or U!`;
        } else if (isLetterTool) {
          return `${encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]} 💡 Hint: ${practiceQuestions[currentQuestion]?.hint}. Look carefully at the letters!`;
        } else if (isShapeTool) {
          return `${encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]} 💡 Hint: ${practiceQuestions[currentQuestion]?.hint}. Look at the shape's sides and corners!`;
        } else if (isNumberLineTool) {
          return `${encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]} 💡 Hint: ${practiceQuestions[currentQuestion]?.hint}. Try clicking on the number line!`;
        } else {
          return `${encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]} 💡 Hint: Try using the calculator to solve ${practiceQuestions[currentQuestion]?.hint}`;
        }
      } else if (currentAttempt === 2) {
        if (isConsonantVowelTool) {
          return `🎈 You're getting closer! Remember: ${practiceQuestions[currentQuestion]?.hint}. Is this letter one of the vowels: A, E, I, O, U?`;
        } else if (isLetterTool) {
          return `🎈 You're getting closer! Remember: ${practiceQuestions[currentQuestion]?.hint}. Which letter button matches what you see?`;
        } else if (isShapeTool) {
          return `🎈 You're getting closer! Remember: ${practiceQuestions[currentQuestion]?.hint}. Which shape has those characteristics?`;
        } else if (isNumberLineTool) {
          return `🎈 You're getting closer! Remember: ${practiceQuestions[currentQuestion]?.hint}. Which number on the line is correct?`;
        } else {
          return `🎈 You're getting closer! Remember: ${practiceQuestions[currentQuestion]?.hint}. What does the calculator show when you press those numbers?`;
        }
      } else {
        if (isConsonantVowelTool) {
          const currentQ = practiceQuestions[currentQuestion];
          const letter = currentQ?.targetLetter || 'this letter';
          return `🤝 Let's solve this together! ${letter} is a ${correctAnswer}. ${correctAnswer === 'vowel' ? 'Vowels are A, E, I, O, U' : 'All other letters are consonants'}. Try the next one!`;
        } else if (isLetterTool) {
          return `🤝 Let's solve this together! The answer is ${correctAnswer}. That's the letter we were looking for! Try the next one!`;
        } else if (isShapeTool) {
          return `🤝 Let's solve this together! The answer is ${correctAnswer}. That's the shape with those special features! Try the next one!`;
        } else if (isNumberLineTool) {
          return `🤝 Let's solve this together! The answer is ${correctAnswer}. See that number on the line? Try the next one!`;
        } else {
          return `🤝 Let's solve this together! The answer is ${correctAnswer}. See how ${practiceQuestions[currentQuestion]?.hint} equals ${correctAnswer}? Try the next one!`;
        }
      }
    }
  };
  
  // Validate answer and provide FinnSpeak feedback
  const validateAnswer = async (submittedAnswer: string) => {
    console.log('🎯 FinnSpeak: validateAnswer called with:', submittedAnswer);
    setIsProcessingAnswer(true);
    setShowFeedback(false);
    
    // Get current question details
    const currentQ = practiceQuestions[currentQuestion];
    const correctAnswer = currentQ?.answer;
    
    let isCorrect = false;
    
    // Handle different answer types
    if (currentQ?.questionType === 'main_idea' || currentQ?.questionType === 'scientific_inquiry' || currentQ?.questionType === 'map_reading' || currentQ?.questionType === 'latitude_longitude') {
      // For main idea, scientific inquiry, and map reading questions, submittedAnswer is a letter (A, B, C)
      // Find the correct letter by finding the index of the correct answer in options
      const correctOptionIndex = currentQ?.options?.findIndex(option => option === correctAnswer);
      const correctLetter = correctOptionIndex !== -1 ? String.fromCharCode(65 + correctOptionIndex) : 'A';
      isCorrect = submittedAnswer === correctLetter;
      
      const emoji = currentQ?.questionType === 'main_idea' ? '🎯' : 
                    currentQ?.questionType === 'scientific_inquiry' ? '🔬' : 
                    currentQ?.questionType === 'map_reading' ? '🗺️' : '🌍';
      console.log(`${emoji} ${currentQ?.questionType} Validation:`, {
        submittedLetter: submittedAnswer,
        correctAnswer,
        correctOptionIndex,
        correctLetter,
        isCorrect,
        options: currentQ?.options
      });
    } else if (currentQ?.questionType === 'consonant_vowel_sort') {
      // For consonant/vowel sorting questions, compare directly (no letter conversion)
      isCorrect = submittedAnswer === correctAnswer;
      
      console.log('🔤 Consonant/Vowel Validation:', {
        submittedAnswer,
        correctAnswer,
        isCorrect,
        questionType: currentQ?.questionType
      });
    } else if (currentQ?.questionType === 'shape_identification' || currentQ?.questionType === 'shape_classification') {
      // For shape identification questions, compare directly (no letter conversion)
      isCorrect = submittedAnswer === correctAnswer;
      
      console.log('🔷 Shape Identification Validation:', {
        submittedAnswer,
        correctAnswer,
        isCorrect,
        questionType: currentQ?.questionType
      });
    } else if (currentQ?.questionType === 'rules_and_laws') {
      // For rules and laws questions, compare directly (no letter conversion)
      isCorrect = submittedAnswer === correctAnswer;
      
      console.log('🏛️ Rules and Laws Validation:', {
        submittedAnswer,
        correctAnswer,
        isCorrect,
        questionType: currentQ?.questionType
      });
    } else if (currentQ?.questionType === 'letter_identification' || currentQ?.questionType === 'letter_find') {
      // For letter identification questions, compare directly (case-insensitive)
      isCorrect = submittedAnswer.toUpperCase() === correctAnswer.toString().toUpperCase();
      
      console.log('🔤 Letter Identification Validation:', {
        submittedAnswer,
        correctAnswer,
        isCorrect,
        questionType: currentQ?.questionType
      });
    } else if (currentQ?.questionType === 'community_helper' || currentQ?.questionType === 'community_helper_workplace') {
      // For community helper questions, compare directly (case-insensitive)
      isCorrect = submittedAnswer.toLowerCase() === correctAnswer.toString().toLowerCase();
      
      console.log('🏘️ Community Helper Validation:', {
        submittedAnswer,
        correctAnswer,
        isCorrect,
        questionType: currentQ?.questionType
      });
    } else {
      // For numeric questions, parse as number
      const studentAnswer = parseInt(submittedAnswer);
      isCorrect = studentAnswer === correctAnswer;
      
      console.log('🎯 Numeric Validation:', {
        submittedAnswer,
        correctAnswer,
        studentAnswer,
        isCorrect
      });
    }
    
    // Track attempt count for this question
    const currentAttemptCount = (answers[currentQuestion] ? answers[currentQuestion].split(',').length : 0) + 1;
    
    // Generate FinnSpeak feedback
    const feedback = generateFinnSpeakFeedback(isCorrect, currentAttemptCount, submittedAnswer, correctAnswer);
    
    // Update state
    setFeedbackMessage(feedback);
    setFeedbackType(isCorrect ? 'correct' : 'incorrect');
    setShowFeedback(true);
    setIsProcessingAnswer(false);
    
    // Handle correct answer
    if (isCorrect) {
      setConsecutiveCorrect(prev => prev + 1);
      setHintCount(0);
      
      // Auto-progress to next question after celebration
      setTimeout(() => {
        if (currentQuestion < practiceQuestions.length - 1) {
          const nextQuestionIndex = currentQuestion + 1;
          console.log('🔄 Practice Questions: Advancing from question', currentQuestion, 'to question', nextQuestionIndex);
          console.log('🔄 Previous question:', practiceQuestions[currentQuestion]);
          console.log('🔄 Next question will be:', practiceQuestions[nextQuestionIndex]);
          
          setCurrentQuestion(nextQuestionIndex);
          setShowFeedback(false);
          setFeedbackType('neutral');
          clearCalculator(); // Clear calculator for next question
          
          // Force synchronization by triggering tool refresh
          setClearCalculatorTrigger(true);
          setTimeout(() => setClearCalculatorTrigger(false), 100);
        } else {
          // Complete the practice session
          const results = {
            questionsCompleted: practiceQuestions.length,
            correctAnswers: consecutiveCorrect + 1,
            totalAttempts: answers.length,
            skillMastery: ((consecutiveCorrect + 1) / practiceQuestions.length) * 100,
            timeCompleted: new Date().toISOString()
          };
          onComplete(results);
        }
      }, 2000);
    } else {
      setConsecutiveCorrect(0);
      setHintCount(prev => prev + 1);
    }
    
    // Update answers array
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = submittedAnswer;
    setAnswers(newAnswers);
  };
  
  // Handle calculator result capture
  const handleCalculatorResult = (result: string) => {
    console.log('🧮 Calculator result captured:', result);
    setCalculatorResult(result);
    // Auto-validate when calculator shows a result
    if (result && !isNaN(parseInt(result))) {
      console.log('🧮 Auto-validating calculator result:', result);
      validateAnswer(result);
    } else {
      console.log('🧮 Calculator result not numeric, not auto-validating');
    }
  };
  
  // Handle manual answer submission
  const handleAnswerSubmit = () => {
    const answer = answers[currentQuestion] || calculatorResult;
    console.log('🎯 FinnSpeak: Submitting answer:', answer);
    if (answer) {
      validateAnswer(answer);
    } else {
      console.log('⚠️ FinnSpeak: No answer to submit');
    }
  };
  
  // Clear calculator display
  const clearCalculator = () => {
    setCalculatorResult('');
    setClearCalculatorTrigger(prev => !prev); // Toggle trigger to reset calculator
    console.log('🧮 Calculator cleared for next question');
  };
  
  // Debug initial state
  console.log('🧮 PracticeStep Debug:', {
    currentQuestion,
    calculatorResult,
    showFeedback,
    feedbackType,
    feedbackMessage,
    practiceQuestions: practiceQuestions.length,
    currentQuestionData: practiceQuestions[currentQuestion]
  });
  
  // Prepare tool configuration for split-screen instead of modal
  const [toolConfig, setToolConfig] = useState<ToolConfiguration | null>(null);
  const [assignmentContext, setAssignmentContext] = useState<AssignmentContext | null>(null);
  
  useEffect(() => {
    const setupTool = async () => {
      const context: AssignmentContext = {
        skillCode: assignment.skill.skill_number || assignment.skill.skillCode || 'unknown',
        skillName: assignment.skill.skillName || assignment.skill.skill_name || 'Unknown Skill',
        subject: assignment.skill.subject || 'Unknown',
        gradeLevel: masterContainerData.metadata.gradeLevel || 'K',
        difficulty: assignment.skill.difficulty_level || 5,
        topic: assignment.skill.skillName || assignment.skill.skill_name || 'Unknown Topic',
        learningObjective: `Master ${assignment.skill.skillName || assignment.skill.skill_name || 'this skill'} concepts`,
        studentId: masterContainerData.metadata.studentName || 'student',
        sessionId: `learn-session-${Date.now()}`
      };
      
      setAssignmentContext(context);
      
      // Get tool configuration without opening modal
      console.log('🎯 Preparing tool config for split-screen practice:', context);
      
      // Trigger tool discovery but don't open modal
      // We'll use a direct approach to avoid opening the modal
      console.log('🎯 Using direct tool discovery for embedded mode');
      
      // Actually call MCP discovery for real tools
      let demoToolConfig: ToolConfiguration;
      try {
        const discoveredTools = await masterTool.agentSystem?.requestAgentAction('tool', 'discover_tools', {
        skillCategory: context.skillCode,
        subject: context.subject,
        gradeLevel: context.gradeLevel,
        learningObjective: context.learningObjective,
        maxResults: 1
      });
      
      console.log('🔍 MCP Discovery Result:', discoveredTools);
      
      // Log the actual structure to debug
      if (discoveredTools?.success) {
        console.log('🔍 Tools data structure:', discoveredTools.data);
        console.log('🔍 First tool:', discoveredTools.data?.discoveredTools?.[0] || discoveredTools.data?.tools?.[0]);
      }
      
      // Use the first discovered tool or fallback - check both possible structures
      const tools = discoveredTools?.data?.discoveredTools || discoveredTools?.data?.tools || [];
      if (discoveredTools?.success && tools.length > 0) {
        const tool = tools[0];
        console.log('🎯 Using discovered tool:', tool);
        
        demoToolConfig = {
          toolType: 'generic',
          toolName: tool.name,
          description: tool.description,
          instructions: `Use this ${tool.name} to help solve math problems`,
          parameters: {
            launchUrl: tool.source?.url || tool.configuration?.launchUrl,
            integrationMethod: 'embedded',
            skillCode: context.skillCode,
            skillName: context.skillName,
            toolId: tool.id
          },
          appearance: {
            width: 800,
            height: 500,
            position: 'center',
            theme: 'auto'
          },
          interactions: {
            allowMinimize: false,
            allowFullscreen: false,
            allowSettings: false,
            autoFocus: true
          }
        };
      } else {
        throw new Error('No tools discovered');
      }
      
    } catch (error) {
      console.error('🚨 MCP Discovery failed:', error);
      // Fallback configuration
      demoToolConfig = {
        toolType: 'generic',
        toolName: 'Scientific Calculator',
        description: 'Fallback calculator tool',
        instructions: 'Use this calculator to help solve math problems',
        parameters: {
          launchUrl: 'https://calculator-1.com/',
          integrationMethod: 'iframe',
          skillCode: context.skillCode,
          skillName: context.skillName
        },
        appearance: {
          width: 800,
          height: 500,
          position: 'center',
          theme: 'auto'
        },
        interactions: {
          allowMinimize: false,
          allowFullscreen: true,
          allowSettings: false,
          allowSound: true
        },
        accessibility: {
          highContrast: false,
          screenReader: true,
          keyboardNavigation: true
        }
      };
    }
    
      setToolConfig(demoToolConfig);
      setToolLoaded(true);
    };
    
    setupTool();
  }, []);
  
  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };
  
  const handleNextQuestion = () => {
    if (currentQuestion < practiceQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions completed
      const score = calculateScore();
      onComplete({ score, attempts: 1, questionsCompleted: practiceQuestions.length });
    }
  };
  
  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (parseInt(answer) === practiceQuestions[index].answer) {
        correct++;
      }
    });
    return Math.round((correct / practiceQuestions.length) * 100);
  };
  
  return (
    <div className="h-full">
      <div className="text-center mb-1 relative">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Practice Time!
        </h2>
        
        {/* Debug Button - Top Right */}
        <button
          onClick={() => setShowDebugInfo(!showDebugInfo)}
          className="absolute top-0 right-0 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          title="Toggle MCP Debug Info"
        >
          🔍 Debug
        </button>
      </div>
      
      {/* Collapsible Debug Panel */}
      {showDebugInfo && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
          <h5 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">🔍 MCP Discovery Success (Demo Mode)</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-700 dark:text-gray-300">
            <div>
              <p><span className="font-semibold text-blue-800 dark:text-blue-300">Tool ID:</span> {assignmentContext?.skillCode || 'unknown'}</p>
              <p><span className="font-semibold text-blue-800 dark:text-blue-300">Source:</span> MCP Discovery</p>
              <p><span className="font-semibold text-orange-600 dark:text-orange-400">Demo URL:</span> {toolConfig?.toolName || 'Loading...'}</p>
            </div>
            <div>
              <p><span className="font-semibold text-blue-800 dark:text-blue-300">Assignment:</span> {assignmentContext?.skillName}</p>
              <p><span className="font-semibold text-blue-800 dark:text-blue-300">Grade Level:</span> {assignmentContext?.gradeLevel}</p>
              <p><span className="font-semibold text-blue-800 dark:text-blue-300">Subject:</span> {assignmentContext?.subject}</p>
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Split Layout: Questions Top, Tool Bottom */}
      <div className="flex flex-col gap-3 h-[calc(100vh-200px)]">
        
        {/* Section 1: Practice Questions - Compact */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col h-2/5">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Practice Questions
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {currentQuestion + 1} of {practiceQuestions.length}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / practiceQuestions.length) * 100}%` }}
              />
            </div>
            
            {/* Current Question */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {(() => {
                    const currentQ = practiceQuestions[currentQuestion];
                    console.log('🎯 Practice Questions Display: currentQuestion =', currentQuestion);
                    console.log('🎯 Practice Questions Display: question =', currentQ?.question);
                    console.log('🎯 Practice Questions Display: options =', currentQ?.options);
                    return currentQ?.question;
                  })()}
                </div>
                
                {/* Display passage, scenario, map context, or coordinate context with expandable panel */}
                {(practiceQuestions[currentQuestion]?.passage || 
                  practiceQuestions[currentQuestion]?.scenario || 
                  practiceQuestions[currentQuestion]?.mapContext ||
                  practiceQuestions[currentQuestion]?.coordinateContext) && (
                  <div className="mb-2">
                    <ExpandableReadingPanel
                      title={
                        practiceQuestions[currentQuestion]?.passage ? 
                          (practiceQuestions[currentQuestion]?.passageNumber ? 
                            `Reading Passage ${practiceQuestions[currentQuestion]?.passageNumber}` : 
                            'Reading Passage') :
                        practiceQuestions[currentQuestion]?.scenario ? 'Scientific Scenario' :
                        practiceQuestions[currentQuestion]?.mapContext ? 'Map Context' :
                        practiceQuestions[currentQuestion]?.coordinateContext ? 
                          (practiceQuestions[currentQuestion]?.passageNumber ? 
                            `Coordinate Challenge ${practiceQuestions[currentQuestion]?.passageNumber}` : 
                            'Coordinate Context') :
                        'Context'
                      }
                      content={
                        practiceQuestions[currentQuestion]?.passage || 
                        practiceQuestions[currentQuestion]?.scenario || 
                        practiceQuestions[currentQuestion]?.mapContext ||
                        practiceQuestions[currentQuestion]?.coordinateContext || ''
                      }
                      icon={
                        practiceQuestions[currentQuestion]?.passage ? <BookOpen className="w-4 h-4" /> :
                        practiceQuestions[currentQuestion]?.scenario ? <span>🔬</span> :
                        practiceQuestions[currentQuestion]?.mapContext ? <span>🗺️</span> :
                        practiceQuestions[currentQuestion]?.coordinateContext ? <span>🌍</span> :
                        <span>📖</span>
                      }
                      iconColor={
                        practiceQuestions[currentQuestion]?.passage ? "text-blue-600" :
                        practiceQuestions[currentQuestion]?.scenario ? "text-green-600" :
                        practiceQuestions[currentQuestion]?.mapContext ? "text-amber-600" :
                        practiceQuestions[currentQuestion]?.coordinateContext ? "text-cyan-600" :
                        "text-gray-600"
                      }
                      compactHeight="max-h-24"
                    >
                      {/* Add World Map for Map Context questions */}
                      {(() => {
                        const currentQ = practiceQuestions[currentQuestion];
                        console.log('🗺️ Map Display Debug:', {
                          currentQuestion,
                          hasMapContext: !!currentQ?.mapContext,
                          mapContext: currentQ?.mapContext,
                          questionType: currentQ?.questionType
                        });
                        return currentQ?.mapContext;
                      })() && (
                        <div className="mt-6">
                          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-300 dark:border-green-600">
                            <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                              📍 <strong>Map Available!</strong> The US map with latitude & longitude lines is displayed below to help answer the question above.
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                              🐛 Debug: Map section is rendering successfully for question type: {practiceQuestions[currentQuestion]?.questionType}
                            </p>
                            <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-600">
                              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                                👆 <strong>Click the maximize button (⬍) above to view the interactive US map!</strong>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                              <span>🗺️</span> US Map with Latitude & Longitude Lines
                            </h3>
                            {/* Zoom Controls */}
                            <div className="flex items-center gap-2 bg-white dark:bg-gray-700 rounded-lg p-1 border border-gray-300 dark:border-gray-600">
                              <button
                                onClick={() => {
                                  const mapContainer = document.getElementById('us-map-container');
                                  const mapImage = document.getElementById('us-map-image');
                                  if (mapContainer && mapImage) {
                                    const currentScale = parseFloat(mapImage.style.transform.replace('scale(', '').replace(')', '') || '1');
                                    const newScale = Math.min(currentScale + 0.25, 3);
                                    mapImage.style.transform = `scale(${newScale})`;
                                    mapImage.style.transformOrigin = 'center';
                                    mapContainer.style.overflow = 'auto';
                                  }
                                }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300"
                                title="Zoom In"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="11" cy="11" r="8"></circle>
                                  <path d="m21 21-4.35-4.35"></path>
                                  <line x1="11" y1="8" x2="11" y2="14"></line>
                                  <line x1="8" y1="11" x2="14" y2="11"></line>
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  const mapContainer = document.getElementById('us-map-container');
                                  const mapImage = document.getElementById('us-map-image');
                                  if (mapContainer && mapImage) {
                                    const currentScale = parseFloat(mapImage.style.transform.replace('scale(', '').replace(')', '') || '1');
                                    const newScale = Math.max(currentScale - 0.25, 0.5);
                                    mapImage.style.transform = `scale(${newScale})`;
                                    mapImage.style.transformOrigin = 'center';
                                    if (newScale <= 1) {
                                      mapContainer.style.overflow = 'hidden';
                                    }
                                  }
                                }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300"
                                title="Zoom Out"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="11" cy="11" r="8"></circle>
                                  <path d="m21 21-4.35-4.35"></path>
                                  <line x1="8" y1="11" x2="14" y2="11"></line>
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  const mapContainer = document.getElementById('us-map-container');
                                  const mapImage = document.getElementById('us-map-image');
                                  if (mapContainer && mapImage) {
                                    mapImage.style.transform = 'scale(1)';
                                    mapContainer.style.overflow = 'hidden';
                                  }
                                }}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-600 dark:text-gray-300 text-xs font-medium px-2"
                                title="Reset Zoom"
                              >
                                Reset
                              </button>
                            </div>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-600 p-4">
                            {/* Zoomable world map container */}
                            <div 
                              id="us-map-container"
                              className="w-full relative max-h-96 overflow-auto border border-gray-200 dark:border-gray-600 rounded bg-white"
                              style={{ cursor: 'grab' }}
                              onMouseDown={(e) => {
                                const container = e.currentTarget;
                                const startX = e.pageX - container.offsetLeft;
                                const startY = e.pageY - container.offsetTop;
                                const scrollLeft = container.scrollLeft;
                                const scrollTop = container.scrollTop;
                                
                                container.style.cursor = 'grabbing';
                                
                                const handleMouseMove = (e: MouseEvent) => {
                                  const x = e.pageX - container.offsetLeft;
                                  const y = e.pageY - container.offsetTop;
                                  const walkX = (x - startX) * 1;
                                  const walkY = (y - startY) * 1;
                                  container.scrollLeft = scrollLeft - walkX;
                                  container.scrollTop = scrollTop - walkY;
                                };
                                
                                const handleMouseUp = () => {
                                  container.style.cursor = 'grab';
                                  document.removeEventListener('mousemove', handleMouseMove);
                                  document.removeEventListener('mouseup', handleMouseUp);
                                };
                                
                                document.addEventListener('mousemove', handleMouseMove);
                                document.addEventListener('mouseup', handleMouseUp);
                              }}
                            >
                              {/* Educational US map with built-in coordinate grid for synchronized zooming */}
                              <div className="relative">
                                {/* US Map with Built-in Latitude/Longitude Grid */}
                                <img 
                                  id="us-map-image"
                                  src="https://www.mapsofworld.com/lat_long/maps/usa-lat-long-map.jpg"
                                  alt="US Map with Latitude and Longitude Grid Lines"
                                  className="w-full h-auto object-contain transition-transform duration-200 select-none"
                                  style={{ transform: 'scale(1)', transformOrigin: 'center' }}
                                  draggable={false}
                                  onLoad={() => {
                                    console.log('🗺️ Educational US Map with coordinate grid loaded successfully');
                                  }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    console.log('❌ Primary map failed, trying fallback:', target.src);
                                    // Try the alternative educational map
                                    target.src = "https://www.mapsofworld.com/lat_long/maps/USA-lat-long.jpg";
                                    target.onError = (fallbackError) => {
                                      console.log('❌ Fallback map also failed, using Wikipedia backup');
                                      (fallbackError.target as HTMLImageElement).src = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Blank_US_Map_%28states_only%29.svg/800px-Blank_US_Map_%28states_only%29.svg.png";
                                    };
                                  }}
                                />
                              </div>
                              
                              {/* Fallback simple educational US map if images fail */}
                              <div 
                                className="w-full h-80 bg-gradient-to-b from-sky-100 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded relative overflow-hidden"
                                style={{ display: 'none' }}
                              >
                                {/* Oceans background */}
                                <div className="absolute inset-0 bg-blue-200 dark:bg-blue-700"></div>
                                
                                {/* US States - simplified shapes representing major regions */}
                                <div className="absolute top-16 left-20 w-24 h-12 bg-green-400 dark:bg-green-600 rounded-sm" title="Western US"></div>
                                <div className="absolute top-20 left-44 w-20 h-16 bg-green-400 dark:bg-green-600 rounded-sm" title="Central US"></div>
                                <div className="absolute top-16 left-64 w-16 h-20 bg-green-400 dark:bg-green-600 rounded-sm" title="Eastern US"></div>
                                <div className="absolute top-40 left-60 w-12 h-8 bg-green-400 dark:bg-green-600 rounded-sm" title="Florida"></div>
                                <div className="absolute top-44 left-24 w-16 h-8 bg-green-400 dark:bg-green-600 rounded-sm" title="Texas"></div>
                                <div className="absolute top-8 left-8 w-12 h-8 bg-green-400 dark:bg-green-600 rounded-sm" title="Alaska"></div>
                                
                                {/* Latitude lines */}
                                <div className="absolute top-12 left-0 w-full h-0.5 bg-red-500 opacity-80"></div>
                                <div className="absolute top-20 left-0 w-full h-0.5 bg-red-400 opacity-70"></div>
                                <div className="absolute top-32 left-0 w-full h-0.5 bg-red-600 opacity-90"></div>
                                <div className="absolute top-44 left-0 w-full h-0.5 bg-red-400 opacity-70"></div>
                                <div className="absolute top-52 left-0 w-full h-0.5 bg-red-500 opacity-80"></div>
                                
                                {/* Longitude lines */}
                                <div className="absolute top-0 left-16 w-0.5 h-full bg-cyan-500 opacity-80"></div>
                                <div className="absolute top-0 left-24 w-0.5 h-full bg-cyan-400 opacity-70"></div>
                                <div className="absolute top-0 left-40 w-0.5 h-full bg-cyan-600 opacity-90"></div>
                                <div className="absolute top-0 left-56 w-0.5 h-full bg-cyan-400 opacity-70"></div>
                                <div className="absolute top-0 left-64 w-0.5 h-full bg-cyan-500 opacity-80"></div>
                                
                                {/* Grid labels */}
                                <div className="absolute top-2 left-2 text-xs text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow">
                                  🔴 Latitude: East-West lines<br/>
                                  🔵 Longitude: North-South lines
                                </div>
                                
                                {/* US Coordinate labels */}
                                <div className="absolute top-8 left-2 text-xs text-red-600 font-semibold">49°N</div>
                                <div className="absolute top-20 left-2 text-xs text-red-600 font-semibold">40°N</div>
                                <div className="absolute top-32 left-2 text-xs text-red-600 font-semibold">30°N</div>
                                <div className="absolute top-48 left-2 text-xs text-red-600 font-semibold">25°N</div>
                                
                                <div className="absolute top-2 left-12 text-xs text-cyan-600 font-semibold transform -rotate-90 origin-left">125°W</div>
                                <div className="absolute top-2 left-36 text-xs text-cyan-600 font-semibold transform -rotate-90 origin-left">100°W</div>
                                <div className="absolute top-2 left-60 text-xs text-cyan-600 font-semibold transform -rotate-90 origin-left">75°W</div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-600">
                            <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                              <strong>📍 How to use this interactive map:</strong>
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-amber-700 dark:text-amber-300">
                              <div>
                                <p className="font-semibold mb-1">🗺️ Map Navigation:</p>
                                <ul className="space-y-1">
                                  <li>• Use <strong>🔍+ / 🔍-</strong> buttons to zoom in/out</li>
                                  <li>• <strong>Click and drag</strong> to pan around when zoomed</li>
                                  <li>• Click <strong>"Reset"</strong> to return to full view</li>
                                </ul>
                              </div>
                              <div>
                                <p className="font-semibold mb-1">🌍 Coordinate System:</p>
                                <ul className="space-y-1">
                                  <li>• <strong>Latitude</strong> (horizontal lines) = North/South of Equator (0°)</li>
                                  <li>• <strong>Longitude</strong> (vertical lines) = East/West of Prime Meridian (0°)</li>
                                  <li>• Use these lines to answer the geography question above</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </ExpandableReadingPanel>
                  </div>
                )}
                
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  💡 Hint: {practiceQuestions[currentQuestion]?.hint}
                </div>
                
                {/* Answer Input Section - Integrated styling */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-blue-200 dark:border-blue-600">
                  <div className="flex items-center justify-center space-x-3">
                    <input
                      type="text"
                      value={calculatorResult || answers[currentQuestion] || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setCalculatorResult(value);
                        const newAnswers = [...answers];
                        newAnswers[currentQuestion] = value;
                        setAnswers(newAnswers);
                      }}
                      className="w-24 p-2 text-center text-lg border border-blue-300 dark:border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-900/30 dark:text-white focus:ring-2 focus:ring-blue-500"
                      placeholder="?"
                      autoFocus
                    />
                    <button
                      onClick={handleAnswerSubmit}
                      disabled={isProcessingAnswer || !answers[currentQuestion]}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm"
                    >
                      {isProcessingAnswer ? 'Checking...' : (currentQuestion === practiceQuestions.length - 1 ? 'Finish' : 'Submit')}
                    </button>
                  </div>
                  
                  {/* Calculator Result Display */}
                  {calculatorResult && (
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">
                      🧮 Calculator shows: <span className="font-mono font-bold">{calculatorResult}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex justify-center items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Use the tool below to help solve the problems!
            </div>
          </div>
        </div>
        
        {/* Section 2: Interactive Tool - Expanded for full calculator */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 h-3/5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Practice Tool
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {toolLoaded ? '🟢 Ready' : '⏳ Loading...'}
            </div>
          </div>
          
          {/* Embedded Tool Container - Full height of bottom section */}
          <div className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
            {toolLoaded && toolConfig && assignmentContext && (
              <EmbeddedToolRenderer 
                toolType={toolConfig.toolType}
                assignment={assignmentContext}
                configuration={toolConfig}
                currentQuestion={practiceQuestions[currentQuestion]}
                onInteraction={(action, data) => {
                  console.log('📊 Tool interaction received:', action, data);
                  
                  // Capture calculator results from iframe interactions
                  if (action === 'calculator_result' && data) {
                    console.log('🧮 Calculator result from iframe:', data);
                    handleCalculatorResult(data.toString());
                  }
                  
                  // Handle calculator display changes
                  if (action === 'calculator_display' && data) {
                    console.log('🧮 Calculator display change:', data);
                    setCalculatorResult(data.toString());
                  }
                  
                  // Handle Number Line tool results - auto-submit answer
                  if (action === 'number_line_result' && data) {
                    console.log('🔢 Number Line answer selected:', data);
                    // Update the answer for current question
                    const newAnswers = [...answers];
                    newAnswers[currentQuestion] = data.toString();
                    setAnswers(newAnswers);
                    
                    // Auto-submit the answer
                    console.log('🎯 Auto-submitting Number Line answer:', data);
                    validateAnswer(data.toString());
                  }
                  
                  // Handle Letter Identification tool results - auto-submit answer
                  if (action === 'letter_identification_result' && data) {
                    console.log('🔤 Letter Identification answer selected:', data);
                    // Update the answer for current question
                    const newAnswers = [...answers];
                    newAnswers[currentQuestion] = data.toString();
                    setAnswers(newAnswers);
                    
                    // Auto-submit the answer
                    console.log('🎯 Auto-submitting Letter Identification answer:', data);
                    validateAnswer(data.toString());
                  }
                  
                  // Handle Shape Sorting tool results - auto-submit answer
                  if (action === 'shape_sorting_result' && data) {
                    console.log('🔷 Shape Sorting answer selected:', data);
                    // Update the answer for current question
                    const newAnswers = [...answers];
                    newAnswers[currentQuestion] = data.toString();
                    setAnswers(newAnswers);
                    
                    // Auto-submit the answer
                    console.log('🎯 Auto-submitting Shape Sorting answer:', data);
                    validateAnswer(data.toString());
                  }
                  
                  // Handle Community Helper tool results - auto-submit answer
                  if (action === 'community_helper_result' && data) {
                    console.log('🏘️ Community Helper answer selected:', data);
                    // Update the answer for current question
                    const newAnswers = [...answers];
                    newAnswers[currentQuestion] = data.toString();
                    setAnswers(newAnswers);
                    
                    // Auto-submit the answer
                    console.log('🎯 Auto-submitting Community Helper answer:', data);
                    validateAnswer(data.toString());
                  }
                  
                  // Handle Rules and Laws tool results - auto-submit answer
                  if (action === 'rules_and_laws_result' && data) {
                    console.log('🏛️ Rules and Laws answer selected:', data);
                    // Update the answer for current question
                    const newAnswers = [...answers];
                    newAnswers[currentQuestion] = data.toString();
                    setAnswers(newAnswers);
                    
                    // Auto-submit the answer
                    console.log('🎯 Auto-submitting Rules and Laws answer:', data);
                    validateAnswer(data.toString());
                  }
                  
                  // Handle Grammar tool results - auto-submit answer
                  if (action === 'grammar_result' && data) {
                    console.log('📝 Grammar answer selected:', data);
                    // Update the answer for current question
                    const newAnswers = [...answers];
                    newAnswers[currentQuestion] = data.toString();
                    setAnswers(newAnswers);
                    
                    // Auto-submit the answer
                    console.log('🎯 Auto-submitting Grammar answer:', data);
                    validateAnswer(data.toString());
                  }
                  
                  // Handle Reading Comprehension tool results - auto-submit answer
                  if (action === 'reading_result' && data) {
                    console.log('📖 Reading Comprehension answer selected:', data);
                    // Update the answer for current question
                    const newAnswers = [...answers];
                    newAnswers[currentQuestion] = data.toString();
                    setAnswers(newAnswers);
                    
                    // Auto-submit the answer
                    console.log('🎯 Auto-submitting Reading Comprehension answer:', data);
                    validateAnswer(data.toString());
                  }
                  
                  // Handle Main Idea tool results - populate answer box only (no auto-submit)
                  if (action === 'main_idea_result' && data) {
                    console.log('🎯 Main Idea answer selected:', data);
                    // Update the answer for current question
                    const newAnswers = [...answers];
                    newAnswers[currentQuestion] = data.toString();
                    setAnswers(newAnswers);
                    
                    // No auto-submit - let user click Submit button manually
                    console.log('🎯 Main Idea answer populated in answer box:', data);
                  }
                  
                  // Handle Scientific Inquiry tool results - populate answer box only (no auto-submit)
                  if (action === 'scientific_inquiry_result' && data) {
                    console.log('🔬 Scientific Inquiry answer selected:', data);
                    // Update the answer for current question
                    const newAnswers = [...answers];
                    newAnswers[currentQuestion] = data.toString();
                    setAnswers(newAnswers);
                    
                    // No auto-submit - let user click Submit button manually
                    console.log('🔬 Scientific Inquiry answer populated in answer box:', data);
                  }
                  
                  // Handle Map Reading tool results - populate answer box only (no auto-submit)
                  if (action === 'map_reading_result' && data) {
                    console.log('🗺️ Map Reading answer selected:', data);
                    // Update the answer for current question
                    const newAnswers = [...answers];
                    newAnswers[currentQuestion] = data.toString();
                    setAnswers(newAnswers);
                    
                    // No auto-submit - let user click Submit button manually
                    console.log('🗺️ Map Reading answer populated in answer box:', data);
                  }
                  
                  // Also capture tool-loaded events
                  if (action === 'tool-loaded') {
                    console.log('🧮 Tool loaded successfully');
                  }
                  
                  // Forward to master tool handler
                  masterTool.handleToolProgress(action, data);
                }}
                onComplete={(results) => {
                  console.log('📊 Tool completed:', results);
                  
                  // If the tool provides a final result, validate it
                  if (results && results.finalAnswer) {
                    handleCalculatorResult(results.finalAnswer.toString());
                  }
                  
                  // Forward to master tool handler
                  masterTool.handleToolComplete(results);
                }}
                toolState={{
                  currentQuestion: practiceQuestions[currentQuestion],
                  expectedAnswer: practiceQuestions[currentQuestion]?.answer,
                  calculatorResult,
                  feedbackType,
                  isProcessingAnswer
                }}
                clearTrigger={clearCalculatorTrigger}
              />
            )}
            {!toolLoaded && (
              <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-800">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading practice tool...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AssessmentStep: React.FC<{
  content: any;
  assignment: AssignmentCard;
  onComplete: (results: any) => void;
}> = ({ content, assignment, onComplete }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSubmit = () => {
    setShowFeedback(true);
    const isCorrect = selectedAnswer === content.correctAnswer;
    
    setTimeout(() => {
      onComplete({
        score: isCorrect ? 95 : 70,
        attempts: 1,
        timeSpent: 120000,
        selectedAnswer: selectedAnswer,
        correctAnswer: content.correctAnswer,
        strengths: ['problem-solving'],
        struggledWith: isCorrect ? [] : ['assessment'],
        masteryLevel: isCorrect ? 'mastered' : 'developing',
        feedback: isCorrect ? 'Excellent work!' : 'Good try! Review the concept and try again.'
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Assessment
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Show what you've learned about {assignment.skill.skillName}
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          {content.question}
        </h3>
        
        <div className="space-y-3">
          {content.options?.map((option: string, index: number) => (
            <label
              key={index}
              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedAnswer === option
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
              }`}
            >
              <input
                type="radio"
                name="assessment"
                value={option}
                checked={selectedAnswer === option}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                className="text-purple-600"
              />
              <span className="text-gray-900 dark:text-white">{option}</span>
            </label>
          ))}
        </div>

        {showFeedback && (
          <div className={`mt-4 p-4 rounded-lg ${
            selectedAnswer === content.correctAnswer
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <p className="font-medium mb-2">
              {selectedAnswer === content.correctAnswer ? '✅ Correct!' : '❌ Incorrect'}
            </p>
            <p className="text-sm">{content.explanation}</p>
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={handleSubmit}
          disabled={!selectedAnswer || showFeedback}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {showFeedback ? 'Processing...' : 'Submit Answer'}
        </button>
      </div>
    </div>
  );
};

const CompletionStep: React.FC<{
  completedResults: AssessmentResults[];
  masterContainerData: MasterContainerData;
  studentXP: number;
  onContinueToExperience: () => void;
  onExit: () => void;
}> = ({ completedResults, masterContainerData, studentXP, onContinueToExperience, onExit }) => {
  const avgScore = completedResults.reduce((sum, r) => sum + r.score, 0) / completedResults.length;
  const totalTimeSpent = completedResults.reduce((sum, r) => sum + r.timeSpent, 0);
  const timeInMinutes = Math.round(totalTimeSpent / 60000);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🎉 Learning Complete!
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Amazing work, {masterContainerData.metadata.studentName}! You've mastered new skills today.
        </p>
      </div>

      {/* Learning Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Star className="w-6 h-6 mr-2 text-yellow-500" />
          Your Learning Journey Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {completedResults.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Skills Practiced</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {Math.round(avgScore)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
              {studentXP}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">XP Earned</div>
          </div>
        </div>
      </div>

      {/* Completed Assignments */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          📚 What You Accomplished Today
        </h3>
        
        <div className="space-y-3">
          {completedResults.map((result, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {result.skill_number} - {result.subject}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Score: {result.score}% • {result.attempts} attempt{result.attempts !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                {result.score >= 90 ? (
                  <span className="text-green-600 dark:text-green-400 font-semibold">Mastered!</span>
                ) : result.score >= 80 ? (
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">Great Job!</span>
                ) : (
                  <span className="text-yellow-600 dark:text-yellow-400 font-semibold">Keep Going!</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <ArrowRight className="w-5 h-5 mr-2 text-blue-600" />
          Ready for Your Next Adventure?
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          You've built a strong foundation! Now let's put your skills to work in real-world career scenarios 
          at Career, Inc. You'll work alongside professionals and solve exciting challenges using everything you just learned.
        </p>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
              <span className="text-2xl">💼</span>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Experience Container</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Apply your skills in professional career scenarios</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onContinueToExperience}
          className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>🚀 Continue to Career Adventure!</span>
        </button>
        
        <button
          onClick={onExit}
          className="px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Finish for Today
        </button>
      </div>
    </div>
  );
};

export default LearnMasterContainer;