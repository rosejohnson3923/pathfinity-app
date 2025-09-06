import { User, UserRole, UserStatus } from './user';

export type BulkOperation = 
  | 'invite' 
  | 'suspend' 
  | 'activate' 
  | 'delete' 
  | 'export' 
  | 'changeRole' 
  | 'assignGrade' 
  | 'assignSubject'
  | 'sendMessage'
  | 'resetPassword';

export type BulkOperationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface BulkInviteData {
  recipients: Array<{
    email: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    grade?: string;
    subject?: string;
    department?: string;
  }>;
  message?: string;
  sendWelcomeEmail: boolean;
  requirePasswordChange: boolean;
}

export interface BulkRoleChangeData {
  newRole: UserRole;
  notifyUsers: boolean;
  reason?: string;
}

export interface BulkGradeAssignmentData {
  grade: string;
  notifyUsers: boolean;
}

export interface BulkSubjectAssignmentData {
  subject: string;
  department?: string;
  notifyUsers: boolean;
}

export interface BulkMessageData {
  subject: string;
  message: string;
  urgency: 'low' | 'normal' | 'high';
  sendEmail: boolean;
  sendInApp: boolean;
}

export interface BulkExportOptions {
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  fields: string[];
  includeInactive: boolean;
  includeDeleted: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface BulkOperationRequest {
  operation: BulkOperation;
  userIds: string[];
  data?: BulkInviteData | BulkRoleChangeData | BulkGradeAssignmentData | BulkSubjectAssignmentData | BulkMessageData | BulkExportOptions;
  scheduledFor?: string; // ISO string for scheduled operations
}

export interface BulkOperationResult {
  id: string;
  operation: BulkOperation;
  status: BulkOperationStatus;
  totalUsers: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
  progress: number; // 0-100
  startedAt: string;
  completedAt?: string;
  estimatedCompletionAt?: string;
  results: Array<{
    userId: string;
    userEmail: string;
    status: 'success' | 'failed' | 'skipped';
    message?: string;
    error?: string;
  }>;
  errors: string[];
  downloadUrl?: string; // For export operations
  createdBy: string;
}

export interface BulkOperationJob {
  id: string;
  operation: BulkOperation;
  status: BulkOperationStatus;
  progress: number;
  totalUsers: number;
  processedUsers: number;
  startedAt: string;
  estimatedTimeRemaining?: number; // in seconds
  canCancel: boolean;
  results?: BulkOperationResult;
}

// Predefined field sets for exports
export const EXPORT_FIELD_GROUPS = {
  basic: ['firstName', 'lastName', 'email', 'role', 'status'],
  contact: ['firstName', 'lastName', 'email', 'phone', 'address'],
  academic: ['firstName', 'lastName', 'email', 'role', 'grade', 'subject', 'department'],
  activity: ['firstName', 'lastName', 'email', 'lastLoginAt', 'createdAt', 'status'],
  complete: ['firstName', 'lastName', 'email', 'role', 'status', 'grade', 'subject', 'department', 'phone', 'address', 'lastLoginAt', 'createdAt', 'updatedAt']
};

export const BULK_OPERATION_LABELS: Record<BulkOperation, string> = {
  invite: 'Bulk Invite Users',
  suspend: 'Suspend Users',
  activate: 'Activate Users',
  delete: 'Delete Users',
  export: 'Export Users',
  changeRole: 'Change User Roles',
  assignGrade: 'Assign Grade Level',
  assignSubject: 'Assign Subject',
  sendMessage: 'Send Message',
  resetPassword: 'Reset Passwords'
};

export const BULK_OPERATION_DESCRIPTIONS: Record<BulkOperation, string> = {
  invite: 'Send invitations to new users to join the platform',
  suspend: 'Temporarily suspend user accounts and access',
  activate: 'Reactivate suspended or inactive user accounts',
  delete: 'Permanently delete user accounts and all associated data',
  export: 'Export user data in various formats for reporting',
  changeRole: 'Update user roles and permissions in bulk',
  assignGrade: 'Assign or update grade levels for multiple users',
  assignSubject: 'Assign subjects and departments to teachers',
  sendMessage: 'Send notifications or messages to multiple users',
  resetPassword: 'Force password reset for selected users'
};

export const BULK_OPERATION_ICONS: Record<BulkOperation, string> = {
  invite: 'UserPlus',
  suspend: 'UserX',
  activate: 'UserCheck',
  delete: 'Trash2',
  export: 'Download',
  changeRole: 'Shield',
  assignGrade: 'GraduationCap',
  assignSubject: 'BookOpen',
  sendMessage: 'MessageSquare',
  resetPassword: 'Key'
};

export const BULK_OPERATION_COLORS: Record<BulkOperation, string> = {
  invite: 'blue',
  suspend: 'yellow',
  activate: 'green',
  delete: 'red',
  export: 'purple',
  changeRole: 'indigo',
  assignGrade: 'teal',
  assignSubject: 'orange',
  sendMessage: 'cyan',
  resetPassword: 'pink'
};

// Validation and utility functions
export const validateBulkOperation = (operation: BulkOperation, userIds: string[], data?: any): string[] => {
  const errors: string[] = [];

  if (!userIds || userIds.length === 0) {
    errors.push('At least one user must be selected');
  }

  if (userIds.length > 1000) {
    errors.push('Cannot perform bulk operations on more than 1000 users at once');
  }

  switch (operation) {
    case 'invite':
      const inviteData = data as BulkInviteData;
      if (!inviteData?.recipients || inviteData.recipients.length === 0) {
        errors.push('At least one recipient is required for bulk invite');
      }
      inviteData?.recipients.forEach((recipient, index) => {
        if (!recipient.email) {
          errors.push(`Email is required for recipient ${index + 1}`);
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.email)) {
          errors.push(`Invalid email format for recipient ${index + 1}`);
        }
        if (!recipient.role) {
          errors.push(`Role is required for recipient ${index + 1}`);
        }
      });
      break;

    case 'changeRole':
      const roleData = data as BulkRoleChangeData;
      if (!roleData?.newRole) {
        errors.push('New role is required for role change operation');
      }
      break;

    case 'assignGrade':
      const gradeData = data as BulkGradeAssignmentData;
      if (!gradeData?.grade) {
        errors.push('Grade level is required for grade assignment');
      }
      break;

    case 'assignSubject':
      const subjectData = data as BulkSubjectAssignmentData;
      if (!subjectData?.subject) {
        errors.push('Subject is required for subject assignment');
      }
      break;

    case 'sendMessage':
      const messageData = data as BulkMessageData;
      if (!messageData?.subject?.trim()) {
        errors.push('Message subject is required');
      }
      if (!messageData?.message?.trim()) {
        errors.push('Message content is required');
      }
      break;

    case 'export':
      const exportData = data as BulkExportOptions;
      if (!exportData?.format) {
        errors.push('Export format is required');
      }
      if (!exportData?.fields || exportData.fields.length === 0) {
        errors.push('At least one field must be selected for export');
      }
      break;
  }

  return errors;
};

export const getBulkOperationRisks = (operation: BulkOperation, userCount: number): string[] => {
  const risks: string[] = [];

  switch (operation) {
    case 'delete':
      risks.push('This action cannot be undone');
      risks.push('All user data will be permanently deleted');
      if (userCount > 10) {
        risks.push(`You are about to delete ${userCount} users`);
      }
      break;

    case 'suspend':
      risks.push('Users will lose access to the platform immediately');
      risks.push('Active sessions will be terminated');
      break;

    case 'changeRole':
      risks.push('User permissions will change immediately');
      risks.push('Some users may lose access to certain features');
      break;

    case 'resetPassword':
      risks.push('Users will be forced to create new passwords');
      risks.push('Current sessions will be invalidated');
      break;

    case 'invite':
      if (userCount > 50) {
        risks.push(`This will send ${userCount} invitation emails`);
        risks.push('Consider sending invites in smaller batches');
      }
      break;
  }

  if (userCount > 100) {
    risks.push('Large bulk operations may take several minutes to complete');
  }

  return risks;
};

export const getRequiredPermissions = (operation: BulkOperation): string[] => {
  switch (operation) {
    case 'invite':
    case 'delete':
      return ['users:create', 'users:delete'];
    case 'suspend':
    case 'activate':
      return ['users:update'];
    case 'changeRole':
      return ['users:update', 'roles:assign'];
    case 'assignGrade':
    case 'assignSubject':
      return ['users:update'];
    case 'sendMessage':
      return ['notifications:send'];
    case 'resetPassword':
      return ['users:update', 'security:manage'];
    case 'export':
      return ['users:read', 'data:export'];
    default:
      return ['users:read'];
  }
};