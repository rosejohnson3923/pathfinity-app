/**
 * PATHFINITY AI CHARACTER PROVIDER - UNIT TESTS
 * Comprehensive test suite for AI character system
 */

import { AICharacterProvider } from '../aiCharacterProvider';
import { AzureOpenAIService } from '../azureOpenAIService';
import { createMockUser, createMockStudentProfile } from '../../testing/setupTests';

// Mock the Azure OpenAI service
jest.mock('../azureOpenAIService');

describe('AICharacterProvider', () => {
  let aiCharacterProvider: AICharacterProvider;
  let mockAzureOpenAI: jest.Mocked<AzureOpenAIService>;

  const mockUser = createMockUser();
  const mockProfile = createMockStudentProfile();

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock Azure OpenAI service
    mockAzureOpenAI = {
      generateResponse: jest.fn(),
      validateSafety: jest.fn(),
      getTokenCount: jest.fn(),
      calculateCost: jest.fn()
    } as any;

    // Mock the constructor
    (AzureOpenAIService as jest.Mock).mockImplementation(() => mockAzureOpenAI);

    // Create provider instance
    aiCharacterProvider = new AICharacterProvider();
  });

  describe('Character Initialization', () => {
    test('should initialize with all four characters', () => {
      const characters = aiCharacterProvider.getAvailableCharacters();
      
      expect(characters).toHaveLength(4);
      expect(characters.map(c => c.id)).toEqual(['finn', 'sage', 'spark', 'harmony']);
    });

    test('should set correct age ranges for each character', () => {
      const characters = aiCharacterProvider.getAvailableCharacters();
      
      const finn = characters.find(c => c.id === 'finn');
      const sage = characters.find(c => c.id === 'sage');
      const spark = characters.find(c => c.id === 'spark');
      const harmony = characters.find(c => c.id === 'harmony');

      expect(finn?.ageRange).toEqual({ min: 4, max: 8 });
      expect(sage?.ageRange).toEqual({ min: 9, max: 12 });
      expect(spark?.ageRange).toEqual({ min: 13, max: 15 });
      expect(harmony?.ageRange).toEqual({ min: 16, max: 18 });
    });

    test('should have correct personality traits for each character', () => {
      const characters = aiCharacterProvider.getAvailableCharacters();
      
      const finn = characters.find(c => c.id === 'finn');
      expect(finn?.personality).toContain('friendly');
      expect(finn?.personality).toContain('encouraging');
      expect(finn?.personality).toContain('playful');
    });
  });

  describe('Character Selection', () => {
    test('should recommend Finn for kindergarten students', () => {
      const recommended = aiCharacterProvider.getRecommendedCharacter('K');
      expect(recommended.id).toBe('finn');
    });

    test('should recommend Sage for 5th grade students', () => {
      const recommended = aiCharacterProvider.getRecommendedCharacter('5');
      expect(recommended.id).toBe('sage');
    });

    test('should recommend Spark for 8th grade students', () => {
      const recommended = aiCharacterProvider.getRecommendedCharacter('8');
      expect(recommended.id).toBe('spark');
    });

    test('should recommend Harmony for 11th grade students', () => {
      const recommended = aiCharacterProvider.getRecommendedCharacter('11');
      expect(recommended.id).toBe('harmony');
    });

    test('should handle invalid grade levels gracefully', () => {
      const recommended = aiCharacterProvider.getRecommendedCharacter('invalid');
      expect(['finn', 'sage', 'spark', 'harmony']).toContain(recommended.id);
    });
  });

  describe('Chat Interactions', () => {
    beforeEach(() => {
      mockAzureOpenAI.generateResponse.mockResolvedValue({
        content: 'Hello! How can I help you learn today?',
        tokens: 150,
        cost: 0.002
      });
      
      mockAzureOpenAI.validateSafety.mockResolvedValue({
        isSafe: true,
        categories: []
      });
    });

    test('should successfully process chat with Finn', async () => {
      const response = await aiCharacterProvider.chat(
        'finn',
        'Hello Finn!',
        mockUser,
        mockProfile
      );

      expect(response).toEqual({
        character: 'finn',
        response: 'Hello! How can I help you learn today?',
        timestamp: expect.any(Date),
        tokens: 150,
        cost: 0.002,
        safe: true
      });

      expect(mockAzureOpenAI.generateResponse).toHaveBeenCalledWith(
        expect.stringContaining('You are Finn'),
        'Hello Finn!',
        expect.objectContaining({
          temperature: 0.8,
          maxTokens: 150
        })
      );
    });

    test('should include student context in prompts', async () => {
      await aiCharacterProvider.chat(
        'finn',
        'Help me with math',
        mockUser,
        mockProfile
      );

      const [systemPrompt] = mockAzureOpenAI.generateResponse.mock.calls[0];
      
      expect(systemPrompt).toContain('Test Student');
      expect(systemPrompt).toContain('kindergarten');
      expect(systemPrompt).toContain('visual learning style');
    });

    test('should validate content safety before responding', async () => {
      await aiCharacterProvider.chat(
        'finn',
        'Tell me about safety',
        mockUser,
        mockProfile
      );

      expect(mockAzureOpenAI.validateSafety).toHaveBeenCalledWith('Tell me about safety');
    });

    test('should reject unsafe content', async () => {
      mockAzureOpenAI.validateSafety.mockResolvedValue({
        isSafe: false,
        categories: ['hate']
      });

      const response = await aiCharacterProvider.chat(
        'finn',
        'inappropriate content',
        mockUser,
        mockProfile
      );

      expect(response.safe).toBe(false);
      expect(response.response).toContain('appropriate');
      expect(mockAzureOpenAI.generateResponse).not.toHaveBeenCalled();
    });

    test('should handle Azure OpenAI service errors gracefully', async () => {
      mockAzureOpenAI.generateResponse.mockRejectedValue(new Error('Service unavailable'));

      const response = await aiCharacterProvider.chat(
        'finn',
        'Hello',
        mockUser,
        mockProfile
      );

      expect(response.safe).toBe(false);
      expect(response.response).toContain('having trouble');
    });

    test('should throw error for invalid character', async () => {
      await expect(
        aiCharacterProvider.chat(
          'invalid-character',
          'Hello',
          mockUser,
          mockProfile
        )
      ).rejects.toThrow('Character not found: invalid-character');
    });
  });

  describe('Age-Appropriate Content', () => {
    test('should use simple language for younger students (Finn)', async () => {
      await aiCharacterProvider.chat(
        'finn',
        'Explain fractions',
        mockUser,
        { ...mockProfile, gradeLevel: 'K' }
      );

      const [systemPrompt] = mockAzureOpenAI.generateResponse.mock.calls[0];
      expect(systemPrompt).toContain('simple words');
      expect(systemPrompt).toContain('age-appropriate');
    });

    test('should use more sophisticated language for older students (Harmony)', async () => {
      await aiCharacterProvider.chat(
        'harmony',
        'Explain calculus',
        mockUser,
        { ...mockProfile, gradeLevel: '11' }
      );

      const [systemPrompt] = mockAzureOpenAI.generateResponse.mock.calls[0];
      expect(systemPrompt).toContain('academic language');
      expect(systemPrompt).toContain('complex concepts');
    });
  });

  describe('Learning Style Adaptation', () => {
    test('should adapt content for visual learners', async () => {
      await aiCharacterProvider.chat(
        'finn',
        'How do I learn counting?',
        mockUser,
        { ...mockProfile, learningStyle: 'visual' }
      );

      const [systemPrompt] = mockAzureOpenAI.generateResponse.mock.calls[0];
      expect(systemPrompt).toContain('visual');
      expect(systemPrompt).toContain('pictures');
    });

    test('should adapt content for auditory learners', async () => {
      await aiCharacterProvider.chat(
        'sage',
        'Explain reading',
        mockUser,
        { ...mockProfile, learningStyle: 'auditory' }
      );

      const [systemPrompt] = mockAzureOpenAI.generateResponse.mock.calls[0];
      expect(systemPrompt).toContain('auditory');
      expect(systemPrompt).toContain('sounds');
    });

    test('should adapt content for kinesthetic learners', async () => {
      await aiCharacterProvider.chat(
        'spark',
        'How do I learn science?',
        mockUser,
        { ...mockProfile, learningStyle: 'kinesthetic' }
      );

      const [systemPrompt] = mockAzureOpenAI.generateResponse.mock.calls[0];
      expect(systemPrompt).toContain('kinesthetic');
      expect(systemPrompt).toContain('hands-on');
    });
  });

  describe('Conversation Context', () => {
    test('should maintain conversation context', async () => {
      const context = {
        previousMessages: [
          { role: 'user', content: 'What is 2+2?' },
          { role: 'assistant', content: '2+2 equals 4!' }
        ]
      };

      await aiCharacterProvider.chat(
        'finn',
        'Can you explain why?',
        mockUser,
        mockProfile,
        context
      );

      const [, userMessage, options] = mockAzureOpenAI.generateResponse.mock.calls[0];
      expect(options.context).toEqual(context);
    });

    test('should limit context history to prevent token overflow', async () => {
      const longContext = {
        previousMessages: Array(20).fill(null).map((_, i) => ({
          role: i % 2 === 0 ? 'user' : 'assistant',
          content: `Message ${i + 1}`
        }))
      };

      await aiCharacterProvider.chat(
        'finn',
        'New message',
        mockUser,
        mockProfile,
        longContext
      );

      const [, , options] = mockAzureOpenAI.generateResponse.mock.calls[0];
      expect(options.context.previousMessages.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Token and Cost Management', () => {
    test('should track token usage', async () => {
      mockAzureOpenAI.getTokenCount.mockReturnValue(150);

      const response = await aiCharacterProvider.chat(
        'finn',
        'Hello',
        mockUser,
        mockProfile
      );

      expect(response.tokens).toBe(150);
    });

    test('should calculate interaction costs', async () => {
      mockAzureOpenAI.calculateCost.mockReturnValue(0.002);

      const response = await aiCharacterProvider.chat(
        'finn',
        'Hello',
        mockUser,
        mockProfile
      );

      expect(response.cost).toBe(0.002);
    });

    test('should enforce token limits', async () => {
      const longMessage = 'a'.repeat(5000); // Very long message

      await aiCharacterProvider.chat(
        'finn',
        longMessage,
        mockUser,
        mockProfile
      );

      const [, , options] = mockAzureOpenAI.generateResponse.mock.calls[0];
      expect(options.maxTokens).toBeLessThanOrEqual(500); // Should be capped
    });
  });

  describe('Performance and Caching', () => {
    test('should cache character configurations', () => {
      const characters1 = aiCharacterProvider.getAvailableCharacters();
      const characters2 = aiCharacterProvider.getAvailableCharacters();

      expect(characters1).toBe(characters2); // Same reference = cached
    });

    test('should handle concurrent requests efficiently', async () => {
      const promises = Array(5).fill(null).map(() =>
        aiCharacterProvider.chat('finn', 'Hello', mockUser, mockProfile)
      );

      const responses = await Promise.all(promises);
      
      expect(responses).toHaveLength(5);
      responses.forEach(response => {
        expect(response.character).toBe('finn');
        expect(response.safe).toBe(true);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle network timeouts gracefully', async () => {
      mockAzureOpenAI.generateResponse.mockRejectedValue(
        new Error('Request timeout')
      );

      const response = await aiCharacterProvider.chat(
        'finn',
        'Hello',
        mockUser,
        mockProfile
      );

      expect(response.safe).toBe(false);
      expect(response.response).toContain('trouble connecting');
    });

    test('should handle rate limiting errors', async () => {
      mockAzureOpenAI.generateResponse.mockRejectedValue(
        new Error('Rate limit exceeded')
      );

      const response = await aiCharacterProvider.chat(
        'finn',
        'Hello',
        mockUser,
        mockProfile
      );

      expect(response.response).toContain('busy right now');
    });

    test('should validate input parameters', async () => {
      await expect(
        aiCharacterProvider.chat(
          'finn',
          '', // Empty message
          mockUser,
          mockProfile
        )
      ).rejects.toThrow('Message cannot be empty');

      await expect(
        aiCharacterProvider.chat(
          'finn',
          'a'.repeat(10000), // Too long
          mockUser,
          mockProfile
        )
      ).rejects.toThrow('Message too long');
    });
  });
});