/**
 * Dashboard Modal - Full Page Container
 * The main dashboard that contains sub-modals for daily learning journey
 */

import React, { useState, useEffect } from 'react';
import { useModalSystem } from '../../hooks/useModalSystem';
import { useAuth } from '../../hooks/useAuth';
import { useStudentProfile } from '../../hooks/useStudentProfile';
import { useTheme } from '../../hooks/useTheme';
import { themeService } from '../../services/themeService';
import { ModalTypeEnum } from '../../ai-engine/types';
import { ParticlesBackground } from '../../components/ParticlesBackground';
import { companionVoiceoverService } from '../../services/companionVoiceoverService';
import { audioService } from '../../services/audioService';
import { getCompanionImageUrl } from '../../services/aiCompanionImages';
import './DashboardModal.css';
import modalStyles from '../../styles/shared/components/ModalCard.module.css';
import styles from '../../styles/shared/components/DashboardModal.module.css';

// Sub-modal components
import { DailyLearningModal } from './sub-modals/DailyLearningModal';
import { AICompanionModal } from './sub-modals/AICompanionModal';
import { CareerChoiceModalV2 } from './sub-modals/CareerChoiceModalV2';
import { SettingsModal } from './sub-modals/SettingsModal';
import { CompanionChatModal } from './sub-modals/CompanionChatModal';

// Bento Dashboard Component
import { BentoDashboard } from '../../components/dashboard/BentoDashboard';

export interface DashboardModalProps {
  onComplete?: (selections: { companion: string; career: string }) => void;
  theme?: 'light' | 'dark';
  existingSelections?: { companion: string; career: string } | null;
}

export const DashboardModal: React.FC<DashboardModalProps> = ({ 
  onComplete,
  theme: initialTheme = 'light',
  existingSelections
}) => {
  const { user } = useAuth();
  const { profile } = useStudentProfile(user?.id, user?.email);
  const { openModal } = useModalSystem();
  const themeContext = useTheme();
  
  const [activeSubModal, setActiveSubModal] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCompanionChat, setShowCompanionChat] = useState(false);
  const [dashboardState, setDashboardState] = useState({
    dailyLearningComplete: false,
    companionSelected: (existingSelections?.companion && existingSelections.companion !== '') 
      ? existingSelections.companion 
      : null as string | null,
    careerSelected: (existingSelections?.career && existingSelections.career !== '') 
      ? existingSelections.career 
      : null as string | null,
    progressToday: 0
  });
  
  // AI Companion selection state
  const [selectedCompanionTemp, setSelectedCompanionTemp] = useState<string | null>(null);
  const [hoveredCompanion, setHoveredCompanion] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  
  // Define companions for chat modal
  const companions = [
    {
      id: 'finn',
      name: 'Finn',
      personality: 'Friendly & Encouraging',
      teachingStyle: 'Patient and supportive, breaks down complex topics into simple steps',
      voiceStyle: 'Warm and friendly',
      color: '#8B5CF6',
      quote: "Let's learn together, one step at a time!"
    },
    {
      id: 'sage',
      name: 'Sage',
      personality: 'Wise & Thoughtful',
      teachingStyle: 'Asks thought-provoking questions to help you discover answers',
      voiceStyle: 'Calm and contemplative',
      color: '#10B981',
      quote: "The journey of learning is as important as the destination."
    },
    {
      id: 'spark',
      name: 'Spark',
      personality: 'Creative & Energetic',
      teachingStyle: 'Makes learning fun with games, challenges, and creative projects',
      voiceStyle: 'Enthusiastic and playful',
      color: '#F59E0B',
      quote: "Let's turn learning into an adventure!"
    },
    {
      id: 'harmony',
      name: 'Harmony',
      personality: 'Calm & Supportive',
      teachingStyle: 'Creates a safe space for learning with mindfulness and encouragement',
      voiceStyle: 'Soothing and gentle',
      color: '#EC4899',
      quote: "Every mistake is a chance to grow stronger."
    }
  ];
  
  // Debug logging
  console.log('📊 DashboardModal rendered with:', {
    existingSelections,
    activeSubModal,
    dashboardState,
    careerSelected: dashboardState.careerSelected,
    companionSelected: dashboardState.companionSelected
  });
  
  // Auto-show career/companion selection if needed
  useEffect(() => {
    // Prevent auto-opening if we've already done it
    if (hasAutoOpened) return;
    
    // Check for "More Options" click (empty career string)
    if (existingSelections && existingSelections.career === '') {
      console.log('📂 Opening career choice modal - user clicked More Options');
      setActiveSubModal('career-choice');
      setHasAutoOpened(true);
      return;
    }
    
    // If no active modal, check what needs to be selected
    // Only auto-open modals if we haven't completed both selections
    if (!activeSubModal && (!dashboardState.careerSelected || !dashboardState.companionSelected)) {
      // Auto-open career selection if not selected
      if (!dashboardState.careerSelected) {
        console.log('🎯 Auto-opening career selection - no career selected');
        setActiveSubModal('career-choice');
        setHasAutoOpened(true);
      }
      // Auto-open companion selection if career is selected but companion is not
      else if (dashboardState.careerSelected && !dashboardState.companionSelected) {
        console.log('🤖 Auto-opening companion selection - no companion selected');
        setActiveSubModal('ai-companion');
        setHasAutoOpened(true);
      }
    }
    
    // Log when both are selected
    if (dashboardState.careerSelected && dashboardState.companionSelected) {
      console.log('✅ Both career and companion selected - showing BentoDashboard');
    }
  }, [existingSelections, dashboardState.careerSelected, dashboardState.companionSelected, activeSubModal, hasAutoOpened]);

  // Theme colors based on UI guidelines
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

  const colors = themeColors[themeContext.theme || initialTheme];

  // Dashboard sections with progressive unlock system
  const dashboardSections = [
    {
      id: 'career-choice',
      title: 'Career of the Day',
      icon: '🚀',
      description: dashboardState.careerSelected || 'Pick your adventure',
      color: colors.accent,
      status: dashboardState.careerSelected ? 'complete' : 'active',
      isEnabled: true, // Always enabled (first step)
      order: 1
    },
    {
      id: 'ai-companion',
      title: 'AI Companion',
      icon: '🤖',
      description: dashboardState.companionSelected || 'Choose your guide',
      color: colors.secondary,
      status: dashboardState.companionSelected ? 'complete' : (dashboardState.careerSelected ? 'active' : 'locked'),
      isEnabled: !!dashboardState.careerSelected, // Enabled after career selection
      order: 2
    },
    {
      id: 'daily-learning',
      title: 'Start Learning Journey',
      icon: '📚',
      description: 'Click to enter CareerInc Lobby',
      progress: dashboardState.progressToday,
      color: colors.primary,
      status: dashboardState.companionSelected ? 'active' : 'locked',
      isEnabled: !!dashboardState.companionSelected, // Enabled after companion selection
      order: 3
    }
  ];

  const handleSectionClick = (sectionId: string) => {
    const section = dashboardSections.find(s => s.id === sectionId);
    
    // Handle special cases
    if (sectionId === 'companion-chat') {
      setShowCompanionChat(true);
      return;
    }
    
    if (section?.isEnabled) {
      // If clicking "Today's Learning Journey" and both career and companion are selected,
      // go directly to CareerInc Lobby instead of showing the daily learning modal
      if (sectionId === 'daily-learning' && dashboardState.careerSelected && dashboardState.companionSelected) {
        handleDashboardComplete();
      } else {
        setActiveSubModal(sectionId);
      }
    }
  };

  const handleSubModalClose = (sectionId: string, result?: any) => {
    // Start transition
    setIsTransitioning(true);
    
    // Special handling for AI companion close without selection
    if (sectionId === 'ai-companion' && !result && dashboardState.careerSelected) {
      // If closing AI companion modal without selecting, go to Learn Bento
      // with career already selected
      console.log('🔄 Navigating to Learn Bento with career selected');
      setTimeout(() => {
        setActiveSubModal('daily-learning');
        setIsTransitioning(false);
      }, 150);
      return;
    }
    
    // Special handling for career selection - don't close if transitioning to companion
    if (sectionId === 'career-choice' && result && !dashboardState.companionSelected) {
      // Process the result but don't close the modal
      processSubModalResult(sectionId, result);
      // The processSubModalResult will handle the transition to companion selection
      return;
    }
    
    // Process the result first before clearing modal
    // This ensures state is updated while modal is still visible
    const processAndClear = () => {
      // Process the result immediately if there is one
      if (result) {
        processSubModalResult(sectionId, result);
      }
      
      // Always clear the modal after a brief delay for smooth transition
      setTimeout(() => {
        setActiveSubModal(null);
        setIsTransitioning(false);
      }, 150);
    };
    
    processAndClear();
  };
  
  const processSubModalResult = (sectionId: string, result: any) => {
    switch (sectionId) {
      case 'daily-learning':
          setDashboardState(prev => ({
            ...prev,
            dailyLearningComplete: true,
            progressToday: result.progress || 0
          }));
          // All steps complete - transition to Career, Inc. Lobby
          if (dashboardState.careerSelected && dashboardState.companionSelected) {
            handleDashboardComplete();
          }
          break;
        case 'ai-companion':
          console.log('🤖 Companion selected:', result);
          setDashboardState(prev => ({
            ...prev,
            companionSelected: result.companion
          }));
          // Set the companion for voiceover
          companionVoiceoverService.setCompanion(result.companionId || result.companion);
          // Play companion introduction
          companionVoiceoverService.playVoiceover('companion-selected', null, { delay: 500 });
          
          // Don't auto-complete here - let user see the BentoDashboard
          // The dashboard will show because both career and companion are now selected
          break;
        case 'career-choice':
          console.log('🎯 Career selected:', result);
          setDashboardState(prev => ({
            ...prev,
            careerSelected: result.career || result.name || result
          }));
          
          // If companion is not selected yet, directly transition to AI companion selection
          if (!dashboardState.companionSelected) {
            console.log('🔄 Transitioning directly to AI companion selection');
            setIsTransitioning(true);
            setTimeout(() => {
              setActiveSubModal('ai-companion');
              setIsTransitioning(false);
            }, 300); // Small delay for smooth transition
            return; // Don't close the modal, transition directly
          } else {
            // Play career selected message if companion is already chosen
            companionVoiceoverService.playVoiceover('career-selected', { career: result.career }, { delay: 500 });
          }
          break;
    }
  };

  const handleDashboardComplete = () => {
    console.log('🚀 Dashboard completing with state:', dashboardState);
    if (onComplete && dashboardState.companionSelected && dashboardState.careerSelected) {
      const selections = {
        companion: dashboardState.companionSelected,
        career: dashboardState.careerSelected
      };
      console.log('📤 Passing selections to parent:', selections);
      onComplete(selections);
    } else {
      console.warn('⚠️ Cannot complete dashboard - missing selections:', {
        hasCompanion: !!dashboardState.companionSelected,
        hasCareer: !!dashboardState.careerSelected,
        companion: dashboardState.companionSelected,
        career: dashboardState.careerSelected
      });
    }
  };

  const isReadyToStart = dashboardState.careerSelected && 
                         dashboardState.companionSelected && 
                         dashboardState.dailyLearningComplete;

  // ============================================================================
  // AI COMPANION SELECTION (Recreated from AICompanionModal)
  // ============================================================================
  
  interface Companion {
    id: string;
    name: string;
    avatar: string;
    personality: string;
    specialty: string;
    teachingStyle: string;
    color: string;
    traits: string[];
    quote: string;
    voiceStyle: string;
    sampleAudio?: string;
  }

  const companionsWithDetails: Companion[] = [
    {
      id: 'finn',
      name: 'Finn',
      avatar: '🤖',
      personality: 'Friendly & Encouraging',
      specialty: 'Step-by-step guidance',
      teachingStyle: 'Patient and supportive, breaks down complex topics into simple steps',
      color: '#8B5CF6',
      traits: ['Patient', 'Encouraging', 'Clear', 'Supportive'],
      quote: "Let's learn together, one step at a time!",
      voiceStyle: 'Warm and friendly',
      sampleAudio: '/audio/finn-sample.mp3'
    },
    {
      id: 'sage',
      name: 'Sage',
      avatar: '🦉',
      personality: 'Wise & Thoughtful',
      specialty: 'Deep understanding',
      teachingStyle: 'Asks thought-provoking questions to help you discover answers',
      color: '#10B981',
      traits: ['Wise', 'Insightful', 'Curious', 'Philosophical'],
      quote: "The journey of learning is as important as the destination.",
      voiceStyle: 'Calm and contemplative',
      sampleAudio: '/audio/sage-sample.mp3'
    },
    {
      id: 'spark',
      name: 'Spark',
      avatar: '⚡',
      personality: 'Creative & Energetic',
      specialty: 'Innovation & creativity',
      teachingStyle: 'Makes learning fun with games, challenges, and creative projects',
      color: '#F59E0B',
      traits: ['Energetic', 'Creative', 'Fun', 'Innovative'],
      quote: "Let's turn learning into an adventure!",
      voiceStyle: 'Enthusiastic and playful',
      sampleAudio: '/audio/spark-sample.mp3'
    },
    {
      id: 'harmony',
      name: 'Harmony',
      avatar: '🌸',
      personality: 'Calm & Supportive',
      specialty: 'Emotional wellness',
      teachingStyle: 'Creates a safe space for learning with mindfulness and encouragement',
      color: '#EC4899',
      traits: ['Gentle', 'Empathetic', 'Mindful', 'Nurturing'],
      quote: "Every mistake is a chance to grow stronger.",
      voiceStyle: 'Soothing and gentle',
      sampleAudio: '/audio/harmony-sample.mp3'
    }
  ];

  const handlePlayAudio = async (companionId: string, audioUrl?: string) => {
    await audioService.playCompanionVoice(
      companionId,
      audioUrl,
      () => setPlayingAudio(companionId),
      () => setPlayingAudio(null)
    );
  };

  const stopAudio = () => {
    audioService.stopAll();
    setPlayingAudio(null);
  };

  const handleCompanionConfirm = () => {
    if (selectedCompanionTemp) {
      const companion = companionsWithDetails.find(c => c.id === selectedCompanionTemp);
      handleSubModalClose('ai-companion', {
        companion: selectedCompanionTemp,
        companionId: selectedCompanionTemp,
        companionData: companion
      });
      setSelectedCompanionTemp(null); // Reset temp selection
    }
  };

  const renderAICompanionSelection = () => {
    console.log('🎨 Rendering AI Companion Selection Modal');
    const currentTheme = themeContext.theme || initialTheme;
    const colors = themeColors[currentTheme];
    
    return (
      <>
        {/* Modal Backdrop */}
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            backgroundColor: currentTheme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
            zIndex: 9998
          }}
        />
        
        <div 
          className={`ai-companion-modal theme-${currentTheme}`}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90vw',
            maxWidth: '1200px',
            height: '90vh',
            maxHeight: '800px',
            boxSizing: 'border-box',
            backgroundColor: colors.cardBg,
            borderRadius: '1rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Modal Header - Fixed at top */}
          <div className="modal-header" style={{
            padding: '1.5rem 2rem',
            borderBottom: `1px solid ${colors.border}`,
            backgroundColor: colors.cardBg,
            position: 'sticky',
            top: 0,
            zIndex: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0
          }}>
            <div>
              <h2 style={{ 
                color: colors.text, 
                margin: 0,
                fontSize: '1.5rem',
                fontWeight: 600
              }}>
                Choose Your AI Companion
              </h2>
              <p style={{ 
                color: colors.subtext, 
                margin: '0.5rem 0 0',
                fontSize: '0.875rem'
              }}>
                Select a learning companion to guide you through today's activities
              </p>
            </div>
          </div>

          {/* Scrollable Content Container */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden'
          }}>
            {/* Companion Grid - 4 Cards in a Row */}
            <div className="companions-grid" style={{
              padding: '2rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: '0.75rem',
              maxWidth: '1100px',
              margin: '0 auto'
            }}>
            {companionsWithDetails.map((companion, index) => (
              <div
                key={companion.id}
                className={`companion-card ${selectedCompanionTemp === companion.id ? 'selected' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={`Select ${companion.name} as your AI companion`}
                aria-pressed={selectedCompanionTemp === companion.id}
                style={{ 
                  backgroundColor: colors.cardBg,
                  border: `2px solid ${selectedCompanionTemp === companion.id ? companion.color : colors.border}`,
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  animationDelay: `${index * 0.1}s`,
                  position: 'relative',
                  width: '100%',
                  minHeight: '500px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onClick={() => setSelectedCompanionTemp(companion.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedCompanionTemp(companion.id);
                  }
                }}
                onMouseEnter={() => setHoveredCompanion(companion.id)}
                onMouseLeave={() => setHoveredCompanion(null)}
              >
                {/* Avatar & Name */}
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <div style={{ 
                    width: '70px',
                    height: '70px',
                    margin: '0 auto 0.75rem',
                    backgroundColor: companion.color + '20',
                    border: `2px solid ${companion.color}`,
                    borderRadius: '50%',
                    overflow: 'hidden'
                  }}>
                    <img 
                      src={getCompanionImageUrl(companion.id, 'default')} 
                      alt={companion.name}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }}
                    />
                  </div>
                  <h3 style={{ color: colors.text, margin: '0.25rem 0', fontSize: '1.1rem' }}>{companion.name}</h3>
                  <p style={{ color: companion.color, fontSize: '0.8rem', margin: 0 }}>
                    {companion.personality}
                  </p>
                </div>

                {/* Description */}
                <p style={{ 
                  color: colors.subtext, 
                  fontSize: '0.8rem', 
                  marginBottom: '0.75rem', 
                  lineHeight: '1.4',
                  textAlign: 'center',
                  minHeight: '3.5em'
                }}>
                  {companion.teachingStyle}
                </p>

                {/* Traits */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '0.3rem', 
                  marginBottom: '0.75rem',
                  justifyItems: 'center'
                }}>
                  {companion.traits.map((trait, i) => (
                    <span
                      key={i}
                      style={{
                        backgroundColor: companion.color + '15',
                        color: companion.color,
                        border: `1px solid ${companion.color}30`,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '1rem',
                        fontSize: '0.7rem',
                        textAlign: 'center',
                        width: 'fit-content'
                      }}
                    >
                      {trait}
                    </span>
                  ))}
                </div>

                {/* Quote */}
                <div style={{ 
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  padding: '0.5rem',
                  marginBottom: '0.75rem'
                }}>
                  <p style={{ 
                    color: colors.subtext, 
                    fontStyle: 'italic', 
                    fontSize: '1rem', 
                    margin: 0, 
                    lineHeight: '1.4', 
                    textAlign: 'center',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    <span style={{ color: companion.color, fontSize: '1.2rem', marginRight: '0.25rem' }}>"</span>
                    {companion.quote}
                  </p>
                </div>

                {/* Voice Style with Audio Preview */}
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{ color: colors.subtext, fontSize: '0.8rem', marginBottom: '1.2rem' }}>
                    <span>🎙️</span> {companion.voiceStyle}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (playingAudio === companion.id) {
                        stopAudio();
                      } else {
                        handlePlayAudio(companion.id, companion.sampleAudio);
                      }
                    }}
                    style={{
                      padding: '0.4rem 0.8rem',
                      backgroundColor: playingAudio === companion.id ? companion.color : 'transparent',
                      color: playingAudio === companion.id ? 'white' : companion.color,
                      border: `2px solid ${companion.color}`,
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      maxWidth: '160px',
                      margin: '0 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <span>{playingAudio === companion.id ? '⏸️' : '▶️'}</span>
                    <span>{playingAudio === companion.id ? 'Stop' : 'Hear Voice'}</span>
                  </button>
                </div>

                {/* Selection Indicator */}
                {selectedCompanionTemp === companion.id && (
                  <div style={{ 
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    backgroundColor: companion.color,
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    ✓ Selected
                  </div>
                )}
              </div>
            ))}
            </div>

            {/* Selection Info */}
            {selectedCompanionTemp && (
              <div style={{ 
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                width: 'calc(100% - 4rem)',
                maxWidth: '800px',
                margin: '1rem auto',
                padding: '1rem 2rem'
              }}>
                <p style={{ color: colors.text, margin: '0 0 0.5rem' }}>
                  Great choice! {companionsWithDetails.find(c => c.id === selectedCompanionTemp)?.name} will be your companion today.
                </p>
                <p style={{ color: colors.subtext, fontSize: '0.875rem', margin: 0 }}>
                  You can change your companion anytime from the settings menu.
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div style={{
            padding: '1.5rem 2rem',
            display: 'flex',
            justifyContent: 'center',
            borderTop: `1px solid ${colors.border}`,
            backgroundColor: colors.cardBg,
            flexShrink: 0
          }}>
            <button
              onClick={handleCompanionConfirm}
              disabled={!selectedCompanionTemp}
              style={{
                background: selectedCompanionTemp 
                  ? `linear-gradient(135deg, ${companionsWithDetails.find(c => c.id === selectedCompanionTemp)?.color} 0%, ${companionsWithDetails.find(c => c.id === selectedCompanionTemp)?.color}dd 100%)`
                  : colors.border,
                color: 'white',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: selectedCompanionTemp ? 'pointer' : 'not-allowed',
                opacity: selectedCompanionTemp ? 1 : 0.5,
                minWidth: '200px'
              }}
            >
              {selectedCompanionTemp 
                ? `Continue with ${companionsWithDetails.find(c => c.id === selectedCompanionTemp)?.name}` 
                : 'Select a Companion'}
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div 
      className={`${styles.dashboardModal} ${styles.fullPage} theme-${themeContext.theme || initialTheme}`}
    >
      {/* Particles Background */}
      <div className={styles.backgroundDecoration}
      >
        <ParticlesBackground 
          theme="learning" 
          particleCount={30}
          speed={0.5}
        />
      </div>

      {/* Main Dashboard View */}
      {!activeSubModal && (
        <div className={styles.contentWrapper}>
          {/* Dashboard Modal Header - Keep this for modal structure */}
          <header className={styles.dashboardHeader}>
            <div className="greeting-section">
              <h1 className="greeting">
                {getTimeBasedGreeting()}, {profile?.firstName || user?.full_name?.split(' ')[0] || user?.name || 'Learner'}! ✨
              </h1>
              <p className={styles.date}>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="header-actions">
              <div className={styles.streakBadge}>
                <span className="streak-icon">🔥</span>
                <span className={styles.streakNumber}>
                  {profile?.learningStreak || 0}
                </span>
                <span className={styles.streakLabel}>
                  Day Streak
                </span>
              </div>
              
              {/* Theme Toggle - Only available in Dashboard */}
              <button
                className={styles.themeToggleBtn}
                onClick={() => {
                  const newTheme = themeContext.theme === 'dark' ? 'light' : 'dark';
                  themeService.setTheme(newTheme, 'DashboardModal');
                }}
                title={`Switch to ${themeContext.theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {themeContext.theme === 'dark' ? '☀️' : '🌙'}
              </button>
              
              {/* Settings Button */}
              <button
                className={styles.settingsBtn}
                onClick={() => setShowSettings(true)}
                title="Settings"
              >
                ⚙️
              </button>
              
              {/* Logout Button */}
              <button
                className={styles.logoutBtn}
                onClick={async () => {
                  if (window.confirm('Are you sure you want to logout?')) {
                    try {
                      // Navigate to appropriate page based on user type
                      const isDemoUser = user?.email && [
                        'alex.davis@sandview.plainviewisd.edu',
                        'sam.brown@sandview.plainviewisd.edu',
                        'jordan.smith@oceanview.plainviewisd.edu',
                        'taylor.johnson@cityview.plainviewisd.edu'
                      ].includes(user.email.toLowerCase());
                      
                      const redirectPath = isDemoUser ? '/demo' : '/';
                      
                      // Clear local storage
                      localStorage.removeItem(`pathfinity-intro-${user?.id}`);
                      
                      // Navigate first, then sign out
                      window.location.href = redirectPath;
                    } catch (error) {
                      console.error('Logout error:', error);
                      // Fallback logout
                      window.location.href = '/';
                    }
                  }
                }}
              >
                🚪 Logout
              </button>
            </div>
          </header>

          {/* Bento Dashboard - Only show after selections are made */}
          {(dashboardState.careerSelected && dashboardState.companionSelected) ? (
            <BentoDashboard
              profile={{
                ...profile,
                selectedCareer: dashboardState.careerSelected,
                selectedCompanion: dashboardState.companionSelected,
                nextSkill: 'Math Foundations',
                learningStreak: profile?.learningStreak || 0,
                classRank: 5,
                classSize: 30
              }}
              userId={user?.id}
              gradeLevel={profile?.grade_level || 'K'}
              onStartLearning={() => handleSectionClick('daily-learning')}
              onSelectCareer={() => handleSectionClick('career-choice')}
              onSelectCompanion={() => handleSectionClick('ai-companion')}
              onCompanionChat={() => handleSectionClick('companion-chat')}
              theme={themeContext.theme || initialTheme}
            />
          ) : null}

          {/* Start Learning Button - Keep for completed state */}
          {isReadyToStart && (
            <div className={styles.footerActions}>
              <button 
                className={`${styles.startLearningBtn} ${styles.pulse}`}
                onClick={handleDashboardComplete}
              >
                🚀 Enter Career, Inc. Lobby
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sub-Modals */}
      {activeSubModal === 'daily-learning' && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            opacity: isTransitioning ? 0 : 1,
            transition: 'opacity 150ms ease-in-out'
          }}
        >
          <DailyLearningModal
            theme={themeContext.theme || initialTheme}
            onClose={(result) => handleSubModalClose('daily-learning', result)}
          />
        </div>
      )}

      {/* Use new AI Companion selection render function */}
      {activeSubModal === 'ai-companion' && renderAICompanionSelection()}

      {activeSubModal === 'career-choice' && (
        <div 
          className={styles.subModalOverlay}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            opacity: isTransitioning ? 0 : 1,
            transition: 'opacity 150ms ease-in-out'
          }}
        >
          <CareerChoiceModalV2
            theme={themeContext.theme || initialTheme}
            onClose={(result) => handleSubModalClose('career-choice', result)}
            user={user}
            profile={profile}
          />
        </div>
      )}
      
      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
      
      {/* Companion Chat Modal */}
      {showCompanionChat && dashboardState.companionSelected && (
        <CompanionChatModal
          companion={dashboardState.companionSelected}
          companionData={companions?.find((c: any) => c.id === dashboardState.companionSelected)}
          theme={themeContext.theme || initialTheme}
          onClose={() => setShowCompanionChat(false)}
          userId={user?.id}
          userName={profile?.display_name || profile?.first_name || user?.email?.split('@')[0]}
        />
      )}
      </div>
  );
};

// Helper function for time-based greeting
function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}