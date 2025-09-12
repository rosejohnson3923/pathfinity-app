import { renderHook, act } from '@testing-library/react';
import { useExperienceProgress } from '../useExperienceProgress';

describe('useExperienceProgress', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('initializes with empty progress', () => {
    const { result } = renderHook(() => 
      useExperienceProgress('test-student', 'Math', 'Addition')
    );

    expect(result.current.progress).toBeTruthy();
    expect(result.current.progress?.currentScenarioIndex).toBe(0);
    expect(result.current.progress?.completedScenarios).toEqual([]);
  });

  it('updates scenario progress', () => {
    const { result } = renderHook(() => 
      useExperienceProgress('test-student', 'Math', 'Addition')
    );

    act(() => {
      result.current.updateScenarioProgress(2, 4);
    });

    expect(result.current.progress?.currentScenarioIndex).toBe(2);
    expect(result.current.progress?.totalScenarios).toBe(4);
  });

  it('marks scenario as completed with XP', () => {
    const { result } = renderHook(() => 
      useExperienceProgress('test-student', 'Math', 'Addition')
    );

    act(() => {
      result.current.completeScenario('math_scenario_1', 10);
    });

    expect(result.current.progress?.completedScenarios).toContain('math_scenario_1');
    expect(result.current.progress?.xpEarned).toBe(10);
  });

  it('records interactions', () => {
    const { result } = renderHook(() => 
      useExperienceProgress('test-student', 'Math', 'Addition')
    );

    act(() => {
      result.current.recordInteraction(
        'scenario_1',
        'answer_selected',
        'correct',
        1500
      );
    });

    expect(result.current.progress?.interactions).toHaveLength(1);
    expect(result.current.progress?.interactions[0].result).toBe('correct');
    expect(result.current.progress?.timeSpent).toBe(1500);
  });

  it('calculates completion percentage', () => {
    const { result } = renderHook(() => 
      useExperienceProgress('test-student', 'Math', 'Addition')
    );

    act(() => {
      result.current.updateScenarioProgress(0, 4);
      result.current.completeScenario('scenario_1', 10);
      result.current.completeScenario('scenario_2', 10);
    });

    expect(result.current.getCompletionPercentage()).toBe(50);
  });

  it('persists progress to localStorage', () => {
    const { result } = renderHook(() => 
      useExperienceProgress('test-student', 'Math', 'Addition')
    );

    act(() => {
      result.current.completeScenario('scenario_1', 10);
    });

    const stored = localStorage.getItem('pathfinity_experience_progress_test-student');
    expect(stored).toBeTruthy();
    
    const parsed = JSON.parse(stored!);
    expect(parsed.completedScenarios).toContain('scenario_1');
  });

  it('resumes from saved progress', () => {
    // Save some progress
    const initialProgress = {
      studentId: 'test-student',
      currentSubject: 'Math',
      currentSkill: 'Addition',
      currentScenarioIndex: 2,
      totalScenarios: 4,
      completedScenarios: ['scenario_1', 'scenario_2'],
      completedSubjects: [],
      xpEarned: 20,
      timeSpent: 3000,
      lastUpdated: new Date().toISOString(),
      interactions: []
    };
    
    localStorage.setItem(
      'pathfinity_experience_progress_test-student',
      JSON.stringify(initialProgress)
    );

    // Load the hook
    const { result } = renderHook(() => 
      useExperienceProgress('test-student', 'Math', 'Addition')
    );

    expect(result.current.progress?.currentScenarioIndex).toBe(2);
    expect(result.current.progress?.completedScenarios).toEqual(['scenario_1', 'scenario_2']);
    expect(result.current.progress?.xpEarned).toBe(20);
  });

  it('provides resume data', () => {
    const { result } = renderHook(() => 
      useExperienceProgress('test-student', 'Math', 'Addition')
    );

    act(() => {
      result.current.updateScenarioProgress(2, 4);
      result.current.completeScenario('scenario_1', 10);
      result.current.completeScenario('scenario_2', 10);
    });

    const resumeData = result.current.getResumeData();
    expect(resumeData?.canResume).toBe(true);
    expect(resumeData?.scenarioIndex).toBe(2);
    expect(resumeData?.completedCount).toBe(2);
    expect(resumeData?.xpEarned).toBe(20);
  });

  it('clears progress', () => {
    const { result } = renderHook(() => 
      useExperienceProgress('test-student', 'Math', 'Addition')
    );

    act(() => {
      result.current.completeScenario('scenario_1', 10);
      result.current.clearProgress();
    });

    expect(result.current.progress?.completedScenarios).toEqual([]);
    expect(result.current.progress?.xpEarned).toBe(0);
    
    const stored = localStorage.getItem('pathfinity_experience_progress_test-student');
    expect(stored).toBeNull();
  });
});