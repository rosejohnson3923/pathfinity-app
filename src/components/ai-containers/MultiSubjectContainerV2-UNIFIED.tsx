/**
 * MULTI-SUBJECT CONTAINER V2-UNIFIED
 * Uses adaptive journey system for skill selection
 * Properly handles Grade 10 subject mapping (Math → Algebra I)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AILearnContainerV2UNIFIED as AILearnContainerV2 } from './AILearnContainerV2-UNIFIED';
import { AIExperienceContainerV2UNIFIED as AIExperienceContainerV2 } from './AIExperienceContainerV2-UNIFIED';
import { AIDiscoverContainerV2UNIFIED as AIDiscoverContainerV2 } from './AIDiscoverContainerV2-UNIFIED';
import { EnhancedLoadingScreen } from './EnhancedLoadingScreen';
import { TwoPanelModal } from '../modals/TwoPanelModal';
import { useAuth } from '../../hooks/useAuth';
import { useStudentProfile } from '../../hooks/useStudentProfile';
import { usePageCategory } from '../../hooks/usePageCategory';
import { useNarrative } from '../../contexts/NarrativeContext';

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

// Toast Container for notifications
import { ToastProvider } from '../notifications/ToastContainer';

// Import ProgressHeader for unified navigation
import { ProgressHeader } from '../navigation/ProgressHeader';

// Import CSS module
import styles from '../../styles/containers/MultiSubjectContainer.module.css';

// Master Narrative now comes from NarrativeContext

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
  rubricSessionId?: string; // For rubric-based content generation
  waitingForRubrics?: boolean; // True if rubrics are still initializing
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
  theme = 'light',
  rubricSessionId,
  waitingForRubrics = false
}) => {
  // Apply width management category for content containers
  usePageCategory('content');
  
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
  const [showInitialLoading, setShowInitialLoading] = useState(true);

  // Get Master Narrative from context - already generated at dashboard level
  const { masterNarrative, narrativeLoading, companionId } = useNarrative();

  
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
      await skillClusterService.preloadSkills(student.grade_level, currentSubject);

      // After skills are loaded, initialize/reinitialize the journey

      // Clear existing journey to force reload with new skills
      const existingJourney = adaptiveJourneyOrchestrator.getJourney(student.id);
      if (existingJourney) {
        // Force reinitialize to pick up the loaded skills
        adaptiveJourneyOrchestrator.clearJourney(student.id);
      }

      // Initialize journey (this will now use the preloaded skills)
      await adaptiveJourneyOrchestrator.initializeJourney(student.id, student.grade_level);

      setSkillsLoaded(true);
    };

    // Show initial loading screen for fun facts on first mount
    if (currentSubjectIndex === 0 && showInitialLoading) {

      // Wait 3 seconds before loading skills to allow fun facts to play
      setTimeout(() => {
        setShowInitialLoading(false);
        preloadAndInitialize();
      }, 3000);

      return;
    }

    if (!showInitialLoading) {
      preloadAndInitialize();
    }

    // Initialize career progression
    // Note: Career is passed to containers but not set here
    // Containers handle career-specific content internally
  }, [student.id, student.grade_level, selectedCareer, currentSubject, showInitialLoading, currentSubjectIndex]);

  // Log narrative availability from context
  useEffect(() => {
    if (masterNarrative) {
      console.log('✅ Using Master Narrative from context');
      console.log('🔊 AUDIO: Master Narrative available from context', {
        hasNarrative: !!masterNarrative,
        companionId: companionId,
        narrativeKeys: Object.keys(masterNarrative)
      });
    } else if (!narrativeLoading) {
      console.log('ℹ️ Master Narrative not yet generated (will be created after career/companion selection)');
    }
  }, [masterNarrative, narrativeLoading, companionId]);
  
  // ============================================================================
  // COMPANION INTEGRATION
  // ============================================================================
  
  // Toast notification removed - was causing display issues in loading screen
  
  // ============================================================================
  // CONTAINER RENDERING
  // ============================================================================
  
  const renderTransition = () => {
    if (!transition.isTransitioning) return null;

    // Use EnhancedLoadingScreen for transitions to enable fun facts narration
    return (
      <EnhancedLoadingScreen
        phase="practice"
        skillName={transition.nextSubject || `${currentSubject} Skills`}
        studentName={student?.display_name || student?.name || 'Student'}
        customMessage={transition.message || `Loading ${transition.nextSubject}...`}
        containerType={activeContainerType.toLowerCase() as 'learn' | 'experience' | 'discover'}
        currentCareer={selectedCareer?.name}
        showGamification={true}
        masterNarrative={masterNarrative}
        currentSubject={transition.nextSubject ?
          (transition.nextSubject === 'Social Studies' ? 'socialStudies' : transition.nextSubject.toLowerCase()) as 'math' | 'ela' | 'science' | 'socialStudies' :
          (currentSubject === 'Social Studies' ? 'socialStudies' : currentSubject.toLowerCase()) as 'math' | 'ela' | 'science' | 'socialStudies'
        }
        companionId={companionId || selectedCharacter?.toLowerCase() || 'finn'}
        enableNarration={true}
        isFirstLoad={false}
      />
    );
  };
  
  const handleSubjectComplete = async () => {
    
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
      // Completion message removed - was causing display issues
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

      // Wait for transition animation (this is when fun facts play!)
      setTimeout(() => {
        console.log(`⏱️ [MULTISUBJECT] Transition complete, setting new subject:`, {
          newSubject: nextSubject.name,
          newIndex: currentSubjectIndex + 1,
          settingSkillsLoaded: false
        });
        setCurrentSubjectIndex(currentSubjectIndex + 1);
        setSkillsLoaded(false); // Reset skills loaded state for new subject
        setTransition({
          isTransitioning: false,
          message: ''
        });
        console.log(`✅ [MULTISUBJECT] Subject transition complete, should now render ${nextSubject.name}`);
      }, 4000); // Give enough time for fun facts to play
    }
  };
  
  // Render appropriate container based on type
  const renderContainer = () => {
    if (transition.isTransitioning) {
      return renderTransition();
    }

    // Show initial loading screen with fun facts on first mount
    if (showInitialLoading && currentSubjectIndex === 0) {
      return (
        <EnhancedLoadingScreen
          phase="practice"
          skillName={`${currentSubject} Skills`}
          studentName={student?.display_name || student?.name || 'Student'}
          customMessage={`Welcome! Let's start with ${currentSubject}...`}
          containerType={activeContainerType.toLowerCase() as 'learn' | 'experience' | 'discover'}
          currentCareer={selectedCareer?.name || career}
          showGamification={true}
          masterNarrative={masterNarrative}
          currentSubject={(currentSubject === 'Social Studies' ? 'socialStudies' : currentSubject?.toLowerCase() || 'math') as 'math' | 'ela' | 'science' | 'socialStudies'}
          companionId={companionId || 'finn'}
          enableNarration={true}
          isFirstLoad={true}
        />
      );
    }

    // Show simple loading while skills are being loaded from database
    if (!skillsLoaded) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '1.5rem',
          color: '#666'
        }}>
          Loading {currentSubject} curriculum...
        </div>
      );
    }
    
    if (!getCurrentSkill) {
      // This shouldn't happen - log an error and try to recover
      console.error(`CRITICAL: No skills found for ${currentSubject} Grade ${student.grade_level}`, {
        currentSubject,
        gradeLevel: student.grade_level,
        studentId: student.id,
        skillsLoaded,
        currentSubjectIndex,
        subjects
      });

      // Automatically skip to next subject after a short delay
      if (currentSubjectIndex < subjects.length - 1) {
        console.log(`Auto-skipping ${currentSubject} due to missing skills, moving to next subject...`);
        setTimeout(() => {
          handleSubjectComplete();
        }, 1000);

        return (
          <EnhancedLoadingScreen
            phase="practice"
            skillName={`${currentSubject} Skills`}
            studentName={student?.display_name || student?.name || 'Student'}
            customMessage={`Checking ${currentSubject} curriculum...`}
            containerType={activeContainerType.toLowerCase() as 'learn' | 'experience' | 'discover'}
            currentCareer={selectedCareer?.name}
            showGamification={false}
            masterNarrative={masterNarrative}
            currentSubject={(currentSubject === 'Social Studies' ? 'socialStudies' : currentSubject.toLowerCase()) as 'math' | 'ela' | 'science' | 'socialStudies'}
            companionId={companionId || selectedCharacter?.toLowerCase() || 'finn'}
            enableNarration={true}
            isFirstLoad={false}
          />
        );
      } else {
        // Last subject with no skills - complete the journey
        console.log('Last subject has no skills, completing journey...');
        setTimeout(() => {
          onComplete();
        }, 1000);

        return (
          <EnhancedLoadingScreen
            phase="complete"
            skillName="Learning Journey"
            studentName={student?.display_name || student?.name || 'Student'}
            customMessage="Completing learning journey..."
            containerType={activeContainerType.toLowerCase() as 'learn' | 'experience' | 'discover'}
            currentCareer={selectedCareer?.name}
            showGamification={false}
            masterNarrative={masterNarrative}
            currentSubject={(currentSubject === 'Social Studies' ? 'socialStudies' : currentSubject.toLowerCase()) as 'math' | 'ela' | 'science' | 'socialStudies'}
            companionId={companionId || selectedCharacter?.toLowerCase() || 'finn'}
            enableNarration={true}
            isFirstLoad={false}
          />
        );
      }
    }
    
    const commonProps = {
      student,
      skill: getCurrentSkill,
      onComplete: handleSubjectComplete,
      onNext: activeContainerType === 'EXPERIENCE' && currentSubjectIndex >= subjects.length - 1
      ? () => {
          // Experience completed all subjects -> Move to Discover and reset to first subject (Math)
          console.log('🚀 EXPERIENCE CONTAINER - ALL SUBJECTS COMPLETE - TRANSITIONING TO DISCOVER');
          console.log('Debug info:', {
            activeContainerType,
            currentSubjectIndex,
            totalSubjects: subjects.length,
            nextContainer: 'DISCOVER',
            nextSubject: 'Math (resetting to index 0)'
          });
          setCurrentSubjectIndex(0); // Reset to first subject (Math)
          setSkillsLoaded(false); // Force reload skills for Math
          setActiveContainerType('DISCOVER');
        }
      : () => {
          console.log('📍 onNext called - moving to next subject via handleSubjectComplete');
          console.log('Debug info:', {
            activeContainerType,
            currentSubjectIndex,
            totalSubjects: subjects.length,
            isLastSubject: currentSubjectIndex >= subjects.length - 1
          });
          handleSubjectComplete();
        }, // For other cases, move to next subject
      onBack,
      selectedCharacter,
      selectedCareer,
      theme,
      // Add callback to track child loading state
      onLoadingChange: (loading: boolean) => setIsChildContainerLoading(loading),
      // Pass subject tracking info for Experience container
      totalSubjects: subjects.length,
      currentSubjectIndex: currentSubjectIndex,
      // PASS CACHED MASTER NARRATIVE - This prevents regeneration!
      masterNarrative: masterNarrative,
      narrativeLoading: narrativeLoading,
      // Use companion ID from context (set when narrative was generated)
      companionId: companionId || selectedCharacter?.toLowerCase() || 'finn',
      // Pass rubric session ID for rubric-based content generation
      rubricSessionId: rubricSessionId,
      // Pass waiting for rubrics flag
      waitingForRubrics: waitingForRubrics
    };

    // Use activeContainerType instead of containerType for dev mode override
    switch (activeContainerType) {
      case 'LEARN':
        return <AILearnContainerV2 {...commonProps} />;
      case 'EXPERIENCE':
        return <AIExperienceContainerV2
          {...commonProps}
        />;
      case 'DISCOVER':
        return <AIDiscoverContainerV2 {...commonProps} />;
      default:
        console.log(`⚠️ [MULTISUBJECT] Unknown container type, defaulting to LEARN`);
        return <AILearnContainerV2 {...commonProps} />;
    }
  };
  
  return (
    <ToastProvider>
      <div className={styles.multiSubjectContainer}>
        {/* Progress Header - Only show when content is loaded and not transitioning/loading */}
        {!transition.isTransitioning && skillsLoaded && getCurrentSkill && !isChildContainerLoading && (
          <ProgressHeader
            title="Multi-Subject Journey"
            career={selectedCareer?.name}
            skill={getCurrentSkill?.skill_name || getCurrentSkill?.name}
            subject={`${currentSubject} Foundations`}
            showBackButton={true}
            onBack={onBack}
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