/**
 * Integration Tests for Service-to-Rules-Engine Connections
 * Tests Toast and Chatbot services with rules engines
 */

import { toastNotificationService } from '../../../services/toastNotificationService';
import { chatbotService } from '../../../services/chatbotService';
import { companionRulesEngine } from '../../companions/CompanionRulesEngine';
import { careerProgressionSystem } from '../../career/CareerProgressionSystem';
import { learnAIRulesEngine } from '../../containers/LearnAIRulesEngine';
import { gamificationRulesEngine } from '../../gamification/GamificationRulesEngine';

describe('Service Integration Tests', () => {
  // ============================================================================
  // TOAST SERVICE INTEGRATION
  // ============================================================================
  
  describe('Toast Service Integration', () => {
    it('should show career-contextualized toast messages', async () => {
      const toastContext = {
        studentId: 'test-student',
        grade: '3',
        companionId: 'finn',
        careerId: 'Doctor',
        triggerType: 'achievement' as const,
        achievement: 'Math Master',
        theme: 'light' as const
      };
      
      // Mock the showToast method
      const showToastSpy = jest.spyOn(toastNotificationService, 'showToast');
      
      await toastNotificationService.showCareerToast(toastContext);
      
      expect(showToastSpy).toHaveBeenCalled();
      const toastCall = showToastSpy.mock.calls[0][0];
      
      // Should include career context in message
      expect(toastCall.message).toContain('Doctor');
      expect(toastCall.type).toBe('achievement');
    });
    
    it('should integrate companion personality in toast messages', async () => {
      const companions = ['finn', 'spark', 'harmony', 'sage'];
      const messages: string[] = [];
      
      for (const companionId of companions) {
        const toastContext = {
          studentId: 'test-student',
          grade: '4',
          companionId,
          careerId: 'Teacher',
          triggerType: 'encouragement' as const,
          theme: 'light' as const
        };
        
        const showToastSpy = jest.spyOn(toastNotificationService, 'showToast');
        await toastNotificationService.showCareerToast(toastContext);
        
        const message = showToastSpy.mock.calls[0]?.[0]?.message || '';
        messages.push(message);
      }
      
      // Each companion should have unique message style
      const uniqueMessages = new Set(messages);
      expect(uniqueMessages.size).toBeGreaterThan(1);
    });
    
    it('should apply theme colors to toast notifications', async () => {
      const themes = ['light', 'dark'] as const;
      
      for (const theme of themes) {
        const toastContext = {
          studentId: 'test-student',
          grade: '5',
          companionId: 'spark',
          careerId: 'Artist',
          triggerType: 'success' as const,
          theme
        };
        
        const showToastSpy = jest.spyOn(toastNotificationService, 'showToast');
        await toastNotificationService.showCareerToast(toastContext);
        
        const toastOptions = showToastSpy.mock.calls[0]?.[0];
        expect(toastOptions.theme).toBe(theme);
      }
    });
  });
  
  // ============================================================================
  // CHATBOT SERVICE INTEGRATION
  // ============================================================================
  
  describe('Chatbot Service Integration', () => {
    it('should create chat session with career context', async () => {
      const session = await chatbotService.createSession(
        'test-student',
        'harmony',
        'Scientist',
        '6'
      );
      
      expect(session).toBeDefined();
      expect(session.companionId).toBe('harmony');
      expect(session.careerId).toBe('Scientist');
      expect(session.context.careerContext.careerLabel).toBe('Science Specialist');
      expect(session.messages.length).toBeGreaterThan(0);
      
      // Welcome message should include career context
      const welcomeMessage = session.messages[0];
      expect(welcomeMessage.content).toContain('Science Specialist');
    });
    
    it('should generate AI responses using companion rules', async () => {
      const session = await chatbotService.createSession(
        'test-student',
        'sage',
        'Engineer',
        '7'
      );
      
      const response = await chatbotService.sendMessage({
        message: 'I need help with this math problem',
        sessionId: session.id,
        type: 'help'
      });
      
      expect(response.message).toBeDefined();
      expect(response.message.role).toBe('assistant');
      expect(response.message.companionId).toBe('sage');
      expect(response.message.careerId).toBe('Engineer');
      expect(response.suggestions).toBeInstanceOf(Array);
      expect(response.suggestions.length).toBeGreaterThan(0);
    });
    
    it('should provide hints using learn rules engine', async () => {
      const session = await chatbotService.createSession(
        'test-student',
        'finn',
        'Pilot',
        '4'
      );
      
      const hint = await chatbotService.provideHint(session.id, {
        subject: 'math',
        type: 'numeric',
        problem: 'What is 45 + 37?'
      });
      
      expect(hint).toBeDefined();
      expect(hint.content).toContain('hint');
      expect(hint.metadata?.hints).toBeInstanceOf(Array);
    });
    
    it('should celebrate achievements with gamification', async () => {
      const session = await chatbotService.createSession(
        'test-student',
        'spark',
        'Chef',
        '3'
      );
      
      const celebration = await chatbotService.celebrateAchievement(
        session.id,
        'Recipe Master'
      );
      
      expect(celebration).toBeDefined();
      expect(celebration.content).toContain('Recipe Master');
      expect(celebration.companionEmotion).toBe('celebrating');
    });
  });
  
  // ============================================================================
  // CAREER PROGRESSION INTEGRATION
  // ============================================================================
  
  describe('Career Progression Integration', () => {
    it('should use correct career labels in services', () => {
      const testCases = [
        { career: 'doctor', grade: 'K', expected: 'Doctor Helper' },
        { career: 'teacher', grade: '3', expected: 'Teacher in Training' },
        { career: 'scientist', grade: '5', expected: 'Junior Scientist' },
        { career: 'engineer', grade: '8', expected: 'Engineering Specialist' },
        { career: 'artist', grade: '11', expected: 'Art Professional' }
      ];
      
      for (const test of testCases) {
        const label = careerProgressionSystem.getCareerLabel(test.career, test.grade);
        expect(label).toBe(test.expected);
      }
    });
    
    it('should provide exposure level for grade', () => {
      const grades = ['K', '2', '4', '7', '10'];
      const levels = [
        'explorer',
        'apprentice',
        'practitioner',
        'specialist',
        'expert'
      ];
      
      for (let i = 0; i < grades.length; i++) {
        const level = careerProgressionSystem.getExposureLevelForGrade(grades[i]);
        expect(level).toBe(levels[i]);
      }
    });
  });
  
  // ============================================================================
  // LEARN RULES ENGINE INTEGRATION
  // ============================================================================
  
  describe('Learn Rules Engine Integration', () => {
    it('should validate answers with proper type coercion', async () => {
      const validation = await learnAIRulesEngine.validateAnswer(
        'counting',
        '5',
        5,
        'math',
        'K'
      );
      
      expect(validation.isCorrect).toBe(true);
      expect(validation.rulesApplied.typeCoercion).toBe(true);
    });
    
    it('should select appropriate question types by subject', () => {
      const mathRules = learnAIRulesEngine.getQuestionRules('math', '3');
      const elaRules = learnAIRulesEngine.getQuestionRules('ela', '3');
      
      expect(mathRules.allowedTypes).toContain('counting');
      expect(mathRules.allowedTypes).toContain('numeric');
      
      expect(elaRules.allowedTypes).not.toContain('counting');
      expect(elaRules.allowedTypes).toContain('multiple_choice');
      expect(elaRules.allowedTypes).toContain('fill_blank');
    });
  });
  
  // ============================================================================
  // GAMIFICATION INTEGRATION
  // ============================================================================
  
  describe('Gamification Integration', () => {
    it('should calculate XP for activities', async () => {
      const xp = await gamificationRulesEngine.calculateXP('question_correct', {
        difficulty: 'medium',
        timeSpent: 45,
        streak: 3
      });
      
      expect(xp).toBeGreaterThan(0);
      expect(xp).toBeLessThanOrEqual(200);
    });
    
    it('should check for achievements', async () => {
      const achievements = await gamificationRulesEngine.checkAchievements(
        'test-student',
        'streak_milestone',
        { streak: 5 }
      );
      
      if (achievements.length > 0) {
        expect(achievements[0]).toHaveProperty('id');
        expect(achievements[0]).toHaveProperty('name');
        expect(achievements[0]).toHaveProperty('description');
        expect(achievements[0]).toHaveProperty('xpReward');
      }
    });
  });
  
  // ============================================================================
  // CROSS-SERVICE INTEGRATION
  // ============================================================================
  
  describe('Cross-Service Integration', () => {
    it('should coordinate between toast and chatbot services', async () => {
      // Create chat session
      const session = await chatbotService.createSession(
        'test-student',
        'finn',
        'Doctor',
        '4'
      );
      
      // Send achievement through chat
      const celebration = await chatbotService.celebrateAchievement(
        session.id,
        'Health Hero'
      );
      
      // Show achievement toast
      const showToastSpy = jest.spyOn(toastNotificationService, 'showToast');
      await toastNotificationService.showCareerToast({
        studentId: 'test-student',
        grade: '4',
        companionId: 'finn',
        careerId: 'Doctor',
        triggerType: 'achievement',
        achievement: 'Health Hero',
        theme: 'light'
      });
      
      // Both should reference the same achievement
      expect(celebration.content).toContain('Health Hero');
      expect(showToastSpy.mock.calls[0][0].message).toContain('Health Hero');
    });
    
    it('should maintain consistent companion personality across services', async () => {
      const companionId = 'spark';
      const careerId = 'Artist';
      
      // Get companion profile
      const profile = companionRulesEngine.getCompanionProfile(companionId);
      
      // Create chat session
      const session = await chatbotService.createSession(
        'test-student',
        companionId,
        careerId,
        '5'
      );
      
      // Get companion message
      const companionMessage = await companionRulesEngine.getCompanionMessage(
        companionId,
        careerId,
        'greeting',
        {}
      );
      
      // All should reflect Spark's creative personality
      expect(profile.traits).toContain('Creative');
      expect(session.messages[0].content).toBeTruthy();
      expect(companionMessage.emotion).toBeDefined();
    });
  });
  
  // ============================================================================
  // ERROR HANDLING INTEGRATION
  // ============================================================================
  
  describe('Error Handling', () => {
    it('should handle invalid companion ID gracefully', async () => {
      const toastContext = {
        studentId: 'test-student',
        grade: '3',
        companionId: 'invalid-companion',
        careerId: 'Doctor',
        triggerType: 'greeting' as const,
        theme: 'light' as const
      };
      
      // Should fall back to default behavior
      await expect(
        toastNotificationService.showCareerToast(toastContext)
      ).resolves.not.toThrow();
    });
    
    it('should handle invalid career ID gracefully', async () => {
      const session = await chatbotService.createSession(
        'test-student',
        'finn',
        'InvalidCareer',
        '3'
      );
      
      // Should create session with fallback values
      expect(session).toBeDefined();
      expect(session.messages.length).toBeGreaterThan(0);
    });
  });
  
  // ============================================================================
  // PERFORMANCE INTEGRATION
  // ============================================================================
  
  describe('Performance Integration', () => {
    it('should handle rapid toast notifications', async () => {
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(
          toastNotificationService.showCareerToast({
            studentId: `student-${i}`,
            grade: '3',
            companionId: 'finn',
            careerId: 'Teacher',
            triggerType: 'success',
            theme: 'light'
          })
        );
      }
      
      await expect(Promise.all(promises)).resolves.not.toThrow();
    });
    
    it('should handle concurrent chat sessions', async () => {
      const promises = [];
      
      for (let i = 0; i < 5; i++) {
        promises.push(
          chatbotService.createSession(
            `student-${i}`,
            ['finn', 'spark', 'harmony', 'sage'][i % 4],
            ['Doctor', 'Teacher', 'Scientist', 'Engineer'][i % 4],
            String(i + 1)
          )
        );
      }
      
      const sessions = await Promise.all(promises);
      
      expect(sessions).toHaveLength(5);
      sessions.forEach(session => {
        expect(session).toBeDefined();
        expect(session.id).toBeDefined();
        expect(session.messages).toBeInstanceOf(Array);
      });
    });
  });
});

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock the actual toast display (since we're in a test environment)
jest.mock('../../../services/toastNotificationService', () => {
  const actual = jest.requireActual('../../../services/toastNotificationService');
  return {
    ...actual,
    toastNotificationService: {
      ...actual.toastNotificationService,
      showToast: jest.fn().mockResolvedValue(undefined)
    }
  };
});