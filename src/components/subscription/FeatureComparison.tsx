import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { SubscriptionTier, subscriptionFeatures, subscriptionPlans } from '../../types/subscription';
import '../../design-system/tokens/colors.css';
import '../../design-system/tokens/spacing.css';
import '../../design-system/tokens/borders.css';
import '../../design-system/tokens/typography.css';
import '../../design-system/tokens/shadows.css';
import '../../design-system/tokens/dashboard.css';

interface FeatureComparisonProps {
  currentTier?: SubscriptionTier;
  onSelectPlan?: (tier: SubscriptionTier) => void;
}

export function FeatureComparison({ currentTier, onSelectPlan }: FeatureComparisonProps) {
  const [hoveredPlanButton, setHoveredPlanButton] = useState<SubscriptionTier | null>(null);

  // Map subscription tiers to solid colors
  const getPlanColors = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'basic':
        return {
          heading: '#22c55e',
          bg: '#22c55e',
          bgHover: '#16a34a',
          lightBg: '#dcfce7',
          darkText: '#065f46',
          checkIcon: '#22c55e'
        };
      case 'premium':
        return {
          heading: '#2563eb',
          bg: '#2563eb',
          bgHover: '#1d4ed8',
          lightBg: '#dbeafe',
          darkText: '#1e40af',
          checkIcon: '#2563eb'
        };
      case 'enterprise':
        return {
          heading: '#9333ea',
          bg: '#9333ea',
          bgHover: '#7e22ce',
          lightBg: '#f3e8ff',
          darkText: '#6b21a8',
          checkIcon: '#9333ea'
        };
      default:
        return {
          heading: '#2563eb',
          bg: '#2563eb',
          bgHover: '#1d4ed8',
          lightBg: '#dbeafe',
          darkText: '#1e40af',
          checkIcon: '#2563eb'
        };
    }
  };
  // Group features by category
  const featureCategories = [
    {
      name: 'Core Features',
      features: ['core_learning', 'ai_content_generation', 'ai_assistant', 'basic_analytics', 'content_library']
    },
    {
      name: 'Collaboration & Creativity',
      features: ['collab_projects', 'brand_studio', 'stream_live']
    },
    {
      name: 'Advanced Features',
      features: ['advanced_analytics']
    },
    {
      name: 'Enterprise Features',
      features: ['api_access', 'sso_integration', 'custom_branding', 'dedicated_support', 'advanced_security', 'virtual_reality']
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
        <div style={{ gridColumn: 'span 1' }}></div>
        {subscriptionPlans.map((plan) => {
          const colors = getPlanColors(plan.tier);
          const isHovered = hoveredPlanButton === plan.tier;
          const isCurrent = currentTier === plan.tier;

          return (
            <div key={plan.tier} style={{ gridColumn: 'span 1', textAlign: 'center' }}>
              <h3 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-bold)',
                color: colors.heading
              }}>
                {plan.name}
              </h3>
            </div>
          );
        })}
      </div>

      {/* Feature comparison table */}
      <div style={{
        marginTop: 'var(--space-8)',
        borderTop: '1px solid var(--dashboard-border-primary)',
        paddingTop: 'var(--space-8)'
      }}>
        {featureCategories.map((category) => (
          <div key={category.name} style={{ marginBottom: 'var(--space-8)' }}>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--dashboard-text-primary)',
              marginBottom: 'var(--space-4)'
            }}>
              {category.name}
            </h3>
            <div style={{ borderTop: '1px solid var(--dashboard-border-primary)' }}>
              {category.features.map((featureId) => {
                const feature = subscriptionFeatures.find(f => f.id === featureId);
                if (!feature) return null;

                return (
                  <div key={featureId} style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 'var(--space-4)',
                    padding: 'var(--space-4) 0',
                    borderBottom: '1px solid var(--dashboard-border-primary)'
                  }}>
                    <div style={{ gridColumn: 'span 1' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <p style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-medium)',
                          color: 'var(--dashboard-text-primary)'
                        }}>
                          {feature.name}
                          {feature.comingSoon && (
                            <span style={{
                              marginLeft: 'var(--space-2)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: 'var(--space-1) var(--space-2)',
                              borderRadius: 'var(--radius-md)',
                              fontSize: 'var(--text-xs)',
                              fontWeight: 'var(--font-medium)',
                              backgroundColor: '#dbeafe',
                              color: '#1e40af'
                            }}>
                              Coming Soon
                            </span>
                          )}
                        </p>
                      </div>
                      <p style={{
                        marginTop: 'var(--space-1)',
                        fontSize: 'var(--text-xs)',
                        color: 'var(--dashboard-text-secondary)'
                      }}>
                        {feature.description}
                      </p>
                    </div>

                    {subscriptionPlans.map((plan) => {
                      const isIncluded = feature.tiers.includes(plan.tier);
                      const colors = getPlanColors(plan.tier);

                      return (
                        <div key={plan.tier} style={{
                          gridColumn: 'span 1',
                          textAlign: 'center'
                        }}>
                          {isIncluded ? (
                            <Check style={{
                              margin: '0 auto',
                              height: '20px',
                              width: '20px',
                              color: colors.checkIcon
                            }} />
                          ) : (
                            <X style={{
                              margin: '0 auto',
                              height: '20px',
                              width: '20px',
                              color: '#9ca3af'
                            }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}