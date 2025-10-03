/**
 * ThemeAwareCard Component
 *
 * A reusable card component that adapts to the current theme
 * and container context (Learn, Experience, Discover).
 *
 * Features:
 * - Dynamic gradient backgrounds based on container
 * - Theme-aware colors and shadows
 * - Hover animations and effects
 * - Optional glass morphism effect
 * - Responsive design
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

// Design System Imports
import '../../design-system/tokens/colors.css';
import '../../design-system/tokens/spacing.css';
import '../../design-system/tokens/borders.css';
import '../../design-system/tokens/effects.css';
import '../../design-system/tokens/typography.css';
import '../../design-system/tokens/shadows.css';

interface ThemeAwareCardProps {
  children: React.ReactNode;
  container?: 'learn' | 'experience' | 'discover';
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'outline';
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  icon?: LucideIcon;
  iconColor?: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  animateOnHover?: boolean;
  animationDelay?: number;
}

export const ThemeAwareCard: React.FC<ThemeAwareCardProps> = ({
  children,
  container = 'learn',
  className = '',
  variant = 'default',
  hoverable = true,
  clickable = false,
  onClick,
  icon: Icon,
  iconColor,
  title,
  subtitle,
  badge,
  badgeColor,
  animateOnHover = true,
  animationDelay = 0
}) => {
  // Container-specific gradient classes using design tokens
  const containerGradients = useMemo(() => ({
    learn: 'var(--color-container-learn)',
    experience: 'var(--color-container-experience)',
    discover: 'var(--color-container-discover)'
  }), []);

  // Container-specific border colors using design tokens
  const containerBorders = useMemo(() => ({
    learn: 'var(--color-subject-science-border)',
    experience: 'var(--color-subject-ela-border)',
    discover: 'var(--color-subject-social-border)'
  }), []);

  // Container-specific shadows using design tokens
  const containerShadows = useMemo(() => ({
    learn: 'var(--shadow-purple)',
    experience: 'var(--shadow-teal)',
    discover: 'var(--shadow-pink)'
  }), []);

  // Variant-specific styles using design tokens
  const getVariantStyles = useMemo(() => {
    switch (variant) {
      case 'glass':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--color-border-subtle)'
        };
      case 'gradient':
        return {
          background: containerGradients[container],
          border: `1px solid ${containerBorders[container]}`
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          border: `2px solid ${containerBorders[container]}`
        };
      default:
        return {
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)'
        };
    }
  }, [variant, container, containerGradients, containerBorders]);

  // Hover animation variants
  const cardVariants = {
    initial: {
      scale: 1,
      y: 0
    },
    hover: animateOnHover ? {
      scale: 1.02,
      y: -4,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25
      }
    } : {},
    tap: clickable ? {
      scale: 0.98,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 25
      }
    } : {}
  };

  // Badge color styles using design tokens
  const getBadgeStyles = () => {
    if (badgeColor) return { backgroundColor: badgeColor, color: '#ffffff' };
    switch (container) {
      case 'learn':
        return { backgroundColor: 'var(--purple-500)', color: '#ffffff' };
      case 'experience':
        return { backgroundColor: 'var(--green-500)', color: '#ffffff' };
      case 'discover':
        return { backgroundColor: 'var(--amber-500)', color: '#ffffff' };
      default:
        return { backgroundColor: 'var(--gray-500)', color: '#ffffff' };
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={cn(
          'relative overflow-hidden transition-all duration-300',
          clickable && 'cursor-pointer',
          className
        )}
        style={{
          borderRadius: 'var(--radius-xl)',
          boxShadow: hoverable ? 'var(--shadow-card)' : 'none',
          ...getVariantStyles,
          ':hover': hoverable ? {
            boxShadow: containerShadows[container]
          } : {}
        }}
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: animationDelay }}
        onClick={onClick}
      >
        {/* Glass effect overlay for glass variant */}
        {variant === 'glass' && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.1), transparent)'
            }}
          />
        )}

        {/* Content container */}
        <div
          className="relative z-10"
          style={{ padding: 'var(--space-6)' }}
        >
          {/* Header section with icon, title, and badge */}
          {(Icon || title || badge) && (
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                {Icon && (
                  <motion.div
                    style={{
                      padding: 'var(--space-2)',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: variant === 'gradient' ? 'rgba(255, 255, 255, 0.2)' : 'var(--color-bg-secondary)'
                    }}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon
                      style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        color: iconColor || (container === 'learn' ? 'var(--purple-500)' :
                                            container === 'experience' ? 'var(--green-500)' :
                                            'var(--amber-500)')
                      }}
                    />
                  </motion.div>
                )}

                <div>
                  {title && (
                    <h3 style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--color-text-primary)',
                      margin: 0
                    }}>
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-secondary)',
                      marginTop: 'var(--space-1)',
                      margin: 0
                    }}>
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {badge && (
                <motion.span
                  style={{
                    padding: 'var(--space-1) var(--space-2)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    ...getBadgeStyles()
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: animationDelay + 0.2, type: 'spring' }}
                >
                  {badge}
                </motion.span>
              )}
            </div>
          )}

          {/* Main content */}
          {children}
        </div>

        {/* Animated gradient border for gradient variant */}
        {variant === 'gradient' && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: `linear-gradient(45deg, transparent, ${
                container === 'learn' ? 'rgba(168, 85, 247, 0.3)' :
                container === 'experience' ? 'rgba(34, 197, 94, 0.3)' :
                'rgba(251, 146, 60, 0.3)'
              }, transparent)`,
              backgroundSize: '200% 200%'
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        )}

        {/* Shine effect on hover */}
        {hoverable && (
          <motion.div
            className="absolute inset-0 opacity-0 hover:opacity-100 pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.1) 50%, transparent 60%)',
              transform: 'translateX(-100%)'
            }}
            whileHover={{
              transform: 'translateX(100%)',
              transition: { duration: 0.6 }
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// Preset card variants for common use cases
export const ProgressCard: React.FC<ThemeAwareCardProps & { progress: number }> = ({
  progress,
  ...props
}) => {
  const getProgressColor = () => {
    switch (props.container) {
      case 'learn':
        return 'var(--purple-500)';
      case 'experience':
        return 'var(--green-500)';
      case 'discover':
        return 'var(--amber-500)';
      default:
        return 'var(--blue-500)';
    }
  };

  return (
    <ThemeAwareCard {...props}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {props.children}
        <div style={{
          width: '100%',
          backgroundColor: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-full)',
          height: 'var(--space-2)'
        }}>
          <motion.div
            style={{
              height: '100%',
              borderRadius: 'var(--radius-full)',
              backgroundColor: getProgressColor()
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>
    </ThemeAwareCard>
  );
};

export const StatCard: React.FC<ThemeAwareCardProps & {
  value: string | number;
  label: string;
  trend?: 'up' | 'down';
}> = ({ value, label, trend, ...props }) => (
  <ThemeAwareCard {...props}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
        <span style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 'var(--font-bold)',
          color: 'var(--color-text-primary)'
        }}>
          {value}
        </span>
        {trend && (
          <motion.span
            style={{
              fontSize: 'var(--text-sm)',
              color: trend === 'up' ? 'var(--green-500)' : 'var(--red-500)'
            }}
            initial={{ y: trend === 'up' ? 5 : -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {trend === 'up' ? '↑' : '↓'}
          </motion.span>
        )}
      </div>
      <p style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-secondary)'
      }}>{label}</p>
    </div>
  </ThemeAwareCard>
);