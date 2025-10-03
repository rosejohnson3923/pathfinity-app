import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  FileText,
  Activity,
  Server,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  TrendingUp,
  Eye,
  Clock,
  AlertCircle,
  X
} from 'lucide-react';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { MetricCard } from './MetricCard';
import { SimpleChart } from './SimpleChart';
import { DateRange, ReportType, ReportFormat, getDateRangeLabel } from '../../../types/analytics';
import { PermissionGate, AdminOnly } from '../../auth/PermissionGate';
import '../../../design-system/tokens/colors.css';
import '../../../design-system/tokens/spacing.css';
import '../../../design-system/tokens/borders.css';
import '../../../design-system/tokens/typography.css';
import '../../../design-system/tokens/shadows.css';
import '../../../design-system/tokens/dashboard.css';

interface ReportsPanelProps {
  className?: string;
}

const REPORT_TABS = [
  { id: 'overview' as ReportType, label: 'Overview', icon: BarChart3, description: 'Key metrics and trends' },
  { id: 'user' as ReportType, label: 'Users', icon: Users, description: 'User analytics and engagement' },
  { id: 'content' as ReportType, label: 'Content', icon: FileText, description: 'Content performance and usage' },
  { id: 'engagement' as ReportType, label: 'Engagement', icon: Activity, description: 'Platform engagement metrics' },
  { id: 'performance' as ReportType, label: 'Performance', icon: Server, description: 'System performance and uptime' }
];

const DATE_RANGES: { value: DateRange; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '6m', label: 'Last 6 months' },
  { value: '1y', label: 'Last 12 months' },
  { value: 'custom', label: 'Custom range' }
];

const EXPORT_FORMATS: { value: ReportFormat; label: string }[] = [
  { value: 'pdf', label: 'PDF Report' },
  { value: 'csv', label: 'CSV Data' },
  { value: 'xlsx', label: 'Excel Spreadsheet' },
  { value: 'json', label: 'JSON Data' }
];

export function ReportsPanel({ className = '' }: ReportsPanelProps) {
  const [activeTab, setActiveTab] = useState<ReportType>('overview');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<ReportFormat>('pdf');
  const [exporting, setExporting] = useState(false);

  const getTabStyle = (isActive: boolean) => ({
    padding: 'var(--space-4) var(--space-1)',
    borderBottom: isActive ? '2px solid var(--dashboard-nav-tab-active)' : '2px solid transparent',
    fontWeight: 'var(--font-medium)',
    fontSize: 'var(--text-sm)',
    color: isActive ? 'var(--dashboard-nav-tab-active)' : 'var(--dashboard-nav-tab-inactive)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'color 200ms ease',
    border: 'none'
  });

  const {
    reportData,
    loading,
    error,
    dateRange,
    customDateRange,
    setDateRange,
    setCustomDateRange,
    refreshData,
    exportReport,
    getUserMetrics,
    getContentMetrics,
    getEngagementMetrics,
    getPerformanceMetrics,
    getUserChartData,
    getContentChartData,
    getEngagementChartData,
    getPerformanceChartData
  } = useAnalytics();

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportReport({
        type: activeTab,
        format: exportFormat,
        dateRange,
        customDateRange: customDateRange || undefined
      });
      setShowExportModal(false);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const renderOverviewTab = () => {
    if (!reportData) return null;

    const userMetrics = getUserMetrics().slice(0, 2);
    const contentMetrics = getContentMetrics().slice(0, 2);
    const engagementMetrics = getEngagementMetrics().slice(0, 2);
    const performanceMetrics = getPerformanceMetrics().slice(0, 2);

    return (
      <div className="space-y-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...userMetrics, ...contentMetrics].map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">User Growth</h3>
            <SimpleChart 
              data={getUserChartData()[0]} 
              type="line" 
              height={250}
            />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Content Distribution</h3>
            <SimpleChart 
              data={getUserChartData()[1]} 
              type="doughnut" 
              height={250}
            />
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...engagementMetrics, ...performanceMetrics].map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>

        {/* Recent Activity Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">User Growth</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">78 new users this month, 8.3% growth rate</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Top Content</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">"Introduction to Algebra" - 1,247 views</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Avg Session</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">30m 47s average session duration</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUserTab = () => {
    const metrics = getUserMetrics();
    const charts = getUserChartData();

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Registration Trend</h3>
            <SimpleChart data={charts[0]} type="line" height={300} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Users by Role</h3>
            <SimpleChart data={charts[1]} type="doughnut" height={300} />
          </div>
        </div>
      </div>
    );
  };

  const renderContentTab = () => {
    const metrics = getContentMetrics();
    const charts = getContentChartData();

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Content Creation Trend</h3>
            <SimpleChart data={charts[0]} type="line" height={300} />
          </div>
        </div>

        {/* Popular Content Table */}
        {reportData && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Most Popular Content</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Title</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Views</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Engagement</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Last Viewed</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.content.popularContent.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{item.title}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{item.views.toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{item.engagement}%</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {new Date(item.lastViewed).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEngagementTab = () => {
    const metrics = getEngagementMetrics();
    const charts = getEngagementChartData();

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Daily Sessions</h3>
            <SimpleChart data={charts[0]} type="line" height={300} />
          </div>
        </div>
      </div>
    );
  };

  const renderPerformanceTab = () => {
    const metrics = getPerformanceMetrics();
    const charts = getPerformanceChartData();

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Response Time Trend</h3>
            <SimpleChart data={charts[0]} type="line" height={300} />
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'user':
        return renderUserTab();
      case 'content':
        return renderContentTab();
      case 'engagement':
        return renderEngagementTab();
      case 'performance':
        return renderPerformanceTab();
      default:
        return renderOverviewTab();
    }
  };

  if (loading) {
    return (
      <div className={className} style={{
        backgroundColor: 'var(--dashboard-bg-elevated)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--dashboard-border-primary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '24rem' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <AdminOnly fallback={
      <div style={{
        backgroundColor: 'var(--dashboard-bg-elevated)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--dashboard-border-primary)',
        padding: 'var(--space-8)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)', marginBottom: 'var(--space-2)' }}>
            Admin Access Required
          </h3>
          <p style={{ color: 'var(--dashboard-text-secondary)' }}>
            You need administrator privileges to access reports and analytics.
          </p>
        </div>
      </div>
    }>
      <div className={className} style={{
        backgroundColor: 'var(--dashboard-bg-elevated)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--dashboard-border-primary)'
      }}>
        {/* Header */}
        <div style={{
          padding: 'var(--space-4) var(--space-6)',
          borderBottom: '1px solid var(--dashboard-border-primary)'
        }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)' }}>
                  Reports & Analytics
                </h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>
                  {getDateRangeLabel(dateRange)} • Last updated: {reportData ? new Date(reportData.generatedAt).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Date Range Selector */}
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as DateRange)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                >
                  {DATE_RANGES.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Date Range */}
              {dateRange === 'custom' && (
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={customDateRange?.start || ''}
                    onChange={(e) => setCustomDateRange({
                      start: e.target.value,
                      end: customDateRange?.end || ''
                    })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={customDateRange?.end || ''}
                    onChange={(e) => setCustomDateRange({
                      start: customDateRange?.start || '',
                      end: e.target.value
                    })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  />
                </div>
              )}

              <button
                onClick={refreshData}
                disabled={loading}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-800 dark:text-red-200">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div style={{ borderBottom: '1px solid var(--dashboard-border-primary)' }}>
          <nav style={{ display: 'flex', gap: 'var(--space-8)', padding: '0 var(--space-6)' }} aria-label="Report sections">
            {REPORT_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={getTabStyle(isActive)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Description */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {REPORT_TABS.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>

        {/* Tab Content */}
        <div className="px-6 py-8">
          {renderTabContent()}
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Export Report</h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Export Format
                  </label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as ReportFormat)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {EXPORT_FORMATS.map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Export Details</h4>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>Report Type: {REPORT_TABS.find(tab => tab.id === activeTab)?.label}</p>
                    <p>Date Range: {getDateRangeLabel(dateRange)}</p>
                    <p>Generated: {new Date().toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowExportModal(false)}
                  disabled={exporting}
                  className="px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {exporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Export</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminOnly>
  );
}