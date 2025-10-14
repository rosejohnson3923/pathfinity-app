/**
 * Student Dashboard - Modal-First Wrapper
 * Manages the complete user journey through modals
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { ReturnSelectModal } from '../modal-first/ReturnSelectModal';
import { IntroductionModal } from '../modal-first/IntroductionModal';
import { CareerIncLobbyModal } from '../modal-first/CareerIncLobbyModal';
import { MultiSubjectContainer } from '../../components/ai-containers/MultiSubjectContainer';
import { MultiSubjectContainerAuto } from '../../components/routing/ContainerRouter';
import { LearningAdaptationListener } from '../../components/metrics/LearningAdaptationListener';
import { AICharacterProvider } from '../../components/ai-characters/AICharacterProvider';
import { ModalProvider } from '../../state/modalState';
import { useAuth } from '../../hooks/useAuth';
import { useStudentProfile } from '../../hooks/useStudentProfile';
import { useTheme, useThemeControl } from '../../hooks/useTheme';
import { usePageCategory } from '../../hooks/usePageCategory';
import { useNarrative } from '../../contexts/NarrativeContext';
import { themeService } from '../../services/themeService';
import { skillsData } from '../../data/skillsDataComplete';
import { ProgressHeader } from '../../components/navigation/ProgressHeader';
import { CAREER_BASICS } from '../../data/careerBasicsData';

// Session persistence imports
import { SessionLearningContextManager } from '../../services/content/SessionLearningContextManager';
import { WelcomeBackModal } from '../../components/modals/WelcomeBackModal';
import { StartOverConfirmation } from '../../components/modals/StartOverConfirmation';
import { SelectionConfirmationScreen } from '../../components/modals/SelectionConfirmationScreen';
import { CareerChoiceModalV2 } from '../modal-first/sub-modals/CareerChoiceModalV2';
import { AICompanionModalV2 } from '../modal-first/sub-modals/AICompanionModalV2';
import { StartOverSelections } from '../../components/modals/StartOverSelections';

// Rubric-based journey integration
import { getRubricJourneyIntegration } from '../../services/integration/RubricJourneyIntegration';
import { adaptiveJourneyOrchestrator } from '../../services/AdaptiveJourneyOrchestrator';

import './StudentDashboard.css';

const StudentDashboardInner: React.FC = () => {
  // Apply dashboard width management category
  usePageCategory('dashboard');

  const { user } = useAuth();
  const { profile } = useStudentProfile();
  const { theme, setTheme } = useThemeControl(); // Use centralized theme service with controls
  const { generateNarrative, playNarrativeSection, masterNarrative, narrativeLoading } = useNarrative();
  const [currentView, setCurrentView] = useState<'introduction' | 'career-selection' | 'companion-selection' | 'selection-confirmation' | 'dashboard' | 'lobby' | 'loading' | 'narrative' | 'container' | 'welcomeback' | 'startover'>('introduction');
  const [hasSeenIntroduction, setHasSeenIntroduction] = useState(false);
  const [dashboardSelections, setDashboardSelections] = useState<{
    companion: string;
    career: string;
  } | null>(null);
  const [completedContainers, setCompletedContainers] = useState<Set<string>>(new Set());
  const [activeContainer, setActiveContainer] = useState<{
    id: 'LEARN' | 'EXPERIENCE' | 'DISCOVER';
    objectives: string[];
  } | null>(null);
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);

  // Session management state
  const [sessionManager] = useState(() => new SessionLearningContextManager());
  const [activeSession, setActiveSession] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [showStartOverConfirm, setShowStartOverConfirm] = useState(false);

  // Rubric initialization state
  const [isWaitingForRubrics, setIsWaitingForRubrics] = useState(false);
  const [rubricsInitialized, setRubricsInitialized] = useState(false);

  // Memoized objects for AI containers (must be at top level to follow Rules of Hooks)
  const studentProfile = useMemo(() => {
    if (!user || !dashboardSelections) return null;
    // Get grade from profile first, then from user auth data, then default to K
    const studentGrade = profile?.grade_level || (user as any).grade_level || 'K';
    console.log('📊 StudentDashboard: Creating studentProfile with grade:', {
      profileGradeLevel: profile?.grade_level,
      userGradeLevel: (user as any)?.grade_level,
      finalGrade: studentGrade
    });
    return {
      id: user.id || 'default',
      name: user.full_name || 'Student',
      display_name: user.full_name || 'Student',
      grade_level: studentGrade,
      learning_style: 'visual' as const,
      interests: [dashboardSelections.career],
      strengths: [],
      areas_for_growth: []
    };
  }, [user?.id, user?.full_name, profile?.grade_level, (user as any)?.grade_level, dashboardSelections?.career]);

  const learningSkill = useMemo(() => {
    if (!dashboardSelections) return null;
    // Get grade from profile first, then from user auth data, then default to K
    const studentGrade = profile?.grade_level || (user as any)?.grade_level || 'K';
    const subjects = ['Math', 'Science', 'ELA', 'Social Studies'];
    const currentSubject = subjects[currentSkillIndex % subjects.length];
    
    const getGradeKey = (grade: string): string => {
      if (grade === 'K' || grade === '1' || grade === '2') return 'Kindergarten';
      if (grade === '3' || grade === '4' || grade === '5' || grade === '6') return 'Grade 3';
      if (grade === '7' || grade === '8' || grade === '9') return 'Grade 7';
      if (grade === '10' || grade === '11' || grade === '12') return 'Grade 10';
      return 'Kindergarten';
    };
    
    const gradeKey = getGradeKey(studentGrade);
    const availableSkills = skillsData[gradeKey]?.[currentSubject] || [];
    const currentSkill = availableSkills[currentSkillIndex % Math.max(1, availableSkills.length)];
    
    return currentSkill ? {
      id: currentSkill.id,
      subject: currentSkill.subject,
      skill_number: currentSkill.skillNumber,
      skill_name: currentSkill.skillName,
      description: currentSkill.description || '',
      grade_level: currentSkill.grade,
      difficulty: 'medium' as const,
      estimated_time: 15,
      career_connection: dashboardSelections.career
    } : {
      id: 'default',
      subject: currentSubject,
      skill_number: 'A.0',
      skill_name: 'Learning Activity',
      description: 'Practice and learn',
      grade_level: studentGrade,
      difficulty: 'medium' as const,
      estimated_time: 15,
      career_connection: dashboardSelections.career
    };
  }, [profile?.grade_level, (user as any)?.grade_level, dashboardSelections?.career, currentSkillIndex]);

  const selectedCareerObject = useMemo(() => {
    if (!dashboardSelections) return null;

    // Look up the career by ID (convert name to ID format if needed)
    const careerId = dashboardSelections.career.toLowerCase().replace(/\s+/g, '-');
    const careerData = CAREER_BASICS[careerId];

    if (careerData) {
      return {
        id: careerData.id,
        name: careerData.name,
        icon: careerData.icon,
        color: careerData.color,
        category: careerData.category
      };
    }

    // Fallback to simple object if not found
    return {
      id: dashboardSelections.career,
      name: dashboardSelections.career
    };
  }, [dashboardSelections?.career]);

  // Note: Rubric initialization watcher removed - container handles loading and narrative internally

  // All hooks must be at the top level - memoized callbacks without problematic dependencies
  const handleContainerSuccess = useCallback(() => {
    setCurrentSkillIndex(prev => prev + 1);
    // Mark container as completed and return to lobby
    if (activeContainer) {
      console.log('Container completed:', activeContainer.id);
      setCompletedContainers(prev => new Set(prev).add(activeContainer.id));
      setCurrentView('lobby');
      setActiveContainer(null);
    }
  }, [activeContainer]);

  const handleContainerBack = useCallback(() => {
    // Return to lobby without marking as complete
    setCurrentView('lobby');
    setActiveContainer(null);
  }, []);

  const handleSkillIndexIncrement = useCallback(() => {
    setCurrentSkillIndex(prev => prev + 1);
  }, []);

  // Load session on mount
  useEffect(() => {
    if (!user?.id) return;

    const loadUserSession = async () => {
      setSessionLoading(true);
      try {
        // Try to load existing session
        const session = await sessionManager.loadSession(user.id);

        if (session) {
          console.log('🔄 Found active session:', session);
          setActiveSession(session);

          // Set dashboard selections from session with full objects
          // The career needs to be the name/title for the computed properties to work
          const careerName = session.career?.name || session.career?.title || session.career_name || 'Explorer';
          const careerId = session.career?.id || careerName.toLowerCase().replace(/\s+/g, '-');

          setDashboardSelections({
            companion: session.companion?.name || session.companion_name || 'pat',
            career: careerName
          });

          // Store in sessionStorage for use in other pages (e.g., Career Bingo)
          sessionStorage.setItem('selectedCareer', JSON.stringify({
            career: careerName,
            careerId: careerId
          }));

          // Restore completed containers from session progress
          const completedSet = new Set<string>();
          if (session.container_progress) {
            Object.entries(session.container_progress).forEach(([container, progress]: [string, any]) => {
              // Check if all subjects in the container are completed
              const subjects = progress || {};
              const allSubjectsCompleted = Object.values(subjects).every((s: any) => s.completed);
              if (allSubjectsCompleted && Object.keys(subjects).length > 0) {
                completedSet.add(container.toUpperCase());
              }
            });
          }
          setCompletedContainers(completedSet);

          // Check if user has made progress in Learn container
          const hasLearnProgress = sessionManager.isInLearnWithProgress();

          // Show welcome back modal if they have an active session
          setCurrentView('welcomeback');
          setHasSeenIntroduction(true);
        } else {
          console.log('🆕 No active session found');
          // No active session, show introduction
          setCurrentView('introduction');
        }
      } catch (error) {
        console.error('Failed to load session:', error);
        // On error, default to introduction
        setCurrentView('introduction');
      } finally {
        setSessionLoading(false);
      }
    };

    loadUserSession();
  }, [user?.id]);

  const handleIntroductionComplete = () => {
    console.log('🎯 Introduction complete - starting career selection');
    setHasSeenIntroduction(true);
    setCurrentView('career-selection');
  };

  const handleCareerSelection = (selection: { career: string; careerId: string }) => {
    console.log('🎯 Career selected:', selection);

    // Store in sessionStorage for use in other pages (e.g., Career Bingo)
    sessionStorage.setItem('selectedCareer', JSON.stringify({
      career: selection.career,
      careerId: selection.careerId
    }));

    setDashboardSelections({
      career: selection.career,
      careerId: selection.careerId,
      companion: ''
    });
    setCurrentView('companion-selection');
  };

  const handleCompanionSelection = (selection: { companion: string }) => {
    console.log('🤖 Companion selected:', selection);
    setDashboardSelections(prev => ({
      ...prev!,
      companion: selection.companion
    }));
    setCurrentView('selection-confirmation');
  };

  const handleDashboardComplete = async (selections: { companion: string; career: string; careerData?: any }) => {
    console.log('Dashboard flow complete - showing selection confirmation', selections);
    setDashboardSelections(selections);

    // Show the selection confirmation screen
    setCurrentView('selection-confirmation');
  };

  const handleSelectionConfirmationComplete = async () => {
    console.log('Selection confirmation complete - creating session and going to dashboard');

    // Create a new session with the selections
    if (user && dashboardSelections?.career && dashboardSelections?.companion) {
      try {
        const studentData = {
          id: user.id || 'default',
          name: user.full_name || 'Student',
          display_name: user.full_name || 'Student',
          grade_level: profile?.grade_level || (user as any)?.grade_level || 'K'
        };

        const careerData = {
          id: dashboardSelections.career.toLowerCase().replace(/\s+/g, '-'),
          name: dashboardSelections.career
        };

        // Ensure sessionStorage is updated with latest selection
        sessionStorage.setItem('selectedCareer', JSON.stringify({
          career: careerData.name,
          careerId: careerData.id
        }));

        const companionData = {
          id: dashboardSelections.companion,
          name: dashboardSelections.companion
        };

        const newSession = await sessionManager.createSession(
          studentData,
          careerData,
          companionData
        );

        setActiveSession(newSession);
        console.log('✅ Session created:', newSession);

        // ====================================================================
        // RUBRIC-BASED JOURNEY INITIALIZATION (NEW)
        // ====================================================================
        console.log('🎯 Initializing rubric-based learning journey...');
        const rubricIntegration = getRubricJourneyIntegration();

        const gradeLevel = profile?.grade_level || (user as any)?.grade_level || 'K';
        const sessionId = `session-${user.id}-${Date.now()}`;

        // Initialize adaptive journey first to get actual skills
        (async () => {
          try {
            console.log('🎯 Initializing adaptive journey to get actual skills...');

            // Initialize adaptive journey
            await adaptiveJourneyOrchestrator.initializeJourney(
              user.id || 'default',
              gradeLevel,
              careerData.name
            );

            // Get actual skills for all subjects from adaptive journey
            const subjects = ['Math', 'ELA', 'Science', 'Social Studies'];
            const skills = subjects.map(subject => {
              const skill = adaptiveJourneyOrchestrator.getCurrentSkillForSubject(
                user.id || 'default',
                subject,
                gradeLevel
              );

              console.log(`📚 Retrieved skill for ${subject}:`, skill?.skillName || 'none');

              return {
                subject: subject,
                skill_number: skill?.skillNumber || 'A.1',
                skill_name: skill?.skillName || `Basic ${subject}`,
                skill_description: skill?.skillName || `Foundational ${subject} concepts`
              };
            });

            console.log('✅ All skills retrieved from adaptive journey:', skills);

            // Now initialize rubric journey with actual skills
            const journeyState = await rubricIntegration.initializeJourney({
              sessionId: sessionId,
              userId: user.id || 'default',
              studentName: user.full_name || 'Student',
              gradeLevel: gradeLevel,
              companion: companionData,
              career: careerData,
              assignment: {
                id: 'daily-' + new Date().toISOString().split('T')[0],
                title: `${careerData.name} Learning Journey`,
                subject: 'Math',
                grade_level: gradeLevel,
                created_at: new Date().toISOString(),
                skills: skills
              }
            });

            console.log('✅ Background rubric journey initialized:', journeyState);

            // Store the session ID for later use
            if (newSession) {
              newSession.rubricSessionId = sessionId;
              setActiveSession({...newSession});
            }

          } catch (error) {
            console.error('❌ Background rubric initialization failed:', error);
            console.warn('⚠️ Falling back to legacy narrative generation...');

            // Fall back to old narrative generation if rubric system fails
            const companion = dashboardSelections.companion || 'finn';
            generateNarrative({
              career: dashboardSelections.careerData || dashboardSelections.career,
              companion: companion,
              gradeLevel: gradeLevel,
              userId: user.id || 'default',
              userName: user.full_name
            }).then((narrativeResult) => {
              if (narrativeResult && sessionManager) {
                sessionManager.cacheMasterNarrative(narrativeResult)
                  .then(() => console.log('✅ Master narrative cached in session (fallback)'))
                  .catch((err) => console.error('Failed to cache master narrative:', err));
              }
            });
          }
        })();

        console.log('🚀 Continuing to lobby while rubrics load in background...');

      } catch (error) {
        console.error('Failed to create session:', error);
      }
    }

    // Transition to CareerIncLobby after selections are confirmed
    setCurrentView('lobby');
  };

  const handleLobbyComplete = (lobbySelections: {
    container: 'LEARN' | 'EXPERIENCE' | 'DISCOVER';
    objectives: string[];
  }) => {
    console.log('Starting container:', lobbySelections.container);

    // Ensure all required data is ready before transitioning
    if (!studentProfile || !selectedCareerObject || !dashboardSelections) {
      console.warn('⚠️ Cannot start container - missing required data:', {
        hasProfile: !!studentProfile,
        hasCareer: !!selectedCareerObject,
        hasSelections: !!dashboardSelections
      });
      return;
    }

    // Set the active container and go directly to it
    // The container will handle loading screen and narrative internally
    setActiveContainer({
      id: lobbySelections.container,
      objectives: lobbySelections.objectives
    });

    console.log('✅ Going directly to container - it will handle loading and narrative');
    setCurrentView('container');
  };

  const handleContainerComplete = async () => {
    if (activeContainer && activeSession) {
      console.log('Container completed:', activeContainer.id);

      // Update session progress
      try {
        await sessionManager.updateProgress(
          activeContainer.id.toLowerCase(),
          currentSkillIndex,
          {
            completed: true,
            score: 100, // You might want to get actual score from container
            time_spent: 30 // You might want to track actual time
          }
        );
      } catch (error) {
        console.error('Failed to update session progress:', error);
      }

      // Mark container as completed
      setCompletedContainers(prev => new Set(prev).add(activeContainer.id));
      // Return to lobby
      setCurrentView('lobby');
      setActiveContainer(null);
    }
  };

  // Handle welcome back modal actions
  const handleWelcomeBackContinue = async () => {
    console.log('✅ CONTINUE button clicked in WelcomeBack modal');
    console.log('🎮 Continuing journey with existing session');
    console.log('📊 Dashboard selections:', dashboardSelections);
    console.log('👤 Student profile:', studentProfile);
    console.log('💼 Selected career object:', selectedCareerObject);

    // ====================================================================
    // RUBRIC-BASED JOURNEY INITIALIZATION FOR EXISTING SESSION
    // ====================================================================
    // Initialize rubrics if they don't exist for this session
    if (user && activeSession && dashboardSelections?.career && dashboardSelections?.companion) {
      console.log('🎯 Checking for existing rubric session...');

      const rubricIntegration = getRubricJourneyIntegration();
      const gradeLevel = profile?.grade_level || (user as any)?.grade_level || 'K';

      // DEV: Check for forced new session flag
      const forceNewSession = localStorage.getItem('force_new_rubric_session') === 'true';
      if (forceNewSession) {
        console.log('🔄 FORCING NEW RUBRIC SESSION (dev flag detected)');
        activeSession.rubricSessionId = null; // Clear old session ID
        localStorage.removeItem('force_new_rubric_session'); // Remove flag
      }

      // Check if rubricSessionId exists in activeSession
      if (!activeSession.rubricSessionId) {
        console.log('⚠️ No rubric session found, initializing rubric journey in background...');
        const sessionId = `session-${user.id}-${Date.now()}`;

        const careerData = {
          id: dashboardSelections.career.toLowerCase().replace(/\s+/g, '-'),
          name: dashboardSelections.career
        };

        const companionData = {
          id: dashboardSelections.companion,
          name: dashboardSelections.companion
        };

        // ✅ Set rubricSessionId IMMEDIATELY so containers can use it right away
        activeSession.rubricSessionId = sessionId;
        setActiveSession({...activeSession});
        console.log('✅ Rubric session ID set immediately:', sessionId);

        // Initialize adaptive journey first to get actual skills
        (async () => {
          try {
            console.log('🎯 Initializing adaptive journey to get actual skills...');

            // Initialize adaptive journey
            await adaptiveJourneyOrchestrator.initializeJourney(
              user.id || 'default',
              gradeLevel,
              careerData.name
            );

            // Get actual skills for all subjects from adaptive journey
            const subjects = ['Math', 'ELA', 'Science', 'Social Studies'];
            const skills = subjects.map(subject => {
              const skill = adaptiveJourneyOrchestrator.getCurrentSkillForSubject(
                user.id || 'default',
                subject,
                gradeLevel
              );

              console.log(`📚 Retrieved skill for ${subject}:`, skill?.skillName || 'none');

              return {
                subject: subject,
                skill_number: skill?.skillNumber || 'A.1',
                skill_name: skill?.skillName || `Basic ${subject}`,
                skill_description: skill?.skillName || `Foundational ${subject} concepts`
              };
            });

            console.log('✅ All skills retrieved from adaptive journey:', skills);

            // Now initialize rubric journey with actual skills
            const journeyState = await rubricIntegration.initializeJourney({
              sessionId: sessionId,
              userId: user.id || 'default',
              studentName: user.full_name || 'Student',
              gradeLevel: gradeLevel,
              companion: companionData,
              career: careerData,
              assignment: {
                id: 'daily-' + new Date().toISOString().split('T')[0],
                title: `${careerData.name} Learning Journey`,
                subject: 'Math',
                grade_level: gradeLevel,
                created_at: new Date().toISOString(),
                skills: skills
              }
            });

            console.log('✅ Background rubric journey initialized:', journeyState);
            setRubricsInitialized(true);
            console.log('✅ Rubrics ready for container use');

          } catch (error) {
            console.error('❌ Background rubric initialization failed:', error);
            // Journey can still proceed without rubrics (fallback content)
            setRubricsInitialized(true); // Allow fallback to legacy
          }
        })();

        console.log('🚀 Continuing to lobby while rubrics load in background...');
      } else {
        console.log('✅ Rubric session already exists:', activeSession.rubricSessionId);
        setRubricsInitialized(true); // Already have rubrics
      }
    }

    console.log('🔄 Changing view from', currentView, 'to lobby');
    setCurrentView('lobby');
  };

  const handleWelcomeBackStartOver = () => {
    console.log('🚀 START NEW ADVENTURE button clicked!');
    console.log('📊 Current state before action:', {
      activeSession: activeSession?.id,
      currentView,
      hasSeenIntroduction,
      showStartOverConfirm
    });
    console.log('🔄 User wants to start over - showing confirmation');
    setShowStartOverConfirm(true);
    setCurrentView('startover');
    console.log('✅ State updated - should show StartOver confirmation');
  };

  const handleConfirmStartOver = () => {
    console.log('🆕 User confirmed start over - showing selections modal');
    // Show the StartOverSelections modal
    setCurrentView('startover-selections');
  };

  const handleStartOverSelectionsComplete = async (selections: { career: string; companion: string; changed: 'career' | 'companion' | 'both' | 'none' }) => {
    console.log('🆕 Starting over with new selections:', selections);

    // Clear the current session and start fresh with new selections
    try {
      // Clear the session in manager
      sessionManager.clearSession();

      // Set new selections
      setDashboardSelections({
        career: selections.career,
        careerId: selections.career.toLowerCase().replace(/\s+/g, '-'),
        companion: selections.companion
      });

      // Clear other state
      setActiveSession(null);
      setCompletedContainers(new Set());
      setCurrentSkillIndex(0);
      setShowStartOverConfirm(false);
      setHasSeenIntroduction(true); // Skip intro, user already knows the flow

      // Go to selection confirmation with new choices
      setCurrentView('selection-confirmation');
    } catch (error) {
      console.error('Failed to start over:', error);
    }
  };

  const handleCancelStartOver = () => {
    console.log('❌ Cancelled start over - returning to welcome back');
    setShowStartOverConfirm(false);
    setCurrentView('welcomeback');
  };


  const handleBackToDashboard = () => {
    // Go back to selection modal to allow changing career/companion
    setCurrentView('dashboard'); // Shows ReturnSelectModal
    // Keep the selections but allow user to change them
    // This opens the return selection interface for editing choices
  };

  // Show loading state while checking session
  if (sessionLoading) {
    return (
      <div className="student-dashboard-wrapper student-dashboard-loading" data-theme={theme}>
        <div>Loading your journey...</div>
      </div>
    );
  }

  return (
    <div
      className="student-dashboard-wrapper"
      data-theme={theme}
    >
      {/* Progress Header with Theme Toggle */}
      <ProgressHeader
        showThemeToggle={true}
        showBackButton={false}
        title={dashboardSelections?.career || 'Student Dashboard'}
        subtitle={user?.full_name || 'Student'}
      />

      {/* Learning Adaptation Listener - modified to only handle struggle detection */}
      <LearningAdaptationListener hideVisualFeedback={true} />

      {/* Welcome Back Modal for returning users */}
      {currentView === 'welcomeback' && activeSession && (
        <WelcomeBackModal
          session={activeSession}
          onContinue={handleWelcomeBackContinue}
          onChooseNew={handleWelcomeBackStartOver}
          // No onClose handler - modal can't be closed by backdrop click
          // User must choose Continue or Start New Adventure
        />
      )}

      {/* Start Over Confirmation */}
      {currentView === 'startover' && activeSession && (
        <StartOverConfirmation
          session={activeSession}
          onConfirm={handleConfirmStartOver}
          onCancel={handleCancelStartOver}
        />
      )}

      {/* Start Over Selections - Dual panel for career and companion */}
      {currentView === 'startover-selections' && activeSession && (
        <StartOverSelections
          currentCareer={activeSession.career?.name || 'Coach'}
          currentCompanion={activeSession.companion?.id || activeSession.companion?.name || 'finn'}
          onConfirm={handleStartOverSelectionsComplete}
          onCancel={handleCancelStartOver}
        />
      )}

      {/* Career Selection for New Users */}
      {currentView === 'career-selection' && (
        <CareerChoiceModalV2
          theme={theme}
          onClose={(selectedCareer) => {
            if (selectedCareer) {
              handleCareerSelection({
                career: selectedCareer.career || selectedCareer.name || selectedCareer.title,
                careerId: selectedCareer.careerId || selectedCareer.id
              });
            }
          }}
          user={user}
          profile={profile}
        />
      )}

      {currentView === 'companion-selection' && dashboardSelections && (
        <AICompanionModalV2
          theme={theme}
          onClose={(result) => {
            if (result) {
              handleCompanionSelection({
                companion: result.companionId
              });
            } else {
              // User closed without selecting - go back to career
              setCurrentView('career-selection');
            }
          }}
          user={user}
          profile={profile}
        />
      )}

      {currentView === 'selection-confirmation' && dashboardSelections && (
        <SelectionConfirmationScreen
          companionName={dashboardSelections.companion}
          companionId={dashboardSelections.companion.toLowerCase()}
          userName={user?.full_name || 'Student'}
          careerName={dashboardSelections.career}
          theme={theme}
          onComplete={handleSelectionConfirmationComplete}
        />
      )}

      {currentView === 'introduction' && !hasSeenIntroduction && (
        <IntroductionModal
          theme={theme}
          onComplete={handleIntroductionComplete}
        />
      )}
      

      {/* Return Select Modal - for changing selections from lobby */}
      {currentView === 'dashboard' && (
        <ModalProvider>
          <ReturnSelectModal
            theme={theme}
            onComplete={handleDashboardComplete}
            existingSelections={dashboardSelections} // Pass current selections for editing
          />
        </ModalProvider>
      )}
      
      {currentView === 'lobby' && dashboardSelections && (
        <>
          {console.log('🏢 Rendering CareerIncLobbyModal condition met', {
            currentView,
            dashboardSelections,
            hasDashboardSelections: !!dashboardSelections,
            timestamp: Date.now()
          })}
          <CareerIncLobbyModal
            selectedCareer={dashboardSelections.career}
            selectedCompanion={dashboardSelections.companion}
            theme={theme}
            onComplete={handleLobbyComplete}
            onBack={handleBackToDashboard}
            completedContainers={completedContainers}
            onContainerReturn={activeContainer?.id}
            userId={user?.id || 'default'}
          />
        </>
      )}

      {/* Loading and Narrative screens removed - now handled inside container */}

      {currentView === 'container' && activeContainer && dashboardSelections && studentProfile && selectedCareerObject && (
        <>
          {console.log('📤 StudentDashboard passing to container:', {
            companion: dashboardSelections.companion,
            career: selectedCareerObject,
            hasCompanion: !!dashboardSelections.companion,
            companionValue: dashboardSelections.companion
          })}
          <MultiSubjectContainerAuto
            containerType={activeContainer.id as 'LEARN' | 'EXPERIENCE' | 'DISCOVER'}
            student={studentProfile}
            selectedCharacter={dashboardSelections.companion}
            selectedCareer={selectedCareerObject}
            onComplete={handleContainerSuccess}
            onBack={handleContainerBack}
            theme={theme}
            rubricSessionId={rubricsInitialized ? activeSession?.rubricSessionId : undefined}
            waitingForRubrics={!rubricsInitialized && !!activeSession?.rubricSessionId}
          />
        </>
      )}
    </div>
  );
};

// Export the wrapped component with AICharacterProvider
export const StudentDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useStudentProfile();
  
  // Wait for auth to load before rendering
  if (authLoading) {
    return (
      <div className="student-dashboard-wrapper student-dashboard-loading">
        <div>Loading...</div>
      </div>
    );
  }

  // Get the grade from the user's profile, or from auth data if available
  const studentGrade = profile?.grade_level || (user as any)?.grade_level || 'K';
  
  return (
    <AICharacterProvider 
      studentGrade={studentGrade}
      studentSubject="Math"
    >
      <StudentDashboardInner />
    </AICharacterProvider>
  );
};

export default StudentDashboard;