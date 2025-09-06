/**
 * Unit Tests for LearnAIRulesEngine
 * Tests all critical bug fixes and core functionality
 */

import { learnAIRulesEngine, LearnContext } from '../containers/LearnAIRulesEngine';

describe('LearnAIRulesEngine', () => {
  // ============================================================================
  // BUG FIX TESTS - Critical validation that bugs are fixed
  // ============================================================================
  
  describe('Bug Fix: Correct answers marked wrong', () => {
    it('should correctly validate counting questions with type coercion', async () => {
      const context: LearnContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        student: {
          id: 'student-1',
          grade: 'K'
        },
        subject: 'math',
        answerContext: {
          questionType: 'counting',
          userAnswer: '5',  // String
          correctAnswer: 5   // Number
        }
      };
      
      const results = await learnAIRulesEngine.execute(context);
      const validationResult = results.find(r => r.data?.isCorrect !== undefined);
      
      expect(validationResult).toBeDefined();
      expect(validationResult?.data?.isCorrect).toBe(true);
      expect(validationResult?.data?.rulesApplied?.typeCoercion).toBe(true);
    });
    
    it('should correctly validate numeric answers with tolerance', async () => {
      const context: LearnContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        student: {
          id: 'student-1',
          grade: '3'
        },
        subject: 'math',
        answerContext: {
          questionType: 'numeric',
          userAnswer: 10.001,
          correctAnswer: 10
        }
      };
      
      const results = await learnAIRulesEngine.execute(context);
      const validationResult = results.find(r => r.data?.isCorrect !== undefined);
      
      expect(validationResult?.data?.isCorrect).toBe(true);
    });
    
    it('should handle true/false answers case-insensitively', async () => {
      const context: LearnContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        student: {
          id: 'student-1',
          grade: '2'
        },
        subject: 'science',
        answerContext: {
          questionType: 'true_false',
          userAnswer: 'TRUE',
          correctAnswer: 'true'
        }
      };
      
      const results = await learnAIRulesEngine.execute(context);
      const validationResult = results.find(r => r.data?.isCorrect !== undefined);
      
      expect(validationResult?.data?.isCorrect).toBe(true);
    });
  });
  
  describe('Bug Fix: ELA showing math questions', () => {
    it('should never select counting type for ELA', async () => {
      const context: LearnContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        student: {
          id: 'student-1',
          grade: 'K'
        },
        subject: 'ela',
        mode: 'practice'
      };
      
      const results = await learnAIRulesEngine.execute(context);
      const typeResult = results.find(r => r.data?.selectedType);
      
      expect(typeResult).toBeDefined();
      expect(typeResult?.data?.selectedType).not.toBe('counting');
      expect(typeResult?.data?.allowedTypes).not.toContain('counting');
    });
    
    it('should select appropriate types for each subject', async () => {
      const subjects: Array<['math' | 'ela' | 'science' | 'social_studies', string[]]> = [
        ['math', ['counting', 'numeric', 'multiple_choice']],
        ['ela', ['multiple_choice', 'true_false', 'fill_blank']],
        ['science', ['multiple_choice', 'true_false', 'observation']],
        ['social_studies', ['multiple_choice', 'true_false', 'map_reading']]
      ];
      
      for (const [subject, expectedTypes] of subjects) {
        const context: LearnContext = {
          userId: 'test-user',
          timestamp: new Date(),
          metadata: {},
          student: {
            id: 'student-1',
            grade: '3'
          },
          subject,
          mode: 'practice'
        };
        
        const results = await learnAIRulesEngine.execute(context);
        const typeResult = results.find(r => r.data?.selectedType);
        
        expect(typeResult).toBeDefined();
        const selectedType = typeResult?.data?.selectedType;
        expect(expectedTypes).toContain(selectedType);
      }
    });
  });
  
  describe('Bug Fix: Counting questions format', () => {
    it('should require visual field for counting questions', async () => {
      const context: LearnContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        student: {
          id: 'student-1',
          grade: 'K'
        },
        subject: 'math',
        questionContext: {
          type: 'counting',
          // Missing visual field
        }
      };
      
      const results = await learnAIRulesEngine.execute(context);
      const validationResult = results.find(r => r.error || r.warnings);
      
      expect(validationResult).toBeDefined();
      expect(validationResult?.error).toContain('visual');
    });
    
    it('should pass validation with visual field present', async () => {
      const context: LearnContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        student: {
          id: 'student-1',
          grade: 'K'
        },
        subject: 'math',
        questionContext: {
          type: 'counting',
          visual: 'apples.png'
        }
      };
      
      const results = await learnAIRulesEngine.execute(context);
      const validationResult = results.find(r => r.success && !r.error);
      
      expect(validationResult).toBeDefined();
    });
  });
  
  describe('Bug Fix: Questions changing before interaction', () => {
    it('should detect duplicate questions', async () => {
      const context: LearnContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        student: {
          id: 'student-1',
          grade: '3'
        },
        subject: 'math',
        questionContext: {
          question: 'What is 2 + 2?',
          previousQuestions: ['What is 2 + 2?', 'What is 3 + 3?']
        }
      };
      
      const results = await learnAIRulesEngine.execute(context);
      const repetitionResult = results.find(r => r.data?.regenerate);
      
      expect(repetitionResult).toBeDefined();
      expect(repetitionResult?.success).toBe(false);
      expect(repetitionResult?.error).toContain('Duplicate');
    });
  });
  
  // ============================================================================
  // CORE FUNCTIONALITY TESTS
  // ============================================================================
  
  describe('Career Context Integration', () => {
    it('should apply career context to questions', async () => {
      const context: LearnContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        student: {
          id: 'student-1',
          grade: '3'
        },
        subject: 'math',
        career: {
          id: 'doctor',
          name: 'Doctor'
        },
        questionContext: {
          useCareerContext: true
        }
      };
      
      const results = await learnAIRulesEngine.execute(context);
      const careerResult = results.find(r => r.data?.vocabulary || r.data?.scenario);
      
      expect(careerResult).toBeDefined();
      expect(careerResult?.data?.vocabulary).toContain('patients');
    });
  });
  
  describe('Grade-Appropriate Content', () => {
    it('should use appropriate vocabulary for grade level', async () => {
      const grades = ['K', '1', '2', '3', '4', '5'];
      
      for (const grade of grades) {
        const context: LearnContext = {
          userId: 'test-user',
          timestamp: new Date(),
          metadata: {},
          student: {
            id: 'student-1',
            grade
          },
          subject: 'math',
          mode: 'practice'
        };
        
        const results = await learnAIRulesEngine.execute(context);
        const ageResult = results.find(r => r.data?.ageAppropriate);
        
        expect(ageResult).toBeDefined();
        expect(ageResult?.data?.recommendations).toBeDefined();
      }
    });
  });
  
  describe('Skill Progression', () => {
    it('should track skill progression correctly', async () => {
      const context: LearnContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        student: {
          id: 'student-1',
          grade: '3'
        },
        subject: 'math',
        skill: {
          id: 'addition',
          name: 'Addition',
          category: 'arithmetic',
          difficulty: 1
        },
        answerContext: {
          questionType: 'numeric',
          userAnswer: 5,
          correctAnswer: 5
        },
        data: {
          isCorrect: true
        }
      };
      
      const results = await learnAIRulesEngine.execute(context);
      const progressionResult = results.find(r => r.data?.attempts !== undefined);
      
      expect(progressionResult).toBeDefined();
      expect(progressionResult?.data?.attempts).toBeGreaterThanOrEqual(1);
    });
  });
  
  describe('Public Methods', () => {
    it('should return question rules for subject and grade', () => {
      const rules = learnAIRulesEngine.getQuestionRules('math', '3');
      
      expect(rules).toBeDefined();
      expect(rules.subject).toBe('math');
      expect(rules.grade).toBe('3');
      expect(rules.allowedTypes).toContain('numeric');
      expect(rules.preferredTypes).toBeDefined();
    });
    
    it('should validate question structure', () => {
      const validQuestion = {
        type: 'counting',
        question: 'How many apples?',
        correct_answer: 5,
        visual: 'apples.png'
      };
      
      const invalidQuestion = {
        type: 'counting',
        question: 'How many apples?',
        correct_answer: 5
        // Missing visual
      };
      
      expect(learnAIRulesEngine.validateQuestionStructure(validQuestion)).toBe(true);
      expect(learnAIRulesEngine.validateQuestionStructure(invalidQuestion)).toBe(false);
    });
  });
  
  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================
  
  describe('Performance', () => {
    it('should execute rules within 50ms', async () => {
      const context: LearnContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        student: {
          id: 'student-1',
          grade: '3'
        },
        subject: 'math',
        answerContext: {
          questionType: 'numeric',
          userAnswer: 5,
          correctAnswer: 5
        }
      };
      
      const startTime = Date.now();
      await learnAIRulesEngine.execute(context);
      const executionTime = Date.now() - startTime;
      
      expect(executionTime).toBeLessThan(50);
    });
  });
});

// ============================================================================
// MOCK DATA HELPERS
// ============================================================================

function createMockContext(overrides?: Partial<LearnContext>): LearnContext {
  return {
    userId: 'test-user',
    timestamp: new Date(),
    metadata: {},
    student: {
      id: 'student-1',
      grade: '3'
    },
    subject: 'math',
    ...overrides
  };
}