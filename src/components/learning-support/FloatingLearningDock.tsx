/**
 * Floating Learning Dock
 * Revolutionary floating icon system with modal popups for learning support
 */

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { companionVoiceoverService } from '../../services/companionVoiceoverService';
import { pathIQGamification } from '../../services/pathIQGamificationService';
import { getCompanionImage } from '../../services/aiCompanionImages';
import styles from '../../styles/shared/components/FloatingLearningDock.module.css';

interface FloatingLearningDockProps {
  companionName: string;
  companionId?: string;
  userId: string;
  currentQuestion?: string;
  currentSkill?: string;
  skillCategory?: string; // e.g., "Math.A.0", "ELA.A.0"
  skillProgress?: number; // Progress within the skill category (0-100)
  questionNumber?: number;
  totalQuestions?: number;
  onRequestHint?: (hintLevel: 'free' | 'basic' | 'detailed') => void;
  position?: 'left' | 'right';
  theme?: 'light' | 'dark';
  companionFeedback?: { text: string; emotion?: string } | null;
}

interface ChatMessage {
  id: string;
  sender: 'companion' | 'student';
  message: string;
  timestamp: Date;
}

type ActiveModal = 'points' | 'progress' | 'hint' | 'chat' | null;

export const FloatingLearningDock: React.FC<FloatingLearningDockProps> = ({
  companionName = 'Finn',
  companionId,
  userId,
  currentQuestion,
  currentSkill,
  skillCategory,
  skillProgress,
  questionNumber = 1,
  totalQuestions = 5,
  onRequestHint,
  position = 'right',
  theme = 'light',
  companionFeedback
}) => {
  // Ensure companionId is set - derive from name if not provided
  const actualCompanionId = companionId || companionName.toLowerCase();
  
  // Debug: Log what companion is being used
  console.log('🎯 FloatingLearningDock initialized with:', {
    companionName,
    providedCompanionId: companionId,
    actualCompanionId,
    expectedImage: `/images/companions/${actualCompanionId}-${theme}.png`
  });
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [userXP, setUserXP] = useState(0);
  const [freeHintsRemaining, setFreeHintsRemaining] = useState(2);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [showFeedbackToast, setShowFeedbackToast] = useState(false);
  const [feedbackToastMessage, setFeedbackToastMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  // Show companion feedback when received
  useEffect(() => {
    console.log('🎯 FloatingLearningDock received companionFeedback:', companionFeedback);
    if (companionFeedback && companionFeedback.text) {
      // Add the feedback as a chat message
      const feedbackMessage: ChatMessage = {
        id: `feedback-${Date.now()}`,
        sender: 'companion',
        message: companionFeedback.text,
        timestamp: new Date()
      };
      
      setChatMessages(prev => {
        // Check if this message already exists to avoid duplicates
        const lastMessage = prev[prev.length - 1];
        if (lastMessage && lastMessage.message === companionFeedback.text) {
          return prev;
        }
        return [...prev, feedbackMessage];
      });
      
      // Show toast notification with companion feedback
      console.log('🎯 Showing feedback toast:', companionFeedback.text);
      console.log('🎯 Toast will be positioned at top: 100px, centered horizontally');
      setFeedbackToastMessage(companionFeedback.text);
      setShowFeedbackToast(true);
      console.log('🎯 Toast state set - showFeedbackToast:', true, 'message:', companionFeedback.text);
      
      // Auto-hide toast after 4 seconds
      setTimeout(() => {
        setShowFeedbackToast(false);
      }, 4000);
      
      // Show notification but don't auto-open chat (let user choose)
      if (activeModal !== 'chat') {
        setHasNewMessage(true);
        // Flash the chat icon to draw attention
        const chatIcon = document.querySelector('.dock-icon.chat');
        if (chatIcon) {
          chatIcon.classList.add('pulse-animation');
          setTimeout(() => {
            chatIcon.classList.remove('pulse-animation');
          }, 2000);
        }
      }
      
      // Play companion voice if enabled
      companionVoiceoverService.playVoiceover(
        companionFeedback.emotion === 'excited' ? 'correct-answer' : 
        companionFeedback.emotion === 'encouraging' ? 'incorrect-answer' : 
        'hint-given', 
        { companion: companionName }
      );
    }
  }, [companionFeedback, companionName, activeModal]);

  // Get companion image
  const getCompanionAvatar = () => {
    // getCompanionImage returns a string URL directly
    const imageUrl = getCompanionImage(actualCompanionId, 'default', theme);
    console.log('🖼️ Getting avatar for:', actualCompanionId, '→', imageUrl);
    return imageUrl;
  };
  
  // Get companion emoji fallback (only for emergency use)
  const getCompanionEmojiFallback = () => {
    // Fallback emojis for each companion
    const fallbackEmojis: Record<string, string> = {
      finn: '🎯',
      spark: '⚡',
      harmony: '🎵',
      sage: '🦉'
    };
    return fallbackEmojis[actualCompanionId.toLowerCase()] || '🤖';
  };

  // Handle dock icon click
  const handleDockClick = (modal: ActiveModal) => {
    if (activeModal === modal) {
      setActiveModal(null);
    } else {
      setActiveModal(modal);
      if (modal === 'chat') {
        setHasNewMessage(false);
      }
    }
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
    
    // Close hint modal after requesting
    setTimeout(() => setActiveModal(null), 1500);
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
    
    // Show notification if chat is closed
    if (activeModal !== 'chat') {
      setHasNewMessage(true);
    }
    
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

  // Progress indicators - use skill progress if available, otherwise question progress
  const progressPercentage = skillProgress !== undefined 
    ? skillProgress 
    : (totalQuestions > 0 ? (questionNumber / totalQuestions) * 100 : 0);

  // Ensure dock is rendered at root level
  return ReactDOM.createPortal(
    <div data-theme={theme}>
      {/* Companion Feedback Toast */}
      {showFeedbackToast && (
        (() => {
          console.log('🎯 RENDERING TOAST TO DOM - showFeedbackToast:', showFeedbackToast, 'message:', feedbackToastMessage);
          return null;
        })(),
        <div className={styles.feedbackToast}>
          <div className={styles.feedbackToastContent}>
            <div className={styles.companionIcon}>
              <img 
                src={getCompanionAvatar()} 
                alt={companionName}
                className={styles.companionImage}
              />
            </div>
            <div className={styles.feedbackTextContainer}>
              <div className={styles.feedbackCompanionName}>
                {companionName} says:
              </div>
              <div className={styles.feedbackText}>
                {feedbackToastMessage}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Floating Dock */}
      <div className={`${styles.floatingDock} ${position === 'right' ? styles.floatingDockRight : styles.floatingDockLeft}`}>
        {/* Points Icon */}
        <button
          className={styles.dockIcon}
          onClick={() => handleDockClick('points')}
          data-tooltip="XP Points"
        >
          <span className="icon-main">⭐</span>
          <span className="icon-badge">{userXP}</span>
        </button>

        {/* Progress Icon */}
        <button
          className={styles.dockIcon}
          onClick={() => handleDockClick('progress')}
          data-tooltip="Progress"
        >
          <span className="icon-main">📊</span>
          <span className="icon-badge">{Math.round(progressPercentage)}%</span>
        </button>

        {/* Hint Icon */}
        <button
          className={styles.dockIcon}
          onClick={() => handleDockClick('hint')}
          data-tooltip="Get Hint"
        >
          <span className="icon-main">💡</span>
          <span className="icon-badge">{freeHintsRemaining}</span>
        </button>

        {/* Chat Icon */}
        <button
          className={styles.dockIcon}
          onClick={() => handleDockClick('chat')}
          data-tooltip={`Chat with ${companionName}`}
        >
          <span className="icon-main">
            <img 
              src={getCompanionAvatar()} 
              alt={companionName} 
              className={styles.companionIcon}
            />
          </span>
          {hasNewMessage && <span className={styles.notificationBadge}></span>}
        </button>
      </div>

      {/* Modal Overlays */}
      {activeModal && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div 
            className={`${styles.modalPopup} ${position === 'right' ? styles.modalPopupRight : styles.modalPopupLeft}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {activeModal === 'points' && '⭐ Your XP Points'}
                {activeModal === 'progress' && '📊 Your Progress'}
                {activeModal === 'hint' && '💡 Get a Hint'}
                {activeModal === 'chat' && `💬 Chat with ${companionName}`}
              </h3>
              <button 
                className={styles.closeButton} 
                onClick={() => setActiveModal(null)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            {/* Points Modal */}
            {activeModal === 'points' && (
              <div className={styles.pointsContent}>
                <div className={styles.xpDisplay}>{userXP}</div>
                <div className={styles.levelInfo}>
                  <p>Experience Points</p>
                  <p>Earn XP by:</p>
                  <ul>
                    <li>✅ Answering questions correctly</li>
                    <li>🏃 Completing activities quickly</li>
                    <li>🎯 Achieving perfect scores</li>
                    <li>🔥 Building streaks</li>
                  </ul>
                  <p>💡 Use XP to unlock detailed hints!</p>
                </div>
              </div>
            )}

            {/* Progress Modal */}
            {activeModal === 'progress' && (
              <div className={styles.progressContent}>
                <div className={styles.progressStats}>
                  <div className={styles.progressStat}>
                    <span className={styles.progressStatLabel}>Current Skill:</span>
                    <span className={styles.progressStatValue}>
                      {skillCategory ? `${skillCategory} - ${currentSkill}` : currentSkill}
                    </span>
                  </div>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ '--progress': `${progressPercentage}%` } as React.CSSProperties}
                  >
                    <span className={styles.progressText}>
                      {skillCategory 
                        ? `${Math.round(progressPercentage)}% Complete`
                        : totalQuestions > 0 
                          ? `${questionNumber} of ${totalQuestions}`
                          : 'Getting Started...'}
                    </span>
                  </div>
                </div>
                <div className="progress-dots-large">
                  {Array.from({ length: totalQuestions }, (_, i) => (
                    <div 
                      key={i} 
                      className={`dot-large ${
                        i < questionNumber ? 'completed' : 
                        i === questionNumber - 1 ? 'current' : ''
                      }`}
                    >
                      {i < questionNumber - 1 ? '✓' : i + 1}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hint Modal */}
            {activeModal === 'hint' && (
              <div className={styles.hintContent}>
                <button 
                  className={`${styles.hintOption} ${freeHintsRemaining === 0 ? styles.disabled : ''}`}
                  onClick={() => handleHintRequest('free')}
                  disabled={freeHintsRemaining === 0}
                >
                  <span className={styles.hintTitle}>💭 Free Hint</span>
                  <span className={styles.hintDescription}>
                    {freeHintsRemaining > 0 
                      ? `${freeHintsRemaining} remaining` 
                      : 'No free hints left'}
                  </span>
                  <span className={styles.hintCost}>FREE</span>
                </button>

                <button 
                  className={`${styles.hintOption} ${userXP < 5 ? styles.disabled : ''}`}
                  onClick={() => handleHintRequest('basic')}
                  disabled={userXP < 5}
                >
                  <span className={styles.hintTitle}>💡 Better Hint</span>
                  <span className={styles.hintDescription}>More helpful guidance</span>
                  <span className={styles.hintCost}>-5 XP</span>
                </button>

                <button 
                  className={`${styles.hintOption} ${userXP < 25 ? styles.disabled : ''}`}
                  onClick={() => handleHintRequest('detailed')}
                  disabled={userXP < 25}
                >
                  <span className={styles.hintTitle}>📖 Full Solution</span>
                  <span className={styles.hintDescription}>Step-by-step answer</span>
                  <span className={styles.hintCost}>-25 XP</span>
                </button>
              </div>
            )}

            {/* Chat Modal */}
            {activeModal === 'chat' && (
              <div className={styles.chatModal}>
                <div className={styles.chatHeader}>
                  <span className={styles.companionAvatar}>
                    <img 
                      src={getCompanionAvatar()} 
                      alt={companionName} 
                      className={styles.companionHeaderImage}
                      onError={(e) => {
                        // Fallback to emoji if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const emoji = document.createElement('span');
                        emoji.textContent = getCompanionEmojiFallback();
                        emoji.className = styles.companionEmojiFallback;
                        target.parentElement?.appendChild(emoji);
                      }}
                    />
                  </span>
                  <h3>Chat with {companionName}</h3>
                </div>
                
                <div className={styles.chatMessages}>
                  {chatMessages.length === 0 && (
                    <div className={styles.chatWelcome}>
                      <p>Hi! I'm {companionName}! 👋</p>
                      <p>Ask me anything about this question or just chat if you need encouragement!</p>
                    </div>
                  )}
                  
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={`${styles.chatMessage} ${styles[msg.sender]}`}>
                      {msg.sender === 'companion' && (
                        <span className={styles.messageAvatar}>
                          <img 
                            src={getCompanionAvatar()} 
                            alt={companionName} 
                            className={styles.companionMessageImage}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const emoji = document.createElement('span');
                              emoji.textContent = getCompanionEmojiFallback();
                              emoji.className = styles.companionEmojiFallback;
                              target.parentElement?.appendChild(emoji);
                            }}
                          />
                        </span>
                      )}
                      <div className={`${styles.chatBubble} ${msg.sender === 'companion' ? styles.chatBubbleCompanion : styles.chatBubbleStudent}`}>
                        <p>{msg.message}</p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className={`${styles.chatMessage} ${styles.companion} ${styles.typing}`}>
                      <span className={styles.messageAvatar}>
                        <img 
                          src={getCompanionAvatar()} 
                          alt={companionName} 
                          className={styles.companionMessageImage}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const emoji = document.createElement('span');
                            emoji.textContent = getCompanionEmojiFallback();
                            emoji.className = styles.companionEmojiFallback;
                            target.parentElement?.appendChild(emoji);
                          }}
                        />
                      </span>
                      <div className={`${styles.chatBubble} ${styles.chatBubbleCompanion}`}>
                        <div className={styles.typingIndicator}>
                          <span className={styles.typingDot}></span>
                          <span className={styles.typingDot}></span>
                          <span className={styles.typingDot}></span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleChatSubmit} className={styles.chatInputForm}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={`Ask ${companionName} anything...`}
                    className={styles.chatInput}
                  />
                  <button type="submit" className={styles.chatSendBtn}>
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export default FloatingLearningDock;