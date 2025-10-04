import React, { useState } from 'react';
import { Shield, Database, Server, Wrench, AlertTriangle, CheckCircle } from 'lucide-react';
import { SystemSettings } from '../../types/settings';
import '../../design-system/tokens/colors.css';
import '../../design-system/tokens/spacing.css';
import '../../design-system/tokens/borders.css';
import '../../design-system/tokens/typography.css';
import '../../design-system/tokens/shadows.css';
import '../../design-system/tokens/dashboard.css';

interface SystemSettingsFormProps {
  settings: SystemSettings | null;
  onUpdate: (settings: Partial<SystemSettings>) => void;
  errors?: Partial<Record<keyof SystemSettings, string>>;
  disabled?: boolean;
}

export function SystemSettingsForm({ settings, onUpdate, errors, disabled }: SystemSettingsFormProps) {
  const [hoveredInput, setHoveredInput] = useState<string | null>(null);

  if (!settings) return null;

  const cardStyles: React.CSSProperties = {
    backgroundColor: 'var(--dashboard-bg-elevated)',
    borderRadius: 'var(--radius-lg)',
    border: `1px solid var(--dashboard-border-primary)`,
    padding: 'var(--space-6)'
  };

  const sectionHeaderStyles: React.CSSProperties = {
    fontSize: 'var(--text-lg)',
    fontWeight: 'var(--font-medium)',
    color: 'var(--dashboard-text-primary)'
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-medium)',
    color: 'var(--dashboard-text-primary)',
    marginBottom: 'var(--space-1)'
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: 'var(--text-sm)',
    color: 'var(--dashboard-text-tertiary)'
  };

  const helperTextStyles: React.CSSProperties = {
    fontSize: 'var(--text-xs)',
    color: 'var(--dashboard-text-tertiary)',
    marginTop: 'var(--space-1)'
  };

  const getInputStyles = (fieldName: string) => ({
    width: '100%',
    padding: 'var(--space-3)',
    border: `1px solid var(--dashboard-border-primary)`,
    borderRadius: 'var(--radius-lg)',
    backgroundColor: disabled ? 'var(--dashboard-bg-secondary)' : 'var(--dashboard-bg-elevated)',
    color: 'var(--dashboard-text-primary)',
    fontSize: 'var(--text-sm)',
    cursor: disabled ? 'not-allowed' : 'text',
    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
    outline: 'none',
    opacity: disabled ? 0.5 : 1,
    ...(hoveredInput === fieldName && !disabled ? { borderColor: 'var(--dashboard-border-hover)' } : {})
  });

  const renderToggle = (checked: boolean, onChange: () => void, id: string) => (
    <label htmlFor={id} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: disabled ? 'not-allowed' : 'pointer' }}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: 0 }}
      />
      <div style={{
        width: '44px',
        height: '24px',
        backgroundColor: checked ? '#3b82f6' : '#d1d5db',
        borderRadius: '12px',
        position: 'relative',
        transition: 'background-color 0.2s',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1
      }}>
        <div style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '22px' : '2px',
          width: '20px',
          height: '20px',
          backgroundColor: 'white',
          borderRadius: '50%',
          transition: 'left 0.2s',
          boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
        }} />
      </div>
    </label>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Maintenance Mode */}
      <div style={cardStyles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <AlertTriangle style={{ height: '20px', width: '20px', color: '#f59e0b' }} />
          <h3 style={sectionHeaderStyles}>Maintenance Mode</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <label htmlFor="showsmaintenancemess" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Enable Maintenance Mode</label>
              <p style={descriptionStyles}>
                Shows maintenance message to all users
              </p>
            </div>
            {renderToggle(
              settings.maintenance.enabled,
              () => onUpdate({ maintenance: { ...settings.maintenance, enabled: !settings.maintenance.enabled } }),
              'showsmaintenancemess'
            )}
          </div>

          <div>
            <label style={labelStyles}>
              Maintenance Message
            </label>
            <textarea
              value={settings.maintenance.message}
              onChange={(e) => onUpdate({ maintenance: { ...settings.maintenance, message: e.target.value } })}
              onMouseEnter={() => setHoveredInput('maintenanceMessage')}
              onMouseLeave={() => setHoveredInput(null)}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--dashboard-border-primary)';
                e.target.style.boxShadow = 'none';
              }}
              disabled={disabled}
              rows={3}
              style={getInputStyles('maintenanceMessage')}
            />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div style={cardStyles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <Shield style={{ height: '20px', width: '20px', color: '#3b82f6' }} />
          <h3 style={sectionHeaderStyles}>Security</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
          {/* Password Policy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Password Policy</h4>

            <div>
              <label htmlFor="minimumlength" style={labelStyles}>Minimum Length</label>
              <input
                id="minimumlength"
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
                onMouseEnter={() => setHoveredInput('minLength')}
                onMouseLeave={() => setHoveredInput(null)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--dashboard-border-primary)';
                  e.target.style.boxShadow = 'none';
                }}
                disabled={disabled}
                min="6"
                max="32"
                style={getInputStyles('minLength')}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {[
                { key: 'requireUppercase', label: 'Require uppercase letters' },
                { key: 'requireLowercase', label: 'Require lowercase letters' },
                { key: 'requireNumbers', label: 'Require numbers' },
                { key: 'requireSpecialChars', label: 'Require special characters' }
              ].map(({ key, label }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: disabled ? 'not-allowed' : 'pointer' }}>
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
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: '#3b82f6',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>{label}</span>
                </label>
              ))}
            </div>

            <div>
              <label htmlFor="passwordexpirationda" style={labelStyles}>Password Expiration (days)</label>
              <input
                id="passwordexpirationda"
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
                onMouseEnter={() => setHoveredInput('expirationDays')}
                onMouseLeave={() => setHoveredInput(null)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--dashboard-border-primary)';
                  e.target.style.boxShadow = 'none';
                }}
                disabled={disabled}
                min="0"
                max="365"
                style={getInputStyles('expirationDays')}
              />
              <p style={helperTextStyles}>
                Set to 0 to disable password expiration
              </p>
            </div>
          </div>

          {/* Session & Login Settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Session & Login</h4>

            <div>
              <label htmlFor="sessiontimeoutminute" style={labelStyles}>Session Timeout (minutes)</label>
              <input
                id="sessiontimeoutminute"
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => onUpdate({
                  security: {
                    ...settings.security,
                    sessionTimeout: parseInt(e.target.value)
                  }
                })}
                onMouseEnter={() => setHoveredInput('sessionTimeout')}
                onMouseLeave={() => setHoveredInput(null)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--dashboard-border-primary)';
                  e.target.style.boxShadow = 'none';
                }}
                disabled={disabled}
                min="15"
                max="1440"
                style={getInputStyles('sessionTimeout')}
              />
            </div>

            <div>
              <label htmlFor="maxloginattempts" style={labelStyles}>Max Login Attempts</label>
              <input
                id="maxloginattempts"
                type="number"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => onUpdate({
                  security: {
                    ...settings.security,
                    maxLoginAttempts: parseInt(e.target.value)
                  }
                })}
                onMouseEnter={() => setHoveredInput('maxLoginAttempts')}
                onMouseLeave={() => setHoveredInput(null)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--dashboard-border-primary)';
                  e.target.style.boxShadow = 'none';
                }}
                disabled={disabled}
                min="3"
                max="10"
                style={getInputStyles('maxLoginAttempts')}
              />
            </div>

            <div>
              <label htmlFor="accountlockoutdurati" style={labelStyles}>Account Lockout Duration (minutes)</label>
              <input
                id="accountlockoutdurati"
                type="number"
                value={settings.security.lockoutDuration}
                onChange={(e) => onUpdate({
                  security: {
                    ...settings.security,
                    lockoutDuration: parseInt(e.target.value)
                  }
                })}
                onMouseEnter={() => setHoveredInput('lockoutDuration')}
                onMouseLeave={() => setHoveredInput(null)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--dashboard-border-primary)';
                  e.target.style.boxShadow = 'none';
                }}
                disabled={disabled}
                min="5"
                max="120"
                style={getInputStyles('lockoutDuration')}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'var(--space-2)' }}>
              <div>
                <label htmlFor="input0tnion" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Require Two-Factor Authentication</label>
                <p style={descriptionStyles}>
                  All users must enable 2FA
                </p>
              </div>
              {renderToggle(
                settings.security.twoFactorRequired,
                () => onUpdate({
                  security: {
                    ...settings.security,
                    twoFactorRequired: !settings.security.twoFactorRequired
                  }
                }),
                'input0tnion'
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Backup Settings */}
      <div style={cardStyles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <Database style={{ height: '20px', width: '20px', color: '#10b981' }} />
          <h3 style={sectionHeaderStyles}>Backup & Recovery</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <label htmlFor="regularlybackupsyste" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Automatic Backups</label>
              <p style={descriptionStyles}>
                Regularly backup system data
              </p>
            </div>
            {renderToggle(
              settings.backup.enabled,
              () => onUpdate({ backup: { ...settings.backup, enabled: !settings.backup.enabled } }),
              'regularlybackupsyste'
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-4)' }}>
            <div>
              <label style={labelStyles}>
                Backup Frequency
              </label>
              <select
                value={settings.backup.frequency}
                onChange={(e) => onUpdate({
                  backup: { ...settings.backup, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' }
                })}
                onMouseEnter={() => setHoveredInput('backupFrequency')}
                onMouseLeave={() => setHoveredInput(null)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--dashboard-border-primary)';
                  e.target.style.boxShadow = 'none';
                }}
                disabled={disabled || !settings.backup.enabled}
                style={getInputStyles('backupFrequency')}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label htmlFor="retentionperioddays" style={labelStyles}>Retention Period (days)</label>
              <input
                id="retentionperioddays"
                type="number"
                value={settings.backup.retention}
                onChange={(e) => onUpdate({
                  backup: { ...settings.backup, retention: parseInt(e.target.value) }
                })}
                onMouseEnter={() => setHoveredInput('backupRetention')}
                onMouseLeave={() => setHoveredInput(null)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--dashboard-border-primary)';
                  e.target.style.boxShadow = 'none';
                }}
                disabled={disabled || !settings.backup.enabled}
                min="7"
                max="365"
                style={getInputStyles('backupRetention')}
              />
            </div>
          </div>

          {settings.backup.lastBackup && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>
              <CheckCircle style={{ height: '16px', width: '16px', color: '#10b981' }} />
              <span>Last backup: {new Date(settings.backup.lastBackup).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Performance Settings */}
      <div style={cardStyles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <Server style={{ height: '20px', width: '20px', color: '#8b5cf6' }} />
          <h3 style={sectionHeaderStyles}>Performance</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <label htmlFor="speeduppageloads" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Enable Caching</label>
                <p style={descriptionStyles}>
                  Speed up page loads
                </p>
              </div>
              {renderToggle(
                settings.performance.cacheEnabled,
                () => onUpdate({
                  performance: { ...settings.performance, cacheEnabled: !settings.performance.cacheEnabled }
                }),
                'speeduppageloads'
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <label htmlFor="reducebandwidthusage" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Enable Compression</label>
                <p style={descriptionStyles}>
                  Reduce bandwidth usage
                </p>
              </div>
              {renderToggle(
                settings.performance.compressionEnabled,
                () => onUpdate({
                  performance: { ...settings.performance, compressionEnabled: !settings.performance.compressionEnabled }
                }),
                'reducebandwidthusage'
              )}
            </div>
          </div>

          {settings.performance.cacheEnabled && (
            <div>
              <label htmlFor="cachedurationminutes" style={labelStyles}>Cache Duration (minutes)</label>
              <input
                id="cachedurationminutes"
                type="number"
                value={settings.performance.cacheDuration}
                onChange={(e) => onUpdate({
                  performance: { ...settings.performance, cacheDuration: parseInt(e.target.value) }
                })}
                onMouseEnter={() => setHoveredInput('cacheDuration')}
                onMouseLeave={() => setHoveredInput(null)}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--dashboard-border-primary)';
                  e.target.style.boxShadow = 'none';
                }}
                disabled={disabled}
                min="5"
                max="1440"
                style={getInputStyles('cacheDuration')}
              />
            </div>
          )}
        </div>
      </div>

      {/* Integrations */}
      <div style={cardStyles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <Wrench style={{ height: '20px', width: '20px', color: '#6366f1' }} />
          <h3 style={sectionHeaderStyles}>Integrations</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <label htmlFor="syncstudentdatawithy" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Student Information System (SIS)</label>
              <p style={descriptionStyles}>
                Sync student data with your SIS
              </p>
            </div>
            {renderToggle(
              settings.integrations.sisEnabled,
              () => onUpdate({
                integrations: { ...settings.integrations, sisEnabled: !settings.integrations.sisEnabled }
              }),
              'syncstudentdatawithy'
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <label htmlFor="allowuserstologinwit" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Single Sign-On (SSO)</label>
              <p style={descriptionStyles}>
                Allow users to login with SSO
              </p>
            </div>
            {renderToggle(
              settings.integrations.ssoEnabled,
              () => onUpdate({
                integrations: { ...settings.integrations, ssoEnabled: !settings.integrations.ssoEnabled }
              }),
              'allowuserstologinwit'
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <label htmlFor="integratewithexterna" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Learning Management System (LMS)</label>
              <p style={descriptionStyles}>
                Integrate with external LMS
              </p>
            </div>
            {renderToggle(
              settings.integrations.lmsEnabled,
              () => onUpdate({
                integrations: { ...settings.integrations, lmsEnabled: !settings.integrations.lmsEnabled }
              }),
              'integratewithexterna'
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
