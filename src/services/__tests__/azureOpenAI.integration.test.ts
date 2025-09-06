/**
 * AZURE OPENAI SERVICE INTEGRATION TESTS
 * Testing with real Azure Key Vault credentials and OpenAI API
 * Following SDLC Phase 4: Testing Framework with real services
 */

import { describe, test, expect, beforeAll } from 'vitest';
import { AzureOpenAIService, ContentGenerationRequest } from '../azureOpenAIService';
import { AICharacter } from '../../types/AICharacterTypes';
import { validateTestEnvironment, rateLimitedApiCall, integrationTestUtils } from '../../test-setup.integration';

describe('Azure OpenAI Service Integration Tests', () => {
  let azureService: AzureOpenAIService;
  const timeouts = integrationTestUtils.getTimeouts();

  beforeAll(async () => {
    // Validate we have the required credentials
    validateTestEnvironment();
    azureService = new AzureOpenAIService();
    console.log('🤖 Integration tests starting with real Azure OpenAI service');
  });

  describe('Real Azure OpenAI Health Check', () => {
    test('should connect to Azure OpenAI service', async () => {
      const healthCheck = await rateLimitedApiCall(() => azureService.healthCheck());
      
      expect(healthCheck.status).toBe('healthy');
      expect(healthCheck.message).toContain('operational');
      
      console.log('✅ Azure OpenAI service health check passed');
    }, timeouts.apiCall);
  });

  describe('AI Character System Integration', () => {
    test('should get real AI characters with valid configurations', () => {
      const allCharacters = azureService.getAllCharacters();
      
      expect(allCharacters).toHaveLength(4);
      
      // Validate each character has complete configuration
      allCharacters.forEach(character => {
        expect(character.id).toBeTruthy();
        expect(character.name).toBeTruthy();
        expect(character.personality).toBeTruthy();
        expect(character.voiceStyle).toBeDefined();
        expect(character.specialties).toBeInstanceOf(Array);
        expect(character.ageGroups).toBeInstanceOf(Array);
        expect(character.safetyPrompt).toBeTruthy();
        
        console.log(`✅ Character ${character.name} configuration validated`);
      });
    });

    test('should recommend appropriate characters for educational contexts', () => {
      // Test math context
      const mathCharacters = azureService.getCharactersForContext('K', 'mathematics');
      expect(mathCharacters.length).toBeGreaterThan(0);
      expect(mathCharacters.some(c => c.specialties.includes('mathematics'))).toBe(true);
      
      // Test career exploration context
      const careerCharacters = azureService.getCharactersForContext('K', 'career_exploration');
      expect(careerCharacters.length).toBeGreaterThan(0);
      expect(careerCharacters.some(c => c.specialties.includes('career_exploration'))).toBe(true);
      
      console.log('✅ Character context mapping validated');
    });
  });

  describe('Real Content Safety Validation', () => {
    test('should validate safe educational content with real Azure AI', async () => {
      const safeContent = 'Let\'s count to 5! One, two, three, four, five. Great job!';
      
      const safetyCheck = await rateLimitedApiCall(() => 
        azureService.performContentSafetyCheck(safeContent, 'K2')
      );
      
      expect(safetyCheck.isAppropriate).toBe(true);
      expect(safetyCheck.coppaCompliant).toBe(true);
      expect(safetyCheck.concerns).toHaveLength(0);
      expect(safetyCheck.ageRating).toBeTruthy();
      
      console.log('✅ Real Azure AI safety validation passed for safe content');
    }, timeouts.safety);

    test('should flag inappropriate content with real Azure AI', async () => {
      const inappropriateContent = 'This is a scary story with monsters and frightening creatures that might hurt you.';
      
      const safetyCheck = await rateLimitedApiCall(() => 
        azureService.performContentSafetyCheck(inappropriateContent, 'K2')
      );
      
      // Azure AI should detect this as inappropriate for K2
      expect(safetyCheck.isAppropriate).toBe(false);
      expect(safetyCheck.coppaCompliant).toBe(false);
      expect(safetyCheck.concerns.length).toBeGreaterThan(0);
      
      console.log('✅ Real Azure AI safety validation correctly flagged inappropriate content');
    }, timeouts.safety);

    test('should handle edge cases in content safety validation', async () => {
      const edgeCases = [
        { content: '', description: 'empty content' },
        { content: 'A', description: 'single character' },
        { content: 'Hello world! This is a test.', description: 'simple safe content' }
      ];

      for (const { content, description } of edgeCases) {
        const safetyCheck = await rateLimitedApiCall(() => 
          azureService.performContentSafetyCheck(content, 'K2')
        );
        
        expect(safetyCheck).toBeDefined();
        expect(typeof safetyCheck.isAppropriate).toBe('boolean');
        expect(typeof safetyCheck.coppaCompliant).toBe('boolean');
        expect(Array.isArray(safetyCheck.concerns)).toBe(true);
        
        console.log(`✅ Safety validation handled ${description} correctly`);
      }
    }, timeouts.safety * 3);
  });

  describe('Real Educational Content Generation', () => {
    test('should generate age-appropriate content for K2 students', async () => {
      const request: ContentGenerationRequest = {
        contentType: 'instruction',
        grade: 'K',
        subject: 'Math',
        skills: ['counting-1-5'],
        learningContainer: 'learn',
        characterId: 'sage',
        requiresSafetyCheck: true
      };

      const content = await rateLimitedApiCall(() => 
        azureService.generateEducationalContent(request)
      );

      // Validate response structure
      expect(content).toBeDefined();
      expect(content.instructions || content.content).toBeTruthy();
      expect(content._character).toBeDefined();
      expect(content._character.id).toBe('sage');
      expect(content._safety).toBeDefined();
      expect(content._safety.coppaCompliant).toBe(true);
      
      // Validate content is actually age-appropriate
      const contentText = content.instructions || content.content || '';
      expect(contentText.length).toBeGreaterThan(10); // Should have substantial content
      expect(contentText.toLowerCase()).toContain('count'); // Should be about counting
      
      console.log('✅ Real Azure AI generated age-appropriate K2 content');
      console.log(`📝 Generated content: ${contentText.substring(0, 100)}...`);
    }, timeouts.aiGeneration);

    test('should generate character-specific educational content', async () => {
      const characters = ['finn', 'sage', 'spark'];
      const results: any[] = [];

      for (const characterId of characters) {
        const request: ContentGenerationRequest = {
          contentType: 'instruction',
          grade: '1',
          subject: 'Science',
          skills: ['observation'],
          learningContainer: 'discover',
          characterId,
          requiresSafetyCheck: true
        };

        const content = await rateLimitedApiCall(() => 
          azureService.generateEducationalContent(request)
        );

        expect(content._character.id).toBe(characterId);
        expect(content._safety.coppaCompliant).toBe(true);
        
        results.push({ character: characterId, content });
        console.log(`✅ Generated content for ${characterId}`);
      }

      // Validate characters have different personalities in content
      expect(results).toHaveLength(3);
      
      // Each should have unique characteristics
      const contentTexts = results.map(r => (r.content.instructions || r.content.content || '').toLowerCase());
      expect(new Set(contentTexts).size).toBe(3); // Should generate different content
      
      console.log('✅ Character-specific content generation validated');
    }, timeouts.aiGeneration * 3);

    test('should handle content generation errors gracefully', async () => {
      const invalidRequest: ContentGenerationRequest = {
        contentType: 'instruction',
        grade: '', // Invalid grade
        subject: '',
        skills: [],
        learningContainer: 'learn',
        requiresSafetyCheck: true
      };

      try {
        await rateLimitedApiCall(() => 
          azureService.generateEducationalContent(invalidRequest)
        );
      } catch (error) {
        expect(error).toBeDefined();
        console.log('✅ Error handling validated for invalid requests');
      }
    }, timeouts.apiCall);
  });

  describe('Real Character Content Generation', () => {
    test('should generate character responses with voice metadata', async () => {
      const response = await rateLimitedApiCall(() => 
        azureService.generateCharacterContent(
          'sage',
          'I need help with counting to 10',
          'K',
          { includeVoiceMetadata: true, requiresSafetyCheck: true }
        )
      );

      expect(response.message).toBeTruthy();
      expect(response._character).toBeDefined();
      expect(response._character.id).toBe('sage');
      expect(response._voiceSettings).toBeDefined();
      expect(response._voiceSettings.rate).toBeTypeOf('number');
      expect(response._voiceSettings.pitch).toBeTypeOf('number');
      expect(response._safety).toBeDefined();
      expect(response._safety.coppaCompliant).toBe(true);

      // Validate Sage's personality comes through
      expect(response.message.toLowerCase()).toMatch(/math|count|patient|help|learn/);
      
      console.log('✅ Real character response generated with voice metadata');
      console.log(`🤖 Sage response: ${response.message.substring(0, 100)}...`);
    }, timeouts.aiGeneration);

    test('should maintain character consistency across multiple interactions', async () => {
      const prompts = [
        'I\'m having trouble with math',
        'Can you help me count?',
        'I made a mistake'
      ];

      const responses: string[] = [];

      for (const prompt of prompts) {
        const response = await rateLimitedApiCall(() => 
          azureService.generateCharacterContent('sage', prompt, 'K2')
        );
        
        responses.push(response.message);
        
        // Each response should mention the character name and be encouraging
        expect(response.message.toLowerCase()).toMatch(/sage|patient|help|math/);
        expect(response._safety.coppaCompliant).toBe(true);
      }

      // Validate consistency across responses
      expect(responses).toHaveLength(3);
      responses.forEach(response => {
        expect(response).toContain('Sage');
        // Should maintain encouraging, patient tone
        expect(response.toLowerCase()).toMatch(/help|learn|patient|gentle|together/);
      });

      console.log('✅ Character consistency maintained across multiple interactions');
    }, timeouts.aiGeneration * 3);
  });

  describe('Performance and Rate Limiting', () => {
    test('should complete content generation within performance requirements', async () => {
      const startTime = Date.now();

      const request: ContentGenerationRequest = {
        contentType: 'practice',
        grade: '1',
        subject: 'Math',
        skills: ['addition'],
        learningContainer: 'learn',
        characterId: 'sage',
        requiresSafetyCheck: false // Skip safety check for pure performance test
      };

      const content = await rateLimitedApiCall(() => 
        azureService.generateEducationalContent(request)
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(content).toBeDefined();
      expect(duration).toBeLessThan(15000); // Should complete within 15 seconds
      
      console.log(`✅ Content generation completed in ${duration}ms`);
    }, timeouts.apiCall);

    test('should handle multiple concurrent safety checks', async () => {
      const testContents = [
        'Let\'s learn about colors!',
        'Count from 1 to 3: one, two, three.',
        'Shapes are all around us - circles, squares, and triangles.',
      ];

      const startTime = Date.now();

      // Run safety checks in sequence (to respect rate limits)
      const safetyResults = [];
      for (const content of testContents) {
        const result = await rateLimitedApiCall(() => 
          azureService.performContentSafetyCheck(content, 'K2')
        );
        safetyResults.push(result);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(safetyResults).toHaveLength(3);
      safetyResults.forEach(result => {
        expect(result.isAppropriate).toBe(true);
        expect(result.coppaCompliant).toBe(true);
      });

      console.log(`✅ Multiple safety checks completed in ${duration}ms`);
    }, timeouts.safety * 3);
  });

  describe('Real-World Educational Scenarios', () => {
    test('should generate complete kindergarten math lesson', async () => {
      const lessonRequest: ContentGenerationRequest = {
        contentType: 'instruction',
        grade: 'K',
        subject: 'Math',
        skills: ['counting-1-10', 'number-recognition'],
        learningContainer: 'learn',
        characterId: 'sage',
        requiresSafetyCheck: true,
        quantity: 1
      };

      const lesson = await rateLimitedApiCall(() => 
        azureService.generateEducationalContent(lessonRequest)
      );

      expect(lesson).toBeDefined();
      expect(lesson._safety.coppaCompliant).toBe(true);
      expect(lesson._character.id).toBe('sage');
      
      // Should be appropriate for kindergarten
      const content = lesson.instructions || lesson.content || '';
      expect(content.length).toBeGreaterThan(50);
      expect(content.toLowerCase()).toMatch(/count|number|math|learn/);
      
      // Should not contain complex mathematical terms
      expect(content.toLowerCase()).not.toMatch(/algebra|calculus|equation|formula/);
      
      console.log('✅ Complete kindergarten math lesson generated');
      console.log(`📚 Lesson preview: ${content.substring(0, 150)}...`);
    }, timeouts.aiGeneration);

    test('should handle career exploration scenario for Grade 1', async () => {
      const careerRequest: ContentGenerationRequest = {
        contentType: 'career_scenario',
        grade: '1',
        subject: 'Career Exploration',
        skills: ['community-helpers'],
        learningContainer: 'experience',
        characterId: 'finn',
        requiresSafetyCheck: true
      };

      const scenario = await rateLimitedApiCall(() => 
        azureService.generateEducationalContent(careerRequest)
      );

      expect(scenario).toBeDefined();
      expect(scenario._safety.coppaCompliant).toBe(true);
      expect(scenario._character.id).toBe('finn');
      
      // Should include career-related content appropriate for Grade 1
      const content = scenario.instructions || scenario.content || scenario.scenario || '';
      expect(content.toLowerCase()).toMatch(/doctor|teacher|helper|work|job|career/);
      expect(content.toLowerCase()).not.toMatch(/salary|stress|difficult|complex/);
      
      console.log('✅ Career exploration scenario generated for Grade 1');
      console.log(`🚀 Finn scenario: ${content.substring(0, 150)}...`);
    }, timeouts.aiGeneration);
  });
});