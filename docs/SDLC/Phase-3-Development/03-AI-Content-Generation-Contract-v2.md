# AI Content Generation Contract Specification v2.0
## Enhanced with Modal Dimensions & UI Compliance

**Document Version:** 2.0  
**Last Updated:** January 2025  
**Status:** Technical Specification - ENHANCED  
**Owner:** AI/ML Architecture Lead  
**Purpose:** Complete contract specification including dimensional hints, UI compliance, and overflow prevention

---

## Executive Summary

This enhanced version of the AI Content Generation Contract adds critical dimensional intelligence and UI compliance requirements. The AI engine must now analyze content volume, predict optimal modal dimensions, specify overflow strategies, and ensure brand guideline compliance. This prevents UI breaking issues and ensures consistent user experience.

---

## 1. Enhanced Universal Response Structure

### 1.1 Complete Response Schema v2.0

```typescript
interface AIContentResponseV2 {
  // ============ CORE FIELDS (v1.0) ============
  contentId: string;
  modalType: ModalTypeEnum;
  contentType: ContentTypeEnum;
  version: '2.0';                      // Updated version
  timestamp: string;
  
  // ============ CONTENT PAYLOAD (Enhanced) ============
  content: {
    data: any;                         // Type-specific content data
    metadata: ContentMetadata;
    validation: ValidationRules;
    display: DisplayConfiguration;     // Enhanced in v2.0
    
    // NEW: Content volume metrics
    volume: ContentVolumeMetrics;
  };
  
  // ============ NEW: DIMENSIONAL INTELLIGENCE ============
  dimensions: {
    recommended: {
      width: number | string;          // px or % (e.g., 800 or '75%')
      height: number | string;         // px or % (e.g., 600 or 'auto')
      aspectRatio?: string;            // e.g., '16:9', '4:3'
    };
    
    constraints: {
      minWidth: number;                // Minimum modal width in px
      maxWidth: number;                // Maximum modal width in px
      minHeight: number;               // Minimum modal height in px
      maxHeight: number | string;      // Maximum height (px or 'vh')
      maintainAspectRatio: boolean;
    };
    
    responsive: {
      breakpoints: ResponsiveBreakpoint[];
      mobileFullScreen: boolean;
      reflow: ReflowStrategy;
    };
    
    overflow: {
      predicted: boolean;              // Will content overflow?
      strategy: OverflowStrategy;     // How to handle overflow
      threshold: ContentThreshold;    // When to trigger strategy
      fallback: OverflowStrategy;     // Backup strategy
    };
    
    contentFit: {
      optimal: boolean;                // Content fits perfectly
      adjustments: SizeAdjustment[];  // Required adjustments
      warnings: string[];              // Potential issues
    };
  };
  
  // ============ NEW: UI COMPLIANCE ============
  uiCompliance: {
    container: 'LEARN' | 'EXPERIENCE' | 'DISCOVER';
    theme: {
      colorScheme: ColorScheme;
      gradients: GradientDefinition;
      darkModeSupport: boolean;
      contrastCompliant: boolean;     // WCAG AA compliance
    };
    
    typography: {
      baseSize: number;                // Base font size
      scale: TypographyScale;          // Size hierarchy
      lineHeight: number;              // Line height multiplier
      responsive: boolean;             // Responsive text sizing
    };
    
    branding: {
      primaryColor: string;            // From UI guidelines
      secondaryColor: string;
      accentColor: string;
      containerSpecific: ContainerBranding;
    };
    
    accessibility: {
      level: 'A' | 'AA' | 'AAA';
      touchOptimized: boolean;
      keyboardNavigable: boolean;
      screenReaderReady: boolean;
      focusManagement: boolean;
    };
  };
  
  // ============ CONTEXT (Enhanced) ============
  context: {
    studentId: string;
    sessionId: string;
    lessonId: string;
    career: string;
    gradeLevel: string;
    subject: string;
    difficulty: number;
    generatedBy: string;
    
    // NEW: Device context
    device: {
      type: 'mobile' | 'tablet' | 'desktop';
      viewport: { width: number; height: number };
      orientation: 'portrait' | 'landscape';
      touchEnabled: boolean;
      pixelRatio: number;
    };
  };
  
  // ============ EVALUATION (Enhanced) ============
  evaluation: {
    scoringMethod: ScoringMethodEnum;
    pointValue: number;
    partialCredit: boolean;
    rubric?: Rubric;
    feedback: FeedbackConfiguration;
    
    // NEW: Time estimates
    estimatedTime: {
      minimum: number;                 // Seconds
      optimal: number;
      maximum: number;
    };
  };
  
  // ============ PERFORMANCE HINTS (Enhanced) ============
  performance: {
    preloadAssets: string[];
    estimatedLoadTime: number;
    cacheStrategy: 'aggressive' | 'normal' | 'none';
    
    // NEW: Rendering hints
    rendering: {
      priority: 'immediate' | 'lazy' | 'background';
      virtualScroll: boolean;
      chunking: boolean;
      chunkSize?: number;
    };
  };
}
```

### 1.2 Content Volume Metrics

```typescript
interface ContentVolumeMetrics {
  // Text metrics
  text: {
    totalCharacters: number;
    wordCount: number;
    paragraphs: number;
    readingTime: number;               // Estimated seconds
    complexity: 'simple' | 'moderate' | 'complex';
  };
  
  // Interactive elements
  elements: {
    totalItems: number;                // Total interactive items
    visibleItems: number;              // Items visible without scroll
    itemsPerPage?: number;             // If paginated
    interactionPoints: number;         // Clickable/draggable areas
  };
  
  // Media content
  media: {
    images: number;
    videos: number;
    audioClips: number;
    totalSizeMB: number;
    largestAssetMB: number;
  };
  
  // Complexity score
  complexity: {
    score: number;                     // 1-10 scale
    factors: string[];                 // What contributes to complexity
    cognitiveLoad: 'low' | 'medium' | 'high';
  };
}
```

---

## 2. Dimensional Intelligence Implementation

### 2.1 Dimension Calculation Engine

```typescript
class DimensionCalculationEngine {
  /**
   * Calculate optimal dimensions based on content analysis
   */
  calculateDimensions(
    content: ContentData,
    modalType: ModalTypeEnum,
    deviceContext: DeviceContext
  ): DimensionalHints {
    
    // Step 1: Analyze content volume
    const volume = this.analyzeVolume(content);
    
    // Step 2: Get base dimensions for modal type
    const baseDimensions = this.getBaseDimensions(modalType);
    
    // Step 3: Apply content-based adjustments
    const adjusted = this.adjustForContent(baseDimensions, volume);
    
    // Step 4: Check for overflow
    const overflow = this.predictOverflow(adjusted, volume, deviceContext);
    
    // Step 5: Apply responsive constraints
    const responsive = this.applyResponsiveRules(adjusted, deviceContext);
    
    // Step 6: Ensure UI guideline compliance
    const compliant = this.ensureCompliance(responsive);
    
    return {
      recommended: compliant.optimal,
      constraints: compliant.limits,
      responsive: compliant.breakpoints,
      overflow: overflow,
      contentFit: this.assessFit(compliant, volume)
    };
  }
  
  /**
   * Content-specific dimension adjustments
   */
  private adjustForContent(
    base: BaseDimensions,
    volume: ContentVolumeMetrics
  ): AdjustedDimensions {
    
    const adjustments = {
      // Text-heavy content
      textAdjustment: () => {
        const factor = Math.min(1.5, 1 + (volume.text.wordCount / 500) * 0.2);
        return {
          width: base.width * factor,
          height: base.height * Math.min(1.8, factor * 1.2)
        };
      },
      
      // Option-based content (multiple choice, etc.)
      optionAdjustment: () => {
        const optionHeight = 60; // px per option
        const visibleOptions = Math.min(6, volume.elements.totalItems);
        return {
          width: base.width,
          height: Math.max(
            base.minHeight,
            200 + (visibleOptions * optionHeight) + 100 // header + options + footer
          )
        };
      },
      
      // Media-rich content
      mediaAdjustment: () => {
        const hasLargeMedia = volume.media.largestAssetMB > 1;
        const mediaFactor = hasLargeMedia ? 1.4 : 1.2;
        return {
          width: base.width * mediaFactor,
          height: base.height * mediaFactor,
          aspectRatio: volume.media.videos > 0 ? '16:9' : null
        };
      },
      
      // Interactive content (drag-drop, drawing, etc.)
      interactiveAdjustment: () => {
        const interactionDensity = volume.elements.interactionPoints / volume.elements.totalItems;
        const spaceFactor = interactionDensity > 0.5 ? 1.3 : 1.1;
        return {
          width: Math.max(800, base.width * spaceFactor),
          height: Math.max(600, base.height * spaceFactor)
        };
      }
    };
    
    // Apply appropriate adjustment based on content type
    return this.selectAdjustment(adjustments, volume);
  }
  
  /**
   * Overflow prediction and strategy selection
   */
  private predictOverflow(
    dimensions: AdjustedDimensions,
    volume: ContentVolumeMetrics,
    device: DeviceContext
  ): OverflowPrediction {
    
    const willOverflow = {
      vertical: dimensions.height > (device.viewport.height * 0.8),
      horizontal: dimensions.width > (device.viewport.width * 0.9),
      content: volume.elements.totalItems > volume.elements.visibleItems
    };
    
    // Select strategy based on overflow type and content
    let strategy: OverflowStrategy = 'none';
    
    if (willOverflow.vertical || willOverflow.content) {
      if (volume.elements.totalItems > 10) {
        strategy = 'paginate';
      } else if (volume.text.paragraphs > 5) {
        strategy = 'accordion';
      } else {
        strategy = 'scroll';
      }
    }
    
    if (willOverflow.horizontal) {
      if (device.type === 'mobile') {
        strategy = 'tabs';
      } else {
        strategy = 'horizontal-scroll';
      }
    }
    
    return {
      predicted: Object.values(willOverflow).some(v => v),
      strategy: strategy,
      threshold: {
        vertical: device.viewport.height * 0.8,
        horizontal: device.viewport.width * 0.9,
        items: 10
      },
      fallback: 'scroll'
    };
  }
}
```

### 2.2 Responsive Breakpoint Specifications

```typescript
interface ResponsiveBreakpoint {
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  viewport: {
    minWidth: number;
    maxWidth?: number;
  };
  dimensions: {
    width: number | string;
    height: number | string;
    maxWidth?: number;
    maxHeight?: number | string;
  };
  adjustments: {
    padding: number;
    fontSize: number;
    spacing: number;
    layout?: 'vertical' | 'horizontal' | 'grid' | 'tabs';
  };
}

class ResponsiveCalculator {
  generateBreakpoints(
    baseDimensions: Dimensions,
    contentVolume: ContentVolumeMetrics
  ): ResponsiveBreakpoint[] {
    
    return [
      {
        breakpoint: 'xs',
        viewport: { minWidth: 0, maxWidth: 479 },
        dimensions: {
          width: '100%',
          height: 'auto',
          maxWidth: 480,
          maxHeight: '90vh'
        },
        adjustments: {
          padding: 16,
          fontSize: 14,
          spacing: 8,
          layout: 'vertical'
        }
      },
      {
        breakpoint: 'sm',
        viewport: { minWidth: 480, maxWidth: 767 },
        dimensions: {
          width: '95%',
          height: 'auto',
          maxWidth: 600,
          maxHeight: '85vh'
        },
        adjustments: {
          padding: 20,
          fontSize: 15,
          spacing: 12,
          layout: contentVolume.elements.totalItems > 5 ? 'vertical' : 'horizontal'
        }
      },
      {
        breakpoint: 'md',
        viewport: { minWidth: 768, maxWidth: 1023 },
        dimensions: {
          width: '90%',
          height: 'auto',
          maxWidth: 800,
          maxHeight: '80vh'
        },
        adjustments: {
          padding: 24,
          fontSize: 16,
          spacing: 16,
          layout: 'horizontal'
        }
      },
      {
        breakpoint: 'lg',
        viewport: { minWidth: 1024, maxWidth: 1279 },
        dimensions: {
          width: Math.min(baseDimensions.width, 1000),
          height: 'auto',
          maxHeight: '75vh'
        },
        adjustments: {
          padding: 28,
          fontSize: 16,
          spacing: 20,
          layout: 'horizontal'
        }
      },
      {
        breakpoint: 'xl',
        viewport: { minWidth: 1280, maxWidth: 1535 },
        dimensions: {
          width: baseDimensions.width,
          height: baseDimensions.height,
          maxHeight: '70vh'
        },
        adjustments: {
          padding: 32,
          fontSize: 18,
          spacing: 24,
          layout: 'horizontal'
        }
      },
      {
        breakpoint: 'xxl',
        viewport: { minWidth: 1536 },
        dimensions: {
          width: Math.min(baseDimensions.width * 1.1, 1400),
          height: baseDimensions.height,
          maxHeight: '70vh'
        },
        adjustments: {
          padding: 36,
          fontSize: 18,
          spacing: 28,
          layout: 'horizontal'
        }
      }
    ];
  }
}
```

---

## 3. UI Compliance Implementation

### 3.1 Container-Specific Theming Engine

```typescript
class UIComplianceEngine {
  /**
   * Generate UI compliance metadata based on container and content
   */
  generateUICompliance(
    container: ContainerType,
    content: ContentData,
    studentProfile: StudentProfile
  ): UIComplianceMetadata {
    
    // Get container-specific theme
    const theme = this.getContainerTheme(container);
    
    // Apply dark mode if needed
    const darkModeAware = this.applyDarkMode(theme, studentProfile.preferences);
    
    // Ensure accessibility compliance
    const accessible = this.ensureAccessibility(darkModeAware, studentProfile.accessibility);
    
    // Apply typography scaling
    const typography = this.configureTypography(content, studentProfile.gradeLevel);
    
    return {
      container: container,
      theme: {
        colorScheme: theme.colorScheme,
        gradients: theme.gradients,
        darkModeSupport: true,
        contrastCompliant: this.verifyContrast(theme)
      },
      typography: typography,
      branding: theme.branding,
      accessibility: accessible
    };
  }
  
  /**
   * Container-specific theme definitions (from UI Guidelines)
   */
  private getContainerTheme(container: ContainerType): ContainerTheme {
    const themes = {
      LEARN: {
        colorScheme: {
          primary: '#8B5CF6',          // purple-500
          secondary: '#6366F1',        // indigo-500
          accent: '#7C3AED',           // purple-600
          background: '#F3E8FF',       // purple-50
          text: '#111827'              // gray-900
        },
        gradients: {
          primary: 'from-purple-600 to-indigo-600',
          hero: 'from-purple-50 via-blue-50 to-indigo-50',
          dark: 'dark:from-gray-900 dark:via-gray-800 dark:to-gray-900'
        },
        branding: {
          containerGradient: 'from-purple-500 to-indigo-600',
          buttonPrimary: 'bg-gradient-to-r from-purple-500 to-indigo-600',
          buttonSecondary: 'border-2 border-purple-600 text-purple-600',
          focus: 'ring-2 ring-purple-600 ring-offset-2'
        }
      },
      EXPERIENCE: {
        colorScheme: {
          primary: '#3B82F6',          // blue-500
          secondary: '#06B6D4',        // cyan-500
          accent: '#2563EB',           // blue-600
          background: '#EFF6FF',       // blue-50
          text: '#111827'
        },
        gradients: {
          primary: 'from-blue-500 to-cyan-600',
          hero: 'from-blue-50 to-cyan-50',
          dark: 'dark:from-gray-900 dark:via-blue-900/90 dark:to-cyan-900/90'
        },
        branding: {
          containerGradient: 'from-blue-500 to-cyan-600',
          buttonPrimary: 'bg-gradient-to-r from-blue-500 to-cyan-600',
          buttonSecondary: 'border-2 border-blue-600 text-blue-600',
          focus: 'ring-2 ring-blue-600 ring-offset-2'
        }
      },
      DISCOVER: {
        colorScheme: {
          primary: '#10B981',          // emerald-500
          secondary: '#14B8A6',        // teal-500
          accent: '#059669',           // emerald-600
          background: '#D1FAE5',       // emerald-100
          text: '#111827'
        },
        gradients: {
          primary: 'from-emerald-500 to-teal-600',
          hero: 'from-emerald-50 to-teal-50',
          dark: 'dark:from-gray-900 dark:via-emerald-900/90 dark:to-teal-900/90'
        },
        branding: {
          containerGradient: 'from-emerald-500 to-teal-600',
          buttonPrimary: 'bg-gradient-to-r from-emerald-500 to-teal-600',
          buttonSecondary: 'border-2 border-emerald-600 text-emerald-600',
          focus: 'ring-2 ring-emerald-600 ring-offset-2'
        }
      }
    };
    
    return themes[container];
  }
  
  /**
   * Typography configuration based on grade level
   */
  private configureTypography(
    content: ContentData,
    gradeLevel: string
  ): TypographyConfiguration {
    
    const gradeConfigs = {
      'K-2': {
        baseSize: 18,
        scale: { sm: 16, base: 18, lg: 22, xl: 26, '2xl': 30 },
        lineHeight: 1.8,
        responsive: true
      },
      '3-5': {
        baseSize: 16,
        scale: { sm: 14, base: 16, lg: 20, xl: 24, '2xl': 28 },
        lineHeight: 1.6,
        responsive: true
      },
      '6-8': {
        baseSize: 16,
        scale: { sm: 14, base: 16, lg: 18, xl: 22, '2xl': 26 },
        lineHeight: 1.5,
        responsive: true
      },
      '9-12': {
        baseSize: 15,
        scale: { sm: 13, base: 15, lg: 17, xl: 20, '2xl': 24 },
        lineHeight: 1.5,
        responsive: true
      }
    };
    
    return gradeConfigs[gradeLevel] || gradeConfigs['6-8'];
  }
}
```

### 3.2 Accessibility Compliance Engine

```typescript
class AccessibilityComplianceEngine {
  /**
   * Ensure WCAG 2.1 AA compliance
   */
  ensureAccessibility(
    theme: Theme,
    accessibilityNeeds: AccessibilityProfile
  ): AccessibilityCompliance {
    
    return {
      level: 'AA',
      touchOptimized: this.optimizeForTouch(accessibilityNeeds),
      keyboardNavigable: true,
      screenReaderReady: this.prepareForScreenReader(),
      focusManagement: true,
      
      // Specific accommodations
      accommodations: {
        visualImpairment: {
          highContrast: this.checkContrast(theme) >= 4.5,
          largeText: accessibilityNeeds.needsLargeText,
          screenReaderOptimized: true
        },
        motorImpairment: {
          largeTouchTargets: true,    // Minimum 44px
          keyboardOnly: true,
          dwellClicking: accessibilityNeeds.needsDwellClick,
          reducedMotion: accessibilityNeeds.prefersReducedMotion
        },
        cognitiveNeeds: {
          simplifiedInterface: accessibilityNeeds.needsSimplified,
          extendedTime: true,
          clearInstructions: true,
          consistentLayout: true
        },
        hearingImpairment: {
          captions: true,
          visualAlerts: true,
          transcripts: true
        }
      }
    };
  }
  
  /**
   * Contrast ratio validation
   */
  private checkContrast(theme: Theme): number {
    const contrastRatios = {
      textOnBackground: this.calculateContrast(theme.text, theme.background),
      primaryOnWhite: this.calculateContrast(theme.primary, '#FFFFFF'),
      primaryOnDark: this.calculateContrast(theme.primary, '#111827')
    };
    
    return Math.min(...Object.values(contrastRatios));
  }
}
```

---

## 4. Content Type Specific Enhancements

### 4.1 Enhanced Fill-in-the-Blank

```typescript
interface EnhancedFillBlankContent extends FillBlankContent {
  // Dimensional hints specific to fill-blank
  dimensions: {
    recommended: {
      width: number;                   // Based on longest line
      height: number;                  // Based on blank count
    };
    blankDimensions: {
      inputWidth: number;              // Per blank input width
      inputHeight: 44;                 // Touch-friendly height
      spacing: 12;                     // Between blanks
    };
    overflow: {
      strategy: 'scroll' | 'paginate';
      maxBlanksPerPage: 5;
      scrollHeight: number;
    };
  };
  
  // UI compliance for fill-blank
  uiCompliance: {
    inputStyling: {
      borderColor: string;             // From container theme
      focusColor: string;
      backgroundColor: string;
      textColor: string;
    };
    validation: {
      correctColor: '#10B981';         // emerald-500
      incorrectColor: '#EF4444';       // red-500
      partialColor: '#F59E0B';         // amber-500
    };
  };
}
```

### 4.2 Enhanced Code Editor

```typescript
interface EnhancedCodeEditorContent extends CodeEditorContent {
  dimensions: {
    recommended: {
      width: 1200;                     // Optimal for code
      height: 700;
      splitRatio: 0.6;                 // Editor vs output
    };
    constraints: {
      minWidth: 900;                   // Minimum for usability
      minHeight: 500;
      maxWidth: 1400;
      maxHeight: '90vh';
    };
    responsive: {
      mobile: {
        fullScreen: true;
        tabbed: true;                  // Tab between editor/output
      };
      tablet: {
        width: '95%';
        splitView: false;               // Stack vertically
      };
      desktop: {
        splitView: true;
        resizablePanes: true;
      };
    };
  };
  
  uiCompliance: {
    theme: {
      light: {
        background: '#FFFFFF',
        text: '#111827',
        syntax: 'github-light'
      };
      dark: {
        background: '#1F2937',
        text: '#F9FAFB',
        syntax: 'github-dark'
      };
    };
    fonts: {
      editor: 'Monaco, Consolas, monospace',
      console: 'Courier New, monospace',
      size: { min: 12, default: 14, max: 18 }
    };
  };
}
```

---

## 5. Finn Agent Compliance

### 5.1 Agent-Specific Dimension Logic

```typescript
class FinnAgentDimensionLogic {
  /**
   * FinnThink: Logical problem solving dimensions
   */
  finnThinkDimensions(problem: Problem): DimensionalHints {
    const stepCount = problem.steps.length;
    const hasVisuals = problem.diagrams?.length > 0;
    
    return {
      recommended: {
        width: hasVisuals ? 900 : 700,
        height: 400 + (stepCount * 80)  // Base + step height
      },
      overflow: {
        strategy: stepCount > 5 ? 'accordion' : 'scroll',
        threshold: { items: 5 }
      }
    };
  }
  
  /**
   * FinnSee: Visual content dimensions
   */
  finnSeeDimensions(visual: VisualContent): DimensionalHints {
    const imageCount = visual.images.length;
    const largestImage = Math.max(...visual.images.map(i => i.width));
    
    return {
      recommended: {
        width: Math.min(largestImage + 100, 1200),
        height: visual.layout === 'gallery' ? 600 : 'auto',
        aspectRatio: visual.maintainRatio ? '16:9' : undefined
      },
      overflow: {
        strategy: imageCount > 4 ? 'carousel' : 'grid',
        threshold: { items: 4 }
      }
    };
  }
  
  /**
   * FinnSpeak: Communication dimensions
   */
  finnSpeakDimensions(communication: Communication): DimensionalHints {
    const wordCount = communication.text.split(' ').length;
    const hasAudio = communication.audio !== undefined;
    
    return {
      recommended: {
        width: 700,
        height: Math.min(400 + (wordCount / 100) * 50, 700)
      },
      overflow: {
        strategy: wordCount > 500 ? 'scroll' : 'none',
        threshold: { words: 500 }
      }
    };
  }
  
  /**
   * FinnTool: Tool-specific dimensions
   */
  finnToolDimensions(tool: ToolContent): DimensionalHints {
    const toolDimensions = {
      calculator: { width: 400, height: 500 },
      graphing: { width: 800, height: 600 },
      lab: { width: 1000, height: 700 },
      canvas: { width: 900, height: 700 }
    };
    
    return {
      recommended: toolDimensions[tool.type] || { width: 700, height: 500 },
      constraints: {
        minWidth: 400,
        minHeight: 400,
        maintainAspectRatio: tool.type === 'canvas'
      }
    };
  }
  
  /**
   * FinnView: Assessment dimensions
   */
  finnViewDimensions(assessment: Assessment): DimensionalHints {
    const questionCount = assessment.questions.length;
    const hasRubric = assessment.rubric !== undefined;
    
    return {
      recommended: {
        width: hasRubric ? 900 : 700,
        height: 500 + (questionCount * 60)
      },
      overflow: {
        strategy: questionCount > 10 ? 'paginate' : 'scroll',
        threshold: { items: 10, itemsPerPage: 5 }
      }
    };
  }
}
```

---

## 6. PathIQ Integration Enhancement

### 6.1 PathIQ Adaptive Dimension Selection

```typescript
class PathIQDimensionOptimizer {
  /**
   * PathIQ determines optimal dimensions based on student model
   */
  optimizeDimensions(
    content: ContentData,
    studentModel: StudentModel,
    deviceContext: DeviceContext
  ): OptimizedDimensions {
    
    // Analyze student's interaction patterns
    const patterns = {
      prefersCompact: studentModel.interactionHistory.avgModalTime < 60,
      needsLargeText: studentModel.accessibility.visualAcuity < 0.7,
      highScrollTolerance: studentModel.behaviors.scrollFrequency > 0.5,
      lowAttentionSpan: studentModel.attention.avgFocus < 120
    };
    
    // Adjust dimensions based on patterns
    let dimensions = this.getBaseDimensions(content);
    
    if (patterns.prefersCompact) {
      dimensions = this.makeCompact(dimensions);
    }
    
    if (patterns.needsLargeText) {
      dimensions = this.enlargeForReadability(dimensions);
    }
    
    if (!patterns.highScrollTolerance) {
      dimensions = this.minimizeScrolling(dimensions);
    }
    
    if (patterns.lowAttentionSpan) {
      dimensions = this.optimizeForQuickInteraction(dimensions);
    }
    
    // Predict success with these dimensions
    const successProbability = this.predictSuccess(
      dimensions,
      studentModel,
      content
    );
    
    // Add PathIQ metadata
    dimensions.pathIQOptimization = {
      adaptationReasons: Object.entries(patterns)
        .filter(([_, value]) => value)
        .map(([key]) => key),
      successProbability: successProbability,
      alternativeDimensions: this.generateAlternatives(dimensions),
      realTimeAdjustment: {
        enabled: true,
        triggers: ['frustration', 'confusion', 'disengagement'],
        adjustments: ['increase-size', 'add-padding', 'simplify-layout']
      }
    };
    
    return dimensions;
  }
}
```

---

## 7. Validation & Testing Requirements

### 7.1 Contract Validation Suite

```typescript
describe('AI Content Generation Contract v2.0', () => {
  
  describe('Dimensional Intelligence', () => {
    it('should include dimensional hints for all content types', async () => {
      for (const contentType of ALL_CONTENT_TYPES) {
        const response = await aiEngine.generateContent({
          type: contentType,
          ...mockRequest
        });
        
        expect(response.dimensions).toBeDefined();
        expect(response.dimensions.recommended).toBeDefined();
        expect(response.dimensions.recommended.width).toBeGreaterThan(0);
        expect(response.dimensions.recommended.height).toBeGreaterThan(0);
        expect(response.dimensions.constraints).toBeDefined();
        expect(response.dimensions.overflow).toBeDefined();
      }
    });
    
    it('should predict overflow correctly', async () => {
      const largeContent = createLargeContent();
      const response = await aiEngine.generateContent(largeContent);
      
      expect(response.dimensions.overflow.predicted).toBe(true);
      expect(response.dimensions.overflow.strategy).toBeOneOf([
        'scroll', 'paginate', 'accordion', 'tabs'
      ]);
    });
    
    it('should provide responsive breakpoints', async () => {
      const response = await aiEngine.generateContent(mockRequest);
      
      expect(response.dimensions.responsive.breakpoints).toHaveLength(6);
      response.dimensions.responsive.breakpoints.forEach(breakpoint => {
        expect(breakpoint.dimensions).toBeDefined();
        expect(breakpoint.adjustments).toBeDefined();
      });
    });
  });
  
  describe('UI Compliance', () => {
    it('should include container-specific theming', async () => {
      for (const container of ['LEARN', 'EXPERIENCE', 'DISCOVER']) {
        const response = await aiEngine.generateContent({
          container,
          ...mockRequest
        });
        
        expect(response.uiCompliance.container).toBe(container);
        expect(response.uiCompliance.theme.colorScheme).toBeDefined();
        expect(response.uiCompliance.theme.gradients).toBeDefined();
        expect(response.uiCompliance.branding).toBeDefined();
      }
    });
    
    it('should ensure accessibility compliance', async () => {
      const response = await aiEngine.generateContent(mockRequest);
      
      expect(response.uiCompliance.accessibility.level).toBeOneOf(['A', 'AA', 'AAA']);
      expect(response.uiCompliance.accessibility.touchOptimized).toBeDefined();
      expect(response.uiCompliance.accessibility.keyboardNavigable).toBe(true);
      expect(response.uiCompliance.accessibility.screenReaderReady).toBe(true);
    });
    
    it('should provide grade-appropriate typography', async () => {
      for (const grade of ['K-2', '3-5', '6-8', '9-12']) {
        const response = await aiEngine.generateContent({
          gradeLevel: grade,
          ...mockRequest
        });
        
        expect(response.uiCompliance.typography.baseSize).toBeDefined();
        expect(response.uiCompliance.typography.scale).toBeDefined();
        expect(response.uiCompliance.typography.lineHeight).toBeGreaterThan(1);
      }
    });
  });
  
  describe('Content Volume Metrics', () => {
    it('should calculate content volume accurately', async () => {
      const response = await aiEngine.generateContent(mockRequest);
      
      expect(response.content.volume).toBeDefined();
      expect(response.content.volume.text.wordCount).toBeGreaterThan(0);
      expect(response.content.volume.elements.totalItems).toBeGreaterThan(0);
      expect(response.content.volume.complexity.score).toBeBetween(1, 10);
    });
  });
});
```

### 7.2 Integration Validation

```typescript
describe('AI to Modal Integration with Dimensions', () => {
  
  it('should render modal with correct dimensions', async () => {
    const aiResponse = await aiEngine.generateContent(mockRequest);
    const modal = await modalRenderer.render(aiResponse);
    
    const computedStyle = window.getComputedStyle(modal.element);
    const expectedWidth = aiResponse.dimensions.recommended.width;
    const expectedHeight = aiResponse.dimensions.recommended.height;
    
    expect(parseInt(computedStyle.width)).toBeCloseTo(expectedWidth, 50);
    expect(parseInt(computedStyle.height)).toBeCloseTo(expectedHeight, 50);
  });
  
  it('should apply overflow strategy when needed', async () => {
    const largeContent = createLargeContent();
    const aiResponse = await aiEngine.generateContent(largeContent);
    const modal = await modalRenderer.render(aiResponse);
    
    if (aiResponse.dimensions.overflow.predicted) {
      const strategy = aiResponse.dimensions.overflow.strategy;
      
      switch(strategy) {
        case 'scroll':
          expect(modal.element.style.overflowY).toBe('auto');
          break;
        case 'paginate':
          expect(modal.pagination).toBeDefined();
          expect(modal.pagination.totalPages).toBeGreaterThan(1);
          break;
        case 'accordion':
          expect(modal.accordion).toBeDefined();
          expect(modal.accordion.sections).toBeGreaterThan(1);
          break;
        case 'tabs':
          expect(modal.tabs).toBeDefined();
          expect(modal.tabs.count).toBeGreaterThan(1);
          break;
      }
    }
  });
  
  it('should apply container theming correctly', async () => {
    const aiResponse = await aiEngine.generateContent({
      container: 'LEARN',
      ...mockRequest
    });
    const modal = await modalRenderer.render(aiResponse);
    
    const theme = aiResponse.uiCompliance.theme;
    expect(modal.element.classList.contains('from-purple-600')).toBe(true);
    expect(modal.element.classList.contains('to-indigo-600')).toBe(true);
  });
});
```

---

## 8. Performance Monitoring

### 8.1 Dimension Calculation Performance

```typescript
interface DimensionPerformanceMetrics {
  calculation: {
    volumeAnalysis: number;           // ms to analyze content volume
    dimensionCalculation: number;     // ms to calculate dimensions
    overflowPrediction: number;       // ms to predict overflow
    responsiveGeneration: number;     // ms to generate breakpoints
    totalTime: number;                // Total processing time
  };
  
  accuracy: {
    overflowPredictionAccuracy: number;  // % correct predictions
    dimensionFitAccuracy: number;        // % optimal sizing
    responsiveAdaptationSuccess: number; // % successful adaptations
  };
  
  optimization: {
    cacheHits: number;                // Cached dimension lookups
    cacheMisses: number;
    averageCalculationTime: number;
    p95CalculationTime: number;
  };
}

class DimensionPerformanceMonitor {
  trackDimensionCalculation(
    startTime: number,
    content: ContentData,
    result: DimensionalHints
  ): void {
    const metrics: DimensionPerformanceMetrics = {
      calculation: {
        volumeAnalysis: this.timers.volumeAnalysis,
        dimensionCalculation: this.timers.dimensionCalc,
        overflowPrediction: this.timers.overflowPred,
        responsiveGeneration: this.timers.responsiveGen,
        totalTime: Date.now() - startTime
      },
      accuracy: {
        overflowPredictionAccuracy: this.validateOverflowPrediction(result),
        dimensionFitAccuracy: this.validateDimensionFit(result),
        responsiveAdaptationSuccess: this.validateResponsive(result)
      },
      optimization: this.cacheStats
    };
    
    // Log to monitoring system
    this.monitor.log('dimension_calculation', metrics);
    
    // Alert if performance degrades
    if (metrics.calculation.totalTime > 500) {
      this.monitor.alert('Slow dimension calculation', metrics);
    }
  }
}
```

---

## 9. Migration & Implementation Plan

### 9.1 Phased Implementation

```typescript
interface ImplementationPhases {
  phase1: {
    name: 'Basic Dimensional Intelligence';
    duration: '2 weeks';
    tasks: [
      'Add volume analysis to content generation',
      'Implement basic dimension calculation',
      'Add recommended dimensions to response'
    ];
    validation: [
      'All content includes dimensions',
      'Dimensions prevent basic overflow',
      'Modal factory reads dimensions'
    ];
  };
  
  phase2: {
    name: 'UI Compliance & Theming';
    duration: '2 weeks';
    tasks: [
      'Implement container theming engine',
      'Add typography configuration',
      'Ensure accessibility compliance'
    ];
    validation: [
      'Container themes apply correctly',
      'Typography scales by grade',
      'WCAG AA compliance achieved'
    ];
  };
  
  phase3: {
    name: 'Advanced Overflow & Responsive';
    duration: '2 weeks';
    tasks: [
      'Implement overflow prediction',
      'Add responsive breakpoints',
      'Create adaptive strategies'
    ];
    validation: [
      'Overflow predicted accurately',
      'Responsive behavior works',
      'No content breaks layouts'
    ];
  };
  
  phase4: {
    name: 'PathIQ & Agent Integration';
    duration: '1 week';
    tasks: [
      'Integrate PathIQ optimization',
      'Add agent-specific logic',
      'Implement real-time adjustment'
    ];
    validation: [
      'PathIQ adapts dimensions',
      'Agents provide proper hints',
      'Real-time adjustments work'
    ];
  };
  
  phase5: {
    name: 'Testing & Optimization';
    duration: '1 week';
    tasks: [
      'Complete test coverage',
      'Performance optimization',
      'Production deployment'
    ];
    validation: [
      'All tests passing',
      'Performance targets met',
      'Zero overflow issues in production'
    ];
  };
}
```

---

## Implementation Checklist

### AI Engine Team
- [ ] Implement content volume analyzer
- [ ] Add dimension calculation engine
- [ ] Implement overflow prediction
- [ ] Add responsive breakpoint generator
- [ ] Integrate UI compliance engine
- [ ] Add container theming logic
- [ ] Implement accessibility compliance
- [ ] Add Finn agent specific logic
- [ ] Integrate PathIQ optimization
- [ ] Add performance monitoring
- [ ] Complete unit tests
- [ ] Document API changes

### Frontend Team  
- [ ] Update modal factory for v2.0
- [ ] Implement dimension application
- [ ] Add overflow handlers
- [ ] Implement responsive behavior
- [ ] Apply UI theming
- [ ] Add accessibility features
- [ ] Update render pipeline
- [ ] Add performance tracking
- [ ] Complete integration tests
- [ ] Update documentation

### QA Team
- [ ] Test dimension accuracy
- [ ] Verify overflow prevention
- [ ] Test responsive behavior
- [ ] Validate UI compliance
- [ ] Check accessibility
- [ ] Performance testing
- [ ] Cross-device testing
- [ ] User acceptance testing

### DevOps Team
- [ ] Update deployment scripts
- [ ] Configure monitoring
- [ ] Set up alerts
- [ ] Plan rollback strategy
- [ ] Load testing

---

## Sign-off Requirements

### Technical Approval
- **AI/ML Team Lead:** _______________________ Date: _________
- **Frontend Team Lead:** _______________________ Date: _________
- **Backend Team Lead:** _______________________ Date: _________

### Architecture Approval
- **Chief Architect:** _______________________ Date: _________
- **UI/UX Director:** _______________________ Date: _________

### Product Approval
- **Product Manager:** _______________________ Date: _________
- **VP Engineering:** _______________________ Date: _________

---

*End of AI Content Generation Contract v2.0*

**This enhanced contract ensures perfect integration between AI generation, modal sizing, and UI compliance.**

---