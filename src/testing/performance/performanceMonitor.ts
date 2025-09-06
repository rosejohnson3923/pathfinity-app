/**
 * PATHFINITY PERFORMANCE MONITOR
 * Real-time performance monitoring and alerting system
 */

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  category: 'frontend' | 'backend' | 'database' | 'ai' | 'network';
  severity: 'info' | 'warning' | 'critical';
}

interface PerformanceThreshold {
  warning: number;
  critical: number;
  unit: string;
}

interface PerformanceAlert {
  id: string;
  metric: string;
  currentValue: number;
  threshold: number;
  severity: 'warning' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private thresholds: Map<string, PerformanceThreshold> = new Map();
  private alerts: PerformanceAlert[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private isMonitoring: boolean = false;

  constructor() {
    this.setupDefaultThresholds();
    this.initializeWebAPIs();
  }

  private setupDefaultThresholds() {
    this.thresholds.set('firstContentfulPaint', {
      warning: 1500,
      critical: 3000,
      unit: 'ms'
    });

    this.thresholds.set('largestContentfulPaint', {
      warning: 2500,
      critical: 4000,
      unit: 'ms'
    });

    this.thresholds.set('firstInputDelay', {
      warning: 100,
      critical: 300,
      unit: 'ms'
    });

    this.thresholds.set('cumulativeLayoutShift', {
      warning: 0.1,
      critical: 0.25,
      unit: 'score'
    });

    this.thresholds.set('timeToInteractive', {
      warning: 3000,
      critical: 5000,
      unit: 'ms'
    });

    this.thresholds.set('memoryUsage', {
      warning: 100,
      critical: 200,
      unit: 'MB'
    });

    this.thresholds.set('aiResponseTime', {
      warning: 5000,
      critical: 10000,
      unit: 'ms'
    });

    this.thresholds.set('apiResponseTime', {
      warning: 1000,
      critical: 2000,
      unit: 'ms'
    });

    this.thresholds.set('errorRate', {
      warning: 0.05,
      critical: 0.1,
      unit: 'percentage'
    });

    this.thresholds.set('throughput', {
      warning: 50,
      critical: 20,
      unit: 'requests/second'
    });
  }

  private initializeWebAPIs() {
    if (typeof window === 'undefined') return;

    // Performance Observer for Core Web Vitals
    if ('PerformanceObserver' in window) {
      this.setupPerformanceObserver('paint', this.handlePaintMetrics.bind(this));
      this.setupPerformanceObserver('largest-contentful-paint', this.handleLCPMetrics.bind(this));
      this.setupPerformanceObserver('first-input', this.handleFIDMetrics.bind(this));
      this.setupPerformanceObserver('layout-shift', this.handleCLSMetrics.bind(this));
      this.setupPerformanceObserver('navigation', this.handleNavigationMetrics.bind(this));
      this.setupPerformanceObserver('resource', this.handleResourceMetrics.bind(this));
    }

    // Memory monitoring
    if ('memory' in performance) {
      this.setupMemoryMonitoring();
    }

    // Network monitoring
    if ('connection' in navigator) {
      this.setupNetworkMonitoring();
    }
  }

  private setupPerformanceObserver(entryTypes: string, callback: (entries: PerformanceEntryList) => void) {
    try {
      const observer = new PerformanceObserver(callback);
      observer.observe({ entryTypes: [entryTypes] });
      this.observers.set(entryTypes, observer);
    } catch (error) {
      console.warn(`Failed to setup PerformanceObserver for ${entryTypes}:`, error);
    }
  }

  private handlePaintMetrics(list: PerformanceObserverEntryList) {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        this.recordMetric({
          name: 'firstContentfulPaint',
          value: entry.startTime,
          unit: 'ms',
          timestamp: new Date(),
          category: 'frontend',
          severity: this.getSeverity('firstContentfulPaint', entry.startTime)
        });
      }
    }
  }

  private handleLCPMetrics(list: PerformanceObserverEntryList) {
    for (const entry of list.getEntries()) {
      this.recordMetric({
        name: 'largestContentfulPaint',
        value: entry.startTime,
        unit: 'ms',
        timestamp: new Date(),
        category: 'frontend',
        severity: this.getSeverity('largestContentfulPaint', entry.startTime)
      });
    }
  }

  private handleFIDMetrics(list: PerformanceObserverEntryList) {
    for (const entry of list.getEntries()) {
      const fidEntry = entry as PerformanceEventTiming;
      const fid = fidEntry.processingStart - fidEntry.startTime;
      
      this.recordMetric({
        name: 'firstInputDelay',
        value: fid,
        unit: 'ms',
        timestamp: new Date(),
        category: 'frontend',
        severity: this.getSeverity('firstInputDelay', fid)
      });
    }
  }

  private handleCLSMetrics(list: PerformanceObserverEntryList) {
    let clsValue = 0;
    for (const entry of list.getEntries()) {
      const layoutShiftEntry = entry as LayoutShift;
      if (!layoutShiftEntry.hadRecentInput) {
        clsValue += layoutShiftEntry.value;
      }
    }

    this.recordMetric({
      name: 'cumulativeLayoutShift',
      value: clsValue,
      unit: 'score',
      timestamp: new Date(),
      category: 'frontend',
      severity: this.getSeverity('cumulativeLayoutShift', clsValue)
    });
  }

  private handleNavigationMetrics(list: PerformanceObserverEntryList) {
    for (const entry of list.getEntries()) {
      const navEntry = entry as PerformanceNavigationTiming;
      
      // Time to Interactive (approximate)
      const tti = navEntry.domInteractive - navEntry.fetchStart;
      this.recordMetric({
        name: 'timeToInteractive',
        value: tti,
        unit: 'ms',
        timestamp: new Date(),
        category: 'frontend',
        severity: this.getSeverity('timeToInteractive', tti)
      });

      // DNS lookup time
      const dnsTime = navEntry.domainLookupEnd - navEntry.domainLookupStart;
      this.recordMetric({
        name: 'dnsLookupTime',
        value: dnsTime,
        unit: 'ms',
        timestamp: new Date(),
        category: 'network',
        severity: 'info'
      });

      // Server response time
      const serverTime = navEntry.responseEnd - navEntry.requestStart;
      this.recordMetric({
        name: 'serverResponseTime',
        value: serverTime,
        unit: 'ms',
        timestamp: new Date(),
        category: 'backend',
        severity: this.getSeverity('apiResponseTime', serverTime)
      });
    }
  }

  private handleResourceMetrics(list: PerformanceObserverEntryList) {
    for (const entry of list.getEntries()) {
      const resourceEntry = entry as PerformanceResourceTiming;
      
      // Large resources that might impact performance
      if (resourceEntry.transferSize > 100000) { // > 100KB
        this.recordMetric({
          name: 'largeResourceLoad',
          value: resourceEntry.duration,
          unit: 'ms',
          timestamp: new Date(),
          category: 'network',
          severity: resourceEntry.duration > 1000 ? 'warning' : 'info'
        });
      }

      // AI character assets
      if (resourceEntry.name.includes('character') || resourceEntry.name.includes('avatar')) {
        this.recordMetric({
          name: 'characterAssetLoad',
          value: resourceEntry.duration,
          unit: 'ms',
          timestamp: new Date(),
          category: 'frontend',
          severity: resourceEntry.duration > 2000 ? 'warning' : 'info'
        });
      }
    }
  }

  private setupMemoryMonitoring() {
    setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        
        this.recordMetric({
          name: 'memoryUsage',
          value: usedMB,
          unit: 'MB',
          timestamp: new Date(),
          category: 'frontend',
          severity: this.getSeverity('memoryUsage', usedMB)
        });
      }
    }, 5000); // Every 5 seconds
  }

  private setupNetworkMonitoring() {
    const connection = (navigator as any).connection;
    if (connection) {
      this.recordMetric({
        name: 'networkEffectiveType',
        value: this.getNetworkScore(connection.effectiveType),
        unit: 'score',
        timestamp: new Date(),
        category: 'network',
        severity: connection.effectiveType === 'slow-2g' ? 'warning' : 'info'
      });

      connection.addEventListener('change', () => {
        this.recordMetric({
          name: 'networkEffectiveType',
          value: this.getNetworkScore(connection.effectiveType),
          unit: 'score',
          timestamp: new Date(),
          category: 'network',
          severity: connection.effectiveType === 'slow-2g' ? 'warning' : 'info'
        });
      });
    }
  }

  private getNetworkScore(effectiveType: string): number {
    const scores = {
      'slow-2g': 1,
      '2g': 2,
      '3g': 3,
      '4g': 4
    };
    return scores[effectiveType as keyof typeof scores] || 3;
  }

  public recordMetric(metric: PerformanceMetric) {
    const key = metric.name;
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    const metrics = this.metrics.get(key)!;
    metrics.push(metric);
    
    // Keep only last 100 metrics per type
    if (metrics.length > 100) {
      metrics.shift();
    }

    this.checkThresholds(metric);
  }

  public recordAIInteraction(characterId: string, responseTime: number, tokens: number, cost: number) {
    this.recordMetric({
      name: 'aiResponseTime',
      value: responseTime,
      unit: 'ms',
      timestamp: new Date(),
      category: 'ai',
      severity: this.getSeverity('aiResponseTime', responseTime)
    });

    this.recordMetric({
      name: 'aiTokenUsage',
      value: tokens,
      unit: 'tokens',
      timestamp: new Date(),
      category: 'ai',
      severity: 'info'
    });

    this.recordMetric({
      name: 'aiCost',
      value: cost,
      unit: 'USD',
      timestamp: new Date(),
      category: 'ai',
      severity: 'info'
    });
  }

  public recordAPICall(endpoint: string, method: string, responseTime: number, statusCode: number) {
    this.recordMetric({
      name: 'apiResponseTime',
      value: responseTime,
      unit: 'ms',
      timestamp: new Date(),
      category: 'backend',
      severity: this.getSeverity('apiResponseTime', responseTime)
    });

    if (statusCode >= 400) {
      this.recordMetric({
        name: 'apiError',
        value: statusCode,
        unit: 'status',
        timestamp: new Date(),
        category: 'backend',
        severity: statusCode >= 500 ? 'critical' : 'warning'
      });
    }
  }

  private getSeverity(metricName: string, value: number): 'info' | 'warning' | 'critical' {
    const threshold = this.thresholds.get(metricName);
    if (!threshold) return 'info';

    if (value >= threshold.critical) return 'critical';
    if (value >= threshold.warning) return 'warning';
    return 'info';
  }

  private checkThresholds(metric: PerformanceMetric) {
    const threshold = this.thresholds.get(metric.name);
    if (!threshold) return;

    if (metric.value >= threshold.warning) {
      const alertId = `${metric.name}_${Date.now()}`;
      const alert: PerformanceAlert = {
        id: alertId,
        metric: metric.name,
        currentValue: metric.value,
        threshold: metric.value >= threshold.critical ? threshold.critical : threshold.warning,
        severity: metric.value >= threshold.critical ? 'critical' : 'warning',
        message: this.generateAlertMessage(metric, threshold),
        timestamp: new Date(),
        resolved: false
      };

      this.alerts.push(alert);
      this.triggerAlert(alert);
    }
  }

  private generateAlertMessage(metric: PerformanceMetric, threshold: PerformanceThreshold): string {
    const severity = metric.value >= threshold.critical ? 'CRITICAL' : 'WARNING';
    return `${severity}: ${metric.name} is ${metric.value}${metric.unit}, exceeding threshold of ${threshold.warning}${threshold.unit}`;
  }

  private triggerAlert(alert: PerformanceAlert) {
    console.warn(`🚨 Performance Alert: ${alert.message}`);
    
    // Send to monitoring service
    this.sendToMonitoringService(alert);
    
    // Trigger custom event for UI
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pathfinity:performance-alert', {
        detail: alert
      }));
    }
  }

  private async sendToMonitoringService(alert: PerformanceAlert) {
    try {
      await fetch('/api/monitoring/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(alert)
      });
    } catch (error) {
      console.error('Failed to send alert to monitoring service:', error);
    }
  }

  public getMetrics(metricName?: string): PerformanceMetric[] {
    if (metricName) {
      return this.metrics.get(metricName) || [];
    }
    
    const allMetrics: PerformanceMetric[] = [];
    for (const metrics of this.metrics.values()) {
      allMetrics.push(...metrics);
    }
    
    return allMetrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  public getAlerts(onlyUnresolved = true): PerformanceAlert[] {
    return this.alerts.filter(alert => !onlyUnresolved || !alert.resolved);
  }

  public resolveAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  public getPerformanceReport(): any {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recentMetrics = this.getMetrics().filter(m => m.timestamp >= oneHourAgo);
    const recentAlerts = this.getAlerts().filter(a => a.timestamp >= oneHourAgo);

    const report = {
      timestamp: now,
      period: 'Last 1 hour',
      summary: {
        totalMetrics: recentMetrics.length,
        alertsTriggered: recentAlerts.length,
        criticalAlerts: recentAlerts.filter(a => a.severity === 'critical').length,
        avgResponseTime: this.calculateAverage(recentMetrics.filter(m => m.name.includes('ResponseTime')), 'value'),
        errorRate: this.calculateErrorRate(recentMetrics)
      },
      coreWebVitals: {
        lcp: this.getLatestMetric('largestContentfulPaint'),
        fid: this.getLatestMetric('firstInputDelay'),
        cls: this.getLatestMetric('cumulativeLayoutShift'),
        fcp: this.getLatestMetric('firstContentfulPaint'),
        tti: this.getLatestMetric('timeToInteractive')
      },
      aiPerformance: {
        avgResponseTime: this.calculateAverage(recentMetrics.filter(m => m.name === 'aiResponseTime'), 'value'),
        totalTokens: recentMetrics.filter(m => m.name === 'aiTokenUsage').reduce((sum, m) => sum + m.value, 0),
        totalCost: recentMetrics.filter(m => m.name === 'aiCost').reduce((sum, m) => sum + m.value, 0)
      },
      recommendations: this.generateRecommendations(recentMetrics, recentAlerts)
    };

    return report;
  }

  private calculateAverage(metrics: PerformanceMetric[], property: keyof PerformanceMetric): number {
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, m) => sum + (m[property] as number), 0) / metrics.length;
  }

  private calculateErrorRate(metrics: PerformanceMetric[]): number {
    const apiCalls = metrics.filter(m => m.name === 'apiResponseTime' || m.name === 'apiError');
    if (apiCalls.length === 0) return 0;
    
    const errors = metrics.filter(m => m.name === 'apiError');
    return errors.length / apiCalls.length;
  }

  private getLatestMetric(name: string): PerformanceMetric | null {
    const metrics = this.metrics.get(name);
    return metrics && metrics.length > 0 ? metrics[metrics.length - 1] : null;
  }

  private generateRecommendations(metrics: PerformanceMetric[], alerts: PerformanceAlert[]): string[] {
    const recommendations: string[] = [];

    if (alerts.some(a => a.metric === 'largestContentfulPaint')) {
      recommendations.push('Optimize largest contentful paint by reducing image sizes and improving server response times');
    }

    if (alerts.some(a => a.metric === 'firstInputDelay')) {
      recommendations.push('Reduce first input delay by minimizing JavaScript execution time');
    }

    if (alerts.some(a => a.metric === 'cumulativeLayoutShift')) {
      recommendations.push('Minimize cumulative layout shift by setting dimensions for images and avoiding dynamic content insertion');
    }

    if (alerts.some(a => a.metric === 'aiResponseTime')) {
      recommendations.push('Implement AI response caching and consider model optimization');
    }

    if (alerts.some(a => a.metric === 'memoryUsage')) {
      recommendations.push('Check for memory leaks and optimize component lifecycle management');
    }

    return recommendations;
  }

  public startMonitoring() {
    this.isMonitoring = true;
    console.log('🔍 Pathfinity Performance Monitor started');
  }

  public stopMonitoring() {
    this.isMonitoring = false;
    
    // Clean up observers
    for (const observer of this.observers.values()) {
      observer.disconnect();
    }
    this.observers.clear();
    
    console.log('⏹️  Pathfinity Performance Monitor stopped');
  }

  public isActive(): boolean {
    return this.isMonitoring;
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-start monitoring in browser environment
if (typeof window !== 'undefined') {
  performanceMonitor.startMonitoring();
}

export default PerformanceMonitor;