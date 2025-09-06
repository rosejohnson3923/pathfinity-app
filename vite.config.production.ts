import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import obfuscator from 'rollup-plugin-obfuscator';
import compression from 'vite-plugin-compression';

// Production-specific configuration with IP protection
export default defineConfig({
  plugins: [
    react(),
    // Gzip compression for smaller bundles
    compression({
      algorithm: 'gzip',
      threshold: 10240, // Only compress files larger than 10kb
    }),
    // Brotli compression for modern browsers
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    minify: 'terser', // Use terser for better minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
      },
      mangle: {
        properties: {
          regex: /^_/, // Mangle properties starting with underscore
        },
      },
      format: {
        comments: false, // Remove all comments
      },
    },
    rollupOptions: {
      plugins: [
        obfuscator({
          // JavaScript obfuscation settings
          compact: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.75,
          deadCodeInjection: true,
          deadCodeInjectionThreshold: 0.4,
          debugProtection: true,
          debugProtectionInterval: 2000,
          disableConsoleOutput: true,
          domainLock: [
            'pathfinity.ai',
            'www.pathfinity.ai',
            'app.pathfinity.ai',
            'localhost', // Remove in final production
          ],
          identifierNamesGenerator: 'hexadecimal',
          log: false,
          numbersToExpressions: true,
          renameGlobals: false, // Set to true for maximum protection (may break some code)
          selfDefending: true,
          simplify: true,
          splitStrings: true,
          splitStringsChunkLength: 10,
          stringArray: true,
          stringArrayCallsTransform: true,
          stringArrayCallsTransformThreshold: 0.75,
          stringArrayEncoding: ['base64'],
          stringArrayIndexShift: true,
          stringArrayRotate: true,
          stringArrayShuffle: true,
          stringArrayWrappersCount: 2,
          stringArrayWrappersChainedCalls: true,
          stringArrayWrappersParametersMaxCount: 4,
          stringArrayWrappersType: 'function',
          stringArrayThreshold: 0.75,
          transformObjectKeys: true,
          unicodeEscapeSequence: false,
        }),
      ],
      output: {
        // Chunk splitting for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', 'framer-motion'],
          'utils': ['date-fns', 'clsx'],
        },
        // Hash filenames for cache busting
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
    // Production source maps (set to false for maximum security)
    sourcemap: false,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  // Environment variable prefix
  envPrefix: 'VITE_',
  server: {
    port: 3000,
  },
});