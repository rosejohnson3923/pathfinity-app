import React, { useState } from 'react';
import { X, Download, Calendar, FileText, Shield, AlertTriangle } from 'lucide-react';
import {
  AuditLogExportOptions,
  AuditLogFilters,
  AuditLogEntry
} from '../../../types/auditLog';
import '../../../design-system/tokens/colors.css';
import '../../../design-system/tokens/spacing.css';
import '../../../design-system/tokens/borders.css';
import '../../../design-system/tokens/typography.css';
import '../../../design-system/tokens/shadows.css';
import '../../../design-system/tokens/dashboard.css';

interface AuditLogExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: AuditLogExportOptions) => Promise<void>;
  totalEntries: number;
  currentFilters?: AuditLogFilters;
}

const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV', description: 'Comma-separated values for spreadsheet applications' },
  { value: 'xlsx', label: 'Excel', description: 'Microsoft Excel format with formatting' },
  { value: 'json', label: 'JSON', description: 'Machine-readable JSON format' },
  { value: 'pdf', label: 'PDF Report', description: 'Formatted PDF report with summary' }
] as const;

const FIELD_GROUPS = {
  basic: {
    label: 'Basic Information',
    description: 'Essential audit log fields',
    fields: ['timestamp', 'action', 'actor', 'outcome'] as (keyof AuditLogEntry)[]
  },
  detailed: {
    label: 'Detailed Information', 
    description: 'All standard fields including targets and metadata',
    fields: ['timestamp', 'action', 'category', 'severity', 'actor', 'target', 'outcome', 'details'] as (keyof AuditLogEntry)[]
  },
  compliance: {
    label: 'Compliance Export',
    description: 'All fields required for compliance and audit purposes',
    fields: ['id', 'timestamp', 'action', 'category', 'severity', 'actor', 'target', 'details', 'outcome', 'errorMessage', 'sessionId', 'tenantId', 'compliance'] as (keyof AuditLogEntry)[]
  },
  security: {
    label: 'Security Analysis',
    description: 'Fields focused on security events and anomalies',
    fields: ['timestamp', 'action', 'category', 'severity', 'actor', 'target', 'outcome', 'errorMessage'] as (keyof AuditLogEntry)[]
  }
};

export function AuditLogExportModal({
  isOpen,
  onClose,
  onExport,
  totalEntries,
  currentFilters
}: AuditLogExportModalProps) {
  const [exportOptions, setExportOptions] = useState<AuditLogExportOptions>({
    format: 'csv',
    filters: currentFilters || {},
    fields: FIELD_GROUPS.detailed.fields,
    includeMetadata: true,
    includeSensitive: false,
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    }
  });

  const [selectedFieldGroup, setSelectedFieldGroup] = useState<keyof typeof FIELD_GROUPS>('detailed');
  const [isExporting, setIsExporting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [hoveredFormat, setHoveredFormat] = useState<string | null>(null);
  const [hoveredFieldGroup, setHoveredFieldGroup] = useState<string | null>(null);
  const [hoveredQuickDate, setHoveredQuickDate] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFieldGroupChange = (group: keyof typeof FIELD_GROUPS) => {
    setSelectedFieldGroup(group);
    setExportOptions(prev => ({
      ...prev,
      fields: FIELD_GROUPS[group].fields
    }));
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setExportOptions(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };

  const validateExport = (): string[] => {
    const validationErrors: string[] = [];

    if (!exportOptions.dateRange.start || !exportOptions.dateRange.end) {
      validationErrors.push('Date range is required');
    } else if (new Date(exportOptions.dateRange.start) >= new Date(exportOptions.dateRange.end)) {
      validationErrors.push('Start date must be before end date');
    }

    if (exportOptions.fields.length === 0) {
      validationErrors.push('At least one field must be selected');
    }

    const daysDiff = Math.ceil(
      (new Date(exportOptions.dateRange.end).getTime() - new Date(exportOptions.dateRange.start).getTime()) 
      / (1000 * 60 * 60 * 24)
    );
    
    if (daysDiff > 365) {
      validationErrors.push('Export range cannot exceed 365 days');
    }

    return validationErrors;
  };

  const handleExport = async () => {
    const validationErrors = validateExport();
    setErrors(validationErrors);
    
    if (validationErrors.length > 0) {
      return;
    }

    setIsExporting(true);
    try {
      await onExport(exportOptions);
      onClose();
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Export failed']);
    } finally {
      setIsExporting(false);
    }
  };

  const estimatedFileSize = () => {
    const avgRecordSize = exportOptions.includeMetadata ? 2048 : 1024; // bytes
    const estimatedRecords = Math.min(totalEntries, 50000); // Estimate based on filters
    const sizeBytes = estimatedRecords * avgRecordSize;
    
    if (sizeBytes > 1024 * 1024) {
      return `~${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      return `~${(sizeBytes / 1024).toFixed(0)} KB`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div style={{
        backgroundColor: 'var(--dashboard-bg-elevated)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)',
        width: '100%',
        maxWidth: '42rem',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-6)',
          borderBottom: '1px solid var(--dashboard-border-primary)'
        }}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--dashboard-text-primary)'
              }}>
                Export Audit Logs
              </h2>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--dashboard-text-secondary)'
              }}>
                {totalEntries.toLocaleString()} total entries available
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              color: 'var(--dashboard-text-tertiary)',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: 'transparent',
              padding: '0'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--dashboard-text-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--dashboard-text-tertiary)'}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Export Format */}
          <div>
            <label htmlFor="inputp29fej" style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--dashboard-text-primary)',
              marginBottom: 'var(--space-3)'
            }}>Export Format
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {EXPORT_FORMATS.map(format => (
                <label
                  key={format.value}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3)',
                    border: '1px solid var(--dashboard-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: hoveredFormat === format.value ? 'var(--dashboard-bg-hover)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 200ms'
                  }}
                  onMouseEnter={() => setHoveredFormat(format.value)}
                  onMouseLeave={() => setHoveredFormat(null)}
                >
                  <input id="inputp29fej"
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={exportOptions.format === format.value}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                    className="mt-1"
                  />
                  <div>
                    <div style={{
                      fontWeight: 'var(--font-medium)',
                      color: 'var(--dashboard-text-primary)'
                    }}>
                      {format.label}
                    </div>
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--dashboard-text-secondary)'
                    }}>
                      {format.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--dashboard-text-primary)',
              marginBottom: 'var(--space-3)'
            }}>
              Date Range
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="from" style={{
                  display: 'block',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--dashboard-text-tertiary)',
                  marginBottom: 'var(--space-1)'
                }}>From</label>
                <input id="from"
                  type="datetime-local"
                  value={exportOptions.dateRange.start.slice(0, 16)}
                  onChange={(e) => handleDateRangeChange('start', new Date(e.target.value).toISOString())}
                  style={{
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
              <div>
                <label htmlFor="to" style={{
                  display: 'block',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--dashboard-text-tertiary)',
                  marginBottom: 'var(--space-1)'
                }}>To</label>
                <input id="to"
                  type="datetime-local"
                  value={exportOptions.dateRange.end.slice(0, 16)}
                  onChange={(e) => handleDateRangeChange('end', new Date(e.target.value).toISOString())}
                  style={{
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
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                { label: 'Last 24 Hours', hours: 24 },
                { label: 'Last 7 Days', hours: 24 * 7 },
                { label: 'Last 30 Days', hours: 24 * 30 },
                { label: 'Last 90 Days', hours: 24 * 90 }
              ].map(({ label, hours }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    const end = new Date();
                    const start = new Date(end.getTime() - hours * 60 * 60 * 1000);
                    setExportOptions(prev => ({
                      ...prev,
                      dateRange: {
                        start: start.toISOString(),
                        end: end.toISOString()
                      }
                    }));
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

          {/* Field Groups */}
          <div>
            <label htmlFor="input8lq3e" style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--dashboard-text-primary)',
              marginBottom: 'var(--space-3)'
            }}>Data Fields
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {Object.entries(FIELD_GROUPS).map(([key, group]) => (
                <label
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3)',
                    border: '1px solid var(--dashboard-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: hoveredFieldGroup === key ? 'var(--dashboard-bg-hover)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 200ms'
                  }}
                  onMouseEnter={() => setHoveredFieldGroup(key)}
                  onMouseLeave={() => setHoveredFieldGroup(null)}
                >
                  <input id="input8lq3e"
                    type="radio"
                    name="fieldGroup"
                    value={key}
                    checked={selectedFieldGroup === key}
                    onChange={() => handleFieldGroupChange(key as keyof typeof FIELD_GROUPS)}
                    className="mt-1"
                  />
                  <div>
                    <div style={{
                      fontWeight: 'var(--font-medium)',
                      color: 'var(--dashboard-text-primary)'
                    }}>
                      {group.label}
                    </div>
                    <div style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--dashboard-text-secondary)'
                    }}>
                      {group.description} ({group.fields.length} fields)
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Options */}
          <div>
            <label htmlFor="input4oatlf" style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--dashboard-text-primary)',
              marginBottom: 'var(--space-3)'
            }}>Export Options
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <label className="flex items-center">
                <input id="input4oatlf"
                  type="checkbox"
                  checked={exportOptions.includeMetadata}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <div>
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--dashboard-text-primary)'
                  }}>Include metadata</span>
                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--dashboard-text-tertiary)'
                  }}>Session IDs, user agents, and additional context</p>
                </div>
              </label>

              <label htmlFor="inputscar2" className="flex items-center">
                <input id="inputscar2"
                  type="checkbox"
                  checked={exportOptions.includeSensitive}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeSensitive: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <div className="flex items-center space-x-2">
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--dashboard-text-primary)'
                  }}>Include sensitive data</span>
                  <Shield className="h-4 w-4 text-yellow-600" />
                </div>
              </label>

              {exportOptions.includeSensitive && (
                <div style={{
                  marginLeft: 'var(--space-6)',
                  padding: 'var(--space-3)',
                  backgroundColor: 'rgba(234, 179, 8, 0.1)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  borderRadius: 'var(--radius-lg)'
                }}>
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div style={{ fontSize: 'var(--text-sm)', color: '#854d0e' }}>
                      <p style={{ fontWeight: 'var(--font-medium)' }}>Sensitive Data Warning</p>
                      <p>This export will include sensitive information. Ensure proper data handling and storage procedures.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Export Preview */}
          <div style={{
            backgroundColor: 'var(--dashboard-bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)'
          }}>
            <h4 style={{
              fontWeight: 'var(--font-medium)',
              color: 'var(--dashboard-text-primary)',
              marginBottom: 'var(--space-2)'
            }}>Export Preview</h4>
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--dashboard-text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-1)'
            }}>
              <div>Format: {EXPORT_FORMATS.find(f => f.value === exportOptions.format)?.label}</div>
              <div>Fields: {exportOptions.fields.length} selected</div>
              <div>Estimated size: {estimatedFileSize()}</div>
              <div>Date range: {Math.ceil((new Date(exportOptions.dateRange.end).getTime() - new Date(exportOptions.dateRange.start).getTime()) / (1000 * 60 * 60 * 24))} days</div>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div style={{
              padding: 'var(--space-4)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h4 style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    color: '#7f1d1d',
                    marginBottom: 'var(--space-1)'
                  }}>
                    Please fix the following errors:
                  </h4>
                  <ul style={{ fontSize: 'var(--text-sm)', color: '#991b1b' }} className="space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 'var(--space-3)',
          padding: 'var(--space-6)',
          borderTop: '1px solid var(--dashboard-border-primary)'
        }}>
          <button
            onClick={onClose}
            disabled={isExporting}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              color: 'var(--dashboard-text-primary)',
              border: '1px solid var(--dashboard-border-primary)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: hoveredButton === 'cancel' ? 'var(--dashboard-bg-hover)' : 'transparent',
              opacity: isExporting ? 0.5 : 1,
              cursor: isExporting ? 'not-allowed' : 'pointer',
              transition: 'background-color 200ms'
            }}
            onMouseEnter={() => !isExporting && setHoveredButton('cancel')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || errors.length > 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}