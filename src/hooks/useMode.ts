// ================================================================
// MODE HOOK - Manages Dark/Light mode preference
// Separated from theme (grade-level styling) concerns
// ================================================================

import { useState, useEffect, useCallback, useMemo } from 'react';

const MODE_STORAGE_KEY = 'pathfinity-mode';
const DEFAULT_MODE = 'dark'; // Default to dark mode for accessibility

export type Mode = 'dark' | 'light';

export function useMode() {
  const [mode, setMode] = useState<Mode>(() => {
    // Safe check for window object
    if (typeof window === 'undefined') {
      return DEFAULT_MODE;
    }

    try {
      // Check for saved mode preference
      const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
      if (savedMode === 'dark' || savedMode === 'light') {
        // Immediately apply the saved mode to document
        const root = window.document.documentElement;
        if (savedMode === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
        return savedMode as Mode;
      }

      // Default to dark mode for accessibility
      // Immediately apply dark mode to document
      const root = window.document.documentElement;
      root.classList.add('dark');
      return DEFAULT_MODE;
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return DEFAULT_MODE;
    }
  });

  // Apply mode to document root
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const root = window.document.documentElement;
      
      if (mode === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      // Save to localStorage with single key
      localStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error updating mode:', error);
    }
  }, [mode]);

  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const setModeExplicitly = useCallback((newMode: Mode) => {
    setMode(newMode);
  }, []);

  const isDarkMode = useMemo(() => mode === 'dark', [mode]);

  return useMemo(() => ({ 
    mode, 
    toggleMode,
    setMode: setModeExplicitly,
    isDarkMode
  }), [mode, toggleMode, setModeExplicitly, isDarkMode]);
}