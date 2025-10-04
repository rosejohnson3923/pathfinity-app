import React, { useState, useEffect } from 'react';
import { X, Calendar, Filter } from 'lucide-react';
import {
  AuditLogFilters as AuditLogFiltersType,
  AuditAction,
  AuditSeverity,
  AuditCategory,
  AUDIT_ACTION_DEFINITIONS
} from '../../../types/auditLog';
import '../../../design-system/tokens/colors.css';
import '../../../design-system/tokens/spacing.css';
import '../../../design-system/tokens/borders.css';
import '../../../design-system/tokens/typography.css';
import '../../../design-system/tokens/shadows.css';
import '../../../design-system/tokens/dashboard.css';

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

function SeverityBadge({ severity }: { severity: AuditSeverity }) {
  const getBadgeStyle = () => {
    switch (severity) {
      case 'critical':
        return { backgroundColor: '#fee2e2', color: '#991b1b' };
      case 'high':
        return { backgroundColor: '#fed7aa', color: '#9a3412' };
      case 'medium':
        return { backgroundColor: '#fef3c7', color: '#92400e' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#1f2937' };
    }
  };

  return (
    <span style={{
      fontSize: 'var(--text-sm)',
      textTransform: 'capitalize',
      padding: 'var(--space-1) var(--space-2)',
      borderRadius: 'var(--radius-full)',
      ...getBadgeStyle()
    }}>
      {severity}
    </span>
  );
}

function OutcomeBadge({ outcome }: { outcome: typeof OUTCOME_OPTIONS[number] }) {
  const getBadgeStyle = () => {
    switch (outcome) {
      case 'success':
        return { backgroundColor: '#d1fae5', color: '#065f46' };
      case 'failure':
        return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default:
        return { backgroundColor: '#fef3c7', color: '#92400e' };
    }
  };

  return (
    <span style={{
      fontSize: 'var(--text-sm)',
      textTransform: 'capitalize',
      padding: 'var(--space-1) var(--space-2)',
      borderRadius: 'var(--radius-full)',
      ...getBadgeStyle()
    }}>
      {outcome}
    </span>
  );
}

export function AuditLogFilters({
  filters,
  onFiltersChange,
  onClearFilters
}: AuditLogFiltersProps) {
  const [localFilters, setLocalFilters] = useState<AuditLogFiltersType>(filters);
  const [hoveredQuickDate, setHoveredQuickDate] = useState<string | null>(null);
  const [hoveredClearButton, setHoveredClearButton] = useState(false);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter style={{ color: 'var(--dashboard-text-tertiary)' }} className="h-5 w-5" />
          <h3 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--dashboard-text-primary)'
          }}>Advanced Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            style={{
              fontSize: 'var(--text-sm)',
              color: hoveredClearButton ? '#b91c1c' : '#dc2626',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
              transition: 'color 200ms'
            }}
            onMouseEnter={() => setHoveredClearButton(true)}
            onMouseLeave={() => setHoveredClearButton(false)}
          >
            <X className="h-4 w-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Date Range */}
        <div className="space-y-3">
          <label style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--dashboard-text-primary)'
          }}>
            Date Range
          </label>
          <div className="space-y-2">
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-xs)',
                color: 'var(--dashboard-text-tertiary)',
                marginBottom: 'var(--space-1)'
              }}>From</label>
              <input
                type="datetime-local"
                value={localFilters.dateRange?.start ?
                  new Date(localFilters.dateRange.start).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleDateRangeChange('start', e.target.value ? new Date(e.target.value).toISOString() : '')}
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: 'var(--text-sm)',
                  border: '1px solid var(--dashboard-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--dashboard-bg-secondary)',
                  color: 'var(--dashboard-text-primary)',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-xs)',
                color: 'var(--dashboard-text-tertiary)',
                marginBottom: 'var(--space-1)'
              }}>To</label>
              <input
                type="datetime-local"
                value={localFilters.dateRange?.end ?
                  new Date(localFilters.dateRange.end).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleDateRangeChange('end', e.target.value ? new Date(e.target.value).toISOString() : '')}
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: 'var(--text-sm)',
                  border: '1px solid var(--dashboard-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--dashboard-bg-secondary)',
                  color: 'var(--dashboard-text-primary)',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <label style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--dashboard-text-primary)'
          }}>
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
                <span style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--dashboard-text-primary)',
                  textTransform: 'capitalize'
                }}>
                  {category.replace('_', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Severities */}
        <div className="space-y-3">
          <label style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--dashboard-text-primary)'
          }}>
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
                <SeverityBadge severity={severity} />
              </label>
            ))}
          </div>
        </div>

        {/* Outcomes */}
        <div className="space-y-3">
          <label style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--dashboard-text-primary)'
          }}>
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
                <OutcomeBadge outcome={outcome} />
              </label>
            ))}
          </div>
        </div>

        {/* IP Addresses */}
        <div className="space-y-3">
          <label style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--dashboard-text-primary)'
          }}>
            IP Addresses
          </label>
          <textarea
            value={(localFilters.ipAddresses || []).join('\n')}
            onChange={(e) => {
              const ips = e.target.value.split('\n').map(ip => ip.trim()).filter(Boolean);
              handleFilterChange('ipAddresses', ips.length > 0 ? ips : undefined);
            }}
            placeholder="192.168.1.100\n10.0.0.45"
            style={{
              width: '100%',
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 'var(--text-sm)',
              border: '1px solid var(--dashboard-border-primary)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--dashboard-bg-secondary)',
              color: 'var(--dashboard-text-primary)',
              outline: 'none'
            }}
            rows={3}
          />
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--dashboard-text-tertiary)'
          }}>
            Enter one IP address per line
          </p>
        </div>

        {/* Actor Emails */}
        <div className="space-y-3">
          <label style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--dashboard-text-primary)'
          }}>
            Actor Emails
          </label>
          <textarea
            value={(localFilters.actors || []).join('\n')}
            onChange={(e) => {
              const actors = e.target.value.split('\n').map(actor => actor.trim()).filter(Boolean);
              handleFilterChange('actors', actors.length > 0 ? actors : undefined);
            }}
            placeholder="admin@example.com\nuser@example.com"
            style={{
              width: '100%',
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 'var(--text-sm)',
              border: '1px solid var(--dashboard-border-primary)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--dashboard-bg-secondary)',
              color: 'var(--dashboard-text-primary)',
              outline: 'none'
            }}
            rows={3}
          />
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--dashboard-text-tertiary)'
          }}>
            Enter one email address per line
          </p>
        </div>
      </div>

      {/* Actions by Category */}
      {localFilters.categories && localFilters.categories.length > 0 && (
        <div className="space-y-3">
          <label style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--dashboard-text-primary)'
          }}>
            Specific Actions
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localFilters.categories.map(category => (
              <div key={category} className="space-y-2">
                <h4 style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--dashboard-text-secondary)',
                  textTransform: 'capitalize'
                }}>
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
                      <span style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--dashboard-text-secondary)'
                      }}>
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
        <label style={{
          display: 'block',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)',
          color: 'var(--dashboard-text-primary)'
        }}>
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
              style={{
                padding: 'var(--space-1) var(--space-3)',
                fontSize: 'var(--text-sm)',
                backgroundColor: hoveredQuickDate === label ? 'var(--dashboard-bg-hover)' : 'var(--dashboard-bg-secondary)',
                color: 'var(--dashboard-text-primary)',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 200ms'
              }}
              onMouseEnter={() => setHoveredQuickDate(label)}
              onMouseLeave={() => setHoveredQuickDate(null)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}