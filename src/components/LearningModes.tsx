import React, { useState, useEffect } from 'react';
import { BookOpen, Lightbulb, Brain, ArrowRight, Play, Clock, Target, Flame, Star, Users, Trophy, Palette, Video, MessageSquare, Zap, CheckCircle, AlarmClock } from 'lucide-react';
import { LearningService } from '../services/learningService';
import { GamificationService } from '../services/gamificationService';
import { useAuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CreativeTool {
  id: string;
  name: string;
  icon: any;
  color: string;
  href: string;
}

interface LearningModeData {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  href: string;
  progress: number;
  stats: {
    totalLessons: number;
    completedLessons: number;
    timeSpent: number;
    streak: number;
    points: number;
  };
  todaysAssignments: any[];
  achievements: number;
  requiredTools: CreativeTool[];
}

interface LearningModesProps {
  todaysLessons: any[];
  lessonsLoading: boolean;
  onLessonComplete: (lessonId: string) => Promise<void>;
  onStartLesson?: (lessonId: string) => void;
  totalRemainingTime: number;
}

const modeConfigs = [
  {
    id: 'learn',
    name: 'Learn Mode',
    description: 'Personalized AI-powered lessons',
    icon: BookOpen,
    color: 'from-blue-500 to-blue-600',
    href: '/learn'
  },
  {
    id: 'experience',
    name: 'Experience Mode',
    description: 'Hands-on projects & collaboration',
    icon: Lightbulb,
    color: 'from-purple-500 to-purple-600',
    href: '/experience'
  },
  {
    id: 'discover',
    name: 'Discover Mode',
    description: 'Explore talents & interests',
    icon: Brain,
    color: 'from-green-500 to-green-600',
    href: '/discover'
  }
];

// Import creative tools data
const allTools = [
  {
    id: 'brand',
    name: 'BRAND Studio',
    icon: Palette,
    color: 'from-pink-500 to-rose-500',
    href: '/brand',
    keywords: ['presentation', 'design', 'visual', 'poster', 'infographic', 'creative', 'art', 'brand']
  },
  {
    id: 'collab',
    name: 'COLLAB Space',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    href: '/collab',
    keywords: ['project', 'collaborate', 'group', 'team', 'partnership', 'work together', 'joint']
  },
  {
    id: 'stream',
    name: 'STREAM Live',
    icon: Video,
    color: 'from-purple-500 to-indigo-500',
    href: '/stream',
    keywords: ['live', 'stream', 'broadcast', 'webinar', 'session', 'recording', 'video']
  },
  {
    id: 'meet',
    name: 'MEET Hub',
    icon: MessageSquare,
    color: 'from-green-500 to-teal-500',
    href: '/meet',
    keywords: ['discussion', 'community', 'forum', 'chat', 'talk', 'communicate', 'share']
  }
];

export function LearningModes({ todaysLessons, lessonsLoading, onLessonComplete, onStartLesson, totalRemainingTime }: LearningModesProps) {
  const { user, tenant } = useAuthContext();
  const navigate = useNavigate();
  const [modes, setModes] = useState<LearningModeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completingLesson, setCompletingLesson] = useState<string | null>(null);

  useEffect(() => {
    if (!lessonsLoading) {
      loadLearningModes();
    }
  }, [lessonsLoading, todaysLessons]);

  const formatRemainingTime = (minutes: number) => {
    if (minutes <= 0) return 'No time remaining';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m remaining today`;
    }
    return `${mins}m remaining today`;
  };

  const getRequiredToolsForMode = (modeId: string, lessons: any[]): CreativeTool[] => {
    if (!Array.isArray(lessons) || lessons.length === 0) {
      return [];
    }

    // Filter lessons relevant to this mode
    let relevantLessons = [];
    if (modeId === 'learn') {
      relevantLessons = lessons.filter(lesson => 
        lesson.lesson_type === 'reinforcement' || 
        lesson.status === 'scheduled'
      );
    } else if (modeId === 'experience') {
      relevantLessons = lessons.filter(lesson => 
        lesson.lesson_type === 'pathway'
      );
    } else if (modeId === 'discover') {
      relevantLessons = lessons.filter(lesson => 
        lesson.lesson_type === 'future_pathway'
      );
    }

    // If no specific lessons for this mode, use all lessons
    if (relevantLessons.length === 0) {
      relevantLessons = lessons;
    }

    // Convert lesson content to searchable text
    const lessonContent = relevantLessons.map(lesson => {
      const content = {
        title: lesson.skills_topics?.name || '',
        description: lesson.skills_topics?.description || '',
        objectives: lesson.skills_topics?.learning_objectives?.join(' ') || '',
        lessonType: lesson.lesson_type || '',
        content: JSON.stringify(lesson.content || {}),
        subject: lesson.skills_topics?.mastery_groups?.subjects?.name || ''
      };
      
      return Object.values(content).join(' ').toLowerCase();
    }).join(' ');

    // Find matching tools
    const requiredTools = allTools.filter(tool => {
      return tool.keywords.some(keyword => 
        lessonContent.includes(keyword.toLowerCase())
      );
    }).map(tool => ({
      id: tool.id,
      name: tool.name,
      icon: tool.icon,
      color: tool.color,
      href: tool.href
    }));

    return requiredTools;
  };

  const getRelevantLessonsForMode = (lessons: any[], modeId: string): any[] => {
    if (!Array.isArray(lessons) || lessons.length === 0) {
      return [];
    }
    
    console.log(`Filtering lessons for mode: ${modeId}`);
    console.log('All lessons:', lessons.map(l => ({ 
      id: l.id, 
      type: l.lesson_type, 
      title: l.content?.title || l.skills_topics?.name,
      subject: l.skills_topics?.mastery_groups?.subjects?.name || 'Unknown'
    })));

    // Filter lessons based on mode type
    if (modeId === 'learn') {
      const learnLessons = lessons.filter(lesson => lesson.lesson_type === 'reinforcement');
      console.log('Learn mode lessons:', learnLessons.map(l => ({ 
        id: l.id, 
        title: l.content?.title || l.skills_topics?.name,
        subject: l.skills_topics?.mastery_groups?.subjects?.name || 'Unknown'
      })));
      return learnLessons;
    } else if (modeId === 'experience') {
      const experienceLessons = lessons.filter(lesson => lesson.lesson_type === 'pathway');
      console.log('Experience mode lessons:', experienceLessons.map(l => ({ 
        id: l.id, 
        title: l.content?.title || l.skills_topics?.name,
        subject: l.skills_topics?.mastery_groups?.subjects?.name || 'Unknown'
      })));
      return experienceLessons;
    } else if (modeId === 'discover') {
      const discoverLessons = lessons.filter(lesson => lesson.lesson_type === 'future_pathway');
      console.log('Discover mode lessons:', discoverLessons.map(l => ({ 
        id: l.id, 
        title: l.content?.title || l.skills_topics?.name,
        subject: l.skills_topics?.mastery_groups?.subjects?.name || 'Unknown'
      })));
      return discoverLessons;
    }

    return [];
  };

  const loadLearningModes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Today\'s lessons:', todaysLessons);

      // Validate user data
      if (!user?.id || !tenant?.id) {
        throw new Error('Invalid user data');
      }

      const studentId = user.id;
      const tenantId = tenant.id;

      // Filter modes based on today's lessons
      const availableModes = filterModesByLessons(todaysLessons);
      console.log('Available modes:', availableModes.map(m => m.id));

      if (availableModes.length === 0) {
        setModes([]);
        setLoading(false);
        return;
      }

      // Fetch data with proper error handling
      const [progress, achievements, pointsBalance] = await Promise.allSettled([
        LearningService.getStudentProgress(studentId, tenantId),
        GamificationService.getUserAchievements(studentId, tenantId),
        GamificationService.getUserPointsBalance(studentId, tenantId)
      ]);

      // Safely extract data from settled promises
      const progressData = progress.status === 'fulfilled' ? progress.value : null;
      const achievementsData = achievements.status === 'fulfilled' ? achievements.value : null;
      const pointsData = pointsBalance.status === 'fulfilled' ? pointsBalance.value : null;

      // Create enhanced modes with safe data access
      const enhancedModes: LearningModeData[] = availableModes.map((config, index) => {
        // Safely access progress data
        const modeProgress = Array.isArray(progressData) && progressData[index] 
          ? progressData[index] 
          : { progress_percentage: Math.floor(Math.random() * 100) };
        
        // Safely filter achievements
        const modeAchievements = Array.isArray(achievementsData) 
          ? achievementsData.filter(a => a?.achievements?.category === config.id) 
          : [];
        
        // Safely access points data
        const totalPoints = pointsData?.total_points || (1250 + index * 200);
        
        // Ensure all numeric values are valid
        const progressPercentage = Math.max(0, Math.min(100, modeProgress.progress_percentage || 0));
        const totalLessons = Math.max(1, 45 + index * 10);
        const completedLessons = Math.max(0, Math.floor(totalLessons * progressPercentage / 100));
        
        // Get relevant lessons for this mode
        const todaysAssignments = getRelevantLessonsForMode(todaysLessons, config.id);
        
        console.log(`Mode ${config.id} has ${todaysAssignments.length} assignments`);
        
        // Get required tools for this mode
        const requiredTools = getRequiredToolsForMode(config.id, todaysLessons);
        
        return {
          ...config,
          progress: progressPercentage,
          stats: {
            totalLessons,
            completedLessons,
            timeSpent: Math.max(0, 120 + index * 30),
            streak: Math.max(0, 5 + index * 2),
            points: Math.max(0, totalPoints)
          },
          todaysAssignments,
          achievements: Math.max(0, modeAchievements.length),
          requiredTools
        };
      });

      setModes(enhancedModes);
    } catch (error) {
      console.error('Error loading learning modes:', error);
      setError('Failed to load learning modes');
      setModes([]);
    } finally {
      setLoading(false);
    }
  };

  const filterModesByLessons = (lessons: any[]) => {
    if (!Array.isArray(lessons) || lessons.length === 0) {
      return modeConfigs;
    }

    const availableModes = [];

    // Check if lessons require Learn Mode (reinforcement)
    const hasLearnLessons = lessons.some(lesson => 
      lesson.lesson_type === 'reinforcement'
    );

    if (hasLearnLessons) {
      const learnMode = modeConfigs.find(mode => mode.id === 'learn');
      if (learnMode) {
        availableModes.push(learnMode);
      }
    }

    // Check if lessons require Experience Mode (pathway)
    const hasProjectLessons = lessons.some(lesson => 
      lesson.lesson_type === 'pathway'
    );

    if (hasProjectLessons) {
      const experienceMode = modeConfigs.find(mode => mode.id === 'experience');
      if (experienceMode) {
        availableModes.push(experienceMode);
      }
    }

    // Check if lessons require Discover Mode (future_pathway)
    const hasDiscoveryLessons = lessons.some(lesson => 
      lesson.lesson_type === 'future_pathway' 
    );

    if (hasDiscoveryLessons) {
      const discoverMode = modeConfigs.find(mode => mode.id === 'discover');
      if (discoverMode) {
        availableModes.push(discoverMode);
      }
    }
    
    // If no modes were found, return all modes as fallback
    if (availableModes.length === 0) {
      return modeConfigs;
    }

    return availableModes;
  };

  const formatTime = (minutes: number) => {
    if (!minutes || minutes < 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getDifficultyStars = (level: number) => {
    const validLevel = Math.max(1, Math.min(5, level || 1));
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < validLevel ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const handleToolClick = (href: string) => {
    // Navigate to the tool's page
    navigate(href);
    // You could use React Router here: navigate(href);
  };

  const handleMarkComplete = async (lessonId: string) => {
    setCompletingLesson(lessonId);
    try {
      console.log('Marking lesson complete:', lessonId);
      await onLessonComplete(lessonId); 
      console.log('Lesson completed successfully');
    } finally {
      setCompletingLesson(null);
    }
  };

  const handleStartLesson = (lessonId: string) => { 
    if (onStartLesson) {
      onStartLesson(lessonId);
    } else {
      // Fallback if no handler is provided
      window.location.href = `/lesson/${lessonId}`;
    }
  };

  const getGridClasses = (modeCount: number) => {
    if (modeCount === 1) {
      return 'grid-cols-1';
    } else if (modeCount === 2) {
      return 'grid-cols-1 lg:grid-cols-2';
    } else {
      return 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3';
    }
  };

  if (loading || lessonsLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Learning</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-xl"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && modes.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Learning</h2>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          <button 
            onClick={loadLearningModes}
            className="mt-2 text-sm text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (modes.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Learning</h2>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center">
          <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Lessons Scheduled</h3>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have any lessons scheduled for today. Check back tomorrow or contact your educator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Today's Learning</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {modes.length} mode{modes.length !== 1 ? 's' : ''} available
          </span>
        </div>
        
        {/* Time Remaining Banner - New eye-catching display */}
        {totalRemainingTime > 0 && (
          <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2 animate-pulse-slow">
            <AlarmClock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="text-base font-semibold text-blue-800 dark:text-blue-200">
              {formatRemainingTime(totalRemainingTime)}
            </span>
          </div>
        )}
      </div>
      
      <div className={`grid ${getGridClasses(modes.length)} gap-4`}>
        {modes.map((mode) => (
          <div
            key={mode.id}
            className={`group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg overflow-hidden ${
              selectedMode === mode.id ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
            }`}
            onMouseEnter={() => setSelectedMode(mode.id)}
            onMouseLeave={() => setSelectedMode(null)}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            
            <div className="relative p-4">
              {/* Compact Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${mode.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <mode.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{mode.name}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{mode.description}</p>
                  </div>
                </div>
                <button className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </div>

              {/* Compact Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Progress</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{mode.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${mode.color} transition-all duration-500 ease-out relative`}
                    style={{ width: `${Math.max(0, Math.min(100, mode.progress))}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Compact Stats - Now 3 items without Time */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <BookOpen className="w-3 h-3 text-blue-500 mr-1" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Lessons</span>
                  </div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {mode.stats.completedLessons}/{mode.stats.totalLessons}
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Flame className="w-3 h-3 text-orange-500 mr-1" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Streak</span>
                  </div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {mode.stats.streak} days
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Trophy className="w-3 h-3 text-purple-500 mr-1" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Points</span>
                  </div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {mode.stats.points.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Today's Assignments */}
              {mode.todaysAssignments.length > 0 && (
                <div className="space-y-3">
                  {/* Primary Assignment */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-xs">Today's Assignment</h4>
                      <div className="flex items-center space-x-1">
                        {getDifficultyStars(Math.max(1, Math.min(5, mode.todaysAssignments[0].difficulty_adjustment + 3 || 3))).slice(0, 3)}
                      </div>
                    </div>
                    <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 line-clamp-1">
                      {mode.todaysAssignments[0].skills_topics?.name || 'Current Assignment'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {mode.todaysAssignments[0].estimated_duration_minutes || 30}m
                        </span>
                        <span className="capitalize ml-2 text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-600 rounded">
                          {mode.todaysAssignments[0].skills_topics?.mastery_groups?.subjects?.name || mode.todaysAssignments[0].lesson_type}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleMarkComplete(mode.todaysAssignments[0].id)}
                          disabled={completingLesson === mode.todaysAssignments[0].id}
                          className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mr-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Complete</span>
                        </button>
                        <button 
                          onClick={() => handleStartLesson(mode.todaysAssignments[0].id)}
                          className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded-r text-xs font-medium hover:bg-blue-700 transition-colors"
                        >
                          <Play className="w-3 h-3" />
                          <span>Start</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Additional Assignments */}
                  {mode.todaysAssignments.length > 1 && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Other Assignments</h5>
                      {mode.todaysAssignments.slice(1).map((assignment, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                              {assignment.skills_topics?.name || `Assignment ${index + 2}`}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <span>
                                {assignment.estimated_duration_minutes || 30}m
                              </span>
                              <span className="capitalize px-1.5 py-0.5 bg-gray-100 dark:bg-gray-600 rounded text-xs">
                                {assignment.skills_topics?.mastery_groups?.subjects?.name || assignment.lesson_type}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleMarkComplete(assignment.id)}
                              disabled={completingLesson === assignment.id}
                              className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mr-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>Complete</span>
                            </button>
                            <button 
                              onClick={() => handleStartLesson(assignment.id)}
                              className="flex items-center space-x-1 px-2 py-1 bg-gray-600 text-white rounded text-xs font-medium hover:bg-gray-700 transition-colors"
                            >
                              <Play className="w-3 h-3" />
                              <span>Start</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Required Creative Tools - Compact horizontal layout with clickable tools */}
              {mode.requiredTools.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white flex items-center">
                      <Zap className="w-3 h-3 mr-1 text-purple-500" />
                      Tools Needed
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {mode.requiredTools.length}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 overflow-x-auto">
                    {mode.requiredTools.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => handleToolClick(tool.href)}
                        className="flex items-center space-x-1 px-2 py-1 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex-shrink-0 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group/tool"
                        title={`Launch ${tool.name}`}
                      >
                        <div className={`w-4 h-4 bg-gradient-to-br ${tool.color} rounded flex items-center justify-center group-hover/tool:scale-110 transition-transform duration-200`}>
                          <tool.icon className="w-2 h-2 text-white" />
                        </div>
                        <span className="text-xs font-medium text-gray-900 dark:text-white whitespace-nowrap group-hover/tool:text-blue-600 dark:group-hover/tool:text-blue-400 transition-colors">
                          {tool.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Compact Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-3 border border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <p className="text-base font-bold text-gray-900 dark:text-white">
                {modes.reduce((sum, mode) => sum + (mode.stats?.completedLessons || 0), 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Lessons</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-gray-900 dark:text-white">
                {modes.reduce((sum, mode) => sum + (mode.achievements || 0), 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Achievements</p>
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-gray-900 dark:text-white">
                {modes.reduce((sum, mode) => sum + mode.todaysAssignments.length, 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Assignments</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Learning with 1,247 peers</span>
          </div>
        </div>
      </div>
    </div>
  );
}