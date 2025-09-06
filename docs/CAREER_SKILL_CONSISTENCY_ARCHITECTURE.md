# Career & Skill Consistency Architecture

## CRITICAL REQUIREMENT
**Every piece of content MUST maintain Career + Skill consistency across ALL subjects and containers**

## Example: Sam(K) Learning "Counting to 3" as Future Athlete

### Current Problem
- Different subjects get different skills
- Career context gets lost between containers
- No unified learning objective for the day

### Required Behavior
Sam(K) with "Counting to 3" skill and "Athlete" career should see:

#### MATH (Learn Container)
- **Practice**: "Count the basketballs: 🏀🏀🏀"
- **Assessment**: "How many soccer balls? ⚽⚽⚽"
- **Context**: Sports equipment counting

#### ELA (Learn Container)  
- **Practice**: "The athlete has THREE medals. Which word means 3?"
- **Assessment**: "Read: The team scored 3 goals. How many goals?"
- **Context**: Sports stories about counting to 3

#### SCIENCE (Learn Container)
- **Practice**: "An athlete needs 3 water bottles. Count them: 💧💧💧"
- **Assessment**: "True/False: Athletes train 3 times"
- **Context**: Sports science with counting to 3

#### SOCIAL STUDIES (Learn Container)
- **Practice**: "3 athletes won medals. Count the medals: 🥇🥈🥉"
- **Assessment**: "How many team sports are shown?" (showing 3)
- **Context**: Sports culture with counting to 3

## Architecture for Consistency

### 1. Daily Learning Context

```typescript
interface DailyLearningContext {
  // Core context that NEVER changes during the day
  readonly studentId: string;
  readonly date: string;
  readonly primarySkill: {
    id: string;
    name: string;           // "Counting to 3"
    gradeLevel: string;     // "K"
    category: string;       // "Number Sense"
  };
  readonly career: {
    id: string;
    name: string;           // "Athlete"
    gradeMapping: {
      K: "Little Athlete",
      "1-2": "Junior Athlete",
      "3-5": "Team Player",
      "6-8": "Athletic Scholar",
      "9-12": "Professional Athlete"
    };
  };
  readonly companion: {
    id: string;
    name: string;           // "Spark"
  };
}
```

### 2. Skill Adaptation Service

```typescript
class SkillAdaptationService {
  /**
   * Adapts the primary skill to each subject while maintaining core learning objective
   */
  adaptSkillToSubject(
    context: DailyLearningContext,
    subject: Subject
  ): SubjectAdaptedSkill {
    const { primarySkill, career } = context;
    
    switch (subject) {
      case 'Math':
        // Direct application of the skill
        return {
          skill: primarySkill.name,
          focus: 'numerical',
          application: `Count ${career.name}-related objects to ${this.extractNumber(primarySkill.name)}`,
          vocabulary: this.getMathVocabulary(career),
          visuals: this.getMathVisuals(career)
        };
        
      case 'ELA':
        // Reading/writing about the skill
        return {
          skill: primarySkill.name,
          focus: 'literacy',
          application: `Read and write about ${this.extractNumber(primarySkill.name)} in ${career.name} contexts`,
          vocabulary: this.getELAVocabulary(career, primarySkill),
          visuals: this.getELAVisuals(career)
        };
        
      case 'Science':
        // Scientific application of the skill
        return {
          skill: primarySkill.name,
          focus: 'observation',
          application: `Observe and measure ${this.extractNumber(primarySkill.name)} in ${career.name} science`,
          vocabulary: this.getScienceVocabulary(career, primarySkill),
          visuals: this.getScienceVisuals(career)
        };
        
      case 'Social Studies':
        // Cultural/social application of the skill
        return {
          skill: primarySkill.name,
          focus: 'social',
          application: `Understand ${this.extractNumber(primarySkill.name)} in ${career.name} culture`,
          vocabulary: this.getSocialVocabulary(career, primarySkill),
          visuals: this.getSocialVisuals(career)
        };
    }
  }
  
  private extractNumber(skillName: string): number {
    // "Counting to 3" → 3
    const match = skillName.match(/\d+/);
    return match ? parseInt(match[0]) : 1;
  }
}
```

### 3. Content Generation with Strict Context

```typescript
class ContextAwareContentGenerator {
  async generateContent(
    context: DailyLearningContext,
    subject: Subject,
    container: Container
  ): Promise<Content> {
    
    // Adapt skill to subject while maintaining core objective
    const adaptedSkill = this.skillAdapter.adaptSkillToSubject(context, subject);
    
    // Build highly specific prompt
    const prompt = this.buildContextualPrompt({
      mustInclude: {
        skillName: context.primarySkill.name,
        skillNumber: this.extractNumber(context.primarySkill.name),
        career: context.career.name,
        careerVocabulary: adaptedSkill.vocabulary,
        companion: context.companion.name
      },
      subject: subject,
      container: container,
      constraints: {
        // CRITICAL: All questions must reinforce the primary skill
        allQuestionsMustRelateToSkill: true,
        allVisualsMustRelateToCareer: true,
        maintainSkillObjective: true
      }
    });
    
    // Generate with strict validation
    const content = await this.aiService.generate(prompt);
    
    // Validate context consistency
    if (!this.validateContextConsistency(content, context)) {
      // Retry or use fallback
      return this.getFallbackContent(context, subject, container);
    }
    
    return content;
  }
  
  private validateContextConsistency(
    content: Content,
    context: DailyLearningContext
  ): boolean {
    // Check every question maintains the skill focus
    for (const question of content.questions) {
      if (!this.questionRelatesToSkill(question, context.primarySkill)) {
        return false;
      }
      if (!this.questionRelatesToCareer(question, context.career)) {
        return false;
      }
    }
    return true;
  }
}
```

### 4. Container Adaptation While Maintaining Core

```typescript
class ContainerContextAdapter {
  adaptToContainer(
    context: DailyLearningContext,
    subject: Subject,
    container: 'LEARN' | 'EXPERIENCE' | 'DISCOVER'
  ): ContainerContext {
    const baseContext = {
      ...context,
      subject,
      container
    };
    
    switch (container) {
      case 'LEARN':
        return {
          ...baseContext,
          focus: 'skill_mastery',
          questionTypes: ['direct_practice', 'assessment'],
          prompt: `Teach ${context.primarySkill.name} using ${context.career.name} examples in ${subject}`
        };
        
      case 'EXPERIENCE':
        return {
          ...baseContext,
          focus: 'real_world_application',
          questionTypes: ['scenario', 'problem_solving'],
          prompt: `Apply ${context.primarySkill.name} in ${context.career.name} professional scenarios for ${subject}`
        };
        
      case 'DISCOVER':
        return {
          ...baseContext,
          focus: 'exploration',
          questionTypes: ['inquiry', 'investigation'],
          prompt: `Explore ${context.primarySkill.name} through ${context.career.name} discoveries in ${subject}`
        };
    }
  }
}
```

### 5. Fallback Content Templates

```typescript
class CareerSkillFallbackContent {
  private templates = {
    'K-Math-Counting-Athlete': {
      'LEARN': {
        practice: [
          {
            question: "Count the basketballs: {visual}",
            visual: "🏀".repeat(targetNumber),
            type: "counting",
            correct_answer: targetNumber
          }
        ]
      },
      'EXPERIENCE': {
        scenario: "You're the team coach counting players...",
        challenge: "Help count equipment for the game"
      },
      'DISCOVER': {
        exploration: "Discover how athletes use counting in sports"
      }
    },
    // ... more templates for each combination
  };
  
  getFallback(
    grade: string,
    subject: string,
    skill: string,
    career: string,
    container: string
  ): Content {
    const key = `${grade}-${subject}-${skill}-${career}`;
    return this.templates[key]?.[container] || this.generateGenericFallback();
  }
}
```

## Implementation Rules

### MUST Requirements

1. **Single Skill Per Day**: One primary skill across ALL subjects
2. **Consistent Career**: Same career context in ALL content
3. **Skill Adaptation**: Skill applied appropriately to each subject
4. **Visual Consistency**: Career-appropriate visuals everywhere
5. **Vocabulary Alignment**: Career-specific terms in all subjects

### MUST NOT Requirements

1. **No Skill Switching**: Don't change skills between subjects
2. **No Career Drift**: Don't lose career context
3. **No Generic Content**: Everything must be career+skill specific
4. **No Mixed Objectives**: Don't introduce unrelated skills

## Prompt Engineering Templates

### Math + Counting to 3 + Athlete
```
Generate Math practice for Kindergarten.
SKILL: Counting to 3 (MUST be exactly 3 in all questions)
CAREER: Athlete
REQUIREMENTS:
- Every question involves counting exactly 3 sports items
- Use sports equipment emojis (🏀⚽🏈⚾🎾)
- Reference athlete activities
- Do NOT use any number other than 3
```

### ELA + Counting to 3 + Athlete  
```
Generate ELA practice for Kindergarten.
SKILL: Counting to 3 (number three appears in all content)
CAREER: Athlete
REQUIREMENTS:
- Stories about athletes with the number 3
- Words: "three", "third", "trio"
- Sports vocabulary
- Simple sentences with 3 items
```

### Science + Counting to 3 + Athlete
```
Generate Science practice for Kindergarten.
SKILL: Counting to 3 (observe groups of 3)
CAREER: Athlete
REQUIREMENTS:
- Athletic science concepts in groups of 3
- Three water bottles for hydration
- Three exercises for warmup
- Three pieces of safety equipment
```

### Social Studies + Counting to 3 + Athlete
```
Generate Social Studies practice for Kindergarten.
SKILL: Counting to 3 (cultural groups of 3)
CAREER: Athlete
REQUIREMENTS:
- Three types of sports
- Three team positions
- Three Olympic medals
- Three sports from different countries
```

## Validation Checklist

For EVERY piece of generated content:

- [ ] Does it reference the primary skill? (e.g., "Counting to 3")
- [ ] Does it maintain the exact skill objective? (e.g., exactly 3, not 2 or 4)
- [ ] Does it include career context? (e.g., Athlete references)
- [ ] Does it use career-appropriate vocabulary?
- [ ] Does it use career-appropriate visuals?
- [ ] Is it grade-appropriate?
- [ ] Is it subject-appropriate while maintaining skill focus?

## Success Metrics

1. **Skill Consistency**: 100% of questions relate to daily skill
2. **Career Integration**: 100% of content includes career context
3. **Learning Coherence**: Students see unified theme across subjects
4. **Engagement**: Higher completion rates due to coherent narrative
5. **Retention**: Better skill mastery through repeated, varied practice

## Example Day for Sam(K)

**Morning Briefing**: "Today you're learning to Count to 3 as an Athlete with Spark!"

**Math**: Count 3 basketballs, 3 soccer balls, 3 tennis balls
**ELA**: Read about three winning athletes, write "three"
**Science**: Learn athletes need 3 meals, 3 water breaks
**Social Studies**: Discover 3 Olympic sports, 3 team rules

**End of Day**: "You mastered Counting to 3 like a champion athlete!"

Every single activity reinforced the SAME skill with the SAME career context.