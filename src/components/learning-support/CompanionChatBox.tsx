/**
 * Companion Chat Box
 * A small, non-intrusive chat display for AI companion messages
 * Appears at the bottom right of the content area
 */

import React, { useState, useEffect, useRef } from 'react';
import styles from '../../styles/shared/components/CompanionChatBox.module.css';

interface CompanionChatBoxProps {
  companionName?: string;
  companionEmoji?: string;
  message?: { text: string; emotion?: string } | null;
  position?: 'bottom-right' | 'bottom-left';
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const CompanionChatBox = React.forwardRef<any, CompanionChatBoxProps>(({
  companionName = 'Finn',
  companionEmoji = '🤖',
  message,
  position = 'bottom-right',
  autoHide = true,
  autoHideDelay = 8000
}, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  // Show message when received
  useEffect(() => {
    // Debug: useEffect triggered (disabled to reduce console noise)
    
    if (message && message.text) {
      // Debug: Displaying message
      setCurrentMessage(message.text);
      setIsVisible(true);

      // Auto-hide after delay
      if (autoHide) {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
        hideTimeoutRef.current = setTimeout(() => {
          // Debug: Auto-hiding message
          setIsVisible(false);
        }, autoHideDelay);
      }
    }
    // Don't hide when message becomes null - let the timeout handle it
  }, [message?.text, autoHide, autoHideDelay]);

  // Expose method to add messages programmatically
  React.useImperativeHandle(ref, () => ({
    showMessage: (text: string) => {
      // Debug: showMessage called via ref
      setCurrentMessage(text);
      setIsVisible(true);
      
      if (autoHide) {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
        hideTimeoutRef.current = setTimeout(() => {
          // Debug: Auto-hiding message (ref method)
          setIsVisible(false);
        }, autoHideDelay);
      }
    },
    hide: () => {
      // Debug: hide called via ref
      setIsVisible(false);
    }
  }));

  // Get companion emoji
  const getCompanionEmoji = () => {
    const companions: Record<string, string> = {
      'Finn': '🤖',
      'Sage': '🦉',
      'Spark': '⚡',
      'Harmony': '🎵'
    };
    return companions[companionName] || companionEmoji;
  };

  // Debug logging for render (disabled to reduce console noise)

  if (!isVisible || !currentMessage) {
    // Debug: Not rendering
    return null;
  }

  // Debug: Rendering component to DOM

  return (
    <div 
      className={`${styles.companionChatBox} ${position === 'bottom-right' ? styles.bottomRight : styles.bottomLeft}`}
    >
      {/* Companion Avatar */}
      <div className={styles.companionAvatar}>
        {getCompanionEmoji()}
      </div>

      {/* Message Content */}
      <div className={styles.messageContent}>
        <div className={styles.companionName}>
          {companionName}
        </div>
        <div className={styles.messageText}>
          {currentMessage}
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={() => setIsVisible(false)}
        className={styles.closeButton}
      >
        ×
      </button>
    </div>
  );
});

export default CompanionChatBox;