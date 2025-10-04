import React, { useState } from 'react';
import { Settings, School, Bell, Shield, Palette, Lock, RotateCcw, Save, CheckCircle, AlertTriangle } from 'lucide-react';
import { SettingsSection } from '../../types/settings';
import { useSettings } from '../../hooks/useSettings';
import { SchoolSettingsForm } from './SchoolSettingsForm';
import { NotificationSettingsForm } from './NotificationSettingsForm';
import { SystemSettingsForm } from './SystemSettingsForm';
import { AppearanceSettingsForm } from './AppearanceSettingsForm';
import { PrivacySettingsForm } from './PrivacySettingsForm';
import { AdminOnly } from '../auth/PermissionGate';
import '../../design-system/tokens/colors.css';
import '../../design-system/tokens/spacing.css';
import '../../design-system/tokens/borders.css';
import '../../design-system/tokens/typography.css';
import '../../design-system/tokens/shadows.css';
import '../../design-system/tokens/dashboard.css';

interface SettingsPanelProps {
  className?: string;
}

const SETTINGS_TABS = [
  { id: 'school' as SettingsSection, label: 'School Info', icon: School, description: 'Basic school information and contact details' },
  { id: 'notifications' as SettingsSection, label: 'Notifications', icon: Bell, description: 'Email, SMS, and in-app notification preferences' },
  { id: 'system' as SettingsSection, label: 'System', icon: Shield, description: 'Security, backup, and system configuration' },
  { id: 'appearance' as SettingsSection, label: 'Appearance', icon: Palette, description: 'Theme, branding, and visual customization' },
  { id: 'privacy' as SettingsSection, label: 'Privacy', icon: Lock, description: 'Data retention, compliance, and privacy settings' }
];

export function SettingsPanel({ className = '' }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsSection>('school');
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [isResetHovered, setIsResetHovered] = useState(false);
  const [isSaveHovered, setIsSaveHovered] = useState(false);
  
  const {
    schoolSettings,
    notificationSettings,
    systemSettings,
    appearanceSettings,
    privacySettings,
    loading,
    saving,
    errors,
    updateSchoolSettings,
    updateNotificationSettings,
    updateSystemSettings,
    updateAppearanceSettings,
    updatePrivacySettings,
    saveAllSettings,
    resetToDefaults
  } = useSettings();

  const handleSave = async () => {
    try {
      await saveAllSettings();
      setSaveMessage({ type: 'success', message: 'Settings saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: 'error', message: 'Failed to save settings. Please try again.' });
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  const handleReset = async () => {
    if (window.confirm(`Are you sure you want to reset ${SETTINGS_TABS.find(tab => tab.id === activeTab)?.label} settings to defaults?`)) {
      try {
        await resetToDefaults(activeTab);
        setSaveMessage({ type: 'success', message: `${SETTINGS_TABS.find(tab => tab.id === activeTab)?.label} settings reset to defaults.` });
        setTimeout(() => setSaveMessage(null), 3000);
      } catch (error) {
        setSaveMessage({ type: 'error', message: 'Failed to reset settings. Please try again.' });
        setTimeout(() => setSaveMessage(null), 5000);
      }
    }
  };

  const renderSettingsForm = () => {
    switch (activeTab) {
      case 'school':
        return (
          <SchoolSettingsForm
            settings={schoolSettings}
            onUpdate={updateSchoolSettings}
            errors={errors.school}
            disabled={saving}
          />
        );
      case 'notifications':
        return (
          <NotificationSettingsForm
            settings={notificationSettings}
            onUpdate={updateNotificationSettings}
            errors={errors.notifications}
            disabled={saving}
          />
        );
      case 'system':
        return (
          <SystemSettingsForm
            settings={systemSettings}
            onUpdate={updateSystemSettings}
            errors={errors.system}
            disabled={saving}
          />
        );
      case 'appearance':
        return (
          <AppearanceSettingsForm
            settings={appearanceSettings}
            onUpdate={updateAppearanceSettings}
            errors={errors.appearance}
            disabled={saving}
          />
        );
      case 'privacy':
        return (
          <PrivacySettingsForm
            settings={privacySettings}
            onUpdate={updatePrivacySettings}
            errors={errors.privacy}
            disabled={saving}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div
        className={className}
        style={{
          background: 'var(--dashboard-bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--dashboard-shadow-sm)',
          border: '1px solid var(--dashboard-border-primary)'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '24rem'
        }}>
          <div
            className="animate-spin"
            style={{
              borderRadius: '9999px',
              height: '3rem',
              width: '3rem',
              borderBottom: '2px solid #2563eb'
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <AdminOnly fallback={
      <div style={{
        background: 'var(--dashboard-bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--dashboard-shadow-sm)',
        border: '1px solid var(--dashboard-border-primary)',
        padding: 'var(--space-8)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Lock
            style={{
              height: '4rem',
              width: '4rem',
              color: '#9ca3af',
              margin: '0 auto var(--space-4)'
            }}
          />
          <h3 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--dashboard-text-primary)',
            marginBottom: 'var(--space-2)'
          }}>
            Admin Access Required
          </h3>
          <p style={{
            color: 'var(--dashboard-text-secondary)',
            fontSize: 'var(--text-sm)'
          }}>
            You need administrator privileges to access system settings.
          </p>
        </div>
      </div>
    }>
      <div
        className={className}
        style={{
          background: 'var(--dashboard-bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--dashboard-shadow-sm)',
          border: '1px solid var(--dashboard-border-primary)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: 'var(--space-4) var(--space-6)',
          borderBottom: '1px solid var(--dashboard-border-primary)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)'
            }}>
              <div style={{
                padding: 'var(--space-2)',
                background: '#dbeafe',
                borderRadius: 'var(--radius-md)'
              }}>
                <Settings style={{
                  height: '1.5rem',
                  width: '1.5rem',
                  color: '#2563eb'
                }} />
              </div>
              <div>
                <h2 style={{
                  fontSize: 'var(--text-xl)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--dashboard-text-primary)'
                }}>
                  System Settings
                </h2>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--dashboard-text-secondary)'
                }}>
                  Configure platform settings and preferences
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)'
            }}>
              <button
                onClick={handleReset}
                disabled={saving}
                onMouseEnter={() => setIsResetHovered(true)}
                onMouseLeave={() => setIsResetHovered(false)}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  color: 'var(--dashboard-text-primary)',
                  border: '1px solid var(--dashboard-border-primary)',
                  borderRadius: 'var(--radius-md)',
                  background: isResetHovered ? 'var(--dashboard-bg-secondary)' : 'transparent',
                  opacity: saving ? 0.5 : 1,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)'
                }}
              >
                <RotateCcw style={{ height: '1rem', width: '1rem' }} />
                <span>Reset</span>
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                onMouseEnter={() => setIsSaveHovered(true)}
                onMouseLeave={() => setIsSaveHovered(false)}
                style={{
                  padding: 'var(--space-2) var(--space-6)',
                  background: isSaveHovered && !saving ? '#1d4ed8' : '#2563eb',
                  color: 'white',
                  borderRadius: 'var(--radius-md)',
                  opacity: saving ? 0.5 : 1,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  border: 'none'
                }}
              >
                {saving ? (
                  <>
                    <div
                      className="animate-spin"
                      style={{
                        borderRadius: '9999px',
                        height: '1rem',
                        width: '1rem',
                        borderBottom: '2px solid white'
                      }}
                    />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save style={{ height: '1rem', width: '1rem' }} />
                    <span>Save All</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              background: saveMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
              color: saveMessage.type === 'success' ? '#166534' : '#991b1b'
            }}>
              {saveMessage.type === 'success' ? (
                <CheckCircle style={{ height: '1.25rem', width: '1.25rem' }} />
              ) : (
                <AlertTriangle style={{ height: '1.25rem', width: '1.25rem' }} />
              )}
              <span style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)'
              }}>
                {saveMessage.message}
              </span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div style={{
          borderBottom: '1px solid var(--dashboard-border-primary)'
        }}>
          <nav
            style={{
              display: 'flex',
              gap: 'var(--space-8)',
              padding: '0 var(--space-6)'
            }}
            aria-label="Settings sections"
          >
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isHovered = hoveredTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  onMouseEnter={() => setHoveredTab(tab.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                  style={{
                    padding: 'var(--space-4) var(--space-1)',
                    borderBottom: isActive ? '2px solid #2563eb' : isHovered ? '2px solid var(--dashboard-border-primary)' : '2px solid transparent',
                    fontWeight: 'var(--font-medium)',
                    fontSize: 'var(--text-sm)',
                    transition: 'all 0.2s',
                    color: isActive ? '#2563eb' : isHovered ? 'var(--dashboard-text-primary)' : 'var(--dashboard-text-secondary)',
                    background: 'transparent',
                    cursor: 'pointer'
                  }}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)'
                  }}>
                    <Icon style={{ height: '1rem', width: '1rem' }} />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Description */}
        <div style={{
          padding: 'var(--space-4) var(--space-6)',
          background: 'var(--dashboard-bg-secondary)'
        }}>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--dashboard-text-secondary)'
          }}>
            {SETTINGS_TABS.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>

        {/* Settings Form */}
        <div style={{
          padding: 'var(--space-8) var(--space-6)'
        }}>
          {renderSettingsForm()}
        </div>
      </div>
    </AdminOnly>
  );
}