import { useState, useEffect, useCallback } from 'react';
import { User, UserFormData, UserSearchParams, UserFilters } from '../types/user';

// Mock data for development
const MOCK_USERS: User[] = [
  {
    id: '1',
    firstName: 'Brenda',
    lastName: 'Sea',
    email: 'brenda.sea@oceanview.plainviewisd.edu',
    role: 'teacher',
    status: 'active',
    avatar: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    subject: 'Science',
    grade: '7th Grade',
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z'
  },
  {
    id: '2',
    firstName: 'Jordan',
    lastName: 'Smith',
    email: 'jordan.smith@oceanview.plainviewisd.edu',
    role: 'student',
    status: 'active',
    avatar: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    grade: '7th Grade',
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    createdAt: '2024-01-10T14:30:00Z',
    updatedAt: '2024-01-10T14:30:00Z'
  },
  {
    id: '3',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@oceanview.plainviewisd.edu',
    role: 'staff',
    status: 'active',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
    department: 'IT Support',
    lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    createdAt: '2024-01-08T11:00:00Z',
    updatedAt: '2024-01-08T11:00:00Z'
  },
  {
    id: '4',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@oceanview.plainviewisd.edu',
    role: 'teacher',
    status: 'active',
    subject: 'Mathematics',
    grade: '8th Grade',
    lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-01-05T08:00:00Z'
  },
  {
    id: '5',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@oceanview.plainviewisd.edu',
    role: 'student',
    status: 'active',
    grade: '8th Grade',
    lastActive: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    createdAt: '2024-01-03T16:45:00Z',
    updatedAt: '2024-01-03T16:45:00Z'
  },
  {
    id: '6',
    firstName: 'Robert',
    lastName: 'Martinez',
    email: 'robert.martinez@oceanview.plainviewisd.edu',
    role: 'admin',
    status: 'active',
    department: 'Administration',
    lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  },
  {
    id: '7',
    firstName: 'Lisa',
    lastName: 'Wilson',
    email: 'lisa.wilson@oceanview.plainviewisd.edu',
    role: 'teacher',
    status: 'suspended',
    subject: 'English Language Arts',
    grade: '7th Grade',
    lastActive: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    createdAt: '2023-12-20T13:00:00Z',
    updatedAt: '2023-12-20T13:00:00Z'
  },
  {
    id: '8',
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@oceanview.plainviewisd.edu',
    role: 'student',
    status: 'pending',
    grade: '6th Grade',
    createdAt: '2024-01-20T12:00:00Z',
    updatedAt: '2024-01-20T12:00:00Z'
  }
];

interface UseUserManagementResult {
  users: User[];
  searchParams: UserSearchParams;
  totalUsers: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  setSearchParams: (params: UserSearchParams) => void;
  createUser: (userData: UserFormData) => Promise<User>;
  updateUser: (userId: string, userData: Partial<UserFormData>) => Promise<User>;
  deleteUser: (userId: string) => Promise<void>;
  toggleUserStatus: (userId: string, newStatus: 'active' | 'suspended') => Promise<void>;
  searchUsers: (query: string) => void;
  applyFilters: (filters: UserFilters) => void;
  clearFilters: () => void;
}

export function useUserManagement(): UseUserManagementResult {
  const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(MOCK_USERS);
  const [searchParams, setSearchParamsState] = useState<UserSearchParams>({
    query: '',
    filters: {},
    page: 1,
    limit: 25,
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter and sort users based on search parameters
  const filterAndSortUsers = useCallback((users: User[], params: UserSearchParams) => {
    let filtered = [...users];

    // Apply text search
    if (params.query) {
      const query = params.query.toLowerCase();
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        user.grade?.toLowerCase().includes(query) ||
        user.subject?.toLowerCase().includes(query) ||
        user.department?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (params.filters) {
      const { role, status, grade, subject } = params.filters;
      
      if (role) {
        filtered = filtered.filter(user => user.role === role);
      }
      
      if (status) {
        filtered = filtered.filter(user => user.status === status);
      }
      
      if (grade) {
        filtered = filtered.filter(user => user.grade === grade);
      }
      
      if (subject) {
        filtered = filtered.filter(user => user.subject === subject);
      }
    }

    // Apply sorting
    if (params.sortBy) {
      filtered.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (params.sortBy) {
          case 'name':
            aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
            bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
            break;
          case 'email':
            aValue = a.email.toLowerCase();
            bValue = b.email.toLowerCase();
            break;
          case 'role':
            aValue = a.role.toLowerCase();
            bValue = b.role.toLowerCase();
            break;
          case 'lastActive':
            aValue = new Date(a.lastActive || 0).getTime();
            bValue = new Date(b.lastActive || 0).getTime();
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          default:
            aValue = a.firstName.toLowerCase();
            bValue = b.firstName.toLowerCase();
        }

        if (aValue < bValue) return params.sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return params.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, []);

  // Update filtered users when search parameters or all users change
  useEffect(() => {
    const filtered = filterAndSortUsers(allUsers, searchParams);
    setFilteredUsers(filtered);
  }, [allUsers, searchParams, filterAndSortUsers]);

  // Paginate filtered users
  const paginatedUsers = filteredUsers.slice(
    ((searchParams.page || 1) - 1) * (searchParams.limit || 25),
    (searchParams.page || 1) * (searchParams.limit || 25)
  );

  const totalPages = Math.ceil(filteredUsers.length / (searchParams.limit || 25));

  const setSearchParams = useCallback((params: UserSearchParams) => {
    setSearchParamsState(params);
  }, []);

  const createUser = useCallback(async (userData: UserFormData): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        ...userData,
        status: 'active',
        avatar: `https://ui-avatars.com/api/?name=${userData.firstName}+${userData.lastName}&background=random`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setAllUsers(prev => [newUser, ...prev]);
      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (userId: string, userData: Partial<UserFormData>): Promise<User> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedUser = allUsers.find(user => user.id === userId);
      if (!updatedUser) {
        throw new Error('User not found');
      }

      const newUser: User = {
        ...updatedUser,
        ...userData,
        updatedAt: new Date().toISOString()
      };

      setAllUsers(prev => prev.map(user => user.id === userId ? newUser : user));
      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [allUsers]);

  const deleteUser = useCallback(async (userId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAllUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleUserStatus = useCallback(async (userId: string, newStatus: 'active' | 'suspended'): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setAllUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, status: newStatus, updatedAt: new Date().toISOString() }
          : user
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user status';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchUsers = useCallback((query: string) => {
    setSearchParams({
      ...searchParams,
      query,
      page: 1 // Reset to first page when searching
    });
  }, [searchParams, setSearchParams]);

  const applyFilters = useCallback((filters: UserFilters) => {
    setSearchParams({
      ...searchParams,
      filters,
      page: 1 // Reset to first page when filtering
    });
  }, [searchParams, setSearchParams]);

  const clearFilters = useCallback(() => {
    setSearchParams({
      ...searchParams,
      query: '',
      filters: {},
      page: 1
    });
  }, [searchParams, setSearchParams]);

  return {
    users: paginatedUsers,
    searchParams,
    totalUsers: filteredUsers.length,
    totalPages,
    loading,
    error,
    setSearchParams,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    searchUsers,
    applyFilters,
    clearFilters
  };
}