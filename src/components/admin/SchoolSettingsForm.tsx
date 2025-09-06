import React from 'react';
import { Building2, Mail, Phone, MapPin, Clock, Globe, Calendar } from 'lucide-react';
import { SchoolSettings, TIMEZONE_OPTIONS, STATE_OPTIONS, GRADE_LEVEL_OPTIONS } from '../../types/settings';

interface SchoolSettingsFormProps {
  settings: SchoolSettings;
  onUpdate: (data: Partial<SchoolSettings>) => void;
  errors?: Partial<Record<keyof SchoolSettings, string>>;
  disabled?: boolean;
}

export function SchoolSettingsForm({ settings, onUpdate, errors = {}, disabled = false }: SchoolSettingsFormProps) {
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

  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Basic Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="schoolname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">School Name *
            </label><input id="schoolname"
              type="text"
              value={settings.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                errors.name 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              } ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
              placeholder="Enter school name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="district" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">District *
            </label><input id="district"
              type="text"
              value={settings.district}
              onChange={(e) => handleInputChange('district', e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                errors.district 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              } ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
              placeholder="Enter district name"
            />
            {errors.district && (
              <p className="text-red-500 text-sm mt-1">{errors.district}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={settings.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            disabled={disabled}
            rows={3}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
            }`}
            placeholder="Enter school description"
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Mail className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Contact Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="emailaddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address *
            </label><input id="emailaddress"
              type="email"
              value={settings.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                errors.email 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              } ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="phonenumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number *
            </label><input id="phonenumber"
              type="tel"
              value={settings.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                errors.phone 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              } ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
              placeholder="Enter phone number"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Website
          </label><input id="website"
            type="url"
            value={settings.website || ''}
            onChange={(e) => handleInputChange('website', e.target.value)}
            disabled={disabled}
            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
            }`}
            placeholder="https://example.com"
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Address
          </h3>
        </div>

        <div>
          <label htmlFor="streetaddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Street Address *
          </label><input id="streetaddress"
            type="text"
            value={settings.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            disabled={disabled}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
              errors.address 
                ? 'border-red-300 dark:border-red-600' 
                : 'border-gray-300 dark:border-gray-600'
            } ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
            placeholder="Enter street address"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City *
            </label><input id="city"
              type="text"
              value={settings.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                errors.city 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              } ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
              placeholder="Enter city"
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              State *
            </label>
            <select
              value={settings.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                errors.state 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              } ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
            >
              <option value="">Select state</option>
              {STATE_OPTIONS.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && (
              <p className="text-red-500 text-sm mt-1">{errors.state}</p>
            )}
          </div>

          <div>
            <label htmlFor="zipcode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ZIP Code *
            </label><input id="zipcode"
              type="text"
              value={settings.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                errors.zipCode 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              } ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
              placeholder="Enter ZIP code"
            />
            {errors.zipCode && (
              <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>
            )}
          </div>
        </div>
      </div>

      {/* Regional Settings */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Regional Settings
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timezone *
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                errors.timezone 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600'
              } ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
            >
              <option value="">Select timezone</option>
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
            {errors.timezone && (
              <p className="text-red-500 text-sm mt-1">{errors.timezone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Locale
            </label>
            <select
              value={settings.locale}
              onChange={(e) => handleInputChange('locale', e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
              }`}
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
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Academic Year
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="startdate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date
            </label><input id="startdate"
              type="date"
              value={settings.academicYear.startDate}
              onChange={(e) => handleNestedChange('academicYear', 'startDate', e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
              }`}
            />
          </div>

          <div>
            <label htmlFor="enddate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date
            </label><input id="enddate"
              type="date"
              value={settings.academicYear.endDate}
              onChange={(e) => handleNestedChange('academicYear', 'endDate', e.target.value)}
              disabled={disabled}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
              }`}
            />
          </div>
        </div>
      </div>

      {/* Grade Levels */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Grade Levels Offered
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GRADE_LEVEL_OPTIONS.map((grade) => (
            <label key={grade} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.gradeLevels.includes(grade)}
                onChange={(e) => handleGradeLevelsChange(grade, e.target.checked)}
                disabled={disabled}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{grade}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}