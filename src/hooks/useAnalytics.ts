import { useState, useEffect, useCallback } from 'react';
import {
  ReportData,
  UserAnalytics,
  ContentAnalytics,
  EngagementAnalytics,
  PerformanceAnalytics,
  ReportRequest,
  DateRange,
  MetricCard,
  ChartData,
  calculateTrend,
  formatMetricValue,
  CHART_COLORS
} from '../types/analytics';

interface UseAnalyticsReturn {
  reportData: ReportData | null;
  loading: boolean;
  error: string | null;
  dateRange: DateRange;
  customDateRange: { start: string; end: string } | null;
  setDateRange: (range: DateRange) => void;
  setCustomDateRange: (range: { start: string; end: string }) => void;
  refreshData: () => Promise<void>;
  exportReport: (request: ReportRequest) => Promise<void>;
  getUserMetrics: () => MetricCard[];
  getContentMetrics: () => MetricCard[];
  getEngagementMetrics: () => MetricCard[];
  getPerformanceMetrics: () => MetricCard[];
  getUserChartData: () => ChartData[];
  getContentChartData: () => ChartData[];
  getEngagementChartData: () => ChartData[];
  getPerformanceChartData: () => ChartData[];
}

// Mock data generators
const generateMockUserAnalytics = (): UserAnalytics => {
  const now = new Date();
  // Generate monthly data for the last 12 months instead of daily for 30 days
  const trend = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(now);
    date.setMonth(date.getMonth() - (11 - i));
    date.setDate(1); // Set to first day of month
    return {
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 50) + 20 // Higher monthly counts
    };
  });

  const activityTrend = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      activeUsers: Math.floor(Math.random() * 150) + 50,
      totalSessions: Math.floor(Math.random() * 300) + 100,
      avgSessionDuration: Math.floor(Math.random() * 1800) + 300 // 5-35 minutes
    };
  });

  return {
    totalUsers: 1247,
    activeUsers: 892,
    newUsersThisMonth: 78,
    userGrowthRate: 8.3,
    usersByRole: {
      student: 950,
      teacher: 45,
      staff: 12,
      admin: 8,
      parent: 232
    },
    usersByGrade: {
      '6th Grade': 320,
      '7th Grade': 315,
      '8th Grade': 315
    },
    usersByStatus: {
      active: 892,
      inactive: 255,
      suspended: 15,
      pending: 85
    },
    registrationTrend: trend,
    activityTrend
  };
};

const generateMockContentAnalytics = (): ContentAnalytics => {
  const now = new Date();
  // Generate monthly data for the last 12 months instead of daily for 30 days
  const trend = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(now);
    date.setMonth(date.getMonth() - (11 - i));
    date.setDate(1); // Set to first day of month
    return {
      date: date.toISOString().split('T')[0],
      published: Math.floor(Math.random() * 40) + 10, // Higher monthly counts
      drafted: Math.floor(Math.random() * 20) + 5
    };
  });

  return {
    totalContent: 2156,
    publishedContent: 1834,
    draftContent: 322,
    contentGrowthRate: 12.5,
    contentByType: {
      lesson: 856,
      assignment: 634,
      quiz: 445,
      resource: 221
    },
    contentBySubject: {
      'Mathematics': 578,
      'Science': 512,
      'English Language Arts': 489,
      'Social Studies': 334,
      'Art': 156,
      'Music': 87
    },
    contentByAuthor: {
      'Ms. Johnson': 234,
      'Mr. Rodriguez': 198,
      'Dr. Chen': 156,
      'Ms. Williams': 145,
      'Mr. Thompson': 132
    },
    contentTrend: trend,
    popularContent: [
      {
        id: '1',
        title: 'Introduction to Algebra',
        views: 1247,
        engagement: 87.3,
        lastViewed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        title: 'Ecosystem Relationships',
        views: 934,
        engagement: 82.1,
        lastViewed: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        title: 'Creative Writing Workshop',
        views: 756,
        engagement: 79.8,
        lastViewed: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ]
  };
};

const generateMockEngagementAnalytics = (): EngagementAnalytics => {
  const now = new Date();
  // Generate monthly data for the last 12 months instead of daily for 30 days
  const trend = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(now);
    date.setMonth(date.getMonth() - (11 - i));
    date.setDate(1); // Set to first day of month
    return {
      date: date.toISOString().split('T')[0],
      sessions: Math.floor(Math.random() * 15000) + 6000, // Higher monthly counts
      duration: Math.floor(Math.random() * 1200) + 300,
      pageViews: Math.floor(Math.random() * 60000) + 24000
    };
  });

  return {
    totalSessions: 12456,
    avgSessionDuration: 1847, // seconds
    bounceRate: 23.4,
    pageViews: 45782,
    uniqueVisitors: 1156,
    engagementTrend: trend,
    topPages: [
      { path: '/dashboard', views: 8934, avgDuration: 245, bounceRate: 18.2 },
      { path: '/content/lessons', views: 6721, avgDuration: 432, bounceRate: 12.5 },
      { path: '/assignments', views: 5234, avgDuration: 567, bounceRate: 15.8 },
      { path: '/grades', views: 4123, avgDuration: 189, bounceRate: 28.4 },
      { path: '/profile', views: 3456, avgDuration: 156, bounceRate: 35.2 }
    ],
    deviceStats: {
      desktop: 45.2,
      mobile: 42.1,
      tablet: 12.7
    },
    browserStats: {
      'Chrome': 52.3,
      'Safari': 23.1,
      'Firefox': 12.4,
      'Edge': 8.9,
      'Other': 3.3
    }
  };
};

const generateMockPerformanceAnalytics = (): PerformanceAnalytics => {
  const now = new Date();
  // Generate monthly data for the last 12 months instead of daily for 30 days
  const trend = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(now);
    date.setMonth(date.getMonth() - (11 - i));
    date.setDate(1); // Set to first day of month
    return {
      date: date.toISOString().split('T')[0],
      uptime: Math.random() * 2 + 98, // 98-100%
      responseTime: Math.random() * 100 + 150, // 150-250ms
      requests: Math.floor(Math.random() * 300000) + 150000, // Higher monthly counts
      errors: Math.floor(Math.random() * 600) + 60
    };
  });

  return {
    systemUptime: 99.87,
    avgResponseTime: 187,
    errorRate: 0.23,
    totalRequests: 156734,
    bandwidthUsage: 2847563456, // bytes
    storageUsage: 45234567890, // bytes
    performanceTrend: trend,
    topErrors: [
      { type: '404 Not Found', count: 45, lastOccurred: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
      { type: '500 Internal Error', count: 12, lastOccurred: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { type: '503 Service Unavailable', count: 8, lastOccurred: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() }
    ],
    resourceUsage: {
      cpu: 34.2,
      memory: 67.8,
      storage: 45.3,
      bandwidth: 23.1
    }
  };
};

export function useAnalytics(): UseAnalyticsReturn {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string } | null>(null);

  const generateMockData = useCallback((): ReportData => {
    const now = new Date();
    const start = new Date(now);
    
    switch (dateRange) {
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
      case '6m':
        start.setMonth(start.getMonth() - 6);
        break;
      case '1y':
        start.setFullYear(start.getFullYear() - 1);
        break;
      case 'custom':
        if (customDateRange) {
          start.setTime(new Date(customDateRange.start).getTime());
          now.setTime(new Date(customDateRange.end).getTime());
        }
        break;
    }

    return {
      user: generateMockUserAnalytics(),
      content: generateMockContentAnalytics(),
      engagement: generateMockEngagementAnalytics(),
      performance: generateMockPerformanceAnalytics(),
      generatedAt: new Date().toISOString(),
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0]
      }
    };
  }, [dateRange, customDateRange]);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const data = generateMockData();
      setReportData(data);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  }, [generateMockData]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const exportReport = async (request: ReportRequest) => {
    try {
      // In a real app, this would make an API call to generate and download the report
      const data = generateMockData();
      const filename = `analytics-report-${request.type}-${Date.now()}.${request.format}`;
      
      // Mock export functionality
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      throw new Error('Failed to export report');
    }
  };

  const getUserMetrics = (): MetricCard[] => {
    if (!reportData) return [];

    const { user } = reportData;
    const previousUsers = user.totalUsers - user.newUsersThisMonth;
    
    return [
      {
        title: 'Total Users',
        value: user.totalUsers,
        change: calculateTrend(user.totalUsers, previousUsers),
        format: 'number',
        color: 'blue'
      },
      {
        title: 'Active Users',
        value: user.activeUsers,
        change: { value: user.userGrowthRate, period: 'vs. last month', trend: 'up' },
        format: 'number',
        color: 'green'
      },
      {
        title: 'New This Month',
        value: user.newUsersThisMonth,
        format: 'number',
        color: 'purple'
      },
      {
        title: 'Engagement Rate',
        value: (user.activeUsers / user.totalUsers) * 100,
        format: 'percentage',
        color: 'indigo'
      }
    ];
  };

  const getContentMetrics = (): MetricCard[] => {
    if (!reportData) return [];

    const { content } = reportData;
    
    return [
      {
        title: 'Total Content',
        value: content.totalContent,
        change: { value: content.contentGrowthRate, period: 'vs. last month', trend: 'up' },
        format: 'number',
        color: 'blue'
      },
      {
        title: 'Published',
        value: content.publishedContent,
        format: 'number',
        color: 'green'
      },
      {
        title: 'In Draft',
        value: content.draftContent,
        format: 'number',
        color: 'yellow'
      },
      {
        title: 'Publication Rate',
        value: (content.publishedContent / content.totalContent) * 100,
        format: 'percentage',
        color: 'purple'
      }
    ];
  };

  const getEngagementMetrics = (): MetricCard[] => {
    if (!reportData) return [];

    const { engagement } = reportData;
    
    return [
      {
        title: 'Total Sessions',
        value: engagement.totalSessions,
        format: 'number',
        color: 'blue'
      },
      {
        title: 'Avg Session Duration',
        value: engagement.avgSessionDuration,
        format: 'duration',
        color: 'green'
      },
      {
        title: 'Bounce Rate',
        value: engagement.bounceRate,
        format: 'percentage',
        color: 'red'
      },
      {
        title: 'Page Views',
        value: engagement.pageViews,
        format: 'number',
        color: 'purple'
      }
    ];
  };

  const getPerformanceMetrics = (): MetricCard[] => {
    if (!reportData) return [];

    const { performance } = reportData;
    
    return [
      {
        title: 'System Uptime',
        value: performance.systemUptime,
        format: 'percentage',
        color: 'green'
      },
      {
        title: 'Avg Response Time',
        value: performance.avgResponseTime,
        format: 'number',
        color: 'blue'
      },
      {
        title: 'Error Rate',
        value: performance.errorRate,
        format: 'percentage',
        color: 'red'
      },
      {
        title: 'Storage Used',
        value: performance.storageUsage,
        format: 'bytes',
        color: 'purple'
      }
    ];
  };

  const getUserChartData = (): ChartData[] => {
    if (!reportData) return [];

    const { user } = reportData;
    
    return [
      {
        labels: user.registrationTrend.map(d => {
          const date = new Date(d.date);
          return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        }),
        datasets: [{
          label: 'New Registrations',
          data: user.registrationTrend.map(d => d.count),
          borderColor: CHART_COLORS.primary[0],
          backgroundColor: CHART_COLORS.gradient[0],
          fill: true,
          tension: 0.4
        }]
      },
      {
        labels: Object.keys(user.usersByRole),
        datasets: [{
          label: 'Users by Role',
          data: Object.values(user.usersByRole),
          backgroundColor: CHART_COLORS.gradient.slice(0, Object.keys(user.usersByRole).length)
        }]
      }
    ];
  };

  const getContentChartData = (): ChartData[] => {
    if (!reportData) return [];

    const { content } = reportData;
    
    return [
      {
        labels: content.contentTrend.map(d => {
          const date = new Date(d.date);
          return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        }),
        datasets: [
          {
            label: 'Published',
            data: content.contentTrend.map(d => d.published),
            borderColor: CHART_COLORS.success[0],
            backgroundColor: CHART_COLORS.success[0],
            fill: false
          },
          {
            label: 'Drafted',
            data: content.contentTrend.map(d => d.drafted),
            borderColor: CHART_COLORS.warning[0],
            backgroundColor: CHART_COLORS.warning[0],
            fill: false
          }
        ]
      }
    ];
  };

  const getEngagementChartData = (): ChartData[] => {
    if (!reportData) return [];

    const { engagement } = reportData;
    
    return [
      {
        labels: engagement.engagementTrend.map(d => {
          const date = new Date(d.date);
          return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        }),
        datasets: [{
          label: 'Monthly Sessions',
          data: engagement.engagementTrend.map(d => d.sessions),
          borderColor: CHART_COLORS.primary[0],
          backgroundColor: CHART_COLORS.gradient[0],
          fill: true,
          tension: 0.4
        }]
      }
    ];
  };

  const getPerformanceChartData = (): ChartData[] => {
    if (!reportData) return [];

    const { performance } = reportData;
    
    return [
      {
        labels: performance.performanceTrend.map(d => {
          const date = new Date(d.date);
          return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        }),
        datasets: [
          {
            label: 'Response Time (ms)',
            data: performance.performanceTrend.map(d => Math.round(d.responseTime)),
            borderColor: CHART_COLORS.info[0],
            backgroundColor: CHART_COLORS.info[0],
            fill: false
          }
        ]
      }
    ];
  };

  return {
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
  };
}