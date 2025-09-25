/**
 * ChatOverlay Component
 * Global persistent chat interface for AI companion conversations
 * Implements the Finn agentic network for intelligent responses
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { useLocation } from 'react-router-dom';
import ChatBubble from './ChatBubble';
import ChatWindow from './ChatWindow';
import { useChatConnection } from '../../hooks/useChatConnection';
import { useAuth } from '../../hooks/useAuth';
import { useStudentProfile } from '../../hooks/useStudentProfile';
import { azureAudioService } from '../../services/azureAudioService';
import styles from '../../styles/chat/ChatOverlay.module.css';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  companionId?: string;
  metadata?: {
    agent?: string;
    confidence?: number;
    mediaType?: 'text' | 'voice' | 'image';
  };
}

interface ChatOverlayProps {
  enabled?: boolean;
}

export const ChatOverlay: React.FC<ChatOverlayProps> = ({ enabled = true }) => {
  // Debug logging
  console.log('🔍 ChatOverlay rendering', { enabled });

  // Context and hooks - check auth first
  const { user } = useAuth();
  const location = useLocation();
  // More strict authentication check - user must have an ID and email
  const isAuthenticated = !!(user && user.id && user.email);

  // Check current route to determine if we should show chat
  // Show on dashboard and other app pages when authenticated
  const currentPath = location.pathname;
  const isOnDashboard = currentPath.includes('/dashboard') ||
                       currentPath.includes('/app/dashboard');
  const isOnRestrictedPage = currentPath === '/' ||
                             currentPath === '/login' ||
                             currentPath === '/signup' ||
                             currentPath === '/onboarding' ||
                             currentPath === '/app/login' ||
                             currentPath === '/app' ||
                             currentPath.includes('/app/onboarding') ||
                             (!isOnDashboard && currentPath.includes('login'));

  console.log('🔍 ChatOverlay auth state:', {
    isAuthenticated,
    currentPath,
    isOnDashboard,
    isOnRestrictedPage,
    user: user?.email,
    hasId: !!user?.id,
    hasEmail: !!user?.email,
    enabled,
    willRender: enabled && isAuthenticated && !isOnRestrictedPage
  });

  // State management
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Position in bottom-right corner by default, but with safe margin
  const [position, setPosition] = useState({
    x: typeof window !== 'undefined' ? Math.min(window.innerWidth - 120, window.innerWidth - 120) : 20,
    y: typeof window !== 'undefined' ? window.innerHeight - 120 : 20
  });
  const [isDragging, setIsDragging] = useState(false);

  // Always call hooks (React rules) but they handle auth internally
  const { profile } = useStudentProfile();
  const { sendMessage, connectionStatus } = useChatConnection();
  console.log('🔍 ChatOverlay connectionStatus from hook:', connectionStatus);

  // Get companion from session - user-specific keys only
  const userCompanionKey = user?.id ? `selectedCompanion_${user.id}` : 'selectedCompanion';
  // Only use user-specific companion, don't fall back to generic key that could be from another user
  const selectedCompanion = sessionStorage.getItem(userCompanionKey);
  const companionId = selectedCompanion || 'pat'; // Pat is the default onboarding companion

  const userCareerKey = user?.id ? `selectedCareer_${user.id}` : 'selectedCareer';
  const career = sessionStorage.getItem(userCareerKey) || 'Explorer';

  console.log('🎭 ChatOverlay companion selection:', {
    selectedCompanion,
    companionId,
    userCompanionKey,
    userId: user?.id,
    fromStorage: sessionStorage.getItem(userCompanionKey),
    fromAiStorage: sessionStorage.getItem('selectedAiCompanion')
  });

  // Load message history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem(`chat-history-${user?.id}`);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.slice(-50)); // Keep last 50 messages
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    }
  }, [user?.id]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0 && user?.id) {
      localStorage.setItem(
        `chat-history-${user?.id}`,
        JSON.stringify(messages.slice(-50))
      );
    }
  }, [messages, user?.id]);

  // Handle new message from user
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      companionId
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Send to backend via WebSocket or API
      const response = await sendMessage({
        message: content,
        context: {
          career,
          companionId,
          gradeLevel: profile?.grade_level || 'K',
          subject: sessionStorage.getItem('currentSubject') || 'general',
          currentActivity: sessionStorage.getItem('currentActivity') || 'chat'
        }
      });

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        companionId,
        metadata: response.metadata
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update unread count if window is minimized
      if (!isExpanded) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-error`,
        role: 'system',
        content: 'Sorry, I had trouble sending that message. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [companionId, career, profile, sendMessage, isExpanded]);

  // Handle window expansion
  const handleExpand = useCallback(() => {
    setIsExpanded(true);
    setUnreadCount(0);
  }, []);

  // Handle window minimize
  const handleMinimize = useCallback(() => {
    setIsExpanded(false);
  }, []);

  // Handle bubble drag
  const handleDrag = useCallback((newX: number, newY: number) => {
    setPosition({ x: newX, y: newY });
  }, []);

  // Monitor Azure Audio Service speaking state
  useEffect(() => {
    const checkSpeakingState = () => {
      setIsSpeaking(azureAudioService.speaking);
    };

    // Check immediately and then periodically
    checkSpeakingState();
    const interval = setInterval(checkSpeakingState, 100);

    return () => clearInterval(interval);
  }, []);

  // Don't render if disabled, not authenticated, or on restricted pages
  if (!enabled || !isAuthenticated || isOnRestrictedPage) {
    console.log('🔍 ChatOverlay not rendering:', {
      enabled,
      isAuthenticated,
      isOnRestrictedPage,
      currentPath,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email
    });
    return null;
  }

  console.log('✅ ChatOverlay rendering portal with:', { isExpanded, companionId, position });

  // Create portal for overlay
  return ReactDOM.createPortal(
    <div className={styles.chatOverlay}>
      {isExpanded ? (
        <ChatWindow
          messages={messages}
          isTyping={isTyping}
          companionId={companionId}
          career={career}
          connectionStatus={connectionStatus}
          onSendMessage={handleSendMessage}
          onMinimize={handleMinimize}
        />
      ) : (
        <ChatBubble
          unreadCount={unreadCount}
          companionId={companionId}
          position={position}
          isDragging={isDragging}
          isSpeaking={isSpeaking}
          onClick={handleExpand}
          onDrag={handleDrag}
        />
      )}
    </div>,
    document.body
  );
};

export default ChatOverlay;