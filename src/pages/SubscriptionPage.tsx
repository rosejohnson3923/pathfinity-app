import React, { useState } from 'react';
import { Header } from '../components/Header';
import { SubscriptionSettings } from '../components/subscription/SubscriptionSettings';
import { FeatureComparison } from '../components/subscription/FeatureComparison';
import { UpgradeModal } from '../components/subscription/UpgradeModal';
import { useSubscription } from '../hooks/useSubscription';
import { SubscriptionTier } from '../types/subscription';
import '../design-system/tokens/colors.css';
import '../design-system/tokens/spacing.css';
import '../design-system/tokens/borders.css';
import '../design-system/tokens/typography.css';
import '../design-system/tokens/shadows.css';
import '../design-system/tokens/dashboard.css';

export function SubscriptionPage() {
  const { tier, upgradeSubscription } = useSubscription();
  const [activeTab, setActiveTab] = useState('settings');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const handleUpgrade = async (newTier: SubscriptionTier) => {
    try {
      await upgradeSubscription(newTier);
      setIsUpgradeModalOpen(false);
    } catch (error) {
      console.error('Error upgrading subscription:', error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--dashboard-bg-primary)',
      transition: 'background-color 200ms'
    }}>
      <Header showBackButton={true} backButtonDestination="/dashboard" />

      <main style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: 'var(--space-8) var(--space-4)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-8)'
        }}>
          <h1 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--dashboard-text-primary)'
          }}>Subscription</h1>
        </div>

        {/* Tabs */}
        <div style={{
          borderBottom: '1px solid var(--dashboard-border-primary)',
          marginBottom: 'var(--space-6)'
        }}>
          <nav style={{ display: 'flex', gap: 'var(--space-8)' }}>
            <button
              onClick={() => setActiveTab('settings')}
              onMouseEnter={() => setHoveredTab('settings')}
              onMouseLeave={() => setHoveredTab(null)}
              style={{
                padding: 'var(--space-4) var(--space-1)',
                fontWeight: 'var(--font-medium)',
                fontSize: 'var(--text-sm)',
                color: activeTab === 'settings'
                  ? '#2563eb'
                  : hoveredTab === 'settings'
                    ? 'var(--dashboard-text-primary)'
                    : 'var(--dashboard-text-secondary)',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'settings' ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
            >
              Subscription Settings
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              onMouseEnter={() => setHoveredTab('compare')}
              onMouseLeave={() => setHoveredTab(null)}
              style={{
                padding: 'var(--space-4) var(--space-1)',
                fontWeight: 'var(--font-medium)',
                fontSize: 'var(--text-sm)',
                color: activeTab === 'compare'
                  ? '#2563eb'
                  : hoveredTab === 'compare'
                    ? 'var(--dashboard-text-primary)'
                    : 'var(--dashboard-text-secondary)',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'compare' ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
            >
              Compare Plans
            </button>
          </nav>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'settings' && (
            <SubscriptionSettings />
          )}

          {activeTab === 'compare' && (
            <div style={{
              background: 'var(--dashboard-bg-elevated)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--dashboard-shadow-card)',
              padding: 'var(--space-6)'
            }}>
              <h2 style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--dashboard-text-primary)',
                marginBottom: 'var(--space-6)'
              }}>Plan Comparison</h2>
              <FeatureComparison
                currentTier={tier}
                onSelectPlan={(newTier) => {
                  if (newTier !== tier) {
                    setIsUpgradeModalOpen(true);
                  }
                }}
              />
            </div>
          )}
        </div>
      </main>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentTier={tier}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
}