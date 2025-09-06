import React, { useState } from 'react';
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Users,
  Building,
  BookOpen,
  Award,
  DollarSign,
  Clock,
  Target,
  FileText,
  PieChart,
  LineChart,
  Shield,
  Plus,
  Minus
} from 'lucide-react';

interface ReportData {
  id: string;
  title: string;
  type: 'academic' | 'financial' | 'operational' | 'compliance';
  description: string;
  lastGenerated: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  status: 'ready' | 'generating' | 'error';
  size: string;
}

interface DistrictKPI {
  metric: string;
  value: number;
  unit: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  target?: number;
  category: 'academic' | 'operational' | 'financial';
}

const mockReports: ReportData[] = [
  {
    id: 'academic-performance-q1',
    title: 'Q1 Academic Performance Report',
    type: 'academic',
    description: 'Comprehensive academic performance across all schools including test scores, graduation rates, and student progress.',
    lastGenerated: '2024-01-15T09:30:00Z',
    frequency: 'quarterly',
    status: 'ready',
    size: '2.4 MB'
  },
  {
    id: 'district-financial-summary',
    title: 'District Financial Summary',
    type: 'financial',
    description: 'Budget utilization, expenditure analysis, and financial projections for all schools.',
    lastGenerated: '2024-01-14T16:45:00Z',
    frequency: 'monthly',
    status: 'ready',
    size: '1.8 MB'
  },
  {
    id: 'teacher-effectiveness-report',
    title: 'Teacher Effectiveness Analysis',
    type: 'academic',
    description: 'District-wide teacher performance metrics, professional development needs, and retention analysis.',
    lastGenerated: '2024-01-13T11:20:00Z',
    frequency: 'quarterly', 
    status: 'ready',
    size: '3.1 MB'
  },
  {
    id: 'compliance-audit-report',
    title: 'State Compliance Audit',
    type: 'compliance',
    description: 'Compliance status with state education regulations, safety requirements, and accreditation standards.',
    lastGenerated: '2024-01-12T14:15:00Z',
    frequency: 'annual',
    status: 'ready',
    size: '5.2 MB'
  },
  {
    id: 'operational-efficiency',
    title: 'Operational Efficiency Report',
    type: 'operational',
    description: 'Transportation, facilities utilization, technology usage, and resource allocation efficiency.',
    lastGenerated: '2024-01-11T08:00:00Z',
    frequency: 'monthly',
    status: 'generating',
    size: 'N/A'
  },
  {
    id: 'student-demographic-analysis',
    title: 'Student Demographics & Trends',
    type: 'operational',
    description: 'Enrollment trends, demographic shifts, and projected capacity needs across the district.',
    lastGenerated: '2024-01-10T13:30:00Z',
    frequency: 'monthly',
    status: 'ready',
    size: '1.2 MB'
  }
];

const mockKPIs: DistrictKPI[] = [
  {
    metric: 'District-wide Test Scores',
    value: 87.4,
    unit: '%',
    change: 2.3,
    changeType: 'increase',
    target: 90,
    category: 'academic'
  },
  {
    metric: 'Graduation Rate',
    value: 94.2,
    unit: '%',
    change: 1.8,
    changeType: 'increase',
    target: 95,
    category: 'academic'
  },
  {
    metric: 'Teacher Retention',
    value: 91.5,
    unit: '%',
    change: -1.2,
    changeType: 'decrease',
    target: 93,
    category: 'operational'
  },
  {
    metric: 'Budget Utilization',
    value: 92.1,
    unit: '%',
    change: 0.5,
    changeType: 'stable',
    target: 95,
    category: 'financial'
  },
  {
    metric: 'Student Attendance',
    value: 94.8,
    unit: '%',
    change: 1.1,
    changeType: 'increase',
    target: 96,
    category: 'operational'
  },
  {
    metric: 'Parent Satisfaction',
    value: 88.3,
    unit: '%',
    change: 3.2,
    changeType: 'increase',
    target: 90,
    category: 'operational'
  }
];

export function DistrictReportsPanel() {
  const [reports] = useState<ReportData[]>(mockReports);
  const [kpis] = useState<DistrictKPI[]>(mockKPIs);
  const [selectedReportType, setSelectedReportType] = useState<'all' | 'academic' | 'financial' | 'operational' | 'compliance'>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredReports = reports.filter(report => 
    selectedReportType === 'all' || report.type === selectedReportType
  );

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'academic':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'financial':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'operational':
        return <Users className="w-5 h-5 text-purple-600" />;
      case 'compliance':
        return <Shield className="w-5 h-5 text-orange-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleGenerateReport = async (reportType: string) => {
    setIsGenerating(true);
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsGenerating(false);
  };

  const handleDownloadReport = (reportId: string) => {
    // Simulate download
    console.log(`Downloading report: ${reportId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">District Reports & Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Comprehensive reporting and performance metrics for Plainview ISD</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleGenerateReport('custom')}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-200"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            Generate Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Custom Report
          </button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Key Performance Indicators</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kpis.map((kpi, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{kpi.metric}</h4>
                  {getChangeIcon(kpi.changeType)}
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {kpi.value}{kpi.unit}
                  </span>
                  <span className={`text-sm ${
                    kpi.changeType === 'increase' ? 'text-green-600' :
                    kpi.changeType === 'decrease' ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {kpi.changeType === 'stable' ? '±' : kpi.changeType === 'increase' ? '+' : ''}{kpi.change}{kpi.unit}
                  </span>
                </div>
                {kpi.target && (
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Target: {kpi.target}{kpi.unit}</span>
                    <span className={kpi.value >= kpi.target ? 'text-green-600' : 'text-orange-600'}>
                      {kpi.value >= kpi.target ? 'Met' : 'Below Target'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Report Type:</label>
            <select
              value={selectedReportType}
              onChange={(e) => setSelectedReportType(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Reports</option>
              <option value="academic">Academic</option>
              <option value="financial">Financial</option>
              <option value="operational">Operational</option>
              <option value="compliance">Compliance</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Timeframe:</label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getReportTypeIcon(report.type)}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{report.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{report.type} Report</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                  {report.status === 'generating' && <RefreshCw className="w-3 h-3 mr-1 animate-spin" />}
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{report.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Updated {new Date(report.lastGenerated).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{report.size}</span>
                  </div>
                </div>
                <span className="capitalize bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-xs">
                  {report.frequency}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadReport(report.id)}
                  disabled={report.status !== 'ready'}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => handleGenerateReport(report.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Report Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <BarChart2 className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">Performance Dashboard</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Interactive performance metrics</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <PieChart className="w-6 h-6 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">Budget Analysis</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Financial breakdown by school</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <LineChart className="w-6 h-6 text-purple-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">Trend Analysis</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Historical performance trends</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}