import React, { useState } from 'react';
import { X, Building2, Mail, User, Globe, MapPin } from 'lucide-react';
import { TenantFormData, SubscriptionTier, SUBSCRIPTION_TIER_LABELS, REGIONS } from '../../../types/tenant';

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tenantData: TenantFormData) => Promise<void>;
  isLoading?: boolean;
}

export function AddTenantModal({ isOpen, onClose, onSubmit, isLoading = false }: AddTenantModalProps) {
  const [formData, setFormData] = useState<TenantFormData>({
    name: '',
    domain: '',
    subdomain: '',
    contactEmail: '',
    primaryContact: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      title: ''
    },
    tier: 'professional',
    region: 'us-east-1'
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof TenantFormData | 'primaryContact.firstName' | 'primaryContact.lastName' | 'primaryContact.email', string>>>({});

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required';
    }

    if (!formData.subdomain.trim()) {
      newErrors.subdomain = 'Subdomain is required';
    } else if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(formData.subdomain)) {
      newErrors.subdomain = 'Subdomain must contain only lowercase letters, numbers, and hyphens';
    }

    if (!formData.domain.trim()) {
      newErrors.domain = 'Domain is required';
    } else if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$/.test(formData.domain)) {
      newErrors.domain = 'Please enter a valid domain name';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    if (!formData.primaryContact.firstName.trim()) {
      newErrors['primaryContact.firstName'] = 'First name is required';
    }

    if (!formData.primaryContact.lastName.trim()) {
      newErrors['primaryContact.lastName'] = 'Last name is required';
    }

    if (!formData.primaryContact.email.trim()) {
      newErrors['primaryContact.email'] = 'Primary contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.primaryContact.email)) {
      newErrors['primaryContact.email'] = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Error creating tenant:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      domain: '',
      subdomain: '',
      contactEmail: '',
      primaryContact: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        title: ''
      },
      tier: 'professional',
      region: 'us-east-1'
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof TenantFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleContactChange = (field: keyof TenantFormData['primaryContact'], value: string) => {
    setFormData(prev => ({
      ...prev,
      primaryContact: { ...prev.primaryContact, [field]: value }
    }));
    const errorKey = `primaryContact.${field}` as keyof typeof errors;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: undefined }));
    }
  };

  const handleSubdomainChange = (value: string) => {
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    handleInputChange('subdomain', cleanValue);
    
    // Auto-generate domain suggestion
    if (cleanValue) {
      handleInputChange('domain', `${cleanValue}.edu`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Tenant</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Organization Information */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Organization Information
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="organizationname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Organization Name *
                </label><input id="organizationname"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    errors.name 
                      ? 'border-red-300 dark:border-red-600' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter organization name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="input9a61yw" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subdomain *
                </label>
                <div className="flex">
                  <input id="input9a61yw"
                    type="text"
                    value={formData.subdomain}
                    onChange={(e) => handleSubdomainChange(e.target.value)}
                    className={`flex-1 px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.subdomain 
                        ? 'border-red-300 dark:border-red-600' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="myschool"
                  />
                  <span className="px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-lg text-gray-500 dark:text-gray-400">
                    .pathfinity.com
                  </span>
                </div>
                {errors.subdomain && (
                  <p className="text-red-500 text-sm mt-1">{errors.subdomain}</p>
                )}
              </div>

              <div>
                <label htmlFor="customdomain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Custom Domain *
                </label><input id="customdomain"
                  type="text"
                  value={formData.domain}
                  onChange={(e) => handleInputChange('domain', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    errors.domain 
                      ? 'border-red-300 dark:border-red-600' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="myschool.edu"
                />
                {errors.domain && (
                  <p className="text-red-500 text-sm mt-1">{errors.domain}</p>
                )}
              </div>

              <div>
                <label htmlFor="contactemail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Email *
                </label><input id="contactemail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    errors.contactEmail 
                      ? 'border-red-300 dark:border-red-600' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="admin@myschool.edu"
                />
                {errors.contactEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Region *
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {REGIONS.map((region) => (
                    <option key={region.code} value={region.code}>
                      {region.flag} {region.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Primary Contact */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Primary Contact
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name *
                </label><input id="firstname"
                  type="text"
                  value={formData.primaryContact.firstName}
                  onChange={(e) => handleContactChange('firstName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    errors['primaryContact.firstName'] 
                      ? 'border-red-300 dark:border-red-600' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter first name"
                />
                {errors['primaryContact.firstName'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['primaryContact.firstName']}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name *
                </label><input id="lastname"
                  type="text"
                  value={formData.primaryContact.lastName}
                  onChange={(e) => handleContactChange('lastName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    errors['primaryContact.lastName'] 
                      ? 'border-red-300 dark:border-red-600' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter last name"
                />
                {errors['primaryContact.lastName'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['primaryContact.lastName']}</p>
                )}
              </div>

              <div>
                <label htmlFor="emailaddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address *
                </label><input id="emailaddress"
                  type="email"
                  value={formData.primaryContact.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                    errors['primaryContact.email'] 
                      ? 'border-red-300 dark:border-red-600' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="john.doe@myschool.edu"
                />
                {errors['primaryContact.email'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['primaryContact.email']}</p>
                )}
              </div>

              <div>
                <label htmlFor="phonenumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number
                </label><input id="phonenumber"
                  type="tel"
                  value={formData.primaryContact.phone}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title
                </label><input id="title"
                  type="text"
                  value={formData.primaryContact.title}
                  onChange={(e) => handleContactChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Superintendent"
                />
              </div>
            </div>
          </div>

          {/* Subscription Plan */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Subscription Plan
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(['basic', 'professional', 'enterprise'] as SubscriptionTier[]).map((tier) => (
                <label
                  key={tier}
                  className={`relative flex flex-col p-6 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.tier === tier
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="tier"
                    value={tier}
                    checked={formData.tier === tier}
                    onChange={(e) => handleInputChange('tier', e.target.value as SubscriptionTier)}
                    className="sr-only"
                  />
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {SUBSCRIPTION_TIER_LABELS[tier]}
                    </h4>
                    {formData.tier === tier && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {tier === 'basic' && (
                      <>
                        <p>• Up to 100 users</p>
                        <p>• 5GB storage</p>
                        <p>• Basic support</p>
                        <p>• Standard features</p>
                      </>
                    )}
                    {tier === 'professional' && (
                      <>
                        <p>• Up to 500 users</p>
                        <p>• 50GB storage</p>
                        <p>• Priority support</p>
                        <p>• Advanced features</p>
                        <p>• SSO integration</p>
                      </>
                    )}
                    {tier === 'enterprise' && (
                      <>
                        <p>• Unlimited users</p>
                        <p>• 500GB storage</p>
                        <p>• 24/7 support</p>
                        <p>• All features</p>
                        <p>• White labeling</p>
                        <p>• Custom integrations</p>
                      </>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Tenant'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}