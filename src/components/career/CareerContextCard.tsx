/**
 * CareerContextCard Component
 * Displays career-contextualized introduction for each subject
 * Shows once per subject/career combination with AI companion narration
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../hooks/useTheme';
import '../../styles/containers/LearnContainer.css';
import '../../styles/containers/ExperienceContainer.css';
import '../../styles/containers/DiscoverContainer.css';

interface CareerContextCardProps {
  // Content from AI
  title: string;
  greeting: string;
  concept: string;
  careerIntroduction?: string; // For Experience container
  explorationTheme?: string;   // For Discover container
  
  // Context
  studentName: string;
  careerName: string;
  gradeLevel: string;
  subject: string;
  containerType: 'learn' | 'experience' | 'discover';
  
  // Avatar
  avatarUrl?: string;
  companionName?: string;
  
  // Actions
  onStart: () => void;
  onSkip?: () => void;
  
  // Audio (future integration)
  audioUrl?: string;
  autoPlayAudio?: boolean;
}

export const CareerContextCard: React.FC<CareerContextCardProps> = ({
  title,
  greeting,
  concept,
  careerIntroduction,
  explorationTheme,
  studentName,
  careerName,
  gradeLevel,
  subject,
  containerType,
  avatarUrl,
  companionName = 'Sage',
  onStart,
  onSkip,
  audioUrl,
  autoPlayAudio = true
}) => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Determine grade category for age-appropriate styling
  const getGradeCategory = (grade: string): 'elementary' | 'middle' | 'high' => {
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);
    if (gradeNum <= 5) return 'elementary';
    if (gradeNum <= 8) return 'middle';
    return 'high';
  };
  
  const gradeCategory = getGradeCategory(gradeLevel);
  
  // Get career workspace name
  const getWorkspace = (career: string): string => {
    const workspaces: Record<string, string> = {
      'Chef': 'kitchen',
      'Artist': 'studio',
      'Doctor': 'clinic',
      'Engineer': 'workshop',
      'Scientist': 'laboratory',
      'Teacher': 'classroom',
      'Musician': 'studio',
      'Athlete': 'training center',
      'Writer': 'office',
      'Designer': 'studio'
    };
    return workspaces[career] || 'workspace';
  };
  
  // Check if this card has been shown before
  useEffect(() => {
    const sessionKey = `career_context_${subject}_${careerName}_${containerType}`;
    const hasShown = sessionStorage.getItem(sessionKey);
    
    console.log('🎯 CareerContextCard visibility check:', {
      sessionKey,
      hasShown: !!hasShown,
      subject,
      careerName,
      containerType,
      isVisible
    });
    
    // Temporarily disable auto-hide for debugging
    // TODO: Re-enable after fixing
    /*
    if (hasShown) {
      setHasBeenShown(true);
      setIsVisible(false);
    } else {
      sessionStorage.setItem(sessionKey, 'shown');
    }
    */
  }, [subject, careerName, containerType]);
  
  // Auto-play audio if available
  useEffect(() => {
    if (audioUrl && autoPlayAudio && isVisible && !hasBeenShown) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.log('Audio autoplay blocked:', err));
      
      audioRef.current.onended = () => setIsPlaying(false);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl, autoPlayAudio, isVisible, hasBeenShown]);
  
  const handleStart = () => {
    setIsVisible(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onStart();
  };
  
  const handleSkip = () => {
    setIsVisible(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (onSkip) {
      onSkip();
    } else {
      onStart();
    }
  };
  
  console.log('🔍 CareerContextCard render check:', {
    isVisible,
    hasBeenShown,
    willRender: isVisible
  });
  
  if (!isVisible) {
    console.log('❌ CareerContextCard returning null - not visible');
    return null;
  }
  
  // Get the main content based on container type
  const getMainContent = () => {
    switch (containerType) {
      case 'experience':
        return careerIntroduction || concept;
      case 'discover':
        return explorationTheme || concept;
      default:
        return concept;
    }
  };
  
  console.log('✅ CareerContextCard IS RENDERING with classes:', {
    overlayClass: `career-context-overlay ${theme}`,
    cardClass: `career-context-card ai-${containerType}-container grade-${gradeCategory}`,
    containerType,
    theme,
    title,
    greeting,
    careerName,
    gradeLevel
  });

  // Simplified clean design matching the PDF
  const isDarkTheme = theme === 'dark';
  const bgColor = isDarkTheme ? '#1f2937' : 'white';
  const textColor = isDarkTheme ? '#f9fafb' : '#111827';
  const subtextColor = isDarkTheme ? '#d1d5db' : '#6b7280';
  const borderColor = isDarkTheme ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)';
  
  // Get career emoji based on the career name
  const getCareerEmoji = (career: string): string => {
    const careerEmojis: Record<string, string> = {
      'Chef': '👨‍🍳',
      'Artist': '🎨',
      'Doctor': '👨‍⚕️',
      'Engineer': '👷',
      'Scientist': '🔬',
      'Teacher': '👨‍🏫',
      'Musician': '🎵',
      'Athlete': '⚽',
      'Writer': '✍️',
      'Designer': '🎨',
      'Explorer': '🧭'
    };
    return careerEmojis[career] || '💼';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        background: bgColor,
        padding: '40px',
        borderRadius: '24px',
        maxWidth: '720px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: `1px solid ${borderColor}`,
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ 
            color: textColor, 
            fontSize: '28px',
            fontWeight: '600',
            marginBottom: '16px'
          }}>
            {title || 'Welcome to Your Learning Journey'}
          </h1>
          
          {/* Career Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <span>{getCareerEmoji(careerName)}</span>
            <span>Professional</span>
          </div>
        </div>
        
        {/* Avatar and Greeting Section */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            border: '4px solid white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={companionName}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <span style={{ fontSize: '50px' }}>🎓</span>
            )}
          </div>
          <p style={{ 
            color: textColor, 
            fontWeight: '500',
            fontSize: '16px',
            marginBottom: '8px'
          }}>
            {companionName}
          </p>
        </div>
        
        {/* Welcome Message */}
        <div style={{
          background: isDarkTheme ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <p style={{ 
            color: textColor, 
            fontSize: '16px',
            lineHeight: '1.6',
            margin: 0
          }}>
            {greeting ? greeting.replace('${studentName}', studentName) : 
             `Welcome, ${careerName} ${studentName}!`}
          </p>
        </div>
        
        {/* Career Context */}
        <div style={{
          background: isDarkTheme ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <p style={{ 
            color: textColor,
            fontSize: '15px',
            lineHeight: '1.6',
            margin: 0
          }}>
            {concept || "Today we'll explore new skills together!"}
          </p>
        </div>
        
        {/* Skills Preview */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          marginBottom: '32px'
        }}>
          <div style={{
            background: isDarkTheme ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
            padding: '12px 20px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '20px' }}>🔢</span>
            <span style={{ color: textColor, fontWeight: '500', fontSize: '14px' }}>Count</span>
          </div>
          <div style={{
            background: isDarkTheme ? 'rgba(236, 72, 153, 0.2)' : 'rgba(236, 72, 153, 0.1)',
            padding: '12px 20px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '20px' }}>📊</span>
            <span style={{ color: textColor, fontWeight: '500', fontSize: '14px' }}>Measure</span>
          </div>
          <div style={{
            background: isDarkTheme ? 'rgba(251, 146, 60, 0.2)' : 'rgba(251, 146, 60, 0.1)',
            padding: '12px 20px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '20px' }}>🧮</span>
            <span style={{ color: textColor, fontWeight: '500', fontSize: '14px' }}>Calculate</span>
          </div>
        </div>
        
        {/* Start Button */}
        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={handleStart}
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 32px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
              transform: 'translateY(0)',
              transition: 'all 0.2s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(139, 92, 246, 0.3)';
            }}
          >
            Let's Start! 
            <span style={{ fontSize: '18px' }}>🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
};