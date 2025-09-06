/**
 * AI Companion Chat Modal
 * Full-screen chat interface with the selected AI companion
 */

import React, { useState, useRef, useEffect } from 'react';
import { chatbotService } from '../../../services/chatbotService';
import { getCompanionImageUrl } from '../../../services/aiCompanionImages';

interface CompanionChatModalProps {
  companion: string;
  companionData?: any;
  theme: 'light' | 'dark';
  onClose: () => void;
  userId?: string;
  userName?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const CompanionChatModal: React.FC<CompanionChatModalProps> = ({
  companion,
  companionData,
  theme,
  onClose,
  userId,
  userName
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi ${userName || 'there'}! I'm ${companionData?.name || companion}. ${companionData?.quote || "I'm here to help you learn and explore. What would you like to talk about today?"}`,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const colors = {
    light: {
      background: '#FFFFFF',
      text: '#1A202C',
      subtext: '#718096',
      border: '#E2E8F0',
      inputBg: '#F7FAFC',
      userBubble: '#8B5CF6',
      assistantBubble: '#EDF2F7'
    },
    dark: {
      background: '#1A202C',
      text: '#F7FAFC',
      subtext: '#94A3B8',
      border: '#334155',
      inputBg: '#2D3748',
      userBubble: '#8B5CF6',
      assistantBubble: '#334155'
    }
  }[theme];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get companion-specific context
      const companionContext = `You are ${companionData?.name || companion}, an AI learning companion with these traits:
        - Personality: ${companionData?.personality || 'Friendly and helpful'}
        - Teaching Style: ${companionData?.teachingStyle || 'Patient and supportive'}
        - Voice Style: ${companionData?.voiceStyle || 'Warm and encouraging'}
        Keep responses concise, friendly, and age-appropriate.`;

      const response = await chatbotService.sendMessage(
        inputValue,
        companionContext
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Let's try again in a moment!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998
        }}
        onClick={onClose}
      />
      
      {/* Chat Modal */}
      <div 
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90vw',
          maxWidth: '800px',
          height: '80vh',
          maxHeight: '600px',
          backgroundColor: colors.background,
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: `2px solid ${companionData?.color || '#8B5CF6'}`
            }}>
              <img 
                src={getCompanionImageUrl(companion, 'default')} 
                alt={companionData?.name || companion}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <h3 style={{ color: colors.text, margin: 0 }}>
                Chat with {companionData?.name || companion}
              </h3>
              <p style={{ color: colors.subtext, margin: 0, fontSize: '0.875rem' }}>
                {companionData?.personality || 'Your AI Learning Companion'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.subtext,
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '0.375rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.inputBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ✕
          </button>
        </div>

        {/* Messages Area */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                maxWidth: '70%',
                padding: '0.75rem 1rem',
                borderRadius: '1rem',
                backgroundColor: message.role === 'user' ? colors.userBubble : colors.assistantBubble,
                color: message.role === 'user' ? 'white' : colors.text
              }}>
                <p style={{ margin: 0, lineHeight: 1.5 }}>
                  {message.content}
                </p>
                <p style={{
                  margin: '0.25rem 0 0',
                  fontSize: '0.75rem',
                  opacity: 0.7
                }}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start'
            }}>
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '1rem',
                backgroundColor: colors.assistantBubble,
                color: colors.text
              }}>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <span style={{ animation: 'bounce 1.4s infinite ease-in-out' }}>•</span>
                  <span style={{ animation: 'bounce 1.4s infinite ease-in-out 0.2s' }}>•</span>
                  <span style={{ animation: 'bounce 1.4s infinite ease-in-out 0.4s' }}>•</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: `1px solid ${colors.border}`,
          display: 'flex',
          gap: '1rem'
        }}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              backgroundColor: colors.inputBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.5rem',
              color: colors.text,
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: companionData?.color || '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 600,
              cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed',
              opacity: inputValue.trim() && !isLoading ? 1 : 0.5,
              transition: 'all 0.2s'
            }}
          >
            Send
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </>
  );
};