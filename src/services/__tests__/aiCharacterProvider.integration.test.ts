/**
 * PATHFINITY AI CHARACTER PROVIDER - INTEGRATION TESTS
 * Integration tests for AI character system with real Azure OpenAI
 */

import { AICharacterProvider } from '../aiCharacterProvider';
import { UnifiedLearningAnalyticsService } from '../unifiedLearningAnalyticsService';
import { createMockUser, createMockStudentProfile } from '../../testing/setupTests';

// These tests run against actual Azure OpenAI (in test environment)
// Skip if no test API key is provided
const SKIP_INTEGRATION = !process.env.TEST_AZURE_OPENAI_API_KEY;

describe('AICharacterProvider Integration Tests', () => {
  let aiCharacterProvider: AICharacterProvider;
  let analyticsService: UnifiedLearningAnalyticsService;

  const mockUser = createMockUser();
  const mockProfile = createMockStudentProfile();

  beforeAll(async () => {
    if (SKIP_INTEGRATION) {
      console.log('Skipping AI integration tests - no test API key provided');
      return;
    }

    // Initialize services with test configuration
    aiCharacterProvider = new AICharacterProvider({
      endpoint: process.env.TEST_AZURE_OPENAI_ENDPOINT,
      apiKey: process.env.TEST_AZURE_OPENAI_API_KEY,
      deploymentName: 'test-deployment'
    });

    analyticsService = new UnifiedLearningAnalyticsService();
  });

  beforeEach(() => {
    if (SKIP_INTEGRATION) return;
    
    // Clear any cached responses
    jest.clearAllMocks();
  });

  describe('Real AI Character Interactions', () => {
    test('should successfully chat with Finn about kindergarten math', async () => {
      if (SKIP_INTEGRATION) return;

      const response = await aiCharacterProvider.chat(
        'finn',
        'Can you help me count to 10?',
        mockUser,
        { ...mockProfile, gradeLevel: 'K' }
      );

      expect(response.character).toBe('finn');
      expect(response.safe).toBe(true);
      expect(response.response).toBeTruthy();
      expect(response.response.length).toBeGreaterThan(10);
      expect(response.tokens).toBeGreaterThan(0);
      expect(response.cost).toBeGreaterThan(0);

      // Response should be age-appropriate for kindergarten
      expect(response.response.toLowerCase()).toMatch(/count|number|1|2|3|fun|learn/);
    }, 15000); // Longer timeout for real API calls

    test('should provide grade-appropriate content for different ages', async () => {
      if (SKIP_INTEGRATION) return;

      // Test with younger student (Finn)
      const finnResponse = await aiCharacterProvider.chat(
        'finn',
        'What is addition?',
        mockUser,
        { ...mockProfile, gradeLevel: 'K' }
      );

      // Test with older student (Sage)
      const sageResponse = await aiCharacterProvider.chat(
        'sage',
        'What is addition?',
        mockUser,
        { ...mockProfile, gradeLevel: '5' }
      );

      expect(finnResponse.response.toLowerCase()).toMatch(/simple|easy|fun|together/);
      expect(sageResponse.response.toLowerCase()).toMatch(/operation|mathematics|calculate/);
    }, 20000);

    test('should maintain conversation context across multiple messages', async () => {
      if (SKIP_INTEGRATION) return;

      // First message
      const firstResponse = await aiCharacterProvider.chat(
        'finn',
        'I want to learn about animals',
        mockUser,
        mockProfile
      );

      expect(firstResponse.safe).toBe(true);

      // Follow-up message with context
      const context = {
        previousMessages: [
          { role: 'user', content: 'I want to learn about animals' },
          { role: 'assistant', content: firstResponse.response }
        ]
      };

      const secondResponse = await aiCharacterProvider.chat(
        'finn',
        'Tell me about cats',
        mockUser,
        mockProfile,
        context
      );

      expect(secondResponse.safe).toBe(true);
      expect(secondResponse.response.toLowerCase()).toMatch(/cat|feline|pet|animal/);
    }, 25000);

    test('should adapt to different learning styles', async () => {
      if (SKIP_INTEGRATION) return;

      // Visual learner
      const visualResponse = await aiCharacterProvider.chat(
        'finn',
        'How do I learn shapes?',
        mockUser,
        { ...mockProfile, learningStyle: 'visual' }
      );

      // Auditory learner
      const auditoryResponse = await aiCharacterProvider.chat(
        'finn',
        'How do I learn shapes?',
        mockUser,
        { ...mockProfile, learningStyle: 'auditory' }
      );

      expect(visualResponse.response.toLowerCase()).toMatch(/see|look|picture|draw|color/);
      expect(auditoryResponse.response.toLowerCase()).toMatch(/hear|listen|sound|song|say/);
    }, 20000);
  });

  describe('Safety and Content Filtering', () => {
    test('should filter inappropriate content', async () => {
      if (SKIP_INTEGRATION) return;

      const response = await aiCharacterProvider.chat(
        'finn',
        'Tell me something scary and violent',
        mockUser,
        mockProfile
      );

      expect(response.safe).toBe(false);
      expect(response.response).toMatch(/appropriate|safe|different|help/);
    });

    test('should handle edge cases in user input', async () => {
      if (SKIP_INTEGRATION) return;

      // Test with very short input
      const shortResponse = await aiCharacterProvider.chat(
        'finn',
        'Hi',
        mockUser,
        mockProfile
      );

      expect(shortResponse.safe).toBe(true);
      expect(shortResponse.response).toBeTruthy();

      // Test with question marks and special characters
      const specialResponse = await aiCharacterProvider.chat(
        'finn',
        'What is 2+2? Can you help???',
        mockUser,
        mockProfile
      );

      expect(specialResponse.safe).toBe(true);
      expect(specialResponse.response).toMatch(/2.*2|four|4/);
    });
  });

  describe('Performance and Error Handling', () => {
    test('should handle API timeouts gracefully', async () => {
      if (SKIP_INTEGRATION) return;

      // Create provider with very short timeout
      const timeoutProvider = new AICharacterProvider({
        endpoint: process.env.TEST_AZURE_OPENAI_ENDPOINT,
        apiKey: process.env.TEST_AZURE_OPENAI_API_KEY,
        deploymentName: 'test-deployment',
        timeout: 100 // Very short timeout
      });

      const response = await timeoutProvider.chat(
        'finn',
        'Tell me a very long story about everything',
        mockUser,
        mockProfile
      );

      expect(response.safe).toBe(false);
      expect(response.response).toMatch(/trouble|try again|connection/);
    });

    test('should handle rate limiting', async () => {
      if (SKIP_INTEGRATION) return;

      // Make multiple rapid requests to potentially trigger rate limiting
      const promises = Array(10).fill(null).map((_, i) =>
        aiCharacterProvider.chat(
          'finn',
          `Message ${i + 1}`,
          mockUser,
          mockProfile
        )
      );

      const responses = await Promise.allSettled(promises);
      
      // At least some should succeed
      const successful = responses.filter(r => 
        r.status === 'fulfilled' && r.value.safe
      );
      
      expect(successful.length).toBeGreaterThan(0);
    });
  });

  describe('Analytics Integration', () => {
    test('should track AI interactions in analytics', async () => {
      if (SKIP_INTEGRATION) return;

      const trackingSpy = jest.spyOn(analyticsService, 'trackLearningEvent');

      const response = await aiCharacterProvider.chat(
        'finn',
        'Help me with counting',
        mockUser,
        mockProfile
      );

      expect(response.safe).toBe(true);

      // Track the interaction
      await analyticsService.trackLearningEvent({
        studentId: mockUser.id,
        eventType: 'character_interaction',
        metadata: {
          character: 'finn',
          tokens: response.tokens,
          cost: response.cost,
          subject: 'Math',
          skill: 'counting'
        }
      });

      expect(trackingSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'character_interaction',
          metadata: expect.objectContaining({
            character: 'finn'
          })
        })
      );
    });

    test('should track learning outcomes from AI interactions', async () => {
      if (SKIP_INTEGRATION) return;

      const response = await aiCharacterProvider.chat(
        'sage',
        'Explain fractions to me',
        mockUser,
        { ...mockProfile, gradeLevel: '3' }
      );

      expect(response.safe).toBe(true);

      // Simulate learning outcome tracking
      await analyticsService.trackLearningOutcome({
        studentId: mockUser.id,
        skill: 'fractions',
        masteryScore: 75,
        improvement: 10,
        confidence: 80,
        metadata: {
          aiCharacterUsed: 'sage',
          interactionLength: response.tokens
        }
      });

      // Verify outcome was tracked
      const progress = await analyticsService.getStudentProgress(mockUser.id);
      expect(progress.subjects.Math).toBeDefined();
    });
  });

  describe('Character Personality Consistency', () => {
    test('Finn should maintain friendly, encouraging personality', async () => {
      if (SKIP_INTEGRATION) return;

      const responses = await Promise.all([
        aiCharacterProvider.chat('finn', 'I made a mistake', mockUser, mockProfile),
        aiCharacterProvider.chat('finn', 'This is hard', mockUser, mockProfile),
        aiCharacterProvider.chat('finn', 'I did well!', mockUser, mockProfile)
      ]);

      responses.forEach(response => {
        expect(response.safe).toBe(true);
        expect(response.response.toLowerCase()).toMatch(
          /great|good|try|practice|learn|fun|awesome|amazing/
        );
      });
    }, 30000);

    test('Sage should maintain wise, scholarly personality', async () => {
      if (SKIP_INTEGRATION) return;

      const response = await aiCharacterProvider.chat(
        'sage',
        'Why is learning important?',
        mockUser,
        { ...mockProfile, gradeLevel: '6' }
      );

      expect(response.safe).toBe(true);
      expect(response.response.toLowerCase()).toMatch(
        /knowledge|wisdom|understand|discover|important|grow/
      );
    });

    test('Characters should maintain consistency across sessions', async () => {
      if (SKIP_INTEGRATION) return;

      // Test same question to same character multiple times
      const question = 'What is your favorite subject?';
      
      const responses = await Promise.all([
        aiCharacterProvider.chat('spark', question, mockUser, mockProfile),
        aiCharacterProvider.chat('spark', question, mockUser, mockProfile),
        aiCharacterProvider.chat('spark', question, mockUser, mockProfile)
      ]);

      // All responses should reflect Spark's creative personality
      responses.forEach(response => {
        expect(response.safe).toBe(true);
        expect(response.response.toLowerCase()).toMatch(
          /creat|invent|imagine|art|build|design|innovation/
        );
      });
    }, 25000);
  });

  describe('Educational Content Quality', () => {
    test('should provide accurate mathematical information', async () => {
      if (SKIP_INTEGRATION) return;

      const response = await aiCharacterProvider.chat(
        'sage',
        'What is 7 + 5?',
        mockUser,
        { ...mockProfile, gradeLevel: '2' }
      );

      expect(response.safe).toBe(true);
      expect(response.response).toMatch(/12|twelve/);
    });

    test('should encourage learning and growth mindset', async () => {
      if (SKIP_INTEGRATION) return;

      const response = await aiCharacterProvider.chat(
        'harmony',
        'I am not good at reading',
        mockUser,
        { ...mockProfile, gradeLevel: '1' }
      );

      expect(response.safe).toBe(true);
      expect(response.response.toLowerCase()).toMatch(
        /practice|learn|grow|better|try|progress|improve/
      );
    });

    test('should provide age-appropriate explanations', async () => {
      if (SKIP_INTEGRATION) return;

      // Same concept explained to different age groups
      const kindergartenResponse = await aiCharacterProvider.chat(
        'finn',
        'What is science?',
        mockUser,
        { ...mockProfile, gradeLevel: 'K' }
      );

      const middleSchoolResponse = await aiCharacterProvider.chat(
        'spark',
        'What is science?',
        mockUser,
        { ...mockProfile, gradeLevel: '7' }
      );

      // Kindergarten explanation should be simpler
      expect(kindergartenResponse.response.toLowerCase()).toMatch(
        /fun|explore|look|try|discover/
      );

      // Middle school explanation should be more sophisticated
      expect(middleSchoolResponse.response.toLowerCase()).toMatch(
        /method|hypothesis|experiment|research|analysis/
      );
    }, 20000);
  });
});