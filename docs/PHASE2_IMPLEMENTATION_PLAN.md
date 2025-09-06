# Phase 2 Implementation Plan - Consistency & Context

## Executive Summary
Phase 2 focuses on implementing the Career-Skill Consistency System and AI Prompt Engineering to ensure coherent learning experiences across all subjects and containers.

**Phase Duration**: Weeks 5-7 (3 weeks)
**Priority**: CRITICAL - Addresses user's top requirement
**Dependencies**: Phase 1 Complete ✅

---

## Phase 2.1: Career-Skill Consistency System (10 days)

### Component 1: DailyLearningContextManager (3 days)
**Priority**: CRITICAL
**Location**: `/src/services/content/DailyLearningContextManager.ts`

#### Implementation Tasks:
```typescript
interface DailyLearningContext {
  readonly studentId: string
  readonly date: string
  readonly primarySkill: Skill      // Same all day
  readonly career: Career          // Same all day
  readonly companion: Companion    // Same all day
  readonly subjects: Subject[]     // All subjects for the day
  readonly startTime: Date
  readonly endTime?: Date
}

class DailyLearningContextManager {
  // Singleton pattern
  private static instance: DailyLearningContextManager
  private currentContext: DailyLearningContext | null = null
  
  // Core methods
  createDailyContext(student: StudentProfile): DailyLearningContext
  getCurrentContext(): DailyLearningContext | null
  validateContextConsistency(content: Content): boolean
  adaptSkillToSubject(subject: Subject): SubjectAdaptedSkill
  getContextForContainer(containerId: string): ContainerContext
  persistContext(): void
  restoreContext(studentId: string): DailyLearningContext | null
}
```

#### Key Features:
- [ ] Immutable daily context creation
- [ ] Context persistence (localStorage/sessionStorage)
- [ ] Context restoration on page refresh
- [ ] Validation methods for consistency
- [ ] Subject-specific skill adaptations
- [ ] Container-specific context retrieval

---

### Component 2: SkillAdaptationService (4 days)
**Priority**: HIGH
**Location**: `/src/services/content/SkillAdaptationService.ts`

#### Implementation Tasks:
```typescript
interface SkillAdaptation {
  originalSkill: Skill
  subject: Subject
  adaptedDescription: string
  learningObjectives: string[]
  careerConnection: string
  practiceContext: string
  assessmentFocus: string
}

class SkillAdaptationService {
  // Skill to subject mapping
  adaptSkillToMath(skill: Skill, career: Career): SkillAdaptation
  adaptSkillToELA(skill: Skill, career: Career): SkillAdaptation
  adaptSkillToScience(skill: Skill, career: Career): SkillAdaptation
  adaptSkillToSocialStudies(skill: Skill, career: Career): SkillAdaptation
  
  // Validation
  validateAdaptation(adaptation: SkillAdaptation): boolean
  maintainsLearningObjective(original: Skill, adapted: SkillAdaptation): boolean
  
  // Context generation
  generateSubjectContext(skill: Skill, subject: Subject, career: Career): string
  generatePracticeScenarios(adaptation: SkillAdaptation): Scenario[]
}
```

#### Adaptation Examples:
```typescript
// Original Skill: "Problem Solving"
// Career: "Game Developer"

// Math Adaptation:
"Use problem-solving to debug game physics calculations"

// ELA Adaptation:
"Write clear documentation for game features using problem-solving structure"

// Science Adaptation:
"Apply problem-solving to optimize game performance and graphics"

// Social Studies Adaptation:
"Analyze how games solve social problems through interactive storytelling"
```

---

### Component 3: ConsistencyValidator (3 days)
**Priority**: HIGH
**Location**: `/src/services/content/ConsistencyValidator.ts`

#### Implementation Tasks:
```typescript
interface ConsistencyReport {
  isConsistent: boolean
  careerAlignment: number  // 0-100%
  skillAlignment: number   // 0-100%
  violations: Violation[]
  suggestions: string[]
}

class ConsistencyValidator {
  // Career validation
  validateCareerContext(content: Content, career: Career): boolean
  detectCareerDrift(contents: Content[]): Violation[]
  
  // Skill validation
  validateSkillFocus(content: Content, skill: Skill): boolean
  detectSkillDilution(contents: Content[]): Violation[]
  
  // Cross-subject validation
  validateCrossSubjectCoherence(contents: Content[]): ConsistencyReport
  validateDailyJourney(allContents: Content[]): ConsistencyReport
  
  // Auto-correction
  suggestCorrections(violations: Violation[]): Correction[]
  enforceConsistency(content: Content, context: DailyLearningContext): Content
}
```

---

## Phase 2.2: AI Prompt Engineering (5 days)

### Component 4: PromptTemplateLibrary (3 days)
**Priority**: HIGH
**Location**: `/src/services/content/PromptTemplateLibrary.ts`

#### Implementation Tasks:
```typescript
interface PromptTemplate {
  id: string
  type: QuestionType
  subject: Subject
  gradeLevel: Grade
  template: string
  requiredVariables: string[]
  constraints: string[]
  examples: Example[]
}

class PromptTemplateLibrary {
  // Template management
  private templates: Map<string, PromptTemplate>
  
  // Template retrieval
  getTemplate(type: QuestionType, subject: Subject, grade: Grade): PromptTemplate
  getCareerTemplate(career: Career): string
  getSkillTemplate(skill: Skill): string
  
  // Template building
  buildPrompt(template: PromptTemplate, context: Context): string
  injectCareerContext(prompt: string, career: Career): string
  injectSkillFocus(prompt: string, skill: Skill): string
  
  // Quality assurance
  validatePrompt(prompt: string): ValidationResult
  testPromptEffectiveness(prompt: string): EffectivenessScore
}
```

#### Sample Prompt Templates:
```typescript
// Math Counting Question for Grade K with Game Developer Career
const template = `
Generate a counting question for Kindergarten students learning ${skill}.
Career Context: Game Developer - ${careerDescription}

REQUIREMENTS:
1. Question MUST involve counting game-related objects
2. Use exactly ${targetNumber} objects (between 1-10)
3. Objects must be: ${gameObjects} (sprites, coins, hearts, stars, etc.)
4. Language must be simple and clear
5. Include visual representation using emojis

STRUCTURE:
{
  "question": "How many [game objects] does the game character need to collect?",
  "visual": "[exactly ${targetNumber} relevant emojis]",
  "correct_answer": ${targetNumber},
  "hint": "Count each [object] carefully, just like counting game points!",
  "explanation": "Great job! You counted ${targetNumber} [objects]. Game developers use counting to track scores!"
}

FORBIDDEN:
- Abstract concepts
- Numbers above 10
- Complex sentences
- Non-visual questions
`
```

---

### Component 5: PromptValidator (2 days)
**Priority**: MEDIUM
**Location**: `/src/services/content/PromptValidator.ts`

#### Implementation Tasks:
```typescript
class PromptValidator {
  // Required elements checking
  validateRequiredElements(prompt: string, requirements: string[]): boolean
  validateCareerPresence(prompt: string, career: Career): boolean
  validateSkillPresence(prompt: string, skill: Skill): boolean
  
  // Constraint validation
  validateGradeAppropriateness(prompt: string, grade: Grade): boolean
  validateSubjectAlignment(prompt: string, subject: Subject): boolean
  
  // Effectiveness tracking
  trackPromptSuccess(prompt: string, response: AIResponse): void
  getPromptEffectiveness(promptId: string): EffectivenessMetrics
  identifyFailurePatterns(failures: FailedPrompt[]): Pattern[]
  
  // Improvement suggestions
  suggestPromptImprovements(prompt: string, failures: Failure[]): string
  optimizePrompt(prompt: string): string
}
```

---

## Integration Plan

### Week 5: Foundation (Days 1-5)
**Focus**: DailyLearningContextManager + Initial SkillAdaptationService

Day 1-2: DailyLearningContextManager
- [ ] Create context structure
- [ ] Implement singleton pattern
- [ ] Add persistence layer
- [ ] Create restoration logic

Day 3-4: SkillAdaptationService (Part 1)
- [ ] Define adaptation interfaces
- [ ] Create Math adaptations
- [ ] Create ELA adaptations

Day 5: Integration Testing
- [ ] Test context persistence
- [ ] Validate skill adaptations
- [ ] Verify singleton behavior

### Week 6: Completion (Days 6-10)
**Focus**: Complete SkillAdaptationService + ConsistencyValidator

Day 6-7: SkillAdaptationService (Part 2)
- [ ] Create Science adaptations
- [ ] Create Social Studies adaptations
- [ ] Add validation methods

Day 8-10: ConsistencyValidator
- [ ] Implement career validation
- [ ] Implement skill validation
- [ ] Create cross-subject validation
- [ ] Add auto-correction

### Week 7: AI Integration (Days 11-15)
**Focus**: PromptTemplateLibrary + PromptValidator

Day 11-13: PromptTemplateLibrary
- [ ] Create template structure
- [ ] Build subject-specific templates
- [ ] Add career/skill injection
- [ ] Create template builder

Day 14-15: PromptValidator
- [ ] Implement validation rules
- [ ] Add effectiveness tracking
- [ ] Create optimization logic

---

## Testing Strategy

### Unit Tests Required:
```typescript
// DailyLearningContextManager
- Context creation with all required fields
- Context immutability
- Persistence and restoration
- Subject adaptation retrieval

// SkillAdaptationService
- Each subject adaptation method
- Career context preservation
- Learning objective maintenance
- Scenario generation

// ConsistencyValidator
- Career drift detection
- Skill dilution detection
- Cross-subject coherence
- Auto-correction suggestions

// PromptTemplateLibrary
- Template retrieval by criteria
- Variable injection
- Career/skill context injection
- Prompt building

// PromptValidator
- Required element detection
- Grade appropriateness
- Subject alignment
- Effectiveness tracking
```

---

## Success Criteria

### Phase 2.1 Success Metrics:
- [ ] 100% career consistency across all subjects
- [ ] 100% skill focus maintained in all content
- [ ] Context persists across page refreshes
- [ ] All subjects show coherent adaptations
- [ ] Validation catches 95% of inconsistencies

### Phase 2.2 Success Metrics:
- [ ] Structured prompts for all type/subject/grade combinations
- [ ] 95% AI response validation success rate
- [ ] Career context in 100% of prompts
- [ ] Skill focus in 100% of prompts
- [ ] Measurable prompt effectiveness tracking

---

## Risk Mitigation

### Identified Risks:
1. **Context Loss on Refresh**
   - Mitigation: Robust persistence layer with fallback to server
   
2. **Skill Adaptation Complexity**
   - Mitigation: Start with simple adaptations, iterate based on feedback
   
3. **AI Prompt Variance**
   - Mitigation: Strict templates with validation and fallback

4. **Cross-Subject Incoherence**
   - Mitigation: ConsistencyValidator with auto-correction

---

## Dependencies

### Required from Phase 1:
- ✅ Question type definitions
- ✅ Content request structure
- ✅ Validation service
- ✅ Template engine
- ✅ Fallback provider

### External Dependencies:
- AI service connection (for prompt testing)
- Student profile service
- Career/skill database

---

## Deliverables

### Code Deliverables:
1. DailyLearningContextManager.ts
2. SkillAdaptationService.ts
3. ConsistencyValidator.ts
4. PromptTemplateLibrary.ts
5. PromptValidator.ts

### Documentation:
1. Skill adaptation mapping guide
2. Prompt template documentation
3. Consistency rules documentation
4. Integration guide for containers

### Testing:
1. Unit tests for all services
2. Integration tests for context flow
3. E2E tests for consistency validation

---

## Next Steps After Phase 2

### Immediate Priority:
- Phase 3: Just-In-Time Generation
  - Session State Manager
  - JIT Content Service
  - Performance Tracker
  - Container Integration

### Future Phases:
- Phase 4: Gamification & Hints
- Phase 5: Integration & Testing
- Phase 6: Deployment

---

## Implementation Notes

### Critical Requirements:
1. **Career + Skill MUST be consistent** across ALL subjects and containers
2. Context must survive page refreshes
3. All content must reference the daily career
4. All content must reinforce the daily skill
5. Adaptations must maintain learning objectives

### Architecture Decisions:
1. Use singleton for context manager (one context per session)
2. Immutable context objects (no accidental mutations)
3. Validate at generation AND consumption points
4. Fail safely with fallback content
5. Track all validation failures for improvement

---

*Document Version*: 1.0
*Created*: Current Date
*Phase 1 Status*: ✅ COMPLETE
*Phase 2 Status*: 🚀 READY TO START