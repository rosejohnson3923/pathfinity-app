// ================================================================
// LEARN CONTAINER - Orchestrates Multi-Subject Learning
// Manages ThreePhase sessions and prepares data for Experience container
// ================================================================

import React, { useState, useEffect } from 'react';
import { BookOpen, Target, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import LearnPlayer from './LearnPlayer';
import SimpleParticlesBackground from '../SimpleParticlesBackground';
import { ContainerContentGenerator } from '../../utils/ContainerContentGenerators';
import { 
  MultiSubjectAssignment, 
  AssessmentResults, 
  ContainerHandoff,
  Skill 
} from '../../types/LearningTypes';

interface LearnContainerProps {
  assignment: MultiSubjectAssignment;
  studentName: string;
  gradeLevel: string;
  contentGenerator: ContainerContentGenerator;
  onComplete: (handoff: ContainerHandoff) => void;
  onExit: () => void;
  skipLoadingScreen?: boolean;
}

export const LearnContainer: React.FC<LearnContainerProps> = ({
  assignment,
  studentName,
  gradeLevel,
  contentGenerator,
  onComplete,
  onExit,
  skipLoadingScreen = false
}) => {
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
  const [completedResults, setCompletedResults] = useState<AssessmentResults[]>([]);
  const [startTime] = useState(new Date());
  const [showProgress, setShowProgress] = useState(true);

  const currentSkill = assignment.skills[currentSkillIndex];
  const isLastSkill = currentSkillIndex === assignment.skills.length - 1;

  // Handle completion of individual ThreePhase session
  const handleSkillComplete = (results: AssessmentResults) => {
    console.log('📚 Skill completed in LearnContainer:', results);
    
    const updatedResults = [...completedResults, results];
    setCompletedResults(updatedResults);

    if (isLastSkill) {
      // All skills completed - prepare handoff data
      prepareHandoffData(updatedResults);
    } else {
      // Move to next skill
      setCurrentSkillIndex(prev => prev + 1);
      setShowProgress(true);
    }
  };

  // Prepare data for Experience container
  const prepareHandoffData = (results: AssessmentResults[]) => {
    console.log('🎯 Preparing handoff to Experience container');
    
    // Analyze results to determine what needs reinforcement
    const skillsNeedingMastery = assignment.skills.filter(skill => {
      const result = results.find(r => r.skillCode === skill.skillCode);
      return result && !result.correct;
    });

    // Identify student's strengths
    const studentStrengths = results
      .filter(r => r.correct && r.score >= 80)
      .map(r => r.skillCode);

    // Determine recommended approach for Experience
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const avgAttempts = results.reduce((sum, r) => sum + r.attempts, 0) / results.length;
    
    let recommendedApproach: 'visual' | 'narrative' | 'hands-on' | 'traditional' = 'traditional';
    
    if (avgAttempts > 1.5) {
      recommendedApproach = 'hands-on'; // Struggled with abstract - try applied
    } else if (avgScore < 70) {
      recommendedApproach = 'visual'; // Need more support
    } else if (assignment.type === 'multi-subject') {
      recommendedApproach = 'narrative'; // Good for integration
    }

    const handoff: ContainerHandoff = {
      assignmentId: assignment.id,
      studentId: '', // TODO: Get from auth context
      completedSkills: results,
      skillsNeedingMastery,
      studentStrengths: studentStrengths,
      recommendedApproach,
      timeSpent: new Date().getTime() - startTime.getTime(),
      containerSource: 'learn',
      timestamp: new Date()
    };

    // Call parent completion handler
    console.log('🎯 LearnContainer calling onComplete with handoff:', handoff);
    onComplete(handoff);
  };

  // Show progress between skills
  if (showProgress && currentSkillIndex > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center relative">
        <SimpleParticlesBackground theme="learning" particleCount={60} />
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-lg mx-4 text-center relative z-10">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Great Job, {studentName}!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You've completed {currentSkillIndex} of {assignment.skills.length} skills
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{Math.round((currentSkillIndex / assignment.skills.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(currentSkillIndex / assignment.skills.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Next Skill Preview */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Next: {currentSkill.subject}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {currentSkill.skillName}
            </p>
          </div>

          <button
            onClick={() => setShowProgress(false)}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>Continue Learning</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Show current Learn session
  return (
    <LearnPlayer
      skill={{
        skillCode: currentSkill.skillCode,
        skillName: currentSkill.skillName,
        subject: currentSkill.subject
      }}
      studentName={studentName}
      gradeLevel={gradeLevel}
      contentGenerator={contentGenerator}
      onComplete={handleSkillComplete}
      onExit={onExit}
      skipLoadingScreen={skipLoadingScreen}
    />
  );
};

export default LearnContainer;