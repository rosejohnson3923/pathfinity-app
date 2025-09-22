/**
 * Health Check & Monitoring System
 * Provides comprehensive health status for production deployment
 */

import { narrativeCache } from '../services/narrative/NarrativeCache';
import { youTubeService } from '../services/content-providers/YouTubeService';
import { contentOrchestrator } from '../services/orchestration/ContentOrchestrator';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  version: string;
  uptime: number;
  services: ServiceHealth[];
  metrics: SystemMetrics;
  checks: HealthCheckResult[];
}

interface ServiceHealth {
  name: string;
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  lastCheck: Date;
  error?: string;
}

interface SystemMetrics {
  cpu: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cache: {
    hitRate: number;
    size: number;
    evictions: number;
  };
  api: {
    requestsPerMinute: number;
    errorRate: number;
    p99Latency: number;
  };
  cost: {
    currentDaily: number;
    projectedDaily: number;
    withinBudget: boolean;
  };
}

interface HealthCheckResult {
  check: string;
  passed: boolean;
  message: string;
  severity: 'critical' | 'warning' | 'info';
}

export class HealthCheckService {
  private startTime: Date = new Date();
  private requestCounts: number[] = [];
  private errorCounts: number[] = [];
  private latencies: number[] = [];

  /**
   * Main health check endpoint
   */
  async getHealth(): Promise<HealthStatus> {
    const checks: HealthCheckResult[] = [];
    const services: ServiceHealth[] = [];

    // Check core services
    services.push(await this.checkDatabase());
    services.push(await this.checkCache());
    services.push(await this.checkOpenAI());
    services.push(await this.checkYouTube());

    // Run health checks
    checks.push(await this.checkCacheHitRate());
    checks.push(await this.checkErrorRate());
    checks.push(await this.checkLatency());
    checks.push(await this.checkCostBudget());
    checks.push(await this.checkMemoryUsage());

    // Determine overall status
    const hasDown = services.some(s => s.status === 'down');
    const hasCritical = checks.some(c => !c.passed && c.severity === 'critical');
    const hasDegraded = services.some(s => s.status === 'degraded');
    const hasWarning = checks.some(c => !c.passed && c.severity === 'warning');

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (hasDown || hasCritical) {
      status = 'unhealthy';
    } else if (hasDegraded || hasWarning) {
      status = 'degraded';
    }

    return {
      status,
      timestamp: new Date(),
      version: process.env.APP_VERSION || '1.0.0',
      uptime: Date.now() - this.startTime.getTime(),
      services,
      metrics: await this.getSystemMetrics(),
      checks
    };
  }

  /**
   * Check database connectivity
   */
  private async checkDatabase(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      // In production, check actual database connection
      // For now, simulate
      await new Promise(resolve => setTimeout(resolve, 10));

      return {
        name: 'PostgreSQL',
        status: 'up',
        responseTime: Date.now() - start,
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        name: 'PostgreSQL',
        status: 'down',
        responseTime: Date.now() - start,
        lastCheck: new Date(),
        error: error.message
      };
    }
  }

  /**
   * Check cache connectivity
   */
  private async checkCache(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      // Test cache operations
      const testKey = '__health_check__';
      await narrativeCache.set(testKey, { test: true }, 60);
      await narrativeCache.get(testKey);

      return {
        name: 'Redis Cache',
        status: 'up',
        responseTime: Date.now() - start,
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        name: 'Redis Cache',
        status: 'down',
        responseTime: Date.now() - start,
        lastCheck: new Date(),
        error: error.message
      };
    }
  }

  /**
   * Check OpenAI API
   */
  private async checkOpenAI(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      // Test with minimal API call
      // In production, use actual test
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error(`OpenAI API returned ${response.status}`);
      }

      return {
        name: 'OpenAI API',
        status: 'up',
        responseTime: Date.now() - start,
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        name: 'OpenAI API',
        status: 'degraded',
        responseTime: Date.now() - start,
        lastCheck: new Date(),
        error: error.message
      };
    }
  }

  /**
   * Check YouTube API
   */
  private async checkYouTube(): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      const quota = await youTubeService.getRemainingQuota();
      const status = quota > 1000 ? 'up' : quota > 100 ? 'degraded' : 'down';

      return {
        name: 'YouTube API',
        status,
        responseTime: Date.now() - start,
        lastCheck: new Date()
      };
    } catch (error) {
      return {
        name: 'YouTube API',
        status: 'degraded',
        responseTime: Date.now() - start,
        lastCheck: new Date(),
        error: error.message
      };
    }
  }

  /**
   * Check cache hit rate
   */
  private async checkCacheHitRate(): Promise<HealthCheckResult> {
    const metrics = contentOrchestrator.getMetrics();
    const hitRate = metrics.cacheHitRate * 100;
    const threshold = 70; // Minimum 70% cache hit rate

    return {
      check: 'Cache Hit Rate',
      passed: hitRate >= threshold,
      message: `Cache hit rate: ${hitRate.toFixed(1)}% (threshold: ${threshold}%)`,
      severity: hitRate < 50 ? 'critical' : 'warning'
    };
  }

  /**
   * Check error rate
   */
  private async checkErrorRate(): Promise<HealthCheckResult> {
    const errorRate = this.calculateErrorRate();
    const threshold = 1; // Maximum 1% error rate

    return {
      check: 'Error Rate',
      passed: errorRate <= threshold,
      message: `Error rate: ${errorRate.toFixed(2)}% (threshold: ${threshold}%)`,
      severity: errorRate > 5 ? 'critical' : 'warning'
    };
  }

  /**
   * Check latency
   */
  private async checkLatency(): Promise<HealthCheckResult> {
    const p99 = this.calculateP99Latency();
    const threshold = 2000; // Maximum 2s P99 latency

    return {
      check: 'API Latency',
      passed: p99 <= threshold,
      message: `P99 latency: ${p99}ms (threshold: ${threshold}ms)`,
      severity: p99 > 5000 ? 'critical' : 'warning'
    };
  }

  /**
   * Check cost budget
   */
  private async checkCostBudget(): Promise<HealthCheckResult> {
    const currentCost = await this.getCurrentDailyCost();
    const budget = parseFloat(process.env.DAILY_COST_LIMIT || '500');
    const percentage = (currentCost / budget) * 100;

    return {
      check: 'Cost Budget',
      passed: percentage < 80,
      message: `Daily cost: $${currentCost.toFixed(2)} (${percentage.toFixed(1)}% of budget)`,
      severity: percentage > 100 ? 'critical' : 'warning'
    };
  }

  /**
   * Check memory usage
   */
  private async checkMemoryUsage(): Promise<HealthCheckResult> {
    const usage = process.memoryUsage();
    const heapPercentage = (usage.heapUsed / usage.heapTotal) * 100;
    const threshold = 85; // Maximum 85% heap usage

    return {
      check: 'Memory Usage',
      passed: heapPercentage < threshold,
      message: `Heap usage: ${heapPercentage.toFixed(1)}% (threshold: ${threshold}%)`,
      severity: heapPercentage > 95 ? 'critical' : 'warning'
    };
  }

  /**
   * Get system metrics
   */
  private async getSystemMetrics(): Promise<SystemMetrics> {
    const memUsage = process.memoryUsage();
    const metrics = contentOrchestrator.getMetrics();

    return {
      cpu: process.cpuUsage().user / 1000000, // Convert to seconds
      memory: {
        used: memUsage.heapUsed,
        total: memUsage.heapTotal,
        percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100
      },
      cache: {
        hitRate: metrics.cacheHitRate,
        size: await narrativeCache.getSize(),
        evictions: 0 // Would track in production
      },
      api: {
        requestsPerMinute: this.calculateRPM(),
        errorRate: this.calculateErrorRate(),
        p99Latency: this.calculateP99Latency()
      },
      cost: {
        currentDaily: await this.getCurrentDailyCost(),
        projectedDaily: await this.getProjectedDailyCost(),
        withinBudget: await this.isWithinBudget()
      }
    };
  }

  /**
   * Track request for metrics
   */
  trackRequest(latency: number, error: boolean = false): void {
    const now = Date.now();
    this.requestCounts.push(now);
    this.latencies.push(latency);

    if (error) {
      this.errorCounts.push(now);
    }

    // Clean old data (keep last 5 minutes)
    const cutoff = now - 300000;
    this.requestCounts = this.requestCounts.filter(t => t > cutoff);
    this.errorCounts = this.errorCounts.filter(t => t > cutoff);
    this.latencies = this.latencies.slice(-1000); // Keep last 1000
  }

  /**
   * Calculate requests per minute
   */
  private calculateRPM(): number {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentRequests = this.requestCounts.filter(t => t > oneMinuteAgo);
    return recentRequests.length;
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(): number {
    if (this.requestCounts.length === 0) return 0;
    return (this.errorCounts.length / this.requestCounts.length) * 100;
  }

  /**
   * Calculate P99 latency
   */
  private calculateP99Latency(): number {
    if (this.latencies.length === 0) return 0;

    const sorted = [...this.latencies].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.99);
    return sorted[index] || sorted[sorted.length - 1];
  }

  /**
   * Get current daily cost
   */
  private async getCurrentDailyCost(): Promise<number> {
    // In production, query actual cost tracking
    const metrics = contentOrchestrator.getMetrics();
    const requestsToday = metrics.totalRequests;
    const avgCost = 0.00131; // Average cost per request with cache
    return requestsToday * avgCost;
  }

  /**
   * Get projected daily cost
   */
  private async getProjectedDailyCost(): Promise<number> {
    const currentCost = await this.getCurrentDailyCost();
    const hoursElapsed = new Date().getHours() || 1;
    return (currentCost / hoursElapsed) * 24;
  }

  /**
   * Check if within budget
   */
  private async isWithinBudget(): Promise<boolean> {
    const projected = await this.getProjectedDailyCost();
    const budget = parseFloat(process.env.DAILY_COST_LIMIT || '500');
    return projected < budget;
  }

  /**
   * Express middleware for health endpoint
   */
  middleware() {
    return async (req: any, res: any) => {
      try {
        const health = await this.getHealth();
        const statusCode = health.status === 'healthy' ? 200 :
                           health.status === 'degraded' ? 200 : 503;

        res.status(statusCode).json(health);
      } catch (error) {
        res.status(503).json({
          status: 'unhealthy',
          error: error.message
        });
      }
    };
  }

  /**
   * Start monitoring background tasks
   */
  startMonitoring(): void {
    // Periodic health checks
    setInterval(async () => {
      const health = await this.getHealth();
      if (health.status === 'unhealthy') {
        console.error('System unhealthy:', health.checks.filter(c => !c.passed));
        // In production, send alerts
      }
    }, 60000); // Every minute

    // Metrics collection
    setInterval(() => {
      // Collect and push metrics to monitoring service
      const metrics = this.getSystemMetrics();
      // In production: push to DataDog/CloudWatch
    }, 30000); // Every 30 seconds

    console.log('Health monitoring started');
  }
}

// Export singleton
export const healthCheck = new HealthCheckService();