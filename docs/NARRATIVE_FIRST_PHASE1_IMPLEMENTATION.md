# Narrative-First Architecture: Phase 1 Implementation Plan
## Real-Time Generation Focus (No Caching Initially)

## Executive Summary
Implement the Narrative-First Architecture with real-time AI generation for testing and validation. Caching will be added in Phase 2 after the core system is proven.

## Simplified Architecture for Phase 1

```
┌──────────────────────────────────────────────────────────┐
│                  MASTER NARRATIVE                           │
│            Real-time Generation ($0.60/call)                │
│                 No caching initially                        │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
    ┌────────────┴────────────┐
    │   MICRO-GENERATORS       │
    │  ($0.0005 per adaptation)│
    └────────────┬────────────┘
                 │
     ┌───────────┼───────────┬──────────┐
     ▼           ▼           ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│  LEARN  │ │EXPERIENCE│ │DISCOVER │
│Container│ │Container │ │Container│
└────┬────┘ └─────────┘ └─────────┘
     │
     ├── Instructional Modal (Video) [NEW]
     ├── Practice Modal (5 questions)
     └── Assessment Modal (1 question)
```

---

## PHASE 1A: Master Narrative Generator (Week 1)

### 1.1 Real-Time Master Narrative Generator

**File**: `/src/services/narrative/MasterNarrativeGenerator.ts`

```typescript
export class MasterNarrativeGenerator {
  private aiService: MultiModelService;

  constructor() {
    this.aiService = new MultiModelService();
  }

  /**
   * Generate Master Narrative in real-time
   * No caching in Phase 1 - direct AI call every time
   */
  async generateMasterNarrative(params: {
    studentName: string;
    gradeLevel: string;
    career: string;        // Passed directly, no templates
    subjects: string[];
  }): Promise<MasterNarrative> {

    // Build prompt for real-time generation
    const prompt = this.buildMasterNarrativePrompt(params);

    // Make real-time AI call ($0.60 cost)
    const response = await this.aiService.generateContent({
      prompt,
      context: {
        container: 'MASTER_NARRATIVE',
        grade: params.gradeLevel,
        career: params.career
      },
      responseFormat: 'json'
    });

    // Validate and return
    const narrative = this.parseAndValidate(response);

    // Log for testing (no cache storage)
    console.log('Generated Master Narrative:', {
      id: narrative.narrativeId,
      career: params.career,
      cost: 0.60
    });

    return narrative;
  }

  private buildMasterNarrativePrompt(params: any): string {
    return `
      Create a comprehensive master narrative for ${params.studentName},
      grade ${params.gradeLevel}, exploring the career of ${params.career}.

      The narrative MUST include all these exact fields in JSON format:

      {
        "narrativeId": "narr_${params.studentName}_${params.career}_${Date.now()}",
        "character": {
          "name": "${params.studentName}",
          "role": "Junior ${params.career} Helper",
          "workplace": "CareerInc ${params.career} Center",
          "personality": "[caring/curious/helpful based on career]",
          "equipment": ["list 4 career-specific tools"]
        },
        "journeyArc": {
          "checkIn": "${params.studentName} arrives at CareerInc Lobby as Junior ${params.career} Helper",
          "learn": "Virtual Academy - ${params.career} Basics",
          "experience": "Virtual Workplace - ${params.career} Work Station",
          "discover": "Virtual Field Trip - ${params.career} in the Community"
        },
        "cohesiveStory": {
          "focus": "[Main focus area for this career]",
          "mission": "[What the student will accomplish]",
          "throughLine": "[Connecting narrative thread]"
        },
        "settingProgression": {
          "learn": {
            "location": "CareerInc Virtual Academy - ${params.career} Classroom",
            "context": "Learning ${params.career} basics with examples",
            "narrative": "${params.studentName} studies how ${params.career}s work"
          },
          "experience": {
            "location": "CareerInc ${params.career} Workplace",
            "context": "${params.studentName}'s workplace for hands-on practice",
            "narrative": "${params.studentName} makes real ${params.career} decisions"
          },
          "discover": {
            "location": "Community ${params.career} Location",
            "context": "Field trip to see ${params.career}s in action",
            "narrative": "${params.studentName} explores how ${params.career}s serve the community"
          }
        },
        "visualTheme": {
          "colors": "[Primary and secondary colors for this career]",
          "setting": "[Visual environment description]",
          "props": "[Key visual elements]"
        },
        "subjectContextsAligned": {
          "math": {
            "learn": "[How ${params.career}s use this math skill]",
            "experience": "[Applying math as a ${params.career}]",
            "discover": "[Math in ${params.career} community work]"
          },
          "ela": {
            "learn": "[How ${params.career}s use this ELA skill]",
            "experience": "[Applying ELA as a ${params.career}]",
            "discover": "[ELA in ${params.career} community work]"
          },
          "science": {
            "learn": "[How ${params.career}s use this science skill]",
            "experience": "[Applying science as a ${params.career}]",
            "discover": "[Science in ${params.career} community work]"
          },
          "socialStudies": {
            "learn": "[How ${params.career}s build community]",
            "experience": "[Community building as a ${params.career}]",
            "discover": "[${params.career}s in the community]"
          }
        }
      }

      IMPORTANT:
      - Generate creative, engaging narrative specific to ${params.career}
      - Ensure all subject contexts relate to actual ${params.career} work
      - Make it age-appropriate for grade ${params.gradeLevel}
      - Create a cohesive story that connects all three containers
    `;
  }

  private parseAndValidate(response: any): MasterNarrative {
    // Validate all required fields exist
    const required = [
      'narrativeId',
      'character',
      'journeyArc',
      'cohesiveStory',
      'settingProgression',
      'visualTheme',
      'subjectContextsAligned'
    ];

    for (const field of required) {
      if (!response[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return response as MasterNarrative;
  }
}
```

**Implementation Tasks**:
- [x] Create MasterNarrativeGenerator class
- [x] Implement real-time generation (no caching)
- [x] Pass career directly (no templates)
- [x] Add comprehensive prompt structure
- [x] Implement validation
- [ ] Add error handling
- [ ] Create test harness

---

## PHASE 1B: Learn Container with Three Modals (Week 1-2)

### 2.1 Learn Container Structure

**File**: `/src/components/containers/LearnContainer.tsx`

```typescript
export const LearnContainer: React.FC<LearnContainerProps> = ({
  assignment,
  studentName,
  gradeLevel,
  onComplete
}) => {
  const [masterNarrative, setMasterNarrative] = useState<MasterNarrative | null>(null);
  const [currentModal, setCurrentModal] = useState<ModalType>('loading');
  const [learnContent, setLearnContent] = useState<LearnContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    generateAllContent();
  }, [assignment]);

  const generateAllContent = async () => {
    try {
      setIsGenerating(true);

      // Step 1: Generate Master Narrative (real-time, no cache)
      console.log('Generating Master Narrative...');
      const narrative = await narrativeGenerator.generateMasterNarrative({
        studentName,
        gradeLevel,
        career: assignment.career, // Direct from assignment
        subjects: ['math', 'ela', 'science', 'socialStudies']
      });
      setMasterNarrative(narrative);

      // Step 2: Search for instructional video
      console.log('Searching for instructional video...');
      const video = await youTubeService.searchEducationalVideos({
        subject: assignment.skills[0].subject,
        skill: assignment.skills[0].skillName,
        gradeLevel,
        duration: { min: 90, max: 180 }
      });

      // Step 3: Generate practice and assessment questions
      console.log('Generating practice questions...');
      const questions = await learnMicroGenerator.generate({
        narrative,
        subject: assignment.skills[0].subject,
        skill: assignment.skills[0],
        practiceCount: 5,
        assessmentCount: 1
      });

      setLearnContent({
        video,
        practiceQuestions: questions.practice,
        assessmentQuestion: questions.assessment
      });

      // Start with instructional modal
      setCurrentModal('instructional');
      setIsGenerating(false);

    } catch (error) {
      console.error('Failed to generate content:', error);
      setIsGenerating(false);
    }
  };

  if (isGenerating || !masterNarrative || !learnContent) {
    return <LoadingScreen message="Creating your personalized learning journey..." />;
  }

  return (
    <div className="learn-container">
      {/* Narrative Header - Always visible */}
      <NarrativeHeader
        narrative={masterNarrative}
        container="learn"
      />

      {/* Progress Bar */}
      <ModalProgressBar
        phases={[
          { name: 'Instructional', status: getModalStatus('instructional') },
          { name: 'Practice', status: getModalStatus('practice') },
          { name: 'Assessment', status: getModalStatus('assessment') }
        ]}
        current={currentModal}
      />

      {/* Modal Rendering */}
      {currentModal === 'instructional' && (
        <InstructionalModal
          video={learnContent.video}
          narrative={masterNarrative}
          onComplete={() => setCurrentModal('practice')}
          onSkip={() => {
            if (confirm('Are you sure you want to skip the instructional video?')) {
              setCurrentModal('practice');
            }
          }}
        />
      )}

      {currentModal === 'practice' && (
        <PracticeModal
          questions={learnContent.practiceQuestions}
          narrative={masterNarrative}
          studentName={studentName}
          onComplete={(results) => {
            console.log('Practice completed:', results);
            setCurrentModal('assessment');
          }}
        />
      )}

      {currentModal === 'assessment' && (
        <AssessmentModal
          question={learnContent.assessmentQuestion}
          narrative={masterNarrative}
          studentName={studentName}
          onComplete={(results) => {
            console.log('Assessment completed:', results);
            onComplete({
              ...results,
              narrative: masterNarrative
            });
          }}
        />
      )}
    </div>
  );
};
```

**Implementation Tasks**:
- [ ] Create enhanced LearnContainer
- [ ] Implement three-modal structure
- [ ] Add real-time narrative generation
- [ ] Create modal state management
- [ ] Add loading states
- [ ] Implement error handling

---

## PHASE 1C: Micro-Generators (Week 2)

### 3.1 Learn Micro-Generator

**File**: `/src/services/narrative/LearnMicroGenerator.ts`

```typescript
export class LearnMicroGenerator {
  private aiService: MultiModelService;

  async generate(params: {
    narrative: MasterNarrative;
    subject: string;
    skill: Skill;
    practiceCount: number;
    assessmentCount: number;
  }): Promise<{
    practice: Question[];
    assessment: Question;
  }> {
    // Extract narrative context for this subject
    const subjectContext = params.narrative.subjectContextsAligned[params.subject];

    // Build micro-generation prompt
    const prompt = `
      Using this narrative context:
      Character: ${params.narrative.character.name} as ${params.narrative.character.role}
      Setting: ${params.narrative.settingProgression.learn.location}
      Subject Context: ${subjectContext.learn}

      Generate content for:
      Skill: ${params.skill.skillName}
      Grade: ${params.skill.gradeLevel}

      Requirements:
      1. Generate exactly ${params.practiceCount} practice questions
      2. Generate exactly ${params.assessmentCount} assessment question
      3. Use ONLY these question types: multiple_choice, true_false
      4. Include career context in the visual presentation
      5. Keep questions skill-focused, career context is visual only

      Example structure for ${params.narrative.character.role} context:
      {
        "practice": [
          {
            "type": "multiple_choice",
            "question": "[Skill question with career visual context]",
            "visual": "[Career-themed visual]",
            "options": ["option1", "option2", "option3", "option4"],
            "correct_answer": 0,
            "hint": "[Helpful hint]",
            "explanation": "[Why this answer is correct]",
            "characterMessage": "${params.narrative.character.name} says: [encouragement]"
          }
        ],
        "assessment": {
          "type": "multiple_choice",
          "question": "[Assessment question]",
          "visual": "[Career-themed visual]",
          "options": ["option1", "option2", "option3", "option4"],
          "correct_answer": 0,
          "success_message": "Great job! ${params.narrative.character.name} is proud!"
        }
      }
    `;

    // Make micro-generation call ($0.0005)
    const response = await this.aiService.generateContent({
      prompt,
      context: {
        container: 'LEARN_MICRO',
        subject: params.subject,
        skill: params.skill.skillCode
      },
      responseFormat: 'json'
    });

    return this.validateQuestions(response);
  }

  private validateQuestions(response: any): any {
    // Ensure we have exactly the right number of questions
    if (!response.practice || response.practice.length !== 5) {
      throw new Error('Must have exactly 5 practice questions');
    }

    if (!response.assessment) {
      throw new Error('Must have 1 assessment question');
    }

    // Validate question types
    const validTypes = ['multiple_choice', 'true_false'];
    for (const question of response.practice) {
      if (!validTypes.includes(question.type)) {
        throw new Error(`Invalid question type: ${question.type}`);
      }
    }

    return response;
  }
}
```

**Implementation Tasks**:
- [ ] Create LearnMicroGenerator
- [ ] Implement narrative context injection
- [ ] Validate question types
- [ ] Add error handling
- [ ] Create similar generators for Experience and Discover

---

## PHASE 1D: YouTube Integration (Week 2)

### 4.1 YouTube Service

**File**: `/src/services/content-providers/YouTubeService.ts`

```typescript
export class YouTubeService {
  private readonly API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

  async searchEducationalVideos(params: {
    subject: string;
    skill: string;
    gradeLevel: string;
    duration?: { min: number; max: number };
  }): Promise<EducationalVideo> {

    // Build search query
    const searchQuery = this.buildSearchQuery(params);

    // Search YouTube Data API
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&` +
      `q=${encodeURIComponent(searchQuery)}&` +
      `type=video&` +
      `videoDuration=${this.getDurationFilter(params.gradeLevel)}&` +
      `safeSearch=strict&` +
      `maxResults=10&` +
      `key=${this.API_KEY}`
    );

    const searchData = await searchResponse.json();

    // Get video details for duration filtering
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
      `part=contentDetails,statistics&` +
      `id=${videoIds}&` +
      `key=${this.API_KEY}`
    );

    const detailsData = await detailsResponse.json();

    // Score and select best video
    const scoredVideos = this.scoreVideos(searchData.items, detailsData.items, params);

    return scoredVideos[0]; // Return best match
  }

  private buildSearchQuery(params: any): string {
    const gradeLabel = params.gradeLevel === 'K' ? 'kindergarten' : `grade ${params.gradeLevel}`;
    return `${params.skill} ${params.subject} ${gradeLabel} educational for kids`;
  }

  private getDurationFilter(gradeLevel: string): string {
    // YouTube API duration filters
    return gradeLevel === 'K' ? 'short' : 'short'; // <4 minutes for all grades initially
  }

  private scoreVideos(searchItems: any[], detailItems: any[], params: any): EducationalVideo[] {
    // Implementation of scoring algorithm
    // Prioritize: educational channels, no ads, appropriate duration, view count
    return searchItems.map((item, index) => {
      const details = detailItems[index];
      const duration = this.parseDuration(details.contentDetails.duration);

      return {
        id: item.id.videoId,
        title: item.snippet.title,
        duration,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium.url,
        score: this.calculateScore(item, details, params)
      };
    }).sort((a, b) => b.score - a.score);
  }
}
```

**Implementation Tasks**:
- [ ] Implement YouTube API integration
- [ ] Create search query builder
- [ ] Add duration parsing
- [ ] Implement scoring algorithm
- [ ] Add error handling for API limits

---

## Testing Plan for Phase 1

### 5.1 Test Scenarios

```typescript
// Test 1: Generate Master Narrative for different careers
const testCareers = ['Doctor', 'Teacher', 'Chef', 'Scientist', 'Artist'];

for (const career of testCareers) {
  const narrative = await narrativeGenerator.generateMasterNarrative({
    studentName: 'Sam',
    gradeLevel: 'K',
    career,
    subjects: ['math', 'ela', 'science', 'socialStudies']
  });

  console.log(`Generated narrative for ${career}:`, narrative);
  // Verify all required fields
  // Check narrative coherence
  // Validate subject alignments
}

// Test 2: Full Learn Container Flow
const learnTest = {
  assignment: {
    career: 'Doctor',
    skills: [{
      subject: 'math',
      skillName: 'Identify numbers up to 3',
      skillCode: 'K.CC.A.3',
      gradeLevel: 'K'
    }]
  },
  studentName: 'Sam',
  gradeLevel: 'K'
};

// Should generate narrative, find video, create questions
// Track timing and costs
```

---

## Phase 1 Success Criteria

| Metric | Target | Notes |
|--------|--------|-------|
| Master Narrative Generation | < 3s | Real-time generation |
| Narrative Completeness | 100% fields | All required fields populated |
| Question Type Validity | 100% | Only multiple_choice and true_false |
| Video Selection | < 2s | Find appropriate video |
| Total Learn Flow | < 10s | From start to first modal |
| Cost per session | ~$0.61 | No caching yet |

---

## Phase 2 Planning (After Phase 1 Success)

Once Phase 1 is working and validated:

1. **Add Caching Layer**
   - Implement 30-day cache for Master Narratives
   - Add cache key generation
   - Implement cache hit/miss tracking
   - Expected cost reduction: 70%+ with cache hits

2. **Add Career Templates** (Optional)
   - Create common career patterns
   - Reduce generation variability
   - Improve narrative consistency

3. **Performance Optimization**
   - Parallel generation where possible
   - Progressive loading
   - Background pre-generation

---

## Immediate Next Steps

1. **Today**:
   - [ ] Create MasterNarrativeGenerator class
   - [ ] Set up test environment
   - [ ] Create mock data for testing

2. **This Week**:
   - [ ] Implement real-time narrative generation
   - [ ] Build InstructionalModal component
   - [ ] Integrate YouTube API

3. **Next Week**:
   - [ ] Complete Learn Container integration
   - [ ] Test with multiple careers
   - [ ] Measure performance and costs

This Phase 1 plan focuses on proving the Narrative-First concept with real-time generation before adding complexity with caching.