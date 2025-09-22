# Loading Screen Career Narration Requirements

## Overview
Add career-specific narration during loading screens to enhance engagement and provide educational value while content is being generated. This narration will be audio-only (no text changes) and will feature fun facts and WIFM (What's In It For Me) content about the selected career.

## Context
- Loading screens appear before each subject in the container
- Loading duration varies (3-5 seconds for instruction, 5+ seconds for practice)
- Narration should complement, not compete with, existing visual elements
- Content should be derived from existing marketing narratives

## Requirements

### 1. Narration Timing
- **Start Delay**: 1 second after loading screen appears (avoid overwhelming user)
- **Duration**: Short clips (3-7 seconds) that can loop if loading takes longer
- **Fade In/Out**: Smooth audio transitions

### 2. Content Types
Each loading screen should randomly select from:

#### A. Career Fun Facts (40% probability)
- Interesting statistics about the career
- Historical facts about the profession
- Cool achievements by professionals in this field
- Example: "Did you know? The first female doctor graduated in 1849!"

#### B. WIFM - What's In It For Me (40% probability)
- Direct benefits of pursuing this career
- Skills they'll develop
- Impact they can make
- Example: "As a doctor, you'll save lives and help families stay healthy!"

#### C. Career Connection to Current Subject (20% probability)
- How the subject they're about to learn relates to the career
- Real-world applications
- Example: "Doctors use math every day to calculate medicine doses!"

### 3. Implementation Strategy

#### Phase 1: Content Preparation
1. Extract career-specific content from `/docs/SDLC/Phase-0-Planning/00-Audience-Specific-Marketing-Narratives.md`
2. Create a structured database of narration snippets per career
3. Categorize content by type (fun fact, WIFM, subject connection)

#### Phase 2: Audio Generation
1. Use Azure TTS to pre-generate audio files for each snippet
2. Store audio files in a CDN or local cache
3. Create fallback text-to-speech for dynamic content

#### Phase 3: Integration
1. Add `CareerNarrationService` to manage audio playback
2. Integrate with `EnhancedLoadingScreen` component
3. Add audio controls (mute option in settings)

### 4. Content Structure

```typescript
interface CareerNarration {
  careerId: string;
  narrations: {
    funFacts: NarrationSnippet[];
    wifm: NarrationSnippet[];
    subjectConnections: {
      math: NarrationSnippet[];
      ela: NarrationSnippet[];
      science: NarrationSnippet[];
      socialStudies: NarrationSnippet[];
    };
  };
}

interface NarrationSnippet {
  id: string;
  text: string;
  audioUrl?: string;
  duration: number; // in seconds
  gradeRange: {
    min: number; // K=0, 1-12
    max: number;
  };
}
```

### 5. Grade-Appropriate Content
- **K-2**: Simple, exciting facts with enthusiasm
- **3-5**: More detailed facts, introduce career benefits
- **6-8**: Career pathways, skills development
- **9-12**: College preparation, real-world impact

### 6. Audio Characteristics
- **Voice**: Friendly, encouraging tone (matching Harmony companion)
- **Speed**: Moderate pace for clarity
- **Background**: Subtle ambient music (optional, very low volume)

### 7. User Controls
- Global mute setting in user preferences
- Volume control in settings
- Option to skip narration (spacebar or click)

### 8. Performance Considerations
- Preload audio for selected career on app initialization
- Cache frequently used audio clips
- Fallback to visual-only if audio fails to load
- Maximum audio file size: 100KB per clip

### 9. Accessibility
- Provide closed captions option
- Ensure audio doesn't interfere with screen readers
- Visual indicator when audio is playing

### 10. Analytics Tracking
- Track which narrations are heard completely
- Monitor skip rates
- A/B test different content types

## Example Narrations

### Doctor Career
**Fun Fact**: "Medical students practice on special robots that breathe and have heartbeats!"
**WIFM**: "Become a doctor and you'll never stop learning - medicine discovers something new every day!"
**Math Connection**: "Doctors use fractions to measure medicine - just like you're learning now!"

### Teacher Career
**Fun Fact**: "Teachers impact over 3,000 students during their career!"
**WIFM**: "As a teacher, you'll have summers to travel and explore the world!"
**ELA Connection**: "Teachers use storytelling to make every lesson exciting!"

### Software Engineer Career
**Fun Fact**: "The first computer programmer was a woman named Ada Lovelace in 1843!"
**WIFM**: "Software engineers can work from anywhere in the world!"
**Science Connection**: "Coding is like conducting science experiments - test, learn, improve!"

## Success Metrics
- 80% of users listen to complete narration (not skipped)
- Increased engagement scores during loading
- Positive feedback on career awareness
- Reduced perceived loading time

## Future Enhancements
- Dynamic content based on user progress
- Personalized narration using student name
- Career mentor voices (real professionals)
- Interactive audio quiz during longer loads