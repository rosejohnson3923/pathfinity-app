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
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security Settings</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage district security policies and compliance</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {hasUnsavedChanges && (
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>

      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-600">Secure</span>
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white">Overall Status</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">All security measures active</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <span className="text-2xl font-bold text-yellow-600">{unresolvedAlerts.length}</span>
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white">Active Alerts</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{criticalAlerts.length} critical</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">98.5%</span>
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white">2FA Adoption</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">1,228 of 1,248 users</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-purple-600">242</span>
          </div>
          <h3 className="font-medium text-gray-900 dark:text-white">Days Until Audit</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Sep 15, 2024</p>
        </div>
      </div>

      {/* Security Alerts */}
      {unresolvedAlerts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Alerts</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {unresolvedAlerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className={`flex items-start gap-3 p-4 rounded-lg border ${
                  alert.type === 'critical' ? 'border-red-200 bg-red-50' :
                  alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                  'border-blue-200 bg-blue-50'
                }`}>
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{alert.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{alert.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{formatTimestamp(alert.timestamp)}</p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto">
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
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center gap-2 ${
                activeSection === id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Sections */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Compliance Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">FERPA Compliant</span>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">COPPA Compliant</span>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">GDPR Compliant</span>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300">Last Security Audit</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(config.compliance.lastSecurityAudit)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Export Security Report</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Generate comprehensive security report</div>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">View Audit Logs</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Review recent security events</div>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Configure Alerts</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Set up security notifications</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'passwords' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Password Policy Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="minimumpasswordlengt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Minimum Password Length
              </label><input id="minimumpasswordlengt"
                type="number"
                min="8"
                max="32"
                value={config.passwordPolicy.minLength}
                onChange={(e) => handleConfigChange('passwordPolicy', 'minLength', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="passwordexpirydays" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password Expiry (days)
              </label><input id="passwordexpirydays"
                type="number"
                min="30"
                max="365"
                value={config.passwordPolicy.passwordExpiry}
                onChange={(e) => handleConfigChange('passwordPolicy', 'passwordExpiry', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Require Uppercase Letters</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">At least one uppercase letter (A-Z)</div>
              </div>
              <label htmlFor="input00cdxu" className="relative inline-flex items-center cursor-pointer"><input id="input00cdxu"
                  type="checkbox"
                  checked={config.passwordPolicy.requireUppercase}
                  onChange={(e) => handleConfigChange('passwordPolicy', 'requireUppercase', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Require Special Characters</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">At least one special character (!@#$%^&*)</div>
              </div>
              <label htmlFor="inputdlkola" className="relative inline-flex items-center cursor-pointer"><input id="inputdlkola"
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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Two-Factor Authentication</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Enable Two-Factor Authentication</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Require additional verification for all users</div>
              </div>
              <label htmlFor="inputkbb56u" className="relative inline-flex items-center cursor-pointer"><input id="inputkbb56u"
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
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Authentication Methods</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
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
                      <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <label htmlFor="email-2fa" className="text-gray-900 dark:text-white">Email verification</label>
                    </div>
                    <div className="flex items-center gap-3">
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
                      <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <label htmlFor="sms-2fa" className="text-gray-900 dark:text-white">SMS verification</label>
                    </div>
                    <div className="flex items-center gap-3">
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
                      <Fingerprint className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <label htmlFor="authenticator-2fa" className="text-gray-900 dark:text-white">Authenticator app</label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeSection === 'access' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Access Control Settings</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="maxfailedloginattemp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Failed Login Attempts
                </label><input id="maxfailedloginattemp"
                  type="number"
                  min="3"
                  max="10"
                  value={config.accessControl.maxFailedAttempts}
                  onChange={(e) => handleConfigChange('accessControl', 'maxFailedAttempts', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="lockoutdurationminut" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lockout Duration (minutes)
                </label><input id="lockoutdurationminut"
                  type="number"
                  min="5"
                  max="1440"
                  value={config.accessControl.lockoutDuration}
                  onChange={(e) => handleConfigChange('accessControl', 'lockoutDuration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Block Suspicious Login Attempts</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Automatically block login attempts from suspicious locations</div>
              </div>
              <label htmlFor="input6dfzu" className="relative inline-flex items-center cursor-pointer"><input id="input6dfzu"
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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Data Protection Settings</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Encryption at Rest</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Database encryption</div>
                </div>
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Encryption in Transit</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">TLS/SSL encryption</div>
                </div>
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Backup Encryption</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Encrypted backups</div>
                </div>
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>

            <div>
              <label htmlFor="dataretentionperiodd" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data Retention Period (days)
              </label><input id="dataretentionperiodd"
                type="number"
                min="30"
                max="3650"
                value={config.dataProtection.dataRetentionPeriod}
                onChange={(e) => handleConfigChange('dataProtection', 'dataRetentionPeriod', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Currently set to {Math.round(config.dataProtection.dataRetentionPeriod / 365)} years
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'compliance' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Compliance & Auditing</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 border border-gray-200 dark:border-gray-600 rounded-lg">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h4 className="font-medium text-gray-900 dark:text-white">FERPA</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Educational Privacy</p>
                <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Compliant</span>
              </div>
              <div className="text-center p-6 border border-gray-200 dark:border-gray-600 rounded-lg">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h4 className="font-medium text-gray-900 dark:text-white">COPPA</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Children's Privacy</p>
                <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Compliant</span>
              </div>
              <div className="text-center p-6 border border-gray-200 dark:border-gray-600 rounded-lg">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h4 className="font-medium text-gray-900 dark:text-white">GDPR</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Data Protection</p>
                <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Compliant</span>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">Security Audits</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Security Audit</label>
                  <p className="text-lg text-gray-900 dark:text-white">{formatDate(config.compliance.lastSecurityAudit)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Next Scheduled Audit</label>
                  <p className="text-lg text-gray-900 dark:text-white">{formatDate(config.compliance.nextScheduledAudit)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}