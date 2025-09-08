# Design System Migration Guide

## Overview
This guide shows how to gradually migrate from the current mixed styling approach to a clean, token-based design system.

## The Problem We're Solving

### Current Issues:
1. **Multiple Theme Systems** - Components use different theme approaches:
   - `data-theme="dark"` attributes
   - `.theme-dark` / `.theme-light` classes  
   - `darkTheme` / `lightTheme` from CSS modules
   - Inline styles overriding everything

2. **Style Conflicts** - Constant battles between:
   - CSS modules vs global CSS
   - Inline styles vs CSS classes
   - Component styles vs container styles

3. **Maintenance Nightmare**:
   - Changes get reverted
   - Hard to debug specificity issues
   - No single source of truth

## The Solution: Token-Based Design System

### Core Principles:
1. **Single Source of Truth** - All values come from design tokens
2. **No Hardcoded Values** - Everything references tokens
3. **Predictable Cascade** - Clear specificity hierarchy
4. **Theme Agnostic** - Components don't know about themes

## Migration Strategy

### Phase 1: Foundation (DONE ✅)
```
src/design-system/
├── tokens/
│   ├── colors.css      # Color tokens
│   ├── spacing.css     # Spacing scale
│   ├── layout.css      # Widths & breakpoints
│   ├── typography.css  # Font system
│   └── effects.css     # Shadows & transitions
└── components/
    ├── base.css        # Base utilities
    └── containers.css  # Container system
```

### Phase 2: Component Migration

#### Step 1: Import Tokens
```tsx
// OLD - Mixed imports
import styles from './Component.module.css';
import './Component.css';
import { useTheme } from '@/contexts/ThemeContext';

// NEW - Clean imports
import '@/design-system/tokens/colors.css';
import '@/design-system/tokens/spacing.css';
import './Component.css'; // Component-specific styles
```

#### Step 2: Remove Inline Styles
```tsx
// OLD - Inline styles
<div style={{
  background: theme === 'dark' ? '#1a1a1a' : '#ffffff',
  padding: '24px',
  borderRadius: '16px'
}}>

// NEW - CSS classes only
<div className="card">
```

#### Step 3: Use Design Tokens
```css
/* OLD - Hardcoded values */
.card {
  background: #ffffff;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.dark .card {
  background: #1a1a1a;
}

/* NEW - Token-based */
.card {
  background: var(--color-bg-elevated);
  padding: var(--space-6);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-current-sm);
}
```

## Migration Checklist

### For Each Component:

- [ ] Remove all inline styles
- [ ] Replace hardcoded colors with tokens
- [ ] Replace hardcoded spacing with tokens
- [ ] Replace hardcoded widths with tokens
- [ ] Remove theme prop/context usage
- [ ] Consolidate CSS (modules → single file)
- [ ] Use BEM naming for classes
- [ ] Test in both light/dark themes

## Example Migration

See `/src/design-system/examples/BentoCard-migrated.tsx` for a complete before/after example.

### Before:
- 3 different style sources
- Theme logic in component
- Inline style calculations
- Hardcoded values everywhere

### After:
- Single CSS file
- No theme logic needed
- All values from tokens
- Automatic theme switching

## Benefits

1. **Consistency** - Every component uses same values
2. **Maintainability** - Change once, update everywhere
3. **Performance** - Less runtime calculations
4. **Developer Experience** - Clear, predictable styling
5. **No Reversions** - Changes stick because they're isolated

## Gradual Adoption

You don't need to migrate everything at once:

1. Start with new components
2. Migrate problem components (like BentoExperienceCard)
3. Update containers one at a time
4. Leave working components until later

## Quick Start for New Components

```tsx
// NewComponent.tsx
import React from 'react';
import '@/design-system/tokens/colors.css';
import '@/design-system/components/base.css';
import './NewComponent.css';

export const NewComponent: React.FC = () => {
  return (
    <div className="new-component card">
      <h2 className="text-2xl font-semibold">Title</h2>
      <p className="text-secondary">Description</p>
      <button className="btn btn-primary">Action</button>
    </div>
  );
};
```

```css
/* NewComponent.css */
.new-component {
  /* All values from tokens */
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
```

## Common Patterns

### Container with Theme
```css
.container-learn {
  background: var(--color-container-learn);
  padding: var(--space-8);
  min-height: 100vh;
}
```

### Card with Hover
```css
.card {
  background: var(--color-bg-elevated);
  padding: var(--space-6);
  border-radius: var(--radius-card);
  transition: var(--transition-shadow);
}

.card:hover {
  box-shadow: var(--shadow-current-md);
}
```

### Responsive Grid
```css
.grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(auto-fit, minmax(var(--width-card-min), 1fr));
}
```

## FAQ

**Q: What about existing CSS modules?**
A: Keep them working for now. Migrate gradually as needed.

**Q: How do we handle dynamic styles?**
A: Use CSS classes with modifiers instead of inline styles.

**Q: What about third-party components?**
A: Wrap them and override styles using tokens where possible.

**Q: Can we still use Tailwind/other frameworks?**
A: Yes, but prefer tokens for consistency.

## Next Steps

1. Review the token files in `/src/design-system/tokens/`
2. Look at the example migration in `/src/design-system/examples/`
3. Start with one problem component
4. Test thoroughly in both themes
5. Document any new patterns you create