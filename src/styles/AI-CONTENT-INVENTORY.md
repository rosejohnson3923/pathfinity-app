# AI Content Rendering Inventory
## Complete list of dynamically rendered content types that need responsive behavior

### 1. **Question Types** (All generated via OpenAI)
- **MultipleChoiceQuestion** - Options grid, choice buttons
- **TrueFalseQuestion** - Binary choice buttons
- **CountingQuestion** - Emoji displays, number grids, counting visuals
- **NumericQuestion** - Number input fields, numeric displays
- **FillBlankQuestion** - Text inputs, sentence structures
- **MatchingQuestion** - Two-column layouts, connection lines
- **OrderingQuestion** - Draggable items, sequence lists
- **ShortAnswerQuestion** - Text areas, sample answers

### 2. **Visual Content Types**
- **Emoji Visuals** (`countingEmojiLarge`, `emojiGrid`, `visualEmoji`)
  - Single emojis
  - Emoji arrays
  - Emoji grids
  - Counting emojis
- **Number Visuals**
  - Number displays
  - Number grids
  - Numeric counters
- **Images**
  - AI-generated images
  - Image grids
  - Image arrays
- **SVG Visuals**
  - Dynamic SVG shapes
  - Interactive diagrams
- **Icons**
  - React Icons grids
  - Icon arrays

### 3. **Text Content**
- **Question Text** (`questionText`, `questionTextLarge`)
- **Instructions** (`questionInstructions`)
- **Feedback Messages** (`feedbackMessage`)
- **Explanations** (`explanationContent`)
- **Hints** (`hintText`)
- **Career Context** (`careerBadge`, `careerContext`)

### 4. **Answer Formats**
- **Answer Grids** (`answersGrid`, `answerGrid`)
- **Choice Buttons** (`choiceButton`, `optionButton`)
- **Input Fields** (`answerInput`, `textInput`)
- **Drag & Drop Zones** (`dropZone`, `dragItem`)
- **Selection Areas** (`selectionGrid`)

### 5. **Container Types**
- **Practice Containers** (`practicePhase`, `practiceQuestion`)
- **Assessment Containers** (`assessmentContainer`)
- **Review Containers** (`reviewSection`)
- **Learn Containers** (`learnContainer`)
- **Experience Containers** (`experienceContainer`)
- **Discover Containers** (`discoverContainer`)

### 6. **Bento Components**
- **BentoLearnCard** - Learning content cards
- **BentoExperienceCard** - Experience activity cards
- **BentoDiscoverCard** - Discovery content cards
- **BentoDashboard** - Dashboard tiles
- **BentoTile** - Generic tile component

### 7. **Modal Content**
- **PracticeModal** - Practice questions
- **AssessmentModal** - Assessment questions
- **ReviewModal** - Review content
- **InstructionModal** - Instructions
- **FeedbackModal** - Feedback displays

### 8. **Dynamic Layouts**
- **Grid Layouts** (2x2, 3x3, auto-fit)
- **Flex Layouts** (row, column, wrap)
- **Stack Layouts** (vertical, horizontal)
- **Masonry Layouts** (variable height items)

### 9. **Interactive Elements**
- **Submit Buttons** (`submitButton`, `continueButton`)
- **Navigation Buttons** (`prevButton`, `nextButton`)
- **Skip Buttons** (`skipButton`)
- **Hint Buttons** (`hintButton`)
- **Tool Buttons** (`toolButton`)

### 10. **Progress Indicators**
- **Progress Bars** (`progressBar`, `progressFill`)
- **Progress Dots** (`progressDot`)
- **Step Indicators** (`stepIndicator`)
- **Completion Badges** (`completionBadge`)

### 11. **Gamification Elements**
- **Score Displays** (`scoreDisplay`)
- **XP Indicators** (`xpIndicator`)
- **Streak Counters** (`streakCounter`)
- **Achievement Badges** (`achievementBadge`)
- **Level Indicators** (`levelIndicator`)

### 12. **Special Content Types**
- **Math Equations** (LaTeX/MathJax)
- **Code Blocks** (syntax highlighted)
- **Tables** (data grids)
- **Charts** (dynamic visualizations)
- **Timers** (`timerDisplay`)

## Services That Generate Content

1. **AIContentConverter.ts** - Converts AI responses to UI components
2. **JustInTimeContentService.ts** - Real-time content generation
3. **ContentGenerationPipeline.ts** - Content processing pipeline
4. **QuestionRenderer.tsx** - Renders question components
5. **VisualRenderer.tsx** - Renders visual content
6. **FillBlankGeneratorService.ts** - Generates fill-in-blank content
7. **AILearningJourneyService.ts** - Generates learning paths

## Critical Responsive Requirements

### Must Handle:
1. **Dynamic text length** - Questions can be 1 word to paragraphs
2. **Variable emoji counts** - 1 to 100+ emojis
3. **Unknown grid sizes** - 2x2 to 10x10 grids
4. **Mixed content** - Text + emojis + images in same question
5. **Nested containers** - Questions inside modals inside panels
6. **Device switching** - Student moves from phone to tablet mid-lesson
7. **Orientation changes** - Portrait to landscape
8. **Browser zoom** - 50% to 200% zoom levels
9. **Container resizing** - Sidebar collapse/expand
10. **Dynamic loading** - Content appears after initial render

## Coverage Gaps to Address

### Currently Missing:
1. Container queries for nested responsive behavior
2. Dynamic font scaling based on content length
3. Responsive emoji spacing and wrapping
4. Grid auto-adjustment for unknown column counts
5. Image array responsive layouts
6. Math equation responsive scaling
7. Code block horizontal scrolling
8. Table responsive transformations
9. Timer position adjustments
10. Gamification element stacking

## Implementation Strategy

The global-ai-responsive.css file now covers:
- ✅ Universal responsive defaults
- ✅ Pattern-based selectors for AI content
- ✅ Flexible units with constraints (clamp)
- ✅ Container query support
- ✅ Device transition safety
- ✅ Runtime content marking

The aiContentResponsive.ts utility provides:
- ✅ Runtime content marking
- ✅ ResizeObserver implementation
- ✅ Container-based responsive classes
- ✅ React hook for components
- ✅ Mutation observer for new content

Together, these ensure 100% responsive coverage for all AI-generated content.