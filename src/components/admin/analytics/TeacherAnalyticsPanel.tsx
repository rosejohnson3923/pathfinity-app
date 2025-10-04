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
import '../../../design-system/tokens/colors.css';
import '../../../design-system/tokens/spacing.css';
import '../../../design-system/tokens/borders.css';
import '../../../design-system/tokens/typography.css';
import '../../../design-system/tokens/shadows.css';
import '../../../design-system/tokens/dashboard.css';

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
  const [hoveredHeader, setHoveredHeader] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [isExportHovered, setIsExportHovered] = useState(false);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>Teacher Analytics</h2>
          <p style={{ color: 'var(--dashboard-text-secondary)', marginTop: 'var(--space-1)' }}>Performance metrics and insights for teaching staff</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              border: '1px solid var(--dashboard-border-primary)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'transparent',
              color: 'var(--dashboard-text-primary)',
              cursor: 'pointer',
              opacity: isLoading ? 0.5 : 1
            }}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: isExportHovered ? '#1d4ed8' : '#2563eb',
              color: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 200ms'
            }}
            onMouseEnter={() => setIsExportHovered(true)}
            onMouseLeave={() => setIsExportHovered(false)}
          >
            <Download style={{ width: '1rem', height: '1rem' }} />
            Export CSV
          </button>
        </div>
      </div>

      {/* School Filter */}
      <div style={{
        backgroundColor: 'var(--dashboard-bg-elevated)',
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--dashboard-border-primary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Filter className="w-5 h-5" style={{ color: 'var(--dashboard-text-tertiary)' }} />
            <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Filter by School:</label>
          </div>
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              border: '1px solid var(--dashboard-border-primary)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--dashboard-bg-elevated)',
              color: 'var(--dashboard-text-primary)'
            }}
            className="focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Schools</option>
            {schools.slice(1).map((school) => (
              <option key={school} value={school}>{school}</option>
            ))}
          </select>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>
            Showing {filteredTeachers.length} of {analytics.teachers.length} teachers
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div style={{
          backgroundColor: 'var(--dashboard-bg-elevated)',
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--dashboard-border-primary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Total Teachers</p>
              <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>{analytics.totalTeachers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--dashboard-bg-elevated)',
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--dashboard-border-primary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Active Today</p>
              <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>{analytics.activeTeachers}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--dashboard-bg-elevated)',
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--dashboard-border-primary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Avg Engagement</p>
              <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>{analytics.avgEngagementRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--dashboard-bg-elevated)',
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--dashboard-border-primary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Lessons Created</p>
              <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>{analytics.totalLessonsCreated.toLocaleString()}</p>
            </div>
            <BookOpen className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--dashboard-bg-elevated)',
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--dashboard-border-primary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Teaching Hours</p>
              <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>{analytics.totalTeachingHours.toLocaleString()}</p>
            </div>
            <Clock className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Teacher Performance Table */}
      <div style={{
        backgroundColor: 'var(--dashboard-bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--dashboard-border-primary)'
      }}>
        <div style={{
          padding: 'var(--space-4) var(--space-6)',
          borderBottom: '1px solid var(--dashboard-border-primary)'
        }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)' }}>Individual Teacher Performance</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--dashboard-bg-secondary)' }}>
              <tr>
                <th
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    textAlign: 'left',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--dashboard-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    width: '20rem',
                    backgroundColor: hoveredHeader === 'name' ? 'var(--dashboard-bg-hover)' : undefined
                  }}
                  onClick={() => handleSort('name')}
                  onMouseEnter={() => setHoveredHeader('name')}
                  onMouseLeave={() => setHoveredHeader(null)}
                >
                  <div className="flex items-center gap-1">
                    Teacher Info
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  style={{
                    padding: 'var(--space-3) var(--space-6)',
                    textAlign: 'left',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--dashboard-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    backgroundColor: hoveredHeader === 'studentsAssigned' ? 'var(--dashboard-bg-hover)' : undefined
                  }}
                  onClick={() => handleSort('studentsAssigned')}
                  onMouseEnter={() => setHoveredHeader('studentsAssigned')}
                  onMouseLeave={() => setHoveredHeader(null)}
                >
                  <div className="flex items-center gap-1">
                    Students
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  style={{
                    padding: 'var(--space-3) var(--space-6)',
                    textAlign: 'left',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--dashboard-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    backgroundColor: hoveredHeader === 'lessonsCreated' ? 'var(--dashboard-bg-hover)' : undefined
                  }}
                  onClick={() => handleSort('lessonsCreated')}
                  onMouseEnter={() => setHoveredHeader('lessonsCreated')}
                  onMouseLeave={() => setHoveredHeader(null)}
                >
                  <div className="flex items-center gap-1">
                    Lessons
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  style={{
                    padding: 'var(--space-3) var(--space-6)',
                    textAlign: 'left',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--dashboard-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    backgroundColor: hoveredHeader === 'avgEngagementRate' ? 'var(--dashboard-bg-hover)' : undefined
                  }}
                  onClick={() => handleSort('avgEngagementRate')}
                  onMouseEnter={() => setHoveredHeader('avgEngagementRate')}
                  onMouseLeave={() => setHoveredHeader(null)}
                >
                  <div className="flex items-center gap-1">
                    Engagement
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  style={{
                    padding: 'var(--space-3) var(--space-6)',
                    textAlign: 'left',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--dashboard-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    backgroundColor: hoveredHeader === 'totalTeachingHours' ? 'var(--dashboard-bg-hover)' : undefined
                  }}
                  onClick={() => handleSort('totalTeachingHours')}
                  onMouseEnter={() => setHoveredHeader('totalTeachingHours')}
                  onMouseLeave={() => setHoveredHeader(null)}
                >
                  <div className="flex items-center gap-1">
                    Hours
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  style={{
                    padding: 'var(--space-3) var(--space-6)',
                    textAlign: 'left',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--dashboard-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    backgroundColor: hoveredHeader === 'avgStudentScore' ? 'var(--dashboard-bg-hover)' : undefined
                  }}
                  onClick={() => handleSort('avgStudentScore')}
                  onMouseEnter={() => setHoveredHeader('avgStudentScore')}
                  onMouseLeave={() => setHoveredHeader(null)}
                >
                  <div className="flex items-center gap-1">
                    Student Score
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  style={{
                    padding: 'var(--space-3) var(--space-6)',
                    textAlign: 'left',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--dashboard-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    backgroundColor: hoveredHeader === 'contentRating' ? 'var(--dashboard-bg-hover)' : undefined
                  }}
                  onClick={() => handleSort('contentRating')}
                  onMouseEnter={() => setHoveredHeader('contentRating')}
                  onMouseLeave={() => setHoveredHeader(null)}
                >
                  <div className="flex items-center gap-1">
                    Rating
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </th>
                <th style={{
                  padding: 'var(--space-3) var(--space-6)',
                  textAlign: 'left',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--dashboard-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody style={{
              backgroundColor: 'var(--dashboard-bg-elevated)',
              borderTop: '1px solid var(--dashboard-border-primary)'
            }}>
              {sortedTeachers.map((teacher) => (
                <tr
                  key={teacher.id}
                  style={{
                    borderBottom: '1px solid var(--dashboard-border-primary)',
                    backgroundColor: hoveredRow === teacher.id ? 'var(--dashboard-bg-hover)' : undefined
                  }}
                  onMouseEnter={() => setHoveredRow(teacher.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={{ padding: 'var(--space-4)' }}>
                    <div className="max-w-xs">
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }} className="truncate">{teacher.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--dashboard-text-tertiary)' }} className="truncate">{teacher.school}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--dashboard-text-tertiary)', marginTop: 'var(--space-1)' }} className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {teacher.phone}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" style={{ color: 'var(--dashboard-text-tertiary)' }} />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>{teacher.studentsAssigned}</span>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" style={{ color: 'var(--dashboard-text-tertiary)' }} />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>{teacher.lessonsCreated}</span>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                    <div className="flex items-center gap-2">
                      <div style={{ width: '4rem', backgroundColor: 'var(--dashboard-bg-secondary)', borderRadius: '9999px', height: '0.5rem' }}>
                        <div
                          className={`h-2 rounded-full ${
                            teacher.avgEngagementRate >= 90 ? 'bg-green-500' :
                            teacher.avgEngagementRate >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${teacher.avgEngagementRate}%` }}
                        />
                      </div>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>
                        {teacher.avgEngagementRate}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" style={{ color: 'var(--dashboard-text-tertiary)' }} />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>{teacher.totalTeachingHours}h</span>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" style={{ color: 'var(--dashboard-text-tertiary)' }} />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>{teacher.avgStudentScore}%</span>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                      <Star style={{ width: '1rem', height: '1rem', color: '#fbbf24', fill: '#fbbf24' }} />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>{teacher.contentRating}</span>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: 'var(--space-1) var(--space-2)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-medium)',
                      backgroundColor: '#d1fae5',
                      color: '#065f46'
                    }}>
                      <Activity style={{ width: '0.75rem', height: '0.75rem', marginRight: 'var(--space-1)' }} />
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
      <div style={{
        backgroundColor: 'var(--dashboard-bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--dashboard-border-primary)'
      }}>
        <div style={{
          padding: 'var(--space-4) var(--space-6)',
          borderBottom: '1px solid var(--dashboard-border-primary)'
        }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)' }}>Recent Teacher Activities</h3>
        </div>
        <div style={{ padding: 'var(--space-6)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', backgroundColor: '#dbeafe', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)' }}>
              <Award style={{ width: '1.25rem', height: '1.25rem', color: '#2563eb' }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Emily Johnson awarded 15 achievements to students</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--dashboard-text-tertiary)' }}>2 minutes ago</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', backgroundColor: '#d1fae5', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)' }}>
              <BookOpen style={{ width: '1.25rem', height: '1.25rem', color: '#059669' }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Jenna Grain created a new Math lesson for Grade 3</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--dashboard-text-tertiary)' }}>15 minutes ago</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', backgroundColor: '#f3e8ff', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)' }}>
              <Users style={{ width: '1.25rem', height: '1.25rem', color: '#7c3aed' }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Sarah Thompson started a live session with 24 students</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--dashboard-text-tertiary)' }}>1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );  
}