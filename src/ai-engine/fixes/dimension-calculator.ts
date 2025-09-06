/**
 * Dimension Calculator - P1 High Priority Fix
 * Calculates optimal modal dimensions and predicts overflow
 */

import { 
  ModalTypeEnum,
  DimensionalHints,
  ContentVolumeMetrics,
  OverflowStrategy,
  ResponsiveBreakpoint 
} from '../types';

export class DimensionCalculator {
  // Base dimensions for each modal type
  private baseDimensions = new Map<ModalTypeEnum, any>([
    [ModalTypeEnum.FILL_BLANK, { width: 700, height: 400, minWidth: 500, minHeight: 300 }],
    [ModalTypeEnum.SINGLE_SELECT, { width: 600, height: 400, minWidth: 400, minHeight: 300 }],
    [ModalTypeEnum.MULTI_SELECT, { width: 650, height: 450, minWidth: 450, minHeight: 350 }],
    [ModalTypeEnum.DRAG_DROP, { width: 900, height: 600, minWidth: 700, minHeight: 500 }],
    [ModalTypeEnum.CODE_EDITOR, { width: 1200, height: 700, minWidth: 900, minHeight: 500 }],
    [ModalTypeEnum.MATH_INPUT, { width: 700, height: 500, minWidth: 600, minHeight: 400 }],
    [ModalTypeEnum.DRAWING, { width: 800, height: 600, minWidth: 600, minHeight: 450 }],
    [ModalTypeEnum.SEQUENCE, { width: 600, height: 500, minWidth: 500, minHeight: 400 }],
    [ModalTypeEnum.TRUE_FALSE, { width: 500, height: 300, minWidth: 400, minHeight: 250 }],
    [ModalTypeEnum.SHORT_ANSWER, { width: 650, height: 400, minWidth: 500, minHeight: 300 }],
    [ModalTypeEnum.ESSAY, { width: 800, height: 600, minWidth: 600, minHeight: 400 }]
  ]);

  /**
   * Calculate optimal dimensions for content
   */
  public calculateDimensions(
    content: any,
    modalType: ModalTypeEnum,
    deviceContext?: any
  ): DimensionalHints {
    // Get base dimensions
    const base = this.baseDimensions.get(modalType) || {
      width: 600,
      height: 400,
      minWidth: 400,
      minHeight: 300
    };

    // Calculate content volume
    const volume = this.calculateContentVolume(content, modalType);

    // Adjust dimensions based on content
    const adjusted = this.adjustForContent(base, volume, modalType);

    // Predict overflow
    const overflow = this.predictOverflow(adjusted, volume, deviceContext);

    // Generate responsive breakpoints
    const responsive = this.generateResponsiveBreakpoints(adjusted, modalType);

    return {
      recommended: {
        width: adjusted.width,
        height: adjusted.height,
        aspectRatio: adjusted.aspectRatio
      },
      constraints: {
        minWidth: adjusted.minWidth,
        maxWidth: adjusted.maxWidth || 1400,
        minHeight: adjusted.minHeight,
        maxHeight: adjusted.maxHeight || '80vh',
        maintainAspectRatio: adjusted.maintainAspectRatio || false
      },
      responsive: {
        breakpoints: responsive,
        mobileFullScreen: modalType === ModalTypeEnum.CODE_EDITOR,
        reflow: this.determineReflowStrategy(modalType)
      },
      overflow: overflow,
      contentFit: {
        optimal: overflow.predicted === false,
        adjustments: this.getRequiredAdjustments(adjusted, volume),
        warnings: this.getWarnings(adjusted, volume, overflow)
      }
    };
  }

  /**
   * Calculate content volume metrics
   */
  private calculateContentVolume(
    content: any,
    modalType: ModalTypeEnum
  ): ContentVolumeMetrics {
    const metrics: ContentVolumeMetrics = {
      text: {
        totalCharacters: 0,
        wordCount: 0,
        paragraphs: 0,
        readingTime: 0,
        complexity: 'simple'
      },
      elements: {
        totalItems: 0,
        visibleItems: 0,
        itemsPerPage: 0,
        interactionPoints: 0
      },
      media: {
        images: 0,
        videos: 0,
        audioClips: 0,
        totalSizeMB: 0,
        largestAssetMB: 0
      },
      complexity: {
        score: 1,
        factors: [],
        cognitiveLoad: 'low'
      }
    };

    // Calculate text metrics
    if (content.text || content.question || content.problem) {
      const text = content.text || content.question || content.problem || '';
      metrics.text.totalCharacters = text.length;
      metrics.text.wordCount = text.split(/\s+/).length;
      metrics.text.paragraphs = text.split(/\n\n+/).length;
      metrics.text.readingTime = Math.ceil(metrics.text.wordCount / 200 * 60); // 200 WPM
      metrics.text.complexity = this.assessTextComplexity(text);
    }

    // Calculate element metrics based on modal type
    switch (modalType) {
      case ModalTypeEnum.FILL_BLANK:
        if (content.blanks) {
          metrics.elements.totalItems = content.blanks.length;
          metrics.elements.visibleItems = Math.min(5, content.blanks.length);
          metrics.elements.interactionPoints = content.blanks.length;
        }
        break;

      case ModalTypeEnum.SINGLE_SELECT:
      case ModalTypeEnum.MULTI_SELECT:
        if (content.options) {
          metrics.elements.totalItems = content.options.length;
          metrics.elements.visibleItems = Math.min(6, content.options.length);
          metrics.elements.interactionPoints = content.options.length;
        }
        break;

      case ModalTypeEnum.DRAG_DROP:
        if (content.sources && content.targets) {
          metrics.elements.totalItems = content.sources.length + content.targets.length;
          metrics.elements.visibleItems = metrics.elements.totalItems;
          metrics.elements.interactionPoints = content.sources.length;
        }
        break;

      case ModalTypeEnum.SEQUENCE:
        if (content.items) {
          metrics.elements.totalItems = content.items.length;
          metrics.elements.visibleItems = Math.min(8, content.items.length);
          metrics.elements.interactionPoints = content.items.length;
        }
        break;
    }

    // Calculate media metrics
    if (content.images) {
      metrics.media.images = Array.isArray(content.images) ? content.images.length : 1;
    }
    if (content.videos) {
      metrics.media.videos = Array.isArray(content.videos) ? content.videos.length : 1;
    }

    // Calculate complexity score
    metrics.complexity = this.calculateComplexity(metrics, modalType);

    return metrics;
  }

  /**
   * Adjust dimensions based on content volume
   */
  private adjustForContent(
    base: any,
    volume: ContentVolumeMetrics,
    modalType: ModalTypeEnum
  ): any {
    let adjusted = { ...base };

    // Text adjustments
    if (volume.text.wordCount > 0) {
      const textFactor = Math.min(1.5, 1 + (volume.text.wordCount / 500) * 0.2);
      adjusted.width = Math.round(base.width * textFactor);
      
      // Height adjustment for text
      if (volume.text.paragraphs > 3) {
        adjusted.height = Math.round(base.height * Math.min(1.8, textFactor * 1.2));
      }
    }

    // Element-based adjustments
    switch (modalType) {
      case ModalTypeEnum.FILL_BLANK:
        // 60px per blank + padding
        adjusted.height = Math.max(
          base.minHeight,
          200 + (volume.elements.totalItems * 60) + 100
        );
        break;

      case ModalTypeEnum.SINGLE_SELECT:
      case ModalTypeEnum.MULTI_SELECT:
        // 70px per option
        adjusted.height = Math.max(
          base.minHeight,
          200 + (volume.elements.visibleItems * 70) + 100
        );
        // Wider for longer options
        if (volume.text.totalCharacters / volume.elements.totalItems > 50) {
          adjusted.width = Math.round(adjusted.width * 1.2);
        }
        break;

      case ModalTypeEnum.DRAG_DROP:
        // Need more space for drag and drop
        const itemSize = 120; // Approximate item size
        const cols = Math.ceil(Math.sqrt(volume.elements.totalItems));
        const rows = Math.ceil(volume.elements.totalItems / cols);
        adjusted.width = Math.max(base.minWidth, cols * itemSize + 200);
        adjusted.height = Math.max(base.minHeight, rows * itemSize + 200);
        break;

      case ModalTypeEnum.CODE_EDITOR:
        // Code editors need more space
        if (volume.text.totalCharacters > 500) {
          adjusted.height = Math.min(900, base.height * 1.3);
        }
        break;

      case ModalTypeEnum.DRAWING:
        // Drawing needs aspect ratio
        adjusted.aspectRatio = '4:3';
        adjusted.maintainAspectRatio = true;
        break;
    }

    // Media adjustments
    if (volume.media.images > 0 || volume.media.videos > 0) {
      adjusted.width = Math.round(adjusted.width * 1.2);
      adjusted.height = Math.round(adjusted.height * 1.2);
    }

    // Complexity adjustments
    if (volume.complexity.score > 5) {
      adjusted.width = Math.round(adjusted.width * 1.1);
      adjusted.height = Math.round(adjusted.height * 1.1);
    }

    // Set max dimensions
    adjusted.maxWidth = Math.min(1400, adjusted.width * 1.5);
    adjusted.maxHeight = Math.min(900, adjusted.height * 1.5);

    return adjusted;
  }

  /**
   * Predict overflow based on dimensions and content
   */
  private predictOverflow(
    dimensions: any,
    volume: ContentVolumeMetrics,
    deviceContext?: any
  ): any {
    const viewport = deviceContext?.viewport || { width: 1920, height: 1080 };
    
    const willOverflow = {
      vertical: dimensions.height > (viewport.height * 0.8),
      horizontal: dimensions.width > (viewport.width * 0.9),
      content: volume.elements.totalItems > volume.elements.visibleItems
    };

    let strategy: OverflowStrategy = 'none';
    let threshold = {
      vertical: viewport.height * 0.8,
      horizontal: viewport.width * 0.9,
      items: 10
    };

    // Determine overflow strategy
    if (willOverflow.vertical || willOverflow.content) {
      if (volume.elements.totalItems > 10) {
        strategy = 'paginate';
        threshold.items = 5; // Items per page
      } else if (volume.text.paragraphs > 5) {
        strategy = 'accordion';
      } else {
        strategy = 'scroll';
      }
    }

    if (willOverflow.horizontal) {
      if (deviceContext?.device?.type === 'mobile') {
        strategy = 'tabs';
      } else {
        strategy = 'horizontal-scroll';
      }
    }

    return {
      predicted: Object.values(willOverflow).some(v => v),
      strategy: strategy,
      threshold: threshold,
      fallback: 'scroll'
    };
  }

  /**
   * Generate responsive breakpoints
   */
  private generateResponsiveBreakpoints(
    baseDimensions: any,
    modalType: ModalTypeEnum
  ): ResponsiveBreakpoint[] {
    const breakpoints: ResponsiveBreakpoint[] = [
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
          layout: 'vertical'
        }
      },
      {
        breakpoint: 'md',
        viewport: { minWidth: 768, maxWidth: 1023 },
        dimensions: {
          width: '90%',
          height: 'auto',
          maxWidth: Math.min(800, baseDimensions.width),
          maxHeight: '80vh'
        },
        adjustments: {
          padding: 24,
          fontSize: 16,
          spacing: 16,
          layout: modalType === ModalTypeEnum.DRAG_DROP ? 'vertical' : 'horizontal'
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
        viewport: { minWidth: 1280 },
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
      }
    ];

    return breakpoints;
  }

  /**
   * Assess text complexity
   */
  private assessTextComplexity(text: string): 'simple' | 'moderate' | 'complex' {
    const avgWordLength = text.length / text.split(/\s+/).length;
    const sentenceCount = text.split(/[.!?]+/).length;
    const avgSentenceLength = text.split(/\s+/).length / sentenceCount;

    if (avgWordLength > 6 || avgSentenceLength > 20) {
      return 'complex';
    } else if (avgWordLength > 4 || avgSentenceLength > 15) {
      return 'moderate';
    }
    return 'simple';
  }

  /**
   * Calculate overall complexity score
   */
  private calculateComplexity(
    metrics: ContentVolumeMetrics,
    modalType: ModalTypeEnum
  ): any {
    let score = 1;
    const factors = [];

    // Text complexity
    if (metrics.text.complexity === 'complex') {
      score += 2;
      factors.push('complex-text');
    } else if (metrics.text.complexity === 'moderate') {
      score += 1;
      factors.push('moderate-text');
    }

    // Element count
    if (metrics.elements.totalItems > 10) {
      score += 2;
      factors.push('many-elements');
    } else if (metrics.elements.totalItems > 5) {
      score += 1;
      factors.push('multiple-elements');
    }

    // Media presence
    if (metrics.media.images > 0 || metrics.media.videos > 0) {
      score += 1;
      factors.push('has-media');
    }

    // Modal type complexity
    const complexModals = [
      ModalTypeEnum.CODE_EDITOR,
      ModalTypeEnum.DRAG_DROP,
      ModalTypeEnum.SIMULATION,
      ModalTypeEnum.DRAWING
    ];
    
    if (complexModals.includes(modalType)) {
      score += 2;
      factors.push('complex-interaction');
    }

    // Determine cognitive load
    let cognitiveLoad: 'low' | 'medium' | 'high' = 'low';
    if (score > 6) {
      cognitiveLoad = 'high';
    } else if (score > 3) {
      cognitiveLoad = 'medium';
    }

    return {
      score: Math.min(score, 10),
      factors,
      cognitiveLoad
    };
  }

  /**
   * Determine reflow strategy for responsive
   */
  private determineReflowStrategy(modalType: ModalTypeEnum): string {
    const verticalReflow = [
      ModalTypeEnum.DRAG_DROP,
      ModalTypeEnum.CODE_EDITOR,
      ModalTypeEnum.DRAWING
    ];

    const tabReflow = [
      ModalTypeEnum.SIMULATION,
      ModalTypeEnum.SCENARIO
    ];

    if (verticalReflow.includes(modalType)) {
      return 'vertical';
    } else if (tabReflow.includes(modalType)) {
      return 'tabs';
    }

    return 'adaptive';
  }

  /**
   * Get required adjustments
   */
  private getRequiredAdjustments(dimensions: any, volume: ContentVolumeMetrics): any[] {
    const adjustments = [];

    if (volume.elements.totalItems > volume.elements.visibleItems) {
      adjustments.push({
        type: 'implement-scrolling',
        reason: 'Content exceeds visible area'
      });
    }

    if (dimensions.width > 1200) {
      adjustments.push({
        type: 'responsive-sizing',
        reason: 'Width may exceed smaller screens'
      });
    }

    if (volume.complexity.cognitiveLoad === 'high') {
      adjustments.push({
        type: 'add-scaffolding',
        reason: 'High cognitive load detected'
      });
    }

    return adjustments;
  }

  /**
   * Get warnings for dimension issues
   */
  private getWarnings(dimensions: any, volume: ContentVolumeMetrics, overflow: any): string[] {
    const warnings = [];

    if (overflow.predicted) {
      warnings.push(`Content will overflow. Strategy: ${overflow.strategy}`);
    }

    if (dimensions.width > 1400) {
      warnings.push('Modal width exceeds recommended maximum');
    }

    if (dimensions.height > 900) {
      warnings.push('Modal height exceeds recommended maximum');
    }

    if (volume.elements.totalItems > 20) {
      warnings.push('Large number of elements may impact performance');
    }

    if (volume.media.totalSizeMB > 5) {
      warnings.push('Large media files may slow loading');
    }

    return warnings;
  }
}

// Singleton export
export const dimensionCalculator = new DimensionCalculator();