# Pathfinity Style Migration Checklist
## Systematic CSS Modernization Guide

---

## Priority 1: Critical Components (Week 1)

### Question Components
- [ ] `/src/components/questions/QuestionStyles.css`
  - [ ] Convert to CSS module
  - [ ] Replace hardcoded colors with variables
  - [ ] Add grade-level adaptations
  - [ ] Test all 25 question types

- [ ] `/src/services/content/QuestionRenderer.tsx`
  - [ ] Remove inline styles (83 instances)
  - [ ] Create QuestionRenderer.module.css
  - [ ] Implement dynamic styles via CSS variables

### Container Components
- [ ] `/src/components/ai-containers/AILearnContainerV2-UNIFIED.tsx`
  - [ ] Consolidate 11 CSS imports
  - [ ] Create unified module approach
  - [ ] Remove redundant style applications

- [ ] `/src/components/ai-containers/AIExperienceContainerV2-UNIFIED.tsx`
  - [ ] Standardize loading screen styles
  - [ ] Apply container theme variables
  - [ ] Remove hardcoded gradients

- [ ] `/src/components/ai-containers/AIDiscoverContainerV2-UNIFIED.tsx`
  - [ ] Fix magenta theme implementation
  - [ ] Consolidate CSS imports
  - [ ] Apply proper theme variables

---

## Priority 2: Gamification & Progress (Week 2)

### Gamification Components
- [ ] `/src/components/gamification/GamificationSidebar.tsx`
  - [ ] Extract inline progress styles
  - [ ] Create GamificationSidebar.module.css
  - [ ] Implement CSS variable animations

- [ ] `/src/components/gamification/XPDisplay.tsx`
  - [ ] Remove inline color styles
  - [ ] Use theme-based XP colors
  - [ ] Add grade-appropriate sizing

### Progress Components  
- [ ] `/src/components/learning-support/FloatingLearningDock.tsx`
  - [ ] Convert position styles to CSS module
  - [ ] Implement theme-aware dock colors
  - [ ] Add responsive positioning

---

## Priority 3: Navigation & Headers (Week 3)

### Navigation Components
- [ ] `/src/components/ai-containers/ContainerNavigationHeader.tsx`
  - [ ] Already uses module - verify completeness
  - [ ] Add missing grade adaptations
  - [ ] Ensure theme persistence

- [ ] `/src/components/Header.tsx`
  - [ ] Remove any remaining inline styles
  - [ ] Apply MasterTheme variables
  - [ ] Test dark/light theme switching

### Modal Components
- [ ] `/src/components/modals/`
  - [ ] Audit all modal components
  - [ ] Standardize modal styling approach
  - [ ] Implement modal-first guidelines

---

## Priority 4: Admin & Dashboard (Week 4)

### Dashboard Components
- [ ] `/src/screens/modal-migration/StudentDashboard.tsx`
  - [ ] Critical: Theme selection implementation
  - [ ] Ensure theme persistence to localStorage
  - [ ] Apply grade-based layouts

- [ ] `/src/components/dashboards/AdminDashboard.tsx`
  - [ ] Standardize admin theme (neutral)
  - [ ] Remove custom color implementations
  - [ ] Apply consistent spacing

---

## Technical Debt Cleanup (Week 5)

### Archive & Legacy
- [ ] `/src/archive/`
  - [ ] Document which components are still used
  - [ ] Mark deprecated styles for removal
  - [ ] Create migration plan for active components

### Test Files
- [ ] `/src/**/*.test.tsx`
  - [ ] Remove style-dependent tests
  - [ ] Update for CSS module imports
  - [ ] Add visual regression tests

---

## Validation Steps

### For Each Component:

#### 1. Pre-Migration Audit
```bash
# Count inline styles
grep -c "style={{" ComponentName.tsx

# Find hardcoded colors
grep -E "#[0-9a-fA-F]{3,6}" ComponentName.tsx ComponentName.css

# Check CSS imports
grep "import.*\.css" ComponentName.tsx
```

#### 2. Migration Process
```typescript
// Before
<div style={{ 
  backgroundColor: '#8b5cf6', 
  padding: '12px 24px' 
}}>

// After
<div className={styles.container}>
```

```css
/* ComponentName.module.css */
.container {
  background-color: var(--color-primary);
  padding: var(--spacing-3) var(--spacing-6);
}
```

#### 3. Post-Migration Testing
- [ ] Visual regression test passes
- [ ] Theme switching works
- [ ] Grade adaptations apply
- [ ] No console errors
- [ ] Accessibility audit passes

---

## Automated Validation Script

```bash
#!/bin/bash
# style-audit.sh

echo "🔍 Checking for style violations..."

# Check for hardcoded colors
echo "Hardcoded colors:"
grep -r --include="*.tsx" --include="*.css" -E "#[0-9a-fA-F]{3,6}" src/ | grep -v "node_modules" | wc -l

# Check for inline styles
echo "Inline styles:"
grep -r --include="*.tsx" "style={{" src/ | grep -v "node_modules" | wc -l

# Check for non-module CSS imports
echo "Non-module CSS imports:"
grep -r --include="*.tsx" "import.*\.css'" src/ | grep -v ".module.css" | wc -l

# Check for var() usage
echo "CSS variable usage:"
grep -r --include="*.css" "var(--" src/ | wc -l

echo "✅ Audit complete"
```

---

## Definition of Done

### Component Level
- [ ] No hardcoded color values
- [ ] CSS module created and imported
- [ ] All static inline styles removed
- [ ] Theme variables properly applied
- [ ] Grade-level adaptations working
- [ ] Accessibility standards met (WCAG AA)
- [ ] Cross-browser tested
- [ ] Visual regression tests passing

### System Level
- [ ] Theme switching instant (< 100ms)
- [ ] Theme persists across sessions
- [ ] All containers properly themed
- [ ] Grade adaptations consistent
- [ ] No style-related console errors
- [ ] Lighthouse score > 95
- [ ] Bundle size optimized (< 50KB CSS per container)

---

## Common Patterns Reference

### Dynamic Width/Height
```tsx
// Keep as inline (dynamic)
<div style={{ width: `${progress}%` }} />

// Convert to CSS variable
<div 
  className={styles.progressBar}
  style={{ '--progress': `${progress}%` }}
/>
```

```css
.progressBar {
  width: var(--progress);
}
```

### Conditional Classes
```tsx
// Use classnames utility or template literals
<div className={`
  ${styles.container} 
  ${isActive ? styles.active : ''} 
  ${styles[theme]}
`}>
```

### Theme-Aware Styling
```css
/* Light theme (default) */
.container {
  background: var(--bg-primary);
  color: var(--text-primary);
}

/* Dark theme override */
[data-theme="dark"] .container {
  background: var(--bg-primary-dark);
  color: var(--text-primary-dark);
}
```

### Grade-Level Sizing
```css
.button {
  min-height: var(--touch-target);
  font-size: var(--text-base);
  padding: var(--spacing-2) var(--spacing-4);
}

[data-grade="K-2"] .button {
  min-height: 48px;
  font-size: 18px;
}

[data-grade="9-12"] .button {
  min-height: 36px;
  font-size: 14px;
}
```

---

## Resources

- [MasterTheme.css Reference](/src/styles/MasterTheme.css)
- [UI Guidelines v6.0](/documentation/ui-guidelines-6-modal-first.md)
- [CSS Module Examples](/documentation/examples/css-modules/)
- [Theme Service Documentation](/src/services/themeService.ts)

---

## Questions & Support

- Style questions: #frontend-styling channel
- Migration help: Schedule pairing session
- Bug reports: Create issue with `style-migration` label

---

*Last Updated: September 2025*
*Version: 1.0*
*Tracking: JIRA-STYLE-001*