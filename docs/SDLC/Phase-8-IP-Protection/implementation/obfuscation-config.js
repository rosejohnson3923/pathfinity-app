/**
 * Pathfinity™ Code Obfuscation Configuration
 * © 2024 Pathfinity Inc. - Proprietary and Confidential
 * 
 * This configuration protects our code from reverse engineering
 */

const JavaScriptObfuscator = require('webpack-obfuscator');

// Obfuscation settings for production builds
const obfuscationConfig = {
  // High obfuscation preset (maximum protection)
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 1,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 1,
  debugProtection: true,
  debugProtectionInterval: 4000,
  disableConsoleOutput: true,
  domainLock: [
    'pathfinity.com',
    'www.pathfinity.com',
    'app.pathfinity.com'
  ],
  domainLockRedirectUrl: 'https://pathfinity.com/security-violation',
  identifierNamesGenerator: 'hexadecimal',
  log: false,
  numbersToExpressions: true,
  renameGlobals: true,
  selfDefending: true,
  simplify: true,
  splitStrings: true,
  splitStringsChunkLength: 5,
  stringArray: true,
  stringArrayCallsTransform: true,
  stringArrayCallsTransformThreshold: 1,
  stringArrayEncoding: ['rc4'],
  stringArrayIndexShift: true,
  stringArrayRotate: true,
  stringArrayShuffle: true,
  stringArrayWrappersCount: 5,
  stringArrayWrappersChainedCalls: true,
  stringArrayWrappersParametersMaxCount: 5,
  stringArrayWrappersType: 'function',
  stringArrayThreshold: 1,
  transformObjectKeys: true,
  unicodeEscapeSequence: false
};

// Webpack configuration
module.exports = {
  plugins: [
    new JavaScriptObfuscator(obfuscationConfig, ['excluded_bundle_name.js'])
  ]
};

// Alternative: Using javascript-obfuscator directly
const alternativeConfig = {
  // Install: npm install --save-dev javascript-obfuscator
  
  // Basic protection (faster build, less protection)
  basic: {
    compact: true,
    simplify: true,
    stringArray: true,
    stringArrayThreshold: 0.75,
    deadCodeInjection: false,
    debugProtection: false
  },
  
  // Medium protection (balanced)
  medium: {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: true,
    debugProtectionInterval: false,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: false,
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 2,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 4,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 0.75,
    transformObjectKeys: true
  },
  
  // Maximum protection (slower build, maximum security)
  maximum: obfuscationConfig
};

// Terser configuration for additional minification
const terserConfig = {
  terserOptions: {
    parse: {
      ecma: 8,
    },
    compress: {
      ecma: 5,
      warnings: false,
      comparisons: false,
      inline: 2,
      drop_console: true,
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
    },
    mangle: {
      safari10: true,
      properties: {
        regex: /^_/,  // Mangle properties starting with _
      }
    },
    output: {
      ecma: 5,
      comments: false,
      ascii_only: true,
    },
  },
};

// Create React App configuration override
// Install: npm install --save-dev react-app-rewired customize-cra
const { override, addWebpackPlugin } = require('customize-cra');

const productionConfig = override(
  process.env.NODE_ENV === 'production' && 
  addWebpackPlugin(
    new JavaScriptObfuscator(obfuscationConfig, [
      'static/js/runtime-main.*.js',  // Exclude runtime
    ])
  )
);

// Webpack 5 configuration
const webpack5Config = {
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(terserConfig),
    ],
  },
  plugins: [
    new JavaScriptObfuscator(obfuscationConfig, []),
    new webpack.BannerPlugin({
      banner: 'Pathfinity™ © 2024 - Proprietary and Confidential',
      entryOnly: false,
    })
  ]
};

// Files to exclude from obfuscation
const excludePatterns = [
  'node_modules/**',
  '**/*.test.js',
  '**/*.spec.js',
  '**/serviceWorker.js',
  '**/setupTests.js',
];

// Environment-specific configuration
const getConfigByEnvironment = () => {
  switch(process.env.NODE_ENV) {
    case 'development':
      return {}; // No obfuscation in development
    case 'staging':
      return alternativeConfig.medium;
    case 'production':
      return alternativeConfig.maximum;
    default:
      return alternativeConfig.basic;
  }
};

// Export configurations
module.exports = {
  obfuscationConfig,
  terserConfig,
  productionConfig,
  webpack5Config,
  excludePatterns,
  getConfigByEnvironment,
  alternativeConfig
};

// Usage instructions:
/*
1. Install dependencies:
   npm install --save-dev webpack-obfuscator javascript-obfuscator terser-webpack-plugin

2. For Create React App (without ejecting):
   npm install --save-dev react-app-rewired customize-cra
   
   Create config-overrides.js:
   ```javascript
   const { obfuscationConfig } = require('./obfuscation-config');
   const JavaScriptObfuscator = require('webpack-obfuscator');
   
   module.exports = function override(config, env) {
     if (env === 'production') {
       config.plugins.push(
         new JavaScriptObfuscator(obfuscationConfig)
       );
     }
     return config;
   };
   ```
   
   Update package.json scripts:
   ```json
   "scripts": {
     "start": "react-app-rewired start",
     "build": "react-app-rewired build",
     "test": "react-app-rewired test"
   }
   ```

3. For custom Webpack setup:
   Import and use webpack5Config directly

4. Test obfuscation:
   npm run build
   Check /build/static/js/*.js files

5. Verify protection:
   - Open obfuscated files
   - Confirm code is unreadable
   - Test application still works
*/