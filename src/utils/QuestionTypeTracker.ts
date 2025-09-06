/**
 * Question Type Tracker
 * Monitors and reports which question types are being generated and used
 */

export class QuestionTypeTracker {
  private static instance: QuestionTypeTracker;
  private typeUsage: Map<string, number> = new Map();
  private sessionStart: Date = new Date();
  private enabled: boolean = true;

  // All 15 question types
  private readonly ALL_TYPES = [
    'multiple_choice',
    'true_false',
    'fill_blank',
    'numeric',
    'counting',
    'matching',
    'ordering',
    'sequencing',
    'short_answer',
    'essay',
    'word_problem',
    'drag_drop',
    'drawing',
    'coding',
    'creative_writing'
  ];

  private constructor() {
    this.initializeTracking();
  }

  static getInstance(): QuestionTypeTracker {
    if (!QuestionTypeTracker.instance) {
      QuestionTypeTracker.instance = new QuestionTypeTracker();
    }
    return QuestionTypeTracker.instance;
  }

  private initializeTracking(): void {
    // Initialize all types with 0 count
    this.ALL_TYPES.forEach(type => {
      this.typeUsage.set(type, 0);
    });

    // Add to window for easy console access
    if (typeof window !== 'undefined') {
      (window as any).questionTypeTracker = this;
    }

    console.log('[QuestionTypeTracker] Initialized. Access via window.questionTypeTracker');
  }

  /**
   * Track a question type being used
   */
  trackQuestionType(type: string): void {
    if (!this.enabled) return;

    const count = this.typeUsage.get(type) || 0;
    this.typeUsage.set(type, count + 1);

    console.log(`[QuestionType] Generated: ${type} (Total: ${count + 1})`);
  }

  /**
   * Track multiple types at once
   */
  trackQuestionTypes(types: string[]): void {
    types.forEach(type => this.trackQuestionType(type));
  }

  /**
   * Get usage statistics
   */
  getStats(): {
    totalQuestions: number;
    typesUsed: number;
    typesUnused: number;
    usage: Record<string, number>;
    unusedTypes: string[];
    coverage: string;
  } {
    const usage: Record<string, number> = {};
    let totalQuestions = 0;
    const unusedTypes: string[] = [];

    this.typeUsage.forEach((count, type) => {
      usage[type] = count;
      totalQuestions += count;
      if (count === 0) {
        unusedTypes.push(type);
      }
    });

    const typesUsed = this.ALL_TYPES.length - unusedTypes.length;
    const coverage = `${typesUsed}/${this.ALL_TYPES.length} (${Math.round(typesUsed / this.ALL_TYPES.length * 100)}%)`;

    return {
      totalQuestions,
      typesUsed,
      typesUnused: unusedTypes.length,
      usage,
      unusedTypes,
      coverage
    };
  }

  /**
   * Display stats in console
   */
  displayStats(): void {
    const stats = this.getStats();
    const sessionDuration = Math.round((Date.now() - this.sessionStart.getTime()) / 1000 / 60);

    console.group('📊 Question Type Usage Report');
    console.log(`Session Duration: ${sessionDuration} minutes`);
    console.log(`Total Questions Generated: ${stats.totalQuestions}`);
    console.log(`Type Coverage: ${stats.coverage}`);
    
    console.group('✅ Used Types:');
    Object.entries(stats.usage)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        const percentage = Math.round(count / stats.totalQuestions * 100);
        console.log(`${type}: ${count} (${percentage}%)`);
      });
    console.groupEnd();

    if (stats.unusedTypes.length > 0) {
      console.group('❌ Unused Types:');
      stats.unusedTypes.forEach(type => console.log(type));
      console.groupEnd();
    }

    console.groupEnd();
  }

  /**
   * Reset tracking
   */
  reset(): void {
    this.typeUsage.clear();
    this.ALL_TYPES.forEach(type => {
      this.typeUsage.set(type, 0);
    });
    this.sessionStart = new Date();
    console.log('[QuestionTypeTracker] Stats reset');
  }

  /**
   * Enable/disable tracking
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    console.log(`[QuestionTypeTracker] Tracking ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get unused types for testing
   */
  getUnusedTypes(): string[] {
    const unused: string[] = [];
    this.typeUsage.forEach((count, type) => {
      if (count === 0) {
        unused.push(type);
      }
    });
    return unused;
  }

  /**
   * Check if all types have been used
   */
  hasFullCoverage(): boolean {
    return this.getUnusedTypes().length === 0;
  }
}

// Export singleton instance
export const questionTypeTracker = QuestionTypeTracker.getInstance();