/**
 * AI CONTAINER TEST COMPONENT
 * Simple way to test the new AI-first three-container system
 */

import React from 'react';
import { AIThreeContainerJourney } from '../ai-containers/AIThreeContainerJourney';
import { AIThreeContainerJourneyAuto } from '../routing/ContainerRouter';
import type { StudentProfile, LearningSkill } from '../../services/AILearningJourneyService';

const AIContainerTest: React.FC = () => {
  // Demo student profile
  const demoStudent: StudentProfile = {
    id: 'sam-brown-demo',
    display_name: 'Sam Brown',
    grade_level: 'K',
    interests: ['animals', 'colors', 'counting'],
    learning_style: 'visual'
  };

  // Demo skill
  const demoSkill: LearningSkill = {
    skill_number: 'K.CC.A.1',
    skill_name: 'Count to 100 by ones and tens',
    subject: 'Math',
    grade_level: 'K'
  };

  const handleJourneyComplete = () => {
    console.log('🎉 AI Three-Container Journey Complete!');
    alert('🎉 Amazing! You completed the entire AI-generated learning journey!');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <header style={{
          textAlign: 'center',
          marginBottom: '2rem',
          padding: '2rem',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          color: 'white',
          borderRadius: '1rem'
        }}>
          <h1 style={{ margin: '0 0 1rem 0' }}>🤖 AI-First Learning Journey Test</h1>
          <p style={{ margin: '0', opacity: 0.9 }}>
            Complete AI-generated Learn → Experience → Discover journey
          </p>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginTop: '1rem'
          }}>
            <p style={{ margin: '0', fontSize: '0.9rem' }}>
              <strong>Student:</strong> {demoStudent.display_name} (Grade {demoStudent.grade_level})<br/>
              <strong>Skill:</strong> {demoSkill.skill_name}<br/>
              <strong>Subject:</strong> {demoSkill.subject}
            </p>
          </div>
        </header>

        <AIThreeContainerJourneyAuto
          student={demoStudent}
          skill={demoSkill}
          onJourneyComplete={handleJourneyComplete}
        />
      </div>
    </div>
  );
};

export default AIContainerTest;