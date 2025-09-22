/**
 * Test Page for BentoLearnCardV2Enhanced
 * Tests the integrated Narrative-First Architecture with existing production components
 */

import React, { useState } from 'react';
import BentoLearnCardV2Enhanced from './components/bento/BentoLearnCardV2Enhanced';
import { DollarSign, Activity, Users, Zap } from 'lucide-react';
import './design-system/index.css';

const TestBentoEnhanced: React.FC = () => {
  const [showComponent, setShowComponent] = useState(false);
  const [selectedCareer, setSelectedCareer] = useState('doctor');
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [completionData, setCompletionData] = useState<any>(null);

  const careers = [
    { id: 'doctor', name: 'Doctor', icon: '👨‍⚕️', color: '#FF6B6B' },
    { id: 'teacher', name: 'Teacher', icon: '👩‍🏫', color: '#4ECDC4' },
    { id: 'engineer', name: 'Engineer', icon: '👷', color: '#45B7D1' },
    { id: 'artist', name: 'Artist', icon: '🎨', color: '#FFA07A' },
    { id: 'scientist', name: 'Scientist', icon: '🔬', color: '#98D8C8' },
    { id: 'chef', name: 'Chef', icon: '👨‍🍳', color: '#F7DC6F' }
  ];

  const subjects = [
    {
      id: 'math',
      name: 'Mathematics',
      icon: '🔢',
      skill: {
        skillCode: 'K.CC.1',
        skillName: 'Count to 3',
        description: 'Count to 3 by ones and recognize numbers'
      }
    },
    {
      id: 'ela',
      name: 'English Language Arts',
      icon: '📚',
      skill: {
        skillCode: 'K.RF.1',
        skillName: 'Recognize Letters',
        description: 'Recognize and name uppercase letters A, B, C'
      }
    },
    {
      id: 'science',
      name: 'Science',
      icon: '🔬',
      skill: {
        skillCode: 'K.PS.1',
        skillName: 'Identify Shapes',
        description: 'Identify and describe circles, squares, triangles'
      }
    },
    {
      id: 'socialStudies',
      name: 'Social Studies',
      icon: '🗺️',
      skill: {
        skillCode: 'K.SS.1',
        skillName: 'Community Helpers',
        description: 'Understand how people help each other in communities'
      }
    }
  ];

  const handleComplete = (success: boolean) => {
    console.log('BentoLearnCardV2Enhanced completed:', success);
    setCompletionData({
      success,
      career: selectedCareer,
      subject: selectedSubject,
      timestamp: new Date()
    });
    setShowComponent(false);
  };

  const currentSubject = subjects.find(s => s.id === selectedSubject)!;
  const currentCareer = careers.find(c => c.id === selectedCareer)!;

  return (
    <div className="min-h-screen ds-bg-gradient-subtle">
      {!showComponent ? (
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold ds-text-content-primary mb-4">
              BentoLearnCardV2 Enhanced Test
            </h1>
            <p className="text-lg ds-text-content-secondary mb-6">
              Production Component + Narrative-First Architecture
            </p>
            <div className="flex items-center justify-center space-x-4">
              <span className="ds-badge-primary">
                <Zap className="w-4 h-4 inline mr-1" />
                Instruction + Practice + Assessment
              </span>
              <span className="ds-badge-success">98.9% Cost Reduction</span>
              <span className="ds-badge-info">YouTube Videos Integrated</span>
            </div>
          </div>

          {/* Architecture Overview */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="ds-card-primary p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="h-8 w-8 ds-text-primary" />
                <span className="text-xs ds-text-content-tertiary">Phase 1</span>
              </div>
              <h3 className="font-semibold ds-text-content-primary mb-1">Instruction</h3>
              <p className="text-sm ds-text-content-secondary mb-2">
                NEW: YouTube videos with career narrative
              </p>
              <div className="text-xs ds-text-content-tertiary">
                InstructionalVideoComponent
              </div>
            </div>

            <div className="ds-card-secondary p-6">
              <div className="flex items-center justify-between mb-4">
                <Activity className="h-8 w-8 ds-text-accent" />
                <span className="text-xs ds-text-content-tertiary">Phase 2</span>
              </div>
              <h3 className="font-semibold ds-text-content-primary mb-1">Practice</h3>
              <p className="text-sm ds-text-content-secondary mb-2">
                EXISTING: Production modal with XP
              </p>
              <div className="text-xs ds-text-content-tertiary">
                BentoLearnCardV2 (unchanged)
              </div>
            </div>

            <div className="ds-card-info p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="h-8 w-8 ds-text-info" />
                <span className="text-xs ds-text-content-tertiary">Phase 3</span>
              </div>
              <h3 className="font-semibold ds-text-content-primary mb-1">Assessment</h3>
              <p className="text-sm ds-text-content-secondary mb-2">
                EXISTING: Production modal with feedback
              </p>
              <div className="text-xs ds-text-content-tertiary">
                BentoLearnCardV2 (unchanged)
              </div>
            </div>
          </div>

          {/* Configuration Section */}
          <div className="ds-card-primary p-6 mb-8">
            <h2 className="text-xl font-semibold ds-text-content-primary mb-6">
              Configure Learning Journey
            </h2>

            {/* Career Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium ds-text-content-secondary mb-3">
                Select Career Path
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {careers.map(career => (
                  <button
                    key={career.id}
                    onClick={() => setSelectedCareer(career.id)}
                    className={`p-4 rounded-lg transition-all transform hover:scale-105 ${
                      selectedCareer === career.id
                        ? 'ring-2 ring-offset-2'
                        : 'ds-card-secondary hover:ds-shadow-hover'
                    }`}
                    style={{
                      backgroundColor: selectedCareer === career.id ? career.color + '20' : undefined,
                      borderColor: selectedCareer === career.id ? career.color : undefined,
                      '--tw-ring-color': career.color
                    } as any}
                  >
                    <div className="text-3xl mb-2">{career.icon}</div>
                    <div className="text-sm font-medium ds-text-content-primary">{career.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium ds-text-content-secondary mb-3">
                Select Subject & Skill
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {subjects.map(subject => (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject.id)}
                    className={`p-4 rounded-lg text-left transition-all ${
                      selectedSubject === subject.id
                        ? 'ds-bg-primary/10 ds-border-primary border-2'
                        : 'ds-card-secondary hover:ds-shadow-hover border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{subject.icon}</span>
                      <div className="font-semibold ds-text-content-primary">
                        {subject.name}
                      </div>
                    </div>
                    <div className="text-sm ds-text-content-secondary mb-1">
                      {subject.skill.skillName}
                    </div>
                    <div className="text-xs ds-text-content-tertiary">
                      Code: {subject.skill.skillCode}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Student Info */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="ds-card-secondary p-4">
                <label className="text-sm font-medium ds-text-content-secondary">Student</label>
                <p className="text-lg font-semibold ds-text-content-primary">Sam</p>
              </div>
              <div className="ds-card-secondary p-4">
                <label className="text-sm font-medium ds-text-content-secondary">Grade</label>
                <p className="text-lg font-semibold ds-text-content-primary">Kindergarten</p>
              </div>
              <div className="ds-card-secondary p-4">
                <label className="text-sm font-medium ds-text-content-secondary">Mode</label>
                <p className="text-lg font-semibold ds-text-primary">Full Journey</p>
              </div>
            </div>

            {/* Preview */}
            <div className="ds-card-accent p-4 mb-6">
              <h3 className="font-semibold ds-text-content-primary mb-2">Journey Preview</h3>
              <p className="text-sm ds-text-content-secondary">
                Sam will learn <strong>{currentSubject.skill.skillName}</strong> through the lens
                of becoming a <strong>{currentCareer.name}</strong>. The journey includes:
              </p>
              <ol className="list-decimal list-inside mt-3 space-y-1 text-sm ds-text-content-secondary">
                <li>Watch educational videos with career context</li>
                <li>Practice with {currentCareer.name}-themed questions</li>
                <li>Complete assessment to show mastery</li>
              </ol>
            </div>

            {/* Launch Button */}
            <button
              onClick={() => setShowComponent(true)}
              className="ds-btn-primary ds-btn-lg w-full group"
            >
              <span className="flex items-center justify-center space-x-2">
                <span>Launch Enhanced BentoLearnCardV2</span>
                <span className="text-2xl group-hover:translate-x-1 transition-transform">
                  {currentCareer.icon}
                </span>
              </span>
            </button>
          </div>

          {/* Results Display */}
          {completionData && (
            <div className="ds-card-success p-6 animate-fade-in">
              <h2 className="text-xl font-semibold ds-text-content-primary mb-4">
                Journey Complete! 🎉
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="ds-card-secondary p-3">
                  <p className="text-sm ds-text-content-secondary">Status</p>
                  <p className="text-lg font-bold ds-text-success">
                    {completionData.success ? 'Success' : 'Keep Practicing'}
                  </p>
                </div>
                <div className="ds-card-secondary p-3">
                  <p className="text-sm ds-text-content-secondary">Career</p>
                  <p className="text-lg font-bold ds-text-content-primary capitalize">
                    {completionData.career}
                  </p>
                </div>
                <div className="ds-card-secondary p-3">
                  <p className="text-sm ds-text-content-secondary">Subject</p>
                  <p className="text-lg font-bold ds-text-content-primary capitalize">
                    {completionData.subject}
                  </p>
                </div>
                <div className="ds-card-secondary p-3">
                  <p className="text-sm ds-text-content-secondary">Time</p>
                  <p className="text-lg font-bold ds-text-content-primary">
                    {new Date(completionData.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Technical Info */}
          <div className="mt-8 p-6 ds-card-info">
            <h3 className="font-semibold ds-text-content-primary mb-3">
              Technical Implementation
            </h3>
            <div className="grid grid-cols-2 gap-6 text-sm ds-text-content-secondary">
              <div>
                <h4 className="font-semibold mb-2">Components Used:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>InstructionalVideoComponent (NEW)</li>
                  <li>BentoLearnCardV2 (EXISTING)</li>
                  <li>NarrativeToBentoAdapter (NEW)</li>
                  <li>ContentOrchestrator (NEW)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Data Flow:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Master Narrative → $0.60 (GPT-4)</li>
                  <li>Learn Micro-Gen → $0.0015 (GPT-3.5)</li>
                  <li>Adapted to BentoQuestion format</li>
                  <li>Rendered in production modals</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <BentoLearnCardV2Enhanced
          studentName="Sam"
          gradeLevel="Kindergarten"
          career={selectedCareer}
          subject={selectedSubject}
          skill={currentSubject.skill}
          onComplete={handleComplete}
          onBack={() => setShowComponent(false)}
          useMockData={false} // Set to true to use mock data for testing
        />
      )}
    </div>
  );
};

export default TestBentoEnhanced;