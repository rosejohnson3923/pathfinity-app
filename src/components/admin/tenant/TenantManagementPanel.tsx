import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Users,
  Server,
  TrendingUp,
  AlertCircle,
  Lock
} from 'lucide-react';
import { useTenantManagement } from '../../../hooks/useTenantManagement';
import { AddTenantModal } from './AddTenantModal';
import { TenantTable } from './TenantTable';
import { 
  Tenant, 
  TenantFormData, 
  TenantFilters, 
  TenantStatus, 
  SubscriptionTier,
  TENANT_STATUS_LABELS,
  SUBSCRIPTION_TIER_LABELS,
  REGIONS
} from '../../../types/tenant';
import { AdminOnly } from '../../auth/PermissionGate';

interface TenantManagementPanelProps {
  className?: string;
}

export function TenantManagementPanel({ className = '' }: TenantManagementPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const {
    tenants,
    searchParams,
    totalTenants,
    totalPages,
    loading,
    error,
    setSearchParams,
    createTenant,
    updateTenant,
    deleteTenant,
    suspendTenant,
    activateTenant,
    searchTenants,
    applyFilters,
    clearFilters,
    refreshData
  } = useTenantManagement();

  // Calculate summary statistics
  const summaryStats = {
    total: totalTenants,
    active: tenants.filter(t => t.status === 'active').length,
    suspended: tenants.filter(t => t.status === 'suspended').length,
    pending: tenants.filter(t => t.status === 'pending').length
  };

  const handleCreateTenant = async (tenantData: TenantFormData) => {
    try {
      await createTenant(tenantData);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to create tenant:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchTenants(query);
  };

  const handleEditTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    // In a real app, this would open an edit modal
    console.log('Edit tenant:', tenant);
  };

  const handleViewTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    // In a real app, this would open a tenant details modal
    console.log('View tenant:', tenant);
  };

  const handleDeleteTenant = async (tenantId: string) => {
    try {
      await deleteTenant(tenantId);
    } catch (error) {
      console.error('Failed to delete tenant:', error);
    }
  };

  const handleSuspendTenant = async (tenantId: string) => {
    try {
      await suspendTenant(tenantId, 'Administrative action');
    } catch (error) {
      console.error('Failed to suspend tenant:', error);
    }
  };

  const handleActivateTenant = async (tenantId: string) => {
    try {
      await activateTenant(tenantId);
    } catch (error) {
      console.error('Failed to activate tenant:', error);
    }
  };

  const handleApplyFilters = (filters: TenantFilters) => {
    applyFilters(filters);
    setShowFilters(false);
  };

  const handlePageChange = (page: number) => {
    setSearchParams({ page });
  };

  const handleItemsPerPageChange = (limit: number) => {
    setSearchParams({ limit, page: 1 });
  };

  return (
    <AdminOnly fallback={
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Enterprise Access Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Tenant management is only available for enterprise administrators.
          </p>
        </div>
      </div>
    }>
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Tenant Management
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage organizations and their platform access
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => refreshData()}
                disabled={loading}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Tenant</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-800 dark:text-red-200">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tenants</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summaryStats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summaryStats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Server className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summaryStats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suspended</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summaryStats.suspended}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tenants by name, domain, or email..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 border rounded-lg flex items-center space-x-2 transition-colors ${
                  showFilters || (searchParams.filters && Object.keys(searchParams.filters).length > 0)
                    ? 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    multiple
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    size={4}
                  >
                    {Object.entries(TENANT_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subscription Tier
                  </label>
                  <select
                    multiple
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    size={3}
                  >
                    {Object.entries(SUBSCRIPTION_TIER_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Region
                  </label>
                  <select
                    multiple
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    size={4}
                  >
                    {REGIONS.map((region) => (
                      <option key={region.code} value={region.code}>
                        {region.flag} {region.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => {
                    clearFilters();
                    setShowFilters(false);
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => handleApplyFilters({})} // In real app, collect filter values
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tenant Table */}
        <TenantTable
          tenants={tenants}
          searchParams={searchParams}
          onSearchParamsChange={setSearchParams}
          onEditTenant={handleEditTenant}
          onDeleteTenant={handleDeleteTenant}
          onSuspendTenant={handleSuspendTenant}
          onActivateTenant={handleActivateTenant}
          onViewTenant={handleViewTenant}
          loading={loading}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {((searchParams.page - 1) * searchParams.limit) + 1} to {Math.min(searchParams.page * searchParams.limit, totalTenants)} of {totalTenants} results
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(searchParams.page - 1)}
                  disabled={searchParams.page === 1}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          searchParams.page === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(searchParams.page + 1)}
                  disabled={searchParams.page === totalPages}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Tenant Modal */}
        <AddTenantModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleCreateTenant}
          isLoading={loading}
        />
      </div>
    </AdminOnly>
  );
}