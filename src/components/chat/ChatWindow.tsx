/**
 * ChatWindow Component
 * Expanded chat interface for full conversations
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, Minimize2, Send, Mic, MicOff, Paperclip, Search, Download } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { ChatMessage as ChatMessageType } from './ChatOverlay';
import styles from '../../styles/chat/ChatWindow.module.css';

interface ChatWindowProps {
  messages: ChatMessageType[];
  isTyping: boolean;
  companionId: string;
  career: string;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  onSendMessage: (message: string) => void;
  onMinimize: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isTyping,
  companionId,
  career,
  connectionStatus,
  onSendMessage,
  onMinimize
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [voiceMode, setVoiceMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filteredMessages, setFilteredMessages] = useState<ChatMessageType[]>([]);

  // Companion details
  const companions: Record<string, { name: string; avatar: string | { light: string; dark: string }; color: string }> = {
    pat: { name: 'Pat', avatar: '🧭', color: '#6B7280' },      // Onboarding guide (gray) - using emoji
    finn: {
      name: 'Finn',
      avatar: { light: '/images/companions/finn-light.png', dark: '/images/companions/finn-dark.png' },
      color: '#8B5CF6'
    },
    sage: {
      name: 'Sage',
      avatar: { light: '/images/companions/sage-light.png', dark: '/images/companions/sage-dark.png' },
      color: '#7C3AED'
    },
    spark: {
      name: 'Spark',
      avatar: { light: '/images/companions/spark-light.png', dark: '/images/companions/spark-dark.png' },
      color: '#F59E0B'
    },
    harmony: {
      name: 'Harmony',
      avatar: { light: '/images/companions/harmony-light.png', dark: '/images/companions/harmony-dark.png' },
      color: '#10B981'
    }
  };

  const currentCompanion = companions[companionId] || companions.pat;

  // Get theme preference
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Get avatar for current companion
  const getAvatar = () => {
    const avatar = currentCompanion.avatar;
    if (typeof avatar === 'string') return avatar; // Pat's emoji
    return isDarkMode ? avatar.dark : avatar.light;
  };

  const avatarSrc = getAvatar();
  const isEmoji = typeof avatarSrc === 'string' && avatarSrc.length <= 4;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter messages based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = messages.filter(msg =>
        msg.content.toLowerCase().includes(query)
      );
      setFilteredMessages(filtered);
    } else {
      setFilteredMessages(messages);
    }
  }, [searchQuery, messages]);

  // Export chat history
  const exportChatHistory = () => {
    const chatData = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      companion: msg.companionId
    }));

    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Connection status indicator
  const getConnectionStatus = () => {
    console.log('🔍 ChatWindow connectionStatus:', connectionStatus, 'type:', typeof connectionStatus);
    switch (connectionStatus) {
      case 'connected':
        return { text: 'Online', color: '#10B981' };
      case 'reconnecting':
        return { text: 'Reconnecting...', color: '#F59E0B' };
      case 'disconnected':
        return { text: 'Offline', color: '#EF4444' };
      default:
        console.log('⚠️ Unknown connection status:', connectionStatus);
        // Default to Online for demo mode
        return { text: 'Online', color: '#10B981' };
    }
  };

  const status = getConnectionStatus();

  return (
    <div className={styles.chatWindow}>
      {/* Header */}
      <div className={styles.header} style={{ backgroundColor: currentCompanion.color }}>
        <div className={styles.headerLeft}>
          {isEmoji ? (
            <span className={styles.companionAvatar}>{avatarSrc}</span>
          ) : (
            <img
              src={avatarSrc}
              alt={`${currentCompanion.name} avatar`}
              className={styles.companionAvatar}
              style={{ width: '40px', height: '40px', objectFit: 'contain' }}
              onError={(e) => {
                // Fallback to emoji if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.insertAdjacentHTML('beforeend',
                  `<span class="${styles.companionAvatar}">💬</span>`);
              }}
            />
          )}
          <div className={styles.companionInfo}>
            <h3>{currentCompanion.name}</h3>
            <p className={styles.careerContext}>
              {companionId === 'pat' ? 'Learning Guide' : `${career} Helper`} •
              <span className={styles.connectionStatus} style={{ color: status.color }}>
                {status.text}
              </span>
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            className={styles.actionButton}
            onClick={() => setShowSearch(!showSearch)}
            aria-label="Search messages"
            title="Search"
          >
            <Search size={20} />
          </button>
          <button
            className={styles.actionButton}
            onClick={exportChatHistory}
            aria-label="Export chat history"
            title="Export"
          >
            <Download size={20} />
          </button>
          <button
            className={styles.actionButton}
            onClick={onMinimize}
            aria-label="Minimize chat"
            title="Minimize"
          >
            <Minimize2 size={20} />
          </button>
          <button
            className={styles.actionButton}
            onClick={onMinimize}
            aria-label="Close chat"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className={styles.searchBar}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button
              className={styles.clearSearch}
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
          {searchQuery && (
            <span className={styles.searchResults}>
              {filteredMessages.length} result{filteredMessages.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div className={styles.messagesArea} ref={messagesContainerRef}>
        {/* Welcome message if no messages */}
        {messages.length === 0 && (
          <div className={styles.welcomeMessage}>
            {isEmoji ? (
              <span className={styles.welcomeAvatar}>{avatarSrc}</span>
            ) : (
              <img
                src={avatarSrc}
                alt={`${currentCompanion.name} avatar`}
                className={styles.welcomeAvatar}
                style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                onError={(e) => {
                  // Fallback to emoji if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.insertAdjacentHTML('beforeend',
                    `<span class="${styles.welcomeAvatar}">💬</span>`);
                }}
              />
            )}
            <h4>Hi! I'm {currentCompanion.name}</h4>
            <p>
              {companionId === 'pat'
                ? "I'm here to help you get started on your learning journey. What would you like to know?"
                : `I'm here to help you learn as a ${career}. What would you like to know?`}
            </p>
          </div>
        )}

        {/* Message list */}
        {filteredMessages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            companionAvatar={avatarSrc}
            companionName={currentCompanion.name}
            isEmoji={isEmoji}
          />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className={styles.typingContainer}>
            {isEmoji ? (
              <span className={styles.typingAvatar}>{avatarSrc}</span>
            ) : (
              <img
                src={avatarSrc}
                alt={`${currentCompanion.name} typing`}
                className={styles.typingAvatar}
                style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                onError={(e) => {
                  // Fallback to emoji if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.insertAdjacentHTML('beforeend',
                    `<span class="${styles.typingAvatar}">💬</span>`);
                }}
              />
            )}
            <div className={styles.typingBubble}>
              <span className={styles.typingDot}></span>
              <span className={styles.typingDot}></span>
              <span className={styles.typingDot}></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput
        onSendMessage={onSendMessage}
        voiceMode={voiceMode}
        onToggleVoice={() => setVoiceMode(!voiceMode)}
        disabled={connectionStatus === 'disconnected'}
        placeholder={
          connectionStatus === 'disconnected'
            ? 'Waiting for connection...'
            : `Message ${currentCompanion.name}...`
        }
      />
    </div>
  );
};

export default ChatWindow;