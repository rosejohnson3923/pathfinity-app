# Pathfinity Unified Styling Strategy
## Aligning with UI Brand Guidelines v6.0

---

## Executive Summary

This document establishes a unified styling strategy for the Pathfinity platform, addressing current inconsistencies and aligning with UI Brand Guidelines v6.0. The strategy prioritizes CSS modules, enforces MasterTheme variables, and ensures consistent theme persistence across all user sessions.

---

## 1. Core Principles

### 1.1 Style Hierarchy
```
1. MasterTheme.css (Global CSS Variables) - Foundation
2. Container Themes (Learn/Experience/Discover) - Container-specific
3. CSS Modules (Component styles) - Component-specific
4. Dynamic Inline Styles (Calculated values only) - Runtime values
```

### 1.2 Theme Enforcement
- **Single Source of Truth**: Theme selected in StudentDashboard
- **Persistent Storage**: localStorage with fallback to sessionStorage
- **Global Application**: Applied at document root level
- **Container Inheritance**: Containers inherit and extend base theme

---

## 2. Implementation Standards

### 2.1 CSS Module Structure
```typescript
// Component file: MyComponent.tsx
import styles from './MyComponent.module.css';

// Usage
<div className={styles.container}>
  <h1 className={styles.title}>Content</h1>
</div>
```

### 2.2 MasterTheme Variable Usage
```css
/* ❌ WRONG - Hardcoded values */
.button {
  background: #8b5cf6;
  padding: 12px 24px;
}

/* ✅ CORRECT - Using CSS variables */
.button {
  background: var(--color-primary);
  padding: var(--spacing-3) var(--spacing-6);
}
```

### 2.3 Container Theme Extension
```css
/* BaseContainer.css */
.container-base {
  background: var(--bg-primary);
  color: var(--text-primary);
}

/* LearnContainer.css */
.ai-learn-container {
  --container-gradient: var(--gradient-learn);
  --container-primary: var(--color-purple-500);
  --container-accent: var(--color-indigo-400);
}
```

---

## 3. Grade-Level Adaptations

### 3.1 CSS Variable Overrides by Grade
```css
/* K-2 (Ages 5-7) */
[data-grade="K-2"] {
  --base-font-size: 18px;
  --line-height: 1.8;
  --touch-target: 48px;
  --spacing-unit: 20px;
  --border-radius: 16px;
}

/* 3-5 (Ages 8-10) */
[data-grade="3-5"] {
  --base-font-size: 16px;
  --line-height: 1.6;
  --touch-target: 44px;
  --spacing-unit: 16px;
  --border-radius: 12px;
}

/* 6-8 (Ages 11-13) */
[data-grade="6-8"] {
  --base-font-size: 15px;
  --line-height: 1.5;
  --touch-target: 40px;
  --spacing-unit: 14px;
  --border-radius: 8px;
}

/* 9-12 (Ages 14-18) */
[data-grade="9-12"] {
  --base-font-size: 14px;
  --line-height: 1.4;
  --touch-target: 36px;
  --spacing-unit: 12px;
  --border-radius: 6px;
}
```

### 3.2 Component Application
```tsx
// Component automatically adapts based on student grade
const StudentComponent = ({ student }) => {
  return (
    <div data-grade={getGradeRange(student.grade_level)}>
      {/* Content automatically styled for grade level */}
    </div>
  );
};
```

---

## 4. Container Color Schemes

### 4.1 LEARN Container (Purple/Indigo)
```css
.container-learn {
  /* Light Theme */
  --primary: #8b5cf6;
  --secondary: #6366f1;
  --accent: #7c3aed;
  --gradient: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  
  /* Dark Theme */
  --primary-dark: #a78bfa;
  --secondary-dark: #818cf8;
  --accent-dark: #9333ea;
  --gradient-dark: linear-gradient(135deg, #a78bfa 0%, #818cf8 100%);
}
```

### 4.2 EXPERIENCE Container (Teal/Cyan)
```css
.container-experience {
  /* Light Theme */
  --primary: #14b8a6;
  --secondary: #06b6d4;
  --accent: #0891b2;
  --gradient: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%);
  
  /* Dark Theme */
  --primary-dark: #2dd4bf;
  --secondary-dark: #22d3ee;
  --accent-dark: #0ea5e9;
  --gradient-dark: linear-gradient(135deg, #2dd4bf 0%, #22d3ee 100%);
}
```

### 4.3 DISCOVER Container (Magenta/Purple)
```css
.container-discover {
  /* Light Theme */
  --primary: #ec4899;
  --secondary: #a855f7;
  --accent: #d946ef;
  --gradient: linear-gradient(135deg, #ec4899 0%, #a855f7 100%);
  
  /* Dark Theme */
  --primary-dark: #f472b6;
  --secondary-dark: #c084fc;
  --accent-dark: #e879f9;
  --gradient-dark: linear-gradient(135deg, #f472b6 0%, #c084fc 100%);
}
```

---

## 5. Migration Plan

### Phase 1: Foundation (Week 1-2)
1. **Audit existing inline styles**
   - Document all dynamic vs static inline styles
   - Create migration checklist

2. **Standardize MasterTheme.css**
   - Add missing CSS variables
   - Document all variable names and purposes
   - Create variable usage guide

3. **Update ThemeService**
   - Ensure robust persistence
   - Add grade-level detection
   - Implement container theme switching

### Phase 2: Component Migration (Week 3-4)
1. **Convert CSS to Modules**
   - Priority: Question components
   - Convert one component type at a time
   - Test thoroughly after each conversion

2. **Remove Hardcoded Values**
   - Search and replace color values
   - Replace spacing values
   - Update typography values

3. **Implement Grade Adaptations**
   - Add data-grade attributes
   - Test across all grade levels
   - Verify accessibility compliance

### Phase 3: Container Themes (Week 5)
1. **Standardize Container Styles**
   - Ensure consistent structure
   - Apply proper theme variables
   - Test theme switching

2. **Enhanced Loading Screens**
   - Unified loading component
   - Container-specific messages
   - Consistent animations

### Phase 4: Testing & Documentation (Week 6)
1. **Cross-browser Testing**
   - Chrome, Firefox, Safari, Edge
   - Mobile browsers
   - Accessibility tools

2. **Documentation**
   - Component style guide
   - Variable reference
   - Best practices guide

---

## 6. Enforcement Rules

### 6.1 Code Review Checklist
- [ ] No hardcoded color values
- [ ] CSS modules used for component styles
- [ ] MasterTheme variables for all design tokens
- [ ] Grade-level adaptations implemented
- [ ] Theme persistence working
- [ ] Accessibility standards met

### 6.2 Automated Checks
```json
// .eslintrc.json additions
{
  "rules": {
    "no-inline-styles": ["warn", {
      "allowDynamic": true
    }],
    "css-modules-required": "error",
    "hardcoded-colors": "error"
  }
}
```

### 6.3 Style Lint Configuration
```json
// .stylelintrc.json
{
  "rules": {
    "color-no-hex": true,
    "declaration-property-value-allowed-list": {
      "color": ["/var\\(--/"],
      "background-color": ["/var\\(--/"],
      "border-color": ["/var\\(--/"]
    }
  }
}
```

---

## 7. Best Practices

### 7.1 Component Styling
```tsx
// ✅ CORRECT - Clean separation
import styles from './MyComponent.module.css';

const MyComponent = ({ isActive, progress }) => {
  return (
    <div 
      className={`${styles.container} ${isActive ? styles.active : ''}`}
      style={{ '--progress': `${progress}%` }} // Dynamic value only
    >
      <h1 className={styles.title}>Title</h1>
    </div>
  );
};
```

### 7.2 Theme-Aware Components
```tsx
// ✅ CORRECT - Theme-aware
import { useTheme } from '@/hooks/useTheme';
import styles from './ThemeComponent.module.css';

const ThemeComponent = () => {
  const { theme, containerTheme } = useTheme();
  
  return (
    <div 
      className={styles.container}
      data-theme={theme}
      data-container={containerTheme}
    >
      {/* Content automatically themed */}
    </div>
  );
};
```

### 7.3 Responsive Design
```css
/* Mobile-first approach with CSS variables */
.container {
  padding: var(--spacing-2);
  font-size: var(--text-base);
}

@media (min-width: 768px) {
  .container {
    padding: var(--spacing-4);
    font-size: var(--text-lg);
  }
}

@media (min-width: 1024px) {
  .container {
    padding: var(--spacing-6);
  }
}
```

---

## 8. Accessibility Requirements

### 8.1 Color Contrast
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum
- Focus indicators: 3:1 minimum

### 8.2 Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 8.3 Focus Management
```css
/* Consistent focus styles */
:focus-visible {
  outline: 3px solid var(--color-focus);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

---

## 9. Performance Considerations

### 9.1 CSS Loading Strategy
1. **Critical CSS**: Inline in HTML head
2. **Container CSS**: Load per active container
3. **Component CSS**: Bundle with component code
4. **Utility CSS**: Shared chunk

### 9.2 Variable Scoping
```css
/* Global scope - MasterTheme.css */
:root {
  --color-primary: #8b5cf6;
}

/* Container scope */
.container-learn {
  --container-bg: var(--gradient-learn);
}

/* Component scope */
.button {
  --button-height: 48px;
}
```

---

## 10. Success Metrics

### 10.1 Technical Metrics
- Zero hardcoded color values in production
- 100% CSS module adoption for components
- < 50KB total CSS per container
- < 100ms theme switch time

### 10.2 Quality Metrics
- WCAG AA compliance score: 100%
- Lighthouse accessibility score: > 95
- Cross-browser compatibility: 100%
- Grade-level adaptation coverage: 100%

### 10.3 Developer Experience
- Style-related PR comments: < 10%
- CSS-related bugs: < 5% of total
- New component styling time: < 2 hours
- Theme implementation time: < 30 minutes

---

## Appendix A: Variable Reference

See `MasterTheme.css` for complete variable list.

## Appendix B: Migration Checklist

See `STYLE_MIGRATION_CHECKLIST.md` for detailed migration steps.

## Appendix C: Component Examples

See `documentation/examples/styled-components/` for reference implementations.

---

*Last Updated: September 2025*
*Version: 1.0*
*Author: Pathfinity Development Team*