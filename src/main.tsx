import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ProtectedApp } from './security/ProtectedApp';
import SentryIntegration from './services/monitoring/SentryIntegration';
import { fixRootWidth } from './utils/fixRootWidth';
import './index.css';
import './styles/theme.css';
import './styles/responsive-constraints.css';
import './styles/category-width-management.css';

// Apply root width fix immediately
fixRootWidth();

// Import testing helpers for development
if (import.meta.env.DEV) {
  import('./utils/TestingHelpers');
  import('./utils/QuestionTypeTracker');
}

// PathIQ™ Protected Application Entry Point
// Copyright (c) 2024 Esposure Inc. All rights reserved.

// Initialize Sentry for error monitoring in production (only if valid DSN)
if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN && 
    !import.meta.env.VITE_SENTRY_DSN.includes('YOUR_SENTRY_DSN_HERE')) {
  try {
    SentryIntegration.getInstance().initialize({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: 'production',
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
      tracesSampleRate: 0.1,
      debug: false
    });
  } catch (error) {
    console.warn('Sentry initialization skipped:', error);
  }
}

// Get license key from environment or config
const LICENSE_KEY = import.meta.env.VITE_PATHIQ_LICENSE_KEY;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProtectedApp licenseKey={LICENSE_KEY}>
      <App />
    </ProtectedApp>
  </StrictMode>
);
