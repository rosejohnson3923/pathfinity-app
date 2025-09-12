# BentoExperience Implementation Roadmap

## 🎯 Current State vs Target State

### Current State ✅
- Basic 2-screen BentoExperienceCard
- Single challenge support
- Generic professional guide (no companion)
- Multiple choice interactions only
- Fixed layout for all grades

### Target State 🚀
- Multi-challenge support (4+ subjects)
- Multiple scenarios per challenge (2-4)
- AI Companion integration (Finn/Sage)
- Rich interactions (drag-drop, sorting, canvas)
- Grade-specific adaptive layouts

---

## 📅 Implementation Phases

## PHASE 1: Core Multi-Challenge Architecture (Week 1)
**Goal**: Enable multiple challenges matching daily lesson plan

### Day 1-2: Update Data Structures
```typescript
// 1. Update AIExperienceContent interface
// File: src/services/AILearningJourneyService.ts

interface AIExperienceContent {
  challenges: ExperienceChallenge[]; // Dynamic array, not fixed
}

interface ExperienceChallenge {
  subject: string;
  skill: LearningSkill;
  introduction: IntroductionContent;
  scenarios: ScenarioContent[]; // 2-4 based on grade
}
```

**Tasks**:
- [ ] Modify `AILearningJourneyService.ts` to generate all subject challenges
- [ ] Update `generateExperienceContent` to create array of challenges
- [ ] Add scenario count logic based on grade level
- [ ] Test with Sam's 4-subject plan

### Day 3-4: Update BentoExperienceCard Props
```typescript
// 2. Refactor BentoExperienceCard
// File: src/components/bento/BentoExperienceCard.tsx

interface BentoExperienceCardProps {
  // Remove screen prop, add more granular control
  challengeIndex: number;        // Which challenge (0-3 for 4 subjects)
  screenType: 'intro' | 'scenario' | 'completion';
  scenarioIndex?: number;        // Which scenario within challenge
  
  challenges: ExperienceChallenge[]; // All challenges data
  companion: AICompanion;           // Finn or Sage
  
  onNext: () => void;
  onComplete: () => void;
}
```

**Tasks**:
- [ ] Refactor props interface
- [ ] Create state management for multi-challenge flow
- [ ] Add challenge/scenario navigation logic
- [ ] Update progress calculation for multiple challenges

### Day 5: Update Container Integration
```typescript
// 3. Update AIExperienceContainerV2-UNIFIED
// File: src/components/ai-containers/AIExperienceContainerV2-UNIFIED.tsx

const [currentChallenge, setCurrentChallenge] = useState(0);
const [currentScenario, setCurrentScenario] = useState(0);
const [currentScreen, setCurrentScreen] = useState<'intro' | 'scenario' | 'completion'>('intro');
```

**Tasks**:
- [ ] Implement challenge progression logic
- [ ] Add scenario cycling within challenges
- [ ] Update phase management
- [ ] Connect to daily lesson plan subjects

---

## PHASE 2: Companion & Core Tiles (Week 2)
**Goal**: Add AI Companion and essential tile components

### Day 6-7: CompanionTile Component
```typescript
// 4. Create CompanionTile
// File: src/components/bento/tiles/CompanionTile.tsx

export const CompanionTile: React.FC<CompanionTileProps> = ({
  companion,  // 'Finn' or 'Sage'
  message,
  emotion,
  gradeLevel
}) => {
  // Implement companion display with personality
}
```

**Tasks**:
- [ ] Create CompanionTile component
- [ ] Add Finn personality (playful, encouraging)
- [ ] Add Sage personality (thoughtful, analytical)
- [ ] Implement speech bubble animations
- [ ] Add grade-appropriate sizing

### Day 8-9: ScenarioTile & FeedbackTile
```typescript
// 5. Create scenario presentation tiles
// Files: 
// - src/components/bento/tiles/ScenarioTile.tsx
// - src/components/bento/tiles/FeedbackTile.tsx
```

**Tasks**:
- [ ] Create ScenarioTile for presenting challenges
- [ ] Create FeedbackTile for responses
- [ ] Add success/hint/try-again states
- [ ] Implement XP animation system
- [ ] Add grade-specific visual treatments

### Day 10: Layout Components
```typescript
// 6. Create layout managers
// Files:
// - src/components/bento/layouts/IntroductionLayout.tsx
// - src/components/bento/layouts/ScenarioLayout.tsx
// - src/components/bento/layouts/CompletionLayout.tsx
```

**Tasks**:
- [ ] Create IntroductionLayout (Welcome, Meet, HowTo)
- [ ] Create ScenarioLayout (dynamic based on interaction type)
- [ ] Create CompletionLayout (celebration, next preview)
- [ ] Add transition animations between layouts

---

## PHASE 3: Interactive Components (Week 3)
**Goal**: Add rich interaction capabilities

### Day 11-12: InteractiveCanvasTile
```typescript
// 7. Create the main interaction component
// File: src/components/bento/tiles/InteractiveCanvasTile.tsx

interface InteractiveCanvasTileProps {
  type: 'drag-drop' | 'sorting' | 'pattern' | 'drawing';
  items: CanvasItem[];
  validationRules: ValidationRule[];
  gradeLevel: string;
}
```

**Tasks**:
- [ ] Create base InteractiveCanvasTile
- [ ] Implement drag-and-drop for K-5
- [ ] Add sorting mechanisms
- [ ] Create pattern completion logic
- [ ] Add touch support for tablets

### Day 13-14: Grade-Specific Interactions
```typescript
// 8. Create grade-appropriate interaction handlers
// File: src/components/bento/utils/interactionHandlers.ts

const getInteractionConfig = (gradeLevel: string) => {
  // K-2: Tap only
  // 3-5: Drag-drop
  // 6-8: Multi-tool
  // 9-12: Professional
}
```

**Tasks**:
- [ ] K-2: Large tap targets, single actions
- [ ] 3-5: Drag-drop with visual feedback
- [ ] 6-8: Tool palette integration
- [ ] 9-12: Complex multi-step workflows

### Day 15: Option Selection Tiles
```typescript
// 9. Enhanced option tiles
// File: src/components/bento/tiles/OptionTile.tsx
```

**Tasks**:
- [ ] Create flexible OptionTile component
- [ ] Add visual support for K-2
- [ ] Implement "I would..." format
- [ ] Add selection animations
- [ ] Support multiple selection modes

---

## PHASE 4: Grade-Specific Layouts (Week 4)
**Goal**: Implement adaptive layouts by grade level

### Day 16-17: Grade Layout Systems
```typescript
// 10. Grade-specific layout configurations
// File: src/components/bento/layouts/GradeLayouts.ts

export const K2_LAYOUT = {
  grid: '2x2',
  tileSize: 'large',
  fontSize: '24px',
  visualRatio: 0.8
};

export const ELEMENTARY_LAYOUT = { /* 3-5 config */ };
export const MIDDLE_LAYOUT = { /* 6-8 config */ };
export const HIGH_LAYOUT = { /* 9-12 config */ };
```

**Tasks**:
- [ ] Implement K-2 layout (2x2, huge tiles)
- [ ] Implement 3-5 layout (3x3, balanced)
- [ ] Implement 6-8 layout (3x4, flexible)
- [ ] Implement 9-12 layout (4x4, dense)

### Day 18-19: Responsive Behaviors
```typescript
// 11. Responsive system
// File: src/components/bento/utils/responsiveLayouts.ts
```

**Tasks**:
- [ ] K-2: Single tile mobile, swipe navigation
- [ ] 3-5: Stacked mobile, grid tablet
- [ ] 6-8: Tabbed mobile, panels desktop
- [ ] 9-12: Accordion mobile, IDE desktop

### Day 20: CSS Module Updates
```css
/* 12. Grade-specific styles
   File: src/components/bento/BentoExperienceCard.module.css */

.k2Layout { /* Large, playful */ }
.elementaryLayout { /* Balanced, friendly */ }
.middleLayout { /* Efficient, clean */ }
.highLayout { /* Dense, professional */ }
```

**Tasks**:
- [ ] Create grade-specific CSS modules
- [ ] Add animation classes per grade
- [ ] Implement color schemes
- [ ] Add responsive breakpoints

---

## PHASE 5: Integration & Polish (Week 5)
**Goal**: Connect everything and polish the experience

### Day 21-22: State Management
```typescript
// 13. Unified state management
// File: src/hooks/useExperienceState.ts

const useExperienceState = () => {
  // Manage challenge progression
  // Track scenario completion
  // Handle achievements
  // Persist progress
}
```

**Tasks**:
- [ ] Create unified state hook
- [ ] Add progress persistence
- [ ] Implement achievement tracking
- [ ] Add analytics integration

### Day 23-24: Animations & Transitions
```typescript
// 14. Animation system
// File: src/components/bento/utils/animations.ts
```

**Tasks**:
- [ ] Challenge transition animations
- [ ] Scenario progression effects
- [ ] Success celebration animations
- [ ] Companion reaction animations

### Day 25: Testing & Optimization
**Tasks**:
- [ ] Test with Sam (K) - 4 subjects
- [ ] Test with Grade 3 student
- [ ] Test with Grade 6 student
- [ ] Test with Grade 9 student
- [ ] Performance optimization
- [ ] Accessibility audit

---

## 🚀 Quick Start Tasks (Do First!)

### Immediate Actions (Day 1)
1. **Update AIExperienceContent interface** for multiple challenges
```bash
# Edit: src/services/AILearningJourneyService.ts
# Add: challenges: ExperienceChallenge[]
```

2. **Create CompanionTile component**
```bash
# Create: src/components/bento/tiles/CompanionTile.tsx
# Add Finn/Sage display logic
```

3. **Fix BentoExperienceCard multi-challenge support**
```bash
# Edit: src/components/bento/BentoExperienceCard.tsx
# Remove fixed screen prop, add dynamic challenge support
```

---

## 📁 File Structure to Create

```
src/components/bento/
├── BentoExperienceCard.tsx (UPDATE)
├── tiles/
│   ├── CompanionTile.tsx (NEW)
│   ├── ScenarioTile.tsx (NEW)
│   ├── InteractiveCanvasTile.tsx (NEW)
│   ├── OptionTile.tsx (NEW)
│   ├── FeedbackTile.tsx (NEW)
│   ├── ProgressTile.tsx (NEW)
│   └── AchievementTile.tsx (NEW)
├── layouts/
│   ├── IntroductionLayout.tsx (NEW)
│   ├── ScenarioLayout.tsx (NEW)
│   ├── CompletionLayout.tsx (NEW)
│   ├── GradeLayouts.ts (NEW)
│   └── ResponsiveLayouts.ts (NEW)
├── utils/
│   ├── interactionHandlers.ts (NEW)
│   ├── animations.ts (NEW)
│   ├── layoutCalculator.ts (NEW)
│   └── gradeConfig.ts (NEW)
└── styles/
    ├── BentoExperienceCard.module.css (UPDATE)
    ├── k2Layout.module.css (NEW)
    ├── elementaryLayout.module.css (NEW)
    ├── middleLayout.module.css (NEW)
    └── highLayout.module.css (NEW)
```

---

## 🎯 Success Metrics

### Phase 1 Complete When:
- [ ] Can display 4 challenges for Sam's subjects
- [ ] Each challenge has introduction screen
- [ ] Navigation between challenges works

### Phase 2 Complete When:
- [ ] Finn appears and guides Sam
- [ ] Companion messages are contextual
- [ ] Basic tile layouts render correctly

### Phase 3 Complete When:
- [ ] Drag-drop works for counting exercise
- [ ] Sorting activities function
- [ ] All interaction types implemented

### Phase 4 Complete When:
- [ ] K-2 sees large, simple layout
- [ ] 9-12 sees professional layout
- [ ] Responsive behaviors work

### Phase 5 Complete When:
- [ ] Full journey works end-to-end
- [ ] Animations are smooth
- [ ] Performance is optimized

---

## 🔴 Blockers & Dependencies

### Dependencies:
1. **AI Content Generation** must support multiple challenges
2. **Daily Lesson Plan** must provide subject array
3. **Companion Service** must provide personality data

### Potential Blockers:
1. **Performance** with multiple interactive canvases
2. **State complexity** with nested challenges/scenarios
3. **Mobile performance** for drag-drop on older devices

### Mitigation:
- Start with tap-only for K-2 (simpler)
- Implement progressive enhancement
- Use React.memo for expensive components
- Consider virtualization for large grids

---

## 👥 Suggested Task Assignment

### Frontend Developer 1:
- Phase 1: Core architecture
- Phase 5: State management

### Frontend Developer 2:
- Phase 2: Companion & tiles
- Phase 4: Grade layouts

### Frontend Developer 3:
- Phase 3: Interactive components
- Phase 5: Animations

### QA Engineer:
- Test each phase completion
- Accessibility testing
- Device testing

---

## 🏁 Definition of Done

The BentoExperience is complete when:
1. ✅ Sam (K) can complete all 4 subject challenges
2. ✅ Finn guides throughout the journey
3. ✅ Each challenge has 4 scenarios (for K)
4. ✅ Drag-drop counting works
5. ✅ Letter selection works
6. ✅ Shape sorting works
7. ✅ Community helper identification works
8. ✅ Progress persists across sessions
9. ✅ Works on tablet (primary device)
10. ✅ Passes accessibility audit