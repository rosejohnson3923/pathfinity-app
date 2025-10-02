# Basic Template Implementation Plan
## Lesson Plan & Rubric Generation System

### Overview
This document defines the complete implementation strategy for automatically generating Basic subscription lesson plans and rubrics based on skill numbers and subjects.

---

## 🎯 Core Architecture

### 1. Template Structure
```
BasicLessonTemplate
├── Metadata (Generated from inputs)
├── Narrative Framework (Career-agnostic structure)
├── Skill Integration (Dynamic based on standards)
├── Assessment Criteria (Auto-generated from skills)
└── Rubric Evaluation (Quality metrics)
```

### 2. Input Requirements
```typescript
interface BasicLessonInput {
  student: {
    name: string;
    grade: number; // 7 for Jordan
    currentDate: Date;
  };

  skills: {
    math: { cluster: string; number: string; name: string; };
    ela: { cluster: string; number: string; name: string; };
    science: { cluster: string; number: string; name: string; };
    social: { cluster: string; number: string; name: string; };
  };

  // These are chosen by student at runtime
  career?: string; // Unknown at generation time
  companion?: string; // Unknown at generation time
}
```

---

## 📐 Basic Template Components

### Component 1: Demonstrative Lesson Generator
```typescript
class BasicDemonstrativeLessonGenerator {
  // Generates sample lesson with random career for parent preview

  generateDemonstrativeLesson(input: BasicLessonInput): DemonstrativeLesson {
    const sampleCareer = this.selectRandomCareer();
    const sampleCompanion = this.selectRandomCompanion();

    return {
      header: this.generateHeader(input, sampleCareer, sampleCompanion),
      narrative: this.generateNarrative(input.skills, sampleCareer),
      activities: this.mapSkillsToActivities(input.skills, sampleCareer),
      assessment: this.generateAssessment(input.skills),
      skillsVerification: this.generateSkillsTable(input.skills),
      guarantee: this.generateGuarantee()
    };
  }
}
```

### Component 2: Narrative Template Engine
```typescript
class BasicNarrativeEngine {
  // Three-act structure that adapts to any career

  templates = {
    act1: {
      intro: "Welcome to [WORKPLACE], [CAREER] [STUDENT]! Today's mission requires all your skills!",

      math: {
        template: "[MATH_CONTEXT] using [SKILL_NAME] [GRADE.CLUSTER.NUMBER]",
        contexts: {
          'integers': ['temperature readings', 'profit/loss calculations', 'elevation changes'],
          'ratios': ['mixing ingredients', 'scale models', 'speed calculations']
        }
      },

      ela: {
        template: "[ELA_CONTEXT] to find [SKILL_NAME] [GRADE.CLUSTER.NUMBER]",
        contexts: {
          'main_idea': ['research articles', 'instruction manuals', 'client briefs'],
          'inference': ['hidden clues', 'between the lines', 'unspoken needs']
        }
      }
    },

    act2: {
      challenge: "INTEGRATED CHALLENGE: [CAREER_CRISIS]",
      integration: "Use all four skills to solve the problem!"
    },

    act3: {
      presentation: "Present your findings to [AUTHORITY_FIGURE]!",
      celebration: "Earn your Junior [CAREER] certification!"
    }
  };
}
```

### Component 3: Skill Mapping Service
```typescript
class BasicSkillMappingService {
  // Maps Common Core standards to career contexts

  private skillDatabase = {
    'Math.7.A.A.1': {
      name: 'Understanding integers',
      concepts: ['positive/negative numbers', 'zero', 'number line', 'opposites'],
      difficulty: 'medium',
      prerequisites: ['6.NS.C.5', '6.NS.C.6'],
      assessmentCriteria: {
        mastery: 'Plot 5 integers correctly',
        proficient: 'Identify positive vs negative',
        developing: 'Understand zero as origin'
      }
    },

    'ELA.7.A.A.1': {
      name: 'Determine the main idea of a passage',
      concepts: ['central theme', 'supporting details', 'summary', 'key points'],
      difficulty: 'medium',
      prerequisites: ['6.RI.2'],
      assessmentCriteria: {
        mastery: 'Main idea + 3 supporting details',
        proficient: 'Identify main idea',
        developing: 'Distinguish topic from details'
      }
    },

    'Science.7.A.A.1': {
      name: 'The process of scientific inquiry',
      concepts: ['observation', 'hypothesis', 'experiment', 'conclusion'],
      difficulty: 'medium',
      prerequisites: ['6-8.SP1'],
      assessmentCriteria: {
        mastery: 'Complete all 6 steps independently',
        proficient: 'Follow inquiry with guidance',
        developing: 'Understand observation-hypothesis'
      }
    },

    'Social.7.A.A.1': {
      name: 'Identify lines of latitude and longitude',
      concepts: ['coordinates', 'hemispheres', 'navigation', 'global position'],
      difficulty: 'medium',
      prerequisites: ['6.G.1'],
      assessmentCriteria: {
        mastery: 'Navigate 3+ coordinates accurately',
        proficient: 'Identify lat/long on map',
        developing: 'Understand coordinate system'
      }
    }
  };

  mapSkillToCareer(skillCode: string, career: string): CareerContext {
    const skill = this.skillDatabase[skillCode];
    const context = this.careerContexts[career] || this.genericContext;

    return {
      narrative: context.generateNarrative(skill),
      examples: context.generateExamples(skill),
      vocabulary: context.getVocabulary(skill)
    };
  }
}
```

### Component 4: Assessment Generator
```typescript
class BasicAssessmentGenerator {
  // Generates skill-appropriate assessments

  generateAssessment(skills: SkillSet): Assessment {
    return {
      math: this.generateMathAssessment(skills.math),
      ela: this.generateELAAssessment(skills.ela),
      science: this.generateScienceAssessment(skills.science),
      social: this.generateSocialAssessment(skills.social),

      rubric: {
        passingScore: 70,
        masteryScore: 90,
        attempts: 3,
        hints: 'available after attempt 1'
      }
    };
  }

  private generateMathAssessment(skill: Skill): Question[] {
    // For 7.A.A.1 (integers)
    return [
      {
        type: 'multiple_choice',
        question: 'Which temperature is coldest?',
        options: ['-20°C', '-5°C', '0°C', '+10°C'],
        correct: 0,
        hint: 'Negative numbers get smaller as they go down'
      },
      {
        type: 'plotting',
        question: 'Plot these on a number line: -3, 0, +5',
        evaluation: 'Check relative positions'
      },
      {
        type: 'calculation',
        question: 'Temperature change from +15° to -5°?',
        answer: -20,
        workRequired: true
      }
    ];
  }
}
```

### Component 5: Rubric Evaluation Engine
```typescript
class BasicRubricEngine {
  // Evaluates lesson quality and student performance

  evaluateLessonQuality(lesson: GeneratedLesson): QualityScore {
    return {
      standardsAlignment: this.checkStandardsAlignment(lesson), // 0-100%
      narrativeCoherence: this.checkNarrativeFlow(lesson), // 0-100%
      engagementFactors: this.checkEngagement(lesson), // 0-100%
      assessmentValidity: this.checkAssessments(lesson), // 0-100%

      overallScore: this.calculateWeightedScore(),

      recommendations: this.generateRecommendations(),

      parentReport: {
        strengths: ['Standards met', 'Engaging narrative'],
        improvements: ['Consider adding visuals'],
        nextSteps: ['Ready for next skill cluster']
      }
    };
  }

  evaluateStudentPerformance(responses: StudentResponses): PerformanceScore {
    return {
      bySkill: {
        math: this.evaluateSkill(responses.math, 'Math.7.A.A.1'),
        ela: this.evaluateSkill(responses.ela, 'ELA.7.A.A.1'),
        science: this.evaluateSkill(responses.science, 'Science.7.A.A.1'),
        social: this.evaluateSkill(responses.social, 'Social.7.A.A.1')
      },

      overall: {
        mastery: this.calculateMastery(responses),
        engagement: this.measureEngagement(responses),
        timeOnTask: responses.totalTime,
        hintsUsed: responses.hintsAccessed
      },

      adaptive: {
        nextDifficulty: this.recommendDifficulty(responses),
        reviewNeeded: this.identifyWeakAreas(responses),
        readyForNext: this.checkProgression(responses)
      }
    };
  }
}
```

---

## 🏗️ Implementation Phases

### Phase 1: Core Template Engine (Week 1)
```typescript
// 1. Create base template structure
interface BasicLessonTemplate {
  generateDemonstrative(skills: SkillSet): DemonstrativeLesson;
  generateActual(skills: SkillSet, career: string, companion: string): ActualLesson;
  evaluateQuality(lesson: Lesson): QualityReport;
}

// 2. Build skill database
const GRADE_7_SKILLS = {
  math: {
    'A.A.1': { name: 'Understanding integers', weight: 1.0 },
    'A.B.1': { name: 'Integer operations', weight: 1.2 },
    // ... complete skill set
  },
  // ... other subjects
};

// 3. Create narrative templates
const NARRATIVE_TEMPLATES = {
  basic: {
    acts: 3,
    duration: 120, // minutes
    structure: 'linear',
    careers: ['Marine Biologist', 'Chef', 'Artist', 'Teacher', 'Builder']
  }
};
```

### Phase 2: Career Context System (Week 2)
```typescript
// 1. Define career contexts
class CareerContextLibrary {
  contexts = {
    'Marine Biologist': {
      workplace: 'Research Station',
      tools: ['submarine', 'microscope', 'data logger'],
      problems: ['coral dying', 'temperature changes', 'pollution'],
      authority: 'Ocean Conservation Board'
    },
    // ... other careers
  };

  getRandomCareer(): CareerContext {
    const careers = Object.keys(this.contexts);
    return this.contexts[careers[Math.floor(Math.random() * careers.length)]];
  }
}

// 2. Build context mappers
function mapIntegersToCareer(career: string): string {
  const mappings = {
    'Marine Biologist': 'ocean temperatures from +15°C to -20°C',
    'Chef': 'freezer temps at -18°C vs oven at +200°C',
    'Builder': 'basement at -2 floors vs penthouse at +30',
    'Game Designer': 'player health from -100 to +100',
    'Athlete': 'score differentials from -21 to +21'
  };
  return mappings[career] || 'numbers from negative to positive';
}
```

### Phase 3: Assessment & Rubric System (Week 3)
```typescript
// 1. Assessment generator
class AssessmentFactory {
  create(skill: string, difficulty: 'easy' | 'medium' | 'hard'): Question[] {
    const questions = this.questionBank[skill][difficulty];
    return this.randomizeAndSelect(questions, 3);
  }
}

// 2. Rubric evaluator
class RubricEvaluator {
  evaluate(lesson: Lesson, responses: Response[]): Evaluation {
    return {
      skillsMastery: this.checkMastery(responses),
      engagementScore: this.measureEngagement(lesson),
      narrativeQuality: this.assessNarrative(lesson),
      recommendations: this.generateFeedback(responses)
    };
  }
}
```

### Phase 4: Parent Dashboard Integration (Week 4)
```typescript
// 1. Preview generator
class ParentPreviewService {
  generateDailyPreview(date: Date, student: Student): Preview {
    const skills = this.curriculumService.getSkillsForDate(date);
    const demonstrative = this.templateEngine.generateDemonstrative(skills);

    return {
      demonstrative,
      skills,
      estimatedDuration: '2 hours',
      qualityGuarantee: this.getGuaranteeText()
    };
  }
}

// 2. Approval workflow
class ApprovalWorkflow {
  states = ['pending', 'reviewed', 'approved', 'modified'];

  async submitForApproval(lesson: Lesson): Promise<ApprovalStatus> {
    await this.notifyParent(lesson);
    return this.trackApprovalStatus(lesson.id);
  }
}
```

---

## 📊 Data Models

### Lesson Plan Model
```typescript
interface BasicLessonPlan {
  // Metadata
  id: string;
  studentId: string;
  date: Date;
  grade: number;

  // Skills (from curriculum)
  skills: {
    math: SkillReference;
    ela: SkillReference;
    science: SkillReference;
    social: SkillReference;
  };

  // Narrative (generated)
  narrative: {
    career: string; // Chosen at runtime or sample
    companion: string; // Chosen at runtime or sample
    acts: [Act1, Act2, Act3];
    transitions: string[];
  };

  // Assessment (auto-generated)
  assessments: {
    questions: Question[];
    rubric: Rubric;
    adaptiveRules: AdaptiveRule[];
  };

  // Quality metrics
  quality: {
    standardsAlignment: number;
    engagementScore: number;
    difficultyBalance: number;
  };
}
```

### Rubric Model
```typescript
interface BasicRubric {
  // Skill mastery criteria
  skillCriteria: {
    [skillCode: string]: {
      mastery: string; // "Plot 5 integers correctly"
      proficient: string; // "Plot 3 integers correctly"
      developing: string; // "Understand positive vs negative"
      threshold: number; // 70% for passing
    };
  };

  // Engagement metrics
  engagementCriteria: {
    timeOnTask: { min: 15, target: 25, max: 45 }; // minutes per subject
    interactionRate: number; // clicks/responses per minute
    completionRate: number; // % of activities finished
  };

  // Narrative quality
  narrativeCriteria: {
    careerIntegration: boolean; // All examples use career context
    storyCoherence: boolean; // Acts connect logically
    ageAppropriateness: boolean; // Language and concepts fit grade
  };

  // Parent visibility
  parentReport: {
    dailyScore: number;
    weeklyProgress: number;
    recommendations: string[];
    celebrations: string[];
  };
}
```

---

## 🚀 Implementation Timeline

### Week 1: Foundation
- [ ] Set up TypeScript models
- [ ] Create skill database for Grade 7
- [ ] Build basic template engine
- [ ] Generate first demonstrative lesson

### Week 2: Career Integration
- [ ] Build career context library (5 careers for Basic)
- [ ] Create skill-to-career mappers
- [ ] Test narrative generation
- [ ] Validate engagement hooks

### Week 3: Assessment System
- [ ] Create question banks per skill
- [ ] Build rubric evaluator
- [ ] Implement adaptive rules
- [ ] Test scoring accuracy

### Week 4: Parent Features
- [ ] Generate preview interface
- [ ] Build approval workflow
- [ ] Create quality reports
- [ ] Test end-to-end flow

### Week 5: Testing & Refinement
- [ ] Load test with 100 skill combinations
- [ ] Parent user testing
- [ ] Student engagement testing
- [ ] Performance optimization

---

## 🎯 Success Metrics

### Technical Metrics
- Generation time: <2 seconds per lesson
- Template variety: 25+ unique narratives per skill
- Assessment accuracy: 95% alignment with Common Core
- System uptime: 99.9%

### Educational Metrics
- Standards coverage: 100% of assigned skills
- Engagement rate: >80% task completion
- Mastery achievement: >70% of students
- Parent approval rate: >90%

### Business Metrics
- Conversion from demo: >30%
- Upsell to Premium: >40% within 30 days
- Parent satisfaction: >4.5/5 stars
- Student retention: >85% monthly

---

## 📝 Next Steps

1. **Immediate Actions:**
   - Create TypeScript project structure
   - Set up test data for Jordan (Grade 7)
   - Build first template generator

2. **Dependencies:**
   - Skill database (need complete Grade 7 standards)
   - Career library (need Basic tier career list)
   - Assessment criteria (need rubric standards)

3. **Risk Mitigation:**
   - Fallback to generic narrative if generation fails
   - Cache frequently used templates
   - Parent override for any generated content

This implementation plan ensures Basic subscription lessons are automatically generated, standards-aligned, and engaging while maintaining the narrative magic that makes Pathfinity unique.