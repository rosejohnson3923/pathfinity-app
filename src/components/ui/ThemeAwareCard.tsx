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
  // Container-specific gradient classes
  const containerGradients = useMemo(() => ({
    learn: 'from-purple-500/10 via-pink-500/10 to-blue-500/10',
    experience: 'from-green-500/10 via-emerald-500/10 to-teal-500/10',
    discover: 'from-orange-500/10 via-amber-500/10 to-yellow-500/10'
  }), []);

  // Container-specific border colors
  const containerBorders = useMemo(() => ({
    learn: 'border-purple-500/20 hover:border-purple-500/40',
    experience: 'border-green-500/20 hover:border-green-500/40',
    discover: 'border-orange-500/20 hover:border-orange-500/40'
  }), []);

  // Container-specific shadows
  const containerShadows = useMemo(() => ({
    learn: 'shadow-purple-500/10',
    experience: 'shadow-green-500/10',
    discover: 'shadow-orange-500/10'
  }), []);

  // Variant-specific classes
  const variantClasses = useMemo(() => {
    switch (variant) {
      case 'glass':
        return cn(
          'backdrop-blur-md bg-white/5 dark:bg-black/5',
          'border border-white/10 dark:border-white/5'
        );
      case 'gradient':
        return cn(
          'bg-gradient-to-br',
          containerGradients[container],
          'border',
          containerBorders[container]
        );
      case 'outline':
        return cn(
          'bg-transparent',
          'border-2',
          containerBorders[container]
        );
      default:
        return cn(
          'bg-white dark:bg-gray-900',
          'border border-gray-200 dark:border-gray-800'
        );
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

  // Badge color classes
  const getBadgeColorClass = () => {
    if (badgeColor) return badgeColor;
    switch (container) {
      case 'learn':
        return 'bg-purple-500 text-white';
      case 'experience':
        return 'bg-green-500 text-white';
      case 'discover':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={cn(
          'relative rounded-xl overflow-hidden transition-all duration-300',
          variantClasses,
          hoverable && 'hover:shadow-xl',
          hoverable && `hover:${containerShadows[container]}`,
          clickable && 'cursor-pointer',
          className
        )}
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
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        )}

        {/* Content container */}
        <div className="relative z-10 p-6">
          {/* Header section with icon, title, and badge */}
          {(Icon || title || badge) && (
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                {Icon && (
                  <motion.div
                    className={cn(
                      'p-2 rounded-lg',
                      variant === 'gradient' ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'
                    )}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5',
                        iconColor || `text-${container === 'learn' ? 'purple' : container === 'experience' ? 'green' : 'orange'}-500`
                      )}
                    />
                  </motion.div>
                )}

                <div>
                  {title && (
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {badge && (
                <motion.span
                  className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    getBadgeColorClass()
                  )}
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
}) => (
  <ThemeAwareCard {...props}>
    <div className="space-y-2">
      {props.children}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <motion.div
          className={cn(
            'h-full rounded-full',
            props.container === 'learn' ? 'bg-purple-500' :
            props.container === 'experience' ? 'bg-green-500' :
            'bg-orange-500'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  </ThemeAwareCard>
);

export const StatCard: React.FC<ThemeAwareCardProps & {
  value: string | number;
  label: string;
  trend?: 'up' | 'down';
}> = ({ value, label, trend, ...props }) => (
  <ThemeAwareCard {...props}>
    <div className="space-y-1">
      <div className="flex items-baseline space-x-2">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </span>
        {trend && (
          <motion.span
            className={cn(
              'text-sm',
              trend === 'up' ? 'text-green-500' : 'text-red-500'
            )}
            initial={{ y: trend === 'up' ? 5 : -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {trend === 'up' ? '↑' : '↓'}
          </motion.span>
        )}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  </ThemeAwareCard>
);