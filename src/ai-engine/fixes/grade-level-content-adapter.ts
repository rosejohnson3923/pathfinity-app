/**
 * Grade Level Content Adapter
 * Ensures content complexity and dimensions are appropriate for student age groups
 */

import { 
  GradeLevel,
  ContentComplexityProfile,
  ModalTypeEnum,
  DimensionalHints
} from '../types';

export class GradeLevelContentAdapter {
  
  /**
   * Grade-specific content complexity profiles
   */
  private gradeProfiles = new Map<GradeLevel, ContentComplexityProfile>([
    ['K-2', {
      text: {
        wordsPerSentence: { min: 5, max: 7, optimal: 6 },
        sentencesPerParagraph: { min: 1, max: 2, optimal: 1 },
        totalWords: { min: 10, max: 50, optimal: 30 },
        vocabularyLevel: 'basic',
        readingLevel: 1,
        syllablesPerWord: { max: 2 }
      },
      interaction: {
        optionsPerQuestion: { min: 2, max: 3, optimal: 2 },
        blanksPerExercise: { min: 1, max: 2, optimal: 1 },
        stepsPerProblem: { min: 1, max: 2, optimal: 1 },
        itemsPerPage: { min: 1, max: 3, optimal: 2 }
      },
      visual: {
        requiresImages: true,
        imageToTextRatio: 0.5, // 50% images
        animationsRecommended: true,
        colorfulInterface: true
      },
      timing: {
        attentionSpan: 5, // minutes
        optimalSessionLength: 10, // minutes
        breakFrequency: 5 // minutes
      },
      dimensions: {
        baseModalSize: { width: 500, height: 350 },
        fontSize: 18,
        buttonSize: 60,
        spacing: 20,
        needsLargeTargets: true
      },
      images: {
        optionImageSize: { width: 100, height: 100 }, // Large, simple images
        contentImageSize: { width: 200, height: 150 },
        maxImageWidth: 250,
        maxImageHeight: 200,
        thumbnailSize: { width: 80, height: 80 },
        requiresAltText: true,
        preferredFormat: 'cartoon', // Cartoon/illustrated style
        complexity: 'simple' // Simple, clear images
      }
    }],
    
    ['3-5', {
      text: {
        wordsPerSentence: { min: 8, max: 12, optimal: 10 },
        sentencesPerParagraph: { min: 2, max: 3, optimal: 2 },
        totalWords: { min: 50, max: 150, optimal: 100 },
        vocabularyLevel: 'elementary',
        readingLevel: 3,
        syllablesPerWord: { max: 3 }
      },
      interaction: {
        optionsPerQuestion: { min: 3, max: 4, optimal: 4 },
        blanksPerExercise: { min: 2, max: 4, optimal: 3 },
        stepsPerProblem: { min: 2, max: 4, optimal: 3 },
        itemsPerPage: { min: 3, max: 6, optimal: 5 }
      },
      visual: {
        requiresImages: true,
        imageToTextRatio: 0.3, // 30% images
        animationsRecommended: true,
        colorfulInterface: true
      },
      timing: {
        attentionSpan: 15, // minutes
        optimalSessionLength: 20, // minutes
        breakFrequency: 10 // minutes
      },
      dimensions: {
        baseModalSize: { width: 600, height: 400 },
        fontSize: 16,
        buttonSize: 50,
        spacing: 16,
        needsLargeTargets: true
      },
      images: {
        optionImageSize: { width: 75, height: 75 }, // Medium-sized, semi-detailed
        contentImageSize: { width: 150, height: 125 },
        maxImageWidth: 200,
        maxImageHeight: 175,
        thumbnailSize: { width: 60, height: 60 },
        requiresAltText: true,
        preferredFormat: 'illustrated', // Mix of cartoon and realistic
        complexity: 'moderate' // More detailed images
      }
    }],
    
    ['6-8', {
      text: {
        wordsPerSentence: { min: 10, max: 18, optimal: 15 },
        sentencesPerParagraph: { min: 3, max: 5, optimal: 4 },
        totalWords: { min: 150, max: 400, optimal: 250 },
        vocabularyLevel: 'intermediate',
        readingLevel: 6,
        syllablesPerWord: { max: 4 }
      },
      interaction: {
        optionsPerQuestion: { min: 4, max: 6, optimal: 5 },
        blanksPerExercise: { min: 3, max: 6, optimal: 4 },
        stepsPerProblem: { min: 3, max: 7, optimal: 5 },
        itemsPerPage: { min: 5, max: 10, optimal: 8 }
      },
      visual: {
        requiresImages: false,
        imageToTextRatio: 0.2, // 20% images
        animationsRecommended: false,
        colorfulInterface: false
      },
      timing: {
        attentionSpan: 25, // minutes
        optimalSessionLength: 30, // minutes
        breakFrequency: 15 // minutes
      },
      dimensions: {
        baseModalSize: { width: 700, height: 500 },
        fontSize: 15,
        buttonSize: 44,
        spacing: 14,
        needsLargeTargets: false
      },
      images: {
        optionImageSize: { width: 60, height: 60 }, // Standard, realistic images
        contentImageSize: { width: 120, height: 100 },
        maxImageWidth: 150,
        maxImageHeight: 125,
        thumbnailSize: { width: 45, height: 45 },
        requiresAltText: true,
        preferredFormat: 'realistic', // More realistic/photographic
        complexity: 'detailed' // Detailed, informative images
      }
    }],
    
    ['9-12', {
      text: {
        wordsPerSentence: { min: 15, max: 25, optimal: 20 },
        sentencesPerParagraph: { min: 4, max: 7, optimal: 5 },
        totalWords: { min: 300, max: 800, optimal: 500 },
        vocabularyLevel: 'advanced',
        readingLevel: 9,
        syllablesPerWord: { max: 6 }
      },
      interaction: {
        optionsPerQuestion: { min: 4, max: 8, optimal: 6 },
        blanksPerExercise: { min: 4, max: 10, optimal: 6 },
        stepsPerProblem: { min: 5, max: 15, optimal: 10 },
        itemsPerPage: { min: 8, max: 15, optimal: 12 }
      },
      visual: {
        requiresImages: false,
        imageToTextRatio: 0.1, // 10% images
        animationsRecommended: false,
        colorfulInterface: false
      },
      timing: {
        attentionSpan: 45, // minutes
        optimalSessionLength: 45, // minutes
        breakFrequency: 20 // minutes
      },
      dimensions: {
        baseModalSize: { width: 800, height: 600 },
        fontSize: 14,
        buttonSize: 40,
        spacing: 12,
        needsLargeTargets: false
      },
      images: {
        optionImageSize: { width: 50, height: 50 }, // Smaller, complex images
        contentImageSize: { width: 100, height: 80 },
        maxImageWidth: 120,
        maxImageHeight: 100,
        thumbnailSize: { width: 40, height: 40 },
        requiresAltText: true,
        preferredFormat: 'technical', // Technical/diagram/scientific
        complexity: 'complex' // Complex, data-rich images
      }
    }]
  ]);

  /**
   * Adapt content based on grade level
   */
  public adaptContentForGrade(
    content: any,
    gradeLevel: GradeLevel,
    modalType: ModalTypeEnum
  ): any {
    const profile = this.gradeProfiles.get(gradeLevel);
    if (!profile) {
      console.warn(`No profile for grade level ${gradeLevel}, using 6-8`);
      return content;
    }

    // Adapt based on modal type
    switch (modalType) {
      case ModalTypeEnum.FILL_BLANK:
        return this.adaptFillBlank(content, profile);
      
      case ModalTypeEnum.SINGLE_SELECT:
      case ModalTypeEnum.MULTI_SELECT:
        return this.adaptSelection(content, profile);
      
      case ModalTypeEnum.SHORT_ANSWER:
      case ModalTypeEnum.ESSAY:
        return this.adaptTextResponse(content, profile);
      
      case ModalTypeEnum.DRAG_DROP:
        return this.adaptDragDrop(content, profile);
      
      case ModalTypeEnum.CODE_EDITOR:
        return this.adaptCodeEditor(content, profile, gradeLevel);
      
      default:
        return this.adaptGeneric(content, profile);
    }
  }

  /**
   * Calculate dimensions based on grade level
   */
  public calculateGradeAppropriaDimensions(
    gradeLevel: GradeLevel,
    modalType: ModalTypeEnum,
    contentVolume: any
  ): DimensionalHints {
    const profile = this.gradeProfiles.get(gradeLevel);
    if (!profile) {
      return this.getDefaultDimensions();
    }

    const base = profile.dimensions.baseModalSize;
    
    // K-2: Minimal content, large UI elements
    if (gradeLevel === 'K-2') {
      return {
        recommended: {
          width: Math.min(base.width, 550),
          height: Math.min(base.height, 400),
          aspectRatio: '4:3'
        },
        constraints: {
          minWidth: 400,
          maxWidth: 600,
          minHeight: 300,
          maxHeight: 450,
          maintainAspectRatio: false
        },
        responsive: {
          breakpoints: this.getSimplifiedBreakpoints(),
          mobileFullScreen: false,
          reflow: 'vertical'
        },
        overflow: {
          predicted: false, // Unlikely with 5-7 word sentences
          strategy: 'none',
          threshold: { items: 3 },
          fallback: 'none'
        },
        contentFit: {
          optimal: true,
          adjustments: [],
          warnings: []
        }
      };
    }
    
    // 3-5: Moderate content, still needs good spacing
    if (gradeLevel === '3-5') {
      return {
        recommended: {
          width: base.width,
          height: base.height + (contentVolume.elements?.totalItems || 0) * 30
        },
        constraints: {
          minWidth: 500,
          maxWidth: 700,
          minHeight: 350,
          maxHeight: 550,
          maintainAspectRatio: false
        },
        responsive: {
          breakpoints: this.getStandardBreakpoints(),
          mobileFullScreen: false,
          reflow: 'adaptive'
        },
        overflow: {
          predicted: contentVolume.elements?.totalItems > 6,
          strategy: contentVolume.elements?.totalItems > 6 ? 'scroll' : 'none',
          threshold: { items: 6 },
          fallback: 'scroll'
        },
        contentFit: {
          optimal: contentVolume.elements?.totalItems <= 6,
          adjustments: [],
          warnings: []
        }
      };
    }
    
    // 6-8: More complex content, standard sizing
    if (gradeLevel === '6-8') {
      const needsScroll = contentVolume.text?.wordCount > 400 || 
                         contentVolume.elements?.totalItems > 10;
      
      return {
        recommended: {
          width: base.width + (needsScroll ? 50 : 0),
          height: Math.min(base.height + (contentVolume.elements?.totalItems || 0) * 40, 700)
        },
        constraints: {
          minWidth: 600,
          maxWidth: 900,
          minHeight: 400,
          maxHeight: '75vh',
          maintainAspectRatio: false
        },
        responsive: {
          breakpoints: this.getStandardBreakpoints(),
          mobileFullScreen: modalType === ModalTypeEnum.CODE_EDITOR,
          reflow: 'adaptive'
        },
        overflow: {
          predicted: needsScroll,
          strategy: needsScroll ? 'scroll' : 'none',
          threshold: { items: 10, words: 400 },
          fallback: 'paginate'
        },
        contentFit: {
          optimal: !needsScroll,
          adjustments: needsScroll ? [{ type: 'add-scrolling', reason: 'Content exceeds viewport' }] : [],
          warnings: []
        }
      };
    }
    
    // 9-12: Complex content, likely needs scrolling/pagination
    const needsOverflowHandling = contentVolume.text?.wordCount > 500 || 
                                  contentVolume.elements?.totalItems > 12;
    
    return {
      recommended: {
        width: base.width + 100,
        height: Math.min(base.height + (contentVolume.elements?.totalItems || 0) * 35, 800)
      },
      constraints: {
        minWidth: 700,
        maxWidth: 1200,
        minHeight: 500,
        maxHeight: '80vh',
        maintainAspectRatio: false
      },
      responsive: {
        breakpoints: this.getStandardBreakpoints(),
        mobileFullScreen: modalType === ModalTypeEnum.CODE_EDITOR,
        reflow: 'adaptive'
      },
      overflow: {
        predicted: needsOverflowHandling,
        strategy: this.determineOverflowStrategy(contentVolume, modalType),
        threshold: { items: 12, words: 500 },
        fallback: 'paginate'
      },
      contentFit: {
        optimal: !needsOverflowHandling,
        adjustments: this.getRequiredAdjustments(contentVolume),
        warnings: contentVolume.text?.wordCount > 800 
          ? ['Large amount of text may require pagination'] 
          : []
      }
    };
  }

  /**
   * Adapt fill-in-blank content for grade level
   */
  private adaptFillBlank(content: any, profile: ContentComplexityProfile): any {
    const adapted = { ...content };
    
    // Limit number of blanks based on grade
    if (adapted.blanks && adapted.blanks.length > profile.interaction.blanksPerExercise.max) {
      adapted.blanks = adapted.blanks.slice(0, profile.interaction.blanksPerExercise.max);
    }
    
    // Simplify text if needed
    if (adapted.text) {
      adapted.text = this.simplifyText(adapted.text, profile.text);
    }
    
    // Add visual hints for younger grades
    if (profile.visual.requiresImages) {
      adapted.visualHints = true;
      adapted.wordBank = true; // Provide word bank for younger students
    }
    
    return adapted;
  }

  /**
   * Adapt selection questions for grade level
   */
  private adaptSelection(content: any, profile: ContentComplexityProfile): any {
    const adapted = { ...content };
    
    // Limit number of options
    if (adapted.options && adapted.options.length > profile.interaction.optionsPerQuestion.max) {
      // Keep correct option(s) and reduce incorrect ones
      const correct = adapted.options.filter(o => o.isCorrect);
      const incorrect = adapted.options.filter(o => !o.isCorrect)
        .slice(0, profile.interaction.optionsPerQuestion.max - correct.length);
      adapted.options = [...correct, ...incorrect];
    }
    
    // Simplify option text
    if (adapted.options) {
      adapted.options = adapted.options.map(option => ({
        ...option,
        content: this.simplifyText(option.content, profile.text)
      }));
    }
    
    // Simplify question
    if (adapted.question) {
      adapted.question = this.simplifyText(adapted.question, profile.text);
    }
    
    // Add images for K-2 and configure image sizes
    if (profile.visual.requiresImages && !adapted.hasImages) {
      adapted.useIconOptions = true;
    }
    
    // Apply image sizing if profile has image specifications
    if (profile.images) {
      adapted.imageSpecs = {
        optionSize: profile.images.optionImageSize,
        contentSize: profile.images.contentImageSize,
        maxSize: {
          width: profile.images.maxImageWidth,
          height: profile.images.maxImageHeight
        },
        format: profile.images.preferredFormat,
        complexity: profile.images.complexity
      };
    }
    
    return adapted;
  }

  /**
   * Adapt text response for grade level
   */
  private adaptTextResponse(content: any, profile: ContentComplexityProfile): any {
    const adapted = { ...content };
    
    // Set appropriate length requirements
    adapted.minWords = Math.floor(profile.text.totalWords.min / 2);
    adapted.maxWords = profile.text.totalWords.max;
    adapted.expectedWords = profile.text.totalWords.optimal;
    
    // Simplify prompt
    if (adapted.prompt) {
      adapted.prompt = this.simplifyText(adapted.prompt, profile.text);
    }
    
    // Add scaffolding for younger grades
    if (profile.text.readingLevel <= 3) {
      adapted.sentenceStarters = this.getSentenceStarters(profile.text.readingLevel);
      adapted.showWordCount = true;
      adapted.spellCheck = true;
    }
    
    return adapted;
  }

  /**
   * Adapt drag and drop for grade level
   */
  private adaptDragDrop(content: any, profile: ContentComplexityProfile): any {
    const adapted = { ...content };
    
    // Limit number of items
    if (adapted.sources && adapted.sources.length > profile.interaction.itemsPerPage.max) {
      adapted.sources = adapted.sources.slice(0, profile.interaction.itemsPerPage.max);
    }
    
    // Simplify for younger grades
    if (profile.text.readingLevel <= 3) {
      adapted.snapToGrid = true;
      adapted.showDropZoneHints = true;
      adapted.allowReset = true;
      adapted.provideFeedback = 'immediate';
    }
    
    return adapted;
  }

  /**
   * Adapt code editor for grade level
   */
  private adaptCodeEditor(content: any, profile: ContentComplexityProfile, gradeLevel: GradeLevel): any {
    const adapted = { ...content };
    
    // Use block-based coding for younger grades
    if (gradeLevel === 'K-2' || gradeLevel === '3-5') {
      adapted.useBlockly = true;
      adapted.language = 'blockly';
      adapted.showVisualOutput = true;
    } else if (gradeLevel === '6-8') {
      // Simplified text-based coding
      adapted.language = adapted.language || 'python';
      adapted.syntaxHighlighting = true;
      adapted.autoComplete = true;
      adapted.showHints = true;
    }
    // 9-12 gets full features
    
    return adapted;
  }

  /**
   * Generic content adaptation
   */
  private adaptGeneric(content: any, profile: ContentComplexityProfile): any {
    const adapted = { ...content };
    
    // Apply text simplification to all text fields
    for (const key in adapted) {
      if (typeof adapted[key] === 'string' && adapted[key].length > 20) {
        adapted[key] = this.simplifyText(adapted[key], profile.text);
      }
    }
    
    return adapted;
  }

  /**
   * Simplify text based on profile requirements
   */
  private simplifyText(text: string, textProfile: any): string {
    if (!text) return text;
    
    // Split into sentences
    let sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    // Limit sentence length
    sentences = sentences.map(sentence => {
      const words = sentence.trim().split(/\s+/);
      if (words.length > textProfile.wordsPerSentence.max) {
        // Break long sentences
        const chunks = [];
        for (let i = 0; i < words.length; i += textProfile.wordsPerSentence.optimal) {
          chunks.push(words.slice(i, i + textProfile.wordsPerSentence.optimal).join(' '));
        }
        return chunks.join('. ');
      }
      return sentence;
    });
    
    // Limit total sentences based on paragraph requirements
    const maxSentences = textProfile.sentencesPerParagraph.max * 2; // Allow 2 paragraphs
    if (sentences.length > maxSentences) {
      sentences = sentences.slice(0, maxSentences);
    }
    
    return sentences.join('. ') + '.';
  }

  /**
   * Get sentence starters for scaffolding
   */
  private getSentenceStarters(readingLevel: number): string[] {
    if (readingLevel <= 1) {
      return ['I see...', 'The answer is...', 'This is...'];
    } else if (readingLevel <= 3) {
      return ['I think...', 'The answer is...', 'First...', 'Next...'];
    } else {
      return ['In my opinion...', 'The evidence shows...', 'To begin with...'];
    }
  }

  /**
   * Determine overflow strategy based on content and grade
   */
  private determineOverflowStrategy(volume: any, modalType: ModalTypeEnum): string {
    // Essays and long text: scroll
    if (modalType === ModalTypeEnum.ESSAY || modalType === ModalTypeEnum.SHORT_ANSWER) {
      return 'scroll';
    }
    
    // Many items: paginate
    if (volume.elements?.totalItems > 15) {
      return 'paginate';
    }
    
    // Complex content: accordion
    if (volume.complexity?.score > 7) {
      return 'accordion';
    }
    
    // Default to scroll
    return 'scroll';
  }

  /**
   * Get required adjustments for content
   */
  private getRequiredAdjustments(volume: any): any[] {
    const adjustments = [];
    
    if (volume.text?.wordCount > 500) {
      adjustments.push({
        type: 'add-reading-time',
        reason: 'Large amount of text'
      });
    }
    
    if (volume.elements?.totalItems > 15) {
      adjustments.push({
        type: 'implement-pagination',
        reason: 'Too many items for single view'
      });
    }
    
    if (volume.complexity?.cognitiveLoad === 'high') {
      adjustments.push({
        type: 'add-scaffolding',
        reason: 'High cognitive load detected'
      });
    }
    
    return adjustments;
  }

  /**
   * Get simplified breakpoints for younger grades
   */
  private getSimplifiedBreakpoints(): any[] {
    return [
      {
        breakpoint: 'xs',
        viewport: { minWidth: 0, maxWidth: 767 },
        dimensions: { width: '100%', height: 'auto', maxHeight: '90vh' },
        adjustments: { padding: 20, fontSize: 18, spacing: 16 }
      },
      {
        breakpoint: 'lg',
        viewport: { minWidth: 768 },
        dimensions: { width: 550, height: 400 },
        adjustments: { padding: 24, fontSize: 18, spacing: 20 }
      }
    ];
  }

  /**
   * Get standard breakpoints
   */
  private getStandardBreakpoints(): any[] {
    // Standard responsive breakpoints
    return [
      { breakpoint: 'xs', viewport: { minWidth: 0, maxWidth: 479 } },
      { breakpoint: 'sm', viewport: { minWidth: 480, maxWidth: 767 } },
      { breakpoint: 'md', viewport: { minWidth: 768, maxWidth: 1023 } },
      { breakpoint: 'lg', viewport: { minWidth: 1024, maxWidth: 1279 } },
      { breakpoint: 'xl', viewport: { minWidth: 1280 } }
    ];
  }

  /**
   * Get default dimensions fallback
   */
  private getDefaultDimensions(): DimensionalHints {
    return {
      recommended: { width: 600, height: 400 },
      constraints: {
        minWidth: 400,
        maxWidth: 1200,
        minHeight: 300,
        maxHeight: '80vh',
        maintainAspectRatio: false
      },
      responsive: {
        breakpoints: this.getStandardBreakpoints(),
        mobileFullScreen: false,
        reflow: 'adaptive'
      },
      overflow: {
        predicted: false,
        strategy: 'none',
        threshold: {},
        fallback: 'scroll'
      },
      contentFit: {
        optimal: true,
        adjustments: [],
        warnings: []
      }
    };
  }

  /**
   * Validate content is appropriate for grade level
   */
  public validateGradeAppropriateness(
    content: any,
    gradeLevel: GradeLevel
  ): { valid: boolean; issues: string[] } {
    const profile = this.gradeProfiles.get(gradeLevel);
    if (!profile) {
      return { valid: false, issues: ['Unknown grade level'] };
    }

    const issues = [];

    // Check text complexity
    if (content.text || content.question) {
      const text = content.text || content.question;
      const words = text.split(/\s+/);
      const avgWordLength = text.length / words.length;
      
      if (avgWordLength > profile.text.syllablesPerWord.max * 2.5) {
        issues.push('Text complexity too high for grade level');
      }
      
      if (words.length > profile.text.totalWords.max) {
        issues.push('Text length exceeds grade level maximum');
      }
    }

    // Check interaction complexity
    if (content.options && content.options.length > profile.interaction.optionsPerQuestion.max) {
      issues.push('Too many options for grade level');
    }

    if (content.blanks && content.blanks.length > profile.interaction.blanksPerExercise.max) {
      issues.push('Too many blanks for grade level');
    }

    // Check timing requirements
    const estimatedTime = this.estimateCompletionTime(content, profile);
    if (estimatedTime > profile.timing.attentionSpan * 60) {
      issues.push('Content exceeds attention span for grade level');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Estimate completion time for content
   */
  private estimateCompletionTime(content: any, profile: ContentComplexityProfile): number {
    let time = 0;

    // Reading time
    if (content.text || content.question) {
      const text = content.text || content.question;
      const words = text.split(/\s+/).length;
      const wpm = 150 - (profile.text.readingLevel * 10); // Slower for younger readers
      time += (words / wpm) * 60;
    }

    // Interaction time
    if (content.options) {
      time += content.options.length * 5; // 5 seconds per option
    }

    if (content.blanks) {
      time += content.blanks.length * 15; // 15 seconds per blank
    }

    return time;
  }
}

// Type definition for content complexity profile
interface ContentComplexityProfile {
  text: {
    wordsPerSentence: { min: number; max: number; optimal: number };
    sentencesPerParagraph: { min: number; max: number; optimal: number };
    totalWords: { min: number; max: number; optimal: number };
    vocabularyLevel: string;
    readingLevel: number;
    syllablesPerWord: { max: number };
  };
  interaction: {
    optionsPerQuestion: { min: number; max: number; optimal: number };
    blanksPerExercise: { min: number; max: number; optimal: number };
    stepsPerProblem: { min: number; max: number; optimal: number };
    itemsPerPage: { min: number; max: number; optimal: number };
  };
  visual: {
    requiresImages: boolean;
    imageToTextRatio: number;
    animationsRecommended: boolean;
    colorfulInterface: boolean;
  };
  timing: {
    attentionSpan: number;
    optimalSessionLength: number;
    breakFrequency: number;
  };
  dimensions: {
    baseModalSize: { width: number; height: number };
    fontSize: number;
    buttonSize: number;
    spacing: number;
    needsLargeTargets: boolean;
  };
  images?: {
    optionImageSize: { width: number; height: number };
    contentImageSize: { width: number; height: number };
    maxImageWidth: number;
    maxImageHeight: number;
    thumbnailSize: { width: number; height: number };
    requiresAltText: boolean;
    preferredFormat: 'cartoon' | 'illustrated' | 'realistic' | 'technical';
    complexity: 'simple' | 'moderate' | 'detailed' | 'complex';
  };
}

// Singleton export
export const gradeLevelContentAdapter = new GradeLevelContentAdapter();