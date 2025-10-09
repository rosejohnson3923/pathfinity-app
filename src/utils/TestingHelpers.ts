/**
 * Testing Helpers for Question Type Coverage
 * Console utilities to monitor and force question type cycling
 */

import { questionTypeTracker } from './QuestionTypeTracker';

export class TestingHelpers {
  private static instance: TestingHelpers;

  private constructor() {
    this.setupConsoleCommands();
  }

  static getInstance(): TestingHelpers {
    if (!TestingHelpers.instance) {
      TestingHelpers.instance = new TestingHelpers();
    }
    return TestingHelpers.instance;
  }

  private setupConsoleCommands(): void {
    if (typeof window !== 'undefined') {
      // Add testing commands to window
      (window as any).testing = {
        // Check question type coverage
        checkCoverage: () => {
          questionTypeTracker.displayStats();
          const stats = questionTypeTracker.getStats();
          if (stats.typesUnused > 0) {
            console.log('⚠️ To achieve full coverage, generate questions in these types:', stats.unusedTypes);
          } else {
            console.log('✅ FULL COVERAGE ACHIEVED! All 15 question types have been used.');
          }
          return stats;
        },

        // Reset tracking
        resetTracking: () => {
          questionTypeTracker.reset();
          console.log('📊 Question type tracking reset. Start fresh testing.');
        },

        // Get unused types
        getUnusedTypes: () => {
          const unused = questionTypeTracker.getUnusedTypes();
          console.log(`📋 Unused question types (${unused.length}):`, unused);
          return unused;
        },

        // Force specific question type (for testing)
        forceQuestionType: (type: string) => {
          localStorage.setItem('forceQuestionType', type);
          console.log(`🎯 Forcing next question to be: ${type}`);
          console.log('Note: This will only work if the container requests new questions');
        },

        // Clear forced type
        clearForce: () => {
          localStorage.removeItem('forceQuestionType');
          console.log('🔄 Cleared forced question type. Normal selection resumed.');
        },

        // Simulate full coverage test
        simulateFullCoverage: () => {
          console.log('🧪 Simulating generation of all 15 question types...');
          const allTypes = [
            'multiple_choice', 'true_false', 'fill_blank', 'numeric', 'counting',
            'matching', 'ordering', 'sequencing', 'short_answer', 'essay',
            'word_problem', 'drag_drop', 'drawing', 'coding', 'creative_writing'
          ];
          
          allTypes.forEach(type => {
            questionTypeTracker.trackQuestionType(type);
            console.log(`✓ Generated: ${type}`);
          });
          
          console.log('✅ Simulation complete!');
          questionTypeTracker.displayStats();
        },

        // Get current stats
        getStats: () => {
          const stats = questionTypeTracker.getStats();
          console.table(stats.usage);
          return stats;
        },

        // Monitor mode - log every question generated
        enableMonitoring: () => {
          localStorage.setItem('monitorQuestions', 'true');
          console.log('👁️ Question monitoring enabled. All generated questions will be logged.');
        },

        disableMonitoring: () => {
          localStorage.removeItem('monitorQuestions');
          console.log('👁️ Question monitoring disabled.');
        }
      };

      // Only show banner in DEV mode and if explicitly requested
      if (import.meta.env.DEV && localStorage.getItem('showTestingBanner') === 'true') {
        console.log(`
╔════════════════════════════════════════════════╗
║     Question Type Testing Commands Ready      ║
╠════════════════════════════════════════════════╣
║ Access via: window.testing                    ║
║                                                ║
║ Commands:                                      ║
║ • testing.checkCoverage() - Check type usage  ║
║ • testing.resetTracking() - Reset counters    ║
║ • testing.getUnusedTypes() - List unused      ║
║ • testing.getStats() - View statistics        ║
║ • testing.forceQuestionType('type') - Force   ║
║ • testing.clearForce() - Stop forcing         ║
║ • testing.enableMonitoring() - Log all Q's    ║
║                                                ║
║ Question Tracker: window.questionTypeTracker  ║
╚════════════════════════════════════════════════╝
      `);
      }
    }
  }
}

// Initialize on import
export const testingHelpers = TestingHelpers.getInstance();