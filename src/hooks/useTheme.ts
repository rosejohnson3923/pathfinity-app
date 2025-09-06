/**
 * React Hook for Theme Management
 * Provides read-only access to theme for most components
 */

import { useThemeContext } from '../contexts/ThemeContext';
import { Theme } from '../services/themeService';

/**
 * Hook for components that need to READ the theme
 * Now uses ThemeContext for centralized management
 */
export const useTheme = (): Theme => {
  const { theme } = useThemeContext();
  return theme;
};

/**
 * Hook for Dashboard ONLY - provides ability to change theme
 * Now uses ThemeContext for centralized management
 */
export const useThemeControl = () => {
  const { theme, setTheme, toggleTheme } = useThemeContext();

  return {
    theme,
    setTheme: (newTheme: Theme) => setTheme(newTheme),
    toggleTheme
  };
};