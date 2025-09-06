// ================================================================
// MODE CONTEXT - Provides dark/light mode to the entire app
// Separated from theme (grade-level styling) concerns
// ================================================================

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useMode, Mode } from '../hooks/useMode';

interface ModeContextType {
  mode: Mode;
  isDarkMode: boolean;
  toggleMode: () => void;
  setMode: (mode: Mode) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const modeState = useMode();
  
  return (
    <ModeContext.Provider value={modeState}>
      {children}
    </ModeContext.Provider>
  );
}

export function useModeContext() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useModeContext must be used within a ModeProvider');
  }
  return context;
}

// Helper hook for backward compatibility during migration
export function useThemeCompat() {
  const { mode, toggleMode, setMode } = useModeContext();
  
  return useMemo(() => ({
    darkMode: mode === 'dark',
    toggleTheme: toggleMode,
    setDarkMode: (dark: boolean) => setMode(dark ? 'dark' : 'light'),
    // Additional compatibility methods
    toggleThemeForUser: toggleMode,
    saveUserThemePreference: () => {}, // No-op for now
    loadUserThemePreference: () => null // No-op for now
  }), [mode, toggleMode, setMode]);
}

// Export compatibility context for components that haven't been migrated yet
export const useThemeContext = useThemeCompat;