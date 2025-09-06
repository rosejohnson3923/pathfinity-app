# Just-In-Time Content Generation Architecture

## Core Principle
**Content is generated at the point of need, maintaining progression and context from previous containers**

## Generation Sequence

```
Day Start → Learn Container (all subjects) → Complete Learn → 
Experience Container (all subjects) → Complete Experience → 
Discover Container (all subjects) → Day Complete
```

## Current Correct Behavior (MUST PRESERVE)

### Phase 1: Learn Container Start
- Student enters Learn container
- System generates content for ALL 4 subjects (Math, ELA, Science, Social Studies)
- Content is career+skill focused
- Generated ONCE, used throughout Learn phase

### Phase 2: Experience Container Start  
- Student completes Learn, enters Experience
- System generates NEW content based on:
  - Same career + skill context
  - Performance data from Learn
  - Real-world application focus
- Generated ONCE for all 4 subjects

### Phase 3: Discover Container Start
- Student completes Experience, enters Discover
- System generates NEW content based on:
  - Same career + skill context
  - Performance from Learn AND Experience
  - Exploration and discovery focus
- Generated ONCE for all 4 subjects

## Architecture Implementation

### 1. Container State Management

```typescript
interface LearningSessionState {
  // Immutable context for the day
  readonly dailyContext: DailyLearningContext;
  
  // Container progression
  containersCompleted: Set<'LEARN' | 'EXPERIENCE' | 'DISCOVER'>;
  
  // Performance data accumulation
  performanceHistory: {
    learn?: ContainerPerformance;
    experience?: ContainerPerformance;
    discover?: ContainerPerformance;
  };
  
  // Generated content cache
  generatedContent: {
    learn?: MultiSubjectContent;
    experience?: MultiSubjectContent;
    discover?: MultiSubjectContent;
  };
}

interface ContainerPerformance {
  subjects: {
    math: SubjectPerformance;
    ela: SubjectPerformance;
    science: SubjectPerformance;
    socialStudies: SubjectPerformance;
  };
  overallAccuracy: number;
  struggledConcepts: string[];
  timeSpent: number;
}
```

### 2. Just-In-Time Generation Service

```typescript
class JustInTimeContentService {
  private sessionState: Map<string, LearningSessionState> = new Map();
  
  /**
   * Generate content ONLY when container is entered
   */
  async generateContainerContent(
    userId: string,
    container: 'LEARN' | 'EXPERIENCE' | 'DISCOVER'
  ): Promise<MultiSubjectContent> {
    const state = this.sessionState.get(userId);
    
    // Check if content already exists (prevent regeneration)
    if (state.generatedContent[container.toLowerCase()]) {
      console.log(`Content already generated for ${container}, returning cached`);
      return state.generatedContent[container.toLowerCase()];
    }
    
    // Validate progression (can't skip containers)
    if (!this.canAccessContainer(container, state)) {
      throw new Error(`Must complete previous containers before accessing ${container}`);
    }
    
    // Generate based on container type and previous performance
    const content = await this.generateBasedOnProgression(container, state);
    
    // Cache the generated content
    state.generatedContent[container.toLowerCase()] = content;
    this.sessionState.set(userId, state);
    
    return content;
  }
  
  private async generateBasedOnProgression(
    container: 'LEARN' | 'EXPERIENCE' | 'DISCOVER',
    state: LearningSessionState
  ): Promise<MultiSubjectContent> {
    const { dailyContext } = state;
    
    switch (container) {
      case 'LEARN':
        // First generation - no prior performance
        return this.generateLearnContent(dailyContext);
        
      case 'EXPERIENCE':
        // Generate based on Learn performance
        return this.generateExperienceContent(
          dailyContext,
          state.performanceHistory.learn
        );
        
      case 'DISCOVER':
        // Generate based on Learn AND Experience performance
        return this.generateDiscoverContent(
          dailyContext,
          state.performanceHistory.learn,
          state.performanceHistory.experience
        );
    }
  }
  
  private async generateLearnContent(
    context: DailyLearningContext
  ): Promise<MultiSubjectContent> {
    const subjects = ['Math', 'ELA', 'Science', 'Social Studies'];
    const content: MultiSubjectContent = {};
    
    // Generate for all subjects at once
    for (const subject of subjects) {
      content[subject] = await this.contentGenerator.generate({
        ...context,
        subject,
        container: 'LEARN',
        focus: 'skill_introduction',
        // No performance data yet
        adaptations: {
          difficulty: 'baseline',
          hints: 'standard',
          scaffolding: 'full'
        }
      });
    }
    
    return content;
  }
  
  private async generateExperienceContent(
    context: DailyLearningContext,
    learnPerformance: ContainerPerformance
  ): Promise<MultiSubjectContent> {
    const subjects = ['Math', 'ELA', 'Science', 'Social Studies'];
    const content: MultiSubjectContent = {};
    
    for (const subject of subjects) {
      const subjectPerf = learnPerformance.subjects[subject.toLowerCase()];
      
      content[subject] = await this.contentGenerator.generate({
        ...context,
        subject,
        container: 'EXPERIENCE',
        focus: 'real_world_application',
        // Adapt based on Learn performance
        adaptations: {
          difficulty: this.calculateDifficulty(subjectPerf),
          focusAreas: subjectPerf.mistakes,
          reinforcement: subjectPerf.accuracy < 0.7,
          scaffolding: subjectPerf.hintsUsed > 3 ? 'extra' : 'normal'
        }
      });
    }
    
    return content;
  }
  
  private async generateDiscoverContent(
    context: DailyLearningContext,
    learnPerformance: ContainerPerformance,
    experiencePerformance: ContainerPerformance
  ): Promise<MultiSubjectContent> {
    const subjects = ['Math', 'ELA', 'Science', 'Social Studies'];
    const content: MultiSubjectContent = {};
    
    for (const subject of subjects) {
      const learnPerf = learnPerformance.subjects[subject.toLowerCase()];
      const expPerf = experiencePerformance.subjects[subject.toLowerCase()];
      
      content[subject] = await this.contentGenerator.generate({
        ...context,
        subject,
        container: 'DISCOVER',
        focus: 'exploration_and_extension',
        // Adapt based on cumulative performance
        adaptations: {
          difficulty: this.calculateCumulativeDifficulty(learnPerf, expPerf),
          readyForAdvanced: (learnPerf.accuracy + expPerf.accuracy) / 2 > 0.8,
          explorationDepth: this.determineExplorationLevel(learnPerf, expPerf),
          connections: this.identifyCrossSubjectConnections(subject, context)
        }
      });
    }
    
    return content;
  }
  
  private canAccessContainer(
    container: 'LEARN' | 'EXPERIENCE' | 'DISCOVER',
    state: LearningSessionState
  ): boolean {
    switch (container) {
      case 'LEARN':
        return true; // Always can start with Learn
        
      case 'EXPERIENCE':
        return state.containersCompleted.has('LEARN');
        
      case 'DISCOVER':
        return state.containersCompleted.has('LEARN') && 
               state.containersCompleted.has('EXPERIENCE');
        
      default:
        return false;
    }
  }
}
```

### 3. Container Entry Points

```typescript
// In MultiSubjectContainerV2.tsx
const MultiSubjectContainerV2: React.FC<Props> = ({
  containerType,
  student,
  selectedCharacter,
  selectedCareer,
  onComplete
}) => {
  const [content, setContent] = useState<MultiSubjectContent | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Generate content ONLY on mount (container entry)
    const generateContent = async () => {
      try {
        setLoading(true);
        
        // Just-in-time generation
        const generatedContent = await justInTimeService.generateContainerContent(
          student.id,
          containerType
        );
        
        setContent(generatedContent);
      } catch (error) {
        console.error(`Failed to generate ${containerType} content:`, error);
        // Use fallback content
        setContent(fallbackService.getContainerContent(containerType));
      } finally {
        setLoading(false);
      }
    };
    
    generateContent();
  }, []); // Empty deps - only run once on mount
  
  // Rest of component...
};
```

### 4. Performance Tracking for Adaptive Generation

```typescript
class PerformanceTracker {
  trackSubjectPerformance(
    userId: string,
    container: string,
    subject: string,
    performance: SubjectPerformance
  ): void {
    const state = this.getSessionState(userId);
    
    // Update performance history
    if (!state.performanceHistory[container]) {
      state.performanceHistory[container] = {
        subjects: {},
        overallAccuracy: 0,
        struggledConcepts: [],
        timeSpent: 0
      };
    }
    
    state.performanceHistory[container].subjects[subject] = performance;
    
    // Identify patterns for next container
    this.analyzePerformancePatterns(state);
    
    this.saveSessionState(userId, state);
  }
  
  private analyzePerformancePatterns(state: LearningSessionState): void {
    // Identify struggling areas
    const struggles = [];
    
    for (const [subject, perf] of Object.entries(state.performanceHistory.learn?.subjects || {})) {
      if (perf.accuracy < 0.6) {
        struggles.push({
          subject,
          concepts: perf.missedConcepts,
          needsReinforcement: true
        });
      }
    }
    
    // Store for next container generation
    state.adaptationNeeds = struggles;
  }
}
```

### 5. Content Caching Strategy

```typescript
class ContentCacheManager {
  private cache = new Map<string, CachedContent>();
  
  getCacheKey(
    userId: string,
    date: string,
    container: string
  ): string {
    // Unique key per user, per day, per container
    return `${userId}-${date}-${container}`;
  }
  
  async getOrGenerate(
    userId: string,
    container: string,
    generator: () => Promise<MultiSubjectContent>
  ): Promise<MultiSubjectContent> {
    const today = new Date().toISOString().split('T')[0];
    const key = this.getCacheKey(userId, today, container);
    
    // Check cache first
    if (this.cache.has(key)) {
      const cached = this.cache.get(key);
      if (!this.isExpired(cached)) {
        console.log(`Using cached content for ${container}`);
        return cached.content;
      }
    }
    
    // Generate fresh content
    console.log(`Generating fresh content for ${container}`);
    const content = await generator();
    
    // Cache it
    this.cache.set(key, {
      content,
      timestamp: Date.now(),
      container,
      userId
    });
    
    return content;
  }
  
  private isExpired(cached: CachedContent): boolean {
    const ONE_DAY = 24 * 60 * 60 * 1000;
    return Date.now() - cached.timestamp > ONE_DAY;
  }
  
  clearUserCache(userId: string): void {
    // Clear at end of day or on logout
    for (const [key, value] of this.cache.entries()) {
      if (value.userId === userId) {
        this.cache.delete(key);
      }
    }
  }
}
```

## Critical Rules

### DO:
1. ✅ Generate ALL subjects for a container at once
2. ✅ Generate ONLY when entering a container
3. ✅ Use performance from previous containers to adapt
4. ✅ Cache generated content for the session
5. ✅ Maintain career+skill consistency across all generated content

### DON'T:
1. ❌ Generate content for all containers upfront
2. ❌ Regenerate content on subject switches
3. ❌ Generate Experience before Learn is complete
4. ❌ Generate Discover before Experience is complete
5. ❌ Lose performance context between containers

## Generation Flow Example

```
Sam(K) - Athlete - Counting to 3

9:00 AM - Enters Learn Container
  → Generate Learn content for Math, ELA, Science, Social Studies
  → All focused on "Counting to 3" with Athlete context
  
10:00 AM - Completes Learn, Enters Experience  
  → System analyzes Learn performance
  → Sam struggled with Science counting
  → Generate Experience content with extra Science reinforcement
  → All still "Counting to 3" with Athlete real-world scenarios
  
11:00 AM - Completes Experience, Enters Discover
  → System analyzes Learn + Experience performance  
  → Sam improved in Science, excelled in Math
  → Generate Discover content with advanced Math exploration
  → All still "Counting to 3" with Athlete discoveries
  
12:00 PM - Day Complete
  → Clear cache for next day
  → Save progress metrics
```

## Benefits of Just-In-Time Generation

1. **Adaptive Learning**: Each container adapts based on previous performance
2. **Efficient Resource Use**: Only generate what's needed, when needed
3. **Fresh Content**: No stale pre-generated content
4. **Context Preservation**: Maintains narrative flow through the day
5. **Performance Optimization**: Reduces initial load time
6. **Personalization**: Real-time adaptation to student needs

## Implementation Priority

1. **Phase 1**: Implement session state management
2. **Phase 2**: Build just-in-time generation service
3. **Phase 3**: Add performance tracking
4. **Phase 4**: Implement adaptive generation logic
5. **Phase 5**: Add caching layer
6. **Phase 6**: Monitor and optimize generation times