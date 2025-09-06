import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { LearningService } from '../services/learningService';
import { useAuthContext } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  BookOpen,
  Clock,
  Award,
  Target,
  ChevronRight,
  BarChart2,
  CheckCircle,
  Star,
  Users,
  Zap,
  ArrowRight,
  Layers,
  BookMarked,
  Play
} from 'lucide-react';

interface SubjectDetail {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  icon: string;
  gradeLevels: string[];
}

interface MasteryGroup {
  id: string;
  name: string;
  description: string;
  gradeLevel: string;
  sequenceOrder: number;
  skillsTopics?: SkillsTopic[];
}

interface SkillsTopic {
  id: string;
  name: string;
  description: string;
  masteryGroupId: string;
  difficultyLevel: number;
  estimatedDurationMinutes: number;
  sequenceOrder: number;
  learningObjectives: string[];
}

interface ProgressData {
  masteryLevel: 'masters' | 'meets' | 'approaches' | 'does-not-meet';
  progressPercentage: number;
  streakDays: number;
  lastActivityDate?: string;
  totalTimeSpentMinutes: number;
  lessonsCompleted: number;
  assessmentsPassed: number;
}

export function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, tenant } = useAuthContext();
  
  const [subject, setSubject] = useState<SubjectDetail | null>(null);
  const [masteryGroups, setMasteryGroups] = useState<MasteryGroup[]>([]);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMasteryGroup, setSelectedMasteryGroup] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadSubjectDetails(id);
    }
  }, [id, user, tenant]);

  const loadSubjectDetails = async (subjectId: string) => {
    try {
      setLoading(true);
      setError(null);

      if (!tenant?.id) {
        throw new Error('Tenant ID is required');
      }

      // Try to get data from Supabase using the get_subject_details function
      // TODO: Fix the get_subject_details RPC function on Supabase backend
      // The function has a SQL error: "column 'mg.sequence_order' must appear in the GROUP BY clause"
      // For now, we'll use the direct queries approach below
      console.log('Using direct queries approach for subject details');

      // Fallback to direct queries if the function call fails
      const [subjectData, masteryGroupsData, progressData] = await Promise.all([
        LearningService.getSubjectById(subjectId, tenant.id),
        LearningService.getMasteryGroupsBySubject(subjectId, tenant.id),
        user?.id ? LearningService.getStudentProgress(user.id, tenant.id) : null
      ]);

      if (!subjectData) {
        throw new Error('Subject not found');
      }

      // Format subject data
      const formattedSubject: SubjectDetail = {
        id: subjectData.id,
        name: subjectData.name,
        code: subjectData.code,
        description: subjectData.description || 'No description available',
        color: subjectData.color || '#3B82F6',
        icon: subjectData.icon || 'book-open',
        gradeLevels: subjectData.grade_levels || []
      };

      // Format mastery groups data
      const formattedMasteryGroups: MasteryGroup[] = Array.isArray(masteryGroupsData) 
        ? masteryGroupsData.map(mg => ({
            id: mg.id,
            name: mg.name,
            description: mg.description || 'No description available',
            gradeLevel: mg.grade_level,
            sequenceOrder: mg.sequence_order,
            skillsTopics: Array.isArray(mg.skills_topics) 
              ? mg.skills_topics.map(st => ({
                  id: st.id,
                  name: st.name,
                  description: st.description || 'No description available',
                  masteryGroupId: mg.id,
                  difficultyLevel: st.difficulty_level,
                  estimatedDurationMinutes: st.estimated_duration_minutes,
                  sequenceOrder: st.sequence_order,
                  learningObjectives: st.learning_objectives || []
                }))
              : []
          }))
        : [];

      // Format progress data
      let formattedProgress: ProgressData | null = null;
      if (Array.isArray(progressData)) {
        const subjectProgress = progressData.find(p => 
          p.subject_id === subjectId && !p.mastery_group_id && !p.skills_topic_id
        );
        
        if (subjectProgress) {
          formattedProgress = {
            masteryLevel: subjectProgress.mastery_level as 'masters' | 'meets' | 'approaches' | 'does-not-meet',
            progressPercentage: subjectProgress.progress_percentage,
            streakDays: subjectProgress.streak_days,
            lastActivityDate: subjectProgress.last_activity_date,
            totalTimeSpentMinutes: subjectProgress.total_time_spent_minutes,
            lessonsCompleted: subjectProgress.lessons_completed,
            assessmentsPassed: subjectProgress.assessments_passed
          };
        }
      }

      // If no progress data was found, use mock data
      if (!formattedProgress) {
        formattedProgress = {
          masteryLevel: 'meets',
          progressPercentage: 75,
          streakDays: 12,
          lastActivityDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          totalTimeSpentMinutes: 840,
          lessonsCompleted: 24,
          assessmentsPassed: 4
        };
      }

      setSubject(formattedSubject);
      setMasteryGroups(formattedMasteryGroups);
      setProgress(formattedProgress);

      // Set the first mastery group as selected by default
      if (formattedMasteryGroups.length > 0 && !selectedMasteryGroup) {
        setSelectedMasteryGroup(formattedMasteryGroups[0].id);
      }

    } catch (error) {
      console.error('Error loading subject details:', error);
      setError('Failed to load subject details. Please try again.');
      
      // Use mock data as fallback
      setSubject({
        id: '550e8400-e29b-41d4-a716-446655440030',
        name: 'Mathematics',
        code: 'MATH',
        description: 'Comprehensive mathematics curriculum covering algebra, geometry, statistics, and calculus',
        color: '#3B82F6',
        icon: 'calculator',
        gradeLevels: ['9', '10', '11', '12']
      });
      
      setMasteryGroups([
        {
          id: '550e8400-e29b-41d4-a716-446655440101',
          name: 'Algebra Foundations',
          description: 'Core algebraic concepts and fundamental skills',
          gradeLevel: '9',
          sequenceOrder: 1,
          skillsTopics: [
            {
              id: '550e8400-e29b-41d4-a716-446655440201',
              name: 'Linear Equations',
              description: 'Solving and graphing linear equations',
              masteryGroupId: '550e8400-e29b-41d4-a716-446655440101',
              difficultyLevel: 2,
              estimatedDurationMinutes: 45,
              sequenceOrder: 1,
              learningObjectives: [
                'Solve one-step linear equations',
                'Solve multi-step linear equations',
                'Graph linear equations',
                'Interpret linear equations in real-world contexts'
              ]
            },
            {
              id: '550e8400-e29b-41d4-a716-446655440202',
              name: 'Algebraic Expressions',
              description: 'Simplifying and evaluating algebraic expressions',
              masteryGroupId: '550e8400-e29b-41d4-a716-446655440101',
              difficultyLevel: 2,
              estimatedDurationMinutes: 40,
              sequenceOrder: 2,
              learningObjectives: [
                'Identify terms and coefficients',
                'Combine like terms',
                'Evaluate expressions with variables',
                'Apply the distributive property'
              ]
            }
          ]
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440102',
          name: 'Geometry Essentials',
          description: 'Essential geometric principles and spatial reasoning',
          gradeLevel: '9',
          sequenceOrder: 2,
          skillsTopics: [
            {
              id: '550e8400-e29b-41d4-a716-446655440203',
              name: 'Angles & Triangles',
              description: 'Properties of angles and triangles',
              masteryGroupId: '550e8400-e29b-41d4-a716-446655440102',
              difficultyLevel: 2,
              estimatedDurationMinutes: 45,
              sequenceOrder: 1,
              learningObjectives: [
                'Identify angle relationships',
                'Apply angle sum theorems',
                'Classify triangles',
                'Apply triangle congruence criteria'
              ]
            }
          ]
        }
      ]);
      
      setProgress({
        masteryLevel: 'meets',
        progressPercentage: 75,
        streakDays: 12,
        lastActivityDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        totalTimeSpentMinutes: 840,
        lessonsCompleted: 24,
        assessmentsPassed: 4
      });
      
      // Set the first mastery group as selected by default
      setSelectedMasteryGroup('550e8400-e29b-41d4-a716-446655440101');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    if (!minutes || minutes < 0) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getMasteryLevelColor = (level: string) => {
    switch (level) {
      case 'masters':
        return 'bg-green-500 text-white';
      case 'meets':
        return 'bg-blue-500 text-white';
      case 'approaches':
        return 'bg-yellow-500 text-white';
      case 'does-not-meet':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getMasteryLevelLabel = (level: string) => {
    switch (level) {
      case 'masters':
        return 'Masters';
      case 'meets':
        return 'Meets';
      case 'approaches':
        return 'Approaches';
      case 'does-not-meet':
        return 'Does Not Meet';
      default:
        return 'Unknown';
    }
  };

  const getDifficultyStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < level ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
      />
    ));
  };

  const getSubjectIcon = () => {
    if (!subject) return <BookOpen className="w-6 h-6 text-white" />;
    
    // If the icon is an emoji, return it directly
    if (subject.icon.length <= 2 || subject.icon.match(/\p{Emoji}/u)) {
      return <span className="text-xl">{subject.icon}</span>;
    }
    
    // Otherwise, try to map to a Lucide icon
    switch (subject.icon.toLowerCase()) {
      case 'calculator':
        return <BarChart2 className="w-6 h-6 text-white" />;
      case 'book-open':
        return <BookOpen className="w-6 h-6 text-white" />;
      case 'microscope':
        return <Zap className="w-6 h-6 text-white" />;
      case 'globe':
        return <Users className="w-6 h-6 text-white" />;
      case 'target':
        return <Target className="w-6 h-6 text-white" />;
      case 'palette':
        return <Layers className="w-6 h-6 text-white" />;
      default:
        return <BookMarked className="w-6 h-6 text-white" />;
    }
  };

  const handleStartLesson = (skillsTopicId: string) => {
    // Create a mock lesson ID for now
    const lessonId = `lesson-${skillsTopicId}`;
    navigate(`/lesson/${lessonId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header showBackButton={true} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header showBackButton={true} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-600 dark:text-red-400">{error || 'Subject not found'}</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header showBackButton={true} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Subject Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: subject.color }}
            >
              {getSubjectIcon()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{subject.name}</h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">{subject.code}</span>
                {progress && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getMasteryLevelColor(progress.masteryLevel)}`}>
                    {getMasteryLevelLabel(progress.masteryLevel)}
                  </span>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {subject.description}
              </p>
            </div>
          </div>
        </div>
        
        {/* Progress Overview */}
        {progress && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <BarChart2 className="w-5 h-5 text-blue-500 mr-2" />
              Progress Overview
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Progress Bar */}
              <div className="col-span-1 md:col-span-2 lg:col-span-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{progress.progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="h-2.5 rounded-full bg-blue-600 transition-all duration-500 ease-out"
                    style={{ width: `${progress.progressPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Stats */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {progress.lessonsCompleted}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Lessons Completed</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {progress.assessmentsPassed}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Assessments Passed</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatTime(progress.totalTimeSpentMinutes)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Time Spent</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {progress.streakDays} days
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Last activity: {formatDate(progress.lastActivityDate)}
            </div>
          </div>
        )}
        
        {/* Mastery Groups and Skills Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Mastery Groups Sidebar */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Mastery Groups</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {masteryGroups.map((group) => (
                  <li key={group.id}>
                    <button
                      onClick={() => setSelectedMasteryGroup(group.id)}
                      className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                        selectedMasteryGroup === group.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div>
                        <h3 className={`font-medium ${
                          selectedMasteryGroup === group.id
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {group.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Grade {group.gradeLevel}
                        </p>
                      </div>
                      <ChevronRight className={`w-5 h-5 ${
                        selectedMasteryGroup === group.id
                          ? 'text-blue-500'
                          : 'text-gray-400'
                      }`} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Skills Topics */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Skills & Topics</h2>
              <button 
                onClick={() => navigate('/progress-report')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center"
              >
                View Detailed Report
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            
            {selectedMasteryGroup && (
              <div className="space-y-6">
                {/* Mastery Group Description */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {masteryGroups.find(g => g.id === selectedMasteryGroup)?.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {masteryGroups.find(g => g.id === selectedMasteryGroup)?.description}
                  </p>
                </div>
                
                {/* Skills Topics List */}
                <div className="space-y-4">
                  {masteryGroups.find(g => g.id === selectedMasteryGroup)?.skillsTopics?.map((topic) => (
                    <div 
                      key={topic.id}
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {topic.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-2">
                            {topic.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{topic.estimatedDurationMinutes} minutes</span>
                            </div>
                            <div className="flex items-center">
                              <Target className="w-4 h-4 mr-1" />
                              <span>Difficulty:</span>
                              <div className="flex ml-1">
                                {getDifficultyStars(topic.difficultyLevel)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleStartLesson(topic.id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          <span>Start</span>
                        </button>
                      </div>
                      
                      {/* Learning Objectives */}
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                          <Target className="w-4 h-4 text-blue-500 mr-1" />
                          Learning Objectives
                        </h4>
                        <ul className="space-y-2">
                          {topic.learningObjectives.map((objective, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">{objective}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                  
                  {/* Empty state */}
                  {(!masteryGroups.find(g => g.id === selectedMasteryGroup)?.skillsTopics || 
                    masteryGroups.find(g => g.id === selectedMasteryGroup)?.skillsTopics?.length === 0) && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Skills Topics Available</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        There are no skills topics available for this mastery group yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Empty state when no mastery group is selected */}
            {!selectedMasteryGroup && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a Mastery Group</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Please select a mastery group from the sidebar to view its skills and topics.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}