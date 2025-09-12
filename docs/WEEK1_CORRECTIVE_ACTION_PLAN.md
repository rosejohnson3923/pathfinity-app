# Week 1 Corrective Action Plan

## 🎯 Priority Fixes Required

### AI Companions Reference
Available companions with images in `/public/images/companions/`:
- **Finn the Explorer** - Purple superhero mask (finn-light.png, finn-dark.png)
- **Sage the Wise** - Owl character (sage-light.png, sage-dark.png)
- **Spark the Innovator** - Lightning character (spark-light.png, spark-dark.png)
- **Harmony the Guide** - Flower character (harmony-light.png, harmony-dark.png)

---

## 🔧 Fix 1: Update BentoExperienceCard Component

### Current Problem:
Component still uses old props (`screen = 1`, `companionId = 'finn'`)

### Required Changes:
```typescript
// File: src/components/bento/BentoExperienceCard.tsx

// REMOVE old component signature
export const BentoExperienceCard: React.FC<BentoExperienceCardProps> = ({
  screen = 1,  // DELETE
  companionId = 'finn',  // DELETE
  ...
})

// REPLACE with new signature
export const BentoExperienceCard: React.FC<BentoExperienceCardProps> = ({
  // Navigation props
  totalChallenges,
  currentChallengeIndex,
  screenType,
  currentScenarioIndex = 0,
  
  // Data props
  career,
  companion,  // Full object with id, name, personality
  challengeData,
  
  // User props
  gradeLevel,
  studentName,
  userId,
  avatarUrl,
  
  // Callbacks
  onScenarioComplete,
  onChallengeComplete,
  onNext,
  
  // Progress
  overallProgress = 0,
  challengeProgress = 0,
  achievements = [],
  
  // Options
  showCareerContext = true,
  enableHints = true,
  enableAudio = false
}) => {
  // Implementation
}
```

---

## 🔧 Fix 2: Implement Screen Type Rendering

### Add Companion Display:
```typescript
// Helper to get companion image path
const getCompanionImage = (companionId: string, theme: 'light' | 'dark') => {
  return `/images/companions/${companionId}-${theme}.png`;
};

// Render based on screenType
const renderContent = () => {
  switch(screenType) {
    case 'intro':
      return (
        <div className={styles.introScreen}>
          {/* Companion Image */}
          <div className={styles.companionSection}>
            <img 
              src={getCompanionImage(companion.id, actualTheme)}
              alt={companion.name}
              className={styles.companionAvatar}
            />
            <div className={styles.companionBubble}>
              {challengeData.introduction.companionMessage}
            </div>
          </div>
          
          {/* Challenge Introduction */}
          <div className={styles.welcomeSection}>
            <h1>{challengeData.introduction.welcome}</h1>
            <p>{challengeData.introduction.howToUse}</p>
          </div>
          
          {/* Start Button */}
          <button onClick={onNext} className={styles.startButton}>
            Start {challengeData.subject} Challenge
          </button>
        </div>
      );
      
    case 'scenario':
      const scenario = challengeData.scenarios[currentScenarioIndex];
      return (
        <div className={styles.scenarioScreen}>
          {/* Scenario Header */}
          <div className={styles.scenarioHeader}>
            <h2>Scenario {currentScenarioIndex + 1} of {challengeData.scenarios.length}</h2>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${(currentScenarioIndex / challengeData.scenarios.length) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Scenario Content */}
          <div className={styles.scenarioContent}>
            <p className={styles.description}>{scenario.description}</p>
            {scenario.visual && (
              <div className={styles.visual}>{scenario.visual}</div>
            )}
            <p className={styles.careerContext}>{scenario.careerContext}</p>
          </div>
          
          {/* Options */}
          <div className={styles.options}>
            {scenario.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                className={styles.optionButton}
              >
                {option}
              </button>
            ))}
          </div>
          
          {/* Companion Helper */}
          <div className={styles.companionHelper}>
            <img 
              src={getCompanionImage(companion.id, actualTheme)}
              alt={companion.name}
              className={styles.companionSmall}
            />
            {scenario.hint && enableHints && (
              <div className={styles.hint}>{scenario.hint}</div>
            )}
          </div>
        </div>
      );
      
    case 'completion':
      return (
        <div className={styles.completionScreen}>
          <h1>🎉 Challenge Complete!</h1>
          <p>{challengeData.subject} challenge finished!</p>
          <p>Challenge {currentChallengeIndex + 1} of {totalChallenges} complete</p>
          
          {/* Companion Celebration */}
          <div className={styles.companionCelebration}>
            <img 
              src={getCompanionImage(companion.id, actualTheme)}
              alt={companion.name}
              className={styles.companionLarge}
            />
            <p>{getCompanionCelebration(companion)}</p>
          </div>
          
          <button onClick={onChallengeComplete} className={styles.nextButton}>
            {currentChallengeIndex < totalChallenges - 1 
              ? 'Next Challenge' 
              : 'Complete Experience'}
          </button>
        </div>
      );
  }
};

// Companion-specific celebrations
const getCompanionCelebration = (companion: Companion) => {
  const celebrations = {
    'finn': "Awesome job! That was super fun! Ready for more adventures?",
    'sage': "Excellent work. You've demonstrated great understanding.",
    'spark': "WOW! Your energy was amazing! Let's keep this momentum going!",
    'harmony': "Beautiful work! You approached that with such grace and calm."
  };
  return celebrations[companion.id] || "Great job!";
};
```

---

## 🔧 Fix 3: Update Container Integration

### File: `src/components/ai-containers/AIExperienceContainerV2-UNIFIED.tsx`

```typescript
// Add proper state management
const [experienceContent, setExperienceContent] = useState<AIExperienceContent | null>(null);
const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
const [screenType, setScreenType] = useState<'intro' | 'scenario' | 'completion'>('intro');

// Get companion details
const getCompanionDetails = (companionId: string) => {
  const companions = {
    'finn': { id: 'finn', name: 'Finn the Explorer', personality: 'playful and encouraging' },
    'sage': { id: 'sage', name: 'Sage the Wise', personality: 'thoughtful and analytical' },
    'spark': { id: 'spark', name: 'Spark the Innovator', personality: 'energetic and curious' },
    'harmony': { id: 'harmony', name: 'Harmony the Guide', personality: 'calm and supportive' }
  };
  return companions[companionId] || companions['finn'];
};

// Generate content on mount
useEffect(() => {
  const loadContent = async () => {
    if (!dailyPlan?.skills || dailyPlan.skills.length === 0) return;
    
    const companion = getCompanionDetails(selectedCharacter || 'finn');
    
    const content = await aiLearningJourneyService.generateMultiChallengeExperienceContent(
      dailyPlan.skills,
      student,
      selectedCareer,
      companion
    );
    
    setExperienceContent(content);
  };
  
  loadContent();
}, [dailyPlan, student, selectedCareer, selectedCharacter]);

// Handle navigation
const handleScenarioComplete = (scenarioIndex: number, wasCorrect: boolean) => {
  // Track completion
  if (wasCorrect) {
    // Award XP, update progress, etc.
  }
  
  // Move to next scenario or completion
  if (currentScenarioIndex < experienceContent.challenges[currentChallengeIndex].scenarios.length - 1) {
    setCurrentScenarioIndex(prev => prev + 1);
  } else {
    setScreenType('completion');
  }
};

const handleChallengeComplete = () => {
  if (currentChallengeIndex < experienceContent.challenges.length - 1) {
    // Move to next challenge
    setCurrentChallengeIndex(prev => prev + 1);
    setCurrentScenarioIndex(0);
    setScreenType('intro');
  } else {
    // All challenges complete
    onComplete(true);
  }
};

const handleNext = () => {
  if (screenType === 'intro') {
    setScreenType('scenario');
  }
};

// Render the card with proper props
return (
  <BentoExperienceCard
    totalChallenges={experienceContent?.challenges.length || 0}
    currentChallengeIndex={currentChallengeIndex}
    screenType={screenType}
    currentScenarioIndex={currentScenarioIndex}
    career={experienceContent?.career || selectedCareer}
    companion={getCompanionDetails(selectedCharacter || 'finn')}
    challengeData={experienceContent?.challenges[currentChallengeIndex]}
    gradeLevel={student.grade_level}
    studentName={student.display_name}
    userId={student.id}
    avatarUrl={student.avatar_url}
    onScenarioComplete={handleScenarioComplete}
    onChallengeComplete={handleChallengeComplete}
    onNext={handleNext}
    overallProgress={calculateOverallProgress()}
    challengeProgress={calculateChallengeProgress()}
    achievements={achievements}
    showCareerContext={true}
    enableHints={student.grade_level === 'K' || parseInt(student.grade_level) <= 2}
    enableAudio={false}
  />
);
```

---

## 📋 Implementation Checklist

### Immediate (Today):
- [ ] Update BentoExperienceCard props interface usage
- [ ] Add screenType rendering logic
- [ ] Implement companion image display
- [ ] Add navigation handlers
- [ ] Update container state management
- [ ] Connect to multi-challenge generation

### Testing:
- [ ] Test with Finn companion
- [ ] Test with Sage companion  
- [ ] Test with Spark companion
- [ ] Test with Harmony companion
- [ ] Test intro → scenario → completion flow
- [ ] Test multi-challenge progression
- [ ] Test with Sam's 4-subject plan

### Validation:
- [ ] Companion images load correctly (light/dark themes)
- [ ] Companion messages match personality
- [ ] Progress tracks correctly across challenges
- [ ] Navigation flows smoothly
- [ ] Grade-appropriate hints show for K-2

---

## 🎨 Companion Personality Implementation

| Companion | Image | Greeting Style | Hint Style | Celebration |
|-----------|-------|---------------|------------|-------------|
| **Finn** | Purple mask | "Hey! Ready for an adventure?" | "Psst! Try thinking about..." | "Awesome! You nailed it!" |
| **Sage** | Owl | "Greetings. Let us begin." | "Consider this approach..." | "Excellent reasoning." |
| **Spark** | Lightning | "WOW! Let's GO!" | "Ooh! What if you..." | "AMAZING energy!" |
| **Harmony** | Flower | "Welcome, dear friend." | "Gently, try..." | "Beautiful work!" |

---

## 📊 Success Metrics

Week 1 will be complete when:
1. ✅ BentoExperienceCard uses new props
2. ✅ All 4 companions display with images
3. ✅ Screen types (intro/scenario/completion) work
4. ✅ Multi-challenge navigation functions
5. ✅ Container generates content for all subjects
6. ✅ Progress tracks across challenges
7. ✅ Sam can complete 4-subject Experience journey

---

## 🚀 Next Steps After Fixes

Once Week 1 is properly complete:
1. Move to Week 2: Create CompanionTile component
2. Build ScenarioTile and FeedbackTile
3. Add interactive canvas for drag-drop
4. Implement grade-specific layouts

**Priority**: Complete all Week 1 fixes TODAY before starting Week 2!