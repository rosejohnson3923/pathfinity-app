# Master Content Generation Refactoring Task Plan

## Executive Summary
Complete refactoring of Pathfinity's content generation system to achieve proactive control, career-skill consistency, volume management, and just-in-time adaptive generation.

**Total Timeline**: 12-17 weeks (including risk mitigation)
**Team Size Required**: 3-4 developers
**Priority**: CRITICAL - Core platform capability

## Phase 1: Foundation Architecture (Weeks 1-4)

### 1.1 Question Type System Overhaul
**Owner**: Frontend Developer
**Duration**: 7 days

#### Tasks:
- [ ] **1.1.1** Create comprehensive question type definitions (2 days)
  ```typescript
  /src/types/questions/
  ├── index.ts (BaseQuestion interface)
  ├── multipleChoice.ts
  ├── trueFalse.ts
  ├── counting.ts
  ├── numeric.ts
  ├── fillBlank.ts
  ├── matching.ts
  ├── ordering.ts
  └── shortAnswer.ts
  ```
  
- [ ] **1.1.2** Build question renderer components (3 days)
  ```typescript
  /src/components/questions/
  ├── QuestionRenderer.tsx (Main dispatcher)
  ├── CountingQuestion.tsx
  ├── TrueFalseQuestion.tsx
  ├── MultipleChoiceQuestion.tsx
  └── [other types]
  ```

- [ ] **1.1.3** Implement comprehensive validation (2 days)
  - Grade-appropriate type checking
  - Subject-specific constraints
  - Visual requirement validation
  - Answer format standardization

**Deliverables**: 
- Working question components for all types
- Validation passing for 100% of question types
- Visual support for K-2 grades

### 1.2 Content Generation Pipeline
**Owner**: Backend Developer
**Duration**: 9 days

#### Tasks:
- [ ] **1.2.1** Build Question Type Registry (2 days)
  ```typescript
  class QuestionTypeRegistry {
    registerType(definition: QuestionTypeDefinition)
    getTypesForGradeSubject(grade, subject): QuestionType[]
    validateQuestion(question): ValidationResult
  }
  ```

- [ ] **1.2.2** Implement Template Engine (3 days)
  ```typescript
  class QuestionTemplateEngine {
    generateCountingQuestion(context): CountingQuestion
    generateMultipleChoice(context): MultipleChoiceQuestion
    // ... other types
  }
  ```

- [ ] **1.2.3** Create Fallback Content Provider (2 days)
  ```typescript
  class FallbackContentProvider {
    getFallbackContent(grade, subject, skill, career): Content
    validateFallbackQuality(content): boolean
  }
  ```

- [ ] **1.2.4** Build Content Request Builder (2 days)
  ```typescript
  class ContentRequestBuilder {
    buildRequest(skill, student, career, mode): ContentRequest
    specifyRequirements(practice, assessment): Requirements
  }
  ```

**Deliverables**:
- Proactive content generation system
- 100% type-safe content requests
- Fallback content for all grade/subject combinations

### 1.3 Volume Control System
**Owner**: Full Stack Developer
**Duration**: 7 days

#### Tasks:
- [ ] **1.3.1** Implement Content Modes (2 days)
  ```typescript
  enum ContentMode {
    DEMO = 'demo',           // 2 min per container
    TESTING = 'testing',     // 5 min per container
    STANDARD = 'standard',   // 15 min per subject
    FULL = 'full'           // 20 min per subject
  }
  ```

- [ ] **1.3.2** Build Volume Calculator (2 days)
  ```typescript
  class ContentVolumeCalculator {
    calculateDistribution(totalMinutes, subjects, containers, mode)
    calculateQuestionCount(minutes): QuestionVolume
  }
  ```

- [ ] **1.3.3** Create Admin Controls UI (3 days)
  - Mode selection interface
  - User override capabilities
  - Time constraint settings
  - Analytics dashboard

**Deliverables**:
- Working demo mode (2 min cycles)
- Full curriculum mode (4 hours)
- Admin dashboard for volume control

## Phase 2: Consistency & Context (Weeks 5-7)

### 2.1 Career-Skill Consistency System
**Owner**: Backend Developer
**Duration**: 10 days

#### Tasks:
- [ ] **2.1.1** Implement Daily Learning Context (3 days)
  ```typescript
  interface DailyLearningContext {
    readonly studentId: string
    readonly primarySkill: Skill  // Same all day
    readonly career: Career       // Same all day
    readonly companion: Companion  // Same all day
  }
  ```

- [ ] **2.1.2** Build Skill Adaptation Service (4 days)
  ```typescript
  class SkillAdaptationService {
    adaptSkillToSubject(skill, subject): SubjectAdaptedSkill
    maintainLearningObjective(skill, adaptations): boolean
  }
  ```

- [ ] **2.1.3** Create Consistency Validator (3 days)
  ```typescript
  class ConsistencyValidator {
    validateCareerContext(content, career): boolean
    validateSkillFocus(content, skill): boolean
    validateCrossSubjectCoherence(contents): boolean
  }
  ```

**Deliverables**:
- 100% career+skill consistency across subjects
- Skill adaptation for all subject areas
- Validation preventing context drift

### 2.2 AI Prompt Engineering
**Owner**: AI/ML Developer
**Duration**: 5 days

#### Tasks:
- [ ] **2.2.1** Create Prompt Template Library (3 days)
  - Subject-specific templates
  - Career context requirements
  - Skill focus constraints
  - Grade-appropriate language

- [ ] **2.2.2** Implement Prompt Validator (2 days)
  - Required element checking
  - Context consistency validation
  - Effectiveness tracking

**Deliverables**:
- Structured prompts for all combinations
- 95% AI response validation success rate

## Phase 3: Just-In-Time Generation (Weeks 8-10)

### 3.1 Progressive Content Generation
**Owner**: Full Stack Developer
**Duration**: 10 days

#### Tasks:
- [ ] **3.1.1** Build Session State Manager (3 days)
  ```typescript
  class LearningSessionStateManager {
    trackContainerProgression(userId, container)
    getPerformanceHistory(userId): PerformanceHistory
    validateProgression(userId, targetContainer): boolean
  }
  ```

- [ ] **3.1.2** Implement JIT Content Service (4 days)
  ```typescript
  class JustInTimeContentService {
    generateContainerContent(userId, container): Content
    adaptBasedOnPerformance(performance): Adaptations
    cacheContent(userId, container, content): void
  }
  ```

- [ ] **3.1.3** Create Performance Tracker (3 days)
  ```typescript
  class PerformanceTracker {
    trackQuestionPerformance(userId, question, result)
    analyzePatterns(performance): Patterns
    getAdaptationRecommendations(): Recommendations
  }
  ```

**Deliverables**:
- Content generated only when needed
- Performance-based adaptation
- Efficient caching strategy

### 3.2 Container Integration
**Owner**: Frontend Developer
**Duration**: 5 days

#### Tasks:
- [ ] **3.2.1** Refactor AILearnContainerV2 (2 days)
- [ ] **3.2.2** Refactor AIExperienceContainerV2 (2 days)
- [ ] **3.2.3** Refactor AIDiscoverContainerV2 (1 day)

**Deliverables**:
- All containers using JIT generation
- Maintained existing functionality
- Improved performance metrics

## Phase 4: Gamification & Hints (Weeks 11-12)

### 4.1 AI-Powered Hint System
**Owner**: Backend Developer
**Duration**: 7 days

#### Tasks:
- [ ] **4.1.1** Centralize Hint Generation (3 days)
  ```typescript
  class HintGenerationService {
    generateProgressiveHints(question, context): string[]
    calculateHintCost(level): number
    trackHintEffectiveness(hint, outcome): void
  }
  ```

- [ ] **4.1.2** Integrate with Content Pipeline (2 days)
  - Generate hints alongside questions
  - Career-context aware hints
  - Grade-appropriate scaffolding

- [ ] **4.1.3** Update XP Economy (2 days)
  - Hint purchasing system
  - Cost balancing
  - Analytics integration

**Deliverables**:
- Progressive hint system for all questions
- XP-based hint economy
- Hint effectiveness tracking

## Phase 5: Integration & Testing (Weeks 13-14)

### 5.1 System Integration
**Owner**: Tech Lead
**Duration**: 7 days

#### Tasks:
- [ ] **5.1.1** End-to-end integration testing (3 days)
- [ ] **5.1.2** Performance optimization (2 days)
- [ ] **5.1.3** Bug fixes and refinements (2 days)

### 5.2 Quality Assurance
**Owner**: QA Team
**Duration**: 7 days

#### Tasks:
- [ ] **5.2.1** Content quality validation (2 days)
- [ ] **5.2.2** User flow testing (2 days)
- [ ] **5.2.3** Load and stress testing (1 day)
- [ ] **5.2.4** Demo account validation (2 days)

**Deliverables**:
- All tests passing
- Performance benchmarks met
- Demo experience validated

## Phase 6: Deployment (Weeks 15-16)

### 6.1 Production Rollout
**Owner**: DevOps Lead
**Duration**: 5 days

#### Tasks:
- [ ] **6.1.1** Feature flag implementation (2 days)
- [ ] **6.1.2** Staged deployment (2 days)
- [ ] **6.1.3** Monitoring setup (1 day)

### 6.2 Post-Deployment
**Owner**: Product Team
**Duration**: 5 days

#### Tasks:
- [ ] **6.2.1** User feedback collection (3 days)
- [ ] **6.2.2** Metrics analysis (1 day)
- [ ] **6.2.3** Iteration planning (1 day)

## Component Refactoring Checklist

### Existing Components to Refactor

#### High Priority (Must refactor):
- [ ] `/src/services/AILearningJourneyService.ts` - Split into smaller services
- [ ] `/src/services/questionTypeValidator.ts` - Expand validation
- [ ] `/src/components/ai-containers/AILearnContainerV2.tsx` - Remove conditionals
- [ ] `/src/components/ai-containers/AIExperienceContainerV2.tsx` - Standardize
- [ ] `/src/components/ai-containers/AIDiscoverContainerV2.tsx` - Align architecture
- [ ] `/src/components/ai-containers/MultiSubjectContainerV2.tsx` - Update orchestration
- [ ] `/src/services/pathIQGamificationService.ts` - Integrate hint generation
- [ ] `/src/services/pathIQIntegration.ts` - Unify with content pipeline

#### Medium Priority (Should refactor):
- [ ] `/src/components/ai-containers/VisualRenderer.tsx` - Dynamic mappings
- [ ] `/src/services/contentCacheService.ts` - Intelligent caching
- [ ] `/src/services/lightweightPracticeSupportService.ts` - Merge into pipeline
- [ ] `/src/rules-engine/containers/LearnAIRulesEngine.ts` - Extract validation
- [ ] `/src/rules-engine/containers/ExperienceAIRulesEngine.ts` - Align rules
- [ ] `/src/rules-engine/containers/DiscoverAIRulesEngine.ts` - Standardize

#### Low Priority (Nice to refactor):
- [ ] `/src/components/ai-containers/AILearnContainer.tsx` - Deprecate V1
- [ ] `/src/components/ai-containers/AIExperienceContainer.tsx` - Deprecate V1
- [ ] `/src/components/ai-containers/AIDiscoverContainer.tsx` - Deprecate V1
- [ ] `/src/components/ai-containers/MultiSubjectContainer.tsx` - Deprecate V1

### New Components to Build

#### Critical (Week 1-4):
- [ ] `/src/services/content/QuestionTypeRegistry.ts`
- [ ] `/src/services/content/ContentRequestBuilder.ts`
- [ ] `/src/services/content/ContentVolumeManager.ts`
- [ ] `/src/services/content/TemplateEngine.ts`
- [ ] `/src/components/questions/QuestionRenderer.tsx`

#### Important (Week 5-10):
- [ ] `/src/services/content/DailyLearningContextManager.ts`
- [ ] `/src/services/content/SkillAdaptationService.ts`
- [ ] `/src/services/content/JustInTimeContentService.ts`
- [ ] `/src/services/content/PerformanceTracker.ts`
- [ ] `/src/services/content/HintGenerationService.ts`

#### Supporting (Week 11-14):
- [ ] `/src/services/content/FallbackContentProvider.ts`
- [ ] `/src/services/admin/AdminContentService.ts`
- [ ] `/src/components/admin/ContentModeManager.tsx`
- [ ] `/src/services/analytics/ContentGenerationMetrics.ts`

## Risk Matrix

### Critical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Breaking existing content flow | HIGH | HIGH | Feature flags, backward compatibility |
| AI generation failures | HIGH | MEDIUM | Fallback content, retry logic |
| Performance degradation | HIGH | MEDIUM | Caching, optimization |
| State management complexity | HIGH | HIGH | Clear boundaries, testing |

### Timeline Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep | +2-3 weeks | Strict phase boundaries |
| Integration issues | +1-2 weeks | Early integration testing |
| Testing discoveries | +1 week | Continuous testing |
| Deployment issues | +1 week | Staged rollout |

## Success Criteria

### Phase 1 Success
- [ ] All question types rendering correctly
- [ ] Proactive content generation working
- [ ] Volume control implemented
- [ ] Demo mode functional (2 min)

### Phase 2 Success
- [ ] 100% career+skill consistency
- [ ] Skill adaptation working for all subjects
- [ ] AI prompts generating valid content 95% of time

### Phase 3 Success
- [ ] JIT generation working for all containers
- [ ] Performance tracking accurate
- [ ] Adaptive content generation functional

### Phase 4 Success
- [ ] Progressive hints for all questions
- [ ] XP economy balanced
- [ ] Hint effectiveness measurable

### Phase 5 Success
- [ ] All integration tests passing
- [ ] Performance benchmarks met
- [ ] Quality validation complete

### Phase 6 Success
- [ ] Successful production deployment
- [ ] No critical bugs in production
- [ ] User satisfaction maintained/improved

## Team Allocation

### Required Team
- **Tech Lead**: Overall coordination, architecture decisions
- **Backend Developer**: Services, AI integration, data flow
- **Frontend Developer**: Components, UI/UX, containers
- **Full Stack Developer**: Integration, admin tools, testing
- **QA Engineer**: Testing, validation, quality assurance
- **DevOps Engineer**: Deployment, monitoring, infrastructure

### Optional Support
- **AI/ML Specialist**: Prompt optimization, model tuning
- **Product Manager**: Requirements, priorities, user feedback
- **UX Designer**: Component design, user flows

## Communication Plan

### Daily
- Stand-up meetings
- Blocker identification
- Progress updates

### Weekly
- Phase review meetings
- Risk assessment
- Timeline adjustments

### Phase Completion
- Demo to stakeholders
- Retrospective
- Next phase planning

## Documentation Requirements

### Technical Documentation
- [ ] API documentation for all new services
- [ ] Component documentation with examples
- [ ] Integration guides
- [ ] Deployment procedures

### User Documentation
- [ ] Admin guide for content controls
- [ ] Teacher guide for new features
- [ ] Migration guide for existing users

## Monitoring & Analytics

### Key Metrics to Track
- Content generation success rate
- Validation pass rate
- Generation time (p50, p95, p99)
- Fallback content usage
- Career-skill consistency score
- User completion rates
- Hint usage patterns
- XP economy balance

### Alerting Thresholds
- Generation failures > 5%
- Response time > 3 seconds
- Validation failures > 10%
- Fallback usage > 20%

## Post-Launch Support

### Week 1 Post-Launch
- Daily monitoring
- Immediate bug fixes
- User feedback collection

### Week 2-4 Post-Launch
- Performance optimization
- Feature refinements
- Planning next iteration

### Month 2+ Post-Launch
- Long-term metrics analysis
- Major feature additions
- Continuous improvement

---

**Document Version**: 1.0
**Last Updated**: Current Date
**Next Review**: End of Phase 1

This master plan provides a complete roadmap for the content generation refactoring project with clear tasks, timelines, responsibilities, and success criteria.