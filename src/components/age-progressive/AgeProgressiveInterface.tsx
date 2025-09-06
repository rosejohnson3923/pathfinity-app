/**
 * AGE-PROGRESSIVE INTERFACE
 * Dynamically adapts interface complexity based on student grade level
 * Provides age-appropriate UI patterns from K-12
 */

import React, { ReactNode } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Smile, 
  Star, 
  Heart, 
  Zap, 
  Trophy,
  Target,
  BookOpen,
  Users,
  Settings,
  BarChart3,
  GraduationCap
} from 'lucide-react';

export type GradeLevel = 'PreK' | 'K' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';
export type ComplexityLevel = 'simple' | 'medium' | 'advanced' | 'professional';

interface AgeProgressiveInterfaceProps {
  grade: GradeLevel | string;
  children: ReactNode;
  showNavigation?: boolean;
  showProgress?: boolean;
  className?: string;
}

interface ProgressiveComponentProps {
  grade: GradeLevel | string;
  simple: ReactNode;
  medium?: ReactNode;
  advanced?: ReactNode;
  professional?: ReactNode;
}

// Utility function to determine complexity level from grade
const getComplexityLevel = (grade: GradeLevel | string): ComplexityLevel => {
  const gradeStr = grade.toString().toUpperCase();
  
  if (['PREK', 'PRE-K', 'K', '1', '2'].includes(gradeStr)) {
    return 'simple';
  } else if (['3', '4', '5', '6'].includes(gradeStr)) {
    return 'medium';
  } else if (['7', '8', '9', '10'].includes(gradeStr)) {
    return 'advanced';
  } else {
    return 'professional';
  }
};

// Age-appropriate color schemes
const getColorScheme = (complexity: ComplexityLevel) => {
  switch (complexity) {
    case 'simple':
      return {
        primary: 'bg-gradient-to-r from-blue-400 to-purple-400',
        secondary: 'bg-gradient-to-r from-green-400 to-blue-400',
        accent: 'bg-gradient-to-r from-yellow-400 to-orange-400',
        text: 'text-gray-700',
        card: 'bg-white border-2 border-dashed border-gray-300'
      };
    case 'medium':
      return {
        primary: 'bg-gradient-to-r from-blue-500 to-indigo-600',
        secondary: 'bg-gradient-to-r from-emerald-500 to-teal-600',
        accent: 'bg-gradient-to-r from-orange-500 to-red-500',
        text: 'text-gray-800',
        card: 'bg-white border border-gray-200 shadow-sm'
      };
    case 'advanced':
      return {
        primary: 'bg-gradient-to-r from-indigo-600 to-purple-700',
        secondary: 'bg-gradient-to-r from-teal-600 to-cyan-700',
        accent: 'bg-gradient-to-r from-rose-500 to-pink-600',
        text: 'text-gray-900',
        card: 'bg-white border border-gray-300 shadow-md'
      };
    case 'professional':
      return {
        primary: 'bg-gradient-to-r from-gray-700 to-gray-900',
        secondary: 'bg-gradient-to-r from-blue-600 to-indigo-800',
        accent: 'bg-gradient-to-r from-emerald-600 to-teal-700',
        text: 'text-gray-900',
        card: 'bg-white border border-gray-400 shadow-lg'
      };
  }
};

// Age-appropriate typography
const getTypography = (complexity: ComplexityLevel) => {
  switch (complexity) {
    case 'simple':
      return {
        heading: 'text-2xl font-bold tracking-wide',
        subheading: 'text-lg font-semibold',
        body: 'text-base leading-relaxed',
        caption: 'text-sm'
      };
    case 'medium':
      return {
        heading: 'text-xl font-bold',
        subheading: 'text-lg font-semibold',
        body: 'text-base',
        caption: 'text-sm'
      };
    case 'advanced':
      return {
        heading: 'text-xl font-bold',
        subheading: 'text-base font-semibold',
        body: 'text-sm',
        caption: 'text-xs'
      };
    case 'professional':
      return {
        heading: 'text-lg font-bold',
        subheading: 'text-base font-semibold',
        body: 'text-sm',
        caption: 'text-xs'
      };
  }
};

// Age-appropriate spacing
const getSpacing = (complexity: ComplexityLevel) => {
  switch (complexity) {
    case 'simple':
      return {
        container: 'p-6 space-y-8',
        card: 'p-6 space-y-4',
        button: 'px-6 py-3 text-base',
        icon: 'w-8 h-8'
      };
    case 'medium':
      return {
        container: 'p-4 space-y-6',
        card: 'p-4 space-y-3',
        button: 'px-4 py-2 text-sm',
        icon: 'w-6 h-6'
      };
    case 'advanced':
      return {
        container: 'p-4 space-y-4',
        card: 'p-3 space-y-2',
        button: 'px-3 py-1.5 text-sm',
        icon: 'w-5 h-5'
      };
    case 'professional':
      return {
        container: 'p-3 space-y-3',
        card: 'p-3 space-y-2',
        button: 'px-3 py-1 text-xs',
        icon: 'w-4 h-4'
      };
  }
};

// Progressive Component - renders different content based on grade level
export const ProgressiveComponent: React.FC<ProgressiveComponentProps> = ({
  grade,
  simple,
  medium,
  advanced,
  professional
}) => {
  const complexity = getComplexityLevel(grade);
  
  switch (complexity) {
    case 'simple':
      return <>{simple}</>;
    case 'medium':
      return <>{medium || simple}</>;
    case 'advanced':
      return <>{advanced || medium || simple}</>;
    case 'professional':
      return <>{professional || advanced || medium || simple}</>;
    default:
      return <>{simple}</>;
  }
};

// Age-Progressive Button Component
export const ProgressiveButton: React.FC<{
  grade: GradeLevel | string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}> = ({
  grade,
  children,
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  className = ''
}) => {
  const complexity = getComplexityLevel(grade);
  const colors = getColorScheme(complexity);
  const spacing = getSpacing(complexity);
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.secondary;
      case 'accent': return colors.accent;
      default: return colors.primary;
    }
  };

  const getSizeClasses = () => {
    if (complexity === 'simple') {
      return size === 'large' ? 'px-8 py-4 text-lg' : 
             size === 'small' ? 'px-4 py-2 text-sm' : spacing.button;
    }
    return spacing.button;
  };

  const getAnimationClasses = () => {
    if (complexity === 'simple') {
      return 'transform hover:scale-105 active:scale-95 transition-all duration-200';
    }
    return 'hover:opacity-90 transition-opacity duration-150';
  };

  return (
    <Button
      className={`
        ${getVariantClasses()} text-white font-semibold rounded-lg
        ${getSizeClasses()} ${getAnimationClasses()} ${className}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};

// Age-Progressive Card Component
export const ProgressiveCard: React.FC<{
  grade: GradeLevel | string;
  title?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({
  grade,
  title,
  children,
  className = '',
  onClick
}) => {
  const complexity = getComplexityLevel(grade);
  const colors = getColorScheme(complexity);
  const typography = getTypography(complexity);
  const spacing = getSpacing(complexity);

  const getCardClasses = () => {
    const baseClasses = `${colors.card} rounded-lg ${spacing.card}`;
    
    if (complexity === 'simple') {
      return `${baseClasses} hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300`;
    }
    return `${baseClasses} hover:shadow-md transition-shadow duration-200`;
  };

  return (
    <Card 
      className={`${getCardClasses()} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {title && (
        <h3 className={`${typography.heading} ${colors.text} mb-3`}>
          {title}
        </h3>
      )}
      {children}
    </Card>
  );
};

// Age-Progressive Navigation
export const ProgressiveNavigation: React.FC<{
  grade: GradeLevel | string;
  items: Array<{ id: string; label: string; icon?: React.ComponentType<{ className?: string }> }>;
  activeItem?: string;
  onItemClick?: (id: string) => void;
}> = ({
  grade,
  items,
  activeItem,
  onItemClick
}) => {
  const complexity = getComplexityLevel(grade);
  const spacing = getSpacing(complexity);

  if (complexity === 'simple') {
    // Simple large button navigation for K-2
    return (
      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => {
          const IconComponent = item.icon || BookOpen;
          return (
            <ProgressiveButton
              key={item.id}
              grade={grade}
              variant={activeItem === item.id ? 'primary' : 'secondary'}
              size="large"
              onClick={() => onItemClick?.(item.id)}
              className="flex flex-col items-center space-y-2"
            >
              <IconComponent className={spacing.icon} />
              <span>{item.label}</span>
            </ProgressiveButton>
          );
        })}
      </div>
    );
  }

  // Tab-based navigation for older students
  return (
    <Tabs value={activeItem} onValueChange={onItemClick}>
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
        {items.map((item) => {
          const IconComponent = item.icon || BookOpen;
          return (
            <TabsTrigger key={item.id} value={item.id} className="flex items-center space-x-1">
              <IconComponent className={spacing.icon} />
              {complexity !== 'professional' && <span>{item.label}</span>}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
};

// Main Age-Progressive Interface Component
export const AgeProgressiveInterface: React.FC<AgeProgressiveInterfaceProps> = ({
  grade,
  children,
  showNavigation = false,
  showProgress = false,
  className = ''
}) => {
  const complexity = getComplexityLevel(grade);
  const colors = getColorScheme(complexity);
  const spacing = getSpacing(complexity);

  const getContainerClasses = () => {
    return `${spacing.container} ${className}`;
  };

  const getBackgroundPattern = () => {
    if (complexity === 'simple') {
      return 'bg-gradient-to-br from-blue-50 to-purple-50';
    }
    return 'bg-gray-50';
  };

  return (
    <div className={`min-h-screen ${getBackgroundPattern()}`}>
      <div className={getContainerClasses()}>
        {showProgress && (
          <div className="mb-6">
            <ProgressiveComponent
              grade={grade}
              simple={
                <div className="flex items-center space-x-2">
                  <Star className="w-6 h-6 text-yellow-500" />
                  <span className="text-lg font-semibold">Great job learning!</span>
                </div>
              }
              medium={
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Learning Progress</span>
                  <Badge variant="secondary">Level {grade}</Badge>
                </div>
              }
              advanced={
                <div className="flex justify-between items-center text-sm">
                  <span>Academic Progress - Grade {grade}</span>
                  <Badge variant="outline">Advanced Track</Badge>
                </div>
              }
            />
          </div>
        )}

        {showNavigation && (
          <div className="mb-6">
            <ProgressiveNavigation
              grade={grade}
              items={[
                { id: 'learn', label: 'Learn', icon: BookOpen },
                { id: 'practice', label: 'Practice', icon: Target },
                { id: 'explore', label: 'Explore', icon: Zap }
              ]}
            />
          </div>
        )}

        {children}
      </div>
    </div>
  );
};