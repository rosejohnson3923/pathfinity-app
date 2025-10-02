/**
 * Test file for Master Narrative Generator
 * Run this to test narrative generation for different careers
 */

import React, { useState } from 'react';
import { masterNarrativeGenerator, MasterNarrative } from './services/narrative/MasterNarrativeGenerator';

const NarrativeTest: React.FC = () => {
  const [narrative, setNarrative] = useState<MasterNarrative | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCareer, setSelectedCareer] = useState('Doctor');

  const testCareers = [
    'Doctor',
    'Teacher',
    'Chef',
    'Scientist',
    'Artist',
    'Police Officer',
    'Firefighter',
    'Veterinarian',
    'Engineer',
    'Basketball Coach'
  ];

  const generateNarrative = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🎭 Generating narrative for: ${selectedCareer}`);

      const result = await masterNarrativeGenerator.generateMasterNarrative({
        studentName: 'Sam',
        gradeLevel: 'K',
        career: selectedCareer,
        subjects: ['math', 'ela', 'science', 'socialStudies']
      });

      setNarrative(result);
      console.log('✅ Narrative generated:', result);

    } catch (err) {
      console.error('❌ Generation failed:', err);
      setError(err.message || 'Failed to generate narrative');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>🎭 Master Narrative Generator Test</h1>

      <div style={{ marginBottom: '20px' }}>
        <label>
          Select Career:
          <select
            value={selectedCareer}
            onChange={(e) => setSelectedCareer(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            {testCareers.map(career => (
              <option key={career} value={career}>{career}</option>
            ))}
          </select>
        </label>

        <button
          onClick={generateNarrative}
          disabled={loading}
          style={{
            marginLeft: '10px',
            padding: '5px 15px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Generating...' : 'Generate Narrative'}
        </button>
      </div>

      {error && (
        <div style={{
          background: '#ffebee',
          color: '#c62828',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          ❌ Error: {error}
        </div>
      )}

      {narrative && (
        <div style={{
          background: '#ffffff',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          color: '#333333'
        }}>
          <h2 style={{ color: '#1976d2', marginBottom: '20px' }}>Generated Narrative</h2>

          <div style={{
            marginBottom: '20px',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #dee2e6'
          }}>
            <h3 style={{ color: '#495057', marginBottom: '10px' }}>📋 Metadata</h3>
            <p style={{ color: '#212529', margin: '5px 0' }}><strong>ID:</strong> {narrative.narrativeId}</p>
            <p style={{ color: '#212529', margin: '5px 0' }}><strong>Generated:</strong> {new Date(narrative.generatedAt).toLocaleString()}</p>
            <p style={{ color: '#212529', margin: '5px 0' }}><strong>Cost:</strong> ${narrative.generationCost}</p>
          </div>

          <div style={{
            marginBottom: '20px',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #dee2e6'
          }}>
            <h3 style={{ color: '#495057', marginBottom: '10px' }}>👤 Character</h3>
            <p style={{ color: '#212529', margin: '5px 0' }}><strong>Name:</strong> {narrative.character.name}</p>
            <p style={{ color: '#212529', margin: '5px 0' }}><strong>Role:</strong> {narrative.character.role}</p>
            <p style={{ color: '#212529', margin: '5px 0' }}><strong>Workplace:</strong> {narrative.character.workplace}</p>
            <p style={{ color: '#212529', margin: '5px 0' }}><strong>Personality:</strong> {narrative.character.personality}</p>
            <p style={{ color: '#212529', margin: '5px 0' }}><strong>Equipment:</strong> {narrative.character.equipment.join(', ')}</p>
          </div>

          <div style={{
            marginBottom: '20px',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #dee2e6'
          }}>
            <h3 style={{ color: '#495057', marginBottom: '10px' }}>🎯 Journey Arc</h3>
            <p style={{ color: '#212529', margin: '5px 0' }}><strong>Check-In:</strong> {narrative.journeyArc.checkIn}</p>
            <p style={{ color: '#212529', margin: '5px 0' }}><strong>Learn:</strong> {narrative.journeyArc.learn}</p>
            <p style={{ color: '#212529', margin: '5px 0' }}><strong>Experience:</strong> {narrative.journeyArc.experience}</p>
            <p style={{ color: '#212529', margin: '5px 0' }}><strong>Discover:</strong> {narrative.journeyArc.discover}</p>
          </div>

          <div style={{
            marginBottom: '20px',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #dee2e6'
          }}>
            <h3 style={{ color: '#495057', marginBottom: '10px' }}>📖 Story</h3>
            <p style={{ color: '#212529', margin: '5px 0' }}><strong>Mission:</strong> {narrative.cohesiveStory.mission}</p>
            <p style={{ color: '#212529', margin: '5px 0' }}><strong>Through Line:</strong> {narrative.cohesiveStory.throughLine}</p>
          </div>

          <div style={{
            marginBottom: '20px',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #dee2e6'
          }}>
            <h3 style={{ color: '#495057', marginBottom: '10px' }}>📍 Settings</h3>

            <div style={{ marginLeft: '20px' }}>
              <h4 style={{ color: '#6c757d', marginTop: '15px' }}>Learn</h4>
              <p style={{ color: '#212529', margin: '5px 0' }}><strong>Location:</strong> {narrative.settingProgression.learn.location}</p>
              <p style={{ color: '#212529', margin: '5px 0' }}><strong>Context:</strong> {narrative.settingProgression.learn.context}</p>

              <h4 style={{ color: '#6c757d', marginTop: '15px' }}>Experience</h4>
              <p style={{ color: '#212529', margin: '5px 0' }}><strong>Location:</strong> {narrative.settingProgression.experience.location}</p>
              <p style={{ color: '#212529', margin: '5px 0' }}><strong>Context:</strong> {narrative.settingProgression.experience.context}</p>

              <h4 style={{ color: '#6c757d', marginTop: '15px' }}>Discover</h4>
              <p style={{ color: '#212529', margin: '5px 0' }}><strong>Location:</strong> {narrative.settingProgression.discover.location}</p>
              <p style={{ color: '#212529', margin: '5px 0' }}><strong>Context:</strong> {narrative.settingProgression.discover.context}</p>
            </div>
          </div>

          <div style={{
            marginBottom: '20px',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #dee2e6'
          }}>
            <h3 style={{ color: '#495057', marginBottom: '10px' }}>📚 Subject Contexts</h3>

            <div style={{ marginLeft: '20px' }}>
              <h4 style={{ color: '#6c757d', marginTop: '15px' }}>Math</h4>
              <p style={{ color: '#212529', margin: '5px 0' }}><strong>Learn:</strong> {narrative.subjectContextsAligned.math.learn}</p>
              <p style={{ color: '#212529', margin: '5px 0' }}><strong>Experience:</strong> {narrative.subjectContextsAligned.math.experience}</p>
              <p style={{ color: '#212529', margin: '5px 0' }}><strong>Discover:</strong> {narrative.subjectContextsAligned.math.discover}</p>

              <h4 style={{ color: '#6c757d', marginTop: '15px' }}>ELA</h4>
              <p style={{ color: '#212529', margin: '5px 0' }}><strong>Learn:</strong> {narrative.subjectContextsAligned.ela.learn}</p>
              <p style={{ color: '#212529', margin: '5px 0' }}><strong>Experience:</strong> {narrative.subjectContextsAligned.ela.experience}</p>
              <p style={{ color: '#212529', margin: '5px 0' }}><strong>Discover:</strong> {narrative.subjectContextsAligned.ela.discover}</p>

              <h4 style={{ color: '#6c757d', marginTop: '15px' }}>Science</h4>
              <p style={{ color: '#212529', margin: '5px 0' }}><strong>Learn:</strong> {narrative.subjectContextsAligned.science.learn}</p>
              <p style={{ color: '#212529', margin: '5px 0' }}><strong>Experience:</strong> {narrative.subjectContextsAligned.science.experience}</p>
              <p style={{ color: '#212529', margin: '5px 0' }}><strong>Discover:</strong> {narrative.subjectContextsAligned.science.discover}</p>

              <h4 style={{ color: '#6c757d', marginTop: '15px' }}>Social Studies</h4>
              <p style={{ color: '#212529', margin: '5px 0' }}><strong>Learn:</strong> {narrative.subjectContextsAligned.socialStudies.learn}</p>
              <p style={{ color: '#212529', margin: '5px 0' }}><strong>Experience:</strong> {narrative.subjectContextsAligned.socialStudies.experience}</p>
              <p style={{ color: '#212529', margin: '5px 0' }}><strong>Discover:</strong> {narrative.subjectContextsAligned.socialStudies.discover}</p>
            </div>
          </div>

          <div style={{
            marginBottom: '20px',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #dee2e6'
          }}>
            <h3 style={{ color: '#495057', marginBottom: '10px' }}>🎨 Visual Theme</h3>
            <p style={{ color: '#212529', margin: '5px 0' }}><strong>Colors:</strong> {narrative.visualTheme.colors}</p>
            <p style={{ color: '#212529', margin: '5px 0' }}><strong>Setting:</strong> {narrative.visualTheme.setting}</p>
            <p style={{ color: '#212529', margin: '5px 0' }}><strong>Props:</strong> {narrative.visualTheme.props}</p>
          </div>

          <div style={{
            marginBottom: '20px',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #dee2e6'
          }}>
            <h3 style={{ color: '#495057', marginBottom: '10px' }}>📋 Raw JSON</h3>
            <details>
              <summary style={{ cursor: 'pointer', color: '#0066cc' }}>Click to expand</summary>
              <pre style={{
                background: '#282c34',
                color: '#abb2bf',
                padding: '15px',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px',
                marginTop: '10px'
              }}>
                {JSON.stringify(narrative, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};

export default NarrativeTest;