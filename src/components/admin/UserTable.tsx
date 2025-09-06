import React, { useState } from 'react';
import { Edit, Trash2, UserCheck, UserX, Mail, Phone, ChevronUp, ChevronDown, MoreHorizontal, CheckSquare, Square } from 'lucide-react';
import { User, UserSearchParams } from '../../types/user';
import { BulkOperation } from '../../types/bulkOperations';

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

    return (
      <button
        onClick={() => handleSort(column)}
        className="flex items-center space-x-1 text-left font-medium text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
      >
        <span>{label}</span>
        <div className="flex flex-col">
          <ChevronUp 
            className={`h-3 w-3 ${
              isActive && isAsc ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300'
            }`} 
          />
          <ChevronDown 
            className={`h-3 w-3 -mt-1 ${
              isActive && !isAsc ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300'
            }`} 
          />
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-4">Loading users...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="p-8 text-center">
          <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No users found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Users</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {users.length} user{users.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          {selectedUsers.size > 0 && onBulkOperation && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
              </span>
              
              <div className="relative">
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <span>Bulk Actions</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {showBulkActions && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowBulkActions(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                      <div className="py-1">
                        <button
                          onClick={() => handleBulkOperation('suspend')}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Suspend Users
                        </button>
                        <button
                          onClick={() => handleBulkOperation('activate')}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Activate Users
                        </button>
                        <button
                          onClick={() => handleBulkOperation('changeRole')}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Change Role
                        </button>
                        <button
                          onClick={() => handleBulkOperation('export')}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Export Selected
                        </button>
                        <div className="border-t border-gray-200 dark:border-gray-600"></div>
                        <button
                          onClick={() => handleBulkOperation('delete')}
                          className="flex items-center px-4 py-2 text-sm text-red-700 dark:text-red-300 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Users
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <button
                onClick={() => setSelectedUsers(new Set())}
                className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.size === users.length && users.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">
                <SortButton column="name" label="User" />
              </th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">
                <SortButton column="role" label="Role" /> 
              </th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">
                Grade/Subject
              </th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">
                <SortButton column="lastActive" label="Last Active" />
              </th>
              <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img 
                      className="h-10 w-10 rounded-full" 
                      src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`}
                      alt={`${user.firstName} ${user.lastName}`}
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {user.role === 'student' && user.grade ? user.grade : 
                   user.role === 'teacher' && user.subject ? user.subject :
                   user.department || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatLastActive(user.lastActive)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onEditUser(user)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      title="Edit user"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onToggleUserStatus(user.id, user.status === 'active' ? 'suspended' : 'active')}
                      className={`p-1 rounded ${
                        user.status === 'active' 
                          ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                          : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                      title={user.status === 'active' ? 'Suspend user' : 'Activate user'}
                    >
                      {user.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => onDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      title="Delete user"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}