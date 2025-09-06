// ================================================================
// CAREER BADGE LANYARD - Career, Inc. Employee Badge Generator
// Creates an engaging "reporting to work" experience for students
// ================================================================

import React, { useState, useEffect } from 'react';
import { Badge, Briefcase, Star, Trophy, Clock, Building } from 'lucide-react';
import SimpleParticlesBackground from './SimpleParticlesBackground';
import { careerBadgeService } from '../services/careerBadgeService';
import { CareerBadge } from '../types/CareerTypes';
import InAppBadge from './InAppBadge';

interface CareerBadgeLanyardProps {
  studentName: string;
  studentId?: string;
  gradeLevel: string;
  selectedCareer?: {
    careerId: string;
    careerName: string;
    department: string;
  };
  availableCareers: Array<{
    careerId: string;
    careerName: string;
    department: string;
    description?: string;
    applicableSkills?: any[];
  }>;
  onCareerSelect: (careerId: string) => void;
  onExit: () => void;
  onStartWorkday?: () => void;
  isCreatingBadge?: boolean;
}

export const CareerBadgeLanyard: React.FC<CareerBadgeLanyardProps> = ({
  studentName,
  studentId,
  gradeLevel,
  selectedCareer,
  availableCareers,
  onCareerSelect,
  onExit,
  onStartWorkday,
  isCreatingBadge = false
}) => {
  const [badgeAnimation, setBadgeAnimation] = useState<'none' | 'creating' | 'complete'>('none');
  const [showLanyard, setShowLanyard] = useState(false);

  useEffect(() => {
    if (selectedCareer && isCreatingBadge) {
      console.log('🏢 Starting badge creation animation for:', selectedCareer.careerName);
      setBadgeAnimation('creating');
      setTimeout(() => {
        console.log('🏢 Badge creation complete, showing badge');
        setBadgeAnimation('complete');
        setShowLanyard(true);
      }, 4500);
    }
  }, [selectedCareer, isCreatingBadge]);

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getShiftTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning Shift';
    if (hour < 17) return 'Afternoon Shift';
    return 'Evening Shift';
  };

  const getCareerEmoji = (careerId: string) => {
    const emojiMap: { [key: string]: string } = {
      'chef': '👨‍🍳',
      'park-ranger': '🌲',
      'librarian': '📚',
      'doctor': '👨‍⚕️',
      'teacher': '👩‍🏫',
      'engineer': '👨‍💻',
      'scientist': '👩‍🔬',
      'artist': '👨‍🎨',
      'pilot': '👨‍✈️',
      'firefighter': '👨‍🚒'
    };
    return emojiMap[careerId] || '💼';
  };

  const getCareerDescription = (careerId: string) => {
    const descriptions: { [key: string]: string } = {
      'chef': 'Create delicious meals and manage kitchen operations using math and science skills.',
      'park-ranger': 'Protect wildlife and educate visitors about nature conservation.',
      'librarian': 'Help people find information and organize knowledge systems.',
      'doctor': 'Help patients feel better using medical knowledge and problem-solving.',
      'teacher': 'Share knowledge and help other students learn new concepts.',
      'engineer': 'Design and build solutions to real-world problems.',
      'scientist': 'Conduct experiments and discover new things about our world.',
      'artist': 'Create beautiful works that express ideas and emotions.',
      'pilot': 'Navigate aircraft safely through the skies.',
      'firefighter': 'Keep communities safe and respond to emergencies.'
    };
    return descriptions[careerId] || 'Apply your skills in this exciting career!';
  };

  // Badge Creation Animation
  if (selectedCareer && badgeAnimation === 'creating') {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-blue-600 to-cyan-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center relative overflow-hidden">
        <SimpleParticlesBackground theme="experience" particleCount={60} />

        <div className="text-center z-10">
          {/* Career, Inc. Logo */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-2xl mb-4 animate-bounce">
              <Building className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Career, Inc.</h1>
            <p className="text-blue-100 text-lg">Employee Services Division</p>
          </div>

          {/* Badge Creation Process */}
          <div className="bg-white dark:bg-gray-700 rounded-2xl p-8 max-w-md mx-4 shadow-2xl border-2 border-gray-200 dark:border-gray-500">
            <div className="mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Creating Your Badge
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Preparing your {selectedCareer.careerName} credentials...
              </p>
            </div>

            {/* Progress Steps */}
            <div className="space-y-3 text-left">
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-gray-700 dark:text-gray-300">Verifying identity: {studentName}</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-gray-700 dark:text-gray-300">Assigning to: {selectedCareer.department}</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-gray-700 dark:text-gray-300">Generating security clearance...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Completed Badge Display
  if (selectedCareer && badgeAnimation === 'complete') {
    return (
      <div className="min-h-screen pt-16 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          {/* Lanyard and Badge Container */}
          <div className="relative inline-block">
            {/* Lanyard Strap */}
            <div 
              className={`absolute left-1/2 -translate-x-1/2 -top-24 w-1 h-24 bg-gradient-to-b from-blue-600 to-blue-800 transform transition-all duration-1000 ${
                showLanyard ? 'translate-y-0 opacity-100' : '-translate-y-16 opacity-0'
              }`}
            >
              {/* Lanyard Clip */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-400 rounded-full shadow-md"></div>
            </div>

            {/* Badge Hole Punch */}
            <div 
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-3 bg-white dark:bg-gray-800 rounded-b-full transform transition-all duration-1000 delay-300 ${
                showLanyard ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
              }`}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>

            {/* Badge - More realistic dimensions */}
            <div 
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-300 dark:border-gray-600 transform transition-all duration-1000 delay-500 ${
                showLanyard ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
              }`}
              style={{ width: '280px', minHeight: '420px' }}
            >
              {/* Badge Header */}
              <div className="bg-blue-600 p-3 rounded-t-lg">
                <div className="flex items-center justify-center space-x-1">
                  <Building className="w-5 h-5 text-white" />
                  <span className="text-white font-bold text-sm">CAREER, INC.</span>
                </div>
              </div>

              {/* Badge Content - DALL-E Generated Badge */}
              <div className="p-4">
                <InAppBadge
                  careerId={selectedCareer.careerId}
                  careerName={selectedCareer.careerName}
                  department={selectedCareer.department}
                  gradeLevel={gradeLevel}
                  studentName={studentName}
                  className="w-full"
                />

                {/* Badge Details */}
                <div className="space-y-2 text-xs mt-4">
                  <div className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Grade:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{gradeLevel}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Shift:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{getShiftTime()}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600 dark:text-gray-400">Valid:</span>
                    <span className="font-medium text-gray-900 dark:text-white text-xs">Today</span>
                  </div>
                </div>

                {/* Badge Footer */}
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-1 text-green-600">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs">ACTIVE</span>
                    </div>
                    <div className="text-gray-400 font-mono text-xs">
                      #{Math.random().toString(36).substr(2, 6).toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Welcome Message and Button */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6 transform transition-all duration-1000 delay-1000">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                🎉 Welcome to Career, Inc!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You're now officially employed as a <strong>{selectedCareer.careerName}</strong>! 
                Get ready to apply your skills in real-world scenarios.
              </p>
            </div>

            {/* Continue Button */}
            <button
              onClick={() => {
                console.log('🏢 Starting workday for:', selectedCareer.careerId);
                if (onStartWorkday) {
                  onStartWorkday();
                }
              }}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <Briefcase className="w-5 h-5" />
              <span>Start Your Workday</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Career Selection Interface
  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-8 text-white text-center relative">
        {/* Back Button */}
        <button
          onClick={onExit}
          className="absolute top-4 left-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
            <Building className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold mb-2">🏢 Welcome to Career, Inc!</h1>
          <p className="text-xl opacity-90">
            Good morning, {studentName}! Please select your career for today's shift.
          </p>
          <div className="mt-4 inline-flex items-center space-x-4 text-sm bg-white bg-opacity-10 rounded-full px-4 py-2">
            <Clock className="w-4 h-4" />
            <span>{getCurrentDate()}</span>
            <span>•</span>
            <span>{getShiftTime()}</span>
          </div>
        </div>
      </div>

      {/* Career Selection Cards */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Choose Your Department
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Each career will generate your official Career, Inc. employee badge
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availableCareers.slice(0, 3).map((career, index) => (
            <div
              key={career.careerId}
              onClick={() => {
                console.log('🏢 Career card clicked:', career.careerId, career.careerName);
                onCareerSelect(career.careerId);
              }}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-300 overflow-hidden"
            >
              {/* Card Header */}
              <div className={`p-6 text-center ${
                index === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                index === 1 ? 'bg-gradient-to-br from-purple-500 to-purple-600' :
                'bg-gradient-to-br from-green-500 to-green-600'
              }`}>
                {/* In-App Career Icon */}
                <div className="w-16 h-16 mx-auto mb-2">
                  <InAppBadge
                    careerId={career.careerId}
                    careerName={career.careerName}
                    department={career.department}
                    gradeLevel={gradeLevel}
                    studentName={studentName}
                    className="w-full h-full rounded-full"
                    preview={true}
                  />
                </div>
                <h3 className="text-xl font-bold text-white">{career.careerName}</h3>
                <p className="text-white text-opacity-90 text-sm">{career.department}</p>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {career.description || getCareerDescription(career.careerId)}
                </p>

                {/* Preview Badge - In-App Generated */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
                  <div className="text-xs text-center">
                    <div className="font-semibold text-gray-900 dark:text-white mb-2">Your Badge Preview</div>
                    <div className="w-20 h-24 mx-auto">
                      <InAppBadge
                        careerId={career.careerId}
                        careerName={career.careerName}
                        department={career.department}
                        gradeLevel={gradeLevel}
                        studentName={studentName}
                        className="w-full h-full rounded"
                        preview={true}
                      />
                    </div>
                    <div className="text-gray-500 dark:text-gray-500 mt-1">{career.careerName}</div>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 group-hover:shadow-lg">
                  Select Career & Generate Badge
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>🔒 Your badge will be valid for today's learning session</p>
        </div>
      </div>
    </div>
  );
};

export default CareerBadgeLanyard;