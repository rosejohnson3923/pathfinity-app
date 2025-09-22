/**
 * Student Dashboard - Modal-First Wrapper
 * Renders the new modal-first Dashboard
 */

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { DashboardModal } from '../modal-first/DashboardModal';
import { IntroductionModal } from '../modal-first/IntroductionModal';
import { CareerIncLobbyModal } from '../modal-first/CareerIncLobbyModal';
import { NarrativeIntroductionModal } from '../modal-first/NarrativeIntroductionModal';
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
import './StudentDashboard.css';

const StudentDashboardInner: React.FC = () => {
  // Apply dashboard width management category
  usePageCategory('dashboard');

  const { user } = useAuth();
  const { profile } = useStudentProfile();
  const { theme, setTheme } = useThemeControl(); // Use centralized theme service with controls
  const { generateNarrative, playNarrativeSection, masterNarrative, narrativeLoading } = useNarrative();
  const [currentView, setCurrentView] = useState<'introduction' | 'dashboard' | 'lobby' | 'narrative' | 'container'>('introduction');
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

  useEffect(() => {
    // Theme is now managed centrally via themeService
    
    // Check if user has seen introduction today
    const lastIntroDate = localStorage.getItem(`pathfinity-intro-${user?.id}`);
    const today = new Date().toDateString();
    
    // Check for saved selections from a previous session
    const savedSelections = localStorage.getItem(`pathfinity-selections-${user?.id}`);
    
    if (lastIntroDate === today && savedSelections) {
      // Already seen introduction today and have selections, skip to lobby
      const selections = JSON.parse(savedSelections);
      setDashboardSelections(selections);
      setHasSeenIntroduction(true);
      setCurrentView('lobby');
    }
    // For development: Uncomment to always show introduction
    // setCurrentView('introduction');
  }, [user]);

  const handleIntroductionComplete = (selections?: { career?: string; companion?: string; showCareerChoice?: boolean; fromRandomCareer?: boolean; careerId?: string }) => {
    console.log('🎯 handleIntroductionComplete called with:', selections);

    // Mark introduction as seen for today
    const today = new Date().toDateString();
    localStorage.setItem(`pathfinity-intro-${user?.id}`, today);
    setHasSeenIntroduction(true);

    // Check if user clicked "More Options" button
    if (selections?.showCareerChoice) {
      console.log('📂 User clicked More Options - showing career choice modal');
      // Navigate to dashboard with a flag to open career choice modal
      // Pass empty selections to trigger the career choice modal to open
      setDashboardSelections({ companion: '', career: '' });
      setCurrentView('dashboard');
      return;
    }

    // ALL career selections now go to dashboard for companion selection
    // Both direct career selection and fromRandomCareer selection
    if (selections?.career && !selections?.companion) {
      console.log('🎯 Career selected - going to dashboard for AI companion selection');
      setDashboardSelections({
        career: selections.career,
        careerId: selections.careerId,
        companion: '' // Empty companion will trigger AI companion modal in DashboardModal
      });
      setCurrentView('dashboard');
      return;
    }

    // If we have BOTH selections (shouldn't happen anymore but keep for backwards compatibility)
    if (selections?.career && selections?.companion) {
      console.log('✅ Complete selections from intro - going to lobby');
      const dashboardSelections = {
        companion: selections.companion,
        career: selections.career
      };
      setDashboardSelections(dashboardSelections);
      // Save selections for returning users
      localStorage.setItem(`pathfinity-selections-${user?.id}`, JSON.stringify(dashboardSelections));
      // Skip the DashboardModal and go directly to lobby since we have selections
      setCurrentView('lobby');
    } else {
      console.log('📋 No selections - showing dashboard');
      // No selections from introduction, show dashboard
      setCurrentView('dashboard');
    }
  };

  const handleDashboardComplete = async (selections: { companion: string; career: string; careerData?: any }) => {
    console.log('Dashboard flow complete - transitioning to CareerInc Lobby', selections);
    setDashboardSelections(selections);

    // Immediately transition to lobby so CareerIncLobbyModal can mount
    setCurrentView('lobby');

    // Generate narrative after transitioning (CareerIncLobby will show loading state)
    if (user && selections.career && selections.companion) {
      const gradeLevel = profile?.grade_level || (user as any)?.grade_level || 'K';

      // Use Finn as default if no companion selected
      const companion = selections.companion || 'finn';

      // Pass careerData if available, otherwise just the career string
      // This ensures proper cache key generation with the career ID
      generateNarrative({
        career: selections.careerData || selections.career,
        companion: companion,
        gradeLevel: gradeLevel,
        userId: user.id || 'default',
        userName: user.full_name
      });
    }
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

    // Ensure the activeContainer has an 'id' property that matches what MockLearningContainer expects
    setActiveContainer({
      id: lobbySelections.container,
      objectives: lobbySelections.objectives
    });
    // First show the narrative introduction, then the container
    setCurrentView('narrative');
  };

  const handleContainerComplete = () => {
    if (activeContainer) {
      console.log('Container completed:', activeContainer.id);
      // Mark container as completed
      setCompletedContainers(prev => new Set(prev).add(activeContainer.id));
      // Return to lobby
      setCurrentView('lobby');
      setActiveContainer(null);
    }
  };


  const handleBackToDashboard = () => {
    // Go back to dashboard and clear selections to allow re-selection
    setCurrentView('dashboard');
    // Keep the selections but allow user to change them
    // This will show the dashboard with the Career Choice modal accessible
  };

  // Debug logging for render state
  console.log('🎨 StudentDashboard render state:', {
    currentView,
    dashboardSelections,
    narrativeLoading,
    masterNarrative: !!masterNarrative,
    timestamp: Date.now()
  });

  return (
    <div
      className="student-dashboard-wrapper"
      data-theme={theme}
    >

      {/* Learning Adaptation Listener - modified to only handle struggle detection */}
      <LearningAdaptationListener hideVisualFeedback={true} />

      {currentView === 'introduction' && !hasSeenIntroduction && (
        <IntroductionModal
          theme={theme}
          onComplete={handleIntroductionComplete}
        />
      )}
      
      {currentView === 'dashboard' && (
        <ModalProvider>
          <DashboardModal 
            theme={theme}
            onComplete={handleDashboardComplete}
            existingSelections={dashboardSelections}
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

      {currentView === 'narrative' && activeContainer && dashboardSelections && studentProfile && (
        <NarrativeIntroductionModal
          studentName={studentProfile.display_name || studentProfile.name}
          gradeLevel={studentProfile.grade_level}
          career={dashboardSelections.career}
          companion={dashboardSelections.companion}
          container={activeContainer.id}
          completedContainers={completedContainers}
          skill={learningSkill}
          theme={theme}
          onContinue={() => setCurrentView('container')}
        />
      )}

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
    console.log('⏳ StudentDashboard: Waiting for auth to load...');
    return (
      <div className="student-dashboard-wrapper student-dashboard-loading">
        <div>Loading...</div>
      </div>
    );
  }
  
  // Get the grade from the user's profile, or from auth data if available
  const studentGrade = profile?.grade_level || (user as any)?.grade_level || 'K';
  
  console.log('🎓 StudentDashboard: Passing grade to AICharacterProvider:', {
    profileGradeLevel: profile?.grade_level,
    userGradeLevel: (user as any)?.grade_level,
    finalGrade: studentGrade,
    userName: user?.full_name,
    authLoading,
    profileLoading
  });
  
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