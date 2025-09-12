/**
 * CompanionTile Component
 * Displays AI companion with personality-based messages and reactions
 * Supports all 4 companions: Finn, Sage, Spark, Harmony
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../hooks/useTheme';
import styles from './CompanionTile.module.css';

export interface CompanionTileProps {
  companion: {
    id: 'finn' | 'sage' | 'spark' | 'harmony';
    name: string;
    personality: string;
  };
  message: string;
  emotion?: 'happy' | 'thinking' | 'celebrating' | 'encouraging' | 'curious' | 'proud';
  size?: 'small' | 'medium' | 'large';
  position?: 'float' | 'inline' | 'corner';
  showBubble?: boolean;
  animate?: boolean;
  onMessageComplete?: () => void;
}

export const CompanionTile: React.FC<CompanionTileProps> = ({
  companion,
  message,
  emotion = 'happy',
  size = 'medium',
  position = 'inline',
  showBubble = true,
  animate = true,
  onMessageComplete
}) => {
  const { theme } = useTheme();
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Get companion image path
  const getCompanionImage = () => {
    const themeVariant = theme === 'dark' ? 'dark' : 'light';
    return `/images/companions/${companion.id}-${themeVariant}.png`;
  };
  
  // Get companion-specific styles
  const getCompanionStyles = () => {
    const baseClass = styles.companionTile;
    const sizeClass = styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`];
    const positionClass = styles[`position${position.charAt(0).toUpperCase() + position.slice(1)}`];
    const emotionClass = styles[`emotion${emotion.charAt(0).toUpperCase() + emotion.slice(1)}`];
    const companionClass = styles[`companion${companion.id.charAt(0).toUpperCase() + companion.id.slice(1)}`];
    
    return `${baseClass} ${sizeClass} ${positionClass} ${emotionClass} ${companionClass}`;
  };
  
  // Typewriter effect for messages
  useEffect(() => {
    if (!message || !showBubble) {
      setDisplayedMessage('');
      return;
    }
    
    setIsTyping(true);
    setDisplayedMessage('');
    
    let currentIndex = 0;
    const typeSpeed = companion.personality.includes('energetic') ? 30 : 
                      companion.personality.includes('thoughtful') ? 60 : 45;
    
    const typeInterval = setInterval(() => {
      if (currentIndex < message.length) {
        setDisplayedMessage(prev => prev + message[currentIndex]);
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
        if (onMessageComplete) {
          onMessageComplete();
        }
      }
    }, typeSpeed);
    
    return () => clearInterval(typeInterval);
  }, [message, showBubble, companion.personality]);
  
  // Get personality-based animation class
  const getAnimationClass = () => {
    if (!animate) return '';
    
    switch (companion.id) {
      case 'finn':
        return styles.animateBounce; // Playful bouncing
      case 'sage':
        return styles.animateFloat; // Gentle floating
      case 'spark':
        return styles.animatePulse; // Energetic pulsing
      case 'harmony':
        return styles.animateSway; // Calm swaying
      default:
        return styles.animateFloat;
    }
  };
  
  // Get emotion-based bubble style
  const getBubbleStyle = () => {
    const baseClass = styles.speechBubble;
    const emotionBubbleClass = styles[`bubble${emotion.charAt(0).toUpperCase() + emotion.slice(1)}`];
    
    return `${baseClass} ${emotionBubbleClass}`;
  };
  
  return (
    <div className={getCompanionStyles()}>
      <div className={`${styles.companionAvatar} ${getAnimationClass()}`}>
        <img 
          src={getCompanionImage()}
          alt={companion.name}
          className={styles.companionImage}
        />
        {emotion && (
          <div className={styles.emotionIndicator}>
            {getEmotionEmoji(emotion)}
          </div>
        )}
      </div>
      
      {showBubble && message && (
        <div className={getBubbleStyle()}>
          <div className={styles.bubbleContent}>
            {displayedMessage}
            {isTyping && <span className={styles.typingCursor}>|</span>}
          </div>
          <div className={styles.bubbleTail} />
        </div>
      )}
    </div>
  );
};

// Helper function to get emotion emoji
const getEmotionEmoji = (emotion: string): string => {
  const emotions: Record<string, string> = {
    happy: '😊',
    thinking: '🤔',
    celebrating: '🎉',
    encouraging: '💪',
    curious: '🔍',
    proud: '🌟'
  };
  return emotions[emotion] || '😊';
};

// Companion personality helpers
export const getCompanionGreeting = (companionId: string, studentName: string): string => {
  switch (companionId) {
    case 'finn':
      return `Hey ${studentName}! Ready for an awesome adventure?`;
    case 'sage':
      return `Greetings, ${studentName}. Let us begin our journey of discovery.`;
    case 'spark':
      return `WOW ${studentName}! This is going to be AMAZING!`;
    case 'harmony':
      return `Welcome, dear ${studentName}. I'm so happy you're here.`;
    default:
      return `Hello ${studentName}! Let's learn together!`;
  }
};

export const getCompanionHint = (companionId: string, hint: string): string => {
  switch (companionId) {
    case 'finn':
      return `Psst! ${hint}`;
    case 'sage':
      return `Consider this: ${hint}`;
    case 'spark':
      return `Ooh! What if... ${hint}`;
    case 'harmony':
      return `Gently now... ${hint}`;
    default:
      return hint;
  }
};

export const getCompanionCelebration = (companionId: string): string => {
  switch (companionId) {
    case 'finn':
      return "Awesome job! That was super fun!";
    case 'sage':
      return "Excellent work. You've shown great understanding.";
    case 'spark':
      return "WOW! Your energy was INCREDIBLE!";
    case 'harmony':
      return "Beautiful work! You did that with such grace.";
    default:
      return "Great job!";
  }
};

export const getCompanionEncouragement = (companionId: string): string => {
  switch (companionId) {
    case 'finn':
      return "No worries! Let's try again - it'll be fun!";
    case 'sage':
      return "That's alright. Every mistake is a learning opportunity.";
    case 'spark':
      return "Whoa! Nice try! Let's go again with MORE energy!";
    case 'harmony':
      return "It's okay, dear friend. Take a breath and try once more.";
    default:
      return "That's okay! Let's try again!";
  }
};