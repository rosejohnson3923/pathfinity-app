/**
 * Test component for age-differentiated career selection
 * Elementary/Middle: Exploration mode (variety focus)
 * High School: Pathway mode (progression focus)
 */

import React, { useState } from 'react';
import { lessonOrchestrator } from '../services/orchestration/LessonPlanOrchestrator';
import { UnifiedPDFButton } from './UnifiedLessonDownload';
import {
  Star, Lock, Zap, Trophy, Sparkles, CheckCircle,
  ChevronRight, TrendingUp, Target, BookOpen, Award,
  Briefcase, Brain, Rocket, Users
} from 'lucide-react';

// Standard careers available in Select tier
const STANDARD_CAREERS = [
  { id: 'chef', name: 'Chef', emoji: '👨‍🍳', category: 'Culinary', description: 'Create delicious meals' },
  { id: 'doctor', name: 'Doctor', emoji: '👨‍⚕️', category: 'Healthcare', description: 'Help people stay healthy' },
  { id: 'teacher', name: 'Teacher', emoji: '👩‍🏫', category: 'Education', description: 'Share knowledge with others' },
  { id: 'artist', name: 'Artist', emoji: '🎨', category: 'Arts', description: 'Create beautiful art' },
  { id: 'scientist', name: 'Scientist', emoji: '🔬', category: 'Science', description: 'Make discoveries' },
  { id: 'athlete', name: 'Athlete', emoji: '⚽', category: 'Sports', description: 'Excel in sports' },
  { id: 'musician', name: 'Musician', emoji: '🎵', category: 'Arts', description: 'Create and perform music' },
  { id: 'programmer', name: 'Programmer', emoji: '💻', category: 'Technology', description: 'Build software' }
];

// Premium careers (includes Standard + more)
const PREMIUM_CAREERS = [
  ...STANDARD_CAREERS,
  { id: 'astronaut', name: 'Astronaut', emoji: '🚀', category: 'Science', description: 'Explore space' },
  { id: 'game_designer', name: 'Game Designer', emoji: '🎮', category: 'Technology', description: 'Create video games' },
  { id: 'marine_biologist', name: 'Marine Biologist', emoji: '🐋', category: 'Science', description: 'Study ocean life' },
  { id: 'architect', name: 'Architect', emoji: '🏗️', category: 'Design', description: 'Design buildings' },
  { id: 'veterinarian', name: 'Veterinarian', emoji: '🐕', category: 'Healthcare', description: 'Care for animals' },
  { id: 'filmmaker', name: 'Filmmaker', emoji: '🎬', category: 'Arts', description: 'Create movies' },
  { id: 'pilot', name: 'Pilot', emoji: '✈️', category: 'Transportation', description: 'Fly aircraft' },
  { id: 'psychologist', name: 'Psychologist', emoji: '🧠', category: 'Healthcare', description: 'Understand minds' }
];

// Booster enhancements
const BOOSTER_TYPES = {
  TRADE: {
    id: 'trade',
    name: 'Trade Skills',
    icon: '🔧',
    color: 'from-orange-400 to-orange-600',
    description: 'Hands-on technical expertise',
    enhancement: (career: any) => `${career.name} Technician`
  },
  CORPORATE: {
    id: 'corporate',
    name: 'Corporate Leadership',
    icon: '💼',
    color: 'from-blue-400 to-blue-600',
    description: 'Management & team leadership',
    enhancement: (career: any) => `${career.name} Manager`
  },
  BUSINESS: {
    id: 'business',
    name: 'Entrepreneurship',
    icon: '🚀',
    color: 'from-purple-400 to-purple-600',
    description: 'Business ownership skills',
    enhancement: (career: any) => `${career.name} Business Owner`
  },
  AI_FIRST: {
    id: 'ai_first',
    name: 'AI Integration',
    icon: '🤖',
    color: 'from-green-400 to-green-600',
    description: 'AI-powered workflows',
    enhancement: (career: any) => `AI-Enhanced ${career.name}`
  }
};

// Career progression paths for high school
const CAREER_PROGRESSIONS: Record<string, any> = {
  programmer: {
    grade9_10: { name: 'Programmer', skills: ['Basic coding', 'Problem solving', 'Algorithms'] },
    grade11: { name: 'Software Architect', skills: ['System design', 'Advanced patterns', 'Team collaboration'] },
    grade12: {
      corporate: { name: 'Tech Lead', skills: ['Team management', 'Project planning'] },
      business: { name: 'Startup Founder', skills: ['Business planning', 'Product development'] },
      ai_first: { name: 'AI Engineer', skills: ['Machine learning', 'Neural networks'] }
    }
  },
  doctor: {
    grade9_10: { name: 'Medical Student', skills: ['Biology', 'Chemistry', 'Patient care basics'] },
    grade11: { name: 'Specialist Training', skills: ['Advanced procedures', 'Diagnostics'] },
    grade12: {
      corporate: { name: 'Hospital Administrator', skills: ['Healthcare management', 'Policy'] },
      business: { name: 'Clinic Owner', skills: ['Practice management', 'Business operations'] },
      ai_first: { name: 'AI Diagnostician', skills: ['AI diagnosis tools', 'Data analysis'] }
    }
  },
  chef: {
    grade9_10: { name: 'Line Cook', skills: ['Basic cooking', 'Food safety', 'Kitchen operations'] },
    grade11: { name: 'Sous Chef', skills: ['Menu planning', 'Advanced techniques'] },
    grade12: {
      corporate: { name: 'Executive Chef', skills: ['Kitchen management', 'Staff training'] },
      business: { name: 'Restaurant Owner', skills: ['Business planning', 'Marketing'] },
      ai_first: { name: 'AI Recipe Developer', skills: ['AI-assisted cooking', 'Food science'] }
    }
  }
};

interface TestCareerSelectionProps {
  // Optional props for testing different scenarios
}

export const TestCareerSelectionWithGradeLevel: React.FC<TestCareerSelectionProps> = () => {
  const [gradeLevel, setGradeLevel] = useState<string>('K');
  const [subscription, setSubscription] = useState<'select' | 'premium'>('select');
  const [selectedCareer, setSelectedCareer] = useState<any>(null);
  const [selectedBooster, setSelectedBooster] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState<string>('');
  const [unifiedLesson, setUnifiedLesson] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const isHighSchool = () => {
    // Check if it's grades 9-12
    return ['9', '10', '11', '12'].includes(gradeLevel);
  };

  const getAvailableCareers = () => {
    return subscription === 'premium' ? PREMIUM_CAREERS : STANDARD_CAREERS;
  };

  const handleCareerSelect = (career: any) => {
    if (subscription === 'select' && !STANDARD_CAREERS.find(c => c.id === career.id)) {
      setUpgradeTarget('premium');
      setShowUpgradeModal(true);
    } else {
      setSelectedCareer(career);
      setSelectedBooster(null); // Reset booster when changing careers
    }
  };

  const handleBoosterSelect = (boosterId: string) => {
    setUpgradeTarget(`booster_${boosterId}`);
    setShowUpgradeModal(true);
  };

  const generateLesson = async () => {
    if (!selectedCareer) {
      alert('Please select a career first');
      return;
    }

    setLoading(true);
    try {
      const result = await lessonOrchestrator.generateDailyLessons(
        'student_test_id',
        selectedCareer.id
      );

      if (result && result.unifiedLesson) {
        result.unifiedLesson.career = {
          careerName: selectedBooster
            ? BOOSTER_TYPES[selectedBooster as keyof typeof BOOSTER_TYPES].enhancement(selectedCareer)
            : selectedCareer.name,
          icon: selectedCareer.emoji,
          description: selectedCareer.description,
          tier: subscription,
          booster: selectedBooster
        };
        setUnifiedLesson(result.unifiedLesson);
      }
    } catch (err) {
      console.error('Error generating lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  // Render Elementary/Middle School exploration mode
  const renderExplorationMode = () => (
    <div>
      <div style={{
        padding: '20px',
        backgroundColor: '#FEF3C7',
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#78350F' }}>
          🎯 Career Explorer Mode (Grades {gradeLevel})
        </h3>
        <p style={{ margin: 0, color: '#92400E' }}>
          Try a new career every day! Explore all the amazing possibilities!
        </p>
      </div>

      {/* Fun carousel-style career display */}
      <div style={{ marginBottom: '20px' }}>
        <h4>
          {subscription === 'select' ? '✓ Your Available Careers' : '⭐ Your Premium Career Library'}
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '15px',
          marginTop: '15px'
        }}>
          {getAvailableCareers().map(career => (
            <div
              key={career.id}
              onClick={() => handleCareerSelect(career)}
              style={{
                padding: '15px',
                borderRadius: '12px',
                backgroundColor: selectedCareer?.id === career.id ? '#DBEAFE' : '#F9FAFB',
                border: selectedCareer?.id === career.id ? '3px solid #3B82F6' : '2px solid #E5E7EB',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                transform: selectedCareer?.id === career.id ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>{career.emoji}</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{career.name}</div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>{career.description}</div>
              {selectedCareer?.id === career.id && (
                <CheckCircle style={{ width: '16px', height: '16px', color: '#059669', margin: '5px auto 0' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upsell for Elementary/Middle */}
      {subscription === 'select' && (
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
          borderRadius: '12px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <Sparkles style={{ width: '24px', height: '24px', color: '#3B82F6', margin: '0 auto 10px' }} />
          <h4 style={{ margin: '0 0 10px 0' }}>🚀 Unlock 200+ Amazing Careers!</h4>
          <p style={{ margin: '0 0 15px 0', color: '#6B7280' }}>
            Be an astronaut today, a game designer tomorrow!
          </p>
          <button
            onClick={() => {
              setUpgradeTarget('premium');
              setShowUpgradeModal(true);
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Explore Premium Careers
          </button>
        </div>
      )}
    </div>
  );

  // Render High School pathway mode
  const renderPathwayMode = () => {
    const progression = selectedCareer ? CAREER_PROGRESSIONS[selectedCareer.id] : null;

    // Debug logging
    if (selectedCareer) {
      console.log('Selected career:', selectedCareer.id, 'Progression found:', !!progression);
      console.log('Available progressions:', Object.keys(CAREER_PROGRESSIONS));
    }

    // High school sees only careers with defined progressions (deeper, not wider)
    const pathwayCareers = subscription === 'premium'
      ? STANDARD_CAREERS.filter(c => CAREER_PROGRESSIONS[c.id])  // Only show careers with progressions
      : STANDARD_CAREERS.filter(c => CAREER_PROGRESSIONS[c.id]).slice(0, 2); // Even fewer for select

    return (
      <div>
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #1E293B, #334155)',
          borderRadius: '12px',
          marginBottom: '20px',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: 'white' }}>
            🎯 Career Pathway Mode (Grade {gradeLevel})
          </h3>
          <p style={{ margin: 0, color: '#CBD5E1' }}>
            Focus on depth, not breadth. Build expertise in your chosen field with a 4-year pathway.
          </p>
        </div>

        {/* Career Selection - Professional look for high school */}
        <div style={{ marginBottom: '30px' }}>
          <h4 style={{ color: '#1E293B', fontSize: '18px', fontWeight: '600' }}>
            Step 1: Select Your Professional Path
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            marginTop: '15px'
          }}>
            {pathwayCareers.map(career => (
              <div
                key={career.id}
                onClick={() => handleCareerSelect(career)}
                style={{
                  padding: '20px',
                  borderRadius: '8px',
                  backgroundColor: selectedCareer?.id === career.id ? '#EFF6FF' : '#FFFFFF',
                  border: selectedCareer?.id === career.id ? '2px solid #2563EB' : '1px solid #E5E7EB',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ fontSize: '24px', marginRight: '12px' }}>{career.emoji}</div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B' }}>{career.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{career.category} Track</div>
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.4' }}>
                  {CAREER_PROGRESSIONS[career.id] ? '✓ Full 4-year pathway available' : 'Foundation career'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Career Progression Path - Always show if career selected in high school */}
        {selectedCareer && (
          <div style={{
            padding: '25px',
            backgroundColor: '#F9FAFB',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 20px 0' }}>
              Your {selectedCareer.name} Learning Path
            </h4>

            {progression ? (
              <>
                {/* Foundation */}
                <div style={{ marginBottom: '25px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <CheckCircle style={{ width: '20px', height: '20px', color: '#22C55E', marginRight: '10px' }} />
                    <strong>Grades 9-10: Foundation</strong>
                  </div>
                  <div style={{
                    marginLeft: '30px',
                    padding: '15px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderLeft: '4px solid #22C55E'
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{progression.grade9_10.name}</div>
                    <div style={{ fontSize: '14px', color: '#6B7280' }}>
                      Skills: {progression.grade9_10.skills.join(' • ')}
                    </div>
                  </div>
                </div>

            {/* Specialization */}
            <div style={{ marginBottom: '25px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                {subscription === 'premium' ? (
                  <CheckCircle style={{ width: '20px', height: '20px', color: '#22C55E', marginRight: '10px' }} />
                ) : (
                  <Lock style={{ width: '20px', height: '20px', color: '#9CA3AF', marginRight: '10px' }} />
                )}
                <strong>Grade 11: Specialization</strong>
                {subscription === 'select' && (
                  <span style={{ marginLeft: '10px', color: '#3B82F6', fontSize: '12px' }}>
                    (Premium Required)
                  </span>
                )}
              </div>
              <div style={{
                marginLeft: '30px',
                padding: '15px',
                backgroundColor: subscription === 'premium' ? '#FFFFFF' : '#F3F4F6',
                borderRadius: '8px',
                borderLeft: `4px solid ${subscription === 'premium' ? '#3B82F6' : '#D1D5DB'}`,
                opacity: subscription === 'premium' ? 1 : 0.7
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{progression.grade11.name}</div>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>
                  Skills: {progression.grade11.skills.join(' • ')}
                </div>
              </div>
            </div>

            {/* Enhancement Options */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <Lock style={{ width: '20px', height: '20px', color: '#9CA3AF', marginRight: '10px' }} />
                <strong>Grade 12: Enhancement (Choose Your Path)</strong>
              </div>
              <div style={{
                marginLeft: '30px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '15px'
              }}>
                {Object.entries(BOOSTER_TYPES).slice(0, 3).map(([key, booster]) => {
                  const pathData = progression.grade12[key];
                  if (!pathData) return null;

                  return (
                    <div
                      key={key}
                      onClick={() => handleBoosterSelect(key)}
                      style={{
                        padding: '15px',
                        backgroundColor: '#F9FAFB',
                        borderRadius: '8px',
                        border: '2px solid #E5E7EB',
                        cursor: 'pointer',
                        position: 'relative',
                        opacity: 0.8
                      }}
                    >
                      <Lock style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '14px',
                        height: '14px',
                        color: '#9CA3AF'
                      }} />
                      <div style={{ fontSize: '20px', marginBottom: '5px' }}>{booster.icon}</div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>
                        {pathData.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '8px' }}>
                        {booster.description}
                      </div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>
                        <strong>Skills:</strong><br />
                        {pathData.skills.slice(0, 2).join(', ')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

                {/* College/Career Ready */}
                <div style={{
                  marginTop: '25px',
                  padding: '15px',
                  backgroundColor: '#FEF3C7',
                  borderRadius: '8px'
                }}>
                  <strong style={{ color: '#78350F' }}>🎓 College & Career Ready:</strong>
                  <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px', color: '#92400E', fontSize: '14px' }}>
                    <li>Prepared for {selectedCareer.category} major</li>
                    <li>Internship ready with real-world skills</li>
                    <li>Industry certifications available</li>
                  </ul>
                </div>
              </>
            ) : (
              // Default progression for careers without specific paths
              <div style={{
                padding: '20px',
                backgroundColor: '#FFF',
                borderRadius: '8px',
                border: '1px solid #E5E7EB'
              }}>
                <p style={{ color: '#6B7280', marginBottom: '15px' }}>
                  This career path will develop through:
                </p>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                    <CheckCircle style={{ width: '16px', height: '16px', color: '#22C55E', marginRight: '8px' }} />
                    <strong>Foundation Skills</strong> (Grades 9-10)
                  </li>
                  <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                    <Star style={{ width: '16px', height: '16px', color: '#3B82F6', marginRight: '8px' }} />
                    <strong>Advanced Training</strong> (Grade 11) - Premium Required
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <Zap style={{ width: '16px', height: '16px', color: '#8B5CF6', marginRight: '8px' }} />
                    <strong>Specialization</strong> (Grade 12) - Booster Required
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* High School Upsell */}
        {subscription === 'select' && selectedCareer && (
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <TrendingUp style={{ width: '24px', height: '24px', color: '#0284C7', marginRight: '10px' }} />
              <h4 style={{ margin: 0 }}>Build Your Complete Career Pathway</h4>
            </div>
            <p style={{ margin: '0 0 15px 0', color: '#075985' }}>
              Unlock advanced specializations and career enhancements to prepare for college and beyond.
            </p>
            <button
              onClick={() => {
                setUpgradeTarget('premium');
                setShowUpgradeModal(true);
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#0284C7',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Unlock Full Pathway
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>🧪 Age-Differentiated Career Selection Test</h2>

      {/* Grade Level Selector */}
      <div style={{ marginBottom: '30px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div>
          <label style={{ marginRight: '10px' }}>Grade Level:</label>
          <select
            value={gradeLevel}
            onChange={(e) => {
              setGradeLevel(e.target.value);
              setSelectedCareer(null);
              setSelectedBooster(null);
            }}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '16px'
            }}
          >
            <option value="K">Kindergarten</option>
            <option value="1">Grade 1</option>
            <option value="2">Grade 2</option>
            <option value="3">Grade 3</option>
            <option value="4">Grade 4</option>
            <option value="5">Grade 5</option>
            <option value="6">Grade 6</option>
            <option value="7">Grade 7</option>
            <option value="8">Grade 8</option>
            <option value="9">Grade 9</option>
            <option value="10">Grade 10</option>
            <option value="11">Grade 11</option>
            <option value="12">Grade 12</option>
          </select>
        </div>

        <div>
          <label style={{ marginRight: '10px' }}>Subscription:</label>
          <select
            value={subscription}
            onChange={(e) => setSubscription(e.target.value as 'select' | 'premium')}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #D1D5DB',
              fontSize: '16px'
            }}
          >
            <option value="select">Select (8 careers)</option>
            <option value="premium">Premium (200+ careers)</option>
          </select>
        </div>
      </div>

      {/* Render appropriate mode based on grade level */}
      {isHighSchool() ? renderPathwayMode() : renderExplorationMode()}

      {/* Generate Lesson Button */}
      {selectedCareer && (
        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <button
            onClick={generateLesson}
            disabled={loading}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            {loading ? 'Generating...' : `Generate Lesson as ${selectedCareer.name}`}
          </button>
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
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
            width: '90%'
          }}>
            <h3 style={{ marginTop: 0, color: '#1F2937' }}>
              {isHighSchool() ? '🎯 Unlock Your Career Pathway' : '🚀 Unlock More Adventures'}
            </h3>
            <p style={{ color: '#6B7280', marginBottom: '20px' }}>
              {isHighSchool()
                ? 'Get access to advanced specializations and career enhancements to prepare for your future.'
                : 'Explore 200+ amazing careers and try something new every day!'}
            </p>

            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '20px' }}>
              {isHighSchool() ? (
                <>
                  <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                    <Target style={{ width: '16px', height: '16px', marginRight: '8px', color: '#8B5CF6' }} />
                    Advanced specializations in Grade 11
                  </li>
                  <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                    <Briefcase style={{ width: '16px', height: '16px', marginRight: '8px', color: '#F59E0B' }} />
                    Career enhancements in Grade 12
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <Award style={{ width: '16px', height: '16px', marginRight: '8px', color: '#10B981' }} />
                    College & career readiness
                  </li>
                </>
              ) : (
                <>
                  <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                    <Sparkles style={{ width: '16px', height: '16px', marginRight: '8px', color: '#8B5CF6' }} />
                    200+ exciting careers to explore
                  </li>
                  <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                    <Rocket style={{ width: '16px', height: '16px', marginRight: '8px', color: '#F59E0B' }} />
                    New adventures every day
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <Star style={{ width: '16px', height: '16px', marginRight: '8px', color: '#10B981' }} />
                    Fun learning experiences
                  </li>
                </>
              )}
            </ul>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowUpgradeModal(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#F3F4F6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  console.log(`Upgrade to ${upgradeTarget}`);
                  setShowUpgradeModal(false);
                }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#8B5CF6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Display */}
      {unifiedLesson && (
        <div style={{ marginTop: '30px' }}>
          <h3>📚 Generated Lesson Plan</h3>
          <div style={{
            padding: '20px',
            backgroundColor: '#F9FAFB',
            borderRadius: '12px',
            border: '2px solid #E5E7EB'
          }}>
            <div style={{ marginBottom: '15px' }}>
              <strong>Career:</strong> {unifiedLesson.career.careerName} {unifiedLesson.career.icon}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Student:</strong> Test Student | Grade {gradeLevel}
            </div>
            <UnifiedPDFButton lessonPlan={unifiedLesson} />
          </div>
        </div>
      )}
    </div>
  );
};