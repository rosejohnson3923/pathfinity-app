// ================================================================
// PATHFINITY HOMEPAGE COMPONENT
// Main landing page with animated hero section
// ================================================================

import React from 'react';
import { PathfinityHeroTypewriter } from './animations/TypewriterAnimation';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            {/* Animated Hero Title */}
            <h1 className="mb-8">
              <PathfinityHeroTypewriter 
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight"
                typingSpeed={120}
                deletingSpeed={60}
                pauseDuration={3000}
              />
            </h1>
            
            {/* Subtitle */}
            <p className="mx-auto max-w-3xl text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
              Transform your educational journey with AI-powered learning paths, 
              interactive tools, and real-world skill development that prepares you for tomorrow's careers.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200">
                Start Your Journey
              </button>
              <button className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400 font-semibold rounded-lg shadow-lg border-2 border-indigo-600 dark:border-indigo-400 transform hover:scale-105 transition-all duration-200">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-blue-400/20 rounded-full blur-xl"></div>
        <div className="absolute top-1/3 right-10 w-32 h-32 bg-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-indigo-400/20 rounded-full blur-xl"></div>
      </section>

      {/* Features Preview Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Pathfinity?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our AI-powered platform adapts to your learning style and career goals
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">AI-Powered Learning</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Personalized learning paths that adapt to your pace, style, and career aspirations.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Real-World Skills</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Hands-on projects and simulations that mirror actual workplace scenarios.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Career Analytics</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track your progress and see how your skills align with industry demands.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;