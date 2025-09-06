// Finn Maestro Integration Component
// Demonstrates how the FinnMaestroAgent integrates with the React UI

import React, { useState, useEffect } from 'react';
import { FinnMaestroAgent, Student, Assignment } from '../utils/FinnMaestroAgent';

interface FinnMaestroIntegrationProps {
  student: Student;
}

export const FinnMaestroIntegration: React.FC<FinnMaestroIntegrationProps> = ({ student }) => {
  const [finn, setFinn] = useState<FinnMaestroAgent | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [journeyPhase, setJourneyPhase] = useState<'morning' | 'learning' | 'evening' | 'complete'>('morning');

  useEffect(() => {
    // Initialize Finn for this student
    const finnAgent = new FinnMaestroAgent(student);
    setFinn(finnAgent);
  }, [student]);

  const generateDailyContent = async () => {
    if (!finn) return;
    
    setIsGenerating(true);
    setJourneyPhase('morning');
    
    try {
      const dailyAssignments = await finn.generateDailyContent();
      setAssignments(dailyAssignments);
      setJourneyPhase('learning');
    } catch (error) {
      console.error('Error generating daily content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const startLearningSession = async () => {
    if (!finn) return;
    
    setJourneyPhase('learning');
    
    try {
      await finn.guideStudentThroughDay();
      setJourneyPhase('evening');
    } catch (error) {
      console.error('Error in learning session:', error);
    }
  };

  const planTomorrow = async () => {
    if (!finn) return;
    
    try {
      await finn.planTomorrowsContent();
      setJourneyPhase('complete');
    } catch (error) {
      console.error('Error planning tomorrow:', error);
    }
  };

  return (
    <div className="finn-maestro-integration">
      <div className="finn-header">
        <h2>🎯 Finn's Daily Learning Journey</h2>
        <h3>Student: {student.name} ({student.gradeLevel})</h3>
      </div>

      {/* Journey Phase Indicator */}
      <div className="journey-phases">
        <div className={`phase ${journeyPhase === 'morning' ? 'active' : journeyPhase === 'learning' || journeyPhase === 'evening' || journeyPhase === 'complete' ? 'completed' : ''}`}>
          🌅 Morning Preparation
        </div>
        <div className={`phase ${journeyPhase === 'learning' ? 'active' : journeyPhase === 'evening' || journeyPhase === 'complete' ? 'completed' : ''}`}>
          📚 Guided Learning
        </div>
        <div className={`phase ${journeyPhase === 'evening' ? 'active' : journeyPhase === 'complete' ? 'completed' : ''}`}>
          🌙 Evening Planning
        </div>
        <div className={`phase ${journeyPhase === 'complete' ? 'active' : ''}`}>
          🎉 Complete!
        </div>
      </div>

      {/* Morning Phase */}
      {journeyPhase === 'morning' && (
        <div className="morning-phase">
          <h4>🌅 Morning Content Generation</h4>
          <p>Finn will generate personalized content for {student.name}'s learning journey today.</p>
          <button 
            onClick={generateDailyContent}
            disabled={isGenerating}
            className="generate-btn"
          >
            {isGenerating ? 'Generating Content...' : 'Generate Daily Content'}
          </button>
        </div>
      )}

      {/* Learning Phase */}
      {journeyPhase === 'learning' && (
        <div className="learning-phase">
          <h4>📚 Daily Assignments Ready</h4>
          <div className="assignments-overview">
            <p>Generated {assignments.length} assignments for today:</p>
            <ul>
              {assignments.map((assignment, index) => (
                <li key={assignment.id}>
                  {assignment.content.title} ({assignment.skillCode}) - {assignment.estimatedDuration} min
                </li>
              ))}
            </ul>
          </div>
          <button onClick={startLearningSession} className="start-learning-btn">
            Start Guided Learning Session
          </button>
        </div>
      )}

      {/* Evening Phase */}
      {journeyPhase === 'evening' && (
        <div className="evening-phase">
          <h4>🌙 Learning Session Complete</h4>
          <p>Great job today! Now let's plan tomorrow's learning based on today's performance.</p>
          <button onClick={planTomorrow} className="plan-tomorrow-btn">
            Plan Tomorrow's Learning
          </button>
        </div>
      )}

      {/* Complete Phase */}
      {journeyPhase === 'complete' && (
        <div className="complete-phase">
          <h4>🎉 Daily Learning Journey Complete!</h4>
          <div className="summary">
            <h5>Today's Accomplishments:</h5>
            <ul>
              <li>✅ Generated personalized content for {assignments.length} skills</li>
              <li>🎯 Completed guided learning session</li>
              <li>📊 Tracked performance metrics</li>
              <li>🌟 Planned tomorrow's adaptive learning</li>
            </ul>
          </div>
          <button 
            onClick={() => {
              setJourneyPhase('morning');
              setAssignments([]);
              setCurrentAssignment(null);
            }}
            className="restart-btn"
          >
            Start New Day
          </button>
        </div>
      )}

      {/* Current Assignment Display */}
      {currentAssignment && (
        <div className="current-assignment">
          <h4>📝 Current Assignment</h4>
          <div className="assignment-content">
            <h5>{currentAssignment.content.title}</h5>
            <p><strong>Instructions:</strong> {currentAssignment.content.instructions}</p>
            <p><strong>Question:</strong> {currentAssignment.content.question}</p>
            <div className="options">
              {currentAssignment.content.options.map((option, index) => (
                <button key={index} className="option-btn">
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .finn-maestro-integration {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .finn-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .journey-phases {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .phase {
          padding: 10px 15px;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .phase.active {
          background: #007bff;
          color: white;
        }

        .phase.completed {
          background: #28a745;
          color: white;
        }

        .morning-phase, .learning-phase, .evening-phase, .complete-phase {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 20px;
        }

        .assignments-overview ul {
          list-style: none;
          padding: 0;
        }

        .assignments-overview li {
          padding: 10px;
          margin: 5px 0;
          background: #f8f9fa;
          border-radius: 6px;
          border-left: 4px solid #007bff;
        }

        .generate-btn, .start-learning-btn, .plan-tomorrow-btn, .restart-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .generate-btn:hover, .start-learning-btn:hover, .plan-tomorrow-btn:hover, .restart-btn:hover {
          background: #0056b3;
        }

        .generate-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .current-assignment {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 12px;
          padding: 20px;
          margin-top: 20px;
        }

        .options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
          margin-top: 15px;
        }

        .option-btn {
          background: #e9ecef;
          border: 1px solid #dee2e6;
          padding: 10px 15px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .option-btn:hover {
          background: #dee2e6;
          border-color: #007bff;
        }

        .summary ul {
          list-style: none;
          padding: 0;
        }

        .summary li {
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }
      `}</style>
    </div>
  );
};

export default FinnMaestroIntegration;