import React, { useState } from 'react';
import { Search, Filter, Download, RefreshCw, Calendar, Shield, AlertTriangle, TrendingUp, Users, Activity, Clock, Eye, X } from 'lucide-react';
import { useAuditLog } from '../../../hooks/useAuditLog';
import { AuditLogTable } from './AuditLogTable';
import { AuditLogFilters } from './AuditLogFilters';
import { AuditLogSummary } from './AuditLogSummary';
import { AuditLogExportModal } from './AuditLogExportModal';
import { AuditLogEntry, AuditLogExportOptions } from '../../../types/auditLog';
import { PermissionGate } from '../../auth/PermissionGate';
import '../../../design-system/tokens/colors.css';
import '../../../design-system/tokens/spacing.css';
import '../../../design-system/tokens/borders.css';
import '../../../design-system/tokens/typography.css';
import '../../../design-system/tokens/shadows.css';
import '../../../design-system/tokens/dashboard.css';

function FilterButton({ showFilters, onClick }: { showFilters: boolean; onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      style={{
        padding: 'var(--space-2) var(--space-4)',
        border: '1px solid var(--dashboard-border-primary)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: showFilters
          ? 'rgba(59, 130, 246, 0.1)'
          : isHovered
            ? 'var(--dashboard-bg-hover)'
            : 'transparent',
        color: showFilters ? '#2563eb' : 'var(--dashboard-text-primary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        transition: 'background-color 200ms, color 200ms'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Filter className="h-4 w-4" />
      <span>Filters</span>
    </button>
  );
}

function QuickDateButton({ onClick }: { onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      style={{
        padding: 'var(--space-2) var(--space-4)',
        border: '1px solid var(--dashboard-border-primary)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: isHovered ? 'var(--dashboard-bg-hover)' : 'transparent',
        color: 'var(--dashboard-text-primary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        transition: 'background-color 200ms'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Calendar className="h-4 w-4" />
      <span>Last 7 Days</span>
    </button>
  );
}

function ModalHeader({ selectedEntry, onClose }: { selectedEntry: AuditLogEntry; onClose: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--space-6)',
      borderBottom: '1px solid var(--dashboard-border-primary)'
    }}>
      <div>
        <h2 style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--dashboard-text-primary)'
        }}>
          Audit Log Details
        </h2>
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--dashboard-text-secondary)'
        }}>
          Entry ID: {selectedEntry.id}
        </p>
      </div>
      <button
        onClick={onClose}
        style={{
          color: isHovered ? 'var(--dashboard-text-secondary)' : 'var(--dashboard-text-tertiary)',
          cursor: 'pointer',
          border: 'none',
          backgroundColor: 'transparent',
          padding: '0',
          transition: 'color 200ms'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <X className="h-6 w-6" />
      </button>
    </div>
  );
}

function ModalContent({ selectedEntry }: { selectedEntry: AuditLogEntry }) {
  const getCategoryBadgeStyle = (category: string) => {
    if (category === 'security') return { backgroundColor: '#fee2e2', color: '#991b1b' };
    if (category === 'authentication') return { backgroundColor: '#dbeafe', color: '#1e40af' };
    return { backgroundColor: '#f3f4f6', color: '#1f2937' };
  };

  const getSeverityBadgeStyle = (severity: string) => {
    if (severity === 'critical') return { backgroundColor: '#fee2e2', color: '#991b1b' };
    if (severity === 'high') return { backgroundColor: '#fed7aa', color: '#9a3412' };
    if (severity === 'medium') return { backgroundColor: '#fef3c7', color: '#92400e' };
    return { backgroundColor: '#f3f4f6', color: '#1f2937' };
  };

  const getOutcomeBadgeStyle = (outcome: string) => {
    if (outcome === 'success') return { backgroundColor: '#d1fae5', color: '#065f46' };
    if (outcome === 'failure') return { backgroundColor: '#fee2e2', color: '#991b1b' };
    return { backgroundColor: '#fef3c7', color: '#92400e' };
  };

  return (
    <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-1)' }}>Action</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>{selectedEntry.action}</p>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-1)' }}>Timestamp</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>
              {new Date(selectedEntry.timestamp).toLocaleString()}
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-1)' }}>Category</h3>
            <span style={{
              display: 'inline-flex',
              padding: 'var(--space-1) var(--space-2)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-semibold)',
              borderRadius: 'var(--radius-full)',
              ...getCategoryBadgeStyle(selectedEntry.category)
            }}>
              {selectedEntry.category}
            </span>
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-1)' }}>Severity</h3>
            <span style={{
              display: 'inline-flex',
              padding: 'var(--space-1) var(--space-2)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-semibold)',
              borderRadius: 'var(--radius-full)',
              ...getSeverityBadgeStyle(selectedEntry.severity)
            }}>
              {selectedEntry.severity}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-1)' }}>Actor</h3>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>
              <p>{selectedEntry.actor.name}</p>
              <p style={{ color: 'var(--dashboard-text-secondary)' }}>{selectedEntry.actor.email}</p>
              <p style={{ color: 'var(--dashboard-text-secondary)' }}>IP: {selectedEntry.actor.ipAddress}</p>
            </div>
          </div>

          {selectedEntry.target && (
            <div>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-1)' }}>Target</h3>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>
                <p>{selectedEntry.target.name}</p>
                {selectedEntry.target.email && (
                  <p style={{ color: 'var(--dashboard-text-secondary)' }}>{selectedEntry.target.email}</p>
                )}
                <p style={{ color: 'var(--dashboard-text-secondary)' }}>Type: {selectedEntry.target.type}</p>
              </div>
            </div>
          )}

          <div>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-1)' }}>Outcome</h3>
            <span style={{
              display: 'inline-flex',
              padding: 'var(--space-1) var(--space-2)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-semibold)',
              borderRadius: 'var(--radius-full)',
              ...getOutcomeBadgeStyle(selectedEntry.outcome)
            }}>
              {selectedEntry.outcome}
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-2)' }}>Description</h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>{selectedEntry.details.description}</p>
      </div>

      {selectedEntry.details.changes && (
        <div>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-2)' }}>Changes</h3>
          <div style={{ backgroundColor: 'var(--dashboard-bg-secondary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)' }}>
            <pre style={{ fontSize: 'var(--text-xs)', color: 'var(--dashboard-text-primary)', overflowX: 'auto' }}>
              {JSON.stringify(selectedEntry.details.changes, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {selectedEntry.details.metadata && (
        <div>
          <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-2)' }}>Metadata</h3>
          <div style={{ backgroundColor: 'var(--dashboard-bg-secondary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)' }}>
            <pre style={{ fontSize: 'var(--text-xs)', color: 'var(--dashboard-text-primary)', overflowX: 'auto' }}>
              {JSON.stringify(selectedEntry.details.metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

function ModalFooter({ onClose }: { onClose: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-end',
      padding: 'var(--space-6)',
      borderTop: '1px solid var(--dashboard-border-primary)'
    }}>
      <button
        onClick={onClose}
        style={{
          padding: 'var(--space-2) var(--space-4)',
          color: 'var(--dashboard-text-primary)',
          border: '1px solid var(--dashboard-border-primary)',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: isHovered ? 'var(--dashboard-bg-hover)' : 'transparent',
          cursor: 'pointer',
          transition: 'background-color 200ms'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        Close
      </button>
    </div>
  );
}

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

  const getTabStyle = (isActive: boolean) => ({
    padding: 'var(--space-4) var(--space-1)',
    borderBottom: isActive ? '2px solid var(--dashboard-nav-tab-active)' : '2px solid transparent',
    fontWeight: 'var(--font-medium)',
    fontSize: 'var(--text-sm)',
    whiteSpace: 'nowrap' as const,
    color: isActive ? 'var(--dashboard-nav-tab-active)' : 'var(--dashboard-nav-tab-inactive)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'color 200ms ease',
    border: 'none'
  });

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
          <Shield style={{ color: 'var(--dashboard-text-tertiary)' }} className="h-16 w-16 mx-auto mb-4" />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Access Restricted</h3>
          <p style={{ color: 'var(--dashboard-text-secondary)' }}>You don't have permission to view audit logs.</p>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>Audit Trail</h2>
            <p style={{ color: 'var(--dashboard-text-secondary)' }}>
              Comprehensive logging of all administrative actions and system events
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button
              onClick={refreshLogs}
              disabled={loading}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                color: 'var(--dashboard-text-primary)',
                border: '1px solid var(--dashboard-border-primary)',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                opacity: loading ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}
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
            <div style={{
              backgroundColor: 'var(--dashboard-bg-elevated)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--dashboard-shadow-card)',
              padding: 'var(--space-6)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div style={{ marginLeft: 'var(--space-4)' }}>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Total Events</p>
                  <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>{summary.totalEntries.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--dashboard-bg-elevated)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--dashboard-shadow-card)',
              padding: 'var(--space-6)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div style={{ marginLeft: 'var(--space-4)' }}>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Success Rate</p>
                  <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>
                    {Math.round((summary.outcomeBreakdown.success / summary.totalEntries) * 100)}%
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--dashboard-bg-elevated)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--dashboard-shadow-card)',
              padding: 'var(--space-6)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div style={{ marginLeft: 'var(--space-4)' }}>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Security Alerts</p>
                  <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>{summary.securityAlerts.length}</p>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--dashboard-bg-elevated)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--dashboard-shadow-card)',
              padding: 'var(--space-6)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div style={{ marginLeft: 'var(--space-4)' }}>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Active Users</p>
                  <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>{summary.topActors.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ borderBottom: '1px solid var(--dashboard-border-primary)' }}>
          <nav style={{ display: 'flex', gap: 'var(--space-8)' }}>
            <button
              onClick={() => setActiveTab('logs')}
              style={getTabStyle(activeTab === 'logs')}
            >
              Audit Logs
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              style={getTabStyle(activeTab === 'summary')}
            >
              Analytics & Summary
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'logs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Search and Filter Bar */}
            <div style={{
              backgroundColor: 'var(--dashboard-bg-elevated)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--dashboard-shadow-card)',
              padding: 'var(--space-6)'
            }}>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search style={{ color: 'var(--dashboard-text-tertiary)' }} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search audit logs by action, user, or description..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      style={{
                        paddingLeft: 'var(--space-10)',
                        width: '100%',
                        padding: 'var(--space-2) var(--space-3)',
                        border: '1px solid var(--dashboard-border-primary)',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: 'var(--dashboard-bg-secondary)',
                        color: 'var(--dashboard-text-primary)',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <FilterButton
                    showFilters={showFilters}
                    onClick={() => setShowFilters(!showFilters)}
                  />
                  <QuickDateButton
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
                  />
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div style={{
                  marginTop: 'var(--space-6)',
                  paddingTop: 'var(--space-6)',
                  borderTop: '1px solid var(--dashboard-border-primary)'
                }}>
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
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)'
              }}>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <p style={{ color: '#991b1b' }}>{error}</p>
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
            <div style={{
              backgroundColor: 'var(--dashboard-bg-elevated)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              width: '100%',
              maxWidth: '56rem',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              {/* Modal Header */}
              <ModalHeader
                selectedEntry={selectedEntry}
                onClose={() => setSelectedEntry(null)}
              />

              {/* Modal Content */}
              <ModalContent selectedEntry={selectedEntry} />

              {/* Modal Footer */}
              <ModalFooter onClose={() => setSelectedEntry(null)} />
            </div>
          </div>
        )}
      </div>
    </PermissionGate>
  );
}