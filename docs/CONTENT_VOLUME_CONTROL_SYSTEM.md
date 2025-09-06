# Content Volume Control System

## Current Problem
- Fixed content generation without consideration for context
- No differentiation between demo, testing, and full curriculum modes
- Unable to scale content to fit time requirements
- Sam(K) demo account shows same volume as regular student

## Time Budget Architecture

### 1. Content Modes

```typescript
enum ContentMode {
  DEMO = 'demo',           // 2 min per container (8 min total)
  TESTING = 'testing',     // 5 min per container (20 min total)
  STANDARD = 'standard',   // 15 min per subject (60 min total)
  FULL = 'full',          // 20 min per subject (80 min total)
  CUSTOM = 'custom'       // Admin-defined
}

interface ContentVolumeConfig {
  mode: ContentMode;
  totalDailyMinutes: number;  // Default 240 (4 hours)
  distribution: {
    subjects: number;        // Default 4
    containers: number;      // Default 3 (Learn, Experience, Discover)
    minutesPerSubject: number;
    minutesPerContainer: number;
  };
  questionVolume: {
    practiceQuestions: number;
    assessmentQuestions: number;
    instructionTime: number; // seconds
  };
}
```

### 2. Time Distribution Formula

```typescript
class ContentVolumeCalculator {
  calculateDistribution(config: {
    totalMinutes: number;
    subjects: string[];
    containers: string[];
    mode: ContentMode;
  }): ContentDistribution {
    
    const totalSubjects = config.subjects.length;
    const totalContainers = config.containers.length;
    
    // Time per intersection (subject × container)
    const minutesPerSegment = config.totalMinutes / (totalSubjects * totalContainers);
    
    // Adjust for mode
    const modeMultiplier = {
      'demo': 0.1,      // 10% of full content
      'testing': 0.25,  // 25% of full content
      'standard': 0.75, // 75% of full content
      'full': 1.0,      // 100% content
      'custom': 1.0     // Defined by admin
    };
    
    const adjustedMinutes = minutesPerSegment * modeMultiplier[config.mode];
    
    return {
      minutesPerSubjectContainer: adjustedMinutes,
      questionsPerSegment: this.calculateQuestionCount(adjustedMinutes),
      instructionDepth: this.calculateInstructionDepth(adjustedMinutes)
    };
  }
  
  calculateQuestionCount(minutes: number): QuestionVolume {
    // Average time per question type
    const timePerQuestion = {
      'multiple_choice': 30,     // 30 seconds
      'true_false': 20,          // 20 seconds
      'counting': 40,            // 40 seconds (visual processing)
      'numeric': 35,             // 35 seconds
      'fill_blank': 45,          // 45 seconds
      'short_answer': 60,        // 60 seconds
      'drag_drop': 50            // 50 seconds
    };
    
    // Calculate mix based on available time
    if (minutes <= 2) {
      // Demo mode: minimal content
      return {
        practice: [
          { type: 'multiple_choice', count: 1 },
          { type: 'true_false', count: 1 }
        ],
        assessment: [
          { type: 'multiple_choice', count: 1 }
        ]
      };
    } else if (minutes <= 5) {
      // Testing mode: basic coverage
      return {
        practice: [
          { type: 'multiple_choice', count: 2 },
          { type: 'true_false', count: 1 },
          { type: 'counting', count: 1 }
        ],
        assessment: [
          { type: 'multiple_choice', count: 1 }
        ]
      };
    } else if (minutes <= 15) {
      // Standard mode: comprehensive
      return {
        practice: [
          { type: 'multiple_choice', count: 3 },
          { type: 'true_false', count: 2 },
          { type: 'counting', count: 2 },
          { type: 'numeric', count: 2 }
        ],
        assessment: [
          { type: 'multiple_choice', count: 2 },
          { type: 'numeric', count: 1 }
        ]
      };
    } else {
      // Full mode: complete curriculum
      return {
        practice: [
          { type: 'multiple_choice', count: 4 },
          { type: 'true_false', count: 3 },
          { type: 'counting', count: 3 },
          { type: 'numeric', count: 3 },
          { type: 'fill_blank', count: 2 }
        ],
        assessment: [
          { type: 'multiple_choice', count: 2 },
          { type: 'numeric', count: 1 },
          { type: 'true_false', count: 1 }
        ]
      };
    }
  }
}
```

### 3. Mode Configuration by User Type

```typescript
class ContentModeManager {
  private modeConfigs = {
    'demo': {
      mode: ContentMode.DEMO,
      totalDailyMinutes: 8,  // 2 min × 4 subjects
      distribution: {
        subjects: 4,
        containers: 3,
        minutesPerSubject: 2,
        minutesPerContainer: 2.67
      },
      questionVolume: {
        practiceQuestions: 2,
        assessmentQuestions: 1,
        instructionTime: 10  // 10 seconds
      },
      features: {
        skipInstructions: false,
        autoAdvance: true,
        showHints: true,
        instantFeedback: true
      }
    },
    
    'testing': {
      mode: ContentMode.TESTING,
      totalDailyMinutes: 20,
      distribution: {
        subjects: 4,
        containers: 3,
        minutesPerSubject: 5,
        minutesPerContainer: 6.67
      },
      questionVolume: {
        practiceQuestions: 4,
        assessmentQuestions: 1,
        instructionTime: 20
      },
      features: {
        skipInstructions: true,
        autoAdvance: false,
        showHints: true,
        instantFeedback: true
      }
    },
    
    'standard': {
      mode: ContentMode.STANDARD,
      totalDailyMinutes: 180,  // 3 hours
      distribution: {
        subjects: 4,
        containers: 3,
        minutesPerSubject: 45,
        minutesPerContainer: 60
      },
      questionVolume: {
        practiceQuestions: 8,
        assessmentQuestions: 3,
        instructionTime: 60
      },
      features: {
        skipInstructions: false,
        autoAdvance: false,
        showHints: true,
        instantFeedback: true
      }
    },
    
    'full': {
      mode: ContentMode.FULL,
      totalDailyMinutes: 240,  // 4 hours
      distribution: {
        subjects: 4,
        containers: 3,
        minutesPerSubject: 60,
        minutesPerContainer: 80
      },
      questionVolume: {
        practiceQuestions: 15,
        assessmentQuestions: 5,
        instructionTime: 90
      },
      features: {
        skipInstructions: false,
        autoAdvance: false,
        showHints: true,
        instantFeedback: true
      }
    }
  };
  
  getModeForUser(user: User): ContentVolumeConfig {
    // Check user flags
    if (user.email?.includes('demo') || user.id === 'sam-k-demo') {
      return this.modeConfigs['demo'];
    }
    
    if (user.accountType === 'trial' || user.isTestAccount) {
      return this.modeConfigs['testing'];
    }
    
    // Check admin overrides
    const adminOverride = this.getAdminOverride(user.tenantId);
    if (adminOverride) {
      return adminOverride;
    }
    
    // Check subscription level
    if (user.subscriptionTier === 'premium') {
      return this.modeConfigs['full'];
    }
    
    return this.modeConfigs['standard'];
  }
}
```

### 4. Admin Control Panel

```typescript
interface AdminContentControls {
  tenantId: string;
  overrides: {
    globalMode?: ContentMode;
    userOverrides?: Map<string, ContentMode>;
    gradeOverrides?: Map<string, ContentMode>;
    timeConstraints?: {
      maxDailyMinutes?: number;
      maxSessionMinutes?: number;
      maxContainerMinutes?: number;
    };
  };
  customConfigs?: {
    [key: string]: ContentVolumeConfig;
  };
}

class AdminContentManager {
  // Admin UI controls
  async setGlobalMode(tenantId: string, mode: ContentMode): Promise<void> {
    await this.updateConfig(tenantId, { globalMode: mode });
  }
  
  async setUserMode(userId: string, mode: ContentMode): Promise<void> {
    await this.updateUserConfig(userId, { mode });
  }
  
  async createCustomMode(config: {
    name: string;
    totalMinutes: number;
    questionsPerPractice: number;
    questionsPerAssessment: number;
  }): Promise<void> {
    const customMode = this.calculateCustomDistribution(config);
    await this.saveCustomMode(customMode);
  }
  
  // Quick presets for common scenarios
  async enableDemoMode(userIds: string[]): Promise<void> {
    for (const userId of userIds) {
      await this.setUserMode(userId, ContentMode.DEMO);
    }
  }
  
  async enableTestingMode(duration: number = 20): Promise<void> {
    await this.setGlobalMode(this.currentTenant, ContentMode.TESTING);
    await this.setTimeLimit(duration);
  }
}
```

### 5. Content Generation with Volume Control

```typescript
class VolumeAwareContentGenerator {
  async generateContent(params: {
    skill: Skill;
    student: Student;
    career: Career;
    mode: ContentMode;
  }): Promise<Content> {
    
    // Get volume configuration
    const volumeConfig = this.contentModeManager.getModeForUser(params.student);
    
    // Calculate question distribution
    const distribution = this.calculator.calculateDistribution({
      totalMinutes: volumeConfig.totalDailyMinutes,
      subjects: ['Math', 'ELA', 'Science', 'Social Studies'],
      containers: ['Learn', 'Experience', 'Discover'],
      mode: params.mode
    });
    
    // Generate content based on volume
    const request: ContentRequest = {
      skill: params.skill,
      requirements: {
        practice: {
          total: volumeConfig.questionVolume.practiceQuestions,
          distribution: this.getQuestionTypeDistribution(
            params.skill.subject,
            params.student.grade,
            volumeConfig.questionVolume.practiceQuestions
          )
        },
        assessment: {
          total: volumeConfig.questionVolume.assessmentQuestions,
          distribution: this.getAssessmentDistribution(
            volumeConfig.questionVolume.assessmentQuestions
          )
        },
        instruction: {
          depth: volumeConfig.features.skipInstructions ? 'minimal' : 'full',
          duration: volumeConfig.questionVolume.instructionTime
        }
      }
    };
    
    return await this.aiService.generateContent(request);
  }
}
```

### 6. Implementation for Demo Accounts

```typescript
// Special handling for Sam(K) demo account
class DemoAccountManager {
  private demoAccounts = [
    'sam-k-demo',
    'demo-student-1',
    'preview-account'
  ];
  
  isDemoAccount(userId: string): boolean {
    return this.demoAccounts.includes(userId) ||
           userId.includes('demo') ||
           userId.includes('preview');
  }
  
  getContentForDemo(subject: string, container: string): DemoContent {
    // Pre-generated, optimized demo content
    return {
      instruction: {
        title: `Quick ${subject} Intro`,
        duration: 10, // 10 seconds
        skipButton: true
      },
      practice: [
        // Only 2 questions for demo
        {
          type: 'multiple_choice',
          question: 'Sample question 1',
          timeEstimate: 30
        },
        {
          type: 'true_false',
          question: 'Sample question 2',
          timeEstimate: 20
        }
      ],
      assessment: {
        // Single assessment question
        type: 'multiple_choice',
        question: 'Final check',
        timeEstimate: 30
      },
      features: {
        autoAdvance: true,
        skipAnimation: true,
        fastTransitions: true,
        showCompletionImmediately: true
      }
    };
  }
}
```

## Time Budget Examples

### Demo Mode (Sam K Account)
- **Total Time**: 8 minutes
- **Per Subject**: 2 minutes
- **Per Container**: ~40 seconds
- **Content**: 2 practice + 1 assessment
- **Features**: Auto-advance, minimal instructions

### Testing Mode
- **Total Time**: 20 minutes  
- **Per Subject**: 5 minutes
- **Per Container**: ~1.5 minutes
- **Content**: 4 practice + 1 assessment
- **Features**: Skip instructions option

### Standard Mode
- **Total Time**: 3 hours
- **Per Subject**: 45 minutes
- **Per Container**: 15 minutes
- **Content**: 8 practice + 3 assessment
- **Features**: Full instructions, hints

### Full Curriculum Mode
- **Total Time**: 4 hours
- **Per Subject**: 60 minutes
- **Per Container**: 20 minutes
- **Content**: 15 practice + 5 assessment
- **Features**: Complete experience

## Admin Dashboard Controls

```typescript
interface AdminDashboard {
  // Global Controls
  setDefaultMode(mode: ContentMode): void;
  setMaxDailyTime(minutes: number): void;
  
  // User Controls
  setUserMode(userId: string, mode: ContentMode): void;
  createUserGroup(name: string, mode: ContentMode): void;
  
  // Testing Controls
  enableQuickDemo(): void;  // 2 min mode
  enableFullDemo(): void;   // 10 min mode
  enableTesting(): void;    // 20 min mode
  
  // Analytics
  getAverageCompletionTime(): number;
  getContentEfficiency(): Report;
  getUserEngagement(): Metrics;
}
```

## Benefits

1. **Flexible Demos**: Prospects can experience the platform in 2-8 minutes
2. **Scalable Content**: Automatically adjusts to time constraints
3. **Testing Efficiency**: Developers can test quickly
4. **Full Curriculum**: Students get comprehensive 4-hour experience
5. **Admin Control**: Complete control over content volume
6. **User Experience**: Appropriate content for context

## Implementation Priority

1. **Phase 1**: Implement ContentMode enum and basic volume calculation
2. **Phase 2**: Create demo content sets for Sam(K) account
3. **Phase 3**: Build admin controls for mode switching
4. **Phase 4**: Integrate with AI content generation
5. **Phase 5**: Add analytics and monitoring