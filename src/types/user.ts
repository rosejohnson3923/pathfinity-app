export type UserRole = 'admin' | 'teacher' | 'student' | 'staff' | 'parent';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  grade?: string;
  subject?: string;
  department?: string;
  lastActive?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  grade?: string;
  subject?: string;
  department?: string;
}

export interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  grade?: string;
  subject?: string;
}

export interface UserSearchParams {
  query?: string;
  filters?: UserFilters;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'email' | 'role' | 'lastActive' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface UserManagementStats {
  totalUsers: number;
  activeUsers: number;
  teacherCount: number;
  studentCount: number;
  staffCount: number;
  pendingUsers: number;
}