import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Clock, VolumeX } from 'lucide-react';
import { NotificationSettings } from '../../types/settings';
import '../../design-system/tokens/colors.css';
import '../../design-system/tokens/spacing.css';
import '../../design-system/tokens/borders.css';
import '../../design-system/tokens/typography.css';
import '../../design-system/tokens/shadows.css';
import '../../design-system/tokens/dashboard.css';

interface NotificationSettingsFormProps {
  settings: NotificationSettings;
  onUpdate: (data: Partial<NotificationSettings>) => void;
  errors?: Partial<Record<keyof NotificationSettings, string>>;
  disabled?: boolean;
}

export function NotificationSettingsForm({ settings, onUpdate, errors = {}, disabled = false }: NotificationSettingsFormProps) {
  const [hoveredInput, setHoveredInput] = useState<string | null>(null);

  const handleNestedChange = (parent: keyof NotificationSettings, field: string, value: any) => {
    const parentValue = settings[parent] as any;
    onUpdate({
      [parent]: {
        ...parentValue,
        [field]: value
      }
    });
  };

  const sectionHeaderStyles: React.CSSProperties = {
    fontSize: 'var(--text-lg)',
    fontWeight: 'var(--font-medium)',
    color: 'var(--dashboard-text-primary)'
  };

  const iconStyles: React.CSSProperties = {
    color: '#3b82f6'
  };

  const cardStyles: React.CSSProperties = {
    backgroundColor: 'var(--dashboard-bg-secondary)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)'
  };

  const toggleWrapperStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const labelTextStyles: React.CSSProperties = {
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-medium)',
    color: 'var(--dashboard-text-primary)'
  };

  const descriptionTextStyles: React.CSSProperties = {
    fontSize: 'var(--text-sm)',
    color: 'var(--dashboard-text-secondary)'
  };

  const nestedContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
    marginLeft: 'var(--space-4)',
    borderLeft: `2px solid var(--dashboard-border-primary)`,
    paddingLeft: 'var(--space-4)'
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
    ...(hoveredInput === fieldName && !disabled ? { borderColor: 'var(--dashboard-border-hover)' } : {})
  });

  const labelStyles: React.CSSProperties = {
    display: 'block',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-medium)',
    color: 'var(--dashboard-text-primary)',
    marginBottom: 'var(--space-2)'
  };

  const helperTextStyles: React.CSSProperties = {
    color: 'var(--dashboard-text-tertiary)',
    fontSize: 'var(--text-xs)',
    marginTop: 'var(--space-1)'
  };

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
      {/* Email Notifications */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Mail style={{ ...iconStyles, height: '20px', width: '20px' }} />
          <h3 style={sectionHeaderStyles}>
            Email Notifications
          </h3>
        </div>

        <div style={cardStyles}>
          <div style={toggleWrapperStyles}>
            <div>
              <h4 style={labelTextStyles}>
                Enable Email Notifications
              </h4>
              <p style={descriptionTextStyles}>
                Master switch for all email notifications
              </p>
            </div>
            {renderToggle(
              settings.emailNotifications.enabled,
              () => handleNestedChange('emailNotifications', 'enabled', !settings.emailNotifications.enabled),
              'email-enabled'
            )}
          </div>

          {settings.emailNotifications.enabled && (
            <div style={nestedContainerStyles}>
              {[
                { key: 'newUsers', label: 'New User Registrations', description: 'Notify when new users join the platform' },
                { key: 'contentUpdates', label: 'Content Updates', description: 'Notify when content is published or updated' },
                { key: 'systemAlerts', label: 'System Alerts', description: 'Important system notifications and alerts' },
                { key: 'weeklyReports', label: 'Weekly Reports', description: 'Weekly summary of platform activity' },
                { key: 'maintenanceNotices', label: 'Maintenance Notices', description: 'Scheduled maintenance and downtime alerts' }
              ].map((item) => (
                <div key={item.key} style={toggleWrapperStyles}>
                  <div>
                    <h5 style={labelTextStyles}>
                      {item.label}
                    </h5>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--dashboard-text-secondary)' }}>
                      {item.description}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications[item.key as keyof typeof settings.emailNotifications] as boolean}
                    onChange={(e) => handleNestedChange('emailNotifications', item.key, e.target.checked)}
                    disabled={disabled}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: '#3b82f6',
                      cursor: disabled ? 'not-allowed' : 'pointer'
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SMS Notifications */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <MessageSquare style={{ ...iconStyles, height: '20px', width: '20px' }} />
          <h3 style={sectionHeaderStyles}>
            SMS Notifications
          </h3>
        </div>

        <div style={cardStyles}>
          <div style={toggleWrapperStyles}>
            <div>
              <h4 style={labelTextStyles}>
                Enable SMS Notifications
              </h4>
              <p style={descriptionTextStyles}>
                Master switch for all SMS notifications
              </p>
            </div>
            {renderToggle(
              settings.smsNotifications.enabled,
              () => handleNestedChange('smsNotifications', 'enabled', !settings.smsNotifications.enabled),
              'sms-enabled'
            )}
          </div>

          {settings.smsNotifications.enabled && (
            <div style={nestedContainerStyles}>
              {[
                { key: 'emergencyAlerts', label: 'Emergency Alerts', description: 'Critical emergency notifications' },
                { key: 'importantUpdates', label: 'Important Updates', description: 'High-priority system updates' }
              ].map((item) => (
                <div key={item.key} style={toggleWrapperStyles}>
                  <div>
                    <h5 style={labelTextStyles}>
                      {item.label}
                    </h5>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--dashboard-text-secondary)' }}>
                      {item.description}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications[item.key as keyof typeof settings.smsNotifications] as boolean}
                    onChange={(e) => handleNestedChange('smsNotifications', item.key, e.target.checked)}
                    disabled={disabled}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: '#3b82f6',
                      cursor: disabled ? 'not-allowed' : 'pointer'
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* In-App Notifications */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Bell style={{ ...iconStyles, height: '20px', width: '20px' }} />
          <h3 style={sectionHeaderStyles}>
            In-App Notifications
          </h3>
        </div>

        <div style={cardStyles}>
          <div style={toggleWrapperStyles}>
            <div>
              <h4 style={labelTextStyles}>
                Enable In-App Notifications
              </h4>
              <p style={descriptionTextStyles}>
                Show notifications within the application
              </p>
            </div>
            {renderToggle(
              settings.inAppNotifications.enabled,
              () => handleNestedChange('inAppNotifications', 'enabled', !settings.inAppNotifications.enabled),
              'inapp-enabled'
            )}
          </div>

          {settings.inAppNotifications.enabled && (
            <div style={nestedContainerStyles}>
              {[
                { key: 'contentPublished', label: 'Content Published', description: 'New content and assignments' },
                { key: 'userActivities', label: 'User Activities', description: 'Student progress and activities' },
                { key: 'systemMessages', label: 'System Messages', description: 'Platform updates and announcements' }
              ].map((item) => (
                <div key={item.key} style={toggleWrapperStyles}>
                  <div>
                    <h5 style={labelTextStyles}>
                      {item.label}
                    </h5>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--dashboard-text-secondary)' }}>
                      {item.description}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.inAppNotifications[item.key as keyof typeof settings.inAppNotifications] as boolean}
                    onChange={(e) => handleNestedChange('inAppNotifications', item.key, e.target.checked)}
                    disabled={disabled}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: '#3b82f6',
                      cursor: disabled ? 'not-allowed' : 'pointer'
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Digest Settings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Clock style={{ ...iconStyles, height: '20px', width: '20px' }} />
          <h3 style={sectionHeaderStyles}>
            Digest Settings
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
          <div>
            <label htmlFor="daily" style={labelStyles}>Digest Frequency</label>
            <select
              id="daily"
              value={settings.digestFrequency}
              onChange={(e) => onUpdate({ digestFrequency: e.target.value as any })}
              onMouseEnter={() => setHoveredInput('digestFrequency')}
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
              style={getInputStyles('digestFrequency')}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="never">Never</option>
            </select>
            <p style={helperTextStyles}>
              How often to send notification summaries
            </p>
          </div>
        </div>
      </div>

      {/* Quiet Hours */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <VolumeX style={{ ...iconStyles, height: '20px', width: '20px' }} />
          <h3 style={sectionHeaderStyles}>
            Quiet Hours
          </h3>
        </div>

        <div style={cardStyles}>
          <div style={toggleWrapperStyles}>
            <div>
              <h4 style={labelTextStyles}>
                Enable Quiet Hours
              </h4>
              <p style={descriptionTextStyles}>
                Suppress non-urgent notifications during specified hours
              </p>
            </div>
            {renderToggle(
              settings.quietHours.enabled,
              () => handleNestedChange('quietHours', 'enabled', !settings.quietHours.enabled),
              'quiet-enabled'
            )}
          </div>

          {settings.quietHours.enabled && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-6)', marginLeft: 'var(--space-4)', borderLeft: `2px solid var(--dashboard-border-primary)`, paddingLeft: 'var(--space-4)' }}>
              <div>
                <label htmlFor="starttime" style={labelStyles}>Start Time</label>
                <input
                  id="starttime"
                  type="time"
                  value={settings.quietHours.startTime}
                  onChange={(e) => handleNestedChange('quietHours', 'startTime', e.target.value)}
                  onMouseEnter={() => setHoveredInput('startTime')}
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
                  style={getInputStyles('startTime')}
                />
              </div>

              <div>
                <label htmlFor="endtime" style={labelStyles}>End Time</label>
                <input
                  id="endtime"
                  type="time"
                  value={settings.quietHours.endTime}
                  onChange={(e) => handleNestedChange('quietHours', 'endTime', e.target.value)}
                  onMouseEnter={() => setHoveredInput('endTime')}
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
                  style={getInputStyles('endTime')}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
