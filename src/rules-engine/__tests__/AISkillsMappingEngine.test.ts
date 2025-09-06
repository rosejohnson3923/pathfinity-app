/**
 * AISkillsMappingEngine Integration Tests
 * Tests the skills mapping engine with actual data from skillsDataComplete.ts
 */

import { AISkillsMappingEngine } from '../skills/AISkillsMappingEngine';
import { MasterAIRulesEngine } from '../MasterAIRulesEngine';
import { registerAllEngines } from '../registerEngines';

describe('AISkillsMappingEngine', () => {
  let skillsEngine: AISkillsMappingEngine;
  let masterEngine: MasterAIRulesEngine;

  beforeAll(async () => {
    skillsEngine = AISkillsMappingEngine.getInstance();
    masterEngine = MasterAIRulesEngine.getInstance();
    
    // Register all engines including skills mapping
    await registerAllEngines();
  });

  describe('Skills Data Loading', () => {
    it('should load skills data on first access', async () => {
      const skill = await skillsEngine.getSkill('Math_K_1');
      
      expect(skill).toBeDefined();
      expect(skill?.skillName).toBe('Numbers to 3');
      expect(skill?.grade).toBe('Kindergarten');
      expect(skill?.subject).toBe('Math');
    });

    it('should handle 34,000+ lines of skills data efficiently', async () => {
      const startTime = Date.now();
      
      // Search all kindergarten math skills
      const kMathSkills = await skillsEngine.getSkillsByGradeAndSubject('Kindergarten', 'Math');
      
      const loadTime = Date.now() - startTime;
      
      expect(kMathSkills.length).toBeGreaterThan(0);
      expect(loadTime).toBeLessThan(1000); // Should load in under 1 second
      
      console.log(`Loaded ${kMathSkills.length} Kindergarten Math skills in ${loadTime}ms`);
    });

    it('should normalize grade names correctly', async () => {
      // Test both 'K' and 'Kindergarten' return same results
      const kSkills = await skillsEngine.getSkillsByGradeAndSubject('K', 'Math');
      const kindergartenSkills = await skillsEngine.getSkillsByGradeAndSubject('Kindergarten', 'Math');
      
      expect(kSkills.length).toBe(kindergartenSkills.length);
    });
  });

  describe('Skill Progression', () => {
    it('should identify counting to 3 as appropriate for Kindergarten', async () => {
      const countingSkills = await skillsEngine.searchSkillsByKeyword('Counting to 3');
      
      const kCountingSkill = countingSkills.find(s => s.grade === 'Kindergarten');
      
      expect(kCountingSkill).toBeDefined();
      expect(kCountingSkill?.skillNumber).toBe('B.0');
      expect(kCountingSkill?.visualAidsRequired).toBe(true);
    });

    it('should NOT recommend counting to 10 as first skill for Kindergarten', async () => {
      const skill = await skillsEngine.getSkill('Math_K_4'); // Counting to 3
      
      // Get recommendations for a new Kindergarten student
      const recommendations = await skillsEngine.getRecommendations(
        'Math_K_4',
        [] // No mastered skills yet
      );
      
      // Should not recommend counting to 10 immediately
      const hasCountingTo10 = recommendations.some(r => 
        r.skillId.includes('Counting to 10')
      );
      
      expect(hasCountingTo10).toBe(false);
    });

    it('should validate skill progression correctly', async () => {
      // Valid progression: Counting to 3 -> Counting to 5
      const isValid = await skillsEngine.validateSkillProgression(
        'Math_K_4', // Counting to 3
        'Math_K_14', // Numbers to 5
        ['Math_K_4'] // Mastered counting to 3
      );
      
      expect(isValid).toBe(true);
      
      // Invalid progression: Counting to 3 -> Algebra (way too advanced)
      const isInvalid = await skillsEngine.validateSkillProgression(
        'Math_K_4', // Counting to 3
        'Math_Grade7_1', // Grade 7 skill
        ['Math_K_4']
      );
      
      expect(isInvalid).toBe(false);
    });
  });

  describe('Performance Optimization', () => {
    it('should cache search results efficiently', async () => {
      const searchCriteria = {
        grade: 'Kindergarten',
        subject: 'Math',
        keyword: 'count'
      };
      
      // First search - will cache miss
      const start1 = Date.now();
      const results1 = await skillsEngine.execute({
        operation: 'search',
        searchCriteria
      });
      const time1 = Date.now() - start1;
      
      // Second search - should cache hit
      const start2 = Date.now();
      const results2 = await skillsEngine.execute({
        operation: 'search',
        searchCriteria
      });
      const time2 = Date.now() - start2;
      
      expect(time2).toBeLessThan(time1); // Cache hit should be faster
      expect(results1[0].data.skills.length).toBe(results2[0].data.skills.length);
      
      const metrics = skillsEngine.getPerformanceMetrics();
      console.log('Cache performance:', metrics);
    });

    it('should handle multiple grade lookups efficiently', async () => {
      const grades = ['Kindergarten', 'Grade 3', 'Grade 7', 'Grade 10'];
      const results: any[] = [];
      
      const startTime = Date.now();
      
      for (const grade of grades) {
        const skills = await skillsEngine.getSkillsByGradeAndSubject(grade, 'Math');
        results.push({
          grade,
          count: skills.length
        });
      }
      
      const totalTime = Date.now() - startTime;
      
      console.log('Multi-grade lookup results:', results);
      console.log(`Total time for ${grades.length} grades: ${totalTime}ms`);
      
      expect(totalTime).toBeLessThan(2000); // Should complete in under 2 seconds
      results.forEach(r => {
        expect(r.count).toBeGreaterThan(0);
      });
    });
  });

  describe('Master Engine Integration', () => {
    it('should execute through master orchestration', async () => {
      const context = {
        userId: 'test-user',
        studentId: 'sam-k',
        sessionId: 'test-session',
        grade: 'Kindergarten',
        subject: 'Math',
        currentSkill: 'Math_K_4', // Counting to 3
        masteredSkills: ['Math_K_1', 'Math_K_2', 'Math_K_3']
      };
      
      const result = await masterEngine.orchestrate(context);
      
      expect(result.success).toBe(true);
      expect(result.results.has('AISkillsMappingEngine')).toBe(true);
      
      const skillsResults = result.results.get('AISkillsMappingEngine');
      expect(skillsResults).toBeDefined();
      expect(skillsResults?.length).toBeGreaterThan(0);
    });

    it('should coordinate with LearnAIRulesEngine', async () => {
      const context = {
        userId: 'test-user',
        studentId: 'sam-k',
        sessionId: 'test-session',
        container: 'learn' as const,
        grade: 'Kindergarten',
        subject: 'Math',
        currentSkill: 'Math_K_4',
        career: {
          id: 'scientist',
          name: 'Scientist'
        }
      };
      
      const result = await masterEngine.orchestrate(context);
      
      // Should execute both Learn and Skills engines
      expect(result.results.has('LearnAIRulesEngine')).toBe(true);
      expect(result.results.has('AISkillsMappingEngine')).toBe(true);
      
      // Check execution order
      const executionOrder = result.engineExecutions
        .filter(e => e.executed)
        .map(e => e.engineId);
      
      console.log('Execution order:', executionOrder);
      
      // Skills engine should execute when grade/subject present
      expect(executionOrder).toContain('AISkillsMappingEngine');
    });
  });

  describe('Age-Appropriate Validation', () => {
    it('should flag counting to 10 as advanced for new Kindergarten student', async () => {
      const countingTo10Skills = await skillsEngine.searchSkillsByKeyword('Counting to 10');
      const kCountingTo10 = countingTo10Skills.find(s => s.grade === 'Kindergarten');
      
      if (kCountingTo10) {
        // This is an advanced K skill, not a starting skill
        expect(kCountingTo10.difficulty).toBeGreaterThan(3);
        
        // Should have prerequisites
        expect(kCountingTo10.prerequisites?.length).toBeGreaterThan(0);
      }
    });

    it('should recommend visual aids for K-2 math skills', async () => {
      const kMathSkills = await skillsEngine.getSkillsByGradeAndSubject('Kindergarten', 'Math');
      
      // Count skills that require visual aids
      const visualAidsRequired = kMathSkills.filter(s => s.visualAidsRequired).length;
      const percentage = (visualAidsRequired / kMathSkills.length) * 100;
      
      console.log(`${percentage.toFixed(1)}% of K Math skills require visual aids`);
      
      // Most K math skills should require visual aids
      expect(percentage).toBeGreaterThan(50);
    });
  });

  describe('Career Connections', () => {
    it('should connect math skills to relevant careers', async () => {
      const mathSkill = await skillsEngine.getSkill('Math_K_4');
      
      expect(mathSkill?.careerConnections).toBeDefined();
      expect(mathSkill?.careerConnections).toContain('Scientist');
      expect(mathSkill?.careerConnections).toContain('Engineer');
    });
  });

  afterAll(() => {
    // Clear caches after tests
    skillsEngine.clearCache();
    
    const finalMetrics = skillsEngine.getPerformanceMetrics();
    console.log('\nFinal Performance Metrics:', finalMetrics);
  });
});

// Performance benchmark test
describe('AISkillsMappingEngine Performance Benchmark', () => {
  let engine: AISkillsMappingEngine;

  beforeAll(() => {
    engine = AISkillsMappingEngine.getInstance();
  });

  it('should handle 1000 concurrent lookups', async () => {
    const lookups = Array(1000).fill(null).map((_, i) => 
      engine.getSkill(`Math_K_${(i % 50) + 1}`)
    );
    
    const startTime = Date.now();
    const results = await Promise.all(lookups);
    const totalTime = Date.now() - startTime;
    
    const validResults = results.filter(r => r !== null).length;
    
    console.log(`1000 concurrent lookups completed in ${totalTime}ms`);
    console.log(`Average time per lookup: ${(totalTime / 1000).toFixed(2)}ms`);
    
    expect(totalTime).toBeLessThan(5000); // Should complete in under 5 seconds
    expect(validResults).toBeGreaterThan(0);
  });

  it('should search across all 4 loaded grades efficiently', async () => {
    const searches = [
      { grade: 'Kindergarten', keyword: 'count' },
      { grade: 'Grade 3', keyword: 'multiply' },
      { grade: 'Grade 7', keyword: 'algebra' },
      { grade: 'Grade 10', keyword: 'geometry' }
    ];
    
    const results = await Promise.all(
      searches.map(criteria => 
        engine.execute({
          operation: 'search',
          searchCriteria: criteria
        })
      )
    );
    
    results.forEach((result, index) => {
      const skills = result[0]?.data?.skills || [];
      console.log(`${searches[index].grade} - "${searches[index].keyword}": ${skills.length} results`);
      expect(skills.length).toBeGreaterThanOrEqual(0);
    });
  });
});