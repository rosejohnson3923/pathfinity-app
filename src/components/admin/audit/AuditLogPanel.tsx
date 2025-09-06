import React, { useState } from 'react';
import { Search, Filter, Download, RefreshCw, Calendar, Shield, AlertTriangle, TrendingUp, Users, Activity, Clock, Eye, X } from 'lucide-react';
import { useAuditLog } from '../../../hooks/useAuditLog';
import { AuditLogTable } from './AuditLogTable';
import { AuditLogFilters } from './AuditLogFilters';
import { AuditLogSummary } from './AuditLogSummary';
import { AuditLogExportModal } from './AuditLogExportModal';
import { AuditLogEntry, AuditLogExportOptions } from '../../../types/auditLog';
import { PermissionGate } from '../../auth/PermissionGate';

export function AuditLogPanel() {
  const {
    auditLogs,
    searchParams,
    totalEntries,
    totalPages,
    summary,
    loading,
    error,
    setSearchParams,
    searchAuditLogs,
    applyFilters,
    clearFilters,
    exportAuditLogs,
    refreshLogs
  } = useAuditLog();

  const [activeTab, setActiveTab] = useState<'logs' | 'summary'>('logs');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchAuditLogs(query);
  };

  const handlePageChange = (page: number) => {
    setSearchParams({ ...searchParams, page });
  };

  const handleItemsPerPageChange = (limit: number) => {
    setSearchParams({ ...searchParams, limit, page: 1 });
  };

  const handleExport = async (options: AuditLogExportOptions) => {
    await exportAuditLogs(options);
    setShowExportModal(false);
  };

  const handleViewDetails = (entry: AuditLogEntry) => {
    setSelectedEntry(entry);
  };

  return (
    <PermissionGate 
      permission="audit:view"
      fallback={
        <div className="text-center py-12">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Access Restricted</h3>
          <p className="text-gray-500 dark:text-gray-400">You don't have permission to view audit logs.</p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Trail</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive logging of all administrative actions and system events
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={refreshLogs}
              disabled={loading}
              className="px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <PermissionGate permission="audit:export">
              <button
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </PermissionGate>
          </div>
        </div>

        {/* Stats Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalEntries.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round((summary.outcomeBreakdown.success / summary.totalEntries) * 100)}%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Security Alerts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.securityAlerts.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.topActors.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Audit Logs
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'summary'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Analytics & Summary
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            {/* Search and Filter Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search audit logs by action, user, or description..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2 border rounded-lg flex items-center space-x-2 transition-colors ${
                      showFilters
                        ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filters</span>
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                      applyFilters({
                        dateRange: {
                          start: oneWeekAgo.toISOString(),
                          end: today.toISOString()
                        }
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Last 7 Days</span>
                  </button>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <AuditLogFilters
                    filters={searchParams.filters || {}}
                    onFiltersChange={applyFilters}
                    onClearFilters={() => {
                      clearFilters();
                      setShowFilters(false);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            )}

            {/* Audit Logs Table */}
            <AuditLogTable
              auditLogs={auditLogs}
              searchParams={searchParams}
              totalEntries={totalEntries}
              totalPages={totalPages}
              loading={loading}
              onSearchParamsChange={setSearchParams}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              onViewDetails={handleViewDetails}
            />
          </div>
        )}

        {activeTab === 'summary' && summary && (
          <AuditLogSummary summary={summary} />
        )}

        {/* Export Modal */}
        {showExportModal && (
          <AuditLogExportModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            onExport={handleExport}
            totalEntries={totalEntries}
            currentFilters={searchParams.filters}
          />
        )}

        {/* Entry Details Modal */}
        {selectedEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Audit Log Details
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Entry ID: {selectedEntry.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Action</h3>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedEntry.action}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Timestamp</h3>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(selectedEntry.timestamp).toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Category</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedEntry.category === 'security' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        selectedEntry.category === 'authentication' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                      }`}>
                        {selectedEntry.category}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Severity</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedEntry.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        selectedEntry.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                        selectedEntry.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                      }`}>
                        {selectedEntry.severity}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Actor</h3>
                      <div className="text-sm text-gray-900 dark:text-white">
                        <p>{selectedEntry.actor.name}</p>
                        <p className="text-gray-600 dark:text-gray-400">{selectedEntry.actor.email}</p>
                        <p className="text-gray-600 dark:text-gray-400">IP: {selectedEntry.actor.ipAddress}</p>
                      </div>
                    </div>
                    
                    {selectedEntry.target && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Target</h3>
                        <div className="text-sm text-gray-900 dark:text-white">
                          <p>{selectedEntry.target.name}</p>
                          {selectedEntry.target.email && (
                            <p className="text-gray-600 dark:text-gray-400">{selectedEntry.target.email}</p>
                          )}
                          <p className="text-gray-600 dark:text-gray-400">Type: {selectedEntry.target.type}</p>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Outcome</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedEntry.outcome === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        selectedEntry.outcome === 'failure' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      }`}>
                        {selectedEntry.outcome}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h3>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedEntry.details.description}</p>
                </div>
                
                {selectedEntry.details.changes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Changes</h3>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                      <pre className="text-xs text-gray-900 dark:text-white overflow-x-auto">
                        {JSON.stringify(selectedEntry.details.changes, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                
                {selectedEntry.details.metadata && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Metadata</h3>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                      <pre className="text-xs text-gray-900 dark:text-white overflow-x-auto">
                        {JSON.stringify(selectedEntry.details.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PermissionGate>
  );
}