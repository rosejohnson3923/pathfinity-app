import React, { useState } from 'react';
import { Building2, Mail, Phone, MapPin, Clock, Globe, Calendar } from 'lucide-react';
import { SchoolSettings, TIMEZONE_OPTIONS, STATE_OPTIONS, GRADE_LEVEL_OPTIONS } from '../../types/settings';
import '../../design-system/tokens/colors.css';
import '../../design-system/tokens/spacing.css';
import '../../design-system/tokens/borders.css';
import '../../design-system/tokens/typography.css';
import '../../design-system/tokens/shadows.css';
import '../../design-system/tokens/dashboard.css';

interface SchoolSettingsFormProps {
  settings: SchoolSettings;
  onUpdate: (data: Partial<SchoolSettings>) => void;
  errors?: Partial<Record<keyof SchoolSettings, string>>;
  disabled?: boolean;
}

export function SchoolSettingsForm({ settings, onUpdate, errors = {}, disabled = false }: SchoolSettingsFormProps) {
  const [hoveredInput, setHoveredInput] = useState<string | null>(null);

  const handleInputChange = (field: keyof SchoolSettings, value: any) => {
    onUpdate({ [field]: value });
  };

  const handleNestedChange = (parent: keyof SchoolSettings, field: string, value: any) => {
    const parentValue = settings[parent] as any;
    onUpdate({
      [parent]: {
        ...parentValue,
        [field]: value
      }
    });
  };

  const handleGradeLevelsChange = (grade: string, checked: boolean) => {
    const updatedGrades = checked
      ? [...settings.gradeLevels, grade]
      : settings.gradeLevels.filter(g => g !== grade);

    onUpdate({ gradeLevels: updatedGrades });
  };

  const getInputStyles = (fieldName: string, hasError: boolean) => ({
    width: '100%',
    padding: 'var(--space-3)',
    border: hasError ? '1px solid #ef4444' : '1px solid var(--dashboard-border-primary)',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: disabled ? 'var(--dashboard-bg-secondary)' : 'var(--dashboard-bg-elevated)',
    color: 'var(--dashboard-text-primary)',
    fontSize: 'var(--text-sm)',
    cursor: disabled ? 'not-allowed' : 'text',
    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
    outline: 'none',
    ...(hoveredInput === fieldName && !disabled && !hasError ? { borderColor: 'var(--dashboard-border-hover)' } : {})
  });

  const labelStyles: React.CSSProperties = {
    display: 'block',
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-medium)',
    color: 'var(--dashboard-text-primary)',
    marginBottom: 'var(--space-2)'
  };

  const sectionHeaderStyles: React.CSSProperties = {
    fontSize: 'var(--text-lg)',
    fontWeight: 'var(--font-medium)',
    color: 'var(--dashboard-text-primary)'
  };

  const iconStyles: React.CSSProperties = {
    color: '#3b82f6'
  };

  const helperTextStyles: React.CSSProperties = {
    color: '#ef4444',
    fontSize: 'var(--text-sm)',
    marginTop: 'var(--space-1)'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Basic Information */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Building2 style={{ ...iconStyles, height: '20px', width: '20px' }} />
          <h3 style={sectionHeaderStyles}>
            Basic Information
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
          <div>
            <label htmlFor="schoolname" style={labelStyles}>School Name *</label>
            <input
              id="schoolname"
              type="text"
              value={settings.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onMouseEnter={() => setHoveredInput('name')}
              onMouseLeave={() => setHoveredInput(null)}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.name ? '#ef4444' : 'var(--dashboard-border-primary)';
                e.target.style.boxShadow = 'none';
              }}
              disabled={disabled}
              style={getInputStyles('name', !!errors.name)}
              placeholder="Enter school name"
            />
            {errors.name && (
              <p style={helperTextStyles}>{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="district" style={labelStyles}>District *</label>
            <input
              id="district"
              type="text"
              value={settings.district}
              onChange={(e) => handleInputChange('district', e.target.value)}
              onMouseEnter={() => setHoveredInput('district')}
              onMouseLeave={() => setHoveredInput(null)}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.district ? '#ef4444' : 'var(--dashboard-border-primary)';
                e.target.style.boxShadow = 'none';
              }}
              disabled={disabled}
              style={getInputStyles('district', !!errors.district)}
              placeholder="Enter district name"
            />
            {errors.district && (
              <p style={helperTextStyles}>{errors.district}</p>
            )}
          </div>
        </div>

        <div>
          <label style={labelStyles}>
            Description
          </label>
          <textarea
            value={settings.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            onMouseEnter={() => setHoveredInput('description')}
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
            style={getInputStyles('description', false)}
            placeholder="Enter school description"
          />
        </div>
      </div>

      {/* Contact Information */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Mail style={{ ...iconStyles, height: '20px', width: '20px' }} />
          <h3 style={sectionHeaderStyles}>
            Contact Information
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
          <div>
            <label htmlFor="emailaddress" style={labelStyles}>Email Address *</label>
            <input
              id="emailaddress"
              type="email"
              value={settings.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onMouseEnter={() => setHoveredInput('email')}
              onMouseLeave={() => setHoveredInput(null)}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.email ? '#ef4444' : 'var(--dashboard-border-primary)';
                e.target.style.boxShadow = 'none';
              }}
              disabled={disabled}
              style={getInputStyles('email', !!errors.email)}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p style={helperTextStyles}>{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="phonenumber" style={labelStyles}>Phone Number *</label>
            <input
              id="phonenumber"
              type="tel"
              value={settings.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              onMouseEnter={() => setHoveredInput('phone')}
              onMouseLeave={() => setHoveredInput(null)}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.phone ? '#ef4444' : 'var(--dashboard-border-primary)';
                e.target.style.boxShadow = 'none';
              }}
              disabled={disabled}
              style={getInputStyles('phone', !!errors.phone)}
              placeholder="Enter phone number"
            />
            {errors.phone && (
              <p style={helperTextStyles}>{errors.phone}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="website" style={labelStyles}>Website</label>
          <input
            id="website"
            type="url"
            value={settings.website || ''}
            onChange={(e) => handleInputChange('website', e.target.value)}
            onMouseEnter={() => setHoveredInput('website')}
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
            style={getInputStyles('website', false)}
            placeholder="https://example.com"
          />
        </div>
      </div>

      {/* Address */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <MapPin style={{ ...iconStyles, height: '20px', width: '20px' }} />
          <h3 style={sectionHeaderStyles}>
            Address
          </h3>
        </div>

        <div>
          <label htmlFor="streetaddress" style={labelStyles}>Street Address *</label>
          <input
            id="streetaddress"
            type="text"
            value={settings.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            onMouseEnter={() => setHoveredInput('address')}
            onMouseLeave={() => setHoveredInput(null)}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = errors.address ? '#ef4444' : 'var(--dashboard-border-primary)';
              e.target.style.boxShadow = 'none';
            }}
            disabled={disabled}
            style={getInputStyles('address', !!errors.address)}
            placeholder="Enter street address"
          />
          {errors.address && (
            <p style={helperTextStyles}>{errors.address}</p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
          <div>
            <label htmlFor="city" style={labelStyles}>City *</label>
            <input
              id="city"
              type="text"
              value={settings.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              onMouseEnter={() => setHoveredInput('city')}
              onMouseLeave={() => setHoveredInput(null)}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.city ? '#ef4444' : 'var(--dashboard-border-primary)';
                e.target.style.boxShadow = 'none';
              }}
              disabled={disabled}
              style={getInputStyles('city', !!errors.city)}
              placeholder="Enter city"
            />
            {errors.city && (
              <p style={helperTextStyles}>{errors.city}</p>
            )}
          </div>

          <div>
            <label style={labelStyles}>
              State *
            </label>
            <select
              value={settings.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              onMouseEnter={() => setHoveredInput('state')}
              onMouseLeave={() => setHoveredInput(null)}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.state ? '#ef4444' : 'var(--dashboard-border-primary)';
                e.target.style.boxShadow = 'none';
              }}
              disabled={disabled}
              style={getInputStyles('state', !!errors.state)}
            >
              <option value="">Select state</option>
              {STATE_OPTIONS.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && (
              <p style={helperTextStyles}>{errors.state}</p>
            )}
          </div>

          <div>
            <label htmlFor="zipcode" style={labelStyles}>ZIP Code *</label>
            <input
              id="zipcode"
              type="text"
              value={settings.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              onMouseEnter={() => setHoveredInput('zipCode')}
              onMouseLeave={() => setHoveredInput(null)}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.zipCode ? '#ef4444' : 'var(--dashboard-border-primary)';
                e.target.style.boxShadow = 'none';
              }}
              disabled={disabled}
              style={getInputStyles('zipCode', !!errors.zipCode)}
              placeholder="Enter ZIP code"
            />
            {errors.zipCode && (
              <p style={helperTextStyles}>{errors.zipCode}</p>
            )}
          </div>
        </div>
      </div>

      {/* Regional Settings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Globe style={{ ...iconStyles, height: '20px', width: '20px' }} />
          <h3 style={sectionHeaderStyles}>
            Regional Settings
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
          <div>
            <label style={labelStyles}>
              Timezone *
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              onMouseEnter={() => setHoveredInput('timezone')}
              onMouseLeave={() => setHoveredInput(null)}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = errors.timezone ? '#ef4444' : 'var(--dashboard-border-primary)';
                e.target.style.boxShadow = 'none';
              }}
              disabled={disabled}
              style={getInputStyles('timezone', !!errors.timezone)}
            >
              <option value="">Select timezone</option>
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
            {errors.timezone && (
              <p style={helperTextStyles}>{errors.timezone}</p>
            )}
          </div>

          <div>
            <label style={labelStyles}>
              Locale
            </label>
            <select
              value={settings.locale}
              onChange={(e) => handleInputChange('locale', e.target.value)}
              onMouseEnter={() => setHoveredInput('locale')}
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
              style={getInputStyles('locale', false)}
            >
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
              <option value="es-US">Spanish (US)</option>
              <option value="es-MX">Spanish (Mexico)</option>
              <option value="fr-CA">French (Canada)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Academic Year */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Calendar style={{ ...iconStyles, height: '20px', width: '20px' }} />
          <h3 style={sectionHeaderStyles}>
            Academic Year
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
          <div>
            <label htmlFor="startdate" style={labelStyles}>Start Date</label>
            <input
              id="startdate"
              type="date"
              value={settings.academicYear.startDate}
              onChange={(e) => handleNestedChange('academicYear', 'startDate', e.target.value)}
              onMouseEnter={() => setHoveredInput('startDate')}
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
              style={getInputStyles('startDate', false)}
            />
          </div>

          <div>
            <label htmlFor="enddate" style={labelStyles}>End Date</label>
            <input
              id="enddate"
              type="date"
              value={settings.academicYear.endDate}
              onChange={(e) => handleNestedChange('academicYear', 'endDate', e.target.value)}
              onMouseEnter={() => setHoveredInput('endDate')}
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
              style={getInputStyles('endDate', false)}
            />
          </div>
        </div>
      </div>

      {/* Grade Levels */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Clock style={{ ...iconStyles, height: '20px', width: '20px' }} />
          <h3 style={sectionHeaderStyles}>
            Grade Levels Offered
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--space-4)' }}>
          {GRADE_LEVEL_OPTIONS.map((grade) => (
            <label key={grade} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: disabled ? 'not-allowed' : 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.gradeLevels.includes(grade)}
                onChange={(e) => handleGradeLevelsChange(grade, e.target.checked)}
                disabled={disabled}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#3b82f6',
                  cursor: disabled ? 'not-allowed' : 'pointer'
                }}
              />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>{grade}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
