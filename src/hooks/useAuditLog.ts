import { useState, useEffect, useCallback } from 'react';
import {
  AuditLogEntry,
  AuditLogFilters,
  AuditLogSearchParams,
  AuditLogSummary,
  AuditLogExportOptions,
  AuditAction,
  AuditSeverity,
  AuditCategory,
  getAuditActionSeverity,
  getAuditActionCategory,
  AUDIT_ACTION_DEFINITIONS
} from '../types/auditLog';

interface UseAuditLogReturn {
  auditLogs: AuditLogEntry[];
  searchParams: AuditLogSearchParams;
  totalEntries: number;
  totalPages: number;
  summary: AuditLogSummary | null;
  loading: boolean;
  error: string | null;
  setSearchParams: (params: AuditLogSearchParams) => void;
  searchAuditLogs: (query: string) => void;
  applyFilters: (filters: AuditLogFilters) => void;
  clearFilters: () => void;
  exportAuditLogs: (options: AuditLogExportOptions) => Promise<void>;
  logAction: (action: AuditAction, details: {
    targetId?: string;
    targetType?: 'user' | 'content' | 'tenant' | 'system' | 'integration';
    targetName?: string;
    targetEmail?: string;
    description: string;
    changes?: Record<string, { from: any; to: any }>;
    metadata?: Record<string, any>;
    bulkCount?: number;
    affectedItems?: string[];
  }) => Promise<void>;
  getSummary: () => Promise<void>;
  refreshLogs: () => void;
}

const generateMockAuditLogs = (count: number = 50): AuditLogEntry[] => {
  const actors = [
    { id: '1', email: 'admin@plainviewisd.edu', name: 'System Admin', role: 'system_admin' },
    { id: '2', email: 'principal@plainviewisd.edu', name: 'Principal Johnson', role: 'admin' },
    { id: '3', email: 'tech.coord@plainviewisd.edu', name: 'Tech Coordinator', role: 'admin' },
    { id: '4', email: 'teacher1@plainviewisd.edu', name: 'Sarah Wilson', role: 'teacher' }
  ];

  const actions: AuditAction[] = [
    'user:create', 'user:update', 'user:delete', 'user:suspend', 'user:activate', 'user:login', 'user:logout',
    'content:create', 'content:update', 'content:delete', 'content:publish', 'content:unpublish',
    'settings:update', 'auth:login_failed', 'auth:password_reset', 'permission:grant', 'permission:revoke',
    'bulk:invite', 'bulk:suspend', 'bulk:export', 'data:export'
  ];

  const ipAddresses = ['192.168.1.100', '10.0.0.45', '172.16.0.25', '192.168.1.101'];
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
  ];

  return Array.from({ length: count }, (_, index) => {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const actor = actors[Math.floor(Math.random() * actors.length)];
    const outcome = Math.random() > 0.1 ? 'success' : Math.random() > 0.5 ? 'failure' : 'partial';
    
    const actionDef = AUDIT_ACTION_DEFINITIONS[action];
    const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();

    return {
      id: `audit_${index + 1}`,
      timestamp,
      action,
      category: actionDef.category,
      severity: actionDef.defaultSeverity,
      actor: {
        id: actor.id,
        email: actor.email,
        name: actor.name,
        role: actor.role,
        ipAddress: ipAddresses[Math.floor(Math.random() * ipAddresses.length)],
        userAgent: userAgents[Math.floor(Math.random() * userAgents.length)]
      },
      target: actionDef.requiresTarget ? {
        type: action.startsWith('user:') ? 'user' : 
              action.startsWith('content:') ? 'content' :
              action.startsWith('tenant:') ? 'tenant' : 'system',
        id: `target_${Math.floor(Math.random() * 1000)}`,
        name: action.startsWith('user:') ? 'John Doe' : 
              action.startsWith('content:') ? 'Sample Content' : 'System Resource',
        email: action.startsWith('user:') ? 'john.doe@plainviewisd.edu' : undefined
      } : undefined,
      details: {
        description: generateActionDescription(action, actor.name),
        changes: action.includes('update') ? {
          status: { from: 'active', to: 'suspended' },
          role: { from: 'student', to: 'teacher' }
        } : undefined,
        metadata: {
          source: 'admin_dashboard',
          sessionDuration: Math.floor(Math.random() * 3600),
          browserInfo: userAgents[0].split(' ')[0]
        },
        bulkCount: action.startsWith('bulk:') ? Math.floor(Math.random() * 50) + 5 : undefined,
        affectedItems: action.startsWith('bulk:') ? 
          Array.from({ length: 3 }, (_, i) => `user_${i + 1}@plainviewisd.edu`) : undefined
      },
      outcome,
      errorMessage: outcome === 'failure' ? 'Operation failed due to insufficient permissions' : undefined,
      sessionId: `session_${Math.floor(Math.random() * 10000)}`,
      tenantId: 'plainview_isd',
      compliance: {
        retention: actionDef.retentionDays,
        exportable: true,
        sensitive: actionDef.sensitive
      }
    };
  });
};

const generateActionDescription = (action: AuditAction, actorName: string): string => {
  const descriptions: Record<string, string> = {
    'user:create': `${actorName} created a new user account`,
    'user:update': `${actorName} updated user profile information`,
    'user:delete': `${actorName} permanently deleted a user account`,
    'user:suspend': `${actorName} suspended a user account`,
    'user:activate': `${actorName} activated a user account`,
    'user:login': `${actorName} successfully logged into the system`,
    'user:logout': `${actorName} logged out of the system`,
    'content:create': `${actorName} created new content`,
    'content:update': `${actorName} modified existing content`,
    'content:delete': `${actorName} removed content from the system`,
    'content:publish': `${actorName} published content`,
    'content:unpublish': `${actorName} unpublished content`,
    'settings:update': `${actorName} modified system settings`,
    'auth:login_failed': `Failed login attempt for ${actorName}`,
    'auth:password_reset': `${actorName} initiated a password reset`,
    'permission:grant': `${actorName} granted permissions to a user`,
    'permission:revoke': `${actorName} revoked permissions from a user`,
    'bulk:invite': `${actorName} performed bulk user invitation`,
    'bulk:suspend': `${actorName} suspended multiple users`,
    'bulk:export': `${actorName} exported user data`,
    'data:export': `${actorName} exported system data`
  };
  
  return descriptions[action] || `${actorName} performed ${action}`;
};

const generateMockSummary = (logs: AuditLogEntry[]): AuditLogSummary => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Count actions
  const actionCounts = logs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {} as Record<AuditAction, number>);

  const topActions = Object.entries(actionCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([action, count]) => ({
      action: action as AuditAction,
      count,
      percentage: Math.round((count / logs.length) * 100)
    }));

  // Count actors
  const actorCounts = logs.reduce((acc, log) => {
    const key = log.actor.id;
    if (!acc[key]) {
      acc[key] = {
        actorId: log.actor.id,
        actorName: log.actor.name,
        actorEmail: log.actor.email,
        actionCount: 0,
        lastActivity: log.timestamp
      };
    }
    acc[key].actionCount++;
    if (new Date(log.timestamp) > new Date(acc[key].lastActivity)) {
      acc[key].lastActivity = log.timestamp;
    }
    return acc;
  }, {} as Record<string, any>);

  const topActors = Object.values(actorCounts)
    .sort((a: any, b: any) => b.actionCount - a.actionCount)
    .slice(0, 5);

  // Severity breakdown
  const severityBreakdown = logs.reduce((acc, log) => {
    acc[log.severity] = (acc[log.severity] || 0) + 1;
    return acc;
  }, {} as Record<AuditSeverity, number>);

  // Category breakdown
  const categoryBreakdown = logs.reduce((acc, log) => {
    acc[log.category] = (acc[log.category] || 0) + 1;
    return acc;
  }, {} as Record<AuditCategory, number>);

  // Outcome breakdown
  const outcomeBreakdown = logs.reduce((acc, log) => {
    acc[log.outcome] = (acc[log.outcome] || 0) + 1;
    return acc;
  }, {} as Record<'success' | 'failure' | 'partial', number>);

  // Activity trend (last 7 days)
  const activityTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayLogs = logs.filter(log => 
      new Date(log.timestamp).toDateString() === date.toDateString()
    );
    
    return {
      date: date.toISOString().split('T')[0],
      totalActions: dayLogs.length,
      criticalActions: dayLogs.filter(log => log.severity === 'critical').length,
      failedActions: dayLogs.filter(log => log.outcome === 'failure').length
    };
  }).reverse();

  // Security alerts
  const securityAlerts = [
    {
      type: 'multiple_failed_logins' as const,
      count: logs.filter(log => log.action === 'auth:login_failed').length,
      lastOccurrence: logs.find(log => log.action === 'auth:login_failed')?.timestamp || now.toISOString(),
      severity: 'medium' as AuditSeverity
    },
    {
      type: 'privilege_escalation' as const,
      count: logs.filter(log => log.action === 'permission:grant' && log.severity === 'high').length,
      lastOccurrence: logs.find(log => log.action === 'permission:grant')?.timestamp || now.toISOString(),
      severity: 'high' as AuditSeverity
    }
  ].filter(alert => alert.count > 0);

  return {
    totalEntries: logs.length,
    timeRange: {
      start: thirtyDaysAgo.toISOString(),
      end: now.toISOString()
    },
    topActions,
    topActors,
    severityBreakdown,
    categoryBreakdown,
    outcomeBreakdown,
    activityTrend,
    securityAlerts
  };
};

export function useAuditLog(): UseAuditLogReturn {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [searchParams, setSearchParams] = useState<AuditLogSearchParams>({
    page: 1,
    limit: 25,
    sortBy: 'timestamp',
    sortOrder: 'desc'
  });
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [summary, setSummary] = useState<AuditLogSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allLogs] = useState(() => generateMockAuditLogs(200)); // Generate once

  const loadAuditLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      let filteredLogs = [...allLogs];

      // Apply filters
      if (searchParams.filters) {
        const { filters } = searchParams;
        
        if (filters.actions?.length) {
          filteredLogs = filteredLogs.filter(log => filters.actions!.includes(log.action));
        }
        
        if (filters.categories?.length) {
          filteredLogs = filteredLogs.filter(log => filters.categories!.includes(log.category));
        }
        
        if (filters.severities?.length) {
          filteredLogs = filteredLogs.filter(log => filters.severities!.includes(log.severity));
        }
        
        if (filters.actors?.length) {
          filteredLogs = filteredLogs.filter(log => 
            filters.actors!.includes(log.actor.id) || filters.actors!.includes(log.actor.email)
          );
        }
        
        if (filters.outcomes?.length) {
          filteredLogs = filteredLogs.filter(log => filters.outcomes!.includes(log.outcome));
        }
        
        if (filters.dateRange) {
          const start = new Date(filters.dateRange.start);
          const end = new Date(filters.dateRange.end);
          filteredLogs = filteredLogs.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate >= start && logDate <= end;
          });
        }
        
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredLogs = filteredLogs.filter(log => 
            log.details.description.toLowerCase().includes(searchLower) ||
            log.actor.name.toLowerCase().includes(searchLower) ||
            log.actor.email.toLowerCase().includes(searchLower) ||
            (log.target?.name?.toLowerCase().includes(searchLower))
          );
        }
      }

      // Apply sorting
      filteredLogs.sort((a, b) => {
        const aVal = a[searchParams.sortBy];
        const bVal = b[searchParams.sortBy];
        
        if (searchParams.sortOrder === 'desc') {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        } else {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        }
      });

      // Apply pagination
      const startIndex = (searchParams.page - 1) * searchParams.limit;
      const paginatedLogs = filteredLogs.slice(startIndex, startIndex + searchParams.limit);

      setAuditLogs(paginatedLogs);
      setTotalEntries(filteredLogs.length);
      setTotalPages(Math.ceil(filteredLogs.length / searchParams.limit));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [searchParams, allLogs]);

  const getSummary = useCallback(async () => {
    try {
      // Generate summary from all logs
      const summaryData = generateMockSummary(allLogs);
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to load audit summary:', err);
    }
  }, [allLogs]);

  const searchAuditLogs = useCallback((query: string) => {
    setSearchParams(prev => ({
      ...prev,
      page: 1,
      filters: { ...prev.filters, search: query }
    }));
  }, []);

  const applyFilters = useCallback((filters: AuditLogFilters) => {
    setSearchParams(prev => ({
      ...prev,
      page: 1,
      filters
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchParams(prev => ({
      ...prev,
      page: 1,
      filters: undefined
    }));
  }, []);

  const exportAuditLogs = useCallback(async (options: AuditLogExportOptions) => {
    setLoading(true);
    try {
      // Simulate export API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would generate and download the file
      const filename = `audit_logs_${new Date().toISOString().split('T')[0]}.${options.format}`;
      console.log(`Exporting audit logs as ${filename}`);
      
      // Create a mock download
      const blob = new Blob(['Mock audit log export data'], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const logAction = useCallback(async (action: AuditAction, details: {
    targetId?: string;
    targetType?: 'user' | 'content' | 'tenant' | 'system' | 'integration';
    targetName?: string;
    targetEmail?: string;
    description: string;
    changes?: Record<string, { from: any; to: any }>;
    metadata?: Record<string, any>;
    bulkCount?: number;
    affectedItems?: string[];
  }) => {
    try {
      // In a real implementation, this would call the API
      const newEntry: AuditLogEntry = {
        id: `audit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action,
        category: getAuditActionCategory(action),
        severity: getAuditActionSeverity(action),
        actor: {
          id: '1', // Would come from auth context
          email: 'admin@plainviewisd.edu',
          name: 'Current User',
          role: 'admin',
          ipAddress: '192.168.1.100',
          userAgent: navigator.userAgent
        },
        target: details.targetId ? {
          type: details.targetType || 'system',
          id: details.targetId,
          name: details.targetName,
          email: details.targetEmail
        } : undefined,
        details: {
          description: details.description,
          changes: details.changes,
          metadata: details.metadata,
          bulkCount: details.bulkCount,
          affectedItems: details.affectedItems
        },
        outcome: 'success',
        sessionId: `session_${Date.now()}`,
        tenantId: 'plainview_isd',
        compliance: {
          retention: AUDIT_ACTION_DEFINITIONS[action]?.retentionDays || 365,
          exportable: true,
          sensitive: AUDIT_ACTION_DEFINITIONS[action]?.sensitive || false
        }
      };

      console.log('Audit log entry created:', newEntry);
    } catch (err) {
      console.error('Failed to log audit action:', err);
    }
  }, []);

  const refreshLogs = useCallback(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  useEffect(() => {
    getSummary();
  }, [getSummary]);

  return {
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
    logAction,
    getSummary,
    refreshLogs
  };
}