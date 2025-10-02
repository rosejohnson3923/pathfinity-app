/**
 * Test component for unified lesson generation with Career Selector
 * Includes tier upsell flow: Select → Premium → Booster → AIFirst
 */

import React, { useState } from 'react';
import { lessonOrchestrator } from '../services/orchestration/LessonPlanOrchestrator';
import { UnifiedPDFButton } from './UnifiedLessonDownload';
import { getDemoLessonContent, getRolesForTier } from '../data/DemoLessonContent';
import { Star, Lock, Zap, Trophy, Sparkles, CheckCircle } from 'lucide-react';

// Demo students with AI companions and career progressions
const DEMO_STUDENTS = {
  sam_k: {
    name: 'Sam',
    grade: 'K',
    companion: 'Spark',
    career_family: 'chef',
    skill_cluster: 'A.1',
    academic_skills: {
      math: 'Count numbers 1-3',
      ela: 'Find uppercase letters',
      science: 'Classify objects by shape',
      social_studies: 'What is a community?'
    }
  },
  alex_1: {
    name: 'Alex',
    grade: '1',
    companion: 'Finn',
    career_family: 'doctor',
    skill_cluster: 'A.1',
    academic_skills: {
      math: 'Counting review - up to 10',
      ela: 'Sort consonants and vowels',
      science: 'Classify objects by two-dimensional shape',
      social_studies: 'Rules and laws'
    }
  },
  jordan_7: {
    name: 'Jordan',
    grade: '7',
    companion: 'Sage',
    career_family: 'game_designer',
    skill_cluster: 'A.1',
    academic_skills: {
      math: 'Understanding integers',
      ela: 'Determine main idea of passage',
      science: 'Process of scientific inquiry',
      social_studies: 'Identify lines of latitude/longitude'
    }
  },
  taylor_10: {
    name: 'Taylor',
    grade: '10',
    companion: 'Harmony',
    career_family: 'sports_agent',
    skill_cluster: 'A.1',
    academic_skills: {
      math: 'Compare and order integers',
      ela: 'Determine the main idea of a passage',
      science: 'The process of scientific inquiry',
      social_studies: 'Purposes of government'
    }
  }
};

// Career progression tiers for each demo student
const CAREER_PROGRESSIONS = {
  sam_k: {
    select: { title: 'Kitchen Helper', emoji: '👶‍🍳', booster_type: null },
    premium: { title: 'Little Chef', emoji: '👨‍🍳', booster_type: null },
    booster: { title: 'Bakery Helper', emoji: '🧑‍🍰', booster_type: 'Trade/Skill' },
    aifirst: { title: 'AI Kitchen Friend', emoji: '🤖👨‍🍳', booster_type: 'AIFirst' }
  },
  alex_1: {
    select: { title: 'Health Helper', emoji: '👶‍⚕️', booster_type: null },
    premium: { title: 'Junior Doctor', emoji: '👨‍⚕️', booster_type: null },
    booster: { title: 'Team Doctor', emoji: '🧑‍💼⚕️', booster_type: 'Corporate' },
    aifirst: { title: 'AI Health Friend', emoji: '🤖👨‍⚕️', booster_type: 'AIFirst' }
  },
  jordan_7: {
    select: { title: 'Game Helper', emoji: '👶🎮', booster_type: null },
    premium: { title: 'Junior Designer', emoji: '👨‍💻', booster_type: null },
    booster: { title: 'AI Game Maker', emoji: '🤖🎮', booster_type: 'AIFirst' },
    aifirst: { title: 'AI Game Publisher', emoji: '🤖📱', booster_type: 'AIFirst' }
  },
  taylor_10: {
    select: { title: 'Team Helper', emoji: '👶🏈', booster_type: null },
    premium: { title: 'Player Scout', emoji: '🔍🏈', booster_type: null },
    booster: { title: 'Contract Negotiator', emoji: '💼🏈', booster_type: 'Corporate' },
    aifirst: { title: 'AI Sports Scout', emoji: '🤖🏈', booster_type: 'AIFirst' }
  }
};

// Tier definitions for UI
const CAREER_TIERS = {
  select: {
    name: 'Select',
    color: '#9CA3AF',
    gradientColor: 'linear-gradient(135deg, #9CA3AF, #6B7280)',
    icon: '✓',
    description: 'Foundation learning',
    locked: false
  },
  premium: {
    name: 'Premium',
    color: '#3B82F6',
    gradientColor: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
    icon: '⭐',
    description: 'Enhanced experiences',
    locked: true
  },
  booster: {
    name: 'Booster',
    color: '#8B5CF6',
    gradientColor: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    icon: '⚡',
    description: 'Specialized skills',
    locked: true
  },
  aifirst: {
    name: 'AIFirst',
    color: '#F59E0B',
    gradientColor: 'linear-gradient(135deg, #F59E0B, #EA580C)',
    icon: '🤖',
    description: 'AI-powered learning',
    locked: true
  }
};

export const TestUnifiedLessonWithCareerSelector: React.FC = () => {
  console.log('🧪 TestUnifiedLessonWithCareerSelector rendering...');

  const [selectedStudent, setSelectedStudent] = useState<string>('sam_k');
  const [selectedTier, setSelectedTier] = useState<string>('select');
  const [selectedCareer, setSelectedCareer] = useState<any>(null);
  const [unifiedLesson, setUnifiedLesson] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [attemptedTier, setAttemptedTier] = useState<string | null>(null);

  // Get current student data (memoized to prevent infinite re-renders)
  const currentStudent = React.useMemo(() =>
    DEMO_STUDENTS[selectedStudent as keyof typeof DEMO_STUDENTS],
    [selectedStudent]
  );
  const currentProgressions = React.useMemo(() =>
    CAREER_PROGRESSIONS[selectedStudent as keyof typeof CAREER_PROGRESSIONS],
    [selectedStudent]
  );

  // Initialize first career selection
  React.useEffect(() => {
    if (currentStudent && currentProgressions) {
      const progression = currentProgressions['select'];

      // Set the selected career directly to avoid triggering handleCareerSelect
      setSelectedCareer({
        id: `${currentStudent.career_family}_select`,
        name: progression.title,
        emoji: progression.emoji,
        tier: 'select',
        booster_type: progression.booster_type,
        student: currentStudent
      });
    }
  }, [currentStudent, currentProgressions]);

  const handleTierClick = (tierKey: string) => {
    const tier = CAREER_TIERS[tierKey as keyof typeof CAREER_TIERS];

    // In demo mode, allow viewing all tiers but show upgrade prompt for locked ones
    setSelectedTier(tierKey);
    handleCareerSelect(tierKey);

    // Clear any existing lesson to force regeneration with new tier
    setUnifiedLesson(null);

    if (tier.locked) {
      // Show upgrade modal but still allow viewing the content
      setAttemptedTier(tierKey);
      setShowUpgradeModal(true);
    }
  };

  const handleCareerSelect = (tierKey: string) => {
    const tier = CAREER_TIERS[tierKey as keyof typeof CAREER_TIERS];
    const progression = currentProgressions[tierKey as keyof typeof currentProgressions];

    // Always set the selected career for demo purposes (all tiers are viewable)
    setSelectedCareer({
      id: `${currentStudent.career_family}_${tierKey}`,
      name: progression.title,
      emoji: progression.emoji,
      tier: tierKey,
      booster_type: progression.booster_type,
      student: currentStudent
    });

    // Still show upgrade modal for locked tiers, but don't prevent career selection
    if (tier.locked) {
      setAttemptedTier(tierKey);
      setShowUpgradeModal(true);
    }
  };

  const generateLessonWithCareer = async () => {
    if (!selectedCareer) {
      setError('Please select a career first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Generating tier-specific lesson for:', selectedCareer, 'Tier:', selectedTier);

      // Generate tier-specific demonstration lesson content
      const demoLesson = await generateDemonstrationLesson(selectedCareer, selectedTier, currentStudent);

      console.log('✅ Generated demonstration lesson:', demoLesson);
      setUnifiedLesson(demoLesson);

    } catch (err) {
      console.error('❌ Error generating demonstration lesson:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate demonstration lesson');
    } finally {
      setLoading(false);
    }
  };

  // Generate tier-specific demonstration content
  const generateDemonstrationLesson = async (career: any, tier: string, student: any) => {
    // Simulate API delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));

    const tierInfo = CAREER_TIERS[tier as keyof typeof CAREER_TIERS];
    const baseContent = {
      career: {
        careerName: career.name,
        icon: career.emoji,
        description: career.description,
        tier: tier
      },
      student: {
        name: student.name,
        grade: student.grade,
        companion: student.companion
      }
    };

    // Generate tier-specific lesson content based on sophistication level
    return {
      ...baseContent,
      subjects: generateTierSpecificSubjects(student, career, tier),
      lessonSummary: generateTierSpecificSummary(student, career, tier),
      tierFeatures: getTierSpecificFeatures(tier),
      estimatedDuration: getTierDuration(tier),
      generatedAt: new Date().toISOString(), // Add missing field for PDF generation
      content: {
        subjectContents: generateTierSpecificSubjects(student, career, tier).reduce((acc, subject) => {
          // Create the structure expected by PDF generator
          acc[subject.subject] = {
            skill: subject.skill,
            setup: subject.setup,
            challenges: subject.challenges,
            activities: subject.activities,
            assessmentLevel: subject.assessmentLevel,
            interactivity: subject.interactivity
          };
          return acc;
        }, {} as any)
      }
    };
  };

  // Generate subject content that varies by tier
  const generateTierSpecificSubjects = (student: any, career: any, tier: string) => {
    const subjects = ['Math', 'ELA', 'Science', 'Social Studies'];
    const gradeSkills = student?.academic_skills || {};

    return subjects.map(subject => {
      // Defensive check to prevent undefined errors
      if (!subject || typeof subject !== 'string') return null;

      const baseSkill = gradeSkills[subject.toLowerCase().replace(' ', '_')] || gradeSkills[subject.toLowerCase()] || `${subject} skills for grade ${student?.grade || 'K'}`;
      // Try to get rich setup and challenges from demo content
      const demoUserId = getDemoUserId(student.name, student.grade, career.name);
      const roleNumber = getRoleNumberForTier(tier);
      const subjectKey = subject.toLowerCase().replace(' ', '_');
      const demoContent = getDemoLessonContent(demoUserId, career.name.toLowerCase(), roleNumber, subjectKey);

      // Use rich content if available, otherwise fallback to generated content
      const richSetup = demoContent?.setup || `Setup for ${subject} lesson with ${career?.name?.toLowerCase() || 'career'} career context`;

      // Create PDF-compatible challenge structure with activities
      let richChallenges;
      if (demoContent?.challenge && demoContent?.activities) {
        // Convert our rich content to PDF-compatible format with role structure
        richChallenges = [{
          isRoleGroup: true,
          roleName: `${career?.name || 'Professional'} Role`,
          roleNumber: roleNumber,
          challenge_summary: `${subject} Challenge`,
          description: demoContent.challenge,
          question: demoContent.hint || demoContent.challenge,
          activities: demoContent.activities, // Include the rich activities here!
          career_context: `${career?.name?.toLowerCase() || 'career'} application`
        }];
        console.log(`📝 Subject: ${subject}, Setup: RICH, Challenges: RICH with ${demoContent.activities.length} activities`);
      } else {
        richChallenges = generateSubjectChallenges(subject, career, tier, student?.grade, baseSkill);
        console.log(`📝 Subject: ${subject}, Setup: ${demoContent ? 'RICH' : 'FALLBACK'}, Challenges: FALLBACK`);
      }

      return {
        subject,
        skill: {
          objective: baseSkill,
          careerConnection: getCareerConnection(subject, career, tier, student.grade)
        },
        activities: getTierSpecificActivities(subject, career, tier, student),
        assessmentLevel: getAssessmentLevel(tier),
        interactivity: getInteractivityLevel(tier),
        // Add PDF-compatible fields with rich content
        setup: richSetup,
        challenges: richChallenges
      };
    }).filter(Boolean); // Remove any null values
  };

  // Generate challenges for PDF compatibility
  const generateSubjectChallenges = (subject: string, career: any, tier: string, grade: string, skill: string) => {
    const complexity = {
      select: 'basic',
      premium: 'enhanced',
      booster: 'advanced',
      aifirst: 'AI-powered'
    };

    const careerName = career?.name || 'professional';
    const safeSkill = skill || `${subject} skills`;
    const safeSubject = subject || 'academic';
    const safeTier = tier || 'select';
    const safeGrade = grade || 'K';

    return [
      {
        challenge_summary: `${complexity[safeTier as keyof typeof complexity] || 'basic'} ${safeSubject} challenge`,
        description: `${safeSkill} applied to ${careerName.toLowerCase()} work`,
        question: `How would a ${careerName.toLowerCase()} use ${safeSkill.toLowerCase()} in their daily work?`,
        hint: `Think about how ${careerName.toLowerCase()}s need ${safeSubject.toLowerCase()} skills`,
        career_context: getCareerConnection(safeSubject, career, safeTier, safeGrade)
      },
      {
        challenge_summary: `Interactive ${safeSubject} problem`,
        description: `Practice ${safeSkill} with ${safeTier} tier features`,
        question: `Solve this ${safeSubject.toLowerCase()} problem like a ${careerName.toLowerCase()}`,
        hint: `Use the ${safeTier} tier tools and methods`,
        career_context: `Advanced application for ${careerName.toLowerCase()} career`
      }
    ];
  };

  // Get career-specific connection that increases in sophistication by tier
  const getCareerConnection = (subject: string, career: any, tier: string, grade: string) => {
    const connections: Record<string, Record<string, string>> = {
      select: {
        Math: `Use basic counting to help in ${career.name.toLowerCase()} tasks`,
        ELA: `Learn ${career.name.toLowerCase()} vocabulary words`,
        Science: `Explore tools used by ${career.name.toLowerCase()}s`,
        'Social Studies': `Meet community helpers like ${career.name.toLowerCase()}s`
      },
      premium: {
        Math: `Apply math skills to solve real ${career.name.toLowerCase()} challenges`,
        ELA: `Read and write about ${career.name.toLowerCase()} experiences`,
        Science: `Investigate scientific principles in ${career.name.toLowerCase()} work`,
        'Social Studies': `Understand how ${career.name.toLowerCase()}s contribute to society`
      },
      booster: {
        Math: `Use advanced calculations for ${career.name.toLowerCase()} business decisions`,
        ELA: `Create professional communication for ${career.name.toLowerCase()} roles`,
        Science: `Research cutting-edge techniques in ${career.name.toLowerCase()} field`,
        'Social Studies': `Analyze economic impact of ${career.name.toLowerCase()} industry`
      },
      aifirst: {
        Math: `Partner with AI to optimize ${career.name.toLowerCase()} mathematical processes`,
        ELA: `Collaborate with AI to enhance ${career.name.toLowerCase()} communication`,
        Science: `Use AI tools to advance ${career.name.toLowerCase()} scientific research`,
        'Social Studies': `Explore AI's role in transforming ${career.name.toLowerCase()} careers`
      }
    };

    return connections[tier]?.[subject] || `Learn about ${career.name.toLowerCase()} work`;
  };

  // Get tier-specific activities aligned with academic skills
  const getTierSpecificActivities = (subject: string, career: any, tier: string, student: any) => {
    console.log(`🔍 getTierSpecificActivities: subject=${subject}, career=${career.name}, tier=${tier}, student=${student.name}`);

    // Map to demo user ID based on student info
    const demoUserId = getDemoUserId(student.name, student.grade, career.name);
    console.log(`📋 Mapped to demo user: ${demoUserId}`);

    // Get the role number for this tier (Select=1, Premium=2, Booster=3, AIFirst=4)
    const roleNumber = getRoleNumberForTier(tier);
    console.log(`🎭 Role number for ${tier} tier: ${roleNumber}`);

    // Try to get rich content from our demo data
    const subjectKey = subject.toLowerCase().replace(' ', '_'); // 'Social Studies' -> 'social_studies'
    const demoContent = getDemoLessonContent(demoUserId, career.name.toLowerCase(), roleNumber, subjectKey);

    console.log(`📚 Demo content found for ${demoUserId}, ${career.name.toLowerCase()}, role${roleNumber}, ${subjectKey}:`, !!demoContent);

    if (demoContent && demoContent.activities) {
      console.log(`✅ Using rich demo activities:`, demoContent.activities);
      return demoContent.activities;
    }

    // Fallback to generated activities if no rich content available
    console.log(`⚠️ Falling back to generated activities for ${subject}`);
    const academicSkill = student.academic_skills[subject.toLowerCase().replace(' ', '_')] ||
                         student.academic_skills[subject.toLowerCase()] ||
                         `${subject} skills for grade ${student.grade}`;

    const skillBasedActivities = generateSkillBasedActivities(subject, academicSkill, career, tier);
    return skillBasedActivities;
  };

  // Helper function to map student info to demo user ID
  const getDemoUserId = (studentName: string, grade: string, careerName: string) => {
    const nameGradeMap = {
      'Sam': 'sam_k_chef',
      'Alex': 'alex_1st_doctor',
      'Jordan': 'jordan_7th_game_designer',
      'Taylor': 'taylor_10th_sports_agent'
    };

    return nameGradeMap[studentName as keyof typeof nameGradeMap] || 'sam_k_chef';
  };

  // Helper function to get role number for tier
  const getRoleNumberForTier = (tier: string): number => {
    const tierToRole = {
      'select': 1,
      'premium': 2,
      'booster': 3,
      'aifirst': 4
    };

    return tierToRole[tier as keyof typeof tierToRole] || 1;
  };

  // Generate concrete, actionable activities with tier-appropriate complexity
  const generateSkillBasedActivities = (subject: string, skill: string, career: any, tier: string) => {
    const careerName = career.name;

    // Base activities are the same across all tiers - but complexity increases
    const baseActivities = getCareerSpecificActivities(careerName, subject);

    // Apply tier-specific complexity to the same base activities
    const tieredActivities = baseActivities.map(activity => {
      return applyTierComplexity(activity, tier, skill, career.booster_type);
    });

    return tieredActivities;
  };

  // Get career-specific actionable activities
  const getCareerSpecificActivities = (careerName: string, subject: string): string[] => {
    const careerType = careerName.toLowerCase();

    if (careerType.includes('chef') || careerType.includes('kitchen')) {
      return ['Review Kitchen Safety Protocols', 'Analyze Recipe Measurements', 'Plan Menu Nutrition Content'];
    } else if (careerType.includes('doctor') || careerType.includes('health')) {
      return ['Review Patient Medical Records', 'Analyze Treatment Protocols', 'Understand Health Regulations'];
    } else if (careerType.includes('game') || careerType.includes('designer')) {
      return ['Review Game Design Documents', 'Analyze Player Analytics Data', 'Study Technical Specifications'];
    } else if (careerType.includes('sports') || careerType.includes('talent') || careerType.includes('nfl')) {
      return ['Review Contracts & Agreements', 'Analyze Financial Reports', 'Study Market Research & Analytics'];
    } else {
      // Default professional activities
      return ['Review Professional Documents', 'Analyze Industry Data', 'Study Regulatory Guidelines'];
    }
  };

  // Apply tier-specific complexity to base activities
  const applyTierComplexity = (baseActivity: string, tier: string, skill: string, boosterType?: string): string => {
    const tierPrefixes = {
      select: 'Basic: ',
      premium: 'Enhanced: ',
      booster: 'Advanced: ',
      aifirst: 'Incorporate AI First framework into '
    };

    let tierDescription = '';

    if (tier === 'select') {
      tierDescription = `using fundamental ${skill.toLowerCase()} concepts`;
    } else if (tier === 'premium') {
      tierDescription = `applying professional-level ${skill.toLowerCase()} skills`;
    } else if (tier === 'booster') {
      // Differentiate based on booster type
      if (boosterType === 'Trade/Skill') {
        tierDescription = `using hands-on ${skill.toLowerCase()} applications`;
      } else if (boosterType === 'Corporate') {
        tierDescription = `applying corporate-level ${skill.toLowerCase()} strategies`;
      } else if (boosterType === 'Entrepreneur') {
        tierDescription = `using entrepreneurial ${skill.toLowerCase()} approaches`;
      } else {
        tierDescription = `using advanced ${skill.toLowerCase()} techniques`;
      }
    } else if (tier === 'aifirst') {
      tierDescription = `optimized with ${skill.toLowerCase()}`;
    }

    const prefix = tierPrefixes[tier as keyof typeof tierPrefixes] || '';
    return `${prefix}${baseActivity} ${tierDescription}`;
  };

  // Get assessment sophistication by tier
  const getAssessmentLevel = (tier: string) => {
    const levels = {
      select: 'Basic comprehension checks',
      premium: 'Applied skill assessments',
      booster: 'Real-world problem solving',
      aifirst: 'AI-assisted adaptive evaluation'
    };
    return levels[tier as keyof typeof levels];
  };

  // Get interactivity level by tier
  const getInteractivityLevel = (tier: string) => {
    const levels = {
      select: 'Static content with simple interactions',
      premium: 'Interactive media and games',
      booster: 'Immersive simulations and projects',
      aifirst: 'AI companion-guided personalized experience'
    };
    return levels[tier as keyof typeof levels];
  };

  // Generate tier-specific lesson summary
  const generateTierSpecificSummary = (student: any, career: any, tier: string) => {
    const summaries = {
      select: `${student.name} explores basic ${career.name.toLowerCase()} tasks using grade ${student.grade} skills. Perfect for getting started!`,
      premium: `${student.name} dives deeper into ${career.name.toLowerCase()} work with enhanced activities and multimedia content.`,
      booster: `${student.name} experiences advanced ${career.name.toLowerCase()} challenges with real-world applications and specialized tools.`,
      aifirst: `${student.name} partners with ${student.companion} AI companion for a personalized ${career.name.toLowerCase()} learning journey.`
    };
    return summaries[tier as keyof typeof summaries];
  };

  // Get tier-specific features
  const getTierSpecificFeatures = (tier: string) => {
    const features = {
      select: ['Basic lesson plan', 'PDF download', 'Simple activities'],
      premium: ['Enhanced multimedia', 'Interactive elements', 'Extended content', 'Progress tracking'],
      booster: ['Advanced simulations', 'Real-world projects', 'Specialized tools', 'Industry connections'],
      aifirst: ['AI companion guidance', 'Personalized learning', 'Adaptive content', 'Future-ready skills']
    };
    return features[tier as keyof typeof features] || [];
  };

  // Get estimated duration by tier
  const getTierDuration = (tier: string) => {
    const durations = {
      select: '15-20 minutes',
      premium: '25-30 minutes',
      booster: '35-40 minutes',
      aifirst: '30-45 minutes (adaptive)'
    };
    return durations[tier as keyof typeof durations];
  };

  console.log('🧪 Rendering component with data:', { currentStudent, currentProgressions });

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>🧪 A.1 Skill Cluster Demo - Career Progression</h2>
      <div style={{ padding: '10px', backgroundColor: '#f0f0f0', marginBottom: '20px', fontSize: '12px' }}>
        Debug: Component loaded successfully. Current student: {selectedStudent}
      </div>

      {/* Student Selector */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Select Demo Student</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginTop: '15px' }}>
          {Object.entries(DEMO_STUDENTS).map(([key, student]) => (
            <div
              key={key}
              onClick={() => {
                setSelectedStudent(key);
                setSelectedCareer(null);
                setSelectedTier('select');
              }}
              style={{
                padding: '15px',
                borderRadius: '12px',
                backgroundColor: selectedStudent === key ? '#EFF6FF' : '#F9FAFB',
                border: selectedStudent === key ? '3px solid #3B82F6' : '2px solid #E5E7EB',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>👨‍🎓</div>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold' }}>
                {student.name} (Grade {student.grade})
              </h4>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 5px 0' }}>
                AI Companion: {student.companion}
              </p>
              <p style={{ fontSize: '12px', color: '#8B5CF6', margin: '0', fontWeight: '500' }}>
                {student.career_family.charAt(0).toUpperCase() + student.career_family.slice(1).replace('_', ' ')} Career
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Current Student Info */}
      <div style={{
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#F0F9FF',
        borderRadius: '12px',
        border: '2px solid #0EA5E9'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#0F172A' }}>
          {currentStudent.name} (Grade {currentStudent.grade}) + {currentStudent.companion} → A.1 Skill Cluster
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
          {Object.entries(currentStudent.academic_skills).map(([subject, skill]) => (
            <div key={subject} style={{ padding: '10px', backgroundColor: 'white', borderRadius: '8px' }}>
              <div style={{ fontWeight: 'bold', color: '#1E40AF', marginBottom: '5px' }}>
                {subject.charAt(0).toUpperCase() + subject.slice(1).replace('_', ' ')}
              </div>
              <div style={{ fontSize: '12px', color: '#374151' }}>{skill}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Career Tier Selector */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Career Progression: {currentStudent.career_family.charAt(0).toUpperCase() + currentStudent.career_family.slice(1).replace('_', ' ')} Family</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginTop: '15px' }}>
          {Object.entries(CAREER_TIERS).map(([key, tier]) => {
            const progression = currentProgressions[key as keyof typeof currentProgressions];
            return (
              <div
                key={key}
                onClick={() => handleTierClick(key)}
                style={{
                  padding: '15px',
                  borderRadius: '12px',
                  background: tier.gradientColor,
                  border: selectedTier === key ? '3px solid #8B5CF6' : '2px solid #E5E7EB',
                  cursor: tier.locked ? 'not-allowed' : 'pointer',
                  opacity: tier.locked ? 0.7 : 1,
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}
              >
                {tier.locked && (
                  <Lock style={{ position: 'absolute', top: '10px', right: '10px', width: '16px', height: '16px' }} />
                )}
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{progression.emoji}</div>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold' }}>{progression.title}</h4>
                <div style={{ fontSize: '11px', color: '#8B5CF6', fontWeight: '600', marginBottom: '3px' }}>
                  {tier.name} Tier
                </div>
                {progression.booster_type && (
                  <div style={{ fontSize: '10px', color: '#059669', fontWeight: '500', marginBottom: '3px' }}>
                    {progression.booster_type} Booster
                  </div>
                )}
                <p style={{ fontSize: '12px', color: '#6B7280', margin: '0' }}>{tier.description}</p>
                {tier.locked && (
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '8px', fontStyle: 'italic' }}>
                    Click to learn more
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Career Display */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Selected Career Path: {currentProgressions[selectedTier as keyof typeof currentProgressions].title}</h3>
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          backgroundColor: '#F0FDF4',
          border: '2px solid #22C55E',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>
            {currentProgressions[selectedTier as keyof typeof currentProgressions].emoji}
          </div>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 'bold', color: '#15803D' }}>
            {currentProgressions[selectedTier as keyof typeof currentProgressions].title}
          </h4>
          <div style={{ fontSize: '14px', color: '#059669', fontWeight: '600', marginBottom: '5px' }}>
            {CAREER_TIERS[selectedTier as keyof typeof CAREER_TIERS].name} Tier
          </div>
          {currentProgressions[selectedTier as keyof typeof currentProgressions].booster_type && (
            <div style={{ fontSize: '12px', color: '#8B5CF6', fontWeight: '500' }}>
              Enhanced with {currentProgressions[selectedTier as keyof typeof currentProgressions].booster_type} Booster
            </div>
          )}
          <CheckCircle style={{ width: '24px', height: '24px', color: '#059669', margin: '10px auto 0' }} />
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateLessonWithCareer}
        disabled={loading || !selectedCareer}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: selectedCareer ? '#8B5CF6' : '#9CA3AF',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading || !selectedCareer ? 'not-allowed' : 'pointer',
          opacity: loading || !selectedCareer ? 0.5 : 1
        }}
      >
        {loading ? 'Generating A.1 Lesson Plan...' :
         !selectedCareer ? 'Select a Career First' :
         `Generate A.1 Lesson as ${selectedCareer.name} (${currentStudent.name}, Grade ${currentStudent.grade})`}
      </button>

      {/* Upgrade Modal */}
      {showUpgradeModal && attemptedTier && (
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
              🚀 Unlock {currentProgressions[attemptedTier as keyof typeof currentProgressions]?.title}
            </h3>
            <p style={{ color: '#6B7280', marginBottom: '20px' }}>
              Upgrade to {CAREER_TIERS[attemptedTier as keyof typeof CAREER_TIERS].name} tier to access {currentStudent.name}'s {currentProgressions[attemptedTier as keyof typeof currentProgressions]?.title} experience:
            </p>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '20px' }}>
              <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                <Sparkles style={{ width: '16px', height: '16px', marginRight: '8px', color: '#8B5CF6' }} />
                {CAREER_TIERS[attemptedTier as keyof typeof CAREER_TIERS].description}
              </li>
              <li style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                <Trophy style={{ width: '16px', height: '16px', marginRight: '8px', color: '#F59E0B' }} />
                Enhanced learning experiences
              </li>
              <li style={{ display: 'flex', alignItems: 'center' }}>
                <Zap style={{ width: '16px', height: '16px', marginRight: '8px', color: '#10B981' }} />
                Priority support
              </li>
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
                  console.log(`Upgrade to ${attemptedTier} tier`);
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
                Upgrade to {CAREER_TIERS[attemptedTier as keyof typeof CAREER_TIERS].name}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
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

      {/* Lesson Display */}
      {unifiedLesson && (
        <div style={{ marginTop: '30px' }}>
          <h3>📚 Generated {CAREER_TIERS[selectedTier as keyof typeof CAREER_TIERS]?.name} Tier Lesson Plan</h3>

          <div style={{
            marginBottom: '20px',
            padding: '20px',
            backgroundColor: '#F9FAFB',
            borderRadius: '12px',
            border: '2px solid #E5E7EB'
          }}>
            {/* Career Header */}
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: '#EFF6FF',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '48px' }}>{unifiedLesson.career.icon}</span>
                <div>
                  <h4 style={{ margin: '0', color: '#1E40AF', fontSize: '20px' }}>
                    {unifiedLesson.career.careerName} Adventure
                  </h4>
                  <p style={{ margin: '5px 0 0 0', color: '#3B82F6', fontSize: '14px' }}>
                    {unifiedLesson.lessonSummary}
                  </p>
                </div>
              </div>
              <div style={{
                padding: '5px 10px',
                borderRadius: '6px',
                background: CAREER_TIERS[unifiedLesson.career.tier as keyof typeof CAREER_TIERS]?.gradientColor || '#E5E7EB',
                fontSize: '12px',
                fontWeight: 'bold',
                color: 'white'
              }}>
                {CAREER_TIERS[unifiedLesson.career.tier as keyof typeof CAREER_TIERS]?.name} Tier
              </div>
            </div>

            {/* Student & Companion Info */}
            <div style={{
              color: '#6B7280',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}>
              <span><strong>Student:</strong> {unifiedLesson.student.name}</span>
              <span><strong>Grade:</strong> {unifiedLesson.student.grade}</span>
              <span><strong>AI Companion:</strong> {unifiedLesson.student.companion}</span>
              <span><strong>Duration:</strong> {unifiedLesson.estimatedDuration}</span>
            </div>

            {/* Tier Features */}
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: '#F0F9FF',
              borderRadius: '8px',
              border: '1px solid #BAE6FD'
            }}>
              <h5 style={{ margin: '0 0 10px 0', color: '#0369A1' }}>
                ✨ {CAREER_TIERS[selectedTier as keyof typeof CAREER_TIERS]?.name} Tier Features
              </h5>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {unifiedLesson.tierFeatures.map((feature: string, idx: number) => (
                  <span key={idx} style={{
                    padding: '4px 8px',
                    backgroundColor: '#DBEAFE',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#1E40AF'
                  }}>
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Subject Contents */}
            <h5 style={{ color: '#1F2937', marginBottom: '15px' }}>📅 A.1 Skill Cluster Curriculum</h5>

            {unifiedLesson.subjects.map((subjectData: any, index: number) => {
              const borderColor = subjectData.subject === 'Math' ? '#3B82F6' :
                                 subjectData.subject === 'ELA' ? '#10B981' :
                                 subjectData.subject === 'Science' ? '#F59E0B' : '#8B5CF6';

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
                    {subjectData.subject === 'Math' ? '🔢' :
                     subjectData.subject === 'ELA' ? '📚' :
                     subjectData.subject === 'Science' ? '🧪' : '🌎'} {subjectData.subject}
                  </h5>

                  <div style={{ fontSize: '14px', color: '#4B5563', marginBottom: '10px' }}>
                    <strong>Academic Skill:</strong> {subjectData.skill.objective}
                  </div>

                  <div style={{ fontSize: '14px', color: '#059669', marginBottom: '10px' }}>
                    <strong>Career Connection:</strong> {subjectData.skill.careerConnection}
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <strong style={{ fontSize: '14px', color: '#7C3AED' }}>Activities:</strong>
                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                      {subjectData.activities.map((activity: string, idx: number) => (
                        <li key={idx} style={{ fontSize: '13px', color: '#4B5563', marginBottom: '3px' }}>
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#6B7280' }}>
                    <span><strong>Assessment:</strong> {subjectData.assessmentLevel}</span>
                    <span><strong>Interactivity:</strong> {subjectData.interactivity}</span>
                  </div>
                </div>
              );
            })}

            {/* PDF Download Section */}
            <div style={{
              marginTop: '30px',
              padding: '20px',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #E2E8F0'
            }}>
              <h5 style={{ margin: '0 0 15px 0', color: '#1F2937' }}>
                📄 Download Lesson Plan
              </h5>
              <UnifiedPDFButton lessonPlan={{
                ...unifiedLesson,
                // Ensure all required fields are present for PDF generation
                career: {
                  ...unifiedLesson.career,
                  tier: unifiedLesson.career?.tier || selectedTier
                },
                student: {
                  ...unifiedLesson.student,
                  gradeLevel: unifiedLesson.student?.grade || unifiedLesson.student?.gradeLevel
                }
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};