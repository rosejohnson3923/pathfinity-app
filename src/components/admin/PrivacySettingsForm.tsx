import React, { useState } from 'react';
import { Lock, Shield, Eye, FileText, Clock, CheckCircle2 } from 'lucide-react';
import { PrivacySettings } from '../../types/settings';
import '../../design-system/tokens/colors.css';
import '../../design-system/tokens/spacing.css';
import '../../design-system/tokens/borders.css';
import '../../design-system/tokens/typography.css';
import '../../design-system/tokens/shadows.css';
import '../../design-system/tokens/dashboard.css';

interface PrivacySettingsFormProps {
  settings: PrivacySettings | null;
  onUpdate: (settings: Partial<PrivacySettings>) => void;
  errors?: Partial<Record<keyof PrivacySettings, string>>;
  disabled?: boolean;
}

export function PrivacySettingsForm({ settings, onUpdate, errors, disabled }: PrivacySettingsFormProps) {
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

  const renderComplianceToggle = (checked: boolean, onChange: () => void, id: string) => (
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
        backgroundColor: checked ? '#10b981' : '#d1d5db',
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
      {/* Data Retention */}
      <div style={cardStyles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <Clock style={{ height: '20px', width: '20px', color: '#3b82f6' }} />
          <h3 style={sectionHeaderStyles}>Data Retention</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-2)' }}>
            Configure how long different types of data are retained before automatic deletion.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-6)' }}>
            <div>
              <label htmlFor="userdataretentionday" style={labelStyles}>User Data Retention (days)</label>
              <input
                id="userdataretentionday"
                type="number"
                value={settings.dataRetention.userDataDays}
                onChange={(e) => onUpdate({
                  dataRetention: {
                    ...settings.dataRetention,
                    userDataDays: parseInt(e.target.value)
                  }
                })}
                onMouseEnter={() => setHoveredInput('userDataDays')}
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
                min="30"
                max="2555"
                style={getInputStyles('userDataDays')}
              />
              <p style={helperTextStyles}>
                Student records, assessments, and personal data
              </p>
            </div>

            <div>
              <label htmlFor="logdataretentiondays" style={labelStyles}>Log Data Retention (days)</label>
              <input
                id="logdataretentiondays"
                type="number"
                value={settings.dataRetention.logDataDays}
                onChange={(e) => onUpdate({
                  dataRetention: {
                    ...settings.dataRetention,
                    logDataDays: parseInt(e.target.value)
                  }
                })}
                onMouseEnter={() => setHoveredInput('logDataDays')}
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
                min="7"
                max="2555"
                style={getInputStyles('logDataDays')}
              />
              <p style={helperTextStyles}>
                System logs, audit trails, and activity logs
              </p>
            </div>

            <div>
              <label htmlFor="backupdataretentiond" style={labelStyles}>Backup Data Retention (days)</label>
              <input
                id="backupdataretentiond"
                type="number"
                value={settings.dataRetention.backupDataDays}
                onChange={(e) => onUpdate({
                  dataRetention: {
                    ...settings.dataRetention,
                    backupDataDays: parseInt(e.target.value)
                  }
                })}
                onMouseEnter={() => setHoveredInput('backupDataDays')}
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
                min="30"
                max="2555"
                style={getInputStyles('backupDataDays')}
              />
              <p style={helperTextStyles}>
                Database backups and archived data
              </p>
            </div>

            <div>
              <label htmlFor="inactiveuserdatadays" style={labelStyles}>Inactive User Data (days)</label>
              <input
                id="inactiveuserdatadays"
                type="number"
                value={settings.dataRetention.inactiveUserDays}
                onChange={(e) => onUpdate({
                  dataRetention: {
                    ...settings.dataRetention,
                    inactiveUserDays: parseInt(e.target.value)
                  }
                })}
                onMouseEnter={() => setHoveredInput('inactiveUserDays')}
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
                min="90"
                max="1095"
                style={getInputStyles('inactiveUserDays')}
              />
              <p style={helperTextStyles}>
                Data for users who haven't logged in
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Controls */}
      <div style={cardStyles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <Eye style={{ height: '20px', width: '20px', color: '#8b5cf6' }} />
          <h3 style={sectionHeaderStyles}>Privacy Controls</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <label htmlFor="collectanonymizedusa" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Allow Analytics Collection</label>
              <p style={descriptionStyles}>
                Collect anonymized usage analytics to improve the platform
              </p>
            </div>
            {renderToggle(
              settings.privacy.allowAnalytics,
              () => onUpdate({
                privacy: { ...settings.privacy, allowAnalytics: !settings.privacy.allowAnalytics }
              }),
              'collectanonymizedusa'
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <label htmlFor="enablecookiesforenha" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Allow Cookies</label>
              <p style={descriptionStyles}>
                Enable cookies for enhanced user experience and preferences
              </p>
            </div>
            {renderToggle(
              settings.privacy.allowCookies,
              () => onUpdate({
                privacy: { ...settings.privacy, allowCookies: !settings.privacy.allowCookies }
              }),
              'enablecookiesforenha'
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <label htmlFor="shareaggregatedusage" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Share Usage Data</label>
              <p style={descriptionStyles}>
                Share aggregated usage statistics with Pathfinity for product improvement
              </p>
            </div>
            {renderToggle(
              settings.privacy.shareUsageData,
              () => onUpdate({
                privacy: { ...settings.privacy, shareUsageData: !settings.privacy.shareUsageData }
              }),
              'shareaggregatedusage'
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <label htmlFor="enableintegrationswi" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Allow Third-Party Integrations</label>
              <p style={descriptionStyles}>
                Enable integrations with external educational tools and services
              </p>
            </div>
            {renderToggle(
              settings.privacy.allowThirdPartyIntegrations,
              () => onUpdate({
                privacy: { ...settings.privacy, allowThirdPartyIntegrations: !settings.privacy.allowThirdPartyIntegrations }
              }),
              'enableintegrationswi'
            )}
          </div>
        </div>
      </div>

      {/* Compliance */}
      <div style={cardStyles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <Shield style={{ height: '20px', width: '20px', color: '#10b981' }} />
          <h3 style={sectionHeaderStyles}>Compliance & Legal</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <label htmlFor="ferpacompliant" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span>FERPA Compliant</span>
                  {settings.compliance.ferpaCompliant && (
                    <CheckCircle2 style={{ height: '16px', width: '16px', color: '#10b981' }} />
                  )}
                </label>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--dashboard-text-tertiary)' }}>
                  Educational records privacy
                </p>
              </div>
              {renderComplianceToggle(
                settings.compliance.ferpaCompliant,
                () => onUpdate({
                  compliance: { ...settings.compliance, ferpaCompliant: !settings.compliance.ferpaCompliant }
                }),
                'ferpacompliant'
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <label htmlFor="coppacompliant" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span>COPPA Compliant</span>
                  {settings.compliance.coppaCompliant && (
                    <CheckCircle2 style={{ height: '16px', width: '16px', color: '#10b981' }} />
                  )}
                </label>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--dashboard-text-tertiary)' }}>
                  Children's online privacy
                </p>
              </div>
              {renderComplianceToggle(
                settings.compliance.coppaCompliant,
                () => onUpdate({
                  compliance: { ...settings.compliance, coppaCompliant: !settings.compliance.coppaCompliant }
                }),
                'coppacompliant'
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <label htmlFor="gdprcompliant" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span>GDPR Compliant</span>
                  {settings.compliance.gdprCompliant && (
                    <CheckCircle2 style={{ height: '16px', width: '16px', color: '#10b981' }} />
                  )}
                </label>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--dashboard-text-tertiary)' }}>
                  European data protection
                </p>
              </div>
              {renderComplianceToggle(
                settings.compliance.gdprCompliant,
                () => onUpdate({
                  compliance: { ...settings.compliance, gdprCompliant: !settings.compliance.gdprCompliant }
                }),
                'gdprcompliant'
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
            <div>
              <label htmlFor="privacynoticeurl" style={labelStyles}>Privacy Notice URL</label>
              <input
                id="privacynoticeurl"
                type="url"
                value={settings.compliance.privacyNoticeUrl || ''}
                onChange={(e) => onUpdate({
                  compliance: { ...settings.compliance, privacyNoticeUrl: e.target.value }
                })}
                onMouseEnter={() => setHoveredInput('privacyNoticeUrl')}
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
                placeholder="https://school.edu/privacy"
                style={getInputStyles('privacyNoticeUrl')}
              />
              <p style={helperTextStyles}>
                Link to your privacy policy document
              </p>
            </div>

            <div>
              <label htmlFor="termsofserviceurl" style={labelStyles}>Terms of Service URL</label>
              <input
                id="termsofserviceurl"
                type="url"
                value={settings.compliance.termsOfServiceUrl || ''}
                onChange={(e) => onUpdate({
                  compliance: { ...settings.compliance, termsOfServiceUrl: e.target.value }
                })}
                onMouseEnter={() => setHoveredInput('termsOfServiceUrl')}
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
                placeholder="https://school.edu/terms"
                style={getInputStyles('termsOfServiceUrl')}
              />
              <p style={helperTextStyles}>
                Link to your terms of service document
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div style={{
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
          <FileText style={{ height: '20px', width: '20px', color: '#3b82f6', marginTop: '2px', flexShrink: 0 }} />
          <div>
            <h4 style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--dashboard-text-primary)',
              marginBottom: 'var(--space-2)'
            }}>
              Privacy & Compliance Information
            </h4>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <p>
                • <strong>FERPA:</strong> Protects student educational records and gives parents/students rights over their records
              </p>
              <p>
                • <strong>COPPA:</strong> Requires parental consent for collecting personal information from children under 13
              </p>
              <p>
                • <strong>GDPR:</strong> Provides data protection rights for individuals in the European Union
              </p>
              <p style={{
                marginTop: 'var(--space-1)',
                paddingTop: 'var(--space-2)',
                borderTop: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <strong>Note:</strong> Enabling compliance features activates additional data protection measures,
                consent workflows, and audit logging. Consult with your legal team before making changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
