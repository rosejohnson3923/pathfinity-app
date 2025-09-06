export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  userGrowthRate: number;
  usersByRole: Record<string, number>;
  usersByGrade: Record<string, number>;
  usersByStatus: Record<string, number>;
  registrationTrend: Array<{
    date: string;
    count: number;
  }>;
  activityTrend: Array<{
    date: string;
    activeUsers: number;
    totalSessions: number;
    avgSessionDuration: number;
  }>;
}

export interface ContentAnalytics {
  totalContent: number;
  publishedContent: number;
  draftContent: number;
  contentGrowthRate: number;
  contentByType: Record<string, number>;
  contentBySubject: Record<string, number>;
  contentByAuthor: Record<string, number>;
  contentTrend: Array<{
    date: string;
    published: number;
    drafted: number;
  }>;
  popularContent: Array<{
    id: string;
    title: string;
    views: number;
    engagement: number;
    lastViewed: string;
  }>;
}

export interface EngagementAnalytics {
  totalSessions: number;
  avgSessionDuration: number;
  bounceRate: number;
  pageViews: number;
  uniqueVisitors: number;
  engagementTrend: Array<{
    date: string;
    sessions: number;
    duration: number;
    pageViews: number;
  }>;
  topPages: Array<{
    path: string;
    views: number;
    avgDuration: number;
    bounceRate: number;
  }>;
  deviceStats: Record<'desktop' | 'mobile' | 'tablet', number>;
  browserStats: Record<string, number>;
}

export interface PerformanceAnalytics {
  systemUptime: number;
  avgResponseTime: number;
  errorRate: number;
  totalRequests: number;
  bandwidthUsage: number;
  storageUsage: number;
  performanceTrend: Array<{
    date: string;
    uptime: number;
    responseTime: number;
    requests: number;
    errors: number;
  }>;
  topErrors: Array<{
    type: string;
    count: number;
    lastOccurred: string;
  }>;
  resourceUsage: {
    cpu: number;
    memory: number;
    storage: number;
    bandwidth: number;
  };
}

export interface ReportData {
  user: UserAnalytics;
  content: ContentAnalytics;
  engagement: EngagementAnalytics;
  performance: PerformanceAnalytics;
  generatedAt: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export type ReportType = 'user' | 'content' | 'engagement' | 'performance' | 'summary';
export type ReportFormat = 'pdf' | 'csv' | 'xlsx' | 'json';
export type DateRange = '7d' | '30d' | '90d' | '6m' | '1y' | 'custom';

export interface ReportRequest {
  type: ReportType;
  format: ReportFormat;
  dateRange: DateRange;
  customDateRange?: {
    start: string;
    end: string;
  };
  filters?: {
    userRoles?: string[];
    contentTypes?: string[];
    subjects?: string[];
    authors?: string[];
  };
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }>;
}

export interface MetricCard {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
    trend: 'up' | 'down' | 'neutral';
  };
  format?: 'number' | 'percentage' | 'currency' | 'duration' | 'bytes';
  icon?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo';
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'table' | 'map';
  size: 'small' | 'medium' | 'large';
  refreshInterval?: number; // in minutes
  data: ChartData | MetricCard | any;
  lastUpdated: string;
}

// Utility functions for analytics
export const formatMetricValue = (value: number, format: MetricCard['format']): string => {
  switch (format) {
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'currency':
      return `$${value.toLocaleString()}`;
    case 'duration':
      return `${Math.floor(value / 60)}m ${value % 60}s`;
    case 'bytes':
      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      let unitIndex = 0;
      let size = value;
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }
      return `${size.toFixed(1)} ${units[unitIndex]}`;
    case 'number':
    default:
      return value.toLocaleString();
  }
};

export const calculateTrend = (current: number, previous: number): MetricCard['change'] => {
  if (previous === 0) return { value: 0, period: 'vs. previous', trend: 'neutral' };
  
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(change),
    period: 'vs. previous period',
    trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
  };
};

export const getDateRangeLabel = (range: DateRange): string => {
  switch (range) {
    case '7d': return 'Last 7 days';
    case '30d': return 'Last 30 days';
    case '90d': return 'Last 90 days';
    case '6m': return 'Last 6 months';
    case '1y': return 'Last 12 months';
    case 'custom': return 'Custom range';
    default: return 'Unknown range';
  }
};

// Chart color schemes
export const CHART_COLORS = {
  primary: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a'],
  success: ['#10b981', '#059669', '#047857', '#065f46'],
  warning: ['#f59e0b', '#d97706', '#b45309', '#92400e'],
  danger: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b'],
  info: ['#06b6d4', '#0891b2', '#0e7490', '#155e75'],
  purple: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6'],
  gradient: [
    'rgba(59, 130, 246, 0.8)',
    'rgba(16, 185, 129, 0.8)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(239, 68, 68, 0.8)',
    'rgba(139, 92, 246, 0.8)',
    'rgba(6, 182, 212, 0.8)'
  ]
};