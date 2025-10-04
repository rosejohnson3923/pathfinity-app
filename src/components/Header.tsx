import React, { useState, useRef, useEffect } from 'react';
import { Search, MessageSquare, Settings, GraduationCap, LogOut, Building, BookOpen, School, Sun, Moon } from 'lucide-react';
import { AdminMenu } from './AdminMenu';
import { ArrowLeft } from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { useThemeControl } from '../hooks/useTheme';
import { useStudentProfile } from '../hooks/useStudentProfile';
import { useNavigate, useLocation } from 'react-router-dom';
import { isDemoUser, getLogoutRedirectPath, logDemoUserDetection } from '../utils/demoUserDetection';
import { companionVoiceoverService } from '../services/companionVoiceoverService';
import { voiceManagerService } from '../services/voiceManagerService';

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchLoading?: boolean;
  isSearchActive?: boolean;
  showBackButton?: boolean;
  backButtonDestination?: string;
  title?: string;
  showUserMenu?: boolean;
  showThemeToggle?: boolean;
  studentFriendly?: boolean;
  adaptiveTheme?: boolean;
}

export function Header({ 
  onSearch, 
  searchLoading = false, 
  isSearchActive = false, 
  showBackButton = false,
  backButtonDestination = '/dashboard',
  title,
  showUserMenu = true,
  showThemeToggle = true,
  studentFriendly = false,
  adaptiveTheme = false
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showTenantInfo, setShowTenantInfo] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { signOut, tenant, user, profile } = useAuthContext();
  const { theme, toggleTheme } = useThemeControl();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get student profile for grade level (for adaptive styling) - only for students
  const { profile: studentProfile } = useStudentProfile(
    user?.role === 'student' ? user?.id : undefined, 
    user?.role === 'student' ? user?.email : undefined
  );
  const gradeLevel = studentProfile?.grade_level;

  const getUserName = () => {
    return user?.full_name || 'User';
  };

  const getUserRole = () => {
    return user?.role || 'student';
  };

  // Get role-specific information
  const getRoleSpecificInfo = () => {
    const role = getUserRole();
    
    if (role === 'student') {
      return {
        icon: GraduationCap,
        text: user?.grade_level || ''
      };
    } else if (role === 'educator') {
      return {
        icon: BookOpen,
        text: user?.subjects && user.subjects.length > 0 ? user.subjects[0] : 'Teacher'
      };
    } else {
      return {
        icon: School,
        text: user?.school || 'Admin'
      };
    }
  };

  const getUserAvatar = () => {
    return user?.avatar_url || 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2';
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    if (onSearch) {
      if (value.trim().length >= 2) {
        searchTimeoutRef.current = setTimeout(() => {
          onSearch(value.trim());
        }, 300); // 300ms debounce delay
      } else if (value.trim().length === 0) {
        // Clear search immediately when input is empty
        onSearch('');
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
    searchInputRef.current?.focus();
  };

  const handleSignOut = async () => {
    try {
      // Stop all speech immediately when logging out
      companionVoiceoverService.stopCurrent();
      voiceManagerService.stopSpeaking();

      console.log('🔍 Header logout triggered');
      console.log('🔍 User object on logout:', user);
      console.log('🔍 Header logout - User:', user?.email);

      // Get the appropriate redirect path based on user type
      const redirectPath = getLogoutRedirectPath(user);

      console.log('🔄 Header redirecting to:', redirectPath);

      // Sign out first
      await signOut();

      // Then redirect - use window.location.href for external URLs
      if (redirectPath.startsWith('http')) {
        window.location.href = redirectPath;
      } else {
        navigate(redirectPath, { replace: true });
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search on Ctrl/Cmd + K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Clear search on Escape
      if (e.key === 'Escape' && isSearchActive) {
        handleClearSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchActive]);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {/* Back Button */}
            {showBackButton && (
              <button
                onClick={() => navigate(backButtonDestination)}
                className="mr-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            
            {/* Logo and Title */}
            <div className="flex items-center space-x-2">
            <img 
              src="/images/pathfinity-logo-metallic-dark.png" 
              alt="Pathfinity Logo" 
              className="w-16 h-16 rounded-lg object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                // Fallback to original gradient logo
                const fallback = document.createElement('div');
                fallback.className = 'w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center';
                fallback.innerHTML = '<span class="text-white font-bold text-2xl">P∞</span>';
                target.parentNode?.insertBefore(fallback, target);
              }}
            />
            <h1 className={`font-bold text-gray-900 dark:text-white ${
              studentFriendly ? 'text-2xl' : 'text-xl'
            }`}>
              {title || 'Pathfinity'}
            </h1>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-lg mx-2 sm:mx-4 md:mx-8">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search users, content, lessons..."
                value={searchQuery}
                onChange={handleSearchChange}
                aria-label="Search users, content, lessons"
                className="w-full pl-10 pr-12 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 text-sm sm:text-base"
                maxLength={100}
              />
              
              {/* Loading indicator and clear button */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                {searchLoading && (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                )}
                {searchQuery && !searchLoading && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label="Clear search"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
            <button 
              className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Messages"
            >
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
            </button>
            {/* Theme Toggle */}
            {showThemeToggle && (
              <button
                onClick={toggleTheme}
                className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)'
                }}
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            )}
            {/* Admin Menu for admin users, Sign Out button for others */}
            {showUserMenu && (
              user?.role === 'school_admin' || user?.role === 'district_admin' || user?.role === 'product_admin' ? (
                <div className="ml-2">
                  <AdminMenu />
                </div>
              ) : (
                <button 
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Sign Out"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )
            )}
            
            <div className="flex items-center space-x-2 pl-2 sm:pl-4 border-l border-gray-200 dark:border-gray-700">
              <img
                src={getUserAvatar()}
                alt={getUserName()}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2';
                }}
              />
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-20 sm:max-w-24" title={getUserName()}>
                  {getUserName()}
                </p>
                <div className="flex flex-col">
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {getUserRole()}
                  </p>
                  {getUserRole() && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      {(() => {
                        const { icon: Icon, text } = getRoleSpecificInfo();
                        return (
                          <>
                            <Icon className="w-3 h-3 mr-1" />
                            <span className="truncate max-w-16">{text}</span>
                          </>
                        );
                      })()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}