/**
 * Test Component for Select Lesson Template
 * Demonstrates how the Select subscription generates lessons
 */

import React, { useState } from 'react';
import { selectLessonTemplateV3 as selectLessonTemplate, SelectLessonInput, DemonstrativeLesson } from '../templates/SelectLessonTemplateV3';

export const TestSelectLessonTemplate: React.FC = () => {
  const [generatedLesson, setGeneratedLesson] = useState<DemonstrativeLesson | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'narrative' | 'skills' | 'rubric'>('overview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCareerIndex, setCurrentCareerIndex] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedUpgrade, setSelectedUpgrade] = useState<string>('');

  // Redesigned career options: 2 Select + 3 Tier Previews
  const CAREER_OPTIONS = [
    // Select Careers (Fully Available)
    {
      name: 'Marine Biologist',
      emoji: '🐋',
      tier: 'select',
      available: true,
      description: 'Explore ocean depths and marine ecosystems',
      tagline: 'Today\'s marine science'
    },
    {
      name: 'Chef',
      emoji: '👨‍🍳',
      tier: 'select',
      available: true,
      description: 'Master culinary arts and food science',
      tagline: 'Traditional culinary skills'
    },
    // Premium Preview - Same template, more variety
    {
      name: 'Astronaut',
      emoji: '🚀',
      tier: 'premium',
      available: false,
      description: 'Journey through space exploration',
      tagline: '200+ career library',
      teaser: 'Premium unlocks 200+ careers across all grade levels - Elementary through High School'
    },
    // Booster Preview - Enhanced template with trade skills
    {
      name: 'Electrician',
      emoji: '⚡',
      tier: 'booster',
      boosterType: 'Trade',
      available: false,
      description: 'Electrical systems + safety certification',
      tagline: 'Core education + Trade skills',
      teaser: 'Trade Booster adds hands-on skills, tool mastery, and industry certifications'
    },
    // AIFirst Preview - Future-forward with AI integration
    {
      name: 'AI Doctor',
      emoji: '🤖',
      tier: 'aifirst',
      available: false,
      description: 'Medicine with AI assistance',
      tagline: 'Tomorrow\'s AI-powered careers',
      teaser: 'Learn how professionals will work WITH AI - prompt engineering included'
    }
  ];

  // Map old indices to new structure for compatibility
  const DEMO_CAREERS = CAREER_OPTIONS;

  // Jordan Grade 7 skills as defined
  const jordanSkills: SelectLessonInput = {
    student: {
      name: 'Jordan',
      grade: 7,
      currentDate: new Date()
    },
    skills: {
      math: {
        subject: 'Math',
        grade: 7,
        cluster: 'A',
        skillNumber: 'A.1',
        skillName: 'Understanding integers',
        standard: '7.A.A.1'
      },
      ela: {
        subject: 'ELA',
        grade: 7,
        cluster: 'A',
        skillNumber: 'A.1',
        skillName: 'Determine the main idea of a passage',
        standard: '7.A.A.1'
      },
      science: {
        subject: 'Science',
        grade: 7,
        cluster: 'A',
        skillNumber: 'A.1',
        skillName: 'The process of scientific inquiry',
        standard: '7.A.A.1'
      },
      social: {
        subject: 'Social Studies',
        grade: 7,
        cluster: 'A',
        skillNumber: 'A.1',
        skillName: 'Identify lines of latitude and longitude',
        standard: '7.A.A.1'
      }
    }
  };

  const generateLesson = async () => {
    setIsGenerating(true);

    try {
      // Generate with enhanced narrative, using current career index
      const lessonInput = {
        ...jordanSkills,
        careerIndex: currentCareerIndex
      };
      const lesson = await selectLessonTemplate.generateDemonstrativeLesson(lessonInput);
      setGeneratedLesson(lesson);
      console.log('Generated Enhanced Select Lesson:', lesson);
    } catch (error) {
      console.error('Failed to generate lesson:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>
          🎭 Select Lesson Template Demo
        </h1>
        <p style={{ margin: '10px 0 0', opacity: 0.9, fontSize: '18px' }}>
          See how Pathfinity generates personalized lessons for Select subscribers
        </p>
      </div>

      {/* Generate Button */}
      {!generatedLesson && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>
            Generate a Select Lesson for Jordan (Grade 7)
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px' }}>
            This will create a demonstrative lesson plan showing exactly how the Select subscription works.
            The system will randomly select a career and companion to show the variety possible.
          </p>

          <button
            onClick={generateLesson}
            disabled={isGenerating}
            style={{
              padding: '15px 40px',
              fontSize: '18px',
              backgroundColor: isGenerating ? '#9ca3af' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              transform: isGenerating ? 'scale(0.98)' : 'scale(1)',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
          >
            {isGenerating ? '⏳ Generating...' : '🚀 Generate Select Lesson'}
          </button>

          {/* Skills Preview */}
          <div style={{
            marginTop: '40px',
            padding: '20px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            textAlign: 'left',
            maxWidth: '600px',
            margin: '40px auto 0'
          }}>
            <h3 style={{ margin: '0 0 15px', color: '#374151' }}>Today's Skills:</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7280' }}>
              <li>Math 7.A.A.1: Understanding integers</li>
              <li>ELA 7.A.A.1: Determine the main idea of a passage</li>
              <li>Science 7.A.A.1: The process of scientific inquiry</li>
              <li>Social Studies 7.A.A.1: Identify lines of latitude and longitude</li>
            </ul>
          </div>
        </div>
      )}

      {/* Generated Lesson Display */}
      {generatedLesson && (
        <div>
          {/* Career Switcher - CRITICAL PARENT FEATURE */}
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
            padding: '25px',
            borderRadius: '12px',
            marginBottom: '20px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            border: '2px solid #f59e0b'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                Parent Preview
              </div>
              <h3 style={{ margin: 0, color: '#92400e', fontSize: '24px' }}>
                🔄 The Power of Career Variety
              </h3>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              borderLeft: '4px solid #16a34a'
            }}>
              <p style={{ margin: '0 0 10px', color: '#14532d', fontWeight: 'bold' }}>
                ✅ SAME Educational Standards, DIFFERENT Adventures Every Day!
              </p>
              <p style={{ margin: 0, color: '#166534', fontSize: '14px' }}>
                Watch how switching careers maintains 100% curriculum alignment while maximizing engagement.
                Your child masters the EXACT same skills - just through different exciting contexts!
              </p>
            </div>

            {/* Skills Being Taught Badge */}
            <div style={{
              backgroundColor: '#dbeafe',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <div style={{ fontWeight: 'bold', color: '#1e3a8a' }}>
                📚 Today's Required Skills:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Math 7.A.A.1', 'ELA 7.A.A.1', 'Science 7.A.A.1', 'Social 7.A.A.1'].map(skill => (
                  <span key={skill} style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Section Headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 3fr',
              gap: '20px',
              marginBottom: '15px'
            }}>
              <div>
                <p style={{ margin: 0, color: '#14532d', fontSize: '14px', fontWeight: 'bold' }}>
                  INCLUDED IN YOUR SELECT PLAN:
                </p>
              </div>
              <div>
                <p style={{ margin: 0, color: '#92400e', fontSize: '14px', fontWeight: 'bold' }}>
                  PREVIEW PREMIUM FEATURES:
                </p>
              </div>
            </div>

            {/* Career Buttons Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '10px',
              marginBottom: '20px'
            }}>
              {CAREER_OPTIONS.map((career, index) => {
                const isCurrentCareer = generatedLesson?.header.career === career.name.split(' ')[0];
                const isLocked = !career.available;

                return (
                  <button
                    key={index}
                    onClick={async () => {
                      if (career.available) {
                        // Handle select careers
                        if (index !== currentCareerIndex) {
                          setCurrentCareerIndex(index);
                          setIsGenerating(true);
                          try {
                            const lessonInput = {
                              ...jordanSkills,
                              careerIndex: index
                            };
                            const newLesson = await selectLessonTemplate.generateDemonstrativeLesson(lessonInput);
                            setGeneratedLesson(newLesson);
                          } catch (error) {
                            console.error('Failed to switch career:', error);
                          } finally {
                            setIsGenerating(false);
                          }
                        }
                      } else {
                        // Handle locked preview
                        setSelectedUpgrade(career.tier);
                        setShowUpgradeModal(true);
                        // Still generate preview with watermark
                        if (!isGenerating) {
                          setIsGenerating(true);
                          try {
                            const lessonInput = {
                              ...jordanSkills,
                              careerIndex: index
                            };
                            const newLesson = await selectLessonTemplate.generateDemonstrativeLesson(lessonInput);
                            // Add preview flag to the lesson
                            (newLesson as any).isPreview = true;
                            (newLesson as any).previewTier = career.tier;
                            setGeneratedLesson(newLesson);
                          } catch (error) {
                            console.error('Failed to generate preview:', error);
                          } finally {
                            setIsGenerating(false);
                          }
                        }
                      }
                    }}
                    disabled={isGenerating}
                    style={{
                      padding: '12px 8px',
                      background: isLocked
                        ? 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'
                        : isCurrentCareer
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'white',
                      color: isLocked
                        ? '#6b7280'
                        : isCurrentCareer
                          ? 'white'
                          : '#667eea',
                      border: isLocked
                        ? '3px dashed #d1d5db'
                        : '3px solid #667eea',
                      borderRadius: '12px',
                      cursor: isGenerating ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      opacity: isGenerating ? 0.6 : 1,
                      transition: 'all 0.3s',
                      boxShadow: isCurrentCareer
                        ? '0 4px 15px rgba(102, 126, 234, 0.4)'
                        : isLocked
                          ? 'none'
                          : '0 2px 5px rgba(0,0,0,0.1)',
                      transform: isCurrentCareer ? 'scale(1.05)' : 'scale(1)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      position: 'relative'
                    }}
                  >
                    {/* Lock Icon for Premium Content */}
                    {isLocked && (
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        backgroundColor: career.tier === 'premium' ? '#f59e0b'
                          : career.tier === 'booster' ? '#10b981'
                          : '#ec4899',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        🔒
                      </div>
                    )}

                    <span style={{ fontSize: '24px' }}>{career.emoji}</span>
                    <span style={{ fontSize: '12px', lineHeight: 1.2 }}>{career.name}</span>

                    {/* Tagline */}
                    <span style={{
                      fontSize: '9px',
                      color: isLocked ? '#9ca3af' : '#6b7280',
                      marginTop: '2px'
                    }}>
                      {career.tagline}
                    </span>

                    {/* Tier Badge */}
                    {isLocked && (
                      <span style={{
                        fontSize: '9px',
                        textTransform: 'uppercase',
                        backgroundColor: career.tier === 'premium' ? '#fef3c7'
                          : career.tier === 'booster' ? '#dcfce7'
                          : '#fce7f3',
                        color: career.tier === 'premium' ? '#92400e'
                          : career.tier === 'booster' ? '#14532d'
                          : '#831843',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        marginTop: '2px'
                      }}>
                        {career.tier === 'booster' ? career.boosterType : career.tier}
                      </span>
                    )}

                    {/* Current indicator */}
                    {isCurrentCareer && !isLocked && (
                      <span style={{
                        fontSize: '9px',
                        textTransform: 'uppercase',
                        backgroundColor: 'rgba(255,255,255,0.3)',
                        padding: '2px 6px',
                        borderRadius: '10px'
                      }}>
                        Current
                      </span>
                    )}

                    {/* Preview label for locked content */}
                    {isLocked && (
                      <span style={{
                        fontSize: '9px',
                        color: '#667eea',
                        fontWeight: 'bold',
                        textDecoration: 'underline'
                      }}>
                        Try Preview
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {isGenerating && (
              <div style={{
                backgroundColor: '#fef3c7',
                padding: '15px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{ margin: 0, color: '#92400e', fontWeight: 'bold' }}>
                  ⏳ Generating new adventure with the SAME educational standards...
                </p>
                <p style={{ margin: '5px 0 0', color: '#78350f', fontSize: '13px' }}>
                  Notice how the skills remain constant while the story transforms!
                </p>
              </div>
            )}

            {/* Parent Insight Box */}
            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#ecfdf5',
              borderRadius: '8px',
              borderLeft: '4px solid #10b981'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '20px' }}>💡</span>
                <strong style={{ color: '#064e3b' }}>Parent Insight:</strong>
              </div>
              <p style={{ margin: 0, color: '#065f46', fontSize: '13px', lineHeight: '1.6' }}>
                <strong>Career variety is our secret engagement weapon!</strong> Children who might resist
                "doing math homework" eagerly calculate ocean depths as Marine Biologists or game scores
                as Basketball Coaches. The educational outcome is identical - the motivation is transformed.
                This is why Pathfinity students average 2+ hours of daily engagement versus 20 minutes
                with traditional methods.
              </p>
            </div>
          </div>

          {/* View Selector */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
            flexWrap: 'wrap'
          }}>
            {(['overview', 'narrative', 'skills', 'rubric'] as const).map(view => (
              <button
                key={view}
                onClick={() => setSelectedView(view)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: selectedView === view ? '#667eea' : 'white',
                  color: selectedView === view ? 'white' : '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  textTransform: 'capitalize'
                }}
              >
                {view === 'overview' ? '📋 Overview' :
                 view === 'narrative' ? '📖 Narrative' :
                 view === 'skills' ? '📊 Skills' :
                 '✅ Rubric'}
              </button>
            ))}
          </div>

          {/* Preview Watermark for Locked Content */}
          {(generatedLesson as any)?.isPreview && (
            <div style={{
              backgroundColor: '#fef3c7',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              borderLeft: '4px solid #f59e0b',
              position: 'relative'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <p style={{ margin: '0 0 5px', color: '#92400e', fontWeight: 'bold' }}>
                    🔒 PREVIEW MODE - {
                      (generatedLesson as any).previewTier === 'premium' ? 'Premium Career' :
                      (generatedLesson as any).previewTier === 'booster' ? 'Trade Booster Career' :
                      'AIFirst Career'
                    }
                  </p>
                  <p style={{ margin: 0, color: '#78350f', fontSize: '13px' }}>
                    Viewing limited preview. Unlock full features to access complete lesson content.
                  </p>
                </div>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Unlock Now
                </button>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            position: 'relative',
            opacity: (generatedLesson as any)?.isPreview ? 0.85 : 1
          }}>
            {/* Watermark Overlay for Preview */}
            {(generatedLesson as any)?.isPreview && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-45deg)',
                fontSize: '72px',
                fontWeight: 'bold',
                color: 'rgba(245, 158, 11, 0.1)',
                pointerEvents: 'none',
                zIndex: 1,
                whiteSpace: 'nowrap'
              }}>
                PREVIEW
              </div>
            )}

            {/* Overview View */}
            {selectedView === 'overview' && (
              <div>
                <div style={{
                  backgroundColor: '#fef3c7',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  borderLeft: '4px solid #f59e0b'
                }}>
                  <h2 style={{ margin: '0 0 10px', color: '#92400e' }}>
                    🎭 Demonstrative Lesson: "This Could Be Tomorrow"
                  </h2>
                  <p style={{ margin: '5px 0', color: '#78350f' }}>
                    <strong>Student:</strong> {generatedLesson.header.student} (Grade {generatedLesson.header.grade})
                  </p>
                  <p style={{ margin: '5px 0', color: '#78350f' }}>
                    <strong>Date:</strong> {formatDate(generatedLesson.header.date)}
                  </p>
                  <p style={{ margin: '5px 0', color: '#78350f' }}>
                    <strong>Career:</strong> {generatedLesson.header.career}
                    <span style={{ marginLeft: '20px' }}>
                      <strong>Companion:</strong> {generatedLesson.header.companion}
                    </span>
                  </p>
                  <p style={{ margin: '5px 0', color: '#78350f' }}>
                    <strong>Duration:</strong> {generatedLesson.header.duration}
                    <span style={{ marginLeft: '20px' }}>
                      <strong>Tier:</strong> {generatedLesson.header.subscriptionTier}
                    </span>
                  </p>
                </div>

                <h3 style={{ color: '#1f2937', marginTop: '30px' }}>Mission Briefing</h3>
                <div style={{
                  backgroundColor: '#f0f9ff',
                  padding: '20px',
                  borderRadius: '8px',
                  borderLeft: '4px solid #0ea5e9',
                  marginBottom: '20px'
                }}>
                  <p style={{ margin: 0, lineHeight: 1.6, color: '#075985' }}>
                    {generatedLesson.narrative.missionBriefing}
                  </p>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '20px',
                  marginTop: '30px'
                }}>
                  {/* Act Cards */}
                  {[generatedLesson.narrative.act1,
                    generatedLesson.narrative.act2,
                    generatedLesson.narrative.act3].map((act, index) => (
                    <div key={index} style={{
                      backgroundColor: '#f3f4f6',
                      padding: '20px',
                      borderRadius: '8px',
                      border: '2px solid #e5e7eb'
                    }}>
                      <h4 style={{ margin: '0 0 10px', color: '#374151' }}>
                        {act.title}
                      </h4>
                      <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#6b7280' }}>
                        {act.description}
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                        Duration: {act.duration} minutes
                      </p>
                    </div>
                  ))}
                </div>

                {/* Celebration */}
                <div style={{
                  marginTop: '30px',
                  padding: '20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '8px',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                    {generatedLesson.narrative.celebration}
                  </p>
                </div>
              </div>
            )}

            {/* Narrative View */}
            {selectedView === 'narrative' && (
              <div>
                <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>
                  THE {generatedLesson.header.career.toUpperCase()} ADVENTURE
                </h2>

                {/* Act 1 */}
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ color: '#667eea', marginBottom: '15px' }}>
                    {generatedLesson.narrative.act1.title}
                  </h3>
                  {generatedLesson.narrative.act1.subjects.map((subject, index) => (
                    <div key={index} style={{
                      backgroundColor: '#fafafa',
                      padding: '15px',
                      marginBottom: '10px',
                      borderRadius: '8px',
                      borderLeft: '4px solid #667eea'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <strong style={{ color: '#374151' }}>
                          {subject.subject === 'Math' ? '📊' :
                           subject.subject === 'ELA' ? '📖' :
                           subject.subject === 'Science' ? '🔬' : '🌍'} {subject.subject}
                        </strong>
                        <span style={{
                          backgroundColor: '#e5e7eb',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          color: '#374151'
                        }}>
                          [{subject.skillCode}]
                        </span>
                      </div>
                      <p style={{ margin: '5px 0', color: '#1f2937' }}>
                        <strong>Task:</strong> {subject.narrative}
                      </p>
                      <p style={{ margin: '5px 0', color: '#4b5563', fontSize: '14px' }}>
                        <strong>Context:</strong> {subject.careerContext}
                      </p>
                      {subject.examples && subject.examples.length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                          <strong style={{ fontSize: '13px', color: '#6b7280' }}>Examples:</strong>
                          <ul style={{ margin: '5px 0 0 20px', padding: 0, fontSize: '13px', color: '#6b7280' }}>
                            {subject.examples.map((example, i) => (
                              <li key={i}>{example}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Act 2 */}
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ color: '#059669', marginBottom: '15px' }}>
                    {generatedLesson.narrative.act2.title}
                  </h3>
                  <div style={{
                    backgroundColor: '#dcfce7',
                    padding: '20px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #059669'
                  }}>
                    <p style={{ margin: 0, color: '#14532d', fontWeight: 'bold' }}>
                      INTEGRATED CHALLENGE
                    </p>
                    <p style={{ margin: '10px 0 0', color: '#166534' }}>
                      Apply all four skills to solve the {generatedLesson.header.career} challenge!
                    </p>
                  </div>
                </div>

                {/* Act 3 */}
                <div>
                  <h3 style={{ color: '#c026d3', marginBottom: '15px' }}>
                    {generatedLesson.narrative.act3.title}
                  </h3>
                  <div style={{
                    backgroundColor: '#fdf4ff',
                    padding: '20px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #c026d3'
                  }}>
                    <p style={{ margin: 0, color: '#581c87', fontWeight: 'bold' }}>
                      FINAL PRESENTATION
                    </p>
                    <p style={{ margin: '10px 0 0', color: '#701a75' }}>
                      Share your findings and earn your certification!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Skills View */}
            {selectedView === 'skills' && (
              <div>
                <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>
                  📊 SKILLS MASTERY VERIFICATION
                </h2>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    marginBottom: '30px'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f3f4f6' }}>
                        {generatedLesson.skillsVerification.headers.map((header, index) => (
                          <th key={index} style={{
                            padding: '12px',
                            textAlign: 'left',
                            borderBottom: '2px solid #e5e7eb',
                            color: '#374151',
                            fontWeight: 'bold'
                          }}>
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {generatedLesson.skillsVerification.rows.map((row, index) => (
                        <tr key={index} style={{
                          backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
                        }}>
                          <td style={{
                            padding: '12px',
                            borderBottom: '1px solid #e5e7eb',
                            color: '#4b5563'
                          }}>
                            {row.subject}
                          </td>
                          <td style={{
                            padding: '12px',
                            borderBottom: '1px solid #e5e7eb',
                            color: '#4b5563'
                          }}>
                            {row.standard}
                          </td>
                          <td style={{
                            padding: '12px',
                            borderBottom: '1px solid #e5e7eb',
                            color: '#4b5563'
                          }}>
                            {row.skill}
                          </td>
                          <td style={{
                            padding: '12px',
                            borderBottom: '1px solid #e5e7eb',
                            color: '#4b5563'
                          }}>
                            {row.objective}
                          </td>
                          <td style={{
                            padding: '12px',
                            borderBottom: '1px solid #e5e7eb',
                            color: '#4b5563'
                          }}>
                            {row.mastery}
                          </td>
                          <td style={{
                            padding: '12px',
                            borderBottom: '1px solid #e5e7eb',
                            color: '#4b5563'
                          }}>
                            {row.realWorld}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {generatedLesson.skillsVerification.footnote && (
                  <div style={{
                    backgroundColor: '#eff6ff',
                    padding: '20px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #3b82f6'
                  }}>
                    <p style={{
                      margin: 0,
                      color: '#1e3a8a',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {generatedLesson.skillsVerification.footnote}
                    </p>
                  </div>
                )}

              </div>
            )}

            {/* Rubric View */}
            {selectedView === 'rubric' && (
              <div>
                <h2 style={{ color: '#1f2937', marginBottom: '20px' }}>
                  ✅ QUALITY RUBRIC & GUARANTEE
                </h2>

                {/* Rubric Title and Mastery Levels */}
                <h3 style={{ color: '#374151', marginBottom: '20px' }}>
                  {generatedLesson.rubric.title}
                </h3>

                {/* Mastery Levels Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '20px',
                  marginBottom: '30px'
                }}>
                  {/* Expert Level */}
                  <div style={{
                    backgroundColor: '#dcfce7',
                    padding: '20px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #16a34a'
                  }}>
                    <h4 style={{ margin: '0 0 10px', color: '#14532d' }}>
                      ⭐ Expert (4)
                    </h4>
                    <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#166534' }}>
                      {generatedLesson.rubric.masteryLevels.expert.description}
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#15803d' }}>
                      {generatedLesson.rubric.masteryLevels.expert.criteria.map((criterion, idx) => (
                        <li key={idx}>{criterion}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Proficient Level */}
                  <div style={{
                    backgroundColor: '#dbeafe',
                    padding: '20px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #2563eb'
                  }}>
                    <h4 style={{ margin: '0 0 10px', color: '#1e3a8a' }}>
                      ✅ Proficient (3)
                    </h4>
                    <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#1e40af' }}>
                      {generatedLesson.rubric.masteryLevels.proficient.description}
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#1d4ed8' }}>
                      {generatedLesson.rubric.masteryLevels.proficient.criteria.map((criterion, idx) => (
                        <li key={idx}>{criterion}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Developing Level */}
                  <div style={{
                    backgroundColor: '#fef3c7',
                    padding: '20px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #f59e0b'
                  }}>
                    <h4 style={{ margin: '0 0 10px', color: '#78350f' }}>
                      📈 Developing (2)
                    </h4>
                    <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#92400e' }}>
                      {generatedLesson.rubric.masteryLevels.developing.description}
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#b45309' }}>
                      {generatedLesson.rubric.masteryLevels.developing.criteria.map((criterion, idx) => (
                        <li key={idx}>{criterion}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Beginning Level */}
                  <div style={{
                    backgroundColor: '#fee2e2',
                    padding: '20px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #ef4444'
                  }}>
                    <h4 style={{ margin: '0 0 10px', color: '#7f1d1d' }}>
                      🌱 Beginning (1)
                    </h4>
                    <p style={{ margin: '0 0 10px', fontSize: '14px', color: '#991b1b' }}>
                      {generatedLesson.rubric.masteryLevels.beginning.description}
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#dc2626' }}>
                      {generatedLesson.rubric.masteryLevels.beginning.criteria.map((criterion, idx) => (
                        <li key={idx}>{criterion}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Alignment Note */}
                {generatedLesson.rubric.alignmentNote && (
                  <div style={{
                    backgroundColor: '#f0f9ff',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    borderLeft: '4px solid #0ea5e9'
                  }}>
                    <p style={{ margin: 0, color: '#075985', fontWeight: 'bold' }}>
                      📐 Alignment Note
                    </p>
                    <p style={{ margin: '10px 0 0', color: '#0c4a6e', fontSize: '14px' }}>
                      {generatedLesson.rubric.alignmentNote}
                    </p>
                  </div>
                )}

                {/* Quality Guarantee */}
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '25px',
                  borderRadius: '8px',
                  color: 'white'
                }}>
                  <h3 style={{ margin: '0 0 20px', fontSize: '24px' }}>
                    {generatedLesson.guarantee.title}
                  </h3>

                  <div style={{ display: 'grid', gap: '15px' }}>
                    {/* Narrative Magic */}
                    <div>
                      <h4 style={{ margin: '0 0 5px', fontSize: '16px' }}>
                        ✨ Narrative Magic
                      </h4>
                      <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                        {generatedLesson.guarantee.narrativeMagic.promise}
                      </p>
                    </div>

                    {/* Standards Compliance */}
                    <div>
                      <h4 style={{ margin: '0 0 5px', fontSize: '16px' }}>
                        📚 Standards Compliance
                      </h4>
                      <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                        {generatedLesson.guarantee.standardsCompliance.promise}
                      </p>
                    </div>

                    {/* Personalization */}
                    <div>
                      <h4 style={{ margin: '0 0 5px', fontSize: '16px' }}>
                        🎯 Personalization
                      </h4>
                      <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                        {generatedLesson.guarantee.personalization.promise}
                      </p>
                    </div>
                  </div>

                  {/* Select Limitations */}
                  <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '6px'
                  }}>
                    <h4 style={{ margin: '0 0 10px', fontSize: '14px' }}>
                      Select Subscription Includes:
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', opacity: 0.9 }}>
                      <li>{generatedLesson.guarantee.selectLimitations.careers} career choices</li>
                      <li>{generatedLesson.guarantee.selectLimitations.companions} AI companions</li>
                      <li>{generatedLesson.guarantee.selectLimitations.multimedia}</li>
                      <li>{generatedLesson.guarantee.selectLimitations.adaptiveFeatures} adaptive features</li>
                    </ul>
                  </div>

                  {/* Upgrade Options */}
                  <div style={{
                    marginTop: '15px',
                    padding: '15px',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '6px'
                  }}>
                    <h4 style={{ margin: '0 0 10px', fontSize: '14px' }}>
                      🚀 Want More?
                    </h4>
                    <p style={{ margin: '5px 0', fontSize: '13px', opacity: 0.9 }}>
                      <strong>Premium:</strong> {generatedLesson.guarantee.upgradeOptions.premium}
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '13px', opacity: 0.9 }}>
                      <strong>Boosters:</strong> {generatedLesson.guarantee.upgradeOptions.boosters}
                    </p>
                    <p style={{ margin: '5px 0', fontSize: '13px', opacity: 0.9 }}>
                      <strong>Ultimate:</strong> {generatedLesson.guarantee.upgradeOptions.ultimate}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Generate New Button */}
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button
              onClick={() => {
                setGeneratedLesson(null);
                setSelectedView('overview');
              }}
              style={{
                padding: '12px 30px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              🔄 Generate New Lesson
            </button>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: 0, color: '#1f2937' }}>
                {selectedUpgrade === 'premium' && '🚀 Unlock Premium'}
                {selectedUpgrade === 'booster' && '⚡ Add Trade Booster'}
                {selectedUpgrade === 'aifirst' && '🤖 Upgrade to AIFirst'}
              </h2>
              <button
                onClick={() => setShowUpgradeModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            {selectedUpgrade === 'premium' && (
              <div>
                <div style={{
                  backgroundColor: '#fef3c7',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <p style={{ margin: 0, color: '#92400e', lineHeight: 1.6 }}>
                    <strong>Premium: Complete Career Library Access</strong><br/>
                    The EXACT same educational template, but with our ENTIRE library of 200+ careers
                    across ALL grade levels! Your child can explore Elementary careers for review,
                    Middle School careers for current learning, and High School careers for aspiration.
                    Select provides grade-limited selection; Premium unlocks the complete collection!
                  </p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 10px', color: '#374151' }}>What Premium Adds:</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7280' }}>
                    <li>200+ careers across ALL grade levels (K-12)</li>
                    <li>All 3 AI companions (Sage, Spark, Finn)</li>
                    <li>Cross-grade exploration (review below, aspire above)</li>
                    <li>New careers added automatically included</li>
                    <li>Lifetime access to complete career library</li>
                  </ul>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#e5e7eb',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Continue Exploring
                  </button>
                  <button
                    style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Learn More About Premium
                  </button>
                </div>
              </div>
            )}

            {selectedUpgrade === 'booster' && (
              <div>
                <div style={{
                  backgroundColor: '#dcfce7',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <p style={{ margin: 0, color: '#14532d', lineHeight: 1.6 }}>
                    <strong>Boosters: Education + Career Skills</strong><br/>
                    Beyond Common Core! Trade Booster adds industry-specific skills like tool
                    proficiency, safety protocols, and certifications. Your child learns math
                    WHILE calculating electrical loads, not just abstract numbers.
                  </p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 10px', color: '#374151' }}>Enhanced Rubric Includes:</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7280' }}>
                    <li>Standard academic skills (Math, ELA, Science, Social)</li>
                    <li>+ Tool proficiency ratings</li>
                    <li>+ Safety protocol mastery</li>
                    <li>+ Industry terminology</li>
                    <li>+ Problem diagnosis skills</li>
                    <li>+ Customer communication</li>
                  </ul>
                </div>

                <p style={{
                  margin: '15px 0',
                  fontSize: '13px',
                  color: '#6b7280',
                  backgroundColor: '#f3f4f6',
                  padding: '10px',
                  borderRadius: '6px'
                }}>
                  <strong>Available Boosters:</strong><br/>
                  • Trade (Electrician, Plumber, Carpenter)<br/>
                  • Corporate (Manager, Analyst, Consultant)<br/>
                  • Entrepreneur (Founder, Inventor, Creator)
                </p>

                <div style={{
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#e5e7eb',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Continue Exploring
                  </button>
                  <button
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Learn More About Boosters
                  </button>
                </div>
              </div>
            )}

            {selectedUpgrade === 'aifirst' && (
              <div>
                <div style={{
                  backgroundColor: '#fce7f3',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <p style={{ margin: 0, color: '#831843', lineHeight: 1.6 }}>
                    <strong>AIFirst: Tomorrow's Careers, Today</strong><br/>
                    Your child learns how professionals will ACTUALLY work when they graduate.
                    Doctors using AI for diagnosis, Lawyers prompting for case research,
                    Engineers collaborating with AI assistants. Master prompt engineering
                    alongside traditional skills.
                  </p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 10px', color: '#374151' }}>Future-Ready Skills:</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7280' }}>
                    <li>Traditional education (Math, ELA, Science, Social)</li>
                    <li>+ AI prompt engineering for each career</li>
                    <li>+ When to trust vs verify AI output</li>
                    <li>+ AI-human collaboration techniques</li>
                    <li>+ Ethical AI use in their field</li>
                    <li>+ Future-proofing their skills</li>
                  </ul>
                </div>

                <div style={{
                  backgroundColor: '#f0f9ff',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '15px'
                }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#075985' }}>
                    <strong>Example:</strong> As an AI Doctor, your child learns integers
                    by analyzing patient data trends, BUT ALSO learns how to prompt AI
                    for differential diagnoses and verify its medical recommendations.
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#e5e7eb',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Continue Exploring
                  </button>
                  <button
                    style={{
                      padding: '10px 20px',
                      background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Learn More About AIFirst
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};