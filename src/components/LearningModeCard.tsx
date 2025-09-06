import React from 'react';
import { ArrowRight, Play, Clock, Target, Star, Trophy, Flame, BookOpen } from 'lucide-react';

interface CreativeTool {
  id: string;
  name: string;
  icon: any;
  color: string;
}

interface LearningModeCardProps {
  mode: {
    id: string;
    name: string;
    description: string;
    icon: any;
    color: string;
    progress: number;
    href: string;
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
  };
  isSelected: boolean;
  onSelect: () => void;
  onContinue: () => void;
}

export function LearningModeCard({ mode, isSelected, onSelect, onContinue }: LearningModeCardProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getDifficultyStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < level ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div
      className={`group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-xl overflow-hidden cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
      }`}
      onMouseEnter={onSelect}
      onClick={onContinue}
     tabIndex={0} role="button" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onContinue } }}>
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className={`w-14 h-14 bg-gradient-to-br ${mode.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
              <mode.icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{mode.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{mode.description}</p>
            </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{mode.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-3 rounded-full bg-gradient-to-r ${mode.color} transition-all duration-500 ease-out relative`}
              style={{ width: `${mode.progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <BookOpen className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Lessons</span>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {mode.stats.completedLessons}/{mode.stats.totalLessons}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Clock className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Time</span>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {formatTime(mode.stats.timeSpent)}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Flame className="w-4 h-4 text-orange-500 mr-1" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Streak</span>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {mode.stats.streak} days
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center justify-center mb-1">
              <Trophy className="w-4 h-4 text-purple-500 mr-1" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Points</span>
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {mode.stats.points.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Today's Assignments */}
        {mode.todaysAssignments.length > 0 && (
          <div className="space-y-3 mb-4">
            {/* Primary Assignment */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Today's Assignment</h4>
                <div className="flex items-center space-x-1">
                  {getDifficultyStars(Math.max(1, Math.min(5, mode.todaysAssignments[0].difficulty_adjustment + 3 || 3)))}
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                {mode.todaysAssignments[0].skills_topics?.name || 'Current Assignment'}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {mode.todaysAssignments[0].estimated_duration_minutes || 30}m
                  </span>
                  <span className="capitalize">{mode.todaysAssignments[0].lesson_type || 'lesson'}</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onContinue();
                  }}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium hover:bg-blue-700 transition-colors"
                >
                  <Play className="w-3 h-3" />
                  <span>Start</span>
                </button>
              </div>
            </div>

            {/* Additional Assignments */}
            {mode.todaysAssignments.length > 1 && (
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Other Assignments</h5>
                {mode.todaysAssignments.slice(1).map((assignment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {assignment.skills_topics?.name || `Assignment ${index + 2}`}
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {assignment.estimated_duration_minutes || 30}m
                        </span>
                        <span className="capitalize">{assignment.lesson_type || 'lesson'}</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle individual assignment start
                        console.log('Starting assignment:', assignment.id);
                      }}
                      className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded-full text-xs font-medium hover:bg-gray-700 transition-colors ml-3"
                    >
                      <Play className="w-3 h-3" />
                      <span>Start</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Required Creative Tools - Slide in from top on hover */}
        {isSelected && mode.requiredTools.length > 0 && (
          <div className="animate-in slide-in-from-top-2 duration-200 border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <Target className="w-4 h-4 mr-2 text-purple-500" />
              Required Creative Tools
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mode.requiredTools.map((tool) => (
                <div key={tool.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className={`w-8 h-8 bg-gradient-to-br ${tool.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <tool.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {tool.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hover Action */}
      <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${mode.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
    </div>
  );
}