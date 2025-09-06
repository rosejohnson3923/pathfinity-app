# Skill Mapping Data Flow Documentation

## Overview
This document outlines the correct data flow for grade, career, and skill mapping throughout the Pathfinity system.

## 1. Grade Detection Flow

### Source of Truth
The grade level comes from two potential sources (in order of priority):
1. **StudentProfile** via `useStudentProfile` hook - uses `grade_level` field
2. **User Auth Data** - uses `grade_level` field from mock/Supabase auth

### Correct Field Name
- **CORRECT**: `grade_level` 
- **INCORRECT**: `grade` (this field doesn't exist in our interfaces)

### Grade Detection Chain
```
User Login
    ↓
AuthService (enriches user with grade_level from mockUsers)
    ↓
StudentDashboard
    ├── Gets grade from: profile?.grade_level || (user as any)?.grade_level || 'K'
    ├── Creates studentProfile object with grade_level
    └── Passes to AICharacterProvider with studentGrade
         ↓
    MultiSubjectContainerAuto
         ├── Receives student prop with grade_level
         └── Uses student.grade_level throughout

```

## 2. Career Flow

### Career Selection Path
```
IntroductionModal (3 random careers)
    ↓
DashboardModal/CareerChoiceModal
    ├── User selects career
    └── Stores in dashboardSelections.career
         ↓
StudentDashboard
    ├── Creates selectedCareerObject
    └── Passes to containers
         ↓
Containers use career for contextualization
```

## 3. Skill Selection Flow

### Skill Mapping by Grade
```
Grade Level → Grade Key Mapping:
- K, 1, 2 → 'Kindergarten'
- 3, 4, 5, 6 → 'Grade 3'  
- 7, 8, 9 → 'Grade 7'
- 10, 11, 12 → 'Grade 10'
```

### Skill Data Structure
```javascript
skillsData[gradeKey][subject] = [
  {
    id: string,
    skillNumber: string,
    skillName: string,
    description: string,
    subject: string,
    grade: string
  }
]
```

### Skill Selection Process
```
MultiSubjectContainerV2
    ├── Gets gradeKey from student.grade_level
    ├── Selects subject (Math, Science, ELA, Social Studies)
    ├── Gets available skills: skillsData[gradeKey][subject]
    └── Uses skillProgressionService.getSkillForSubject()
         ↓
    Passes skill to Learn/Experience/Discover containers
```

## 4. AI Content Generation

### Content Generation Parameters
```javascript
AILearningJourneyService.generateLearningContent({
  student: {
    grade_level: string,  // CORRECT field name
    // NOT grade
  },
  skill: {
    skill_name: string,
    skill_number: string,
    subject: string
  },
  career: string,
  companion: string
})
```

## 5. Question Generation & Display

### Question Types by Grade
- **Kindergarten**: Simple multiple choice, true/false
- **Elementary**: Multiple choice, fill-in-blank, matching
- **Middle School**: All types + short answer
- **High School**: All types + complex reasoning

### Question Structure
```javascript
{
  id: string,
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'matching' | 'short-answer',
  question: string,
  options?: string[],
  correct_answer: string | boolean | string[],
  explanation: string,
  media?: {
    type: 'image' | 'diagram' | 'chart',
    url: string
  }
}
```

## Common Issues & Fixes

### Issue 1: Grade Detection
- **Problem**: Using `profile?.grade` instead of `profile?.grade_level`
- **Fix**: Always use `grade_level` field

### Issue 2: Grade Fallback
- **Problem**: Not checking user auth data for grade
- **Fix**: Use fallback chain: `profile?.grade_level || (user as any)?.grade_level || 'K'`

### Issue 3: Skill Mismatch
- **Problem**: Wrong gradeKey mapping
- **Fix**: Use consistent getGradeKey function

### Issue 4: Career Context Missing
- **Problem**: Career not passed through container chain
- **Fix**: Ensure selectedCareerObject is passed from StudentDashboard

## Testing Checklist

- [ ] Login as different grade users (Sam-K, Jordan-7, Taylor-10)
- [ ] Verify correct grade displays in all components
- [ ] Check career selection persists through containers
- [ ] Confirm skills match grade level
- [ ] Validate question difficulty matches grade
- [ ] Test all question types render correctly

## Key Files to Monitor

1. `/src/screens/modal-migration/StudentDashboard.tsx`
2. `/src/components/ai-containers/MultiSubjectContainerV2.tsx`
3. `/src/components/ai-containers/AILearnContainerV2-UNIFIED.tsx`
4. `/src/services/AILearningJourneyService.ts`
5. `/src/data/skillsDataComplete.ts`