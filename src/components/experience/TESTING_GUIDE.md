# ExperienceCard Testing Guide

## 🚀 HOW TO TEST THE NEW IMPLEMENTATION

### Step 1: Enable the New Component
Edit `/src/config/experienceConfig.ts`:
```typescript
export const USE_CLEAN_EXPERIENCE = true; // Enable new implementation
```

### Step 2: Test with Different Grade Levels
```typescript
// Test specific grades
export const GRADE_LEVEL_OVERRIDES = {
  'K': true,   // Test Kindergarten with new implementation
  '5': true,   // Test 5th grade
  '9': true,   // Test 9th grade
  // Others remain on old implementation
};
```

### Step 3: Integration Point
To use in AIExperienceContainerV2-UNIFIED.tsx:
```tsx
import { shouldUseCleanExperience } from '../../config/experienceConfig';
import { ExperienceCard } from '../experience/ExperienceCard';
import { BentoExperienceCardV2 } from '../bento/BentoExperienceCardV2';

// In component
const ExperienceComponent = shouldUseCleanExperience(gradeLevel)
  ? ExperienceCard
  : BentoExperienceCardV2;

return <ExperienceComponent {...props} />;
```

## ✅ WHAT TO VERIFY

### Visual Tests:
1. **Theme Switching**: Toggle between light/dark modes
2. **Grade Layouts**:
   - K-2: Simple 2-tile layout
   - 3-8: Standard 3x3 grid
   - 9-12: Complex 4x4 grid
3. **Companion Colors**: Verify each companion has unique header color
4. **Animations**: Check slide-in animations work

### Content Tests:
1. **OpenAI Content**: Displays correctly in designated areas
2. **Challenge Lists**: Properly formatted from AI response
3. **Dynamic Text**: No styling in content, only structure

### Style Verification:
1. **NO Inline Styles**: Inspect elements - should only have classes
2. **CSS Variables**: Only `--progress` or `--width` type custom properties
3. **Responsive**: Test on mobile/tablet/desktop

## 🔍 DEBUGGING

### Check for Style Issues:
```bash
# In browser console
document.querySelectorAll('[style]').forEach(el => {
  if (!el.style.cssText.startsWith('--')) {
    console.error('Inline style found:', el, el.style.cssText);
  }
});
```

### Verify CSS Module Loading:
```bash
# Check if styles are applied
document.querySelector('.container') // Should have styles
```

### OpenAI Content Structure:
```javascript
// Log the AI content being passed
console.log('AI Content:', challengeData.aiGeneratedContent);
```

## 🚨 ROLLBACK IF NEEDED

If issues occur:
1. Set `USE_CLEAN_EXPERIENCE = false` in experienceConfig.ts
2. Component automatically falls back to BentoExperienceCardV2

## 📊 PERFORMANCE METRICS

Compare old vs new:
- Initial render time
- Re-render on theme switch
- Memory usage
- Bundle size

## ✨ SUCCESS CRITERIA

- [ ] NO inline styles except CSS custom properties
- [ ] All content from OpenAI displays correctly
- [ ] Grade-specific layouts apply properly
- [ ] Theme switching works without flicker
- [ ] Animations are smooth
- [ ] No console errors
- [ ] Performance equal or better than old version