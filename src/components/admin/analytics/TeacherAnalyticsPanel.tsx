import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  BookOpen, 
  Star, 
  Activity,
  ChevronDown,
  Download,
  RefreshCw,
  UserCheck,
  Calendar,
  Target,
  Award,
  Filter,
  Phone
} from 'lucide-react';

interface TeacherStats {
  id: string;
  name: string;
  email: string;
  school: string;
  phone: string;
  studentsAssigned: number;
  lessonsCreated: number;
  avgEngagementRate: number;
  totalTeachingHours: number;
  avgStudentScore: number;
  lastActive: string;
  contentRating: number;
  achievementsAwarded: number;
}

interface TeacherAnalyticsData {
  totalTeachers: number;
  activeTeachers: number;
  avgEngagementRate: number;
  totalLessonsCreated: number;
  totalTeachingHours: number;
  teachers: TeacherStats[];
}

// Mock data for PlainviewISD demo
const mockTeacherAnalytics: TeacherAnalyticsData = {
  totalTeachers: 45,
  activeTeachers: 42,
  avgEngagementRate: 87.3,
  totalLessonsCreated: 1248,
  totalTeachingHours: 3567,
  teachers: [
    {
      id: '1',
      name: 'Jenna Grain',
      email: 'jenna.grain@sandview.plainviewisd.edu',
      school: 'Sand View Elementary',
      phone: '(806) 555-0103',
      studentsAssigned: 28,
      lessonsCreated: 156,
      avgEngagementRate: 94.2,
      totalTeachingHours: 245,
      avgStudentScore: 88.5,
      lastActive: '2024-01-15T10:30:00Z',
      contentRating: 4.8,
      achievementsAwarded: 342
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      email: 'michael.rodriguez@oceanview.plainviewisd.edu',
      school: 'Ocean View Middle School',
      phone: '(806) 555-0203',
      studentsAssigned: 24,
      lessonsCreated: 132,
      avgEngagementRate: 91.7,
      totalTeachingHours: 198,
      avgStudentScore: 85.2,
      lastActive: '2024-01-15T09:15:00Z',
      contentRating: 4.6,
      achievementsAwarded: 289
    },
    {
      id: '3',
      name: 'Sarah Thompson',
      email: 'sarah.thompson@cityview.plainviewisd.edu',
      school: 'City View High School',
      phone: '(806) 555-0303',
      studentsAssigned: 26,
      lessonsCreated: 143,
      avgEngagementRate: 89.4,
      totalTeachingHours: 221,
      avgStudentScore: 87.1,
      lastActive: '2024-01-15T11:45:00Z',
      contentRating: 4.7,
      achievementsAwarded: 315
    },
    {
      id: '4',
      name: 'David Chen',
      email: 'david.chen@northside.plainviewisd.edu',
      school: 'Northside Elementary',
      phone: '(806) 555-0403',
      studentsAssigned: 22,
      lessonsCreated: 98,
      avgEngagementRate: 85.3,
      totalTeachingHours: 167,
      avgStudentScore: 82.8,
      lastActive: '2024-01-14T16:20:00Z',
      contentRating: 4.4,
      achievementsAwarded: 234
    },
    {
      id: '5',
      name: 'Emily Johnson',
      email: 'emily.johnson@westside.plainviewisd.edu',
      school: 'Westside Elementary',
      phone: '(806) 555-0503',
      studentsAssigned: 29,
      lessonsCreated: 178,
      avgEngagementRate: 92.8,
      totalTeachingHours: 267,
      avgStudentScore: 89.3,
      lastActive: '2024-01-15T08:30:00Z',
      contentRating: 4.9,
      achievementsAwarded: 398
    }
  ]
};

export function TeacherAnalyticsPanel() {
  const [analytics] = useState<TeacherAnalyticsData>(mockTeacherAnalytics);
  const [sortBy, setSortBy] = useState<keyof TeacherStats>('avgEngagementRate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  
  // Get unique schools for filter
  const schools = ['all', ...Array.from(new Set(analytics.teachers.map(t => t.school)))];

  const handleSort = (field: keyof TeacherStats) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Filter teachers by school
  const filteredTeachers = analytics.teachers.filter(teacher => 
    selectedSchool === 'all' || teacher.school === selectedSchool
  );
  
  const sortedTeachers = [...filteredTeachers].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    return 0;
  });

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handleExport = () => {
    const csvContent = [
      ['Teacher Name', 'School', 'Phone', 'Email', 'Students Assigned', 'Lessons Created', 'Engagement Rate', 'Teaching Hours', 'Student Score', 'Content Rating', 'Achievements'],
      ...filteredTeachers.map(teacher => [
        teacher.name,
        teacher.school,
        teacher.phone,
        teacher.email,
        teacher.studentsAssigned,
        teacher.lessonsCreated,
        `${teacher.avgEngagementRate}%`,
        teacher.totalTeachingHours,
        `${teacher.avgStudentScore}%`,
        teacher.contentRating,
        teacher.achievementsAwarded
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teacher-analytics.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Teacher Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Performance metrics and insights for teaching staff</p>
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
            Export CSV
          </button>
        </div>
      </div>

      {/* School Filter */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by School:</label>
          </div>
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Schools</option>
            {schools.slice(1).map((school) => (
              <option key={school} value={school}>{school}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredTeachers.length} of {analytics.teachers.length} teachers
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Teachers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalTeachers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Today</p>
              <p className="text-2xl font-bold text-green-600">{analytics.activeTeachers}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Engagement</p>
              <p className="text-2xl font-bold text-purple-600">{analytics.avgEngagementRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Lessons Created</p>
              <p className="text-2xl font-bold text-orange-600">{analytics.totalLessonsCreated.toLocaleString()}</p>
            </div>
            <BookOpen className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Teaching Hours</p>
              <p className="text-2xl font-bold text-indigo-600">{analytics.totalTeachingHours.toLocaleString()}</p>
            </div>
            <Clock className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Teacher Performance Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Individual Teacher Performance</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 w-80"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Teacher Info
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('studentsAssigned')}
                >
                  <div className="flex items-center gap-1">
                    Students
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('lessonsCreated')}
                >
                  <div className="flex items-center gap-1">
                    Lessons
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('avgEngagementRate')}
                >
                  <div className="flex items-center gap-1">
                    Engagement
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('totalTeachingHours')}
                >
                  <div className="flex items-center gap-1">
                    Hours
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('avgStudentScore')}
                >
                  <div className="flex items-center gap-1">
                    Student Score
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('contentRating')}
                >
                  <div className="flex items-center gap-1">
                    Rating
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-4">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{teacher.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{teacher.school}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        {teacher.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">{teacher.studentsAssigned}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">{teacher.lessonsCreated}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            teacher.avgEngagementRate >= 90 ? 'bg-green-500' :
                            teacher.avgEngagementRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${teacher.avgEngagementRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {teacher.avgEngagementRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">{teacher.totalTeachingHours}h</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">{teacher.avgStudentScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-900 dark:text-white">{teacher.contentRating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Activity className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Teacher Activities</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Award className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Emily Johnson awarded 15 achievements to students</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <BookOpen className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Jenna Grain created a new Math lesson for Grade 3</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Sarah Thompson started a live session with 24 students</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );  
}