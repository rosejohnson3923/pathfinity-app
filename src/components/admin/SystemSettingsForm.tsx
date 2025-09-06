import React from 'react';
import { Shield, Database, Server, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';
import { SystemSettings } from '../../types/settings';

interface SystemSettingsFormProps {
  settings: SystemSettings | null;
  onUpdate: (settings: Partial<SystemSettings>) => void;
  errors?: Partial<Record<keyof SystemSettings, string>>;
  disabled?: boolean;
}

export function SystemSettingsForm({ settings, onUpdate, errors, disabled }: SystemSettingsFormProps) {
  if (!settings) return null;

  return (
    <div className="space-y-8">
      {/* Maintenance Mode */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Maintenance Mode</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="showsmaintenancemess" className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Maintenance Mode
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Shows maintenance message to all users
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input id="showsmaintenancemess"
                type="checkbox"
                checked={settings.maintenance.enabled}
                onChange={(e) => onUpdate({
                  maintenance: { ...settings.maintenance, enabled: e.target.checked }
                })}
                disabled={disabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Maintenance Message
            </label>
            <textarea
              value={settings.maintenance.message}
              onChange={(e) => onUpdate({
                maintenance: { ...settings.maintenance, message: e.target.value }
              })}
              disabled={disabled}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Security</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Password Policy */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Password Policy</h4>
            
            <div>
              <label htmlFor="minimumlength" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Minimum Length
              </label><input id="minimumlength"
                type="number"
                value={settings.security.passwordPolicy.minLength}
                onChange={(e) => onUpdate({
                  security: {
                    ...settings.security,
                    passwordPolicy: {
                      ...settings.security.passwordPolicy,
                      minLength: parseInt(e.target.value)
                    }
                  }
                })}
                disabled={disabled}
                min="6"
                max="32"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>
            
            <div className="space-y-2">
              {[
                { key: 'requireUppercase', label: 'Require uppercase letters' },
                { key: 'requireLowercase', label: 'Require lowercase letters' },
                { key: 'requireNumbers', label: 'Require numbers' },
                { key: 'requireSpecialChars', label: 'Require special characters' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.security.passwordPolicy[key as keyof typeof settings.security.passwordPolicy] as boolean}
                    onChange={(e) => onUpdate({
                      security: {
                        ...settings.security,
                        passwordPolicy: {
                          ...settings.security.passwordPolicy,
                          [key]: e.target.checked
                        }
                      }
                    })}
                    disabled={disabled}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}
            </div>
            
            <div>
              <label htmlFor="passwordexpirationda" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password Expiration (days)
              </label><input id="passwordexpirationda"
                type="number"
                value={settings.security.passwordPolicy.expirationDays}
                onChange={(e) => onUpdate({
                  security: {
                    ...settings.security,
                    passwordPolicy: {
                      ...settings.security.passwordPolicy,
                      expirationDays: parseInt(e.target.value)
                    }
                  }
                })}
                disabled={disabled}
                min="0"
                max="365"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Set to 0 to disable password expiration
              </p>
            </div>
          </div>
          
          {/* Session & Login Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Session & Login</h4>
            
            <div>
              <label htmlFor="sessiontimeoutminute" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Session Timeout (minutes)
              </label><input id="sessiontimeoutminute"
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => onUpdate({
                  security: {
                    ...settings.security,
                    sessionTimeout: parseInt(e.target.value)
                  }
                })}
                disabled={disabled}
                min="15"
                max="1440"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>
            
            <div>
              <label htmlFor="maxloginattempts" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Login Attempts
              </label><input id="maxloginattempts"
                type="number"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => onUpdate({
                  security: {
                    ...settings.security,
                    maxLoginAttempts: parseInt(e.target.value)
                  }
                })}
                disabled={disabled}
                min="3"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>
            
            <div>
              <label htmlFor="accountlockoutdurati" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Lockout Duration (minutes)
              </label><input id="accountlockoutdurati"
                type="number"
                value={settings.security.lockoutDuration}
                onChange={(e) => onUpdate({
                  security: {
                    ...settings.security,
                    lockoutDuration: parseInt(e.target.value)
                  }
                })}
                disabled={disabled}
                min="5"
                max="120"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <div>
                <label htmlFor="input0tnion" className="text-sm font-medium text-gray-700 dark:text-gray-300">Require Two-Factor Authentication
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  All users must enable 2FA
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input id="input0tnion"
                  type="checkbox"
                  checked={settings.security.twoFactorRequired}
                  onChange={(e) => onUpdate({
                    security: {
                      ...settings.security,
                      twoFactorRequired: e.target.checked
                    }
                  })}
                  disabled={disabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Backup & Recovery</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="regularlybackupsyste" className="text-sm font-medium text-gray-700 dark:text-gray-300">Automatic Backups
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Regularly backup system data
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input id="regularlybackupsyste"
                type="checkbox"
                checked={settings.backup.enabled}
                onChange={(e) => onUpdate({
                  backup: { ...settings.backup, enabled: e.target.checked }
                })}
                disabled={disabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Backup Frequency
              </label>
              <select
                value={settings.backup.frequency}
                onChange={(e) => onUpdate({
                  backup: { ...settings.backup, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' }
                })}
                disabled={disabled || !settings.backup.enabled}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="retentionperioddays" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Retention Period (days)
              </label><input id="retentionperioddays"
                type="number"
                value={settings.backup.retention}
                onChange={(e) => onUpdate({
                  backup: { ...settings.backup, retention: parseInt(e.target.value) }
                })}
                disabled={disabled || !settings.backup.enabled}
                min="7"
                max="365"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>
          </div>
          
          {settings.backup.lastBackup && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Last backup: {new Date(settings.backup.lastBackup).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Performance Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Server className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Performance</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="speeduppageloads" className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Caching
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Speed up page loads
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input id="speeduppageloads"
                  type="checkbox"
                  checked={settings.performance.cacheEnabled}
                  onChange={(e) => onUpdate({
                    performance: { ...settings.performance, cacheEnabled: e.target.checked }
                  })}
                  disabled={disabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="reducebandwidthusage" className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Compression
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Reduce bandwidth usage
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input id="reducebandwidthusage"
                  type="checkbox"
                  checked={settings.performance.compressionEnabled}
                  onChange={(e) => onUpdate({
                    performance: { ...settings.performance, compressionEnabled: e.target.checked }
                  })}
                  disabled={disabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          {settings.performance.cacheEnabled && (
            <div>
              <label htmlFor="cachedurationminutes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cache Duration (minutes)
              </label><input id="cachedurationminutes"
                type="number"
                value={settings.performance.cacheDuration}
                onChange={(e) => onUpdate({
                  performance: { ...settings.performance, cacheDuration: parseInt(e.target.value) }
                })}
                disabled={disabled}
                min="5"
                max="1440"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
            </div>
          )}
        </div>
      </div>

      {/* Integrations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Wrench className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Integrations</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="syncstudentdatawithy" className="text-sm font-medium text-gray-700 dark:text-gray-300">Student Information System (SIS)
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sync student data with your SIS
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input id="syncstudentdatawithy"
                type="checkbox"
                checked={settings.integrations.sisEnabled}
                onChange={(e) => onUpdate({
                  integrations: { ...settings.integrations, sisEnabled: e.target.checked }
                })}
                disabled={disabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="allowuserstologinwit" className="text-sm font-medium text-gray-700 dark:text-gray-300">Single Sign-On (SSO)
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Allow users to login with SSO
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input id="allowuserstologinwit"
                type="checkbox"
                checked={settings.integrations.ssoEnabled}
                onChange={(e) => onUpdate({
                  integrations: { ...settings.integrations, ssoEnabled: e.target.checked }
                })}
                disabled={disabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="integratewithexterna" className="text-sm font-medium text-gray-700 dark:text-gray-300">Learning Management System (LMS)
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Integrate with external LMS
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input id="integratewithexterna"
                type="checkbox"
                checked={settings.integrations.lmsEnabled}
                onChange={(e) => onUpdate({
                  integrations: { ...settings.integrations, lmsEnabled: e.target.checked }
                })}
                disabled={disabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}