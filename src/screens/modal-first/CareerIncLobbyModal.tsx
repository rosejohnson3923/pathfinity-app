/**
 * Career, Inc. Lobby Modal - Full Page Experience
 * Where students check in for their workday with LEARN, EXPERIENCE, DISCOVER objectives
 */

import React, { useState, useEffect, useRef } from 'react';
import { ParticlesBackground } from '../../components/ParticlesBackground';
import { companionVoiceoverService } from '../../services/companionVoiceoverService';
import { useStudentProfile } from '../../hooks/useStudentProfile';
import './CareerIncLobbyModal.css';

interface CareerIncLobbyModalProps {
  selectedCareer: string;
  selectedCompanion: string;
  theme?: 'light' | 'dark';
  onComplete: (selections: {
    container: 'LEARN' | 'EXPERIENCE' | 'DISCOVER';
    objectives: string[];
  }) => void;
  onBack?: () => void;
  completedContainers?: Set<string>;
  onContainerReturn?: (containerId: string) => void;
  userId?: string;
}

interface LearningContainer {
  id: 'LEARN' | 'EXPERIENCE' | 'DISCOVER';
  name: string;
  icon: string;
  color: string;
  bgGradient: string;
  description: string;
  objectives: string[];
  timeEstimate: string;
  skillsGained: string[];
  realWorldConnection: string;
}

const getLearningContainers = (career: string): LearningContainer[] => [
  {
    id: 'LEARN',
    name: 'Learn Foundations',
    icon: '📚',
    color: '#8B5CF6',
    bgGradient: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
    description: `Master core ${career} concepts through interactive lessons and guided practice`,
    objectives: [
      `Study fundamental ${career} principles`,
      'Practice essential skills with AI guidance',
      'Complete knowledge assessments',
      'Build conceptual understanding'
    ],
    timeEstimate: '45-60 minutes',
    skillsGained: ['Critical Thinking', 'Problem Solving', 'Knowledge Retention'],
    realWorldConnection: `Professional ${career} workers use these foundational skills daily`
  },
  {
    id: 'EXPERIENCE',
    name: 'Hands-On Practice',
    icon: '🛠️',
    color: '#059669',
    bgGradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    description: `Apply ${career} skills through realistic simulations and projects`,
    objectives: [
      `Complete authentic ${career} tasks`,
      'Solve real-world problems',
      'Use professional tools and methods',
      'Collaborate on team projects'
    ],
    timeEstimate: '60-90 minutes',
    skillsGained: ['Practical Application', 'Collaboration', 'Tool Proficiency'],
    realWorldConnection: `Experience the actual day-to-day work of ${career} professionals`
  },
  {
    id: 'DISCOVER',
    name: 'Explore & Create',
    icon: '🚀',
    color: '#DC2626',
    bgGradient: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
    description: `Innovate and explore advanced ${career} concepts and emerging trends`,
    objectives: [
      `Research cutting-edge ${career} developments`,
      'Design original solutions',
      'Explore career pathways',
      'Create portfolio projects'
    ],
    timeEstimate: '30-45 minutes',
    skillsGained: ['Innovation', 'Research', 'Creative Thinking'],
    realWorldConnection: `Discover how ${career} professionals push boundaries and innovate`
  }
];

export const CareerIncLobbyModal: React.FC<CareerIncLobbyModalProps> = ({
  selectedCareer,
  selectedCompanion,
  theme = 'light',
  onComplete,
  onBack,
  completedContainers: initialCompletedContainers,
  onContainerReturn,
  userId = 'default'
}) => {
  // Helper to get companion display name from ID
  const getCompanionDisplayName = (companionId: string): string => {
    const companionNames: Record<string, string> = {
      'finn': 'Finn',
      'sage': 'Sage',
      'spark': 'Spark',
      'harmony': 'Harmony'
    };
    return companionNames[companionId.toLowerCase()] || companionId;
  };
  const { profile } = useStudentProfile();
  const [selectedContainer, setSelectedContainer] = useState<'LEARN' | 'EXPERIENCE' | 'DISCOVER' | null>(null);
  const [expandedContainer, setExpandedContainer] = useState<string | null>(null);
  const [checkedInTime] = useState(new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  }));
  const [completedContainers, setCompletedContainers] = useState<Set<string>>(
    initialCompletedContainers || new Set()
  );
  const [showCompletionMessage, setShowCompletionMessage] = useState<string | null>(null);
  
  // Use sessionStorage to track if welcome has been played this session
  const sessionKey = `lobby-welcome-played-${userId}-${selectedCareer}-${selectedCompanion}`;
  const [hasPlayedWelcome, setHasPlayedWelcome] = useState(() => {
    return sessionStorage.getItem(sessionKey) === 'true';
  });
  
  // Use ref to prevent double-playing in React StrictMode
  const speechInitiatedRef = useRef(false);

  const containers = getLearningContainers(selectedCareer);

  // Play welcome voiceover when component mounts or when returning from a container
  useEffect(() => {
    // Don't play if already played this session
    if (hasPlayedWelcome) return;
    
    // Make sure companion is set
    if (selectedCompanion) {
      companionVoiceoverService.setCompanion(selectedCompanion);
    }
    
    let timeoutId: NodeJS.Timeout | null = null;
    let isMounted = true;
    let voiceoverTimeoutId: NodeJS.Timeout | null = null;
    
    // Use a small delay to prevent StrictMode double-execution
    voiceoverTimeoutId = setTimeout(() => {
      if (!isMounted) return;
      
      // Check if returning from a completed container
      if (onContainerReturn && completedContainers.size > 0) {
        const lastCompleted = Array.from(completedContainers).pop();
        if (lastCompleted) {
          // Show completion message
          setShowCompletionMessage(`Great job completing ${lastCompleted}!`);
          timeoutId = setTimeout(() => {
            if (isMounted) {
              setShowCompletionMessage(null);
            }
          }, 3000);
          
          // Play encouragement for next container
          const nextContainer = getNextContainer();
          if (nextContainer) {
            companionVoiceoverService.playVoiceover('next-container', { 
              completed: lastCompleted,
              next: nextContainer 
            }, { delay: 1000 });
          } else {
            companionVoiceoverService.playVoiceover('all-complete', null, { delay: 1000 });
          }
          setHasPlayedWelcome(true);
          sessionStorage.setItem(sessionKey, 'true');
        }
      } else {
        // First time entering lobby - play welcome
        console.log('🎤 Playing Career, Inc. lobby welcome for:', selectedCompanion, selectedCareer);
        companionVoiceoverService.stopCurrent();
        companionVoiceoverService.playVoiceover('lobby-welcome', { career: selectedCareer }, { delay: 800 });
        setHasPlayedWelcome(true);
        sessionStorage.setItem(sessionKey, 'true');
      }
    }, 100); // Small delay to handle StrictMode
    
    // Cleanup function to stop speech when component unmounts
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (voiceoverTimeoutId) {
        clearTimeout(voiceoverTimeoutId);
      }
      // Stop any speech that might be playing when unmounting
      companionVoiceoverService.stopCurrent();
    };
  }, [sessionKey]); // Only re-run if sessionKey changes

  const getNextContainer = (): string | null => {
    if (!completedContainers.has('LEARN')) return 'LEARN';
    if (!completedContainers.has('EXPERIENCE')) return 'EXPERIENCE';
    if (!completedContainers.has('DISCOVER')) return 'DISCOVER';
    return null;
  };

  const handleContainerSelect = (containerId: 'LEARN' | 'EXPERIENCE' | 'DISCOVER') => {
    // Check if container is unlocked
    if (!isContainerUnlocked(containerId)) {
      // Play a message explaining the container is locked
      companionVoiceoverService.playVoiceover('container-locked', { 
        container: containerId,
        requiredContainer: containerId === 'EXPERIENCE' ? 'LEARN' : 'LEARN and EXPERIENCE'
      });
      return;
    }

    setSelectedContainer(containerId);
    const container = containers.find(c => c.id === containerId);
    if (container) {
      // Navigate to the container
      onComplete({
        container: containerId,
        objectives: container.objectives
      });
    }
  };

  const isContainerUnlocked = (containerId: string): boolean => {
    switch (containerId) {
      case 'LEARN':
        return true; // Always unlocked
      case 'EXPERIENCE':
        return completedContainers.has('LEARN');
      case 'DISCOVER':
        return completedContainers.has('LEARN') && completedContainers.has('EXPERIENCE');
      default:
        return false;
    }
  };

  const getContainerStatus = (containerId: string): 'available' | 'locked' | 'completed' => {
    if (completedContainers.has(containerId)) {
      return 'completed';
    }
    if (isContainerUnlocked(containerId)) {
      return 'available';
    }
    return 'locked';
  };

  const toggleExpanded = (containerId: string) => {
    setExpandedContainer(expandedContainer === containerId ? null : containerId);
  };

  return (
    <div className={`careerinc-lobby-modal full-page theme-${theme}`} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Particles Background */}
      <div 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: 0 
        }}
      >
        <ParticlesBackground 
          theme="experience" 
          particleCount={25}
          speed={0.8}
        />
      </div>

      {/* Content Wrapper */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        {/* Completion Message */}
        {showCompletionMessage && (
          <div className="completion-message" style={{
            position: 'fixed',
            top: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #48BB78 0%, #38A169 100%)',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '2rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(72, 187, 120, 0.3)',
            animation: 'slideDown 0.5s ease-out',
            zIndex: 1000
          }}>
            🎉 {showCompletionMessage}
          </div>
        )}
        
        {/* Header */}
        <div className="lobby-header">
        {onBack && (
          <button className="back-btn" onClick={onBack}>
            ← Back
          </button>
        )}
        
        <div className="check-in-status">
          <span className="status-badge">
            ✓ Checked In
          </span>
          <span className="check-in-time">{checkedInTime}</span>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="company-logo">
          <span className="logo-icon">🏢</span>
          <h1>Career, Inc.</h1>
        </div>
        
        <div className="welcome-message">
          <h2>Welcome to your {selectedCareer} workday!</h2>
          <p>Your AI companion <strong>{getCompanionDisplayName(selectedCompanion)}</strong> is ready to guide your learning journey.</p>
        </div>

        <div className="daily-mission">
          <div className="mission-header">
            <span className="mission-icon">🎯</span>
            <h3>Today's Mission</h3>
          </div>
          <p>Choose your learning path to advance your {selectedCareer} skills through our three-container system.</p>
        </div>
      </div>

      {/* Learning Containers */}
      <div className="learning-containers">
        <h3>Choose Your Learning Journey</h3>
        
        <div className="containers-grid">
          {containers.map((container, index) => {
            const status = getContainerStatus(container.id);
            const isLocked = status === 'locked';
            const isCompleted = status === 'completed';
            
            return (
            <div
              key={container.id}
              className={`container-card ${selectedContainer === container.id ? 'selected' : ''} ${status}`}
              style={{ 
                animationDelay: `${index * 0.1}s`,
                borderColor: isLocked ? '#718096' : container.color,
                opacity: isLocked ? 0.6 : 1,
                cursor: isLocked ? 'not-allowed' : 'pointer',
                ...(isCompleted && {
                  background: `${container.color}15`, // 15 is hex for ~0.08 opacity
                  borderColor: `${container.color} !important`
                })
              }}
              onClick={() => handleContainerSelect(container.id)}
            >
              <div className="container-header">
                <div 
                  className="container-icon"
                  style={{ 
                    background: isLocked ? 'linear-gradient(135deg, #718096 0%, #4A5568 100%)' : container.bgGradient,
                    position: 'relative'
                  }}
                >
                  {isLocked ? '🔒' : isCompleted ? '✅' : container.icon}
                </div>
                <div className="container-title">
                  <h4>{container.name}</h4>
                  <span className="container-id">
                    {isLocked ? 'LOCKED' : isCompleted ? 'COMPLETED' : container.id}
                  </span>
                </div>
                {!isLocked && (
                  <button
                    className="expand-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpanded(container.id);
                    }}
                  >
                    {expandedContainer === container.id ? '−' : '+'}
                  </button>
                )}
              </div>

              <p className="container-description">
                {isLocked 
                  ? `Complete ${container.id === 'EXPERIENCE' ? 'LEARN' : 'LEARN and EXPERIENCE'} to unlock this container`
                  : container.description}
              </p>

              <div className="container-meta">
                <span className="time-estimate">
                  ⏱️ {container.timeEstimate}
                </span>
                <span className="difficulty-level">
                  📈 Progressive
                </span>
              </div>

              {expandedContainer === container.id && (
                <div className="container-details">
                  <div className="objectives-section">
                    <h5>Learning Objectives</h5>
                    <ul>
                      {container.objectives.map((objective, idx) => (
                        <li key={idx}>
                          <span className="check-icon">✓</span>
                          {objective}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="skills-section">
                    <h5>Skills You'll Gain</h5>
                    <div className="skills-tags">
                      {container.skillsGained.map((skill, idx) => (
                        <span 
                          key={idx} 
                          className="skill-tag"
                          style={{ borderColor: container.color }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="real-world-section">
                    <div className="real-world-connection">
                      <span className="world-icon">🌍</span>
                      <p>{container.realWorldConnection}</p>
                    </div>
                  </div>
                </div>
              )}

              <button 
                className="start-container-btn"
                style={{ 
                  backgroundColor: isLocked ? '#718096' : container.color,
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  opacity: isCompleted ? 0.9 : 1
                }}
                disabled={isLocked}
              >
                {isLocked ? '🔒 Locked' : isCompleted ? '✅ Completed' : `Start ${container.name}`}
              </button>
            </div>
            );
          })}
        </div>
      </div>

      {/* Progress Overview */}
      <div className="progress-overview">
        <h3>Today's Progress Goals</h3>
        
        {/* Progress Bar */}
        <div className="overall-progress" style={{
          margin: '1rem 0 2rem',
          padding: '0 2rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            <span>Overall Progress</span>
            <span>{completedContainers.size}/3 Containers</span>
          </div>
          <div style={{
            height: '12px',
            background: theme === 'dark' ? '#2D3748' : '#E2E8F0',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(completedContainers.size / 3) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #8B5CF6 0%, #059669 50%, #DC2626 100%)',
              transition: 'width 0.5s ease-out'
            }} />
          </div>
        </div>
        
        <div className="progress-stats">
          <div className="stat-item">
            <span className="stat-icon">🎯</span>
            <div className="stat-content">
              <span className="stat-value">{completedContainers.size}/3</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⏱️</span>
            <div className="stat-content">
              <span className="stat-value">2-3hrs</span>
              <span className="stat-label">Total Time</span>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📈</span>
            <div className="stat-content">
              <span className="stat-value">15+</span>
              <span className="stat-label">Skills</span>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🏆</span>
            <div className="stat-content">
              <span className="stat-value">100%</span>
              <span className="stat-label">Career Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="lobby-footer">
        <div className="companion-reminder">
          <span className="companion-icon">🤖</span>
          <p><strong>{getCompanionDisplayName(selectedCompanion)}</strong> will guide you through your chosen learning path</p>
        </div>
        
        <div className="motivation-message">
          <p>"Every expert was once a beginner. Choose your path and let's begin your {selectedCareer} journey!"</p>
        </div>
      </div>
    </div>
  </div>
  );
};

export default CareerIncLobbyModal;