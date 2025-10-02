# Lesson Plan with Spark AICompanion & Required Pathfinity Tools

## Revised Lesson Plan: BASIC_STANDARD_AI (With Spark)

### **Lesson Metadata**
- **Student**: Sam, Grade K
- **Career**: Chef 👨‍🍳
- **AICompanion**: Spark (Sam's personalized AI guide)
- **Template Type**: BASIC_STANDARD_AI
- **Subscription**: Basic Tier + AI Enhancement

---

## MATH LESSON: Chef's Smart Kitchen Counter (Led by Spark)

### **Spark's Introduction**
```typescript
// Spark appears in AICompanionModalV2
SPARK: "Hi Sam! It's me, Spark! 🎨 Today we're going to be chefs together!
        I'll help you learn to count ingredients just like real chefs do.
        Are you ready to cook up some fun with numbers?"
```

### **Learn Section (10 minutes) - Led by Spark**

**Spark's Master Narrative Delivery:**
```typescript
// Delivered through NarrativeLearnContainer with Spark's voice
SPARK: "Welcome to YOUR kitchen, Chef Sam! I'm so excited to help you become
        an amazing chef today. You know what's super cool? Every chef needs to
        know their numbers to make yummy food!"

SPARK: "Let me tell you a secret - even famous chefs like Chef Gordon counts
        his ingredients! When he makes his special soup, he counts: 1 onion,
        2 carrots, 3 potatoes. Want to learn to count like him?"
```

**Spark's Vocabulary Teaching:**
```typescript
// Spark uses visual aids in the interface
SPARK: "Let me teach you some chef words!"
[Shows animated icons as Spark speaks]
- "Ingredient 🥕 - That's the stuff we cook with!"
- "Recipe 📝 - It's like instructions for making food!"
- "Count 🔢 - Saying numbers in order, like 1, 2, 3!"
```

### **Instructional Video Section (5 minutes)**

**Spark-Narrated Video:**
```typescript
// InstructionalVideoComponent with Spark overlay
SPARK: "Watch this with me, Sam! I made this video just for you!"

[Video plays with Spark appearing in corner, commenting live]

VIDEO SCENE: Kitchen appears
SPARK: "Look! This is just like the kitchen we'll work in!"

VIDEO SCENE: Ingredients appear
SPARK: "Ooh, here come the vegetables! Let's count together!"
SPARK + SAM: "ONE carrot... TWO tomatoes... THREE potatoes!"

SPARK: "You're doing great! See how the chef uses the same numbers we just learned?"

VIDEO SCENE: Chef makes soup
SPARK: "Without counting, the soup would taste yucky! But with counting, it's PERFECT!"
```

### **Practice Activity with Spark (10 minutes)**

**Spark-Guided Interactive Practice:**
```typescript
// Delivered through existing Practice component with Spark integration

SPARK: "Now it's YOUR turn to be the chef! I'll be your helper!"

// Interactive Kitchen Workspace appears
SPARK: "Look at our kitchen! We need to organize our ingredients.
        Can you help me count them?"

// Drag and drop interface activated
SPARK: "Drag 1 apple to the basket. Great! That's ONE!"
[Sam drags apple]
SPARK: "Perfect! You found ONE apple! 🎉"

SPARK: "Now let's find TWO bananas!"
[Sam drags bananas]
SPARK: "1... 2... Yes! TWO bananas! You're amazing!"

SPARK: "Last one - can you find THREE oranges?"
[Sam completes]
SPARK: "1, 2, 3! WOW! You counted all three! You're a real chef now!"
```

### **Assessment with Spark (5 minutes)**

**Spark-Administered Assessment:**
```typescript
// Assessment module with Spark providing real-time feedback

SPARK: "Let's see what you learned! Don't worry, I'm here to help!"

// Question 1: Visual
SPARK: "Chef Sam needs tomatoes for the sauce. How many do you see?"
[Shows 2 tomatoes]
SAM: [Selects 2]
SPARK: "That's right! TWO tomatoes! You're so smart!"

// Question 2: Voice Input (if enabled)
SPARK: "Can you tell me - how many eggs should we use for the cake?"
SAM: "One!"
SPARK: "YES! One egg is perfect! You remembered!"

// Question 3: Gesture/Touch
SPARK: "Show me 3 fingers like we count 3 peppers!"
[Uses camera/touch to verify]
SPARK: "1, 2, 3 fingers! Excellent counting, Chef Sam!"
```

### **Experience Scenario with Spark**

**"Spark's Restaurant Adventure"**
```typescript
// Delivered through Experience Scenario component

SPARK: "Sam, I need your help! Customers are coming to our restaurant!"

// Interactive scenario begins
SPARK: "Oh! Here comes our first customer!"
CUSTOMER_1 (voiced by Spark): "I'd like 1 sandwich please!"
SPARK: "Sam, how many sandwiches? Can you count?"
SAM: "1!"
SPARK: "Perfect! One sandwich coming up!"

[Pattern continues with 2 cookies, 3 apple slices]

SPARK: "You served everyone perfectly! Our restaurant is a success!"
```

### **Discover Challenge with Spark**

**"Create a Recipe with Spark"**
```typescript
// Discover module with Spark collaboration

SPARK: "Let's create our very own recipe together!"

SPARK: "What's your favorite fruit? Touch the picture!"
[Sam selects strawberries]
SPARK: "Strawberries! Yummy! Should we use 1, 2, or 3?"
SAM: "3!"
SPARK: "3 strawberries it is! Let me write that down..."
[Shows visual recipe card building]

SPARK: "Our recipe is complete! Look what WE made together!"
[Displays illustrated recipe with Sam's choices]

SPARK: "I'm saving this in your Chef Portfolio! Your parents can see it too!"
```

---

## Required Pathfinity Tools & Components

### **Core Platform Components**

#### 1. **AICompanionModalV2** ✅ (Exists)
```typescript
src/screens/modal-first/sub-modals/AICompanionModalV2.tsx
```
- Hosts Spark's personality and interactions
- Manages conversation state
- Provides voice synthesis for Spark

#### 2. **NarrativeLearnContainer** ✅ (Just Restored)
```typescript
src/components/containers/NarrativeLearnContainer.tsx
```
- Delivers Spark's narrative content
- Integrates with MasterNarrativeGenerator
- Provides structured learning flow

#### 3. **InstructionalVideoComponent** ✅ (Exists)
```typescript
src/components/containers/InstructionalVideoComponent.tsx
```
- Plays video content
- Needs: Spark overlay feature (TO BUILD)
- Supports fallback content when video unavailable

#### 4. **JustInTimeContentService** ✅ (Exists)
```typescript
src/services/content/JustInTimeContentService.ts
```
- Generates contextual practice content
- Provides Spark's responses
- Manages content adaptation

#### 5. **MasterNarrativeGenerator** ✅ (Exists)
```typescript
src/services/narrative/MasterNarrativeGenerator.ts
```
- Creates Spark's story content
- Generates career-specific narratives
- Adapts to grade level

### **Tools to Build/Enhance**

#### 1. **SparkLessonOrchestrator** 🔧 (TO BUILD)
```typescript
// Coordinates Spark through entire lesson flow
interface SparkLessonOrchestrator {
  startLesson(lessonPlan: StandardizedLessonPlan): void;
  transitionToNextSection(): void;
  handleStudentResponse(response: any): void;
  trackProgress(): LessonProgress;
}
```

#### 2. **Interactive Practice Workspace** 🔧 (TO BUILD)
```typescript
// Drag-and-drop counting interface
interface PracticeWorkspace {
  loadActivity(activity: PracticeActivity): void;
  enableDragDrop(): void;
  validateAnswer(answer: any): boolean;
  sparkFeedback(correct: boolean): void;
}
```

#### 3. **Spark Voice Engine** 🔧 (TO ENHANCE)
```typescript
// Text-to-speech for Spark's personality
interface SparkVoice {
  speak(text: string, emotion?: 'excited' | 'encouraging' | 'thinking'): void;
  pauseForResponse(): void;
  listenToStudent(): string; // If voice input enabled
}
```

#### 4. **Visual Recipe Builder** 🔧 (TO BUILD)
```typescript
// For Discover challenges
interface RecipeBuilder {
  addIngredient(item: string, quantity: number): void;
  generateVisual(): RecipeCard;
  saveToPortfolio(): void;
  shareWithParents(): void;
}
```

#### 5. **Progress Tracker with Spark** 🔧 (TO ENHANCE)
```typescript
// Tracks lesson completion
interface SparkProgressTracker {
  updateProgress(section: string, completed: boolean): void;
  celebrateSuccess(type: 'small' | 'big'): void;
  generateReport(): ParentReport;
}
```

### **AI Safety Tools** (Required for AI mode)

#### 1. **Spark Content Filter** 🔧 (TO BUILD)
```typescript
interface SparkSafetyFilter {
  validatePrompt(prompt: string): boolean;
  filterResponse(response: string): string;
  checkAgeAppropriate(content: any): boolean;
  logInteraction(interaction: any): void;
}
```

#### 2. **Parent Visibility Dashboard** 🔧 (TO BUILD)
```typescript
interface ParentDashboard {
  viewSparkConversations(): Conversation[];
  reviewLessonProgress(): Progress;
  adjustSparkSettings(): Settings;
  downloadReports(): PDF;
}
```

### **Existing Tools That Work As-Is**

✅ **NarrativeContext** - Provides context for Spark's narratives
✅ **Assessment Module** - Can be enhanced with Spark feedback
✅ **PDF Generation** - Exports lesson plans for offline use
✅ **User Progress Tracking** - Records completion

### **Integration Architecture**

```typescript
// How tools connect for Spark-led lessons
class SparkLessonFlow {
  constructor(
    private spark: AICompanionModalV2,
    private narrative: NarrativeLearnContainer,
    private video: InstructionalVideoComponent,
    private practice: PracticeWorkspace, // TO BUILD
    private assessment: AssessmentModule,
    private jit: JustInTimeContentService
  ) {}

  async runLesson(lessonPlan: StandardizedLessonPlan) {
    // 1. Spark introduces lesson
    await this.spark.introduce(lessonPlan);

    // 2. Narrative learning with Spark commentary
    await this.narrative.deliver(lessonPlan.content.narrativeContext);

    // 3. Video with Spark overlay
    await this.video.playWithCompanion(lessonPlan.content.video);

    // 4. Interactive practice with Spark guidance
    await this.practice.runActivity(lessonPlan.content.practice);

    // 5. Assessment with Spark encouragement
    await this.assessment.evaluate(lessonPlan.content.assessment);

    // 6. Celebration and save progress
    await this.spark.celebrate();
  }
}
```

### **Development Priority**

1. **Phase 1 - Core** (Use existing tools)
   - Integrate Spark with NarrativeLearnContainer
   - Add Spark responses to JustInTimeContentService
   - Basic PDF generation

2. **Phase 2 - Interactive** (Build new tools)
   - SparkLessonOrchestrator
   - Interactive Practice Workspace
   - Visual Recipe Builder

3. **Phase 3 - Enhancement** (Polish)
   - Spark Voice Engine
   - Parent Dashboard
   - Advanced progress tracking

### **No External Dependencies**
All tools are built within Pathfinity platform:
- No third-party educational APIs needed
- Uses existing Supabase for data
- Leverages current React components
- Spark AI runs through your OpenAI integration

This creates a complete, self-contained lesson system where Spark guides Sam through every step using Pathfinity's tools!