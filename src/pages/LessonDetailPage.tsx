import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { LearningService } from '../services/learningService';
import { GamificationService } from '../services/gamificationService';
import { useAuthContext } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Clock, 
  Target, 
  CheckCircle, 
  ArrowLeft, 
  Star, 
  Play, 
  Pause,
  RotateCcw,
  ChevronRight,
  Award,
  Zap
} from 'lucide-react';

interface LessonDetail {
  id: string;
  title: string;
  description: string;
  lessonType: string;
  activities: string[];
  difficulty: number;
  duration: number;
  subject: string;
  subjectColor: string;
  status: string;
  completion: number;
  timeSpent: number;
}

export function LessonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, tenant } = useAuthContext();
  
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentActivity, setCurrentActivity] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  useEffect(() => {
    if (id) {
      loadLesson(id);
    }
  }, [id]);

  // Timer effect
  useEffect(() => {
    let timer: number | undefined;
    
    if (isTimerRunning) {
      timer = window.setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isTimerRunning]);

  const loadLesson = async (lessonId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Extract skills_topic_id from the lesson ID format (lesson-<skillsTopicId>)
      const skillsTopicId = lessonId.startsWith('lesson-') 
        ? lessonId.replace('lesson-', '') 
        : lessonId;
      
      // Get lesson details from the API
      const lessonPlans = await LearningService.getTodaysLessons(user?.id || '');
      const lessonPlan = lessonPlans?.find(lesson => 
        lesson.id === lessonId || lesson.skills_topic_id === skillsTopicId
      );
      
      if (!lessonPlan) {
        throw new Error('Lesson not found');
      }
      
      // Format the lesson data
      const formattedLesson: LessonDetail = {
        id: lessonPlan.id,
        title: lessonPlan.content?.title || lessonPlan.skills_topics?.name || 'Untitled Lesson',
        description: lessonPlan.content?.description || lessonPlan.skills_topics?.description || 'No description available',
        lessonType: lessonPlan.lesson_type || 'reinforcement',
        activities: lessonPlan.content?.activities || [],
        difficulty: lessonPlan.skills_topics?.difficulty_level || 3,
        duration: lessonPlan.estimated_duration_minutes || 30,
        subject: lessonPlan.skills_topics?.mastery_groups?.subjects?.name || 'General',
        subjectColor: lessonPlan.skills_topics?.mastery_groups?.subjects?.color || '#3B82F6',
        status: lessonPlan.status || 'scheduled',
        completion: lessonPlan.completion_percentage || 0,
        timeSpent: lessonPlan.time_spent_minutes || 0
      };
      
      setLesson(formattedLesson);
      setTimeSpent(formattedLesson.timeSpent * 60); // Convert minutes to seconds
      setIsCompleted(formattedLesson.status === 'completed' || formattedLesson.completion === 100);
      
    } catch (error) {
      console.error('Error loading lesson:', error);
      setError('Failed to load lesson details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartLesson = () => {
    setIsTimerRunning(true);
    
    // If lesson was already in progress, continue from the current activity
    if (lesson?.status === 'in_progress' && lesson.completion > 0) {
      const activityIndex = Math.floor((lesson.activities.length * lesson.completion) / 100);
      setCurrentActivity(Math.min(activityIndex, lesson.activities.length - 1));
    }
    
    // Update lesson status to in_progress if it's not already completed
    if (lesson?.status !== 'completed' && id && user?.id && tenant?.id) {
      LearningService.completeLesson(id, {
        status: 'in_progress',
        completion_percentage: lesson?.completion || 0,
        time_spent_minutes: Math.floor(timeSpent / 60)
      }).catch(err => console.error('Error updating lesson status:', err));
    }
  };

  const handlePauseLesson = () => {
    setIsTimerRunning(false);
    
    // Save progress
    if (id && user?.id && tenant?.id) {
      const completionPercentage = Math.min(
        100, 
        Math.round(((currentActivity + 1) / (lesson?.activities.length || 1)) * 100)
      );
      
      LearningService.completeLesson(id, {
        status: 'in_progress',
        completion_percentage: completionPercentage,
        time_spent_minutes: Math.floor(timeSpent / 60)
      }).catch(err => console.error('Error saving progress:', err));
    }
  };

  const handleNextActivity = () => {
    if (!lesson || currentActivity >= lesson.activities.length - 1) {
      return;
    }
    
    setCurrentActivity(prev => prev + 1);
    
    // Update completion percentage
    if (id && user?.id && tenant?.id) {
      const completionPercentage = Math.min(
        100, 
        Math.round(((currentActivity + 2) / lesson.activities.length) * 100)
      );
      
      LearningService.completeLesson(id, {
        status: 'in_progress',
        completion_percentage: completionPercentage,
        time_spent_minutes: Math.floor(timeSpent / 60)
      }).catch(err => console.error('Error updating completion:', err));
    }
  };

  const handleCompleteLesson = async () => {
    if (!id || !user?.id || !tenant?.id || !lesson) return;
    
    try {
      setIsCompleting(true);
      
      // Stop the timer
      setIsTimerRunning(false);
      
      // Calculate points based on completion time and difficulty
      const basePoints = 50;
      const difficultyMultiplier = lesson.difficulty * 0.5;
      const timeBonus = Math.max(0, lesson.duration - Math.floor(timeSpent / 60)) * 2;
      const totalPoints = Math.round(basePoints + (basePoints * difficultyMultiplier) + timeBonus);
      
      setEarnedPoints(totalPoints);
      
      // Mark lesson as completed
      await LearningService.completeLesson(id, {
        status: 'completed',
        completion_percentage: 100,
        time_spent_minutes: Math.floor(timeSpent / 60)
      });
      
      // Award points
      if (totalPoints > 0) {
        await GamificationService.addPointsTransaction(
          user.id,
          tenant.id,
          {
            transaction_type: 'earned',
            points_amount: totalPoints,
            source_type: 'lesson',
            source_id: id,
            description: `Completed lesson: ${lesson.title}`
          }
        );
      }
      
      // Update streak
      await GamificationService.updateStreak(
        user.id,
        tenant.id,
        'lesson_completion'
      );
      
      // Check for "First Steps" achievement if this is one of the first lessons
      const userAchievements = await GamificationService.getUserAchievements(user.id, tenant.id);
      const hasFirstStepsAchievement = userAchievements.some(
        a => a.achievements?.title === 'First Steps' || a.achievements?.description?.includes('first lesson')
      );
      
      if (!hasFirstStepsAchievement) {
        const availableAchievements = await GamificationService.getAvailableAchievements(tenant.id);
        const firstStepsAchievement = availableAchievements.find(
          a => a.title === 'First Steps' || a.description?.includes('first lesson')
        );
        
        if (firstStepsAchievement) {
          await GamificationService.awardAchievement(user.id, firstStepsAchievement.id, tenant.id);
        }
      }
      
      setIsCompleted(true);
      setShowCompletionMessage(true);
      
    } catch (error) {
      console.error('Error completing lesson:', error);
      setError('Failed to complete lesson. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCompletionPercentage = () => {
    if (!lesson) return 0;
    if (isCompleted) return 100;
    
    return Math.min(
      100, 
      Math.round(((currentActivity + 1) / lesson.activities.length) * 100)
    );
  };

  const getDifficultyStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < level ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
      />
    ));
  };

  const getLessonTypeColor = (type: string) => {
    switch (type) {
      case 'reinforcement':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'pathway':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400';
      case 'future_pathway':
        return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getLessonTypeLabel = (type: string) => {
    switch (type) {
      case 'reinforcement':
        return 'Learn Mode';
      case 'pathway':
        return 'Experience Mode';
      case 'future_pathway':
        return 'Discover Mode';
      default:
        return 'Lesson';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-600 dark:text-red-400">{error || 'Lesson not found'}</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="inline-block w-4 h-4 mr-2" />
              Return to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header showBackButton={true} backButtonDestination="/dashboard" />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lesson Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">            
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLessonTypeColor(lesson.lessonType)}`}>
              {getLessonTypeLabel(lesson.lessonType)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {lesson.subject}
            </span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {lesson.title}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {lesson.description}
          </p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" />
              <span className="text-gray-600 dark:text-gray-400">{lesson.duration} minutes</span>
            </div>
            <div className="flex items-center">
              <Target className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" />
              <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
              <div className="flex ml-1">
                {getDifficultyStars(lesson.difficulty)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Completion Message */}
        {showCompletionMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-6 text-center animate-in slide-in-from-top-4 duration-300">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Lesson Completed!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Great job! You've successfully completed this lesson.
            </p>
            <div className="flex items-center justify-center space-x-6 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {earnedPoints}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Points Earned</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Time Spent</p>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Return to Dashboard
              </button>
              <button 
                onClick={() => {
                  // Find the next lesson in the sequence
                  navigate('/dashboard');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next Lesson
                <ChevronRight className="inline-block w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        )}
        
        {!showCompletionMessage && (
          <>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{getCompletionPercentage()}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="h-2.5 rounded-full bg-blue-600 transition-all duration-500 ease-out"
                  style={{ width: `${getCompletionPercentage()}%` }}
                ></div>
              </div>
            </div>
            
            {/* Lesson Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
              {/* Timer and Controls */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 font-mono text-lg font-bold text-gray-900 dark:text-white">
                    {formatTime(timeSpent)}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {isTimerRunning ? 'Timer running' : 'Timer paused'}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!isTimerRunning && !isCompleted && (
                    <button 
                      onClick={handleStartLesson}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      aria-label="Start lesson"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                  )}
                  {isTimerRunning && (
                    <button 
                      onClick={handlePauseLesson}
                      className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                      aria-label="Pause lesson"
                    >
                      <Pause className="w-5 h-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => setTimeSpent(0)}
                    className="p-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    aria-label="Reset timer"
                    disabled={isCompleted}
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Activity Content */}
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Activity {currentActivity + 1} of {lesson.activities.length}
                </h2>
                
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-600">
                  <p className="text-gray-800 dark:text-gray-200 text-lg">
                    {lesson.activities[currentActivity]}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentActivity(prev => Math.max(0, prev - 1))}
                    disabled={currentActivity === 0 || !isTimerRunning}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {currentActivity < lesson.activities.length - 1 ? (
                    <button
                      onClick={handleNextActivity}
                      disabled={!isTimerRunning}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleCompleteLesson}
                      disabled={!isTimerRunning || isCompleting || isCompleted}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isCompleting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Completing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Complete Lesson
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Learning Objectives */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Zap className="w-5 h-5 text-yellow-500 mr-2" />
                Learning Objectives
              </h2>
              <ul className="space-y-3">
                {lesson.activities.map((activity, index) => (
                  <li key={index} className="flex items-start">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      index <= currentActivity 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                    }`}>
                      {index < currentActivity ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-medium">{index + 1}</span>
                      )}
                    </div>
                    <span className={`text-sm ${
                      index <= currentActivity 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {activity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
}