/**
 * MonitoringDashboard Component
 * Real-time monitoring dashboard for system health and performance
 */

import React, { useState, useEffect, useCallback } from 'react';
import MonitoringService, { HealthCheckResult, MetricEvent } from '../../services/monitoring/MonitoringService';
import AnalyticsService, { EngagementMetrics } from '../../services/monitoring/AnalyticsService';
import { supabase } from '../../lib/supabase';
import './MonitoringDashboard.css';

interface SystemMetrics {
  cacheHitRate: number;
  avgResponseTime: number;
  errorRate: number;
  activeUsers: number;
  questionsGenerated: number;
  detectionAccuracy: number;
}

interface RealtimeAlert {
  id: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

const MonitoringDashboard: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<Map<string, HealthCheckResult>>(new Map());
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cacheHitRate: 0,
    avgResponseTime: 0,
    errorRate: 0,
    activeUsers: 0,
    questionsGenerated: 0,
    detectionAccuracy: 0
  });
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<RealtimeAlert[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<number>(5000);
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(true);
  
  const monitoring = MonitoringService.getInstance();
  const analytics = AnalyticsService.getInstance();
  
  // Fetch health status
  const fetchHealthStatus = useCallback(async () => {
    // Perform health checks
    const checks = [
      { name: 'database', fn: checkDatabaseHealth },
      { name: 'cache', fn: checkCacheHealth },
      { name: 'ai_service', fn: checkAIServiceHealth },
      { name: 'content_generation', fn: checkContentGenerationHealth }
    ];
    
    const results = new Map<string, HealthCheckResult>();
    
    for (const check of checks) {
      const result = await monitoring.performHealthCheck(check.name, check.fn);
      results.set(check.name, result);
    }
    
    setHealthStatus(results);
  }, [monitoring]);
  
  // Fetch system metrics
  const fetchSystemMetrics = useCallback(async () => {
    try {
      // Get cache metrics
      const { data: cacheData } = await supabase
        .from('content_cache_v2')
        .select('cache_id, hit_count, created_at')
        .gte('created_at', new Date(Date.now() - 3600000).toISOString());
      
      const totalRequests = cacheData?.length || 0;
      const cacheHits = cacheData?.reduce((sum, item) => sum + (item.hit_count || 0), 0) || 0;
      const cacheHitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;
      
      // Get response times
      const { data: perfData } = await supabase
        .from('detection_performance_metrics')
        .select('avg_detection_time_ms')
        .gte('created_at', new Date(Date.now() - 3600000).toISOString());
      
      const avgResponseTime = perfData?.length > 0
        ? perfData.reduce((sum, item) => sum + item.avg_detection_time_ms, 0) / perfData.length
        : 0;
      
      // Get error rate
      const { count: errorCount } = await supabase
        .from('error_logs')
        .select('*', { count: 'exact', head: true })
        .gte('timestamp', new Date(Date.now() - 3600000).toISOString());
      
      const { count: totalEvents } = await supabase
        .from('learning_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 3600000).toISOString());
      
      const errorRate = totalEvents && totalEvents > 0 
        ? ((errorCount || 0) / totalEvents) * 100 
        : 0;
      
      // Get active users
      const { data: activeUsersData } = await supabase
        .from('learning_events')
        .select('student_id')
        .gte('created_at', new Date(Date.now() - 900000).toISOString()); // Last 15 minutes
      
      const uniqueUsers = new Set(activeUsersData?.map(u => u.student_id) || []);
      const activeUsers = uniqueUsers.size;
      
      // Get questions generated
      const { count: questionsGenerated } = await supabase
        .from('generation_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .gte('completed_at', new Date(Date.now() - 3600000).toISOString());
      
      // Get detection accuracy
      const { data: detectionData } = await supabase
        .from('type_detection_captures')
        .select('is_correct')
        .gte('created_at', new Date(Date.now() - 3600000).toISOString());
      
      const correctDetections = detectionData?.filter(d => d.is_correct).length || 0;
      const totalDetections = detectionData?.length || 0;
      const detectionAccuracy = totalDetections > 0 
        ? (correctDetections / totalDetections) * 100 
        : 0;
      
      setSystemMetrics({
        cacheHitRate,
        avgResponseTime,
        errorRate,
        activeUsers,
        questionsGenerated: questionsGenerated || 0,
        detectionAccuracy
      });
    } catch (error) {
      console.error('Error fetching system metrics:', error);
    }
  }, []);
  
  // Fetch recent alerts
  const fetchRecentAlerts = useCallback(async () => {
    try {
      const { data: alerts } = await supabase
        .from('monitoring_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (alerts) {
        setRecentAlerts(alerts.map(alert => ({
          id: alert.id,
          type: alert.alert_type,
          message: `${alert.metric_name}: ${alert.current_value} (threshold: ${alert.threshold_value})`,
          severity: alert.severity,
          timestamp: alert.created_at
        })));
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  }, []);
  
  // Fetch engagement metrics
  const fetchEngagementMetrics = useCallback(() => {
    const metrics = analytics.getEngagementMetrics();
    setEngagementMetrics(metrics);
  }, [analytics]);
  
  // Health check functions
  async function checkDatabaseHealth(): Promise<boolean> {
    try {
      const { error } = await supabase.from('health_check').select('*').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
  
  async function checkCacheHealth(): Promise<boolean> {
    try {
      const { error } = await supabase.from('content_cache_v2').select('cache_id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
  
  async function checkAIServiceHealth(): Promise<boolean> {
    // Check if AI service is responsive
    // This would typically check the OpenAI/Azure endpoint
    return true; // Placeholder
  }
  
  async function checkContentGenerationHealth(): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('generation_queue')
        .select('*')
        .eq('status', 'processing')
        .gte('started_at', new Date(Date.now() - 300000).toISOString());
      
      // Check if there are stuck items
      return !data || data.length < 10;
    } catch {
      return false;
    }
  }
  
  // Refresh all data
  const refreshData = useCallback(() => {
    fetchHealthStatus();
    fetchSystemMetrics();
    fetchRecentAlerts();
    fetchEngagementMetrics();
  }, [fetchHealthStatus, fetchSystemMetrics, fetchRecentAlerts, fetchEngagementMetrics]);
  
  // Setup auto-refresh
  useEffect(() => {
    refreshData();
    
    if (isAutoRefresh) {
      const interval = setInterval(refreshData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [isAutoRefresh, refreshInterval, refreshData]);
  
  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'green';
      case 'degraded': return 'yellow';
      case 'unhealthy': return 'red';
      default: return 'gray';
    }
  };
  
  // Get severity color
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'low': return 'blue';
      case 'medium': return 'yellow';
      case 'high': return 'orange';
      case 'critical': return 'red';
      default: return 'gray';
    }
  };
  
  return (
    <div className="monitoring-dashboard">
      <div className="dashboard-header">
        <h1>System Monitoring Dashboard</h1>
        <div className="dashboard-controls">
          <label>
            <input
              type="checkbox"
              checked={isAutoRefresh}
              onChange={(e) => setIsAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
          <select 
            value={refreshInterval} 
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            disabled={!isAutoRefresh}
          >
            <option value={5000}>5 seconds</option>
            <option value={10000}>10 seconds</option>
            <option value={30000}>30 seconds</option>
            <option value={60000}>1 minute</option>
          </select>
          <button onClick={refreshData}>Refresh Now</button>
        </div>
      </div>
      
      {/* Health Status Section */}
      <div className="dashboard-section">
        <h2>System Health</h2>
        <div className="health-grid">
          {Array.from(healthStatus.entries()).map(([service, result]) => (
            <div key={service} className={`health-card ${result.status}`}>
              <h3>{service.replace('_', ' ').toUpperCase()}</h3>
              <div 
                className="status-indicator" 
                style={{ backgroundColor: getStatusColor(result.status) }}
              />
              <p className="status-text">{result.status}</p>
              <p className="response-time">{result.responseTime.toFixed(0)}ms</p>
              {result.details && (
                <div className="health-details">
                  {JSON.stringify(result.details)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* System Metrics Section */}
      <div className="dashboard-section">
        <h2>System Metrics</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Cache Hit Rate</h3>
            <p className="metric-value">{systemMetrics.cacheHitRate.toFixed(1)}%</p>
            <div className="metric-bar">
              <div 
                className="metric-fill"
                style={{ width: `${systemMetrics.cacheHitRate}%` }}
              />
            </div>
          </div>
          
          <div className="metric-card">
            <h3>Avg Response Time</h3>
            <p className="metric-value">{systemMetrics.avgResponseTime.toFixed(0)}ms</p>
            <p className={systemMetrics.avgResponseTime > 500 ? 'warning' : 'success'}>
              {systemMetrics.avgResponseTime > 500 ? '⚠️ Above target' : '✅ Within target'}
            </p>
          </div>
          
          <div className="metric-card">
            <h3>Error Rate</h3>
            <p className="metric-value">{systemMetrics.errorRate.toFixed(2)}%</p>
            <p className={systemMetrics.errorRate > 5 ? 'error' : 'success'}>
              {systemMetrics.errorRate > 5 ? '❌ High' : '✅ Normal'}
            </p>
          </div>
          
          <div className="metric-card">
            <h3>Active Users</h3>
            <p className="metric-value">{systemMetrics.activeUsers}</p>
            <p className="metric-subtitle">Last 15 minutes</p>
          </div>
          
          <div className="metric-card">
            <h3>Questions Generated</h3>
            <p className="metric-value">{systemMetrics.questionsGenerated}</p>
            <p className="metric-subtitle">Last hour</p>
          </div>
          
          <div className="metric-card">
            <h3>Detection Accuracy</h3>
            <p className="metric-value">{systemMetrics.detectionAccuracy.toFixed(1)}%</p>
            <div className="metric-bar">
              <div 
                className="metric-fill success"
                style={{ width: `${systemMetrics.detectionAccuracy}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Engagement Metrics Section */}
      {engagementMetrics && (
        <div className="dashboard-section">
          <h2>Current Session Engagement</h2>
          <div className="engagement-grid">
            <div className="engagement-card">
              <h3>Session Duration</h3>
              <p>{Math.floor(engagementMetrics.sessionDuration / 60000)} minutes</p>
            </div>
            <div className="engagement-card">
              <h3>Questions Answered</h3>
              <p>{engagementMetrics.questionsAnswered}</p>
            </div>
            <div className="engagement-card">
              <h3>Accuracy</h3>
              <p>
                {engagementMetrics.questionsAnswered > 0
                  ? ((engagementMetrics.correctAnswers / engagementMetrics.questionsAnswered) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div className="engagement-card">
              <h3>Engagement Score</h3>
              <p className="engagement-score">{engagementMetrics.engagementScore}/100</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Recent Alerts Section */}
      <div className="dashboard-section">
        <h2>Recent Alerts</h2>
        <div className="alerts-list">
          {recentAlerts.length === 0 ? (
            <p className="no-alerts">No recent alerts</p>
          ) : (
            recentAlerts.map(alert => (
              <div 
                key={alert.id} 
                className={`alert-item ${alert.severity}`}
                style={{ borderLeftColor: getSeverityColor(alert.severity) }}
              >
                <span className="alert-severity">{alert.severity.toUpperCase()}</span>
                <span className="alert-type">{alert.type}</span>
                <span className="alert-message">{alert.message}</span>
                <span className="alert-time">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;