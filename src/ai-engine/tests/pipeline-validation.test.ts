/**
 * Pipeline Validation Tests
 * Validates that all critical fixes are working correctly
 */

import { contentPipelineOrchestrator } from '../content-pipeline-orchestrator';
import { modalTypeResolver } from '../fixes/modal-type-resolver';
import { dataStructureStandardizer } from '../fixes/data-structure-standardizer';
import { dimensionCalculator } from '../fixes/dimension-calculator';
import { 
  AIContentRequest,
  AIContentResponseV2,
  ModalTypeEnum,
  ContentTypeEnum 
} from '../types';

describe('Content Pipeline Validation', () => {
  
  describe('P0 Critical Fixes', () => {
    
    test('Modal type is always present in response', async () => {
      const request: AIContentRequest = {
        contentType: ContentTypeEnum.FILL_BLANK,
        studentId: 'student-123',
        sessionId: 'session-456',
        lessonId: 'lesson-789',
        career: 'Software Developer',
        gradeLevel: '9-12',
        subject: 'Computer Science',
        difficulty: 3
      };
      
      const response = await contentPipelineOrchestrator.generateContent(request);
      
      expect(response.modalType).toBeDefined();
      expect(Object.values(ModalTypeEnum)).toContain(response.modalType);
    });
    
    test('Data structure is standardized for all modal types', async () => {
      const modalTypes = [
        ContentTypeEnum.FILL_BLANK,
        ContentTypeEnum.SINGLE_SELECT,
        ContentTypeEnum.MULTI_SELECT,
        ContentTypeEnum.DRAG_DROP,
        ContentTypeEnum.CODE_EDITOR
      ];
      
      for (const contentType of modalTypes) {
        const request: AIContentRequest = {
          contentType,
          studentId: 'student-123',
          sessionId: 'session-456',
          lessonId: 'lesson-789',
          career: 'Data Scientist',
          gradeLevel: '9-12',
          subject: 'Mathematics',
          difficulty: 3
        };
        
        const response = await contentPipelineOrchestrator.generateContent(request);
        
        expect(response.content).toBeDefined();
        expect(response.content.data).toBeDefined();
        expect(response.version).toBe('2.0');
      }
    });
  });
  
  describe('P1 High Priority Fixes', () => {
    
    test('Dimensions are calculated and included', async () => {
      const request: AIContentRequest = {
        contentType: ContentTypeEnum.SINGLE_SELECT,
        studentId: 'student-123',
        sessionId: 'session-456',
        lessonId: 'lesson-789',
        career: 'Engineer',
        gradeLevel: '6-8',
        subject: 'Science',
        difficulty: 2
      };
      
      const response = await contentPipelineOrchestrator.generateContent(request);
      
      expect(response.dimensions).toBeDefined();
      expect(response.dimensions.recommended).toBeDefined();
      expect(response.dimensions.recommended.width).toBeGreaterThan(0);
      expect(response.dimensions.recommended.height).toBeGreaterThan(0);
      expect(response.dimensions.constraints).toBeDefined();
      expect(response.dimensions.overflow).toBeDefined();
    });
    
    test('UI compliance metadata is present', async () => {
      const containers = ['LEARN', 'EXPERIENCE', 'DISCOVER'];
      
      for (const container of containers) {
        const request: AIContentRequest = {
          contentType: ContentTypeEnum.FILL_BLANK,
          studentId: 'student-123',
          sessionId: 'session-456',
          lessonId: 'lesson-789',
          career: 'Designer',
          gradeLevel: '3-5',
          subject: 'Art',
          difficulty: 1,
          container: container as any
        };
        
        const response = await contentPipelineOrchestrator.generateContent(request);
        
        expect(response.uiCompliance).toBeDefined();
        expect(response.uiCompliance.container).toBe(container);
        expect(response.uiCompliance.theme).toBeDefined();
        expect(response.uiCompliance.accessibility.level).toBe('AA');
      }
    });
    
    test('Validation rules are included', async () => {
      const request: AIContentRequest = {
        contentType: ContentTypeEnum.FILL_BLANK,
        studentId: 'student-123',
        sessionId: 'session-456',
        lessonId: 'lesson-789',
        career: 'Teacher',
        gradeLevel: 'K-2',
        subject: 'Reading',
        difficulty: 1
      };
      
      const response = await contentPipelineOrchestrator.generateContent(request);
      
      expect(response.content.validation).toBeDefined();
      expect(response.content.validation.required).toBeDefined();
      expect(response.content.validation.validators).toBeDefined();
      expect(response.content.validation.errorMessages).toBeDefined();
    });
  });
  
  describe('Overflow Prevention', () => {
    
    test('Overflow is predicted for large content', async () => {
      const request: AIContentRequest = {
        contentType: ContentTypeEnum.MULTI_SELECT,
        studentId: 'student-123',
        sessionId: 'session-456',
        lessonId: 'lesson-789',
        career: 'Doctor',
        gradeLevel: '9-12',
        subject: 'Biology',
        difficulty: 4
      };
      
      // Mock large content
      const largeContent = {
        question: 'Select all correct answers',
        options: Array(20).fill(null).map((_, i) => ({
          id: `opt-${i}`,
          content: `Option ${i + 1} with very long text that might cause overflow`,
          isCorrect: i % 3 === 0
        }))
      };
      
      // Test dimension calculator directly
      const dimensions = dimensionCalculator.calculateDimensions(
        largeContent,
        ModalTypeEnum.MULTI_SELECT
      );
      
      expect(dimensions.overflow.predicted).toBe(true);
      expect(['scroll', 'paginate']).toContain(dimensions.overflow.strategy);
    });
    
    test('Responsive breakpoints are generated', async () => {
      const request: AIContentRequest = {
        contentType: ContentTypeEnum.CODE_EDITOR,
        studentId: 'student-123',
        sessionId: 'session-456',
        lessonId: 'lesson-789',
        career: 'Software Developer',
        gradeLevel: '9-12',
        subject: 'Computer Science',
        difficulty: 3
      };
      
      const response = await contentPipelineOrchestrator.generateContent(request);
      
      expect(response.dimensions.responsive).toBeDefined();
      expect(response.dimensions.responsive.breakpoints).toBeDefined();
      expect(response.dimensions.responsive.breakpoints.length).toBeGreaterThan(0);
      
      // Check breakpoints cover all sizes
      const breakpointNames = response.dimensions.responsive.breakpoints.map(b => b.breakpoint);
      expect(breakpointNames).toContain('xs');
      expect(breakpointNames).toContain('xl');
    });
  });
  
  describe('Content Volume Metrics', () => {
    
    test('Volume metrics are calculated correctly', async () => {
      const request: AIContentRequest = {
        contentType: ContentTypeEnum.ESSAY,
        studentId: 'student-123',
        sessionId: 'session-456',
        lessonId: 'lesson-789',
        career: 'Writer',
        gradeLevel: '9-12',
        subject: 'English',
        difficulty: 3
      };
      
      const response = await contentPipelineOrchestrator.generateContent(request);
      
      expect(response.content.volume).toBeDefined();
      expect(response.content.volume.text).toBeDefined();
      expect(response.content.volume.elements).toBeDefined();
      expect(response.content.volume.complexity).toBeDefined();
      expect(response.content.volume.complexity.score).toBeGreaterThanOrEqual(1);
      expect(response.content.volume.complexity.score).toBeLessThanOrEqual(10);
    });
  });
  
  describe('Error Handling', () => {
    
    test('Invalid content returns fallback response', async () => {
      const request: AIContentRequest = {
        contentType: 'INVALID_TYPE' as any,
        studentId: 'student-123',
        sessionId: 'session-456',
        lessonId: 'lesson-789',
        career: 'Test',
        gradeLevel: 'K-2',
        subject: 'Test',
        difficulty: 1
      };
      
      const response = await contentPipelineOrchestrator.generateContent(request);
      
      expect(response).toBeDefined();
      expect(response.modalType).toBeDefined();
      expect(response.version).toBe('2.0');
      // Should have error field or fallback content
      expect(response.error || response.content.data).toBeDefined();
    });
    
    test('Missing required fields are handled', async () => {
      const incompleteRequest = {
        contentType: ContentTypeEnum.FILL_BLANK,
        studentId: 'student-123'
        // Missing required fields
      } as AIContentRequest;
      
      const response = await contentPipelineOrchestrator.generateContent(incompleteRequest);
      
      expect(response).toBeDefined();
      expect(response.modalType).toBeDefined();
    });
  });
  
  describe('Performance Metrics', () => {
    
    test('Pipeline performance is tracked', async () => {
      // Reset metrics
      const initialMetrics = contentPipelineOrchestrator.getMetrics();
      
      // Generate multiple contents
      const requests = Array(5).fill(null).map((_, i) => ({
        contentType: ContentTypeEnum.SINGLE_SELECT,
        studentId: `student-${i}`,
        sessionId: `session-${i}`,
        lessonId: `lesson-${i}`,
        career: 'Engineer',
        gradeLevel: '6-8',
        subject: 'Math',
        difficulty: 2
      }));
      
      for (const request of requests) {
        await contentPipelineOrchestrator.generateContent(request);
      }
      
      const finalMetrics = contentPipelineOrchestrator.getMetrics();
      
      expect(finalMetrics.totalProcessed).toBeGreaterThan(initialMetrics.totalProcessed);
      expect(finalMetrics.averageProcessingTime).toBeGreaterThan(0);
      expect(finalMetrics.successRate).toBeGreaterThan(0);
    });
    
    test('Processing time is within acceptable limits', async () => {
      const startTime = Date.now();
      
      const request: AIContentRequest = {
        contentType: ContentTypeEnum.SINGLE_SELECT,
        studentId: 'student-123',
        sessionId: 'session-456',
        lessonId: 'lesson-789',
        career: 'Engineer',
        gradeLevel: '6-8',
        subject: 'Math',
        difficulty: 2
      };
      
      await contentPipelineOrchestrator.generateContent(request);
      
      const processingTime = Date.now() - startTime;
      
      // Should process within 500ms (can adjust based on requirements)
      expect(processingTime).toBeLessThan(500);
    });
  });
  
  describe('Integration Validation', () => {
    
    test('All components work together', async () => {
      const request: AIContentRequest = {
        contentType: ContentTypeEnum.DRAG_DROP,
        studentId: 'student-123',
        sessionId: 'session-456',
        lessonId: 'lesson-789',
        career: 'Architect',
        gradeLevel: '9-12',
        subject: 'Design',
        difficulty: 3,
        container: 'DISCOVER',
        deviceContext: {
          type: 'tablet',
          viewport: { width: 1024, height: 768 },
          orientation: 'landscape',
          touchEnabled: true,
          pixelRatio: 2
        }
      };
      
      const response = await contentPipelineOrchestrator.generateContent(request);
      
      // Validate complete response structure
      expect(response.contentId).toBeDefined();
      expect(response.modalType).toBe(ModalTypeEnum.DRAG_DROP);
      expect(response.version).toBe('2.0');
      expect(response.timestamp).toBeDefined();
      
      // Content validation
      expect(response.content).toBeDefined();
      expect(response.content.data).toBeDefined();
      expect(response.content.metadata).toBeDefined();
      expect(response.content.validation).toBeDefined();
      expect(response.content.display).toBeDefined();
      expect(response.content.volume).toBeDefined();
      
      // Dimensions validation
      expect(response.dimensions).toBeDefined();
      expect(response.dimensions.recommended.width).toBeGreaterThan(700);
      expect(response.dimensions.responsive.breakpoints.length).toBeGreaterThan(0);
      
      // UI compliance validation
      expect(response.uiCompliance.container).toBe('DISCOVER');
      expect(response.uiCompliance.theme).toBeDefined();
      expect(response.uiCompliance.accessibility.touchOptimized).toBe(true);
      
      // Context validation
      expect(response.context.device.type).toBe('tablet');
      expect(response.context.career).toBe('Architect');
      
      // Evaluation validation
      expect(response.evaluation).toBeDefined();
      expect(response.evaluation.scoringMethod).toBeDefined();
      
      // Performance validation
      expect(response.performance).toBeDefined();
      expect(response.performance.cacheStrategy).toBeDefined();
    });
  });
});

// Run specific modal type tests
describe('Modal Type Specific Tests', () => {
  
  test('Fill-in-blank modal structure', async () => {
    const content = {
      text: 'The capital of ___ is Paris.',
      blanks: [{ position: 15, answer: 'France' }]
    };
    
    const modalType = modalTypeResolver.resolveModalType(content);
    expect(modalType).toBe(ModalTypeEnum.FILL_BLANK);
    
    const standardized = dataStructureStandardizer.standardize(content, modalType);
    expect(standardized.data.text).toBeDefined();
    expect(standardized.data.blanks).toHaveLength(1);
  });
  
  test('Code editor modal structure', async () => {
    const content = {
      language: 'javascript',
      problem: 'Write a function to add two numbers',
      starterCode: 'function add(a, b) {\n  // Your code here\n}',
      testCases: [
        { input: [1, 2], expectedOutput: 3 },
        { input: [5, 7], expectedOutput: 12 }
      ]
    };
    
    const modalType = modalTypeResolver.resolveModalType(content);
    expect(modalType).toBe(ModalTypeEnum.CODE_EDITOR);
    
    const dimensions = dimensionCalculator.calculateDimensions(content, modalType);
    expect(dimensions.recommended.width).toBeGreaterThan(900);
    expect(dimensions.responsive.mobileFullScreen).toBe(true);
  });
});