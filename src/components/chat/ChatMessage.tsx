/**
 * ChatMessage Component
 * Individual message display in the chat window
 */

import React from 'react';
import { ChatMessage as ChatMessageType } from './ChatOverlay';
import styles from '../../styles/chat/ChatMessage.module.css';

interface ChatMessageProps {
  message: ChatMessageType;
  companionAvatar: string;
  companionName: string;
  isEmoji?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  companionAvatar,
  companionName,
  isEmoji = true
}) => {
  // Format timestamp
  const formatTime = (date: Date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const isToday = messageDate.toDateString() === now.toDateString();

    if (isToday) {
      return messageDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  // Get user avatar
  const getUserAvatar = () => {
    const userName = localStorage.getItem('userName') || sessionStorage.getItem('userName') || 'Student';
    return userName.charAt(0).toUpperCase();
  };

  // Render based on role
  if (message.role === 'system') {
    return (
      <div className={styles.systemMessage}>
        <span className={styles.systemIcon}>ℹ️</span>
        <span className={styles.systemText}>{message.content}</span>
      </div>
    );
  }

  const isUser = message.role === 'user';

  return (
    <div className={`${styles.messageContainer} ${isUser ? styles.userMessage : styles.assistantMessage}`}>
      {/* Avatar */}
      {!isUser && (
        <div className={styles.avatar}>
          {isEmoji ? (
            <span>{companionAvatar}</span>
          ) : (
            <img
              src={companionAvatar}
              alt={`${companionName} avatar`}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              onError={(e) => {
                // Fallback to emoji if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.insertAdjacentHTML('beforeend',
                  '<span>💬</span>');
              }}
            />
          )}
        </div>
      )}

      {/* Message Content */}
      <div className={styles.messageContent}>
        {/* Name and Time */}
        {!isUser && (
          <div className={styles.messageHeader}>
            <span className={styles.messageName}>{companionName}</span>
            {message.metadata?.agent && (
              <span className={styles.agentBadge}>
                via {message.metadata.agent}
              </span>
            )}
          </div>
        )}

        {/* Message Bubble */}
        <div className={`${styles.messageBubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}>
          <p className={styles.messageText}>{message.content}</p>
        </div>

        {/* Timestamp */}
        <div className={styles.messageTime}>
          {formatTime(message.timestamp)}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className={`${styles.avatar} ${styles.userAvatar}`}>
          <span>{getUserAvatar()}</span>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;