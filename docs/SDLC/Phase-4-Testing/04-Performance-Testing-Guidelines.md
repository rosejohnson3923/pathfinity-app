# Performance Testing Guidelines
## Pathfinity Revolutionary Learning Platform

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Active Guidelines  
**Owner:** Performance Engineering Team  
**Reviewed By:** DevOps Director, CTO, Infrastructure Team

---

## Executive Summary

This document defines Pathfinity's performance testing guidelines to ensure our revolutionary platform scales to millions of students while maintaining <$0.05 per student per day economics. Performance is not just a feature - it's fundamental to delivering Career-First education at scale. These guidelines ensure every student experiences sub-2-second response times regardless of load.

---

## 1. Performance Requirements and SLAs

### 1.1 Core Performance Targets

```yaml
Performance SLAs:
  Response Times:
    Career Selection: < 500ms (p95)
    Content Generation: < 3s (p95)
    Page Load: < 2s (p95)
    API Calls: < 200ms (p95)
    Real-time Updates: < 100ms (p95)
    
  Throughput:
    Concurrent Users: 100,000 minimum
    Requests/Second: 50,000 sustained
    Career Selections/Hour: 500,000
    Content Generations/Minute: 10,000
    
  Resource Efficiency:
    CPU Utilization: < 70% at peak
    Memory Usage: < 80% at peak
    Cost per Transaction: < $0.001
    Cache Hit Rate: > 80%
    
  Reliability:
    Uptime: 99.9% (43.2 min/month)
    Error Rate: < 0.1%
    Degradation Threshold: 10% slowdown
    Recovery Time: < 5 minutes
```

### 1.2 User Experience Metrics

```typescript
interface UserExperienceMetrics {
  // Core Web Vitals
  LCP: number;  // Largest Contentful Paint < 2.5s
  FID: number;  // First Input Delay < 100ms
  CLS: number;  // Cumulative Layout Shift < 0.1
  
  // Custom Metrics
  TTI: number;  // Time to Interactive < 3s
  TTC: number;  // Time to Career (selection) < 5s
  FCP: number;  // First Contentful Paint < 1s
  
  // PathIQ Metrics
  flowStateLatency: number;  // < 50ms
  personalizationDelay: number;  // < 100ms
  predictionAccuracy: number;  // > 85%
}

// Performance budget enforcement
const performanceBudget = {
  javascript: 200 * 1024,     // 200KB
  css: 50 * 1024,            // 50KB
  images: 500 * 1024,        // 500KB per page
  fonts: 100 * 1024,         // 100KB
  total: 1024 * 1024,        // 1MB total
};
```

---

## 2. Performance Test Types

### 2.1 Load Testing

**Purpose:** Validate system behavior under expected load  
**Frequency:** Daily in CI/CD, Weekly full suite

```javascript
// K6 Load Test Script
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const careerSelectionDuration = new Trend('career_selection_duration');
const contentGenerationDuration = new Trend('content_generation_duration');
const errorRate = new Rate('errors');

export const options = {
  scenarios: {
    normal_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 1000 },   // Ramp up to 1000 users
        { duration: '30m', target: 1000 },  // Stay at 1000 for 30 minutes
        { duration: '5m', target: 0 },      // Ramp down to 0
      ],
      gracefulRampDown: '30s',
    },
    peak_hours: {
      executor: 'ramping-vus',
      startTime: '10m',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 5000 },   // Morning peak
        { duration: '15m', target: 5000 },
        { duration: '5m', target: 2000 },   // Mid-day
        { duration: '10m', target: 2000 },
        { duration: '5m', target: 8000 },   // Afternoon peak
        { duration: '15m', target: 8000 },
        { duration: '5m', target: 0 },
      ],
    },
  },
  thresholds: {
    'http_req_duration': ['p(95)<2000'],
    'career_selection_duration': ['p(95)<500'],
    'content_generation_duration': ['p(95)<3000'],
    'errors': ['rate<0.01'],
  },
};

export default function() {
  const studentId = `student_${__VU}_${__ITER}`;
  
  group('Career Selection Flow', () => {
    // Get available careers
    const poolStart = Date.now();
    const poolResponse = http.get(
      `${BASE_URL}/api/v1/students/${studentId}/careers/pool`,
      { tags: { name: 'GetCareerPool' } }
    );
    
    check(poolResponse, {
      'career pool retrieved': (r) => r.status === 200,
      'pool contains 4 careers': (r) => JSON.parse(r.body).careers.length === 4,
    });
    
    if (poolResponse.status !== 200) {
      errorRate.add(1);
      return;
    }
    
    // Select a career
    const careers = JSON.parse(poolResponse.body).careers;
    const selectedCareer = careers[Math.floor(Math.random() * careers.length)];
    
    const selectionStart = Date.now();
    const selectionResponse = http.post(
      `${BASE_URL}/api/v1/students/${studentId}/careers/select`,
      JSON.stringify({ careerId: selectedCareer.id }),
      {
        headers: { 'Content-Type': 'application/json' },
        tags: { name: 'SelectCareer' }
      }
    );
    
    careerSelectionDuration.add(Date.now() - selectionStart);
    
    check(selectionResponse, {
      'career selected': (r) => r.status === 200,
      'session created': (r) => JSON.parse(r.body).sessionId !== undefined,
    });
    
    if (selectionResponse.status !== 200) {
      errorRate.add(1);
      return;
    }
    
    const sessionId = JSON.parse(selectionResponse.body).sessionId;
    
    // Generate content
    const contentStart = Date.now();
    const contentResponse = http.get(
      `${BASE_URL}/api/v1/sessions/${sessionId}/content`,
      { tags: { name: 'GenerateContent' } }
    );
    
    contentGenerationDuration.add(Date.now() - contentStart);
    
    check(contentResponse, {
      'content generated': (r) => r.status === 200,
      'containers present': (r) => {
        const content = JSON.parse(r.body);
        return content.learn && content.experience && content.discover;
      },
    });
  });
  
  group('Learning Session', () => {
    // Simulate learning interactions
    for (let i = 0; i < 10; i++) {
      const interactionResponse = http.post(
        `${BASE_URL}/api/v1/sessions/${sessionId}/interact`,
        JSON.stringify({
          type: 'answer',
          data: { questionId: i, answer: Math.random() > 0.7 }
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          tags: { name: 'StudentInteraction' }
        }
      );
      
      check(interactionResponse, {
        'interaction recorded': (r) => r.status === 200,
      });
      
      sleep(Math.random() * 2 + 1); // Simulate thinking time
    }
  });
  
  // PathIQ monitoring
  group('PathIQ Analysis', () => {
    const flowResponse = http.get(
      `${BASE_URL}/api/v1/students/${studentId}/flow-state`,
      { tags: { name: 'GetFlowState' } }
    );
    
    check(flowResponse, {
      'flow state retrieved': (r) => r.status === 200,
      'flow percentage valid': (r) => {
        const flow = JSON.parse(r.body).percentage;
        return flow >= 0 && flow <= 100;
      },
    });
  });
  
  sleep(1);
}

// Teardown function for cleanup
export function teardown(data) {
  console.log('Performance Test Summary:');
  console.log(`  Career Selection p95: ${careerSelectionDuration.p(95)}ms`);
  console.log(`  Content Generation p95: ${contentGenerationDuration.p(95)}ms`);
  console.log(`  Error Rate: ${errorRate.rate * 100}%`);
}
```

### 2.2 Stress Testing

**Purpose:** Find breaking points and degradation patterns  
**Frequency:** Weekly

```javascript
// Stress Test Configuration
export const stressTestOptions = {
  scenarios: {
    stress_test: {
      executor: 'ramping-vus',
      stages: [
        { duration: '2m', target: 100 },     // Below normal load
        { duration: '5m', target: 100 },     
        { duration: '2m', target: 1000 },    // Normal load
        { duration: '5m', target: 1000 },    
        { duration: '2m', target: 5000 },    // Above normal load
        { duration: '5m', target: 5000 },    
        { duration: '2m', target: 10000 },   // Stress load
        { duration: '5m', target: 10000 },   
        { duration: '2m', target: 20000 },   // Extreme stress
        { duration: '5m', target: 20000 },   
        { duration: '10m', target: 0 },      // Recovery
      ],
    },
  },
  thresholds: {
    'http_req_duration': ['p(95)<5000'], // Relaxed for stress
    'http_req_failed': ['rate<0.1'],     // 10% error rate acceptable
  },
};

// Stress test specific checks
export default function() {
  const response = http.get(`${BASE_URL}/api/v1/health`);
  
  check(response, {
    'system responds': (r) => r.status !== 0,
    'not in maintenance': (r) => r.status !== 503,
    'degraded mode active': (r) => {
      if (r.status === 200) {
        const health = JSON.parse(r.body);
        return health.status === 'degraded' || health.status === 'healthy';
      }
      return false;
    },
  });
  
  // Monitor resource exhaustion
  if (response.status === 429) {
    console.log('Rate limiting triggered');
  } else if (response.status === 503) {
    console.log('Service unavailable - circuit breaker open');
  }
}
```

### 2.3 Spike Testing

**Purpose:** Validate sudden traffic surge handling  
**Frequency:** Before major events

```javascript
// Spike Test - Simulates sudden traffic surge
export const spikeTestOptions = {
  scenarios: {
    spike: {
      executor: 'ramping-vus',
      stages: [
        { duration: '1m', target: 100 },    // Baseline
        { duration: '30s', target: 10000 }, // Sudden spike!
        { duration: '3m', target: 10000 },  // Sustained spike
        { duration: '30s', target: 100 },   // Quick drop
        { duration: '2m', target: 100 },    // Recovery period
        { duration: '30s', target: 0 },     
      ],
    },
  },
};

// Monitor auto-scaling behavior
export default function() {
  const startTime = Date.now();
  const response = http.get(`${BASE_URL}/api/v1/careers/trending`);
  const responseTime = Date.now() - startTime;
  
  check(response, {
    'handles spike': (r) => r.status === 200 || r.status === 429,
    'response time acceptable': () => responseTime < 5000,
    'cache utilized': (r) => r.headers['X-Cache'] === 'HIT',
  });
  
  // Track scaling metrics
  if (response.headers['X-Pod-Name']) {
    console.log(`Served by pod: ${response.headers['X-Pod-Name']}`);
  }
}
```

### 2.4 Soak Testing

**Purpose:** Identify memory leaks and degradation over time  
**Frequency:** Weekly overnight

```javascript
// Soak Test - 8 hour sustained load
export const soakTestOptions = {
  scenarios: {
    soak: {
      executor: 'constant-vus',
      vus: 5000,
      duration: '8h',
    },
  },
  thresholds: {
    'http_req_duration': [
      'p(95)<2000',      // Response time should remain consistent
      'p(95)<2000[59m]', // Even in the last hour
    ],
    'http_req_failed': ['rate<0.01'],
  },
};

// Monitor for degradation
let baselineResponseTime = null;

export default function() {
  const response = http.get(`${BASE_URL}/api/v1/students/dashboard`);
  
  if (!baselineResponseTime && response.timings.duration) {
    baselineResponseTime = response.timings.duration;
  }
  
  // Check for degradation
  if (baselineResponseTime && response.timings.duration) {
    const degradation = (response.timings.duration - baselineResponseTime) / baselineResponseTime;
    
    check(response, {
      'no significant degradation': () => degradation < 0.2, // 20% threshold
    });
    
    if (degradation > 0.1) {
      console.log(`Performance degradation detected: ${(degradation * 100).toFixed(2)}%`);
    }
  }
  
  // Monitor memory usage via custom endpoint
  if (__ITER % 1000 === 0) {
    const metricsResponse = http.get(`${BASE_URL}/api/v1/metrics/memory`);
    if (metricsResponse.status === 200) {
      const memory = JSON.parse(metricsResponse.body);
      console.log(`Memory usage: ${memory.heapUsed}MB / ${memory.heapTotal}MB`);
    }
  }
}
```

### 2.5 Volume Testing

**Purpose:** Validate data volume handling  
**Frequency:** Monthly

```javascript
// Volume Test - Large data sets
export default function() {
  const studentId = `volume_test_${__VU}`;
  
  group('Large Career History', () => {
    // Student with 1000+ career selections
    const historyResponse = http.get(
      `${BASE_URL}/api/v1/students/${studentId}/career-history?limit=1000`
    );
    
    check(historyResponse, {
      'handles large history': (r) => r.status === 200,
      'pagination works': (r) => JSON.parse(r.body).hasMore !== undefined,
      'response time acceptable': (r) => r.timings.duration < 3000,
    });
  });
  
  group('Bulk Operations', () => {
    // Bulk student creation for schools
    const students = Array.from({ length: 100 }, (_, i) => ({
      name: `Student ${i}`,
      grade: Math.floor(Math.random() * 12),
      schoolId: 'test-school',
    }));
    
    const bulkResponse = http.post(
      `${BASE_URL}/api/v1/schools/bulk-enroll`,
      JSON.stringify({ students }),
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: '30s',
      }
    );
    
    check(bulkResponse, {
      'bulk operation successful': (r) => r.status === 200,
      'all students created': (r) => JSON.parse(r.body).created === 100,
    });
  });
  
  group('Large Content Generation', () => {
    // Generate comprehensive report
    const reportResponse = http.post(
      `${BASE_URL}/api/v1/reports/generate`,
      JSON.stringify({
        type: 'comprehensive',
        studentIds: Array.from({ length: 500 }, (_, i) => `student_${i}`),
        dateRange: { start: '2024-01-01', end: '2024-12-31' },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: '60s',
      }
    );
    
    check(reportResponse, {
      'large report generated': (r) => r.status === 200,
      'async processing': (r) => JSON.parse(r.body).jobId !== undefined,
    });
  });
}
```

---

## 3. Performance Test Scenarios

### 3.1 Critical User Journeys

```typescript
// Critical journey performance tests
const criticalJourneys = [
  {
    name: 'Morning Login Surge',
    description: 'Students logging in 8-9 AM',
    scenario: {
      pattern: 'spike',
      duration: '1h',
      peakUsers: 50000,
      rampTime: '10m',
    },
    assertions: {
      loginTime: '<3s',
      careerSelectionTime: '<5s',
      errorRate: '<1%',
    },
  },
  {
    name: 'Career Selection Rush',
    description: 'Daily career selection period',
    scenario: {
      pattern: 'sustained',
      duration: '30m',
      users: 30000,
    },
    assertions: {
      selectionTime: '<500ms',
      transformationTime: '<2s',
      concurrentSelections: '>1000/s',
    },
  },
  {
    name: 'Parent Evening Access',
    description: 'Parents checking progress 6-8 PM',
    scenario: {
      pattern: 'gradual',
      duration: '2h',
      peakUsers: 20000,
    },
    assertions: {
      dashboardLoad: '<2s',
      reportGeneration: '<5s',
      errorRate: '<0.5%',
    },
  },
];

// Journey test implementation
class JourneyPerformanceTest {
  async testStudentMorningFlow(): Promise<TestResult> {
    const metrics = new MetricsCollector();
    
    // Step 1: Login
    metrics.startTimer('login');
    await this.login(this.studentCredentials);
    metrics.endTimer('login');
    
    // Step 2: Load dashboard
    metrics.startTimer('dashboard');
    await this.loadDashboard();
    metrics.endTimer('dashboard');
    
    // Step 3: Career selection
    metrics.startTimer('careerSelection');
    const careers = await this.getCareerPool();
    await this.selectCareer(careers[0]);
    metrics.endTimer('careerSelection');
    
    // Step 4: Content loading
    metrics.startTimer('contentLoad');
    await this.loadLearnContainer();
    metrics.endTimer('contentLoad');
    
    // Validate performance
    return {
      passed: metrics.allWithinThreshold({
        login: 3000,
        dashboard: 2000,
        careerSelection: 500,
        contentLoad: 2000,
      }),
      metrics: metrics.getSummary(),
    };
  }
}
```

### 3.2 API Performance Scenarios

```typescript
// API-specific performance tests
const apiPerformanceScenarios = {
  // GraphQL query performance
  graphqlQueries: {
    studentDashboard: {
      query: `
        query StudentDashboard($id: ID!) {
          student(id: $id) {
            profile { ... }
            currentCareer { ... }
            recentSessions(limit: 10) { ... }
            pathIQMetrics { ... }
            upcomingContent { ... }
          }
        }
      `,
      expectedTime: 500,
      complexity: 'high',
    },
    careerExploration: {
      query: `
        query CareerExploration($studentId: ID!) {
          availableCareers(studentId: $studentId) {
            careers { ... }
            passionCareer { ... }
            recommendations { ... }
          }
        }
      `,
      expectedTime: 300,
      complexity: 'medium',
    },
  },
  
  // REST endpoint performance
  restEndpoints: {
    '/api/v1/careers/select': {
      method: 'POST',
      expectedTime: 500,
      rateLimit: 100,
    },
    '/api/v1/content/generate': {
      method: 'GET',
      expectedTime: 3000,
      cacheExpected: true,
    },
    '/api/v1/pathiq/analyze': {
      method: 'POST',
      expectedTime: 200,
      priority: 'critical',
    },
  },
  
  // WebSocket performance
  websocketEvents: {
    'classroom.update': {
      expectedLatency: 100,
      messageSize: 1024,
      frequency: '10/s',
    },
    'student.progress': {
      expectedLatency: 200,
      messageSize: 512,
      frequency: '1/s',
    },
  },
};
```

---

## 4. Performance Monitoring

### 4.1 Real-Time Monitoring

```typescript
// Performance monitoring configuration
interface PerformanceMonitoring {
  metrics: {
    // Application metrics
    responseTime: MetricCollector;
    throughput: MetricCollector;
    errorRate: MetricCollector;
    
    // Business metrics
    careerSelectionsPerMinute: MetricCollector;
    contentGenerationsPerMinute: MetricCollector;
    activeUsers: MetricCollector;
    
    // Infrastructure metrics
    cpuUsage: MetricCollector;
    memoryUsage: MetricCollector;
    networkIO: MetricCollector;
    
    // Cache metrics
    cacheHitRate: MetricCollector;
    cacheMissLatency: MetricCollector;
    cacheEvictions: MetricCollector;
  };
  
  alerts: {
    responseTimeThreshold: 2000;
    errorRateThreshold: 0.01;
    cpuThreshold: 80;
    memoryThreshold: 85;
  };
  
  dashboards: {
    realtime: 'grafana.pathfinity.com/d/realtime';
    historical: 'grafana.pathfinity.com/d/historical';
    sla: 'grafana.pathfinity.com/d/sla';
  };
}

// Custom performance instrumentation
class PerformanceInstrumentation {
  private histogram = new Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500, 1000, 2000, 3000],
  });
  
  measureRequest(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      
      this.histogram.observe(
        {
          method: req.method,
          route: req.route?.path || 'unknown',
          status: res.statusCode,
        },
        duration
      );
      
      // Log slow requests
      if (duration > 2000) {
        logger.warn('Slow request detected', {
          method: req.method,
          path: req.path,
          duration,
          userId: req.user?.id,
        });
      }
    });
    
    next();
  }
}
```

### 4.2 Synthetic Monitoring

```typescript
// Synthetic monitoring scripts
class SyntheticMonitor {
  private readonly scenarios: SyntheticScenario[] = [
    {
      name: 'Student Login Flow',
      frequency: '5m',
      locations: ['us-east', 'us-west', 'eu-west'],
      steps: [
        { action: 'navigate', url: 'https://app.pathfinity.com' },
        { action: 'login', credentials: 'synthetic-student' },
        { action: 'selectCareer', index: 0 },
        { action: 'completeActivity', count: 3 },
      ],
      assertions: {
        totalTime: '<10s',
        availability: '>99.9%',
      },
    },
    {
      name: 'API Health Check',
      frequency: '1m',
      locations: ['all'],
      steps: [
        { action: 'api', endpoint: '/health' },
        { action: 'api', endpoint: '/api/v1/status' },
      ],
      assertions: {
        responseTime: '<500ms',
        statusCode: 200,
      },
    },
  ];
  
  async runScenario(scenario: SyntheticScenario): Promise<SyntheticResult> {
    const results: StepResult[] = [];
    const startTime = Date.now();
    
    for (const step of scenario.steps) {
      const stepResult = await this.executeStep(step);
      results.push(stepResult);
      
      if (!stepResult.success) {
        await this.alert({
          scenario: scenario.name,
          step: step.action,
          error: stepResult.error,
          location: this.currentLocation,
        });
        break;
      }
    }
    
    const totalTime = Date.now() - startTime;
    
    return {
      scenario: scenario.name,
      success: results.every(r => r.success),
      duration: totalTime,
      steps: results,
      timestamp: new Date(),
    };
  }
}
```

---

## 5. Performance Optimization Strategies

### 5.1 Caching Strategy

```typescript
// Multi-tier caching for performance
class PerformanceCacheStrategy {
  // L1: Browser cache
  browserCache = {
    static: {
      maxAge: 31536000, // 1 year for versioned assets
      immutable: true,
    },
    api: {
      maxAge: 0,
      mustRevalidate: true,
      staleWhileRevalidate: 60,
    },
  };
  
  // L2: CDN edge cache
  cdnCache = {
    rules: [
      {
        path: '/static/*',
        ttl: 86400 * 30, // 30 days
        bypassCookie: 'session',
      },
      {
        path: '/api/v1/careers/list',
        ttl: 3600, // 1 hour
        varyBy: ['grade-level'],
      },
      {
        path: '/api/v1/content/*',
        ttl: 86400, // 24 hours
        varyBy: ['career-id', 'student-level'],
      },
    ],
  };
  
  // L3: Application cache (Redis)
  applicationCache = {
    sessionData: { ttl: 900 },      // 15 minutes
    careerPools: { ttl: 3600 },     // 1 hour
    generatedContent: { ttl: 86400 }, // 24 hours
    pathIQAnalysis: { ttl: 300 },    // 5 minutes
  };
  
  // L4: Database query cache
  queryCache = {
    enabled: true,
    ttl: 60,
    invalidateOn: ['write', 'update', 'delete'],
  };
  
  // Predictive caching
  async predictiveCache(studentId: string): Promise<void> {
    const predictions = await this.predictNextActions(studentId);
    
    for (const prediction of predictions) {
      if (prediction.probability > 0.7) {
        await this.preloadContent(prediction.content);
      }
    }
  }
}
```

### 5.2 Database Optimization

```sql
-- Performance-critical indexes
CREATE INDEX idx_career_selections_student_date 
  ON career_selections(student_id, selection_date DESC)
  WHERE active = true;

CREATE INDEX idx_sessions_student_active 
  ON learning_sessions(student_id, created_at DESC)
  WHERE status = 'active';

CREATE INDEX idx_content_career_grade 
  ON content(career_id, grade_level, content_type)
  INCLUDE (content_data);

-- Materialized views for performance
CREATE MATERIALIZED VIEW student_dashboard_view AS
SELECT 
  s.id,
  s.name,
  s.grade_level,
  cs.career_id as current_career,
  cs.selection_date,
  COUNT(DISTINCT ch.career_id) as careers_explored,
  AVG(pm.flow_percentage) as avg_flow_state,
  MAX(ls.created_at) as last_activity
FROM students s
LEFT JOIN career_selections cs ON s.id = cs.student_id 
  AND cs.selection_date = CURRENT_DATE
LEFT JOIN career_history ch ON s.id = ch.student_id
LEFT JOIN pathiq_metrics pm ON s.id = pm.student_id 
  AND pm.created_at > NOW() - INTERVAL '7 days'
LEFT JOIN learning_sessions ls ON s.id = ls.student_id
GROUP BY s.id, s.name, s.grade_level, cs.career_id, cs.selection_date;

-- Refresh strategy
CREATE OR REPLACE FUNCTION refresh_dashboard_view()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY student_dashboard_view;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh every 5 minutes
SELECT cron.schedule('refresh-dashboard', '*/5 * * * *', 
  'SELECT refresh_dashboard_view()');
```

### 5.3 Code Optimization

```typescript
// Performance-optimized code patterns
class PerformanceOptimizedService {
  // Batch processing for efficiency
  async processBatch<T>(
    items: T[],
    processor: (item: T) => Promise<void>,
    batchSize: number = 100
  ): Promise<void> {
    const batches = chunk(items, batchSize);
    
    for (const batch of batches) {
      await Promise.all(batch.map(processor));
    }
  }
  
  // Connection pooling
  private readonly dbPool = new Pool({
    max: 20,
    min: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  
  // Query optimization with prepared statements
  private readonly preparedStatements = {
    getStudent: 'SELECT * FROM students WHERE id = $1',
    getCareerPool: `
      SELECT c.* FROM careers c
      WHERE c.grade_level = $1
      AND c.id NOT IN (
        SELECT career_id FROM career_history
        WHERE student_id = $2
        AND selected_date > NOW() - INTERVAL '5 days'
      )
      LIMIT 4
    `,
  };
  
  // Lazy loading with memoization
  private readonly memoized = new Map<string, any>();
  
  async getExpensiveData(key: string): Promise<any> {
    if (this.memoized.has(key)) {
      return this.memoized.get(key);
    }
    
    const data = await this.computeExpensiveData(key);
    this.memoized.set(key, data);
    
    // Clear after TTL
    setTimeout(() => this.memoized.delete(key), 60000);
    
    return data;
  }
  
  // Stream processing for large datasets
  async *streamLargeDataset(query: string): AsyncGenerator<any> {
    const stream = this.dbPool.query(new QueryStream(query));
    
    for await (const row of stream) {
      yield this.transformRow(row);
    }
  }
}
```

---

## 6. Performance Testing Tools

### 6.1 Tool Stack

```yaml
Performance Testing Tools:
  Load Testing:
    - K6: Primary load testing tool
    - Gatling: Alternative for complex scenarios
    - Apache JMeter: Legacy test maintenance
    
  Browser Performance:
    - Lighthouse CI: Automated performance audits
    - WebPageTest: Detailed performance analysis
    - Chrome DevTools: Manual performance profiling
    
  APM Tools:
    - Datadog APM: Application performance monitoring
    - New Relic: Transaction tracing
    - Elastic APM: Open-source alternative
    
  Profiling:
    - Node.js Profiler: CPU profiling
    - Clinic.js: Performance diagnostics
    - Chrome DevTools: Frontend profiling
    
  Database:
    - pgBadger: PostgreSQL log analyzer
    - pg_stat_statements: Query performance
    - EXPLAIN ANALYZE: Query planning
```

### 6.2 CI/CD Integration

```yaml
# Performance test pipeline
performance-tests:
  stage: performance
  script:
    - npm run build:performance
    - k6 run tests/performance/load-test.js
    - k6 run tests/performance/stress-test.js
    - lighthouse ci:collect --url=$STAGING_URL
    - npm run analyze:bundle-size
  artifacts:
    reports:
      - performance-report.html
      - lighthouse-report.html
      - bundle-analysis.json
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
    - if: '$CI_MERGE_REQUEST_TARGET_BRANCH == "main"'
```

---

## 7. Performance Troubleshooting

### 7.1 Common Performance Issues

```typescript
// Performance issue detection and resolution
const performanceIssues = {
  slowQueries: {
    symptoms: ['High database CPU', 'Slow API responses'],
    diagnosis: [
      'Check pg_stat_statements',
      'Run EXPLAIN ANALYZE',
      'Review query logs',
    ],
    solutions: [
      'Add missing indexes',
      'Optimize query structure',
      'Implement caching',
      'Use materialized views',
    ],
  },
  
  memoryLeaks: {
    symptoms: ['Increasing memory usage', 'OOM errors'],
    diagnosis: [
      'Heap snapshots',
      'Memory profiling',
      'Check event listeners',
    ],
    solutions: [
      'Fix circular references',
      'Clear timers/intervals',
      'Implement proper cleanup',
      'Limit cache size',
    ],
  },
  
  highLatency: {
    symptoms: ['Slow page loads', 'Poor user experience'],
    diagnosis: [
      'Network waterfall analysis',
      'Check TTFB',
      'Review bundle size',
    ],
    solutions: [
      'Enable compression',
      'Implement CDN',
      'Code splitting',
      'Optimize images',
    ],
  },
};

// Automated performance diagnostics
class PerformanceDiagnostics {
  async diagnoseSlowEndpoint(endpoint: string): Promise<DiagnosisReport> {
    const traces = await this.collectTraces(endpoint, 100);
    
    const report: DiagnosisReport = {
      endpoint,
      avgResponseTime: this.calculateAverage(traces),
      slowestComponents: this.identifyBottlenecks(traces),
      recommendations: [],
    };
    
    // Check database queries
    const dbTime = traces.map(t => t.dbTime).reduce((a, b) => a + b) / traces.length;
    if (dbTime > 500) {
      report.recommendations.push('Optimize database queries');
      report.slowQueries = await this.getSlowQueries(endpoint);
    }
    
    // Check cache usage
    const cacheHitRate = traces.filter(t => t.cacheHit).length / traces.length;
    if (cacheHitRate < 0.6) {
      report.recommendations.push('Improve caching strategy');
    }
    
    // Check external service calls
    const externalTime = traces.map(t => t.externalTime).reduce((a, b) => a + b) / traces.length;
    if (externalTime > 1000) {
      report.recommendations.push('Optimize external service calls');
    }
    
    return report;
  }
}
```

### 7.2 Performance Runbook

```markdown
## Performance Incident Response Runbook

### Level 1: Performance Degradation (>20% slower)
1. Check current load vs. normal
2. Review recent deployments
3. Check cache hit rates
4. Review error logs
5. Scale horizontally if needed

### Level 2: Severe Degradation (>50% slower)
1. Enable circuit breakers
2. Activate CDN cache bypass
3. Scale infrastructure
4. Enable read-only mode if needed
5. Page on-call engineer

### Level 3: System Unresponsive
1. Initiate emergency response
2. Switch to disaster recovery site
3. Enable maintenance mode
4. All hands on deck
5. Executive communication

### Recovery Procedures
1. Identify root cause
2. Implement fix
3. Gradual traffic restoration
4. Monitor metrics
5. Post-mortem within 48 hours
```

---

## 8. Performance Baselines and Benchmarks

### 8.1 Baseline Metrics

```typescript
// Performance baselines by feature
const performanceBaselines = {
  careerSelection: {
    p50: 200,  // milliseconds
    p95: 500,
    p99: 1000,
    target: 'maintain',
  },
  
  contentGeneration: {
    p50: 1000,
    p95: 3000,
    p99: 5000,
    target: 'improve by 20%',
  },
  
  dashboardLoad: {
    p50: 800,
    p95: 2000,
    p99: 3000,
    target: 'maintain',
  },
  
  pathIQAnalysis: {
    p50: 50,
    p95: 200,
    p99: 500,
    target: 'maintain',
  },
  
  finnAgentResponse: {
    p50: 300,
    p95: 800,
    p99: 1500,
    target: 'improve by 10%',
  },
};

// Competitive benchmarks
const industryBenchmarks = {
  pageLoadTime: {
    pathfinity: 1.8,
    competitorA: 3.2,
    competitorB: 2.9,
    industryAverage: 3.5,
  },
  
  timeToInteractive: {
    pathfinity: 2.3,
    competitorA: 4.1,
    competitorB: 3.8,
    industryAverage: 4.2,
  },
};
```

### 8.2 Continuous Baselining

```typescript
// Automated baseline tracking
class PerformanceBaselineTracker {
  async updateBaselines(): Promise<void> {
    const last30Days = await this.getMetrics(30);
    
    for (const [feature, metrics] of Object.entries(last30Days)) {
      const baseline = {
        p50: this.percentile(metrics, 50),
        p95: this.percentile(metrics, 95),
        p99: this.percentile(metrics, 99),
        stdDev: this.standardDeviation(metrics),
        trend: this.calculateTrend(metrics),
      };
      
      // Alert if significant degradation
      const previousBaseline = await this.getPreviousBaseline(feature);
      if (baseline.p95 > previousBaseline.p95 * 1.1) {
        await this.alert({
          feature,
          message: 'Performance regression detected',
          current: baseline.p95,
          previous: previousBaseline.p95,
        });
      }
      
      await this.saveBaseline(feature, baseline);
    }
  }
}
```

---

## Performance Testing Success Criteria

### Release Criteria
- All performance tests pass
- No regression from baseline >10%
- SLA targets met for all endpoints
- Cost per transaction <$0.001
- Cache hit rate >80%

### Monitoring Criteria
- Real-time alerts configured
- Dashboards updated
- Runbooks documented
- Team trained on tools

---

## Appendices

### Appendix A: Performance Test Scripts

Complete K6 test scripts available in `/tests/performance/`

### Appendix B: Performance Dashboards

- Real-time: https://grafana.pathfinity.com/d/realtime
- Historical: https://grafana.pathfinity.com/d/historical  
- SLA Tracking: https://grafana.pathfinity.com/d/sla

### Appendix C: Performance Optimization Checklist

- [ ] Database indexes optimized
- [ ] Caching strategy implemented
- [ ] Code profiled and optimized
- [ ] Bundle size minimized
- [ ] Images optimized
- [ ] CDN configured
- [ ] Connection pooling enabled
- [ ] Monitoring in place

---

*End of Performance Testing Guidelines*

**Next Document:** Quality Metrics and KPIs

---