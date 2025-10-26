/**
 * MULTI-SUBJECT CONTAINER WRAPPER
 * Ensures each container (Learn/Experience/Discover) cycles through ALL subjects
 * before moving to the next container
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AILearnContainer } from './AILearnContainer';
// import { AIExperienceContainer } from './AIExperienceContainer'; // MOVED TO OBSOLETE
import { AIExperienceContainerV2UNIFIED as AIExperienceContainer } from './AIExperienceContainerV2-UNIFIED';
import { AIDiscoverContainer } from './AIDiscoverContainer';
import { staticDataService } from '../../services/StaticDataService';
import { skillProgressionService } from '../../services/skillProgressionService';
import type { StudentProfile, LearningSkill } from '../../services/AILearningJourneyService';

// Add CSS animations
const animationStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('multi-subject-animations')) {
  const style = document.createElement('style');
  style.id = 'multi-subject-animations';
  style.innerHTML = animationStyles;
  document.head.appendChild(style);
}

interface MultiSubjectContainerProps {
  containerType: 'LEARN' | 'EXPERIENCE' | 'DISCOVER';
  student: StudentProfile;
  selectedCharacter?: string;
  selectedCareer?: any;
  onComplete: () => void;
  onBack?: () => void;
  theme?: string;
}

const MultiSubjectContainerBase: React.FC<MultiSubjectContainerProps> = ({
  containerType,
  student,
  selectedCharacter,
  selectedCareer,
  onComplete,
  onBack,
  theme
}) => {
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [completedSubjects, setCompletedSubjects] = useState<string[]>([]);
  const [currentSkillGroup, setCurrentSkillGroup] = useState<string>('');
  const [showTransition, setShowTransition] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState<string>('');
  
  // Get current skill progression on mount
  useEffect(() => {
    const progress = skillProgressionService.getProgress(student.id, student.grade_level);
    setCurrentSkillGroup(`${progress.currentSkillGroup}.${progress.currentSkillNumber}`);
  }, [student.id, student.grade_level]);
  
  // Define subject order
  const subjects = ['Math', 'ELA', 'Science', 'Social Studies'];
  const currentSubject = subjects[currentSubjectIndex];
  
  // Get grade key for skills data
  const getGradeKey = (grade: string): string => {
    if (grade === 'K' || grade === '1' || grade === '2') return 'Kindergarten';
    if (grade === '3' || grade === '4' || grade === '5' || grade === '6') return 'Grade 3';
    if (grade === '7' || grade === '8' || grade === '9') return 'Grade 7';
    if (grade === '10' || grade === '11' || grade === '12') return 'Grade 10';
    return 'Kindergarten';
  };
  
  const gradeKey = getGradeKey(student.grade_level);
  
  // Fetch skills from database
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchSkills = async () => {
      const skills = await staticDataService.getSkills(student.grade_level, currentSubject);
      setAvailableSkills(skills);
      console.log(`[DB] Fetched ${skills.length} skills for Grade ${student.grade_level} ${currentSubject}`);
      if (skills.length > 0) {
        console.log('[DB] First skill:', skills[0]);
      }
    };
    fetchSkills();
  }, [student.grade_level, currentSubject]);

  // Create stable skill ID that won't change unless skill actually changes
  const skillId = useMemo(() => {
    const skill = skillProgressionService.getSkillForSubject(
      currentSubject,
      student.grade_level,
      student.id,
      availableSkills
    );
    
    if (!skill) {
      return `${currentSubject.toLowerCase()}-default`;
    }
    return skill.id || skill.skillId || `${currentSubject.toLowerCase()}-${skill.skill_number}`;
  }, [currentSubject, availableSkills, student.grade_level, student.id]);
  
  // Get current skill for current subject using progression tracking
  const currentSkill = useMemo(() => {
    // Use skill progression service to get the appropriate skill
    const skill = skillProgressionService.getSkillForSubject(
      currentSubject,
      student.grade_level,
      student.id,
      availableSkills
    );
    
    if (!skill) {
      // Fallback skill if none found
      return {
        id: skillId,
        skill_number: `${currentSubject}-001`,
        skill_name: `${currentSubject} Fundamentals`,
        subject: currentSubject,
        grade_level: student.grade_level,
        description: `Basic ${currentSubject} skills`
      };
    }
    
    // Use database field names (skill_number, skill_name from skills_master)
    return {
      id: skillId,
      skill_number: skill.skill_number || skill.skillNumber || `${currentSubject}-001`,
      skill_name: skill.skill_name || skill.skillName || `${currentSubject} Fundamentals`,
      subject: currentSubject,
      grade_level: student.grade_level,
      description: skill.description || ''
    };
  }, [skillId, currentSubject, student.grade_level, student.id, availableSkills]);
  
  // Handle completion of current subject
  const handleSubjectComplete = (success: boolean) => {
    
    // Mark skill as completed in progression service
    if (success && currentSkill) {
      skillProgressionService.markSkillCompleted(
        student.id,
        student.grade_level,
        currentSubject,
        currentSkill.id
      );
    }
    
    // Mark subject as completed
    setCompletedSubjects(prev => [...prev, currentSubject]);
    
    // Show transition screen with appropriate message
    const nextSubjectIndex = currentSubjectIndex + 1;
    if (nextSubjectIndex < subjects.length) {
      const nextSubject = subjects[nextSubjectIndex];
      const containerName = containerType === 'LEARN' ? 'Learn' : 
                           containerType === 'EXPERIENCE' ? 'Experience' : 'Discover';
      setTransitionMessage(`Great job with ${currentSubject}! Continuing to ${nextSubject} ${containerName}...`);
    } else if (containerType === 'LEARN') {
      setTransitionMessage('Excellent work! Moving to Experience activities...');
    } else if (containerType === 'EXPERIENCE') {
      setTransitionMessage('Amazing progress! Time to Discover...');
    } else {
      setTransitionMessage('Congratulations! You completed all activities!');
    }
    setShowTransition(true);
    
    // Auto-advance after showing transition
    setTimeout(() => {
      setShowTransition(false);
      handleNextSubject();
    }, 4000); // Show transition for 4 seconds
  };
  
  // Move to next subject or complete container
  const handleNextSubject = () => {
    if (currentSubjectIndex < subjects.length - 1) {
      // Move to next subject
      setCurrentSubjectIndex(prev => prev + 1);
    } else {
      // All subjects completed for this container
      
      // Check if this completes a skill group (A.1, B.1, C.1, etc.)
      const groupCompleted = skillProgressionService.checkForGroupCompletion(
        student.id,
        student.grade_level
      );
      
      if (groupCompleted) {
        // Update the displayed skill group
        const newProgress = skillProgressionService.getProgress(student.id, student.grade_level);
        setCurrentSkillGroup(`${newProgress.currentSkillGroup}.${newProgress.currentSkillNumber}`);
      }
      
      // Show progress summary
      const summary = skillProgressionService.getProgressSummary(
        student.id,
        student.grade_level
      );
      
      onComplete();
    }
  };
  
  // Subject icons and colors
  const subjectConfig = {
    'Math': { icon: '🔢', color: '#8B5CF6', bgGradient: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)' },
    'ELA': { icon: '📚', color: '#3B82F6', bgGradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' },
    'Science': { icon: '🔬', color: '#10B981', bgGradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
    'Social Studies': { icon: '🗺️', color: '#F59E0B', bgGradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }
  };

  // Progress indicator
  const renderProgress = () => (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      background: theme === 'dark' 
        ? 'linear-gradient(180deg, rgba(30, 41, 59, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)' 
        : 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
      backdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
      padding: '1rem 2rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Left: Back button and title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              ←
            </button>
          )}
          <div>
            <div style={{ 
              fontSize: '12px', 
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: theme === 'dark' ? '#9ca3af' : '#6b7280',
              marginBottom: '0.25rem'
            }}>
              {containerType} Progress - Skill {currentSkillGroup}
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: theme === 'dark' ? '#f3f4f6' : '#1f2937'
            }}>
              {subjects[currentSubjectIndex]}: {currentSkill?.skill_name || 'Loading...'}
            </div>
          </div>
        </div>

        {/* Center: Progress indicators */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: '0.75rem',
          flex: 1,
          maxWidth: '600px',
          margin: '0 2rem'
        }}>
          {subjects.map((subject, index) => {
            const config = subjectConfig[subject];
            const isCompleted = index < currentSubjectIndex;
            const isCurrent = index === currentSubjectIndex;
            const isPending = index > currentSubjectIndex;
            
            return (
              <React.Fragment key={subject}>
                {/* Subject circle */}
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    background: isCompleted ? config.bgGradient :
                               isCurrent ? config.bgGradient :
                               theme === 'dark' ? '#374151' : '#f3f4f6',
                    border: isCurrent ? `3px solid ${config.color}` : 'none',
                    boxShadow: isCurrent ? `0 0 20px ${config.color}40` : 
                              isCompleted ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
                    opacity: isPending ? 0.5 : 1,
                    transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.3s ease',
                    cursor: isCompleted ? 'pointer' : 'default'
                  }}>
                    {config.icon}
                  </div>
                  <div style={{
                    marginTop: '0.5rem',
                    fontSize: '11px',
                    fontWeight: isCurrent ? '600' : '500',
                    color: isCurrent ? (theme === 'dark' ? '#f3f4f6' : '#1f2937') :
                           isCompleted ? (theme === 'dark' ? '#d1d5db' : '#4b5563') :
                           theme === 'dark' ? '#6b7280' : '#9ca3af',
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                  }}>
                    {subject}
                  </div>
                  {isCompleted && (
                    <div style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '-5px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: 'white',
                      border: `2px solid ${theme === 'dark' ? '#1e293b' : 'white'}`
                    }}>
                      ✓
                    </div>
                  )}
                </div>
                
                {/* Connector line */}
                {index < subjects.length - 1 && (
                  <div style={{
                    flex: '0 0 auto',
                    height: '2px',
                    width: '40px',
                    background: isCompleted ? config.color :
                               theme === 'dark' ? '#374151' : '#e5e7eb',
                    opacity: isCompleted ? 1 : 0.3,
                    transition: 'all 0.3s ease'
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right: Progress counter */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: theme === 'dark' ? '#f3f4f6' : '#1f2937'
          }}>
            {currentSubjectIndex + 1} of {subjects.length}
          </div>
          <div style={{
            fontSize: '12px',
            color: theme === 'dark' ? '#9ca3af' : '#6b7280'
          }}>
            subjects completed
          </div>
        </div>
      </div>
    </div>
  );
  
  // Check if we have required data
  if (!student || !currentSkill) {
    console.error('❌ MultiSubjectContainer missing required data');
    return <div>Loading skill data...</div>;
  }
  
  
  // Render the appropriate container
  console.log('🎯 MultiSubjectContainer render:', {
    containerType,
    currentSubject,
    currentSkill,
    showTransition,
    student,
    selectedCharacter,
    selectedCareer
  });
  
  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      minHeight: '100vh',
      paddingTop: '90px' // Add space for the new fixed progress bar
    }}>
      {renderProgress()}
      <div style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 90px)', // Full height minus progress bar
        overflow: 'auto'
      }}>
        {/* Transition Screen */}
        {showTransition && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '40px',
              maxWidth: '600px'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '20px',
                animation: 'bounce 1s ease-in-out infinite'
              }}>
                🎉
              </div>
              <h2 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: theme === 'dark' ? '#f3f4f6' : '#111827',
                marginBottom: '16px'
              }}>
                {transitionMessage}
              </h2>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '24px'
              }}>
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: theme === 'dark' ? '#60a5fa' : '#3b82f6',
                      animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        
        {!showTransition && containerType === 'LEARN' && (
          <AILearnContainer
            key={`learn-${skillId}-${currentSubjectIndex}`}
            student={student}
            skill={currentSkill}
            selectedCharacter={selectedCharacter}
            selectedCareer={selectedCareer}
            onComplete={handleSubjectComplete}
            onNext={handleNextSubject}
            onBack={onBack}
          />
        )}
        
        {!showTransition && containerType === 'EXPERIENCE' && (
          <AIExperienceContainer
            key={`experience-${currentSkill.id}-${currentSubjectIndex}`}
            student={student}
            skill={currentSkill}
            selectedCharacter={selectedCharacter}
            selectedCareer={selectedCareer}
            onComplete={handleSubjectComplete}
            onNext={handleNextSubject}
            onBack={onBack}
          />
        )}
        
        {!showTransition && containerType === 'DISCOVER' && (
          <AIDiscoverContainer
            key={`discover-${currentSkill.id}-${currentSubjectIndex}`}
            student={student}
            skill={currentSkill}
            selectedCharacter={selectedCharacter}
            selectedCareer={selectedCareer}
            onComplete={handleSubjectComplete}
            onNext={handleNextSubject}
            onBack={onBack}
          />
        )}
      </div>
    </div>
  );
};

// Export with React.memo to prevent unnecessary re-renders
export const MultiSubjectContainer = React.memo(MultiSubjectContainerBase);