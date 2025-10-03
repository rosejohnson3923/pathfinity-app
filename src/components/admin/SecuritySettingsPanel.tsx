import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Upload,
  Clock,
  Users,
  Database,
  Globe,
  Settings,
  Mail,
  Bell,
  Smartphone,
  Fingerprint,
  Calendar,
  Activity,
  XCircle,
  Save
} from 'lucide-react';
import '../../design-system/tokens/colors.css';
import '../../design-system/tokens/spacing.css';
import '../../design-system/tokens/borders.css';
import '../../design-system/tokens/typography.css';
import '../../design-system/tokens/shadows.css';
import '../../design-system/tokens/dashboard.css';

interface SecurityConfig {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    passwordExpiry: number; // days
    preventReuse: number; // last N passwords
  };
  twoFactorAuth: {
    enabled: boolean;
    required: boolean;
    methods: ('sms' | 'email' | 'authenticator')[];
  };
  sessionManagement: {
    maxSessions: number;
    sessionTimeout: number; // minutes
    idleTimeout: number; // minutes
    forceLogoutOnPasswordChange: boolean;
  };
  accessControl: {
    ipWhitelist: string[];
    blockSuspiciousLogins: boolean;
    maxFailedAttempts: number;
    lockoutDuration: number; // minutes
    requireEmailVerification: boolean;
  };
  dataProtection: {
    encryptionAtRest: boolean;
    encryptionInTransit: boolean;
    backupEncryption: boolean;
    dataRetentionPeriod: number; // days
    automaticBackups: boolean;
  };
  auditLogs: {
    enabled: boolean;
    retentionPeriod: number; // days
    alertOnSuspiciousActivity: boolean;
    emailNotifications: boolean;
  };
  compliance: {
    ferpaCompliant: boolean;
    coppaCompliant: boolean;
    gdprCompliant: boolean;
    lastSecurityAudit: string;
    nextScheduledAudit: string;
  };
}

interface SecurityAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  resolved: boolean;
}

// Mock security configuration
const mockSecurityConfig: SecurityConfig = {
  passwordPolicy: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    passwordExpiry: 90,
    preventReuse: 5
  },
  twoFactorAuth: {
    enabled: true,
    required: true,
    methods: ['email', 'authenticator']
  },
  sessionManagement: {
    maxSessions: 3,
    sessionTimeout: 480, // 8 hours
    idleTimeout: 60,
    forceLogoutOnPasswordChange: true
  },
  accessControl: {
    ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
    blockSuspiciousLogins: true,
    maxFailedAttempts: 5,
    lockoutDuration: 30,
    requireEmailVerification: true
  },
  dataProtection: {
    encryptionAtRest: true,
    encryptionInTransit: true,
    backupEncryption: true,
    dataRetentionPeriod: 2555, // 7 years
    automaticBackups: true
  },
  auditLogs: {
    enabled: true,
    retentionPeriod: 1095, // 3 years
    alertOnSuspiciousActivity: true,
    emailNotifications: true
  },
  compliance: {
    ferpaCompliant: true,
    coppaCompliant: true,
    gdprCompliant: true,
    lastSecurityAudit: '2023-09-15',
    nextScheduledAudit: '2024-09-15'
  }
};

const mockSecurityAlerts: SecurityAlert[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Multiple Failed Login Attempts',
    description: '15 failed login attempts detected from IP 192.168.1.105 in the last hour',
    timestamp: '2024-01-15T10:30:00Z',
    resolved: false
  },
  {
    id: '2',
    type: 'info',
    title: 'Security Audit Scheduled',
    description: 'Annual security audit scheduled for September 15, 2024',
    timestamp: '2024-01-14T14:20:00Z',
    resolved: true
  },
  {
    id: '3',
    type: 'critical',
    title: 'Unusual Access Pattern Detected',
    description: 'Administrator account accessed from new location: Houston, TX',
    timestamp: '2024-01-13T22:15:00Z',
    resolved: true
  }
];

export function SecuritySettingsPanel() {
  const [config, setConfig] = useState<SecurityConfig>(mockSecurityConfig);
  const [alerts] = useState<SecurityAlert[]>(mockSecurityAlerts);
  const [activeSection, setActiveSection] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const getTabStyle = (isActive: boolean) => ({
    padding: 'var(--space-4) var(--space-1)',
    borderBottom: isActive ? '2px solid var(--dashboard-nav-tab-active)' : '2px solid transparent',
    fontWeight: 'var(--font-medium)',
    fontSize: 'var(--text-sm)',
    whiteSpace: 'nowrap' as const,
    color: isActive ? 'var(--dashboard-nav-tab-active)' : 'var(--dashboard-nav-tab-inactive)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    transition: 'color 200ms ease',
    border: 'none'
  });

  const handleConfigChange = (section: keyof SecurityConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setHasUnsavedChanges(false);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle style={{ width: '1.25rem', height: '1.25rem', color: '#DC2626' }} />;
      case 'warning':
        return <AlertTriangle style={{ width: '1.25rem', height: '1.25rem', color: '#D97706' }} />;
      case 'info':
        return <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#2563EB' }} />;
      default:
        return <AlertTriangle style={{ width: '1.25rem', height: '1.25rem', color: '#4B5563' }} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unresolvedAlerts = alerts.filter(alert => !alert.resolved);
  const criticalAlerts = unresolvedAlerts.filter(alert => alert.type === 'critical');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>Security Settings</h2>
          <p style={{ color: 'var(--dashboard-text-secondary)', marginTop: 'var(--space-1)' }}>Manage district security policies and compliance</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              border: '1px solid var(--dashboard-border-primary)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'transparent',
              color: 'var(--dashboard-text-secondary)',
              cursor: 'pointer',
              opacity: isLoading ? 0.5 : 1
            }}
            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = 'var(--dashboard-bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <RefreshCw style={{ width: '1rem', height: '1rem', animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          {hasUnsavedChanges && (
            <button
              onClick={handleSave}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-4)',
                backgroundColor: '#2563EB',
                color: 'white',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                cursor: 'pointer',
                opacity: isLoading ? 0.5 : 1
              }}
              onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#1D4ED8')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563EB')}
            >
              <Save style={{ width: '1rem', height: '1rem' }} />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>

      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <Shield style={{ width: '2rem', height: '2rem', color: '#16A34A' }} />
            <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#16A34A' }}>Secure</span>
          </div>
          <h3 style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Overall Status</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>All security measures active</p>
        </div>

        <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <AlertTriangle style={{ width: '2rem', height: '2rem', color: '#D97706' }} />
            <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#D97706' }}>{unresolvedAlerts.length}</span>
          </div>
          <h3 style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Active Alerts</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>{criticalAlerts.length} critical</p>
        </div>

        <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <Users style={{ width: '2rem', height: '2rem', color: '#2563EB' }} />
            <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#2563EB' }}>98.5%</span>
          </div>
          <h3 style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>2FA Adoption</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>1,228 of 1,248 users</p>
        </div>

        <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <Calendar style={{ width: '2rem', height: '2rem', color: '#9333EA' }} />
            <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#9333EA' }}>242</span>
          </div>
          <h3 style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Days Until Audit</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Sep 15, 2024</p>
        </div>
      </div>

      {/* Security Alerts */}
      {unresolvedAlerts.length > 0 && (
        <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)' }}>
          <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--dashboard-border-primary)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)' }}>Security Alerts</h3>
          </div>
          <div style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {unresolvedAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  border: alert.type === 'critical' ? '1px solid #FECACA' :
                         alert.type === 'warning' ? '1px solid #FEF3C7' :
                         '1px solid #BFDBFE',
                  backgroundColor: alert.type === 'critical' ? '#FEF2F2' :
                                  alert.type === 'warning' ? '#FFFBEB' :
                                  '#EFF6FF'
                }}>
                  {getAlertIcon(alert.type)}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>{alert.title}</h4>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-tertiary)', marginTop: 'var(--space-1)' }}>{alert.description}</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: '#6B7280', marginTop: 'var(--space-2)' }}>{formatTimestamp(alert.timestamp)}</p>
                  </div>
                  <button
                    style={{
                      color: '#9CA3AF',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#4B5563'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                  >
                    <XCircle style={{ width: '1.25rem', height: '1.25rem' }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ borderBottom: '1px solid var(--dashboard-border-primary)' }}>
        <nav style={{ display: 'flex', gap: 'var(--space-8)', overflowX: 'auto' }}>
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'passwords', label: 'Password Policy', icon: Lock },
            { id: 'authentication', label: 'Authentication', icon: Key },
            { id: 'access', label: 'Access Control', icon: Users },
            { id: 'data', label: 'Data Protection', icon: Database },
            { id: 'compliance', label: 'Compliance', icon: CheckCircle }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              style={getTabStyle(activeSection === id)}
              onMouseEnter={(e) => activeSection !== id && (e.currentTarget.style.color = 'var(--dashboard-nav-tab-hover)')}
              onMouseLeave={(e) => activeSection !== id && (e.currentTarget.style.color = 'var(--dashboard-nav-tab-inactive)')}
            >
              <Icon style={{ width: '1rem', height: '1rem' }} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Sections */}
      {activeSection === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Status */}
            <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)', padding: 'var(--space-6)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)', marginBottom: 'var(--space-4)' }}>Compliance Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--dashboard-text-secondary)' }}>FERPA Compliant</span>
                  <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#16A34A' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--dashboard-text-secondary)' }}>COPPA Compliant</span>
                  <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#16A34A' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--dashboard-text-secondary)' }}>GDPR Compliant</span>
                  <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#16A34A' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--dashboard-text-secondary)' }}>Last Security Audit</span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>{formatDate(config.compliance.lastSecurityAudit)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)', padding: 'var(--space-6)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)', marginBottom: 'var(--space-4)' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <button
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3)',
                    textAlign: 'left',
                    border: '1px solid var(--dashboard-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--dashboard-bg-elevated)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--dashboard-bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--dashboard-bg-elevated)'}
                >
                  <Download style={{ width: '1.25rem', height: '1.25rem', color: 'var(--dashboard-text-tertiary)' }} />
                  <div>
                    <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Export Security Report</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Generate comprehensive security report</div>
                  </div>
                </button>
                <button
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3)',
                    textAlign: 'left',
                    border: '1px solid var(--dashboard-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--dashboard-bg-elevated)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--dashboard-bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--dashboard-bg-elevated)'}
                >
                  <Activity style={{ width: '1.25rem', height: '1.25rem', color: 'var(--dashboard-text-tertiary)' }} />
                  <div>
                    <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>View Audit Logs</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Review recent security events</div>
                  </div>
                </button>
                <button
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3)',
                    textAlign: 'left',
                    border: '1px solid var(--dashboard-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--dashboard-bg-elevated)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--dashboard-bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--dashboard-bg-elevated)'}
                >
                  <Bell style={{ width: '1.25rem', height: '1.25rem', color: 'var(--dashboard-text-tertiary)' }} />
                  <div>
                    <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Configure Alerts</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Set up security notifications</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'passwords' && (
        <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)', padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)', marginBottom: 'var(--space-6)' }}>Password Policy Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="minimumpasswordlengt" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-2)' }}>Minimum Password Length
              </label>
              <input id="minimumpasswordlengt"
                type="number"
                min="8"
                max="32"
                value={config.passwordPolicy.minLength}
                onChange={(e) => handleConfigChange('passwordPolicy', 'minLength', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  border: '1px solid var(--dashboard-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--dashboard-bg-elevated)',
                  color: 'var(--dashboard-text-primary)',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#2563EB'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--dashboard-border-primary)'}
              />
            </div>
            <div>
              <label htmlFor="passwordexpirydays" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-2)' }}>Password Expiry (days)
              </label>
              <input id="passwordexpirydays"
                type="number"
                min="30"
                max="365"
                value={config.passwordPolicy.passwordExpiry}
                onChange={(e) => handleConfigChange('passwordPolicy', 'passwordExpiry', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  border: '1px solid var(--dashboard-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--dashboard-bg-elevated)',
                  color: 'var(--dashboard-text-primary)',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#2563EB'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--dashboard-border-primary)'}
              />
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Require Uppercase Letters</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>At least one uppercase letter (A-Z)</div>
              </div>
              <label htmlFor="input00cdxu" className="relative inline-flex items-center cursor-pointer">
                <input id="input00cdxu"
                  type="checkbox"
                  checked={config.passwordPolicy.requireUppercase}
                  onChange={(e) => handleConfigChange('passwordPolicy', 'requireUppercase', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Require Special Characters</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>At least one special character (!@#$%^&*)</div>
              </div>
              <label htmlFor="inputdlkola" className="relative inline-flex items-center cursor-pointer">
                <input id="inputdlkola"
                  type="checkbox"
                  checked={config.passwordPolicy.requireSpecialChars}
                  onChange={(e) => handleConfigChange('passwordPolicy', 'requireSpecialChars', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'authentication' && (
        <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)', padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)', marginBottom: 'var(--space-6)' }}>Two-Factor Authentication</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Enable Two-Factor Authentication</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Require additional verification for all users</div>
              </div>
              <label htmlFor="inputkbb56u" className="relative inline-flex items-center cursor-pointer">
                <input id="inputkbb56u"
                  type="checkbox"
                  checked={config.twoFactorAuth.enabled}
                  onChange={(e) => handleConfigChange('twoFactorAuth', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {config.twoFactorAuth.enabled && (
              <>
                <div style={{ borderTop: '1px solid var(--dashboard-border-primary)', paddingTop: 'var(--space-6)' }}>
                  <h4 style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)', marginBottom: 'var(--space-4)' }}>Authentication Methods</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <input
                        type="checkbox"
                        id="email-2fa"
                        checked={config.twoFactorAuth.methods.includes('email')}
                        onChange={(e) => {
                          const methods = e.target.checked
                            ? [...config.twoFactorAuth.methods, 'email']
                            : config.twoFactorAuth.methods.filter(m => m !== 'email');
                          handleConfigChange('twoFactorAuth', 'methods', methods);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Mail style={{ width: '1.25rem', height: '1.25rem', color: 'var(--dashboard-text-tertiary)' }} />
                      <label htmlFor="email-2fa" style={{ color: 'var(--dashboard-text-primary)' }}>Email verification</label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <input
                        type="checkbox"
                        id="sms-2fa"
                        checked={config.twoFactorAuth.methods.includes('sms')}
                        onChange={(e) => {
                          const methods = e.target.checked
                            ? [...config.twoFactorAuth.methods, 'sms']
                            : config.twoFactorAuth.methods.filter(m => m !== 'sms');
                          handleConfigChange('twoFactorAuth', 'methods', methods);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Smartphone style={{ width: '1.25rem', height: '1.25rem', color: 'var(--dashboard-text-tertiary)' }} />
                      <label htmlFor="sms-2fa" style={{ color: 'var(--dashboard-text-primary)' }}>SMS verification</label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <input
                        type="checkbox"
                        id="authenticator-2fa"
                        checked={config.twoFactorAuth.methods.includes('authenticator')}
                        onChange={(e) => {
                          const methods = e.target.checked
                            ? [...config.twoFactorAuth.methods, 'authenticator']
                            : config.twoFactorAuth.methods.filter(m => m !== 'authenticator');
                          handleConfigChange('twoFactorAuth', 'methods', methods);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Fingerprint style={{ width: '1.25rem', height: '1.25rem', color: 'var(--dashboard-text-tertiary)' }} />
                      <label htmlFor="authenticator-2fa" style={{ color: 'var(--dashboard-text-primary)' }}>Authenticator app</label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeSection === 'access' && (
        <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)', padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)', marginBottom: 'var(--space-6)' }}>Access Control Settings</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="maxfailedloginattemp" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-2)' }}>Max Failed Login Attempts
                </label>
                <input id="maxfailedloginattemp"
                  type="number"
                  min="3"
                  max="10"
                  value={config.accessControl.maxFailedAttempts}
                  onChange={(e) => handleConfigChange('accessControl', 'maxFailedAttempts', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    border: '1px solid var(--dashboard-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--dashboard-bg-elevated)',
                    color: 'var(--dashboard-text-primary)',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#2563EB'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--dashboard-border-primary)'}
                />
              </div>
              <div>
                <label htmlFor="lockoutdurationminut" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-2)' }}>Lockout Duration (minutes)
                </label>
                <input id="lockoutdurationminut"
                  type="number"
                  min="5"
                  max="1440"
                  value={config.accessControl.lockoutDuration}
                  onChange={(e) => handleConfigChange('accessControl', 'lockoutDuration', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    border: '1px solid var(--dashboard-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--dashboard-bg-elevated)',
                    color: 'var(--dashboard-text-primary)',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#2563EB'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--dashboard-border-primary)'}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Block Suspicious Login Attempts</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Automatically block login attempts from suspicious locations</div>
              </div>
              <label htmlFor="input6dfzu" className="relative inline-flex items-center cursor-pointer">
                <input id="input6dfzu"
                  type="checkbox"
                  checked={config.accessControl.blockSuspiciousLogins}
                  onChange={(e) => handleConfigChange('accessControl', 'blockSuspiciousLogins', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'data' && (
        <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)', padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)', marginBottom: 'var(--space-6)' }}>Data Protection Settings</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', border: '1px solid var(--dashboard-border-primary)', borderRadius: 'var(--radius-lg)' }}>
                <div>
                  <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Encryption at Rest</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Database encryption</div>
                </div>
                <CheckCircle style={{ width: '1.5rem', height: '1.5rem', color: '#16A34A' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', border: '1px solid var(--dashboard-border-primary)', borderRadius: 'var(--radius-lg)' }}>
                <div>
                  <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Encryption in Transit</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>TLS/SSL encryption</div>
                </div>
                <CheckCircle style={{ width: '1.5rem', height: '1.5rem', color: '#16A34A' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', border: '1px solid var(--dashboard-border-primary)', borderRadius: 'var(--radius-lg)' }}>
                <div>
                  <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Backup Encryption</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Encrypted backups</div>
                </div>
                <CheckCircle style={{ width: '1.5rem', height: '1.5rem', color: '#16A34A' }} />
              </div>
            </div>

            <div>
              <label htmlFor="dataretentionperiodd" style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-2)' }}>Data Retention Period (days)
              </label>
              <input id="dataretentionperiodd"
                type="number"
                min="30"
                max="3650"
                value={config.dataProtection.dataRetentionPeriod}
                onChange={(e) => handleConfigChange('dataProtection', 'dataRetentionPeriod', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  border: '1px solid var(--dashboard-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--dashboard-bg-elevated)',
                  color: 'var(--dashboard-text-primary)',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#2563EB'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--dashboard-border-primary)'}
              />
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-tertiary)', marginTop: 'var(--space-1)' }}>
                Currently set to {Math.round(config.dataProtection.dataRetentionPeriod / 365)} years
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'compliance' && (
        <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--dashboard-border-primary)', padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)', marginBottom: 'var(--space-6)' }}>Compliance & Auditing</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div style={{ textAlign: 'center', padding: 'var(--space-6)', border: '1px solid var(--dashboard-border-primary)', borderRadius: 'var(--radius-lg)' }}>
                <CheckCircle style={{ width: '3rem', height: '3rem', color: '#16A34A', margin: '0 auto var(--space-3)' }} />
                <h4 style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>FERPA</h4>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Educational Privacy</p>
                <span style={{ display: 'inline-block', marginTop: 'var(--space-2)', padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)', backgroundColor: '#DCFCE7', color: '#166534', borderRadius: '9999px' }}>Compliant</span>
              </div>
              <div style={{ textAlign: 'center', padding: 'var(--space-6)', border: '1px solid var(--dashboard-border-primary)', borderRadius: 'var(--radius-lg)' }}>
                <CheckCircle style={{ width: '3rem', height: '3rem', color: '#16A34A', margin: '0 auto var(--space-3)' }} />
                <h4 style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>COPPA</h4>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Children's Privacy</p>
                <span style={{ display: 'inline-block', marginTop: 'var(--space-2)', padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)', backgroundColor: '#DCFCE7', color: '#166534', borderRadius: '9999px' }}>Compliant</span>
              </div>
              <div style={{ textAlign: 'center', padding: 'var(--space-6)', border: '1px solid var(--dashboard-border-primary)', borderRadius: 'var(--radius-lg)' }}>
                <CheckCircle style={{ width: '3rem', height: '3rem', color: '#16A34A', margin: '0 auto var(--space-3)' }} />
                <h4 style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>GDPR</h4>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>Data Protection</p>
                <span style={{ display: 'inline-block', marginTop: 'var(--space-2)', padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)', backgroundColor: '#DCFCE7', color: '#166534', borderRadius: '9999px' }}>Compliant</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--dashboard-border-primary)', paddingTop: 'var(--space-6)' }}>
              <h4 style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)', marginBottom: 'var(--space-4)' }}>Security Audits</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-1)' }}>Last Security Audit</label>
                  <p style={{ fontSize: 'var(--text-lg)', color: 'var(--dashboard-text-primary)' }}>{formatDate(config.compliance.lastSecurityAudit)}</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-1)' }}>Next Scheduled Audit</label>
                  <p style={{ fontSize: 'var(--text-lg)', color: 'var(--dashboard-text-primary)' }}>{formatDate(config.compliance.nextScheduledAudit)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}