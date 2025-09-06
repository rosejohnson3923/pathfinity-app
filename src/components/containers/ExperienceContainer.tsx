// ================================================================
// EXPERIENCE CONTAINER - Career-Based Skill Application
// Uses completed skills from Learn container in career contexts
// ================================================================

import React, { useState, useEffect } from 'react';
import { Briefcase, Star, Target, Clock, ArrowRight, ChevronLeft } from 'lucide-react';
import ThreePhaseAssignmentPlayer from '../ThreePhaseAssignmentPlayer';
import { CareerBadgeLanyard } from '../CareerBadgeLanyard';
import { CareerIncLobby } from '../experience/CareerIncLobby';
import { CareerChoice } from '../../services/careerChoiceService';
import { 
  ContainerHandoff, 
  AssessmentResults,
  CareerScenario
} from '../../types/LearningTypes';

interface ExperienceContainerProps {
  learnHandoff: ContainerHandoff;
  studentName: string;
  gradeLevel: string;
  onComplete: (handoff: ContainerHandoff) => void;
  onExit: () => void;
  contentGenerator?: any;
}

export const ExperienceContainer: React.FC<ExperienceContainerProps> = ({
  learnHandoff,
  studentName,
  gradeLevel,
  onComplete,
  onExit,
  contentGenerator
}) => {
  const [phase, setPhase] = useState<'career-inc' | 'badge' | 'scenario' | 'complete'>('career-inc');
  const [showBadgeInterface, setShowBadgeInterface] = useState(true); // Default to showing badge interface
  const [selectedCareer, setSelectedCareer] = useState<CareerScenario | null>(null);
  const [selectedCareerId, setSelectedCareerId] = useState<string>('');
  const [selectedCareerChoice, setSelectedCareerChoice] = useState<CareerChoice | null>(null);
  const [experienceResults, setExperienceResults] = useState<AssessmentResults[]>([]);
  const [studentLevel, setStudentLevel] = useState(1);
  const [studentXP, setStudentXP] = useState(0);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [showXPGain, setShowXPGain] = useState(false);
  const [lastXPGain, setLastXPGain] = useState(0);
  const [newlyUnlockedCareers, setNewlyUnlockedCareers] = useState<string[]>([]);

  useEffect(() => {
    initializeStudentProgress();
  }, [learnHandoff]);

  // Handle career selection from Career, Inc. lobby
  const handleCareerIncSelection = (careerChoice: CareerChoice) => {
    console.log('🏢 Career selected from Career, Inc. lobby:', careerChoice);
    setSelectedCareerChoice(careerChoice);
    setSelectedCareerId(careerChoice.id);
    
    // Convert CareerChoice to CareerScenario for compatibility
    const careerScenario: CareerScenario = {
      careerId: careerChoice.id,
      careerName: careerChoice.name,
      department: careerChoice.department,
      gradeAppropriate: careerChoice.gradeAppropriate,
      applicableSkills: [], // Will be filled from learnHandoff.completedSkills
      scenario: {
        title: `${studentName}'s ${careerChoice.name} Adventure`,
        description: careerChoice.description,
        realWorldContext: `Learn how ${careerChoice.name}s use their skills in daily work.`,
        tasks: []
      },
      adaptedForStudent: true,
      difficultyLevel: careerChoice.difficulty
    };
    
    setSelectedCareer(careerScenario);
    
    if (showBadgeInterface) {
      setPhase('badge'); // Go to badge creation
    } else {
      setPhase('scenario'); // Skip to scenario
    }
    
    // Award XP for career selection
    setStudentXP(prev => prev + 25);
    console.log('🎮 Awarded 25 XP for Career, Inc. selection');
  };

  // Initialize student level and XP based on their performance
  const initializeStudentProgress = () => {
    // Calculate level based on completed skills and performance
    const totalSkills = learnHandoff.completedSkills.length;
    const correctSkills = learnHandoff.completedSkills.filter(s => s.correct).length;
    const performanceRatio = totalSkills > 0 ? correctSkills / totalSkills : 0;
    
    // Base level calculation (could be enhanced with actual student data)
    const calculatedLevel = Math.max(1, Math.floor(totalSkills * performanceRatio) + 1);
    const calculatedXP = correctSkills * 50 + totalSkills * 25; // 50 XP per correct, 25 XP per attempt
    
    setStudentLevel(calculatedLevel);
    setStudentXP(calculatedXP);
    
    console.log(`🎮 Student level: ${calculatedLevel}, XP: ${calculatedXP}`);
  };



  // Handle starting the workday from badge interface
  const handleStartWorkday = () => {
    console.log('🏢 Starting workday, transitioning to scenario');
    setPhase('scenario');
  };


  // Handle experience completion
  const handleExperienceComplete = (results: AssessmentResults) => {
    console.log('💼 Experience completed:', results);
    setExperienceResults([...experienceResults, results]);
    
    // Award XP based on performance
    const xpGain = results.correct ? 100 : 50; // More XP for correct answers
    const previousXP = studentXP;
    setStudentXP(prev => prev + xpGain);
    setLastXPGain(xpGain);
    setShowXPGain(true);
    console.log(`🎮 Awarded ${xpGain} XP for experience completion`);
    
    // Hide XP gain animation after 3 seconds
    setTimeout(() => setShowXPGain(false), 3000);
    
    // Check for level up
    const newLevel = Math.floor((previousXP + xpGain) / 100) + 1;
    if (newLevel > studentLevel) {
      setStudentLevel(newLevel);
      setShowLevelUpModal(true);
      console.log(`🎉 Level up! New level: ${newLevel}`);
    }
    
    // Prepare handoff to Discover container
    const handoff: ContainerHandoff = {
      assignmentId: `${selectedCareer?.careerId || 'career'}-${learnHandoff.assignmentId}`,
      studentId: learnHandoff.studentId,
      completedSkills: [...learnHandoff.completedSkills, results],
      skillsNeedingMastery: learnHandoff.skillsNeedingMastery.filter(skill => 
        results.correct || skill.skillCode !== results.skill_number
      ),
      studentStrengths: [...learnHandoff.studentStrengths],
      recommendedApproach: results.correct ? 'narrative' : 'visual',
      timeSpent: learnHandoff.timeSpent + results.timeSpent,
      selectedCareer: selectedCareer ? {
        careerId: selectedCareer.careerId,
        careerName: selectedCareer.careerName,
        department: selectedCareer.department
      } : undefined,
      containerSource: 'experience',
      timestamp: new Date()
    };

    // TODO: Check if all skills have been reinforced, or continue with more scenarios
    onComplete(handoff);
  };

  // Career, Inc. Lobby View
  if (phase === 'career-inc') {
    return (
      <CareerIncLobby
        studentId={learnHandoff.studentId}
        studentName={studentName}
        gradeLevel={gradeLevel}
        learnResults={learnHandoff.completedSkills}
        onCareerSelected={handleCareerIncSelection}
        onExit={onExit}
      />
    );
  }


  // Badge Creation Phase
  if (phase === 'badge') {
    return (
      <CareerBadgeLanyard
        studentName={studentName}
        studentId={learnHandoff.studentId}
        gradeLevel={gradeLevel}
        selectedCareer={selectedCareer}
        availableCareers={[]} // No longer needed since career is already selected
        onCareerSelect={() => {}} // No longer needed since career is already selected
        onExit={onExit}
        onStartWorkday={handleStartWorkday}
        isCreatingBadge={true} // Always creating badge since career is selected
      />
    );
  }

  // XP Gain Animation Overlay
  const XPGainOverlay = () => {
    if (!showXPGain) return null;
    
    return (
      <div className="fixed top-8 right-8 z-50 animate-bounce">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center space-x-2">
          <Star className="w-5 h-5" />
          <span className="font-bold">+{lastXPGain} XP</span>
        </div>
      </div>
    );
  };

  // Level Up Modal
  const LevelUpModal = () => {
    if (!showLevelUpModal) return null;
    
    return (
      <div className="min-h-screen bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center max-w-md mx-4 transform animate-pulse">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Star className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🎉 Level Up!
          </h2>
          
          <p className="text-xl text-purple-600 dark:text-purple-400 mb-4">
            Welcome to Level {studentLevel}!
          </p>
          
          {newlyUnlockedCareers.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                🔓 New careers unlocked:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {newlyUnlockedCareers.map(careerId => (
                  <span 
                    key={careerId}
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {careerId.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <button
            onClick={() => {
              setShowLevelUpModal(false);
              setNewlyUnlockedCareers([]);
            }}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 px-8 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            ✨ Continue Adventure!
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Career Scenario View (Re-use ThreePhase with career context) */}
      {phase === 'scenario' && selectedCareer && (
        <ThreePhaseAssignmentPlayer
          skill={{
            skillCode: `${selectedCareer.careerId}-application`,
            skillName: `Apply ${selectedCareer.careerName} Skills`,
            subject: selectedCareer.applicableSkills[0]?.subject || 'Math'
          }}
          studentName={studentName}
          gradeLevel={gradeLevel}
          contentGenerator={contentGenerator}
          onComplete={handleExperienceComplete}
          onExit={() => setPhase('lobby')}
          context="experience"
        />
      )}

      {/* Overlay Components */}
      <XPGainOverlay />
      <LevelUpModal />
    </>
  );
};

export default ExperienceContainer;