import React from 'react';
import { TrendingUp, Users, AlertTriangle, Activity, Shield, Clock, BarChart3, PieChart } from 'lucide-react';
import { AuditLogSummary as AuditLogSummaryType, AUDIT_SEVERITY_COLORS, AUDIT_CATEGORY_COLORS } from '../../../types/auditLog';
import { SimpleChart } from '../analytics/SimpleChart';
import '../../../design-system/tokens/colors.css';
import '../../../design-system/tokens/spacing.css';
import '../../../design-system/tokens/borders.css';
import '../../../design-system/tokens/typography.css';
import '../../../design-system/tokens/shadows.css';
import '../../../design-system/tokens/dashboard.css';

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
        <div style={{
          backgroundColor: 'var(--dashboard-bg-elevated)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--dashboard-shadow-card)',
          padding: 'var(--space-6)'
        }}>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--dashboard-text-secondary)'
              }}>Total Events</p>
              <p style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--dashboard-text-primary)'
              }}>
                {summary.totalEntries.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--dashboard-bg-elevated)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--dashboard-shadow-card)',
          padding: 'var(--space-6)'
        }}>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--dashboard-text-secondary)'
              }}>Success Rate</p>
              <p style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--dashboard-text-primary)'
              }}>
                {Math.round((summary.outcomeBreakdown.success / summary.totalEntries) * 100)}%
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--dashboard-bg-elevated)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--dashboard-shadow-card)',
          padding: 'var(--space-6)'
        }}>
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--dashboard-text-secondary)'
              }}>Security Alerts</p>
              <p style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--dashboard-text-primary)'
              }}>
                {summary.securityAlerts.length}
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--dashboard-bg-elevated)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--dashboard-shadow-card)',
          padding: 'var(--space-6)'
        }}>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--dashboard-text-secondary)'
              }}>Active Users</p>
              <p style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--dashboard-text-primary)'
              }}>
                {summary.topActors.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Alerts */}
      {summary.securityAlerts.length > 0 && (
        <div style={{
          backgroundColor: 'var(--dashboard-bg-elevated)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--dashboard-shadow-card)'
        }}>
          <div style={{
            padding: 'var(--space-6)',
            borderBottom: '1px solid var(--dashboard-border-primary)'
          }}>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <h3 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--dashboard-text-primary)'
              }}>Security Alerts</h3>
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
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-4)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 'var(--radius-lg)'
                  }}>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
                      <div>
                        <h4 style={{ fontWeight: 'var(--font-medium)', color: '#7f1d1d' }}>
                          {getAlertTitle(alert.type)}
                        </h4>
                        <p style={{ fontSize: 'var(--text-sm)', color: '#991b1b' }}>
                          {alert.count} occurrence{alert.count !== 1 ? 's' : ''} • Last: {new Date(alert.lastOccurrence).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      display: 'inline-flex',
                      padding: 'var(--space-1) var(--space-2)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-semibold)',
                      borderRadius: 'var(--radius-full)',
                      ...AUDIT_SEVERITY_COLORS[alert.severity]
                    }}>
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
        <div style={{
          backgroundColor: 'var(--dashboard-bg-elevated)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--dashboard-shadow-card)'
        }}>
          <div style={{
            padding: 'var(--space-6)',
            borderBottom: '1px solid var(--dashboard-border-primary)'
          }}>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--dashboard-text-primary)'
              }}>Activity Trend (7 Days)</h3>
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
        <div style={{
          backgroundColor: 'var(--dashboard-bg-elevated)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--dashboard-shadow-card)'
        }}>
          <div style={{
            padding: 'var(--space-6)',
            borderBottom: '1px solid var(--dashboard-border-primary)'
          }}>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <h3 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--dashboard-text-primary)'
              }}>Severity Distribution</h3>
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
      <div style={{
        backgroundColor: 'var(--dashboard-bg-elevated)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--dashboard-shadow-card)'
      }}>
        <div style={{
          padding: 'var(--space-6)',
          borderBottom: '1px solid var(--dashboard-border-primary)'
        }}>
          <div className="flex items-center space-x-2">
            <PieChart className="h-5 w-5 text-purple-600" />
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--dashboard-text-primary)'
            }}>Event Categories</h3>
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
        <div style={{
          backgroundColor: 'var(--dashboard-bg-elevated)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--dashboard-shadow-card)'
        }}>
          <div style={{
            padding: 'var(--space-6)',
            borderBottom: '1px solid var(--dashboard-border-primary)'
          }}>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--dashboard-text-primary)'
            }}>Most Frequent Actions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {summary.topActions.map((action, index) => (
                <div key={action.action} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                      {index + 1}
                    </span>
                    <div>
                      <p style={{
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--dashboard-text-primary)'
                      }}>
                        {action.action.replace(/[_:]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--dashboard-text-secondary)'
                      }}>
                        {action.count} events ({action.percentage}%)
                      </p>
                    </div>
                  </div>
                  <div style={{
                    width: '4rem',
                    backgroundColor: 'var(--dashboard-bg-secondary)',
                    borderRadius: 'var(--radius-full)',
                    height: '0.5rem'
                  }}>
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
        <div style={{
          backgroundColor: 'var(--dashboard-bg-elevated)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--dashboard-shadow-card)'
        }}>
          <div style={{
            padding: 'var(--space-6)',
            borderBottom: '1px solid var(--dashboard-border-primary)'
          }}>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--dashboard-text-primary)'
            }}>Most Active Users</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {summary.topActors.map((actor, index) => (
                <div key={actor.actorId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-sm font-semibold">
                      {index + 1}
                    </span>
                    <div>
                      <p style={{
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--dashboard-text-primary)'
                      }}>
                        {actor.actorName}
                      </p>
                      <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--dashboard-text-secondary)'
                      }}>
                        {actor.actorEmail}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p style={{
                      fontWeight: 'var(--font-medium)',
                      color: 'var(--dashboard-text-primary)'
                    }}>
                      {actor.actionCount} actions
                    </p>
                    <p style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--dashboard-text-secondary)'
                    }}>
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
      <div style={{
        backgroundColor: 'var(--dashboard-bg-secondary)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-4)',
          fontSize: 'var(--text-sm)',
          color: 'var(--dashboard-text-secondary)'
        }}>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Report Period:</span>
          </div>
          <span style={{ fontWeight: 'var(--font-medium)' }}>
            {new Date(summary.timeRange.start).toLocaleDateString()} - {new Date(summary.timeRange.end).toLocaleDateString()}
          </span>
          <span>•</span>
          <span>{summary.totalEntries.toLocaleString()} total events</span>
        </div>
      </div>
    </div>
  );
}