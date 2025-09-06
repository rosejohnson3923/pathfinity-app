/**
 * End-to-End Test Scenarios for Complete User Journeys
 * Tests the full AIRulesEngine architecture in real-world scenarios
 */

import { learnAIRulesEngine } from '../../containers/LearnAIRulesEngine';
import { companionRulesEngine } from '../../companions/CompanionRulesEngine';
import { gamificationRulesEngine } from '../../gamification/GamificationRulesEngine';
import { careerAIRulesEngine } from '../../career/CareerAIRulesEngine';
import { themeRulesEngine } from '../../themes/ThemeRulesEngine';
import { masterRulesEngine } from '../../core/MasterRulesEngine';
import { toastNotificationService } from '../../../services/toastNotificationService';
import { chatbotService } from '../../../services/chatbotService';
import { careerProgressionSystem } from '../../career/CareerProgressionSystem';

describe('E2E User Journey Tests', () => {
  // ============================================================================
  // NEW STUDENT ONBOARDING JOURNEY
  // ============================================================================
  
  describe('New Student Onboarding', () => {
    it('should complete full onboarding flow', async () => {
      // Step 1: Create student profile
      const student = {
        id: 'new-student-001',
        name: 'Emma Johnson',
        age: 8,
        grade_level: '3',
        avatar: 'avatar1'
      };
      
      // Step 2: Select companion
      const companion = 'finn';
      const companionProfile = companionRulesEngine.getCompanionProfile(companion);
      expect(companionProfile.name).toBe('Finn');
      
      // Step 3: Select career
      const career = 'doctor';
      const careerProfile = careerAIRulesEngine.getCareerProfile(career);
      expect(careerProfile.name).toBe('Doctor');
      
      // Step 4: Get career label for grade
      const careerLabel = careerProgressionSystem.getCareerLabel(career, student.grade_level);
      expect(careerLabel).toBe('Doctor in Training');
      
      // Step 5: Initialize chat session
      const chatSession = await chatbotService.createSession(
        student.id,
        companion,
        career,
        student.grade_level
      );
      expect(chatSession.messages[0].content).toContain(careerLabel);
      
      // Step 6: Set theme preference
      const themeContext = {
        userId: student.id,
        timestamp: new Date(),
        metadata: {},
        preferences: { theme: 'light' as const }
      };
      const themeResults = await themeRulesEngine.execute(themeContext);
      expect(themeResults[0].data?.theme).toBe('light');
      
      // Step 7: Show welcome toast
      await toastNotificationService.showCareerToast({
        studentId: student.id,
        grade: student.grade_level,
        companionId: companion,
        careerId: career,
        triggerType: 'greeting',
        theme: 'light'
      });
      
      // Onboarding complete
      expect(chatSession.id).toBeDefined();
    });
  });
  
  // ============================================================================
  // COMPLETE LEARNING SESSION JOURNEY
  // ============================================================================
  
  describe('Complete Learning Session', () => {
    it('should progress through math learning session with all features', async () => {
      const sessionData = {
        student: {
          id: 'student-002',
          name: 'Alex Chen',
          grade_level: '4',
          age: 9
        },
        companion: 'spark',
        career: 'engineer',
        subject: 'math' as const
      };
      
      const sessionResults = {
        questionsAnswered: 0,
        correctAnswers: 0,
        xpEarned: 0,
        achievements: [] as any[],
        streak: 0
      };
      
      // Start session
      const startTime = Date.now();
      
      // Answer 5 questions
      for (let i = 0; i < 5; i++) {
        // Step 1: Get question rules
        const questionRules = learnAIRulesEngine.getQuestionRules(
          sessionData.subject,
          sessionData.student.grade_level
        );
        expect(questionRules.allowedTypes).toContain('numeric');
        
        // Step 2: Generate career-contextualized scenario
        const scenario = careerAIRulesEngine.getCareerScenario(
          sessionData.career,
          sessionData.subject,
          sessionData.student.grade_level
        );
        expect(scenario.careerConnection).toContain('engineer');
        
        // Step 3: Answer question
        const answerContext = {
          userId: sessionData.student.id,
          timestamp: new Date(),
          metadata: {},
          student: {
            id: sessionData.student.id,
            grade: sessionData.student.grade_level
          },
          subject: sessionData.subject,
          career: {
            id: sessionData.career,
            name: 'Engineer'
          },
          answerContext: {
            questionType: 'numeric' as const,
            userAnswer: 42 + i,
            correctAnswer: 42 + i // Simulating correct answers
          }
        };
        
        const validationResults = await learnAIRulesEngine.execute(answerContext);
        const validation = validationResults.find(r => r.data?.isCorrect !== undefined);
        
        if (validation?.data?.isCorrect) {
          sessionResults.correctAnswers++;
          sessionResults.streak++;
        } else {
          sessionResults.streak = 0;
        }
        sessionResults.questionsAnswered++;
        
        // Step 4: Calculate XP
        const xpContext = {
          userId: sessionData.student.id,
          timestamp: new Date(),
          metadata: {},
          action: {
            type: 'question_answered' as const,
            result: validation?.data?.isCorrect ? 'correct' as const : 'incorrect' as const,
            difficulty: 'medium' as const,
            streak: sessionResults.streak
          },
          student: {
            grade: sessionData.student.grade_level,
            level: 5
          }
        };
        
        const xpResults = await gamificationRulesEngine.execute(xpContext);
        const xpResult = xpResults.find(r => r.data?.xp);
        sessionResults.xpEarned += xpResult?.data?.xp || 0;
        
        // Step 5: Check for achievements
        if (sessionResults.streak >= 3) {
          const achievements = await gamificationRulesEngine.checkAchievements(
            sessionData.student.id,
            'streak_milestone',
            { streak: sessionResults.streak }
          );
          
          if (achievements.length > 0) {
            sessionResults.achievements.push(...achievements);
            
            // Show achievement toast
            await toastNotificationService.showCareerToast({
              studentId: sessionData.student.id,
              grade: sessionData.student.grade_level,
              companionId: sessionData.companion,
              careerId: sessionData.career,
              triggerType: 'achievement',
              achievement: achievements[0].name,
              theme: 'light'
            });
          }
        }
        
        // Step 6: Get companion encouragement
        if (i === 2) { // Halfway through
          const encouragement = await companionRulesEngine.getCompanionMessage(
            sessionData.companion,
            sessionData.career,
            'encouragement',
            { progress: 0.5 }
          );
          expect(encouragement.message).toBeTruthy();
        }
      }
      
      // Session complete
      const sessionDuration = Date.now() - startTime;
      
      // Final stats
      expect(sessionResults.questionsAnswered).toBe(5);
      expect(sessionResults.correctAnswers).toBe(5);
      expect(sessionResults.xpEarned).toBeGreaterThan(0);
      expect(sessionDuration).toBeLessThan(5000); // Should complete within 5 seconds
      
      // Celebration message
      const celebration = await companionRulesEngine.getCompanionMessage(
        sessionData.companion,
        sessionData.career,
        'celebration',
        {
          score: sessionResults.correctAnswers,
          total: sessionResults.questionsAnswered
        }
      );
      expect(celebration.emotion).toBe('celebrating');
    });
  });
  
  // ============================================================================
  // MULTI-SUBJECT PROGRESSION JOURNEY
  // ============================================================================
  
  describe('Multi-Subject Progression', () => {
    it('should complete all 4 subjects in a container', async () => {
      const subjects = ['Math', 'ELA', 'Science', 'Social Studies'];
      const student = {
        id: 'student-003',
        name: 'Maria Garcia',
        grade_level: '5',
        age: 10
      };
      const companion = 'harmony';
      const career = 'scientist';
      
      const containerResults = {
        subjectsCompleted: [] as string[],
        totalXP: 0,
        achievements: [] as any[],
        transitionMessages: [] as string[]
      };
      
      for (const subject of subjects) {
        // Step 1: Get subject-specific rules
        const subjectLower = subject.toLowerCase().replace(' ', '_') as any;
        const questionRules = learnAIRulesEngine.getQuestionRules(
          subjectLower,
          student.grade_level
        );
        
        // Verify subject-specific rules
        if (subjectLower === 'ela') {
          expect(questionRules.allowedTypes).not.toContain('counting');
        }
        if (subjectLower === 'math') {
          expect(questionRules.allowedTypes).toContain('numeric');
        }
        
        // Step 2: Complete subject activities
        const xp = await gamificationRulesEngine.calculateXP('subject_complete', {
          studentId: student.id,
          subject,
          success: true,
          containerType: 'LEARN',
          timeSpent: 300000 // 5 minutes
        });
        containerResults.totalXP += xp;
        
        // Step 3: Get transition message
        if (subjects.indexOf(subject) < subjects.length - 1) {
          const nextSubject = subjects[subjects.indexOf(subject) + 1];
          const transition = await companionRulesEngine.getCompanionMessage(
            companion,
            career,
            'subject_transition',
            {
              currentSubject: subject,
              nextSubject,
              grade: student.grade_level
            }
          );
          containerResults.transitionMessages.push(transition.message);
        }
        
        containerResults.subjectsCompleted.push(subject);
      }
      
      // Container complete
      expect(containerResults.subjectsCompleted).toHaveLength(4);
      expect(containerResults.totalXP).toBeGreaterThan(0);
      expect(containerResults.transitionMessages).toHaveLength(3);
      
      // Final celebration
      const completion = await companionRulesEngine.getCompanionMessage(
        companion,
        career,
        'container_complete',
        {
          containerType: 'LEARN',
          averageScore: 90,
          grade: student.grade_level
        }
      );
      expect(completion.message).toContain('completed');
    });
  });
  
  // ============================================================================
  // ADAPTIVE DIFFICULTY JOURNEY
  // ============================================================================
  
  describe('Adaptive Difficulty', () => {
    it('should adapt to student performance', async () => {
      const student = {
        id: 'student-004',
        name: 'James Wilson',
        grade_level: '6',
        performance: {
          correct: 0,
          incorrect: 0,
          streak: 0
        }
      };
      
      // Start with medium difficulty
      let currentDifficulty = 'medium';
      
      // Simulate 10 questions with varying performance
      const answerPattern = [true, true, true, true, false, true, true, true, true, true]; // 90% correct
      
      for (let i = 0; i < answerPattern.length; i++) {
        const isCorrect = answerPattern[i];
        
        if (isCorrect) {
          student.performance.correct++;
          student.performance.streak++;
        } else {
          student.performance.incorrect++;
          student.performance.streak = 0;
        }
        
        // Check if difficulty should adjust
        const successRate = student.performance.correct / (i + 1);
        
        if (successRate > 0.8 && student.performance.streak >= 3) {
          currentDifficulty = 'hard';
        } else if (successRate < 0.5) {
          currentDifficulty = 'easy';
        } else {
          currentDifficulty = 'medium';
        }
        
        // Get appropriate XP for difficulty
        const xp = await gamificationRulesEngine.calculateXP('question_correct', {
          difficulty: currentDifficulty,
          timeSpent: 30,
          streak: student.performance.streak
        });
        
        // Higher difficulty should give more XP
        if (currentDifficulty === 'hard') {
          expect(xp).toBeGreaterThanOrEqual(15);
        } else if (currentDifficulty === 'easy') {
          expect(xp).toBeLessThanOrEqual(10);
        }
      }
      
      // Final performance check
      const finalSuccessRate = student.performance.correct / answerPattern.length;
      expect(finalSuccessRate).toBe(0.9);
      expect(currentDifficulty).toBe('hard'); // Should be at hard difficulty
    });
  });
  
  // ============================================================================
  // CAREER PROGRESSION JOURNEY
  // ============================================================================
  
  describe('Career Progression Through Grades', () => {
    it('should show career progression from K to 12', async () => {
      const career = 'astronaut';
      const grades = ['K', '2', '5', '8', '11'];
      const expectedLevels = [
        'explorer',
        'apprentice',
        'practitioner',
        'specialist',
        'expert'
      ];
      const expectedLabels = [
        'Space Explorer',
        'Astronaut in Training',
        'Junior Astronaut',
        'Space Specialist',
        'Space Professional'
      ];
      
      for (let i = 0; i < grades.length; i++) {
        const grade = grades[i];
        
        // Get exposure level
        const level = careerProgressionSystem.getExposureLevelForGrade(grade);
        expect(level).toBe(expectedLevels[i]);
        
        // Get career label
        const label = careerProgressionSystem.getCareerLabel(career, grade);
        expect(label).toBe(expectedLabels[i]);
        
        // Get age-appropriate vocabulary
        const vocabulary = careerAIRulesEngine.getCareerVocabulary(career, grade);
        
        if (grade === 'K') {
          expect(vocabulary).toContain('rocket');
          expect(vocabulary).toContain('space');
        } else if (grade === '11') {
          expect(vocabulary.some(word => 
            ['orbit', 'mission', 'spacecraft', 'gravity'].includes(word)
          )).toBe(true);
        }
        
        // Get grade-appropriate scenario
        const scenario = careerAIRulesEngine.getCareerScenario(career, 'science', grade);
        expect(scenario.context).toContain('space');
      }
    });
  });
  
  // ============================================================================
  // THEME AND ACCESSIBILITY JOURNEY
  // ============================================================================
  
  describe('Theme and Accessibility', () => {
    it('should adapt to user preferences and accessibility needs', async () => {
      const student = {
        id: 'student-005',
        name: 'Sarah Lee',
        preferences: {
          theme: 'dark' as const,
          accessibility: {
            highContrast: true,
            largeText: true,
            reducedMotion: true
          }
        }
      };
      
      // Apply theme preferences
      const themeContext = {
        userId: student.id,
        timestamp: new Date(),
        metadata: {},
        preferences: student.preferences
      };
      
      const themeResults = await themeRulesEngine.execute(themeContext);
      
      // Check theme
      const theme = themeResults.find(r => r.data?.theme);
      expect(theme?.data?.theme).toBe('dark');
      
      // Check accessibility
      const accessibility = themeResults.find(r => r.data?.accessibility);
      expect(accessibility?.data?.accessibility.highContrast).toBe(true);
      expect(accessibility?.data?.accessibility.contrastRatio).toBeGreaterThanOrEqual(7);
      
      // Check typography
      const typography = themeResults.find(r => r.data?.typography);
      expect(typography?.data?.typography.baseFontSize).toBeGreaterThanOrEqual(18);
      
      // Check animations
      const animations = themeResults.find(r => r.data?.animations);
      expect(animations?.data?.animations.enabled).toBe(false);
    });
  });
  
  // ============================================================================
  // ERROR RECOVERY JOURNEY
  // ============================================================================
  
  describe('Error Recovery', () => {
    it('should handle and recover from various error scenarios', async () => {
      // Scenario 1: Invalid companion
      const invalidCompanion = await companionRulesEngine.execute({
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        companionId: 'invalid-companion',
        career: { id: 'doctor', name: 'Doctor' },
        trigger: { type: 'greeting' }
      });
      expect(invalidCompanion).toBeDefined();
      
      // Scenario 2: Invalid career
      const invalidCareer = careerAIRulesEngine.getCareerProfile('invalid-career');
      expect(invalidCareer).toBeUndefined();
      
      // Scenario 3: Missing student data
      const missingData = await learnAIRulesEngine.execute({
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        student: { id: '', grade: '' },
        subject: 'math'
      });
      expect(missingData).toBeDefined();
      
      // Scenario 4: Recovery after errors
      const validExecution = await learnAIRulesEngine.execute({
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        student: { id: 'student-recovery', grade: '4' },
        subject: 'science',
        mode: 'practice'
      });
      expect(validExecution.length).toBeGreaterThan(0);
    });
  });
  
  // ============================================================================
  // PERFORMANCE UNDER LOAD
  // ============================================================================
  
  describe('Performance Under Load', () => {
    it('should maintain performance with multiple concurrent users', async () => {
      const userCount = 20;
      const promises = [];
      
      for (let i = 0; i < userCount; i++) {
        const userJourney = async () => {
          const userId = `concurrent-user-${i}`;
          const grade = String((i % 12) + 1);
          const companion = ['finn', 'spark', 'harmony', 'sage'][i % 4];
          const career = ['doctor', 'teacher', 'scientist', 'engineer'][i % 4];
          
          // Each user completes a mini journey
          const session = await chatbotService.createSession(
            userId,
            companion,
            career,
            grade
          );
          
          const xp = await gamificationRulesEngine.calculateXP('question_correct', {
            difficulty: 'medium',
            timeSpent: 30
          });
          
          const companionMessage = await companionRulesEngine.getCompanionMessage(
            companion,
            career,
            'encouragement',
            {}
          );
          
          return {
            userId,
            sessionId: session.id,
            xp,
            message: companionMessage.message
          };
        };
        
        promises.push(userJourney());
      }
      
      const startTime = performance.now();
      const results = await Promise.all(promises);
      const duration = performance.now() - startTime;
      
      expect(results).toHaveLength(userCount);
      expect(duration).toBeLessThan(3000); // 20 users in 3 seconds
      
      // Verify all users got valid results
      results.forEach(result => {
        expect(result.sessionId).toBeDefined();
        expect(result.xp).toBeGreaterThan(0);
        expect(result.message).toBeTruthy();
      });
    });
  });
});

// ============================================================================
// TEST UTILITIES
// ============================================================================

function simulateUserSession(duration: number = 5000) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

function generateRandomAnswers(count: number, correctRate: number = 0.7) {
  return Array.from({ length: count }, () => Math.random() < correctRate);
}