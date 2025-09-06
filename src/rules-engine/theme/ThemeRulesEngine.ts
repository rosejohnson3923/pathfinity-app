/**
 * Theme Rules Engine
 * Manages Light/Dark theme rules for data requests and presentation
 */

import { BaseRulesEngine, Rule, RuleContext, RuleResult } from '../core/BaseRulesEngine';

// ============================================================================
// THEME TYPE DEFINITIONS
// ============================================================================

export type ThemeMode = 'light' | 'dark';

export interface ThemeContext extends RuleContext {
  theme: ThemeMode;
  component?: string;
  source?: string;
  dataType?: 'visual' | 'text' | 'interactive' | 'background';
  userPreference?: ThemeMode;
  systemTheme?: ThemeMode;
  timeOfDay?: number; // Hour in 24h format
  ambientLight?: 'bright' | 'normal' | 'dim';
}

export interface ThemeRules {
  colors: ColorRules;
  typography: TypographyRules;
  spacing: SpacingRules;
  shadows: ShadowRules;
  borders: BorderRules;
  animations: AnimationRules;
  dataRequests: DataRequestRules;
}

export interface ColorRules {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export interface TypographyRules {
  fontFamily: string;
  fontSize: {
    small: string;
    medium: string;
    large: string;
  };
  fontWeight: {
    light: number;
    regular: number;
    bold: number;
  };
  lineHeight: number;
}

export interface SpacingRules {
  base: number;
  small: string;
  medium: string;
  large: string;
}

export interface ShadowRules {
  none: string;
  small: string;
  medium: string;
  large: string;
  glow?: string; // For dark theme
}

export interface BorderRules {
  width: string;
  radius: {
    small: string;
    medium: string;
    large: string;
  };
  color: string;
}

export interface AnimationRules {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: string;
  transition: string;
}

export interface DataRequestRules {
  apiEndpoints: {
    images: string;
    colors: string;
    content: string;
  };
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
  };
  preferences: {
    imageStyle: 'light' | 'dark' | 'vibrant' | 'muted';
    iconSet: string;
    visualComplexity: 'simple' | 'moderate' | 'detailed';
  };
}

export interface ComponentThemeOverride {
  component: string;
  theme: ThemeMode;
  overrides: Partial<ThemeRules>;
}

// ============================================================================
// THEME RULES ENGINE
// ============================================================================

export class ThemeRulesEngine extends BaseRulesEngine<ThemeContext> {
  private themes: Map<ThemeMode, ThemeRules> = new Map();
  private componentOverrides: Map<string, ComponentThemeOverride[]> = new Map();
  private authorizedSources: Set<string> = new Set([
    'DashboardModal',
    'StudentDashboard',
    'SettingsModal',
    'MasterAIRulesEngine',
    'system'
  ]);

  constructor() {
    super('ThemeRulesEngine', {
      name: 'Theme Rules Engine',
      description: 'Manages theme rules for data requests and visual presentation'
    });
    
    this.initializeThemes();
    this.initializeComponentOverrides();
  }

  /**
   * Register theme-specific rules
   */
  protected registerRules(): void {
    // Rule: Validate theme source
    this.addRuleInternal({
      id: 'validate_source',
      name: 'Validate Theme Source',
      priority: 1,
      condition: (context) => !!context.source,
      action: (context) => this.validateSource(context)
    });

    // Rule: Apply theme based on context
    this.addRuleInternal({
      id: 'apply_theme',
      name: 'Apply Theme Rules',
      priority: 2,
      condition: (context) => !!context.theme,
      action: (context) => this.applyTheme(context)
    });

    // Rule: Apply component-specific overrides
    this.addRuleInternal({
      id: 'component_overrides',
      name: 'Apply Component Overrides',
      priority: 3,
      condition: (context) => !!context.component,
      action: (context) => this.applyComponentOverrides(context)
    });

    // Rule: Optimize data requests for theme
    this.addRuleInternal({
      id: 'optimize_data',
      name: 'Optimize Data Requests',
      priority: 4,
      condition: (context) => !!context.dataType,
      action: (context) => this.optimizeDataRequests(context)
    });

    // Rule: Auto-adjust based on time
    this.addRuleInternal({
      id: 'time_adjustment',
      name: 'Time-based Theme Adjustment',
      priority: 5,
      condition: (context) => context.timeOfDay !== undefined,
      action: (context) => this.adjustForTimeOfDay(context)
    });

    // Rule: Ambient light adjustment
    this.addRuleInternal({
      id: 'ambient_adjustment',
      name: 'Ambient Light Adjustment',
      priority: 6,
      condition: (context) => !!context.ambientLight,
      action: (context) => this.adjustForAmbientLight(context)
    });

    // Rule: Accessibility enhancements
    this.addRuleInternal({
      id: 'accessibility',
      name: 'Apply Accessibility Enhancements',
      priority: 7,
      condition: (context) => true,
      action: (context) => this.applyAccessibilityEnhancements(context)
    });
  }

  /**
   * Initialize light and dark themes
   */
  private initializeThemes(): void {
    // Light Theme
    this.themes.set('light', {
      colors: {
        primary: '#6366F1',
        secondary: '#8B5CF6',
        background: '#FFFFFF',
        surface: '#F9FAFB',
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          disabled: '#9CA3AF'
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6'
        }
      },
      typography: {
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        fontSize: {
          small: '0.875rem',
          medium: '1rem',
          large: '1.25rem'
        },
        fontWeight: {
          light: 300,
          regular: 400,
          bold: 600
        },
        lineHeight: 1.5
      },
      spacing: {
        base: 4,
        small: '0.5rem',
        medium: '1rem',
        large: '2rem'
      },
      shadows: {
        none: 'none',
        small: '0 1px 3px rgba(0, 0, 0, 0.1)',
        medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
        large: '0 10px 25px rgba(0, 0, 0, 0.1)'
      },
      borders: {
        width: '1px',
        radius: {
          small: '0.25rem',
          medium: '0.5rem',
          large: '1rem'
        },
        color: '#E5E7EB'
      },
      animations: {
        duration: {
          fast: '150ms',
          normal: '300ms',
          slow: '500ms'
        },
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
      },
      dataRequests: {
        apiEndpoints: {
          images: '/api/images/light',
          colors: '/api/colors/light',
          content: '/api/content/light'
        },
        filters: {
          brightness: 1.0,
          contrast: 1.0,
          saturation: 1.0
        },
        preferences: {
          imageStyle: 'light',
          iconSet: 'outlined',
          visualComplexity: 'moderate'
        }
      }
    });

    // Dark Theme
    this.themes.set('dark', {
      colors: {
        primary: '#818CF8',
        secondary: '#A78BFA',
        background: '#0F172A',
        surface: '#1E293B',
        text: {
          primary: '#F3F4F6',
          secondary: '#D1D5DB',
          disabled: '#6B7280'
        },
        status: {
          success: '#34D399',
          warning: '#FBBF24',
          error: '#F87171',
          info: '#60A5FA'
        }
      },
      typography: {
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        fontSize: {
          small: '0.875rem',
          medium: '1rem',
          large: '1.25rem'
        },
        fontWeight: {
          light: 300,
          regular: 400,
          bold: 600
        },
        lineHeight: 1.5
      },
      spacing: {
        base: 4,
        small: '0.5rem',
        medium: '1rem',
        large: '2rem'
      },
      shadows: {
        none: 'none',
        small: '0 1px 3px rgba(0, 0, 0, 0.3)',
        medium: '0 4px 6px rgba(0, 0, 0, 0.3)',
        large: '0 10px 25px rgba(0, 0, 0, 0.3)',
        glow: '0 0 20px rgba(129, 140, 248, 0.3)'
      },
      borders: {
        width: '1px',
        radius: {
          small: '0.25rem',
          medium: '0.5rem',
          large: '1rem'
        },
        color: '#374151'
      },
      animations: {
        duration: {
          fast: '150ms',
          normal: '300ms',
          slow: '500ms'
        },
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)'
      },
      dataRequests: {
        apiEndpoints: {
          images: '/api/images/dark',
          colors: '/api/colors/dark',
          content: '/api/content/dark'
        },
        filters: {
          brightness: 0.8,
          contrast: 1.1,
          saturation: 0.9
        },
        preferences: {
          imageStyle: 'dark',
          iconSet: 'filled',
          visualComplexity: 'simple'
        }
      }
    });
  }

  /**
   * Initialize component-specific overrides
   */
  private initializeComponentOverrides(): void {
    // AILearnContainer overrides
    this.componentOverrides.set('AILearnContainer', [
      {
        component: 'AILearnContainer',
        theme: 'dark',
        overrides: {
          colors: {
            background: '#1A202C',
            surface: '#2D3748'
          } as Partial<ColorRules>
        } as Partial<ThemeRules>
      }
    ]);

    // VisualRenderer overrides
    this.componentOverrides.set('VisualRenderer', [
      {
        component: 'VisualRenderer',
        theme: 'light',
        overrides: {
          colors: {
            background: '#F9FAFB'
          } as Partial<ColorRules>,
          borders: {
            color: '#D1D5DB'
          } as Partial<BorderRules>
        } as Partial<ThemeRules>
      },
      {
        component: 'VisualRenderer',
        theme: 'dark',
        overrides: {
          colors: {
            background: 'rgba(45, 55, 72, 0.8)'
          } as Partial<ColorRules>,
          borders: {
            color: 'rgba(75, 85, 99, 0.3)'
          } as Partial<BorderRules>,
          shadows: {
            glow: '0 0 15px rgba(129, 140, 248, 0.2)'
          } as Partial<ShadowRules>
        } as Partial<ThemeRules>
      }
    ]);

    // Toast Notifications overrides
    this.componentOverrides.set('ToastNotification', [
      {
        component: 'ToastNotification',
        theme: 'dark',
        overrides: {
          colors: {
            background: 'rgba(30, 41, 59, 0.95)',
            text: {
              primary: '#F3F4F6'
            }
          } as Partial<ColorRules>,
          shadows: {
            large: '0 10px 40px rgba(0, 0, 0, 0.5)'
          } as Partial<ShadowRules>
        } as Partial<ThemeRules>
      }
    ]);

    // AI Companion Chat overrides
    this.componentOverrides.set('AICompanionChat', [
      {
        component: 'AICompanionChat',
        theme: 'light',
        overrides: {
          colors: {
            surface: '#E5E7EB'
          } as Partial<ColorRules>
        } as Partial<ThemeRules>
      },
      {
        component: 'AICompanionChat',
        theme: 'dark',
        overrides: {
          colors: {
            surface: '#374151'
          } as Partial<ColorRules>
        } as Partial<ThemeRules>
      }
    ]);

    // Dashboard overrides
    this.componentOverrides.set('Dashboard', [
      {
        component: 'Dashboard',
        theme: 'dark',
        overrides: {
          dataRequests: {
            preferences: {
              visualComplexity: 'detailed'
            }
          } as Partial<DataRequestRules>
        } as Partial<ThemeRules>
      }
    ]);
  }

  // Rule action methods

  private validateSource(context: ThemeContext): RuleResult {
    if (!context.source || !this.authorizedSources.has(context.source)) {
      return {
        success: false,
        error: `Unauthorized theme source: ${context.source}`,
        warnings: ['Theme changes must come from authorized sources']
      };
    }

    return {
      success: true,
      data: { sourceValidated: true }
    };
  }

  private applyTheme(context: ThemeContext): RuleResult {
    const theme = this.themes.get(context.theme);
    if (!theme) {
      return {
        success: false,
        error: `Unknown theme: ${context.theme}`
      };
    }

    return {
      success: true,
      data: {
        theme: context.theme,
        rules: theme,
        appliedAt: new Date()
      }
    };
  }

  private applyComponentOverrides(context: ThemeContext): RuleResult {
    const overrides = this.componentOverrides.get(context.component || '');
    if (!overrides) {
      return {
        success: true,
        data: { message: 'No overrides for component' }
      };
    }

    const themeOverride = overrides.find(o => o.theme === context.theme);
    if (!themeOverride) {
      return {
        success: true,
        data: { message: 'No theme-specific overrides' }
      };
    }

    const baseTheme = this.themes.get(context.theme);
    if (!baseTheme) {
      return {
        success: false,
        error: 'Base theme not found'
      };
    }

    // Merge overrides with base theme
    const mergedTheme = this.mergeThemeRules(baseTheme, themeOverride.overrides);

    return {
      success: true,
      data: {
        component: context.component,
        theme: context.theme,
        rules: mergedTheme,
        hasOverrides: true
      }
    };
  }

  private optimizeDataRequests(context: ThemeContext): RuleResult {
    const theme = this.themes.get(context.theme);
    if (!theme) {
      return {
        success: false,
        error: 'Theme not found'
      };
    }

    const optimization: any = {
      dataType: context.dataType,
      theme: context.theme
    };

    switch (context.dataType) {
      case 'visual':
        optimization.endpoint = theme.dataRequests.apiEndpoints.images;
        optimization.filters = theme.dataRequests.filters;
        optimization.style = theme.dataRequests.preferences.imageStyle;
        break;
      
      case 'text':
        optimization.colors = {
          primary: theme.colors.text.primary,
          secondary: theme.colors.text.secondary
        };
        optimization.readability = context.theme === 'dark' ? 'high-contrast' : 'standard';
        break;
      
      case 'interactive':
        optimization.animations = theme.animations;
        optimization.feedback = {
          hover: context.theme === 'dark' ? 'glow' : 'shadow',
          active: context.theme === 'dark' ? 'brighten' : 'darken'
        };
        break;
      
      case 'background':
        optimization.color = theme.colors.background;
        optimization.pattern = context.theme === 'dark' ? 'subtle-gradient' : 'solid';
        break;
    }

    return {
      success: true,
      data: optimization
    };
  }

  private adjustForTimeOfDay(context: ThemeContext): RuleResult {
    const hour = context.timeOfDay || new Date().getHours();
    let suggestedTheme: ThemeMode;
    let adjustment: any = {};

    if (hour >= 6 && hour < 18) {
      // Daytime
      suggestedTheme = 'light';
      adjustment = {
        brightness: 1.0,
        recommendation: 'Use light theme during daytime'
      };
    } else {
      // Evening/Night
      suggestedTheme = 'dark';
      adjustment = {
        brightness: 0.8,
        blueLight: 'reduced',
        recommendation: 'Use dark theme in evening'
      };
    }

    // Only suggest if user hasn't explicitly set preference
    if (!context.userPreference) {
      return {
        success: true,
        data: {
          suggestedTheme,
          currentTheme: context.theme,
          adjustment,
          reason: 'time-based'
        }
      };
    }

    return {
      success: true,
      data: {
        currentTheme: context.theme,
        userPreference: context.userPreference,
        adjustment
      }
    };
  }

  private adjustForAmbientLight(context: ThemeContext): RuleResult {
    const adjustments: Record<string, any> = {
      bright: {
        theme: 'light',
        brightness: 1.1,
        contrast: 1.05
      },
      normal: {
        theme: context.theme,
        brightness: 1.0,
        contrast: 1.0
      },
      dim: {
        theme: 'dark',
        brightness: 0.9,
        contrast: 1.1
      }
    };

    const adjustment = adjustments[context.ambientLight || 'normal'];

    return {
      success: true,
      data: {
        ambientLight: context.ambientLight,
        adjustment,
        applied: true
      }
    };
  }

  private applyAccessibilityEnhancements(context: ThemeContext): RuleResult {
    const enhancements: any = {
      theme: context.theme,
      accessibility: {
        highContrast: false,
        reducedMotion: false,
        largeText: false
      }
    };

    if (context.theme === 'dark') {
      enhancements.accessibility.highContrast = true;
      enhancements.minContrastRatio = 7.0; // WCAG AAA
    } else {
      enhancements.minContrastRatio = 4.5; // WCAG AA
    }

    // Check for accessibility preferences
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        enhancements.accessibility.reducedMotion = true;
        enhancements.animations = {
          duration: { fast: '0ms', normal: '0ms', slow: '0ms' }
        };
      }
    }

    return {
      success: true,
      data: enhancements
    };
  }

  /**
   * Merge theme rules with overrides
   */
  private mergeThemeRules(base: ThemeRules, overrides: Partial<ThemeRules>): ThemeRules {
    return {
      colors: { ...base.colors, ...overrides.colors } as ColorRules,
      typography: { ...base.typography, ...overrides.typography } as TypographyRules,
      spacing: { ...base.spacing, ...overrides.spacing } as SpacingRules,
      shadows: { ...base.shadows, ...overrides.shadows } as ShadowRules,
      borders: { ...base.borders, ...overrides.borders } as BorderRules,
      animations: { ...base.animations, ...overrides.animations } as AnimationRules,
      dataRequests: { ...base.dataRequests, ...overrides.dataRequests } as DataRequestRules
    };
  }

  // Public methods

  /**
   * Get theme rules
   */
  public getTheme(mode: ThemeMode): ThemeRules | undefined {
    return this.themes.get(mode);
  }

  /**
   * Get theme for component
   */
  public getComponentTheme(component: string, mode: ThemeMode): ThemeRules | undefined {
    const baseTheme = this.themes.get(mode);
    if (!baseTheme) return undefined;

    const overrides = this.componentOverrides.get(component);
    if (!overrides) return baseTheme;

    const themeOverride = overrides.find(o => o.theme === mode);
    if (!themeOverride) return baseTheme;

    return this.mergeThemeRules(baseTheme, themeOverride.overrides);
  }

  /**
   * Get data request configuration
   */
  public getDataRequestConfig(mode: ThemeMode, dataType: string): any {
    const theme = this.themes.get(mode);
    if (!theme) return null;

    return {
      endpoint: theme.dataRequests.apiEndpoints[dataType as keyof typeof theme.dataRequests.apiEndpoints],
      filters: theme.dataRequests.filters,
      preferences: theme.dataRequests.preferences
    };
  }

  /**
   * Register authorized source
   */
  public addAuthorizedSource(source: string): void {
    this.authorizedSources.add(source);
    console.log(`✅ Added authorized theme source: ${source}`);
  }

  /**
   * Register component override
   */
  public addComponentOverride(override: ComponentThemeOverride): void {
    const overrides = this.componentOverrides.get(override.component) || [];
    overrides.push(override);
    this.componentOverrides.set(override.component, overrides);
    console.log(`✅ Added theme override for component: ${override.component}`);
  }

  /**
   * Get CSS variables for theme
   */
  public getCSSVariables(mode: ThemeMode): Record<string, string> {
    const theme = this.themes.get(mode);
    if (!theme) return {};

    return {
      '--color-primary': theme.colors.primary,
      '--color-secondary': theme.colors.secondary,
      '--color-background': theme.colors.background,
      '--color-surface': theme.colors.surface,
      '--color-text-primary': theme.colors.text.primary,
      '--color-text-secondary': theme.colors.text.secondary,
      '--color-text-disabled': theme.colors.text.disabled,
      '--color-success': theme.colors.status.success,
      '--color-warning': theme.colors.status.warning,
      '--color-error': theme.colors.status.error,
      '--color-info': theme.colors.status.info,
      '--shadow-small': theme.shadows.small,
      '--shadow-medium': theme.shadows.medium,
      '--shadow-large': theme.shadows.large,
      '--border-radius-small': theme.borders.radius.small,
      '--border-radius-medium': theme.borders.radius.medium,
      '--border-radius-large': theme.borders.radius.large,
      '--animation-fast': theme.animations.duration.fast,
      '--animation-normal': theme.animations.duration.normal,
      '--animation-slow': theme.animations.duration.slow
    };
  }
}

// Export singleton instance
export const themeRulesEngine = new ThemeRulesEngine();