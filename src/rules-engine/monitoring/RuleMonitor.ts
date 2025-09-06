/**
 * Rule Monitor
 * Monitors rule execution, performance, and health metrics
 */

import {
  RuleMetrics,
  RuleTelemetryEvent,
  RuleContext,
  RuleResult,
  Rule
} from '../core/types';

/**
 * Performance threshold configuration
 */
interface PerformanceThresholds {
  warningMs: number;
  criticalMs: number;
  maxExecutionMs: number;
}

/**
 * Health status for rules
 */
interface RuleHealth {
  ruleId: string;
  status: 'healthy' | 'degraded' | 'critical';
  successRate: number;
  averageExecutionTime: number;
  lastFailure?: Date;
  issues: string[];
}

/**
 * System health status
 */
interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  totalRules: number;
  healthyRules: number;
  degradedRules: number;
  criticalRules: number;
  overallSuccessRate: number;
  averageExecutionTime: number;
}

/**
 * Monitoring alert
 */
interface MonitoringAlert {
  id: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'critical';
  ruleId?: string;
  engineId: string;
  message: string;
  details?: any;
}

/**
 * Rule execution monitor
 */
export class RuleMonitor {
  private metrics: Map<string, RuleMetrics> = new Map();
  private telemetryEvents: RuleTelemetryEvent[] = [];
  private alerts: MonitoringAlert[] = [];
  private thresholds: PerformanceThresholds;
  private maxTelemetryEvents: number = 1000;
  private maxAlerts: number = 100;
  private alertHandlers: Map<string, (alert: MonitoringAlert) => void> = new Map();

  constructor(thresholds?: Partial<PerformanceThresholds>) {
    this.thresholds = {
      warningMs: thresholds?.warningMs || 100,
      criticalMs: thresholds?.criticalMs || 500,
      maxExecutionMs: thresholds?.maxExecutionMs || 5000
    };

    console.log('📊 RuleMonitor initialized with thresholds:', this.thresholds);
  }

  /**
   * Record rule execution
   */
  public recordExecution(
    ruleId: string,
    success: boolean,
    executionTime: number,
    engineId: string,
    context?: RuleContext,
    result?: RuleResult
  ): void {
    // Update metrics
    let metrics = this.metrics.get(ruleId);
    if (!metrics) {
      metrics = {
        ruleId,
        executionCount: 0,
        successCount: 0,
        failureCount: 0,
        averageExecutionTime: 0,
        lastExecutionTime: 0
      };
      this.metrics.set(ruleId, metrics);
    }

    metrics.executionCount++;
    if (success) {
      metrics.successCount++;
    } else {
      metrics.failureCount++;
    }

    // Update average execution time
    metrics.averageExecutionTime = 
      (metrics.averageExecutionTime * (metrics.executionCount - 1) + executionTime) / 
      metrics.executionCount;
    
    metrics.lastExecutionTime = executionTime;
    metrics.lastExecutedAt = new Date();

    // Check for performance issues
    this.checkPerformance(ruleId, executionTime, engineId);

    // Record telemetry event
    this.recordTelemetry({
      eventType: success ? 'rule_executed' : 'rule_failed',
      timestamp: new Date(),
      ruleId,
      engineId,
      context: context || { timestamp: new Date() },
      result,
      duration: executionTime
    });
  }

  /**
   * Record telemetry event
   */
  public recordTelemetry(event: RuleTelemetryEvent): void {
    this.telemetryEvents.push(event);

    // Maintain max size
    if (this.telemetryEvents.length > this.maxTelemetryEvents) {
      this.telemetryEvents.shift();
    }

    // Check for patterns
    this.analyzePatterns(event);
  }

  /**
   * Check performance against thresholds
   */
  private checkPerformance(ruleId: string, executionTime: number, engineId: string): void {
    if (executionTime > this.thresholds.maxExecutionMs) {
      this.createAlert({
        severity: 'critical',
        ruleId,
        engineId,
        message: `Rule execution exceeded maximum time: ${executionTime}ms > ${this.thresholds.maxExecutionMs}ms`
      });
    } else if (executionTime > this.thresholds.criticalMs) {
      this.createAlert({
        severity: 'error',
        ruleId,
        engineId,
        message: `Rule execution time critical: ${executionTime}ms`
      });
    } else if (executionTime > this.thresholds.warningMs) {
      this.createAlert({
        severity: 'warning',
        ruleId,
        engineId,
        message: `Rule execution time warning: ${executionTime}ms`
      });
    }
  }

  /**
   * Analyze patterns in telemetry
   */
  private analyzePatterns(event: RuleTelemetryEvent): void {
    if (event.eventType === 'rule_failed' && event.ruleId) {
      // Check for repeated failures
      const recentFailures = this.telemetryEvents
        .filter(e => 
          e.ruleId === event.ruleId && 
          e.eventType === 'rule_failed' &&
          e.timestamp.getTime() > Date.now() - 60000 // Last minute
        );

      if (recentFailures.length >= 3) {
        this.createAlert({
          severity: 'error',
          ruleId: event.ruleId,
          engineId: event.engineId,
          message: `Rule has failed ${recentFailures.length} times in the last minute`,
          details: { failures: recentFailures }
        });
      }
    }

    // Check for engine errors
    if (event.eventType === 'engine_error') {
      this.createAlert({
        severity: 'critical',
        engineId: event.engineId,
        message: 'Engine error detected',
        details: { error: event.error }
      });
    }
  }

  /**
   * Create monitoring alert
   */
  private createAlert(alert: Omit<MonitoringAlert, 'id' | 'timestamp'>): void {
    const fullAlert: MonitoringAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...alert
    };

    this.alerts.push(fullAlert);

    // Maintain max size
    if (this.alerts.length > this.maxAlerts) {
      this.alerts.shift();
    }

    // Notify handlers
    this.alertHandlers.forEach(handler => {
      try {
        handler(fullAlert);
      } catch (error) {
        console.error('Error in alert handler:', error);
      }
    });

    // Log based on severity
    switch (alert.severity) {
      case 'critical':
        console.error(`🚨 CRITICAL: ${alert.message}`, alert.details);
        break;
      case 'error':
        console.error(`❌ ERROR: ${alert.message}`, alert.details);
        break;
      case 'warning':
        console.warn(`⚠️ WARNING: ${alert.message}`, alert.details);
        break;
      case 'info':
        console.info(`ℹ️ INFO: ${alert.message}`, alert.details);
        break;
    }
  }

  /**
   * Get metrics for a rule
   */
  public getMetrics(ruleId: string): RuleMetrics | undefined {
    return this.metrics.get(ruleId);
  }

  /**
   * Get all metrics
   */
  public getAllMetrics(): RuleMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get rule health status
   */
  public getRuleHealth(ruleId: string): RuleHealth | undefined {
    const metrics = this.metrics.get(ruleId);
    if (!metrics) return undefined;

    const successRate = metrics.executionCount > 0 
      ? (metrics.successCount / metrics.executionCount) * 100 
      : 100;

    const issues: string[] = [];
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';

    // Check success rate
    if (successRate < 50) {
      status = 'critical';
      issues.push(`Low success rate: ${successRate.toFixed(1)}%`);
    } else if (successRate < 80) {
      status = 'degraded';
      issues.push(`Degraded success rate: ${successRate.toFixed(1)}%`);
    }

    // Check execution time
    if (metrics.averageExecutionTime > this.thresholds.criticalMs) {
      status = 'critical';
      issues.push(`High average execution time: ${metrics.averageExecutionTime.toFixed(0)}ms`);
    } else if (metrics.averageExecutionTime > this.thresholds.warningMs) {
      if (status === 'healthy') status = 'degraded';
      issues.push(`Elevated execution time: ${metrics.averageExecutionTime.toFixed(0)}ms`);
    }

    // Find last failure
    const lastFailure = this.telemetryEvents
      .filter(e => e.ruleId === ruleId && e.eventType === 'rule_failed')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    return {
      ruleId,
      status,
      successRate,
      averageExecutionTime: metrics.averageExecutionTime,
      lastFailure: lastFailure?.timestamp,
      issues
    };
  }

  /**
   * Get system health status
   */
  public getSystemHealth(): SystemHealth {
    const allMetrics = this.getAllMetrics();
    const healthStatuses = allMetrics.map(m => this.getRuleHealth(m.ruleId)!);

    const healthCounts = {
      healthy: healthStatuses.filter(h => h.status === 'healthy').length,
      degraded: healthStatuses.filter(h => h.status === 'degraded').length,
      critical: healthStatuses.filter(h => h.status === 'critical').length
    };

    const totalExecutions = allMetrics.reduce((sum, m) => sum + m.executionCount, 0);
    const totalSuccesses = allMetrics.reduce((sum, m) => sum + m.successCount, 0);
    const overallSuccessRate = totalExecutions > 0 
      ? (totalSuccesses / totalExecutions) * 100 
      : 100;

    const totalExecutionTime = allMetrics.reduce(
      (sum, m) => sum + (m.averageExecutionTime * m.executionCount), 
      0
    );
    const averageExecutionTime = totalExecutions > 0 
      ? totalExecutionTime / totalExecutions 
      : 0;

    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    if (healthCounts.critical > 0 || overallSuccessRate < 70) {
      status = 'critical';
    } else if (healthCounts.degraded > 0 || overallSuccessRate < 90) {
      status = 'degraded';
    }

    return {
      status,
      totalRules: allMetrics.length,
      healthyRules: healthCounts.healthy,
      degradedRules: healthCounts.degraded,
      criticalRules: healthCounts.critical,
      overallSuccessRate,
      averageExecutionTime
    };
  }

  /**
   * Get recent telemetry events
   */
  public getTelemetry(options?: {
    ruleId?: string;
    engineId?: string;
    eventType?: RuleTelemetryEvent['eventType'];
    since?: Date;
    limit?: number;
  }): RuleTelemetryEvent[] {
    let events = [...this.telemetryEvents];

    if (options?.ruleId) {
      events = events.filter(e => e.ruleId === options.ruleId);
    }

    if (options?.engineId) {
      events = events.filter(e => e.engineId === options.engineId);
    }

    if (options?.eventType) {
      events = events.filter(e => e.eventType === options.eventType);
    }

    if (options?.since) {
      events = events.filter(e => e.timestamp >= options.since!);
    }

    // Sort by timestamp descending
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (options?.limit) {
      events = events.slice(0, options.limit);
    }

    return events;
  }

  /**
   * Get alerts
   */
  public getAlerts(options?: {
    severity?: MonitoringAlert['severity'];
    ruleId?: string;
    engineId?: string;
    since?: Date;
    limit?: number;
  }): MonitoringAlert[] {
    let alerts = [...this.alerts];

    if (options?.severity) {
      alerts = alerts.filter(a => a.severity === options.severity);
    }

    if (options?.ruleId) {
      alerts = alerts.filter(a => a.ruleId === options.ruleId);
    }

    if (options?.engineId) {
      alerts = alerts.filter(a => a.engineId === options.engineId);
    }

    if (options?.since) {
      alerts = alerts.filter(a => a.timestamp >= options.since!);
    }

    // Sort by timestamp descending
    alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (options?.limit) {
      alerts = alerts.slice(0, options.limit);
    }

    return alerts;
  }

  /**
   * Register alert handler
   */
  public onAlert(id: string, handler: (alert: MonitoringAlert) => void): void {
    this.alertHandlers.set(id, handler);
  }

  /**
   * Unregister alert handler
   */
  public offAlert(id: string): boolean {
    return this.alertHandlers.delete(id);
  }

  /**
   * Generate performance report
   */
  public generateReport(): {
    systemHealth: SystemHealth;
    topPerformers: RuleMetrics[];
    bottomPerformers: RuleMetrics[];
    recentAlerts: MonitoringAlert[];
    executionTrends: {
      hourly: { hour: number; executions: number; successRate: number }[];
    };
  } {
    const systemHealth = this.getSystemHealth();
    const allMetrics = this.getAllMetrics();

    // Top performers (by success rate and speed)
    const topPerformers = [...allMetrics]
      .filter(m => m.executionCount > 0)
      .sort((a, b) => {
        const aScore = (a.successCount / a.executionCount) * 100 - a.averageExecutionTime / 10;
        const bScore = (b.successCount / b.executionCount) * 100 - b.averageExecutionTime / 10;
        return bScore - aScore;
      })
      .slice(0, 5);

    // Bottom performers
    const bottomPerformers = [...allMetrics]
      .filter(m => m.executionCount > 0)
      .sort((a, b) => {
        const aScore = (a.successCount / a.executionCount) * 100 - a.averageExecutionTime / 10;
        const bScore = (b.successCount / b.executionCount) * 100 - b.averageExecutionTime / 10;
        return aScore - bScore;
      })
      .slice(0, 5);

    // Recent alerts
    const recentAlerts = this.getAlerts({ limit: 10 });

    // Execution trends (last 24 hours)
    const hourlyTrends = new Map<number, { executions: number; successes: number }>();
    const now = Date.now();
    
    this.telemetryEvents
      .filter(e => e.timestamp.getTime() > now - 86400000) // Last 24 hours
      .forEach(e => {
        const hour = new Date(e.timestamp).getHours();
        const trend = hourlyTrends.get(hour) || { executions: 0, successes: 0 };
        
        if (e.eventType === 'rule_executed') {
          trend.executions++;
          trend.successes++;
        } else if (e.eventType === 'rule_failed') {
          trend.executions++;
        }
        
        hourlyTrends.set(hour, trend);
      });

    const executionTrends = {
      hourly: Array.from(hourlyTrends.entries()).map(([hour, data]) => ({
        hour,
        executions: data.executions,
        successRate: data.executions > 0 ? (data.successes / data.executions) * 100 : 0
      }))
    };

    return {
      systemHealth,
      topPerformers,
      bottomPerformers,
      recentAlerts,
      executionTrends
    };
  }

  /**
   * Reset metrics
   */
  public resetMetrics(ruleId?: string): void {
    if (ruleId) {
      this.metrics.delete(ruleId);
    } else {
      this.metrics.clear();
    }
  }

  /**
   * Clear telemetry
   */
  public clearTelemetry(): void {
    this.telemetryEvents = [];
  }

  /**
   * Clear alerts
   */
  public clearAlerts(): void {
    this.alerts = [];
  }
}

// Export singleton instance
export const ruleMonitor = new RuleMonitor();