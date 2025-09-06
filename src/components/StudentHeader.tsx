/**
 * Student Header Component
 * Persistent header with user info, logout, and profile access
 */

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useStudentProfile } from '../hooks/useStudentProfile';
import { useNavigate } from 'react-router-dom';
import { companionVoiceoverService } from '../services/companionVoiceoverService';
import { voiceManagerService } from '../services/voiceManagerService';

interface StudentHeaderProps {
  theme?: 'light' | 'dark';
  onProfileClick?: () => void;
}

export const StudentHeader: React.FC<StudentHeaderProps> = ({ 
  theme = 'dark',
  onProfileClick
}) => {
  const { user, signOut } = useAuth();
  const { profile } = useStudentProfile();
  const navigate = useNavigate();

  const themeColors = {
    light: {
      background: 'rgba(255, 255, 255, 0.95)',
      text: '#1A202C',
      subtext: '#718096',
      border: '#E2E8F0',
      primary: '#8B5CF6'
    },
    dark: {
      background: 'rgba(30, 41, 59, 0.95)',
      text: '#F7FAFC',
      subtext: '#94A3B8',
      border: '#334155',
      primary: '#8B5CF6'
    }
  };

  const colors = themeColors[theme];

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        // Stop all speech immediately when logging out
        companionVoiceoverService.stopCurrent();
        voiceManagerService.stopSpeaking();
        
        // Check if demo user
        const isDemoUser = user?.email && [
          'alex.davis@sandview.plainviewisd.edu',
          'sam.brown@sandview.plainviewisd.edu',
          'jordan.smith@oceanview.plainviewisd.edu',
          'taylor.johnson@cityview.plainviewisd.edu'
        ].includes(user.email.toLowerCase());
        
        const redirectPath = isDemoUser ? '/demo' : '/';
        
        // Clear session data
        localStorage.removeItem(`pathfinity-intro-${user?.id}`);
        localStorage.removeItem('pathfinity-theme');
        
        // Navigate first, then sign out
        navigate(redirectPath, { replace: true });
        await signOut();
      } catch (error) {
        console.error('Logout error:', error);
        navigate('/');
      }
    }
  };

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      // Default behavior - show alert with profile info
      alert(`
        Profile Information:
        Name: ${profile?.first_name || user?.full_name || 'Student'}
        Grade: ${profile?.grade || (user as any)?.grade_level || 'K'}
        Email: ${user?.email || 'Not set'}
        Learning Style: ${profile?.learning_preferences?.learning_style || 'Visual'}
        
        Profile management coming soon!
      `);
    }
  };

  return (
    <header 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: colors.background,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${colors.border}`,
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Left Side - Logo and User Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🚀</span>
          <span style={{ 
            color: colors.text,
            fontWeight: '600',
            fontSize: '1.1rem'
          }}>
            Pathfinity
          </span>
        </div>
        
        <div style={{ 
          borderLeft: `1px solid ${colors.border}`,
          paddingLeft: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors.primary} 0%, #7C3AED 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: '1rem'
          }}>
            {(profile?.first_name || user?.full_name || 'S')[0].toUpperCase()}
          </div>
          
          <div>
            <div style={{ 
              color: colors.text,
              fontWeight: '500',
              fontSize: '0.95rem'
            }}>
              {profile?.first_name || user?.full_name?.split(' ')[0] || 'Student'}
            </div>
            <div style={{ 
              color: colors.subtext,
              fontSize: '0.85rem'
            }}>
              Grade {profile?.grade || (user as any)?.grade_level || 'K'} • {profile?.learning_streak || 0} day streak 🔥
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Points Display */}
        <div style={{
          padding: '0.5rem 1rem',
          backgroundColor: colors.primary,
          borderRadius: '0.5rem',
          color: 'white',
          fontSize: '0.9rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          ⭐ {profile?.totalPoints || 0} Points
        </div>

        {/* Profile Button */}
        <button
          onClick={handleProfileClick}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            border: `2px solid ${colors.border}`,
            borderRadius: '0.5rem',
            color: colors.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.border;
            e.currentTarget.style.borderColor = colors.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = colors.border;
          }}
        >
          👤 Profile
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            border: `2px solid ${colors.border}`,
            borderRadius: '0.5rem',
            color: colors.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#EF4444';
            e.currentTarget.style.borderColor = '#EF4444';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.color = colors.text;
          }}
        >
          🚪 Logout
        </button>
      </div>
    </header>
  );
};

export default StudentHeader;