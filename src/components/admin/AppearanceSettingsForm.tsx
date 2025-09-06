import React from 'react';
import { Palette, Monitor, Sun, Moon, Eye, Upload, Layout } from 'lucide-react';
import { AppearanceSettings } from '../../types/settings';

interface AppearanceSettingsFormProps {
  settings: AppearanceSettings | null;
  onUpdate: (settings: Partial<AppearanceSettings>) => void;
  errors?: Partial<Record<keyof AppearanceSettings, string>>;
  disabled?: boolean;
}

export function AppearanceSettingsForm({ settings, onUpdate, errors, disabled }: AppearanceSettingsFormProps) {
  if (!settings) return null;

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'auto', label: 'Auto', icon: Monitor }
  ];

  const dashboardViewOptions = [
    { value: 'overview', label: 'Overview' },
    { value: 'users', label: 'Users' },
    { value: 'content', label: 'Content' },
    { value: 'reports', label: 'Reports' }
  ];

  return (
    <div className="space-y-8">
      {/* Theme Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Palette className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Theme & Colors</h3>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Theme Mode
            </label>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => onUpdate({ theme: value as 'light' | 'dark' | 'auto' })}
                  disabled={disabled}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    settings.theme === value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Icon className={`h-6 w-6 mx-auto mb-2 ${
                    settings.theme === value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                  }`} />
                  <div className={`text-sm font-medium ${
                    settings.theme === value ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                  }`}>
                    {label}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Primary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  id="primaryColor"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => onUpdate({ primaryColor: e.target.value })}
                  disabled={disabled}
                  className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
                  aria-label="Primary color picker"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => onUpdate({ primaryColor: e.target.value })}
                  disabled={disabled}
                  placeholder="#3B82F6"
                  aria-label="Primary color hex code"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Secondary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  id="secondaryColor"
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => onUpdate({ secondaryColor: e.target.value })}
                  aria-label="Secondary color picker"
                  disabled={disabled}
                  className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
                />
                <input
                  type="text"
                  value={settings.secondaryColor}
                  onChange={(e) => onUpdate({ secondaryColor: e.target.value })}
                  disabled={disabled}
                  placeholder="#6B7280"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Upload className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Branding</h3>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="displaypathfinitybra" className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Platform Branding
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Display Pathfinity branding in footer
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input id="displaypathfinitybra"
                type="checkbox"
                checked={settings.branding.showBranding}
                onChange={(e) => onUpdate({
                  branding: { ...settings.branding, showBranding: e.target.checked }
                })}
                disabled={disabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="logourl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo URL
              </label><input id="logourl"
                type="url"
                value={settings.logo || ''}
                onChange={(e) => onUpdate({ logo: e.target.value })}
                disabled={disabled}
                placeholder="https://example.com/logo.png"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Recommended size: 200x50 pixels
              </p>
            </div>
            
            <div>
              <label htmlFor="faviconurl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Favicon URL
              </label><input id="faviconurl"
                type="url"
                value={settings.favicon || ''}
                onChange={(e) => onUpdate({ favicon: e.target.value })}
                disabled={disabled}
                placeholder="https://example.com/favicon.ico"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                32x32 or 16x16 pixel ICO file
              </p>
            </div>
          </div>
          
          <div>
            <label htmlFor="htmlcontenttodisplay" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custom Header HTML
            </label>
            <textarea
              value={settings.branding.customHeader || ''}
              onChange={(e) => onUpdate({
                branding: { ...settings.branding, customHeader: e.target.value }
              })}
              disabled={disabled}
              rows={3}
              placeholder="<!-- Custom header content -->"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              HTML content to display in the page header
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Custom Footer HTML
            </label>
            <textarea
              value={settings.branding.customFooter || ''}
              onChange={(e) => onUpdate({
                branding: { ...settings.branding, customFooter: e.target.value }
              })}
              disabled={disabled}
              rows={3}
              placeholder="<!-- Custom footer content -->"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              HTML content to display in the page footer
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Layout className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dashboard Layout</h3>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Default Dashboard View
            </label>
            <select
              value={settings.dashboard.defaultView}
              onChange={(e) => onUpdate({
                dashboard: { ...settings.dashboard, defaultView: e.target.value as any }
              })}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
            >
              {dashboardViewOptions.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show Quick Actions
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Display quick action buttons
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input id="htmlcontenttodisplay"
                  type="checkbox"
                  checked={settings.dashboard.showQuickActions}
                  onChange={(e) => onUpdate({
                    dashboard: { ...settings.dashboard, showQuickActions: e.target.checked }
                  })}
                  disabled={disabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="displayrecentactivit" className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Recent Activity
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Display recent activity feed
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input id="displayrecentactivit"
                  type="checkbox"
                  checked={settings.dashboard.showRecentActivity}
                  onChange={(e) => onUpdate({
                    dashboard: { ...settings.dashboard, showRecentActivity: e.target.checked }
                  })}
                  disabled={disabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Items Per Page
            </label>
            <select
              value={settings.dashboard.itemsPerPage}
              onChange={(e) => onUpdate({
                dashboard: { ...settings.dashboard, itemsPerPage: parseInt(e.target.value) }
              })}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
            >
              <option value="10">10 items</option>
              <option value="25">25 items</option>
              <option value="50">50 items</option>
              <option value="100">100 items</option>
            </select>
          </div>
        </div>
      </div>

      {/* Custom CSS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Eye className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Custom CSS</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Additional Styles
            </label>
            <textarea
              value={settings.customCss || ''}
              onChange={(e) => onUpdate({ customCss: e.target.value })}
              disabled={disabled}
              rows={8}
              placeholder="/* Custom CSS styles */
.custom-button {
  background-color: #3B82F6;
  border-radius: 8px;
}"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Custom CSS will be applied to all pages. Use with caution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}