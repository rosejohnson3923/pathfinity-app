/**
 * Responsive Handler Utility
 * Manages responsive layouts and breakpoints for different grade levels
 */

import React from 'react';

export interface ResponsiveConfig {
  breakpoint: 'mobile' | 'tablet' | 'desktop' | 'wide';
  orientation: 'portrait' | 'landscape';
  gridColumns: number;
  gridRows: number;
  tileArrangement: string;
  showCompanion: boolean;
  companionPosition: 'float' | 'inline' | 'corner' | 'hidden';
  optionLayout: 'stack' | 'grid' | 'carousel' | 'list';
  fontSize: number;
  spacing: number;
  touchTargetSize: number;
}

/**
 * Get screen breakpoint based on width
 */
export const getBreakpoint = (width: number): ResponsiveConfig['breakpoint'] => {
  if (width < 480) return 'mobile';
  if (width < 768) return 'tablet';
  if (width < 1200) return 'desktop';
  return 'wide';
};

/**
 * Get device orientation
 */
export const getOrientation = (width: number, height: number): ResponsiveConfig['orientation'] => {
  return width > height ? 'landscape' : 'portrait';
};

/**
 * Get responsive layout configuration for grade and screen size
 */
export const getResponsiveLayout = (
  gradeLevel: string, 
  screenWidth: number,
  screenHeight?: number
): ResponsiveConfig => {
  const breakpoint = getBreakpoint(screenWidth);
  const orientation = screenHeight ? getOrientation(screenWidth, screenHeight) : 'portrait';
  
  // K-2 Responsive Configurations
  if (['K', '1', '2'].includes(gradeLevel)) {
    switch (breakpoint) {
      case 'mobile':
        return {
          breakpoint,
          orientation,
          gridColumns: 1,
          gridRows: 4,
          tileArrangement: 'vertical-stack',
          showCompanion: true,
          companionPosition: orientation === 'portrait' ? 'inline' : 'corner',
          optionLayout: 'stack',
          fontSize: 20,
          spacing: 16,
          touchTargetSize: 64
        };
      
      case 'tablet':
        return {
          breakpoint,
          orientation,
          gridColumns: 2,
          gridRows: 2,
          tileArrangement: '2x2-grid',
          showCompanion: true,
          companionPosition: 'float',
          optionLayout: 'grid',
          fontSize: 22,
          spacing: 20,
          touchTargetSize: 64
        };
      
      case 'desktop':
      case 'wide':
        return {
          breakpoint,
          orientation,
          gridColumns: 2,
          gridRows: 2,
          tileArrangement: '2x2-grid-spacious',
          showCompanion: true,
          companionPosition: 'float',
          optionLayout: 'grid',
          fontSize: 24,
          spacing: 32,
          touchTargetSize: 72
        };
    }
  }
  
  // 3-5 Responsive Configurations
  if (['3', '4', '5'].includes(gradeLevel)) {
    switch (breakpoint) {
      case 'mobile':
        return {
          breakpoint,
          orientation,
          gridColumns: 1,
          gridRows: 4,
          tileArrangement: 'vertical-stack',
          showCompanion: true,
          companionPosition: 'corner',
          optionLayout: 'stack',
          fontSize: 16,
          spacing: 12,
          touchTargetSize: 48
        };
      
      case 'tablet':
        return {
          breakpoint,
          orientation,
          gridColumns: orientation === 'portrait' ? 2 : 3,
          gridRows: orientation === 'portrait' ? 3 : 2,
          tileArrangement: 'flexible-grid',
          showCompanion: true,
          companionPosition: 'inline',
          optionLayout: 'grid',
          fontSize: 18,
          spacing: 16,
          touchTargetSize: 48
        };
      
      case 'desktop':
      case 'wide':
        return {
          breakpoint,
          orientation,
          gridColumns: 3,
          gridRows: 3,
          tileArrangement: '3x3-grid',
          showCompanion: true,
          companionPosition: 'inline',
          optionLayout: 'grid',
          fontSize: 18,
          spacing: 24,
          touchTargetSize: 48
        };
    }
  }
  
  // 6-8 Responsive Configurations
  if (['6', '7', '8'].includes(gradeLevel)) {
    switch (breakpoint) {
      case 'mobile':
        return {
          breakpoint,
          orientation,
          gridColumns: 1,
          gridRows: 6,
          tileArrangement: 'accordion',
          showCompanion: orientation === 'landscape',
          companionPosition: 'hidden',
          optionLayout: 'list',
          fontSize: 14,
          spacing: 8,
          touchTargetSize: 44
        };
      
      case 'tablet':
        return {
          breakpoint,
          orientation,
          gridColumns: orientation === 'portrait' ? 2 : 3,
          gridRows: orientation === 'portrait' ? 4 : 3,
          tileArrangement: 'tabs',
          showCompanion: true,
          companionPosition: 'corner',
          optionLayout: 'list',
          fontSize: 15,
          spacing: 12,
          touchTargetSize: 44
        };
      
      case 'desktop':
      case 'wide':
        return {
          breakpoint,
          orientation,
          gridColumns: 3,
          gridRows: 4,
          tileArrangement: 'panels',
          showCompanion: true,
          companionPosition: 'corner',
          optionLayout: 'list',
          fontSize: 16,
          spacing: 16,
          touchTargetSize: 44
        };
    }
  }
  
  // 9-12 Responsive Configurations (default)
  switch (breakpoint) {
    case 'mobile':
      return {
        breakpoint,
        orientation,
        gridColumns: 1,
        gridRows: 8,
        tileArrangement: 'compact-stack',
        showCompanion: false,
        companionPosition: 'hidden',
        optionLayout: 'list',
        fontSize: 13,
        spacing: 4,
        touchTargetSize: 40
      };
    
    case 'tablet':
      return {
        breakpoint,
        orientation,
        gridColumns: 2,
        gridRows: 4,
        tileArrangement: 'compact-grid',
        showCompanion: false,
        companionPosition: 'hidden',
        optionLayout: 'list',
        fontSize: 14,
        spacing: 8,
        touchTargetSize: 40
      };
    
    case 'desktop':
    case 'wide':
    default:
      return {
        breakpoint: breakpoint as ResponsiveConfig['breakpoint'],
        orientation,
        gridColumns: 4,
        gridRows: 4,
        tileArrangement: 'workspace',
        showCompanion: false,
        companionPosition: 'hidden',
        optionLayout: 'list',
        fontSize: 14,
        spacing: 12,
        touchTargetSize: 40
      };
  }
};

/**
 * Get CSS grid template based on responsive config
 */
export const getGridCSS = (config: ResponsiveConfig): React.CSSProperties => {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${config.gridColumns}, 1fr)`,
    gridTemplateRows: `repeat(${config.gridRows}, auto)`,
    gap: `${config.spacing}px`,
    fontSize: `${config.fontSize}px`
  };
};

/**
 * Get option container styles based on layout type
 */
export const getOptionStyles = (
  config: ResponsiveConfig,
  optionCount: number
): React.CSSProperties => {
  switch (config.optionLayout) {
    case 'grid':
      const cols = Math.min(config.gridColumns, optionCount);
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: `${config.spacing}px`,
        minHeight: `${config.touchTargetSize}px`
      };
    
    case 'stack':
      return {
        display: 'flex',
        flexDirection: 'column',
        gap: `${config.spacing}px`
      };
    
    case 'carousel':
      return {
        display: 'flex',
        overflowX: 'auto',
        gap: `${config.spacing}px`,
        scrollSnapType: 'x mandatory'
      };
    
    case 'list':
    default:
      return {
        display: 'flex',
        flexDirection: 'column',
        gap: `${config.spacing / 2}px`
      };
  }
};

/**
 * Check if screen size is appropriate for drag-drop
 */
export const canUseDragDrop = (
  gradeLevel: string,
  screenWidth: number
): boolean => {
  // K-2 never use drag-drop
  if (['K', '1', '2'].includes(gradeLevel)) return false;
  
  // Other grades need at least tablet size for drag-drop
  return screenWidth >= 768;
};

/**
 * Get companion size based on screen and grade
 */
export const getCompanionSize = (
  gradeLevel: string,
  breakpoint: ResponsiveConfig['breakpoint']
): 'small' | 'medium' | 'large' => {
  if (['K', '1', '2'].includes(gradeLevel)) {
    return breakpoint === 'mobile' ? 'medium' : 'large';
  }
  
  if (['3', '4', '5'].includes(gradeLevel)) {
    return breakpoint === 'mobile' ? 'small' : 'medium';
  }
  
  return 'small';
};

/**
 * Check if layout needs simplification
 */
export const needsSimplifiedLayout = (
  gradeLevel: string,
  screenWidth: number
): boolean => {
  const isYoungLearner = ['K', '1', '2', '3'].includes(gradeLevel);
  const isSmallScreen = screenWidth < 480;
  
  return isYoungLearner || isSmallScreen;
};

/**
 * Get animation speed multiplier based on grade and device
 */
export const getAnimationSpeed = (
  gradeLevel: string,
  breakpoint: ResponsiveConfig['breakpoint']
): number => {
  // Slower animations for younger learners
  if (['K', '1', '2'].includes(gradeLevel)) {
    return breakpoint === 'mobile' ? 1.5 : 1.2;
  }
  
  // Faster on mobile for older students
  if (['9', '10', '11', '12'].includes(gradeLevel)) {
    return breakpoint === 'mobile' ? 0.7 : 1.0;
  }
  
  return 1.0;
};

/**
 * Hook to track window size and provide responsive config
 */
export const useResponsiveConfig = (gradeLevel: string) => {
  const [config, setConfig] = React.useState<ResponsiveConfig>(() => 
    getResponsiveLayout(gradeLevel, window.innerWidth, window.innerHeight)
  );

  React.useEffect(() => {
    const handleResize = () => {
      setConfig(getResponsiveLayout(gradeLevel, window.innerWidth, window.innerHeight));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gradeLevel]);

  return config;
};

/**
 * Media query helpers
 */
export const mediaQueries = {
  mobile: '@media (max-width: 479px)',
  tablet: '@media (min-width: 480px) and (max-width: 767px)',
  desktop: '@media (min-width: 768px) and (max-width: 1199px)',
  wide: '@media (min-width: 1200px)',
  portrait: '@media (orientation: portrait)',
  landscape: '@media (orientation: landscape)',
  touch: '@media (hover: none) and (pointer: coarse)',
  mouse: '@media (hover: hover) and (pointer: fine)'
};

export default {
  getResponsiveLayout,
  getBreakpoint,
  getOrientation,
  getGridCSS,
  getOptionStyles,
  canUseDragDrop,
  getCompanionSize,
  needsSimplifiedLayout,
  getAnimationSpeed,
  useResponsiveConfig,
  mediaQueries
};