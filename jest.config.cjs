/**
 * PATHFINITY JEST CONFIGURATION
 * Comprehensive testing setup for AI education platform
 */

module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/src/testing/setupTests.ts'
  ],
  
  // Module name mapping for absolute imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@data/(.*)$': '<rootDir>/src/data/$1',
    '^@agents/(.*)$': '<rootDir>/src/agents/$1',
    '^@testing/(.*)$': '<rootDir>/src/testing/$1',
    // CSS and asset mocking
    '\\.(css|less|scss|sass)$': 'jest-transform-stub',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub'
  },
  
  // File extensions to consider
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json'
  ],
  
  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        jsx: 'react',
        module: 'commonjs',
        target: 'es2020'
      }
    }],
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.css$': 'jest-transform-stub',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'jest-transform-stub'
  },
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    'node_modules/(?!(three|@react-three|drei)/)'
  ],
  
  // Test match patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx|js)'
  ],
  
  // Files to ignore
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/testing/**/*',
    '!src/**/__tests__/**/*',
    '!src/**/*.test.*',
    '!src/**/*.spec.*',
    '!src/index.tsx',
    '!src/reportWebVitals.ts'
  ],
  
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/services/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    },
    './src/agents/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Test projects for different test types - commented out to allow all tests
  // projects: [
  //   {
  //     displayName: 'unit',
  //     testMatch: ['<rootDir>/src/**/*.unit.(test|spec).(ts|tsx|js)'],
  //     testEnvironment: 'jsdom'
  //   },
  //   {
  //     displayName: 'integration',
  //     testMatch: ['<rootDir>/src/**/*.integration.(test|spec).(ts|tsx|js)'],
  //     testEnvironment: 'node'
  //   },
  //   {
  //     displayName: 'e2e',
  //     testMatch: ['<rootDir>/src/**/*.e2e.(test|spec).(ts|tsx|js)'],
  //     testEnvironment: 'node'
  //   }
  // ],
  
  // Global configuration - removed deprecated ts-jest config
  
  // Module directories
  moduleDirectories: [
    'node_modules',
    '<rootDir>/src'
  ],
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Watch plugins
  // watchPlugins: [
  //   'jest-watch-typeahead/filename',
  //   'jest-watch-typeahead/testname'
  // ],
  
  // Reporters
  reporters: [
    'default'
  ]
};