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
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <AdminOnly fallback={
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Admin Access Required
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            You need administrator privileges to access system settings.
          </p>
        </div>
      </div>
    }>
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  System Settings
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configure platform settings and preferences
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleReset}
                disabled={saving}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save All</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`mt-4 p-3 rounded-lg flex items-center space-x-2 ${
              saveMessage.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200'
            }`}>
              {saveMessage.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
              <span className="text-sm font-medium">{saveMessage.message}</span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Settings sections">
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Description */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {SETTINGS_TABS.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>

        {/* Settings Form */}
        <div className="px-6 py-8">
          {renderSettingsForm()}
        </div>
      </div>
    </AdminOnly>
  );
}