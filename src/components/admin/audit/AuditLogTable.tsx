import React from 'react';
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
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'failure':
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'partial':
        return <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'success':
        return 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/30';
      case 'failure':
        return 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/30';
      case 'partial':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-900/30';
    }
  };

  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const SortButton = ({ column, label }: { column: SortableColumn; label: string }) => {
    const isActive = searchParams.sortBy === column;
    const isDesc = searchParams.sortOrder === 'desc';

    return (
      <button
        onClick={() => handleSort(column)}
        className="flex items-center space-x-1 text-left font-medium text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
      >
        <span>{label}</span>
        <div className="flex flex-col">
          <ChevronUp 
            className={`h-3 w-3 ${
              isActive && !isDesc ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300'
            }`} 
          />
          <ChevronDown 
            className={`h-3 w-3 -mt-1 ${
              isActive && isDesc ? 'text-blue-600 dark:text-blue-400' : 'text-gray-300'
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
          <p className="text-gray-500 dark:text-gray-400 mt-4">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  if (auditLogs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="p-8 text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No audit logs found</h3>
          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Audit Trail</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {totalEntries.toLocaleString()} entr{totalEntries !== 1 ? 'ies' : 'y'} found
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
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
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {auditLogs.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <div>{formatAuditTimestamp(entry.timestamp)}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {getAuditActionLabel(entry.action)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {entry.action}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {entry.actor.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {entry.actor.email}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {entry.actor.ipAddress}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {entry.target ? (
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {entry.target.name}
                        </div>
                        {entry.target.email && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {entry.target.email}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {entry.target.type}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${AUDIT_CATEGORY_COLORS[entry.category]}`}>
                      {entry.category.replace('_', ' ')}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${AUDIT_SEVERITY_COLORS[entry.severity]}`}>
                      {entry.severity.toUpperCase()}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getOutcomeIcon(entry.outcome)}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOutcomeColor(entry.outcome)}`}>
                        {entry.outcome}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => onViewDetails(entry)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
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