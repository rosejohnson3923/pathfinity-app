# Developer Quick Reference - Learning System

## Quick Start

### 1. Understanding the Flow
```
Student → Career Selection → Companion Selection → Daily Learning → Review → Assessment → Advance
```

### 2. Key Files to Know
```
/src/data/skillsDataComplete.ts           # All curriculum data
/src/services/skillProgressionService.ts  # Progression logic
/src/components/ai-containers/
  ├── MultiSubjectLearnContainer.tsx      # Cycles through subjects
  ├── AILearnContainer.tsx                # Individual subject learning
  ├── ReviewContainer.tsx                 # Category review
  └── AssessmentContainer.tsx             # Final testing
```

---

## Common Tasks

### Get Today's Skills
```typescript
import { skillProgressionService } from '../services/skillProgressionService';

// Get all subjects for a skill number
const todaySkills = skillProgressionService.getSkillsForDay('Kindergarten', 'A.1');
console.log(todaySkills);
// Output: { 
//   skillNumber: 'A.1',
//   subjects: [Math, ELA, Science, Social Studies],
//   categoryName: 'Numbers to 3'
// }
```

### Check Student Progress
```typescript
// Determine what student should do next
const progress = {
  studentId: 'sam123',
  grade: 'Kindergarten',
  completedSkills: ['A.1', 'A.2'],
  currentCluster: 'A.',
  assessmentScores: {}
};

const nextAction = skillProgressionService.getNextLearningAction(progress);
// Returns: { type: 'learn', skillNumber: 'A.3' }
```

### Start Learning Journey
```typescript
// In your component
const startLearning = () => {
  return (
    <AIThreeContainerOrchestrator
      assignment={{
        skills: todaySkills.subjects,
        date: new Date()
      }}
      studentName="Sam"
      gradeLevel="Kindergarten"
      studentId="sam123"
      onComplete={handleComplete}
      onExit={handleExit}
    />
  );
};
```

---

## Component Props Reference

### MultiSubjectLearnContainer
```typescript
interface Props {
  student: StudentProfile;      // Student info
  skillNumber: string;          // "A.1", "A.2", etc.
  selectedCharacter?: string;   // "Harmony", "Finn", etc.
  selectedCareer?: any;         // Career object
  onComplete: (results) => void;
  onBack?: () => void;
}
```

### ReviewContainer
```typescript
interface Props {
  studentId: string;
  grade: string;
  cluster: string;              // "A.", "B.", etc.
  career: string;
  companion: string;
  completedSkills: string[];    // ["A.1", "A.2", ...]
  weakAreas?: Array;            // Areas needing review
  onComplete: (results) => void;
}
```

### AssessmentContainer
```typescript
interface Props {
  studentId: string;
  grade: string;
  cluster: string;              // "A.", "B.", etc.
  career: string;
  companion: string;
  completedSkills: string[];
  onComplete: (results) => void;
}
```

---

## Data Structures

### Skill Structure (from skillsDataComplete.ts)
```typescript
{
  id: "Math_K_2",
  subject: "Math",
  grade: "Kindergarten",
  skillsArea: "Math Foundations",
  skillCluster: "A.",
  skillNumber: "A.1",
  skillName: "Identify numbers - up to 3",
  description: "A. A.1: Identify numbers - up to 3"
}
```

### Daily Skills Response
```typescript
{
  skillNumber: "A.1",
  categoryName: "Numbers to 3",    // From A.0 header
  subjects: [
    { subject: "Math", skillName: "Identify numbers", ... },
    { subject: "ELA", skillName: "Find letters", ... },
    { subject: "Science", skillName: "Classify shapes", ... },
    { subject: "Social Studies", skillName: "What is community", ... }
  ]
}
```

### Learning Action Types
```typescript
type LearningAction = 
  | { type: 'learn'; skillNumber: string; }      // Learn new skill
  | { type: 'review'; cluster: string; }         // Review category
  | { type: 'assessment'; cluster: string; }     // Take assessment
  | { type: 'advance'; nextCluster: string; };   // Move to next category
```

---

## State Management Patterns

### Progress Tracking
```typescript
// Local state in component
const [completedSkills, setCompletedSkills] = useState<string[]>([]);

// After skill completion
const handleSkillComplete = (skillNumber: string) => {
  setCompletedSkills(prev => [...prev, skillNumber]);
  
  // Check if category complete
  if (skillProgressionService.isCategoryComplete(grade, cluster, completedSkills)) {
    // Trigger review
    setPhase('review');
  }
};
```

### Subject Cycling
```typescript
// In MultiSubjectLearnContainer
const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);
const subjects = todaySkills.subjects;

const handleSubjectComplete = () => {
  if (currentSubjectIndex < subjects.length - 1) {
    // Next subject
    setCurrentSubjectIndex(prev => prev + 1);
  } else {
    // All subjects done
    onComplete(results);
  }
};
```

---

## API Calls & Services

### AI Content Generation
```typescript
// Generate content for a skill
const content = await aiLearningJourneyService.generateLearnContent(
  skill,      // Skill object
  student,    // Student profile
  career      // Selected career
);
```

### Analytics Tracking
```typescript
// Track skill completion
unifiedLearningAnalyticsService.trackEvent('skill_complete', {
  studentId,
  skillNumber: 'A.1',
  score: 85,
  timeSpent: 1200000,  // milliseconds
  career: 'Athlete',
  companion: 'Harmony'
});
```

### Companion Reactions
```typescript
// Get companion reaction for event
const reaction = companionReactionService.getCompanionReaction(
  'correct_answer',     // Event type
  'harmony',           // Companion ID
  { 
    career: 'Athlete',
    skill: 'A.1'
  }
);
// Returns: { message: "Great job!", emotion: "happy" }
```

---

## Testing Snippets

### Test Skill Loading
```typescript
// In browser console
const service = require('./services/skillProgressionService').default;
const skills = service.getSkillsForDay('Kindergarten', 'A.1');
console.table(skills.subjects);
```

### Test Progress Flow
```typescript
// Simulate student progress
const testProgress = {
  studentId: 'test',
  grade: 'Kindergarten',
  completedSkills: ['A.1', 'A.2', 'A.3', 'A.4', 'A.5'],
  currentCluster: 'A.',
  assessmentScores: {}
};

const action = skillProgressionService.getNextLearningAction(testProgress);
console.log(action); // Should return: { type: 'review', cluster: 'A.' }
```

### Test Component Rendering
```typescript
// Test individual container
<MultiSubjectLearnContainer
  student={{ id: 'test', grade_level: 'Kindergarten' }}
  skillNumber="A.1"
  selectedCharacter="Harmony"
  selectedCareer={{ name: 'Athlete' }}
  onComplete={(results) => console.log('Complete:', results)}
/>
```

---

## Debugging Tips

### 1. Check Data Loading
```typescript
console.log('Available grades:', Object.keys(skillsData));
console.log('Kindergarten subjects:', Object.keys(skillsData['Kindergarten']));
console.log('Math skills:', skillsData['Kindergarten']['Math'].length);
```

### 2. Track Component Flow
```typescript
// Add to components
useEffect(() => {
  console.log(`[${componentName}] Mounted with props:`, props);
  return () => console.log(`[${componentName}] Unmounted`);
}, []);
```

### 3. Monitor State Changes
```typescript
useEffect(() => {
  console.log('Phase changed:', phase);
}, [phase]);

useEffect(() => {
  console.log('Current subject:', subjects[currentSubjectIndex]);
}, [currentSubjectIndex]);
```

### 4. Verify Skill Progression
```typescript
// Check what's next for student
const debugProgress = () => {
  const action = getNextLearningAction(studentProgress);
  console.log('Next action:', action);
  console.log('Category complete?', isCategoryComplete(grade, cluster, completed));
  console.log('Progress %:', getCategoryProgress(grade, cluster, completed));
};
```

---

## Common Issues & Solutions

### Issue: Skills not loading
```typescript
// Solution: Check grade name matches exactly
const validGrades = Object.keys(skillsData);
console.log('Valid grades:', validGrades);
// Must match: "Kindergarten", not "K" or "kindergarten"
```

### Issue: Subject not cycling
```typescript
// Solution: Ensure onComplete is called
const handleSubjectComplete = (success: boolean) => {
  console.log('Subject complete called:', success);
  // Must call this to trigger next subject
  onComplete(success);
};
```

### Issue: Review not triggering
```typescript
// Solution: Check all skills are marked complete
const checkReview = () => {
  const complete = ['A.1', 'A.2', 'A.3', 'A.4', 'A.5'];
  const isReady = complete.every(skill => 
    completedSkills.includes(skill)
  );
  console.log('Ready for review?', isReady);
};
```

### Issue: Assessment not passing
```typescript
// Solution: Check scoring calculation
const debugScore = (answers, questions) => {
  const correct = answers.filter((a, i) => 
    a === questions[i].correctAnswer
  ).length;
  const percentage = (correct / questions.length) * 100;
  console.log(`Score: ${correct}/${questions.length} = ${percentage}%`);
  console.log('Pass threshold: 80%');
};
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_AI_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_ENABLE_LOGGING=true
NEXT_PUBLIC_MOCK_AI_RESPONSES=false
```

---

## Useful Commands

```bash
# Run development server
npm run dev

# Run tests
npm test

# Test specific component
npm test MultiSubjectLearnContainer

# Build for production
npm run build

# Analyze bundle size
npm run analyze

# Type checking
npm run type-check

# Lint code
npm run lint
```

---

## Quick Component Template

```typescript
// NewContainer.tsx template
import React, { useState, useEffect } from 'react';
import { skillProgressionService } from '../../services/skillProgressionService';
import { useTheme } from '../../hooks/useTheme';
import './NewContainer.css';

interface NewContainerProps {
  studentId: string;
  grade: string;
  skillNumber: string;
  onComplete: (results: any) => void;
}

export const NewContainer: React.FC<NewContainerProps> = ({
  studentId,
  grade,
  skillNumber,
  onComplete
}) => {
  const theme = useTheme();
  const [phase, setPhase] = useState<'loading' | 'active' | 'complete'>('loading');
  
  useEffect(() => {
    // Load skills
    const skills = skillProgressionService.getSkillsForDay(grade, skillNumber);
    console.log('Loaded skills:', skills);
    setPhase('active');
  }, [grade, skillNumber]);
  
  const handleComplete = () => {
    onComplete({ success: true });
  };
  
  return (
    <div className={`new-container ${phase}`} data-theme={theme}>
      {/* Your UI here */}
    </div>
  );
};

export default NewContainer;
```

---

*This quick reference provides the essential information needed to work with the learning system. For detailed documentation, see LEARNING_SYSTEM_ARCHITECTURE.md*