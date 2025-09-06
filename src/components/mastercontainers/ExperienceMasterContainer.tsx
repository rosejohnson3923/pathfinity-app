// ================================================================
// EXPERIENCE MASTER CONTAINER
// Subject Cards → Assignment Cards → 3 Steps (Instruction, Practice, Assessment)
// Career application focused with real-world scenarios
// ================================================================

import React, { useState, useEffect } from 'react';
import { Briefcase, Target, CheckCircle, Clock, ArrowRight, ChevronLeft, ChevronRight, Star, Users } from 'lucide-react';
import { GamificationService } from '../../services/gamificationService';
import SimpleParticlesBackground from '../SimpleParticlesBackground';
import { MasterContainerData, SubjectCard, AssignmentCard } from '../../utils/JourneyCacheManager';
import { AssessmentResults, ContainerHandoff } from '../../types/LearningTypes';
import { CareerIncLobby } from '../experience/CareerIncLobby';
import { CareerChoice } from '../../services/careerChoiceService';
import { createAgentSystem } from '../../agents/AgentSystem';
import { useMasterTool } from '../../hooks/useMasterTool';
import { MasterToolInterface, AssignmentContext } from '../tools/MasterToolInterface';
import { getExperienceTemplate, getTemplateContent, convertToToolQuestions } from '../../services/experienceTemplateService';

interface ExperienceMasterContainerProps {
  masterContainerData: MasterContainerData;
  onComplete: (handoff: ContainerHandoff) => void;
  onExit: () => void;
  skipLoadingScreen?: boolean;
  originalLearnResults?: AssessmentResults[]; // Pass original Learn results for accurate skill display
}

type ApplicationStep = 'career-lobby' | 'badge-display' | 'instruction' | 'practice' | 'assessment';

export const ExperienceMasterContainer: React.FC<ExperienceMasterContainerProps> = ({
  masterContainerData,
  onComplete,
  onExit,
  skipLoadingScreen = false,
  originalLearnResults
}) => {
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [currentAssignmentIndex, setCurrentAssignmentIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState<ApplicationStep>('career-lobby');
  const [selectedCareer, setSelectedCareer] = useState<CareerChoice | null>(null);
  const [careerBadge, setCareerBadge] = useState<any>(null);
  
  // XP and gamification state
  const [studentXP, setStudentXP] = useState(0);
  const [showXPGain, setShowXPGain] = useState(false);
  const [lastXPGain, setLastXPGain] = useState(0);
  const [completedResults, setCompletedResults] = useState<AssessmentResults[]>([]);
  const [showLoadingScreen, setShowLoadingScreen] = useState(!skipLoadingScreen);
  const [startTime] = useState(new Date());
  
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
        console.log('🤖 Agent system initialized for Experience Container');
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
    preferredAgents: ['speak', 'think', 'tool', 'safe'],
    onToolComplete: async (results) => {
      console.log('💼 Tool completed in Experience Container:', results);
      
      // Transition to the Apply Skills step (recap box)
      setCurrentStep('apply-skills');
      masterTool.closeTool();
      
      // Use FinnSpeak for career-focused feedback
      if (agentSystem) {
        try {
          await agentSystem.requestAgentAction('speak', 'provide_guidance', {
            type: 'career_application_feedback',
            results,
            career: selectedCareer,
            context: 'experience_container'
          });
        } catch (error) {
          console.warn('⚠️ Failed to get career feedback:', error);
        }
      }
    },
    onToolProgress: async (progress) => {
      console.log('📊 Tool progress in Experience Container:', progress);
      
      // Use FinnThink for problem-solving guidance
      if (agentSystem && progress.needsGuidance) {
        try {
          await agentSystem.requestAgentAction('think', 'solve_problem', {
            type: 'real_world_application',
            progress,
            career: selectedCareer,
            context: 'experience_container'
          });
        } catch (error) {
          console.warn('⚠️ Failed to get problem-solving guidance:', error);
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
      }, 8000); // 8-second transition from Learn for demo users to read and appreciate
      return () => clearTimeout(timer);
    }
  }, [skipLoadingScreen]);

  // Handle career selection from lobby
  const handleCareerSelected = (career: CareerChoice, badge?: any) => {
    console.log('🏢 Career selected in Master Container:', career);
    if (badge) {
      console.log('🎖️ Badge received in Master Container:', badge);
      setCareerBadge(badge);
      setSelectedCareer(career);
      setCurrentStep('badge-display'); // Show badge first
    } else {
      setSelectedCareer(career);
      setCurrentStep('instruction'); // Skip to instruction if no badge
    }
  };

  // Handle step completion
  const handleStepComplete = (stepResults: any) => {
    console.log(`💼 Completed ${currentStep} for ${currentAssignment.skill.skill_number || currentAssignment.skill.skillCode}`);

    // Calculate XP reward based on step type (Experience offers higher XP)
    let xpGain = 0;
    if (currentStep === 'badge-display') {
      xpGain = 10; // Small XP for badge viewing
      setCurrentStep('instruction');
    } else if (currentStep === 'instruction') {
      xpGain = 15; // Higher XP for Role Setup
      setCurrentStep('practice');
    } else if (currentStep === 'practice') {
      xpGain = 25; // Higher XP for Apply Skills
      setCurrentStep('assessment');
    } else if (currentStep === 'apply-skills') {
      xpGain = 30; // XP for completing skills application
      setCurrentStep('assessment');
    } else if (currentStep === 'assessment') {
      // XP for assessment based on score (Experience offers premium XP)
      const score = stepResults.score || 85;
      if (score >= 90) {
        xpGain = 75;
      } else if (score >= 80) {
        xpGain = 60;
      } else if (score >= 70) {
        xpGain = 45;
      } else {
        xpGain = 30;
      }
      
      // Record assessment results
      const results: AssessmentResults = {
        skill_number: currentAssignment.skill.skill_number || currentAssignment.skill.skillCode,
        subject: currentAssignment.skill.subject,
        completed: true,
        correct: (stepResults.score || 85) >= 75,
        score: stepResults.score || 85,
        attempts: stepResults.attempts || 1,
        timeSpent: stepResults.timeSpent || 400000, // Experience typically takes longer
        selectedAnswer: stepResults.selectedAnswer,
        correctAnswer: stepResults.correctAnswer || 'Apply systematic problem-solving methods',
        struggledWith: stepResults.struggledWith || [],
        timestamp: new Date(),
        context: 'experience'
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
        // Complete Experience Master Container
        handleMasterContainerComplete(updatedResults);
      }
    }
    
    // Award XP and show animation
    if (xpGain > 0) {
      setStudentXP(prev => prev + xpGain);
      setLastXPGain(xpGain);
      setShowXPGain(true);
      console.log(`🎮 Awarded ${xpGain} XP for ${currentStep} completion in Experience`);
      
      // Hide XP animation after 3 seconds
      setTimeout(() => setShowXPGain(false), 3000);
    }
  };

  const handleMasterContainerComplete = (results: AssessmentResults[]) => {
    console.log('🎯 Experience Master Container completed with results:', results);

    // Analyze results for handoff to Discover Master Container
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const avgAttempts = results.reduce((sum, r) => sum + r.attempts, 0) / results.length;
    const allStrengths = results.flatMap(r => r.strengths);
    const allStruggles = results.flatMap(r => r.struggledWith);

    const skillsNeedingMastery = results
      .filter(r => r.score < 75 || r.attempts > 2) // Slightly lower threshold for application
      .map(r => r.skill_number);

    const studentStrengths = [...new Set(allStrengths)];
    const recommendedApproach = avgScore >= 75 ? 'story-based' : 'guided-narrative';

    const handoff: ContainerHandoff = {
      assignmentId: `experience-${masterContainerData.metadata.studentName}`,
      studentId: masterContainerData.metadata.studentName,
      completedSkills: results,
      skillsNeedingMastery,
      studentStrengths,
      recommendedApproach,
      timeSpent: new Date().getTime() - startTime.getTime(),
      containerSource: 'experience',
      timestamp: new Date()
    };

    onComplete(handoff);
  };

  // Show 5-second loading screen with enhanced animations
  if (showLoadingScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center relative">
        <SimpleParticlesBackground theme="experience" particleCount={80} />
        <div className="text-center mb-12 animate-fade-in">
          <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl p-8 max-w-lg mx-auto border border-blue-100 dark:border-blue-800 animate-pulse-slow relative z-10">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow shadow-lg">
                <Briefcase className="w-10 h-10 text-white animate-pulse" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3 animate-fade-in-up">
                🚀 Finn is preparing your career adventure...
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                Creating <span className="font-semibold text-blue-600 dark:text-blue-400">real-world scenarios</span> where you'll apply your skills like a professional!
              </p>
              
              {/* Enhanced animated progression dots */}
              <div className="flex justify-center space-x-3 mb-6">
                <div className="animate-spin rounded-full h-4 w-4 bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg animate-pulse"></div>
                <div className="animate-spin rounded-full h-4 w-4 bg-gradient-to-r from-cyan-500 to-cyan-600 shadow-lg animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="animate-spin rounded-full h-4 w-4 bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg animate-pulse" style={{animationDelay: '0.4s'}}></div>
                <div className="animate-spin rounded-full h-4 w-4 bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg animate-pulse" style={{animationDelay: '0.6s'}}></div>
              </div>
              
              {/* Career preparation status */}
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-4">
                <div className="flex justify-center flex-wrap gap-2 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-700 dark:text-blue-300 font-medium">🏢 Career Setup</span>
                  <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900 rounded-full text-cyan-700 dark:text-cyan-300 font-medium">⚡ Skills Integration</span>
                </div>
                <div className="flex justify-center flex-wrap gap-2 animate-fade-in-up" style={{animationDelay: '0.7s'}}>
                  <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 rounded-full text-orange-700 dark:text-orange-300 font-medium">🎯 Challenge Creation</span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 rounded-full text-purple-700 dark:text-purple-300 font-medium">🚀 Adventure Launch</span>
                </div>
              </div>
              
              {/* Dynamic status text */}
              <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse font-medium">
                <span className="inline-block animate-bounce" style={{animationDelay: '0s'}}>💼</span>
                <span className="ml-2">Transforming your learning into professional experience</span>
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

  // Career Lobby Phase
  if (currentStep === 'career-lobby') {
    // Use original Learn results if available, otherwise generate from master container data
    const learnResults: AssessmentResults[] = originalLearnResults || 
      masterContainerData.subjectCards.flatMap(subject => 
        subject.assignments.map(assignment => ({
          skill_number: assignment.skill.skill_number || assignment.skill.skillCode,
          subject: assignment.skill.subject,
          completed: true,
          correct: true,
          score: 85,
          attempts: 1,
          timeSpent: 300000,
          selectedAnswer: '',
          correctAnswer: '',
          struggledWith: [],
          timestamp: new Date(),
          context: 'learn'
        }))
      );

    return (
      <CareerIncLobby
        studentId={masterContainerData.metadata.studentName}
        studentName={masterContainerData.metadata.studentName}
        gradeLevel={masterContainerData.metadata.gradeLevel}
        learnResults={learnResults}
        skillGroups={masterContainerData.skillGroups}
        onCareerSelected={handleCareerSelected}
        onExit={onExit}
      />
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <SimpleParticlesBackground theme="experience" particleCount={60} />
      
      {/* Header */}
      <div className="relative z-10 pt-12 pb-12">
        <div className="bg-white dark:bg-gray-800 shadow-lg border-b-4 border-blue-600">
          <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
            <button
              onClick={onExit}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                💼 Experience Master Container
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {currentSubject.subject} • Career Application: {currentAssignment.title}
              </p>
            </div>

            <div className="w-10 h-10"></div> {/* Spacer */}
          </div>
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
              
              <div className="flex items-center space-x-3">
                {/* Career Badge Display */}
                {careerBadge && (
                  <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                    <span className="text-sm">{careerBadge.emoji}</span>
                    <span className="text-sm font-bold text-blue-800 dark:text-blue-200">
                      {careerBadge.title || careerBadge.careerName}
                    </span>
                  </div>
                )}
                
                {/* XP Display */}
                <div className="flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-bold text-yellow-800 dark:text-yellow-200">
                    {studentXP} XP
                  </span>
                </div>
              </div>
              
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Career Challenge {currentAssignmentIndex + 1} of {currentSubject.assignments.length}
              </span>
            </div>
            
            {/* Step Progress */}
            <div className="flex items-center justify-center space-x-2 mb-3">
              {careerBadge && (
                <>
                  <div className={`flex items-center space-x-2 ${currentStep === 'badge-display' ? 'text-blue-600' : currentStep === 'instruction' || currentStep === 'practice' || currentStep === 'apply-skills' || currentStep === 'assessment' ? 'text-green-600' : 'text-gray-400'}`}>
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-medium">Badge Earned</span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                </>
              )}
              <div className={`flex items-center space-x-2 ${currentStep === 'instruction' ? 'text-blue-600' : currentStep === 'practice' || currentStep === 'apply-skills' || currentStep === 'assessment' ? 'text-green-600' : 'text-gray-400'}`}>
                <Briefcase className="w-4 h-4" />
                <span className="text-sm font-medium">Role Setup</span>
              </div>
              <ArrowRight className="w-3 h-3 text-gray-400" />
              <div className={`flex items-center space-x-2 ${currentStep === 'practice' || currentStep === 'apply-skills' ? 'text-blue-600' : currentStep === 'assessment' ? 'text-green-600' : 'text-gray-400'}`}>
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">Apply Skills</span>
              </div>
              <ArrowRight className="w-3 h-3 text-gray-400" />
              <div className={`flex items-center space-x-2 ${currentStep === 'assessment' ? 'text-blue-600' : 'text-gray-400'}`}>
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Solve Challenge</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            {currentStep === 'badge-display' && careerBadge && (
              <BadgeDisplayStep
                badge={careerBadge}
                selectedCareer={selectedCareer}
                onComplete={handleStepComplete}
              />
            )}
            
            {currentStep === 'instruction' && (
              <RoleSetupStep
                content={currentAssignment.steps.instruction}
                assignment={currentAssignment}
                selectedCareer={selectedCareer}
                onComplete={handleStepComplete}
                masterContainerData={masterContainerData}
              />
            )}
            
            {currentStep === 'practice' && (
              <ApplySkillsStep
                content={currentAssignment.steps.practice}
                assignment={currentAssignment}
                onComplete={handleStepComplete}
                masterTool={masterTool}
                masterContainerData={masterContainerData}
                selectedCareer={selectedCareer}
                careerBadge={careerBadge}
                toolCompleted={false}
              />
            )}
            
            {currentStep === 'apply-skills' && (
              <ApplySkillsStep
                content={currentAssignment.steps.practice}
                assignment={currentAssignment}
                onComplete={handleStepComplete}
                masterTool={masterTool}
                masterContainerData={masterContainerData}
                selectedCareer={selectedCareer}
                careerBadge={careerBadge}
                toolCompleted={true}
              />
            )}
            
            {currentStep === 'assessment' && (
              <SolveChallengeStep
                content={currentAssignment.steps.assessment}
                assignment={currentAssignment}
                onComplete={handleStepComplete}
                selectedCareer={selectedCareer}
                masterContainerData={masterContainerData}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* XP Gain Animation Overlay */}
      {showXPGain && (
        <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2">
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
    </div>
  );
};

// ================================================================
// STEP COMPONENTS
// ================================================================

const BadgeDisplayStep: React.FC<{
  badge: any;
  selectedCareer?: CareerChoice | null;
  onComplete: (results: any) => void;
}> = ({ badge, selectedCareer, onComplete }) => {
  return (
    <div className="text-center space-y-6">
      {/* Celebration Header */}
      <div className="mb-8">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Congratulations!
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          You've earned your career badge!
        </p>
      </div>

      {/* Badge Display */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 mb-6">
        <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
          <span className="text-4xl">{badge.emoji}</span>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {badge.title || `${badge.careerName} Badge`}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {badge.description || `You're now qualified to work as a ${badge.careerName}!`}
        </p>
        
        <div className="inline-flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full">
          <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Grade {badge.gradeLevel} Certified
          </span>
        </div>
      </div>

      {/* Career Info */}
      {selectedCareer && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <span className="text-2xl">{selectedCareer.emoji}</span>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedCareer.name}
            </h4>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            {selectedCareer.description}
          </p>
        </div>
      )}

      {/* Start Workday Button */}
      <div className="pt-4">
        <button
          onClick={() => onComplete({ badgeViewed: true })}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 mx-auto"
        >
          <Briefcase className="w-5 h-5" />
          <span>Start My Workday!</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const RoleSetupStep: React.FC<{
  content: any;
  assignment: AssignmentCard;
  selectedCareer?: CareerChoice | null;
  onComplete: (results: any) => void;
  masterContainerData?: MasterContainerData;
}> = ({ content, assignment, selectedCareer, onComplete, masterContainerData }) => {
  // Try to get template content
  const template = selectedCareer && masterContainerData ? 
    getExperienceTemplate(
      masterContainerData.metadata.gradeLevel,
      assignment.skill.subject,
      assignment.skill.skill_number || assignment.skill.skillCode,
      selectedCareer.id
    ) : null;
  
  const templateContent = template ? getTemplateContent(template) : null;
  
  if (selectedCareer && masterContainerData) {
    console.log('📚 RoleSetupStep template check:', {
      hasTemplate: !!template,
      hasTemplateContent: !!templateContent,
      career: selectedCareer.name,
      careerId: selectedCareer.id
    });
  }
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-orange-600 dark:text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {templateContent?.instruction.title || 
            (selectedCareer ? `Welcome to Career, Inc.!` : content.title || `Welcome to Your Career Role!`)
          }
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {templateContent?.instruction.challenge?.split('!')[0] + '!' || 
            (selectedCareer 
              ? `You're now working as a ${selectedCareer.name} at Career, Inc., where ${assignment.skill.skillName} is essential to your daily work.`
              : `You're about to step into a professional role where ${assignment.skill.skillName} is essential`
            )
          }
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
          <Users className="w-5 h-5 mr-2 text-orange-600" />
          Your Professional Role:
        </h3>
        <p className="text-gray-700 dark:text-gray-300 text-lg">
          {templateContent?.instruction.roleDescription || content.roleDescription || content.content || `You are working as a professional who uses ${assignment.skill.skillName} every day to solve important problems and help people.`}
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3"><span className="text-2xl mr-2">🎯</span> The Challenge:</h3>
        <p className="text-gray-700 dark:text-gray-300">
          {templateContent?.instruction.challenge || content.challenge || `A situation has come up that requires your ${assignment.skill.skillName} expertise. Your colleagues are counting on you to solve this problem!`}
        </p>
      </div>

      {(templateContent?.instruction.steps || content.steps) && (templateContent?.instruction.steps || content.steps).length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📋 Your Action Plan:</h3>
          <div className="space-y-3">
            {(templateContent?.instruction.steps || content.steps).map((step: any, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {step.icon ? `${step.icon} ${step.step}` : (step.step || step.action)}
                  </p>
                  {step.result && <p className="text-sm text-gray-600 dark:text-gray-400">{step.result}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3"><span className="text-2xl mr-2">💡</span> Remember:</h3>
        <p className="text-gray-700 dark:text-gray-300">
          {templateContent?.instruction.encouragement || 
            `This is your chance to show how ${assignment.skill.skillName} is used in the real world. Think like a professional and apply what you've learned!`
          }
        </p>
      </div>

      <div className="text-center">
        <button
          onClick={() => onComplete({ completed: true })}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          🚀 Ready to Apply My Skills!
        </button>
      </div>
    </div>
  );
};

const ApplySkillsStep: React.FC<{
  content: any;
  assignment: AssignmentCard;
  onComplete: (results: any) => void;
  masterTool: ReturnType<typeof useMasterTool>;
  masterContainerData: MasterContainerData;
  selectedCareer?: CareerChoice | null;
  careerBadge?: any;
  toolCompleted?: boolean;
}> = ({ content, assignment, onComplete, masterTool, masterContainerData, selectedCareer, careerBadge, toolCompleted = false }) => {
  
  console.log('🎮 ApplySkillsStep - Selected Career:', selectedCareer);
  console.log('🎮 ApplySkillsStep - Career ID being passed to template:', selectedCareer?.id);
  
  // Try to get template content
  const template = selectedCareer ? 
    getExperienceTemplate(
      masterContainerData.metadata.gradeLevel,
      assignment.skill.subject,
      assignment.skill.skill_number || assignment.skill.skillCode,
      selectedCareer.id
    ) : null;
    
  console.log('🎮 ApplySkillsStep - Template:', template?.metadata);
  
  const templateContent = template ? getTemplateContent(template) : null;
  const toolQuestions = template ? convertToToolQuestions(template, assignment.skill) : null;
  
  const handleLaunchTool = () => {
    console.log('🎯 Selected Career:', selectedCareer);
    console.log('🎯 Template found:', template?.metadata);
    console.log('🎯 Tool Questions:', toolQuestions);
    
    // If we have template questions, pass them to the tool
    const toolContext = toolQuestions ? {
      questions: toolQuestions,
      templateConfig: templateContent?.practice.toolConfig
    } : null;
    const assignmentContext: AssignmentContext = {
      skillCode: assignment.skill.skill_number || assignment.skill.skillCode || 'unknown',
      skillName: assignment.skill.skillName || assignment.skill.skill_name || 'Unknown Skill',
      subject: assignment.skill.subject || 'Unknown',
      gradeLevel: masterContainerData.metadata.gradeLevel || 'K',
      difficulty: assignment.skill.difficulty_level || 5,
      topic: assignment.skill.skillName || assignment.skill.skill_name || 'Unknown Topic',
      learningObjective: `Apply ${assignment.skill.skillName || assignment.skill.skill_name || 'this skill'} in real-world scenarios`,
      studentId: masterContainerData.metadata.studentName || 'student',
      sessionId: `experience-session-${Date.now()}`
    };
    
    console.log('💼 Launching tool for career application:', assignmentContext);
    if (toolContext) {
      console.log('📝 Using template questions:', toolContext.questions.length);
      console.log('📝 Tool Context being passed:', toolContext);
    }
    masterTool.openTool(assignmentContext, toolContext);
  };
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Apply Your Skills!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Now put your {assignment.skill.skillName} skills to work in real scenarios
        </p>
      </div>

      {/* Tool Launch Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
              Practice with Professional Tools
            </h3>
            <p className="text-blue-700 dark:text-blue-200 text-sm mb-4">
              Use specialized tools to practice {assignment.skill.skillName} in real career scenarios
            </p>
          </div>
          <div className="ml-4">
            <Briefcase className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <button
          onClick={handleLaunchTool}
          disabled={toolCompleted}
          className={`inline-flex items-center px-6 py-3 rounded-lg transition-colors ${
            toolCompleted 
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Target className="h-5 w-5 mr-2" />
          {toolCompleted ? 'Tool Completed ✓' : 'Launch Career Tool'}
        </button>
      </div>

      {/* Only show recap box after tool completion */}
      {toolCompleted && (
        <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-center">
          <span className="text-2xl mr-2">🎉</span> Great Job! You've Successfully Applied Your Skills
        </h3>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-sm">
          <div className="grid md:grid-cols-2 gap-6">
            {/* What You Learned */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <span className="text-lg mr-2">📚</span> What You Learned
              </h4>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  {assignment.skill.skillName}
                </div>
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Subject: {assignment.skill.subject}
                </div>
              </div>
            </div>
            
            {/* How You Applied It */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <span className="text-lg mr-2">💼</span> How You Applied It
              </h4>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Career: {selectedCareer?.name}
                </div>
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Interactive practice scenarios
                </div>
              </div>
            </div>
          </div>
          
          {/* Badge Preview */}
          {careerBadge && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">You earned your Career Badge!</p>
              <div className="inline-flex items-center bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg px-4 py-2">
                <span className="text-2xl mr-2">🏆</span>
                <span className="font-medium text-yellow-800 dark:text-yellow-200">
                  {selectedCareer?.name} Badge
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Next Challenge Button */}
        <div className="text-center">
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Ready for the next challenge?
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Now let's see how you solve real workplace problems using your skills!
            </p>
          </div>
          
          <button
            onClick={() => onComplete({ score: 100, attempts: 1, strengths: ['application', 'problem-solving'], toolCompleted: true })}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 mx-auto"
          >
            <span className="text-xl">🚀</span>
            <span>Continue to Solve Challenge</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        </div>
      )}
    </div>
  );
};

const SolveChallengeStep: React.FC<{
  content: any;
  assignment: AssignmentCard;
  onComplete: (results: any) => void;
  selectedCareer?: CareerChoice | null;
  masterContainerData?: MasterContainerData;
}> = ({ content, assignment, onComplete, selectedCareer, masterContainerData }) => {
  // Try to get template content
  const template = selectedCareer && masterContainerData ? 
    getExperienceTemplate(
      masterContainerData.metadata.gradeLevel,
      assignment.skill.subject,
      assignment.skill.skill_number || assignment.skill.skillCode,
      selectedCareer.id
    ) : null;
  
  const templateContent = template ? getTemplateContent(template) : null;
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSubmit = () => {
    setShowFeedback(true);
    const correctAnswer = templateContent?.assessment.correctAnswer || content.correctAnswer || 'Apply systematic problem-solving methods';
    const isCorrect = selectedAnswer === correctAnswer;
    
    setTimeout(() => {
      onComplete({
        score: isCorrect ? 92 : 75,
        attempts: 1,
        timeSpent: 180000,
        selectedAnswer: selectedAnswer,
        correctAnswer: content.correctAnswer || 'Apply systematic problem-solving methods',
        strengths: ['real-world-application', 'professional-thinking'],
        struggledWith: isCorrect ? [] : ['career-context'],
        masteryLevel: isCorrect ? 'mastered' : 'proficient',
        feedback: isCorrect ? 'Outstanding professional thinking!' : 'Good approach! Consider the real-world context more.'
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Final Professional Challenge
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Show your mastery of {assignment.skill.skillName} in a career context
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        {templateContent?.assessment.setup && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
            <p className="text-gray-700 dark:text-gray-300">{templateContent.assessment.setup}</p>
          </div>
        )}
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          <span className="text-2xl mr-2">🏆</span> Professional Decision:
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {templateContent?.assessment.question || content.question || `As a professional using ${assignment.skill.skillName}, what is the best approach to solve this type of challenge?`}
        </p>
        
        <div className="space-y-3">
          {(templateContent?.assessment.options || content.options || [
            'Apply systematic problem-solving methods',
            'Skip analysis and jump to solutions',  
            'Ask others to solve it instead',
            'Use trial and error without planning'
          ]).map((option: string, index: number) => (
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
                name="challenge"
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
            selectedAnswer === (content.correctAnswer || 'Apply systematic problem-solving methods')
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <p className="font-medium mb-2">
              {selectedAnswer === (content.correctAnswer || 'Apply systematic problem-solving methods') ? '🎉 Outstanding!' : '💡 Good thinking!'}
            </p>
            <p className="text-sm">
              {templateContent?.assessment.explanation || content.explanation || `Professional problem-solving requires systematic approaches and applying skills thoughtfully. You're thinking like a real professional!`}
            </p>
          </div>
        )}
      </div>

      <div className="text-center">
        <button
          onClick={handleSubmit}
          disabled={!selectedAnswer || showFeedback}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {showFeedback ? 'Processing...' : 'Submit and Continue'}
        </button>
      </div>
    </div>
  );
};

export default ExperienceMasterContainer;