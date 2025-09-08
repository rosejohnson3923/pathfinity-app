/**
 * MULTI-SUBJECT CONTAINER V2-UNIFIED
 * Uses adaptive journey system for skill selection
 * Properly handles Grade 10 subject mapping (Math → Algebra I)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AILearnContainerV2UNIFIED as AILearnContainerV2 } from './AILearnContainerV2-UNIFIED';
import { AIExperienceContainerV2UNIFIED as AIExperienceContainerV2 } from './AIExperienceContainerV2-UNIFIED';
import { AIDiscoverContainerV2UNIFIED as AIDiscoverContainerV2 } from './AIDiscoverContainerV2-UNIFIED';
import { TwoPanelModal } from '../modals/TwoPanelModal';
import { useAuth } from '../../hooks/useAuth';
import { useStudentProfile } from '../../hooks/useStudentProfile';

// REMOVE direct skillsData import - use adaptive journey instead
// import { skillsData } from '../../data/skillsDataComplete';

// Adaptive Journey Integration
import { adaptiveJourneyOrchestrator } from '../../services/AdaptiveJourneyOrchestrator';
import { continuousJourneyIntegration } from '../../services/ContinuousJourneyIntegration';
import { skillClusterService } from '../../services/SkillClusterService';

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

// Toast Container for notifications
import { ToastProvider } from '../notifications/ToastContainer';

// Import ProgressHeader for unified navigation
import { ProgressHeader } from '../navigation/ProgressHeader';

// Import CSS module
import styles from '../../styles/containers/MultiSubjectContainer.module.css';

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
// MULTI-SUBJECT CONTAINER V2-UNIFIED COMPONENT
// ============================================================================

const MultiSubjectContainerV2UNIFIED: React.FC<MultiSubjectContainerV2Props> = ({
  containerType,
  student,
  selectedCharacter = 'Finn',
  selectedCareer,
  onComplete,
  onBack,
  theme = 'light'
}) => {
  // Move hooks to component level
  const { user } = useAuth();
  const { profile } = useStudentProfile();
  
  // Dev mode: Allow forcing container type via session storage
  const [activeContainerType, setActiveContainerType] = useState(containerType);
  
  useEffect(() => {
    if (import.meta.env.DEV) {
      const forcedType = sessionStorage.getItem('forceContainerType');
      if (forcedType === 'EXPERIENCE' || forcedType === 'DISCOVER') {
        console.log(`🎯 Dev Mode: Forcing container type to ${forcedType}`);
        setActiveContainerType(forcedType as typeof containerType);
        
        // Don't remove immediately - let the component render first
        setTimeout(() => {
          sessionStorage.removeItem('forceContainerType');
        }, 1000);
      }
      
      // Restore dev selections if available
      const devCareer = sessionStorage.getItem('devSelectedCareer');
      const devCharacter = sessionStorage.getItem('devSelectedCharacter');
      
      if (devCareer && !selectedCareer) {
        try {
          const career = JSON.parse(devCareer);
          console.log('🎯 Restoring dev career:', career);
          // You might need to call a setter here if selectedCareer is state
        } catch (e) {
          console.error('Failed to restore career:', e);
        }
      }
      
      if (devCharacter && !selectedCharacter) {
        console.log('🎯 Restoring dev character:', devCharacter);
        // You might need to call a setter here if selectedCharacter is state
      }
    }
  }, []);
  
  console.log('🎭 MultiSubjectContainerV2-UNIFIED Debug:', {
    selectedCareer,
    careerName: selectedCareer?.name,
    selectedCharacter,
    studentGrade: student.grade_level,
    studentId: student.id,
    originalContainerType: containerType,
    activeContainerType
  });
  
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
  const [skillsLoaded, setSkillsLoaded] = useState(false);
  const [isChildContainerLoading, setIsChildContainerLoading] = useState(true);
  
  // Define subject order with icons
  const subjects = useMemo(() => [
    { 
      name: 'Math', 
      icon: '🔢',
      description: activeContainerType === 'LEARN' ? 'Master mathematical concepts' :
                   activeContainerType === 'EXPERIENCE' ? 'Apply math in real situations' :
                   'Explore mathematical patterns'
    },
    { 
      name: 'ELA', 
      icon: '📚',
      description: activeContainerType === 'LEARN' ? 'Develop language skills' :
                   activeContainerType === 'EXPERIENCE' ? 'Use language creatively' :
                   'Discover stories and meanings'
    },
    { 
      name: 'Science', 
      icon: '🔬',
      description: activeContainerType === 'LEARN' ? 'Understand scientific principles' :
                   activeContainerType === 'EXPERIENCE' ? 'Conduct experiments' :
                   'Explore natural phenomena'
    },
    { 
      name: 'Social Studies', 
      icon: '🌍',
      description: activeContainerType === 'LEARN' ? 'Learn about society and culture' :
                   activeContainerType === 'EXPERIENCE' ? 'Connect with history' :
                   'Discover different cultures'
    }
  ], [activeContainerType]);
  
  const currentSubject = subjects[currentSubjectIndex]?.name || 'Math';
  
  // ============================================================================
  // SKILL SELECTION WITH ADAPTIVE JOURNEY SYSTEM
  // ============================================================================
  
  const getCurrentSkill = useMemo((): LearningSkill | null => {
    // Don't try to get skill until skills are loaded from database
    if (!skillsLoaded) {
      console.log('Skills not yet loaded from database, waiting...');
      return null;
    }
    
    // Use adaptive journey to get current skill for subject
    const skill = adaptiveJourneyOrchestrator.getCurrentSkillForSubject(
      student.id,
      currentSubject,
      student.grade_level
    );
    
    console.log('Getting skill from adaptive journey:', {
      studentId: student.id,
      gradeLevel: student.grade_level,
      currentSubject,
      foundSkill: skill,
      skillsLoaded
    });
    
    if (!skill) {
      console.warn(`No skill found for ${currentSubject} at grade ${student.grade_level}`);
      
      // Handle Grade 10 special case
      if (student.grade_level === '10' && currentSubject === 'Math') {
        console.log('Grade 10 Math should map to Algebra I through SkillClusterService');
      }
      
      return null;
    }
    
    // Convert to LearningSkill format expected by containers
    return {
      id: skill.id,
      name: skill.skillName,
      skill_number: skill.skillNumber,
      skill_name: skill.skillName,
      category: skill.skillsArea || currentSubject,
      subject: skill.subject.toLowerCase(),
      grade: student.grade_level,
      description: skill.description
    };
  }, [student.id, student.grade_level, currentSubject, skillsLoaded]);
  
  // Initialize journey and preload skills on mount
  useEffect(() => {
    // Preload skills for current subject FIRST
    const preloadAndInitialize = async () => {
      console.log(`[DB] Preloading skills for ${currentSubject}...`);
      await skillClusterService.preloadSkills(student.grade_level, currentSubject);
      
      // After skills are loaded, initialize/reinitialize the journey
      console.log(`[DB] Skills loaded, initializing journey...`);
      
      // Clear existing journey to force reload with new skills
      const existingJourney = adaptiveJourneyOrchestrator.getJourney(student.id);
      if (existingJourney) {
        console.log('Clearing existing journey to reload with database skills');
        // Force reinitialize to pick up the loaded skills
        adaptiveJourneyOrchestrator.clearJourney(student.id);
      }
      
      // Initialize journey (this will now use the preloaded skills)
      console.log('Initializing adaptive journey with preloaded skills');
      await adaptiveJourneyOrchestrator.initializeJourney(student.id, student.grade_level);
      
      setSkillsLoaded(true);
      console.log(`[DB] Journey initialized with database skills`);
    };
    
    preloadAndInitialize();
    
    // Initialize career progression
    // Note: Career is passed to containers but not set here
    // Containers handle career-specific content internally
  }, [student.id, student.grade_level, selectedCareer, currentSubject]);
  
  // ============================================================================
  // COMPANION INTEGRATION
  // ============================================================================
  
  useEffect(() => {
    if (selectedCharacter) {
      // Simple welcome message for now
      const welcomeMessage = `Welcome! Let's explore ${currentSubject} together.`;
      
      toastNotificationService.success(welcomeMessage);
    }
  }, [selectedCharacter, currentSubject]);
  
  // ============================================================================
  // CONTAINER RENDERING
  // ============================================================================
  
  const renderTransition = () => {
    if (!transition.isTransitioning) return null;
    
    const companionName = (selectedCharacter || 'spark').toLowerCase();
    const companionImage = `/images/companions/${companionName}-${theme}.png`;
    
    // Don't use transitionOverlay which has fixed positioning - just use the card content
    const transitionContent = (
      <div className={styles.transitionContainer}>
        <div className={styles.transitionCard}>
          <div className={styles.companionSection}>
            <img 
              src={companionImage} 
              alt={selectedCharacter}
              className={styles.companionImage}
              onError={(e) => {
                console.error('Failed to load companion image:', companionImage);
                e.currentTarget.src = '/images/companions/spark-light.png';
              }}
            />
          </div>
          <h2 className={styles.transitionTitle}>
            {transition.message}
          </h2>
          {transition.nextSubject && (
            <p className={styles.nextSubjectText}>
              Next up: {transition.nextSubject}
            </p>
          )}
          <div className={styles.progressIndicator}>
            {subjects.map((subject, idx) => (
              <div 
                key={subject.name}
                className={`${styles.progressDot} ${
                  idx < currentSubjectIndex ? styles.completed :
                  idx === currentSubjectIndex ? styles.current :
                  styles.upcoming
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );

    // Wrap transition content with TwoPanelModal for gamification during 22+ second loads
    return (
      <TwoPanelModal
        showGamification={true}
        sidebarPosition="right"
        currentSkill={currentSubject || "Transitioning"}
        currentCareer={selectedCareer?.name || "Exploring"}
        userId={user?.id || 'default'}
        gradeLevel={profile?.grade_level || student?.grade_level || 'K'}
        modalTitle="Loading Next Activity"
      >
        {transitionContent}
      </TwoPanelModal>
    );
  };
  
  const handleSubjectComplete = async () => {
    console.log(`✅ Completed ${currentSubject}`);
    
    // Record completion in adaptive journey
    // TODO: Implement recordSubjectCompletion in ContinuousJourneyIntegration
    // await continuousJourneyIntegration.recordSubjectCompletion(
    //   student.id,
    //   currentSubject,
    //   {
    //     containerId: containerType,
    //     timeSpent: Date.now() - sessionStartTime,
    //     skillsMastered: 1  // Simplified for now
    //   }
    // );
    
    // Update progress
    const newProgress = [...subjectProgress, {
      subject: currentSubject,
      completed: true,
      timeSpent: Date.now() - sessionStartTime
    }];
    setSubjectProgress(newProgress);
    
    // Check if all subjects completed
    if (currentSubjectIndex >= subjects.length - 1) {
      console.log('🎉 All subjects completed!');
      
      // Show completion message
      toastNotificationService.success(
        'Congratulations! You completed all subjects!'
      );
      
      // Complete the container
      setTimeout(() => {
        onComplete();
      }, 2000);
    } else {
      // Transition to next subject
      const nextSubject = subjects[currentSubjectIndex + 1];
      
      setTransition({
        isTransitioning: true,
        message: `Great job with ${currentSubject}!`,
        nextSubject: nextSubject.name,
        animation: 'fadeIn'
      });
      
      // Wait for transition animation
      setTimeout(() => {
        setCurrentSubjectIndex(currentSubjectIndex + 1);
        setSkillsLoaded(false); // Reset skills loaded state for new subject
        setTransition({
          isTransitioning: false,
          message: ''
        });
      }, 3000);
    }
  };
  
  // Render appropriate container based on type
  const renderContainer = () => {
    if (transition.isTransitioning) {
      return renderTransition();
    }
    
    // Show loading while skills are being loaded from database
    if (!skillsLoaded) {
      return (
        <div className={styles.loadingMessage}>
          <h3>Loading {currentSubject} skills from database...</h3>
          <div className={styles.loadingSpinner}></div>
        </div>
      );
    }
    
    if (!getCurrentSkill) {
      const nextSubject = subjects[currentSubjectIndex + 1];
      const subjectIcon = currentSubject === 'Science' ? '🔬' : 
                          currentSubject === 'Social Studies' ? '🌍' : '📚';
      
      return (
        <div className={styles.noSkillMessage}>
          <div className={styles.noSkillIcon}>{subjectIcon}</div>
          <h3>No {currentSubject} skills available</h3>
          <p>Grade {student.grade_level} curriculum for {currentSubject} is coming soon!</p>
          {nextSubject && (
            <>
              <p className={styles.nextSubjectHint}>
                Let's continue with {nextSubject.name} {nextSubject.icon}
              </p>
              <button onClick={handleSubjectComplete} className={styles.skipButton}>
                Continue to {nextSubject.name}
              </button>
            </>
          )}
          {!nextSubject && (
            <button onClick={handleSubjectComplete} className={styles.skipButton}>
              Complete Learning Journey
            </button>
          )}
        </div>
      );
    }
    
    const commonProps = {
      student,
      skill: getCurrentSkill,
      onComplete: handleSubjectComplete,
      onNext: handleSubjectComplete, // Continue Learning button uses onNext
      onBack,
      selectedCharacter,
      selectedCareer,
      theme,
      // Add callback to track child loading state
      onLoadingChange: (loading: boolean) => setIsChildContainerLoading(loading)
    };
    
    // Use activeContainerType instead of containerType for dev mode override
    switch (activeContainerType) {
      case 'LEARN':
        return <AILearnContainerV2 {...commonProps} />;
      case 'EXPERIENCE':
        return <AIExperienceContainerV2 {...commonProps} />;
      case 'DISCOVER':
        return <AIDiscoverContainerV2 {...commonProps} />;
      default:
        return <AILearnContainerV2 {...commonProps} />;
    }
  };
  
  return (
    <ToastProvider>
      <div className={`${styles.multiSubjectContainer} ${styles[theme]}`}>
        {/* Progress Header - Only show when content is loaded and not transitioning/loading */}
        {!transition.isTransitioning && skillsLoaded && getCurrentSkill && !isChildContainerLoading && (
          <ProgressHeader
            title="Multi-Subject Journey"
            career={selectedCareer?.name}
            skill={getCurrentSkill?.skill_name || getCurrentSkill?.name}
            subject={`${currentSubject} Foundations`}
            showBackButton={true}
            onBack={onBack}
            backPath="/student-dashboard"
            showThemeToggle={false}
            showSkipButton={false}
            hideOnLoading={true}
            isLoading={transition.isTransitioning || isChildContainerLoading}
            variant="subjects"
            subjects={subjects.map((subject, idx) => ({
              name: subject.name,
              code: subject.name.toLowerCase().replace(' ', '_'),
              icon: React.isValidElement(subject.icon) ? subject.icon : <span>{subject.icon}</span>,
              completed: idx < currentSubjectIndex,
              active: idx === currentSubjectIndex
            }))}
            onSubjectChange={(subjectCode) => {
              // Subject navigation is automatic in MultiSubject container
              console.log('Subject:', subjectCode, '(navigation is automatic)');
            }}
          />
        )}
        
        {/* Main Container */}
        {renderContainer()}
        
        {/* Debug Panel in Development */}
        {process.env.NODE_ENV === 'development' && (
          <SkillProgressionDebugPanel 
            studentId={student.id}
            currentSubject={currentSubject}
            currentSkill={getCurrentSkill}
          />
        )}
      </div>
    </ToastProvider>
  );
};

export default MultiSubjectContainerV2UNIFIED;
export { MultiSubjectContainerV2UNIFIED };