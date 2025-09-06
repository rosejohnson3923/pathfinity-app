/**
 * Toast Container Component
 * Renders toast notifications with career theming and companion integration
 */

import React from 'react';
import { useToast, ToastMessage, ToastType } from '../../services/toastNotificationService';
import { AICharacterAvatar } from '../ai-characters/AICharacterAvatar';
import './ToastContainer.css';

// ============================================================================
// TOAST ITEM COMPONENT
// ============================================================================

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = React.useState(false);
  
  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300);
  };
  
  const getTypeStyles = (type: ToastType): string => {
    const styles: Record<ToastType, string> = {
      'success': 'toast-success',
      'info': 'toast-info',
      'warning': 'toast-warning',
      'error': 'toast-error',
      'achievement': 'toast-achievement',
      'companion': 'toast-companion'
    };
    return styles[type] || 'toast-info';
  };
  
  const getIcon = (type: ToastType): string => {
    if (toast.icon) return toast.icon;
    
    const icons: Record<ToastType, string> = {
      'success': '✅',
      'info': 'ℹ️',
      'warning': '⚠️',
      'error': '❌',
      'achievement': '🏆',
      'companion': '💬'
    };
    return icons[type] || 'ℹ️';
  };
  
  return (
    <div 
      className={`toast-item ${getTypeStyles(toast.type)} ${isExiting ? 'toast-exit' : 'toast-enter'}`}
      style={toast.metadata?.careerColor ? {
        '--toast-border-color': toast.metadata.careerColor
      } as React.CSSProperties : undefined}
    >
      {/* Companion Avatar for companion type toasts */}
      {toast.type === 'companion' && toast.companionId && (
        <div className="toast-companion-avatar">
          <AICharacterAvatar
            character={toast.companionId}
            emotion={toast.companionEmotion || 'happy'}
            size="small"
          />
        </div>
      )}
      
      {/* Icon */}
      {toast.type !== 'companion' && (
        <div className="toast-icon">
          <span>{getIcon(toast.type)}</span>
        </div>
      )}
      
      {/* Content */}
      <div className="toast-content">
        {toast.title && (
          <div className="toast-title">{toast.title}</div>
        )}
        <div className="toast-message">{toast.message}</div>
        
        {/* Actions */}
        {toast.actions && toast.actions.length > 0 && (
          <div className="toast-actions">
            {toast.actions.map((action, index) => (
              <button
                key={index}
                className={`toast-action toast-action-${action.style || 'primary'}`}
                onClick={() => {
                  action.action();
                  handleDismiss();
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Close button */}
      <button 
        className="toast-close"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
};

// ============================================================================
// TOAST CONTAINER COMPONENT
// ============================================================================

export interface ToastContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  maxToasts = 3
}) => {
  const { toasts, dismiss } = useToast();
  
  // Limit displayed toasts
  const displayedToasts = toasts.slice(0, maxToasts);
  
  // Position classes are defined in CSS instead of inline styles
  
  return (
    <div 
      className={`toast-container toast-position-${position}`}
    >
      {displayedToasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={dismiss}
        />
      ))}
    </div>
  );
};

// ============================================================================
// TOAST PROVIDER (OPTIONAL)
// ============================================================================

interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastContainerProps['position'];
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  maxToasts = 3
}) => {
  return (
    <>
      {children}
      <ToastContainer position={position} maxToasts={maxToasts} />
    </>
  );
};

export default ToastContainer;