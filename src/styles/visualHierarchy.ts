/**
 * Visual Hierarchy System for Pathfinity Bento UI
 * Implements brand-compliant design system with proper contrast ratios
 */

// Grade level types
export type GradeLevel = 'elementary' | 'middle' | 'high';
export type HierarchyLevel = 'PRIMARY' | 'SECONDARY' | 'TERTIARY' | 'AMBIENT';
export type ContainerType = 'learn' | 'experience' | 'discover';
export type ThemeMode = 'light' | 'dark';

// Visual hierarchy specifications
export const VisualHierarchy = {
  PRIMARY: {
    prominence: 100,
    shadow: {
      light: '0 12px 40px rgba(139, 92, 246, 0.25)',
      dark: '0 12px 40px rgba(139, 92, 246, 0.4)'
    },
    border: '2px',
    scale: 1.02,
    minHeight: { 
      elementary: 280, 
      middle: 240, 
      high: 200 
    },
    titleSize: { 
      elementary: 28, 
      middle: 24, 
      high: 20 
    },
    iconSize: { 
      elementary: 48, 
      middle: 40, 
      high: 32 
    }
  },
  SECONDARY: {
    prominence: 70,
    shadow: {
      light: '0 6px 20px rgba(139, 92, 246, 0.15)',
      dark: '0 6px 20px rgba(139, 92, 246, 0.3)'
    },
    border: '1.5px',
    scale: 1.01,
    minHeight: { 
      elementary: 180, 
      middle: 160, 
      high: 140 
    },
    titleSize: { 
      elementary: 20, 
      middle: 18, 
      high: 16 
    },
    iconSize: { 
      elementary: 48, 
      middle: 36, 
      high: 28 
    }
  },
  TERTIARY: {
    prominence: 40,
    shadow: {
      light: '0 3px 10px rgba(0, 0, 0, 0.1)',
      dark: '0 3px 10px rgba(0, 0, 0, 0.3)'
    },
    border: '1px',
    scale: 1.0,
    minHeight: { 
      elementary: 140, 
      middle: 120, 
      high: 100 
    },
    titleSize: { 
      elementary: 18, 
      middle: 16, 
      high: 14 
    },
    iconSize: { 
      elementary: 32, 
      middle: 28, 
      high: 24 
    }
  },
  AMBIENT: {
    prominence: 30,
    shadow: {
      light: 'none',
      dark: 'none'
    },
    border: '0.5px',
    scale: 1.0,
    minHeight: { 
      elementary: 80, 
      middle: 70, 
      high: 60 
    },
    titleSize: { 
      elementary: 14, 
      middle: 12, 
      high: 11 
    },
    iconSize: { 
      elementary: 16, 
      middle: 14, 
      high: 12 
    }
  }
};

// Brand colors per container (from UI Guidelines)
export const BrandColors = {
  learn: {
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)', // purple-500 to indigo-500
    primary: '#8B5CF6',
    secondary: '#6366F1',
    light: {
      background: 'linear-gradient(135deg, #F3E8FF 0%, #EEF2FF 100%)', // purple-50 to indigo-50
      card: '#FFFFFF',
      border: 'rgba(139, 92, 246, 0.3)',
      text: {
        primary: '#111827',   // gray-900
        secondary: '#4B5563', // gray-600
        muted: '#6B7280',     // gray-500
        accent: '#7C3AED'     // purple-600
      }
    },
    dark: {
      background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)', // gray-900 to gray-800
      card: '#1F2937',       // gray-800
      border: 'rgba(139, 92, 246, 0.4)',
      text: {
        primary: '#FFFFFF',
        secondary: '#D1D5DB', // gray-300
        muted: '#9CA3AF',     // gray-400
        accent: '#A78BFA'     // purple-400
      }
    }
  },
  
  experience: {
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)', // blue-500 to cyan-500
    primary: '#3B82F6',
    secondary: '#06B6D4',
    light: {
      background: 'linear-gradient(135deg, #DBEAFE 0%, #CFFAFE 100%)', // blue-50 to cyan-50
      card: '#FFFFFF',
      border: 'rgba(59, 130, 246, 0.3)',
      text: {
        primary: '#111827',
        secondary: '#4B5563',
        muted: '#6B7280',
        accent: '#2563EB'     // blue-600
      }
    },
    dark: {
      background: 'linear-gradient(135deg, #111827 0%, rgba(30, 58, 138, 0.9) 50%, rgba(8, 145, 178, 0.9) 100%)',
      card: '#1F2937',
      border: 'rgba(59, 130, 246, 0.4)',
      text: {
        primary: '#FFFFFF',
        secondary: '#D1D5DB',
        muted: '#9CA3AF',
        accent: '#60A5FA'     // blue-400
      }
    }
  },
  
  discover: {
    gradient: 'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)', // emerald-500 to teal-500
    primary: '#10B981',
    secondary: '#14B8A6',
    light: {
      background: 'linear-gradient(135deg, #D1FAE5 0%, #CCFBF1 100%)', // emerald-50 to teal-50
      card: '#FFFFFF',
      border: 'rgba(16, 185, 129, 0.3)',
      text: {
        primary: '#111827',
        secondary: '#4B5563',
        muted: '#6B7280',
        accent: '#059669'     // emerald-600
      }
    },
    dark: {
      background: 'linear-gradient(135deg, #111827 0%, rgba(6, 95, 70, 0.9) 50%, rgba(19, 78, 74, 0.9) 100%)',
      card: '#1F2937',
      border: 'rgba(16, 185, 129, 0.4)',
      text: {
        primary: '#FFFFFF',
        secondary: '#D1D5DB',
        muted: '#9CA3AF',
        accent: '#34D399'     // emerald-400
      }
    }
  }
};

// Get tile styles based on hierarchy and theme
export const getTileStyles = (
  hierarchy: HierarchyLevel,
  containerType: ContainerType,
  theme: ThemeMode,
  gradeLevel: GradeLevel
) => {
  const hierarchySpec = VisualHierarchy[hierarchy];
  const brandColors = BrandColors[containerType][theme];
  const containerColors = BrandColors[containerType];
  
  const styles: any = {
    minHeight: `${hierarchySpec.minHeight[gradeLevel]}px`,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  // Apply hierarchy-specific styles
  switch (hierarchy) {
    case 'PRIMARY':
      styles.background = containerColors.gradient;
      styles.color = '#FFFFFF';
      styles.border = `${hierarchySpec.border} solid rgba(255, 255, 255, ${theme === 'dark' ? '0.2' : '0.3'})`;
      styles.boxShadow = hierarchySpec.shadow[theme];
      break;
      
    case 'SECONDARY':
      styles.background = theme === 'dark' 
        ? `rgba(139, 92, 246, 0.2)`
        : `rgba(139, 92, 246, 0.15)`;
      styles.color = brandColors.text.primary;
      styles.border = `${hierarchySpec.border} solid ${brandColors.border}`;
      styles.boxShadow = hierarchySpec.shadow[theme];
      break;
      
    case 'TERTIARY':
      styles.background = theme === 'dark'
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.03)';
      styles.color = brandColors.text.secondary;
      styles.border = `${hierarchySpec.border} solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'}`;
      styles.boxShadow = hierarchySpec.shadow[theme];
      break;
      
    case 'AMBIENT':
      styles.background = theme === 'dark'
        ? 'rgba(255, 255, 255, 0.02)'
        : 'rgba(0, 0, 0, 0.01)';
      styles.color = brandColors.text.muted;
      styles.border = `${hierarchySpec.border} solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`;
      styles.boxShadow = 'none';
      break;
  }
  
  return styles;
};

// Get text styles based on hierarchy
export const getTextStyles = (
  hierarchy: HierarchyLevel,
  gradeLevel: GradeLevel
) => {
  const hierarchySpec = VisualHierarchy[hierarchy];
  
  return {
    fontSize: `${hierarchySpec.titleSize[gradeLevel]}px`,
    fontWeight: hierarchy === 'PRIMARY' ? 700 : hierarchy === 'SECONDARY' ? 600 : 500,
    lineHeight: hierarchy === 'PRIMARY' ? 1.2 : 1.5,
  };
};

// Get icon size based on hierarchy
export const getIconSize = (
  hierarchy: HierarchyLevel,
  gradeLevel: GradeLevel
) => {
  return `${VisualHierarchy[hierarchy].iconSize[gradeLevel]}px`;
};

// Hover effects based on hierarchy
export const getHoverStyles = (hierarchy: HierarchyLevel) => {
  const scale = VisualHierarchy[hierarchy].scale;
  
  if (hierarchy === 'PRIMARY') {
    return {
      transform: `scale(${scale})`,
      boxShadow: '0 16px 48px rgba(139, 92, 246, 0.35)'
    };
  } else if (hierarchy === 'SECONDARY') {
    return {
      transform: `scale(${scale}) translateY(-2px)`,
      boxShadow: '0 8px 24px rgba(139, 92, 246, 0.25)'
    };
  } else if (hierarchy === 'TERTIARY') {
    return {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    };
  }
  
  return {}; // AMBIENT has no hover effects
};

// Contrast checker utility
export const getContrastRatio = (foreground: string, background: string): number => {
  // Convert hex to RGB
  const getRGB = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  // Calculate relative luminance
  const getLuminance = (rgb: any) => {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const fg = getRGB(foreground);
  const bg = getRGB(background);
  
  if (!fg || !bg) return 0;
  
  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

// Ensure minimum contrast ratio
export const ensureContrast = (
  foreground: string,
  background: string,
  minRatio: number = 4.5
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  if (ratio < minRatio) {
    console.warn(`⚠️ Contrast ratio ${ratio.toFixed(2)} is below minimum ${minRatio} for ${foreground} on ${background}`);
    return false;
  }
  return true;
};

// Get safe text color based on background
export const getSafeTextColor = (
  background: string,
  theme: ThemeMode
): string => {
  // For primary tiles with gradient backgrounds, always use white
  if (background.includes('gradient')) {
    return '#FFFFFF';
  }
  
  // For other backgrounds, calculate contrast
  const whiteContrast = getContrastRatio('#FFFFFF', background);
  const blackContrast = getContrastRatio('#111827', background);
  
  // Choose color with better contrast
  if (theme === 'dark') {
    return whiteContrast >= 4.5 ? '#FFFFFF' : '#111827';
  } else {
    return blackContrast >= 4.5 ? '#111827' : '#FFFFFF';
  }
};