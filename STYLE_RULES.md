# PATHFINITY STYLE RULES - MANDATORY

## ❌ ABSOLUTELY FORBIDDEN:

### 1. NO Inline Styles for Static Values
```jsx
// ❌ NEVER DO THIS
<div style={{
  background: 'linear-gradient(...)',
  padding: '20px',
  borderRadius: '8px',
  color: 'var(--gray-900)'
}}>
```

### 2. NO Direct Token Imports in Components
```jsx
// ❌ NEVER DO THIS
import '../../design-system/tokens/colors.css';
```

### 3. NO Style Objects in TSX
```jsx
// ❌ NEVER DO THIS
const styles = {
  container: {
    padding: '20px'
  }
};
```

---

## ✅ REQUIRED APPROACH:

### 1. CSS Modules for ALL Styling
```jsx
// ✅ ALWAYS DO THIS
import styles from './Component.module.css';
<div className={styles.container}>
```

### 2. Dynamic Values via CSS Custom Properties
```jsx
// ✅ ONLY for runtime values
<div
  className={styles.progressBar}
  style={{ '--progress': `${progress}%` }}
>
```

### 3. Conditional Classes, Not Styles
```jsx
// ✅ Use conditional classes
<div className={cn(
  styles.card,
  isActive && styles.cardActive,
  styles[`companion-${companion.id}`]
)}>
```

---

## 📋 OPENAI CONTENT HANDLING:

### Dynamic CONTENT (from OpenAI) vs Dynamic STYLES
```jsx
// ✅ CORRECT - OpenAI content, CSS module styles
<div className={styles.scenarioCard}>
  <h2 className={styles.title}>{aiContent.title}</h2>
  <p className={styles.description}>{aiContent.scenario}</p>
  {aiContent.challenges.map(challenge => (
    <div className={styles.challengeItem}>
      {challenge.description}
    </div>
  ))}
</div>

// ❌ WRONG - Inline styles based on content
<div style={{
  background: companion.id === 'finn' ? 'blue' : 'green'
}}>
```

---

## 🎯 CSS MODULE STRUCTURE:

### Required Imports (in CSS files only)
```css
/* Component.module.css */
@import '../../design-system/tokens/index.css';

.container {
  /* Use tokens */
  padding: var(--space-6);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
}
```

### Grade-Based Layouts
```css
/* Use data attributes for variants */
[data-layout="elementary"] .container {
  grid-template-columns: 1fr;
}

[data-layout="middle"] .container {
  grid-template-columns: repeat(3, 1fr);
}
```

---

## 🚨 ENFORCEMENT:

1. **Code Review:** Reject ANY PR with inline styles
2. **Linting:** ESLint rules to catch violations
3. **Testing:** Tests verify no inline styles exist
4. **AI Instructions:** Claude must follow these rules

---

## 📝 EXCEPTIONS:

Only TWO valid uses for inline styles:
1. Dynamic runtime values (progress, width, position)
2. CSS custom properties for dynamic theming

```jsx
// ✅ ONLY VALID INLINE STYLES
style={{ '--width': `${calculatedWidth}px` }}
style={{ '--progress': `${percentage}%` }}
```

---

## 🔴 VIOLATION CONSEQUENCES:

If these rules are violated:
1. PR will be rejected
2. Code must be refactored
3. Component will not pass tests
4. Style conflicts will occur

---

## 💡 REMEMBER:

**OpenAI provides WHAT to display**
**CSS Modules control HOW it looks**
**Never mix presentation with content**