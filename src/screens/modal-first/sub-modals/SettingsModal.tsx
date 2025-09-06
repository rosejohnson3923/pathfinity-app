/**
 * Settings Modal - User Preferences and Configuration
 * Contains theme toggle and other user settings
 */

import React from 'react';
import { useThemeControl } from '../../../hooks/useTheme';
import { themeService } from '../../../services/themeService';
import { useAuth } from '../../../hooks/useAuth';
import { useStudentProfile } from '../../../hooks/useStudentProfile';
import { companionVoiceoverService } from '../../../services/companionVoiceoverService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useThemeControl();
  const { user } = useAuth();
  const { profile } = useStudentProfile();
  const [voiceoverEnabled, setVoiceoverEnabled] = React.useState(
    companionVoiceoverService.isVoiceoverEnabled()
  );

  if (!isOpen) return null;

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    themeService.setTheme(newTheme, 'SettingsModal');
    setTheme(newTheme); // Update local state
  };

  const handleVoiceoverToggle = () => {
    const newState = !voiceoverEnabled;
    companionVoiceoverService.setEnabled(newState);
    setVoiceoverEnabled(newState);
  };

  const themeColors = {
    light: {
      background: '#FFFFFF',
      text: '#1A202C',
      subtext: '#718096',
      border: '#E2E8F0',
      primary: '#8B5CF6',
      hover: '#F7FAFC'
    },
    dark: {
      background: '#1E293B',
      text: '#F7FAFC',
      subtext: '#94A3B8',
      border: '#334155',
      primary: '#8B5CF6',
      hover: '#2D3748'
    }
  };

  const colors = themeColors[theme];

  return (
    <>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
          backdropFilter: 'blur(4px)'
        }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: colors.background,
          borderRadius: '1rem',
          padding: '2rem',
          width: '90%',
          maxWidth: '500px',
          zIndex: 9999,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          border: `1px solid ${colors.border}`
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: `1px solid ${colors.border}`
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: colors.text,
            margin: 0
          }}>
            ⚙️ Settings
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: colors.subtext,
              padding: '0.25rem'
            }}
          >
            ✕
          </button>
        </div>

        {/* User Info */}
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
          borderRadius: '0.5rem'
        }}>
          <p style={{ color: colors.text, margin: '0 0 0.5rem 0', fontWeight: '600' }}>
            👤 {user?.full_name || 'Student'}
          </p>
          <p style={{ color: colors.subtext, margin: 0, fontSize: '0.9rem' }}>
            Grade {profile?.grade || (user as any)?.grade_level || 'K'}
          </p>
        </div>

        {/* Settings Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Theme Toggle */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            backgroundColor: theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)',
            borderRadius: '0.5rem',
            border: `1px solid ${theme === 'dark' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`
          }}>
            <div>
              <p style={{ color: colors.text, margin: '0 0 0.25rem 0', fontWeight: '600' }}>
                {theme === 'light' ? '☀️' : '🌙'} Theme
              </p>
              <p style={{ color: colors.subtext, margin: 0, fontSize: '0.85rem' }}>
                {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
              </p>
            </div>
            <button
              onClick={handleThemeToggle}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Switch to {theme === 'light' ? 'Dark' : 'Light'}
            </button>
          </div>

          {/* Voiceover Toggle */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            borderRadius: '0.5rem'
          }}>
            <div>
              <p style={{ color: colors.text, margin: '0 0 0.25rem 0', fontWeight: '600' }}>
                🔊 Companion Voice
              </p>
              <p style={{ color: colors.subtext, margin: 0, fontSize: '0.85rem' }}>
                {voiceoverEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <button
              onClick={handleVoiceoverToggle}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: voiceoverEnabled ? colors.primary : 'transparent',
                color: voiceoverEnabled ? 'white' : colors.text,
                border: voiceoverEnabled ? 'none' : `2px solid ${colors.border}`,
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              {voiceoverEnabled ? 'On' : 'Off'}
            </button>
          </div>

          {/* Sound Effects (Future) */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            borderRadius: '0.5rem',
            opacity: 0.5
          }}>
            <div>
              <p style={{ color: colors.text, margin: '0 0 0.25rem 0', fontWeight: '600' }}>
                🎵 Sound Effects
              </p>
              <p style={{ color: colors.subtext, margin: 0, fontSize: '0.85rem' }}>
                Coming Soon
              </p>
            </div>
            <button
              disabled
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                color: colors.subtext,
                border: `2px solid ${colors.border}`,
                borderRadius: '0.5rem',
                cursor: 'not-allowed',
                fontWeight: '600'
              }}
            >
              Off
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
};