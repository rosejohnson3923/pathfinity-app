/**
 * BentoLearnCardV2 Component
 * Redesigned with FloatingDock and Display Modal for better UX
 * Question & Answer get full space, auxiliary features in floating dock
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { pathIQGamification } from '../../services/pathIQGamificationService';
import { chatbotService } from '../../services/chatbotService';
import styles from './BentoLearnCardV2.module.css';

interface BentoLearnCardV2Props {
  question: {
    id: string;
    number: number;
    type: string;
    text: string;
    image?: string;
    options?: string[];
    correctAnswer?: string | string[];
    hint?: string;
    xpReward?: number;
  };
  onAnswerSubmit: (answer: string | string[]) => void;
  onNextQuestion: () => void;
  onHintRequest?: () => void;
  progress: {
    current: number;
    total: number;
    score: number;
  };
  feedback?: {
    isCorrect: boolean;
    message: string;
  };
  gradeLevel: string;
  subject: string;
  skill: string;
  userId?: string;
  companionId?: string;
  totalXP?: number;
}

type DockItem = 'xp' | 'chat' | 'progress' | 'hints' | 'tools' | null;

interface ChatMessage {
  id: string;
  role: 'user' | 'companion';
  content: string;
  timestamp: Date;
}

export const BentoLearnCardV2: React.FC<BentoLearnCardV2Props> = ({
  question,
  onAnswerSubmit,
  onNextQuestion,
  onHintRequest,
  progress,
  feedback,
  gradeLevel,
  subject,
  skill,
  userId,
  companionId = 'finn',
  totalXP = 0
}) => {
  // Debug: Log received question (disabled)
  // console.log('🎯 BentoLearnCardV2 received question:', {
  //   text: question.text,
  //   type: question.type,
  //   image: question.image,
  //   hasText: !!question.text,
  //   textLength: question.text?.length
  // });
  const { theme } = useTheme();
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[]>('');
  const [showHint, setShowHint] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [activeDockItem, setActiveDockItem] = useState<DockItem>(null);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Gamification state
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [xpEarned, setXpEarned] = useState(totalXP);
  const [streak, setStreak] = useState(0);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const displayModalRef = useRef<HTMLDivElement>(null);
  
  // Detect iPhone SE specifically
  const [isIPhoneSE, setIsIPhoneSE] = useState(false);
  
  useEffect(() => {
    const checkIPhoneSE = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isIOS = /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      // iPhone SE has 375x667 viewport
      setIsIPhoneSE(isIOS && width === 375 && height === 667);
    };
    
    checkIPhoneSE();
    window.addEventListener('resize', checkIPhoneSE);
    return () => window.removeEventListener('resize', checkIPhoneSE);
  }, []);
  
  // Get gamification data on mount
  useEffect(() => {
    if (userId) {
      const profile = pathIQGamification.getUserProfile(userId);
      setStreak(profile.streak);
    }
  }, [userId]);
  
  // Scroll chat to bottom - only within chat container
  useEffect(() => {
    if (activeDockItem === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
  // Determine grade category
  const getGradeCategory = (grade: string): 'elementary' | 'middle' | 'high' => {
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);
    if (gradeNum <= 5) return 'elementary';
    if (gradeNum <= 8) return 'middle';
    return 'high';
  };
  
  const gradeCategory = getGradeCategory(gradeLevel);
  
  const handleAnswerSelect = (answer: string) => {
    if (!isAnswered) {
      setSelectedAnswer(answer);
    }
  };
  
  const handleSubmit = () => {
    if (selectedAnswer && !isAnswered) {
      setIsAnswered(true);
      setShowFeedback(true);
      onAnswerSubmit(selectedAnswer);
      
      // Award XP for correct answer
      if (selectedAnswer === question.correctAnswer && userId) {
        const xp = question.xpReward || 10;
        pathIQGamification.awardXP(userId, xp, 'Correct answer', 'learning');
        setXpEarned(prev => prev + xp);
        setShowXPAnimation(true);
        setTimeout(() => {
          setShowXPAnimation(false);
        }, 3000);
      }
    }
  };
  
  const handleNext = () => {
    setSelectedAnswer('');
    setIsAnswered(false);
    setShowHint(false);
    setShowFeedback(false);
    setActiveDockItem(null);
    onNextQuestion();
  };
  
  const handleDockItemClick = (item: DockItem) => {
    setActiveDockItem(activeDockItem === item ? null : item);
  };
  
  const handleHint = () => {
    if (hintsRemaining > 0 && !showHint) {
      setShowHint(true);
      setHintsRemaining(prev => prev - 1);
      
      // Deduct XP for hint usage if configured
      if (userId) {
        pathIQGamification.awardXP(userId, -2, 'Hint used', 'hint');
      }
      
      if (onHintRequest) {
        onHintRequest();
      }
    }
  };
  
  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);
    
    try {
      const response = await chatbotService.getCompanionResponse(
        chatInput,
        companionId,
        {
          currentQuestion: question.text,
          subject,
          skill,
          gradeLevel
        }
      );
      
      const companionMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'companion',
        content: response,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, companionMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsTyping(false);
    }
  };
  
  const isAssessment = skill === 'Assessment' || progress.total === 1;
  
  return (
    <div className={`${styles.bentoContainerV2} ${isAssessment ? styles.assessment : ''} ${styles[`grade-${gradeCategory}`]} ${styles[`theme-${theme}`]}`} data-active-dock={activeDockItem || 'none'}>
      {/* Horizontal Dock - Above Question */}
      <div className={styles.horizontalDock}>
        {/* Support Tools - Related to Current Question */}
        <div className={styles.dockGroupSupport}>
          <button
            className={`${styles.dockItem} ${activeDockItem === 'hints' ? styles.active : ''}`}
            onClick={() => handleDockItemClick('hints')}
            aria-label="Hints & Help"
          >
            <span className={styles.dockIcon}>💡</span>
            <span className={styles.dockLabel}>Hints</span>
          </button>
          
          <button
            className={`${styles.dockItem} ${activeDockItem === 'tools' ? styles.active : ''}`}
            onClick={() => handleDockItemClick('tools')}
            aria-label="Learning Tools"
          >
            <span className={styles.dockIcon}>🛠️</span>
            <span className={styles.dockLabel}>Tools</span>
          </button>
          
          <button
            className={`${styles.dockItem} ${activeDockItem === 'chat' ? styles.active : ''}`}
            onClick={() => handleDockItemClick('chat')}
            aria-label="Chat with companion"
          >
            <span className={styles.dockIcon}>💬</span>
            <span className={styles.dockLabel}>Chat</span>
          </button>
        </div>
        
        {/* Journey Info - Related to Overall Progress */}
        <div className={styles.dockGroupInfo}>
          <button
            className={`${styles.dockItem} ${activeDockItem === 'progress' ? styles.active : ''}`}
            onClick={() => handleDockItemClick('progress')}
            aria-label="Progress & XP"
          >
            <span className={styles.dockIcon}>📊</span>
            <span className={styles.dockLabel}>Progress</span>
          </button>
          
          <button
            className={`${styles.dockItem} ${activeDockItem === 'xp' ? styles.active : ''} ${styles.xpButton}`}
            onClick={() => handleDockItemClick('xp')}
            aria-label="XP Points"
          >
            <span className={styles.dockIcon}>⚡</span>
            <span className={styles.dockLabel}>XP</span>
            {xpEarned > 0 && (
              <span className={styles.xpBadge}>{xpEarned}</span>
            )}
          </button>
        </div>
      </div>
      
      {/* Main Question & Answer Area */}
      <div className={styles.mainContent} style={isIPhoneSE ? {
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 120px)',
        overflow: 'hidden',
        padding: 0,
        gap: 0
      } : {}}>
        {/* Question Section */}
        <div className={`${styles.questionSection} ${styles[question.type]}`} style={isIPhoneSE ? {
          flex: '0 0 40%',
          height: '40%',
          maxHeight: '40%',
          minHeight: '40%',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '12px',
          margin: 0,
          background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          position: 'relative'
        } : {}}>
          {/* Compact progress dots with label */}
          <div className={styles.progressIndicator}>
            <div className={styles.progressDots}>
              {Array.from({ length: progress.total }, (_, i) => (
                <span 
                  key={i}
                  className={`${styles.dot} ${i < progress.current ? styles.completed : ''} ${i === progress.current - 1 ? styles.active : ''}`}
                />
              ))}
            </div>
            <span className={styles.progressLabel}>
              Practice {progress.current} of {progress.total}
            </span>
          </div>
          
          <div className={styles.questionContent}>
            {/* For counting questions, show visual first and prominently */}
            {question.type === 'counting' && question.image && (
              <div className={styles.countingVisualPrimary}>
                {typeof question.image === 'string' && question.image.includes('http') ? (
                  <img src={question.image} alt="Count these items" className={styles.countingImageLarge} />
                ) : (
                  <div className={styles.countingEmojiLarge}>{question.image}</div>
                )}
              </div>
            )}
            
            <h2 className={`${styles.questionText} ${gradeCategory === 'elementary' ? styles.questionTextLarge : ''}`}
                style={isIPhoneSE ? {
                  display: 'block',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: '600',
                  textAlign: 'center',
                  padding: '8px',
                  margin: '4px 0',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '8px',
                  width: '100%',
                  boxSizing: 'border-box',
                  position: 'static',
                  zIndex: 'auto',
                  visibility: 'visible',
                  opacity: 1
                } : {}}>
              {question.text || 'Loading question...'}
            </h2>
            
            {/* For non-counting questions, show image as supplementary */}
            {question.type !== 'counting' && question.image && (
              <div className={styles.questionVisual}>
                {typeof question.image === 'string' && question.image.includes('http') ? (
                  <img src={question.image} alt="Question visual" />
                ) : (
                  <span>{question.image}</span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Answer Section */}
        <div className={styles.answerSection} style={isIPhoneSE ? {
          flex: '1 1 60%',
          height: '60%',
          maxHeight: '60%',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '12px',
          margin: 0,
          background: 'var(--bg-primary)',
          borderTop: '2px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        } : {}}>
          <div className={styles.answersGrid}>
            {question.options && question.options.length > 0 ? (
              question.options.slice(0, 4).map((option, index) => {
                const optionLabels = ['A', 'B', 'C', 'D'];
                // Handle both string and object options
                const optionText = typeof option === 'string' ? option : (option?.text || String(option));
                const optionId = typeof option === 'string' ? `opt-${index}` : (option?.id || `opt-${index}`);
                return (
                  <button
                    key={optionId}
                    className={`
                      ${styles.answerOption}
                      ${selectedAnswer === optionText ? styles.selected : ''}
                      ${isAnswered && optionText === question.correctAnswer ? styles.correct : ''}
                      ${isAnswered && selectedAnswer === optionText && optionText !== question.correctAnswer ? styles.incorrect : ''}
                    `}
                    onClick={() => handleAnswerSelect(optionText)}
                    disabled={isAnswered}
                  >
                    {question.type === 'true_false' ? (
                      <span className={styles.trueFalseOption}>{optionText}</span>
                    ) : (
                      <>
                        <span className={styles.optionLabel}>
                          {gradeCategory === 'elementary' ? optionLabels[index] : `${index + 1}`}
                        </span>
                        <span className={styles.optionText}>{optionText}</span>
                      </>
                    )}
                  </button>
                );
              })
            ) : (
              <div className={styles.inputAnswer}>
                <input
                  type={question.type === 'numeric' || question.type === 'counting' ? 'number' : 'text'}
                  placeholder="Type your answer..."
                  value={selectedAnswer as string}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                  disabled={isAnswered}
                  className={styles.answerInput}
                />
              </div>
            )}
          </div>
          
          {/* Submit/Next Button */}
          <div className={styles.actionButton}>
            {!isAnswered ? (
              <button 
                className={styles.submitButton}
                onClick={handleSubmit}
                disabled={!selectedAnswer}
              >
                Submit Answer
              </button>
            ) : (
              <button 
                className={styles.nextButton}
                onClick={handleNext}
              >
                {progress.current < progress.total ? 'Next Question →' : 
                 skill === 'Assessment' ? 'Complete Assessment →' : 'Complete Practice →'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Display Modal - Shows selected dock item content */}
      {/* Expanded Panel - Below Question */}
      {activeDockItem && (
        <div className={styles.expandedPanel} ref={displayModalRef}>
          <div className={styles.modalHeader}>
            <h3>{
              activeDockItem === 'xp' ? 'XP Points' :
              activeDockItem === 'chat' ? `Chat with ${companionId}` :
              activeDockItem === 'progress' ? 'Progress & XP' :
              activeDockItem === 'hints' ? 'Hints & Tools' :
              'Learning Tools'
            }</h3>
            <button className={styles.closeModal} onClick={() => setActiveDockItem(null)}>×</button>
          </div>
          
          <div className={styles.modalContent}>
            {/* XP Content */}
            {activeDockItem === 'xp' && (
              <div className={styles.xpContainer}>
                <div className={styles.xpDisplay}>
                  <div className={styles.xpTotalSection}>
                    <span className={styles.xpIcon}>⚡</span>
                    <div className={styles.xpTotal}>
                      <span className={styles.xpValue}>{xpEarned}</span>
                      <span className={styles.xpLabel}>Total XP Earned</span>
                    </div>
                  </div>
                  
                  <div className={styles.xpBreakdown}>
                    <h4>Session Summary</h4>
                    <div className={styles.xpStats}>
                      <div className={styles.xpStatItem}>
                        <span className={styles.statIcon}>✅</span>
                        <span className={styles.statText}>Correct Answers</span>
                        <span className={styles.statValue}>+{xpEarned} XP</span>
                      </div>
                      <div className={styles.xpStatItem}>
                        <span className={styles.statIcon}>🔥</span>
                        <span className={styles.statText}>Current Streak</span>
                        <span className={styles.statValue}>{streak} days</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.xpNextLevel}>
                    <p className={styles.nextLevelText}>Keep learning to earn more XP!</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Chat Content */}
            {activeDockItem === 'chat' && (
              <div className={styles.chatContainer}>
                <div className={styles.chatMessages}>
                  {chatMessages.length === 0 && (
                    <div className={styles.chatWelcome}>
                      Hi! I'm here to help. Ask me anything about this question! 🤖
                    </div>
                  )}
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={`${styles.chatMessage} ${styles[msg.role]}`}>
                      <span>{msg.content}</span>
                    </div>
                  ))}
                  {isTyping && (
                    <div className={styles.typingIndicator}>
                      <span></span><span></span><span></span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className={styles.chatInput}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                    placeholder="Type your message..."
                  />
                  <button onClick={handleChatSend}>Send</button>
                </div>
              </div>
            )}
            
            {/* Progress Content */}
            {activeDockItem === 'progress' && (
              <div className={styles.progressContainer}>
                <div className={styles.progressStats}>
                  <div className={styles.statCard}>
                    <span className={styles.statIcon}>⚡</span>
                    <span className={styles.statValue}>{xpEarned}</span>
                    <span className={styles.statLabel}>XP Earned</span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statIcon}>🔥</span>
                    <span className={styles.statValue}>{streak}</span>
                    <span className={styles.statLabel}>Day Streak</span>
                  </div>
                </div>
                
                <div className={styles.progressBar}>
                  <div className={styles.progressHeader}>
                    <span>Question {progress.current} of {progress.total}</span>
                    <span>{Math.round((progress.current / progress.total) * 100)}% Complete</span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className={styles.scoreDisplay}>
                  <span className={styles.scoreLabel}>Score</span>
                  <span className={styles.scoreValue}>{progress.score}%</span>
                </div>
                
                <div className={styles.skillInfo}>
                  <span className={styles.skillLabel}>Skill:</span>
                  <span className={styles.skillName}>{skill}</span>
                </div>
              </div>
            )}
            
            {/* Hints Content */}
            {activeDockItem === 'hints' && (
              <div className={styles.hintsContainer}>
                <div className={styles.hintStatus}>
                  <span className={styles.hintsRemaining}>💡 {hintsRemaining} Free Hints</span>
                </div>
                
                <div className={styles.hintEconomy}>
                  <div className={styles.hintOption}>
                    <span>🌟 Basic Hint</span>
                    <span className={styles.hintCost}>FREE ({hintsRemaining} left)</span>
                  </div>
                  <div className={styles.hintOption}>
                    <span>💎 Premium Hint</span>
                    <span className={styles.hintCost}>-5 XP</span>
                  </div>
                  <div className={styles.hintOption}>
                    <span>👑 Expert Solution</span>
                    <span className={styles.hintCost}>-10 XP</span>
                  </div>
                </div>
                
                <button 
                  className={styles.hintButton}
                  onClick={handleHint}
                  disabled={showHint || isAnswered || hintsRemaining === 0}
                >
                  {showHint ? '✓ Hint Used' : 
                   hintsRemaining > 0 ? `Get Free Hint` : 
                   'Get Premium Hint (-5 XP)'}
                </button>
                
                {showHint && question.hint && (
                  <div className={styles.hintDisplay}>
                    <p>{question.hint}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Tools Content */}
            {activeDockItem === 'tools' && (
              <div className={styles.toolsContainer}>
                <div className={styles.toolsGrid}>
                  <button className={styles.toolButton}>
                    <span>🧮</span>
                    <span>Calculator</span>
                  </button>
                  <button className={styles.toolButton}>
                    <span>📝</span>
                    <span>Scratch Pad</span>
                  </button>
                  <button className={styles.toolButton}>
                    <span>⏱️</span>
                    <span>Timer</span>
                  </button>
                  <button className={styles.toolButton}>
                    <span>📐</span>
                    <span>Ruler</span>
                  </button>
                  <button className={styles.toolButton}>
                    <span>🎯</span>
                    <span>PathIQ</span>
                  </button>
                  <button className={styles.toolButton}>
                    <span>📚</span>
                    <span>Formula Sheet</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* XP Animation Overlay */}
      {showXPAnimation && (
        <div className={styles.xpAnimation}>
          +{question.xpReward || 10} XP!
        </div>
      )}
      
      {/* Feedback Modal */}
      {feedback && showFeedback && (
        <div className={styles.feedbackOverlay}>
          <div className={`${styles.feedbackModal} ${feedback.isCorrect ? styles.correct : styles.incorrect}`}>
            <span className={styles.feedbackIcon}>
              {feedback.isCorrect ? '✅' : '❌'}
            </span>
            <h3 className={styles.feedbackTitle}>
              {feedback.isCorrect ? 'Correct!' : 'Not Quite'}
            </h3>
            <p className={styles.feedbackMessage}>{feedback.message}</p>
            {feedback.isCorrect && (
              <p className={styles.xpMessage}>+{question.xpReward || 10} XP earned!</p>
            )}
            <button 
              className={styles.continueButton} 
              onClick={() => setShowFeedback(false)}
              autoFocus
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};