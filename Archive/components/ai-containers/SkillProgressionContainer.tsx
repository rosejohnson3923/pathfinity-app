/**
 * Skill Progression Container
 * Part of the NEW learning architecture for skill-based progression
 * Orchestrates learning across all subjects for a single skill number (A.1, A.2, etc.)
 * Uses skillProgressionService to dynamically load subjects from skillsDataComplete
 * 
 * NOTE: This is different from MultiSubjectContainer.tsx which wraps existing containers.
 * This container is designed to work with ReviewContainer and AssessmentContainer
 * for the complete A.1-A.5 → Review → Assessment → B.1 flow.
 */

import React, { useState, useEffect } from 'react';
import { AILearnContainer } from './AILearnContainer';
import { skillProgressionService } from '../../services/skillProgressionService';
import { StudentProfile, LearningSkill } from '../../services/AILearningJourneyService';
import { useTheme } from '../../hooks/useTheme';
import './SkillProgressionContainer.css';

// ================================================================
// INTERFACES
// ================================================================

interface MultiSubjectLearnContainerProps {
  student: StudentProfile;
  skillNumber: string;  // "A.1", "A.2", etc.
  selectedCharacter?: string;
  selectedCareer?: any;
  onComplete: (results: SubjectResults) => void;
  onBack?: () => void;
}

interface SubjectResults {
  skillNumber: string;
  categoryName: string;
  subjectScores: {
    [subject: string]: {
      practiceScore: number;
      assessmentScore: number;
      timeSpent: number;
    };
  };
  overallScore: number;
  completed: boolean;
}

// ================================================================
// MULTI-SUBJECT LEARN CONTAINER
// ================================================================

export const SkillProgressionContainer: React.FC<MultiSubjectLearnContainerProps> = ({
  student,
  skillNumber,
  selectedCharacter,
  selectedCareer,
  onComplete,
  onBack
}) => {
  const theme = useTheme();
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [subjectResults, setSubjectResults] = useState<SubjectResults['subjectScores']>({});
  const [dailySkills, setDailySkills] = useState<ReturnType<typeof skillProgressionService.getSkillsForDay>>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Load skills for all subjects for this skill number
  useEffect(() => {
    const skills = skillProgressionService.getSkillsForDay(student.grade_level, skillNumber);
    if (skills) {
      setDailySkills(skills);
        skills.subjects.map(s => s.subject).join(', '));
    } else {
      console.error(`❌ No skills found for ${student.grade_level} ${skillNumber}`);
    }
  }, [student.grade_level, skillNumber]);
  
  if (!dailySkills || dailySkills.subjects.length === 0) {
    return (
      <div className="multi-subject-container loading">
        <h2>Loading subjects for {skillNumber}...</h2>
      </div>
    );
  }
  
  const currentSkill = dailySkills.subjects[currentSubjectIndex];
  const subjects = dailySkills.subjects.map(s => s.subject);
  const progressPercent = ((currentSubjectIndex + 1) / subjects.length) * 100;
  
  // Convert skill to LearningSkill format for AILearnContainer
  const learningSkill: LearningSkill = {
    skill_id: currentSkill.id,
    skill_code: currentSkill.skillNumber,
    skill_name: currentSkill.skillName,
    subject: currentSkill.subject,
    grade: currentSkill.grade,
    description: currentSkill.description || currentSkill.skillName
  };
  
  // Handle completion of a single subject
  const handleSubjectComplete = (success: boolean) => {
    
    // Store results for this subject
    const newResults = {
      ...subjectResults,
      [currentSkill.subject]: {
        practiceScore: 85, // TODO: Get actual scores from AILearnContainer
        assessmentScore: success ? 90 : 70,
        timeSpent: Date.now() - startTime
      }
    };
    setSubjectResults(newResults);
    
    // Check if more subjects remain
    if (currentSubjectIndex < subjects.length - 1) {
      // Show transition message
      setIsTransitioning(true);
      
      // Companion transition message
      const nextSubject = subjects[currentSubjectIndex + 1];
      
      setTimeout(() => {
        setCurrentSubjectIndex(currentSubjectIndex + 1);
        setIsTransitioning(false);
      }, 2000);
    } else {
      // All subjects complete
      completeAllSubjects(newResults);
    }
  };
  
  // Handle moving to next subject
  const handleSubjectNext = () => {
    // This is called when user clicks "Next" within a subject
    // We handle the actual transition in handleSubjectComplete
  };
  
  // Complete all subjects and calculate final scores
  const completeAllSubjects = (finalResults: SubjectResults['subjectScores']) => {
    const scores = Object.values(finalResults).map(r => r.assessmentScore);
    const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    const results: SubjectResults = {
      skillNumber,
      categoryName: dailySkills.categoryName,
      subjectScores: finalResults,
      overallScore,
      completed: true
    };
    
    onComplete(results);
  };
  
  const [startTime] = useState(Date.now());
  
  // Render transition screen
  if (isTransitioning) {
    const nextSubject = subjects[currentSubjectIndex + 1];
    return (
      <div className="multi-subject-container transitioning">
        <div className="transition-message">
          <h2>Great work with {currentSkill.subject}! 🎉</h2>
          <p>Ready for {nextSubject}?</p>
          <div className="transition-animation">
            <span className="subject-icon">{getSubjectEmoji(nextSubject)}</span>
          </div>
        </div>
      </div>
    );
  }
  
  // Render current subject
  return (
    <div className="multi-subject-container">
      {/* Progress Header */}
      <div className="multi-subject-header">
        <div className="category-info">
          <h3>{dailySkills.categoryName}</h3>
          <span className="skill-number">{skillNumber}</span>
        </div>
        
        <div className="subject-progress">
          {subjects.map((subject, index) => (
            <div 
              key={subject}
              className={`subject-indicator ${
                index < currentSubjectIndex ? 'completed' : 
                index === currentSubjectIndex ? 'current' : 'pending'
              }`}
            >
              <span className="subject-emoji">{getSubjectEmoji(subject)}</span>
              <span className="subject-name">{subject}</span>
              {index < currentSubjectIndex && <span className="checkmark">✓</span>}
            </div>
          ))}
        </div>
        
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      
      {/* Current Subject Container */}
      <div className="current-subject-wrapper">
        <div className="subject-label">
          <span className="subject-emoji">{getSubjectEmoji(currentSkill.subject)}</span>
          <h2>{currentSkill.subject}</h2>
        </div>
        
        <AILearnContainer
          student={student}
          skill={learningSkill}
          selectedCharacter={selectedCharacter}
          selectedCareer={selectedCareer}
          onComplete={handleSubjectComplete}
          onNext={handleSubjectNext}
          onBack={onBack}
        />
      </div>
    </div>
  );
};

// ================================================================
// HELPER FUNCTIONS
// ================================================================

function getSubjectEmoji(subject: string): string {
  const emojis: Record<string, string> = {
    'Math': '🔢',
    'ELA': '📚',
    'English Language Arts': '📚',
    'Science': '🔬',
    'Social Studies': '🌍',
    'Algebra': '📐',
    'Geometry': '📏',
    'Pre-Calculus': '📈',
    'Calculus': '∫',
    'History': '📜',
    'Geography': '🗺️',
    'Biology': '🧬',
    'Chemistry': '⚗️',
    'Physics': '⚛️'
  };
  return emojis[subject] || '📖';
}

export default SkillProgressionContainer;