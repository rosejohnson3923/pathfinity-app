# Naming Convention Clarification

## Grade Level Naming

### Database & Services (Backend)
- Use: `grade_level` (snake_case)
- Examples:
  - `profile.grade_level`
  - `student.grade_level`
  - Database column: `grade_level`

### React Component Props (Frontend)
- Use: `gradeLevel` (camelCase)
- This is standard React convention for props
- Examples:
  - `<TwoPanelModal gradeLevel={profile?.grade_level} />`
  - `interface Props { gradeLevel?: string; }`

### The Pattern
```tsx
// Data from backend uses snake_case
const profile = {
  grade_level: '10',
  user_id: 'abc123'
};

// Props to components use camelCase
<GamificationSidebar 
  gradeLevel={profile.grade_level}  // prop name is camelCase, value from snake_case
  userId={profile.user_id}
/>
```

### Why This Is Acceptable
1. Backend/Database typically uses snake_case (SQL convention)
2. Frontend/React typically uses camelCase (JavaScript convention)
3. The transformation happens at the boundary between backend data and frontend props

### What We Fixed
- Removed all hardcoded defaults to 'K' (Kindergarten)
- Ensured all components receive the grade level properly
- Made sure the data flows correctly from `profile.grade_level` to `gradeLevel` prop

### Consistency Rule
- When accessing student/profile data: use `grade_level`
- When defining React props: use `gradeLevel`
- Never use just `grade` anywhere