import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header';
import { SubscriptionInfo } from '../subscription/SubscriptionInfo';
import { FeatureAvailability } from '../subscription/FeatureAvailability'; 
import { AddUserModal } from '../admin/AddUserModal';
import { UserFilters } from '../admin/UserFilters';
import { UserTable } from '../admin/UserTable';
import { UserPagination } from '../admin/UserPagination';
import { AddContentModal } from '../admin/content/AddContentModal';
import { ContentFilters } from '../admin/content/ContentFilters';
import { ContentGrid } from '../admin/content/ContentGrid';
import { ReportsPanel } from '../admin/analytics/ReportsPanel';
import { BulkOperationModal } from '../admin/bulk/BulkOperationModal';
import { BulkOperationProgress } from '../admin/bulk/BulkOperationProgress';
import { AuditLogPanel } from '../admin/audit/AuditLogPanel';
import { TeacherAnalyticsPanel } from '../admin/analytics/TeacherAnalyticsPanel';
import { SubscriptionPanel } from '../admin/SubscriptionPanel';
import { DistrictAnalyticsPanel } from '../admin/district/DistrictAnalyticsPanel';
import { DistrictReportsPanel } from '../admin/district/DistrictReportsPanel';
import { useBulkOperations } from '../../hooks/useBulkOperations';
import { BulkOperation, BulkOperationRequest } from '../../types/bulkOperations';
import { useSubscription } from '../../hooks/useSubscription'; 
import { useAuthContext } from '../../contexts/AuthContext';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useContentManagement } from '../../hooks/useContentManagement';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionGate, AdminOnly, UserManagerOnly, ContentManagerOnly } from '../auth/PermissionGate';
import { User, UserFormData, UserFilters as UserFiltersType } from '../../types/user';
import { ContentItem, ContentFormData, ContentFilters as ContentFiltersType } from '../../types/content';
import {
  Users,
  Building,
  Settings,
  BarChart2,
  Shield,
  Database,
  Server,
  Globe,
  UserPlus,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  UserCheck,
  Clock,
  Mail
} from 'lucide-react';

export function AdminDashboard() {
  const { user, tenant } = useAuthContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { 
    tier, 
    usersCount, 
    storageUsed, 
    renewalDate, 
    upgradeSubscription 
  } = useSubscription();

  // User management
  const {
    users,
    searchParams,
    totalUsers,
    totalPages,
    loading: userLoading,
    error: userError,
    setSearchParams,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    searchUsers,
    applyFilters,
    clearFilters
  } = useUserManagement();

  // Content management
  const {
    content,
    searchParams: contentSearchParams,
    totalContent,
    totalPages: contentTotalPages,
    stats: contentStats,
    loading: contentLoading,
    error: contentError,
    setSearchParams: setContentSearchParams,
    createContent,
    updateContent,
    deleteContent,
    toggleContentStatus,
    searchContent,
    applyFilters: applyContentFilters,
    clearFilters: clearContentFilters
  } = useContentManagement();

  // Bulk operations
  const {
    activeJobs,
    completedOperations,
    loading: bulkLoading,
    error: bulkError,
    executeBulkOperation,
    cancelBulkOperation,
    clearCompletedOperations,
    downloadExportFile
  } = useBulkOperations();

  const isProductAdmin = true; // In a real app, this would come from the user's role
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Bulk operations state
  const [bulkOperationModal, setBulkOperationModal] = useState<{
    isOpen: boolean;
    operation: BulkOperation;
    selectedUserIds: string[];
    selectedUserEmails: string[];
  }>({
    isOpen: false,
    operation: 'suspend',
    selectedUserIds: [],
    selectedUserEmails: []
  });
  
  // Content management state
  const [contentSearchQuery, setContentSearchQuery] = useState('');
  const [isAddContentModalOpen, setIsAddContentModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);

  // User management event handlers
  const handleCreateUser = async (userData: UserFormData) => {
    try {
      await createUser(userData);
      setIsAddUserModalOpen(false);
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsAddUserModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleToggleUserStatus = async (userId: string, newStatus: 'active' | 'suspended') => {
    try {
      await toggleUserStatus(userId, newStatus);
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };

  const handleFiltersChange = (filters: UserFiltersType) => {
    applyFilters(filters);
  };

  const handlePageChange = (page: number) => {
    setSearchParams({ ...searchParams, page });
  };

  const handleItemsPerPageChange = (limit: number) => {
    setSearchParams({ ...searchParams, limit, page: 1 });
  };

  // Content management event handlers
  const handleCreateContent = async (contentData: ContentFormData) => {
    try {
      await createContent(contentData);
      setIsAddContentModalOpen(false);
    } catch (error) {
      console.error('Failed to create content:', error);
    }
  };

  const handleEditContent = (content: ContentItem) => {
    setEditingContent(content);
    setIsAddContentModalOpen(true);
  };

  const handleDeleteContent = async (contentId: string) => {
    if (window.confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      try {
        await deleteContent(contentId);
      } catch (error) {
        console.error('Failed to delete content:', error);
      }
    }
  };

  const handleToggleContentStatus = async (contentId: string, newStatus: 'published' | 'draft' | 'archived') => {
    try {
      await toggleContentStatus(contentId, newStatus);
    } catch (error) {
      console.error('Failed to update content status:', error);
    }
  };

  const handleViewContent = (content: ContentItem) => {
    // Open content in new tab or modal
    if (content.fileUrl) {
      window.open(content.fileUrl, '_blank');
    }
  };

  const handleContentSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setContentSearchQuery(query);
    searchContent(query);
  };

  const handleContentFiltersChange = (filters: ContentFiltersType) => {
    applyContentFilters(filters);
  };

  const handleContentPageChange = (page: number) => {
    setContentSearchParams({ ...contentSearchParams, page });
  };

  const handleContentItemsPerPageChange = (limit: number) => {
    setContentSearchParams({ ...contentSearchParams, limit, page: 1 });
  };

  // Bulk operations handlers
  const handleBulkOperation = (operation: BulkOperation, userIds: string[], userEmails: string[]) => {
    setBulkOperationModal({
      isOpen: true,
      operation,
      selectedUserIds: userIds,
      selectedUserEmails: userEmails
    });
  };

  const handleExecuteBulkOperation = async (request: BulkOperationRequest) => {
    try {
      await executeBulkOperation(request);
      setBulkOperationModal(prev => ({ ...prev, isOpen: false }));
    } catch (error) {
      console.error('Failed to execute bulk operation:', error);
    }
  };

  const handleCloseBulkModal = () => {
    setBulkOperationModal(prev => ({ ...prev, isOpen: false }));
  };

  // Global search handler for the header
  const handleGlobalSearch = (query: string) => {
    // Search based on the active tab
    if (activeTab === 'users') {
      setSearchQuery(query);
      searchUsers(query);
    } else if (activeTab === 'content') {
      setContentSearchQuery(query);
      searchContent(query);
    }
    // For other tabs, we could implement search functionality as needed
  };

  return (
    <AdminOnly fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-4 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
            <Building className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access the admin dashboard.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Header 
          showBackButton={false} 
          onSearch={handleGlobalSearch}
          isSearchActive={activeTab === 'users' || activeTab === 'content'}
        />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {tenant?.subscription_tier === 'enterprise' 
                ? 'Enterprise administration portal' 
                : 'Organization administration portal'}
            </p>
          </div>
          <div className="flex space-x-3">
            <PermissionGate permission="users:create">
              <button 
                onClick={() => setIsAddUserModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Add User</span>
              </button>
            </PermissionGate>
            <PermissionGate permission="users:create">
              <button 
                onClick={() => handleBulkOperation('invite', [], [])}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Mail className="h-4 w-4" />
                <span>Bulk Invite</span>
              </button>
            </PermissionGate>
            <button 
              onClick={() => navigate('/app/admin-controls')}
              className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Admin Controls"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Overview
            </button>
            <PermissionGate permission="users:read">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                User Management
              </button>
            </PermissionGate>
            <PermissionGate permission="content:read">
              <button
                onClick={() => setActiveTab('content')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'content'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Content Library
              </button>
            </PermissionGate>
            <PermissionGate permission="reports:view">
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'reports'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Reports & Analytics
              </button>
            </PermissionGate>
            <PermissionGate permission="reports:view">
              <button
                onClick={() => setActiveTab('teacher-analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'teacher-analytics'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Staff Analytics
              </button>
            </PermissionGate>
            <PermissionGate permission="settings:billing">
              <button
                onClick={() => setActiveTab('subscription')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'subscription'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Subscription
              </button>
            </PermissionGate>

            {/* District Admin Only Tabs */}
            {user?.role === 'district_admin' && (
              <>
                <button
                  onClick={() => setActiveTab('district-analytics')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'district-analytics'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  District Analytics
                </button>
                <button
                  onClick={() => setActiveTab('district-reports')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'district-reports'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  District Reports
                </button>
              </>
            )}
            <PermissionGate permission="audit:view">
              <button
                onClick={() => setActiveTab('audit')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'audit'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Audit Trail
              </button>
            </PermissionGate>
          </nav>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">1,248</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex items-center space-x-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">1,156</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Database className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Storage Used</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">24.5 GB</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex items-center space-x-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Uptime</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">99.9%</p>
                  </div>
                </div>
              </div>

              {/* Subscription Info Component */}
              <SubscriptionInfo
                tier={tier}
                usersCount={usersCount}
                storageUsed={storageUsed}
                renewalDate={renewalDate}
                onUpgrade={upgradeSubscription}
              />

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent System Activity</h3>
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                    View All
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium text-gray-900 dark:text-white">New User Created</p>
                        <span className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Admin user created a new student account for "Jamie Smith"</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Settings className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium text-gray-900 dark:text-white">System Settings Updated</p>
                        <span className="text-sm text-gray-500 dark:text-gray-400">5 hours ago</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Email notification settings were updated</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium text-gray-900 dark:text-white">Database Backup</p>
                        <span className="text-sm text-gray-500 dark:text-gray-400">Yesterday</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Automatic database backup completed successfully</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* User Management Tab */}
          {activeTab === 'users' && (
            <PermissionGate 
              permission="users:read" 
              showFallback={true}
              fallback={
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Access Restricted</h3>
                  <p className="text-gray-500 dark:text-gray-400">You don't have permission to view user management.</p>
                </div>
              }
            >
            <div className="space-y-6">
              {/* Search and Filter Bar */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users by name, email, or role..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <UserFilters
                      filters={searchParams.filters || {}}
                      onFiltersChange={handleFiltersChange}
                      onClearFilters={clearFilters}
                    />
                    <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {userError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200">{userError}</p>
                </div>
              )}

              {/* User Table */}
              <UserTable
                users={users}
                searchParams={searchParams}
                onSearchParamsChange={setSearchParams}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
                onToggleUserStatus={handleToggleUserStatus}
                onBulkOperation={handleBulkOperation}
                loading={userLoading}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <UserPagination
                  currentPage={searchParams.page || 1}
                  totalPages={totalPages}
                  totalItems={totalUsers}
                  itemsPerPage={searchParams.limit || 25}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              )}
            </div>
            </PermissionGate>
          )}

          {/* Content Library Tab */}
          {activeTab === 'content' && (
            <PermissionGate 
              permission="content:read" 
              showFallback={true}
              fallback={
                <div className="text-center py-12">
                  <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Access Restricted</h3>
                  <p className="text-gray-500 dark:text-gray-400">You don't have permission to view the content library.</p>
                </div>
              }
            >
            <div className="space-y-6">
              {/* Content Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Content</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{contentStats.totalContent}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{contentStats.publishedContent}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Shared Content</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{contentStats.sharedContent}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Draft Content</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{contentStats.draftContent}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Actions Bar */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search content by title, subject, or tags..."
                        value={contentSearchQuery}
                        onChange={handleContentSearchChange}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <ContentFilters
                      filters={contentSearchParams.filters || {}}
                      onFiltersChange={handleContentFiltersChange}
                      onClearFilters={clearContentFilters}
                    />
                    <PermissionGate permission="content:create">
                      <button 
                        onClick={() => setIsAddContentModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Content</span>
                      </button>
                    </PermissionGate>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {contentError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200">{contentError}</p>
                </div>
              )}

              {/* Content Grid */}
              <ContentGrid
                content={content}
                searchParams={contentSearchParams}
                onSearchParamsChange={setContentSearchParams}
                onEditContent={handleEditContent}
                onDeleteContent={handleDeleteContent}
                onToggleStatus={handleToggleContentStatus}
                onViewContent={handleViewContent}
                loading={contentLoading}
              />

              {/* Pagination */}
              {contentTotalPages > 1 && (
                <UserPagination
                  currentPage={contentSearchParams.page || 1}
                  totalPages={contentTotalPages}
                  totalItems={totalContent}
                  itemsPerPage={contentSearchParams.limit || 12}
                  onPageChange={handleContentPageChange}
                  onItemsPerPageChange={handleContentItemsPerPageChange}
                />
              )}
            </div>
            </PermissionGate>
          )}

          {/* Reports & Analytics Tab */}
          {activeTab === 'reports' && (
            <ReportsPanel />
          )}



          {/* Audit Trail Tab */}
          {activeTab === 'audit' && (
            <AuditLogPanel />
          )}

          {/* Teacher Analytics Tab */}
          {activeTab === 'teacher-analytics' && (
            <TeacherAnalyticsPanel />
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && (
            <SubscriptionPanel />
          )}


          {/* District Admin Only Tabs */}
          {user?.role === 'district_admin' && (
            <>
              {/* District Analytics Tab */}
              {activeTab === 'district-analytics' && (
                <DistrictAnalyticsPanel />
              )}


              {/* District Reports Tab */}
              {activeTab === 'district-reports' && (
                <DistrictReportsPanel />
              )}

            </>
          )}
        </div>
      </main>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => {
          setIsAddUserModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleCreateUser}
        isLoading={userLoading}
      />

      {/* Add Content Modal */}
      <AddContentModal
        isOpen={isAddContentModalOpen}
        onClose={() => {
          setIsAddContentModalOpen(false);
          setEditingContent(null);
        }}
        onSubmit={handleCreateContent}
        isLoading={contentLoading}
        editingContent={editingContent}
      />

      {/* Bulk Operation Modal */}
      <BulkOperationModal
        isOpen={bulkOperationModal.isOpen}
        onClose={handleCloseBulkModal}
        operation={bulkOperationModal.operation}
        selectedUserIds={bulkOperationModal.selectedUserIds}
        selectedUserEmails={bulkOperationModal.selectedUserEmails}
        onExecute={handleExecuteBulkOperation}
        isLoading={bulkLoading}
      />

      {/* Bulk Operation Progress */}
      <BulkOperationProgress
        jobs={activeJobs}
        completedOperations={completedOperations}
        onCancel={cancelBulkOperation}
        onDownload={downloadExportFile}
        onClear={clearCompletedOperations}
      />
      </div>
    </AdminOnly>
  );
}