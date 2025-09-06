import React, { useState } from 'react';
import { X, AlertTriangle, Users, Mail, UserX, UserCheck, Trash2, Download, Shield, GraduationCap, BookOpen, MessageSquare, Key } from 'lucide-react';
import {
  BulkOperation,
  BulkOperationRequest,
  BulkInviteData,
  BulkRoleChangeData,
  BulkGradeAssignmentData,
  BulkSubjectAssignmentData,
  BulkMessageData,
  BulkExportOptions,
  BULK_OPERATION_LABELS,
  BULK_OPERATION_DESCRIPTIONS,
  getBulkOperationRisks,
  validateBulkOperation,
  EXPORT_FIELD_GROUPS
} from '../../../types/bulkOperations';
import { UserRole } from '../../../types/user';

interface BulkOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  operation: BulkOperation;
  selectedUserIds: string[];
  selectedUserEmails: string[];
  onExecute: (request: BulkOperationRequest) => Promise<void>;
  isLoading?: boolean;
}

const OPERATION_ICONS: Record<BulkOperation, any> = {
  invite: Mail,
  suspend: UserX,
  activate: UserCheck,
  delete: Trash2,
  export: Download,
  changeRole: Shield,
  assignGrade: GraduationCap,
  assignSubject: BookOpen,
  sendMessage: MessageSquare,
  resetPassword: Key
};

const GRADE_OPTIONS = [
  'Pre-K', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade',
  '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade',
  '11th Grade', '12th Grade'
];

const SUBJECT_OPTIONS = [
  'Mathematics', 'Science', 'English Language Arts', 'Social Studies', 'Art', 'Music',
  'Physical Education', 'Computer Science', 'Foreign Language', 'Special Education'
];

export function BulkOperationModal({
  isOpen,
  onClose,
  operation,
  selectedUserIds,
  selectedUserEmails,
  onExecute,
  isLoading = false
}: BulkOperationModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [csvInput, setCsvInput] = useState('');

  const Icon = OPERATION_ICONS[operation];
  const userCount = selectedUserIds.length;
  const risks = getBulkOperationRisks(operation, userCount);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const validateForm = (): boolean => {
    const validationErrors = validateBulkOperation(operation, selectedUserIds, formData);
    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const request: BulkOperationRequest = {
      operation,
      userIds: selectedUserIds,
      data: formData
    };

    try {
      await onExecute(request);
      onClose();
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Operation failed']);
    }
  };

  const parseCsvEmails = (csvText: string): Array<{ email: string; firstName?: string; lastName?: string }> => {
    const lines = csvText.trim().split('\n');
    const results: Array<{ email: string; firstName?: string; lastName?: string }> = [];
    
    lines.forEach((line, index) => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      if (values[0] && values[0].includes('@')) {
        results.push({
          email: values[0],
          firstName: values[1] || undefined,
          lastName: values[2] || undefined
        });
      }
    });
    
    return results;
  };

  const renderOperationForm = () => {
    switch (operation) {
      case 'invite':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="input03q9ip" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Invitation Method
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input id="input03q9ip"
                    type="radio"
                    name="inviteMethod"
                    value="manual"
                    checked={formData.inviteMethod !== 'csv'}
                    onChange={() => handleInputChange('inviteMethod', 'manual')}
                    className="mr-2"
                  />
                  Manual Entry
                </label>
                <label htmlFor="inputjnlxu" className="flex items-center"><input id="inputjnlxu"
                    type="radio"
                    name="inviteMethod"
                    value="csv"
                    checked={formData.inviteMethod === 'csv'}
                    onChange={() => handleInputChange('inviteMethod', 'csv')}
                    className="mr-2"
                  />
                  CSV Import
                </label>
              </div>
            </div>

            {formData.inviteMethod === 'csv' ? (
              <div>
                <label htmlFor="emailaddresses" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CSV Data (Email, First Name, Last Name)
                </label>
                <textarea
                  value={csvInput}
                  onChange={(e) => {
                    setCsvInput(e.target.value);
                    const parsed = parseCsvEmails(e.target.value);
                    handleInputChange('recipients', parsed.map(p => ({
                      ...p,
                      role: formData.defaultRole || 'student'
                    })));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={6}
                  placeholder="john.doe@example.com,John,Doe
jane.smith@example.com,Jane,Smith"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Format: email,firstName,lastName (one per line)
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Addresses
                </label>
                <textarea
                  value={formData.emailList || ''}
                  onChange={(e) => {
                    const emails = e.target.value.split('\n').map(email => email.trim()).filter(Boolean);
                    handleInputChange('emailList', e.target.value);
                    handleInputChange('recipients', emails.map(email => ({
                      email,
                      role: formData.defaultRole || 'student'
                    })));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows={4}
                  placeholder="Enter email addresses (one per line)"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Role
                </label>
                <select
                  value={formData.defaultRole || 'student'}
                  onChange={(e) => handleInputChange('defaultRole', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="staff">Staff</option>
                  <option value="parent">Parent</option>
                </select>
              </div>

              {formData.defaultRole === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Grade
                  </label>
                  <select
                    value={formData.defaultGrade || ''}
                    onChange={(e) => handleInputChange('defaultGrade', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select grade</option>
                    {GRADE_OPTIONS.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.defaultRole === 'teacher' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Subject
                  </label>
                  <select
                    value={formData.defaultSubject || ''}
                    onChange={(e) => handleInputChange('defaultSubject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select subject</option>
                    {SUBJECT_OPTIONS.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Welcome Message (Optional)
              </label>
              <textarea
                value={formData.message || ''}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder="Welcome to our platform! Please check your email for login instructions."
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input id="emailaddresses"
                  type="checkbox"
                  checked={formData.sendWelcomeEmail ?? true}
                  onChange={(e) => handleInputChange('sendWelcomeEmail', e.target.checked)}
                  className="mr-2"
                />
                Send welcome email
              </label>
              <label htmlFor="input3dhkoh" className="flex items-center"><input id="input3dhkoh"
                  type="checkbox"
                  checked={formData.requirePasswordChange ?? true}
                  onChange={(e) => handleInputChange('requirePasswordChange', e.target.checked)}
                  className="mr-2"
                />
                Require password change on first login
              </label>
            </div>
          </div>
        );

      case 'changeRole':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="selectnewrole" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Role
              </label>
              <select
                value={formData.newRole || ''}
                onChange={(e) => handleInputChange('newRole', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select new role</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="staff">Staff</option>
                <option value="admin">Administrator</option>
                <option value="parent">Parent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for Change (Optional)
              </label>
              <textarea
                value={formData.reason || ''}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder="Enter reason for role change"
              />
            </div>

            <label className="flex items-center">
              <input id="selectnewrole"
                type="checkbox"
                checked={formData.notifyUsers ?? true}
                onChange={(e) => handleInputChange('notifyUsers', e.target.checked)}
                className="mr-2"
              />
              Notify users of role change
            </label>
          </div>
        );

      case 'assignGrade':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="selectgradelevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Grade Level
              </label>
              <select
                value={formData.grade || ''}
                onChange={(e) => handleInputChange('grade', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select grade level</option>
                {GRADE_OPTIONS.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center">
              <input id="selectgradelevel"
                type="checkbox"
                checked={formData.notifyUsers ?? true}
                onChange={(e) => handleInputChange('notifyUsers', e.target.checked)}
                className="mr-2"
              />
              Notify users of grade assignment
            </label>
          </div>
        );

      case 'assignSubject':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <select
                value={formData.subject || ''}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select subject</option>
                {SUBJECT_OPTIONS.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="departmentoptional" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department (Optional)
              </label><input id="departmentoptional"
                type="text"
                value={formData.department || ''}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter department name"
              />
            </div>

            <label htmlFor="input44q6l" className="flex items-center"><input id="input44q6l"
                type="checkbox"
                checked={formData.notifyUsers ?? true}
                onChange={(e) => handleInputChange('notifyUsers', e.target.checked)}
                className="mr-2"
              />
              Notify users of subject assignment
            </label>
          </div>
        );

      case 'sendMessage':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject *
              </label><input id="subject"
                type="text"
                value={formData.subject || ''}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter message subject"
              />
            </div>

            <div>
              <label htmlFor="urgencylevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message *
              </label>
              <textarea
                value={formData.message || ''}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                rows={5}
                placeholder="Enter your message"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Urgency Level
              </label>
              <select
                value={formData.urgency || 'normal'}
                onChange={(e) => handleInputChange('urgency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="low">Low Priority</option>
                <option value="normal">Normal Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input id="urgencylevel"
                  type="checkbox"
                  checked={formData.sendEmail ?? true}
                  onChange={(e) => handleInputChange('sendEmail', e.target.checked)}
                  className="mr-2"
                />
                Send via email
              </label>
              <label htmlFor="input5tn80s" className="flex items-center"><input id="input5tn80s"
                  type="checkbox"
                  checked={formData.sendInApp ?? true}
                  onChange={(e) => handleInputChange('sendInApp', e.target.checked)}
                  className="mr-2"
                />
                Send as in-app notification
              </label>
            </div>
          </div>
        );

      case 'export':
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="csv" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Export Format
              </label>
              <select
                value={formData.format || 'csv'}
                onChange={(e) => handleInputChange('format', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="csv">CSV</option>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="json">JSON</option>
                <option value="pdf">PDF Report</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Field Groups
              </label>
              <div className="space-y-2">
                {Object.entries(EXPORT_FIELD_GROUPS).map(([key, fields]) => (
                  <label key={key} className="flex items-center">
                    <input id="csv"
                      type="radio"
                      name="fieldGroup"
                      value={key}
                      checked={formData.fieldGroup === key}
                      onChange={(e) => {
                        handleInputChange('fieldGroup', e.target.value);
                        handleInputChange('fields', fields);
                      }}
                      className="mr-2"
                    />
                    <span className="capitalize">{key}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      ({fields.length} fields)
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="inputdfwxer" className="flex items-center"><input id="inputdfwxer"
                  type="checkbox"
                  checked={formData.includeInactive ?? false}
                  onChange={(e) => handleInputChange('includeInactive', e.target.checked)}
                  className="mr-2"
                />
                Include inactive users
              </label>
              <label htmlFor="input1pkhr3" className="flex items-center"><input id="input1pkhr3"
                  type="checkbox"
                  checked={formData.includeDeleted ?? false}
                  onChange={(e) => handleInputChange('includeDeleted', e.target.checked)}
                  className="mr-2"
                />
                Include deleted users
              </label>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              No additional configuration required for this operation.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {BULK_OPERATION_LABELS[operation]}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {userCount} user{userCount !== 1 ? 's' : ''} selected
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
        <div className="p-6">
          {/* Description */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              {BULK_OPERATION_DESCRIPTIONS[operation]}
            </p>
          </div>

          {/* Risks Warning */}
          {risks.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-200 mb-1">
                    Important Warnings
                  </h4>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                    {risks.map((risk, index) => (
                      <li key={index}>• {risk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          {renderOperationForm()}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
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
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              `Execute Operation`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}