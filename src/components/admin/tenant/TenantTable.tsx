import React from 'react';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Pause, 
  Play, 
  TrendingUp,
  Users,
  HardDrive,
  Activity,
  ExternalLink,
  Settings
} from 'lucide-react';
import { Tenant, TenantSearchParams, getTenantStatusBadge, getTierBadge, formatBytes } from '../../../types/tenant';

interface TenantTableProps {
  tenants: Tenant[];
  searchParams: TenantSearchParams;
  onSearchParamsChange: (params: Partial<TenantSearchParams>) => void;
  onEditTenant: (tenant: Tenant) => void;
  onDeleteTenant: (tenantId: string) => void;
  onSuspendTenant: (tenantId: string) => void;
  onActivateTenant: (tenantId: string) => void;
  onViewTenant: (tenant: Tenant) => void;
  loading?: boolean;
}

export function TenantTable({
  tenants,
  searchParams,
  onSearchParamsChange,
  onEditTenant,
  onDeleteTenant,
  onSuspendTenant,
  onActivateTenant,
  onViewTenant,
  loading = false
}: TenantTableProps) {
  const [dropdownOpen, setDropdownOpen] = React.useState<string | null>(null);

  const handleSort = (field: keyof Tenant) => {
    const newSortOrder = searchParams.sortBy === field && searchParams.sortOrder === 'asc' ? 'desc' : 'asc';
    onSearchParamsChange({
      sortBy: field,
      sortOrder: newSortOrder
    });
  };

  const getSortIcon = (field: keyof Tenant) => {
    if (searchParams.sortBy !== field) return null;
    return searchParams.sortOrder === 'asc' ? '↑' : '↓';
  };

  const handleAction = (action: string, tenant: Tenant) => {
    setDropdownOpen(null);
    
    switch (action) {
      case 'view':
        onViewTenant(tenant);
        break;
      case 'edit':
        onEditTenant(tenant);
        break;
      case 'suspend':
        if (window.confirm(`Are you sure you want to suspend ${tenant.name}? This will prevent all users from accessing the platform.`)) {
          onSuspendTenant(tenant.id);
        }
        break;
      case 'activate':
        onActivateTenant(tenant.id);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${tenant.name}? This action cannot be undone and will permanently remove all data.`)) {
          onDeleteTenant(tenant.id);
        }
        break;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Loading tenants...</p>
        </div>
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700">
        <div className="p-8 text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tenants found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchParams.filters?.search ? 'Try adjusting your search criteria.' : 'Create your first tenant to get started.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Organization</span>
                  <span className="text-gray-400">{getSortIcon('name')}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <span className="text-gray-400">{getSortIcon('status')}</span>
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => handleSort('tier')}
              >
                <div className="flex items-center space-x-1">
                  <span>Plan</span>
                  <span className="text-gray-400">{getSortIcon('tier')}</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Usage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Users
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center space-x-1">
                  <span>Created</span>
                  <span className="text-gray-400">{getSortIcon('createdAt')}</span>
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {tenants.map((tenant) => {
              const statusBadge = getTenantStatusBadge(tenant.status);
              const tierBadge = getTierBadge(tenant.tier);
              
              return (
                <tr key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {tenant.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {tenant.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                          <span>{tenant.domain}</span>
                          <ExternalLink className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={statusBadge.className}>
                      {statusBadge.label}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={tierBadge.className}>
                      {tierBadge.label}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <HardDrive className="h-3 w-3 text-gray-400" />
                        <div className="flex items-center space-x-1">
                          <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ width: `${Math.min(tenant.usage.storage.percentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {Math.round(tenant.usage.storage.percentage)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Activity className="h-3 w-3 text-gray-400" />
                        <div className="flex items-center space-x-1">
                          <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                            <div 
                              className="bg-green-600 h-1.5 rounded-full" 
                              style={{ width: `${Math.min(tenant.usage.bandwidth.percentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {Math.round(tenant.usage.bandwidth.percentage)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {tenant.usage.users.total.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {tenant.usage.users.active} active
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(tenant.createdAt).toLocaleDateString()}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative">
                      <button
                        onClick={() => setDropdownOpen(dropdownOpen === tenant.id ? null : tenant.id)}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      
                      {dropdownOpen === tenant.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setDropdownOpen(null)}
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 border border-gray-200 dark:border-gray-700">
                            <div className="py-1">
                              <button
                                onClick={() => handleAction('view', tenant)}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Details
                              </button>
                              <button
                                onClick={() => handleAction('edit', tenant)}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </button>
                              {tenant.status === 'active' ? (
                                <button
                                  onClick={() => handleAction('suspend', tenant)}
                                  className="flex items-center px-4 py-2 text-sm text-yellow-700 dark:text-yellow-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                >
                                  <Pause className="h-4 w-4 mr-2" />
                                  Suspend
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleAction('activate', tenant)}
                                  className="flex items-center px-4 py-2 text-sm text-green-700 dark:text-green-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  Activate
                                </button>
                              )}
                              <div className="border-t border-gray-200 dark:border-gray-600"></div>
                              <button
                                onClick={() => handleAction('delete', tenant)}
                                className="flex items-center px-4 py-2 text-sm text-red-700 dark:text-red-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}