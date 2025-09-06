import React, { useState } from 'react';
import { BookOpen, Heart, Users, GraduationCap, CheckCircle } from 'lucide-react';

interface RolePreferenceSelectionProps {
  onRoleSelected: (role: 'teacher' | 'parent') => void;
  onBack?: () => void;
  userType?: 'individual' | 'school' | 'district';
}

export const RolePreferenceSelection: React.FC<RolePreferenceSelectionProps> = ({
  onRoleSelected,
  onBack,
  userType = 'individual'
}) => {
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'parent' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRoleSelect = (role: 'teacher' | 'parent') => {
    setSelectedRole(role);
    setIsAnimating(true);
    
    // Delay to show selection animation
    setTimeout(() => {
      onRoleSelected(role);
    }, 800);
  };

  const getContextualContent = () => {
    switch (userType) {
      case 'individual':
        return {
          title: 'Welcome to Your Private School!',
          subtitle: 'How would you like to be referred to in Pathfinity?',
          description: 'This is just a preference - you\'ll get the same powerful tools either way.'
        };
      case 'school':
        return {
          title: 'Welcome to Pathfinity!',
          subtitle: 'What is your role at the school?',
          description: 'Your dashboard will be customized based on your preference.'
        };
      case 'district':
        return {
          title: 'Welcome to Pathfinity!',
          subtitle: 'What is your role in education?',
          description: 'We\'ll customize your experience based on your preference.'
        };
      default:
        return {
          title: 'Welcome to Pathfinity!',
          subtitle: 'How would you like to be referred to?',
          description: 'This helps us customize your experience.'
        };
    }
  };

  const content = getContextualContent();

  if (isAnimating && selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            <div className="text-6xl mb-4 animate-bounce">
              {selectedRole === 'teacher' ? '👩‍🏫' : '👨‍👩‍👧‍👦'}
            </div>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Perfect Choice!
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Setting up your {selectedRole} dashboard...
            </p>
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏫</div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {content.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            {content.subtitle}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            {content.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Teacher Role */}
          <div 
            onClick={() => handleRoleSelect('teacher')}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-blue-500 group"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <BookOpen className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                I'm a Teacher
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                I manage curriculum, set learning objectives, and track academic progress. 
                I want to see "Teacher Dashboard" and "Student Dashboard" tabs.
              </p>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <GraduationCap className="w-4 h-4 mr-3 text-blue-500" />
                  Curriculum management & lesson planning
                </div>
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <Users className="w-4 h-4 mr-3 text-blue-500" />
                  Class analytics & student progress tracking
                </div>
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <BookOpen className="w-4 h-4 mr-3 text-blue-500" />
                  Learning objectives & academic standards
                </div>
              </div>

              <div className="mt-6 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
                  Perfect for: Educators, Homeschool Teachers, Curriculum Managers
                </p>
              </div>
            </div>
          </div>

          {/* Parent Role */}
          <div 
            onClick={() => handleRoleSelect('parent')}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-emerald-500 group"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                <Heart className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                I'm a Parent
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                I monitor my children's learning progress and support their educational journey. 
                I want to see "Parent Dashboard" and "Child Dashboard" tabs.
              </p>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <Heart className="w-4 h-4 mr-3 text-emerald-500" />
                  Child progress monitoring & achievements
                </div>
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <Users className="w-4 h-4 mr-3 text-emerald-500" />
                  Family learning insights & time management
                </div>
                <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                  <BookOpen className="w-4 h-4 mr-3 text-emerald-500" />
                  Supporting learning goals & milestones
                </div>
              </div>

              <div className="mt-6 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <p className="text-xs font-medium text-emerald-800 dark:text-emerald-200">
                  Perfect for: Parents, Guardians, Family Learning Coordinators
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Value Proposition Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🎯 Same Powerful Tools, Your Preferred Experience
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Regardless of your choice, you'll get AI-guided learning, comprehensive analytics, 
              Three-Phase Learning progression, and personalized student insights. This is simply 
              about how you'd like the interface to speak to you.
            </p>
          </div>
        </div>

        {/* Back Button */}
        {onBack && (
          <div className="mt-8 text-center">
            <button
              onClick={onBack}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              ← Back to previous step
            </button>
          </div>
        )}
      </div>
    </div>
  );
};