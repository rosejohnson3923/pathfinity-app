import React from 'react';
import { Lock, Shield, Eye, FileText, Clock, CheckCircle2 } from 'lucide-react';
import { PrivacySettings } from '../../types/settings';

interface PrivacySettingsFormProps {
  settings: PrivacySettings | null;
  onUpdate: (settings: Partial<PrivacySettings>) => void;
  errors?: Partial<Record<keyof PrivacySettings, string>>;
  disabled?: boolean;
}

export function PrivacySettingsForm({ settings, onUpdate, errors, disabled }: PrivacySettingsFormProps) {
  if (!settings) return null;

  return (
    <div className="space-y-8">
      {/* Data Retention */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Data Retention</h3>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Configure how long different types of data are retained before automatic deletion.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="userdataretentionday" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User Data Retention (days)
              </label><input id="userdataretentionday"
                type="number"
                value={settings.dataRetention.userDataDays}
                onChange={(e) => onUpdate({
                  dataRetention: {
                    ...settings.dataRetention,
                    userDataDays: parseInt(e.target.value)
                  }
                })}
                disabled={disabled}
                min="30"
                max="2555" // ~7 years
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Student records, assessments, and personal data
              </p>
            </div>
            
            <div>
              <label htmlFor="logdataretentiondays" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Log Data Retention (days)
              </label><input id="logdataretentiondays"
                type="number"
                value={settings.dataRetention.logDataDays}
                onChange={(e) => onUpdate({
                  dataRetention: {
                    ...settings.dataRetention,
                    logDataDays: parseInt(e.target.value)
                  }
                })}
                disabled={disabled}
                min="7"
                max="2555"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                System logs, audit trails, and activity logs
              </p>
            </div>
            
            <div>
              <label htmlFor="backupdataretentiond" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Backup Data Retention (days)
              </label><input id="backupdataretentiond"
                type="number"
                value={settings.dataRetention.backupDataDays}
                onChange={(e) => onUpdate({
                  dataRetention: {
                    ...settings.dataRetention,
                    backupDataDays: parseInt(e.target.value)
                  }
                })}
                disabled={disabled}
                min="30"
                max="2555"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Database backups and archived data
              </p>
            </div>
            
            <div>
              <label htmlFor="inactiveuserdatadays" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inactive User Data (days)
              </label><input id="inactiveuserdatadays"
                type="number"
                value={settings.dataRetention.inactiveUserDays}
                onChange={(e) => onUpdate({
                  dataRetention: {
                    ...settings.dataRetention,
                    inactiveUserDays: parseInt(e.target.value)
                  }
                })}
                disabled={disabled}
                min="90"
                max="1095" // 3 years
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Data for users who haven't logged in
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Privacy Controls</h3>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="collectanonymizedusa" className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Analytics Collection
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Collect anonymized usage analytics to improve the platform
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input id="collectanonymizedusa"
                type="checkbox"
                checked={settings.privacy.allowAnalytics}
                onChange={(e) => onUpdate({
                  privacy: { ...settings.privacy, allowAnalytics: e.target.checked }
                })}
                disabled={disabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="enablecookiesforenha" className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Cookies
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enable cookies for enhanced user experience and preferences
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input id="enablecookiesforenha"
                type="checkbox"
                checked={settings.privacy.allowCookies}
                onChange={(e) => onUpdate({
                  privacy: { ...settings.privacy, allowCookies: e.target.checked }
                })}
                disabled={disabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="shareaggregatedusage" className="text-sm font-medium text-gray-700 dark:text-gray-300">Share Usage Data
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Share aggregated usage statistics with Pathfinity for product improvement
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input id="shareaggregatedusage"
                type="checkbox"
                checked={settings.privacy.shareUsageData}
                onChange={(e) => onUpdate({
                  privacy: { ...settings.privacy, shareUsageData: e.target.checked }
                })}
                disabled={disabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="enableintegrationswi" className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Third-Party Integrations
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Enable integrations with external educational tools and services
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input id="enableintegrationswi"
                type="checkbox"
                checked={settings.privacy.allowThirdPartyIntegrations}
                onChange={(e) => onUpdate({
                  privacy: { ...settings.privacy, allowThirdPartyIntegrations: e.target.checked }
                })}
                disabled={disabled}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Compliance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Compliance & Legal</h3>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="ferpacompliant" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2"><span>FERPA Compliant</span>
                  {settings.compliance.ferpaCompliant && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Educational records privacy
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input id="ferpacompliant"
                  type="checkbox"
                  checked={settings.compliance.ferpaCompliant}
                  onChange={(e) => onUpdate({
                    compliance: { ...settings.compliance, ferpaCompliant: e.target.checked }
                  })}
                  disabled={disabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="coppacompliant" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2"><span>COPPA Compliant</span>
                  {settings.compliance.coppaCompliant && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Children's online privacy
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input id="coppacompliant"
                  type="checkbox"
                  checked={settings.compliance.coppaCompliant}
                  onChange={(e) => onUpdate({
                    compliance: { ...settings.compliance, coppaCompliant: e.target.checked }
                  })}
                  disabled={disabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="gdprcompliant" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2"><span>GDPR Compliant</span>
                  {settings.compliance.gdprCompliant && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  European data protection
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input id="gdprcompliant"
                  type="checkbox"
                  checked={settings.compliance.gdprCompliant}
                  onChange={(e) => onUpdate({
                    compliance: { ...settings.compliance, gdprCompliant: e.target.checked }
                  })}
                  disabled={disabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="privacynoticeurl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Privacy Notice URL
              </label><input id="privacynoticeurl"
                type="url"
                value={settings.compliance.privacyNoticeUrl || ''}
                onChange={(e) => onUpdate({
                  compliance: { ...settings.compliance, privacyNoticeUrl: e.target.value }
                })}
                disabled={disabled}
                placeholder="https://school.edu/privacy"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Link to your privacy policy document
              </p>
            </div>
            
            <div>
              <label htmlFor="termsofserviceurl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Terms of Service URL
              </label><input id="termsofserviceurl"
                type="url"
                value={settings.compliance.termsOfServiceUrl || ''}
                onChange={(e) => onUpdate({
                  compliance: { ...settings.compliance, termsOfServiceUrl: e.target.value }
                })}
                disabled={disabled}
                placeholder="https://school.edu/terms"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Link to your terms of service document
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              Privacy & Compliance Information
            </h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <p>
                • <strong>FERPA:</strong> Protects student educational records and gives parents/students rights over their records
              </p>
              <p>
                • <strong>COPPA:</strong> Requires parental consent for collecting personal information from children under 13
              </p>
              <p>
                • <strong>GDPR:</strong> Provides data protection rights for individuals in the European Union
              </p>
              <p className="mt-3 pt-2 border-t border-blue-200 dark:border-blue-700">
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