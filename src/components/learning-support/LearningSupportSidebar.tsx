/**
 * Learning Support Sidebar
 * Provides AI companion chat and XP-based hint system for learning containers
 */

import React, { useState, useEffect, useRef } from 'react';
import { companionVoiceoverService } from '../../services/companionVoiceoverService';
import { pathIQGamification } from '../../services/pathIQGamificationService';
import './LearningSupportSidebar.css';

interface LearningSupportSidebarProps {
  companionName: string;
  companionAvatar?: string;
  userId: string;
  currentQuestion?: string;
  currentSkill?: string;
  questionNumber?: number;
  totalQuestions?: number;
  onRequestHint?: (hintLevel: 'free' | 'basic' | 'detailed') => void;
  position?: 'left' | 'right';
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'companion' | 'student';
  message: string;
  timestamp: Date;
}

export const LearningSupportSidebar = React.forwardRef<any, LearningSupportSidebarProps>(({
  companionName = 'Finn',
  companionAvatar = '🤖',
  userId,
  currentQuestion,
  currentSkill,
  questionNumber = 1,
  totalQuestions = 5,
  onRequestHint,
  position = 'right',
  isCollapsed = false,
  onToggleCollapse
}, ref) => {
  const [userXP, setUserXP] = useState(0);
  const [freeHintsRemaining, setFreeHintsRemaining] = useState(2);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Expose methods to parent component
  React.useImperativeHandle(ref, () => ({
    addCompanionMessage
  }));

  // Get user's current XP
  useEffect(() => {
    const userProfile = pathIQGamification.getUserProfile(userId);
    setUserXP(userProfile.xp);
  }, [userId]);

  // Reset free hints for each new question
  useEffect(() => {
    setFreeHintsRemaining(2);
  }, [questionNumber]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Get companion avatar emoji
  const getCompanionEmoji = () => {
    const companions: Record<string, string> = {
      'Finn': '🤖',
      'Sage': '🦉',
      'Spark': '⚡',
      'Harmony': '🌟',
      // Legacy names
      'Luna': '🦄',
      'Max': '🦁',
      'Zara': '🐉',
      'Byte': '💻',
      'Nova': '🌟'
    };
    return companions[companionName] || companionAvatar;
  };

  // Handle hint request
  const handleHintRequest = (level: 'free' | 'basic' | 'detailed') => {
    const xpCost = level === 'free' ? 0 : level === 'basic' ? 5 : 25;
    
    // Check if user has enough XP
    if (xpCost > 0 && userXP < xpCost) {
      addCompanionMessage(`You need ${xpCost} XP for this hint, but you only have ${userXP} XP. Try the free hint or keep earning XP!`);
      return;
    }

    // Check free hints
    if (level === 'free' && freeHintsRemaining <= 0) {
      addCompanionMessage("You've used all your free hints for this question. You can use XP for more detailed hints!");
      return;
    }

    // Deduct XP and update hints
    if (level === 'free') {
      setFreeHintsRemaining(prev => prev - 1);
    } else {
      setUserXP(prev => prev - xpCost);
      // Update XP in gamification service
      pathIQGamification.addXP(userId, -xpCost);
    }

    // Request hint from parent
    if (onRequestHint) {
      onRequestHint(level);
    }

    // Add confirmation message
    const hintMessages = {
      'free': "Here's a free hint to get you started! 💡",
      'basic': `Great choice! I've spent ${xpCost} XP for a helpful hint. 🎯`,
      'detailed': `Let me show you the full solution step-by-step! This cost ${xpCost} XP. 📚`
    };
    addCompanionMessage(hintMessages[level]);
  };

  // Add companion message
  const addCompanionMessage = (message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'companion',
      message,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, newMessage]);
    
    // Play companion voice if enabled
    companionVoiceoverService.playVoiceover('hint-given', { companion: companionName });
  };

  // Handle chat submission
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add student message
    const studentMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'student',
      message: chatInput,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, studentMessage]);
    setChatInput('');
    setIsTyping(true);

    // Simulate companion response
    setTimeout(() => {
      const responses = [
        `Great question! Let me help you with that...`,
        `I understand! Here's another way to think about it...`,
        `You're on the right track! Consider this...`,
        `That's a smart observation! Let's explore it together...`,
        `Good thinking! Here's what I suggest...`
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      addCompanionMessage(response);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  // Progress indicators
  const progressPercentage = (questionNumber / totalQuestions) * 100;

  if (isCollapsed) {
    return (
      <div className={`learning-support-sidebar collapsed ${position}`}>
        <button className="expand-btn" onClick={onToggleCollapse}>
          <span className="companion-icon">{getCompanionEmoji()}</span>
          <span className="xp-badge">⭐ {userXP}</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`learning-support-sidebar ${position}`}>
      <button className="collapse-btn" onClick={onToggleCollapse}>
        {position === 'right' ? '→' : '←'}
      </button>

      {/* Companion Header */}
      <div className="companion-header">
        <div className="companion-avatar">
          <span className="avatar-emoji">{getCompanionEmoji()}</span>
        </div>
        <div className="companion-info">
          <h3>{companionName} is here to help!</h3>
          <div className="xp-display">
            <span className="xp-icon">⭐</span>
            <span className="xp-amount">{userXP} XP</span>
          </div>
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="progress-section">
        <div className="progress-header">
          <span className="progress-label">Question {questionNumber} of {totalQuestions}</span>
          <span className="progress-skill">{currentSkill}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercentage}%` }}>
            <div className="progress-glow"></div>
          </div>
        </div>
        <div className="progress-dots">
          {Array.from({ length: totalQuestions }, (_, i) => (
            <span 
              key={i} 
              className={`dot ${i < questionNumber ? 'completed' : i === questionNumber - 1 ? 'current' : ''}`}
            >
              {i < questionNumber - 1 ? '✓' : ''}
            </span>
          ))}
        </div>
      </div>

      {/* Hint System */}
      <div className="hint-section">
        <h4>💡 Need a Hint?</h4>
        
        <button 
          className="hint-btn free"
          onClick={() => handleHintRequest('free')}
          disabled={freeHintsRemaining === 0}
        >
          <span className="hint-icon">💭</span>
          <div className="hint-content">
            <span className="hint-title">Free Hint</span>
            <span className="hint-info">{freeHintsRemaining} remaining</span>
          </div>
        </button>

        <button 
          className="hint-btn basic"
          onClick={() => handleHintRequest('basic')}
          disabled={userXP < 5}
        >
          <span className="hint-icon">💡</span>
          <div className="hint-content">
            <span className="hint-title">Better Hint</span>
            <span className="hint-cost">-5 XP</span>
          </div>
        </button>

        <button 
          className="hint-btn detailed"
          onClick={() => handleHintRequest('detailed')}
          disabled={userXP < 25}
        >
          <span className="hint-icon">📖</span>
          <div className="hint-content">
            <span className="hint-title">Show Solution</span>
            <span className="hint-cost">-25 XP</span>
          </div>
        </button>
      </div>

      {/* Chat Section */}
      <div className="chat-section">
        <h4>💬 Chat with {companionName}</h4>
        
        <div className="chat-messages">
          {chatMessages.length === 0 && (
            <div className="chat-welcome">
              <p>Hi! I'm {companionName}! 👋</p>
              <p>Ask me anything about this question or just chat if you need encouragement!</p>
            </div>
          )}
          
          {chatMessages.map(msg => (
            <div key={msg.id} className={`chat-message ${msg.sender}`}>
              {msg.sender === 'companion' && (
                <span className="message-avatar">{getCompanionEmoji()}</span>
              )}
              <div className="message-bubble">
                <p>{msg.message}</p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="chat-message companion typing">
              <span className="message-avatar">{getCompanionEmoji()}</span>
              <div className="message-bubble">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleChatSubmit} className="chat-input-form">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={`Ask ${companionName} anything...`}
            className="chat-input"
          />
          <button type="submit" className="chat-send-btn">
            Send
          </button>
        </form>
      </div>
    </div>
  );
});

export default LearningSupportSidebar;