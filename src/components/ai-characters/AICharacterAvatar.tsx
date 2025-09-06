/**
 * AI CHARACTER AVATAR
 * Age-progressive visual representation of AI characters with animations and voice indicators
 * Supports K-12 grade levels with appropriate complexity scaling
 */

import React, { useState, useEffect } from 'react';
import { AICharacter } from '../../types/AICharacterTypes';
import { aiCharacterProvider } from '../../services/aiCharacterProvider';
import { useTheme } from '../../hooks/useTheme';
import { 
  Sparkles, 
  Heart, 
  Star, 
  Zap, 
  Volume2, 
  VolumeX,
  Smile,
  Brain,
  Lightbulb,
  Users,
  Music
} from 'lucide-react';

interface AICharacterAvatarProps {
  character: AICharacter | string;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  isActive?: boolean;
  isSpeaking?: boolean;
  studentGrade?: string;
  onClick?: () => void;
  className?: string;
}

const characterStyles = {
  finn: {
    gradient: 'bg-gradient-to-br from-blue-400 to-cyan-600',
    icon: Sparkles,
    primaryColor: 'text-blue-500',
    accentColor: 'border-blue-300'
  },
  sage: {
    gradient: 'bg-gradient-to-br from-purple-400 to-indigo-600', 
    icon: Brain,
    primaryColor: 'text-purple-500',
    accentColor: 'border-purple-300'
  },
  spark: {
    gradient: 'bg-gradient-to-br from-orange-400 to-pink-600',
    icon: Zap,
    primaryColor: 'text-orange-500',
    accentColor: 'border-orange-300'
  },
  harmony: {
    gradient: 'bg-gradient-to-br from-emerald-300 to-teal-400',
    icon: Music,
    primaryColor: 'text-emerald-400',
    accentColor: 'border-emerald-200'
  }
};

const sizeStyles = {
  small: {
    container: 'w-10 h-10',
    icon: 'w-5 h-5',
    text: 'text-xs',
    pulse: 'animate-pulse'
  },
  medium: {
    container: 'w-16 h-16',
    icon: 'w-8 h-8', 
    text: 'text-sm',
    pulse: 'animate-bounce'
  },
  large: {
    container: 'w-24 h-24',
    icon: 'w-12 h-12',
    text: 'text-base',
    pulse: 'animate-bounce'
  }
};

// Age-progressive complexity scaling
const getGradeComplexity = (grade: string): 'simple' | 'medium' | 'advanced' => {
  const gradeLevel = grade?.toUpperCase() || 'K';
  
  if (['PREK', 'PRE-K', 'K', '1', '2'].includes(gradeLevel)) {
    return 'simple';
  } else if (['3', '4', '5', '6'].includes(gradeLevel)) {
    return 'medium';
  } else {
    return 'advanced';
  }
};

export const AICharacterAvatar: React.FC<AICharacterAvatarProps> = ({
  character,
  size = 'medium',
  showName = true,
  isActive = false,
  isSpeaking = false,
  studentGrade = 'K',
  onClick,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [animationState, setAnimationState] = useState<'idle' | 'talking' | 'thinking'>('idle');
  const { isDarkMode } = useTheme();
  
  // Handle both string and object character input
  const characterObj = typeof character === 'string' 
    ? aiCharacterProvider.getCharacterById(character) || aiCharacterProvider.getCharacterById('finn')
    : character;

  // Defensive check for character prop
  if (!characterObj || !characterObj.id) {
    console.error('AICharacterAvatar: character prop is missing or invalid:', character);
    console.error('AICharacterAvatar: character type:', typeof character);
    console.error('AICharacterAvatar: character keys:', character ? Object.keys(character) : 'null/undefined');
    return (
      <div className={`${sizeStyles[size].container} bg-red-200 rounded-full flex items-center justify-center border-2 border-red-400`}>
        <span className="text-red-600 text-xs font-bold">!</span>
      </div>
    );
  }

  const style = characterStyles[characterObj.id as keyof typeof characterStyles] || characterStyles.finn;
  const sizeStyle = sizeStyles[size];
  const complexity = getGradeComplexity(studentGrade);
  const IconComponent = style.icon;

  // Handle speaking animation
  useEffect(() => {
    if (isSpeaking) {
      setAnimationState('talking');
      const timer = setTimeout(() => {
        setAnimationState('idle');
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setAnimationState('idle');
    }
  }, [isSpeaking]);

  // Grade-appropriate animations and effects
  const getAnimationClass = () => {
    if (animationState === 'talking') {
      return complexity === 'simple' ? 'animate-pulse' : 
             complexity === 'medium' ? 'animate-bounce' : 
             'animate-pulse scale-105';
    }
    
    if (isActive || isHovered) {
      return complexity === 'simple' ? 'scale-110' : 
             complexity === 'medium' ? 'scale-110 rotate-1' :
             'scale-110 rotate-1 shadow-lg';
    }
    
    return '';
  };

  const getVoiceIndicator = () => {
    if (!isSpeaking) return null;
    
    return (
      <div className="absolute -top-1 -right-1">
        <div className={`${style.gradient} rounded-full p-1 animate-pulse`}>
          <Volume2 className="w-3 h-3 text-white" />
        </div>
      </div>
    );
  };

  const getPersonalityIndicators = () => {
    if (complexity === 'simple') return null;
    
    const indicators = {
      finn: [<Sparkles key="1" className="w-3 h-3" />, <Star key="2" className="w-3 h-3" />],
      sage: [<Brain key="1" className="w-3 h-3" />, <Lightbulb key="2" className="w-3 h-3" />],
      spark: [<Zap key="1" className="w-3 h-3" />, <Heart key="2" className="w-3 h-3" />],
      harmony: [<Users key="1" className="w-3 h-3" />, <Smile key="2" className="w-3 h-3" />]
    };

    const characterIndicators = indicators[characterObj.id as keyof typeof indicators] || indicators.finn;
    
    return (
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
        {characterIndicators.map((indicator, index) => (
          <div key={index} className={`${style.primaryColor} opacity-70`}>
            {indicator}
          </div>
        ))}
      </div>
    );
  };

  const getActiveRing = () => {
    if (!isActive) return null;
    
    return (
      <div className={`absolute inset-0 rounded-full border-2 ${style.accentColor} animate-ping`}></div>
    );
  };

  const getCharacterName = () => {
    if (!showName) return null;
    
    const displayName = complexity === 'simple' ? 
      characterObj.name.split(' ')[0] : // Just "Finn", "Sage", etc.
      characterObj.name; // Full name for older students
    
    return (
      <div className={`mt-2 ${sizeStyle.text} font-medium text-gray-700 text-center`}>
        {displayName}
      </div>
    );
  };

  const getTooltip = () => {
    if (complexity === 'simple') return null;
    
    return isHovered ? (
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 
                      bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
        {Array.isArray(characterObj.personality) 
          ? characterObj.personality[0] 
          : characterObj.personality?.toString().split(',')[0] || 'Helpful'
        }
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 
                        border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
      </div>
    ) : null;
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          relative ${sizeStyle.container} ${style.gradient} rounded-full 
          flex items-center justify-center cursor-pointer transition-all duration-300
          ${getAnimationClass()}
          ${onClick ? 'hover:shadow-lg' : ''}
        `}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {getActiveRing()}
        
        {/* Use Lucide icons for AI Companions */}
        <IconComponent className={`${sizeStyle.icon} text-white`} />
        
        {getVoiceIndicator()}
        {complexity !== 'simple' && getPersonalityIndicators()}
      </div>
      
      {getTooltip()}
      {getCharacterName()}
    </div>
  );
};