# Loading Screen Narration Implementation Plan

## Overview
Leverage existing MasterNarrative content for loading screen narration across all containers and subjects. This approach avoids additional AI costs while providing rich, contextual audio content during loading.

## Available MasterNarrative Content

### 1. Character Information
- **character.name**: Companion name (e.g., "Dr. Harmony Helper")
- **character.role**: Career role (e.g., "Junior Doctor Helper")
- **character.workplace**: Location (e.g., "CareerInc Medical Center")
- **character.personality**: Traits (e.g., "Caring, gentle, helpful")

### 2. Journey Arc (Container-Specific)
- **journeyArc.checkIn**: Lobby arrival message
- **journeyArc.learn**: Virtual Academy context
- **journeyArc.experience**: Virtual Workplace context
- **journeyArc.discover**: Virtual Field Trip context

### 3. Cohesive Story Elements
- **cohesiveStory.mission**: Overall career mission
- **cohesiveStory.throughLine**: Narrative thread
- **cohesiveStory.patients/customers/projects**: Career-specific focus

### 4. Subject-Specific Context (Per Container)
- **subjectContextsAligned.math.learn**: Math learning context
- **subjectContextsAligned.ela.experience**: ELA workplace context
- **subjectContextsAligned.science.discover**: Science field trip context
- **subjectContextsAligned.socialStudies.[container]**: Social studies contexts

## Loading Screen Narration Strategy

### Phase 1: Context-Aware Selection
The loading screen should intelligently select narration based on:
1. **Current Container** (Learn/Experience/Discover)
2. **Current Subject** (Math/ELA/Science/Social Studies)
3. **Loading Phase** (instruction/practice/assessment)
4. **Previous narration played** (avoid repetition)

### Phase 2: Narration Content Types

#### A. Container Introduction (First Load)
When entering a container for the first time:
```typescript
// Learn Container
narration = masterNarrative.journeyArc.learn
// "Welcome to the Virtual Academy where you'll learn Medical Helper Basics!"

// Experience Container
narration = masterNarrative.journeyArc.experience
// "Time to practice at CareerInc Children's Clinic!"

// Discover Container
narration = masterNarrative.journeyArc.discover
// "Let's explore the Community Health Fair!"
```

#### B. Subject Transition (Between Subjects)
When loading a new subject within the same container:
```typescript
// Math → ELA transition in Learn
narration = `Now let's explore how ${masterNarrative.character.role}s use reading.
           ${masterNarrative.subjectContextsAligned.ela.learn}`
// "Now let's explore how Junior Doctor Helpers use reading.
//  Learn to read medical supply labels!"
```

#### C. Mission Reminders (Random During Loading)
Periodically remind of the career mission:
```typescript
narration = `Remember, as a ${masterNarrative.character.role},
           your mission is to ${masterNarrative.cohesiveStory.mission}`
// "Remember, as a Junior Doctor Helper,
//  your mission is to help teddy bears feel better!"
```

#### D. Progress Encouragement (Phase-Based)
Based on loading phase:
```typescript
// During practice loading
narration = `Great job learning! Now let's practice
           ${masterNarrative.subjectContextsAligned[subject][container]}`

// During assessment loading
narration = `You're doing amazing! Time to show what you've learned about
           ${masterNarrative.subjectContextsAligned[subject][container]}`
```

## Implementation Details

### 1. Update EnhancedLoadingScreen Props
```typescript
interface EnhancedLoadingScreenProps {
  phase: 'practice' | 'instruction' | 'assessment' | 'complete';
  skillName: string;
  studentName: string;
  customMessage?: string;
  containerType?: 'learn' | 'experience' | 'discover';
  currentCareer?: string;
  showGamification?: boolean;
  // NEW PROPS
  masterNarrative?: MasterNarrative;
  currentSubject?: string;
  companionId?: string;
  enableNarration?: boolean;
}
```

### 2. Create LoadingNarrationService
```typescript
export class LoadingNarrationService {
  private lastNarrationKey: string | null = null;
  private narrationHistory: Set<string> = new Set();

  selectNarration(
    masterNarrative: MasterNarrative,
    container: string,
    subject: string,
    phase: string,
    isFirstLoad: boolean
  ): NarrationContent {
    // Intelligent selection logic
    if (isFirstLoad) {
      return this.getContainerIntroduction(masterNarrative, container);
    }

    // Check if subject changed
    if (this.hasSubjectChanged(subject)) {
      return this.getSubjectTransition(masterNarrative, container, subject);
    }

    // Random selection from available options
    const options = [
      this.getMissionReminder(masterNarrative),
      this.getProgressEncouragement(masterNarrative, container, subject, phase),
      this.getCareerConnection(masterNarrative, container, subject)
    ];

    return this.selectUnplayedOption(options);
  }

  private getContainerIntroduction(
    narrative: MasterNarrative,
    container: string
  ): NarrationContent {
    const containerMap = {
      'learn': narrative.journeyArc.learn,
      'experience': narrative.journeyArc.experience,
      'discover': narrative.journeyArc.discover
    };

    return {
      text: containerMap[container],
      duration: 4000,
      key: `intro_${container}`
    };
  }
}
```

### 3. Integration with Azure TTS
```typescript
// In EnhancedLoadingScreen component
useEffect(() => {
  if (masterNarrative && enableNarration) {
    const narration = loadingNarrationService.selectNarration(
      masterNarrative,
      containerType,
      currentSubject,
      phase,
      isFirstLoad
    );

    // Play narration with Azure TTS
    azureAudioService.playText(
      narration.text,
      companionId,
      {
        onComplete: () => setNarrationComplete(true),
        volume: 0.8,
        rate: 1.0
      }
    );
  }
}, [masterNarrative, containerType, currentSubject, phase]);
```

### 4. Narration Timing Control
```typescript
// Ensure narration doesn't extend beyond loading
const MIN_LOADING_TIME = 3000; // 3 seconds minimum
const MAX_NARRATION_TIME = 7000; // 7 seconds maximum

// If loading completes before narration
if (loadingComplete && !narrationComplete) {
  // Option 1: Continue showing loading until narration finishes
  // Option 2: Fade out narration and proceed
  // Option 3: Move narration to background
}
```

## Content Examples by Scenario

### Learn Container - Math - First Load
**Narration**: "Welcome to the Virtual Academy! Today we'll explore how doctors use numbers. You'll study how doctors use numbers 1-3 for patient rooms!"

### Experience Container - ELA - Subject Transition
**Narration**: "Great work with math! Now let's practice reading in the clinic. You'll organize the medicine cabinet with letter labels!"

### Discover Container - Science - Progress Encouragement
**Narration**: "You're becoming an amazing Junior Doctor Helper! Let's explore how medical teams use shapes to organize equipment at the health fair!"

### Any Container - Mission Reminder
**Narration**: "Remember, your mission is to help teddy bears feel better! Every skill you learn helps you become a better helper!"

## Benefits of This Approach

1. **No Additional AI Costs**: Uses already-generated MasterNarrative content
2. **Contextually Relevant**: Content matches the current container, subject, and phase
3. **Career-Focused**: Reinforces career connections throughout the journey
4. **Progressive Narrative**: Builds on previous content, avoiding repetition
5. **Grade-Appropriate**: MasterNarrative already contains grade-level content

## Performance Considerations

1. **Preload Audio**: Generate TTS audio for common narrations on app start
2. **Cache Narrations**: Store played narrations to avoid regenerating
3. **Fallback to Text**: If audio fails, show text in loading screen
4. **Progressive Loading**: Start loading content while narration plays

## Future Enhancements

1. **Dynamic Content Insertion**: Include student name, scores, achievements
2. **Emotional Variation**: Different companion voices for different moods
3. **Achievement Callouts**: "You've mastered 5 skills today!"
4. **Time-of-Day Awareness**: "Good morning! Ready for today's adventure?"
5. **Streak Recognition**: "Three days in a row! You're on fire!"

## Testing Strategy

1. **Container Transitions**: Test narration when switching between containers
2. **Subject Transitions**: Verify appropriate content for subject changes
3. **Phase Variations**: Ensure different narrations for instruction/practice/assessment
4. **Audio Timing**: Confirm narration completes within loading time
5. **Fallback Behavior**: Test when audio service is unavailable