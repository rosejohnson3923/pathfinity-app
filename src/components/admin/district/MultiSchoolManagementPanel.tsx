import React, { useState } from 'react';
import {
  Building,
  Users,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Settings,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import '../../../design-system/tokens/colors.css';
import '../../../design-system/tokens/spacing.css';
import '../../../design-system/tokens/borders.css';
import '../../../design-system/tokens/typography.css';
import '../../../design-system/tokens/shadows.css';
import '../../../design-system/tokens/dashboard.css';

interface Principal {
  id: string;
  name: string;
  email: string;
  phone: string;
  startDate: string;
}

interface SchoolInfo {
  id: string;
  name: string;
  type: 'elementary' | 'middle' | 'high';
  address: string;
  phone: string;
  email: string;
  principal: Principal;
  enrollment: {
    current: number;
    capacity: number;
    waitlist: number;
  };
  staff: {
    teachers: number;
    support: number;
    total: number;
  };
  grades: string;
  establishedYear: number;
  status: 'active' | 'maintenance' | 'closed';
  performance: {
    overallRating: number;
    testScores: number;
    attendance: number;
    engagement: number;
  };
  budget: {
    allocated: number;
    spent: number;
    remaining: number;
  };
  lastInspection: string;
  accreditation: {
    status: 'accredited' | 'provisional' | 'pending';
    expiryDate: string;
  };
}

// Mock data for PlainviewISD schools
const mockSchoolsData: SchoolInfo[] = [
  {
    id: 'sand-view-elementary-school-001',
    name: 'Sand View Elementary',
    type: 'elementary',
    address: '123 Elementary Drive, Plainview, TX 79072',
    phone: '(806) 555-0101',
    email: 'office@sandview.plainviewisd.edu',
    principal: {
      id: 'principal-001',
      name: 'Mrs. Sarah Martinez',
      email: 'principal@sandview.plainviewisd.edu',
      phone: '(806) 555-0102',
      startDate: '2019-08-01'
    },
    enrollment: {
      current: 485,
      capacity: 520,
      waitlist: 12
    },
    staff: {
      teachers: 32,
      support: 18,
      total: 50
    },
    grades: 'Pre-K - 5th Grade',
    establishedYear: 1985,
    status: 'active',
    performance: {
      overallRating: 91.2,
      testScores: 88.3,
      attendance: 96.8,
      engagement: 94.5
    },
    budget: {
      allocated: 2800000,
      spent: 2450000,
      remaining: 350000
    },
    lastInspection: '2024-01-10',
    accreditation: {
      status: 'accredited',
      expiryDate: '2027-06-30'
    }
  },
  {
    id: 'ocean-view-middle-school-001',
    name: 'Ocean View Middle School',
    type: 'middle',
    address: '456 Middle School Way, Plainview, TX 79072',
    phone: '(806) 555-0201',
    email: 'office@oceanview.plainviewisd.edu',
    principal: {
      id: 'principal-002',
      name: 'Mr. David Rodriguez',
      email: 'principal@oceanview.plainviewisd.edu',
      phone: '(806) 555-0202',
      startDate: '2020-07-15'
    },
    enrollment: {
      current: 342,
      capacity: 400,
      waitlist: 8
    },
    staff: {
      teachers: 28,
      support: 15,
      total: 43
    },
    grades: '6th - 8th Grade',
    establishedYear: 1992,
    status: 'active',
    performance: {
      overallRating: 85.1,
      testScores: 82.7,
      attendance: 94.2,
      engagement: 88.2
    },
    budget: {
      allocated: 2200000,
      spent: 1980000,
      remaining: 220000
    },
    lastInspection: '2024-01-08',
    accreditation: {
      status: 'accredited',
      expiryDate: '2026-12-31'
    }
  },
  {
    id: 'city-view-high-school-001',
    name: 'City View High School',
    type: 'high',
    address: '789 High School Boulevard, Plainview, TX 79072',
    phone: '(806) 555-0301',
    email: 'office@cityview.plainviewisd.edu',
    principal: {
      id: 'principal-003',
      name: 'Dr. Jennifer Thompson',
      email: 'principal@cityview.plainviewisd.edu',
      phone: '(806) 555-0302',
      startDate: '2018-06-01'
    },
    enrollment: {
      current: 420,
      capacity: 480,
      waitlist: 15
    },
    staff: {
      teachers: 29,
      support: 21,
      total: 50
    },
    grades: '9th - 12th Grade',
    establishedYear: 1975,
    status: 'active',
    performance: {
      overallRating: 86.0,
      testScores: 84.1,
      attendance: 91.5,
      engagement: 85.7
    },
    budget: {
      allocated: 3200000,
      spent: 2880000,
      remaining: 320000
    },
    lastInspection: '2024-01-12',
    accreditation: {
      status: 'accredited',
      expiryDate: '2025-08-31'
    }
  }
];

export function MultiSchoolManagementPanel() {
  const [schools] = useState<SchoolInfo[]>(mockSchoolsData);
  const [selectedSchool, setSelectedSchool] = useState<SchoolInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'maintenance' | 'closed'>('all');

  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.principal.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || school.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (rating: number) => {
    if (rating >= 90) return 'text-green-600';
    if (rating >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>Multi-School Management</h2>
          <p style={{ color: 'var(--dashboard-text-secondary)', marginTop: 'var(--space-1)' }}>Manage all schools in Plainview ISD district</p>
        </div>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: 'var(--space-2) var(--space-4)',
          backgroundColor: 'var(--dashboard-action-primary)',
          color: 'white',
          borderRadius: 'var(--radius-lg)',
          border: 'none',
          cursor: 'pointer'
        }}>
          <Plus className="w-4 h-4" />
          Add School
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Total Schools</p>
              <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#3B82F6' }}>{schools.length}</p>
            </div>
            <Building className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Total Enrollment</p>
              <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#10B981' }}>
                {schools.reduce((sum, school) => sum + school.enrollment.current, 0).toLocaleString()}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Total Staff</p>
              <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#A855F7' }}>
                {schools.reduce((sum, school) => sum + school.staff.total, 0)}
              </p>
            </div>
            <GraduationCap className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Avg Performance</p>
              <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#F97316' }}>
                {(schools.reduce((sum, school) => sum + school.performance.overallRating, 0) / schools.length).toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ position: 'relative' }}>
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--dashboard-text-secondary)' }} />
              <input
                type="text"
                placeholder="Search schools or principals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '2.5rem',
                  paddingRight: 'var(--space-4)',
                  paddingTop: 'var(--space-2)',
                  paddingBottom: 'var(--space-2)',
                  border: '1px solid var(--dashboard-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--dashboard-bg-elevated)',
                  color: 'var(--dashboard-text-primary)'
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Filter className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                border: '1px solid var(--dashboard-border-primary)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--dashboard-bg-elevated)',
                color: 'var(--dashboard-text-primary)'
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSchools.map((school) => (
          <div key={school.id} style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)', transition: 'box-shadow 200ms ease' }}>
            <div style={{ padding: 'var(--space-6)' }}>
              {/* School Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)' }}>{school.name}</h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)', textTransform: 'capitalize' }}>{school.type} School • Est. {school.establishedYear}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(school.status)}`}>
                  {school.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {school.status === 'maintenance' && <Clock className="w-3 h-3 mr-1" />}
                  {school.status === 'closed' && <AlertCircle className="w-3 h-3 mr-1" />}
                  {school.status.charAt(0).toUpperCase() + school.status.slice(1)}
                </span>
              </div>

              {/* Key Metrics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Enrollment</span>
                  <span style={{ fontWeight: 'var(--font-medium)' }}>
                    {school.enrollment.current}/{school.enrollment.capacity}
                    {school.enrollment.waitlist > 0 && (
                      <span style={{ fontSize: 'var(--text-xs)', color: '#3B82F6', marginLeft: 'var(--space-1)' }}>
                        (+{school.enrollment.waitlist} waiting)
                      </span>
                    )}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Staff</span>
                  <span style={{ fontWeight: 'var(--font-medium)' }}>{school.staff.total} ({school.staff.teachers} teachers)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Performance</span>
                  <span className={`font-medium ${getPerformanceColor(school.performance.overallRating)}`}>
                    {school.performance.overallRating}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Budget Usage</span>
                  <span style={{ fontWeight: 'var(--font-medium)' }}>
                    {Math.round((school.budget.spent / school.budget.allocated) * 100)}%
                  </span>
                </div>
              </div>

              {/* Principal Info */}
              <div style={{ borderTop: '1px solid var(--dashboard-border-primary)', paddingTop: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>{school.principal.name}</p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Principal</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--dashboard-text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <MapPin className="w-3 h-3" />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{school.address}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Phone className="w-3 h-3" />
                  <span>{school.phone}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Mail className="w-3 h-3" />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{school.email}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  onClick={() => setSelectedSchool(school)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--space-2)',
                    padding: 'var(--space-2) var(--space-3)',
                    backgroundColor: 'var(--dashboard-action-primary)',
                    color: 'white',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--text-sm)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-3)',
                  border: '1px solid var(--dashboard-border-primary)',
                  color: 'var(--dashboard-text-primary)',
                  backgroundColor: 'var(--dashboard-bg-elevated)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer'
                }}>
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-3)',
                  border: '1px solid var(--dashboard-border-primary)',
                  color: 'var(--dashboard-text-primary)',
                  backgroundColor: 'var(--dashboard-bg-elevated)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer'
                }}>
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* School Detail Modal */}
      {selectedSchool && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)', zIndex: 50 }}>
          <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-lg)', maxWidth: '64rem', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: 'var(--space-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
                <div>
                  <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>{selectedSchool.name}</h2>
                  <p style={{ color: 'var(--dashboard-text-secondary)' }}>Detailed school information and metrics</p>
                </div>
                <button
                  onClick={() => setSelectedSchool(null)}
                  style={{ color: 'var(--dashboard-text-secondary)', cursor: 'pointer', backgroundColor: 'transparent', border: 'none' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)' }}>Basic Information</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div>
                      <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>School Type</label>
                      <p style={{ textTransform: 'capitalize', color: 'var(--dashboard-text-primary)' }}>{selectedSchool.type} School</p>
                    </div>
                    <div>
                      <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Grades Served</label>
                      <p style={{ color: 'var(--dashboard-text-primary)' }}>{selectedSchool.grades}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Established</label>
                      <p style={{ color: 'var(--dashboard-text-primary)' }}>{selectedSchool.establishedYear}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Address</label>
                      <p style={{ color: 'var(--dashboard-text-primary)' }}>{selectedSchool.address}</p>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)' }}>Performance Metrics</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div>
                      <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Overall Rating</label>
                      <p className={getPerformanceColor(selectedSchool.performance.overallRating)}>
                        {selectedSchool.performance.overallRating}%
                      </p>
                    </div>
                    <div>
                      <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Test Scores</label>
                      <p style={{ color: 'var(--dashboard-text-primary)' }}>{selectedSchool.performance.testScores}%</p>
                    </div>
                    <div>
                      <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Attendance Rate</label>
                      <p style={{ color: 'var(--dashboard-text-primary)' }}>{selectedSchool.performance.attendance}%</p>
                    </div>
                    <div>
                      <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Engagement Rate</label>
                      <p style={{ color: 'var(--dashboard-text-primary)' }}>{selectedSchool.performance.engagement}%</p>
                    </div>
                  </div>
                </div>

                {/* Budget Information */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)' }}>Budget Information</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div>
                      <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Allocated Budget</label>
                      <p style={{ color: 'var(--dashboard-text-primary)' }}>{formatCurrency(selectedSchool.budget.allocated)}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Amount Spent</label>
                      <p style={{ color: 'var(--dashboard-text-primary)' }}>{formatCurrency(selectedSchool.budget.spent)}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Remaining</label>
                      <p style={{ color: '#10B981' }}>{formatCurrency(selectedSchool.budget.remaining)}</p>
                    </div>
                  </div>
                </div>

                {/* Principal Information */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)' }}>Principal Information</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div>
                      <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Name</label>
                      <p style={{ color: 'var(--dashboard-text-primary)' }}>{selectedSchool.principal.name}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Email</label>
                      <p style={{ color: 'var(--dashboard-text-primary)' }}>{selectedSchool.principal.email}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Phone</label>
                      <p style={{ color: 'var(--dashboard-text-primary)' }}>{selectedSchool.principal.phone}</p>
                    </div>
                    <div>
                      <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)' }}>Start Date</label>
                      <p style={{ color: 'var(--dashboard-text-primary)' }}>{new Date(selectedSchool.principal.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
                <button
                  onClick={() => setSelectedSchool(null)}
                  style={{
                    padding: 'var(--space-2) var(--space-4)',
                    border: '1px solid var(--dashboard-border-primary)',
                    color: 'var(--dashboard-text-primary)',
                    backgroundColor: 'var(--dashboard-bg-elevated)',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
                <button style={{
                  padding: 'var(--space-2) var(--space-4)',
                  backgroundColor: 'var(--dashboard-action-primary)',
                  color: 'white',
                  borderRadius: 'var(--radius-lg)',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  Edit School
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
