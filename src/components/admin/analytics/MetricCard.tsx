import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MetricCard as MetricCardType, formatMetricValue } from '../../../types/analytics';
import '../../../design-system/tokens/colors.css';
import '../../../design-system/tokens/spacing.css';
import '../../../design-system/tokens/borders.css';
import '../../../design-system/tokens/typography.css';
import '../../../design-system/tokens/shadows.css';
import '../../../design-system/tokens/dashboard.css';

interface MetricCardProps {
  metric: MetricCardType;
  className?: string;
}

const getColorClasses = (color: MetricCardType['color']) => {
  switch (color) {
    case 'blue':
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        icon: 'text-blue-600 dark:text-blue-400',
        text: 'text-blue-900 dark:text-blue-100'
      };
    case 'green':
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        icon: 'text-green-600 dark:text-green-400',
        text: 'text-green-900 dark:text-green-100'
      };
    case 'red':
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        icon: 'text-red-600 dark:text-red-400',
        text: 'text-red-900 dark:text-red-100'
      };
    case 'yellow':
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        icon: 'text-yellow-600 dark:text-yellow-400',
        text: 'text-yellow-900 dark:text-yellow-100'
      };
    case 'purple':
      return {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-800',
        icon: 'text-purple-600 dark:text-purple-400',
        text: 'text-purple-900 dark:text-purple-100'
      };
    case 'indigo':
      return {
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        border: 'border-indigo-200 dark:border-indigo-800',
        icon: 'text-indigo-600 dark:text-indigo-400',
        text: 'text-indigo-900 dark:text-indigo-100'
      };
    default:
      return {
        bg: 'bg-gray-50 dark:bg-gray-800',
        border: 'border-gray-200 dark:border-gray-700',
        icon: 'text-gray-600 dark:text-gray-400',
        text: 'text-gray-900 dark:text-gray-100'
      };
  }
};

const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'down':
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    case 'neutral':
    default:
      return <Minus className="h-4 w-4 text-gray-500" />;
  }
};

const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
  switch (trend) {
    case 'up':
      return 'text-green-600 dark:text-green-400';
    case 'down':
      return 'text-red-600 dark:text-red-400';
    case 'neutral':
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

export function MetricCard({ metric, className = '' }: MetricCardProps) {
  const colors = getColorClasses(metric.color);
  const formattedValue = typeof metric.value === 'string'
    ? metric.value
    : formatMetricValue(metric.value, metric.format);
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--dashboard-bg-elevated)',
        borderRadius: 'var(--radius-xl)',
        border: `1px solid var(--dashboard-border-primary)`,
        padding: 'var(--space-6)',
        transition: 'box-shadow 0.2s',
        boxShadow: isHovered ? 'var(--dashboard-shadow-card-hover)' : 'var(--dashboard-shadow-card)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div style={{ flex: 1 }}>
          <p style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            color: 'var(--dashboard-text-secondary)',
            marginBottom: 'var(--space-1)'
          }}>
            {metric.title}
          </p>
          <p style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--dashboard-text-primary)'
          }}>
            {formattedValue}
          </p>

          {metric.change && (
            <div className="flex items-center space-x-1" style={{ marginTop: 'var(--space-2)' }}>
              {getTrendIcon(metric.change.trend)}
              <span className={`${getTrendColor(metric.change.trend)}`} style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)'
              }}>
                {formatMetricValue(metric.change.value, 'percentage')}
              </span>
              <span style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--dashboard-text-tertiary)'
              }}>
                {metric.change.period}
              </span>
            </div>
          )}
        </div>

        {metric.icon && (
          <div className={colors.bg} style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div className={colors.icon} style={{ height: '1.5rem', width: '1.5rem' }}>
              {/* Icon would be rendered here based on metric.icon */}
              <div className="w-full h-full bg-current opacity-20 rounded"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}