/**
 * MonitoringService
 * Central service for application monitoring, metrics collection, and alerting
 */

import { supabase } from '../../lib/supabase';

export interface MetricEvent {
  eventType: 'performance' | 'error' | 'usage' | 'business';
  eventName: string;
  value?: number;
  metadata?: Record<string, any>;
  timestamp?: string;
  userId?: string;
  sessionId?: string;
  containerType?: string;
  grade?: string;
  subject?: string;
}

export interface PerformanceMetric {
  metricName: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  threshold?: number;
  isAlert?: boolean;
}

export interface ErrorEvent {
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  context?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastChecked: string;
  details?: Record<string, any>;
}

class MonitoringService {
  private static instance: MonitoringService;
  private metricsBuffer: MetricEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private healthChecks: Map<string, HealthCheckResult> = new Map();
  private alertThresholds: Map<string, number> = new Map();
  
  private readonly BUFFER_SIZE = 100;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds
  
  private constructor() {
    this.initializeService();
    this.setupAlertThresholds();
  }
  
  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }
  
  private initializeService(): void {
    // Start periodic flush
    this.flushInterval = setInterval(() => {
      this.flushMetrics();
    }, this.FLUSH_INTERVAL);
    
    // Setup window error handler
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.trackError({
          errorType: 'uncaught_exception',
          errorMessage: event.message,
          stackTrace: event.error?.stack,
          severity: 'high',
          timestamp: new Date().toISOString(),
          context: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        });
      });
      
      // Track unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.trackError({
          errorType: 'unhandled_promise_rejection',
          errorMessage: event.reason?.toString() || 'Unknown promise rejection',
          severity: 'high',
          timestamp: new Date().toISOString()
        });
      });
    }
  }
  
  private setupAlertThresholds(): void {
    // Performance thresholds
    this.alertThresholds.set('content_generation_time', 1000); // 1 second
    this.alertThresholds.set('api_response_time', 2000); // 2 seconds
    this.alertThresholds.set('cache_hit_rate', 50); // 50% minimum
    this.alertThresholds.set('error_rate', 5); // 5% maximum
    this.alertThresholds.set('memory_usage', 100); // 100MB
    
    // Business metrics thresholds
    this.alertThresholds.set('question_detection_accuracy', 90); // 90% minimum
    this.alertThresholds.set('true_false_accuracy', 95); // 95% minimum
    this.alertThresholds.set('session_duration', 14400000); // 4 hours max
  }
  
  // Core metric tracking
  trackMetric(event: MetricEvent): void {
    const enrichedEvent: MetricEvent = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
      sessionId: this.getSessionId(),
      userId: this.getUserId()
    };
    
    this.metricsBuffer.push(enrichedEvent);
    
    // Check if we need to flush
    if (this.metricsBuffer.length >= this.BUFFER_SIZE) {
      this.flushMetrics();
    }
    
    // Check for alerts
    if (event.eventType === 'performance' && event.value) {
      this.checkPerformanceAlert(event.eventName, event.value);
    }
  }
  
  // Performance tracking
  trackPerformance(metric: PerformanceMetric): void {
    this.trackMetric({
      eventType: 'performance',
      eventName: metric.metricName,
      value: metric.value,
      metadata: {
        unit: metric.unit,
        threshold: metric.threshold,
        isAlert: metric.isAlert
      }
    });
    
    // Store in performance metrics table
    this.storePerformanceMetric(metric);
  }
  
  // Error tracking
  trackError(error: ErrorEvent): void {
    console.error('[MonitoringService] Error tracked:', error);
    
    this.trackMetric({
      eventType: 'error',
      eventName: error.errorType,
      metadata: {
        message: error.errorMessage,
        stackTrace: error.stackTrace,
        severity: error.severity,
        context: error.context
      }
    });
    
    // Store critical errors immediately
    if (error.severity === 'critical' || error.severity === 'high') {
      this.storeErrorEvent(error);
    }
  }
  
  // Usage tracking
  trackUsage(eventName: string, metadata?: Record<string, any>): void {
    this.trackMetric({
      eventType: 'usage',
      eventName,
      metadata
    });
  }
  
  // Business metric tracking
  trackBusinessMetric(metricName: string, value: number, metadata?: Record<string, any>): void {
    this.trackMetric({
      eventType: 'business',
      eventName: metricName,
      value,
      metadata
    });
  }
  
  // Question type detection tracking
  trackQuestionDetection(
    questionText: string,
    detectedType: string,
    expectedType: string,
    isCorrect: boolean,
    confidence?: number
  ): void {
    const captureData = {
      question_text: questionText,
      detected_type: detectedType,
      expected_type: expectedType,
      is_correct: isCorrect,
      confidence_score: confidence,
      detection_method: 'rule_based',
      metadata: {
        timestamp: new Date().toISOString(),
        session_id: this.getSessionId()
      }
    };
    
    // Store in type_detection_captures table
    supabase
      .from('type_detection_captures')
      .insert(captureData)
      .then(({ error }) => {
        if (error) {
          console.error('Failed to store detection capture:', error);
        }
      });
    
    // Track as business metric
    this.trackBusinessMetric('question_detection', isCorrect ? 100 : 0, {
      detectedType,
      expectedType
    });
  }
  
  // Performance timing helper
  startTiming(label: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.trackPerformance({
        metricName: label,
        value: duration,
        unit: 'ms'
      });
      return duration;
    };
  }
  
  // Health check system
  async performHealthCheck(serviceName: string, checkFn: () => Promise<boolean>): Promise<HealthCheckResult> {
    const startTime = performance.now();
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'unhealthy';
    let details = {};
    
    try {
      const isHealthy = await checkFn();
      status = isHealthy ? 'healthy' : 'degraded';
    } catch (error) {
      status = 'unhealthy';
      details = { error: error instanceof Error ? error.message : 'Unknown error' };
    }
    
    const responseTime = performance.now() - startTime;
    
    const result: HealthCheckResult = {
      service: serviceName,
      status,
      responseTime,
      lastChecked: new Date().toISOString(),
      details
    };
    
    this.healthChecks.set(serviceName, result);
    
    // Track health metric
    this.trackMetric({
      eventType: 'performance',
      eventName: `health_check_${serviceName}`,
      value: responseTime,
      metadata: { status, details }
    });
    
    return result;
  }
  
  // Get all health check results
  getHealthStatus(): Map<string, HealthCheckResult> {
    return new Map(this.healthChecks);
  }
  
  // Alert checking
  private checkPerformanceAlert(metricName: string, value: number): void {
    const threshold = this.alertThresholds.get(metricName);
    
    if (threshold && value > threshold) {
      this.triggerAlert({
        type: 'performance',
        metric: metricName,
        value,
        threshold,
        severity: this.calculateSeverity(value, threshold)
      });
    }
  }
  
  private calculateSeverity(value: number, threshold: number): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = value / threshold;
    
    if (ratio < 1.2) return 'low';
    if (ratio < 1.5) return 'medium';
    if (ratio < 2) return 'high';
    return 'critical';
  }
  
  private triggerAlert(alert: any): void {
    console.warn('[MonitoringService] Alert triggered:', alert);
    
    // Store alert
    supabase
      .from('monitoring_alerts')
      .insert({
        alert_type: alert.type,
        metric_name: alert.metric,
        current_value: alert.value,
        threshold_value: alert.threshold,
        severity: alert.severity,
        created_at: new Date().toISOString()
      })
      .then(({ error }) => {
        if (error) {
          console.error('Failed to store alert:', error);
        }
      });
  }
  
  // Flush metrics to database
  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;
    
    const metricsToFlush = [...this.metricsBuffer];
    this.metricsBuffer = [];
    
    try {
      // Group metrics by type
      const performanceMetrics = metricsToFlush.filter(m => m.eventType === 'performance');
      const usageMetrics = metricsToFlush.filter(m => m.eventType === 'usage');
      const businessMetrics = metricsToFlush.filter(m => m.eventType === 'business');
      
      // Store different types in appropriate tables
      const promises = [];
      
      if (performanceMetrics.length > 0) {
        promises.push(this.storeMetricsBatch('performance_metrics', performanceMetrics));
      }
      
      if (usageMetrics.length > 0) {
        promises.push(this.storeMetricsBatch('usage_analytics', usageMetrics));
      }
      
      if (businessMetrics.length > 0) {
        promises.push(this.storeMetricsBatch('business_metrics', businessMetrics));
      }
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to flush metrics:', error);
      // Re-add metrics to buffer if flush failed
      this.metricsBuffer = [...metricsToFlush, ...this.metricsBuffer];
    }
  }
  
  private async storeMetricsBatch(tableName: string, metrics: MetricEvent[]): Promise<void> {
    try {
      const supabaseClient = await supabase();
      const { error } = await supabaseClient
        .from(tableName)
        .insert(metrics.map(m => ({
          event_name: m.eventName,
          event_value: m.value,
          metadata: m.metadata,
          timestamp: m.timestamp,
          user_id: m.userId,
          session_id: m.sessionId,
          container_type: m.containerType,
          grade: m.grade,
          subject: m.subject
        })));
      
      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Failed to store metrics batch:', err);
      throw err;
    }
  }
  
  private async storePerformanceMetric(metric: PerformanceMetric): Promise<void> {
    const currentDate = new Date();
    
    const supabaseClient = await supabase();
    const { error } = await supabaseClient
      .from('detection_performance_metrics')
      .upsert({
        metric_date: currentDate.toISOString().split('T')[0],
        metric_hour: currentDate.getHours(),
        question_type: metric.metricName,
        avg_detection_time_ms: metric.value,
        metadata: {
          unit: metric.unit,
          threshold: metric.threshold,
          isAlert: metric.isAlert
        }
      });
    
    if (error) {
      console.error('Failed to store performance metric:', error);
    }
  }
  
  private async storeErrorEvent(error: ErrorEvent): Promise<void> {
    try {
      // Get the supabase client instance
      const supabaseClient = await supabase();
      
      const { error: dbError } = await supabaseClient
        .from('error_logs')
        .insert({
          error_type: error.errorType,
          error_message: error.errorMessage,
          stack_trace: error.stackTrace,
          severity: error.severity,
          context: error.context,
          timestamp: error.timestamp
        });
      
      if (dbError) {
        console.error('Failed to store error event:', dbError);
      }
    } catch (err) {
      // Prevent infinite loop - just log to console without trying to store
      console.error('Failed to get supabase client for error logging:', err);
    }
  }
  
  // Helper methods
  private getSessionId(): string {
    // Get or create session ID
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('monitoring_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('monitoring_session_id', sessionId);
      }
      return sessionId;
    }
    return 'unknown';
  }
  
  private getUserId(): string | undefined {
    // Get user ID from auth service or session
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('pathfinity_user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          return user.id || user.email;
        } catch {
          // Invalid user data
        }
      }
    }
    return undefined;
  }
  
  // Cleanup
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    // Final flush
    this.flushMetrics();
  }
}

export default MonitoringService;