// ================================================================
// AI THREE-CONTAINER ORCHESTRATOR
// Integrates AI-first containers into the main application flow
// ================================================================

import React, { useState, useEffect } from 'react';
import { Sun, Moon, FastForward } from 'lucide-react';
import { AIThreeContainerJourney } from '../ai-containers/AIThreeContainerJourney';
import TimeTracker from '../TimeTracker';
import SimpleParticlesBackground from '../SimpleParticlesBackground';
import { useModeContext } from '../../contexts/ModeContext';
import { timeBudgetService } from '../../services/timeBudgetService';
import { 
  MultiSubjectAssignment, 
  SkillMasteryJourney,
  StudentLearningProfile 
} from '../../types/LearningTypes';
import type { StudentProfile, LearningSkill } from '../../services/AILearningJourneyService';

interface AIThreeContainerOrchestratorProps {
  assignment: MultiSubjectAssignment;
  studentName: string;
  gradeLevel: string;
  studentId: string;
  onComplete: (journeys: SkillMasteryJourney[], analytics: StudentLearningProfile) => void;
  onExit: () => void;
}

export const AIThreeContainerOrchestrator: React.FC<AIThreeContainerOrchestratorProps> = ({
  assignment,
  studentName,
  gradeLevel,
  studentId,
  onComplete,
  onExit
}) => {
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [completedJourneys, setCompletedJourneys] = useState<SkillMasteryJourney[]>([]);
  const [startTime] = useState(new Date());
  const [isComplete, setIsComplete] = useState(false);

  // Convert assignment data to AI container format
  const currentSkill = assignment.skills[currentSkillIndex];
  
  const studentProfile: StudentProfile = {
    id: studentId,
    display_name: studentName,
    grade_level: gradeLevel,
    interests: ['learning', 'discovery', 'careers'],
    learning_style: 'mixed'
  };

  const learningSkill: LearningSkill = currentSkill ? {
    skill_number: currentSkill.skill_number,
    skill_name: currentSkill.skill_name,
    subject: currentSkill.subject,
    grade_level: currentSkill.grade_level
  } : {
    skill_number: 'DEFAULT',
    skill_name: 'Default Skill',
    subject: 'Math',
    grade_level: gradeLevel
  };

  // Handle completion of current skill's AI journey
  const handleSkillJourneyComplete = () => {
    console.log(`🎉 AI Journey complete for skill: ${currentSkill?.skill_name}`);
    
    // Create journey record
    const journey: SkillMasteryJourney = {
      skillId: currentSkill?.skill_number || 'default',
      skillName: currentSkill?.skill_name || 'Default Skill',
      subject: currentSkill?.subject || 'Math',
      startTime,
      endTime: new Date(),
      mastered: true,
      learningPath: ['learn', 'experience', 'discover'],
      analytics: {
        timeSpent: Date.now() - startTime.getTime(),
        accuracy: 85, // Could be calculated from AI container feedback
        attempts: 1,
        hintsUsed: 0
      }
    };
    
    setCompletedJourneys(prev => [...prev, journey]);
    
    // Move to next skill or complete assignment
    if (currentSkillIndex < assignment.skills.length - 1) {
      setCurrentSkillIndex(prev => prev + 1);
    } else {
      // All skills complete
      setIsComplete(true);
      
      // Generate final analytics
      const analytics: StudentLearningProfile = {
        studentId,
        studentName,
        gradeLevel,
        totalSkillsMastered: assignment.skills.length,
        totalTimeSpent: Date.now() - startTime.getTime(),
        averageAccuracy: 85,
        preferredLearningStyle: 'ai-guided',
        strongSubjects: assignment.skills.map(s => s.subject).filter((v, i, a) => a.indexOf(v) === i),
        skillsToReinforce: [],
        lastActivityDate: new Date(),
        engagementLevel: 'high'
      };
      
      onComplete(completedJourneys, analytics);
    }
  };

  // Show completion screen
  if (isComplete) {
    return (
      <div className="ai-orchestrator-container">
        <SimpleParticlesBackground theme="discover" />
        <div className="completion-overlay">
          <div className="completion-content">
            <h1>🎉 Assignment Complete!</h1>
            <p>You've mastered all {assignment.skills.length} skills in this assignment!</p>
            <div className="completion-stats">
              <div className="stat-card">
                <h3>Skills Mastered</h3>
                <p>{completedJourneys.length}</p>
              </div>
              <div className="stat-card">
                <h3>Time Spent</h3>
                <p>{Math.round((Date.now() - startTime.getTime()) / 1000 / 60)} minutes</p>
              </div>
              <div className="stat-card">
                <h3>Learning Style</h3>
                <p>AI-Guided Journey</p>
              </div>
            </div>
            <button onClick={onExit} className="exit-button">
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show progress indicator if multiple skills
  const showProgress = assignment.skills.length > 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 relative">
      <SimpleParticlesBackground theme="learn" />
      
      {/* Header with progress */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{assignment.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">AI-Generated Learning Journey</p>
          </div>
          
          {showProgress && (
            <div className="flex-1 max-w-sm">
              <div className="text-center text-gray-600 dark:text-gray-400 font-semibold mb-2 text-sm">
                Skill {currentSkillIndex + 1} of {assignment.skills.length}
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-300 ease-out"
                  style={{ width: `${((currentSkillIndex + 1) / assignment.skills.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex-shrink-0">
            <TimeTracker
              startTime={startTime}
              onTimeUpdate={(timeSpent) => {
                timeBudgetService.trackTimeSpent(
                  studentId,
                  'ai-learning-journey',
                  timeSpent
                );
              }}
            />
          </div>
        </div>
      </div>

      {/* AI Container Journey */}
      <div className="relative z-10">
        <AIThreeContainerJourney
          student={studentProfile}
          skill={learningSkill}
          onJourneyComplete={handleSkillJourneyComplete}
        />
      </div>

      {/* Exit button */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={onExit} 
          className="bg-gray-900/70 hover:bg-gray-900/90 dark:bg-gray-800/70 dark:hover:bg-gray-800/90 text-white px-4 py-2 rounded-full font-semibold transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Exit Learning Journey
        </button>
      </div>
    </div>
  );
};


export default AIThreeContainerOrchestrator;