# BentoExperience Implementation Roadmap V2 (JIT Architecture)

## 🎯 Architecture Understanding

### How Experience Container Actually Works with JIT:
- **MultiSubjectContainer** orchestrates the journey through 4 subjects
- **Experience Container** receives ONE skill at a time via JIT
- **Each skill** generates multiple scenarios (4 for K-2, 3 for 3-5, 3 for 6-8, 2 for 9-12)
- **Flow**: Math → 4 scenarios → Complete → ELA → 4 scenarios → Complete → etc.

### Current State ✅
- ✅ Multi-scenario support for single skill
- ✅ BentoExperienceCardV2 with new props structure
- ✅ Screen types: intro, scenario, completion
- ✅ All 4 companions (Finn, Sage, Spark, Harmony)
- ✅ Grade-based scenario count logic
- ✅ JIT content generation

### Target State 🚀
- Component-based tile system
- Interactive canvas with drag-drop
- Grade-specific layouts and interactions
- Smooth animations and transitions
- Progress persistence

---

## 📅 Implementation Phases

## PHASE 1: Core Architecture ✅ COMPLETED

### What We've Built:
- ✅ Updated AILearningJourneyService for multi-scenario generation
- ✅ Created BentoExperienceCardV2 with proper props
- ✅ Implemented navigation: intro → scenario → completion
- ✅ Container state management for scenarios
- ✅ JIT integration for on-demand content

---

## PHASE 2: Tile Component System (Week 2) 🔄 IN PROGRESS

**Goal**: Break monolithic component into reusable tiles

### Day 1-2: CompanionTile Component
```typescript
// File: src/components/bento/tiles/CompanionTile.tsx

export interface CompanionTileProps {
  companion: {
    id: 'finn' | 'sage' | 'spark' | 'harmony';
    name: string;
    personality: string;
  };
  message: string;
  emotion?: 'happy' | 'thinking' | 'celebrating' | 'encouraging';
  size?: 'small' | 'medium' | 'large';
  position?: 'float' | 'inline';
  theme?: 'light' | 'dark';
}

export const CompanionTile: React.FC<CompanionTileProps> = ({
  companion,
  message,
  emotion = 'happy',
  size = 'medium',
  position = 'inline',
  theme = 'light'
}) => {
  // Render companion with image and speech bubble
  // Use /images/companions/${companion.id}-${theme}.png
}
```

**Tasks**:
- [ ] Extract companion logic from BentoExperienceCardV2
- [ ] Create reusable CompanionTile component
- [ ] Add personality-based animations
- [ ] Implement speech bubble with typewriter effect
- [ ] Add emotion states

### Day 3: ScenarioTile Component
```typescript
// File: src/components/bento/tiles/ScenarioTile.tsx

export interface ScenarioTileProps {
  scenario: {
    description: string;
    visual?: string;
    careerContext: string;
  };
  scenarioNumber: number;
  totalScenarios: number;
  career: { name: string; icon: string; };
  skill: { name: string; };
}
```

**Tasks**:
- [ ] Create ScenarioTile for content presentation
- [ ] Add career context integration
- [ ] Include visual/emoji support
- [ ] Add progress indicator

### Day 4: FeedbackTile Component
```typescript
// File: src/components/bento/tiles/FeedbackTile.tsx

export interface FeedbackTileProps {
  type: 'correct' | 'incorrect' | 'hint' | 'completion';
  message: string;
  companion?: CompanionReaction;
  xpEarned?: number;
  showNextButton?: boolean;
}
```

**Tasks**:
- [ ] Create FeedbackTile for responses
- [ ] Add success/error states
- [ ] Implement XP animation
- [ ] Add companion reactions

### Day 5: ProgressTile Component
```typescript
// File: src/components/bento/tiles/ProgressTile.tsx

export interface ProgressTileProps {
  currentScenario: number;
  totalScenarios: number;
  currentSubject?: string;
  overallProgress?: number;
}
```

**Tasks**:
- [ ] Create visual progress indicator
- [ ] Add scenario dots/steps
- [ ] Show subject progression
- [ ] Add animations for transitions

---

## PHASE 3: Interactive Canvas System (Week 3)

**Goal**: Add rich interactions beyond multiple choice

### Day 6-7: Base InteractiveCanvasTile
```typescript
// File: src/components/bento/tiles/InteractiveCanvasTile.tsx

export interface InteractiveCanvasTileProps {
  type: 'drag-drop' | 'sorting' | 'selection' | 'drawing';
  items: CanvasItem[];
  targets?: DropTarget[];
  validationRules: ValidationRule[];
  gradeLevel: string;
  onComplete: (result: InteractionResult) => void;
}
```

**Tasks**:
- [ ] Create base canvas component
- [ ] Implement drag-drop functionality
- [ ] Add touch support for tablets
- [ ] Create validation system
- [ ] Add visual feedback

### Day 8: Grade-Specific Interaction Handlers
```typescript
// File: src/components/bento/utils/interactionConfig.ts

export const getInteractionConfig = (gradeLevel: string) => {
  switch(gradeLevel) {
    case 'K':
    case '1':
    case '2':
      return {
        mode: 'tap-only',
        targetSize: 'extra-large',
        feedback: 'immediate',
        hints: 'automatic'
      };
    case '3':
    case '4':
    case '5':
      return {
        mode: 'drag-drop',
        targetSize: 'large',
        feedback: 'on-drop',
        hints: 'on-request'
      };
    // etc...
  }
};
```

**Tasks**:
- [ ] K-2: Tap-only interactions with large targets
- [ ] 3-5: Basic drag-drop with snapping
- [ ] 6-8: Multi-select and sorting
- [ ] 9-12: Complex professional tools

### Day 9-10: Option Selection Enhancement
```typescript
// File: src/components/bento/tiles/OptionTile.tsx

export interface OptionTileProps {
  options: string[];
  correctIndex: number;
  format?: 'buttons' | 'cards' | 'visual';
  gradeLevel: string;
  enableHints?: boolean;
}
```

**Tasks**:
- [ ] Create flexible option selection
- [ ] Add visual options for K-2
- [ ] Implement "I would..." format
- [ ] Add hover/selection animations

---

## PHASE 4: Grade-Specific Layouts (Week 4)

**Goal**: Adaptive layouts based on grade level

### Day 11-12: Layout Configuration System
```typescript
// File: src/components/bento/layouts/gradeLayouts.ts

export const GRADE_LAYOUTS = {
  'K-2': {
    grid: '2x2',
    tileSize: 'extra-large',
    spacing: 'wide',
    fontSize: '24px',
    visualRatio: 0.8,
    animations: 'playful'
  },
  '3-5': {
    grid: '3x3',
    tileSize: 'large',
    spacing: 'medium',
    fontSize: '18px',
    visualRatio: 0.6,
    animations: 'smooth'
  },
  '6-8': {
    grid: '3x4',
    tileSize: 'medium',
    spacing: 'compact',
    fontSize: '16px',
    visualRatio: 0.4,
    animations: 'subtle'
  },
  '9-12': {
    grid: '4x4',
    tileSize: 'small',
    spacing: 'tight',
    fontSize: '14px',
    visualRatio: 0.2,
    animations: 'professional'
  }
};
```

**Tasks**:
- [ ] Create grade layout configurations
- [ ] Implement dynamic grid system
- [ ] Add responsive breakpoints
- [ ] Create layout switching logic

### Day 13: Layout Components
```typescript
// Files to create:
// src/components/bento/layouts/IntroductionLayout.tsx
// src/components/bento/layouts/ScenarioLayout.tsx  
// src/components/bento/layouts/CompletionLayout.tsx
```

**Tasks**:
- [ ] Create Introduction layout (Welcome, Meet Companion, How To)
- [ ] Create Scenario layout (adapts to interaction type)
- [ ] Create Completion layout (celebration, progress)
- [ ] Add grade-specific styling

### Day 14-15: Responsive Behaviors
```typescript
// File: src/components/bento/utils/responsiveHandler.ts

export const getResponsiveLayout = (gradeLevel: string, screenSize: string) => {
  // K-2: Single tile on mobile, 2x2 on tablet
  // 3-5: Stacked on mobile, grid on tablet
  // 6-8: Tabs on mobile, panels on desktop
  // 9-12: Accordion on mobile, workspace on desktop
};
```

**Tasks**:
- [ ] Mobile layouts for each grade
- [ ] Tablet optimizations
- [ ] Desktop enhancements
- [ ] Test on various devices

---

## PHASE 5: Animations & Polish (Week 5)

**Goal**: Smooth transitions and delightful interactions

### Day 16-17: Animation System
```typescript
// File: src/components/bento/utils/animations.ts

export const ANIMATIONS = {
  scenarioTransition: {
    duration: 600,
    easing: 'ease-in-out'
  },
  companionReaction: {
    duration: 400,
    easing: 'spring'
  },
  successCelebration: {
    duration: 1000,
    particles: true
  }
};
```

**Tasks**:
- [ ] Scenario transition animations
- [ ] Companion reactions
- [ ] Success celebrations
- [ ] Progress animations
- [ ] Loading transitions

### Day 18: State Persistence
```typescript
// File: src/hooks/useExperienceProgress.ts

export const useExperienceProgress = () => {
  // Save progress after each scenario
  // Resume from last position
  // Track time spent
  // Record interactions
};
```

**Tasks**:
- [ ] Implement progress saving
- [ ] Add resume functionality
- [ ] Track completion stats
- [ ] Analytics integration

### Day 19-20: Testing & Optimization
**Tasks**:
- [ ] Test with Sam (K) - full 16 scenarios
- [ ] Test with Grade 3 student
- [ ] Test with Grade 6 student  
- [ ] Test with Grade 9 student
- [ ] Performance profiling
- [ ] Accessibility audit
- [ ] Bug fixes

---

## 📁 File Structure

```
src/components/bento/
├── BentoExperienceCardV2.tsx ✅ (CREATED)
├── tiles/
│   ├── CompanionTile.tsx (TODO)
│   ├── ScenarioTile.tsx (TODO)
│   ├── InteractiveCanvasTile.tsx (TODO)
│   ├── OptionTile.tsx (TODO)
│   ├── FeedbackTile.tsx (TODO)
│   ├── ProgressTile.tsx (TODO)
│   └── AchievementTile.tsx (TODO)
├── layouts/
│   ├── IntroductionLayout.tsx (TODO)
│   ├── ScenarioLayout.tsx (TODO)
│   ├── CompletionLayout.tsx (TODO)
│   └── gradeLayouts.ts (TODO)
├── utils/
│   ├── interactionConfig.ts (TODO)
│   ├── animations.ts (TODO)
│   ├── responsiveHandler.ts (TODO)
│   └── scenarioGenerator.ts ✅ (DONE via JIT)
└── styles/
    ├── BentoExperienceCard.module.css ✅ (UPDATED)
    └── tiles.module.css (TODO)
```

---

## 🎯 Success Metrics

### Phase 1 ✅ COMPLETE:
- ✅ Single skill generates multiple scenarios
- ✅ Navigation between scenarios works
- ✅ Returns to MultiSubjectContainer for next subject

### Phase 2 Complete When:
- [ ] All tiles extracted as components
- [ ] Companion appears with personality
- [ ] Feedback is contextual

### Phase 3 Complete When:
- [ ] Drag-drop works for K-5
- [ ] Tap-only works for K-2
- [ ] All interaction types functional

### Phase 4 Complete When:
- [ ] K-2 sees simple 2x2 layout
- [ ] 9-12 sees professional layout
- [ ] Responsive on all devices

### Phase 5 Complete When:
- [ ] Smooth animations throughout
- [ ] Progress persists
- [ ] Performance optimized

---

## 🚀 Next Immediate Actions

### Priority 1: Extract Tile Components (Phase 2)
1. Create CompanionTile.tsx
2. Create ScenarioTile.tsx
3. Create FeedbackTile.tsx
4. Refactor BentoExperienceCardV2 to use tiles

### Priority 2: Add Interactions (Phase 3)
1. Create InteractiveCanvasTile
2. Add drag-drop for counting
3. Add tap selection for K-2

### Priority 3: Grade Layouts (Phase 4)
1. Create grade layout configs
2. Implement K-2 large tile layout
3. Add responsive behaviors

---

## 📊 Progress Tracker

| Phase | Status | Completion | Notes |
|-------|--------|------------|-------|
| Phase 1: Core Architecture | ✅ Complete | 100% | JIT integration working |
| Phase 2: Tile Components | 🔄 In Progress | 0% | Need to extract components |
| Phase 3: Interactive Canvas | ❌ Not Started | 0% | Critical for K-5 |
| Phase 4: Grade Layouts | ❌ Not Started | 0% | Essential for K-2 |
| Phase 5: Polish | ❌ Not Started | 0% | Final touches |

---

## 🔴 Critical Path Items

1. **CompanionTile** - Needed for personality
2. **InteractiveCanvasTile** - Essential for drag-drop
3. **Grade Layouts** - K-2 cannot use adult layout

---

## ✅ Definition of Done

The Experience Container is complete when:
1. ✅ Sam (K) completes Math (4 scenarios) via JIT
2. ✅ Returns to MultiSubject, gets ELA skill
3. ✅ Sam completes ELA (4 scenarios) via JIT
4. ✅ Returns to MultiSubject, gets Science skill
5. ✅ Sam completes Science (4 scenarios) via JIT
6. ✅ Returns to MultiSubject, gets Social Studies skill
7. ✅ Sam completes Social Studies (4 scenarios) via JIT
8. [ ] All 16 scenarios have appropriate interactions
9. [ ] Companion guides throughout
10. [ ] Progress persists
11. [ ] Works on tablet
12. [ ] Passes accessibility audit