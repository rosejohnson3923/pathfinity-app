/**
 * Grade-Specific Layout Configuration
 * Defines grid layouts, sizing, and visual settings for different grade levels
 */

export interface GradeLayoutConfig {
  grid: string; // Grid template
  tileSize: 'extra-large' | 'large' | 'medium' | 'small';
  spacing: 'wide' | 'medium' | 'compact' | 'tight';
  fontSize: number; // Base font size in pixels
  visualRatio: number; // Ratio of visual to text content (0-1)
  animations: 'playful' | 'smooth' | 'subtle' | 'professional';
  maxColumns: number;
  minTileHeight: string;
  containerPadding: string;
  showVisuals: boolean;
  requiresConfirmation: boolean;
}

/**
 * Grade layout configurations
 */
export const GRADE_LAYOUTS: Record<string, GradeLayoutConfig> = {
  'K-2': {
    grid: '2x2',
    tileSize: 'extra-large',
    spacing: 'wide',
    fontSize: 24,
    visualRatio: 0.8, // 80% visual, 20% text
    animations: 'playful',
    maxColumns: 2,
    minTileHeight: '160px',
    containerPadding: '32px',
    showVisuals: true,
    requiresConfirmation: false
  },
  '3-5': {
    grid: '3x3',
    tileSize: 'large',
    spacing: 'medium',
    fontSize: 18,
    visualRatio: 0.6, // 60% visual, 40% text
    animations: 'smooth',
    maxColumns: 3,
    minTileHeight: '120px',
    containerPadding: '24px',
    showVisuals: true,
    requiresConfirmation: false
  },
  '6-8': {
    grid: '3x4',
    tileSize: 'medium',
    spacing: 'compact',
    fontSize: 16,
    visualRatio: 0.4, // 40% visual, 60% text
    animations: 'subtle',
    maxColumns: 4,
    minTileHeight: '100px',
    containerPadding: '20px',
    showVisuals: false,
    requiresConfirmation: true
  },
  '9-12': {
    grid: '4x4',
    tileSize: 'small',
    spacing: 'tight',
    fontSize: 14,
    visualRatio: 0.2, // 20% visual, 80% text
    animations: 'professional',
    maxColumns: 4,
    minTileHeight: '80px',
    containerPadding: '16px',
    showVisuals: false,
    requiresConfirmation: true
  }
};

/**
 * Get layout configuration for a specific grade
 */
export const getGradeLayout = (gradeLevel: string): GradeLayoutConfig => {
  if (['K', '1', '2'].includes(gradeLevel)) {
    return GRADE_LAYOUTS['K-2'];
  }
  if (['3', '4', '5'].includes(gradeLevel)) {
    return GRADE_LAYOUTS['3-5'];
  }
  if (['6', '7', '8'].includes(gradeLevel)) {
    return GRADE_LAYOUTS['6-8'];
  }
  return GRADE_LAYOUTS['9-12'];
};

/**
 * Get CSS grid template for grade level
 */
export const getGridTemplate = (gradeLevel: string): string => {
  const layout = getGradeLayout(gradeLevel);
  const [rows, cols] = layout.grid.split('x').map(n => parseInt(n));
  
  return `repeat(${cols}, 1fr)`;
};

/**
 * Get responsive grid template
 */
export const getResponsiveGridTemplate = (gradeLevel: string, screenWidth: number): string => {
  const layout = getGradeLayout(gradeLevel);
  
  // Mobile adjustments
  if (screenWidth < 480) {
    return '1fr'; // Single column on mobile
  }
  
  // Tablet adjustments
  if (screenWidth < 768) {
    if (layout.maxColumns > 2) {
      return 'repeat(2, 1fr)'; // Max 2 columns on tablet
    }
  }
  
  return getGridTemplate(gradeLevel);
};

/**
 * Get tile size class for CSS
 */
export const getTileSizeClass = (gradeLevel: string): string => {
  const layout = getGradeLayout(gradeLevel);
  return `tile-${layout.tileSize}`;
};

/**
 * Get spacing value in pixels
 */
export const getSpacingValue = (gradeLevel: string): number => {
  const layout = getGradeLayout(gradeLevel);
  const spacingMap = {
    'wide': 32,
    'medium': 24,
    'compact': 16,
    'tight': 8
  };
  return spacingMap[layout.spacing];
};

/**
 * Get animation duration based on grade
 */
export const getAnimationDuration = (gradeLevel: string): number => {
  const layout = getGradeLayout(gradeLevel);
  const durationMap = {
    'playful': 600, // Longer, more noticeable
    'smooth': 400,
    'subtle': 250,
    'professional': 150 // Quick and snappy
  };
  return durationMap[layout.animations];
};

/**
 * Check if grade needs large touch targets
 */
export const needsLargeTouchTargets = (gradeLevel: string): boolean => {
  return ['K', '1', '2'].includes(gradeLevel);
};

/**
 * Get minimum touch target size
 */
export const getMinTouchTargetSize = (gradeLevel: string): number => {
  if (['K', '1', '2'].includes(gradeLevel)) return 64;
  if (['3', '4', '5'].includes(gradeLevel)) return 48;
  if (['6', '7', '8'].includes(gradeLevel)) return 44;
  return 40; // WCAG minimum
};

/**
 * Layout presets for different screen types
 */
export const LAYOUT_PRESETS = {
  introduction: {
    'K-2': {
      hero: 'full-width',
      companion: 'half-width',
      content: 'full-width',
      action: 'centered'
    },
    '3-5': {
      hero: '2/3-width',
      companion: '1/3-width',
      content: 'full-width',
      action: 'right-aligned'
    },
    '6-8': {
      hero: 'half-width',
      companion: 'quarter-width',
      content: 'three-quarter-width',
      action: 'right-aligned'
    },
    '9-12': {
      hero: 'third-width',
      companion: 'sidebar',
      content: 'main-content',
      action: 'inline'
    }
  },
  scenario: {
    'K-2': {
      question: 'full-width-large',
      options: 'grid-2x2',
      feedback: 'overlay',
      companion: 'floating'
    },
    '3-5': {
      question: 'full-width',
      options: 'grid-1x4',
      feedback: 'inline',
      companion: 'corner'
    },
    '6-8': {
      question: 'top-panel',
      options: 'list',
      feedback: 'sidebar',
      companion: 'minimized'
    },
    '9-12': {
      question: 'compact-header',
      options: 'compact-list',
      feedback: 'toast',
      companion: 'hidden'
    }
  },
  completion: {
    'K-2': {
      celebration: 'full-screen',
      stats: 'visual-badges',
      action: 'large-centered'
    },
    '3-5': {
      celebration: 'hero',
      stats: 'card-grid',
      action: 'bottom-right'
    },
    '6-8': {
      celebration: 'banner',
      stats: 'table',
      action: 'inline'
    },
    '9-12': {
      celebration: 'minimal',
      stats: 'detailed-table',
      action: 'toolbar'
    }
  }
};

/**
 * Get layout preset for screen type and grade
 */
export const getLayoutPreset = (screenType: string, gradeLevel: string) => {
  const gradeCategory = ['K', '1', '2'].includes(gradeLevel) ? 'K-2' :
                        ['3', '4', '5'].includes(gradeLevel) ? '3-5' :
                        ['6', '7', '8'].includes(gradeLevel) ? '6-8' : '9-12';
  
  return LAYOUT_PRESETS[screenType]?.[gradeCategory] || LAYOUT_PRESETS.scenario['6-8'];
};