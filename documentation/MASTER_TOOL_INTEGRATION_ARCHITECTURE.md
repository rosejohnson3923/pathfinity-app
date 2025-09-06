# Master Tool Integration Architecture

## Current Architecture Overview

The Master Tool Interface is integrated into the **Master Container** system, not the legacy ThreePhaseAssignmentPlayer.

### Three-Container Flow
```
Dashboard → "Start Adventure" → ThreeContainerOrchestrator → Master Containers
```

### Master Container Architecture
1. **LearnMasterContainer** - Instruction → Practice → Assessment
2. **CareerTown** - Career selection transition
3. **ExperienceMasterContainer** - Role Setup → Apply Skills → Solve Challenge
4. **DiscoverMasterContainer** - Story Setup → Adventure → Hero's Choice

### Container Purpose & Content Type
- **Experience Container** = **Challenges** (Real-world career applications)
- **Discover Container** = **Scenarios** (Story-based adventures)

### Learning Flow Logic
```
Learn Container: Master the skill (Math A.1, ELA A.1, Science A.1, SocialStudies A.1)
         ↓
Experience Container: Apply skill in real-world CHALLENGE (professional context)
         ↓
Discover Container: Use skill in magical SCENARIO (story adventure)
```

### Subject-Specific Content Generation
Each container creates **subject-specific** content:

**Example: Jordan (7th Grade) - Librarian Career**
- **Experience Challenges:**
  - Math A.1 → "organizing books by number classification and calculating reading statistics"
  - ELA A.1 → "curating age-appropriate reading materials and leading story sessions"
  - Science A.1 → "setting up a science book display and demonstration area"
  - SocialStudies A.1 → "creating exhibits about diverse cultures and community history"

- **Discover Scenarios:**
  - Math A.1 → Story quest using Math skills to "restore the lost stories"
  - ELA A.1 → Story quest using ELA skills to "restore the lost stories"
  - Science A.1 → Story quest using Science skills to "restore the lost stories"
  - SocialStudies A.1 → Story quest using Social Studies skills to "restore the lost stories"

## Tool Integration Points

### Learn Container (✅ Completed)
- **Location**: `src/components/mastercontainers/LearnMasterContainer.tsx`
- **Integration Point**: Practice step (PracticeStep component)
- **Hook**: Uses `useMasterTool` hook for tool management
- **Trigger**: Students grades 7-12 in academic subjects during foundational learning
- **Tool Button**: "Launch Practice Tool" in blue-styled launch section
- **Flow**: 
  1. Instruction (normal content)
  2. Practice (tool launcher appears → MasterToolInterface overlay)
  3. Assessment (after tool completion)

### Experience Container (🔄 Status Unknown)
- **Location**: `src/components/mastercontainers/ExperienceMasterContainer.tsx`
- **Integration Point**: Apply Skills step (ApplySkillsStep component)
- **Status**: Needs verification - not confirmed if useMasterTool hook is integrated
- **Trigger**: Students grades 7-12 in academic subjects during career challenges
- **Flow**: 
  1. Role Setup (career context)
  2. Apply Skills (tool should launch here for professional scenarios)
  3. Solve Challenge (assessment after tool completion)

### Discover Container (🔄 Status Unknown)
- **Location**: `src/components/mastercontainers/DiscoverMasterContainer.tsx`
- **Integration Point**: Adventure step (AdventureStep component)
- **Status**: Needs verification - not confirmed if useMasterTool hook is integrated
- **Trigger**: Students grades 7-12 in academic subjects during story adventures
- **Flow**: 
  1. Story Setup (magical context)
  2. Adventure (tool should launch here for creative scenarios)
  3. Hero's Choice (final assessment)

## Cache Architecture

### Production Environment Cache Strategy

#### **Nightly Batch Process**
```
Night Before → Batch API → Generate Next Day's Lesson Plans → Cache All Learn Container Data
```

**Pre-Generated Content:**
- Subject cards for each student based on grade/curriculum
- Learn Container content (Instruction → Practice → Assessment)
- All foundational learning materials cached and ready

#### **Student Daily Experience Flow**
```
Student Login → Dashboard (Pre-Cached) → Learn Container (Cached) → CareerTown → Real-Time API → Experience + Discover
```

**Morning Login:**
- Dashboard immediately shows pre-cached subject cards
- Learn Container data is pre-cached from nightly batch
- Fast, responsive experience with no API delays

#### **Real-Time Career Selection**
```
Learn Complete → CareerTown → User Selects Career → API Call → Generate:
- 4 Experience Challenges (subject-specific)
- 4 Discover Scenarios (subject-specific)
```

**Why Real-Time for Experience/Discover:**
- Career choice is user-driven (unpredictable)
- Content must be tailored to what they learned that day
- Personalized based on Learn Container results

### Demo vs Production Cache Systems

| Component | Demo System | Production System |
|-----------|-------------|-------------------|
| **Dashboard** | Static `DEMO_USER_CACHE` | Nightly batch cache |
| **Learn Container** | Static `DEMO_USER_CACHE` | Nightly batch cache |
| **Experience Container** | Static `DEMO_USER_CACHE` | Real-time API call |
| **Discover Container** | Static `DEMO_USER_CACHE` | Real-time API call |

### Cache Performance Benefits

#### **Pre-Cache Strategy (Learn Container):**
- ✅ Fast morning startup
- ✅ Smooth learning experience
- ✅ No API delays during instruction
- ✅ Predictable curriculum-based content

#### **Real-Time Strategy (Experience/Discover):**
- ✅ Personalized career content
- ✅ Responds to daily learning outcomes
- ✅ User choice flexibility
- ✅ Acceptable UX delay at career selection point

### API Architecture

#### **Batch API (Nightly)**
- **Purpose**: Generate next day's lesson plans
- **Timing**: Overnight batch process
- **Content**: Learn Container data for all students
- **Frequency**: Daily

#### **Real-Time API (Career Selection)**
- **Purpose**: Generate career-specific content
- **Timing**: After CareerTown selection
- **Content**: Experience challenges + Discover scenarios
- **Frequency**: Per career selection

### Two-Cache Retrieval Points

1. **First Cache Access** (Learn Container start):
   - **Production**: Accesses nightly batch cache
   - **Demo**: Accesses `DEMO_USER_CACHE`
   - **Content**: Today's assignments for all subjects
   - **Trigger**: Student starts learning journey

2. **Second Cache Access** (After CareerTown, before Experience):
   - **Production**: Makes real-time API call
   - **Demo**: Accesses `DEMO_USER_CACHE`
   - **Content**: Career-specific challenges and scenarios
   - **Trigger**: Student completes CareerTown selection

### Cache Generation Logic

#### **Demo System** 
Located in: `scripts/generate-demo-cache.mjs`

**Subject-Specific Content Creation:**
- Each career creates unique challenges/scenarios for each subject
- Content is tailored to show how that subject's skills apply to the career
- Ensures educational relevance and career connection

#### **Production Implementation Considerations**

**Nightly Batch API Requirements:**
- Must generate Learn Container content for all active students
- Should consider individual student progress and curriculum path
- Needs to handle grade-level appropriate content generation
- Must cache data efficiently for fast morning access

**Real-Time Career API Requirements:**
- Must accept Learn Container completion results as input
- Should generate content based on student's actual performance
- Needs to create subject-specific challenges reflecting daily learning
- Must handle concurrent requests during peak usage times

**Data Flow Architecture:**
```typescript
// Morning Access
Dashboard → BatchCacheService.getTodaysLessons(studentId)
Learn Container → BatchCacheService.getLearnContent(studentId, date)

// Career Selection
CareerTown → RealtimeAPI.generateCareerContent({
  studentId,
  selectedCareer,
  learnResults: CompletedSkills[],
  subjects: SubjectProgress[]
})
```

**Performance Considerations:**
- Batch cache should be stored in high-speed storage (Redis/Memory)
- Real-time API should have fast response times (<2 seconds)
- Fallback mechanisms for API failures
- Content versioning for cache invalidation

**Example Cache Structure:**
```typescript
careerContent: {
  "Librarian": {
    "experience": {
      "Math": { /* Math-specific challenge */ },
      "ELA": { /* ELA-specific challenge */ },
      "Science": { /* Science-specific challenge */ },
      "SocialStudies": { /* Social Studies-specific challenge */ }
    },
    "discover": {
      "Math": { /* Math-focused story scenario */ },
      "ELA": { /* ELA-focused story scenario */ },
      "Science": { /* Science-focused story scenario */ },
      "SocialStudies": { /* Social Studies-focused story scenario */ }
    }
  }
}
```

## Tool Mapping by Subject & Grade

### Current Tool Configuration (Tested ✅)
**Eligibility**: Students in grades 7-12 for academic subjects

| Subject | 7th Grade | 8th Grade | 9th-12th Grade | Tool Purpose |
|---------|-----------|-----------|----------------|--------------|
| **Math** | Basic Calculator | Basic Calculator | Algebra Tiles / Graphing Calculator | Mathematical computation & visualization |
| **ELA** | Writing Studio | Writing Studio | Writing Studio | Essay writing & language skills |
| **Science** | Virtual Lab | Virtual Lab | Virtual Lab | Scientific experiments & inquiry |
| **Social Studies** | Interactive Video | Interactive Video | Interactive Video | Video-based learning with interactive practice |

### Tool Selection Logic (FinnOrchestrator)
**Grade-Based Selection:**
- **Grades 7-8**: Basic Calculator for math (middle school level)
- **Grades 9-12**: Advanced tools (Algebra Tiles, Graphing Calculator) for math
- **All Grades**: Subject-specific tools for other subjects

**Subject Detection:**
- **Math**: `subject === 'math'` → Basic Calculator (7-8) or Algebra Tiles (9-12)
- **Science**: `subject === 'science'` → Virtual Lab
- **ELA**: `subject === 'ela'` → Writing Studio
- **Social Studies**: `subject === 'socialstudies'` → Interactive Video

### Tool Integration Logic
Located in: `src/components/mastercontainers/LearnMasterContainer.tsx` (confirmed working)

**Implementation Pattern:**
```typescript
// 1. Import useMasterTool hook
import { useMasterTool } from '../../hooks/useMasterTool';

// 2. Initialize in component
const masterTool = useMasterTool({
  autoAnalyze: true,
  enableFinnGuidance: true,
  onToolComplete: (results) => console.log('Tool completed:', results),
  onToolProgress: (progress) => console.log('Tool progress:', progress)
});

// 3. Create assignment context
const handleLaunchTool = () => {
  const assignmentContext: AssignmentContext = {
    skillCode: assignment.skill.skill_number,
    skillName: assignment.skill.skillName || assignment.skill.skill_name,
    subject: assignment.skill.subject,
    gradeLevel: '7', // From context
    difficulty: assignment.skill.difficulty_level || 5,
    topic: assignment.skill.skillName,
    learningObjective: `Master ${assignment.skill.skillName} concepts`,
    studentId: 'jordan-smith',
    sessionId: `session-${Date.now()}`
  };
  masterTool.openTool(assignmentContext);
};

// 4. Add MasterToolInterface component
{masterTool.isToolVisible && masterTool.currentTool && masterTool.assignment && (
  <MasterToolInterface
    assignment={masterTool.assignment}
    configuration={masterTool.currentTool}
    isVisible={masterTool.isToolVisible}
    onClose={masterTool.closeTool}
    onComplete={masterTool.handleToolComplete}
    onProgress={masterTool.handleToolProgress}
  />
)}
```

**Tool Selection Services:**
- **FinnOrchestrator** (`src/services/FinnOrchestrator.ts`) - Analyzes assignment and selects appropriate tool
- **MasterToolInterface** (`src/components/tools/MasterToolInterface.tsx`) - Renders the selected tool as overlay
- **useMasterTool** (`src/hooks/useMasterTool.ts`) - Manages tool state, lifecycle, and Finn guidance

### Tool Difficulty Progression
- **Learn Container**: Difficulty level 2 (foundational practice)
- **Experience Container**: Difficulty level 3 (career application)
- **Discover Container**: Difficulty level 4 (creative mastery)

## Current Implementation Status

### ✅ Completed & Working
- **LearnMasterContainer** with useMasterTool hook integration
- **Basic Calculator** tool for grades 7-8 Math
- **Writing Studio** tool for all grades ELA
- **Virtual Lab** tool for all grades Science
- **Interactive Video** tool for all grades Social Studies
- **FinnOrchestrator** tool selection logic with null-safety
- **MasterToolInterface** overlay system
- **useMasterTool** hook with Finn guidance

### 🔄 Needs Verification
- **ExperienceMasterContainer** tool integration
- **DiscoverMasterContainer** tool integration
- **Higher grade tools** (Algebra Tiles, Graphing Calculator for grades 9-12)

### 📋 Future Enhancements
- **School Admin configuration** for tool availability
- **Case-insensitive subject matching**
- **Agent-to-agent handoff** for Finn Orchestration

## Key Components

### Active Components
- **ThreeContainerOrchestrator** - Main flow controller
- **LearnMasterContainer** - Learn phase with confirmed tool integration ✅
- **ExperienceMasterContainer** - Experience phase (tool integration status unknown)
- **DiscoverMasterContainer** - Discover phase (tool integration status unknown)
- **MasterToolInterface** - Unified tool interface ✅
- **FinnOrchestrator** - Tool selection logic ✅
- **useMasterTool** - Tool state management hook ✅

### Legacy Components (Not in Active Flow)
- **ThreePhaseAssignmentPlayer** - Old single-assignment component
- **LearnContainer** - Old fallback container
- **ExperienceContainer** - Old experience component
- **DiscoverContainer** - Old discover component

## Tool Selection Logic

### Finn Orchestrator (Current Implementation)
Located in: `src/services/FinnOrchestrator.ts`

**Assignment Analysis Process:**
1. Analyzes assignment context (subject, skillName, topic, gradeLevel)
2. Determines primary concept (equation-solving, graphing, writing, etc.)
3. Selects appropriate tool based on subject and grade level

**Current Tool Selection Rules:**
- **Math**: 
  - Grades 7-8: `basic-calculator-middle`
  - Grades 9+: `algebra-tiles-linear` or `graphing-calculator-basic`
- **Science**: `virtual-lab-chemistry` or `virtual-lab-physics`
- **ELA**: `writing-studio-essay` or `writing-studio-narrative`
- **Social Studies**: `interactive-video-basic`

**Error Handling:**
- Null-safe property access with `|| ''` fallbacks
- Graceful degradation for missing assignment data
- Console logging for debugging tool selection process

### Grade Level Filtering
- **Grades 7-8**: Basic Calculator for math, subject-specific tools for others
- **Grades 9-12**: Advanced tools (Algebra Tiles, Graphing Calculator) for math
- **All Grades**: Virtual Lab (Science), Writing Studio (ELA), Interactive Video (Social Studies)

## Integration Pattern

Each Master Container follows the same pattern:
1. Check if student should use tool (`shouldUseTool()`)
2. Show tool integration UI or standard content
3. Launch MasterToolInterface when requested
4. Continue to next step after tool completion

## Testing

### Confirmed Working ✅
**Jordan Smith (Grade 7):**
- Email: `jordan.smith@oceanview.plainviewisd.edu`
- Password: `password123`
- Flow: Dashboard → "Start Adventure" → Learn Container → Practice step
- **Results**:
  - ✅ Math "Understanding integers" → Basic Calculator launches
  - ✅ ELA "Determine the main idea of a passage" → Writing Studio launches
  - ✅ Science "The process of scientific inquiry" → Virtual Lab launches
  - ✅ Social Studies "Identify lines of latitude and longitude" → Interactive Video launches

### Additional Testing Required
**Taylor Johnson (Grade 10):**
- Email: `taylor.johnson@cityview.plainviewisd.edu`
- Password: `password123`
- Expected: Math should use Algebra Tiles/Graphing Calculator (not Basic Calculator)
- Flow: Dashboard → "Start Adventure" → Learn Container → Practice step

**Other Master Containers:**
- Experience Container tool integration needs verification
- Discover Container tool integration needs verification