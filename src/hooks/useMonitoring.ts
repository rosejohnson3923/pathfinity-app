/**
 * useMonitoring Hook
 * React hook for integrating monitoring and analytics into components
 */

import { useEffect, useCallback, useRef } from 'react';
import MonitoringService from '../services/monitoring/MonitoringService';
import AnalyticsService from '../services/monitoring/AnalyticsService';

interface MonitoringOptions {
  componentName: string;
  trackMountTime?: boolean;
  trackInteractions?: boolean;
  trackErrors?: boolean;
}

interface PerformanceTimer {
  start: () => void;
  end: (eventName?: string) => number;
}

export function useMonitoring(options: MonitoringOptions) {
  const monitoring = useRef(MonitoringService.getInstance());
  const analytics = useRef(AnalyticsService.getInstance());
  const mountTime = useRef<number>(0);
  const timers = useRef<Map<string, number>>(new Map());
  
  // Track component mount time
  useEffect(() => {
    if (options.trackMountTime) {
      mountTime.current = performance.now();
      
      return () => {
        const unmountTime = performance.now() - mountTime.current;
        monitoring.current.trackPerformance({
          metricName: `${options.componentName}_lifetime`,
          value: unmountTime,
          unit: 'ms'
        });
      };
    }
  }, [options.componentName, options.trackMountTime]);
  
  // Track errors
  useEffect(() => {
    if (options.trackErrors) {
      const handleError = (event: ErrorEvent) => {
        monitoring.current.trackError({
          errorType: 'component_error',
          errorMessage: event.message,
          stackTrace: event.error?.stack,
          context: {
            component: options.componentName,
            filename: event.filename,
            lineno: event.lineno
          },
          severity: 'high',
          timestamp: new Date().toISOString()
        });
      };
      
      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }
  }, [options.componentName, options.trackErrors]);
  
  // Track performance timing
  const startTiming = useCallback((label: string): PerformanceTimer => {
    const timerLabel = `${options.componentName}_${label}`;
    timers.current.set(timerLabel, performance.now());
    
    return {
      start: () => {
        timers.current.set(timerLabel, performance.now());
      },
      end: (eventName?: string) => {
        const startTime = timers.current.get(timerLabel);
        if (startTime) {
          const duration = performance.now() - startTime;
          monitoring.current.trackPerformance({
            metricName: eventName || timerLabel,
            value: duration,
            unit: 'ms'
          });
          timers.current.delete(timerLabel);
          return duration;
        }
        return 0;
      }
    };
  }, [options.componentName]);
  
  // Track user interaction
  const trackInteraction = useCallback((
    interactionType: string,
    metadata?: Record<string, any>
  ) => {
    if (options.trackInteractions) {
      monitoring.current.trackUsage(`${options.componentName}_${interactionType}`, metadata);
    }
  }, [options.componentName, options.trackInteractions]);
  
  // Track question answered
  const trackQuestionAnswered = useCallback((
    questionType: string,
    isCorrect: boolean,
    timeSpent: number,
    attempts?: number,
    metadata?: Record<string, any>
  ) => {
    analytics.current.trackQuestionAnswered(
      questionType,
      isCorrect,
      timeSpent,
      attempts,
      {
        ...metadata,
        component: options.componentName
      }
    );
  }, [options.componentName]);
  
  // Track skill completion
  const trackSkillCompleted = useCallback((
    skillId: string,
    score: number,
    timeSpent: number,
    metadata?: Record<string, any>
  ) => {
    analytics.current.trackSkillCompleted(
      skillId,
      score,
      timeSpent,
      {
        ...metadata,
        component: options.componentName
      }
    );
  }, [options.componentName]);
  
  // Track container completion
  const trackContainerFinished = useCallback((
    containerType: string,
    questionsAnswered: number,
    correctAnswers: number,
    timeSpent: number
  ) => {
    analytics.current.trackContainerFinished(
      containerType,
      questionsAnswered,
      correctAnswers,
      timeSpent
    );
  }, []);
  
  // Track question type detection
  const trackQuestionDetection = useCallback((
    questionText: string,
    detectedType: string,
    expectedType: string,
    confidence?: number
  ) => {
    const isCorrect = detectedType === expectedType;
    
    monitoring.current.trackQuestionDetection(
      questionText,
      detectedType,
      expectedType,
      isCorrect,
      confidence
    );
    
    // Track as business metric
    monitoring.current.trackBusinessMetric(
      'question_type_detection',
      isCorrect ? 100 : 0,
      {
        component: options.componentName,
        detectedType,
        expectedType,
        confidence
      }
    );
  }, [options.componentName]);
  
  // Track performance metric
  const trackPerformance = useCallback((
    metricName: string,
    value: number,
    unit: 'ms' | 'bytes' | 'count' | 'percentage' = 'ms',
    threshold?: number
  ) => {
    monitoring.current.trackPerformance({
      metricName: `${options.componentName}_${metricName}`,
      value,
      unit,
      threshold
    });
  }, [options.componentName]);
  
  // Track business metric
  const trackBusinessMetric = useCallback((
    metricName: string,
    value: number,
    metadata?: Record<string, any>
  ) => {
    monitoring.current.trackBusinessMetric(
      `${options.componentName}_${metricName}`,
      value,
      metadata
    );
  }, [options.componentName]);
  
  // Track error
  const trackError = useCallback((
    errorType: string,
    errorMessage: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    context?: Record<string, any>
  ) => {
    monitoring.current.trackError({
      errorType: `${options.componentName}_${errorType}`,
      errorMessage,
      severity,
      context: {
        ...context,
        component: options.componentName
      },
      timestamp: new Date().toISOString()
    });
  }, [options.componentName]);
  
  // Get engagement metrics
  const getEngagementMetrics = useCallback(() => {
    return analytics.current.getEngagementMetrics();
  }, []);
  
  // Perform health check
  const performHealthCheck = useCallback(async (
    serviceName: string,
    checkFn: () => Promise<boolean>
  ) => {
    return monitoring.current.performHealthCheck(
      `${options.componentName}_${serviceName}`,
      checkFn
    );
  }, [options.componentName]);
  
  return {
    // Timing functions
    startTiming,
    
    // Tracking functions
    trackInteraction,
    trackQuestionAnswered,
    trackSkillCompleted,
    trackContainerFinished,
    trackQuestionDetection,
    trackPerformance,
    trackBusinessMetric,
    trackError,
    
    // Utility functions
    getEngagementMetrics,
    performHealthCheck,
    
    // Service references
    monitoring: monitoring.current,
    analytics: analytics.current
  };
}

export default useMonitoring;