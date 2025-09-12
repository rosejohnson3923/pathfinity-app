# Week 1 Corrective Action Plan (UPDATED)

## 🎯 Understanding: JIT-Based Architecture

### How Experience Container Actually Works:
- **MultiSubjectContainer** manages the 4 subjects (Math, ELA, Science, Social Studies)
- **Experience Container** receives ONE skill at a time
- **JIT generates** multiple scenarios for that single skill
- **Flow**: Math skill → 4 scenarios → Complete → ELA skill → 4 scenarios → etc.

---

## 🔧 Fix 1: Update BentoExperienceCard Component ✅ COMPLETED

### What We Did:
- Created BentoExperienceCardV2 with proper props structure
- Removed old props (`screen = 1`, `companionId = 'finn'`)
- Added support for multi-scenario navigation

---

## 🔧 Fix 2: Implement Screen Type Rendering ✅ COMPLETED

### What We Did:
- Implemented three screen types: intro, scenario, completion
- Added companion image display with light/dark theme support
- Created personality-based companion messages

---

## 🔧 Fix 3: Update Container Integration (REVISED)

### File: `src/components/ai-containers/AIExperienceContainerV2-UNIFIED.tsx`

```typescript
// Correct state management for single skill, multiple scenarios
const [multiScenarioContent, setMultiScenarioContent] = useState<any>(null);
const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
const [screenType, setScreenType] = useState<'intro' | 'scenario' | 'completion'>('intro');

// Get scenario count based on grade
const getScenarioCount = (gradeLevel: string): number => {
  if (gradeLevel === 'K' || gradeLevel === '1' || gradeLevel === '2') {
    return 4; // K-2: 4 scenarios
  } else if (gradeLevel === '3' || gradeLevel === '4' || gradeLevel === '5') {
    return 3; // 3-5: 3 scenarios  
  } else if (gradeLevel === '6' || gradeLevel === '7' || gradeLevel === '8') {
    return 3; // 6-8: 3 scenarios
  } else {
    return 2; // 9-12: 2 scenarios
  }
};

// Generate content with JIT for ONE skill
useEffect(() => {
  const loadContent = async () => {
    if (!skill) return;
    
    const companion = getCompanionDetails(selectedCharacter || 'finn');
    const scenarioCount = getScenarioCount(student.grade_level);
    
    // Generate base content for the skill
    const generatedContent = await aiLearningJourneyService.generateExperienceContent(
      skill,  // ONE skill with subject
      student,
      selectedCareer
    );
    
    // Create multi-scenario structure from single skill
    const multiScenarioContent = {
      title: `${skill.skill_name} Career Experience`,
      career: selectedCareer,
      companion: companion,
      skill: skill,
      totalScenarios: scenarioCount,
      scenarios: []
    };
    
    // Generate scenarios showing different career applications of the SAME skill
    for (let i = 0; i < scenarioCount; i++) {
      // Each scenario is a different professional context for the same skill
      multiScenarioContent.scenarios.push(createScenarioVariation(generatedContent, i));
    }
    
    setMultiScenarioContent(multiScenarioContent);
  };
  
  loadContent();
}, [skill, student, selectedCareer, selectedCharacter]);

// Handle scenario completion
const handleScenarioComplete = (scenarioIndex: number, wasCorrect: boolean) => {
  // Track completion
  if (wasCorrect) {
    // Award XP, update progress
  }
  
  // Move to next scenario or completion
  if (currentScenarioIndex < multiScenarioContent.totalScenarios - 1) {
    setCurrentScenarioIndex(prev => prev + 1);
    setScreenType('intro'); // Show intro for next scenario
  } else {
    setScreenType('completion');
    // After showing completion, notify parent
    setTimeout(() => {
      onComplete(true); // Return to MultiSubjectContainer for next subject
    }, 3000);
  }
};
```

---

## 📋 Updated Implementation Checklist

### ✅ Completed:
- [x] Update BentoExperienceCard props interface usage
- [x] Add screenType rendering logic  
- [x] Implement companion image display
- [x] Add navigation handlers
- [x] Update container state management
- [x] Connect to JIT scenario generation for single skill

### 🔄 Still Needed:
- [ ] Test with all 4 companions
- [ ] Test intro → scenario → completion flow for each scenario
- [ ] Test transition back to MultiSubjectContainer after skill completion
- [ ] Verify 4 scenarios generate for grade K
- [ ] Test full journey: Math (4 scenarios) → ELA (4 scenarios) → Science (4 scenarios) → Social Studies (4 scenarios)

---

## 📊 Success Metrics (UPDATED)

Week 1 will be complete when:
1. ✅ BentoExperienceCard uses new props
2. ✅ All 4 companions display with images
3. ✅ Screen types (intro/scenario/completion) work
4. ✅ Multi-scenario navigation functions for single skill
5. ✅ Container generates scenarios for ONE skill at a time via JIT
6. ✅ Progress tracks across scenarios
7. 🔄 Sam can complete full journey: 4 subjects × 4 scenarios = 16 total experiences

---

## 🚀 Key Understanding

**The "multi-challenge" nature comes from:**
- MultiSubjectContainer calling Experience 4 times (once per subject)
- NOT from Experience handling all 4 subjects at once
- This matches the JIT architecture used in Learn container
- Each subject/skill generates its scenarios on-demand

**Flow:**
1. MultiSubjectContainer → Experience (Math skill)
2. Experience generates 4 Math scenarios via JIT
3. Student completes all 4 Math scenarios
4. Experience returns to MultiSubjectContainer
5. MultiSubjectContainer → Experience (ELA skill)
6. Repeat for all subjects