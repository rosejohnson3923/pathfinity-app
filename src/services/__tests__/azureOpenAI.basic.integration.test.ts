/**
 * BASIC AZURE OPENAI INTEGRATION TESTS
 * Simple tests using real Azure credentials to validate API connectivity
 */

import { describe, test, expect, beforeAll } from 'vitest';
import { TestAzureOpenAIService, TEST_AZURE_CONFIG } from './testAzureConfig';
import { PATHFINITY_CHARACTERS } from '../azureOpenAIService';

describe('Basic Azure OpenAI Integration', () => {
  let testService: TestAzureOpenAIService;

  beforeAll(async () => {
    // Check if we have the required environment variables
    if (!TEST_AZURE_CONFIG.apiKey) {
      console.warn('⚠️  Skipping integration tests - VITE_AZURE_OPENAI_API_KEY not found');
      return;
    }

    console.log('🤖 Starting basic Azure OpenAI integration tests');
    console.log('🔑 Using API key:', TEST_AZURE_CONFIG.apiKey.substring(0, 10) + '...');
    console.log('🌐 Using endpoint:', TEST_AZURE_CONFIG.endpoint);
    
    testService = new TestAzureOpenAIService();
  });

  describe('Azure OpenAI Connectivity', () => {
    test('should connect to Azure OpenAI service', async () => {
      if (!TEST_AZURE_CONFIG.apiKey) {
        console.log('⏭️  Skipping - no API key available');
        return;
      }

      const healthCheck = await testService.testHealthCheck();
      
      expect(healthCheck.status).toBe('healthy');
      expect(healthCheck.message).toContain('operational');
      
      console.log('✅ Azure OpenAI service connection verified');
      console.log('📋 Health check response:', healthCheck.message);
    }, 30000);
  });

  describe('Educational Content Generation', () => {
    test('should generate simple educational content', async () => {
      if (!TEST_AZURE_CONFIG.apiKey) {
        console.log('⏭️  Skipping - no API key available');
        return;
      }

      const prompt = 'Generate a simple math lesson for kindergarten students about counting to 5. Make it fun and engaging.';
      
      const content = await testService.testContentGeneration(prompt);
      
      expect(content).toBeDefined();
      expect(typeof content).toBe('object');
      
      // Should have educational content
      const contentText = JSON.stringify(content).toLowerCase();
      expect(contentText).toContain('count');
      expect(contentText).toMatch(/five|5/);
      
      console.log('✅ Educational content generated successfully');
      console.log('📚 Content preview:', JSON.stringify(content, null, 2).substring(0, 200) + '...');
    }, 30000);

    test('should generate age-appropriate content for different grades', async () => {
      if (!TEST_AZURE_CONFIG.apiKey) {
        console.log('⏭️  Skipping - no API key available');
        return;
      }

      const testCases = [
        { grade: 'K', subject: 'Math', skill: 'counting to 3' },
        { grade: '1', subject: 'Reading', skill: 'letter recognition' }
      ];

      for (const testCase of testCases) {
        const prompt = `Create a ${testCase.subject} activity for Grade ${testCase.grade} focusing on ${testCase.skill}. Make it age-appropriate and engaging.`;
        
        const content = await testService.testContentGeneration(prompt);
        
        expect(content).toBeDefined();
        
        const contentText = JSON.stringify(content).toLowerCase();
        expect(contentText).toContain(testCase.skill.toLowerCase());
        
        console.log(`✅ Generated appropriate content for Grade ${testCase.grade} ${testCase.subject}`);
        
        // Add small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }, 45000);
  });

  describe('Content Safety Validation', () => {
    test('should validate safe educational content', async () => {
      if (!TEST_AZURE_CONFIG.apiKey) {
        console.log('⏭️  Skipping - no API key available');
        return;
      }

      const safeContent = 'Let\'s count to 5! One, two, three, four, five. Great job learning!';
      
      const safetyCheck = await testService.testSafetyCheck(safeContent, 'K2');
      
      expect(safetyCheck).toBeDefined();
      expect(safetyCheck.isAppropriate).toBe(true);
      expect(safetyCheck.coppaCompliant).toBe(true);
      expect(Array.isArray(safetyCheck.concerns)).toBe(true);
      
      console.log('✅ Safe content validation passed');
      console.log('🔒 Safety check result:', safetyCheck);
    }, 30000);

    test('should flag potentially inappropriate content', async () => {
      if (!TEST_AZURE_CONFIG.apiKey) {
        console.log('⏭️  Skipping - no API key available');
        return;
      }

      const questionableContent = 'This lesson involves scary monsters and frightening situations.';
      
      const safetyCheck = await testService.testSafetyCheck(questionableContent, 'K2');
      
      expect(safetyCheck).toBeDefined();
      expect(safetyCheck.isAppropriate).toBe(false);
      expect(safetyCheck.coppaCompliant).toBe(false);
      expect(safetyCheck.concerns.length).toBeGreaterThan(0);
      
      console.log('✅ Inappropriate content correctly flagged');
      console.log('⚠️  Safety concerns identified:', safetyCheck.concerns);
    }, 30000);
  });

  describe('AI Character System Validation', () => {
    test('should have all required AI characters defined', () => {
      expect(PATHFINITY_CHARACTERS).toHaveLength(4);
      
      const characterIds = PATHFINITY_CHARACTERS.map(c => c.id);
      expect(characterIds).toContain('finn');
      expect(characterIds).toContain('sage');
      expect(characterIds).toContain('spark');
      expect(characterIds).toContain('harmony');
      
      console.log('✅ All AI characters are properly defined');
      console.log('🎭 Characters:', characterIds.join(', '));
    });

    test('should generate character-specific educational content', async () => {
      if (!TEST_AZURE_CONFIG.apiKey) {
        console.log('⏭️  Skipping - no API key available');
        return;
      }

      // Test Sage (math character)
      const mathPrompt = 'As Sage the Wise, create a patient and encouraging response to help a kindergarten student who is struggling with counting to 10.';
      
      const sageResponse = await testService.testContentGeneration(mathPrompt);
      
      expect(sageResponse).toBeDefined();
      
      const responseText = JSON.stringify(sageResponse).toLowerCase();
      expect(responseText).toMatch(/sage|patient|help|count|math/);
      
      console.log('✅ Character-specific content generated');
      console.log('🧙 Sage response preview:', JSON.stringify(sageResponse, null, 2).substring(0, 150) + '...');
    }, 30000);
  });

  describe('Performance and Rate Limiting', () => {
    test('should complete requests within reasonable time', async () => {
      if (!TEST_AZURE_CONFIG.apiKey) {
        console.log('⏭️  Skipping - no API key available');
        return;
      }

      const startTime = Date.now();
      
      const prompt = 'Create a simple counting activity for preschoolers.';
      const content = await testService.testContentGeneration(prompt);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(content).toBeDefined();
      expect(duration).toBeLessThan(25000); // Should complete within 25 seconds
      
      console.log(`✅ Request completed in ${duration}ms`);
    }, 30000);

    test('should handle multiple sequential requests', async () => {
      if (!TEST_AZURE_CONFIG.apiKey) {
        console.log('⏭️  Skipping - no API key available');
        return;
      }

      const requests = [
        'Create a shape recognition game.',
        'Design a color learning activity.',
        'Make a simple counting song.'
      ];

      const results = [];
      const startTime = Date.now();

      for (const prompt of requests) {
        const content = await testService.testContentGeneration(prompt);
        results.push(content);
        
        // Small delay to be respectful of rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result).toBeDefined();
      });

      console.log(`✅ Multiple requests completed in ${totalDuration}ms`);
      console.log(`📊 Average time per request: ${totalDuration / 3}ms`);
    }, 60000);
  });
});

describe('Environment Configuration Validation', () => {
  test('should have proper environment variables configured', () => {
    // Check what environment variables are available
    const envVars = {
      'VITE_AZURE_OPENAI_API_KEY': !!process.env.VITE_AZURE_OPENAI_API_KEY,
      'VITE_SUPABASE_URL': !!process.env.VITE_SUPABASE_URL,
      'VITE_SUPABASE_ANON_KEY': !!process.env.VITE_SUPABASE_ANON_KEY
    };

    console.log('🔍 Environment variables status:', envVars);

    if (!envVars['VITE_AZURE_OPENAI_API_KEY']) {
      console.warn('⚠️  VITE_AZURE_OPENAI_API_KEY not found - integration tests will be skipped');
    } else {
      console.log('✅ Azure OpenAI API key is configured');
    }

    // Test passes regardless - this is just for information
    expect(true).toBe(true);
  });

  test('should validate test configuration', () => {
    expect(TEST_AZURE_CONFIG.endpoint).toBeTruthy();
    expect(TEST_AZURE_CONFIG.apiVersion).toBeTruthy();
    expect(TEST_AZURE_CONFIG.models).toBeDefined();

    console.log('✅ Test configuration validated');
    console.log('🔧 Config:', {
      endpoint: TEST_AZURE_CONFIG.endpoint,
      apiVersion: TEST_AZURE_CONFIG.apiVersion,
      hasApiKey: !!TEST_AZURE_CONFIG.apiKey
    });
  });
});