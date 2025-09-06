/**
 * AI-FIRST DISCOVER CONTAINER
 * Built from scratch to work natively with AI-generated discovery content
 */

import React, { useState, useEffect } from 'react';
import { aiLearningJourneyService, AIDiscoverContent, StudentProfile, LearningSkill } from '../../services/AILearningJourneyService';
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

interface AIDiscoverContainerProps {
  student: StudentProfile;
  skill: LearningSkill;
  selectedCharacter?: string;
  selectedCareer?: any;
  onComplete: (success: boolean) => void;
  onNext?: () => void;
  onBack?: () => void;
  userId?: string;
}

type DiscoverPhase = 'loading' | 'exploration_intro' | 'discovery_paths' | 'activities' | 'reflection' | 'complete';

// ================================================================
// AI DISCOVER CONTAINER COMPONENT
// ================================================================

export const AIDiscoverContainer: React.FC<AIDiscoverContainerProps> = ({
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
    if (onNext) onNext();
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
  
  const [phase, setPhase] = useState<DiscoverPhase>('loading');
  const [content, setContent] = useState<AIDiscoverContent | null>(null);
  const [selectedPath, setSelectedPath] = useState<number | null>(null);
  const [currentActivity, setCurrentActivity] = useState(0);
  const [completedActivities, setCompletedActivities] = useState<Record<number, boolean>>({});
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<number, string>>({});
  const [allActivitiesComplete, setAllActivitiesComplete] = useState(false);
  const [sessionId] = useState(`discover-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
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
        eventType: 'discovery_start',
        metadata: {
          grade: student.grade_level,
          subject: skill.subject,
          skill: skill.skill_name,
          container: 'discover'
        }
      });

      const generatedContent = await aiLearningJourneyService.generateDiscoverContent(skill, student, selectedCareer);
      setContent(generatedContent);
      setPhase('exploration_intro');
      
      
    } catch (error) {
      console.error('❌ Failed to generate AI Discover content:', error);
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
  
  // Greet on exploration intro phase
  useEffect(() => {
    if (phase === 'exploration_intro' && content && !hasGreeted && currentCharacter) {
      setHasGreeted(true);
      const greeting = `Welcome to discovery time, ${student.display_name}! Let's explore the amazing world of ${skill.skill_name}!`;
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

  const handleExplorationIntroComplete = async () => {
    await unifiedLearningAnalyticsService.trackLearningEvent({
      studentId: student.id,
      sessionId,
      eventType: 'exploration_intro_complete',
      metadata: {
        grade: student.grade_level,
        subject: skill.subject,
        skill: skill.skill_name,
        container: 'discover'
      }
    });

    setPhase('discovery_paths');
  };

  const handlePathSelection = async (pathIndex: number) => {
    setSelectedPath(pathIndex);
    setCurrentActivity(0);
    
    await unifiedLearningAnalyticsService.trackLearningEvent({
      studentId: student.id,
      sessionId,
      eventType: 'discovery_path_selected',
      metadata: {
        grade: student.grade_level,
        subject: skill.subject,
        skill: skill.skill_name,
        container: 'discover',
        path_index: pathIndex,
        path_name: content?.discovery_paths[pathIndex]?.path_name
      }
    });

    setPhase('activities');
  };

  const handleActivityComplete = async (activityIndex: number) => {
    if (!content || selectedPath === null) return;

    setCompletedActivities(prev => ({ ...prev, [activityIndex]: true }));
    
    const path = content.discovery_paths[selectedPath];
    const activity = path.activities[activityIndex];
    
    // Get companion reaction for completing activity
    const reaction = companionReactionService.getCompanionReaction(
      'correct_answer',
      currentCharacter?.id || 'finn',
      {
        skill: skill.skill_name,
        career: selectedCareer?.name
      }
    );
    
    setCompanionMessage({ text: reaction.message, emotion: reaction.emotion });
    readTextAloud(`Great job completing ${activity.title}! ${reaction.message}`);

    await unifiedLearningAnalyticsService.trackLearningEvent({
      studentId: student.id,
      sessionId,
      eventType: 'discovery_activity_complete',
      metadata: {
        grade: student.grade_level,
        subject: skill.subject,
        skill: skill.skill_name,
        container: 'discover',
        activity_type: activity.activity_type,
        activity_title: activity.title
      }
    });

    // Check if all activities in this path are complete
    const totalActivities = path.activities.length;
    const completedCount = Object.keys(completedActivities).length + 1; // +1 for current completion

    if (completedCount >= totalActivities) {
      setAllActivitiesComplete(true);
      setTimeout(() => {
        setPhase('reflection');
      }, 2000);
    } else if (activityIndex < totalActivities - 1) {
      setCurrentActivity(activityIndex + 1);
    }
  };

  const handleReflectionAnswer = (questionIndex: number, answer: string) => {
    setReflectionAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleReflectionComplete = async () => {
    await unifiedLearningAnalyticsService.trackLearningEvent({
      studentId: student.id,
      sessionId,
      eventType: 'discovery_reflection_complete',
      metadata: {
        grade: student.grade_level,
        subject: skill.subject,
        skill: skill.skill_name,
        container: 'discover',
        reflection_count: Object.keys(reflectionAnswers).length
      }
    });

    setPhase('complete');
    onComplete(true);
  };

  // ================================================================
  // HINT SYSTEM
  // ================================================================
  
  const handleHintRequest = (hintLevel: 'free' | 'basic' | 'detailed') => {
    let hint = '';
    
    if (phase === 'activities' && selectedPath !== null && content) {
      const activity = content.discovery_paths[selectedPath].activities[currentActivity];
      if (hintLevel === 'free') {
        hint = `Think about what you're discovering with this activity...`;
      } else if (hintLevel === 'basic') {
        hint = `Remember: ${activity.activity_type} activities help you explore ${skill.skill_name} in new ways.`;
      } else if (hintLevel === 'detailed') {
        hint = `${activity.expected_outcome}`;
      }
    } else if (phase === 'reflection') {
      if (hintLevel === 'free') {
        hint = `Reflect on what you've learned and how it connects to your journey...`;
      } else if (hintLevel === 'basic') {
        hint = `Think about how ${skill.skill_name} applies to different areas of life and learning.`;
      } else if (hintLevel === 'detailed') {
        hint = `Consider how your discoveries relate to what you learned and experienced in careers.`;
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
          currentQuestion={phase === 'activities' && selectedPath !== null && content ? 
                         content.discovery_paths[selectedPath].activities[currentActivity]?.instructions : undefined}
          currentSkill={skill.skill_name}
          questionNumber={phase === 'activities' ? currentActivity + 1 : undefined}
          totalQuestions={phase === 'activities' && selectedPath !== null && content ? 
                        content.discovery_paths[selectedPath].activities?.length || 0 : 0}
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
            background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
            color: 'white',
            padding: '15px 25px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
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
      <div className="ai-discover-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h2>🔍 Creating your discovery adventure...</h2>
          <p>Unlocking the mysteries of {skill.skill_name} for {student.display_name}</p>
          <div className="loading-details">
            <p>🎒 Adventure: Ready for exploration</p>
            <p>📚 Skill: {skill.skill_name}</p>
            <p>🎯 Subject: {skill.subject}</p>
            <p>👤 Grade: {student.grade_level}</p>
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // EXPLORATION INTRODUCTION PHASE
  // ================================================================

  if (phase === 'exploration_intro') {
    return (
      <div className="ai-discover-container">
        {onBack && (
          <ContainerNavigationHeader 
            onBack={onBack} 
            title="Explore & Discover" 
            theme={theme}
          />
        )}
        <div className="exploration-intro-phase" style={{ paddingTop: onBack ? '5rem' : '0' }}>
          <header className="phase-header">
            <h1>{content.title}</h1>
            <div className="discovery-badge">
              <span className="badge-icon">🔍</span>
              <span className="badge-text">Discovery Adventure</span>
            </div>
          </header>

          <section className="exploration-theme-section">
            <h2>🌟 Your Discovery Theme</h2>
            <div className="theme-content">
              <p className="theme-text">{content.exploration_theme}</p>
            </div>
          </section>

          <section className="curiosity-section">
            <h2>🤔 Questions to Spark Your Curiosity</h2>
            <div className="curiosity-questions">
              {content.curiosity_questions.map((question, index) => (
                <div key={index} className="curiosity-card">
                  <div className="question-icon">❓</div>
                  <p className="question-text">{question}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="adventure-preview">
            <h2>🗺️ Choose Your Discovery Adventure</h2>
            <p>You're about to embark on an exciting journey to explore {skill.skill_name} in ways you've never imagined!</p>
          </section>

          <div className="phase-actions">
            <button
              onClick={handleExplorationIntroComplete}
              className="primary-button"
            >
              Begin Your Discovery Journey 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // DISCOVERY PATHS SELECTION PHASE
  // ================================================================

  if (phase === 'discovery_paths') {
    return (
      <div className="ai-discover-container">
        {onBack && (
          <ContainerNavigationHeader 
            onBack={onBack} 
            title="Discovery Paths" 
            theme={theme}
          />
        )}
        <div className="discovery-paths-phase" style={{ paddingTop: onBack ? '5rem' : '0' }}>
          <header className="phase-header">
            <h1>🗺️ Choose Your Discovery Path</h1>
            <p>Each path offers a unique way to explore {skill.skill_name}. Which adventure calls to you, {student.display_name}?</p>
          </header>

          <div className="paths-grid">
            {content.discovery_paths.map((path, index) => (
              <div 
                key={index} 
                className="path-card"
                onClick={() => handlePathSelection(index)}
              >
                <div className="path-header">
                  <h3>{path.path_name}</h3>
                  <div className="path-type-badge">
                    Path {index + 1}
                  </div>
                </div>
                
                <div className="path-description">
                  <p>{path.description}</p>
                </div>

                <div className="path-activities-preview">
                  <h4>🎯 Activities You'll Do:</h4>
                  <ul>
                    {path.activities.slice(0, 3).map((activity, actIndex) => (
                      <li key={actIndex}>
                        <span className="activity-icon">
                          {activity.activity_type === 'research' && '📚'}
                          {activity.activity_type === 'experiment' && '🧪'}
                          {activity.activity_type === 'create' && '🎨'}
                          {activity.activity_type === 'explore' && '🔍'}
                        </span>
                        {activity.title}
                      </li>
                    ))}
                    {path.activities.length > 3 && (
                      <li className="more-activities">
                        And {path.activities.length - 3} more activities...
                      </li>
                    )}
                  </ul>
                </div>

                <div className="path-selection">
                  <button className="select-path-button">
                    Choose This Path 🎯
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // ACTIVITIES PHASE
  // ================================================================

  if (phase === 'activities' && selectedPath !== null) {
    const path = content.discovery_paths[selectedPath];
    const activity = path.activities[currentActivity];
    const isCompleted = completedActivities[currentActivity];

    return renderWithDock(
      <div className="ai-discover-container">
        {onBack && (
          <ContainerNavigationHeader 
            onBack={onBack} 
            title="Discovery Activities" 
            theme={theme}
          />
        )}
        <div className="activities-phase" style={{ paddingTop: onBack ? '5rem' : '0' }}>
          <header className="phase-header">
            <h1>🎯 {path.path_name}</h1>
            <div className="activity-progress">
              Activity {currentActivity + 1} of {path.activities.length}
            </div>
          </header>

          <div className="activity-card">
            <div className="activity-header">
              <div className="activity-type-icon">
                {activity.activity_type === 'research' && '📚'}
                {activity.activity_type === 'experiment' && '🧪'}
                {activity.activity_type === 'create' && '🎨'}
                {activity.activity_type === 'explore' && '🔍'}
              </div>
              <h2>{activity.title}</h2>
              <div className="activity-type-badge">
                {activity.activity_type.charAt(0).toUpperCase() + activity.activity_type.slice(1)}
              </div>
            </div>

            <div className="activity-instructions">
              <h3>📋 What You'll Do</h3>
              <p>{activity.instructions}</p>
            </div>

            <div className="activity-outcome">
              <h3>🎉 What You'll Discover</h3>
              <p>{activity.expected_outcome}</p>
            </div>

            {!isCompleted && (
              <div className="activity-actions">
                <button
                  onClick={() => handleActivityComplete(currentActivity)}
                  className="complete-activity-button"
                >
                  Mark as Complete ✅
                </button>
              </div>
            )}

            {isCompleted && (
              <div className="activity-completed">
                <div className="completion-message">
                  <span className="completion-icon">🎉</span>
                  <span>Activity Complete! Great exploration!</span>
                </div>
              </div>
            )}
          </div>

          {allActivitiesComplete && (
            <div className="path-complete-message">
              <h2>🏆 Path Complete!</h2>
              <p>You've successfully completed all activities in the {path.path_name} path!</p>
              <p>Time for reflection on your discoveries...</p>
            </div>
          )}

          <div className="activity-navigation">
            <div className="activity-dots">
              {path.activities.map((_, index) => (
                <div
                  key={index}
                  className={`activity-dot ${
                    index === currentActivity ? 'current' : ''
                  } ${
                    completedActivities[index] ? 'completed' : ''
                  }`}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // REFLECTION PHASE
  // ================================================================

  if (phase === 'reflection' && selectedPath !== null) {
    const path = content.discovery_paths[selectedPath];

    return (
      <div className="ai-discover-container">
        {onBack && (
          <ContainerNavigationHeader 
            onBack={onBack} 
            title="Reflection" 
            theme={theme}
          />
        )}
        <div className="reflection-phase" style={{ paddingTop: onBack ? '5rem' : '0' }}>
          <header className="phase-header">
            <h1>💭 Time to Reflect</h1>
            <p>Think about your amazing discoveries, {student.display_name}!</p>
          </header>

          <div className="reflection-content">
            <div className="path-summary">
              <h2>🎯 Your Discovery Journey: {path.path_name}</h2>
              <p>You completed {path.activities.length} activities and made incredible discoveries!</p>
            </div>

            <div className="reflection-questions">
              <h2>🤔 Reflection Questions</h2>
              {path.reflection_questions.map((question, index) => (
                <div key={index} className="reflection-question-card">
                  <h3>Question {index + 1}</h3>
                  <p className="question-text">{question}</p>
                  <textarea
                    placeholder="Share your thoughts..."
                    value={reflectionAnswers[index] || ''}
                    onChange={(e) => handleReflectionAnswer(index, e.target.value)}
                    className="reflection-textarea"
                    rows={4}
                  />
                </div>
              ))}
            </div>

            <div className="connections-section">
              <h2>🔗 Making Connections</h2>
              
              <div className="connection-card">
                <h3>📚 Back to Learning</h3>
                <p>{content.connections.to_learn}</p>
              </div>

              <div className="connection-card">
                <h3>🏢 Career Applications</h3>
                <p>{content.connections.to_experience}</p>
              </div>

              <div className="connection-card">
                <h3>🚀 Future Learning</h3>
                <p>{content.connections.to_future_learning}</p>
              </div>
            </div>
          </div>

          <div className="phase-actions">
            <button
              onClick={handleReflectionComplete}
              className="primary-button"
              disabled={Object.keys(reflectionAnswers).length === 0}
            >
              Complete My Discovery Journey 🌟
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // COMPLETION PHASE
  // ================================================================

  if (phase === 'complete') {
    return (
      <div className="ai-discover-container">
        {onBack && (
          <ContainerNavigationHeader 
            onBack={onBack} 
            title="Discovery Complete" 
            theme={theme}
          />
        )}
        <div className="completion-phase" style={{ paddingTop: onBack ? '5rem' : '0' }}>
          <header className="completion-header">
            <h1>🎉 Discovery Journey Complete!</h1>
            <p>You've become an explorer of {skill.skill_name}, {student.display_name}!</p>
          </header>

          <div className="completion-summary">
            <div className="discovery-achievements">
              <h2>🏆 Your Discovery Achievements:</h2>
              <ul>
                <li>🔍 Explored new aspects of {skill.skill_name}</li>
                <li>🎯 Completed hands-on discovery activities</li>
                <li>🤔 Reflected on your learning journey</li>
                <li>🔗 Made connections to future learning</li>
                <li>🌟 Developed curiosity and wonder</li>
              </ul>
            </div>
            
            <div className="journey-celebration">
              <h2>🌈 Congratulations!</h2>
              <p>You've completed an amazing three-part learning journey:</p>
              <div className="journey-steps">
                <div className="journey-step completed">
                  <span className="step-icon">📚</span>
                  <span className="step-name">Learn</span>
                  <span className="step-description">Mastered the basics</span>
                </div>
                <div className="journey-step completed">
                  <span className="step-icon">🎯</span>
                  <span className="step-name">Experience</span>
                  <span className="step-description">Applied in careers</span>
                </div>
                <div className="journey-step completed">
                  <span className="step-icon">🔍</span>
                  <span className="step-name">Discover</span>
                  <span className="step-description">Explored deeply</span>
                </div>
              </div>
            </div>
          </div>

          <div className="completion-actions">
            {onNext ? (
              <button
                onClick={onNext}
                className="next-container-button"
              >
                Continue Learning Journey 🚀
              </button>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className="restart-button"
              >
                Start New Adventure 🌟
              </button>
            )}
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
.ai-discover-container {
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
  border-top: 3px solid #8b5cf6;
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

.discovery-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  font-weight: 600;
}

.badge-icon {
  font-size: 1.2rem;
}

.exploration-theme-section {
  background: #f3f4f6;
  border: 2px solid #8b5cf6;
  padding: 2rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
}

.theme-text {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #4c1d95;
  text-align: center;
}

.curiosity-section {
  margin-bottom: 3rem;
}

.curiosity-questions {
  display: grid;
  gap: 1rem;
}

.curiosity-card {
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.curiosity-card:hover {
  border-color: #8b5cf6;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(139, 92, 246, 0.1);
}

.question-icon {
  font-size: 2rem;
  margin-right: 1rem;
  color: #8b5cf6;
}

.question-text {
  font-size: 1.1rem;
  color: #374151;
  margin: 0;
}

.adventure-preview {
  background: #ede9fe;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  margin-bottom: 2rem;
}

.paths-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.path-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.path-card:hover {
  border-color: #8b5cf6;
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(139, 92, 246, 0.15);
}

.path-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.path-header h3 {
  color: #1f2937;
  margin: 0;
}

.path-type-badge {
  background: #8b5cf6;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.path-description {
  margin-bottom: 1.5rem;
}

.path-activities-preview h4 {
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.path-activities-preview ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.path-activities-preview li {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #4b5563;
}

.activity-icon {
  margin-right: 0.5rem;
  font-size: 1rem;
}

.more-activities {
  font-style: italic;
  color: #6b7280;
}

.select-path-button {
  width: 100%;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
  margin-top: 1rem;
}

.select-path-button:hover {
  transform: translateY(-2px);
}

.activity-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.activity-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.activity-type-icon {
  font-size: 3rem;
  color: #8b5cf6;
}

.activity-type-badge {
  background: #ede9fe;
  color: #7c3aed;
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-weight: 600;
  margin-left: auto;
}

.activity-instructions, .activity-outcome {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;
}

.activity-instructions h3, .activity-outcome h3 {
  color: #374151;
  margin-bottom: 1rem;
}

.complete-activity-button {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.complete-activity-button:hover {
  transform: translateY(-2px);
}

.activity-completed {
  background: #ecfdf5;
  border: 2px solid #10b981;
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
}

.completion-icon {
  font-size: 1.5rem;
  margin-right: 0.5rem;
}

.path-complete-message {
  background: #fef3c7;
  border: 2px solid #f59e0b;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  margin-bottom: 2rem;
}

.activity-navigation {
  text-align: center;
}

.activity-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.activity-dot {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.875rem;
}

.activity-dot.current {
  border-color: #8b5cf6;
  background: #ede9fe;
  color: #7c3aed;
}

.activity-dot.completed {
  border-color: #10b981;
  background: #10b981;
  color: white;
}

.reflection-content {
  max-width: 700px;
  margin: 0 auto;
}

.path-summary {
  background: #f0f9ff;
  border: 2px solid #0ea5e9;
  padding: 2rem;
  border-radius: 1rem;
  margin-bottom: 3rem;
  text-align: center;
}

.reflection-questions {
  margin-bottom: 3rem;
}

.reflection-question-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.reflection-question-card h3 {
  color: #8b5cf6;
  margin-bottom: 1rem;
}

.question-text {
  color: #374151;
  margin-bottom: 1rem;
  font-weight: 500;
}

.reflection-textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  resize: vertical;
  font-family: inherit;
  font-size: 1rem;
}

.reflection-textarea:focus {
  border-color: #8b5cf6;
  outline: none;
}

.connections-section {
  margin-bottom: 3rem;
}

.connection-card {
  background: var(--bg-secondary);
  border-left: 4px solid #8b5cf6;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-radius: 0 0.5rem 0.5rem 0;
}

.connection-card h3 {
  color: #7c3aed;
  margin-bottom: 0.75rem;
}

.primary-button, .next-container-button, .restart-button {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.primary-button:hover, .next-container-button:hover, .restart-button:hover {
  transform: translateY(-2px);
}

.primary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.phase-actions, .completion-actions {
  text-align: center;
  margin-top: 3rem;
}

.activity-progress {
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

.discovery-achievements, .journey-celebration {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  margin: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.discovery-achievements ul {
  text-align: left;
  max-width: 500px;
  margin: 0 auto;
  padding-left: 1.5rem;
}

.discovery-achievements li {
  margin-bottom: 0.75rem;
  line-height: 1.5;
}

.journey-steps {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
}

.journey-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.step-icon {
  font-size: 2rem;
  background: #ecfdf5;
  border: 2px solid #10b981;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-name {
  font-weight: bold;
  color: #1f2937;
}

.step-description {
  font-size: 0.875rem;
  color: #6b7280;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default AIDiscoverContainer;