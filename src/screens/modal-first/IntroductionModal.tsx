/**
 * Introduction Modal - Welcome Experience
 * Shows personalized introduction and daily journey overview
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useStudentProfile } from '../../hooks/useStudentProfile';
import { useTheme } from '../../hooks/useTheme';
import { usePageCategory } from '../../hooks/usePageCategory';
import { useNarrative } from '../../contexts/NarrativeContext';
import { pathIQService } from '../../services/pathIQService';
import { getGradeLevelDisplay, getGradeDisplay } from '../../utils/gradeUtils';
import { skillsData } from '../../data/skillsDataComplete';
import { azureAudioService } from '../../services/AzureAudioService';
import './IntroductionModal.css';

interface IntroductionModalProps {
  onComplete: (selections?: { career: string; companion: string }) => void;
}

export const IntroductionModal: React.FC<IntroductionModalProps> = ({
  onComplete
}) => {
  // Set page category for proper width management
  usePageCategory('modal');

  const theme = useTheme();
  const { user } = useAuth();
  const { profile } = useStudentProfile(user?.id, user?.email);
  const { generateNarrative, playNarrativeSection, narrativeLoading } = useNarrative();
  const [currentStep, setCurrentStep] = useState<'welcome'>('welcome');
  const [selectedCareer, setSelectedCareer] = useState<any>(null);
  const [selectedCompanion, setSelectedCompanion] = useState<any>(null);
  const [narrativeGenerated, setNarrativeGenerated] = useState(false);
  const [todaysJourney, setTodaysJourney] = useState<any>(null);
  const [hoveredCareer, setHoveredCareer] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredCompanion, setHoveredCompanion] = useState<number | null>(null);
  const [hasSeenIntroduction, setHasSeenIntroduction] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [randomCareers, setRandomCareers] = useState<any[]>([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const welcomeAudioPlayedRef = useRef(false);
  const careerAudioPlayedRef = useRef(false);
  const companionAudioPlayedRef = useRef(false);

  const themeColors = {
    light: {
      background: 'linear-gradient(135deg, #F0F4F8 0%, #E2E8F0 100%)',
      cardBg: '#FFFFFF',
      text: '#1A202C',
      subtext: '#718096',
      border: '#E2E8F0',
      primary: '#8B5CF6',
      secondary: '#6366F1',
      accent: '#10B981'
    },
    dark: {
      background: 'linear-gradient(135deg, #0F1419 0%, #1A202C 100%)',
      cardBg: '#1E293B',
      text: '#F7FAFC',
      subtext: '#94A3B8',
      border: '#334155',
      primary: '#8B5CF6',
      secondary: '#7C3AED',
      accent: '#10B981'
    }
  };

  const colors = themeColors[theme];

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const prepareTodaysJourney = useCallback((career?: any) => {
    // Get grade from profile or user auth data
    const studentGrade = profile?.grade_level || (user as any)?.grade_level || 'K';

    // Store grade level for TTS system to use
    sessionStorage.setItem('userGradeLevel', studentGrade);

    console.log('🎯 IntroductionModal: prepareTodaysJourney called with:', {
      profileGradeLevel: profile?.grade_level,
      userGradeLevel: (user as any)?.grade_level,
      finalGrade: studentGrade,
      profile,
      user
    });
    const gradeKey = getGradeKey(studentGrade);
    const careerToUse = career || selectedCareer;
    
    // Get today's subjects and skills WITH CAREER CONTEXT
    const subjects = ['Math', 'ELA', 'Science', 'Social Studies'];
    const todaysSkills = subjects.map(subject => {
      const skills = skillsData[gradeKey]?.[subject] || [];
      const randomSkill = skills[Math.floor(Math.random() * skills.length)];
      
      // Create career-contextualized descriptions
      const careerContext = getCareerContext(subject, careerToUse?.name || 'Explorer');
      
      return {
        subject,
        skill: randomSkill?.skillName || 'Learning Activity',
        careerContext,
        difficulty: getRandomDifficulty(),
        icon: getSubjectIcon(subject),
        color: getSubjectColor(subject),
        careerIcon: careerToUse?.icon || '🎯'
      };
    });

    // Get PathIQ career recommendations if not already selected
    const careers = !careerToUse ? pathIQService.getCareerSelections(
      user?.id || 'default',
      studentGrade,
      profile?.interests || []
    ) : null;

    setTodaysJourney({
      skills: todaysSkills,
      careers: careers?.recommended.slice(0, 3),
      selectedCareer: careerToUse,
      totalActivities: 4,
      estimatedTime: '45 minutes',
      focusArea: todaysSkills[0].subject // Today's primary focus
    });
  }, [user, profile, selectedCareer]);

  useEffect(() => {
    // Only prepare journey data once BOTH user AND profile data are available
    // This ensures we have the correct grade level
    if (user && profile) {
      prepareTodaysJourney();
    } else if (user && !profile) {
      // If we have user but no profile yet, wait for profile to load
      console.log('⏳ IntroductionModal: Waiting for profile to load...');
    }
    
    // Skip straight to welcome - no fake loading
    setCurrentStep('welcome');
    
    // Theme is now managed centrally - no need to load here
  }, [user, profile, prepareTodaysJourney]);

  // Fetch random careers once when user and grade are available
  useEffect(() => {
    if (user) {
      const studentGrade = profile?.grade_level || (user as any)?.grade_level || 'K';
      console.log('🎲 Fetching random careers for grade:', studentGrade);
      const careers = pathIQService.getCareerSelections(
        user.id || 'default',
        studentGrade,
        profile?.interests || []
      ).recommended.slice(0, 3);
      setRandomCareers(careers);
    }
  }, [user?.id, profile?.grade_level, (user as any)?.grade_level]);

  const getCareerContext = (subject: string, career: string) => {
    const contexts: Record<string, Record<string, string>> = {
      'Math': {
        'Doctor': 'Calculate medicine doses',
        'Teacher': 'Create fun math games',
        'Artist': 'Design perfect proportions',
        'Chef': 'Measure ingredients',
        'Scientist': 'Analyze data patterns',
        'Builder': 'Calculate measurements',
        'Programmer': 'Code algorithms',
        'Engineer': 'Design structures',
        'default': 'Solve real problems'
      },
      'Science': {
        'Doctor': 'Understand the body',
        'Teacher': 'Explain how things work',
        'Artist': 'Mix perfect colors',
        'Chef': 'Food chemistry',
        'Scientist': 'Make discoveries',
        'Builder': 'Understand materials',
        'Programmer': 'Build AI systems',
        'Engineer': 'Create innovations',
        'default': 'Explore the world'
      },
      'ELA': {
        'Doctor': 'Write patient notes',
        'Teacher': 'Tell amazing stories',
        'Artist': 'Express ideas',
        'Chef': 'Write recipes',
        'Scientist': 'Share findings',
        'Builder': 'Read blueprints',
        'Programmer': 'Document code',
        'Engineer': 'Present designs',
        'default': 'Communicate ideas'
      },
      'Social Studies': {
        'Doctor': 'Understand cultures',
        'Teacher': 'Share history',
        'Artist': 'Cultural inspiration',
        'Chef': 'World cuisines',
        'Scientist': 'Global research',
        'Builder': 'Community planning',
        'Programmer': 'User cultures',
        'Engineer': 'Global impact',
        'default': 'Connect with others'
      }
    };
    
    return contexts[subject]?.[career] || contexts[subject]?.['default'] || 'Learn and grow';
  };

  const getGradeKey = (grade: string): string => {
    if (grade === 'K' || grade === '1' || grade === '2') return 'Kindergarten';
    if (grade === '3' || grade === '4' || grade === '5' || grade === '6') return 'Grade 3';
    if (grade === '7' || grade === '8' || grade === '9') return 'Grade 7';
    if (grade === '10' || grade === '11' || grade === '12') return 'Grade 10';
    return 'Kindergarten';
  };

  const getRandomDifficulty = () => {
    const difficulties = ['Easy', 'Medium', 'Challenge'];
    return difficulties[Math.floor(Math.random() * difficulties.length)];
  };

  const getSubjectIcon = (subject: string) => {
    const icons: Record<string, string> = {
      'Math': '🔢',
      'ELA': '📚',
      'Science': '🔬',
      'Social Studies': '🌍'
    };
    return icons[subject] || '📖';
  };

  const getSubjectColor = (subject: string) => {
    const subjectColors: Record<string, string> = {
      'Math': '#3B82F6',
      'ELA': '#8B5CF6',
      'Science': '#10B981',
      'Social Studies': '#F59E0B'
    };
    return subjectColors[subject] || colors.primary;
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getMotivationalMessage = () => {
    const studentGrade = profile?.grade_level || (user as any)?.grade_level || 'K';
    const gradeDisplay = getGradeLevelDisplay(studentGrade);

    const messages = [
      "You're doing amazing! Let's discover new things today.",
      "Ready for another awesome learning adventure?",
      "Your brain is growing stronger every day!",
      "Let's make today your best learning day yet!",
      `Time for ${gradeDisplay} learning!` // Grade-specific
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Play Finn's welcome audio when entering welcome step
  useEffect(() => {
    if (currentStep === 'welcome' && !welcomeAudioPlayedRef.current) {
      welcomeAudioPlayedRef.current = true;
      const firstName = profile?.first_name || user?.full_name?.split(' ')[0] || 'friend';

      // Check for previously selected companion in sessionStorage
      const previousCompanion = sessionStorage.getItem('selectedCompanion');
      const voiceToUse = previousCompanion || 'pat';
      const companionName = voiceToUse.charAt(0).toUpperCase() + voiceToUse.slice(1);

      const welcomeText = previousCompanion
        ? `Hi ${firstName}! Welcome back to Pathfinity! I'm ${companionName}, ready for another adventure! Click the purple Start Adventure button below to choose your exciting career for today!`
        : `Hi ${firstName}! Welcome to Pathfinity! I'm Pat, your guide. Click the purple Start Adventure button below to choose your exciting career for today!`;

      console.log(`🔊 IntroductionModal: Playing welcome audio with ${voiceToUse}'s voice`);

      setTimeout(() => {
        azureAudioService.playText(welcomeText, voiceToUse, {
          scriptId: 'intro.welcome',
          variables: {
            firstName: firstName
          },
          onStart: () => console.log('🔊 Welcome audio started'),
          onEnd: () => console.log('🔊 Welcome audio ended')
        });
      }, 500);
    }
  }, [currentStep, profile, user]);

  // Play career selection audio when entering career step
  useEffect(() => {
    if (currentStep === 'career' && !careerAudioPlayedRef.current) {
      careerAudioPlayedRef.current = true;

      // Use previously selected companion if available, otherwise use Pat
      const previousCompanion = sessionStorage.getItem('selectedCompanion');
      const voiceToUse = previousCompanion || 'pat';

      const careerText = "What exciting career would you like to learn today? I've picked three perfect matches just for you! Or you can click the More Options button for more exciting choices.";

      console.log(`🔊 IntroductionModal: Playing career selection audio with ${voiceToUse}'s voice`);

      setTimeout(() => {
        azureAudioService.playText(careerText, voiceToUse, {
          scriptId: 'intro.career_prompt',
          variables: {},
          onStart: () => console.log('🔊 Career audio started'),
          onEnd: () => console.log('🔊 Career audio ended')
        });
      }, 500);
    }
  }, [currentStep]);

  // Companion selection removed - now handled in DashboardModal's renderAICompanionSelection

  const studentGradeForSidebar = profile?.grade_level || (user as any)?.grade_level || 'K';
  
  return (
    <div 
      className={`introduction-modal theme-${theme}`}
      style={{ 
        background: colors.background,
        width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >

      {/* Welcome Step - Personalized Greeting */}
      {currentStep === 'welcome' && (
        <div className="intro-welcome-container animated-fade-in" style={{ textAlign: 'center', maxWidth: '600px' }}>
          <h1 style={{
            color: colors.text,
            fontSize: '2.5rem',
            marginBottom: '1rem'
          }}>
            🌙 {getTimeBasedGreeting()}, {profile?.first_name || user?.full_name?.split(' ')[0] || 'Learner'}! 👋
          </h1>
          
          <h2 style={{ 
            color: colors.primary,
            fontSize: '1.3rem',
            marginBottom: '2rem'
          }}>
            {(() => {
              const studentGrade = profile?.grade_level || (user as any)?.grade_level || 'K';
              const gradeDisplay = getGradeLevelDisplay(studentGrade);
              return `Time for ${gradeDisplay} learning!`;
            })()}
          </h2>

          <div style={{
            backgroundColor: colors.cardBg,
            padding: '2rem',
            borderRadius: '1rem',
            border: `2px solid ${colors.border}`,
            marginBottom: '2rem'
          }}>
            <p style={{ 
              color: colors.text,
              fontSize: '1.1rem',
              marginBottom: '1rem'
            }}>
              🎯 {getMotivationalMessage()}
            </p>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-around',
              marginTop: '1.5rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '2rem' }}>⭐</span>
                <p style={{ color: colors.subtext, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  0 of {todaysJourney?.totalActivities || 4} activities ready
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '2rem' }}>🏆</span>
                <p style={{ color: colors.subtext, fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  {todaysJourney?.estimatedTime || '45 minutes'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              // Complete introduction and proceed to career selection modal
              console.log('🎯 IntroductionModal: Completing introduction and moving to career selection');
              onComplete();
            }}
            style={{
              backgroundColor: colors.primary,
              color: 'white',
              padding: '1rem 3rem',
              borderRadius: '0.75rem',
              border: 'none',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            🚀 Start Adventure
            <span style={{ 
              marginLeft: '0.5rem',
              fontSize: '0.9rem',
              opacity: 0.8
            }}>
              (Choose Your Adventure)
            </span>
          </button>
        </div>
      )}

      {/* Career Selection Step - Removed (now in CareerChoiceModalV2) */}
      {false && (() => {
        // Use the pre-fetched careers from state
        const careers = randomCareers;

        return (
          <div className="intro-career-container" style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            minHeight: '100vh',
            height: '100vh',
            maxHeight: '100vh',
            padding: windowWidth <= 768 ? '1rem' : '2rem',
            paddingBottom: windowWidth <= 768 ? '4rem' : '2rem',
            background: colors.background,
            overflowY: 'auto',
            overflowX: 'hidden',
            boxSizing: 'border-box',
            WebkitOverflowScrolling: 'touch',
            position: 'relative'
          }}>
            {/* Simplified Header */}
            <div style={{ 
              textAlign: 'center',
              marginBottom: windowWidth <= 768 ? '1.5rem' : '3rem',
              animation: 'fadeInDown 0.6s ease-out',
              flexShrink: 0
            }}>
              <h1 style={{ 
                color: colors.text, 
                fontSize: windowWidth <= 768 ? '1.5rem' : '2.2rem',
                marginBottom: '0.5rem',
                fontWeight: '600',
                padding: '0 1rem'
              }}>
                What do you want to be today?
              </h1>
              <p style={{ 
                color: colors.subtext,
                fontSize: windowWidth <= 768 ? '0.9rem' : '1rem',
                opacity: 0.8
              }}>
                Choose your career adventure
              </p>
            </div>

            {/* Featured Career Display - One at a time */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2rem',
              width: '100%',
              maxWidth: windowWidth <= 768 ? '100%' : '800px',
              marginBottom: windowWidth <= 768 ? '2rem' : '0',
              flex: '1 1 auto',
              minHeight: 0
            }}>
              {/* Main Featured Career - Larger */}
              <div style={{
                display: 'flex',
                flexDirection: windowWidth <= 768 ? 'column' : 'row',
                gap: windowWidth <= 768 ? '1rem' : '2rem',
                width: '100%',
                alignItems: windowWidth <= 768 ? 'stretch' : 'center',
                justifyContent: 'center',
                flexWrap: windowWidth <= 1024 ? 'wrap' : 'nowrap',
                padding: windowWidth <= 768 ? '0 0.5rem' : '0'
              }}>
                {careers.map((career, index) => {
                  // Handle both career objects and category objects
                  const isCategory = career.category && !career.careerId;
                  const displayName = isCategory ? career.category.name : career.name;
                  const displayIcon = isCategory ? career.category.icon : career.icon;
                  const displayId = isCategory ? career.category.id : career.careerId;
                  const displayColor = career.color || '#6366F1';
                  
                  return (
                  <div
                    key={displayId || index}
                    onClick={() => {
                      console.log('🎲 Random Career/Category selected:', displayName);
                      setSelectedIndex(index);
                      setSelectedCareer(career);
                      // Go directly to dashboard with career selected
                      setTimeout(() => {
                        onComplete({
                          career: career.name,
                          careerId: career.careerId
                        });
                      }, 300);
                    }}
                    onMouseEnter={() => {
                      // Clear any existing timeout
                      if (hoverTimeout) clearTimeout(hoverTimeout);
                      // Add delay before triggering hover effect
                      const timeout = setTimeout(() => {
                        setHoveredCareer(index);
                      }, 200); // 200ms delay before hover effect
                      setHoverTimeout(timeout);
                    }}
                    onMouseLeave={() => {
                      // Clear timeout if mouse leaves before delay
                      if (hoverTimeout) {
                        clearTimeout(hoverTimeout);
                        setHoverTimeout(null);
                      }
                      setHoveredCareer(null);
                    }}
                    style={{
                      backgroundColor: colors.cardBg,
                      padding: windowWidth <= 768 
                        ? (index === 1 ? '1.5rem' : '1.25rem')
                        : (index === 1 ? '2.5rem' : '2rem'),
                      borderRadius: '1.5rem',
                      border: `3px solid ${hoveredCareer === index ? career.color : colors.border}`,
                      cursor: 'pointer',
                      transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)', // Slower transition
                      transform: windowWidth <= 768 
                        ? (hoveredCareer === index ? 'translateY(-4px)' : 'translateY(0)')
                        : `scale(${index === 1 ? 1.1 : 0.95}) ${hoveredCareer === index ? 'translateY(-8px)' : 'translateY(0)'}`,
                      opacity: hoveredCareer !== null && hoveredCareer !== index ? 0.6 : 1,
                      width: windowWidth <= 480 
                        ? '100%' 
                        : windowWidth <= 768 
                          ? (index === 1 ? '90%' : '85%')
                          : (index === 1 ? '280px' : '220px'),
                      minWidth: windowWidth <= 768 ? 'auto' : 'auto',
                      maxWidth: windowWidth <= 768 ? '100%' : 'none',
                      boxShadow: hoveredCareer === index 
                        ? `0 20px 40px ${career.color}40` 
                        : '0 4px 12px rgba(0,0,0,0.1)',
                      animation: `fadeInUp ${0.4 + index * 0.2}s ease-out`,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Recommended Badge for top choice */}
                    {index === 1 && (
                      <div style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        backgroundColor: colors.accent,
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0 1rem 0 1rem',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        ⭐ TOP MATCH
                      </div>
                    )}
                    
                    {/* Career Icon - Bigger for featured */}
                    <div style={{ 
                      fontSize: index === 1 ? '4rem' : '3rem', 
                      marginBottom: '1rem',
                      transition: 'transform 0.6s ease-in-out', // Slower, smoother transition
                      transform: hoveredCareer === index ? 'scale(1.1) rotate(5deg)' : 'scale(1)'
                    }}>
                      {displayIcon || '🎯'}
                    </div>
                    
                    {/* Career Name */}
                    <h3 style={{ 
                      color: colors.text,
                      fontSize: windowWidth <= 768 
                        ? (index === 1 ? '1.2rem' : '1rem')
                        : (index === 1 ? '1.5rem' : '1.2rem'),
                      marginBottom: '0.5rem',
                      fontWeight: '600',
                      writingMode: 'horizontal-tb',
                      textOrientation: 'mixed',
                      whiteSpace: 'normal',
                      wordBreak: 'normal',
                      overflowWrap: 'break-word',
                      minWidth: '100%',
                      textAlign: 'center'
                    }}>
                      {displayName}
                    </h3>
                    
                    {/* PathIQ Score - Visual */}
                    <div style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: colors.border,
                      borderRadius: '3px',
                      marginBottom: '0.5rem',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${career.score || career.avgScore || 75}%`,
                        height: '100%',
                        backgroundColor: displayColor,
                        transition: 'width 1s ease-out',
                        animation: hoveredCareer === index ? 'pulse 1s infinite' : 'none'
                      }} />
                    </div>
                    
                    <p style={{ 
                      color: colors.subtext,
                      fontSize: windowWidth <= 768 ? '0.75rem' : '0.85rem',
                      marginBottom: '0.5rem',
                      writingMode: 'horizontal-tb',
                      textOrientation: 'mixed',
                      whiteSpace: 'nowrap',
                      textAlign: 'center'
                    }}>
                      {isCategory ? `${career.careerCount || 0} careers available` : `Match: ${career.score || 75}%`}
                    </p>
                    
                    {/* Match Reason - Only show on hover or featured */}
                    <div style={{
                      height: hoveredCareer === index || index === 1 ? 'auto' : '0',
                      opacity: hoveredCareer === index || index === 1 ? 1 : 0,
                      overflow: 'hidden',
                      transition: 'all 0.5s ease-in-out', // Slower transition
                      marginTop: '0.5rem'
                    }}>
                      <p style={{ 
                        color: displayColor,
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        padding: '0.5rem',
                        backgroundColor: displayColor + '15',
                        borderRadius: '0.5rem'
                      }}>
                        {isCategory ? 
                          (career.category?.description || 'Explore exciting careers in this field!') :
                          (career.matchReasons && career.matchReasons[0] ? career.matchReasons[0] : 'Perfect for you!')
                        }
                      </p>
                    </div>
                  </div>
                  )
                })}
              </div>

              {/* Quick Action Buttons */}
              <div style={{
                display: 'flex',
                flexDirection: windowWidth <= 480 ? 'column' : 'row',
                gap: windowWidth <= 768 ? '1rem' : '1.5rem',
                marginTop: '1rem',
                width: windowWidth <= 480 ? '100%' : 'auto',
                maxWidth: windowWidth <= 480 ? '300px' : 'none'
              }}>
                <button
                  onClick={() => {
                    // Quick select the recommended career
                    const topCareer = careers[1];
                    setSelectedCareer(topCareer);
                    // Go directly to dashboard with career selected
                    setTimeout(() => {
                      console.log('🚀 Quick Start selected:', topCareer.name);
                      onComplete({
                        career: topCareer.name,
                        careerId: topCareer.careerId
                      });
                    }, 300);
                  }}
                  style={{
                    padding: windowWidth <= 768 ? '0.75rem 1.5rem' : '0.75rem 2rem',
                    backgroundColor: colors.primary,
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    fontSize: windowWidth <= 768 ? '0.9rem' : '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    animation: 'pulse 2s infinite',
                    width: windowWidth <= 480 ? '100%' : 'auto'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  🎯 Quick Start with Top Match
                </button>
                
                <button
                  onClick={() => {
                    // Navigate to Career Choice modal for full career selection
                    // This allows users to see all available careers
                    onComplete({
                      showCareerChoice: true
                    });
                  }}
                  style={{
                    padding: windowWidth <= 768 ? '0.75rem 1.5rem' : '0.75rem 2rem',
                    backgroundColor: 'transparent',
                    color: colors.subtext,
                    border: `2px solid ${colors.border}`,
                    borderRadius: '0.75rem',
                    fontSize: windowWidth <= 768 ? '0.9rem' : '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    width: windowWidth <= 480 ? '100%' : 'auto'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                    e.currentTarget.style.color = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.color = colors.subtext;
                  }}
                >
                  More Options
                </button>
              </div>

              {/* Subtle hint */}
              <p style={{ 
                color: colors.subtext,
                fontSize: '0.85rem',
                opacity: 0.7,
                marginTop: '1rem',
                animation: 'fadeIn 2s ease-out'
              }}>
                💡 New careers unlock as you learn and grow
              </p>
            </div>
          </div>
        );
      })()}

      {/* Companion Selection Step - REMOVED - Now handled in DashboardModal */}
      {false && currentStep === 'companion' && (
        <div className="intro-companion-container animated-fade-in" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          background: colors.background
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '3rem'
          }}>
            <h1 style={{
              color: colors.text,
              fontSize: '2.2rem',
              marginBottom: '1rem'
            }}>
              Choose Your Learning Companion!
            </h1>
            <p style={{
              color: colors.subtext,
              fontSize: '1.1rem'
            }}>
              Your AI friend will guide you through your {selectedCareer?.name || 'career'} journey today!
            </p>
          </div>

          {/* Companion Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            maxWidth: '900px',
            width: '100%',
            marginBottom: '2rem'
          }}>
            {[
              { id: 'finn', name: 'Finn', emoji: '🦊', description: 'Friendly & encouraging', color: '#10B981' },
              { id: 'sage', name: 'Sage', emoji: '🦉', description: 'Wise & thoughtful', color: '#8B5CF6' },
              { id: 'spark', name: 'Spark', emoji: '✨', description: 'Creative & energetic', color: '#F59E0B' },
              { id: 'harmony', name: 'Harmony', emoji: '🌈', description: 'Calm & supportive', color: '#EC4899' }
            ].map((companion) => (
              <div
                key={companion.id}
                onClick={() => {
                  setSelectedCompanion(companion);
                  // Generate narrative now that both career and companion are selected
                  console.log('🎭 Both career and companion selected, generating narrative');

                  const studentGrade = profile?.grade_level || (user as any)?.grade_level || 'K';
                  generateNarrative({
                    career: selectedCareer.name,
                    companion: companion.id,
                    gradeLevel: studentGrade,
                    userId: user?.id || 'default',
                    userName: profile?.first_name || user?.full_name?.split(' ')[0]
                  });

                  // Navigate to CareerIncLobby
                  setTimeout(() => {
                    onComplete({
                      career: selectedCareer.name,
                      companion: companion.id
                    });
                  }, 500);
                }}
                style={{
                  backgroundColor: colors.cardBg,
                  padding: '2rem',
                  borderRadius: '1rem',
                  border: `3px solid ${selectedCompanion?.id === companion.id ? companion.color : colors.border}`,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  transform: selectedCompanion?.id === companion.id ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: selectedCompanion?.id === companion.id ? `0 10px 30px ${companion.color}40` : '0 2px 10px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  if (!selectedCompanion || selectedCompanion.id !== companion.id) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.borderColor = companion.color;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedCompanion || selectedCompanion.id !== companion.id) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = colors.border;
                  }
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>
                  {companion.emoji}
                </div>
                <h3 style={{
                  color: colors.text,
                  fontSize: '1.3rem',
                  marginBottom: '0.5rem',
                  textAlign: 'center'
                }}>
                  {companion.name}
                </h3>
                <p style={{
                  color: colors.subtext,
                  fontSize: '0.9rem',
                  textAlign: 'center'
                }}>
                  {companion.description}
                </p>
              </div>
            ))}
          </div>

          {narrativeLoading && (
            <div style={{
              padding: '1rem',
              backgroundColor: colors.cardBg,
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <p style={{ color: colors.text }}>🎨 Creating your personalized learning journey...</p>
            </div>
          )}
        </div>
      )}

      {/* Journey Overview Step - REMOVED since we go directly to CareerIncLobby */}
      {false && currentStep === 'journey' && todaysJourney && (
        <div className="intro-journey-container animated-fade-in" style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          background: colors.background
        }}>
          {/* Header */}
          <header style={{
            padding: '1rem 2rem',
            borderBottom: `1px solid ${colors.border}`,
            backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255, 255, 255, 0.5)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.5rem' }}>🚀</span>
                <div>
                  <h1 style={{ 
                    color: colors.text, 
                    fontSize: '1.3rem',
                    margin: 0
                  }}>
                    Welcome back, {profile?.first_name || user?.full_name?.split(' ')[0] || 'Learner'}!
                  </h1>
                  <p style={{ 
                    color: colors.subtext,
                    fontSize: '0.9rem',
                    margin: 0
                  }}>
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: colors.primary,
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  Grade {profile?.grade_level || 'K'}
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Skip introduction for today?')) {
                      onComplete({
                        career: todaysJourney?.selectedCareer?.name || 'Explorer',
                        companion: selectedCompanion?.name || 'Finn'
                      });
                    }
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    border: `2px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    color: colors.subtext,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                    e.currentTarget.style.color = colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.color = colors.subtext;
                  }}
                >
                  Skip →
                </button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div style={{ 
            flex: 1,
            overflowY: 'auto',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{ 
              maxWidth: '800px',
              width: '100%'
            }}>
              <h2 style={{ 
                color: colors.text,
                fontSize: '1.8rem',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                Today's {todaysJourney.selectedCareer?.name || 'Learning'} Journey
              </h2>
              
              <p style={{
                color: colors.subtext,
                textAlign: 'center',
                marginBottom: '2rem'
              }}>
                Learn everything through the lens of being a {todaysJourney.selectedCareer?.name || 'Career Explorer'}!
              </p>

          {/* Career Badge */}
          {todaysJourney.selectedCareer && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{
                backgroundColor: todaysJourney.selectedCareer.color + '20',
                padding: '1rem 2rem',
                borderRadius: '1rem',
                border: `2px solid ${todaysJourney.selectedCareer.color}`,
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <span style={{ fontSize: '2rem' }}>
                  {todaysJourney.selectedCareer.icon}
                </span>
                <div>
                  <h3 style={{ 
                    color: colors.text,
                    margin: 0,
                    fontSize: '1.2rem'
                  }}>
                    Career Focus: {todaysJourney.selectedCareer.name}
                  </h3>
                  <p style={{ 
                    color: colors.subtext,
                    margin: 0,
                    fontSize: '0.9rem'
                  }}>
                    All lessons connect to this career today!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Learning Topics - Compact Card View */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '2rem',
            justifyContent: 'center',
            flexWrap: 'nowrap'
          }}>
            {todaysJourney.skills.map((skill: any, index: number) => (
              <div
                key={index}
                className="skill-card"
                style={{
                  backgroundColor: colors.cardBg,
                  padding: '0.75rem',
                  borderRadius: '0.75rem',
                  border: `2px solid ${colors.border}`,
                  textAlign: 'center',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  flex: '1',
                  minWidth: '160px',
                  maxWidth: '200px',
                  animation: `fadeInUp ${0.3 + index * 0.1}s ease-out`,
                  opacity: 0,
                  animationFillMode: 'forwards'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.05)';
                  e.currentTarget.style.borderColor = skill.color;
                  e.currentTarget.style.boxShadow = `0 8px 20px ${skill.color}30`;
                  // Show expanded info
                  const details = e.currentTarget.querySelector('.skill-details') as HTMLElement;
                  if (details) {
                    details.style.maxHeight = '100px';
                    details.style.opacity = '1';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                  // Hide expanded info
                  const details = e.currentTarget.querySelector('.skill-details') as HTMLElement;
                  if (details) {
                    details.style.maxHeight = '0';
                    details.style.opacity = '0';
                  }
                }}
              >
                {/* Career Badge - Smaller */}
                <div style={{
                  position: 'absolute',
                  top: '0.25rem',
                  right: '0.25rem',
                  fontSize: '0.9rem',
                  opacity: 0.6,
                  backgroundColor: colors.background,
                  padding: '0.1rem',
                  borderRadius: '50%'
                }}>
                  {skill.careerIcon}
                </div>
                
                {/* Main Content - Simplified */}
                <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>
                  {skill.icon}
                </div>
                <h3 style={{ 
                  color: skill.color,
                  fontSize: '0.9rem',
                  marginBottom: '0.25rem',
                  fontWeight: '600'
                }}>
                  {skill.subject}
                </h3>
                
                {/* Career Context - Primary Focus */}
                <p style={{ 
                  color: colors.text,
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  lineHeight: '1.2'
                }}>
                  {skill.careerContext}
                </p>
                
                {/* Expandable Details - Hidden by default */}
                <div 
                  className="skill-details"
                  style={{ 
                    maxHeight: '0',
                    opacity: '0',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    marginTop: '0.25rem'
                  }}
                >
                  <p style={{ 
                    color: colors.subtext,
                    fontSize: '0.7rem',
                    borderTop: `1px solid ${colors.border}`,
                    paddingTop: '0.25rem'
                  }}>
                    Skill: {skill.skill}
                  </p>
                </div>
                <span style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  backgroundColor: skill.difficulty === 'Easy' ? colors.accent : 
                                   skill.difficulty === 'Medium' ? colors.secondary : colors.primary,
                  color: 'white',
                  borderRadius: '1rem',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  {skill.difficulty}
                </span>
              </div>
            ))}
          </div>

              {/* Personalization Notice */}
              <div style={{
                backgroundColor: colors.cardBg,
                padding: '1rem',
                borderRadius: '0.75rem',
                border: `2px solid ${colors.primary}`,
                marginBottom: '2rem',
                textAlign: 'center'
              }}>
                <p style={{ color: colors.text, fontSize: '0.95rem', margin: '0.5rem 0' }}>
                  ✨ <strong>Personalized for {profile?.first_name || 'You'} by PathIQ™</strong>
                </p>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  gap: '1.5rem',
                  marginTop: '0.5rem',
                  fontSize: '0.85rem'
                }}>
                  <span style={{ color: colors.subtext }}>Grade {profile?.grade_level || 'K'}</span>
                  <span style={{ color: colors.subtext }}>Career-First Learning</span>
                  <span style={{ color: colors.subtext }}>AI-Powered</span>
                </div>
              </div>

              {/* Start Button */}
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => onComplete({
                    career: todaysJourney.selectedCareer?.name || 'Explorer',
                    companion: selectedCompanion?.name || 'Finn'
                  })}
                  style={{
                    backgroundColor: colors.primary,
                    color: 'white',
                    padding: '1.25rem 4rem',
                    borderRadius: '0.75rem',
                    border: 'none',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
                    animation: 'pulse 2s infinite'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
                  }}
                >
                  🚀 Let's Learn Together!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntroductionModal;