/**
 * BentoLearnCard Component
 * Displays Learn container content in a bento-box grid layout
 * Shows question, answer options, hints, progress, chat, and gamification
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { pathIQGamification } from '../../services/pathIQGamificationService';
import { chatbotService } from '../../services/chatbotService';
import styles from './BentoLearnCard.module.css';

interface BentoLearnCardProps {
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
  onFeedbackDismiss?: () => void;
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
}

interface ChatMessage {
  id: string;
  role: 'user' | 'companion';
  content: string;
  timestamp: Date;
}

export const BentoLearnCard: React.FC<BentoLearnCardProps> = ({
  question,
  onAnswerSubmit,
  onNextQuestion,
  onHintRequest,
  onFeedbackDismiss,
  progress,
  feedback,
  gradeLevel,
  subject,
  skill,
  userId,
  companionId = 'finn'
}) => {
  const { theme } = useTheme();
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[]>('');
  const [showHint, setShowHint] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [xpEarned, setXpEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Get gamification data on mount
  useEffect(() => {
    if (userId) {
      const profile = pathIQGamification.getUserProfile(userId);
      setStreak(profile.streak);
    }
  }, [userId]);
  
  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    console.log('🎯 Submit clicked:', { selectedAnswer, isAnswered });
    if (selectedAnswer && !isAnswered) {
      setIsAnswered(true);
      setShowFeedback(true); // Show feedback modal
      onAnswerSubmit(selectedAnswer);
      console.log('✅ Answer submitted, isAnswered set to true');
      
      // Award XP for correct answer
      if (selectedAnswer === question.correctAnswer && userId) {
        const xp = question.xpReward || 10;
        pathIQGamification.awardXP(userId, xp, 'Correct answer', 'learning');
        setXpEarned(prev => prev + xp);
        setShowXPAnimation(true);
        // Increase timeout and ensure it clears
        setTimeout(() => {
          setShowXPAnimation(false);
          console.log('🎬 XP Animation cleared');
        }, 3000);
      }
    }
  };
  
  const handleNext = () => {
    setSelectedAnswer('');
    setIsAnswered(false);
    setShowHint(false);
    setShowFeedback(false);
    onNextQuestion();
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
      // Get companion response about the current question
      const context = `You are ${companionId}, helping with a ${subject} question: "${question.text}". 
                      The student is in grade ${gradeLevel}. Be encouraging and helpful without giving away the answer directly.`;
      
      const response = await chatbotService.sendMessage(chatInput, context);
      
      const companionMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'companion',
        content: response.message,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, companionMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsTyping(false);
    }
  };
  
  return (
    <div className={`${styles.bentoContainer} ${styles[`grade-${gradeCategory}`]} ${theme === 'dark' ? styles.darkTheme : styles.lightTheme}`}>
      
      {/* PRIMARY SECTION: Question & Answers - Top Row */}
      {/* Question Display - WIDE Tile (3x2) */}
      <div className={`${styles.bentoTile} ${styles.wideTile} ${styles.questionTile}`}>
        <div className={styles.questionHeader}>
          <span className={styles.questionNumber}>Question {question.number}</span>
          <span className={styles.questionType}>{question.type}</span>
          <span className={styles.xpReward}>+{question.xpReward || 10} XP</span>
        </div>
        <div className={styles.questionContent}>
          {/* For counting questions, show visual first and prominently */}
          {question.type === 'counting' && question.image && (
            <div className={styles.countingVisualPrimary}>
              {typeof question.image === 'string' && question.image.includes('http') ? (
                <img 
                  src={question.image} 
                  alt="Count these items"
                  className={styles.countingImageLarge}
                />
              ) : (
                <div className={styles.countingEmojiLarge}>
                  {question.image}
                </div>
              )}
            </div>
          )}
          
          <h2 className={`${styles.questionText} ${gradeCategory === 'elementary' ? styles.questionTextLarge : ''}`}>
            {question.text || 'Loading question...'}
          </h2>
          
          {/* For non-counting questions, show image as supplementary */}
          {question.type !== 'counting' && question.image && (
            typeof question.image === 'string' && question.image.includes('http') ? (
              <img 
                src={question.image} 
                alt="Question visual"
                className={styles.questionImage}
              />
            ) : (
              <div className={styles.questionVisual}>
                {question.image}
              </div>
            )
          )}
        </div>
      </div>
      
      {/* Answer Options - Directly below Question (3x1) */}
      <div className={`${styles.bentoTile} ${styles.wideTile} ${styles.answersTile}`}>
        <div className={styles.answersGrid}>
          {question.options && question.options.length > 0 ? (
            question.options.map((option, index) => (
              <div 
                key={index}
                className={`
                  ${styles.answerOption}
                  ${selectedAnswer === option ? styles.selected : ''}
                  ${isAnswered && option === question.correctAnswer ? styles.correct : ''}
                  ${isAnswered && selectedAnswer === option && option !== question.correctAnswer ? styles.incorrect : ''}
                `}
                onClick={() => handleAnswerSelect(option)}
                role="button"
                tabIndex={0}
              >
                <span className={styles.answerLabel}>
                  {question.type === 'true_false' ? '' :
                   question.type === 'counting' || question.type === 'numeric' ? '' :
                   gradeCategory === 'elementary' ? ['A', 'B', 'C', 'D'][index] : 
                   `${index + 1}`}
                </span>
                <span className={styles.answerText}>{option}</span>
              </div>
            ))
          ) : (
            <div className={styles.noOptions}>
              {question.type === 'counting' ? 'Select the correct count' : 
               question.type === 'numeric' ? 'Select the correct number' :
               question.type === 'short_answer' ? 'Type your answer' :
               question.type === 'long_answer' ? 'Write your response' :
               'No options available'}
            </div>
          )}
        </div>
        {/* Submit/Next Button inside Answer Tile */}
        <div className={styles.answerActions}>
          {!isAnswered ? (
            <button 
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={!selectedAnswer}
            >
              Submit Answer
            </button>
          ) : !showFeedback && (
            <button 
              className={styles.nextButton}
              onClick={handleNext}
            >
              {progress.current < progress.total ? 'Next Question →' : 'Complete Practice →'}
            </button>
          )}
          {/* Button hidden when feedback modal is showing */}
        </div>
      </div>
      
      {/* AUXILIARY SECTION: Support Features - Right Side */}
      {/* Progress & Gamification - SMALL Tile (1x1) */}
      <div className={`${styles.bentoTile} ${styles.smallTile} ${styles.progressTile}`}>
        <h3 className={styles.tileTitle}>Progress & XP</h3>
        <div className={styles.progressContent}>
          <div className={styles.gamificationStats}>
            <div className={styles.xpDisplay}>
              <span className={styles.xpIcon}>⚡</span>
              <span className={styles.xpValue}>{xpEarned}</span>
              <span className={styles.xpLabel}>XP Earned</span>
            </div>
            <div className={styles.streakDisplay}>
              <span className={styles.streakIcon}>🔥</span>
              <span className={styles.streakValue}>{streak}</span>
              <span className={styles.streakLabel}>Day Streak</span>
            </div>
          </div>
          
          {/* Enhanced Question Progression Display */}
          <div className={styles.progressStats}>
            <div className={styles.statItem}>
              <span className={`${styles.statValue} ${styles.statValueLarge}`}>
                {progress.current}
              </span>
              <span className={styles.statLabel}>of {progress.total} Questions</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{progress.score}%</span>
              <span className={styles.statLabel}>Score</span>
            </div>
          </div>
          
          {/* Visual Progress Indicator */}
          <div className={styles.progressIndicator}>
            <div className={styles.progressHeader}>
              <span>Question {progress.current} of {progress.total}</span>
              <span>{Math.round((progress.current / progress.total) * 100)}% Complete</span>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
          
          <div className={styles.skillInfo}>
            <span className={styles.skillLabel}>Skill:</span>
            <span className={styles.skillName}>{skill}</span>
          </div>
        </div>
      </div>
      
      {/* Companion Chat - TALL Tile (1x2) */}
      <div className={`${styles.bentoTile} ${styles.tallTile} ${styles.chatTile}`}>
        <div className={styles.chatHeader}>
          <span className={styles.chatIcon}>💬</span>
          <span className={styles.chatTitle}>Chat with {companionId}</span>
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
                  Hi! Need help with this question? Just ask! 🤖
                </div>
              )}
              {chatMessages.map(msg => (
                <div 
                  key={msg.id}
                  className={`${styles.chatMessage} ${styles[msg.role]}`}
                >
                  <span className={styles.messageContent}>{msg.content}</span>
                </div>
              ))}
              {isTyping && (
                <div className={`${styles.chatMessage} ${styles.companion}`}>
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
                placeholder="Ask a question..."
                className={styles.chatInputField}
              />
              <button 
                onClick={handleChatSend}
                className={styles.chatSendButton}
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.chatClosed}>
            <p>Click + to open chat</p>
            <span className={styles.chatPreview}>Need help? I'm here! 💭</span>
          </div>
        )}
      </div>
      
      {/* Hints & Tools - SMALL Tile (1x1) with Hint Economy */}
      <div className={`${styles.bentoTile} ${styles.smallTile} ${styles.toolsTile}`}>
        <div className={styles.hintsHeader}>
          <span className={styles.hintsTitle}>Hints & Tools</span>
          <span className={styles.hintsRemaining}>
            💡 {hintsRemaining} Free Hints
          </span>
        </div>
        
        <div className={styles.toolsContent}>
          {/* Hint Economy Display */}
          <div className={styles.hintEconomy}>
            <div className={styles.hintEconomyTitle}>Hint Quality & Cost:</div>
            <div className={styles.hintEconomyList}>
              <div className={styles.hintEconomyItem}>
                <span>🌟 Basic Hint:</span>
                <div className={styles.hintDetails}>
                  <span className={`${styles.hintCost} ${styles.hintCostFree}`}>FREE ({hintsRemaining} left)</span>
                  <span className={styles.hintReveal}>25% reveal</span>
                </div>
              </div>
              <div className={styles.hintEconomyItem}>
                <span>💎 Premium Hint:</span>
                <div className={styles.hintDetails}>
                  <span className={`${styles.hintCost} ${styles.hintCostPremium}`}>-5 XP</span>
                  <span className={styles.hintReveal}>50% reveal</span>
                </div>
              </div>
              <div className={styles.hintEconomyItem}>
                <span>👑 Expert Solution:</span>
                <div className={styles.hintDetails}>
                  <span className={`${styles.hintCost} ${styles.hintCostExpert}`}>-10 XP</span>
                  <span className={styles.hintReveal}>100% answer</span>
                </div>
              </div>
            </div>
          </div>
          
          <button 
            className={`${styles.hintButton} ${!hintsRemaining ? styles.disabled : ''}`}
            onClick={handleHint}
            disabled={showHint || isAnswered || hintsRemaining === 0}
          >
            {showHint ? '✓ Hint Used' : 
             hintsRemaining > 0 ? `💡 Get Free Hint (${hintsRemaining} left)` : 
             '💎 Get Premium Hint (-5 XP)'}
          </button>
          
          {showHint && question.hint && (
            <div className={styles.hintDisplay}>
              <p>{question.hint}</p>
            </div>
          )}
          
          <div className={styles.toolButtons}>
            <button className={styles.toolButton} title="Calculator">
              🧮 Calc
            </button>
            <button className={styles.toolButton} title="Scratch Pad">
              📝 Notes
            </button>
            <button className={styles.toolButton} title="Timer">
              ⏱️ Timer
            </button>
            <button className={styles.toolButton} title="PathIQ Help">
              🎯 PathIQ
            </button>
          </div>
        </div>
      </div>
      
      {/* XP Animation Overlay - with pointer-events none to not block UI */}
      {showXPAnimation && (
        <div className={styles.xpAnimation} style={{ pointerEvents: 'none' }}>
          +{question.xpReward || 10} XP!
        </div>
      )}
      
      {/* Feedback Modal - Overlay */}
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
              onClick={() => {
                // Just dismiss the feedback modal
                // The Next Question button will appear in the Answer tile
                setShowFeedback(false);
              }}
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