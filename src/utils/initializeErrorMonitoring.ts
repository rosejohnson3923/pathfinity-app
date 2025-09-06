/**
 * Initialize Error Monitoring
 * Sets up Sentry and error boundaries for production
 */

import sentryIntegration from '../services/monitoring/SentryIntegration';

export function initializeErrorMonitoring(): void {
  // Only initialize in production or staging
  const environment = import.meta.env.VITE_ENVIRONMENT || 'development';
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (environment === 'development' && !import.meta.env.VITE_FORCE_SENTRY) {
    console.log('[ErrorMonitoring] Skipping Sentry in development');
    return;
  }
  
  if (!sentryDsn) {
    console.warn('[ErrorMonitoring] No Sentry DSN provided');
    return;
  }
  
  // Initialize Sentry
  sentryIntegration.initialize({
    dsn: sentryDsn,
    environment: environment as any,
    release: import.meta.env.VITE_APP_VERSION,
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    debug: environment === 'development'
  });
  
  // Set up global error handlers
  setupGlobalErrorHandlers();
  
  console.log(`[ErrorMonitoring] Initialized for ${environment}`);
}

/**
 * Set up global error handlers
 */
function setupGlobalErrorHandlers(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Global] Unhandled promise rejection:', event.reason);
    
    sentryIntegration.captureException(
      new Error(`Unhandled Promise Rejection: ${event.reason}`),
      {
        promise: true,
        reason: event.reason
      },
      'error'
    );
    
    // Prevent default browser behavior
    event.preventDefault();
  });
  
  // Handle global errors
  window.addEventListener('error', (event) => {
    console.error('[Global] Uncaught error:', event.error);
    
    sentryIntegration.captureException(
      event.error || new Error(event.message),
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      },
      'error'
    );
  });
  
  // Track page visibility for session tracking
  document.addEventListener('visibilitychange', () => {
    sentryIntegration.addBreadcrumb(
      `Page ${document.hidden ? 'hidden' : 'visible'}`,
      'navigation',
      { hidden: document.hidden }
    );
  });
  
  // Track online/offline status
  window.addEventListener('online', () => {
    sentryIntegration.addBreadcrumb('Network online', 'network');
  });
  
  window.addEventListener('offline', () => {
    sentryIntegration.addBreadcrumb('Network offline', 'network');
  });
}

/**
 * Wrap async functions with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(`[${context || 'Async'}] Error:`, error);
      
      sentryIntegration.captureException(
        error instanceof Error ? error : new Error(String(error)),
        { context, args },
        'error'
      );
      
      throw error;
    }
  }) as T;
}

/**
 * Create error boundary wrapper
 */
export function createErrorBoundary(componentName: string) {
  return {
    onError: (error: Error, errorInfo: React.ErrorInfo) => {
      console.error(`[ErrorBoundary] ${componentName}:`, error, errorInfo);
      
      sentryIntegration.captureException(
        error,
        {
          component: componentName,
          componentStack: errorInfo.componentStack
        },
        'error'
      );
    }
  };
}