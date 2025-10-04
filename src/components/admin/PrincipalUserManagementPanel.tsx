import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  RefreshCw,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Shield,
  Calendar,
  BookOpen,
  GraduationCap,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import '../../design-system/tokens/colors.css';
import '../../design-system/tokens/spacing.css';
import '../../design-system/tokens/borders.css';
import '../../design-system/tokens/typography.css';
import '../../design-system/tokens/shadows.css';
import '../../design-system/tokens/dashboard.css';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'counselor' | 'coordinator' | 'assistant_principal' | 'staff';
  department: string;
  subjects?: string[];
  hireDate: string;
  status: 'active' | 'inactive' | 'on_leave';
  students_assigned: number;
  classes_taught: number;
  performance_rating: number;
  last_login: string;
  phone?: string;
  certifications?: string[];
}

interface Department {
  id: string;
  name: string;
  head: string;
  staff_count: number;
}

// Mock data for PlainviewISD staff
const mockStaffData: StaffMember[] = [
  {
    id: '1',
    name: 'Jenna Grain',
    email: 'jenna.grain@sandview.plainviewisd.edu',
    role: 'teacher',
    department: 'Elementary Mathematics',
    subjects: ['Math Grade 3', 'Math Grade 4'],
    hireDate: '2019-08-15',
    status: 'active',
    students_assigned: 28,
    classes_taught: 4,
    performance_rating: 4.8,
    last_login: '2024-01-15T10:30:00Z',
    phone: '(555) 123-4567',
    certifications: ['Elementary Mathematics', 'Special Education']
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@oceanview.plainviewisd.edu',
    role: 'teacher',
    department: 'Science',
    subjects: ['Chemistry', 'Physics'],
    hireDate: '2017-08-20',
    status: 'active',
    students_assigned: 24,
    classes_taught: 3,
    performance_rating: 4.6,
    last_login: '2024-01-15T09:15:00Z',
    phone: '(555) 234-5678',
    certifications: ['Secondary Science', 'Laboratory Safety']
  },
  {
    id: '3',
    name: 'Sarah Thompson',
    email: 'sarah.thompson@cityview.plainviewisd.edu',
    role: 'counselor',
    department: 'Student Services',
    hireDate: '2020-07-01',
    status: 'active',
    students_assigned: 126,
    classes_taught: 0,
    performance_rating: 4.7,
    last_login: '2024-01-15T11:45:00Z',
    phone: '(555) 345-6789',
    certifications: ['School Counseling', 'Crisis Intervention']
  },
  {
    id: '4',
    name: 'David Chen',
    email: 'david.chen@northside.plainviewisd.edu',
    role: 'teacher',
    department: 'English Language Arts',
    subjects: ['English 9', 'Creative Writing'],
    hireDate: '2021-08-30',
    status: 'active',
    students_assigned: 22,
    classes_taught: 2,
    performance_rating: 4.4,
    last_login: '2024-01-14T16:20:00Z',
    phone: '(555) 456-7890',
    certifications: ['Secondary English', 'ESL Endorsement']
  },
  {
    id: '5',
    name: 'Emily Johnson',
    email: 'emily.johnson@westside.plainviewisd.edu',
    role: 'assistant_principal',
    department: 'Administration',
    hireDate: '2015-07-15',
    status: 'active',
    students_assigned: 0,
    classes_taught: 0,
    performance_rating: 4.9,
    last_login: '2024-01-15T08:30:00Z',
    phone: '(555) 567-8901',
    certifications: ['Principal Leadership', 'Educational Administration']
  },
  {
    id: '6',
    name: 'James Wilson',
    email: 'james.wilson@plainviewisd.edu',
    role: 'teacher',
    department: 'Physical Education',
    subjects: ['PE', 'Health'],
    hireDate: '2018-08-10',
    status: 'on_leave',
    students_assigned: 0,
    classes_taught: 0,
    performance_rating: 4.3,
    last_login: '2023-12-20T14:00:00Z',
    phone: '(555) 678-9012',
    certifications: ['Physical Education', 'CPR/First Aid']
  }
];

const mockDepartments: Department[] = [
  { id: '1', name: 'Elementary Mathematics', head: 'Jenna Grain', staff_count: 8 },
  { id: '2', name: 'Science', head: 'Michael Rodriguez', staff_count: 12 },
  { id: '3', name: 'English Language Arts', head: 'David Chen', staff_count: 10 },
  { id: '4', name: 'Student Services', head: 'Sarah Thompson', staff_count: 6 },
  { id: '5', name: 'Administration', head: 'Emily Johnson', staff_count: 4 },
  { id: '6', name: 'Physical Education', head: 'James Wilson', staff_count: 5 }
];

export function PrincipalUserManagementPanel() {
  const [staff, setStaff] = useState<StaffMember[]>(mockStaffData);
  const [departments] = useState<Department[]>(mockDepartments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState<keyof StaffMember>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Hover state management
  const [hoveredRefreshBtn, setHoveredRefreshBtn] = useState(false);
  const [hoveredAddBtn, setHoveredAddBtn] = useState(false);
  const [hoveredDeptCard, setHoveredDeptCard] = useState<string | null>(null);
  const [hoveredFilterBtn, setHoveredFilterBtn] = useState(false);
  const [hoveredExportBtn, setHoveredExportBtn] = useState(false);
  const [hoveredTableHeader, setHoveredTableHeader] = useState<string | null>(null);
  const [hoveredTableRow, setHoveredTableRow] = useState<string | null>(null);
  const [hoveredActionBtn, setHoveredActionBtn] = useState<string | null>(null);

  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment;
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
    
    return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
  });

  const sortedStaff = [...filteredStaff].sort((a, b) => {
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

  const handleSort = (field: keyof StaffMember) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'on_leave':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'teacher':
        return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case 'counselor':
        return <Users className="w-4 h-4 text-green-600" />;
      case 'assistant_principal':
        return <Shield className="w-4 h-4 text-purple-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatLastLogin = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return 'Today';
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return `${Math.floor(diffInHours / 24)} days ago`;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--dashboard-text-primary)',
            lineHeight: 'var(--leading-tight)'
          }}>
            Staff Management
          </h2>
          <p style={{
            color: 'var(--dashboard-text-secondary)',
            marginTop: 'var(--space-1)',
            fontSize: 'var(--text-sm)'
          }}>
            Manage teachers, counselors, and support staff
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            onMouseEnter={() => setHoveredRefreshBtn(true)}
            onMouseLeave={() => setHoveredRefreshBtn(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              border: `1px solid var(--dashboard-border-primary)`,
              borderRadius: 'var(--radius-lg)',
              backgroundColor: hoveredRefreshBtn ? 'var(--dashboard-bg-hover)' : 'transparent',
              color: 'var(--dashboard-text-primary)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              transition: 'background-color 150ms ease'
            }}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onMouseEnter={() => setHoveredAddBtn(true)}
            onMouseLeave={() => setHoveredAddBtn(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: hoveredAddBtn ? '#2563eb' : '#3b82f6',
              color: 'white',
              borderRadius: 'var(--radius-lg)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              transition: 'background-color 150ms ease'
            }}
          >
            <UserPlus className="w-4 h-4" />
            Add Staff Member
          </button>
        </div>
      </div>

      {/* Department Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 'var(--space-4)'
      }}>
        {departments.map((dept) => (
          <div
            key={dept.id}
            onMouseEnter={() => setHoveredDeptCard(dept.id)}
            onMouseLeave={() => setHoveredDeptCard(null)}
            style={{
              backgroundColor: 'var(--dashboard-bg-elevated)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              border: `1px solid var(--dashboard-border-primary)`,
              cursor: 'pointer',
              transition: 'transform 150ms ease, box-shadow 150ms ease',
              transform: hoveredDeptCard === dept.id ? 'translateY(-2px)' : 'none',
              boxShadow: hoveredDeptCard === dept.id ? 'var(--shadow-md)' : 'none'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-2)'
            }}>
              <BookOpen className="w-5 h-5" style={{ color: '#3b82f6' }} />
              <span style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--dashboard-text-secondary)'
              }}>
                {dept.staff_count}
              </span>
            </div>
            <h3 style={{
              fontWeight: 'var(--font-medium)',
              color: 'var(--dashboard-text-primary)',
              fontSize: 'var(--text-sm)',
              marginBottom: 'var(--space-1)'
            }}>
              {dept.name}
            </h3>
            <p style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--dashboard-text-tertiary)'
            }}>
              Head: {dept.head}
            </p>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div style={{
        backgroundColor: 'var(--dashboard-bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        border: `1px solid var(--dashboard-border-primary)`,
        padding: 'var(--space-6)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ position: 'relative' }}>
              <Search
                className="h-4 w-4"
                style={{
                  position: 'absolute',
                  left: 'var(--space-3)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--dashboard-text-tertiary)'
                }}
              />
              <input
                type="text"
                placeholder="Search staff by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  paddingLeft: 'calc(var(--space-10))',
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  border: `1px solid var(--dashboard-border-primary)`,
                  borderRadius: 'var(--radius-lg)',
                  outline: 'none',
                  backgroundColor: 'var(--dashboard-bg-elevated)',
                  color: 'var(--dashboard-text-primary)',
                  fontSize: 'var(--text-sm)'
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              onMouseEnter={() => setHoveredFilterBtn(true)}
              onMouseLeave={() => setHoveredFilterBtn(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-4)',
                border: `1px solid var(--dashboard-border-primary)`,
                borderRadius: 'var(--radius-lg)',
                backgroundColor: hoveredFilterBtn ? 'var(--dashboard-bg-hover)' : 'transparent',
                color: 'var(--dashboard-text-primary)',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                transition: 'background-color 150ms ease'
              }}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button
              onMouseEnter={() => setHoveredExportBtn(true)}
              onMouseLeave={() => setHoveredExportBtn(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-4)',
                border: `1px solid var(--dashboard-border-primary)`,
                borderRadius: 'var(--radius-lg)',
                backgroundColor: hoveredExportBtn ? 'var(--dashboard-bg-hover)' : 'transparent',
                color: 'var(--dashboard-text-primary)',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                transition: 'background-color 150ms ease'
              }}
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div style={{
            marginTop: 'var(--space-4)',
            paddingTop: 'var(--space-4)',
            borderTop: `1px solid var(--dashboard-border-primary)`,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-4)'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--dashboard-text-primary)',
                marginBottom: 'var(--space-1)'
              }}>
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  border: `1px solid var(--dashboard-border-primary)`,
                  borderRadius: 'var(--radius-lg)',
                  outline: 'none',
                  backgroundColor: 'var(--dashboard-bg-elevated)',
                  color: 'var(--dashboard-text-primary)',
                  fontSize: 'var(--text-sm)'
                }}
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--dashboard-text-primary)',
                marginBottom: 'var(--space-1)'
              }}>
                Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  border: `1px solid var(--dashboard-border-primary)`,
                  borderRadius: 'var(--radius-lg)',
                  outline: 'none',
                  backgroundColor: 'var(--dashboard-bg-elevated)',
                  color: 'var(--dashboard-text-primary)',
                  fontSize: 'var(--text-sm)'
                }}
              >
                <option value="all">All Roles</option>
                <option value="teacher">Teachers</option>
                <option value="counselor">Counselors</option>
                <option value="assistant_principal">Assistant Principals</option>
                <option value="coordinator">Coordinators</option>
                <option value="staff">Support Staff</option>
              </select>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--dashboard-text-primary)',
                marginBottom: 'var(--space-1)'
              }}>
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  border: `1px solid var(--dashboard-border-primary)`,
                  borderRadius: 'var(--radius-lg)',
                  outline: 'none',
                  backgroundColor: 'var(--dashboard-bg-elevated)',
                  color: 'var(--dashboard-text-primary)',
                  fontSize: 'var(--text-sm)'
                }}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Staff Table */}
      <div style={{
        backgroundColor: 'var(--dashboard-bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        border: `1px solid var(--dashboard-border-primary)`,
        overflow: 'hidden'
      }}>
        <div style={{
          padding: 'var(--space-4) var(--space-6)',
          borderBottom: `1px solid var(--dashboard-border-primary)`
        }}>
          <h3 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--dashboard-text-primary)'
          }}>
            Staff Directory ({sortedStaff.length} members)
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--dashboard-bg-secondary)' }}>
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  onMouseEnter={() => setHoveredTableHeader('name')}
                  onMouseLeave={() => setHoveredTableHeader(null)}
                  style={{
                    padding: 'var(--space-3) var(--space-6)',
                    textAlign: 'left',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--dashboard-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    backgroundColor: hoveredTableHeader === 'name' ? 'var(--dashboard-bg-hover)' : 'transparent',
                    transition: 'background-color 150ms ease'
                  }}
                >
                  Staff Member
                </th>
                <th
                  onClick={() => handleSort('role')}
                  onMouseEnter={() => setHoveredTableHeader('role')}
                  onMouseLeave={() => setHoveredTableHeader(null)}
                  style={{
                    padding: 'var(--space-3) var(--space-6)',
                    textAlign: 'left',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--dashboard-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    backgroundColor: hoveredTableHeader === 'role' ? 'var(--dashboard-bg-hover)' : 'transparent',
                    transition: 'background-color 150ms ease'
                  }}
                >
                  Role & Department
                </th>
                <th
                  onClick={() => handleSort('students_assigned')}
                  onMouseEnter={() => setHoveredTableHeader('students')}
                  onMouseLeave={() => setHoveredTableHeader(null)}
                  style={{
                    padding: 'var(--space-3) var(--space-6)',
                    textAlign: 'left',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--dashboard-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    backgroundColor: hoveredTableHeader === 'students' ? 'var(--dashboard-bg-hover)' : 'transparent',
                    transition: 'background-color 150ms ease'
                  }}
                >
                  Students/Classes
                </th>
                <th
                  onClick={() => handleSort('performance_rating')}
                  onMouseEnter={() => setHoveredTableHeader('performance')}
                  onMouseLeave={() => setHoveredTableHeader(null)}
                  style={{
                    padding: 'var(--space-3) var(--space-6)',
                    textAlign: 'left',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--dashboard-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    backgroundColor: hoveredTableHeader === 'performance' ? 'var(--dashboard-bg-hover)' : 'transparent',
                    transition: 'background-color 150ms ease'
                  }}
                >
                  Performance
                </th>
                <th
                  onClick={() => handleSort('hireDate')}
                  onMouseEnter={() => setHoveredTableHeader('hireDate')}
                  onMouseLeave={() => setHoveredTableHeader(null)}
                  style={{
                    padding: 'var(--space-3) var(--space-6)',
                    textAlign: 'left',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--dashboard-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    backgroundColor: hoveredTableHeader === 'hireDate' ? 'var(--dashboard-bg-hover)' : 'transparent',
                    transition: 'background-color 150ms ease'
                  }}
                >
                  Hire Date
                </th>
                <th style={{
                  padding: 'var(--space-3) var(--space-6)',
                  textAlign: 'left',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--dashboard-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Status
                </th>
                <th style={{
                  padding: 'var(--space-3) var(--space-6)',
                  textAlign: 'left',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--dashboard-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Last Login
                </th>
                <th style={{
                  padding: 'var(--space-3) var(--space-6)',
                  textAlign: 'left',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--dashboard-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStaff.map((member) => (
                <tr
                  key={member.id}
                  onMouseEnter={() => setHoveredTableRow(member.id)}
                  onMouseLeave={() => setHoveredTableRow(null)}
                  style={{
                    backgroundColor: hoveredTableRow === member.id ? 'var(--dashboard-bg-hover)' : 'var(--dashboard-bg-elevated)',
                    borderBottom: `1px solid var(--dashboard-border-primary)`,
                    transition: 'background-color 150ms ease'
                  }}
                >
                  <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ flexShrink: 0, width: '40px', height: '40px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#dbeafe',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-medium)',
                            color: '#1d4ed8'
                          }}>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div style={{ marginLeft: 'var(--space-4)' }}>
                        <div style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-medium)',
                          color: 'var(--dashboard-text-primary)'
                        }}>
                          {member.name}
                        </div>
                        <div style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--dashboard-text-tertiary)'
                        }}>
                          {member.email}
                        </div>
                        {member.phone && (
                          <div style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--dashboard-text-tertiary)'
                          }}>
                            {member.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      marginBottom: 'var(--space-1)'
                    }}>
                      {getRoleIcon(member.role)}
                      <span style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--dashboard-text-primary)',
                        textTransform: 'capitalize'
                      }}>
                        {member.role.replace('_', ' ')}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--dashboard-text-tertiary)'
                    }}>
                      {member.department}
                    </div>
                    {member.subjects && member.subjects.length > 0 && (
                      <div style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--dashboard-text-tertiary)',
                        marginTop: 'var(--space-1)'
                      }}>
                        {member.subjects.join(', ')}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--dashboard-text-primary)'
                    }}>
                      {member.students_assigned > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-1)',
                          marginBottom: 'var(--space-1)'
                        }}>
                          <Users className="w-4 h-4" style={{ color: 'var(--dashboard-text-tertiary)' }} />
                          <span>{member.students_assigned} students</span>
                        </div>
                      )}
                      {member.classes_taught > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--space-1)'
                        }}>
                          <BookOpen className="w-4 h-4" style={{ color: 'var(--dashboard-text-tertiary)' }} />
                          <span>{member.classes_taught} classes</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)'
                    }}>
                      <Star className="w-4 h-4" style={{ color: '#facc15', fill: '#facc15' }} />
                      <span style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--dashboard-text-primary)'
                      }}>
                        {member.performance_rating.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td style={{
                    padding: 'var(--space-4) var(--space-6)',
                    whiteSpace: 'nowrap',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--dashboard-text-primary)'
                  }}>
                    {formatDate(member.hireDate)}
                  </td>
                  <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)'
                    }}>
                      {getStatusIcon(member.status)}
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: 'var(--space-1) var(--space-2)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-medium)',
                        backgroundColor: member.status === 'active'
                          ? '#22c55e'
                          : member.status === 'on_leave'
                          ? '#eab308'
                          : '#6b7280',
                        color: 'white'
                      }}>
                        {member.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-1)'
                    }}>
                      <Clock className="w-4 h-4" style={{ color: 'var(--dashboard-text-tertiary)' }} />
                      <span style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--dashboard-text-secondary)'
                      }}>
                        {formatLastLogin(member.last_login)}
                      </span>
                    </div>
                  </td>
                  <td style={{
                    padding: 'var(--space-4) var(--space-6)',
                    whiteSpace: 'nowrap',
                    textAlign: 'right',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)'
                    }}>
                      <button
                        onMouseEnter={() => setHoveredActionBtn(`${member.id}-mail`)}
                        onMouseLeave={() => setHoveredActionBtn(null)}
                        style={{
                          color: hoveredActionBtn === `${member.id}-mail` ? '#1d4ed8' : '#3b82f6',
                          padding: 'var(--space-1)',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          transition: 'color 150ms ease'
                        }}
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        onMouseEnter={() => setHoveredActionBtn(`${member.id}-edit`)}
                        onMouseLeave={() => setHoveredActionBtn(null)}
                        style={{
                          color: hoveredActionBtn === `${member.id}-edit` ? 'var(--dashboard-text-primary)' : 'var(--dashboard-text-secondary)',
                          padding: 'var(--space-1)',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          transition: 'color 150ms ease'
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onMouseEnter={() => setHoveredActionBtn(`${member.id}-more`)}
                        onMouseLeave={() => setHoveredActionBtn(null)}
                        style={{
                          color: hoveredActionBtn === `${member.id}-more` ? 'var(--dashboard-text-primary)' : 'var(--dashboard-text-secondary)',
                          padding: 'var(--space-1)',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          transition: 'color 150ms ease'
                        }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {sortedStaff.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-12) 0'
          }}>
            <Users
              className="h-12 w-12"
              style={{
                margin: '0 auto',
                color: 'var(--dashboard-text-tertiary)'
              }}
            />
            <h3 style={{
              marginTop: 'var(--space-2)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--dashboard-text-primary)'
            }}>
              No staff members found
            </h3>
            <p style={{
              marginTop: 'var(--space-1)',
              fontSize: 'var(--text-sm)',
              color: 'var(--dashboard-text-tertiary)'
            }}>
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}