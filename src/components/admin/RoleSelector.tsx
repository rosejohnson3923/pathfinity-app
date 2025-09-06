import React, { useState } from 'react';
import { ChevronDown, Shield, Info, AlertTriangle } from 'lucide-react';
import { RoleDefinition, SYSTEM_ROLES, getUserHierarchyLevel } from '../../types/permissions';
import { usePermissions } from '../../hooks/usePermissions';

interface RoleSelectorProps {
  selectedRoleId: string;
  onRoleChange: (roleId: string) => void;
  disabled?: boolean;
  error?: string;
  showDescription?: boolean;
  filterByHierarchy?: boolean; // Only show roles user can assign
}

export function RoleSelector({
  selectedRoleId,
  onRoleChange,
  disabled = false,
  error,
  showDescription = true,
  filterByHierarchy = true
}: RoleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { userPermissions, getHierarchyLevel } = usePermissions();
  
  const currentUserLevel = getHierarchyLevel();
  
  // Filter roles based on user's hierarchy level
  const availableRoles = filterByHierarchy && userPermissions
    ? SYSTEM_ROLES.filter(role => role.hierarchyLevel < currentUserLevel)
    : SYSTEM_ROLES;

  const selectedRole = SYSTEM_ROLES.find(role => role.id === selectedRoleId);

  const getRoleIcon = (role: RoleDefinition) => {
    const iconClass = "h-4 w-4";
    
    if (role.hierarchyLevel >= 80) {
      return <Shield className={`${iconClass} text-red-500`} />;
    } else if (role.hierarchyLevel >= 60) {
      return <Shield className={`${iconClass} text-orange-500`} />;
    } else if (role.hierarchyLevel >= 40) {
      return <Shield className={`${iconClass} text-blue-500`} />;
    } else {
      return <Shield className={`${iconClass} text-gray-500`} />;
    }
  };

  const getRoleColor = (role: RoleDefinition) => {
    if (role.hierarchyLevel >= 80) {
      return 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300';
    } else if (role.hierarchyLevel >= 60) {
      return 'border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
    } else if (role.hierarchyLevel >= 40) {
      return 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    } else {
      return 'border-gray-200 bg-gray-50 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100';
    }
  };

  const canAssignRole = (role: RoleDefinition): boolean => {
    if (!filterByHierarchy || !userPermissions) return true;
    return role.hierarchyLevel < currentUserLevel;
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Role Assignment
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            disabled 
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
          } ${
            error 
              ? 'border-red-300 dark:border-red-600' 
              : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          <div className="flex items-center space-x-2">
            {selectedRole && getRoleIcon(selectedRole)}
            <span className="font-medium">
              {selectedRole ? selectedRole.name : 'Select a role'}
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && !disabled && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
            <div className="p-2 space-y-1">
              {availableRoles.map((role) => {
                const canAssign = canAssignRole(role);
                const isSelected = role.id === selectedRoleId;
                
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      if (canAssign) {
                        onRoleChange(role.id);
                        setIsOpen(false);
                      }
                    }}
                    disabled={!canAssign}
                    className={`w-full flex items-start space-x-3 p-3 rounded-lg transition-colors text-left ${
                      isSelected
                        ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                        : canAssign
                        ? 'hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent'
                        : 'opacity-50 cursor-not-allowed border border-transparent'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getRoleIcon(role)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {role.name}
                        </h4>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(role)}`}>
                          Level {role.hierarchyLevel}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {role.description}
                      </p>
                      
                      {!canAssign && (
                        <div className="flex items-center space-x-1 mt-2">
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                          <span className="text-xs text-amber-600 dark:text-amber-400">
                            Cannot assign this role (insufficient privileges)
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {role.permissions.length} permissions
                        </span>
                        {role.isSystemRole && (
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            System Role
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {availableRoles.length === 0 && (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No roles available to assign</p>
                <p className="text-xs mt-1">You can only assign roles with lower privileges than your own</p>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}

      {showDescription && selectedRole && (
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedRole.name} Role
              </h5>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedRole.description}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Hierarchy Level: {selectedRole.hierarchyLevel}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedRole.permissions.length} permissions included
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
          tabIndex={0} 
          role="button" 
          onKeyDown={(e) => { 
            if (e.key === 'Enter' || e.key === ' ') { 
              e.preventDefault(); 
              setIsOpen(false);
            } 
          }}
        />
      )}
    </div>
  );
}