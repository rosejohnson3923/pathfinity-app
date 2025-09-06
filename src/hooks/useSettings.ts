import { useState, useEffect, useCallback } from 'react';
import {
  SchoolSettings,
  NotificationSettings,
  SystemSettings,
  AppearanceSettings,
  PrivacySettings,
  SettingsSection,
  SettingsFormData,
  SettingsValidationErrors,
  DEFAULT_SCHOOL_SETTINGS,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_SYSTEM_SETTINGS,
  DEFAULT_APPEARANCE_SETTINGS,
  DEFAULT_PRIVACY_SETTINGS
} from '../types/settings';

interface UseSettingsReturn {
  schoolSettings: SchoolSettings;
  notificationSettings: NotificationSettings;
  systemSettings: SystemSettings;
  appearanceSettings: AppearanceSettings;
  privacySettings: PrivacySettings;
  loading: boolean;
  saving: boolean;
  errors: SettingsValidationErrors;
  updateSchoolSettings: (data: Partial<SchoolSettings>) => Promise<void>;
  updateNotificationSettings: (data: Partial<NotificationSettings>) => Promise<void>;
  updateSystemSettings: (data: Partial<SystemSettings>) => Promise<void>;
  updateAppearanceSettings: (data: Partial<AppearanceSettings>) => Promise<void>;
  updatePrivacySettings: (data: Partial<PrivacySettings>) => Promise<void>;
  saveAllSettings: () => Promise<void>;
  resetToDefaults: (section: SettingsSection) => Promise<void>;
  validateSettings: (section: SettingsSection, data: any) => SettingsValidationErrors;
}


export function useSettings(): UseSettingsReturn {
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(DEFAULT_SCHOOL_SETTINGS);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>(DEFAULT_APPEARANCE_SETTINGS);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<SettingsValidationErrors>({});

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // In a real app, these would be API calls
      // For now, we'll use localStorage as mock persistence
      const storedSchoolSettings = localStorage.getItem('school-settings');
      const storedNotificationSettings = localStorage.getItem('notification-settings');
      const storedSystemSettings = localStorage.getItem('system-settings');
      const storedAppearanceSettings = localStorage.getItem('appearance-settings');
      const storedPrivacySettings = localStorage.getItem('privacy-settings');

      if (storedSchoolSettings) {
        setSchoolSettings(JSON.parse(storedSchoolSettings));
      }
      if (storedNotificationSettings) {
        setNotificationSettings(JSON.parse(storedNotificationSettings));
      }
      if (storedSystemSettings) {
        setSystemSettings(JSON.parse(storedSystemSettings));
      }
      if (storedAppearanceSettings) {
        setAppearanceSettings(JSON.parse(storedAppearanceSettings));
      }
      if (storedPrivacySettings) {
        setPrivacySettings(JSON.parse(storedPrivacySettings));
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateSettings = useCallback((section: SettingsSection, data: any): SettingsValidationErrors => {
    const newErrors: SettingsValidationErrors = {};

    switch (section) {
      case 'school':
        const schoolErrors: Partial<Record<keyof SchoolSettings, string>> = {};
        
        if (!data.name?.trim()) {
          schoolErrors.name = 'School name is required';
        }
        if (!data.district?.trim()) {
          schoolErrors.district = 'District name is required';
        }
        if (!data.email?.trim()) {
          schoolErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
          schoolErrors.email = 'Please enter a valid email address';
        }
        if (!data.phone?.trim()) {
          schoolErrors.phone = 'Phone number is required';
        }
        if (!data.address?.trim()) {
          schoolErrors.address = 'Address is required';
        }
        if (!data.city?.trim()) {
          schoolErrors.city = 'City is required';
        }
        if (!data.state?.trim()) {
          schoolErrors.state = 'State is required';
        }
        if (!data.zipCode?.trim()) {
          schoolErrors.zipCode = 'ZIP code is required';
        }
        if (!data.timezone) {
          schoolErrors.timezone = 'Timezone is required';
        }
        
        if (Object.keys(schoolErrors).length > 0) {
          newErrors.school = schoolErrors;
        }
        break;

      case 'system':
        const systemErrors: Partial<Record<keyof SystemSettings, string>> = {};
        
        if (data.security?.passwordPolicy?.minLength < 6) {
          systemErrors.security = 'Minimum password length must be at least 6 characters';
        }
        if (data.security?.sessionTimeout < 5) {
          systemErrors.security = 'Session timeout must be at least 5 minutes';
        }
        
        if (Object.keys(systemErrors).length > 0) {
          newErrors.system = systemErrors;
        }
        break;

      case 'appearance':
        const appearanceErrors: Partial<Record<keyof AppearanceSettings, string>> = {};
        
        if (data.primaryColor && !/^#[0-9A-F]{6}$/i.test(data.primaryColor)) {
          appearanceErrors.primaryColor = 'Please enter a valid hex color code';
        }
        if (data.secondaryColor && !/^#[0-9A-F]{6}$/i.test(data.secondaryColor)) {
          appearanceErrors.secondaryColor = 'Please enter a valid hex color code';
        }
        
        if (Object.keys(appearanceErrors).length > 0) {
          newErrors.appearance = appearanceErrors;
        }
        break;

      case 'privacy':
        const privacyErrors: Partial<Record<keyof PrivacySettings, string>> = {};
        
        if (data.dataRetention?.userDataDays < 30) {
          privacyErrors.dataRetention = 'User data retention must be at least 30 days';
        }
        
        if (Object.keys(privacyErrors).length > 0) {
          newErrors.privacy = privacyErrors;
        }
        break;
    }

    return newErrors;
  }, []);

  const updateSchoolSettings = async (data: Partial<SchoolSettings>) => {
    const updatedSettings = {
      ...schoolSettings,
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: 'principal@plainviewisd.edu' // In real app, get from auth context
    };

    const validationErrors = validateSettings('school', updatedSettings);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setSchoolSettings(updatedSettings);
      localStorage.setItem('school-settings', JSON.stringify(updatedSettings));
    }
  };

  const updateNotificationSettings = async (data: Partial<NotificationSettings>) => {
    const updatedSettings = {
      ...notificationSettings,
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: 'principal@plainviewisd.edu'
    };

    setNotificationSettings(updatedSettings);
    localStorage.setItem('notification-settings', JSON.stringify(updatedSettings));
  };

  const updateSystemSettings = async (data: Partial<SystemSettings>) => {
    const updatedSettings = {
      ...systemSettings,
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: 'principal@plainviewisd.edu'
    };

    const validationErrors = validateSettings('system', updatedSettings);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setSystemSettings(updatedSettings);
      localStorage.setItem('system-settings', JSON.stringify(updatedSettings));
    }
  };

  const updateAppearanceSettings = async (data: Partial<AppearanceSettings>) => {
    const updatedSettings = {
      ...appearanceSettings,
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: 'principal@plainviewisd.edu'
    };

    const validationErrors = validateSettings('appearance', updatedSettings);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setAppearanceSettings(updatedSettings);
      localStorage.setItem('appearance-settings', JSON.stringify(updatedSettings));
    }
  };

  const updatePrivacySettings = async (data: Partial<PrivacySettings>) => {
    const updatedSettings = {
      ...privacySettings,
      ...data,
      updatedAt: new Date().toISOString(),
      updatedBy: 'principal@plainviewisd.edu'
    };

    const validationErrors = validateSettings('privacy', updatedSettings);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setPrivacySettings(updatedSettings);
      localStorage.setItem('privacy-settings', JSON.stringify(updatedSettings));
    }
  };

  const saveAllSettings = async () => {
    try {
      setSaving(true);
      
      // In a real app, this would make API calls to save all settings
      await Promise.all([
        updateSchoolSettings({}),
        updateNotificationSettings({}),
        updateSystemSettings({}),
        updateAppearanceSettings({}),
        updatePrivacySettings({})
      ]);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async (section: SettingsSection) => {
    try {
      setSaving(true);

      switch (section) {
        case 'school':
          setSchoolSettings(DEFAULT_SCHOOL_SETTINGS);
          localStorage.setItem('school-settings', JSON.stringify(DEFAULT_SCHOOL_SETTINGS));
          break;
        case 'notifications':
          setNotificationSettings(DEFAULT_NOTIFICATION_SETTINGS);
          localStorage.setItem('notification-settings', JSON.stringify(DEFAULT_NOTIFICATION_SETTINGS));
          break;
        case 'system':
          setSystemSettings(DEFAULT_SYSTEM_SETTINGS);
          localStorage.setItem('system-settings', JSON.stringify(DEFAULT_SYSTEM_SETTINGS));
          break;
        case 'appearance':
          setAppearanceSettings(DEFAULT_APPEARANCE_SETTINGS);
          localStorage.setItem('appearance-settings', JSON.stringify(DEFAULT_APPEARANCE_SETTINGS));
          break;
        case 'privacy':
          setPrivacySettings(DEFAULT_PRIVACY_SETTINGS);
          localStorage.setItem('privacy-settings', JSON.stringify(DEFAULT_PRIVACY_SETTINGS));
          break;
      }

      // Clear any errors for this section
      setErrors(prev => ({ ...prev, [section]: undefined }));

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`Failed to reset ${section} settings:`, error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return {
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
    resetToDefaults,
    validateSettings
  };
}