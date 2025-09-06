/**
 * Unit Tests for ThemeRulesEngine
 * Tests visual theming and UI adaptations
 */

import { themeRulesEngine, ThemeContext } from '../themes/ThemeRulesEngine';

describe('ThemeRulesEngine', () => {
  // ============================================================================
  // THEME SELECTION TESTS
  // ============================================================================
  
  describe('Theme Selection', () => {
    it('should have light and dark themes', () => {
      const themes = themeRulesEngine.getAvailableThemes();
      expect(themes).toContain('light');
      expect(themes).toContain('dark');
    });
    
    it('should select theme based on time of day', async () => {
      // Morning context (should prefer light)
      const morningContext: ThemeContext = {
        userId: 'test-user',
        timestamp: new Date('2024-01-01T09:00:00'),
        metadata: {},
        preferences: {},
        environment: { timeOfDay: 'morning' }
      };
      
      const morningResults = await themeRulesEngine.execute(morningContext);
      const morningTheme = morningResults.find(r => r.data?.theme);
      expect(morningTheme?.data?.theme).toBe('light');
      
      // Evening context (should prefer dark)
      const eveningContext: ThemeContext = {
        userId: 'test-user',
        timestamp: new Date('2024-01-01T20:00:00'),
        metadata: {},
        preferences: {},
        environment: { timeOfDay: 'evening' }
      };
      
      const eveningResults = await themeRulesEngine.execute(eveningContext);
      const eveningTheme = eveningResults.find(r => r.data?.theme);
      expect(eveningTheme?.data?.theme).toBe('dark');
    });
    
    it('should respect user preferences over automatic selection', async () => {
      const context: ThemeContext = {
        userId: 'test-user',
        timestamp: new Date('2024-01-01T20:00:00'), // Evening
        metadata: {},
        preferences: {
          theme: 'light' // User prefers light theme
        },
        environment: { timeOfDay: 'evening' }
      };
      
      const results = await themeRulesEngine.execute(context);
      const themeResult = results.find(r => r.data?.theme);
      expect(themeResult?.data?.theme).toBe('light');
    });
  });
  
  // ============================================================================
  // COLOR SCHEME TESTS
  // ============================================================================
  
  describe('Color Schemes', () => {
    it('should provide complete color palette for light theme', async () => {
      const context: ThemeContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        preferences: { theme: 'light' }
      };
      
      const results = await themeRulesEngine.execute(context);
      const colorsResult = results.find(r => r.data?.colors);
      
      expect(colorsResult).toBeDefined();
      const colors = colorsResult?.data?.colors;
      
      expect(colors).toHaveProperty('primary');
      expect(colors).toHaveProperty('secondary');
      expect(colors).toHaveProperty('background');
      expect(colors).toHaveProperty('text');
      expect(colors).toHaveProperty('success');
      expect(colors).toHaveProperty('error');
      expect(colors).toHaveProperty('warning');
    });
    
    it('should provide complete color palette for dark theme', async () => {
      const context: ThemeContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        preferences: { theme: 'dark' }
      };
      
      const results = await themeRulesEngine.execute(context);
      const colorsResult = results.find(r => r.data?.colors);
      
      expect(colorsResult).toBeDefined();
      const colors = colorsResult?.data?.colors;
      
      // Dark theme should have darker background
      expect(colors.background).toMatch(/^#[0-3]/);
      // Dark theme should have lighter text
      expect(colors.text).toMatch(/^#[d-f]/i);
    });
  });
  
  // ============================================================================
  // ACCESSIBILITY TESTS
  // ============================================================================
  
  describe('Accessibility', () => {
    it('should adapt for high contrast mode', async () => {
      const context: ThemeContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        preferences: {
          accessibility: { highContrast: true }
        }
      };
      
      const results = await themeRulesEngine.execute(context);
      const accessibilityResult = results.find(r => r.data?.accessibility);
      
      expect(accessibilityResult).toBeDefined();
      expect(accessibilityResult?.data?.accessibility.highContrast).toBe(true);
      expect(accessibilityResult?.data?.accessibility.contrastRatio).toBeGreaterThanOrEqual(7);
    });
    
    it('should increase font sizes for large text mode', async () => {
      const context: ThemeContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        preferences: {
          accessibility: { largeText: true }
        }
      };
      
      const results = await themeRulesEngine.execute(context);
      const fontResult = results.find(r => r.data?.typography);
      
      expect(fontResult).toBeDefined();
      expect(fontResult?.data?.typography.baseFontSize).toBeGreaterThanOrEqual(18);
    });
    
    it('should support reduced motion', async () => {
      const context: ThemeContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        preferences: {
          accessibility: { reducedMotion: true }
        }
      };
      
      const results = await themeRulesEngine.execute(context);
      const animationResult = results.find(r => r.data?.animations);
      
      expect(animationResult).toBeDefined();
      expect(animationResult?.data?.animations.enabled).toBe(false);
    });
  });
  
  // ============================================================================
  // CAREER THEME TESTS
  // ============================================================================
  
  describe('Career Themes', () => {
    it('should adapt colors for different careers', async () => {
      const careers = [
        { id: 'doctor', color: '#ef4444' },     // Red for medical
        { id: 'scientist', color: '#10b981' },  // Green for science
        { id: 'artist', color: '#8b5cf6' },     // Purple for art
        { id: 'engineer', color: '#f59e0b' }    // Orange for engineering
      ];
      
      for (const career of careers) {
        const context: ThemeContext = {
          userId: 'test-user',
          timestamp: new Date(),
          metadata: {},
          preferences: { theme: 'light' },
          career: { id: career.id, name: career.id }
        };
        
        const results = await themeRulesEngine.execute(context);
        const colorsResult = results.find(r => r.data?.colors);
        
        expect(colorsResult).toBeDefined();
        expect(colorsResult?.data?.colors.accent).toBe(career.color);
      }
    });
  });
  
  // ============================================================================
  // COMPANION THEME TESTS
  // ============================================================================
  
  describe('Companion Themes', () => {
    it('should provide companion-specific colors', async () => {
      const companions = [
        { id: 'finn', color: '#3b82f6' },     // Blue
        { id: 'spark', color: '#f59e0b' },    // Orange
        { id: 'harmony', color: '#ec4899' },  // Pink
        { id: 'sage', color: '#8b5cf6' }      // Purple
      ];
      
      for (const companion of companions) {
        const context: ThemeContext = {
          userId: 'test-user',
          timestamp: new Date(),
          metadata: {},
          preferences: { theme: 'light' },
          companion: { id: companion.id, name: companion.id }
        };
        
        const results = await themeRulesEngine.execute(context);
        const companionResult = results.find(r => r.data?.companionColor);
        
        expect(companionResult).toBeDefined();
        expect(companionResult?.data?.companionColor).toBe(companion.color);
      }
    });
  });
  
  // ============================================================================
  // RESPONSIVE DESIGN TESTS
  // ============================================================================
  
  describe('Responsive Design', () => {
    it('should adapt layout for different screen sizes', async () => {
      const screenSizes = [
        { width: 375, type: 'mobile' },
        { width: 768, type: 'tablet' },
        { width: 1920, type: 'desktop' }
      ];
      
      for (const screen of screenSizes) {
        const context: ThemeContext = {
          userId: 'test-user',
          timestamp: new Date(),
          metadata: {},
          preferences: {},
          environment: {
            screenWidth: screen.width,
            deviceType: screen.type as any
          }
        };
        
        const results = await themeRulesEngine.execute(context);
        const layoutResult = results.find(r => r.data?.layout);
        
        expect(layoutResult).toBeDefined();
        expect(layoutResult?.data?.layout.type).toBe(screen.type);
        
        if (screen.type === 'mobile') {
          expect(layoutResult?.data?.layout.columns).toBe(1);
        } else if (screen.type === 'desktop') {
          expect(layoutResult?.data?.layout.columns).toBeGreaterThanOrEqual(2);
        }
      }
    });
  });
  
  // ============================================================================
  // PUBLIC METHOD TESTS
  // ============================================================================
  
  describe('Public Methods', () => {
    it('should get theme configuration', () => {
      const config = themeRulesEngine.getThemeConfiguration('light');
      
      expect(config).toBeDefined();
      expect(config.name).toBe('light');
      expect(config.colors).toBeDefined();
      expect(config.typography).toBeDefined();
    });
    
    it('should apply theme to element', () => {
      const styles = themeRulesEngine.applyTheme('dark', 'button');
      
      expect(styles).toBeDefined();
      expect(styles.backgroundColor).toBeDefined();
      expect(styles.color).toBeDefined();
      expect(styles.borderRadius).toBeDefined();
    });
    
    it('should get available themes', () => {
      const themes = themeRulesEngine.getAvailableThemes();
      
      expect(themes).toBeInstanceOf(Array);
      expect(themes.length).toBeGreaterThan(0);
      expect(themes).toContain('light');
      expect(themes).toContain('dark');
    });
  });
  
  // ============================================================================
  // ANIMATION TESTS
  // ============================================================================
  
  describe('Animations', () => {
    it('should provide animation settings', async () => {
      const context: ThemeContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        preferences: {
          animations: true
        }
      };
      
      const results = await themeRulesEngine.execute(context);
      const animationResult = results.find(r => r.data?.animations);
      
      expect(animationResult).toBeDefined();
      expect(animationResult?.data?.animations.enabled).toBe(true);
      expect(animationResult?.data?.animations.duration).toBeDefined();
      expect(animationResult?.data?.animations.easing).toBeDefined();
    });
    
    it('should provide transition settings', async () => {
      const context: ThemeContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        preferences: {}
      };
      
      const results = await themeRulesEngine.execute(context);
      const transitionResult = results.find(r => r.data?.transitions);
      
      expect(transitionResult).toBeDefined();
      expect(transitionResult?.data?.transitions.default).toBe('all 0.3s ease');
      expect(transitionResult?.data?.transitions.fast).toBe('all 0.15s ease');
      expect(transitionResult?.data?.transitions.slow).toBe('all 0.5s ease');
    });
  });
  
  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================
  
  describe('Performance', () => {
    it('should execute rules within 30ms', async () => {
      const context: ThemeContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        preferences: {
          theme: 'dark',
          accessibility: { highContrast: true },
          animations: true
        },
        career: { id: 'doctor', name: 'Doctor' },
        companion: { id: 'finn', name: 'Finn' }
      };
      
      const startTime = Date.now();
      await themeRulesEngine.execute(context);
      const executionTime = Date.now() - startTime;
      
      expect(executionTime).toBeLessThan(30);
    });
    
    it('should cache theme configurations', async () => {
      const context: ThemeContext = {
        userId: 'test-user',
        timestamp: new Date(),
        metadata: {},
        preferences: { theme: 'light' }
      };
      
      // First call
      const start1 = Date.now();
      await themeRulesEngine.execute(context);
      const time1 = Date.now() - start1;
      
      // Second call (should be cached)
      const start2 = Date.now();
      await themeRulesEngine.execute(context);
      const time2 = Date.now() - start2;
      
      // Cached call should be faster
      expect(time2).toBeLessThanOrEqual(time1);
    });
  });
});

// ============================================================================
// MOCK DATA HELPERS
// ============================================================================

function createMockContext(overrides?: Partial<ThemeContext>): ThemeContext {
  return {
    userId: 'test-user',
    timestamp: new Date(),
    metadata: {},
    preferences: {},
    ...overrides
  };
}