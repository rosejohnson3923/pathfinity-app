# Built-In Educational Tools Documentation
## Demo Implementation for Pathfinity Learning Platform

### Overview
This document catalogs the built-in educational tools currently implemented as React components within the Pathfinity learning platform. These tools serve as **Phase 1 demo implementations** while the hosted tool infrastructure at `tools.pathfinity.com` is being developed.

---

## Tool Architecture

### Current Implementation Strategy
- **Built-in Tools**: React components embedded directly in the application
- **Detection Logic**: EmbeddedToolRenderer with pattern matching
- **Question Generation**: LearnMasterContainer with skill-specific logic
- **MCP Integration**: MCPToolDiscovery provides metadata for tool selection

### File Structure
```
src/components/tools/educational/
├── CommunityHelperInteractive.tsx      # Social Studies (PreK-2)
├── GrammarInteractive.tsx             # ELA Grammar (7th Grade)
├── LetterIdentificationInteractive.tsx # ELA Letters (PreK-2) 
├── MainIdeaInteractive.tsx            # ELA Main Idea (7th Grade) ⭐ NEW
├── NumberLineInteractive.tsx          # Math Numbers (PreK-2)
├── ReadingComprehensionInteractive.tsx # ELA Reading (7th Grade)
└── ShapeSortingInteractive.tsx        # Science Shapes (PreK-2)
```

---

## Tool Catalog by Grade Level

### PreK-2 Tools (Foundational Skills)

#### **A.0/A.1 Number Line Interactive** 
- **Subject**: Math
- **Skill**: Basic counting and number sequencing
- **Format**: Interactive number line with draggable elements
- **Features**: Visual number representation, click-to-place interactions
- **Questions**: "What number comes next?" / "Place the number on the line"

#### **A.1 Letter Identification Interactive**
- **Subject**: ELA 
- **Skill**: Alphabet recognition and letter identification
- **Format**: Canvas-based letter display with multiple choice
- **Features**: Uppercase/lowercase options, audio support, large clear fonts
- **Questions**: "Find the letter in the alphabet" / "What letter is this?"

#### **A.1 Community Helper Interactive** 
- **Subject**: Social Studies
- **Skill**: Community helper identification and workplace matching
- **Format**: Visual helper icons with 3-option multiple choice (A, B, C)
- **Features**: Reduced from 6 to 3 options, larger icons (90px), single-row layout
- **Questions**: "Who works at the hospital?" / "Where does the firefighter work?"

#### **A.1 Shape Sorting Interactive**
- **Subject**: Science
- **Skill**: Two-dimensional shape classification 
- **Format**: Canvas-based shape recognition with sorting interface
- **Features**: Basic geometric shapes, drag-and-drop classification
- **Questions**: "Classify objects by two-dimensional shape" / "Which shapes are triangles?"

---

### 7th Grade Tools (Advanced Skills)

#### **A.1 Main Idea Interactive** ⭐ **NEW**
- **Subject**: ELA
- **Skill**: Determine the main idea of a passage (Skill A.1)
- **Format**: Reading passage + 3-option multiple choice (A, B, C)
- **Features**: 
  - Grade-appropriate passages (social media, climate change, music education, etc.)
  - Scrollable passage display with larger fonts
  - Letter-based answer submission (A, B, C)
  - Strategic distractors vs. main idea
- **Questions**: "What is the main idea of this passage?"
- **Validation**: Letter-based comparison with automatic advancement

#### **Grammar Interactive** 
- **Subject**: ELA
- **Skill**: Grammar and sentence structure analysis
- **Format**: Sentence correction with multiple choice options
- **Features**: 7th grade grammar concepts, punctuation rules, sentence types
- **Questions**: "Fix the grammar error in this sentence" / "Identify the complete subject"

#### **Reading Comprehension Interactive**
- **Subject**: ELA 
- **Skill**: General reading comprehension (not main idea specific)
- **Format**: Passage + comprehension questions
- **Features**: Differentiated from main idea tool, broader comprehension skills
- **Questions**: Various comprehension question types

---

## Technical Implementation

### Tool Detection Logic (EmbeddedToolRenderer.tsx)

```typescript
// Main Idea Tool Detection
const isMainIdea = toolType === 'generic' && 
  (configuration.toolName?.toLowerCase().includes('main idea') || 
   configuration.description?.toLowerCase().includes('main idea') ||
   configuration.description?.toLowerCase().includes('determine the main idea') ||
   configuration.description?.toLowerCase().includes('a.1'));

// Community Helper Detection  
const isCommunityHelper = toolType === 'generic' && 
  (configuration.toolName?.toLowerCase().includes('community helper') || 
   configuration.description?.toLowerCase().includes('community helper') ||
   configuration.description?.toLowerCase().includes('social studies'));
```

### Question Generation (LearnMasterContainer.tsx)

#### A.1 Main Idea Questions
```typescript
if (skillCode === 'A.1' && (skillName.toLowerCase().includes('main idea') || 
    skillName.toLowerCase().includes('determine the main idea'))) {
  // Generate 7th grade appropriate passages with main idea focus
  const passages = [
    {
      text: "Social media has fundamentally changed how teenagers communicate...",
      mainIdea: "Social media has transformed teenage communication with both positive and negative effects.",
      wrongOptions: [
        "Teenagers prefer social media over face-to-face communication.",
        "Instagram and TikTok are the most popular social media platforms among teens."
      ]
    }
    // ... more passages
  ];
}
```

#### Answer Validation
```typescript
if (currentQ?.questionType === 'main_idea') {
  // Letter-based validation (A, B, C)
  const correctOptionIndex = currentQ?.options?.findIndex(option => option === correctAnswer);
  const correctLetter = correctOptionIndex !== -1 ? String.fromCharCode(65 + correctOptionIndex) : 'A';
  isCorrect = submittedAnswer === correctLetter;
}
```

### MCP Tool Discovery Integration

```typescript
// Enhanced subject detection in MCPToolDiscovery.ts
const isELASubject = subject?.toLowerCase() === 'ela' || 
                    subject?.toLowerCase() === 'english' ||
                    subject?.toLowerCase().includes('reading');

const isScienceSubject = subject?.toLowerCase() === 'science' || 
                        subject?.toLowerCase().includes('physics');

const isSocialStudiesSubject = subject?.toLowerCase() === 'socialstudies' || 
                              subject?.toLowerCase().includes('community');
```

---

## User Experience Flow

### Standard Workflow
1. **Tool Discovery**: MCP system identifies appropriate tool based on skill category
2. **Tool Loading**: EmbeddedToolRenderer detects tool type and loads component  
3. **Question Generation**: LearnMasterContainer creates skill-specific questions
4. **Student Interaction**: Student interacts with tool (clicks, types, selects)
5. **Answer Submission**: Student selects answer, clicks Submit button
6. **Validation**: System validates answer and provides Finn feedback
7. **Progression**: Auto-advance to next question after validation

### Main Idea Tool Specific Flow
1. **Practice Questions** (Top): Shows question + scrollable passage + answer input
2. **Practice Tool** (Bottom): Shows 3 lettered options (A, B, C)
3. **Selection**: Student clicks option → letter appears in answer box
4. **Submission**: Student clicks Submit → validation → feedback → advance

---

## Design Patterns & Standards

### UI/UX Standards
- **Responsive Design**: Works on tablets and desktops
- **Accessibility**: WCAG 2.1 AA compliance with keyboard navigation
- **Touch Support**: Mobile-friendly interactions
- **Font Sizing**: Appropriate for grade level (larger for younger students)
- **Color Coding**: Consistent blue/green/red for neutral/correct/incorrect states

### Multiple Choice Format
- **PreK-2**: 3 visual options with large icons
- **7th Grade**: 3 text options with letter labels (A, B, C)
- **Answer Format**: Letters for text-based, visual selection for interactive tools

### Performance Standards  
- **Load Time**: < 3 seconds for component initialization
- **Interaction Response**: < 500ms for button clicks and selections
- **Memory Usage**: Optimized for browser performance

---

## Current Demo Coverage

### Students Supported
- **Sam (Kindergarten)**: ✅ Math, ELA, Science, Social Studies
- **Jordan (7th Grade)**: ✅ Math, ELA | 🔄 **Next: Science**
- **Taylor (Precalculus)**: ✅ Math (Domain/Range)

### Skills Implemented
- **A.0 Skills**: Basic counting, foundational concepts
- **A.1 Skills**: Number identification, letter recognition, main idea, community helpers, shapes

---

## Next Steps

### Immediate (Phase 1)
1. **Science Tool for Jordan (7th Grade)** - Research 7th grade science skills in skills_master
2. **Complete Demo Coverage** - Ensure all demo students have working tools
3. **Tool Testing** - Validate all tools work correctly with Finn feedback

### Medium-term (Phase 2) 
1. **Hosted Tool Migration** - Move tools to tools.pathfinity.com
2. **Real MCP Integration** - Replace mock discovery with actual tool fetching
3. **Advanced Tools** - B.0, C.0, D.0, E.0 skill categories

### Long-term (Phase 3)
1. **Production MCP Server** - Full tool ecosystem
2. **Teacher Dashboard** - Tool usage analytics and management
3. **Multi-language Support** - Internationalization for tools

---

## Documentation References

- **Tool Architecture**: `/documentation/TOOL_INFRASTRUCTURE_ARCHITECTURE.md`
- **Skills Database**: `/src/data/skillsDataComplete.ts`
- **Skills Analysis**: `/documentation/SKILLS_DATABASE_ANALYSIS_REPORT.md`

---

*Generated: 2025-07-19*  
*Status: Demo Phase Implementation*  
*Next Priority: Science Tool for Jordan (7th Grade)*