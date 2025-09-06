import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '../Header';
import { SettingsPanel } from '../admin/SettingsPanel';
import { SecuritySettingsPanel } from '../admin/SecuritySettingsPanel';
import { TenantManagementPanel } from '../admin/tenant/TenantManagementPanel';
import { PrincipalUserManagementPanel } from '../admin/PrincipalUserManagementPanel';
import { DataManagementPanel } from '../admin/DataManagementPanel';
import { MultiSchoolManagementPanel } from '../admin/district/MultiSchoolManagementPanel';
import { DistrictBudgetPanel } from '../admin/district/DistrictBudgetPanel';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { PermissionGate } from '../auth/PermissionGate';
import {
  Settings,
  Shield,
  Building,
  Users,
  Server,
  Database,
  DollarSign
} from 'lucide-react';

export function AdminControls() {
  const { user } = useAuthContext();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('user-management');

  // Handle URL parameters to determine which tab to show
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {activeTab === 'system-settings' && 'System Settings'}
            {activeTab === 'security-settings' && 'Security Settings'}
            {(!activeTab || activeTab === 'user-management' || activeTab === 'data-management' || activeTab === 'tenant-management') && 'User Management'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {activeTab === 'system-settings' && 'Configure system-wide settings and preferences'}
            {activeTab === 'security-settings' && 'Manage security policies and access controls'}
            {(!activeTab || activeTab === 'user-management' || activeTab === 'data-management' || activeTab === 'tenant-management') && 'Manage users, data, and administrative controls'}
          </p>
        </div>

        {/* Main Content Container */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700">
          {/* Tab Navigation - Only show for User Management related pages */}
          {!(activeTab === 'system-settings' || activeTab === 'security-settings') && (
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto" aria-label="User management">
              
              {/* User Management Tab */}
              <PermissionGate permission="users:create">
                <button
                  onClick={() => setActiveTab('user-management')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                    activeTab === 'user-management'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>User Management</span>
                </button>
              </PermissionGate>

              {/* Data Management Tab */}
              <PermissionGate permission="data:management">
                <button
                  onClick={() => setActiveTab('data-management')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                    activeTab === 'data-management'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Database className="w-4 h-4" />
                  <span>Data Management</span>
                </button>
              </PermissionGate>

              {/* Tenant Management Tab */}
              <PermissionGate permission="admin:tenant_management">
                <button
                  onClick={() => setActiveTab('tenant-management')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                    activeTab === 'tenant-management'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Server className="w-4 h-4" />
                  <span>Tenant Management</span>
                </button>
              </PermissionGate>

              {/* District Admin Only Tabs */}
              {user?.role === 'district_admin' && (
                <>
                  <button
                    onClick={() => setActiveTab('school-management')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                      activeTab === 'school-management'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span>School Management</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('budget-management')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                      activeTab === 'budget-management'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Budget Management</span>
                  </button>
                </>
              )}
            </nav>
            </div>
          )}

          {/* Tab Content */}
          <div className="p-6">
            {/* System Settings - Direct page */}
            {activeTab === 'system-settings' && (
              <SettingsPanel />
            )}

            {/* Security Settings - Direct page */}
            {activeTab === 'security-settings' && (
              <SecuritySettingsPanel />
            )}

            {/* User Management Tab */}
            {(!activeTab || activeTab === 'user-management') && (
              <PrincipalUserManagementPanel />
            )}

            {/* Data Management Tab */}
            {activeTab === 'data-management' && (
              <DataManagementPanel />
            )}

            {/* Tenant Management Tab */}  
            {activeTab === 'tenant-management' && (
              <TenantManagementPanel />
            )}

            {/* District Controls - Only for District Admin */}
            {user?.role === 'district_admin' && (
              <>
                {/* School Management Tab */}
                {activeTab === 'school-management' && (
                  <MultiSchoolManagementPanel />
                )}

                {/* Budget Management Tab */}
                {activeTab === 'budget-management' && (
                  <DistrictBudgetPanel />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}