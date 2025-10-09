# Learning Modality Tools Implementation Plan

## Overview
This plan details how to implement interactive learning tools in the Discover container that adapt based on the `activity.type` field from rubric-generated content. Each activity type maps to a specific learning modality and displays appropriate interactive tools.

---

## Modality Mapping

### Current Rubric Activity Types
Based on DataRubricTemplateService.ts:
- **Math**: `activity.type: "investigation"` → **Aural (Auditory)**
- **ELA**: `activity.type: "creation"` → **Verbal (Linguistic)**
- **Science**: `activity.type: "exploration"` → **Visual**
- **Social Studies**: `activity.type: "analysis"` → **Logical (Mathematical)**

### Additional Activity Types (Future)
- `activity.type: "experiment"` → **Physical (Kinesthetic)**
- `activity.type: "collaboration"` → **Social (Interpersonal)**
- `activity.type: "reflection"` → **Solitary (Intrapersonal)**

---

## Component Architecture

### 1. Create Base Learning Tool Components

#### Location: `src/components/learning-tools/`

```
learning-tools/
├── LearningToolContainer.tsx       # Main container that routes to specific tools
├── AuralTool.tsx                   # Audio player for listening activities
├── VisualTool.tsx                  # Interactive diagrams/animations
├── VerbalTool.tsx                  # Text editor/word bank
├── LogicalTool.tsx                 # Step-by-step solver/calculator
├── PhysicalTool.tsx                # Drag-drop/manipulatives
├── SocialTool.tsx                  # Collaboration tools
├── SolitaryTool.tsx                # Journal/reflection prompts
└── LearningTool.module.css         # Shared styles
```

### 2. LearningToolContainer (Router Component)

**Purpose**: Determines which tool component to render based on `activity.type`

**Props Interface**:
```typescript
interface LearningToolContainerProps {
  activityType: string;
  activityData: {
    description?: string;
    prompt?: string;
    supportingData?: string;
  };
  subject: string;
  onInteraction?: (data: any) => void;
}
```

**Logic**:
```typescript
const toolMap = {
  'investigation': AuralTool,
  'exploration': VisualTool,
  'creation': VerbalTool,
  'analysis': LogicalTool,
  'experiment': PhysicalTool,
  'collaboration': SocialTool,
  'reflection': SolitaryTool,
};

const ToolComponent = toolMap[activityType] || null;
```

---

## Individual Tool Implementations

### 🔊 AuralTool (Audio Player)
**Activity Type**: `investigation`
**Use Case**: Math - counting beats, listening to patterns

**Features**:
- Play/Pause button
- Replay button
- Volume control
- Visual waveform or metronome
- Playback speed control

**Props**:
```typescript
interface AuralToolProps {
  audioSource?: string;      // URL to audio file
  supportingData?: string;   // Visual aids (sheet music, rhythm notation)
  prompt?: string;           // Instructions
  onComplete?: () => void;
}
```

**UI Structure**:
```
┌─────────────────────────────────────┐
│  🔊 Audio Learning Tool             │
├─────────────────────────────────────┤
│  [▶ Play Audio]  [🔁 Replay]        │
│  Volume: ═══════○═══ 70%           │
│  Speed: [1x] [0.75x] [0.5x]        │
│                                     │
│  Visual: [Metronome Animation]     │
│  or [Waveform Display]             │
└─────────────────────────────────────┘
```

**Implementation Notes**:
- Use HTML5 Audio API
- Store audio files in Azure Storage
- Support multiple audio formats (mp3, wav)
- Track completion for analytics

---

### 👁️ VisualTool (Interactive Diagrams)
**Activity Type**: `exploration`
**Use Case**: Science - exploring shapes, spatial relationships, systems

**Features**:
- Interactive diagrams with hotspots
- Zoom in/out controls
- Rotation controls (for 3D)
- Color highlighting
- Animation play/pause

**Props**:
```typescript
interface VisualToolProps {
  visualType: 'diagram' | '3d-model' | 'animation' | 'chart';
  imageSource?: string;
  interactiveElements?: Array<{
    id: string;
    label: string;
    position: { x: number; y: number };
    info: string;
  }>;
  supportingData?: string;
}
```

**UI Structure**:
```
┌─────────────────────────────────────┐
│  👁️ Visual Learning Tool            │
├─────────────────────────────────────┤
│  [🔍 Zoom In] [🔍 Zoom Out] [↻]     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │   [Interactive Diagram]     │   │
│  │   • Clickable hotspots      │   │
│  │   • Labels on hover         │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  [▶ Play Animation] [⏸ Pause]      │
└─────────────────────────────────────┘
```

**Implementation Notes**:
- Use Canvas API or SVG for interactivity
- Consider using Three.js for 3D models
- Support image zoom/pan gestures
- Store diagrams/models in Azure Storage

---

### 📝 VerbalTool (Text Editor)
**Activity Type**: `creation`
**Use Case**: ELA - writing lyrics, stories, descriptions

**Features**:
- Rich text editor
- Word bank (draggable words)
- Read-aloud functionality (text-to-speech)
- Character/word count
- Writing prompts

**Props**:
```typescript
interface VerbalToolProps {
  wordBank?: string[];
  writingPrompt?: string;
  minWords?: number;
  maxWords?: number;
  readAloud?: boolean;
  supportingData?: string;
}
```

**UI Structure**:
```
┌─────────────────────────────────────┐
│  📝 Verbal Learning Tool            │
├─────────────────────────────────────┤
│  Prompt: "Create song lyrics..."    │
│                                     │
│  Word Bank:                         │
│  [rhythm] [melody] [harmony] [beat] │
│  [tempo] [verse] [chorus]           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Text Editor Area            │   │
│  │ [Student types here...]     │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Words: 15/50  [🔊 Read Aloud]      │
└─────────────────────────────────────┘
```

**Implementation Notes**:
- Use textarea with custom styling
- Drag-drop from word bank to editor
- Use Web Speech API for text-to-speech
- Save drafts automatically

---

### 🧮 LogicalTool (Problem Solver)
**Activity Type**: `analysis`
**Use Case**: Social Studies - analyzing data, patterns, sequences

**Features**:
- Step-by-step solver
- Interactive calculator
- Pattern matcher
- Logic grid
- Data visualization

**Props**:
```typescript
interface LogicalToolProps {
  toolType: 'calculator' | 'pattern-matcher' | 'logic-grid' | 'chart';
  data?: any;
  steps?: string[];
  supportingData?: string;
}
```

**UI Structure**:
```
┌─────────────────────────────────────┐
│  🧮 Logical Learning Tool           │
├─────────────────────────────────────┤
│  Problem: "Analyze the population   │
│  growth pattern..."                 │
│                                     │
│  Step 1: ☐ Identify the data       │
│  Step 2: ☐ Look for patterns       │
│  Step 3: ☐ Compare values           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [Interactive Calculator]   │   │
│  │  or [Pattern Grid]          │   │
│  │  or [Data Chart]            │   │
│  └─────────────────────────────┘   │
│                                     │
│  [💡 Hint] [Show Solution]          │
└─────────────────────────────────────┘
```

**Implementation Notes**:
- Use Chart.js or Recharts for data viz
- Create reusable calculator component
- Support multiple problem-solving strategies
- Track student's problem-solving approach

---

### 🤲 PhysicalTool (Kinesthetic)
**Activity Type**: `experiment`
**Use Case**: Hands-on manipulation, sorting, building

**Features**:
- Drag-and-drop interface
- Touch/gesture controls
- Virtual manipulatives
- Drawing/sketching canvas

**Props**:
```typescript
interface PhysicalToolProps {
  toolType: 'drag-drop' | 'drawing' | 'manipulative' | 'sorting';
  items?: Array<{
    id: string;
    label: string;
    image?: string;
  }>;
  targetZones?: Array<{
    id: string;
    label: string;
    acceptsTypes: string[];
  }>;
}
```

**UI Structure**:
```
┌─────────────────────────────────────┐
│  🤲 Physical Learning Tool          │
├─────────────────────────────────────┤
│  Task: "Sort the objects by shape"  │
│                                     │
│  Items to Sort:                     │
│  [🔴] [🔵] [🔶] [🟢]                 │
│  (draggable)                        │
│                                     │
│  Drop Zones:                        │
│  ┌──────┐  ┌──────┐  ┌──────┐      │
│  │Circle│  │Square│  │Triangle│    │
│  │  🔵  │  │      │  │      │      │
│  └──────┘  └──────┘  └──────┘      │
│                                     │
│  [Reset] [Check Answer]             │
└─────────────────────────────────────┘
```

**Implementation Notes**:
- Use React DnD or native HTML5 drag-drop
- Support touch events for tablets
- Provide visual feedback on drop zones
- Track student's manipulation patterns

---

### 👥 SocialTool (Collaborative)
**Activity Type**: `collaboration`
**Use Case**: Group work, peer review, discussions

**Features**:
- Shared workspace
- Chat/discussion area
- Peer review interface
- Group brainstorming tools

**Props**:
```typescript
interface SocialToolProps {
  collaborationMode: 'discussion' | 'shared-workspace' | 'peer-review';
  groupMembers?: string[];
  discussionPrompts?: string[];
}
```

**UI Structure**:
```
┌─────────────────────────────────────┐
│  👥 Social Learning Tool            │
├─────────────────────────────────────┤
│  Collaboration Task:                │
│  "Work together to solve..."        │
│                                     │
│  Group Members: Sam, Alex, Jordan   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Shared Workspace            │   │
│  │ [All students can edit]     │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Discussion:                        │
│  Sam: "I think we should..."        │
│  Alex: "What about..."              │
│  [Type your message...]             │
└─────────────────────────────────────┘
```

**Implementation Notes**:
- Real-time collaboration using WebSocket
- Store collaboration data in database
- Support async collaboration (not all at once)
- Track individual contributions

---

### 🧘 SolitaryTool (Reflective)
**Activity Type**: `reflection`
**Use Case**: Self-assessment, goal setting, journaling

**Features**:
- Journal prompts
- Self-assessment rubrics
- Goal setting interface
- Personal notes area

**Props**:
```typescript
interface SolitaryToolProps {
  reflectionPrompts: string[];
  selfAssessmentCriteria?: string[];
  privateMode: boolean;
}
```

**UI Structure**:
```
┌─────────────────────────────────────┐
│  🧘 Solitary Learning Tool          │
├─────────────────────────────────────┤
│  Reflection Prompts:                │
│  • What did you learn today?        │
│  • What was challenging?            │
│  • What are you proud of?           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Your Personal Notes         │   │
│  │ (Private - only you see)    │   │
│  │                             │   │
│  │ [Student reflects here...]  │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Self-Assessment:                   │
│  Understanding: ☆☆☆☆☆ (3/5)         │
│  Effort: ☆☆☆☆☆ (4/5)                │
│                                     │
│  [Save to Journal]                  │
└─────────────────────────────────────┘
```

**Implementation Notes**:
- Store reflections privately per student
- Support rich text formatting
- Optional: Export to PDF
- Track reflection patterns over time

---

## Integration with BentoDiscoverCardV2

### Step 1: Import LearningToolContainer
```typescript
import LearningToolContainer from '../learning-tools/LearningToolContainer';
```

### Step 2: Add to Scenario Tile 2 (after activity.prompt)
```typescript
{/* Learning Modality Tool */}
{currentScenario.activity?.type && (
  <div className={styles.learningToolSection}>
    <LearningToolContainer
      activityType={currentScenario.activity.type}
      activityData={{
        description: currentScenario.activity.description,
        prompt: currentScenario.activity.prompt,
        supportingData: currentScenario.activity.supportingData
      }}
      subject={currentScenario.subject || 'Discovery'}
      onInteraction={(data) => {
        console.log('Learning tool interaction:', data);
        // Track analytics, update progress, etc.
      }}
    />
  </div>
)}
```

### Step 3: Add Styles
```css
.learningToolSection {
  background: var(--surface-secondary);
  padding: 16px;
  border-radius: 12px;
  margin-top: 16px;
}
```

---

## Data Requirements

### Audio Files (AuralTool)
- Store in Azure Storage: `/audio/discover/{subject}/{skillId}/`
- Format: MP3 or WAV
- Generate using text-to-speech or record
- Metadata: duration, transcript

### Visual Assets (VisualTool)
- Store in Azure Storage: `/visuals/discover/{subject}/{skillId}/`
- Format: PNG, SVG, or JSON (for 3D)
- Support interactive hotspots
- Metadata: dimensions, hotspot coordinates

### Word Banks (VerbalTool)
- Store in rubric template
- Subject-specific vocabulary
- Grade-appropriate words

---

## Rubric Template Updates Needed

Update DataRubricTemplateService.ts to include tool-specific data:

```typescript
"activity": {
  "type": "investigation",
  "description": "Context about what students are discovering",
  "prompt": "Instructions for approaching this discovery",
  "supportingData": "Visual aids, data, or resources provided",

  // NEW: Tool-specific data
  "toolData": {
    "audioSource": "url-to-audio-file",  // For aural
    "visualSource": "url-to-diagram",    // For visual
    "wordBank": ["word1", "word2"],      // For verbal
    "steps": ["step1", "step2"],         // For logical
    "draggableItems": [...],             // For physical
    "reflectionPrompts": [...]           // For solitary
  }
}
```

---

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- [ ] Create LearningToolContainer component
- [ ] Create base interfaces/types
- [ ] Add styles module
- [ ] Integrate with BentoDiscoverCardV2

### Phase 2: Priority Tools (Week 2-3)
- [ ] AuralTool (Math - investigation)
- [ ] VisualTool (Science - exploration)
- [ ] VerbalTool (ELA - creation)
- [ ] LogicalTool (Social Studies - analysis)

### Phase 3: Advanced Tools (Week 4)
- [ ] PhysicalTool (experiment)
- [ ] SolitaryTool (reflection)
- [ ] SocialTool (collaboration)

### Phase 4: Content & Testing (Week 5)
- [ ] Generate tool-specific content (audio, visuals)
- [ ] Update rubric templates with toolData
- [ ] Test with real rubric content
- [ ] Analytics integration

---

## Analytics Tracking

Track student interactions with learning tools:

```typescript
interface LearningToolAnalytics {
  toolType: string;
  activityType: string;
  subject: string;
  interactions: {
    timestamp: Date;
    action: string;  // 'play', 'pause', 'click', 'drag', etc.
    data: any;
  }[];
  completionTime: number;
  completed: boolean;
}
```

---

## Testing Strategy

1. **Unit Tests**: Each tool component
2. **Integration Tests**: LearningToolContainer routing
3. **E2E Tests**: Full Discover flow with each tool type
4. **Accessibility Tests**: Keyboard navigation, screen readers
5. **Cross-browser Tests**: Chrome, Firefox, Safari, Edge
6. **Mobile Tests**: Touch interactions, responsive layout

---

## Accessibility Considerations

- All audio has text transcripts
- All visuals have alt text descriptions
- Keyboard navigation for all interactive elements
- Screen reader support
- Color contrast compliance
- Focus indicators

---

## Future Enhancements

1. **AI-Generated Content**: Auto-generate audio from text using TTS
2. **Adaptive Tools**: Tools adapt based on student performance
3. **Multi-Modal Support**: Combine multiple learning styles
4. **Gamification**: Points/badges for tool mastery
5. **Teacher Dashboard**: View student tool interaction data
6. **Export Reports**: Student's learning modality preferences

---

## Success Metrics

- **Engagement**: Time spent with learning tools
- **Completion Rate**: % of students who complete tool activities
- **Learning Outcomes**: Correlation between tool use and quiz scores
- **Preference Data**: Which modalities students prefer
- **Accessibility**: Tool usage by students with different needs
