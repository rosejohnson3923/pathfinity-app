/**
 * UI Compliance Engine
 * Ensures all content adheres to UI guidelines, accessibility standards, and container theming
 */

import {
  ContainerType,
  UICompliance,
  GradeLevel,
  ModalTypeEnum,
  DeviceContext,
  ColorScheme,
  GradientDefinition,
  TypographyScale,
  ContainerBranding
} from '../types';

export class UIComplianceEngine {
  
  /**
   * Container-specific color schemes following purple-indigo theme
   */
  private containerColorSchemes = new Map<ContainerType, ColorScheme>([
    ['LEARN', {
      primary: '#8B5CF6',    // Purple-600
      secondary: '#6366F1',  // Indigo-600
      accent: '#7C3AED',     // Violet-600
      background: '#FAFAF9', // Neutral-50
      text: '#18181B'        // Neutral-900
    }],
    ['EXPERIENCE', {
      primary: '#6366F1',    // Indigo-600
      secondary: '#3B82F6',  // Blue-600
      accent: '#8B5CF6',     // Purple-600
      background: '#F8FAFC', // Slate-50
      text: '#0F172A'        // Slate-900
    }],
    ['DISCOVER', {
      primary: '#7C3AED',    // Violet-600
      secondary: '#8B5CF6',  // Purple-600
      accent: '#A855F7',     // Purple-500
      background: '#FEFEFE', // White-ish
      text: '#111827'        // Gray-900
    }]
  ]);

  /**
   * Container-specific gradients
   */
  private containerGradients = new Map<ContainerType, GradientDefinition>([
    ['LEARN', 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)'],
    ['EXPERIENCE', 'linear-gradient(135deg, #6366F1 0%, #3B82F6 100%)'],
    ['DISCOVER', 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)']
  ]);

  /**
   * Grade-level typography scales
   */
  private gradeTypographyScales = new Map<GradeLevel, TypographyScale>([
    ['K-2', {
      sm: 16,
      base: 18,
      lg: 22,
      xl: 26,
      '2xl': 30,
      '3xl': 36
    }],
    ['3-5', {
      sm: 14,
      base: 16,
      lg: 20,
      xl: 24,
      '2xl': 28,
      '3xl': 32
    }],
    ['6-8', {
      sm: 14,
      base: 16,
      lg: 18,
      xl: 22,
      '2xl': 26,
      '3xl': 30
    }],
    ['9-12', {
      sm: 13,
      base: 15,
      lg: 17,
      xl: 20,
      '2xl': 24,
      '3xl': 28
    }]
  ]);

  /**
   * Modal-specific theming adjustments
   */
  private modalThemeAdjustments = new Map<ModalTypeEnum, any>([
    [ModalTypeEnum.CODE_EDITOR, {
      fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
      lineHeight: 1.6,
      darkModeDefault: true,
      syntaxHighlighting: true
    }],
    [ModalTypeEnum.MATH_INPUT, {
      fontFamily: 'STIX Two Math, Times New Roman, serif',
      mathDisplay: true,
      equationSpacing: 1.8
    }],
    [ModalTypeEnum.DRAWING, {
      minCanvasSize: { width: 400, height: 300 },
      toolbarPosition: 'left',
      touchOptimized: true
    }],
    [ModalTypeEnum.GRAPH_CHART, {
      gridDisplay: true,
      axisLabels: true,
      interactiveZoom: true
    }]
  ]);

  /**
   * Generate complete UI compliance metadata
   */
  public generateUICompliance(
    container: ContainerType = 'LEARN',
    gradeLevel: GradeLevel = '6-8',
    modalType: ModalTypeEnum,
    deviceContext?: DeviceContext,
    darkMode: boolean = false,
    studentAccessibility?: any
  ): UICompliance {
    
    const colorScheme = this.getColorScheme(container, darkMode);
    const typography = this.getTypography(gradeLevel, modalType);
    const branding = this.getBranding(container);
    const accessibility = this.getAccessibility(
      gradeLevel,
      deviceContext,
      studentAccessibility
    );

    return {
      container,
      theme: {
        colorScheme,
        gradients: this.getGradients(container),
        darkModeSupport: true,
        contrastCompliant: this.validateContrast(colorScheme)
      },
      typography,
      branding,
      accessibility
    };
  }

  /**
   * Get color scheme for container with dark mode support
   */
  private getColorScheme(
    container: ContainerType,
    darkMode: boolean
  ): ColorScheme {
    const baseScheme = this.containerColorSchemes.get(container) || 
                      this.containerColorSchemes.get('LEARN')!;
    
    if (!darkMode) {
      return baseScheme;
    }

    // Dark mode transformation
    return {
      primary: this.lightenColor(baseScheme.primary, 10),
      secondary: this.lightenColor(baseScheme.secondary, 10),
      accent: this.lightenColor(baseScheme.accent, 15),
      background: '#0A0A0B', // Nearly black
      text: '#FAFAFA'        // Nearly white
    };
  }

  /**
   * Get typography configuration
   */
  private getTypography(
    gradeLevel: GradeLevel,
    modalType: ModalTypeEnum
  ): any {
    const baseScale = this.gradeTypographyScales.get(gradeLevel) || 
                     this.gradeTypographyScales.get('6-8')!;
    
    const modalAdjustments = this.modalThemeAdjustments.get(modalType) || {};
    
    return {
      baseSize: baseScale.base,
      scale: baseScale,
      lineHeight: modalAdjustments.lineHeight || this.getLineHeight(gradeLevel),
      responsive: true,
      fontFamily: modalAdjustments.fontFamily || this.getFontFamily(gradeLevel),
      letterSpacing: this.getLetterSpacing(gradeLevel),
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    };
  }

  /**
   * Get branding configuration
   */
  private getBranding(container: ContainerType): any {
    const colorScheme = this.containerColorSchemes.get(container)!;
    const gradient = this.containerGradients.get(container)!;
    
    return {
      primaryColor: colorScheme.primary,
      secondaryColor: colorScheme.secondary,
      accentColor: colorScheme.accent,
      containerSpecific: {
        gradient,
        buttonPrimary: colorScheme.primary,
        buttonSecondary: colorScheme.secondary,
        focus: `ring-2 ring-${this.getColorName(colorScheme.primary)}-500 ring-offset-2`,
        hover: `hover:bg-${this.getColorName(colorScheme.primary)}-700`,
        active: `active:bg-${this.getColorName(colorScheme.primary)}-800`
      }
    };
  }

  /**
   * Get accessibility configuration
   */
  private getAccessibility(
    gradeLevel: GradeLevel,
    deviceContext?: DeviceContext,
    studentAccessibility?: any
  ): any {
    const isTouchDevice = deviceContext?.touchEnabled || false;
    const isMobile = deviceContext?.type === 'mobile';
    const needsLargeTargets = gradeLevel === 'K-2' || gradeLevel === '3-5';
    
    return {
      level: 'AA', // WCAG AA compliance
      touchOptimized: isTouchDevice || needsLargeTargets,
      keyboardNavigable: true,
      screenReaderReady: true,
      focusManagement: true,
      minTouchTarget: needsLargeTargets ? 48 : 44, // pixels
      contrastRatio: {
        normal: 4.5,
        large: 3.0
      },
      ariaSupport: {
        liveRegions: true,
        landmarks: true,
        descriptions: true,
        labels: true
      },
      reducedMotion: studentAccessibility?.prefersReducedMotion || false,
      highContrast: studentAccessibility?.needsHighContrast || false,
      fontSize: {
        adjustable: true,
        min: 12,
        max: 24,
        default: this.getBaseFontSize(gradeLevel)
      },
      colorBlindMode: studentAccessibility?.colorBlindMode || 'none',
      dyslexiaFont: studentAccessibility?.needsDyslexiaFont || false
    };
  }

  /**
   * Get gradients for container
   */
  private getGradients(container: ContainerType): any {
    const gradient = this.containerGradients.get(container);
    
    return {
      primary: gradient,
      secondary: this.getSecondaryGradient(container),
      overlay: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 100%)',
      shine: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)'
    };
  }

  /**
   * Get secondary gradient for container
   */
  private getSecondaryGradient(container: ContainerType): string {
    const gradients = {
      LEARN: 'linear-gradient(135deg, #A78BFA 0%, #818CF8 100%)',
      EXPERIENCE: 'linear-gradient(135deg, #818CF8 0%, #60A5FA 100%)',
      DISCOVER: 'linear-gradient(135deg, #A78BFA 0%, #C084FC 100%)'
    };
    return gradients[container] || gradients.LEARN;
  }

  /**
   * Validate contrast ratios for WCAG compliance
   */
  private validateContrast(colorScheme: ColorScheme): boolean {
    // Calculate contrast ratio between text and background
    const textLuminance = this.getRelativeLuminance(colorScheme.text!);
    const bgLuminance = this.getRelativeLuminance(colorScheme.background!);
    
    const contrast = (Math.max(textLuminance, bgLuminance) + 0.05) /
                     (Math.min(textLuminance, bgLuminance) + 0.05);
    
    // WCAG AA requires 4.5:1 for normal text
    return contrast >= 4.5;
  }

  /**
   * Calculate relative luminance for contrast checking
   */
  private getRelativeLuminance(hex: string): number {
    const rgb = this.hexToRgb(hex);
    const sRGB = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
    
    const linear = sRGB.map(channel => {
      if (channel <= 0.03928) {
        return channel / 12.92;
      }
      return Math.pow((channel + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  }

  /**
   * Convert hex color to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  /**
   * Lighten a color by percentage
   */
  private lightenColor(hex: string, percent: number): string {
    const rgb = this.hexToRgb(hex);
    const factor = percent / 100;
    
    const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * factor));
    const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * factor));
    const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * factor));
    
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  /**
   * Get color name from hex for Tailwind classes
   */
  private getColorName(hex: string): string {
    const colorMap = {
      '#8B5CF6': 'purple',
      '#6366F1': 'indigo',
      '#7C3AED': 'violet',
      '#3B82F6': 'blue',
      '#A855F7': 'purple'
    };
    return colorMap[hex] || 'purple';
  }

  /**
   * Get line height based on grade level
   */
  private getLineHeight(gradeLevel: GradeLevel): number {
    const lineHeights = {
      'K-2': 1.8,
      '3-5': 1.6,
      '6-8': 1.5,
      '9-12': 1.5
    };
    return lineHeights[gradeLevel] || 1.5;
  }

  /**
   * Get font family based on grade level
   */
  private getFontFamily(gradeLevel: GradeLevel): string {
    if (gradeLevel === 'K-2') {
      return 'Comic Neue, Comic Sans MS, sans-serif'; // More playful for young learners
    }
    return '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  }

  /**
   * Get letter spacing based on grade level
   */
  private getLetterSpacing(gradeLevel: GradeLevel): string {
    const spacing = {
      'K-2': '0.05em',  // Wider spacing for better readability
      '3-5': '0.025em',
      '6-8': 'normal',
      '9-12': 'normal'
    };
    return spacing[gradeLevel] || 'normal';
  }

  /**
   * Get base font size for grade level
   */
  private getBaseFontSize(gradeLevel: GradeLevel): number {
    const sizes = {
      'K-2': 18,
      '3-5': 16,
      '6-8': 16,
      '9-12': 15
    };
    return sizes[gradeLevel] || 16;
  }

  /**
   * Apply modal-specific styling rules
   */
  public applyModalStyling(
    modalType: ModalTypeEnum,
    baseStyles: any
  ): any {
    const modalStyles = { ...baseStyles };
    
    switch (modalType) {
      case ModalTypeEnum.CODE_EDITOR:
        modalStyles.backgroundColor = '#1E1E1E';
        modalStyles.color = '#D4D4D4';
        modalStyles.borderRadius = '8px';
        modalStyles.padding = '16px';
        break;
        
      case ModalTypeEnum.MATH_INPUT:
        modalStyles.fontFamily = 'STIX Two Math, serif';
        modalStyles.fontSize = '18px';
        break;
        
      case ModalTypeEnum.DRAWING:
        modalStyles.cursor = 'crosshair';
        modalStyles.userSelect = 'none';
        break;
        
      case ModalTypeEnum.VOICE:
        modalStyles.minHeight = '200px';
        modalStyles.display = 'flex';
        modalStyles.alignItems = 'center';
        modalStyles.justifyContent = 'center';
        break;
    }
    
    return modalStyles;
  }

  /**
   * Generate focus styles for accessibility
   */
  public generateFocusStyles(container: ContainerType): any {
    const colorScheme = this.containerColorSchemes.get(container)!;
    
    return {
      outline: 'none',
      boxShadow: `0 0 0 3px ${this.lightenColor(colorScheme.primary, 60)}`,
      borderColor: colorScheme.primary
    };
  }

  /**
   * Generate hover styles
   */
  public generateHoverStyles(container: ContainerType): any {
    const colorScheme = this.containerColorSchemes.get(container)!;
    
    return {
      backgroundColor: this.lightenColor(colorScheme.primary, 90),
      transform: 'translateY(-1px)',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    };
  }

  /**
   * Validate UI compliance for production
   */
  public validateCompliance(uiCompliance: UICompliance): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    // Check WCAG compliance
    if (uiCompliance.accessibility.level !== 'AA' && 
        uiCompliance.accessibility.level !== 'AAA') {
      issues.push('Accessibility level must be WCAG AA or AAA');
    }
    
    // Check contrast compliance
    if (!uiCompliance.theme.contrastCompliant) {
      issues.push('Color scheme does not meet WCAG contrast requirements');
    }
    
    // Check keyboard navigation
    if (!uiCompliance.accessibility.keyboardNavigable) {
      issues.push('Content must be keyboard navigable');
    }
    
    // Check screen reader support
    if (!uiCompliance.accessibility.screenReaderReady) {
      issues.push('Content must be screen reader compatible');
    }
    
    // Check responsive typography
    if (!uiCompliance.typography.responsive) {
      issues.push('Typography must be responsive');
    }
    
    // Check touch targets for mobile
    if (uiCompliance.accessibility.touchOptimized) {
      const minSize = (uiCompliance.accessibility as any).minTouchTarget;
      if (!minSize || minSize < 44) {
        issues.push('Touch targets must be at least 44x44 pixels');
      }
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Generate CSS variables for theming
   */
  public generateCSSVariables(uiCompliance: UICompliance): string {
    const variables = [];
    
    // Color variables
    variables.push(`--color-primary: ${uiCompliance.branding.primaryColor};`);
    variables.push(`--color-secondary: ${uiCompliance.branding.secondaryColor};`);
    variables.push(`--color-accent: ${uiCompliance.branding.accentColor};`);
    
    // Typography variables
    variables.push(`--font-size-base: ${uiCompliance.typography.baseSize}px;`);
    variables.push(`--line-height: ${uiCompliance.typography.lineHeight};`);
    
    // Spacing variables
    variables.push(`--spacing-unit: 4px;`);
    variables.push(`--border-radius: 8px;`);
    
    // Animation variables
    variables.push(`--transition-speed: 200ms;`);
    variables.push(`--animation-easing: cubic-bezier(0.4, 0, 0.2, 1);`);
    
    return `:root {\n  ${variables.join('\n  ')}\n}`;
  }
}

// Singleton export
export const uiComplianceEngine = new UIComplianceEngine();