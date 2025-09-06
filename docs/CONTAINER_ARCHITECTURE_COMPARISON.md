# Container Architecture Comparison

## Overview
This document clarifies the difference between two similar-sounding but functionally different container systems in the Pathfinity application.

---

## 1. MultiSubjectContainer (Existing Architecture)

**File**: `/src/components/ai-containers/MultiSubjectContainer.tsx`  
**Status**: Currently in production use  
**Purpose**: Wraps ANY container type (Learn/Experience/Discover) to ensure all subjects are completed

### How It Works
```
MultiSubjectContainer
  ├── Wraps around existing containers
  ├── Cycles through: Math → ELA → Science → Social Studies
  └── For each subject, renders:
      ├── AILearnContainer (if type='LEARN')
      ├── AIExperienceContainer (if type='EXPERIENCE')  
      └── AIDiscoverContainer (if type='DISCOVER')
```

### Usage Example
```typescript
<MultiSubjectContainer
  containerType="LEARN"  // or "EXPERIENCE" or "DISCOVER"
  student={student}
  selectedCharacter="harmony"
  selectedCareer={career}
  onComplete={handleComplete}
/>
```

### Progress Tracking
- Uses `skillProgressionService.getProgress()` to track current skill group (A.1, B.1, etc.)
- Marks skills completed via `skillProgressionService.markSkillCompleted()`
- Checks for group completion with `checkForGroupCompletion()`

---

## 2. SkillProgressionContainer (New Architecture)

**File**: `/src/components/ai-containers/SkillProgressionContainer.tsx`  
**Status**: New implementation for enhanced learning system  
**Purpose**: Part of the new A.1-A.5 → Review → Assessment → B.1 progression system

### How It Works
```
SkillProgressionContainer
  ├── Loads skills from skillsDataComplete.ts for a specific skill number
  ├── Manages progression through all subjects for ONE skill (e.g., A.1)
  └── Designed to work with:
      ├── ReviewContainer (after A.1-A.5 complete)
      └── AssessmentContainer (final test before advancing)
```

### Usage Example
```typescript
<SkillProgressionContainer
  student={student}
  skillNumber="A.1"  // Specific skill number
  selectedCharacter="harmony"
  selectedCareer={career}
  onComplete={handleSkillComplete}
/>
```

### New Features
- Pulls skills dynamically from `skillsDataComplete.ts`
- Tracks category headers (A.0) and skills (A.1-A.5)
- Integrates with Review and Assessment workflow
- Supports certificate generation
- 80% assessment threshold for advancement

---

## Key Differences

| Aspect | MultiSubjectContainer | SkillProgressionContainer |
|--------|----------------------|---------------------------|
| **Purpose** | Wrap existing containers | New skill progression system |
| **Scope** | Any container type | Specifically for skill learning |
| **Integration** | Works with current flow | Works with Review/Assessment |
| **Data Source** | Uses existing skill structure | Uses skillsDataComplete.ts |
| **Progress** | Tracks via localStorage | Full category progression |
| **Architecture** | Adapter pattern | Core learning component |

---

## When to Use Which?

### Use MultiSubjectContainer when:
- Working with the existing three-container journey (Learn → Experience → Discover)
- Need to ensure all subjects are covered for any container type
- Maintaining backward compatibility with current system

### Use SkillProgressionContainer when:
- Implementing the new skill-based progression system
- Need Review and Assessment integration
- Building the A.1-A.5 → Review → Assessment flow
- Working with the new learning architecture

---

## Migration Path

Currently both containers coexist to ensure:
1. **No Breaking Changes**: Existing flows continue to work
2. **Gradual Migration**: New features can be tested independently
3. **Flexibility**: Can switch between architectures as needed

### Future Consolidation
Once the new architecture is proven and stable:
1. Migrate existing flows to use SkillProgressionContainer
2. Deprecate MultiSubjectContainer
3. Unify the learning experience

---

## Technical Integration

### Shared Services
Both containers use `skillProgressionService` but different methods:

**MultiSubjectContainer uses:**
- `getProgress()`
- `getSkillForSubject()`
- `markSkillCompleted()`
- `checkForGroupCompletion()`
- `getProgressSummary()`

**SkillProgressionContainer uses:**
- `getSkillsForDay()`
- `isCategoryComplete()`
- `getNextLearningAction()`
- `getCategoryProgress()`

### Backward Compatibility
The `skillProgressionService` has been updated to support both architectures through:
- Legacy methods for MultiSubjectContainer
- New methods for SkillProgressionContainer
- Shared utility functions

---

## Summary

- **MultiSubjectContainer**: Current production wrapper for existing containers
- **SkillProgressionContainer**: New architecture for enhanced skill progression
- Both can coexist during transition period
- Clear migration path defined
- No breaking changes to existing functionality

---

*Last Updated: January 2025*