/**
 * Theme Context Provider
 * Centralizes theme management across the application
 * 
 * Created: 2025-08-22
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { themeService, Theme } from '../services/themeService';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme Provider Component
 * Wraps the application to provide theme context
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(themeService.getTheme());

  useEffect(() => {
    // Subscribe to theme changes from the service
    const unsubscribe = themeService.subscribe((newTheme) => {
      setThemeState(newTheme);
    });

    // Initialize theme on mount
    const currentTheme = themeService.initialize();
    setThemeState(currentTheme);

    return unsubscribe;
  }, []);

  const setTheme = (newTheme: Theme) => {
    themeService.setTheme(newTheme, 'ThemeContext');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to use theme context
 * Throws error if used outside of ThemeProvider
 */
export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

/**
 * HOC to inject theme prop into components
 * For backward compatibility with components expecting theme prop
 */
export function withTheme<P extends { theme?: Theme }>(
  Component: React.ComponentType<P>
): React.FC<Omit<P, 'theme'>> {
  return function ThemedComponent(props: Omit<P, 'theme'>) {
    const { theme } = useThemeContext();
    return <Component {...(props as P)} theme={theme} />;
  };
}