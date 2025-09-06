# Category-Based Width Management System

## Overview
This document describes the category-based width management system used in the Pathfinity application. Instead of fixing width issues on individual pages, we use a systematic approach where pages are categorized and width constraints are applied at the category level.

## Quick Start for Developers

### 1. Import the Hook
```typescript
import { usePageCategory } from '@/hooks/usePageCategory';
```

### 2. Use in Your Component
```typescript
export function YourComponent() {
  // Declare the page category
  usePageCategory('dashboard'); // Options: 'auth', 'modal', 'dashboard', 'content', 'marketing', 'utility'
  
  // Rest of your component...
}
```

That's it! Your component will automatically receive the appropriate width constraints.

## Page Categories

### 1. AUTH Pages (`'auth'`)
**Width:** Natural Tailwind sizing (e.g., `max-w-md`, `max-w-sm`)
**Use for:** 
- Login screens
- Signup forms
- Password reset pages
- Two-factor authentication
- Any authentication-related screens

**Example:**
```typescript
export function Login() {
  usePageCategory('auth');
  
  return (
    <div className="max-w-md w-full"> {/* Tailwind classes work naturally */}
      {/* Login form */}
    </div>
  );
}
```

### 2. MODAL Overlays (`'modal'`)
**Width:** 
- Small modals: max 600px
- Standard modals: max 800px
- Large modals: max 1200px
**Use for:**
- Introduction modals
- Settings modals
- Career choice modals
- Any overlay dialogs
- Confirmation dialogs

**Example:**
```typescript
export const IntroductionModal = ({ onComplete }) => {
  usePageCategory('modal');
  
  return (
    <div className="modal-overlay"> {/* Full viewport backdrop */}
      <div className="modal-content"> {/* Centered, constrained content */}
        {/* Modal content */}
      </div>
    </div>
  );
}
```

### 3. DASHBOARD Pages (`'dashboard'`)
**Width:** Max 1400px (best practice for content readability)
**Use for:**
- Student dashboards
- Teacher dashboards
- Admin dashboards
- Main application screens
- Dashboard home pages

**Example:**
```typescript
export function StudentDashboard() {
  usePageCategory('dashboard');
  
  return (
    <div className="dashboard-page"> {/* Automatically constrained to 1400px */}
      {/* Dashboard content */}
    </div>
  );
}
```

### 4. CONTENT Containers (`'content'`)
**Width:** Max 1400px with inner content at 1200px
**Use for:**
- AI Learning containers
- Experience containers
- Discover containers
- Educational content pages
- Lesson viewers
- Assignment players

**Example:**
```typescript
export function AILearnContainer() {
  usePageCategory('content');
  
  return (
    <div className="ai-container"> {/* Max 1400px */}
      <div className="content"> {/* Inner content max 1200px */}
        {/* Learning content */}
      </div>
    </div>
  );
}
```

### 5. MARKETING Pages (`'marketing'`)
**Width:** Max 1600px (wider for visual impact)
**Use for:**
- Homepage/Landing pages
- About us
- Pricing pages
- Feature pages
- Contact pages
- Any public-facing marketing content

**Example:**
```typescript
export function Homepage() {
  usePageCategory('marketing');
  
  return (
    <div className="marketing-page">
      <section className="hero-section"> {/* Can be full width */}
        {/* Hero content */}
      </section>
      <section> {/* Regular sections constrained to 1200px */}
        {/* Content sections */}
      </section>
    </div>
  );
}
```

### 6. UTILITY Pages (`'utility'`)
**Width:** Max 1200px (compact for focused tasks)
**Use for:**
- Settings pages
- Profile pages
- Analytics dashboards
- Admin panels
- System configuration
- Reports and exports

**Example:**
```typescript
export function SettingsPage() {
  usePageCategory('utility');
  
  return (
    <div className="settings-page"> {/* Max 1200px */}
      {/* Settings forms */}
    </div>
  );
}
```

## File Structure

```
src/
├── styles/
│   ├── category-width-management.css  # Main CSS with category rules
│   └── global-width-fix.css          # (deprecated - replaced by category system)
├── hooks/
│   └── usePageCategory.ts            # React hook for setting categories
└── main.tsx                           # Imports category-width-management.css
```

## How It Works

### 1. CSS Layer (`category-width-management.css`)
The CSS file defines width constraints for each category using:
- Data attributes: `[data-page-category="dashboard"]`
- Class selectors: `.dashboard-page`
- Component patterns: `[class*="Dashboard"]`

### 2. React Hook (`usePageCategory`)
The hook:
1. Sets `data-page-category` attribute on the page container
2. Adds corresponding class (e.g., `dashboard-page`)
3. Cleans up on unmount
4. Handles React rendering delays

### 3. Automatic Detection
The system includes fallback patterns to catch components even without the hook:
- Components with "Dashboard" in the class get dashboard constraints
- Components with "Modal" in the class get modal treatment
- Components with "Login" or "Auth" get auth treatment

## Responsive Behavior

### Desktop (>1024px)
- All categories use their defined max-widths
- Content is centered with appropriate margins

### Tablet (768px - 1024px)
```css
- Dashboards: 100% width with 16px padding
- Modals: 95vw max-width
- Marketing: 100% width
```

### Mobile (<768px)
```css
- All categories: 100% width with 12px padding
- Modals: Full screen (100vw)
- Progress headers: Full width, no transform
```

### Small Mobile (<480px)
```css
- Reduced padding: 8px
- Compact headers and controls
```

## Common Issues & Solutions

### Issue: Page is too wide/narrow
**Solution:** Check you're using the correct category:
```typescript
// Wrong - auth pages are narrow
usePageCategory('auth'); // for a dashboard

// Right - dashboards get 1400px max
usePageCategory('dashboard');
```

### Issue: Modal not centered
**Solution:** Ensure modal structure:
```typescript
<div className="modal-overlay">  {/* Full viewport */}
  <div className="modal-content"> {/* Centered content */}
    {/* Your modal */}
  </div>
</div>
```

### Issue: New page has no constraints
**Solution:** Add the hook to your component:
```typescript
usePageCategory('dashboard'); // or appropriate category
```

### Issue: Marketing page content too wide
**Solution:** Use section constraints:
```html
<section> <!-- Automatically constrained to 1200px -->
  <div className="content">
    <!-- Your content -->
  </div>
</section>
```

## Adding New Categories

If you need a new category:

1. **Update the TypeScript type** in `usePageCategory.ts`:
```typescript
export type PageCategory = 
  | 'auth'
  | 'modal'
  | 'dashboard'
  | 'content'
  | 'marketing'
  | 'utility'
  | 'your-new-category'; // Add here
```

2. **Add CSS rules** in `category-width-management.css`:
```css
/* CATEGORY 7: YOUR NEW CATEGORY */
[data-page-category="your-new-category"],
.your-new-category-page {
  width: 100% !important;
  max-width: YOUR_MAX_WIDTH !important;
  margin: 0 auto !important;
  /* Your specific rules */
}
```

3. **Update the cleanup function** in `usePageCategory.ts`:
```typescript
targetElement.classList.remove(
  'auth-page',
  'modal-page',
  // ... other categories
  'your-new-category-page' // Add here
);
```

## Migration Guide

### From Old System (global-width-fix.css)
1. Remove any inline width styles
2. Remove component-specific width CSS
3. Add `usePageCategory()` to your component
4. Let the category system handle widths

### Example Migration:
```typescript
// Before
export function MyDashboard() {
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Content */}
    </div>
  );
}

// After
export function MyDashboard() {
  usePageCategory('dashboard');
  
  return (
    <div className="dashboard-page">
      {/* Content */}
    </div>
  );
}
```

## Testing Your Implementation

### Visual Check
1. Open your component in the browser
2. Open DevTools
3. Look for `data-page-category` attribute on the container
4. Verify the width constraints are applied

### Debug Mode
Uncomment the debug helpers in `category-width-management.css`:
```css
/* Shows red outline and category label */
[data-page-category] {
  outline: 2px dashed red !important;
}

[data-page-category]::before {
  content: "Category: " attr(data-page-category);
  /* ... rest of debug styles */
}
```

## Best Practices

### DO ✅
- Always use `usePageCategory()` in new components
- Choose the most appropriate category
- Use semantic HTML structure (header, main, section, etc.)
- Test responsive behavior at different breakpoints
- Keep modal content within recommended max-widths

### DON'T ❌
- Don't add inline width styles that conflict with categories
- Don't create component-specific width fixes
- Don't forget to add the hook to new pages
- Don't mix categories (a page should be one category)
- Don't override category constraints without good reason

## Support

If you encounter issues with the width management system:
1. Check this documentation first
2. Verify you're using the correct category
3. Check for conflicting CSS or inline styles
4. Review the responsive breakpoints
5. Contact the frontend team lead if issues persist

## Changelog

### Version 2.0.0 (Current)
- Replaced individual page fixes with category system
- Added 6 core categories
- Implemented `usePageCategory` hook
- Added responsive breakpoints
- Created comprehensive documentation

### Version 1.0.0 (Deprecated)
- Used `global-width-fix.css`
- Individual page targeting
- Manual width constraints