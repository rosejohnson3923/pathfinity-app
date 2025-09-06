/**
 * PATHFINITY PERFORMANCE VALIDATION
 * Comprehensive performance testing execution for Phase 05
 */

import { PerformanceCollector } from '../performance/loadTesting.js';
import { performanceMonitor } from '../performance/performanceMonitor';

interface PerformanceThresholds {
  responseTime: {
    api: number;
    aiCharacter: number;
    dashboard: number;
  };
  throughput: {
    minRequestsPerSecond: number;
  };
  errorRate: {
    maxPercentage: number;
  };
  resources: {
    maxCpuUsage: number;
    maxMemoryUsage: number;
  };
  availability: {
    minUptime: number;
  };
}

interface ValidationResult {
  category: string;
  metric: string;
  expected: number | string;
  actual: number | string;
  passed: boolean;
  severity: 'info' | 'warning' | 'critical';
  details?: string;
}

interface PerformanceValidationReport {
  timestamp: Date;
  environment: string;
  testDuration: string;
  overallStatus: 'PASS' | 'FAIL' | 'WARNING';
  summary: {
    totalTests: number;
    passed: number;
    failed: number;
    warnings: number;
  };
  results: ValidationResult[];
  recommendations: string[];
  nextActions: string[];
}

export class PerformanceValidator {
  private baseUrl: string;
  private thresholds: PerformanceThresholds;
  private results: ValidationResult[] = [];

  constructor(baseUrl: string = 'https://uat.pathfinity.ai') {
    this.baseUrl = baseUrl;
    this.thresholds = {
      responseTime: {
        api: 1000,        // 1 second for API calls
        aiCharacter: 5000, // 5 seconds for AI responses
        dashboard: 2000    // 2 seconds for dashboard load
      },
      throughput: {
        minRequestsPerSecond: 50
      },
      errorRate: {
        maxPercentage: 1 // 1% error rate
      },
      resources: {
        maxCpuUsage: 80,   // 80% CPU usage
        maxMemoryUsage: 85 // 85% memory usage
      },
      availability: {
        minUptime: 99.9    // 99.9% uptime
      }
    };
  }

  async executeFullValidation(): Promise<PerformanceValidationReport> {
    console.log('🚀 Starting comprehensive performance validation...');
    const startTime = Date.now();

    try {
      // Reset results
      this.results = [];

      // Execute all performance tests
      await this.validateResponseTimes();
      await this.validateThroughputCapacity();
      await this.validateConcurrentUserLoad();
      await this.validateAICharacterPerformance();
      await this.validateDatabasePerformance();
      await this.validateResourceUtilization();
      await this.validateScalability();
      await this.validateCacheEffectiveness();

      const duration = Date.now() - startTime;
      return this.generateValidationReport(duration);

    } catch (error) {
      console.error('❌ Performance validation failed:', error);
      throw error;
    }
  }

  private async validateResponseTimes(): Promise<void> {
    console.log('⏱️ Validating response times...');

    const endpoints = [
      { name: 'Dashboard Load', url: '/dashboard', threshold: this.thresholds.responseTime.dashboard },
      { name: 'User Profile', url: '/api/profile', threshold: this.thresholds.responseTime.api },
      { name: 'Assessment List', url: '/api/assessments', threshold: this.thresholds.responseTime.api },
      { name: 'Analytics Data', url: '/api/analytics/progress', threshold: this.thresholds.responseTime.api },
      { name: 'Content Library', url: '/api/content', threshold: this.thresholds.responseTime.api }
    ];

    for (const endpoint of endpoints) {
      const startTime = performance.now();
      
      try {
        const response = await fetch(`${this.baseUrl}${endpoint.url}`, {
          headers: {
            'Authorization': 'Bearer test-token',
            'Accept': 'application/json'
          }
        });

        const responseTime = performance.now() - startTime;
        
        this.results.push({
          category: 'Response Time',
          metric: endpoint.name,
          expected: `<${endpoint.threshold}ms`,
          actual: `${Math.round(responseTime)}ms`,
          passed: responseTime < endpoint.threshold,
          severity: responseTime > endpoint.threshold * 1.5 ? 'critical' : responseTime > endpoint.threshold ? 'warning' : 'info'
        });

      } catch (error) {
        this.results.push({
          category: 'Response Time',
          metric: endpoint.name,
          expected: `<${endpoint.threshold}ms`,
          actual: 'FAILED',
          passed: false,
          severity: 'critical',
          details: `Request failed: ${error}`
        });
      }
    }
  }

  private async validateThroughputCapacity(): Promise<void> {
    console.log('📊 Validating throughput capacity...');

    const collector = new PerformanceCollector();
    const testDuration = 60000; // 1 minute
    const requestInterval = 100; // 10 requests per second

    const startTime = Date.now();
    let requestCount = 0;
    let successCount = 0;

    while (Date.now() - startTime < testDuration) {
      const promises = Array.from({ length: 10 }, async () => {
        const reqStart = performance.now();
        try {
          const response = await fetch(`${this.baseUrl}/api/health`);
          const responseTime = performance.now() - reqStart;
          
          collector.recordResponse(responseTime, '/api/health', response.status);
          
          if (response.ok) successCount++;
          return response.ok;
        } catch (error) {
          collector.recordResponse(5000, '/api/health', 500);
          return false;
        }
      });

      await Promise.all(promises);
      requestCount += 10;
      
      await new Promise(resolve => setTimeout(resolve, requestInterval));
    }

    const actualThroughput = (requestCount / testDuration) * 1000; // requests per second
    const successRate = (successCount / requestCount) * 100;

    this.results.push({
      category: 'Throughput',
      metric: 'Requests per Second',
      expected: `>${this.thresholds.throughput.minRequestsPerSecond}`,
      actual: Math.round(actualThroughput).toString(),
      passed: actualThroughput >= this.thresholds.throughput.minRequestsPerSecond,
      severity: actualThroughput < this.thresholds.throughput.minRequestsPerSecond * 0.5 ? 'critical' : 'warning'
    });

    this.results.push({
      category: 'Throughput',
      metric: 'Success Rate',
      expected: '>99%',
      actual: `${successRate.toFixed(1)}%`,
      passed: successRate >= 99,
      severity: successRate < 95 ? 'critical' : successRate < 99 ? 'warning' : 'info'
    });
  }

  private async validateConcurrentUserLoad(): Promise<void> {
    console.log('👥 Validating concurrent user load...');

    const concurrentUsers = [50, 100, 200, 300];
    
    for (const userCount of concurrentUsers) {
      const startTime = performance.now();
      
      // Simulate concurrent user sessions
      const userPromises = Array.from({ length: userCount }, async (_, index) => {
        try {
          // Simulate user journey: login -> dashboard -> AI interaction
          const loginResponse = await fetch(`${this.baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: `user${index}@test.com`,
              password: 'testpassword'
            })
          });

          const dashboardResponse = await fetch(`${this.baseUrl}/dashboard`);
          
          const aiResponse = await fetch(`${this.baseUrl}/api/characters/finn/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: 'Hello Finn!'
            })
          });

          return {
            success: loginResponse.ok && dashboardResponse.ok && aiResponse.ok,
            responseTime: performance.now() - startTime
          };
        } catch (error) {
          return { success: false, responseTime: performance.now() - startTime };
        }
      });

      const results = await Promise.all(userPromises);
      const successCount = results.filter(r => r.success).length;
      const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
      const successRate = (successCount / userCount) * 100;

      this.results.push({
        category: 'Concurrent Load',
        metric: `${userCount} Concurrent Users - Success Rate`,
        expected: '>95%',
        actual: `${successRate.toFixed(1)}%`,
        passed: successRate >= 95,
        severity: successRate < 90 ? 'critical' : successRate < 95 ? 'warning' : 'info'
      });

      this.results.push({
        category: 'Concurrent Load',
        metric: `${userCount} Concurrent Users - Avg Response Time`,
        expected: '<3000ms',
        actual: `${Math.round(avgResponseTime)}ms`,
        passed: avgResponseTime < 3000,
        severity: avgResponseTime > 5000 ? 'critical' : avgResponseTime > 3000 ? 'warning' : 'info'
      });
    }
  }

  private async validateAICharacterPerformance(): Promise<void> {
    console.log('🤖 Validating AI character performance...');

    const characters = ['finn', 'sage', 'spark', 'harmony'];
    const testMessages = [
      'Hello! Can you help me with counting?',
      'What is photosynthesis?',
      'Explain fractions to me',
      'Tell me about the solar system'
    ];

    for (const character of characters) {
      const responseTimes: number[] = [];
      
      for (const message of testMessages) {
        const startTime = performance.now();
        
        try {
          const response = await fetch(`${this.baseUrl}/api/characters/${character}/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer test-token'
            },
            body: JSON.stringify({ message })
          });

          const responseTime = performance.now() - startTime;
          responseTimes.push(responseTime);

          if (!response.ok) {
            this.results.push({
              category: 'AI Performance',
              metric: `${character} - Response Status`,
              expected: '200 OK',
              actual: `${response.status} ${response.statusText}`,
              passed: false,
              severity: 'critical'
            });
          }

        } catch (error) {
          responseTimes.push(10000); // Timeout value
          this.results.push({
            category: 'AI Performance',
            metric: `${character} - Request Error`,
            expected: 'Success',
            actual: `Error: ${error}`,
            passed: false,
            severity: 'critical'
          });
        }
      }

      const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);

      this.results.push({
        category: 'AI Performance',
        metric: `${character} - Average Response Time`,
        expected: `<${this.thresholds.responseTime.aiCharacter}ms`,
        actual: `${Math.round(avgResponseTime)}ms`,
        passed: avgResponseTime < this.thresholds.responseTime.aiCharacter,
        severity: avgResponseTime > this.thresholds.responseTime.aiCharacter * 1.5 ? 'critical' : 'warning'
      });

      this.results.push({
        category: 'AI Performance',
        metric: `${character} - Max Response Time`,
        expected: `<${this.thresholds.responseTime.aiCharacter * 2}ms`,
        actual: `${Math.round(maxResponseTime)}ms`,
        passed: maxResponseTime < this.thresholds.responseTime.aiCharacter * 2,
        severity: maxResponseTime > this.thresholds.responseTime.aiCharacter * 3 ? 'critical' : 'warning'
      });
    }
  }

  private async validateDatabasePerformance(): Promise<void> {
    console.log('🗄️ Validating database performance...');

    const dbOperations = [
      { name: 'User Lookup', operation: 'SELECT * FROM users WHERE email = $1 LIMIT 1' },
      { name: 'Student Progress', operation: 'SELECT * FROM learning_analytics_events WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 50' },
      { name: 'Classroom Data', operation: 'SELECT * FROM classrooms WHERE teacher_id = $1' },
      { name: 'Assessment Results', operation: 'SELECT * FROM assessment_responses WHERE user_id = $1 ORDER BY completed_at DESC' }
    ];

    for (const op of dbOperations) {
      const startTime = performance.now();
      
      try {
        // Simulate database query through API
        const response = await fetch(`${this.baseUrl}/api/internal/db-test`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer admin-token'
          },
          body: JSON.stringify({
            operation: op.name,
            query: op.operation
          })
        });

        const queryTime = performance.now() - startTime;

        this.results.push({
          category: 'Database Performance',
          metric: op.name,
          expected: '<500ms',
          actual: `${Math.round(queryTime)}ms`,
          passed: queryTime < 500,
          severity: queryTime > 1000 ? 'critical' : queryTime > 500 ? 'warning' : 'info'
        });

      } catch (error) {
        this.results.push({
          category: 'Database Performance',
          metric: op.name,
          expected: '<500ms',
          actual: 'FAILED',
          passed: false,
          severity: 'critical',
          details: `Database operation failed: ${error}`
        });
      }
    }
  }

  private async validateResourceUtilization(): Promise<void> {
    console.log('💻 Validating resource utilization...');

    try {
      // Get system metrics from monitoring endpoint
      const response = await fetch(`${this.baseUrl}/api/monitoring/metrics`, {
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      });

      if (response.ok) {
        const metrics = await response.json();

        this.results.push({
          category: 'Resource Utilization',
          metric: 'CPU Usage',
          expected: `<${this.thresholds.resources.maxCpuUsage}%`,
          actual: `${metrics.cpu.usage}%`,
          passed: metrics.cpu.usage < this.thresholds.resources.maxCpuUsage,
          severity: metrics.cpu.usage > 90 ? 'critical' : metrics.cpu.usage > this.thresholds.resources.maxCpuUsage ? 'warning' : 'info'
        });

        this.results.push({
          category: 'Resource Utilization',
          metric: 'Memory Usage',
          expected: `<${this.thresholds.resources.maxMemoryUsage}%`,
          actual: `${metrics.memory.usage}%`,
          passed: metrics.memory.usage < this.thresholds.resources.maxMemoryUsage,
          severity: metrics.memory.usage > 95 ? 'critical' : metrics.memory.usage > this.thresholds.resources.maxMemoryUsage ? 'warning' : 'info'
        });

        this.results.push({
          category: 'Resource Utilization',
          metric: 'Disk Usage',
          expected: '<90%',
          actual: `${metrics.disk.usage}%`,
          passed: metrics.disk.usage < 90,
          severity: metrics.disk.usage > 95 ? 'critical' : metrics.disk.usage > 90 ? 'warning' : 'info'
        });
      }

    } catch (error) {
      this.results.push({
        category: 'Resource Utilization',
        metric: 'Metrics Collection',
        expected: 'Available',
        actual: 'FAILED',
        passed: false,
        severity: 'warning',
        details: `Could not retrieve system metrics: ${error}`
      });
    }
  }

  private async validateScalability(): Promise<void> {
    console.log('📈 Validating scalability...');

    // Test auto-scaling behavior by gradually increasing load
    const loadLevels = [50, 100, 200, 400];
    
    for (const load of loadLevels) {
      console.log(`Testing with ${load} concurrent requests...`);
      
      const startTime = performance.now();
      const promises = Array.from({ length: load }, async () => {
        try {
          const response = await fetch(`${this.baseUrl}/api/health`);
          return {
            success: response.ok,
            responseTime: performance.now() - startTime
          };
        } catch (error) {
          return { success: false, responseTime: 5000 };
        }
      });

      const results = await Promise.all(promises);
      const successRate = (results.filter(r => r.success).length / load) * 100;
      const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;

      this.results.push({
        category: 'Scalability',
        metric: `Load Level ${load} - Success Rate`,
        expected: '>95%',
        actual: `${successRate.toFixed(1)}%`,
        passed: successRate >= 95,
        severity: successRate < 90 ? 'critical' : successRate < 95 ? 'warning' : 'info'
      });

      // Wait between tests to allow system to stabilize
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  private async validateCacheEffectiveness(): Promise<void> {
    console.log('🏪 Validating cache effectiveness...');

    const cachableEndpoints = [
      '/api/content/curriculum',
      '/api/assessments/templates',
      '/api/characters/avatars'
    ];

    for (const endpoint of cachableEndpoints) {
      // First request (cache miss)
      const startTime1 = performance.now();
      await fetch(`${this.baseUrl}${endpoint}`);
      const firstRequestTime = performance.now() - startTime1;

      // Second request (should be cache hit)
      const startTime2 = performance.now();
      await fetch(`${this.baseUrl}${endpoint}`);
      const secondRequestTime = performance.now() - startTime2;

      const cacheEffectiveness = ((firstRequestTime - secondRequestTime) / firstRequestTime) * 100;

      this.results.push({
        category: 'Cache Performance',
        metric: `${endpoint} - Cache Hit Improvement`,
        expected: '>50%',
        actual: `${cacheEffectiveness.toFixed(1)}%`,
        passed: cacheEffectiveness > 50,
        severity: cacheEffectiveness < 25 ? 'warning' : 'info',
        details: `First: ${Math.round(firstRequestTime)}ms, Second: ${Math.round(secondRequestTime)}ms`
      });
    }
  }

  private generateValidationReport(testDuration: number): PerformanceValidationReport {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const warnings = this.results.filter(r => r.severity === 'warning').length;
    const critical = this.results.filter(r => r.severity === 'critical').length;

    let overallStatus: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
    if (critical > 0) overallStatus = 'FAIL';
    else if (warnings > 0 || failed > 0) overallStatus = 'WARNING';

    const recommendations = this.generateRecommendations();
    const nextActions = this.generateNextActions(overallStatus);

    return {
      timestamp: new Date(),
      environment: this.baseUrl,
      testDuration: `${Math.round(testDuration / 1000)}s`,
      overallStatus,
      summary: {
        totalTests: this.results.length,
        passed,
        failed,
        warnings
      },
      results: this.results,
      recommendations,
      nextActions
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    const criticalResults = this.results.filter(r => r.severity === 'critical');
    const warningResults = this.results.filter(r => r.severity === 'warning');

    if (criticalResults.length > 0) {
      recommendations.push('Address critical performance issues before production deployment');
    }

    if (warningResults.some(r => r.category === 'AI Performance')) {
      recommendations.push('Consider implementing AI response caching to improve performance');
    }

    if (warningResults.some(r => r.category === 'Database Performance')) {
      recommendations.push('Review database indexes and query optimization');
    }

    if (warningResults.some(r => r.category === 'Resource Utilization')) {
      recommendations.push('Consider scaling up infrastructure resources');
    }

    if (warningResults.some(r => r.category === 'Concurrent Load')) {
      recommendations.push('Implement additional load balancing and auto-scaling policies');
    }

    return recommendations;
  }

  private generateNextActions(overallStatus: string): string[] {
    const actions: string[] = [];

    switch (overallStatus) {
      case 'FAIL':
        actions.push('DO NOT PROCEED to production deployment');
        actions.push('Address all critical performance issues');
        actions.push('Re-run performance validation after fixes');
        actions.push('Consider infrastructure scaling');
        break;
      
      case 'WARNING':
        actions.push('Review warning-level issues with stakeholders');
        actions.push('Implement performance optimizations');
        actions.push('Consider limited production deployment with monitoring');
        actions.push('Plan follow-up performance optimization sprint');
        break;
      
      case 'PASS':
        actions.push('Performance validation complete - ready for production');
        actions.push('Continue with deployment preparation');
        actions.push('Implement production monitoring and alerting');
        actions.push('Schedule regular performance reviews');
        break;
    }

    return actions;
  }

  async exportResults(filePath: string): Promise<void> {
    const report = this.generateValidationReport(0);
    const reportData = JSON.stringify(report, null, 2);
    
    try {
      await Deno.writeTextFile(filePath, reportData);
      console.log(`📊 Performance validation report exported to: ${filePath}`);
    } catch (error) {
      console.error('Failed to export results:', error);
    }
  }
}

// CLI execution
if (require.main === module) {
  const validator = new PerformanceValidator();
  
  validator.executeFullValidation()
    .then(report => {
      console.log('\n📊 PERFORMANCE VALIDATION REPORT');
      console.log('================================');
      console.log(`Status: ${report.overallStatus}`);
      console.log(`Tests: ${report.summary.passed}/${report.summary.totalTests} passed`);
      console.log(`Duration: ${report.testDuration}`);
      
      if (report.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        report.recommendations.forEach(rec => console.log(`  - ${rec}`));
      }
      
      if (report.nextActions.length > 0) {
        console.log('\n🎯 Next Actions:');
        report.nextActions.forEach(action => console.log(`  - ${action}`));
      }
      
      console.log(`\n${report.overallStatus === 'PASS' ? '✅' : report.overallStatus === 'WARNING' ? '⚠️' : '❌'} Performance validation ${report.overallStatus.toLowerCase()}`);
    })
    .catch(error => {
      console.error('💥 Performance validation failed:', error);
      process.exit(1);
    });
}

export default PerformanceValidator;