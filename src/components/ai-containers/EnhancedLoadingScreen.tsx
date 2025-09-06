/**
 * Enhanced Loading Screen Component
 * Provides detailed feedback during AI content generation
 */

import React, { useEffect, useState } from 'react';
import { TwoPanelModal } from '../modals/TwoPanelModal';
import { useAuth } from '../../hooks/useAuth';
import { useStudentProfile } from '../../hooks/useStudentProfile';
import styles from '../../styles/shared/screens/LoadingScreen.module.css';

interface EnhancedLoadingScreenProps {
  phase: 'practice' | 'instruction' | 'assessment' | 'complete';
  skillName: string;
  studentName: string;
  customMessage?: string;
  containerType?: 'learn' | 'experience' | 'discover';
  currentCareer?: string;
  showGamification?: boolean;
}

export const EnhancedLoadingScreen: React.FC<EnhancedLoadingScreenProps> = ({
  phase,
  skillName,
  studentName,
  customMessage,
  containerType = 'learn',
  currentCareer,
  showGamification = true
}) => {
  const { user } = useAuth();
  const { profile } = useStudentProfile();
  const [dots, setDots] = useState('');
  const [currentTip, setCurrentTip] = useState(0);
  const [progress, setProgress] = useState(0);
  
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
    const duration = phase === 'practice' ? 5000 : 3000; // Practice takes longer
    const increment = 100 / (duration / 100);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment;
        return next >= 95 ? 95 : next; // Cap at 95% until actually complete
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [phase]);
  
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
        {/* Phase indicator badge */}
        <div className={`${styles.phaseMessage} ${styles[phase]}`}>
          {phase === 'practice' ? 'Practice' : 
           phase === 'instruction' ? 'Lesson' :
           phase === 'assessment' ? 'Assessment' : 'Complete'}
        </div>
        
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