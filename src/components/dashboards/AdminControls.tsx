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

// Import design system tokens
import '../../design-system/tokens/colors.css';
import '../../design-system/tokens/spacing.css';
import '../../design-system/tokens/borders.css';
import '../../design-system/tokens/typography.css';
import '../../design-system/tokens/shadows.css';
import '../../design-system/tokens/dashboard.css';

export function AdminControls() {
  const { user } = useAuthContext();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('user-management');
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  // Handle URL parameters to determine which tab to show
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--dashboard-bg-primary)'
    }}>
      <Header />
      <div style={{
        maxWidth: '80rem',
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 'var(--space-4)',
        paddingRight: 'var(--space-4)',
        paddingTop: 'var(--space-8)',
        paddingBottom: 'var(--space-8)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1 style={{
            fontSize: 'var(--text-3xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--dashboard-text-primary)'
          }}>
            {activeTab === 'system-settings' && 'System Settings'}
            {activeTab === 'security-settings' && 'Security Settings'}
            {(!activeTab || activeTab === 'user-management' || activeTab === 'data-management' || activeTab === 'tenant-management') && 'User Management'}
          </h1>
          <p style={{
            marginTop: 'var(--space-2)',
            color: 'var(--dashboard-text-secondary)'
          }}>
            {activeTab === 'system-settings' && 'Configure system-wide settings and preferences'}
            {activeTab === 'security-settings' && 'Manage security policies and access controls'}
            {(!activeTab || activeTab === 'user-management' || activeTab === 'data-management' || activeTab === 'tenant-management') && 'Manage users, data, and administrative controls'}
          </p>
        </div>

        {/* Main Content Container */}
        <div style={{
          background: 'var(--dashboard-bg-elevated)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--dashboard-shadow-card)',
          border: '1px solid var(--dashboard-border)'
        }}>
          {/* Tab Navigation - Only show for User Management related pages */}
          {!(activeTab === 'system-settings' || activeTab === 'security-settings') && (
            <div style={{
              borderBottom: '1px solid var(--dashboard-border)'
            }}>
              <nav
                style={{
                  marginBottom: '-1px',
                  display: 'flex',
                  gap: 'var(--space-8)',
                  paddingLeft: 'var(--space-6)',
                  paddingRight: 'var(--space-6)',
                  overflowX: 'auto'
                }}
                aria-label="User management"
              >

              {/* User Management Tab */}
              <PermissionGate permission="users:create">
                <button
                  onClick={() => setActiveTab('user-management')}
                  onMouseEnter={() => setHoveredTab('user-management')}
                  onMouseLeave={() => setHoveredTab(null)}
                  style={{
                    paddingTop: 'var(--space-4)',
                    paddingBottom: 'var(--space-4)',
                    paddingLeft: 'var(--space-1)',
                    paddingRight: 'var(--space-1)',
                    fontWeight: 'var(--font-medium)',
                    fontSize: 'var(--text-sm)',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    color: activeTab === 'user-management'
                      ? '#2563eb'
                      : hoveredTab === 'user-management'
                        ? 'var(--dashboard-nav-tab-hover)'
                        : 'var(--dashboard-text-secondary)',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === 'user-management' ? '2px solid #2563eb' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease'
                  }}
                >
                  <Users style={{ width: 'var(--space-4)', height: 'var(--space-4)' }} />
                  <span>User Management</span>
                </button>
              </PermissionGate>

              {/* Data Management Tab */}
              <PermissionGate permission="data:management">
                <button
                  onClick={() => setActiveTab('data-management')}
                  onMouseEnter={() => setHoveredTab('data-management')}
                  onMouseLeave={() => setHoveredTab(null)}
                  style={{
                    paddingTop: 'var(--space-4)',
                    paddingBottom: 'var(--space-4)',
                    paddingLeft: 'var(--space-1)',
                    paddingRight: 'var(--space-1)',
                    fontWeight: 'var(--font-medium)',
                    fontSize: 'var(--text-sm)',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    color: activeTab === 'data-management'
                      ? '#2563eb'
                      : hoveredTab === 'data-management'
                        ? 'var(--dashboard-nav-tab-hover)'
                        : 'var(--dashboard-text-secondary)',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === 'data-management' ? '2px solid #2563eb' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease'
                  }}
                >
                  <Database style={{ width: 'var(--space-4)', height: 'var(--space-4)' }} />
                  <span>Data Management</span>
                </button>
              </PermissionGate>

              {/* Tenant Management Tab */}
              <PermissionGate permission="admin:tenant_management">
                <button
                  onClick={() => setActiveTab('tenant-management')}
                  onMouseEnter={() => setHoveredTab('tenant-management')}
                  onMouseLeave={() => setHoveredTab(null)}
                  style={{
                    paddingTop: 'var(--space-4)',
                    paddingBottom: 'var(--space-4)',
                    paddingLeft: 'var(--space-1)',
                    paddingRight: 'var(--space-1)',
                    fontWeight: 'var(--font-medium)',
                    fontSize: 'var(--text-sm)',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    color: activeTab === 'tenant-management'
                      ? '#2563eb'
                      : hoveredTab === 'tenant-management'
                        ? 'var(--dashboard-nav-tab-hover)'
                        : 'var(--dashboard-text-secondary)',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === 'tenant-management' ? '2px solid #2563eb' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease'
                  }}
                >
                  <Server style={{ width: 'var(--space-4)', height: 'var(--space-4)' }} />
                  <span>Tenant Management</span>
                </button>
              </PermissionGate>

              {/* District Admin Only Tabs */}
              {user?.role === 'district_admin' && (
                <>
                  <button
                    onClick={() => setActiveTab('school-management')}
                    onMouseEnter={() => setHoveredTab('school-management')}
                    onMouseLeave={() => setHoveredTab(null)}
                    style={{
                      paddingTop: 'var(--space-4)',
                      paddingBottom: 'var(--space-4)',
                      paddingLeft: 'var(--space-1)',
                      paddingRight: 'var(--space-1)',
                      fontWeight: 'var(--font-medium)',
                      fontSize: 'var(--text-sm)',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      color: activeTab === 'school-management'
                        ? '#2563eb'
                        : hoveredTab === 'school-management'
                          ? 'var(--dashboard-nav-tab-hover)'
                          : 'var(--dashboard-text-secondary)',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: activeTab === 'school-management' ? '2px solid #2563eb' : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'color 0.2s ease'
                    }}
                  >
                    <Building style={{ width: 'var(--space-4)', height: 'var(--space-4)' }} />
                    <span>School Management</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('budget-management')}
                    onMouseEnter={() => setHoveredTab('budget-management')}
                    onMouseLeave={() => setHoveredTab(null)}
                    style={{
                      paddingTop: 'var(--space-4)',
                      paddingBottom: 'var(--space-4)',
                      paddingLeft: 'var(--space-1)',
                      paddingRight: 'var(--space-1)',
                      fontWeight: 'var(--font-medium)',
                      fontSize: 'var(--text-sm)',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      color: activeTab === 'budget-management'
                        ? '#2563eb'
                        : hoveredTab === 'budget-management'
                          ? 'var(--dashboard-nav-tab-hover)'
                          : 'var(--dashboard-text-secondary)',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: activeTab === 'budget-management' ? '2px solid #2563eb' : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'color 0.2s ease'
                    }}
                  >
                    <DollarSign style={{ width: 'var(--space-4)', height: 'var(--space-4)' }} />
                    <span>Budget Management</span>
                  </button>
                </>
              )}
            </nav>
            </div>
          )}

          {/* Tab Content */}
          <div style={{ padding: 'var(--space-6)' }}>
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