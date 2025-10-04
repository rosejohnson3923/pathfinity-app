import React, { useState } from 'react';
import { Palette, Monitor, Sun, Moon, Eye, Upload, Layout } from 'lucide-react';
import { AppearanceSettings } from '../../types/settings';
import '../../design-system/tokens/colors.css';
import '../../design-system/tokens/spacing.css';
import '../../design-system/tokens/borders.css';
import '../../design-system/tokens/typography.css';
import '../../design-system/tokens/shadows.css';
import '../../design-system/tokens/dashboard.css';

interface AppearanceSettingsFormProps {
  settings: AppearanceSettings | null;
  onUpdate: (settings: Partial<AppearanceSettings>) => void;
  errors?: Partial<Record<keyof AppearanceSettings, string>>;
  disabled?: boolean;
}

export function AppearanceSettingsForm({ settings, onUpdate, errors, disabled }: AppearanceSettingsFormProps) {
  const [hoveredInput, setHoveredInput] = useState<string | null>(null);

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
      {/* Theme Settings */}
      <div style={cardStyles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <Palette style={{ height: '20px', width: '20px', color: '#3b82f6' }} />
          <h3 style={sectionHeaderStyles}>Theme & Colors</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div>
            <label style={{ ...labelStyles, marginBottom: 'var(--space-3)' }}>
              Theme Mode
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => onUpdate({ theme: value as 'light' | 'dark' | 'auto' })}
                  disabled={disabled}
                  style={{
                    padding: 'var(--space-4)',
                    border: settings.theme === value ? '2px solid #3b82f6' : '2px solid var(--dashboard-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: settings.theme === value ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.5 : 1,
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--space-2)'
                  }}
                >
                  <Icon style={{
                    height: '24px',
                    width: '24px',
                    color: settings.theme === value ? '#3b82f6' : 'var(--dashboard-text-tertiary)'
                  }} />
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    color: settings.theme === value ? '#3b82f6' : 'var(--dashboard-text-primary)'
                  }}>
                    {label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-6)' }}>
            <div>
              <label htmlFor="primaryColor" style={labelStyles}>
                Primary Color
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <input
                  id="primaryColor"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => onUpdate({ primaryColor: e.target.value })}
                  disabled={disabled}
                  style={{
                    width: '48px',
                    height: '40px',
                    border: `1px solid var(--dashboard-border-primary)`,
                    borderRadius: 'var(--radius-lg)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.5 : 1
                  }}
                  aria-label="Primary color picker"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => onUpdate({ primaryColor: e.target.value })}
                  onMouseEnter={() => setHoveredInput('primaryColor')}
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
                  placeholder="#3B82F6"
                  aria-label="Primary color hex code"
                  style={{ ...getInputStyles('primaryColor'), flex: 1 }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="secondaryColor" style={labelStyles}>
                Secondary Color
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <input
                  id="secondaryColor"
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => onUpdate({ secondaryColor: e.target.value })}
                  aria-label="Secondary color picker"
                  disabled={disabled}
                  style={{
                    width: '48px',
                    height: '40px',
                    border: `1px solid var(--dashboard-border-primary)`,
                    borderRadius: 'var(--radius-lg)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.5 : 1
                  }}
                />
                <input
                  type="text"
                  value={settings.secondaryColor}
                  onChange={(e) => onUpdate({ secondaryColor: e.target.value })}
                  onMouseEnter={() => setHoveredInput('secondaryColor')}
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
                  placeholder="#6B7280"
                  style={{ ...getInputStyles('secondaryColor'), flex: 1 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Branding */}
      <div style={cardStyles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <Upload style={{ height: '20px', width: '20px', color: '#10b981' }} />
          <h3 style={sectionHeaderStyles}>Branding</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <label htmlFor="displaypathfinitybra" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Show Platform Branding</label>
              <p style={descriptionStyles}>
                Display Pathfinity branding in footer
              </p>
            </div>
            {renderToggle(
              settings.branding.showBranding,
              () => onUpdate({
                branding: { ...settings.branding, showBranding: !settings.branding.showBranding }
              }),
              'displaypathfinitybra'
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
            <div>
              <label htmlFor="logourl" style={labelStyles}>Logo URL</label>
              <input
                id="logourl"
                type="url"
                value={settings.logo || ''}
                onChange={(e) => onUpdate({ logo: e.target.value })}
                onMouseEnter={() => setHoveredInput('logo')}
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
                placeholder="https://example.com/logo.png"
                style={getInputStyles('logo')}
              />
              <p style={helperTextStyles}>
                Recommended size: 200x50 pixels
              </p>
            </div>

            <div>
              <label htmlFor="faviconurl" style={labelStyles}>Favicon URL</label>
              <input
                id="faviconurl"
                type="url"
                value={settings.favicon || ''}
                onChange={(e) => onUpdate({ favicon: e.target.value })}
                onMouseEnter={() => setHoveredInput('favicon')}
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
                placeholder="https://example.com/favicon.ico"
                style={getInputStyles('favicon')}
              />
              <p style={helperTextStyles}>
                32x32 or 16x16 pixel ICO file
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="htmlcontenttodisplay" style={labelStyles}>Custom Header HTML</label>
            <textarea
              id="htmlcontenttodisplay"
              value={settings.branding.customHeader || ''}
              onChange={(e) => onUpdate({
                branding: { ...settings.branding, customHeader: e.target.value }
              })}
              onMouseEnter={() => setHoveredInput('customHeader')}
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
              placeholder="<!-- Custom header content -->"
              style={{ ...getInputStyles('customHeader'), fontFamily: 'monospace' }}
            />
            <p style={helperTextStyles}>
              HTML content to display in the page header
            </p>
          </div>

          <div>
            <label style={labelStyles}>
              Custom Footer HTML
            </label>
            <textarea
              value={settings.branding.customFooter || ''}
              onChange={(e) => onUpdate({
                branding: { ...settings.branding, customFooter: e.target.value }
              })}
              onMouseEnter={() => setHoveredInput('customFooter')}
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
              placeholder="<!-- Custom footer content -->"
              style={{ ...getInputStyles('customFooter'), fontFamily: 'monospace' }}
            />
            <p style={helperTextStyles}>
              HTML content to display in the page footer
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Settings */}
      <div style={cardStyles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <Layout style={{ height: '20px', width: '20px', color: '#8b5cf6' }} />
          <h3 style={sectionHeaderStyles}>Dashboard Layout</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div>
            <label style={labelStyles}>
              Default Dashboard View
            </label>
            <select
              value={settings.dashboard.defaultView}
              onChange={(e) => onUpdate({
                dashboard: { ...settings.dashboard, defaultView: e.target.value as any }
              })}
              onMouseEnter={() => setHoveredInput('defaultView')}
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
              style={getInputStyles('defaultView')}
            >
              {dashboardViewOptions.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>
                  Show Quick Actions
                </label>
                <p style={descriptionStyles}>
                  Display quick action buttons
                </p>
              </div>
              {renderToggle(
                settings.dashboard.showQuickActions,
                () => onUpdate({
                  dashboard: { ...settings.dashboard, showQuickActions: !settings.dashboard.showQuickActions }
                }),
                'showQuickActions'
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <label htmlFor="displayrecentactivit" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>Show Recent Activity</label>
                <p style={descriptionStyles}>
                  Display recent activity feed
                </p>
              </div>
              {renderToggle(
                settings.dashboard.showRecentActivity,
                () => onUpdate({
                  dashboard: { ...settings.dashboard, showRecentActivity: !settings.dashboard.showRecentActivity }
                }),
                'displayrecentactivit'
              )}
            </div>
          </div>

          <div>
            <label style={labelStyles}>
              Items Per Page
            </label>
            <select
              value={settings.dashboard.itemsPerPage}
              onChange={(e) => onUpdate({
                dashboard: { ...settings.dashboard, itemsPerPage: parseInt(e.target.value) }
              })}
              onMouseEnter={() => setHoveredInput('itemsPerPage')}
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
              style={getInputStyles('itemsPerPage')}
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
      <div style={cardStyles}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <Eye style={{ height: '20px', width: '20px', color: '#f97316' }} />
          <h3 style={sectionHeaderStyles}>Custom CSS</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={labelStyles}>
              Additional Styles
            </label>
            <textarea
              value={settings.customCss || ''}
              onChange={(e) => onUpdate({ customCss: e.target.value })}
              onMouseEnter={() => setHoveredInput('customCss')}
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
              rows={8}
              placeholder={`/* Custom CSS styles */
.custom-button {
  background-color: #3B82F6;
  border-radius: 8px;
}`}
              style={{ ...getInputStyles('customCss'), fontFamily: 'monospace' }}
            />
            <p style={helperTextStyles}>
              Custom CSS will be applied to all pages. Use with caution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
