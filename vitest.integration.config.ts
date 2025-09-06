/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.integration.ts'],
    
    // Integration test configuration
    timeout: 30000, // 30 seconds for real API calls
    testTimeout: 45000, // 45 seconds for complex integration tests
    hookTimeout: 15000, // 15 seconds for setup/teardown
    
    // Parallel testing but limited for API rate limits
    threads: false, // Disable for API testing to avoid rate limits
    
    // Integration test patterns
    include: [
      'src/**/*.integration.test.{js,ts,tsx}',
      'src/integration-tests/**/*.{js,ts,tsx}'
    ],
    
    // Exclude only what we don't want
    exclude: [
      'node_modules/',
      'dist/',
      'build/',
      '**/*.config.{js,ts}',
      'scripts/',
      'documentation/'
    ],

    // Integration test specific settings
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
      include: [
        'src/services/**/*.ts',
        'src/components/**/*.tsx'
      ],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.integration.test.{ts,tsx}',
        'src/test-setup*.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils')
    }
  }
});