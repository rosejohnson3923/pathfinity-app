/**
 * PATHFINITY TEST SETUP
 * Global test configuration and mocks for AI education platform
 */

import '@testing-library/jest-dom';
// import { server } from './mocks/server'; // Disabled for now

// ================================================================
// TESTING LIBRARY CONFIGURATION
// ================================================================

// configure({
//   testIdAttribute: 'data-testid',
//   asyncUtilTimeout: 5000,
//   computedStyleSupportsPseudoElements: true
// });

// ================================================================
// GLOBAL MOCKS
// ================================================================

// Mock console methods to reduce noise in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('deprecated') || args[0].includes('Warning:'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// ================================================================
// WEB APIs MOCKS
// ================================================================

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return undefined; }
  disconnect() { return undefined; }
  unobserve() { return undefined; }
  takeRecords() { return []; }
  root = null;
  rootMargin = '';
  thresholds = [];
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() { return undefined; }
  disconnect() { return undefined; }
  unobserve() { return undefined; }
} as any;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock
});

// ================================================================
// THREE.JS MOCKS
// ================================================================

// Mock WebGL context
const mockWebGLContext = {
  getExtension: jest.fn(),
  getParameter: jest.fn(() => 4096),
  createShader: jest.fn(),
  shaderSource: jest.fn(),
  compileShader: jest.fn(),
  getShaderParameter: jest.fn(() => true),
  createProgram: jest.fn(),
  attachShader: jest.fn(),
  linkProgram: jest.fn(),
  getProgramParameter: jest.fn(() => true),
  useProgram: jest.fn(),
  createBuffer: jest.fn(),
  bindBuffer: jest.fn(),
  bufferData: jest.fn(),
  getAttribLocation: jest.fn(() => 0),
  enableVertexAttribArray: jest.fn(),
  vertexAttribPointer: jest.fn(),
  drawArrays: jest.fn(),
  viewport: jest.fn(),
  clearColor: jest.fn(),
  clear: jest.fn(),
  enable: jest.fn(),
  depthFunc: jest.fn(),
  DEPTH_TEST: 0x0B71,
  COLOR_BUFFER_BIT: 0x00004000,
  DEPTH_BUFFER_BIT: 0x00000100,
  ARRAY_BUFFER: 0x8892,
  STATIC_DRAW: 0x88E4,
  VERTEX_SHADER: 0x8B31,
  FRAGMENT_SHADER: 0x8B30,
  COMPILE_STATUS: 0x8B81,
  LINK_STATUS: 0x8B82,
  TRIANGLES: 0x0004,
  FLOAT: 0x1406,
  LEQUAL: 0x0203
};

HTMLCanvasElement.prototype.getContext = jest.fn((contextType) => {
  if (contextType === 'webgl' || contextType === 'webgl2') {
    return mockWebGLContext;
  }
  return null;
}) as any;

// ================================================================
// AUDIO CONTEXT MOCK
// ================================================================

global.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn().mockReturnValue({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { value: 0 }
  }),
  createGain: jest.fn().mockReturnValue({
    connect: jest.fn(),
    gain: { value: 0 }
  }),
  destination: {}
}));

// ================================================================
// FETCH MOCK SETUP
// ================================================================

// Enable API mocking before tests
// beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers between tests
// afterEach(() => server.resetHandlers());

// Clean up after tests
// afterAll(() => server.close());

// ================================================================
// REACT TESTING UTILITIES
// ================================================================

// import { render, RenderOptions } from '@testing-library/react';
// import React, { ReactElement } from 'react';
// import { BrowserRouter } from 'react-router-dom';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a custom render function with providers
// const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const queryClient = new QueryClient({
//     defaultOptions: {
//       queries: {
//         retry: false,
//         gcTime: 0,
//       },
//       mutations: {
//         retry: false,
//       },
//     },
//   });

//   return (
//     <QueryClientProvider client={queryClient}>
//       <BrowserRouter>
//         {children}
//       </BrowserRouter>
//     </QueryClientProvider>
//   );
// };

// const customRender = (
//   ui: ReactElement,
//   options?: Omit<RenderOptions, 'wrapper'>
// ) => render(ui, { wrapper: AllTheProviders, ...options });

// // Re-export everything
// export * from '@testing-library/react';
// export { customRender as render };

// ================================================================
// TEST UTILITIES
// ================================================================

// Utility to create mock user for testing
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@pathfinity.ai',
  role: 'student',
  firstName: 'Test',
  lastName: 'User',
  gradeLevel: 'K',
  isActive: true,
  ...overrides
});

// Utility to create mock student profile
export const createMockStudentProfile = (overrides = {}) => ({
  id: 'test-profile-id',
  studentId: 'test-user-id',
  firstName: 'Test',
  lastName: 'Student',
  displayName: 'Test Student',
  gradeLevel: 'K',
  learningStyle: 'visual',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

// Utility to create mock assessment
export const createMockAssessment = (overrides = {}) => ({
  id: 'test-assessment-id',
  title: 'Test Assessment',
  assessmentType: 'diagnostic',
  gradeLevel: 'K',
  subject: 'Math',
  skill: 'counting',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What is 2 + 2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: '4'
    }
  ],
  status: 'created',
  isActive: true,
  ...overrides
});

// Utility to create mock learning event
export const createMockLearningEvent = (overrides = {}) => ({
  id: 'test-event-id',
  studentId: 'test-user-id',
  sessionId: 'test-session-id',
  eventType: 'lesson_complete',
  subject: 'Math',
  skill: 'counting',
  masteryScore: 85,
  createdAt: new Date(),
  ...overrides
});

// Utility to wait for async operations
export const waitForAsyncOperation = () => 
  new Promise(resolve => setTimeout(resolve, 0));

// Utility to simulate AI character response
export const mockAICharacterResponse = (character: string, response: string) => ({
  character,
  response,
  timestamp: new Date(),
  tokens: 150,
  cost: 0.002
});

// ================================================================
// ENVIRONMENT VARIABLES FOR TESTING
// ================================================================

process.env.NODE_ENV = 'test';
process.env.REACT_APP_API_BASE_URL = 'http://localhost:3000/api';
process.env.REACT_APP_WS_URL = 'ws://localhost:3000';

// ================================================================
// GLOBAL TEST CONSTANTS
// ================================================================

export const TEST_CONSTANTS = {
  TIMEOUT: {
    SHORT: 1000,
    MEDIUM: 5000,
    LONG: 10000
  },
  GRADE_LEVELS: ['PRE-K', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  SUBJECTS: ['Math', 'ELA', 'Science', 'Social Studies'],
  AI_CHARACTERS: ['finn', 'sage', 'spark', 'harmony'],
  LEARNING_STYLES: ['visual', 'auditory', 'kinesthetic', 'mixed']
};

// ================================================================
// ERROR HANDLING FOR TESTS
// ================================================================

// Suppress specific console errors in tests
const originalConsoleError = console.error;
console.error = (...args) => {
  const suppressedMessages = [
    'Warning: ReactDOM.render is no longer supported',
    'Warning: React.createFactory() is deprecated',
    'Warning: componentWillReceiveProps',
    'Warning: componentWillMount',
    'Warning: componentWillUpdate'
  ];
  
  if (suppressedMessages.some(message => 
    args.some(arg => typeof arg === 'string' && arg.includes(message)))) {
    return;
  }
  
  originalConsoleError.apply(console, args);
};

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('✅ Pathfinity test environment initialized');