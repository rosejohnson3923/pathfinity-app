import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Eye, Clock, User, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import {
  AuditLogEntry,
  AuditLogSearchParams,
  formatAuditTimestamp,
  getAuditActionLabel,
  AUDIT_SEVERITY_COLORS,
  AUDIT_CATEGORY_COLORS
} from '../../../types/auditLog';
import { UserPagination } from '../UserPagination';
import '../../../design-system/tokens/colors.css';
import '../../../design-system/tokens/spacing.css';
import '../../../design-system/tokens/borders.css';
import '../../../design-system/tokens/typography.css';
import '../../../design-system/tokens/shadows.css';
import '../../../design-system/tokens/dashboard.css';

interface AuditLogTableProps {
  auditLogs: AuditLogEntry[];
  searchParams: AuditLogSearchParams;
  totalEntries: number;
  totalPages: number;
  loading: boolean;
  onSearchParamsChange: (params: AuditLogSearchParams) => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  onViewDetails: (entry: AuditLogEntry) => void;
}

const SORTABLE_COLUMNS = [
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'action', label: 'Action' },
  { key: 'category', label: 'Category' },
  { key: 'severity', label: 'Severity' },
  { key: 'outcome', label: 'Outcome' }
] as const;

type SortableColumn = typeof SORTABLE_COLUMNS[number]['key'];

function ViewDetailsButton({ onClick }: { onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      style={{
        color: '#2563eb',
        padding: 'var(--space-1)',
        backgroundColor: isHovered ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
        borderRadius: 'var(--radius-md)',
        border: 'none',
        cursor: 'pointer',
        transition: 'background-color 200ms'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="View details"
    >
      <Eye className="h-4 w-4" />
    </button>
  );
}

export function AuditLogTable({
  auditLogs,
  searchParams,
  totalEntries,
  totalPages,
  loading,
  onSearchParamsChange,
  onPageChange,
  onItemsPerPageChange,
  onViewDetails
}: AuditLogTableProps) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleSort = (column: SortableColumn) => {
    const currentSort = searchParams.sortBy;
    const currentOrder = searchParams.sortOrder || 'desc';

    let newOrder: 'asc' | 'desc' = 'desc';
    if (currentSort === column && currentOrder === 'desc') {
      newOrder = 'asc';
    }

    onSearchParamsChange({
      ...searchParams,
      sortBy: column,
      sortOrder: newOrder
    });
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failure':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'partial':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock style={{ color: 'var(--dashboard-text-tertiary)' }} className="h-4 w-4" />;
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'success':
        return { backgroundColor: '#d1fae5', color: '#065f46' };
      case 'failure':
        return { backgroundColor: '#fee2e2', color: '#991b1b' };
      case 'partial':
        return { backgroundColor: '#fef3c7', color: '#92400e' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#4b5563' };
    }
  };

  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const SortButton = ({ column, label }: { column: SortableColumn; label: string }) => {
    const isActive = searchParams.sortBy === column;
    const isDesc = searchParams.sortOrder === 'desc';
    const [isHovered, setIsHovered] = useState(false);

    return (
      <button
        onClick={() => handleSort(column)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          textAlign: 'left',
          fontWeight: 'var(--font-medium)',
          color: isHovered ? 'var(--dashboard-text-primary)' : 'var(--dashboard-text-secondary)',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          transition: 'color 200ms'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span>{label}</span>
        <div className="flex flex-col">
          <ChevronUp
            style={{ color: isActive && !isDesc ? '#2563eb' : '#d1d5db' }}
            className="h-3 w-3"
          />
          <ChevronDown
            style={{ color: isActive && isDesc ? '#2563eb' : '#d1d5db' }}
            className="h-3 w-3 -mt-1"
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
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p style={{
            color: 'var(--dashboard-text-secondary)',
            marginTop: 'var(--space-4)'
          }}>Loading audit logs...</p>
        </div>
      </div>
    );
  }

  if (auditLogs.length === 0) {
    return (
      <div style={{
        backgroundColor: 'var(--dashboard-bg-elevated)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--dashboard-shadow-card)',
        overflow: 'hidden'
      }}>
        <div className="p-8 text-center">
          <Shield style={{ color: 'var(--dashboard-text-tertiary)' }} className="h-12 w-12 mx-auto mb-4" />
          <h3 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--dashboard-text-primary)'
          }}>No audit logs found</h3>
          <p style={{
            color: 'var(--dashboard-text-secondary)'
          }}>Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              <h3 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--dashboard-text-primary)'
              }}>Audit Trail</h3>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--dashboard-text-secondary)',
                marginTop: 'var(--space-1)'
              }}>
                {totalEntries.toLocaleString()} entr{totalEntries !== 1 ? 'ies' : 'y'} found
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--dashboard-bg-secondary)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">
                  <SortButton column="timestamp" label="Timestamp" />
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">
                  <SortButton column="action" label="Action" />
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">
                  Actor
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">
                  <SortButton column="category" label="Category" />
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">
                  <SortButton column="severity" label="Severity" />
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">
                  <SortButton column="outcome" label="Result" />
                </th>
                <th className="px-6 py-3 text-right text-xs uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'var(--dashboard-bg-elevated)' }}>
              {auditLogs.map((entry) => (
                <tr
                  key={entry.id}
                  style={{
                    backgroundColor: hoveredRow === entry.id ? 'var(--dashboard-bg-hover)' : 'transparent',
                    borderBottom: '1px solid var(--dashboard-border-primary)',
                    transition: 'background-color 200ms'
                  }}
                  onMouseEnter={() => setHoveredRow(entry.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="px-6 py-4 whitespace-nowrap" style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--dashboard-text-primary)'
                  }}>
                    <div className="flex items-center space-x-2">
                      <Clock style={{ color: 'var(--dashboard-text-tertiary)' }} className="h-4 w-4" />
                      <div>
                        <div>{formatAuditTimestamp(entry.timestamp)}</div>
                        <div style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--dashboard-text-secondary)'
                        }}>
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)',
                      color: 'var(--dashboard-text-primary)'
                    }}>
                      {getAuditActionLabel(entry.action)}
                    </div>
                    <div style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--dashboard-text-secondary)'
                    }}>
                      {entry.action}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <User style={{ color: 'var(--dashboard-text-tertiary)' }} className="h-4 w-4" />
                      <div>
                        <div style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-medium)',
                          color: 'var(--dashboard-text-primary)'
                        }}>
                          {entry.actor.name}
                        </div>
                        <div style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--dashboard-text-secondary)'
                        }}>
                          {entry.actor.email}
                        </div>
                        <div style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--dashboard-text-secondary)'
                        }}>
                          {entry.actor.ipAddress}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {entry.target ? (
                      <div style={{ fontSize: 'var(--text-sm)' }}>
                        <div style={{
                          fontWeight: 'var(--font-medium)',
                          color: 'var(--dashboard-text-primary)'
                        }}>
                          {entry.target.name}
                        </div>
                        {entry.target.email && (
                          <div style={{
                            fontSize: 'var(--text-xs)',
                            color: 'var(--dashboard-text-secondary)'
                          }}>
                            {entry.target.email}
                          </div>
                        )}
                        <div style={{
                          fontSize: 'var(--text-xs)',
                          color: 'var(--dashboard-text-secondary)'
                        }}>
                          {entry.target.type}
                        </div>
                      </div>
                    ) : (
                      <span style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--dashboard-text-secondary)'
                      }}>-</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span style={{
                      display: 'inline-flex',
                      padding: 'var(--space-1) var(--space-2)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-semibold)',
                      borderRadius: 'var(--radius-full)',
                      ...AUDIT_CATEGORY_COLORS[entry.category]
                    }}>
                      {entry.category.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span style={{
                      display: 'inline-flex',
                      padding: 'var(--space-1) var(--space-2)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 'var(--font-semibold)',
                      borderRadius: 'var(--radius-full)',
                      ...AUDIT_SEVERITY_COLORS[entry.severity]
                    }}>
                      {entry.severity.toUpperCase()}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getOutcomeIcon(entry.outcome)}
                      <span style={{
                        display: 'inline-flex',
                        padding: 'var(--space-1) var(--space-2)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-semibold)',
                        borderRadius: 'var(--radius-full)',
                        ...getOutcomeColor(entry.outcome)
                      }}>
                        {entry.outcome}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <ViewDetailsButton onClick={() => onViewDetails(entry)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <UserPagination
          currentPage={searchParams.page}
          totalPages={totalPages}
          totalItems={totalEntries}
          itemsPerPage={searchParams.limit}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      )}
    </div>
  );
}