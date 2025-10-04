import React, { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';
import { ContentFilters as ContentFiltersType, ContentType, ContentStatus, CONTENT_TYPE_OPTIONS, SUBJECT_OPTIONS, GRADE_LEVEL_OPTIONS, DIFFICULTY_OPTIONS } from '../../../types/content';
import '../../../design-system/tokens/colors.css';
import '../../../design-system/tokens/spacing.css';
import '../../../design-system/tokens/borders.css';
import '../../../design-system/tokens/typography.css';
import '../../../design-system/tokens/shadows.css';
import '../../../design-system/tokens/dashboard.css';

interface ContentFiltersProps {
  filters: ContentFiltersType;
  onFiltersChange: (filters: ContentFiltersType) => void;
  onClearFilters: () => void;
}

const STATUS_OPTIONS = [
  { value: 'draft' as ContentStatus, label: 'Draft' },
  { value: 'published' as ContentStatus, label: 'Published' },
  { value: 'review' as ContentStatus, label: 'Under Review' },
  { value: 'archived' as ContentStatus, label: 'Archived' }
];

export function ContentFilters({ filters, onFiltersChange, onClearFilters }: ContentFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== '');
  const activeFilterCount = Object.values(filters).filter(value => value !== undefined && value !== '').length;

  const handleFilterChange = (key: keyof ContentFiltersType, value: string) => {
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
        style={{
          padding: 'var(--space-2) var(--space-4)',
          border: hasActiveFilters ? '1px solid #2563EB' : '1px solid var(--dashboard-border-primary)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: hasActiveFilters ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
          color: hasActiveFilters ? '#2563EB' : 'var(--dashboard-text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          cursor: 'pointer',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          if (!hasActiveFilters) {
            e.currentTarget.style.backgroundColor = 'var(--dashboard-bg-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (!hasActiveFilters) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <Filter style={{ height: '1rem', width: '1rem' }} />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span style={{
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            fontSize: 'var(--text-xs)',
            borderRadius: '9999px',
            padding: '0.125rem var(--space-2)',
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
          height: '1rem',
          width: '1rem',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: 'var(--space-2)',
          width: '28rem',
          backgroundColor: 'var(--dashboard-bg-elevated)',
          border: '1px solid var(--dashboard-border-primary)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 10
        }}>
          <div style={{ padding: 'var(--space-4)' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Filter Content</h3>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  color: 'var(--dashboard-text-tertiary)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 'var(--space-1)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--dashboard-text-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--dashboard-text-tertiary)'}
              >
                <X style={{ height: '1.25rem', width: '1.25rem' }} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Content Type Filter */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-2)' }}>
                  Content Type
                </label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    border: '1px solid var(--dashboard-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--dashboard-bg-secondary)',
                    color: 'var(--dashboard-text-primary)',
                    fontSize: 'var(--text-sm)'
                  }}
                >
                  <option value="">All Types</option>
                  {CONTENT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-2)' }}>
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
                    backgroundColor: 'var(--dashboard-bg-secondary)',
                    color: 'var(--dashboard-text-primary)',
                    fontSize: 'var(--text-sm)'
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

              {/* Subject Filter */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-2)' }}>
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
                    backgroundColor: 'var(--dashboard-bg-secondary)',
                    color: 'var(--dashboard-text-primary)',
                    fontSize: 'var(--text-sm)'
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

              {/* Grade Level Filter */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-2)' }}>
                  Grade Level
                </label>
                <select
                  value={filters.gradeLevel || ''}
                  onChange={(e) => handleFilterChange('gradeLevel', e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    border: '1px solid var(--dashboard-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--dashboard-bg-secondary)',
                    color: 'var(--dashboard-text-primary)',
                    fontSize: 'var(--text-sm)'
                  }}
                >
                  <option value="">All Grades</option>
                  {GRADE_LEVEL_OPTIONS.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-2)' }}>
                  Difficulty Level
                </label>
                <select
                  value={filters.difficulty || ''}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    border: '1px solid var(--dashboard-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--dashboard-bg-secondary)',
                    color: 'var(--dashboard-text-primary)',
                    fontSize: 'var(--text-sm)'
                  }}
                >
                  <option value="">All Levels</option>
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Author Filter */}
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-2)' }}>
                  Author
                </label>
                <input
                  type="text"
                  value={filters.author || ''}
                  onChange={(e) => handleFilterChange('author', e.target.value)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    border: '1px solid var(--dashboard-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--dashboard-bg-secondary)',
                    color: 'var(--dashboard-text-primary)',
                    fontSize: 'var(--text-sm)'
                  }}
                  placeholder="Filter by author name"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between" style={{ paddingTop: 'var(--space-4)', marginTop: 'var(--space-4)', borderTop: '1px solid var(--dashboard-border-primary)' }}>
              <button
                onClick={onClearFilters}
                disabled={!hasActiveFilters}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--dashboard-text-secondary)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: hasActiveFilters ? 'pointer' : 'not-allowed',
                  opacity: hasActiveFilters ? 1 : 0.5
                }}
                onMouseEnter={(e) => {
                  if (hasActiveFilters) {
                    e.currentTarget.style.color = 'var(--dashboard-text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (hasActiveFilters) {
                    e.currentTarget.style.color = 'var(--dashboard-text-secondary)';
                  }
                }}
              >
                Clear All
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: 'var(--text-sm)',
                  borderRadius: 'var(--radius-lg)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
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