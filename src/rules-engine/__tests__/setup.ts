/**
 * Test Setup for AIRulesEngine Test Suite
 * Configures test environment and global mocks
 */

// Add custom matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Global test utilities
global.createMockStudent = (overrides = {}) => ({
  id: 'test-student',
  name: 'Test Student',
  age: 8,
  grade_level: '3',
  avatar: 'avatar1',
  learning_style: 'visual',
  interests: ['science', 'art'],
  ...overrides
});

global.createMockCareer = (overrides = {}) => ({
  id: 'doctor',
  name: 'Doctor',
  icon: '👨‍⚕️',
  description: 'Help people stay healthy',
  ...overrides
});

// Mock timers for performance tests
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  // Keep console.error for actual errors
  console.error = jest.fn((message) => {
    if (message.includes('Warning:') || message.includes('ReactDOM.render')) {
      return;
    }
    originalConsoleError(message);
  });
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

// Mock localStorage for browser tests
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock performance API if not available
if (typeof performance === 'undefined') {
  global.performance = {
    now: () => Date.now(),
  } as any;
}

// Add TypeScript declarations for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
  
  var createMockStudent: (overrides?: any) => any;
  var createMockCareer: (overrides?: any) => any;
}

// Export test utilities
export const testUtils = {
  /**
   * Wait for async operations to complete
   */
  waitForAsync: async (ms = 0) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  
  /**
   * Create a mock context for rules engine
   */
  createMockContext: (type: string, overrides = {}) => {
    const baseContext = {
      userId: 'test-user',
      timestamp: new Date(),
      metadata: {},
    };
    
    switch (type) {
      case 'learn':
        return {
          ...baseContext,
          student: { id: 'student-1', grade: '3' },
          subject: 'math',
          ...overrides
        };
      
      case 'companion':
        return {
          ...baseContext,
          companionId: 'finn',
          career: { id: 'doctor', name: 'Doctor' },
          trigger: { type: 'greeting' },
          ...overrides
        };
      
      case 'theme':
        return {
          ...baseContext,
          preferences: { theme: 'light' },
          ...overrides
        };
      
      case 'gamification':
        return {
          ...baseContext,
          action: { type: 'question_answered', result: 'correct' },
          student: { grade: '3', level: 5 },
          ...overrides
        };
      
      case 'career':
        return {
          ...baseContext,
          career: { id: 'doctor', name: 'Doctor' },
          request: { type: 'vocabulary' },
          ...overrides
        };
      
      default:
        return { ...baseContext, ...overrides };
    }
  },
  
  /**
   * Measure execution time
   */
  measureTime: async (fn: () => Promise<any>) => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    return { result, duration };
  },
  
  /**
   * Generate random test data
   */
  generateTestData: {
    student: (count = 1) => {
      return Array.from({ length: count }, (_, i) => ({
        id: `student-${i}`,
        name: `Student ${i}`,
        age: 6 + (i % 7),
        grade_level: String((i % 12) + 1),
        avatar: `avatar${(i % 4) + 1}`,
        learning_style: ['visual', 'auditory', 'kinesthetic'][i % 3],
        interests: ['science', 'art', 'music', 'sports'].slice(0, (i % 3) + 1)
      }));
    },
    
    questions: (count = 1, subject = 'math') => {
      return Array.from({ length: count }, (_, i) => ({
        id: `question-${i}`,
        type: ['numeric', 'multiple_choice', 'true_false'][i % 3],
        question: `Question ${i} for ${subject}`,
        correct_answer: i % 4,
        options: [0, 1, 2, 3],
        difficulty: ['easy', 'medium', 'hard'][i % 3]
      }));
    }
  }
};

// Performance monitoring
let performanceMetrics: any[] = [];

export const performanceMonitor = {
  start: (label: string) => {
    performanceMetrics.push({
      label,
      startTime: performance.now()
    });
  },
  
  end: (label: string) => {
    const metric = performanceMetrics.find(m => m.label === label);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
    }
  },
  
  getMetrics: () => performanceMetrics,
  
  reset: () => {
    performanceMetrics = [];
  },
  
  report: () => {
    console.table(performanceMetrics.map(m => ({
      Label: m.label,
      Duration: `${m.duration?.toFixed(2)}ms`
    })));
  }
};