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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Multi-School Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all schools in Plainview ISD district</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Add School
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Schools</p>
              <p className="text-2xl font-bold text-blue-600">{schools.length}</p>
            </div>
            <Building className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Enrollment</p>
              <p className="text-2xl font-bold text-green-600">
                {schools.reduce((sum, school) => sum + school.enrollment.current, 0).toLocaleString()}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Staff</p>
              <p className="text-2xl font-bold text-purple-600">
                {schools.reduce((sum, school) => sum + school.staff.total, 0)}
              </p>
            </div>
            <GraduationCap className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Performance</p>
              <p className="text-2xl font-bold text-orange-600">
                {(schools.reduce((sum, school) => sum + school.performance.overallRating, 0) / schools.length).toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search schools or principals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
          <div key={school.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* School Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{school.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{school.type} School • Est. {school.establishedYear}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(school.status)}`}>
                  {school.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                  {school.status === 'maintenance' && <Clock className="w-3 h-3 mr-1" />}
                  {school.status === 'closed' && <AlertCircle className="w-3 h-3 mr-1" />}
                  {school.status.charAt(0).toUpperCase() + school.status.slice(1)}
                </span>
              </div>

              {/* Key Metrics */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Enrollment</span>
                  <span className="font-medium">
                    {school.enrollment.current}/{school.enrollment.capacity}
                    {school.enrollment.waitlist > 0 && (
                      <span className="text-xs text-blue-600 ml-1">
                        (+{school.enrollment.waitlist} waiting)
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Staff</span>
                  <span className="font-medium">{school.staff.total} ({school.staff.teachers} teachers)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Performance</span>
                  <span className={`font-medium ${getPerformanceColor(school.performance.overallRating)}`}>
                    {school.performance.overallRating}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Budget Usage</span>
                  <span className="font-medium">
                    {Math.round((school.budget.spent / school.budget.allocated) * 100)}%
                  </span>
                </div>
              </div>

              {/* Principal Info */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{school.principal.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Principal</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{school.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  <span>{school.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3 h-3" />
                  <span className="truncate">{school.email}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedSchool(school)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* School Detail Modal */}
      {selectedSchool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedSchool.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">Detailed school information and metrics</p>
                </div>
                <button
                  onClick={() => setSelectedSchool(null)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">School Type</label>
                      <p className="capitalize text-gray-900 dark:text-white">{selectedSchool.type} School</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Grades Served</label>
                      <p className="text-gray-900 dark:text-white">{selectedSchool.grades}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Established</label>
                      <p className="text-gray-900 dark:text-white">{selectedSchool.establishedYear}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Address</label>
                      <p className="text-gray-900 dark:text-white">{selectedSchool.address}</p>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Metrics</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall Rating</label>
                      <p className={getPerformanceColor(selectedSchool.performance.overallRating)}>
                        {selectedSchool.performance.overallRating}%
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Test Scores</label>
                      <p className="text-gray-900 dark:text-white">{selectedSchool.performance.testScores}%</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Attendance Rate</label>
                      <p className="text-gray-900 dark:text-white">{selectedSchool.performance.attendance}%</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Engagement Rate</label>
                      <p className="text-gray-900 dark:text-white">{selectedSchool.performance.engagement}%</p>
                    </div>
                  </div>
                </div>

                {/* Budget Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Budget Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Allocated Budget</label>
                      <p className="text-gray-900 dark:text-white">{formatCurrency(selectedSchool.budget.allocated)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount Spent</label>
                      <p className="text-gray-900 dark:text-white">{formatCurrency(selectedSchool.budget.spent)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Remaining</label>
                      <p className="text-green-600">{formatCurrency(selectedSchool.budget.remaining)}</p>
                    </div>
                  </div>
                </div>

                {/* Principal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Principal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
                      <p className="text-gray-900 dark:text-white">{selectedSchool.principal.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                      <p className="text-gray-900 dark:text-white">{selectedSchool.principal.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</label>
                      <p className="text-gray-900 dark:text-white">{selectedSchool.principal.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Start Date</label>
                      <p className="text-gray-900 dark:text-white">{new Date(selectedSchool.principal.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedSchool(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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