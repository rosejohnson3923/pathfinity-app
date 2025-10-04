import React, { useState } from 'react';
import { Edit, Trash2, UserCheck, UserX, Mail, Phone, ChevronUp, ChevronDown, MoreHorizontal, CheckSquare, Square } from 'lucide-react';
import { User, UserSearchParams } from '../../types/user';
import { BulkOperation } from '../../types/bulkOperations';
import '../../design-system/tokens/colors.css';
import '../../design-system/tokens/spacing.css';
import '../../design-system/tokens/borders.css';
import '../../design-system/tokens/typography.css';
import '../../design-system/tokens/shadows.css';
import '../../design-system/tokens/dashboard.css';

interface UserTableProps {
  users: User[];
  searchParams: UserSearchParams;
  onSearchParamsChange: (params: UserSearchParams) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onToggleUserStatus: (userId: string, newStatus: 'active' | 'suspended') => void;
  onBulkOperation?: (operation: BulkOperation, userIds: string[], userEmails: string[]) => void;
  loading?: boolean;
}

const SORTABLE_COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'lastActive', label: 'Last Active' },
  { key: 'createdAt', label: 'Created' }
] as const;

type SortableColumn = typeof SORTABLE_COLUMNS[number]['key'];

export function UserTable({ 
  users, 
  searchParams, 
  onSearchParamsChange,
  onEditUser, 
  onDeleteUser, 
  onToggleUserStatus,
  onBulkOperation,
  loading = false 
}: UserTableProps) {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  const handleSort = (column: SortableColumn) => {
    const currentSort = searchParams.sortBy;
    const currentOrder = searchParams.sortOrder || 'asc';
    
    let newOrder: 'asc' | 'desc' = 'asc';
    if (currentSort === column && currentOrder === 'asc') {
      newOrder = 'desc';
    }

    onSearchParamsChange({
      ...searchParams,
      sortBy: column,
      sortOrder: newOrder
    });
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(users.map(user => user.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleBulkOperation = (operation: BulkOperation) => {
    if (!onBulkOperation || selectedUsers.size === 0) return;
    
    const selectedUserIds = Array.from(selectedUsers);
    const selectedUserEmails = users
      .filter(user => selectedUsers.has(user.id))
      .map(user => user.email);
    
    onBulkOperation(operation, selectedUserIds, selectedUserEmails);
    setSelectedUsers(new Set());
    setShowBulkActions(false);
  };

  const isAllSelected = users.length > 0 && selectedUsers.size === users.length;
  const isPartiallySelected = selectedUsers.size > 0 && selectedUsers.size < users.length;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'teacher':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'student':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'staff':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'parent':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatLastActive = (lastActive?: string) => {
    if (!lastActive) return 'Never';
    const date = new Date(lastActive);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const SortButton = ({ column, label }: { column: SortableColumn; label: string }) => {
    const isActive = searchParams.sortBy === column;
    const isAsc = searchParams.sortOrder === 'asc';
    const [isHovered, setIsHovered] = useState(false);

    return (
      <button
        onClick={() => handleSort(column)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          textAlign: 'left',
          fontWeight: 'var(--font-medium)',
          color: isHovered ? 'var(--dashboard-text-primary)' : 'var(--dashboard-text-secondary)',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0
        }}
      >
        <span>{label}</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <ChevronUp
            style={{
              height: '0.75rem',
              width: '0.75rem',
              color: isActive && isAsc ? '#2563EB' : 'var(--dashboard-border-secondary)'
            }}
          />
          <ChevronDown
            style={{
              height: '0.75rem',
              width: '0.75rem',
              marginTop: '-0.25rem',
              color: isActive && !isAsc ? '#2563EB' : 'var(--dashboard-border-secondary)'
            }}
          />
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'var(--dashboard-bg-elevated)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--dashboard-shadow-card)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p style={{ color: 'var(--dashboard-text-secondary)', marginTop: 'var(--space-4)' }}>Loading users...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div style={{
        backgroundColor: 'var(--dashboard-bg-elevated)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--dashboard-shadow-card)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
          <UserCheck style={{ height: '3rem', width: '3rem', color: 'var(--dashboard-text-tertiary)', margin: '0 auto var(--space-4)' }} />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>No users found</h3>
          <p style={{ color: 'var(--dashboard-text-secondary)' }}>Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--dashboard-bg-elevated)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--dashboard-shadow-card)',
      overflow: 'hidden'
    }}>
      <div style={{
        padding: 'var(--space-6)',
        borderBottom: '1px solid var(--dashboard-border-primary)'
      }}>
        <div className="flex justify-between items-center">
          <div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Users</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)', marginTop: 'var(--space-1)' }}>
              {users.length} user{users.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          {selectedUsers.size > 0 && onBulkOperation && (
            <div className="flex items-center space-x-3">
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>
                {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
              </span>

              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  style={{
                    padding: 'var(--space-2) var(--space-4)',
                    fontSize: 'var(--text-sm)',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                >
                  <span>Bulk Actions</span>
                  <ChevronDown style={{ height: '1rem', width: '1rem' }} />
                </button>
                
                {showBulkActions && (
                  <>
                    <div
                      style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                      onClick={() => setShowBulkActions(false)}
                    />
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      marginTop: 'var(--space-2)',
                      width: '12rem',
                      backgroundColor: 'var(--dashboard-bg-elevated)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-lg)',
                      border: '1px solid var(--dashboard-border-primary)',
                      zIndex: 20
                    }}>
                      <div style={{ padding: 'var(--space-1) 0' }}>
                        <button
                          onClick={() => handleBulkOperation('suspend')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: 'var(--space-2) var(--space-4)',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--dashboard-text-primary)',
                            width: '100%',
                            textAlign: 'left',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--dashboard-bg-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <UserX style={{ height: '1rem', width: '1rem', marginRight: 'var(--space-2)' }} />
                          Suspend Users
                        </button>
                        <button
                          onClick={() => handleBulkOperation('activate')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: 'var(--space-2) var(--space-4)',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--dashboard-text-primary)',
                            width: '100%',
                            textAlign: 'left',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--dashboard-bg-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <UserCheck style={{ height: '1rem', width: '1rem', marginRight: 'var(--space-2)' }} />
                          Activate Users
                        </button>
                        <button
                          onClick={() => handleBulkOperation('changeRole')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: 'var(--space-2) var(--space-4)',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--dashboard-text-primary)',
                            width: '100%',
                            textAlign: 'left',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--dashboard-bg-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Edit style={{ height: '1rem', width: '1rem', marginRight: 'var(--space-2)' }} />
                          Change Role
                        </button>
                        <button
                          onClick={() => handleBulkOperation('export')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: 'var(--space-2) var(--space-4)',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--dashboard-text-primary)',
                            width: '100%',
                            textAlign: 'left',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--dashboard-bg-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Mail style={{ height: '1rem', width: '1rem', marginRight: 'var(--space-2)' }} />
                          Export Selected
                        </button>
                        <div style={{ borderTop: '1px solid var(--dashboard-border-secondary)' }}></div>
                        <button
                          onClick={() => handleBulkOperation('delete')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: 'var(--space-2) var(--space-4)',
                            fontSize: 'var(--text-sm)',
                            color: '#DC2626',
                            width: '100%',
                            textAlign: 'left',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--dashboard-bg-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Trash2 style={{ height: '1rem', width: '1rem', marginRight: 'var(--space-2)' }} />
                          Delete Users
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => setSelectedUsers(new Set())}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--dashboard-text-secondary)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--dashboard-text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--dashboard-text-secondary)'}
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%' }}>
          <thead style={{ backgroundColor: 'var(--dashboard-bg-secondary)' }}>
            <tr>
              <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left' }}>
                <input
                  type="checkbox"
                  checked={selectedUsers.size === users.length && users.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <SortButton column="name" label="User" />
              </th>
              <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <SortButton column="role" label="Role" />
              </th>
              <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--dashboard-text-secondary)', fontWeight: 'var(--font-medium)' }}>
                Grade/Subject
              </th>
              <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <SortButton column="lastActive" label="Last Active" />
              </th>
              <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'left', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--dashboard-text-secondary)', fontWeight: 'var(--font-medium)' }}>
                Status
              </th>
              <th style={{ padding: 'var(--space-3) var(--space-6)', textAlign: 'right', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--dashboard-text-secondary)', fontWeight: 'var(--font-medium)' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody style={{ backgroundColor: 'var(--dashboard-bg-elevated)' }}>
            {users.map((user) => {
              const [isRowHovered, setIsRowHovered] = useState(false);
              return (
                <tr
                  key={user.id}
                  onMouseEnter={() => setIsRowHovered(true)}
                  onMouseLeave={() => setIsRowHovered(false)}
                  style={{
                    backgroundColor: isRowHovered ? 'var(--dashboard-bg-hover)' : 'transparent',
                    borderTop: '1px solid var(--dashboard-border-primary)'
                  }}
                >
                  <td style={{ padding: 'var(--space-4) var(--space-6)' }}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                    <div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="flex items-center" style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>
                        <Mail style={{ height: '0.75rem', width: '0.75rem', marginRight: 'var(--space-1)' }} />
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap', fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>
                    {user.role === 'student' && user.grade ? user.grade :
                     user.role === 'teacher' && user.subject ? user.subject :
                     user.department || '-'}
                  </td>
                  <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap', fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>
                    {formatLastActive(user.lastActive)}
                  </td>
                  <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap', textAlign: 'right' }}>
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onEditUser(user)}
                        style={{
                          color: '#2563EB',
                          padding: 'var(--space-1)',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#1D4ED8';
                          e.currentTarget.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#2563EB';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        title="Edit user"
                      >
                        <Edit style={{ height: '1rem', width: '1rem' }} />
                      </button>
                      <button
                        onClick={() => onToggleUserStatus(user.id, user.status === 'active' ? 'suspended' : 'active')}
                        style={{
                          color: user.status === 'active' ? '#DC2626' : '#16A34A',
                          padding: 'var(--space-1)',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          if (user.status === 'active') {
                            e.currentTarget.style.color = '#B91C1C';
                            e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
                          } else {
                            e.currentTarget.style.color = '#15803D';
                            e.currentTarget.style.backgroundColor = 'rgba(22, 163, 74, 0.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = user.status === 'active' ? '#DC2626' : '#16A34A';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        title={user.status === 'active' ? 'Suspend user' : 'Activate user'}
                      >
                        {user.status === 'active' ? <UserX style={{ height: '1rem', width: '1rem' }} /> : <UserCheck style={{ height: '1rem', width: '1rem' }} />}
                      </button>
                      <button
                        onClick={() => onDeleteUser(user.id)}
                        style={{
                          color: '#DC2626',
                          padding: 'var(--space-1)',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#B91C1C';
                          e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#DC2626';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        title="Delete user"
                      >
                        <Trash2 style={{ height: '1rem', width: '1rem' }} />
                      </button>
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