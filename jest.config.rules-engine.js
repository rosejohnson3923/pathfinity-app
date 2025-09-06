/**
 * Jest Configuration for AIRulesEngine Testing
 * Includes coverage reporting and test suite organization
 */

module.exports = {
  displayName: 'AIRulesEngine Tests',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/rules-engine'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx'
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/rules-engine/**/*.{ts,tsx}',
    '!src/rules-engine/**/*.test.{ts,tsx}',
    '!src/rules-engine/__tests__/**',
    '!src/rules-engine/**/*.d.ts',
    '!src/rules-engine/index.ts'
  ],
  coverageDirectory: 'coverage/rules-engine',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/rules-engine/core/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/rules-engine/containers/LearnAIRulesEngine.ts': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },
  
  // Test suite organization
  projects: [
    {
      displayName: 'Unit Tests',
      testMatch: [
        '<rootDir>/src/rules-engine/__tests__/*.test.ts'
      ]
    },
    {
      displayName: 'Integration Tests',
      testMatch: [
        '<rootDir>/src/rules-engine/__tests__/integration/*.test.ts'
      ]
    },
    {
      displayName: 'Performance Tests',
      testMatch: [
        '<rootDir>/src/rules-engine/__tests__/performance/*.test.ts'
      ]
    }
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/src/rules-engine/__tests__/setup.ts'],
  
  // Global test timeout
  testTimeout: 10000,
  
  // Verbose output for debugging
  verbose: true,
  
  // Watch mode settings
  watchPathIgnorePatterns: [
    'node_modules',
    'coverage',
    'dist',
    'build'
  ]
};