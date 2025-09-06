"use strict";
/**
 * Question Type Rotation Service
 * ==============================
 * Ensures all 15 question types are tested systematically
 * by rotating through them for each skill/subject combination
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.questionTypeRotationService = void 0;
class QuestionTypeRotationService {
    constructor() {
        this.typeRotation = new Map();
        // All 15 question types in testing order
        this.ALL_TYPES = [
            'multiple_choice',
            'true_false',
            'fill_blank',
            'numeric',
            'matching',
            'ordering',
            'short_answer',
            'essay',
            'drag_drop',
            'multi_select',
            'slider',
            'hotspot',
            'diagram_label',
            'graph_plot',
            'table_complete'
        ];
        this.loadRotationState();
    }
    static getInstance() {
        if (!QuestionTypeRotationService.instance) {
            QuestionTypeRotationService.instance = new QuestionTypeRotationService();
        }
        return QuestionTypeRotationService.instance;
    }
    /**
     * Get the next set of question types for a skill
     * Ensures we cycle through all 15 types
     */
    getQuestionTypesForSkill(skillId, subject, count = 6) {
        const key = `${subject}-${skillId}`;
        const currentIndex = this.typeRotation.get(key) || 0;
        const types = [];
        let index = currentIndex;
        // Get 'count' number of types, cycling through the list
        for (let i = 0; i < count; i++) {
            types.push(this.ALL_TYPES[index % this.ALL_TYPES.length]);
            index++;
        }
        // Save the new index for next time
        this.typeRotation.set(key, index);
        this.saveRotationState();
        console.log(`📋 Question types for ${key}:`, types);
        console.log(`   Next rotation will start at type: ${this.ALL_TYPES[index % this.ALL_TYPES.length]}`);
        return types;
    }
    /**
     * Get types for Learn container (5 practice + 1 assessment)
     * Distributes types across questions
     */
    getTypesForLearnContainer(skillId, subject) {
        const types = this.getQuestionTypesForSkill(skillId, subject, 6);
        return {
            practiceTypes: types.slice(0, 5), // First 5 for practice
            assessmentType: types[5] // 6th for assessment
        };
    }
    /**
     * Reset rotation for a skill (for testing)
     */
    resetRotation(skillId, subject) {
        const key = `${subject}-${skillId}`;
        this.typeRotation.delete(key);
        this.saveRotationState();
    }
    /**
     * Get current rotation status
     */
    getRotationStatus() {
        const status = new Map();
        for (const [key, index] of this.typeRotation.entries()) {
            status.set(key, {
                currentIndex: index,
                nextType: this.ALL_TYPES[index % this.ALL_TYPES.length]
            });
        }
        return status;
    }
    /**
     * Save rotation state to localStorage
     */
    saveRotationState() {
        if (typeof window !== 'undefined' && window.localStorage) {
            const state = Object.fromEntries(this.typeRotation);
            localStorage.setItem('questionTypeRotation', JSON.stringify(state));
        }
    }
    /**
     * Load rotation state from localStorage
     */
    loadRotationState() {
        if (typeof window !== 'undefined' && window.localStorage) {
            const saved = localStorage.getItem('questionTypeRotation');
            if (saved) {
                try {
                    const state = JSON.parse(saved);
                    this.typeRotation = new Map(Object.entries(state));
                }
                catch (e) {
                    console.error('Failed to load rotation state:', e);
                }
            }
        }
    }
    /**
     * Force specific types for testing
     */
    forceTypes(types) {
        console.log('🔧 Forcing question types:', types);
        return types;
    }
    /**
     * Get progress report
     */
    getProgressReport(skillId, subject) {
        const key = `${subject}-${skillId}`;
        const currentIndex = this.typeRotation.get(key) || 0;
        const testedCount = Math.min(currentIndex, this.ALL_TYPES.length);
        const tested = this.ALL_TYPES.slice(0, testedCount);
        const remaining = currentIndex >= this.ALL_TYPES.length ? [] :
            this.ALL_TYPES.slice(currentIndex);
        return {
            tested,
            remaining,
            progress: Math.min(100, (currentIndex / this.ALL_TYPES.length) * 100)
        };
    }
}
exports.questionTypeRotationService = QuestionTypeRotationService.getInstance();
