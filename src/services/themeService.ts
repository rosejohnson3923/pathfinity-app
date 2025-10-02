/**
 * Centralized Theme Management Service
 * Controls theme persistence and application across the entire app
 * Works with MasterTheme.css for unified styling
 */

// Import the MasterTheme.css to ensure it's loaded
import '../styles/MasterTheme.css';
import '../styles/themes/dark.css';
import '../styles/themes/light.css';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'pathfinity-theme';
const DEFAULT_THEME: Theme = 'dark';

class ThemeService {
  private currentTheme: Theme;
  private listeners: Set<(theme: Theme) => void> = new Set();

  constructor() {
    // Initialize theme from localStorage or default
    const savedTheme = this.getSavedTheme();
    this.currentTheme = savedTheme || DEFAULT_THEME;
    this.applyTheme(this.currentTheme);
  }

  /**
   * Get saved theme from localStorage
   */
  private getSavedTheme(): Theme | null {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
    }
    return null;
  }

  /**
   * Save theme to localStorage
   */
  private saveTheme(theme: Theme): void {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.error('Failed to save theme to localStorage:', error);
    }
  }

  /**
   * Apply theme to document
   */
  private applyTheme(theme: Theme): void {
    // Apply to document root for CSS variables
    document.documentElement.setAttribute('data-theme', theme);
    
    // Also apply class for backwards compatibility
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${theme}`);
    
    // Apply to body for any legacy styles
    document.body.setAttribute('data-theme', theme);
  }

  /**
   * Get current theme
   */
  getTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * Set theme (should only be called from Dashboard)
   * @param theme - The theme to set
   * @param source - Component setting the theme (for logging)
   */
  setTheme(theme: Theme, source: string = 'unknown'): void {
    // Only allow theme changes from authorized sources
    const authorizedSources = ['ReturnSelectModal', 'StudentDashboard', 'SettingsModal', 'ThemeContext', 'system'];
    
    if (!authorizedSources.includes(source)) {
      console.warn(`Theme change attempted from unauthorized source: ${source}`);
      return;
    }

    if (theme === this.currentTheme) {
      return;
    }

    this.currentTheme = theme;
    this.saveTheme(theme);
    this.applyTheme(theme);
    
    // Notify all listeners
    this.listeners.forEach(listener => listener(theme));
    
    console.log(`Theme changed to ${theme} by ${source}`);
  }

  /**
   * Initialize theme on app load
   */
  initialize(): Theme {
    const savedTheme = this.getSavedTheme();
    const theme = savedTheme || DEFAULT_THEME;
    
    if (!savedTheme) {
      // First time user - save default theme
      this.saveTheme(theme);
    }
    
    this.currentTheme = theme;
    this.applyTheme(theme);
    
    return theme;
  }

  /**
   * Subscribe to theme changes
   */
  subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Clear theme (for logout)
   */
  clearTheme(): void {
    try {
      localStorage.removeItem(THEME_KEY);
    } catch (error) {
      console.error('Failed to clear theme:', error);
    }
  }
}

// Export singleton instance
export const themeService = new ThemeService();

// Export hook for React components
export const useThemeService = () => {
  return {
    getTheme: () => themeService.getTheme(),
    setTheme: (theme: Theme, source: string) => themeService.setTheme(theme, source),
    initialize: () => themeService.initialize(),
    subscribe: (listener: (theme: Theme) => void) => themeService.subscribe(listener),
    clearTheme: () => themeService.clearTheme()
  };
};