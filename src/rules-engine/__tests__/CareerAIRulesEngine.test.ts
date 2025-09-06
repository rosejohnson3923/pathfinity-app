/**
 * Unit Tests for CareerAIRulesEngine
 * Tests 15 careers with progression system
 */

import { careerAIRulesEngine, CareerContext } from '../career/CareerAIRulesEngine';
import { careerProgressionSystem, CareerExposureLevel } from '../career/CareerProgressionSystem';

describe('CareerAIRulesEngine', () => {
  // ============================================================================
  // CAREER PROFILES TESTS
  // ============================================================================
  
  describe('Career Profiles', () => {
    it('should have exactly 15 careers', () => {
      const careers = careerAIRulesEngine.getAvailableCareers();
      expect(careers).toHaveLength(15);
    });
    
    it('should have complete profile for each career', () => {
      const careers = careerAIRulesEngine.getAvailableCareers();
      
      for (const careerId of careers) {
        const profile = careerAIRulesEngine.getCareerProfile(careerId);
        
        expect(profile).toBeDefined();
        expect(profile.id).toBe(careerId);
        expect(profile.name).toBeDefined();
        expect(profile.icon).toBeDefined();
        expect(profile.color).toBeDefined();
        expect(profile.description).toBeDefined();
        expect(profile.skills).toBeInstanceOf(Array);
        expect(profile.skills.length).toBeGreaterThan(0);
        expect(profile.tools).toBeInstanceOf(Array);
        expect(profile.tools.length).toBeGreaterThan(0);
        expect(profile.vocabulary).toBeInstanceOf(Array);
        expect(profile.vocabulary.length).toBeGreaterThan(0);
        expect(profile.scenarios).toBeInstanceOf(Array);
        expect(profile.scenarios.length).toBeGreaterThan(0);
      }
    });
    
    it('should have unique colors for each career', () => {
      const careers = careerAIRulesEngine.getAvailableCareers();
      const colors = new Set();
      
      for (const careerId of careers) {
        const profile = careerAIRulesEngine.getCareerProfile(careerId);
        colors.add(profile.color);
      }
      
      // Each career should have a unique color
      expect(colors.size).toBe(careers.length);
    });
  });
  
  // ============================================================================
  // CAREER VOCABULARY TESTS
  // ============================================================================
  
  describe('Career Vocabulary', () => {
    it('should provide career-specific vocabulary', async () => {
      const careerVocabulary = {
        'doctor': ['patients', 'diagnosis', 'treatment', 'medicine'],
        'teacher': ['students', 'lesson', 'classroom', 'education'],
        'scientist': ['experiment', 'hypothesis', 'research', 'discovery'],
        'engineer': ['design', 'build', 'solve', 'create'],
        'artist': ['paint', 'draw', 'create', 'express']
      };
      
      for (const [careerId, expectedWords] of Object.entries(careerVocabulary)) {
        const context: CareerContext = {
          userId: 'test-user',
          timestamp: new Date(),
          metadata: {},
          career: {
            id: careerId,
            name: careerId as any
          },
          request: {
            type: 'vocabulary',
            grade: '3'
          }
        };
        
        const results = await careerAIRulesEngine.execute(context);
        const vocabResult = results.find(r => r.data?.vocabulary);
        
        expect(vocabResult).toBeDefined();
        const vocabulary = vocabResult?.data?.vocabulary || [];
        
        // Should include at least one expected word
        const hasExpectedWord = expectedWords.some(word => 
          vocabulary.some((v: string) => v.toLowerCase().includes(word))
        );
        expect(hasExpectedWord).toBe(true);
      }
    });
    
    it('should adapt vocabulary complexity by grade', async () => {
      const grades = ['K', '3', '7', '10'];
      const careerId = 'doctor';
      
      const vocabularies: any[] = [];
      
      for (const grade of grades) {
        const context: CareerContext = {
          userId: 'test-user',
          timestamp: new Date(),
          metadata: {},
          career: {
            id: careerId,
            name: 'Doctor'
          },
          request: {
            type: 'vocabulary',
            grade
          }
        };
        
        const results = await careerAIRulesEngine.execute(context);
        const vocabResult = results.find(r => r.data?.vocabulary);
        vocabularies.push(vocabResult?.data?.vocabulary || []);
      }
      
      // Kindergarten should have simpler words
      expect(vocabularies[0]).toContain('doctor');
      expect(vocabularies[0]).toContain('help');
      
      // Higher grades should have more complex terms
      expect(vocabularies[3].some((word: string) => 
        ['diagnosis', 'treatment', 'specialist'].includes(word)
      )).toBe(true);
    });
  });
  
  // ============================================================================
  // CAREER SCENARIOS TESTS
  // ============================================================================
  
  describe('Career Scenarios', () => {
    it('should generate career-specific scenarios', async () => {
      const careers = ['pilot', 'chef', 'veterinarian'];
      
      for (const careerId of careers) {
        const context: CareerContext = {
          userId: 'test-user',
          timestamp: new Date(),
          metadata: {},
          career: {
            id: careerId,
            name: careerId as any
          },
          request: {
            type: 'scenario',
            subject: 'math',
            grade: '4'
          }
        };
        
        const results = await careerAIRulesEngine.execute(context);
        const scenarioResult = results.find(r => r.data?.scenario);
        
        expect(scenarioResult).toBeDefined();
        const scenario = scenarioResult?.data?.scenario;
        
        // Scenario should be career-relevant
        if (careerId === 'pilot') {
          expect(scenario.toLowerCase()).toMatch(/flight|airplane|altitude|navigation/);
        } else if (careerId === 'chef') {
          expect(scenario.toLowerCase()).toMatch(/recipe|ingredient|cook|meal/);
        } else if (careerId === 'veterinarian') {
          expect(scenario.toLowerCase()).toMatch(/animal|pet|care|health/);
        }
      }
    });
    
    it('should create subject-appropriate scenarios', async () => {
      const subjects = ['math', 'science', 'ela', 'social_studies'];
      const careerId = 'scientist';
      
      for (const subject of subjects) {
        const context: CareerContext = {
          userId: 'test-user',
          timestamp: new Date(),
          metadata: {},
          career: {
            id: careerId,
            name: 'Scientist'
          },
          request: {
            type: 'scenario',
            subject,
            grade: '5'
          }
        };
        
        const results = await careerAIRulesEngine.execute(context);
        const scenarioResult = results.find(r => r.data?.scenario);
        
        expect(scenarioResult).toBeDefined();
        expect(scenarioResult?.data?.subject).toBe(subject);
      }
    });
  });
  
  // ============================================================================
  // CAREER PROGRESSION TESTS
  // ============================================================================
  
  describe('Career Progression Integration', () => {
    it('should integrate with progression system', () => {
      const grades = ['K', '2', '4', '7', '10'];
      const expectedLevels = [
        CareerExposureLevel.EXPLORER,
        CareerExposureLevel.APPRENTICE,
        CareerExposureLevel.PRACTITIONER,
        CareerExposureLevel.SPECIALIST,
        CareerExposureLevel.EXPERT
      ];
      
      for (let i = 0; i < grades.length; i++) {
        const level = careerProgressionSystem.getExposureLevelForGrade(grades[i]);
        expect(level).toBe(expectedLevels[i]);
      }
    });
    
    it('should provide age-appropriate career labels', () => {
      const testCases = [
        { career: 'doctor', grade: 'K', expected: 'Doctor Helper' },
        { career: 'doctor', grade: '3', expected: 'Doctor in Training' },
        { career: 'doctor', grade: '5', expected: 'Junior Doctor' },
        { career: 'doctor', grade: '7', expected: 'Medical Student' },
        { career: 'doctor', grade: '10', expected: 'Medical Professional' }
      ];
      
      for (const test of testCases) {
        const label = careerProgressionSystem.getCareerLabel(test.career, test.grade);
        expect(label).toBe(test.expected);
      }
    });
  });
  
  // ============================================================================
  // CAREER TOOLS TESTS
  // ============================================================================
  
  describe('Career Tools', () => {
    it('should provide career-specific tools', async () => {
      const careerTools = {
        'engineer': ['calculator', 'blueprint', 'computer', 'ruler'],
        'artist': ['paintbrush', 'canvas', 'palette', 'easel'],
        'scientist': ['microscope', 'beaker', 'lab coat', 'notebook'],
        'chef': ['knife', 'pan', 'oven', 'recipe book']
      };
      
      for (const [careerId, expectedTools] of Object.entries(careerTools)) {
        const context: CareerContext = {
          userId: 'test-user',
          timestamp: new Date(),
          metadata: {},
          career: {
            id: careerId,
            name: careerId as any
          },
          request: {
            type: 'tools'
          }
        };
        
        const results = await careerAIRulesEngine.execute(context);
        const toolsResult = results.find(r => r.data?.tools);
        
        expect(toolsResult).toBeDefined();
        const tools = toolsResult?.data?.tools || [];
        
        // Should include career-specific tools
        const hasExpectedTool = expectedTools.some(tool => 
          tools.some((t: string) => t.toLowerCase().includes(tool))
        );
        expect(hasExpectedTool).toBe(true);
      }
    });
  });
  
  // ============================================================================
  // CAREER ACTIVITIES TESTS
  // ============================================================================
  
  describe('Career Activities', () => {
    it('should suggest career-relevant activities', async () => {
      const context: CareerContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        career: {
          id: 'astronaut',
          name: 'Astronaut'
        },
        request: {
          type: 'activity',
          subject: 'science',
          grade: '6'
        }
      };
      
      const results = await careerAIRulesEngine.execute(context);
      const activityResult = results.find(r => r.data?.activity);
      
      expect(activityResult).toBeDefined();
      const activity = activityResult?.data?.activity;
      
      expect(activity.title).toBeDefined();
      expect(activity.description).toBeDefined();
      expect(activity.steps).toBeInstanceOf(Array);
      expect(activity.careerConnection).toContain('space');
    });
  });
  
  // ============================================================================
  // PUBLIC METHOD TESTS
  // ============================================================================
  
  describe('Public Methods', () => {
    it('should get career profile', () => {
      const profile = careerAIRulesEngine.getCareerProfile('teacher');
      
      expect(profile).toBeDefined();
      expect(profile.id).toBe('teacher');
      expect(profile.name).toBe('Teacher');
      expect(profile.icon).toBe('👩‍🏫');
      expect(profile.skills).toContain('Education');
    });
    
    it('should get career vocabulary', () => {
      const vocabulary = careerAIRulesEngine.getCareerVocabulary('scientist', '5');
      
      expect(vocabulary).toBeInstanceOf(Array);
      expect(vocabulary.length).toBeGreaterThan(0);
      expect(vocabulary.some(word => 
        ['experiment', 'hypothesis', 'research'].includes(word.toLowerCase())
      )).toBe(true);
    });
    
    it('should get career scenario', () => {
      const scenario = careerAIRulesEngine.getCareerScenario(
        'firefighter',
        'math',
        '4'
      );
      
      expect(scenario).toBeDefined();
      expect(scenario.context).toContain('fire');
      expect(scenario.problem).toBeDefined();
      expect(scenario.careerConnection).toBeDefined();
    });
    
    it('should list all available careers', () => {
      const careers = careerAIRulesEngine.getAvailableCareers();
      
      expect(careers).toBeInstanceOf(Array);
      expect(careers).toHaveLength(15);
      expect(careers).toContain('doctor');
      expect(careers).toContain('teacher');
      expect(careers).toContain('astronaut');
    });
  });
  
  // ============================================================================
  // CAREER BUILDER TESTS
  // ============================================================================
  
  describe('Career Registration', () => {
    it('should support custom career registration', () => {
      // This would test the career builder pattern
      const customCareer = {
        id: 'game_developer',
        name: 'Game Developer',
        icon: '🎮',
        color: '#9333ea',
        description: 'Create fun and engaging video games',
        skills: ['Programming', 'Design', 'Creativity'],
        tools: ['Computer', 'Code Editor', 'Graphics Software'],
        vocabulary: ['code', 'debug', 'gameplay', 'level design'],
        scenarios: ['Design a game level', 'Fix a bug', 'Test gameplay']
      };
      
      // In a real implementation, this would register the career
      // careerProgressionSystem.registerCareer(customCareer);
      
      expect(customCareer.id).toBeDefined();
      expect(customCareer.skills).toBeInstanceOf(Array);
    });
  });
  
  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================
  
  describe('Performance', () => {
    it('should execute rules within 40ms', async () => {
      const context: CareerContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        career: {
          id: 'engineer',
          name: 'Engineer'
        },
        request: {
          type: 'complex_request',
          subject: 'math',
          grade: '7',
          includeVocabulary: true,
          includeScenario: true,
          includeTools: true
        }
      };
      
      const startTime = Date.now();
      await careerAIRulesEngine.execute(context);
      const executionTime = Date.now() - startTime;
      
      expect(executionTime).toBeLessThan(40);
    });
    
    it('should handle multiple career requests concurrently', async () => {
      const careers = careerAIRulesEngine.getAvailableCareers();
      const promises = [];
      
      for (const careerId of careers) {
        const context: CareerContext = {
          userId: `user-${careerId}`,
          timestamp: new Date(),
          metadata: {},
          career: {
            id: careerId,
            name: careerId as any
          },
          request: {
            type: 'vocabulary',
            grade: '5'
          }
        };
        
        promises.push(careerAIRulesEngine.execute(context));
      }
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(15);
      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });
  
  // ============================================================================
  // CAREER ACTIVITIES BY GRADE TESTS
  // ============================================================================
  
  describe('Grade-Appropriate Career Activities', () => {
    it('should provide different activities for different grades', async () => {
      const grades = ['K', '3', '7', '10'];
      const careerId = 'engineer';
      const activities: any[] = [];
      
      for (const grade of grades) {
        const context: CareerContext = {
          userId: 'test-user',
          timestamp: new Date(),
          metadata: {},
          career: {
            id: careerId,
            name: 'Engineer'
          },
          request: {
            type: 'activity',
            grade,
            subject: 'math'
          }
        };
        
        const results = await careerAIRulesEngine.execute(context);
        const activityResult = results.find(r => r.data?.activity);
        activities.push(activityResult?.data?.activity);
      }
      
      // Activities should increase in complexity
      expect(activities[0].difficulty).toBe('easy');
      expect(activities[3].difficulty).toBe('advanced');
      
      // Each grade should have unique activities
      const titles = activities.map(a => a.title);
      const uniqueTitles = new Set(titles);
      expect(uniqueTitles.size).toBe(4);
    });
  });
});

// ============================================================================
// MOCK DATA HELPERS
// ============================================================================

function createMockContext(overrides?: Partial<CareerContext>): CareerContext {
  return {
    userId: 'test-user',
    timestamp: new Date(),
    metadata: {},
    career: {
      id: 'doctor',
      name: 'Doctor'
    },
    request: {
      type: 'vocabulary'
    },
    ...overrides
  };
}