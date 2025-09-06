# Question/Answer Type System Design Document

## Document Information
- **Version**: 1.0
- **Date**: January 31, 2025
- **Author**: PathIQ™ Development Team
- **Status**: Draft
- **Review Date**: February 7, 2025

## Executive Summary

This document defines the comprehensive Question/Answer Type System for the Pathfinity learning platform. It establishes a finite set of industry-standard question types that span K-12 education, ensuring consistency between AI-generated content and UI components while maintaining grade-appropriate assessment strategies.

## 1. Problem Statement

### Current Challenges
- **Type Mismatches**: AI generates question types that don't match UI component expectations
- **Inconsistent Naming**: Same question type referred to differently across the system
- **Grade Inappropriateness**: Complex question types presented to young learners
- **Validation Gaps**: No systematic validation between AI output and UI requirements

### Example Issue
```json
// AI Generated (Incorrect)
{
  "question": "True or False: An athlete counted 2 basketballs",
  "type": "counting",  // Wrong type!
  "visual": "🏀 🏀 🏀",
  "correct_answer": "false"
}

// Expected by UI
{
  "question": "True or False: An athlete counted 2 basketballs",
  "type": "true_false",  // Correct type
  "visual": "🏀 🏀 🏀",
  "correct_answer": "false"
}
```

## 2. Industry Analysis

### EdTech Platform Standards

#### IXL Learning
- Focus on skill practice with immediate feedback
- Types: Multiple Choice, Fill-in-Blank, Numeric, Graphing

#### Canvas LMS
- Comprehensive assessment types for all grade levels
- Includes: Quiz, Survey, Discussion, Assignment types

#### Khan Academy
- Progressive difficulty with hints system
- Exercise types matched to Common Core standards

#### Schoology
- Full LMS with rubric-based assessments
- Advanced types for high school and AP courses

## 3. Pathfinity Question Type System

### 3.1 Core Type Definition

```typescript
interface PathfinityQuestionType {
  id: string;                    // Unique identifier
  displayName: string;            // Human-readable name
  category: 'basic' | 'intermediate' | 'advanced';
  minGrade: string;              // Minimum grade level
  maxGrade: string;              // Maximum grade level
  requiresRubric: boolean;       // Needs subjective scoring
  aiComplexity: 'simple' | 'moderate' | 'complex';
  uiComponent: string;           // React component name
  validationMethod: string;      // How to validate answers
  careerContext: boolean;        // Can include career examples
}
```

### 3.2 Complete Type Inventory

## Basic Types (K-5 Primary Focus)

### COUNTING
- **ID**: `counting`
- **Grades**: K-2
- **Description**: Count visual objects
- **UI Component**: `CountingInput`
- **Validation**: Numeric exact match
- **Example**: "How many stethoscopes does the doctor have? 🩺🩺🩺"

### PICTURE_CHOICE
- **ID**: `picture_choice`
- **Grades**: K-3
- **Description**: Select correct image
- **UI Component**: `PictureChoiceGrid`
- **Validation**: Image ID match
- **Example**: "Which tool does a firefighter use? [🔥🚒] [🔨] [📚]"

### TRUE_FALSE
- **ID**: `true_false`
- **Grades**: K-12
- **Description**: Binary true/false selection
- **UI Component**: `TrueFalseButtons`
- **Validation**: Boolean match
- **Example**: "True or False: Doctors help people stay healthy."

### MULTIPLE_CHOICE
- **ID**: `multiple_choice`
- **Grades**: 1-12
- **Description**: Select one correct answer from options
- **UI Component**: `MultipleChoiceInput`
- **Validation**: Option index match
- **Example**: "What does a teacher use to write on the board? a) Pencil b) Chalk c) Paint d) Crayon"

## Intermediate Types (3-8 Primary Focus)

### FILL_BLANK
- **ID**: `fill_blank`
- **Grades**: 2-12
- **Description**: Type missing word/phrase
- **UI Component**: `TextInput`
- **Validation**: String match (with variations)
- **Example**: "A _______ uses a telescope to study stars." (astronomer)

### NUMERIC
- **ID**: `numeric`
- **Grades**: 1-12
- **Description**: Enter numerical answer
- **UI Component**: `NumericInput`
- **Validation**: Number match (with tolerance)
- **Example**: "If a chef needs 3 eggs for each cake and makes 4 cakes, how many eggs total?"

### MATCHING
- **ID**: `matching`
- **Grades**: 3-12
- **Description**: Connect items from two columns
- **UI Component**: `MatchingPairs`
- **Validation**: Pair correspondence
- **Example**: "Match each career with its tool"

### ORDERING
- **ID**: `ordering`
- **Grades**: 3-12
- **Description**: Arrange items in correct sequence
- **UI Component**: `DraggableList`
- **Validation**: Sequence match
- **Example**: "Order these steps a pilot takes before takeoff"

### DRAG_DROP
- **ID**: `drag_drop`
- **Grades**: 2-12
- **Description**: Move items to correct locations
- **UI Component**: `DragDropZone`
- **Validation**: Position match
- **Example**: "Drag each animal to its habitat"

### CATEGORIZATION
- **ID**: `categorization`
- **Grades**: 4-12
- **Description**: Sort items into categories
- **UI Component**: `CategoryBuckets`
- **Validation**: Category membership
- **Example**: "Sort these jobs into Healthcare, Education, or Technology"

## Advanced Types (6-12 Primary Focus)

### SHORT_ANSWER
- **ID**: `short_answer`
- **Grades**: 4-12
- **Description**: 2-3 sentence response
- **UI Component**: `ShortAnswerInput`
- **Validation**: Rubric-based with keywords
- **Rubric Points**: Main idea, Supporting detail, Clarity
- **Example**: "Explain why engineers test their designs multiple times."

### EXTENDED_RESPONSE
- **ID**: `extended_response`
- **Grades**: 6-12
- **Description**: Paragraph-length response
- **UI Component**: `ExtendedTextArea`
- **Validation**: Rubric-based comprehensive
- **Rubric Points**: Thesis, Evidence, Analysis, Conclusion
- **Example**: "Describe how a marine biologist studies ocean ecosystems."

### ESSAY
- **ID**: `essay`
- **Grades**: 7-12
- **Description**: Multi-paragraph composition
- **UI Component**: `EssayEditor`
- **Validation**: Full rubric assessment
- **Rubric Points**: Thesis, Organization, Evidence, Analysis, Style
- **Example**: "Analyze the impact of technology on modern medicine."

### DOCUMENT_ANALYSIS
- **ID**: `document_analysis`
- **Grades**: 8-12
- **Description**: Analyze provided sources
- **UI Component**: `DocumentViewer + EssayEditor`
- **Validation**: Source-based rubric
- **Example**: "Using these primary sources, evaluate the environmental impact of urban development."

### MATHEMATICAL_PROOF
- **ID**: `mathematical_proof`
- **Grades**: 9-12
- **Description**: Step-by-step mathematical reasoning
- **UI Component**: `ProofBuilder`
- **Validation**: Logic and correctness
- **Example**: "Prove that the angle bisectors of a triangle meet at a single point."

### LAB_REPORT
- **ID**: `lab_report`
- **Grades**: 7-12
- **Description**: Scientific method documentation
- **UI Component**: `LabReportTemplate`
- **Validation**: Scientific method rubric
- **Example**: "Document your experiment on plant growth under different light conditions."

### CODE_WRITING
- **ID**: `code_writing`
- **Grades**: 7-12
- **Description**: Write functional code
- **UI Component**: `CodeEditor`
- **Validation**: Code execution and output
- **Example**: "Write a function that calculates the area of different shapes."

### MULTI_PART
- **ID**: `multi_part`
- **Grades**: 6-12
- **Description**: Question with multiple sub-parts
- **UI Component**: `MultiPartContainer`
- **Validation**: Composite scoring
- **Example**: "Part A: Calculate... Part B: Explain your method... Part C: Apply to real scenario..."

## 4. Grade-Appropriate Implementation

### Grade Band Recommendations

#### Kindergarten - Grade 2
```javascript
const K2_TYPES = [
  'counting',        // Visual counting with career contexts
  'picture_choice',  // Image-based selection
  'true_false',      // Simple binary choices
  'multiple_choice'  // With picture support
];
```

#### Grades 3-5
```javascript
const G35_TYPES = [
  'true_false',
  'multiple_choice',
  'numeric',
  'fill_blank',
  'matching',
  'ordering',
  'drag_drop',
  'short_answer'     // Introduction to writing
];
```

#### Grades 6-8
```javascript
const G68_TYPES = [
  'multiple_choice',
  'true_false',
  'fill_blank',
  'numeric',
  'matching',
  'ordering',
  'categorization',
  'short_answer',
  'extended_response',
  'multi_part'       // Complex problem solving
];
```

#### Grades 9-12
```javascript
const G912_TYPES = [
  'multiple_choice',
  'true_false',
  'matching',
  'short_answer',
  'extended_response',
  'essay',
  'document_analysis',
  'mathematical_proof',
  'lab_report',
  'code_writing',
  'multi_part'       // AP and college prep
];
```

## 5. AI Integration Strategy

### 5.1 Prompt Engineering

```typescript
const AI_TYPE_INSTRUCTION = `
CRITICAL: You MUST use ONLY these exact question type identifiers:

Basic Types (K-5):
- counting: Count objects (K-2 only, REQUIRES visual field)
- picture_choice: Select correct image (K-3)
- true_false: Binary true/false (all grades)
- multiple_choice: 4 options, one correct (grade 1+)

Intermediate Types (3-8):
- fill_blank: Single word/phrase answer
- numeric: Number-only answer
- matching: Connect pairs
- ordering: Sequence items
- drag_drop: Move to locations
- categorization: Sort into groups

Advanced Types (6-12):
- short_answer: 2-3 sentences
- extended_response: Paragraph
- essay: Multi-paragraph
- document_analysis: Source-based
- mathematical_proof: Step-by-step proof
- lab_report: Scientific documentation
- code_writing: Programming solution
- multi_part: Multiple sub-questions

RULES:
1. If question starts with "True or False" → type MUST be "true_false"
2. If question asks "How many" → type MUST be "counting" (K-2) or "numeric" (3+)
3. Never use a type outside the grade range
4. Include career context when possible
`;
```

### 5.2 Validation Pipeline

```typescript
class QuestionTypeValidator {
  private readonly typeRegistry = new Map<string, PathfinityQuestionType>();
  
  validate(question: AIGeneratedQuestion, grade: string): ValidationResult {
    // Step 1: Check type exists
    if (!this.typeRegistry.has(question.type)) {
      return {
        valid: false,
        error: `Unknown type: ${question.type}`,
        suggestion: this.suggestType(question)
      };
    }
    
    // Step 2: Check grade appropriateness
    const type = this.typeRegistry.get(question.type);
    if (!this.isGradeAppropriate(type, grade)) {
      return {
        valid: false,
        error: `Type ${question.type} not appropriate for grade ${grade}`,
        suggestion: this.suggestGradeAppropriateType(question, grade)
      };
    }
    
    // Step 3: Check required fields
    return this.validateRequiredFields(question, type);
  }
  
  private validateRequiredFields(question: any, type: PathfinityQuestionType): ValidationResult {
    const validators: Record<string, (q: any) => boolean> = {
      'counting': (q) => !!q.visual && !isNaN(q.correct_answer),
      'multiple_choice': (q) => q.options?.length === 4,
      'true_false': (q) => ['true', 'false'].includes(String(q.correct_answer).toLowerCase()),
      'matching': (q) => q.pairs?.length >= 3,
      'essay': (q) => q.rubric && q.word_count,
      // ... additional validators
    };
    
    const validator = validators[type.id];
    if (validator && !validator(question)) {
      return {
        valid: false,
        error: `Invalid structure for type ${type.id}`
      };
    }
    
    return { valid: true };
  }
}
```

## 6. UI Component Mapping

```typescript
const QUESTION_COMPONENT_MAP = {
  'counting': {
    component: 'CountingInput',
    props: ['visual', 'maxCount', 'showHint'],
    layout: 'vertical'
  },
  'multiple_choice': {
    component: 'MultipleChoiceInput',
    props: ['options', 'columns', 'showImages'],
    layout: 'grid'
  },
  'true_false': {
    component: 'TrueFalseButtons',
    props: ['visual', 'buttonStyle'],
    layout: 'horizontal'
  },
  'short_answer': {
    component: 'ShortAnswerInput',
    props: ['minWords', 'maxWords', 'placeholder'],
    layout: 'vertical'
  },
  'essay': {
    component: 'EssayEditor',
    props: ['wordCount', 'rubric', 'allowFormatting'],
    layout: 'full-width'
  }
  // ... additional mappings
};
```

## 7. Scoring and Validation

### 7.1 Scoring Methods by Type

```typescript
enum ScoringMethod {
  EXACT_MATCH = 'exact_match',        // true_false, multiple_choice
  NUMERIC_MATCH = 'numeric_match',    // numeric, counting
  PARTIAL_CREDIT = 'partial_credit',  // matching, categorization
  KEYWORD_BASED = 'keyword_based',    // short_answer
  RUBRIC_BASED = 'rubric_based',      // essay, extended_response
  CODE_EXECUTION = 'code_execution',  // code_writing
  COMPOSITE = 'composite'              // multi_part
}
```

### 7.2 Rubric Structure for Advanced Types

```typescript
interface Rubric {
  criteria: RubricCriterion[];
  totalPoints: number;
  passingScore: number;
}

interface RubricCriterion {
  name: string;
  description: string;
  points: number;
  levels: {
    excellent: string;
    proficient: string;
    developing: string;
    beginning: string;
  };
}

// Example Essay Rubric
const ESSAY_RUBRIC: Rubric = {
  criteria: [
    {
      name: 'Thesis Statement',
      description: 'Clear, arguable thesis',
      points: 20,
      levels: {
        excellent: 'Compelling, specific thesis that guides entire essay',
        proficient: 'Clear thesis that addresses the prompt',
        developing: 'Thesis present but lacks clarity',
        beginning: 'No clear thesis statement'
      }
    },
    {
      name: 'Evidence & Examples',
      description: 'Supporting evidence from career context',
      points: 30,
      levels: {
        excellent: 'Multiple relevant examples from career field',
        proficient: 'Some good examples with career connection',
        developing: 'Few examples, weak career connection',
        beginning: 'No supporting evidence'
      }
    }
    // ... additional criteria
  ],
  totalPoints: 100,
  passingScore: 70
};
```

## 8. Implementation Phases

### Phase 1: Foundation (Current Sprint)
- Implement basic types: `counting`, `true_false`, `multiple_choice`, `numeric`, `fill_blank`
- Create validation pipeline
- Establish AI prompt templates

### Phase 2: Intermediate (Next Sprint)
- Add: `matching`, `ordering`, `drag_drop`, `categorization`
- Implement partial credit scoring
- Add visual question support

### Phase 3: Advanced (Q2 2025)
- Implement: `short_answer`, `extended_response`, `essay`
- Build rubric scoring system
- Integrate AI-assisted grading

### Phase 4: Specialized (Q3 2025)
- Add: `document_analysis`, `mathematical_proof`, `lab_report`, `code_writing`
- Create subject-specific validators
- Implement peer review features

## 9. Success Metrics

### Technical Metrics
- **Type Match Rate**: >95% correct type assignment by AI
- **Validation Success**: >99% questions pass validation
- **Grade Appropriateness**: 100% questions within grade band

### Educational Metrics
- **Engagement Rate**: Track completion by question type
- **Difficulty Calibration**: Monitor success rates by type and grade
- **Career Context Integration**: >80% questions include career relevance

### Quality Metrics
- **AI Generation Time**: <2 seconds per question
- **UI Render Time**: <100ms per component
- **Scoring Accuracy**: 100% for objective, >90% agreement for subjective

## 10. Migration Strategy

### From Current System
1. Map existing question types to new system
2. Run parallel validation for 2 weeks
3. Migrate UI components progressively
4. Update AI prompts with strict type requirements

### Data Migration
```sql
-- Migration mapping
UPDATE questions 
SET type = CASE
  WHEN question LIKE 'True or False%' THEN 'true_false'
  WHEN question LIKE 'How many%' AND grade <= 2 THEN 'counting'
  WHEN question LIKE 'How many%' AND grade > 2 THEN 'numeric'
  WHEN options IS NOT NULL THEN 'multiple_choice'
  ELSE 'fill_blank'
END
WHERE type IS NULL OR type NOT IN (SELECT id FROM question_types);
```

## 11. Future Considerations

### Machine Learning Integration
- Collect mismatch data for future ML training
- Build confidence scoring for type detection
- Implement auto-correction with human review

### Accessibility
- Ensure all question types support screen readers
- Provide alternative input methods
- Support multiple language presentations

### Career Context Enhancement
- Every question type should support career contextualization
- Build career-specific question banks
- Track engagement by career + question type

## 12. Appendices

### A. Common Core Alignment
[Mapping of question types to Common Core standards]

### B. State Standards Mapping
[State-specific assessment requirements]

### C. International Standards
[IB, Cambridge, etc. requirements]

### D. Accessibility Guidelines
[WCAG compliance for each question type]

## Approval and Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Manager | | | |
| Lead Developer | | | |
| QA Lead | | | |
| Education Director | | | |

---

*This document is version controlled and should be updated as the system evolves. All changes require approval from the Product Manager and Education Director.*