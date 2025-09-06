import { useState, useCallback } from 'react';
import {
  BulkOperation,
  BulkOperationRequest,
  BulkOperationResult,
  BulkOperationJob,
  BulkInviteData,
  BulkRoleChangeData,
  BulkGradeAssignmentData,
  BulkSubjectAssignmentData,
  BulkMessageData,
  BulkExportOptions,
  validateBulkOperation
} from '../types/bulkOperations';

interface UseBulkOperationsReturn {
  activeJobs: BulkOperationJob[];
  completedOperations: BulkOperationResult[];
  loading: boolean;
  error: string | null;
  executeBulkOperation: (request: BulkOperationRequest) => Promise<BulkOperationJob>;
  cancelBulkOperation: (jobId: string) => Promise<void>;
  getBulkOperationResult: (jobId: string) => Promise<BulkOperationResult>;
  getJobProgress: (jobId: string) => BulkOperationJob | null;
  clearCompletedOperations: () => void;
  downloadExportFile: (resultId: string) => Promise<void>;
}

// Mock job storage
let mockJobs: BulkOperationJob[] = [];
let mockResults: BulkOperationResult[] = [];
let jobIdCounter = 1;

const generateMockJobId = () => `bulk-job-${jobIdCounter++}`;

const simulateJobProgress = (jobId: string, totalUsers: number, operation: BulkOperation): void => {
  const job = mockJobs.find(j => j.id === jobId);
  if (!job) return;

  const progressInterval = setInterval(() => {
    const currentJob = mockJobs.find(j => j.id === jobId);
    if (!currentJob || currentJob.status !== 'processing') {
      clearInterval(progressInterval);
      return;
    }

    // Simulate progress
    const increment = Math.random() * 15 + 5; // 5-20% increments
    currentJob.progress = Math.min(currentJob.progress + increment, 100);
    currentJob.processedUsers = Math.round((currentJob.progress / 100) * totalUsers);
    
    const remainingProgress = 100 - currentJob.progress;
    const avgTimePerPercent = 100; // 100ms per percent
    currentJob.estimatedTimeRemaining = Math.round((remainingProgress * avgTimePerPercent) / 1000);

    // Complete the job when progress reaches 100%
    if (currentJob.progress >= 100) {
      currentJob.status = 'completed';
      currentJob.progress = 100;
      currentJob.processedUsers = totalUsers;
      currentJob.estimatedTimeRemaining = 0;
      currentJob.canCancel = false;

      // Generate mock results
      const results: BulkOperationResult = {
        id: generateMockJobId(),
        operation,
        status: 'completed',
        totalUsers,
        successCount: Math.floor(totalUsers * 0.95), // 95% success rate
        failureCount: Math.floor(totalUsers * 0.03), // 3% failure rate
        skippedCount: Math.floor(totalUsers * 0.02), // 2% skipped
        progress: 100,
        startedAt: currentJob.startedAt,
        completedAt: new Date().toISOString(),
        results: Array.from({ length: totalUsers }, (_, i) => ({
          userId: `user-${i + 1}`,
          userEmail: `user${i + 1}@example.com`,
          status: Math.random() > 0.05 ? 'success' : Math.random() > 0.5 ? 'failed' : 'skipped',
          message: Math.random() > 0.05 ? 'Operation completed successfully' : 'Failed to process user',
          error: Math.random() <= 0.03 ? 'Network timeout' : undefined
        })),
        errors: operation === 'delete' ? ['Cannot delete admin users'] : [],
        downloadUrl: operation === 'export' ? `/api/exports/${jobId}/download` : undefined,
        createdBy: 'admin@example.com'
      };

      currentJob.results = results;
      mockResults.push(results);
      clearInterval(progressInterval);
    }
  }, 200); // Update every 200ms
};

export function useBulkOperations(): UseBulkOperationsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeBulkOperation = useCallback(async (request: BulkOperationRequest): Promise<BulkOperationJob> => {
    try {
      setLoading(true);
      setError(null);

      // Validate the operation
      const validationErrors = validateBulkOperation(request.operation, request.userIds, request.data);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Create a new job
      const jobId = generateMockJobId();
      const job: BulkOperationJob = {
        id: jobId,
        operation: request.operation,
        status: 'processing',
        progress: 0,
        totalUsers: request.userIds.length,
        processedUsers: 0,
        startedAt: new Date().toISOString(),
        estimatedTimeRemaining: request.userIds.length * 100, // 100ms per user estimate
        canCancel: true
      };

      mockJobs.push(job);

      // Simulate async processing
      setTimeout(() => {
        simulateJobProgress(jobId, request.userIds.length, request.operation);
      }, 100);

      return job;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute bulk operation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelBulkOperation = useCallback(async (jobId: string): Promise<void> => {
    try {
      const job = mockJobs.find(j => j.id === jobId);
      if (job && job.canCancel) {
        job.status = 'cancelled';
        job.canCancel = false;
      }
    } catch (err) {
      setError('Failed to cancel bulk operation');
      throw err;
    }
  }, []);

  const getBulkOperationResult = useCallback(async (jobId: string): Promise<BulkOperationResult> => {
    const job = mockJobs.find(j => j.id === jobId);
    if (!job || !job.results) {
      throw new Error('Operation result not found');
    }
    return job.results;
  }, []);

  const getJobProgress = useCallback((jobId: string): BulkOperationJob | null => {
    return mockJobs.find(j => j.id === jobId) || null;
  }, []);

  const clearCompletedOperations = useCallback(() => {
    mockJobs = mockJobs.filter(job => job.status === 'processing');
    mockResults = [];
  }, []);

  const downloadExportFile = useCallback(async (resultId: string): Promise<void> => {
    try {
      setLoading(true);
      
      // Simulate file download
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock download
      const blob = new Blob(['Mock CSV data'], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bulk-export-${resultId}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download export file');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    activeJobs: mockJobs.filter(job => ['processing', 'pending'].includes(job.status)),
    completedOperations: mockResults,
    loading,
    error,
    executeBulkOperation,
    cancelBulkOperation,
    getBulkOperationResult,
    getJobProgress,
    clearCompletedOperations,
    downloadExportFile
  };
}

// Utility functions for specific bulk operations
export const createBulkInviteRequest = (
  emails: string[],
  inviteData: Omit<BulkInviteData, 'recipients'> & { defaultRole: string; defaultGrade?: string; defaultSubject?: string; }
): BulkOperationRequest => {
  const recipients = emails.map(email => ({
    email,
    role: inviteData.defaultRole as any,
    grade: inviteData.defaultGrade,
    subject: inviteData.defaultSubject
  }));

  return {
    operation: 'invite',
    userIds: [], // Not needed for invite
    data: {
      recipients,
      message: inviteData.message,
      sendWelcomeEmail: inviteData.sendWelcomeEmail,
      requirePasswordChange: inviteData.requirePasswordChange
    } as BulkInviteData
  };
};

export const createBulkRoleChangeRequest = (
  userIds: string[],
  newRole: string,
  options: { notifyUsers?: boolean; reason?: string } = {}
): BulkOperationRequest => ({
  operation: 'changeRole',
  userIds,
  data: {
    newRole: newRole as any,
    notifyUsers: options.notifyUsers ?? true,
    reason: options.reason
  } as BulkRoleChangeData
});

export const createBulkSuspendRequest = (userIds: string[]): BulkOperationRequest => ({
  operation: 'suspend',
  userIds
});

export const createBulkActivateRequest = (userIds: string[]): BulkOperationRequest => ({
  operation: 'activate',
  userIds
});

export const createBulkDeleteRequest = (userIds: string[]): BulkOperationRequest => ({
  operation: 'delete',
  userIds
});

export const createBulkExportRequest = (
  userIds: string[],
  options: BulkExportOptions
): BulkOperationRequest => ({
  operation: 'export',
  userIds,
  data: options
});

export const createBulkMessageRequest = (
  userIds: string[],
  messageData: BulkMessageData
): BulkOperationRequest => ({
  operation: 'sendMessage',
  userIds,
  data: messageData
});

export const createBulkPasswordResetRequest = (userIds: string[]): BulkOperationRequest => ({
  operation: 'resetPassword',
  userIds
});