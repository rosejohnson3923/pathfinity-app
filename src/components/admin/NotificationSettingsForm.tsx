import React from 'react';
import { Bell, Mail, MessageSquare, Clock, Volume2, VolumeX } from 'lucide-react';
import { NotificationSettings } from '../../types/settings';

interface NotificationSettingsFormProps {
  settings: NotificationSettings;
  onUpdate: (data: Partial<NotificationSettings>) => void;
  errors?: Partial<Record<keyof NotificationSettings, string>>;
  disabled?: boolean;
}

export function NotificationSettingsForm({ settings, onUpdate, errors = {}, disabled = false }: NotificationSettingsFormProps) {
  const handleNestedChange = (parent: keyof NotificationSettings, field: string, value: any) => {
    const parentValue = settings[parent] as any;
    onUpdate({
      [parent]: {
        ...parentValue,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Email Notifications */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Email Notifications
          </h3>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Enable Email Notifications
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Master switch for all email notifications
              </p>
            </div>
            <label htmlFor="input7g37y" className="relative inline-flex items-center cursor-pointer"><input id="input7g37y"
                type="checkbox"
                checked={settings.emailNotifications.enabled}
                onChange={(e) => handleNestedChange('emailNotifications', 'enabled', e.target.checked)}
                disabled={disabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.emailNotifications.enabled && (
            <div className="space-y-4 ml-4 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
              {[
                { key: 'newUsers', label: 'New User Registrations', description: 'Notify when new users join the platform' },
                { key: 'contentUpdates', label: 'Content Updates', description: 'Notify when content is published or updated' },
                { key: 'systemAlerts', label: 'System Alerts', description: 'Important system notifications and alerts' },
                { key: 'weeklyReports', label: 'Weekly Reports', description: 'Weekly summary of platform activity' },
                { key: 'maintenanceNotices', label: 'Maintenance Notices', description: 'Scheduled maintenance and downtime alerts' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.label}
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications[item.key as keyof typeof settings.emailNotifications] as boolean}
                    onChange={(e) => handleNestedChange('emailNotifications', item.key, e.target.checked)}
                    disabled={disabled}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SMS Notifications */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            SMS Notifications
          </h3>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Enable SMS Notifications
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Master switch for all SMS notifications
              </p>
            </div>
            <label htmlFor="input8q1id6" className="relative inline-flex items-center cursor-pointer"><input id="input8q1id6"
                type="checkbox"
                checked={settings.smsNotifications.enabled}
                onChange={(e) => handleNestedChange('smsNotifications', 'enabled', e.target.checked)}
                disabled={disabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.smsNotifications.enabled && (
            <div className="space-y-4 ml-4 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
              {[
                { key: 'emergencyAlerts', label: 'Emergency Alerts', description: 'Critical emergency notifications' },
                { key: 'importantUpdates', label: 'Important Updates', description: 'High-priority system updates' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.label}
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications[item.key as keyof typeof settings.smsNotifications] as boolean}
                    onChange={(e) => handleNestedChange('smsNotifications', item.key, e.target.checked)}
                    disabled={disabled}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* In-App Notifications */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            In-App Notifications
          </h3>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Enable In-App Notifications
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Show notifications within the application
              </p>
            </div>
            <label htmlFor="inpute7mmqdl" className="relative inline-flex items-center cursor-pointer"><input id="inpute7mmqdl"
                type="checkbox"
                checked={settings.inAppNotifications.enabled}
                onChange={(e) => handleNestedChange('inAppNotifications', 'enabled', e.target.checked)}
                disabled={disabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.inAppNotifications.enabled && (
            <div className="space-y-4 ml-4 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
              {[
                { key: 'contentPublished', label: 'Content Published', description: 'New content and assignments' },
                { key: 'userActivities', label: 'User Activities', description: 'Student progress and activities' },
                { key: 'systemMessages', label: 'System Messages', description: 'Platform updates and announcements' }
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.label}
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.inAppNotifications[item.key as keyof typeof settings.inAppNotifications] as boolean}
                    onChange={(e) => handleNestedChange('inAppNotifications', item.key, e.target.checked)}
                    disabled={disabled}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Digest Settings */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Digest Settings
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="daily" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Digest Frequency
            </label>
            <select
              value={settings.digestFrequency}
              onChange={(e) => onUpdate({ digestFrequency: e.target.value as any })}
              disabled={disabled}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
              }`}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="never">Never</option>
            </select>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              How often to send notification summaries
            </p>
          </div>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <VolumeX className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Quiet Hours
          </h3>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Enable Quiet Hours
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Suppress non-urgent notifications during specified hours
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input id="daily"
                type="checkbox"
                checked={settings.quietHours.enabled}
                onChange={(e) => handleNestedChange('quietHours', 'enabled', e.target.checked)}
                disabled={disabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.quietHours.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-4 border-l-2 border-gray-200 dark:border-gray-600 pl-4">
              <div>
                <label htmlFor="starttime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Time
                </label><input id="starttime"
                  type="time"
                  value={settings.quietHours.startTime}
                  onChange={(e) => handleNestedChange('quietHours', 'startTime', e.target.value)}
                  disabled={disabled}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div>
                <label htmlFor="endtime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Time
                </label><input id="endtime"
                  type="time"
                  value={settings.quietHours.endTime}
                  onChange={(e) => handleNestedChange('quietHours', 'endTime', e.target.value)}
                  disabled={disabled}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}