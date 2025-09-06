// ================================================================
// CAREER EMOJI DEMO COMPONENT
// Demonstrates the career emoji system across grade levels
// ================================================================

import React, { useState } from 'react';
import { careerEmojiService, CareerIcon, useCareerEmoji } from '../services/careerEmojiService';

export const CareerEmojiDemo: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState('K');
  
  const gradeOptions = [
    { value: 'K', label: 'Kindergarten' },
    { value: '3rd', label: '3rd Grade' },
    { value: '7th', label: '7th Grade' },
    { value: '10th', label: '10th Grade' }
  ];

  const careers = careerEmojiService.getCareersForGrade(selectedGrade);
  const categories = [...new Set(careers.map(c => c.category))];

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        🎯 Career Emoji System Demo
      </h2>

      {/* Grade Level Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Grade Level:
        </label>
        <div className="flex space-x-2">
          {gradeOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setSelectedGrade(option.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedGrade === option.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Careers by Category */}
      <div className="space-y-6">
        {categories.map(category => {
          const categoryEcareers = careers.filter(c => c.category === category);
          
          return (
            <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 capitalize">
                {category} Careers
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {categoryEcareers.map(career => (
                  <CareerCard key={career.id} career={career} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Usage Examples */}
      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          💡 Usage Examples
        </h3>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <strong>In Experience Container:</strong>
          </div>
          <div className="flex items-center space-x-2">
            <CareerIcon careerId="chef" size={32} />
            <span className="text-gray-800 dark:text-gray-200">
              "Welcome to Chef Adventure! Let's cook up some math problems!"
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <CareerIcon careerId="scientist" size={32} />
            <span className="text-gray-800 dark:text-gray-200">
              "Time to be a scientist! Let's experiment with numbers!"
            </span>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-3">
          <div className="text-sm text-blue-600 dark:text-blue-400">
            <strong>Grade-Appropriate Progression:</strong>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-blue-600 w-20">K-3rd:</span>
              <div className="flex space-x-2">
                <CareerIcon careerId="chef" size={24} />
                <CareerIcon careerId="teacher" size={24} />
                <CareerIcon careerId="doctor" size={24} />
                <CareerIcon careerId="artist" size={24} />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-blue-600 w-20">7th:</span>
              <div className="flex space-x-2">
                <CareerIcon careerId="programmer" size={24} />
                <CareerIcon careerId="lawyer" size={24} />
                <CareerIcon careerId="pilot" size={24} />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-blue-600 w-20">10th:</span>
              <div className="flex space-x-2">
                <CareerIcon careerId="data-scientist" size={24} />
                <CareerIcon careerId="cybersecurity" size={24} />
                <CareerIcon careerId="robotics-engineer" size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual career card component
const CareerCard: React.FC<{ career: any }> = ({ career }) => {
  const { icon, color } = useCareerEmoji(career.id);
  
  return (
    <div 
      className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all cursor-pointer"
      style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
    >
      <div className="flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {career.name}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
          {career.category}
        </div>
      </div>
    </div>
  );
};

export default CareerEmojiDemo;