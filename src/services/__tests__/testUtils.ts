// ================================================================
// COMPREHENSIVE TESTING UTILITIES
// Testing helpers for skills database services
// ================================================================

import { supabase } from '../../lib/supabase';
import type {
  Skill,
  StudentProgress,
  DailyAssignment,
  Grade,
  Subject,
  ProgressStatus,
  AssignmentStatus
} from '../../types/services';

// ================================================================
// TEST DATA FACTORIES
// ================================================================

export class TestDataFactory {
  static createMockSkill(overrides: Partial<Skill> = {}): Skill {
    return {
      id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      subject: 'Math',
      grade: 'Pre-K',
      skills_area: 'Numbers',
      skills_cluster: 'Counting',
      skill_number: '1.1',
      skill_name: 'Count to 5',
      skill_description: 'Count objects from 1 to 5',
      difficulty_level: 2,
      estimated_time_minutes: 10,
      prerequisites: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides
    };
  }

  static createMockProgress(overrides: Partial<StudentProgress> = {}): StudentProgress {
    return {
      id: `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      student_id: 'test_student_123',
      skill_id: 'test_skill_123',
      status: 'in_progress',
      attempts: 1,
      score: 0.8,
      time_spent_minutes: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides
    };
  }

  static createMockAssignment(overrides: Partial<DailyAssignment> = {}): DailyAssignment {
    return {
      id: `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      student_id: 'test_student_123',
      assignment_date: new Date().toISOString().split('T')[0],
      skill_id: 'test_skill_123',
      subject: 'Math',
      estimated_time_minutes: 10,
      assigned_tool: 'MasterToolInterface',
      status: 'assigned',
      created_at: new Date().toISOString(),
      ...overrides
    };
  }
}

// ================================================================
// DATABASE TEST HELPERS
// ================================================================

export class DatabaseTestHelpers {
  static async cleanupTestData(prefix = 'test_'): Promise<void> {
    // Clean assignments
    await supabase
      .from('daily_assignments')
      .delete()
      .like('student_id', `${prefix}%`);

    // Clean progress
    await supabase
      .from('student_skill_progress')
      .delete()
      .like('student_id', `${prefix}%`);

    // Clean skills
    await supabase
      .from('skills_master')
      .delete()
      .like('id', `${prefix}%`);
  }

  static async insertTestSkill(skill: Partial<Skill>): Promise<Skill> {
    const testSkill = TestDataFactory.createMockSkill(skill);
    const { data, error } = await supabase
      .from('skills_master')
      .insert(testSkill)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async insertTestProgress(progress: Partial<StudentProgress>): Promise<StudentProgress> {
    const testProgress = TestDataFactory.createMockProgress(progress);
    const { data, error } = await supabase
      .from('student_skill_progress')
      .insert(testProgress)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

// ================================================================
// SERVICE TESTING UTILITIES
// ================================================================

export class ServiceTestHelpers {
  static expectSuccessResponse<T>(response: any): T {
    expect(response.success).toBe(true);
    expect(response.error).toBeUndefined();
    expect(response.data).toBeDefined();
    expect(response.metadata).toBeDefined();
    expect(typeof response.metadata.query_time_ms).toBe('number');
    return response.data;
  }

  static expectErrorResponse(response: any, expectedCode?: string): void {
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
    expect(response.data).toBeUndefined();
    expect(response.metadata).toBeDefined();
    
    if (expectedCode) {
      expect(response.error.code).toBe(expectedCode);
    }
  }

  static async measurePerformance<T>(
    operation: () => Promise<T>,
    maxTimeMs: number = 1000
  ): Promise<{ result: T; timeMs: number }> {
    const startTime = Date.now();
    const result = await operation();
    const timeMs = Date.now() - startTime;
    
    expect(timeMs).toBeLessThan(maxTimeMs);
    return { result, timeMs };
  }
}

// ================================================================
// MOCK DATA SETS
// ================================================================

export const MockDataSets = {
  preKMathSkills: [
    { subject: 'Math' as Subject, grade: 'Pre-K' as Grade, skills_area: 'Numbers', skill_name: 'Count to 3', difficulty_level: 1 },
    { subject: 'Math' as Subject, grade: 'Pre-K' as Grade, skills_area: 'Numbers', skill_name: 'Count to 5', difficulty_level: 2 },
    { subject: 'Math' as Subject, grade: 'Pre-K' as Grade, skills_area: 'Shapes', skill_name: 'Identify circles', difficulty_level: 1 }
  ],
  
  studentProgressSequence: [
    { status: 'completed' as ProgressStatus, score: 0.9, attempts: 1 },
    { status: 'in_progress' as ProgressStatus, score: 0.6, attempts: 2 },
    { status: 'not_started' as ProgressStatus, attempts: 0 }
  ]
};

export default {
  TestDataFactory,
  DatabaseTestHelpers,
  ServiceTestHelpers,
  MockDataSets
};