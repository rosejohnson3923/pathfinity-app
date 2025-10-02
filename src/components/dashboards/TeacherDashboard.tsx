import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../Header';
import { FeatureAvailability } from '../subscription/FeatureAvailability';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuthContext } from '../../contexts/AuthContext';
import { getRoleLabels, type EducatorData, type StudentChildData } from '../../types/RelationshipTypes';
import { DailyLessonPlanPage } from './DailyLessonPlanPage';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Bell, 
  BarChart2, 
  FileText, 
  CheckSquare, 
  MessageSquare,
  Clock,
  Star,
  TrendingUp,
  Award,
  Target,
  Activity,
  BookOpenCheck,
  Zap,
  Trophy,
  Sparkles
} from 'lucide-react';

// Unified educator data - works for both teachers and parents
const createEducatorData = (user: any): EducatorData => {
  const isParent = user?.role === 'parent';
  const labels = getRoleLabels(isParent ? 'parent' : 'educator');
  
  // Check if this is a micro school teacher and show appropriate students
  const isMicroSchool = user?.email?.includes('newfrontier.pathfinity.edu');

  const studentsChildren: StudentChildData[] = isMicroSchool ? [
    // Micro school students for Samantha Johnson
    {
      id: 'zara-jones',
      name: 'Zara Jones',
      grade: 'K',
      last_activity: '2025-07-14',
      total_xp: 1300,
      containers_completed: 3,
      avg_accuracy: 92,
      learning_streak: 7,
      current_container: 'Complete',
      subjects_mastered: ['Math', 'ELA', 'Science', 'Social Studies'],
      time_spent_minutes: 195,
      badges_earned: 14,
      preferred_session_time: 'Morning',
      engagement_level: 'High'
    },
    {
      id: 'alexis-martin',
      name: 'Alexis Martin',
      grade: '1',
      last_activity: '2025-07-14',
      total_xp: 1250,
      containers_completed: 3,
      avg_accuracy: 89,
      learning_streak: 6,
      current_container: 'Complete',
      subjects_mastered: ['Math', 'ELA', 'Science', 'Social Studies'],
      time_spent_minutes: 185,
      badges_earned: 13,
      preferred_session_time: 'Afternoon',
      engagement_level: 'High'
    },
    {
      id: 'david-brown',
      name: 'David Brown',
      grade: '7',
      last_activity: '2025-07-14',
      total_xp: 2100,
      containers_completed: 4,
      avg_accuracy: 91,
      learning_streak: 8,
      current_container: 'Complete',
      subjects_mastered: ['Math', 'ELA', 'Science', 'Social Studies'],
      time_spent_minutes: 220,
      badges_earned: 18,
      preferred_session_time: 'Evening',
      engagement_level: 'High'
    },
    {
      id: 'mike-johnson',
      name: 'Mike Johnson',
      grade: '10',
      last_activity: '2025-07-14',
      total_xp: 2350,
      containers_completed: 4,
      avg_accuracy: 87,
      learning_streak: 5,
      current_container: 'Complete',
      subjects_mastered: ['Math', 'ELA', 'Science', 'Social Studies'],
      time_spent_minutes: 240,
      badges_earned: 20,
      preferred_session_time: 'Evening',
      engagement_level: 'High'
    }
  ] : [
    // Public school students for other teachers
    {
      id: 'sam-brown',
      name: 'Sam Brown',
      grade: 'K',
      last_activity: '2025-07-14',
      total_xp: 1200,
      containers_completed: 3,
      avg_accuracy: 88,
      learning_streak: 5,
      current_container: 'Complete',
      subjects_mastered: ['Math', 'ELA', 'Science', 'Social Studies'],
      time_spent_minutes: 180,
      badges_earned: 12,
      preferred_session_time: 'Morning',
      engagement_level: 'High'
    },
    {
      id: 'alex-davis',
      name: 'Alex Davis',
      grade: '1',
      last_activity: '2025-07-14',
      total_xp: 1120,
      containers_completed: 3,
      avg_accuracy: 82,
      learning_streak: 3,
      current_container: 'Complete',
      subjects_mastered: ['Math', 'ELA', 'Science', 'Social Studies'],
      time_spent_minutes: 165,
      badges_earned: 10,
      preferred_session_time: 'Afternoon',
      engagement_level: 'Medium-High'
    }
  ];

  return {
    id: user?.id || 'educator-1',
    name: user?.full_name || 'Ms. Jenna Grain',
    email: user?.email || 'jenna.grain@sandview.plainviewisd.edu',
    role: isParent ? 'parent' : 'educator',
    school: isParent ? 'Davis Family School' : (user?.email?.includes('newfrontier.pathfinity.edu') ? 'New Frontier Micro School' : 'Sand View Elementary School'),
    district: isParent ? undefined : (user?.email?.includes('newfrontier.pathfinity.edu') ? 'New Frontier Educational Network' : 'Plainview ISD'),
    tenant_ids: user?.tenant_ids || [user?.email?.includes('newfrontier.pathfinity.edu') ? 'new-frontier-micro-school-001' : 'sand-view-elementary-school-001'],
    students_children: studentsChildren,
    dashboard_preferences: {
      primary_tab_label: labels.primary_tab_label,
      secondary_tab_label: labels.secondary_tab_label,
      relationship_term: labels.relationship_term,
      possessive_term: labels.possessive_term
    }
  };
};

// Subject Portlet Component
interface SubjectPortletProps {
  subject: string;
  icon: string;
  color: string;
  students: any[];
  learnXP: number[];
  experienceXP: number[];
  discoverXP: number[];
  topics: string[];
  careerFocus: string;
}

const SubjectPortlet: React.FC<SubjectPortletProps> = ({ 
  subject, 
  icon, 
  color, 
  students, 
  learnXP, 
  experienceXP, 
  discoverXP, 
  topics, 
  careerFocus 
}) => {
  const [activeView, setActiveView] = useState('overview');
  
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-700',
      text: 'text-blue-900 dark:text-blue-200',
      accent: 'text-blue-600 dark:text-blue-400',
      button: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-700',
      text: 'text-emerald-900 dark:text-emerald-200',
      accent: 'text-emerald-600 dark:text-emerald-400',
      button: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-700',
      text: 'text-purple-900 dark:text-purple-200',
      accent: 'text-purple-600 dark:text-purple-400',
      button: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-700',
      text: 'text-amber-900 dark:text-amber-200',
      accent: 'text-amber-600 dark:text-amber-400',
      button: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
    }
  };
  
  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;
  
  return (
    <div className={`${colors.bg} rounded-xl border-2 ${colors.border} overflow-hidden`}>
      {/* Portlet Header */}
      <div style={{
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-bg-elevated)',
        borderBottom: '1px solid var(--color-border)'
      }}>
        {/* Subject Title - Line 1 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 'var(--space-3)'
        }}>
          <span style={{
            fontSize: 'var(--text-2xl)',
            marginRight: 'var(--space-2)'
          }}>{icon}</span>
          <h3 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-text-primary)',
            margin: 0
          }}>
            {subject}
          </h3>
        </div>

        {/* Navigation Buttons - Line 2 */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-2)'
        }}>
          <button
            onClick={() => setActiveView('overview')}
            style={{
              padding: 'var(--space-1) var(--space-3)',
              fontSize: 'var(--text-xs)',
              borderRadius: 'var(--space-1)',
              border: 'none',
              backgroundColor: activeView === 'overview' ? 'var(--blue-100)' : 'transparent',
              color: activeView === 'overview' ? 'var(--blue-800)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontWeight: 'var(--font-medium)'
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView('assignments')}
            style={{
              padding: 'var(--space-1) var(--space-3)',
              fontSize: 'var(--text-xs)',
              borderRadius: 'var(--space-1)',
              border: 'none',
              backgroundColor: activeView === 'assignments' ? 'var(--blue-100)' : 'transparent',
              color: activeView === 'assignments' ? 'var(--blue-800)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontWeight: 'var(--font-medium)'
            }}
          >
            Progress
          </button>
          <button
            onClick={() => setActiveView('students')}
            style={{
              padding: 'var(--space-1) var(--space-3)',
              fontSize: 'var(--text-xs)',
              borderRadius: 'var(--space-1)',
              border: 'none',
              backgroundColor: activeView === 'students' ? 'var(--blue-100)' : 'transparent',
              color: activeView === 'students' ? 'var(--blue-800)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontWeight: 'var(--font-medium)'
            }}
          >
            Students
          </button>
        </div>
      </div>
      
      {/* Portlet Content */}
      <div className="p-4">
        {activeView === 'overview' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className={`text-xs ${colors.accent}`}>Learn</p>
                <p className={`font-bold ${colors.text}`}>{Math.round((learnXP[0] + learnXP[1]) / 2)} XP</p>
              </div>
              <div>
                <p className={`text-xs ${colors.accent}`}>Experience</p>
                <p className={`font-bold ${colors.text}`}>{Math.round((experienceXP[0] + experienceXP[1]) / 2)} XP</p>
              </div>
              <div>
                <p className={`text-xs ${colors.accent}`}>Discover</p>
                <p className={`font-bold ${colors.text}`}>{Math.round((discoverXP[0] + discoverXP[1]) / 2)} XP</p>
              </div>
            </div>
            <div className={`text-xs ${colors.accent}`}>
              <p><strong>Focus:</strong> {careerFocus}</p>
            </div>
          </div>
        )}
        
        {activeView === 'assignments' && (
          <div className="space-y-2">
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className={colors.accent}>📘 Learn Phase:</span>
                <span className={`font-semibold ${colors.text}`}>100% Complete</span>
              </div>
              <div className="flex justify-between">
                <span className={colors.accent}>🎯 Experience Phase:</span>
                <span className={`font-semibold ${colors.text}`}>100% Complete</span>
              </div>
              <div className="flex justify-between">
                <span className={colors.accent}>⚡ Discover Phase:</span>
                <span className={`font-semibold ${colors.text}`}>100% Complete</span>
              </div>
            </div>
            <div className={`text-xs ${colors.accent} pt-2 border-t ${colors.border}`}>
              <p><strong>Current Topics:</strong></p>
              <ul className="ml-2">
                {topics.map((topic, idx) => (
                  <li key={idx}>• {topic}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {activeView === 'students' && (
          <div className="space-y-2">
            {students.map((student, idx) => (
              <div key={student.id} className="flex justify-between items-center text-xs">
                <span className={`font-medium ${colors.text}`}>{student.name}</span>
                <div className="text-right">
                  <div className={`font-bold ${colors.text}`}>
                    {(learnXP[idx] + experienceXP[idx] + discoverXP[idx])} XP
                  </div>
                  <div className={colors.accent}>{student.avg_accuracy}% avg</div>
                </div>
              </div>
            ))}
            <div className={`text-xs ${colors.accent} pt-2 border-t ${colors.border}`}>
              Total Subject XP: {students.reduce((sum, _, idx) => 
                sum + learnXP[idx] + experienceXP[idx] + discoverXP[idx], 0
              ).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export function TeacherDashboard() {
  const { tier } = useSubscription();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [educatorData] = useState(() => createEducatorData(user));
  const [activeTab, setActiveTab] = useState('lesson-plans');
  
  // Dynamic labels from unified structure
  const { dashboard_preferences } = educatorData;
  const dashboardLabel = dashboard_preferences.primary_tab_label;
  const studentLabel = dashboard_preferences.secondary_tab_label;
  const relationshipTerm = dashboard_preferences.relationship_term;
  const possessiveTerm = dashboard_preferences.possessive_term;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header showBackButton={false} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user?.full_name || 'User'}'s Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {educatorData.role === 'parent'
                ? `Monitor ${possessiveTerm} AI-guided learning progress and achievements` 
                : `Monitor AI-guided learning, track ${relationshipTerm} progress, and set learning objectives`
              }
            </p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => navigate('/app/custom-paths')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Custom Path</span>
            </button>
            <button className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Generate Reports
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('lesson-plans')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'lesson-plans'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                📚 Lesson Plans
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {dashboardLabel}
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'students'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {studentLabel} ({educatorData.students_children.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Dashboard Content */}
        {/* Lesson Plans Tab */}
        {activeTab === 'lesson-plans' && (
          <div className="space-y-6">
            {/* Embedded Daily Lesson Plan Page */}
            <DailyLessonPlanPage embedded={true} />
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Subject Navigation */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Subject Areas</h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Click any portlet to explore detailed analytics
                </div>
              </div>
            </div>
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">Welcome back, {educatorData.name}!</h2>
                <p className="text-blue-100">
                  {educatorData.school}{educatorData.district && ` • ${educatorData.district}`}
                </p>
                <p className="text-blue-200 text-sm mt-1">
                  {educatorData.role === 'parent' 
                    ? `Managing ${possessiveTerm} learning journey`
                    : `Teaching ${educatorData.students_children.length} ${relationshipTerm}`
                  }
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-100">Today's Date</p>
                <p className="text-lg font-semibold">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Show feature availability notice for advanced analytics if on basic tier */}
          {tier === 'basic' && (
            <FeatureAvailability
              featureId="advanced_analytics"
              currentTier={tier}
            />
          )}

          {/* Subject Portlets Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Math Portlet */}
            <SubjectPortlet 
              subject="Math"
              icon="📊"
              color="blue"
              students={educatorData.students_children}
              learnXP={[75, 55]}
              experienceXP={[85, 85]}
              discoverXP={[140, 140]}
              topics={['Number recognition (Alex)', 'Basic arithmetic (Sam)']}
              careerFocus="Chef - Cooking measurements & calculations"
            />
            
            {/* ELA Portlet */}
            <SubjectPortlet 
              subject="ELA"
              icon="📚"
              color="emerald"
              students={educatorData.students_children}
              learnXP={[75, 55]}
              experienceXP={[85, 85]}
              discoverXP={[140, 140]}
              topics={['Letter recognition (Alex)', 'Reading fluency (Sam)']}
              careerFocus="Librarian - Information literacy & organization"
            />
            
            {/* Science Portlet */}
            <SubjectPortlet 
              subject="Science"
              icon="🔬"
              color="purple"
              students={educatorData.students_children}
              learnXP={[75, 55]}
              experienceXP={[85, 85]}
              discoverXP={[140, 140]}
              topics={['Nature observation (Alex)', 'Scientific method (Sam)']}
              careerFocus="Park Ranger - Environmental science & conservation"
            />
            
            {/* Social Studies Portlet */}
            <SubjectPortlet 
              subject="Social Studies"
              icon="🌍"
              color="amber"
              students={educatorData.students_children}
              learnXP={[75, 55]}
              experienceXP={[85, 85]}
              discoverXP={[140, 140]}
              topics={['Family & friends (Alex)', 'Community helpers (Sam)']}
              careerFocus="Community roles & civic engagement"
            />
          </div>

          {/* Three-Phase Learning Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Three-Phase Learning Journey Summary</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Progressive mastery through Learn → Experience → Discover</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-3">
                    <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <h4 className="font-bold text-blue-900 dark:text-blue-200">Learn Phase</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Foundation Building</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-200 mt-2">65 XP avg</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg mb-3">
                    <Target className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-200">Experience Phase</h4>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">Career Application</p>
                    <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mt-2">85 XP avg</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg mb-3">
                    <Activity className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <h4 className="font-bold text-purple-900 dark:text-purple-200">Discover Phase</h4>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Creative Mastery</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-200 mt-2">140 XP avg</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total {relationshipTerm}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{educatorData.students_children.length}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex items-center space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <BookOpenCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Complete Journeys</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {educatorData.students_children.filter(s => s.containers_completed === 3).length}
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex items-center space-x-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total XP Earned</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {educatorData.students_children.reduce((sum, s) => sum + s.total_xp, 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Learning Streaks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(educatorData.students_children.reduce((sum, s) => sum + s.learning_streak, 0) / educatorData.students_children.length)} days
                </p>
              </div>
            </div>
          </div>


          {/* Learning Analytics - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Learning Time Allocation */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Learning Time Allocation</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  AI-guided learning hours across subjects {educatorData.role === 'parent' ? 'for your children' : 'for your students'}
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Math</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Both {relationshipTerm} active</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">95 min</p>
                    <p className="text-xs text-green-600 dark:text-green-400">This week</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">ELA</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Reading & writing focus</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">78 min</p>
                    <p className="text-xs text-green-600 dark:text-green-400">This week</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Science</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Discovery-based learning</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">62 min</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">This week</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <Users className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Social Studies</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Community & culture</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">48 min</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">This week</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Learning Time:</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">283 min</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    AI optimizes timing based on {educatorData.role === 'parent' ? 'child' : 'student'} engagement
                  </p>
                </div>
              </div>
            </div>

            {/* Learning Phase Allocation */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Learning Phase Allocation</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Three-Phase Learning progression breakdown across Learn → Experience → Discover
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Learn Phase</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Foundation building & instruction</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">98 min</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">This week</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                      <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Experience Phase</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Career application & practice</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">112 min</p>
                    <p className="text-xs text-green-600 dark:text-green-400">This week</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Discover Phase</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Creative mastery & storytelling</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">73 min</p>
                    <p className="text-xs text-green-600 dark:text-green-400">This week</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Phase Time:</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">283 min</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Progressive mastery through the Three-Phase Learning journey
                  </p>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Student Dashboard Tab */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Student Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {educatorData.students_children.map((student) => (
                <div key={student.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                  <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                          student.engagement_level === 'High' ? 'bg-green-500' : 'bg-blue-500'
                        }`}>
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{student.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Grade {student.grade}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Last active: {student.last_activity}</p>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{student.engagement_level}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total XP</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.total_xp.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Target className="h-4 w-4 text-blue-500 mr-1" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Accuracy</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{student.avg_accuracy}%</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Zap className="h-4 w-4 text-orange-500 mr-1" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Streak</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{student.learning_streak} days</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Trophy className="h-4 w-4 text-purple-500 mr-1" />
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Badges</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{student.badges_earned}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Learning Journey Progress</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Status: <span className="font-medium text-green-600 dark:text-green-400">{student.current_container}</span>
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Subjects: {student.subjects_mastered.join(', ')}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Time spent: {student.time_spent_minutes}min</span>
                      <span className="text-gray-500 dark:text-gray-400">Prefers: {student.preferred_session_time}</span>
                    </div>

                    {/* Enhanced Student Analytics */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Subject Performance</h4>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="text-center">
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                            <p className="font-semibold text-blue-900 dark:text-blue-200">Math</p>
                            <p className="text-blue-600 dark:text-blue-400">300 XP</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded p-2">
                            <p className="font-semibold text-emerald-900 dark:text-emerald-200">ELA</p>
                            <p className="text-emerald-600 dark:text-emerald-400">300 XP</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2">
                            <p className="font-semibold text-purple-900 dark:text-purple-200">Science</p>
                            <p className="text-purple-600 dark:text-purple-400">300 XP</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="bg-amber-50 dark:bg-amber-900/20 rounded p-2">
                            <p className="font-semibold text-amber-900 dark:text-amber-200">Social St.</p>
                            <p className="text-amber-600 dark:text-amber-400">300 XP</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Analytics Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Detailed {educatorData.role === 'parent' ? 'Child' : 'Student'} Analytics
              </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Deep-dive insights into individual {educatorData.role === 'parent' ? 'child' : 'student'} performance
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                      <h4 className="font-bold text-blue-900 dark:text-blue-200">Engagement Trends</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Weekly activity patterns</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-200 mt-2">↗️ +15%</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <TrendingUp className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                      <h4 className="font-bold text-emerald-900 dark:text-emerald-200">Learning Velocity</h4>
                      <p className="text-sm text-emerald-700 dark:text-emerald-300">Skills mastered per week</p>
                      <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-200 mt-2">2.3 avg</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <BarChart2 className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                      <h4 className="font-bold text-purple-900 dark:text-purple-200">Challenge Level</h4>
                      <p className="text-sm text-purple-700 dark:text-purple-300">Optimal difficulty balance</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-200 mt-2">85% match</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}