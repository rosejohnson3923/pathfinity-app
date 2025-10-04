import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { SubscriptionTier, subscriptionPlans, subscriptionFeatures } from '../../types/subscription';
import '../../design-system/tokens/colors.css';
import '../../design-system/tokens/spacing.css';
import '../../design-system/tokens/borders.css';
import '../../design-system/tokens/typography.css';
import '../../design-system/tokens/shadows.css';
import '../../design-system/tokens/dashboard.css';

interface PricingPlansProps {
  currentTier?: SubscriptionTier;
  onSelectPlan?: (tier: SubscriptionTier) => void;
  showCurrentPlanOnly?: boolean;
}

export function PricingPlans({
  currentTier,
  onSelectPlan,
  showCurrentPlanOnly = false
}: PricingPlansProps) {
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  // Filter plans if needed
  const plans = showCurrentPlanOnly && currentTier
    ? subscriptionPlans.filter(plan => plan.tier === currentTier)
    : subscriptionPlans;

  return (
    <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-6">
      {plans.map((plan) => (
        <div
          key={plan.tier}
          className="relative flex flex-col p-6 transition-all"
          style={{
            background: hoveredPlan === plan.tier
              ? 'var(--dashboard-bg-hover)'
              : 'var(--dashboard-bg-elevated)',
            border: plan.recommended
              ? `1px solid ${currentTier === plan.tier ? '#2563eb' : '#9333ea'}`
              : currentTier === plan.tier
              ? '2px solid #2563eb'
              : '1px solid var(--dashboard-border-primary)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: hoveredPlan === plan.tier
              ? 'var(--dashboard-shadow-card-hover)'
              : plan.recommended
              ? '0 4px 6px -1px rgba(147, 51, 234, 0.1)'
              : 'var(--dashboard-shadow-card)'
          }}
          onMouseEnter={() => setHoveredPlan(plan.tier)}
          onMouseLeave={() => setHoveredPlan(null)}
        >
          {plan.recommended && (
            <div className="absolute -top-5 inset-x-0 flex justify-center">
              <span
                className="inline-flex items-center px-4 py-1"
                style={{
                  background: '#f3e8ff',
                  color: '#6b21a8',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-medium)'
                }}
              >
                Recommended
              </span>
            </div>
          )}
          
          <div className="flex-1">
            <h3
              style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--dashboard-text-primary)'
              }}
            >
              {plan.name}
            </h3>
            <p
              className="mt-2"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--dashboard-text-secondary)'
              }}
            >
              {plan.description}
            </p>
            
            <p className="mt-4">
              <span
                style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--dashboard-text-primary)'
                }}
              >
                Enterprise Pricing
              </span>
            </p>
            <p
              className="mt-1"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--dashboard-text-secondary)'
              }}
            >
              Contact our sales team for custom pricing
            </p>
            
            <div className="mt-6">
              <h4
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--dashboard-text-primary)'
                }}
              >
                What's included:
              </h4>
              <ul className="mt-2 space-y-3">
                {/* Show key features */}
                {plan.features.slice(0, 6).map((featureId) => {
                  const feature = subscriptionFeatures.find(f => f.id === featureId);
                  if (!feature) return null;
                  
                  return (
                    <li key={featureId} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5" style={{ color: '#22c55e' }} />
                      </div>
                      <p
                        className="ml-3"
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--dashboard-text-primary)'
                        }}
                      >
                        {feature.name}
                      </p>
                    </li>
                  );
                })}
                
                {/* Show feature count if there are more */}
                {plan.features.length > 6 && (
                  <li className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5" style={{ color: '#22c55e' }} />
                    </div>
                    <p
                      className="ml-3"
                      style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--dashboard-text-primary)'
                      }}
                    >
                      And {plan.features.length - 6} more features
                    </p>
                  </li>
                )}
              </ul>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <h4
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--dashboard-text-primary)'
                  }}
                >
                  Users
                </h4>
                <p
                  className="mt-2"
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--dashboard-text-secondary)'
                  }}
                >
                  Up to {plan.maxUsers.toLocaleString()}
                </p>
              </div>
              <div>
                <h4
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--dashboard-text-primary)'
                  }}
                >
                  Storage
                </h4>
                <p
                  className="mt-2"
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--dashboard-text-secondary)'
                  }}
                >
                  {plan.maxStorage} GB
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <button
              onClick={() => window.open('mailto:sales@pathfinity.com?subject=Enterprise Plan Inquiry', '_blank')}
              className="w-full inline-flex items-center justify-center px-4 py-2"
              style={{
                background: hoveredButton === plan.tier ? '#1d4ed8' : '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                boxShadow: currentTier === plan.tier
                  ? '0 0 0 2px #2563eb'
                  : 'var(--dashboard-shadow-card)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={() => setHoveredButton(plan.tier)}
              onMouseLeave={() => setHoveredButton(null)}
            >
              {currentTier === plan.tier ? 'Current Plan - Contact Sales' : 'Contact Sales'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}