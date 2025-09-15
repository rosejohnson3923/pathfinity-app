/**
 * AI THREE-CONTAINER JOURNEY ORCHESTRATOR V2
 * Enhanced version using V2 containers with Rules Engine integration
 * Manages the complete Learn → Experience → Discover journey with AI-first containers
 */

import React, { useState, useEffect } from 'react';
import { AILearnContainerV2UNIFIED as AILearnContainerV2 } from './AILearnContainerV2-UNIFIED';
// import { AIExperienceContainerV2 } from './AIExperienceContainerV2'; // MOVED TO OBSOLETE
import { AIExperienceContainerV2UNIFIED as AIExperienceContainerV2 } from './AIExperienceContainerV2-UNIFIED';
import { AIDiscoverContainerV2 } from './AIDiscoverContainerV2';
import type { StudentProfile, LearningSkill } from '../../services/AILearningJourneyService';

// RULES ENGINE INTEGRATION
import { 
  useMasterOrchestration,
  useCompanionRules,
  useGamificationRules 
} from '../../rules-engine/integration/ContainerIntegration';
import { unifiedLearningAnalyticsService } from '../../services/unifiedLearningAnalyticsService';
import { useTheme } from '../../hooks/useTheme';

// ================================================================
// COMPONENT INTERFACES
// ================================================================

interface AIThreeContainerJourneyV2Props {
  student: StudentProfile;
  skill: LearningSkill;
  selectedCharacter?: string;
  selectedCareer?: any;
  onJourneyComplete?: () => void;
  useV2?: boolean; // Feature flag for V2 containers
}

type JourneyContainer = 'learn' | 'experience' | 'discover' | 'complete';

interface JourneyMetrics {
  totalTime: number;
  containerTimes: Record<JourneyContainer, number>;
  totalScore: number;
  rulesEngineEvents: number;
  rewardsEarned: any[];
}

// ================================================================
// AI THREE-CONTAINER JOURNEY V2 COMPONENT
// ================================================================

export const AIThreeContainerJourneyV2: React.FC<AIThreeContainerJourneyV2Props> = ({
  student,
  skill,
  selectedCharacter,
  selectedCareer,
  onJourneyComplete,
  useV2 = true // Default to V2 containers
}) => {
  const [currentContainer, setCurrentContainer] = useState<JourneyContainer>('learn');
  const [completedContainers, setCompletedContainers] = useState<JourneyContainer[]>([]);
  const [journeyStartTime] = useState(Date.now());
  const [containerStartTime, setContainerStartTime] = useState(Date.now());
  const [journeyMetrics, setJourneyMetrics] = useState<JourneyMetrics>({
    totalTime: 0,
    containerTimes: {} as Record<JourneyContainer, number>,
    totalScore: 0,
    rulesEngineEvents: 0,
    rewardsEarned: []
  });
  
  // Rules Engine Hooks
  const masterOrchestration = useMasterOrchestration();
  const companionRules = useCompanionRules();
  const gamificationRules = useGamificationRules();
  const theme = useTheme();
  
  // Session ID for tracking
  const [sessionId] = useState(`journey-v2-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // ================================================================
  // JOURNEY ORCHESTRATION WITH RULES ENGINE
  // ================================================================
  
  useEffect(() => {
    // Initialize journey with master orchestration
    const initializeJourney = async () => {
      const orchestrationContext = {
        student: {
          id: student.id,
          grade: student.grade_level,
          age: student.age || 10,
          skillLevel: student.skill_level || 'intermediate'
        },
        skill: {
          id: skill.id || skill.skill_name,
          name: skill.skill_name,
          category: skill.category || 'general',
          subject: skill.subject
        },
        career: selectedCareer ? {
          id: selectedCareer.id || selectedCareer.name?.toLowerCase(),
          name: selectedCareer.name
        } : undefined,
        companion: selectedCharacter ? {
          id: selectedCharacter.toLowerCase(),
          name: selectedCharacter
        } : undefined,
        mode: 'journey',
        theme: theme === 'dark' ? 'dark' : 'light'
      };
      
      // Orchestrate journey initialization
      const orchestrationResult = await masterOrchestration.orchestrate(orchestrationContext);
      
      // Track journey start
      await unifiedLearningAnalyticsService.trackLearningEvent({
        studentId: student.id,
        sessionId,
        eventType: 'journey_v2_start',
        metadata: {
          skill: skill.skill_name,
          career: selectedCareer?.name,
          companion: selectedCharacter,
          rules_engine: true,
          v2_containers: useV2
        }
      });
      
      console.log('🚀 Journey V2 initialized with rules engine:', orchestrationResult);
    };
    
    initializeJourney();
  }, []);

  // ================================================================
  // NAVIGATION HANDLERS WITH METRICS
  // ================================================================

  const recordContainerTime = (container: JourneyContainer) => {
    const timeSpent = Date.now() - containerStartTime;
    setJourneyMetrics(prev => ({
      ...prev,
      containerTimes: {
        ...prev.containerTimes,
        [container]: timeSpent
      },
      totalTime: Date.now() - journeyStartTime
    }));
    setContainerStartTime(Date.now());
  };

  const handleLearnComplete = async (success: boolean) => {
    setCompletedContainers(prev => [...prev, 'learn']);
    recordContainerTime('learn');
    
    // Track completion with rules engine
    await unifiedLearningAnalyticsService.trackLearningEvent({
      studentId: student.id,
      sessionId,
      eventType: 'learn_v2_complete',
      metadata: {
        success,
        timeSpent: journeyMetrics.containerTimes['learn'],
        rules_engine: true
      }
    });
    
    // Get transition message from companion
    if (companionRules) {
      const message = await companionRules.getCompanionMessage(
        selectedCharacter?.toLowerCase() || 'finn',
        selectedCareer?.name || 'Explorer',
        'container_transition',
        { from: 'learn', to: 'experience' }
      );
      console.log('🎯 Transition message:', message);
    }
  };

  const handleLearnNext = () => {
    setCurrentContainer('experience');
  };

  const handleExperienceComplete = async (success: boolean) => {
    console.log(`🎯 Experience V2 container completed with success: ${success}`);
    setCompletedContainers(prev => [...prev, 'experience']);
    recordContainerTime('experience');
    
    // Track completion
    await unifiedLearningAnalyticsService.trackLearningEvent({
      studentId: student.id,
      sessionId,
      eventType: 'experience_v2_complete',
      metadata: {
        success,
        timeSpent: journeyMetrics.containerTimes['experience'],
        rules_engine: true
      }
    });
    
    // Get transition message
    if (companionRules) {
      const message = await companionRules.getCompanionMessage(
        selectedCharacter?.toLowerCase() || 'finn',
        selectedCareer?.name || 'Explorer',
        'container_transition',
        { from: 'experience', to: 'discover' }
      );
      console.log('🔍 Transition message:', message);
    }
  };

  const handleExperienceNext = () => {
    setCurrentContainer('discover');
  };

  const handleDiscoverComplete = async (success: boolean) => {
    console.log(`🔍 Discover V2 container completed with success: ${success}`);
    setCompletedContainers(prev => [...prev, 'discover']);
    recordContainerTime('discover');
    
    // Track completion
    await unifiedLearningAnalyticsService.trackLearningEvent({
      studentId: student.id,
      sessionId,
      eventType: 'discover_v2_complete',
      metadata: {
        success,
        timeSpent: journeyMetrics.containerTimes['discover'],
        rules_engine: true
      }
    });
    
    // Award journey completion rewards
    if (gamificationRules) {
      const journeyRewards = await gamificationRules.awardJourneyCompletion(
        student.id,
        skill.skill_name,
        selectedCareer?.name
      );
      setJourneyMetrics(prev => ({
        ...prev,
        rewardsEarned: [...prev.rewardsEarned, ...journeyRewards]
      }));
    }
    
    setCurrentContainer('complete');
  };

  const handleDiscoverNext = async () => {
    setCurrentContainer('complete');
    
    // Track journey completion
    await unifiedLearningAnalyticsService.trackLearningEvent({
      studentId: student.id,
      sessionId,
      eventType: 'journey_v2_complete',
      metadata: {
        totalTime: Date.now() - journeyStartTime,
        containerTimes: journeyMetrics.containerTimes,
        totalRewards: journeyMetrics.rewardsEarned.length,
        rules_engine: true,
        v2_containers: useV2
      }
    });
    
    onJourneyComplete?.();
  };

  // ================================================================
  // JOURNEY PROGRESS INDICATOR V2
  // ================================================================

  const renderJourneyProgress = () => (
    <div className="journey-progress-v2">
      <div className="progress-header">
        <h2>🎓 Learning Journey Progress (V2)</h2>
        <p>Mastering {skill.skill_name} with {student.display_name}</p>
        <div className="rules-engine-indicator">
          <span className="indicator-badge">🤖 Rules Engine Active</span>
        </div>
      </div>
      
      <div className="progress-steps">
        <div className={`progress-step ${currentContainer === 'learn' ? 'active' : ''} ${completedContainers.includes('learn') ? 'completed' : ''}`}>
          <div className="step-icon">📚</div>
          <div className="step-info">
            <div className="step-title">Learn</div>
            <div className="step-description">Master the basics</div>
            <div className="step-engine">LearnAIRulesEngine</div>
          </div>
          {journeyMetrics.containerTimes['learn'] && (
            <div className="step-time">{Math.round(journeyMetrics.containerTimes['learn'] / 1000)}s</div>
          )}
        </div>

        <div className="progress-arrow">→</div>

        <div className={`progress-step ${currentContainer === 'experience' ? 'active' : ''} ${completedContainers.includes('experience') ? 'completed' : ''}`}>
          <div className="step-icon">🎯</div>
          <div className="step-info">
            <div className="step-title">Experience</div>
            <div className="step-description">Apply in careers</div>
            <div className="step-engine">ExperienceAIRulesEngine</div>
          </div>
          {journeyMetrics.containerTimes['experience'] && (
            <div className="step-time">{Math.round(journeyMetrics.containerTimes['experience'] / 1000)}s</div>
          )}
        </div>

        <div className="progress-arrow">→</div>

        <div className={`progress-step ${currentContainer === 'discover' ? 'active' : ''} ${completedContainers.includes('discover') ? 'completed' : ''}`}>
          <div className="step-icon">🔍</div>
          <div className="step-info">
            <div className="step-title">Discover</div>
            <div className="step-description">Explore and create</div>
            <div className="step-engine">DiscoverAIRulesEngine</div>
          </div>
          {journeyMetrics.containerTimes['discover'] && (
            <div className="step-time">{Math.round(journeyMetrics.containerTimes['discover'] / 1000)}s</div>
          )}
        </div>
      </div>
      
      {/* Metrics Display */}
      {completedContainers.length > 0 && (
        <div className="journey-metrics">
          <div className="metric">
            <span className="metric-label">Time:</span>
            <span className="metric-value">{Math.round((Date.now() - journeyStartTime) / 1000)}s</span>
          </div>
          <div className="metric">
            <span className="metric-label">Progress:</span>
            <span className="metric-value">{completedContainers.length}/3</span>
          </div>
          {journeyMetrics.rewardsEarned.length > 0 && (
            <div className="metric">
              <span className="metric-label">Rewards:</span>
              <span className="metric-value">{journeyMetrics.rewardsEarned.length}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ================================================================
  // COMPLETION SCREEN
  // ================================================================

  const renderCompletionScreen = () => (
    <div className="journey-completion-v2">
      <div className="completion-header">
        <h1>🎉 Journey Complete!</h1>
        <p>Congratulations, {student.display_name}! You've mastered {skill.skill_name}!</p>
      </div>

      <div className="completion-stats">
        <h2>📊 Journey Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-value">{Math.round(journeyMetrics.totalTime / 60000)} min</div>
            <div className="stat-label">Total Time</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">3/3</div>
            <div className="stat-label">Containers Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-value">{journeyMetrics.rewardsEarned.length}</div>
            <div className="stat-label">Rewards Earned</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🤖</div>
            <div className="stat-value">V2</div>
            <div className="stat-label">Rules Engine</div>
          </div>
        </div>
      </div>

      <div className="completion-breakdown">
        <h3>Container Performance:</h3>
        <ul>
          <li>📚 Learn: {Math.round((journeyMetrics.containerTimes['learn'] || 0) / 1000)}s</li>
          <li>🎯 Experience: {Math.round((journeyMetrics.containerTimes['experience'] || 0) / 1000)}s</li>
          <li>🔍 Discover: {Math.round((journeyMetrics.containerTimes['discover'] || 0) / 1000)}s</li>
        </ul>
      </div>

      {journeyMetrics.rewardsEarned.length > 0 && (
        <div className="rewards-earned">
          <h3>🏆 Rewards Earned:</h3>
          <div className="rewards-list">
            {journeyMetrics.rewardsEarned.map((reward, index) => (
              <div key={index} className="reward-item">
                {reward.type === 'badge' && `🎖️ ${reward.name}`}
                {reward.type === 'points' && `⭐ ${reward.value} XP`}
                {reward.type === 'achievement' && `🏅 ${reward.name}`}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="completion-actions">
        <button 
          onClick={() => onJourneyComplete?.()}
          className="continue-button"
        >
          Continue Learning 🚀
        </button>
      </div>
    </div>
  );

  // ================================================================
  // CONTAINER RENDERING WITH V2
  // ================================================================

  const renderCurrentContainer = () => {
    const commonProps = {
      student,
      skill,
      selectedCharacter,
      selectedCareer
    };

    switch (currentContainer) {
      case 'learn':
        return (
          <AILearnContainerV2
            {...commonProps}
            onComplete={handleLearnComplete}
            onNext={handleLearnNext}
          />
        );

      case 'experience':
        return (
          <AIExperienceContainerV2
            {...commonProps}
            onComplete={handleExperienceComplete}
            onNext={handleExperienceNext}
            onBack={() => setCurrentContainer('learn')}
            onSkipToDiscover={() => {
              console.log('🔄 Skipping to Discover Container (Testing)');
              recordContainerTime('experience');
              setCompletedContainers(prev => [...prev, 'experience']);
              setCurrentContainer('discover');
            }}
          />
        );

      case 'discover':
        return (
          <AIDiscoverContainerV2
            {...commonProps}
            onComplete={handleDiscoverComplete}
            onNext={handleDiscoverNext}
            onBack={() => setCurrentContainer('experience')}
          />
        );

      case 'complete':
        return renderCompletionScreen();

      default:
        return null;
    }
  };

  // ================================================================
  // MAIN RENDER
  // ================================================================

  return (
    <div className="ai-three-container-journey-v2">
      {/* Journey Progress Bar */}
      {currentContainer !== 'complete' && renderJourneyProgress()}
      
      {/* Current Container */}
      <div className="journey-container-wrapper">
        {renderCurrentContainer()}
      </div>
    </div>
  );
};

// ================================================================
// STYLES
// ================================================================

const styles = `
.ai-three-container-journey-v2 {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.journey-progress-v2 {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.progress-header {
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
}

.progress-header h2 {
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.progress-header p {
  color: #6b7280;
}

.rules-engine-indicator {
  position: absolute;
  top: 0;
  right: 0;
}

.indicator-badge {
  display: inline-block;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: bold;
}

.progress-steps {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border-radius: 0.5rem;
  background: #f3f4f6;
  min-width: 150px;
  position: relative;
  transition: all 0.3s ease;
}

.progress-step.active {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  transform: scale(1.05);
}

.progress-step.completed {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.step-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.step-info {
  text-align: center;
}

.step-title {
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.progress-step.active .step-title,
.progress-step.completed .step-title {
  color: white;
}

.step-description {
  font-size: 0.875rem;
  color: #6b7280;
}

.step-engine {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
  font-family: monospace;
}

.progress-step.active .step-description,
.progress-step.active .step-engine,
.progress-step.completed .step-description,
.progress-step.completed .step-engine {
  color: rgba(255, 255, 255, 0.9);
}

.step-time {
  position: absolute;
  bottom: -20px;
  font-size: 0.75rem;
  color: #10b981;
  font-weight: bold;
}

.progress-arrow {
  font-size: 1.5rem;
  color: #9ca3af;
}

.journey-metrics {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.metric {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.metric-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.metric-value {
  font-weight: bold;
  color: #1f2937;
}

.journey-container-wrapper {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  min-height: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.journey-completion-v2 {
  text-align: center;
  padding: 3rem;
}

.completion-header h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.completion-stats {
  margin: 3rem 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.stat-card {
  background: #f3f4f6;
  padding: 1.5rem;
  border-radius: 1rem;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.completion-breakdown {
  background: var(--bg-secondary);
  padding: 2rem;
  border-radius: 1rem;
  margin: 2rem 0;
  text-align: left;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.completion-breakdown h3 {
  color: #1f2937;
  margin-bottom: 1rem;
}

.completion-breakdown ul {
  list-style: none;
  padding: 0;
}

.completion-breakdown li {
  padding: 0.5rem 0;
  color: #4b5563;
}

.rewards-earned {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  padding: 2rem;
  border-radius: 1rem;
  margin: 2rem 0;
}

.rewards-earned h3 {
  color: #92400e;
  margin-bottom: 1rem;
}

.rewards-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.reward-item {
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: 500;
  color: #92400e;
}

.continue-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 3rem;
  border: none;
  border-radius: 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s ease;
  margin-top: 2rem;
}

.continue-button:hover {
  transform: scale(1.05);
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default AIThreeContainerJourneyV2;