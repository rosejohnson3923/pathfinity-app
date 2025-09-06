import React from 'react';
import { TrendingUp, Users, AlertTriangle, Activity, Shield, Clock, BarChart3, PieChart } from 'lucide-react';
import { AuditLogSummary as AuditLogSummaryType, AUDIT_SEVERITY_COLORS, AUDIT_CATEGORY_COLORS } from '../../../types/auditLog';
import { SimpleChart } from '../analytics/SimpleChart';

interface AuditLogSummaryProps {
  summary: AuditLogSummaryType;
}

export function AuditLogSummary({ summary }: AuditLogSummaryProps) {
  const getSeverityColor = (severity: string) => {
    const colors = {
      low: '#6B7280',
      medium: '#3B82F6', 
      high: '#F59E0B',
      critical: '#EF4444'
    };
    return colors[severity as keyof typeof colors] || '#6B7280';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      authentication: '#3B82F6',
      authorization: '#8B5CF6',
      user_management: '#10B981',
      content_management: '#6366F1',
      system_admin: '#EF4444',
      security: '#F59E0B',
      data_handling: '#EC4899',
      integrations: '#14B8A6'
    };
    return colors[category as keyof typeof colors] || '#6B7280';
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Events</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.totalEntries.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round((summary.outcomeBreakdown.success / summary.totalEntries) * 100)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Security Alerts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.securityAlerts.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.topActors.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Alerts */}
      {summary.securityAlerts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Security Alerts</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {summary.securityAlerts.map((alert, index) => {
                const getSeverityIcon = (severity: string) => {
                  if (severity === 'critical') return '🔴';
                  if (severity === 'high') return '🟠';
                  if (severity === 'medium') return '🟡';
                  return '🟢';
                };

                const getAlertTitle = (type: string) => {
                  const titles = {
                    multiple_failed_logins: 'Multiple Failed Login Attempts',
                    suspicious_activity: 'Suspicious Activity Detected',
                    privilege_escalation: 'Privilege Escalation Attempts',
                    data_access_anomaly: 'Unusual Data Access Patterns'
                  };
                  return titles[type as keyof typeof titles] || type.replace('_', ' ');
                };

                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
                      <div>
                        <h4 className="font-medium text-red-900 dark:text-red-200">
                          {getAlertTitle(alert.type)}
                        </h4>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          {alert.count} occurrence{alert.count !== 1 ? 's' : ''} • Last: {new Date(alert.lastOccurrence).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${AUDIT_SEVERITY_COLORS[alert.severity]}`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Activity Trend (7 Days)</h3>
            </div>
          </div>
          <div className="p-6">
            <SimpleChart
              type="line"
              data={{
                labels: summary.activityTrend.map(item => 
                  new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                ),
                datasets: [{
                  label: 'Total Actions',
                  data: summary.activityTrend.map(item => item.totalActions),
                  borderColor: '#3B82F6',
                  backgroundColor: '#3B82F650',
                  fill: true
                }]
              }}
              height={200}
            />
          </div>
        </div>

        {/* Severity Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Severity Distribution</h3>
            </div>
          </div>
          <div className="p-6">
            <SimpleChart
              type="doughnut"
              data={{
                labels: Object.keys(summary.severityBreakdown).map(severity => 
                  severity.charAt(0).toUpperCase() + severity.slice(1)
                ),
                datasets: [{
                  label: 'Severity',
                  data: Object.values(summary.severityBreakdown),
                  backgroundColor: Object.keys(summary.severityBreakdown).map(severity => 
                    getSeverityColor(severity)
                  )
                }]
              }}
              height={200}
            />
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Event Categories</h3>
          </div>
        </div>
        <div className="p-6">
          <SimpleChart
            type="bar"
            data={{
              labels: Object.keys(summary.categoryBreakdown).map(category => 
                category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
              ),
              datasets: [{
                label: 'Events',
                data: Object.values(summary.categoryBreakdown),
                backgroundColor: Object.keys(summary.categoryBreakdown).map(category => 
                  getCategoryColor(category)
                )
              }]
            }}
            height={300}
          />
        </div>
      </div>

      {/* Top Actions and Actors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Most Frequent Actions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {summary.topActions.map((action, index) => (
                <div key={action.action} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {action.action.replace(/[_:]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {action.count} events ({action.percentage}%)
                      </p>
                    </div>
                  </div>
                  <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${action.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Actors */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Most Active Users</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {summary.topActors.map((actor, index) => (
                <div key={actor.actorId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-semibold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {actor.actorName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {actor.actorEmail}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {actor.actionCount} actions
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Last: {new Date(actor.lastActivity).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Time Range Info */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Report Period:</span>
          </div>
          <span className="font-medium">
            {new Date(summary.timeRange.start).toLocaleDateString()} - {new Date(summary.timeRange.end).toLocaleDateString()}
          </span>
          <span>•</span>
          <span>{summary.totalEntries.toLocaleString()} total events</span>
        </div>
      </div>
    </div>
  );
}