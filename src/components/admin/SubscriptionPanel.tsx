import React, { useState } from 'react';
import {
  Crown,
  CreditCard,
  Calendar,
  DollarSign,
  Users,
  Shield,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Download,
  ExternalLink,
  Server,
  Database,
  Zap,
  Star
} from 'lucide-react';
import '../../design-system/tokens/colors.css';
import '../../design-system/tokens/spacing.css';
import '../../design-system/tokens/borders.css';
import '../../design-system/tokens/typography.css';
import '../../design-system/tokens/shadows.css';
import '../../design-system/tokens/dashboard.css';

interface SubscriptionData {
  tier: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'cancelled' | 'past_due' | 'trial';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  amount: number;
  currency: string;
  paymentMethod: {
    type: 'card' | 'bank';
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
  };
  usage: {
    users: {
      current: number;
      limit: number;
    };
    storage: {
      used: number;
      limit: number;
    };
    apiCalls: {
      used: number;
      limit: number;
    };
  };
  features: {
    name: string;
    included: boolean;
    limit?: number;
    used?: number;
  }[];
  billingHistory: {
    id: string;
    date: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    description: string;
    invoiceUrl?: string;
  }[];
}

// Mock data for PlainviewISD subscription
const mockSubscriptionData: SubscriptionData = {
  tier: 'enterprise',
  status: 'active',
  currentPeriodStart: '2024-01-01T00:00:00Z',
  currentPeriodEnd: '2024-12-31T23:59:59Z',
  nextBillingDate: '2025-01-01T00:00:00Z',
  amount: 24999,
  currency: 'USD',
  paymentMethod: {
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    expiryMonth: 12,
    expiryYear: 2027
  },
  usage: {
    users: {
      current: 1248,
      limit: 2500
    },
    storage: {
      used: 24.5,
      limit: 100
    },
    apiCalls: {
      used: 45230,
      limit: 100000
    }
  },
  features: [
    { name: 'Student Users', included: true, limit: 2500, used: 1156 },
    { name: 'Teacher Users', included: true, limit: 150, used: 45 },
    { name: 'Admin Users', included: true, limit: 25, used: 8 },
    { name: 'AI-Powered Lessons', included: true },
    { name: 'Real-time Analytics', included: true },
    { name: 'Custom Branding', included: true },
    { name: 'SSO Integration', included: true },
    { name: 'Priority Support', included: true },
    { name: 'API Access', included: true, limit: 100000, used: 45230 },
    { name: 'Advanced Reporting', included: true },
    { name: 'Data Export', included: true },
    { name: 'Multi-tenant Management', included: true }
  ],
  billingHistory: [
    {
      id: 'inv_2024_001',
      date: '2024-01-01T00:00:00Z',
      amount: 24999,
      status: 'paid',
      description: 'Annual Enterprise Subscription - PlainviewISD',
      invoiceUrl: '#'
    },
    {
      id: 'inv_2023_012',
      date: '2023-01-01T00:00:00Z',
      amount: 22999,
      status: 'paid',
      description: 'Annual Enterprise Subscription - PlainviewISD',
      invoiceUrl: '#'
    },
    {
      id: 'inv_2022_012',
      date: '2022-01-01T00:00:00Z',
      amount: 19999,
      status: 'paid',
      description: 'Annual Enterprise Subscription - PlainviewISD',
      invoiceUrl: '#'
    }
  ]
};

export function SubscriptionPanel() {
  const [subscription] = useState<SubscriptionData>(mockSubscriptionData);
  const [activeSection, setActiveSection] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  const getTabStyle = (isActive: boolean) => ({
    padding: 'var(--space-4) var(--space-1)',
    borderBottom: isActive ? '2px solid var(--dashboard-nav-tab-active)' : '2px solid transparent',
    fontWeight: 'var(--font-medium)',
    fontSize: 'var(--text-sm)',
    whiteSpace: 'nowrap' as const,
    color: isActive ? 'var(--dashboard-nav-tab-active)' : 'var(--dashboard-nav-tab-inactive)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'color 200ms ease',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)'
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'past_due':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'trial':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return <Crown className="w-6 h-6 text-purple-600" />;
      case 'premium':
        return <Star className="w-6 h-6 text-blue-600" />;
      default:
        return <Zap className="w-6 h-6 text-green-600" />;
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)' }}>Subscription Management</h2>
          <p style={{ color: 'var(--dashboard-text-secondary)', marginTop: 'var(--space-1)' }}>Manage your district's subscription and billing</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              border: '1px solid var(--dashboard-border-primary)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'transparent',
              color: 'var(--dashboard-text-primary)',
              cursor: 'pointer',
              opacity: isLoading ? 0.5 : 1
            }}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Current Plan Overview */}
      <div style={{
        backgroundColor: 'var(--dashboard-bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--dashboard-border-primary)',
        padding: 'var(--space-6)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {getTierIcon(subscription.tier)}
            <div>
              <h3 style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--dashboard-text-primary)',
                textTransform: 'capitalize'
              }}>
                {subscription.tier} Plan
              </h3>
              <p style={{ color: 'var(--dashboard-text-secondary)' }}>PlainviewISD District License</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {getStatusIcon(subscription.status)}
            <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)', textTransform: 'capitalize' }}>{subscription.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Annual Cost</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(subscription.amount, subscription.currency)}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Next Billing</span>
            </div>
            <p className="text-lg font-semibold text-green-900">
              {formatDate(subscription.nextBillingDate)}
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">User Usage</span>
            </div>
            <p className="text-lg font-semibold text-purple-900">
              {subscription.usage.users.current.toLocaleString()} / {subscription.usage.users.limit.toLocaleString()}
            </p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Storage Used</span>
            </div>
            <p className="text-lg font-semibold text-orange-900">
              {subscription.usage.storage.used} GB / {subscription.usage.storage.limit} GB
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ borderBottom: '1px solid var(--dashboard-border-primary)' }}>
        <nav style={{ display: 'flex', gap: 'var(--space-8)' }}>
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'usage', label: 'Usage & Limits', icon: Server },
            { id: 'billing', label: 'Billing History', icon: CreditCard },
            { id: 'features', label: 'Features', icon: Shield }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              style={getTabStyle(activeSection === id)}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Sections */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Method */}
          <div style={{
            backgroundColor: 'var(--dashboard-bg-elevated)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--dashboard-border-primary)',
            padding: 'var(--space-6)'
          }}>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--dashboard-text-primary)',
              marginBottom: 'var(--space-4)'
            }}>Payment Method</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {subscription.paymentMethod.brand} •••• {subscription.paymentMethod.last4}
                </p>
                <p className="text-sm text-gray-600">
                  Expires {subscription.paymentMethod.expiryMonth}/{subscription.paymentMethod.expiryYear}
                </p>
              </div>
            </div>
          </div>

          {/* Billing Period */}
          <div style={{
            backgroundColor: 'var(--dashboard-bg-elevated)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--dashboard-border-primary)',
            padding: 'var(--space-6)'
          }}>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--dashboard-text-primary)',
              marginBottom: 'var(--space-4)'
            }}>Current Billing Period</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--dashboard-text-secondary)' }}>Period Start:</span>
                <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>{formatDate(subscription.currentPeriodStart)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--dashboard-text-secondary)' }}>Period End:</span>
                <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>{formatDate(subscription.currentPeriodEnd)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'usage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Usage Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div style={{
              backgroundColor: 'var(--dashboard-bg-elevated)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--dashboard-border-primary)',
              padding: 'var(--space-6)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)' }}>Users</h3>
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{subscription.usage.users.current.toLocaleString()} of {subscription.usage.users.limit.toLocaleString()}</span>
                  <span className="font-medium">{Math.round(getUsagePercentage(subscription.usage.users.current, subscription.usage.users.limit))}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(subscription.usage.users.current, subscription.usage.users.limit))}`}
                    style={{ width: `${getUsagePercentage(subscription.usage.users.current, subscription.usage.users.limit)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Storage</h3>
                <Database className="w-6 h-6 text-green-600" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{subscription.usage.storage.used} GB of {subscription.usage.storage.limit} GB</span>
                  <span className="font-medium">{Math.round(getUsagePercentage(subscription.usage.storage.used, subscription.usage.storage.limit))}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(subscription.usage.storage.used, subscription.usage.storage.limit))}`}
                    style={{ width: `${getUsagePercentage(subscription.usage.storage.used, subscription.usage.storage.limit)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">API Calls</h3>
                <Server className="w-6 h-6 text-purple-600" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{subscription.usage.apiCalls.used.toLocaleString()} of {subscription.usage.apiCalls.limit.toLocaleString()}</span>
                  <span className="font-medium">{Math.round(getUsagePercentage(subscription.usage.apiCalls.used, subscription.usage.apiCalls.limit))}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(subscription.usage.apiCalls.used, subscription.usage.apiCalls.limit))}`}
                    style={{ width: `${getUsagePercentage(subscription.usage.apiCalls.used, subscription.usage.apiCalls.limit)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'billing' && (
        <div style={{
          backgroundColor: 'var(--dashboard-bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--dashboard-border-primary)'
        }}>
          <div style={{
            padding: 'var(--space-4) var(--space-6)',
            borderBottom: '1px solid var(--dashboard-border-primary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)' }}>Billing History</h3>
            <button className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4" />
              Export All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscription.billingHistory.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{invoice.id}</div>
                        <div className="text-sm text-gray-500">{invoice.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(invoice.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(invoice.amount, subscription.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' 
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.invoiceUrl && (
                        <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                          <ExternalLink className="w-4 h-4" />
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === 'features' && (
        <div style={{
          backgroundColor: 'var(--dashboard-bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--dashboard-border-primary)',
          padding: 'var(--space-6)'
        }}>
          <h3 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--dashboard-text-primary)',
            marginBottom: 'var(--space-6)'
          }}>Plan Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscription.features.map((feature, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  {feature.included ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                  <span className={`font-medium ${feature.included ? 'text-gray-900' : 'text-gray-500'}`}>
                    {feature.name}
                  </span>
                </div>
                {feature.limit && (
                  <span className="text-sm text-gray-600">
                    {feature.used?.toLocaleString() || 0} / {feature.limit.toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}