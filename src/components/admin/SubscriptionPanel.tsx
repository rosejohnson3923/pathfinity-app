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
  const [isRefreshHovered, setIsRefreshHovered] = useState(false);
  const [isExportHovered, setIsExportHovered] = useState(false);
  const [hoveredInvoiceRow, setHoveredInvoiceRow] = useState<string | null>(null);
  const [hoveredFeatureIndex, setHoveredFeatureIndex] = useState<number | null>(null);
  const [hoveredViewButton, setHoveredViewButton] = useState<string | null>(null);

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
        return <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" style={{ color: '#ef4444' }} />;
      case 'past_due':
        return <AlertCircle className="w-5 h-5" style={{ color: '#eab308' }} />;
      case 'trial':
        return <AlertCircle className="w-5 h-5" style={{ color: '#2563eb' }} />;
      default:
        return <AlertCircle className="w-5 h-5" style={{ color: '#6b7280' }} />;
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return <Crown className="w-6 h-6" style={{ color: '#9333ea' }} />;
      case 'premium':
        return <Star className="w-6 h-6" style={{ color: '#2563eb' }} />;
      default:
        return <Zap className="w-6 h-6" style={{ color: '#22c55e' }} />;
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return '#ef4444';
    if (percentage >= 75) return '#eab308';
    return '#22c55e';
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
            onMouseEnter={() => setIsRefreshHovered(true)}
            onMouseLeave={() => setIsRefreshHovered(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              border: '1px solid var(--dashboard-border-primary)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: isRefreshHovered && !isLoading ? 'var(--dashboard-bg-hover)' : 'transparent',
              color: 'var(--dashboard-text-primary)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
              transition: 'background-color 200ms'
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-6)' }}>
          <div style={{
            backgroundColor: '#dbeafe',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <DollarSign className="w-5 h-5" style={{ color: '#2563eb' }} />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: '#1e40af' }}>Annual Cost</span>
            </div>
            <p style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: '#1e40af' }}>
              {formatCurrency(subscription.amount, subscription.currency)}
            </p>
          </div>

          <div style={{
            backgroundColor: '#dcfce7',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <Calendar className="w-5 h-5" style={{ color: '#22c55e' }} />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: '#065f46' }}>Next Billing</span>
            </div>
            <p style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: '#065f46' }}>
              {formatDate(subscription.nextBillingDate)}
            </p>
          </div>

          <div style={{
            backgroundColor: '#f3e8ff',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <Users className="w-5 h-5" style={{ color: '#9333ea' }} />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: '#581c87' }}>User Usage</span>
            </div>
            <p style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: '#581c87' }}>
              {subscription.usage.users.current.toLocaleString()} / {subscription.usage.users.limit.toLocaleString()}
            </p>
          </div>

          <div style={{
            backgroundColor: '#fed7aa',
            padding: 'var(--space-4)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
              <Database className="w-5 h-5" style={{ color: '#f97316' }} />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: '#7c2d12' }}>Storage Used</span>
            </div>
            <p style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: '#7c2d12' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div style={{
                width: '48px',
                height: '32px',
                backgroundColor: '#2563eb',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CreditCard className="w-6 h-6" style={{ color: '#ffffff' }} />
              </div>
              <div>
                <p style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>
                  {subscription.paymentMethod.brand} •••• {subscription.paymentMethod.last4}
                </p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-6)' }}>
            <div style={{
              backgroundColor: 'var(--dashboard-bg-elevated)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--dashboard-border-primary)',
              padding: 'var(--space-6)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)' }}>Users</h3>
                <Users className="w-6 h-6" style={{ color: '#2563eb' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                  <span style={{ color: 'var(--dashboard-text-secondary)' }}>{subscription.usage.users.current.toLocaleString()} of {subscription.usage.users.limit.toLocaleString()}</span>
                  <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>{Math.round(getUsagePercentage(subscription.usage.users.current, subscription.usage.users.limit))}%</span>
                </div>
                <div style={{ width: '100%', backgroundColor: '#d1d5db', borderRadius: '9999px', height: '8px' }}>
                  <div
                    style={{
                      height: '8px',
                      borderRadius: '9999px',
                      backgroundColor: getUsageColor(getUsagePercentage(subscription.usage.users.current, subscription.usage.users.limit)),
                      width: `${getUsagePercentage(subscription.usage.users.current, subscription.usage.users.limit)}%`,
                      transition: 'width 300ms ease'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--dashboard-bg-elevated)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--dashboard-border-primary)',
              padding: 'var(--space-6)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)' }}>Storage</h3>
                <Database className="w-6 h-6" style={{ color: '#22c55e' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                  <span style={{ color: 'var(--dashboard-text-secondary)' }}>{subscription.usage.storage.used} GB of {subscription.usage.storage.limit} GB</span>
                  <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>{Math.round(getUsagePercentage(subscription.usage.storage.used, subscription.usage.storage.limit))}%</span>
                </div>
                <div style={{ width: '100%', backgroundColor: '#d1d5db', borderRadius: '9999px', height: '8px' }}>
                  <div
                    style={{
                      height: '8px',
                      borderRadius: '9999px',
                      backgroundColor: getUsageColor(getUsagePercentage(subscription.usage.storage.used, subscription.usage.storage.limit)),
                      width: `${getUsagePercentage(subscription.usage.storage.used, subscription.usage.storage.limit)}%`,
                      transition: 'width 300ms ease'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--dashboard-bg-elevated)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--dashboard-border-primary)',
              padding: 'var(--space-6)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)' }}>API Calls</h3>
                <Server className="w-6 h-6" style={{ color: '#9333ea' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                  <span style={{ color: 'var(--dashboard-text-secondary)' }}>{subscription.usage.apiCalls.used.toLocaleString()} of {subscription.usage.apiCalls.limit.toLocaleString()}</span>
                  <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>{Math.round(getUsagePercentage(subscription.usage.apiCalls.used, subscription.usage.apiCalls.limit))}%</span>
                </div>
                <div style={{ width: '100%', backgroundColor: '#d1d5db', borderRadius: '9999px', height: '8px' }}>
                  <div
                    style={{
                      height: '8px',
                      borderRadius: '9999px',
                      backgroundColor: getUsageColor(getUsagePercentage(subscription.usage.apiCalls.used, subscription.usage.apiCalls.limit)),
                      width: `${getUsagePercentage(subscription.usage.apiCalls.used, subscription.usage.apiCalls.limit)}%`,
                      transition: 'width 300ms ease'
                    }}
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
            <button
              onMouseEnter={() => setIsExportHovered(true)}
              onMouseLeave={() => setIsExportHovered(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-4)',
                fontSize: 'var(--text-sm)',
                backgroundColor: isExportHovered ? '#1d4ed8' : '#2563eb',
                color: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 200ms'
              }}
            >
              <Download className="w-4 h-4" />
              Export All
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead style={{ backgroundColor: 'var(--dashboard-bg-secondary)' }}>
                <tr>
                  <th style={{
                    padding: 'var(--space-3) var(--space-6)',
                    textAlign: 'left',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--dashboard-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Invoice
                  </th>
                  <th style={{
                    padding: 'var(--space-3) var(--space-6)',
                    textAlign: 'left',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--dashboard-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Date
                  </th>
                  <th style={{
                    padding: 'var(--space-3) var(--space-6)',
                    textAlign: 'left',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--dashboard-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Amount
                  </th>
                  <th style={{
                    padding: 'var(--space-3) var(--space-6)',
                    textAlign: 'left',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--dashboard-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Status
                  </th>
                  <th style={{
                    padding: 'var(--space-3) var(--space-6)',
                    textAlign: 'left',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--dashboard-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'var(--dashboard-bg-elevated)' }}>
                {subscription.billingHistory.map((invoice) => (
                  <tr
                    key={invoice.id}
                    onMouseEnter={() => setHoveredInvoiceRow(invoice.id)}
                    onMouseLeave={() => setHoveredInvoiceRow(null)}
                    style={{
                      backgroundColor: hoveredInvoiceRow === invoice.id ? 'var(--dashboard-bg-hover)' : 'transparent',
                      borderTop: '1px solid var(--dashboard-border-primary)',
                      transition: 'background-color 200ms'
                    }}
                  >
                    <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                      <div>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>{invoice.id}</div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>{invoice.description}</div>
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap', fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>
                      {formatDate(invoice.date)}
                    </td>
                    <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap', fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-primary)' }}>
                      {formatCurrency(invoice.amount, subscription.currency)}
                    </td>
                    <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: 'var(--space-1) 10px',
                        borderRadius: '9999px',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-medium)',
                        backgroundColor: invoice.status === 'paid' ? '#dcfce7' : invoice.status === 'pending' ? '#fef3c7' : '#fee2e2',
                        color: invoice.status === 'paid' ? '#065f46' : invoice.status === 'pending' ? '#854d0e' : '#991b1b'
                      }}>
                        {invoice.status}
                      </span>
                    </td>
                    <td style={{ padding: 'var(--space-4) var(--space-6)', whiteSpace: 'nowrap', fontSize: 'var(--text-sm)' }}>
                      {invoice.invoiceUrl && (
                        <button
                          onMouseEnter={() => setHoveredViewButton(invoice.id)}
                          onMouseLeave={() => setHoveredViewButton(null)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-1)',
                            color: hoveredViewButton === invoice.id ? '#1d4ed8' : '#2563eb',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'color 200ms'
                          }}
                        >
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
            {subscription.features.map((feature, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredFeatureIndex(index)}
                onMouseLeave={() => setHoveredFeatureIndex(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--dashboard-border-primary)',
                  backgroundColor: hoveredFeatureIndex === index ? 'var(--dashboard-bg-hover)' : 'transparent',
                  transition: 'background-color 200ms'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  {feature.included ? (
                    <CheckCircle className="w-5 h-5" style={{ color: '#22c55e' }} />
                  ) : (
                    <XCircle className="w-5 h-5" style={{ color: '#9ca3af' }} />
                  )}
                  <span style={{
                    fontWeight: 'var(--font-medium)',
                    color: feature.included ? 'var(--dashboard-text-primary)' : 'var(--dashboard-text-secondary)'
                  }}>
                    {feature.name}
                  </span>
                </div>
                {feature.limit && (
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>
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