import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MetricCard as MetricCardType, formatMetricValue } from '../../../types/analytics';

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

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border ${colors.border} p-6 transition-all hover:shadow-md ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {metric.title}
          </p>
          <p className={`text-2xl font-bold ${colors.text}`}>
            {formattedValue}
          </p>
          
          {metric.change && (
            <div className="flex items-center space-x-1 mt-2">
              {getTrendIcon(metric.change.trend)}
              <span className={`text-sm font-medium ${getTrendColor(metric.change.trend)}`}>
                {formatMetricValue(metric.change.value, 'percentage')}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {metric.change.period}
              </span>
            </div>
          )}
        </div>
        
        {metric.icon && (
          <div className={`p-3 ${colors.bg} rounded-lg`}>
            <div className={`h-6 w-6 ${colors.icon}`}>
              {/* Icon would be rendered here based on metric.icon */}
              <div className="w-full h-full bg-current opacity-20 rounded"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}