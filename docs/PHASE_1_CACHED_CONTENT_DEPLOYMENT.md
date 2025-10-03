# Phase 1: Cached Content Deployment

**Version**: 1.0
**Date**: 2025-10-02
**Status**: Planning
**Purpose**: Deploy direct cache access for microschool demo users to fix production API failures

## Executive Summary

Phase 1 implements direct cache access for Zara/Alexis/David/Mike demo users to resolve production Azure API failures. These users currently have rich content generated in development using `DemonstrativeMasterNarrativeGenerator`, but production attempts to regenerate content using `MasterNarrativeGenerator` which fails due to missing Azure API keys.

**Solution**: Route these 4 users to load lesson plans directly from `demoUserCache.json` instead of attempting any content generation.

## Problem Statement

### Current State (Broken)
```
Production Flow:
Demo User Login → DailyLessonPlanPage → lessonOrchestrator.generateDailyLessons()
  → MasterNarrativeGenerator → Azure APIs → FAIL (No API keys)
```

### Development State (Working)
```
Development Flow:
Demo User Login → Cached Content → demoUserCache.json → Success
```

### Target State (Phase 1)
```
Production Flow:
Demo User Login → Cache Detection → demoUserCache.json → Success
```

## Scope

### Users Affected by Phase 1
- **Zara Jones** (`zara.jones@newfrontier.pathfinity.edu`)
- **Alexis Martin** (`alexis.martin@newfrontier.pathfinity.edu`)
- **David Brown** (`david.brown@newfrontier.pathfinity.edu`)
- **Mike Johnson** (`mike.johnson@newfrontier.pathfinity.edu`)

### Users NOT Affected (Remain Unchanged)
- **Live Demo Users**: Sam Brown, Alex Davis, Jordan Smith, Taylor Johnson (continue using live APIs)
- **Teacher Dashboard Users**: Samantha Johnson (uses content from Zara/Alexis/David/Mike)

## Technical Implementation

### 1. Cache Detection Logic

Create user detection function to identify cached demo users:

```typescript
// File: src/utils/cacheUserDetection.ts
const CACHED_DEMO_USERS = [
  'zara.jones@newfrontier.pathfinity.edu',
  'alexis.martin@newfrontier.pathfinity.edu',
  'david.brown@newfrontier.pathfinity.edu',
  'mike.johnson@newfrontier.pathfinity.edu'
];

export function shouldUseCachedContent(userEmail?: string, userName?: string): boolean {
  // Check by email
  if (userEmail && CACHED_DEMO_USERS.includes(userEmail.toLowerCase())) {
    return true;
  }

  // Check by name (backup method)
  const nameEmailMap = {
    'Zara Jones': 'zara.jones@newfrontier.pathfinity.edu',
    'Alexis Martin': 'alexis.martin@newfrontier.pathfinity.edu',
    'David Brown': 'david.brown@newfrontier.pathfinity.edu',
    'Mike Johnson': 'mike.johnson@newfrontier.pathfinity.edu'
  };

  if (userName && nameEmailMap[userName]) {
    return true;
  }

  return false;
}
```

### 2. Cache Loading Service

Create service to load content directly from cache:

```typescript
// File: src/services/cache/DemoCacheService.ts
import demoUserCache from '../../data/demoCache/demoUserCache.json';

export class DemoCacheService {
  static loadUserContent(userName: string): any {
    const userContent = demoUserCache[userName];

    if (!userContent) {
      throw new Error(`No cached content found for user: ${userName}`);
    }

    return userContent;
  }

  static generateCachedLessonPlan(userName: string, career?: string): any {
    const userContent = this.loadUserContent(userName);

    // Transform cached content into lesson plan format
    return {
      student: userContent.user,
      career: { careerName: career || 'Default Career' },
      subjects: this.transformSubjectsFromCache(userContent),
      lessonSummary: `Cached lesson plan for ${userName}`,
      generatedAt: new Date().toISOString(),
      source: 'cached_content',
      cached: true
    };
  }

  private static transformSubjectsFromCache(userContent: any): any[] {
    // Convert cached content format to lesson plan format
    return Object.keys(userContent.skills || {}).map(subject => ({
      subject,
      content: userContent.skills[subject],
      cached: true
    }));
  }
}
```

### 3. Routing Logic in DailyLessonPlanPage

Modify the lesson plan generation to check for cached users:

```typescript
// File: src/components/dashboards/DailyLessonPlanPage.tsx

import { shouldUseCachedContent } from '../../utils/cacheUserDetection';
import { DemoCacheService } from '../../services/cache/DemoCacheService';

// In generateHybridLesson function (around line 348):

const generateHybridLesson = async () => {
  try {
    setLoading(true);

    // Phase 1: Check if this user should use cached content
    if (shouldUseCachedContent(user?.email, currentStudent?.name)) {
      console.log('🎯 Phase 1: Loading cached content for demo user:', currentStudent?.name);

      const cachedLesson = DemoCacheService.generateCachedLessonPlan(
        currentStudent.name,
        selectedCareer.title
      );

      setGeneratedLesson(cachedLesson);
      console.log('✅ Phase 1: Successfully loaded cached lesson plan');
      return;
    }

    // Existing live generation logic for non-cached users
    console.log('🚀 Generating hybrid lesson plan using lessonOrchestrator + tier progression');
    const orchestratorResult = await lessonOrchestrator.generateDailyLessons(
      currentStudent.id,
      selectedCareer.title
    );

    // ... rest of existing logic
  } catch (error) {
    console.error('❌ Error in lesson generation:', error);
    // ... existing error handling
  } finally {
    setLoading(false);
  }
};
```

## Deployment Plan

### Pre-Deployment Checklist
- [ ] Verify `demoUserCache.json` contains content for all 4 users
- [ ] Test cache loading logic in development
- [ ] Validate lesson plan format compatibility
- [ ] Prepare rollback plan

### Deployment Steps

1. **Deploy Cache Detection Logic**
   - Add `cacheUserDetection.ts`
   - Test user detection in production

2. **Deploy Cache Service**
   - Add `DemoCacheService.ts`
   - Verify cache loading functionality

3. **Update DailyLessonPlanPage**
   - Add routing logic before live generation
   - Test with one user first (Zara Jones)

4. **Verification**
   - Test all 4 users load cached content
   - Verify lesson plan PDFs generate correctly
   - Confirm no Azure API calls for these users

### Rollback Plan
If any issues occur:
1. Remove routing logic from `DailyLessonPlanPage.tsx`
2. Users will fall back to existing (failing) live generation
3. Investigate and fix issues before re-deployment

## Success Criteria

### Functional Requirements
- [ ] Zara/Alexis/David/Mike load lesson plans instantly
- [ ] No Azure API calls for these 4 users
- [ ] Lesson plan PDFs generate successfully
- [ ] Content quality matches development experience

### Performance Requirements
- [ ] Lesson plan loading time < 2 seconds
- [ ] PDF generation time < 5 seconds
- [ ] No increase in memory usage

### Quality Requirements
- [ ] Cached content displays properly
- [ ] No functionality regressions
- [ ] Error handling for missing cache data

## Monitoring & Metrics

### Success Metrics
- Demo session success rate: 100% for cached users
- Average loading time: < 2 seconds
- Azure API call count: 0 for cached users

### Error Monitoring
- Cache loading failures
- Missing user data in cache
- Lesson plan format compatibility issues

## Lessons Learned (To Be Updated)

*This section will be updated as we implement Phase 1*

### Implementation Insights
- TBD: User detection challenges
- TBD: Cache format compatibility issues
- TBD: Performance implications

### Architecture Decisions
- TBD: Routing logic placement
- TBD: Error handling strategies
- TBD: Cache update mechanisms

## Next Steps Overview

### Phase 2: Quality Audit & Alignment
**Timeline**: After Phase 1 completion
**Purpose**: Compare MasterNarrativeGenerator vs DemonstrativeMasterNarrativeGenerator output quality
**Goal**: Ensure content parity between generators

### Phase 3: Final Demo Transition
**Timeline**: After Phase 2 completion
**Purpose**: Transition Sam/Alex/Jordan/Taylor to cached content using Phase 1 architecture
**Method**: Capture their live-generated content and apply same routing logic

## Future Considerations

### Reusability Design
The Phase 1 architecture is designed to be reusable:
- User detection logic can accommodate new demo users
- Cache service can load any user's content
- Routing logic is extensible for additional user types

### Production Account Preparation
Phase 1 establishes the foundation for production vs demo user routing that will be essential when real subscriber accounts are created.

---

**Document Owner**: Development Team
**Review Cycle**: Updated after each major milestone
**Related Documents**:
- Phase 2: Quality Audit & Alignment (TBD)
- Phase 3: Final Demo Transition (TBD)