/**
 * AI-FIRST EXPERIENCE CONTAINER
 * Built from scratch to work natively with AI-generated career content
 */

import React, { useState, useEffect } from 'react';
import { aiLearningJourneyService, AIExperienceContent, StudentProfile, LearningSkill } from '../../services/AILearningJourneyService';
import { unifiedLearningAnalyticsService } from '../../services/unifiedLearningAnalyticsService';
import { voiceManagerService } from '../../services/voiceManagerService';
import { companionReactionService } from '../../services/companionReactionService';
import { useAICharacter } from '../ai-characters/AICharacterProvider';
import { AICharacterAvatar } from '../ai-characters/AICharacterAvatar';
import { ContainerNavigationHeader } from './ContainerNavigationHeader';
import { FloatingLearningDock } from '../learning-support/FloatingLearningDock';
import { CompanionChatBox } from '../learning-support/CompanionChatBox';
import { useTheme } from '../../hooks/useTheme';

// ================================================================
// COMPONENT INTERFACES
// ================================================================

interface AIExperienceContainerProps {
  student: StudentProfile;
  skill: LearningSkill;
  selectedCharacter?: string;
  selectedCareer?: any;
  onComplete: (success: boolean) => void;
  onNext: () => void;
  onBack?: () => void;
  userId?: string;
}

type ExperiencePhase = 'loading' | 'career_intro' | 'real_world' | 'simulation' | 'complete';

// ================================================================
// AI EXPERIENCE CONTAINER COMPONENT
// ================================================================

export const AIExperienceContainer: React.FC<AIExperienceContainerProps> = ({
  student,
  skill,
  selectedCharacter,
  selectedCareer,
  onComplete,
  onNext,
  onBack,
  userId
}) => {
  const theme = useTheme();
  
  // AI Character Integration
  const { currentCharacter, generateCharacterResponse, speakMessage, selectCharacter } = useAICharacter();
  
  // Ensure the correct character is selected - normalize to lowercase
  React.useEffect(() => {
    if (selectedCharacter) {
      const normalizedCharacter = selectedCharacter.toLowerCase();
      if (currentCharacter?.id !== normalizedCharacter) {
        selectCharacter(normalizedCharacter);
      }
    }
  }, [selectedCharacter]);
  
  // Wrapped navigation handlers that stop speech
  const handleNavNext = () => {
    voiceManagerService.stopSpeaking();
    onNext();
  };
  
  const handleNavBack = () => {
    if (onBack) {
      voiceManagerService.stopSpeaking();
      onBack();
    }
  };
  
  // ================================================================
  // STATE MANAGEMENT
  // ================================================================
  
  const [phase, setPhase] = useState<ExperiencePhase>('loading');
  const [content, setContent] = useState<AIExperienceContent | null>(null);
  const [currentConnection, setCurrentConnection] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [challengeAnswers, setChallengeAnswers] = useState<Record<number, number>>({});
  const [showChallengeFeedback, setShowChallengeFeedback] = useState<Record<number, boolean>>({});
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [sessionId] = useState(`experience-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  // Floating dock is always visible, no toggle needed
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [companionMessage, setCompanionMessage] = useState<{ text: string; emotion: string } | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);

  // ================================================================
  // CONTENT GENERATION
  // ================================================================

  useEffect(() => {
    generateContent();
  }, [skill, student]);

  const generateContent = async () => {
    
    try {
      // Track session start
      await unifiedLearningAnalyticsService.trackLearningEvent({
        studentId: student.id,
        sessionId,
        eventType: 'experience_start',
        metadata: {
          grade: student.grade_level,
          subject: skill.subject,
          skill: skill.skill_name,
          container: 'experience'
        }
      });

      const generatedContent = await aiLearningJourneyService.generateExperienceContent(skill, student, selectedCareer);
      setContent(generatedContent);
      setPhase('career_intro');
      
      
    } catch (error) {
      console.error('❌ Failed to generate AI Experience content:', error);
      // Could add error state handling here
    }
  };

  // ================================================================
  // SPEECH HELPERS
  // ================================================================
  
  const readTextAloud = async (text: string) => {
    if (!currentCharacter || !speakMessage) return;
    
    // Stop any current speech
    voiceManagerService.stopSpeaking();
    setIsSpeaking(true);
    
    try {
      await speakMessage(text);
    } finally {
      setIsSpeaking(false);
    }
  };
  
  // Greet on career intro phase
  useEffect(() => {
    if (phase === 'career_intro' && content && !hasGreeted && currentCharacter) {
      setHasGreeted(true);
      const greeting = `Welcome to your career experience, ${student.display_name}! Today you'll be a ${selectedCareer?.name || 'professional'} using ${skill.skill_name}!`;
      readTextAloud(greeting);
      
      // Show companion message
      const reaction = companionReactionService.getCompanionReaction(
        'lesson_start',
        currentCharacter.id,
        { skill: skill.skill_name, career: selectedCareer?.name }
      );
      setCompanionMessage({ text: reaction.message, emotion: reaction.emotion });
    }
  }, [phase, content, hasGreeted, currentCharacter]);
  
  // ================================================================
  // NAVIGATION HANDLERS
  // ================================================================

  const handleCareerIntroComplete = async () => {
    await unifiedLearningAnalyticsService.trackLearningEvent({
      studentId: student.id,
      sessionId,
      eventType: 'career_intro_complete',
      metadata: {
        grade: student.grade_level,
        subject: skill.subject,
        skill: skill.skill_name,
        container: 'experience'
      }
    });

    setPhase('real_world');
  };

  const handleConnectionNext = () => {
    if (!content) return;
    
    if (currentConnection < content.real_world_connections.length - 1) {
      setCurrentConnection(currentConnection + 1);
    } else {
      setPhase('simulation');
    }
  };

  const handleChallengeAnswer = async (challengeIndex: number, answerIndex: number) => {
    if (!content) return;

    setChallengeAnswers(prev => ({ ...prev, [challengeIndex]: answerIndex }));
    setShowChallengeFeedback(prev => ({ ...prev, [challengeIndex]: true }));

    const challenge = content.interactive_simulation.challenges[challengeIndex];
    const isCorrect = answerIndex === challenge.correct_choice;
    
    // Get companion reaction
    const reaction = companionReactionService.getCompanionReaction(
      isCorrect ? 'correct_answer' : 'incorrect_answer',
      currentCharacter?.id || 'finn',
      {
        skill: skill.skill_name,
        career: selectedCareer?.name,
        attempts: 1
      }
    );
    
    // Show companion message
    setCompanionMessage({ text: reaction.message, emotion: reaction.emotion });
    
    // Speak feedback
    if (isCorrect) {
      readTextAloud(`${reaction.message} ${challenge.outcome}`);
    } else {
      readTextAloud(`${reaction.message} Let's think about this differently.`);
    }

    // Track challenge attempt
    await unifiedLearningAnalyticsService.trackLearningEvent({
      studentId: student.id,
      sessionId,
      eventType: 'simulation_challenge',
      metadata: {
        grade: student.grade_level,
        subject: skill.subject,
        skill: skill.skill_name,
        container: 'experience',
        challenge_number: challengeIndex + 1,
        accuracy: isCorrect ? 100 : 0
      }
    });

    // Auto-advance after feedback
    setTimeout(() => {
      if (challengeIndex < content.interactive_simulation.challenges.length - 1) {
        setCurrentChallenge(challengeIndex + 1);
        setShowChallengeFeedback(prev => ({ ...prev, [challengeIndex]: false }));
      } else {
        setSimulationComplete(true);
        setTimeout(() => {
          setPhase('complete');
          onComplete(true);
        }, 3000);
      }
    }, 4000);
  };

  // ================================================================
  // HINT SYSTEM
  // ================================================================
  
  const handleHintRequest = (hintLevel: 'free' | 'basic' | 'detailed') => {
    let hint = '';
    
    if (phase === 'simulation' && content?.interactive_simulation.challenges[currentChallenge]) {
      const challenge = content.interactive_simulation.challenges[currentChallenge];
      if (hintLevel === 'free') {
        hint = `Think about what a professional would do in this situation...`;
      } else if (hintLevel === 'basic') {
        hint = `Consider the most practical approach for this career scenario.`;
      } else if (hintLevel === 'detailed') {
        hint = `The best choice is option ${challenge.correct_choice + 1}. ${challenge.learning_point}`;
      }
    } else if (phase === 'real_world') {
      if (hintLevel === 'free') {
        hint = `Notice how professionals use ${skill.skill_name} in real situations...`;
      } else if (hintLevel === 'basic') {
        hint = `Think about how the skills you learned apply to this career.`;
      } else if (hintLevel === 'detailed') {
        hint = `This shows how ${skill.skill_name} is essential in professional settings.`;
      }
    }
    
    setCurrentHint(hint);
    
    // Auto-clear hint after 10 seconds
    setTimeout(() => setCurrentHint(null), 10000);
  };

  // ================================================================
  // RENDER WRAPPER WITH SIDEBAR
  // ================================================================
  
  const renderWithDock = (mainContent: React.ReactNode) => {
    return (
      <>
        {mainContent}
        
        {/* AI Character Avatar */}
        {currentCharacter && (
          <AICharacterAvatar
            character={currentCharacter}
            position="bottom-right"
            size="medium"
            isAnimating={isSpeaking}
            emotion={companionMessage?.emotion || 'happy'}
          />
        )}
        
        {/* Companion Chat Box */}
        {companionMessage && (
          <CompanionChatBox
            message={companionMessage.text}
            companionName={currentCharacter?.name || 'Finn'}
            position="bottom-left"
            theme={theme}
            autoHide={true}
            duration={5000}
          />
        )}
        
        <FloatingLearningDock
          companionName={currentCharacter?.name || selectedCharacter?.charAt(0).toUpperCase() + selectedCharacter?.slice(1) || 'Finn'}
          companionId={currentCharacter?.id || selectedCharacter?.toLowerCase() || 'finn'}
          userId={userId || student?.id || 'default'}
          currentQuestion={phase === 'simulation' ? content?.interactive_simulation.challenges[currentChallenge]?.description : undefined}
          currentSkill={skill.skill_name}
          questionNumber={phase === 'simulation' ? currentChallenge + 1 : undefined}
          totalQuestions={phase === 'simulation' ? content?.interactive_simulation.challenges?.length || 0 : 0}
          onRequestHint={handleHintRequest}
          theme={theme}
        />
        
        {/* Display hint overlay if active */}
        {currentHint && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            color: 'white',
            padding: '15px 25px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)',
            maxWidth: '500px',
            zIndex: 1000,
            animation: 'slideUp 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>💡</span>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{currentHint}</p>
            </div>
          </div>
        )}
      </>
    );
  };

  // ================================================================
  // LOADING STATE
  // ================================================================

  if (phase === 'loading' || !content) {
    return (
      <div className="ai-experience-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h2>🎯 Creating your career experience...</h2>
          <p>Connecting {skill.skill_name} to real-world careers for {student.display_name}</p>
          <div className="loading-details">
            <p>🏢 Career: Exploring professions</p>
            <p>📚 Skill: {skill.skill_name}</p>
            <p>🎯 Subject: {skill.subject}</p>
            <p>👤 Grade: {student.grade_level}</p>
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // CAREER INTRODUCTION PHASE
  // ================================================================

  if (phase === 'career_intro') {
    return (
      <div className="ai-experience-container">
        {onBack && (
          <ContainerNavigationHeader 
            onBack={onBack} 
            title="Career Experience" 
            theme={theme}
          />
        )}
        <div className="career-intro-phase" style={{ paddingTop: onBack ? '5rem' : '0' }}>
          <header className="phase-header">
            <h1>{content.title}</h1>
            <div className="career-badge">
              <span className="badge-icon">🏢</span>
              <span className="badge-text">Career Experience</span>
            </div>
          </header>

          <section className="scenario-section">
            <h2>🌟 Welcome to Your Career Adventure!</h2>
            <div className="scenario-content">
              <p className="scenario-text">{content.scenario}</p>
            </div>
          </section>

          <section className="character-section">
            <h2>👥 Meet Your Professional Guide</h2>
            <div className="character-introduction">
              <p className="character-text">{content.character_context}</p>
            </div>
          </section>

          <section className="career-connection-section">
            <h2>🔗 How This Career Uses {skill.skill_name}</h2>
            <div className="career-introduction">
              <p className="career-text">{content.career_introduction}</p>
            </div>
          </section>

          <div className="phase-actions">
            <button
              onClick={handleCareerIntroComplete}
              className="primary-button"
            >
              Explore Real-World Applications 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // REAL WORLD CONNECTIONS PHASE
  // ================================================================

  if (phase === 'real_world') {
    const connection = content.real_world_connections[currentConnection];

    return (
      <div className="ai-experience-container">
        {onBack && (
          <ContainerNavigationHeader 
            onBack={onBack} 
            title="Real-World Applications" 
            theme={theme}
          />
        )}
        <div className="real-world-phase" style={{ paddingTop: onBack ? '5rem' : '0' }}>
          <header className="phase-header">
            <h1>🌍 Real-World Applications</h1>
            <div className="progress-indicator">
              Connection {currentConnection + 1} of {content.real_world_connections.length}
            </div>
          </header>

          <div className="connection-card">
            <div className="connection-situation">
              <h2>📋 Professional Situation</h2>
              <p>{connection.situation}</p>
            </div>

            <div className="connection-challenge">
              <h2>⚡ The Challenge</h2>
              <p>{connection.challenge}</p>
            </div>

            <div className="connection-solution">
              <h2>💡 Professional Solution</h2>
              <p>{connection.solution_approach}</p>
            </div>

            <div className="connection-learning">
              <h2>🎯 How {skill.skill_name} Helps</h2>
              <p className="learning-connection">{connection.learning_connection}</p>
            </div>
          </div>

          <div className="connection-navigation">
            <div className="connection-dots">
              {content.real_world_connections.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentConnection(index)}
                  className={`connection-dot ${index === currentConnection ? 'active' : ''} ${index < currentConnection ? 'completed' : ''}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleConnectionNext}
              className="primary-button"
            >
              {currentConnection < content.real_world_connections.length - 1 
                ? 'Next Connection →' 
                : 'Start Professional Simulation 🎮'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // INTERACTIVE SIMULATION PHASE
  // ================================================================

  if (phase === 'simulation') {
    const challenge = content.interactive_simulation.challenges[currentChallenge];
    const userAnswer = challengeAnswers[currentChallenge];
    const showFeedback = showChallengeFeedback[currentChallenge];

    return renderWithDock(
      <div className="ai-experience-container">
        {onBack && (
          <ContainerNavigationHeader 
            onBack={onBack} 
            title="Professional Simulation" 
            theme={theme}
          />
        )}
        <div className="simulation-phase" style={{ paddingTop: onBack ? '5rem' : '0' }}>
          <header className="phase-header">
            <h1>🎮 Professional Simulation</h1>
            <div className="simulation-intro">
              <p>{content.interactive_simulation.setup}</p>
            </div>
            <div className="progress-indicator">
              Challenge {currentChallenge + 1} of {content.interactive_simulation.challenges.length}
            </div>
          </header>

          <div className="challenge-scenario">
            <h2>🎯 Your Professional Challenge</h2>
            <p className="challenge-description">{challenge.description}</p>
            
            <div className="challenge-choices">
              <h3>What would you do as a professional?</h3>
              {challenge.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !showFeedback && handleChallengeAnswer(currentChallenge, index)}
                  className={`choice-button ${
                    userAnswer === index ? 'selected' : ''
                  } ${
                    showFeedback && index === challenge.correct_choice ? 'correct' : ''
                  } ${
                    showFeedback && userAnswer === index && index !== challenge.correct_choice ? 'incorrect' : ''
                  }`}
                  disabled={showFeedback}
                >
                  {option}
                </button>
              ))}
            </div>

            {showFeedback && (
              <div className={`challenge-feedback ${userAnswer === challenge.correct_choice ? 'correct' : 'learning'}`}>
                <div className="feedback-result">
                  {userAnswer === challenge.correct_choice 
                    ? '🎉 Excellent professional judgment!' 
                    : '💡 Great learning opportunity!'}
                </div>
                <div className="feedback-outcome">
                  <strong>What happens:</strong> {challenge.outcome}
                </div>
                <div className="feedback-learning">
                  <strong>Professional insight:</strong> {challenge.learning_point}
                </div>
              </div>
            )}
          </div>

          {simulationComplete && (
            <div className="simulation-complete">
              <h2>🏆 Simulation Complete!</h2>
              <p>{content.interactive_simulation.conclusion}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ================================================================
  // COMPLETION PHASE
  // ================================================================

  if (phase === 'complete') {
    return (
      <div className="ai-experience-container">
        {onBack && (
          <ContainerNavigationHeader 
            onBack={onBack} 
            title="Experience Complete" 
            theme={theme}
          />
        )}
        <div className="completion-phase" style={{ paddingTop: onBack ? '5rem' : '0' }}>
          <header className="completion-header">
            <h1>🎉 Career Experience Complete!</h1>
            <p>You've successfully applied {skill.skill_name} like a professional, {student.display_name}!</p>
          </header>

          <div className="completion-summary">
            <div className="career-mastery">
              <h2>🏢 Professional Skills Developed:</h2>
              <ul>
                <li>Applied {skill.skill_name} in real-world scenarios</li>
                <li>Made professional decisions</li>
                <li>Solved workplace challenges</li>
                <li>Connected learning to career applications</li>
              </ul>
            </div>
            
            <div className="next-adventure">
              <h2>🔍 Ready for More Discovery?</h2>
              <p>Now let's explore the amazing world of {skill.skill_name} through discovery and creativity!</p>
            </div>
          </div>

          <div className="completion-actions">
            <button
              onClick={onNext}
              className="next-container-button"
            >
              Continue to Discover 🔍
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// ================================================================
// STYLES
// ================================================================

const styles = `
.ai-experience-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #f59e0b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 2rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-details {
  margin-top: 2rem;
  color: #666;
}

.phase-header {
  text-align: center;
  margin-bottom: 3rem;
}

.phase-header h1 {
  color: #1f2937;
  margin-bottom: 1rem;
}

.career-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  font-weight: 600;
}

.badge-icon {
  font-size: 1.2rem;
}

.scenario-section, .character-section, .career-connection-section {
  background: #fef3c7;
  border: 2px solid #f59e0b;
  padding: 2rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
}

.scenario-text, .character-text, .career-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #92400e;
}

.connection-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.connection-card > div {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.connection-card > div:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.connection-situation h2 {
  color: #6b7280;
  margin-bottom: 1rem;
}

.connection-challenge h2 {
  color: #dc2626;
  margin-bottom: 1rem;
}

.connection-solution h2 {
  color: #059669;
  margin-bottom: 1rem;
}

.connection-learning h2 {
  color: #7c3aed;
  margin-bottom: 1rem;
}

.learning-connection {
  background: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 4px solid #7c3aed;
  font-weight: 500;
}

.connection-navigation {
  text-align: center;
}

.connection-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.connection-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  background: white;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.connection-dot.active {
  background: #f59e0b;
  color: white;
  border-color: #f59e0b;
}

.connection-dot.completed {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.simulation-intro {
  background: #f0f9ff;
  border: 2px solid #0ea5e9;
  padding: 1.5rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
}

.challenge-scenario {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.challenge-description {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 0.5rem;
  border-left: 4px solid #0ea5e9;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.challenge-choices {
  margin: 2rem 0;
}

.challenge-choices h3 {
  margin-bottom: 1.5rem;
  color: #374151;
}

.choice-button {
  display: block;
  width: 100%;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  font-size: 1rem;
}

.choice-button:hover {
  border-color: #f59e0b;
  background: #fef3c7;
}

.choice-button.selected {
  border-color: #f59e0b;
  background: #fef3c7;
}

.choice-button.correct {
  border-color: #10b981;
  background: #ecfdf5;
}

.choice-button.incorrect {
  border-color: #ef4444;
  background: #fef2f2;
}

.challenge-feedback {
  margin-top: 2rem;
  padding: 2rem;
  border-radius: 1rem;
}

.challenge-feedback.correct {
  background: #ecfdf5;
  border: 2px solid #10b981;
}

.challenge-feedback.learning {
  background: #fef3c7;
  border: 2px solid #f59e0b;
}

.feedback-result {
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.feedback-outcome, .feedback-learning {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.simulation-complete {
  text-align: center;
  background: #ecfdf5;
  border: 2px solid #10b981;
  padding: 2rem;
  border-radius: 1rem;
  margin-top: 2rem;
}

.primary-button, .next-container-button {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.primary-button:hover, .next-container-button:hover {
  transform: translateY(-2px);
}

.phase-actions, .completion-actions {
  text-align: center;
  margin-top: 3rem;
}

.progress-indicator {
  background: #e5e7eb;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  display: inline-block;
  color: #6b7280;
  font-weight: 500;
}

.completion-phase {
  text-align: center;
  padding: 2rem;
}

.completion-summary {
  margin: 3rem 0;
}

.career-mastery, .next-adventure {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  margin: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.career-mastery ul {
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
  padding-left: 1.5rem;
}

.career-mastery li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default AIExperienceContainer;