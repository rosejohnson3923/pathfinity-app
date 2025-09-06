import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  GraduationCap,
  Building,
  Award,
  Activity,
  ChevronDown,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface SchoolMetrics {
  id: string;
  name: string;
  type: 'elementary' | 'middle' | 'high';
  totalStudents: number;
  totalTeachers: number;
  avgPerformanceScore: number;
  engagementRate: number;
  graduationRate?: number; // Only for high schools
  testScores: {
    math: number;
    reading: number;
    science: number;
  };
  budgetUtilization: number;
  lastUpdated: string;
}

interface DistrictMetrics {
  totalStudents: number;
  totalTeachers: number;
  totalSchools: number;
  avgDistrictPerformance: number;
  budgetUtilization: number;
  schools: SchoolMetrics[];
}

// Mock data for PlainviewISD district
const mockDistrictData: DistrictMetrics = {
  totalStudents: 1247,
  totalTeachers: 89,
  totalSchools: 3,
  avgDistrictPerformance: 87.4,
  budgetUtilization: 92.1,
  schools: [
    {
      id: 'sand-view-elementary-school-001',
      name: 'Sand View Elementary',
      type: 'elementary',
      totalStudents: 485,
      totalTeachers: 32,
      avgPerformanceScore: 91.2,
      engagementRate: 94.5,
      testScores: {
        math: 88.3,
        reading: 92.1,
        science: 87.9
      },
      budgetUtilization: 89.7,
      lastUpdated: '2024-01-15T10:30:00Z'
    },
    {
      id: 'ocean-view-middle-school-001', 
      name: 'Ocean View Middle School',
      type: 'middle',
      totalStudents: 342,
      totalTeachers: 28,
      avgPerformanceScore: 85.1,
      engagementRate: 88.2,
      testScores: {
        math: 82.7,
        reading: 86.4,
        science: 84.3
      },
      budgetUtilization: 91.8,
      lastUpdated: '2024-01-15T09:45:00Z'
    },
    {
      id: 'city-view-high-school-001',
      name: 'City View High School', 
      type: 'high',
      totalStudents: 420,
      totalTeachers: 29,
      avgPerformanceScore: 86.0,
      engagementRate: 85.7,
      graduationRate: 94.2,
      testScores: {
        math: 84.1,
        reading: 87.2,
        science: 86.8
      },
      budgetUtilization: 94.5,
      lastUpdated: '2024-01-15T11:15:00Z'
    }
  ]
};

export function DistrictAnalyticsPanel() {
  const [districtData] = useState<DistrictMetrics>(mockDistrictData);
  const [selectedMetric, setSelectedMetric] = useState<'performance' | 'engagement' | 'budget'>('performance');
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  const handleExport = () => {
    const csvContent = [
      ['School Name', 'Type', 'Students', 'Teachers', 'Performance Score', 'Engagement Rate', 'Budget Utilization'],
      ...districtData.schools.map(school => [
        school.name,
        school.type,
        school.totalStudents,
        school.totalTeachers,
        `${school.avgPerformanceScore}%`,
        `${school.engagementRate}%`,
        `${school.budgetUtilization}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plainview-isd-district-analytics.csv';
    a.click();
  };

  const getChangeIndicator = (value: number, baseline: number = 85) => {
    if (value > baseline + 2) {
      return <ArrowUp className="w-4 h-4 text-green-500" />;
    } else if (value < baseline - 2) {
      return <ArrowDown className="w-4 h-4 text-red-500" />;
    }
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">District Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Performance insights across all Plainview ISD schools</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-200"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* District Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-blue-600">{districtData.totalStudents.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Teachers</p>
              <p className="text-2xl font-bold text-green-600">{districtData.totalTeachers}</p>
            </div>
            <GraduationCap className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Schools</p>
              <p className="text-2xl font-bold text-purple-600">{districtData.totalSchools}</p>
            </div>
            <Building className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Performance</p>
              <p className="text-2xl font-bold text-orange-600">{districtData.avgDistrictPerformance}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Budget Usage</p>
              <p className="text-2xl font-bold text-indigo-600">{districtData.budgetUtilization}%</p>
            </div>
            <Activity className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* School Comparison Metrics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">School Performance Comparison</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedMetric('performance')}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedMetric === 'performance' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Performance
              </button>
              <button
                onClick={() => setSelectedMetric('engagement')}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedMetric === 'engagement' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Engagement
              </button>
              <button
                onClick={() => setSelectedMetric('budget')}
                className={`px-3 py-1 rounded-md text-sm ${
                  selectedMetric === 'budget' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Budget
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {districtData.schools.map((school) => (
              <div key={school.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{school.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{school.type} School</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Students</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{school.totalStudents}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Teachers</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{school.totalTeachers}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedMetric === 'performance' ? 'Performance' : 
                       selectedMetric === 'engagement' ? 'Engagement' : 'Budget Usage'}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {selectedMetric === 'performance' ? `${school.avgPerformanceScore}%` :
                         selectedMetric === 'engagement' ? `${school.engagementRate}%` :
                         `${school.budgetUtilization}%`}
                      </p>
                      {getChangeIndicator(
                        selectedMetric === 'performance' ? school.avgPerformanceScore :
                        selectedMetric === 'engagement' ? school.engagementRate :
                        school.budgetUtilization
                      )}
                    </div>
                  </div>
                  {school.graduationRate && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Graduation Rate</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{school.graduationRate}%</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Test Scores Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Standardized Test Scores by School</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    School
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Math
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Reading
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Science
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Overall
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {districtData.schools.map((school) => {
                  const overallScore = (school.testScores.math + school.testScores.reading + school.testScores.science) / 3;
                  return (
                    <tr key={school.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{school.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">{school.testScores.math}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">{school.testScores.reading}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">{school.testScores.science}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{overallScore.toFixed(1)}%</span>
                          {getChangeIndicator(overallScore)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}