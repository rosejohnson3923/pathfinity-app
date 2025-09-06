# Pathfinity Learning System Architecture

## Table of Contents
1. [Overview](#overview)
2. [Core Concepts](#core-concepts)
3. [System Architecture](#system-architecture)
4. [Data Flow](#data-flow)
5. [Component Hierarchy](#component-hierarchy)
6. [Daily Learning Journey](#daily-learning-journey)
7. [Progression Logic](#progression-logic)
8. [Assessment & Advancement](#assessment--advancement)
9. [Implementation Guide](#implementation-guide)
10. [API Reference](#api-reference)

---

## Overview

The Pathfinity Learning System is a comprehensive, adaptive educational platform that guides students through skill-based learning journeys. The system is entirely data-driven, pulling curriculum from `skillsDataComplete.ts` and adapting to each student's grade level and pace.

### Key Features
- **Grade-Adaptive**: Works seamlessly from Kindergarten through Grade 12
- **Subject Integration**: Covers Math, ELA, Science, and Social Studies
- **Career-Themed**: Learning contextualized through chosen careers
- **AI Companions**: Personalized learning guides (Finn, Spark, Sage, Harmony)
- **Progressive Mastery**: A.1 → A.5 → Review → Assessment → B.1
- **No Hardcoding**: All content dynamically loaded from data files

---

## Core Concepts

### 1. Skill Categories
Skills are organized in categories identified by letter clusters:
- **A.0**: Category header (e.g., "Numbers to 3")
- **A.1-A.5**: Individual skills within the category
- **A.review**: Comprehensive review of all A skills
- **A.assessment**: Final test to advance to B category

### 2. Three-Container Journey
Each skill goes through three learning phases:
```
Learn → Experience → Discover
```
- **Learn**: Foundation building with instruction and practice
- **Experience**: Real-world application of skills
- **Discover**: Creative exploration and problem-solving

### 3. Multi-Subject Integration
Each skill number (e.g., A.1) includes all subjects:
```javascript
A.1 Skills for Kindergarten:
├── Math: "Identify numbers up to 3"
├── ELA: "Find the letter in alphabet: uppercase"
├── Science: "Classify objects by two-dimensional shape"
└── Social Studies: "What is a community?"
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Entry Points                   │
├─────────────────────────────────────────────────────────────┤
│ StudentDashboard → IntroductionModal → DashboardModal        │
│                           ↓                                   │
│              Career & Companion Selection                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  AIThreeContainerOrchestrator                │
│  Manages daily skill progression and container transitions    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   AIThreeContainerJourney                    │
│        Orchestrates Learn → Experience → Discover flow        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  MultiSubjectLearnContainer                  │
│           Cycles through all subjects for a skill            │
├─────────────────────────────────────────────────────────────┤
│  Math → ELA → Science → Social Studies (for skill A.1)       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      AILearnContainer                        │
│         Handles individual subject learning phases           │
├─────────────────────────────────────────────────────────────┤
│  Instruction → Practice (4 questions) → Lesson (5 questions) │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Skill Data Source
```typescript
// skillsDataComplete.ts
export const skillsData: GradeSkills = {
  "Kindergarten": {
    "Math": [
      {
        id: "Math_K_1",
        skillNumber: "A.0",
        skillName: "Numbers to 3",  // Category Header
      },
      {
        id: "Math_K_2", 
        skillNumber: "A.1",
        skillName: "Identify numbers - up to 3",
      }
      // ... more skills
    ],
    "ELA": [...],
    "Science": [...],
    "Social Studies": [...]
  }
}
```

### 2. Skill Progression Service
```typescript
// skillProgressionService.ts
// Determines what student should learn next
const nextAction = getNextLearningAction({
  studentId: "sam123",
  grade: "Kindergarten",
  completedSkills: ["A.1", "A.2"],
  currentCluster: "A.",
  assessmentScores: {}
});
// Returns: { type: 'learn', skillNumber: 'A.3' }
```

### 3. Daily Skills Loading
```typescript
// Get all subjects for today's skill
const todaySkills = getSkillsForDay('Kindergarten', 'A.1');
// Returns:
{
  skillNumber: "A.1",
  categoryName: "Numbers to 3",  // From A.0
  subjects: [
    { subject: "Math", skillName: "Identify numbers - up to 3", ... },
    { subject: "ELA", skillName: "Find the letter in alphabet", ... },
    { subject: "Science", skillName: "Classify by 2D shape", ... },
    { subject: "Social Studies", skillName: "What is a community?", ... }
  ]
}
```

---

## Component Hierarchy

### Primary Components

#### 1. AIThreeContainerOrchestrator
**Location**: `/src/components/containers/AIThreeContainerOrchestrator.tsx`
**Purpose**: Main orchestrator for the learning journey
**Responsibilities**:
- Manages student progress through skills
- Tracks completed journeys
- Handles analytics and reporting

#### 2. AIThreeContainerJourney
**Location**: `/src/components/ai-containers/AIThreeContainerJourney.tsx`
**Purpose**: Manages the three-phase learning flow
**Responsibilities**:
- Transitions between Learn, Experience, and Discover
- Shows journey progress indicators
- Handles container completion events

#### 3. MultiSubjectLearnContainer
**Location**: `/src/components/ai-containers/MultiSubjectLearnContainer.tsx`
**Purpose**: Cycles through all subjects for a skill number
**Responsibilities**:
- Loads subjects from skillsDataComplete
- Manages transitions between subjects
- Aggregates scores across subjects
- Shows progress bar for subject completion

#### 4. AILearnContainer
**Location**: `/src/components/ai-containers/AILearnContainer.tsx`
**Purpose**: Individual subject learning
**Responsibilities**:
- Instruction phase presentation
- Practice questions (4)
- Lesson questions (5)
- Assessment scoring
- AI companion integration

#### 5. ReviewContainer
**Location**: `/src/components/ai-containers/ReviewContainer.tsx`
**Purpose**: Category review before assessment
**Responsibilities**:
- Reviews all skills in category (A.1-A.5)
- Focuses on weak areas
- Provides practice opportunities
- Determines readiness for assessment

#### 6. AssessmentContainer
**Location**: `/src/components/ai-containers/AssessmentContainer.tsx`
**Purpose**: Final category assessment
**Responsibilities**:
- Tests mastery across all subjects
- Calculates pass/fail (80% threshold)
- Awards certificates
- Determines advancement eligibility

### Supporting Services

#### skillProgressionService
**Location**: `/src/services/skillProgressionService.ts`
**Key Functions**:
```typescript
// Get skills for a specific day/number
getSkillsForDay(grade: string, skillNumber: string): DailySkills

// Check if category is complete
isCategoryComplete(grade: string, cluster: string, completedSkills: string[]): boolean

// Determine next learning action
getNextLearningAction(progress: StudentProgress): LearningAction

// Calculate category progress
getCategoryProgress(grade: string, cluster: string, completedSkills: string[]): number
```

---

## Daily Learning Journey

### Monday - Starting Fresh
```
1. System checks student progress
   → No completed skills for week
   → Returns: Learn A.1

2. MultiSubjectLearnContainer loads A.1 for all subjects
   → Math: "Identify numbers up to 3"
   → ELA: "Find the letter in alphabet"
   → Science: "Classify by 2D shape"  
   → Social: "What is a community?"

3. Student completes each subject sequentially
   → Practice (4 questions) + Lesson (5 questions) per subject
   → Companion provides feedback
   → Scores recorded

4. After all subjects complete
   → Move to ExperienceContainer (apply A.1)
   → Then DiscoverContainer (explore A.1)
   → A.1 marked complete
```

### Tuesday-Friday - Progression
```
Tuesday: A.2 (same flow)
Wednesday: A.3
Thursday: A.4
Friday: A.5
```

### After A.5 Complete - Review & Assessment
```
1. System detects all A.1-A.5 complete
   → Triggers ReviewContainer
   
2. Review Phase
   → Reviews all skills across subjects
   → Focuses on areas with scores < 80%
   → Practice questions from each skill
   
3. Assessment Phase
   → Comprehensive test
   → 2-3 questions per subject
   → Mix of difficulties (easy/medium/hard)
   
4. Results
   → Pass (≥80%): Advance to B.1
   → Fail (<80%): Additional practice on weak areas
```

---

## Progression Logic

### State Management
```typescript
interface StudentProgress {
  studentId: string;
  grade: string;
  completedSkills: string[];      // ["A.1", "A.2", ...]
  currentCluster: string;          // "A.", "B.", etc.
  assessmentScores: {
    [cluster: string]: number;     // "A.": 85, "B.": 92
  };
}
```

### Decision Tree
```
getNextLearningAction(progress) →
  ├── Has incomplete skills in current cluster?
  │   └── Yes → Return first incomplete skill
  ├── All skills complete but no review?
  │   └── Yes → Return review for cluster
  ├── Review complete but no assessment?
  │   └── Yes → Return assessment for cluster
  └── Assessment passed?
      ├── Yes → Advance to next cluster (A. → B.)
      └── No → Return to practice weak areas
```

### Adaptive Pacing
- **Standard**: One skill per day
- **Accelerated**: Multiple skills if mastery shown quickly
- **Remedial**: Repeat skills if struggling

---

## Assessment & Advancement

### Review Process
1. **Trigger**: All skills in category complete (A.1-A.5)
2. **Focus**: Weak areas identified by scores < 80%
3. **Format**: Interactive practice with immediate feedback
4. **Duration**: ~10-15 minutes
5. **Output**: Readiness score for assessment

### Assessment Process
1. **Format**: Formal test, no immediate feedback
2. **Questions**: 2-3 per subject, covering all skills
3. **Difficulty**: Progressive (easy → medium → hard)
4. **Passing Score**: 80% or higher
5. **Results**:
   - Pass: Certificate + Advance to next category
   - Fail: Return to targeted practice

### Certificates & Achievements
```typescript
interface Certificate {
  id: string;
  studentId: string;
  cluster: string;        // "A."
  categoryName: string;   // "Numbers to 3"
  score: number;          // 85
  dateEarned: Date;
  skills: string[];       // ["A.1", "A.2", "A.3", "A.4", "A.5"]
}
```

---

## Implementation Guide

### 1. Initial Setup
```typescript
// Entry point in StudentDashboard
const handleStartLearning = () => {
  const progress = getStudentProgress(studentId);
  const nextAction = getNextLearningAction(progress);
  
  if (nextAction.type === 'learn') {
    startLearningJourney(nextAction.skillNumber);
  } else if (nextAction.type === 'review') {
    startReview(nextAction.cluster);
  } else if (nextAction.type === 'assessment') {
    startAssessment(nextAction.cluster);
  }
};
```

### 2. Daily Skill Loading
```typescript
// In AIThreeContainerOrchestrator
const loadDailyContent = async () => {
  const todaySkills = getSkillsForDay(grade, currentSkillNumber);
  
  setAssignment({
    skills: todaySkills.subjects,
    categoryName: todaySkills.categoryName,
    date: new Date()
  });
};
```

### 3. Progress Tracking
```typescript
// After completing a skill
const handleSkillComplete = (skillNumber: string, results: any) => {
  // Update completed skills
  updateStudentProgress({
    completedSkills: [...progress.completedSkills, skillNumber],
    lastCompleted: new Date()
  });
  
  // Check if category complete
  if (isCategoryComplete(grade, currentCluster, completedSkills)) {
    // Trigger review
    navigateToReview(currentCluster);
  } else {
    // Move to next skill
    const nextAction = getNextLearningAction(progress);
    navigateToSkill(nextAction.skillNumber);
  }
};
```

### 4. Career & Companion Integration
```typescript
// Career context passed through all containers
const careerContext = {
  career: "Athlete",          // Selected career
  companion: "Harmony",        // Selected AI companion
  
  // Used for contextualizing content
  generatePrompt: (skill, subject) => {
    return `Create ${subject} content for ${skill} 
            themed around ${career} career 
            with ${companion} as guide`;
  }
};
```

---

## API Reference

### Core Types
```typescript
interface DailySkills {
  skillNumber: string;        // "A.1"
  subjects: Skill[];          // All subjects for this skill
  categoryName: string;       // From A.0 header
}

interface LearningAction {
  type: 'learn' | 'review' | 'assessment' | 'advance';
  skillNumber?: string;       // For 'learn' type
  cluster?: string;           // For 'review'/'assessment' types
  nextCluster?: string;       // For 'advance' type
}

interface SubjectResults {
  skillNumber: string;
  categoryName: string;
  subjectScores: {
    [subject: string]: {
      practiceScore: number;
      assessmentScore: number;
      timeSpent: number;
    };
  };
  overallScore: number;
  completed: boolean;
}

interface ReviewResults {
  cluster: string;
  reviewedSkills: string[];
  strengthAreas: string[];
  improvementAreas: string[];
  readyForAssessment: boolean;
  reviewScore: number;
}

interface AssessmentResults {
  cluster: string;
  passed: boolean;
  score: number;
  subjectScores: { [subject: string]: number };
  nextAction: 'advance' | 'review' | 'practice';
  nextCluster?: string;
  certificateEarned?: string;
}
```

### Service Methods

#### skillProgressionService
```typescript
// Get all skills for a day
getSkillsForDay(grade: string, skillNumber: string): DailySkills | null

// Get skills in a category
getSkillCategory(grade: string, subject: string, cluster: string): SkillCategory | null

// Check category completion
isCategoryComplete(grade: string, cluster: string, completedSkills: string[]): boolean

// Determine next action
getNextLearningAction(progress: StudentProgress): LearningAction

// Calculate progress
getCategoryProgress(grade: string, cluster: string, completedSkills: string[]): number

// Get next cluster
getNextCluster(currentCluster: string): string  // A. → B.

// Visual helpers
formatSkillNumber(skillNumber: string): string  // A.1 → "Skill 1"
getMasteryEmoji(score: number): string         // 95 → "🌟"
getProgressMessage(percent: number, cluster: string): string
```

---

## Testing Checklist

### Unit Tests
- [ ] skillProgressionService functions
- [ ] Data loading from skillsDataComplete
- [ ] Progress calculation logic
- [ ] Assessment scoring

### Integration Tests
- [ ] Complete A.1 journey (all subjects)
- [ ] Subject transitions in MultiSubjectLearnContainer
- [ ] Review triggering after A.5
- [ ] Assessment pass/fail logic
- [ ] Certificate generation

### End-to-End Tests
- [ ] Complete week journey (A.1-A.5)
- [ ] Review and assessment flow
- [ ] Advancement to B.1
- [ ] Failure and retry flow
- [ ] Progress persistence

### Edge Cases
- [ ] Missing skills in data
- [ ] Incomplete subject data
- [ ] Network failures during content generation
- [ ] Progress recovery after interruption

---

## Future Enhancements

### Planned Features
1. **Parent Dashboard**: Track child's progress
2. **Teacher Portal**: Class management and analytics
3. **Offline Mode**: Download content for offline learning
4. **Multiplayer**: Collaborative learning experiences
5. **Advanced Analytics**: ML-powered insights

### Scalability Considerations
1. **Content Caching**: Cache generated AI content
2. **Progressive Loading**: Load skills on-demand
3. **Batch Processing**: Group API calls for efficiency
4. **State Management**: Consider Redux for complex state

### Customization Points
1. **Skill Pacing**: Configurable skills per day
2. **Assessment Threshold**: Adjustable pass percentage
3. **Review Frequency**: Optional mid-week reviews
4. **Subject Order**: Customizable subject sequence

---

## Troubleshooting

### Common Issues

#### Skills Not Loading
```typescript
// Check data availability
const skills = skillProgressionService.getSkillsForDay(grade, skillNumber);
if (!skills) {
  console.error(`No skills found for ${grade} ${skillNumber}`);
  // Check skillsDataComplete.ts for grade/skill existence
}
```

#### Progress Not Saving
```typescript
// Verify progress update
const handleComplete = async (results) => {
  try {
    await updateStudentProgress(results);
    console.log('Progress saved:', results);
  } catch (error) {
    console.error('Failed to save progress:', error);
    // Implement retry logic
  }
};
```

#### Assessment Not Triggering
```typescript
// Debug category completion
const isComplete = isCategoryComplete(grade, cluster, completedSkills);
console.log('Category complete check:', {
  grade,
  cluster,
  completedSkills,
  isComplete
});
```

---

## Contact & Support

For questions or issues with the Learning System Architecture:
- **Documentation**: This file
- **Code Examples**: `/src/examples/`
- **Tests**: `/src/__tests__/`
- **Support**: Create an issue in the repository

---

*Last Updated: January 2025*
*Version: 1.0.0*