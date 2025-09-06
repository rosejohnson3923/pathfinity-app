/**
 * BentoExperienceCard Component
 * Provides hands-on, interactive experiences for K-12 students
 * Visual Hierarchy: SECONDARY (70% prominence)
 * Shows career scenarios, challenges, and professional solutions
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { VisualHierarchy } from '../../styles/visualHierarchy';
import { CareerContextScreen } from '../career/CareerContextScreen';
import { pathIQGamification } from '../../services/pathIQGamificationService';
import { chatbotService } from '../../services/chatbotService';
import styles from './BentoExperienceCard.module.css';

interface BentoExperienceCardProps {
  screen?: 1 | 2; // Screen 1: Introduction, Screen 2: Challenge
  career: {
    id: string;
    name: string;
    icon: string;
  };
  skill: {
    id: string;
    name: string;
    description: string;
  };
  content?: {
    instruction?: string; // AI-generated instruction for CareerContextScreen
    welcomeMessage?: string;
    professionalGuide?: string;
    howCareerUsesSkill?: string;
    professionalSituation?: string;
    challenge?: {
      number: number;
      question: string;
      type: string;
      options?: string[];
      correctAnswer?: string;
    };
    professionalSolution?: string;
    skillHelps?: string;
  };
  onChallengeAnswer?: (answer: string) => void;
  onNext?: () => void;
  onComplete?: (data: any) => void;
  gradeLevel: string;
  subject?: string;
  studentName?: string;
  userId?: string;
  companionId?: string;
  avatarUrl?: string;
  showCareerContext?: boolean; // Control whether to show career context screen
}

interface ChatMessage {
  id: string;
  role: 'user' | 'professional';
  content: string;
  timestamp: Date;
}

export const BentoExperienceCard: React.FC<BentoExperienceCardProps> = ({
  screen = 1,
  career,
  skill,
  content,
  onChallengeAnswer,
  onNext,
  onComplete,
  gradeLevel,
  subject = 'Math',
  studentName = 'Student',
  userId,
  companionId = 'finn',
  avatarUrl,
  showCareerContext = true
}) => {
  const { theme } = useTheme();
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<NodeJS.Timeout | null>(null);
  const [showContextScreen, setShowContextScreen] = useState(showCareerContext && !!content?.instruction);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Visual hierarchy settings
  const hierarchy = VisualHierarchy.SECONDARY;
  const containerType = 'experience';
  
  // Auto-advance after answering
  useEffect(() => {
    if (isAnswered && onNext) {
      const timer = setTimeout(() => {
        onNext();
      }, 3000); // Auto-advance after 3 seconds
      setAutoAdvanceTimer(timer);
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [isAnswered, onNext]);
  
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
  
  const getDetailedGradeCategory = (grade: string): 'elementary-k2' | 'elementary-35' | 'middle' | 'high' => {
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);
    if (gradeNum <= 2) return 'elementary-k2';
    if (gradeNum <= 5) return 'elementary-35';
    if (gradeNum <= 8) return 'middle';
    return 'high';
  };
  
  const gradeCategory = getGradeCategory(gradeLevel);
  const detailedGradeCategory = getDetailedGradeCategory(gradeLevel);
  
  // Get experience type based on grade and subject
  const getExperienceType = (): string => {
    const experienceMap: Record<string, Record<string, string>> = {
      'elementary-k2': {
        'Math': 'manipulatives',
        'Science': 'exploration',
        'Language Arts': 'storytelling',
        'Social Studies': 'roleplay',
        'default': 'discovery'
      },
      'elementary-35': {
        'Math': 'problem-solving',
        'Science': 'experiments',
        'Language Arts': 'writing',
        'Social Studies': 'simulation',
        'default': 'interactive'
      },
      'middle': {
        'Math': 'modeling',
        'Science': 'laboratory',
        'Language Arts': 'composition',
        'Social Studies': 'research',
        'default': 'project'
      },
      'high': {
        'Math': 'application',
        'Science': 'investigation',
        'Language Arts': 'analysis',
        'Social Studies': 'debate',
        'default': 'professional'
      }
    };
    
    return experienceMap[detailedGradeCategory]?.[subject] || 
           experienceMap[detailedGradeCategory]?.['default'] || 'interactive';
  };
  
  const experienceType = getExperienceType();
  
  // Get container styles with visual hierarchy
  const getContainerStyles = () => {
    const baseStyles = hierarchy.getStyles(gradeCategory);
    return {
      ...baseStyles,
      background: hierarchy.getGradient(containerType, theme),
      minHeight: `${hierarchy.minHeight[gradeCategory]}px`
    };
  };
  
  // Handle starting the experience from career context
  const handleStartExperience = () => {
    setShowContextScreen(false);
    setCurrentProgress(10); // Start with 10% progress
  };
  
  // Update progress and check achievements
  const updateProgress = (progress: number) => {
    setCurrentProgress(progress);
    
    // Check for achievement milestones
    if (progress >= 25 && !achievements.includes('quarter')) {
      setAchievements(prev => [...prev, 'quarter']);
      const xp = 5;
      if (userId) {
        pathIQGamification.awardPoints(userId, xp, 'Quarter complete', 'experience');
      }
    }
    if (progress >= 50 && !achievements.includes('half')) {
      setAchievements(prev => [...prev, 'half']);
      const xp = 10;
      if (userId) {
        pathIQGamification.awardPoints(userId, xp, 'Half complete', 'experience');
      }
    }
    if (progress >= 75 && !achievements.includes('threequarter')) {
      setAchievements(prev => [...prev, 'threequarter']);
      const xp = 15;
      if (userId) {
        pathIQGamification.awardPoints(userId, xp, 'Three quarters complete', 'experience');
      }
    }
  };
  
  const handleChallengeAnswer = (answer: string) => {
    if (!isAnswered) {
      setSelectedAnswer(answer);
      setIsAnswered(true);
      
      // Award XP and update progress
      if (answer === content?.challenge?.correctAnswer) {
        const xp = 20; // Experience challenges worth more XP
        if (userId) {
          pathIQGamification.awardPoints(userId, xp, 'Career challenge completed', 'experience');
        }
        setXpEarned(prev => prev + xp);
        setShowXPAnimation(true);
        setTimeout(() => setShowXPAnimation(false), 2000);
        
        // Update progress based on screen
        if (screen === 1) {
          updateProgress(50);
        } else if (screen === 2) {
          updateProgress(100);
          setAchievements(prev => [...prev, 'complete']);
          if (onComplete) {
            setTimeout(() => onComplete({ xpEarned, achievements: [...achievements, 'complete'] }), 3000);
          }
        }
      } else {
        // Still give partial progress for trying
        const currentProg = screen === 1 ? 40 : 90;
        updateProgress(currentProg);
      }
      
      if (onChallengeAnswer) {
        onChallengeAnswer(answer);
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
      const context = `You are a ${career.name} professional helping a grade ${gradeLevel} student understand how ${skill.name} is used in your career. 
                      Be professional but friendly, and use real-world examples.`;
      
      const response = await chatbotService.sendMessage(chatInput, context);
      
      const professionalMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'professional',
        content: response.message,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, professionalMessage]);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsTyping(false);
    }
  };
  
  // Show career context screen first if enabled and has instruction
  if (showContextScreen) {
    return (
      <CareerContextScreen
        instruction={content?.instruction || `Today, we're learning about ${skill.name} as a ${career.name}!`}
        studentName={studentName}
        careerName={career.name}
        gradeLevel={gradeLevel}
        subject={subject}
        skillName={skill.name}
        containerType="experience"
        avatarUrl={avatarUrl}
        companionName={companionId === 'finn' ? 'Finn' : 'Sage'}
        onStart={handleStartExperience}
      />
    );
  }
  
  // Screen 1: Career Introduction
  if (screen === 1) {
    return (
      <div 
        className={`${styles.bentoContainer} ${styles[`grade-${gradeCategory}`]} ${theme === 'dark' ? styles.darkTheme : styles.lightTheme}`}
        style={getContainerStyles()}
      >
        {/* Progress Header */}
        <div className={styles.progressHeader}>
          <div className={styles.progressInfo}>
            <h3 className={styles.experienceTitle}>
              {experienceType === 'manipulatives' && '🧮 '}
              {experienceType === 'exploration' && '🔍 '}
              {experienceType === 'experiments' && '🧪 '}
              {experienceType === 'laboratory' && '⚗️ '}
              {experienceType === 'professional' && '💼 '}
              Experience: {skill.name}
            </h3>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${currentProgress}%` }} />
            </div>
            <span className={styles.progressLabel}>{currentProgress}%</span>
          </div>
          {achievements.length > 0 && (
            <div className={styles.achievements}>
              {achievements.map(a => (
                <span key={a} className={styles.achievementBadge}>
                  {a === 'quarter' && '🥉'}
                  {a === 'half' && '🥈'}
                  {a === 'threequarter' && '🥇'}
                  {a === 'complete' && '🏆'}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Welcome to Career Adventure - HERO Tile */}
        <div className={`${styles.bentoTile} ${styles.heroTile} ${styles.welcomeTile}`}>
          <div className={styles.careerHeader}>
            <span className={styles.careerIcon}>{career.icon}</span>
            <h1 className={styles.careerTitle}>Welcome to Your {career.name} Adventure!</h1>
          </div>
          <div className={styles.welcomeContent}>
            <p className={styles.welcomeMessage}>
              {content?.welcomeMessage || `Today, you'll experience what it's like to be a ${career.name} and see how they use ${skill.name} in their daily work!`}
            </p>
          </div>
        </div>
        
        {/* Meet Your Professional Guide - LARGE Tile */}
        <div className={`${styles.bentoTile} ${styles.largeTile} ${styles.guideTile}`}>
          <h2 className={styles.tileTitle}>Meet Your Professional Guide</h2>
          <div className={styles.guideContent}>
            <div className={styles.guideAvatar}>
              <span className={styles.guideIcon}>👨‍💼</span>
            </div>
            <p className={styles.guideMessage}>
              {content?.professionalGuide || `Hello! I'm a professional ${career.name}. I'll show you how we use ${skill.name} every day in our work. Ready to explore?`}
            </p>
          </div>
        </div>
        
        {/* How This Career Uses Skill - LARGE Tile */}
        <div className={`${styles.bentoTile} ${styles.largeTile} ${styles.skillUseTile}`}>
          <h2 className={styles.tileTitle}>How {career.name}s Use {skill.name}</h2>
          <div className={styles.skillUseContent}>
            <p className={styles.skillDescription}>
              {content?.howCareerUsesSkill || `As a ${career.name}, ${skill.name} is essential for solving problems, making decisions, and completing daily tasks successfully.`}
            </p>
            <div className={styles.skillExamples}>
              <span className={styles.exampleBadge}>📊 Data Analysis</span>
              <span className={styles.exampleBadge}>💡 Problem Solving</span>
              <span className={styles.exampleBadge}>🎯 Decision Making</span>
            </div>
          </div>
        </div>
        
        {/* Professional Chat - MEDIUM Tile */}
        <div className={`${styles.bentoTile} ${styles.mediumTile} ${styles.chatTile}`}>
          <div className={styles.chatHeader}>
            <span className={styles.chatIcon}>💬</span>
            <span className={styles.chatTitle}>Ask the Professional</span>
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
                {chatMessages.map(msg => (
                  <div 
                    key={msg.id}
                    className={`${styles.chatMessage} ${styles[msg.role]}`}
                  >
                    {msg.content}
                  </div>
                ))}
                {isTyping && (
                  <div className={`${styles.chatMessage} ${styles.professional}`}>
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
                  placeholder="Ask about this career..."
                  className={styles.chatInputField}
                />
                <button onClick={handleChatSend} className={styles.chatSendButton}>
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.chatClosed}>
              <p>Have questions? Ask the professional!</p>
            </div>
          )}
        </div>
        
        {/* Continue Button - SMALL Tile */}
        <div className={`${styles.bentoTile} ${styles.smallTile} ${styles.actionTile}`}>
          <button 
            className={styles.continueButton}
            onClick={onNext}
          >
            Start Challenge →
          </button>
        </div>
      </div>
    );
  }
  
  // Screen 2: Professional Challenge
  return (
    <div 
      className={`${styles.bentoContainer} ${styles[`grade-${gradeCategory}`]} ${theme === 'dark' ? styles.darkTheme : styles.lightTheme}`}
      style={getContainerStyles()}
    >
      {/* Progress Header */}
      <div className={styles.progressHeader}>
        <div className={styles.progressInfo}>
          <h3 className={styles.experienceTitle}>
            {experienceType === 'manipulatives' && '🧮 '}
            {experienceType === 'exploration' && '🔍 '}
            {experienceType === 'experiments' && '🧪 '}
            {experienceType === 'laboratory' && '⚗️ '}
            {experienceType === 'professional' && '💼 '}
            Experience: {skill.name}
          </h3>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${currentProgress}%` }} />
          </div>
          <span className={styles.progressLabel}>{currentProgress}%</span>
        </div>
        {achievements.length > 0 && (
          <div className={styles.achievements}>
            {achievements.map(a => (
              <span key={a} className={styles.achievementBadge}>
                {a === 'quarter' && '🥉'}
                {a === 'half' && '🥈'}
                {a === 'threequarter' && '🥇'}
                {a === 'complete' && '🏆'}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Professional Situation - WIDE Tile */}
      <div className={`${styles.bentoTile} ${styles.wideTile} ${styles.situationTile}`}>
        <h2 className={styles.tileTitle}>Professional Situation</h2>
        <p className={styles.situationText}>
          {content?.professionalSituation || `As a ${career.name}, you're facing a real workplace situation that requires ${skill.name}.`}
        </p>
      </div>
      
      {/* The Challenge - HERO Tile */}
      <div className={`${styles.bentoTile} ${styles.heroTile} ${styles.challengeTile}`}>
        <div className={styles.challengeHeader}>
          <span className={styles.challengeNumber}>Challenge {content?.challenge?.number || 1}</span>
          <span className={styles.challengeType}>{content?.challenge?.type || 'Problem Solving'}</span>
          <span className={styles.xpReward}>+15 XP</span>
        </div>
        <div className={styles.challengeContent}>
          <h3 className={styles.challengeQuestion}>
            {content?.challenge?.question || 'How would you solve this professional challenge?'}
          </h3>
        </div>
      </div>
      
      {/* Answer Options */}
      {content?.challenge?.options?.map((option, index) => (
        <div 
          key={index}
          className={`
            ${styles.bentoTile} 
            ${styles.smallTile} 
            ${styles.answerTile}
            ${selectedAnswer === option ? styles.selected : ''}
            ${isAnswered && option === content.challenge?.correctAnswer ? styles.correct : ''}
            ${isAnswered && selectedAnswer === option && option !== content.challenge?.correctAnswer ? styles.incorrect : ''}
          `}
          onClick={() => handleChallengeAnswer(option)}
        >
          <span className={styles.answerLabel}>
            {gradeCategory === 'elementary' ? ['A', 'B', 'C', 'D'][index] : `Option ${index + 1}`}
          </span>
          <span className={styles.answerText}>{option}</span>
        </div>
      ))}
      
      {/* Professional Solution - LARGE Tile */}
      {isAnswered && (
        <div className={`${styles.bentoTile} ${styles.largeTile} ${styles.solutionTile}`}>
          <h3 className={styles.tileTitle}>Professional Solution</h3>
          <p className={styles.solutionText}>
            {content?.professionalSolution || `Here's how a real ${career.name} would approach this challenge...`}
          </p>
        </div>
      )}
      
      {/* How Skill Helps - MEDIUM Tile */}
      {isAnswered && (
        <div className={`${styles.bentoTile} ${styles.mediumTile} ${styles.skillHelpsTile}`}>
          <h3 className={styles.tileTitle}>{skill.name} Helps By:</h3>
          <p className={styles.skillHelpsText}>
            {content?.skillHelps || `Using ${skill.name} allows professionals to analyze the situation, identify patterns, and make informed decisions.`}
          </p>
        </div>
      )}
      
      {/* Response Feedback - Modal Overlay */}
      {isAnswered && (
        <div className={styles.responseModal}>
          <div className={`${styles.responseContent} ${selectedAnswer === content?.challenge?.correctAnswer ? styles.correct : styles.incorrect}`}>
            <span className={styles.responseIcon}>
              {selectedAnswer === content?.challenge?.correctAnswer ? '✅' : '💡'}
            </span>
            <h3 className={styles.responseTitle}>
              {selectedAnswer === content?.challenge?.correctAnswer ? 'Excellent Professional Thinking!' : 'Good Try!'}
            </h3>
            <p className={styles.responseMessage}>
              {selectedAnswer === content?.challenge?.correctAnswer 
                ? `You've shown how ${skill.name} is used in real ${career.name} work!`
                : `Let's see how a professional would handle this...`}
            </p>
            {selectedAnswer === content?.challenge?.correctAnswer && (
              <p className={styles.xpMessage}>+15 XP earned!</p>
            )}
            <p className={styles.autoAdvance}>Auto-advancing to next challenge...</p>
          </div>
        </div>
      )}
      
      {/* XP Animation */}
      {showXPAnimation && (
        <div className={styles.xpAnimation}>
          +15 XP!
        </div>
      )}
    </div>
  );
};