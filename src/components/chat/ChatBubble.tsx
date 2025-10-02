/**
 * ChatBubble Component
 * Minimized chat interface that floats on screen
 */

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useThemeContext } from '../../contexts/ThemeContext';
import styles from '../../styles/chat/ChatBubble.module.css';

interface ChatBubbleProps {
  unreadCount: number;
  companionId: string;
  position: { x: number; y: number };
  isDragging: boolean;
  isSpeaking?: boolean;
  onClick: () => void;
  onDrag: (x: number, y: number) => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  unreadCount,
  companionId,
  position,
  isDragging,
  isSpeaking = false,
  onClick,
  onDrag
}) => {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [bubblePosition, setBubblePosition] = useState(position);

  // Companion avatars - must match ChatWindow
  const companionAvatars: Record<string, string | { light: string; dark: string }> = {
    pat: '🧭',     // Onboarding guide (default) - using emoji
    finn: { light: '/images/companions/finn-light.png', dark: '/images/companions/finn-dark.png' },
    sage: { light: '/images/companions/sage-light.png', dark: '/images/companions/sage-dark.png' },
    spark: { light: '/images/companions/spark-light.png', dark: '/images/companions/spark-dark.png' },
    harmony: { light: '/images/companions/harmony-light.png', dark: '/images/companions/harmony-dark.png' }
  };

  // Get theme from context
  const { theme } = useThemeContext();
  const isDarkMode = theme === 'dark';

  // Get avatar for current companion
  const getAvatar = () => {
    const avatar = companionAvatars[companionId];
    if (!avatar) return '💬';
    if (typeof avatar === 'string') return avatar; // Pat's emoji
    return isDarkMode ? avatar.dark : avatar.light;
  };

  const avatarSrc = getAvatar();
  const isEmoji = typeof avatarSrc === 'string' && avatarSrc.length <= 4;

  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragStart({ x: e.clientX - bubblePosition.x, y: e.clientY - bubblePosition.y });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle drag move
  const handleMouseMove = (e: MouseEvent) => {
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Keep bubble within viewport
    const maxX = window.innerWidth - 80;
    const maxY = window.innerHeight - 80;

    setBubblePosition({
      x: Math.max(20, Math.min(newX, maxX)),
      y: Math.max(20, Math.min(newY, maxY))
    });
  };

  // Handle drag end
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    onDrag(bubblePosition.x, bubblePosition.y);
  };

  // Handle click (expand chat)
  const handleClick = (e: React.MouseEvent) => {
    // Only expand if not dragging
    if (!isDragging) {
      onClick();
    }
  };

  // Touch support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setDragStart({
      x: touch.clientX - bubblePosition.x,
      y: touch.clientY - bubblePosition.y
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;

    const maxX = window.innerWidth - 80;
    const maxY = window.innerHeight - 80;

    setBubblePosition({
      x: Math.max(20, Math.min(newX, maxX)),
      y: Math.max(20, Math.min(newY, maxY))
    });
  };

  const handleTouchEnd = () => {
    onDrag(bubblePosition.x, bubblePosition.y);
  };

  // ChatBubble render state tracked

  return (
    <div
      ref={bubbleRef}
      className={`${styles.chatBubble} ${unreadCount > 0 ? styles.hasUnread : ''} ${isSpeaking ? styles.isSpeaking : ''}`}
      style={{
        left: `${bubblePosition.x}px`,
        top: `${bubblePosition.y}px`
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="button"
      tabIndex={0}
      aria-label={`Chat with ${companionId}. ${unreadCount} unread messages`}
    >
      {/* Companion Avatar */}
      <div className={styles.avatar}>
        {isEmoji ? (
          <span className={styles.avatarEmoji}>
            {avatarSrc}
          </span>
        ) : (
          <img
            src={avatarSrc}
            alt={`${companionId} avatar`}
            className={styles.avatarImage}
            onError={(e) => {
              // Fallback to emoji if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.insertAdjacentHTML('beforeend',
                `<span class="${styles.avatarEmoji}">💬</span>`);
            }}
          />
        )}
      </div>

      {/* Unread Badge */}
      {unreadCount > 0 && (
        <div className={styles.unreadBadge}>
          <span>{unreadCount > 9 ? '9+' : unreadCount}</span>
        </div>
      )}

      {/* Pulse Animation for Attention or Speaking */}
      {(unreadCount > 0 || isSpeaking) && (
        <div className={`${styles.pulseRing} ${isSpeaking ? styles.speakingPulse : ''}`}></div>
      )}

      {/* Additional rings for speaking animation */}
      {isSpeaking && (
        <>
          <div className={`${styles.pulseRing} ${styles.speakingPulse2}`}></div>
          <div className={`${styles.pulseRing} ${styles.speakingPulse3}`}></div>
        </>
      )}

      {/* Typing Indicator */}
      {false && ( // Will be connected to actual typing state
        <div className={styles.typingIndicator}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}
    </div>
  );
};

export default ChatBubble;