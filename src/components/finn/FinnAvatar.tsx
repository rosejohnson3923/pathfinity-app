/**
 * FINN AVATAR COMPONENT
 * Adaptive AI learning companion that responds to student emotional state
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface FinnAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  mood?: 'excited' | 'focused' | 'tired' | 'frustrated' | 'neutral' | 'confident';
  animation?: 'idle' | 'talking' | 'thinking' | 'celebrating';
  className?: string;
}

export const FinnAvatar: React.FC<FinnAvatarProps> = ({
  size = 'md',
  mood = 'neutral',
  animation = 'idle',
  className
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'excited': return '#FFD700'; // Gold
      case 'focused': return '#6366F1'; // Indigo
      case 'tired': return '#9CA3AF'; // Gray
      case 'frustrated': return '#EF4444'; // Red
      case 'confident': return '#10B981'; // Green
      default: return '#8B5CF6'; // Purple
    }
  };

  const getAnimationClass = (animation: string) => {
    switch (animation) {
      case 'talking': return 'animate-pulse';
      case 'thinking': return 'animate-bounce';
      case 'celebrating': return 'animate-spin';
      default: return '';
    }
  };

  return (
    <div className={cn(
      'rounded-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg',
      sizeClasses[size],
      getAnimationClass(animation),
      className
    )}>
      {/* Simple Finn Owl SVG */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-2/3 h-2/3"
      >
        {/* Owl Body */}
        <circle cx="12" cy="14" r="8" fill="white" opacity="0.9" />
        
        {/* Eyes */}
        <circle cx="9" cy="11" r="2" fill={getMoodColor(mood)} />
        <circle cx="15" cy="11" r="2" fill={getMoodColor(mood)} />
        
        {/* Gaming Controller Eyes (Pathfinity signature) */}
        <rect x="8.5" y="10.5" width="1" height="1" fill="white" rx="0.2" />
        <rect x="14.5" y="10.5" width="1" height="1" fill="white" rx="0.2" />
        
        {/* Beak */}
        <path d="M12 13 L10.5 15 L13.5 15 Z" fill="#F59E0B" />
        
        {/* Expression based on mood */}
        {mood === 'excited' && (
          <path d="M9 16 Q12 19 15 16" stroke="#F59E0B" strokeWidth="1" fill="none" />
        )}
        {mood === 'frustrated' && (
          <path d="M9 17 Q12 15 15 17" stroke="#EF4444" strokeWidth="1" fill="none" />
        )}
        {mood === 'tired' && (
          <>
            <path d="M8 10 L10 11" stroke="#6B7280" strokeWidth="1" />
            <path d="M14 11 L16 10" stroke="#6B7280" strokeWidth="1" />
          </>
        )}
      </svg>
      
      {/* Notification dot for active AI processing */}
      {animation === 'thinking' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
      )}
    </div>
  );
};

export default FinnAvatar;