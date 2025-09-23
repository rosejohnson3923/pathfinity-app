// ================================================================
// MAIN DASHBOARD WITH THREEPHASE INTEGRATION
// Complete student learning dashboard with grade-appropriate content
// ================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useThemeContext } from '../contexts/ModeContext';
import { useStudentProfile } from '../hooks/useStudentProfile';
// Agent system removed - to be replaced with new live chat implementation
import ThreePhaseAssignmentPlayer from './ThreePhaseAssignmentPlayer';
import ThreeContainerOrchestrator from './containers/ThreeContainerOrchestrator';
import { 
  BookOpen, 
  Calculator, 
  Beaker, 
  Zap, 
  Presentation, 
  Clock, 
  Play, 
  ArrowLeft,
  CheckCircle,
  Target,
  Sun,
  Moon,
  Settings,
  User,
  Star,
  Activity,
  Heart,
  Sparkles,
  Award,
  Smile,
  Users,
  Trophy,
  Briefcase
} from 'lucide-react';
import type { 
  StudentProfile, 
  GradeLevel, 
  SkillBasedAssignment 
} from '../services/studentProfileService';
import { AssessmentResults, MultiSubjectAssignment, SkillMasteryJourney, StudentLearningProfile } from '../types/LearningTypes';
import { getAssignmentsForGrade, getRecommendedAssignment } from '../data/multiSubjectAssignments';
import { DEMO_USER_CACHE } from '../data/demoCache/demoUserCache';
import { contentGenerationService } from '../services/contentGenerationService';
import { unifiedLearningAnalyticsService } from '../services/unifiedLearningAnalyticsService';
import { assessmentGradingService } from '../services/assessmentGradingService';

// ADAPTIVE JOURNEY SYSTEM IMPORTS
import { continuousJourneyIntegration } from '../services/ContinuousJourneyIntegration';
import { adaptiveJourneyOrchestrator } from '../services/AdaptiveJourneyOrchestrator';
import { ContinuousAssignment } from '../services/ContinuousJourneyIntegration';
import { AICharacterProvider } from './ai-characters/AICharacterProvider';
import { AICharacterSelector } from './ai-characters/AICharacterSelector';
import { AICharacterAvatar } from './ai-characters/AICharacterAvatar';
import { careerChoiceService } from '../services/careerChoiceService';
import { GamefiedCareerSelector } from './GamefiedCareerSelector';

// ================================================================
// TYPES AND INTERFACES
// ================================================================

interface Assignment {
  id: string;
  subject: string;
  title: string;
  duration: string;
  scenario: string;
  tool: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  gradeLevel?: GradeLevel;
  estimatedTimeMinutes?: number;
}

interface WelcomeProps {
  studentProfile: StudentProfile;
  assignments: SkillBasedAssignment[];
  timeOfDay: 'morning' | 'afternoon' | 'evening';
}

interface DashboardState {
  selectedCharacter: string | null;
  selectedCareer: any | null;
  showCharacterSelector: boolean;
  showCareerSelector: boolean;
  isCharacterSpeaking: boolean;
}


// ================================================================
// GRADE-SPECIFIC CONTENT GENERATION
// ================================================================

// ================================================================
// HELPER FUNCTIONS (moved up to be available for getAssignmentsFromDemoCache)
// ================================================================

const getSubjectIcon = (subject: string) => {
  const icons = {
    'Math': <Calculator className="w-6 h-6" />,
    'ELA': <BookOpen className="w-6 h-6" />,
    'Science': <Beaker className="w-6 h-6" />,
    'SocialStudies': <Presentation className="w-6 h-6" />
  };
  return icons[subject as keyof typeof icons] || <BookOpen className="w-6 h-6" />;
};

const getSubjectColor = (subject: string) => {
  const colors = {
    'Math': 'text-blue-600',
    'ELA': 'text-purple-600',
    'Science': 'text-green-600',
    'SocialStudies': 'text-orange-600'
  };
  return colors[subject as keyof typeof colors] || 'text-gray-600';
};

const getSubjectGradient = (subject: string) => {
  const gradients = {
    'Math': 'from-blue-500 to-cyan-500',
    'ELA': 'from-purple-500 to-violet-500',
    'Science': 'from-green-500 to-emerald-500',
    'SocialStudies': 'from-orange-500 to-amber-500'
  };
  return gradients[subject as keyof typeof gradients] || 'from-gray-500 to-gray-600';
};

// Get assignments from demo cache if available, otherwise use hardcoded assignments
const getAssignmentsFromDemoCache = (studentName: string): Assignment[] => {
  console.log(`🔍 Checking demo cache for student: "${studentName}"`);
  console.log(`🔍 Available demo users:`, Object.keys(DEMO_USER_CACHE));
  
  // Try exact match first
  let demoData = DEMO_USER_CACHE[studentName];
  
  // If not found, try mapping email-based names and first names to proper names
  if (!demoData) {
    const nameToFullNameMap: { [key: string]: string } = {
      // Email-based names
      'jordan.smith': 'Jordan Smith',
      'alex.davis': 'Alex Davis',
      'sam.brown': 'Sam Brown',
      'taylor.johnson': 'Taylor Johnson',
      // First names only
      'Jordan': 'Jordan Smith',
      'Alex': 'Alex Davis',
      'Sam': 'Sam Brown',
      'Taylor': 'Taylor Johnson'
    };
    
    const properName = nameToFullNameMap[studentName];
    if (properName) {
      console.log(`🔍 Mapping "${studentName}" to proper name "${properName}"`);
      demoData = DEMO_USER_CACHE[properName];
    }
  }
  
  // If still not found, try removing grade suffix (e.g., "Jordan Smith (7th Grade)" -> "Jordan Smith")
  if (!demoData && studentName.includes(' (')) {
    const nameWithoutGrade = studentName.split(' (')[0];
    console.log(`🔍 Trying without grade suffix: "${nameWithoutGrade}"`);
    demoData = DEMO_USER_CACHE[nameWithoutGrade];
  }
  
  if (!demoData) {
    console.log(`⚠️ Demo user "${studentName}" not found in cache, using hardcoded assignments`);
    return [];
  }

  console.log(`📚 Loading assignments from demo cache for ${studentName}`);
  console.log(`📚 Demo data subjects:`, demoData.subjects);
  console.log(`📚 Demo data skills:`, Object.keys(demoData.skills));
  const assignments: Assignment[] = [];

  // Use A.1 skills (actual assignments) instead of A.0 (dashboard card titles)
  for (const subject of demoData.subjects) {
    const skill = demoData.skills[subject]['A.1'];
    if (skill) {
      const assignment: Assignment = {
        id: `${subject.toLowerCase()}-${skill.skill_number}`,
        subject: subject,
        title: skill.skill_name,
        duration: `${skill.estimated_time_minutes} min`,
        scenario: `${subject.toLowerCase()}-practice`,
        tool: 'MasterToolInterface',
        icon: getSubjectIcon(subject),
        color: getSubjectColor(subject),
        bgGradient: getSubjectGradient(subject),
        description: skill.skill_description || `Learn ${subject} skills`,
        difficulty: skill.difficulty_level <= 3 ? 'Easy' : skill.difficulty_level <= 6 ? 'Medium' : 'Hard',
        gradeLevel: demoData.user.gradeLevel as GradeLevel,
        estimatedTimeMinutes: skill.estimated_time_minutes
      };
      assignments.push(assignment);
    }
  }

  console.log(`✅ Loaded ${assignments.length} assignments from demo cache:`, assignments.map(a => `${a.subject}: ${a.title}`));
  return assignments;
};

const getGradeSpecificAssignments = (gradeLevel: GradeLevel): Assignment[] => {
  const baseAssignments = {
    'Pre-K': [
      {
        id: 'counting-fun',
        subject: 'Math',
        title: 'Counting Fun with Numbers 1-5',
        duration: '10 min',
        scenario: 'counting-practice',
        tool: 'MasterToolInterface',
        icon: <Calculator className="w-6 h-6" />,
        color: 'text-blue-600',
        bgGradient: 'from-blue-400 to-cyan-400',
        description: 'Learn to count with colorful visual helpers!',
        difficulty: 'Easy' as const,
        estimatedTimeMinutes: 10
      },
      {
        id: 'letter-adventure',
        subject: 'ELA',
        title: 'Letter Recognition Adventure',
        duration: '15 min',
        scenario: 'letter-learning',
        tool: 'MasterToolInterface',
        icon: <BookOpen className="w-6 h-6" />,
        color: 'text-purple-600',
        bgGradient: 'from-purple-400 to-pink-400',
        description: 'Discover letters through fun activities!',
        difficulty: 'Easy' as const,
        estimatedTimeMinutes: 15
      },
      {
        id: 'shapes-exploration',
        subject: 'Math',
        title: 'Shape Exploration Game',
        duration: '12 min',
        scenario: 'shape-recognition',
        tool: 'MasterToolInterface',
        icon: <Star className="w-6 h-6" />,
        color: 'text-green-600',
        bgGradient: 'from-green-400 to-emerald-400',
        description: 'Find circles, squares, and triangles everywhere!',
        difficulty: 'Easy' as const,
        estimatedTimeMinutes: 12
      }
    ],
    'K': [
      {
        id: 'identify-numbers',
        subject: 'Math',
        title: 'Identify Numbers - Up to 3',
        duration: '15 min',
        scenario: 'number-recognition',
        tool: 'MasterToolInterface',
        icon: <Calculator className="w-6 h-6" />,
        color: 'text-blue-600',
        bgGradient: 'from-blue-500 to-cyan-500',
        description: 'Learn to recognize and identify numbers 1, 2, and 3',
        difficulty: 'Easy' as const,
        estimatedTimeMinutes: 15
      },
      {
        id: 'find-letters',
        subject: 'ELA',
        title: 'Find Letters in the Alphabet',
        duration: '20 min',
        scenario: 'letter-recognition',
        tool: 'MasterToolInterface',
        icon: <BookOpen className="w-6 h-6" />,
        color: 'text-purple-600',
        bgGradient: 'from-purple-500 to-violet-500',
        description: 'Recognize uppercase letters in the alphabet',
        difficulty: 'Medium' as const,
        estimatedTimeMinutes: 20
      },
      {
        id: 'shape-classification',
        subject: 'Science',
        title: 'Classify Objects by Shape',
        duration: '18 min',
        scenario: 'shape-sorting',
        tool: 'MasterToolInterface',
        icon: <Calculator className="w-6 h-6" />,
        color: 'text-green-600',
        bgGradient: 'from-green-500 to-emerald-500',
        description: 'Sort objects by their two-dimensional shapes',
        difficulty: 'Medium' as const,
        estimatedTimeMinutes: 18
      },
      {
        id: 'community-basics',
        subject: 'Social Studies',
        title: 'What is a Community?',
        duration: '15 min',
        scenario: 'community-exploration',
        tool: 'MasterToolInterface',
        icon: <Beaker className="w-6 h-6" />,
        color: 'text-orange-600',
        bgGradient: 'from-orange-500 to-amber-500',
        description: 'Learn about communities and how they work',
        difficulty: 'Easy' as const,
        estimatedTimeMinutes: 15
      }
    ],
    '3': [
      {
        id: 'multiplication-basics',
        subject: 'Math',
        title: 'Multiplication Mastery',
        duration: '25 min',
        scenario: 'multiplication-practice',
        tool: 'MasterToolInterface',
        icon: <Calculator className="w-6 h-6" />,
        color: 'text-blue-600',
        bgGradient: 'from-blue-600 to-indigo-600',
        description: 'Master multiplication tables 1-10',
        difficulty: 'Medium' as const,
        estimatedTimeMinutes: 25
      },
      {
        id: 'reading-comprehension',
        subject: 'ELA',
        title: 'Reading Comprehension Quest',
        duration: '30 min',
        scenario: 'reading-practice',
        tool: 'MasterToolInterface',
        icon: <BookOpen className="w-6 h-6" />,
        color: 'text-purple-600',
        bgGradient: 'from-purple-600 to-pink-600',
        description: 'Read stories and answer questions',
        difficulty: 'Medium' as const,
        estimatedTimeMinutes: 30
      },
      {
        id: 'plant-life-cycles',
        subject: 'Science',
        title: 'Plant Life Cycles',
        duration: '20 min',
        scenario: 'biology-exploration',
        tool: 'MasterToolInterface',
        icon: <Beaker className="w-6 h-6" />,
        color: 'text-green-600',
        bgGradient: 'from-green-600 to-emerald-600',
        description: 'Discover how plants grow and change',
        difficulty: 'Medium' as const,
        estimatedTimeMinutes: 20
      }
    ],
    '7': [
      {
        id: 'algebra-introduction',
        subject: 'Math',
        title: 'Introduction to Algebra',
        duration: '35 min',
        scenario: 'algebra-basics',
        tool: 'MasterToolInterface',
        icon: <Calculator className="w-6 h-6" />,
        color: 'text-blue-600',
        bgGradient: 'from-blue-700 to-cyan-700',
        description: 'Learn to solve equations with variables',
        difficulty: 'Hard' as const,
        estimatedTimeMinutes: 35
      },
      {
        id: 'essay-writing',
        subject: 'ELA',
        title: 'Persuasive Essay Writing',
        duration: '40 min',
        scenario: 'writing-practice',
        tool: 'MasterToolInterface',
        icon: <BookOpen className="w-6 h-6" />,
        color: 'text-purple-600',
        bgGradient: 'from-purple-700 to-violet-700',
        description: 'Write compelling persuasive essays',
        difficulty: 'Hard' as const,
        estimatedTimeMinutes: 40
      },
      {
        id: 'chemistry-basics',
        subject: 'Science',
        title: 'Chemical Reactions Lab',
        duration: '30 min',
        scenario: 'chemistry-experiment',
        tool: 'MasterToolInterface',
        icon: <Beaker className="w-6 h-6" />,
        color: 'text-green-600',
        bgGradient: 'from-green-700 to-teal-700',
        description: 'Explore how substances react with each other',
        difficulty: 'Hard' as const,
        estimatedTimeMinutes: 30
      }
    ],
    '10': [
      {
        id: 'advanced-calculus',
        subject: 'Math',
        title: 'Pre-Calculus Functions',
        duration: '45 min',
        scenario: 'advanced-math',
        tool: 'MasterToolInterface',
        icon: <Calculator className="w-6 h-6" />,
        color: 'text-blue-600',
        bgGradient: 'from-blue-800 to-indigo-800',
        description: 'Master polynomial and exponential functions',
        difficulty: 'Hard' as const,
        estimatedTimeMinutes: 45
      },
      {
        id: 'literary-analysis',
        subject: 'ELA',
        title: 'Literary Analysis Workshop',
        duration: '50 min',
        scenario: 'literature-study',
        tool: 'MasterToolInterface',
        icon: <BookOpen className="w-6 h-6" />,
        color: 'text-purple-600',
        bgGradient: 'from-purple-800 to-pink-800',
        description: 'Analyze themes and literary devices in classic works',
        difficulty: 'Hard' as const,
        estimatedTimeMinutes: 50
      },
      {
        id: 'organic-chemistry',
        subject: 'Science',
        title: 'Organic Chemistry Lab',
        duration: '40 min',
        scenario: 'advanced-chemistry',
        tool: 'MasterToolInterface',
        icon: <Beaker className="w-6 h-6" />,
        color: 'text-green-600',
        bgGradient: 'from-green-800 to-emerald-800',
        description: 'Study carbon-based molecular structures',
        difficulty: 'Hard' as const,
        estimatedTimeMinutes: 40
      },
      {
        id: 'physics-mechanics',
        subject: 'Physics',
        title: 'Classical Mechanics',
        duration: '45 min',
        scenario: 'physics-study',
        tool: 'MasterToolInterface',
        icon: <Zap className="w-6 h-6" />,
        color: 'text-yellow-600',
        bgGradient: 'from-yellow-700 to-orange-700',
        description: 'Explore motion, forces, and energy',
        difficulty: 'Hard' as const,
        estimatedTimeMinutes: 45
      }
    ]
  };

  // Normalize grade level mapping
  const normalizeGradeLevel = (grade: string): string => {
    const lowerGrade = grade.toLowerCase();
    if (lowerGrade.includes('3') || lowerGrade === '3rd' || lowerGrade === 'grade 3') return '3';
    if (lowerGrade.includes('7') || lowerGrade === '7th' || lowerGrade === 'grade 7') return '7';
    if (lowerGrade.includes('10') || lowerGrade === '10th' || lowerGrade === 'grade 10') return '10';
    if (lowerGrade.includes('k') || lowerGrade === 'kindergarten') return 'K';
    if (lowerGrade.includes('pre-k') || lowerGrade === 'pre-kindergarten') return 'Pre-K';
    return 'K'; // Default fallback
  };

  const normalizedGrade = normalizeGradeLevel(gradeLevel);
  console.log(`🎯 Grade mapping: "${gradeLevel}" → "${normalizedGrade}"`);
  
  return baseAssignments[normalizedGrade] || baseAssignments['K'];
};

// ================================================================
// PRODUCTION SERVICE INTEGRATION
// ================================================================

const getAssignmentsFromProductionServices = async (
  studentProfile: StudentProfile,
  useProductionServices: boolean = true
): Promise<Assignment[]> => {
  console.log(`🏭 Loading assignments using production services for ${studentProfile.display_name}`);
  
  // Fall back to demo cache if production services disabled
  if (!useProductionServices) {
    return getAssignmentsFromDemoCache(studentProfile.display_name);
  }

  try {
    // Track analytics event
    await unifiedLearningAnalyticsService.trackLearningEvent({
      studentId: studentProfile.user_id,
      sessionId: `session-${Date.now()}`,
      eventType: 'lesson_start',
      metadata: {
        grade: studentProfile.grade_level,
        subject: 'multi',
        skill: 'dashboard_load',
        container: 'learn'
      }
    });

    const assignments: Assignment[] = [];
    const subjects = ['Math', 'ELA', 'Science', 'SocialStudies'];
    
    // Generate personalized content for each subject
    for (const subject of subjects) {
      try {
        const contentRequest = {
          contentType: 'lesson' as const,
          grade: studentProfile.grade_level,
          subject: subject,
          skill: 'foundation',
          difficulty: 'easy' as const,
          personalizedFor: studentProfile.user_id,
          useFinnAgents: true
        };

        const generatedContent = await contentGenerationService.generateContent(contentRequest);
        
        const assignment: Assignment = {
          id: `${subject.toLowerCase()}-production-${Date.now()}`,
          subject: subject,
          title: generatedContent.title,
          duration: '15 min',
          scenario: `${subject.toLowerCase()}-practice`,
          tool: 'MasterToolInterface',
          icon: getSubjectIcon(subject),
          color: getSubjectColor(subject),
          bgGradient: getSubjectGradient(subject),
          description: generatedContent.description,
          difficulty: 'Easy',
          gradeLevel: studentProfile.grade_level as GradeLevel,
          estimatedTimeMinutes: 15
        };
        
        assignments.push(assignment);
        console.log(`✅ Generated ${subject} assignment: ${assignment.title}`);
        
      } catch (error) {
        console.warn(`⚠️ Failed to generate ${subject} content, falling back to static content:`, error);
        
        // Fallback to static content for this subject
        const fallbackAssignment: Assignment = {
          id: `${subject.toLowerCase()}-fallback`,
          subject: subject,
          title: `${subject} Fundamentals`,
          duration: '15 min',
          scenario: `${subject.toLowerCase()}-practice`,
          tool: 'MasterToolInterface',
          icon: getSubjectIcon(subject),
          color: getSubjectColor(subject),
          bgGradient: getSubjectGradient(subject),
          description: `Learn ${subject} skills at your level`,
          difficulty: 'Easy',
          gradeLevel: studentProfile.grade_level as GradeLevel,
          estimatedTimeMinutes: 15
        };
        assignments.push(fallbackAssignment);
      }
    }

    console.log(`🏭 Generated ${assignments.length} assignments using production services`);
    return assignments;
    
  } catch (error) {
    console.error('❌ Production services failed, falling back to demo cache:', error);
    return getAssignmentsFromDemoCache(studentProfile.display_name);
  }
};

// ================================================================
// GRADE-SPECIFIC MESSAGING
// ================================================================

const getGradeSpecificWelcome = (
  profile: StudentProfile, 
  timeOfDay: 'morning' | 'afternoon' | 'evening'
): { greeting: string; subtitle: string; encouragement: string } => {
  const { display_name, grade_level } = profile;
  
  const timeGreetings = {
    morning: '🌟 Good morning',
    afternoon: '☀️ Good afternoon', 
    evening: '🌙 Good evening'
  };

  const gradeContexts = {
    'Pre-K': {
      subtitle: 'Ready for Pre-K adventures?',
      encouragement: 'Let\'s explore and have fun learning together!',
      emoji: '🌈'
    },
    'K': {
      subtitle: 'Time for Kindergarten learning!',
      encouragement: 'You\'re doing amazing! Let\'s discover new things today.',
      emoji: '📚'
    },
    '1': {
      subtitle: 'Grade 1 exploration awaits!',
      encouragement: 'You\'re a fantastic learner! Ready for today\'s adventure?',
      emoji: '🚀'
    },
    '3': {
      subtitle: 'Time for 3rd grade challenges!',
      encouragement: 'You\'re growing so smart! Let\'s tackle exciting problems together.',
      emoji: '⭐'
    },
    '7': {
      subtitle: 'Ready for 7th grade exploration?',
      encouragement: 'You\'re building amazing skills! Time to dive deeper into learning.',
      emoji: '🎯'
    },
    '10': {
      subtitle: 'Time for 10th grade mastery!',
      encouragement: 'You\'re developing advanced knowledge! Let\'s excel together.',
      emoji: '🏆'
    }
  };

  const context = gradeContexts[grade_level as keyof typeof gradeContexts] || gradeContexts['K'];
  
  // Debug logging for grade mapping
  console.log(`📊 Dashboard grade mapping: '${grade_level}' -> ${context.subtitle}`);
  
  return {
    greeting: `${timeGreetings[timeOfDay]}, ${display_name}!`,
    subtitle: context.subtitle,
    encouragement: `${context.emoji} ${context.encouragement}`
  };
};

// ================================================================
// ENHANCED WELCOME COMPONENT
// ================================================================

const EnhancedWelcome: React.FC<WelcomeProps> = ({ 
  studentProfile, 
  assignments, 
  timeOfDay 
}) => {
  const welcome = getGradeSpecificWelcome(studentProfile, timeOfDay);
  const completedCount = assignments.filter(a => a.confidence > 0.9).length;
  
  return (
    <div className="text-center mb-12">
      {/* Main Greeting */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {welcome.greeting} 👋
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
          {welcome.subtitle}
        </p>
        <p className="text-lg text-blue-600 dark:text-blue-400 font-medium">
          {welcome.encouragement}
        </p>
      </div>

      {/* Grade-Specific Badge */}
      <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full shadow-lg mb-6">
        <Award className="w-5 h-5" />
        <span className="font-bold">
          {studentProfile.grade_level === 'Pre-K' 
            ? 'Pre-K Explorer' 
            : `${studentProfile.grade_level} Adventurer`}
        </span>
      </div>

      {/* Progress Overview */}
      <div className="inline-flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-full px-6 py-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-blue-500" />
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {completedCount} of {assignments.length} activities ready
          </span>
        </div>
        <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${assignments.length > 0 ? (completedCount / assignments.length) * 100 : 0}%` }}
          />
        </div>
        <Smile className="w-5 h-5 text-yellow-500" />
      </div>
    </div>
  );
};

// ================================================================
// MAIN DASHBOARD COMPONENT
// ================================================================

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();
  const { darkMode, toggleTheme } = useThemeContext();
  
  // Initialize 6-Agent System
  // Agent system state removed - to be replaced with live chat
  
  // Admin panel state
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  // Agent system initialization removed - to be replaced with live chat
  
  // Student profile integration with debugging
  console.log('🔍 StudentDashboard - User data:', { userId: user?.id, email: user?.email, role: user?.role });
  
  const { 
    profile: studentProfile, 
    loading: profileLoading, 
    error: profileError,
    displayName,
    isProfileComplete,
    createProfileForNewUser
  } = useStudentProfile(user?.id, user?.email, true); // Auto-create enabled

  // Debug profile loading
  console.log('👤 Student profile state:', { 
    studentProfile, 
    profileLoading, 
    profileError,
    displayName,
    isProfileComplete 
  });
  
  // Debug user vs profile mismatch
  if (user && studentProfile) {
    console.log('🔍 User vs Profile comparison:');
    console.log('  - Auth User ID:', user.id);
    console.log('  - Auth User Email:', user.email);
    console.log('  - Auth User Name:', user.full_name);
    console.log('  - Profile User ID:', studentProfile.user_id);
    console.log('  - Profile Display Name:', studentProfile.display_name);
    console.log('  - Profile Grade Level:', studentProfile.grade_level);
    
    if (user.id !== studentProfile.user_id) {
      console.error('❌ MISMATCH: Auth user ID does not match profile user ID!');
    }
    
    // Debug diagnostic code removed - now using proper multi-tenant testbed structure
  }
  
  // ================================================================
  // ADAPTIVE JOURNEY INITIALIZATION
  // ================================================================
  const [studentJourney, setStudentJourney] = useState(null);
  const [journeyInitialized, setJourneyInitialized] = useState(false);
  const [continuousAssignment, setContinuousAssignment] = useState<ContinuousAssignment | null>(null);
  
  // Initialize adaptive journey when student profile loads
  useEffect(() => {
    const initializeJourney = async () => {
      if (studentProfile && !journeyInitialized) {
        console.log('🚀 Initializing Adaptive Journey for', studentProfile.display_name);
        
        try {
          const journey = await continuousJourneyIntegration.initializeStudentJourney(
            studentProfile.user_id,
            studentProfile.display_name,
            studentProfile.grade_level,
            selectedCareer?.name
          );
          
          setStudentJourney(journey);
          setJourneyInitialized(true);
          
          console.log('✅ Journey Initialized:', {
            studentId: journey.studentId,
            gradeLevel: journey.gradeLevel,
            careerContext: journey.careerContext.currentCareer,
            careerLevel: journey.careerContext.currentLevel,
            totalMastered: journey.continuousProgress.totalSkillsMastered
          });
          
          // Get first continuous assignment
          const assignment = await continuousJourneyIntegration.getNextContinuousAssignment(
            studentProfile.user_id
          );
          
          if (assignment) {
            setContinuousAssignment(assignment);
            console.log('📚 First Assignment Ready:', assignment.title);
          }
        } catch (error) {
          console.error('❌ Failed to initialize journey:', error);
        }
      }
    };
    
    initializeJourney();
  }, [studentProfile, selectedCareer]);

  // Component state
  const [focusMode, setFocusMode] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);
  const [completedAssignments, setCompletedAssignments] = useState<Set<string>>(new Set());
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [finnPreparationComplete, setFinnPreparationComplete] = useState(false);
  const [correctAssignments, setCorrectAssignments] = useState<Assignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  
  // AI Character and Career state
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<any | null>(null);
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [showCareerSelector, setShowCareerSelector] = useState(false);
  const [characterMessage, setCharacterMessage] = useState<string>('');
  const [careerRecommendations, setCareerRecommendations] = useState<any[]>([]);
  
  // Load assignments using production services
  useEffect(() => {
    const loadAssignments = async () => {
      if (studentProfile?.grade_level && studentProfile?.display_name) {
        console.log('🏭 Loading assignments using production services for', studentProfile.display_name, 'grade:', studentProfile.grade_level);
        setAssignmentsLoading(true);
        
        try {
          const productionAssignments = await getAssignmentsFromProductionServices(studentProfile, true);
          setCorrectAssignments(productionAssignments);
          console.log('🏭 Production assignments loaded:', productionAssignments.map(a => a.title));
        } catch (error) {
          console.error('❌ Failed to load production assignments:', error);
          // Fallback to demo cache
          const demoAssignments = getAssignmentsFromDemoCache(studentProfile.display_name);
          if (demoAssignments.length > 0) {
            setCorrectAssignments(demoAssignments);
            console.log('🎯 Using demo cache fallback:', demoAssignments.map(a => a.title));
          } else {
            // Final fallback to hardcoded assignments
            const gradeAssignments = getGradeSpecificAssignments(studentProfile.grade_level);
            setCorrectAssignments(gradeAssignments);
            console.log('🎯 Using hardcoded fallback:', gradeAssignments.map(a => a.title));
          }
        } finally {
          setAssignmentsLoading(false);
        }
      } else {
        console.log('🎯 No student profile data available');
        setCorrectAssignments([]);
      }
    };

    loadAssignments();
  }, [studentProfile?.grade_level, studentProfile?.display_name]);
  
  // Update assignments state when correctAssignments changes
  useEffect(() => {
    if (correctAssignments.length > 0) {
      console.log('🔄 Updating assignments state with production assignments:', correctAssignments.map(a => a.title));
      setAssignments(correctAssignments);
    }
  }, [correctAssignments]);
  
  // 3-Phase Assignment state
  const [showThreePhaseAssignment, setShowThreePhaseAssignment] = useState(false);
  const [showThreeContainerJourney, setShowThreeContainerJourney] = useState(false);
  const [currentMultiSubjectAssignment, setCurrentMultiSubjectAssignment] = useState<MultiSubjectAssignment | null>(null);
  const [currentSkill, setCurrentSkill] = useState<{skillCode: string; skillName: string; subject: string} | null>(null);
  
  // Journey completion state
  const [showJourneyComplete, setShowJourneyComplete] = useState(false);
  const [journeyCompletionData, setJourneyCompletionData] = useState<{journeys: SkillMasteryJourney[], analytics: StudentLearningProfile} | null>(null);
  
  // Tool states - removed for Master Tool Interface implementation

  // ================================================================
  // EFFECTS AND PROFILE INTEGRATION
  // ================================================================

  // Agent-driven assignment analysis
  useEffect(() => {
    if (studentProfile && user) {
      console.log('📊 Profile loaded, analyzing with agent system:', studentProfile.display_name, studentProfile.grade_level);
      
      // Use FinnThink agent to analyze student context
      const analyzeStudentContext = async () => {
        try {
          // Agent analysis removed - to be replaced with live chat
          console.log('Student context:', {
            studentProfile: {
              name: studentProfile.display_name,
              grade: studentProfile.grade_level,
              learningStyle: studentProfile.learning_preferences?.learning_style || 'exploring',
              attentionSpan: studentProfile.learning_preferences?.attention_span || 'flexible'
            },
            availableAssignments: assignments.map(a => ({
              id: a.id,
              subject: a.subject,
              title: a.title,
              difficulty: a.difficulty,
              estimatedTime: a.estimatedTimeMinutes
            }))
          });
        } catch (error) {
          console.warn('⚠️ Failed to analyze student context:', error);
        }
      };
      
      analyzeStudentContext();
    }
  }, [studentProfile, user, assignments]);

  // Assignment loading is now handled by the production services useEffect above

  // Agent-driven lesson planning - Only show Subject Cards after agent analysis is complete
  useEffect(() => {
    if (studentProfile?.grade_level && !finnPreparationComplete) {
      console.log('🎯 Agents are preparing lesson plan for', studentProfile.display_name);
      
      // Use agent system to analyze and prepare personalized content
      const preparePersonalizedContent = async () => {
        try {
          // Use FinnThink for logical analysis
          // Agent lesson planning removed - to be replaced with live chat
          console.log('Lesson context:', {
            student: {
              name: studentProfile.display_name,
              grade: studentProfile.grade_level,
              learningStyle: studentProfile.learning_preferences?.learning_style || 'exploring'
            },
            assignments: assignments.length > 0 ? assignments.map(a => ({
              id: a.id,
              subject: a.subject,
              title: a.title,
              difficulty: a.difficulty
            })) : [] // Handle case where assignments haven't loaded yet
          });
          
          // Safety check with FinnSafe
          // Safety validation removed - to be replaced with live chat
          console.log('Content validation:', {
            gradeLevel: studentProfile.grade_level,
            assignments: assignments.length > 0 ? assignments.map(a => a.title) : []
          });
          
          console.log('✅ Agent preparation complete - Subject Cards can now be shown');
          
          // Add animated delay to show the agent preparation UI (minimum 7 seconds for demo users to read)
          setTimeout(() => {
            setFinnPreparationComplete(true);
          }, Math.max(7000, assignments.length > 0 ? 9000 : 7000)); // Show for at least 7 seconds, 9 if assignments loaded
        } catch (error) {
          console.warn('⚠️ Agent preparation failed, falling back to default:', error);
          // Fallback to timer-based preparation - still show the animation for demo users
          setTimeout(() => {
            setFinnPreparationComplete(true);
          }, 7000); // 7 seconds minimum time for demo users to read and appreciate the message
        }
      };
      
      preparePersonalizedContent();
    }
  }, [studentProfile?.grade_level]);

  // ================================================================
  // HELPER FUNCTIONS
  // ================================================================

  const getDifficultyFromLevel = (level: number): 'Easy' | 'Medium' | 'Hard' => {
    if (level <= 2) return 'Easy';
    if (level <= 4) return 'Medium';
    return 'Hard';
  };

  const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // ================================================================
  // TOOL LAUNCH FUNCTIONALITY
  // ================================================================

  // Convert single assignment to multi-subject assignment for Three-Container Journey
  const convertToMultiSubjectAssignment = (assignment: Assignment): MultiSubjectAssignment => {
    const baseSkill = {
      skillCode: assignment.skillCode || `${assignment.subject.substring(0,1)}.1`,
      skillName: assignment.title,
      subject: assignment.subject,
      gradeLevel: studentProfile?.grade_level || 'Kindergarten',
      difficulty: assignment.difficulty || 1
    };

    return {
      id: `converted-${assignment.id}`,
      type: 'multi-subject' as const,
      title: assignment.title,
      description: assignment.description,
      duration: `${assignment.estimatedTime} min`,
      gradeLevel: studentProfile?.grade_level || 'Kindergarten',
      careerContext: assignment.subject === 'Math' ? 'chef' : assignment.subject === 'Science' ? 'park-ranger' : 'librarian',
      priority: 'required' as const,
      skills: [baseSkill] // Single skill for focused learning
    };
  };

  const launchTool = (assignment: Assignment) => {
    console.log('🎯 LAUNCH TOOL FUNCTION CALLED for:', assignment.subject);
    console.log('🔥 PROFILE-INTEGRATED VERSION - Grade:', studentProfile?.grade_level);
    
    // Convert single assignment to multi-subject for Three-Container Journey
    const multiSubjectAssignment = convertToMultiSubjectAssignment(assignment);
    
    console.log('🎓 Launching Three-Container Journey for:', assignment.title);
    console.log('🔄 Converted assignment:', multiSubjectAssignment);
    
    // Use the same flow as "Start Your Journey" button
    setCurrentMultiSubjectAssignment(multiSubjectAssignment);
    setShowThreeContainerJourney(true);
    setFocusMode(false);
    
    // Mark assignment as completed
    setCompletedAssignments(prev => new Set([...prev, assignment.id]));
    console.log('✅ Assignment marked as completed and Three-Container Journey started');
  };

  const startGuidedJourney = () => {
    console.log('🚀 Starting guided journey for grade:', studentProfile?.grade_level);
    
    const firstIncomplete = assignments.find(a => !completedAssignments.has(a.id));
    if (firstIncomplete) {
      setCurrentAssignment(firstIncomplete);
      
      // For Kindergarten students, use 3-phase learning experience
      if (studentProfile?.grade_level === 'K' || studentProfile?.grade_level === 'Pre-K') {
        console.log('🎓 Starting guided journey with 3-phase learning for:', firstIncomplete.title);
        startThreePhaseAssignment(firstIncomplete);
      } else {
        setFocusMode(true);
        console.log('🎯 Starting guided journey with focus mode for:', firstIncomplete.subject);
      }
    }
  };

  const startThreePhaseAssignment = (assignment: Assignment) => {
    console.log('🎓 Starting 3-phase assignment for:', assignment.title);
    
    // Map assignment to skill format
    const skill = {
      skillCode: assignment.id.split('-')[0] || 'A.1',
      skillName: assignment.title,
      subject: assignment.subject
    };
    
    setCurrentSkill(skill);
    setShowThreePhaseAssignment(true);
    setFocusMode(false); // Ensure focus mode is disabled when using 3-phase
  };

  const handleThreePhaseComplete = (results: AssessmentResults) => {
    console.log('✅ 3-phase assignment completed with detailed results:', results);
    
    if (currentSkill && currentAssignment) {
      // Mark assignment as completed
      setCompletedAssignments(prev => new Set([...prev, currentAssignment.id]));
      
      // Store detailed results for future learning intelligence
      // TODO: Send to learning analytics service
      console.log('📊 Learning Data Collected:', {
        student: studentProfile?.display_name,
        skill: results.skillCode,
        score: results.score,
        attempts: results.attempts,
        timeSpent: results.timeSpent,
        context: results.context,
        struggledWith: results.struggledWith
      });
      
      // TODO: This is where we'll integrate with Experience/Discover containers
      // For now, continue with existing flow
    }
    
    // Close 3-phase assignment
    setShowThreePhaseAssignment(false);
    setCurrentSkill(null);
    setCurrentAssignment(null);
  };

  const handleThreePhaseExit = () => {
    console.log('↩️ Exiting 3-phase assignment');
    setShowThreePhaseAssignment(false);
    setCurrentSkill(null);
    setCurrentAssignment(null);
    
    // Tool states cleared - Master Tool Interface will handle this
  };

  // ================================================================
  // THREE-CONTAINER JOURNEY HANDLERS
  // ================================================================

  const launchThreeContainerJourney = (assignment: Assignment) => {
    console.log('🚀 Launching Three-Container Learning Journey:', assignment.title);
    
    // Convert regular assignment to multi-subject assignment
    const multiSubjectAssignment: MultiSubjectAssignment = {
      id: assignment.id,
      type: 'single-subject', // Most current assignments are single-subject
      title: assignment.title,
      description: assignment.description,
      duration: assignment.duration,
      gradeLevel: studentProfile?.grade_level || 'K',
      priority: 'required',
      skills: [{
        skillCode: assignment.id,
        skillName: assignment.title,
        subject: assignment.subject,
        gradeLevel: studentProfile?.grade_level || 'K',
        difficulty: assignment.difficulty === 'Easy' ? 1 : assignment.difficulty === 'Medium' ? 2 : 3
      }]
    };

    setCurrentMultiSubjectAssignment(multiSubjectAssignment);
    setShowThreeContainerJourney(true);
    setFocusMode(false);
    
    // Tool hiding handled by Master Tool Interface
  };

  const launchRecommendedMultiSubjectJourney = async () => {
    if (!studentProfile?.grade_level) return;
    
    console.log('🎯 Launching agent-driven multi-subject journey for grade:', studentProfile.grade_level);
    
    // Use agent system to get personalized recommendations
    // Agent recommendation removed - to be replaced with live chat
    if (false) {
      try {
        const recommendation = null; // await agentSystem.requestAgentAction removed
          studentProfile: {
            grade: studentProfile.grade_level,
            learningStyle: studentProfile.learning_preferences?.learning_style || 'exploring',
            name: studentProfile.display_name
          },
          availableAssignments: assignments.map(a => ({
            id: a.id,
            subject: a.subject,
            title: a.title,
            difficulty: a.difficulty
          }))
        });
        
        console.log('🤖 Agent recommendation:', recommendation);
      } catch (error) {
        console.warn('⚠️ Failed to get agent recommendation:', error);
      }
    }
    
    // Use continuous assignment from adaptive journey (NEW)
    if (continuousAssignment) {
      console.log('✅ Using Adaptive Journey Assignment:', continuousAssignment.title);
      
      // Convert continuous assignment to multi-subject format for compatibility
      const adaptiveMultiSubject: MultiSubjectAssignment = {
        id: continuousAssignment.id,
        type: 'multi-subject',
        title: continuousAssignment.title,
        description: continuousAssignment.description,
        duration: continuousAssignment.estimatedDuration,
        gradeLevel: continuousAssignment.gradeLevel,
        careerContext: continuousAssignment.careerContext,
        priority: 'required',
        skills: continuousAssignment.skills.map(skill => ({
          subject: skill.subject,
          skill_number: skill.skillNumber,
          skill_name: skill.skillName,
          gradeLevel: skill.grade,
          difficulty: continuousAssignment.adaptiveScore > 70 ? 3 : 
                     continuousAssignment.adaptiveScore > 40 ? 2 : 1
        }))
      };
      
      setCurrentMultiSubjectAssignment(adaptiveMultiSubject);
      setShowThreeContainerJourney(true);
      setFocusMode(false);
    } else {
      // Fallback to hardcoded recommendation if no journey
      console.warn('⚠️ No adaptive assignment available, using fallback');
      const recommendedAssignment = getRecommendedAssignment(studentProfile.grade_level);
      setCurrentMultiSubjectAssignment(recommendedAssignment);
      setShowThreeContainerJourney(true);
      setFocusMode(false);
    }
  };

  const handleThreeContainerComplete = async (journeys: SkillMasteryJourney[], analytics: StudentLearningProfile) => {
    console.log('🎉 Three-Container Journey completed!');
    console.log('Learning Journeys:', journeys);
    console.log('Student Analytics:', analytics);
    
    // Mark skills as completed
    if (currentMultiSubjectAssignment && studentProfile) {
      const completedSkillIds = journeys
        .filter(j => j.masteryAchieved)
        .map(j => j.skill_number); // Fixed: use skill_number instead of skillCode
      
      setCompletedAssignments(prev => new Set([...prev, currentMultiSubjectAssignment.id]));
      
      // Store analytics and show completion screen
      console.log('📊 Student Learning Profile Generated:', analytics);
      console.log('🏆 Skills Mastered:', completedSkillIds);
      
      // Update adaptive journey with completion data
      if (continuousAssignment && journeys.length > 0) {
        console.log('📈 Updating Adaptive Journey Progress...');
        
        try {
          // Process each completed skill through the journey system
          for (const journey of journeys) {
            if (journey.masteryAchieved) {
              await continuousJourneyIntegration.processSkillCompletion(
                studentProfile.user_id,
                journey.skill_number,
                {
                  score: journey.finalScore || 85,
                  timeSpent: journey.totalTime || 0,
                  attemptCount: journey.phase3_results?.attemptCount || 1,
                  struggledAreas: journey.struggledWith || [],
                  masteryLevel: journey.finalScore >= 90 ? 'Expert' : 
                               journey.finalScore >= 80 ? 'Proficient' : 
                               journey.finalScore >= 70 ? 'Developing' : 'Emerging'
                }
              );
            }
          }
          
          // Update journey statistics
          const journeyStats = await continuousJourneyIntegration.getJourneyStatistics(
            studentProfile.user_id
          );
          
          console.log('📊 Updated Journey Statistics:', journeyStats);
          
          // Get next continuous assignment
          const nextAssignment = await continuousJourneyIntegration.getNextContinuousAssignment(
            studentProfile.user_id
          );
          
          if (nextAssignment) {
            console.log('🔄 Next Adaptive Assignment Ready:', nextAssignment.title);
            setContinuousAssignment(nextAssignment);
          }
          
        } catch (error) {
          console.error('⚠️ Failed to update adaptive journey:', error);
        }
      }
      
      // Set completion data and show completion screen
      setJourneyCompletionData({ journeys, analytics });
      setShowJourneyComplete(true);
    }
    
    // Don't close journey immediately - let completion screen handle it
    setShowThreeContainerJourney(false);
  };

  const handleThreeContainerExit = () => {
    console.log('↩️ Exiting Three-Container Journey');
    setShowThreeContainerJourney(false);
    setCurrentMultiSubjectAssignment(null);
  };

  const nextAssignment = () => {
    if (!currentAssignment) return;
    
    const currentIndex = assignments.findIndex(a => a.id === currentAssignment.id);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < assignments.length) {
      const next = assignments[nextIndex];
      setCurrentAssignment(next);
      console.log('➡️ Moving to next assignment:', next.subject);
    } else {
      setFocusMode(false);
      setCurrentAssignment(null);
      console.log('🎉 All assignments completed!');
    }
  };

  // ================================================================
  // MASTER TOOL INTERFACE RENDERING
  // ================================================================

  const renderMasterToolInterface = () => {
    // Master Tool Interface will be implemented in Phase 1
    // This will replace all individual tool components with a unified interface
    return null;
  };

  // ================================================================
  // LOADING AND ERROR STATES
  // ================================================================

  if (profileLoading || assignmentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {profileLoading ? 'Loading your learning profile...' : 'Generating personalized content...'}
          </p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Target className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Profile Setup Needed</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We need to create your learning profile to get started.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            Error: {profileError}
          </p>
          <div className="space-x-4">
            <button 
              onClick={async () => {
                try {
                  if (user?.email) {
                    await createProfileForNewUser(user.email, {
                      first_name: user.full_name?.split(' ')[0] || 'Student',
                      last_name: user.full_name?.split(' ')[1] || '',
                      display_name: user.full_name?.split(' ')[0] || 'Student',
                      grade_level: 'K'
                    });
                  }
                } catch (error) {
                  console.error('Failed to create profile:', error);
                }
              }}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Create My Profile
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // 3-PHASE ASSIGNMENT VIEW (Full Screen)
  // ================================================================

  // ================================================================
  // JOURNEY COMPLETION SCREEN
  // ================================================================

  if (showJourneyComplete && journeyCompletionData) {
    const { journeys, analytics } = journeyCompletionData;
    const completedSkills = journeys.filter(j => j.masteryAchieved);
    const totalSkills = journeys.length;
    const successRate = totalSkills > 0 ? Math.round((completedSkills.length / totalSkills) * 100) : 0;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎆</div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Journey Complete!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Amazing work, {user?.full_name?.split(' ')[0] || 'Student'}! You've mastered {completedSkills.length} out of {totalSkills} skills.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{successRate}%</div>
              <div className="text-blue-700 dark:text-blue-300">Success Rate</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{completedSkills.length}</div>
              <div className="text-green-700 dark:text-green-300">Skills Mastered</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{analytics.learningPatterns.bestContext}</div>
              <div className="text-purple-700 dark:text-purple-300">Best Learning Style</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 flex items-center justify-center">
                <Star className="w-6 h-6 mr-2" />
                {analytics.xpData?.totalXP || 0}
              </div>
              <div className="text-yellow-700 dark:text-yellow-300">Total XP Earned</div>
            </div>
          </div>

          {/* Strengths */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              💪 Your Learning Strengths
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(analytics.subjectPreferences).map(([subject, prefs]: [string, any]) => (
                  <div key={subject} className="bg-white dark:bg-gray-600 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{subject}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      Best Learning Style: <span className="font-medium">{prefs.preferredContext}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Skills Mastered: <span className="font-medium">{prefs.strengthAreas?.length || 0}</span>
                    </p>
                  </div>
                ))}
                
                {/* Overall Learning Pattern */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 md:col-span-2">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">🎯 Your Best Learning Style</h4>
                  <p className="text-blue-700 dark:text-blue-300">
                    You learn best through <strong>{analytics.learningPatterns.bestContext}</strong> methods!
                    {analytics.learningPatterns.bestContext === 'abstract' && ' You excel at traditional learning approaches.'}
                    {analytics.learningPatterns.bestContext === 'applied' && ' You shine when applying skills in real-world scenarios.'}
                    {analytics.learningPatterns.bestContext === 'narrative' && ' You thrive with story-based learning adventures.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* XP Breakdown */}
          {analytics.xpData && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Star className="w-6 h-6 mr-2 text-yellow-500" />
                XP Points Breakdown
              </h3>
              
              {/* Container XP */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">XP by Learning Container</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 mr-2" />
                      {analytics.xpData.containerXP.learn}
                    </div>
                    <div className="text-purple-700 dark:text-purple-300">Learn XP</div>
                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Foundation Learning</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Star className="w-5 h-5 mr-2" />
                      {analytics.xpData.containerXP.experience}
                    </div>
                    <div className="text-blue-700 dark:text-blue-300">Experience XP</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Career Application</div>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 mr-2" />
                      {analytics.xpData.containerXP.discover}
                    </div>
                    <div className="text-emerald-700 dark:text-emerald-300">Discover XP</div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Story Mastery</div>
                  </div>
                </div>
              </div>
              
              {/* Subject XP */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">XP by Subject</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(analytics.xpData.subjectXP).map(([subject, xp]) => (
                    <div key={subject} className="bg-white dark:bg-gray-600 rounded-lg p-4 text-center">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{xp}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{subject}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setShowJourneyComplete(false);
                setJourneyCompletionData(null);
                setCurrentMultiSubjectAssignment(null);
              }}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================================================================
  // THREE-CONTAINER JOURNEY VIEW
  // ================================================================

  if (showThreeContainerJourney && currentMultiSubjectAssignment && studentProfile) {
    console.log('🎯 Dashboard: Rendering Three Container Journey');
    return (
      <AICharacterProvider>
        <ThreeContainerOrchestrator
          assignment={currentMultiSubjectAssignment}
          studentName={user?.full_name || studentProfile.display_name || 'Student'}
          gradeLevel={studentProfile.grade_level || 'K'}
          studentId={user?.id || 'demo-student'}
          onComplete={handleThreeContainerComplete}
          onExit={handleThreeContainerExit}
        />
      </AICharacterProvider>
    );
  }

  // ================================================================
  // TRADITIONAL THREE-PHASE VIEW (Legacy)
  // ================================================================

  if (showThreePhaseAssignment && currentSkill && studentProfile) {
    return (
      <AICharacterProvider>
        <ThreePhaseAssignmentPlayer
          skill={currentSkill}
          studentName={studentProfile.display_name || 'Student'}
          gradeLevel={studentProfile.grade_level || 'K'}
          onComplete={handleThreePhaseComplete}
          onExit={handleThreePhaseExit}
        />
      </AICharacterProvider>
    );
  }

  // ================================================================
  // FOCUS MODE VIEW
  // ================================================================

  if (focusMode && currentAssignment) {
    return (
      <AICharacterProvider>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-4 py-8">
            {/* Focus Mode Header with Theme Toggle */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => setFocusMode(false)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Focus Mode • Activity {assignments.findIndex(a => a.id === currentAssignment.id) + 1} of {assignments.length}
                </div>
                {/* Adaptive Theme Toggle for Focus Mode */}
              </div>
            </div>

            {/* Current Assignment Focus Card */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                <div className={`bg-gradient-to-r ${currentAssignment.bgGradient} p-8 text-white text-center`}>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
                    {currentAssignment.icon}
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{currentAssignment.subject}</h1>
                  <p className="text-xl opacity-90">{currentAssignment.title}</p>
                  {studentProfile && (
                    <p className="text-sm opacity-75 mt-2">
                      {studentProfile.grade_level} Level Activity
                    </p>
                  )}
                </div>
                
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <Clock className="w-5 h-5" />
                      <span>{currentAssignment.duration}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentAssignment.difficulty)}`}>
                      {currentAssignment.difficulty}
                    </span>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 text-lg mb-8 text-center">
                    {currentAssignment.description}
                  </p>

                  <div className="space-y-4">
                    {/* Three-Container Journey Option */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🚀 Launching Three-Container Journey!');
                        launchThreeContainerJourney(currentAssignment);
                      }}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <span>✨ Full Learning Adventure</span>
                      <span className="text-sm opacity-90">(Learn → Career → Story)</span>
                    </button>

                    {/* Traditional Single Learning Option */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🔥 Traditional learning clicked!');
                        launchTool(currentAssignment);
                      }}
                      className={`w-full bg-gradient-to-r ${currentAssignment.bgGradient} text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
                    >
                      {studentProfile?.grade_level === 'Pre-K' ? '🌟 Quick Practice' : '📚 Quick Learning'}
                    </button>

                    <button
                      onClick={nextAssignment}
                      className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {studentProfile?.grade_level === 'Pre-K' ? 'Try Something Else' : 'Skip to Next Activity'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Master Tool Interface */}
        {renderMasterToolInterface()}
      </AICharacterProvider>
    );
  }

  // ================================================================
  // MAIN DASHBOARD VIEW
  // ================================================================

  console.log('🎯 Dashboard: Rendering Main Dashboard with character selection');
  return (
    <AICharacterProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          
          {/* Header with Theme Toggle */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <User className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Welcome back</h2>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{displayName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {!isProfileComplete && (
                <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-sm">
                  Profile Incomplete
                </div>
              )}
              {/* Mode Toggle Button */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-10 h-10 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
                aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
                title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              {/* Logout Button */}
              <button
                onClick={async () => {
                  console.log('Logout button clicked!');
                  
                  // Check if the current user is a demo user
                  const demoUserEmails = [
                    'alex.davis@sandview.plainviewisd.edu',
                    'sam.brown@sandview.plainviewisd.edu',
                    'jordan.smith@oceanview.plainviewisd.edu',
                    'taylor.johnson@cityview.plainviewisd.edu',
                    'jenna.grain@sandview.plainviewisd.edu',
                    'brenda.sea@oceanview.plainviewisd.edu',
                    'john.land@cityview.plainviewisd.edu',
                    'lisa.johnson@cityview.plainviewisd.edu',
                    'principal@plainviewisd.edu',
                    'superintendent@plainviewisd.edu',
                    'sarah.davis@family.pathfinity.edu',
                    'mike.brown@family.pathfinity.edu'
                  ];

                  const demoUserNames = [
                    'Sam Brown',
                    'Alex Davis', 
                    'Jordan Smith',
                    'Taylor Johnson',
                    'Jenna Grain',
                    'Brenda Sea',
                    'John Land',
                    'Lisa Johnson',
                    'Dr. Maria Rodriguez',
                    'Dr. James Wilson',
                    'Sarah Davis',
                    'Mike Brown'
                  ];

                  const demoUserIds = [
                    '18eb6e8c-eb5b-433f-9ed0-f9599c2c7c01', // Alex Davis
                    'd472ea4d-4174-432f-a273-ea213f2ebae4', // Sam Brown
                    'e56af6a7-4eb8-4c68-b99e-2dadad0ccca3', // Jordan Smith
                    'c7518a53-36e7-459d-a41a-43d413b02230'  // Taylor Johnson
                  ];

                  console.log('🔴 DEBUG: Dashboard logout button clicked');
                  console.log('🔴 DEBUG: Current user:', user);
                  console.log('🔴 DEBUG: Current URL:', window.location.href);
                  console.log('🔴 DEBUG: Current timestamp:', new Date().toISOString());
                  
                  // Determine redirect path BEFORE signing out (while user is still available)
                  const isDemoUser = user?.email && [
                    'alex.davis@sandview.plainviewisd.edu',
                    'sam.brown@sandview.plainviewisd.edu', 
                    'jordan.smith@oceanview.plainviewisd.edu',
                    'taylor.johnson@cityview.plainviewisd.edu',
                    'jenna.grain@sandview.plainviewisd.edu',
                    'brenda.sea@oceanview.plainviewisd.edu',
                    'john.land@cityview.plainviewisd.edu',
                    'lisa.johnson@cityview.plainviewisd.edu',
                    'principal@plainviewisd.edu',
                    'superintendent@plainviewisd.edu',
                    'sarah.davis@family.pathfinity.edu',
                    'mike.brown@family.pathfinity.edu'
                  ].includes(user.email.toLowerCase());
                  
                  const redirectPath = isDemoUser ? '/demo' : '/';
                  console.log('🔴 DEBUG: About to redirect using navigate()');
                  console.log('🔴 DEBUG: Is demo user:', isDemoUser);
                  console.log('🔴 DEBUG: Redirect path:', redirectPath);
                  console.log('🔴 DEBUG: Timestamp before redirect:', new Date().toISOString());
                  
                  // Navigate FIRST before signing out to avoid race condition
                  navigate(redirectPath, { replace: true });
                  console.log('🔴 DEBUG: navigate() called with path:', redirectPath);
                  
                  // Then sign out
                  console.log('🔴 DEBUG: About to call signOut()');
                  await signOut();
                  console.log('🔴 DEBUG: signOut() completed');
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                style={{ backgroundColor: '#ef4444' }}
              >
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Enhanced Welcome Section */}
          {studentProfile && (
            <EnhancedWelcome 
              studentProfile={studentProfile}
              assignments={assignments.map(a => ({
                id: a.id,
                skillId: a.id,
                subject: a.subject,
                grade: a.gradeLevel || 'K',
                skillsArea: 'General',
                skillsCluster: 'A',
                skillNumber: '1.0',
                skillName: a.title,
                estimatedTimeMinutes: a.estimatedTimeMinutes || 15,
                recommendedTool: a.tool,
                difficultyLevel: a.difficulty === 'Easy' ? 1 : a.difficulty === 'Medium' ? 3 : 5,
                prerequisites: [],
                confidence: 0.85
              }))}
              timeOfDay={getTimeOfDay()}
            />
          )}

          {/* AI Character Section */}
          <div className="mb-8">
              {!selectedCharacter ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Users className="w-6 h-6 mr-2 text-purple-500" />
                    Choose Your AI Learning Companion
                  </h3>
                  <AICharacterSelector
                    studentGrade={studentProfile?.grade_level}
                    subject={assignments[0]?.subject}
                    onCharacterSelected={(characterId) => {
                      setSelectedCharacter(characterId);
                    }}
                    showRecommendations={true}
                  />
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
                      Your AI Companion
                    </h3>
                    <button
                      onClick={() => setSelectedCharacter(null)}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      Change Character
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <AICharacterAvatar
                      characterId={selectedCharacter}
                      size="small"
                      animated={true}
                    />
                    {characterMessage && (
                      <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                        <p className="text-sm text-purple-700 dark:text-purple-300">{characterMessage}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* Adaptive Journey Progress Section */}
          {studentProfile && continuousAssignment && (
            <div className="mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
                  Your Learning Journey
                </h3>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 rounded-full text-sm font-medium">
                  Level {Math.floor((continuousAssignment.adaptiveScore || 0) / 20) + 1}
                </span>
              </div>
              
              <div className="space-y-4">
                {/* Current Assignment */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Mission</p>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{continuousAssignment.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {continuousAssignment.skills.map(s => s.skillName).join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Difficulty</p>
                      <div className="flex items-center space-x-1 mt-1">
                        {[1, 2, 3].map(level => (
                          <Star 
                            key={level} 
                            className={`w-4 h-4 ${
                              level <= (continuousAssignment.adaptiveScore > 70 ? 3 : continuousAssignment.adaptiveScore > 40 ? 2 : 1)
                                ? 'text-yellow-500 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Journey Progress</span>
                    <span>{Math.round(continuousAssignment.adaptiveScore || 0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${continuousAssignment.adaptiveScore || 0}%` }}
                    />
                  </div>
                </div>
                
                {/* Career Context */}
                {continuousAssignment.careerContext && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Briefcase className="w-4 h-4" />
                    <span>Building skills for: {continuousAssignment.careerContext}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Career Selection Section */}
          {studentProfile && (
            <div className="mb-8">
              {!selectedCareer ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Award className="w-6 h-6 mr-2 text-green-500" />
                    Choose Your Career Path
                  </h3>
                  <GamefiedCareerSelector
                    gradeLevel={studentProfile.grade_level}
                    studentLevel={Math.floor(completedAssignments.size / 3) + 1}
                    studentXP={completedAssignments.size * 100}
                    onCareerSelect={(careerId) => {
                      setSelectedCareer({ id: careerId, name: careerId, emoji: '🎯' });
                    }}
                    showAnimations={true}
                  />
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      <Award className="w-5 h-5 mr-2 text-green-500" />
                      Your Career Path: {selectedCareer.name}
                    </h3>
                    <button
                      onClick={() => setSelectedCareer(null)}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                    >
                      Change Career
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{selectedCareer.emoji}</div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedCareer.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedCareer.skills?.map((skill: string) => (
                          <span key={skill} className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300 rounded-md text-xs font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Agent Preparation Phase - Show until agent analysis is complete */}
          {!finnPreparationComplete && studentProfile && (
            <div className="text-center mb-12 animate-fade-in">
              <div className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl p-8 max-w-lg mx-auto border border-purple-100 dark:border-purple-800 animate-pulse-slow">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow shadow-lg">
                    <Users className="w-10 h-10 text-white animate-pulse" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3 animate-fade-in-up">
                    Finn's agents are preparing your personalized lesson plan...
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                    6 specialized agents are analyzing your learning style and creating the perfect activities for <span className="font-semibold text-purple-600 dark:text-purple-400">{studentProfile.display_name}</span>
                  </p>
                  
                  {/* Enhanced animated dots with pulsing effect */}
                  <div className="flex justify-center space-x-3 mb-6">
                    <div className="animate-spin rounded-full h-4 w-4 bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg animate-pulse"></div>
                    <div className="animate-spin rounded-full h-4 w-4 bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="animate-spin rounded-full h-4 w-4 bg-gradient-to-r from-green-500 to-green-600 shadow-lg animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    <div className="animate-spin rounded-full h-4 w-4 bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg animate-pulse" style={{animationDelay: '0.6s'}}></div>
                    <div className="animate-spin rounded-full h-4 w-4 bg-gradient-to-r from-red-500 to-red-600 shadow-lg animate-pulse" style={{animationDelay: '0.8s'}}></div>
                    <div className="animate-spin rounded-full h-4 w-4 bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-lg animate-pulse" style={{animationDelay: '1.0s'}}></div>
                  </div>
                  
                  {/* Agent names with staggered animations */}
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-4">
                    <div className="flex justify-center flex-wrap gap-2 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded-full text-purple-700 dark:text-purple-300 font-medium">FinnSee</span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-700 dark:text-blue-300 font-medium">FinnSpeak</span>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 rounded-full text-green-700 dark:text-green-300 font-medium">FinnThink</span>
                    </div>
                    <div className="flex justify-center flex-wrap gap-2 animate-fade-in-up" style={{animationDelay: '0.7s'}}>
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 rounded-full text-yellow-700 dark:text-yellow-300 font-medium">FinnTool</span>
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900 rounded-full text-red-700 dark:text-red-300 font-medium">FinnSafe</span>
                      <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 rounded-full text-indigo-700 dark:text-indigo-300 font-medium">FinnView</span>
                    </div>
                  </div>
                  
                  {/* Dynamic status text with typewriter effect */}
                  <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse font-medium">
                    <span className="inline-block animate-bounce" style={{animationDelay: '0s'}}>🔍</span>
                    <span className="ml-2">Analyzing learning style, curating content, ensuring safety</span>
                    <span className="inline-block animate-bounce" style={{animationDelay: '0.5s'}}>.</span>
                    <span className="inline-block animate-bounce" style={{animationDelay: '0.7s'}}>.</span>
                    <span className="inline-block animate-bounce" style={{animationDelay: '0.9s'}}>.</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Show Start Adventure Button and Subject Cards only after agent preparation is complete */}
          {finnPreparationComplete && (
            <>
              {/* Start Adventure Button - Three-Container Journey */}
              <div className="text-center mb-12">
                <button
                  onClick={launchRecommendedMultiSubjectJourney}
                  className="inline-flex items-center space-x-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xl font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                >
                  <Sparkles className="w-6 h-6" />
                  <span>Start Adventure</span>
                  <span className="text-sm opacity-90 font-normal">(Learn → Career → Story)</span>
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Let Finn's 6 specialized agents guide you through your personalized learning journey
                </p>
              </div>

              {/* Learning Topics Overview - Agent-Curated Content */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Today's Learning Topics</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Here's what you'll explore with Finn's specialized agents! Use the "Start Your Journey" button above to begin your personalized learning adventure.
                </p>
                {false && ( // Agent system removed
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>FinnSee (Visual)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>FinnThink (Logic)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>FinnTool (Tools)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>FinnSafe (Safety)</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {console.log('🎯 RENDERING correctAssignments:', correctAssignments.map(a => a.title))}
                {correctAssignments.map((assignment) => {
                  const isCompleted = completedAssignments.has(assignment.id);
                  
                  return (
                    <div
                      key={assignment.id}
                      className={`bg-white dark:bg-gray-800 rounded-xl shadow-md transition-all duration-300 overflow-hidden ${isCompleted ? 'ring-2 ring-green-500' : ''}`}
                    >
                      {/* Card Header */}
                      <div className={`bg-gradient-to-r ${assignment.bgGradient} p-3 text-white relative`}>
                        {isCompleted && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className="text-center">
                          <div className="p-1 bg-white bg-opacity-20 rounded-lg inline-block mb-2">
                            {React.cloneElement(assignment.icon, { className: "w-4 h-4" })}
                          </div>
                          <h3 className="font-bold text-sm">{assignment.subject}</h3>
                          <div className="flex items-center justify-center space-x-1 text-xs opacity-90 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>{assignment.duration}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                          {assignment.title}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-xs mb-3 line-clamp-2">
                          {assignment.description}
                        </p>
                        
                        <div className="flex items-center justify-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(assignment.difficulty)}`}>
                            {assignment.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Agent Integration Status - Only show after agent preparation is complete */}
          {studentProfile && finnPreparationComplete && (
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-8">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center space-x-2">
                <Heart className="w-5 h-5" />
                <span>Personalized by Finn's Agents for {studentProfile.display_name}</span>
              </h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <p>• Grade Level: {studentProfile.grade_level}</p>
                <p>• Learning Style: {studentProfile.learning_preferences?.learning_style || 'Exploring'}</p>
                <p>• Attention Span: {studentProfile.learning_preferences?.attention_span || 'Flexible'}</p>
                <p>• Activities designed for {studentProfile.grade_level === 'Pre-K' ? 'Pre-K explorers' : 'young learners'}</p>
                <p>• Analyzed by 6 specialized agents for optimal learning</p>
              </div>
            </div>
          )}
          
          {/* Admin Panel Toggle - Only show for non-student users 
              Valid roles: student, parent, school_admin, district_admin, product_admin 
              Students should NOT see this button */}
          {false && user && user.role && user.role !== 'student' && ( // Agent monitoring removed
            <div className="fixed bottom-4 right-4">
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="flex items-center space-x-2 bg-gray-800 dark:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 dark:hover:bg-gray-500 transition-colors"
                title="Agent Status Monitor"
              >
                <Activity className="w-5 h-5" />
                <span>Admin ({user.role})</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Admin Panel Overlay */}
      {showAdminPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-full max-h-full overflow-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Agent Status Monitor</h2>
              <button
                onClick={() => setShowAdminPanel(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {/* AgentStatusMonitor removed - to be replaced with live chat */}
            </div>
          </div>
        </div>
      )}

      {/* Master Tool Interface */}
      {renderMasterToolInterface()}
    </AICharacterProvider>
  );
};

export default Dashboard;