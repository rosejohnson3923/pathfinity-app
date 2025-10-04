import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { SubscriptionTier, isFeatureAvailable, subscriptionFeatures } from '../../types/subscription';
import '../../design-system/tokens/colors.css';
import '../../design-system/tokens/spacing.css';
import '../../design-system/tokens/borders.css';
import '../../design-system/tokens/typography.css';
import '../../design-system/tokens/shadows.css';
import '../../design-system/tokens/dashboard.css';

interface FeatureAvailabilityProps {
  featureId: string;
  currentTier: SubscriptionTier;
  showUpgrade?: boolean;
  onUpgrade?: () => void;
}

export function FeatureAvailability({ 
  featureId, 
  currentTier, 
  showUpgrade = true,
  onUpgrade 
}: FeatureAvailabilityProps) {
  const isAvailable = isFeatureAvailable(featureId, currentTier);
  const feature = subscriptionFeatures.find(f => f.id === featureId);

  if (isAvailable) {
    return null; // Don't show anything if the feature is available
  }

  // Find the lowest tier that has this feature
  const requiredTier = feature?.tiers[0] || 'premium';

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div style={{
      backgroundColor: 'rgba(251, 191, 36, 0.1)',
      border: '1px solid rgba(251, 191, 36, 0.3)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
      marginBottom: 'var(--space-4)'
    }}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-amber-500" aria-hidden="true" />
        </div>
        <div style={{ marginLeft: 'var(--space-3)' }}>
          <h3 style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: '#92400e'
          }}>
            {feature?.name || 'Premium Feature'}
          </h3>
          <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)', color: '#b45309' }}>
            <p>
              This feature is not available on your current subscription plan.
              {` Upgrade to ${requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} or higher to access this feature.`}
            </p>
          </div>
          {showUpgrade && onUpgrade && (
            <div style={{ marginTop: 'var(--space-4)' }}>
              <button
                type="button"
                onClick={onUpgrade}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: 'var(--space-2) var(--space-3)',
                  border: 'none',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-sm)',
                  color: '#FFFFFF',
                  backgroundColor: isHovered ? '#b45309' : '#d97706',
                  cursor: 'pointer',
                  transition: 'background-color 200ms'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                Upgrade Subscription
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function FeatureList({ 
  tier, 
  compact = false 
}: { 
  tier: SubscriptionTier; 
  compact?: boolean;
}) {
  // Features based on actual Pathfinity implementation
  const features = [
    { id: 'core_learning', name: 'Personalized Learning Engine' },
    { id: 'ai_assistant', name: 'Finn AI Tutor & Assistant' },
    { id: 'basic_analytics', name: 'Student Progress Analytics' },
    { id: 'content_library', name: 'Multi-Subject Content Library' },
    { id: 'collab_projects', name: 'Collaborative Learning Tools' },
    { id: 'advanced_analytics', name: 'Advanced Teacher Analytics' },
    { id: 'adaptive_learning', name: 'Adaptive Learning Engine' },
    { id: 'career_pathways', name: 'Career Discovery & Pathways' },
    { id: 'sso_integration', name: 'SSO Integration' },
    { id: 'custom_branding', name: 'Custom School Branding' }
  ];

  return (
    <ul className={`space-y-${compact ? '1' : '2'}`}>
      {features.map((feature) => {
        const available = isFeatureAvailable(feature.id, tier);
        return (
          <li key={feature.id} className="flex items-center">
            {available ? (
              <Check
                className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} flex-shrink-0`}
                style={{
                  color: '#10b981',
                  marginRight: 'var(--space-2)'
                }}
              />
            ) : (
              <X
                className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} flex-shrink-0`}
                style={{
                  color: 'var(--dashboard-text-tertiary)',
                  marginRight: 'var(--space-2)'
                }}
              />
            )}
            <span
              style={{
                fontSize: compact ? 'var(--text-sm)' : 'var(--text-base)',
                color: available ? 'var(--dashboard-text-primary)' : 'var(--dashboard-text-tertiary)'
              }}
            >
              {feature.name}
            </span>
          </li>
        );
      })}
    </ul>
  );
}