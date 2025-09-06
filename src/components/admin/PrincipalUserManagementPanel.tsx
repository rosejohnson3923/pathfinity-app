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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage teachers, counselors, and support staff</p>
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
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <UserPlus className="w-4 h-4" />
            Add Staff Member
          </button>
        </div>
      </div>

      {/* Department Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {departments.map((dept) => (
          <div key={dept.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{dept.staff_count}</span>
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-1">{dept.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Head: {dept.head}</p>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search staff by name, email, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Staff Directory ({sortedStaff.length} members)
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('name')}
                >
                  Staff Member
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('role')}
                >
                  Role & Department
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('students_assigned')}
                >
                  Students/Classes
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('performance_rating')}
                >
                  Performance
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  onClick={() => handleSort('hireDate')}
                >
                  Hire Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedStaff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{member.email}</div>
                        {member.phone && (
                          <div className="text-xs text-gray-400">{member.phone}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 mb-1">
                      {getRoleIcon(member.role)}
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {member.role.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{member.department}</div>
                    {member.subjects && member.subjects.length > 0 && (
                      <div className="text-xs text-gray-400 mt-1">
                        {member.subjects.join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {member.students_assigned > 0 && (
                        <div className="flex items-center gap-1 mb-1">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{member.students_assigned} students</span>
                        </div>
                      )}
                      {member.classes_taught > 0 && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <span>{member.classes_taught} classes</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.performance_rating.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatDate(member.hireDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(member.status)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        member.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : member.status === 'on_leave'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatLastLogin(member.last_login)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-800 p-1">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-1">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-1">
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
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No staff members found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}