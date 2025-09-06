/**
 * MULTI-SUBJECT CONTAINER V2
 * Enhanced version integrated with AIRulesEngine architecture
 * Ensures proper subject cycling with rules-based validation
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AILearnContainerV2UNIFIED as AILearnContainerV2 } from './AILearnContainerV2-UNIFIED';
import { AIExperienceContainerV2 } from './AIExperienceContainerV2';
import { AIDiscoverContainerV2 } from './AIDiscoverContainerV2';
import { skillsData } from '../../data/skillsDataComplete';
import { skillProgressionService } from '../../services/skillProgressionService';
import { SkillProgressionDebugPanel } from '../debug/SkillProgressionDebugPanel';
import type { StudentProfile, LearningSkill } from '../../services/AILearningJourneyService';

// RULES ENGINE INTEGRATION
import { 
  useLearnRules,
  useExperienceRules,
  useDiscoverRules,
  useCompanionRules,
  useGamificationRules,
  useMasterOrchestration
} from '../../rules-engine/integration/ContainerIntegration';
import { toastNotificationService } from '../../services/toastNotificationService';
import { chatbotService } from '../../services/chatbotService';
import { careerProgressionSystem } from '../../rules-engine/career/CareerProgressionSystem';

// Toast Container for notifications
import { ToastProvider } from '../notifications/ToastContainer';

// Import CSS module
import styles from '../../styles/containers/MultiSubjectContainer.module.css';

// Styles are now handled by CSS module

// ============================================================================
// INTERFACES
// ============================================================================

interface MultiSubjectContainerV2Props {
  containerType: 'LEARN' | 'EXPERIENCE' | 'DISCOVER';
  student: StudentProfile;
  selectedCharacter?: string;
  selectedCareer?: any;
  onComplete: () => void;
  onBack?: () => void;
  theme?: string;
}

interface SubjectProgress {
  subject: string;
  completed: boolean;
  score?: number;
  timeSpent?: number;
  attempts?: number;
}

interface TransitionState {
  isTransitioning: boolean;
  message: string;
  nextSubject?: string;
  animation?: string;
}

// ============================================================================
// MULTI-SUBJECT CONTAINER V2 COMPONENT
// ============================================================================

const MultiSubjectContainerV2: React.FC<MultiSubjectContainerV2Props> = ({
  containerType,
  student,
  selectedCharacter = 'Finn',
  selectedCareer,
  onComplete,
  onBack,
  theme = 'light'
}) => {
  console.log('🎭 MultiSubjectContainerV2 received selectedCharacter:', selectedCharacter);
  
  // Rules Engine Hooks
  const learnRules = useLearnRules();
  const experienceRules = useExperienceRules();
  const discoverRules = useDiscoverRules();
  const companionRules = useCompanionRules();
  const gamificationRules = useGamificationRules();
  const masterOrchestration = useMasterOrchestration();
  
  // State Management
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [currentSkillGroup, setCurrentSkillGroup] = useState<string>('');
  const [transition, setTransition] = useState<TransitionState>({
    isTransitioning: false,
    message: ''
  });
  const [sessionStartTime] = useState(Date.now());
  const [chatSession, setChatSession] = useState<any>(null);
  
  // Define subject order with icons
  const subjects = ['Math', 'ELA', 'Science', 'Social Studies'];
  const subjectIcons = {
    'Math': '🔢',
    'ELA': '📚', 
    'Science': '🔬',
    'Social Studies': '🌎'
  };
  const currentSubject = subjects[currentSubjectIndex];
  const career = selectedCareer?.name || 'Explorer';
  
  // Debug logging to track career and companion selection
  console.log('🎯 MultiSubjectContainerV2 Debug:', {
    selectedCareer,
    careerName: selectedCareer?.name,
    extractedCareer: career,
    selectedCharacter,
    characterType: typeof selectedCharacter,
    isCharacterEmpty: !selectedCharacter || selectedCharacter === '',
    defaultingToFinn: !selectedCharacter
  });
  
  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  useEffect(() => {
    const initializeSession = async () => {
      // Get current skill progression
      const progress = skillProgressionService.getProgress(student.id, student.grade_level);
      setCurrentSkillGroup(`${progress.currentSkillGroup}.${progress.currentSkillNumber}`);
      
      // Initialize subject progress tracking
      const initialProgress = subjects.map(subject => ({
        subject,
        completed: false,
        score: 0,
        timeSpent: 0,
        attempts: 0
      }));
      setSubjectProgress(initialProgress);
      
      // Initialize chat session
      const session = await chatbotService.getOrCreateSession(
        student.id,
        selectedCharacter.toLowerCase(),
        career,
        student.grade_level
      );
      setChatSession(session);
      
      // Show welcome toast with career context
      const careerLabel = careerProgressionSystem.getCareerLabel(
        career.toLowerCase(),
        student.grade_level
      );
      
      await toastNotificationService.showCareerToast({
        studentId: student.id,
        grade: student.grade_level,
        companionId: selectedCharacter.toLowerCase(),
        careerId: career,
        triggerType: 'greeting',
        theme: theme as 'light' | 'dark'
      });
      
      // Get orchestrated initialization from master rules engine
      const orchestrationContext = {
        containerType,
        student: {
          id: student.id,
          grade: student.grade_level,
          age: student.age
        },
        career: {
          id: career.toLowerCase(),
          name: career
        },
        companion: {
          id: selectedCharacter.toLowerCase(),
          name: selectedCharacter
        },
        subjects,
        currentSubject
      };
      
      const orchestrationResult = await masterOrchestration.orchestrate(orchestrationContext);
      console.log('Orchestration initialized:', orchestrationResult);
    };
    
    initializeSession();
  }, []);
  
  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  
  const getGradeKey = (grade: string): string => {
    if (grade === 'K' || grade === '1' || grade === '2') return 'Kindergarten';
    if (grade === '3' || grade === '4' || grade === '5' || grade === '6') return 'Grade 3';
    if (grade === '7' || grade === '8' || grade === '9') return 'Grade 7';
    if (grade === '10' || grade === '11' || grade === '12') return 'Grade 10';
    return 'Kindergarten';
  };
  
  // ============================================================================
  // SKILL SELECTION WITH RULES ENGINE
  // ============================================================================
  
  const getCurrentSkill = useMemo((): LearningSkill | null => {
    const gradeKey = getGradeKey(student.grade_level);
    const availableSkills = skillsData[gradeKey]?.[currentSubject] || [];
    
    console.log('Getting skill:', {
      gradeKey,
      currentSubject,
      availableSkillsCount: availableSkills.length,
      firstSkill: availableSkills[0]
    });
    
    const skill = skillProgressionService.getSkillForSubject(
      currentSubject,
      student.grade_level,
      student.id,
      availableSkills
    );
    
    if (!skill) {
      console.warn(`No skill found for ${currentSubject} at grade ${student.grade_level}`);
      // Return a default skill if none found
      if (availableSkills.length > 0) {
        const defaultSkill = availableSkills[0];
        return {
          id: defaultSkill.id || `default-${currentSubject.toLowerCase()}-${student.id}`,
          name: defaultSkill.skillName,
          skill_number: defaultSkill.skillNumber,
          skill_name: defaultSkill.skillName,
          category: defaultSkill.skillsArea || currentSubject,
          subject: currentSubject.toLowerCase(),
          grade: student.grade_level,
          difficulty: 1,
          prerequisites: [],
          metadata: {
            container: containerType,
            career: career,
            companion: selectedCharacter
          }
        };
      }
      return null;
    }
    
    // Create stable skill object - IMPORTANT: Do not use Date.now() as it causes re-renders
    // Map skill_name to name for consistency
    return {
      id: skill.id || `${currentSubject.toLowerCase()}-${student.id}-${currentSubjectIndex}`,
      name: skill.skill_name || skill.name || `${currentSubject} Skills`,
      skill_name: skill.skill_name || skill.name,
      skill_number: skill.skill_number,
      category: skill.skills_area || skill.category || currentSubject,
      subject: currentSubject.toLowerCase(),
      grade: student.grade_level,
      difficulty: skill.difficulty_level || skill.difficulty || 1,
      prerequisites: skill.prerequisites || [],
      metadata: {
        container: containerType,
        career: career,
        companion: selectedCharacter
      }
    };
  }, [currentSubjectIndex, student.grade_level, currentSubject]);
  
  // ============================================================================
  // SUBJECT COMPLETION HANDLER
  // ============================================================================
  
  const handleSubjectComplete = async (success: boolean) => {
    // Update progress for current subject
    const updatedProgress = [...subjectProgress];
    updatedProgress[currentSubjectIndex] = {
      ...updatedProgress[currentSubjectIndex],
      completed: true,
      score: success ? 100 : 50,
      timeSpent: Date.now() - sessionStartTime,
      attempts: (updatedProgress[currentSubjectIndex].attempts || 0) + 1
    };
    setSubjectProgress(updatedProgress);
    
    // Calculate XP for subject completion
    const xp = await gamificationRules.calculateXP('subject_complete', {
      studentId: student.id,
      subject: currentSubject,
      success,
      containerType,
      timeSpent: Date.now() - sessionStartTime
    });
    
    // Show achievement toast if earned
    const achievements = await gamificationRules.checkAchievements(
      student.id,
      'subject_complete',
      {
        subject: currentSubject,
        allSubjects: updatedProgress.filter(p => p.completed).length === subjects.length
      }
    );
    
    if (achievements.length > 0) {
      await toastNotificationService.showCareerToast({
        studentId: student.id,
        grade: student.grade_level,
        companionId: selectedCharacter.toLowerCase(),
        careerId: career,
        triggerType: 'achievement',
        achievement: achievements[0].name
      });
    }
    
    // Check if all subjects completed
    const allCompleted = currentSubjectIndex === subjects.length - 1;
    
    if (allCompleted) {
      // All subjects done, complete the container
      await handleContainerComplete();
    } else {
      // Move to next subject with transition
      await transitionToNextSubject();
    }
  };
  
  // ============================================================================
  // SUBJECT TRANSITION
  // ============================================================================
  
  const transitionToNextSubject = async () => {
    const nextSubject = subjects[currentSubjectIndex + 1];
    
    // Get companion message for transition
    const companionResponse = await companionRules.getCompanionMessage(
      selectedCharacter.toLowerCase(),
      career,
      'subject_transition',
      {
        currentSubject,
        nextSubject,
        grade: student.grade_level
      }
    );
    
    // Show transition screen
    setTransition({
      isTransitioning: true,
      message: companionResponse.message,
      nextSubject,
      animation: 'slideIn'
    });
    
    // Show toast notification
    await toastNotificationService.showCareerToast({
      studentId: student.id,
      grade: student.grade_level,
      companionId: selectedCharacter.toLowerCase(),
      careerId: career,
      triggerType: 'encouragement',
      metadata: { nextSubject }
    });
    
    // Wait for animation
    setTimeout(() => {
      setCurrentSubjectIndex(currentSubjectIndex + 1);
      setTransition({
        isTransitioning: false,
        message: ''
      });
    }, 3000);
  };
  
  // ============================================================================
  // CONTAINER COMPLETION
  // ============================================================================
  
  const handleContainerComplete = async () => {
    // Calculate overall performance
    const totalScore = subjectProgress.reduce((sum, p) => sum + (p.score || 0), 0);
    const averageScore = totalScore / subjects.length;
    
    // Get completion message from companion
    const companionResponse = await companionRules.getCompanionMessage(
      selectedCharacter.toLowerCase(),
      career,
      'container_complete',
      {
        containerType,
        averageScore,
        grade: student.grade_level
      }
    );
    
    // Show completion celebration
    setTransition({
      isTransitioning: true,
      message: companionResponse.message,
      animation: 'bounce'
    });
    
    // Award container completion XP
    const xp = await gamificationRules.calculateXP('container_complete', {
      studentId: student.id,
      containerType,
      averageScore,
      timeSpent: Date.now() - sessionStartTime
    });
    
    // Show celebration toast
    await toastNotificationService.showCareerToast({
      studentId: student.id,
      grade: student.grade_level,
      companionId: selectedCharacter.toLowerCase(),
      careerId: career,
      triggerType: 'milestone',
      metadata: { containerType, averageScore }
    });
    
    // Note: Container completion is tracked through individual skill completions
    // No need for separate container completion tracking
    
    // Complete after animation
    setTimeout(() => {
      onComplete();
    }, 4000);
  };
  
  // ============================================================================
  // GRADE KEY HELPER
  // ============================================================================
  
  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  
  const renderProgressIndicator = () => {
    return (
      <div className={styles.subjectProgress}>
        <div className={styles.subjectItems}>
          {subjects.map((subject, index) => (
            <div key={subject} className={styles.subjectItem}>
              <div 
                className={`${styles.subjectDot} ${
                  index < currentSubjectIndex ? styles.completed : 
                  index === currentSubjectIndex ? styles.active : styles.upcoming
                }`}
                title={subject}
              >
                <span className={styles.subjectIcon}>
                  {subjectIcons[subject as keyof typeof subjectIcons]}
                </span>
                {subjectProgress[index]?.completed && (
                  <span className={styles.checkmark}>✓</span>
                )}
              </div>
              <span className={`${styles.subjectLabel} ${
                index < currentSubjectIndex ? styles.completed : 
                index === currentSubjectIndex ? styles.active : ''
              }`}>
                {subject}
              </span>
              {index < subjects.length - 1 && (
                <div className={`${styles.subjectConnector} ${
                  index < currentSubjectIndex ? styles.completed : ''
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderTransition = () => {
    if (!transition.isTransitioning) return null;
    
    // Get companion image path
    const companionName = (selectedCharacter || 'spark').toLowerCase();
    const theme = 'dark'; // You might want to get this from context
    const companionImage = `/images/companions/${companionName}-${theme}.png`;
    
    return (
      <div className={`${styles.transitionOverlay} ${transition.animation}`}>
        <div className={styles.transitionCard}>
          <div className={styles.companionAvatar}>
            <img 
              src={companionImage} 
              alt={selectedCharacter || 'Spark'}
              className={styles.companionImage}
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                e.currentTarget.style.display = 'none';
                const placeholder = e.currentTarget.nextSibling as HTMLElement;
                if (placeholder) placeholder.style.display = 'flex';
              }}
            />
            <div className={styles.avatarPlaceholder} style={{ display: 'none' }}>
              {selectedCharacter ? selectedCharacter[0] : 'S'}
            </div>
          </div>
          <div className={styles.transitionTitle}>
            {selectedCharacter || 'Spark'}
          </div>
          <div className={styles.transitionMessage}>
            {transition.message}
          </div>
          {transition.nextSubject && (
            <div className={styles.nextSubject}>
              Next up: {transition.nextSubject}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // ============================================================================
  // RENDER CONTAINER
  // ============================================================================
  
  const renderContainer = () => {
    const currentSkill = getCurrentSkill;
    
    if (!currentSkill) {
      return <div>Loading skill...</div>;
    }
    
    // Skip if transitioning
    if (transition.isTransitioning) {
      return renderTransition();
    }
    
    // Debug what we're passing to child containers
    console.log('📦 MultiSubjectContainerV2 passing props:', {
      hasStudent: !!student,
      studentGrade: student?.grade_level,
      hasSkill: !!currentSkill,
      skillName: currentSkill?.name,
      selectedCharacter,
      selectedCareer
    });
    
    const commonProps = {
      student,
      skill: currentSkill,
      selectedCharacter,
      selectedCareer,
      onComplete: handleSubjectComplete,
      onNext: handleSubjectComplete,
      onBack
    };
    
    switch (containerType) {
      case 'LEARN':
        return <AILearnContainerV2 {...commonProps} />;
      
      case 'EXPERIENCE':
        // Using V2 with ExperienceAIRulesEngine
        return <AIExperienceContainerV2 {...commonProps} />;
      
      case 'DISCOVER':
        // Using V2 with DiscoverAIRulesEngine
        return <AIDiscoverContainerV2 {...commonProps} />;
      
      default:
        return null;
    }
  };
  
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <ToastProvider position="top-right" maxToasts={3}>
      <div className={`${styles.multiSubjectContainer} theme-${theme}`}>
        {/* Progress Indicator */}
        {renderProgressIndicator()}
        
        {/* Container Content */}
        <div className={`${styles.contentWrapper} ${styles.subjectTransition}`}>
          {renderContainer()}
        </div>
        
        {/* Debug Panel (if in development) */}
        {process.env.NODE_ENV === 'development' && getCurrentSkill && (
          <SkillProgressionDebugPanel 
            currentSubject={currentSubject}
            currentSkill={getCurrentSkill}
            progress={subjectProgress}
          />
        )}
        
        {/* Transition Overlay */}
        {renderTransition()}
      </div>
    </ToastProvider>
  );
};

export { MultiSubjectContainerV2 };
export default MultiSubjectContainerV2;