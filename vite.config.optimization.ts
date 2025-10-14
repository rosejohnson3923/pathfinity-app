/**
 * Vite Configuration - Performance Optimizations
 * Optimized build configuration for Discovered Live!
 *
 * Features:
 * - Code splitting
 * - Tree shaking
 * - Minification
 * - Bundle analysis
 * - Caching strategy
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import { splitVendorChunkPlugin } from 'vite';

export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Babel plugins for optimization
      babel: {
        plugins: [
          // Remove console.log in production
          process.env.NODE_ENV === 'production' && [
            'transform-remove-console',
            { exclude: ['error', 'warn'] },
          ],
        ].filter(Boolean),
      },
    }),

    // Split vendor chunks
    splitVendorChunkPlugin(),

    // Compression (gzip and brotli)
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),

    // Bundle analyzer (run with ANALYZE=true npm run build)
    process.env.ANALYZE &&
      visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),

  build: {
    // Target modern browsers
    target: 'es2015',

    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug'],
      },
      mangle: {
        safari10: true,
      },
    },

    // Source maps for production debugging
    sourcemap: process.env.NODE_ENV === 'production' ? 'hidden' : true,

    // Chunk size warnings
    chunkSizeWarningLimit: 500,

    // Rollup options for advanced code splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting
        manualChunks: {
          // React and core libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // Animation library
          'framer-motion': ['framer-motion'],

          // Supabase
          'supabase': ['@supabase/supabase-js'],

          // UI icons
          'lucide-icons': ['lucide-react'],

          // Discovered Live core services
          'dl-services': [
            './src/services/GameOrchestrator.ts',
            './src/services/PerpetualRoomScheduler.ts',
            './src/services/DiscoveredLiveRealtimeService.ts',
          ],

          // Discovered Live components (lazy loaded)
          'dl-multiplayer': [
            './src/components/discovered-live/MultiplayerCard.tsx',
            './src/components/discovered-live/PlayerStatusBar.tsx',
            './src/components/discovered-live/QuestionTimer.tsx',
          ],

          // Discovered Live results and spectator (lazy loaded)
          'dl-secondary': [
            './src/components/discovered-live/MultiplayerResults.tsx',
            './src/components/discovered-live/SpectatorView.tsx',
          ],
        },

        // Naming strategy for chunks
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()
            : 'chunk';
          return `assets/[name]-[hash].js`;
        },

        // Asset naming
        assetFileNames: 'assets/[name]-[hash][extname]',

        // Entry naming
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },

    // CSS code splitting
    cssCodeSplit: true,

    // Report compressed size
    reportCompressedSize: true,

    // Optimize deps
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      '@supabase/supabase-js',
      'lucide-react',
    ],
    exclude: [
      // Exclude large dependencies that should be lazy loaded
      'canvas-confetti',
    ],
  },

  // Server options
  server: {
    // Enable HMR
    hmr: true,

    // Port
    port: 3000,

    // Proxy API requests (if needed)
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },

  // Preview options
  preview: {
    port: 3000,
  },

  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },

  // CSS options
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
    postcss: {
      plugins: [
        // PurgeCSS to remove unused CSS
        process.env.NODE_ENV === 'production' && {
          content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
          defaultExtractor: (content: string) =>
            content.match(/[A-Za-z0-9-_:/]+/g) || [],
        },
      ].filter(Boolean),
    },
  },
});
