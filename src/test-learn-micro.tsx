/**
 * Test file for Learn Micro-Generator
 * Demonstrates how the micro-generator adapts master narrative for Learn container
 */

import React, { useState, useEffect } from 'react';
import { masterNarrativeGenerator, MasterNarrative } from './services/narrative/MasterNarrativeGenerator';
import { learnMicroGenerator, LearnContainerContent } from './services/micro-generators/LearnMicroGenerator';

const LearnMicroTest: React.FC = () => {
  const [narrative, setNarrative] = useState<MasterNarrative | null>(null);
  const [learnContent, setLearnContent] = useState<LearnContainerContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCareer, setSelectedCareer] = useState('Doctor');
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [showModal, setShowModal] = useState<'instructional' | 'practice' | 'assessment' | null>(null);

  const testCareers = ['Doctor', 'Teacher', 'Chef', 'Scientist', 'Firefighter'];
  const subjects = ['math', 'ela', 'science', 'socialStudies'];

  // Mock skill data for testing
  const skills = {
    math: { skillCode: 'K.CC.1', skillName: 'Count to 3', description: 'Count to 3 by ones' },
    ela: { skillCode: 'K.RF.1', skillName: 'Recognize Letters', description: 'Recognize uppercase letters A, B, C' },
    science: { skillCode: 'K.PS.1', skillName: 'Identify Shapes', description: 'Identify circles, squares, triangles' },
    socialStudies: { skillCode: 'K.SS.1', skillName: 'Community Helpers', description: 'Understand how people help each other' }
  };

  const generateContent = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🎭 Generating narrative for: ${selectedCareer}`);

      // First generate the master narrative
      const masterNarrative = await masterNarrativeGenerator.generateMasterNarrative({
        studentName: 'Sam',
        gradeLevel: 'K',
        career: selectedCareer,
        subjects: ['math', 'ela', 'science', 'socialStudies']
      });

      setNarrative(masterNarrative);

      // Then generate Learn content using the micro-generator
      console.log(`📚 Generating Learn content for ${selectedSubject}`);
      const content = await learnMicroGenerator.generateLearnContent(
        masterNarrative,
        selectedSubject,
        skills[selectedSubject as keyof typeof skills],
        'K'
      );

      setLearnContent(content);
      console.log('✅ Learn content generated:', content);

    } catch (err: any) {
      console.error('❌ Generation failed:', err);
      setError(err.message || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'system-ui',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#333' }}>📚 Learn Micro-Generator Test</h1>
      <p style={{ color: '#555' }}>
        This demonstrates how the micro-generator adapts the master narrative for specific Learn container content.
      </p>

      <div style={{
        marginBottom: '20px',
        padding: '15px',
        background: '#f0f8ff',
        borderRadius: '8px',
        border: '1px solid #4169e1'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#4169e1' }}>Cost Breakdown:</h3>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>Master Narrative (once): $0.60</li>
          <li>Learn Micro-generation: ~$0.0015 (3 modals × $0.0005)</li>
          <li><strong>Total for 4 subjects × 3 containers: $0.60 + (12 × $0.0015) = $0.618</strong></li>
          <li style={{ color: '#28a745' }}><strong>98.9% cost reduction from $60!</strong></li>
        </ul>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <label>
          Career:
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

        <label>
          Subject:
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            {subjects.map(subject => (
              <option key={subject} value={subject}>
                {subject === 'socialStudies' ? 'Social Studies' : subject.toUpperCase()}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={generateContent}
          disabled={loading}
          style={{
            padding: '5px 15px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Generating...' : 'Generate Content'}
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

      {learnContent && (
        <div>
          {/* Modal Buttons */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
            borderBottom: '2px solid #e0e0e0',
            paddingBottom: '10px'
          }}>
            <button
              onClick={() => setShowModal('instructional')}
              style={{
                padding: '10px 20px',
                background: showModal === 'instructional' ? '#1976d2' : '#fff',
                color: showModal === 'instructional' ? '#fff' : '#1976d2',
                border: '2px solid #1976d2',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              📺 Instructional Modal
            </button>
            <button
              onClick={() => setShowModal('practice')}
              style={{
                padding: '10px 20px',
                background: showModal === 'practice' ? '#388e3c' : '#fff',
                color: showModal === 'practice' ? '#fff' : '#388e3c',
                border: '2px solid #388e3c',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              ✏️ Practice Modal (5 Questions)
            </button>
            <button
              onClick={() => setShowModal('assessment')}
              style={{
                padding: '10px 20px',
                background: showModal === 'assessment' ? '#f57c00' : '#fff',
                color: showModal === 'assessment' ? '#fff' : '#f57c00',
                border: '2px solid #f57c00',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🎯 Assessment Modal (1 Question)
            </button>
          </div>

          {/* Modal Content Display */}
          {showModal === 'instructional' && (
            <div style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <h2 style={{ color: '#1976d2' }}>📺 Instructional Modal</h2>

              <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #dee2e6' }}>
                <h3 style={{ color: '#495057' }}>Introduction</h3>
                <p style={{ color: '#212529' }}>{learnContent.instructional.introduction}</p>
              </div>

              <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #dee2e6' }}>
                <h3 style={{ color: '#495057' }}>YouTube Video</h3>
                <p style={{ color: '#212529' }}><strong>Title:</strong> {learnContent.instructional.video.title}</p>
                <p style={{ color: '#212529' }}><strong>Channel:</strong> {learnContent.instructional.video.channelTitle}</p>
                <p style={{ color: '#212529' }}><strong>Duration:</strong> {Math.floor(learnContent.instructional.video.duration / 60)}:{(learnContent.instructional.video.duration % 60).toString().padStart(2, '0')}</p>
                <p style={{ color: '#212529' }}><strong>Educational Score:</strong> {learnContent.instructional.video.educationalScore}/100</p>
                <div style={{
                  marginTop: '10px',
                  padding: '10px',
                  background: '#e3f2fd',
                  borderRadius: '4px',
                  border: '1px solid #1976d2'
                }}>
                  <small>🎬 Video would be embedded here: {learnContent.instructional.video.embedUrl}</small>
                </div>
              </div>

              <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #dee2e6' }}>
                <h3 style={{ color: '#495057' }}>Learning Objectives</h3>
                <ul style={{ color: '#212529' }}>
                  {learnContent.instructional.learningObjectives?.map((obj, idx) => (
                    <li key={idx}>{obj}</li>
                  )) || <li>No objectives available</li>}
                </ul>
              </div>

              <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #dee2e6' }}>
                <h3 style={{ color: '#495057' }}>Vocabulary Words</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {learnContent.instructional.vocabularyWords?.map((word, idx) => (
                    <span key={idx} style={{
                      padding: '5px 10px',
                      background: '#fff',
                      border: '1px solid #1976d2',
                      borderRadius: '20px'
                    }}>
                      {word}
                    </span>
                  )) || <span>No vocabulary words available</span>}
                </div>
              </div>

              <div style={{ padding: '15px', background: '#e8f5e9', borderRadius: '6px', border: '1px solid #4caf50' }}>
                <h3 style={{ color: '#2e7d32' }}>🎭 Narrative Context</h3>
                <p style={{ color: '#1b5e20' }}>{learnContent.instructional.narrativeContext}</p>
              </div>
            </div>
          )}

          {showModal === 'practice' && (
            <div style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <h2 style={{ color: '#388e3c' }}>✏️ Practice Modal</h2>

              <div style={{ marginBottom: '20px', padding: '15px', background: '#e8f5e9', borderRadius: '6px', border: '1px solid #66bb6a' }}>
                <p style={{ color: '#1b5e20' }}><strong>{learnContent.practice.introduction}</strong></p>
                <p style={{ fontStyle: 'italic', color: '#2e7d32' }}>{learnContent.practice.narrativeContext}</p>
              </div>

              {learnContent.practice.questions?.map((q, idx) => (
                <div key={q.id} style={{
                  marginBottom: '20px',
                  padding: '15px',
                  background: '#f8f9fa',
                  borderRadius: '6px',
                  border: '1px solid #dee2e6'
                }}>
                  <h4 style={{ color: '#495057' }}>Question {idx + 1} ({q.type === 'multiple_choice' ? 'Multiple Choice' : 'True/False'})</h4>
                  <p style={{ color: '#212529' }}><strong>{q.question}</strong></p>

                  {q.visualHint && (
                    <div style={{
                      padding: '10px',
                      background: '#fff3cd',
                      borderRadius: '4px',
                      marginBottom: '10px',
                      color: '#856404',
                      border: '1px solid #ffeaa7'
                    }}>
                      Visual Hint: {q.visualHint}
                    </div>
                  )}

                  {q.type === 'multiple_choice' && q.options && (
                    <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
                      {q.options?.map((opt, optIdx) => (
                        <li key={optIdx} style={{
                          padding: '5px 10px',
                          margin: '5px 0',
                          background: opt === q.correctAnswer ? '#c8e6c9' : '#fff',
                          border: `1px solid ${opt === q.correctAnswer ? '#4caf50' : '#ddd'}`,
                          borderRadius: '4px'
                        }}>
                          {opt} {opt === q.correctAnswer && '✓'}
                        </li>
                      ))}
                    </ul>
                  )}

                  {q.type === 'true_false' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <span style={{
                        padding: '5px 15px',
                        background: q.correctAnswer === true ? '#c8e6c9' : '#fff',
                        border: `1px solid ${q.correctAnswer === true ? '#4caf50' : '#ddd'}`,
                        borderRadius: '4px'
                      }}>
                        True {q.correctAnswer === true && '✓'}
                      </span>
                      <span style={{
                        padding: '5px 15px',
                        background: q.correctAnswer === false ? '#c8e6c9' : '#fff',
                        border: `1px solid ${q.correctAnswer === false ? '#4caf50' : '#ddd'}`,
                        borderRadius: '4px'
                      }}>
                        False {q.correctAnswer === false && '✓'}
                      </span>
                    </div>
                  )}

                  <p style={{ marginTop: '10px', fontStyle: 'italic', color: '#495057' }}>
                    <strong>Explanation:</strong> {q.explanation}
                  </p>
                </div>
              ))}

              <div style={{ padding: '15px', background: '#fff3cd', borderRadius: '6px', border: '1px solid #ffeaa7' }}>
                <h4 style={{ color: '#856404' }}>💪 Encouragement Messages</h4>
                <ul style={{ color: '#856404' }}>
                  {learnContent.practice.encouragement?.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {showModal === 'assessment' && learnContent.assessment && (
            <div style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <h2 style={{ color: '#f57c00' }}>🎯 Assessment Modal</h2>

              <div style={{ marginBottom: '20px', padding: '15px', background: '#fff3e0', borderRadius: '6px', border: '1px solid #ffcc80' }}>
                <h3 style={{ color: '#e65100' }}>Summative Assessment</h3>
                <p style={{ fontStyle: 'italic', color: '#bf360c' }}>{learnContent.assessment.narrativeContext}</p>
              </div>

              <div style={{
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '6px',
                border: '2px solid #f57c00'
              }}>
                <h3 style={{ color: '#212529' }}>{learnContent.assessment.question?.question || 'Assessment Question'}</h3>

                {learnContent.assessment.question?.type === 'multiple_choice' && learnContent.assessment.question?.options && (
                  <div style={{ marginTop: '15px' }}>
                    {learnContent.assessment.question.options?.map((opt, idx) => (
                      <div key={idx} style={{
                        padding: '10px',
                        margin: '10px 0',
                        background: opt === learnContent.assessment.question.correctAnswer ? '#c8e6c9' : '#fff',
                        border: `2px solid ${opt === learnContent.assessment.question.correctAnswer ? '#4caf50' : '#ddd'}`,
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}>
                        {String.fromCharCode(65 + idx)}. {opt} {opt === learnContent.assessment.question?.correctAnswer && '✓'}
                      </div>
                    ))}
                  </div>
                )}

                {learnContent.assessment.question?.type === 'true_false' && (
                  <div style={{ marginTop: '15px', display: 'flex', gap: '20px' }}>
                    <div style={{
                      padding: '15px 30px',
                      background: learnContent.assessment.question?.correctAnswer === true ? '#c8e6c9' : '#fff',
                      border: `2px solid ${learnContent.assessment.question?.correctAnswer === true ? '#4caf50' : '#ddd'}`,
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>
                      True {learnContent.assessment.question?.correctAnswer === true && '✓'}
                    </div>
                    <div style={{
                      padding: '15px 30px',
                      background: learnContent.assessment.question?.correctAnswer === false ? '#c8e6c9' : '#fff',
                      border: `2px solid ${learnContent.assessment.question?.correctAnswer === false ? '#4caf50' : '#ddd'}`,
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}>
                      False {learnContent.assessment.question?.correctAnswer === false && '✓'}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '20px', padding: '10px', background: '#e3f2fd', borderRadius: '4px', border: '1px solid #90caf9' }}>
                  <strong style={{ color: '#0d47a1' }}>Explanation:</strong>
                  <span style={{ color: '#1565c0' }}> {learnContent.assessment.question?.explanation || 'Explanation not available'}</span>
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
                <div style={{
                  flex: 1,
                  padding: '15px',
                  background: '#c8e6c9',
                  borderRadius: '6px',
                  border: '1px solid #4caf50'
                }}>
                  <h4 style={{ color: '#2e7d32' }}>✅ Correct Feedback</h4>
                  <p style={{ color: '#1b5e20' }}>{learnContent.assessment.feedback?.correct || 'Great job!'}</p>
                </div>
                <div style={{
                  flex: 1,
                  padding: '15px',
                  background: '#ffcdd2',
                  borderRadius: '6px',
                  border: '1px solid #f44336'
                }}>
                  <h4 style={{ color: '#c62828' }}>❌ Incorrect Feedback</h4>
                  <p style={{ color: '#b71c1c' }}>{learnContent.assessment.feedback?.incorrect || 'Try again!'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: '#e8e9ea',
            borderRadius: '6px',
            fontSize: '12px',
            border: '1px solid #ced4da'
          }}>
            <h4 style={{ color: '#495057' }}>Metadata</h4>
            <p style={{ color: '#212529' }}><strong>Narrative ID:</strong> {learnContent.metadata.narrativeId}</p>
            <p style={{ color: '#212529' }}><strong>Subject:</strong> {learnContent.metadata.subject}</p>
            <p style={{ color: '#212529' }}><strong>Skill:</strong> {learnContent.metadata.skill}</p>
            <p style={{ color: '#212529' }}><strong>Generated:</strong> {new Date(learnContent.metadata.generatedAt).toLocaleString()}</p>
            <p style={{ color: '#212529' }}><strong>Cost:</strong> ${learnContent.metadata.totalCost}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnMicroTest;