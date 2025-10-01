/**
 * Production Daily Lesson Plan Page for Teacher & Parent Dashboards
 * Integrates career progression demo system with production design system
 */

import React, { useState, useMemo } from 'react';
import { Star, Lock, Zap, Download, BookOpen, Target, Clock, Users } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useStudentProfile } from '../../hooks/useStudentProfile';
import { UnifiedPDFButton } from '../UnifiedLessonDownload';
import { ThemeAwareCard } from '../ui/ThemeAwareCard';
import { lessonOrchestrator } from '../../services/orchestration/LessonPlanOrchestrator';
import { getDemoLessonContent, getRolesForTier } from '../../data/DemoLessonContent';

interface Student {
  id: string;
  name: string;
  grade: string;
  companion: string;
  career_family: string;
  skill_cluster: string;
  academic_skills: {
    math: string;
    ela: string;
    science: string;
    social_studies: string;
  };
}

interface CareerProgression {
  select: { title: string; emoji: string; booster_type: null };
  premium: { title: string; emoji: string; booster_type: null };
  booster: { title: string; emoji: string; booster_type: string };
  aifirst: { title: string; emoji: string; booster_type: string };
}

// Subscription tier definitions
const SUBSCRIPTION_TIERS = {
  select: {
    name: 'Select',
    color: 'var(--color-primary)',
    icon: '✓',
    description: 'Essential learning foundation',
    locked: false,
  },
  premium: {
    name: 'Premium',
    color: '#3B82F6',
    icon: '⭐',
    description: 'Enhanced learning experiences',
    locked: true,
  },
  booster: {
    name: 'Booster',
    color: '#8B5CF6',
    icon: '⚡',
    description: 'Specialized career preparation',
    locked: true,
  },
  aifirst: {
    name: 'AIFirst',
    color: '#F59E0B',
    icon: '🤖',
    description: 'AI-powered personalized learning',
    locked: true,
  }
};

export const DailyLessonPlanPage: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useStudentProfile();
  const [selectedTier, setSelectedTier] = useState<string>('select');
  const [generatedLesson, setGeneratedLesson] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Create student profile from authenticated user data
  const currentStudent: Student = useMemo(() => {
    const grade = profile?.grade_level || 'K';
    const studentName = user?.full_name || 'Student';

    // Map grade to appropriate AI companion and career family
    const gradeMapping = {
      'K': { companion: 'Spark', career: 'chef' },
      '1': { companion: 'Finn', career: 'doctor' },
      '2': { companion: 'Finn', career: 'doctor' },
      '3': { companion: 'Finn', career: 'doctor' },
      '4': { companion: 'Finn', career: 'doctor' },
      '5': { companion: 'Finn', career: 'doctor' },
      '6': { companion: 'Sage', career: 'game_designer' },
      '7': { companion: 'Sage', career: 'game_designer' },
      '8': { companion: 'Sage', career: 'game_designer' },
      '9': { companion: 'Harmony', career: 'nfl_player' },
      '10': { companion: 'Harmony', career: 'nfl_player' },
      '11': { companion: 'Harmony', career: 'nfl_player' },
      '12': { companion: 'Harmony', career: 'nfl_player' }
    };

    const mapping = gradeMapping[grade as keyof typeof gradeMapping] || gradeMapping['K'];

    // Grade-appropriate academic skills
    const academicSkills = {
      'K': {
        math: 'Count numbers 1-3',
        ela: 'Find uppercase letters',
        science: 'Classify objects by shape',
        social_studies: 'What is a community?'
      },
      '1': {
        math: 'Count numbers 1-10',
        ela: 'Recognize sight words',
        science: 'Identify living/non-living',
        social_studies: 'Community helpers'
      },
      '7': {
        math: 'Understanding integers',
        ela: 'Determine main idea of passage',
        science: 'Process of scientific inquiry',
        social_studies: 'Identify lines of latitude/longitude'
      },
      '10': {
        math: 'Linear equations',
        ela: 'Analyze complex texts',
        science: 'Physics principles',
        social_studies: 'Economic systems'
      }
    };

    const skills = academicSkills[grade as keyof typeof academicSkills] || academicSkills['K'];

    return {
      id: user?.id || 'demo',
      name: studentName,
      grade,
      companion: mapping.companion,
      career_family: mapping.career,
      skill_cluster: 'A.1',
      academic_skills: skills
    };
  }, [user, profile]);

  // Career progressions based on career family
  const careerProgressions: CareerProgression = useMemo(() => {
    const progressions = {
      chef: {
        select: { title: 'Kitchen Helper', emoji: '👶‍🍳', booster_type: null },
        premium: { title: 'Little Chef', emoji: '👨‍🍳', booster_type: null },
        booster: { title: 'Bakery Helper', emoji: '🧑‍🍰', booster_type: 'Trade/Skill' },
        aifirst: { title: 'AI Kitchen Friend', emoji: '🤖👨‍🍳', booster_type: 'AIFirst' }
      },
      doctor: {
        select: { title: 'Health Helper', emoji: '👶‍⚕️', booster_type: null },
        premium: { title: 'Junior Doctor', emoji: '👨‍⚕️', booster_type: null },
        booster: { title: 'Team Doctor', emoji: '🧑‍💼⚕️', booster_type: 'Corporate' },
        aifirst: { title: 'AI Health Friend', emoji: '🤖👨‍⚕️', booster_type: 'AIFirst' }
      },
      game_designer: {
        select: { title: 'Game Helper', emoji: '👶🎮', booster_type: null },
        premium: { title: 'Junior Designer', emoji: '👨‍💻', booster_type: null },
        booster: { title: 'AI Game Maker', emoji: '🤖🎮', booster_type: 'AIFirst' },
        aifirst: { title: 'AI Game Publisher', emoji: '🤖📱', booster_type: 'AIFirst' }
      },
      nfl_player: {
        select: { title: 'Team Helper', emoji: '👶🏈', booster_type: null },
        premium: { title: 'Professional Player', emoji: '🏈', booster_type: null },
        booster: { title: 'Sports Franchise Owner', emoji: '💼🏈', booster_type: 'Entrepreneur' },
        aifirst: { title: 'AI Sports Talent Agency', emoji: '🤖🏈', booster_type: 'AIFirst' }
      }
    };

    return progressions[currentStudent.career_family as keyof typeof progressions] || progressions.chef;
  }, [currentStudent.career_family]);

  const handleTierSelect = (tierKey: string) => {
    setSelectedTier(tierKey);
  };

  const generateDailyLessonPlan = async () => {
    setLoading(true);

    try {
      console.log('🚀 Generating hybrid lesson plan using lessonOrchestrator + tier progression');

      // Get the base career name from the student's career family
      const baseCareerName = currentStudent.career_family; // 'chef', 'doctor', etc.
      const careerRole = careerProgressions[selectedTier as keyof typeof careerProgressions];
      const selectedCareer = {
        title: baseCareerName.charAt(0).toUpperCase() + baseCareerName.slice(1), // 'Chef'
        emoji: careerRole?.emoji || '🎯',
        role: careerRole?.title || 'Professional'
      };
      const tierInfo = SUBSCRIPTION_TIERS[selectedTier as keyof typeof SUBSCRIPTION_TIERS];

      // Step 1: Generate authentic lesson content using lessonOrchestrator
      const orchestratorResult = await lessonOrchestrator.generateDailyLessons(
        currentStudent.id,
        selectedCareer.title
      );

      console.log('✅ Generated base lesson from orchestrator:', orchestratorResult);

      // Step 2: Generate role progression lessons using mock data
      const roleProgressionSubjects = generateRoleProgressionLesson(
        currentStudent,
        selectedCareer,
        selectedTier
      );

      // Step 3: Create final lesson structure combining best of both worlds
      const lesson = {
        // Keep orchestrator's authentic lesson structure
        ...orchestratorResult.lesson,
        // Override with our tier progression enhancements
        student: {
          name: currentStudent.name,
          grade: currentStudent.grade,
          companion: currentStudent.companion
        },
        career: {
          careerName: selectedCareer.title,
          icon: selectedCareer.emoji,
          tier: selectedTier
        },
        subjects: roleProgressionSubjects,
        lessonSummary: `${currentStudent.name} explores ${selectedCareer.title.toLowerCase()} work using grade ${currentStudent.grade} A.1 skills with ${tierInfo.description.toLowerCase()}.`,
        tierFeatures: getTierFeatures(selectedTier),
        estimatedDuration: getTierDuration(selectedTier),
        generatedAt: new Date().toISOString(),
        subscription: { tier: selectedTier },
        // Ensure PDF compatibility with enhanced content structure
        content: {
          subjectContents: roleProgressionSubjects.reduce((acc, subject) => {
            // Convert role progression data to PDF-compatible format
            let challenges = [];
            let setup = '';

            if (subject.roles && subject.roles.length > 0) {
              // Use the first role for setup (Kitchen Helper for Select tier)
              setup = subject.roles[0].setup || `${subject.subject} activities for ${selectedCareer.title.toLowerCase()}`;

              // Keep roles structure for hierarchical PDF display
              // Don't flatten into challenges - let PDF generator handle role grouping
              challenges = subject.roles.map(role => ({
                roleName: role.roleName,
                roleNumber: role.roleNumber,
                setup: role.setup,
                activities: role.activities || [],
                hint: role.hint,
                challenge: role.challenge,
                learningOutcome: role.learningOutcome,
                isRoleGroup: true // Flag to identify this as a role group
              }));
            }

            // Fallback if no role data
            if (challenges.length === 0) {
              challenges = subject.challenges
                ? (typeof subject.challenges === 'string' ? [subject.challenges] : subject.challenges)
                : generateSubjectChallenges(subject.subject, selectedCareer, selectedTier, currentStudent.grade, subject.skill.objective);
            }

            acc[subject.subject] = {
              skill: { objective: subject.skill.objective },
              setup: setup,
              challenges: challenges,
              activities: subject.activities,
              assessmentLevel: subject.assessmentLevel,
              interactivity: subject.interactivity
            };
            return acc;
          }, {} as any)
        }
      };

      console.log('🎯 Final hybrid lesson plan:', lesson);
      setGeneratedLesson(lesson);

    } catch (error) {
      console.error('❌ Error generating hybrid lesson plan:', error);
      // Fallback to mock data if orchestrator fails
      await generateFallbackLesson();
    } finally {
      setLoading(false);
    }
  };

  // Helper functions from our test component
  const generateTierSpecificSubjects = (student: Student, career: any, tier: string) => {
    const subjects = ['Math', 'ELA', 'Science', 'Social Studies'];

    return subjects.map(subject => {
      const skill = student.academic_skills[subject.toLowerCase().replace(' ', '_') as keyof typeof student.academic_skills];

      return {
        subject,
        skill: {
          objective: skill,
          careerConnection: getCareerConnection(subject, career, tier)
        },
        activities: getCareerSpecificActivities(career.title, subject, tier, skill),
        assessmentLevel: getAssessmentLevel(tier),
        interactivity: getInteractivityLevel(tier)
      };
    });
  };

  const getCareerConnection = (subject: string, career: any, tier: string) => {
    const connections = {
      select: `Learn how ${career.title.toLowerCase()}s use ${subject.toLowerCase()} in their daily work`,
      premium: `Apply ${subject.toLowerCase()} skills in real ${career.title.toLowerCase()} scenarios`,
      booster: `Use advanced ${subject.toLowerCase()} techniques for ${career.title.toLowerCase()} success`,
      aifirst: `Partner with AI to optimize ${subject.toLowerCase()} applications in ${career.title.toLowerCase()} work`
    };

    return connections[tier as keyof typeof connections];
  };

  const getCareerSpecificActivities = (careerTitle: string, subject: string, tier: string, skill: string) => {
    const careerType = careerTitle.toLowerCase();

    let baseActivities = ['Review Professional Documents', 'Analyze Industry Data', 'Study Regulatory Guidelines'];

    if (careerType.includes('chef') || careerType.includes('kitchen')) {
      baseActivities = ['Review Kitchen Safety Protocols', 'Analyze Recipe Measurements', 'Plan Menu Nutrition Content'];
    } else if (careerType.includes('doctor') || careerType.includes('health')) {
      baseActivities = ['Review Patient Medical Records', 'Analyze Treatment Protocols', 'Understand Health Regulations'];
    } else if (careerType.includes('game') || careerType.includes('designer')) {
      baseActivities = ['Review Game Design Documents', 'Analyze Player Analytics Data', 'Study Technical Specifications'];
    } else if (careerType.includes('sports') || careerType.includes('talent') || careerType.includes('franchise')) {
      baseActivities = ['Review Contracts & Agreements', 'Analyze Financial Reports', 'Study Market Research & Analytics'];
    }

    return baseActivities.map(activity => applyTierComplexity(activity, tier, skill));
  };

  const applyTierComplexity = (baseActivity: string, tier: string, skill: string) => {
    // Return original base activity format for all tiers to maintain connection to rich content structure
    return baseActivity;
  };

  const getAssessmentLevel = (tier: string) => {
    const levels = {
      select: 'Basic comprehension checks',
      premium: 'Applied skill assessments',
      booster: 'Real-world problem solving',
      aifirst: 'AI-assisted adaptive evaluation'
    };
    return levels[tier as keyof typeof levels];
  };

  const getInteractivityLevel = (tier: string) => {
    const levels = {
      select: 'Static content with simple interactions',
      premium: 'Interactive media and games',
      booster: 'Immersive simulations and projects',
      aifirst: 'AI companion-guided personalized experience'
    };
    return levels[tier as keyof typeof levels];
  };

  const getTierFeatures = (tier: string) => {
    const features = {
      select: ['Basic lesson plan', 'PDF download', 'Core activities'],
      premium: ['Enhanced multimedia', 'Interactive elements', 'Extended content'],
      booster: ['Advanced simulations', 'Real-world projects', 'Specialized tools'],
      aifirst: ['AI companion guidance', 'Personalized learning', 'Adaptive content']
    };
    return features[tier as keyof typeof features] || [];
  };

  const getTierDuration = (tier: string) => {
    const durations = {
      select: '15-20 minutes',
      premium: '25-30 minutes',
      booster: '35-40 minutes',
      aifirst: '30-45 minutes (adaptive)'
    };
    return durations[tier as keyof typeof durations];
  };

  // Generate challenges for PDF compatibility
  const generateSubjectChallenges = (subject: string, career: any, tier: string, grade: string, skill: string) => {
    const complexity = {
      select: 'basic',
      premium: 'enhanced',
      booster: 'advanced',
      aifirst: 'AI-powered'
    };

    const careerName = career?.title || 'professional';
    const safeSkill = skill || `${subject} skills`;
    const safeSubject = subject || 'academic';
    const safeTier = tier || 'select';

    return [
      {
        challenge_summary: `${complexity[safeTier as keyof typeof complexity] || 'basic'} ${safeSubject} challenge`,
        description: `${safeSkill} applied to ${careerName.toLowerCase()} work`,
        question: `How would a ${careerName.toLowerCase()} use ${safeSkill.toLowerCase()} in their daily work?`,
        hint: `Think about how ${careerName.toLowerCase()}s need ${safeSubject.toLowerCase()} skills`,
        career_context: getCareerConnection(safeSubject, career, safeTier)
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

  // NEW: Generate role-based lesson progression using high-quality mock data
  const generateRoleProgressionLesson = (student: Student, career: any, tier: string) => {
    console.log('🎯 Generating role progression lesson:', { student: student.name, career: career.title, tier });

    const baseSubjects = ['Math', 'ELA', 'Science', 'Social Studies'];
    const availableRoles = getRolesForTier(tier);

    console.log(`🔄 Available roles for ${tier} tier:`, availableRoles);

    // Generate content for each subject across all available roles
    return baseSubjects.map(subject => {
      const roleContents = availableRoles.map(roleNumber => {
        // Map to demo user based on grade and career
        const demoUserId = getDemoUserId(student.grade, career.title);
        console.log(`🔍 Looking for demo content: userId=${demoUserId}, career=${career.title.toLowerCase()}, role=${roleNumber}, subject=${subject}`);

        const demoContent = getDemoLessonContent(
          demoUserId,
          career.title.toLowerCase(),
          roleNumber,
          subject
        );

        console.log(`📚 Demo content found:`, demoContent ? 'YES' : 'NO', demoContent);

        if (demoContent) {
          return {
            roleNumber,
            roleName: getRoleName(career.title, roleNumber),
            ...demoContent
          };
        }

        // Fallback for missing demo content
        return {
          roleNumber,
          roleName: getRoleName(career.title, roleNumber),
          setup: `Role ${roleNumber} ${subject} learning experience`,
          activities: [`Role ${roleNumber} activity 1`, `Role ${roleNumber} activity 2`, `Role ${roleNumber} activity 3`],
          challenge: `Role ${roleNumber} ${subject} challenge`,
          hint: `Role ${roleNumber} ${subject} hint`,
          learningOutcome: `Role ${roleNumber} ${subject} learning outcome`
        };
      });

      return {
        subject: subject,
        skill: {
          objective: getSubjectSkill(subject, student.grade),
          gradeLevel: student.grade,
          cluster: student.skill_cluster
        },
        roles: roleContents,
        // For backward compatibility, use the first role's activities
        activities: roleContents[0]?.activities || [],
        setup: roleContents[0]?.setup || '',
        challenges: roleContents[0]?.challenge ? [roleContents[0].challenge] : [],
        assessmentLevel: getTierAssessmentLevel(tier),
        interactivity: getTierInteractivity(tier)
      };
    });
  };

  // Helper function to get demo user ID based on grade and career
  const getDemoUserId = (grade: string, careerTitle: string) => {
    const gradeCareerMap = {
      'K': 'sam_k_chef',
      '1': 'alex_1st_doctor',
      '10': 'taylor_10th_sports_agent',
      '12': 'jordan_12th_game_designer'
    };

    return gradeCareerMap[grade as keyof typeof gradeCareerMap] || 'sam_k_chef';
  };

  // Helper function to get role names
  const getRoleName = (careerTitle: string, roleNumber: number) => {
    const roleNames = {
      chef: ['Kitchen Helper', 'Little Chef', 'Bakery Helper', 'AI Kitchen Friend'],
      doctor: ['Medical Assistant', 'Nurse Helper', 'Junior Doctor', 'AI Medical Consultant'],
      'sports talent agency': ['Team Helper', 'Player Scout', 'Contract Negotiator', 'AI Sports Analyst'],
      'game designer': ['Game Tester', 'Level Designer', 'Character Creator', 'AI Game Master']
    };

    const careerKey = careerTitle.toLowerCase();
    const roles = roleNames[careerKey as keyof typeof roleNames] || ['Role 1', 'Role 2', 'Role 3', 'Role 4'];
    return roles[roleNumber - 1] || `Role ${roleNumber}`;
  };

  // Fallback lesson generation using our existing mock system
  const generateFallbackLesson = async () => {
    console.log('⚠️ Using fallback lesson generation (mock data)');

    const selectedCareer = careerProgressions[selectedTier as keyof typeof careerProgressions];
    const tierInfo = SUBSCRIPTION_TIERS[selectedTier as keyof typeof SUBSCRIPTION_TIERS];
    const subjects = generateTierSpecificSubjects(currentStudent, selectedCareer, selectedTier);

    const lesson = {
      student: {
        name: currentStudent.name,
        grade: currentStudent.grade,
        companion: currentStudent.companion
      },
      career: {
        careerName: selectedCareer.title,
        icon: selectedCareer.emoji,
        tier: selectedTier
      },
      subjects: subjects,
      lessonSummary: `${currentStudent.name} explores ${selectedCareer.title.toLowerCase()} work using grade ${currentStudent.grade} A.1 skills with ${tierInfo.description.toLowerCase()}.`,
      tierFeatures: getTierFeatures(selectedTier),
      estimatedDuration: getTierDuration(selectedTier),
      generatedAt: new Date().toISOString(),
      subscription: { tier: selectedTier },
      content: {
        subjectContents: subjects.reduce((acc, subject) => {
          acc[subject.subject] = {
            skill: subject.skill.objective,
            setup: `Setup for ${subject.subject} lesson with ${selectedCareer.title.toLowerCase()} career context`,
            challenges: generateSubjectChallenges(subject.subject, selectedCareer, selectedTier, currentStudent.grade, subject.skill.objective),
            activities: subject.activities,
            assessmentLevel: subject.assessmentLevel,
            interactivity: subject.interactivity
          };
          return acc;
        }, {} as any)
      }
    };

    setGeneratedLesson(lesson);
  };

  // Helper function to get subject skill for grade level
  const getSubjectSkill = (subject: string, grade: string) => {
    const skills = {
      'Math': {
        'K': 'Count numbers 1-3',
        '1': 'Add and subtract within 10',
        '2': 'Add and subtract within 20',
        '3': 'Multiply and divide within 100'
      },
      'ELA': {
        'K': 'Find uppercase letters',
        '1': 'Read simple sentences',
        '2': 'Read grade-level text',
        '3': 'Read and understand stories'
      },
      'Science': {
        'K': 'Classify objects by shape',
        '1': 'Observe and describe',
        '2': 'Make simple predictions',
        '3': 'Conduct simple experiments'
      },
      'Social Studies': {
        'K': 'What is a community?',
        '1': 'Learn about families',
        '2': 'Understand neighborhoods',
        '3': 'Study communities and regions'
      }
    };

    return skills[subject]?.[grade] || `Grade ${grade} ${subject} skills`;
  };

  // Helper function to get career-specific activities
  const getCareerActivities = (career: any, tier: string) => {
    const baseActivities = ['Review Contracts & Agreements', 'Analyze Financial Reports', 'Study Market Research & Analytics'];
    return baseActivities;
  };

  // Helper function to get tier-specific assessment level
  const getTierAssessmentLevel = (tier: string) => {
    const levels = {
      select: 'Basic comprehension checks',
      premium: 'Applied knowledge assessment',
      booster: 'Advanced skill demonstration',
      aifirst: 'AI-enhanced performance evaluation'
    };
    return levels[tier as keyof typeof levels] || levels.select;
  };

  // Helper function to get tier-specific interactivity
  const getTierInteractivity = (tier: string) => {
    const interactivity = {
      select: 'Simple Q&A format',
      premium: 'Interactive exercises with feedback',
      booster: 'Hands-on simulations and role-play',
      aifirst: 'AI-powered adaptive interactions'
    };
    return interactivity[tier as keyof typeof interactivity] || interactivity.select;
  };

  return (
    <div className="min-h-screen" style={{
      backgroundColor: 'var(--color-background)',
      color: 'var(--color-text)',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'var(--color-card)',
        borderBottom: '1px solid var(--color-border)',
        padding: '1.5rem 2rem'
      }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen size={28} style={{ color: 'var(--color-primary)' }} />
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: '700',
              color: 'var(--color-text)'
            }}>
              Daily Lesson Plans
            </h1>
          </div>
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: '1rem'
          }}>
            Explore career-focused learning experiences tailored to {currentStudent.name}'s Grade {currentStudent.grade} curriculum
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Student Profile Card */}
        <ThemeAwareCard className="mb-8">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: '600'
              }}>
                {currentStudent.name.charAt(0)}
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
                  {currentStudent.name}
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', margin: '0.25rem 0' }}>
                  Grade {currentStudent.grade} • AI Companion: {currentStudent.companion}
                </p>
                <p style={{ color: 'var(--color-accent)', fontSize: '0.875rem', margin: 0 }}>
                  A.1 Skill Cluster • {currentStudent.career_family.charAt(0).toUpperCase() + currentStudent.career_family.slice(1).replace('_', ' ')} Career Track
                </p>
              </div>
            </div>

            {/* Academic Skills */}
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
                Current Academic Skills
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(currentStudent.academic_skills).map(([subject, skill]) => (
                  <div key={subject} style={{
                    padding: '1rem',
                    backgroundColor: 'var(--color-background)',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)'
                  }}>
                    <div style={{
                      fontWeight: '600',
                      color: 'var(--color-primary)',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem'
                    }}>
                      {subject.charAt(0).toUpperCase() + subject.slice(1).replace('_', ' ')}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text)' }}>
                      {skill}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ThemeAwareCard>

        {/* Subscription Tier Selector */}
        <ThemeAwareCard className="mb-8">
          <div className="p-6">
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Choose Your Learning Experience
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
              Click your plan or preview premium plus plans available for upgrade
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => {
                const progression = careerProgressions[key as keyof typeof careerProgressions];
                const isSelected = selectedTier === key;
                const isUserPlan = key === 'select'; // Assuming user has select plan

                return (
                  <div
                    key={key}
                    onClick={() => handleTierSelect(key)}
                    style={{
                      padding: '1.5rem',
                      borderRadius: '12px',
                      backgroundColor: tier.color,
                      color: 'white',
                      cursor: 'pointer',
                      border: isSelected ? '4px solid #FFD700' : '2px solid transparent',
                      boxShadow: isSelected ? '0 0 20px rgba(255, 215, 0, 0.5)' : 'none',
                      opacity: tier.locked ? 0.9 : 1,
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                    }}
                  >
                    {/* Tier Label */}
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      right: tier.locked ? '32px' : '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {tier.locked && (
                        <Lock size={12} style={{ opacity: 0.8 }} />
                      )}
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        textTransform: 'uppercase'
                      }}>
                        {isUserPlan ? `Your ${tier.name} Plan` : `${tier.name} Tier`}
                      </span>
                    </div>

                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem', marginTop: '1.5rem' }}>
                      {progression.emoji}
                    </div>

                    <h4 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      marginBottom: '0.25rem'
                    }}>
                      {progression.title}
                    </h4>

                    {progression.booster_type && (
                      <div style={{
                        fontSize: '0.75rem',
                        marginBottom: '0.5rem',
                        opacity: 0.8
                      }}>
                        {progression.booster_type} Booster
                      </div>
                    )}

                    <p style={{
                      fontSize: '0.875rem',
                      marginBottom: '1rem',
                      opacity: 0.9
                    }}>
                      {tier.description}
                    </p>

                  </div>
                );
              })}
            </div>
          </div>
        </ThemeAwareCard>

        {/* Generate Lesson Button */}
        <div className="text-center mb-8">
          <button
            onClick={generateDailyLessonPlan}
            disabled={loading}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.125rem',
              fontWeight: '600',
              backgroundColor: loading ? 'var(--color-text-secondary)' : 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Generating Lesson Plan...
              </>
            ) : (
              <>
                <Target size={20} />
                Generate {SUBSCRIPTION_TIERS[selectedTier as keyof typeof SUBSCRIPTION_TIERS].name} Lesson Plan
              </>
            )}
          </button>
        </div>

        {/* Generated Lesson Display */}
        {generatedLesson && (
          <ThemeAwareCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 style={{ fontSize: '1.5rem', fontWeight: '600' }}>
                  📚 Your {SUBSCRIPTION_TIERS[selectedTier as keyof typeof SUBSCRIPTION_TIERS].name} Daily Lesson Plan
                </h3>
                <UnifiedPDFButton lessonPlan={generatedLesson} />
              </div>

              {/* Lesson Overview */}
              <div style={{
                padding: '1.5rem',
                backgroundColor: 'var(--color-background)',
                borderRadius: '8px',
                marginBottom: '2rem'
              }}>
                <div className="flex items-center gap-4 mb-4">
                  <span style={{ fontSize: '3rem' }}>{generatedLesson.career.icon}</span>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
                      {generatedLesson.career.careerName} Adventure
                    </h4>
                    <p style={{ color: 'var(--color-text-secondary)', margin: '0.5rem 0' }}>
                      {generatedLesson.lessonSummary}
                    </p>
                    <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        {generatedLesson.estimatedDuration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={16} />
                        {generatedLesson.student.companion} AI Companion
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tier Features */}
                <div style={{ marginTop: '1rem' }}>
                  <h5 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    ✨ {SUBSCRIPTION_TIERS[selectedTier as keyof typeof SUBSCRIPTION_TIERS].name} Features
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {generatedLesson.tierFeatures.map((feature: string, idx: number) => (
                      <span key={idx} style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: 'var(--color-card)',
                        borderRadius: '1rem',
                        fontSize: '0.875rem',
                        color: 'var(--color-primary)',
                        border: '1px solid var(--color-border)'
                      }}>
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subject Breakdown */}
              <div>
                <h5 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                  📅 A.1 Skill Cluster Curriculum
                </h5>

                <div className="space-y-4">
                  {generatedLesson.subjects.map((subjectData: any, index: number) => {
                    const subjectColors = {
                      'Math': '#3B82F6',
                      'ELA': '#10B981',
                      'Science': '#F59E0B',
                      'Social Studies': '#8B5CF6'
                    };
                    const borderColor = subjectColors[subjectData.subject as keyof typeof subjectColors] || '#6B7280';

                    return (
                      <div
                        key={index}
                        style={{
                          padding: '1.5rem',
                          backgroundColor: 'var(--color-card)',
                          borderRadius: '8px',
                          borderLeft: `4px solid ${borderColor}`,
                          border: '1px solid var(--color-border)'
                        }}
                      >
                        {/* Subject Header Row */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '1rem',
                          flexWrap: 'wrap',
                          gap: '1rem'
                        }}>
                          <h6 style={{
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            margin: 0,
                            color: borderColor,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <span style={{ fontSize: '1.5rem' }}>
                              {subjectData.subject === 'Math' ? '🔢' :
                               subjectData.subject === 'ELA' ? '📚' :
                               subjectData.subject === 'Science' ? '🧪' : '🌎'}
                            </span>
                            {subjectData.subject}
                          </h6>

                          <div style={{
                            display: 'flex',
                            gap: '1rem',
                            fontSize: '0.875rem',
                            color: 'var(--color-text-secondary)',
                            flexWrap: 'wrap'
                          }}>
                            <span><strong>Assessment:</strong> {subjectData.assessmentLevel}</span>
                            <span><strong>Interactivity:</strong> {subjectData.interactivity}</span>
                          </div>
                        </div>

                        {/* Content Grid */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(250px, 1fr) minmax(250px, 1fr)',
                          gap: '1.5rem',
                          alignItems: 'start'
                        }}>
                          {/* Left Column - Skills & Connection */}
                          <div>
                            <div style={{ marginBottom: '1rem' }}>
                              <strong style={{
                                color: 'var(--color-text)',
                                fontSize: '0.875rem',
                                display: 'block',
                                marginBottom: '0.25rem'
                              }}>
                                Academic Skill:
                              </strong>
                              <span style={{
                                color: 'var(--color-text-secondary)',
                                fontSize: '0.9rem',
                                lineHeight: '1.4'
                              }}>
                                {subjectData.skill.objective}
                              </span>
                            </div>

                            <div>
                              <strong style={{
                                color: 'var(--color-accent)',
                                fontSize: '0.875rem',
                                display: 'block',
                                marginBottom: '0.25rem'
                              }}>
                                Career Connection:
                              </strong>
                              <span style={{
                                color: 'var(--color-text-secondary)',
                                fontSize: '0.9rem',
                                lineHeight: '1.4'
                              }}>
                                {subjectData.skill.careerConnection}
                              </span>
                            </div>
                          </div>

                          {/* Right Column - Role Progression Activities */}
                          <div>
                            <strong style={{
                              color: 'var(--color-primary)',
                              fontSize: '0.875rem',
                              display: 'block',
                              marginBottom: '0.5rem'
                            }}>
                              Learning Activities:
                            </strong>
                            {subjectData.roles && subjectData.roles.length > 0 ? (
                              // Display role progression content
                              subjectData.roles.map((role: any, roleIdx: number) => (
                                <div key={roleIdx} style={{ marginBottom: '1rem' }}>
                                  <div style={{
                                    color: 'var(--color-accent)',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    marginBottom: '0.25rem'
                                  }}>
                                    {role.roleName}
                                  </div>
                                  <ul style={{
                                    margin: 0,
                                    paddingLeft: '1rem',
                                    listStyleType: 'disc',
                                    marginBottom: '0.5rem'
                                  }}>
                                    {role.activities && role.activities.map((activity: string, idx: number) => (
                                      <li key={idx} style={{
                                        color: 'var(--color-text-secondary)',
                                        marginBottom: '0.375rem',
                                        fontSize: '0.9rem',
                                        lineHeight: '1.4'
                                      }}>
                                        {activity}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))
                            ) : (
                              // Fallback to simple activities list
                              <ul style={{
                                margin: 0,
                                paddingLeft: '1rem',
                                listStyleType: 'disc'
                              }}>
                                {subjectData.activities.map((activity: string, idx: number) => (
                                  <li key={idx} style={{
                                    color: 'var(--color-text-secondary)',
                                    marginBottom: '0.375rem',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.4'
                                  }}>
                                    {activity}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </ThemeAwareCard>
        )}
      </div>

    </div>
  );
};