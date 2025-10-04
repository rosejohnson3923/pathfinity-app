import React, { useState } from 'react';
import { SubscriptionTier, getPlanByTier } from '../../types/subscription';
import { SubscriptionBadge } from './SubscriptionBadge';
import { FeatureList } from './FeatureAvailability';
import { UpgradeModal } from './UpgradeModal';
import { ArrowRight, Users, Database, Calendar } from 'lucide-react';
import '../../design-system/tokens/colors.css';
import '../../design-system/tokens/spacing.css';
import '../../design-system/tokens/borders.css';
import '../../design-system/tokens/typography.css';
import '../../design-system/tokens/shadows.css';
import '../../design-system/tokens/dashboard.css';

interface SubscriptionInfoProps {
  tier: SubscriptionTier;
  usersCount: number;
  storageUsed: number;
  renewalDate: string;
  onUpgrade?: (tier: SubscriptionTier) => Promise<void>;
}

export function SubscriptionInfo({ 
  tier, 
  usersCount, 
  storageUsed, 
  renewalDate,
  onUpgrade 
}: SubscriptionInfoProps) {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  const plan = getPlanByTier(tier);
  
  if (!plan) return null;
  
  const usersPercentage = Math.min(100, Math.round((usersCount / plan.maxUsers) * 100));
  const storagePercentage = Math.min(100, Math.round((storageUsed / plan.maxStorage) * 100));
  
  const handleUpgradeClick = () => {
    if (tier !== 'enterprise') {
      setIsUpgradeModalOpen(true);
    }
  };
  
  const handleUpgradeConfirm = async (newTier: SubscriptionTier) => {
    if (onUpgrade) {
      await onUpgrade(newTier);
    }
  };
  
  return (
    <div style={{
      backgroundColor: 'var(--dashboard-bg-elevated)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        padding: 'var(--space-5) var(--space-6)',
        borderBottom: '1px solid var(--dashboard-border-primary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-medium)',
          color: 'var(--dashboard-text-primary)'
        }}>Subscription Information</h3>
        {tier !== 'enterprise' && (
          <button
            onClick={handleUpgradeClick}
            style={{
              fontSize: 'var(--text-sm)',
              color: '#2563EB',
              fontWeight: 'var(--font-medium)',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#1D4ED8'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#2563EB'}
          >
            Upgrade Plan
            <ArrowRight style={{ marginLeft: 'var(--space-1)', width: '1rem', height: '1rem' }} />
          </button>
        )}
      </div>
      <div style={{ padding: 'var(--space-6)' }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-tertiary)' }}>Current Plan</p>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 'var(--space-1)' }}>
              <p style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--dashboard-text-primary)',
                textTransform: 'capitalize',
                marginRight: 'var(--space-2)'
              }}>{plan.name}</p>
              <SubscriptionBadge tier={tier} />
            </div>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--dashboard-text-secondary)',
              marginTop: 'var(--space-1)'
            }}>{plan.description}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--dashboard-text-tertiary)',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Users style={{ width: '1rem', height: '1rem', marginRight: 'var(--space-1)' }} />
                Users
              </p>
              <p style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--dashboard-text-primary)'
              }}>
                {usersCount.toLocaleString()} / {plan.maxUsers.toLocaleString()}
              </p>
              <div style={{
                width: '100%',
                backgroundColor: 'var(--dashboard-border-primary)',
                borderRadius: '9999px',
                height: '0.5rem',
                marginTop: 'var(--space-1)'
              }}>
                <div
                  style={{
                    height: '0.5rem',
                    borderRadius: '9999px',
                    backgroundColor: usersPercentage > 90 ? '#DC2626' : '#2563EB',
                    width: `${usersPercentage}%`
                  }}
                ></div>
              </div>
            </div>
            <div>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--dashboard-text-tertiary)',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Database style={{ width: '1rem', height: '1rem', marginRight: 'var(--space-1)' }} />
                Storage
              </p>
              <p style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--dashboard-text-primary)'
              }}>
                {storageUsed} GB / {plan.maxStorage} GB
              </p>
              <div style={{
                width: '100%',
                backgroundColor: 'var(--dashboard-border-primary)',
                borderRadius: '9999px',
                height: '0.5rem',
                marginTop: 'var(--space-1)'
              }}>
                <div
                  style={{
                    height: '0.5rem',
                    borderRadius: '9999px',
                    backgroundColor: storagePercentage > 90 ? '#DC2626' : '#2563EB',
                    width: `${storagePercentage}%`
                  }}
                ></div>
              </div>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--dashboard-text-tertiary)',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Calendar style={{ width: '1rem', height: '1rem', marginRight: 'var(--space-1)' }} />
                Renewal Date
              </p>
              <p style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--dashboard-text-primary)'
              }}>{renewalDate}</p>
              <p style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--dashboard-text-tertiary)',
                marginTop: 'var(--space-1)'
              }}>Auto-renewal enabled</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-6)' }}>
          <p style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--dashboard-text-secondary)',
            marginBottom: 'var(--space-3)'
          }}>Included Features:</p>
          <div style={{
            backgroundColor: 'var(--dashboard-bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)'
          }}>
            <FeatureList tier={tier} compact={true} />
          </div>
        </div>
      </div>
      
      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentTier={tier}
        onUpgrade={handleUpgradeConfirm}
      />
    </div>
  );
}