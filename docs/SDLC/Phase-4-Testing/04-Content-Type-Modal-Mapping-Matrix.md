# Content Type to Modal Mapping Matrix
## Ensuring Correct UI Display for AI-Generated Content

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Content Display Verification Framework  
**Owner:** UI/UX Architecture Lead  
**Purpose:** Define and verify the mapping between AI-generated content types and their corresponding UI modal displays

---

## Executive Summary

This document establishes the complete universe of AI-generated content forms and their corresponding UI modal types. It provides traceability between content generation patterns and display mechanisms, ensuring that every type of AI-generated content is properly rendered in the appropriate UI modal with correct interaction patterns.

---

## 1. Content Generation Type Universe

### 1.1 Assessment Content Types

| Content Type | Description | Data Structure | Interaction Pattern | Modal Type | Validation Required |
|--------------|-------------|----------------|---------------------|------------|---------------------|
| **Fill-in-Blank** | Text with missing words/phrases | `{text: string, blanks: [{id, answer, position}]}` | Type or select | FillBlankModal | Text input validation |
| **Single Select (Radio)** | One correct answer from options | `{question: string, options: [{id, text, correct}]}` | Click one option | SingleSelectModal | Exactly one selection |
| **Multiple Select (Checkbox)** | Multiple correct answers | `{question: string, options: [{id, text, correct}], minSelect, maxSelect}` | Click multiple | MultiSelectModal | Min/max selection count |
| **Drag and Drop** | Match items to targets | `{sources: [{id, content}], targets: [{id, accepts}]}` | Drag to position | DragDropModal | Drop zone validation |
| **Sequencing** | Order items correctly | `{items: [{id, content, order}], type: 'vertical'|'horizontal'}` | Reorder items | SequenceModal | Order validation |
| **True/False** | Binary choice | `{statement: string, correct: boolean}` | Toggle selection | BinaryModal | Single boolean |
| **Matching** | Connect related items | `{leftItems: [], rightItems: [], connections: []}` | Draw connections | MatchingModal | Connection validation |
| **Short Answer** | Free text response | `{question: string, acceptedAnswers: [], rubric: {}}` | Text input | ShortAnswerModal | Pattern/keyword match |
| **Essay/Long Form** | Extended response | `{prompt: string, minWords: number, rubric: {}}` | Rich text editor | EssayModal | Length & quality check |
| **Drawing/Annotation** | Visual response | `{canvas: {}, tools: [], instructions: string}` | Draw/annotate | DrawingModal | Gesture validation |

### 1.2 Interactive Content Types

| Content Type | Description | Data Structure | Interaction Pattern | Modal Type | Validation Required |
|--------------|-------------|----------------|---------------------|------------|---------------------|
| **Code Editor** | Programming exercises | `{language: string, starter: string, tests: []}` | Code input | CodeEditorModal | Syntax & test validation |
| **Math Expression** | Mathematical input | `{problem: string, format: 'latex'|'ascii', answer: {}}` | Formula editor | MathInputModal | Expression validation |
| **Graph/Chart Interaction** | Data visualization tasks | `{chartType: string, data: [], interaction: string}` | Click/drag points | GraphModal | Data point validation |
| **Timeline** | Chronological ordering | `{events: [], startDate, endDate, scale: string}` | Position events | TimelineModal | Date validation |
| **Hotspot** | Click on image areas | `{image: url, hotspots: [{area, correct}]}` | Click regions | HotspotModal | Click area validation |
| **Slider/Range** | Numeric selection | `{min: number, max: number, step: number, correct: number}` | Slide to value | SliderModal | Range validation |
| **Matrix/Grid** | Table-based input | `{rows: [], columns: [], cells: []}` | Fill cells | MatrixModal | Cell validation |
| **Branching Scenario** | Decision trees | `{nodes: [], edges: [], outcomes: []}` | Choose path | ScenarioModal | Path validation |
| **Simulation** | Interactive models | `{model: {}, parameters: [], goals: []}` | Manipulate model | SimulationModal | Goal achievement |
| **Voice Response** | Audio input | `{prompt: string, expectedResponse: {}, duration: number}` | Record audio | VoiceModal | Speech recognition |

### 1.3 Collaborative Content Types

| Content Type | Description | Data Structure | Interaction Pattern | Modal Type | Validation Required |
|--------------|-------------|----------------|---------------------|------------|---------------------|
| **Peer Review** | Evaluate peer work | `{submission: {}, rubric: [], feedback: {}}` | Review & rate | PeerReviewModal | Rubric completion |
| **Group Discussion** | Threaded discussions | `{topic: string, posts: [], rules: {}}` | Post & reply | DiscussionModal | Participation check |
| **Collaborative Document** | Shared editing | `{document: {}, permissions: [], tracking: boolean}` | Co-edit | CollabDocModal | Version control |
| **Voting/Polling** | Group decisions | `{question: string, options: [], anonymous: boolean}` | Cast vote | PollModal | Vote validation |
| **Brainstorming** | Idea generation | `{prompt: string, ideas: [], categories: []}` | Add ideas | BrainstormModal | Contribution count |

---

## 2. Modal Type Specifications

### 2.1 Modal Component Registry

```typescript
interface ModalRegistry {
  // Assessment Modals
  FillBlankModal: {
    component: 'FillBlankModal',
    props: {
      content: FillBlankContent,
      validation: 'instant' | 'onSubmit',
      hints: boolean,
      autoComplete: boolean
    },
    events: ['onChange', 'onSubmit', 'onHint']
  },
  
  SingleSelectModal: {
    component: 'SingleSelectModal',
    props: {
      content: SingleSelectContent,
      layout: 'vertical' | 'horizontal' | 'grid',
      randomize: boolean,
      showFeedback: boolean
    },
    events: ['onSelect', 'onSubmit']
  },
  
  MultiSelectModal: {
    component: 'MultiSelectModal',
    props: {
      content: MultiSelectContent,
      minRequired: number,
      maxAllowed: number,
      partialCredit: boolean
    },
    events: ['onToggle', 'onSubmit']
  },
  
  // ... continue for all modal types
}
```

### 2.2 Modal Selection Logic

```typescript
class ModalSelector {
  selectModal(content: AIGeneratedContent): ModalType {
    // Primary selection based on content type
    const primaryModal = this.getPrimaryModal(content.type);
    
    // Override based on special conditions
    if (content.accessibility?.required) {
      return this.getAccessibleModal(primaryModal);
    }
    
    if (content.device === 'mobile') {
      return this.getMobileOptimizedModal(primaryModal);
    }
    
    if (content.collaborative) {
      return this.getCollaborativeModal(primaryModal);
    }
    
    return primaryModal;
  }
  
  getPrimaryModal(contentType: string): ModalType {
    const modalMap = {
      'fill_blank': 'FillBlankModal',
      'single_select': 'SingleSelectModal',
      'multi_select': 'MultiSelectModal',
      'drag_drop': 'DragDropModal',
      'sequence': 'SequenceModal',
      // ... complete mapping
    };
    
    return modalMap[contentType] || 'DefaultModal';
  }
}
```

---

## 3. Content-to-Modal Validation Rules

### 3.1 Validation Matrix

| Content Type | Required Fields | Modal Requirements | Display Rules | Error Handling |
|--------------|-----------------|-------------------|---------------|----------------|
| Fill-in-Blank | blanks[], answers[] | Input fields per blank | Inline or dropdown | Show incorrect blanks |
| Single Select | options[], correctId | Radio buttons | Vertical/horizontal layout | Highlight selection |
| Multiple Select | options[], correctIds[] | Checkboxes | Grid or list | Show partial credit |
| Drag and Drop | sources[], targets[] | Draggable elements | Visual drop zones | Snap-to-grid |
| Sequencing | items[], correctOrder[] | Sortable list | Drag handles | Show correct position |
| True/False | statement, correctAnswer | Toggle or buttons | Clear binary choice | Immediate feedback |
| Matching | pairs[] | Connection lines | Two columns | Highlight matches |
| Short Answer | acceptedAnswers[] | Text input | Single/multi line | Pattern matching |
| Essay | rubric, minLength | Rich text editor | Formatting toolbar | Word count |
| Drawing | canvas, tools[] | Drawing surface | Tool palette | Undo/redo |

### 3.2 Modal Configuration Rules

```typescript
interface ModalConfigurationRules {
  // Content complexity determines modal features
  complexity: {
    simple: ['basic_controls', 'immediate_feedback'],
    moderate: ['hints', 'partial_credit', 'progress_save'],
    complex: ['step_guidance', 'scaffolding', 'detailed_feedback']
  },
  
  // Grade level affects modal presentation
  gradeLevel: {
    'K-2': ['large_buttons', 'audio_support', 'simple_language'],
    '3-5': ['standard_controls', 'visual_hints', 'moderate_text'],
    '6-8': ['advanced_controls', 'text_hints', 'complex_interactions'],
    '9-12': ['full_features', 'minimal_guidance', 'professional_tools']
  },
  
  // Career context modifies modal styling
  careerContext: {
    medical: ['clinical_theme', 'medical_terminology'],
    engineering: ['technical_diagrams', 'calculation_tools'],
    creative: ['artistic_palette', 'creative_tools'],
    business: ['professional_layout', 'data_tables']
  }
}
```

---

## 4. Dynamic Content Generation Patterns

### 4.1 Finn Agent Content Generation

| Finn Agent | Content Types Generated | Preferred Modals | Special Requirements |
|------------|------------------------|------------------|---------------------|
| FinnThink | Problem-solving, logical sequences | SequenceModal, MatrixModal | Step-by-step validation |
| FinnSee | Visual matching, hotspots, drawing | HotspotModal, DrawingModal | Image rendering |
| FinnSpeak | Fill-in-blank, short answer, essay | FillBlankModal, EssayModal | Text processing |
| FinnTool | Simulations, code, calculations | SimulationModal, CodeEditorModal | Tool integration |
| FinnView | All assessment types | All assessment modals | Analytics tracking |
| FinnSafe | Filtered versions of all types | All modals with safety wrapper | Content filtering |

### 4.2 PathIQ Adaptive Selection

```typescript
class PathIQModalSelection {
  selectOptimalModal(
    student: StudentProfile,
    content: Content,
    context: LearningContext
  ): ModalConfiguration {
    
    // Analyze student preferences
    const preferredModality = this.analyzeModalityPreference(student);
    
    // Consider current performance
    const performanceLevel = this.assessCurrentPerformance(student);
    
    // Factor in time of day and fatigue
    const cognitiveLoad = this.calculateCognitiveLoad(context);
    
    // Select base modal
    let modal = this.getBaseModal(content.type);
    
    // Adapt based on student needs
    if (preferredModality === 'visual') {
      modal = this.enhanceVisualElements(modal);
    } else if (preferredModality === 'kinesthetic') {
      modal = this.addInteractiveElements(modal);
    }
    
    // Adjust complexity
    if (cognitiveLoad > 0.7) {
      modal = this.simplifyModal(modal);
    }
    
    // Add supports if struggling
    if (performanceLevel < 0.6) {
      modal = this.addScaffolding(modal);
    }
    
    return modal;
  }
}
```

---

## 5. Testing & Verification Framework

### 5.1 Content-Modal Compatibility Testing

| Test Case | Description | Input | Expected Modal | Validation | Status |
|-----------|-------------|-------|----------------|------------|--------|
| CM-001 | Fill-blank with 3 blanks | FillBlankContent | FillBlankModal | 3 input fields | ⬜ Pass ⬜ Fail |
| CM-002 | Single select with images | SingleSelectContent + images | SingleSelectModal | Image options | ⬜ Pass ⬜ Fail |
| CM-003 | Multi-select with limits | MultiSelectContent (min:2, max:4) | MultiSelectModal | Enforce limits | ⬜ Pass ⬜ Fail |
| CM-004 | Drag-drop with categories | DragDropContent + categories | DragDropModal | Category zones | ⬜ Pass ⬜ Fail |
| CM-005 | Sequence with hints | SequenceContent + hints | SequenceModal | Show hints | ⬜ Pass ⬜ Fail |
| CM-006 | Math with equation editor | MathContent | MathInputModal | LaTeX rendering | ⬜ Pass ⬜ Fail |
| CM-007 | Code with test cases | CodeContent + tests | CodeEditorModal | Run tests | ⬜ Pass ⬜ Fail |
| CM-008 | Drawing with tools | DrawingContent + tools | DrawingModal | Tool palette | ⬜ Pass ⬜ Fail |
| CM-009 | Voice with transcription | VoiceContent | VoiceModal | Speech-to-text | ⬜ Pass ⬜ Fail |
| CM-010 | Collaborative with roles | CollabContent + roles | CollabDocModal | Role permissions | ⬜ Pass ⬜ Fail |

### 5.2 Modal Rendering Verification

```typescript
interface ModalRenderingTests {
  // Verify correct modal loads
  modalLoadTest: {
    input: ContentType,
    expectedModal: ModalType,
    loadTime: number,
    renderCorrect: boolean
  },
  
  // Verify data binding
  dataBindingTest: {
    contentData: any,
    modalDisplay: any,
    bindingCorrect: boolean,
    interactionWorks: boolean
  },
  
  // Verify state management
  stateManagementTest: {
    initialState: any,
    userActions: Action[],
    finalState: any,
    stateCorrect: boolean
  },
  
  // Verify submission handling
  submissionTest: {
    userInput: any,
    validation: ValidationResult,
    scoring: ScoringResult,
    feedbackDisplay: boolean
  }
}
```

---

## 6. Error Prevention & Recovery

### 6.1 Content-Modal Mismatch Prevention

| Potential Issue | Detection Method | Prevention Strategy | Recovery Action |
|-----------------|------------------|---------------------|-----------------|
| Missing modal type | Type checking | Default modal fallback | Load DefaultModal |
| Incompatible data | Schema validation | Transform data | Apply adapter pattern |
| Missing required fields | Field validation | Fill with defaults | Request regeneration |
| Unsupported features | Feature detection | Graceful degradation | Use simpler modal |
| Performance issues | Load testing | Optimize or simplify | Progressive loading |

### 6.2 Runtime Modal Selection

```typescript
class RuntimeModalSelector {
  async selectAndLoadModal(content: AIContent): Promise<Modal> {
    try {
      // Validate content structure
      const validation = await this.validateContent(content);
      if (!validation.valid) {
        return this.handleInvalidContent(content, validation.errors);
      }
      
      // Determine optimal modal
      const modalType = this.determineModalType(content);
      
      // Check modal availability
      if (!this.isModalAvailable(modalType)) {
        return this.loadFallbackModal(content);
      }
      
      // Load and configure modal
      const modal = await this.loadModal(modalType);
      const configured = this.configureModal(modal, content);
      
      // Verify rendering capability
      if (!this.canRender(configured)) {
        return this.simplifyModal(configured);
      }
      
      return configured;
      
    } catch (error) {
      // Fallback to safe default
      return this.loadSafeDefaultModal(content);
    }
  }
}
```

---

## 7. Career-Specific Modal Adaptations

### 7.1 Career Context Modifications

| Career Category | Modal Adaptations | Visual Theme | Tool Integration |
|-----------------|-------------------|--------------|------------------|
| **Healthcare** | Medical terminology, anatomy diagrams | Clinical blue/white | Medical calculators |
| **Engineering** | Technical drawings, equations | Blueprint style | CAD tools |
| **Creative Arts** | Color palettes, design tools | Artistic themes | Creative suites |
| **Business** | Spreadsheets, charts | Professional gray | Financial tools |
| **Technology** | Code editors, terminal | Dark mode | Dev tools |
| **Education** | Teaching aids, rubrics | Bright, friendly | Lesson tools |
| **Science** | Lab equipment, data | Scientific themes | Lab simulators |
| **Trades** | Technical diagrams, measurements | Industrial style | Trade tools |

### 7.2 Career-Modal Mapping

```typescript
interface CareerModalMapping {
  career: string;
  preferredModals: ModalType[];
  customizations: {
    theme: string;
    tools: string[];
    terminology: string[];
    examples: string[];
  };
  restrictions: string[];
}

const careerMappings: CareerModalMapping[] = [
  {
    career: 'Software Developer',
    preferredModals: ['CodeEditorModal', 'SequenceModal', 'MatrixModal'],
    customizations: {
      theme: 'dark-mode-syntax',
      tools: ['debugger', 'console', 'version-control'],
      terminology: ['function', 'variable', 'algorithm'],
      examples: ['code-snippets', 'flowcharts', 'architecture']
    },
    restrictions: []
  },
  // ... more career mappings
];
```

---

## 8. Accessibility Modal Variants

### 8.1 Accessibility Adaptations

| Standard Modal | Accessible Variant | Modifications | Assistive Features |
|----------------|-------------------|---------------|-------------------|
| DragDropModal | KeyboardDragModal | Arrow key navigation | Screen reader support |
| DrawingModal | DescriptiveDrawModal | Voice descriptions | Alternative input |
| HotspotModal | ListSelectModal | Convert to list | Keyboard navigation |
| SliderModal | NumberInputModal | Direct input option | Voice input |
| TimelineModal | TableTimelineModal | Tabular format | Screen reader friendly |

### 8.2 Accessibility Rules

```typescript
class AccessibilityModalAdapter {
  adaptModalForAccessibility(
    modal: ModalType,
    accessibilityNeeds: AccessibilityProfile
  ): ModalType {
    
    let adaptedModal = modal;
    
    // Vision impairments
    if (accessibilityNeeds.vision) {
      adaptedModal = this.addScreenReaderSupport(adaptedModal);
      adaptedModal = this.enhanceContrast(adaptedModal);
      adaptedModal = this.addAudioFeedback(adaptedModal);
    }
    
    // Motor impairments
    if (accessibilityNeeds.motor) {
      adaptedModal = this.addKeyboardNavigation(adaptedModal);
      adaptedModal = this.increaseTouchTargets(adaptedModal);
      adaptedModal = this.addDwellClicking(adaptedModal);
    }
    
    // Cognitive needs
    if (accessibilityNeeds.cognitive) {
      adaptedModal = this.simplifyInterface(adaptedModal);
      adaptedModal = this.addExtraTime(adaptedModal);
      adaptedModal = this.provideHints(adaptedModal);
    }
    
    return adaptedModal;
  }
}
```

---

## 9. Performance Optimization

### 9.1 Modal Loading Strategy

| Modal Complexity | Loading Strategy | Caching Policy | Preload Priority |
|------------------|------------------|----------------|------------------|
| Simple (text only) | Inline loading | Aggressive cache | High |
| Moderate (images) | Lazy loading | Standard cache | Medium |
| Complex (interactive) | Progressive loading | Selective cache | Low |
| Heavy (simulations) | On-demand loading | Minimal cache | None |

### 9.2 Performance Metrics

```typescript
interface ModalPerformanceMetrics {
  modalType: string;
  metrics: {
    loadTime: number;        // Target: <500ms
    renderTime: number;      // Target: <200ms
    interactionDelay: number; // Target: <50ms
    memoryUsage: number;     // Target: <50MB
    cpuUsage: number;        // Target: <30%
  };
  optimizations: {
    codeSpitting: boolean;
    lazyComponents: boolean;
    virtualDOM: boolean;
    webWorkers: boolean;
  };
}
```

---

## 10. Quality Assurance Checklist

### 10.1 Content-Modal Verification Checklist

- [ ] All content types have assigned modal types
- [ ] Modal selection logic handles all content variations
- [ ] Fallback modals defined for all scenarios
- [ ] Accessibility variants available for all modals
- [ ] Career-specific adaptations implemented
- [ ] Performance targets met for all modals
- [ ] Error handling covers all edge cases
- [ ] Mobile variants tested on all devices
- [ ] Cross-browser compatibility verified
- [ ] Integration with Finn agents validated
- [ ] PathIQ adaptation rules implemented
- [ ] Analytics tracking integrated
- [ ] User feedback mechanisms in place
- [ ] Documentation complete for all mappings

### 10.2 Testing Coverage Matrix

| Test Category | Test Cases | Passed | Failed | Coverage |
|---------------|------------|--------|--------|----------|
| Content Type Mapping | 30 | 0 | 0 | 0% |
| Modal Loading | 25 | 0 | 0 | 0% |
| Data Binding | 20 | 0 | 0 | 0% |
| Interaction Handling | 35 | 0 | 0 | 0% |
| Accessibility | 15 | 0 | 0 | 0% |
| Performance | 10 | 0 | 0 | 0% |
| Error Recovery | 12 | 0 | 0 | 0% |
| **TOTAL** | **147** | **0** | **0** | **0%** |

---

## 11. Implementation Verification

### 11.1 Code Implementation Check

```typescript
// Verify implementation exists for each mapping
interface ImplementationChecklist {
  // Content Generators
  contentGenerators: {
    fillBlankGenerator: boolean;
    singleSelectGenerator: boolean;
    multiSelectGenerator: boolean;
    // ... all generators
  };
  
  // Modal Components
  modalComponents: {
    FillBlankModal: boolean;
    SingleSelectModal: boolean;
    MultiSelectModal: boolean;
    // ... all modals
  };
  
  // Selection Logic
  selectionLogic: {
    contentTypeDetection: boolean;
    modalSelection: boolean;
    fallbackHandling: boolean;
    adaptiveSelection: boolean;
  };
  
  // Integration Points
  integrations: {
    finnAgentIntegration: boolean;
    pathIQIntegration: boolean;
    analyticsIntegration: boolean;
    accessibilityIntegration: boolean;
  };
}
```

### 11.2 Runtime Verification

```typescript
class RuntimeVerification {
  async verifyContentModalMapping(
    content: AIGeneratedContent
  ): Promise<VerificationResult> {
    
    const results = {
      contentValid: false,
      modalSelected: false,
      modalLoaded: false,
      databound: false,
      rendered: false,
      interactive: false,
      accessible: false
    };
    
    // Step 1: Validate content structure
    results.contentValid = await this.validateContentStructure(content);
    
    // Step 2: Verify modal selection
    results.modalSelected = await this.verifyModalSelection(content);
    
    // Step 3: Verify modal loads
    results.modalLoaded = await this.verifyModalLoad(content);
    
    // Step 4: Verify data binding
    results.databound = await this.verifyDataBinding(content);
    
    // Step 5: Verify rendering
    results.rendered = await this.verifyRendering(content);
    
    // Step 6: Verify interactivity
    results.interactive = await this.verifyInteractivity(content);
    
    // Step 7: Verify accessibility
    results.accessible = await this.verifyAccessibility(content);
    
    return results;
  }
}
```

---

## Sign-off Requirements

### Technical Approval
- **Frontend Architecture Lead:** _______________________ Date: _________
- **AI/ML Team Lead:** _______________________ Date: _________
- **QA Architecture Lead:** _______________________ Date: _________

### Product Approval
- **Product Manager:** _______________________ Date: _________
- **UX Director:** _______________________ Date: _________

### Compliance Approval
- **Accessibility Lead:** _______________________ Date: _________
- **Education Standards Lead:** _______________________ Date: _________

---

*End of Content Type to Modal Mapping Matrix*

**This document ensures complete traceability between AI-generated content and UI display modals.**

---