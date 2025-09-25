/**
 * Enhanced Loading Screen Component
 * Provides detailed feedback during AI content generation
 */

import React, { useEffect, useState, useRef } from 'react';
import { TwoPanelModal } from '../modals/TwoPanelModal';
import { useAuth } from '../../hooks/useAuth';
import { useStudentProfile } from '../../hooks/useStudentProfile';
import { MasterNarrative } from '../../services/narrative/MasterNarrativeGenerator';
import { loadingNarrationService } from '../../services/LoadingNarrationService';
import { azureAudioService } from '../../services/azureAudioService';
import styles from '../../styles/shared/screens/LoadingScreen.module.css';

interface EnhancedLoadingScreenProps {
  phase: 'practice' | 'instruction' | 'assessment' | 'complete';
  skillName: string;
  studentName: string;
  customMessage?: string;
  containerType?: 'learn' | 'experience' | 'discover';
  currentCareer?: string;
  showGamification?: boolean;
  // New props for narration
  masterNarrative?: MasterNarrative | null;
  currentSubject?: 'math' | 'ela' | 'science' | 'socialStudies';
  companionId?: string;
  enableNarration?: boolean;
  isFirstLoad?: boolean;
}

export const EnhancedLoadingScreen: React.FC<EnhancedLoadingScreenProps> = ({
  phase,
  skillName,
  studentName,
  customMessage,
  containerType = 'learn',
  currentCareer,
  showGamification = true,
  masterNarrative,
  currentSubject = 'math',
  companionId = sessionStorage.getItem('selectedCompanion') || 'pat',
  enableNarration = true,
  isFirstLoad = false
}) => {
  console.log('🔊 EnhancedLoadingScreen RENDERED:', {
    phase,
    hasMasterNarrative: !!masterNarrative,
    enableNarration,
    isFirstLoad,
    currentSubject,
    containerType
  });
  const { user } = useAuth();
  const { profile } = useStudentProfile();
  const [dots, setDots] = useState('');
  const [currentTip, setCurrentTip] = useState(0);
  const [progress, setProgress] = useState(0);
  const narrationRef = useRef<string | null>(null);
  const selectedNarrationRef = useRef<any>(null);
  
  // Loading tips to show while generating content
  const loadingTips = [
    `Preparing ${skillName} questions just for you, ${studentName}!`,
    'Customizing difficulty to match your level...',
    'Adding fun career connections...',
    'Making learning engaging and interactive...',
    'Almost ready to start your journey!'
  ];
  
  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);
  
  // Rotate tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % loadingTips.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [loadingTips.length]);
  
  // Simulate progress
  useEffect(() => {
    const duration = 3000; // Unified 3-second minimum for all phases
    const increment = 100 / (duration / 100);

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment;
        return next >= 95 ? 95 : next; // Cap at 95% until actually complete
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [phase]);

  // Narration effect - play fun facts during loading
  useEffect(() => {
    // Skip if narration is disabled
    if (!enableNarration) {
      return;
    }

    // Skip if no master narrative or fun facts
    if (!masterNarrative?.subjectContextsAlignedFacts) {
      console.log('⚠️ EnhancedLoadingScreen: No fun facts available');
      return;
    }

    // Create a unique key for this narration attempt
    const narrationKey = `${phase}-${currentSubject}-${isFirstLoad}`;

    // Check if we already started playing for this specific combination
    if (narrationRef.current === narrationKey) {
      return; // Already playing this narration
    }

    // IMMEDIATELY mark as attempting to play this narration to prevent double execution
    narrationRef.current = narrationKey;

    console.log('🔊 EnhancedLoadingScreen: Starting narration process', {
      narrationKey,
      hasMasterNarrative: !!masterNarrative,
      hasFunFacts: !!masterNarrative?.subjectContextsAlignedFacts,
      phase,
      currentSubject,
      isFirstLoad
    });

    // Capture values at effect execution time to avoid stale closures
    const capturedMasterNarrative = masterNarrative;
    const capturedContainerType = containerType;
    const capturedStudentName = studentName;
    const capturedCompanionId = companionId;

    // Use a flag to track if we should still play when timer fires
    let shouldPlay = true;

    // Select and play narration
    const playNarration = async () => {
      if (!shouldPlay) {
        console.log('🔊 EnhancedLoadingScreen: Narration cancelled before playback');
        return;
      }

      // Check if audio is already playing
      if (azureAudioService.speaking) {
        console.log('🔊 EnhancedLoadingScreen: Audio already playing, skipping narration');
        return;
      }

      try {
        let narration;

        // Check if we already selected a narration for this key
        if (selectedNarrationRef.current && selectedNarrationRef.current.key === narrationKey) {
          console.log('🎵 EnhancedLoadingScreen: Using cached narration');
          narration = selectedNarrationRef.current.narration;
        } else {
          console.log('🎵 EnhancedLoadingScreen: Selecting new narration', {
            currentSubject,
            containerType: capturedContainerType,
            phase,
            isFirstLoad
          });

          // Get appropriate narration based on context
          narration = loadingNarrationService.selectNarration(
            capturedMasterNarrative,
            capturedContainerType,
            currentSubject,
            phase === 'instruction' ? 'instruction' : phase === 'assessment' ? 'assessment' : 'practice',
            isFirstLoad,
            capturedStudentName
          );

          // Cache the selected narration
          selectedNarrationRef.current = {
            key: narrationKey,
            narration: narration
          };
        }

        if (narration) {
          console.log('🎵 Loading Screen: Playing narration', {
            container: capturedContainerType,
            subject: currentSubject,
            phase,
            scriptId: narration.scriptId,
            text: narration.text.substring(0, 50) + '...'
          });

          // Play the narration with Azure TTS
          await azureAudioService.playText(
            narration.text,
            capturedCompanionId,
            {
              scriptId: narration.scriptId,
              variables: narration.variables,
              onStart: () => {
                console.log('🔊 Loading narration started');
              },
              onEnd: () => {
                console.log('🔊 Loading narration completed');
              }
            }
          );
        } else {
          console.log('⚠️ No narration content selected');
        }
      } catch (error) {
        console.error('Error playing loading narration:', error);
      }
    };

    // Play narration immediately since component is already mounted
    playNarration();

    return () => {
      shouldPlay = false;
    };
  }, [phase, currentSubject, isFirstLoad]); // Only re-run when these key values change

  const getPhaseMessage = () => {
    switch (phase) {
      case 'practice':
        return 'Creating diagnostic questions';
      case 'instruction':
        return 'Preparing your lesson';
      case 'assessment':
        return 'Generating assessment';
      default:
        return 'Loading your learning journey';
    }
  };
  
  // Build container class based on type
  // Only use full-screen loadingScreen class when NOT in TwoPanelModal
  const containerClass = showGamification 
    ? `${styles.loadingContent} ${styles[`${containerType}Container`] || ''}`
    : `${styles.loadingScreen} ${styles[`${containerType}Container`] || ''}`;
  
  // Loading screen content
  const loadingContent = (
    <div className={containerClass}>
      <div className={styles.loadingContainer}>
        {/* Animated Logo/Icon */}
        <div className={styles.loadingIconContainer}>
          <div className={styles.loadingIcon}>
            <span className={styles.iconEmoji}>🎓</span>
          </div>
          <div className={styles.loadingRings}>
            <div className={`${styles.ring} ${styles.ring1}`}></div>
            <div className={`${styles.ring} ${styles.ring2}`}></div>
            <div className={`${styles.ring} ${styles.ring3}`}></div>
          </div>
        </div>
        
        {/* Main Loading Message */}
        <h2 className={styles.loadingTitle}>
          {customMessage || getPhaseMessage()}
          <span className={styles.dots}>{dots}</span>
        </h2>
        
        {/* Progress Bar */}
        <div className={styles.loadingProgressContainer}>
          <div className={styles.loadingProgressBar}>
            <div 
              className={styles.loadingProgressFill}
              style={{ '--progress': progress } as React.CSSProperties}
            >
              <div className={styles.loadingProgressGlow}></div>
            </div>
          </div>
          <span className={styles.loadingProgressText}>{Math.round(progress)}%</span>
        </div>
        
        {/* Rotating Tips */}
        <div className={styles.loadingTip}>
          <p>{loadingTips[currentTip]}</p>
        </div>
        
        {/* Quick Facts While Waiting */}
        <div className={styles.loadingFacts}>
          <div className={styles.factCard}>
            <span className={styles.factIcon}>✨</span>
            <span className={styles.factText}>AI-Powered</span>
          </div>
          <div className={styles.factCard}>
            <span className={styles.factIcon}>🎯</span>
            <span className={styles.factText}>Personalized</span>
          </div>
          <div className={styles.factCard}>
            <span className={styles.factIcon}>🚀</span>
            <span className={styles.factText}>Adaptive</span>
          </div>
        </div>
      </div>
    </div>
  );

  // If gamification is enabled and we have 22+ seconds of load time, show TwoPanelModal
  if (showGamification) {
    return (
      <TwoPanelModal
        showGamification={true}
        sidebarPosition="right"
        currentSkill={skillName}
        currentCareer={currentCareer || "Exploring"}
        userId={user?.id || 'default'}
        gradeLevel={profile?.grade_level || (user as any)?.grade_level || 'K'}
        modalTitle={`Loading ${containerType === 'learn' ? 'Learn' : containerType === 'experience' ? 'Experience' : 'Discover'} Container`}
      >
        {loadingContent}
      </TwoPanelModal>
    );
  }

  // Otherwise just show the loading content
  return loadingContent;
};

export default EnhancedLoadingScreen;