/**
 * Unit Tests for CompanionRulesEngine
 * Tests 4 companions with career adaptations
 */

import { companionRulesEngine, CompanionContext } from '../companions/CompanionRulesEngine';

describe('CompanionRulesEngine', () => {
  // ============================================================================
  // COMPANION IDENTITY TESTS
  // ============================================================================
  
  describe('Companion Identity', () => {
    it('should have exactly 4 companions', () => {
      const companions = companionRulesEngine.getAvailableCompanions();
      expect(companions).toHaveLength(4);
      expect(companions).toEqual(['finn', 'spark', 'harmony', 'sage']);
    });
    
    it('should maintain companion personality traits', async () => {
      const companions = [
        { id: 'finn', trait: 'Adventurous' },
        { id: 'spark', trait: 'Creative' },
        { id: 'harmony', trait: 'Collaborative' },
        { id: 'sage', trait: 'Wise' }
      ];
      
      for (const companion of companions) {
        const context: CompanionContext = {
          userId: 'test-user',
          timestamp: new Date(),
          metadata: {},
          companionId: companion.id,
          career: { id: 'doctor', name: 'Doctor' },
          trigger: { type: 'greeting' }
        };
        
        const results = await companionRulesEngine.execute(context);
        const messageResult = results.find(r => r.data?.message);
        
        expect(messageResult).toBeDefined();
        expect(messageResult?.data?.traits).toContain(companion.trait);
      }
    });
  });
  
  // ============================================================================
  // CAREER ADAPTATION TESTS
  // ============================================================================
  
  describe('Career Adaptations', () => {
    it('should adapt messages for different careers', async () => {
      const careers = ['Doctor', 'Teacher', 'Scientist', 'Engineer', 'Artist'];
      const companionId = 'finn';
      
      const messages: string[] = [];
      
      for (const career of careers) {
        const context: CompanionContext = {
          userId: 'test-user',
          timestamp: new Date(),
          metadata: {},
          companionId,
          career: { id: career.toLowerCase(), name: career as any },
          trigger: { type: 'encouragement' },
          student: { grade: '3', level: 1 }
        };
        
        const results = await companionRulesEngine.execute(context);
        const messageResult = results.find(r => r.data?.message);
        
        expect(messageResult).toBeDefined();
        messages.push(messageResult?.data?.message || '');
      }
      
      // Each career should have unique message
      const uniqueMessages = new Set(messages);
      expect(uniqueMessages.size).toBeGreaterThan(1);
    });
    
    it('should include career-specific vocabulary', async () => {
      const careerVocabulary = {
        'doctor': ['patients', 'diagnosis', 'health'],
        'teacher': ['students', 'lesson', 'learning'],
        'scientist': ['experiment', 'hypothesis', 'discovery']
      };
      
      for (const [career, vocabulary] of Object.entries(careerVocabulary)) {
        const context: CompanionContext = {
          userId: 'test-user',
          timestamp: new Date(),
          metadata: {},
          companionId: 'spark',
          career: { id: career, name: career as any },
          trigger: { 
            type: 'career_context',
            context: { useCareerVocabulary: true }
          }
        };
        
        const results = await companionRulesEngine.execute(context);
        const vocabResult = results.find(r => r.data?.vocabulary);
        
        expect(vocabResult).toBeDefined();
        const foundVocab = vocabResult?.data?.vocabulary || [];
        
        // Should include at least one career-specific word
        const hasCareerWord = vocabulary.some(word => 
          foundVocab.some((v: string) => v.includes(word))
        );
        expect(hasCareerWord).toBe(true);
      }
    });
  });
  
  // ============================================================================
  // TRIGGER TYPE TESTS
  // ============================================================================
  
  describe('Trigger Types', () => {
    const triggerTypes = [
      'greeting',
      'encouragement',
      'help_request',
      'celebration',
      'mistake',
      'progress_update',
      'achievement',
      'milestone',
      'subject_transition',
      'container_complete'
    ];
    
    it('should handle all trigger types', async () => {
      for (const triggerType of triggerTypes) {
        const context: CompanionContext = {
          userId: 'test-user',
          timestamp: new Date(),
          metadata: {},
          companionId: 'harmony',
          career: { id: 'teacher', name: 'Teacher' },
          trigger: { type: triggerType }
        };
        
        const results = await companionRulesEngine.execute(context);
        expect(results).toBeDefined();
        expect(results.length).toBeGreaterThan(0);
        
        const messageResult = results.find(r => r.data?.message);
        expect(messageResult).toBeDefined();
        expect(messageResult?.data?.message).toBeTruthy();
      }
    });
    
    it('should have appropriate emotion for each trigger', async () => {
      const emotionMap = {
        'greeting': ['happy', 'friendly'],
        'celebration': ['celebrating', 'excited'],
        'mistake': ['supportive', 'encouraging'],
        'achievement': ['proud', 'celebrating']
      };
      
      for (const [trigger, expectedEmotions] of Object.entries(emotionMap)) {
        const context: CompanionContext = {
          userId: 'test-user',
          timestamp: new Date(),
          metadata: {},
          companionId: 'sage',
          career: { id: 'scientist', name: 'Scientist' },
          trigger: { type: trigger }
        };
        
        const results = await companionRulesEngine.execute(context);
        const emotionResult = results.find(r => r.data?.emotion);
        
        expect(emotionResult).toBeDefined();
        const emotion = emotionResult?.data?.emotion;
        expect(expectedEmotions).toContain(emotion);
      }
    });
  });
  
  // ============================================================================
  // GRADE ADAPTATION TESTS
  // ============================================================================
  
  describe('Grade Adaptations', () => {
    it('should adapt language complexity for different grades', async () => {
      const grades = ['K', '3', '7', '10'];
      
      for (const grade of grades) {
        const context: CompanionContext = {
          userId: 'test-user',
          timestamp: new Date(),
          metadata: {},
          companionId: 'finn',
          career: { id: 'engineer', name: 'Engineer' },
          trigger: { type: 'explanation' },
          student: { grade, level: 1 }
        };
        
        const results = await companionRulesEngine.execute(context);
        const complexityResult = results.find(r => r.data?.languageComplexity);
        
        expect(complexityResult).toBeDefined();
        
        // Higher grades should have higher complexity
        const complexity = complexityResult?.data?.languageComplexity || 0;
        if (grade === 'K') expect(complexity).toBeLessThanOrEqual(2);
        if (grade === '10') expect(complexity).toBeGreaterThanOrEqual(4);
      }
    });
  });
  
  // ============================================================================
  // RELATIONSHIP BUILDING TESTS
  // ============================================================================
  
  describe('Relationship Building', () => {
    it('should track relationship level', async () => {
      const context: CompanionContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        companionId: 'spark',
        career: { id: 'artist', name: 'Artist' },
        trigger: { type: 'interaction' },
        student: { 
          grade: '5',
          level: 1,
          relationship: 75
        }
      };
      
      const results = await companionRulesEngine.execute(context);
      const relationshipResult = results.find(r => r.data?.relationshipUpdate);
      
      expect(relationshipResult).toBeDefined();
      expect(relationshipResult?.data?.currentRelationship).toBe(75);
    });
    
    it('should provide more personal messages at higher relationship levels', async () => {
      const lowRelationship: CompanionContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        companionId: 'harmony',
        career: { id: 'chef', name: 'Chef' },
        trigger: { type: 'greeting' },
        student: { grade: '4', level: 1, relationship: 10 }
      };
      
      const highRelationship: CompanionContext = {
        ...lowRelationship,
        student: { grade: '4', level: 1, relationship: 90 }
      };
      
      const lowResults = await companionRulesEngine.execute(lowRelationship);
      const highResults = await companionRulesEngine.execute(highRelationship);
      
      const lowMessage = lowResults.find(r => r.data?.message)?.data?.message || '';
      const highMessage = highResults.find(r => r.data?.message)?.data?.message || '';
      
      // Messages should be different
      expect(lowMessage).not.toBe(highMessage);
      
      // High relationship should have more personal tone
      const highPersonalization = highResults.find(r => r.data?.personalizationLevel);
      expect(highPersonalization?.data?.personalizationLevel).toBeGreaterThan(1);
    });
  });
  
  // ============================================================================
  // PUBLIC METHOD TESTS
  // ============================================================================
  
  describe('Public Methods', () => {
    it('should get companion message', async () => {
      const message = await companionRulesEngine.getCompanionMessage(
        'finn',
        'Doctor',
        'celebration',
        { achievement: 'Math Master' }
      );
      
      expect(message).toBeDefined();
      expect(message.message).toContain('Math Master');
      expect(message.emotion).toBe('celebrating');
    });
    
    it('should get companion profile', () => {
      const profile = companionRulesEngine.getCompanionProfile('spark');
      
      expect(profile).toBeDefined();
      expect(profile.id).toBe('spark');
      expect(profile.name).toBe('Spark');
      expect(profile.traits).toContain('Creative');
      expect(profile.emoji).toBe('✨');
    });
    
    it('should get all companions', () => {
      const companions = companionRulesEngine.getAvailableCompanions();
      
      expect(companions).toHaveLength(4);
      expect(companions).toContain('finn');
      expect(companions).toContain('spark');
      expect(companions).toContain('harmony');
      expect(companions).toContain('sage');
    });
  });
  
  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================
  
  describe('Performance', () => {
    it('should execute rules within 50ms', async () => {
      const context: CompanionContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        companionId: 'sage',
        career: { id: 'astronaut', name: 'Astronaut' },
        trigger: { type: 'complex_interaction' },
        student: { grade: '8', level: 3, relationship: 50 }
      };
      
      const startTime = Date.now();
      await companionRulesEngine.execute(context);
      const executionTime = Date.now() - startTime;
      
      expect(executionTime).toBeLessThan(50);
    });
    
    it('should handle rapid successive calls', async () => {
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        const context: CompanionContext = {
          userId: `user-${i}`,
          timestamp: new Date(),
          metadata: {},
          companionId: ['finn', 'spark', 'harmony', 'sage'][i % 4],
          career: { id: 'teacher', name: 'Teacher' },
          trigger: { type: 'greeting' }
        };
        
        promises.push(companionRulesEngine.execute(context));
      }
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });
});

// ============================================================================
// MOCK DATA HELPERS
// ============================================================================

function createMockContext(overrides?: Partial<CompanionContext>): CompanionContext {
  return {
    userId: 'test-user',
    timestamp: new Date(),
    metadata: {},
    companionId: 'finn',
    career: { id: 'doctor', name: 'Doctor' },
    trigger: { type: 'greeting' },
    ...overrides
  };
}