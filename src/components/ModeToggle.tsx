// ================================================================
// MODE TOGGLE - Simple dark/light mode switcher
// Adapts visual style based on grade level but ONLY toggles mode
// ================================================================

import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useModeContext } from '../contexts/ModeContext';
import { useAuthContext } from '../contexts/AuthContext';
import { useStudentProfile } from '../hooks/useStudentProfile';
import type { GradeLevel } from '../services/studentProfileService';

interface ModeToggleProps {
  gradeLevel?: GradeLevel;
  className?: string;
  showLabel?: boolean;
  variant?: 'auto' | 'playful' | 'friendly' | 'clean' | 'professional';
}

// Grade-based visual styling (not functionality)
const getToggleStyle = (grade: GradeLevel | string, variant?: string) => {
  if (variant && variant !== 'auto') {
    return variant;
  }

  // Pre-K & K: Playful style
  if (grade === 'Pre-K' || grade === 'K' || grade === 'Kindergarten') {
    return 'playful';
  }
  
  // Elementary (1-5): Friendly style
  if (['1', '2', '3', '4', '5'].includes(grade) || grade === 'Grade 3') {
    return 'friendly';
  }
  
  // Middle School (6-8): Clean style
  if (['6', '7', '8'].includes(grade) || grade === 'Grade 7') {
    return 'clean';
  }
  
  // High School (9-12): Professional style
  if (['9', '10', '11', '12'].includes(grade) || grade === 'Grade 10') {
    return 'professional';
  }

  return 'friendly'; // Default
};

const toggleStyles = {
  playful: {
    button: 'w-12 h-12 rounded-full text-2xl transition-all duration-300 hover:scale-110 active:scale-95',
    lightIcon: '🌞',
    darkIcon: '😴',
    lightBg: 'bg-yellow-200 hover:bg-yellow-300',
    darkBg: 'bg-indigo-800 hover:bg-indigo-700'
  },
  friendly: {
    button: 'w-9 h-9 rounded-full text-lg transition-all duration-200 hover:scale-105',
    lightIcon: '☀️',
    darkIcon: '🌙',
    lightBg: 'bg-blue-100 hover:bg-blue-200',
    darkBg: 'bg-blue-800 hover:bg-blue-700'
  },
  clean: {
    button: 'w-8 h-8 rounded-lg transition-all duration-150',
    lightIcon: <Sun className="w-4 h-4" />,
    darkIcon: <Moon className="w-4 h-4" />,
    lightBg: 'bg-gray-100 hover:bg-gray-200',
    darkBg: 'bg-gray-700 hover:bg-gray-600'
  },
  professional: {
    button: 'w-12 h-6 rounded-full relative transition-all duration-100',
    lightIcon: <Sun className="w-3 h-3" />,
    darkIcon: <Moon className="w-3 h-3" />,
    lightBg: 'bg-gray-200',
    darkBg: 'bg-gray-600'
  }
};

export const ModeToggle: React.FC<ModeToggleProps> = ({
  gradeLevel: propGradeLevel,
  className = '',
  showLabel = false,
  variant = 'auto'
}) => {
  const { mode, toggleMode } = useModeContext();
  const { user } = useAuthContext();
  const { profile } = useStudentProfile(
    user?.role === 'student' ? user?.id : undefined, 
    user?.role === 'student' ? user?.email : undefined
  );
  const [isAnimating, setIsAnimating] = useState(false);

  // Determine grade level from props, profile, or fallback
  const gradeLevel = propGradeLevel || profile?.grade || (user as any)?.grade_level || 'K';
  const style = getToggleStyle(gradeLevel, variant);
  const styles = toggleStyles[style as keyof typeof toggleStyles];

  const handleToggle = () => {
    setIsAnimating(true);
    toggleMode();
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Professional style uses a slider
  if (style === 'professional') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <button
          onClick={handleToggle}
          className={`${styles.button} ${mode === 'dark' ? styles.darkBg : styles.lightBg}`}
          aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
        >
          <div 
            className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 flex items-center justify-center ${
              mode === 'dark' ? 'translate-x-6' : 'translate-x-0'
            }`}
          >
            {mode === 'dark' ? styles.darkIcon : styles.lightIcon}
          </div>
        </button>
        {showLabel && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {mode === 'dark' ? 'Dark' : 'Light'} Mode
          </span>
        )}
      </div>
    );
  }

  // All other styles use a button
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={handleToggle}
        className={`${styles.button} ${mode === 'dark' ? styles.darkBg : styles.lightBg} ${
          isAnimating ? 'animate-bounce' : ''
        } flex items-center justify-center`}
        aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
      >
        {mode === 'dark' ? styles.darkIcon : styles.lightIcon}
      </button>
      {showLabel && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {mode === 'dark' ? 'Dark' : 'Light'} Mode
        </span>
      )}
    </div>
  );
};