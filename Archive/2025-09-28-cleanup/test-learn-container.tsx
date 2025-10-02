/**
 * Test Page for Narrative Learn Container
 * Tests the integrated Instructional, Practice, and Assessment phases
 */

import React, { useState } from 'react';
import NarrativeLearnContainer from './components/containers/NarrativeLearnContainer';
import { DollarSign, Activity, Users } from 'lucide-react';
import './design-system/index.css';

const TestLearnContainer: React.FC = () => {
  const [showContainer, setShowContainer] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState('doctor');
  const [results, setResults] = useState<any>(null);
  const [costMetrics, setCostMetrics] = useState({
    narrativeCost: 0.60,
    microGenCost: 0.0015,
    totalCost: 0.6015,
    traditionalCost: 5.00,
    savings: 4.3985
  });

  const careers = [
    { id: 'doctor', name: 'Doctor', icon: '👨‍⚕️' },
    { id: 'teacher', name: 'Teacher', icon: '👩‍🏫' },
    { id: 'engineer', name: 'Engineer', icon: '👷' },
    { id: 'artist', name: 'Artist', icon: '🎨' },
    { id: 'scientist', name: 'Scientist', icon: '🔬' },
    { id: 'chef', name: 'Chef', icon: '👨‍🍳' }
  ];

  const subjects = [
    { id: 'math', name: 'Math', skill: { skillCode: 'K.CC.1', skillName: 'Count to 3', description: 'Count to 3 by ones' } },
    { id: 'ela', name: 'ELA', skill: { skillCode: 'K.RF.1', skillName: 'Recognize Letters', description: 'Recognize uppercase letters A, B, C' } },
    { id: 'science', name: 'Science', skill: { skillCode: 'K.PS.1', skillName: 'Identify Shapes', description: 'Identify circles, squares, triangles' } },
    { id: 'socialStudies', name: 'Social Studies', skill: { skillCode: 'K.SS.1', skillName: 'Community Helpers', description: 'Understand how people help each other' } }
  ];

  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);

  const handleComplete = (results: any) => {
    console.log('Learn Container Complete:', results);
    setResults(results);
    setShowContainer(false);
  };

  return (
    <div className="min-h-screen ds-bg-gradient-subtle">
      {!showContainer ? (
        <div className="max-w-6xl mx-auto p-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold ds-text-content-primary mb-4">
              Narrative Learn Container Test
            </h1>
            <p className="text-lg ds-text-content-secondary">
              Test the integrated Instructional (Video), Practice, and Assessment phases
            </p>
            <div className="flex items-center justify-center space-x-4 mt-4">
              <span className="ds-badge-primary">Phase 1: Real-time Generation</span>
              <span className="ds-badge-success">98.9% Cost Reduction</span>
              <span className="ds-badge-info">Narrative-First Architecture</span>
            </div>
          </div>

          {/* Cost Metrics */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="ds-card-primary p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="h-8 w-8 ds-text-primary" />
                <span className="ds-badge-success">-98.9%</span>
              </div>
              <h3 className="font-semibold ds-text-content-primary mb-1">Total Cost</h3>
              <p className="text-2xl font-bold ds-text-primary">${costMetrics.totalCost.toFixed(4)}</p>
              <p className="text-sm ds-text-content-tertiary mt-2">
                vs ${costMetrics.traditionalCost.toFixed(2)} traditional
              </p>
            </div>

            <div className="ds-card-secondary p-6">
              <div className="flex items-center justify-between mb-4">
                <Activity className="h-8 w-8 ds-text-accent" />
              </div>
              <h3 className="font-semibold ds-text-content-primary mb-1">Master Narrative</h3>
              <p className="text-2xl font-bold ds-text-accent">${costMetrics.narrativeCost.toFixed(2)}</p>
              <p className="text-sm ds-text-content-tertiary mt-2">
                One-time generation (GPT-4)
              </p>
            </div>

            <div className="ds-card-info p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="h-8 w-8 ds-text-info" />
              </div>
              <h3 className="font-semibold ds-text-content-primary mb-1">Micro-Generation</h3>
              <p className="text-2xl font-bold ds-text-info">${costMetrics.microGenCost.toFixed(4)}</p>
              <p className="text-sm ds-text-content-tertiary mt-2">
                Per container (GPT-3.5)
              </p>
            </div>
          </div>

          {/* Configuration */}
          <div className="ds-card-primary p-6 mb-8">
            <h2 className="text-xl font-semibold ds-text-content-primary mb-6">
              Test Configuration
            </h2>

            {/* Career Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium ds-text-content-secondary mb-3">
                Select Career Path
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {careers.map(career => (
                  <button
                    key={career.id}
                    onClick={() => setSelectedCareer(career.id)}
                    className={`p-3 rounded-lg transition-all ${
                      selectedCareer === career.id
                        ? 'ds-bg-primary ds-text-white'
                        : 'ds-bg-surface-secondary hover:ds-bg-surface-tertiary'
                    }`}
                  >
                    <div className="text-2xl mb-1">{career.icon}</div>
                    <div className="text-sm font-medium">{career.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium ds-text-content-secondary mb-3">
                Select Subject & Skill
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {subjects.map(subject => (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject)}
                    className={`p-4 rounded-lg text-left transition-all ${
                      selectedSubject.id === subject.id
                        ? 'ds-bg-primary/10 ds-border-primary border-2'
                        : 'ds-card-secondary hover:ds-shadow-hover'
                    }`}
                  >
                    <div className="font-semibold ds-text-content-primary mb-1">
                      {subject.name}
                    </div>
                    <div className="text-sm ds-text-content-secondary mb-2">
                      {subject.skill.skillName}
                    </div>
                    <div className="text-xs ds-text-content-tertiary">
                      {subject.skill.skillCode}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Student Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="ds-card-secondary p-4">
                <label className="text-sm font-medium ds-text-content-secondary">Student Name</label>
                <p className="text-lg font-semibold ds-text-content-primary">Sam</p>
              </div>
              <div className="ds-card-secondary p-4">
                <label className="text-sm font-medium ds-text-content-secondary">Grade Level</label>
                <p className="text-lg font-semibold ds-text-content-primary">Kindergarten</p>
              </div>
            </div>

            {/* Launch Button */}
            <button
              onClick={() => setShowContainer(true)}
              className="ds-btn-primary ds-btn-lg w-full"
            >
              Launch Learn Container
            </button>
          </div>

          {/* Results Display */}
          {results && (
            <div className="ds-card-success p-6">
              <h2 className="text-xl font-semibold ds-text-content-primary mb-4">
                Learning Session Complete! 🎉
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="ds-card-secondary p-3">
                  <p className="text-sm ds-text-content-secondary">Final Score</p>
                  <p className="text-xl font-bold ds-text-primary">{results.score}%</p>
                </div>
                <div className="ds-card-secondary p-3">
                  <p className="text-sm ds-text-content-secondary">Time Spent</p>
                  <p className="text-xl font-bold ds-text-content-primary">
                    {Math.round(results.timeSpent / 1000 / 60)} min
                  </p>
                </div>
                <div className="ds-card-secondary p-3">
                  <p className="text-sm ds-text-content-secondary">Attempts</p>
                  <p className="text-xl font-bold ds-text-content-primary">{results.attempts}</p>
                </div>
                <div className="ds-card-secondary p-3">
                  <p className="text-sm ds-text-content-secondary">Career Context</p>
                  <p className="text-xl font-bold ds-text-accent capitalize">
                    {results.narrativeContext?.career || selectedCareer}
                  </p>
                </div>
              </div>
              {results.phaseResults && (
                <div className="mt-4 pt-4 border-t ds-border-subtle">
                  <p className="text-sm ds-text-content-secondary mb-2">Phase Breakdown:</p>
                  <div className="flex items-center space-x-6 text-sm">
                    <span className="ds-text-content-primary">
                      Instructional: {results.phaseResults.instructional.completed ? '✅' : '❌'}
                    </span>
                    <span className="ds-text-content-primary">
                      Practice: {results.phaseResults.practice.score}%
                    </span>
                    <span className="ds-text-content-primary">
                      Assessment: {results.phaseResults.assessment.score}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Architecture Info */}
          <div className="mt-8 p-6 ds-card-info">
            <h3 className="font-semibold ds-text-content-primary mb-3">
              Narrative-First Architecture Flow
            </h3>
            <ol className="list-decimal list-inside space-y-2 ds-text-content-secondary text-sm">
              <li>Generate Master Narrative (GPT-4, $0.60) - Creates comprehensive story for all subjects</li>
              <li>Generate Learn Micro-Content (GPT-3.5, $0.0015) - Adapts narrative for specific skill</li>
              <li>Phase 1: Instructional - YouTube videos wrapped in career context</li>
              <li>Phase 2: Practice - Interactive questions with narrative elements</li>
              <li>Phase 3: Assessment - Final evaluation within career story</li>
            </ol>
            <p className="mt-4 text-xs ds-text-content-tertiary">
              Note: Phase 1 implementation uses real-time generation without caching.
            </p>
          </div>
        </div>
      ) : (
        <NarrativeLearnContainer
          studentName="Sam"
          gradeLevel="Kindergarten"
          career={selectedCareer}
          subject={selectedSubject.id}
          skill={selectedSubject.skill}
          onComplete={handleComplete}
          onExit={() => setShowContainer(false)}
        />
      )}
    </div>
  );
};

export default TestLearnContainer;