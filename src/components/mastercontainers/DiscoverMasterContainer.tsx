// ================================================================
// DISCOVER MASTER CONTAINER
// Subject Cards → Assignment Cards → 3 Steps (Instruction, Practice, Assessment)
// Story-based learning with narrative adventures
// ================================================================

import React, { useState, useEffect } from 'react';
import { BookOpen, Target, CheckCircle, Clock, ArrowRight, ChevronLeft, Star, Sparkles, Heart } from 'lucide-react';
import { GamificationService } from '../../services/gamificationService';
import SimpleParticlesBackground from '../SimpleParticlesBackground';
import { MasterContainerData, SubjectCard, AssignmentCard } from '../../utils/JourneyCacheManager';
import { AssessmentResults, ContainerHandoff } from '../../types/LearningTypes';
import { createAgentSystem } from '../../agents/AgentSystem';
import { useMasterTool } from '../../hooks/useMasterTool';
import { MasterToolInterface, AssignmentContext } from '../tools/MasterToolInterface';

interface DiscoverMasterContainerProps {
  masterContainerData: MasterContainerData;
  onComplete: (handoff: ContainerHandoff) => void;
  onExit: () => void;
  skipLoadingScreen?: boolean;
}

type StoryStep = 'instruction' | 'practice' | 'assessment';

export const DiscoverMasterContainer: React.FC<DiscoverMasterContainerProps> = ({
  masterContainerData,
  onComplete,
  onExit,
  skipLoadingScreen = false
}) => {
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [currentAssignmentIndex, setCurrentAssignmentIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState<StoryStep>('instruction');
  const [completedResults, setCompletedResults] = useState<AssessmentResults[]>([]);
  const [showLoadingScreen, setShowLoadingScreen] = useState(!skipLoadingScreen);
  const [startTime] = useState(new Date());
  
  // XP and gamification state
  const [studentXP, setStudentXP] = useState(0);
  const [showXPGain, setShowXPGain] = useState(false);
  const [lastXPGain, setLastXPGain] = useState(0);
  
  // Initialize 6-Agent System
  const [agentSystem, setAgentSystem] = useState<any>(null);
  
  useEffect(() => {
    const initializeAgentSystem = async () => {
      try {
        const system = createAgentSystem({
          enabledAgents: ['see', 'speak', 'think', 'tool', 'safe', 'view'],
          debugMode: false,
          logLevel: 'info'
        });
        await system.initialize();
        setAgentSystem(system);
        console.log('🤖 Agent system initialized for Discover Container');
      } catch (error) {
        console.error('❌ Failed to initialize agent system:', error);
      }
    };
    
    initializeAgentSystem();
    
    return () => {
      if (agentSystem) {
        agentSystem.shutdown();
      }
    };
  }, []);
  
  // Master Tool Integration with Agent System
  const masterTool = useMasterTool({
    autoAnalyze: true,
    enableFinnGuidance: true,
    agentSystem,
    enableMultiAgentWorkflows: true,
    preferredAgents: ['see', 'speak', 'view', 'safe'],
    onToolComplete: async (results) => {
      console.log('📖 Tool completed in Discover Container:', results);
      
      // Use FinnView for story-based content and FinnSpeak for narrative guidance
      if (agentSystem) {
        try {
          await agentSystem.requestAgentAction('speak', 'provide_guidance', {
            type: 'story_completion_feedback',
            results,
            context: 'discover_container'
          });
          
          // Also check for follow-up story content
          await agentSystem.requestAgentAction('view', 'search_videos', {
            type: 'story_extension',
            skillCategory: results.skillCategory,
            context: 'discover_container'
          });
        } catch (error) {
          console.warn('⚠️ Failed to get story feedback:', error);
        }
      }
    },
    onToolProgress: async (progress) => {
      console.log('📊 Tool progress in Discover Container:', progress);
      
      // Use FinnSee for visual storytelling elements
      if (agentSystem && progress.needsVisualElements) {
        try {
          await agentSystem.requestAgentAction('see', 'create_visual_content', {
            type: 'story_visual',
            progress,
            context: 'discover_container'
          });
        } catch (error) {
          console.warn('⚠️ Failed to get story visuals:', error);
        }
      }
    }
  });

  const currentSubject = masterContainerData.subjectCards[currentSubjectIndex];
  const currentAssignment = currentSubject?.assignments[currentAssignmentIndex];

  // Handle loading screen
  useEffect(() => {
    if (!skipLoadingScreen) {
      const timer = setTimeout(() => {
        setShowLoadingScreen(false);
      }, 8000); // 8-second transition from Experience for demo users to read and appreciate
      return () => clearTimeout(timer);
    }
  }, [skipLoadingScreen]);

  // Handle step completion
  const handleStepComplete = (stepResults: any) => {
    console.log(`📖 Completed ${currentStep} for ${currentAssignment.skill.skill_number || currentAssignment.skill.skillCode}`);

    // Calculate XP reward based on step type (Discover offers the highest XP)
    let xpGain = 0;
    if (currentStep === 'instruction') {
      xpGain = 20; // Higher XP for story setup
      setCurrentStep('practice');
    } else if (currentStep === 'practice') {
      xpGain = 35; // Higher XP for creative story participation
      setCurrentStep('assessment');
    } else if (currentStep === 'assessment') {
      // XP for assessment based on score (Discover offers the highest XP)
      const score = stepResults.score || 90;
      if (score >= 90) {
        xpGain = 100; // Maximum XP for story mastery
      } else if (score >= 80) {
        xpGain = 85;
      } else if (score >= 70) {
        xpGain = 65;
      } else {
        xpGain = 45;
      }
      
      // Record assessment results
      const results: AssessmentResults = {
        skill_number: currentAssignment.skill.skill_number || currentAssignment.skill.skillCode,
        subject: currentAssignment.skill.subject,
        completed: true,
        correct: (stepResults.score || 90) >= 75,
        score: stepResults.score || 90,
        attempts: stepResults.attempts || 1,
        timeSpent: stepResults.timeSpent || 500000, // Discover typically takes longest
        selectedAnswer: stepResults.selectedAnswer,
        correctAnswer: stepResults.correctAnswer || 'Combine all skills with wisdom',
        struggledWith: stepResults.struggledWith || [],
        timestamp: new Date(),
        context: 'discover'
      };

      const updatedResults = [...completedResults, results];
      setCompletedResults(updatedResults);

      // Move to next assignment or subject
      if (currentAssignmentIndex < currentSubject.assignments.length - 1) {
        // Next assignment in same subject
        setCurrentAssignmentIndex(currentAssignmentIndex + 1);
        setCurrentStep('instruction');
      } else if (currentSubjectIndex < masterContainerData.subjectCards.length - 1) {
        // Next subject
        setCurrentSubjectIndex(currentSubjectIndex + 1);
        setCurrentAssignmentIndex(0);
        setCurrentStep('instruction');
      } else {
        // Complete Discover Master Container
        handleMasterContainerComplete(updatedResults);
      }
    }
    
    // Award XP and show animation
    if (xpGain > 0) {
      setStudentXP(prev => prev + xpGain);
      setLastXPGain(xpGain);
      setShowXPGain(true);
      console.log(`🎮 Awarded ${xpGain} XP for ${currentStep} completion in Discover`);
      
      // Hide XP animation after 3 seconds
      setTimeout(() => setShowXPGain(false), 3000);
    }
  };

  const handleMasterContainerComplete = (results: AssessmentResults[]) => {
    console.log('🎯 Discover Master Container completed with results:', results);

    // Analyze results for final journey completion
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const avgAttempts = results.reduce((sum, r) => sum + r.attempts, 0) / results.length;
    const allStrengths = results.flatMap(r => r.strengths);
    const allStruggles = results.flatMap(r => r.struggledWith);

    const skillsNeedingMastery = results
      .filter(r => r.score < 85 || r.attempts > 2) // Higher threshold for story-based
      .map(r => r.skill_number);

    const studentStrengths = [...new Set(allStrengths)];
    const recommendedApproach = avgScore >= 85 ? 'independent-explorer' : 'guided-discovery';

    const handoff: ContainerHandoff = {
      assignmentId: `discover-${masterContainerData.metadata.studentName}`,
      studentId: masterContainerData.metadata.studentName,
      completedSkills: results,
      skillsNeedingMastery,
      studentStrengths,
      recommendedApproach,
      timeSpent: new Date().getTime() - startTime.getTime(),
      containerSource: 'discover',
      timestamp: new Date()
    };

    onComplete(handoff);
  };

  // Show 5-second loading screen with enhanced animations  
  if (showLoadingScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center relative">
        <SimpleParticlesBackground theme="discover" particleCount={100} />
        <div className="text-center mb-12 animate-fade-in">
          <div className="bg-gradient-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl p-8 max-w-lg mx-auto border border-emerald-100 dark:border-emerald-800 animate-pulse-slow relative z-10">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow shadow-lg">
                <Sparkles className="w-10 h-10 text-white animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3 animate-fade-in-up">
                ✨ Finn is weaving your magical story adventure...
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                Creating an <span className="font-semibold text-emerald-600 dark:text-emerald-400">enchanting world</span> where your skills will save the day through storytelling!
              </p>
              
              {/* Enhanced animated story elements */}
              <div className="flex justify-center space-x-3 mb-6">
                <div className="animate-spin rounded-full h-4 w-4 bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg animate-pulse"></div>
                <div className="animate-spin rounded-full h-4 w-4 bg-gradient-to-r from-teal-500 to-teal-600 shadow-lg animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="animate-spin rounded-full h-4 w-4 bg-gradient-to-r from-pink-500 to-pink-600 shadow-lg animate-pulse" style={{animationDelay: '0.4s'}}></div>
                <div className="animate-spin rounded-full h-4 w-4 bg-gradient-to-r from-amber-500 to-amber-600 shadow-lg animate-pulse" style={{animationDelay: '0.6s'}}></div>
                <div className="animate-spin rounded-full h-4 w-4 bg-gradient-to-r from-violet-500 to-violet-600 shadow-lg animate-pulse" style={{animationDelay: '0.8s'}}></div>
              </div>
              
              {/* Story creation status */}
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-4">
                <div className="flex justify-center flex-wrap gap-2 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900 rounded-full text-emerald-700 dark:text-emerald-300 font-medium">📖 Story Crafting</span>
                  <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900 rounded-full text-teal-700 dark:text-teal-300 font-medium">🏰 World Building</span>
                </div>
                <div className="flex justify-center flex-wrap gap-2 animate-fade-in-up" style={{animationDelay: '0.7s'}}>
                  <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900 rounded-full text-pink-700 dark:text-pink-300 font-medium">🎭 Character Creation</span>
                  <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900 rounded-full text-amber-700 dark:text-amber-300 font-medium">⚔️ Quest Design</span>
                </div>
                <div className="flex justify-center flex-wrap gap-1 animate-fade-in-up" style={{animationDelay: '0.9s'}}>
                  <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900 rounded-full text-violet-700 dark:text-violet-300 font-medium">🌟 Magic Integration</span>
                </div>
              </div>
              
              {/* Dynamic story status */}
              <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse font-medium">
                <span className="inline-block animate-bounce" style={{animationDelay: '0s'}}>📚</span>
                <span className="ml-2">Weaving your skills into an epic narrative adventure</span>
                <span className="inline-block animate-bounce" style={{animationDelay: '0.5s'}}>.</span>
                <span className="inline-block animate-bounce" style={{animationDelay: '0.7s'}}>.</span>
                <span className="inline-block animate-bounce" style={{animationDelay: '0.9s'}}>.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentSubject || !currentAssignment) {
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:via-emerald-900/90 dark:to-teal-900/90">
      <SimpleParticlesBackground theme="discover" particleCount={80} />
      
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
              ✨ Discover Master Container
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {currentSubject.subject} • Story Adventure: {currentAssignment.title}
            </p>
          </div>

          <div className="w-10 h-10"></div> {/* Spacer */}
        </div>
      </div>

      {/* Progress Indicator */}
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
                Story Adventure {currentAssignmentIndex + 1} of {currentSubject.assignments.length}
              </span>
            </div>
            
            {/* Step Progress */}
            <div className="flex items-center justify-center space-x-4 mb-3">
              <div className={`flex items-center space-x-2 ${currentStep === 'instruction' ? 'text-emerald-600' : currentStep === 'practice' || currentStep === 'assessment' ? 'text-green-600' : 'text-gray-400'}`}>
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">Story Setup</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center space-x-2 ${currentStep === 'practice' ? 'text-emerald-600' : currentStep === 'assessment' ? 'text-green-600' : 'text-gray-400'}`}>
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">Adventure</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <div className={`flex items-center space-x-2 ${currentStep === 'assessment' ? 'text-emerald-600' : 'text-gray-400'}`}>
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Hero's Choice</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            {currentStep === 'instruction' && (
              <StorySetupStep
                content={currentAssignment.steps.instruction}
                assignment={currentAssignment}
                onComplete={handleStepComplete}
              />
            )}
            
            {currentStep === 'practice' && (
              <AdventureStep
                content={currentAssignment.steps.practice}
                assignment={currentAssignment}
                onComplete={handleStepComplete}
                masterTool={masterTool}
                masterContainerData={masterContainerData}
              />
            )}
            
            {currentStep === 'assessment' && (
              <HeroChoiceStep
                content={currentAssignment.steps.assessment}
                assignment={currentAssignment}
                onComplete={handleStepComplete}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* XP Gain Animation Overlay */}
      {showXPGain && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2">
            <Sparkles className="w-5 h-5" />
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
    </div>
  );
};

// ================================================================
// STEP COMPONENTS
// ================================================================

const StorySetupStep: React.FC<{
  content: any;
  assignment: AssignmentCard;
  onComplete: (results: any) => void;
}> = ({ content, assignment, onComplete }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {content.title || `Your Magical Adventure Begins!`}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to a world where {assignment.skill.skillName} will help you save the day!
        </p>
      </div>

      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <span className="text-2xl mr-2">🏰</span> The Setting:
        </h3>
        <p className="text-gray-700 dark:text-gray-300 text-lg">
          {content.setting || `A magical land where ${assignment.skill.skillName} knowledge is the key to helping others and solving important challenges.`}
        </p>
      </div>

      {content.characters && content.characters.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <span className="text-2xl mr-2">👥</span> Meet Your Companions:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {content.characters.map((character: string, index: number) => (
              <div key={index} className="flex items-center space-x-2 bg-white dark:bg-gray-700 rounded-lg p-3">
                <span className="text-4xl">
                  {index === 0 ? '🦸' : index === 1 ? '🧙' : '👨‍🏫'}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">{character}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <span className="text-2xl mr-2">📖</span> The Story:
        </h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {content.plot || `In this adventure, you'll discover how ${assignment.skill.skillName} can help characters solve problems and make their world a better place. Your knowledge and creativity will guide the story!`}
        </p>
      </div>

      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <span className="text-2xl mr-2">⭐</span> Your Special Power:
        </h3>
        <p className="text-gray-700 dark:text-gray-300">
          {content.skillConnection || `Your ${assignment.skill.skillName} knowledge is your special power in this story. Use it wisely to help others and create an amazing adventure!`}
        </p>
      </div>

      <div className="text-center">
        <button
          onClick={() => onComplete({ completed: true })}
          className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          ✨ Begin My Adventure!
        </button>
      </div>
    </div>
  );
};

const AdventureStep: React.FC<{
  content: any;
  assignment: AssignmentCard;
  onComplete: (results: any) => void;
  masterTool: ReturnType<typeof useMasterTool>;
  masterContainerData: MasterContainerData;
}> = ({ content, assignment, onComplete, masterTool, masterContainerData }) => {
  
  const handleLaunchTool = () => {
    const assignmentContext: AssignmentContext = {
      skillCode: assignment.skill.skill_number || assignment.skill.skillCode || 'unknown',
      skillName: assignment.skill.skillName || assignment.skill.skill_name || 'Unknown Skill',
      subject: assignment.skill.subject || 'Unknown',
      gradeLevel: masterContainerData.metadata.gradeLevel || 'K',
      difficulty: assignment.skill.difficulty_level || 5,
      topic: assignment.skill.skillName || assignment.skill.skill_name || 'Unknown Topic',
      learningObjective: `Discover how ${assignment.skill.skillName || assignment.skill.skill_name || 'this skill'} can help in magical adventures`,
      studentId: masterContainerData.metadata.studentName || 'student',
      sessionId: `discover-session-${Date.now()}`
    };
    
    console.log('📖 Launching tool for story adventure:', assignmentContext);
    masterTool.openTool(assignmentContext);
  };
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-teal-600 dark:text-teal-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Your Adventure Unfolds!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Use your {assignment.skill.skillName} powers to guide the story
        </p>
      </div>

      {/* Tool Launch Section */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-2">
              Magical Adventure Tools
            </h3>
            <p className="text-purple-700 dark:text-purple-200 text-sm mb-4">
              Use enchanted tools to explore {assignment.skill.skillName} in your story adventure
            </p>
          </div>
          <div className="ml-4">
            <Sparkles className="h-12 w-12 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <button
          onClick={handleLaunchTool}
          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          Launch Adventure Tool
        </button>
      </div>

      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <span className="text-2xl mr-2">🎭</span> {content.title || 'Story Events'}
        </h3>
        <div className="space-y-4">
          {content.storyEvents?.map((event: any, index: number) => (
            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                  <span className="text-4xl mr-3">{index === 0 ? '🌟' : index === 1 ? '⚡' : '🏆'}</span>
                  Chapter {index + 1}: {event.event}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <strong>Your Choice:</strong> {event.choice}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  How will you use your {assignment.skill.skillName} knowledge in this situation?
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 dark:border-gray-500 rounded-lg dark:bg-gray-800 dark:text-white"
                  placeholder="Describe how you would help the characters using your skills..."
                  rows={3}
                />
              </div>
              
              <div className="text-sm text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 p-3 rounded">
                <strong>Story Outcome:</strong> {event.outcome}
              </div>
              
              <div className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded mt-2">
                <strong>How You Helped:</strong> {event.skillApplication}
              </div>
            </div>
          )) || (
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                <span className="text-4xl mr-3">🌟</span>
                Your Heroic Moment
              </h4>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                The characters in the story need your help! How will you use your {assignment.skill.skillName} knowledge to save the day?
              </p>
              <textarea
                className="w-full p-3 border border-gray-300 dark:border-gray-500 rounded-lg dark:bg-gray-800 dark:text-white"
                placeholder="Write your heroic solution using your skills..."
                rows={4}
              />
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => onComplete({ score: 92, attempts: 1, strengths: ['creativity', 'narrative-thinking'] })}
          className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          Continue My Epic Journey
        </button>
      </div>
    </div>
  );
};

const HeroChoiceStep: React.FC<{
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
        score: isCorrect ? 95 : 80,
        attempts: 1,
        timeSpent: 240000,
        selectedAnswer: selectedAnswer,
        correctAnswer: content.correctAnswer || 'By applying what I learned to help solve problems',
        strengths: ['story-comprehension', 'skill-application', 'creative-thinking'],
        struggledWith: isCorrect ? [] : ['story-context'],
        masteryLevel: isCorrect ? 'mastered' : 'proficient',
        feedback: isCorrect ? 'You are a true hero! Amazing story understanding!' : 'Great adventure! Your story sense is growing stronger.'
      });
    }, 3000); // Longer to show story conclusion
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          The Hero's Final Choice
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Your moment to shine and complete the adventure!
        </p>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="text-2xl mr-2">🌟</span> The Climactic Moment:
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg">
          {content.question || `In your story adventure, how did you best use your ${assignment.skill.skillName} knowledge to help the characters and save the day?`}
        </p>
        
        <div className="space-y-3">
          {(content.options || [
            'By applying what I learned to help solve problems',
            'By letting others solve everything for me',
            'By avoiding the challenges in the story',
            'By not using my knowledge at all'
          ]).map((option: string, index: number) => (
            <label
              key={index}
              className={`flex items-start space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedAnswer === option
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-pink-300'
              }`}
            >
              <input
                type="radio"
                name="heroChoice"
                value={option}
                checked={selectedAnswer === option}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                className="text-emerald-600 mt-1"
              />
              <span className="text-gray-900 dark:text-white">{option}</span>
            </label>
          ))}
        </div>

        {showFeedback && (
          <div className={`mt-6 p-4 rounded-lg ${
            selectedAnswer === (content.correctAnswer || 'By applying what I learned to help solve problems')
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <p className="font-medium mb-2 text-lg">
              {selectedAnswer === (content.correctAnswer || 'By applying what I learned to help solve problems') ? '🎉 You are a True Hero!' : '✨ You are a Growing Hero!'}
            </p>
            <p className="text-sm mb-3">
              {content.explanation || `Using your knowledge to help others and solve problems is what makes learning magical and meaningful!`}
            </p>
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border-l-4 border-purple-500">
              <p className="font-medium text-teal-700 dark:text-teal-300 mb-2">🌟 Story Conclusion:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {content.storyConclusion || `Thanks to your ${assignment.skill.skillName} knowledge and creative thinking, the adventure ended wonderfully! Everyone was helped, problems were solved, and you proved that learning is the greatest superpower of all. You are a true hero of knowledge!`}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={handleSubmit}
          disabled={!selectedAnswer || showFeedback}
          className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {showFeedback ? 'Completing Your Adventure...' : 'Make My Hero Choice'}
        </button>
      </div>
    </div>
  );
};

export default DiscoverMasterContainer;