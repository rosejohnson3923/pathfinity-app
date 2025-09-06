import React, { useState, useEffect } from 'react';
import { X, Calendar, Filter } from 'lucide-react';
import {
  AuditLogFilters as AuditLogFiltersType,
  AuditAction,
  AuditSeverity,
  AuditCategory,
  AUDIT_ACTION_DEFINITIONS
} from '../../../types/auditLog';

interface AuditLogFiltersProps {
  filters: AuditLogFiltersType;
  onFiltersChange: (filters: AuditLogFiltersType) => void;
  onClearFilters: () => void;
}

const SEVERITY_OPTIONS: AuditSeverity[] = ['low', 'medium', 'high', 'critical'];
const CATEGORY_OPTIONS: AuditCategory[] = [
  'authentication',
  'authorization', 
  'user_management',
  'content_management',
  'system_admin',
  'security',
  'data_handling',
  'integrations'
];

const OUTCOME_OPTIONS = ['success', 'failure', 'partial'] as const;

export function AuditLogFilters({
  filters,
  onFiltersChange,
  onClearFilters
}: AuditLogFiltersProps) {
  const [localFilters, setLocalFilters] = useState<AuditLogFiltersType>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof AuditLogFiltersType, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleArrayFilterChange = (key: keyof AuditLogFiltersType, value: string, checked: boolean) => {
    const currentArray = (localFilters[key] as string[]) || [];
    let newArray;
    
    if (checked) {
      newArray = [...currentArray, value];
    } else {
      newArray = currentArray.filter(item => item !== value);
    }
    
    handleFilterChange(key, newArray.length > 0 ? newArray : undefined);
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const currentRange = localFilters.dateRange || { start: '', end: '' };
    const newRange = { ...currentRange, [field]: value };
    
    // Only apply if we have both start and end dates
    if (newRange.start && newRange.end) {
      handleFilterChange('dateRange', newRange);
    } else if (!newRange.start && !newRange.end) {
      handleFilterChange('dateRange', undefined);
    }
  };

  const getActionsByCategory = (category: AuditCategory): AuditAction[] => {
    return Object.entries(AUDIT_ACTION_DEFINITIONS)
      .filter(([, definition]) => definition.category === category)
      .map(([action]) => action as AuditAction);
  };

  const hasActiveFilters = Object.keys(localFilters).some(key => {
    const value = localFilters[key as keyof AuditLogFiltersType];
    return value !== undefined && value !== null && value !== '' && 
           (!Array.isArray(value) || value.length > 0);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Advanced Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center space-x-1"
          >
            <X className="h-4 w-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Date Range */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date Range
          </label>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From</label>
              <input
                type="datetime-local"
                value={localFilters.dateRange?.start ? 
                  new Date(localFilters.dateRange.start).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleDateRangeChange('start', e.target.value ? new Date(e.target.value).toISOString() : '')}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">To</label>
              <input
                type="datetime-local"
                value={localFilters.dateRange?.end ? 
                  new Date(localFilters.dateRange.end).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleDateRangeChange('end', e.target.value ? new Date(e.target.value).toISOString() : '')}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Categories
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {CATEGORY_OPTIONS.map(category => (
              <label key={category} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(localFilters.categories || []).includes(category)}
                  onChange={(e) => handleArrayFilterChange('categories', category, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                  {category.replace('_', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Severities */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Severity Levels
          </label>
          <div className="space-y-2">
            {SEVERITY_OPTIONS.map(severity => (
              <label key={severity} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(localFilters.severities || []).includes(severity)}
                  onChange={(e) => handleArrayFilterChange('severities', severity, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span className={`text-sm capitalize px-2 py-1 rounded-full ${
                  severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                  severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                  severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                }`}>
                  {severity}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Outcomes */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Outcomes
          </label>
          <div className="space-y-2">
            {OUTCOME_OPTIONS.map(outcome => (
              <label key={outcome} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(localFilters.outcomes || []).includes(outcome)}
                  onChange={(e) => handleArrayFilterChange('outcomes', outcome, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <span className={`text-sm capitalize px-2 py-1 rounded-full ${
                  outcome === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                  outcome === 'failure' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                }`}>
                  {outcome}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* IP Addresses */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            IP Addresses
          </label>
          <textarea
            value={(localFilters.ipAddresses || []).join('\n')}
            onChange={(e) => {
              const ips = e.target.value.split('\n').map(ip => ip.trim()).filter(Boolean);
              handleFilterChange('ipAddresses', ips.length > 0 ? ips : undefined);
            }}
            placeholder="192.168.1.100\n10.0.0.45"
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            rows={3}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Enter one IP address per line
          </p>
        </div>

        {/* Actor Emails */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Actor Emails
          </label>
          <textarea
            value={(localFilters.actors || []).join('\n')}
            onChange={(e) => {
              const actors = e.target.value.split('\n').map(actor => actor.trim()).filter(Boolean);
              handleFilterChange('actors', actors.length > 0 ? actors : undefined);
            }}
            placeholder="admin@example.com\nuser@example.com"
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            rows={3}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Enter one email address per line
          </p>
        </div>
      </div>

      {/* Actions by Category */}
      {localFilters.categories && localFilters.categories.length > 0 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Specific Actions
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localFilters.categories.map(category => (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                  {category.replace('_', ' ')}
                </h4>
                <div className="space-y-1 pl-2">
                  {getActionsByCategory(category).map(action => (
                    <label key={action} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={(localFilters.actions || []).includes(action)}
                        onChange={(e) => handleArrayFilterChange('actions', action, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {AUDIT_ACTION_DEFINITIONS[action]?.label || action}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Date Filters */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Quick Date Filters
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Last Hour', hours: 1 },
            { label: 'Last 6 Hours', hours: 6 },
            { label: 'Last 24 Hours', hours: 24 },
            { label: 'Last 7 Days', hours: 24 * 7 },
            { label: 'Last 30 Days', hours: 24 * 30 }
          ].map(({ label, hours }) => (
            <button
              key={label}
              onClick={() => {
                const end = new Date();
                const start = new Date(end.getTime() - hours * 60 * 60 * 1000);
                handleFilterChange('dateRange', {
                  start: start.toISOString(),
                  end: end.toISOString()
                });
              }}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}