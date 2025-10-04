import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { companionVoiceoverService } from '../services/companionVoiceoverService';
import { voiceManagerService } from '../services/voiceManagerService';
import { getLogoutRedirectPath } from '../utils/demoUserDetection';
import {
  Settings,
  Users,
  Building,
  CreditCard,
  Shield,
  Database,
  ChevronDown,
  LogOut,
  BarChart3
} from 'lucide-react';

export function AdminMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Check if user is admin or educator (for analytics access)
  const isAdmin = user?.role === 'school_admin' || user?.role === 'district_admin' || user?.role === 'product_admin';
  const hasAnalyticsAccess = isAdmin || user?.role === 'educator';
  
  if (!hasAnalyticsAccess) {
    return null;
  }
  
  const handleSignOut = async () => {
    try {
      // Stop all speech immediately when logging out
      companionVoiceoverService.stopCurrent();
      voiceManagerService.stopSpeaking();

      console.log('🔍 AdminMenu logout triggered');
      console.log('🔍 AdminMenu logout - User email:', user?.email);

      // Get the appropriate redirect path based on user type
      const redirectPath = getLogoutRedirectPath(user);

      console.log('🔄 AdminMenu redirect path:', redirectPath);

      // Sign out first
      await signOut();
      console.log('🔄 AdminMenu signOut() completed');

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
  
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      >
        <Settings className="h-5 w-5" />
        <span className="text-sm font-medium">Admin</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 min-w-[280px] rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
              Admin Controls
            </div>
            
            <button
              onClick={() => {
                navigate('/dashboard');
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center whitespace-nowrap"
              role="menuitem"
            >
              <Settings className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              Dashboard
            </button>
            
            <button
              onClick={() => {
                navigate('/app/analytics');
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center whitespace-nowrap"
              role="menuitem"
            >
              <BarChart3 className="mr-3 h-4 w-4 text-purple-500 dark:text-purple-400 flex-shrink-0" />
              My Analytics
              <span className="ml-auto text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full flex-shrink-0">AI</span>
            </button>

            <button
              onClick={() => {
                navigate('/app/subscription');
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center whitespace-nowrap"
              role="menuitem"
            >
              <CreditCard className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              My Subscription
            </button>

            <button
              onClick={() => {
                navigate('/app/admin-controls');
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center whitespace-nowrap"
              role="menuitem"
            >
              <Users className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              User Management
            </button>
            
            {user?.role === 'product_admin' && (
              <button
                onClick={() => {
                  navigate('/app/admin-controls');
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center whitespace-nowrap"
                role="menuitem"
              >
                <Building className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                Tenant Management
              </button>
            )}

            <button
              onClick={() => {
                navigate('/app/admin-controls?tab=system-settings');
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center whitespace-nowrap"
              role="menuitem"
            >
              <Settings className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              System Settings
            </button>

            <button
              onClick={() => {
                navigate('/app/admin-controls?tab=security-settings');
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center whitespace-nowrap"
              role="menuitem"
            >
              <Shield className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
              Security Settings
            </button>

            <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center whitespace-nowrap"
              role="menuitem"
            >
              <LogOut className="mr-3 h-4 w-4 text-red-500 dark:text-red-400 flex-shrink-0" />
              Sign Out
            </button>
            
          </div>
        </div>
      )}
    </div>
  );
}