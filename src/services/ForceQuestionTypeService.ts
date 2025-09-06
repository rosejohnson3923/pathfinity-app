/**
 * Force Question Type Service
 * ===========================
 * Forces the AI to generate specific question types for testing
 */

class ForceQuestionTypeService {
  private static instance: ForceQuestionTypeService;
  private forcedTypes: string[] | null = null;
  private currentIndex: number = 0;

  private constructor() {
    this.loadState();
  }

  static getInstance(): ForceQuestionTypeService {
    if (!ForceQuestionTypeService.instance) {
      ForceQuestionTypeService.instance = new ForceQuestionTypeService();
    }
    return ForceQuestionTypeService.instance;
  }

  /**
   * Force specific question types for the next generation
   */
  forceTypes(types: string[]) {
    this.forcedTypes = types;
    this.currentIndex = 0;
    this.saveState();
    console.log('🎯 Forcing question types:', types);
  }

  /**
   * Get the next forced type (cycles through the list)
   */
  getNextType(): string | null {
    if (!this.forcedTypes || this.forcedTypes.length === 0) {
      return null;
    }
    
    const type = this.forcedTypes[this.currentIndex % this.forcedTypes.length];
    this.currentIndex++;
    this.saveState();
    return type;
  }

  /**
   * Get forced types for a Learn container (5 practice + 1 assessment)
   */
  getForcedTypesForLearn(): string[] | null {
    if (!this.forcedTypes) return null;
    
    const types: string[] = [];
    for (let i = 0; i < 6; i++) {
      types.push(this.getNextType()!);
    }
    
    console.log('📋 Forced types for Learn:', types);
    return types;
  }

  /**
   * Clear forced types
   */
  clear() {
    this.forcedTypes = null;
    this.currentIndex = 0;
    this.saveState();
    console.log('🔄 Cleared forced question types');
  }

  /**
   * Test advanced types
   */
  testAdvancedTypes() {
    this.forceTypes([
      'matching',
      'ordering', 
      'short_answer',
      'essay',
      'drag_drop',
      'multi_select'
    ]);
  }

  /**
   * Test interactive types
   */
  testInteractiveTypes() {
    this.forceTypes([
      'slider',
      'hotspot',
      'diagram_label',
      'graph_plot',
      'table_complete',
      'numeric'
    ]);
  }

  /**
   * Test missing types (ones not yet seen)
   */
  testMissingTypes() {
    this.forceTypes([
      'fill_blank',
      'numeric',
      'matching',
      'ordering',
      'short_answer',
      'essay'
    ]);
  }

  private saveState() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('forcedQuestionTypes', JSON.stringify({
        types: this.forcedTypes,
        index: this.currentIndex
      }));
    }
  }

  private loadState() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('forcedQuestionTypes');
      if (saved) {
        try {
          const state = JSON.parse(saved);
          this.forcedTypes = state.types;
          this.currentIndex = state.index || 0;
        } catch (e) {
          console.error('Failed to load forced types:', e);
        }
      }
    }
  }
}

// Export for console use
if (typeof window !== 'undefined') {
  (window as any).forceTypes = ForceQuestionTypeService.getInstance();
  (window as any).testAdvancedTypes = () => ForceQuestionTypeService.getInstance().testAdvancedTypes();
  (window as any).testInteractiveTypes = () => ForceQuestionTypeService.getInstance().testInteractiveTypes();
  (window as any).testMissingTypes = () => ForceQuestionTypeService.getInstance().testMissingTypes();
  (window as any).clearForcedTypes = () => ForceQuestionTypeService.getInstance().clear();
  
  console.log('🎮 Force Question Type Service Loaded!');
  console.log('   Commands:');
  console.log('   - testMissingTypes() // Test types not yet seen');
  console.log('   - testAdvancedTypes() // Test complex types');
  console.log('   - testInteractiveTypes() // Test interactive types');
  console.log('   - clearForcedTypes() // Return to normal');
}

export const forceQuestionTypeService = ForceQuestionTypeService.getInstance();