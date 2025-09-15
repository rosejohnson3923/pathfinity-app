/**
 * Grade Adapter Utility
 * Determines layout and style configurations based on grade level
 */

export type GradeCategory = 'elementary' | 'middle' | 'high';
export type LayoutType = 'simple' | 'standard' | 'complex';

export interface GradeConfig {
  category: GradeCategory;
  layout: LayoutType;
  maxTiles: number;
  tileSize: 'large' | 'medium' | 'compact';
  textDensity: 'minimal' | 'moderate' | 'high';
  visualPriority: 'high' | 'balanced' | 'low';
  interactionMode: 'tap-only' | 'multi-select' | 'advanced';
  contentReduction: {
    showHints: boolean | 'on-demand';
    simplifyLanguage: boolean;
    maxOptionsCount: number;
    useIcons: boolean;
    showAnalytics?: boolean;
  };
}

export const getGradeCategory = (grade: string): GradeCategory => {
  const gradeNum = grade === 'K' ? 0 : parseInt(grade);
  if (gradeNum <= 2) return 'elementary';
  if (gradeNum <= 8) return 'middle';
  return 'high';
};

export const getGradeConfig = (grade: string): GradeConfig => {
  const category = getGradeCategory(grade);

  const configs: Record<GradeCategory, GradeConfig> = {
    elementary: {
      category: 'elementary',
      layout: 'simple',
      maxTiles: 3,
      tileSize: 'large',
      textDensity: 'minimal',
      visualPriority: 'high',
      interactionMode: 'tap-only',
      contentReduction: {
        showHints: true,
        simplifyLanguage: true,
        maxOptionsCount: 3,
        useIcons: true
      }
    },
    middle: {
      category: 'middle',
      layout: 'standard',
      maxTiles: 6,
      tileSize: 'medium',
      textDensity: 'moderate',
      visualPriority: 'balanced',
      interactionMode: 'multi-select',
      contentReduction: {
        showHints: 'on-demand',
        simplifyLanguage: false,
        maxOptionsCount: 4,
        useIcons: false
      }
    },
    high: {
      category: 'high',
      layout: 'complex',
      maxTiles: 10,
      tileSize: 'compact',
      textDensity: 'high',
      visualPriority: 'low',
      interactionMode: 'advanced',
      contentReduction: {
        showHints: false,
        simplifyLanguage: false,
        maxOptionsCount: 6,
        useIcons: false,
        showAnalytics: true
      }
    }
  };

  return configs[category];
};

export const getLayoutClasses = (grade: string) => {
  const config = getGradeConfig(grade);
  return {
    grid: `grid${config.category.charAt(0).toUpperCase() + config.category.slice(1)}`,
    tile: `tile${config.tileSize.charAt(0).toUpperCase() + config.tileSize.slice(1)}`,
    text: `text${config.textDensity.charAt(0).toUpperCase() + config.textDensity.slice(1)}`
  };
};