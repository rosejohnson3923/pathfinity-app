/**
 * Learning Adaptation Listener
 * Listens for adaptation events and provides visual feedback
 */

import React, { useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import './LearningAdaptationListener.css';

interface AdaptationEvent {
  type: string;
  data: any;
  timestamp: string;
}

interface LearningAdaptationListenerProps {
  hideVisualFeedback?: boolean;
}

export const LearningAdaptationListener: React.FC<LearningAdaptationListenerProps> = ({ 
  hideVisualFeedback = false 
}) => {
  const theme = useTheme();
  const [currentAdaptation, setCurrentAdaptation] = useState<AdaptationEvent | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const handleAdaptation = (event: CustomEvent<AdaptationEvent>) => {
      console.log('🎯 Adaptation received:', event.detail);
      
      // Always handle struggle detection
      if (event.detail.type === 'struggling') {
        // Trigger additional support for struggling students
        console.log('⚠️ Student struggling detected:', event.detail);
        // This could trigger additional AI companion support
        // or notify the practice support service
        
        // Dispatch a custom event that the AI companion can listen to
        window.dispatchEvent(new CustomEvent('student-struggling', {
          detail: event.detail.data
        }));
      }
      
      // Only show visual feedback if not hidden
      if (!hideVisualFeedback) {
        setCurrentAdaptation(event.detail);
        setShowFeedback(true);

        // Auto-hide after delay
        setTimeout(() => {
          setShowFeedback(false);
        }, 5000);
      }
    };

    window.addEventListener('learning-adaptation', handleAdaptation as EventListener);
    return () => {
      window.removeEventListener('learning-adaptation', handleAdaptation as EventListener);
    };
  }, [hideVisualFeedback]);

  // Don't render visual feedback if hidden
  if (hideVisualFeedback || !showFeedback || !currentAdaptation) return null;

  const getFeedbackContent = () => {
    switch (currentAdaptation.type) {
      case 'streak_3':
        return {
          icon: '🎉',
          message: 'Great job! 3 in a row!',
          color: '#10B981',
          animation: 'bounce'
        };
      
      case 'streak_5':
        return {
          icon: '🌟',
          message: 'Amazing! 5 correct answers!',
          color: '#8B5CF6',
          animation: 'pulse'
        };
      
      case 'streak_10':
        return {
          icon: '🔥',
          message: "Incredible! You're on fire!",
          color: '#F59E0B',
          animation: 'shake'
        };
      
      case 'struggling':
        return {
          icon: '💪',
          message: "Keep trying! You've got this!",
          color: '#3B82F6',
          animation: 'slide'
        };
      
      case 'fast_pace':
        // Don't show fast pace message - it's distracting during practice
        return null;
      
      case 'slow_pace':
        // Don't show slow pace message - it's distracting during practice
        return null;
      
      case 'high_hint_usage':
        return {
          icon: '💡',
          message: "Hints are helpful! Keep learning!",
          color: '#84CC16',
          animation: 'glow'
        };
      
      default:
        return {
          icon: '✨',
          message: currentAdaptation.data?.message || 'Keep up the great work!',
          color: '#6366F1',
          animation: 'fade'
        };
    }
  };

  const feedback = getFeedbackContent();
  
  // Don't render if feedback is null (e.g., for slow_pace)
  if (!feedback) return null;

  return (
    <div 
      className={`adaptation-feedback ${feedback.animation} ${showFeedback ? 'show' : ''}`}
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
        borderRadius: '12px',
        padding: '16px 24px',
        boxShadow: theme === 'dark' 
          ? '0 10px 30px rgba(0, 0, 0, 0.5)' 
          : '0 10px 30px rgba(0, 0, 0, 0.15)',
        border: `3px solid ${feedback.color}`,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 10000,
        maxWidth: '300px',
        animation: `${feedback.animation} 0.5s ease-out`
      }}
    >
      <span style={{ fontSize: '2rem' }}>{feedback.icon}</span>
      <div>
        <p style={{ 
          margin: 0,
          fontSize: '1rem',
          fontWeight: '600',
          color: theme === 'dark' ? '#f3f4f6' : '#1F2937'
        }}>
          {feedback.message}
        </p>
        {currentAdaptation.data?.skill && (
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '0.85rem',
            color: theme === 'dark' ? '#9ca3af' : '#6B7280'
          }}>
            {currentAdaptation.data.skill}
          </p>
        )}
      </div>
    </div>
  );
};