/**
 * Full System Test - Narrative-First Architecture
 * Demonstrates complete learning journey generation with all containers
 */

import React, { useState } from 'react';
import { contentOrchestrator, LearningJourneyContent } from './services/ContentOrchestrator';

const FullSystemTest: React.FC = () => {
  const [journeyContent, setJourneyContent] = useState<LearningJourneyContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configuration
  const [config, setConfig] = useState({
    studentName: 'Sam',
    gradeLevel: 'K',
    career: 'Doctor',
    subjects: ['math', 'ela', 'science', 'socialStudies'],
    containers: ['learn', 'experience', 'discover'] as ('learn' | 'experience' | 'discover')[],
    useCache: false
  });

  // View state
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [selectedContainer, setSelectedContainer] = useState<'learn' | 'experience' | 'discover'>('learn');
  const [selectedModal, setSelectedModal] = useState<'instructional' | 'practice' | 'assessment' | null>(null);

  const careers = ['Doctor', 'Teacher', 'Chef', 'Scientist', 'Firefighter', 'Engineer', 'Artist'];
  const grades = ['K', '1', '2', '3', '4', '5'];

  const generateJourney = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Generating complete learning journey...');
      const content = await contentOrchestrator.generateLearningJourney({
        studentName: config.studentName,
        gradeLevel: config.gradeLevel,
        career: config.career,
        subjects: config.subjects,
        containers: config.containers,
        useCache: config.useCache
      });

      setJourneyContent(content);
      console.log('✅ Journey generated:', content);
    } catch (err: any) {
      console.error('❌ Generation failed:', err);
      setError(err.message || 'Failed to generate journey');
    } finally {
      setLoading(false);
    }
  };

  const renderLearnContent = () => {
    if (!journeyContent) return null;
    const content = journeyContent.containers.learn[selectedSubject as keyof typeof journeyContent.containers.learn];
    if (!content) return <p>No content available for this subject</p>;

    if (selectedModal === 'instructional') {
      return (
        <div className="content-display">
          <h4>📺 Instructional Content</h4>
          <p><strong>Introduction:</strong> {content.instructional.introduction}</p>
          <p><strong>Video:</strong> {content.instructional.video?.title}</p>
          <p><strong>Learning Objectives:</strong></p>
          <ul>
            {content.instructional.learningObjectives?.map((obj, idx) => (
              <li key={idx}>{obj}</li>
            ))}
          </ul>
          <p><strong>Vocabulary:</strong> {content.instructional.vocabularyWords?.join(', ')}</p>
          <p><strong>Career Context:</strong> {content.instructional.narrativeContext}</p>
        </div>
      );
    }

    if (selectedModal === 'practice') {
      return (
        <div className="content-display">
          <h4>✏️ Practice Questions</h4>
          <p><strong>Introduction:</strong> {content.practice.introduction}</p>
          {content.practice.questions?.slice(0, 2).map((q, idx) => (
            <div key={q.id} className="question-box">
              <p><strong>Q{idx + 1}:</strong> {q.question}</p>
              {q.type === 'multiple_choice' && (
                <ul>
                  {q.options?.map((opt, i) => (
                    <li key={i} className={opt === q.correctAnswer ? 'correct' : ''}>
                      {opt} {opt === q.correctAnswer && '✓'}
                    </li>
                  ))}
                </ul>
              )}
              <p className="explanation"><em>{q.explanation}</em></p>
            </div>
          ))}
          <p><strong>Career Context:</strong> {content.practice.narrativeContext}</p>
        </div>
      );
    }

    if (selectedModal === 'assessment') {
      return (
        <div className="content-display">
          <h4>🎯 Assessment</h4>
          <div className="question-box">
            <p><strong>Question:</strong> {content.assessment.question?.question}</p>
            {content.assessment.question?.options && (
              <ul>
                {content.assessment.question.options.map((opt, i) => (
                  <li key={i} className={opt === content.assessment.question?.correctAnswer ? 'correct' : ''}>
                    {opt} {opt === content.assessment.question?.correctAnswer && '✓'}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p><strong>Correct Feedback:</strong> {content.assessment.feedback?.correct}</p>
          <p><strong>Career Context:</strong> {content.assessment.narrativeContext}</p>
        </div>
      );
    }

    return (
      <div className="modal-selector">
        <h4>Select a Learn Modal:</h4>
        <button onClick={() => setSelectedModal('instructional')}>📺 Instructional</button>
        <button onClick={() => setSelectedModal('practice')}>✏️ Practice</button>
        <button onClick={() => setSelectedModal('assessment')}>🎯 Assessment</button>
      </div>
    );
  };

  const renderExperienceContent = () => {
    if (!journeyContent) return null;
    const content = journeyContent.containers.experience[selectedSubject as keyof typeof journeyContent.containers.experience];
    if (!content) return <p>No content available for this subject</p>;

    return (
      <div className="content-display">
        <h4>🎮 Experience: Workplace Scenario</h4>
        <p><strong>Welcome:</strong> {content.introduction}</p>

        <div className="scenario-box">
          <p><strong>Setting:</strong> {content.scenario.setting}</p>
          <p><strong>Situation:</strong> {content.scenario.situation}</p>
          <p><strong>Challenge:</strong> {content.scenario.challenge}</p>

          <h5>Your Choices:</h5>
          {content.scenario.choices?.map((choice) => (
            <div key={choice.id} className={`choice ${choice.isOptimal ? 'optimal' : ''}`}>
              <p><strong>{choice.description}</strong></p>
              <p>→ {choice.result}</p>
              <p className="feedback">{choice.feedback}</p>
            </div>
          ))}
        </div>

        <p><strong>Career Connection:</strong> {content.careerConnection}</p>
      </div>
    );
  };

  const renderDiscoverContent = () => {
    if (!journeyContent) return null;
    const content = journeyContent.containers.discover[selectedSubject as keyof typeof journeyContent.containers.discover];
    if (!content) return <p>No content available for this subject</p>;

    return (
      <div className="content-display">
        <h4>🌍 Discover: Field Trip</h4>
        <p><strong>Introduction:</strong> {content.introduction}</p>

        <div className="discovery-box">
          <p><strong>Location:</strong> {content.activity.location}</p>
          <p><strong>Guide:</strong> {content.activity.guide}</p>

          <h5>Exploration Points:</h5>
          {content.activity.exploration?.map((point) => (
            <div key={point.id} className="exploration-point">
              <p><strong>{point.title}</strong></p>
              <p>{point.description}</p>
              <p className="fun-fact">💡 {point.funFact}</p>
            </div>
          ))}
        </div>

        <div className="three-two-one">
          <h5>3-2-1 Summary:</h5>
          <p><strong>3 Things Discovered:</strong></p>
          <ul>
            {content.threeThings.discovered?.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
          <p><strong>2 Skills Used:</strong></p>
          <ul>
            {content.threeThings.skillsUsed?.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
          <p><strong>1 Big Idea:</strong> {content.threeThings.bigIdea}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="full-system-test">
      <style>{`
        .full-system-test {
          padding: 20px;
          font-family: system-ui;
          max-width: 1400px;
          margin: 0 auto;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 20px;
        }
        .cost-display {
          background: #10b981;
          color: white;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .config-panel {
          background: #f3f4f6;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        .config-item label {
          display: block;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .config-item select, .config-item input {
          width: 100%;
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
        }
        .generate-button {
          background: #3b82f6;
          color: white;
          padding: 12px 30px;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          margin: 20px 0;
        }
        .generate-button:hover {
          background: #2563eb;
        }
        .generate-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        .content-area {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 20px;
          margin-top: 20px;
        }
        .navigation {
          background: #f9fafb;
          padding: 15px;
          border-radius: 8px;
          height: fit-content;
        }
        .nav-section {
          margin-bottom: 20px;
        }
        .nav-section h4 {
          margin-bottom: 10px;
          color: #374151;
        }
        .nav-button {
          display: block;
          width: 100%;
          padding: 8px 12px;
          margin-bottom: 5px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          cursor: pointer;
          text-align: left;
        }
        .nav-button.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        .content-display {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        .question-box {
          background: #f9fafb;
          padding: 15px;
          border-radius: 6px;
          margin: 15px 0;
        }
        .correct {
          color: #10b981;
          font-weight: bold;
        }
        .explanation {
          color: #6b7280;
          font-size: 14px;
          margin-top: 10px;
        }
        .scenario-box, .discovery-box {
          background: #f0f9ff;
          padding: 15px;
          border-radius: 6px;
          margin: 15px 0;
        }
        .choice {
          background: #fefce8;
          padding: 10px;
          margin: 10px 0;
          border-radius: 4px;
          border-left: 3px solid #facc15;
        }
        .choice.optimal {
          background: #f0fdf4;
          border-left-color: #10b981;
        }
        .feedback {
          color: #6b7280;
          font-style: italic;
          margin-top: 5px;
        }
        .exploration-point {
          background: white;
          padding: 10px;
          margin: 10px 0;
          border-radius: 4px;
        }
        .fun-fact {
          color: #f59e0b;
          font-style: italic;
        }
        .three-two-one {
          background: #eff6ff;
          padding: 15px;
          border-radius: 6px;
          margin-top: 15px;
        }
        .modal-selector {
          text-align: center;
          padding: 20px;
        }
        .modal-selector button {
          margin: 0 10px;
          padding: 10px 20px;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .modal-selector button:hover {
          background: #4f46e5;
        }
        .error-message {
          background: #fef2f2;
          color: #dc2626;
          padding: 15px;
          border-radius: 6px;
          margin: 20px 0;
        }
        .metadata {
          background: #f3f4f6;
          padding: 15px;
          border-radius: 6px;
          margin-top: 20px;
          font-size: 14px;
        }
      `}</style>

      <div className="header">
        <h1>🚀 Narrative-First Architecture - Full System Test</h1>
        <p>Complete learning journey generation with 98.9% cost reduction</p>
      </div>

      {!journeyContent && (
        <>
          <div className="cost-display">
            <h3>💰 Cost Comparison</h3>
            <p><strong>Traditional Approach:</strong> $60.00 (12 separate AI calls)</p>
            <p><strong>Our Approach:</strong> ~$0.62 (1 master + 12 micro-adaptations)</p>
            <p><strong>Savings:</strong> $59.38 (98.9% reduction!)</p>
          </div>

          <div className="config-panel">
            <div className="config-item">
              <label>Student Name</label>
              <input
                type="text"
                value={config.studentName}
                onChange={(e) => setConfig({...config, studentName: e.target.value})}
              />
            </div>
            <div className="config-item">
              <label>Grade Level</label>
              <select
                value={config.gradeLevel}
                onChange={(e) => setConfig({...config, gradeLevel: e.target.value})}
              >
                {grades.map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
            <div className="config-item">
              <label>Career</label>
              <select
                value={config.career}
                onChange={(e) => setConfig({...config, career: e.target.value})}
              >
                {careers.map(career => (
                  <option key={career} value={career}>{career}</option>
                ))}
              </select>
            </div>
            <div className="config-item">
              <label>
                <input
                  type="checkbox"
                  checked={config.useCache}
                  onChange={(e) => setConfig({...config, useCache: e.target.checked})}
                />
                {' '}Use Cache (skip Master Narrative generation)
              </label>
            </div>
          </div>

          <button
            className="generate-button"
            onClick={generateJourney}
            disabled={loading}
          >
            {loading ? 'Generating Complete Journey...' : 'Generate Learning Journey'}
          </button>
        </>
      )}

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {journeyContent && (
        <>
          <div className="metadata">
            <h4>Generation Metrics</h4>
            <p><strong>Total Cost:</strong> ${journeyContent.metadata.totalCost.toFixed(4)}</p>
            <p><strong>Cost Savings:</strong> ${journeyContent.metadata.costSavings.toFixed(2)}</p>
            <p><strong>Generation Time:</strong> {(journeyContent.metadata.generationTime / 1000).toFixed(2)}s</p>
            <p><strong>Student:</strong> {journeyContent.narrative.character.name} as {journeyContent.narrative.character.role}</p>
          </div>

          <div className="content-area">
            <div className="navigation">
              <div className="nav-section">
                <h4>Subject</h4>
                {config.subjects.map(subject => (
                  <button
                    key={subject}
                    className={`nav-button ${selectedSubject === subject ? 'active' : ''}`}
                    onClick={() => setSelectedSubject(subject)}
                  >
                    {subject === 'socialStudies' ? 'Social Studies' : subject.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="nav-section">
                <h4>Container</h4>
                {config.containers.map(container => (
                  <button
                    key={container}
                    className={`nav-button ${selectedContainer === container ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedContainer(container);
                      setSelectedModal(null);
                    }}
                  >
                    {container.charAt(0).toUpperCase() + container.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="content-display">
              {selectedContainer === 'learn' && renderLearnContent()}
              {selectedContainer === 'experience' && renderExperienceContent()}
              {selectedContainer === 'discover' && renderDiscoverContent()}
            </div>
          </div>

          <button
            className="generate-button"
            onClick={() => {
              setJourneyContent(null);
              setSelectedModal(null);
            }}
          >
            Generate New Journey
          </button>
        </>
      )}
    </div>
  );
};

export default FullSystemTest;