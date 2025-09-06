/**
 * INTEGRATION TEST SETUP
 * Configuration for testing with real Azure Key Vault and OpenAI services
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Verify Azure credentials are available for integration tests
const requiredEnvVars = [
  'VITE_AZURE_OPENAI_API_KEY',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn('⚠️  Integration tests may fail - missing environment variables:', missingVars);
  console.warn('Make sure .env.local has your Azure Key Vault credentials');
}

// Mock only browser-specific APIs that don't exist in test environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Canvas API (since integration tests focus on API responses, not UI rendering)
const mockCanvas = {
  getContext: vi.fn(() => ({
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 100 })),
    save: vi.fn(),
    restore: vi.fn()
  })),
  toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
  getBoundingClientRect: vi.fn(() => ({
    top: 0, left: 0, bottom: 100, right: 100,
    width: 100, height: 100, x: 0, y: 0, toJSON: vi.fn()
  }))
};

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: mockCanvas.getContext,
  writable: true
});

Object.defineProperty(HTMLCanvasElement.prototype, 'toDataURL', {
  value: mockCanvas.toDataURL,
  writable: true
});

Object.defineProperty(HTMLCanvasElement.prototype, 'getBoundingClientRect', {
  value: mockCanvas.getBoundingClientRect,
  writable: true
});

// DO NOT mock the following for integration tests:
// - fetch (we want real HTTP requests)
// - speechSynthesis (we want real speech API testing)
// - Azure OpenAI SDK (we want real API calls)

// Console setup for integration test output
const originalLog = console.log;
const originalError = console.error;

beforeAll(() => {
  // Filter out noisy logs but keep important ones
  console.log = (...args: any[]) => {
    const message = args[0];
    if (typeof message === 'string') {
      if (
        message.includes('🤖') || // AI character logs
        message.includes('🔊') || // Voice logs
        message.includes('✅') || // Success logs
        message.includes('❌') || // Error logs
        message.includes('🔒') || // Security logs
        message.includes('Integration test')
      ) {
        originalLog.call(console, ...args);
      }
    }
  };
  
  console.error = (...args: any[]) => {
    // Always show errors
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.log = originalLog;
  console.error = originalError;
});

// Integration test utilities
export const integrationTestUtils = {
  /**
   * Wait for async operations with timeout
   */
  waitWithTimeout: async (promise: Promise<any>, timeoutMs: number = 10000): Promise<any> => {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  },

  /**
   * Validate real Azure OpenAI response structure
   */
  validateAzureResponse: (response: any): boolean => {
    if (!response) return false;
    
    // Real Azure responses should have specific structure
    const requiredFields = ['_character', 'instructions', 'educationalValue'];
    return requiredFields.some(field => field in response);
  },

  /**
   * Check if we're in CI environment (may need different timeouts)
   */
  isCI: (): boolean => {
    return !!(process.env.CI || process.env.GITHUB_ACTIONS || process.env.NETLIFY);
  },

  /**
   * Get test timeouts based on environment
   */
  getTimeouts: () => {
    const isCI = integrationTestUtils.isCI();
    return {
      apiCall: isCI ? 30000 : 15000,     // API call timeout
      aiGeneration: isCI ? 45000 : 30000, // AI content generation timeout
      safety: isCI ? 20000 : 10000        // Safety check timeout
    };
  }
};

// Global test configuration
(global as any).integrationTestUtils = integrationTestUtils;

// Rate limiting for API calls
let lastApiCall = 0;
const API_RATE_LIMIT = 1000; // 1 second between calls

export const rateLimitedApiCall = async <T>(apiCall: () => Promise<T>): Promise<T> => {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  
  if (timeSinceLastCall < API_RATE_LIMIT) {
    const waitTime = API_RATE_LIMIT - timeSinceLastCall;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastApiCall = Date.now();
  return apiCall();
};

// Test environment validation
export const validateTestEnvironment = (): void => {
  const required = ['VITE_AZURE_OPENAI_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Integration tests require environment variables: ${missing.join(', ')}`);
  }
  
  console.log('✅ Integration test environment validated');
};