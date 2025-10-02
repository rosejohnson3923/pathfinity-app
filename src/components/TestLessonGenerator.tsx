/**
 * Test component for unified lesson generation
 * Add this to your App.tsx to test
 */

import React, { useState } from 'react';
import { lessonOrchestrator } from '../services/orchestration/LessonPlanOrchestrator';
import { UnifiedPDFButton } from './UnifiedLessonDownload';

export const TestLessonGenerator: React.FC = () => {
  const [unifiedLesson, setUnifiedLesson] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTestLesson = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Generating unified daily lesson...');

      // Generate unified lesson for test student
      const result = await lessonOrchestrator.generateDailyLessons('student_sam_id');

      console.log('✅ Generated unified lesson:', result);
      if (result && result.unifiedLesson) {
        setUnifiedLesson(result.unifiedLesson);
      } else {
        setError('No unified lesson generated');
      }

    } catch (err) {
      console.error('❌ Error generating unified lesson:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate unified lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h2>🧪 Unified Daily Lesson Test</h2>

      <button
        onClick={generateTestLesson}
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#8B5CF6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1
        }}
      >
        {loading ? 'Generating...' : 'Generate Unified Daily Lesson'}
      </button>

      {error && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#FEE2E2',
          borderLeft: '4px solid #EF4444',
          borderRadius: '4px',
          color: '#991B1B'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {unifiedLesson && (
        <div style={{ marginTop: '20px' }}>
          <h3>📚 Unified Daily Lesson Plan</h3>

          <div
            style={{
              marginBottom: '20px',
              padding: '20px',
              backgroundColor: '#F9FAFB',
              borderRadius: '12px',
              border: '2px solid #E5E7EB'
            }}
          >
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#EFF6FF', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#1E40AF' }}>
                {unifiedLesson.career.icon} Daily Adventure: {unifiedLesson.career.careerName}
              </h4>
              <div style={{ color: '#3B82F6' }}>
                <strong>Student:</strong> {unifiedLesson.student.name} |
                <strong>Grade:</strong> {unifiedLesson.student.gradeLevel} |
                <strong>Date:</strong> {new Date(unifiedLesson.generatedAt).toLocaleDateString()}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h5 style={{ color: '#1F2937', marginBottom: '15px' }}>📅 Today's Complete Curriculum (All Subjects)</h5>

              {Object.keys(unifiedLesson.content.subjectContents).map((subject, index) => {
                const subjectData = unifiedLesson.content.subjectContents[subject];
                const borderColor = subject === 'Math' ? '#3B82F6' :
                                   subject === 'ELA' ? '#10B981' :
                                   subject === 'Science' ? '#F59E0B' : '#8B5CF6';

                return (
                  <div
                    key={index}
                    style={{
                      marginBottom: '15px',
                      padding: '15px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      borderLeft: `4px solid ${borderColor}`,
                      border: '1px solid #E5E7EB'
                    }}
                  >
                    <h5 style={{ margin: '0 0 8px 0', color: '#1F2937' }}>
                      {subject === 'Math' ? '🔢' :
                       subject === 'ELA' ? '📚' :
                       subject === 'Science' ? '🧪' : '🌎'} {subject}
                    </h5>
                    <div style={{ fontSize: '14px', color: '#4B5563', marginBottom: '10px' }}>
                      <strong>Skill:</strong> {subjectData.skill.objective}
                    </div>

                    <div style={{ marginTop: '10px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#6B7280', marginBottom: '8px' }}>
                        Example Challenges (2 of 4 shown):
                      </div>
                      {subjectData.challenges.slice(0, 2).map((challenge, cIdx) => (
                        <div
                          key={cIdx}
                          style={{
                            padding: '10px',
                            marginBottom: '8px',
                            backgroundColor: '#F9FAFB',
                            borderRadius: '6px',
                            fontSize: '13px'
                          }}
                        >
                          <div style={{ fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                            Challenge {cIdx + 1}: {challenge.challenge_summary || 'Interactive activity'}
                          </div>
                          {challenge.hint && (
                            <div style={{ fontSize: '12px', color: '#6B7280', fontStyle: 'italic' }}>
                              💡 {challenge.hint}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#FEF3C7', borderRadius: '8px' }}>
              <h5 style={{ margin: '0 0 8px 0', color: '#78350F' }}>📊 Daily Summary</h5>
              <div style={{ fontSize: '14px', color: '#92400E' }}>
                • Total Subjects: {Object.keys(unifiedLesson.content.subjectContents).length}<br/>
                • Total Challenges: {Object.values(unifiedLesson.content.subjectContents).reduce(
                  (sum: number, subj: any) => sum + (subj.challenges?.length || 0), 0
                )}<br/>
                • Template Type: {unifiedLesson.templateType}<br/>
                • Career Focus: {unifiedLesson.career.careerName}
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <UnifiedPDFButton lessonPlan={unifiedLesson} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};