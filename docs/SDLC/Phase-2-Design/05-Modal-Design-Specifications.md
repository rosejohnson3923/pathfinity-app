# Modal Design Specifications
## Content-Aware Modal Sizing & UI Guidelines Integration

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Design Specification  
**Owner:** UI/UX Architecture Lead  
**Purpose:** Define modal dimensions, layouts, and design rules based on content types and UI guidelines

---

## Executive Summary

This document establishes precise modal design specifications that prevent content overflow/underflow by defining appropriate dimensions, responsive breakpoints, and layout rules for each content type. It ensures compliance with Pathfinity's UI guidelines while maintaining optimal user experience across all devices and content variations.

---

## 1. Modal Design Principles

### 1.1 Core Design Rules

```typescript
interface ModalDesignPrinciples {
  // Content-driven sizing
  contentFirst: {
    minContentHeight: 200,    // px - Never smaller than this
    maxContentHeight: '80vh', // Never larger than viewport
    contentPadding: 24,        // px - Consistent inner spacing
    overflowStrategy: 'scroll' | 'paginate' | 'expand'
  };
  
  // Responsive behavior
  responsive: {
    mobileFirst: boolean,      // Design for mobile, enhance for desktop
    fluidWidth: boolean,       // Width adjusts to content
    breakpoints: {
      mobile: 480,
      tablet: 768,
      desktop: 1024,
      wide: 1440
    }
  };
  
  // Brand compliance
  brandGuidelines: {
    colorScheme: 'purple-indigo', // Per UI guidelines
    borderRadius: 12,          // px - Rounded corners
    elevation: 'shadow-xl',    // Shadow depth
    backdrop: 'blur-sm bg-black/50' // Background overlay
  };
  
  // Accessibility
  accessibility: {
    minTouchTarget: 44,       // px - Minimum touch size
    focusVisible: true,        // Visible focus indicators
    escapeClose: true,         // ESC key closes modal
    trapFocus: true           // Focus trapped in modal
  };
}
```

### 1.2 Container Mode Theming

Based on UI Guidelines, modals adapt to container context:

```typescript
interface ContainerTheming {
  LEARN: {
    gradient: 'from-purple-500 to-indigo-600',
    background: 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50',
    darkBackground: 'dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
    accent: 'purple-600',
    border: 'border-purple-200 dark:border-purple-700'
  },
  EXPERIENCE: {
    gradient: 'from-blue-500 to-cyan-600',
    background: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    darkBackground: 'dark:from-gray-900 dark:via-blue-900/90 dark:to-cyan-900/90',
    accent: 'blue-600',
    border: 'border-blue-200 dark:border-blue-700'
  },
  DISCOVER: {
    gradient: 'from-emerald-500 to-teal-600',
    background: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    darkBackground: 'dark:from-gray-900 dark:via-emerald-900/90 dark:to-teal-900/90',
    accent: 'emerald-600',
    border: 'border-emerald-200 dark:border-emerald-700'
  }
}
```

---

## 2. Content-Specific Modal Dimensions

### 2.1 Fill-in-the-Blank Modal

```typescript
interface FillBlankModalDimensions {
  desktop: {
    minWidth: 600,
    maxWidth: 900,
    optimalWidth: '75%',      // Of container
    minHeight: 400,
    maxHeight: 700,
    // Dynamic height based on content
    heightFormula: 'headerHeight + (blanks.length * 60) + footerHeight + padding'
  },
  tablet: {
    width: '90%',
    minHeight: 350,
    maxHeight: '70vh'
  },
  mobile: {
    width: '95%',
    minHeight: 300,
    maxHeight: '80vh'
  },
  
  // Content-specific rules
  contentRules: {
    maxBlanksVisible: 5,       // Before scrolling
    blankInputWidth: 200,      // px per blank
    lineHeight: 1.5,           // For readability
    fontSize: {
      mobile: 16,
      tablet: 16,
      desktop: 18
    }
  },
  
  // Overflow prevention
  overflow: {
    strategy: 'scroll',
    maxTextLength: 2000,       // Characters before pagination
    scrollIndicator: true,
    pagination: {
      enabled: true,
      itemsPerPage: 5
    }
  }
}
```

### 2.2 Single/Multiple Selection Modal

```typescript
interface SelectionModalDimensions {
  desktop: {
    minWidth: 500,
    maxWidth: 800,
    // Width adjusts to longest option
    widthFormula: 'max(minWidth, longestOption + padding * 2)',
    minHeight: 300,
    // Height based on options
    heightFormula: 'headerHeight + (options.length * optionHeight) + footerHeight'
  },
  
  // Layout configurations
  layouts: {
    vertical: {
      optionHeight: 60,        // px per option
      maxVisibleOptions: 6,    // Before scroll
      spacing: 12              // px between options
    },
    horizontal: {
      columns: 2,
      optionWidth: '48%',
      gap: 16
    },
    grid: {
      columns: { mobile: 1, tablet: 2, desktop: 3 },
      optionSize: 150,         // Square options
      gap: 16
    }
  },
  
  // Content limits
  limits: {
    maxOptions: 10,            // Absolute maximum
    maxOptionTextLength: 200,  // Characters
    imageOptionSize: {
      thumbnail: 60,
      full: 200
    }
  },
  
  // Typography per UI guidelines
  typography: {
    question: 'text-xl font-semibold text-gray-900 dark:text-white',
    option: 'text-base text-gray-700 dark:text-gray-300',
    selected: 'text-purple-600 dark:text-purple-400 font-medium'
  }
}
```

### 2.3 Drag and Drop Modal

```typescript
interface DragDropModalDimensions {
  desktop: {
    minWidth: 800,
    maxWidth: 1200,
    optimalWidth: '90%',
    minHeight: 500,
    maxHeight: 800,
    aspectRatio: '16:10'       // Maintain ratio when possible
  },
  
  // Zone specifications
  zones: {
    sourceArea: {
      width: '40%',            // Of modal width
      minHeight: 200,
      maxItems: 12,
      itemSize: { width: 120, height: 60 },
      layout: 'wrap'           // Items wrap to new row
    },
    targetArea: {
      width: '55%',            // Of modal width
      dropZones: {
        size: { width: 140, height: 80 },
        highlight: 'border-2 border-dashed border-purple-400',
        hover: 'bg-purple-50 dark:bg-purple-900/20'
      }
    },
    divider: {
      width: '5%',             // Visual separator
      style: 'border-l-2 border-gray-200 dark:border-gray-700'
    }
  },
  
  // Responsive adjustments
  responsive: {
    tablet: {
      layout: 'vertical',      // Stack source above target
      sourceHeight: '40%',
      targetHeight: '60%'
    },
    mobile: {
      layout: 'tabs',          // Tab between source/target
      fullWidth: true
    }
  }
}
```

### 2.4 Code Editor Modal

```typescript
interface CodeEditorModalDimensions {
  desktop: {
    minWidth: 900,
    maxWidth: 1400,
    optimalWidth: '85%',
    minHeight: 600,
    maxHeight: '90vh',
    
    // Split view dimensions
    editorPane: {
      width: '60%',
      minWidth: 500
    },
    outputPane: {
      width: '40%',
      minWidth: 300,
      collapsible: true
    }
  },
  
  // Editor specifications
  editor: {
    lineHeight: 1.4,
    fontSize: { min: 12, default: 14, max: 18 },
    gutterWidth: 50,           // Line numbers
    minLines: 10,
    maxLines: 50,
    theme: {
      light: 'vs-light',
      dark: 'vs-dark'          // Match UI dark mode
    }
  },
  
  // Console/output area
  console: {
    minHeight: 100,
    maxHeight: 300,
    position: 'bottom' | 'right' | 'floating',
    fontSize: 13,
    maxOutputLines: 1000
  },
  
  // Mobile optimization
  mobile: {
    fullScreen: true,          // Take full viewport
    tabbed: true,              // Tab between editor/output
    virtualKeyboard: 'code'    // Optimized keyboard
  }
}
```

### 2.5 Math Input Modal

```typescript
interface MathInputModalDimensions {
  desktop: {
    minWidth: 600,
    maxWidth: 900,
    minHeight: 400,
    
    // Dynamic sizing based on complexity
    sizing: {
      simple: { width: 600, height: 400 },    // Basic arithmetic
      moderate: { width: 700, height: 500 },  // Algebra
      complex: { width: 900, height: 600 }    // Calculus
    }
  },
  
  // Math palette dimensions
  palette: {
    position: 'bottom' | 'side',
    height: 120,               // Bottom position
    width: 200,                // Side position
    buttonSize: 44,            // Touch-friendly
    columns: 8,
    rows: 3
  },
  
  // Display area
  display: {
    minHeight: 80,             // For rendered math
    fontSize: 20,
    padding: 16,
    overflow: 'horizontal-scroll'
  },
  
  // Input area
  input: {
    minHeight: 60,
    fontSize: 18,
    caretSize: 2,
    cursorColor: 'purple-600'
  }
}
```

### 2.6 Drawing/Annotation Modal

```typescript
interface DrawingModalDimensions {
  desktop: {
    minWidth: 700,
    maxWidth: 1200,
    aspectRatio: '4:3',        // Maintain drawing ratio
    
    // Canvas area
    canvas: {
      width: '100%',
      height: 'calc(100% - toolbarHeight)',
      minHeight: 400,
      maxHeight: 700,
      backgroundColor: 'white',
      darkBackgroundColor: 'gray-900'
    }
  },
  
  // Toolbar specifications
  toolbar: {
    position: 'top' | 'left' | 'floating',
    height: 60,                // Top position
    width: 80,                 // Side position
    tools: {
      buttonSize: 44,
      spacing: 8,
      groupDivider: 16
    }
  },
  
  // Touch optimization
  touch: {
    minCanvasSize: 300,
    palmRejection: true,
    pressureSensitivity: true,
    smoothing: true
  }
}
```

---

## 3. Responsive Breakpoint Specifications

### 3.1 Breakpoint Definitions

```typescript
interface ResponsiveBreakpoints {
  // Screen size breakpoints (matches UI guidelines)
  breakpoints: {
    xs: 0,      // Mobile portrait
    sm: 480,    // Mobile landscape
    md: 768,    // Tablet portrait
    lg: 1024,   // Tablet landscape / small desktop
    xl: 1280,   // Desktop
    xxl: 1536   // Large desktop
  },
  
  // Modal size adjustments per breakpoint
  modalSizing: {
    xs: {
      width: '100%',
      maxWidth: 'calc(100% - 16px)',
      height: 'auto',
      maxHeight: '90vh',
      margin: 8,
      padding: 16
    },
    sm: {
      width: '95%',
      maxWidth: 450,
      height: 'auto',
      maxHeight: '85vh',
      margin: 12,
      padding: 20
    },
    md: {
      width: '90%',
      maxWidth: 600,
      height: 'auto',
      maxHeight: '80vh',
      margin: 16,
      padding: 24
    },
    lg: {
      width: '80%',
      maxWidth: 800,
      height: 'auto',
      maxHeight: '75vh',
      margin: 20,
      padding: 28
    },
    xl: {
      width: '70%',
      maxWidth: 1000,
      height: 'auto',
      maxHeight: '70vh',
      margin: 24,
      padding: 32
    }
  }
}
```

### 3.2 Content Reflow Rules

```typescript
interface ContentReflowRules {
  // Typography scaling
  typography: {
    xs: { base: 14, heading: 20, small: 12 },
    sm: { base: 15, heading: 22, small: 13 },
    md: { base: 16, heading: 24, small: 14 },
    lg: { base: 16, heading: 28, small: 14 },
    xl: { base: 18, heading: 32, small: 16 }
  },
  
  // Layout transformations
  layoutTransforms: {
    'horizontal-to-vertical': {
      breakpoint: 'md',
      from: 'flex-row',
      to: 'flex-col'
    },
    'grid-to-list': {
      breakpoint: 'sm',
      from: 'grid grid-cols-3',
      to: 'flex flex-col'
    },
    'sidebar-to-tabs': {
      breakpoint: 'lg',
      from: 'flex with sidebar',
      to: 'tabs'
    }
  },
  
  // Element visibility
  visibility: {
    hideOnMobile: ['secondary-actions', 'decorative-elements'],
    hideOnTablet: ['extended-descriptions'],
    showOnlyDesktop: ['advanced-tools', 'keyboard-shortcuts']
  }
}
```

---

## 4. Content Overflow Prevention

### 4.1 Overflow Detection & Handling

```typescript
class OverflowPrevention {
  // Calculate if content will overflow
  detectOverflow(
    content: ContentData,
    modalDimensions: ModalDimensions
  ): OverflowResult {
    const contentHeight = this.calculateContentHeight(content);
    const contentWidth = this.calculateContentWidth(content);
    
    return {
      vertical: contentHeight > modalDimensions.maxHeight,
      horizontal: contentWidth > modalDimensions.maxWidth,
      strategy: this.determineStrategy(content, modalDimensions)
    };
  }
  
  // Strategies for handling overflow
  strategies = {
    SCROLL: {
      apply: (modal) => {
        modal.style.overflowY = 'auto';
        modal.classList.add('scrollbar-thin', 'scrollbar-purple');
      },
      indicator: 'gradient-fade-bottom'
    },
    
    PAGINATE: {
      apply: (content, itemsPerPage) => {
        return this.paginateContent(content, itemsPerPage);
      },
      controls: ['prev', 'next', 'page-indicator']
    },
    
    ACCORDION: {
      apply: (content) => {
        return this.createAccordion(content);
      },
      expandedByDefault: 1
    },
    
    TABS: {
      apply: (content) => {
        return this.createTabs(content);
      },
      maxTabs: 5
    },
    
    TRUNCATE: {
      apply: (text, maxLength) => {
        return this.truncateWithEllipsis(text, maxLength);
      },
      showMore: true
    }
  };
}
```

### 4.2 Dynamic Sizing Algorithm

```typescript
class DynamicModalSizer {
  calculateOptimalSize(
    content: AIContentResponse,
    viewport: ViewportDimensions,
    uiGuidelines: UIGuidelines
  ): ModalDimensions {
    
    // Base size from content type
    let dimensions = this.getBaseSize(content.modalType);
    
    // Adjust for content volume
    dimensions = this.adjustForContent(dimensions, content);
    
    // Apply viewport constraints
    dimensions = this.constrainToViewport(dimensions, viewport);
    
    // Apply UI guidelines
    dimensions = this.applyUIGuidelines(dimensions, uiGuidelines);
    
    // Ensure minimum usability
    dimensions = this.ensureMinimums(dimensions);
    
    return dimensions;
  }
  
  private adjustForContent(
    base: ModalDimensions,
    content: AIContentResponse
  ): ModalDimensions {
    const adjustments = {
      // Text content
      textLength: content.content.data.text?.length || 0,
      textMultiplier: Math.min(1.5, 1 + (textLength / 1000) * 0.1),
      
      // Options/items
      itemCount: content.content.data.options?.length || 0,
      itemMultiplier: Math.min(2, 1 + (itemCount / 5) * 0.2),
      
      // Media content
      hasImages: content.content.data.images?.length > 0,
      imageMultiplier: hasImages ? 1.3 : 1,
      
      // Complexity
      complexity: content.metadata.complexity || 1,
      complexityMultiplier: 1 + (complexity - 1) * 0.15
    };
    
    return {
      width: base.width * adjustments.textMultiplier * adjustments.imageMultiplier,
      height: base.height * adjustments.itemMultiplier * adjustments.complexityMultiplier,
      minWidth: base.minWidth,
      minHeight: base.minHeight,
      maxWidth: base.maxWidth,
      maxHeight: base.maxHeight
    };
  }
}
```

---

## 5. Visual Design Specifications

### 5.1 Modal Structure Components

```typescript
interface ModalStructure {
  // Header specifications
  header: {
    height: 64,                // px
    padding: '20px 24px',
    background: 'bg-gradient-to-r from-purple-600 to-indigo-600',
    darkBackground: 'dark:from-purple-700 dark:to-indigo-700',
    title: {
      fontSize: 'text-xl',
      fontWeight: 'font-semibold',
      color: 'text-white'
    },
    closeButton: {
      size: 32,
      icon: 'X',
      position: 'absolute right-4 top-4',
      color: 'text-white hover:text-gray-200'
    }
  },
  
  // Body specifications
  body: {
    padding: 24,
    background: 'bg-white dark:bg-gray-800',
    minHeight: 200,
    maxHeight: 'calc(80vh - headerHeight - footerHeight)',
    overflow: 'auto',
    scrollbar: 'scrollbar-thin scrollbar-purple'
  },
  
  // Footer specifications  
  footer: {
    height: 72,
    padding: '16px 24px',
    background: 'bg-gray-50 dark:bg-gray-900',
    borderTop: 'border-t border-gray-200 dark:border-gray-700',
    actions: {
      alignment: 'flex justify-end space-x-3',
      primaryButton: 'bg-gradient-to-r from-purple-500 to-indigo-600',
      secondaryButton: 'border-2 border-purple-600 text-purple-600'
    }
  },
  
  // Backdrop
  backdrop: {
    background: 'bg-black/50',
    backdropFilter: 'blur(4px)',
    zIndex: 40
  }
}
```

### 5.2 Animation Specifications

```typescript
interface ModalAnimations {
  // Entry animation
  entry: {
    duration: 300,             // ms
    easing: 'ease-out',
    from: {
      opacity: 0,
      transform: 'scale(0.95) translateY(10px)'
    },
    to: {
      opacity: 1,
      transform: 'scale(1) translateY(0)'
    }
  },
  
  // Exit animation
  exit: {
    duration: 200,
    easing: 'ease-in',
    to: {
      opacity: 0,
      transform: 'scale(0.95) translateY(10px)'
    }
  },
  
  // Content transitions
  contentTransitions: {
    pageChange: 'slide-horizontal 300ms ease-in-out',
    tabSwitch: 'fade 200ms ease',
    accordionExpand: 'slide-down 250ms ease-out',
    loadingToContent: 'fade-up 400ms ease-out'
  }
}
```

---

## 6. Implementation Contract Extension

### 6.1 AI Content Generation Additions

The AI engine must now include dimensional hints:

```typescript
interface EnhancedAIContentResponse extends AIContentResponse {
  // Add dimensional hints
  dimensions: {
    recommended: {
      width: number | string;   // px or %
      height: number | string;  // px or %
    },
    constraints: {
      minWidth?: number;
      maxWidth?: number;
      minHeight?: number;
      maxHeight?: number;
      aspectRatio?: string;      // e.g., "16:9"
    },
    responsive: {
      breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
      adjustments: ResponsiveAdjustment[];
    },
    overflow: {
      strategy: 'scroll' | 'paginate' | 'accordion' | 'tabs';
      threshold: number;         // When to trigger strategy
    }
  };
  
  // Add UI guideline compliance
  uiCompliance: {
    colorScheme: 'LEARN' | 'EXPERIENCE' | 'DISCOVER';
    darkModeSupport: boolean;
    accessibilityLevel: 'A' | 'AA' | 'AAA';
    touchOptimized: boolean;
  };
}
```

### 6.2 Frontend Modal Factory Enhancement

```typescript
class EnhancedModalFactory {
  createModal(response: EnhancedAIContentResponse): Modal {
    // Get base modal
    const modal = super.createModal(response);
    
    // Apply dimensional specifications
    const dimensions = this.calculateDimensions(
      response.dimensions,
      response.modalType,
      this.viewport
    );
    modal.setDimensions(dimensions);
    
    // Apply UI guidelines
    const theme = this.getThemeForContainer(response.uiCompliance.colorScheme);
    modal.applyTheme(theme);
    
    // Setup overflow handling
    const overflowHandler = this.getOverflowHandler(
      response.dimensions.overflow.strategy
    );
    modal.setOverflowHandler(overflowHandler);
    
    // Apply responsive behavior
    this.applyResponsiveBehavior(modal, response.dimensions.responsive);
    
    return modal;
  }
}
```

---

## 7. Testing & Validation

### 7.1 Dimension Testing Matrix

| Content Volume | Modal Type | Expected Size | Overflow Strategy | Test Status |
|----------------|------------|---------------|-------------------|-------------|
| Minimal (< 100 chars) | FillBlank | 600x400 | None | ⬜ Pass ⬜ Fail |
| Standard (100-500 chars) | FillBlank | 700x500 | None | ⬜ Pass ⬜ Fail |
| Large (500-2000 chars) | FillBlank | 900x600 | Scroll | ⬜ Pass ⬜ Fail |
| Excessive (> 2000 chars) | FillBlank | 900x700 | Paginate | ⬜ Pass ⬜ Fail |
| 2 options | SingleSelect | 500x300 | None | ⬜ Pass ⬜ Fail |
| 5 options | SingleSelect | 600x450 | None | ⬜ Pass ⬜ Fail |
| 10 options | SingleSelect | 700x600 | Scroll | ⬜ Pass ⬜ Fail |
| Small canvas | Drawing | 700x525 | None | ⬜ Pass ⬜ Fail |
| Large canvas | Drawing | 1200x900 | Pan/Zoom | ⬜ Pass ⬜ Fail |

### 7.2 Responsive Testing Requirements

```typescript
interface ResponsiveTestCases {
  devices: [
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'iPad Air', width: 820, height: 1180 },
    { name: 'Desktop HD', width: 1920, height: 1080 },
    { name: 'Desktop 4K', width: 3840, height: 2160 }
  ],
  
  orientations: ['portrait', 'landscape'],
  
  testScenarios: [
    'Modal fits without scroll',
    'Content reflows properly',
    'Touch targets meet minimum size',
    'Text remains readable',
    'No horizontal overflow',
    'Animations perform smoothly'
  ]
}
```

---

## 8. Accessibility Compliance

### 8.1 WCAG 2.1 AA Requirements

```typescript
interface AccessibilityRequirements {
  // Minimum sizes
  minimumSizes: {
    touchTarget: 44,           // px (WCAG 2.5.5)
    fontSize: 16,              // px minimum
    lineHeight: 1.5,           // For readability
    spacing: 8                 // px between interactive elements
  },
  
  // Color contrast (per UI guidelines)
  contrast: {
    normalText: 4.5,           // :1 ratio
    largeText: 3.0,           // :1 ratio
    interactive: 3.0,          // :1 ratio
    focus: 3.0                 // :1 ratio
  },
  
  // Keyboard navigation
  keyboard: {
    tabOrder: 'logical',
    focusIndicator: 'ring-2 ring-purple-600 ring-offset-2',
    escapeClose: true,
    enterSubmit: true
  },
  
  // Screen reader
  screenReader: {
    modalRole: 'dialog',
    ariaLabels: true,
    ariaDescriptions: true,
    liveRegions: true,
    headingStructure: true
  }
}
```

---

## 9. Performance Optimization

### 9.1 Rendering Performance

```typescript
interface PerformanceTargets {
  // Initial render
  firstPaint: {
    target: 100,               // ms
    maximum: 200              // ms
  },
  
  // Interaction response
  interactionLatency: {
    target: 50,                // ms
    maximum: 100              // ms
  },
  
  // Animation frame rate
  animationFPS: {
    target: 60,                // fps
    minimum: 30               // fps
  },
  
  // Memory usage
  memoryUsage: {
    initial: 10,               // MB
    maximum: 50               // MB
  },
  
  // Optimization techniques
  optimizations: [
    'Virtual scrolling for long lists',
    'Lazy loading for images',
    'Debounced resize handlers',
    'RequestAnimationFrame for animations',
    'CSS containment for modal',
    'Will-change for animated properties'
  ]
}
```

---

## Implementation Checklist

### Design Team
- [ ] Create modal templates for each type
- [ ] Define responsive breakpoints
- [ ] Establish overflow strategies
- [ ] Document animation specifications
- [ ] Create accessibility guidelines

### Frontend Team
- [ ] Implement dynamic sizing algorithm
- [ ] Add overflow detection
- [ ] Create responsive handlers
- [ ] Implement theme switching
- [ ] Add performance monitoring

### AI Team
- [ ] Add dimension hints to responses
- [ ] Include overflow predictions
- [ ] Add UI compliance metadata
- [ ] Implement content volume analysis

### QA Team
- [ ] Test all modal dimensions
- [ ] Verify responsive behavior
- [ ] Check overflow handling
- [ ] Validate accessibility
- [ ] Performance testing

---

## Sign-off Requirements

### Design Approval
- **UI/UX Director:** _______________________ Date: _________
- **Visual Design Lead:** _______________________ Date: _________

### Technical Approval
- **Frontend Architecture Lead:** _______________________ Date: _________
- **AI/ML Team Lead:** _______________________ Date: _________

### Compliance Approval
- **Accessibility Lead:** _______________________ Date: _________
- **Performance Lead:** _______________________ Date: _________

---

*End of Modal Design Specifications*

**This specification ensures optimal modal sizing and prevents content overflow/underflow while maintaining brand consistency.**

---