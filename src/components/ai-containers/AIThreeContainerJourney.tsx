/**
 * AI THREE-CONTAINER JOURNEY ORCHESTRATOR
 * Manages the complete Learn → Experience → Discover journey with AI-first containers
 */

import React, { useState } from 'react';
import { AILearnContainer, AIExperienceContainer, AIDiscoverContainer } from './index';
import type { StudentProfile, LearningSkill } from '../../services/AILearningJourneyService';

// ================================================================
// COMPONENT INTERFACES
// ================================================================

interface AIThreeContainerJourneyProps {
  student: StudentProfile;
  skill: LearningSkill;
  selectedCharacter?: string;
  selectedCareer?: any;
  onJourneyComplete?: () => void;
}

type JourneyContainer = 'learn' | 'experience' | 'discover' | 'complete';

// ================================================================
// AI THREE-CONTAINER JOURNEY COMPONENT
// ================================================================

export const AIThreeContainerJourney: React.FC<AIThreeContainerJourneyProps> = ({
  student,
  skill,
  selectedCharacter,
  selectedCareer,
  onJourneyComplete
}) => {
  const [currentContainer, setCurrentContainer] = useState<JourneyContainer>('learn');
  const [completedContainers, setCompletedContainers] = useState<JourneyContainer[]>([]);

  // ================================================================
  // NAVIGATION HANDLERS
  // ================================================================

  const handleLearnComplete = (success: boolean) => {
    setCompletedContainers(prev => [...prev, 'learn']);
  };

  const handleLearnNext = () => {
    setCurrentContainer('experience');
  };

  const handleExperienceComplete = (success: boolean) => {
    console.log(`🎯 Experience container completed with success: ${success}`);
    setCompletedContainers(prev => [...prev, 'experience']);
  };

  const handleExperienceNext = () => {
    setCurrentContainer('discover');
  };

  const handleDiscoverComplete = (success: boolean) => {
    console.log(`🔍 Discover container completed with success: ${success}`);
    setCompletedContainers(prev => [...prev, 'discover']);
    setCurrentContainer('complete');
  };

  const handleDiscoverNext = () => {
    setCurrentContainer('complete');
    onJourneyComplete?.();
  };

  // ================================================================
  // JOURNEY PROGRESS INDICATOR
  // ================================================================

  const renderJourneyProgress = () => (
    <div className="journey-progress">
      <div className="progress-header">
        <h2>🎓 Learning Journey Progress</h2>
        <p>Mastering {skill.skill_name} with {student.display_name}</p>
      </div>
      
      <div className="progress-steps">
        <div className={`progress-step ${currentContainer === 'learn' ? 'active' : ''} ${completedContainers.includes('learn') ? 'completed' : ''}`}>
          <div className="step-icon">📚</div>
          <div className="step-info">
            <div className="step-title">Learn</div>
            <div className="step-description">Master the basics</div>
          </div>
        </div>

        <div className="progress-arrow">→</div>

        <div className={`progress-step ${currentContainer === 'experience' ? 'active' : ''} ${completedContainers.includes('experience') ? 'completed' : ''}`}>
          <div className="step-icon">🎯</div>
          <div className="step-info">
            <div className="step-title">Experience</div>
            <div className="step-description">Apply in careers</div>
          </div>
        </div>

        <div className="progress-arrow">→</div>

        <div className={`progress-step ${currentContainer === 'discover' ? 'active' : ''} ${completedContainers.includes('discover') ? 'completed' : ''}`}>
          <div className="step-icon">🔍</div>
          <div className="step-info">
            <div className="step-title">Discover</div>
            <div className="step-description">Explore deeply</div>
          </div>
        </div>
      </div>
    </div>
  );

  // ================================================================
  // JOURNEY COMPLETE STATE
  // ================================================================

  if (currentContainer === 'complete') {
    return (
      <div className="ai-journey-container">
        {renderJourneyProgress()}
        
        <div className="journey-complete">
          <header className="complete-header">
            <h1>🎉 Amazing Journey Complete!</h1>
            <p>{student.display_name}, you've mastered {skill.skill_name} through a complete learning adventure!</p>
          </header>

          <div className="journey-summary">
            <h2>🏆 Your Learning Adventure Summary</h2>
            <div className="summary-cards">
              <div className="summary-card learn">
                <div className="card-icon">📚</div>
                <h3>Learn</h3>
                <p>You learned the fundamentals of {skill.skill_name} through engaging instruction, practice, and assessment.</p>
              </div>

              <div className="summary-card experience">
                <div className="card-icon">🎯</div>
                <h3>Experience</h3>
                <p>You applied {skill.skill_name} in real-world career scenarios and professional simulations.</p>
              </div>

              <div className="summary-card discover">
                <div className="card-icon">🔍</div>
                <h3>Discover</h3>
                <p>You explored the deeper mysteries of {skill.skill_name} through creative discovery activities.</p>
              </div>
            </div>
          </div>

          <div className="journey-actions">
            <button
              onClick={() => window.location.reload()}
              className="new-journey-button"
            >
              Start New Learning Journey 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // RENDER CURRENT CONTAINER
  // ================================================================

  return (
    <div className="ai-journey-container">
      {renderJourneyProgress()}
      
      <div className="container-content">
        {currentContainer === 'learn' && (
          <AILearnContainer
            student={student}
            skill={skill}
            selectedCharacter={selectedCharacter}
            selectedCareer={selectedCareer}
            onComplete={handleLearnComplete}
            onNext={handleLearnNext}
          />
        )}

        {currentContainer === 'experience' && (
          <AIExperienceContainer
            student={student}
            skill={skill}
            selectedCharacter={selectedCharacter}
            selectedCareer={selectedCareer}
            onComplete={handleExperienceComplete}
            onNext={handleExperienceNext}
          />
        )}

        {currentContainer === 'discover' && (
          <AIDiscoverContainer
            student={student}
            skill={skill}
            selectedCharacter={selectedCharacter}
            selectedCareer={selectedCareer}
            onComplete={handleDiscoverComplete}
            onNext={handleDiscoverNext}
          />
        )}
      </div>
    </div>
  );
};

// ================================================================
// STYLES
// ================================================================

const styles = `
.ai-journey-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.journey-progress {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.progress-header {
  text-align: center;
  margin-bottom: 2rem;
}

.progress-header h2 {
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.progress-header p {
  color: #6b7280;
}

.progress-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1rem;
  transition: all 0.3s ease;
  min-width: 120px;
}

.progress-step.active {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  transform: scale(1.05);
}

.progress-step.completed {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.step-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.step-info {
  text-align: center;
}

.step-title {
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.step-description {
  font-size: 0.875rem;
  opacity: 0.9;
}

.progress-arrow {
  font-size: 2rem;
  color: #9ca3af;
  font-weight: bold;
}

.container-content {
  background: var(--bg-primary);
  border-radius: 1rem;
  padding: 1rem;
  min-height: 600px;
}

.journey-complete {
  text-align: center;
  padding: 2rem;
}

.complete-header h1 {
  color: #1f2937;
  margin-bottom: 1rem;
}

.complete-header p {
  color: #6b7280;
  font-size: 1.1rem;
}

.journey-summary {
  margin: 3rem 0;
}

.journey-summary h2 {
  color: #1f2937;
  margin-bottom: 2rem;
}

.summary-cards {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  max-width: 800px;
  margin: 0 auto;
}

.summary-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-4px);
}

.summary-card.learn {
  border-left: 6px solid #4f46e5;
}

.summary-card.experience {
  border-left: 6px solid #f59e0b;
}

.summary-card.discover {
  border-left: 6px solid #8b5cf6;
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.summary-card h3 {
  color: #1f2937;
  margin-bottom: 1rem;
}

.summary-card p {
  color: #6b7280;
  line-height: 1.6;
}

.new-journey-button {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.new-journey-button:hover {
  transform: translateY(-2px);
}

.journey-actions {
  margin-top: 3rem;
}

@media (max-width: 768px) {
  .progress-steps {
    flex-direction: column;
    gap: 1rem;
  }
  
  .progress-arrow {
    transform: rotate(90deg);
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default AIThreeContainerJourney;