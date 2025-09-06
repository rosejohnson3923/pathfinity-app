import React, { useState } from 'react';
import { X, Download, Calendar, FileText, Shield, AlertTriangle } from 'lucide-react';
import {
  AuditLogExportOptions,
  AuditLogFilters,
  AuditLogEntry
} from '../../../types/auditLog';

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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Download className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Export Audit Logs
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {totalEntries.toLocaleString()} total entries available
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Export Format */}
          <div>
            <label htmlFor="inputp29fej" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Export Format
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {EXPORT_FORMATS.map(format => (
                <label key={format.value} className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <input id="inputp29fej"
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={exportOptions.format === format.value}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {format.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {format.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Date Range
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="from" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From</label><input id="from"
                  type="datetime-local"
                  value={exportOptions.dateRange.start.slice(0, 16)}
                  onChange={(e) => handleDateRangeChange('start', new Date(e.target.value).toISOString())}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="to" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">To</label><input id="to"
                  type="datetime-local"
                  value={exportOptions.dateRange.end.slice(0, 16)}
                  onChange={(e) => handleDateRangeChange('end', new Date(e.target.value).toISOString())}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Field Groups */}
          <div>
            <label htmlFor="input8lq3e" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Data Fields
            </label>
            <div className="space-y-3">
              {Object.entries(FIELD_GROUPS).map(([key, group]) => (
                <label key={key} className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                  <input id="input8lq3e"
                    type="radio"
                    name="fieldGroup"
                    value={key}
                    checked={selectedFieldGroup === key}
                    onChange={() => handleFieldGroupChange(key as keyof typeof FIELD_GROUPS)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {group.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {group.description} ({group.fields.length} fields)
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Options */}
          <div>
            <label htmlFor="input4oatlf" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Export Options
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input id="input4oatlf"
                  type="checkbox"
                  checked={exportOptions.includeMetadata}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Include metadata</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Session IDs, user agents, and additional context</p>
                </div>
              </label>
              
              <label htmlFor="inputscar2" className="flex items-center"><input id="inputscar2"
                  type="checkbox"
                  checked={exportOptions.includeSensitive}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, includeSensitive: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                />
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Include sensitive data</span>
                  <Shield className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
              </label>
              
              {exportOptions.includeSensitive && (
                <div className="ml-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      <p className="font-medium">Sensitive Data Warning</p>
                      <p>This export will include sensitive information. Ensure proper data handling and storage procedures.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Export Preview */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Export Preview</h4>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div>Format: {EXPORT_FORMATS.find(f => f.value === exportOptions.format)?.label}</div>
              <div>Fields: {exportOptions.fields.length} selected</div>
              <div>Estimated size: {estimatedFileSize()}</div>
              <div>Date range: {Math.ceil((new Date(exportOptions.dateRange.end).getTime() - new Date(exportOptions.dateRange.start).getTime()) / (1000 * 60 * 60 * 24))} days</div>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-900 dark:text-red-200 mb-1">
                    Please fix the following errors:
                  </h4>
                  <ul className="text-sm text-red-800 dark:text-red-300 space-y-1">
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
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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