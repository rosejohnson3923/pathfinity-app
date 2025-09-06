/**
 * Sentry Error Monitoring Integration
 * Production-grade error tracking and monitoring
 */

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import MonitoringService from './MonitoringService';

export interface SentryConfig {
  dsn: string;
  environment: 'development' | 'staging' | 'production';
  release?: string;
  tracesSampleRate?: number;
  debug?: boolean;
}

class SentryIntegration {
  private static instance: SentryIntegration;
  private initialized = false;
  private monitoring: MonitoringService;
  
  private constructor() {
    this.monitoring = MonitoringService.getInstance();
  }
  
  static getInstance(): SentryIntegration {
    if (!SentryIntegration.instance) {
      SentryIntegration.instance = new SentryIntegration();
    }
    return SentryIntegration.instance;
  }
  
  /**
   * Initialize Sentry with configuration
   */
  initialize(config: SentryConfig): void {
    if (this.initialized) {
      console.warn('[Sentry] Already initialized');
      return;
    }
    
    try {
      Sentry.init({
        dsn: config.dsn,
        environment: config.environment,
        release: config.release || process.env.VITE_APP_VERSION,
        integrations: [
          new BrowserTracing(),
          new Sentry.Replay({
            maskAllText: false,
            blockAllMedia: false,
            // Capture 10% of all sessions
            sessionSampleRate: 0.1,
            // Capture 100% of sessions with errors
            errorSampleRate: 1.0,
          })
        ],
        
        // Performance Monitoring
        tracesSampleRate: config.tracesSampleRate || 0.1,
        
        // Release Health
        autoSessionTracking: true,
        
        // Debug mode
        debug: config.debug || false,
        
        // Before send hook for filtering
        beforeSend: (event, hint) => {
          return this.beforeSendHook(event, hint);
        },
        
        // Breadcrumb filtering
        beforeBreadcrumb: (breadcrumb, hint) => {
          return this.beforeBreadcrumbHook(breadcrumb, hint);
        }
      });
      
      // Set initial user context
      this.setUserContext();
      
      // Add custom tags
      this.setCustomTags();
      
      this.initialized = true;
      console.log('[Sentry] Initialized successfully');
      
    } catch (error) {
      console.error('[Sentry] Failed to initialize:', error);
      this.monitoring.trackError({
        errorType: 'sentry_init_failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        severity: 'high',
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Filter events before sending to Sentry
   */
  private beforeSendHook(event: Sentry.Event, hint: Sentry.EventHint): Sentry.Event | null {
    // Filter out certain errors
    if (event.exception) {
      const error = hint.originalException;
      
      // Don't send network errors in development
      if (process.env.NODE_ENV === 'development' && 
          error instanceof Error && 
          error.message.includes('NetworkError')) {
        return null;
      }
      
      // Don't send certain console errors
      if (error instanceof Error && 
          (error.message.includes('ResizeObserver loop limit exceeded') ||
           error.message.includes('Non-Error promise rejection captured'))) {
        return null;
      }
    }
    
    // Add additional context
    event.contexts = {
      ...event.contexts,
      app: {
        app_memory: this.getMemoryUsage(),
        session_duration: this.getSessionDuration()
      }
    };
    
    // Also track in our monitoring service
    if (event.exception) {
      this.monitoring.trackError({
        errorType: event.exception.values?.[0]?.type || 'unknown',
        errorMessage: event.exception.values?.[0]?.value || 'Unknown error',
        stackTrace: event.exception.values?.[0]?.stacktrace?.frames?.map(f => f.filename).join('\n'),
        severity: event.level === 'fatal' ? 'critical' : event.level as any,
        context: event.extra,
        timestamp: new Date().toISOString()
      });
    }
    
    return event;
  }
  
  /**
   * Filter breadcrumbs before recording
   */
  private beforeBreadcrumbHook(breadcrumb: Sentry.Breadcrumb, hint?: Sentry.BreadcrumbHint): Sentry.Breadcrumb | null {
    // Filter out noisy breadcrumbs
    if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
      return null;
    }
    
    // Don't record sensitive data
    if (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') {
      if (breadcrumb.data?.url?.includes('/api/auth')) {
        // Sanitize auth requests
        breadcrumb.data = {
          ...breadcrumb.data,
          request_body: '[REDACTED]',
          response_body: '[REDACTED]'
        };
      }
    }
    
    return breadcrumb;
  }
  
  /**
   * Set user context for error tracking
   */
  setUserContext(userId?: string, email?: string, username?: string): void {
    const userData = userId ? {
      id: userId,
      email: email,
      username: username
    } : this.getCurrentUser();
    
    if (userData) {
      Sentry.setUser(userData);
    }
  }
  
  /**
   * Set custom tags for categorization
   */
  setCustomTags(): void {
    Sentry.setTags({
      app_version: process.env.VITE_APP_VERSION || 'unknown',
      browser: this.getBrowserInfo(),
      screen_size: `${window.screen.width}x${window.screen.height}`,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      connection_type: (navigator as any).connection?.effectiveType || 'unknown'
    });
  }
  
  /**
   * Capture exception with context
   */
  captureException(
    error: Error,
    context?: Record<string, any>,
    level: Sentry.SeverityLevel = 'error'
  ): string {
    const eventId = Sentry.captureException(error, {
      level,
      contexts: {
        custom: context
      },
      tags: {
        component: context?.component,
        action: context?.action
      }
    });
    
    return eventId;
  }
  
  /**
   * Capture message with context
   */
  captureMessage(
    message: string,
    level: Sentry.SeverityLevel = 'info',
    context?: Record<string, any>
  ): string {
    const eventId = Sentry.captureMessage(message, {
      level,
      contexts: {
        custom: context
      }
    });
    
    return eventId;
  }
  
  /**
   * Add breadcrumb for tracking user actions
   */
  addBreadcrumb(
    message: string,
    category: string,
    data?: Record<string, any>,
    level: Sentry.SeverityLevel = 'info'
  ): void {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
      timestamp: Date.now() / 1000
    });
  }
  
  /**
   * Start a transaction for performance monitoring
   */
  startTransaction(name: string, op: string): Sentry.Transaction {
    return Sentry.startTransaction({
      name,
      op,
      data: {
        start_time: Date.now()
      }
    });
  }
  
  /**
   * Wrap component with error boundary
   */
  withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: React.ComponentType<any>,
    showDialog?: boolean
  ): React.ComponentType<P> {
    return Sentry.withErrorBoundary(Component, {
      fallback: fallback || this.getDefaultFallback(),
      showDialog: showDialog || false,
      onError: (error, componentStack, eventId) => {
        console.error('[ErrorBoundary] Component error:', error);
        
        // Track in our monitoring
        this.monitoring.trackError({
          errorType: 'react_error_boundary',
          errorMessage: error.message,
          stackTrace: componentStack,
          severity: 'high',
          context: { eventId },
          timestamp: new Date().toISOString()
        });
      }
    });
  }
  
  /**
   * Profile a component for performance
   */
  withProfiler<P extends object>(
    Component: React.ComponentType<P>,
    name?: string
  ): React.ComponentType<P> {
    return Sentry.withProfiler(Component, { name });
  }
  
  /**
   * Get default error fallback component
   */
  private getDefaultFallback(): React.ComponentType {
    return () => {
      const errorStyles = {
        padding: '20px',
        textAlign: 'center' as const,
        backgroundColor: '#f8f8f8',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        margin: '20px'
      };
      
      return React.createElement('div', { style: errorStyles }, [
        React.createElement('h2', { key: 'title' }, '⚠️ Something went wrong'),
        React.createElement('p', { key: 'message' }, 'We\'ve been notified and are working on a fix.'),
        React.createElement('button', {
          key: 'reload',
          onClick: () => window.location.reload(),
          style: {
            padding: '10px 20px',
            marginTop: '10px',
            backgroundColor: '#007AFF',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }
        }, 'Reload Page')
      ]);
    };
  }
  
  /**
   * Helper methods
   */
  private getCurrentUser(): { id: string; email?: string; username?: string } | null {
    const userData = localStorage.getItem('pathfinity_user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return {
          id: user.id || user.email,
          email: user.email,
          username: user.display_name || user.name
        };
      } catch {
        return null;
      }
    }
    return null;
  }
  
  private getBrowserInfo(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }
  
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }
  
  private getSessionDuration(): number {
    const startTime = sessionStorage.getItem('session_start');
    if (startTime) {
      return Date.now() - parseInt(startTime);
    }
    return 0;
  }
}

export const sentryIntegration = SentryIntegration.getInstance();
export default sentryIntegration;