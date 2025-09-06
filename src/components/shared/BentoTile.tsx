/**
 * BentoTile Component
 * Reusable tile component implementing visual hierarchy system
 */

import React, { useState } from 'react';
import { 
  HierarchyLevel, 
  ContainerType, 
  GradeLevel,
  ThemeMode,
  getTileStyles,
  getTextStyles,
  getIconSize,
  getHoverStyles,
  getSafeTextColor,
  BrandColors
} from '../../styles/visualHierarchy';

interface BentoTileProps {
  hierarchy: HierarchyLevel;
  containerType: ContainerType;
  gradeLevel: GradeLevel;
  theme: ThemeMode;
  
  // Content
  title: string;
  subtitle?: string;
  icon?: React.ReactNode | string;
  emoji?: string;
  avatarUrl?: string;
  
  // Layout
  gridSpan?: number;
  className?: string;
  style?: React.CSSProperties;
  
  // Interaction
  onClick?: () => void;
  onHover?: (isHovered: boolean) => void;
  disabled?: boolean;
  
  // Children for custom content
  children?: React.ReactNode;
  
  // Footer action
  actionButton?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
  };
}

export const BentoTile: React.FC<BentoTileProps> = ({
  hierarchy,
  containerType,
  gradeLevel,
  theme,
  title,
  subtitle,
  icon,
  emoji,
  avatarUrl,
  gridSpan = 1,
  className = '',
  style = {},
  onClick,
  onHover,
  disabled = false,
  children,
  actionButton
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Get styles from visual hierarchy system
  const tileStyles = getTileStyles(hierarchy, containerType, theme, gradeLevel);
  const textStyles = getTextStyles(hierarchy, gradeLevel);
  const iconSize = getIconSize(hierarchy, gradeLevel);
  const hoverStyles = isHovered && !disabled ? getHoverStyles(hierarchy) : {};
  const brandColors = BrandColors[containerType][theme];
  
  // Determine text color based on hierarchy
  const getTextColor = () => {
    if (hierarchy === 'PRIMARY') {
      return '#FFFFFF';
    }
    if (hierarchy === 'SECONDARY' && theme === 'light') {
      return brandColors.text.primary;
    }
    return brandColors.text[hierarchy === 'SECONDARY' ? 'primary' : hierarchy === 'TERTIARY' ? 'secondary' : 'muted'];
  };
  
  const getTitleColor = () => {
    if (hierarchy === 'PRIMARY') {
      return '#FFFFFF';
    }
    if (hierarchy === 'SECONDARY') {
      return brandColors.text.accent;
    }
    return getTextColor();
  };
  
  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover?.(false);
  };
  
  const renderIcon = () => {
    if (avatarUrl) {
      return (
        <div style={{
          width: iconSize,
          height: iconSize,
          borderRadius: '50%',
          overflow: 'hidden',
          border: `2px solid ${brandColors.border}`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          background: `linear-gradient(135deg, ${brandColors.border}, transparent)`,
          flexShrink: 0
        }}>
          <img 
            src={avatarUrl}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              if (target.parentElement && emoji) {
                target.parentElement.innerHTML = `<span style="font-size: ${parseInt(iconSize) * 0.6}px; display: flex; align-items: center; justify-content: center; height: 100%;">${emoji}</span>`;
              }
            }}
          />
        </div>
      );
    }
    
    if (emoji) {
      return (
        <span style={{
          fontSize: iconSize,
          filter: hierarchy === 'PRIMARY' ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.2))' : 
                   hierarchy === 'SECONDARY' ? 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))' : 
                   'none',
          animation: isHovered && hierarchy === 'SECONDARY' ? 'bounce 1s ease-in-out infinite' : 'none',
          flexShrink: 0
        }}>
          {emoji}
        </span>
      );
    }
    
    if (icon) {
      return (
        <div style={{
          fontSize: iconSize,
          color: getTitleColor(),
          flexShrink: 0
        }}>
          {icon}
        </div>
      );
    }
    
    return null;
  };
  
  const renderActionButton = () => {
    if (!actionButton) return null;
    
    const buttonStyles: React.CSSProperties = {
      padding: hierarchy === 'PRIMARY' ? '12px 32px' : 
               hierarchy === 'SECONDARY' ? '8px 20px' : 
               '6px 16px',
      fontSize: hierarchy === 'PRIMARY' ? '16px' : 
                hierarchy === 'SECONDARY' ? '14px' : 
                '12px',
      fontWeight: 500,
      borderRadius: '20px',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      opacity: disabled ? 0.5 : 1,
    };
    
    if (actionButton.variant === 'primary' || hierarchy === 'PRIMARY' || hierarchy === 'SECONDARY') {
      // Use contrasting backgrounds for better visibility
      if (theme === 'dark') {
        // Dark theme: Use dark background with white text for better contrast
        buttonStyles.background = 'rgba(26, 32, 44, 0.95)'; // Dark background
        buttonStyles.color = '#FFFFFF'; // White text
        buttonStyles.border = '2px solid rgba(255, 255, 255, 0.2)';
      } else {
        // Light theme: Use white background with colored text
        buttonStyles.background = 'rgba(255, 255, 255, 0.98)';
        buttonStyles.color = BrandColors[containerType].base;
        buttonStyles.border = '2px solid rgba(255, 255, 255, 1)';
      }
      buttonStyles.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      buttonStyles.fontWeight = 600;
    } else if (actionButton.variant === 'ghost') {
      buttonStyles.background = 'transparent';
      buttonStyles.color = brandColors.text.accent;
      buttonStyles.border = `1px solid ${brandColors.border}`;
    } else {
      buttonStyles.background = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
      buttonStyles.color = brandColors.text.primary;
    }
    
    return (
      <button
        style={buttonStyles}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) actionButton.onClick();
        }}
        disabled={disabled}
        onMouseEnter={(e) => {
          if (!disabled && (actionButton.variant === 'primary' || hierarchy === 'PRIMARY' || hierarchy === 'SECONDARY')) {
            (e.target as HTMLElement).style.transform = 'translateY(-2px) scale(1.02)';
            (e.target as HTMLElement).style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
            // Maintain theme-appropriate colors on hover
            if (theme === 'dark') {
              (e.target as HTMLElement).style.background = 'rgba(26, 32, 44, 1)';
            } else {
              (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 1)';
            }
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && (actionButton.variant === 'primary' || hierarchy === 'PRIMARY' || hierarchy === 'SECONDARY')) {
            (e.target as HTMLElement).style.transform = 'translateY(0) scale(1)';
            (e.target as HTMLElement).style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            // Return to original theme-appropriate colors
            if (theme === 'dark') {
              (e.target as HTMLElement).style.background = 'rgba(26, 32, 44, 0.95)';
            } else {
              (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.98)';
            }
          }
        }}
      >
        {actionButton.label}
      </button>
    );
  };
  
  // Determine layout based on hierarchy and content
  const isHorizontalLayout = (hierarchy === 'SECONDARY' || hierarchy === 'TERTIARY') && (emoji || avatarUrl);
  
  return (
    <div
      className={className}
      style={{
        ...tileStyles,
        ...hoverStyles,
        gridColumn: gridSpan > 1 ? `span ${gridSpan}` : undefined,
        cursor: onClick && !disabled ? 'pointer' : 'default',
        opacity: disabled ? 0.6 : 1,
        position: 'relative',
        borderRadius: '16px',
        padding: hierarchy === 'PRIMARY' ? '24px' : 
                 hierarchy === 'SECONDARY' ? '20px' : 
                 hierarchy === 'TERTIARY' ? '16px' : 
                 '12px',
        ...style
      }}
      onClick={onClick && !disabled ? onClick : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Content Layout */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header Section */}
        {(title || emoji || avatarUrl) && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: isHorizontalLayout ? '16px' : '12px',
            marginBottom: children || actionButton ? '16px' : '0',
            flexDirection: isHorizontalLayout ? 'row' : 'column'
          }}>
            {renderIcon()}
            
            <div style={{ flex: 1 }}>
              {title && (
                <h3 style={{
                  ...textStyles,
                  color: getTitleColor(),
                  margin: 0,
                  marginBottom: subtitle ? '4px' : 0
                }}>
                  {title}
                </h3>
              )}
              
              {subtitle && (
                <p style={{
                  fontSize: `${textStyles.fontSize - 4}px`,
                  color: getTextColor(),
                  margin: 0,
                  opacity: 0.9,
                  fontWeight: 400
                }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Custom Content */}
        {children && (
          <div style={{
            flex: 1,
            marginBottom: actionButton ? '16px' : 0
          }}>
            {children}
          </div>
        )}
        
        {/* Action Button */}
        {actionButton && (
          <div style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: hierarchy === 'PRIMARY' ? 'center' : 'flex-start'
          }}>
            {renderActionButton()}
          </div>
        )}
      </div>
      
      {/* Animated background effect for PRIMARY tiles */}
      {hierarchy === 'PRIMARY' && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.2) 0%, transparent 60%)',
          borderRadius: '16px',
          pointerEvents: 'none',
          animation: 'float 6s ease-in-out infinite'
        }} />
      )}
    </div>
  );
};