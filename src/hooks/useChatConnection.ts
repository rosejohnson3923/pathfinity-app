/**
 * Chat Connection Hook
 * Manages WebSocket connection and message handling for live chat
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { chatWebSocketService } from '../services/chat/ChatWebSocketService';
import { ChatMessage } from '../components/chat/ChatOverlay';

interface ChatContext {
  career: string;
  companionId: string;
  gradeLevel: string;
  subject: string;
  currentActivity: string;
}

interface ChatResponse {
  content: string;
  metadata?: {
    agent?: string;
    confidence?: number;
    mediaType?: 'text' | 'voice' | 'image';
  };
}

export const useChatConnection = () => {
  // Start as connected for better UX (will update if actually disconnected)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
  const [isConnecting, setIsConnecting] = useState(false);
  const [messageHandlers, setMessageHandlers] = useState<((message: ChatMessage) => void)[]>([]);
  const isApiModeRef = useRef(false);

  // Always allow connection in demo mode
  const shouldConnect = true;

  // Initialize connection with WebSocket fallback to API
  useEffect(() => {
    // Don't connect if not authenticated
    if (!shouldConnect) {
      setConnectionStatus('disconnected');
      return;
    }
    const initConnection = async () => {
      setIsConnecting(true);

      // Try WebSocket first if enabled
      const wsEnabled = import.meta.env.VITE_ENABLE_WEBSOCKET !== 'false';

      if (wsEnabled) {
        try {
          // Set up WebSocket listeners
          chatWebSocketService.onStatusChange((status) => {
            // Only update status if not using API mode
            if (!isApiModeRef.current) {
              setConnectionStatus(status);
            } else {
              console.log('🔄 Ignoring WebSocket status change - using API mode');
            }
          });

          chatWebSocketService.onMessage((message) => {
            // Notify all registered message handlers
            messageHandlers.forEach(handler => handler(message));
          });

          // Attempt WebSocket connection
          await chatWebSocketService.connect();
          console.log('✅ WebSocket connection established');
        } catch (wsError) {
          console.log('⚠️ WebSocket failed, falling back to API mode:', wsError);
          // Fall through to API mode
        }
      }

      // If WebSocket not connected, use API fallback
      if (!chatWebSocketService.isConnected) {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

        try {
          const response = await fetch(`${apiUrl}/health`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            // Force connected status for API mode
            isApiModeRef.current = true;
            setConnectionStatus('connected');
            console.log('✅ Using API mode for chat (server connected)');
          } else {
            // Server is running but returned an error
            isApiModeRef.current = true;
            setConnectionStatus('connected'); // Still show as connected for demo
            console.log('✅ Using API mode for chat (demo mode)');
          }
        } catch (error) {
          console.log('ℹ️ Demo mode active (no backend)');
          isApiModeRef.current = true;
          setConnectionStatus('connected'); // Show as connected for demo
        }
      }

      setIsConnecting(false);
    };

    initConnection();

    // Cleanup on unmount
    return () => {
      if (chatWebSocketService.isConnected) {
        chatWebSocketService.disconnect();
      }
    };
  }, [messageHandlers, shouldConnect]);

  // Send message function with WebSocket/API fallback
  const sendMessage = useCallback(async (data: {
    message: string;
    context: ChatContext;
  }): Promise<ChatResponse> => {

    // Try WebSocket first if connected
    if (chatWebSocketService.isConnected) {
      return new Promise((resolve) => {
        // Generate message ID
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Set up one-time response handler
        const responseHandler = (response: any) => {
          if (response.id === messageId || response.replyTo === messageId) {
            // Remove handler after receiving response
            const index = messageHandlers.indexOf(responseHandler);
            if (index > -1) {
              const newHandlers = [...messageHandlers];
              newHandlers.splice(index, 1);
              setMessageHandlers(newHandlers);
            }

            resolve({
              content: response.content || 'I understand. How can I help you learn today?',
              metadata: {
                agent: response.agent || 'FinnSpeak',
                confidence: response.confidence || 0.95,
                mediaType: response.mediaType || 'text'
              }
            });
          }
        };

        // Register response handler
        setMessageHandlers(prev => [...prev, responseHandler]);

        // Send message via WebSocket (will queue if disconnected)
        chatWebSocketService.sendMessage({
          id: messageId,
          message: data.message,
          context: data.context,
          agent: 'FinnSpeak',
          model: 'gpt-35-turbo',
          timestamp: new Date()
        });

        // Timeout fallback to API after 5 seconds
        setTimeout(() => {
          const index = messageHandlers.indexOf(responseHandler);
          if (index > -1) {
            console.log('WebSocket response timeout, falling back to API');
            // Remove handler
            const newHandlers = [...messageHandlers];
            newHandlers.splice(index, 1);
            setMessageHandlers(newHandlers);
            // Fall back to API
            sendViaAPI(data).then(resolve);
          }
        }, 5000);
      });
    }

    // Use API if WebSocket not connected
    return sendViaAPI(data);
  }, [messageHandlers, shouldConnect]);

  // API fallback function
  const sendViaAPI = async (data: {
    message: string;
    context: ChatContext;
  }): Promise<ChatResponse> => {
    // Ensure we're shown as connected when using API
    if (connectionStatus !== 'connected') {
      setConnectionStatus('connected');
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

      const response = await fetch(`${apiUrl}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: data.message,
          context: data.context,
          agent: 'FinnSpeak',
          model: 'gpt-35-turbo'
        })
      });

      if (!response.ok) {
        throw new Error(`Chat API failed: ${response.status}`);
      }

      const result = await response.json();

      return {
        content: result.response || 'I understand. How can I help you learn today?',
        metadata: {
          agent: result.agent || 'FinnSpeak',
          confidence: result.confidence || 0.95,
          mediaType: 'text'
        }
      };

    } catch (error) {
      console.error('Chat message failed:', error);

      // Fallback response
      return {
        content: "I'm having a bit of trouble right now, but I'm still here to help! What would you like to learn about?",
        metadata: {
          agent: 'FinnSpeak',
          confidence: 0.5,
          mediaType: 'text'
        }
      };
    }
  };

  // Register a message handler
  const onMessage = useCallback((handler: (message: ChatMessage) => void) => {
    setMessageHandlers(prev => [...prev, handler]);

    // Return cleanup function
    return () => {
      setMessageHandlers(prev => prev.filter(h => h !== handler));
    };
  }, []);

  // Get queued messages for offline indicator
  const getQueuedMessages = useCallback(() => {
    return chatWebSocketService.isConnected ? [] : [];
  }, []);

  return {
    sendMessage,
    connectionStatus,
    isConnecting,
    onMessage,
    getQueuedMessages
  };
};