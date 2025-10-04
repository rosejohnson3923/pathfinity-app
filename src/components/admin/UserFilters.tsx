import React, { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { UserFilters as UserFiltersType, UserRole, UserStatus } from '../../types/user';
import '../../design-system/tokens/colors.css';
import '../../design-system/tokens/spacing.css';
import '../../design-system/tokens/borders.css';
import '../../design-system/tokens/typography.css';
import '../../design-system/tokens/shadows.css';
import '../../design-system/tokens/dashboard.css';

interface UserFiltersProps {
  filters: UserFiltersType;
  onFiltersChange: (filters: UserFiltersType) => void;
  onClearFilters: () => void;
}

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Administrator' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'student', label: 'Student' },
  { value: 'staff', label: 'Staff' },
  { value: 'parent', label: 'Parent/Guardian' }
];

const STATUS_OPTIONS: { value: UserStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'pending', label: 'Pending' }
];

const GRADE_OPTIONS = [
  '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', '11th Grade', '12th Grade'
];

const SUBJECT_OPTIONS = [
  'Mathematics', 'Science', 'English Language Arts', 'Social Studies', 'Art', 'Music', 
  'Physical Education', 'Computer Science', 'Foreign Language', 'Special Education'
];

export function UserFilters({ filters, onFiltersChange, onClearFilters }: UserFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterButtonHover, setFilterButtonHover] = useState(false);
  const [closeButtonHover, setCloseButtonHover] = useState(false);
  const [clearAllHover, setClearAllHover] = useState(false);
  const [applyFiltersHover, setApplyFiltersHover] = useState(false);

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');
  const activeFilterCount = Object.values(filters).filter(value => value !== undefined && value !== '').length;

  const handleFilterChange = (key: keyof UserFiltersType, value: string) => {
    const newFilters = { ...filters };
    if (value === '') {
      delete newFilters[key];
    } else {
      newFilters[key] = value as any;
    }
    onFiltersChange(newFilters);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setFilterButtonHover(true)}
        onMouseLeave={() => setFilterButtonHover(false)}
        style={{
          padding: 'var(--space-2) var(--space-4)',
          border: `1px solid ${hasActiveFilters ? '#3b82f6' : 'var(--dashboard-border-primary)'}`,
          borderRadius: 'var(--radius-lg)',
          background: hasActiveFilters
            ? '#dbeafe'
            : (filterButtonHover ? 'var(--dashboard-bg-hover)' : 'transparent'),
          color: hasActiveFilters ? '#1e40af' : 'var(--dashboard-text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <Filter style={{ height: '16px', width: '16px' }} />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span style={{
            background: '#2563eb',
            color: '#ffffff',
            fontSize: 'var(--text-xs)',
            borderRadius: '9999px',
            padding: '2px 8px',
            minWidth: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {activeFilterCount}
          </span>
        )}
        <ChevronDown style={{
          height: '16px',
          width: '16px',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          marginTop: 'var(--space-2)',
          width: '28rem',
          background: 'var(--dashboard-bg-elevated)',
          border: '1px solid var(--dashboard-border-primary)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 10
        }}>
          <div style={{ padding: 'var(--space-4)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-4)'
            }}>
              <h3 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: '500',
                color: 'var(--dashboard-text-primary)'
              }}>
                Filter Users
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                onMouseEnter={() => setCloseButtonHover(true)}
                onMouseLeave={() => setCloseButtonHover(false)}
                style={{
                  color: closeButtonHover ? 'var(--dashboard-text-primary)' : 'var(--dashboard-text-secondary)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.2s ease'
                }}
              >
                <X style={{ height: '20px', width: '20px' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Role Filter */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '500',
                  color: 'var(--dashboard-text-secondary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  Role
                </label>
                <select
                  value={filters.role || ''}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    border: '1px solid var(--dashboard-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--dashboard-bg-secondary)',
                    color: 'var(--dashboard-text-primary)',
                    fontSize: 'var(--text-sm)',
                    outline: 'none'
                  }}
                >
                  <option value="">All Roles</option>
                  {ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '500',
                  color: 'var(--dashboard-text-secondary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    border: '1px solid var(--dashboard-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--dashboard-bg-secondary)',
                    color: 'var(--dashboard-text-primary)',
                    fontSize: 'var(--text-sm)',
                    outline: 'none'
                  }}
                >
                  <option value="">All Statuses</option>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grade Filter (for students) */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '500',
                  color: 'var(--dashboard-text-secondary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  Grade Level
                </label>
                <select
                  value={filters.grade || ''}
                  onChange={(e) => handleFilterChange('grade', e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    border: '1px solid var(--dashboard-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--dashboard-bg-secondary)',
                    color: 'var(--dashboard-text-primary)',
                    fontSize: 'var(--text-sm)',
                    outline: 'none'
                  }}
                >
                  <option value="">All Grades</option>
                  {GRADE_OPTIONS.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Filter (for teachers) */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: '500',
                  color: 'var(--dashboard-text-secondary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  Subject
                </label>
                <select
                  value={filters.subject || ''}
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    border: '1px solid var(--dashboard-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--dashboard-bg-secondary)',
                    color: 'var(--dashboard-text-primary)',
                    fontSize: 'var(--text-sm)',
                    outline: 'none'
                  }}
                >
                  <option value="">All Subjects</option>
                  {SUBJECT_OPTIONS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: 'var(--space-4)',
              marginTop: 'var(--space-4)',
              borderTop: '1px solid var(--dashboard-border-primary)'
            }}>
              <button
                onClick={onClearFilters}
                onMouseEnter={() => setClearAllHover(true)}
                onMouseLeave={() => setClearAllHover(false)}
                disabled={!hasActiveFilters}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: 'var(--text-sm)',
                  color: clearAllHover && hasActiveFilters
                    ? 'var(--dashboard-text-primary)'
                    : 'var(--dashboard-text-secondary)',
                  background: 'transparent',
                  border: 'none',
                  cursor: hasActiveFilters ? 'pointer' : 'not-allowed',
                  opacity: hasActiveFilters ? 1 : 0.5,
                  transition: 'color 0.2s ease'
                }}
              >
                Clear All
              </button>
              <button
                onClick={() => setIsOpen(false)}
                onMouseEnter={() => setApplyFiltersHover(true)}
                onMouseLeave={() => setApplyFiltersHover(false)}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  background: applyFiltersHover ? '#1d4ed8' : '#2563eb',
                  color: '#ffffff',
                  fontSize: 'var(--text-sm)',
                  borderRadius: 'var(--radius-lg)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}