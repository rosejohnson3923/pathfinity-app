# Width Management Quick Reference

## 🚀 Quick Setup
```typescript
import { usePageCategory } from '@/hooks/usePageCategory';

export function YourComponent() {
  usePageCategory('category-name'); // Pick from table below
  // Your component code...
}
```

## 📊 Category Reference Table

| Category | Max Width | Use For | Example Components |
|----------|-----------|---------|-------------------|
| `'auth'` | Natural (Tailwind) | Login, Signup, Password Reset | `<Login />`, `<Signup />` |
| `'modal'` | 600-1200px | Overlay Dialogs, Popups | `<IntroductionModal />`, `<SettingsModal />` |
| `'dashboard'` | 1400px | Main App Screens | `<StudentDashboard />`, `<TeacherDashboard />` |
| `'content'` | 1400px (1200px inner) | Learning Containers | `<AILearnContainer />`, `<LessonViewer />` |
| `'marketing'` | 1600px | Public Pages | `<Homepage />`, `<AboutUs />`, `<Pricing />` |
| `'utility'` | 1200px | Settings, Admin, Analytics | `<SettingsPage />`, `<AdminPanel />` |

## 🎯 Decision Tree
```
Is it a login/auth screen? → 'auth'
Is it a modal/popup? → 'modal'
Is it the main app? → 'dashboard'
Is it learning content? → 'content'
Is it a public page? → 'marketing'
Is it settings/admin? → 'utility'
```

## 💡 Examples

### Auth Page
```typescript
export function Login() {
  usePageCategory('auth');
  return <div className="max-w-md">...</div>; // Tailwind works naturally
}
```

### Modal
```typescript
export function CareerChoiceModal() {
  usePageCategory('modal');
  return (
    <div className="modal-overlay">
      <div className="modal-content">...</div>
    </div>
  );
}
```

### Dashboard
```typescript
export function StudentDashboard() {
  usePageCategory('dashboard');
  return <div className="dashboard-page">...</div>; // Auto 1400px max
}
```

## 📱 Responsive Breakpoints
- **Desktop (>1024px):** Full category widths apply
- **Tablet (768-1024px):** 100% width with padding
- **Mobile (<768px):** Full width, reduced padding
- **Small Mobile (<480px):** Minimal padding

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Page too wide/narrow | Check category is correct |
| Modal not centered | Use `.modal-overlay` > `.modal-content` structure |
| No constraints applied | Add `usePageCategory()` to component |
| Conflicting styles | Remove inline width styles |

## 🔍 Debug Mode
Add to see category boundaries:
```css
/* In category-width-management.css, uncomment debug section */
```

## 📝 Files
- **Hook:** `src/hooks/usePageCategory.ts`
- **CSS:** `src/styles/category-width-management.css`
- **Docs:** `docs/WIDTH_MANAGEMENT_SYSTEM.md`

---
*Need help? Check the full documentation or ask the frontend team.*