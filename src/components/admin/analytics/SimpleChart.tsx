import React, { useMemo } from 'react';
import { ChartData } from '../../../types/analytics';

interface SimpleChartProps {
  data: ChartData;
  type: 'line' | 'bar' | 'doughnut';
  height?: number;
  className?: string;
}

export function SimpleChart({ data, type, height = 300, className = '' }: SimpleChartProps) {
  // Since we don't have Chart.js installed, we'll create simple SVG charts
  const maxValue = useMemo(() => {
    if (!data.datasets || data.datasets.length === 0) return 0;
    return Math.max(...data.datasets.flatMap(dataset => dataset.data));
  }, [data]);

  const renderLineChart = () => {
    if (!data.datasets || data.datasets.length === 0) return null;
    
    const dataset = data.datasets[0];
    const chartWidth = 90; // Use 90% of available width to ensure full utilization
    const chartStartX = 5; // Start chart 5% from left edge
    const points = dataset.data.map((value, index) => {
      const x = chartStartX + (index / (data.labels.length - 1)) * chartWidth;
      const y = 85 - (value / maxValue) * 70; // 70% of height for data, leave space for labels
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="100%" height={height} viewBox="0 0 100 100" preserveAspectRatio="none" className="overflow-visible">
        {/* Grid lines */}
        {[15, 30, 45, 60, 75, 85].map(y => (
          <line
            key={y}
            x1={chartStartX}
            y1={y}
            x2={chartStartX + chartWidth}
            y2={y}
            stroke="currentColor"
            strokeWidth="0.2"
            className="text-gray-300 dark:text-gray-600"
          />
        ))}
        
        {/* Data line */}
        <polyline
          fill="none"
          stroke={dataset.borderColor || '#3b82f6'}
          strokeWidth="2"
          points={points}
          className="drop-shadow-sm"
        />
        
        {/* Fill area if specified */}
        {dataset.fill && (
          <polygon
            fill={dataset.backgroundColor || '#3b82f650'}
            points={`${chartStartX},85 ${points} ${chartStartX + chartWidth},85`}
            className="opacity-30"
          />
        )}
        
        {/* Data points */}
        {dataset.data.map((value, index) => {
          const x = chartStartX + (index / (data.labels.length - 1)) * chartWidth;
          const y = 85 - (value / maxValue) * 70;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="1.5"
              fill={dataset.borderColor || '#3b82f6'}
              className="drop-shadow-sm"
            />
          );
        })}
      </svg>
    );
  };

  const renderBarChart = () => {
    if (!data.datasets || data.datasets.length === 0) return null;
    
    const dataset = data.datasets[0];
    const chartWidth = 90;
    const chartStartX = 5;
    const barWidth = chartWidth / data.labels.length * 0.8; // 80% of available space per bar
    const barSpacing = chartWidth / data.labels.length * 0.2; // 20% spacing

    return (
      <svg width="100%" height={height} viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Grid lines */}
        {[15, 30, 45, 60, 75, 85].map(y => (
          <line
            key={y}
            x1={chartStartX}
            y1={y}
            x2={chartStartX + chartWidth}
            y2={y}
            stroke="currentColor"
            strokeWidth="0.2"
            className="text-gray-300 dark:text-gray-600"
          />
        ))}
        
        {/* Bars */}
        {dataset.data.map((value, index) => {
          const x = chartStartX + index * (barWidth + barSpacing) + barSpacing;
          const barHeight = (value / maxValue) * 70;
          const y = 85 - barHeight;
          const color = Array.isArray(dataset.backgroundColor) 
            ? dataset.backgroundColor[index % dataset.backgroundColor.length]
            : dataset.backgroundColor || '#3b82f6';
          
          return (
            <rect
              key={index}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              className="drop-shadow-sm"
              rx="1"
            />
          );
        })}
      </svg>
    );
  };

  const renderDoughnutChart = () => {
    if (!data.datasets || data.datasets.length === 0) return null;
    
    const dataset = data.datasets[0];
    const total = dataset.data.reduce((sum, value) => sum + value, 0);
    let currentAngle = 0;
    const centerX = 50;
    const centerY = 50;
    const radius = 35;
    const innerRadius = 20;

    return (
      <svg width="100%" height={height} viewBox="0 0 100 100" preserveAspectRatio="none">
        {dataset.data.map((value, index) => {
          const percentage = value / total;
          const angle = percentage * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          
          const x1 = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180);
          const y1 = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180);
          const x2 = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180);
          const y2 = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180);
          
          const x3 = centerX + innerRadius * Math.cos((endAngle - 90) * Math.PI / 180);
          const y3 = centerY + innerRadius * Math.sin((endAngle - 90) * Math.PI / 180);
          const x4 = centerX + innerRadius * Math.cos((startAngle - 90) * Math.PI / 180);
          const y4 = centerY + innerRadius * Math.sin((startAngle - 90) * Math.PI / 180);
          
          const largeArcFlag = angle > 180 ? 1 : 0;
          const color = Array.isArray(dataset.backgroundColor) 
            ? dataset.backgroundColor[index % dataset.backgroundColor.length]
            : dataset.backgroundColor || '#3b82f6';
          
          currentAngle += angle;
          
          return (
            <path
              key={index}
              d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`}
              fill={color}
              className="drop-shadow-sm"
            />
          );
        })}
      </svg>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return renderLineChart();
      case 'bar':
        return renderBarChart();
      case 'doughnut':
        return renderDoughnutChart();
      default:
        return renderLineChart();
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 w-full !max-w-none ${className}`} style={{ maxWidth: 'none', width: '100%' }}>
      {data.datasets && data.datasets.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-4">
            {data.datasets.map((dataset, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: dataset.borderColor || dataset.backgroundColor }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {dataset.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="relative w-full overflow-hidden" style={{ minHeight: (type === 'line' || type === 'bar') ? `${height + 50}px` : `${height}px`, maxWidth: 'none' }}>
        {renderChart()}
        
        {/* X-axis labels for line and bar charts */}
        {(type === 'line' || type === 'bar') && (
          <div className="relative mt-4" style={{ height: '40px' }}>
            {data.labels.map((label, index) => {
              const chartWidth = 90;
              const chartStartX = 5;
              const labelX = chartStartX + (index / (data.labels.length - 1)) * chartWidth;
              
              return (
                <div 
                  key={index} 
                  className="absolute text-xs text-gray-500 dark:text-gray-400"
                  style={{
                    left: `${labelX}%`,
                    transform: 'translateX(-50%) rotate(-45deg)',
                    transformOrigin: 'center top',
                    whiteSpace: 'nowrap',
                    top: '0px'
                  }}
                >
                  {label}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Legend for doughnut chart */}
        {type === 'doughnut' && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {data.labels.map((label, index) => {
              const dataset = data.datasets[0];
              const color = Array.isArray(dataset.backgroundColor) 
                ? dataset.backgroundColor[index % dataset.backgroundColor.length]
                : dataset.backgroundColor || '#3b82f6';
              
              return (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}