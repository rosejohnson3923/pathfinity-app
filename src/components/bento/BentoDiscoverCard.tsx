/**
 * BentoDiscoverCard Component
 * Displays Discover container content in a bento-box grid layout
 * Shows exploration missions, wonder questions, and discovery paths
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { pathIQGamification } from '../../services/pathIQGamificationService';
import { chatbotService } from '../../services/chatbotService';
import styles from './BentoDiscoverCard.module.css';

interface BentoDiscoverCardProps {
  screen: 1 | 2; // Screen 1: Discovery Introduction, Screen 2: Path Exploration
  skill: {
    id: string;
    name: string;
    description: string;
  };
  content?: {
    bigDiscovery?: string;
    explorationMission?: string;
    wonderQuestions?: string[];
    path?: {
      number: number;
      question: string;
      type: string;
      image?: string;
      options?: string[];
      correctAnswer?: string;
    };
  };
  onPathComplete?: () => void;
  onAnswerSubmit?: (answer: string) => void;
  gradeLevel: string;
  userId?: string;
  companionId?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'explorer';
  content: string;
  timestamp: Date;
}

export const BentoDiscoverCard: React.FC<BentoDiscoverCardProps> = ({
  screen,
  skill,
  content,
  onPathComplete,
  onAnswerSubmit,
  gradeLevel,
  userId,
  companionId = 'finn'
}) => {
  const { theme } = useTheme();
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [discoveryProgress, setDiscoveryProgress] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [wonderQuestionIndex, setWonderQuestionIndex] = useState(0);
  const [explorationNotes, setExplorationNotes] = useState<string[]>([]);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-advance after completing a path
  useEffect(() => {
    if (isAnswered && onPathComplete) {
      const timer = setTimeout(() => {
        onPathComplete();
      }, 3000);
      setAutoAdvanceTimer(timer);
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [isAnswered, onPathComplete]);
  
  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);
  
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
  
  const handleComplete = () => {
    if (selectedAnswer && !isAnswered) {
      setIsAnswered(true);
      setDiscoveryProgress(prev => Math.min(prev + 25, 100));
      
      // Award XP for discovery
      if (userId) {
        const xp = 20; // Discovery worth more XP
        pathIQGamification.awardPoints(userId, xp, 'Discovery completed', 'learning');
        setXpEarned(prev => prev + xp);
        setShowXPAnimation(true);
        setTimeout(() => setShowXPAnimation(false), 2000);
      }
      
      if (onAnswerSubmit) {
        onAnswerSubmit(selectedAnswer);
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
      const context = `You are an explorer guide helping a grade ${gradeLevel} student discover how ${skill.name} works in the world around them. 
                      Be curious, encouraging, and help them see connections to everyday life.`;
      
      const response = await chatbotService.sendMessage(chatInput, context);
      
      const explorerMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'explorer',
        content: response.message,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, explorerMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsTyping(false);
    }
  };
  
  const addExplorationNote = (note: string) => {
    setExplorationNotes(prev => [...prev, note]);
  };
  
  // Screen 1: Discovery Introduction
  if (screen === 1) {
    return (
      <div className={`${styles.bentoContainer} ${styles[`grade-${gradeCategory}`]} ${theme === 'dark' ? styles.darkTheme : styles.lightTheme}`}>
        
        {/* The Big Discovery - HERO Tile */}
        <div className={`${styles.bentoTile} ${styles.heroTile} ${styles.discoveryTile}`}>
          <div className={styles.discoveryHeader}>
            <span className={styles.discoveryIcon}>🔍</span>
            <h1 className={styles.discoveryTitle}>The Big Discovery</h1>
          </div>
          <div className={styles.discoveryContent}>
            <p className={styles.discoveryText}>
              {content?.bigDiscovery || `Today we're exploring the amazing world of ${skill.name}! Get ready to discover how it's all around us!`}
            </p>
            <div className={styles.discoveryBadges}>
              <span className={styles.badge}>🌟 Explorer</span>
              <span className={styles.badge}>🧭 Navigator</span>
              <span className={styles.badge}>🔬 Scientist</span>
            </div>
          </div>
        </div>
        
        {/* Your Exploration Mission - LARGE Tile */}
        <div className={`${styles.bentoTile} ${styles.largeTile} ${styles.missionTile}`}>
          <h2 className={styles.tileTitle}>Your Exploration Mission</h2>
          <div className={styles.missionContent}>
            <div className={styles.missionIcon}>🚀</div>
            <p className={styles.missionText}>
              {content?.explorationMission || `Discover 4 amazing ways that ${skill.name} helps us solve problems, create things, and understand our world better!`}
            </p>
            <div className={styles.missionProgress}>
              <span>Discovery Progress</span>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${discoveryProgress}%` }}
                />
              </div>
              <span>{discoveryProgress}%</span>
            </div>
          </div>
        </div>
        
        {/* Wonder Questions - WIDE Tile */}
        <div className={`${styles.bentoTile} ${styles.wideTile} ${styles.wonderTile}`}>
          <h2 className={styles.tileTitle}>Wonder Questions about {skill.name}</h2>
          <div className={styles.wonderContent}>
            {content?.wonderQuestions ? (
              <div className={styles.wonderQuestions}>
                {content.wonderQuestions.map((question, index) => (
                  <div 
                    key={index}
                    className={`${styles.wonderQuestion} ${wonderQuestionIndex === index ? styles.active : ''}`}
                    onClick={() => setWonderQuestionIndex(index)}
                  >
                    <span className={styles.wonderIcon}>🤔</span>
                    <span className={styles.wonderText}>{question}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.wonderQuestions}>
                <div className={styles.wonderQuestion}>
                  <span className={styles.wonderIcon}>🤔</span>
                  <span className={styles.wonderText}>How does {skill.name} help us every day?</span>
                </div>
                <div className={styles.wonderQuestion}>
                  <span className={styles.wonderIcon}>💭</span>
                  <span className={styles.wonderText}>Where can we find {skill.name} in nature?</span>
                </div>
                <div className={styles.wonderQuestion}>
                  <span className={styles.wonderIcon}>✨</span>
                  <span className={styles.wonderText}>What amazing things use {skill.name}?</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Explorer Chat - MEDIUM Tile */}
        <div className={`${styles.bentoTile} ${styles.mediumTile} ${styles.chatTile}`}>
          <div className={styles.chatHeader}>
            <span className={styles.chatIcon}>💬</span>
            <span className={styles.chatTitle}>Explorer Guide</span>
            <button 
              className={styles.chatToggle}
              onClick={() => setShowChat(!showChat)}
            >
              {showChat ? '−' : '+'}
            </button>
          </div>
          
          {showChat ? (
            <div className={styles.chatContent}>
              <div className={styles.chatMessages}>
                {chatMessages.length === 0 && (
                  <div className={styles.chatWelcome}>
                    Let's explore together! What are you curious about? 🧭
                  </div>
                )}
                {chatMessages.map(msg => (
                  <div 
                    key={msg.id}
                    className={`${styles.chatMessage} ${styles[msg.role]}`}
                  >
                    {msg.content}
                  </div>
                ))}
                {isTyping && (
                  <div className={`${styles.chatMessage} ${styles.explorer}`}>
                    <span className={styles.typingIndicator}>...</span>
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
                  placeholder="What do you wonder about?"
                  className={styles.chatInputField}
                />
                <button onClick={handleChatSend} className={styles.chatSendButton}>
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.chatClosed}>
              <p>Questions? Let's explore together!</p>
            </div>
          )}
        </div>
        
        {/* Start Exploring - SMALL Tile */}
        <div className={`${styles.bentoTile} ${styles.smallTile} ${styles.actionTile}`}>
          <button 
            className={styles.exploreButton}
            onClick={onPathComplete}
          >
            Start Exploring →
          </button>
        </div>
      </div>
    );
  }
  
  // Screen 2: Path Exploration
  return (
    <div className={`${styles.bentoContainer} ${styles[`grade-${gradeCategory}`]} ${theme === 'dark' ? styles.darkTheme : styles.lightTheme}`}>
      
      {/* Path Header - WIDE Tile */}
      <div className={`${styles.bentoTile} ${styles.wideTile} ${styles.pathHeaderTile}`}>
        <div className={styles.pathHeader}>
          <span className={styles.pathNumber}>Path {content?.path?.number || 1}</span>
          <span className={styles.pathType}>{content?.path?.type || 'Discovery'}</span>
          <span className={styles.xpReward}>+20 XP</span>
        </div>
      </div>
      
      {/* Discovery Question - HERO Tile */}
      <div className={`${styles.bentoTile} ${styles.heroTile} ${styles.questionTile}`}>
        <div className={styles.questionContent}>
          <h2 className={styles.questionText}>
            {content?.path?.question || `Let's discover how ${skill.name} works!`}
          </h2>
          {content?.path?.image && (
            <img 
              src={content.path.image} 
              alt="Discovery visual"
              className={styles.questionImage}
            />
          )}
        </div>
      </div>
      
      {/* Answer Options */}
      {content?.path?.options?.map((option, index) => (
        <div 
          key={index}
          className={`
            ${styles.bentoTile} 
            ${styles.smallTile} 
            ${styles.answerTile}
            ${selectedAnswer === option ? styles.selected : ''}
            ${isAnswered && option === content.path?.correctAnswer ? styles.correct : ''}
            ${isAnswered && selectedAnswer === option && option !== content.path?.correctAnswer ? styles.incorrect : ''}
          `}
          onClick={() => handleAnswerSelect(option)}
        >
          <div className={styles.answerContent}>
            <span className={styles.answerLabel}>
              {gradeCategory === 'elementary' ? ['🌟', '🎨', '🚀', '🌈'][index] : `${index + 1}`}
            </span>
            <span className={styles.answerText}>{option}</span>
          </div>
        </div>
      ))}
      
      {/* Exploration Notes - TALL Tile */}
      <div className={`${styles.bentoTile} ${styles.tallTile} ${styles.notesTile}`}>
        <h3 className={styles.tileTitle}>Exploration Notes</h3>
        <div className={styles.notesContent}>
          <div className={styles.notesList}>
            {explorationNotes.length === 0 ? (
              <p className={styles.notesPrompt}>Your discoveries will appear here!</p>
            ) : (
              explorationNotes.map((note, index) => (
                <div key={index} className={styles.note}>
                  <span className={styles.noteIcon}>📝</span>
                  <span className={styles.noteText}>{note}</span>
                </div>
              ))
            )}
          </div>
          <button 
            className={styles.addNoteButton}
            onClick={() => addExplorationNote(`Discovered something about ${skill.name}!`)}
          >
            + Add Note
          </button>
        </div>
      </div>
      
      {/* Discovery Progress - MEDIUM Tile */}
      <div className={`${styles.bentoTile} ${styles.mediumTile} ${styles.progressTile}`}>
        <h3 className={styles.tileTitle}>Discovery Journey</h3>
        <div className={styles.progressContent}>
          <div className={styles.milestones}>
            <div className={`${styles.milestone} ${discoveryProgress >= 25 ? styles.completed : ''}`}>
              <span className={styles.milestoneIcon}>🌱</span>
              <span className={styles.milestoneLabel}>Seedling</span>
            </div>
            <div className={`${styles.milestone} ${discoveryProgress >= 50 ? styles.completed : ''}`}>
              <span className={styles.milestoneIcon}>🌿</span>
              <span className={styles.milestoneLabel}>Growing</span>
            </div>
            <div className={`${styles.milestone} ${discoveryProgress >= 75 ? styles.completed : ''}`}>
              <span className={styles.milestoneIcon}>🌳</span>
              <span className={styles.milestoneLabel}>Thriving</span>
            </div>
            <div className={`${styles.milestone} ${discoveryProgress >= 100 ? styles.completed : ''}`}>
              <span className={styles.milestoneIcon}>🌟</span>
              <span className={styles.milestoneLabel}>Master</span>
            </div>
          </div>
          <div className={styles.xpTracking}>
            <span className={styles.xpIcon}>⚡</span>
            <span className={styles.xpValue}>{xpEarned} XP</span>
            <span className={styles.xpLabel}>Earned</span>
          </div>
        </div>
      </div>
      
      {/* Complete Button - SMALL Tile */}
      <div className={`${styles.bentoTile} ${styles.smallTile} ${styles.actionTile}`}>
        <button 
          className={styles.completeButton}
          onClick={handleComplete}
          disabled={!selectedAnswer || isAnswered}
        >
          {isAnswered ? 'Auto-advancing...' : 'Complete Discovery'}
        </button>
      </div>
      
      {/* Discovery Feedback Modal */}
      {isAnswered && (
        <div className={styles.feedbackOverlay}>
          <div className={styles.feedbackModal}>
            <span className={styles.feedbackIcon}>🌟</span>
            <h3 className={styles.feedbackTitle}>Amazing Discovery!</h3>
            <p className={styles.feedbackMessage}>
              You've uncovered how {skill.name} works in our world!
            </p>
            <p className={styles.xpMessage}>+20 XP earned!</p>
            <div className={styles.discoveryBadge}>
              <span className={styles.badgeIcon}>🏆</span>
              <span className={styles.badgeText}>Discovery Badge Earned!</span>
            </div>
          </div>
        </div>
      )}
      
      {/* XP Animation */}
      {showXPAnimation && (
        <div className={styles.xpAnimation}>
          +20 XP!
        </div>
      )}
    </div>
  );
};