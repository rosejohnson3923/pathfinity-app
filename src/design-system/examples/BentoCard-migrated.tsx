/**
 * MIGRATION EXAMPLE: BentoExperienceCard
 * =======================================
 * This shows how to migrate a component from the old system
 * to the new token-based design system
 */

import React from 'react';
import '../tokens/colors.css';
import '../tokens/spacing.css';
import '../tokens/layout.css';
import '../tokens/typography.css';
import '../tokens/effects.css';
import '../components/base.css';
import './BentoCard-migrated.css';

interface BentoCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  grade: 'elementary' | 'middle' | 'high' | 'college' | 'professional';
  type: 'welcome' | 'skills' | 'projects' | 'achievements';
  isActive?: boolean;
  onClick?: () => void;
}

/**
 * BEFORE: Component had complex theme logic, inline styles, 
 * and CSS modules competing with each other
 * 
 * AFTER: Clean separation - all styling through tokens
 */
export const BentoCardMigrated: React.FC<BentoCardProps> = ({
  title,
  description,
  icon,
  grade,
  type,
  isActive = false,
  onClick
}) => {
  // No inline styles! Everything comes from CSS classes
  const cardClasses = [
    'bento-card',
    `bento-card--${type}`,
    `bento-card--${grade}`,
    isActive && 'bento-card--active'
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={cardClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Icon section */}
      {icon && (
        <div className="bento-card__icon">
          {icon}
        </div>
      )}

      {/* Content section */}
      <div className="bento-card__content">
        <h3 className="bento-card__title">
          {title}
        </h3>
        <p className="bento-card__description">
          {description}
        </p>
      </div>

      {/* Grade indicator */}
      <div className="bento-card__grade">
        <span className="bento-card__grade-label">
          {grade}
        </span>
      </div>

      {/* Active indicator */}
      {isActive && (
        <div className="bento-card__active-indicator" />
      )}
    </div>
  );
};

/**
 * KEY IMPROVEMENTS:
 * 
 * 1. NO INLINE STYLES
 *    - All styling through CSS classes
 *    - No dynamic style objects
 * 
 * 2. SINGLE THEME SOURCE
 *    - CSS variables update automatically
 *    - No theme prop needed
 * 
 * 3. PREDICTABLE CASCADE
 *    - BEM naming prevents conflicts
 *    - Clear specificity hierarchy
 * 
 * 4. ACCESSIBILITY
 *    - Proper ARIA roles
 *    - Keyboard navigation support
 * 
 * 5. MAINTAINABILITY
 *    - All styles in one CSS file
 *    - Easy to debug and override
 */