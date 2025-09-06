# Monitoring and Analytics Guide
## Phase 7 Implementation

---

## 📊 Overview

The Pathfinity monitoring and analytics system provides comprehensive real-time tracking of system health, performance, user engagement, and learning outcomes. This guide covers the implementation, usage, and best practices for the monitoring infrastructure.

---

## 🏗️ Architecture

### Core Services

1. **MonitoringService** (`src/services/monitoring/MonitoringService.ts`)
   - Performance tracking
   - Error logging
   - Health checks
   - Alert management
   - Metric buffering and batching

2. **AnalyticsService** (`src/services/monitoring/AnalyticsService.ts`)
   - Learning event tracking
   - Engagement metrics
   - Progress tracking
   - Pattern analysis
   - Session management

3. **MonitoringDashboard** (`src/components/monitoring/MonitoringDashboard.tsx`)
   - Real-time visualization
   - Health status display
   - Alert management
   - Metric trends

---

## 📈 Metrics Tracked

### Performance Metrics
- **Response Times**: API calls, content generation, database queries
- **Cache Performance**: Hit rate, miss rate, invalidation frequency
- **Resource Usage**: Memory consumption, CPU utilization
- **Queue Performance**: Processing time, backlog size

### Business Metrics
- **Question Detection Accuracy**: Type detection success rate
- **Content Generation**: Questions generated per hour
- **Learning Outcomes**: Accuracy rates, mastery progression
- **User Engagement**: Session duration, activity levels

### Learning Analytics
- **Question Performance**: Accuracy by type, time spent
- **Skill Progression**: Mastery rates, completion times
- **Container Analytics**: Completion rates, engagement scores
- **Student Progress**: Streaks, total time, skills mastered

### System Health
- **Database Health**: Connection status, query performance
- **Cache Health**: Redis connection, operation latency
- **AI Service Health**: API availability, response times
- **Queue Health**: Processing status, stuck items

---

## 🚀 Implementation Guide

### 1. Basic Setup

```typescript
// Initialize monitoring in your app
import MonitoringService from './services/monitoring/MonitoringService';
import AnalyticsService from './services/monitoring/AnalyticsService';

// Services are singletons
const monitoring = MonitoringService.getInstance();
const analytics = AnalyticsService.getInstance();
```

### 2. Using the useMonitoring Hook

```typescript
import { useMonitoring } from '../hooks/useMonitoring';

function MyComponent() {
  const {
    startTiming,
    trackInteraction,
    trackQuestionAnswered,
    trackError
  } = useMonitoring({
    componentName: 'MyComponent',
    trackMountTime: true,
    trackInteractions: true,
    trackErrors: true
  });
  
  // Track performance
  const timer = startTiming('data_fetch');
  await fetchData();
  timer.end(); // Automatically logs duration
  
  // Track user interaction
  const handleClick = () => {
    trackInteraction('button_click', { buttonId: 'submit' });
  };
  
  // Track question answered
  const handleAnswer = (isCorrect: boolean) => {
    trackQuestionAnswered(
      'multiple_choice',
      isCorrect,
      timeSpent,
      attempts
    );
  };
}
```

### 3. Manual Tracking

```typescript
// Track performance
monitoring.trackPerformance({
  metricName: 'content_generation',
  value: 450,
  unit: 'ms',
  threshold: 500
});

// Track errors
monitoring.trackError({
  errorType: 'api_error',
  errorMessage: 'Failed to fetch data',
  severity: 'high',
  context: { endpoint: '/api/skills' },
  timestamp: new Date().toISOString()
});

// Track business metrics
monitoring.trackBusinessMetric('questions_generated', 150, {
  grade: '10',
  subject: 'Math'
});

// Track learning events
analytics.trackLearningEvent({
  eventType: 'skill_completed',
  studentId: 'taylor123',
  grade: '10',
  subject: 'Math',
  skillId: 'algebra_basics',
  score: 85,
  timeSpent: 1200
});
```

### 4. Health Checks

```typescript
// Define health check
async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('health_check')
      .select('*')
      .limit(1);
    return !error;
  } catch {
    return false;
  }
}

// Perform health check
const result = await monitoring.performHealthCheck(
  'database',
  checkDatabaseHealth
);

console.log(`Database status: ${result.status}`);
console.log(`Response time: ${result.responseTime}ms`);
```

---

## 📊 Dashboard Usage

### Accessing the Dashboard

```typescript
import MonitoringDashboard from './components/monitoring/MonitoringDashboard';

// Add to your admin route
<Route path="/admin/monitoring" element={<MonitoringDashboard />} />
```

### Dashboard Features

1. **System Health Panel**
   - Real-time status indicators
   - Response time metrics
   - Color-coded health states

2. **Performance Metrics**
   - Cache hit rate gauge
   - Average response times
   - Error rate tracking
   - Active user count

3. **Engagement Metrics**
   - Session duration
   - Questions answered
   - Accuracy rates
   - Engagement scores

4. **Alert Management**
   - Real-time alert feed
   - Severity indicators
   - Acknowledgment system

### Dashboard Controls
- **Auto-refresh**: Toggle automatic data refresh
- **Refresh interval**: 5s, 10s, 30s, 1 minute
- **Manual refresh**: Instant data update

---

## 🗄️ Database Schema

### Core Tables

```sql
-- Performance metrics
performance_metrics (
  metric_id, event_name, event_value, 
  metadata, timestamp, user_id, session_id
)

-- Learning events
learning_events (
  event_id, event_type, student_id, grade, 
  subject, question_type, is_correct, time_spent
)

-- Error logs
error_logs (
  error_id, error_type, error_message, 
  stack_trace, severity, context, timestamp
)

-- Monitoring alerts
monitoring_alerts (
  alert_id, alert_type, metric_name, 
  current_value, threshold_value, severity
)

-- Student progress
student_progress (
  progress_id, student_id, grade, subject,
  skills_mastered, mastery_percentage
)
```

---

## 🚨 Alert Configuration

### Default Thresholds

```typescript
// Performance thresholds
content_generation_time: 1000ms
api_response_time: 2000ms
cache_hit_rate: 50% minimum
error_rate: 5% maximum
memory_usage: 100MB

// Business thresholds
question_detection_accuracy: 90% minimum
true_false_accuracy: 95% minimum
session_duration: 4 hours maximum
```

### Custom Alerts

```typescript
// Set custom threshold
monitoring.alertThresholds.set('custom_metric', 100);

// Trigger manual alert
monitoring.triggerAlert({
  type: 'custom',
  metric: 'user_activity',
  value: 150,
  threshold: 100,
  severity: 'medium'
});
```

---

## 📈 Analytics Patterns

### Detecting Learning Patterns

The system automatically detects:
- **Struggling patterns**: <50% accuracy over 5+ questions
- **Mastery patterns**: >90% accuracy over 10+ questions
- **Engagement drops**: Sudden decrease in activity
- **Performance trends**: Improvement/decline over time

### Engagement Scoring

Engagement score (0-100) is calculated based on:
- **Accuracy** (40%): Correct answer percentage
- **Activity** (30%): Questions answered
- **Consistency** (20%): Session duration
- **Speed** (10%): Average response time

---

## 🔧 Troubleshooting

### Common Issues

1. **Metrics not appearing**
   - Check database connection
   - Verify table creation
   - Check browser console for errors

2. **High error rates**
   - Review error_logs table
   - Check API endpoints
   - Verify service health

3. **Dashboard not updating**
   - Check auto-refresh setting
   - Verify WebSocket connection
   - Check network tab for failed requests

### Debug Mode

```typescript
// Enable debug logging
localStorage.setItem('monitoring_debug', 'true');

// View buffered metrics
console.log(monitoring.metricsBuffer);

// Check health status
console.log(monitoring.getHealthStatus());
```

---

## 🎯 Best Practices

### 1. Performance Impact
- Use buffering for high-frequency events
- Batch metrics before sending
- Avoid tracking in tight loops

### 2. Data Quality
- Always include context in error tracking
- Use consistent event names
- Include relevant metadata

### 3. Privacy
- Don't track sensitive user data
- Anonymize where possible
- Follow data retention policies

### 4. Alerting
- Set realistic thresholds
- Avoid alert fatigue
- Document alert responses

---

## 📊 Reporting

### Generate Reports

```typescript
// Hourly performance report
await monitoring.generateHourlyReport();

// Daily learning summary
await analytics.generateDailyLearningSummary();

// Export metrics
const metrics = await monitoring.exportMetrics({
  startDate: '2025-08-01',
  endDate: '2025-08-31',
  format: 'csv'
});
```

---

## 🔄 Integration Examples

### Container Integration

```typescript
// AILearnContainerV2
const { trackQuestionAnswered } = useMonitoring({
  componentName: 'AILearnContainerV2',
  trackMountTime: true
});

// In handleAnswer function
trackQuestionAnswered(
  question.type,
  isCorrect,
  timeSpent,
  attempts,
  { skillId, difficulty }
);
```

### Service Integration

```typescript
// JustInTimeContentService
class JustInTimeContentService {
  private monitoring = MonitoringService.getInstance();
  
  async generateContent() {
    const timer = this.monitoring.startTiming('content_generation');
    
    try {
      const content = await this.generate();
      timer();
      return content;
    } catch (error) {
      this.monitoring.trackError({
        errorType: 'generation_failed',
        errorMessage: error.message,
        severity: 'high'
      });
      throw error;
    }
  }
}
```

---

## 📅 Maintenance

### Daily Tasks
- Review alert dashboard
- Check error logs
- Monitor performance trends

### Weekly Tasks
- Analyze learning patterns
- Review engagement metrics
- Optimize slow queries

### Monthly Tasks
- Generate performance reports
- Review and adjust thresholds
- Archive old metrics data

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Predictive alerting
- [ ] Anomaly detection
- [ ] Custom dashboards
- [ ] Export to external systems
- [ ] Mobile app integration
- [ ] Real-time notifications
- [ ] A/B testing metrics
- [ ] Machine learning insights

---

*Last Updated: 2025-08-27*
*Phase 7: Monitoring & Analytics - COMPLETE*