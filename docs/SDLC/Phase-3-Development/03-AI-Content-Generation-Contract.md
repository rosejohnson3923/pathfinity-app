# AI Content Generation Contract Specification
## Standardized Output Format for UI Modal Mapping

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Technical Specification  
**Owner:** AI/ML Architecture Lead  
**Purpose:** Define the standardized contract between AI content generation and UI modal consumption

---

## Executive Summary

This document specifies the exact data contract that the AI content generation engine must follow to ensure seamless integration with UI modals. Every piece of AI-generated content must include metadata that explicitly identifies the modal type, validation rules, and display configuration, enabling automatic and error-free rendering in the application UI.

---

## 1. Universal Content Response Structure

### 1.1 Base Response Schema

```typescript
interface AIContentResponse {
  // Required Fields
  contentId: string;                    // Unique identifier for tracking
  modalType: ModalTypeEnum;             // Explicit modal type declaration
  contentType: ContentTypeEnum;         // Content classification
  version: string;                      // Schema version for compatibility
  timestamp: string;                    // Generation timestamp
  
  // Content Payload
  content: {
    data: any;                         // Type-specific content data
    metadata: ContentMetadata;         // Additional content information
    validation: ValidationRules;        // Client-side validation rules
    display: DisplayConfiguration;     // UI rendering instructions
  };
  
  // Context Information
  context: {
    studentId: string;
    sessionId: string;
    lessonId: string;
    career: string;
    gradeLevel: string;
    subject: string;
    difficulty: number;
    generatedBy: string;               // Which Finn agent generated this
  };
  
  // Scoring & Feedback
  evaluation: {
    scoringMethod: ScoringMethodEnum;
    pointValue: number;
    partialCredit: boolean;
    rubric?: Rubric;
    feedback: FeedbackConfiguration;
  };
  
  // Accessibility & Localization
  accessibility?: AccessibilityConfig;
  localization?: LocalizationConfig;
  
  // Performance Hints
  performance?: {
    preloadAssets: string[];
    estimatedLoadTime: number;
    cacheStrategy: 'aggressive' | 'normal' | 'none';
  };
}
```

### 1.2 Modal Type Enumeration

```typescript
enum ModalTypeEnum {
  // Assessment Modals
  FILL_BLANK = 'FillBlankModal',
  SINGLE_SELECT = 'SingleSelectModal',
  MULTI_SELECT = 'MultiSelectModal',
  DRAG_DROP = 'DragDropModal',
  SEQUENCE = 'SequenceModal',
  TRUE_FALSE = 'BinaryModal',
  MATCHING = 'MatchingModal',
  SHORT_ANSWER = 'ShortAnswerModal',
  ESSAY = 'EssayModal',
  DRAWING = 'DrawingModal',
  
  // Interactive Modals
  CODE_EDITOR = 'CodeEditorModal',
  MATH_INPUT = 'MathInputModal',
  GRAPH_CHART = 'GraphModal',
  TIMELINE = 'TimelineModal',
  HOTSPOT = 'HotspotModal',
  SLIDER = 'SliderModal',
  MATRIX = 'MatrixModal',
  SCENARIO = 'ScenarioModal',
  SIMULATION = 'SimulationModal',
  VOICE = 'VoiceModal',
  
  // Collaborative Modals
  PEER_REVIEW = 'PeerReviewModal',
  DISCUSSION = 'DiscussionModal',
  COLLAB_DOC = 'CollabDocModal',
  POLL = 'PollModal',
  BRAINSTORM = 'BrainstormModal'
}
```

---

## 2. Content-Specific Data Structures

### 2.1 Fill-in-the-Blank Content

```typescript
interface FillBlankContent {
  modalType: 'FillBlankModal';
  content: {
    data: {
      text: string;                    // Full text with placeholders
      blanks: Array<{
        id: string;                    // Unique blank identifier
        position: number;              // Character position in text
        placeholder: string;           // Display text (e.g., "[noun]")
        answer: string | string[];     // Correct answer(s)
        alternates?: string[];         // Acceptable alternatives
        caseSensitive: boolean;
        partialMatchAllowed: boolean;
        hint?: string;
        maxLength?: number;
        inputType: 'text' | 'number' | 'dropdown';
        dropdownOptions?: string[];   // If inputType is dropdown
      }>;
    };
    metadata: {
      totalBlanks: number;
      estimatedTime: number;           // Seconds
      difficultyLevel: 1 | 2 | 3 | 4 | 5;
      concepts: string[];
      prerequisites: string[];
    };
    validation: {
      required: boolean;
      minBlanksRequired: number;
      spellCheckEnabled: boolean;
      grammarCheckEnabled: boolean;
      instantFeedback: boolean;
    };
    display: {
      layout: 'inline' | 'paragraph' | 'list';
      fontSize: 'small' | 'medium' | 'large';
      highlightBlanks: boolean;
      showWordBank: boolean;
      wordBank?: string[];
    };
  };
}
```

### 2.2 Single Selection Content

```typescript
interface SingleSelectContent {
  modalType: 'SingleSelectModal';
  content: {
    data: {
      question: string;
      questionType: 'text' | 'image' | 'audio' | 'video';
      questionMedia?: MediaContent;
      options: Array<{
        id: string;
        content: string;
        contentType: 'text' | 'image' | 'mixed';
        mediaUrl?: string;
        isCorrect: boolean;
        feedback?: string;
        eliminatable: boolean;        // Can be eliminated (50/50)
      }>;
      correctOptionId: string;
      randomizeOptions: boolean;
    };
    metadata: {
      bloomsLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
      estimatedTime: number;
      difficulty: number;
      concepts: string[];
    };
    validation: {
      required: boolean;
      allowSkip: boolean;
      confirmBeforeSubmit: boolean;
    };
    display: {
      layout: 'vertical' | 'horizontal' | 'grid';
      columns?: number;               // For grid layout
      optionStyle: 'radio' | 'button' | 'card';
      showOptionLabels: boolean;      // A, B, C, D labels
      highlightSelected: boolean;
    };
  };
}
```

### 2.3 Drag and Drop Content

```typescript
interface DragDropContent {
  modalType: 'DragDropModal';
  content: {
    data: {
      instruction: string;
      sources: Array<{
        id: string;
        content: string;
        contentType: 'text' | 'image' | 'icon';
        mediaUrl?: string;
        category?: string;
        cloneable: boolean;           // Can be used multiple times
      }>;
      targets: Array<{
        id: string;
        label: string;
        acceptsCategories?: string[];
        acceptsIds?: string[];
        maxItems?: number;
        minItems?: number;
        correctItems: string[];        // IDs of correct source items
        snapToGrid: boolean;
        dropEffect: 'move' | 'copy';
      }>;
      connections?: Array<{           // For matching-type drag-drop
        sourceId: string;
        targetId: string;
      }>;
    };
    metadata: {
      interactionType: 'categorize' | 'sequence' | 'match' | 'position';
      totalMoves: number;
      optimalMoves: number;
    };
    validation: {
      allowPartialCredit: boolean;
      validateOnDrop: boolean;
      showDropZoneHints: boolean;
    };
    display: {
      layout: 'side-by-side' | 'top-bottom' | 'scattered' | 'custom';
      showGuideLines: boolean;
      animateOnDrop: boolean;
      highlightValidDrops: boolean;
      touchGestures: boolean;
    };
  };
}
```

### 2.4 Code Editor Content

```typescript
interface CodeEditorContent {
  modalType: 'CodeEditorModal';
  content: {
    data: {
      language: 'python' | 'javascript' | 'java' | 'cpp' | 'html' | 'css' | 'sql';
      starterCode?: string;
      readOnlyRegions?: Array<{      // Code that can't be edited
        startLine: number;
        endLine: number;
      }>;
      hiddenCode?: string;            // Code that runs but isn't shown
      testCases: Array<{
        id: string;
        input: any;
        expectedOutput: any;
        visible: boolean;
        points: number;
        description?: string;
        errorMessage?: string;
      }>;
      solutionCode?: string;          // For reference (not shown to student)
      libraries?: string[];           // Available libraries/imports
    };
    metadata: {
      executionEnvironment: 'browser' | 'sandbox' | 'server';
      timeLimit: number;              // Execution time limit in ms
      memoryLimit: number;            // Memory limit in MB
      concepts: string[];
      syntaxLevel: 'basic' | 'intermediate' | 'advanced';
    };
    validation: {
      syntaxCheck: boolean;
      lintingEnabled: boolean;
      autoFormat: boolean;
      runBeforeSubmit: boolean;
    };
    display: {
      theme: 'light' | 'dark' | 'high-contrast';
      fontSize: number;
      showLineNumbers: boolean;
      showConsole: boolean;
      consolePosition: 'bottom' | 'right' | 'floating';
      enableAutocomplete: boolean;
      showDocumentation: boolean;
    };
  };
}
```

### 2.5 Mathematical Expression Content

```typescript
interface MathInputContent {
  modalType: 'MathInputModal';
  content: {
    data: {
      problem: string;
      problemFormat: 'latex' | 'mathml' | 'ascii' | 'image';
      problemDisplay?: string;        // Rendered version for display
      answerFormat: 'exact' | 'numeric' | 'expression' | 'equation';
      correctAnswer: {
        value: string | number;
        format: 'latex' | 'mathml' | 'decimal';
        alternateForm?: string[];     // Equivalent forms
        tolerance?: number;            // For numeric answers
        significantFigures?: number;
      };
      variables?: Map<string, number>; // For problems with variables
      units?: string;                  // Expected units
    };
    metadata: {
      mathType: 'algebra' | 'geometry' | 'calculus' | 'statistics' | 'arithmetic';
      gradeLevel: string;
      estimatedTime: number;
      allowCalculator: boolean;
      requiresGraphing: boolean;
    };
    validation: {
      checkSyntax: boolean;
      simplifyBeforeCheck: boolean;
      requireExactForm: boolean;
      acceptEquivalent: boolean;
    };
    display: {
      inputMethod: 'keyboard' | 'palette' | 'handwriting' | 'voice';
      showMathPalette: boolean;
      paletteButtons: string[];       // Available math symbols
      renderEngine: 'mathjax' | 'katex' | 'native';
      showPreview: boolean;
      enableGraphing: boolean;
    };
  };
}
```

---

## 3. AI Engine Implementation Requirements

### 3.1 Content Generation Pipeline

```typescript
class AIContentGenerator {
  async generateContent(request: ContentRequest): Promise<AIContentResponse> {
    // Step 1: Determine optimal content type based on context
    const contentType = await this.selectContentType(
      request.learningObjective,
      request.studentProfile,
      request.careerContext
    );
    
    // Step 2: Generate raw content
    const rawContent = await this.generateRawContent(contentType, request);
    
    // Step 3: Structure according to modal requirements
    const structuredContent = this.structureForModal(rawContent, contentType);
    
    // Step 4: Add metadata and context
    const enrichedContent = this.enrichContent(structuredContent, request);
    
    // Step 5: Validate against schema
    const validatedContent = await this.validateSchema(enrichedContent);
    
    // Step 6: Add performance optimization hints
    const optimizedContent = this.addOptimizationHints(validatedContent);
    
    // Step 7: Sign and timestamp
    const finalContent = this.signContent(optimizedContent);
    
    return finalContent;
  }
  
  private structureForModal(
    rawContent: any,
    contentType: ContentTypeEnum
  ): ModalSpecificContent {
    // Modal-specific structuring logic
    switch(contentType) {
      case ContentTypeEnum.FILL_BLANK:
        return this.structureFillBlank(rawContent);
      case ContentTypeEnum.SINGLE_SELECT:
        return this.structureSingleSelect(rawContent);
      case ContentTypeEnum.DRAG_DROP:
        return this.structureDragDrop(rawContent);
      // ... etc for all content types
    }
  }
  
  private validateSchema(content: any): ValidatedContent {
    // Strict schema validation
    const schema = this.getSchemaForModal(content.modalType);
    const validator = new Validator(schema);
    
    if (!validator.validate(content)) {
      throw new SchemaValidationError(validator.errors);
    }
    
    return content as ValidatedContent;
  }
}
```

### 3.2 Finn Agent Integration

```typescript
class FinnAgentContentAdapter {
  // Each Finn agent must use this adapter to ensure compliance
  
  async adaptFinnThinkContent(
    problem: any,
    studentContext: StudentContext
  ): Promise<AIContentResponse> {
    const structured = {
      modalType: this.selectModalForProblem(problem),
      content: {
        data: this.structureProblemData(problem),
        metadata: {
          generatedBy: 'FinnThink',
          reasoningType: problem.reasoningType,
          stepCount: problem.steps.length,
          concepts: problem.concepts,
          difficulty: this.calculateDifficulty(problem)
        },
        validation: {
          requiresStepValidation: true,
          allowPartialCredit: true,
          validateLogic: true
        },
        display: {
          showStepHints: studentContext.needsScaffolding,
          highlightProgress: true,
          animateTransitions: studentContext.prefersAnimation
        }
      },
      context: this.buildContext(studentContext),
      evaluation: this.buildEvaluation(problem)
    };
    
    return this.validateAndReturn(structured);
  }
  
  async adaptFinnSeeContent(
    visualContent: any,
    studentContext: StudentContext
  ): Promise<AIContentResponse> {
    const structured = {
      modalType: this.selectVisualModal(visualContent),
      content: {
        data: {
          images: await this.processImages(visualContent.images),
          interactionPoints: visualContent.hotspots,
          annotations: visualContent.annotations
        },
        metadata: {
          generatedBy: 'FinnSee',
          visualComplexity: this.assessVisualComplexity(visualContent),
          colorScheme: studentContext.colorPreference,
          accessibilityTags: this.generateAltText(visualContent)
        },
        validation: {
          validateClickAreas: true,
          requirePrecision: visualContent.precisionRequired
        },
        display: {
          zoomEnabled: true,
          panEnabled: visualContent.size > 'medium',
          overlayAnnotations: studentContext.needsVisualGuides
        }
      },
      context: this.buildContext(studentContext),
      evaluation: this.buildVisualEvaluation(visualContent)
    };
    
    return this.validateAndReturn(structured);
  }
}
```

### 3.3 PathIQ Integration

```typescript
class PathIQContentOrchestrator {
  async orchestrateAdaptiveContent(
    learningMoment: LearningMoment,
    studentModel: StudentModel
  ): Promise<AIContentResponse> {
    
    // PathIQ determines optimal content parameters
    const contentStrategy = {
      modalType: this.selectOptimalModal(studentModel),
      difficulty: this.calculateOptimalDifficulty(studentModel),
      scaffolding: this.determineScaffoldingLevel(studentModel),
      timeAllocation: this.estimateTimeNeeded(studentModel),
      successProbability: this.predictSuccess(studentModel)
    };
    
    // Generate content with strategic parameters
    const content = await this.generateStrategicContent(
      learningMoment,
      contentStrategy
    );
    
    // Add PathIQ-specific metadata
    content.metadata.pathIQ = {
      adaptationReason: contentStrategy.reason,
      personalizzationDimensions: this.getActiveDimensions(studentModel),
      flowStateTarget: 0.75,
      predictedEngagement: contentStrategy.successProbability,
      nextContentHint: this.predictNextContent(studentModel)
    };
    
    // Add real-time adaptation hooks
    content.display.realtimeAdaptation = {
      enabled: true,
      monitoringInterval: 1000,
      adaptationTriggers: [
        'timeOnTask > expectedTime * 1.5',
        'incorrectAttempts > 2',
        'hintRequests > 1',
        'frustrationDetected'
      ],
      adaptationCallbacks: [
        'simplifyContent',
        'addScaffolding',
        'provideExample',
        'switchModal'
      ]
    };
    
    return content;
  }
}
```

---

## 4. Validation & Error Handling

### 4.1 Schema Validation Rules

```typescript
interface ValidationRules {
  // Required field validation
  requiredFields: {
    contentId: 'string',
    modalType: 'enum:ModalTypeEnum',
    content: 'object',
    context: 'object',
    timestamp: 'iso8601'
  };
  
  // Type validation
  typeValidation: {
    stringFields: ['contentId', 'modalType', 'version'],
    numberFields: ['difficulty', 'pointValue', 'estimatedTime'],
    booleanFields: ['partialCredit', 'required', 'randomize'],
    arrayFields: ['options', 'blanks', 'testCases'],
    objectFields: ['content', 'context', 'evaluation']
  };
  
  // Business logic validation
  businessRules: {
    'singleSelect.correctOptions': 'exactly 1',
    'multiSelect.correctOptions': 'at least 1',
    'fillBlank.blanks': 'at least 1',
    'dragDrop.sources': 'at least 2',
    'difficulty': 'between 1 and 5'
  };
  
  // Cross-field validation
  crossFieldRules: {
    'if modalType is CodeEditorModal then language is required',
    'if partialCredit is true then rubric is required',
    'if accessibility is provided then alternativeContent is required'
  };
}
```

### 4.2 Error Response Format

```typescript
interface AIContentErrorResponse {
  error: {
    code: string;
    message: string;
    details: {
      field?: string;
      constraint?: string;
      providedValue?: any;
      expectedType?: string;
      suggestion?: string;
    };
    fallback?: {
      available: boolean;
      modalType?: ModalTypeEnum;
      degradedFeatures?: string[];
    };
    timestamp: string;
    requestId: string;
  };
}

// Example error response
{
  error: {
    code: 'INVALID_MODAL_STRUCTURE',
    message: 'The content structure does not match the specified modal type',
    details: {
      field: 'content.data.options',
      constraint: 'array with at least 2 items',
      providedValue: [],
      expectedType: 'Array<Option>',
      suggestion: 'Provide at least 2 options for SingleSelectModal'
    },
    fallback: {
      available: true,
      modalType: 'ShortAnswerModal',
      degradedFeatures: ['multiple choice']
    },
    timestamp: '2025-01-31T10:30:00Z',
    requestId: 'req_123456'
  }
}
```

---

## 5. Client-Side Integration

### 5.1 Content Consumer Interface

```typescript
class ContentModalRenderer {
  async renderContent(aiResponse: AIContentResponse): Promise<RenderedModal> {
    try {
      // Step 1: Validate response structure
      this.validateResponse(aiResponse);
      
      // Step 2: Extract modal type
      const modalType = aiResponse.modalType;
      
      // Step 3: Load appropriate modal component
      const ModalComponent = await this.loadModal(modalType);
      
      // Step 4: Transform content for modal
      const modalProps = this.transformContent(aiResponse.content, modalType);
      
      // Step 5: Apply display configuration
      const displayConfig = this.applyDisplayConfig(
        aiResponse.content.display,
        modalType
      );
      
      // Step 6: Setup validation rules
      const validation = this.setupValidation(
        aiResponse.content.validation,
        aiResponse.evaluation
      );
      
      // Step 7: Initialize modal with data
      const modal = new ModalComponent({
        ...modalProps,
        ...displayConfig,
        validation,
        onSubmit: this.handleSubmission,
        onInteraction: this.trackInteraction
      });
      
      // Step 8: Apply accessibility if needed
      if (aiResponse.accessibility) {
        this.applyAccessibility(modal, aiResponse.accessibility);
      }
      
      // Step 9: Start performance monitoring
      this.startMonitoring(modal, aiResponse.contentId);
      
      return modal;
      
    } catch (error) {
      return this.handleRenderError(error, aiResponse);
    }
  }
  
  private validateResponse(response: AIContentResponse): void {
    // Ensure response matches expected schema
    const validator = new ResponseValidator();
    if (!validator.validate(response)) {
      throw new ValidationError('Invalid AI response structure', validator.errors);
    }
    
    // Ensure modal type is supported
    if (!this.isModalSupported(response.modalType)) {
      throw new UnsupportedModalError(response.modalType);
    }
    
    // Ensure required data is present
    if (!this.hasRequiredData(response)) {
      throw new MissingDataError('Required content data missing');
    }
  }
}
```

### 5.2 Runtime Type Guards

```typescript
// Type guards for runtime validation
function isFillBlankContent(content: any): content is FillBlankContent {
  return content.modalType === 'FillBlankModal' &&
         content.content?.data?.text &&
         Array.isArray(content.content?.data?.blanks) &&
         content.content.data.blanks.length > 0;
}

function isSingleSelectContent(content: any): content is SingleSelectContent {
  return content.modalType === 'SingleSelectModal' &&
         content.content?.data?.question &&
         Array.isArray(content.content?.data?.options) &&
         content.content.data.options.length >= 2 &&
         content.content.data.correctOptionId;
}

function isCodeEditorContent(content: any): content is CodeEditorContent {
  return content.modalType === 'CodeEditorModal' &&
         content.content?.data?.language &&
         Array.isArray(content.content?.data?.testCases);
}

// Modal factory with type safety
class ModalFactory {
  createModal(response: AIContentResponse): Modal {
    if (isFillBlankContent(response)) {
      return new FillBlankModal(response);
    } else if (isSingleSelectContent(response)) {
      return new SingleSelectModal(response);
    } else if (isCodeEditorContent(response)) {
      return new CodeEditorModal(response);
    }
    // ... continue for all types
    
    throw new Error(`Unsupported modal type: ${response.modalType}`);
  }
}
```

---

## 6. Testing & Verification

### 6.1 Contract Testing Suite

```typescript
describe('AI Content Generation Contract', () => {
  describe('Response Structure', () => {
    it('should include all required fields', async () => {
      const response = await aiEngine.generateContent(mockRequest);
      expect(response).toHaveProperty('contentId');
      expect(response).toHaveProperty('modalType');
      expect(response).toHaveProperty('content');
      expect(response).toHaveProperty('context');
      expect(response).toHaveProperty('timestamp');
    });
    
    it('should specify valid modal type', async () => {
      const response = await aiEngine.generateContent(mockRequest);
      expect(Object.values(ModalTypeEnum)).toContain(response.modalType);
    });
    
    it('should match modal-specific schema', async () => {
      const response = await aiEngine.generateContent(mockRequest);
      const schema = getSchemaForModal(response.modalType);
      expect(validateSchema(response.content, schema)).toBe(true);
    });
  });
  
  describe('Content Type Specific Tests', () => {
    it('should generate valid fill-blank content', async () => {
      const request = { contentType: 'FILL_BLANK', ...baseRequest };
      const response = await aiEngine.generateContent(request);
      
      expect(response.modalType).toBe('FillBlankModal');
      expect(response.content.data.text).toBeDefined();
      expect(response.content.data.blanks).toBeInstanceOf(Array);
      expect(response.content.data.blanks.length).toBeGreaterThan(0);
      
      response.content.data.blanks.forEach(blank => {
        expect(blank).toHaveProperty('id');
        expect(blank).toHaveProperty('position');
        expect(blank).toHaveProperty('answer');
      });
    });
    
    // ... tests for each content type
  });
  
  describe('Error Handling', () => {
    it('should return standardized error format', async () => {
      const invalidRequest = { ...mockRequest, contentType: 'INVALID' };
      const response = await aiEngine.generateContent(invalidRequest);
      
      expect(response.error).toBeDefined();
      expect(response.error.code).toBeDefined();
      expect(response.error.message).toBeDefined();
      expect(response.error.fallback).toBeDefined();
    });
  });
});
```

### 6.2 Integration Testing

```typescript
describe('AI to UI Integration', () => {
  it('should render all AI-generated content types', async () => {
    const contentTypes = Object.values(ContentTypeEnum);
    
    for (const contentType of contentTypes) {
      const aiResponse = await aiEngine.generateContent({
        contentType,
        ...standardRequest
      });
      
      const modal = await modalRenderer.renderContent(aiResponse);
      
      expect(modal).toBeDefined();
      expect(modal.type).toBe(aiResponse.modalType);
      expect(modal.isInteractive()).toBe(true);
      expect(modal.canSubmit()).toBe(true);
    }
  });
  
  it('should handle content adaptation', async () => {
    const aiResponse = await aiEngine.generateContent(mockRequest);
    
    // Test desktop rendering
    const desktopModal = await modalRenderer.renderContent(aiResponse);
    expect(desktopModal.layout).toBe('desktop');
    
    // Test mobile adaptation
    aiResponse.content.display.device = 'mobile';
    const mobileModal = await modalRenderer.renderContent(aiResponse);
    expect(mobileModal.layout).toBe('mobile');
    expect(mobileModal.touchEnabled).toBe(true);
  });
});
```

---

## 7. Performance Optimization

### 7.1 Content Generation Optimization

```typescript
interface OptimizationStrategy {
  // Content-level optimizations
  contentOptimizations: {
    minifyJSON: boolean;              // Remove unnecessary whitespace
    compressMedia: boolean;           // Compress images/audio
    lazyLoadAssets: boolean;          // Don't include all assets upfront
    useContentHash: boolean;          // Enable client-side caching
    deltaUpdates: boolean;            // Send only changes for updates
  };
  
  // Generation optimizations
  generationOptimizations: {
    cacheCommonPatterns: boolean;     // Cache frequently used content
    preGenerateBatch: boolean;        // Pre-generate upcoming content
    useTemplates: boolean;            // Use templates for common types
    parallelGeneration: boolean;      // Generate multiple variants
  };
  
  // Delivery optimizations
  deliveryOptimizations: {
    useCompression: 'gzip' | 'brotli';
    streamingEnabled: boolean;        // Stream large content
    chunkSize: number;                // For chunked transfer
    cdnEnabled: boolean;              // Use CDN for media
  };
}
```

### 7.2 Caching Strategy

```typescript
class ContentCacheManager {
  private cacheStrategy = {
    // Cache generated content by key
    contentCache: new Map<string, AIContentResponse>(),
    
    // Cache modal mappings
    modalMappingCache: new Map<string, ModalTypeEnum>(),
    
    // Cache validation schemas
    schemaCache: new Map<ModalTypeEnum, Schema>(),
    
    // TTL settings
    ttl: {
      content: 300000,        // 5 minutes
      mapping: 3600000,       // 1 hour
      schema: 86400000        // 24 hours
    }
  };
  
  async getCachedOrGenerate(
    request: ContentRequest
  ): Promise<AIContentResponse> {
    const cacheKey = this.generateCacheKey(request);
    
    // Check cache
    if (this.contentCache.has(cacheKey)) {
      const cached = this.contentCache.get(cacheKey);
      if (this.isValid(cached)) {
        return cached;
      }
    }
    
    // Generate new content
    const content = await this.generateContent(request);
    
    // Cache if appropriate
    if (this.shouldCache(content)) {
      this.contentCache.set(cacheKey, content);
    }
    
    return content;
  }
}
```

---

## 8. Monitoring & Analytics

### 8.1 Content Generation Metrics

```typescript
interface ContentGenerationMetrics {
  // Performance metrics
  performance: {
    generationTime: number;           // Time to generate content
    structuringTime: number;          // Time to structure for modal
    validationTime: number;           // Time to validate schema
    totalTime: number;                // Total processing time
  };
  
  // Quality metrics
  quality: {
    schemaCompliance: boolean;        // Passes schema validation
    modalMatch: boolean;              // Content matches modal type
    completeness: number;             // % of required fields present
    richness: number;                 // Content quality score
  };
  
  // Usage metrics
  usage: {
    modalType: ModalTypeEnum;
    contentType: ContentTypeEnum;
    generatedBy: string;              // Which Finn agent
    studentId: string;
    sessionId: string;
    timestamp: string;
  };
  
  // Error metrics
  errors: {
    validationErrors: number;
    fallbacksUsed: number;
    retryAttempts: number;
    failureRate: number;
  };
}
```

### 8.2 Tracking Implementation

```typescript
class ContentGenerationTracker {
  async trackGeneration(
    request: ContentRequest,
    response: AIContentResponse,
    metrics: ContentGenerationMetrics
  ): Promise<void> {
    // Track in analytics
    await analytics.track('content_generated', {
      ...metrics,
      requestId: request.id,
      responseId: response.contentId,
      success: !response.error
    });
    
    // Monitor quality
    if (metrics.quality.completeness < 0.9) {
      await this.alertQualityIssue(response, metrics);
    }
    
    // Monitor performance
    if (metrics.performance.totalTime > 3000) {
      await this.alertPerformanceIssue(response, metrics);
    }
    
    // Update dashboards
    await this.updateDashboards(metrics);
  }
}
```

---

## Implementation Checklist

### AI Engine Team
- [ ] Implement standardized response structure
- [ ] Add modal type determination logic
- [ ] Implement content structuring for each modal type
- [ ] Add schema validation before returning
- [ ] Implement error handling with fallbacks
- [ ] Add performance optimization
- [ ] Set up monitoring and metrics

### Frontend Team  
- [ ] Implement response validation
- [ ] Create modal factory with type guards
- [ ] Add error handling for invalid responses
- [ ] Implement adaptive rendering based on metadata
- [ ] Add performance monitoring
- [ ] Create integration tests

### QA Team
- [ ] Validate all content type schemas
- [ ] Test modal type mappings
- [ ] Verify error handling
- [ ] Performance testing
- [ ] Cross-platform testing
- [ ] Accessibility testing

---

## Sign-off Requirements

### Technical Approval
- **AI/ML Team Lead:** _______________________ Date: _________
- **Frontend Team Lead:** _______________________ Date: _________
- **Backend Team Lead:** _______________________ Date: _________

### Architecture Approval
- **Chief Architect:** _______________________ Date: _________
- **Data Architect:** _______________________ Date: _________

---

*End of AI Content Generation Contract Specification*

**This contract ensures seamless integration between AI content generation and UI modal rendering.**

---