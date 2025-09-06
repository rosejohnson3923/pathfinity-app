import React from 'react';
import { Sparkles, Calendar, Clock, Bot, MessageCircle, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { useDashboardView } from '../contexts/DashboardViewContext';

interface WelcomeCardProps {
  onOpenFinnAssistant: () => void;
  showFullDashboard?: boolean;
  onToggleDashboard?: () => void;
}

export function WelcomeCard({ onOpenFinnAssistant, showFullDashboard, onToggleDashboard }: WelcomeCardProps) {
  const { user } = useAuthContext();
  const dashboardViewContext = useDashboardView();
  
  // Use props if provided, otherwise use context
  const isFullDashboard = showFullDashboard !== undefined ? showFullDashboard : dashboardViewContext.showFullDashboard;
  const toggleDashboard = onToggleDashboard || dashboardViewContext.toggleDashboardView;
  
  const getCurrentTime = () => {
    try {
      return new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return '12:00 PM';
    }
  };
  
  const getCurrentDate = () => {
    try {
      return new Date().toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Today';
    }
  };

  const getGreeting = () => {
    try {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good morning';
      if (hour < 18) return 'Good afternoon';
      return 'Good evening';
    } catch (error) {
      return 'Hello';
    }
  };

  const getUserName = () => {
    return user?.full_name || 'Student';
  };

  const getUserAvatar = () => {
    return user?.avatar_url || 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2';
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-6 text-white overflow-hidden opacity-0 animate-fade-in-up">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white rounded-full"></div>
      </div>

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-medium opacity-90">{getGreeting()}</span>
            </div>
            <h1 className="text-2xl font-bold mb-1">
              Welcome back, {getUserName()}!
            </h1>
            
            <p className="text-blue-100 mb-3">Ready to continue your learning journey?</p>
            
            {/* Finn Introduction Paragraph */}
            <div className="flex items-start space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 mb-4">
              <img 
                src="/finn-enhanced.jpeg" 
                alt="Finn AI Assistant" 
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  // Fallback to Bot icon with gradient background
                  const fallback = document.createElement('div');
                  fallback.className = 'w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5';
                  fallback.innerHTML = '<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V7H1V9H3V15C3 16.1 3.9 17 5 17H8V21C8 22.1 8.9 23 10 23H14C15.1 23 16 22.1 16 21V17H19C20.1 17 21 16.1 21 15V9H23V7H21M19 15H5V3H15V9H19V15Z"/></svg>';
                  target.parentNode?.insertBefore(fallback, target);
                }}
              />
              <div className="flex-1">
                <p className="text-blue-50 text-sm leading-relaxed">
                  <span className="font-semibold text-white">Meet Finn, your AI learning guide!</span> I'm here to help you navigate your daily lessons, track your progress, and discover new tools to enhance your learning experience.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button 
                    onClick={onOpenFinnAssistant}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-400/80 to-purple-400/80 hover:from-blue-400 hover:to-purple-400 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat with Finn</span>
                  </button>
                  
                  <button 
                    onClick={toggleDashboard}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-400/80 to-teal-400/80 hover:from-emerald-400 hover:to-teal-400 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                    aria-expanded={isFullDashboard}
                    aria-controls="dashboard-sections"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>{isFullDashboard ? 'Focused View' : 'Enhanced View'}</span>
                    {isFullDashboard ? (
                      <ChevronUp className="w-4 h-4 transition-transform duration-200" />
                    ) : (
                      <ChevronDown className="w-4 h-4 transition-transform duration-200" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <img
            src={getUserAvatar()}
            alt={getUserName()}
            className="w-12 h-12 rounded-full border-2 border-white/20 object-cover flex-shrink-0 ml-4"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2';
            }}
          />
        </div>

        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-200" />
            <span className="text-blue-100">{getCurrentDate()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-200" />
            <span className="text-blue-100">{getCurrentTime()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}