import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Clock, Download, AlertTriangle, Users, Pause } from 'lucide-react';
import {
  BulkOperationJob,
  BulkOperationResult,
  BULK_OPERATION_LABELS,
  BULK_OPERATION_ICONS
} from '../../../types/bulkOperations';

interface BulkOperationProgressProps {
  jobs: BulkOperationJob[];
  completedOperations: BulkOperationResult[];
  onCancel: (jobId: string) => void;
  onDownload: (resultId: string) => void;
  onClear: () => void;
}

export function BulkOperationProgress({
  jobs,
  completedOperations,
  onCancel,
  onDownload,
  onClear
}: BulkOperationProgressProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedResult, setSelectedResult] = useState<BulkOperationResult | null>(null);

  const hasActiveJobs = jobs.some(job => job.status === 'processing');
  const hasCompletedOperations = completedOperations.length > 0;

  // Auto-expand when there are active jobs
  useEffect(() => {
    if (hasActiveJobs) {
      setIsExpanded(true);
    }
  }, [hasActiveJobs]);

  if (!hasActiveJobs && !hasCompletedOperations) {
    return null;
  }

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'completed':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'failed':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'cancelled':
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const renderJobItem = (job: BulkOperationJob) => (
    <div key={job.id} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getStatusColor(job.status)}`}>
            {job.status === 'processing' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            ) : job.status === 'completed' ? (
              <CheckCircle className="h-4 w-4" />
            ) : job.status === 'failed' ? (
              <XCircle className="h-4 w-4" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              {BULK_OPERATION_LABELS[job.operation]}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {job.processedUsers} of {job.totalUsers} users processed
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {job.status === 'processing' && job.estimatedTimeRemaining && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ~{formatTimeRemaining(job.estimatedTimeRemaining)} remaining
            </span>
          )}
          {job.canCancel && (
            <button
              onClick={() => onCancel(job.id)}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              title="Cancel operation"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
          <span>Progress</span>
          <span>{Math.round(job.progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${job.progress}%` }}
          />
        </div>
      </div>

      {/* Results Summary (for completed jobs) */}
      {job.results && (
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex space-x-4">
            <span className="text-green-600 dark:text-green-400">
              ✓ {job.results.successCount} successful
            </span>
            {job.results.failureCount > 0 && (
              <span className="text-red-600 dark:text-red-400">
                ✗ {job.results.failureCount} failed
              </span>
            )}
            {job.results.skippedCount > 0 && (
              <span className="text-yellow-600 dark:text-yellow-400">
                ⚠ {job.results.skippedCount} skipped
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedResult(job.results!)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View Details
            </button>
            {job.results.downloadUrl && (
              <button
                onClick={() => onDownload(job.results!.id)}
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
              >
                Download
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Floating Progress Panel */}
      <div className="fixed bottom-4 right-4 z-40 max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                {hasActiveJobs ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {hasActiveJobs ? 'Operations Running' : 'Operations Complete'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {jobs.length + completedOperations.length} total operations
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {hasCompletedOperations && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  title="Clear completed operations"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <span className="text-gray-400">
                {isExpanded ? '▼' : '▲'}
              </span>
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3 max-h-96 overflow-y-auto">
              {/* Active Jobs */}
              {jobs.map(renderJobItem)}
              
              {/* Completed Operations Summary */}
              {completedOperations.map((result) => (
                <div key={result.id} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                          {BULK_OPERATION_LABELS[result.operation]}
                        </h5>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {result.successCount}/{result.totalUsers} successful
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedResult(result)}
                        className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Details
                      </button>
                      {result.downloadUrl && (
                        <button
                          onClick={() => onDownload(result.id)}
                          className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                        >
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results Detail Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {BULK_OPERATION_LABELS[selectedResult.operation]} Results
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Completed {new Date(selectedResult.completedAt!).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Summary Stats */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedResult.totalUsers}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {selectedResult.successCount}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {selectedResult.failureCount}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {selectedResult.skippedCount}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Skipped</div>
                </div>
              </div>
            </div>

            {/* Results Table */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {selectedResult.errors.length > 0 && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <h4 className="text-sm font-medium text-red-900 dark:text-red-200 mb-2">
                      Operation Errors
                    </h4>
                    <ul className="text-sm text-red-800 dark:text-red-300 space-y-1">
                      {selectedResult.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          User
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Message
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {selectedResult.results.map((result, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {result.userEmail}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              result.status === 'success' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : result.status === 'failed'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            }`}>
                              {result.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {result.message || result.error || 'No message'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              {selectedResult.downloadUrl && (
                <button
                  onClick={() => onDownload(selectedResult.id)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Report</span>
                </button>
              )}
              <button
                onClick={() => setSelectedResult(null)}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}