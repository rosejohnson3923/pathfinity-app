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

// Design System Imports
import '../../design-system/tokens/colors.css';
import '../../design-system/tokens/spacing.css';
import '../../design-system/tokens/borders.css';
import '../../design-system/tokens/typography.css';
import '../../design-system/tokens/shadows.css';
import '../../design-system/tokens/dashboard.css';

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
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--dashboard-bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)', backgroundColor: 'var(--dashboard-status-suspended-bg)', borderRadius: '9999px', marginBottom: 'var(--space-4)' }}>
            <Building style={{ height: '2rem', width: '2rem', color: 'var(--dashboard-status-suspended-text)' }} />
          </div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)', marginBottom: 'var(--space-2)' }}>Access Denied</h2>
          <p style={{ color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-6)' }}>
            You don't have permission to access the admin dashboard.
          </p>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: 'var(--space-2) var(--space-6)',
              backgroundColor: 'var(--blue-600)',
              color: 'white',
              borderRadius: 'var(--radius-lg)',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 200ms ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--blue-700)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--blue-600)';
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    }>
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--dashboard-bg-primary)', transition: 'background-color 200ms ease' }}>
        <Header 
          showBackButton={false} 
          onSearch={handleGlobalSearch}
          isSearchActive={activeTab === 'users' || activeTab === 'content'}
        />
      
      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--dashboard-text-secondary)' }}>
              {tenant?.subscription_tier === 'enterprise'
                ? 'Enterprise administration portal'
                : 'Organization administration portal'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <PermissionGate permission="users:create">
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  backgroundColor: 'var(--blue-600)',
                  color: 'white',
                  borderRadius: 'var(--radius-lg)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  cursor: 'pointer',
                  transition: 'background-color 200ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--blue-700)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--blue-600)';
                }}
              >
                <UserPlus style={{ height: '1rem', width: '1rem' }} />
                <span>Add User</span>
              </button>
            </PermissionGate>
            <PermissionGate permission="users:create">
              <button
                onClick={() => handleBulkOperation('invite', [], [])}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  backgroundColor: 'var(--green-600)',
                  color: 'white',
                  borderRadius: 'var(--radius-lg)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  cursor: 'pointer',
                  transition: 'background-color 200ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--green-700)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--green-600)';
                }}
              >
                <Mail style={{ height: '1rem', width: '1rem' }} />
                <span>Bulk Invite</span>
              </button>
            </PermissionGate>
            <button
              onClick={() => navigate('/app/admin-controls')}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                backgroundColor: 'var(--dashboard-bg-elevated)',
                color: 'var(--dashboard-text-primary)',
                border: '1px solid var(--dashboard-border-strong)',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                transition: 'background-color 200ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--dashboard-bg-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--dashboard-bg-elevated)';
              }}
              title="Admin Controls"
            >
              <Settings style={{ height: '1.25rem', width: '1.25rem' }} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid var(--dashboard-border)', marginBottom: 'var(--space-6)' }}>
          <nav style={{ display: 'flex', gap: 'var(--space-8)', overflowX: 'auto' }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                padding: 'var(--space-4) var(--space-1)',
                borderBottom: activeTab === 'overview' ? '2px solid var(--dashboard-nav-tab-active)' : '2px solid transparent',
                fontWeight: 'var(--font-medium)',
                fontSize: 'var(--text-sm)',
                whiteSpace: 'nowrap',
                color: activeTab === 'overview' ? 'var(--dashboard-nav-tab-active)' : 'var(--dashboard-nav-tab-inactive)',
                background: 'none',
                cursor: 'pointer',
                transition: 'color 200ms ease, border-color 200ms ease'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'overview') {
                  e.currentTarget.style.color = 'var(--dashboard-nav-tab-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'overview') {
                  e.currentTarget.style.color = 'var(--dashboard-nav-tab-inactive)';
                }
              }}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {activeTab === 'overview' && (
            <>
              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-6)' }}>
                <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--dashboard-shadow-card)', padding: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <div style={{ padding: 'var(--space-3)', backgroundColor: '#DBEAFE', borderRadius: 'var(--radius-lg)' }}>
                    <Users style={{ height: '1.5rem', width: '1.5rem', color: '#2563EB' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-tertiary)' }}>Total Users</p>
                    <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>1,248</p>
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--dashboard-shadow-card)', padding: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <div style={{ padding: 'var(--space-3)', backgroundColor: '#D1FAE5', borderRadius: 'var(--radius-lg)' }}>
                    <UserCheck style={{ height: '1.5rem', width: '1.5rem', color: '#059669' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-tertiary)' }}>Active Users</p>
                    <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>1,156</p>
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--dashboard-shadow-card)', padding: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <div style={{ padding: 'var(--space-3)', backgroundColor: '#F3E8FF', borderRadius: 'var(--radius-lg)' }}>
                    <Database style={{ height: '1.5rem', width: '1.5rem', color: '#7C3AED' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-tertiary)' }}>Storage Used</p>
                    <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>24.5 GB</p>
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--dashboard-shadow-card)', padding: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <div style={{ padding: 'var(--space-3)', backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-lg)' }}>
                    <Clock style={{ height: '1.5rem', width: '1.5rem', color: '#D97706' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-tertiary)' }}>Uptime</p>
                    <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>99.9%</p>
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
              <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--dashboard-shadow-card)' }}>
                <div style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--dashboard-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Recent System Activity</h3>
                  <button style={{ fontSize: 'var(--text-sm)', color: 'var(--blue-600)', cursor: 'pointer' }}>
                    View All
                  </button>
                </div>
                <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-4)' }}>
                    <div style={{ padding: 'var(--space-2)', backgroundColor: '#DBEAFE', borderRadius: 'var(--radius-lg)' }}>
                      <UserPlus style={{ height: '1.25rem', width: '1.25rem', color: '#2563EB' }} />
                    </div>
                    <div style={{ flex: '1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>New User Created</p>
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-tertiary)' }}>2 hours ago</span>
                      </div>
                      <p style={{ color: 'var(--dashboard-text-secondary)', fontSize: 'var(--text-sm)' }}>Admin user created a new student account for "Jamie Smith"</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-4)' }}>
                    <div style={{ padding: 'var(--space-2)', backgroundColor: '#D1FAE5', borderRadius: 'var(--radius-lg)' }}>
                      <Settings style={{ height: '1.25rem', width: '1.25rem', color: '#059669' }} />
                    </div>
                    <div style={{ flex: '1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>System Settings Updated</p>
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-tertiary)' }}>5 hours ago</span>
                      </div>
                      <p style={{ color: 'var(--dashboard-text-secondary)', fontSize: 'var(--text-sm)' }}>Email notification settings were updated</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-4)' }}>
                    <div style={{ padding: 'var(--space-2)', backgroundColor: '#F3E8FF', borderRadius: 'var(--radius-lg)' }}>
                      <Database style={{ height: '1.25rem', width: '1.25rem', color: '#7C3AED' }} />
                    </div>
                    <div style={{ flex: '1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <p style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Database Backup</p>
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-tertiary)' }}>Yesterday</span>
                      </div>
                      <p style={{ color: 'var(--dashboard-text-secondary)', fontSize: 'var(--text-sm)' }}>Automatic database backup completed successfully</p>
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
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Access Restricted</h3>
                  <p style={{ color: 'var(--dashboard-text-tertiary)' }}>You don't have permission to view user management.</p>
                </div>
              }
            >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              {/* Search and Filter Bar */}
              <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--dashboard-shadow-card)', padding: 'var(--space-6)' }}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div style={{ flex: '1' }}>
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
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Access Restricted</h3>
                  <p style={{ color: 'var(--dashboard-text-tertiary)' }}>You don't have permission to view the content library.</p>
                </div>
              }
            >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              {/* Content Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-6)' }}>
                <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--dashboard-shadow-card)', padding: 'var(--space-6)' }}>
                  <div className="flex items-center">
                    <div style={{ padding: 'var(--space-3)', backgroundColor: '#DBEAFE', borderRadius: 'var(--radius-lg)' }}>
                      <Database style={{ height: '1.5rem', width: '1.5rem', color: '#2563EB' }} />
                    </div>
                    <div className="ml-4">
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-tertiary)' }}>Total Content</p>
                      <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>{contentStats.totalContent}</p>
                    </div>
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--dashboard-shadow-card)', padding: 'var(--space-6)' }}>
                  <div className="flex items-center">
                    <div style={{ padding: 'var(--space-3)', backgroundColor: '#D1FAE5', borderRadius: 'var(--radius-lg)' }}>
                      <TrendingUp style={{ height: '1.5rem', width: '1.5rem', color: '#059669' }} />
                    </div>
                    <div className="ml-4">
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-tertiary)' }}>Published</p>
                      <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>{contentStats.publishedContent}</p>
                    </div>
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--dashboard-shadow-card)', padding: 'var(--space-6)' }}>
                  <div className="flex items-center">
                    <div style={{ padding: 'var(--space-3)', backgroundColor: '#F3E8FF', borderRadius: 'var(--radius-lg)' }}>
                      <Users style={{ height: '1.5rem', width: '1.5rem', color: '#7C3AED' }} />
                    </div>
                    <div className="ml-4">
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-tertiary)' }}>Shared Content</p>
                      <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>{contentStats.sharedContent}</p>
                    </div>
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--dashboard-shadow-card)', padding: 'var(--space-6)' }}>
                  <div className="flex items-center">
                    <div style={{ padding: 'var(--space-3)', backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-lg)' }}>
                      <Clock style={{ height: '1.5rem', width: '1.5rem', color: '#D97706' }} />
                    </div>
                    <div className="ml-4">
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-tertiary)' }}>Draft Content</p>
                      <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>{contentStats.draftContent}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Actions Bar */}
              <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--dashboard-shadow-card)', padding: 'var(--space-6)' }}>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div style={{ flex: '1' }}>
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