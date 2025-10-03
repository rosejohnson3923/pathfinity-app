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

// Design System Imports
import '../../design-system/tokens/colors.css';
import '../../design-system/tokens/spacing.css';
import '../../design-system/tokens/borders.css';
import '../../design-system/tokens/effects.css';
import '../../design-system/tokens/typography.css';
import '../../design-system/tokens/shadows.css';
import '../../design-system/tokens/dashboard.css';

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

  // Map subject to design system tokens
  const getSubjectClass = (subject: string) => {
    const subjectMap = {
      'Math': 'math',
      'ELA': 'ela',
      'Science': 'science',
      'Social Studies': 'social'
    };
    return subjectMap[subject as keyof typeof subjectMap] || 'math';
  };

  const subjectKey = getSubjectClass(subject);
  
  return (
    <div
      style={{
        backgroundColor: `var(--dashboard-subject-${subjectKey})`,
        borderColor: `var(--dashboard-subject-${subjectKey}-border)`,
        borderRadius: 'var(--radius-xl)',
        border: '2px solid',
        overflow: 'hidden',
        boxShadow: 'var(--dashboard-shadow-portlet)',
        transition: 'box-shadow 300ms ease, transform 300ms ease'
      }}
    >
      {/* Portlet Header */}
      <div style={{
        padding: 'var(--space-4)',
        backgroundColor: 'var(--dashboard-bg-elevated)',
        borderBottom: '2px solid var(--dashboard-border)'
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
            color: 'var(--dashboard-text-primary)',
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
              backgroundColor: activeView === 'overview' ? `var(--dashboard-subject-${subjectKey}-accent)` : 'transparent',
              color: activeView === 'overview' ? '#ffffff' : 'var(--dashboard-text-secondary)',
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
              backgroundColor: activeView === 'assignments' ? `var(--dashboard-subject-${subjectKey}-accent)` : 'transparent',
              color: activeView === 'assignments' ? '#ffffff' : 'var(--dashboard-text-secondary)',
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
              backgroundColor: activeView === 'students' ? `var(--dashboard-subject-${subjectKey}-accent)` : 'transparent',
              color: activeView === 'students' ? '#ffffff' : 'var(--dashboard-text-secondary)',
              cursor: 'pointer',
              fontWeight: 'var(--font-medium)'
            }}
          >
            Students
          </button>
        </div>
      </div>
      
      {/* Portlet Content */}
      <div style={{ padding: 'var(--space-4)' }}>
        {activeView === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)', textAlign: 'center' }}>
              <div>
                <p style={{ fontSize: 'var(--text-xs)', color: `var(--dashboard-subject-${subjectKey}-accent)` }}>Learn</p>
                <p style={{ fontWeight: 'var(--font-bold)', color: `var(--dashboard-subject-${subjectKey}-text)` }}>{Math.round((learnXP[0] + learnXP[1]) / 2)} XP</p>
              </div>
              <div>
                <p style={{ fontSize: 'var(--text-xs)', color: `var(--dashboard-subject-${subjectKey}-accent)` }}>Experience</p>
                <p style={{ fontWeight: 'var(--font-bold)', color: `var(--dashboard-subject-${subjectKey}-text)` }}>{Math.round((experienceXP[0] + experienceXP[1]) / 2)} XP</p>
              </div>
              <div>
                <p style={{ fontSize: 'var(--text-xs)', color: `var(--dashboard-subject-${subjectKey}-accent)` }}>Discover</p>
                <p style={{ fontWeight: 'var(--font-bold)', color: `var(--dashboard-subject-${subjectKey}-text)` }}>{Math.round((discoverXP[0] + discoverXP[1]) / 2)} XP</p>
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: `var(--dashboard-subject-${subjectKey}-accent)` }}>
              <p><strong>Focus:</strong> {careerFocus}</p>
            </div>
          </div>
        )}
        
        {activeView === 'assignments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div style={{ fontSize: 'var(--text-xs)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: `var(--dashboard-subject-${subjectKey}-accent)` }}>📘 Learn Phase:</span>
                <span style={{ fontWeight: 'var(--font-semibold)', color: `var(--dashboard-subject-${subjectKey}-text)` }}>100% Complete</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: `var(--dashboard-subject-${subjectKey}-accent)` }}>🎯 Experience Phase:</span>
                <span style={{ fontWeight: 'var(--font-semibold)', color: `var(--dashboard-subject-${subjectKey}-text)` }}>100% Complete</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: `var(--dashboard-subject-${subjectKey}-accent)` }}>⚡ Discover Phase:</span>
                <span style={{ fontWeight: 'var(--font-semibold)', color: `var(--dashboard-subject-${subjectKey}-text)` }}>100% Complete</span>
              </div>
            </div>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: `var(--dashboard-subject-${subjectKey}-accent)`,
              paddingTop: 'var(--space-2)',
              borderTop: `1px solid var(--dashboard-subject-${subjectKey}-border)`
            }}>
              <p><strong>Current Topics:</strong></p>
              <ul style={{ marginLeft: 'var(--space-2)' }}>
                {topics.map((topic, idx) => (
                  <li key={idx}>• {topic}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {activeView === 'students' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {students.map((student, idx) => (
              <div key={student.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-xs)' }}>
                <span style={{ fontWeight: 'var(--font-medium)', color: `var(--dashboard-subject-${subjectKey}-text)` }}>{student.name}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'var(--font-bold)', color: `var(--dashboard-subject-${subjectKey}-text)` }}>
                    {(learnXP[idx] + experienceXP[idx] + discoverXP[idx])} XP
                  </div>
                  <div style={{ color: `var(--dashboard-subject-${subjectKey}-accent)` }}>{student.avg_accuracy}% avg</div>
                </div>
              </div>
            ))}
            <div style={{
              fontSize: 'var(--text-xs)',
              color: `var(--dashboard-subject-${subjectKey}-accent)`,
              paddingTop: 'var(--space-2)',
              borderTop: `1px solid var(--dashboard-subject-${subjectKey}-border)`
            }}>
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
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--dashboard-bg-primary)',
      transition: 'background-color 200ms'
    }}>
      <Header showBackButton={false} />
      
      <main style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: 'var(--space-8) var(--space-4)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-8)'
        }}>
          <div>
            <h1 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--dashboard-text-primary)',
              margin: 0,
              marginBottom: 'var(--space-2)'
            }}>
              {user?.full_name || 'User'}'s Dashboard
            </h1>
            <p style={{
              color: 'var(--dashboard-text-secondary)',
              margin: 0
            }}>
              {educatorData.role === 'parent'
                ? `Monitor ${possessiveTerm} AI-guided learning progress and achievements`
                : `Monitor AI-guided learning, track ${relationshipTerm} progress, and set learning objectives`
              }
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              onClick={() => navigate('/app/custom-paths')}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                backgroundColor: 'var(--blue-600)',
                color: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                transition: 'background-color 200ms'
              }}
            >
              <Sparkles style={{ width: '1rem', height: '1rem' }} />
              <span>Create Custom Path</span>
            </button>
            <button style={{
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: 'var(--dashboard-bg-elevated)',
              color: 'var(--dashboard-text-primary)',
              border: '1px solid var(--dashboard-border)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              transition: 'background-color 200ms',
              boxShadow: 'var(--dashboard-shadow-sm)'
            }}>
              Generate Reports
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ borderBottom: '2px solid var(--dashboard-border)' }}>
            <nav style={{ marginBottom: '-1px', display: 'flex', gap: 'var(--space-8)' }}>
              <button
                onClick={() => setActiveTab('lesson-plans')}
                style={{
                  padding: 'var(--space-2) var(--space-1)',
                  fontWeight: 'var(--font-medium)',
                  fontSize: 'var(--text-sm)',
                  color: activeTab === 'lesson-plans' ? 'var(--dashboard-nav-tab-active)' : 'var(--dashboard-nav-tab-inactive)',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'lesson-plans' ? '3px solid var(--dashboard-nav-tab-active)' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'color 200ms'
                }}
              >
                📚 Lesson Plans
              </button>
              <button
                onClick={() => setActiveTab('overview')}
                style={{
                  padding: 'var(--space-2) var(--space-1)',
                  fontWeight: 'var(--font-medium)',
                  fontSize: 'var(--text-sm)',
                  color: activeTab === 'overview' ? 'var(--dashboard-nav-tab-active)' : 'var(--dashboard-nav-tab-inactive)',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'overview' ? '3px solid var(--dashboard-nav-tab-active)' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'color 200ms'
                }}
              >
                {dashboardLabel}
              </button>
              <button
                onClick={() => setActiveTab('students')}
                style={{
                  padding: 'var(--space-2) var(--space-1)',
                  fontWeight: 'var(--font-medium)',
                  fontSize: 'var(--text-sm)',
                  color: activeTab === 'students' ? 'var(--dashboard-nav-tab-active)' : 'var(--dashboard-nav-tab-inactive)',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'students' ? '3px solid var(--dashboard-nav-tab-active)' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'color 200ms'
                }}
              >
                {studentLabel} ({educatorData.students_children.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Dashboard Content */}
        {/* Lesson Plans Tab */}
        {activeTab === 'lesson-plans' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Embedded Daily Lesson Plan Page */}
            <DailyLessonPlanPage embedded={true} />
          </div>
        )}

        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Subject Navigation */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-4)'
              }}>
                <h2 style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--dashboard-text-primary)',
                  margin: 0
                }}>Subject Areas</h2>
                <div style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--dashboard-text-secondary)'
                }}>
                  Click any portlet to explore detailed analytics
                </div>
              </div>
            </div>
          {/* Welcome Section */}
          <div style={{
            background: 'var(--dashboard-welcome-gradient)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--dashboard-shadow-lg)',
            padding: 'var(--space-6)',
            color: '#ffffff',
            marginBottom: 'var(--space-6)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 'var(--font-bold)',
                  marginBottom: 'var(--space-1)',
                  margin: 0
                }}>Welcome back, {educatorData.name}!</h2>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: 0
                }}>
                  {educatorData.school}{educatorData.district && ` • ${educatorData.district}`}
                </p>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: 'var(--text-sm)',
                  marginTop: 'var(--space-1)',
                  margin: 0
                }}>
                  {educatorData.role === 'parent'
                    ? `Managing ${possessiveTerm} learning journey`
                    : `Teaching ${educatorData.students_children.length} ${relationshipTerm}`
                  }
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  margin: 0
                }}>Today's Date</p>
                <p style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-semibold)',
                  margin: 0
                }}>{new Date().toLocaleDateString()}</p>
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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: 'var(--space-6)',
            marginBottom: 'var(--space-6)'
          }}>
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
          <div style={{
            backgroundColor: 'var(--dashboard-bg-elevated)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--dashboard-shadow-card)'
          }}>
            <div style={{
              padding: 'var(--space-6) var(--space-6) var(--space-5)',
              borderBottom: '1px solid var(--dashboard-border)'
            }}>
              <h3 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--dashboard-text-primary)',
                margin: 0
              }}>Three-Phase Learning Journey Summary</h3>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--dashboard-text-secondary)',
                marginTop: 'var(--space-1)',
                margin: 0
              }}>Progressive mastery through Learn → Experience → Discover</p>
            </div>
            <div style={{ padding: 'var(--space-6)' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-6)'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    padding: 'var(--space-4)',
                    backgroundColor: 'var(--dashboard-subject-math)',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: 'var(--space-3)'
                  }}>
                    <BookOpen style={{
                      height: '2rem',
                      width: '2rem',
                      color: 'var(--dashboard-subject-math-accent)',
                      margin: '0 auto var(--space-2)'
                    }} />
                    <h4 style={{
                      fontWeight: 'var(--font-bold)',
                      color: 'var(--dashboard-subject-math-text)',
                      margin: 0
                    }}>Learn Phase</h4>
                    <p style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--dashboard-subject-math-accent)',
                      margin: 0
                    }}>Foundation Building</p>
                    <p style={{
                      fontSize: 'var(--text-2xl)',
                      fontWeight: 'var(--font-bold)',
                      color: 'var(--dashboard-subject-math-text)',
                      marginTop: 'var(--space-2)',
                      margin: 0
                    }}>65 XP avg</p>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    padding: 'var(--space-4)',
                    backgroundColor: 'var(--dashboard-subject-ela)',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: 'var(--space-3)'
                  }}>
                    <Target style={{
                      height: '2rem',
                      width: '2rem',
                      color: 'var(--dashboard-subject-ela-accent)',
                      margin: '0 auto var(--space-2)'
                    }} />
                    <h4 style={{
                      fontWeight: 'var(--font-bold)',
                      color: 'var(--dashboard-subject-ela-text)',
                      margin: 0
                    }}>Experience Phase</h4>
                    <p style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--dashboard-subject-ela-accent)',
                      margin: 0
                    }}>Career Application</p>
                    <p style={{
                      fontSize: 'var(--text-2xl)',
                      fontWeight: 'var(--font-bold)',
                      color: 'var(--dashboard-subject-ela-text)',
                      marginTop: 'var(--space-2)',
                      margin: 0
                    }}>85 XP avg</p>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    padding: 'var(--space-4)',
                    backgroundColor: 'var(--dashboard-subject-science)',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: 'var(--space-3)'
                  }}>
                    <Activity style={{
                      height: '2rem',
                      width: '2rem',
                      color: 'var(--dashboard-subject-science-accent)',
                      margin: '0 auto var(--space-2)'
                    }} />
                    <h4 style={{
                      fontWeight: 'var(--font-bold)',
                      color: 'var(--dashboard-subject-science-text)',
                      margin: 0
                    }}>Discover Phase</h4>
                    <p style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--dashboard-subject-science-accent)',
                      margin: 0
                    }}>Creative Mastery</p>
                    <p style={{
                      fontSize: 'var(--text-2xl)',
                      fontWeight: 'var(--font-bold)',
                      color: 'var(--dashboard-subject-science-text)',
                      marginTop: 'var(--space-2)',
                      margin: 0
                    }}>140 XP avg</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--space-6)'
          }}>
            <div style={{
              backgroundColor: 'var(--dashboard-bg-elevated)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-card)',
              padding: 'var(--space-6)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)'
            }}>
              <div style={{
                padding: 'var(--space-3)',
                backgroundColor: 'var(--dashboard-subject-math)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <Users style={{
                  height: '1.5rem',
                  width: '1.5rem',
                  color: 'var(--dashboard-subject-math-accent)'
                }} />
              </div>
              <div>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--dashboard-text-secondary)',
                  margin: 0
                }}>Total {relationshipTerm}</p>
                <p style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 'var(--font-bold)',
                  color: 'var(--dashboard-text-primary)',
                  margin: 0
                }}>{educatorData.students_children.length}</p>
              </div>
            </div>
            <div style={{
              backgroundColor: 'var(--dashboard-bg-elevated)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-card)',
              padding: 'var(--space-6)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)'
            }}>
              <div style={{
                padding: 'var(--space-3)',
                backgroundColor: 'var(--dashboard-subject-ela)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <BookOpenCheck style={{
                  height: '1.5rem',
                  width: '1.5rem',
                  color: 'var(--dashboard-subject-ela-accent)'
                }} />
              </div>
              <div>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--dashboard-text-secondary)',
                  margin: 0
                }}>Complete Journeys</p>
                <p style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 'var(--font-bold)',
                  color: 'var(--dashboard-text-primary)',
                  margin: 0
                }}>
                  {educatorData.students_children.filter(s => s.containers_completed === 3).length}
                </p>
              </div>
            </div>
            <div style={{
              backgroundColor: 'var(--dashboard-bg-elevated)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-card)',
              padding: 'var(--space-6)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)'
            }}>
              <div style={{
                padding: 'var(--space-3)',
                backgroundColor: 'var(--dashboard-subject-science)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <Star style={{
                  height: '1.5rem',
                  width: '1.5rem',
                  color: 'var(--dashboard-subject-science-accent)'
                }} />
              </div>
              <div>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--dashboard-text-secondary)',
                  margin: 0
                }}>Total XP Earned</p>
                <p style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 'var(--font-bold)',
                  color: 'var(--dashboard-text-primary)',
                  margin: 0
                }}>
                  {educatorData.students_children.reduce((sum, s) => sum + s.total_xp, 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div style={{
              backgroundColor: 'var(--dashboard-bg-elevated)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-card)',
              padding: 'var(--space-6)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)'
            }}>
              <div style={{
                padding: 'var(--space-3)',
                backgroundColor: 'var(--dashboard-subject-social)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <Trophy style={{
                  height: '1.5rem',
                  width: '1.5rem',
                  color: 'var(--dashboard-subject-social-accent)'
                }} />
              </div>
              <div>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--dashboard-text-secondary)',
                  margin: 0
                }}>Learning Streaks</p>
                <p style={{
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 'var(--font-bold)',
                  color: 'var(--dashboard-text-primary)',
                  margin: 0
                }}>
                  {Math.round(educatorData.students_children.reduce((sum, s) => sum + s.learning_streak, 0) / educatorData.students_children.length)} days
                </p>
              </div>
            </div>
          </div>


          {/* Learning Analytics - Side by Side */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: 'var(--space-6)'
          }}>
            {/* Learning Time Allocation */}
            <div style={{
              backgroundColor: 'var(--dashboard-bg-elevated)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-card)'
            }}>
              <div style={{
                padding: 'var(--space-6) var(--space-6) var(--space-5)',
                borderBottom: '1px solid var(--dashboard-border)'
              }}>
                <h3 style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--dashboard-text-primary)',
                  margin: 0
                }}>Learning Time Allocation</h3>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--dashboard-text-secondary)',
                  marginTop: 'var(--space-1)',
                  margin: 0
                }}>
                  AI-guided learning hours across subjects {educatorData.role === 'parent' ? 'for your children' : 'for your students'}
                </p>
              </div>
              <div style={{
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)'
                  }}>
                    <div style={{
                      padding: 'var(--space-2)',
                      backgroundColor: 'var(--dashboard-subject-math)',
                      borderRadius: 'var(--radius-lg)'
                    }}>
                      <BookOpen style={{
                        height: '1.25rem',
                        width: '1.25rem',
                        color: 'var(--dashboard-subject-math-accent)'
                      }} />
                    </div>
                    <div>
                      <p style={{
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--dashboard-text-primary)',
                        margin: 0
                      }}>Math</p>
                      <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--dashboard-text-secondary)',
                        margin: 0
                      }}>Both {relationshipTerm} active</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--dashboard-text-primary)',
                      margin: 0
                    }}>95 min</p>
                    <p style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--green-600)',
                      margin: 0
                    }}>This week</p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)'
                  }}>
                    <div style={{
                      padding: 'var(--space-2)',
                      backgroundColor: 'var(--dashboard-subject-ela)',
                      borderRadius: 'var(--radius-lg)'
                    }}>
                      <FileText style={{
                        height: '1.25rem',
                        width: '1.25rem',
                        color: 'var(--dashboard-subject-ela-accent)'
                      }} />
                    </div>
                    <div>
                      <p style={{
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--dashboard-text-primary)',
                        margin: 0
                      }}>ELA</p>
                      <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--dashboard-text-secondary)',
                        margin: 0
                      }}>Reading & writing focus</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--dashboard-text-primary)',
                      margin: 0
                    }}>78 min</p>
                    <p style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--green-600)',
                      margin: 0
                    }}>This week</p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)'
                  }}>
                    <div style={{
                      padding: 'var(--space-2)',
                      backgroundColor: 'var(--dashboard-subject-science)',
                      borderRadius: 'var(--radius-lg)'
                    }}>
                      <Activity style={{
                        height: '1.25rem',
                        width: '1.25rem',
                        color: 'var(--dashboard-subject-science-accent)'
                      }} />
                    </div>
                    <div>
                      <p style={{
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--dashboard-text-primary)',
                        margin: 0
                      }}>Science</p>
                      <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--dashboard-text-secondary)',
                        margin: 0
                      }}>Discovery-based learning</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--dashboard-text-primary)',
                      margin: 0
                    }}>62 min</p>
                    <p style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--blue-600)',
                      margin: 0
                    }}>This week</p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)'
                  }}>
                    <div style={{
                      padding: 'var(--space-2)',
                      backgroundColor: 'var(--dashboard-subject-social)',
                      borderRadius: 'var(--radius-lg)'
                    }}>
                      <Users style={{
                        height: '1.25rem',
                        width: '1.25rem',
                        color: 'var(--dashboard-subject-social-accent)'
                      }} />
                    </div>
                    <div>
                      <p style={{
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--dashboard-text-primary)',
                        margin: 0
                      }}>Social Studies</p>
                      <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--dashboard-text-secondary)',
                        margin: 0
                      }}>Community & culture</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--dashboard-text-primary)',
                      margin: 0
                    }}>48 min</p>
                    <p style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--blue-600)',
                      margin: 0
                    }}>This week</p>
                  </div>
                </div>
                <div style={{
                  marginTop: 'var(--space-4)',
                  paddingTop: 'var(--space-4)',
                  borderTop: '1px solid var(--dashboard-border)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)',
                      color: 'var(--dashboard-text-secondary)'
                    }}>Total Learning Time:</span>
                    <span style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-bold)',
                      color: 'var(--dashboard-text-primary)'
                    }}>283 min</span>
                  </div>
                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--dashboard-text-secondary)',
                    marginTop: 'var(--space-1)',
                    margin: 0
                  }}>
                    AI optimizes timing based on {educatorData.role === 'parent' ? 'child' : 'student'} engagement
                  </p>
                </div>
              </div>
            </div>

            {/* Learning Phase Allocation */}
            <div style={{
              backgroundColor: 'var(--dashboard-bg-elevated)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-card)'
            }}>
              <div style={{
                padding: 'var(--space-6) var(--space-6) var(--space-5)',
                borderBottom: '1px solid var(--dashboard-border)'
              }}>
                <h3 style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--dashboard-text-primary)',
                  margin: 0
                }}>Learning Phase Allocation</h3>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--dashboard-text-secondary)',
                  marginTop: 'var(--space-1)',
                  margin: 0
                }}>
                  Three-Phase Learning progression breakdown across Learn → Experience → Discover
                </p>
              </div>
              <div style={{
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)'
                  }}>
                    <div style={{
                      padding: 'var(--space-2)',
                      backgroundColor: 'var(--dashboard-subject-math)',
                      borderRadius: 'var(--radius-lg)'
                    }}>
                      <BookOpen style={{
                        height: '1.25rem',
                        width: '1.25rem',
                        color: 'var(--dashboard-subject-math-accent)'
                      }} />
                    </div>
                    <div>
                      <p style={{
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--dashboard-text-primary)',
                        margin: 0
                      }}>Learn Phase</p>
                      <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--dashboard-text-secondary)',
                        margin: 0
                      }}>Foundation building & instruction</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--dashboard-text-primary)',
                      margin: 0
                    }}>98 min</p>
                    <p style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--dashboard-subject-math-accent)',
                      margin: 0
                    }}>This week</p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)'
                  }}>
                    <div style={{
                      padding: 'var(--space-2)',
                      backgroundColor: 'var(--dashboard-subject-ela)',
                      borderRadius: 'var(--radius-lg)'
                    }}>
                      <Target style={{
                        height: '1.25rem',
                        width: '1.25rem',
                        color: 'var(--dashboard-subject-ela-accent)'
                      }} />
                    </div>
                    <div>
                      <p style={{
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--dashboard-text-primary)',
                        margin: 0
                      }}>Experience Phase</p>
                      <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--dashboard-text-secondary)',
                        margin: 0
                      }}>Career application & practice</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--dashboard-text-primary)',
                      margin: 0
                    }}>112 min</p>
                    <p style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--dashboard-subject-ela-accent)',
                      margin: 0
                    }}>This week</p>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)'
                  }}>
                    <div style={{
                      padding: 'var(--space-2)',
                      backgroundColor: 'var(--dashboard-subject-science)',
                      borderRadius: 'var(--radius-lg)'
                    }}>
                      <Sparkles style={{
                        height: '1.25rem',
                        width: '1.25rem',
                        color: 'var(--dashboard-subject-science-accent)'
                      }} />
                    </div>
                    <div>
                      <p style={{
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--dashboard-text-primary)',
                        margin: 0
                      }}>Discover Phase</p>
                      <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--dashboard-text-secondary)',
                        margin: 0
                      }}>Creative mastery & storytelling</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--dashboard-text-primary)',
                      margin: 0
                    }}>73 min</p>
                    <p style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--dashboard-subject-science-accent)',
                      margin: 0
                    }}>This week</p>
                  </div>
                </div>
                <div style={{
                  marginTop: 'var(--space-4)',
                  paddingTop: 'var(--space-4)',
                  borderTop: '1px solid var(--dashboard-border)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)',
                      color: 'var(--dashboard-text-secondary)'
                    }}>Total Phase Time:</span>
                    <span style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-bold)',
                      color: 'var(--dashboard-text-primary)'
                    }}>283 min</span>
                  </div>
                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--dashboard-text-secondary)',
                    marginTop: 'var(--space-1)',
                    margin: 0
                  }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Student Overview Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: 'var(--space-6)'
            }}>
              {educatorData.students_children.map((student) => (
                <div key={student.id} style={{
                  backgroundColor: 'var(--dashboard-bg-elevated)',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: 'var(--dashboard-shadow-card)'
                }}>
                  <div style={{
                    padding: 'var(--space-6) var(--space-6) var(--space-5)',
                    borderBottom: '1px solid var(--dashboard-border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{
                          width: '3rem',
                          height: '3rem',
                          borderRadius: 'var(--radius-full)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontWeight: 'var(--font-bold)',
                          fontSize: 'var(--text-lg)',
                          backgroundColor: student.engagement_level === 'High' ? 'var(--green-500)' : 'var(--blue-500)'
                        }}>
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 style={{
                            fontSize: 'var(--text-lg)',
                            fontWeight: 'var(--font-semibold)',
                            color: 'var(--dashboard-text-primary)',
                            margin: 0
                          }}>{student.name}</h3>
                          <p style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--dashboard-text-secondary)',
                            margin: 0
                          }}>Grade {student.grade}</p>
                          <p style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--dashboard-text-secondary)',
                            margin: 0
                          }}>Last active: {student.last_activity}</p>
                          <p style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-medium)',
                            color: 'var(--dashboard-text-secondary)',
                            margin: 0
                          }}>{student.engagement_level}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: 'var(--space-6)' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 'var(--space-4)',
                      marginBottom: 'var(--space-4)'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 'var(--space-1)'
                        }}>
                          <Star style={{ height: '1rem', width: '1rem', color: 'var(--amber-500)', marginRight: 'var(--space-1)' }} />
                          <span style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-medium)',
                            color: 'var(--dashboard-text-secondary)'
                          }}>Total XP</span>
                        </div>
                        <p style={{
                          fontSize: 'var(--text-2xl)',
                          fontWeight: 'var(--font-bold)',
                          color: 'var(--dashboard-text-primary)',
                          margin: 0
                        }}>{student.total_xp.toLocaleString()}</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 'var(--space-1)'
                        }}>
                          <Target style={{ height: '1rem', width: '1rem', color: 'var(--blue-500)', marginRight: 'var(--space-1)' }} />
                          <span style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-medium)',
                            color: 'var(--dashboard-text-secondary)'
                          }}>Accuracy</span>
                        </div>
                        <p style={{
                          fontSize: 'var(--text-2xl)',
                          fontWeight: 'var(--font-bold)',
                          color: 'var(--dashboard-text-primary)',
                          margin: 0
                        }}>{student.avg_accuracy}%</p>
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 'var(--space-4)',
                      marginBottom: 'var(--space-4)'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 'var(--space-1)'
                        }}>
                          <Zap style={{ height: '1rem', width: '1rem', color: 'var(--amber-500)', marginRight: 'var(--space-1)' }} />
                          <span style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-medium)',
                            color: 'var(--dashboard-text-secondary)'
                          }}>Streak</span>
                        </div>
                        <p style={{
                          fontSize: 'var(--text-xl)',
                          fontWeight: 'var(--font-bold)',
                          color: 'var(--dashboard-text-primary)',
                          margin: 0
                        }}>{student.learning_streak} days</p>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 'var(--space-1)'
                        }}>
                          <Trophy style={{ height: '1rem', width: '1rem', color: 'var(--purple-500)', marginRight: 'var(--space-1)' }} />
                          <span style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-medium)',
                            color: 'var(--dashboard-text-secondary)'
                          }}>Badges</span>
                        </div>
                        <p style={{
                          fontSize: 'var(--text-xl)',
                          fontWeight: 'var(--font-bold)',
                          color: 'var(--dashboard-text-primary)',
                          margin: 0
                        }}>{student.badges_earned}</p>
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: 'var(--dashboard-bg-secondary)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-3)',
                      marginBottom: 'var(--space-3)'
                    }}>
                      <p style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--dashboard-text-primary)',
                        marginBottom: 'var(--space-1)',
                        margin: 0
                      }}>Learning Journey Progress</p>
                      <p style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--dashboard-text-secondary)',
                        margin: 0
                      }}>
                        Status: <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--green-600)' }}>{student.current_container}</span>
                      </p>
                      <p style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--dashboard-text-secondary)',
                        margin: 0
                      }}>
                        Subjects: {student.subjects_mastered.join(', ')}
                      </p>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: 'var(--text-sm)'
                    }}>
                      <span style={{ color: 'var(--dashboard-text-secondary)' }}>Time spent: {student.time_spent_minutes}min</span>
                      <span style={{ color: 'var(--dashboard-text-secondary)' }}>Prefers: {student.preferred_session_time}</span>
                    </div>

                    {/* Enhanced Student Analytics */}
                    <div style={{
                      marginTop: 'var(--space-4)',
                      paddingTop: 'var(--space-4)',
                      borderTop: '1px solid var(--dashboard-border)'
                    }}>
                      <h4 style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-medium)',
                        color: 'var(--dashboard-text-primary)',
                        marginBottom: 'var(--space-3)',
                        margin: 0
                      }}>Subject Performance</h4>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 'var(--space-2)',
                        fontSize: 'var(--text-xs)'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            backgroundColor: 'var(--dashboard-subject-math)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-2)'
                          }}>
                            <p style={{ fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-subject-math-text)', margin: 0 }}>Math</p>
                            <p style={{ color: 'var(--dashboard-subject-math-accent)', margin: 0 }}>300 XP</p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            backgroundColor: 'var(--dashboard-subject-ela)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-2)'
                          }}>
                            <p style={{ fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-subject-ela-text)', margin: 0 }}>ELA</p>
                            <p style={{ color: 'var(--dashboard-subject-ela-accent)', margin: 0 }}>300 XP</p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            backgroundColor: 'var(--dashboard-subject-science)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-2)'
                          }}>
                            <p style={{ fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-subject-science-text)', margin: 0 }}>Science</p>
                            <p style={{ color: 'var(--dashboard-subject-science-accent)', margin: 0 }}>300 XP</p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            backgroundColor: 'var(--dashboard-subject-social)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-2)'
                          }}>
                            <p style={{ fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-subject-social-text)', margin: 0 }}>Social St.</p>
                            <p style={{ color: 'var(--dashboard-subject-social-accent)', margin: 0 }}>300 XP</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Analytics Section */}
            <div style={{
              backgroundColor: 'var(--dashboard-bg-elevated)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--dashboard-shadow-card)'
            }}>
              <div style={{
                padding: 'var(--space-6) var(--space-6) var(--space-5)',
                borderBottom: '1px solid var(--dashboard-border)'
              }}>
                <h3 style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--dashboard-text-primary)',
                  margin: 0
                }}>
                Detailed {educatorData.role === 'parent' ? 'Child' : 'Student'} Analytics
              </h3>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--dashboard-text-secondary)',
                  marginTop: 'var(--space-1)',
                  margin: 0
                }}>
                  Deep-dive insights into individual {educatorData.role === 'parent' ? 'child' : 'student'} performance
                </p>
              </div>
              <div style={{ padding: 'var(--space-6)' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--space-6)'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      padding: 'var(--space-4)',
                      backgroundColor: 'var(--dashboard-subject-math)',
                      borderRadius: 'var(--radius-lg)'
                    }}>
                      <Activity style={{
                        height: '2rem',
                        width: '2rem',
                        color: 'var(--dashboard-subject-math-accent)',
                        margin: '0 auto var(--space-2)'
                      }} />
                      <h4 style={{
                        fontWeight: 'var(--font-bold)',
                        color: 'var(--dashboard-subject-math-text)',
                        margin: 0
                      }}>Engagement Trends</h4>
                      <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--dashboard-subject-math-accent)',
                        margin: 0
                      }}>Weekly activity patterns</p>
                      <p style={{
                        fontSize: 'var(--text-2xl)',
                        fontWeight: 'var(--font-bold)',
                        color: 'var(--dashboard-subject-math-text)',
                        marginTop: 'var(--space-2)',
                        margin: 0
                      }}>↗️ +15%</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      padding: 'var(--space-4)',
                      backgroundColor: 'var(--dashboard-subject-ela)',
                      borderRadius: 'var(--radius-lg)'
                    }}>
                      <TrendingUp style={{
                        height: '2rem',
                        width: '2rem',
                        color: 'var(--dashboard-subject-ela-accent)',
                        margin: '0 auto var(--space-2)'
                      }} />
                      <h4 style={{
                        fontWeight: 'var(--font-bold)',
                        color: 'var(--dashboard-subject-ela-text)',
                        margin: 0
                      }}>Learning Velocity</h4>
                      <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--dashboard-subject-ela-accent)',
                        margin: 0
                      }}>Skills mastered per week</p>
                      <p style={{
                        fontSize: 'var(--text-2xl)',
                        fontWeight: 'var(--font-bold)',
                        color: 'var(--dashboard-subject-ela-text)',
                        marginTop: 'var(--space-2)',
                        margin: 0
                      }}>2.3 avg</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      padding: 'var(--space-4)',
                      backgroundColor: 'var(--dashboard-subject-science)',
                      borderRadius: 'var(--radius-lg)'
                    }}>
                      <BarChart2 style={{
                        height: '2rem',
                        width: '2rem',
                        color: 'var(--dashboard-subject-science-accent)',
                        margin: '0 auto var(--space-2)'
                      }} />
                      <h4 style={{
                        fontWeight: 'var(--font-bold)',
                        color: 'var(--dashboard-subject-science-text)',
                        margin: 0
                      }}>Challenge Level</h4>
                      <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--dashboard-subject-science-accent)',
                        margin: 0
                      }}>Optimal difficulty balance</p>
                      <p style={{
                        fontSize: 'var(--text-2xl)',
                        fontWeight: 'var(--font-bold)',
                        color: 'var(--dashboard-subject-science-text)',
                        marginTop: 'var(--space-2)',
                        margin: 0
                      }}>85% match</p>
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