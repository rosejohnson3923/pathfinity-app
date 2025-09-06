/**
 * Content Pipeline Orchestrator
 * Coordinates all fixes to ensure proper content generation, delivery, and rendering
 */

import { modalTypeResolver } from './fixes/modal-type-resolver';
import { dataStructureStandardizer } from './fixes/data-structure-standardizer';
import { dimensionCalculator } from './fixes/dimension-calculator';
import { uiComplianceEngine } from './fixes/ui-compliance-engine';
import { validationEngine } from './fixes/validation-engine';
import { 
  AIContentRequest,
  AIContentResponseV2,
  ModalTypeEnum,
  ContainerType,
  DeviceContext 
} from './types';

export class ContentPipelineOrchestrator {
  private metrics = {
    totalProcessed: 0,
    successfulProcessing: 0,
    failedProcessing: 0,
    averageProcessingTime: 0,
    modalTypeResolutionSuccess: 0,
    dataStandardizationSuccess: 0,
    dimensionCalculationSuccess: 0
  };

  /**
   * Main content generation pipeline with all fixes applied
   */
  public async generateContent(
    request: AIContentRequest
  ): Promise<AIContentResponseV2> {
    const startTime = Date.now();
    const contentId = this.generateContentId();
    
    try {
      console.log(`[Pipeline] Starting content generation for ${contentId}`);
      
      // Step 1: Generate raw content (existing AI logic)
      const rawContent = await this.generateRawContent(request);
      
      // Step 2: Resolve modal type (P0 Fix)
      const modalType = await this.resolveModalType(rawContent, request);
      
      // Step 3: Standardize data structure (P0 Fix)
      const standardized = await this.standardizeDataStructure(rawContent, modalType);
      
      // Step 4: Calculate dimensions (P1 Fix)
      const dimensions = await this.calculateDimensions(
        standardized,
        modalType,
        request.deviceContext
      );
      
      // Step 5: Add UI compliance (P1 Fix)
      const uiCompliance = await this.addUICompliance(
        request.container,
        standardized,
        request.studentProfile
      );
      
      // Step 6: Add validation rules (P1 Fix)
      const validation = await this.addValidationRules(
        standardized, 
        modalType,
        request.gradeLevel
      );
      
      // Step 7: Calculate content volume metrics
      const volume = await this.calculateContentVolume(standardized, modalType);
      
      // Step 8: Add performance hints
      const performance = await this.addPerformanceHints(standardized, dimensions);
      
      // Step 9: Construct final response
      const response: AIContentResponseV2 = {
        contentId,
        modalType,
        contentType: request.contentType,
        version: '2.0',
        timestamp: new Date().toISOString(),
        
        content: {
          data: standardized.data,
          metadata: {
            generatedBy: request.agentId || 'system',
            difficulty: request.difficulty || 3,
            concepts: request.concepts || [],
            estimatedTime: this.estimateCompletionTime(volume),
            ...standardized.metadata
          },
          validation: validation,
          display: {
            layout: this.determineLayout(modalType, dimensions),
            theme: uiCompliance.theme,
            ...standardized.display
          },
          volume: volume
        },
        
        dimensions: dimensions,
        uiCompliance: uiCompliance,
        
        context: {
          studentId: request.studentId,
          sessionId: request.sessionId,
          lessonId: request.lessonId,
          career: request.career,
          gradeLevel: request.gradeLevel,
          subject: request.subject,
          difficulty: request.difficulty,
          generatedBy: request.agentId || 'system',
          device: request.deviceContext || this.getDefaultDeviceContext()
        },
        
        evaluation: {
          scoringMethod: this.determineScoringMethod(modalType),
          pointValue: request.pointValue || 10,
          partialCredit: request.partialCredit !== false,
          rubric: request.rubric,
          feedback: {
            immediate: true,
            detailed: request.gradeLevel !== 'K-2',
            hints: true
          },
          estimatedTime: {
            minimum: Math.floor(volume.text.readingTime * 0.8),
            optimal: volume.text.readingTime,
            maximum: Math.ceil(volume.text.readingTime * 2)
          }
        },
        
        performance: performance
      };
      
      // Step 10: Final validation
      await this.validateFinalResponse(response);
      
      // Update metrics
      this.updateMetrics(true, Date.now() - startTime);
      
      console.log(`[Pipeline] Successfully generated content ${contentId} in ${Date.now() - startTime}ms`);
      
      return response;
      
    } catch (error) {
      console.error(`[Pipeline] Error generating content ${contentId}:`, error);
      
      // Update metrics
      this.updateMetrics(false, Date.now() - startTime);
      
      // Return error response with fallback
      return this.createErrorResponse(contentId, error, request);
    }
  }

  /**
   * Resolve modal type using the modal type resolver
   */
  private async resolveModalType(
    content: any,
    request: AIContentRequest
  ): Promise<ModalTypeEnum> {
    try {
      // Add any hints from the request
      if (request.suggestedModalType) {
        content.modalType = request.suggestedModalType;
      }
      
      const modalType = modalTypeResolver.resolveModalType(content);
      
      // Validate confidence
      const confidence = modalTypeResolver.getConfidenceScore(content);
      if (confidence < 0.5) {
        console.warn(`[Pipeline] Low confidence (${confidence}) for modal type ${modalType}`);
      }
      
      this.metrics.modalTypeResolutionSuccess++;
      return modalType;
      
    } catch (error) {
      console.error('[Pipeline] Modal type resolution failed:', error);
      // Default fallback
      return ModalTypeEnum.SHORT_ANSWER;
    }
  }

  /**
   * Standardize data structure using the standardizer
   */
  private async standardizeDataStructure(
    content: any,
    modalType: ModalTypeEnum
  ): Promise<any> {
    try {
      const standardized = dataStructureStandardizer.standardize(content, modalType);
      this.metrics.dataStandardizationSuccess++;
      return standardized;
      
    } catch (error) {
      console.error('[Pipeline] Data standardization failed:', error);
      // Return minimal valid structure
      return this.createMinimalStructure(modalType, content);
    }
  }

  /**
   * Calculate dimensions using the dimension calculator
   */
  private async calculateDimensions(
    content: any,
    modalType: ModalTypeEnum,
    deviceContext?: DeviceContext
  ): Promise<any> {
    try {
      const dimensions = dimensionCalculator.calculateDimensions(
        content.data || content,
        modalType,
        deviceContext
      );
      
      this.metrics.dimensionCalculationSuccess++;
      return dimensions;
      
    } catch (error) {
      console.error('[Pipeline] Dimension calculation failed:', error);
      // Return default dimensions
      return this.getDefaultDimensions(modalType);
    }
  }

  /**
   * Add UI compliance metadata
   */
  private async addUICompliance(
    container: ContainerType,
    content: any,
    studentProfile?: any
  ): Promise<UICompliance> {
    // Use the UI compliance engine
    return uiComplianceEngine.generateUICompliance(
      container || 'LEARN',
      studentProfile?.gradeLevel || '6-8',
      content.modalType || ModalTypeEnum.SINGLE_SELECT,
      studentProfile?.deviceContext,
      studentProfile?.preferences?.darkMode || false,
      studentProfile?.accessibility
    );
  }

  /**
   * Add validation rules for the content
   */
  private async addValidationRules(
    content: any,
    modalType: ModalTypeEnum,
    gradeLevel?: string
  ): Promise<any> {
    // Use the validation engine
    return validationEngine.generateValidationRules(
      modalType,
      content.data || content,
      gradeLevel as any,
      false // non-strict mode by default
    );
  }

  /**
   * Calculate content volume metrics
   */
  private async calculateContentVolume(
    content: any,
    modalType: ModalTypeEnum
  ): Promise<any> {
    // This is already handled by dimension calculator
    // but we extract it for the response
    return dimensionCalculator['calculateContentVolume'](
      content.data || content,
      modalType
    );
  }

  /**
   * Add performance hints
   */
  private async addPerformanceHints(
    content: any,
    dimensions: any
  ): Promise<any> {
    const hints = {
      preloadAssets: [],
      estimatedLoadTime: 0,
      cacheStrategy: 'normal' as const,
      rendering: {
        priority: 'immediate' as const,
        virtualScroll: false,
        chunking: false,
        chunkSize: undefined
      }
    };

    // Check for media assets to preload
    if (content.data?.images) {
      hints.preloadAssets = content.data.images;
      hints.estimatedLoadTime += content.data.images.length * 200; // 200ms per image
    }

    // Determine caching strategy
    if (content.static || content.reusable) {
      hints.cacheStrategy = 'aggressive';
    }

    // Check if virtual scrolling needed
    if (dimensions.overflow?.predicted && dimensions.overflow?.strategy === 'scroll') {
      hints.rendering.virtualScroll = true;
    }

    // Check if chunking needed
    if (content.data?.options?.length > 20 || content.data?.items?.length > 20) {
      hints.rendering.chunking = true;
      hints.rendering.chunkSize = 10;
    }

    return hints;
  }

  /**
   * Validate the final response
   */
  private async validateFinalResponse(response: AIContentResponseV2): Promise<void> {
    const requiredFields = [
      'contentId',
      'modalType',
      'version',
      'timestamp',
      'content',
      'dimensions',
      'uiCompliance',
      'context'
    ];

    for (const field of requiredFields) {
      if (!response[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate modal type
    if (!Object.values(ModalTypeEnum).includes(response.modalType)) {
      throw new Error(`Invalid modal type: ${response.modalType}`);
    }

    // Validate dimensions
    if (!response.dimensions.recommended) {
      throw new Error('Missing recommended dimensions');
    }

    // Validate content data
    if (!response.content.data) {
      throw new Error('Missing content data');
    }
  }

  /**
   * Generate raw content (placeholder for actual AI generation)
   */
  private async generateRawContent(request: AIContentRequest): Promise<any> {
    // This would be replaced with actual AI content generation
    // For now, return mock content based on request type
    
    const mockContent = {
      contentType: request.contentType,
      subject: request.subject,
      gradeLevel: request.gradeLevel,
      career: request.career,
      // Add mock data based on content type
      ...this.getMockDataForType(request.contentType)
    };

    // Simulate async generation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return mockContent;
  }

  /**
   * Get mock data for content type (temporary)
   */
  private getMockDataForType(contentType: string): any {
    // This provides mock data for testing
    // Will be replaced with actual AI generation
    switch (contentType) {
      case 'FILL_BLANK':
        return {
          text: 'The capital of France is ___ and the capital of Germany is ___.',
          blanks: [
            { position: 26, answer: 'Paris' },
            { position: 60, answer: 'Berlin' }
          ]
        };
      
      case 'SINGLE_SELECT':
        return {
          question: 'What is 2 + 2?',
          options: [
            { id: 'opt1', content: '3', isCorrect: false },
            { id: 'opt2', content: '4', isCorrect: true },
            { id: 'opt3', content: '5', isCorrect: false }
          ]
        };
      
      default:
        return {
          question: 'Sample question',
          content: 'Sample content'
        };
    }
  }

  /**
   * Helper methods
   */
  
  private generateContentId(): string {
    return `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultDeviceContext(): DeviceContext {
    return {
      type: 'desktop',
      viewport: { width: 1920, height: 1080 },
      orientation: 'landscape',
      touchEnabled: false,
      pixelRatio: 1
    };
  }

  private determineLayout(modalType: ModalTypeEnum, dimensions: any): string {
    if (dimensions.overflow?.strategy === 'tabs') {
      return 'tabbed';
    } else if (dimensions.overflow?.strategy === 'accordion') {
      return 'accordion';
    } else if (modalType === ModalTypeEnum.DRAG_DROP) {
      return 'split';
    }
    return 'standard';
  }

  private determineScoringMethod(modalType: ModalTypeEnum): string {
    const exactScoring = [
      ModalTypeEnum.FILL_BLANK,
      ModalTypeEnum.SINGLE_SELECT,
      ModalTypeEnum.TRUE_FALSE
    ];
    
    if (exactScoring.includes(modalType)) {
      return 'exact';
    }
    
    return 'rubric';
  }

  private estimateCompletionTime(volume: any): number {
    // Base time on reading + interaction time
    let time = volume.text.readingTime || 0;
    time += volume.elements.totalItems * 10; // 10 seconds per interaction
    return Math.ceil(time);
  }

  private getContainerColorScheme(container: ContainerType): any {
    const schemes = {
      LEARN: { primary: '#8B5CF6', secondary: '#6366F1' },
      EXPERIENCE: { primary: '#3B82F6', secondary: '#06B6D4' },
      DISCOVER: { primary: '#10B981', secondary: '#14B8A6' }
    };
    return schemes[container] || schemes.LEARN;
  }

  private getContainerGradients(container: ContainerType): any {
    const gradients = {
      LEARN: 'from-purple-600 to-indigo-600',
      EXPERIENCE: 'from-blue-500 to-cyan-600',
      DISCOVER: 'from-emerald-500 to-teal-600'
    };
    return gradients[container] || gradients.LEARN;
  }

  private getContainerBranding(container: ContainerType): any {
    return {
      gradient: this.getContainerGradients(container),
      focus: `ring-2 ring-${container.toLowerCase()}-600`
    };
  }

  private getBaseFontSize(gradeLevel?: string): number {
    const sizes = {
      'K-2': 18,
      '3-5': 16,
      '6-8': 16,
      '9-12': 15
    };
    return sizes[gradeLevel] || 16;
  }

  private getTypographyScale(gradeLevel?: string): any {
    const scales = {
      'K-2': { sm: 16, base: 18, lg: 22, xl: 26 },
      '3-5': { sm: 14, base: 16, lg: 20, xl: 24 },
      '6-8': { sm: 14, base: 16, lg: 18, xl: 22 },
      '9-12': { sm: 13, base: 15, lg: 17, xl: 20 }
    };
    return scales[gradeLevel] || scales['6-8'];
  }

  private createMinimalStructure(modalType: ModalTypeEnum, content: any): any {
    // Create minimal valid structure for fallback
    return {
      modalType,
      data: {
        question: content.question || content.prompt || 'Question',
        content: content.content || content.text || ''
      }
    };
  }

  private getDefaultDimensions(modalType: ModalTypeEnum): any {
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
        breakpoints: [],
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

  private createErrorResponse(
    contentId: string,
    error: any,
    request: AIContentRequest
  ): AIContentResponseV2 {
    // Create a fallback error response
    return {
      contentId,
      modalType: ModalTypeEnum.SHORT_ANSWER,
      contentType: request.contentType,
      version: '2.0',
      timestamp: new Date().toISOString(),
      error: {
        code: 'GENERATION_ERROR',
        message: error.message || 'Content generation failed',
        fallback: true
      },
      content: {
        data: {
          question: 'Content temporarily unavailable',
          placeholder: 'Please try again'
        },
        metadata: {},
        validation: {},
        display: {},
        volume: {}
      },
      dimensions: this.getDefaultDimensions(ModalTypeEnum.SHORT_ANSWER),
      uiCompliance: {
        container: 'LEARN',
        theme: {},
        typography: {},
        branding: {},
        accessibility: {}
      },
      context: {
        studentId: request.studentId,
        sessionId: request.sessionId,
        lessonId: request.lessonId,
        career: request.career,
        gradeLevel: request.gradeLevel,
        subject: request.subject,
        difficulty: request.difficulty,
        generatedBy: 'system',
        device: this.getDefaultDeviceContext()
      },
      evaluation: {
        scoringMethod: 'manual',
        pointValue: 0,
        partialCredit: false,
        estimatedTime: { minimum: 60, optimal: 120, maximum: 300 }
      },
      performance: {
        preloadAssets: [],
        estimatedLoadTime: 100,
        cacheStrategy: 'none',
        rendering: {}
      }
    };
  }

  private updateMetrics(success: boolean, processingTime: number): void {
    this.metrics.totalProcessed++;
    
    if (success) {
      this.metrics.successfulProcessing++;
    } else {
      this.metrics.failedProcessing++;
    }
    
    // Update average processing time
    const total = this.metrics.averageProcessingTime * (this.metrics.totalProcessed - 1);
    this.metrics.averageProcessingTime = (total + processingTime) / this.metrics.totalProcessed;
  }

  /**
   * Get current metrics
   */
  public getMetrics(): any {
    return {
      ...this.metrics,
      successRate: this.metrics.totalProcessed > 0 
        ? (this.metrics.successfulProcessing / this.metrics.totalProcessed) * 100 
        : 0
    };
  }
}

// Singleton export
export const contentPipelineOrchestrator = new ContentPipelineOrchestrator();