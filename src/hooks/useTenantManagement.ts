import { useState, useEffect, useCallback } from 'react';
import {
  Tenant,
  TenantFormData,
  TenantFilters,
  TenantSearchParams,
  TenantStatus,
  SubscriptionTier,
  TenantSettings,
  TenantUsage,
  TenantBilling,
  DEFAULT_TENANT_LIMITS,
  DEFAULT_TENANT_FEATURES,
  TIER_PRICING
} from '../types/tenant';

interface UseTenantManagementReturn {
  tenants: Tenant[];
  searchParams: TenantSearchParams;
  totalTenants: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  setSearchParams: (params: Partial<TenantSearchParams>) => void;
  createTenant: (tenantData: TenantFormData) => Promise<Tenant>;
  updateTenant: (tenantId: string, tenantData: Partial<TenantFormData>) => Promise<void>;
  deleteTenant: (tenantId: string) => Promise<void>;
  suspendTenant: (tenantId: string, reason?: string) => Promise<void>;
  activateTenant: (tenantId: string) => Promise<void>;
  upgradeTenant: (tenantId: string, newTier: SubscriptionTier) => Promise<void>;
  getTenantUsage: (tenantId: string) => Promise<TenantUsage>;
  getTenantBilling: (tenantId: string) => Promise<TenantBilling>;
  updateTenantSettings: (tenantId: string, settings: Partial<TenantSettings>) => Promise<void>;
  searchTenants: (query: string) => void;
  applyFilters: (filters: TenantFilters) => void;
  clearFilters: () => void;
  refreshData: () => Promise<void>;
}

// Mock data generator
const generateMockTenant = (id: string): Tenant => {
  const tiers: SubscriptionTier[] = ['basic', 'professional', 'enterprise'];
  const statuses: TenantStatus[] = ['active', 'suspended', 'pending', 'inactive'];
  const regions = ['us-east-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 'ap-southeast-1'];
  
  const tier = tiers[Math.floor(Math.random() * tiers.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const region = regions[Math.floor(Math.random() * regions.length)];
  
  const tenantNames = [
    'Plainview Independent School District',
    'Austin Education Consortium',
    'Houston Learning Network',
    'Dallas Academic Alliance',
    'San Antonio Schools',
    'Fort Worth Education Hub',
    'Arlington Learning Center',
    'Plano Academic Network',
    'Richardson School System',
    'McKinney Education Group'
  ];
  
  const name = tenantNames[Math.floor(Math.random() * tenantNames.length)];
  const subdomain = name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
  const domain = `${subdomain}.pathfinity.edu`;
  
  const now = new Date();
  const createdAt = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
  const updatedAt = new Date(createdAt.getTime() + Math.random() * (now.getTime() - createdAt.getTime()));
  
  return {
    id,
    name,
    domain,
    subdomain,
    status,
    tier,
    region,
    contactEmail: `admin@${subdomain}.edu`,
    primaryContact: {
      firstName: ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa'][Math.floor(Math.random() * 6)],
      lastName: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'][Math.floor(Math.random() * 6)],
      email: `admin@${subdomain}.edu`,
      phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      title: ['Superintendent', 'Principal', 'IT Director', 'Technology Coordinator'][Math.floor(Math.random() * 4)]
    },
    settings: {
      id: `settings-${id}`,
      tenantId: id,
      branding: {
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b',
        showBranding: true
      },
      features: DEFAULT_TENANT_FEATURES[tier],
      limits: DEFAULT_TENANT_LIMITS[tier],
      security: {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: false,
          expirationDays: 90
        },
        sessionTimeout: 480,
        ipRestrictions: [],
        twoFactorRequired: tier === 'enterprise',
        auditLogging: tier !== 'basic'
      },
      integrations: {},
      updatedAt: updatedAt.toISOString(),
      updatedBy: 'system'
    },
    usage: {
      id: `usage-${id}`,
      tenantId: id,
      period: now.toISOString().substring(0, 7), // YYYY-MM
      users: {
        total: Math.floor(Math.random() * 500) + 50,
        active: Math.floor(Math.random() * 400) + 30,
        newThisMonth: Math.floor(Math.random() * 20) + 2
      },
      storage: {
        used: Math.floor(Math.random() * DEFAULT_TENANT_LIMITS[tier].maxStorage * 0.8),
        limit: DEFAULT_TENANT_LIMITS[tier].maxStorage,
        percentage: 0
      },
      bandwidth: {
        used: Math.floor(Math.random() * DEFAULT_TENANT_LIMITS[tier].maxBandwidth * 0.6),
        limit: DEFAULT_TENANT_LIMITS[tier].maxBandwidth,
        percentage: 0
      },
      requests: {
        api: Math.floor(Math.random() * 10000) + 1000,
        web: Math.floor(Math.random() * 50000) + 5000,
        total: 0
      },
      features: {
        reportsGenerated: Math.floor(Math.random() * 50) + 5,
        integrationsUsed: tier === 'basic' ? [] : ['google-classroom', 'canvas'],
        customFieldsUsed: Math.floor(Math.random() * 20) + 1
      },
      updatedAt: updatedAt.toISOString()
    },
    billing: {
      id: `billing-${id}`,
      tenantId: id,
      subscription: {
        tier,
        status: 'active',
        currentPeriodStart: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
        currentPeriodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(),
        cancelAtPeriodEnd: false
      },
      pricing: {
        basePrice: TIER_PRICING[tier].base,
        userPrice: TIER_PRICING[tier].perUser,
        storagePrice: TIER_PRICING[tier].storage,
        bandwidthPrice: TIER_PRICING[tier].bandwidth,
        currency: 'USD'
      },
      currentBill: {
        subtotal: Math.floor(Math.random() * 1000) + 200,
        taxes: 0,
        total: 0,
        dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'paid'
      },
      paymentMethod: {
        type: 'card',
        last4: String(Math.floor(Math.random() * 9000) + 1000),
        brand: ['Visa', 'Mastercard', 'American Express'][Math.floor(Math.random() * 3)],
        expiresAt: `${Math.floor(Math.random() * 5) + 2025}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}`
      },
      invoices: [],
      updatedAt: updatedAt.toISOString()
    },
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    lastLoginAt: status === 'active' ? new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined
  };
};

export function useTenantManagement(): UseTenantManagementReturn {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchParams, setSearchParamsState] = useState<TenantSearchParams>({
    page: 1,
    limit: 10,
    sortBy: 'name',
    sortOrder: 'asc',
    filters: {}
  });
  const [totalTenants, setTotalTenants] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate mock data
  const generateMockTenants = useCallback((count: number = 25): Tenant[] => {
    return Array.from({ length: count }, (_, i) => generateMockTenant(`tenant-${i + 1}`));
  }, []);

  const loadTenants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const allTenants = generateMockTenants(25);
      let filteredTenants = [...allTenants];

      // Apply filters
      if (searchParams.filters?.search) {
        const query = searchParams.filters.search.toLowerCase();
        filteredTenants = filteredTenants.filter(tenant =>
          tenant.name.toLowerCase().includes(query) ||
          tenant.domain.toLowerCase().includes(query) ||
          tenant.contactEmail.toLowerCase().includes(query)
        );
      }

      if (searchParams.filters?.status?.length) {
        filteredTenants = filteredTenants.filter(tenant =>
          searchParams.filters!.status!.includes(tenant.status)
        );
      }

      if (searchParams.filters?.tier?.length) {
        filteredTenants = filteredTenants.filter(tenant =>
          searchParams.filters!.tier!.includes(tenant.tier)
        );
      }

      if (searchParams.filters?.region?.length) {
        filteredTenants = filteredTenants.filter(tenant =>
          searchParams.filters!.region!.includes(tenant.region)
        );
      }

      // Apply sorting
      filteredTenants.sort((a, b) => {
        const aValue = a[searchParams.sortBy];
        const bValue = b[searchParams.sortBy];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return searchParams.sortOrder === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return searchParams.sortOrder === 'asc'
            ? aValue - bValue
            : bValue - aValue;
        }
        
        return 0;
      });

      // Apply pagination
      const startIndex = (searchParams.page - 1) * searchParams.limit;
      const endIndex = startIndex + searchParams.limit;
      const paginatedTenants = filteredTenants.slice(startIndex, endIndex);

      // Calculate usage percentages
      paginatedTenants.forEach(tenant => {
        tenant.usage.storage.percentage = tenant.usage.storage.limit === -1 
          ? 0 
          : Math.min((tenant.usage.storage.used / tenant.usage.storage.limit) * 100, 100);
        
        tenant.usage.bandwidth.percentage = tenant.usage.bandwidth.limit === -1 
          ? 0 
          : Math.min((tenant.usage.bandwidth.used / tenant.usage.bandwidth.limit) * 100, 100);
        
        tenant.usage.requests.total = tenant.usage.requests.api + tenant.usage.requests.web;
        
        // Calculate billing totals
        const users = tenant.usage.users.total;
        const storageGB = Math.ceil(tenant.usage.storage.used / (1024 * 1024 * 1024));
        const bandwidthGB = Math.ceil(tenant.usage.bandwidth.used / (1024 * 1024 * 1024));
        
        const subtotal = tenant.billing.pricing.basePrice + 
                        (users * tenant.billing.pricing.userPrice) +
                        (storageGB * tenant.billing.pricing.storagePrice) +
                        (bandwidthGB * tenant.billing.pricing.bandwidthPrice);
        
        tenant.billing.currentBill.subtotal = Math.round(subtotal * 100) / 100;
        tenant.billing.currentBill.taxes = Math.round(subtotal * 0.08 * 100) / 100; // 8% tax
        tenant.billing.currentBill.total = tenant.billing.currentBill.subtotal + tenant.billing.currentBill.taxes;
      });

      setTenants(paginatedTenants);
      setTotalTenants(filteredTenants.length);
      setTotalPages(Math.ceil(filteredTenants.length / searchParams.limit));

    } catch (err) {
      setError('Failed to load tenants');
      console.error('Load tenants error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams, generateMockTenants]);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const setSearchParams = useCallback((params: Partial<TenantSearchParams>) => {
    setSearchParamsState(prev => ({ ...prev, ...params }));
  }, []);

  const createTenant = async (tenantData: TenantFormData): Promise<Tenant> => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTenant: Tenant = {
        id: `tenant-${Date.now()}`,
        ...tenantData,
        status: 'pending',
        settings: {
          id: `settings-${Date.now()}`,
          tenantId: `tenant-${Date.now()}`,
          branding: {
            primaryColor: '#3b82f6',
            secondaryColor: '#64748b',
            showBranding: true
          },
          features: DEFAULT_TENANT_FEATURES[tenantData.tier],
          limits: DEFAULT_TENANT_LIMITS[tenantData.tier],
          security: {
            passwordPolicy: {
              minLength: 8,
              requireUppercase: true,
              requireLowercase: true,
              requireNumbers: true,
              requireSpecialChars: false,
              expirationDays: 90
            },
            sessionTimeout: 480,
            ipRestrictions: [],
            twoFactorRequired: tenantData.tier === 'enterprise',
            auditLogging: tenantData.tier !== 'basic'
          },
          integrations: {},
          updatedAt: new Date().toISOString(),
          updatedBy: 'system'
        },
        usage: {
          id: `usage-${Date.now()}`,
          tenantId: `tenant-${Date.now()}`,
          period: new Date().toISOString().substring(0, 7),
          users: { total: 0, active: 0, newThisMonth: 0 },
          storage: { used: 0, limit: DEFAULT_TENANT_LIMITS[tenantData.tier].maxStorage, percentage: 0 },
          bandwidth: { used: 0, limit: DEFAULT_TENANT_LIMITS[tenantData.tier].maxBandwidth, percentage: 0 },
          requests: { api: 0, web: 0, total: 0 },
          features: { reportsGenerated: 0, integrationsUsed: [], customFieldsUsed: 0 },
          updatedAt: new Date().toISOString()
        },
        billing: {
          id: `billing-${Date.now()}`,
          tenantId: `tenant-${Date.now()}`,
          subscription: {
            tier: tenantData.tier,
            status: 'trialing',
            currentPeriodStart: new Date().toISOString(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            cancelAtPeriodEnd: false
          },
          pricing: {
            basePrice: TIER_PRICING[tenantData.tier].base,
            userPrice: TIER_PRICING[tenantData.tier].perUser,
            storagePrice: TIER_PRICING[tenantData.tier].storage,
            bandwidthPrice: TIER_PRICING[tenantData.tier].bandwidth,
            currency: 'USD'
          },
          currentBill: {
            subtotal: 0,
            taxes: 0,
            total: 0,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending'
          },
          paymentMethod: { type: 'card' },
          invoices: [],
          updatedAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await refreshData();
      return newTenant;
    } catch (err) {
      throw new Error('Failed to create tenant');
    } finally {
      setLoading(false);
    }
  };

  const updateTenant = async (tenantId: string, tenantData: Partial<TenantFormData>) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      await refreshData();
    } catch (err) {
      throw new Error('Failed to update tenant');
    } finally {
      setLoading(false);
    }
  };

  const deleteTenant = async (tenantId: string) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      await refreshData();
    } catch (err) {
      throw new Error('Failed to delete tenant');
    } finally {
      setLoading(false);
    }
  };

  const suspendTenant = async (tenantId: string, reason?: string) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      await refreshData();
    } catch (err) {
      throw new Error('Failed to suspend tenant');
    } finally {
      setLoading(false);
    }
  };

  const activateTenant = async (tenantId: string) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      await refreshData();
    } catch (err) {
      throw new Error('Failed to activate tenant');
    } finally {
      setLoading(false);
    }
  };

  const upgradeTenant = async (tenantId: string, newTier: SubscriptionTier) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      await refreshData();
    } catch (err) {
      throw new Error('Failed to upgrade tenant');
    } finally {
      setLoading(false);
    }
  };

  const getTenantUsage = async (tenantId: string): Promise<TenantUsage> => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) throw new Error('Tenant not found');
    return tenant.usage;
  };

  const getTenantBilling = async (tenantId: string): Promise<TenantBilling> => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) throw new Error('Tenant not found');
    return tenant.billing;
  };

  const updateTenantSettings = async (tenantId: string, settings: Partial<TenantSettings>) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      await refreshData();
    } catch (err) {
      throw new Error('Failed to update tenant settings');
    } finally {
      setLoading(false);
    }
  };

  const searchTenants = useCallback((query: string) => {
    setSearchParams({
      page: 1,
      filters: { ...searchParams.filters, search: query }
    });
  }, [searchParams.filters, setSearchParams]);

  const applyFilters = useCallback((filters: TenantFilters) => {
    setSearchParams({
      page: 1,
      filters
    });
  }, [setSearchParams]);

  const clearFilters = useCallback(() => {
    setSearchParams({
      page: 1,
      filters: {}
    });
  }, [setSearchParams]);

  const refreshData = useCallback(async () => {
    await loadTenants();
  }, [loadTenants]);

  return {
    tenants,
    searchParams,
    totalTenants,
    totalPages,
    loading,
    error,
    setSearchParams,
    createTenant,
    updateTenant,
    deleteTenant,
    suspendTenant,
    activateTenant,
    upgradeTenant,
    getTenantUsage,
    getTenantBilling,
    updateTenantSettings,
    searchTenants,
    applyFilters,
    clearFilters,
    refreshData
  };
}