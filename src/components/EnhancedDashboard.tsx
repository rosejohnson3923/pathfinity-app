/**
 * ENHANCED DASHBOARD WITH AGE-PROGRESSIVE AI CHARACTERS
 * Complete student learning dashboard with Azure OpenAI character integration
 * Features age-appropriate interfaces that scale from K-12
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { useStudentProfile } from '../hooks/useStudentProfile';

// New AI Character and Age-Progressive Components
import { AICharacterProvider, AICharacterSelector, useAICharacter, AICharacterAvatar } from './ai-characters';
import { 
  AgeProgressiveInterface, 
  ProgressiveComponent, 
  ProgressiveButton, 
  ProgressiveCard,
  ProgressiveNavigation,
  GradeLevel 
} from './age-progressive';

// Existing Components
import ThreeContainerOrchestrator from './containers/ThreeContainerOrchestrator';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

import { 
  BookOpen, 
  Calculator, 
  Beaker, 
  Zap, 
  Target,
  Play,
  Star,
  Award,
  Users,
  Settings,
  Heart
} from 'lucide-react';

interface LearningActivity {
  id: string;
  subject: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  icon: React.ReactNode;
  gradeLevel: GradeLevel;
  aiCharacter?: string;
}

// Sample grade-appropriate activities with AI character recommendations
const getActivitiesForGrade = (grade: GradeLevel): LearningActivity[] => {
  const gradeStr = grade.toString();
  
  if (['PreK', 'K', '1', '2'].includes(gradeStr)) {
    return [
      {
        id: 'counting-fun',
        subject: 'Math',
        title: 'Counting to 10 Fun!',
        description: 'Learn to count with Sage the Wise using colorful blocks!',
        duration: '15 min',
        difficulty: 'Easy',
        icon: <Star className="w-6 h-6" />,
        gradeLevel: grade,
        aiCharacter: 'sage'
      },
      {
        id: 'letter-adventure',
        subject: 'Reading',
        title: 'Letter Adventure',
        description: 'Discover letters with Spark the Creative through fun stories!',
        duration: '20 min',
        difficulty: 'Easy',
        icon: <BookOpen className="w-6 h-6" />,
        gradeLevel: grade,
        aiCharacter: 'spark'
      },
      {
        id: 'community-helpers',
        subject: 'Community',
        title: 'Community Helpers',
        description: 'Meet community helpers with Harmony the Helper!',
        duration: '15 min',
        difficulty: 'Easy',
        icon: <Users className="w-6 h-6" />,
        gradeLevel: grade,
        aiCharacter: 'harmony'
      }
    ];
  } else if (['3', '4', '5', '6'].includes(gradeStr)) {
    return [
      {
        id: 'multiplication-mastery',
        subject: 'Math',
        title: 'Multiplication Mastery',
        description: 'Master multiplication tables with Sage the Wise',
        duration: '25 min',
        difficulty: 'Medium',
        icon: <Calculator className="w-6 h-6" />,
        gradeLevel: grade,
        aiCharacter: 'sage'
      },
      {
        id: 'creative-writing',
        subject: 'Language Arts',
        title: 'Creative Writing Workshop',
        description: 'Write amazing stories with Spark the Creative',
        duration: '30 min',
        difficulty: 'Medium',
        icon: <Zap className="w-6 h-6" />,
        gradeLevel: grade,
        aiCharacter: 'spark'
      },
      {
        id: 'science-exploration',
        subject: 'Science',
        title: 'Science Exploration Lab',
        description: 'Discover scientific concepts with Finn the Explorer',
        duration: '35 min',
        difficulty: 'Medium',
        icon: <Beaker className="w-6 h-6" />,
        gradeLevel: grade,
        aiCharacter: 'finn'
      }
    ];
  } else {
    return [
      {
        id: 'advanced-algebra',
        subject: 'Mathematics',
        title: 'Advanced Algebra Concepts',
        description: 'Explore complex mathematical relationships with Sage',
        duration: '45 min',
        difficulty: 'Hard',
        icon: <Target className="w-6 h-6" />,
        gradeLevel: grade,
        aiCharacter: 'sage'
      },
      {
        id: 'career-exploration',
        subject: 'Career Development',
        title: 'Career Path Analysis',
        description: 'Analyze career opportunities with Finn the Explorer',
        duration: '40 min',
        difficulty: 'Hard',
        icon: <Award className="w-6 h-6" />,
        gradeLevel: grade,
        aiCharacter: 'finn'
      },
      {
        id: 'civic-engagement',
        subject: 'Social Studies',
        title: 'Civic Engagement Project',
        description: 'Plan community impact projects with Harmony',
        duration: '50 min',
        difficulty: 'Hard',
        icon: <Users className="w-6 h-6" />,
        gradeLevel: grade,
        aiCharacter: 'harmony'
      }
    ];
  }
};

const EnhancedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { studentProfile, loading } = useStudentProfile();
  
  const [selectedActivity, setSelectedActivity] = useState<LearningActivity | null>(null);
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  // Get student grade or default to K
  const studentGrade = (studentProfile?.grade_level || 'K') as GradeLevel;
  const activities = getActivitiesForGrade(studentGrade);

  const handleActivityStart = (activity: LearningActivity) => {
    setSelectedActivity(activity);
    setCurrentView('learning');
  };

  const handleBackToDashboard = () => {
    setSelectedActivity(null);
    setCurrentView('dashboard');
  };

  if (loading) {
    return (
      <AgeProgressiveInterface grade={studentGrade} className="flex items-center justify-center">
        <div className="text-center">
          <Star className="w-8 h-8 mx-auto animate-spin text-blue-500" />
          <p className="mt-4 text-lg">Loading your learning dashboard...</p>
        </div>
      </AgeProgressiveInterface>
    );
  }

  // Learning Activity View
  if (currentView === 'learning' && selectedActivity) {
    return (
      <AICharacterProvider 
        defaultCharacterId={selectedActivity.aiCharacter}
        studentGrade={studentGrade}
        studentSubject={selectedActivity.subject}
      >
        <AgeProgressiveInterface grade={studentGrade}>
          <div className="mb-4">
            <ProgressiveButton
              grade={studentGrade}
              variant="secondary"
              onClick={handleBackToDashboard}
            >
              ← Back to Dashboard
            </ProgressiveButton>
          </div>
          
          <ProgressiveCard grade={studentGrade} title={selectedActivity.title}>
            <div className="mb-6">
              <AICharacterProvider>
                <LearningWithAICharacter activity={selectedActivity} grade={studentGrade} />
              </AICharacterProvider>
            </div>
          </ProgressiveCard>
        </AgeProgressiveInterface>
      </AICharacterProvider>
    );
  }

  // Main Dashboard View
  return (
    <AICharacterProvider studentGrade={studentGrade}>
      <AgeProgressiveInterface 
        grade={studentGrade}
        showNavigation={true}
        showProgress={true}
      >
        {/* Welcome Section with AI Character */}
        <ProgressiveCard grade={studentGrade}>
          <ProgressiveComponent
            grade={studentGrade}
            simple={
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Hi {user?.user_metadata?.first_name || 'Friend'}! 🌟
                </h1>
                <p className="text-lg text-gray-600">
                  Ready to learn something amazing today?
                </p>
              </div>
            }
            medium={
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Welcome back, {user?.user_metadata?.first_name}!
                </h1>
                <p className="text-gray-600">
                  Continue your learning journey with your AI companions
                </p>
              </div>
            }
            advanced={
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-bold text-gray-800">
                    Academic Dashboard - Grade {studentGrade}
                  </h1>
                  <p className="text-gray-600">
                    {user?.user_metadata?.first_name}'s Learning Progress
                  </p>
                </div>
                <Badge variant="outline">Grade {studentGrade}</Badge>
              </div>
            }
          />

          {/* AI Character Selection */}
          <div className="mt-6">
            <ProgressiveComponent
              grade={studentGrade}
              simple={
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-4">Choose Your Learning Friend!</h2>
                  <AICharacterSelector 
                    studentGrade={studentGrade} 
                    compactMode={false}
                    onCharacterSelected={(id) => {
                      console.log(`Selected character: ${id}`);
                    }}
                  />
                </div>
              }
              medium={
                <div>
                  <h3 className="text-lg font-semibold mb-3">Your AI Learning Companions</h3>
                  <AICharacterSelector 
                    studentGrade={studentGrade} 
                    compactMode={true}
                    showRecommendations={true}
                  />
                </div>
              }
              advanced={
                <div>
                  <h3 className="text-base font-semibold mb-2">AI Mentors</h3>
                  <AICharacterSelector 
                    studentGrade={studentGrade} 
                    compactMode={true}
                    showRecommendations={false}
                  />
                </div>
              }
            />
          </div>
        </ProgressiveCard>

        {/* Learning Activities */}
        <ProgressiveCard grade={studentGrade}>
          <ProgressiveComponent
            grade={studentGrade}
            simple={
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Fun Learning Activities! 🎉
              </h2>
            }
            medium={
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Recommended Learning Activities
              </h2>
            }
            advanced={
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">
                  Academic Coursework - Grade {studentGrade}
                </h2>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-1" />
                  Customize
                </Button>
              </div>
            }
          />

          <div className={`grid gap-4 ${
            ['PreK', 'K', '1', '2'].includes(studentGrade) ? 'grid-cols-1' :
            ['3', '4', '5', '6'].includes(studentGrade) ? 'grid-cols-2' : 
            'grid-cols-3'
          }`}>
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                grade={studentGrade}
                onStart={() => handleActivityStart(activity)}
              />
            ))}
          </div>
        </ProgressiveCard>

        {/* Quick Stats for older students */}
        <ProgressiveComponent
          grade={studentGrade}
          simple={null}
          medium={
            <ProgressiveCard grade={studentGrade} title="Your Progress">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-500">12</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">850</div>
                  <div className="text-sm text-gray-600">XP Points</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-500">5</div>
                  <div className="text-sm text-gray-600">Achievements</div>
                </div>
              </div>
            </ProgressiveCard>
          }
          advanced={
            <ProgressiveCard grade={studentGrade} title="Academic Performance">
              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <div className="text-xl font-bold text-blue-500">94%</div>
                  <div className="text-xs text-gray-600">Avg Score</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-500">28</div>
                  <div className="text-xs text-gray-600">Assignments</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-500">12</div>
                  <div className="text-xs text-gray-600">Skills Mastered</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-orange-500">A-</div>
                  <div className="text-xs text-gray-600">Grade</div>
                </div>
              </div>
            </ProgressiveCard>
          }
        />
      </AgeProgressiveInterface>
    </AICharacterProvider>
  );
};

// Activity Card Component
const ActivityCard: React.FC<{
  activity: LearningActivity;
  grade: GradeLevel;
  onStart: () => void;
}> = ({ activity, grade, onStart }) => {
  return (
    <ProgressiveCard grade={grade} onClick={onStart}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {activity.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">{activity.title}</h3>
          
          <ProgressiveComponent
            grade={grade}
            simple={
              <p className="text-gray-600 mt-1">{activity.description}</p>
            }
            medium={
              <>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="secondary">{activity.duration}</Badge>
                  <Badge variant={activity.difficulty === 'Easy' ? 'default' : 'outline'}>
                    {activity.difficulty}
                  </Badge>
                </div>
              </>
            }
            advanced={
              <>
                <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex space-x-1">
                    <Badge variant="secondary" className="text-xs">{activity.subject}</Badge>
                    <Badge variant="outline" className="text-xs">{activity.difficulty}</Badge>
                  </div>
                  <span className="text-xs text-gray-500">{activity.duration}</span>
                </div>
              </>
            }
          />
          
          <div className="mt-3">
            <ProgressiveButton
              grade={grade}
              variant="primary"
              size="small"
              onClick={onStart}
              className="w-full"
            >
              <Play className="w-4 h-4 mr-1" />
              Start Learning
            </ProgressiveButton>
          </div>
        </div>
      </div>
    </ProgressiveCard>
  );
};

// Learning with AI Character Component
const LearningWithAICharacter: React.FC<{
  activity: LearningActivity;
  grade: GradeLevel;
}> = ({ activity, grade }) => {
  const { currentCharacter, generateCharacterResponse, isLoading } = useAICharacter();
  const [characterMessage, setCharacterMessage] = useState<string>('');

  useEffect(() => {
    const getWelcomeMessage = async () => {
      if (currentCharacter) {
        try {
          const response = await generateCharacterResponse(
            `Welcome the student to the ${activity.title} activity. Be encouraging and explain what they'll learn in a fun way appropriate for grade ${grade}.`
          );
          setCharacterMessage(response.message);
        } catch (error) {
          console.error('Failed to get welcome message:', error);
        }
      }
    };

    getWelcomeMessage();
  }, [currentCharacter, activity, grade, generateCharacterResponse]);

  return (
    <div className="space-y-6">
      {/* Character Introduction */}
      {currentCharacter && (
        <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
          <AICharacterAvatar
            character={currentCharacter}
            size="medium"
            showName={true}
            isActive={true}
            studentGrade={grade}
          />
          
          <div className="flex-1">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              {isLoading ? (
                <p className="text-gray-600">
                  <span className="animate-pulse">{currentCharacter.name} is thinking...</span>
                </p>
              ) : (
                <p className="text-gray-700">
                  {characterMessage || `Hi! I'm ${currentCharacter.name}, ready to help you with ${activity.title}!`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Activity Content Placeholder */}
      <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
        <div className="text-6xl mb-4">{activity.icon}</div>
        <h3 className="text-xl font-semibold mb-2">{activity.title}</h3>
        <p className="text-gray-600 mb-4">{activity.description}</p>
        <div className="text-sm text-gray-500">
          Activity integration coming soon with ThreeContainerOrchestrator
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;